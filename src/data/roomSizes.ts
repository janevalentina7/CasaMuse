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
      large: { width: 14, height: 18, label: "Large (14' × 18')" },
    },
    minWidth: 10,
    minHeight: 10,
    vastuDirection: ["North-East", "East", "North"],
    description: "Front of house, good ventilation, connected to entrance",
  },
  master_bedroom: {
    name: "Master Bedroom",
    category: "essential",
    sizes: {
      medium: { width: 12, height: 14, label: "Standard (12' × 14')" },
      large: { width: 14, height: 16, label: "Premium (14' × 16')" },
    },
    minWidth: 10,
    minHeight: 10,
    vastuDirection: ["South-West"],
    description: "Quietest area, attached bathroom, wardrobe space",
  },
  bedroom: {
    name: "Bedroom",
    category: "essential",
    sizes: {
      small: { width: 10, height: 10, label: "Compact (10' × 10')" },
      medium: { width: 10, height: 12, label: "Standard (10' × 12')" },
    },
    minWidth: 9,
    minHeight: 9,
    vastuDirection: ["North", "East", "North-East"],
    description: "Comfortable sleeping space with wardrobe",
  },
  kitchen: {
    name: "Kitchen",
    category: "essential",
    sizes: {
      small: { width: 7, height: 10, label: "Compact (7' × 10')" },
      medium: { width: 8, height: 12, label: "Standard (8' × 12')" },
    },
    minWidth: 7,
    minHeight: 8,
    vastuDirection: ["South-East", "North-West"],
    description: "Agni corner, utility area behind",
  },
  dining_room: {
    name: "Dining Room",
    category: "essential",
    sizes: {
      small: { width: 8, height: 10, label: "Compact (8' × 10')" },
      medium: { width: 10, height: 12, label: "Standard (10' × 12')" },
    },
    minWidth: 8,
    minHeight: 8,
    vastuDirection: ["West", "East"],
    description: "Near kitchen, between living and kitchen",
  },
  bathroom_common: {
    name: "Common Bathroom",
    category: "essential",
    sizes: {
      medium: { width: 5, height: 7, label: "Standard (5' × 7')" },
    },
    minWidth: 5,
    minHeight: 6,
    vastuDirection: ["North-West", "West", "South"],
    description: "Shared bathroom, avoid North-East",
  },
  bathroom_attached: {
    name: "Attached Bathroom",
    category: "optional",
    sizes: {
      medium: { width: 6, height: 8, label: "Standard (6' × 8')" },
      large: { width: 7, height: 8, label: "Large (7' × 8')" },
    },
    minWidth: 5,
    minHeight: 6,
    vastuDirection: ["North-West", "West", "South"],
    description: "Attached to bedrooms",
  },
  guest_room: {
    name: "Guest Bedroom",
    category: "optional",
    sizes: {
      medium: { width: 10, height: 12, label: "Standard (10' × 12')" },
    },
    minWidth: 9,
    minHeight: 10,
    vastuDirection: ["North-West"],
    description: "Temporary stay, comfortable space",
  },
  study_room: {
    name: "Study Room",
    category: "optional",
    sizes: {
      small: { width: 8, height: 10, label: "Compact (8' × 10')" },
      medium: { width: 9, height: 12, label: "Standard (9' × 12')" },
    },
    minWidth: 7,
    minHeight: 8,
    vastuDirection: ["North", "North-East"],
    description: "Concentration space, good lighting",
  },
  pooja_room: {
    name: "Pooja Room",
    category: "optional",
    sizes: {
      small: { width: 4, height: 6, label: "Small (4' × 6')" },
      medium: { width: 5, height: 7, label: "Standard (5' × 7')" },
    },
    minWidth: 4,
    minHeight: 5,
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
    minWidth: 5,
    minHeight: 6,
    vastuDirection: ["South", "South-West", "West"],
    description: "Storage space",
  },
  utility_area: {
    name: "Utility Area",
    category: "optional",
    sizes: {
      small: { width: 5, height: 7, label: "Small (5' × 7')" },
      medium: { width: 6, height: 10, label: "Standard (6' × 10')" },
    },
    minWidth: 5,
    minHeight: 6,
    vastuDirection: ["South-East", "South"],
    description: "Behind kitchen, washing area",
  },
  balcony: {
    name: "Balcony",
    category: "optional",
    sizes: {
      small: { width: 4, height: 8, label: "Compact (4' wide)" },
      medium: { width: 6, height: 10, label: "Comfortable (6' wide)" },
    },
    minWidth: 4,
    minHeight: 6,
    vastuDirection: ["East", "North"],
    description: "Morning light, attached to living/bedroom",
  },
  home_theatre: {
    name: "Home Theatre",
    category: "luxury",
    sizes: {
      medium: { width: 12, height: 16, label: "Standard (12' × 16')" },
    },
    minWidth: 10,
    minHeight: 12,
    vastuDirection: ["South", "South-West"],
    description: "Entertainment room, quiet zone",
  },
  walk_in_closet: {
    name: "Walk-in Closet",
    category: "luxury",
    sizes: {
      medium: { width: 6, height: 8, label: "Standard (6' × 8')" },
    },
    minWidth: 5,
    minHeight: 6,
    vastuDirection: ["South-West", "West"],
    description: "Attached to master bedroom",
  },
  home_office: {
    name: "Home Office",
    category: "luxury",
    sizes: {
      medium: { width: 10, height: 12, label: "Standard (10' × 12')" },
    },
    minWidth: 8,
    minHeight: 10,
    vastuDirection: ["North", "East"],
    description: "Work from home space",
  },
  gym: {
    name: "Gym Room",
    category: "luxury",
    sizes: {
      medium: { width: 10, height: 14, label: "Standard (10' × 14')" },
    },
    minWidth: 10,
    minHeight: 12,
    vastuDirection: ["South", "West"],
    description: "Exercise area",
  },
  laundry_room: {
    name: "Laundry Room",
    category: "luxury",
    sizes: {
      medium: { width: 6, height: 7, label: "Standard (6' × 7')" },
    },
    minWidth: 5,
    minHeight: 6,
    vastuDirection: ["South-East", "North-West"],
    description: "Dedicated washing area",
  },
};

export const OUTDOOR_FEATURES = {
  car_parking: {
    name: "Car Parking",
    sizes: {
      small: { width: 8, height: 15, label: "Small Car (8' × 15')" },
      large: { width: 10, height: 18, label: "SUV (10' × 18')" },
    },
    minWidth: 8,
    minHeight: 15,
    vastuDirection: ["North-West", "North", "East"],
  },
  garden: {
    name: "Garden/Lawn",
    sizes: {
      small: { width: 8, height: 10, label: "Small (8' × 10')" },
      medium: { width: 12, height: 15, label: "Medium (12' × 15')" },
      large: { width: 15, height: 20, label: "Large (15' × 20')" },
    },
    minWidth: 6,
    minHeight: 8,
    vastuDirection: ["North", "East"],
  },
  terrace: {
    name: "Terrace/Rooftop",
    description: "Open space on top floor",
  },
  sitout: {
    name: "Sit-out/Porch",
    sizes: {
      medium: { width: 6, height: 8, label: "Standard (6' × 8')" },
    },
    minWidth: 5,
    minHeight: 6,
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
