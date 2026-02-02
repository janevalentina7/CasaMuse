import { useMemo } from 'react';
import { Cylinder, Sphere, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';

// Realistic Pine Tree with detailed branches
export function RealisticPineTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const trunkHeight = 2 * scale;
  
  return (
    <group position={position}>
      {/* Trunk with bark texture feel */}
      <Cylinder args={[0.12 * scale, 0.18 * scale, trunkHeight, 12]} position={[0, trunkHeight / 2, 0]} castShadow>
        <meshStandardMaterial color="#3d2817" roughness={0.95} />
      </Cylinder>
      
      {/* Layered foliage cones */}
      {[0, 0.7, 1.3, 1.8, 2.2].map((y, i) => (
        <mesh key={i} position={[0, trunkHeight + y * scale, 0]} castShadow>
          <coneGeometry args={[(1.4 - i * 0.2) * scale, (1.2 - i * 0.1) * scale, 8]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? '#1a4d1a' : '#236b23'} 
            roughness={0.85} 
          />
        </mesh>
      ))}
    </group>
  );
}

// Deciduous tree with realistic canopy
export function RealisticTree({ position, scale = 1, variant = 'oak' }: { position: [number, number, number]; scale?: number; variant?: string }) {
  const trunkHeight = 2.5 * scale;
  const foliageColor = variant === 'maple' ? '#5a8a27' : variant === 'birch' ? '#4a9a3a' : '#2d6a27';
  
  return (
    <group position={position}>
      {/* Main trunk */}
      <Cylinder args={[0.15 * scale, 0.22 * scale, trunkHeight, 10]} position={[0, trunkHeight / 2, 0]} castShadow>
        <meshStandardMaterial color="#4a3020" roughness={0.9} />
      </Cylinder>
      
      {/* Branch stubs */}
      <Cylinder args={[0.04 * scale, 0.06 * scale, 0.4 * scale, 6]} position={[0.1, trunkHeight * 0.7, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <meshStandardMaterial color="#3a2818" roughness={0.9} />
      </Cylinder>
      <Cylinder args={[0.04 * scale, 0.06 * scale, 0.3 * scale, 6]} position={[-0.08, trunkHeight * 0.6, 0.05]} rotation={[0.3, 0, -Math.PI / 5]} castShadow>
        <meshStandardMaterial color="#3a2818" roughness={0.9} />
      </Cylinder>
      
      {/* Multi-sphere foliage for realistic canopy */}
      {[
        [0, 0, 0, 1.8],
        [0.6, 0.3, 0.4, 1.2],
        [-0.5, 0.2, 0.3, 1.1],
        [0.3, 0.5, -0.5, 1.0],
        [-0.3, 0.4, -0.4, 0.9],
        [0, 0.8, 0, 1.0],
      ].map(([x, y, z, r], i) => (
        <Sphere 
          key={i} 
          args={[r * scale, 10, 10]} 
          position={[x * scale, trunkHeight + 0.8 * scale + y * scale, z * scale]}
          castShadow
        >
          <meshStandardMaterial color={foliageColor} roughness={0.85} />
        </Sphere>
      ))}
    </group>
  );
}

// Detailed flowering bush
export function FloweringBush({ position, scale = 1, flowerColor = '#ff69b4' }: { position: [number, number, number]; scale?: number; flowerColor?: string }) {
  const flowers = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 12; i++) {
      arr.push([
        (Math.random() - 0.5) * 0.8 * scale,
        0.3 * scale + Math.random() * 0.4 * scale,
        (Math.random() - 0.5) * 0.8 * scale
      ]);
    }
    return arr;
  }, [scale]);

  return (
    <group position={position}>
      {/* Bush base */}
      <Sphere args={[0.5 * scale, 10, 10]} position={[0, 0.35 * scale, 0]}>
        <meshStandardMaterial color="#2d5a27" roughness={0.9} />
      </Sphere>
      <Sphere args={[0.4 * scale, 8, 8]} position={[0.25 * scale, 0.3 * scale, 0.15 * scale]}>
        <meshStandardMaterial color="#3d6a37" roughness={0.9} />
      </Sphere>
      <Sphere args={[0.35 * scale, 8, 8]} position={[-0.2 * scale, 0.28 * scale, -0.12 * scale]}>
        <meshStandardMaterial color="#2a5224" roughness={0.9} />
      </Sphere>
      
      {/* Flowers */}
      {flowers.map((pos, i) => (
        <Sphere key={i} args={[0.06 * scale, 6, 6]} position={pos}>
          <meshStandardMaterial color={flowerColor} roughness={0.7} />
        </Sphere>
      ))}
    </group>
  );
}

