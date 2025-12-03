import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Box, Plane, Text, Line, useTexture } from '@react-three/drei';
import { createXRStore, XR } from '@react-three/xr';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Furniture, { FurnitureItem } from './Furniture';
import ModelExporter from './ModelExporter';
import { Plus, Sofa, Bed, Table, Trash2, Download, Ruler, Clock } from 'lucide-react';

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

// Style-specific materials and colors
const getStyleConfig = (style: string) => {
  const configs: Record<string, { wallColor: string; floorColor: string; roofColor: string; accentColor: string; trimColor: string }> = {
    Modern: { wallColor: '#f5f5f5', floorColor: '#8B7355', roofColor: '#2c2c2c', accentColor: '#4a90a4', trimColor: '#333333' },
    Contemporary: { wallColor: '#e8e8e8', floorColor: '#9c8b7a', roofColor: '#404040', accentColor: '#6b8e23', trimColor: '#404040' },
    Traditional: { wallColor: '#faf0e6', floorColor: '#deb887', roofColor: '#8b4513', accentColor: '#8b0000', trimColor: '#8b4513' },
    Minimalist: { wallColor: '#ffffff', floorColor: '#d4d4d4', roofColor: '#1a1a1a', accentColor: '#000000', trimColor: '#1a1a1a' },
    Luxury: { wallColor: '#f5f0e1', floorColor: '#4a3728', roofColor: '#2f1810', accentColor: '#c9a227', trimColor: '#2f1810' },
    Scandinavian: { wallColor: '#fefefe', floorColor: '#c4a77d', roofColor: '#5a5a5a', accentColor: '#87ceeb', trimColor: '#5a5a5a' },
    Industrial: { wallColor: '#a9a9a9', floorColor: '#696969', roofColor: '#4a4a4a', accentColor: '#ff6b35', trimColor: '#333333' },
    Colonial: { wallColor: '#fffaf0', floorColor: '#bc8f8f', roofColor: '#556b2f', accentColor: '#800020', trimColor: '#8b4513' },
    Mediterranean: { wallColor: '#fff8dc', floorColor: '#cd853f', roofColor: '#b22222', accentColor: '#4682b4', trimColor: '#8b4513' },
    Rustic: { wallColor: '#f5deb3', floorColor: '#8b7355', roofColor: '#654321', accentColor: '#228b22', trimColor: '#654321' },
  };
  return configs[style] || configs.Modern;
};

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

// Measurement line component
function MeasurementLine({ start, end, label }: { start: [number, number, number]; end: [number, number, number]; label: string }) {
  const midpoint: [number, number, number] = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2 + 0.3, (start[2] + end[2]) / 2];
  return (
    <group>
      <Line points={[start, end]} color="#ff4444" lineWidth={3} />
      <Text position={midpoint} fontSize={0.4} color="#ff4444" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#ffffff">
        {label}
      </Text>
    </group>
  );
}

// Window component
function Window({ position, rotation = [0, 0, 0], size = [1.2, 1.5, 0.15] }: { position: [number, number, number]; rotation?: [number, number, number]; size?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation as any}>
      {/* Window frame */}
      <Box args={size}>
        <meshStandardMaterial color="#4a5568" metalness={0.3} roughness={0.7} />
      </Box>
      {/* Glass */}
      <Box args={[size[0] - 0.15, size[1] - 0.15, 0.05]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.4} metalness={0.9} roughness={0.1} />
      </Box>
    </group>
  );
}

// Door component
function Door({ position, rotation = [0, 0, 0], isMain = false }: { position: [number, number, number]; rotation?: [number, number, number]; isMain?: boolean }) {
  const height = isMain ? 2.4 : 2.1;
  const width = isMain ? 1.2 : 0.9;
  return (
    <group position={position} rotation={rotation as any}>
      {/* Door frame */}
      <Box args={[width + 0.15, height + 0.1, 0.2]} position={[0, height / 2, 0]}>
        <meshStandardMaterial color="#5a4a3a" />
      </Box>
      {/* Door panel */}
      <Box args={[width, height, 0.08]} position={[0, height / 2, 0.05]}>
        <meshStandardMaterial color={isMain ? "#6b4423" : "#8b7355"} />
      </Box>
      {/* Door handle */}
      <Box args={[0.08, 0.15, 0.1]} position={[width / 2 - 0.2, height / 2, 0.15]}>
        <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.2} />
      </Box>
    </group>
  );
}

