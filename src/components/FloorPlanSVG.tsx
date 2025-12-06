import React from 'react';
import { PlacedRoom } from '@/utils/floorPlanGenerator';

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

const SCALE = 15; // 1 foot = 15 pixels (larger for more detail)
const WALL_THICKNESS = 6;
const INNER_WALL_THICKNESS = 4;

// Enhanced room colors matching reference images
const ENHANCED_ROOM_COLORS: Record<string, string> = {
  'living_room': '#B8D4E8',    // Soft blue
  'kitchen': '#C5E8C5',        // Soft green
  'dining_room': '#F5E6B3',    // Soft yellow
  'master_bedroom': '#F5C6AA', // Soft peach/orange
  'bedroom': '#F5D0E0',        // Soft pink
  'bathroom_common': '#D4E8F0', // Light cyan
  'bathroom_attached': '#D4E8F0',
  'utility': '#E8E8E8',        // Light gray
  'balcony': '#C8E6C9',        // Light green
  'pooja': '#FFE0B2',          // Light orange
  'parking': '#E0E0E0',        // Gray
  'foyer': '#F0F0F0',          // Very light gray
  'hallway': '#E8E8E8',        // Light gray
  'store': '#E8D4C4',          // Light brown
  'home_theatre': '#E8C4C4',   // Light rose
  'guest_room': '#F5D0B0',     // Light peach
  'study': '#D4D8E8',          // Light indigo
  'terrace': '#A8D8A8',        // Medium green
  'garden': '#90C890',         // Green
  'walk_in': '#E0D0E0',        // Light purple
  'sitout': '#D8E8D8',         // Light sage
};

// Detailed furniture SVG components
const SofaSymbol = ({ x, y, width, height, rotation = 0 }: { x: number; y: number; width: number; height: number; rotation?: number }) => (
  <g transform={`translate(${x + width/2}, ${y + height/2}) rotate(${rotation}) translate(${-width/2}, ${-height/2})`}>
    {/* Main sofa body */}
    <rect x={width * 0.05} y={height * 0.15} width={width * 0.9} height={height * 0.7} fill="#8B7355" stroke="#5D4E37" strokeWidth="2" rx="4" />
    {/* Back cushion */}
    <rect x={width * 0.05} y={height * 0.05} width={width * 0.9} height={height * 0.15} fill="#6B5344" stroke="#4D3E2F" strokeWidth="1.5" rx="3" />
    {/* Seat cushions */}
    <rect x={width * 0.1} y={height * 0.25} width={width * 0.35} height={height * 0.5} fill="#A08060" stroke="#5D4E37" strokeWidth="1" rx="3" />
    <rect x={width * 0.5} y={height * 0.25} width={width * 0.35} height={height * 0.5} fill="#A08060" stroke="#5D4E37" strokeWidth="1" rx="3" />
    {/* Armrests */}
    <rect x={width * 0.02} y={height * 0.15} width={width * 0.08} height={height * 0.7} fill="#7B6345" stroke="#5D4E37" strokeWidth="1" rx="3" />
    <rect x={width * 0.9} y={height * 0.15} width={width * 0.08} height={height * 0.7} fill="#7B6345" stroke="#5D4E37" strokeWidth="1" rx="3" />
  </g>
);

const SingleChairSymbol = ({ x, y, size, rotation = 0 }: { x: number; y: number; size: number; rotation?: number }) => (
  <g transform={`translate(${x + size/2}, ${y + size/2}) rotate(${rotation})`}>
    {/* Chair seat */}
    <rect x={-size * 0.4} y={-size * 0.4} width={size * 0.8} height={size * 0.8} fill="#A08060" stroke="#5D4E37" strokeWidth="1.5" rx="3" />
    {/* Chair back */}
    <rect x={-size * 0.4} y={-size * 0.5} width={size * 0.8} height={size * 0.15} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
  </g>
);

const CoffeeTableSymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={width * 0.1} y={height * 0.1} width={width * 0.8} height={height * 0.8} fill="#C4A77D" stroke="#8B6914" strokeWidth="2" rx="3" />
    {/* Table top detail */}
    <rect x={width * 0.2} y={height * 0.2} width={width * 0.6} height={height * 0.6} fill="none" stroke="#9B8060" strokeWidth="1" rx="2" />
  </g>
);

const BedSymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Bed frame */}
    <rect x={width * 0.02} y={height * 0.02} width={width * 0.96} height={height * 0.96} fill="#E8DDD4" stroke="#8B7355" strokeWidth="2" />
    {/* Mattress */}
    <rect x={width * 0.06} y={height * 0.15} width={width * 0.88} height={height * 0.78} fill="#FFF8F0" stroke="#CCC" strokeWidth="1" />
    {/* Headboard */}
    <rect x={width * 0.02} y={height * 0.02} width={width * 0.96} height={height * 0.12} fill="#6B4423" stroke="#4A2F17" strokeWidth="1.5" rx="3" />
    {/* Pillows */}
    <ellipse cx={width * 0.3} cy={height * 0.22} rx={width * 0.18} ry={height * 0.06} fill="#FFF" stroke="#DDD" strokeWidth="1" />
    <ellipse cx={width * 0.7} cy={height * 0.22} rx={width * 0.18} ry={height * 0.06} fill="#FFF" stroke="#DDD" strokeWidth="1" />
    {/* Blanket fold */}
    <line x1={width * 0.1} y1={height * 0.55} x2={width * 0.9} y2={height * 0.55} stroke="#DDD" strokeWidth="1" />
  </g>
);

const NightstandSymbol = ({ x, y, size }: { x: number; y: number; size: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={0} y={0} width={size} height={size} fill="#A08060" stroke="#6B5344" strokeWidth="1.5" rx="2" />
    {/* Lamp */}
    <ellipse cx={size * 0.5} cy={size * 0.35} rx={size * 0.25} ry={size * 0.15} fill="#F5E6D3" stroke="#CCC" strokeWidth="1" />
    <rect x={size * 0.4} y={size * 0.45} width={size * 0.2} height={size * 0.25} fill="#8B7355" stroke="#5D4E37" strokeWidth="0.5" />
  </g>
);

const DiningTableSymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Table */}
    <rect x={width * 0.2} y={height * 0.25} width={width * 0.6} height={height * 0.5} fill="#C4A77D" stroke="#8B6914" strokeWidth="2" rx="3" />
    {/* Chairs around table */}
    {/* Top chairs */}
    <rect x={width * 0.25} y={height * 0.08} width={width * 0.18} height={height * 0.14} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    <rect x={width * 0.57} y={height * 0.08} width={width * 0.18} height={height * 0.14} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    {/* Bottom chairs */}
    <rect x={width * 0.25} y={height * 0.78} width={width * 0.18} height={height * 0.14} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    <rect x={width * 0.57} y={height * 0.78} width={width * 0.18} height={height * 0.14} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    {/* Side chairs */}
    <rect x={width * 0.04} y={height * 0.38} width={height * 0.14} height={width * 0.18} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    <rect x={width * 0.82} y={height * 0.38} width={height * 0.14} height={width * 0.18} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
  </g>
);

const KitchenSymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* L-shaped counter */}
    <rect x={width * 0.02} y={height * 0.02} width={width * 0.96} height={height * 0.25} fill="#A0522D" stroke="#6B3A1F" strokeWidth="2" />
    <rect x={width * 0.02} y={height * 0.02} width={width * 0.22} height={height * 0.75} fill="#A0522D" stroke="#6B3A1F" strokeWidth="2" />
    {/* Sink */}
    <rect x={width * 0.35} y={height * 0.06} width={width * 0.22} height={height * 0.14} fill="#E8E8E8" stroke="#888" strokeWidth="1.5" rx="2" />
    <ellipse cx={width * 0.46} cy={height * 0.13} rx={width * 0.06} ry={height * 0.04} fill="#D0D0D0" stroke="#888" strokeWidth="0.5" />
    {/* Stove/Hob */}
    <rect x={width * 0.62} y={height * 0.05} width={width * 0.28} height={height * 0.16} fill="#333" stroke="#222" strokeWidth="1.5" rx="2" />
    <circle cx={width * 0.7} cy={height * 0.13} r={width * 0.04} fill="none" stroke="#666" strokeWidth="1.5" />
    <circle cx={width * 0.82} cy={height * 0.13} r={width * 0.04} fill="none" stroke="#666" strokeWidth="1.5" />
    {/* Refrigerator */}
    <rect x={width * 0.72} y={height * 0.55} width={width * 0.24} height={height * 0.42} fill="#E8E8E8" stroke="#888" strokeWidth="2" rx="3" />
    <line x1={width * 0.72} y1={height * 0.72} x2={width * 0.96} y2={height * 0.72} stroke="#888" strokeWidth="1" />
    {/* Counter island */}
    <rect x={width * 0.35} y={height * 0.5} width={width * 0.3} height={height * 0.35} fill="#B8804D" stroke="#6B3A1F" strokeWidth="1.5" rx="2" />
  </g>
);

const BathroomSymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Floor tiles pattern */}
    <defs>
      <pattern id={`tiles-${x}-${y}`} patternUnits="userSpaceOnUse" width="12" height="12">
        <rect width="12" height="12" fill="#E8F4F8" />
        <rect x="0" y="0" width="6" height="6" fill="#D8E8F0" />
        <rect x="6" y="6" width="6" height="6" fill="#D8E8F0" />
      </pattern>
    </defs>
    <rect x={0} y={0} width={width} height={height} fill={`url(#tiles-${x}-${y})`} />
    
    {/* Toilet */}
    <ellipse cx={width * 0.25} cy={height * 0.72} rx={width * 0.13} ry={height * 0.12} fill="#FFF" stroke="#888" strokeWidth="2" />
    <rect x={width * 0.14} y={height * 0.55} width={width * 0.22} height={height * 0.1} fill="#FFF" stroke="#888" strokeWidth="1.5" rx="3" />
    
    {/* Sink with vanity */}
    <rect x={width * 0.12} y={height * 0.1} width={width * 0.26} height={height * 0.18} fill="#FFF" stroke="#888" strokeWidth="1.5" rx="2" />
    <ellipse cx={width * 0.25} cy={height * 0.19} rx={width * 0.08} ry={height * 0.05} fill="#E8F4F8" stroke="#888" strokeWidth="1" />
    
    {/* Shower area */}
    <rect x={width * 0.55} y={height * 0.08} width={width * 0.4} height={height * 0.55} fill="#E0F0F8" stroke="#888" strokeWidth="1" strokeDasharray="4,2" />
    <circle cx={width * 0.75} cy={height * 0.18} r={width * 0.06} fill="#CCC" stroke="#888" strokeWidth="1" />
    
    {/* Shower drain */}
    <circle cx={width * 0.75} cy={height * 0.5} r={width * 0.03} fill="#888" />
  </g>
);

const CarSymbol = ({ x, y, width, height, rotation = 0 }: { x: number; y: number; width: number; height: number; rotation?: number }) => (
  <g transform={`translate(${x + width/2}, ${y + height/2}) rotate(${rotation}) translate(${-width/2}, ${-height/2})`}>
    {/* Car outline */}
    <rect x={width * 0.12} y={height * 0.15} width={width * 0.76} height={height * 0.7} fill="#4A5568" stroke="#2D3748" strokeWidth="2" rx="8" />
    {/* Hood/Bonnet */}
    <rect x={width * 0.15} y={height * 0.15} width={width * 0.25} height={height * 0.18} fill="#5A6578" stroke="#3D4758" strokeWidth="1" rx="4" />
    {/* Windshield */}
    <rect x={width * 0.25} y={height * 0.2} width={width * 0.22} height={height * 0.25} fill="#A0AEC0" stroke="#718096" strokeWidth="1" rx="3" />
    {/* Rear window */}
    <rect x={width * 0.55} y={height * 0.2} width={width * 0.18} height={height * 0.25} fill="#A0AEC0" stroke="#718096" strokeWidth="1" rx="3" />
    {/* Side windows */}
    <rect x={width * 0.48} y={height * 0.22} width={width * 0.06} height={height * 0.2} fill="#A0AEC0" stroke="#718096" strokeWidth="0.5" />
    {/* Wheels */}
    <ellipse cx={width * 0.28} cy={height * 0.78} rx={width * 0.1} ry={height * 0.08} fill="#1A202C" stroke="#0D1117" strokeWidth="1" />
    <ellipse cx={width * 0.72} cy={height * 0.78} rx={width * 0.1} ry={height * 0.08} fill="#1A202C" stroke="#0D1117" strokeWidth="1" />
    <ellipse cx={width * 0.28} cy={height * 0.22} rx={width * 0.1} ry={height * 0.08} fill="#1A202C" stroke="#0D1117" strokeWidth="1" />
    <ellipse cx={width * 0.72} cy={height * 0.22} rx={width * 0.1} ry={height * 0.08} fill="#1A202C" stroke="#0D1117" strokeWidth="1" />
    {/* Wheel rims */}
    <ellipse cx={width * 0.28} cy={height * 0.78} rx={width * 0.04} ry={height * 0.03} fill="#555" />
    <ellipse cx={width * 0.72} cy={height * 0.78} rx={width * 0.04} ry={height * 0.03} fill="#555" />
  </g>
);

