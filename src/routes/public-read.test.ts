import assert from "node:assert/strict";
import { once } from "node:events";
import { after, afterEach, beforeEach, mock, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";
import type { publicPackageCardSelect, publicPackageDetailSelect } from "../lib/packages.js";

// No real database, credentials or external writes are used by these tests.
Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_URL: "mysql://test:test@127.0.0.1:1/public_read_tests",
  PUBLIC_SITE_URL: "http://localhost",
  CORS_ALLOWED_ORIGINS: "http://localhost",
  SESSION_SECRET: "public-read-test-only-".repeat(8),
  SMTP_HOST: "localhost",
  SMTP_PORT: "1025",
  SMTP_FROM: "test@example.com",
  DEMO_MODE: "false",
});
delete process.env.VERCEL;

const { prisma } = await import("../database.js");
const { Prisma } = await import("../generated/prisma/client.js");
const { packageDetailResponseSchema } = await import("../contracts.js");
const { packageRouter } = await import("./packages.js");
const { publicContentRouter } = await import("./public-content.js");
const app = express();
app.use("/api/v1/packages", packageRouter);
app.use("/api/v1", publicContentRouter);
const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  response.status(error.status ?? 500).json({ code: error.code });
};
app.use(errorHandler);
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
assert.ok(address && typeof address !== "string");
const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
const restorers: Array<() => void> = [];

function stub(target: object, key: string, implementation: (...args: never[]) => unknown) {
  // Prisma delegate functions are provided by a Proxy, not ordinary methods.
  const original = Reflect.get(target, key);
  const replacement = mock.fn(implementation);
  Object.defineProperty(target, key, { value: replacement, configurable: true, writable: true });
  restorers.push(() => {
    Object.defineProperty(target, key, { value: original, configurable: true, writable: true });
  });
  return replacement;
}

let transactionCalls = 0;
beforeEach(() => {
  transactionCalls = 0;
  stub(prisma, "$transaction", async () => {
    transactionCalls += 1;
    throw Object.assign(new Error("Unable to start a transaction in the given time."), { code: "P2028" });
  });
});
afterEach(() => {
  restorers.splice(0).reverse().forEach((restore) => restore());
  mock.restoreAll();
});
after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  await prisma.$disconnect();
});

function request(path: string) {
  return fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(5000) });
}

for (const [path, delegate] of [
  ["/packages", prisma.package],
  ["/gallery/albums", prisma.galleryAlbum],
  ["/blog", prisma.blogPost],
] as const) {
  test(`${path} keeps pagination/publication filters without acquiring a transaction`, async () => {
    const count = stub(delegate, "count", async () => 28);
    const find = stub(delegate, "findMany", async () => []);
    const response = await request(`${path}?page=2&pageSize=6`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { data: [], meta: { page: 2, pageSize: 6, total: 28 } });
    assert.equal(transactionCalls, 0);
    assert.equal(count.mock.callCount(), 1);
    assert.equal(find.mock.callCount(), 1);
    const countArgs = count.mock.calls[0]!.arguments[0] as unknown as { where: object };
    const findArgs = find.mock.calls[0]!.arguments[0] as unknown as {
      where: { status: string; isDemo: boolean; publishedAt: { not: null; lte: Date } };
      skip: number; take: number;
    };
    assert.deepEqual(countArgs.where, findArgs.where);
    assert.equal(findArgs.where.status, "PUBLISHED");
    assert.equal(findArgs.where.isDemo, false);
    assert.equal(findArgs.where.publishedAt.not, null);
    assert.ok(findArgs.where.publishedAt.lte instanceof Date);
    assert.equal(findArgs.skip, 6);
    assert.equal(findArgs.take, 6);
  });
}

