-- The dashboard filters the date range independently of enquiry status.
CREATE INDEX `Enquiry_createdAt_idx` ON `Enquiry`(`createdAt`);
