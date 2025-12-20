import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { pgTable, pgEnum, serial, text, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { eq, desc, sql, and } from "drizzle-orm";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ============ SCHEMA ============
const roleEnum = pgEnum("role", ["user", "admin"]);
const projectCategoryEnum = pgEnum("project_category", ["c_lang", "arduino", "python"]);
const resourceCategoryEnum = pgEnum("resource_category", ["daily_life", "lecture_c", "lecture_arduino", "lecture_python"]);
const subcategoryEnum = pgEnum("subcategory", ["code", "documentation", "images", "ppt", "video"]);

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  technologies: text("technologies").notNull(),
  imageUrl: text("image_url"),
  imageKey: text("image_key"),
  videoUrl: text("video_url"),
  videoKey: text("video_key"),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  projectUrl: varchar("project_url", { length: 512 }),
  githubUrl: varchar("github_url", { length: 512 }),
  category: projectCategoryEnum("category").notNull(),
  featured: integer("featured").default(0).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  issuer: varchar("issuer", { length: 255 }).notNull(),
  issueDate: varchar("issue_date", { length: 50 }).notNull(),
  expiryDate: varchar("expiry_date", { length: 50 }),
  credentialId: varchar("credential_id", { length: 255 }),
  credentialUrl: varchar("credential_url", { length: 512 }),
  imageUrl: text("image_url"),
  imageKey: text("image_key"),
  description: text("description"),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileKey: text("file_key").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  category: resourceCategoryEnum("category").notNull(),
  subcategory: subcategoryEnum("subcategory"),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  downloadCount: integer("download_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull(),
  visitorId: varchar("visitor_id", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull(),
  authorName: varchar("author_name", { length: 100 }).notNull(),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  pagePath: varchar("page_path", { length: 255 }).notNull(),
  visitorId: varchar("visitor_id", { length: 64 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  country: varchar("country", { length: 2 }),
  city: varchar("city", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ DATABASE ============
function getDb() {
  if (!process.env.DATABASE_URL) return null;
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql);
}

// ============ STORAGE (R2) ============
function getS3Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
  });
}

async function uploadToR2(key: string, body: Buffer, contentType: string) {
  const client = getS3Client();
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  return { url: `${process.env.R2_PUBLIC_URL}/${key}`, key };
}

async function deleteFromR2(key: string) {
  const client = getS3Client();
  await client.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  }));
}

// ============ AUTH HELPERS ============
function isAuthenticated(req: VercelRequest): boolean {
  const cookie = req.cookies?.session;
  return cookie === "admin";
}