// Enhanced Room component with walls, floor, ceiling
function RoomComponent({ 
  position, 
  size, 
  name, 
  styleConfig,
  showMeasurements,
  roomIndex,
  isFirst,
  isLast
}: { 
  position: [number, number, number]; 
  size: [number, number, number]; 
  name: string;
  styleConfig: ReturnType<typeof getStyleConfig>;
  showMeasurements: boolean;
  roomIndex: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const wallThickness = 0.2;
  const [width, height, depth] = size;
  
  // Floor texture pattern
  const floorPattern = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = styleConfig.floorColor;
    ctx.fillRect(0, 0, 128, 128);
    // Wood grain effect
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 16);
      ctx.lineTo(128, i * 16);
      ctx.stroke();
    }
    return new THREE.CanvasTexture(canvas);
  }, [styleConfig.floorColor]);

  return (
    <group position={position}>
      {/* Floor with wood pattern */}
      <Plane args={[width, depth]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <meshStandardMaterial map={floorPattern} side={THREE.DoubleSide} roughness={0.8} />
      </Plane>

      {/* Ceiling */}
      <Plane args={[width, depth]} rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </Plane>

      {/* Back wall (solid) */}
      <Box args={[width, height, wallThickness]} position={[0, height / 2, -depth / 2]}>
        <meshStandardMaterial color={styleConfig.wallColor} side={THREE.DoubleSide} />
      </Box>

      {/* Front wall (with door opening for some rooms) */}
      {roomIndex % 3 !== 0 && (
        <Box args={[width, height, wallThickness]} position={[0, height / 2, depth / 2]}>
          <meshStandardMaterial color={styleConfig.wallColor} transparent opacity={0.3} side={THREE.DoubleSide} />
        </Box>
      )}

      {/* Left wall */}
      {isFirst && (
        <group>
          <Box args={[wallThickness, height, depth]} position={[-width / 2, height / 2, 0]}>
            <meshStandardMaterial color={styleConfig.wallColor} side={THREE.DoubleSide} />
          </Box>
          {/* Window on left wall */}
          <Window position={[-width / 2 + 0.1, height / 2 + 0.3, 0]} rotation={[0, Math.PI / 2, 0]} />
        </group>
      )}

      {/* Right wall */}
      {isLast && (
        <group>
          <Box args={[wallThickness, height, depth]} position={[width / 2, height / 2, 0]}>
            <meshStandardMaterial color={styleConfig.wallColor} side={THREE.DoubleSide} />
          </Box>
          {/* Window on right wall */}
          <Window position={[width / 2 - 0.1, height / 2 + 0.3, 0]} rotation={[0, -Math.PI / 2, 0]} />
        </group>
      )}

      {/* Interior door between rooms */}
      {!isLast && (
        <Door position={[width / 2, 0, depth / 4]} rotation={[0, Math.PI / 2, 0]} />
      )}

      {/* Room label */}
      <Text
        position={[0, height - 0.3, -depth / 2 + 0.5]}
        fontSize={0.4}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        {name}
      </Text>

      {/* Room lighting */}
      <pointLight position={[0, height - 0.5, 0]} intensity={1} distance={width * 2} color="#fffaf0" castShadow />

      {/* Measurements */}
      {showMeasurements && (
        <>
          <MeasurementLine
            start={[-width / 2, 0.05, depth / 2 + 0.8]}
            end={[width / 2, 0.05, depth / 2 + 0.8]}
            label={`${width.toFixed(0)}ft`}
          />
          <MeasurementLine
            start={[width / 2 + 0.8, 0.05, -depth / 2]}
            end={[width / 2 + 0.8, 0.05, depth / 2]}
            label={`${depth.toFixed(0)}ft`}
          />
        </>
      )}
    </group>
  );
}

