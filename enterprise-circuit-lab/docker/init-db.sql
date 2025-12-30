-- Enterprise Circuit Lab Database Schema
-- PostgreSQL 16+ required for proper RBAC and audit features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- USERS & AUTHENTICATION
-- =============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- =============================================================================
-- ORGANIZATIONS & MEMBERSHIP
-- =============================================================================

CREATE TYPE org_role AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');

CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orgs_slug ON orgs(slug);

CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'VIEWER',
  invited_by UUID REFERENCES users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);

-- =============================================================================
-- PROJECTS & VERSIONS
-- =============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_compiled_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_projects_org_id ON projects(org_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

-- Project versions store full circuit state snapshots
CREATE TABLE project_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content_json JSONB NOT NULL, -- Full circuit state: components, wires, code
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  commit_message TEXT,
  UNIQUE(project_id, version)
);

CREATE INDEX idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX idx_project_versions_created_at ON project_versions(created_at DESC);
CREATE INDEX idx_project_versions_content_json ON project_versions USING GIN(content_json);

-- =============================================================================
-- COMPILATION JOBS
-- =============================================================================

CREATE TYPE compile_status AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'TIMEOUT');

CREATE TABLE compile_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_version_id UUID NOT NULL REFERENCES project_versions(id) ON DELETE CASCADE,
  status compile_status NOT NULL DEFAULT 'PENDING',
  log TEXT,
  error_message TEXT,
  -- Artifact URLs in MinIO
  artifact_url_hex TEXT, -- .hex file for AVR execution
  artifact_url_elf TEXT, -- .elf file for debugging
  artifact_url_map TEXT, -- .map file for memory analysis
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compile_jobs_project_version_id ON compile_jobs(project_version_id);
CREATE INDEX idx_compile_jobs_status ON compile_jobs(status);
CREATE INDEX idx_compile_jobs_created_at ON compile_jobs(created_at DESC);

-- =============================================================================
-- AUDIT LOGS
-- =============================================================================

CREATE TYPE audit_action AS ENUM (
  'USER_LOGIN',
  'USER_LOGOUT',
  'ORG_CREATE',
  'ORG_UPDATE',
  'ORG_DELETE',
  'ORG_MEMBER_ADD',
  'ORG_MEMBER_REMOVE',
  'ORG_MEMBER_ROLE_CHANGE',
  'PROJECT_CREATE',
  'PROJECT_UPDATE',
  'PROJECT_DELETE',
  'PROJECT_VERSION_CREATE',
  'COMPILE_START',
  'COMPILE_COMPLETE'
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES orgs(id) ON DELETE SET NULL,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  target_type VARCHAR(50), -- 'org', 'project', 'user', etc.
  target_id UUID,
  meta_json JSONB, -- Additional context (IP, user agent, changes, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_meta_json ON audit_logs USING GIN(meta_json);

-- =============================================================================
-- RATE LIMITING (for API throttling)
-- =============================================================================

CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX idx_rate_limits_user_id ON rate_limits(user_id);
CREATE INDEX idx_rate_limits_window_start ON rate_limits(window_start);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON orgs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check org membership
CREATE OR REPLACE FUNCTION has_org_access(
  p_user_id UUID,
  p_org_id UUID,
  p_min_role org_role DEFAULT 'VIEWER'
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role org_role;
BEGIN
  SELECT role INTO user_role
  FROM org_members
  WHERE user_id = p_user_id AND org_id = p_org_id;

  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Role hierarchy: OWNER > ADMIN > EDITOR > VIEWER
  RETURN CASE p_min_role
    WHEN 'VIEWER' THEN user_role IN ('VIEWER', 'EDITOR', 'ADMIN', 'OWNER')
    WHEN 'EDITOR' THEN user_role IN ('EDITOR', 'ADMIN', 'OWNER')
    WHEN 'ADMIN' THEN user_role IN ('ADMIN', 'OWNER')
    WHEN 'OWNER' THEN user_role = 'OWNER'
  END;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================================
-- SEED DATA (for development)
-- =============================================================================

-- Create demo user
INSERT INTO users (email, password_hash, name, email_verified) VALUES
  ('demo@circuitlab.dev', crypt('demo123', gen_salt('bf')), 'Demo User', TRUE);

-- Create demo org
INSERT INTO orgs (name, slug, description) VALUES
  ('Demo Organization', 'demo-org', 'Demonstration organization for Circuit Lab');

-- Add demo user as org owner
INSERT INTO org_members (org_id, user_id, role)
SELECT o.id, u.id, 'OWNER'
FROM orgs o, users u
WHERE o.slug = 'demo-org' AND u.email = 'demo@circuitlab.dev';

-- Create demo project
INSERT INTO projects (org_id, name, description, created_by)
SELECT o.id, 'Blink Example', 'Classic Arduino blink sketch', u.id
FROM orgs o, users u
WHERE o.slug = 'demo-org' AND u.email = 'demo@circuitlab.dev';

-- Create initial version
INSERT INTO project_versions (project_id, version, content_json, created_by, commit_message)
SELECT p.id, 1, '{
  "components": [
    {"id": "arduino-1", "type": "arduino-uno", "x": 100, "y": 100, "rotation": 0},
    {"id": "led-1", "type": "led", "x": 400, "y": 100, "rotation": 0, "color": "red"}
  ],
  "wires": [
    {"id": "wire-1", "from": {"componentId": "arduino-1", "pin": "D13"}, "to": {"componentId": "led-1", "pin": "anode"}, "color": "#FF0000"},
    {"id": "wire-2", "from": {"componentId": "led-1", "pin": "cathode"}, "to": {"componentId": "arduino-1", "pin": "GND"}, "color": "#000000"}
  ],
  "code": "void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}"
}'::jsonb, u.id, 'Initial blink example'
FROM projects p, users u
WHERE p.name = 'Blink Example' AND u.email = 'demo@circuitlab.dev';

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- User's organizations with role
CREATE VIEW user_orgs AS
SELECT
  u.id AS user_id,
  o.id AS org_id,
  o.name AS org_name,
  o.slug AS org_slug,
  om.role,
  om.joined_at
FROM users u
JOIN org_members om ON u.id = om.user_id
JOIN orgs o ON om.org_id = o.id;

-- Project list with latest version
CREATE VIEW projects_with_latest_version AS
SELECT
  p.*,
  pv.version AS latest_version,
  pv.created_at AS latest_version_created_at,
  pv.created_by AS latest_version_created_by
FROM projects p
LEFT JOIN LATERAL (
  SELECT * FROM project_versions
  WHERE project_id = p.id
  ORDER BY version DESC
  LIMIT 1
) pv ON TRUE;

-- Compile job statistics per project
CREATE VIEW project_compile_stats AS
SELECT
  pv.project_id,
  COUNT(*) AS total_compiles,
  COUNT(*) FILTER (WHERE cj.status = 'SUCCESS') AS successful_compiles,
  COUNT(*) FILTER (WHERE cj.status = 'FAILED') AS failed_compiles,
  AVG(cj.duration_ms) FILTER (WHERE cj.status = 'SUCCESS') AS avg_compile_time_ms
FROM compile_jobs cj
JOIN project_versions pv ON cj.project_version_id = pv.id
GROUP BY pv.project_id;

COMMENT ON DATABASE circuitlab IS 'Enterprise Circuit Lab - Tinkercad-class Arduino simulator with WebGL rendering, real compilation, and RBAC';
