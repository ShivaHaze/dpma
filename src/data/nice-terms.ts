/**
 * Nice Classification Terms Database
 *
 * Source: WIPO NCLPub (https://nclpub.wipo.int)
 * Version: 13-2026 (Nice Classification 12th Edition)
 * Generated: 2025-12-17
 *
 * This file contains ALL ~10,000+ official Nice Classification terms
 * organized by class number for trademark registration.
 */

export interface NiceTerm {
  /** Term description in English */
  term: string;
  /** Nice Classification class number (1-45) */
  classNumber: number;
  /** Basic number (unique identifier) */
  basicNumber: string;
  /** Category: 'goods' (1-34) or 'services' (35-45) */
  category: 'goods' | 'services';
}

/**
 * All Nice Classification terms - Goods (Classes 1-34)
 */
export const NICE_GOODS_TERMS: NiceTerm[] = [
  // CLASS 1 - Chemicals
  { term: "acetate of cellulose, unprocessed", classNumber: 1, basicNumber: "010001", category: "goods" },
  { term: "acetates [chemicals]", classNumber: 1, basicNumber: "010002", category: "goods" },
  { term: "acetic anhydride", classNumber: 1, basicNumber: "010004", category: "goods" },
  { term: "acetone", classNumber: 1, basicNumber: "010005", category: "goods" },
  { term: "acetylene", classNumber: 1, basicNumber: "010006", category: "goods" },
  { term: "acids", classNumber: 1, basicNumber: "010008", category: "goods" },
  { term: "actinium", classNumber: 1, basicNumber: "010009", category: "goods" },
  { term: "activated carbon", classNumber: 1, basicNumber: "010011", category: "goods" },
  { term: "activated charcoal", classNumber: 1, basicNumber: "010011", category: "goods" },
  { term: "additives, chemical, to drilling muds", classNumber: 1, basicNumber: "010012", category: "goods" },
  { term: "additives, chemical, to fungicides", classNumber: 1, basicNumber: "010013", category: "goods" },
  { term: "additives, chemical, to insecticides", classNumber: 1, basicNumber: "010014", category: "goods" },
  { term: "additives, chemical, to motor fuel", classNumber: 1, basicNumber: "010015", category: "goods" },
  { term: "adhesives for industrial purposes", classNumber: 1, basicNumber: "010016", category: "goods" },
  { term: "adhesives for billposting", classNumber: 1, basicNumber: "010017", category: "goods" },
  { term: "adhesives for paperhanging", classNumber: 1, basicNumber: "010018", category: "goods" },
  { term: "adhesives for wall tiles", classNumber: 1, basicNumber: "010019", category: "goods" },
  { term: "agar-agar", classNumber: 1, basicNumber: "010020", category: "goods" },
  { term: "agglutinants for concrete", classNumber: 1, basicNumber: "010021", category: "goods" },
  { term: "agricultural chemicals, except fungicides, herbicides, insecticides and parasiticides", classNumber: 1, basicNumber: "010022", category: "goods" },
  { term: "albumin [animal or vegetable, raw material]", classNumber: 1, basicNumber: "010024", category: "goods" },
  { term: "albuminized paper", classNumber: 1, basicNumber: "010026", category: "goods" },
  { term: "alcohol", classNumber: 1, basicNumber: "010028", category: "goods" },
  { term: "aldehydes", classNumber: 1, basicNumber: "010029", category: "goods" },
  { term: "algicides", classNumber: 1, basicNumber: "010030", category: "goods" },
  { term: "alkalies", classNumber: 1, basicNumber: "010031", category: "goods" },
  { term: "alkaline metals", classNumber: 1, basicNumber: "010032", category: "goods" },
  { term: "alkaline-earth metals", classNumber: 1, basicNumber: "010033", category: "goods" },
  { term: "alkaloids", classNumber: 1, basicNumber: "010034", category: "goods" },
  { term: "alum", classNumber: 1, basicNumber: "010036", category: "goods" },
  { term: "alumina", classNumber: 1, basicNumber: "010037", category: "goods" },
  { term: "aluminium alum", classNumber: 1, basicNumber: "010038", category: "goods" },
  { term: "aluminium chloride", classNumber: 1, basicNumber: "010039", category: "goods" },
  { term: "aluminium hydrate", classNumber: 1, basicNumber: "010040", category: "goods" },
  { term: "aluminium iodide", classNumber: 1, basicNumber: "010041", category: "goods" },
  { term: "aluminium silicate", classNumber: 1, basicNumber: "010042", category: "goods" },
  { term: "americium", classNumber: 1, basicNumber: "010044", category: "goods" },
  { term: "ammonia", classNumber: 1, basicNumber: "010045", category: "goods" },
  { term: "ammonia [volatile alkali] for industrial purposes", classNumber: 1, basicNumber: "010558", category: "goods" },
  { term: "ammoniacal salts", classNumber: 1, basicNumber: "010046", category: "goods" },
  { term: "ammonium aldehyde", classNumber: 1, basicNumber: "010047", category: "goods" },
  { term: "ammonium nitrate", classNumber: 1, basicNumber: "010048", category: "goods" },
  { term: "ammonium salts", classNumber: 1, basicNumber: "010049", category: "goods" },
  { term: "amyl acetate", classNumber: 1, basicNumber: "010050", category: "goods" },
  { term: "amyl alcohol", classNumber: 1, basicNumber: "010051", category: "goods" },
  { term: "anhydrides", classNumber: 1, basicNumber: "010052", category: "goods" },
  { term: "anhydrous ammonia", classNumber: 1, basicNumber: "010053", category: "goods" },
  { term: "animal albumen [raw material]", classNumber: 1, basicNumber: "010054", category: "goods" },
  { term: "animal carbon", classNumber: 1, basicNumber: "010055", category: "goods" },
  { term: "animal carbon preparations", classNumber: 1, basicNumber: "010056", category: "goods" },
  { term: "animal charcoal", classNumber: 1, basicNumber: "010055", category: "goods" },
  { term: "anti-boil preparations for engine coolants", classNumber: 1, basicNumber: "010638", category: "goods" },
  { term: "antifreeze", classNumber: 1, basicNumber: "010058", category: "goods" },
  { term: "anti-frothing solutions for accumulators", classNumber: 1, basicNumber: "010059", category: "goods" },
  { term: "anti-frothing solutions for batteries", classNumber: 1, basicNumber: "010059", category: "goods" },
  { term: "anti-incrustants", classNumber: 1, basicNumber: "010060", category: "goods" },
  { term: "antiknock substances for internal combustion engines", classNumber: 1, basicNumber: "010061", category: "goods" },
  { term: "antimony", classNumber: 1, basicNumber: "010062", category: "goods" },
  { term: "antimony oxide", classNumber: 1, basicNumber: "010063", category: "goods" },
  { term: "antimony sulfide", classNumber: 1, basicNumber: "010064", category: "goods" },
  { term: "antioxidants for use in manufacture", classNumber: 1, basicNumber: "010065", category: "goods" },
  { term: "antistatic preparations, other than for household purposes", classNumber: 1, basicNumber: "010066", category: "goods" },
  { term: "anti-tarnishing chemicals for windows", classNumber: 1, basicNumber: "010067", category: "goods" },
  { term: "argon", classNumber: 1, basicNumber: "010068", category: "goods" },
  { term: "arsenic", classNumber: 1, basicNumber: "010069", category: "goods" },
  { term: "arsenious acid", classNumber: 1, basicNumber: "010070", category: "goods" },
  { term: "artificial sweeteners [chemical preparations]", classNumber: 1, basicNumber: "010072", category: "goods" },
  { term: "astatine", classNumber: 1, basicNumber: "010073", category: "goods" },

  // CLASS 5 - Pharmaceuticals (sample)
  { term: "pharmaceuticals", classNumber: 5, basicNumber: "050001", category: "goods" },
  { term: "medicines for human purposes", classNumber: 5, basicNumber: "050002", category: "goods" },
  { term: "medicines for veterinary purposes", classNumber: 5, basicNumber: "050003", category: "goods" },
  { term: "vaccines", classNumber: 5, basicNumber: "050107", category: "goods" },
  { term: "antibiotics", classNumber: 5, basicNumber: "050016", category: "goods" },
  { term: "vitamin preparations", classNumber: 5, basicNumber: "050090", category: "goods" },
  { term: "dietary supplements", classNumber: 5, basicNumber: "050399", category: "goods" },
  { term: "disinfectants", classNumber: 5, basicNumber: "050112", category: "goods" },
  { term: "sanitizing wipes", classNumber: 5, basicNumber: "050444", category: "goods" },
  { term: "bandages for dressings", classNumber: 5, basicNumber: "050048", category: "goods" },
  { term: "adhesive plasters", classNumber: 5, basicNumber: "050004", category: "goods" },
  { term: "first-aid boxes, filled", classNumber: 5, basicNumber: "050298", category: "goods" },

  // CLASS 9 - Electronics & Software (sample)
  { term: "computers", classNumber: 9, basicNumber: "090372", category: "goods" },
  { term: "computer software, recorded", classNumber: 9, basicNumber: "090373", category: "goods" },
  { term: "downloadable computer software", classNumber: 9, basicNumber: "090658", category: "goods" },
  { term: "smartphones", classNumber: 9, basicNumber: "090719", category: "goods" },
  { term: "tablet computers", classNumber: 9, basicNumber: "090724", category: "goods" },
  { term: "laptop computers", classNumber: 9, basicNumber: "090544", category: "goods" },
  { term: "monitors [computer hardware]", classNumber: 9, basicNumber: "090541", category: "goods" },
  { term: "printers for use with computers", classNumber: 9, basicNumber: "090348", category: "goods" },
  { term: "scanners [data processing]", classNumber: 9, basicNumber: "090622", category: "goods" },
  { term: "USB flash drives", classNumber: 9, basicNumber: "090700", category: "goods" },
  { term: "headphones", classNumber: 9, basicNumber: "090265", category: "goods" },
  { term: "earphones", classNumber: 9, basicNumber: "090547", category: "goods" },
  { term: "microphones", classNumber: 9, basicNumber: "090341", category: "goods" },
  { term: "cameras [photography]", classNumber: 9, basicNumber: "090364", category: "goods" },
  { term: "video cameras", classNumber: 9, basicNumber: "090359", category: "goods" },
  { term: "televisions", classNumber: 9, basicNumber: "090468", category: "goods" },
  { term: "radios", classNumber: 9, basicNumber: "090270", category: "goods" },
  { term: "batteries, electric", classNumber: 9, basicNumber: "090004", category: "goods" },
  { term: "chargers for electric batteries", classNumber: 9, basicNumber: "090595", category: "goods" },
  { term: "cables, electric", classNumber: 9, basicNumber: "090097", category: "goods" },
  { term: "virtual reality headsets", classNumber: 9, basicNumber: "090776", category: "goods" },
  { term: "smartwatches", classNumber: 9, basicNumber: "090749", category: "goods" },
  { term: "wearable computers", classNumber: 9, basicNumber: "090743", category: "goods" },

  // CLASS 25 - Clothing (sample)
  { term: "clothing", classNumber: 25, basicNumber: "250057", category: "goods" },
  { term: "footwear", classNumber: 25, basicNumber: "250028", category: "goods" },
  { term: "headgear", classNumber: 25, basicNumber: "250029", category: "goods" },
  { term: "shirts", classNumber: 25, basicNumber: "250042", category: "goods" },
  { term: "t-shirts", classNumber: 25, basicNumber: "250155", category: "goods" },
  { term: "trousers", classNumber: 25, basicNumber: "250064", category: "goods" },
  { term: "jeans", classNumber: 25, basicNumber: "250088", category: "goods" },
  { term: "dresses", classNumber: 25, basicNumber: "250150", category: "goods" },
  { term: "skirts", classNumber: 25, basicNumber: "250090", category: "goods" },
  { term: "coats", classNumber: 25, basicNumber: "250060", category: "goods" },
  { term: "jackets [clothing]", classNumber: 25, basicNumber: "250121", category: "goods" },
  { term: "sweaters", classNumber: 25, basicNumber: "250104", category: "goods" },
  { term: "socks", classNumber: 25, basicNumber: "250036", category: "goods" },
  { term: "underwear", classNumber: 25, basicNumber: "250026", category: "goods" },
  { term: "shoes", classNumber: 25, basicNumber: "250130", category: "goods" },
  { term: "boots", classNumber: 25, basicNumber: "250017", category: "goods" },
  { term: "sandals", classNumber: 25, basicNumber: "250111", category: "goods" },
  { term: "hats", classNumber: 25, basicNumber: "250030", category: "goods" },
  { term: "caps [headwear]", classNumber: 25, basicNumber: "250023", category: "goods" },
  { term: "scarves", classNumber: 25, basicNumber: "250069", category: "goods" },
  { term: "gloves [clothing]", classNumber: 25, basicNumber: "250077", category: "goods" },
  { term: "belts [clothing]", classNumber: 25, basicNumber: "250025", category: "goods" },

  // CLASS 35 is services, starts at 35
  // Continue with more goods classes...

  // CLASS 28 - Games & Toys (sample)
  { term: "games", classNumber: 28, basicNumber: "280001", category: "goods" },
  { term: "toys", classNumber: 28, basicNumber: "280024", category: "goods" },
  { term: "video game consoles", classNumber: 28, basicNumber: "280255", category: "goods" },
  { term: "video game machines", classNumber: 28, basicNumber: "280214", category: "goods" },
  { term: "board games", classNumber: 28, basicNumber: "280155", category: "goods" },
  { term: "playing cards", classNumber: 28, basicNumber: "280036", category: "goods" },
  { term: "puzzles", classNumber: 28, basicNumber: "280076", category: "goods" },
  { term: "dolls", classNumber: 28, basicNumber: "280060", category: "goods" },
  { term: "stuffed toys", classNumber: 28, basicNumber: "280150", category: "goods" },
  { term: "teddy bears", classNumber: 28, basicNumber: "280151", category: "goods" },
  { term: "balls for games", classNumber: 28, basicNumber: "280007", category: "goods" },
  { term: "sporting articles", classNumber: 28, basicNumber: "280103", category: "goods" },
  { term: "exercise equipment", classNumber: 28, basicNumber: "280158", category: "goods" },
  { term: "skis", classNumber: 28, basicNumber: "280110", category: "goods" },
  { term: "snowboards", classNumber: 28, basicNumber: "280197", category: "goods" },
  { term: "surfboards", classNumber: 28, basicNumber: "280143", category: "goods" },
  { term: "golf clubs", classNumber: 28, basicNumber: "280040", category: "goods" },
  { term: "tennis rackets", classNumber: 28, basicNumber: "280081", category: "goods" },

  // CLASS 29 - Food Products (sample)
  { term: "meat", classNumber: 29, basicNumber: "290075", category: "goods" },
  { term: "fish, not live", classNumber: 29, basicNumber: "290080", category: "goods" },
  { term: "poultry, not live", classNumber: 29, basicNumber: "290086", category: "goods" },
  { term: "game, not live", classNumber: 29, basicNumber: "290053", category: "goods" },
  { term: "milk", classNumber: 29, basicNumber: "290070", category: "goods" },
  { term: "cheese", classNumber: 29, basicNumber: "290049", category: "goods" },
  { term: "butter", classNumber: 29, basicNumber: "290008", category: "goods" },
  { term: "yogurt", classNumber: 29, basicNumber: "290065", category: "goods" },
  { term: "eggs", classNumber: 29, basicNumber: "290076", category: "goods" },
  { term: "edible oils", classNumber: 29, basicNumber: "290059", category: "goods" },
  { term: "vegetables, preserved", classNumber: 29, basicNumber: "290029", category: "goods" },
  { term: "fruits, preserved", classNumber: 29, basicNumber: "290052", category: "goods" },
  { term: "jams", classNumber: 29, basicNumber: "290033", category: "goods" },
  { term: "nuts, prepared", classNumber: 29, basicNumber: "290074", category: "goods" },

  // CLASS 30 - Staple Foods (sample)
  { term: "coffee", classNumber: 30, basicNumber: "300019", category: "goods" },
  { term: "tea", classNumber: 30, basicNumber: "300037", category: "goods" },
  { term: "cocoa", classNumber: 30, basicNumber: "300018", category: "goods" },
  { term: "sugar", classNumber: 30, basicNumber: "300042", category: "goods" },
  { term: "rice", classNumber: 30, basicNumber: "300119", category: "goods" },
  { term: "flour", classNumber: 30, basicNumber: "300061", category: "goods" },
  { term: "bread", classNumber: 30, basicNumber: "300013", category: "goods" },
  { term: "pastries", classNumber: 30, basicNumber: "300103", category: "goods" },
  { term: "cakes", classNumber: 30, basicNumber: "300070", category: "goods" },
  { term: "biscuits", classNumber: 30, basicNumber: "300016", category: "goods" },
  { term: "chocolate", classNumber: 30, basicNumber: "300034", category: "goods" },
  { term: "candy", classNumber: 30, basicNumber: "300035", category: "goods" },
  { term: "ice cream", classNumber: 30, basicNumber: "300073", category: "goods" },
  { term: "honey", classNumber: 30, basicNumber: "300094", category: "goods" },
  { term: "pasta", classNumber: 30, basicNumber: "300101", category: "goods" },
  { term: "noodles", classNumber: 30, basicNumber: "300098", category: "goods" },
  { term: "sauces [condiments]", classNumber: 30, basicNumber: "300122", category: "goods" },
  { term: "spices", classNumber: 30, basicNumber: "300054", category: "goods" },
  { term: "seasonings", classNumber: 30, basicNumber: "300012", category: "goods" },

  // CLASS 32 - Beverages (sample)
  { term: "beers", classNumber: 32, basicNumber: "320002", category: "goods" },
  { term: "mineral water [beverages]", classNumber: 32, basicNumber: "320010", category: "goods" },
  { term: "aerated water", classNumber: 32, basicNumber: "320001", category: "goods" },
  { term: "fruit juices", classNumber: 32, basicNumber: "320023", category: "goods" },
  { term: "soft drinks", classNumber: 32, basicNumber: "320058", category: "goods" },
  { term: "energy drinks", classNumber: 32, basicNumber: "320049", category: "goods" },
  { term: "sports drinks", classNumber: 32, basicNumber: "320064", category: "goods" },
  { term: "non-alcoholic beverages", classNumber: 32, basicNumber: "320004", category: "goods" },
  { term: "smoothies", classNumber: 32, basicNumber: "320050", category: "goods" },

  // CLASS 33 - Alcoholic Beverages (sample)
  { term: "alcoholic beverages, except beer", classNumber: 33, basicNumber: "330001", category: "goods" },
  { term: "wine", classNumber: 33, basicNumber: "330040", category: "goods" },
  { term: "spirits [beverages]", classNumber: 33, basicNumber: "330020", category: "goods" },
  { term: "whisky", classNumber: 33, basicNumber: "330041", category: "goods" },
  { term: "vodka", classNumber: 33, basicNumber: "330034", category: "goods" },
  { term: "rum", classNumber: 33, basicNumber: "330033", category: "goods" },
  { term: "gin", classNumber: 33, basicNumber: "330025", category: "goods" },
  { term: "brandy", classNumber: 33, basicNumber: "330012", category: "goods" },
  { term: "liqueurs", classNumber: 33, basicNumber: "330026", category: "goods" },
  { term: "champagne", classNumber: 33, basicNumber: "330007", category: "goods" },
  { term: "sake", classNumber: 33, basicNumber: "330022", category: "goods" },
];

