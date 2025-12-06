import React from 'react';
import { PlacedRoom, ROOM_COLORS } from '@/utils/floorPlanGenerator';

interface FloorPlanSVGProps {
  rooms: PlacedRoom[];
  totalWidth: number;
  totalHeight: number;
  landArea: number;
  builtUpArea: number;
  style?: string;
  scaleFactor?: number;
  hasParking?: boolean;
  hasGarden?: boolean;
}

const SCALE = 12; // 1 foot = 12 pixels
const WALL_THICKNESS = 3;

// Furniture SVG components
const SofaSymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Main sofa body */}
    <rect x={width * 0.1} y={height * 0.3} width={width * 0.8} height={height * 0.5} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="3" />
    {/* Back cushion */}
    <rect x={width * 0.1} y={height * 0.15} width={width * 0.8} height={height * 0.2} fill="#A08060" stroke="#5D4E37" strokeWidth="1" rx="2" />
    {/* Armrests */}
    <rect x={width * 0.05} y={height * 0.3} width={width * 0.12} height={height * 0.5} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    <rect x={width * 0.83} y={height * 0.3} width={width * 0.12} height={height * 0.5} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    {/* Seat cushions */}
    <rect x={width * 0.15} y={height * 0.35} width={width * 0.3} height={height * 0.4} fill="#9B8B75" stroke="#5D4E37" strokeWidth="0.5" rx="2" />
    <rect x={width * 0.5} y={height * 0.35} width={width * 0.3} height={height * 0.4} fill="#9B8B75" stroke="#5D4E37" strokeWidth="0.5" rx="2" />
  </g>
);

const BedSymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Bed frame */}
    <rect x={width * 0.05} y={height * 0.05} width={width * 0.9} height={height * 0.9} fill="#E8DDD4" stroke="#8B7355" strokeWidth="1.5" />
    {/* Mattress */}
    <rect x={width * 0.1} y={height * 0.1} width={width * 0.8} height={height * 0.75} fill="#FFF8F0" stroke="#CCC" strokeWidth="1" />
    {/* Pillows */}
    <ellipse cx={width * 0.3} cy={height * 0.2} rx={width * 0.15} ry={height * 0.08} fill="#FFF" stroke="#DDD" strokeWidth="1" />
    <ellipse cx={width * 0.7} cy={height * 0.2} rx={width * 0.15} ry={height * 0.08} fill="#FFF" stroke="#DDD" strokeWidth="1" />
    {/* Headboard */}
    <rect x={width * 0.05} y={height * 0.02} width={width * 0.9} height={height * 0.1} fill="#6B4423" stroke="#4A2F17" strokeWidth="1" rx="2" />
  </g>
);

const DiningTableSymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Table */}
    <rect x={width * 0.2} y={height * 0.25} width={width * 0.6} height={height * 0.5} fill="#C4A77D" stroke="#8B6914" strokeWidth="1.5" rx="2" />
    {/* Chairs */}
    <rect x={width * 0.25} y={height * 0.1} width={width * 0.15} height={height * 0.12} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    <rect x={width * 0.6} y={height * 0.1} width={width * 0.15} height={height * 0.12} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    <rect x={width * 0.25} y={height * 0.78} width={width * 0.15} height={height * 0.12} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    <rect x={width * 0.6} y={height * 0.78} width={width * 0.15} height={height * 0.12} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    {/* Side chairs */}
    <rect x={width * 0.05} y={height * 0.4} width={height * 0.12} height={width * 0.15} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    <rect x={width * 0.83} y={height * 0.4} width={height * 0.12} height={width * 0.15} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
  </g>
);

const KitchenSymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Counter L-shape */}
    <rect x={width * 0.05} y={height * 0.05} width={width * 0.9} height={height * 0.25} fill="#A0522D" stroke="#6B3A1F" strokeWidth="1.5" />
    <rect x={width * 0.05} y={height * 0.05} width={width * 0.25} height={height * 0.7} fill="#A0522D" stroke="#6B3A1F" strokeWidth="1.5" />
    {/* Sink */}
    <rect x={width * 0.35} y={height * 0.1} width={width * 0.25} height={height * 0.12} fill="#E0E0E0" stroke="#888" strokeWidth="1" rx="2" />
    {/* Stove */}
    <rect x={width * 0.65} y={height * 0.08} width={width * 0.25} height={height * 0.15} fill="#333" stroke="#222" strokeWidth="1" />
    <circle cx={width * 0.72} cy={height * 0.15} r={width * 0.04} fill="#FF6B35" />
    <circle cx={width * 0.83} cy={height * 0.15} r={width * 0.04} fill="#FF6B35" />
    {/* Refrigerator */}
    <rect x={width * 0.75} y={height * 0.5} width={width * 0.2} height={height * 0.45} fill="#E8E8E8" stroke="#888" strokeWidth="1.5" rx="3" />
  </g>
);

const BathroomSymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Toilet */}
    <ellipse cx={width * 0.25} cy={height * 0.7} rx={width * 0.12} ry={height * 0.15} fill="#FFF" stroke="#888" strokeWidth="1.5" />
    <rect x={width * 0.15} y={height * 0.52} width={width * 0.2} height={height * 0.12} fill="#FFF" stroke="#888" strokeWidth="1.5" rx="2" />
    {/* Sink */}
    <ellipse cx={width * 0.25} cy={height * 0.25} rx={width * 0.1} ry={height * 0.08} fill="#E8F4F8" stroke="#888" strokeWidth="1" />
    <rect x={width * 0.18} y={height * 0.15} width={width * 0.14} height={height * 0.1} fill="#FFF" stroke="#888" strokeWidth="1" />
    {/* Shower */}
    <rect x={width * 0.55} y={height * 0.1} width={width * 0.4} height={height * 0.5} fill="#E8F4F8" stroke="#888" strokeWidth="1" strokeDasharray="4,2" />
    <circle cx={width * 0.75} cy={height * 0.2} r={width * 0.06} fill="#CCC" stroke="#888" strokeWidth="1" />
  </g>
);

const CarSymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Car body */}
    <rect x={width * 0.15} y={height * 0.2} width={width * 0.7} height={height * 0.6} fill="#4A5568" stroke="#2D3748" strokeWidth="1.5" rx="5" />
    {/* Windshield */}
    <rect x={width * 0.2} y={height * 0.25} width={width * 0.25} height={height * 0.2} fill="#A0AEC0" stroke="#718096" strokeWidth="1" rx="2" />
    {/* Rear window */}
    <rect x={width * 0.55} y={height * 0.25} width={width * 0.2} height={height * 0.2} fill="#A0AEC0" stroke="#718096" strokeWidth="1" rx="2" />
    {/* Wheels */}
    <ellipse cx={width * 0.28} cy={height * 0.75} rx={width * 0.08} ry={height * 0.06} fill="#1A202C" />
    <ellipse cx={width * 0.72} cy={height * 0.75} rx={width * 0.08} ry={height * 0.06} fill="#1A202C" />
    <ellipse cx={width * 0.28} cy={height * 0.25} rx={width * 0.08} ry={height * 0.06} fill="#1A202C" />
    <ellipse cx={width * 0.72} cy={height * 0.25} rx={width * 0.08} ry={height * 0.06} fill="#1A202C" />
  </g>
);

