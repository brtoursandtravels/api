-- Historical events remain unchanged; their unavailable request details stay NULL.
ALTER TABLE `AuditLog`
  ADD COLUMN `ipAddress` VARCHAR(45) NULL,
  ADD COLUMN `userAgent` VARCHAR(512) NULL,
  ADD COLUMN `actorName` VARCHAR(120) NULL,
  ADD COLUMN `actorEmail` VARCHAR(254) NULL,
  ADD COLUMN `actorRole` VARCHAR(40) NULL,
  ADD COLUMN `requestMethod` VARCHAR(10) NULL,
  ADD COLUMN `requestPath` VARCHAR(500) NULL;

CREATE INDEX `AuditLog_createdAt_id_idx` ON `AuditLog` (`createdAt`, `id`);
CREATE INDEX `AuditLog_action_createdAt_idx` ON `AuditLog` (`action`, `createdAt`);
CREATE INDEX `AuditLog_ipAddress_createdAt_idx` ON `AuditLog` (`ipAddress`, `createdAt`);
