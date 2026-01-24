-- Group all existing presentation files into "Arduino" folder
-- This updates ALL presentation files (regardless of current subcategory value)
UPDATE `resources`
SET `subcategory` = 'Arduino'
WHERE `category` = 'presentation';
