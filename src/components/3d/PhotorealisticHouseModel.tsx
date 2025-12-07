import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, Box, Plane, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Clock, RotateCw, Sun, Download, Eye, EyeOff } from 'lucide-react';
import { GLTFExporter } from 'three-stdlib';
import { toast } from 'sonner';

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
    const speed = 0.2;
    const direction = new THREE.Vector3();
    if (keys['w'] || keys['arrowup']) { camera.getWorldDirection(direction); camera.position.addScaledVector(direction, speed); }
    if (keys['s'] || keys['arrowdown']) { camera.getWorldDirection(direction); camera.position.addScaledVector(direction, -speed); }
    if (keys['a'] || keys['arrowleft']) { camera.getWorldDirection(direction); direction.cross(camera.up); camera.position.addScaledVector(direction, -speed); }
    if (keys['d'] || keys['arrowright']) { camera.getWorldDirection(direction); direction.cross(camera.up); camera.position.addScaledVector(direction, speed); }
  });

  return null;
}

// Realistic Window Component with frame, glass, and shutters
function RealisticWindow({ position, rotation = 0, width = 1.5, height = 1.8 }: { 
  position: [number, number, number]; 
  rotation?: number;
  width?: number;
  height?: number;
}) {
  const frameDepth = 0.15;
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Window recess */}
      <Box args={[width + 0.1, height + 0.1, 0.3]} position={[0, 0, -0.1]}>
        <meshStandardMaterial color="#2a2a2a" />
      </Box>
      
      {/* Window frame - outer */}
      <Box args={[width, height, frameDepth]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#e8dcc8" roughness={0.7} />
      </Box>
      
      {/* Glass panes - 4 sections */}
      {[[-0.25, 0.25], [0.25, 0.25], [-0.25, -0.25], [0.25, -0.25]].map(([xOff, yOff], i) => (
        <Box key={i} args={[width * 0.4, height * 0.4, 0.02]} position={[xOff * width, yOff * height, frameDepth / 2]}>
          <meshStandardMaterial 
            color="#87ceeb" 
            transparent 
            opacity={0.4} 
            metalness={0.9} 
            roughness={0.1}
            envMapIntensity={1.5}
          />
        </Box>
      ))}
      
      {/* Frame dividers */}
      <Box args={[0.06, height - 0.1, 0.08]} position={[0, 0, frameDepth / 2 + 0.02]}>
        <meshStandardMaterial color="#d4c4a8" />
      </Box>
      <Box args={[width - 0.1, 0.06, 0.08]} position={[0, 0, frameDepth / 2 + 0.02]}>
        <meshStandardMaterial color="#d4c4a8" />
      </Box>
      
      {/* Window sill */}
      <Box args={[width + 0.3, 0.08, 0.35]} position={[0, -height / 2 - 0.04, 0.12]}>
        <meshStandardMaterial color="#f5f0e8" roughness={0.6} />
      </Box>
    </group>
  );
}

// Realistic Door Component
function RealisticDoor({ position, rotation = 0, isMain = false }: { 
  position: [number, number, number]; 
  rotation?: number;
  isMain?: boolean;
}) {
  const height = isMain ? 2.6 : 2.2;
  const width = isMain ? 1.4 : 1.0;
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Door frame */}
      <Box args={[width + 0.2, height + 0.15, 0.25]} position={[0, height / 2, 0]}>
        <meshStandardMaterial color="#d4c4a8" roughness={0.6} />
      </Box>
      
      {/* Door panel */}
      <Box args={[width, height, 0.08]} position={[0, height / 2, 0.1]}>
        <meshStandardMaterial color="#5a4030" roughness={0.7} />
      </Box>
      
      {/* Decorative panels */}
      {[[-0.22, 0.65], [0.22, 0.65], [-0.22, 0.25], [0.22, 0.25]].map(([xOff, yOff], i) => (
        <Box key={i} args={[width * 0.35, height * 0.2, 0.02]} position={[xOff * width, yOff * height, 0.16]}>
          <meshStandardMaterial color="#4a3528" roughness={0.6} />
        </Box>
      ))}
      
      {/* Door handle */}
      <Cylinder args={[0.02, 0.02, 0.12, 8]} rotation={[Math.PI / 2, 0, 0]} position={[width / 2 - 0.15, height / 2, 0.18]}>
        <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.2} />
      </Cylinder>
      
      {/* Glass transom for main door */}
      {isMain && (
        <Box args={[width - 0.2, 0.5, 0.05]} position={[0, height + 0.3, 0.12]}>
          <meshStandardMaterial color="#87ceeb" transparent opacity={0.4} metalness={0.8} />
        </Box>
      )}
    </group>
  );
}