test("site settings do not query dynamic navigation or require a transaction", async () => {
  stub(prisma.setting, "findMany", async () => [{ key: "site.name", value: "BR Travels" }]);
  const navigation = stub(prisma.navigationMenu, "findMany", async () => { throw new Error("Navigation is static"); });
  const response = await request("/site");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { data: { settings: { "site.name": "BR Travels" }, menus: [] } });
  assert.equal(transactionCalls, 0);
  assert.equal(navigation.mock.callCount(), 0);
  assert.equal(response.headers.get("cache-control"), "public, max-age=0, s-maxage=30, must-revalidate");
});

test("testimonials return every approved published real story in display order", async () => {
  const records = Array.from({ length: 9 }, (_, index) => ({
    id: `story-${index + 1}`,
    publicName: `Traveller ${index + 1}`,
    location: "Ahmedabad",
    tripName: `Journey ${index + 1}`,
    quote: `A memorable journey number ${index + 1}.`,
    rating: 5,
    sortOrder: index,
    isDemo: false,
  }));
  stub(prisma.testimonial, "findMany", async ({ where, orderBy }: {
    where: { status: string; publishedAt: { not: null; lte: Date }; approved: boolean; isDemo: boolean };
    orderBy: { sortOrder: string };
  }) => {
    assert.equal(where.status, "PUBLISHED");
    assert.equal(where.approved, true);
    assert.equal(where.isDemo, false);
    assert.equal(where.publishedAt.not, null);
    assert.ok(where.publishedAt.lte instanceof Date);
    assert.deepEqual(orderBy, { sortOrder: "asc" });
    return records;
  });
  const response = await request("/testimonials");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.data.length, 9);
  assert.deepEqual(body.data.map((item: { publicName: string }) => item.publicName), records.map(item => item.publicName));
  assert.equal(transactionCalls, 0);
});

test("concurrent public page reads never acquire a database transaction", async () => {
  for (const delegate of [prisma.package, prisma.galleryAlbum, prisma.blogPost]) {
    stub(delegate, "count", async () => 0);
    stub(delegate, "findMany", async () => []);
  }
  stub(prisma.setting, "findMany", async () => []);
  stub(prisma.navigationMenu, "findMany", async () => []);
  const paths = ["/packages", "/gallery/albums", "/blog", "/site"];
  const responses = await Promise.all(Array.from({ length: 12 }, (_, index) => request(paths[index % paths.length]!)));
  assert.ok(responses.every((response) => response.status === 200));
  await Promise.all(responses.map((response) => response.json()));
  assert.equal(transactionCalls, 0);
});

function card(overrides: Record<string, unknown> = {}) {
  return {
    id: "tour-1", slug: "test-tour", title: "Test tour", summary: "A published tour",
    days: 3, nights: 2, startingCity: "Mumbai", basePrice: new Prisma.Decimal(100),
    currency: "INR", priceBasis: "PER_PERSON", highlights: ["Guide included"], isDemo: false,
    destinations: [{ destinationId: "destination-1", destination: { slug: "goa", name: "Goa" } }],
    categories: [], media: [],
    departures: [{ status: "SCHEDULED", startDate: new Date("2099-01-01"), pricePerPerson: new Prisma.Decimal(80) }],
    ...overrides,
  };
}

test("package cards fetch one public cover, upcoming prices and no itinerary", async () => {
  stub(prisma.package, "count", async () => 1);
  stub(prisma.package, "findMany", async ({ select }: { select: ReturnType<typeof publicPackageCardSelect> }) => {
    assert.equal("overview" in select, false);
    assert.equal("itineraryDays" in select, false);
    assert.equal(select.media.take, 1);
    assert.deepEqual(select.media.orderBy, [{ isCover: "desc" }, { sortOrder: "asc" }]);
    assert.equal(select.media.where.mediaAsset.visibility, "PUBLIC");
    assert.deepEqual(select.departures.where.status, { in: ["SCHEDULED", "FILLING_FAST"] });
    assert.ok(select.departures.where.startDate.gte instanceof Date);
    return [card()];
  });
  const response = await request("/packages");
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.equal(data[0].startingPrice.amount, "80.00");
  assert.deepEqual(data[0].destinations, [{ slug: "goa", name: "Goa" }]);
});

