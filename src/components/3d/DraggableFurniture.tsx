import { useRef, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface DraggableObjectProps {
  children: React.ReactNode;
  position: [number, number, number];
  onPositionChange?: (newPosition: [number, number, number]) => void;
  bounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
  name?: string;
}

export function DraggableObject({ 
  children, 
  position, 
  onPositionChange,
  bounds,
  name = "Object"
}: DraggableObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number, number]>(position);
  const { camera, raycaster, gl } = useThree();
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersection = useRef(new THREE.Vector3());

  const handlePointerDown = useCallback((e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
  }, [gl]);

  const handlePointerUp = useCallback((e: any) => {
    if (isDragging && onPositionChange) {
      onPositionChange(currentPosition);
    }
    setIsDragging(false);
    gl.domElement.style.cursor = isHovered ? 'grab' : 'auto';
  }, [isDragging, currentPosition, onPositionChange, gl, isHovered]);

  const handlePointerMove = useCallback((e: any) => {
    if (!isDragging || !groupRef.current) return;
    
    const mousePos = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    
    raycaster.setFromCamera(mousePos, camera);
    
    if (raycaster.ray.intersectPlane(plane.current, intersection.current)) {
      let newX = intersection.current.x;
      let newZ = intersection.current.z;
      
      // Apply bounds if specified
      if (bounds) {
        newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
        newZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, newZ));
      }
      
      setCurrentPosition([newX, currentPosition[1], newZ]);
    }
  }, [isDragging, camera, raycaster, bounds, currentPosition]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...currentPosition);
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        gl.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
        if (!isDragging) {
          gl.domElement.style.cursor = 'auto';
        }
      }}
    >
      {children}
      {/* Highlight ring when hovered or dragging */}
      {(isHovered || isDragging) && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[0.8, 1, 32]} />
            <meshBasicMaterial color={isDragging ? "#4ade80" : "#60a5fa"} transparent opacity={0.5} />
          </mesh>
          {/* Label */}
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.2}
            color={isDragging ? "#4ade80" : "#60a5fa"}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {isDragging ? "Release to place" : `${name} (drag to move)`}
          </Text>
        </group>
      )}
    </group>
  );
}

// Furniture catalog for drag-and-drop placement
interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  component: React.ReactNode;
}