// Stone pathway with individual stones
export function StonePath({ start, end, width = 1 }: { start: [number, number, number]; end: [number, number, number]; width?: number }) {
  const length = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[2] - start[2], 2));
  const angle = Math.atan2(end[2] - start[2], end[0] - start[0]);
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[2] + end[2]) / 2;

  const stones = useMemo(() => {
    const arr: { offset: number; x: number; size: number; rotation: number }[] = [];
    const numStones = Math.floor(length / 0.5);
    for (let i = 0; i < numStones; i++) {
      arr.push({
        offset: (i / numStones - 0.5) * length,
        x: (Math.random() - 0.5) * width * 0.6,
        size: 0.25 + Math.random() * 0.15,
        rotation: Math.random() * Math.PI
      });
    }
    return arr;
  }, [length, width]);

  return (
    <group position={[midX, 0.02, midZ]} rotation={[0, -angle + Math.PI / 2, 0]}>
      {stones.map((stone, i) => (
        <Box
          key={i}
          args={[stone.size, 0.06, stone.size * 0.8]}
          position={[stone.x, 0.03, stone.offset]}
          rotation={[0, stone.rotation, 0]}
          receiveShadow
        >
          <meshStandardMaterial color={i % 3 === 0 ? '#707070' : i % 3 === 1 ? '#606060' : '#808080'} roughness={0.9} />
        </Box>
      ))}
    </group>
  );
}

// Garden fence with decorative tops
export function GardenFence({ position, length = 6, rotation = 0, style = 'picket' }: { position: [number, number, number]; length?: number; rotation?: number; style?: string }) {
  const posts = Math.ceil(length / 1.2);
  const spacing = length / (posts - 1);
  const pickets = Math.floor(length / 0.12);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {style === 'picket' ? (
        <>
          {/* Pickets */}
          {Array.from({ length: pickets }).map((_, i) => (
            <Box key={`picket-${i}`} args={[0.08, 1.1, 0.02]} position={[-length / 2 + i * 0.12, 0.55, 0]} castShadow>
              <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
            </Box>
          ))}
          {/* Picket tops (pointed) */}
          {Array.from({ length: pickets }).map((_, i) => (
            <mesh key={`top-${i}`} position={[-length / 2 + i * 0.12, 1.15, 0]} castShadow>
              <coneGeometry args={[0.04, 0.1, 4]} />
              <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
            </mesh>
          ))}
          {/* Rails */}
          <Box args={[length, 0.06, 0.04]} position={[0, 0.85, 0]}>
            <meshStandardMaterial color="#e8e8e8" roughness={0.7} />
          </Box>
          <Box args={[length, 0.06, 0.04]} position={[0, 0.25, 0]}>
            <meshStandardMaterial color="#e8e8e8" roughness={0.7} />
          </Box>
        </>
      ) : (
        <>
          {/* Wooden posts for rustic fence */}
          {Array.from({ length: posts }).map((_, i) => (
            <Cylinder key={`post-${i}`} args={[0.06, 0.06, 1.3, 8]} position={[-length / 2 + i * spacing, 0.65, 0]} castShadow>
              <meshStandardMaterial color="#5a4030" roughness={0.9} />
            </Cylinder>
          ))}
          {/* Horizontal rails */}
          <Box args={[length, 0.1, 0.06]} position={[0, 1.0, 0]}>
            <meshStandardMaterial color="#6b4a38" roughness={0.8} />
          </Box>
          <Box args={[length, 0.1, 0.06]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color="#6b4a38" roughness={0.8} />
          </Box>
        </>
      )}
    </group>
  );
}

