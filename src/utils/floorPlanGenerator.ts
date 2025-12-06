// Professional Floor Plan Generator with Proper Layout Algorithm

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

export interface PlacedRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  roomType: string;
  hasDoor: boolean;
  doorPosition: 'top' | 'bottom' | 'left' | 'right';
  hasWindow: boolean;
  windowPositions: ('top' | 'bottom' | 'left' | 'right')[];
}

export interface FloorPlanResult {
  rooms: PlacedRoom[];
  totalWidth: number;
  totalHeight: number;
  landArea: number;
  builtUpArea: number;
  scaleFactor: number;
  hasParking: boolean;
  hasGarden: boolean;
}

// Room colors based on type
export const ROOM_COLORS: Record<string, string> = {
  'living_room': '#B8D4E8', // Light blue
  'kitchen': '#C8E6C9', // Light green
  'dining_room': '#FFF9C4', // Light yellow
  'master_bedroom': '#FFCCBC', // Light peach/orange
  'bedroom': '#F8BBD9', // Light pink
  'bathroom_common': '#B3E5FC', // Light cyan
  'bathroom_attached': '#B3E5FC',
  'utility': '#E1BEE7', // Light purple
  'balcony': '#DCEDC8', // Light lime
  'pooja': '#FFE0B2', // Light orange
  'parking': '#ECEFF1', // Light gray
  'foyer': '#F5F5F5', // Very light gray
  'hallway': '#FAFAFA', // Almost white
  'store': '#D7CCC8', // Light brown
  'home_theatre': '#FFCDD2', // Light red
  'guest_room': '#FFE0B2', // Light orange
  'study': '#E8EAF6', // Light indigo
  'terrace': '#C8E6C9', // Light green
  'garden': '#A5D6A7', // Medium green
};

// Room placement priority and zones
const ROOM_ZONES: Record<string, 'front' | 'middle' | 'back' | 'side'> = {
  'living_room': 'front',
  'foyer': 'front',
  'dining_room': 'front',
  'kitchen': 'middle',
  'master_bedroom': 'back',
  'bedroom': 'back',
  'bathroom_common': 'middle',
  'bathroom_attached': 'back',
  'utility': 'side',
  'balcony': 'side',
  'pooja': 'middle',
  'parking': 'front',
  'store': 'side',
  'home_theatre': 'back',
  'guest_room': 'middle',
  'study': 'middle',
  'terrace': 'side',
};

interface LayoutCell {
  occupied: boolean;
  roomId: string | null;
}

