ALTER TABLE `ItineraryDay` ADD COLUMN `imageMediaId` VARCHAR(30) NULL;
CREATE INDEX `ItineraryDay_imageMediaId_idx` ON `ItineraryDay`(`imageMediaId`);
ALTER TABLE `ItineraryDay` ADD CONSTRAINT `ItineraryDay_imageMediaId_fkey` FOREIGN KEY (`imageMediaId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Departure` ADD COLUMN `seatsAvailable` INTEGER NULL, MODIFY `status` ENUM('SCHEDULED', 'FILLING_FAST', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'SCHEDULED';
CREATE TABLE `MediaContent` (`mediaAssetId` VARCHAR(30) NOT NULL, `bytes` LONGBLOB NOT NULL, PRIMARY KEY (`mediaAssetId`)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `MediaContent` ADD CONSTRAINT `MediaContent_mediaAssetId_fkey` FOREIGN KEY (`mediaAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
