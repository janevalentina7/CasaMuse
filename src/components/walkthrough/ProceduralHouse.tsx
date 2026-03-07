import { useMemo } from "react";
import * as THREE from "three";

interface Room {
  roomId: string;
  roomName: string;
  count: number;
}

interface RoomLayout {
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
}

interface ProceduralHouseProps {
  rooms: Room[];
  landArea: number;
  style: string;
  isDayMode: boolean;
}

// Color palette for rooms (using warm/cool tones)
const roomColors: Record<string, string> = {
  "Living Room": "#F5E6D3",
  "Bedroom": "#E8D5C4",
  "Master Bedroom": "#DEC8B5",
  "Kitchen": "#FFF8E7",
  "Bathroom": "#E0F0F0",
  "Dining Room": "#F0E8D8",
  "Study Room": "#E8E0D0",
  "Balcony": "#D8E8D0",
  "Guest Room": "#E8D8E0",
  "Pooja Room": "#FFF0E0",
  "Storeroom": "#E0D8D0",
  "Garage": "#D8D8D8",
  "Home Office": "#E0E8F0",
  "Laundry Room": "#E8F0F0",
  "Home Theater": "#2C2C3C",
  "Gym": "#E0E0E0",
};

const getFloorColor = (roomName: string) => roomColors[roomName] || "#F0EBE3";

// Calculate room layout from input data
export function calculateLayout(rooms: Room[], landArea: number): RoomLayout[] {
  const allRooms: { name: string; area: number }[] = [];
  rooms.forEach(room => {
    for (let i = 0; i < room.count; i++) {
      const name = room.count > 1 ? `${room.roomName} ${i + 1}` : room.roomName;
      // Estimate area per room based on land area and count
      const baseArea = (landArea * 0.7) / rooms.reduce((s, r) => s + r.count, 0);
      allRooms.push({ name, area: Math.max(baseArea, 9) }); // min 3x3m
    }
  });

  const layouts: RoomLayout[] = [];
  const cols = Math.ceil(Math.sqrt(allRooms.length));
  const spacing = 0.15; // Wall thickness in meters

  let x = 0;
  let z = 0;
  let maxDepthInRow = 0;
  let col = 0;

  allRooms.forEach((room) => {
    const side = Math.sqrt(room.area);
    const width = side * (0.8 + Math.random() * 0.4); // Slight variation
    const depth = room.area / width;

    layouts.push({ name: room.name, x, z, width, depth });

    maxDepthInRow = Math.max(maxDepthInRow, depth);
    col++;

    if (col >= cols) {
      col = 0;
      x = 0;
      z += maxDepthInRow + spacing;
      maxDepthInRow = 0;
    } else {
      x += width + spacing;
    }
  });

  // Center the layout
  const bounds = layouts.reduce(
    (b, r) => ({
      minX: Math.min(b.minX, r.x),
      maxX: Math.max(b.maxX, r.x + r.width),
      minZ: Math.min(b.minZ, r.z),
      maxZ: Math.max(b.maxZ, r.z + r.depth),
    }),
    { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }
  );
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;
  layouts.forEach(r => { r.x -= cx; r.z -= cz; });

  return layouts;
}