const TreeSymbol = ({ x, y, size }: { x: number; y: number; size: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Tree crown - multiple overlapping circles for natural look */}
    <circle cx={0} cy={0} r={size} fill="#2E7D32" stroke="#1B5E20" strokeWidth="1.5" opacity="0.9" />
    <circle cx={size * 0.4} cy={-size * 0.3} r={size * 0.65} fill="#388E3C" stroke="#2E7D32" strokeWidth="1" opacity="0.85" />
    <circle cx={-size * 0.35} cy={size * 0.25} r={size * 0.55} fill="#43A047" stroke="#388E3C" strokeWidth="1" opacity="0.8" />
    <circle cx={size * 0.15} cy={size * 0.4} r={size * 0.45} fill="#4CAF50" stroke="#43A047" strokeWidth="0.5" opacity="0.7" />
    {/* Inner highlights */}
    <circle cx={-size * 0.2} cy={-size * 0.15} r={size * 0.3} fill="#66BB6A" opacity="0.4" />
  </g>
);

const BushSymbol = ({ x, y, size }: { x: number; y: number; size: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <ellipse cx={0} cy={0} rx={size} ry={size * 0.6} fill="#4CAF50" stroke="#388E3C" strokeWidth="1" opacity="0.8" />
    <ellipse cx={size * 0.3} cy={-size * 0.1} rx={size * 0.5} ry={size * 0.35} fill="#66BB6A" opacity="0.6" />
  </g>
);

const PoojaSymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Altar/Platform */}
    <rect x={width * 0.15} y={height * 0.1} width={width * 0.7} height={height * 0.15} fill="#C8A97D" stroke="#8B6914" strokeWidth="1.5" rx="2" />
    {/* Deity shelf */}
    <rect x={width * 0.2} y={height * 0.02} width={width * 0.6} height={height * 0.1} fill="#A08060" stroke="#6B4423" strokeWidth="1" rx="2" />
    {/* Oil lamp (diya) */}
    <ellipse cx={width * 0.35} cy={height * 0.6} rx={width * 0.08} ry={height * 0.05} fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
    <ellipse cx={width * 0.65} cy={height * 0.6} rx={width * 0.08} ry={height * 0.05} fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
    {/* Incense holder */}
    <rect x={width * 0.45} y={height * 0.55} width={width * 0.1} height={height * 0.08} fill="#8B4513" />
  </g>
);

const StudySymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Desk */}
    <rect x={width * 0.1} y={height * 0.1} width={width * 0.8} height={height * 0.35} fill="#A0522D" stroke="#6B3A1F" strokeWidth="1.5" rx="2" />
    {/* Chair */}
    <rect x={width * 0.35} y={height * 0.55} width={width * 0.3} height={height * 0.25} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="3" />
    <rect x={width * 0.38} y={height * 0.75} width={width * 0.24} height={height * 0.12} fill="#A08060" stroke="#5D4E37" strokeWidth="1" rx="2" />
    {/* Computer/Monitor */}
    <rect x={width * 0.4} y={height * 0.12} width={width * 0.25} height={height * 0.18} fill="#333" stroke="#222" strokeWidth="1" rx="2" />
    {/* Bookshelf */}
    <rect x={width * 0.02} y={height * 0.02} width={width * 0.15} height={height * 0.6} fill="#8B6914" stroke="#5D4E37" strokeWidth="1" />
  </g>
);

const UtilitySymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Washing machine */}
    <rect x={width * 0.1} y={height * 0.15} width={width * 0.4} height={height * 0.5} fill="#E8E8E8" stroke="#888" strokeWidth="1.5" rx="3" />
    <circle cx={width * 0.3} cy={height * 0.45} r={width * 0.12} fill="#D0D0D0" stroke="#888" strokeWidth="1" />
    {/* Utility sink */}
    <rect x={width * 0.55} y={height * 0.2} width={width * 0.35} height={height * 0.3} fill="#E8E8E8" stroke="#888" strokeWidth="1" rx="2" />
    {/* Shelves */}
    <line x1={width * 0.55} y1={height * 0.7} x2={width * 0.95} y2={height * 0.7} stroke="#8B7355" strokeWidth="2" />
    <line x1={width * 0.55} y1={height * 0.85} x2={width * 0.95} y2={height * 0.85} stroke="#8B7355" strokeWidth="2" />
  </g>
);

const BalconySymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Railing pattern */}
    <defs>
      <pattern id={`railing-${x}-${y}`} patternUnits="userSpaceOnUse" width="10" height="10">
        <rect width="10" height="10" fill="#C8E6C9" />
        <line x1="5" y1="0" x2="5" y2="10" stroke="#81C784" strokeWidth="1" />
      </pattern>
    </defs>
    {/* Balcony floor */}
    <rect x={0} y={0} width={width} height={height} fill={`url(#railing-${x}-${y})`} />
    {/* Chair */}
    <rect x={width * 0.15} y={height * 0.3} width={width * 0.3} height={height * 0.35} fill="#8B7355" stroke="#5D4E37" strokeWidth="1" rx="2" />
    {/* Small table */}
    <rect x={width * 0.55} y={height * 0.4} width={width * 0.25} height={height * 0.25} fill="#A08060" stroke="#6B4423" strokeWidth="1" rx="2" />
    {/* Plants */}
    <circle cx={width * 0.85} cy={height * 0.25} r={width * 0.08} fill="#4CAF50" opacity="0.8" />
    <circle cx={width * 0.1} cy={height * 0.8} r={width * 0.07} fill="#66BB6A" opacity="0.8" />
  </g>
);

const HomeTheatreSymbol = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Large sofa */}
    <rect x={width * 0.1} y={height * 0.55} width={width * 0.8} height={height * 0.35} fill="#5D4E37" stroke="#3D3027" strokeWidth="2" rx="4" />
    {/* TV/Screen */}
    <rect x={width * 0.15} y={height * 0.08} width={width * 0.7} height={height * 0.25} fill="#1A1A1A" stroke="#333" strokeWidth="2" rx="2" />
    {/* TV stand */}
    <rect x={width * 0.2} y={height * 0.33} width={width * 0.6} height={height * 0.1} fill="#4A4A4A" stroke="#333" strokeWidth="1" rx="2" />
    {/* Speakers */}
    <rect x={width * 0.02} y={height * 0.1} width={width * 0.08} height={height * 0.3} fill="#2D2D2D" stroke="#1A1A1A" strokeWidth="1" rx="2" />
    <rect x={width * 0.9} y={height * 0.1} width={width * 0.08} height={height * 0.3} fill="#2D2D2D" stroke="#1A1A1A" strokeWidth="1" rx="2" />
  </g>
);

