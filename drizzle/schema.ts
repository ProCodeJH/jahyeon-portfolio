import { pgTable, pgEnum, serial, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const categoryEnum = pgEnum("category", ["embedded", "iot", "firmware", "hardware", "software"]);
export const resourceCategoryEnum = pgEnum("resource_category", ["daily_life", "lecture_materials", "arduino_projects", "c_projects", "python_projects"]);
export const subcategoryEnum = pgEnum("subcategory", ["code", "documentation", "images"]);

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
 * Projects table - stores portfolio projects
 */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  technologies: text("technologies").notNull(), // JSON array of tech stack
  imageUrl: text("image_url"),
  imageKey: text("image_key"),
  projectUrl: varchar("project_url", { length: 512 }),
  githubUrl: varchar("github_url", { length: 512 }),
  category: categoryEnum("category").notNull(),
  featured: integer("featured").default(0).notNull(), // 0 or 1 for boolean
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
  issueDate: varchar("issue_date", { length: 50 }).notNull(), // YYYY-MM format
  expiryDate: varchar("expiry_date", { length: 50 }), // YYYY-MM format, nullable
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
 * Resources table - stores downloadable files and videos (up to 500MB)
 */
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileKey: text("file_key").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  category: resourceCategoryEnum("category").notNull(),
  subcategory: subcategoryEnum("subcategory"), // only for project categories
  thumbnailUrl: text("thumbnail_url"), // for video thumbnails
  thumbnailKey: text("thumbnail_key"),
  downloadCount: integer("download_count").default(0).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;
