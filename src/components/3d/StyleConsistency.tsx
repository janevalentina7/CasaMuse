// Style consistency configuration for matching AI rendered views with procedural 3D model
// This file defines the exact material properties, colors, and furniture styles for each architectural style

export interface StyleConsistencyConfig {
  // Wall materials
  exteriorWall: {
    color: string;
    roughness: number;
    metalness: number;
    texture: 'stucco' | 'brick' | 'concrete' | 'wood' | 'stone';
  };
  interiorWall: {
    color: string;
    roughness: number;
    texture: 'paint' | 'wallpaper' | 'textured' | 'paneling';
  };
  
  // Floor materials
  floor: {
    primary: { color: string; material: 'wood' | 'tile' | 'marble' | 'carpet' | 'concrete' };
    bathroom: { color: string; material: 'tile' | 'marble' | 'stone' };
    kitchen: { color: string; material: 'tile' | 'stone' | 'marble' | 'concrete' };
  };
  
  // Furniture colors
  furniture: {
    primaryWood: string;
    secondaryWood: string;
    upholstery: string;
    accent: string;
    metal: string;
  };
  
  // Decorations
  decor: {
    curtainColor: string;
    rugColor: string;
    cushionPrimary: string;
    cushionAccent: string;
    plantPot: string;
    lampShade: string;
    metalAccent: string;
  };
  
  // Exterior
  exterior: {
    roofColor: string;
    roofMaterial: 'tile' | 'shingle' | 'metal' | 'slate';
    trimColor: string;
    doorColor: string;
    windowFrame: string;
    railingColor: string;
    pathwayColor: string;
    fenceStyle: 'picket' | 'rustic' | 'modern' | 'iron';
  };
  
  // Lighting
  lighting: {
    warmth: 'warm' | 'neutral' | 'cool';
    intensity: number;
    fixtureStyle: 'modern' | 'traditional' | 'industrial' | 'rustic';
  };
}

