import { config } from "dotenv";
import { createHash } from "node:crypto";
import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { createOperationalPrisma } from "../scripts/lib/database.js";
import {
  tourArticles,
  tourDestinations,
  tourNavigation,
  tourPackages,
} from "./catalogue-data.js";

config({ path: ".env" });

if (process.env.NODE_ENV === "production") {
  throw new Error("Tour seed refuses to run with NODE_ENV=production.");
}
if (process.env.ALLOW_DEMO_SEED !== "true") {
  throw new Error(
    "Set ALLOW_DEMO_SEED=true explicitly to run the guarded tour seed.",
  );
}

const prisma = createOperationalPrisma();
const publishedAt = new Date(Date.now() - 60_000);
const mediaRoot = path.resolve(process.env.MEDIA_ROOT ?? "./storage/media");
const seedMediaRoot = path.resolve("prisma/assets/tours");

const categories = [
  ["weekend", "Weekend", "Short, refreshing journeys designed around limited leave."],
  ["family", "Family", "Comfortable, flexible routes that work across generations."],
  ["adventure", "Adventure", "Active journeys shaped around terrain, season and traveller ability."],
  ["pilgrimage", "Pilgrimage", "Respectful spiritual routes with practical travel pacing."],
  ["group-travel", "Group travel", "Well-paced shared journeys for families, friends and private groups."],
] as const;

const generalFaqs = [
  [
    "Are the prices shown final?",
    "Prices are indicative starting points for planning. Final cost depends on dates, group size, room choice, transport and current supplier availability, and is confirmed in your written quote.",
  ],
  [
    "Can an itinerary be customised?",
    "Yes. Share your preferred dates, pace, room needs and priorities. BR can then adjust the route before confirming availability and price.",
  ],
  [
    "When is the Char Dham travel season?",
    "Temple access is seasonal and controlled by local authorities. Exact opening dates, weather conditions and route access are checked before any journey is confirmed.",
  ],
  [
    "Which Kashmir season should I choose?",
    "Spring, summer, autumn and winter each offer a different experience. The best window depends on whether you prefer blossom, green valleys, autumn colour or snow activities.",
  ],
  [
    "How do transfers work in vehicle-free Matheran?",
    "Road transfers finish at an approved access point. The final section uses the locally available options and is planned around luggage, mobility and current operating conditions.",
  ],
  [
    "Are Jaisalmer desert stays included automatically?",
    "A desert stay is included only when it appears in the confirmed quote. BR discusses comfort level, location and operating standards with you before selecting it.",
  ],
] as const;

function dateOnlyAfter(days: number) {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days),
  );
}

async function seedTourMedia() {
  const mediaByDestination = new Map<string, string>();
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
  ];

  for (const asset of assets) {
    const source = path.join(seedMediaRoot, asset.image);
    const storageKey = `seed/tours/${asset.image}`;
    const target = path.resolve(mediaRoot, storageKey);
    if (!target.startsWith(`${mediaRoot}${path.sep}`)) {
      throw new Error(`Unsafe media seed target: ${target}`);
    }
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(source, target);
    const file = await stat(target);
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
        sourceNotes:
          "Original project asset generated with the built-in OpenAI image-generation workflow for BR Tours and Travels.",
        licenseNotes:
          "Project-owned AI-generated visual. Review destination representation before production publication.",
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
        sourceNotes:
          "Original project asset generated with the built-in OpenAI image-generation workflow for BR Tours and Travels.",
        licenseNotes:
          "Project-owned AI-generated visual. Review destination representation before production publication.",
        visibility: "PUBLIC",
        provider: "LOCAL",
      },
    });
    mediaByDestination.set(asset.key, record.id);
  }

  return mediaByDestination;
}

