import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  InsertUser, users,
  projects, InsertProject,
  certifications, InsertCertification,
  resources, InsertResource,
  folders, InsertFolder,
  settings, InsertSetting,
  members, InsertMember,
  smsVerifications, InsertSmsVerification
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

  // Filter out undefined values to prevent DB issues
  const cleanData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(folder)) {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  }

  // Only update if there are actual changes
  if (Object.keys(cleanData).length === 0) {
    console.log(`[Folders] No changes to update for folder id: ${id}`);
    return;
  }

  cleanData.updatedAt = new Date();

  try {
    await db.update(folders).set(cleanData).where(eq(folders.id, id));
    console.log(`[Folders] Updated folder id: ${id} with:`, cleanData);
  } catch (error) {
    console.error(`[Folders] Failed to update folder id: ${id}`, error);
    throw error;
  }
}

export async function deleteFolder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.delete(folders).where(eq(folders.id, id));
    console.log(`[Folders] Deleted folder id: ${id}`);
  } catch (error) {
    console.error(`[Folders] Failed to delete folder id: ${id}`, error);
    throw error;
  }
}

// Settings queries
export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(settings);
}

export async function upsertSetting(key: string, value: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getSetting(key);
  if (existing) {
    await db.update(settings)
      .set({ value, description, updatedAt: new Date() })
      .where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value, description });
  }
  return getSetting(key);
}

export async function deleteSetting(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(settings).where(eq(settings.key, key));
}

// Get access code for student verification
export async function getAccessCode(): Promise<string> {
  const setting = await getSetting('access_code');
  return setting?.value || '코딩쏙학원'; // Default fallback
}

// Members queries
export async function getMemberByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(members).where(eq(members.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMemberById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMember(data: InsertMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get dynamic access code from settings
  const accessCode = await getAccessCode();
  const isStudent = data.academyName === accessCode;

  const result = await db.insert(members).values({
    ...data,
    isStudent,
  }).returning();
  return result[0];
}

export async function updateMember(id: number, data: Partial<InsertMember>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // If academyName is being updated, recalculate isStudent with dynamic code
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (data.academyName !== undefined) {
    const accessCode = await getAccessCode();
    updateData.isStudent = data.academyName === accessCode;
  }

  await db.update(members).set(updateData).where(eq(members.id, id));
  return getMemberById(id);
}

export async function updateMemberLastLogin(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(members).set({ lastLoginAt: new Date() }).where(eq(members.id, id));
}

// SMS Verification queries
export async function createSmsVerification(phone: string, code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete any existing unverified codes for this phone
  await db.delete(smsVerifications).where(eq(smsVerifications.phone, phone));

  // Create new verification with 5 minute expiry
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await db.insert(smsVerifications).values({ phone, code, expiresAt });
}

export async function verifySmsCode(phone: string, code: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(smsVerifications)
    .where(eq(smsVerifications.phone, phone))
    .limit(1);

  if (result.length === 0) return false;

  const verification = result[0];

  // Check if expired
  if (new Date() > verification.expiresAt) {
    await db.delete(smsVerifications).where(eq(smsVerifications.id, verification.id));
    return false;
  }

  // Check if code matches
  if (verification.code !== code) return false;

  // Mark as verified and delete
  await db.delete(smsVerifications).where(eq(smsVerifications.id, verification.id));
  return true;
}

// ==================== COMMUNITY POSTS ====================

import {
  communityPosts, InsertCommunityPost,
  communityComments, InsertCommunityComment,
  reactions, InsertReaction,
  notes, InsertNote
} from "../drizzle/schema";

export async function getAllCommunityPosts(category?: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt));

  // TODO: Add category filter when needed
  return query.limit(limit).offset(offset);
}

export async function getCommunityPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(communityPosts).where(eq(communityPosts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCommunityPost(post: InsertCommunityPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(communityPosts).values(post).returning();
  return result[0];
}

export async function updateCommunityPost(id: number, post: Partial<InsertCommunityPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(communityPosts).set({ ...post, updatedAt: new Date() }).where(eq(communityPosts.id, id));
  return getCommunityPostById(id);
}

export async function deleteCommunityPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete related comments first
  await db.delete(communityComments).where(eq(communityComments.postId, id));
  // Delete reactions
  await db.delete(reactions).where(eq(reactions.targetId, id));
  // Delete post
  await db.delete(communityPosts).where(eq(communityPosts.id, id));
}

export async function incrementPostViewCount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const post = await getCommunityPostById(id);
  if (post) {
    await db.update(communityPosts)
      .set({ viewCount: post.viewCount + 1 })
      .where(eq(communityPosts.id, id));
  }
}

// ==================== COMMUNITY COMMENTS ====================

export async function getCommentsByPostId(postId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(communityComments)
    .where(eq(communityComments.postId, postId))
    .orderBy(communityComments.createdAt);
}

export async function createCommunityComment(comment: InsertCommunityComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(communityComments).values(comment).returning();
  return result[0];
}

export async function deleteCommunityComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(communityComments).where(eq(communityComments.id, id));
}

export async function acceptCommentAsAnswer(commentId: number, postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Mark comment as accepted
  await db.update(communityComments)
    .set({ isAccepted: true })
    .where(eq(communityComments.id, commentId));

  // Update post with accepted answer
  await db.update(communityPosts)
    .set({ acceptedAnswerId: commentId })
    .where(eq(communityPosts.id, postId));
}

// ==================== REACTIONS (Likes) ====================

export async function getReactionsByTarget(targetType: string, targetId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reactions)
    .where(eq(reactions.targetId, targetId));
}

export async function toggleReaction(targetType: string, targetId: number, memberId: number, emoji: string = '👍') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if reaction exists
  const existing = await db.select().from(reactions)
    .where(eq(reactions.targetId, targetId))
    .limit(1);

  if (existing.length > 0 && existing[0].memberId === memberId) {
    // Remove reaction
    await db.delete(reactions).where(eq(reactions.id, existing[0].id));
    return { liked: false };
  } else {
    // Add reaction
    await db.insert(reactions).values({
      targetType,
      targetId,
      memberId,
      emoji,
    });
    return { liked: true };
  }
}

// ==================== CLASS NOTES ====================

export async function getClassNotesByMemberId(memberId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notes)
    .where(eq(notes.memberId, memberId))
    .orderBy(desc(notes.createdAt));
}

export async function createClassNote(note: InsertNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notes).values(note).returning();
  return result[0];
}

export async function updateClassNote(id: number, blocks: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notes)
    .set({ blocks, updatedAt: new Date() })
    .where(eq(notes.id, id));
}

export async function deleteClassNote(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(notes).where(eq(notes.id, id));
}

