import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  InsertUser, users,
  projects, InsertProject,
  certifications, InsertCertification,
  resources, InsertResource,
  folders, InsertFolder
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    
    if (existing.length > 0) {
      // Update existing user
      const updateSet: Record<string, unknown> = {};
      
      if (user.name !== undefined) updateSet.name = user.name;
      if (user.email !== undefined) updateSet.email = user.email;
      if (user.loginMethod !== undefined) updateSet.loginMethod = user.loginMethod;
      if (user.lastSignedIn !== undefined) updateSet.lastSignedIn = user.lastSignedIn;
      if (user.role !== undefined) updateSet.role = user.role;
      
      updateSet.updatedAt = new Date();
      
      if (Object.keys(updateSet).length > 0) {
        await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
      }
    } else {
      // Insert new user
      const values: InsertUser = {
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        role: user.role ?? "user",
        lastSignedIn: user.lastSignedIn ?? new Date(),
      };
      
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Projects queries
export async function getAllProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(desc(projects.displayOrder), desc(projects.createdAt));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(project).returning();
  return result[0];
}

export async function updateProject(id: number, project: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set({ ...project, updatedAt: new Date() }).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(projects).where(eq(projects.id, id));
}

// Certifications queries
export async function getAllCertifications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certifications).orderBy(desc(certifications.displayOrder), desc(certifications.createdAt));
}

export async function getCertificationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(certifications).where(eq(certifications.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCertification(cert: InsertCertification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(certifications).values(cert).returning();
  return result[0];
}

export async function updateCertification(id: number, cert: Partial<InsertCertification>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(certifications).set({ ...cert, updatedAt: new Date() }).where(eq(certifications.id, id));
}

export async function deleteCertification(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(certifications).where(eq(certifications.id, id));
}

// Resources queries
export async function getAllResources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).orderBy(desc(resources.displayOrder), desc(resources.createdAt));
}

export async function getResourceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createResource(resource: InsertResource) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(resources).values(resource).returning();
  return result[0];
}

export async function updateResource(id: number, resource: Partial<InsertResource>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(resources).set({ ...resource, updatedAt: new Date() }).where(eq(resources.id, id));
}

export async function deleteResource(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(resources).where(eq(resources.id, id));
}

export async function incrementResourceDownload(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const resource = await getResourceById(id);
  if (resource) {
    await db.update(resources)
      .set({ downloadCount: resource.downloadCount + 1 })
      .where(eq(resources.id, id));
  }
}

// Folders queries
export async function getAllFolders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(folders).orderBy(desc(folders.displayOrder), desc(folders.createdAt));
}

export async function getFolderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(folders).where(eq(folders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createFolder(folder: InsertFolder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(folders).values(folder).returning();
  return result[0];
}

export async function updateFolder(id: number, folder: Partial<InsertFolder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(folders).set({ ...folder, updatedAt: new Date() }).where(eq(folders.id, id));
}

export async function deleteFolder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(folders).where(eq(folders.id, id));
}