// Balcony with realistic railing
function Balcony({ position, width = 6, depth = 2 }: { 
  position: [number, number, number];
  width?: number;
  depth?: number;
}) {
  return (
    <group position={position}>
      {/* Balcony floor */}
      <Box args={[width, 0.2, depth]} position={[0, 0, depth / 2]}>
        <meshStandardMaterial color="#a09080" roughness={0.8} />
      </Box>
      
      {/* Balcony floor tile texture */}
      <Box args={[width - 0.1, 0.05, depth - 0.1]} position={[0, 0.12, depth / 2]}>
        <meshStandardMaterial color="#c4b8a8" roughness={0.7} />
      </Box>
      
      {/* Railing posts */}
      {Array.from({ length: Math.floor(width / 0.8) + 1 }).map((_, i) => (
        <Cylinder 
          key={`post-${i}`}
          args={[0.04, 0.04, 1.1, 8]} 
          position={[-width / 2 + i * (width / Math.floor(width / 0.8)), 0.65, depth - 0.1]}
        >
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
        </Cylinder>
      ))}
      
      {/* Horizontal rails */}
      <Box args={[width, 0.05, 0.05]} position={[0, 1.15, depth - 0.1]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
      </Box>
      <Box args={[width, 0.03, 0.03]} position={[0, 0.6, depth - 0.1]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
      </Box>
      
      {/* Side railings */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * width / 2, 0, depth / 2]}>
          <Box args={[0.05, 1.15, depth - 0.2]} position={[0, 0.65, 0]}>
            <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
          </Box>
        </group>
      ))}
    </group>
  );
}

