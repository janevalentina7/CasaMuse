export interface RoomSize {
  name: string;
  category: string;
  sizes: {
    small?: { width: number; height: number; label: string };
    medium: { width: number; height: number; label: string };
    large?: { width: number; height: number; label: string };
  };
  minWidth: number;
  minHeight: number;
  vastuDirection?: string[];
  description: string;
}

export const ROOM_DATA: Record<string, RoomSize> = {
  living_room: {
    name: "Living Room",
    category: "core",
    sizes: {
      small: { width: 12, height: 14, label: "Small (12' × 14' = 168 sq.ft)" },
      medium: { width: 14, height: 18, label: "Medium (14' × 18' = 252 sq.ft)" },
      large: { width: 16, height: 20, label: "Large (16' × 20' = 320 sq.ft)" },
    },
    minWidth: 12, minHeight: 14,
    vastuDirection: ["North-East", "East", "North"],
    description: "Sofa, coffee table, TV unit, seating circulation",
  },
  master_bedroom: {
    name: "Master Bedroom",
    category: "core",
    sizes: {
      medium: { width: 12, height: 14, label: "Standard (12' × 14' = 168 sq.ft)" },
      large: { width: 14, height: 16, label: "Premium (14' × 16' = 224 sq.ft)" },
    },
    minWidth: 12, minHeight: 14,
    vastuDirection: ["South-West"],
    description: "King bed, wardrobe, side tables, dressing space, attached bath",
  },
  bedroom: {
    name: "Bedroom",
    category: "core",
    sizes: {
      small: { width: 10, height: 12, label: "Compact (10' × 12' = 120 sq.ft)" },
      medium: { width: 11, height: 13, label: "Standard (11' × 13' = 143 sq.ft)" },
    },
    minWidth: 10, minHeight: 12,
    vastuDirection: ["North", "East", "North-East"],
    description: "Bed, study table, wardrobe",
  },
  kitchen: {
    name: "Kitchen",
    category: "core",
    sizes: {
      small: { width: 7, height: 10, label: "Compact (7' × 10' = 70 sq.ft)" },
      medium: { width: 8, height: 12, label: "Standard (8' × 12' = 96 sq.ft)" },
    },
    minWidth: 7, minHeight: 10,
    vastuDirection: ["South-East", "North-West"],
    description: "L/parallel countertops, sink, stove, fridge, storage, ventilation window",
  },
  dining_room: {
    name: "Dining Room",
    category: "core",
    sizes: {
      small: { width: 9, height: 11, label: "Compact (9' × 11' = 99 sq.ft)" },
      medium: { width: 11, height: 13, label: "Standard (11' × 13' = 143 sq.ft)" },
    },
    minWidth: 9, minHeight: 11,
    vastuDirection: ["West", "East"],
    description: "Dining table (4-6 seating), movement clearance",
  },
  bathroom_common: {
    name: "Common Bathroom",
    category: "core",
    sizes: {
      small: { width: 4, height: 6, label: "Compact (4' × 6' = 24 sq.ft)" },
      medium: { width: 5, height: 8, label: "Standard (5' × 8' = 40 sq.ft)" },
    },
    minWidth: 4, minHeight: 6,
    vastuDirection: ["North-West", "West", "South"],
    description: "WC, wash basin, shower",
  },
  bathroom_attached: {
    name: "Attached Bathroom",
    category: "additional",
    sizes: {
      medium: { width: 5, height: 8, label: "Standard (5' × 8' = 40 sq.ft)" },
      large: { width: 6, height: 9, label: "Large (6' × 9' = 54 sq.ft)" },
    },
    minWidth: 5, minHeight: 8,
    vastuDirection: ["North-West", "West", "South"],
    description: "WC, shower, wash basin – attached to bedrooms",
  },
  entrance_foyer: {
    name: "Entrance Foyer",
    category: "additional",
    sizes: {
      small: { width: 5, height: 6, label: "Compact (5' × 6' = 30 sq.ft)" },
      medium: { width: 6, height: 8, label: "Standard (6' × 8' = 48 sq.ft)" },
    },
    minWidth: 5, minHeight: 6,
    vastuDirection: ["North", "East"],
    description: "Entry transition, shoe rack, console",
  },
  utility_area: {
    name: "Utility Area",
    category: "additional",
    sizes: {
      small: { width: 4, height: 6, label: "Small (4' × 6' = 24 sq.ft)" },
      medium: { width: 5, height: 7, label: "Standard (5' × 7' = 35 sq.ft)" },
    },
    minWidth: 4, minHeight: 6,
    vastuDirection: ["South-East", "South"],
    description: "Washing machine, sink, geyser point",
  },
  guest_room: {
    name: "Guest Bedroom",
    category: "additional",
    sizes: {
      medium: { width: 10, height: 12, label: "Standard (10' × 12' = 120 sq.ft)" },
    },
    minWidth: 10, minHeight: 12,
    vastuDirection: ["North-West"],
    description: "Comfortable stay with bed, wardrobe",
  },
  study_room: {
    name: "Study / Home Office",
    category: "additional",
    sizes: {
      small: { width: 8, height: 9, label: "Compact (8' × 9' = 72 sq.ft)" },
      medium: { width: 9, height: 11, label: "Standard (9' × 11' = 99 sq.ft)" },
    },
    minWidth: 8, minHeight: 9,
    vastuDirection: ["North", "North-East"],
    description: "Desk, bookshelf, good lighting",
  },
  pooja_room: {
    name: "Pooja Room",
    category: "additional",
    sizes: {
      small: { width: 4, height: 5, label: "Small (4' × 5' = 20 sq.ft)" },
      medium: { width: 5, height: 7, label: "Standard (5' × 7' = 35 sq.ft)" },
    },
    minWidth: 4, minHeight: 5,
    vastuDirection: ["North-East"],
    description: "Prayer room, peaceful location",
  },
  store_room: {
    name: "Store Room",
    category: "additional",
    sizes: {
      small: { width: 5, height: 6, label: "Small (5' × 6' = 30 sq.ft)" },
      medium: { width: 6, height: 8, label: "Standard (6' × 8' = 48 sq.ft)" },
    },
    minWidth: 5, minHeight: 6,
    vastuDirection: ["South", "South-West", "West"],
    description: "Storage space",
  },
  balcony: {
    name: "Balcony",
    category: "additional",
    sizes: {
      small: { width: 4, height: 8, label: "Compact (4' × 8' = 32 sq.ft)" },
      medium: { width: 5, height: 10, label: "Comfortable (5' × 10' = 50 sq.ft)" },
    },
    minWidth: 4, minHeight: 6,
    vastuDirection: ["East", "North"],
    description: "Railing, access door, morning light",
  },
  powder_room: {
    name: "Powder Room / WC",
    category: "additional",
    sizes: {
      small: { width: 3, height: 4, label: "Compact (3' × 4' = 12 sq.ft)" },
      medium: { width: 4, height: 5, label: "Standard (4' × 5' = 20 sq.ft)" },
    },
    minWidth: 3, minHeight: 4,
    description: "WC + wash basin near living area",
  },
  // Specialty
  home_theatre: {
    name: "Home Theatre",
    category: "specialty",
    sizes: {
      medium: { width: 13, height: 16, label: "Standard (13' × 16' = 208 sq.ft)" },
    },
    minWidth: 12, minHeight: 14,
    vastuDirection: ["South", "South-West"],
    description: "Entertainment room, soundproofed",
  },
  walk_in_closet: {
    name: "Walk-in Closet",
    category: "specialty",
    sizes: {
      medium: { width: 6, height: 7, label: "Standard (6' × 7' = 42 sq.ft)" },
    },
    minWidth: 5, minHeight: 6,
    vastuDirection: ["South-West", "West"],
    description: "Attached to master bedroom",
  },
  home_office: {
    name: "Home Office",
    category: "specialty",
    sizes: {
      medium: { width: 10, height: 11, label: "Standard (10' × 11' = 110 sq.ft)" },
    },
    minWidth: 9, minHeight: 10,
    vastuDirection: ["North", "East"],
    description: "Dedicated work-from-home space",
  },
  gym: {
    name: "Gym Room",
    category: "specialty",
    sizes: {
      medium: { width: 11, height: 14, label: "Standard (11' × 14' = 154 sq.ft)" },
    },
    minWidth: 10, minHeight: 12,
    vastuDirection: ["South", "West"],
    description: "Exercise area with equipment space",
  },
  laundry_room: {
    name: "Laundry Room",
    category: "specialty",
    sizes: {
      medium: { width: 6, height: 7, label: "Standard (6' × 7' = 42 sq.ft)" },
    },
    minWidth: 5, minHeight: 6,
    vastuDirection: ["South-East", "North-West"],
    description: "Dedicated washing & drying area",
  },
  library: {
    name: "Library / Reading Nook",
    category: "specialty",
    sizes: {
      small: { width: 7, height: 9, label: "Compact (7' × 9' = 63 sq.ft)" },
      medium: { width: 9, height: 12, label: "Standard (9' × 12' = 108 sq.ft)" },
    },
    minWidth: 7, minHeight: 9,
    vastuDirection: ["North", "East"],
    description: "Bookshelves, reading chair, good lighting",
  },
  game_room: {
    name: "Game / Entertainment Room",
    category: "specialty",
    sizes: {
      medium: { width: 13, height: 15, label: "Standard (13' × 15' = 195 sq.ft)" },
    },
    minWidth: 12, minHeight: 14,
    description: "Gaming, pool table, entertainment",
  },
  meditation_room: {
    name: "Meditation Room",
    category: "specialty",
    sizes: {
      small: { width: 6, height: 7, label: "Compact (6' × 7' = 42 sq.ft)" },
      medium: { width: 8, height: 9, label: "Standard (8' × 9' = 72 sq.ft)" },
    },
    minWidth: 6, minHeight: 7,
    vastuDirection: ["North-East"],
    description: "Peaceful, quiet space for meditation",
  },
  bar_counter: {
    name: "Bar Counter Area",
    category: "specialty",
    sizes: {
      medium: { width: 6, height: 8, label: "Standard (6' × 8' = 48 sq.ft)" },
    },
    minWidth: 5, minHeight: 6,
    description: "Bar counter, stools, bottle storage",
  },
  walk_in_pantry: {
    name: "Walk-in Pantry",
    category: "specialty",
    sizes: {
      medium: { width: 5, height: 6, label: "Standard (5' × 6' = 30 sq.ft)" },
    },
    minWidth: 4, minHeight: 5,
    vastuDirection: ["South-East"],
    description: "Extended kitchen storage",
  },
  courtyard: {
    name: "Courtyard",
    category: "specialty",
    sizes: {
      small: { width: 8, height: 8, label: "Compact (8' × 8' = 64 sq.ft)" },
      medium: { width: 10, height: 12, label: "Standard (10' × 12' = 120 sq.ft)" },
    },
    minWidth: 8, minHeight: 8,
    description: "Open-air inner courtyard, natural light & ventilation",
  },
};

