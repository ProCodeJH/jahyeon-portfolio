import { z } from "zod";
import { initTRPC, TRPCError } from "@trpc/server";
import { 
  getDb,
  getAllProjects, getProjectById, createProject, updateProject, deleteProject,
  getAllCertifications, getCertificationById, createCertification, updateCertification, deleteCertification,
  getAllResources, getResourceById, createResource, updateResource, deleteResource, incrementResourceDownload
} from "./db";
import { projects, certifications, resources, users, sessions } from "../drizzle/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const t = initTRPC.context<{ userId?: string }>().create();

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const R2_BUCKET = process.env.R2_BUCKET || "portfolio-files";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(isAuthenticated);

async function uploadToR2(fileName: string, fileContent: Buffer, contentType: string): Promise<{ url: string; key: string }> {
  const key = `uploads/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  await s3Client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: fileContent, ContentType: contentType }));
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
  }),

  upload: t.router({
    file: protectedProcedure.input(z.object({ fileName: z.string(), fileContent: z.string(), contentType: z.string() })).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileContent, "base64");
      return uploadToR2(input.fileName, buffer, input.contentType);
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
      category: z.string(), imageUrl: z.string().optional().default(""), imageKey: z.string().optional().default(""),
      videoUrl: z.string().optional().default(""), videoKey: z.string().optional().default(""),
      thumbnailUrl: z.string().optional().default(""), thumbnailKey: z.string().optional().default(""),
      projectUrl: z.string().optional().default(""), githubUrl: z.string().optional().default(""),
    })).mutation(async ({ input }) => createProject(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), title: z.string().min(1).optional(), description: z.string().optional(), technologies: z.string().optional(),
      category: z.string().optional(), imageUrl: z.string().optional(), imageKey: z.string().optional(),
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
      title: z.string().min(1), description: z.string().optional().default(""), category: z.string(),
      subcategory: z.string().optional().default(""), fileUrl: z.string(), fileKey: z.string().optional().default(""),
      fileName: z.string().optional().default(""), fileSize: z.number().optional().default(0),
      mimeType: z.string().optional().default(""), thumbnailUrl: z.string().optional().default(""), thumbnailKey: z.string().optional().default(""),
    })).mutation(async ({ input }) => createResource(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), title: z.string().min(1).optional(), description: z.string().optional(), category: z.string().optional(),
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
});

export type AppRouter = typeof appRouter;
