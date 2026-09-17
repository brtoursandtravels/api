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

export const tourPackageMedia = {
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
