-- Create members table for user registration
CREATE TABLE IF NOT EXISTS "members" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "age" INTEGER NOT NULL,
  "phone" VARCHAR(20) NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "academy_name" VARCHAR(100),
  "is_student" BOOLEAN DEFAULT FALSE,
  "phone_verified" BOOLEAN DEFAULT FALSE,
  "last_login_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for phone lookup
CREATE INDEX IF NOT EXISTS "idx_members_phone" ON "members" ("phone");