test("package details retain the itinerary, full gallery and brochure privacy", async () => {
  const image = { id: "image-1", storageKey: "photo.webp", mimeType: "image/webp", visibility: "PUBLIC", width: 800, height: 600, altText: "Beach", caption: null };
  stub(prisma.package, "findFirst", async ({ select }: { select: ReturnType<typeof publicPackageDetailSelect> }) => {
    assert.equal("take" in select.media, false);
    assert.ok(select.itineraryDays);
    assert.deepEqual(select.departures.where.status, { in: ["SCHEDULED", "FILLING_FAST"] });
    return card({
      overview: "Full overview", inclusions: ["Guide"], exclusions: ["Flights"],
      importantInformation: null, transportInformation: null, accommodationNotes: null,
      cancellationRules: null, seoTitle: null, seoDescription: null,
      brochureMedia: { id: "private-pdf", storageKey: "private.pdf", mimeType: "application/pdf", originalName: "Private.pdf", visibility: "PRIVATE" },
      itineraryDays: [{ dayNumber: 1, title: "Arrival", description: "Meet your guide", activities: ["Mountain walk"], meals: "Breakfast", accommodation: "Hill lodge", imageMedia: image }, { dayNumber: 2, title: "Return", description: "Return home", imageMedia: { ...image, visibility: "PRIVATE" } }],
      media: [{ mediaAsset: image }, { mediaAsset: { ...image, id: "image-2" } }],
      departures: [{ id: "departure-1", status: "FILLING_FAST", seatsAvailable: 4, startDate: new Date("2099-01-01"), endDate: new Date("2099-01-03"), currency: "INR", pricePerPerson: new Prisma.Decimal(80) }],
    });
  });
  stub(prisma.package, "findMany", async ({ where, select }: { where: { status: string }; select: { media: { take: number } } }) => {
    assert.equal(where.status, "PUBLISHED");
    assert.equal(select.media.take, 1);
    return [];
  });
  const response = await request("/packages/test-tour");
  assert.equal(response.status, 200);
  const { data } = packageDetailResponseSchema.parse(await response.json());
  assert.equal(data.media.length, 2);
  assert.equal(data.itinerary[0]?.title, "Arrival");
  assert.equal(data.itinerary[0]?.image?.id, "image-1");
  assert.deepEqual(data.itinerary[0]?.activities, ["Mountain walk"]);
  assert.equal(data.itinerary[0]?.meals, "Breakfast");
  assert.equal(data.itinerary[0]?.accommodation, "Hill lodge");
  assert.equal(data.itinerary[1]?.image, null);
  assert.equal(data.departures[0]?.status, "FILLING_FAST");
  assert.equal(data.departures[0]?.seatsAvailable, 4);
  assert.equal(data.brochure, null);
  assert.equal(data.departures[0]?.price?.amount, "80.00");
});

test("price filters hydrate only the selected page and preserve computed departure prices", async () => {
  let reads = 0;
  stub(prisma.package, "findMany", async ({ select, where }: { select: Record<string, unknown>; where: { id?: { in: string[] } } }) => {
    reads++;
    if (reads === 1) {
      assert.equal("media" in select, false);
      assert.equal("destinations" in select, false);
      return [card({ id: "expensive", basePrice: new Prisma.Decimal(200), departures: [] }),
        card({ id: "cheap", basePrice: new Prisma.Decimal(40), departures: [] }),
        card({ id: "request", priceBasis: "ON_REQUEST" }), card()];
    }
    assert.deepEqual(where.id, { in: ["tour-1"] });
    return [card()];
  });
  const response = await request("/packages?sort=price-asc&maxPrice=150&page=2&pageSize=1");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.meta, { page: 2, pageSize: 1, total: 2 });
  assert.equal(body.data[0].id, "tour-1");
  assert.equal(body.data[0].startingPrice.amount, "80.00");
  assert.equal(reads, 2);
});

