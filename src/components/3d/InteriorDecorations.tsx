import { Box, Cylinder, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';

interface DecorationProps {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}

// Floor Lamp with shade
export function FloorLamp({ position, rotation = 0, scale = 1 }: DecorationProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Base */}
      <Cylinder args={[0.15, 0.18, 0.04, 16]} position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#2d2d2d" metalness={0.6} roughness={0.4} />
      </Cylinder>
      {/* Pole */}
      <Cylinder args={[0.02, 0.02, 1.4, 8]} position={[0, 0.72, 0]}>
        <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Lamp shade */}
      <Cylinder args={[0.15, 0.25, 0.3, 16]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#f5e6d3" transparent opacity={0.9} side={THREE.DoubleSide} />
      </Cylinder>
      {/* Light bulb glow */}
      <pointLight position={[0, 1.45, 0]} intensity={0.8} distance={4} color="#fff5e0" />
    </group>
  );
}

// Table Lamp
export function TableLamp({ position, rotation = 0, scale = 1 }: DecorationProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Base */}
      <Cylinder args={[0.08, 0.1, 0.03, 12]} position={[0, 0.015, 0]}>
        <meshStandardMaterial color="#8b6914" roughness={0.5} />
      </Cylinder>
      {/* Body */}
      <Cylinder args={[0.05, 0.07, 0.2, 12]} position={[0, 0.13, 0]}>
        <meshStandardMaterial color="#daa520" metalness={0.3} roughness={0.6} />
      </Cylinder>
      {/* Neck */}
      <Cylinder args={[0.015, 0.015, 0.08, 8]} position={[0, 0.27, 0]}>
        <meshStandardMaterial color="#c9a227" metalness={0.7} roughness={0.3} />
      </Cylinder>
      {/* Shade */}
      <Cylinder args={[0.08, 0.12, 0.15, 12]} position={[0, 0.38, 0]}>
        <meshStandardMaterial color="#f5e6d3" transparent opacity={0.85} side={THREE.DoubleSide} />
      </Cylinder>
      <pointLight position={[0, 0.35, 0]} intensity={0.5} distance={2.5} color="#fff5e0" />
    </group>
  );
}

// Area Rug with pattern
export function AreaRug({ position, rotation = 0, scale = 1, color = '#8b4513', pattern = 'solid' }: DecorationProps & { color?: string; pattern?: string }) {
  const borderColor = '#5a3d2b';
  
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Main rug */}
      <Plane args={[2.5, 1.8]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color={color} roughness={0.95} />
      </Plane>
      {/* Border */}
      <Plane args={[2.6, 0.1]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0.9]}>
        <meshStandardMaterial color={borderColor} roughness={0.9} />
      </Plane>
      <Plane args={[2.6, 0.1]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -0.9]}>
        <meshStandardMaterial color={borderColor} roughness={0.9} />
      </Plane>
      <Plane args={[0.1, 1.6]} rotation={[-Math.PI / 2, 0, 0]} position={[1.25, 0.012, 0]}>
        <meshStandardMaterial color={borderColor} roughness={0.9} />
      </Plane>
      <Plane args={[0.1, 1.6]} rotation={[-Math.PI / 2, 0, 0]} position={[-1.25, 0.012, 0]}>
        <meshStandardMaterial color={borderColor} roughness={0.9} />
      </Plane>
      {/* Pattern elements */}
      {pattern === 'geometric' && (
        <>
          <Plane args={[0.3, 0.3]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, 0.013, 0]}>
            <meshStandardMaterial color={borderColor} roughness={0.9} />
          </Plane>
          {[[-0.6, 0], [0.6, 0], [0, -0.5], [0, 0.5]].map(([x, z], i) => (
            <Plane key={i} args={[0.15, 0.15]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[x, 0.013, z]}>
              <meshStandardMaterial color="#daa520" roughness={0.9} />
            </Plane>
          ))}
        </>
      )}
    </group>
  );
}