async function seedReferenceContent(mediaByDestination: Map<string, string>) {
  const destinationSlugs = tourDestinations.map((item) => item.slug);
  const packageSlugs = tourPackages.map((item) => item.slug);

  await prisma.package.updateMany({
    where: { isDemo: true, slug: { notIn: packageSlugs } },
    data: { status: "ARCHIVED", isFeatured: false, featuredOrder: null },
  });
  await prisma.destination.updateMany({
    where: { isDemo: true, slug: { notIn: destinationSlugs } },
    data: { status: "ARCHIVED" },
  });

  for (const destination of tourDestinations) {
    await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: {
        name: destination.name,
        summary: destination.summary,
        sortOrder: destination.sortOrder,
        status: "PUBLISHED",
        publishedAt,
        isDemo: true,
      },
      create: {
        slug: destination.slug,
        name: destination.name,
        summary: destination.summary,
        sortOrder: destination.sortOrder,
        status: "PUBLISHED",
        publishedAt,
        isDemo: true,
      },
    });
  }

  for (const [slug, name, description] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, description, status: "PUBLISHED", publishedAt, isDemo: true },
      create: { slug, name, description, status: "PUBLISHED", publishedAt, isDemo: true },
    });
  }

  const destinationRows = await prisma.destination.findMany({
    where: { slug: { in: destinationSlugs } },
  });
  const categoryRows = await prisma.category.findMany({
    where: { slug: { in: categories.map(([slug]) => slug) } },
  });
  const destinationBySlug = new Map(destinationRows.map((row) => [row.slug, row.id]));
  const categoryBySlug = new Map(categoryRows.map((row) => [row.slug, row.id]));

  for (const [index, seed] of tourPackages.entries()) {
    const days = seed.itinerary.length;
    const item = await prisma.package.upsert({
      where: { slug: seed.slug },
      update: {
        title: seed.title,
        summary: seed.summary,
        overview: seed.overview,
        days,
        nights: days - 1,
        startingCity: seed.startingCity,
        basePrice: seed.startingPrice,
        currency: "INR",
        priceBasis: "PER_PERSON",
        highlights: [...seed.highlights],
        inclusions: [
          "Accommodation and transport described in the confirmed quote",
          "Route planning and trip coordination",
          "Applicable sightseeing listed in the confirmed itinerary",
          "Pre-departure support",
        ],
        exclusions: [
          "Air or rail tickets unless specifically quoted",
          "Personal expenses and optional activities",
          "Meals or services not listed in the confirmed quote",
          "Weather-related or authority-mandated changes",
        ],
        transportInformation:
          "Vehicle type and pickup plan depend on final group size, route access and the confirmed quotation.",
        accommodationNotes:
          "Stay category and room configuration are selected during enquiry and confirmed by property name before payment.",
        importantInformation:
          "The displayed price is an indicative starting point, not live availability. Mountain, pilgrimage and weather-sensitive routes may change for safety or local authority requirements.",
        cancellationRules:
          "Cancellation terms depend on the confirmed suppliers and travel dates and are provided in writing with the final quotation.",
        seoTitle: `${seed.title} | BR Tours and Travels`,
        seoDescription: seed.summary.slice(0, 170),
        status: "PUBLISHED",
        publishedAt,
        isDemo: true,
        isFeatured: index < 6,
        featuredOrder: index < 6 ? index + 1 : null,
      },
      create: {
        slug: seed.slug,
        title: seed.title,
        summary: seed.summary,
        overview: seed.overview,
        days,
        nights: days - 1,
        startingCity: seed.startingCity,
        basePrice: seed.startingPrice,
        currency: "INR",
        priceBasis: "PER_PERSON",
        highlights: [...seed.highlights],
        inclusions: [
          "Accommodation and transport described in the confirmed quote",
          "Route planning and trip coordination",
          "Applicable sightseeing listed in the confirmed itinerary",
          "Pre-departure support",
        ],
        exclusions: [
          "Air or rail tickets unless specifically quoted",
          "Personal expenses and optional activities",
          "Meals or services not listed in the confirmed quote",
          "Weather-related or authority-mandated changes",
        ],
        transportInformation:
          "Vehicle type and pickup plan depend on final group size, route access and the confirmed quotation.",
        accommodationNotes:
          "Stay category and room configuration are selected during enquiry and confirmed by property name before payment.",
        importantInformation:
          "The displayed price is an indicative starting point, not live availability. Mountain, pilgrimage and weather-sensitive routes may change for safety or local authority requirements.",
        cancellationRules:
          "Cancellation terms depend on the confirmed suppliers and travel dates and are provided in writing with the final quotation.",
        seoTitle: `${seed.title} | BR Tours and Travels`,
        seoDescription: seed.summary.slice(0, 170),
        status: "PUBLISHED",
        publishedAt,
        isDemo: true,
        isFeatured: index < 6,
        featuredOrder: index < 6 ? index + 1 : null,
      },
    });

    await prisma.packageDestination.deleteMany({ where: { packageId: item.id } });
    await prisma.packageDestination.create({
      data: {
        packageId: item.id,
        destinationId: destinationBySlug.get(seed.destinationSlug)!,
        sortOrder: 1,
      },
    });
    await prisma.packageCategory.deleteMany({ where: { packageId: item.id } });
    await prisma.packageCategory.create({
      data: {
        packageId: item.id,
        categoryId: categoryBySlug.get(seed.categorySlug)!,
      },
    });
    await prisma.itineraryDay.deleteMany({ where: { packageId: item.id } });
    await prisma.itineraryDay.createMany({
      data: seed.itinerary.map(([title, description], dayIndex) => ({
        packageId: item.id,
        dayNumber: dayIndex + 1,
        title,
        description,
      })),
    });
    await prisma.departure.deleteMany({ where: { packageId: item.id } });
    await prisma.packageMedia.deleteMany({ where: { packageId: item.id } });
    await prisma.packageMedia.create({
      data: {
        packageId: item.id,
        mediaAssetId: mediaByDestination.get(seed.destinationSlug)!,
        sortOrder: 0,
        isCover: true,
      },
    });
  }
}

