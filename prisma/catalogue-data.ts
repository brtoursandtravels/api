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
  {
    slug: "north-india-nepal",
    name: "North India & Nepal",
    sortOrder: 6,
    image: "north-india-nepal-ayodhya.webp",
    altText: "Grand pale-stone temple in Ayodhya illuminated by sunrise",
    summary:
      "A broad pilgrimage circuit linking Ayodhya, Mathura, Vrindavan, Kashi, Prayagraj and Kathmandu with selected Rajasthan and Gujarat stops.",
  },
  {
    slug: "maharashtra",
    name: "Maharashtra",
    sortOrder: 7,
    image: "maharashtra-saputara-gira-falls.webp",
    altText: "Broad monsoon waterfall surrounded by the green hills near Saputara",
    summary:
      "Jyotirlinga temples, sacred towns, rock-cut heritage and a green Saputara beginning across Gujarat and Maharashtra.",
  },
  {
    slug: "madhya-pradesh",
    name: "Madhya Pradesh",
    sortOrder: 8,
    image: "madhya-pradesh-omkareshwar.webp",
    altText: "Omkareshwar temple town and suspension bridge beside the Narmada River",
    summary:
      "Sacred Ujjain and Omkareshwar journeys paired with Indore heritage, river ghats and central India's historic temple landscapes.",
  },
  {
    slug: "gujarat-coast",
    name: "Gujarat Coast & Gir",
    sortOrder: 9,
    image: "gujarat-dwarka.webp",
    altText: "Dwarkadhish Temple beside the Gomti riverfront at sunrise",
    summary:
      "Temple towns, historic island-coast heritage, Arabian Sea beaches and the wildlife landscapes of Sasan Gir.",
  },
  {
    slug: "goa-maharashtra",
    name: "Goa & Maharashtra",
    sortOrder: 10,
    image: "goa-sunset-beach.webp",
    altText: "Palm-lined Goa beach beside the Arabian Sea at sunset",
    summary:
      "Goa's relaxed coast paired with the green hill stations, viewpoints and family attractions of Maharashtra.",
  },
  {
    slug: "sikkim-darjeeling",
    name: "Sikkim & Darjeeling",
    sortOrder: 11,
    image: "sikkim-gangtok.webp",
    altText: "Gangtok's hillside town and Himalayan landscape",
    summary:
      "Himalayan towns, alpine valleys and mountain lakes across Gangtok and Lachung, paired with Darjeeling's tea gardens and heritage railway.",
  },
  {
    slug: "east-india",
    name: "East India",
    sortOrder: 12,
    image: "east-india-puri-jagannath.webp",
    altText: "Jagannath Temple's exterior in Puri",
    summary:
      "Pilgrimage and heritage journeys linking Kolkata, Gangasagar, Puri, Konark and Bhubaneswar with the sacred cities and riverfronts along the wider route.",
  },
  {
    slug: "south-india",
    name: "South India",
    sortOrder: 13,
    image: "south-india-rameswaram.webp",
    altText: "The Ramanathaswamy Temple exterior in Rameswaram",
    summary:
      "Temple towns, coastal pilgrimage sites, hill stations and royal heritage across Tirupati, Rameswaram, Kanyakumari, Ooty and Mysore.",
  },
  {
    slug: "thailand",
    name: "Thailand",
    sortOrder: 14,
    image: "thailand-pattaya-bay.webp",
    altText: "Pattaya's crescent bay from an elevated viewpoint",
    summary:
      "Coastal sightseeing in Pattaya, a Coral Island excursion and Bangkok temple visits, with hotel stays and transfers tailored to the confirmed trip plan.",
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
    slug: "amarnath-vaishno-devi-yatra",
    title: "Amarnath & Vaishno Devi Yatra",
    destinationSlug: "kashmir",
    categorySlug: "pilgrimage",
    startingCity: "Rajkot",
    startingPrice: "16000.00",
    durationDays: 13,
    summary:
      "A 13-day pilgrimage from Rajkot covering Amarnath, Vaishno Devi, Srinagar, Pahalgam, Amritsar and selected Rajasthan stops.",
    overview:
      "Travel from Rajkot on a broad pilgrimage circuit featuring Juna Ranuja, Karni Mata Temple, Amritsar's Golden Temple and Wagah Border, Vaishno Devi Temple, Pahalgam, Amarnath Yatra, Srinagar, Jaipur, Pushkar and a return route via Shrinathji. The reference fare starts at ₹16,000 per person for non-AC travel, with an AC option shown at ₹19,500 per person. Exact July departure dates, route order, stays, permits, inclusions and transport details are confirmed before booking.",
    highlights: [
      "Amarnath Yatra and Vaishno Devi Temple",
      "Srinagar and Pahalgam",
      "Golden Temple and Wagah Border",
      "Jaipur, Pushkar and Karni Mata Temple",
      "Juna Ranuja and return via Shrinathji",
      "AC option from ₹19,500 per person",
    ],
    itinerary: [],
  },
  {
    slug: "kashmir-vaishno-devi-yatra",
    title: "Kashmir & Vaishno Devi Yatra",
    destinationSlug: "kashmir",
    categorySlug: "pilgrimage",
    startingCity: "Ahmedabad",
    startingPrice: "23000.00",
    durationDays: 12,
    summary:
      "A 12-day coach journey from Ahmedabad through Jodhpur, Amritsar, Kashmir, Vaishno Devi, Shiv Khori and Bikaner.",
    overview:
      "Travel by 2x2 AC sleeper luxury coach from Ahmedabad through Jodhpur and Amritsar to Srinagar, Gulmarg, Sonamarg and Pahalgam, then continue to Katra for Vaishno Devi and Shiv Khori before returning via Bikaner. Per-person fares are INR 23,000 with four-person room sharing, INR 25,000 with three-person sharing and INR 27,000 with two-person sharing. The route includes both hotel stops and overnight coach journeys. Listed local sightseeing transport, rides, attraction tickets and pilgrimage transport are paid separately. Departure dates, hotel details and the final schedule are confirmed before booking.",
    highlights: [
      "Srinagar sightseeing and Dal Lake",
      "Gulmarg, Sonamarg and Pahalgam",
      "Betaab Valley and Chandanwari",
      "Vaishno Devi darshan from Katra and Shiv Khori",
      "Jodhpur, Amritsar, Wagah Border and Bikaner",
      "2x2 AC sleeper luxury coach from Ahmedabad",
      "Four-person sharing: INR 23,000 per person",
      "Three-person sharing: INR 25,000 per person",
      "Two-person sharing: INR 27,000 per person",
    ],
    inclusions: [
      "2x2 AC sleeper luxury coach travel on the main route from Ahmedabad",
      "Hotel stays at the planned overnight stops in the confirmed sharing category",
      "Light morning breakfast during the journey",
      "Evening dinner during the journey",
    ],
    exclusions: [
      "Lunch unless arranged by the operator when feasible",
      "Local sightseeing rickshaws and vehicles, including Jodhpur and Shiv Khori transport",
      "Dal Lake shikara rides, boating and horse rides",
      "Gulmarg Gondola tickets and local transport for Gulmarg and Sonamarg sightseeing",
      "Pahalgam local sightseeing transport, including Betaab Valley and Chandanwari",
      "Vaishno Devi doli or helicopter services and other personal pilgrimage expenses",
      "Guide charges, palace tickets and other attraction entry fees",
      "Personal expenses and services not listed under inclusions",
    ],
    transportInformation:
      "The main route uses a 2x2 AC sleeper luxury coach. Depart Ahmedabad overnight before the first itinerary day. Overnight coach journeys also connect Jodhpur to Amritsar, Amritsar to Srinagar and the return route via Bikaner. The coach can reach only the points permitted by local traffic rules and access conditions; required local vehicles and rickshaws are at the traveller's expense.",
    accommodationNotes:
      "Planned hotel stops are one night in Jodhpur, one in Amritsar, three in Srinagar, one in Pahalgam or Srinagar, and two in Katra. Other overnight segments are coach journeys. Per-person fares are INR 23,000 for four-person room sharing, INR 25,000 for three-person sharing and INR 27,000 for two-person sharing. Hotel names, facilities and room arrangements are confirmed before booking.",
    importantInformation:
      "The programme contains 12 numbered itinerary days, with an overnight departure before Day 1 and an overnight return after Day 12. Confirm the full elapsed travel time and arrival dates before arranging onward travel. Light breakfast and dinner are arranged during the journey; lunch is provided only when feasible. Local sightseeing, rides and entry fees listed as exclusions are paid by travellers. The organiser may adjust the programme for weather, road access, traffic or local arrangements.",
    itinerary: [
      [
        "Jodhpur sightseeing",
        "After the overnight departure from Ahmedabad, arrive in Jodhpur for local sightseeing. Local rickshaw travel is at your own expense. Stay overnight in Jodhpur.",
      ],
      [
        "Jodhpur to Amritsar",
        "Leave Jodhpur after midday and continue towards Amritsar by coach. Spend the night travelling.",
      ],
      [
        "Amritsar and Wagah Border",
        "Explore Amritsar's local sights, then visit Wagah Border in the afternoon according to local timings. Stay overnight in Amritsar.",
      ],
      [
        "Amritsar to Srinagar",
        "Depart Amritsar after midday for Srinagar. Continue the overnight coach journey towards Kashmir.",
      ],
      [
        "Srinagar and Dal Lake",
        "Enjoy Srinagar local sightseeing, with a Dal Lake shikara ride available at your own expense. Stay overnight in Srinagar.",
      ],
      [
        "Gulmarg excursion",
        "Travel from Srinagar to Gulmarg and return to Srinagar for the night. Gondola rides and applicable local sightseeing transport are at your own expense and subject to availability.",
      ],
      [
        "Sonamarg excursion",
        "Visit Sonamarg from Srinagar, with local sightseeing expenses paid separately. Return to Srinagar for the overnight stay.",
      ],
      [
        "Pahalgam, Betaab Valley and Chandanwari",
        "Continue to Pahalgam for local sightseeing including Betaab Valley and Chandanwari, using local arrangements at your own expense. Stay overnight in Pahalgam or Srinagar according to the confirmed plan.",
      ],
      [
        "Pahalgam to Katra",
        "Depart the Pahalgam area and travel towards Katra. Stay overnight in Katra in preparation for the Vaishno Devi visit.",
      ],
      [
        "Vaishno Devi darshan",
        "Set out from Katra for Vaishno Devi darshan. Walking, doli or helicopter arrangements depend on your preference and availability; paid services are at your own expense. Stay overnight in Katra.",
      ],
      [
        "Shiv Khori and overnight travel",
        "Visit Shiv Khori from Katra using local sightseeing vehicles at your own expense. Continue the return route overnight by coach.",
      ],
      [
        "Bikaner and return to Ahmedabad",
        "Arrive in Bikaner in the afternoon, freshen up and enjoy local sightseeing. Afterwards, begin the overnight return journey to Ahmedabad.",
      ],
    ],
  },
  {
    slug: "khatu-shyam-salasar-sanwariya-yatra",
    title: "Khatu Shyam, Salasar Balaji & Sanwariya Seth Yatra",
    destinationSlug: "rajasthan",
    categorySlug: "pilgrimage",
    startingCity: "Ahmedabad",
    startingPrice: "4999.00",
    durationDays: 2,
    summary:
      "A compact AC sleeper pilgrimage from Ahmedabad covering Khatu Shyam, Salasar Balaji and Shri Sanwariya Seth.",
    overview:
      "Travel from Ahmedabad by 2x2 AC sleeper coach for darshan at Khatu Shyam Ji, Salasar Balaji and Shri Sanwariya Seth. The package includes the meals and AC hotel stay listed below. The departure date, pickup point, darshan timings and live availability are confirmed before booking.",
    highlights: [
      "Khatu Shyam Ji darshan",
      "Salasar Balaji temple visit",
      "Shri Sanwariya Seth temple visit",
      "2x2 AC sleeper coach travel",
      "Meals and AC hotel stay",
    ],
    inclusions: [
      "2x2 AC sleeper coach travel from Ahmedabad",
      "Morning tea and breakfast",
      "Lunch",
      "Light evening meal",
      "AC hotel accommodation",
    ],
    exclusions: [
      "Personal expenses and optional purchases",
      "Temple donations, VIP darshan or special-entry charges",
      "Meals and services not listed under inclusions",
    ],
    transportInformation:
      "Travel is planned by 2x2 AC sleeper coach from Ahmedabad. The final pickup point and departure time are confirmed before travel.",
    accommodationNotes:
      "AC hotel accommodation is included. The hotel name and room-sharing arrangement are confirmed with the final booking.",
    importantInformation:
      "Departure date, darshan timings and route order are subject to availability, traffic, temple arrangements and local conditions.",
    itinerary: [
      [
        "Ahmedabad to Khatu Shyam",
        "Depart Ahmedabad in the evening by AC sleeper coach for the overnight journey to Khatu Shyam Ji.",
      ],
      [
        "Khatu Shyam, Salasar Balaji and Sanwariya Seth",
        "Complete the planned temple visits with the listed meals, then begin the return journey to Ahmedabad after dinner.",
      ],
    ],
  },
  {
    slug: "ayodhya-kashi-nepal-yatra",
    title: "Ayodhya, Kashi & Nepal Grand Yatra",
    destinationSlug: "north-india-nepal",
    categorySlug: "pilgrimage",
    startingCity: "Ahmedabad",
    startingPrice: "23000.00",
    durationDays: 13,
    summary:
      "A 13-day pilgrimage from Ahmedabad through Jaipur, Braj, Ayodhya, Kathmandu, Kashi, Prayagraj, Pushkar, Udaipur and Gujarat temple stops.",
    overview:
      "Travel by 2x2 AC sleeper coach on an extensive pilgrimage covering Jaipur, Gokul, Raman Reti, Vrindavan, Mathura, Ayodhya, Chhapaiya, Gorakhpur, Kathmandu, Pashupatinath, Varanasi, Kashi Vishwanath, Prayagraj, Pushkar, Shrinathji, Udaipur, Shamlaji and Dakor. The upper sleeper fare starts at ₹23,000 per person, while the lower sleeper fare is ₹25,000 per person. Departure dates, border requirements, pickup details and live availability are confirmed before booking.",
    highlights: [
      "Ayodhya, Chhapaiya and the Braj pilgrimage circuit",
      "Kathmandu and Pashupatinath Temple",
      "Varanasi ghats and Kashi Vishwanath darshan",
      "Prayagraj, Pushkar, Shrinathji and Udaipur",
      "Upper sleeper from ₹23,000; lower sleeper ₹25,000",
      "2x2 AC sleeper luxury coach",
    ],
    inclusions: [
      "2x2 AC sleeper luxury coach travel from Ahmedabad",
      "Morning tea and breakfast",
      "Lunch",
      "Light evening meal",
      "AC hotel accommodation",
    ],
    exclusions: [
      "Personal expenses and optional purchases",
      "Temple donations, VIP darshan or special-entry charges",
      "Nepal border documentation or charges unless specifically confirmed",
      "Meals and services not listed under inclusions",
    ],
    transportInformation:
      "The route is planned by 2x2 AC sleeper luxury coach from Ahmedabad. The final pickup point, departure time and Nepal border arrangements are confirmed before travel.",
    accommodationNotes:
      "AC hotel accommodation is included at planned overnight stops. Hotel names, room sharing and any overnight coach journeys are confirmed with the final itinerary.",
    importantInformation:
      "Travellers must carry the identification and documents required for the Nepal border. Route order, darshan timings and overnight stops may change with traffic, border procedures, temple arrangements and local conditions.",
    itinerary: [
      ["Ahmedabad to Jaipur", "Depart Ahmedabad by AC sleeper coach for the overnight journey to Jaipur."],
      ["Jaipur", "Explore the planned Jaipur sights and stay overnight in Jaipur."],
      ["Jaipur to Gokul", "Continue toward Gokul and Raman Reti, followed by the planned overnight stay."],
      ["Vrindavan and Mathura", "Visit Vrindavan and Mathura, then depart toward Ayodhya for an overnight coach journey."],
      ["Ayodhya and Chhapaiya", "Complete the planned Ayodhya and Chhapaiya visits and stay overnight in Ayodhya."],
      ["Ayodhya to Gorakhpur", "Travel through Gorakhpur and continue toward Nepal on the overnight journey."],
      ["Kathmandu and Pashupatinath", "Explore Kathmandu and visit Pashupatinath Temple, followed by an overnight stay."],
      ["Kathmandu to Sonauli", "Travel from Kathmandu toward the Sonauli border and continue overnight."],
      ["Varanasi and Kashi", "Visit the Varanasi ghats and Kashi Vishwanath Temple, followed by an overnight stay."],
      ["Prayagraj", "Continue from Varanasi to Prayagraj for the planned pilgrimage visit, then travel overnight."],
      ["Pushkar", "Visit Pushkar and complete the planned sightseeing before the onward overnight journey."],
      ["Shrinathji and Udaipur", "Visit Shrinathji and continue to Udaipur for the planned overnight stay."],
      ["Shamlaji, Dakor and Ahmedabad", "Visit Shamlaji and Dakor before completing the return journey to Ahmedabad."],
    ],
  },
  {
    slug: "maharashtra-jyotirlinga-saputara-yatra",
    title: "Maharashtra Jyotirlinga & Saputara Yatra",
    destinationSlug: "maharashtra",
    categorySlug: "pilgrimage",
    startingCity: "Ahmedabad",
    startingPrice: "13999.00",
    durationDays: 8,
    summary:
      "An eight-day AC sleeper pilgrimage from Ahmedabad through Saputara, Nashik, Shirdi, Maharashtra's Jyotirlingas and celebrated heritage sites.",
    overview:
      "Travel from Ahmedabad through Unai hot springs, Saputara, Nashik, Panchavati and the Godavari before visiting Trimbakeshwar, Shirdi, Shani Shingnapur, Aurangabad, Bibi Ka Maqbara, Daulatabad Fort, Ellora Caves, Grishneshwar, Aundha Nagnath, Ambajogai, Parli Vaijnath, Tulja Bhavani, Pandharpur and Bhimashankar. The listed fare is ₹13,999 per person. Departure dates, pickup details, route order and live availability are confirmed before booking.",
    highlights: [
      "Trimbakeshwar, Grishneshwar, Aundha Nagnath, Parli Vaijnath and Bhimashankar",
      "Shirdi Sai Baba and Shani Shingnapur",
      "Saputara, Unai, Nashik, Panchavati and the Godavari",
      "Bibi Ka Maqbara, Daulatabad Fort and Ellora Caves",
      "Tulja Bhavani and Pandharpur Vitthal Temple",
      "2x2 AC sleeper luxury coach",
    ],
    inclusions: [
      "2x2 AC sleeper luxury coach travel from Ahmedabad",
      "Morning tea and breakfast",
      "Lunch",
      "Light evening meal",
      "AC hotel accommodation",
    ],
    exclusions: [
      "Personal expenses and optional purchases",
      "Temple donations, VIP darshan or special-entry charges",
      "Local transport, guides or attraction tickets unless specifically confirmed",
      "Meals and services not listed under inclusions",
    ],
    transportInformation:
      "Travel is planned by 2x2 AC sleeper luxury coach from Ahmedabad. The final pickup point, departure time and daily route are confirmed before travel.",
    accommodationNotes:
      "AC hotel accommodation is included at planned overnight stops. Hotel names, room sharing and overnight coach journeys are confirmed with the final itinerary.",
    importantInformation:
      "The displayed route follows the supplied sightseeing list. Daily order, darshan timings and overnight stops may change with traffic, temple arrangements, monsoon conditions and local access.",
    itinerary: [
      ["Ahmedabad, Unai and Saputara", "Depart Ahmedabad and travel through Unai hot springs to the green hill landscapes around Saputara."],
      ["Nashik and Panchavati", "Continue to Nashik for Panchavati and the Godavari river pilgrimage sites."],
      ["Trimbakeshwar, Shirdi and Shani Shingnapur", "Visit Trimbakeshwar Jyotirlinga, Shirdi Sai Baba Temple and Shani Shingnapur."],
      ["Aurangabad, Daulatabad and Ellora", "Explore Bibi Ka Maqbara, Daulatabad Fort and the rock-cut heritage of the Ellora Caves."],
      ["Grishneshwar and Aundha Nagnath", "Complete darshan at Grishneshwar Jyotirlinga and Aundha Nagnath Jyotirlinga."],
      ["Ambajogai and Parli Vaijnath", "Visit Ambajogai Temple and Parli Vaijnath Jyotirlinga."],
      ["Tulja Bhavani and Pandharpur", "Continue to Tulja Bhavani Temple and Pandharpur's Vitthal Temple."],
      ["Bhimashankar and Ahmedabad", "Visit Bhimashankar Jyotirlinga and begin the return journey to Ahmedabad."],
    ],
  },
  {
    slug: "ujjain-indore-omkareshwar-yatra",
    title: "Ujjain, Indore & Omkareshwar Yatra",
    destinationSlug: "madhya-pradesh",
    categorySlug: "pilgrimage",
    startingCity: "Ahmedabad",
    startingPrice: "5999.00",
    durationDays: 3,
    summary:
      "A three-day AC coach pilgrimage from Ahmedabad covering Ujjain, Indore, Omkareshwar and Mamleshwar.",
    overview:
      "Travel from Ahmedabad for Mahakaleshwar darshan and Ujjain's important temples, continue to Indore for Rajwada and shopping, then visit Omkareshwar, Mamleshwar, the Narmada–Kaveri Sangam and the Navgraha Shani Temple. The listed fare is ₹5,999 per person. Departure dates, pickup details, darshan timings and live availability are confirmed before booking.",
    highlights: [
      "Mahakaleshwar, Kal Bhairav and Harsiddhi temples",
      "Meldi Mata and Bade Ganesh temples",
      "Indore Rajwada and shopping time",
      "Omkareshwar and Mamleshwar temples",
      "Narmada–Kaveri Sangam and Navgraha Shani Temple",
      "2x2 AC coach travel",
    ],
    inclusions: [
      "2x2 AC coach travel from Ahmedabad",
      "Morning tea and breakfast",
      "Lunch",
      "Light evening meal",
      "AC hotel accommodation",
    ],
    exclusions: [
      "Personal expenses and optional purchases",
      "Temple donations, VIP darshan or special-entry charges",
      "Local transport, guides or attraction tickets unless specifically confirmed",
      "Meals and services not listed under inclusions",
    ],
    transportInformation:
      "Travel is planned by 2x2 AC coach from Ahmedabad. The final pickup point, departure time and daily route are confirmed before travel.",
    accommodationNotes:
      "AC hotel accommodation is included. The hotel name and room-sharing arrangement are confirmed with the final booking.",
    importantInformation:
      "This package is presented as three days and two nights based on the three itinerary days shown in the supplied poster. Darshan timings and route order may change with traffic, temple arrangements and local conditions.",
    itinerary: [
      [
        "Ujjain and Mahakaleshwar",
        "Visit Mahakaleshwar Temple, Kal Bhairav Temple, Meldi Mata Temple, Harsiddhi Temple and Bade Ganesh Temple.",
      ],
      [
        "Indore",
        "Explore Indore's Rajwada heritage area and enjoy the planned shopping time.",
      ],
      [
        "Omkareshwar and Mamleshwar",
        "Visit Omkareshwar Temple, Mamleshwar Temple, the Narmada–Kaveri Sangam and the Navgraha Shani Temple before the return journey.",
      ],
    ],
  },
  {
    slug: "lonavala-khandala-matheran-mahabaleshwar",
    title: "Lonavala, Khandala, Matheran & Mahabaleshwar Escape",
    destinationSlug: "maharashtra",
    categorySlug: "weekend",
    startingCity: "Ahmedabad",
    startingPrice: "7499.00",
    durationDays: 3,
    summary:
      "A three-day AC sleeper hill-station escape from Ahmedabad through Lonavala, Khandala, Matheran and Mahabaleshwar.",
    overview:
      "Discover the misty Western Ghats across Lonavala, Khandala, Matheran and Mahabaleshwar on a compact three-day journey. The listed fare is INR 7,499 per person. Departure dates, pickup details, sightseeing order and live availability are confirmed before booking.",
    highlights: [
      "Monsoon landscapes of Lonavala and Khandala",
      "Matheran's forest trails and valley viewpoints",
      "Mahabaleshwar's highland scenery",
      "Three-day Western Ghats circuit from Ahmedabad",
      "2x2 AC sleeper luxury coach",
    ],
    inclusions: [
      "2x2 AC sleeper luxury coach travel from Ahmedabad",
      "Morning tea and breakfast",
      "Lunch",
      "Light evening meal",
      "AC hotel accommodation",
    ],
    exclusions: [
      "Personal expenses and optional purchases",
      "Attraction tickets or local transport unless specifically confirmed",
      "Activities and services not listed under inclusions",
      "Meals not listed under inclusions",
    ],
    transportInformation:
      "Travel is planned by 2x2 AC sleeper luxury coach from Ahmedabad. The final pickup point, departure time and route are confirmed before travel.",
    accommodationNotes:
      "AC hotel accommodation is included. The hotel name, overnight location and room-sharing arrangement are confirmed with the final booking.",
    importantInformation:
      "Hill-station sightseeing and route order may change with monsoon weather, road conditions and local access. Departure dates, pickup details and live availability are confirmed before booking.",
    itinerary: [
      [
        "Lonavala and Khandala",
        "Travel from Ahmedabad and explore selected green valleys, waterfalls and scenic viewpoints around Lonavala and Khandala, subject to local conditions.",
      ],
      [
        "Matheran",
        "Enjoy Matheran's vehicle-free forest trails, red-earth paths and selected valley viewpoints.",
      ],
      [
        "Mahabaleshwar and return",
        "Discover selected Mahabaleshwar viewpoints and highland scenery before beginning the return journey to Ahmedabad.",
      ],
    ],
  },
  {
    slug: "diwali-lonavala-khandala-matheran-mahabaleshwar",
    title: "Diwali Special: Lonavala, Khandala, Matheran & Mahabaleshwar",
    destinationSlug: "maharashtra",
    categorySlug: "family",
    startingCity: "Ahmedabad",
    startingPrice: "13499.00",
    durationDays: 5,
    summary:
      "A five-day Diwali holiday from Ahmedabad covering Matheran, Lonavala, Khandala, Mahabaleshwar and Panchgani.",
    overview:
      "Travel from Ahmedabad by 2x2 AC sleeper luxury coach for a five-day, four-night hill-station holiday through Matheran, Lonavala, Khandala, Mahabaleshwar and Panchgani. The listed fare is INR 13,499 per person. The journey begins with an afternoon departure before Day 1. Exact departure dates, pickup details, sightseeing order and live availability are confirmed before booking.",
    highlights: [
      "Matheran sightseeing and hill-station stay",
      "Lonavala and Khandala landscapes",
      "Two nights in Mahabaleshwar",
      "Panchgani and Mapro Garden",
      "2x2 AC sleeper luxury coach from Ahmedabad",
      "Five-day, four-night Diwali holiday",
    ],
    inclusions: [
      "2x2 AC sleeper luxury coach travel from Ahmedabad",
      "Morning tea and breakfast",
      "Lunch",
      "Light evening meal",
      "AC hotel accommodation for four nights",
    ],
    exclusions: [
      "Personal expenses and optional purchases",
      "Attraction tickets, activity charges or guides unless specifically confirmed",
      "Local transport charges unless included in the final written confirmation",
      "Meals and services not listed under inclusions",
    ],
    transportInformation:
      "The main journey is planned by 2x2 AC sleeper luxury coach from Ahmedabad. Where the coach cannot access a sightseeing point, a tempo traveller or car may be used. Final vehicle arrangements, pickup point and departure time are confirmed before travel.",
    accommodationNotes:
      "The four planned hotel nights are Matheran, Lonavala and two nights in Mahabaleshwar. AC hotel names and room-sharing arrangements are confirmed with the final booking.",
    importantInformation:
      "Matheran and other sightseeing may involve substantial walking. The organiser may change the programme because of weather, road conditions, local access or operational requirements. Departure dates and live availability are confirmed before booking.",
    cancellationRules:
      "The supplied poster states that a confirmed booking is non-refundable if cancelled. The final written cancellation terms must be reviewed and accepted before payment.",
    itinerary: [
      [
        "Matheran",
        "After the preceding afternoon departure from Ahmedabad, arrive for Matheran sightseeing on foot and stay overnight in Matheran.",
      ],
      [
        "Matheran to Lonavala",
        "Travel from Matheran to Lonavala, explore selected Lonavala and Khandala sights, and stay overnight in Lonavala.",
      ],
      [
        "Lonavala to Mahabaleshwar",
        "Continue from Lonavala to Mahabaleshwar and settle in for the first overnight stay.",
      ],
      [
        "Mahabaleshwar",
        "Enjoy selected Mahabaleshwar viewpoints and local sightseeing before a second overnight stay.",
      ],
      [
        "Panchgani and return",
        "Visit Panchgani and Mapro Garden, then begin the return journey to Ahmedabad.",
      ],
    ],
  },
  {
    slug: "diwali-goa-mahabaleshwar-lonavala-imagica",
    title: "Diwali Special: Goa, Mahabaleshwar, Lonavala & Imagica",
    destinationSlug: "goa-maharashtra",
    categorySlug: "family",
    startingCity: "Ahmedabad",
    startingPrice: "17999.00",
    durationDays: 8,
    summary:
      "An eight-day Diwali holiday from Ahmedabad with three nights in Goa, two in Mahabaleshwar and two in Lonavala.",
    overview:
      "Enjoy a seven-night holiday combining Goa's coast with Mahabaleshwar, Lonavala, Khandala and the Imagica amusement-park stop near Khopoli. The starting fare is INR 17,999 per person for an upper-sofa seat, while the lower-sofa option is INR 19,999 per person. Exact departure dates, pickup details, vehicle configuration, sightseeing order and live availability are confirmed before booking.",
    highlights: [
      "Three nights in Goa with sightseeing",
      "Two nights in Mahabaleshwar",
      "Two nights in Lonavala",
      "Lonavala and Khandala sightseeing",
      "Imagica amusement-park stop",
      "Upper-sofa fare from INR 17,999 per person",
      "Lower-sofa option at INR 19,999 per person",
    ],
    inclusions: [
      "Coach travel from Ahmedabad in the confirmed sofa seating category",
      "Morning tea and breakfast",
      "Lunch",
      "Light evening meal",
      "AC hotel accommodation for seven nights",
    ],
    exclusions: [
      "Personal expenses and optional purchases",
      "Imagica admission and ride tickets unless specifically confirmed",
      "Other attraction tickets, activities, guides or local transport unless specifically confirmed",
      "Meals and services not listed under inclusions",
    ],
    transportInformation:
      "Upper-sofa travel starts at INR 17,999 per person; lower-sofa travel is INR 19,999 per person. The final coach type, seat or berth layout, Ahmedabad pickup point and departure time are confirmed before booking.",
    accommodationNotes:
      "The planned stay includes three nights in Goa, two nights in Mahabaleshwar and two nights in Lonavala. AC hotel names and room-sharing arrangements are confirmed with the final booking.",
    importantInformation:
      "The suggested eight-day itinerary is based on seven hotel nights: three in Goa, two in Mahabaleshwar and two in Lonavala. Final travel days and sightseeing order are confirmed before booking. The organiser may change the programme because of weather, road conditions, attraction schedules or operational requirements.",
    itinerary: [
      [
        "Arrive in Goa",
        "Travel from Ahmedabad and begin the Goa stay with selected sightseeing, subject to the final arrival time.",
      ],
      [
        "Goa sightseeing",
        "Explore selected beaches, heritage areas and coastal viewpoints during the second day in Goa.",
      ],
      [
        "Goa at leisure",
        "Continue the planned Goa sightseeing with time to enjoy the coast before the third overnight stay.",
      ],
      [
        "Goa to Mahabaleshwar",
        "Travel from Goa to Mahabaleshwar and settle in for the first hill-station night.",
      ],
      [
        "Mahabaleshwar",
        "Visit selected Mahabaleshwar viewpoints and local sights before the second overnight stay.",
      ],
      [
        "Mahabaleshwar to Lonavala",
        "Continue to Lonavala for local sightseeing and the first overnight stay in the Lonavala area.",
      ],
      [
        "Khandala and Imagica",
        "Explore selected Lonavala and Khandala sights and visit the Imagica amusement-park stop according to the confirmed ticket plan.",
      ],
      [
        "Return to Ahmedabad",
        "Check out after the final Lonavala stay and begin the return journey to Ahmedabad.",
      ],
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
  {
    slug: "diwali-jaisalmer-sam-desert-tanot-longewala",
    title: "Diwali Special: Jaisalmer & Sam Desert",
    destinationSlug: "jaisalmer",
    categorySlug: "family",
    startingCity: "Ahmedabad",
    startingPrice: "7999.00",
    durationDays: 3,
    summary:
      "A three-day, two-night Diwali journey from Ahmedabad covering Jaisalmer, Tanot Mata, Longewala, Sam Sand Dunes, Kuldhara and Ranuja.",
    overview:
      "Travel from Ahmedabad by 2x2 AC sleeper coach for Jaisalmer's fort, havelis, Bada Bagh and Gadisar Lake, followed by Tanot Mata, Longewala and an evening in the Sam desert. The return route includes Kuldhara, Ramdevpir Temple at Ranuja and a planned Bullet Baba stop. Per-person fares are INR 7,999 with four-person room sharing, INR 8,999 with three-person sharing and INR 9,999 with two-person sharing. The two overnight stays are a Jaisalmer hotel and a desert tent camp. Departure dates, accommodation and the final travel plan are confirmed before booking.",
    highlights: [
      "Jaisalmer Golden Fort and heritage havelis",
      "Bada Bagh and Gadisar Lake",
      "Tanot Mata darshan and Longewala visit",
      "Sam Sand Dunes, jeep safari, camel ride and sunset",
      "Desert tent stay with a Rajasthani cultural evening, DJ and Garba",
      "Kuldhara village, Ramdevpir Temple at Ranuja and Bullet Baba",
      "Four-person sharing: INR 7,999 per person",
      "Three-person sharing: INR 8,999 per person",
      "Two-person sharing: INR 9,999 per person",
    ],
    inclusions: [
      "2x2 AC sleeper coach travel from Ahmedabad",
      "Morning tea and breakfast",
      "Lunch",
      "Light evening meal",
      "One night in an AC hotel in Jaisalmer",
      "One night in a desert tent camp at Sam",
    ],
    exclusions: [
      "Personal expenses and optional purchases",
      "Monument entry tickets, guides and temple donations unless specifically confirmed",
      "Optional activities and local transport not included in the final quotation",
      "Meals and services not listed under inclusions",
    ],
    transportInformation:
      "Travel is planned by 2x2 AC sleeper coach, with an overnight departure from Ahmedabad before the first sightseeing day and a return journey after the third day's evening meal. Final pickup details and timings are confirmed before travel.",
    accommodationNotes:
      "Night 1 is in a Jaisalmer AC hotel; night 2 is in a desert tent camp at Sam. The per-person fare is INR 7,999 for four-person room sharing, INR 8,999 for three-person sharing or INR 9,999 for two-person sharing. Hotel and camp names, tent facilities and sleeping arrangements are confirmed before booking.",
    importantInformation:
      "The three sightseeing days are accompanied by overnight outward and return coach journeys. Longewala and Tanot visits depend on local access. Jeep safari, camel ride and cultural-programme arrangements, including any separate charges, are confirmed in the final quotation. The Bullet Baba stop and sightseeing order depend on the final route. The organiser may adjust the programme for weather, traffic or local conditions.",
    itinerary: [
      [
        "Jaisalmer city, Bada Bagh and Gadisar Lake",
        "After the overnight coach journey from Ahmedabad, arrive in Jaisalmer for tea, breakfast and time to freshen up. Visit the Golden Fort, Patwon Ki Haveli and Salim Shah Haveli. After lunch, explore Bada Bagh and Gadisar Lake. Stay overnight in a Jaisalmer hotel.",
      ],
      [
        "Longewala, Tanot Mata and Sam Sand Dunes",
        "After tea and breakfast, visit Longewala and take darshan at Tanot Mata Temple. Reach Sam Sand Dunes in the late afternoon for the planned jeep safari, camel ride and sunset. Enjoy a Rajasthani cultural programme, DJ and Garba before the overnight tent stay.",
      ],
      [
        "Kuldhara, Ranuja and return to Ahmedabad",
        "After tea and breakfast, visit Kuldhara village and continue for Ramdevpir darshan at Ranuja. Include the planned Bullet Baba stop according to the confirmed route. After the evening meal, begin the return journey to Ahmedabad.",
      ],
    ],
  },
  {
    slug: "dwarka-somnath-diu-sasan-gir",
    title: "Dwarka, Somnath, Diu & Sasan Gir",
    destinationSlug: "gujarat-coast",
    categorySlug: "family",
    startingCity: "Ahmedabad",
    startingPrice: "7000.00",
    durationDays: 4,
    summary:
      "A four-day Gujarat journey from Ahmedabad linking Dwarka and Somnath with Diu's coast and the wildlife landscapes of Sasan Gir.",
    overview:
      "Travel from Ahmedabad on a compact three-night, four-day circuit through Dwarka, Somnath, Diu and Sasan Gir. The route combines temple visits, coastal heritage, Nagoa Beach and Gir's dry-forest landscape. The listed fare is INR 7,000 per person. Departure dates, pickup details, transport, safari arrangements and live availability are confirmed before booking.",
    highlights: [
      "Dwarkadhish Temple and Bet Dwarka",
      "Nageshwar Jyotirlinga and Somnath Temple",
      "Diu Fort, Gangeshwar Mahadev and Sunset Point",
      "Nagoa Beach",
      "Sasan Gir wildlife landscape",
      "Three-night, four-day circuit from Ahmedabad",
    ],
    inclusions: [
      "Morning tea and breakfast",
      "Lunch",
      "Light evening meal",
      "AC hotel accommodation",
    ],
    exclusions: [
      "Personal expenses and optional purchases",
      "Temple donations, VIP darshan or special-entry charges",
      "Gir safari permits, entry tickets and local safari vehicle charges unless specifically confirmed",
      "Attraction tickets, guides or local transport unless specifically confirmed",
      "Meals and services not listed under inclusions",
    ],
    transportInformation:
      "The poster does not specify a vehicle type. The final transport, Ahmedabad pickup point, departure time and route are confirmed before booking.",
    accommodationNotes:
      "AC hotel accommodation is included. Hotel names, overnight locations and room-sharing arrangements are confirmed with the final booking.",
    importantInformation:
      "Gir access and safari availability depend on permits, park schedules and local rules. Sightseeing order may change with weather, traffic, temple timings and local access. Departure dates and live availability are confirmed before booking.",
    itinerary: [
      [
        "Dwarka",
        "Visit Dwarkadhish Temple, Nageshwar Jyotirlinga, Rukmini Temple, Gomti Ghat, Bet Dwarka, Gopi Talav and Shivrajpur Beach.",
      ],
      [
        "Somnath and Diu",
        "Continue through Somnath and explore Diu Fort, Gangeshwar Mahadev, Sunset Point and Diu Museum, subject to local timings.",
      ],
      [
        "Nagoa Beach",
        "Spend time at Nagoa Beach and enjoy Diu's relaxed coastal setting.",
      ],
      [
        "Sasan Gir and return",
        "Visit the Sasan Gir area before beginning the return journey. Any wildlife safari is subject to separate permit and booking confirmation.",
      ],
    ],
  },
  {
    slug: "gangtok-lachung-darjeeling",
    title: "Gangtok, Lachung & Darjeeling",
    destinationSlug: "sikkim-darjeeling",
    categorySlug: "family",
    startingCity: "NJP / Bagdogra",
    startingPrice: "21000.00",
    durationDays: 8,
    summary:
      "An eight-day, seven-night Himalayan journey through Gangtok, Lachung and Darjeeling from INR 21,000 per adult, with breakfast, dinner and private transfers.",
    overview:
      "Explore Sikkim and Darjeeling on a seven-night, eight-day journey starting and ending at NJP Railway Station or Bagdogra Airport. Visit Gangtok, Tsomgo Lake, Baba Mandir, Lachung, Yumthang Valley and Zero Point before continuing to Darjeeling for Tiger Hill, heritage sights and tea gardens. The listed package cost is INR 21,000 per adult with selected hotel stays, daily breakfast and dinner, and private transfers and sightseeing. Nathula Pass permits cost an additional INR 4,500 per cab and Zero Point permits an additional INR 4,000 per cab. Departure dates, group arrangements, hotel availability and permits are confirmed before booking.",
    highlights: [
      "Seven nights and eight days from NJP Railway Station or Bagdogra Airport",
      "Gangtok, MG Marg, Tsomgo Lake and Baba Mandir",
      "Lachung, Yumthang Valley and Zero Point",
      "Darjeeling, Tiger Hill, Batasia Loop and tea gardens",
      "Heritage Toy Train and ropeway visits; tickets charged separately",
      "Daily breakfast and dinner with private transfers and sightseeing",
      "INR 21,000 per adult",
    ],
    inclusions: [
      "Seven nights of accommodation in the selected hotels or similar properties",
      "Daily breakfast and dinner (MAP meal plan)",
      "Private vehicle for the included transfers and sightseeing",
      "Pickup and drop at NJP Railway Station or Bagdogra Airport",
      "Driver allowance and fuel charges",
      "Parking charges and toll taxes",
    ],
    exclusions: [
      "Airfare and train tickets to and from the pickup point",
      "Lunch and meals not listed under inclusions",
      "Nathula Pass permit: INR 4,500 per cab, additional",
      "Zero Point permit: INR 4,000 per cab, additional",
      "Personal expenses, laundry and shopping",
      "Attraction entry fees, activity tickets, Toy Train and ropeway charges",
      "Guide charges and optional activities",
      "Anything not mentioned under inclusions",
    ],
    transportInformation:
      "Private transfers and sightseeing start and end at NJP Railway Station or Bagdogra Airport. The reference vehicle arrangement lists two Innova Crysta vehicles, with Scorpio, Maxx or Tempo Traveller options according to the confirmed group plan. The final vehicle type and allocation are confirmed before booking. Nathula Pass and Zero Point permits are charged separately per cab.",
    accommodationNotes:
      "Seven nights: three in Gangtok, two in Lachung and two in Darjeeling. Reference hotels are Zambala By Red Knott in Gangtok, Le Coxy Resort in Lachung and Little Tibet Resort in Darjeeling, or similar properties. The reference group allocation is four deluxe rooms with extra beds; this is a group arrangement, not four rooms per adult. Final hotels, room sharing and extra-bed arrangements are confirmed before payment.",
    importantInformation:
      "Payment policy: 50% advance is required for booking confirmation; the remaining balance is due 10 days before travel. The listed price is INR 21,000 per adult. Nathula Pass is optional and its permit costs INR 4,500 per cab; the Zero Point permit costs INR 4,000 per cab. Mount Katao is optional and subject to permit confirmation. High-altitude excursions and sightseeing depend on permits, weather, road access and available time. Confirm departure dates, permits, room sharing, vehicle allocation and any optional activity costs before booking. Images are for reference only. Actual hotels and views may vary.",
    cancellationRules:
      "More than 30 days before travel: INR 2,000 per person. 15-30 days before travel: 35% of the package cost. 7-14 days before travel: 75% of the package cost. Less than 7 days before travel: 100% of the package cost. No refund is applicable for unused services.",
    itinerary: [
      [
        "NJP / Bagdogra arrival and transfer to Gangtok",
        "Meet the representative at NJP Railway Station or Bagdogra Airport and transfer to Gangtok. Check in and relax after the journey. In the evening, visit MG Marg and explore local markets and cafes. Stay overnight in Gangtok.",
      ],
      [
        "Tsomgo Lake and Baba Mandir",
        "After breakfast, take a full-day excursion to Tsomgo Lake and Baba Harbhajan Singh Mandir. An optional Nathula Pass visit requires permit confirmation and an additional permit charge of INR 4,500 per cab. Return to Gangtok for the overnight stay.",
      ],
      [
        "Gangtok to Lachung",
        "After breakfast, drive towards Lachung with planned stops at Singhik View Point, Seven Sisters Waterfalls and Chungthang Confluence, subject to road access and time. Arrive in Lachung, check in and stay overnight.",
      ],
      [
        "Yumthang Valley and Zero Point",
        "Set out early for Yumthang Valley, the Valley of Flowers, and Zero Point (Yumesamdong), subject to permits and access. The Zero Point permit is an additional INR 4,000 per cab. Mount Katao is an optional visit subject to permit confirmation. Return to Lachung by evening for the overnight stay.",
      ],
      [
        "Lachung to Gangtok",
        "After breakfast, return to Gangtok through the Himalayan landscape. Spend the evening at leisure around MG Marg for shopping and local cafes. Stay overnight in Gangtok.",
      ],
      [
        "Gangtok sightseeing and transfer to Darjeeling",
        "After breakfast, explore selected Gangtok sights from the planned programme: Bakthang Waterfalls, Tashi View Point, Ganesh Tok, Enchey Monastery, Ropeway Cable Car, Directorate of Handicrafts and Handloom, Do Drul Chorten, Namgyal Institute of Tibetology, Flower Exhibition Centre and Banjhakri Falls. Stops depend on time and access; entry and activity tickets are extra. Later transfer to Darjeeling, check in and stay overnight.",
      ],
      [
        "Full-day Darjeeling sightseeing",
        "Visit Tiger Hill early for sunrise and views towards Kanchenjunga, weather permitting. The day's planned sights include Batasia Loop, Ghoom Monastery, Japanese Temple, the Heritage Toy Train, ropeway and a tea garden. Entry fees and activity tickets, including Toy Train and ropeway rides, are charged separately and subject to availability. Stay overnight in Darjeeling.",
      ],
      [
        "Departure via NJP Railway Station or Bagdogra Airport",
        "After breakfast, check out and transfer to NJP Railway Station or Bagdogra Airport for your onward journey.",
      ],
    ],
  },
  {
    slug: "char-dham-yatra-rajasthan-special",
    title: "Char Dham Yatra with Rajasthan Special",
    destinationSlug: "char-dham",
    categorySlug: "pilgrimage",
    startingCity: "Ahmedabad",
    startingPrice: "36000.00",
    durationDays: 16,
    summary:
      "A 16-day journey from Ahmedabad combining Yamunotri, Gangotri, Kedarnath and Badrinath with Haridwar, Jaipur, Jodhpur and Jaisalmer, from INR 36,000 per person.",
    overview:
      "Travel from Ahmedabad by 2x2 AC sleeper luxury coach on a Char Dham pilgrimage with a Rajasthan extension. The route covers Jaipur, Haridwar, Yamunotri, Gangotri, Kedarnath, Badrinath and Mana, with Tungnath, Rudraprayag, Dhari Devi and Devprayag along the planned route. Continue to Jodhpur and Jaisalmer, including camel and jeep safaris, Tanot Mata, Longewala Border and Bullet Baba before returning to Ahmedabad. The upper sleeper berth fare is INR 36,000 per person and the lower sleeper berth fare is INR 38,000 per person, with four-person room sharing. The 16-day programme includes overnight coach journeys as well as accommodation stops; departure dates and final arrangements are confirmed before booking.",
    highlights: [
      "Yamunotri, Gangotri, Kedarnath and Badrinath darshan",
      "Haridwar Ganga Aarti, Mansa Devi and Uttarkashi Kashi Vishwanath",
      "Tungnath, Rudraprayag Sangam, Mana, Dhari Devi and Devprayag",
      "Jaipur, Jodhpur and Jaisalmer sightseeing",
      "Camel safari and jeep safari in Jaisalmer included",
      "Tanot Mata, Longewala Border and Bullet Baba",
      "2x2 AC sleeper luxury coach from Ahmedabad",
      "Upper sleeper berth: INR 36,000 per person",
      "Lower sleeper berth: INR 38,000 per person",
      "Four-person room sharing",
    ],
    inclusions: [
      "2x2 AC sleeper luxury coach travel on the main route from Ahmedabad",
      "Accommodation at the confirmed overnight stops on a four-person room-sharing basis",
      "Morning breakfast",
      "Lunch",
      "Light evening meal",
      "Camel safari in Jaisalmer",
      "Jeep safari in Jaisalmer",
    ],
    exclusions: [
      "Local sightseeing vehicles and transport beyond the coach-accessible points",
      "Attraction entry fees",
      "Boating, ropeway and horse-riding charges",
      "Personal expenses and optional activities other than the included Jaisalmer camel and jeep safaris",
      "Meals and services not listed under inclusions",
    ],
    transportInformation:
      "The main journey uses a 2x2 AC sleeper luxury coach. Upper sleeper berths cost INR 36,000 per person and lower sleeper berths cost INR 38,000 per person. The coach travels only as far as road conditions and local access permit; required local sightseeing vehicles and other onward transport are charged separately. The programme includes overnight travel from Ahmedabad to Jaipur, from Jaipur towards Haridwar and on the return route from Uttarakhand towards Rajasthan. Pickup details and the final travel schedule are confirmed before departure.",
    accommodationNotes:
      "Room accommodation is on a four-person sharing basis. The programme lists overnight stays in Haridwar, Barkot, Uttarkashi, Guptkashi, Kedarnath, Pipalkoti and Jaisalmer. The 16-day duration also includes overnight coach travel; it does not promise 15 hotel nights. The poster leaves some overnight arrangements unspecified, including Day 14, so property names, facilities and the complete overnight plan must be confirmed before booking.",
    importantInformation:
      "Confirm departure dates, Char Dham access and registration requirements, the Kedarnath overnight arrangement and the full return schedule before booking. Temple visits, Tungnath and border-area sightseeing depend on seasonal access, weather and local conditions. The organiser may change the programme for road closures, traffic, weather or other unavoidable circumstances. Travellers are requested to cooperate with the final arrangements. Local vehicles, entry tickets, boating, ropeways, horse rides and personal expenses are extra; the listed Jaisalmer camel and jeep safaris are included. Images are for reference only. Actual hotels and views may vary.",
    itinerary: [
      [
        "Ahmedabad to Jaipur",
        "Depart Ahmedabad for Jaipur by 2x2 AC sleeper luxury coach. Travel overnight.",
      ],
      [
        "Jaipur sightseeing and onward to Haridwar",
        "Explore Jaipur, then leave for Haridwar. Continue the overnight coach journey.",
      ],
      [
        "Haridwar, Mansa Devi and Ganga Aarti",
        "Visit Mansa Devi, explore Haridwar and attend Ganga Aarti according to local timings. Stay overnight in Haridwar.",
      ],
      [
        "Haridwar to Barkot",
        "Travel from Haridwar to Barkot and settle in for the Yamunotri excursion. Stay overnight in Barkot.",
      ],
      [
        "Yamunotri darshan and return to Barkot",
        "Set out from Barkot for Yamunotri darshan using the available access route. Return to Barkot for the overnight stay. Local transport and horse-riding charges are extra.",
      ],
      [
        "Barkot to Uttarkashi and Kashi Vishwanath",
        "Leave Barkot for Uttarkashi and visit Kashi Vishwanath Temple. Stay overnight in Uttarkashi.",
      ],
      [
        "Gangotri darshan and return to Uttarkashi",
        "Travel from Uttarkashi to Gangotri for darshan and the planned Gangotri bathing stop, subject to local conditions. Return to Uttarkashi for the overnight stay.",
      ],
      [
        "Uttarkashi to Guptkashi",
        "Travel from Uttarkashi to Guptkashi and prepare for the Kedarnath visit. Stay overnight in Guptkashi.",
      ],
      [
        "Guptkashi to Kedarnath",
        "Depart Guptkashi at approximately 4:00 AM for the Kedarnath journey, subject to the confirmed access plan. The programme lists an overnight stay at Kedarnath; confirm accommodation and onward transport arrangements before booking.",
      ],
      [
        "Kedarnath to Guptkashi",
        "Return from Kedarnath to Guptkashi and rest after the pilgrimage. Stay overnight in Guptkashi.",
      ],
      [
        "Tungnath, Rudraprayag Sangam and Pipalkoti",
        "Leave Guptkashi for Pipalkoti with planned visits via Tungnath and Rudraprayag Sangam, subject to access and travel time. Stay overnight in Pipalkoti.",
      ],
      [
        "Badrinath darshan and Mana village",
        "Travel from Pipalkoti for Badrinath darshan and a visit to Mana village, subject to access. Return to Pipalkoti for the overnight stay.",
      ],
      [
        "Dhari Devi, Devprayag and Haridwar",
        "Leave Pipalkoti, visit Dhari Devi and continue via Devprayag to Haridwar. Begin the overnight onward journey towards Rajasthan.",
      ],
      [
        "Jodhpur sightseeing and transfer to Jaisalmer",
        "Arrive in Jodhpur according to the overnight journey schedule and take the planned sightseeing tour. Leave for Jaisalmer in the evening. Overnight arrangements for this day are confirmed with the final programme.",
      ],
      [
        "Jaisalmer sightseeing and desert safaris",
        "Explore Jaisalmer and enjoy the included camel safari and jeep safari according to the confirmed local schedule. Stay overnight in Jaisalmer.",
      ],
      [
        "Tanot Mata, Longewala, Bullet Baba and return",
        "Visit Tanot Mata and Longewala Border, subject to local access, and include Bullet Baba darshan on the planned return route to Ahmedabad. Confirm the final arrival time before arranging onward travel.",
      ],
    ],
  },
  {
    slug: "seven-jyotirlinga-darshan",
    title: "Seven Jyotirlinga Darshan",
    destinationSlug: "maharashtra",
    categorySlug: "pilgrimage",
    startingCity: "Ahmedabad",
    startingPrice: "14000.00",
    durationDays: 10,
    summary:
      "A 10-day pilgrimage from Ahmedabad covering seven Jyotirlingas across Maharashtra and Madhya Pradesh, with upper sleeper berths from INR 14,000 per person.",
    overview:
      "Join a ten-day pilgrimage for Trimbakeshwar, Grishneshwar, Aundha Nagnath, Parli Vaijnath, Bhimashankar, Omkareshwar and Mahakaleshwar darshan. The route also includes Nashik and Panchavati, Shirdi, Shani Dev, Aurangabad's Bibi Ka Maqbara, Ellora Caves, Daulatabad Fort, Ambajogai, Tulja Bhavani, Pandharpur, Ujjain and Dakor before returning to Ahmedabad. Travel is by 2x2 AC sleeper luxury coach. The upper sleeper berth fare is INR 14,000 per person and the lower sleeper berth fare is INR 15,000 per person, with four-person sharing in AC rooms at the confirmed accommodation stops. The programme includes overnight coach travel as well as hotel stays; departure dates and final arrangements are confirmed before booking.",
    highlights: [
      "Trimbakeshwar and Grishneshwar Jyotirlingas",
      "Aundha Nagnath and Parli Vaijnath Jyotirlingas",
      "Bhimashankar, Omkareshwar and Mahakaleshwar Jyotirlingas",
      "Nashik, Panchavati, the Godavari, Shirdi and Shani Dev darshan",
      "Bibi Ka Maqbara, Ellora Caves and Daulatabad Fort",
      "Ambajogai, Tulja Bhavani and Pandharpur Vitthal Temple",
      "Ujjain sightseeing, Harsiddhi Mata Aarti and Dakor Ranchhodraiji Temple",
      "2x2 AC sleeper luxury coach with four-person AC room sharing",
      "Upper sleeper berth: INR 14,000 per person",
      "Lower sleeper berth: INR 15,000 per person",
    ],
    inclusions: [
      "2x2 AC sleeper luxury coach travel on the main route from Ahmedabad",
      "AC room accommodation on a four-person sharing basis at the confirmed overnight stops",
      "Morning tea or coffee and breakfast as listed in the itinerary",
      "Lunch and dinner as listed in the itinerary",
    ],
    exclusions: [
      "Local sightseeing vehicles and transport beyond coach-accessible points",
      "Sightseeing and attraction entry fees",
      "Boating, ropeway and jeep-safari charges",
      "Personal expenses and optional activities",
      "Meals and services not listed under inclusions",
    ],
    transportInformation:
      "The main route uses a 2x2 AC sleeper luxury coach from Ahmedabad. Upper sleeper berths cost INR 14,000 per person and lower sleeper berths cost INR 15,000 per person. The reference programme starts at approximately 12:30 PM on Day 1; final pickup details and timings are confirmed before travel. The coach can travel only as far as road conditions and local access allow. Local sightseeing vehicles, entry fees and listed activity charges are paid separately by travellers.",
    accommodationNotes:
      "Accommodation is in AC rooms on a four-person sharing basis. Listed hotel stops are Nashik on Day 2, the Grishneshwar area on Day 3, Tulja Bhavani on Day 5 and Ujjain on Days 8 and 9. Days 4, 6 and 7 explicitly involve overnight travel, and the first night is the onward journey to Nashik. The ten-day programme therefore does not mean nine hotel nights. Hotel names, facilities, the first-night arrangement and the complete overnight schedule are confirmed before booking.",
    importantInformation:
      "The route follows the supplied Shravan pilgrimage programme; departure dates are confirmed separately. Temple visits, Aarti attendance and sightseeing depend on local timings, traffic, weather and access. The organiser may change the programme due to natural events, traffic, weather or other unavoidable circumstances, and travellers are requested to cooperate and report on time. Local vehicles, sightseeing tickets, boating, ropeways, jeep safaris and personal expenses are extra. Confirm the Day 1 evening temple stop and final return time before booking. Images are for reference only. Actual hotels and views may vary.",
    itinerary: [
      [
        "Ahmedabad departure and onward to Nashik",
        "Depart Ahmedabad at approximately 12:30 PM. Stop for the planned evening meal at an en-route temple, whose name is to be confirmed, then continue towards Nashik overnight.",
      ],
      [
        "Nashik, Panchavati and Trimbakeshwar",
        "Arrive in Nashik for tea or coffee and breakfast. Visit Panchavati and the Godavari river area. After lunch, continue for Trimbakeshwar Jyotirlinga darshan. Have dinner and stay overnight in Nashik.",
      ],
      [
        "Shirdi, Shani Dev and Aurangabad",
        "After tea or coffee and breakfast, travel to Shirdi for Sai Baba darshan. After lunch, continue for Shani Dev darshan and visit Aurangabad's Mini Taj Mahal, Bibi Ka Maqbara. Have dinner and stay overnight in the Grishneshwar area.",
      ],
      [
        "Grishneshwar, Ellora Caves and Daulatabad Fort",
        "After tea or coffee and breakfast, take darshan at Grishneshwar Jyotirlinga. After lunch, visit the Ellora Caves and Daulatabad Fort, subject to local opening times and access. Have dinner and continue the overnight journey towards Aundha Nagnath.",
      ],
      [
        "Aundha Nagnath, Parli Vaijnath and Ambajogai",
        "Arrive in the Aundha Nagnath area for tea or coffee and breakfast, then take Jyotirlinga darshan. Continue to Parli for lunch and Parli Vaijnath Jyotirlinga darshan, followed by Ambajogai darshan. Have dinner and stay overnight at Tulja Bhavani.",
      ],
      [
        "Tulja Bhavani and Pandharpur",
        "After tea or coffee and breakfast, visit Tulja Bhavani Temple. After lunch, continue to Pandharpur for Vitthal Temple darshan. After dinner, begin the overnight journey towards Bhimashankar.",
      ],
      [
        "Bhimashankar and onward to Omkareshwar",
        "Arrive at Bhimashankar for tea or coffee and breakfast, followed by Bhimashankar Jyotirlinga darshan. Continue towards Omkareshwar with an overnight journey.",
      ],
      [
        "Omkareshwar darshan and Ujjain",
        "After tea or coffee and breakfast, take darshan at Omkareshwar Jyotirlinga. After lunch, travel to Ujjain. Have dinner and stay overnight in Ujjain.",
      ],
      [
        "Ujjain, Harsiddhi Mata and Mahakaleshwar",
        "After tea or coffee and breakfast, explore Ujjain. After lunch, attend the planned Harsiddhi Mata Aarti and take darshan at Mahakaleshwar Jyotirlinga according to temple timings. Stay overnight in Ujjain.",
      ],
      [
        "Dakor Ranchhodraiji Temple and return to Ahmedabad",
        "After tea or coffee and breakfast, depart for Dakor. After lunch, take darshan at Ranchhodraiji Temple. Have dinner and return to Ahmedabad according to the confirmed travel schedule.",
      ],
    ],
  },
  {
    slug: "east-india-pilgrimage-tour",
    title: "East India Pilgrimage Tour",
    destinationSlug: "east-india",
    categorySlug: "pilgrimage",
    startingCity: "Keliya Vasna",
    startingPrice: "30999.00",
    durationDays: 15,
    summary:
      "A 15-day pilgrimage from Keliya Vasna through Ujjain, Chitrakoot, Prayagraj, Ayodhya, Kashi, Kolkata, Gangasagar, Puri and more, at INR 30,999 per person.",
    overview:
      "Explore the sacred cities and heritage sites of the East India pilgrimage circuit, beginning with an overnight departure from Keliya Vasna towards Ujjain. The 15-day programme continues through Chitrakoot, Prayagraj, Ayodhya, Chhapaiya, Kashi, a Vaijnath Jyotirlinga stop whose location requires confirmation, Kolkata, Gangasagar, Jagannath Puri, Konark and Bhubaneswar. Return via Sakshi Gopal, Amarkantak, Omkareshwar and Dakor, with a final Siddhivinayak Temple stop. The listed fare is INR 30,999 per person. The journey combines accommodation stops with overnight bus travel; departure dates, the Day 6 temple location, vehicle type, hotel category and room-sharing arrangements are confirmed before booking.",
    highlights: [
      "Mahakaleshwar darshan and Harsiddhi Mata Aarti in Ujjain",
      "Chitrakoot and Prayagraj's Triveni Sangam",
      "Ayodhya Ram Mandir and Chhapaiya Swaminarayan birthplace",
      "Kashi Vishwanath Jyotirlinga, Varanasi ghats and Ganga Aarti",
      "Vaijnath Jyotirlinga stop - exact location to be confirmed",
      "Kolkata sightseeing and Howrah Bridge",
      "Gangasagar and Jagannath Puri",
      "Konark Sun Temple, Bhubaneswar temples and Sakshi Gopal",
      "Amarkantak, Omkareshwar and Dakor Ranchhodraiji Temple",
      "INR 30,999 per person",
    ],
    inclusions: [
      "Bus travel on the main route described in the confirmed programme",
      "Overnight stays at the named stops, with property and room arrangements confirmed before booking",
      "Morning tea or coffee and breakfast as listed in the itinerary",
      "Lunch and dinner as listed in the itinerary",
    ],
    exclusions: [
      "Personal expenses and optional purchases",
      "Attraction tickets, guides or special-entry charges unless included in the final written quote",
      "Optional activities and local transport not included in the confirmed arrangements",
      "Meals and services not listed under inclusions",
    ],
    transportInformation:
      "The reference programme departs Keliya Vasna at approximately 8:00 PM for Ujjain on the night before Day 1. Bus journeys connect the main stops, including several overnight travel segments. The poster does not specify whether the vehicle is AC, sleeper or seated; the final vehicle type, pickup point and seating allocation must be confirmed before booking. Gangasagar includes a planned boat segment; boat arrangements and any separate charges are confirmed in the final quote.",
    accommodationNotes:
      "The 15 itinerary days list overnight stays in Ujjain on Day 1, Ayodhya on Days 3 and 4, Kolkata on Days 6 and 7, Bhubaneswar on Day 9, Amarkantak on Day 11 and Omkareshwar on Day 13. Nights after Days 2, 5, 8, 10, 12 and 14 are spent travelling. There is also an overnight departure before Day 1. The programme does not mean 14 hotel nights. Hotel names, category, AC facilities and room-sharing arrangements are not specified in the poster and require confirmation.",
    importantInformation:
      "The programme starts with an overnight departure before its 15 numbered itinerary days; confirm the full elapsed journey time and final arrival before arranging onward travel. Day 6 requires clarification: its heading names Baidyanath in Jharkhand, while the body text names Parli Vaijnath. The exact temple location is not yet confirmed. Days 12 and 13 both cover the onward journey towards Omkareshwar and have been retained as separate days. Confirm vehicle type, accommodation, Gangasagar boat arrangements and any separate ticket charges before booking. Temple access, Aarti timings, boat operations and sightseeing depend on weather and local conditions. Images are for reference only. Actual hotels and views may vary.",
    itinerary: [
      [
        "Ujjain, Harsiddhi Mata and Mahakaleshwar",
        "After the overnight departure from Keliya Vasna, arrive in Ujjain for tea or coffee and breakfast. Explore Ujjain and have lunch. In the evening, attend the planned Harsiddhi Mata Aarti and take darshan at Mahakaleshwar Jyotirlinga according to temple timings. Have dinner and stay overnight in Ujjain.",
      ],
      [
        "Ujjain to Chitrakoot",
        "After tea or coffee and breakfast, leave for Chitrakoot. Lunch and dinner are planned en route. Continue the overnight bus journey.",
      ],
      [
        "Chitrakoot, Prayagraj and onward to Ayodhya",
        "Arrive in Chitrakoot for tea or coffee and breakfast, followed by sightseeing and lunch. Continue to Prayagraj, also referred to as Allahabad in the programme, for Triveni Sangam. After the planned evening meal, continue to Ayodhya for the overnight stay.",
      ],
      [
        "Ayodhya and Chhapaiya",
        "After breakfast in Ayodhya, visit Chhapaiya, the birthplace of Swaminarayan, and have lunch. Continue for Ram Janmabhoomi and Ram Mandir darshan and the planned Aarti according to local timings. Stay overnight in Ayodhya.",
      ],
      [
        "Kashi Vishwanath, Varanasi ghats and Ganga Aarti",
        "After tea or coffee and breakfast, travel towards Kashi. Have lunch, visit the Varanasi ghats, attend the planned Ganga Aarti and take darshan at Kashi Vishwanath Jyotirlinga according to temple timings. Have dinner and continue the overnight journey.",
      ],
      [
        "Vaijnath Jyotirlinga stop and onward to Kolkata",
        "After tea or coffee and breakfast, take the planned Vaijnath Jyotirlinga darshan, then have lunch and continue to Kolkata for the overnight stay. The exact temple requires confirmation: the poster's heading says Baidyanath in Jharkhand, but its body text says Parli Vaijnath.",
      ],
      [
        "Kolkata and Howrah Bridge",
        "After tea or coffee and breakfast in Kolkata, visit Howrah Bridge and explore the city's planned sightseeing stops. Have lunch and dinner, with an overnight stay in Kolkata.",
      ],
      [
        "Gangasagar and onward to Jagannath Puri",
        "After tea or coffee and breakfast, travel to the Gangasagar shore with the planned boat segment. Have lunch, then continue towards Jagannath Puri in Odisha. Have dinner and travel overnight. Boat arrangements and any separate charges are confirmed before booking.",
      ],
      [
        "Jagannath Puri and Konark Sun Temple",
        "Arrive in Jagannath Puri for tea or coffee and breakfast, followed by Jagannath Temple darshan. After lunch, visit Konark Sun Temple according to local timings. Continue to Bhubaneswar for the overnight stay.",
      ],
      [
        "Bhubaneswar temples and Sakshi Gopal",
        "After tea or coffee and breakfast, explore Bhubaneswar, including Lingaraj Temple and Rajarani Temple. After lunch, continue for Sakshi Gopal darshan. Have dinner and begin the overnight onward journey.",
      ],
      [
        "Journey to Amarkantak",
        "Have tea or coffee and breakfast, then continue the bus journey. After lunch, travel onwards to Amarkantak. Have dinner and stay overnight in Amarkantak.",
      ],
      [
        "Amarkantak sightseeing and departure for Omkareshwar",
        "After tea or coffee and breakfast, explore Amarkantak and have lunch. Begin the journey towards Omkareshwar, with dinner en route and overnight bus travel.",
      ],
      [
        "Continue to Omkareshwar",
        "After tea or coffee and breakfast, continue the bus journey towards Omkareshwar. Have lunch en route and the planned evening meal. Stay overnight in Omkareshwar.",
      ],
      [
        "Omkareshwar darshan and onward to Dakor",
        "After tea or coffee and breakfast, take darshan at Omkareshwar Jyotirlinga. Have lunch and leave for Dakor, with dinner en route and overnight travel.",
      ],
      [
        "Dakor, Siddhivinayak Temple and return to Keliya Vasna",
        "Arrive in Dakor for tea or coffee and breakfast. Take darshan at Ranchhodraiji Temple and have lunch. Include the planned Siddhivinayak Temple stop and evening meal before returning to Keliya Vasna. The exact Siddhivinayak stop and final arrival time are confirmed with the operator.",
      ],
    ],
  },
  {
    slug: "south-india-rameswaram-ooty-mysore-tirupati",
    title: "South India Pilgrimage & Hill Stations",
    destinationSlug: "south-india",
    categorySlug: "pilgrimage",
    startingCity: "Ahmedabad",
    startingPrice: "33500.00",
    durationDays: 22,
    summary:
      "A 22-day South India tour plus the return journey, covering Rameswaram, Ooty, Mysore and Tirupati from Ahmedabad, with upper berths from INR 33,500 per person.",
    overview:
      "Travel from Ahmedabad by 2x2 AC sleeper luxury coach on a 22-day pilgrimage and sightseeing programme, followed by a separate return journey. The route combines Maharashtra's pilgrimage stops with Hyderabad, Srisailam Mallikarjuna, Tirupati Balaji, Vellore, Kanchipuram, Mahabalipuram, Chennai, Pondicherry, Srirangam, Rameswaram, Kanyakumari, Madurai, Ooty, Mysore and Bangalore. Continue via Pampa Sarovar, Pandharpur and Tulja Bhavani towards Nashik, then return through Saputara, Jogeshwar and Dakor to Ahmedabad. Upper sleeper berths cost INR 33,500 per person and lower sleeper berths INR 36,500 per person. AC rooms at the listed accommodation stops and Gujarati meals are included. The Trivandrum/Kerala excursion is self-paid. Departure dates, room sharing, darshan arrangements and the final return time are confirmed before booking.",
    highlights: [
      "Rameswaram darshan and Kanyakumari",
      "Ooty sightseeing, Mysore and Brindavan Gardens",
      "Tirupati Balaji, Vellore Golden Temple and Kanchipuram",
      "Srisailam Mallikarjuna Jyotirlinga and Hyderabad",
      "Mahabalipuram, Chennai, Pondicherry and Srirangam",
      "Trimbakeshwar, Bhimashankar, Grishneshwar, Parli Vaijnath and Aundha Nagnath",
      "Shirdi, Shani Dev, Ellora, Madurai, Bangalore and Pampa Sarovar",
      "Pandharpur, Tulja Bhavani and return via Saputara, Jogeshwar and Dakor",
      "22 tour days plus a separate return journey",
      "Upper sleeper berth: INR 33,500 per person",
      "Lower sleeper berth: INR 36,500 per person",
    ],
    inclusions: [
      "2x2 AC sleeper luxury coach travel on the main route from Ahmedabad and the planned return leg",
      "AC room accommodation at the confirmed hotel stops",
      "Gujarati meals as per the confirmed meal plan",
    ],
    exclusions: [
      "The Trivandrum/Kerala excursion marked as self-paid in the programme",
      "Personal expenses and optional purchases",
      "Special darshan tickets, attraction entry fees, guides or local transport unless included in the final written quote",
      "Optional activities and services not listed under inclusions",
    ],
    transportInformation:
      "Travel is by 2x2 AC sleeper luxury coach from Ahmedabad. The upper sleeper berth fare is INR 33,500 per person and the lower sleeper berth fare is INR 36,500 per person. The route includes both daytime transfers and overnight bus journeys. Pickup details, departure times and any required local transport are confirmed before travel. Return journey after the 22 tour days: continue via Saputara, Jogeshwar and Dakor to Ahmedabad. The overnight bus segment after Day 22 and final arrival belong to this separate return leg.",
    accommodationNotes:
      "AC rooms are included at the listed hotel stops: Nashik on Day 2; Shirdi on Days 3 and 4; Ellora on Day 5; Hyderabad on Day 7; Tirupati on Days 9 and 10; Mahabalipuram on Days 11 and 12; Kanyakumari on Days 14 and 15; Mysore on Days 17 and 18; and Pandharpur on Day 20. Other listed nights are spent on the bus, including the additional return journey after Day 22. The package does not promise 21 hotel nights. Hotel names, room-sharing arrangements, facilities and the final overnight plan are confirmed before booking.",
    importantInformation:
      "Duration is 22 tour days plus a separate return journey, as confirmed by the organiser. The source programme has 23 dated rows; the final row is the return through Saputara, Jogeshwar and Dakor to Ahmedabad, not an additional sightseeing day within the 22-day tour. Allow for the extra overnight bus journey after Day 22 and confirm the full elapsed travel time before arranging onward travel. The Trivandrum/Kerala excursion is self-paid. Gujarati meals and AC rooms are listed, but specific meal counts and room sharing are not supplied. Confirm darshan bookings, entry tickets, any local transfers and the final schedule before payment. Sightseeing and temple visits depend on travel time, access and local conditions. Images are for reference only. Actual hotels and views may vary.",
    itinerary: [
      [
        "Ahmedabad, Jogeshwar and Saputara towards Nashik",
        "Depart Ahmedabad and travel via Jogeshwar and Saputara towards Nashik. Spend the night travelling by coach.",
      ],
      [
        "Nashik, Trimbakeshwar and Muktidham",
        "Explore Nashik and visit Trimbakeshwar Jyotirlinga and Muktidham according to the confirmed sightseeing schedule. Stay overnight in Nashik.",
      ],
      [
        "Bhimashankar and Shirdi",
        "Leave at approximately 5:30 AM for Bhimashankar Jyotirlinga darshan, then continue to Shirdi. Stay overnight in Shirdi.",
      ],
      [
        "Shirdi and Shani Dev",
        "Visit Shirdi and the planned Shani Dev temple stop, then return to Shirdi for the overnight stay.",
      ],
      [
        "Grishneshwar and Ellora",
        "Travel from Shirdi for Grishneshwar Jyotirlinga darshan and continue to Ellora. Stay overnight in Ellora.",
      ],
      [
        "Parli Vaijnath, Aundha Nagnath and onward to Hyderabad",
        "Leave Ellora and visit Parli Vaijnath Jyotirlinga and Aundha Nagnath. Continue towards Hyderabad with an overnight coach journey.",
      ],
      [
        "Hyderabad sightseeing",
        "Explore Hyderabad's planned sightseeing stops. Stay overnight in Hyderabad.",
      ],
      [
        "Hyderabad to Srisailam",
        "Leave Hyderabad for the Srisailam Mallikarjuna Jyotirlinga pilgrimage. The programme lists overnight bus travel for this stage; exact darshan and transfer timings are confirmed before departure.",
      ],
      [
        "Mallikarjuna to Tirupati Balaji",
        "Continue from the Mallikarjuna pilgrimage stop towards Tirupati Balaji. Stay overnight in Tirupati.",
      ],
      [
        "Tirupati sightseeing and Balaji darshan",
        "Complete the planned Tirupati sightseeing and Balaji darshan according to confirmed temple arrangements. Stay overnight in Tirupati.",
      ],
      [
        "Vellore, Shiva Kanchi and Vishnu Kanchi",
        "Depart Tirupati for Vellore Golden Temple, then visit the planned Shiva Kanchi and Vishnu Kanchi stops in Kanchipuram. Continue to Mahabalipuram for the overnight stay.",
      ],
      [
        "Mahabalipuram and Chennai",
        "Travel from Mahabalipuram for sightseeing in Chennai, also referred to as Madras in the programme. Return to Mahabalipuram for the overnight stay.",
      ],
      [
        "Pondicherry, Srirangam and onward to Rameswaram",
        "Leave Mahabalipuram and continue via Pondicherry and Srirangam towards Rameswaram. Spend the night travelling by coach.",
      ],
      [
        "Rameswaram darshan and Kanyakumari",
        "Take darshan at Rameswaram and complete the planned sightseeing before continuing to Kanyakumari. Stay overnight in Kanyakumari.",
      ],
      [
        "Kanyakumari and self-paid Trivandrum/Kerala excursion",
        "Follow the planned Kanyakumari programme, with the Trivandrum/Kerala excursion at your own expense as stated in the poster. Confirm its arrangements and charges before booking. Stay overnight in Kanyakumari.",
      ],
      [
        "Kanyakumari, Madurai and onward to Ooty",
        "Leave Kanyakumari and travel via Madurai towards Ooty. Spend the night travelling by coach.",
      ],
      [
        "Ooty sightseeing and Mysore",
        "Explore Ooty's planned sightseeing stops, then continue to Mysore. Stay overnight in Mysore.",
      ],
      [
        "Mysore and Brindavan Gardens",
        "Enjoy Mysore sightseeing and the planned visit to Brindavan Gardens. Stay overnight in Mysore.",
      ],
      [
        "Bangalore and onward to Pampa Sarovar",
        "Leave Mysore for sightseeing in Bangalore, then continue towards Pampa Sarovar. Spend the night travelling by coach.",
      ],
      [
        "Pampa Sarovar and Pandharpur",
        "Visit the planned Pampa Sarovar stop and continue to Pandharpur for sightseeing. Stay overnight in Pandharpur.",
      ],
      [
        "Pandharpur, Tulja Bhavani and towards Nashik",
        "Complete the planned Pandharpur sightseeing and Tulja Bhavani visit, then travel towards Nashik. Spend the night on the coach.",
      ],
      [
        "Journey towards Nashik; separate return leg follows",
        "Continue travelling towards Nashik on the final day of the 22-day tour. The additional return journey begins with the listed overnight bus segment, followed by Saputara, Jogeshwar and Dakor before arrival in Ahmedabad. This final return leg is separate from the 22 tour days; confirm the arrival time before arranging onward travel.",
      ],
    ],
  },
  {
    slug: "matheran-mahabaleshwar",
    title: "Matheran & Mahabaleshwar",
    destinationSlug: "matheran",
    categorySlug: "family",
    startingCity: "Ahmedabad",
    startingPrice: "8499.00",
    durationDays: 4,
    summary:
      "A four-day hill-station journey from Ahmedabad to Matheran and Mahabaleshwar, from INR 8,499 per person with four-sharing accommodation.",
    overview:
      "Travel from Ahmedabad to Matheran and Mahabaleshwar by 2x2 AC sleeper luxury coach. The four-day programme begins with an afternoon departure and an overnight outward journey, followed by one hotel night in Matheran and one in Mahabaleshwar. Enjoy time for local sightseeing at your own expense before beginning the return to Ahmedabad on the fourth evening. Per-person fares are INR 8,499 for four people sharing one room, INR 9,499 for three sharing and INR 10,499 for a couple room. Morning tea and breakfast, lunch and evening dinner are included as listed. A Lonavala visit is possible only if time permits; it is not a guaranteed stop.",
    highlights: [
      "Matheran and Mahabaleshwar hill-station route from Ahmedabad",
      "INR 8,499 per person for four sharing",
      "INR 9,499 per person for three sharing",
      "INR 10,499 per person for a couple room",
      "2x2 AC sleeper luxury coach",
      "One AC-hotel night in Matheran and one non-AC-hotel night in Mahabaleshwar",
      "Morning tea and breakfast, lunch and evening dinner",
      "Lonavala visit only if time permits",
    ],
    inclusions: [
      "Group travel by 2x2 AC sleeper luxury coach on the listed route, up to accessible points",
      "One night in an AC hotel in Matheran",
      "One night in a non-AC hotel in Mahabaleshwar",
      "Room sharing according to the selected four-sharing, three-sharing or couple-room fare",
      "Morning tea and breakfast",
      "Lunch and evening dinner as listed in the programme",
    ],
    exclusions: [
      "All local sightseeing expenses, including entry tickets and sightseeing transport",
      "Local transfers beyond the points accessible to the luxury coach",
      "Optional activities, personal expenses and shopping",
      "Meals and services not listed in the confirmed programme",
    ],
    transportInformation:
      "Travel by 2x2 AC sleeper luxury coach from Ahmedabad, with a reference departure time of 4:00 PM. The outward journey continues overnight to Matheran. The coach will travel only as far as access allows; local onward transfers and sightseeing are at the traveller's expense. Transfer from Matheran to Mahabaleshwar on the third day and begin the return to Ahmedabad on the fourth evening. Confirm boarding arrangements and the final Ahmedabad arrival time before arranging onward travel.",
    accommodationNotes:
      "Two hotel nights are listed: one in an AC hotel in Matheran and one in a non-AC hotel in Mahabaleshwar. The three-night programme comprises the outward travel night and these two hotel nights, not three hotel nights. Per-person fares are INR 8,499 for four people sharing one room, INR 9,499 for three people sharing one room and INR 10,499 for a couple room. Hotel names, bed arrangements and availability are confirmed before booking.",
    importantInformation:
      "The starting fare of INR 8,499 per person applies to four-sharing accommodation; three-sharing is INR 9,499 and a couple room is INR 10,499 per person. The listed booking deposit is INR 2,500 per person; confirm the balance-payment schedule before payment. All sightseeing is at the traveller's expense. The luxury coach operates only up to accessible points. Lonavala may be visited only if time permits and is not a guaranteed inclusion. The organiser reserves the right to change the programme. The itinerary covers four programme days, with the return journey beginning on the final evening; confirm the actual Ahmedabad arrival time. Travel dates, hotels and the meal plan for the outward and return travel segments are confirmed before booking. Destination images are illustrative and do not depict the booked hotels or guarantee particular views.",
    itinerary: [
      [
        "Ahmedabad departure for Matheran",
        "Depart Ahmedabad at the reference time of 4:00 PM by 2x2 AC sleeper luxury coach and travel overnight towards Matheran. Confirm the boarding arrangements before departure.",
      ],
      [
        "Matheran arrival and sightseeing",
        "Arrive in Matheran in the morning and spend the day exploring local sights at your own expense. The coach operates only up to accessible points, with onward local travel at your own expense. Stay overnight in an AC hotel in Matheran.",
      ],
      [
        "Matheran to Mahabaleshwar",
        "Leave Matheran and travel to Mahabaleshwar. Stay overnight in a non-AC hotel in Mahabaleshwar. Any local sightseeing and associated transport or entry charges are at your own expense.",
      ],
      [
        "Mahabaleshwar sightseeing and return journey",
        "Spend the day sightseeing in Mahabaleshwar at your own expense. In the evening, depart for Ahmedabad. Lonavala may be added only if time permits; it is not guaranteed. Confirm the final return arrival time before planning onward connections.",
      ],
    ],
  },
  {
    slug: "thailand-pattaya-bangkok",
    title: "Thailand: Pattaya & Bangkok",
    destinationSlug: "thailand",
    categorySlug: "family",
    startingCity: "Bangkok (DMK)",
    startingPrice: "49999.00",
    durationDays: 5,
    summary:
      "A five-day, four-night Pattaya and Bangkok holiday at INR 49,999 per person with flights, double-sharing stays, breakfast, sightseeing and a Coral Island excursion.",
    overview:
      "Explore Pattaya and Bangkok on a four-night, five-day Thailand holiday at INR 49,999 per person, including flights and double-sharing accommodation as advertised. Spend the first three nights in Pattaya and the fourth in Bangkok. The programme includes Pattaya's Big Buddha, Pattaya View Point, Gems Gallery, the Alcazar Show, a Koh Larn Coral Island speedboat excursion with an Indian lunch in Pattaya, and Bangkok visits to the Golden Buddha, Mini Reclining Buddha and Gems Gallery. The ground itinerary begins and ends at Bangkok DMK Airport. Private group-coach transfers are listed for the main route, while the Coral Island excursion uses shared arrangements. Flight departure city, airline, baggage allowance, travel dates and final bookings are confirmed before payment.",
    highlights: [
      "Five days and four nights in Thailand",
      "INR 49,999 per person with flights and double-sharing accommodation",
      "Three nights in Pattaya and one night in Bangkok",
      "Pattaya Big Buddha, Pattaya View Point and Gems Gallery",
      "Alcazar Show with standard-category entry",
      "Koh Larn Coral Island by speedboat with an Indian lunch in Pattaya",
      "Bangkok Golden Buddha, Mini Reclining Buddha and Gems Gallery",
      "Private group AC coach transfers and a guide for Pattaya and Bangkok",
    ],
    inclusions: [
      "Flights as advertised, with routing and baggage confirmed in the final quote",
      "Three nights in Pattaya and one night in Bangkok on a double-sharing basis",
      "Daily hotel breakfast",
      "Private group transfers by one 40-seater AC coach, with one guide for Pattaya and Bangkok",
      "DMK Airport to Pattaya hotel, Pattaya hotel to Bangkok hotel and Bangkok hotel to DMK Airport transfers",
      "Pattaya city tour covering Big Buddha, Pattaya View Point and Gems Gallery",
      "Alcazar Show standard-category entry ticket",
      "Koh Larn Coral Island speedboat excursion with shared transfers and the listed ticket",
      "Indian lunch at a restaurant in Pattaya on the Coral Island excursion day",
      "Bangkok tour covering Golden Buddha, Mini Reclining Buddha and Gems Gallery, with listed entry fees",
    ],
    exclusions: [
      "Lunches and dinners other than the included Indian lunch on the Coral Island day",
      "Personal expenses, shopping and optional activities or water sports",
      "Airline extras and baggage beyond the confirmed flight allowance",
      "Passport, visa and travel-insurance costs unless included in the final written quote",
      "Services and entry tickets not listed under inclusions",
    ],
    transportInformation:
      "The ground itinerary starts and ends at Bangkok DMK Airport. The reference group arrangement is one private 40-seater AC coach and one guide for Pattaya and Bangkok, including airport transfers and the Pattaya-to-Bangkok hotel transfer. This is a group vehicle allocation, not a separate coach for each booking. The Koh Larn Coral Island excursion uses a speedboat and shared SIC transfer-and-ticket arrangements; the main coach transfer does not make the island excursion private. Flight departure city, airline, route, timings and baggage allowance are not specified and must be confirmed before booking.",
    accommodationNotes:
      "Four nights on a double-sharing basis: the first three nights in Pattaya at Golden Beach Hotel Pattaya or similar, listed as a 3-star property in the poster; the fourth night in Bangkok at Princeton Hotel or similar, listed as a 4-star property. Both stays are on a bed-and-breakfast basis. Confirm the final hotels, room type, check-in arrangements and availability before payment. Gallery images depict destinations and do not represent the booked hotels.",
    importantInformation:
      "The displayed fare is INR 49,999 per person with flights and double sharing. The departure city for the flight, airline, baggage allowance and final flight itinerary remain to be confirmed; Bangkok DMK is the ground-tour arrival and departure point. Breakfast is included at the hotels, and the Coral Island day includes lunch at an Indian restaurant in Pattaya. Other lunches and dinners are not listed as included. The main coach is private for the group, but the Coral Island speedboat excursion is shared. Reference activity start times are approximately 10:00 AM for the listed tours and 7:30 PM for the Alcazar Show, subject to the confirmed local schedule. Boat operations, sightseeing order and attraction visits depend on weather, access and availability. Travel dates and all final arrangements are confirmed before booking. Images are for reference only. Actual hotels and views may vary.",
    cancellationRules:
      "The Koh Larn Coral Island speedboat excursion with its shared transfer-and-ticket arrangement is marked non-refundable in the supplied programme. Cancellation and change terms for flights, hotels, other activities and the remainder of the package are confirmed in writing before payment.",
    itinerary: [
      [
        "DMK Airport arrival and transfer to Pattaya",
        "Arrive at Bangkok DMK Airport and transfer to the Pattaya hotel using the private group AC coach arrangement with guide. Check in at Golden Beach Hotel Pattaya or similar. Stay overnight in Pattaya.",
      ],
      [
        "Pattaya city tour and Alcazar Show",
        "After breakfast, take the Pattaya city tour covering Big Buddha, Pattaya View Point and Gems Gallery, with a reference start time of 10:00 AM. Private group-coach transfers and the guide are included. In the evening, attend the Alcazar Show with a standard-category entry ticket; the reference show time is 7:30 PM. Stay overnight in Pattaya.",
      ],
      [
        "Koh Larn Coral Island excursion",
        "After breakfast, set out for the Coral Island programme, with a reference start time of 10:00 AM. The programme lists a private group-coach transfer for the main transfer segment, followed by the shared Koh Larn speedboat excursion and included ticket. Lunch is included at an Indian restaurant in Pattaya. The Coral Island shared excursion is marked non-refundable. Return for the third overnight stay in Pattaya.",
      ],
      [
        "Transfer to Bangkok and temple tour",
        "After breakfast, check out of the Pattaya hotel and transfer to Bangkok by private group AC coach with guide. The en-route Bangkok tour includes Golden Buddha, Mini Reclining Buddha and Gems Gallery with the listed entry fees; the reference tour start time is 10:00 AM. Check in at Princeton Hotel or similar and stay overnight in Bangkok.",
      ],
      [
        "Bangkok hotel to DMK Airport",
        "After breakfast and hotel checkout, transfer to Bangkok DMK Airport by the private group AC coach arrangement with guide for the confirmed onward flight.",
      ],
    ],
  },
] as const;

export const tourPackageMedia = {
  "matheran-mahabaleshwar": [
    {
      image: "maharashtra-hills-matheran.webp",
      altText: "Red-earth walking trail winding through Matheran's misty green forest",
      caption: "Matheran's forest trails",
    },
    {
      image: "maharashtra-hills-mahabaleshwar.webp",
      altText: "Green tableland cliffs and deep forested valley near Mahabaleshwar",
      caption: "Mahabaleshwar's Western Ghats scenery",
    },
  ],
  "thailand-pattaya-bangkok": [
    {
      image: "thailand-pattaya-bay.webp",
      altText: "Pattaya's crescent bay from an elevated viewpoint",
      caption: "Pattaya View Point",
    },
    {
      image: "thailand-koh-larn-coral-island.webp",
      altText: "A sandy Koh Larn beach and clear turquoise water",
      caption: "Koh Larn Coral Island",
    },
    {
      image: "thailand-pattaya-big-buddha.webp",
      altText: "Pattaya's golden Big Buddha and temple approach",
      caption: "Pattaya Big Buddha",
    },
    {
      image: "thailand-bangkok-golden-buddha.webp",
      altText: "A Golden Buddha in a decorated Bangkok temple hall",
      caption: "Bangkok Golden Buddha temple setting",
    },
  ],
  "south-india-rameswaram-ooty-mysore-tirupati": [
    {
      image: "south-india-rameswaram.webp",
      altText: "The Ramanathaswamy Temple exterior in Rameswaram",
      caption: "Rameswaram pilgrimage setting",
    },
    {
      image: "south-india-ooty.webp",
      altText: "Tea-growing hills and morning mist near Ooty",
      caption: "Ooty and the Nilgiri hills",
    },
    {
      image: "south-india-mysore-palace.webp",
      altText: "Mysore Palace and its landscaped forecourt",
      caption: "Mysore Palace",
    },
    {
      image: "south-india-tirupati.webp",
      altText: "A temple gateway and forested hills at Tirumala",
      caption: "Tirupati Balaji pilgrimage setting",
    },
  ],
  "east-india-pilgrimage-tour": [
    {
      image: "east-india-puri-jagannath.webp",
      altText: "Jagannath Temple's exterior in Puri",
      caption: "Jagannath Puri",
    },
    {
      image: "east-india-kolkata-howrah.webp",
      altText: "Howrah Bridge spanning the river in Kolkata",
      caption: "Howrah Bridge, Kolkata",
    },
    {
      image: "north-india-nepal-ayodhya.webp",
      altText: "Grand pale-stone temple in Ayodhya illuminated by sunrise",
      caption: "Ayodhya pilgrimage setting at sunrise",
    },
    {
      image: "ayodhya-kashi-nepal-varanasi-ghats.webp",
      altText: "Historic Varanasi ghats and wooden boats along the Ganges at sunrise",
      caption: "Varanasi ghats at sunrise",
    },
    {
      image: "madhya-pradesh-omkareshwar.webp",
      altText: "Omkareshwar temple town and suspension bridge beside the Narmada River",
      caption: "Omkareshwar on the Narmada River",
    },
  ],
  "seven-jyotirlinga-darshan": [
    {
      image: "maharashtra-trimbakeshwar.webp",
      altText: "Dark-stone Trimbakeshwar temple beneath the Western Ghats",
      caption: "Trimbakeshwar Jyotirlinga temple setting",
    },
    {
      image: "maharashtra-bibi-ka-maqbara.webp",
      altText: "Bibi Ka Maqbara and its formal garden axis in Aurangabad",
      caption: "Bibi Ka Maqbara in Aurangabad",
    },
    {
      image: "maharashtra-ellora-kailasa.webp",
      altText: "Rock-cut Kailasa temple architecture at the Ellora Caves",
      caption: "The monumental rock-cut heritage of Ellora",
    },
    {
      image: "madhya-pradesh-omkareshwar.webp",
      altText: "Omkareshwar temple town and suspension bridge beside the Narmada River",
      caption: "Omkareshwar on the Narmada River",
    },
    {
      image: "madhya-pradesh-mahakaleshwar.webp",
      altText: "Illuminated Mahakaleshwar temple complex in Ujjain at blue hour",
      caption: "Mahakaleshwar temple setting in Ujjain",
    },
  ],
  "char-dham-yatra-rajasthan-special": [
    {
      image: "char-dham-kedarnath.webp",
      altText: "Kedarnath Temple beneath the Himalayan peaks in Uttarakhand",
      caption: "Kedarnath and the Char Dham pilgrimage setting",
    },
    {
      image: "rajasthan-amber-fort.webp",
      altText: "Amber Fort glowing above Maota Lake near Jaipur",
      caption: "Jaipur's heritage and Rajasthan landscapes",
    },
    {
      image: "jaisalmer-golden-fort.webp",
      altText: "Golden Jaisalmer Fort rising beyond the dunes of the Thar Desert",
      caption: "Jaisalmer's Golden Fort",
    },
    {
      image: "jaisalmer-sam-sand-dunes.webp",
      altText: "Camel on the golden Sam Sand Dunes near Jaisalmer at sunset",
      caption: "Sunset over the Sam Sand Dunes",
    },
  ],
  "gangtok-lachung-darjeeling": [
    {
      image: "sikkim-gangtok.webp",
      altText: "Gangtok's hillside town and Himalayan landscape",
      caption: "Gangtok's Himalayan setting",
    },
    {
      image: "sikkim-tsomgo-lake.webp",
      altText: "Tsomgo Lake surrounded by snowy mountain slopes",
      caption: "Tsomgo Lake",
    },
    {
      image: "sikkim-yumthang-valley.webp",
      altText: "A river and spring flowers in Yumthang Valley",
      caption: "Yumthang Valley near Lachung",
    },
    {
      image: "darjeeling-heritage-toy-train.webp",
      altText: "A blue heritage Toy Train in Darjeeling's hills",
      caption: "Darjeeling's heritage Toy Train",
    },
  ],
  "diwali-jaisalmer-sam-desert-tanot-longewala": [
    {
      image: "jaisalmer-sam-sand-dunes.webp",
      altText: "Camel on the golden Sam Sand Dunes near Jaisalmer at sunset",
      caption: "Sunset over the Sam Sand Dunes",
    },
    {
      image: "jaisalmer-desert-tent-camp.webp",
      altText: "Illustrative desert camp with canvas tents and warm lanterns near Sam",
      caption: "Illustrative desert tent camp setting near Sam",
    },
    {
      image: "jaisalmer-bada-bagh.webp",
      altText: "Golden sandstone cenotaph pavilions at Bada Bagh near Jaisalmer",
      caption: "Bada Bagh's sandstone pavilions",
    },
    {
      image: "jaisalmer-gadisar-lake.webp",
      altText: "Sandstone pavilions reflected in the calm waters of Gadisar Lake",
      caption: "Gadisar Lake and its waterside architecture",
    },
    {
      image: "jaisalmer-golden-fort.webp",
      altText: "Golden Jaisalmer Fort rising beyond the dunes of the Thar Desert",
      caption: "Jaisalmer's Golden Fort",
    },
  ],
  "amarnath-vaishno-devi-yatra": [
    {
      image: "amarnath-vaishno-devi-vaishno-devi-bhawan.webp",
      altText:
        "Vaishno Devi Bhawan illuminated at blue hour in the Trikuta hills",
      caption: "Vaishno Devi Bhawan in the Trikuta hills",
    },
    {
      image: "amarnath-vaishno-devi-amarnath-cave.webp",
      altText:
        "Amarnath cave pilgrimage route surrounded by snowy Himalayan peaks",
      caption: "The mountain setting of the Amarnath pilgrimage",
    },
    {
      image: "amarnath-vaishno-devi-amritsar-wagah.webp",
      altText:
        "Golden Temple in Amritsar and the ceremonial Wagah border setting",
      caption: "Amritsar's Golden Temple and the Wagah border",
    },
    {
      image: "amarnath-vaishno-devi-pahalgam.webp",
      altText:
        "Lidder River flowing through green Pahalgam valley below Himalayan peaks",
      caption: "Pahalgam's river and mountain landscape",
    },
  ],
  "kashmir-vaishno-devi-yatra": [
    {
      image: "kashmir-dal-lake.webp",
      altText: "Traditional shikara crossing Dal Lake with Kashmir mountains beyond",
      caption: "Dal Lake and Srinagar's mountain setting",
    },
    {
      image: "amarnath-vaishno-devi-vaishno-devi-bhawan.webp",
      altText: "Vaishno Devi Bhawan illuminated at blue hour in the Trikuta hills",
      caption: "Vaishno Devi Bhawan in the Trikuta hills",
    },
    {
      image: "amarnath-vaishno-devi-pahalgam.webp",
      altText: "Lidder River flowing through green Pahalgam valley below Himalayan peaks",
      caption: "Pahalgam's river and mountain landscape",
    },
    {
      image: "amarnath-vaishno-devi-amritsar-wagah.webp",
      altText: "Golden Temple in Amritsar and the ceremonial Wagah border setting",
      caption: "Amritsar and Wagah Border",
    },
  ],
  "khatu-shyam-salasar-sanwariya-yatra": [
    {
      image: "khatu-salasar-sanwariya-khatu-shyam.webp",
      altText: "Khatu Shyam Ji temple approach in warm morning light",
      caption: "Khatu Shyam Ji pilgrimage setting",
    },
    {
      image: "khatu-salasar-sanwariya-salasar-balaji.webp",
      altText: "Salasar Balaji temple courtyard in Rajasthan",
      caption: "Salasar Balaji temple setting",
    },
    {
      image: "khatu-salasar-sanwariya-sanwariya-seth.webp",
      altText: "Shri Sanwariya Seth temple with pale stone domes",
      caption: "Shri Sanwariya Seth temple setting",
    },
  ],
  "ayodhya-kashi-nepal-yatra": [
    {
      image: "north-india-nepal-ayodhya.webp",
      altText: "Grand pale-stone temple in Ayodhya illuminated by sunrise",
      caption: "Ayodhya pilgrimage setting at sunrise",
    },
    {
      image: "ayodhya-kashi-nepal-pashupatinath.webp",
      altText: "Traditional Pashupatinath temple complex beside the Bagmati River in Kathmandu",
      caption: "Pashupatinath temple setting in Kathmandu",
    },
    {
      image: "ayodhya-kashi-nepal-varanasi-ghats.webp",
      altText: "Historic Varanasi ghats and wooden boats along the Ganges at sunrise",
      caption: "Varanasi ghats at sunrise",
    },
    {
      image: "ayodhya-kashi-nepal-vrindavan.webp",
      altText: "Ornate cream-stone temple courtyard inspired by Vrindavan and Mathura",
      caption: "Vrindavan and Mathura pilgrimage setting",
    },
  ],
  "maharashtra-jyotirlinga-saputara-yatra": [
    {
      image: "maharashtra-trimbakeshwar.webp",
      altText: "Dark-stone Trimbakeshwar temple beneath the Western Ghats",
      caption: "Trimbakeshwar Jyotirlinga temple setting",
    },
    {
      image: "maharashtra-saputara-gira-falls.webp",
      altText: "Broad monsoon waterfall surrounded by the green hills near Saputara",
      caption: "Monsoon landscape near Saputara",
    },
    {
      image: "maharashtra-bibi-ka-maqbara.webp",
      altText: "Bibi Ka Maqbara and its formal garden axis in Aurangabad",
      caption: "Bibi Ka Maqbara in Aurangabad",
    },
    {
      image: "maharashtra-ellora-kailasa.webp",
      altText: "Rock-cut Kailasa temple architecture at the Ellora Caves",
      caption: "The monumental rock-cut heritage of Ellora",
    },
  ],
  "ujjain-indore-omkareshwar-yatra": [
    {
      image: "madhya-pradesh-mahakaleshwar.webp",
      altText: "Illuminated Mahakaleshwar temple complex in Ujjain at blue hour",
      caption: "Mahakaleshwar temple setting in Ujjain",
    },
    {
      image: "madhya-pradesh-rajwada-indore.webp",
      altText: "Historic Rajwada Palace facade and forecourt in Indore",
      caption: "Rajwada Palace in Indore",
    },
    {
      image: "madhya-pradesh-omkareshwar.webp",
      altText: "Omkareshwar temple town and suspension bridge beside the Narmada River",
      caption: "Omkareshwar on the Narmada River",
    },
    {
      image: "madhya-pradesh-mamleshwar.webp",
      altText: "Ancient stone Mamleshwar Temple near Omkareshwar",
      caption: "Mamleshwar Temple near Omkareshwar",
    },
  ],
  "lonavala-khandala-matheran-mahabaleshwar": [
    {
      image: "maharashtra-hills-lonavala.webp",
      altText: "Misty green Sahyadri valley and seasonal waterfall near Lonavala",
      caption: "Lonavala's monsoon landscape",
    },
    {
      image: "maharashtra-hills-khandala.webp",
      altText: "Cloud-wrapped green ridges and winding mountain road near Khandala",
      caption: "Khandala's rain-washed valley",
    },
    {
      image: "maharashtra-hills-matheran.webp",
      altText: "Red-earth walking trail winding through Matheran's misty green forest",
      caption: "Matheran's forest trails",
    },
    {
      image: "maharashtra-hills-mahabaleshwar.webp",
      altText: "Green tableland cliffs and deep forested valley near Mahabaleshwar",
      caption: "Mahabaleshwar's Western Ghats scenery",
    },
  ],
  "diwali-lonavala-khandala-matheran-mahabaleshwar": [
    {
      image: "maharashtra-hills-matheran.webp",
      altText: "Red-earth walking trail winding through Matheran's misty green forest",
      caption: "Matheran's forest trails",
    },
    {
      image: "maharashtra-hills-lonavala.webp",
      altText: "Misty green Sahyadri valley and seasonal waterfall near Lonavala",
      caption: "Lonavala's monsoon landscape",
    },
    {
      image: "maharashtra-hills-khandala.webp",
      altText: "Cloud-wrapped green ridges and winding mountain road near Khandala",
      caption: "Khandala's rain-washed valley",
    },
    {
      image: "maharashtra-hills-mahabaleshwar.webp",
      altText: "Green tableland cliffs and deep forested valley near Mahabaleshwar",
      caption: "Mahabaleshwar's Western Ghats scenery",
    },
  ],
  "diwali-goa-mahabaleshwar-lonavala-imagica": [
    {
      image: "goa-sunset-beach.webp",
      altText: "Palm-lined Goa beach beside the Arabian Sea at sunset",
      caption: "A warm sunset on Goa's palm-lined coast",
    },
    {
      image: "maharashtra-hills-mahabaleshwar.webp",
      altText: "Green tableland cliffs and deep forested valley near Mahabaleshwar",
      caption: "Mahabaleshwar's Western Ghats scenery",
    },
    {
      image: "maharashtra-hills-lonavala.webp",
      altText: "Misty green Sahyadri valley and seasonal waterfall near Lonavala",
      caption: "Lonavala's monsoon landscape",
    },
    {
      image: "maharashtra-hills-khandala.webp",
      altText: "Cloud-wrapped green ridges and winding mountain road near Khandala",
      caption: "Khandala's rain-washed valley",
    },
    {
      image: "maharashtra-imagica-theme-park.webp",
      altText: "Illustrative amusement park with roller coasters and a landscaped lagoon near Khopoli",
      caption: "An illustrative view of the amusement-park experience",
    },
  ],
  "dwarka-somnath-diu-sasan-gir": [
    {
      image: "gujarat-dwarka.webp",
      altText: "Dwarkadhish Temple beside the Gomti riverfront at sunrise",
      caption: "Dwarkadhish Temple and the Gomti riverfront",
    },
    {
      image: "gujarat-somnath.webp",
      altText: "Somnath Temple overlooking the Arabian Sea at golden hour",
      caption: "Somnath Temple beside the Arabian Sea",
    },
    {
      image: "gujarat-diu.webp",
      altText: "Historic Diu Fort and lighthouse above the blue Arabian Sea",
      caption: "The coastal ramparts of Diu Fort",
    },
    {
      image: "gujarat-sasan-gir.webp",
      altText: "Asiatic lion walking through the dry deciduous forest of Sasan Gir",
      caption: "Asiatic lion habitat in Sasan Gir",
    },
  ],
} as const;

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
