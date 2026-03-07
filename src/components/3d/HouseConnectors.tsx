import { useMemo } from "react";
import * as THREE from "three";

interface RoomRect {
  key: string;
  x: number;
  z: number;
  width: number;
  depth: number;
}

interface HouseConnectorsProps {
  rooms: RoomRect[];
  wallHeight?: number;
  wallThickness?: number;
}

/**
 * Renders a unified floor slab, outer walls, inner partition walls,
 * and a ceiling/roof to visually connect all room models into one house.
 */
const HouseConnectors = ({ rooms, wallHeight = 3, wallThickness = 0.15 }: HouseConnectorsProps) => {
  const geometry = useMemo(() => {
    if (rooms.length === 0) return null;

    // Compute bounding box of entire house
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    rooms.forEach((r) => {
      minX = Math.min(minX, r.x - r.width / 2);
      maxX = Math.max(maxX, r.x + r.width / 2);
      minZ = Math.min(minZ, r.z - r.depth / 2);
      maxZ = Math.max(maxZ, r.z + r.depth / 2);
    });

    const pad = 0.3;
    const floorX = (minX + maxX) / 2;
    const floorZ = (minZ + maxZ) / 2;
    const floorW = maxX - minX + pad * 2;
    const floorD = maxZ - minZ + pad * 2;

    // Build wall segments: outer perimeter + inner partitions between rooms
    const walls: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [];

    // Outer walls (4 sides)
    // Front (minZ side)
    walls.push({
      pos: [floorX, wallHeight / 2, minZ - pad],
      size: [floorW, wallHeight, wallThickness],
    });
    // Back (maxZ side)
    walls.push({
      pos: [floorX, wallHeight / 2, maxZ + pad],
      size: [floorW, wallHeight, wallThickness],
    });
    // Left (minX side)
    walls.push({
      pos: [minX - pad, wallHeight / 2, floorZ],
      size: [wallThickness, wallHeight, floorD],
    });
    // Right (maxX side)
    walls.push({
      pos: [maxX + pad, wallHeight / 2, floorZ],
      size: [wallThickness, wallHeight, floorD],
    });

    // Inner partition walls between adjacent rooms
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const a = rooms[i];
        const b = rooms[j];

        const aLeft = a.x - a.width / 2;
        const aRight = a.x + a.width / 2;
        const aFront = a.z - a.depth / 2;
        const aBack = a.z + a.depth / 2;

        const bLeft = b.x - b.width / 2;
        const bRight = b.x + b.width / 2;
        const bFront = b.z - b.depth / 2;
        const bBack = b.z + b.depth / 2;

        // Check if rooms share a vertical edge (side by side in X)
        const overlapZ = Math.min(aBack, bBack) - Math.max(aFront, bFront);
        const gapX = Math.abs(aRight - bLeft) < 0.5 || Math.abs(bRight - aLeft) < 0.5;

        if (gapX && overlapZ > 0.1) {
          const wallX = aRight > bRight ? aLeft : aRight;
          const wallZStart = Math.max(aFront, bFront);
          const wallZEnd = Math.min(aBack, bBack);
          const wallLen = wallZEnd - wallZStart;
          // Leave a doorway gap in the middle (40% of wall)
          const doorGap = wallLen * 0.35;
          const segLen = (wallLen - doorGap) / 2;

          if (segLen > 0.2) {
            walls.push({
              pos: [wallX, wallHeight / 2, wallZStart + segLen / 2],
              size: [wallThickness, wallHeight, segLen],
            });
            walls.push({
              pos: [wallX, wallHeight / 2, wallZEnd - segLen / 2],
              size: [wallThickness, wallHeight, segLen],
            });
          }
        }

        // Check if rooms share a horizontal edge (stacked in Z)
        const overlapX = Math.min(aRight, bRight) - Math.max(aLeft, bLeft);
        const gapZ = Math.abs(aBack - bFront) < 0.5 || Math.abs(bBack - aFront) < 0.5;

        if (gapZ && overlapX > 0.1) {
          const wallZ = aBack > bBack ? aFront : aBack;
          const wallXStart = Math.max(aLeft, bLeft);
          const wallXEnd = Math.min(aRight, bRight);
          const wallLen = wallXEnd - wallXStart;
          const doorGap = wallLen * 0.35;
          const segLen = (wallLen - doorGap) / 2;

          if (segLen > 0.2) {
            walls.push({
              pos: [wallXStart + segLen / 2, wallHeight / 2, wallZ],
              size: [segLen, wallHeight, wallThickness],
            });
            walls.push({
              pos: [wallXEnd - segLen / 2, wallHeight / 2, wallZ],
              size: [segLen, wallHeight, wallThickness],
            });
          }
        }
      }
    }

    return { floorX, floorZ, floorW, floorD, walls };
  }, [rooms, wallHeight, wallThickness]);

  if (!geometry) return null;

  const { floorX, floorZ, floorW, floorD, walls } = geometry;

  return (
    <group>
      {/* Foundation / Floor slab */}
      <mesh position={[floorX, -0.05, floorZ]} receiveShadow>
        <boxGeometry args={[floorW, 0.1, floorD]} />
        <meshStandardMaterial color="#e8e0d4" roughness={0.8} />
      </mesh>

      {/* Ceiling / Roof slab */}
      <mesh position={[floorX, wallHeight + 0.05, floorZ]}>
        <boxGeometry args={[floorW + 0.4, 0.15, floorD + 0.4]} />
        <meshStandardMaterial color="#d4ccc0" roughness={0.7} />
      </mesh>

      {/* Roof ridge (simple triangular prism effect via thin box) */}
      <mesh position={[floorX, wallHeight + 0.4, floorZ]} rotation={[0, 0, 0]}>
        <boxGeometry args={[floorW * 0.6, 0.5, floorD + 0.6]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>

      {/* Walls */}
      {walls.map((w, i) => (
        <mesh key={`wall-${i}`} position={w.pos} castShadow receiveShadow>
          <boxGeometry args={w.size} />
          <meshStandardMaterial
            color="#f5f0e8"
            roughness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Room floor tiles - slightly different shade per room */}
      {rooms.map((room, i) => {
        const hue = (i * 37 + 30) % 360;
        return (
          <mesh key={`floor-${room.key}`} position={[room.x, 0.01, room.z]} receiveShadow>
            <boxGeometry args={[room.width - 0.05, 0.02, room.depth - 0.05]} />
            <meshStandardMaterial
              color={`hsl(${hue}, 15%, 75%)`}
              roughness={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default HouseConnectors;
