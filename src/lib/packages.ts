import type { PackageCard, PackageDetail } from "../contracts.js";
import type { Prisma } from "../generated/prisma/client.js";
import { publicMediaUrl } from "./media-url.js";
import { publicMediaSelect } from "./public-media.js";

const packageImageSelection = {
  where: { mediaAsset: { visibility: "PUBLIC", mimeType: { startsWith: "image/" } } },
  orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
  select: { mediaAsset: { select: publicMediaSelect } },
} satisfies Prisma.Package$mediaArgs;

export function publicPackageCardSelect(now: Date) {
  return {
    id: true, slug: true, title: true, summary: true, days: true, nights: true,
    startingCity: true, basePrice: true, currency: true, priceBasis: true,
    highlights: true, isDemo: true,
    destinations: {
      orderBy: { sortOrder: "asc" },
      select: { destinationId: true, destination: { select: { slug: true, name: true } } },
    },
    categories: { select: { categoryId: true, category: { select: { slug: true, name: true } } } },
    departures: {
      where: { status: { in: ["SCHEDULED", "FILLING_FAST"] }, startDate: { gte: now } },
      select: { status: true, startDate: true, pricePerPerson: true },
    },
    // List cards need one cover and no itinerary or long-form detail fields.
    media: { ...packageImageSelection, take: 1 },
  } satisfies Prisma.PackageSelect;
}

export function publicPackageDetailSelect(now: Date) {
  return {
    ...publicPackageCardSelect(now),
    overview: true, inclusions: true, exclusions: true, importantInformation: true,
    transportInformation: true, accommodationNotes: true, cancellationRules: true,
    seoTitle: true, seoDescription: true,
    itineraryDays: {
      orderBy: { dayNumber: "asc" },
      select: { dayNumber: true, title: true, description: true, activities: true, meals: true, accommodation: true, imageMedia: { select: { ...publicMediaSelect, visibility: true } } },
    },
    departures: {
      where: { status: { in: ["SCHEDULED", "FILLING_FAST"] }, startDate: { gte: now } },
      orderBy: { startDate: "asc" },
      select: { id: true, status: true, startDate: true, endDate: true, pricePerPerson: true, currency: true, seatsAvailable: true },
    },
    media: packageImageSelection,
    brochureMedia: { select: { id: true, storageKey: true, originalName: true, mimeType: true, visibility: true } },
  } satisfies Prisma.PackageSelect;
}

export type PublicPackageCardRecord = Prisma.PackageGetPayload<{ select: ReturnType<typeof publicPackageCardSelect> }>;
export type PublicPackageRecord = Prisma.PackageGetPayload<{ select: ReturnType<typeof publicPackageDetailSelect> }>;

function publicMedia(asset: Prisma.MediaAssetGetPayload<{ select: typeof publicMediaSelect }>) {
  return {
    id: asset.id,
    url: publicMediaUrl(asset),
    width: asset.width,
    height: asset.height,
    altText: asset.altText,
    caption: asset.caption,
  };
}

function jsonStrings(value: Prisma.JsonValue): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function startingPrice(
  record: Pick<PublicPackageCardRecord, "priceBasis" | "basePrice" | "currency" | "departures">,
  now: Date,
): PackageCard["startingPrice"] {
  if (record.priceBasis === "ON_REQUEST") return null;

  const amounts = [
    record.basePrice,
    ...record.departures
      .filter(
        (departure) =>
          (departure.status === "SCHEDULED" || departure.status === "FILLING_FAST") && departure.startDate >= now,
      )
      .map((departure) => departure.pricePerPerson),
  ].filter((amount) => amount !== null);

  if (amounts.length === 0) return null;
  const lowest = amounts.reduce((minimum, amount) =>
    amount.lessThan(minimum) ? amount : minimum,
  );
  return {
    amount: lowest.toFixed(2),
    currency: record.currency,
    basis: record.priceBasis,
  };
}

export function toPackageCard(
  record: PublicPackageCardRecord,
  now: Date,
): PackageCard {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    days: record.days,
    nights: record.nights,
    startingCity: record.startingCity,
    destinations: record.destinations.map(
      ({ destination }) => ({
        slug: destination.slug,
        name: destination.name,
      }),
    ),
    categories: record.categories.map(
      ({ category }) => ({
        slug: category.slug,
        name: category.name,
      }),
    ),
    highlights: jsonStrings(record.highlights),
    startingPrice: startingPrice(record, now),
    cover: record.media[0] ? publicMedia(record.media[0].mediaAsset) : null,
    isDemo: record.isDemo,
  };
}

export function toPackageDetail(
  record: PublicPackageRecord,
  now: Date,
): Omit<PackageDetail, "relatedPackages"> {
  return {
    ...toPackageCard(record, now),
    overview: record.overview,
    inclusions: jsonStrings(record.inclusions),
    exclusions: jsonStrings(record.exclusions),
    importantInformation: record.importantInformation,
    transportInformation: record.transportInformation,
    accommodationNotes: record.accommodationNotes,
    cancellationRules: record.cancellationRules,
    seo: { title: record.seoTitle, description: record.seoDescription },
    brochure:
      record.brochureMedia?.visibility === "PUBLIC" &&
      record.brochureMedia.mimeType === "application/pdf"
        ? {
            id: record.brochureMedia.id,
            url: publicMediaUrl(record.brochureMedia),
            originalName: record.brochureMedia.originalName,
            mimeType: "application/pdf" as const,
          }
        : null,
    media: record.media.map((item) => publicMedia(item.mediaAsset)),
    itinerary: record.itineraryDays.map((day) => ({
      dayNumber: day.dayNumber,
      title: day.title,
      description: day.description,
      activities: jsonStrings(day.activities),
      meals: day.meals ?? null,
      accommodation: day.accommodation ?? null,
      image: day.imageMedia?.visibility === "PUBLIC" ? publicMedia(day.imageMedia) : null,
    })),
    departures: record.departures
      .filter(
        (departure) =>
          (departure.status === "SCHEDULED" || departure.status === "FILLING_FAST") && departure.startDate >= now,
      )
      .map((departure) => ({
        id: departure.id,
        status: departure.status,
        seatsAvailable: departure.seatsAvailable ?? null,
        startDate: departure.startDate.toISOString().slice(0, 10),
        endDate: departure.endDate.toISOString().slice(0, 10),
        price:
          departure.pricePerPerson === null
            ? null
            : {
                amount: departure.pricePerPerson.toFixed(2),
                currency: departure.currency,
                basis: record.priceBasis,
              },
      })),
  };
}
