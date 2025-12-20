var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/_core/sentry.ts
var sentry_exports = {};
__export(sentry_exports, {
  captureException: () => captureException2,
  initSentry: () => initSentry
});
import * as Sentry from "@sentry/node";
function initSentry() {
  try {
    const dsn = process.env.SENTRY_DSN;
    if (!dsn) return;
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      release: process.env.COMMIT_SHA || void 0
    });
  } catch (e) {
    console.warn("Sentry init failed (server)", e);
  }
}
var captureException2;
var init_sentry = __esm({
  "server/_core/sentry.ts"() {
    "use strict";
    captureException2 = (err, ctx) => {
      try {
        Sentry.captureException(err, { extra: ctx });
      } catch (e) {
      }
    };
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;

// server/db.ts
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// drizzle/schema.ts
import { pgTable, pgEnum, serial, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";
var roleEnum = pgEnum("role", ["user", "admin"]);
var categoryEnum = pgEnum("category", ["c_lang", "arduino", "python", "embedded", "iot", "firmware", "hardware", "software"]);
var resourceCategoryEnum = pgEnum("resource_category", ["daily_life", "lecture_c", "lecture_arduino", "lecture_python", "presentation", "lecture_materials", "arduino_projects", "c_projects", "python_projects"]);
var subcategoryEnum = pgEnum("subcategory", ["code", "documentation", "images"]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull()
});
var sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var projects = pgTable("projects", {
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
  category: categoryEnum("category").notNull(),
  featured: integer("featured").default(0).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var certifications = pgTable("certifications", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileKey: text("file_key"),
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size").default(0).notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  category: resourceCategoryEnum("category").notNull(),
  subcategory: subcategoryEnum("subcategory"),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  downloadCount: integer("download_count").default(0).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// server/_core/logger.ts
var DEFAULT_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");
var logger = {
  debug: (...args) => {
    if (DEFAULT_LEVEL === "debug") console.debug("[server]", ...args);
  },
  info: (...args) => {
    if (DEFAULT_LEVEL === "debug" || DEFAULT_LEVEL === "info") console.info("[server]", ...args);
  },
  warn: (...args) => {
    console.warn("[server]", ...args);
  },
  error: (...args) => {
    console.error("[server]", ...args);
  }
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sql2 = neon(process.env.DATABASE_URL);
      _db = drizzle(sql2);
    } catch (error) {
      logger.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    logger.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    if (existing.length > 0) {
      const updateSet = {};
      if (user.name !== void 0) updateSet.name = user.name;
      if (user.email !== void 0) updateSet.email = user.email;
      if (user.loginMethod !== void 0) updateSet.loginMethod = user.loginMethod;
      if (user.lastSignedIn !== void 0) updateSet.lastSignedIn = user.lastSignedIn;
      if (user.role !== void 0) updateSet.role = user.role;
      updateSet.updatedAt = /* @__PURE__ */ new Date();
      if (Object.keys(updateSet).length > 0) {
        await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
      }
    } else {
      const values = {
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        role: user.role ?? "user",
        lastSignedIn: user.lastSignedIn ?? /* @__PURE__ */ new Date()
      };
      await db.insert(users).values(values);
    }
  } catch (error) {
    logger.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    logger.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(desc(projects.displayOrder), desc(projects.createdAt));
}
async function getProjectById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createProject(project) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(project).returning();
  return result[0];
}
async function updateProject(id, project) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set({ ...project, updatedAt: /* @__PURE__ */ new Date() }).where(eq(projects.id, id));
}
async function deleteProject(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(projects).where(eq(projects.id, id));
}
async function getAllCertifications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certifications).orderBy(desc(certifications.displayOrder), desc(certifications.createdAt));
}
async function getCertificationById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(certifications).where(eq(certifications.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createCertification(cert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(certifications).values(cert).returning();
  return result[0];
}
async function updateCertification(id, cert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(certifications).set({ ...cert, updatedAt: /* @__PURE__ */ new Date() }).where(eq(certifications.id, id));
}
async function deleteCertification(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(certifications).where(eq(certifications.id, id));
}
async function getAllResources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).orderBy(desc(resources.displayOrder), desc(resources.createdAt));
}
async function getResourceById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createResource(resource) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(resources).values(resource).returning();
  return result[0];
}
async function updateResource(id, resource) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(resources).set({ ...resource, updatedAt: /* @__PURE__ */ new Date() }).where(eq(resources.id, id));
}
async function deleteResource(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(resources).where(eq(resources.id, id));
}
async function incrementResourceDownload(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const resource = await getResourceById(id);
  if (resource) {
    await db.update(resources).set({ downloadCount: resource.downloadCount + 1 }).where(eq(resources.id, id));
  }
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var SDKServer = class {
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      logger.warn("[Auth] Missing session cookie");
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = process.env.JWT_SECRET || "default-secret-change-in-production";
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a user
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: "jahyeon-portfolio",
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      logger.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId)) {
        logger.warn("[Auth] Session payload missing openId");
        return null;
      }
      return {
        openId,
        appId: appId || "jahyeon-portfolio",
        name: name || ""
      };
    } catch (error) {
      logger.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const user = await getUserByOpenId(sessionUserId);
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: /* @__PURE__ */ new Date()
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
var ADMIN_OPEN_ID = "admin-user-vercel";
function registerOAuthRoutes(app) {
  app.get("/api/auth/login", (req, res) => {
    const error = req.query.error;
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 40px;
            width: 100%;
            max-width: 400px;
            border: 1px solid rgba(255,255,255,0.1);
          }
          h1 { 
            color: #fff;
            text-align: center;
            margin-bottom: 30px;
            font-size: 24px;
          }
          .error {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.5);
            color: #fca5a5;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
          }
          label {
            display: block;
            color: #94a3b8;
            margin-bottom: 8px;
            font-size: 14px;
          }
          input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            background: rgba(255,255,255,0.05);
            color: #fff;
            font-size: 16px;
            margin-bottom: 20px;
          }
          input:focus {
            outline: none;
            border-color: #3b82f6;
          }
          button {
            width: 100%;
            padding: 14px;
            background: #3b82f6;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          }
          button:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>\u{1F510} Admin Login</h1>
          ${error ? '<div class="error">Invalid password</div>' : ""}
          <form method="POST" action="/api/auth/login">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter admin password" required autofocus>
            <button type="submit">Login</button>
          </form>
        </div>
      </body>
      </html>
    `);
  });
  app.post("/api/auth/login", async (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      logger.error("[Auth] ADMIN_PASSWORD not set");
      res.status(500).json({ error: "Server configuration error" });
      return;
    }
    if (password !== adminPassword) {
      res.redirect("/api/auth/login?error=invalid");
      return;
    }
    try {
      await upsertUser({
        openId: ADMIN_OPEN_ID,
        name: "Admin",
        email: "admin@portfolio.local",
        loginMethod: "password",
        lastSignedIn: /* @__PURE__ */ new Date(),
        role: "admin"
      });
      const sessionToken = await sdk.createSessionToken(ADMIN_OPEN_ID, {
        name: "Admin",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      logger.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app.get("/api/auth/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.redirect(302, "/");
  });
  app.get("/api/auth/status", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ authenticated: true, user: { name: user.name, role: user.role } });
    } catch {
      res.json({ authenticated: false });
    }
  });
}

// server/routers.ts
import { z } from "zod";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq as eq2, sql, and, gte } from "drizzle-orm";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
var t = initTRPC.context().create();
var s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || ""
  }
});
var R2_BUCKET = process.env.R2_BUCKET || "portfolio-files";
var R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";
var isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
var publicProcedure = t.procedure;
var protectedProcedure = t.procedure.use(isAuthenticated);
async function uploadToR2(fileName, fileContent, contentType) {
  const key = `uploads/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  await s3Client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: fileContent, ContentType: contentType }));
  return { url: `${R2_PUBLIC_URL}/${key}`, key };
}
async function deleteFromR2(key) {
  if (!key) return;
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch (e) {
    logger.error("R2 delete error:", e);
  }
}
var appRouter = t.router({
  auth: t.router({
    login: publicProcedure.input(z.object({ password: z.string() })).mutation(async ({ input }) => {
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      if (input.password !== adminPassword) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid password" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      let [user] = await db.select().from(users).where(eq2(users.openId, "admin")).limit(1);
      if (!user) {
        const [newUser] = await db.insert(users).values({ openId: "admin", name: "Admin", role: "admin" }).returning();
        user = newUser;
      }
      await db.insert(sessions).values({ userId: user.id, token: sessionToken, expiresAt });
      return { token: sessionToken, expiresAt };
    }),
    logout: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(sessions).where(eq2(sessions.userId, parseInt(ctx.userId)));
      return { success: true };
    }),
    verify: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { valid: false, userId: void 0 };
      const [session] = await db.select().from(sessions).where(and(eq2(sessions.token, input.token), gte(sessions.expiresAt, /* @__PURE__ */ new Date()))).limit(1);
      return { valid: !!session, userId: session?.userId?.toString() };
    })
  }),
  upload: t.router({
    file: protectedProcedure.input(z.object({ fileName: z.string(), fileContent: z.string(), contentType: z.string() })).mutation(async ({ input }) => {
      const MAX_UPLOAD_MB = parseInt(process.env.MAX_UPLOAD_MB || "500", 10);
      const base64Length = input.fileContent.length;
      const fileBytes = Math.floor(base64Length * 3 / 4);
      if (fileBytes > MAX_UPLOAD_MB * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `File too large. Maximum allowed is ${MAX_UPLOAD_MB}MB.` });
      }
      const buffer = Buffer.from(input.fileContent, "base64");
      try {
        return await uploadToR2(input.fileName, buffer, input.contentType);
      } catch (e) {
        try {
          (await Promise.resolve().then(() => (init_sentry(), sentry_exports))).captureException(e, { fileName: input.fileName });
        } catch (_) {
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Upload failed" });
      }
    }),
    getPresignedUrl: protectedProcedure.input(z.object({ fileName: z.string(), contentType: z.string(), fileSizeBytes: z.number().optional() })).mutation(async ({ input }) => {
      const MAX_UPLOAD_MB = parseInt(process.env.MAX_UPLOAD_MB || "500", 10);
      if (input.fileSizeBytes && input.fileSizeBytes > MAX_UPLOAD_MB * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `File too large. Maximum allowed is ${MAX_UPLOAD_MB}MB.` });
      }
      try {
        const key = `uploads/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const cmd = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: input.contentType });
        const url = await getSignedUrl(s3Client, cmd, { expiresIn: 60 * 15 });
        return { url, key, publicUrl: `${R2_PUBLIC_URL}/${key}` };
      } catch (e) {
        try {
          (await Promise.resolve().then(() => (init_sentry(), sentry_exports))).captureException(e, { fileName: input.fileName });
        } catch (_) {
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create presigned URL" });
      }
    })
  }),
  projects: t.router({
    list: publicProcedure.query(async () => getAllProjects()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const project = await getProjectById(input.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return project;
    }),
    create: protectedProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional().default(""),
      technologies: z.string().optional().default(""),
      category: z.enum(["c_lang", "arduino", "python", "embedded", "iot", "firmware", "hardware", "software"]),
      imageUrl: z.string().optional().default(""),
      imageKey: z.string().optional().default(""),
      videoUrl: z.string().optional().default(""),
      videoKey: z.string().optional().default(""),
      thumbnailUrl: z.string().optional().default(""),
      thumbnailKey: z.string().optional().default(""),
      projectUrl: z.string().optional().default(""),
      githubUrl: z.string().optional().default("")
    })).mutation(async ({ input }) => createProject(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      technologies: z.string().optional(),
      category: z.enum(["c_lang", "arduino", "python", "embedded", "iot", "firmware", "hardware", "software"]).optional(),
      imageUrl: z.string().optional(),
      imageKey: z.string().optional(),
      videoUrl: z.string().optional(),
      videoKey: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      thumbnailKey: z.string().optional(),
      projectUrl: z.string().optional(),
      githubUrl: z.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateProject(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const project = await getProjectById(input.id);
      if (project) {
        if (project.imageKey) await deleteFromR2(project.imageKey);
        if (project.videoKey) await deleteFromR2(project.videoKey);
        if (project.thumbnailKey) await deleteFromR2(project.thumbnailKey);
      }
      await deleteProject(input.id);
      return { success: true };
    }),
    incrementView: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(projects).set({ viewCount: sql`${projects.viewCount} + 1` }).where(eq2(projects.id, input.id));
      return { success: true };
    })
  }),
  certifications: t.router({
    list: publicProcedure.query(async () => getAllCertifications()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const cert = await getCertificationById(input.id);
      if (!cert) throw new TRPCError({ code: "NOT_FOUND" });
      return cert;
    }),
    create: protectedProcedure.input(z.object({
      title: z.string().min(1),
      issuer: z.string().min(1),
      issueDate: z.string(),
      expiryDate: z.string().optional().default(""),
      credentialId: z.string().optional().default(""),
      credentialUrl: z.string().optional().default(""),
      imageUrl: z.string().optional().default(""),
      imageKey: z.string().optional().default(""),
      description: z.string().optional().default("")
    })).mutation(async ({ input }) => createCertification(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      issuer: z.string().optional(),
      issueDate: z.string().optional(),
      expiryDate: z.string().optional(),
      credentialId: z.string().optional(),
      credentialUrl: z.string().optional(),
      imageUrl: z.string().optional(),
      imageKey: z.string().optional(),
      description: z.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateCertification(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const cert = await getCertificationById(input.id);
      if (cert?.imageKey) await deleteFromR2(cert.imageKey);
      await deleteCertification(input.id);
      return { success: true };
    })
  }),
  resources: t.router({
    list: publicProcedure.query(async () => getAllResources()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const resource = await getResourceById(input.id);
      if (!resource) throw new TRPCError({ code: "NOT_FOUND" });
      return resource;
    }),
    create: protectedProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional().default(""),
      category: z.enum(["daily_life", "lecture_c", "lecture_arduino", "lecture_python", "presentation", "lecture_materials", "arduino_projects", "c_projects", "python_projects"]),
      subcategory: z.enum(["code", "documentation", "images"]).optional().nullable().default(null),
      fileUrl: z.string(),
      fileKey: z.string().optional().default(""),
      fileName: z.string().optional().default(""),
      fileSize: z.number().optional().default(0),
      mimeType: z.string().optional().default(""),
      thumbnailUrl: z.string().optional().default(""),
      thumbnailKey: z.string().optional().default("")
    })).mutation(async ({ input }) => createResource(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      category: z.enum(["daily_life", "lecture_c", "lecture_arduino", "lecture_python", "presentation", "lecture_materials", "arduino_projects", "c_projects", "python_projects"]).optional(),
      subcategory: z.enum(["code", "documentation", "images"]).optional().nullable(),
      fileUrl: z.string().optional(),
      fileKey: z.string().optional(),
      fileName: z.string().optional(),
      fileSize: z.number().optional(),
      mimeType: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      thumbnailKey: z.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateResource(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const resource = await getResourceById(input.id);
      if (resource) {
        if (resource.fileKey) await deleteFromR2(resource.fileKey);
        if (resource.thumbnailKey) await deleteFromR2(resource.thumbnailKey);
      }
      await deleteResource(input.id);
      return { success: true };
    }),
    incrementDownload: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await incrementResourceDownload(input.id);
      return { success: true };
    })
  }),
  analytics: t.router({
    track: publicProcedure.input(z.object({ page: z.string(), sessionId: z.string().optional(), referrer: z.string().optional(), userAgent: z.string().optional() })).mutation(async ({ input }) => {
      logger.info(`[Analytics] ${input.page}`);
      return { success: true };
    }),
    adminStats: protectedProcedure.query(async () => {
      const projectsList = await getAllProjects();
      const resourcesList = await getAllResources();
      const certsList = await getAllCertifications();
      const totalViews = projectsList.reduce((sum, p) => sum + (p.viewCount || 0), 0);
      const totalDownloads = resourcesList.reduce((sum, r) => sum + (r.downloadCount || 0), 0);
      return { totalViews, todayViews: 0, uniqueVisitors: 0, totalDownloads, projectCount: projectsList.length, resourceCount: resourcesList.length, certCount: certsList.length, topProjects: projectsList.slice(0, 5), topResources: resourcesList.slice(0, 5) };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  root: "./client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared")
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    logger.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
init_sentry();
initSentry();
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "500mb" }));
  app.use(express2.urlencoded({ limit: "500mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    logger.warn(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(logger.error);