// Roof component
function Roof({ width, depth, height, styleConfig }: { width: number; depth: number; height: number; styleConfig: ReturnType<typeof getStyleConfig> }) {
  const roofHeight = 2;
  const overhang = 1;
  
  return (
    <group position={[0, height, 0]}>
      {/* Main roof base */}
      <Box args={[width + overhang * 2, 0.3, depth + overhang * 2]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color={styleConfig.trimColor} />
      </Box>
      
      {/* Pitched roof - left side */}
      <mesh position={[0, roofHeight / 2 + 0.3, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <boxGeometry args={[(width / 2 + overhang) / Math.cos(Math.PI / 6), 0.2, depth + overhang * 2]} />
        <meshStandardMaterial color={styleConfig.roofColor} />
      </mesh>
      
      {/* Pitched roof - right side */}
      <mesh position={[0, roofHeight / 2 + 0.3, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <boxGeometry args={[(width / 2 + overhang) / Math.cos(Math.PI / 6), 0.2, depth + overhang * 2]} />
        <meshStandardMaterial color={styleConfig.roofColor} />
      </mesh>

      {/* Roof ridge */}
      <Box args={[0.3, 0.3, depth + overhang * 2]} position={[0, roofHeight + 0.15, 0]}>
        <meshStandardMaterial color={styleConfig.trimColor} />
      </Box>
    </group>
  );
}

// External features
function ExternalFeatures({ houseWidth, houseDepth, styleConfig }: { houseWidth: number; houseDepth: number; styleConfig: ReturnType<typeof getStyleConfig> }) {
  return (
    <group>
      {/* Main entrance door */}
      <Door position={[0, 0, houseDepth / 2 + 0.1]} isMain />
      
      {/* Front windows */}
      <Window position={[-houseWidth / 4, 1.8, houseDepth / 2 + 0.15]} size={[1.5, 1.8, 0.2]} />
      <Window position={[houseWidth / 4, 1.8, houseDepth / 2 + 0.15]} size={[1.5, 1.8, 0.2]} />
      
      {/* Steps/Porch */}
      <Box args={[2, 0.15, 0.8]} position={[0, 0.075, houseDepth / 2 + 0.9]}>
        <meshStandardMaterial color="#808080" />
      </Box>
      <Box args={[2.2, 0.15, 0.6]} position={[0, 0.225, houseDepth / 2 + 0.5]}>
        <meshStandardMaterial color="#808080" />
      </Box>
      
      {/* Pillars for porch */}
      <Box args={[0.2, 3, 0.2]} position={[-1, 1.5, houseDepth / 2 + 0.7]}>
        <meshStandardMaterial color={styleConfig.trimColor} />
      </Box>
      <Box args={[0.2, 3, 0.2]} position={[1, 1.5, houseDepth / 2 + 0.7]}>
        <meshStandardMaterial color={styleConfig.trimColor} />
      </Box>
    </group>
  );
}

// Main House component
function House({ 
  rooms, 
  style, 
  timeOfDay, 
  showMeasurements,
  furniture,
  onUpdateFurniture
}: { 
  rooms: Room[]; 
  style: string;
  timeOfDay: number;
  showMeasurements: boolean;
  furniture: FurnitureItem[];
  onUpdateFurniture: (id: string, position: [number, number, number]) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const styleConfig = getStyleConfig(style);
  const roomHeight = 3; // 3 meters / ~10 feet

  // Calculate layout
  const totalWidth = rooms.reduce((sum, room) => sum + room.breadth, 0) + (rooms.length - 1) * 0.2;
  const maxDepth = Math.max(...rooms.map(r => r.length), 10);
  const centerOffset = -totalWidth / 2;

  // Sky color based on time
  const getSkyColor = (time: number) => {
    if (time < 6 || time > 20) return "#0a1628";
    if (time < 8 || time > 18) return "#ff7e5f";
    return "#87ceeb";
  };

  // Ambient intensity based on time
  const getAmbientIntensity = (time: number) => {
    if (time < 6 || time > 20) return 0.2;
    if (time < 8 || time > 18) return 0.5;
    return 0.8;
  };

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
      <Plane args={[totalWidth + 20, maxDepth + 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#5a8f5a" />
      </Plane>

      {/* Path/Driveway */}
      <Plane args={[3, 15]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, maxDepth / 2 + 8]}>
        <meshStandardMaterial color="#808080" />
      </Plane>

      {/* Lighting */}
      <ambientLight intensity={getAmbientIntensity(timeOfDay)} />
      <directionalLight 
        position={[20, 30, 20]} 
        intensity={timeOfDay > 6 && timeOfDay < 20 ? 2 : 0.5} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <hemisphereLight color="#87ceeb" groundColor="#3d6b4a" intensity={0.5} />

      {/* House structure */}
      <group position={[centerOffset, 0, 0]}>
        {rooms.map((room, index) => {
          let xOffset = 0;
          for (let i = 0; i < index; i++) {
            xOffset += rooms[i].breadth + 0.2;
          }
          
          return (
            <RoomComponent
              key={index}
              position={[xOffset + room.breadth / 2, 0, 0]}
              size={[room.breadth, roomHeight, room.length]}
              name={room.roomName}
              styleConfig={styleConfig}
              showMeasurements={showMeasurements}
              roomIndex={index}
              isFirst={index === 0}
              isLast={index === rooms.length - 1}
            />
          );
        })}

        {/* Furniture */}
        {furniture.map(item => (
          <Furniture key={item.id} item={item} onDrag={onUpdateFurniture} />
        ))}
      </group>

      {/* Roof */}
      <Roof width={totalWidth} depth={maxDepth} height={roomHeight} styleConfig={styleConfig} />

      {/* External features */}
      <ExternalFeatures houseWidth={totalWidth} houseDepth={maxDepth} styleConfig={styleConfig} />
    </group>
  );
}

export default function HouseModel3D({ 
  rooms, 
  style, 
  onVRStatusChange,
  timeOfDay = 12,
  showMeasurements = false
}: HouseModel3DProps) {
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [currentTime, setCurrentTime] = useState(timeOfDay);
  const [measurementsVisible, setMeasurementsVisible] = useState(showMeasurements);
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [showFurnitureMenu, setShowFurnitureMenu] = useState(false);
  const [showExporter, setShowExporter] = useState(false);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const store = createXRStore();

  // Check for empty rooms
  const hasRooms = rooms && rooms.length > 0;

  const addFurniture = (type: FurnitureItem['type']) => {
    const newItem: FurnitureItem = {
      id: `furniture-${Date.now()}`,
      type,
      position: [0, 0, 0],
      rotation: 0,
      roomIndex: 0
    };
    setFurniture([...furniture, newItem]);
    setShowFurnitureMenu(false);
  };

  const updateFurniturePosition = (id: string, position: [number, number, number]) => {
    setFurniture(furniture.map(item => item.id === id ? { ...item, position } : item));
  };

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
        {/* Time of Day */}
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

        <div className="flex gap-2">
          <Button
            variant={measurementsVisible ? "default" : "outline"}
            size="sm"
            onClick={() => setMeasurementsVisible(!measurementsVisible)}
            className="bg-white/90 backdrop-blur-sm"
          >
            <Ruler className="w-4 h-4 mr-2" />
            Measurements
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFurnitureMenu(!showFurnitureMenu)}
              className="bg-white/90 backdrop-blur-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Furniture
            </Button>
            {showFurnitureMenu && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg p-2 min-w-[150px] z-20">
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2" onClick={() => addFurniture('sofa')}>
                  <Sofa className="w-4 h-4" /> Sofa
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2" onClick={() => addFurniture('bed')}>
                  <Bed className="w-4 h-4" /> Bed
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2" onClick={() => addFurniture('table')}>
                  <Table className="w-4 h-4" /> Table
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2" onClick={() => addFurniture('chair')}>
                  <Table className="w-4 h-4" /> Chair
                </button>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExporter(!showExporter)}
            className="bg-white/90 backdrop-blur-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Model
          </Button>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows>
        <XR store={store}>
          <SceneCapture />
          <PerspectiveCamera makeDefault position={[25, 20, 35]} fov={50} />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={5}
            maxDistance={100}
            maxPolarAngle={Math.PI / 2.1}
          />
          <KeyboardControls />
          <House 
            rooms={rooms} 
            style={style} 
            timeOfDay={currentTime}
            showMeasurements={measurementsVisible}
            furniture={furniture}
            onUpdateFurniture={updateFurniturePosition}
          />
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
        <p>🖱️ <strong>Left Click + Drag</strong>: Rotate</p>
        <p>🖱️ <strong>Right Click + Drag</strong>: Pan</p>
        <p>🔄 <strong>Scroll</strong>: Zoom</p>
        <p>⌨️ <strong>W/↑</strong>: Move forward</p>
        <p>⌨️ <strong>S/↓</strong>: Move backward</p>
        <p>⌨️ <strong>A/←</strong>: Move left</p>
        <p>⌨️ <strong>D/→</strong>: Move right</p>
      </div>

      {/* VR Button */}
      {isVRSupported && (
        <Button
          className="absolute bottom-4 right-4"
          onClick={() => store.enterVR()}
        >
          Enter VR
        </Button>
      )}
    </div>
  );
}