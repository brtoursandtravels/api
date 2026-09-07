import { env } from "../env.js";

export function publicMediaUrl(asset: { id: string; storageKey: string }) {
  const locator =
    process.env.VERCEL && asset.storageKey.startsWith("seed/")
      ? asset.storageKey
          .split("/")
          .map((segment) => encodeURIComponent(segment))
          .join("/")
      : asset.id;

  return `${env.MEDIA_PUBLIC_BASE_URL}/${locator}`;
}