async function seedEditorialContent(mediaByDestination: Map<string, string>) {
  const articleSlugs = tourArticles.map((item) => item.slug);
  const albumSlugs = tourDestinations.map((item) => `${item.slug}-travel-gallery`);
  await prisma.blogPost.updateMany({
    where: { isDemo: true, slug: { notIn: articleSlugs } },
    data: { status: "ARCHIVED", isFeatured: false },
  });
  await prisma.galleryAlbum.updateMany({
    where: { isDemo: true, slug: { notIn: albumSlugs } },
    data: { status: "ARCHIVED" },
  });
  await prisma.faq.updateMany({
    where: { isDemo: true, packageId: null },
    data: { status: "ARCHIVED" },
  });

  const blogCategory = await prisma.blogCategory.upsert({
    where: { slug: "india-tour-guides" },
    update: { name: "India tour guides", status: "PUBLISHED", publishedAt, isDemo: true },
    create: { slug: "india-tour-guides", name: "India tour guides", status: "PUBLISHED", publishedAt, isDemo: true },
  });

  for (const [index, article] of tourArticles.entries()) {
    const destination = tourDestinations.find((item) => item.slug === article.destinationSlug)!;
    const post = await prisma.blogPost.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        contentHtml: `<p>${article.excerpt}</p><h2>Shape the route around the season</h2><p>${destination.summary}</p><p>Travel time, local conditions and your preferred pace should be discussed before services are confirmed. BR uses your enquiry to turn this guide into a practical, date-specific plan.</p>`,
        categoryId: blogCategory.id,
        coverMediaId: mediaByDestination.get(article.destinationSlug),
        publicAuthorName: "BR Travel Desk",
        seoTitle: article.title.slice(0, 70),
        seoDescription: article.excerpt.slice(0, 170),
        status: "PUBLISHED",
        publishedAt,
        isFeatured: index < 3,
        isDemo: true,
      },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        contentHtml: `<p>${article.excerpt}</p><h2>Shape the route around the season</h2><p>${destination.summary}</p><p>Travel time, local conditions and your preferred pace should be discussed before services are confirmed. BR uses your enquiry to turn this guide into a practical, date-specific plan.</p>`,
        categoryId: blogCategory.id,
        coverMediaId: mediaByDestination.get(article.destinationSlug),
        publicAuthorName: "BR Travel Desk",
        seoTitle: article.title.slice(0, 70),
        seoDescription: article.excerpt.slice(0, 170),
        status: "PUBLISHED",
        publishedAt,
        isFeatured: index < 3,
        isDemo: true,
      },
    });
    const relatedPackage = await prisma.package.findFirst({
      where: { destinations: { some: { destination: { slug: article.destinationSlug } } } },
      orderBy: { featuredOrder: "asc" },
    });
    await prisma.blogPostPackage.deleteMany({ where: { postId: post.id } });
    if (relatedPackage) {
      await prisma.blogPostPackage.create({
        data: { postId: post.id, packageId: relatedPackage.id },
      });
    }
  }

  const destinations = await prisma.destination.findMany({
    where: { slug: { in: tourDestinations.map((item) => item.slug) } },
  });
  for (const destination of destinations) {
    const album = await prisma.galleryAlbum.upsert({
      where: { slug: `${destination.slug}-travel-gallery` },
      update: {
        title: `${destination.name} travel gallery`,
        description: `Original BR visual inspiration for ${destination.name} journeys.`,
        destinationId: destination.id,
        status: "PUBLISHED",
        publishedAt,
        isDemo: true,
      },
      create: {
        slug: `${destination.slug}-travel-gallery`,
        title: `${destination.name} travel gallery`,
        description: `Original BR visual inspiration for ${destination.name} journeys.`,
        destinationId: destination.id,
        status: "PUBLISHED",
        publishedAt,
        isDemo: true,
      },
    });
    await prisma.galleryAlbumImage.deleteMany({ where: { albumId: album.id } });
    await prisma.galleryAlbumImage.create({
      data: {
        albumId: album.id,
        mediaAssetId: mediaByDestination.get(destination.slug)!,
        sortOrder: 0,
      },
    });
  }

  for (const [sortOrder, [question, answer]] of generalFaqs.entries()) {
    const existing = await prisma.faq.findFirst({ where: { question } });
    if (existing) {
      await prisma.faq.update({
        where: { id: existing.id },
        data: { answer, sortOrder, status: "PUBLISHED", publishedAt, isDemo: true },
      });
    } else {
      await prisma.faq.create({
        data: { question, answer, sortOrder, status: "PUBLISHED", publishedAt, isDemo: true },
      });
    }
  }

  await prisma.testimonial.upsert({
    where: { id: "demo-testimonial-draft" },
    update: { approved: false, status: "DRAFT", isDemo: true },
    create: {
      id: "demo-testimonial-draft",
      publicName: "Sample traveller",
      quote: "Unapproved sample testimonial. It must never appear publicly.",
      approved: false,
      status: "DRAFT",
      isDemo: true,
    },
  });
}

