import { Router } from "express";
import { z } from "zod";
import { prisma } from "../database.js";
import type { Prisma } from "../generated/prisma/client.js";
import { recordActivity } from "../lib/activity-log.js";
import { HttpError } from "../lib/http-error.js";
import { optionalSession, requireAuth, requireCsrf, requireRole } from "../middleware/auth.js";

type Deletion = {
  path: string;
  entity: string;
  action: string;
  remove: (transaction: Prisma.TransactionClient, id: string) => Promise<Prisma.InputJsonObject>;
};

// Explicit routes and delegates: callers cannot choose arbitrary database tables.
const deletions: Deletion[] = [
  { path: "packages", entity: "Package", action: "PACKAGE_DELETED", remove: (tx, id) =>
    tx.package.delete({ where: { id }, select: { id: true, slug: true, title: true } }) },
  { path: "categories", entity: "Category", action: "CATEGORY_DELETED", remove: async (tx, id) => {
    await tx.packageCategory.deleteMany({ where: { categoryId: id } });
    return tx.category.delete({ where: { id }, select: { id: true, name: true } });
  } },
  { path: "destinations", entity: "Destination", action: "DESTINATION_DELETED", remove: async (tx, id) => {
    await tx.packageDestination.deleteMany({ where: { destinationId: id } });
    return tx.destination.delete({ where: { id }, select: { id: true, name: true } });
  } },
  { path: "pages", entity: "ContentPage", action: "PAGE_DELETED", remove: (tx, id) =>
    tx.contentPage.delete({ where: { id }, select: { id: true, slug: true, title: true } }) },
  { path: "blog/posts", entity: "BlogPost", action: "BLOG_POST_DELETED", remove: (tx, id) =>
    tx.blogPost.delete({ where: { id }, select: { id: true, slug: true, title: true } }) },
  { path: "blog/categories", entity: "BlogCategory", action: "BLOG_CATEGORY_DELETED", remove: (tx, id) =>
    tx.blogCategory.delete({ where: { id }, select: { id: true, name: true } }) },
  { path: "blog/tags", entity: "Tag", action: "BLOG_TAG_DELETED", remove: (tx, id) =>
    tx.tag.delete({ where: { id }, select: { id: true, name: true } }) },
  { path: "gallery/albums", entity: "GalleryAlbum", action: "GALLERY_ALBUM_DELETED", remove: (tx, id) =>
    tx.galleryAlbum.delete({ where: { id }, select: { id: true, slug: true, title: true } }) },
  { path: "home/sections", entity: "HomepageSection", action: "HOME_SECTION_DELETED", remove: (tx, id) =>
    tx.homepageSection.delete({ where: { id }, select: { id: true, title: true } }) },
  { path: "faqs", entity: "Faq", action: "FAQ_DELETED", remove: (tx, id) =>
    tx.faq.delete({ where: { id }, select: { id: true, question: true } }) },
  { path: "testimonials", entity: "Testimonial", action: "TESTIMONIAL_DELETED", remove: (tx, id) =>
    tx.testimonial.delete({ where: { id }, select: { id: true, publicName: true } }) },
  { path: "settings", entity: "Setting", action: "SETTING_DELETED", remove: (tx, key) =>
    // Do not put setting values, which can be private, into the audit log.
    tx.setting.delete({ where: { key }, select: { key: true, isPublic: true } }) },
  { path: "navigation", entity: "NavigationMenu", action: "MENU_DELETED", remove: (tx, key) =>
    tx.navigationMenu.delete({ where: { key }, select: { key: true, label: true } }) },
];

export const adminDeletionsRouter = Router();
adminDeletionsRouter.use(optionalSession, requireAuth, requireRole("SUPER_ADMIN", "CONTENT_EDITOR"));

for (const deletion of deletions) {
  adminDeletionsRouter.delete(`/${deletion.path}/:id/permanent`, requireCsrf, async (request, response) => {
    const id = z.string().min(1).max(deletion.path === "settings" ? 120 : deletion.path === "navigation" ? 80 : 30).parse(request.params.id);
    try {
      await prisma.$transaction(async (transaction) => {
        const before = await deletion.remove(transaction, id);
        // Setting/menu keys may exceed AuditLog.entityId's 64-character column;
        // the complete key remains in the selected `before` snapshot.
        await recordActivity(transaction, request, response, deletion.action, deletion.entity, id.slice(0, 64), { before });
      });
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
      if (code === "P2025") throw new HttpError(404, "RECORD_NOT_FOUND", "This entry has already been removed. Refresh the list.");
      if (code === "P2003") throw new HttpError(409, "RECORD_IN_USE", "This entry is still in use. Remove its links before deleting it.");
      throw error;
    }
    response.status(204).send();
  });
}
