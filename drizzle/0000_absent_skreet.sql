CREATE TYPE "public"."category" AS ENUM('c_lang', 'arduino', 'python', 'embedded', 'iot', 'firmware', 'hardware', 'software');--> statement-breakpoint
CREATE TYPE "public"."resource_category" AS ENUM('daily_life', 'lecture_c', 'lecture_arduino', 'lecture_python', 'presentation', 'lecture_materials', 'arduino_projects', 'c_projects', 'python_projects');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."subcategory" AS ENUM('code', 'documentation', 'images', 'ppt', 'video');--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"issuer" varchar(255) NOT NULL,
	"issue_date" varchar(50) NOT NULL,
	"expiry_date" varchar(50),
	"credential_id" varchar(255),
	"credential_url" varchar(512),
	"image_url" text,
	"image_key" text,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"technologies" text NOT NULL,
	"image_url" text,
	"image_key" text,
	"video_url" text,
	"video_key" text,
	"thumbnail_url" text,
	"thumbnail_key" text,
	"project_url" varchar(512),
	"github_url" varchar(512),
	"category" "category" NOT NULL,
	"featured" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"file_url" text NOT NULL,
	"file_key" text,
	"file_name" varchar(255),
	"file_size" integer DEFAULT 0 NOT NULL,
	"mime_type" varchar(100),
	"category" "resource_category" NOT NULL,
	"subcategory" "subcategory",
	"thumbnail_url" text,
	"thumbnail_key" text,
	"download_count" integer DEFAULT 0 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"open_id" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"login_method" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_open_id_unique" UNIQUE("open_id")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;