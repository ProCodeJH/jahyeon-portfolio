import { pgTable, pgEnum, serial, text, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const categoryEnum = pgEnum("category", ["c_lang", "arduino", "python", "embedded", "iot", "firmware", "hardware", "software"]);
export const resourceCategoryEnum = pgEnum("resource_category", ["daily_life", "lecture_c", "lecture_arduino", "lecture_python", "presentation", "lecture_materials", "arduino_projects", "c_projects", "python_projects"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Sessions table - for authentication
 */
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Projects table - stores portfolio projects
 */
export const projects = pgTable("projects", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Certifications table - stores professional certifications
 */
export const certifications = pgTable("certifications", {
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

export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = typeof certifications.$inferInsert;

/**
 * Resources table - stores downloadable files and videos
 */
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileKey: text("file_key"),
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size").default(0).notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  category: resourceCategoryEnum("category").notNull(),
  subcategory: varchar("subcategory", { length: 255 }), // Folder name (e.g., "Arduino", "Chapter 1-5")
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  downloadCount: integer("download_count").default(0).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

/**
 * Folders table - stores folder structure for resources
 * Supports nested folders via parentId
 */
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: resourceCategoryEnum("category").notNull(),
  parentId: integer("parent_id"), // Reference to parent folder for nesting
  description: text("description"),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = typeof folders.$inferInsert;

/**
 * Settings table - stores site configuration (YouTube URL, etc.)
 */
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

/**
 * Members table - stores registered users with phone verification
 * is_student = true when academy_name === "코딩쏙학원"
 */
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  age: integer("age").notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  academyName: varchar("academy_name", { length: 100 }),
  isStudent: boolean("is_student").default(false).notNull(), // true if academyName === "코딩쏙학원"
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export type Member = typeof members.$inferSelect;
export type InsertMember = typeof members.$inferInsert;

/**
 * SMS Verifications table - stores temporary verification codes
 */
export const smsVerifications = pgTable("sms_verifications", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SmsVerification = typeof smsVerifications.$inferSelect;
export type InsertSmsVerification = typeof smsVerifications.$inferInsert;

// ==================== COMMUNITY SYSTEM ====================

// Post categories enum
export const postCategoryEnum = pgEnum("post_category", [
  "question", "free", "homework", "study", "notice", "gallery"
]);

/**
 * Community Posts - Discord/Slack style discussions
 * blocks: 노션 스타일 블록 에디터 콘텐츠 (JSON)
 * content: 기존 마크다운 콘텐츠 (하위 호환성)
 */
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(), // Markdown content (legacy)
  blocks: text("blocks"), // JSON - 노션 블록 에디터 콘텐츠
  category: postCategoryEnum("category").notNull(),
  tags: text("tags"), // JSON array of tags
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  acceptedAnswerId: integer("accepted_answer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

/**
 * Community Comments - threaded replies
 */
export const communityComments = pgTable("community_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => communityPosts.id),
  parentId: integer("parent_id"), // For threaded replies
  memberId: integer("member_id").notNull().references(() => members.id),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  isAccepted: boolean("is_accepted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = typeof communityComments.$inferInsert;

/**
 * Reactions - emoji reactions like Slack
 */
export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  targetType: varchar("target_type", { length: 20 }).notNull(), // 'post' or 'comment'
  targetId: integer("target_id").notNull(),
  memberId: integer("member_id").notNull().references(() => members.id),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = typeof reactions.$inferInsert;

// ==================== NOTES SYSTEM ====================

/**
 * Note Folders - organize notes
 */
export const noteFolders = pgTable("note_folders", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  name: varchar("name", { length: 100 }).notNull(),
  parentId: integer("parent_id"),
  icon: varchar("icon", { length: 10 }),
  color: varchar("color", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NoteFolder = typeof noteFolders.$inferSelect;
export type InsertNoteFolder = typeof noteFolders.$inferInsert;

/**
 * Notes - Notion-style block-based notes
 */
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  title: varchar("title", { length: 255 }).notNull(),
  blocks: text("blocks"), // JSON array of blocks
  folderId: integer("folder_id").references(() => noteFolders.id),
  isPublic: boolean("is_public").default(false).notNull(),
  shareToken: varchar("share_token", { length: 64 }),
  viewCount: integer("view_count").default(0).notNull(),
  templateId: integer("template_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

/**
 * Note Templates - reusable note structures
 */
export const noteTemplates = pgTable("note_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  blocks: text("blocks").notNull(), // JSON array of blocks
  category: varchar("category", { length: 50 }),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NoteTemplate = typeof noteTemplates.$inferSelect;
export type InsertNoteTemplate = typeof noteTemplates.$inferInsert;

// ==================== GAMIFICATION ====================

/**
 * Member Profiles - XP, levels, badges
 */
export const memberProfiles = pgTable("member_profiles", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().unique().references(() => members.id),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  badges: text("badges"), // JSON array of badge IDs
  streak: integer("streak").default(0).notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MemberProfile = typeof memberProfiles.$inferSelect;
export type InsertMemberProfile = typeof memberProfiles.$inferInsert;