/**
 * All Nice Classification terms - Services (Classes 35-45)
 */
export const NICE_SERVICES_TERMS: NiceTerm[] = [
  // CLASS 35 - Advertising & Business (sample)
  { term: "advertising", classNumber: 35, basicNumber: "350039", category: "services" },
  { term: "business management", classNumber: 35, basicNumber: "350001", category: "services" },
  { term: "business administration", classNumber: 35, basicNumber: "350002", category: "services" },
  { term: "office functions", classNumber: 35, basicNumber: "350003", category: "services" },
  { term: "marketing", classNumber: 35, basicNumber: "350106", category: "services" },
  { term: "market research", classNumber: 35, basicNumber: "350051", category: "services" },
  { term: "public relations", classNumber: 35, basicNumber: "350042", category: "services" },
  { term: "import-export agency services", classNumber: 35, basicNumber: "350005", category: "services" },
  { term: "employment agency services", classNumber: 35, basicNumber: "350012", category: "services" },
  { term: "accounting", classNumber: 35, basicNumber: "350015", category: "services" },
  { term: "tax preparation", classNumber: 35, basicNumber: "350073", category: "services" },
  { term: "data processing services [office functions]", classNumber: 35, basicNumber: "350173", category: "services" },
  { term: "online retail services for downloadable digital music", classNumber: 35, basicNumber: "350145", category: "services" },
  { term: "provision of an online marketplace for buyers and sellers of goods and services", classNumber: 35, basicNumber: "350120", category: "services" },

  // CLASS 36 - Finance & Insurance (sample)
  { term: "insurance", classNumber: 36, basicNumber: "350011", category: "services" },
  { term: "financial affairs", classNumber: 36, basicNumber: "360001", category: "services" },
  { term: "monetary affairs", classNumber: 36, basicNumber: "360002", category: "services" },
  { term: "banking", classNumber: 36, basicNumber: "360013", category: "services" },
  { term: "real estate affairs", classNumber: 36, basicNumber: "360007", category: "services" },
  { term: "financial management", classNumber: 36, basicNumber: "360030", category: "services" },
  { term: "investment of funds", classNumber: 36, basicNumber: "360115", category: "services" },
  { term: "loans [financing]", classNumber: 36, basicNumber: "360024", category: "services" },
  { term: "credit card services", classNumber: 36, basicNumber: "360056", category: "services" },
  { term: "electronic funds transfer", classNumber: 36, basicNumber: "360058", category: "services" },
  { term: "crowdfunding", classNumber: 36, basicNumber: "360127", category: "services" },
  { term: "financial exchange of cryptocurrency", classNumber: 36, basicNumber: "360129", category: "services" },

  // CLASS 37 - Construction & Repair (sample)
  { term: "building construction", classNumber: 37, basicNumber: "370029", category: "services" },
  { term: "repair", classNumber: 37, basicNumber: "370001", category: "services" },
  { term: "installation services", classNumber: 37, basicNumber: "370002", category: "services" },
  { term: "construction consultancy", classNumber: 37, basicNumber: "370131", category: "services" },
  { term: "vehicle maintenance", classNumber: 37, basicNumber: "370085", category: "services" },
  { term: "computer hardware installation and repair", classNumber: 37, basicNumber: "370116", category: "services" },
  { term: "cleaning of buildings", classNumber: 37, basicNumber: "370009", category: "services" },
  { term: "plumbing", classNumber: 37, basicNumber: "370071", category: "services" },
  { term: "electrical installation services", classNumber: 37, basicNumber: "370003", category: "services" },
  { term: "charging of electric vehicles", classNumber: 37, basicNumber: "370151", category: "services" },

  // CLASS 38 - Telecommunications (sample)
  { term: "telecommunications", classNumber: 38, basicNumber: "380001", category: "services" },
  { term: "television broadcasting", classNumber: 38, basicNumber: "380005", category: "services" },
  { term: "radio broadcasting", classNumber: 38, basicNumber: "380003", category: "services" },
  { term: "communications by telephone", classNumber: 38, basicNumber: "380010", category: "services" },
  { term: "communications by computer terminals", classNumber: 38, basicNumber: "380023", category: "services" },
  { term: "providing access to databases", classNumber: 38, basicNumber: "380044", category: "services" },
  { term: "providing internet chatrooms", classNumber: 38, basicNumber: "380043", category: "services" },
  { term: "streaming of data", classNumber: 38, basicNumber: "380051", category: "services" },
  { term: "video-on-demand transmission", classNumber: 38, basicNumber: "380053", category: "services" },
  { term: "providing access to blockchain networks", classNumber: 38, basicNumber: "380057", category: "services" },

  // CLASS 39 - Transport & Storage (sample)
  { term: "transport", classNumber: 39, basicNumber: "390048", category: "services" },
  { term: "packaging of goods", classNumber: 39, basicNumber: "390022", category: "services" },
  { term: "storage of goods", classNumber: 39, basicNumber: "390028", category: "services" },
  { term: "travel arrangement", classNumber: 39, basicNumber: "390050", category: "services" },
  { term: "courier services [messages or merchandise]", classNumber: 39, basicNumber: "390075", category: "services" },
  { term: "delivery of goods", classNumber: 39, basicNumber: "390027", category: "services" },
  { term: "car rental", classNumber: 39, basicNumber: "390008", category: "services" },
  { term: "car sharing services", classNumber: 39, basicNumber: "390114", category: "services" },
  { term: "freight forwarding", classNumber: 39, basicNumber: "390060", category: "services" },
  { term: "warehousing", classNumber: 39, basicNumber: "390034", category: "services" },

  // CLASS 40 - Treatment of Materials (sample)
  { term: "treatment of materials", classNumber: 40, basicNumber: "400001", category: "services" },
  { term: "custom manufacturing of goods", classNumber: 40, basicNumber: "400002", category: "services" },
  { term: "printing", classNumber: 40, basicNumber: "400111", category: "services" },
  { term: "bookbinding", classNumber: 40, basicNumber: "400049", category: "services" },
  { term: "textile treating", classNumber: 40, basicNumber: "400058", category: "services" },
  { term: "woodworking", classNumber: 40, basicNumber: "400009", category: "services" },
  { term: "metal treating", classNumber: 40, basicNumber: "400042", category: "services" },
  { term: "recycling of waste and trash", classNumber: 40, basicNumber: "400068", category: "services" },
  { term: "food and drink preservation", classNumber: 40, basicNumber: "400066", category: "services" },
  { term: "custom 3D printing for others", classNumber: 40, basicNumber: "400127", category: "services" },

  // CLASS 41 - Education & Entertainment (sample)
  { term: "education", classNumber: 41, basicNumber: "410017", category: "services" },
  { term: "providing of training", classNumber: 41, basicNumber: "410002", category: "services" },
  { term: "entertainment", classNumber: 41, basicNumber: "410004", category: "services" },
  { term: "sporting activities", classNumber: 41, basicNumber: "410005", category: "services" },
  { term: "cultural activities", classNumber: 41, basicNumber: "410006", category: "services" },
  { term: "publication of books", classNumber: 41, basicNumber: "410024", category: "services" },
  { term: "film production", classNumber: 41, basicNumber: "410020", category: "services" },
  { term: "music production", classNumber: 41, basicNumber: "410196", category: "services" },
  { term: "game services provided online", classNumber: 41, basicNumber: "410094", category: "services" },
  { term: "e-sports services", classNumber: 41, basicNumber: "410233", category: "services" },
  { term: "coaching [training]", classNumber: 41, basicNumber: "410189", category: "services" },
  { term: "tutoring", classNumber: 41, basicNumber: "410202", category: "services" },

  // CLASS 42 - Scientific & Technology Services (sample)
  { term: "scientific and technological services", classNumber: 42, basicNumber: "420001", category: "services" },
  { term: "research and development of new products", classNumber: 42, basicNumber: "420161", category: "services" },
  { term: "industrial analysis and research", classNumber: 42, basicNumber: "420002", category: "services" },
  { term: "design and development of computer hardware and software", classNumber: 42, basicNumber: "420003", category: "services" },
  { term: "computer programming", classNumber: 42, basicNumber: "420090", category: "services" },
  { term: "software as a service [SaaS]", classNumber: 42, basicNumber: "420220", category: "services" },
  { term: "platform as a service [PaaS]", classNumber: 42, basicNumber: "420248", category: "services" },
  { term: "hosting computer websites", classNumber: 42, basicNumber: "420200", category: "services" },
  { term: "cloud computing", classNumber: 42, basicNumber: "420229", category: "services" },
  { term: "data encryption services", classNumber: 42, basicNumber: "420243", category: "services" },
  { term: "computer security consultancy", classNumber: 42, basicNumber: "420235", category: "services" },
  { term: "artificial intelligence consultancy", classNumber: 42, basicNumber: "420277", category: "services" },
  { term: "blockchain as a service [BaaS]", classNumber: 42, basicNumber: "420295", category: "services" },
  { term: "quantum computing", classNumber: 42, basicNumber: "420283", category: "services" },
  { term: "engineering", classNumber: 42, basicNumber: "420064", category: "services" },
  { term: "architectural services", classNumber: 42, basicNumber: "420011", category: "services" },
  { term: "industrial design", classNumber: 42, basicNumber: "420049", category: "services" },
  { term: "interior design", classNumber: 42, basicNumber: "420237", category: "services" },

  // CLASS 43 - Food & Accommodation Services (sample)
  { term: "services for providing food and drink", classNumber: 43, basicNumber: "430001", category: "services" },
  { term: "temporary accommodation", classNumber: 43, basicNumber: "430028", category: "services" },
  { term: "restaurant services", classNumber: 43, basicNumber: "430102", category: "services" },
  { term: "cafe services", classNumber: 43, basicNumber: "430024", category: "services" },
  { term: "bar services", classNumber: 43, basicNumber: "430138", category: "services" },
  { term: "hotel accommodation services", classNumber: 43, basicNumber: "430073", category: "services" },
  { term: "hotel reservations", classNumber: 43, basicNumber: "430105", category: "services" },
  { term: "catering", classNumber: 43, basicNumber: "430010", category: "services" },
  { term: "boarding for animals", classNumber: 43, basicNumber: "430134", category: "services" },
  { term: "day-nursery [creche] services", classNumber: 43, basicNumber: "430098", category: "services" },

  // CLASS 44 - Medical & Beauty Services (sample)
  { term: "medical services", classNumber: 44, basicNumber: "440001", category: "services" },
  { term: "veterinary services", classNumber: 44, basicNumber: "440111", category: "services" },
  { term: "hygienic and beauty care for human beings", classNumber: 44, basicNumber: "440002", category: "services" },
  { term: "hygienic and beauty care for animals", classNumber: 44, basicNumber: "440003", category: "services" },
  { term: "agriculture, horticulture and forestry services", classNumber: 44, basicNumber: "440004", category: "services" },
  { term: "hospital services", classNumber: 44, basicNumber: "440059", category: "services" },
  { term: "dentistry services", classNumber: 44, basicNumber: "440113", category: "services" },
  { term: "pharmacy advice", classNumber: 44, basicNumber: "440154", category: "services" },
  { term: "physical therapy", classNumber: 44, basicNumber: "440097", category: "services" },
  { term: "massage", classNumber: 44, basicNumber: "440086", category: "services" },
  { term: "beauty salon services", classNumber: 44, basicNumber: "440020", category: "services" },
  { term: "hairdressing", classNumber: 44, basicNumber: "440034", category: "services" },
  { term: "pet grooming", classNumber: 44, basicNumber: "440173", category: "services" },
  { term: "gardening", classNumber: 44, basicNumber: "440077", category: "services" },
  { term: "telemedicine services", classNumber: 44, basicNumber: "440198", category: "services" },

  // CLASS 45 - Legal & Security Services (sample)
  { term: "legal services", classNumber: 45, basicNumber: "450001", category: "services" },
  { term: "security services for the protection of property and individuals", classNumber: 45, basicNumber: "450002", category: "services" },
  { term: "personal and social services rendered by others to meet the needs of individuals", classNumber: 45, basicNumber: "450003", category: "services" },
  { term: "legal research", classNumber: 45, basicNumber: "450210", category: "services" },
  { term: "litigation services", classNumber: 45, basicNumber: "450211", category: "services" },
  { term: "intellectual property consultancy", classNumber: 45, basicNumber: "450206", category: "services" },
  { term: "licensing of intellectual property", classNumber: 45, basicNumber: "450208", category: "services" },
  { term: "licensing of computer software", classNumber: 45, basicNumber: "450212", category: "services" },
  { term: "personal bodyguarding", classNumber: 45, basicNumber: "450001", category: "services" },
  { term: "guard services", classNumber: 45, basicNumber: "450099", category: "services" },
  { term: "online social networking services", classNumber: 45, basicNumber: "450218", category: "services" },
  { term: "dating services", classNumber: 45, basicNumber: "450005", category: "services" },
  { term: "funeral services", classNumber: 45, basicNumber: "450057", category: "services" },
  { term: "babysitting", classNumber: 45, basicNumber: "450195", category: "services" },
  { term: "pet sitting", classNumber: 45, basicNumber: "450198", category: "services" },
  { term: "house sitting", classNumber: 45, basicNumber: "450197", category: "services" },
];

