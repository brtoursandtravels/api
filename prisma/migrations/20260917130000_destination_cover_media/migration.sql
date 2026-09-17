-- Allow destination/place cards to use an image selected in the admin panel.
ALTER TABLE `Destination`
  ADD COLUMN `coverMediaId` VARCHAR(30) NULL;

CREATE INDEX `Destination_coverMediaId_idx` ON `Destination`(`coverMediaId`);

ALTER TABLE `Destination`
  ADD CONSTRAINT `Destination_coverMediaId_fkey`
  FOREIGN KEY (`coverMediaId`) REFERENCES `MediaAsset`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserve the current seeded destination artwork after deployment.
UPDATE `Destination` AS destination
INNER JOIN `MediaAsset` AS media
  ON media.`storageKey` = CONCAT(
    'seed/tours/',
    CASE destination.`slug`
      WHEN 'char-dham' THEN 'char-dham-kedarnath.webp'
      WHEN 'kashmir' THEN 'kashmir-dal-lake.webp'
      WHEN 'matheran' THEN 'matheran-monsoon.webp'
      WHEN 'rajasthan' THEN 'rajasthan-amber-fort.webp'
      WHEN 'jaisalmer' THEN 'jaisalmer-golden-fort.webp'
      ELSE ''
    END
  )
SET destination.`coverMediaId` = media.`id`
WHERE destination.`slug` IN (
  'char-dham',
  'kashmir',
  'matheran',
  'rajasthan',
  'jaisalmer'
);
