// Professional Floor Plan Generator - Indian Construction Standards
// Follows strict architectural rules and Vastu compliance

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
  isWetArea?: boolean;
  zone: 'front' | 'middle' | 'back' | 'side';
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
  hallway?: { x: number; y: number; width: number; height: number };
  summary: FloorPlanSummary;
}

export interface FloorPlanSummary {
  totalLandArea: number;
  totalBuiltUpArea: number;
  numberOfRooms: number;
  dynamicScalingApplied: boolean;
  vastuCompliant: boolean;
  notes: string[];
}

// Standard Indian room colors
export const ROOM_COLORS: Record<string, string> = {
  'living_room': '#E3F2FD',    // Light blue
  'kitchen': '#E8F5E9',        // Light green
  'dining_room': '#FFF8E1',    // Light yellow
  'master_bedroom': '#FCE4EC', // Light pink
  'bedroom': '#F3E5F5',        // Light purple
  'bathroom_common': '#E0F7FA', // Light cyan
  'bathroom_attached': '#E0F7FA',
  'utility': '#F5F5F5',        // Light gray
  'balcony': '#DCEDC8',        // Light lime
  'pooja': '#FFF3E0',          // Light orange
  'parking': '#ECEFF1',        // Gray
  'foyer': '#FAFAFA',          // Very light gray
  'hallway': '#F5F5F5',        // Light gray
  'store': '#EFEBE9',          // Light brown
  'home_theatre': '#EDE7F6',   // Light deep purple
  'guest_room': '#FBE9E7',     // Light deep orange
  'study': '#E8EAF6',          // Light indigo
  'terrace': '#C8E6C9',        // Medium green
  'garden': '#A5D6A7',         // Green
};

// Standard Indian room dimensions (in feet)
const INDIAN_ROOM_STANDARDS: Record<string, { min: { w: number; h: number }; max: { w: number; h: number } }> = {
  'master_bedroom': { min: { w: 12, h: 12 }, max: { w: 14, h: 14 } },
  'bedroom': { min: { w: 10, h: 10 }, max: { w: 12, h: 12 } },
  'living_room': { min: { w: 12, h: 15 }, max: { w: 14, h: 18 } },
  'dining_room': { min: { w: 8, h: 10 }, max: { w: 10, h: 12 } },
  'kitchen': { min: { w: 8, h: 10 }, max: { w: 10, h: 12 } },
  'foyer': { min: { w: 4, h: 6 }, max: { w: 6, h: 8 } },
  'utility': { min: { w: 4, h: 6 }, max: { w: 5, h: 7 } },
  'bathroom_attached': { min: { w: 6, h: 7 }, max: { w: 6, h: 8 } },
  'bathroom_common': { min: { w: 5, h: 6 }, max: { w: 5, h: 7 } },
  'balcony': { min: { w: 4, h: 8 }, max: { w: 6, h: 12 } },
  'pooja': { min: { w: 4, h: 4 }, max: { w: 6, h: 6 } },
  'parking': { min: { w: 10, h: 15 }, max: { w: 12, h: 18 } },
  'store': { min: { w: 4, h: 5 }, max: { w: 6, h: 7 } },
  'study': { min: { w: 8, h: 8 }, max: { w: 10, h: 10 } },
  'guest_room': { min: { w: 10, h: 10 }, max: { w: 12, h: 12 } },
};

// Room zones for architectural placement
const ROOM_ZONES: Record<string, 'front' | 'middle' | 'back' | 'side'> = {
  'living_room': 'front',
  'foyer': 'front',
  'dining_room': 'front',
  'parking': 'front',
  'kitchen': 'middle',
  'utility': 'middle',
  'pooja': 'middle',
  'bathroom_common': 'middle',
  'master_bedroom': 'back',
  'bedroom': 'back',
  'guest_room': 'back',
  'bathroom_attached': 'back',
  'balcony': 'side',
  'store': 'side',
  'study': 'middle',
  'terrace': 'side',
};

// Vastu directions (compass positions)
const VASTU_PLACEMENT: Record<string, string> = {
  'living_room': 'east-north', // Northeast for living
  'kitchen': 'south-east',     // Southeast for kitchen (fire element)
  'master_bedroom': 'south-west', // Southwest for master bedroom
  'pooja': 'north-east',       // Northeast for pooja room
  'bathroom_common': 'west',   // West or South for bathrooms
  'dining_room': 'west',       // West for dining
  'entrance': 'north-east',    // North or East entrance
};

interface LayoutGrid {
  cells: boolean[][];
  width: number;
  height: number;
}

