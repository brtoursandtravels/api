-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(30) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `displayName` VARCHAR(120) NOT NULL,
    `publicName` VARCHAR(120) NULL,
    `publicBio` TEXT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'CONTENT_EDITOR', 'SALES_AGENT') NOT NULL,
    `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    INDEX `AdminUser_role_status_idx`(`role`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(30) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `lastSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ipHash` CHAR(64) NULL,
    `userAgent` VARCHAR(512) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Session_tokenHash_key`(`tokenHash`),
    INDEX `Session_userId_expiresAt_idx`(`userId`, `expiresAt`),
    INDEX `Session_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(30) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordResetToken_userId_expiresAt_idx`(`userId`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Destination` (
    `id` VARCHAR(30) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `summary` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Destination_slug_key`(`slug`),
    INDEX `Destination_status_publishedAt_isDemo_idx`(`status`, `publishedAt`, `isDemo`),
    INDEX `Destination_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(30) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_status_publishedAt_isDemo_idx`(`status`, `publishedAt`, `isDemo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Package` (
    `id` VARCHAR(30) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `summary` VARCHAR(500) NOT NULL,
    `overview` TEXT NOT NULL,
    `days` INTEGER NOT NULL,
    `nights` INTEGER NOT NULL,
    `startingCity` VARCHAR(160) NULL,
    `basePrice` DECIMAL(12, 2) NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `priceBasis` ENUM('PER_PERSON', 'PER_GROUP', 'PER_ROOM', 'ON_REQUEST') NOT NULL DEFAULT 'ON_REQUEST',
    `highlights` JSON NOT NULL,
    `inclusions` JSON NOT NULL,
    `exclusions` JSON NOT NULL,
    `transportInformation` TEXT NULL,
    `accommodationNotes` TEXT NULL,
    `importantInformation` TEXT NULL,
    `cancellationRules` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `featuredOrder` INTEGER NULL,
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Package_slug_key`(`slug`),
    INDEX `Package_status_publishedAt_isDemo_idx`(`status`, `publishedAt`, `isDemo`),
    INDEX `Package_isFeatured_featuredOrder_idx`(`isFeatured`, `featuredOrder`),
    INDEX `Package_days_idx`(`days`),
    INDEX `Package_startingCity_idx`(`startingCity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageDestination` (
    `packageId` VARCHAR(30) NOT NULL,
    `destinationId` VARCHAR(30) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `PackageDestination_destinationId_packageId_idx`(`destinationId`, `packageId`),
    PRIMARY KEY (`packageId`, `destinationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageCategory` (
    `packageId` VARCHAR(30) NOT NULL,
    `categoryId` VARCHAR(30) NOT NULL,

    INDEX `PackageCategory_categoryId_packageId_idx`(`categoryId`, `packageId`),
    PRIMARY KEY (`packageId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItineraryDay` (
    `id` VARCHAR(30) NOT NULL,
    `packageId` VARCHAR(30) NOT NULL,
    `dayNumber` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `activities` JSON NULL,
    `meals` VARCHAR(200) NULL,
    `accommodation` VARCHAR(255) NULL,

    INDEX `ItineraryDay_packageId_dayNumber_idx`(`packageId`, `dayNumber`),
    UNIQUE INDEX `ItineraryDay_packageId_dayNumber_key`(`packageId`, `dayNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Departure` (
    `id` VARCHAR(30) NOT NULL,
    `packageId` VARCHAR(30) NOT NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE NOT NULL,
    `pricePerPerson` DECIMAL(12, 2) NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `status` ENUM('SCHEDULED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'SCHEDULED',
    `note` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Departure_status_startDate_idx`(`status`, `startDate`),
    UNIQUE INDEX `Departure_packageId_startDate_key`(`packageId`, `startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAsset` (
    `id` VARCHAR(30) NOT NULL,
    `storageKey` VARCHAR(512) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `sizeBytes` BIGINT NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `altText` VARCHAR(300) NOT NULL,
    `caption` VARCHAR(500) NULL,
    `sourceNotes` TEXT NULL,
    `licenseNotes` TEXT NULL,
    `visibility` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PRIVATE',
    `provider` ENUM('LOCAL', 'S3_COMPATIBLE') NOT NULL DEFAULT 'LOCAL',
    `uploadedById` VARCHAR(30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MediaAsset_storageKey_key`(`storageKey`),
    INDEX `MediaAsset_visibility_createdAt_idx`(`visibility`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageMedia` (
    `packageId` VARCHAR(30) NOT NULL,
    `mediaAssetId` VARCHAR(30) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isCover` BOOLEAN NOT NULL DEFAULT false,

    INDEX `PackageMedia_packageId_sortOrder_idx`(`packageId`, `sortOrder`),
    PRIMARY KEY (`packageId`, `mediaAssetId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GalleryAlbum` (
    `id` VARCHAR(30) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `destinationId` VARCHAR(30) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GalleryAlbum_slug_key`(`slug`),
    INDEX `GalleryAlbum_status_publishedAt_isDemo_idx`(`status`, `publishedAt`, `isDemo`),
    INDEX `GalleryAlbum_destinationId_idx`(`destinationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GalleryAlbumImage` (
    `albumId` VARCHAR(30) NOT NULL,
    `mediaAssetId` VARCHAR(30) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `GalleryAlbumImage_albumId_sortOrder_idx`(`albumId`, `sortOrder`),
    PRIMARY KEY (`albumId`, `mediaAssetId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogCategory` (
    `id` VARCHAR(30) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogCategory_slug_key`(`slug`),
    INDEX `BlogCategory_status_publishedAt_isDemo_idx`(`status`, `publishedAt`, `isDemo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPost` (
    `id` VARCHAR(30) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `title` VARCHAR(220) NOT NULL,
    `excerpt` VARCHAR(500) NOT NULL,
    `contentHtml` LONGTEXT NOT NULL,
    `categoryId` VARCHAR(30) NULL,
    `coverMediaId` VARCHAR(30) NULL,
    `authorId` VARCHAR(30) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    INDEX `BlogPost_status_publishedAt_isDemo_idx`(`status`, `publishedAt`, `isDemo`),
    INDEX `BlogPost_categoryId_publishedAt_idx`(`categoryId`, `publishedAt`),
    INDEX `BlogPost_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(30) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Tag_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPostTag` (
    `postId` VARCHAR(30) NOT NULL,
    `tagId` VARCHAR(30) NOT NULL,

    INDEX `BlogPostTag_tagId_postId_idx`(`tagId`, `postId`),
    PRIMARY KEY (`postId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPostPackage` (
    `postId` VARCHAR(30) NOT NULL,
    `packageId` VARCHAR(30) NOT NULL,

    INDEX `BlogPostPackage_packageId_postId_idx`(`packageId`, `postId`),
    PRIMARY KEY (`postId`, `packageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContentPage` (
    `id` VARCHAR(30) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `title` VARCHAR(220) NOT NULL,
    `contentHtml` LONGTEXT NOT NULL,
    `seoTitle` VARCHAR(70) NULL,
    `seoDescription` VARCHAR(170) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `ownerReviewDue` BOOLEAN NOT NULL DEFAULT false,
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ContentPage_slug_key`(`slug`),
    INDEX `ContentPage_status_publishedAt_isDemo_idx`(`status`, `publishedAt`, `isDemo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomepageSection` (
    `id` VARCHAR(30) NOT NULL,
    `type` ENUM('HERO', 'DISCOVERY', 'FEATURED_PACKAGES', 'CATEGORIES', 'DESTINATIONS', 'INTRODUCTION', 'PLANNING_PROCESS', 'GALLERY', 'TESTIMONIALS', 'LATEST_BLOG', 'FAQS', 'CONTACT_CTA') NOT NULL,
    `title` VARCHAR(220) NULL,
    `content` JSON NOT NULL,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `HomepageSection_status_publishedAt_isVisible_sortOrder_idx`(`status`, `publishedAt`, `isVisible`, `sortOrder`),
    UNIQUE INDEX `HomepageSection_type_sortOrder_key`(`type`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `key` VARCHAR(120) NOT NULL,
    `value` JSON NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(500) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Setting_isPublic_idx`(`isPublic`),
    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NavigationMenu` (
    `id` VARCHAR(30) NOT NULL,
    `key` VARCHAR(80) NOT NULL,
    `label` VARCHAR(120) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NavigationMenu_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NavigationItem` (
    `id` VARCHAR(30) NOT NULL,
    `menuId` VARCHAR(30) NOT NULL,
    `parentId` VARCHAR(30) NULL,
    `label` VARCHAR(120) NOT NULL,
    `href` VARCHAR(500) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,

    INDEX `NavigationItem_menuId_sortOrder_idx`(`menuId`, `sortOrder`),
    INDEX `NavigationItem_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faq` (
    `id` VARCHAR(30) NOT NULL,
    `packageId` VARCHAR(30) NULL,
    `question` VARCHAR(300) NOT NULL,
    `answer` TEXT NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Faq_packageId_status_sortOrder_idx`(`packageId`, `status`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Testimonial` (
    `id` VARCHAR(30) NOT NULL,
    `publicName` VARCHAR(120) NOT NULL,
    `quote` TEXT NOT NULL,
    `consentNotes` TEXT NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Testimonial_approved_status_publishedAt_isDemo_idx`(`approved`, `status`, `publishedAt`, `isDemo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enquiry` (
    `id` VARCHAR(30) NOT NULL,
    `publicReference` VARCHAR(24) NOT NULL,
    `idempotencyKey` VARCHAR(128) NOT NULL,
    `payloadHash` CHAR(64) NOT NULL,
    `type` ENUM('GENERAL', 'PACKAGE_ENQUIRY', 'BOOKING_REQUEST') NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUOTED', 'CONFIRMED', 'CLOSED', 'LOST') NOT NULL DEFAULT 'NEW',
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `phone` VARCHAR(40) NULL,
    `subject` VARCHAR(200) NULL,
    `message` TEXT NOT NULL,
    `partySize` INTEGER NULL,
    `preferredStartDate` DATE NULL,
    `packageId` VARCHAR(30) NULL,
    `departureId` VARCHAR(30) NULL,
    `assignedToId` VARCHAR(30) NULL,
    `sourcePath` VARCHAR(500) NULL,
    `consentAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Enquiry_publicReference_key`(`publicReference`),
    UNIQUE INDEX `Enquiry_idempotencyKey_key`(`idempotencyKey`),
    INDEX `Enquiry_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Enquiry_assignedToId_status_idx`(`assignedToId`, `status`),
    INDEX `Enquiry_packageId_createdAt_idx`(`packageId`, `createdAt`),
    INDEX `Enquiry_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnquiryNote` (
    `id` VARCHAR(30) NOT NULL,
    `enquiryId` VARCHAR(30) NOT NULL,
    `authorId` VARCHAR(30) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EnquiryNote_enquiryId_createdAt_idx`(`enquiryId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnquiryStatusHistory` (
    `id` VARCHAR(30) NOT NULL,
    `enquiryId` VARCHAR(30) NOT NULL,
    `changedById` VARCHAR(30) NULL,
    `fromStatus` ENUM('NEW', 'CONTACTED', 'QUOTED', 'CONFIRMED', 'CLOSED', 'LOST') NULL,
    `toStatus` ENUM('NEW', 'CONTACTED', 'QUOTED', 'CONFIRMED', 'CLOSED', 'LOST') NOT NULL,
    `reason` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EnquiryStatusHistory_enquiryId_createdAt_idx`(`enquiryId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationOutbox` (
    `id` VARCHAR(30) NOT NULL,
    `enquiryId` VARCHAR(30) NULL,
    `eventType` VARCHAR(100) NOT NULL,
    `payload` JSON NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `nextAttemptAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lockedAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `lastError` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NotificationOutbox_status_nextAttemptAt_idx`(`status`, `nextAttemptAt`),
    INDEX `NotificationOutbox_enquiryId_idx`(`enquiryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(30) NOT NULL,
    `actorId` VARCHAR(30) NULL,
    `action` VARCHAR(120) NOT NULL,
    `entityType` VARCHAR(100) NOT NULL,
    `entityId` VARCHAR(64) NULL,
    `before` JSON NULL,
    `after` JSON NULL,
    `requestId` VARCHAR(64) NULL,
    `ipHash` CHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_entityType_entityId_createdAt_idx`(`entityType`, `entityId`, `createdAt`),
    INDEX `AuditLog_actorId_createdAt_idx`(`actorId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SlugRedirect` (
    `id` VARCHAR(30) NOT NULL,
    `entityType` VARCHAR(80) NOT NULL,
    `oldSlug` VARCHAR(180) NOT NULL,
    `targetSlug` VARCHAR(180) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SlugRedirect_entityType_targetSlug_isActive_idx`(`entityType`, `targetSlug`, `isActive`),
    UNIQUE INDEX `SlugRedirect_entityType_oldSlug_key`(`entityType`, `oldSlug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageDestination` ADD CONSTRAINT `PackageDestination_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageDestination` ADD CONSTRAINT `PackageDestination_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `Destination`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageCategory` ADD CONSTRAINT `PackageCategory_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageCategory` ADD CONSTRAINT `PackageCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItineraryDay` ADD CONSTRAINT `ItineraryDay_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Departure` ADD CONSTRAINT `Departure_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaAsset` ADD CONSTRAINT `MediaAsset_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageMedia` ADD CONSTRAINT `PackageMedia_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageMedia` ADD CONSTRAINT `PackageMedia_mediaAssetId_fkey` FOREIGN KEY (`mediaAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GalleryAlbum` ADD CONSTRAINT `GalleryAlbum_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `Destination`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GalleryAlbumImage` ADD CONSTRAINT `GalleryAlbumImage_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `GalleryAlbum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GalleryAlbumImage` ADD CONSTRAINT `GalleryAlbumImage_mediaAssetId_fkey` FOREIGN KEY (`mediaAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPost` ADD CONSTRAINT `BlogPost_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `BlogCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPost` ADD CONSTRAINT `BlogPost_coverMediaId_fkey` FOREIGN KEY (`coverMediaId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPostTag` ADD CONSTRAINT `BlogPostTag_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `BlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPostTag` ADD CONSTRAINT `BlogPostTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPostPackage` ADD CONSTRAINT `BlogPostPackage_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `BlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPostPackage` ADD CONSTRAINT `BlogPostPackage_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NavigationItem` ADD CONSTRAINT `NavigationItem_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `NavigationMenu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NavigationItem` ADD CONSTRAINT `NavigationItem_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `NavigationItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Faq` ADD CONSTRAINT `Faq_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enquiry` ADD CONSTRAINT `Enquiry_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enquiry` ADD CONSTRAINT `Enquiry_departureId_fkey` FOREIGN KEY (`departureId`) REFERENCES `Departure`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enquiry` ADD CONSTRAINT `Enquiry_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquiryNote` ADD CONSTRAINT `EnquiryNote_enquiryId_fkey` FOREIGN KEY (`enquiryId`) REFERENCES `Enquiry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquiryNote` ADD CONSTRAINT `EnquiryNote_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `AdminUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquiryStatusHistory` ADD CONSTRAINT `EnquiryStatusHistory_enquiryId_fkey` FOREIGN KEY (`enquiryId`) REFERENCES `Enquiry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquiryStatusHistory` ADD CONSTRAINT `EnquiryStatusHistory_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationOutbox` ADD CONSTRAINT `NotificationOutbox_enquiryId_fkey` FOREIGN KEY (`enquiryId`) REFERENCES `Enquiry`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
