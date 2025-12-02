import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Box, Plane, Text, Line } from '@react-three/drei';
import { createXRStore, XR } from '@react-three/xr';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Furniture, { FurnitureItem } from './Furniture';
import ModelExporter from './ModelExporter';
import { Plus, Sofa, Bed, Table, Trash2, Download } from 'lucide-react';

interface Room {
  roomName: string;
  length: number;
  breadth: number;
}

interface HouseModel3DProps {
  rooms: Room[];
  style: string;
  onVRStatusChange?: (isVR: boolean) => void;
  timeOfDay?: number; // 0-24 hours
  showMeasurements?: boolean;
}

// Keyboard controls component
function KeyboardControls() {
  const { camera } = useThree();
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const speed = 0.1;
    const direction = new THREE.Vector3();

    if (keys['w'] || keys['arrowup']) {
      camera.getWorldDirection(direction);
      camera.position.addScaledVector(direction, speed);
    }
    if (keys['s'] || keys['arrowdown']) {
      camera.getWorldDirection(direction);
      camera.position.addScaledVector(direction, -speed);
    }
    if (keys['a'] || keys['arrowleft']) {
      camera.getWorldDirection(direction);
      direction.cross(camera.up);
      camera.position.addScaledVector(direction, -speed);
    }
    if (keys['d'] || keys['arrowright']) {
      camera.getWorldDirection(direction);
      direction.cross(camera.up);
      camera.position.addScaledVector(direction, speed);
    }
  });

  return null;
}

