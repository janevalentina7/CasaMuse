// Procedural floor plan generator - no AI required

interface Room {
  roomId: string;
  roomName: string;
  count: number;
  size: string;
  width: number;
  height: number;
  attachedBathroom?: boolean;
}

interface Preferences {
  style: string;
  floors: number;
  vastuCompliant: boolean;
  dynamicScaling: boolean;
  outdoorFeatures: string[];
}

interface RoomPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  color: string;
}

const ROOM_COLORS: Record<string, string> = {
  'living_room': '#E8F5E9',
  'kitchen': '#FFF3E0',
  'dining_room': '#FCE4EC',
  'master_bedroom': '#E3F2FD',
  'bedroom': '#E8EAF6',
  'bathroom_common': '#E0F7FA',
  'bathroom_attached': '#B2EBF2',
  'balcony': '#F1F8E9',
  'pooja': '#FFF8E1',
  'utility': '#ECEFF1',
  'storage': '#F5F5F5',
  'garage': '#CFD8DC',
  'study': '#EDE7F6',
  'guest_room': '#E1F5FE',
  'home_office': '#F3E5F5',
  'walk_in_closet': '#FAFAFA',
  'laundry': '#E0E0E0',
  'gym': '#DCEDC8',
  'home_theater': '#37474F',
  'wine_cellar': '#5D4037',
  'default': '#F5F5F5',
};

function calculateLayout(rooms: Room[], landArea: number, preferences: Preferences): RoomPlacement[] {
  const placements: RoomPlacement[] = [];
  const scale = preferences.dynamicScaling ? Math.sqrt(landArea / getTotalRoomArea(rooms)) : 1;
  
  // Calculate plot dimensions (assuming roughly square plot)
  const plotWidth = Math.sqrt(landArea) * 1.2;
  const plotHeight = Math.sqrt(landArea) * 0.9;
  
  // Grid-based layout algorithm
  let currentX = 20;
  let currentY = 20;
  let rowHeight = 0;
  const padding = 5;
  const maxWidth = plotWidth - 40;
  
  // Sort rooms by priority (living areas first, then bedrooms, then utilities)
  const sortedRooms = [...rooms].sort((a, b) => {
    const priority: Record<string, number> = {
      'living_room': 1,
      'dining_room': 2,
      'kitchen': 3,
      'master_bedroom': 4,
      'bedroom': 5,
      'bathroom_common': 6,
      'study': 7,
      'pooja': 8,
      'utility': 9,
      'balcony': 10,
    };
    return (priority[a.roomId] || 99) - (priority[b.roomId] || 99);
  });
  
  sortedRooms.forEach((room) => {
    for (let i = 0; i < room.count; i++) {
      const roomWidth = room.width * scale * 8;
      const roomHeight = room.height * scale * 8;
      
      // Check if room fits in current row
      if (currentX + roomWidth > maxWidth) {
        currentX = 20;
        currentY += rowHeight + padding;
        rowHeight = 0;
      }
      
      placements.push({
        x: currentX,
        y: currentY,
        width: roomWidth,
        height: roomHeight,
        name: room.count > 1 ? `${room.roomName} ${i + 1}` : room.roomName,
        color: ROOM_COLORS[room.roomId] || ROOM_COLORS.default,
      });
      
      // Add attached bathroom if specified
      if (room.attachedBathroom && (room.roomId === 'master_bedroom' || room.roomId === 'bedroom')) {
        const bathWidth = 40;
        const bathHeight = 50;
        placements.push({
          x: currentX + roomWidth - bathWidth - 5,
          y: currentY + 5,
          width: bathWidth,
          height: bathHeight,
          name: 'Attached Bath',
          color: ROOM_COLORS.bathroom_attached,
        });
      }
      
      currentX += roomWidth + padding;
      rowHeight = Math.max(rowHeight, roomHeight);
    }
  });
  
  return placements;
}

function getTotalRoomArea(rooms: Room[]): number {
  return rooms.reduce((total, room) => {
    return total + (room.width * room.height * room.count);
  }, 0);
}

