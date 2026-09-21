import type { Prisma } from "../generated/prisma/client.js";

// Public DTOs never need upload checksums, private storage metadata or audit fields.
export const publicMediaSelect = {
  id: true, storageKey: true, mimeType: true, width: true, height: true,
  altText: true, caption: true, visibility: true,
} satisfies Prisma.MediaAssetSelect;
