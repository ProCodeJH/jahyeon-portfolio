-- Add parent_id column to folders table for nested folder support
ALTER TABLE "folders" ADD COLUMN "parent_id" integer;