// Build collision walls & room bounds from layout
export function buildCollisionData(layouts: RoomLayout[], wallThickness = 0.15, wallHeight = 2.8) {
  const walls: THREE.Box3[] = [];
  const roomBounds: { name: string; bounds: THREE.Box3 }[] = [];
  const doorPositions: { position: THREE.Vector3; rotation: number; roomA: string; roomB: string }[] = [];

  // Overall bounding box for outer walls
  const allBounds = layouts.reduce(
    (b, r) => ({
      minX: Math.min(b.minX, r.x),
      maxX: Math.max(b.maxX, r.x + r.width),
      minZ: Math.min(b.minZ, r.z),
      maxZ: Math.max(b.maxZ, r.z + r.depth),
    }),
    { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }
  );

  // Outer walls
  const t = wallThickness;
  const h = wallHeight;
  // North wall
  walls.push(new THREE.Box3(
    new THREE.Vector3(allBounds.minX - t, 0, allBounds.minZ - t),
    new THREE.Vector3(allBounds.maxX + t, h, allBounds.minZ)
  ));
  // South wall
  walls.push(new THREE.Box3(
    new THREE.Vector3(allBounds.minX - t, 0, allBounds.maxZ),
    new THREE.Vector3(allBounds.maxX + t, h, allBounds.maxZ + t)
  ));
  // West wall
  walls.push(new THREE.Box3(
    new THREE.Vector3(allBounds.minX - t, 0, allBounds.minZ - t),
    new THREE.Vector3(allBounds.minX, h, allBounds.maxZ + t)
  ));
  // East wall
  walls.push(new THREE.Box3(
    new THREE.Vector3(allBounds.maxX, 0, allBounds.minZ - t),
    new THREE.Vector3(allBounds.maxX + t, h, allBounds.maxZ + t)
  ));

  // Room bounds & internal walls
  layouts.forEach(room => {
    roomBounds.push({
      name: room.name,
      bounds: new THREE.Box3(
        new THREE.Vector3(room.x, 0, room.z),
        new THREE.Vector3(room.x + room.width, h, room.z + room.depth)
      ),
    });
  });

  // Add internal walls between adjacent rooms with doors
  for (let i = 0; i < layouts.length; i++) {
    for (let j = i + 1; j < layouts.length; j++) {
      const a = layouts[i];
      const b = layouts[j];

      // Check if rooms share an edge (approximately)
      const doorWidth = 0.9;

      // Shared vertical edge (side by side)
      if (Math.abs((a.x + a.width) - b.x) < 0.3) {
        const overlapStart = Math.max(a.z, b.z);
        const overlapEnd = Math.min(a.z + a.depth, b.z + b.depth);
        if (overlapEnd - overlapStart > doorWidth) {
          const wallX = (a.x + a.width + b.x) / 2;
          const doorZ = (overlapStart + overlapEnd) / 2;
          // Wall segment above door
          // Wall segment below door  
          if (doorZ - doorWidth / 2 > overlapStart) {
            walls.push(new THREE.Box3(
              new THREE.Vector3(wallX - t / 2, 0, overlapStart),
              new THREE.Vector3(wallX + t / 2, h, doorZ - doorWidth / 2)
            ));
          }
          if (doorZ + doorWidth / 2 < overlapEnd) {
            walls.push(new THREE.Box3(
              new THREE.Vector3(wallX - t / 2, 0, doorZ + doorWidth / 2),
              new THREE.Vector3(wallX + t / 2, h, overlapEnd)
            ));
          }
          // Wall above door
          walls.push(new THREE.Box3(
            new THREE.Vector3(wallX - t / 2, 2.1, doorZ - doorWidth / 2),
            new THREE.Vector3(wallX + t / 2, h, doorZ + doorWidth / 2)
          ));
          doorPositions.push({
            position: new THREE.Vector3(wallX, 0, doorZ),
            rotation: 0,
            roomA: a.name,
            roomB: b.name,
          });
        }
      }

      // Shared horizontal edge (top-bottom)
      if (Math.abs((a.z + a.depth) - b.z) < 0.3) {
        const overlapStart = Math.max(a.x, b.x);
        const overlapEnd = Math.min(a.x + a.width, b.x + b.width);
        if (overlapEnd - overlapStart > doorWidth) {
          const wallZ = (a.z + a.depth + b.z) / 2;
          const doorX = (overlapStart + overlapEnd) / 2;
          if (doorX - doorWidth / 2 > overlapStart) {
            walls.push(new THREE.Box3(
              new THREE.Vector3(overlapStart, 0, wallZ - t / 2),
              new THREE.Vector3(doorX - doorWidth / 2, h, wallZ + t / 2)
            ));
          }
          if (doorX + doorWidth / 2 < overlapEnd) {
            walls.push(new THREE.Box3(
              new THREE.Vector3(doorX + doorWidth / 2, 0, wallZ - t / 2),
              new THREE.Vector3(overlapEnd, h, wallZ + t / 2)
            ));
          }
          walls.push(new THREE.Box3(
            new THREE.Vector3(doorX - doorWidth / 2, 2.1, wallZ - t / 2),
            new THREE.Vector3(doorX + doorWidth / 2, h, wallZ + t / 2)
          ));
          doorPositions.push({
            position: new THREE.Vector3(doorX, 0, wallZ),
            rotation: Math.PI / 2,
            roomA: a.name,
            roomB: b.name,
          });
        }
      }
    }
  }

  // Add entrance door to front wall (south wall)
  const entranceDoorX = 0;
  const entranceDoorWidth = 1.0;
  // Remove and re-add south wall with door gap
  walls.splice(1, 1); // Remove original south wall
  if (entranceDoorX - entranceDoorWidth / 2 > allBounds.minX) {
    walls.push(new THREE.Box3(
      new THREE.Vector3(allBounds.minX - t, 0, allBounds.maxZ),
      new THREE.Vector3(entranceDoorX - entranceDoorWidth / 2, h, allBounds.maxZ + t)
    ));
  }
  if (entranceDoorX + entranceDoorWidth / 2 < allBounds.maxX) {
    walls.push(new THREE.Box3(
      new THREE.Vector3(entranceDoorX + entranceDoorWidth / 2, 0, allBounds.maxZ),
      new THREE.Vector3(allBounds.maxX + t, h, allBounds.maxZ + t)
    ));
  }
  walls.push(new THREE.Box3(
    new THREE.Vector3(entranceDoorX - entranceDoorWidth / 2, 2.1, allBounds.maxZ),
    new THREE.Vector3(entranceDoorX + entranceDoorWidth / 2, h, allBounds.maxZ + t)
  ));

  doorPositions.push({
    position: new THREE.Vector3(entranceDoorX, 0, allBounds.maxZ),
    rotation: Math.PI / 2,
    roomA: "Entrance",
    roomB: layouts[0]?.name || "Room",
  });

  return { walls, roomBounds, doorPositions, outerBounds: allBounds };
}

