import { z } from "zod";

export function socialUrlSchema(network: "instagram" | "facebook") {
  return z.string().trim().max(2048).refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      const domain = `${network}.com`;
      return url.protocol === "https:" && !url.username && !url.password &&
        (url.hostname === domain || url.hostname.endsWith(`.${domain}`));
    } catch {
      return false;
    }
  }, `Use an HTTPS ${network}.com link, or leave blank to hide it.`);
}

export const socialLinksSchema = z.object({
  instagram: socialUrlSchema("instagram"),
  facebook: socialUrlSchema("facebook"),
}).strict();