const DoorSymbol = ({ x, y, width, position, isOpen = true }: { 
  x: number; 
  y: number; 
  width: number; 
  position: 'top' | 'bottom' | 'left' | 'right';
  isOpen?: boolean;
}) => {
  const doorWidth = Math.min(width * 0.4, 35);
  
  if (position === 'bottom') {
    return (
      <g>
        <rect x={x + width/2 - doorWidth/2 - 2} y={y - 3} width={doorWidth + 4} height={8} fill="white" />
        <path
          d={`M ${x + width/2 - doorWidth/2} ${y} A ${doorWidth} ${doorWidth} 0 0 0 ${x + width/2 - doorWidth/2 + doorWidth * 0.7} ${y - doorWidth * 0.7}`}
          fill="none"
          stroke="#555"
          strokeWidth="1.5"
          strokeDasharray="3,2"
        />
        <line
          x1={x + width/2 - doorWidth/2}
          y1={y}
          x2={x + width/2 - doorWidth/2 + doorWidth * 0.7}
          y2={y - doorWidth * 0.7}
          stroke="#444"
          strokeWidth="2.5"
        />
        <circle cx={x + width/2 - doorWidth/2 + doorWidth * 0.55} cy={y - doorWidth * 0.55} r="2" fill="#888" />
      </g>
    );
  } else if (position === 'top') {
    return (
      <g>
        <rect x={x + width/2 - doorWidth/2 - 2} y={y - 5} width={doorWidth + 4} height={8} fill="white" />
        <path
          d={`M ${x + width/2 - doorWidth/2} ${y} A ${doorWidth} ${doorWidth} 0 0 1 ${x + width/2 - doorWidth/2 + doorWidth * 0.7} ${y + doorWidth * 0.7}`}
          fill="none"
          stroke="#555"
          strokeWidth="1.5"
          strokeDasharray="3,2"
        />
        <line
          x1={x + width/2 - doorWidth/2}
          y1={y}
          x2={x + width/2 - doorWidth/2 + doorWidth * 0.7}
          y2={y + doorWidth * 0.7}
          stroke="#444"
          strokeWidth="2.5"
        />
        <circle cx={x + width/2 - doorWidth/2 + doorWidth * 0.55} cy={y + doorWidth * 0.55} r="2" fill="#888" />
      </g>
    );
  } else if (position === 'left') {
    return (
      <g>
        <rect x={x - 5} y={y - doorWidth/2 - 2} width={8} height={doorWidth + 4} fill="white" />
        <path
          d={`M ${x} ${y - doorWidth/2} A ${doorWidth} ${doorWidth} 0 0 1 ${x + doorWidth * 0.7} ${y - doorWidth/2 + doorWidth * 0.7}`}
          fill="none"
          stroke="#555"
          strokeWidth="1.5"
          strokeDasharray="3,2"
        />
        <line
          x1={x}
          y1={y - doorWidth/2}
          x2={x + doorWidth * 0.7}
          y2={y - doorWidth/2 + doorWidth * 0.7}
          stroke="#444"
          strokeWidth="2.5"
        />
        <circle cx={x + doorWidth * 0.55} cy={y - doorWidth/2 + doorWidth * 0.55} r="2" fill="#888" />
      </g>
    );
  } else {
    return (
      <g>
        <rect x={x - 3} y={y - doorWidth/2 - 2} width={8} height={doorWidth + 4} fill="white" />
        <path
          d={`M ${x} ${y - doorWidth/2} A ${doorWidth} ${doorWidth} 0 0 0 ${x - doorWidth * 0.7} ${y - doorWidth/2 + doorWidth * 0.7}`}
          fill="none"
          stroke="#555"
          strokeWidth="1.5"
          strokeDasharray="3,2"
        />
        <line
          x1={x}
          y1={y - doorWidth/2}
          x2={x - doorWidth * 0.7}
          y2={y - doorWidth/2 + doorWidth * 0.7}
          stroke="#444"
          strokeWidth="2.5"
        />
        <circle cx={x - doorWidth * 0.55} cy={y - doorWidth/2 + doorWidth * 0.55} r="2" fill="#888" />
      </g>
    );
  }
};

