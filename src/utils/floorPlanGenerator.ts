// Procedural Floor Plan Generator - No AI required

export interface RoomData {
  roomId: string;
  roomName: string;
  count: number;
  size: string;
  width: number;
  height: number;
  attachedBathroom?: boolean;
}

export interface FloorPlanPreferences {
  style: string;
  floors: number;
  vastuCompliant: boolean;
  dynamicScaling: boolean;
  outdoorFeatures: string[];
}

interface PlacedRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isWetArea?: boolean;
}

interface FloorPlanResult {
  rooms: PlacedRoom[];
  totalWidth: number;
  totalHeight: number;
  landArea: number;
  builtUpArea: number;
  scaleFactor: number;
}

// Room priority for placement (higher = placed first, near entrance)
const ROOM_PRIORITY: Record<string, number> = {
  'living_room': 10,
  'foyer': 9,
  'dining_room': 8,
  'kitchen': 7,
  'master_bedroom': 6,
  'bedroom': 5,
  'bathroom_common': 4,
  'utility': 3,
  'balcony': 2,
  'pooja': 1,
  'parking': 0,
};

// Wet areas that need hatching
const WET_AREAS = ['bathroom_common', 'bathroom_attached', 'kitchen', 'utility'];

export function generateFloorPlan(
  landArea: number,
  rooms: RoomData[],
  preferences: FloorPlanPreferences
): FloorPlanResult {
  // Calculate approximate plot dimensions (assume roughly square plot)
  const plotRatio = 1.2; // slightly rectangular
  const plotWidth = Math.sqrt(landArea * plotRatio);
  const plotHeight = landArea / plotWidth;

  // Expand rooms based on count and attached bathrooms
  const expandedRooms: Array<RoomData & { instanceId: string }> = [];
  
  rooms.forEach(room => {
    for (let i = 0; i < room.count; i++) {
      expandedRooms.push({
        ...room,
        instanceId: `${room.roomId}_${i}`,
        roomName: room.count > 1 ? `${room.roomName} ${i + 1}` : room.roomName,
      });
      
      // Add attached bathroom if specified
      if (room.attachedBathroom && room.roomId.includes('bedroom')) {
        expandedRooms.push({
          roomId: 'bathroom_attached',
          roomName: `Attached Bath`,
          count: 1,
          size: 'small',
          width: 6,
          height: 8,
          instanceId: `bathroom_attached_${room.roomId}_${i}`,
        });
      }
    }
  });

  // Calculate total room area
  const totalRoomArea = expandedRooms.reduce((sum, r) => sum + r.width * r.height, 0);
  
  // Calculate scale factor if needed
  let scaleFactor = 1;
  const usableArea = landArea * 0.7; // 70% of land for building, rest for setbacks
  
  if (preferences.dynamicScaling && totalRoomArea > usableArea) {
    scaleFactor = Math.sqrt(usableArea / totalRoomArea);
  }

  // Sort rooms by priority
  expandedRooms.sort((a, b) => {
    const priorityA = ROOM_PRIORITY[a.roomId] ?? 5;
    const priorityB = ROOM_PRIORITY[b.roomId] ?? 5;
    return priorityB - priorityA;
  });

  // Place rooms using a simple grid-based algorithm
  const placedRooms: PlacedRoom[] = [];
  const gridCellSize = 1; // 1 foot grid
  const maxWidth = Math.floor(plotWidth);
  const maxHeight = Math.floor(plotHeight);
  
  // Create occupancy grid
  const grid: boolean[][] = Array(maxHeight).fill(null).map(() => Array(maxWidth).fill(false));

  // Wall thickness in feet
  const wallThickness = 0.75; // 9 inches

  // Starting position (with setback)
  const setback = 3; // 3 feet setback

  expandedRooms.forEach(room => {
    const scaledWidth = Math.round(room.width * scaleFactor);
    const scaledHeight = Math.round(room.height * scaleFactor);

    // Find a position for this room
    let placed = false;
    
    for (let y = setback; y < maxHeight - scaledHeight - setback && !placed; y++) {
      for (let x = setback; x < maxWidth - scaledWidth - setback && !placed; x++) {
        if (canPlaceRoom(grid, x, y, scaledWidth, scaledHeight)) {
          // Place room
          markOccupied(grid, x, y, scaledWidth, scaledHeight);
          
          placedRooms.push({
            id: room.instanceId,
            name: room.roomName,
            x: x + wallThickness,
            y: y + wallThickness,
            width: scaledWidth - wallThickness * 2,
            height: scaledHeight - wallThickness * 2,
            isWetArea: WET_AREAS.includes(room.roomId),
          });
          
          placed = true;
        }
      }
    }

    // If couldn't place, force place at end
    if (!placed) {
      const lastRoom = placedRooms[placedRooms.length - 1];
      const x = lastRoom ? lastRoom.x + lastRoom.width + wallThickness * 2 : setback;
      const y = setback;
      
      placedRooms.push({
        id: room.instanceId,
        name: room.roomName,
        x: x + wallThickness,
        y: y + wallThickness,
        width: scaledWidth - wallThickness * 2,
        height: scaledHeight - wallThickness * 2,
        isWetArea: WET_AREAS.includes(room.roomId),
      });
    }
  });

  // Calculate actual bounds
  let actualMaxX = 0;
  let actualMaxY = 0;
  
  placedRooms.forEach(room => {
    actualMaxX = Math.max(actualMaxX, room.x + room.width + wallThickness);
    actualMaxY = Math.max(actualMaxY, room.y + room.height + wallThickness);
  });

  const builtUpArea = placedRooms.reduce((sum, r) => sum + r.width * r.height, 0);

  return {
    rooms: placedRooms,
    totalWidth: actualMaxX + setback,
    totalHeight: actualMaxY + setback,
    landArea,
    builtUpArea: Math.round(builtUpArea),
    scaleFactor,
  };
}

function canPlaceRoom(
  grid: boolean[][],
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const checkY = y + dy;
      const checkX = x + dx;
      
      if (checkY >= grid.length || checkX >= grid[0].length) return false;
      if (grid[checkY][checkX]) return false;
    }
  }
  return true;
}

function markOccupied(
  grid: boolean[][],
  x: number,
  y: number,
  width: number,
  height: number
): void {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const markY = y + dy;
      const markX = x + dx;
      
      if (markY < grid.length && markX < grid[0].length) {
        grid[markY][markX] = true;
      }
    }
  }
}