export function generateFloorPlan(
  landArea: number,
  rooms: RoomData[],
  preferences: FloorPlanPreferences
): FloorPlanResult {
  // Calculate plot dimensions (1.3:1 ratio for typical Indian plots)
  const plotRatio = 1.3;
  const plotWidth = Math.sqrt(landArea * plotRatio);
  const plotHeight = landArea / plotWidth;
  
  // Setbacks (3 feet on all sides)
  const setback = 3;
  const buildableWidth = plotWidth - setback * 2;
  const buildableHeight = plotHeight - setback * 2;

  // Expand rooms based on count and attached bathrooms
  const expandedRooms: Array<RoomData & { instanceId: string; zone: string }> = [];
  
  // Add parking first if outdoor features include it
  const hasParking = preferences.outdoorFeatures.includes('parking') || 
    rooms.some(r => r.roomId === 'parking');
  const hasGarden = preferences.outdoorFeatures.includes('garden');

  rooms.forEach(room => {
    for (let i = 0; i < room.count; i++) {
      const instanceId = `${room.roomId}_${i}`;
      expandedRooms.push({
        ...room,
        instanceId,
        roomName: room.count > 1 ? `${room.roomName} ${i + 1}` : room.roomName,
        zone: ROOM_ZONES[room.roomId] || 'middle',
      });
      
      // Add attached bathroom if specified
      if (room.attachedBathroom && (room.roomId.includes('bedroom') || room.roomId === 'master_bedroom')) {
        expandedRooms.push({
          roomId: 'bathroom_attached',
          roomName: 'Attached Bath',
          count: 1,
          size: 'small',
          width: 6,
          height: 7,
          instanceId: `bathroom_attached_${instanceId}`,
          zone: 'back',
        });
      }
    }
  });

  // Calculate total room area
  const totalRoomArea = expandedRooms.reduce((sum, r) => sum + r.width * r.height, 0);
  
  // Calculate scale factor if dynamic scaling is enabled
  let scaleFactor = 1;
  const usableArea = buildableWidth * buildableHeight * 0.85; // 85% efficiency
  
  if (preferences.dynamicScaling && totalRoomArea > usableArea) {
    scaleFactor = Math.sqrt(usableArea / totalRoomArea);
    scaleFactor = Math.max(scaleFactor, 0.6); // Don't scale below 60%
  }

  // Sort rooms by zone and size
  const zonePriority = { front: 0, middle: 1, back: 2, side: 3 };
  expandedRooms.sort((a, b) => {
    const zoneDiff = zonePriority[a.zone as keyof typeof zonePriority] - zonePriority[b.zone as keyof typeof zonePriority];
    if (zoneDiff !== 0) return zoneDiff;
    return (b.width * b.height) - (a.width * a.height); // Larger rooms first
  });

  // Place rooms using zone-based algorithm
  const placedRooms: PlacedRoom[] = [];
  const gridSize = 1; // 1 foot grid
  const gridWidth = Math.ceil(buildableWidth);
  const gridHeight = Math.ceil(buildableHeight);
  
  // Create occupancy grid
  const grid: LayoutCell[][] = Array(gridHeight).fill(null).map(() => 
    Array(gridWidth).fill(null).map(() => ({ occupied: false, roomId: null }))
  );

  // Wall thickness
  const wallThickness = 0.75;

  // Calculate zone boundaries
  const frontZoneEnd = Math.floor(gridHeight * 0.35);
  const middleZoneEnd = Math.floor(gridHeight * 0.65);

  // Place each room
  expandedRooms.forEach((room, roomIndex) => {
    const scaledWidth = Math.round(room.width * scaleFactor);
    const scaledHeight = Math.round(room.height * scaleFactor);
    
    // Determine y range based on zone
    let yStart = 0;
    let yEnd = gridHeight;
    
    if (room.zone === 'front') {
      yStart = 0;
      yEnd = frontZoneEnd;
    } else if (room.zone === 'middle') {
      yStart = frontZoneEnd - 2;
      yEnd = middleZoneEnd;
    } else if (room.zone === 'back') {
      yStart = middleZoneEnd - 2;
      yEnd = gridHeight;
    }

    let placed = false;
    let bestX = 0;
    let bestY = yStart;

    // Try to find a position
    for (let y = yStart; y <= yEnd - scaledHeight && !placed; y++) {
      for (let x = 0; x <= gridWidth - scaledWidth && !placed; x++) {
        if (canPlaceRoom(grid, x, y, scaledWidth, scaledHeight)) {
          bestX = x;
          bestY = y;
          placed = true;
        }
      }
    }

    // If not placed in zone, try anywhere
    if (!placed) {
      for (let y = 0; y <= gridHeight - scaledHeight && !placed; y++) {
        for (let x = 0; x <= gridWidth - scaledWidth && !placed; x++) {
          if (canPlaceRoom(grid, x, y, scaledWidth, scaledHeight)) {
            bestX = x;
            bestY = y;
            placed = true;
          }
        }
      }
    }

    if (placed) {
      markOccupied(grid, bestX, bestY, scaledWidth, scaledHeight, room.instanceId);
      
      // Determine door position based on room location and type
      let doorPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
      if (bestY < frontZoneEnd) doorPosition = 'bottom';
      else if (bestY >= middleZoneEnd) doorPosition = 'top';
      else doorPosition = bestX < gridWidth / 2 ? 'right' : 'left';

      // Determine window positions based on exterior walls
      const windowPositions: ('top' | 'bottom' | 'left' | 'right')[] = [];
      if (bestX === 0) windowPositions.push('left');
      if (bestX + scaledWidth >= gridWidth - 1) windowPositions.push('right');
      if (bestY === 0) windowPositions.push('top');
      if (bestY + scaledHeight >= gridHeight - 1) windowPositions.push('bottom');

      placedRooms.push({
        id: room.instanceId,
        name: room.roomName,
        x: setback + bestX,
        y: setback + bestY,
        width: scaledWidth,
        height: scaledHeight,
        roomType: room.roomId,
        hasDoor: true,
        doorPosition,
        hasWindow: windowPositions.length > 0 && !room.roomId.includes('bathroom'),
        windowPositions,
      });
    }
  });

  // Calculate actual dimensions
  let maxX = 0;
  let maxY = 0;
  placedRooms.forEach(room => {
    maxX = Math.max(maxX, room.x + room.width);
    maxY = Math.max(maxY, room.y + room.height);
  });

  const builtUpArea = placedRooms.reduce((sum, r) => sum + r.width * r.height, 0);

  return {
    rooms: placedRooms,
    totalWidth: maxX + setback,
    totalHeight: maxY + setback,
    landArea,
    builtUpArea: Math.round(builtUpArea),
    scaleFactor,
    hasParking,
    hasGarden,
  };
}

function canPlaceRoom(
  grid: LayoutCell[][],
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
      if (grid[checkY][checkX].occupied) return false;
    }
  }
  return true;
}

function markOccupied(
  grid: LayoutCell[][],
  x: number,
  y: number,
  width: number,
  height: number,
  roomId: string
): void {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const markY = y + dy;
      const markX = x + dx;
      if (markY < grid.length && markX < grid[0].length) {
        grid[markY][markX] = { occupied: true, roomId };
      }
    }
  }
}
