import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Box, Plane, Environment } from '@react-three/drei';
import { createXRStore, XR } from '@react-three/xr';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import ModelExporter from './ModelExporter';
import { RoomComponent } from './RoomBuilder';
import EnhancedLandscaping from './EnhancedLandscaping';
import ExteriorLighting from './ExteriorLighting';
import { getStyleMaterials } from './TexturedMaterials';
import StyleSpecificRoof from './StyleSpecificRoof';
import { useGrassTexture, useStonePaverTexture, useStuccoWallTexture, useRoofTileTexture } from './PBRMaterials';
import OutdoorFeatures from './OutdoorFeatures';
import { getStyleConfig } from './StyleConsistency';
import { Ruler, Clock, Download } from 'lucide-react';

interface Room {
  roomName: string;
  length: number;
  breadth: number;
}

interface HouseModel3DProps {
  rooms: Room[];
  style: string;
  onVRStatusChange?: (isVR: boolean) => void;
  timeOfDay?: number;
  showMeasurements?: boolean;
}

// Keyboard controls component
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

// Legacy basic roof - kept for fallback
function BasicRoof({ width, depth, height, roofColor, trimColor }: { width: number; depth: number; height: number; roofColor: string; trimColor: string }) {
  const roofHeight = 2.5;
  const overhang = 1.2;
  
  return (
    <group position={[0, height, 0]}>
      <Box args={[width + overhang * 2, 0.3, depth + overhang * 2]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color={trimColor} />
      </Box>
      <mesh position={[0, roofHeight / 2 + 0.3, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <boxGeometry args={[(width / 2 + overhang) / Math.cos(Math.PI / 6), 0.2, depth + overhang * 2]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
      <mesh position={[0, roofHeight / 2 + 0.3, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <boxGeometry args={[(width / 2 + overhang) / Math.cos(Math.PI / 6), 0.2, depth + overhang * 2]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
      <Box args={[0.3, 0.3, depth + overhang * 2]} position={[0, roofHeight + 0.15, 0]}>
        <meshStandardMaterial color={trimColor} />
      </Box>
    </group>
  );
}

// External features - main door, windows, porch
function ExternalFeatures({ houseWidth, houseDepth, trimColor }: { houseWidth: number; houseDepth: number; trimColor: string }) {
  return (
    <group>
      {/* Main entrance door */}
      <group position={[0, 0, houseDepth / 2 + 0.1]}>
        <Box args={[1.35, 2.5, 0.2]} position={[0, 1.2, 0]}>
          <meshStandardMaterial color="#5a4a3a" />
        </Box>
        <Box args={[1.2, 2.4, 0.08]} position={[0, 1.2, 0.05]}>
          <meshStandardMaterial color="#6b4423" roughness={0.6} />
        </Box>
        <Box args={[0.08, 0.15, 0.1]} position={[0.45, 1.2, 0.15]}>
          <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.2} />
        </Box>
      </group>
      
      {/* Front windows */}
      {[-houseWidth / 4, houseWidth / 4].map((x, i) => (
        <group key={i} position={[x, 1.8, houseDepth / 2 + 0.15]}>
          <Box args={[1.5, 1.8, 0.2]}>
            <meshStandardMaterial color="#4a5568" />
          </Box>
          <Box args={[1.3, 1.6, 0.02]} position={[0, 0, 0.05]}>
            <meshStandardMaterial color="#a0d2eb" transparent opacity={0.4} metalness={0.9} />
          </Box>
        </group>
      ))}
      
      {/* Porch steps */}
      <Box args={[2.5, 0.15, 1]} position={[0, 0.075, houseDepth / 2 + 1]}>
        <meshStandardMaterial color="#808080" />
      </Box>
      <Box args={[2.8, 0.15, 0.7]} position={[0, 0.225, houseDepth / 2 + 0.6]}>
        <meshStandardMaterial color="#707070" />
      </Box>
      
      {/* Porch pillars */}
      {[-1.2, 1.2].map((x, i) => (
        <Box key={i} args={[0.2, 3, 0.2]} position={[x, 1.5, houseDepth / 2 + 0.8]}>
          <meshStandardMaterial color={trimColor} />
        </Box>
      ))}
      
      {/* Driveway */}
      <Plane args={[3.5, 18]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, houseDepth / 2 + 10]}>
        <meshStandardMaterial color="#6b6b6b" roughness={0.9} />
      </Plane>
    </group>
  );
}

// Calculate proper rectangular floor plan layout with L-shape support
function calculateFloorPlanLayout(rooms: Room[]) {
  if (rooms.length === 0) return { positions: [], totalWidth: 0, totalDepth: 0 };
  
  // Sort rooms by type priority (living areas first, then bedrooms, then utilities)
  const getPriority = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('living') || lower.includes('drawing')) return 1;
    if (lower.includes('dining')) return 2;
    if (lower.includes('kitchen')) return 3;
    if (lower.includes('master') || lower.includes('bedroom')) return 4;
    if (lower.includes('study') || lower.includes('office')) return 5;
    if (lower.includes('bathroom')) return 6;
    return 7;
  };

  const sortedRooms = [...rooms].map((r, idx) => ({ ...r, originalIndex: idx }))
    .sort((a, b) => {
      const priorityDiff = getPriority(a.roomName) - getPriority(b.roomName);
      if (priorityDiff !== 0) return priorityDiff;
      return (b.breadth * b.length) - (a.breadth * a.length);
    });
  
  // Calculate optimal grid dimensions
  const numRooms = rooms.length;
  let targetCols = 2;
  let targetRows = Math.ceil(numRooms / 2);
  
  if (numRooms >= 6) {
    targetCols = 3;
    targetRows = Math.ceil(numRooms / 3);
  }
  if (numRooms >= 9) {
    targetCols = 3;
    targetRows = Math.ceil(numRooms / 3);
  }
  
  // Grid-based positioning with proper spacing
  const positions: { x: number; z: number; room: Room & { originalIndex: number } }[] = [];
  const grid: (Room & { originalIndex: number } | null)[][] = [];
  
  // Initialize grid
  for (let row = 0; row < targetRows; row++) {
    grid[row] = [];
    for (let col = 0; col < targetCols; col++) {
      grid[row][col] = null;
    }
  }
  
  // Place rooms in grid
  let roomIdx = 0;
  for (let row = 0; row < targetRows && roomIdx < sortedRooms.length; row++) {
    for (let col = 0; col < targetCols && roomIdx < sortedRooms.length; col++) {
      grid[row][col] = sortedRooms[roomIdx];
      roomIdx++;
    }
  }
  
  // Calculate actual row heights and column widths with minimum sizes
  const rowDepths: number[] = [];
  const colWidths: number[] = [];
  const wallGap = 0.3; // Gap for walls between rooms
  
  for (let row = 0; row < targetRows; row++) {
    let maxDepth = 10;
    for (let col = 0; col < targetCols; col++) {
      if (grid[row][col]) {
        maxDepth = Math.max(maxDepth, grid[row][col]!.length);
      }
    }
    rowDepths.push(maxDepth);
  }
  
  for (let col = 0; col < targetCols; col++) {
    let maxWidth = 10;
    for (let row = 0; row < targetRows; row++) {
      if (grid[row][col]) {
        maxWidth = Math.max(maxWidth, grid[row][col]!.breadth);
      }
    }
    colWidths.push(maxWidth);
  }
  
  // Calculate positions with proper offsets
  let zOffset = 0;
  for (let row = 0; row < targetRows; row++) {
    let xOffset = 0;
    for (let col = 0; col < targetCols; col++) {
      const room = grid[row][col];
      if (room) {
        positions.push({
          x: xOffset + colWidths[col] / 2,
          z: zOffset + rowDepths[row] / 2,
          room
        });
      }
      xOffset += colWidths[col] + wallGap;
    }
    zOffset += rowDepths[row] + wallGap;
  }
  
  const totalWidth = colWidths.reduce((sum, w) => sum + w, 0) + (colWidths.length - 1) * wallGap;
  const totalDepth = rowDepths.reduce((sum, d) => sum + d, 0) + (rowDepths.length - 1) * wallGap;
  
  // Sort back by original index for consistent rendering
  positions.sort((a, b) => a.room.originalIndex - b.room.originalIndex);
  
  return { positions, totalWidth, totalDepth, colWidths, rowDepths, targetCols, targetRows };
}

// Main House component with PBR materials
function House({ rooms, style, timeOfDay, showMeasurements }: { 
  rooms: Room[]; 
  style: string;
  timeOfDay: number;
  showMeasurements: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const styleConfig = getStyleMaterials(style);
  const roomHeight = 3.2;
  
  // PBR textures
  const grassTexture = useGrassTexture();
  const paverTexture = useStonePaverTexture();
  const stuccoTexture = useStuccoWallTexture(styleConfig.wallColor);
  const roofTileTexture = useRoofTileTexture(styleConfig.roofColor);

  const layout = calculateFloorPlanLayout(rooms);
  const { positions, totalWidth, totalDepth } = layout;
  const centerOffsetX = -totalWidth / 2;
  const centerOffsetZ = -totalDepth / 2;

  // Time-based sky and lighting
  const getSkyColor = (time: number) => {
    if (time < 6 || time > 20) return "#0a1628";
    if (time < 7) return "#1a3a52";
    if (time < 8) return "#ff9a5f";
    if (time > 18) return "#ff7f50";
    if (time > 17) return "#87ceeb";
    return "#87ceeb";
  };

  const getAmbientIntensity = (time: number) => {
    if (time < 6 || time > 20) return 0.15;
    if (time < 8 || time > 18) return 0.4;
    return 0.7;
  };

  const getSunIntensity = (time: number) => {
    if (time < 6 || time > 20) return 0.1;
    if (time < 8 || time > 18) return 1.5;
    if (time >= 11 && time <= 14) return 3.0; // Midday brightness
    return 2.5;
  };

  // Sun position calculation for realistic shadows
  const sunPosition = useMemo(() => {
    const hour = timeOfDay;
    const angle = ((hour - 6) / 12) * Math.PI;
    const height = Math.max(Math.sin(angle) * 50, 5);
    const horizontal = Math.cos(angle) * 40;
    return [horizontal, height, 30] as [number, number, number];
  }, [timeOfDay]);

  return (
    <group ref={groupRef}>
      {/* Sky dome with gradient */}
      <mesh>
        <sphereGeometry args={[200, 64, 64]} />
        <meshBasicMaterial color={getSkyColor(timeOfDay)} side={THREE.BackSide} />
      </mesh>

      {/* Ground plane with grass texture */}
      <Plane args={[400, 400]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <meshStandardMaterial map={grassTexture} roughness={0.9} />
      </Plane>

      {/* House foundation/base */}
      <Box args={[totalWidth + 2, 0.4, totalDepth + 2]} position={[0, 0.2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#808080" roughness={0.9} />
      </Box>

      {/* Patio/walkway with stone pavers */}
      <Plane args={[totalWidth + 4, 4]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.42, totalDepth / 2 + 2]} receiveShadow>
        <meshStandardMaterial map={paverTexture} roughness={0.8} />
      </Plane>

      {/* Driveway */}
      <Plane args={[4, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, totalDepth / 2 + 12]} receiveShadow>
        <meshStandardMaterial color="#5a5a5a" roughness={0.9} />
      </Plane>

      {/* Lighting setup - PBR based */}
      <ambientLight intensity={getAmbientIntensity(timeOfDay)} color="#fff5e6" />
      <directionalLight 
        position={sunPosition}
        intensity={getSunIntensity(timeOfDay)}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={150}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
        color={timeOfDay >= 8 && timeOfDay <= 18 ? "#ffffff" : "#ff9a5f"}
      />
      <hemisphereLight 
        color="#87ceeb" 
        groundColor="#4a7c4a" 
        intensity={0.5} 
      />

      {/* House structure - rooms arranged in proper floor plan */}
      <group position={[centerOffsetX, 0.4, centerOffsetZ]}>
        {positions.map((pos, index) => {
          const room = pos.room;
          return (
            <RoomComponent
              key={index}
              position={[pos.x, 0, pos.z]}
              size={[room.breadth, roomHeight, room.length]}
              name={room.roomName}
              styleConfig={styleConfig}
              showMeasurements={showMeasurements}
              roomIndex={index}
              isFirst={index === 0}
              isLast={index === positions.length - 1}
            />
          );
        })}
      </group>

      {/* Style-Specific Roof */}
      <StyleSpecificRoof 
        width={totalWidth} 
        depth={totalDepth} 
        height={roomHeight + 0.4} 
        style={style} 
        styleConfig={styleConfig} 
      />

      {/* External features */}
      <ExternalFeatures houseWidth={totalWidth} houseDepth={totalDepth} trimColor={styleConfig.trimColor} />

      {/* Outdoor Features - Garage, Pool, Deck */}
      <OutdoorFeatures houseWidth={totalWidth} houseDepth={totalDepth} style={style} />

      {/* Enhanced Landscaping */}
      <EnhancedLandscaping houseWidth={totalWidth} houseDepth={totalDepth} style={style} />
      
      {/* Exterior Lighting */}
      <ExteriorLighting houseWidth={totalWidth} houseDepth={totalDepth} timeOfDay={timeOfDay} />
    </group>
  );
}

export default function HouseModel3D({ rooms, style, onVRStatusChange, timeOfDay = 12, showMeasurements = false }: HouseModel3DProps) {
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [currentTime, setCurrentTime] = useState(timeOfDay);
  const [measurementsVisible, setMeasurementsVisible] = useState(showMeasurements);
  const [showExporter, setShowExporter] = useState(false);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const store = createXRStore();

  const hasRooms = rooms && rooms.length > 0;

  function SceneCapture() {
    const { scene } = useThree();
    useEffect(() => { setScene(scene); }, [scene]);
    return null;
  }

  useEffect(() => {
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-vr').then((supported: boolean) => {
        setIsVRSupported(supported);
      });
    }
  }, []);

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (!hasRooms) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No rooms to display</p>
          <p className="text-sm">Generate a floor plan first to view the 3D model</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] relative rounded-lg overflow-hidden bg-gradient-to-b from-sky-100 to-green-100">
      {/* Controls UI */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 justify-between">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg flex items-center gap-3 min-w-[200px]">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium">Time: {formatTime(currentTime)}</span>
          <Slider value={[currentTime]} min={0} max={24} step={0.5} onValueChange={(val) => setCurrentTime(val[0])} className="w-32" />
        </div>

        <div className="flex gap-2">
          <Button variant={measurementsVisible ? "default" : "outline"} size="sm" onClick={() => setMeasurementsVisible(!measurementsVisible)} className="bg-white/90 backdrop-blur-sm">
            <Ruler className="w-4 h-4 mr-2" />
            Measurements
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowExporter(!showExporter)} className="bg-white/90 backdrop-blur-sm">
            <Download className="w-4 h-4 mr-2" />
            Download Model
          </Button>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows>
        <XR store={store}>
          <SceneCapture />
          <PerspectiveCamera makeDefault position={[30, 25, 40]} fov={50} />
          <OrbitControls enablePan enableZoom enableRotate minDistance={5} maxDistance={120} maxPolarAngle={Math.PI / 2.1} />
          <KeyboardControls />
          <House rooms={rooms} style={style} timeOfDay={currentTime} showMeasurements={measurementsVisible} />
        </XR>
      </Canvas>

      {/* Export Modal */}
      {showExporter && scene && (
        <div className="absolute bottom-4 left-4 z-10">
          <ModelExporter scene={scene} fileName={`CasaMuse-${style}-House`} />
        </div>
      )}

      {/* Controls Help */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs max-w-[200px]">
        <p className="font-semibold mb-1">Controls:</p>
        <p>🖱️ <strong>Drag</strong>: Rotate | <strong>Right-drag</strong>: Pan</p>
        <p>🔄 <strong>Scroll</strong>: Zoom</p>
        <p>⌨️ <strong>WASD/Arrows</strong>: Navigate</p>
      </div>

      {/* VR Button */}
      {isVRSupported && (
        <Button className="absolute bottom-4 right-4" onClick={() => store.enterVR()}>
          Enter VR
        </Button>
      )}
    </div>
  );
}