// Curtains with folds
export function Curtains({ position, rotation = 0, scale = 1, color = '#4a5568', height = 2.5 }: DecorationProps & { color?: string; height?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Curtain rod */}
      <Cylinder args={[0.02, 0.02, 1.8, 8]} rotation={[0, 0, Math.PI / 2]} position={[0, height, 0]}>
        <meshStandardMaterial color="#8b6914" metalness={0.6} roughness={0.4} />
      </Cylinder>
      {/* Rod finials */}
      <Sphere args={[0.04, 8, 8]} position={[-0.95, height, 0]}>
        <meshStandardMaterial color="#c9a227" metalness={0.7} roughness={0.3} />
      </Sphere>
      <Sphere args={[0.04, 8, 8]} position={[0.95, height, 0]}>
        <meshStandardMaterial color="#c9a227" metalness={0.7} roughness={0.3} />
      </Sphere>
      {/* Left curtain panel with folds */}
      {[-0.65, -0.55, -0.45].map((x, i) => (
        <Box key={`l${i}`} args={[0.08, height - 0.1, 0.02]} position={[x, height / 2 - 0.05, 0]}>
          <meshStandardMaterial color={color} roughness={0.85} side={THREE.DoubleSide} />
        </Box>
      ))}
      {/* Right curtain panel with folds */}
      {[0.65, 0.55, 0.45].map((x, i) => (
        <Box key={`r${i}`} args={[0.08, height - 0.1, 0.02]} position={[x, height / 2 - 0.05, 0]}>
          <meshStandardMaterial color={color} roughness={0.85} side={THREE.DoubleSide} />
        </Box>
      ))}
      {/* Sheer center curtain */}
      <Box args={[0.6, height - 0.2, 0.01]} position={[0, height / 2 - 0.1, 0.02]}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
      </Box>
    </group>
  );
}

// Indoor Plant in pot
export function IndoorPlant({ position, rotation = 0, scale = 1, type = 'fern' }: DecorationProps & { type?: string }) {
  const leafColor = type === 'succulent' ? '#5a8f5a' : '#2d5a2d';
  
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Pot */}
      <Cylinder args={[0.12, 0.1, 0.18, 12]} position={[0, 0.09, 0]}>
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </Cylinder>
      {/* Pot rim */}
      <Cylinder args={[0.14, 0.14, 0.03, 12]} position={[0, 0.19, 0]}>
        <meshStandardMaterial color="#8b4513" roughness={0.7} />
      </Cylinder>
      {/* Soil */}
      <Cylinder args={[0.11, 0.11, 0.02, 12]} position={[0, 0.19, 0]}>
        <meshStandardMaterial color="#3d2817" roughness={0.95} />
      </Cylinder>
      {/* Plant foliage */}
      {type === 'fern' ? (
        // Fern leaves
        <>
          {[0, 0.5, 1, 1.5, 2, 2.5].map((r, i) => (
            <Box 
              key={i} 
              args={[0.02, 0.25 + i * 0.03, 0.12]} 
              position={[Math.sin(r * Math.PI) * 0.06, 0.32 + i * 0.02, Math.cos(r * Math.PI) * 0.06]}
              rotation={[0.3 - i * 0.05, r * Math.PI, 0]}
            >
              <meshStandardMaterial color={leafColor} roughness={0.8} />
            </Box>
          ))}
        </>
      ) : (
        // Succulent rosette
        <>
          <Sphere args={[0.08, 8, 8]} position={[0, 0.26, 0]}>
            <meshStandardMaterial color={leafColor} roughness={0.7} />
          </Sphere>
          {[0, 1, 2, 3, 4].map((i) => (
            <Sphere key={i} args={[0.04, 6, 6]} position={[Math.cos(i * 1.25) * 0.07, 0.24, Math.sin(i * 1.25) * 0.07]}>
              <meshStandardMaterial color="#7ab07a" roughness={0.7} />
            </Sphere>
          ))}
        </>
      )}
    </group>
  );
}

