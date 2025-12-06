// Procedural render generator using Canvas - no AI required

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

const STYLE_COLORS: Record<string, { primary: string; secondary: string; accent: string; roof: string }> = {
  'Modern': { primary: '#E0E0E0', secondary: '#BDBDBD', accent: '#2196F3', roof: '#424242' },
  'Contemporary': { primary: '#F5F5F5', secondary: '#EEEEEE', accent: '#FF5722', roof: '#616161' },
  'Traditional': { primary: '#D7CCC8', secondary: '#BCAAA4', accent: '#795548', roof: '#5D4037' },
  'Minimalist': { primary: '#FAFAFA', secondary: '#F5F5F5', accent: '#000000', roof: '#9E9E9E' },
  'Luxury': { primary: '#FFF8E1', secondary: '#FFE082', accent: '#FFD700', roof: '#5D4037' },
  'Scandinavian': { primary: '#FFFFFF', secondary: '#ECEFF1', accent: '#4CAF50', roof: '#455A64' },
  'Industrial': { primary: '#9E9E9E', secondary: '#757575', accent: '#FF5722', roof: '#37474F' },
  'Colonial': { primary: '#FFF8E1', secondary: '#FFECB3', accent: '#8D6E63', roof: '#3E2723' },
  'Mediterranean': { primary: '#FFCCBC', secondary: '#FFAB91', accent: '#1565C0', roof: '#BF360C' },
  'Rustic': { primary: '#A1887F', secondary: '#8D6E63', accent: '#4E342E', roof: '#3E2723' },
};

