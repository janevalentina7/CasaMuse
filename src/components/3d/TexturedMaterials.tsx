import { useMemo } from 'react';
import * as THREE from 'three';

// Style-specific material configurations
export interface StyleMaterials {
  wallColor: string;
  wallTexture: 'paint' | 'wallpaper' | 'stucco' | 'brick' | 'concrete';
  floorType: 'wood' | 'tile' | 'marble' | 'carpet' | 'concrete';
  floorColor: string;
  ceilingColor: string;
  trimColor: string;
  accentColor: string;
  roofColor: string;
}

export const getStyleMaterials = (style: string): StyleMaterials => {
  const styles: Record<string, StyleMaterials> = {
    Modern: {
      wallColor: '#f8f8f8',
      wallTexture: 'paint',
      floorType: 'wood',
      floorColor: '#b8956b',
      ceilingColor: '#ffffff',
      trimColor: '#333333',
      accentColor: '#4a90a4',
      roofColor: '#2c2c2c'
    },
    Contemporary: {
      wallColor: '#efefef',
      wallTexture: 'paint',
      floorType: 'tile',
      floorColor: '#c4b8a8',
      ceilingColor: '#ffffff',
      trimColor: '#505050',
      accentColor: '#6b8e23',
      roofColor: '#404040'
    },
    Traditional: {
      wallColor: '#faf5e8',
      wallTexture: 'wallpaper',
      floorType: 'wood',
      floorColor: '#a67c52',
      ceilingColor: '#fff8f0',
      trimColor: '#8b4513',
      accentColor: '#8b0000',
      roofColor: '#8b4513'
    },
    Minimalist: {
      wallColor: '#ffffff',
      wallTexture: 'paint',
      floorType: 'concrete',
      floorColor: '#d0d0d0',
      ceilingColor: '#ffffff',
      trimColor: '#1a1a1a',
      accentColor: '#000000',
      roofColor: '#1a1a1a'
    },
    Luxury: {
      wallColor: '#f5f0e1',
      wallTexture: 'wallpaper',
      floorType: 'marble',
      floorColor: '#e8dcc8',
      ceilingColor: '#fffef5',
      trimColor: '#2f1810',
      accentColor: '#c9a227',
      roofColor: '#2f1810'
    },
    Scandinavian: {
      wallColor: '#fefefe',
      wallTexture: 'paint',
      floorType: 'wood',
      floorColor: '#d4bc94',
      ceilingColor: '#ffffff',
      trimColor: '#6a6a6a',
      accentColor: '#87ceeb',
      roofColor: '#5a5a5a'
    },
    Industrial: {
      wallColor: '#b8b8b8',
      wallTexture: 'concrete',
      floorType: 'concrete',
      floorColor: '#808080',
      ceilingColor: '#a0a0a0',
      trimColor: '#3a3a3a',
      accentColor: '#ff6b35',
      roofColor: '#4a4a4a'
    },
    Colonial: {
      wallColor: '#fff8f0',
      wallTexture: 'paint',
      floorType: 'wood',
      floorColor: '#8b6b52',
      ceilingColor: '#fffef8',
      trimColor: '#8b4513',
      accentColor: '#800020',
      roofColor: '#556b2f'
    },
    Mediterranean: {
      wallColor: '#fff8dc',
      wallTexture: 'stucco',
      floorType: 'tile',
      floorColor: '#cd853f',
      ceilingColor: '#fffef0',
      trimColor: '#8b4513',
      accentColor: '#4682b4',
      roofColor: '#b22222'
    },
    Rustic: {
      wallColor: '#f5deb3',
      wallTexture: 'paint',
      floorType: 'wood',
      floorColor: '#6b4423',
      ceilingColor: '#f5e6d3',
      trimColor: '#654321',
      accentColor: '#228b22',
      roofColor: '#654321'
    }
  };
  
  return styles[style] || styles.Modern;
};

// Create wood floor texture
export function useWoodFloorTexture(color: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Base wood color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    
    // Wood planks
    const plankHeight = 32;
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    
    for (let y = 0; y < 256; y += plankHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    
    // Wood grain lines
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 50; i++) {
      const y = Math.random() * 256;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        64, y + (Math.random() - 0.5) * 10,
        192, y + (Math.random() - 0.5) * 10,
        256, y
      );
      ctx.stroke();
    }
    
    // Knots
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = 3 + Math.random() * 5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(60,40,20,0.3)';
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, [color]);
}

