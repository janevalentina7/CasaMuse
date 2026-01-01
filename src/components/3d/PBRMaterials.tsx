import { useMemo } from 'react';
import * as THREE from 'three';

// PBR Material factory for realistic rendering
export function usePBRMaterial(options: {
  color: string;
  roughness?: number;
  metalness?: number;
  type?: 'wall' | 'floor' | 'glass' | 'wood' | 'metal' | 'concrete' | 'roof';
}) {
  return useMemo(() => {
    const { color, roughness = 0.5, metalness = 0, type = 'wall' } = options;
    
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness,
      metalness,
      envMapIntensity: 1,
    });

    // Adjust properties based on type
    switch (type) {
      case 'glass':
        material.transparent = true;
        material.opacity = 0.3;
        material.roughness = 0.05;
        material.metalness = 0.9;
        break;
      case 'metal':
        material.roughness = 0.2;
        material.metalness = 0.8;
        break;
      case 'wood':
        material.roughness = 0.7;
        material.metalness = 0;
        break;
      case 'concrete':
        material.roughness = 0.9;
        material.metalness = 0;
        break;
      case 'roof':
        material.roughness = 0.8;
        material.metalness = 0.1;
        break;
    }

    return material;
  }, [options.color, options.roughness, options.metalness, options.type]);
}

// Generate procedural stucco texture
export function useStuccoWallTexture(color: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add stucco texture bumps
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 1 + Math.random() * 3;
      const brightness = Math.random() * 0.08;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${brightness})`;
      ctx.fill();
    }
    
    // Shadow details
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 0.5 + Math.random() * 2;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, [color]);
}

// Generate roof tile texture
export function useRoofTileTexture(color: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    
    // Tile pattern
    const tileHeight = 20;
    const tileWidth = 40;
    
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    
    for (let row = 0; row < 256 / tileHeight; row++) {
      const offset = row % 2 === 0 ? 0 : tileWidth / 2;
      
      for (let col = -1; col < 256 / tileWidth + 1; col++) {
        const x = col * tileWidth + offset;
        const y = row * tileHeight;
        
        // Draw curved tile shape
        ctx.beginPath();
        ctx.moveTo(x, y + tileHeight);
        ctx.quadraticCurveTo(x + tileWidth / 2, y + tileHeight - 5, x + tileWidth, y + tileHeight);
        ctx.stroke();
        
        // Add slight variation
        const shade = Math.random() * 0.05;
        ctx.fillStyle = `rgba(${shade > 0.025 ? '255,255,255' : '0,0,0'},${Math.abs(shade - 0.025)})`;
        ctx.fillRect(x, y, tileWidth, tileHeight);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
  }, [color]);
}

// Generate stone paver texture for walkways
export function useStonePaverTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Base gray
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(0, 0, 256, 256);
    
    // Stone pattern
    const stoneSize = 40;
    const gap = 3;
    
    for (let row = 0; row < 256 / stoneSize; row++) {
      for (let col = 0; col < 256 / stoneSize; col++) {
        const x = col * stoneSize + gap;
        const y = row * stoneSize + gap;
        const w = stoneSize - gap * 2;
        const h = stoneSize - gap * 2;
        
        // Random stone color variation
        const shade = 140 + Math.random() * 40;
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade - 10})`;
        
        // Slightly irregular stone shape
        ctx.beginPath();
        ctx.moveTo(x + 2, y);
        ctx.lineTo(x + w - 2, y);
        ctx.lineTo(x + w, y + 2);
        ctx.lineTo(x + w, y + h - 2);
        ctx.lineTo(x + w - 2, y + h);
        ctx.lineTo(x + 2, y + h);
        ctx.lineTo(x, y + h - 2);
        ctx.lineTo(x, y + 2);
        ctx.closePath();
        ctx.fill();
        
        // Gap shadow
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }, []);
}

// Generate grass texture
export function useGrassTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Base grass green
    ctx.fillStyle = '#4a7c4a';
    ctx.fillRect(0, 0, 256, 256);
    
    // Grass blades
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const height = 3 + Math.random() * 8;
      const angle = (Math.random() - 0.5) * 0.5;
      
      const shade = 50 + Math.random() * 80;
      ctx.strokeStyle = `rgb(${shade * 0.5}, ${shade + 50}, ${shade * 0.3})`;
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + angle * height, y - height);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);
    return texture;
  }, []);
}

// Environment lighting setup for PBR
export function useEnvironmentLighting(timeOfDay: number) {
  const sunPosition = useMemo(() => {
    // Calculate sun position based on time of day
    const hour = timeOfDay;
    const angle = ((hour - 6) / 12) * Math.PI; // Sun rises at 6, sets at 18
    const height = Math.sin(angle);
    const horizontal = Math.cos(angle);
    
    return new THREE.Vector3(horizontal * 50, Math.max(height * 40, 5), 30);
  }, [timeOfDay]);

  const lightColor = useMemo(() => {
    if (timeOfDay < 6 || timeOfDay > 20) return '#1a237e'; // Night blue
    if (timeOfDay < 8 || timeOfDay > 18) return '#ff9a5f'; // Sunrise/sunset
    return '#ffffff'; // Daylight
  }, [timeOfDay]);

  const lightIntensity = useMemo(() => {
    if (timeOfDay < 6 || timeOfDay > 20) return 0.3;
    if (timeOfDay < 8 || timeOfDay > 18) return 1.5;
    return 2.5;
  }, [timeOfDay]);

  return { sunPosition, lightColor, lightIntensity };
}
