import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Plane, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Clock, RotateCw } from 'lucide-react';

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

// Image sets mapped by floor plan set ID
const IMAGE_SETS: { [key: number]: { front: string; side: string; back: string; top: string } } = {
  1: { front: set1Front, side: set1Side, back: set1Back, top: set1Top },
  2: { front: set2Front, side: set2Side, back: set2Back, top: set2Top },
  3: { front: set3Front, side: set3Side, back: set3Back, top: set3Top },
  4: { front: set4Front, side: set4Side, back: set4Back, top: set4Top },
};

interface TexturedHouseModelProps {
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

// Auto-rotating house component
function AutoRotatingHouse({ autoRotate }: { autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return <group ref={groupRef} />;
}

// Textured house using rendered view images
function TexturedHouse({ imageSet, timeOfDay }: { 
  imageSet: { front: string; side: string; back: string; top: string };
  timeOfDay: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  
  // Load textures
  const frontTexture = useLoader(THREE.TextureLoader, imageSet.front);
  const sideTexture = useLoader(THREE.TextureLoader, imageSet.side);
  const backTexture = useLoader(THREE.TextureLoader, imageSet.back);
  const topTexture = useLoader(THREE.TextureLoader, imageSet.top);

  useEffect(() => {
    if (frontTexture && sideTexture && backTexture && topTexture) {
      setTexturesLoaded(true);
    }
  }, [frontTexture, sideTexture, backTexture, topTexture]);

  useFrame(() => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  // Stop auto-rotate when user interacts
  useEffect(() => {
    const handleInteraction = () => setAutoRotate(false);
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const getSkyColor = (time: number) => {
    if (time < 6 || time > 20) return "#0a1628";
    if (time < 8 || time > 18) return "#ff9a5f";
    return "#87ceeb";
  };

  const getAmbientIntensity = (time: number) => {
    if (time < 6 || time > 20) return 0.3;
    if (time < 8 || time > 18) return 0.6;
    return 1.0;
  };

  // House dimensions (in 3D units)
  const houseWidth = 16;
  const houseHeight = 10;
  const houseDepth = 12;

  return (
    <group ref={groupRef}>
      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[100, 32, 32]} />
        <meshBasicMaterial color={getSkyColor(timeOfDay)} side={THREE.BackSide} />
      </mesh>

      {/* Ground */}
      <Plane args={[200, 200]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <meshStandardMaterial color="#4a7c59" />
      </Plane>

      {/* Grass around house */}
      <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#5a9f5a" />
      </Plane>

      {/* Lighting */}
      <ambientLight intensity={getAmbientIntensity(timeOfDay)} />
      <directionalLight 
        position={[25, 35, 25]} 
        intensity={timeOfDay > 6 && timeOfDay < 20 ? 2.0 : 0.3} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <hemisphereLight color="#87ceeb" groundColor="#3d6b4a" intensity={0.5} />

      {/* House structure with textured faces */}
      <group position={[0, houseHeight / 2 + 0.5, 0]}>
        {/* Front face */}
        <mesh position={[0, 0, houseDepth / 2]} castShadow receiveShadow>
          <planeGeometry args={[houseWidth, houseHeight]} />
          <meshStandardMaterial map={frontTexture} side={THREE.DoubleSide} />
        </mesh>

        {/* Back face */}
        <mesh position={[0, 0, -houseDepth / 2]} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
          <planeGeometry args={[houseWidth, houseHeight]} />
          <meshStandardMaterial map={backTexture} side={THREE.DoubleSide} />
        </mesh>

        {/* Right side */}
        <mesh position={[houseWidth / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <planeGeometry args={[houseDepth, houseHeight]} />
          <meshStandardMaterial map={sideTexture} side={THREE.DoubleSide} />
        </mesh>

        {/* Left side (mirrored) */}
        <mesh position={[-houseWidth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow>
          <planeGeometry args={[houseDepth, houseHeight]} />
          <meshStandardMaterial map={sideTexture} side={THREE.DoubleSide} />
        </mesh>

        {/* Top face (roof) */}
        <mesh position={[0, houseHeight / 2 + 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <planeGeometry args={[houseWidth + 2, houseDepth + 2]} />
          <meshStandardMaterial map={topTexture} side={THREE.DoubleSide} />
        </mesh>

        {/* Bottom face (floor) */}
        <mesh position={[0, -houseHeight / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[houseWidth, houseDepth]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>
      </group>

      {/* Driveway */}
      <Plane args={[4, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, houseDepth / 2 + 12]}>
        <meshStandardMaterial color="#6b6b6b" roughness={0.9} />
      </Plane>

      {/* Trees */}
      {[[-15, 8], [15, 8], [-15, -8], [15, -8], [-20, 0], [20, 0]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Trunk */}
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.5, 4, 8]} />
            <meshStandardMaterial color="#5a4a3a" />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 5.5, 0]} castShadow>
            <coneGeometry args={[2.5, 5, 8]} />
            <meshStandardMaterial color="#2d5a27" />
          </mesh>
        </group>
      ))}

      {/* Bushes */}
      {[[-8, houseDepth / 2 + 2], [8, houseDepth / 2 + 2], [-6, houseDepth / 2 + 2], [6, houseDepth / 2 + 2]].map(([x, z], i) => (
        <mesh key={`bush-${i}`} position={[x, 0.6, z]} castShadow>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#3a6b35" />
        </mesh>
      ))}
    </group>
  );
}

export default function TexturedHouseModel({ floorPlanSetId, style = "Modern" }: TexturedHouseModelProps) {
  const [currentTime, setCurrentTime] = useState(12);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true);
  
  const imageSet = IMAGE_SETS[floorPlanSetId] || IMAGE_SETS[1];

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="w-full h-[600px] relative rounded-lg overflow-hidden bg-gradient-to-b from-sky-100 to-green-100">
      {/* Controls UI */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 justify-between">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg flex items-center gap-3 min-w-[200px]">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium">Time: {formatTime(currentTime)}</span>
          <Slider 
            value={[currentTime]} 
            min={0} 
            max={24} 
            step={0.5} 
            onValueChange={(val) => setCurrentTime(val[0])} 
            className="w-32" 
          />
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setAutoRotateEnabled(!autoRotateEnabled)}
          className="bg-white/90 backdrop-blur-sm"
        >
          <RotateCw className={`w-4 h-4 mr-2 ${autoRotateEnabled ? 'animate-spin' : ''}`} />
          {autoRotateEnabled ? 'Stop Rotation' : 'Auto Rotate'}
        </Button>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[25, 20, 30]} fov={50} />
        <OrbitControls 
          enablePan 
          enableZoom 
          enableRotate 
          minDistance={10} 
          maxDistance={80} 
          maxPolarAngle={Math.PI / 2.1}
          autoRotate={autoRotateEnabled}
          autoRotateSpeed={1}
        />
        <KeyboardControls />
        <TexturedHouse imageSet={imageSet} timeOfDay={currentTime} />
      </Canvas>

      {/* Controls Help */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs max-w-[200px]">
        <p className="font-semibold mb-1">Controls:</p>
        <p>🖱️ <strong>Drag</strong>: Rotate | <strong>Right-drag</strong>: Pan</p>
        <p>🔄 <strong>Scroll</strong>: Zoom</p>
        <p>⌨️ <strong>WASD/Arrows</strong>: Navigate</p>
      </div>

      {/* Style Badge */}
      <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">
        {style} Style - Set {floorPlanSetId}
      </div>
    </div>
  );
}