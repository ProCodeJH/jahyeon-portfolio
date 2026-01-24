-- ============================================================
-- Ultra-Premium SNS System - Database Migration
-- Run this in Neon SQL Editor
-- ============================================================

-- ============ PHASE 1: MEMBER PROFILES ============
CREATE TABLE IF NOT EXISTS member_profiles (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  username VARCHAR(30) UNIQUE,
  display_name VARCHAR(50),
  bio TEXT,
  avatar_url TEXT,
  avatar_key TEXT,
  cover_image_url TEXT,
  cover_image_key TEXT,
  website VARCHAR(255),
  location VARCHAR(100),
  birthday VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  last_active_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  who_can_dm VARCHAR(20) DEFAULT 'everyone',
  who_can_mention VARCHAR(20) DEFAULT 'everyone',
  show_activity_status BOOLEAN DEFAULT TRUE,
  show_read_receipts BOOLEAN DEFAULT TRUE,
  notify_likes BOOLEAN DEFAULT TRUE,
  notify_comments BOOLEAN DEFAULT TRUE,
  notify_follows BOOLEAN DEFAULT TRUE,
  notify_mentions BOOLEAN DEFAULT TRUE,
  notify_dms BOOLEAN DEFAULT TRUE,
  email_digest VARCHAR(20) DEFAULT 'weekly',
  theme VARCHAR(20) DEFAULT 'dark',
  language VARCHAR(10) DEFAULT 'ko',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============ PHASE 2: SOCIAL GRAPH ============
CREATE TABLE IF NOT EXISTS follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER NOT NULL REFERENCES members(id),
  following_id INTEGER NOT NULL REFERENCES members(id),
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS blocks (
  id SERIAL PRIMARY KEY,
  blocker_id INTEGER NOT NULL REFERENCES members(id),
  blocked_id INTEGER NOT NULL REFERENCES members(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS mutes (
  id SERIAL PRIMARY KEY,
  muter_id INTEGER NOT NULL REFERENCES members(id),
  muted_id INTEGER NOT NULL REFERENCES members(id),
  mute_posts BOOLEAN DEFAULT TRUE,
  mute_stories BOOLEAN DEFAULT TRUE,
  mute_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(muter_id, muted_id)
);

CREATE TABLE IF NOT EXISTS close_friends (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  friend_id INTEGER NOT NULL REFERENCES members(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(member_id, friend_id)
);

-- ============ PHASE 3: ENHANCED POSTS ============
CREATE TABLE IF NOT EXISTS hashtags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS post_hashtags (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  hashtag_id INTEGER NOT NULL REFERENCES hashtags(id),
  UNIQUE(post_id, hashtag_id)
);

CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  allows_multiple BOOLEAN DEFAULT FALSE,
  ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS poll_options (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text VARCHAR(255) NOT NULL,
  vote_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(poll_id, option_id, member_id)
);

CREATE TABLE IF NOT EXISTS reposts (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id),
  quote_text TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, member_id)
);

CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  name VARCHAR(100) NOT NULL,
  is_private BOOLEAN DEFAULT TRUE,
  cover_image TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS saved_posts (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id),
  collection_id INTEGER REFERENCES collections(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, member_id)
);

-- ============ PHASE 4: MULTI-REACTIONS ============
CREATE TABLE IF NOT EXISTS post_reactions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id),
  reaction_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, member_id)
);

CREATE TABLE IF NOT EXISTS comment_reactions (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES community_comments(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id),
  reaction_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(comment_id, member_id)
);

-- ============ PHASE 5: DM SYSTEM ============
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) DEFAULT 'direct',
  name VARCHAR(100),
  avatar_url TEXT,
  created_by INTEGER REFERENCES members(id),
  last_message_id INTEGER,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS conversation_members (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id),
  role VARCHAR(20) DEFAULT 'member',
  nickname VARCHAR(50),
  is_muted BOOLEAN DEFAULT FALSE,
  unread_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(conversation_id, member_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES members(id),
  content TEXT,
  message_type VARCHAR(20) DEFAULT 'text',
  media_url TEXT,
  media_thumbnail TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  reply_to_id INTEGER REFERENCES messages(id),
  forwarded_from_id INTEGER REFERENCES messages(id),
  shared_post_id INTEGER REFERENCES community_posts(id),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_for_all BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  edited_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS message_reactions (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id),
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(message_id, member_id)
);