const WindowSymbol = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => {
  const isHorizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1);
  const length = isHorizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1);
  
  return (
    <g>
      {/* Window gap in wall */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth={WALL_THICKNESS + 4} />
      {/* Window frame outer */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#666" strokeWidth="3" />
      {/* Window glass */}
      {isHorizontal ? (
        <>
          <line x1={x1 + 4} y1={y1} x2={x2 - 4} y2={y2} stroke="#B0D4E8" strokeWidth="2" />
          {/* Window panes */}
          <line x1={x1 + length * 0.33} y1={y1 - 4} x2={x1 + length * 0.33} y2={y1 + 4} stroke="#666" strokeWidth="1" />
          <line x1={x1 + length * 0.66} y1={y1 - 4} x2={x1 + length * 0.66} y2={y1 + 4} stroke="#666" strokeWidth="1" />
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 + 4} x2={x2} y2={y2 - 4} stroke="#B0D4E8" strokeWidth="2" />
          {/* Window panes */}
          <line x1={x1 - 4} y1={y1 + length * 0.33} x2={x1 + 4} y2={y1 + length * 0.33} stroke="#666" strokeWidth="1" />
          <line x1={x1 - 4} y1={y1 + length * 0.66} x2={x1 + 4} y2={y1 + length * 0.66} stroke="#666" strokeWidth="1" />
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
        <SofaSymbol x={x + w * 0.08} y={y + h * 0.08} width={w * 0.55} height={h * 0.3} />
        <SingleChairSymbol x={x + w * 0.7} y={y + h * 0.12} size={Math.min(w, h) * 0.18} rotation={-90} />
        <SingleChairSymbol x={x + w * 0.7} y={y + h * 0.35} size={Math.min(w, h) * 0.18} rotation={-90} />
        <CoffeeTableSymbol x={x + w * 0.2} y={y + h * 0.45} width={w * 0.35} height={h * 0.18} />
      </>
    );
  } else if (roomType.includes('master') || roomType.includes('bedroom') || roomType.includes('guest')) {
    return (
      <>
        <BedSymbol x={x + w * 0.1} y={y + h * 0.15} width={w * 0.7} height={h * 0.7} />
        <NightstandSymbol x={x + w * 0.82} y={y + h * 0.35} size={Math.min(w, h) * 0.12} />
        <NightstandSymbol x={x + w * 0.02} y={y + h * 0.35} size={Math.min(w, h) * 0.12} />
      </>
    );
  } else if (roomType.includes('dining')) {
    return <DiningTableSymbol x={x + w * 0.08} y={y + h * 0.08} width={w * 0.84} height={h * 0.84} />;
  } else if (roomType.includes('kitchen')) {
    return <KitchenSymbol x={x + w * 0.03} y={y + h * 0.03} width={w * 0.94} height={h * 0.94} />;
  } else if (roomType.includes('bathroom')) {
    return <BathroomSymbol x={x + w * 0.03} y={y + h * 0.03} width={w * 0.94} height={h * 0.94} />;
  } else if (roomType.includes('parking')) {
    return (
      <>
        <CarSymbol x={x + w * 0.1} y={y + h * 0.12} width={w * 0.8} height={h * 0.38} rotation={0} />
        {w > 150 && <CarSymbol x={x + w * 0.1} y={y + h * 0.55} width={w * 0.8} height={h * 0.38} rotation={0} />}
      </>
    );
  } else if (roomType.includes('pooja')) {
    return <PoojaSymbol x={x + w * 0.05} y={y + h * 0.05} width={w * 0.9} height={h * 0.9} />;
  } else if (roomType.includes('study')) {
    return <StudySymbol x={x + w * 0.05} y={y + h * 0.05} width={w * 0.9} height={h * 0.9} />;
  } else if (roomType.includes('utility')) {
    return <UtilitySymbol x={x + w * 0.05} y={y + h * 0.05} width={w * 0.9} height={h * 0.9} />;
  } else if (roomType.includes('balcony') || roomType.includes('sitout')) {
    return <BalconySymbol x={x + w * 0.02} y={y + h * 0.02} width={w * 0.96} height={h * 0.96} />;
  } else if (roomType.includes('theatre') || roomType.includes('home_theatre')) {
    return <HomeTheatreSymbol x={x + w * 0.05} y={y + h * 0.05} width={w * 0.9} height={h * 0.9} />;
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
  const padding = 100;
  const svgWidth = totalWidth * SCALE + padding * 2 + (hasGarden ? 80 : 0);
  const svgHeight = totalHeight * SCALE + padding * 2 + 80;

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
      style={{ maxHeight: '800px', backgroundColor: '#FAFAFA' }}
    >
      {/* Definitions */}
      <defs>
        {/* Grid pattern */}
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E0E0E0" strokeWidth="0.5" />
        </pattern>
        {/* Garden grass pattern */}
        <pattern id="grass" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#C8E6C9" />
          <circle cx="4" cy="4" r="1" fill="#A5D6A7" />
          <circle cx="12" cy="12" r="1" fill="#A5D6A7" />
          <circle cx="8" cy="8" r="0.8" fill="#81C784" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#grid)" />

      {/* Garden area if enabled */}
      {hasGarden && (
        <g>
          <rect
            x={maxX * SCALE + padding + 15}
            y={padding - 10}
            width={65}
            height={(maxY - minY) * SCALE + 20}
            fill="url(#grass)"
            stroke="#81C784"
            strokeWidth="2"
            rx="5"
          />
          {/* Trees and bushes */}
          <TreeSymbol x={maxX * SCALE + padding + 47} y={padding + 35} size={20} />
          <TreeSymbol x={maxX * SCALE + padding + 47} y={padding + 110} size={18} />
          <TreeSymbol x={maxX * SCALE + padding + 47} y={padding + 185} size={22} />
          <BushSymbol x={maxX * SCALE + padding + 35} y={padding + 70} size={12} />
          <BushSymbol x={maxX * SCALE + padding + 55} y={padding + 145} size={10} />
          <BushSymbol x={maxX * SCALE + padding + 40} y={padding + 210} size={11} />
        </g>
      )}

      {/* Rooms with colors and furniture */}
      {rooms.map((room) => {
        const x = room.x * SCALE + padding;
        const y = room.y * SCALE + padding;
        const w = room.width * SCALE;
        const h = room.height * SCALE;
        const color = ENHANCED_ROOM_COLORS[room.roomType] || '#FFF';

        return (
          <g key={room.id}>
            {/* Room fill */}
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={color}
              stroke="#4A4A4A"
              strokeWidth={INNER_WALL_THICKNESS}
            />

            {/* Furniture */}
            {getFurnitureForRoom(room, x, y, w, h)}

            {/* Room name */}
            <text
              x={x + w / 2}
              y={y + h / 2 - 10}
              fontSize="13"
              fontWeight="700"
              fill="#333"
              textAnchor="middle"
              style={{ fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              {room.name}
            </text>

            {/* Dimensions */}
            <text
              x={x + w / 2}
              y={y + h / 2 + 8}
              fontSize="12"
              fontWeight="500"
              fill="#555"
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
              const windowLength = Math.min(w, h) * 0.35;
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

      {/* Outer building wall (thick dark border) */}
      <rect
        x={minX * SCALE + padding - WALL_THICKNESS/2}
        y={minY * SCALE + padding - WALL_THICKNESS/2}
        width={(maxX - minX) * SCALE + WALL_THICKNESS}
        height={(maxY - minY) * SCALE + WALL_THICKNESS}
        fill="none"
        stroke="#3A3A3A"
        strokeWidth={WALL_THICKNESS}
      />

      {/* North arrow */}
      <g transform={`translate(${svgWidth - 70}, 55)`}>
        <circle cx="0" cy="0" r="28" fill="white" stroke="#444" strokeWidth="2" />
        <polygon points="0,-22 -8,-5 0,-10 8,-5" fill="#333" />
        <text x="0" y="-28" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#333">N</text>
        <text x="0" y="18" fontSize="9" textAnchor="middle" fill="#666">NORTH</text>
      </g>

      {/* Scale bar */}
      <g transform={`translate(${padding}, ${svgHeight - 55})`}>
        <rect x="-5" y="-25" width={10 * SCALE + 60} height="50" fill="white" stroke="#DDD" strokeWidth="1" rx="4" opacity="0.9" />
        <line x1="0" y1="0" x2={10 * SCALE} y2="0" stroke="#333" strokeWidth="4" />
        <line x1="0" y1="-8" x2="0" y2="8" stroke="#333" strokeWidth="2" />
        <line x1={5 * SCALE} y1="-5" x2={5 * SCALE} y2="5" stroke="#333" strokeWidth="1.5" />
        <line x1={10 * SCALE} y1="-8" x2={10 * SCALE} y2="8" stroke="#333" strokeWidth="2" />
        <text x="0" y="22" fontSize="10" textAnchor="middle" fill="#333">0</text>
        <text x={5 * SCALE} y="22" fontSize="10" textAnchor="middle" fill="#333">5'</text>
        <text x={10 * SCALE} y="22" fontSize="10" textAnchor="middle" fill="#333">10'</text>
        <text x={10 * SCALE + 30} y="5" fontSize="11" fontWeight="600" fill="#333">FEET</text>
      </g>

      {/* Title block */}
      <g transform={`translate(${svgWidth / 2}, ${svgHeight - 25})`}>
        <text fontSize="15" fontWeight="bold" textAnchor="middle" fill="#333" style={{ letterSpacing: '1px' }}>
          FLOOR PLAN • {landArea} SQ FT • {style.toUpperCase()} STYLE
        </text>
      </g>

      {/* Area summary box */}
      <g transform={`translate(${svgWidth - 180}, ${svgHeight - 100})`}>
        <rect x="0" y="0" width="170" height="70" fill="white" stroke="#AAA" strokeWidth="1.5" rx="5" />
        <text x="85" y="18" fontSize="11" fill="#333" fontWeight="700" textAnchor="middle" style={{ letterSpacing: '0.5px' }}>AREA SUMMARY</text>
        <line x1="10" y1="25" x2="160" y2="25" stroke="#DDD" strokeWidth="1" />
        <text x="15" y="42" fontSize="11" fill="#444">Land Area:</text>
        <text x="155" y="42" fontSize="11" fill="#333" fontWeight="600" textAnchor="end">{landArea} sq ft</text>
        <text x="15" y="58" fontSize="11" fill="#444">Built-up:</text>
        <text x="155" y="58" fontSize="11" fill="#333" fontWeight="600" textAnchor="end">{builtUpArea} sq ft</text>
        {scaleFactor < 1 && (
          <text x="85" y="72" fontSize="9" fill="#E53935" textAnchor="middle">
            Scaled: {(scaleFactor * 100).toFixed(0)}%
          </text>
        )}
      </g>
    </svg>
  );
};

export default FloorPlanSVG;