// Decorative water fountain
export function WaterFountain({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base pool */}
      <Cylinder args={[1.5, 1.6, 0.4, 24]} position={[0, 0.2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#808080" roughness={0.7} />
      </Cylinder>
      {/* Water in base */}
      <Cylinder args={[1.35, 1.35, 0.05, 24]} position={[0, 0.38, 0]}>
        <meshStandardMaterial color="#4a9ae0" transparent opacity={0.7} roughness={0.1} metalness={0.2} />
      </Cylinder>
      
      {/* Center column */}
      <Cylinder args={[0.25, 0.3, 1.2, 16]} position={[0, 0.8, 0]} castShadow>
        <meshStandardMaterial color="#909090" roughness={0.6} />
      </Cylinder>
      
      {/* Middle tier */}
      <Cylinder args={[0.7, 0.75, 0.2, 16]} position={[0, 1.3, 0]} castShadow>
        <meshStandardMaterial color="#a0a0a0" roughness={0.6} />
      </Cylinder>
      <Cylinder args={[0.6, 0.6, 0.03, 16]} position={[0, 1.38, 0]}>
        <meshStandardMaterial color="#4a9ae0" transparent opacity={0.6} roughness={0.1} />
      </Cylinder>
      
      {/* Top piece */}
      <Sphere args={[0.2, 12, 12]} position={[0, 1.6, 0]} castShadow>
        <meshStandardMaterial color="#b0b0b0" roughness={0.5} />
      </Sphere>
      
      {/* Water spout effect */}
      <Cylinder args={[0.02, 0.01, 0.3, 8]} position={[0, 1.85, 0]}>
        <meshStandardMaterial color="#6abfff" transparent opacity={0.5} />
      </Cylinder>
    </group>
  );
}

// Outdoor lamp post
export function LampPost({ position, style = 'modern' }: { position: [number, number, number]; style?: string }) {
  const isModern = style === 'modern';
  
  return (
    <group position={position}>
      {/* Base */}
      <Cylinder args={[0.15, 0.18, 0.1, 12]} position={[0, 0.05, 0]} castShadow>
        <meshStandardMaterial color={isModern ? '#2a2a2a' : '#3a3020'} roughness={0.6} />
      </Cylinder>
      
      {/* Pole */}
      <Cylinder args={[0.05, 0.06, 2.5, 8]} position={[0, 1.3, 0]} castShadow>
        <meshStandardMaterial color={isModern ? '#1a1a1a' : '#3a3020'} roughness={0.5} metalness={isModern ? 0.3 : 0} />
      </Cylinder>
      
      {/* Lamp head */}
      {isModern ? (
        <Box args={[0.25, 0.12, 0.25]} position={[0, 2.6, 0]} castShadow>
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </Box>
      ) : (
        <>
          <Cylinder args={[0.15, 0.2, 0.35, 6]} position={[0, 2.55, 0]} castShadow>
            <meshStandardMaterial color="#3a3020" roughness={0.6} />
          </Cylinder>
          <mesh position={[0, 2.78, 0]}>
            <coneGeometry args={[0.18, 0.15, 6]} />
            <meshStandardMaterial color="#3a3020" roughness={0.6} />
          </mesh>
        </>
      )}
      
      {/* Light bulb/glow */}
      <Sphere args={[0.08, 8, 8]} position={[0, 2.5, 0]}>
        <meshStandardMaterial color="#fff5e0" emissive="#fff5e0" emissiveIntensity={0.5} />
      </Sphere>
      <pointLight position={[0, 2.5, 0]} intensity={0.8} distance={8} color="#fff5e0" />
    </group>
  );
}

// Complete enhanced landscaping
interface EnhancedLandscapingProps {
  houseWidth: number;
  houseDepth: number;
  style: string;
}

export default function EnhancedLandscaping({ houseWidth, houseDepth, style }: EnhancedLandscapingProps) {
  const offset = Math.max(houseWidth, houseDepth) / 2 + 8;
  const isModern = style.toLowerCase().includes('modern') || style.toLowerCase().includes('contemporary') || style.toLowerCase().includes('minimalist');
  const isMediterranean = style.toLowerCase().includes('mediterranean');
  const isRustic = style.toLowerCase().includes('rustic') || style.toLowerCase().includes('colonial');
  
  const flowerColor = isMediterranean ? '#ff6b35' : isRustic ? '#ffb6c1' : '#ff69b4';
  const fenceStyle = isModern ? 'picket' : 'rustic';

  return (
    <group>
      {/* Trees - varied placement */}
      <RealisticTree position={[-offset - 2, 0, -offset + 5]} scale={1.5} variant="oak" />
      <RealisticTree position={[offset + 3, 0, -offset]} scale={1.2} variant="maple" />
      <RealisticPineTree position={[-offset - 4, 0, offset / 2]} scale={1.4} />
      <RealisticPineTree position={[offset + 5, 0, offset / 2 + 3]} scale={1.1} />
      <RealisticTree position={[-offset / 2, 0, offset + 6]} scale={1.3} variant="birch" />
      <RealisticTree position={[offset / 2, 0, offset + 8]} scale={1.6} variant="oak" />
      
      {/* Flowering bushes around house */}
      <FloweringBush position={[-houseWidth / 2 - 1.5, 0, houseDepth / 3]} scale={1.2} flowerColor={flowerColor} />
      <FloweringBush position={[houseWidth / 2 + 1.5, 0, houseDepth / 3]} scale={1.0} flowerColor={flowerColor} />
      <FloweringBush position={[-houseWidth / 2 - 2, 0, -houseDepth / 4]} scale={0.9} flowerColor="#ffd700" />
      <FloweringBush position={[houseWidth / 2 + 2, 0, -houseDepth / 4]} scale={1.1} flowerColor="#9370db" />
      
      {/* Front garden bushes */}
      <FloweringBush position={[-2, 0, houseDepth / 2 + 2.5]} scale={0.8} flowerColor={flowerColor} />
      <FloweringBush position={[2, 0, houseDepth / 2 + 2.5]} scale={0.8} flowerColor={flowerColor} />
      
      {/* Stone pathway from driveway */}
      <StonePath 
        start={[-3, 0, houseDepth / 2 + 3]} 
        end={[-offset - 3, 0, houseDepth / 2 + 3]} 
        width={1}
      />
      
      {/* Garden fence - back and sides */}
      <GardenFence position={[0, 0, -offset - 2]} length={offset * 2 + 4} rotation={0} style={fenceStyle} />
      <GardenFence position={[-offset - 2, 0, -offset / 2]} length={offset + 2} rotation={Math.PI / 2} style={fenceStyle} />
      <GardenFence position={[offset + 2, 0, -offset / 2]} length={offset + 2} rotation={Math.PI / 2} style={fenceStyle} />
      
      {/* Water fountain (for larger properties) */}
      {!isModern && (
        <WaterFountain position={[houseWidth / 2 + 8, 0, -houseDepth / 2 - 3]} />
      )}
      
      {/* Lamp posts along driveway */}
      <LampPost position={[-2.5, 0, houseDepth / 2 + 8]} style={isModern ? 'modern' : 'classic'} />
      <LampPost position={[2.5, 0, houseDepth / 2 + 8]} style={isModern ? 'modern' : 'classic'} />
      <LampPost position={[-2.5, 0, houseDepth / 2 + 16]} style={isModern ? 'modern' : 'classic'} />
      <LampPost position={[2.5, 0, houseDepth / 2 + 16]} style={isModern ? 'modern' : 'classic'} />
    </group>
  );
}
