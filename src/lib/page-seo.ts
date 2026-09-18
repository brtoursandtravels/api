import { z } from "zod";

export const staticSeoPages = [
  { key: "home", path: "/", label: "Home" },
  { key: "about-us", path: "/about-us", label: "About Us" },
  { key: "packages", path: "/packages", label: "Packages" },
  { key: "destinations", path: "/destinations", label: "Destinations" },
  { key: "gallery", path: "/gallery", label: "Gallery" },
  { key: "blog", path: "/blog", label: "Blog" },
  { key: "contact-us", path: "/contact-us", label: "Contact Us" },
  { key: "privacy", path: "/privacy", label: "Privacy" },
  { key: "terms", path: "/terms", label: "Terms" },
  { key: "cancellation-policy", path: "/cancellation-policy", label: "Cancellation Policy" },
] as const;

export const pageSeoSchema = z.object({
  metaTitle: z.string().trim().max(70),
  metaDescription: z.string().trim().max(170),
}).strict();

export const pageSeoKeySchema = z.string().refine(
  (key) => staticSeoPages.some((page) => key === `seo.pages.${page.key}`),
  "Choose a supported page from Page SEO.",
);
