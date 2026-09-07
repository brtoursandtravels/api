import argon2 from "argon2";
import { randomUUID } from "node:crypto";
import request from "supertest";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "./app.js";
import { prisma } from "./database.js";
import { env } from "./env.js";

const suffix = randomUUID().slice(0, 8);
const email = `cms-${suffix}@example.invalid`;
const password = "CMS-Integration-Password-2026!";
const originalSlug = `integration-tour-${suffix}`;
const updatedSlug = `integration-tour-updated-${suffix}`;
const pageSlug = `integration-page-${suffix}`;
const menuKey = `integration-menu-${suffix}`;
let agent: ReturnType<typeof request.agent>;
let csrf = "";
let userId = "";
let destinationId = "";
let categoryId = "";
let packageId = "";
let pageId = "";
let mediaId = "";
let brochureMediaId = "";

const packageInput = {
  slug: originalSlug,
  title: "Integration Test Journey",
  summary:
    "A clearly labelled integration test package for verifying the CMS workflow.",
  overview:
    "This integration-only package verifies real database publication and filtering behavior.",
  days: 4,
  nights: 3,
  startingCity: "Test City",
  basePrice: 12500,
  currency: "INR",
  priceBasis: "PER_PERSON",
  highlights: ["Integration highlight"],
  inclusions: ["Test inclusion"],
  exclusions: ["Test exclusion"],
  status: "DRAFT",
  isFeatured: false,
  isDemo: false,
  destinationIds: [] as string[],
  categoryIds: [] as string[],
  itinerary: [
    {
      dayNumber: 1,
      title: "Arrival",
      description: "Integration itinerary detail.",
    },
  ],
  departures: [],
  media: [],
};

