import { config } from "dotenv";
import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { createOperationalPrisma } from "../scripts/lib/database.js";
import {
  tourDestinations,
  tourPackages,
  tourPackageMedia,
} from "./catalogue-data.js";

config({ path: ".env" });

const prisma = createOperationalPrisma();
const publishedAt = new Date();
const seedMediaRoot = path.resolve("prisma/assets/tours");
const publicMediaRoot = path.resolve("public/media/seed/tours");
const runtimeMediaRoot = path.resolve(
  process.env.MEDIA_ROOT ?? "./storage/media",
  "seed/tours",
);

const categories = [
  [
    "weekend",
    "Weekend",
    "Short, refreshing journeys designed around limited leave.",
  ],
  [
    "family",
    "Family",
    "Comfortable, flexible routes that work across generations.",
  ],
  [
    "adventure",
    "Adventure",
    "Active journeys shaped around terrain, season and traveller ability.",
  ],
  [
    "pilgrimage",
    "Pilgrimage",
    "Respectful spiritual routes with practical travel pacing.",
  ],
  [
    "group-travel",
    "Group travel",
    "Well-paced shared journeys for families, friends and private groups.",
  ],
] as const;

const sourceNotes =
  "Original project asset generated with the built-in OpenAI image-generation workflow for BR Tours and Travels.";
const licenseNotes =
  "Project-owned AI-generated visual. Review destination representation before production publication.";

