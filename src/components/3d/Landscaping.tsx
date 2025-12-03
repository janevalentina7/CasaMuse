import { useRef, useMemo } from 'react';
import { Cylinder, Sphere, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';

// Tree component with trunk and foliage
export function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const trunkHeight = 2 * scale;
  const foliageRadius = 1.5 * scale;
  
  return (
    <group position={position}>
      {/* Trunk */}
      <Cylinder args={[0.15 * scale, 0.2 * scale, trunkHeight, 8]} position={[0, trunkHeight / 2, 0]}>
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </Cylinder>
      {/* Foliage layers */}
      <Sphere args={[foliageRadius, 8, 8]} position={[0, trunkHeight + foliageRadius * 0.5, 0]}>
        <meshStandardMaterial color="#2d5a27" roughness={0.8} />
      </Sphere>
      <Sphere args={[foliageRadius * 0.8, 8, 8]} position={[0, trunkHeight + foliageRadius * 1.2, 0]}>
        <meshStandardMaterial color="#3d7a37" roughness={0.8} />
      </Sphere>
      <Sphere args={[foliageRadius * 0.5, 8, 8]} position={[0, trunkHeight + foliageRadius * 1.7, 0]}>
        <meshStandardMaterial color="#4d8a47" roughness={0.8} />
      </Sphere>
    </group>
  );
}

// Pine tree
export function PineTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const trunkHeight = 1.5 * scale;
  
  return (
    <group position={position}>
      {/* Trunk */}
      <Cylinder args={[0.1 * scale, 0.15 * scale, trunkHeight, 8]} position={[0, trunkHeight / 2, 0]}>
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </Cylinder>
      {/* Cone foliage layers */}
      <mesh position={[0, trunkHeight + 0.5 * scale, 0]}>
        <coneGeometry args={[1.2 * scale, 2 * scale, 8]} />
        <meshStandardMaterial color="#1a4d1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, trunkHeight + 1.5 * scale, 0]}>
        <coneGeometry args={[0.9 * scale, 1.5 * scale, 8]} />
        <meshStandardMaterial color="#236b23" roughness={0.8} />
      </mesh>
      <mesh position={[0, trunkHeight + 2.2 * scale, 0]}>
        <coneGeometry args={[0.6 * scale, 1 * scale, 8]} />
        <meshStandardMaterial color="#2d7a2d" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Bush/shrub component
export function Bush({ position, scale = 1, color = '#3d6b3d' }: { position: [number, number, number]; scale?: number; color?: string }) {
  return (
    <group position={position}>
      <Sphere args={[0.5 * scale, 8, 8]} position={[0, 0.3 * scale, 0]}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </Sphere>
      <Sphere args={[0.4 * scale, 8, 8]} position={[0.3 * scale, 0.25 * scale, 0.2 * scale]}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </Sphere>
      <Sphere args={[0.35 * scale, 8, 8]} position={[-0.25 * scale, 0.2 * scale, -0.15 * scale]}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </Sphere>
    </group>
  );
}

// Flower bed
export function FlowerBed({ position, size = [3, 2] }: { position: [number, number, number]; size?: [number, number] }) {
  const flowers = useMemo(() => {
    const arr: { pos: [number, number, number]; color: string }[] = [];
    const colors = ['#ff6b6b', '#ffd93d', '#ff8fab', '#c9f4aa', '#a8e6cf'];
    for (let i = 0; i < 15; i++) {
      arr.push({
        pos: [(Math.random() - 0.5) * size[0], 0.15, (Math.random() - 0.5) * size[1]],
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    return arr;
  }, [size]);

  return (
    <group position={position}>
      {/* Soil bed */}
      <Box args={[size[0], 0.15, size[1]]} position={[0, 0.075, 0]}>
        <meshStandardMaterial color="#5c4033" roughness={1} />
      </Box>
      {/* Flowers */}
      {flowers.map((flower, i) => (
        <group key={i} position={flower.pos}>
          <Cylinder args={[0.02, 0.02, 0.2, 4]} position={[0, 0.1, 0]}>
            <meshStandardMaterial color="#228b22" />
          </Cylinder>
          <Sphere args={[0.08, 6, 6]} position={[0, 0.25, 0]}>
            <meshStandardMaterial color={flower.color} />
          </Sphere>
        </group>
      ))}
    </group>
  );
}

// Garden path with stepping stones
export function GardenPath({ start, end, width = 0.8 }: { start: [number, number, number]; end: [number, number, number]; width?: number }) {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + Math.pow(end[2] - start[2], 2)
  );
  const angle = Math.atan2(end[2] - start[2], end[0] - start[0]);
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[2] + end[2]) / 2;

  const stones = useMemo(() => {
    const arr: { offset: number; size: number }[] = [];
    const numStones = Math.floor(length / 0.8);
    for (let i = 0; i < numStones; i++) {
      arr.push({
        offset: (i / numStones - 0.5) * length,
        size: 0.35 + Math.random() * 0.15
      });
    }
    return arr;
  }, [length]);

  return (
    <group position={[midX, 0.02, midZ]} rotation={[0, -angle + Math.PI / 2, 0]}>
      {stones.map((stone, i) => (
        <Cylinder
          key={i}
          args={[stone.size, stone.size, 0.05, 8]}
          position={[0, 0.025, stone.offset]}
          rotation={[0, Math.random() * Math.PI, 0]}
        >
          <meshStandardMaterial color="#8b8b8b" roughness={0.9} />
        </Cylinder>
      ))}
    </group>
  );
}

// Wooden fence section
export function FenceSection({ position, length = 4, rotation = 0 }: { position: [number, number, number]; length?: number; rotation?: number }) {
  const posts = Math.ceil(length / 1.5);
  const spacing = length / (posts - 1);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Posts */}
      {Array.from({ length: posts }).map((_, i) => (
        <Cylinder key={`post-${i}`} args={[0.05, 0.05, 1.2, 6]} position={[-length / 2 + i * spacing, 0.6, 0]}>
          <meshStandardMaterial color="#6b4423" roughness={0.8} />
        </Cylinder>
      ))}
      {/* Rails */}
      <Box args={[length, 0.08, 0.05]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#8b6914" roughness={0.7} />
      </Box>
      <Box args={[length, 0.08, 0.05]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#8b6914" roughness={0.7} />
      </Box>
    </group>
  );
}

// Outdoor bench
export function OutdoorBench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <Box args={[1.5, 0.08, 0.5]} position={[0, 0.45, 0]}>
        <meshStandardMaterial color="#8b6914" roughness={0.6} />
      </Box>
      {/* Back */}
      <Box args={[1.5, 0.5, 0.06]} position={[0, 0.75, -0.22]} rotation={[-0.15, 0, 0]}>
        <meshStandardMaterial color="#8b6914" roughness={0.6} />
      </Box>
      {/* Legs */}
      {[[-0.6, 0], [0.6, 0]].map(([x, z], i) => (
        <Box key={i} args={[0.06, 0.45, 0.4]} position={[x, 0.225, z]}>
          <meshStandardMaterial color="#4a3728" roughness={0.7} />
        </Box>
      ))}
      {/* Arm rests */}
      {[[-0.72, 0], [0.72, 0]].map(([x, z], i) => (
        <Box key={`arm-${i}`} args={[0.06, 0.3, 0.5]} position={[x, 0.6, z]}>
          <meshStandardMaterial color="#6b4423" roughness={0.6} />
        </Box>
      ))}
    </group>
  );
}

