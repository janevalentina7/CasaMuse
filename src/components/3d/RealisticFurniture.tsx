import { useRef, useState } from 'react';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface FurnitureBaseProps {
  position: [number, number, number];
  rotation?: number;
  color?: string;
  scale?: number;
}

// Realistic Sofa with cushions and details
export function RealisticSofa({ position, rotation = 0, color = '#6b5b4f', scale = 1 }: FurnitureBaseProps) {
  const cushionColor = '#8b7b6f';
  const pillow1Color = '#c9a227';
  const pillow2Color = '#4a7c4a';
  
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Base frame */}
      <Box args={[2.2, 0.15, 0.9]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color="#3d2817" roughness={0.8} />
      </Box>
      
      {/* Seat cushions */}
      <Box args={[0.9, 0.25, 0.75]} position={[-0.5, 0.4, 0.05]}>
        <meshStandardMaterial color={cushionColor} roughness={0.9} />
      </Box>
      <Box args={[0.9, 0.25, 0.75]} position={[0.5, 0.4, 0.05]}>
        <meshStandardMaterial color={cushionColor} roughness={0.9} />
      </Box>
      
      {/* Back cushions */}
      <Box args={[0.85, 0.5, 0.2]} position={[-0.5, 0.75, -0.3]} rotation={[-0.15, 0, 0]}>
        <meshStandardMaterial color={color} roughness={0.85} />
      </Box>
      <Box args={[0.85, 0.5, 0.2]} position={[0.5, 0.75, -0.3]} rotation={[-0.15, 0, 0]}>
        <meshStandardMaterial color={color} roughness={0.85} />
      </Box>
      
      {/* Backrest frame */}
      <Box args={[2.2, 0.65, 0.15]} position={[0, 0.6, -0.4]}>
        <meshStandardMaterial color={color} roughness={0.8} />
      </Box>
      
      {/* Armrests */}
      <Box args={[0.15, 0.5, 0.85]} position={[-1.02, 0.5, 0]}>
        <meshStandardMaterial color={color} roughness={0.8} />
      </Box>
      <Box args={[0.15, 0.5, 0.85]} position={[1.02, 0.5, 0]}>
        <meshStandardMaterial color={color} roughness={0.8} />
      </Box>
      
      {/* Decorative throw pillows */}
      <Box args={[0.35, 0.35, 0.12]} position={[-0.7, 0.7, 0.1]} rotation={[0, 0.2, 0.1]}>
        <meshStandardMaterial color={pillow1Color} roughness={0.9} />
      </Box>
      <Box args={[0.35, 0.35, 0.12]} position={[0.7, 0.68, 0.08]} rotation={[0, -0.15, -0.05]}>
        <meshStandardMaterial color={pillow2Color} roughness={0.9} />
      </Box>
      
      {/* Wooden legs */}
      {[[-0.95, 0.35], [0.95, 0.35], [-0.95, -0.35], [0.95, -0.35]].map(([x, z], i) => (
        <Cylinder key={i} args={[0.03, 0.04, 0.15, 8]} position={[x, 0.075, z]}>
          <meshStandardMaterial color="#4a3728" roughness={0.7} />
        </Cylinder>
      ))}
    </group>
  );
}