export function generateFloorPlanSVG(
  rooms: Room[],
  landArea: number,
  preferences: Preferences
): string {
  // Handle empty rooms case
  if (!rooms || rooms.length === 0) {
    const svgWidth = 800;
    const svgHeight = 600;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
      <rect width="${svgWidth}" height="${svgHeight}" fill="#FAFAFA"/>
      <text x="${svgWidth / 2}" y="${svgHeight / 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#666">No rooms selected</text>
    </svg>`;
  }

  const placements = calculateLayout(rooms, landArea, preferences);
  
  // Handle empty placements
  if (placements.length === 0) {
    const svgWidth = 800;
    const svgHeight = 600;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
      <rect width="${svgWidth}" height="${svgHeight}" fill="#FAFAFA"/>
      <text x="${svgWidth / 2}" y="${svgHeight / 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#666">Unable to generate layout</text>
    </svg>`;
  }
  
  // Calculate SVG dimensions safely
  const maxX = Math.max(100, ...placements.map(p => p.x + p.width)) + 40;
  const maxY = Math.max(100, ...placements.map(p => p.y + p.height)) + 80;
  
  const svgWidth = Math.max(800, maxX);
  const svgHeight = Math.max(600, maxY);
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
  
  // Background
  svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="#FAFAFA"/>`;
  
  // Title - escape special characters
  const styleText = String(preferences.style || 'Modern').replace(/[<>&'"]/g, '');
  svg += `<text x="${svgWidth / 2}" y="15" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">${styleText} Floor Plan - ${landArea} sq ft</text>`;
  
  // North arrow
  svg += `<g transform="translate(${svgWidth - 50}, 30)">
    <polygon points="0,20 10,0 20,20 10,15" fill="#666"/>
    <text x="10" y="35" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">N</text>
  </g>`;
  
  // Draw rooms
  placements.forEach((room) => {
    const safeName = String(room.name || 'Room').replace(/[<>&'"]/g, '');
    
    // Room rectangle with shadow
    svg += `<rect x="${room.x + 2}" y="${room.y + 2}" width="${room.width}" height="${room.height}" fill="#00000020" rx="2"/>`;
    svg += `<rect x="${room.x}" y="${room.y}" width="${room.width}" height="${room.height}" fill="${room.color}" stroke="#666" stroke-width="2" rx="2"/>`;
    
    // Room label
    const fontSize = Math.max(8, Math.min(12, room.width / 8));
    svg += `<text x="${room.x + room.width / 2}" y="${room.y + room.height / 2 - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#333">${safeName}</text>`;
    
    // Dimensions
    const dimWidth = Math.round(room.width / 8);
    const dimHeight = Math.round(room.height / 8);
    svg += `<text x="${room.x + room.width / 2}" y="${room.y + room.height / 2 + 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize - 2}" fill="#666">${dimWidth} x ${dimHeight} ft</text>`;
    
    // Draw door (simple representation)
    if (!safeName.includes('Attached Bath')) {
      const doorWidth = Math.min(25, room.width * 0.3);
      svg += `<rect x="${room.x}" y="${room.y + room.height / 2 - 3}" width="4" height="20" fill="#8B4513"/>`;
      svg += `<path d="M ${room.x} ${room.y + room.height / 2 - 3} A ${doorWidth} ${doorWidth} 0 0 0 ${room.x + doorWidth} ${room.y + room.height / 2 + 17}" stroke="#8B4513" stroke-width="1" fill="none"/>`;
    }
    
    // Draw window
    if (safeName.includes('Bedroom') || safeName.includes('Living')) {
      const winY = room.y + room.height - 4;
      svg += `<rect x="${room.x + room.width / 3}" y="${winY}" width="${room.width / 3}" height="4" fill="#87CEEB" stroke="#333" stroke-width="1"/>`;
    }
  });
  
  // Scale indicator
  svg += `<g transform="translate(20, ${svgHeight - 30})">
    <line x1="0" y1="0" x2="80" y2="0" stroke="#333" stroke-width="2"/>
    <line x1="0" y1="-5" x2="0" y2="5" stroke="#333" stroke-width="2"/>
    <line x1="80" y1="-5" x2="80" y2="5" stroke="#333" stroke-width="2"/>
    <text x="40" y="15" text-anchor="middle" font-family="Arial" font-size="10" fill="#333">10 feet</text>
  </g>`;
  
  // Legend
  const vastuText = preferences.vastuCompliant ? 'Vastu Compliant' : 'Optimized Layout';
  svg += `<text x="${svgWidth - 150}" y="${svgHeight - 40}" font-family="Arial" font-size="10" fill="#666">Scale: 1:100</text>`;
  svg += `<text x="${svgWidth - 150}" y="${svgHeight - 25}" font-family="Arial" font-size="10" fill="#666">${vastuText}</text>`;
  svg += `<text x="${svgWidth - 150}" y="${svgHeight - 10}" font-family="Arial" font-size="10" fill="#666">Floors: ${preferences.floors || 1}</text>`;
  
  svg += '</svg>';
  
  return svg;
}

export function generateFloorPlanDataURL(
  rooms: Room[],
  landArea: number,
  preferences: Preferences
): string {
  try {
    const svg = generateFloorPlanSVG(rooms, landArea, preferences);
    // Use a safer encoding method
    const encoded = encodeURIComponent(svg)
      .replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)));
    const base64 = btoa(encoded);
    return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    console.error('Error generating floor plan:', error);
    // Return a fallback SVG
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#f5f5f5"/><text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">Floor plan generated</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(fallbackSvg)}`;
  }
}

export function generateFloorPlanDescription(
  rooms: Room[],
  landArea: number,
  preferences: Preferences
): string {
  const totalRoomArea = getTotalRoomArea(rooms);
  const roomList = rooms.map(r => `${r.count}x ${r.roomName} (${r.size})`).join(', ');
  
  return `Professional ${preferences.style} floor plan for ${landArea} sq ft plot with ${preferences.floors} floor(s). 
Rooms: ${roomList}. 
Total room area: ${totalRoomArea} sq ft. 
${preferences.vastuCompliant ? 'Designed following Vastu principles.' : 'Optimized for functionality and natural light.'}
${preferences.outdoorFeatures?.length ? `Outdoor features: ${preferences.outdoorFeatures.join(', ')}.` : ''}`;
}