// Outdoor table with umbrella
export function PatioSet({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table */}
      <Cylinder args={[0.8, 0.8, 0.05, 16]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#8b6914" roughness={0.5} />
      </Cylinder>
      <Cylinder args={[0.05, 0.08, 0.75, 8]} position={[0, 0.375, 0]}>
        <meshStandardMaterial color="#4a3728" roughness={0.7} />
      </Cylinder>
      {/* Umbrella pole */}
      <Cylinder args={[0.03, 0.03, 2.5, 8]} position={[0, 1.25, 0]}>
        <meshStandardMaterial color="#333333" metalness={0.3} />
      </Cylinder>
      {/* Umbrella canopy */}
      <mesh position={[0, 2.4, 0]}>
        <coneGeometry args={[1.5, 0.5, 8]} />
        <meshStandardMaterial color="#c9a227" side={THREE.DoubleSide} />
      </mesh>
      {/* Chairs */}
      {[[1.2, 0], [-1.2, 0], [0, 1.2], [0, -1.2]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, Math.atan2(-x, -z), 0]}>
          <Box args={[0.5, 0.05, 0.5]} position={[0, 0.45, 0]}>
            <meshStandardMaterial color="#6b4423" roughness={0.6} />
          </Box>
          <Box args={[0.5, 0.4, 0.05]} position={[0, 0.65, -0.22]}>
            <meshStandardMaterial color="#6b4423" roughness={0.6} />
          </Box>
          {[[-0.2, 0.2], [0.2, 0.2], [-0.2, -0.2], [0.2, -0.2]].map(([lx, lz], j) => (
            <Cylinder key={j} args={[0.025, 0.025, 0.45, 6]} position={[lx, 0.225, lz]}>
              <meshStandardMaterial color="#4a3728" roughness={0.7} />
            </Cylinder>
          ))}
        </group>
      ))}
    </group>
  );
}