// Realistic Bed with headboard, mattress, pillows, and blanket
export function RealisticBed({ position, rotation = 0, color = '#f5f5dc', scale = 1 }: FurnitureBaseProps) {
  const frameColor = '#5a4a3a';
  const sheetColor = '#ffffff';
  const blanketColor = '#4a5568';
  
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Bed frame base */}
      <Box args={[2, 0.25, 1.8]} position={[0, 0.125, 0]}>
        <meshStandardMaterial color={frameColor} roughness={0.7} />
      </Box>
      
      {/* Side rails */}
      <Box args={[2.1, 0.35, 0.08]} position={[0, 0.3, -0.86]}>
        <meshStandardMaterial color={frameColor} roughness={0.7} />
      </Box>
      <Box args={[2.1, 0.35, 0.08]} position={[0, 0.3, 0.86]}>
        <meshStandardMaterial color={frameColor} roughness={0.7} />
      </Box>
      
      {/* Headboard */}
      <Box args={[2.1, 1.2, 0.1]} position={[0, 0.85, -0.9]}>
        <meshStandardMaterial color={frameColor} roughness={0.6} />
      </Box>
      {/* Headboard padding */}
      <Box args={[1.9, 0.8, 0.08]} position={[0, 0.9, -0.84]}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </Box>
      
      {/* Footboard */}
      <Box args={[2.1, 0.5, 0.08]} position={[0, 0.5, 0.9]}>
        <meshStandardMaterial color={frameColor} roughness={0.7} />
      </Box>
      
      {/* Mattress */}
      <Box args={[1.9, 0.25, 1.7]} position={[0, 0.375, 0]}>
        <meshStandardMaterial color={sheetColor} roughness={0.95} />
      </Box>
      
      {/* Fitted sheet / top of mattress */}
      <Box args={[1.85, 0.03, 1.65]} position={[0, 0.515, 0]}>
        <meshStandardMaterial color={sheetColor} roughness={0.9} />
      </Box>
      
      {/* Pillows */}
      <Box args={[0.6, 0.15, 0.4]} position={[-0.45, 0.6, -0.55]} rotation={[0.1, 0, 0]}>
        <meshStandardMaterial color={sheetColor} roughness={0.95} />
      </Box>
      <Box args={[0.6, 0.15, 0.4]} position={[0.45, 0.58, -0.55]} rotation={[0.08, 0, 0]}>
        <meshStandardMaterial color={sheetColor} roughness={0.95} />
      </Box>
      
      {/* Blanket/duvet */}
      <Box args={[1.8, 0.15, 1.1]} position={[0, 0.6, 0.25]}>
        <meshStandardMaterial color={blanketColor} roughness={0.85} />
      </Box>
      {/* Blanket fold at top */}
      <Box args={[1.8, 0.08, 0.3]} position={[0, 0.58, -0.25]}>
        <meshStandardMaterial color={blanketColor} roughness={0.85} />
      </Box>
      
      {/* Legs */}
      {[[-0.9, 0.8], [0.9, 0.8], [-0.9, -0.8], [0.9, -0.8]].map(([x, z], i) => (
        <Cylinder key={i} args={[0.04, 0.05, 0.12, 8]} position={[x, 0.06, z]}>
          <meshStandardMaterial color="#2d2017" roughness={0.8} />
        </Cylinder>
      ))}
    </group>
  );
}

// Realistic Dining Table with proper legs and surface
export function RealisticDiningTable({ position, rotation = 0, color = '#8b6914', scale = 1 }: FurnitureBaseProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Table top */}
      <Box args={[1.8, 0.06, 1]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color={color} roughness={0.4} />
      </Box>
      {/* Table top edge trim */}
      <Box args={[1.85, 0.08, 0.04]} position={[0, 0.74, -0.48]}>
        <meshStandardMaterial color={color} roughness={0.5} />
      </Box>
      <Box args={[1.85, 0.08, 0.04]} position={[0, 0.74, 0.48]}>
        <meshStandardMaterial color={color} roughness={0.5} />
      </Box>
      
      {/* Apron (support beam under table) */}
      <Box args={[1.6, 0.1, 0.8]} position={[0, 0.68, 0]}>
        <meshStandardMaterial color={color} roughness={0.6} />
      </Box>
      
      {/* Legs with detail */}
      {[[-0.75, 0.4], [0.75, 0.4], [-0.75, -0.4], [0.75, -0.4]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Main leg */}
          <Box args={[0.08, 0.63, 0.08]} position={[0, 0.315, 0]}>
            <meshStandardMaterial color={color} roughness={0.6} />
          </Box>
          {/* Leg foot */}
          <Box args={[0.1, 0.03, 0.1]} position={[0, 0.015, 0]}>
            <meshStandardMaterial color={color} roughness={0.7} />
          </Box>
        </group>
      ))}
    </group>
  );
}