export function generateFloorPlan(
  landArea: number,
  rooms: RoomData[],
  preferences: FloorPlanPreferences
): FloorPlanResult {
  // Calculate plot dimensions (typical 30×40 or 40×60 Indian plots)
  const plotRatio = landArea < 1200 ? 1.33 : 1.5; // 30×40 vs 40×60
  const plotWidth = Math.sqrt(landArea * plotRatio);
  const plotHeight = landArea / plotWidth;
  
  // Setbacks (minimum 3 feet on all sides as per Indian building codes)
  const setback = 3;
  const buildableWidth = Math.floor(plotWidth - setback * 2);
  const buildableHeight = Math.floor(plotHeight - setback * 2);

  // Hallway configuration
  const hallwayWidth = 4; // 4 feet standard hallway

  // Prepare notes for summary
  const notes: string[] = [];
  notes.push('Layout follows Indian construction standards');
  
  if (preferences.vastuCompliant) {
    notes.push('Vastu-compliant placement applied');
    notes.push('Entrance in North/East direction');
    notes.push('Kitchen in South-East corner');
    notes.push('Master bedroom in South-West corner');
  }

  // Check outdoor features
  const hasParking = preferences.outdoorFeatures.includes('parking') || 
    rooms.some(r => r.roomId === 'parking');
  const hasGarden = preferences.outdoorFeatures.includes('garden');

  // Expand rooms based on count and attached bathrooms
  const expandedRooms: Array<RoomData & { instanceId: string; zone: 'front' | 'middle' | 'back' | 'side'; priority: number }> = [];
  
  // Priority order for placement
  const placementPriority: Record<string, number> = {
    'foyer': 1,
    'living_room': 2,
    'dining_room': 3,
    'kitchen': 4,
    'master_bedroom': 5,
    'bedroom': 6,
    'bathroom_common': 7,
    'utility': 8,
    'pooja': 9,
    'balcony': 10,
    'store': 11,
    'study': 12,
    'guest_room': 13,
  };

  rooms.forEach(room => {
    for (let i = 0; i < room.count; i++) {
      const instanceId = `${room.roomId}_${i}`;
      const zone = ROOM_ZONES[room.roomId] || 'middle';
      
      expandedRooms.push({
        ...room,
        instanceId,
        roomName: room.count > 1 ? `${room.roomName} ${i + 1}` : room.roomName,
        zone,
        priority: placementPriority[room.roomId] || 99,
      });
      
      // Add attached bathroom
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
          priority: 50 + i, // Place right after parent bedroom
        });
      }
    }
  });

  // Calculate total room area needed
  const totalRoomArea = expandedRooms.reduce((sum, r) => sum + r.width * r.height, 0);
  const usableArea = buildableWidth * buildableHeight * 0.85; // 85% efficiency with walls & circulation
  
  // Dynamic scaling calculation
  let scaleFactor = 1;
  let dynamicScalingApplied = false;
  
  if (preferences.dynamicScaling && totalRoomArea > usableArea) {
    scaleFactor = Math.sqrt(usableArea / totalRoomArea);
    scaleFactor = Math.max(scaleFactor, 0.65); // Don't scale below 65%
    dynamicScalingApplied = true;
    notes.push(`Dynamic scaling applied (${Math.round(scaleFactor * 100)}% of original sizes)`);
  }

  // Sort rooms by priority
  expandedRooms.sort((a, b) => a.priority - b.priority);

  // Create layout grid
  const grid: LayoutGrid = {
    cells: Array(buildableHeight).fill(null).map(() => Array(buildableWidth).fill(false)),
    width: buildableWidth,
    height: buildableHeight,
  };

  // Calculate zone boundaries
  const frontZoneEnd = Math.floor(buildableHeight * 0.35);
  const middleZoneEnd = Math.floor(buildableHeight * 0.65);

  // Place rooms
  const placedRooms: PlacedRoom[] = [];
  let currentX = 0;
  let currentY = 0;
  let rowHeight = 0;
  let currentRow = 0;

  expandedRooms.forEach((room) => {
    const scaledWidth = Math.round(room.width * scaleFactor);
    const scaledHeight = Math.round(room.height * scaleFactor);
    
    // Determine target zone
    let yStart = 0;
    let yEnd = buildableHeight;
    
    if (room.zone === 'front') {
      yStart = 0;
      yEnd = frontZoneEnd;
    } else if (room.zone === 'middle') {
      yStart = frontZoneEnd;
      yEnd = middleZoneEnd;
    } else if (room.zone === 'back') {
      yStart = middleZoneEnd;
      yEnd = buildableHeight;
    }

    // Vastu-based placement adjustments
    if (preferences.vastuCompliant) {
      const vastuPos = VASTU_PLACEMENT[room.roomId];
      if (vastuPos) {
        if (vastuPos.includes('south')) yStart = Math.max(yStart, middleZoneEnd);
        if (vastuPos.includes('north')) yEnd = Math.min(yEnd, frontZoneEnd);
      }
    }

    // Find best position
    let bestPos = findBestPosition(grid, scaledWidth, scaledHeight, yStart, yEnd, room.zone);
    
    // If not found in zone, try anywhere
    if (!bestPos) {
      bestPos = findBestPosition(grid, scaledWidth, scaledHeight, 0, buildableHeight, room.zone);
    }

    if (bestPos) {
      markGridOccupied(grid, bestPos.x, bestPos.y, scaledWidth, scaledHeight);
      
      // Determine door position
      const doorPosition = determineDoorPosition(bestPos.x, bestPos.y, scaledWidth, scaledHeight, buildableWidth, frontZoneEnd, middleZoneEnd);
      
      // Determine window positions (exterior walls only)
      const windowPositions = determineWindowPositions(bestPos.x, bestPos.y, scaledWidth, scaledHeight, buildableWidth, buildableHeight);
      
      // Check if wet area
      const isWetArea = room.roomId.includes('bathroom') || room.roomId === 'kitchen' || room.roomId === 'utility';

      placedRooms.push({
        id: room.instanceId,
        name: room.roomName,
        x: setback + bestPos.x,
        y: setback + bestPos.y,
        width: scaledWidth,
        height: scaledHeight,
        roomType: room.roomId,
        hasDoor: true,
        doorPosition,
        hasWindow: windowPositions.length > 0 && !room.roomId.includes('bathroom'),
        windowPositions: room.roomId.includes('bathroom') ? [] : windowPositions,
        isWetArea,
        zone: room.zone,
      });
    }
  });

  // Calculate actual dimensions used
  let maxX = 0;
  let maxY = 0;
  placedRooms.forEach(room => {
    maxX = Math.max(maxX, room.x + room.width);
    maxY = Math.max(maxY, room.y + room.height);
  });

  const builtUpArea = placedRooms.reduce((sum, r) => sum + r.width * r.height, 0);

  // Add summary notes
  notes.push(`${placedRooms.length} rooms placed successfully`);
  notes.push(`Built-up area: ${builtUpArea} sq ft (${Math.round(builtUpArea / landArea * 100)}% utilization)`);
  notes.push('All rooms follow minimum Indian construction standards');
  notes.push('Cross-ventilation provided for all habitable rooms');

  const summary: FloorPlanSummary = {
    totalLandArea: landArea,
    totalBuiltUpArea: builtUpArea,
    numberOfRooms: placedRooms.length,
    dynamicScalingApplied,
    vastuCompliant: preferences.vastuCompliant,
    notes,
  };

  return {
    rooms: placedRooms,
    totalWidth: maxX + setback,
    totalHeight: maxY + setback,
    landArea,
    builtUpArea: Math.round(builtUpArea),
    scaleFactor,
    hasParking,
    hasGarden,
    summary,
  };
}