const ProceduralHouse = ({ rooms, landArea, style, isDayMode }: ProceduralHouseProps) => {
  const layouts = useMemo(() => calculateLayout(rooms, landArea), [rooms, landArea]);
  const { walls: wallBoxes, doorPositions, outerBounds } = useMemo(
    () => buildCollisionData(layouts),
    [layouts]
  );

  const wallHeight = 2.8;
  const wallThickness = 0.15;

  // Ambient + directional light based on day/night
  const ambientIntensity = isDayMode ? 0.6 : 0.15;
  const directionalIntensity = isDayMode ? 1.2 : 0.1;
  const bgColor = isDayMode ? "#87CEEB" : "#0a0a2e";

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={ambientIntensity} color={isDayMode ? "#ffffff" : "#4466aa"} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={directionalIntensity}
        castShadow
        color={isDayMode ? "#FFF5E1" : "#223355"}
      />
      {!isDayMode && (
        <>
          {/* Indoor lamps in night mode */}
          {layouts.map((room, i) => (
            <pointLight
              key={`lamp-${i}`}
              position={[room.x + room.width / 2, 2.2, room.z + room.depth / 2]}
              intensity={0.8}
              distance={Math.max(room.width, room.depth) * 1.5}
              color="#FFCC88"
            />
          ))}
        </>
      )}

      {/* Floor per room */}
      {layouts.map((room, i) => (
        <mesh key={`floor-${i}`} position={[room.x + room.width / 2, 0.01, room.z + room.depth / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[room.width, room.depth]} />
          <meshStandardMaterial color={getFloorColor(room.name.replace(/ \d+$/, ""))} roughness={0.8} />
        </mesh>
      ))}

      {/* Ceiling per room */}
      {layouts.map((room, i) => (
        <mesh key={`ceil-${i}`} position={[room.x + room.width / 2, wallHeight, room.z + room.depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[room.width, room.depth]} />
          <meshStandardMaterial color="#FAFAFA" roughness={0.9} />
        </mesh>
      ))}

      {/* Walls from collision boxes */}
      {wallBoxes.map((box, i) => {
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        return (
          <mesh key={`wall-${i}`} position={center} castShadow receiveShadow>
            <boxGeometry args={[size.x, size.y, size.z]} />
            <meshStandardMaterial color="#F5F0EB" roughness={0.85} />
          </mesh>
        );
      })}

      {/* Door frames */}
      {doorPositions.map((door, i) => (
        <group key={`door-${i}`} position={door.position}>
          {/* Door frame visual */}
          <mesh position={[0, 1.05, 0]} rotation={[0, door.rotation, 0]}>
            <boxGeometry args={[0.9, 2.1, 0.08]} />
            <meshStandardMaterial color="#8B6914" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Room labels floating above floor */}
      {layouts.map((room, i) => (
        <mesh key={`label-bg-${i}`} position={[room.x + room.width / 2, 0.02, room.z + room.depth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[Math.min(room.width * 0.6, 2), 0.3]} />
          <meshBasicMaterial color="#333333" opacity={0.3} transparent />
        </mesh>
      ))}

      {/* Ground outside */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={isDayMode ? "#4a7c59" : "#1a3020"} roughness={1} />
      </mesh>
    </group>
  );
};

export default ProceduralHouse;
export type { RoomLayout };