// Sloped Roof with proper gable geometry - matching rendered views
function SlopedRoof({ width, depth, style }: { width: number; depth: number; style: string }) {
  const roofHeight = 2.8; // Lower, more realistic roof pitch
  const overhang = 0.8; // Smaller overhang for better proportions
  
  const roofColor = style === 'Mediterranean' ? '#b35a1f' : 
                    style === 'Colonial' ? '#556b2f' :
                    style === 'Traditional' ? '#6b4423' : '#4a4a4a';
  
  // Calculate roof slope angle and length
  const halfDepth = (depth / 2) + overhang;
  const roofAngle = Math.atan2(roofHeight, halfDepth);
  const slopeLength = Math.sqrt(roofHeight * roofHeight + halfDepth * halfDepth);
  
  return (
    <group>
      {/* Front slope - tilting backward from front edge up to ridge */}
      <Box 
        args={[width + overhang * 2, 0.15, slopeLength]} 
        position={[0, roofHeight / 2, halfDepth / 2]}
        rotation={[-roofAngle, 0, 0]}
      >
        <meshStandardMaterial color={roofColor} roughness={0.85} />
      </Box>
      
      {/* Back slope - tilting forward from back edge up to ridge */}
      <Box 
        args={[width + overhang * 2, 0.15, slopeLength]} 
        position={[0, roofHeight / 2, -halfDepth / 2]}
        rotation={[roofAngle, 0, 0]}
      >
        <meshStandardMaterial color={roofColor} roughness={0.85} />
      </Box>
      
      {/* Roof ridge cap */}
      <Box args={[width + overhang * 2, 0.18, 0.35]} position={[0, roofHeight, 0]}>
        <meshStandardMaterial color={roofColor} roughness={0.7} />
      </Box>
      
      {/* Left gable end wall (triangle) */}
      <mesh position={[-width / 2, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={3}
            array={new Float32Array([
              0, 0, -depth / 2,
              0, 0, depth / 2,
              0, roofHeight, 0,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <meshStandardMaterial color="#e8dcc8" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Right gable end wall (triangle) */}
      <mesh position={[width / 2, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={3}
            array={new Float32Array([
              0, 0, -depth / 2,
              0, roofHeight, 0,
              0, 0, depth / 2,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <meshStandardMaterial color="#e8dcc8" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Chimney positioned on back slope */}
      <Box args={[0.6, 1.8, 0.45]} position={[width / 4, roofHeight * 0.6, -depth / 4]}>
        <meshStandardMaterial color="#8b6b52" roughness={0.9} />
      </Box>
      <Box args={[0.7, 0.1, 0.55]} position={[width / 4, roofHeight * 0.6 + 0.9, -depth / 4]}>
        <meshStandardMaterial color="#6b4b3a" roughness={0.8} />
      </Box>
    </group>
  );
}

// Interior Room with furniture
function InteriorRoom({ 
  position, 
  size, 
  roomName, 
  showInterior 
}: { 
  position: [number, number, number]; 
  size: [number, number, number];
  roomName: string;
  showInterior: boolean;
}) {
  const [width, height, depth] = size;
  const lowerName = roomName.toLowerCase();
  
  if (!showInterior) return null;
  
  return (
    <group position={position}>
      {/* Floor */}
      <Box args={[width - 0.3, 0.1, depth - 0.3]} position={[0, 0.05, 0]}>
        <meshStandardMaterial 
          color={lowerName.includes('bathroom') || lowerName.includes('kitchen') ? '#d4c4b4' : '#a08060'} 
          roughness={0.6} 
        />
      </Box>
      
      {/* Room label */}
      <Text
        position={[0, height - 0.5, 0]}
        fontSize={0.4}
        color="#333333"
        anchorX="center"
      >
        {roomName}
      </Text>
      
      {/* Furniture based on room type */}
      {lowerName.includes('living') && (
        <>
          {/* Sofa */}
          <Box args={[2.2, 0.4, 0.9]} position={[0, 0.35, -depth / 3]}>
            <meshStandardMaterial color="#5a4a40" roughness={0.8} />
          </Box>
          <Box args={[2.2, 0.6, 0.25]} position={[0, 0.55, -depth / 3 - 0.35]}>
            <meshStandardMaterial color="#5a4a40" roughness={0.8} />
          </Box>
          {/* Coffee table */}
          <Box args={[1.2, 0.05, 0.6]} position={[0, 0.45, 0]}>
            <meshStandardMaterial color="#3a2a20" roughness={0.5} />
          </Box>
          <Cylinder args={[0.03, 0.03, 0.4, 8]} position={[-0.5, 0.2, -0.2]}>
            <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
          </Cylinder>
          <Cylinder args={[0.03, 0.03, 0.4, 8]} position={[0.5, 0.2, -0.2]}>
            <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
          </Cylinder>
          <Cylinder args={[0.03, 0.03, 0.4, 8]} position={[-0.5, 0.2, 0.2]}>
            <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
          </Cylinder>
          <Cylinder args={[0.03, 0.03, 0.4, 8]} position={[0.5, 0.2, 0.2]}>
            <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
          </Cylinder>
          {/* TV unit */}
          <Box args={[1.8, 0.5, 0.4]} position={[0, 0.25, depth / 3]}>
            <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
          </Box>
          <Box args={[1.5, 0.9, 0.05]} position={[0, 0.95, depth / 3 + 0.15]}>
            <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
          </Box>
        </>
      )}
      
      {lowerName.includes('bedroom') && (
        <>
          {/* Bed frame */}
          <Box args={[2, 0.35, 2.2]} position={[0, 0.175, 0]}>
            <meshStandardMaterial color="#6b5040" roughness={0.7} />
          </Box>
          {/* Mattress */}
          <Box args={[1.9, 0.25, 2.1]} position={[0, 0.45, 0]}>
            <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
          </Box>
          {/* Pillows */}
          <Box args={[0.5, 0.15, 0.4]} position={[-0.45, 0.65, -0.8]}>
            <meshStandardMaterial color="#e8e8e8" roughness={0.9} />
          </Box>
          <Box args={[0.5, 0.15, 0.4]} position={[0.45, 0.65, -0.8]}>
            <meshStandardMaterial color="#e8e8e8" roughness={0.9} />
          </Box>
          {/* Headboard */}
          <Box args={[2.1, 1.2, 0.1]} position={[0, 0.95, -1.05]}>
            <meshStandardMaterial color="#5a4030" roughness={0.6} />
          </Box>
          {/* Nightstands */}
          <Box args={[0.5, 0.5, 0.4]} position={[-1.4, 0.25, -0.6]}>
            <meshStandardMaterial color="#5a4030" roughness={0.6} />
          </Box>
          <Box args={[0.5, 0.5, 0.4]} position={[1.4, 0.25, -0.6]}>
            <meshStandardMaterial color="#5a4030" roughness={0.6} />
          </Box>
        </>
      )}
      
      {lowerName.includes('kitchen') && (
        <>
          {/* Kitchen counter */}
          <Box args={[width - 1, 0.9, 0.6]} position={[0, 0.45, -depth / 2 + 0.4]}>
            <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
          </Box>
          {/* Upper cabinets */}
          <Box args={[width - 1.2, 0.6, 0.35]} position={[0, height - 0.8, -depth / 2 + 0.25]}>
            <meshStandardMaterial color="#6b5040" roughness={0.6} />
          </Box>
          {/* Sink */}
          <Box args={[0.6, 0.08, 0.45]} position={[0, 0.92, -depth / 2 + 0.4]}>
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
          </Box>
          {/* Stove */}
          <Box args={[0.7, 0.05, 0.5]} position={[-1, 0.92, -depth / 2 + 0.4]}>
            <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
          </Box>
        </>
      )}
      
      {lowerName.includes('dining') && (
        <>
          {/* Dining table */}
          <Box args={[1.8, 0.05, 1]} position={[0, 0.78, 0]}>
            <meshStandardMaterial color="#5a4030" roughness={0.5} />
          </Box>
          <Cylinder args={[0.05, 0.05, 0.75, 8]} position={[-0.7, 0.38, -0.35]}>
            <meshStandardMaterial color="#4a3020" />
          </Cylinder>
          <Cylinder args={[0.05, 0.05, 0.75, 8]} position={[0.7, 0.38, -0.35]}>
            <meshStandardMaterial color="#4a3020" />
          </Cylinder>
          <Cylinder args={[0.05, 0.05, 0.75, 8]} position={[-0.7, 0.38, 0.35]}>
            <meshStandardMaterial color="#4a3020" />
          </Cylinder>
          <Cylinder args={[0.05, 0.05, 0.75, 8]} position={[0.7, 0.38, 0.35]}>
            <meshStandardMaterial color="#4a3020" />
          </Cylinder>
          {/* Chairs */}
          {[[-0.9, 0], [0.9, 0], [0, 0.7], [0, -0.7]].map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <Box args={[0.4, 0.05, 0.4]} position={[0, 0.45, 0]}>
                <meshStandardMaterial color="#6b5040" />
              </Box>
              <Box args={[0.4, 0.5, 0.05]} position={[0, 0.7, x === 0 ? (z > 0 ? -0.18 : 0.18) : (x > 0 ? -0.18 : 0.18)]}>
                <meshStandardMaterial color="#6b5040" />
              </Box>
            </group>
          ))}
        </>
      )}
      
      {lowerName.includes('bathroom') && (
        <>
          {/* Toilet */}
          <Box args={[0.4, 0.4, 0.6]} position={[-width / 3, 0.2, -depth / 3]}>
            <meshStandardMaterial color="#f8f8f8" roughness={0.3} />
          </Box>
          {/* Sink vanity */}
          <Box args={[0.8, 0.85, 0.5]} position={[0, 0.425, -depth / 2 + 0.35]}>
            <meshStandardMaterial color="#5a4a3a" roughness={0.6} />
          </Box>
          <Box args={[0.6, 0.1, 0.45]} position={[0, 0.9, -depth / 2 + 0.35]}>
            <meshStandardMaterial color="#f8f8f8" roughness={0.2} />
          </Box>
          {/* Shower area */}
          <Box args={[1, 0.02, 1]} position={[width / 3, 0.02, depth / 4]}>
            <meshStandardMaterial color="#c4c4c4" roughness={0.5} />
          </Box>
          <Box args={[1, 2.2, 0.02]} position={[width / 3 - 0.5, 1.1, depth / 4]}>
            <meshStandardMaterial color="#87ceeb" transparent opacity={0.3} />
          </Box>
        </>
      )}
      
      {/* Ceiling light */}
      <Cylinder args={[0.2, 0.15, 0.1, 16]} position={[0, height - 0.1, 0]}>
        <meshStandardMaterial color="#f5f0e5" emissive="#fff5e0" emissiveIntensity={0.3} />
      </Cylinder>
      <pointLight position={[0, height - 0.2, 0]} intensity={0.8} distance={width * 1.5} color="#fff5e6" />
    </group>
  );
}

// Main Photorealistic House with proper 3D geometry
function PhotorealisticHouse({ 
  timeOfDay,
  style,
  showInterior
}: { 
  timeOfDay: number;
  style: string;
  showInterior: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  
  // House dimensions - improved proportions matching rendered views
  const groundFloorHeight = 3.2;
  const firstFloorHeight = 3.0;
  const totalHeight = groundFloorHeight + firstFloorHeight;
  const houseWidth = 14; // Narrower for better proportions
  const houseDepth = 10; // Shallower for compact look
  const wallThickness = 0.25;

  useFrame(() => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.0015;
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

  // Sun position for midday
  const sunPosition = useMemo(() => {
    const hour = timeOfDay;
    const angle = ((hour - 6) / 12) * Math.PI;
    const height = Math.sin(angle) * 60;
    const distance = Math.cos(angle) * 40;
    return [distance, Math.max(height, 8), 25] as [number, number, number];
  }, [timeOfDay]);

  const sunIntensity = useMemo(() => {
    if (timeOfDay < 6 || timeOfDay > 20) return 0.1;
    if (timeOfDay >= 11 && timeOfDay <= 14) return 2.8;
    return 1.5;
  }, [timeOfDay]);

  // Wall color based on style
  const wallColor = style === 'Mediterranean' ? '#fff8dc' : 
                    style === 'Colonial' ? '#f5f0e8' :
                    style === 'Modern' ? '#f0f0f0' : '#e8dcc8';

  return (
    <group ref={groupRef} name="house-model">
      {/* Sky */}
      <Sky 
        distance={450000}
        sunPosition={sunPosition}
        inclination={0.5}
        azimuth={0.25}
        rayleigh={timeOfDay >= 11 && timeOfDay <= 14 ? 0.5 : 2}
      />

      {/* Ground */}
      <Plane args={[200, 200]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <meshStandardMaterial color="#3d6b35" roughness={0.95} />
      </Plane>
      
      {/* Lawn */}
      <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#4a8040" roughness={0.9} />
      </Plane>

      {/* Lighting */}
      <ambientLight intensity={timeOfDay >= 11 && timeOfDay <= 14 ? 0.8 : 0.4} color="#fffbe6" />
      <directionalLight 
        position={sunPosition}
        intensity={sunIntensity}
        color="#fffdf5"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={120}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <hemisphereLight color="#87ceeb" groundColor="#3d5a35" intensity={0.5} />

      {/* Foundation */}
      <Box args={[houseWidth + 1, 0.5, houseDepth + 1]} position={[0, 0.25, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#6b6b6b" roughness={0.9} />
      </Box>

      {/* GROUND FLOOR */}
      <group position={[0, 0.5, 0]}>
        {/* Front wall with openings */}
        <Box args={[houseWidth, groundFloorHeight, wallThickness]} position={[0, groundFloorHeight / 2, houseDepth / 2]} castShadow receiveShadow>
          <meshStandardMaterial color={wallColor} roughness={0.75} />
        </Box>
        
        {/* Back wall */}
        <Box args={[houseWidth, groundFloorHeight, wallThickness]} position={[0, groundFloorHeight / 2, -houseDepth / 2]} castShadow receiveShadow>
          <meshStandardMaterial color={wallColor} roughness={0.75} />
        </Box>
        
        {/* Left wall */}
        <Box args={[wallThickness, groundFloorHeight, houseDepth]} position={[-houseWidth / 2, groundFloorHeight / 2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={wallColor} roughness={0.75} />
        </Box>
        
        {/* Right wall */}
        <Box args={[wallThickness, groundFloorHeight, houseDepth]} position={[houseWidth / 2, groundFloorHeight / 2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={wallColor} roughness={0.75} />
        </Box>

        {/* Windows - Ground floor */}
        <RealisticWindow position={[-houseWidth / 4 - 1.5, 1.8, houseDepth / 2 + 0.1]} />
        <RealisticWindow position={[houseWidth / 4 + 1.5, 1.8, houseDepth / 2 + 0.1]} />
        <RealisticWindow position={[-houseWidth / 2 - 0.1, 1.8, 0]} rotation={Math.PI / 2} />
        <RealisticWindow position={[houseWidth / 2 + 0.1, 1.8, 0]} rotation={-Math.PI / 2} />
        <RealisticWindow position={[0, 1.8, -houseDepth / 2 - 0.1]} rotation={Math.PI} />

        {/* Main door */}
        <RealisticDoor position={[0, 0, houseDepth / 2 + 0.15]} isMain={true} />
        
        {/* Porch */}
        <Box args={[4, 0.15, 2.5]} position={[0, 0.075, houseDepth / 2 + 1.75]} receiveShadow>
          <meshStandardMaterial color="#8a8a8a" roughness={0.8} />
        </Box>
        
        {/* Porch steps */}
        <Box args={[3, 0.15, 0.4]} position={[0, 0.075, houseDepth / 2 + 3.2]} receiveShadow>
          <meshStandardMaterial color="#7a7a7a" roughness={0.85} />
        </Box>
        <Box args={[3.2, 0.15, 0.4]} position={[0, -0.075, houseDepth / 2 + 3.5]} receiveShadow>
          <meshStandardMaterial color="#6a6a6a" roughness={0.85} />
        </Box>
        
        {/* Porch columns */}
        {[-1.5, 1.5].map((x, i) => (
          <Cylinder key={i} args={[0.15, 0.18, 3, 12]} position={[x, 1.5, houseDepth / 2 + 2.8]} castShadow>
            <meshStandardMaterial color="#f0f0f0" roughness={0.6} />
          </Cylinder>
        ))}
        
        {/* Porch roof */}
        <Box args={[4.5, 0.12, 3]} position={[0, 3.1, houseDepth / 2 + 1.8]} castShadow>
          <meshStandardMaterial color="#5a5a5a" roughness={0.7} />
        </Box>

        {/* Interior rooms - Ground floor */}
        <InteriorRoom 
          position={[-houseWidth / 4, 0, -houseDepth / 4]} 
          size={[houseWidth / 2 - 0.5, groundFloorHeight, houseDepth / 2 - 0.5]}
          roomName="Living Room"
          showInterior={showInterior}
        />
        <InteriorRoom 
          position={[houseWidth / 4, 0, -houseDepth / 4]} 
          size={[houseWidth / 2 - 0.5, groundFloorHeight, houseDepth / 2 - 0.5]}
          roomName="Kitchen"
          showInterior={showInterior}
        />
        <InteriorRoom 
          position={[0, 0, houseDepth / 4]} 
          size={[houseWidth - 0.5, groundFloorHeight, houseDepth / 2 - 0.5]}
          roomName="Dining Room"
          showInterior={showInterior}
        />
      </group>

      {/* FIRST FLOOR */}
      <group position={[0, 0.5 + groundFloorHeight, 0]}>
        {/* Floor slab */}
        <Box args={[houseWidth + 0.5, 0.2, houseDepth + 0.5]} position={[0, 0.1, 0]}>
          <meshStandardMaterial color="#d4c4b4" roughness={0.7} />
        </Box>
        
        {/* Front wall */}
        <Box args={[houseWidth, firstFloorHeight, wallThickness]} position={[0, firstFloorHeight / 2 + 0.2, houseDepth / 2]} castShadow receiveShadow>
          <meshStandardMaterial color={wallColor} roughness={0.75} />
        </Box>
        
        {/* Back wall */}
        <Box args={[houseWidth, firstFloorHeight, wallThickness]} position={[0, firstFloorHeight / 2 + 0.2, -houseDepth / 2]} castShadow receiveShadow>
          <meshStandardMaterial color={wallColor} roughness={0.75} />
        </Box>
        
        {/* Side walls */}
        <Box args={[wallThickness, firstFloorHeight, houseDepth]} position={[-houseWidth / 2, firstFloorHeight / 2 + 0.2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={wallColor} roughness={0.75} />
        </Box>
        <Box args={[wallThickness, firstFloorHeight, houseDepth]} position={[houseWidth / 2, firstFloorHeight / 2 + 0.2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={wallColor} roughness={0.75} />
        </Box>

        {/* Windows - First floor */}
        <RealisticWindow position={[-houseWidth / 4 - 1.5, 1.6, houseDepth / 2 + 0.1]} />
        <RealisticWindow position={[houseWidth / 4 + 1.5, 1.6, houseDepth / 2 + 0.1]} />
        <RealisticWindow position={[-houseWidth / 2 - 0.1, 1.6, -houseDepth / 4]} rotation={Math.PI / 2} />
        <RealisticWindow position={[houseWidth / 2 + 0.1, 1.6, -houseDepth / 4]} rotation={-Math.PI / 2} />

        {/* Balcony */}
        <Balcony position={[0, 0.2, houseDepth / 2]} width={6} depth={2} />
        
        {/* Balcony door */}
        <RealisticDoor position={[0, 0.2, houseDepth / 2 + 0.1]} />

        {/* Interior rooms - First floor */}
        <InteriorRoom 
          position={[-houseWidth / 4, 0.2, 0]} 
          size={[houseWidth / 2 - 0.5, firstFloorHeight, houseDepth - 0.5]}
          roomName="Master Bedroom"
          showInterior={showInterior}
        />
        <InteriorRoom 
          position={[houseWidth / 4, 0.2, -houseDepth / 4]} 
          size={[houseWidth / 2 - 0.5, firstFloorHeight, houseDepth / 2 - 0.5]}
          roomName="Bedroom 2"
          showInterior={showInterior}
        />
        <InteriorRoom 
          position={[houseWidth / 4, 0.2, houseDepth / 4]} 
          size={[houseWidth / 2 - 0.5, firstFloorHeight, houseDepth / 2 - 0.5]}
          roomName="Bathroom"
          showInterior={showInterior}
        />
      </group>

      {/* Roof */}
      <group position={[0, 0.5 + totalHeight, 0]}>
        <SlopedRoof width={houseWidth} depth={houseDepth} style={style} />
      </group>

      {/* Driveway */}
      <Plane args={[4.5, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, houseDepth / 2 + 13]} receiveShadow>
        <meshStandardMaterial color="#5a5a5a" roughness={0.95} />
      </Plane>

      {/* Landscaping - Trees */}
      {[
        [-18, 0, -10, 1.4], [18, 0, -10, 1.6], [-22, 0, 8, 1.2],
        [22, 0, 8, 1.5], [-15, 0, 18, 1.3], [15, 0, 20, 1.7],
      ].map(([x, y, z, scale], i) => (
        <group key={i} position={[x, y, z]}>
          <Cylinder args={[0.2 * scale, 0.35 * scale, 3 * scale, 8]} position={[0, 1.5 * scale, 0]} castShadow>
            <meshStandardMaterial color="#4a3020" roughness={0.9} />
          </Cylinder>
          {[0, 1, 2, 3].map((j) => (
            <mesh key={j} position={[0, 3 * scale + j * 1.2 * scale, 0]} castShadow>
              <coneGeometry args={[(2 - j * 0.4) * scale, 2.2 * scale, 12]} />
              <meshStandardMaterial color={`hsl(120, ${40 + j * 8}%, ${18 + j * 4}%)`} roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Bushes */}
      {[
        [-houseWidth / 2 - 1.5, 0.4, houseDepth / 2], [houseWidth / 2 + 1.5, 0.4, houseDepth / 2],
        [-houseWidth / 2 - 1, 0.3, 0], [houseWidth / 2 + 1, 0.35, 0],
        [-2.5, 0.3, houseDepth / 2 + 3], [2.5, 0.35, houseDepth / 2 + 3],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[0.5 + Math.random() * 0.3, 12, 12]} />
          <meshStandardMaterial color={`hsl(${115 + i * 5}, ${45 + i * 5}%, ${22 + i * 3}%)`} roughness={0.9} />
        </mesh>
      ))}

      {/* Garden path */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Cylinder 
          key={i}
          args={[0.35, 0.35, 0.05, 8]} 
          position={[-4, 0.03, houseDepth / 2 + 1 + i * 0.9]}
          rotation={[0, Math.random() * Math.PI, 0]}
          receiveShadow
        >
          <meshStandardMaterial color="#808080" roughness={0.9} />
        </Cylinder>
      ))}
    </group>
  );
}

// Scene capture for export
function SceneCapture({ onSceneReady }: { onSceneReady: (scene: THREE.Scene) => void }) {
  const { scene } = useThree();
  useEffect(() => {
    onSceneReady(scene);
  }, [scene, onSceneReady]);
  return null;
}

export default function PhotorealisticHouseModel({ floorPlanSetId, style = "Modern" }: PhotorealisticHouseModelProps) {
  const [currentTime, setCurrentTime] = useState(12);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true);
  const [showInterior, setShowInterior] = useState(false);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const exportGLB = () => {
    if (!scene) {
      toast.error("Scene not ready for export");
      return;
    }
    
    setIsExporting(true);
    toast.info("Preparing GLB export...");
    
    const exporter = new GLTFExporter();
    const houseGroup = scene.getObjectByName('house-model');
    
    if (!houseGroup) {
      toast.error("Could not find house model");
      setIsExporting(false);
      return;
    }
    
    exporter.parse(
      houseGroup as any,
      (result) => {
        if (result instanceof ArrayBuffer) {
          const blob = new Blob([result], { type: "application/octet-stream" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `CasaMuse-${style}-House.glb`;
          link.click();
          URL.revokeObjectURL(link.href);
          toast.success("GLB file downloaded!");
        }
        setIsExporting(false);
      },
      (error) => {
        console.error("Export error:", error);
        toast.error("Failed to export GLB");
        setIsExporting(false);
      },
      { binary: true }
    );
  };

  return (
    <div className="w-full h-[700px] relative rounded-lg overflow-hidden bg-gradient-to-b from-sky-200 to-green-100">
      {/* Controls UI */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 justify-between">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg flex items-center gap-3">
          <Sun className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-semibold">{formatTime(currentTime)}</span>
          <Slider 
            value={[currentTime]} 
            min={0} 
            max={24} 
            step={0.5} 
            onValueChange={(val) => setCurrentTime(val[0])} 
            className="w-28" 
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={showInterior ? "default" : "outline"}
            size="sm" 
            onClick={() => setShowInterior(!showInterior)}
            className="bg-white/95 backdrop-blur-sm shadow-lg"
          >
            {showInterior ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {showInterior ? 'Hide Interior' : 'Show Interior'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setAutoRotateEnabled(!autoRotateEnabled)}
            className="bg-white/95 backdrop-blur-sm shadow-lg"
          >
            <RotateCw className={`w-4 h-4 mr-2 ${autoRotateEnabled ? 'animate-spin' : ''}`} />
            {autoRotateEnabled ? 'Stop' : 'Rotate'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportGLB}
            disabled={isExporting || !scene}
            className="bg-white/95 backdrop-blur-sm shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export .GLB'}
          </Button>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas 
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          preserveDrawingBuffer: true,
        }}
      >
        <SceneCapture onSceneReady={setScene} />
        <PerspectiveCamera makeDefault position={[35, 25, 40]} fov={45} />
        <OrbitControls 
          enablePan 
          enableZoom 
          enableRotate 
          minDistance={15} 
          maxDistance={120} 
          maxPolarAngle={Math.PI / 2.05}
          autoRotate={autoRotateEnabled}
          autoRotateSpeed={0.6}
          enableDamping
          dampingFactor={0.05}
        />
        <KeyboardControls />
        <Suspense fallback={null}>
          <PhotorealisticHouse 
            timeOfDay={currentTime} 
            style={style}
            showInterior={showInterior}
          />
        </Suspense>
      </Canvas>

      {/* Controls Help */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs max-w-[220px]">
        <p className="font-semibold mb-1">Controls:</p>
        <p>🖱️ <strong>Drag</strong>: Rotate | <strong>Right-drag</strong>: Pan</p>
        <p>🔄 <strong>Scroll</strong>: Zoom in/out</p>
        <p>⌨️ <strong>WASD/Arrows</strong>: Navigate</p>
      </div>

      {/* Style Badge */}
      <div className="absolute top-16 right-4 bg-primary/90 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
        {style} Style
      </div>
    </div>
  );
}
