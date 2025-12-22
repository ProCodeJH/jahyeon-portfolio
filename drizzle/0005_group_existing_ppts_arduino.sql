-- Group all existing presentation files into "Arduino" folder
UPDATE `resources`
SET `subcategory` = 'Arduino'
WHERE `category` = 'presentation' AND (`subcategory` IS NULL OR `subcategory` = '');
