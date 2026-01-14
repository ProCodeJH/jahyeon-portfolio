-- SQL Script to fix folder categories
-- Folders wrongly categorized as 'daily_life' that should be lecture materials

-- Update "C언어 문법 학습 예제 소스코드" folder to lecture_c
UPDATE folders 
SET category = 'lecture_c' 
WHERE name LIKE '%C언어%' AND category = 'daily_life';

-- Update "asd" folder to lecture_c (or delete if test folder)
UPDATE folders 
SET category = 'lecture_c' 
WHERE name = 'asd' AND category = 'daily_life';

-- Update "asdasd_fixed" folder to lecture_c 
UPDATE folders 
SET category = 'lecture_c' 
WHERE name LIKE '%asdasd%' AND category = 'daily_life';

-- Also update resources in these folders
UPDATE resources 
SET category = 'lecture_c' 
WHERE subcategory LIKE '%C언어%' AND category = 'daily_life';

UPDATE resources 
SET category = 'lecture_c' 
WHERE subcategory = 'asd' AND category = 'daily_life';

UPDATE resources 
SET category = 'lecture_c' 
WHERE subcategory LIKE '%asdasd%' AND category = 'daily_life';

-- Show current state
SELECT id, name, category FROM folders WHERE category = 'daily_life';
SELECT id, title, subcategory, category FROM resources WHERE category = 'daily_life';
