import { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Box, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';

export interface FurnitureItem {
  id: string;
  type: 'sofa' | 'bed' | 'table' | 'chair' | 'cabinet' | 'desk';
  position: [number, number, number];
  rotation: number;
  roomIndex: number;
}

interface FurnitureProps {
  item: FurnitureItem;
  onDragStart?: (id: string) => void;
  onDrag?: (id: string, position: [number, number, number]) => void;
  onDragEnd?: (id: string) => void;
}

const furnitureModels = {
  sofa: { size: [2, 0.8, 0.8], color: '#8B4513' },
  bed: { size: [2, 0.5, 1.5], color: '#654321' },
  table: { size: [1.5, 0.8, 1], color: '#8B7355' },
  chair: { size: [0.5, 1, 0.5], color: '#A0522D' },
  cabinet: { size: [1, 1.5, 0.5], color: '#8B6914' },
  desk: { size: [1.5, 0.8, 0.8], color: '#B8860B' },
};

export function Furniture({ item, onDragStart, onDrag, onDragEnd }: FurnitureProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const model = furnitureModels[item.type];
  const [width, height, depth] = model.size;

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    onDragStart?.(item.id);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && meshRef.current) {
      const newPosition: [number, number, number] = [
        e.point.x,
        item.position[1],
        e.point.z
      ];
      onDrag?.(item.id, newPosition);
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.(item.id);
    }
  };

  return (
    <group
      position={item.position}
      rotation={[0, item.rotation, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <Box
        ref={meshRef}
        args={[width, height, depth]}
        position={[0, height / 2, 0]}
      >
        <meshStandardMaterial
          color={model.color}
          emissive={hovered ? '#ff6b6b' : model.color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={isDragging ? 0.7 : 1}
        />
      </Box>
      
      {/* Furniture label */}
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.2}
        color={hovered ? '#ff6b6b' : '#666666'}
        anchorX="center"
        anchorY="middle"
      >
        {item.type}
      </Text>

      {/* Shadow indicator */}
      {isDragging && (
        <Cylinder args={[Math.max(width, depth) / 2, Math.max(width, depth) / 2, 0.05, 16]}>
          <meshBasicMaterial color="#000000" transparent opacity={0.3} />
        </Cylinder>
      )}
    </group>
  );
}

export default Furniture;