test("gallery package filters stay in SQL and exclude unpublished packages and private images", async () => {
  stub(prisma.package, "findFirst", async () => { throw new Error("No preliminary package query should be needed"); });
  stub(prisma.galleryAlbum, "count", async () => 0);
  stub(prisma.galleryAlbum, "findMany", async ({ where, select }: {
    where: { destination: { slug: string; packages: { some: { package: { slug: string; status: string; isDemo: boolean } } } } };
    select: { images: { where: { mediaAsset: { visibility: string } }; take?: number } };
  }) => {
    assert.equal(where.destination.slug, "goa");
    assert.equal(where.destination.packages.some.package.slug, "test-tour");
    assert.equal(where.destination.packages.some.package.status, "PUBLISHED");
    assert.equal(where.destination.packages.some.package.isDemo, false);
    assert.equal(select.images.where.mediaAsset.visibility, "PUBLIC");
    assert.equal(select.images.take, undefined);
    return [];
  });
  assert.equal((await request("/gallery/albums?package=test-tour&destination=goa&includeImages=true")).status, 200);
});

test("gallery package options use published labels without loading card relations", async () => {
  stub(prisma.package, "findMany", async ({ where, select }: { where: { status: string; isDemo: boolean }; select: object }) => {
    assert.equal(where.status, "PUBLISHED");
    assert.equal(where.isDemo, false);
    assert.deepEqual(select, { slug: true, title: true });
    return [{ slug: "test-tour", title: "Test tour" }];
  });
  const response = await request("/package-options");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { data: [{ slug: "test-tour", title: "Test tour" }] });
});

test("blog pages keep reading time and private covers safe without retired author, tag or article data", async () => {
  stub(prisma.blogPost, "count", async () => 1);
  stub(prisma.blogPost, "findMany", async ({ select }: { select: Record<string, unknown> }) => {
    assert.equal("publicAuthorBio" in select, false);
    assert.equal("publicAuthorName" in select, false);
    assert.equal("seoDescription" in select, false);
    return [{ id: "post-1", slug: "story", title: "Story", excerpt: "Travel tips", contentHtml: `<p>${"word ".repeat(440)}</p>`,
      category: null, coverMedia: { visibility: "PRIVATE" }, publishedAt: new Date("2026-01-01"),
      publicAuthorName: "Author", relatedTours: [], isDemo: false }];
  });
  const response = await request("/blog");
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.equal(data[0].readingMinutes, 2);
  assert.equal(data[0].cover, null);
  assert.equal("contentHtml" in data[0], false);
  assert.equal(data[0].author, null);
  stub(prisma.blogPost, "findFirst", async ({ select }: { select: Record<string, unknown> }) => {
    for (const field of ["publicAuthorName", "publicAuthorBio", "tags", "relatedArticles"]) assert.equal(field in select, false);
    return { id: "post-1", slug: "story", title: "Story", excerpt: "Travel tips", contentHtml: "<p>Plan your next journey.</p>",
      category: null, coverMedia: { visibility: "PRIVATE" }, publishedAt: new Date("2026-01-01"),
      publicAuthorName: "Old author", publicAuthorBio: "Old biography", tags: [{ tag: { slug: "old", name: "Old tag" } }],
      relatedArticles: [{ relatedPost: { id: "old-article" } }], seoTitle: null, seoDescription: null,
      relatedTours: [{ package: { id: "tour", slug: "test-tour", title: "Test tour", summary: "A useful journey", days: 3, nights: 2 } }], isDemo: false };
  });
  const detail = await request("/blog/story");
  assert.equal(detail.status, 200);
  const article = (await detail.json()).data;
  assert.equal(article.author, null);
  assert.deepEqual(article.tags, []);
  assert.deepEqual(article.relatedArticles, []);
  assert.equal(article.relatedPackages[0].id, "tour");
  assert.equal(article.cover, null);
  assert.match(article.contentHtml, /Plan your next journey/);
});
