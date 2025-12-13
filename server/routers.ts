import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import * as db from "./db";

// Declare global type for upload chunks
declare global {
  var uploadChunks: Map<string, {
    chunks: (Buffer | null)[];
    receivedCount: number;
    totalChunks: number;
    fileName: string;
    contentType: string;
  }> | undefined;
}

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // File upload
  upload: router({
    uploadChunk: publicProcedure
      .input(z.object({
        fileName: z.string(),
        fileContent: z.string(), // base64 chunk
        chunkIndex: z.number(),
        totalChunks: z.number(),
        uploadId: z.string().optional(),
        contentType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import('./storage');
        
        // Generate upload ID for first chunk
        const uploadId = input.uploadId || nanoid();
        
        // Store chunks in memory (in production, use Redis or disk storage)
        if (!global.uploadChunks) {
          global.uploadChunks = new Map();
        }
        
        const uploadKey = uploadId;
        
        // Initialize upload session if not exists
        if (!global.uploadChunks.has(uploadKey)) {
          // null로 채워진 배열 생성 (빈 슬롯 대신)
          const chunks: (Buffer | null)[] = [];
          for (let i = 0; i < input.totalChunks; i++) {
            chunks.push(null);
          }
          
          global.uploadChunks.set(uploadKey, {
            chunks,
            receivedCount: 0,
            totalChunks: input.totalChunks,
            fileName: input.fileName,
            contentType: input.contentType,
          });
        }
        
        const uploadData = global.uploadChunks.get(uploadKey);
        if (!uploadData) {
          throw new Error('Upload session not found');
        }
        
        // 유효한 청크 인덱스인지 확인
        if (input.chunkIndex < 0 || input.chunkIndex >= uploadData.totalChunks) {
          throw new Error(`Invalid chunk index: ${input.chunkIndex}`);
        }
        
        // 이미 받은 청크가 아닌 경우에만 카운트 증가
        if (uploadData.chunks[input.chunkIndex] === null) {
          uploadData.receivedCount++;
        }
        
        // 청크 데이터 저장
        const buffer = Buffer.from(input.fileContent, 'base64');
        uploadData.chunks[input.chunkIndex] = buffer;
        
        console.log(`Chunk ${input.chunkIndex + 1}/${uploadData.totalChunks} received for ${uploadData.fileName} (${uploadData.receivedCount}/${uploadData.totalChunks})`);
        
        // Check if all chunks have been received
        const allChunksReceived = uploadData.receivedCount >= uploadData.totalChunks;
        
        if (allChunksReceived) {
          // 모든 청크가 null이 아닌지 확인
          const hasAllChunks = uploadData.chunks.every((chunk): chunk is Buffer => chunk !== null);
          
          if (!hasAllChunks) {
            throw new Error('Some chunks are missing');
          }
          
          // Combine all chunks
          const combinedBuffer = Buffer.concat(uploadData.chunks as Buffer[]);
          
          console.log(`All chunks received. Combined size: ${combinedBuffer.length} bytes`);
          
          // Upload the combined file
          const fileExtension = uploadData.fileName.includes('.') 
            ? uploadData.fileName.split('.').pop() 
            : 'bin';
          const finalFileKey = `uploads/${uploadId}-${Date.now()}.${fileExtension}`;
          
          const result = await storagePut(finalFileKey, combinedBuffer, uploadData.contentType);
          
          console.log(`File uploaded successfully: ${result.url}`);
          
          // Clean up
          global.uploadChunks.delete(uploadKey);
          
          return {
            uploadId,
            fileKey: finalFileKey,
            publicUrl: result.url,
            complete: true,
          };
        }
        
        return {
          uploadId,
          fileKey: '',
          publicUrl: '',
          complete: false,
        };
      }),
    file: publicProcedure
      .input(z.object({
        fileName: z.string(),
        fileContent: z.string(), // base64
        contentType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileContent, 'base64');
        const fileKey = `uploads/${nanoid()}-${input.fileName}`;
        const result = await storagePut(fileKey, buffer, input.contentType);
        return result;
      }),
  }),

  // Projects
  projects: router({
    list: publicProcedure.query(async () => {
      return await db.getAllProjects();
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProjectById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        technologies: z.string(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        projectUrl: z.string().optional(),
        githubUrl: z.string().optional(),
        category: z.enum(["embedded", "iot", "firmware", "hardware", "software"]),
        featured: z.number().default(0),
        displayOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        return await db.createProject(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          technologies: z.string().optional(),
          imageUrl: z.string().optional(),
          imageKey: z.string().optional(),
          projectUrl: z.string().optional(),
          githubUrl: z.string().optional(),
          category: z.enum(["embedded", "iot", "firmware", "hardware", "software"]).optional(),
          featured: z.number().optional(),
          displayOrder: z.number().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateProject(input.id, input.data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProject(input.id);
        return { success: true };
      }),
  }),

  // Certifications
  certifications: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCertifications();
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCertificationById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        issuer: z.string(),
        issueDate: z.string(),
        expiryDate: z.string().optional(),
        credentialId: z.string().optional(),
        credentialUrl: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        description: z.string().optional(),
        displayOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        return await db.createCertification(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          issuer: z.string().optional(),
          issueDate: z.string().optional(),
          expiryDate: z.string().optional(),
          credentialId: z.string().optional(),
          credentialUrl: z.string().optional(),
          imageUrl: z.string().optional(),
          imageKey: z.string().optional(),
          description: z.string().optional(),
          displayOrder: z.number().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateCertification(input.id, input.data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCertification(input.id);
        return { success: true };
      }),
  }),

  // Resources
  resources: router({
    list: publicProcedure.query(async () => {
      return await db.getAllResources();
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getResourceById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        fileUrl: z.string(),
        fileKey: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        category: z.enum(["daily_life", "lecture_materials", "arduino_projects", "c_projects", "python_projects"]),
        subcategory: z.enum(["code", "documentation", "images"]).optional(),
        thumbnailUrl: z.string().optional(),
        thumbnailKey: z.string().optional(),
        displayOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        return await db.createResource(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          fileUrl: z.string().optional(),
          fileKey: z.string().optional(),
          fileName: z.string().optional(),
          fileSize: z.number().optional(),
          mimeType: z.string().optional(),
          category: z.enum(["daily_life", "lecture_materials", "arduino_projects", "c_projects", "python_projects"]).optional(),
          thumbnailUrl: z.string().optional(),
          thumbnailKey: z.string().optional(),
          displayOrder: z.number().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateResource(input.id, input.data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteResource(input.id);
        return { success: true };
      }),
    incrementDownload: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementResourceDownload(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
