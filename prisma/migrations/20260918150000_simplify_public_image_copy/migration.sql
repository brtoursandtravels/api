-- Simplify customer-facing image descriptions without replacing package copy
-- edited in the admin panel. Keep internal sourceNotes and licenseNotes intact.
UPDATE `MediaAsset`
SET
  `altText` = CONCAT(
    UPPER(SUBSTRING(`altText`, CHAR_LENGTH('AI-generated illustration of ') + 1, 1)),
    SUBSTRING(`altText`, CHAR_LENGTH('AI-generated illustration of ') + 2)
  ),
  `updatedAt` = CURRENT_TIMESTAMP(3)
WHERE LEFT(`altText`, CHAR_LENGTH('AI-generated illustration of ')) = 'AI-generated illustration of ';

UPDATE `MediaAsset`
SET
  `caption` = REPLACE(
    REPLACE(`caption`, ' - AI-generated destination illustration', ''),
    ' - AI-generated illustration', ''
  ),
  `updatedAt` = CURRENT_TIMESTAMP(3)
WHERE `caption` LIKE '% - AI-generated destination illustration%'
   OR `caption` LIKE '% - AI-generated illustration%';

UPDATE `Package`
SET
  `importantInformation` = REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          `importantInformation`,
          'Gallery images are AI-generated destination illustrations, not photographs of the booked hotels or guaranteed views.',
          'Images are for reference only. Actual hotels and views may vary.'
        ),
        'Gallery images are existing AI-generated destination illustrations, not photographs of the booked accommodation or guaranteed views.',
        'Images are for reference only. Actual hotels and views may vary.'
      ),
      'Gallery images are AI-generated destination illustrations, not photographs of booked accommodation or guaranteed views.',
      'Images are for reference only. Actual hotels and views may vary.'
    ),
    'Gallery images are AI-generated destination illustrations, not photographs of booked hotels or guaranteed views.',
    'Images are for reference only. Actual hotels and views may vary.'
  ),
  `updatedAt` = CURRENT_TIMESTAMP(3)
WHERE `importantInformation` LIKE '%AI-generated destination illustrations%';
