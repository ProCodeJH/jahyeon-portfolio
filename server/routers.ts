import { z } from "zod";
import { initTRPC, TRPCError } from "@trpc/server";
import {
  getDb,
  getAllProjects, getProjectById, createProject, updateProject, deleteProject,
  getAllCertifications, getCertificationById, createCertification, updateCertification, deleteCertification,
  getAllResources, getResourceById, createResource, updateResource, deleteResource, incrementResourceDownload,
  getAllFolders, getFolderById, createFolder, updateFolder, deleteFolder,
  getSetting, upsertSetting, getAllSettings,
  getMemberByPhone, getMemberById, createMember, updateMember, updateMemberLastLogin,
  createSmsVerification, verifySmsCode,
  // Community CRUD
  getAllCommunityPosts, getCommunityPostById, createCommunityPost, updateCommunityPost, deleteCommunityPost, incrementPostViewCount,
  getCommentsByPostId, createCommunityComment, deleteCommunityComment, acceptCommentAsAnswer,
  toggleReaction,
  getClassNotesByMemberId, createClassNote, updateClassNote, deleteClassNote
} from "./db";
import { projects, certifications, resources, users, sessions, members } from "../drizzle/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ============================================
// 🔒 Category Enums (matches drizzle/schema.ts)
// ============================================
const projectCategoryEnum = z.enum(["c_lang", "arduino", "python", "embedded", "iot", "firmware", "hardware", "software"]);
const resourceCategoryEnum = z.enum(["presentation", "daily_life", "lecture_c", "lecture_arduino", "lecture_python", "lecture_materials", "arduino_projects", "c_projects", "python_projects"]);

const t = initTRPC.context<{ userId?: string }>().create();

// R2 Endpoint: R2_ENDPOINT 또는 R2_ACCOUNT_ID로 자동 구성
const R2_ENDPOINT = process.env.R2_ENDPOINT ||
  (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "");

const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

// R2 Bucket: R2_BUCKET 또는 R2_BUCKET_NAME 지원
const R2_BUCKET = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME || "portfolio-files";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(isAuthenticated);