export const furnitureCatalog: FurnitureItem[] = [
  {
    id: 'sofa-1',
    name: 'Modern Sofa',
    category: 'Living Room',
    component: (
      <group>
        <Box args={[2, 0.4, 0.9]} position={[0, 0.3, 0]}>
          <meshStandardMaterial color="#5a4a3a" />
        </Box>
        <Box args={[2, 0.5, 0.25]} position={[0, 0.55, -0.32]}>
          <meshStandardMaterial color="#5a4a3a" />
        </Box>
        <Box args={[0.2, 0.35, 0.9]} position={[-0.9, 0.37, 0]}>
          <meshStandardMaterial color="#5a4a3a" />
        </Box>
        <Box args={[0.2, 0.35, 0.9]} position={[0.9, 0.37, 0]}>
          <meshStandardMaterial color="#5a4a3a" />
        </Box>
      </group>
    )
  },
  {
    id: 'table-1',
    name: 'Coffee Table',
    category: 'Living Room',
    component: (
      <group>
        <Box args={[1.2, 0.05, 0.6]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#8b6914" />
        </Box>
        <Box args={[0.05, 0.4, 0.05]} position={[-0.55, 0.2, -0.25]}>
          <meshStandardMaterial color="#6b4423" />
        </Box>
        <Box args={[0.05, 0.4, 0.05]} position={[0.55, 0.2, -0.25]}>
          <meshStandardMaterial color="#6b4423" />
        </Box>
        <Box args={[0.05, 0.4, 0.05]} position={[-0.55, 0.2, 0.25]}>
          <meshStandardMaterial color="#6b4423" />
        </Box>
        <Box args={[0.05, 0.4, 0.05]} position={[0.55, 0.2, 0.25]}>
          <meshStandardMaterial color="#6b4423" />
        </Box>
      </group>
    )
  },
  {
    id: 'chair-1',
    name: 'Dining Chair',
    category: 'Dining',
    component: (
      <group>
        <Box args={[0.45, 0.05, 0.45]} position={[0, 0.45, 0]}>
          <meshStandardMaterial color="#8b6914" />
        </Box>
        <Box args={[0.45, 0.5, 0.05]} position={[0, 0.7, -0.2]}>
          <meshStandardMaterial color="#8b6914" />
        </Box>
        <Cylinder args={[0.025, 0.025, 0.45, 8]} position={[-0.18, 0.225, -0.18]}>
          <meshStandardMaterial color="#4a3728" />
        </Cylinder>
        <Cylinder args={[0.025, 0.025, 0.45, 8]} position={[0.18, 0.225, -0.18]}>
          <meshStandardMaterial color="#4a3728" />
        </Cylinder>
        <Cylinder args={[0.025, 0.025, 0.45, 8]} position={[-0.18, 0.225, 0.18]}>
          <meshStandardMaterial color="#4a3728" />
        </Cylinder>
        <Cylinder args={[0.025, 0.025, 0.45, 8]} position={[0.18, 0.225, 0.18]}>
          <meshStandardMaterial color="#4a3728" />
        </Cylinder>
      </group>
    )
  },
  {
    id: 'plant-1',
    name: 'Indoor Plant',
    category: 'Decor',
    component: (
      <group>
        <Cylinder args={[0.15, 0.12, 0.25, 8]} position={[0, 0.125, 0]}>
          <meshStandardMaterial color="#8b4513" />
        </Cylinder>
        <Sphere args={[0.25, 8, 8]} position={[0, 0.45, 0]}>
          <meshStandardMaterial color="#228b22" />
        </Sphere>
        <Sphere args={[0.2, 8, 8]} position={[0.1, 0.6, 0.05]}>
          <meshStandardMaterial color="#2d7a2d" />
        </Sphere>
        <Sphere args={[0.18, 8, 8]} position={[-0.08, 0.55, -0.05]}>
          <meshStandardMaterial color="#3d8a3d" />
        </Sphere>
      </group>
    )
  },
  {
    id: 'lamp-1',
    name: 'Floor Lamp',
    category: 'Lighting',
    component: (
      <group>
        <Cylinder args={[0.15, 0.18, 0.05, 16]} position={[0, 0.025, 0]}>
          <meshStandardMaterial color="#333333" metalness={0.6} />
        </Cylinder>
        <Cylinder args={[0.02, 0.02, 1.5, 8]} position={[0, 0.775, 0]}>
          <meshStandardMaterial color="#333333" metalness={0.7} />
        </Cylinder>
        <mesh position={[0, 1.4, 0]}>
          <coneGeometry args={[0.2, 0.25, 16]} />
          <meshStandardMaterial color="#f5f5dc" side={THREE.DoubleSide} />
        </mesh>
      </group>
    )
  }
];

interface FurniturePlacementState {
  [id: string]: {
    position: [number, number, number];
    rotation: number;
  };
}

interface DraggableFurnitureManagerProps {
  initialPlacements?: FurniturePlacementState;
  onPlacementChange?: (placements: FurniturePlacementState) => void;
  roomBounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
  enabledItems?: string[];
}

export function DraggableFurnitureManager({
  initialPlacements = {},
  onPlacementChange,
  roomBounds,
  enabledItems
}: DraggableFurnitureManagerProps) {
  const [placements, setPlacements] = useState<FurniturePlacementState>(initialPlacements);

  const handlePositionChange = useCallback((id: string, newPosition: [number, number, number]) => {
    const newPlacements = {
      ...placements,
      [id]: { ...placements[id], position: newPosition }
    };
    setPlacements(newPlacements);
    onPlacementChange?.(newPlacements);
  }, [placements, onPlacementChange]);

  const itemsToRender = enabledItems 
    ? furnitureCatalog.filter(item => enabledItems.includes(item.id))
    : furnitureCatalog;

  return (
    <group>
      {itemsToRender.map((item) => {
        const placement = placements[item.id] || { position: [0, 0, 0] as [number, number, number], rotation: 0 };
        
        return (
          <DraggableObject
            key={item.id}
            position={placement.position}
            onPositionChange={(pos) => handlePositionChange(item.id, pos)}
            bounds={roomBounds}
            name={item.name}
          >
            {item.component}
          </DraggableObject>
        );
      })}
    </group>
  );
}

export default DraggableFurnitureManager;