export const styleConfigs: Record<string, StyleConsistencyConfig> = {
  Modern: {
    exteriorWall: { color: '#f5f5f5', roughness: 0.3, metalness: 0, texture: 'concrete' },
    interiorWall: { color: '#ffffff', roughness: 0.2, texture: 'paint' },
    floor: {
      primary: { color: '#c4b8a8', material: 'wood' },
      bathroom: { color: '#e0e0e0', material: 'tile' },
      kitchen: { color: '#d0d0d0', material: 'tile' }
    },
    furniture: {
      primaryWood: '#2d2d2d',
      secondaryWood: '#404040',
      upholstery: '#8b8b8b',
      accent: '#4a90a4',
      metal: '#c0c0c0'
    },
    decor: {
      curtainColor: '#e0e0e0',
      rugColor: '#6b6b6b',
      cushionPrimary: '#ffffff',
      cushionAccent: '#4a90a4',
      plantPot: '#2d2d2d',
      lampShade: '#ffffff',
      metalAccent: '#c0c0c0'
    },
    exterior: {
      roofColor: '#2c2c2c',
      roofMaterial: 'metal',
      trimColor: '#1a1a1a',
      doorColor: '#3a3a3a',
      windowFrame: '#1a1a1a',
      railingColor: '#2d2d2d',
      pathwayColor: '#808080',
      fenceStyle: 'modern'
    },
    lighting: { warmth: 'neutral', intensity: 1.0, fixtureStyle: 'modern' }
  },
  
  Contemporary: {
    exteriorWall: { color: '#e8e8e8', roughness: 0.4, metalness: 0, texture: 'stucco' },
    interiorWall: { color: '#f8f8f8', roughness: 0.3, texture: 'paint' },
    floor: {
      primary: { color: '#b8a898', material: 'wood' },
      bathroom: { color: '#d4d4d4', material: 'marble' },
      kitchen: { color: '#c8c8c8', material: 'tile' }
    },
    furniture: {
      primaryWood: '#5a4a3a',
      secondaryWood: '#8b6914',
      upholstery: '#6b5b4f',
      accent: '#6b8e23',
      metal: '#b8b8b8'
    },
    decor: {
      curtainColor: '#d0d0d0',
      rugColor: '#8b7355',
      cushionPrimary: '#e0e0e0',
      cushionAccent: '#6b8e23',
      plantPot: '#5a4a3a',
      lampShade: '#f5e6d3',
      metalAccent: '#b8b8b8'
    },
    exterior: {
      roofColor: '#404040',
      roofMaterial: 'shingle',
      trimColor: '#505050',
      doorColor: '#5a4a3a',
      windowFrame: '#404040',
      railingColor: '#505050',
      pathwayColor: '#707070',
      fenceStyle: 'modern'
    },
    lighting: { warmth: 'neutral', intensity: 0.9, fixtureStyle: 'modern' }
  },
  
  Traditional: {
    exteriorWall: { color: '#fff8f0', roughness: 0.6, metalness: 0, texture: 'brick' },
    interiorWall: { color: '#faf5e8', roughness: 0.5, texture: 'wallpaper' },
    floor: {
      primary: { color: '#a67c52', material: 'wood' },
      bathroom: { color: '#e8dcc8', material: 'marble' },
      kitchen: { color: '#d4c5b5', material: 'tile' }
    },
    furniture: {
      primaryWood: '#654321',
      secondaryWood: '#8b4513',
      upholstery: '#8b0000',
      accent: '#c9a227',
      metal: '#c9a227'
    },
    decor: {
      curtainColor: '#8b0000',
      rugColor: '#800020',
      cushionPrimary: '#f5e6d3',
      cushionAccent: '#c9a227',
      plantPot: '#654321',
      lampShade: '#f5e6d3',
      metalAccent: '#c9a227'
    },
    exterior: {
      roofColor: '#8b4513',
      roofMaterial: 'shingle',
      trimColor: '#ffffff',
      doorColor: '#654321',
      windowFrame: '#ffffff',
      railingColor: '#1a1a1a',
      pathwayColor: '#a67c52',
      fenceStyle: 'picket'
    },
    lighting: { warmth: 'warm', intensity: 0.85, fixtureStyle: 'traditional' }
  },
  
  Mediterranean: {
    exteriorWall: { color: '#fff8dc', roughness: 0.7, metalness: 0, texture: 'stucco' },
    interiorWall: { color: '#faf5e0', roughness: 0.6, texture: 'textured' },
    floor: {
      primary: { color: '#cd853f', material: 'tile' },
      bathroom: { color: '#d4a574', material: 'tile' },
      kitchen: { color: '#c49a6c', material: 'tile' }
    },
    furniture: {
      primaryWood: '#6b4423',
      secondaryWood: '#8b6914',
      upholstery: '#4682b4',
      accent: '#ff6b35',
      metal: '#8b6914'
    },
    decor: {
      curtainColor: '#4682b4',
      rugColor: '#cd853f',
      cushionPrimary: '#fff8dc',
      cushionAccent: '#ff6b35',
      plantPot: '#8b4513',
      lampShade: '#faf0e6',
      metalAccent: '#c9a227'
    },
    exterior: {
      roofColor: '#b22222',
      roofMaterial: 'tile',
      trimColor: '#8b4513',
      doorColor: '#5a3d2b',
      windowFrame: '#8b4513',
      railingColor: '#2d2d2d',
      pathwayColor: '#cd853f',
      fenceStyle: 'iron'
    },
    lighting: { warmth: 'warm', intensity: 0.9, fixtureStyle: 'traditional' }
  },
  
  Scandinavian: {
    exteriorWall: { color: '#fefefe', roughness: 0.4, metalness: 0, texture: 'wood' },
    interiorWall: { color: '#ffffff', roughness: 0.2, texture: 'paint' },
    floor: {
      primary: { color: '#d4bc94', material: 'wood' },
      bathroom: { color: '#f0f0f0', material: 'tile' },
      kitchen: { color: '#e8e8e8', material: 'tile' }
    },
    furniture: {
      primaryWood: '#d4bc94',
      secondaryWood: '#b8a078',
      upholstery: '#f5f5f5',
      accent: '#87ceeb',
      metal: '#1a1a1a'
    },
    decor: {
      curtainColor: '#ffffff',
      rugColor: '#e0e0e0',
      cushionPrimary: '#f5f5f5',
      cushionAccent: '#87ceeb',
      plantPot: '#ffffff',
      lampShade: '#ffffff',
      metalAccent: '#1a1a1a'
    },
    exterior: {
      roofColor: '#5a5a5a',
      roofMaterial: 'metal',
      trimColor: '#ffffff',
      doorColor: '#d4bc94',
      windowFrame: '#ffffff',
      railingColor: '#1a1a1a',
      pathwayColor: '#a0a0a0',
      fenceStyle: 'modern'
    },
    lighting: { warmth: 'neutral', intensity: 1.1, fixtureStyle: 'modern' }
  },
  
  Industrial: {
    exteriorWall: { color: '#a0a0a0', roughness: 0.8, metalness: 0.1, texture: 'concrete' },
    interiorWall: { color: '#b8b8b8', roughness: 0.7, texture: 'textured' },
    floor: {
      primary: { color: '#808080', material: 'concrete' },
      bathroom: { color: '#909090', material: 'tile' },
      kitchen: { color: '#707070', material: 'concrete' }
    },
    furniture: {
      primaryWood: '#3a3a3a',
      secondaryWood: '#5a4a3a',
      upholstery: '#4a4a4a',
      accent: '#ff6b35',
      metal: '#606060'
    },
    decor: {
      curtainColor: '#505050',
      rugColor: '#4a4a4a',
      cushionPrimary: '#606060',
      cushionAccent: '#ff6b35',
      plantPot: '#3a3a3a',
      lampShade: '#2d2d2d',
      metalAccent: '#606060'
    },
    exterior: {
      roofColor: '#4a4a4a',
      roofMaterial: 'metal',
      trimColor: '#3a3a3a',
      doorColor: '#2d2d2d',
      windowFrame: '#2d2d2d',
      railingColor: '#3a3a3a',
      pathwayColor: '#606060',
      fenceStyle: 'iron'
    },
    lighting: { warmth: 'warm', intensity: 0.8, fixtureStyle: 'industrial' }
  },
  
  Rustic: {
    exteriorWall: { color: '#d4a574', roughness: 0.8, metalness: 0, texture: 'wood' },
    interiorWall: { color: '#f5deb3', roughness: 0.7, texture: 'paneling' },
    floor: {
      primary: { color: '#6b4423', material: 'wood' },
      bathroom: { color: '#a67c52', material: 'tile' },
      kitchen: { color: '#8b6914', material: 'tile' }
    },
    furniture: {
      primaryWood: '#5a3d2b',
      secondaryWood: '#654321',
      upholstery: '#228b22',
      accent: '#8b4513',
      metal: '#8b6914'
    },
    decor: {
      curtainColor: '#8b6914',
      rugColor: '#654321',
      cushionPrimary: '#f5deb3',
      cushionAccent: '#228b22',
      plantPot: '#5a3d2b',
      lampShade: '#f5e6d3',
      metalAccent: '#8b6914'
    },
    exterior: {
      roofColor: '#654321',
      roofMaterial: 'shingle',
      trimColor: '#5a3d2b',
      doorColor: '#4a3020',
      windowFrame: '#5a3d2b',
      railingColor: '#654321',
      pathwayColor: '#8b6914',
      fenceStyle: 'rustic'
    },
    lighting: { warmth: 'warm', intensity: 0.75, fixtureStyle: 'rustic' }
  },
  
  Luxury: {
    exteriorWall: { color: '#f5f0e1', roughness: 0.4, metalness: 0, texture: 'stone' },
    interiorWall: { color: '#fffef5', roughness: 0.3, texture: 'wallpaper' },
    floor: {
      primary: { color: '#e8dcc8', material: 'marble' },
      bathroom: { color: '#f5f0e1', material: 'marble' },
      kitchen: { color: '#e0d5c5', material: 'marble' }
    },
    furniture: {
      primaryWood: '#2f1810',
      secondaryWood: '#4a3020',
      upholstery: '#1a1a2e',
      accent: '#c9a227',
      metal: '#c9a227'
    },
    decor: {
      curtainColor: '#1a1a2e',
      rugColor: '#2f1810',
      cushionPrimary: '#f5f0e1',
      cushionAccent: '#c9a227',
      plantPot: '#2f1810',
      lampShade: '#f5e6d3',
      metalAccent: '#c9a227'
    },
    exterior: {
      roofColor: '#2f1810',
      roofMaterial: 'slate',
      trimColor: '#c9a227',
      doorColor: '#2f1810',
      windowFrame: '#c9a227',
      railingColor: '#c9a227',
      pathwayColor: '#c0b090',
      fenceStyle: 'iron'
    },
    lighting: { warmth: 'warm', intensity: 0.9, fixtureStyle: 'traditional' }
  },
  
  Minimalist: {
    exteriorWall: { color: '#ffffff', roughness: 0.2, metalness: 0, texture: 'concrete' },
    interiorWall: { color: '#ffffff', roughness: 0.1, texture: 'paint' },
    floor: {
      primary: { color: '#d0d0d0', material: 'concrete' },
      bathroom: { color: '#e8e8e8', material: 'tile' },
      kitchen: { color: '#d8d8d8', material: 'tile' }
    },
    furniture: {
      primaryWood: '#1a1a1a',
      secondaryWood: '#2d2d2d',
      upholstery: '#ffffff',
      accent: '#000000',
      metal: '#c0c0c0'
    },
    decor: {
      curtainColor: '#ffffff',
      rugColor: '#e0e0e0',
      cushionPrimary: '#ffffff',
      cushionAccent: '#000000',
      plantPot: '#1a1a1a',
      lampShade: '#ffffff',
      metalAccent: '#c0c0c0'
    },
    exterior: {
      roofColor: '#1a1a1a',
      roofMaterial: 'metal',
      trimColor: '#000000',
      doorColor: '#1a1a1a',
      windowFrame: '#000000',
      railingColor: '#1a1a1a',
      pathwayColor: '#909090',
      fenceStyle: 'modern'
    },
    lighting: { warmth: 'cool', intensity: 1.0, fixtureStyle: 'modern' }
  },
  
  Colonial: {
    exteriorWall: { color: '#fff8f0', roughness: 0.5, metalness: 0, texture: 'wood' },
    interiorWall: { color: '#fffef8', roughness: 0.4, texture: 'paint' },
    floor: {
      primary: { color: '#8b6b52', material: 'wood' },
      bathroom: { color: '#d4c5b5', material: 'tile' },
      kitchen: { color: '#c4b5a5', material: 'tile' }
    },
    furniture: {
      primaryWood: '#654321',
      secondaryWood: '#8b4513',
      upholstery: '#800020',
      accent: '#1a1a4e',
      metal: '#c9a227'
    },
    decor: {
      curtainColor: '#800020',
      rugColor: '#1a1a4e',
      cushionPrimary: '#fff8f0',
      cushionAccent: '#800020',
      plantPot: '#654321',
      lampShade: '#fff8f0',
      metalAccent: '#c9a227'
    },
    exterior: {
      roofColor: '#556b2f',
      roofMaterial: 'shingle',
      trimColor: '#ffffff',
      doorColor: '#654321',
      windowFrame: '#ffffff',
      railingColor: '#1a1a1a',
      pathwayColor: '#8b6b52',
      fenceStyle: 'picket'
    },
    lighting: { warmth: 'warm', intensity: 0.8, fixtureStyle: 'traditional' }
  }
};

export function getStyleConfig(style: string): StyleConsistencyConfig {
  return styleConfigs[style] || styleConfigs.Modern;
}

export default styleConfigs;