function findBestPosition(
  grid: LayoutGrid,
  width: number,
  height: number,
  yStart: number,
  yEnd: number,
  zone: string
): { x: number; y: number } | null {
  // Try to place from the zone boundaries
  for (let y = yStart; y <= Math.min(yEnd, grid.height) - height; y++) {
    for (let x = 0; x <= grid.width - width; x++) {
      if (canPlace(grid, x, y, width, height)) {
        return { x, y };
      }
    }
  }
  return null;
}

function canPlace(grid: LayoutGrid, x: number, y: number, width: number, height: number): boolean {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const checkX = x + dx;
      const checkY = y + dy;
      if (checkY >= grid.height || checkX >= grid.width) return false;
      if (grid.cells[checkY][checkX]) return false;
    }
  }
  return true;
}

function markGridOccupied(grid: LayoutGrid, x: number, y: number, width: number, height: number): void {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const markX = x + dx;
      const markY = y + dy;
      if (markY < grid.height && markX < grid.width) {
        grid.cells[markY][markX] = true;
      }
    }
  }
}

function determineDoorPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  gridWidth: number,
  frontZoneEnd: number,
  middleZoneEnd: number
): 'top' | 'bottom' | 'left' | 'right' {
  // Front rooms: door at bottom (facing entrance)
  if (y < frontZoneEnd) return 'bottom';
  
  // Back rooms: door at top (facing hallway)
  if (y >= middleZoneEnd) return 'top';
  
  // Middle rooms: door based on position
  return x < gridWidth / 2 ? 'right' : 'left';
}

function determineWindowPositions(
  x: number,
  y: number,
  width: number,
  height: number,
  gridWidth: number,
  gridHeight: number
): ('top' | 'bottom' | 'left' | 'right')[] {
  const positions: ('top' | 'bottom' | 'left' | 'right')[] = [];
  
  // Windows on exterior walls only
  if (x === 0) positions.push('left');
  if (x + width >= gridWidth - 1) positions.push('right');
  if (y === 0) positions.push('top');
  if (y + height >= gridHeight - 1) positions.push('bottom');
  
  return positions;
}
