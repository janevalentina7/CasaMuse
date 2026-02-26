export interface RoomSize {
  name: string;
  category: 'essential' | 'optional' | 'luxury';
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
    category: "essential",
    sizes: {
      small: { width: 10, height: 12, label: "Small (10' × 12')" },
      medium: { width: 12, height: 16, label: "Medium (12' × 16')" },
      large: { width: 16, height: 20, label: "Large (16' × 20')" },
    },
    minWidth: 10, minHeight: 10,
    vastuDirection: ["North-East", "East", "North"],
    description: "Sofa, coffee table, TV unit, seating circulation",
  },
  master_bedroom: {
    name: "Master Bedroom",
    category: "essential",
    sizes: {
      medium: { width: 12, height: 14, label: "Standard (12' × 14')" },
      large: { width: 14, height: 16, label: "Premium (14' × 16')" },
    },
    minWidth: 12, minHeight: 14,
    vastuDirection: ["South-West"],
    description: "King bed, wardrobe, side tables, dressing space, attached bath",
  },
  bedroom: {
    name: "Bedroom",
    category: "essential",
    sizes: {
      small: { width: 10, height: 12, label: "Compact (10' × 12')" },
      medium: { width: 11, height: 13, label: "Standard (11' × 13')" },
    },
    minWidth: 10, minHeight: 12,
    vastuDirection: ["North", "East", "North-East"],
    description: "Bed, study table, wardrobe",
  },
  kitchen: {
    name: "Kitchen",
    category: "essential",
    sizes: {
      small: { width: 8, height: 10, label: "Compact (8' × 10')" },
      medium: { width: 10, height: 12, label: "Standard (10' × 12')" },
    },
    minWidth: 8, minHeight: 10,
    vastuDirection: ["South-East", "North-West"],
    description: "L/parallel countertops, sink, stove, fridge, storage, ventilation window",
  },
  dining_room: {
    name: "Dining Room",
    category: "essential",
    sizes: {
      small: { width: 10, height: 12, label: "Compact (10' × 12')" },
      medium: { width: 12, height: 14, label: "Standard (12' × 14')" },
    },
    minWidth: 10, minHeight: 12,
    vastuDirection: ["West", "East"],
    description: "Dining table (4-6 seating), movement clearance",
  },
  bathroom_common: {
    name: "Common Bathroom",
    category: "essential",
    sizes: {
      small: { width: 4, height: 7, label: "Compact (4' × 7')" },
      medium: { width: 5, height: 8, label: "Standard (5' × 8')" },
    },
    minWidth: 4, minHeight: 7,
    vastuDirection: ["North-West", "West", "South"],
    description: "WC, wash basin, shower",
  },
  bathroom_attached: {
    name: "Attached Bathroom",
    category: "optional",
    sizes: {
      medium: { width: 5, height: 8, label: "Standard (5' × 8')" },
      large: { width: 6, height: 8, label: "Large (6' × 8')" },
    },
    minWidth: 5, minHeight: 8,
    vastuDirection: ["North-West", "West", "South"],
    description: "WC, shower, wash basin – attached to bedrooms",
  },
  entrance_foyer: {
    name: "Entrance Foyer",
    category: "essential",
    sizes: {
      small: { width: 5, height: 6, label: "Compact (5' × 6')" },
      medium: { width: 6, height: 8, label: "Standard (6' × 8')" },
    },
    minWidth: 5, minHeight: 6,
    vastuDirection: ["North", "East"],
    description: "Entry transition, shoe rack, console",
  },
  utility_area: {
    name: "Utility Area",
    category: "essential",
    sizes: {
      small: { width: 4, height: 6, label: "Small (4' × 6')" },
      medium: { width: 5, height: 8, label: "Standard (5' × 8')" },
    },
    minWidth: 4, minHeight: 6,
    vastuDirection: ["South-East", "South"],
    description: "Washing machine, sink, geyser point",
  },
  guest_room: {
    name: "Guest Bedroom",
    category: "optional",
    sizes: {
      medium: { width: 10, height: 12, label: "Standard (10' × 12')" },
    },
    minWidth: 10, minHeight: 12,
    vastuDirection: ["North-West"],
    description: "Comfortable stay with bed, wardrobe",
  },
  study_room: {
    name: "Study / Home Office",
    category: "optional",
    sizes: {
      small: { width: 8, height: 10, label: "Compact (8' × 10')" },
      medium: { width: 10, height: 12, label: "Standard (10' × 12')" },
    },
    minWidth: 8, minHeight: 10,
    vastuDirection: ["North", "North-East"],
    description: "Desk, bookshelf, good lighting",
  },
  pooja_room: {
    name: "Pooja Room",
    category: "optional",
    sizes: {
      small: { width: 4, height: 6, label: "Small (4' × 6')" },
      medium: { width: 5, height: 7, label: "Standard (5' × 7')" },
    },
    minWidth: 4, minHeight: 5,
    vastuDirection: ["North-East"],
    description: "Prayer room, peaceful location",
  },
  store_room: {
    name: "Store Room",
    category: "optional",
    sizes: {
      small: { width: 5, height: 7, label: "Small (5' × 7')" },
      medium: { width: 6, height: 8, label: "Standard (6' × 8')" },
    },
    minWidth: 5, minHeight: 6,
    vastuDirection: ["South", "South-West", "West"],
    description: "Storage space",
  },
  balcony: {
    name: "Balcony",
    category: "optional",
    sizes: {
      small: { width: 4, height: 8, label: "Compact (4' wide)" },
      medium: { width: 6, height: 10, label: "Comfortable (6' wide)" },
    },
    minWidth: 4, minHeight: 6,
    vastuDirection: ["East", "North"],
    description: "Railing, access door, morning light",
  },
  powder_room: {
    name: "Powder Room / WC",
    category: "optional",
    sizes: {
      small: { width: 4, height: 4, label: "Compact (4' × 4')" },
      medium: { width: 4, height: 5, label: "Standard (4' × 5')" },
    },
    minWidth: 4, minHeight: 4,
    description: "WC + wash basin near living area",
  },
  // Luxury
  home_theatre: {
    name: "Home Theatre",
    category: "luxury",
    sizes: {
      medium: { width: 12, height: 16, label: "Standard (12' × 16')" },
    },
    minWidth: 10, minHeight: 12,
    vastuDirection: ["South", "South-West"],
    description: "Entertainment room, soundproofed",
  },
  walk_in_closet: {
    name: "Walk-in Closet",
    category: "luxury",
    sizes: {
      medium: { width: 6, height: 8, label: "Standard (6' × 8')" },
    },
    minWidth: 5, minHeight: 6,
    vastuDirection: ["South-West", "West"],
    description: "Attached to master bedroom",
  },
  home_office: {
    name: "Home Office",
    category: "luxury",
    sizes: {
      medium: { width: 10, height: 12, label: "Standard (10' × 12')" },
    },
    minWidth: 8, minHeight: 10,
    vastuDirection: ["North", "East"],
    description: "Dedicated work-from-home space",
  },
  gym: {
    name: "Gym Room",
    category: "luxury",
    sizes: {
      medium: { width: 10, height: 14, label: "Standard (10' × 14')" },
    },
    minWidth: 10, minHeight: 12,
    vastuDirection: ["South", "West"],
    description: "Exercise area with equipment space",
  },
  laundry_room: {
    name: "Laundry Room",
    category: "luxury",
    sizes: {
      medium: { width: 6, height: 7, label: "Standard (6' × 7')" },
    },
    minWidth: 5, minHeight: 6,
    vastuDirection: ["South-East", "North-West"],
    description: "Dedicated washing & drying area",
  },
  library: {
    name: "Library / Reading Nook",
    category: "luxury",
    sizes: {
      small: { width: 8, height: 10, label: "Compact (8' × 10')" },
      medium: { width: 10, height: 12, label: "Standard (10' × 12')" },
    },
    minWidth: 8, minHeight: 10,
    vastuDirection: ["North", "East"],
    description: "Bookshelves, reading chair, good lighting",
  },
  game_room: {
    name: "Game / Entertainment Room",
    category: "luxury",
    sizes: {
      medium: { width: 12, height: 14, label: "Standard (12' × 14')" },
    },
    minWidth: 10, minHeight: 12,
    description: "Gaming, pool table, entertainment",
  },
  meditation_room: {
    name: "Meditation Room",
    category: "luxury",
    sizes: {
      small: { width: 6, height: 8, label: "Compact (6' × 8')" },
      medium: { width: 8, height: 10, label: "Standard (8' × 10')" },
    },
    minWidth: 6, minHeight: 8,
    vastuDirection: ["North-East"],
    description: "Peaceful, quiet space for meditation",
  },
  bar_counter: {
    name: "Bar Counter Area",
    category: "luxury",
    sizes: {
      medium: { width: 6, height: 8, label: "Standard (6' × 8')" },
    },
    minWidth: 5, minHeight: 6,
    description: "Bar counter, stools, bottle storage",
  },
  walk_in_pantry: {
    name: "Walk-in Pantry",
    category: "luxury",
    sizes: {
      medium: { width: 5, height: 7, label: "Standard (5' × 7')" },
    },
    minWidth: 4, minHeight: 6,
    vastuDirection: ["South-East"],
    description: "Extended kitchen storage",
  },
  courtyard: {
    name: "Courtyard",
    category: "luxury",
    sizes: {
      small: { width: 8, height: 8, label: "Compact (8' × 8')" },
      medium: { width: 10, height: 12, label: "Standard (10' × 12')" },
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
