import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, useTexture, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Clock, RotateCw, Sun } from 'lucide-react';

// Import all floor plan set images
import set1Front from "@/assets/rendered-views/set1-front.jpg";
import set1Side from "@/assets/rendered-views/set1-side.jpg";
import set1Back from "@/assets/rendered-views/set1-back.jpg";
import set1Top from "@/assets/rendered-views/set1-top.jpg";

import set2Front from "@/assets/rendered-views/set2-front.png";
import set2Side from "@/assets/rendered-views/set2-side.png";
import set2Back from "@/assets/rendered-views/set2-back.png";
import set2Top from "@/assets/rendered-views/set2-top.png";

import set3Front from "@/assets/rendered-views/set3-front.jpg";
import set3Side from "@/assets/rendered-views/set3-side.jpg";
import set3Back from "@/assets/rendered-views/set3-back.jpg";
import set3Top from "@/assets/rendered-views/set3-top.png";

import set4Front from "@/assets/rendered-views/set4-front.jpg";
import set4Side from "@/assets/rendered-views/set4-side.jpg";
import set4Back from "@/assets/rendered-views/set4-back.jpg";
import set4Top from "@/assets/rendered-views/set4-top.png";

const IMAGE_SETS: { [key: number]: { front: string; side: string; back: string; top: string } } = {
  1: { front: set1Front, side: set1Side, back: set1Back, top: set1Top },
  2: { front: set2Front, side: set2Side, back: set2Back, top: set2Top },
  3: { front: set3Front, side: set3Side, back: set3Back, top: set3Top },
  4: { front: set4Front, side: set4Side, back: set4Back, top: set4Top },
};

interface PhotorealisticHouseModelProps {
  floorPlanSetId: number;
  style?: string;
}

// Keyboard controls for navigation
function KeyboardControls() {
  const { camera } = useThree();
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    const handleKeyUp = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const speed = 0.15;
    const direction = new THREE.Vector3();
    if (keys['w'] || keys['arrowup']) { camera.getWorldDirection(direction); camera.position.addScaledVector(direction, speed); }
    if (keys['s'] || keys['arrowdown']) { camera.getWorldDirection(direction); camera.position.addScaledVector(direction, -speed); }
    if (keys['a'] || keys['arrowleft']) { camera.getWorldDirection(direction); direction.cross(camera.up); camera.position.addScaledVector(direction, -speed); }
    if (keys['d'] || keys['arrowright']) { camera.getWorldDirection(direction); direction.cross(camera.up); camera.position.addScaledVector(direction, speed); }
  });

  return null;
}