function getVisitorId(req: VercelRequest): string {
  const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  const str = `${ip}-${ua}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// ============ UPLOAD CHUNKS STORAGE ============
const uploadChunks = new Map<string, {
  chunks: (Buffer | null)[];
  receivedCount: number;
  totalChunks: number;
  fileName: string;
  contentType: string;
}>();

// ============ MAIN HANDLER ============
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = req.url || "";
  const method = req.method || "GET";

  try {
    // ============ AUTH ROUTES ============
    
    if (url.includes("/api/auth/login") && method === "GET") {
      const error = req.query.error as string | undefined;
      res.setHeader("Content-Type", "text/html");
      return res.send(`<!DOCTYPE html>
<html><head><title>Admin Login</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.container{background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border-radius:24px;padding:48px;width:100%;max-width:420px;border:1px solid rgba(255,255,255,0.08);box-shadow:0 25px 50px -12px rgba(0,0,0,0.5)}h1{color:#f8fafc;text-align:center;margin-bottom:8px;font-size:28px;font-weight:700}p{color:#94a3b8;text-align:center;margin-bottom:32px;font-size:14px}.error{background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#fca5a5;padding:14px;border-radius:12px;margin-bottom:24px;text-align:center;font-size:14px}label{display:block;color:#cbd5e1;margin-bottom:8px;font-size:14px;font-weight:500}input{width:100%;padding:14px 16px;border:1px solid rgba(255,255,255,0.1);border-radius:12px;background:rgba(255,255,255,0.05);color:#f8fafc;font-size:16px;margin-bottom:24px;transition:all 0.2s}input:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.2)}button{width:100%;padding:16px;background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s}button:hover{transform:translateY(-1px);box-shadow:0 10px 20px -10px rgba(59,130,246,0.5)}</style>
</head><body><div class="container"><h1>Admin</h1><p>Portfolio Management System</p>${error ? '<div class="error">Invalid password. Please try again.</div>' : ''}<form method="POST" action="/api/auth/login"><label>Password</label><input type="password" name="password" required autofocus placeholder="Enter admin password"><button type="submit">Sign In</button></form></div></body></html>`);
    }

    if (url.includes("/api/auth/login") && method === "POST") {
      const body = req.body;
      const password = body?.password;
      
      if (password === process.env.ADMIN_PASSWORD) {
        res.setHeader("Set-Cookie", `session=admin; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
        return res.redirect(302, "/admin");
      }
      return res.redirect(302, "/api/auth/login?error=1");
    }

    if (url.includes("/api/auth/logout")) {
      res.setHeader("Set-Cookie", `session=; Path=/; HttpOnly; Max-Age=0`);
      return res.redirect(302, "/");
    }

    if (url.includes("/api/auth/status")) {
      return res.json({ authenticated: isAuthenticated(req) });
    }

    // ============ tRPC-like API ROUTES ============
    
    if (url.includes("/api/trpc/")) {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const trpcPath = url.split("/api/trpc/")[1]?.split("?")[0];
      const inputParam = req.query.input as string | undefined;
      let input: any = {};
      
      try {
        if (inputParam) {
          input = JSON.parse(decodeURIComponent(inputParam));
        } else if (req.body) {
          input = req.body.input || req.body;
        }
      } catch (e) {
        input = {};
      }
      
      const protectedPrefixes = ["create", "update", "delete", "admin"];
      const isProtected = protectedPrefixes.some(r => trpcPath?.includes(r));
      
      if (isProtected && !isAuthenticated(req)) {
        return res.status(401).json({ error: { message: "Please login (10001)" } });
      }

      switch (trpcPath) {
        // ============ AUTH ============
        case "auth.me": {
          if (isAuthenticated(req)) {
            return res.json({ result: { data: { openId: "admin", name: "Admin", role: "admin" } } });
          }
          return res.json({ result: { data: null } });
        }
        
        case "auth.logout": {
          res.setHeader("Set-Cookie", `session=; Path=/; HttpOnly; Max-Age=0`);
          return res.json({ result: { data: { success: true } } });
        }

        // ============ PROJECTS ============
        case "projects.list": {
          const data = await db.select().from(projects).orderBy(desc(projects.displayOrder), desc(projects.createdAt));
          return res.json({ result: { data } });
        }
        
        case "projects.listByCategory": {
          const data = await db.select().from(projects)
            .where(eq(projects.category, input.category))
            .orderBy(desc(projects.displayOrder), desc(projects.createdAt));
          return res.json({ result: { data } });
        }
        
        case "projects.get": {
          const result = await db.select().from(projects).where(eq(projects.id, input.id)).limit(1);
          if (result[0]) {
            await db.update(projects).set({ viewCount: sql`${projects.viewCount} + 1` }).where(eq(projects.id, input.id));
          }
          return res.json({ result: { data: result[0] || null } });
        }
        
        case "projects.create": {
          const result = await db.insert(projects).values({
            title: input.title,
            description: input.description,
            technologies: input.technologies,
            imageUrl: input.imageUrl || null,
            imageKey: input.imageKey || null,
            videoUrl: input.videoUrl || null,
            videoKey: input.videoKey || null,
            thumbnailUrl: input.thumbnailUrl || null,
            thumbnailKey: input.thumbnailKey || null,
            projectUrl: input.projectUrl || null,
            githubUrl: input.githubUrl || null,
            category: input.category,
            featured: input.featured || 0,
            displayOrder: input.displayOrder || 0,
          }).returning();
          return res.json({ result: { data: result[0] } });
        }
        
        case "projects.update": {
          const updateData = { ...input.data, updatedAt: new Date() };
          await db.update(projects).set(updateData).where(eq(projects.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }
        
        case "projects.delete": {
          const project = await db.select().from(projects).where(eq(projects.id, input.id)).limit(1);
          if (project[0]) {
            if (project[0].imageKey) await deleteFromR2(project[0].imageKey).catch(() => {});
            if (project[0].videoKey) await deleteFromR2(project[0].videoKey).catch(() => {});
            if (project[0].thumbnailKey) await deleteFromR2(project[0].thumbnailKey).catch(() => {});
          }
          await db.delete(projects).where(eq(projects.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }

        // ============ CERTIFICATIONS ============
        case "certifications.list": {
          const data = await db.select().from(certifications).orderBy(desc(certifications.displayOrder), desc(certifications.createdAt));
          return res.json({ result: { data } });
        }
        
        case "certifications.get": {
          const result = await db.select().from(certifications).where(eq(certifications.id, input.id)).limit(1);
          return res.json({ result: { data: result[0] || null } });
        }
        
        case "certifications.create": {
          const result = await db.insert(certifications).values({
            title: input.title,
            issuer: input.issuer,
            issueDate: input.issueDate,
            expiryDate: input.expiryDate || null,
            credentialId: input.credentialId || null,
            credentialUrl: input.credentialUrl || null,
            imageUrl: input.imageUrl || null,
            imageKey: input.imageKey || null,
            description: input.description || null,
            displayOrder: input.displayOrder || 0,
          }).returning();
          return res.json({ result: { data: result[0] } });
        }
        
        case "certifications.update": {
          const updateData = { ...input.data, updatedAt: new Date() };
          await db.update(certifications).set(updateData).where(eq(certifications.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }
        
        case "certifications.delete": {
          const cert = await db.select().from(certifications).where(eq(certifications.id, input.id)).limit(1);
          if (cert[0]?.imageKey) {
            await deleteFromR2(cert[0].imageKey).catch(() => {});
          }
          await db.delete(certifications).where(eq(certifications.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }

        // ============ RESOURCES ============
        case "resources.list": {
          const data = await db.select().from(resources).orderBy(desc(resources.displayOrder), desc(resources.createdAt));
          return res.json({ result: { data } });
        }
        
        case "resources.listByCategory": {
          const data = await db.select().from(resources)
            .where(eq(resources.category, input.category))
            .orderBy(desc(resources.displayOrder), desc(resources.createdAt));
          return res.json({ result: { data } });
        }
        
        case "resources.get": {
          const result = await db.select().from(resources).where(eq(resources.id, input.id)).limit(1);
          return res.json({ result: { data: result[0] || null } });
        }
        
        case "resources.create": {
          const result = await db.insert(resources).values({
            title: input.title,
            description: input.description || null,
            fileUrl: input.fileUrl,
            fileKey: input.fileKey,
            fileName: input.fileName,
            fileSize: input.fileSize,
            mimeType: input.mimeType,
            category: input.category,
            subcategory: input.subcategory || null,
            thumbnailUrl: input.thumbnailUrl || null,
            thumbnailKey: input.thumbnailKey || null,
            displayOrder: input.displayOrder || 0,
          }).returning();
          return res.json({ result: { data: result[0] } });
        }
        
        case "resources.update": {
          const updateData = { ...input.data, updatedAt: new Date() };
          await db.update(resources).set(updateData).where(eq(resources.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }
        
        case "resources.delete": {
          const resource = await db.select().from(resources).where(eq(resources.id, input.id)).limit(1);
          if (resource[0]) {
            if (resource[0].fileKey) await deleteFromR2(resource[0].fileKey).catch(() => {});
            if (resource[0].thumbnailKey) await deleteFromR2(resource[0].thumbnailKey).catch(() => {});
          }
          await db.delete(resources).where(eq(resources.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }
        
        case "resources.incrementDownload": {
          await db.update(resources).set({ 
            downloadCount: sql`${resources.downloadCount} + 1` 
          }).where(eq(resources.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }

        // ============ LIKES ============
        case "likes.toggle": {
          const visitorId = getVisitorId(req);
          const existing = await db.select().from(likes)
            .where(and(eq(likes.resourceId, input.resourceId), eq(likes.visitorId, visitorId)))
            .limit(1);
          
          if (existing[0]) {
            await db.delete(likes).where(eq(likes.id, existing[0].id));
            await db.update(resources).set({ likeCount: sql`${resources.likeCount} - 1` }).where(eq(resources.id, input.resourceId));
            return res.json({ result: { data: { liked: false } } });
          } else {
            await db.insert(likes).values({ resourceId: input.resourceId, visitorId });
            await db.update(resources).set({ likeCount: sql`${resources.likeCount} + 1` }).where(eq(resources.id, input.resourceId));
            return res.json({ result: { data: { liked: true } } });
          }
        }
        
        case "likes.check": {
          const visitorId = getVisitorId(req);
          const existing = await db.select().from(likes)
            .where(and(eq(likes.resourceId, input.resourceId), eq(likes.visitorId, visitorId)))
            .limit(1);
          return res.json({ result: { data: { liked: !!existing[0] } } });
        }

        // ============ COMMENTS ============
        case "comments.list": {
          const data = await db.select().from(comments)
            .where(and(eq(comments.resourceId, input.resourceId), eq(comments.isApproved, true)))
            .orderBy(desc(comments.createdAt));
          return res.json({ result: { data } });
        }
        
        case "comments.create": {
          const result = await db.insert(comments).values({
            resourceId: input.resourceId,
            authorName: input.authorName,
            content: input.content,
            isApproved: true,
          }).returning();
          return res.json({ result: { data: result[0] } });
        }
        
        case "comments.delete": {
          await db.delete(comments).where(eq(comments.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }

        // ============ PAGE VIEWS / ANALYTICS ============
        case "analytics.track": {
          const visitorId = getVisitorId(req);
          await db.insert(pageViews).values({
            pagePath: input.path || "/",
            visitorId,
            ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || null,
            userAgent: req.headers["user-agent"] || null,
            referrer: req.headers["referer"] || null,
          });
          return res.json({ result: { data: { success: true } } });
        }
        
        case "analytics.adminStats": {
          const totalViews = await db.select({ count: sql<number>`count(*)` }).from(pageViews);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayViews = await db.select({ count: sql<number>`count(*)` }).from(pageViews)
            .where(sql`${pageViews.createdAt} >= ${today}`);
          
          const uniqueVisitors = await db.select({ count: sql<number>`count(distinct ${pageViews.visitorId})` }).from(pageViews);
          
          const viewsByPage = await db.select({
            path: pageViews.pagePath,
            count: sql<number>`count(*)`,
          }).from(pageViews)
            .groupBy(pageViews.pagePath)
            .orderBy(sql`count(*) desc`)
            .limit(10);
          
          const recentViews = await db.select().from(pageViews)
            .orderBy(desc(pageViews.createdAt))
            .limit(50);
          
          return res.json({ result: { data: {
            totalViews: totalViews[0]?.count || 0,
            todayViews: todayViews[0]?.count || 0,
            uniqueVisitors: uniqueVisitors[0]?.count || 0,
            viewsByPage,
            recentViews,
          } } });
        }

        // ============ UPLOAD ============
        case "upload.file": {
          const { fileName, fileContent, contentType } = input;
          const buffer = Buffer.from(fileContent, "base64");
          const key = `uploads/${Date.now()}-${fileName}`;
          const result = await uploadToR2(key, buffer, contentType);
          return res.json({ result: { data: { url: result.url, key: result.key } } });
        }

        case "upload.getPresignedUrl": {
          const { fileName, contentType, fileSize } = input;
          const MAX_SIZE = 500 * 1024 * 1024; // 500MB

          if (fileSize > MAX_SIZE) {
            return res.status(400).json({
              error: { message: "File too large. Max 500MB allowed." }
            });
          }

          const key = `uploads/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
          const client = getS3Client();

          const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
          });

          const presignedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
          const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

          return res.json({ result: { data: {
            presignedUrl,
            key,
            publicUrl
          } } });
        }

        case "upload.uploadChunk": {
          const { fileName, fileContent, chunkIndex, totalChunks, uploadId: existingUploadId, contentType } = input;
          
          const uploadId = existingUploadId || `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          
          if (!uploadChunks.has(uploadId)) {
            uploadChunks.set(uploadId, {
              chunks: new Array(totalChunks).fill(null),
              receivedCount: 0,
              totalChunks,
              fileName,
              contentType,
            });
          }
          
          const upload = uploadChunks.get(uploadId)!;
          const chunkBuffer = Buffer.from(fileContent, "base64");
          
          if (upload.chunks[chunkIndex] === null) {
            upload.chunks[chunkIndex] = chunkBuffer;
            upload.receivedCount++;
          }
          
          if (upload.receivedCount === upload.totalChunks) {
            const completeBuffer = Buffer.concat(upload.chunks.filter((c): c is Buffer => c !== null));
            const key = `uploads/${Date.now()}-${upload.fileName}`;
            const result = await uploadToR2(key, completeBuffer, upload.contentType);
            
            uploadChunks.delete(uploadId);
            
            return res.json({ result: { data: {
              uploadId,
              chunkIndex,
              complete: true,
              publicUrl: result.url,
              fileKey: result.key,
            } } });
          }
          
          return res.json({ result: { data: {
            uploadId,
            chunkIndex,
            complete: false,
            received: upload.receivedCount,
            total: upload.totalChunks,
          } } });
        }

        case "upload.delete": {
          await deleteFromR2(input.key);
          return res.json({ result: { data: { success: true } } });
        }

        case "upload.getPPTThumbnail": {
          const { pptUrl } = input;
          try {
            console.log("🎯 PPT 썸네일 요청:", pptUrl);
            const thumbnailUrl = `https://view.officeapps.live.com/op/thumbnail.aspx?src=${encodeURIComponent(pptUrl)}`;
            console.log("📡 Office API URL:", thumbnailUrl);

            // 서버에서 썸네일 가져오기 (CORS 우회)
            const response = await fetch(thumbnailUrl);
            console.log("📊 Office API 응답:", response.status, response.statusText);

            if (!response.ok) {
              console.warn("⚠️ Office API 실패:", response.status, response.statusText);
              return res.json({ result: { data: { success: false, thumbnail: null } } });
            }

            const buffer = await response.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            console.log("✅ PPT 썸네일 생성 성공 (크기:", buffer.byteLength, "bytes)");

            return res.json({ result: { data: { success: true, thumbnail: base64 } } });
          } catch (error) {
            console.error("❌ PPT thumbnail fetch error:", error);
            return res.json({ result: { data: { success: false, thumbnail: null } } });
          }
        }

        // ============ SYSTEM ============
        case "system.health": {
          return res.json({ result: { data: { status: "ok", timestamp: new Date().toISOString() } } });
        }

        default:
          return res.status(404).json({ error: { message: `Unknown procedure: ${trpcPath}` } });
      }
    }

    return res.status(404).json({ error: "Not found" });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      error: { 
        message: error instanceof Error ? error.message : "Internal server error" 
      } 
    });
  }
}
