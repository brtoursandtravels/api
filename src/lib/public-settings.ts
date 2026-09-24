import { z } from "zod";

const phonePattern = /^\+?[\d\s().-]+$/;
function validPhone(value: string) {
  return phonePattern.test(value) && /^\d{7,15}$/.test(value.replace(/\D/g, ""));
}
function validWhatsApp(value: string) {
  if (validPhone(value)) return true;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    if (url.hostname === "wa.me") return /^\/\d{7,15}\/?$/.test(url.pathname);
    return url.hostname === "api.whatsapp.com" && url.pathname === "/send" && /^\d{7,15}$/.test(url.searchParams.get("phone") ?? "");
  } catch { return false; }
}
const textSchemas: Record<string, z.ZodType<string>> = {
  "contact.email": z.string().trim().max(254).refine(value => !value || z.email().safeParse(value).success, "Enter a valid email address."),
  "contact.phone": z.string().trim().max(40).refine(value => !value || validPhone(value), "Enter a phone number with 7–15 digits and its country code."),
  "contact.whatsapp": z.string().trim().max(2048).refine(value => !value || validWhatsApp(value), "Enter a phone number with its country code or a valid WhatsApp link."),
  "contact.address": z.string().trim().max(1000),
  "contact.openingHours": z.string().trim().max(200),
  "contact.mapUrl": z.string().trim().max(2048).refine(value => {
    if (!value) return true;
    try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
  }, "Enter a valid HTTPS map link."),
};

export function publicSettingValueSchema(key: string) {
  return Object.hasOwn(textSchemas, key) ? textSchemas[key] : undefined;
}
