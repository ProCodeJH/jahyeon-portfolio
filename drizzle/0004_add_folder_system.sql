-- Change subcategory from enum to varchar for flexible folder names
ALTER TABLE `resources` MODIFY `subcategory` varchar(255);