export function generateExteriorView(
  rooms: Room[],
  landArea: number,
  preferences: Preferences,
  viewType: string = '360'
): string {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 600;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  const colors = STYLE_COLORS[preferences.style] || STYLE_COLORS['Modern'];
  
  // Sky gradient
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
  skyGradient.addColorStop(0, '#87CEEB');
  skyGradient.addColorStop(1, '#E0F7FA');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height * 0.6);
  
  // Ground
  const groundGradient = ctx.createLinearGradient(0, height * 0.6, 0, height);
  groundGradient.addColorStop(0, '#81C784');
  groundGradient.addColorStop(1, '#4CAF50');
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, height * 0.6, width, height * 0.4);
  
  // Calculate house dimensions based on rooms
  const totalArea = rooms.reduce((sum, r) => sum + (r.width * r.height * r.count), 0);
  const houseWidth = Math.min(500, Math.sqrt(totalArea) * 15);
  const houseHeight = Math.min(300, houseWidth * 0.6);
  const houseX = (width - houseWidth) / 2;
  const houseY = height * 0.55 - houseHeight;
  
  // House shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(width / 2, height * 0.58, houseWidth * 0.6, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Main building
  ctx.fillStyle = colors.primary;
  ctx.fillRect(houseX, houseY, houseWidth, houseHeight);
  
  // Add depth/shadow on side
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(houseX + houseWidth - 20, houseY, 20, houseHeight);
  
  // Roof based on style
  ctx.fillStyle = colors.roof;
  ctx.beginPath();
  if (preferences.style === 'Modern' || preferences.style === 'Minimalist') {
    // Flat roof
    ctx.rect(houseX - 10, houseY - 15, houseWidth + 20, 15);
  } else if (preferences.style === 'Mediterranean') {
    // Curved tile roof
    ctx.moveTo(houseX - 20, houseY);
    ctx.quadraticCurveTo(width / 2, houseY - 100, houseX + houseWidth + 20, houseY);
  } else {
    // Triangular roof
    ctx.moveTo(houseX - 20, houseY);
    ctx.lineTo(width / 2, houseY - 80);
    ctx.lineTo(houseX + houseWidth + 20, houseY);
  }
  ctx.closePath();
  ctx.fill();
  
  // Windows
  const windowRows = preferences.floors;
  const windowsPerRow = Math.min(5, Math.floor(houseWidth / 80));
  ctx.fillStyle = '#B3E5FC';
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  
  for (let row = 0; row < windowRows; row++) {
    for (let col = 0; col < windowsPerRow; col++) {
      const winX = houseX + 40 + col * (houseWidth - 60) / windowsPerRow;
      const winY = houseY + 30 + row * (houseHeight / (windowRows + 1));
      const winW = 40;
      const winH = 50;
      
      ctx.fillRect(winX, winY, winW, winH);
      ctx.strokeRect(winX, winY, winW, winH);
      
      // Window cross
      ctx.beginPath();
      ctx.moveTo(winX + winW / 2, winY);
      ctx.lineTo(winX + winW / 2, winY + winH);
      ctx.moveTo(winX, winY + winH / 2);
      ctx.lineTo(winX + winW, winY + winH / 2);
      ctx.stroke();
    }
  }
  
  // Door
  ctx.fillStyle = '#5D4037';
  const doorX = width / 2 - 25;
  const doorY = houseY + houseHeight - 70;
  ctx.fillRect(doorX, doorY, 50, 70);
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(doorX + 40, doorY + 40, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Landscaping
  if (preferences.outdoorFeatures?.includes('Garden') || preferences.outdoorFeatures?.includes('Lawn')) {
    // Bushes
    ctx.fillStyle = '#2E7D32';
    for (let i = 0; i < 5; i++) {
      const bushX = houseX - 50 + i * 30;
      ctx.beginPath();
      ctx.arc(bushX, height * 0.58, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 5; i++) {
      const bushX = houseX + houseWidth + 20 - i * 30;
      ctx.beginPath();
      ctx.arc(bushX, height * 0.58, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Trees
  ctx.fillStyle = '#1B5E20';
  const drawTree = (x: number, y: number, size: number) => {
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x - 5, y, 10, 30);
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x, y - size * 1.5);
    ctx.lineTo(x + size, y);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - size * 0.8, y - size * 0.5);
    ctx.lineTo(x, y - size * 1.8);
    ctx.lineTo(x + size * 0.8, y - size * 0.5);
    ctx.closePath();
    ctx.fill();
  };
  
  drawTree(80, height * 0.55, 40);
  drawTree(width - 80, height * 0.55, 35);
  
  // Driveway/Path
  ctx.fillStyle = '#9E9E9E';
  ctx.beginPath();
  ctx.moveTo(width / 2 - 40, height * 0.58);
  ctx.lineTo(width / 2 + 40, height * 0.58);
  ctx.lineTo(width / 2 + 60, height);
  ctx.lineTo(width / 2 - 60, height);
  ctx.closePath();
  ctx.fill();
  
  // Add view label
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(10, 10, 150, 30);
  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  const viewLabel = viewType === '360' ? '360° Exterior View' : 
                    viewType === 'front' ? 'Front View' :
                    viewType === 'side' ? 'Side View' :
                    viewType === 'back' ? 'Back View' : 'Top View';
  ctx.fillText(viewLabel, 20, 30);
  
  // Style label
  ctx.fillRect(10, 50, 150, 30);
  ctx.fillText(`${preferences.style} Style`, 20, 70);
  
  return canvas.toDataURL('image/png');
}

export function generateInteriorView(
  roomName: string,
  rooms: Room[],
  preferences: Preferences
): string {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 600;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  const colors = STYLE_COLORS[preferences.style] || STYLE_COLORS['Modern'];
  
  // Room background (walls)
  const wallGradient = ctx.createLinearGradient(0, 0, 0, height);
  wallGradient.addColorStop(0, colors.primary);
  wallGradient.addColorStop(1, colors.secondary);
  ctx.fillStyle = wallGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Floor perspective
  ctx.fillStyle = roomName.toLowerCase().includes('bathroom') ? '#E0E0E0' : 
                  roomName.toLowerCase().includes('kitchen') ? '#BDBDBD' : '#8D6E63';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.65);
  ctx.lineTo(width, height * 0.65);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  
  // Floor tiles/pattern
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 15; i++) {
    const x = i * (width / 10);
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.65);
    ctx.lineTo(x * 2 - width / 2, height);
    ctx.stroke();
  }
  
  // Wall accent (baseboard)
  ctx.fillStyle = colors.accent;
  ctx.fillRect(0, height * 0.63, width, 10);
  
  // Window
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(width * 0.6, height * 0.15, 150, 180);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 8;
  ctx.strokeRect(width * 0.6, height * 0.15, 150, 180);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width * 0.6 + 75, height * 0.15);
  ctx.lineTo(width * 0.6 + 75, height * 0.15 + 180);
  ctx.stroke();
  
  // Curtains
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillRect(width * 0.55, height * 0.1, 30, 200);
  ctx.fillRect(width * 0.6 + 155, height * 0.1, 30, 200);
  
  // Room-specific furniture
  if (roomName.toLowerCase().includes('living')) {
    // Sofa
    ctx.fillStyle = '#455A64';
    ctx.fillRect(100, height * 0.45, 250, 80);
    ctx.fillRect(80, height * 0.4, 20, 130);
    ctx.fillRect(350, height * 0.4, 20, 130);
    // Cushions
    ctx.fillStyle = colors.accent;
    ctx.fillRect(120, height * 0.47, 60, 40);
    ctx.fillRect(200, height * 0.47, 60, 40);
    ctx.fillRect(280, height * 0.47, 60, 40);
    // Coffee table
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(150, height * 0.55, 150, 60);
    // TV
    ctx.fillStyle = '#212121';
    ctx.fillRect(width * 0.1, height * 0.2, 200, 120);
    ctx.fillStyle = '#424242';
    ctx.fillRect(width * 0.1 + 5, height * 0.2 + 5, 190, 110);
  } else if (roomName.toLowerCase().includes('bedroom')) {
    // Bed
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(200, height * 0.35, 300, 200);
    // Mattress
    ctx.fillStyle = '#fff';
    ctx.fillRect(210, height * 0.37, 280, 180);
    // Pillows
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(220, height * 0.38, 80, 50);
    ctx.fillRect(320, height * 0.38, 80, 50);
    // Blanket
    ctx.fillStyle = colors.accent;
    ctx.fillRect(210, height * 0.5, 280, 80);
    // Nightstand
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(130, height * 0.45, 60, 70);
    ctx.fillRect(510, height * 0.45, 60, 70);
    // Lamp
    ctx.fillStyle = '#FFE082';
    ctx.fillRect(150, height * 0.38, 20, 30);
    ctx.beginPath();
    ctx.arc(160, height * 0.35, 25, 0, Math.PI, true);
    ctx.fill();
  } else if (roomName.toLowerCase().includes('kitchen')) {
    // Counter
    ctx.fillStyle = '#424242';
    ctx.fillRect(50, height * 0.4, 300, 100);
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(50, height * 0.38, 300, 20);
    // Cabinets
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(50, height * 0.15, 300, 120);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(60 + i * 70, height * 0.17, 60, 100);
    }
    // Stove
    ctx.fillStyle = '#212121';
    ctx.fillRect(400, height * 0.4, 150, 100);
    ctx.fillStyle = '#f44336';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(425 + (i % 2) * 50, height * 0.45 + Math.floor(i / 2) * 35, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    // Refrigerator
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(600, height * 0.2, 100, 230);
    ctx.fillStyle = '#757575';
    ctx.fillRect(600, height * 0.35, 100, 5);
  } else if (roomName.toLowerCase().includes('dining')) {
    // Table
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(200, height * 0.4, 300, 150);
    // Chairs
    ctx.fillStyle = '#3E2723';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(220 + i * 100, height * 0.35, 60, 10);
      ctx.fillRect(220 + i * 100, height * 0.55, 60, 10);
    }
    // Chandelier
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(350, height * 0.15, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF8E1';
    ctx.beginPath();
    ctx.arc(350, height * 0.15, 25, 0, Math.PI * 2);
    ctx.fill();
  } else if (roomName.toLowerCase().includes('bathroom')) {
    // Toilet
    ctx.fillStyle = '#fff';
    ctx.fillRect(100, height * 0.45, 60, 80);
    ctx.beginPath();
    ctx.ellipse(130, height * 0.48, 25, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sink
    ctx.fillStyle = '#fff';
    ctx.fillRect(250, height * 0.4, 100, 50);
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.ellipse(300, height * 0.45, 30, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Mirror
    ctx.fillStyle = '#B3E5FC';
    ctx.fillRect(260, height * 0.2, 80, 100);
    ctx.strokeStyle = '#9E9E9E';
    ctx.lineWidth = 4;
    ctx.strokeRect(260, height * 0.2, 80, 100);
    // Shower
    ctx.fillStyle = '#E0F7FA';
    ctx.fillRect(450, height * 0.25, 150, 200);
    ctx.strokeStyle = '#B2EBF2';
    ctx.lineWidth = 3;
    ctx.strokeRect(450, height * 0.25, 150, 200);
  } else {
    // Generic room with desk/chair
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(200, height * 0.45, 200, 80);
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(280, height * 0.35, 60, 60);
    ctx.fillRect(280, height * 0.55, 60, 10);
  }
  
  // Ceiling fan
  ctx.fillStyle = '#9E9E9E';
  ctx.beginPath();
  ctx.arc(width / 2, 30, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#BDBDBD';
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(width / 2, 30);
    ctx.rotate((i * Math.PI) / 2);
    ctx.fillRect(0, -5, 80, 10);
    ctx.restore();
  }
  
  // Room label
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(10, 10, 200, 30);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial';
  ctx.fillText(roomName, 20, 30);
  
  ctx.fillRect(10, 50, 150, 30);
  ctx.font = '14px Arial';
  ctx.fillText(`${preferences.style} Style`, 20, 70);
  
  return canvas.toDataURL('image/png');
}

export function generateViewDescription(viewType: string, roomName: string | undefined, preferences: Preferences): string {
  if (roomName) {
    return `${preferences.style} style interior view of the ${roomName}. Features characteristic design elements including coordinated colors, appropriate furniture placement, and style-specific finishes.`;
  }
  
  const viewDescriptions: Record<string, string> = {
    '360': `Complete 360° exterior view of the ${preferences.style} style home featuring characteristic architectural elements, landscaping, and outdoor spaces.`,
    'front': `Front elevation view showcasing the main entrance, facade design, and ${preferences.style} architectural details.`,
    'side': `Side profile view highlighting the building's proportions, window placements, and ${preferences.style} design elements.`,
    'back': `Rear view of the property showing the backyard area, back entrance, and any outdoor features.`,
    'top': `Bird's eye view of the property layout showing roof design, outdoor spaces, and overall property arrangement.`,
  };
  
  return viewDescriptions[viewType] || 'Rendered view of the property.';
}
