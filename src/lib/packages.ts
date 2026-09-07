import type { PackageCard, PackageDetail } from "../contracts.js";
import { env } from "../env.js";
import type {
  Category,
  Departure,
  Destination,
  ItineraryDay,
  MediaAsset,
  Package,
  PackageCategory,
  PackageDestination,
  PackageMedia,
  Prisma,
} from "../generated/prisma/client.js";
import type { PackageInclude } from "../generated/prisma/models/Package.js";

export const publicPackageInclude = {
  destinations: {
    orderBy: { sortOrder: "asc" },
    include: { destination: true },
  },
  categories: { include: { category: true } },
  itineraryDays: { orderBy: { dayNumber: "asc" } },
  departures: { orderBy: { startDate: "asc" } },
  media: {
    where: {
      mediaAsset: { visibility: "PUBLIC", mimeType: { startsWith: "image/" } },
    },
    orderBy: { sortOrder: "asc" },
    include: { mediaAsset: true },
  },
  brochureMedia: true,
} satisfies PackageInclude;

export type PublicPackageRecord = Package & {
  destinations: Array<PackageDestination & { destination: Destination }>;
  categories: Array<PackageCategory & { category: Category }>;
  itineraryDays: ItineraryDay[];
  departures: Departure[];
  media: Array<PackageMedia & { mediaAsset: MediaAsset }>;
  brochureMedia: MediaAsset | null;
};

function publicMedia(asset: MediaAsset) {
  return {
    id: asset.id,
    url: `${env.MEDIA_PUBLIC_BASE_URL}/${asset.id}`,
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

function startingPrice(
  record: PublicPackageRecord,
  now: Date,
): PackageCard["startingPrice"] {
  if (record.priceBasis === "ON_REQUEST") return null;

  const amounts = [
    record.basePrice,
    ...record.departures
      .filter(
        (departure: Departure) =>
          departure.status === "SCHEDULED" && departure.startDate >= now,
      )
      .map((departure: Departure) => departure.pricePerPerson),
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
  record: PublicPackageRecord,
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
      ({ destination }: PackageDestination & { destination: Destination }) => ({
        slug: destination.slug,
        name: destination.name,
      }),
    ),
    categories: record.categories.map(
      ({ category }: PackageCategory & { category: Category }) => ({
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
            url: `${env.MEDIA_PUBLIC_BASE_URL}/${record.brochureMedia.id}`,
            originalName: record.brochureMedia.originalName,
            mimeType: "application/pdf" as const,
          }
        : null,
    media: record.media.map((item) => publicMedia(item.mediaAsset)),
    itinerary: record.itineraryDays.map((day: ItineraryDay) => ({
      dayNumber: day.dayNumber,
      title: day.title,
      description: day.description,
    })),
    departures: record.departures
      .filter(
        (departure: Departure) =>
          departure.status === "SCHEDULED" && departure.startDate >= now,
      )
      .map((departure: Departure) => ({
        id: departure.id,
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
