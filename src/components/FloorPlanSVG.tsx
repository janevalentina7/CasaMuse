import React from 'react';

interface PlacedRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isWetArea?: boolean;
}

interface FloorPlanSVGProps {
  rooms: PlacedRoom[];
  totalWidth: number;
  totalHeight: number;
  landArea: number;
  builtUpArea: number;
  style?: string;
  scaleFactor?: number;
}

const SCALE = 10; // 1 foot = 10 pixels
const WALL_THICKNESS = 2; // Wall line thickness

export const FloorPlanSVG: React.FC<FloorPlanSVGProps> = ({
  rooms,
  totalWidth,
  totalHeight,
  landArea,
  builtUpArea,
  style = 'Modern',
  scaleFactor = 1,
}) => {
  const svgWidth = totalWidth * SCALE + 100;
  const svgHeight = totalHeight * SCALE + 150;
  const offsetX = 50;
  const offsetY = 50;

  // Create hatching pattern for wet areas
  const hatchPattern = (
    <pattern id="hatch" patternUnits="userSpaceOnUse" width="8" height="8">
      <path
        d="M0,0 l8,8 M-2,6 l4,4 M6,-2 l4,4"
        stroke="#666"
        strokeWidth="0.5"
        fill="none"
      />
    </pattern>
  );

  // Calculate overall bounds for outer walls
  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
  rooms.forEach(room => {
    minX = Math.min(minX, room.x);
    minY = Math.min(minY, room.y);
    maxX = Math.max(maxX, room.x + room.width);
    maxY = Math.max(maxY, room.y + room.height);
  });

  const wallPadding = 0.75; // 9 inches wall thickness
  const outerX = (minX - wallPadding) * SCALE + offsetX;
  const outerY = (minY - wallPadding) * SCALE + offsetY;
  const outerWidth = (maxX - minX + wallPadding * 2) * SCALE;
  const outerHeight = (maxY - minY + wallPadding * 2) * SCALE;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full h-auto bg-white"
      style={{ maxHeight: '600px' }}
    >
      <defs>
        {hatchPattern}
        {/* Door arc gradient */}
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" fill="#333" />
        </marker>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="white" />

      {/* Grid reference (light) */}
      {Array.from({ length: Math.ceil(totalWidth / 5) + 1 }).map((_, i) => (
        <g key={`grid-v-${i}`}>
          <line
            x1={i * 5 * SCALE + offsetX}
            y1={offsetY - 10}
            x2={i * 5 * SCALE + offsetX}
            y2={totalHeight * SCALE + offsetY + 10}
            stroke="#eee"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
          <text
            x={i * 5 * SCALE + offsetX}
            y={offsetY - 15}
            fontSize="8"
            fill="#999"
            textAnchor="middle"
          >
            {String.fromCharCode(65 + i)}
          </text>
        </g>
      ))}
      {Array.from({ length: Math.ceil(totalHeight / 5) + 1 }).map((_, i) => (
        <g key={`grid-h-${i}`}>
          <line
            x1={offsetX - 10}
            y1={i * 5 * SCALE + offsetY}
            x2={totalWidth * SCALE + offsetX + 10}
            y2={i * 5 * SCALE + offsetY}
            stroke="#eee"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
          <text
            x={offsetX - 20}
            y={i * 5 * SCALE + offsetY + 3}
            fontSize="8"
            fill="#999"
            textAnchor="middle"
          >
            {i + 1}
          </text>
        </g>
      ))}

      {/* Outer walls (thick black border) */}
      <rect
        x={outerX}
        y={outerY}
        width={outerWidth}
        height={outerHeight}
        fill="none"
        stroke="#000"
        strokeWidth={WALL_THICKNESS * 2}
      />

      {/* Rooms */}
      {rooms.map((room, index) => {
        const x = room.x * SCALE + offsetX;
        const y = room.y * SCALE + offsetY;
        const w = room.width * SCALE;
        const h = room.height * SCALE;

        // Door position (bottom wall, center)
        const doorWidth = 3 * SCALE; // 3 feet door
        const doorX = x + w / 2 - doorWidth / 2;
        const doorY = y + h;

        // Window position (side wall)
        const windowWidth = 4 * SCALE;
        const windowX = x + w;
        const windowY = y + h / 2 - windowWidth / 2;

        return (
          <g key={room.id}>
            {/* Room fill */}
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={room.isWetArea ? 'url(#hatch)' : '#fff'}
              stroke="#000"
              strokeWidth={WALL_THICKNESS}
            />

            {/* Room name */}
            <text
              x={x + w / 2}
              y={y + h / 2 - 8}
              fontSize="11"
              fontWeight="bold"
              fill="#000"
              textAnchor="middle"
              style={{ textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}
            >
              {room.name}
            </text>

            {/* Dimensions */}
            <text
              x={x + w / 2}
              y={y + h / 2 + 10}
              fontSize="9"
              fill="#666"
              textAnchor="middle"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              {room.width.toFixed(0)}' × {room.height.toFixed(0)}'
            </text>

            {/* Door (arc symbol) - only for non-bathroom rooms */}
            {!room.name.toLowerCase().includes('bath') && index > 0 && (
              <g>
                {/* Door opening */}
                <line
                  x1={doorX}
                  y1={doorY}
                  x2={doorX + doorWidth}
                  y2={doorY}
                  stroke="#fff"
                  strokeWidth={WALL_THICKNESS + 2}
                />
                {/* Door swing arc */}
                <path
                  d={`M ${doorX} ${doorY} A ${doorWidth} ${doorWidth} 0 0 0 ${doorX + doorWidth} ${doorY - doorWidth * 0.7}`}
                  fill="none"
                  stroke="#000"
                  strokeWidth="1"
                />
                {/* Door leaf */}
                <line
                  x1={doorX}
                  y1={doorY}
                  x2={doorX + doorWidth}
                  y2={doorY - doorWidth * 0.7}
                  stroke="#000"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* Window symbol (on exterior walls) */}
            {index % 3 === 0 && (
              <g>
                <line
                  x1={windowX - 2}
                  y1={windowY}
                  x2={windowX - 2}
                  y2={windowY + windowWidth}
                  stroke="#fff"
                  strokeWidth="4"
                />
                <line
                  x1={windowX}
                  y1={windowY}
                  x2={windowX}
                  y2={windowY + windowWidth}
                  stroke="#000"
                  strokeWidth="1"
                />
                <line
                  x1={windowX - 4}
                  y1={windowY}
                  x2={windowX - 4}
                  y2={windowY + windowWidth}
                  stroke="#000"
                  strokeWidth="1"
                />
                {/* Window cross lines */}
                <line
                  x1={windowX - 4}
                  y1={windowY + windowWidth / 2}
                  x2={windowX}
                  y2={windowY + windowWidth / 2}
                  stroke="#000"
                  strokeWidth="0.5"
                />
              </g>
            )}
          </g>
        );
      })}

      {/* North arrow */}
      <g transform={`translate(${svgWidth - 60}, 40)`}>
        <circle cx="0" cy="0" r="20" fill="none" stroke="#000" strokeWidth="1" />
        <polygon points="0,-18 -5,-5 0,-10 5,-5" fill="#000" />
        <text x="0" y="-22" fontSize="10" fontWeight="bold" textAnchor="middle">N</text>
      </g>

      {/* Scale bar */}
      <g transform={`translate(${offsetX}, ${svgHeight - 40})`}>
        <line x1="0" y1="0" x2={10 * SCALE} y2="0" stroke="#000" strokeWidth="2" />
        <line x1="0" y1="-5" x2="0" y2="5" stroke="#000" strokeWidth="2" />
        <line x1={10 * SCALE} y1="-5" x2={10 * SCALE} y2="5" stroke="#000" strokeWidth="2" />
        <text x={5 * SCALE} y="15" fontSize="10" textAnchor="middle">10 ft</text>
        <text x={5 * SCALE} y="-10" fontSize="8" textAnchor="middle" fill="#666">Scale 1:100</text>
      </g>

      {/* Title block */}
      <g transform={`translate(${svgWidth / 2}, ${svgHeight - 20})`}>
        <text fontSize="12" fontWeight="bold" textAnchor="middle" fill="#000">
          FLOOR PLAN - {landArea} SQ FT - {style.toUpperCase()} STYLE
        </text>
      </g>

      {/* Area summary */}
      <g transform={`translate(${svgWidth - 150}, ${svgHeight - 60})`}>
        <rect x="0" y="0" width="140" height="45" fill="#f9f9f9" stroke="#ccc" strokeWidth="1" />
        <text x="10" y="15" fontSize="9" fill="#333">Land Area: {landArea} sq ft</text>
        <text x="10" y="28" fontSize="9" fill="#333">Built-up: {builtUpArea} sq ft</text>
        {scaleFactor < 1 && (
          <text x="10" y="41" fontSize="8" fill="#e74c3c">
            Scaled: {(scaleFactor * 100).toFixed(0)}%
          </text>
        )}
      </g>
    </svg>
  );
};

export default FloorPlanSVG;
