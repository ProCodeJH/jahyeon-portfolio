-- Notion Workspace Migration
-- Run this on your Neon database to create the notion_pages table

CREATE TABLE IF NOT EXISTS notion_pages (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id),
    parent_id INTEGER REFERENCES notion_pages(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Untitled',
    icon VARCHAR(10) DEFAULT '📄',
    cover_url TEXT,
    cover_key TEXT,
    content JSONB,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notion_pages_member_id ON notion_pages(member_id);
CREATE INDEX IF NOT EXISTS idx_notion_pages_parent_id ON notion_pages(parent_id);
CREATE INDEX IF NOT EXISTS idx_notion_pages_is_archived ON notion_pages(is_archived);
CREATE INDEX IF NOT EXISTS idx_notion_pages_is_favorite ON notion_pages(is_favorite);

-- Full-text search index on title
CREATE INDEX IF NOT EXISTS idx_notion_pages_title_gin ON notion_pages USING gin(to_tsvector('english', title));

-- JSON content search index (for Tiptap blocks)
CREATE INDEX IF NOT EXISTS idx_notion_pages_content ON notion_pages USING gin(content);