CREATE TABLE IF NOT EXISTS message_reads (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id),
  read_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(message_id, member_id)
);

-- ============ PHASE 6: STORIES ============
CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  media_type VARCHAR(20) NOT NULL,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 5,
  background_color VARCHAR(7),
  text_overlay TEXT,
  visibility VARCHAR(20) DEFAULT 'public',
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE TABLE IF NOT EXISTS story_views (
  id SERIAL PRIMARY KEY,
  story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id INTEGER NOT NULL REFERENCES members(id),
  viewed_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(story_id, viewer_id)
);

CREATE TABLE IF NOT EXISTS story_reactions (
  id SERIAL PRIMARY KEY,
  story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id),
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS story_highlights (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  title VARCHAR(50) NOT NULL,
  cover_image TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS highlight_stories (
  id SERIAL PRIMARY KEY,
  highlight_id INTEGER NOT NULL REFERENCES story_highlights(id) ON DELETE CASCADE,
  story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  UNIQUE(highlight_id, story_id)
);

-- ============ PHASE 7: NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER NOT NULL REFERENCES members(id),
  sender_id INTEGER REFERENCES members(id),
  type VARCHAR(50) NOT NULL,
  title TEXT,
  body TEXT,
  post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id INTEGER REFERENCES community_comments(id) ON DELETE CASCADE,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  group_key VARCHAR(100),
  grouped_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS search_history (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  query TEXT NOT NULL,
  search_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============ PHASE 8: GAMIFICATION ============
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  icon_url TEXT,
  requirement TEXT,
  points INTEGER DEFAULT 0,
  is_secret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS member_badges (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  badge_id INTEGER NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(member_id, badge_id)
);

CREATE TABLE IF NOT EXISTS point_transactions (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  points INTEGER NOT NULL,
  reason VARCHAR(50) NOT NULL,
  related_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES members(id),
  target_type VARCHAR(20) NOT NULL,
  target_id INTEGER NOT NULL,
  reason VARCHAR(50) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by INTEGER REFERENCES members(id),
  reviewed_at TIMESTAMP,
  action_taken VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_suspensions (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  reason TEXT,
  suspended_by INTEGER REFERENCES members(id),
  starts_at TIMESTAMP DEFAULT NOW() NOT NULL,
  ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_member_profiles_member ON member_profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_member ON user_settings(member_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_member ON stories(member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_expiry ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_hashtags_name ON hashtags(name);

-- ============ INITIAL BADGES ============
INSERT INTO badges (name, description, icon_url, requirement, points) VALUES
('🎯 첫 발걸음', '첫 게시글 작성', '🎯', '{"type":"post_count","value":1}', 50),
('💬 수다쟁이', '댓글 10개 작성', '💬', '{"type":"comment_count","value":10}', 100),
('🔥 인싸', '팔로워 10명 달성', '🔥', '{"type":"follower_count","value":10}', 150),
('💎 다이아몬드', '좋아요 100개 받기', '💎', '{"type":"total_likes","value":100}', 200),
('⭐ 스타', '팔로워 100명 달성', '⭐', '{"type":"follower_count","value":100}', 500),
('👑 레전드', '레벨 10 달성', '👑', '{"type":"level","value":10}', 1000),
('📚 학구파', '수업 메모 20개 작성', '📚', '{"type":"note_count","value":20}', 150),
('🎉 파티플래너', '100일 연속 로그인', '🎉', '{"type":"login_streak","value":100}', 500)
ON CONFLICT DO NOTHING;

-- Done!
SELECT 'Ultra-Premium SNS Migration Complete!' as status;