function assertChildPath(root: string, target: string) {
  if (!target.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Unsafe catalogue seed target: ${target}`);
  }
}

async function copySeedAsset(source: string, root: string, image: string) {
  const target = path.resolve(root, image);
  assertChildPath(root, target);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
}

async function syncCatalogueMedia() {
  const mediaByKey = new Map<string, string>();
  const assets = [
    ...tourDestinations.map((destination) => ({
      key: destination.slug,
      image: destination.image,
      altText: destination.altText,
      caption: `${destination.name} destination photography`,
      width: 1440,
      height: 900,
    })),
    {
      key: "main-tours",
      image: "main-tours-hero.webp",
      altText: "A winding Himalayan road at sunrise",
      caption: "BR Tours and Travels homepage journey landscape",
      width: 1600,
      height: 900,
    },
    ...Object.entries(tourPackageMedia).flatMap(([packageSlug, media]) =>
      media.map((asset, index) => ({
        key: `package:${packageSlug}:${index}`,
        image: asset.image,
        altText: asset.altText,
        caption: asset.caption,
        width: 1536,
        height: 960,
      })),
    ),
  ];

  for (const asset of assets) {
    const source = path.resolve(seedMediaRoot, asset.image);
    assertChildPath(seedMediaRoot, source);
    const file = await stat(source);
    await copySeedAsset(source, publicMediaRoot, asset.image);
    await copySeedAsset(source, runtimeMediaRoot, asset.image);

    const storageKey = `seed/tours/${asset.image}`;
    const record = await prisma.mediaAsset.upsert({
      where: { storageKey },
      update: {
        originalName: asset.image,
        mimeType: "image/webp",
        sizeBytes: BigInt(file.size),
        width: asset.width,
        height: asset.height,
        altText: asset.altText,
        caption: asset.caption,
        sourceNotes,
        licenseNotes,
        visibility: "PUBLIC",
        provider: "LOCAL",
      },
      create: {
        storageKey,
        originalName: asset.image,
        mimeType: "image/webp",
        sizeBytes: BigInt(file.size),
        width: asset.width,
        height: asset.height,
        altText: asset.altText,
        caption: asset.caption,
        sourceNotes,
        licenseNotes,
        visibility: "PUBLIC",
        provider: "LOCAL",
      },
    });
    mediaByKey.set(asset.key, record.id);
  }

  return mediaByKey;
}

async function ensureDestinationsAndCategories(mediaByKey: Map<string, string>) {
  for (const destination of tourDestinations) {
    await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: {},
      create: {
        slug: destination.slug,
        name: destination.name,
        summary: destination.summary,
        coverMediaId: mediaByKey.get(destination.slug),
        sortOrder: destination.sortOrder,
        status: "PUBLISHED",
        publishedAt,
        isDemo: false,
      },
    });
  }

  for (const [sortOrder, [slug, name, description]] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name,
        description,
        sortOrder,
        status: "PUBLISHED",
        publishedAt,
        isDemo: false,
      },
    });
  }
}

function packageDefaults(seed: (typeof tourPackages)[number]) {
  const days =
    "durationDays" in seed ? seed.durationDays : seed.itinerary.length;
  const inclusions =
    "inclusions" in seed
      ? [...seed.inclusions]
      : [
          "Accommodation and transport described in the confirmed quote",
          "Route planning and trip coordination",
          "Applicable sightseeing listed in the confirmed itinerary",
          "Pre-departure support",
        ];
  const exclusions =
    "exclusions" in seed
      ? [...seed.exclusions]
      : [
          "Air or rail tickets unless specifically quoted",
          "Personal expenses and optional activities",
          "Meals or services not listed in the confirmed quote",
          "Weather-related or authority-mandated changes",
        ];

  return {
    days,
    inclusions,
    exclusions,
    transportInformation:
      "transportInformation" in seed
        ? seed.transportInformation
        : "Vehicle type and pickup plan depend on final group size, route access and the confirmed quotation.",
    accommodationNotes:
      "accommodationNotes" in seed
        ? seed.accommodationNotes
        : "Stay category and room configuration are selected during enquiry and confirmed by property name before payment.",
    importantInformation:
      "importantInformation" in seed
        ? seed.importantInformation
        : "The displayed price is an indicative starting point, not live availability. Mountain, pilgrimage and weather-sensitive routes may change for safety or local authority requirements.",
  };
}

async function createMissingPackages(mediaByKey: Map<string, string>) {
  const destinationRows = await prisma.destination.findMany({
    where: { slug: { in: tourDestinations.map((item) => item.slug) } },
  });
  const categoryRows = await prisma.category.findMany({
    where: { slug: { in: categories.map(([slug]) => slug) } },
  });
  const destinationBySlug = new Map(
    destinationRows.map((row) => [row.slug, row.id]),
  );
  const categoryBySlug = new Map(
    categoryRows.map((row) => [row.slug, row.id]),
  );
  let created = 0;
  let preserved = 0;

  for (const seed of tourPackages) {
    const existing = await prisma.package.findUnique({
      where: { slug: seed.slug },
      select: { id: true },
    });
    if (existing) {
      preserved += 1;
      continue;
    }

    const destinationId = destinationBySlug.get(seed.destinationSlug);
    const categoryId = categoryBySlug.get(seed.categorySlug);
    if (!destinationId || !categoryId) {
      throw new Error(`Missing catalogue relation for package ${seed.slug}.`);
    }

    const defaults = packageDefaults(seed);
    const packageSpecificMedia = Object.entries(tourPackageMedia).find(
      ([packageSlug]) => packageSlug === seed.slug,
    )?.[1];
    const packageMediaIds = packageSpecificMedia
      ? packageSpecificMedia.map((_, mediaIndex) =>
          mediaByKey.get(`package:${seed.slug}:${mediaIndex}`),
        )
      : [mediaByKey.get(seed.destinationSlug)];

    await prisma.package.create({
      data: {
        slug: seed.slug,
        title: seed.title,
        summary: seed.summary,
        overview: seed.overview,
        days: defaults.days,
        nights: defaults.days - 1,
        startingCity: seed.startingCity,
        basePrice: seed.startingPrice,
        currency: "INR",
        priceBasis: "PER_PERSON",
        highlights: [...seed.highlights],
        inclusions: defaults.inclusions,
        exclusions: defaults.exclusions,
        transportInformation: defaults.transportInformation,
        accommodationNotes: defaults.accommodationNotes,
        importantInformation: defaults.importantInformation,
        cancellationRules:
          "cancellationRules" in seed
            ? seed.cancellationRules
            : "Cancellation terms depend on the confirmed suppliers and travel dates and are provided in writing with the final quotation.",
        seoTitle: `${seed.title} | BR Tours and Travels`.slice(0, 70),
        seoDescription: seed.summary.slice(0, 170),
        status: "PUBLISHED",
        publishedAt,
        isDemo: false,
        isFeatured: false,
        destinations: {
          create: { destinationId, sortOrder: 1 },
        },
        categories: {
          create: { categoryId },
        },
        itineraryDays: {
          create: seed.itinerary.map(([title, description], dayIndex) => ({
            dayNumber: dayIndex + 1,
            title,
            description,
            activities: [],
          })),
        },
        media: {
          create: packageMediaIds.flatMap((mediaAssetId, mediaIndex) =>
            mediaAssetId
              ? [
                  {
                    mediaAssetId,
                    sortOrder: mediaIndex,
                    isCover: mediaIndex === 0,
                  },
                ]
              : [],
          ),
        },
      },
    });
    created += 1;
  }

  return { created, preserved };
}

try {
  const mediaByKey = await syncCatalogueMedia();
  await ensureDestinationsAndCategories(mediaByKey);
  const result = await createMissingPackages(mediaByKey);
  console.log(
    `Catalogue seed completed: ${result.created} packages created, ${result.preserved} existing packages preserved and ${mediaByKey.size} media assets synchronised.`,
  );
} finally {
  await prisma.$disconnect();
}
