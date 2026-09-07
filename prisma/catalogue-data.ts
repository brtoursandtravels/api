export const tourDestinations = [
  {
    slug: "char-dham",
    name: "Char Dham",
    sortOrder: 1,
    image: "char-dham-kedarnath.webp",
    altText: "Kedarnath Temple beneath the Himalayan peaks in Uttarakhand",
    summary:
      "A sacred Himalayan circuit through Yamunotri, Gangotri, Kedarnath and Badrinath, planned with altitude, road conditions and a comfortable pace in mind.",
  },
  {
    slug: "kashmir",
    name: "Kashmir",
    sortOrder: 2,
    image: "kashmir-dal-lake.webp",
    altText: "Traditional shikara crossing Dal Lake with Kashmir mountains beyond",
    summary:
      "Quiet lake mornings, alpine meadows and mountain towns across Srinagar, Gulmarg, Pahalgam and Sonamarg.",
  },
  {
    slug: "matheran",
    name: "Matheran",
    sortOrder: 3,
    image: "matheran-monsoon.webp",
    altText: "Rain-washed red trail through the green hills of Matheran",
    summary:
      "A close-to-Mumbai hill escape known for forest walks, red-earth trails, valley viewpoints and its relaxed vehicle-free centre.",
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    sortOrder: 4,
    image: "rajasthan-amber-fort.webp",
    altText: "Amber Fort glowing above Maota Lake near Jaipur",
    summary:
      "Palaces, stepwells, old-city lanes and desert landscapes woven through Jaipur, Jodhpur, Udaipur and beyond.",
  },
  {
    slug: "jaisalmer",
    name: "Jaisalmer",
    sortOrder: 5,
    image: "jaisalmer-golden-fort.webp",
    altText: "Golden Jaisalmer Fort rising beyond the dunes of the Thar Desert",
    summary:
      "Golden sandstone streets, living-fort heritage and unhurried evenings among the dunes of the Thar Desert.",
  },
] as const;

export const tourNavigation = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Tours / Packages", href: "/packages" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Blog", href: "/blog" },
] as const;

