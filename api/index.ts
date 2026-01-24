import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { pgTable, pgEnum, serial, text, timestamp, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
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
  subcategory: varchar("subcategory", { length: 255 }),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  downloadCount: integer("download_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  parentId: integer("parent_id"), // For nested folders
  description: text("description"),
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

const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  age: integer("age").notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  academyName: varchar("academy_name", { length: 100 }),
  isStudent: boolean("is_student").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Community Posts category enum
const communityPostCategoryEnum = pgEnum("community_post_category", ["question", "free", "homework", "study", "notice", "gallery"]);

const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  tags: text("tags"), // JSON string array
  images: text("images"), // JSON string array of URLs
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const communityComments = pgTable("community_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  memberId: integer("member_id").notNull(),
  parentId: integer("parent_id"), // For nested replies (null = top-level comment)
  content: text("content").notNull(),
  isAccepted: boolean("is_accepted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const communityLikes = pgTable("community_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  memberId: integer("member_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const commentLikes = pgTable("comment_likes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  memberId: integer("member_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const communityBookmarks = pgTable("community_bookmarks", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  memberId: integer("member_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const classNotes = pgTable("class_notes", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"), // Rich text content (HTML or Markdown)
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ SNS PHASE 1: MEMBER PROFILES ============
const memberProfiles = pgTable("member_profiles", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(), // References members(id)
  username: varchar("username", { length: 30 }),
  displayName: varchar("display_name", { length: 50 }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  avatarKey: text("avatar_key"),
  coverImageUrl: text("cover_image_url"),
  coverImageKey: text("cover_image_key"),
  website: varchar("website", { length: 255 }),
  location: varchar("location", { length: 100 }),
  birthday: varchar("birthday", { length: 20 }),
  isVerified: boolean("is_verified").default(false),
  isPrivate: boolean("is_private").default(false),
  followerCount: integer("follower_count").default(0),
  followingCount: integer("following_count").default(0),
  postCount: integer("post_count").default(0),
  totalLikes: integer("total_likes").default(0),
  level: integer("level").default(1),
  experiencePoints: integer("experience_points").default(0),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  // Privacy
  whoCanDm: varchar("who_can_dm", { length: 20 }).default("everyone"),
  whoCanMention: varchar("who_can_mention", { length: 20 }).default("everyone"),
  showActivityStatus: boolean("show_activity_status").default(true),
  showReadReceipts: boolean("show_read_receipts").default(true),
  // Notifications
  notifyLikes: boolean("notify_likes").default(true),
  notifyComments: boolean("notify_comments").default(true),
  notifyFollows: boolean("notify_follows").default(true),
  notifyMentions: boolean("notify_mentions").default(true),
  notifyDms: boolean("notify_dms").default(true),
  emailDigest: varchar("email_digest", { length: 20 }).default("weekly"),
  // Display
  theme: varchar("theme", { length: 20 }).default("dark"),
  language: varchar("language", { length: 10 }).default("ko"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ SNS PHASE 2: SOCIAL GRAPH ============
const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  followingId: integer("following_id").notNull(),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const blocks = pgTable("blocks", {
  id: serial("id").primaryKey(),
  blockerId: integer("blocker_id").notNull(),
  blockedId: integer("blocked_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const mutes = pgTable("mutes", {
  id: serial("id").primaryKey(),
  muterId: integer("muter_id").notNull(),
  mutedId: integer("muted_id").notNull(),
  mutePosts: boolean("mute_posts").default(true),
  muteStories: boolean("mute_stories").default(true),
  muteNotifications: boolean("mute_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const closeFriends = pgTable("close_friends", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  friendId: integer("friend_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ SNS PHASE 3: ENHANCED POSTS ============
const hashtags = pgTable("hashtags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  postCount: integer("post_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const postHashtags = pgTable("post_hashtags", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  hashtagId: integer("hashtag_id").notNull(),
});

const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  question: text("question").notNull(),
  allowsMultiple: boolean("allows_multiple").default(false),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const pollOptions = pgTable("poll_options", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull(),
  optionText: varchar("option_text", { length: 255 }).notNull(),
  voteCount: integer("vote_count").default(0),
  displayOrder: integer("display_order").default(0),
});

const pollVotes = pgTable("poll_votes", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull(),
  optionId: integer("option_id").notNull(),
  memberId: integer("member_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const reposts = pgTable("reposts", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  memberId: integer("member_id").notNull(),
  quoteText: text("quote_text"), // NULL = repost, non-NULL = quote
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const savedPosts = pgTable("saved_posts", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  memberId: integer("member_id").notNull(),
  collectionId: integer("collection_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  isPrivate: boolean("is_private").default(true),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ SNS PHASE 4: MULTI-REACTIONS ============
const postReactions = pgTable("post_reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  memberId: integer("member_id").notNull(),
  reactionType: varchar("reaction_type", { length: 20 }).notNull(), // like/love/haha/wow/sad/angry
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const commentReactions = pgTable("comment_reactions", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  memberId: integer("member_id").notNull(),
  reactionType: varchar("reaction_type", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ SNS PHASE 5: DM SYSTEM ============
const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 20 }).default("direct"), // direct/group
  name: varchar("name", { length: 100 }),
  avatarUrl: text("avatar_url"),
  createdBy: integer("created_by"),
  lastMessageId: integer("last_message_id"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const conversationMembers = pgTable("conversation_members", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  memberId: integer("member_id").notNull(),
  role: varchar("role", { length: 20 }).default("member"), // admin/member
  nickname: varchar("nickname", { length: 50 }),
  isMuted: boolean("is_muted").default(false),
  unreadCount: integer("unread_count").default(0),
  lastReadAt: timestamp("last_read_at"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content"),
  messageType: varchar("message_type", { length: 20 }).default("text"), // text/image/video/file/voice
  mediaUrl: text("media_url"),
  mediaThumbnail: text("media_thumbnail"),
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size"),
  replyToId: integer("reply_to_id"),
  forwardedFromId: integer("forwarded_from_id"),
  sharedPostId: integer("shared_post_id"),
  isDeleted: boolean("is_deleted").default(false),
  deletedForAll: boolean("deleted_for_all").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at"),
});

const messageReactions = pgTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  memberId: integer("member_id").notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const messageReads = pgTable("message_reads", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  memberId: integer("member_id").notNull(),
  readAt: timestamp("read_at").defaultNow().notNull(),
});

// ============ SNS PHASE 6: STORIES ============
const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  mediaType: varchar("media_type", { length: 20 }).notNull(), // image/video
  mediaUrl: text("media_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration").default(5),
  backgroundColor: varchar("background_color", { length: 7 }),
  textOverlay: text("text_overlay"),
  visibility: varchar("visibility", { length: 20 }).default("public"), // public/close_friends
  viewCount: integer("view_count").default(0),
  replyCount: integer("reply_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

const storyViews = pgTable("story_views", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  viewerId: integer("viewer_id").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

const storyReactions = pgTable("story_reactions", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  memberId: integer("member_id").notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const storyHighlights = pgTable("story_highlights", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  title: varchar("title", { length: 50 }).notNull(),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const highlightStories = pgTable("highlight_stories", {
  id: serial("id").primaryKey(),
  highlightId: integer("highlight_id").notNull(),
  storyId: integer("story_id").notNull(),
  displayOrder: integer("display_order").default(0),
});

// ============ SNS PHASE 7: NOTIFICATIONS ============
const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  recipientId: integer("recipient_id").notNull(),
  senderId: integer("sender_id"),
  type: varchar("type", { length: 50 }).notNull(), // like/comment/follow/mention/repost/dm
  title: text("title"),
  body: text("body"),
  postId: integer("post_id"),
  commentId: integer("comment_id"),
  storyId: integer("story_id"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  groupKey: varchar("group_key", { length: 100 }),
  groupedCount: integer("grouped_count").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  query: text("query").notNull(),
  searchType: varchar("search_type", { length: 20 }), // posts/users/hashtags
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ SNS PHASE 8: GAMIFICATION ============
const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  requirement: text("requirement"), // JSON string
  points: integer("points").default(0),
  isSecret: boolean("is_secret").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const memberBadges = pgTable("member_badges", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  points: integer("points").notNull(),
  reason: varchar("reason", { length: 50 }).notNull(),
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").notNull(),
  targetType: varchar("target_type", { length: 20 }).notNull(), // user/post/comment/message
  targetId: integer("target_id").notNull(),
  reason: varchar("reason", { length: 50 }).notNull(),
  details: text("details"),
  status: varchar("status", { length: 20 }).default("pending"), // pending/reviewed/resolved
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  actionTaken: varchar("action_taken", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const userSuspensions = pgTable("user_suspensions", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  reason: text("reason"),
  suspendedBy: integer("suspended_by"),
  startsAt: timestamp("starts_at").defaultNow().notNull(),
  endsAt: timestamp("ends_at"), // NULL = permanent
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ NOTION WORKSPACE ============
const notionPages = pgTable("notion_pages", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  parentId: integer("parent_id"), // NULL = root page
  title: text("title").default("Untitled").notNull(),
  icon: varchar("icon", { length: 10 }), // Emoji icon
  coverUrl: text("cover_url"),
  coverKey: text("cover_key"),
  content: jsonb("content"), // Tiptap JSON content
  isFavorite: boolean("is_favorite").default(false),
  isArchived: boolean("is_archived").default(false),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Ensure text files include UTF-8 charset
function normalizeContentType(contentType: string, fileName: string): string {
  // Text file extensions that should have UTF-8 charset
  const textExtensions = ['.txt', '.py', '.js', '.ts', '.jsx', '.tsx', '.css', '.html', '.xml', '.json', '.md', '.csv', '.c', '.cpp', '.h', '.java', '.php', '.rb', '.go', '.rs', '.sh', '.yml', '.yaml', '.ini', '.cfg', '.conf', '.log'];
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  // If it's a text file and doesn't have charset, add UTF-8
  if (textExtensions.includes(ext) || contentType.startsWith('text/')) {
    if (!contentType.includes('charset')) {
      return `${contentType}; charset=utf-8`;
    }
  }

  return contentType;
}

async function uploadToR2(key: string, body: Buffer, contentType: string) {
  const client = getS3Client();
  const fileName = key.split('/').pop() || '';
  const normalizedContentType = normalizeContentType(contentType, fileName);

  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: normalizedContentType,
    ContentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
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
      const isCommunityRoute = trpcPath?.startsWith("community.");
      const isProtected = !isCommunityRoute && protectedPrefixes.some(r => trpcPath?.includes(r));

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
            if (project[0].imageKey) await deleteFromR2(project[0].imageKey).catch(() => { });
            if (project[0].videoKey) await deleteFromR2(project[0].videoKey).catch(() => { });
            if (project[0].thumbnailKey) await deleteFromR2(project[0].thumbnailKey).catch(() => { });
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
            await deleteFromR2(cert[0].imageKey).catch(() => { });
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
          const updateData: any = { updatedAt: new Date() };
          if (input.title !== undefined) updateData.title = input.title;
          if (input.description !== undefined) updateData.description = input.description;
          if (input.category !== undefined) updateData.category = input.category;
          if (input.subcategory !== undefined) updateData.subcategory = input.subcategory;
          if (input.displayOrder !== undefined) updateData.displayOrder = input.displayOrder;
          await db.update(resources).set(updateData).where(eq(resources.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }

        case "resources.delete": {
          const resource = await db.select().from(resources).where(eq(resources.id, input.id)).limit(1);
          if (resource[0]) {
            if (resource[0].fileKey) await deleteFromR2(resource[0].fileKey).catch(() => { });
            if (resource[0].thumbnailKey) await deleteFromR2(resource[0].thumbnailKey).catch(() => { });
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

          return res.json({
            result: {
              data: {
                totalViews: totalViews[0]?.count || 0,
                todayViews: todayViews[0]?.count || 0,
                uniqueVisitors: uniqueVisitors[0]?.count || 0,
                viewsByPage,
                recentViews,
              }
            }
          });
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

          return res.json({
            result: {
              data: {
                presignedUrl,
                key,
                publicUrl
              }
            }
          });
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

            return res.json({
              result: {
                data: {
                  uploadId,
                  chunkIndex,
                  complete: true,
                  publicUrl: result.url,
                  fileKey: result.key,
                }
              }
            });
          }

          return res.json({
            result: {
              data: {
                uploadId,
                chunkIndex,
                complete: false,
                received: upload.receivedCount,
                total: upload.totalChunks,
              }
            }
          });
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
              return res.json({ result: { data: { success: false, thumbnail: null, error: "Office API returned error status" } } });
            }

            // Content-Type 확인 - HTML 에러 페이지가 아닌지 확인
            const contentType = response.headers.get('content-type');
            console.log("📄 Content-Type:", contentType);

            if (contentType && contentType.includes('text/html')) {
              console.warn("⚠️ Office API가 HTML 에러 페이지를 반환 (R2 URL 미지원)");
              return res.json({ result: { data: { success: false, thumbnail: null, error: "Office API does not support R2 URLs" } } });
            }

            const buffer = await response.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            console.log("✅ PPT 썸네일 생성 성공 (크기:", buffer.byteLength, "bytes)");

            return res.json({ result: { data: { success: true, thumbnail: base64 } } });
          } catch (error) {
            console.error("❌ PPT thumbnail fetch error:", error);
            return res.json({ result: { data: { success: false, thumbnail: null, error: String(error) } } });
          }
        }

        // ============ FOLDERS ============
        case "folders.list": {
          const data = await db.select().from(folders).orderBy(desc(folders.displayOrder), desc(folders.createdAt));
          return res.json({ result: { data } });
        }

        case "folders.get": {
          const result = await db.select().from(folders).where(eq(folders.id, input.id)).limit(1);
          return res.json({ result: { data: result[0] || null } });
        }

        case "folders.create": {
          const result = await db.insert(folders).values({
            name: input.name,
            category: input.category,
            parentId: input.parentId || null,
            description: input.description || "",
            displayOrder: input.displayOrder || 0,
          }).returning();
          return res.json({ result: { data: result[0] } });
        }

        case "folders.update": {
          const updateData: any = { updatedAt: new Date() };
          if (input.name !== undefined) updateData.name = input.name;
          if (input.description !== undefined) updateData.description = input.description;
          if (input.parentId !== undefined) updateData.parentId = input.parentId;
          await db.update(folders).set(updateData).where(eq(folders.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }

        case "folders.delete": {
          await db.delete(folders).where(eq(folders.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }

        // ============ SETTINGS ============
        case "settings.get": {
          const result = await db.select().from(settings).where(eq(settings.key, input.key)).limit(1);
          return res.json({ result: { data: result[0]?.value || null } });
        }

        case "settings.list": {
          const data = await db.select().from(settings);
          return res.json({ result: { data } });
        }

        case "settings.set": {
          const existing = await db.select().from(settings).where(eq(settings.key, input.key)).limit(1);
          if (existing[0]) {
            await db.update(settings).set({
              value: input.value,
              description: input.description || existing[0].description,
              updatedAt: new Date()
            }).where(eq(settings.key, input.key));
          } else {
            await db.insert(settings).values({
              key: input.key,
              value: input.value,
              description: input.description || null,
            });
          }
          return res.json({ result: { data: { success: true } } });
        }

        // ============ SYSTEM ============
        case "system.health": {
          return res.json({ result: { data: { status: "ok", timestamp: new Date().toISOString() } } });
        }

        // ============ MEMBERS ============
        case "members.register": {
          // Check if phone already exists
          const existingMember = await db.select().from(members).where(eq(members.phone, input.phone)).limit(1);
          if (existingMember[0]) {
            return res.status(409).json({ error: { message: "이미 가입된 번호입니다" } });
          }

          // Check access code from settings
          const accessCodeSetting = await db.select().from(settings).where(eq(settings.key, "student_access_code")).limit(1);
          const validAccessCode = accessCodeSetting[0]?.value || "코딩쏙2024";
          const isValidStudent = input.academyName === validAccessCode;

          // Simple password hashing
          const passwordHash = Buffer.from(input.password).toString("base64");

          const result = await db.insert(members).values({
            name: input.name,
            age: input.age,
            phone: input.phone,
            passwordHash,
            academyName: isValidStudent ? "코딩쏙학원" : null,
            isStudent: isValidStudent,
            phoneVerified: true,
          }).returning();

          return res.json({
            result: {
              data: {
                success: true,
                member: {
                  id: result[0].id,
                  name: result[0].name,
                  isStudent: isValidStudent,
                },
              }
            }
          });
        }

        case "members.login": {
          const member = await db.select().from(members).where(eq(members.phone, input.phone)).limit(1);
          if (!member[0]) {
            return res.status(404).json({ error: { message: "가입되지 않은 번호입니다" } });
          }

          const passwordHash = Buffer.from(input.password).toString("base64");
          if (member[0].passwordHash !== passwordHash) {
            return res.status(401).json({ error: { message: "비밀번호가 일치하지 않습니다" } });
          }

          // Update last login
          await db.update(members).set({ lastLoginAt: new Date() }).where(eq(members.id, member[0].id));

          return res.json({
            result: {
              data: {
                success: true,
                token: `member_${member[0].id}_${Date.now()}`,
                member: {
                  id: member[0].id,
                  name: member[0].name,
                  isStudent: member[0].isStudent,
                  academyName: member[0].academyName,
                },
              }
            }
          });
        }

        case "members.updateProfile": {
          // Get member
          const memberToUpdate = await db.select().from(members).where(eq(members.id, input.memberId)).limit(1);
          if (!memberToUpdate[0]) {
            return res.status(404).json({ error: { message: "회원을 찾을 수 없습니다" } });
          }

          // Check access code from settings
          const accessCodeSetting = await db.select().from(settings).where(eq(settings.key, "student_access_code")).limit(1);
          const validAccessCode = accessCodeSetting[0]?.value || "코딩쏙2024";
          const isValidStudent = input.academyName === validAccessCode;

          // Update member
          await db.update(members).set({
            academyName: isValidStudent ? "코딩쏙학원" : (input.academyName || null),
            isStudent: isValidStudent,
            updatedAt: new Date(),
          }).where(eq(members.id, input.memberId));

          return res.json({
            result: {
              data: {
                success: true,
                isStudent: isValidStudent,
                message: isValidStudent ? "학생 인증이 완료되었습니다!" : "프로필이 저장되었습니다",
              }
            }
          });
        }


        // ============ COMMUNITY POSTS ============
        case "community.posts.list": {
          const category = input.category;
          const limit = input.limit || 50;

          // Get posts
          let postsQuery;
          if (category) {
            postsQuery = await db.select().from(communityPosts)
              .where(eq(communityPosts.category, category))
              .orderBy(desc(communityPosts.createdAt))
              .limit(limit);
          } else {
            postsQuery = await db.select().from(communityPosts)
              .orderBy(desc(communityPosts.createdAt))
              .limit(limit);
          }

          // Enrich posts with author name, like count, comment count
          const enrichedPosts = await Promise.all(postsQuery.map(async (post) => {
            // Get author name
            let authorName = "익명";
            if (!post.isAnonymous) {
              const member = await db.select().from(members)
                .where(eq(members.id, post.memberId))
                .limit(1);
              if (member[0]) {
                // Convert 자현 to 선생님
                authorName = member[0].name === "자현" ? "선생님" : member[0].name;
              }
            }

            // Count likes (with error handling for missing table)
            let likeCount = 0;
            try {
              const likes = await db.select({ count: sql<number>`count(*)` })
                .from(communityLikes)
                .where(eq(communityLikes.postId, post.id));
              likeCount = likes[0]?.count || 0;
            } catch (e) {
              // Table might not exist yet
            }

            // Count comments (with error handling for missing table)
            let commentCount = 0;
            try {
              const comments = await db.select({ count: sql<number>`count(*)` })
                .from(communityComments)
                .where(eq(communityComments.postId, post.id));
              commentCount = comments[0]?.count || 0;
            } catch (e) {
              // Table might not exist yet
            }

            return {
              ...post,
              authorName,
              likeCount,
              commentCount,
            };
          }));

          return res.json({ result: { data: enrichedPosts } });
        }

        case "community.posts.create": {
          const result = await db.insert(communityPosts).values({
            memberId: input.memberId,
            title: input.title,
            content: input.content,
            category: input.category,
            tags: input.tags ? JSON.stringify(input.tags) : null,
            images: input.images ? JSON.stringify(input.images) : null,
            isAnonymous: input.isAnonymous || false,
          }).returning();

          return res.json({
            result: {
              data: {
                success: true,
                id: result[0]?.id,
                post: result[0]
              }
            }
          });
        }

        case "community.posts.get": {
          const post = await db.select().from(communityPosts)
            .where(eq(communityPosts.id, input.id))
            .limit(1);

          if (post[0]) {
            // Increment view count
            await db.update(communityPosts)
              .set({ viewCount: sql`${communityPosts.viewCount} + 1` })
              .where(eq(communityPosts.id, input.id));
          }

          return res.json({ result: { data: post[0] || null } });
        }

        case "community.posts.delete": {
          await db.delete(communityPosts).where(eq(communityPosts.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }

        case "community.posts.like": {
          const { postId, memberId } = input;

          // Check if already liked
          const existing = await db.select().from(communityLikes)
            .where(and(eq(communityLikes.postId, postId), eq(communityLikes.memberId, memberId)))
            .limit(1);

          if (existing[0]) {
            // Unlike
            await db.delete(communityLikes).where(eq(communityLikes.id, existing[0].id));
            return res.json({ result: { data: { success: true, liked: false } } });
          } else {
            // Like
            await db.insert(communityLikes).values({ postId, memberId });
            return res.json({ result: { data: { success: true, liked: true } } });
          }
        }

        case "community.posts.checkLike": {
          const { postId, memberId } = input;
          const existing = await db.select().from(communityLikes)
            .where(and(eq(communityLikes.postId, postId), eq(communityLikes.memberId, memberId)))
            .limit(1);
          return res.json({ result: { data: { liked: !!existing[0] } } });
        }

        // ============ COMMUNITY COMMENTS ============
        case "community.comments.list": {
          const commentsData = await db.select().from(communityComments)
            .where(eq(communityComments.postId, input.postId))
            .orderBy(communityComments.createdAt);

          // Enrich comments with author names and like counts
          const enrichedComments = await Promise.all(commentsData.map(async (comment) => {
            const member = await db.select().from(members)
              .where(eq(members.id, comment.memberId))
              .limit(1);

            let authorName = "익명";
            if (member[0]) {
              authorName = member[0].name === "자현" ? "선생님" : member[0].name;
            }

            // Count comment likes
            let likeCount = 0;
            try {
              const likes = await db.select({ count: sql<number>`count(*)` })
                .from(commentLikes)
                .where(eq(commentLikes.commentId, comment.id));
              likeCount = likes[0]?.count || 0;
            } catch (e) {
              // Table might not exist yet
            }

            return { ...comment, authorName, likeCount };
          }));

          // Organize into parent-child structure
          const topLevelComments = enrichedComments.filter(c => !c.parentId);
          const replies = enrichedComments.filter(c => c.parentId);

          const nestedComments = topLevelComments.map(comment => ({
            ...comment,
            replies: replies.filter(r => r.parentId === comment.id)
          }));

          return res.json({ result: { data: nestedComments } });
        }

        case "community.comments.create": {
          const result = await db.insert(communityComments).values({
            postId: input.postId,
            memberId: input.memberId,
            content: input.content,
            parentId: input.parentId || null, // Support nested replies
          }).returning();

          return res.json({
            result: {
              data: {
                success: true,
                id: result[0]?.id,
                comment: result[0]
              }
            }
          });
        }

        case "community.comments.like": {
          const { commentId, memberId } = input;

          // Check if already liked
          const existing = await db.select().from(commentLikes)
            .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.memberId, memberId)))
            .limit(1);

          if (existing[0]) {
            await db.delete(commentLikes).where(eq(commentLikes.id, existing[0].id));
            return res.json({ result: { data: { success: true, liked: false } } });
          } else {
            await db.insert(commentLikes).values({ commentId, memberId });
            return res.json({ result: { data: { success: true, liked: true } } });
          }
        }

        case "community.comments.delete": {
          await db.delete(communityComments).where(eq(communityComments.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }

        // ============ BOOKMARKS ============
        case "community.bookmarks.toggle": {
          const { postId, memberId } = input;

          const existing = await db.select().from(communityBookmarks)
            .where(and(eq(communityBookmarks.postId, postId), eq(communityBookmarks.memberId, memberId)))
            .limit(1);

          if (existing[0]) {
            await db.delete(communityBookmarks).where(eq(communityBookmarks.id, existing[0].id));
            return res.json({ result: { data: { success: true, bookmarked: false } } });
          } else {
            await db.insert(communityBookmarks).values({ postId, memberId });
            return res.json({ result: { data: { success: true, bookmarked: true } } });
          }
        }

        case "community.bookmarks.check": {
          const { postId, memberId } = input;
          const existing = await db.select().from(communityBookmarks)
            .where(and(eq(communityBookmarks.postId, postId), eq(communityBookmarks.memberId, memberId)))
            .limit(1);
          return res.json({ result: { data: { bookmarked: !!existing[0] } } });
        }

        case "community.bookmarks.list": {
          const { memberId } = input;
          const bookmarks = await db.select().from(communityBookmarks)
            .where(eq(communityBookmarks.memberId, memberId))
            .orderBy(desc(communityBookmarks.createdAt));

          // Get full post details for each bookmark
          const posts = await Promise.all(bookmarks.map(async (bm) => {
            const post = await db.select().from(communityPosts)
              .where(eq(communityPosts.id, bm.postId))
              .limit(1);
            return post[0] || null;
          }));

          return res.json({ result: { data: posts.filter(p => p !== null) } });
        }

        // ============ CLASS NOTES ============
        case "community.classNotes.list": {
          const { memberId } = input;
          const notes = await db.select().from(classNotes)
            .where(eq(classNotes.memberId, memberId))
            .orderBy(desc(classNotes.updatedAt));
          return res.json({ result: { data: notes } });
        }

        case "community.classNotes.get": {
          const note = await db.select().from(classNotes)
            .where(eq(classNotes.id, input.id))
            .limit(1);
          return res.json({ result: { data: note[0] || null } });
        }

        case "community.classNotes.create": {
          const result = await db.insert(classNotes).values({
            memberId: input.memberId,
            title: input.title || "새 메모",
            content: input.content || "",
            isPublic: input.isPublic || false,
          }).returning();

          return res.json({
            result: {
              data: {
                success: true,
                id: result[0]?.id,
                note: result[0]
              }
            }
          });
        }

        case "community.classNotes.update": {
          await db.update(classNotes).set({
            title: input.title,
            content: input.content,
            isPublic: input.isPublic,
            updatedAt: new Date(),
          }).where(eq(classNotes.id, input.id));

          return res.json({ result: { data: { success: true } } });
        }

        case "community.classNotes.delete": {
          await db.delete(classNotes).where(eq(classNotes.id, input.id));
          return res.json({ result: { data: { success: true } } });
        }

        // ============ COMMUNITY IMAGE UPLOAD ============
        case "community.uploadImage": {
          const { fileName, fileContent, contentType } = input;
          const buffer = Buffer.from(fileContent, "base64");
          const key = `community/${Date.now()}-${fileName}`;
          const result = await uploadToR2(key, buffer, contentType);
          return res.json({ result: { data: { url: result.url, key: result.key } } });
        }

        // ============ SNS PHASE 1: PROFILES ============
        case "sns.profile.get": {
          const profile = await db.select().from(memberProfiles)
            .where(eq(memberProfiles.memberId, input.memberId))
            .limit(1);

          if (!profile[0]) {
            // Auto-create profile if not exists
            const member = await db.select().from(members)
              .where(eq(members.id, input.memberId)).limit(1);
            if (member[0]) {
              const newProfile = await db.insert(memberProfiles).values({
                memberId: input.memberId,
                displayName: member[0].name,
              }).returning();
              return res.json({ result: { data: newProfile[0] } });
            }
          }
          return res.json({ result: { data: profile[0] || null } });
        }

        case "sns.profile.update": {
          const { memberId, ...updateData } = input;
          const existing = await db.select().from(memberProfiles)
            .where(eq(memberProfiles.memberId, memberId)).limit(1);

          if (existing[0]) {
            await db.update(memberProfiles).set({
              ...updateData,
              updatedAt: new Date(),
            }).where(eq(memberProfiles.memberId, memberId));
          } else {
            await db.insert(memberProfiles).values({
              memberId,
              ...updateData,
            });
          }
          return res.json({ result: { data: { success: true } } });
        }

        case "sns.profile.uploadAvatar": {
          const { memberId, fileName, fileContent, contentType } = input;
          const buffer = Buffer.from(fileContent, "base64");
          const key = `avatars/${memberId}/${Date.now()}-${fileName}`;
          const result = await uploadToR2(key, buffer, contentType);

          await db.update(memberProfiles).set({
            avatarUrl: result.url,
            avatarKey: result.key,
            updatedAt: new Date(),
          }).where(eq(memberProfiles.memberId, memberId));

          return res.json({ result: { data: { url: result.url, key: result.key } } });
        }

        // ============ SNS PHASE 1: SETTINGS ============
        case "sns.settings.get": {
          const settings = await db.select().from(userSettings)
            .where(eq(userSettings.memberId, input.memberId))
            .limit(1);

          if (!settings[0]) {
            const newSettings = await db.insert(userSettings).values({
              memberId: input.memberId,
            }).returning();
            return res.json({ result: { data: newSettings[0] } });
          }
          return res.json({ result: { data: settings[0] } });
        }

        case "sns.settings.update": {
          const { memberId, ...updateData } = input;
          await db.update(userSettings).set({
            ...updateData,
            updatedAt: new Date(),
          }).where(eq(userSettings.memberId, memberId));
          return res.json({ result: { data: { success: true } } });
        }

        // ============ SNS PHASE 2: FOLLOWS ============
        case "sns.follow.toggle": {
          const { followerId, followingId } = input;
          const existing = await db.select().from(follows)
            .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
            .limit(1);

          if (existing[0]) {
            await db.delete(follows).where(eq(follows.id, existing[0].id));
            // Update counts
            await db.update(memberProfiles).set({
              followingCount: sql`following_count - 1`
            }).where(eq(memberProfiles.memberId, followerId));
            await db.update(memberProfiles).set({
              followerCount: sql`follower_count - 1`
            }).where(eq(memberProfiles.memberId, followingId));
            return res.json({ result: { data: { following: false } } });
          } else {
            await db.insert(follows).values({ followerId, followingId });
            // Update counts
            await db.update(memberProfiles).set({
              followingCount: sql`following_count + 1`
            }).where(eq(memberProfiles.memberId, followerId));
            await db.update(memberProfiles).set({
              followerCount: sql`follower_count + 1`
            }).where(eq(memberProfiles.memberId, followingId));
            // Create notification
            await db.insert(notifications).values({
              recipientId: followingId,
              senderId: followerId,
              type: "follow",
              body: "님이 팔로우했습니다",
            });
            return res.json({ result: { data: { following: true } } });
          }
        }

        case "sns.follow.check": {
          const existing = await db.select().from(follows)
            .where(and(eq(follows.followerId, input.followerId), eq(follows.followingId, input.followingId)))
            .limit(1);
          return res.json({ result: { data: { following: !!existing[0] } } });
        }

        case "sns.followers.list": {
          const followersList = await db.select().from(follows)
            .where(eq(follows.followingId, input.memberId))
            .orderBy(desc(follows.createdAt));

          const users = await Promise.all(followersList.map(async (f) => {
            const profile = await db.select().from(memberProfiles)
              .where(eq(memberProfiles.memberId, f.followerId)).limit(1);
            const member = await db.select().from(members)
              .where(eq(members.id, f.followerId)).limit(1);
            return {
              ...profile[0],
              id: f.followerId,
              name: member[0]?.name,
              followedAt: f.createdAt
            };
          }));
          return res.json({ result: { data: users } });
        }

        case "sns.following.list": {
          const followingList = await db.select().from(follows)
            .where(eq(follows.followerId, input.memberId))
            .orderBy(desc(follows.createdAt));

          const users = await Promise.all(followingList.map(async (f) => {
            const profile = await db.select().from(memberProfiles)
              .where(eq(memberProfiles.memberId, f.followingId)).limit(1);
            const member = await db.select().from(members)
              .where(eq(members.id, f.followingId)).limit(1);
            return {
              ...profile[0],
              id: f.followingId,
              name: member[0]?.name,
              followedAt: f.createdAt
            };
          }));
          return res.json({ result: { data: users } });
        }

        // ============ SNS PHASE 2: BLOCKS & MUTES ============
        case "sns.block.toggle": {
          const { blockerId, blockedId } = input;
          const existing = await db.select().from(blocks)
            .where(and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId)))
            .limit(1);

          if (existing[0]) {
            await db.delete(blocks).where(eq(blocks.id, existing[0].id));
            return res.json({ result: { data: { blocked: false } } });
          } else {
            await db.insert(blocks).values({ blockerId, blockedId });
            // Also unfollow
            await db.delete(follows).where(
              and(eq(follows.followerId, blockerId), eq(follows.followingId, blockedId))
            );
            await db.delete(follows).where(
              and(eq(follows.followerId, blockedId), eq(follows.followingId, blockerId))
            );
            return res.json({ result: { data: { blocked: true } } });
          }
        }

        case "sns.mute.toggle": {
          const { muterId, mutedId } = input;
          const existing = await db.select().from(mutes)
            .where(and(eq(mutes.muterId, muterId), eq(mutes.mutedId, mutedId)))
            .limit(1);

          if (existing[0]) {
            await db.delete(mutes).where(eq(mutes.id, existing[0].id));
            return res.json({ result: { data: { muted: false } } });
          } else {
            await db.insert(mutes).values({ muterId, mutedId });
            return res.json({ result: { data: { muted: true } } });
          }
        }

        // ============ SNS PHASE 4: REACTIONS ============
        case "sns.reaction.toggle": {
          const { postId, memberId, reactionType } = input;
          const existing = await db.select().from(postReactions)
            .where(and(eq(postReactions.postId, postId), eq(postReactions.memberId, memberId)))
            .limit(1);

          if (existing[0]) {
            if (existing[0].reactionType === reactionType) {
              await db.delete(postReactions).where(eq(postReactions.id, existing[0].id));
              return res.json({ result: { data: { reacted: false, type: null } } });
            } else {
              await db.update(postReactions).set({ reactionType }).where(eq(postReactions.id, existing[0].id));
              return res.json({ result: { data: { reacted: true, type: reactionType } } });
            }
          } else {
            await db.insert(postReactions).values({ postId, memberId, reactionType });
            return res.json({ result: { data: { reacted: true, type: reactionType } } });
          }
        }

        case "sns.reaction.list": {
          const reactions = await db.select().from(postReactions)
            .where(eq(postReactions.postId, input.postId));
          return res.json({ result: { data: reactions } });
        }

        // ============ SNS PHASE 5: DM CONVERSATIONS ============
        case "sns.conversations.list": {
          const memberConvos = await db.select().from(conversationMembers)
            .where(eq(conversationMembers.memberId, input.memberId));

          const convos = await Promise.all(memberConvos.map(async (mc) => {
            const convo = await db.select().from(conversations)
              .where(eq(conversations.id, mc.conversationId)).limit(1);

            // Get other member(s)
            const otherMembers = await db.select().from(conversationMembers)
              .where(and(
                eq(conversationMembers.conversationId, mc.conversationId),
                sql`${conversationMembers.memberId} != ${input.memberId}`
              ));

            const otherProfiles = await Promise.all(otherMembers.map(async (om) => {
              const profile = await db.select().from(memberProfiles)
                .where(eq(memberProfiles.memberId, om.memberId)).limit(1);
              return profile[0];
            }));

            // Get last message
            const lastMsg = await db.select().from(messages)
              .where(eq(messages.conversationId, mc.conversationId))
              .orderBy(desc(messages.createdAt))
              .limit(1);

            return {
              ...convo[0],
              unreadCount: mc.unreadCount,
              otherMembers: otherProfiles,
              lastMessage: lastMsg[0],
            };
          }));

          return res.json({
            result: {
              data: convos.sort((a, b) =>
                new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
              )
            }
          });
        }

        case "sns.conversations.create": {
          const { creatorId, participantIds, type, name } = input;

          // Check if direct conversation already exists
          if (type === "direct" && participantIds.length === 1) {
            const existingConvos = await db.select().from(conversationMembers)
              .where(eq(conversationMembers.memberId, creatorId));

            for (const ec of existingConvos) {
              const members = await db.select().from(conversationMembers)
                .where(eq(conversationMembers.conversationId, ec.conversationId));
              if (members.length === 2 && members.some(m => m.memberId === participantIds[0])) {
                return res.json({ result: { data: { id: ec.conversationId, existing: true } } });
              }
            }
          }

          const [newConvo] = await db.insert(conversations).values({
            type: type || "direct",
            name,
            createdBy: creatorId,
          }).returning();

          // Add members
          await db.insert(conversationMembers).values({ conversationId: newConvo.id, memberId: creatorId, role: "admin" });
          for (const pid of participantIds) {
            await db.insert(conversationMembers).values({ conversationId: newConvo.id, memberId: pid });
          }

          return res.json({ result: { data: { id: newConvo.id, existing: false } } });
        }

        // ============ SNS PHASE 5: MESSAGES ============
        case "sns.messages.list": {
          const msgs = await db.select().from(messages)
            .where(eq(messages.conversationId, input.conversationId))
            .orderBy(desc(messages.createdAt))
            .limit(input.limit || 50);

          // Mark as read
          await db.update(conversationMembers).set({
            unreadCount: 0,
            lastReadAt: new Date(),
          }).where(and(
            eq(conversationMembers.conversationId, input.conversationId),
            eq(conversationMembers.memberId, input.memberId)
          ));

          return res.json({ result: { data: msgs.reverse() } });
        }

        case "sns.messages.send": {
          const { conversationId, senderId, content, messageType, mediaUrl, replyToId, sharedPostId } = input;

          const [newMsg] = await db.insert(messages).values({
            conversationId,
            senderId,
            content,
            messageType: messageType || "text",
            mediaUrl,
            replyToId,
            sharedPostId,
          }).returning();

          // Update conversation
          await db.update(conversations).set({
            lastMessageId: newMsg.id,
            lastMessageAt: new Date(),
          }).where(eq(conversations.id, conversationId));

          // Increment unread for other members
          await db.update(conversationMembers).set({
            unreadCount: sql`unread_count + 1`,
          }).where(and(
            eq(conversationMembers.conversationId, conversationId),
            sql`${conversationMembers.memberId} != ${senderId}`
          ));

          return res.json({ result: { data: newMsg } });
        }

        case "sns.messages.delete": {
          const { messageId, deleteForAll } = input;
          if (deleteForAll) {
            await db.update(messages).set({
              isDeleted: true,
              deletedForAll: true,
              content: "[삭제된 메시지]",
            }).where(eq(messages.id, messageId));
          } else {
            await db.update(messages).set({
              isDeleted: true,
            }).where(eq(messages.id, messageId));
          }
          return res.json({ result: { data: { success: true } } });
        }

        // ============ SNS PHASE 6: STORIES ============
        case "sns.stories.list": {
          // Get stories from followed users
          const following = await db.select().from(follows)
            .where(eq(follows.followerId, input.memberId));

          const followingIds = following.map(f => f.followingId);
          followingIds.push(input.memberId); // Include own stories

          const allStories = await db.select().from(stories)
            .where(sql`${stories.memberId} = ANY(${followingIds}) AND ${stories.expiresAt} > NOW()`)
            .orderBy(desc(stories.createdAt));

          // Group by user
          const grouped: Record<number, any[]> = {};
          for (const story of allStories) {
            if (!grouped[story.memberId]) grouped[story.memberId] = [];
            grouped[story.memberId].push(story);
          }

          const result = await Promise.all(Object.entries(grouped).map(async ([memberId, userStories]) => {
            const profile = await db.select().from(memberProfiles)
              .where(eq(memberProfiles.memberId, parseInt(memberId))).limit(1);
            return {
              user: profile[0],
              stories: userStories,
            };
          }));

          return res.json({ result: { data: result } });
        }

        case "sns.stories.create": {
          const { memberId, mediaType, mediaUrl, thumbnailUrl, textOverlay, visibility } = input;
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          const [newStory] = await db.insert(stories).values({
            memberId,
            mediaType,
            mediaUrl,
            thumbnailUrl,
            textOverlay,
            visibility: visibility || "public",
            expiresAt,
          }).returning();
          return res.json({ result: { data: newStory } });
        }

        case "sns.stories.view": {
          const { storyId, viewerId } = input;
          try {
            await db.insert(storyViews).values({ storyId, viewerId });
            await db.update(stories).set({
              viewCount: sql`view_count + 1`
            }).where(eq(stories.id, storyId));
          } catch (e) {
            // Already viewed
          }
          return res.json({ result: { data: { success: true } } });
        }

        // ============ SNS PHASE 7: NOTIFICATIONS ============
        case "sns.notifications.list": {
          const notifs = await db.select().from(notifications)
            .where(eq(notifications.recipientId, input.memberId))
            .orderBy(desc(notifications.createdAt))
            .limit(input.limit || 50);

          const enriched = await Promise.all(notifs.map(async (n) => {
            if (n.senderId) {
              const profile = await db.select().from(memberProfiles)
                .where(eq(memberProfiles.memberId, n.senderId)).limit(1);
              return { ...n, sender: profile[0] };
            }
            return n;
          }));

          return res.json({ result: { data: enriched } });
        }

        case "sns.notifications.read": {
          await db.update(notifications).set({
            isRead: true,
            readAt: new Date(),
          }).where(eq(notifications.id, input.notificationId));
          return res.json({ result: { data: { success: true } } });
        }

        case "sns.notifications.readAll": {
          await db.update(notifications).set({
            isRead: true,
            readAt: new Date(),
          }).where(and(
            eq(notifications.recipientId, input.memberId),
            eq(notifications.isRead, false)
          ));
          return res.json({ result: { data: { success: true } } });
        }

        case "sns.notifications.unreadCount": {
          const count = await db.select({ count: sql`COUNT(*)` }).from(notifications)
            .where(and(
              eq(notifications.recipientId, input.memberId),
              eq(notifications.isRead, false)
            ));
          return res.json({ result: { data: { count: Number(count[0]?.count || 0) } } });
        }

        // ============ SNS PHASE 7: SEARCH ============
        case "sns.search.users": {
          const query = `%${input.query}%`;
          const results = await db.select().from(memberProfiles)
            .where(sql`${memberProfiles.displayName} ILIKE ${query} OR ${memberProfiles.username} ILIKE ${query}`)
            .limit(20);
          return res.json({ result: { data: results } });
        }

        case "sns.search.hashtags": {
          const query = `%${input.query}%`;
          const results = await db.select().from(hashtags)
            .where(sql`${hashtags.name} ILIKE ${query}`)
            .orderBy(desc(hashtags.postCount))
            .limit(20);
          return res.json({ result: { data: results } });
        }

        // ============ SNS PHASE 8: GAMIFICATION ============
        case "sns.badges.list": {
          const all = await db.select().from(badges)
            .where(eq(badges.isSecret, false));
          const earned = await db.select().from(memberBadges)
            .where(eq(memberBadges.memberId, input.memberId));
          const earnedIds = earned.map(e => e.badgeId);
          return res.json({ result: { data: all.map(b => ({ ...b, earned: earnedIds.includes(b.id) })) } });
        }

        case "sns.points.add": {
          const { memberId, points, reason, relatedId } = input;
          await db.insert(pointTransactions).values({ memberId, points, reason, relatedId });
          await db.update(memberProfiles).set({
            experiencePoints: sql`experience_points + ${points}`,
          }).where(eq(memberProfiles.memberId, memberId));

          // Check level up (every 1000 XP)
          const profile = await db.select().from(memberProfiles)
            .where(eq(memberProfiles.memberId, memberId)).limit(1);
          if (profile[0]) {
            const currentXP = profile[0].experiencePoints ?? 0;
            const currentLevel = profile[0].level ?? 1;
            const newLevel = Math.floor((currentXP + points) / 1000) + 1;
            if (newLevel > currentLevel) {
              await db.update(memberProfiles).set({ level: newLevel })
                .where(eq(memberProfiles.memberId, memberId));
            }
          }
          return res.json({ result: { data: { success: true } } });
        }

        // ============ SNS PHASE 8: REPORTS ============
        case "sns.report.create": {
          const { reporterId, targetType, targetId, reason, details } = input;
          const [report] = await db.insert(reports).values({
            reporterId, targetType, targetId, reason, details
          }).returning();
          return res.json({ result: { data: report } });
        }

        // ============ NOTION WORKSPACE ============
        case "notion.pages.list": {
          const { memberId } = input;
          const pages = await db.select().from(notionPages)
            .where(and(
              eq(notionPages.memberId, memberId),
              eq(notionPages.isArchived, false)
            ))
            .orderBy(desc(notionPages.updatedAt));
          return res.json({ result: { data: pages } });
        }

        case "notion.pages.get": {
          const { pageId, memberId } = input;
          const [page] = await db.select().from(notionPages)
            .where(and(
              eq(notionPages.id, pageId),
              eq(notionPages.memberId, memberId)
            ))
            .limit(1);
          if (page) {
            await db.update(notionPages)
              .set({ viewCount: sql`${notionPages.viewCount} + 1` })
              .where(eq(notionPages.id, pageId));
          }
          return res.json({ result: { data: page || null } });
        }

        case "notion.pages.create": {
          const { memberId, parentId, title } = input;
          const [page] = await db.insert(notionPages).values({
            memberId,
            parentId: parentId || null,
            title: title || "Untitled",
            icon: "📄",
          }).returning();
          return res.json({ result: { data: page } });
        }

        case "notion.pages.update": {
          const { pageId, memberId, title, content, icon, coverUrl, coverKey } = input;
          const updateData: any = { updatedAt: new Date() };
          if (title !== undefined) updateData.title = title;
          if (content !== undefined) updateData.content = content;
          if (icon !== undefined) updateData.icon = icon;
          if (coverUrl !== undefined) updateData.coverUrl = coverUrl;
          if (coverKey !== undefined) updateData.coverKey = coverKey;

          await db.update(notionPages)
            .set(updateData)
            .where(and(
              eq(notionPages.id, pageId),
              eq(notionPages.memberId, memberId)
            ));
          return res.json({ result: { data: { success: true } } });
        }

        case "notion.pages.delete": {
          const { pageId, memberId } = input;
          // Soft delete (archive)
          await db.update(notionPages)
            .set({ isArchived: true, updatedAt: new Date() })
            .where(and(
              eq(notionPages.id, pageId),
              eq(notionPages.memberId, memberId)
            ));
          return res.json({ result: { data: { success: true } } });
        }

        case "notion.pages.toggleFavorite": {
          const { pageId, memberId, isFavorite } = input;
          await db.update(notionPages)
            .set({ isFavorite, updatedAt: new Date() })
            .where(and(
              eq(notionPages.id, pageId),
              eq(notionPages.memberId, memberId)
            ));
          return res.json({ result: { data: { success: true } } });
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