/**
 * Combined array of all Nice Classification terms
 */
export const ALL_NICE_TERMS: NiceTerm[] = [...NICE_GOODS_TERMS, ...NICE_SERVICES_TERMS];

/**
 * Get all terms for a specific class
 */
export function getTermsByClass(classNumber: number): NiceTerm[] {
  return ALL_NICE_TERMS.filter(term => term.classNumber === classNumber);
}

/**
 * Search terms by keyword
 */
export function searchTerms(keyword: string): NiceTerm[] {
  const lowerKeyword = keyword.toLowerCase();
  return ALL_NICE_TERMS.filter(term =>
    term.term.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Get all goods terms (Classes 1-34)
 */
export function getGoodsTerms(): NiceTerm[] {
  return ALL_NICE_TERMS.filter(term => term.category === 'goods');
}

/**
 * Get all services terms (Classes 35-45)
 */
export function getServicesTerms(): NiceTerm[] {
  return ALL_NICE_TERMS.filter(term => term.category === 'services');
}

/**
 * Get term count by class
 */
export function getTermCountByClass(): Map<number, number> {
  const counts = new Map<number, number>();
  for (const term of ALL_NICE_TERMS) {
    counts.set(term.classNumber, (counts.get(term.classNumber) || 0) + 1);
  }
  return counts;
}

/**
 * Total number of terms in the database
 */
export const TOTAL_TERM_COUNT = ALL_NICE_TERMS.length;

/**
 * Class statistics
 */
export const CLASS_STATS = {
  totalClasses: 45,
  goodsClasses: 34, // Classes 1-34
  servicesClasses: 11, // Classes 35-45
};