export const OUTDOOR_FEATURES: Record<string, any> = {
  car_parking: {
    name: "Car Parking / Garage",
    sizes: {
      small: { width: 9, height: 18, label: "Small Car (9' × 18')" },
      large: { width: 10, height: 20, label: "SUV (10' × 20')" },
    },
    minWidth: 9, minHeight: 18,
    vastuDirection: ["North-West", "North", "East"],
    description: "Driveway access, vehicle clearance",
  },
  garden: {
    name: "Garden / Landscape",
    sizes: {
      small: { width: 8, height: 10, label: "Small (8' × 10')" },
      medium: { width: 12, height: 15, label: "Medium (12' × 15')" },
      large: { width: 15, height: 20, label: "Large (15' × 20')" },
    },
    minWidth: 6, minHeight: 8,
    vastuDirection: ["North", "East"],
    description: "Sunlight exposure, walking pathways",
  },
  terrace: {
    name: "Terrace / Rooftop",
    description: "Open space on top floor",
  },
  sitout: {
    name: "Sit-out / Porch",
    sizes: {
      medium: { width: 6, height: 8, label: "Standard (6' × 8')" },
    },
    minWidth: 5, minHeight: 6,
    description: "Covered outdoor seating",
  },
  swimming_pool: {
    name: "Swimming Pool",
    sizes: {
      small: { width: 10, height: 20, label: "Small (10' × 20')" },
      medium: { width: 12, height: 24, label: "Standard (12' × 24')" },
    },
    minWidth: 10, minHeight: 20,
    description: "Outdoor pool with deck area",
  },
};

export const ARCHITECTURAL_STYLES = [
  "Modern",
  "Contemporary",
  "Traditional",
  "Minimalist",
  "Luxury",
  "Scandinavian",
  "Industrial",
  "Colonial",
  "Mediterranean",
  "Rustic",
];