// Large Floor Plant
export function FloorPlant({ position, rotation = 0, scale = 1 }: DecorationProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Large pot */}
      <Cylinder args={[0.25, 0.2, 0.4, 12]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#5a4a3a" roughness={0.7} />
      </Cylinder>
      <Cylinder args={[0.27, 0.27, 0.05, 12]} position={[0, 0.42, 0]}>
        <meshStandardMaterial color="#5a4a3a" roughness={0.6} />
      </Cylinder>
      {/* Trunk */}
      <Cylinder args={[0.04, 0.06, 0.8, 8]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#5a3d2b" roughness={0.9} />
      </Cylinder>
      {/* Large leaves */}
      {[0, 0.8, 1.6, 2.4, 3.2, 4].map((r, i) => (
        <Box 
          key={i} 
          args={[0.03, 0.4, 0.15]} 
          position={[Math.sin(r) * 0.2, 1.2 + (i % 2) * 0.15, Math.cos(r) * 0.2]}
          rotation={[0.5, r, 0.2]}
        >
          <meshStandardMaterial color="#2d5a2d" roughness={0.8} />
        </Box>
      ))}
    </group>
  );
}

// Wall Art / Picture Frame
export function WallArt({ position, rotation = 0, scale = 1, frameColor = '#5a4a3a', artColor = '#87ceeb' }: DecorationProps & { frameColor?: string; artColor?: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Frame */}
      <Box args={[0.8, 0.6, 0.04]} position={[0, 0, 0]}>
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </Box>
      {/* Inner frame */}
      <Box args={[0.72, 0.52, 0.02]} position={[0, 0, 0.02]}>
        <meshStandardMaterial color="#f5f5f5" roughness={0.6} />
      </Box>
      {/* Art/canvas */}
      <Box args={[0.68, 0.48, 0.01]} position={[0, 0, 0.025]}>
        <meshStandardMaterial color={artColor} roughness={0.4} />
      </Box>
      {/* Abstract shapes on art */}
      <Box args={[0.2, 0.15, 0.005]} position={[-0.15, 0.1, 0.03]}>
        <meshStandardMaterial color="#f4a460" roughness={0.5} />
      </Box>
      <Sphere args={[0.08, 12, 12]} position={[0.15, -0.05, 0.035]}>
        <meshStandardMaterial color="#daa520" roughness={0.5} />
      </Sphere>
    </group>
  );
}

// Mirror
export function Mirror({ position, rotation = 0, scale = 1, shape = 'rectangle' }: DecorationProps & { shape?: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {shape === 'rectangle' ? (
        <>
          {/* Frame */}
          <Box args={[0.7, 1.2, 0.05]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#c9a227" metalness={0.6} roughness={0.4} />
          </Box>
          {/* Mirror surface */}
          <Box args={[0.6, 1.1, 0.01]} position={[0, 0, 0.03]}>
            <meshStandardMaterial color="#e8e8e8" metalness={0.95} roughness={0.05} />
          </Box>
        </>
      ) : (
        <>
          {/* Circular frame */}
          <Cylinder args={[0.45, 0.45, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#c9a227" metalness={0.6} roughness={0.4} />
          </Cylinder>
          {/* Mirror surface */}
          <Cylinder args={[0.4, 0.4, 0.01, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.03]}>
            <meshStandardMaterial color="#e8e8e8" metalness={0.95} roughness={0.05} />
          </Cylinder>
        </>
      )}
    </group>
  );
}

// Ceiling Fan
export function CeilingFan({ position, rotation = 0, scale = 1 }: DecorationProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Mounting rod */}
      <Cylinder args={[0.03, 0.03, 0.3, 8]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color="#5a4a3a" metalness={0.5} roughness={0.5} />
      </Cylinder>
      {/* Motor housing */}
      <Cylinder args={[0.12, 0.1, 0.15, 16]} position={[0, -0.02, 0]}>
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </Cylinder>
      {/* Fan blades */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Box 
          key={i} 
          args={[0.6, 0.02, 0.12]} 
          position={[Math.cos(i * 1.256) * 0.35, -0.08, Math.sin(i * 1.256) * 0.35]}
          rotation={[0, i * 1.256, 0]}
        >
          <meshStandardMaterial color="#8b6914" roughness={0.6} />
        </Box>
      ))}
      {/* Light fixture */}
      <Sphere args={[0.1, 16, 16]} position={[0, -0.18, 0]}>
        <meshStandardMaterial color="#fff5e0" transparent opacity={0.9} />
      </Sphere>
      <pointLight position={[0, -0.2, 0]} intensity={1} distance={6} color="#fff5e0" />
    </group>
  );
}