async function seedPublicExperience() {
  const pages = [
    {
      slug: "about-us",
      title: "About BR Tours and Travels",
      contentHtml:
        "<p>BR Tours and Travels helps travellers explore Char Dham, Kashmir, Matheran, Rajasthan and Jaisalmer through clear, enquiry-led planning.</p><h2>How planning works</h2><p>Share your dates, group size, preferred pace and priorities. The team then shapes the route and confirms the applicable stays, transport, availability, price and terms in writing.</p>",
      seoDescription:
        "Meet BR Tours and Travels and learn how personalised India journeys are planned and confirmed.",
    },
    {
      slug: "privacy",
      title: "Privacy notice - owner review required",
      contentHtml:
        "<p>Enquiry information is collected so BR Tours and Travels can respond to your travel request. Final retention, legal-basis and contact wording must be approved by the owner before launch.</p>",
      seoDescription: "Privacy information for BR Tours and Travels enquiries.",
    },
    {
      slug: "terms",
      title: "Terms - owner review required",
      contentHtml:
        "<p>Package information is an invitation to enquire, not a confirmation of availability. Final services, payment rules, supplier terms and liabilities are provided with the written quotation.</p>",
      seoDescription: "General enquiry and travel terms for BR Tours and Travels.",
    },
    {
      slug: "cancellation-policy",
      title: "Cancellation policy - owner review required",
      contentHtml:
        "<p>Cancellation and refund rules depend on the confirmed package, suppliers and dates. The applicable rules are supplied with the final quotation before payment.</p>",
      seoDescription: "Cancellation information for BR Tours and Travels enquiries.",
    },
  ] as const;
  for (const page of pages) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        contentHtml: page.contentHtml,
        seoTitle: page.title.slice(0, 70),
        seoDescription: page.seoDescription,
        status: "PUBLISHED",
        publishedAt,
        ownerReviewDue: page.slug !== "about-us",
        isDemo: true,
      },
      create: {
        ...page,
        seoTitle: page.title.slice(0, 70),
        status: "PUBLISHED",
        publishedAt,
        ownerReviewDue: page.slug !== "about-us",
        isDemo: true,
      },
    });
  }

  const menu = await prisma.navigationMenu.upsert({
    where: { key: "primary" },
    update: { label: "Primary tour navigation" },
    create: { key: "primary", label: "Primary tour navigation" },
  });
  await prisma.navigationItem.deleteMany({ where: { menuId: menu.id } });
  await prisma.navigationItem.createMany({
    data: tourNavigation.map((item, sortOrder) => ({
      menuId: menu.id,
      label: item.label,
      href: item.href,
      sortOrder,
      isVisible: true,
    })),
  });

  const sections = [
    [
      "HERO",
      "India journeys, shaped around you.",
      {
        eyebrow: "Char Dham, Kashmir, Matheran, Rajasthan and Jaisalmer",
        description:
          "Explore thoughtful routes across sacred mountains, quiet valleys, green hill trails, royal cities and the Thar Desert. Every journey is confirmed personally around your dates and pace.",
        primaryLabel: "Explore main tours",
        primaryHref: "/packages",
        secondaryLabel: "Plan a custom journey",
        secondaryHref: "/contact-us",
      },
    ],
    ["DISCOVERY", "Where would you like to begin?", { description: "Search the complete collection by destination, trip style or starting city." }],
    ["FEATURED_PACKAGES", "Main tours to inspire your next journey", { eyebrow: "BR favourites", limit: 6 }],
    ["CATEGORIES", "Choose a travel style", { eyebrow: "A pace that suits you" }],
    ["DESTINATIONS", "Five distinctive ways to see India", { eyebrow: "Featured destinations", photographyPending: false }],
    ["INTRODUCTION", "Travel planning with clarity at the centre.", { description: "Compare real route ideas, then discuss dates, stays, transport and priorities before anything is confirmed." }],
    [
      "PLANNING_PROCESS",
      "From first idea to confirmed journey.",
      {
        steps: [
          { title: "Discover", description: "Browse destination-led routes and practical itinerary ideas." },
          { title: "Discuss", description: "Share your dates, group details, pace and accommodation needs." },
          { title: "Confirm", description: "Receive the final availability, price, inclusions and terms in writing." },
        ],
      },
    ],
    ["GALLERY", "A visual journey across India", { eyebrow: "Original destination imagery" }],
    ["TESTIMONIALS", "Traveller notes", {}],
    ["LATEST_BLOG", "Plan with useful local context", { limit: 5 }],
    ["FAQS", "Questions before you enquire", {}],
    ["CONTACT_CTA", "Ready to shape your route?", { description: "Tell BR where you want to go, who is travelling and what a good trip feels like to you.", label: "Send an enquiry", href: "/contact-us" }],
  ] as const;
  for (const [sortOrder, section] of sections.entries()) {
    const [type, title, content] = section;
    await prisma.homepageSection.upsert({
      where: { type_sortOrder: { type, sortOrder } },
      update: { title, content, isVisible: true, status: "PUBLISHED", publishedAt, isDemo: true },
      create: { type, title, content, isVisible: true, sortOrder, status: "PUBLISHED", publishedAt, isDemo: true },
    });
  }
}