async function uploadToR2(fileName: string, fileContent: Buffer, contentType: string): Promise<{ url: string; key: string }> {
  // Preserve UTF-8 characters (Korean, etc.) in filename - only replace path-unsafe characters
  const safeFileName = fileName.replace(/[\/\\:*?"<>|]/g, "_");
  const key = `uploads/${Date.now()}-${encodeURIComponent(safeFileName)}`;
  await s3Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    ContentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(safeFileName)}`
  }));
  return { url: `${R2_PUBLIC_URL}/${key}`, key };
}

async function deleteFromR2(key: string): Promise<void> {
  if (!key) return;
  try { await s3Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })); } catch (e) { console.error("R2 delete error:", e); }
}

export const appRouter = t.router({
  auth: t.router({
    login: publicProcedure.input(z.object({ password: z.string() })).mutation(async ({ input }) => {
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      if (input.password !== adminPassword) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid password" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      let [user] = await db.select().from(users).where(eq(users.openId, "admin")).limit(1);
      if (!user) { const [newUser] = await db.insert(users).values({ openId: "admin", name: "Admin", role: "admin" }).returning(); user = newUser; }
      await db.insert(sessions).values({ userId: user.id, token: sessionToken, expiresAt });
      return { token: sessionToken, expiresAt };
    }),
    logout: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(sessions).where(eq(sessions.userId, parseInt(ctx.userId)));
      return { success: true };
    }),
    verify: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { valid: false, userId: undefined };
      const [session] = await db.select().from(sessions).where(and(eq(sessions.token, input.token), gte(sessions.expiresAt, new Date()))).limit(1);
      return { valid: !!session, userId: session?.userId?.toString() };
    }),
    me: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const [user] = await db.select().from(users).where(eq(users.id, parseInt(ctx.userId))).limit(1);
      return user || null;
    }),
  }),

  upload: t.router({
    // 기존 방식 (10MB 이하)
    file: protectedProcedure.input(z.object({ fileName: z.string(), fileContent: z.string(), contentType: z.string() })).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileContent, "base64");
      return uploadToR2(input.fileName, buffer, input.contentType);
    }),

    // ============================================
    // 🚀 Presigned URL (2GB까지 지원 - Enterprise Grade)
    // ============================================
    getPresignedUrl: protectedProcedure.input(z.object({
      fileName: z.string(),
      contentType: z.string(),
      fileSize: z.number(),
    })).mutation(async ({ input }) => {
      const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB - Enterprise Grade
      if (input.fileSize > MAX_SIZE) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "File too large. Max 2GB allowed." });
      }

      // Preserve UTF-8 characters (Korean, etc.) in filename
      const safeFileName = input.fileName.replace(/[\/\\:*?"<>|]/g, "_");
      const key = `uploads/${Date.now()}-${encodeURIComponent(safeFileName)}`;

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: input.contentType,
        ContentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(safeFileName)}`
      });

      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      return {
        presignedUrl,
        key,
        publicUrl: `${R2_PUBLIC_URL}/${key}`,
      };
    }),

    // Stub for chunked uploads (client compatibility)
    uploadChunk: protectedProcedure.input(z.object({
      uploadId: z.string(),
      chunkIndex: z.number(),
      chunkData: z.string(),
    })).mutation(async () => {
      // Stub - chunked upload not implemented yet
      return { success: true };
    }),

    // Stub for PPT thumbnail generation
    getPPTThumbnail: protectedProcedure.input(z.object({
      fileUrl: z.string(),
    })).mutation(async () => {
      // Stub - PPT thumbnail generation not implemented yet
      return { thumbnailUrl: null };
    }),
  }),

  projects: t.router({
    list: publicProcedure.query(async () => getAllProjects()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const project = await getProjectById(input.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return project;
    }),
    create: protectedProcedure.input(z.object({
      title: z.string().min(1), description: z.string().optional().default(""), technologies: z.string().optional().default(""),
      category: projectCategoryEnum, imageUrl: z.string().optional().default(""), imageKey: z.string().optional().default(""),
      videoUrl: z.string().optional().default(""), videoKey: z.string().optional().default(""),
      thumbnailUrl: z.string().optional().default(""), thumbnailKey: z.string().optional().default(""),
      projectUrl: z.string().optional().default(""), githubUrl: z.string().optional().default(""),
    })).mutation(async ({ input }) => {
      try {
        const result = await createProject(input);
        console.log(`[Projects] Created: "${input.title}"`);
        return result;
      } catch (error) {
        console.error("[Projects] Create error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create project"
        });
      }
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(), title: z.string().min(1).optional(), description: z.string().optional(), technologies: z.string().optional(),
      category: projectCategoryEnum.optional(), imageUrl: z.string().optional(), imageKey: z.string().optional(),
      videoUrl: z.string().optional(), videoKey: z.string().optional(), thumbnailUrl: z.string().optional(), thumbnailKey: z.string().optional(),
      projectUrl: z.string().optional(), githubUrl: z.string().optional(),
    })).mutation(async ({ input }) => { const { id, ...data } = input; await updateProject(id, data); return { success: true }; }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const project = await getProjectById(input.id);
      if (project) { if (project.imageKey) await deleteFromR2(project.imageKey); if (project.videoKey) await deleteFromR2(project.videoKey); if (project.thumbnailKey) await deleteFromR2(project.thumbnailKey); }
      await deleteProject(input.id);
      return { success: true };
    }),
    incrementView: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(projects).set({ viewCount: sql`${projects.viewCount} + 1` }).where(eq(projects.id, input.id));
      return { success: true };
    }),
  }),

  certifications: t.router({
    list: publicProcedure.query(async () => getAllCertifications()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const cert = await getCertificationById(input.id);
      if (!cert) throw new TRPCError({ code: "NOT_FOUND" });
      return cert;
    }),
    create: protectedProcedure.input(z.object({
      title: z.string().min(1), issuer: z.string().min(1), issueDate: z.string(),
      expiryDate: z.string().optional().default(""), credentialId: z.string().optional().default(""),
      credentialUrl: z.string().optional().default(""), imageUrl: z.string().optional().default(""),
      imageKey: z.string().optional().default(""), description: z.string().optional().default(""),
    })).mutation(async ({ input }) => createCertification(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), title: z.string().min(1).optional(), issuer: z.string().optional(), issueDate: z.string().optional(),
      expiryDate: z.string().optional(), credentialId: z.string().optional(), credentialUrl: z.string().optional(),
      imageUrl: z.string().optional(), imageKey: z.string().optional(), description: z.string().optional(),
    })).mutation(async ({ input }) => { const { id, ...data } = input; await updateCertification(id, data); return { success: true }; }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const cert = await getCertificationById(input.id);
      if (cert?.imageKey) await deleteFromR2(cert.imageKey);
      await deleteCertification(input.id);
      return { success: true };
    }),
  }),

  resources: t.router({
    list: publicProcedure.query(async () => getAllResources()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const resource = await getResourceById(input.id);
      if (!resource) throw new TRPCError({ code: "NOT_FOUND" });
      return resource;
    }),
    create: protectedProcedure.input(z.object({
      title: z.string().min(1), description: z.string().optional().default(""), category: resourceCategoryEnum,
      subcategory: z.string().optional().default(""), fileUrl: z.string(), fileKey: z.string().optional().default(""),
      fileName: z.string().optional().default(""), fileSize: z.number().optional().default(0),
      mimeType: z.string().optional().default(""), thumbnailUrl: z.string().optional().default(""), thumbnailKey: z.string().optional().default(""),
    })).mutation(async ({ input }) => createResource(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), title: z.string().min(1).optional(), description: z.string().optional(), category: resourceCategoryEnum.optional(),
      subcategory: z.string().optional(), fileUrl: z.string().optional(), fileKey: z.string().optional(),
      fileName: z.string().optional(), fileSize: z.number().optional(), mimeType: z.string().optional(),
      thumbnailUrl: z.string().optional(), thumbnailKey: z.string().optional(),
    })).mutation(async ({ input }) => { const { id, ...data } = input; await updateResource(id, data); return { success: true }; }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const resource = await getResourceById(input.id);
      if (resource) { if (resource.fileKey) await deleteFromR2(resource.fileKey); if (resource.thumbnailKey) await deleteFromR2(resource.thumbnailKey); }
      await deleteResource(input.id);
      return { success: true };
    }),
    incrementDownload: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await incrementResourceDownload(input.id);
      return { success: true };
    }),
  }),

  analytics: t.router({
    track: publicProcedure.input(z.object({ page: z.string(), sessionId: z.string().optional(), referrer: z.string().optional(), userAgent: z.string().optional() })).mutation(async ({ input }) => {
      console.log("[Analytics]", input.page);
      return { success: true };
    }),
    adminStats: protectedProcedure.query(async () => {
      const projectsList = await getAllProjects();
      const resourcesList = await getAllResources();
      const certsList = await getAllCertifications();
      const totalViews = projectsList.reduce((sum, p) => sum + (p.viewCount || 0), 0);
      const totalDownloads = resourcesList.reduce((sum, r) => sum + (r.downloadCount || 0), 0);
      return { totalViews, todayViews: 0, uniqueVisitors: 0, totalDownloads, projectCount: projectsList.length, resourceCount: resourcesList.length, certCount: certsList.length, topProjects: projectsList.slice(0, 5), topResources: resourcesList.slice(0, 5) };
    }),
  }),

  folders: t.router({
    list: publicProcedure.query(async () => getAllFolders()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const folder = await getFolderById(input.id);
      if (!folder) throw new TRPCError({ code: "NOT_FOUND" });
      return folder;
    }),
    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      category: resourceCategoryEnum,
      parentId: z.number().optional(), // For nested folders
      description: z.string().optional().default(""),
    })).mutation(async ({ input }) => {
      try {
        // Check for duplicate folder in same category and parent
        const existingFolders = await getAllFolders();
        const duplicate = existingFolders.find(f =>
          f.name.toLowerCase() === input.name.toLowerCase() &&
          f.category === input.category &&
          f.parentId === (input.parentId ?? null)
        );

        if (duplicate) {
          // Return existing folder instead of throwing error
          console.log(`[Folders] Folder "${input.name}" already exists, returning existing`);
          return duplicate;
        }

        const newFolder = await createFolder({
          name: input.name,
          category: input.category,
          parentId: input.parentId ?? null,
          description: input.description,
        });
        console.log(`[Folders] Created new folder: "${input.name}" in ${input.category}${input.parentId ? ` (parent: ${input.parentId})` : ''}`);
        return newFolder;
      } catch (error) {
        console.error("[Folders] Create error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create folder"
        });
      }
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      parentId: z.number().nullable().optional(),
      category: resourceCategoryEnum.optional(), // Added for cross-category moves
      description: z.string().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateFolder(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteFolder(input.id);
      return { success: true };
    }),
    // Cleanup duplicate folders in the same category and parent
    cleanupDuplicates: protectedProcedure.mutation(async () => {
      const allFolders = await getAllFolders();
      const seen = new Map<string, number>();
      const duplicateIds: number[] = [];

      for (const folder of allFolders) {
        const key = `${folder.category}:${folder.parentId ?? 'null'}:${folder.name.toLowerCase()}`;
        if (seen.has(key)) {
          // This is a duplicate - mark for deletion
          duplicateIds.push(folder.id);
        } else {
          seen.set(key, folder.id);
        }
      }

      // Delete duplicate folders
      for (const id of duplicateIds) {
        await deleteFolder(id);
        console.log(`[Folders] Deleted duplicate folder id: ${id}`);
      }

      return {
        success: true,
        deletedCount: duplicateIds.length,
        message: `${duplicateIds.length}개의 중복 폴더가 삭제되었습니다`
      };
    }),
  }),

  // ============================================
  // 👍 Likes & Comments (Stub for client compatibility)
  // ============================================
  likes: t.router({
    get: publicProcedure.input(z.object({ resourceId: z.number() })).query(async () => {
      // Stub: returns empty state for now
      return { count: 0, userLiked: false };
    }),
    toggle: protectedProcedure.input(z.object({ resourceId: z.number() })).mutation(async () => {
      return { success: true, liked: false };
    }),
  }),

  // ============================================
  // ⚙️ Settings (YouTube URL, etc.)
  // ============================================
  settings: t.router({
    get: publicProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
      const setting = await getSetting(input.key);
      return setting?.value || null;
    }),
    list: publicProcedure.query(async () => {
      return getAllSettings();
    }),
    set: protectedProcedure.input(z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().optional(),
    })).mutation(async ({ input }) => {
      await upsertSetting(input.key, input.value, input.description);
      return { success: true };
    }),
  }),

  // ============================================
  // 👥 Members (Registration with SMS verification)
  // ============================================
  members: t.router({
    // Send SMS verification code
    sendSMS: publicProcedure.input(z.object({
      phone: z.string().min(10).max(15),
    })).mutation(async ({ input }) => {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Store verification code in DB
      await createSmsVerification(input.phone, code);

      // TODO: Integrate with actual SMS provider (NHN Cloud Toast, Aligo, etc.)
      // For now, we'll log the code for testing - REMOVE IN PRODUCTION!
      console.log(`📱 SMS Code for ${input.phone}: ${code}`);

      // In production, send SMS via API:
      // await sendSmsViaProvider(input.phone, `[코딩쏙학원] 인증번호: ${code}`);

      return { success: true, message: "인증번호가 발송되었습니다" };
    }),

    // Verify SMS code
    verifySMS: publicProcedure.input(z.object({
      phone: z.string(),
      code: z.string().length(6),
    })).mutation(async ({ input }) => {
      const isValid = await verifySmsCode(input.phone, input.code);
      if (!isValid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "인증번호가 일치하지 않거나 만료되었습니다" });
      }
      return { success: true, message: "인증이 완료되었습니다" };
    }),

    // Register new member
    register: publicProcedure.input(z.object({
      name: z.string().min(2).max(100),
      age: z.number().min(5).max(150),
      phone: z.string().min(10).max(15),
      password: z.string().min(6),
      academyName: z.string().optional(), // Actually the access code
    })).mutation(async ({ input }) => {
      // Check if phone already exists
      const existing = await getMemberByPhone(input.phone);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "이미 가입된 번호입니다" });
      }

      // Check access code from settings
      const accessCodeSetting = await getSetting("student_access_code");
      const validAccessCode = accessCodeSetting?.value || "코딩쏙2024"; // Default code
      const isValidStudent = input.academyName === validAccessCode;

      // Simple password hashing (use bcrypt in production)
      const passwordHash = Buffer.from(input.password).toString("base64");

      const member = await createMember({
        name: input.name,
        age: input.age,
        phone: input.phone,
        passwordHash,
        academyName: isValidStudent ? "코딩쏙학원" : null,
        phoneVerified: true,
        isStudent: isValidStudent, // Set based on access code
      });

      return {
        success: true,
        member: {
          id: member.id,
          name: member.name,
          isStudent: isValidStudent,
        },
      };
    }),

    // Login
    login: publicProcedure.input(z.object({
      phone: z.string(),
      password: z.string(),
    })).mutation(async ({ input }) => {
      const member = await getMemberByPhone(input.phone);
      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: "가입되지 않은 번호입니다" });
      }

      // Simple password check (use bcrypt in production)
      const passwordHash = Buffer.from(input.password).toString("base64");
      if (member.passwordHash !== passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "비밀번호가 일치하지 않습니다" });
      }

      // Update last login
      await updateMemberLastLogin(member.id);

      // Generate session token (simple for now - use JWT in production)
      const token = `member_${member.id}_${Date.now()}`;

      return {
        success: true,
        token,
        member: {
          id: member.id,
          name: member.name,
          isStudent: member.isStudent,
          academyName: member.academyName,
        },
      };
    }),

    // Get current member info
    me: publicProcedure.input(z.object({
      memberId: z.number(),
    })).query(async ({ input }) => {
      const member = await getMemberById(input.memberId);
      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: "회원 정보를 찾을 수 없습니다" });
      }
      return {
        id: member.id,
        name: member.name,
        age: member.age,
        phone: member.phone,
        academyName: member.academyName,
        isStudent: member.isStudent,
        createdAt: member.createdAt,
      };
    }),

    // Update profile (academy name)
    updateProfile: publicProcedure.input(z.object({
      memberId: z.number(),
      academyName: z.string().optional(),
    })).mutation(async ({ input }) => {
      const updated = await updateMember(input.memberId, {
        academyName: input.academyName || null,
      });
      return {
        success: true,
        isStudent: updated?.isStudent,
        message: updated?.isStudent
          ? "🎉 코딩쏙학원 학생으로 인증되었습니다! 수업자료를 다운로드할 수 있습니다."
          : "프로필이 업데이트되었습니다.",
      };
    }),
  }),

  comments: t.router({
    list: publicProcedure.input(z.object({ resourceId: z.number() })).query(async () => {
      return [];
    }),
    create: protectedProcedure.input(z.object({ resourceId: z.number(), content: z.string() })).mutation(async () => {
      return { success: true, id: 0 };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async () => {
      return { success: true };
    }),
  }),

  // ============================================
  // 💬 Community System - Posts, Comments, Reactions, Class Notes
  // ============================================
  community: t.router({
    // --- Posts ---
    posts: t.router({
      list: publicProcedure.input(z.object({
        category: z.string().optional(),
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
      })).query(async ({ input }) => {
        const posts = await getAllCommunityPosts(input.category, input.limit, input.offset);
        return posts;
      }),

      get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        const post = await getCommunityPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "게시글을 찾을 수 없습니다" });
        return post;
      }),

      create: publicProcedure.input(z.object({
        memberId: z.number(),
        title: z.string().min(1),
        content: z.string().min(1),
        category: z.enum(["question", "free", "homework", "study", "notice", "gallery"]),
        tags: z.array(z.string()).optional().default([]),
        images: z.array(z.string()).optional().default([]),
        isAnonymous: z.boolean().optional().default(false),
      })).mutation(async ({ input }) => {
        const post = await createCommunityPost({
          memberId: input.memberId,
          title: input.title,
          content: input.content,
          category: input.category,
          tags: JSON.stringify(input.tags),
          isAnonymous: input.isAnonymous,
        });
        console.log(`[Community] New post: "${input.title}" by member ${input.memberId}`);
        return {
          success: true,
          id: post.id,
          message: "게시글이 작성되었습니다",
        };
      }),

      update: publicProcedure.input(z.object({
        id: z.number(),
        memberId: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })).mutation(async ({ input }) => {
        const post = await getCommunityPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        if (post.memberId !== input.memberId) throw new TRPCError({ code: "FORBIDDEN", message: "권한이 없습니다" });

        await updateCommunityPost(input.id, {
          title: input.title,
          content: input.content,
          tags: input.tags ? JSON.stringify(input.tags) : undefined,
        });
        return { success: true };
      }),

      delete: publicProcedure.input(z.object({
        id: z.number(),
        memberId: z.number(),
      })).mutation(async ({ input }) => {
        const post = await getCommunityPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        if (post.memberId !== input.memberId) throw new TRPCError({ code: "FORBIDDEN", message: "권한이 없습니다" });

        await deleteCommunityPost(input.id);
        return { success: true };
      }),

      incrementView: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await incrementPostViewCount(input.id);
        return { success: true };
      }),

      like: publicProcedure.input(z.object({
        postId: z.number(),
        memberId: z.number(),
      })).mutation(async ({ input }) => {
        const result = await toggleReaction("post", input.postId, input.memberId, "👍");
        return { success: true, liked: result.liked };
      }),

      unlike: publicProcedure.input(z.object({
        postId: z.number(),
        memberId: z.number(),
      })).mutation(async ({ input }) => {
        await toggleReaction("post", input.postId, input.memberId, "👍");
        return { success: true };
      }),
    }),

    // --- Comments ---
    comments: t.router({
      list: publicProcedure.input(z.object({ postId: z.number() })).query(async ({ input }) => {
        const comments = await getCommentsByPostId(input.postId);
        return comments;
      }),

      create: publicProcedure.input(z.object({
        postId: z.number(),
        memberId: z.number(),
        content: z.string().min(1),
        parentId: z.number().optional(),
        isAnonymous: z.boolean().optional().default(false),
      })).mutation(async ({ input }) => {
        const comment = await createCommunityComment({
          postId: input.postId,
          memberId: input.memberId,
          content: input.content,
          parentId: input.parentId,
          isAnonymous: input.isAnonymous,
        });
        return { success: true, id: comment.id };
      }),

      delete: publicProcedure.input(z.object({
        id: z.number(),
        memberId: z.number(),
      })).mutation(async ({ input }) => {
        await deleteCommunityComment(input.id);
        return { success: true };
      }),

      accept: publicProcedure.input(z.object({
        commentId: z.number(),
        postId: z.number(),
        memberId: z.number(),
      })).mutation(async ({ input }) => {
        const post = await getCommunityPostById(input.postId);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        if (post.memberId !== input.memberId) throw new TRPCError({ code: "FORBIDDEN", message: "작성자만 채택할 수 있습니다" });

        await acceptCommentAsAnswer(input.commentId, input.postId);
        return { success: true };
      }),

      like: publicProcedure.input(z.object({
        commentId: z.number(),
        memberId: z.number(),
      })).mutation(async ({ input }) => {
        const result = await toggleReaction("comment", input.commentId, input.memberId, "👍");
        return { success: true, liked: result.liked };
      }),
    }),

    // --- Class Notes (수업 메모) ---
    classNotes: t.router({
      list: publicProcedure.input(z.object({ memberId: z.number() })).query(async ({ input }) => {
        const notes = await getClassNotesByMemberId(input.memberId);
        return notes;
      }),

      create: publicProcedure.input(z.object({
        memberId: z.number(),
        title: z.string().optional().default("수업 메모"),
        blocks: z.string().min(1), // JSON string of note content
      })).mutation(async ({ input }) => {
        const note = await createClassNote({
          memberId: input.memberId,
          title: input.title,
          blocks: input.blocks,
        });
        return {
          success: true,
          id: note.id,
          createdAt: note.createdAt.toISOString(),
        };
      }),

      update: publicProcedure.input(z.object({
        id: z.number(),
        memberId: z.number(),
        blocks: z.string(),
      })).mutation(async ({ input }) => {
        await updateClassNote(input.id, input.blocks);
        return { success: true };
      }),

      delete: publicProcedure.input(z.object({
        id: z.number(),
        memberId: z.number(),
      })).mutation(async ({ input }) => {
        await deleteClassNote(input.id);
        return { success: true };
      }),
    }),

    // --- Image Upload for Posts ---
    uploadImage: publicProcedure.input(z.object({
      memberId: z.number(),
      fileName: z.string(),
      fileContent: z.string(),
      contentType: z.string(),
    })).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileContent, "base64");
      const result = await uploadToR2(input.fileName, buffer, input.contentType);
      return result;
    }),
  }),
});

export type AppRouter = typeof appRouter;