// Bookshelf with books
export function Bookshelf({ position, rotation = 0, scale = 1 }: DecorationProps) {
  const bookColors = ['#8b4513', '#2d5a8a', '#8a2d5a', '#5a8a2d', '#daa520', '#4a5568'];
  
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Main frame */}
      <Box args={[1, 1.8, 0.35]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#5a4a3a" roughness={0.7} />
      </Box>
      {/* Shelves */}
      {[0.3, 0.75, 1.2, 1.65].map((y, i) => (
        <Box key={i} args={[0.94, 0.03, 0.32]} position={[0, y, 0.01]}>
          <meshStandardMaterial color="#5a4a3a" roughness={0.6} />
        </Box>
      ))}
      {/* Books on shelves */}
      {[0.45, 0.9, 1.35].map((shelfY, shelfI) => (
        <group key={shelfI}>
          {[-0.35, -0.2, -0.05, 0.1, 0.25].map((x, bookI) => (
            <Box 
              key={bookI} 
              args={[0.08 + Math.random() * 0.04, 0.22 + Math.random() * 0.06, 0.18]} 
              position={[x, shelfY + 0.15, 0]}
            >
              <meshStandardMaterial color={bookColors[(shelfI + bookI) % bookColors.length]} roughness={0.8} />
            </Box>
          ))}
        </group>
      ))}
    </group>
  );
}

// Vase with flowers
export function VaseWithFlowers({ position, rotation = 0, scale = 1 }: DecorationProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Vase */}
      <Cylinder args={[0.06, 0.08, 0.25, 12]} position={[0, 0.125, 0]}>
        <meshStandardMaterial color="#4a7c8c" roughness={0.3} />
      </Cylinder>
      <Cylinder args={[0.04, 0.06, 0.05, 12]} position={[0, 0.275, 0]}>
        <meshStandardMaterial color="#4a7c8c" roughness={0.3} />
      </Cylinder>
      {/* Stems */}
      {[-0.02, 0, 0.02].map((x, i) => (
        <Cylinder key={i} args={[0.005, 0.005, 0.2, 6]} position={[x, 0.35, i * 0.015 - 0.015]}>
          <meshStandardMaterial color="#228b22" roughness={0.8} />
        </Cylinder>
      ))}
      {/* Flowers */}
      <Sphere args={[0.04, 8, 8]} position={[-0.02, 0.47, 0]}>
        <meshStandardMaterial color="#ff69b4" roughness={0.7} />
      </Sphere>
      <Sphere args={[0.035, 8, 8]} position={[0, 0.46, -0.015]}>
        <meshStandardMaterial color="#ff4500" roughness={0.7} />
      </Sphere>
      <Sphere args={[0.038, 8, 8]} position={[0.02, 0.45, 0.015]}>
        <meshStandardMaterial color="#ffd700" roughness={0.7} />
      </Sphere>
    </group>
  );
}

export default {
  FloorLamp,
  TableLamp,
  AreaRug,
  Curtains,
  IndoorPlant,
  FloorPlant,
  WallArt,
  Mirror,
  CeilingFan,
  Bookshelf,
  VaseWithFlowers
};
