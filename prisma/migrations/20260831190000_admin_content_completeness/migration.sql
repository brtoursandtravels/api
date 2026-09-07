ALTER TABLE `Package`
  ADD COLUMN `seoTitle` VARCHAR(70) NULL,
  ADD COLUMN `seoDescription` VARCHAR(170) NULL,
  ADD COLUMN `brochureMediaId` VARCHAR(30) NULL;

CREATE INDEX `Package_brochureMediaId_idx` ON `Package`(`brochureMediaId`);

ALTER TABLE `Package`
  ADD CONSTRAINT `Package_brochureMediaId_fkey`
  FOREIGN KEY (`brochureMediaId`) REFERENCES `MediaAsset`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `BlogPost`
  ADD COLUMN `publicAuthorName` VARCHAR(120) NULL,
  ADD COLUMN `publicAuthorBio` VARCHAR(1000) NULL,
  ADD COLUMN `seoTitle` VARCHAR(70) NULL,
  ADD COLUMN `seoDescription` VARCHAR(170) NULL;

CREATE TABLE `BlogPostRelated` (
  `postId` VARCHAR(30) NOT NULL,
  `relatedPostId` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`postId`, `relatedPostId`),
  INDEX `BlogPostRelated_relatedPostId_postId_idx` (`relatedPostId`, `postId`),
  CONSTRAINT `BlogPostRelated_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `BlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `BlogPostRelated_relatedPostId_fkey` FOREIGN KEY (`relatedPostId`) REFERENCES `BlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