// PBR Stucco Wall Material
function useStuccoMaterial() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base cream/taupe color
    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(0, 0, 512, 512);
    
    // Stucco texture - larger bumps
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 3 + Math.random() * 8;
      const brightness = Math.random() * 0.08;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${brightness})`;
      ctx.fill();
    }
    
    // Shadow variations
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 2 + Math.random() * 5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(120,100,80,0.08)';
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    
    return {
      map: texture,
      roughness: 0.85,
      metalness: 0.02,
    };
  }, []);
}

// PBR Concrete/Paver Material
function usePaverMaterial() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base gray
    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(0, 0, 512, 512);
    
    // Grid pattern for pavers
    const paverSize = 64;
    ctx.strokeStyle = 'rgba(60,60,60,0.4)';
    ctx.lineWidth = 4;
    
    for (let x = 0; x <= 512; x += paverSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += paverSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
    
    // Color variation per paver
    for (let px = 0; px < 8; px++) {
      for (let py = 0; py < 8; py++) {
        const brightness = 0.9 + Math.random() * 0.2;
        ctx.fillStyle = `rgba(${Math.floor(brightness * 140)},${Math.floor(brightness * 140)},${Math.floor(brightness * 140)},0.3)`;
        ctx.fillRect(px * paverSize + 3, py * paverSize + 3, paverSize - 6, paverSize - 6);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    
    return {
      map: texture,
      roughness: 0.9,
      metalness: 0.05,
    };
  }, []);
}

// PBR Glass Material
function useGlassMaterial() {
  return useMemo(() => ({
    color: '#a8d4e6',
    transparent: true,
    opacity: 0.35,
    metalness: 0.9,
    roughness: 0.05,
    envMapIntensity: 1.5,
  }), []);
}

// PBR Metal Railing Material
function useMetalRailingMaterial() {
  return useMemo(() => ({
    color: '#1a1a1a',
    metalness: 0.7,
    roughness: 0.3,
  }), []);
}

// Pine Tree with detailed geometry
function DetailedPineTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const trunkHeight = 2.5 * scale;
  
  return (
    <group position={position}>
      {/* Detailed trunk with bark texture */}
      <mesh position={[0, trunkHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15 * scale, 0.25 * scale, trunkHeight, 12]} />
        <meshStandardMaterial color="#4a3020" roughness={0.95} metalness={0.02} />
      </mesh>
      
      {/* Multiple cone layers for realistic pine */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, trunkHeight + 0.8 * scale + i * 0.9 * scale, 0]} castShadow receiveShadow>
          <coneGeometry args={[(1.5 - i * 0.3) * scale, 1.8 * scale, 12]} />
          <meshStandardMaterial 
            color={`hsl(120, ${45 + i * 5}%, ${18 + i * 4}%)`} 
            roughness={0.85} 
            metalness={0.02}
          />
        </mesh>
      ))}
    </group>
  );
}

// Realistic Bush
function DetailedBush({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position}>
      {/* Multiple overlapping spheres for organic shape */}
      {[
        [0, 0.4, 0, 0.6],
        [0.3, 0.35, 0.2, 0.45],
        [-0.25, 0.3, -0.15, 0.4],
        [0.15, 0.5, -0.2, 0.35],
        [-0.2, 0.45, 0.25, 0.38],
      ].map(([x, y, z, r], i) => (
        <mesh 
          key={i} 
          position={[x * scale, y * scale, z * scale]} 
          castShadow 
          receiveShadow
        >
          <sphereGeometry args={[r * scale, 12, 12]} />
          <meshStandardMaterial 
            color={`hsl(${115 + i * 3}, ${50 + i * 5}%, ${25 + i * 3}%)`}
            roughness={0.9}
            metalness={0.02}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main photorealistic house component
function PhotorealisticHouse({ 
  imageSet, 
  timeOfDay 
}: { 
  imageSet: { front: string; side: string; back: string; top: string };
  timeOfDay: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  
  const stuccoMaterial = useStuccoMaterial();
  const paverMaterial = usePaverMaterial();
  const glassMaterial = useGlassMaterial();
  const metalMaterial = useMetalRailingMaterial();
  
  // Load textures
  const frontTexture = useLoader(THREE.TextureLoader, imageSet.front);
  const sideTexture = useLoader(THREE.TextureLoader, imageSet.side);
  const backTexture = useLoader(THREE.TextureLoader, imageSet.back);
  const topTexture = useLoader(THREE.TextureLoader, imageSet.top);

  useFrame(() => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  useEffect(() => {
    const handleInteraction = () => setAutoRotate(false);
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Calculate sun position based on time (12:00 PM = directly overhead)
  const sunPosition = useMemo(() => {
    const hour = timeOfDay;
    const angle = ((hour - 6) / 12) * Math.PI; // 6AM to 6PM arc
    const height = Math.sin(angle) * 50;
    const distance = Math.cos(angle) * 30;
    return [distance, Math.max(height, 5), 20] as [number, number, number];
  }, [timeOfDay]);

  const sunIntensity = useMemo(() => {
    if (timeOfDay < 6 || timeOfDay > 20) return 0.1;
    if (timeOfDay < 8 || timeOfDay > 18) return 0.6;
    if (timeOfDay >= 11 && timeOfDay <= 14) return 2.5; // Peak midday intensity
    return 1.5;
  }, [timeOfDay]);

  const ambientIntensity = useMemo(() => {
    if (timeOfDay < 6 || timeOfDay > 20) return 0.15;
    if (timeOfDay >= 11 && timeOfDay <= 14) return 0.8; // Bright midday ambient
    return 0.5;
  }, [timeOfDay]);

  // House dimensions
  const houseWidth = 18;
  const houseHeight = 11;
  const houseDepth = 14;

  return (
    <group ref={groupRef}>
      {/* Dynamic Sky based on time */}
      <Sky 
        distance={450000}
        sunPosition={sunPosition}
        inclination={0.5}
        azimuth={0.25}
        rayleigh={timeOfDay >= 11 && timeOfDay <= 14 ? 0.5 : 2}
      />

      {/* Ground - realistic grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#3d6b35" roughness={0.95} metalness={0.02} />
      </mesh>

      {/* Lawn immediately around house */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#4a8040" roughness={0.9} metalness={0.02} />
      </mesh>

      {/* PBR Lighting Setup for 12:00 PM Midday */}
      <ambientLight intensity={ambientIntensity} color="#fffbe6" />
      
      {/* Main directional sun light - sharp shadows for midday */}
      <directionalLight 
        position={sunPosition}
        intensity={sunIntensity}
        color="#fffdf5"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light for softer shadows */}
      <directionalLight 
        position={[-sunPosition[0], sunPosition[1] * 0.5, -sunPosition[2]]}
        intensity={sunIntensity * 0.15}
        color="#b4d7ff"
      />
      
      {/* Hemisphere light for realistic sky-ground ambient */}
      <hemisphereLight 
        color="#87ceeb" 
        groundColor="#3d5a35" 
        intensity={0.4} 
      />

      {/* Contact shadows for realism */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.6}
        scale={80}
        blur={2}
        far={50}
        resolution={512}
        color="#2a3a25"
      />

      {/* House structure with textured faces */}
      <group position={[0, houseHeight / 2 + 0.5, 0]}>
        {/* Front face with rendered image */}
        <mesh position={[0, 0, houseDepth / 2]} castShadow receiveShadow>
          <planeGeometry args={[houseWidth, houseHeight]} />
          <meshStandardMaterial 
            map={frontTexture} 
            side={THREE.DoubleSide}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>

        {/* Back face */}
        <mesh position={[0, 0, -houseDepth / 2]} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
          <planeGeometry args={[houseWidth, houseHeight]} />
          <meshStandardMaterial 
            map={backTexture} 
            side={THREE.DoubleSide}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>

        {/* Right side */}
        <mesh position={[houseWidth / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <planeGeometry args={[houseDepth, houseHeight]} />
          <meshStandardMaterial 
            map={sideTexture} 
            side={THREE.DoubleSide}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>

        {/* Left side (mirrored) */}
        <mesh position={[-houseWidth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow>
          <planeGeometry args={[houseDepth, houseHeight]} />
          <meshStandardMaterial 
            map={sideTexture} 
            side={THREE.DoubleSide}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>

        {/* Top face (roof) with rendered image */}
        <mesh position={[0, houseHeight / 2 + 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <planeGeometry args={[houseWidth + 2, houseDepth + 2]} />
          <meshStandardMaterial 
            map={topTexture} 
            side={THREE.DoubleSide}
            roughness={0.6}
            metalness={0.05}
          />
        </mesh>

        {/* Floor */}
        <mesh position={[0, -houseHeight / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[houseWidth, houseDepth]} />
          <meshStandardMaterial color="#6b5545" roughness={0.8} />
        </mesh>
      </group>

      {/* Balcony railings with PBR metal material */}
      <group position={[0, houseHeight * 0.6, houseDepth / 2 + 0.3]}>
        {/* Horizontal rails */}
        <mesh castShadow>
          <boxGeometry args={[houseWidth * 0.4, 0.04, 0.04]} />
          <meshStandardMaterial {...metalMaterial} />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[houseWidth * 0.4, 0.04, 0.04]} />
          <meshStandardMaterial {...metalMaterial} />
        </mesh>
        {/* Vertical posts */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh 
            key={i} 
            position={[(i - 3.5) * (houseWidth * 0.4 / 7), 0.25, 0]} 
            castShadow
          >
            <boxGeometry args={[0.03, 0.5, 0.03]} />
            <meshStandardMaterial {...metalMaterial} />
          </mesh>
        ))}
      </group>

      {/* Patio/walkway with PBR paver material */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, houseDepth / 2 + 3]} receiveShadow>
        <planeGeometry args={[houseWidth * 0.6, 6]} />
        <meshStandardMaterial {...paverMaterial} />
      </mesh>

      {/* Driveway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, houseDepth / 2 + 15]} receiveShadow>
        <planeGeometry args={[4, 25]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.95} metalness={0.02} />
      </mesh>

      {/* Detailed pine trees */}
      {[
        [-18, 0, -12, 1.3],
        [18, 0, -12, 1.5],
        [-22, 0, 5, 1.2],
        [22, 0, 5, 1.4],
        [-15, 0, 15, 1.1],
        [15, 0, 18, 1.6],
        [-25, 0, -5, 1.0],
        [25, 0, -8, 1.3],
      ].map(([x, y, z, scale], i) => (
        <DetailedPineTree key={i} position={[x, y, z]} scale={scale} />
      ))}

      {/* Detailed bushes */}
      {[
        [-houseWidth / 2 - 2, 0, houseDepth / 2 + 1, 1.3],
        [houseWidth / 2 + 2, 0, houseDepth / 2 + 1, 1.1],
        [-houseWidth / 2 - 1.5, 0, 0, 1.0],
        [houseWidth / 2 + 1.5, 0, 0, 1.2],
        [-3, 0, houseDepth / 2 + 2, 0.8],
        [3, 0, houseDepth / 2 + 2, 0.9],
      ].map(([x, y, z, scale], i) => (
        <DetailedBush key={i} position={[x, y, z]} scale={scale} />
      ))}

      {/* Porch lights */}
      {timeOfDay < 7 || timeOfDay > 18 ? (
        <>
          <pointLight position={[-houseWidth / 4, 3, houseDepth / 2 + 0.5]} intensity={0.8} color="#ffcc77" distance={8} />
          <pointLight position={[houseWidth / 4, 3, houseDepth / 2 + 0.5]} intensity={0.8} color="#ffcc77" distance={8} />
        </>
      ) : null}
    </group>
  );
}

export default function PhotorealisticHouseModel({ floorPlanSetId, style = "Modern" }: PhotorealisticHouseModelProps) {
  const [currentTime, setCurrentTime] = useState(12); // Default to midday
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true);
  
  const imageSet = IMAGE_SETS[floorPlanSetId] || IMAGE_SETS[1];

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getTimeLabel = (time: number) => {
    if (time >= 11 && time <= 14) return "☀️ Midday";
    if (time >= 6 && time < 11) return "🌅 Morning";
    if (time > 14 && time <= 18) return "🌇 Afternoon";
    if (time > 18 && time <= 20) return "🌆 Evening";
    return "🌙 Night";
  };

  return (
    <div className="w-full h-[650px] relative rounded-lg overflow-hidden bg-gradient-to-b from-sky-200 to-green-100">
      {/* Enhanced Controls UI */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 justify-between">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg flex items-center gap-3 min-w-[280px]">
          <Sun className="w-5 h-5 text-amber-500" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{formatTime(currentTime)}</span>
            <span className="text-xs text-muted-foreground">{getTimeLabel(currentTime)}</span>
          </div>
          <Slider 
            value={[currentTime]} 
            min={0} 
            max={24} 
            step={0.5} 
            onValueChange={(val) => setCurrentTime(val[0])} 
            className="w-36" 
          />
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setAutoRotateEnabled(!autoRotateEnabled)}
          className="bg-white/95 backdrop-blur-sm shadow-lg"
        >
          <RotateCw className={`w-4 h-4 mr-2 ${autoRotateEnabled ? 'animate-spin' : ''}`} />
          {autoRotateEnabled ? 'Stop Rotation' : 'Auto Rotate'}
        </Button>
      </div>

      {/* 3D Canvas with enhanced settings */}
      <Canvas 
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <PerspectiveCamera makeDefault position={[30, 22, 35]} fov={45} />
        <OrbitControls 
          enablePan 
          enableZoom 
          enableRotate 
          minDistance={12} 
          maxDistance={100} 
          maxPolarAngle={Math.PI / 2.05}
          autoRotate={autoRotateEnabled}
          autoRotateSpeed={0.8}
          enableDamping
          dampingFactor={0.05}
        />
        <KeyboardControls />
        <PhotorealisticHouse imageSet={imageSet} timeOfDay={currentTime} />
      </Canvas>

      {/* Controls Help */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs max-w-[220px]">
        <p className="font-semibold mb-1">Controls:</p>
        <p>🖱️ <strong>Drag</strong>: Rotate | <strong>Right-drag</strong>: Pan</p>
        <p>🔄 <strong>Scroll</strong>: Zoom in/out</p>
        <p>⌨️ <strong>WASD/Arrows</strong>: Navigate</p>
        <p className="mt-1 pt-1 border-t border-border/50 text-muted-foreground">
          PBR Materials | Dynamic Shadows
        </p>
      </div>

      {/* Style Badge */}
      <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
        {style} Style | Set {floorPlanSetId}
      </div>

      {/* Lighting info */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-xs">
        <span className="font-medium">🔆 PBR Lighting:</span> {currentTime >= 11 && currentTime <= 14 ? 'Peak Midday' : 'Dynamic'}
      </div>
    </div>
  );
}