// Measurement line component
function MeasurementLine({ 
  start, 
  end, 
  label 
}: { 
  start: [number, number, number]; 
  end: [number, number, number]; 
  label: string;
}) {
  const midpoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];

  return (
    <group>
      <Line
        points={[start, end]}
        color="#ff0000"
        lineWidth={2}
      />
      <Text
        position={midpoint}
        fontSize={0.3}
        color="#ff0000"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

// Room component
function Room({ 
  position, 
  size, 
  name, 
  color,
  showMeasurements
}: { 
  position: [number, number, number]; 
  size: [number, number, number]; 
  name: string;
  color: string;
  showMeasurements: boolean;
}) {
  const [px, py, pz] = position;
  
  return (
    <group position={position}>
      {/* Floor */}
      <Plane 
        args={[size[0], size[2]]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color={color} 
          side={THREE.DoubleSide}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.1}
          roughness={0.8}
        />
      </Plane>

      {/* Walls - Enhanced for VR visibility */}
      {/* Back wall */}
      <Box 
        args={[size[0], size[1], 0.2]} 
        position={[0, size[1] / 2, -size[2] / 2]}
      >
        <meshStandardMaterial 
          color="#f5f5f5" 
          side={THREE.DoubleSide}
          emissive="#f5f5f5"
          emissiveIntensity={0.4}
          metalness={0.05}
          roughness={0.9}
        />
      </Box>

      {/* Front wall (with opening) */}
      <Box 
        args={[size[0], size[1], 0.2]} 
        position={[0, size[1] / 2, size[2] / 2]}
      >
        <meshStandardMaterial 
          color="#e8e8e8" 
          transparent 
          opacity={0.5} 
          side={THREE.DoubleSide}
          emissive="#e8e8e8"
          emissiveIntensity={0.2}
        />
      </Box>

      {/* Left wall */}
      <Box 
        args={[0.2, size[1], size[2]]} 
        position={[-size[0] / 2, size[1] / 2, 0]}
      >
        <meshStandardMaterial 
          color="#e8e8e8" 
          side={THREE.DoubleSide}
          emissive="#e8e8e8"
          emissiveIntensity={0.3}
        />
      </Box>

      {/* Right wall */}
      <Box 
        args={[0.2, size[1], size[2]]} 
        position={[size[0] / 2, size[1] / 2, 0]}
      >
        <meshStandardMaterial 
          color="#e8e8e8" 
          side={THREE.DoubleSide}
          emissive="#e8e8e8"
          emissiveIntensity={0.3}
        />
      </Box>

      {/* Room label */}
      <Text
        position={[0, size[1] + 0.5, 0]}
        fontSize={0.5}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>

      {/* Measurements */}
      {showMeasurements && (
        <>
          {/* Width measurement */}
          <MeasurementLine
            start={[-size[0]/2, 0.1, size[2]/2 + 0.5] as [number, number, number]}
            end={[size[0]/2, 0.1, size[2]/2 + 0.5] as [number, number, number]}
            label={`${size[0].toFixed(1)}ft`}
          />
          {/* Depth measurement */}
          <MeasurementLine
            start={[size[0]/2 + 0.5, 0.1, -size[2]/2] as [number, number, number]}
            end={[size[0]/2 + 0.5, 0.1, size[2]/2] as [number, number, number]}
            label={`${size[2].toFixed(1)}ft`}
          />
        </>
      )}
    </group>
  );
}

// Dynamic lighting component
function DynamicLighting({ timeOfDay }: { timeOfDay: number }) {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  
  useFrame(() => {
    if (sunRef.current) {
      // Sun position changes based on time (0-24 hours)
      const angle = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2;
      const radius = 30;
      sunRef.current.position.x = Math.cos(angle) * radius;
      sunRef.current.position.y = Math.abs(Math.sin(angle)) * 20 + 5;
      sunRef.current.position.z = Math.sin(angle) * radius;
      
      // Sun intensity changes (brighter during day)
      const dayProgress = Math.sin(angle + Math.PI / 2);
      sunRef.current.intensity = Math.max(0.3, dayProgress * 2);
      
      // Sun color changes (warmer at sunrise/sunset)
      const warmth = Math.abs(Math.cos(angle));
      sunRef.current.color.setRGB(
        1,
        0.9 + warmth * 0.1,
        0.7 + warmth * 0.3
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        ref={sunRef} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <hemisphereLight 
        color="#87CEEB" 
        groundColor="#90EE90" 
        intensity={0.5} 
      />
    </>
  );
}

// House component with auto-rotation
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
  const colors = [
    '#f0f0f0', '#e0e0f0', '#f0e0e0', '#e0f0e0', 
    '#f0e0f0', '#e0f0f0', '#f0f0e0'
  ];

  let xOffset = 0;
  const roomHeight = 3;

  // Smooth auto-rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15; // Smooth, time-based rotation
    }
  });

  // Sky color changes with time of day
  const getSkyColor = (time: number) => {
    const hour = time % 24;
    if (hour < 6 || hour > 20) return "#1a1a2e"; // Night
    if (hour < 8 || hour > 18) return "#ff8c69"; // Sunrise/Sunset
    return "#87CEEB"; // Day
  };

  // Calculate total house dimensions for proper centering
  const totalWidth = rooms.reduce((sum, room) => sum + room.breadth + 1, -1);
  const centerOffset = -totalWidth / 2;

  return (
    <group ref={groupRef}>
      {/* Ground plane - smaller and positioned correctly for VR */}
      <Plane 
        args={[80, 80]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#3d6b4a" 
          side={THREE.DoubleSide}
        />
      </Plane>

      {/* Grass texture around the house */}
      <Plane 
        args={[60, 60]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.02, 0]}
      >
        <meshStandardMaterial 
          color="#4a8c5a" 
          side={THREE.DoubleSide}
        />
      </Plane>

      {/* Dynamic lighting based on time of day */}
      <DynamicLighting timeOfDay={timeOfDay} />

      {/* Main sun light */}
      <directionalLight 
        position={[15, 20, 15]} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Fill lights for VR visibility */}
      <pointLight position={[0, 15, 0]} intensity={2} distance={50} color="#ffffff" />
      <pointLight position={[20, 10, 20]} intensity={1.5} distance={40} color="#fffaf0" />
      <pointLight position={[-20, 10, -20]} intensity={1.5} distance={40} color="#fffaf0" />
      <pointLight position={[20, 10, -20]} intensity={1.5} distance={40} color="#fffaf0" />
      <pointLight position={[-20, 10, 20]} intensity={1.5} distance={40} color="#fffaf0" />
      
      {/* Per-room lighting */}
      {(() => {
        let lightOffset = centerOffset;
        return rooms.map((room, index) => {
          const roomWidth = room.breadth;
          const xPos = lightOffset + roomWidth / 2;
          lightOffset += roomWidth + 1;
          
          return (
            <group key={`lights-${index}`}>
              <pointLight 
                position={[xPos, roomHeight - 0.3, 0]} 
                intensity={1.5} 
                distance={roomWidth * 2}
                decay={2}
                color="#ffffee"
              />
              <spotLight
                position={[xPos, roomHeight + 0.5, 0]}
                angle={Math.PI / 3}
                penumbra={0.5}
                intensity={1}
                distance={roomWidth * 2}
                color="#ffffff"
              />
            </group>
          );
        });
      })()}

      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[45, 32, 32]} />
        <meshBasicMaterial color={getSkyColor(timeOfDay)} side={THREE.BackSide} />
      </mesh>

      {/* House model - centered */}
      <group position={[centerOffset, 0, 0]}>
        {rooms.map((room, index) => {
          const roomWidth = room.breadth;
          const roomDepth = room.length;
          let roomOffset = 0;
          for (let i = 0; i < index; i++) {
            roomOffset += rooms[i].breadth + 1;
          }
          const position: [number, number, number] = [roomOffset + roomWidth / 2, 0, 0];

          return (
            <Room
              key={index}
              position={position}
              size={[roomWidth, roomHeight, roomDepth]}
              name={room.roomName}
              color={colors[index % colors.length]}
              showMeasurements={showMeasurements}
            />
          );
        })}

        {/* Furniture */}
        {furniture.map(item => (
          <Furniture
            key={item.id}
            item={item}
            onDrag={onUpdateFurniture}
          />
        ))}
      </group>

      {/* Simple roof structure */}
      <group position={[0, roomHeight, 0]}>
        <Box args={[totalWidth + 2, 0.3, Math.max(...rooms.map(r => r.length)) + 2]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
      </group>
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
    setFurniture(furniture.map(item => 
      item.id === id ? { ...item, position } : item
    ));
  };

  const removeFurniture = (id: string) => {
    setFurniture(furniture.filter(item => item.id !== id));
  };

  // Scene capture component
  function SceneCapture() {
    const { scene } = useThree();
    
    useEffect(() => {
      setScene(scene);
    }, [scene]);
    
    return null;
  }

  useEffect(() => {
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-vr').then((supported: boolean) => {
        setIsVRSupported(supported);
      });
    }
  }, []);

  const handleEnterVR = async () => {
    try {
      await store.enterVR();
      onVRStatusChange?.(true);
    } catch (error) {
      console.error('Failed to enter VR:', error);
    }
  };

  const getTimeLabel = (hour: number) => {
    const h = Math.floor(hour) % 24;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-sky-200 to-sky-100 rounded-lg overflow-hidden relative">
      <Canvas
        shadows
        gl={{ antialias: true }}
      >
        <XR store={store}>
          <SceneCapture />
          <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={75} />
          
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            minDistance={3}
            maxDistance={60}
            maxPolarAngle={Math.PI / 2.1}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={false}
            mouseButtons={{
              LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.PAN
            }}
          />

          <KeyboardControls />
          
          {/* Enhanced ambient lighting for VR visibility */}
          <ambientLight intensity={1.2} />
          <hemisphereLight 
            color="#ffffff" 
            groundColor="#cccccc" 
            intensity={1}
            position={[0, 50, 0]}
          />
          
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

      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex gap-2 justify-between">
        {/* Time of Day Control */}
        <div className="bg-background/90 backdrop-blur-sm p-3 rounded-lg border border-border/50 flex-1 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold">☀️ Time of Day:</span>
            <span className="text-xs text-muted-foreground">{getTimeLabel(currentTime)}</span>
          </div>
          <Slider
            value={[currentTime]}
            onValueChange={(value) => setCurrentTime(value[0])}
            min={0}
            max={24}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Measurement Toggle */}
        <Button
          variant={measurementsVisible ? "default" : "outline"}
          size="sm"
          onClick={() => setMeasurementsVisible(!measurementsVisible)}
          className="bg-background/90 backdrop-blur-sm"
        >
          📏 Measurements
        </Button>

        {/* Furniture Menu */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFurnitureMenu(!showFurnitureMenu)}
            className="bg-background/90 backdrop-blur-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Furniture
          </Button>
          
          {showFurnitureMenu && (
            <div className="absolute top-full mt-2 right-0 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-2 flex flex-col gap-1 z-10">
              <Button size="sm" variant="ghost" onClick={() => addFurniture('sofa')}>
                <Sofa className="w-4 h-4 mr-2" /> Sofa
              </Button>
              <Button size="sm" variant="ghost" onClick={() => addFurniture('bed')}>
                <Bed className="w-4 h-4 mr-2" /> Bed
              </Button>
              <Button size="sm" variant="ghost" onClick={() => addFurniture('table')}>
                <Table className="w-4 h-4 mr-2" /> Table
              </Button>
              <Button size="sm" variant="ghost" onClick={() => addFurniture('chair')}>
                Chair
              </Button>
              <Button size="sm" variant="ghost" onClick={() => addFurniture('cabinet')}>
                Cabinet
              </Button>
              <Button size="sm" variant="ghost" onClick={() => addFurniture('desk')}>
                Desk
              </Button>
            </div>
          )}
        </div>

        {/* Download Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExporter(!showExporter)}
          className="bg-background/90 backdrop-blur-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Model
        </Button>

        {/* VR Button */}
        {isVRSupported && (
          <Button
            variant="hero"
            size="sm"
            onClick={handleEnterVR}
            className="shadow-lg"
          >
            🥽 Enter VR
          </Button>
        )}
      </div>

      {/* Model Exporter */}
      {showExporter && scene && (
        <ModelExporter scene={scene} fileName={`house-${style.toLowerCase()}`} />
      )}

      {/* Controls info overlay */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-border/50 max-w-xs">
        <h3 className="font-semibold text-sm mb-2">Controls:</h3>
        <ul className="text-xs space-y-1 text-muted-foreground">
          <li>🖱️ <strong>Left Click + Drag</strong>: Rotate view</li>
          <li>🖱️ <strong>Right Click + Drag</strong>: Pan view</li>
          <li>🎯 <strong>Scroll</strong>: Zoom in/out</li>
          <li>⌨️ <strong>W/↑</strong>: Move forward</li>
          <li>⌨️ <strong>S/↓</strong>: Move backward</li>
          <li>⌨️ <strong>A/←</strong>: Move left</li>
          <li>⌨️ <strong>D/→</strong>: Move right</li>
          <li>☀️ <strong>Slider</strong>: Change time of day</li>
          <li>📏 <strong>Toggle</strong>: Show/hide measurements</li>
          <li>🪑 <strong>Furniture</strong>: Click to drag and place</li>
          {isVRSupported && (
            <>
              <li>🥽 <strong>VR Mode</strong>: Click "Enter VR" button</li>
              <li>🎮 <strong>VR Controls</strong>: Walk with controllers</li>
            </>
          )}
        </ul>
      </div>

      {/* Furniture list */}
      {furniture.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border border-border/50 max-w-xs">
          <h3 className="font-semibold text-sm mb-2">Furniture ({furniture.length})</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {furniture.map(item => (
              <div key={item.id} className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded">
                <span>{item.type}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFurniture(item.id)}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
