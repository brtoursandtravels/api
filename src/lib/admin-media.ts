import { publicMediaUrl } from "./media-url.js";

export function mediaDto(record: {
  id: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: bigint;
  width: number | null;
  height: number | null;
  altText: string;
  caption: string | null;
  sourceNotes: string | null;
  licenseNotes: string | null;
  visibility: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: record.id,
    url: publicMediaUrl(record),
    originalName: record.originalName,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes.toString(),
    width: record.width,
    height: record.height,
    altText: record.altText,
    caption: record.caption,
    sourceNotes: record.sourceNotes,
    licenseNotes: record.licenseNotes,
    visibility: record.visibility,
    provider: record.provider,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