export const tourPackages = [
  {
    slug: "complete-char-dham-yatra",
    title: "Complete Char Dham Yatra",
    destinationSlug: "char-dham",
    categorySlug: "pilgrimage",
    startingCity: "Haridwar",
    startingPrice: "69900.00",
    summary:
      "A carefully paced pilgrimage linking Yamunotri, Gangotri, Kedarnath and Badrinath with practical Himalayan travel days.",
    overview:
      "Begin in Haridwar and follow the traditional Char Dham circuit through Uttarakhand. The route balances temple visits with acclimatisation, rest and realistic mountain-road timing. Final transport, stays, permits and seasonal access are confirmed personally before booking.",
    highlights: [
      "All four Char Dham shrines",
      "Haridwar to Himalayan circuit",
      "Acclimatisation-aware pacing",
      "Dedicated pilgrimage assistance",
    ],
    itinerary: [
      ["Haridwar arrival", "Meet the trip coordinator, review mountain conditions and prepare for the pilgrimage."],
      ["Haridwar to Barkot", "Travel through the lower Himalayan valleys and settle in near the Yamunotri route."],
      ["Yamunotri visit", "Continue to Janki Chatti and complete the Yamunotri visit at a comfortable pace."],
      ["Barkot to Uttarkashi", "Drive toward Uttarkashi with rest stops and an evening orientation."],
      ["Gangotri visit", "Follow the Bhagirathi valley to Gangotri and return to Uttarkashi."],
      ["Uttarkashi to Guptkashi", "A longer scenic road day through the central Garhwal region."],
      ["Kedarnath approach", "Transfer to the approved route point and continue toward Kedarnath according to current access rules."],
      ["Kedarnath to Guptkashi", "Morning temple time followed by the return journey and a recovery evening."],
      ["Guptkashi to Badrinath", "Travel via the Alaknanda valley toward Badrinath."],
      ["Badrinath and Mana", "Visit Badrinath and, when access permits, explore Mana village."],
      ["Badrinath to Rudraprayag", "Descend through the confluence towns with a relaxed overnight stop."],
      ["Return to Haridwar", "Complete the circuit in Haridwar with onward-travel assistance."],
    ],
  },
  {
    slug: "kedarnath-badrinath-yatra",
    title: "Kedarnath and Badrinath Yatra",
    destinationSlug: "char-dham",
    categorySlug: "pilgrimage",
    startingCity: "Haridwar",
    startingPrice: "42900.00",
    summary:
      "A focused Do Dham journey combining Kedarnath and Badrinath with sensible rest stops through Garhwal.",
    overview:
      "This shorter pilgrimage is shaped for travellers who want to visit Kedarnath and Badrinath without rushing the mountain sections. Access methods and exact overnight points are adjusted to seasonal regulations and traveller mobility.",
    highlights: ["Kedarnath Temple", "Badrinath Temple", "Garhwal valley drives", "Flexible access planning"],
    itinerary: [
      ["Haridwar to Guptkashi", "Enter the Garhwal hills with planned meal and comfort stops."],
      ["Kedarnath approach", "Continue toward Kedarnath using the currently approved access plan."],
      ["Kedarnath to Guptkashi", "Temple time followed by a measured return to Guptkashi."],
      ["Guptkashi to Badrinath", "Cross the Alaknanda valley and arrive near Badrinath."],
      ["Badrinath and Mana", "Visit the temple and nearby Mana when road and weather conditions allow."],
      ["Badrinath to Rudraprayag", "Descend to Rudraprayag for a relaxed final mountain night."],
      ["Return to Haridwar", "Travel back to Haridwar for departure."],
    ],
  },
  {
    slug: "kashmir-valley-retreat",
    title: "Kashmir Valley Retreat",
    destinationSlug: "kashmir",
    categorySlug: "family",
    startingCity: "Srinagar",
    startingPrice: "38900.00",
    summary:
      "Six gentle days of Dal Lake mornings, Pahalgam valleys, Gulmarg views and unhurried Srinagar discoveries.",
    overview:
      "A balanced first journey through Kashmir with enough room to enjoy each setting. The plan combines Srinagar, Gulmarg and Pahalgam while keeping transfers practical and the experience flexible for couples and families.",
    highlights: ["Dal Lake shikara ride", "Gulmarg meadows", "Pahalgam valley", "Srinagar heritage"],
    itinerary: [
      ["Arrive in Srinagar", "Airport welcome, hotel check-in and a gentle introduction to the city."],
      ["Srinagar and Dal Lake", "Explore Mughal garden landscapes and enjoy an evening shikara ride."],
      ["Gulmarg day", "Travel to Gulmarg for mountain views and optional seasonal activities."],
      ["Srinagar to Pahalgam", "Follow the valley road to Pahalgam with scenic stops en route."],
      ["Pahalgam at leisure", "Choose relaxed riverside time or locally available valley excursions."],
      ["Return and departure", "Travel back to Srinagar for the onward journey."],
    ],
  },
  {
    slug: "kashmir-grand-highlights",
    title: "Kashmir Grand Highlights",
    destinationSlug: "kashmir",
    categorySlug: "group-travel",
    startingCity: "Srinagar",
    startingPrice: "46900.00",
    summary:
      "A fuller Kashmir circuit through Srinagar, Gulmarg, Pahalgam and Sonamarg with seven comfortable travel days.",
    overview:
      "Designed for travellers who want the valley's best-known landscapes in one coherent route. Seasonal access is checked before confirmation and the daily pace can be adapted for private groups.",
    highlights: ["Four Kashmir regions", "Houseboat experience", "Mountain day trips", "Private-group pacing"],
    itinerary: [
      ["Srinagar welcome", "Arrive, settle in and enjoy a calm first evening by the lake."],
      ["Srinagar heritage", "Discover gardens, old-city character and the Dal Lake waterfront."],
      ["Sonamarg excursion", "Travel toward Sonamarg for alpine scenery, subject to seasonal road access."],
      ["Gulmarg excursion", "Spend a day among Gulmarg's meadows and mountain viewpoints."],
      ["Srinagar to Pahalgam", "Continue to Pahalgam through the south Kashmir landscape."],
      ["Pahalgam valleys", "Select locally available sightseeing based on weather and group preference."],
      ["Srinagar departure", "Return to Srinagar and connect with the onward journey."],
    ],
  },
  {
    slug: "matheran-weekend-escape",
    title: "Matheran Weekend Escape",
    destinationSlug: "matheran",
    categorySlug: "weekend",
    startingCity: "Mumbai",
    startingPrice: "12900.00",
    summary:
      "A refreshing three-day hill break with forest paths, sunset viewpoints and time to enjoy Matheran's slower rhythm.",
    overview:
      "Leave the city behind for a compact, walkable Matheran stay. The route focuses on viewpoints, forest atmosphere and free time rather than filling every hour, with transfers planned around the hill station's vehicle restrictions.",
    highlights: ["Vehicle-free hill station", "Forest viewpoints", "Red-earth trails", "Easy Mumbai escape"],
    itinerary: [
      ["Mumbai to Matheran", "Transfer to the designated access point and continue into Matheran for sunset."],
      ["Matheran viewpoints", "Walk a flexible circuit of forest paths and selected valley viewpoints."],
      ["Leisure and return", "Enjoy a slow morning before returning to Mumbai."],
    ],
  },
  {
    slug: "matheran-monsoon-trails",
    title: "Matheran Monsoon Trails",
    destinationSlug: "matheran",
    categorySlug: "adventure",
    startingCity: "Mumbai",
    startingPrice: "8900.00",
    summary:
      "A compact rain-season escape built around lush forest trails, misty viewpoints and Matheran's red-earth paths.",
    overview:
      "This short active break is for travellers who enjoy walking and changing monsoon weather. Trail choices remain flexible and are confirmed against local safety conditions before departure.",
    highlights: ["Monsoon forest walks", "Panoramic viewpoints", "Small-group format", "Flexible trail choice"],
    itinerary: [
      ["Arrive and sunset walk", "Reach Matheran, settle in and take a weather-appropriate introductory walk."],
      ["Forest trail and return", "Complete a guided morning trail before the return journey to Mumbai."],
    ],
  },
  {
    slug: "royal-rajasthan-circuit",
    title: "Royal Rajasthan Circuit",
    destinationSlug: "rajasthan",
    categorySlug: "group-travel",
    startingCity: "Jaipur",
    startingPrice: "58900.00",
    summary:
      "An eight-day heritage journey through Jaipur, Jodhpur and Udaipur, linked by forts, lakes and old-city stories.",
    overview:
      "See three distinct Rajasthan cities without turning the route into a race. This journey combines landmark architecture with local neighbourhood time and thoughtfully spaced intercity drives.",
    highlights: ["Jaipur forts", "Jodhpur old city", "Udaipur lakes", "Three-city heritage route"],
    itinerary: [
      ["Arrive in Jaipur", "Welcome to Rajasthan with an easy old-city evening."],
      ["Amber and Jaipur", "Visit Amber Fort and selected landmarks across the Pink City."],
      ["Jaipur at your pace", "Explore markets, crafts or additional heritage sites according to interest."],
      ["Jaipur to Jodhpur", "Travel west to Jodhpur and settle near the Blue City."],
      ["Jodhpur heritage", "Discover Mehrangarh Fort and the character of the old city."],
      ["Jodhpur to Udaipur", "Continue south through the changing Aravalli landscape."],
      ["Udaipur lakes and palaces", "Enjoy Udaipur's palace quarter and lakeside atmosphere."],
      ["Udaipur departure", "A relaxed final morning and onward-transfer assistance."],
    ],
  },
  {
    slug: "jaipur-udaipur-heritage",
    title: "Jaipur and Udaipur Heritage",
    destinationSlug: "rajasthan",
    categorySlug: "family",
    startingCity: "Jaipur",
    startingPrice: "39900.00",
    summary:
      "A family-friendly pairing of Jaipur's fort heritage and Udaipur's calm lakeside character.",
    overview:
      "A comfortable two-city Rajasthan itinerary with adaptable sightseeing and fewer hotel changes. It suits families and first-time visitors looking for a mix of history, colour and relaxed evenings.",
    highlights: ["Amber Fort", "Pink City landmarks", "Udaipur lakes", "Family-friendly pacing"],
    itinerary: [
      ["Arrive in Jaipur", "Hotel transfer and a relaxed introduction to the Pink City."],
      ["Amber and city sights", "Explore Amber Fort and a considered selection of Jaipur landmarks."],
      ["Jaipur discovery", "Choose markets, crafts or additional heritage experiences."],
      ["Jaipur to Udaipur", "Travel to Udaipur with planned comfort stops."],
      ["Udaipur heritage", "Explore the palace quarter and enjoy the lakeside setting."],
      ["Departure", "Free time followed by onward-transfer assistance."],
    ],
  },
  {
    slug: "jaisalmer-desert-and-fort",
    title: "Jaisalmer Desert and Fort",
    destinationSlug: "jaisalmer",
    categorySlug: "adventure",
    startingCity: "Jodhpur",
    startingPrice: "26900.00",
    summary:
      "Four golden days exploring Jaisalmer's living fort, carved havelis and a carefully selected Thar Desert stay.",
    overview:
      "A concise Jaisalmer journey that balances fort heritage with time in the desert. Accommodation and dune experiences are selected only after discussing comfort, season and responsible operating standards.",
    highlights: ["Living Jaisalmer Fort", "Historic havelis", "Thar Desert sunset", "Curated desert stay"],
    itinerary: [
      ["Jodhpur to Jaisalmer", "Travel west into the Thar landscape and settle in Jaisalmer."],
      ["Fort and havelis", "Explore the living fort and selected sandstone havelis with local context."],
      ["Desert experience", "Enjoy a relaxed morning before a curated desert sunset and overnight experience."],
      ["Return to Jodhpur", "Depart after breakfast with planned comfort stops en route."],
    ],
  },
  {
    slug: "jodhpur-jaisalmer-explorer",
    title: "Jodhpur and Jaisalmer Explorer",
    destinationSlug: "jaisalmer",
    categorySlug: "family",
    startingCity: "Jodhpur",
    startingPrice: "38900.00",
    summary:
      "A six-day desert heritage route pairing Jodhpur's blue lanes with Jaisalmer's golden fort and dunes.",
    overview:
      "Link two of western Rajasthan's most memorable cities in a measured route. Fort visits, old-city walks and a desert evening are balanced with enough time to rest and explore independently.",
    highlights: ["Mehrangarh Fort", "Blue City walk", "Jaisalmer Fort", "Thar Desert evening"],
    itinerary: [
      ["Arrive in Jodhpur", "Welcome, hotel transfer and a gentle first evening."],
      ["Jodhpur heritage", "Visit Mehrangarh Fort and explore selected Blue City lanes."],
      ["Jodhpur to Jaisalmer", "Travel through western Rajasthan to the Golden City."],
      ["Jaisalmer fort", "Discover the living fort, havelis and old-city character."],
      ["Desert evening", "Spend a relaxed morning in town followed by a curated dune experience."],
      ["Departure", "Return to Jodhpur or connect with the selected onward plan."],
    ],
  },
] as const;