beforeAll(async () => {
  if (env.NODE_ENV !== "test" || !env.DATABASE_URL.endsWith("/br_tours_test")) {
    throw new Error(
      "CMS integration tests refuse to run outside br_tours_test.",
    );
  }
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const user = await prisma.adminUser.create({
    data: {
      email,
      displayName: "CMS Integration",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  userId = user.id;
  agent = request.agent(app);
  const preAuth = await agent.get("/api/v1/auth/csrf").expect(200);
  const login = await agent
    .post("/api/v1/auth/login")
    .set("x-csrf-token", preAuth.body.data.csrfToken)
    .send({ email, password })
    .expect(200);
  csrf = login.body.data.csrfToken;
});

describe("protected catalogue CMS and publication privacy", () => {
  it("creates taxonomy and a protected draft through authenticated APIs", async () => {
    const destination = await agent
      .post("/api/v1/admin/destinations")
      .set("x-csrf-token", csrf)
      .send({
        slug: `integration-destination-${suffix}`,
        name: "Integration Destination",
        description: "Test-only destination.",
        status: "PUBLISHED",
        sortOrder: 0,
        isDemo: false,
      })
      .expect(201);
    destinationId = destination.body.data.id;

    const category = await agent
      .post("/api/v1/admin/categories")
      .set("x-csrf-token", csrf)
      .send({
        slug: `integration-category-${suffix}`,
        name: "Integration Category",
        description: "Test-only category.",
        status: "PUBLISHED",
        sortOrder: 0,
        isDemo: false,
      })
      .expect(201);
    categoryId = category.body.data.id;

    packageInput.destinationIds = [destinationId];
    packageInput.categoryIds = [categoryId];
    const created = await agent
      .post("/api/v1/admin/packages")
      .set("x-csrf-token", csrf)
      .send(packageInput)
      .expect(201);
    packageId = created.body.data.id;
    expect(created.body.data.status).toBe("DRAFT");
    await request(app).get(`/api/v1/packages/${originalSlug}`).expect(404);
  });

  it("publishes without a rebuild, applies server filters, and maintains an old-slug redirect", async () => {
    const published = await agent
      .put(`/api/v1/admin/packages/${packageId}`)
      .set("x-csrf-token", csrf)
      .send({ ...packageInput, slug: updatedSlug, status: "PUBLISHED" })
      .expect(200);
    expect(published.body.data.publishedAt).toBeTruthy();

    const listing = await request(app)
      .get("/api/v1/packages")
      .query({
        destination: `integration-destination-${suffix}`,
        category: `integration-category-${suffix}`,
        minPrice: 12000,
        maxPrice: 13000,
        sort: "price-asc",
      })
      .expect(200);
    expect(listing.body.data.map((item: { id: string }) => item.id)).toContain(
      packageId,
    );
    await request(app).get(`/api/v1/packages/${updatedSlug}`).expect(200);
    await request(app)
      .get(`/api/v1/packages/${originalSlug}`)
      .expect(308)
      .expect("location", `/api/v1/packages/${updatedSlug}`);
  });

  it("unpublishes immediately and keeps private data out of public responses", async () => {
    await agent
      .put(`/api/v1/admin/packages/${packageId}`)
      .set("x-csrf-token", csrf)
      .send({ ...packageInput, slug: updatedSlug, status: "DRAFT" })
      .expect(200);
    await request(app).get(`/api/v1/packages/${updatedSlug}`).expect(404);
    const me = await agent.get("/api/v1/auth/me").expect(200);
    expect(me.body.data.user).not.toHaveProperty("passwordHash");
  });
});

describe("rich content, uploads and account safety", () => {
  it("preserves validated two-level navigation relationships", async () => {
    const saved = await agent
      .put(`/api/v1/admin/navigation/${menuKey}`)
      .set("x-csrf-token", csrf)
      .send({
        label: "Integration Menu",
        items: [
          {
            key: "tours",
            label: "Tours",
            href: "/tours",
            sortOrder: 0,
            isVisible: true,
          },
          {
            key: "domestic",
            parentKey: "tours",
            label: "Domestic",
            href: "/tours/domestic",
            sortOrder: 1,
            isVisible: true,
          },
        ],
      })
      .expect(200);
    const parent = saved.body.data.items.find(
      (item: { label: string }) => item.label === "Tours",
    );
    const child = saved.body.data.items.find(
      (item: { label: string }) => item.label === "Domestic",
    );
    expect(child.parentId).toBe(parent.id);

    await agent
      .put(`/api/v1/admin/navigation/${menuKey}`)
      .set("x-csrf-token", csrf)
      .send({
        label: "Invalid Menu",
        items: [
          {
            key: "orphan",
            parentKey: "missing",
            label: "Orphan",
            href: "/orphan",
            sortOrder: 0,
            isVisible: true,
          },
        ],
      })
      .expect(400);
  });

  it("sanitizes stored rich content before publishing it", async () => {
    const malicious =
      '<p>Safe integration page content.</p><script>alert(1)</script><a href="javascript:alert(2)">bad link</a>';
    const created = await agent
      .post("/api/v1/admin/pages")
      .set("x-csrf-token", csrf)
      .send({
        slug: pageSlug,
        title: "Integration Page",
        contentHtml: malicious,
        status: "PUBLISHED",
        ownerReviewDue: true,
        isDemo: false,
      })
      .expect(201);
    pageId = created.body.data.id;
    const publicPage = await request(app)
      .get(`/api/v1/pages/${pageSlug}`)
      .expect(200);
    expect(publicPage.body.data.contentHtml).toContain(
      "Safe integration page content",
    );
    expect(publicPage.body.data.contentHtml).not.toMatch(
      /<script|javascript:/i,
    );
  });

  it("rejects active SVG uploads at the actual upload boundary", async () => {
    await agent
      .post("/api/v1/admin/media")
      .set("x-csrf-token", csrf)
      .field("altText", "Unsafe integration SVG")
      .field("visibility", "PRIVATE")
      .attach(
        "file",
        Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
        ),
        {
          filename: "unsafe.svg",
          contentType: "image/svg+xml",
        },
      )
      .expect(415)
      .expect(({ body }) => expect(body.error.code).toBe("MEDIA_TYPE_INVALID"));
  });

  it("re-encodes a valid raster image, protects private delivery, then serves an explicitly public asset", async () => {
    const png = await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 4,
        background: { r: 13, g: 59, b: 56, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    const uploaded = await agent
      .post("/api/v1/admin/media")
      .set("x-csrf-token", csrf)
      .field("altText", "Integration color square")
      .field("visibility", "PRIVATE")
      .attach("file", png, {
        filename: "fixture.png",
        contentType: "image/png",
      })
      .expect(201);
    mediaId = uploaded.body.data.id;
    expect(uploaded.body.data.mimeType).toBe("image/webp");
    expect(uploaded.body.data).toEqual(
      expect.objectContaining({ width: 64, height: 64, visibility: "PRIVATE" }),
    );
    await request(app).get(`/media/${mediaId}`).expect(404);

    await agent
      .patch(`/api/v1/admin/media/${mediaId}`)
      .set("x-csrf-token", csrf)
      .send({ altText: "Integration color square", visibility: "PUBLIC" })
      .expect(200);
    await request(app)
      .get(`/media/${mediaId}`)
      .expect(200)
      .expect("content-type", /image\/webp/);

    await agent
      .delete(`/api/v1/admin/media/${mediaId}`)
      .set("x-csrf-token", csrf)
      .expect(204);
    mediaId = "";
  });

  it("stores PDF brochures as downloads, exposes SEO publicly, and protects in-use files", async () => {
    const pdf = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n",
    );
    const uploaded = await agent
      .post("/api/v1/admin/media")
      .set("x-csrf-token", csrf)
      .field("altText", "Integration package brochure")
      .field("visibility", "PRIVATE")
      .attach("file", pdf, {
        filename: "integration-brochure.pdf",
        contentType: "application/pdf",
      })
      .expect(201);
    brochureMediaId = uploaded.body.data.id;
    expect(uploaded.body.data).toEqual(
      expect.objectContaining({
        mimeType: "application/pdf",
        width: null,
        height: null,
      }),
    );
    await agent
      .get(`/api/v1/admin/media/${brochureMediaId}/file`)
      .expect(200)
      .expect("content-type", /application\/pdf/)
      .expect("content-disposition", /attachment/)
      .expect("x-content-type-options", "nosniff");

    await agent
      .put(`/api/v1/admin/packages/${packageId}`)
      .set("x-csrf-token", csrf)
      .send({
        ...packageInput,
        slug: updatedSlug,
        brochureMediaId,
        seoTitle: "Integration Journey SEO",
        seoDescription:
          "A test-only search description for the integration journey.",
      })
      .expect(200);
    await agent
      .delete(`/api/v1/admin/media/${brochureMediaId}`)
      .set("x-csrf-token", csrf)
      .expect(409)
      .expect(({ body }) => expect(body.error.code).toBe("MEDIA_IN_USE"));

    await agent
      .patch(`/api/v1/admin/media/${brochureMediaId}`)
      .set("x-csrf-token", csrf)
      .send({
        altText: "Integration package brochure",
        visibility: "PUBLIC",
      })
      .expect(200);
    await agent
      .put(`/api/v1/admin/packages/${packageId}`)
      .set("x-csrf-token", csrf)
      .send({
        ...packageInput,
        slug: updatedSlug,
        status: "PUBLISHED",
        brochureMediaId,
        seoTitle: "Integration Journey SEO",
        seoDescription:
          "A test-only search description for the integration journey.",
      })
      .expect(200);
    const publicPackage = await request(app)
      .get(`/api/v1/packages/${updatedSlug}`)
      .expect(200);
    expect(publicPackage.body.data).toEqual(
      expect.objectContaining({
        seo: {
          title: "Integration Journey SEO",
          description:
            "A test-only search description for the integration journey.",
        },
        brochure: expect.objectContaining({
          id: brochureMediaId,
          mimeType: "application/pdf",
        }),
      }),
    );
    await request(app)
      .get(`/media/${brochureMediaId}`)
      .expect(200)
      .expect("content-disposition", /attachment/);

    await agent
      .put(`/api/v1/admin/packages/${packageId}`)
      .set("x-csrf-token", csrf)
      .send({ ...packageInput, slug: updatedSlug, brochureMediaId: null })
      .expect(200);
    await agent
      .delete(`/api/v1/admin/media/${brochureMediaId}`)
      .set("x-csrf-token", csrf)
      .expect(204);
    brochureMediaId = "";
  });

  it("protects the last active Super Admin", async () => {
    const otherActiveAdmins = await prisma.adminUser.findMany({
      where: {
        id: { not: userId },
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
      select: { id: true },
    });
    await prisma.adminUser.updateMany({
      where: { id: { in: otherActiveAdmins.map((item) => item.id) } },
      data: { status: "DISABLED" },
    });
    const response = await agent
      .put(`/api/v1/admin/users/${userId}`)
      .set("x-csrf-token", csrf)
      .send({
        displayName: "CMS Integration",
        role: "CONTENT_EDITOR",
        status: "ACTIVE",
      });
    await prisma.adminUser.updateMany({
      where: { id: { in: otherActiveAdmins.map((item) => item.id) } },
      data: { status: "ACTIVE" },
    });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("LAST_SUPER_ADMIN");
  });
});

afterAll(async () => {
  if (packageId)
    await prisma.package
      .delete({ where: { id: packageId } })
      .catch(() => undefined);
  if (brochureMediaId) {
    await agent
      .delete(`/api/v1/admin/media/${brochureMediaId}`)
      .set("x-csrf-token", csrf)
      .catch(() => undefined);
  }
  if (pageId)
    await prisma.contentPage
      .delete({ where: { id: pageId } })
      .catch(() => undefined);
  await prisma.navigationMenu.deleteMany({ where: { key: menuKey } });
  await prisma.slugRedirect.deleteMany({
    where: {
      OR: [
        { oldSlug: originalSlug },
        { oldSlug: updatedSlug },
        { oldSlug: pageSlug },
      ],
    },
  });
  if (destinationId)
    await prisma.destination
      .delete({ where: { id: destinationId } })
      .catch(() => undefined);
  if (categoryId)
    await prisma.category
      .delete({ where: { id: categoryId } })
      .catch(() => undefined);
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.auditLog.deleteMany({ where: { actorId: userId } });
  await prisma.adminUser.deleteMany({ where: { id: userId } });
  await prisma.rateLimitBucket.deleteMany();
  await prisma.$disconnect();
});
