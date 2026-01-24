-- ============================================
-- Migration: Add nested folders and certification data
-- Date: 2025-12-26
-- ============================================

-- Step 1: Add parentId column to folders table for nested folders
ALTER TABLE folders ADD COLUMN IF NOT EXISTS parent_id INTEGER;

-- Step 2: Ensure subcategory is varchar (if not already done)
DO $$
BEGIN
    -- Check if subcategory is not already varchar
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'resources'
        AND column_name = 'subcategory'
        AND data_type != 'character varying'
    ) THEN
        ALTER TABLE resources ALTER COLUMN subcategory DROP DEFAULT;
        ALTER TABLE resources ALTER COLUMN subcategory TYPE varchar(255) USING subcategory::text;
        ALTER TABLE resources ALTER COLUMN subcategory SET DEFAULT NULL;
    END IF;
END $$;

-- Step 3: Insert certification data
-- Clear existing certifications if you want to start fresh (optional - comment out if not needed)
-- TRUNCATE TABLE certifications RESTART IDENTITY CASCADE;

INSERT INTO certifications (title, issuer, issue_date, credential_id, credential_url, description, image_url, image_key, created_at, updated_at)
VALUES
  ('컴퓨터 OA 마스터', '대한상공회의소', '2024-01-01', '', '', 'Microsoft Office 전문가 자격증', '', '', NOW(), NOW()),
  ('ITQ 마스터', '한국생산성본부', '2024-01-01', '', '', 'IT 활용능력 자격증', '', '', NOW(), NOW()),
  ('컴활 1급', '대한상공회의소', '2024-01-01', '', '', '컴퓨터활용능력 1급', '', '', NOW(), NOW()),
  ('디지털정보활용능력 1급', '한국정보통신진흥협회', '2024-01-01', '', '', '디지털 정보 활용 능력 검정', '', '', NOW(), NOW()),
  ('SW 지도사', '한국SW교육협회', '2024-01-01', '', '', '소프트웨어 교육 지도사', '', '', NOW(), NOW()),
  ('소프트웨어교육지도사', '한국정보통신진흥협회', '2024-01-01', '', '', '소프트웨어 교육 전문가', '', '', NOW(), NOW()),
  ('코딩지도사 1급', '한국코딩교육협회', '2024-01-01', '', '', '코딩 교육 지도사 자격증', '', '', NOW(), NOW()),
  ('스마트 IT 컴퓨터 지도사', '한국IT교육협회', '2024-01-01', '', '', '스마트 IT 교육 전문가', '', '', NOW(), NOW()),
  ('AI 활용 지도사', '한국AI교육협회', '2024-01-01', '', '', 'AI 교육 및 활용 지도사', '', '', NOW(), NOW()),
  ('코딩활용능력 1급', '한국코딩능력평가원', '2024-01-01', '', '', '코딩 활용 능력 검정 1급', '', '', NOW(), NOW()),
  ('프로그래밍 기능사', '한국산업인력공단', '2024-01-01', '', '', '프로그래밍 기능사 자격증', '', '', NOW(), NOW()),
  ('파이썬 전문가', '한국정보통신진흥협회', '2024-01-01', '', '', 'Python Programming Expert', '', '', NOW(), NOW()),
  ('AICE Future', 'KT', '2024-01-01', '', '', 'AI Coding Essentials - Future', '', '', NOW(), NOW()),
  ('AI 활용능력 1급', '한국AI능력평가원', '2024-01-01', '', '', 'AI 활용 능력 검정 1급', '', '', NOW(), NOW()),
  ('리눅스 마스터 1급', '한국정보통신진흥협회', '2024-01-01', '', '', 'Linux Master Level 1', '', '', NOW(), NOW()),
  ('정보처리산업기사', '한국산업인력공단', '2024-01-01', '', '', '정보처리 산업기사', '', '', NOW(), NOW()),
  ('전자산업기사', '한국산업인력공단', '2024-01-01', '', '', '전자 산업기사', '', '', NOW(), NOW()),
  ('임베디드기사', '한국산업인력공단', '2024-01-01', '', '', '임베디드 시스템 기사', '', '', NOW(), NOW()),
  ('COS Pro C언어 1급', 'YBM', '2024-01-01', '', '', 'Coding Specialist Professional - C Language', '', '', NOW(), NOW()),
  ('MOS Expert', 'Microsoft', '2024-01-01', '', '', 'Microsoft Office Specialist Expert', '', '', NOW(), NOW()),
  ('워드프로세서', '대한상공회의소', '2024-01-01', '', '', '워드프로세서 자격증', '', '', NOW(), NOW()),
  ('사무자동화산업기사', '한국산업인력공단', '2024-01-01', '', '', '사무자동화 산업기사', '', '', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Step 4: Verification queries
SELECT 'Folders table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'folders'
ORDER BY ordinal_position;

SELECT 'Total certifications:' as info, COUNT(*) as count FROM certifications;