export const tourArticles = [
  {
    slug: "planning-a-char-dham-yatra",
    title: "How to plan a Char Dham journey with a realistic pace",
    destinationSlug: "char-dham",
    excerpt: "Altitude, road time and rest days matter as much as the temple sequence. Start with these practical planning considerations.",
  },
  {
    slug: "kashmir-season-by-season",
    title: "Kashmir season by season: choosing the right travel window",
    destinationSlug: "kashmir",
    excerpt: "Spring blossom, summer meadows, autumn colour or winter snow: each Kashmir season creates a different journey.",
  },
  {
    slug: "matheran-weekend-guide",
    title: "A slower weekend in Matheran",
    destinationSlug: "matheran",
    excerpt: "Plan around walking distances, changing hill weather and the viewpoints that suit your preferred pace.",
  },
  {
    slug: "first-rajasthan-route",
    title: "Choosing your first Rajasthan route",
    destinationSlug: "rajasthan",
    excerpt: "Compare Jaipur, Jodhpur and Udaipur to build a heritage route with comfortable travel days.",
  },
  {
    slug: "responsible-jaisalmer-desert-stay",
    title: "What to look for in a Jaisalmer desert stay",
    destinationSlug: "jaisalmer",
    excerpt: "Location, comfort and responsible operating practices can make a desert evening more meaningful and relaxed.",
  },
] as const;