// Realistic Chair with cushion
export function RealisticChair({ position, rotation = 0, color = '#8b6914', scale = 1 }: FurnitureBaseProps) {
  const cushionColor = '#d4c4a8';
  
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Seat frame */}
      <Box args={[0.45, 0.04, 0.42]} position={[0, 0.45, 0]}>
        <meshStandardMaterial color={color} roughness={0.5} />
      </Box>
      
      {/* Seat cushion */}
      <Box args={[0.42, 0.06, 0.38]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={cushionColor} roughness={0.9} />
      </Box>
      
      {/* Backrest frame */}
      <Box args={[0.45, 0.5, 0.04]} position={[0, 0.78, -0.19]}>
        <meshStandardMaterial color={color} roughness={0.5} />
      </Box>
      
      {/* Backrest slats */}
      {[-0.12, 0, 0.12].map((x, i) => (
        <Box key={i} args={[0.06, 0.35, 0.02]} position={[x, 0.75, -0.17]}>
          <meshStandardMaterial color={color} roughness={0.6} />
        </Box>
      ))}
      
      {/* Legs */}
      {[[-0.18, 0.17], [0.18, 0.17], [-0.18, -0.17], [0.18, -0.17]].map(([x, z], i) => (
        <Cylinder key={i} args={[0.025, 0.03, 0.45, 8]} position={[x, 0.225, z]}>
          <meshStandardMaterial color={color} roughness={0.6} />
        </Cylinder>
      ))}
      
      {/* Cross supports */}
      <Box args={[0.36, 0.025, 0.025]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color={color} roughness={0.6} />
      </Box>
      <Box args={[0.025, 0.025, 0.34]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color={color} roughness={0.6} />
      </Box>
    </group>
  );
}

// Realistic Cabinet with doors and handles
export function RealisticCabinet({ position, rotation = 0, color = '#8b6914', scale = 1 }: FurnitureBaseProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Main body */}
      <Box args={[1.2, 1.8, 0.5]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color={color} roughness={0.6} />
      </Box>
      
      {/* Left door */}
      <Box args={[0.55, 1.6, 0.03]} position={[-0.28, 0.9, 0.26]}>
        <meshStandardMaterial color={color} roughness={0.5} />
      </Box>
      {/* Left door panel inset */}
      <Box args={[0.4, 0.6, 0.02]} position={[-0.28, 1.2, 0.28]}>
        <meshStandardMaterial color={color} roughness={0.4} />
      </Box>
      <Box args={[0.4, 0.6, 0.02]} position={[-0.28, 0.5, 0.28]}>
        <meshStandardMaterial color={color} roughness={0.4} />
      </Box>
      
      {/* Right door */}
      <Box args={[0.55, 1.6, 0.03]} position={[0.28, 0.9, 0.26]}>
        <meshStandardMaterial color={color} roughness={0.5} />
      </Box>
      {/* Right door panel inset */}
      <Box args={[0.4, 0.6, 0.02]} position={[0.28, 1.2, 0.28]}>
        <meshStandardMaterial color={color} roughness={0.4} />
      </Box>
      <Box args={[0.4, 0.6, 0.02]} position={[0.28, 0.5, 0.28]}>
        <meshStandardMaterial color={color} roughness={0.4} />
      </Box>
      
      {/* Door handles */}
      <Cylinder args={[0.015, 0.015, 0.1, 8]} position={[-0.05, 0.9, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.015, 0.015, 0.1, 8]} position={[0.05, 0.9, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      {/* Crown molding */}
      <Box args={[1.3, 0.06, 0.55]} position={[0, 1.83, 0]}>
        <meshStandardMaterial color={color} roughness={0.5} />
      </Box>
      
      {/* Base molding */}
      <Box args={[1.25, 0.08, 0.52]} position={[0, 0.04, 0]}>
        <meshStandardMaterial color={color} roughness={0.6} />
      </Box>
    </group>
  );
}

// Realistic Desk with drawers
export function RealisticDesk({ position, rotation = 0, color = '#8b6914', scale = 1 }: FurnitureBaseProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Desktop */}
      <Box args={[1.4, 0.04, 0.7]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color={color} roughness={0.4} />
      </Box>
      
      {/* Left leg panel with drawers */}
      <Box args={[0.04, 0.7, 0.65]} position={[-0.66, 0.37, 0]}>
        <meshStandardMaterial color={color} roughness={0.6} />
      </Box>
      <Box args={[0.35, 0.68, 0.63]} position={[-0.47, 0.37, 0]}>
        <meshStandardMaterial color={color} roughness={0.6} />
      </Box>
      
      {/* Drawer fronts */}
      {[0.55, 0.35, 0.15].map((y, i) => (
        <group key={i}>
          <Box args={[0.32, 0.15, 0.02]} position={[-0.47, y, 0.32]}>
            <meshStandardMaterial color={color} roughness={0.5} />
          </Box>
          {/* Drawer handle */}
          <Box args={[0.08, 0.02, 0.03]} position={[-0.47, y, 0.35]}>
            <meshStandardMaterial color="#c9a227" metalness={0.7} roughness={0.3} />
          </Box>
        </group>
      ))}
      
      {/* Right legs */}
      <Box args={[0.06, 0.73, 0.06]} position={[0.64, 0.365, -0.3]}>
        <meshStandardMaterial color={color} roughness={0.6} />
      </Box>
      <Box args={[0.06, 0.73, 0.06]} position={[0.64, 0.365, 0.3]}>
        <meshStandardMaterial color={color} roughness={0.6} />
      </Box>
      
      {/* Cross support */}
      <Box args={[0.04, 0.04, 0.55]} position={[0.64, 0.15, 0]}>
        <meshStandardMaterial color={color} roughness={0.6} />
      </Box>
      
      {/* Back panel */}
      <Box args={[1.3, 0.15, 0.02]} position={[0, 0.85, -0.34]}>
        <meshStandardMaterial color={color} roughness={0.5} />
      </Box>
    </group>
  );
}

// Coffee Table
export function CoffeeTable({ position, rotation = 0, color = '#5a4a3a', scale = 1 }: FurnitureBaseProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Table top - glass */}
      <Box args={[1.2, 0.02, 0.6]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.3} metalness={0.9} roughness={0.1} />
      </Box>
      {/* Wooden frame under glass */}
      <Box args={[1.15, 0.04, 0.55]} position={[0, 0.37, 0]}>
        <meshStandardMaterial color={color} roughness={0.5} />
      </Box>
      {/* Lower shelf */}
      <Box args={[1, 0.03, 0.45]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color={color} roughness={0.6} />
      </Box>
      {/* Legs */}
      {[[-0.5, 0.22], [0.5, 0.22], [-0.5, -0.22], [0.5, -0.22]].map(([x, z], i) => (
        <Box key={i} args={[0.05, 0.38, 0.05]} position={[x, 0.19, z]}>
          <meshStandardMaterial color={color} roughness={0.6} />
        </Box>
      ))}
    </group>
  );
}