async function seedTestEnquiries() {
  const firstPackage = await prisma.package.findFirst({
    where: { slug: tourPackages[0].slug },
  });
  if (!firstPackage) return;

  for (let index = 1; index <= 3; index += 1) {
    const key = `demo-seed-enquiry-${index}`;
    const payloadHash = createHash("sha256").update(key).digest("hex");
    await prisma.enquiry.upsert({
      where: { idempotencyKey: key },
      update: { packageId: firstPackage.id, packageTitleSnapshot: firstPackage.title, packageSlugSnapshot: firstPackage.slug },
      create: {
        publicReference: `BR-DEMO-${String(index).padStart(4, "0")}`,
        idempotencyKey: key,
        payloadHash,
        type: "PACKAGE_ENQUIRY",
        status: index === 1 ? "NEW" : index === 2 ? "CONTACTED" : "CLOSED",
        name: `Demo Lead ${index}`,
        email: `demo${index}@example.invalid`,
        subject: "Synthetic test enquiry",
        message: "Demo lead data for local administration testing only.",
        packageId: firstPackage.id,
        packageTitleSnapshot: firstPackage.title,
        packageSlugSnapshot: firstPackage.slug,
        preferredStartDate: dateOnlyAfter(60 + index * 10),
        consentAt: new Date(),
        sourcePath: `/packages/${firstPackage.slug}`,
      },
    });
  }
}

try {
  const mediaByDestination = await seedTourMedia();
  await seedReferenceContent(mediaByDestination);
  await seedEditorialContent(mediaByDestination);
  await seedPublicExperience();
  await seedTestEnquiries();
  console.log(
    `Tour seed completed: ${tourDestinations.length} destinations, ${tourPackages.length} packages, ${tourArticles.length} guides and ${mediaByDestination.size} original images.`,
  );
} finally {
  await prisma.$disconnect();
}
