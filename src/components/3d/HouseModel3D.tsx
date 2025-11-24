import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Box, Plane, Text } from '@react-three/drei';
import { createXRStore, XR } from '@react-three/xr';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';

interface Room {
  roomName: string;
  length: number;
  breadth: number;
}

interface HouseModel3DProps {
  rooms: Room[];
  style: string;
  onVRStatusChange?: (isVR: boolean) => void;
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

// Room component
function Room({ 
  position, 
  size, 
  name, 
  color 
}: { 
  position: [number, number, number]; 
  size: [number, number, number]; 
  name: string;
  color: string;
}) {
  return (
    <group position={position}>
      {/* Floor */}
      <Plane 
        args={[size[0], size[2]]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </Plane>

      {/* Walls */}
      {/* Back wall */}
      <Box 
        args={[size[0], size[1], 0.2]} 
        position={[0, size[1] / 2, -size[2] / 2]}
      >
        <meshStandardMaterial color="#e8e8e8" side={THREE.DoubleSide} />
      </Box>

      {/* Front wall (with opening) */}
      <Box 
        args={[size[0], size[1], 0.2]} 
        position={[0, size[1] / 2, size[2] / 2]}
      >
        <meshStandardMaterial color="#e8e8e8" transparent opacity={0.5} side={THREE.DoubleSide} />
      </Box>

      {/* Left wall */}
      <Box 
        args={[0.2, size[1], size[2]]} 
        position={[-size[0] / 2, size[1] / 2, 0]}
      >
        <meshStandardMaterial color="#e8e8e8" side={THREE.DoubleSide} />
      </Box>

      {/* Right wall */}
      <Box 
        args={[0.2, size[1], size[2]]} 
        position={[size[0] / 2, size[1] / 2, 0]}
      >
        <meshStandardMaterial color="#e8e8e8" side={THREE.DoubleSide} />
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
    </group>
  );
}

// House component
function House({ rooms, style }: { rooms: Room[]; style: string }) {
  const colors = [
    '#f0f0f0', '#e0e0f0', '#f0e0e0', '#e0f0e0', 
    '#f0e0f0', '#e0f0f0', '#f0f0e0'
  ];

  let xOffset = 0;
  const roomHeight = 3;

  return (
    <group>
      {/* Ground plane - visible from both sides for VR */}
      <Plane 
        args={[100, 100]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]}
      >
        <meshStandardMaterial color="#90EE90" side={THREE.DoubleSide} />
      </Plane>

      {/* Enhanced lighting for VR visibility */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.8} />
      <directionalLight position={[0, 10, 10]} intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={0.5} />

      {/* Sky - visible from inside for VR */}
      <mesh>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>

      {/* Rooms */}
      {rooms.map((room, index) => {
        const roomWidth = room.breadth;
        const roomDepth = room.length;
        const position: [number, number, number] = [xOffset + roomWidth / 2, 0, 0];
        
        xOffset += roomWidth + 1; // Add spacing between rooms

        return (
          <Room
            key={index}
            position={position}
            size={[roomWidth, roomHeight, roomDepth]}
            name={room.roomName}
            color={colors[index % colors.length]}
          />
        );
      })}
    </group>
  );
}

export default function HouseModel3D({ rooms, style, onVRStatusChange }: HouseModel3DProps) {
  const [isVRSupported, setIsVRSupported] = useState(false);
  const store = createXRStore();

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

  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-sky-200 to-sky-100 rounded-lg overflow-hidden relative">
      <Canvas
        shadows
        gl={{ antialias: true }}
      >
        <XR store={store}>
          <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={75} />
          
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2}
          />

          <KeyboardControls />
          
          <House rooms={rooms} style={style} />
        </XR>
      </Canvas>

      {/* VR Button */}
      {isVRSupported && (
        <div className="absolute top-4 right-4">
          <Button
            variant="hero"
            size="lg"
            className="shadow-lg"
            onClick={handleEnterVR}
          >
            🥽 Enter VR
          </Button>
        </div>
      )}

      {/* Controls info overlay */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-border/50 max-w-xs">
        <h3 className="font-semibold text-sm mb-2">Controls:</h3>
        <ul className="text-xs space-y-1 text-muted-foreground">
          <li>🖱️ <strong>Mouse</strong>: Rotate view (drag)</li>
          <li>🎯 <strong>Scroll</strong>: Zoom in/out</li>
          <li>⌨️ <strong>W/↑</strong>: Move forward</li>
          <li>⌨️ <strong>S/↓</strong>: Move backward</li>
          <li>⌨️ <strong>A/←</strong>: Move left</li>
          <li>⌨️ <strong>D/→</strong>: Move right</li>
          {isVRSupported && (
            <>
              <li>🥽 <strong>VR Mode</strong>: Click "Enter VR" button</li>
              <li>🎮 <strong>VR Controls</strong>: Use controllers to navigate</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