// Pond/water feature
export function Pond({ position, radius = 2 }: { position: [number, number, number]; radius?: number }) {
  return (
    <group position={position}>
      {/* Water surface */}
      <Cylinder args={[radius, radius, 0.1, 24]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#4a90a4" transparent opacity={0.8} metalness={0.3} roughness={0.1} />
      </Cylinder>
      {/* Stone border */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const r = radius + 0.15;
        return (
          <Sphere
            key={i}
            args={[0.2 + Math.random() * 0.1, 6, 6]}
            position={[Math.cos(angle) * r, 0.1, Math.sin(angle) * r]}
          >
            <meshStandardMaterial color="#808080" roughness={1} />
          </Sphere>
        );
      })}
    </group>
  );
}

// Complete landscaping component
interface LandscapingProps {
  houseWidth: number;
  houseDepth: number;
  style: string;
}

export default function Landscaping({ houseWidth, houseDepth, style }: LandscapingProps) {
  const gardenOffset = Math.max(houseWidth, houseDepth) / 2 + 5;
  
  // Style-specific landscaping colors
  const styleColors: Record<string, { bush: string; flower: string }> = {
    Modern: { bush: '#2d5a27', flower: '#ff6b6b' },
    Contemporary: { bush: '#3d6b3d', flower: '#ffd93d' },
    Traditional: { bush: '#4a7c4a', flower: '#ff8fab' },
    Mediterranean: { bush: '#5a8c5a', flower: '#ffa500' },
    Rustic: { bush: '#3d5a3d', flower: '#c9f4aa' },
  };
  
  const colors = styleColors[style] || styleColors.Modern;

  return (
    <group>
      {/* Trees around the property */}
      <Tree position={[-gardenOffset - 3, 0, -gardenOffset]} scale={1.5} />
      <Tree position={[gardenOffset + 3, 0, -gardenOffset]} scale={1.2} />
      <PineTree position={[-gardenOffset - 5, 0, gardenOffset / 2]} scale={1.3} />
      <PineTree position={[gardenOffset + 5, 0, gardenOffset / 2]} scale={1.1} />
      <Tree position={[-gardenOffset, 0, gardenOffset + 3]} scale={1.4} />
      <Tree position={[gardenOffset, 0, gardenOffset + 5]} scale={1.6} />
      
      {/* Bushes along the house */}
      <Bush position={[-houseWidth / 2 - 1, 0, houseDepth / 2 + 1]} scale={1.2} color={colors.bush} />
      <Bush position={[houseWidth / 2 + 1, 0, houseDepth / 2 + 1]} scale={1} color={colors.bush} />
      <Bush position={[-houseWidth / 2 - 1.5, 0, -houseDepth / 4]} scale={0.8} color={colors.bush} />
      <Bush position={[houseWidth / 2 + 1.5, 0, -houseDepth / 4]} scale={0.9} color={colors.bush} />
      
      {/* Flower beds */}
      <FlowerBed position={[houseWidth / 2 + 3, 0, houseDepth / 4]} size={[2, 3]} />
      <FlowerBed position={[-houseWidth / 2 - 3, 0, houseDepth / 4]} size={[2, 3]} />
      
      {/* Garden path */}
      <GardenPath 
        start={[0, 0, houseDepth / 2 + 2]} 
        end={[0, 0, houseDepth / 2 + 12]} 
        width={1}
      />
      
      {/* Side path */}
      <GardenPath 
        start={[-houseWidth / 2 - 1, 0, 0]} 
        end={[-gardenOffset - 2, 0, 0]} 
        width={0.6}
      />
      
      {/* Fence around backyard */}
      <FenceSection position={[-gardenOffset, 0, -houseDepth / 2]} length={6} rotation={0} />
      <FenceSection position={[gardenOffset, 0, -houseDepth / 2]} length={6} rotation={0} />
      <FenceSection position={[-gardenOffset - 3, 0, 0]} length={houseDepth} rotation={Math.PI / 2} />
      <FenceSection position={[gardenOffset + 3, 0, 0]} length={houseDepth} rotation={Math.PI / 2} />
      
      {/* Patio furniture */}
      <PatioSet position={[houseWidth / 2 + 5, 0, -houseDepth / 4]} />
      <OutdoorBench position={[-houseWidth / 2 - 4, 0, houseDepth / 3]} rotation={Math.PI / 2} />
      
      {/* Small decorative pond */}
      <Pond position={[-houseWidth / 2 - 6, 0, -houseDepth / 3]} radius={1.5} />
    </group>
  );
}
