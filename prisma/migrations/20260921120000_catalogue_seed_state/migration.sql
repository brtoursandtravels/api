CREATE TABLE `CatalogueSeedState` (
    `key` VARCHAR(80) NOT NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Existing catalogues are already initialized; do not refill deleted/renamed entries.
INSERT INTO `CatalogueSeedState` (`key`)
SELECT 'initial-catalogue' WHERE EXISTS (SELECT 1 FROM `Package` LIMIT 1);