const TreeSymbol = ({ x, y, size }: { x: number; y: number; size: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle cx={0} cy={0} r={size} fill="#228B22" stroke="#1B5E20" strokeWidth="1" opacity="0.8" />
    <circle cx={size * 0.3} cy={-size * 0.2} r={size * 0.7} fill="#2E7D32" stroke="#1B5E20" strokeWidth="1" opacity="0.7" />
    <circle cx={-size * 0.3} cy={size * 0.2} r={size * 0.6} fill="#43A047" stroke="#1B5E20" strokeWidth="1" opacity="0.6" />
  </g>
);

const ChairSymbol = ({ x, y, width, height, rotation = 0 }: { x: number; y: number; width: number; height: number; rotation?: number }) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotation}, ${width/2}, ${height/2})`}>
    <rect x={width * 0.15} y={height * 0.3} width={width * 0.7} height={height * 0.5} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    <rect x={width * 0.2} y={height * 0.1} width={width * 0.6} height={height * 0.25} fill="#A08060" stroke="#5D4E37" strokeWidth="1" rx="2" />
  </g>
);

const DoorSymbol = ({ x, y, width, position, isOpen = true }: { 
  x: number; 
  y: number; 
  width: number; 
  position: 'top' | 'bottom' | 'left' | 'right';
  isOpen?: boolean;
}) => {
  const doorWidth = width * 0.4;
  
  if (position === 'bottom') {
    return (
      <g>
        {/* Door opening (white gap in wall) */}
        <line x1={x + width/2 - doorWidth/2} y1={y} x2={x + width/2 + doorWidth/2} y2={y} stroke="white" strokeWidth={WALL_THICKNESS + 2} />
        {/* Door arc */}
        <path
          d={`M ${x + width/2 - doorWidth/2} ${y} A ${doorWidth} ${doorWidth} 0 0 0 ${x + width/2 + doorWidth/2} ${y - doorWidth * 0.9}`}
          fill="none"
          stroke="#444"
          strokeWidth="1"
        />
        {/* Door leaf */}
        <line
          x1={x + width/2 - doorWidth/2}
          y1={y}
          x2={x + width/2 + doorWidth/2}
          y2={y - doorWidth * 0.9}
          stroke="#444"
          strokeWidth="2"
        />
      </g>
    );
  } else if (position === 'top') {
    return (
      <g>
        <line x1={x + width/2 - doorWidth/2} y1={y} x2={x + width/2 + doorWidth/2} y2={y} stroke="white" strokeWidth={WALL_THICKNESS + 2} />
        <path
          d={`M ${x + width/2 - doorWidth/2} ${y} A ${doorWidth} ${doorWidth} 0 0 1 ${x + width/2 + doorWidth/2} ${y + doorWidth * 0.9}`}
          fill="none"
          stroke="#444"
          strokeWidth="1"
        />
        <line
          x1={x + width/2 - doorWidth/2}
          y1={y}
          x2={x + width/2 + doorWidth/2}
          y2={y + doorWidth * 0.9}
          stroke="#444"
          strokeWidth="2"
        />
      </g>
    );
  } else if (position === 'left') {
    return (
      <g>
        <line x1={x} y1={y - doorWidth/2} x2={x} y2={y + doorWidth/2} stroke="white" strokeWidth={WALL_THICKNESS + 2} />
        <path
          d={`M ${x} ${y - doorWidth/2} A ${doorWidth} ${doorWidth} 0 0 1 ${x + doorWidth * 0.9} ${y + doorWidth/2}`}
          fill="none"
          stroke="#444"
          strokeWidth="1"
        />
        <line
          x1={x}
          y1={y - doorWidth/2}
          x2={x + doorWidth * 0.9}
          y2={y + doorWidth/2}
          stroke="#444"
          strokeWidth="2"
        />
      </g>
    );
  } else {
    return (
      <g>
        <line x1={x} y1={y - doorWidth/2} x2={x} y2={y + doorWidth/2} stroke="white" strokeWidth={WALL_THICKNESS + 2} />
        <path
          d={`M ${x} ${y - doorWidth/2} A ${doorWidth} ${doorWidth} 0 0 0 ${x - doorWidth * 0.9} ${y + doorWidth/2}`}
          fill="none"
          stroke="#444"
          strokeWidth="1"
        />
        <line
          x1={x}
          y1={y - doorWidth/2}
          x2={x - doorWidth * 0.9}
          y2={y + doorWidth/2}
          stroke="#444"
          strokeWidth="2"
        />
      </g>
    );
  }
};

const WindowSymbol = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => {
  const isHorizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1);
  
  return (
    <g>
      {/* Window gap */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth={WALL_THICKNESS + 2} />
      {/* Window frame */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#888" strokeWidth="2" />
      {/* Window glass lines */}
      {isHorizontal ? (
        <>
          <line x1={x1 + (x2-x1)*0.33} y1={y1 - 3} x2={x1 + (x2-x1)*0.33} y2={y1 + 3} stroke="#888" strokeWidth="1" />
          <line x1={x1 + (x2-x1)*0.66} y1={y1 - 3} x2={x1 + (x2-x1)*0.66} y2={y1 + 3} stroke="#888" strokeWidth="1" />
        </>
      ) : (
        <>
          <line x1={x1 - 3} y1={y1 + (y2-y1)*0.33} x2={x1 + 3} y2={y1 + (y2-y1)*0.33} stroke="#888" strokeWidth="1" />
          <line x1={x1 - 3} y1={y1 + (y2-y1)*0.66} x2={x1 + 3} y2={y1 + (y2-y1)*0.66} stroke="#888" strokeWidth="1" />
        </>
      )}
    </g>
  );
};

const getFurnitureForRoom = (room: PlacedRoom, x: number, y: number, w: number, h: number) => {
  const roomType = room.roomType.toLowerCase();
  
  if (roomType.includes('living')) {
    return (
      <>
        <SofaSymbol x={x + w * 0.1} y={y + h * 0.1} width={w * 0.6} height={h * 0.35} />
        <ChairSymbol x={x + w * 0.7} y={y + h * 0.3} width={w * 0.2} height={h * 0.25} rotation={-90} />
        {/* Coffee table */}
        <rect x={x + w * 0.3} y={y + h * 0.5} width={w * 0.25} height={h * 0.15} fill="#C4A77D" stroke="#8B6914" strokeWidth="1" rx="2" />
      </>
    );
  } else if (roomType.includes('master') || roomType.includes('bedroom')) {
    return <BedSymbol x={x + w * 0.15} y={y + h * 0.15} width={w * 0.7} height={h * 0.7} />;
  } else if (roomType.includes('dining')) {
    return <DiningTableSymbol x={x + w * 0.1} y={y + h * 0.1} width={w * 0.8} height={h * 0.8} />;
  } else if (roomType.includes('kitchen')) {
    return <KitchenSymbol x={x + w * 0.05} y={y + h * 0.05} width={w * 0.9} height={h * 0.9} />;
  } else if (roomType.includes('bathroom')) {
    return <BathroomSymbol x={x + w * 0.05} y={y + h * 0.05} width={w * 0.9} height={h * 0.9} />;
  } else if (roomType.includes('parking')) {
    return <CarSymbol x={x + w * 0.1} y={y + h * 0.15} width={w * 0.8} height={h * 0.7} />;
  }
  
  return null;
};

export const FloorPlanSVG: React.FC<FloorPlanSVGProps> = ({
  rooms,
  totalWidth,
  totalHeight,
  landArea,
  builtUpArea,
  style = 'Modern',
  scaleFactor = 1,
  hasParking = false,
  hasGarden = false,
}) => {
  const padding = 80;
  const svgWidth = totalWidth * SCALE + padding * 2;
  const svgHeight = totalHeight * SCALE + padding * 2 + 60;

  // Calculate building bounds
  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
  rooms.forEach(room => {
    minX = Math.min(minX, room.x);
    minY = Math.min(minY, room.y);
    maxX = Math.max(maxX, room.x + room.width);
    maxY = Math.max(maxY, room.y + room.height);
  });

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full h-auto"
      style={{ maxHeight: '700px', backgroundColor: '#FAFAFA' }}
    >
      {/* Plot boundary (light grid pattern) */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E5E5" strokeWidth="0.5" />
        </pattern>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6">
          <path d="M0,0 l6,6 M-1,5 l2,2 M5,-1 l2,2" stroke="#B3E5FC" strokeWidth="0.5" fill="none" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#grid)" />

      {/* Garden area if enabled */}
      {hasGarden && (
        <g>
          <rect
            x={maxX * SCALE + padding + 10}
            y={padding}
            width={40}
            height={(maxY - minY) * SCALE}
            fill="#E8F5E9"
            stroke="#81C784"
            strokeWidth="1"
          />
          {/* Trees */}
          <TreeSymbol x={maxX * SCALE + padding + 30} y={padding + 40} size={15} />
          <TreeSymbol x={maxX * SCALE + padding + 30} y={padding + 100} size={12} />
          <TreeSymbol x={maxX * SCALE + padding + 30} y={padding + 160} size={14} />
        </g>
      )}

      {/* Rooms with colors and furniture */}
      {rooms.map((room) => {
        const x = room.x * SCALE + padding;
        const y = room.y * SCALE + padding;
        const w = room.width * SCALE;
        const h = room.height * SCALE;
        const color = ROOM_COLORS[room.roomType] || '#FFF';

        return (
          <g key={room.id}>
            {/* Room fill */}
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={color}
              stroke="#444"
              strokeWidth={WALL_THICKNESS}
            />

            {/* Furniture */}
            {getFurnitureForRoom(room, x, y, w, h)}

            {/* Room name */}
            <text
              x={x + w / 2}
              y={y + h / 2 - 8}
              fontSize="11"
              fontWeight="600"
              fill="#333"
              textAnchor="middle"
              style={{ fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}
            >
              {room.name}
            </text>

            {/* Dimensions */}
            <text
              x={x + w / 2}
              y={y + h / 2 + 8}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              {room.width}' × {room.height}'
            </text>

            {/* Door */}
            {room.hasDoor && (
              <DoorSymbol
                x={room.doorPosition === 'left' || room.doorPosition === 'right' ? 
                  (room.doorPosition === 'left' ? x : x + w) : x}
                y={room.doorPosition === 'top' || room.doorPosition === 'bottom' ?
                  (room.doorPosition === 'top' ? y : y + h) : y + h / 2}
                width={room.doorPosition === 'left' || room.doorPosition === 'right' ? h : w}
                position={room.doorPosition}
              />
            )}

            {/* Windows */}
            {room.hasWindow && room.windowPositions.map((pos, idx) => {
              const windowLength = Math.min(w, h) * 0.4;
              let wx1, wy1, wx2, wy2;
              
              if (pos === 'left') {
                wx1 = x; wy1 = y + h/2 - windowLength/2;
                wx2 = x; wy2 = y + h/2 + windowLength/2;
              } else if (pos === 'right') {
                wx1 = x + w; wy1 = y + h/2 - windowLength/2;
                wx2 = x + w; wy2 = y + h/2 + windowLength/2;
              } else if (pos === 'top') {
                wx1 = x + w/2 - windowLength/2; wy1 = y;
                wx2 = x + w/2 + windowLength/2; wy2 = y;
              } else {
                wx1 = x + w/2 - windowLength/2; wy1 = y + h;
                wx2 = x + w/2 + windowLength/2; wy2 = y + h;
              }
              
              return <WindowSymbol key={idx} x1={wx1!} y1={wy1!} x2={wx2!} y2={wy2!} />;
            })}
          </g>
        );
      })}

      {/* Outer building wall (thicker) */}
      <rect
        x={minX * SCALE + padding - 2}
        y={minY * SCALE + padding - 2}
        width={(maxX - minX) * SCALE + 4}
        height={(maxY - minY) * SCALE + 4}
        fill="none"
        stroke="#2D3748"
        strokeWidth={WALL_THICKNESS + 2}
      />

      {/* North arrow */}
      <g transform={`translate(${svgWidth - 60}, 50)`}>
        <circle cx="0" cy="0" r="22" fill="white" stroke="#333" strokeWidth="1.5" />
        <polygon points="0,-18 -6,-4 0,-8 6,-4" fill="#333" />
        <text x="0" y="-24" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#333">N</text>
      </g>

      {/* Scale bar */}
      <g transform={`translate(${padding}, ${svgHeight - 45})`}>
        <line x1="0" y1="0" x2={10 * SCALE} y2="0" stroke="#333" strokeWidth="3" />
        <line x1="0" y1="-6" x2="0" y2="6" stroke="#333" strokeWidth="2" />
        <line x1={10 * SCALE} y1="-6" x2={10 * SCALE} y2="6" stroke="#333" strokeWidth="2" />
        <text x={5 * SCALE} y="18" fontSize="11" textAnchor="middle" fill="#333">10 ft</text>
        <text x={5 * SCALE} y="-12" fontSize="9" textAnchor="middle" fill="#666">Scale 1:100</text>
      </g>

      {/* Title block */}
      <g transform={`translate(${svgWidth / 2}, ${svgHeight - 20})`}>
        <text fontSize="13" fontWeight="bold" textAnchor="middle" fill="#333">
          FLOOR PLAN - {landArea} SQ FT - {style.toUpperCase()} STYLE
        </text>
      </g>

      {/* Area summary box */}
      <g transform={`translate(${svgWidth - 160}, ${svgHeight - 80})`}>
        <rect x="0" y="0" width="150" height="55" fill="white" stroke="#CCC" strokeWidth="1" rx="4" />
        <text x="10" y="18" fontSize="10" fill="#333" fontWeight="600">Land Area: {landArea} sq ft</text>
        <text x="10" y="33" fontSize="10" fill="#333">Built-up: {builtUpArea} sq ft</text>
        {scaleFactor < 1 && (
          <text x="10" y="48" fontSize="9" fill="#E53935">
            Scaled to fit: {(scaleFactor * 100).toFixed(0)}%
          </text>
        )}
      </g>
    </svg>
  );
};

export default FloorPlanSVG;