// Create tile floor texture
export function useTileFloorTexture(color: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    
    // Tile grid
    const tileSize = 64;
    ctx.strokeStyle = 'rgba(100,100,100,0.4)';
    ctx.lineWidth = 3;
    
    for (let x = 0; x <= 256; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    
    // Tile variation
    for (let tx = 0; tx < 4; tx++) {
      for (let ty = 0; ty < 4; ty++) {
        const brightness = 0.95 + Math.random() * 0.1;
        ctx.fillStyle = `rgba(255,255,255,${(brightness - 1) * 0.5})`;
        ctx.fillRect(tx * tileSize + 2, ty * tileSize + 2, tileSize - 4, tileSize - 4);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }, [color]);
}

// Create marble floor texture
export function useMarbleFloorTexture(color: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base marble color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 512);
    
    // Marble veins
    ctx.strokeStyle = 'rgba(150,140,130,0.3)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = Math.random() * 512;
      ctx.moveTo(x, y);
      
      for (let j = 0; j < 10; j++) {
        x += (Math.random() - 0.5) * 100;
        y += (Math.random() - 0.5) * 100;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    // Lighter veins
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = Math.random() * 512;
      ctx.moveTo(x, y);
      
      for (let j = 0; j < 8; j++) {
        x += (Math.random() - 0.5) * 80;
        y += (Math.random() - 0.5) * 80;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }, [color]);
}

// Create carpet texture
export function useCarpetTexture(color: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    // Base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 128, 128);
    
    // Carpet texture (small dots)
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const brightness = Math.random() * 0.2 - 0.1;
      ctx.fillStyle = brightness > 0 
        ? `rgba(255,255,255,${brightness})` 
        : `rgba(0,0,0,${-brightness})`;
      ctx.fillRect(x, y, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
  }, [color]);
}

// Create concrete texture
export function useConcreteTexture(color: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    
    // Noise texture
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = Math.random() * 3;
      const brightness = Math.random() * 0.15 - 0.075;
      ctx.fillStyle = brightness > 0 
        ? `rgba(255,255,255,${brightness})` 
        : `rgba(0,0,0,${-brightness})`;
      ctx.fillRect(x, y, size, size);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, [color]);
}

// Create wall paint texture
export function useWallPaintTexture(color: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    // Base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 128, 128);
    
    // Subtle paint texture
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const brightness = Math.random() * 0.03 - 0.015;
      ctx.fillStyle = brightness > 0 
        ? `rgba(255,255,255,${brightness})` 
        : `rgba(0,0,0,${-brightness})`;
      ctx.fillRect(x, y, 3, 3);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, [color]);
}

// Create wallpaper texture with pattern
export function useWallpaperTexture(color: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    // Base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 128, 128);
    
    // Damask-style pattern
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    const patternSize = 32;
    
    for (let px = 0; px < 4; px++) {
      for (let py = 0; py < 4; py++) {
        const cx = px * patternSize + patternSize / 2;
        const cy = py * patternSize + patternSize / 2;
        
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx + 8, cy);
        ctx.lineTo(cx, cy + 10);
        ctx.lineTo(cx - 8, cy);
        ctx.closePath();
        ctx.fill();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
  }, [color]);
}

// Create stucco texture
export function useStuccoTexture(color: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    
    // Stucco bumps
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = 2 + Math.random() * 4;
      const brightness = Math.random() * 0.1;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${brightness})`;
      ctx.fill();
    }
    
    // Shadow bumps
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = 1 + Math.random() * 3;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }, [color]);
}

// Hook to get floor texture based on type
export function useFloorTexture(floorType: string, color: string) {
  const woodTexture = useWoodFloorTexture(color);
  const tileTexture = useTileFloorTexture(color);
  const marbleTexture = useMarbleFloorTexture(color);
  const carpetTexture = useCarpetTexture(color);
  const concreteTexture = useConcreteTexture(color);
  
  return useMemo(() => {
    switch (floorType) {
      case 'wood': return woodTexture;
      case 'tile': return tileTexture;
      case 'marble': return marbleTexture;
      case 'carpet': return carpetTexture;
      case 'concrete': return concreteTexture;
      default: return woodTexture;
    }
  }, [floorType, woodTexture, tileTexture, marbleTexture, carpetTexture, concreteTexture]);
}

// Hook to get wall texture based on type
export function useWallTexture(wallTexture: string, color: string) {
  const paintTexture = useWallPaintTexture(color);
  const wallpaperTexture = useWallpaperTexture(color);
  const stuccoTexture = useStuccoTexture(color);
  const concreteTexture = useConcreteTexture(color);
  
  return useMemo(() => {
    switch (wallTexture) {
      case 'paint': return paintTexture;
      case 'wallpaper': return wallpaperTexture;
      case 'stucco': return stuccoTexture;
      case 'concrete': return concreteTexture;
      case 'brick': return concreteTexture; // Could add brick texture
      default: return paintTexture;
    }
  }, [wallTexture, paintTexture, wallpaperTexture, stuccoTexture, concreteTexture]);
}
