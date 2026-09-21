-- Unfiltered admin lists order by timestamps; their existing status-prefixed
-- indexes cannot satisfy these sorts efficiently as the catalogue grows.
CREATE INDEX `Package_updatedAt_id_idx` ON `Package`(`updatedAt`, `id`);
CREATE INDEX `MediaAsset_createdAt_idx` ON `MediaAsset`(`createdAt`);
CREATE INDEX `GalleryAlbum_updatedAt_idx` ON `GalleryAlbum`(`updatedAt`);
CREATE INDEX `BlogPost_updatedAt_idx` ON `BlogPost`(`updatedAt`);
CREATE INDEX `NotificationOutbox_createdAt_idx` ON `NotificationOutbox`(`createdAt`);
