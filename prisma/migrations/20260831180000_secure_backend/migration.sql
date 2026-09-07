-- AlterTable
ALTER TABLE `enquiry` ADD COLUMN `adultCount` INTEGER NULL,
    ADD COLUMN `budget` DECIMAL(12, 2) NULL,
    ADD COLUMN `childCount` INTEGER NULL,
    ADD COLUMN `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    ADD COLUMN `packageSlugSnapshot` VARCHAR(180) NULL,
    ADD COLUMN `packageTitleSnapshot` VARCHAR(200) NULL,
    ADD COLUMN `policyVersion` VARCHAR(64) NOT NULL DEFAULT 'development-v1',
    ADD COLUMN `sourceMetadata` JSON NULL;

-- CreateTable
CREATE TABLE `RateLimitBucket` (
    `key` VARCHAR(191) NOT NULL,
    `windowStartedAt` DATETIME(3) NOT NULL,
    `hits` INTEGER NOT NULL DEFAULT 0,
    `blockedUntil` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RateLimitBucket_updatedAt_idx`(`updatedAt`),
    INDEX `RateLimitBucket_blockedUntil_idx`(`blockedUntil`),
    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