// TV Unit
export function TVUnit({ position, rotation = 0, color = '#2d2d2d', scale = 1 }: FurnitureBaseProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Main unit */}
      <Box args={[2, 0.5, 0.45]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color={color} roughness={0.4} />
      </Box>
      {/* Open shelf */}
      <Box args={[0.6, 0.35, 0.4]} position={[0, 0.25, 0.03]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </Box>
      {/* Drawer fronts */}
      <Box args={[0.55, 0.35, 0.02]} position={[-0.7, 0.25, 0.23]}>
        <meshStandardMaterial color={color} roughness={0.3} />
      </Box>
      <Box args={[0.55, 0.35, 0.02]} position={[0.7, 0.25, 0.23]}>
        <meshStandardMaterial color={color} roughness={0.3} />
      </Box>
      {/* Handles */}
      <Box args={[0.15, 0.02, 0.03]} position={[-0.7, 0.25, 0.26]}>
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </Box>
      <Box args={[0.15, 0.02, 0.03]} position={[0.7, 0.25, 0.26]}>
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </Box>
      {/* TV on top */}
      <Box args={[1.4, 0.02, 0.08]} position={[0, 0.51, -0.1]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </Box>
      <Box args={[1.5, 0.85, 0.04]} position={[0, 0.95, -0.15]}>
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
      </Box>
      {/* TV screen */}
      <Box args={[1.42, 0.78, 0.01]} position={[0, 0.95, -0.12]}>
        <meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.3} />
      </Box>
    </group>
  );
}

export default {
  RealisticSofa,
  RealisticBed,
  RealisticDiningTable,
  RealisticChair,
  RealisticCabinet,
  RealisticDesk,
  CoffeeTable,
  TVUnit
};
