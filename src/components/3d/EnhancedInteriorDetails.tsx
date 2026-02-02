import { Box, Cylinder, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';

interface DecorationProps {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}

// Modern pendant light
export function PendantLight({ position, style = 'modern' }: DecorationProps & { style?: string }) {
  const isModern = style === 'modern';
  
  return (
    <group position={position}>
      {/* Cord */}
      <Cylinder args={[0.01, 0.01, 0.5, 6]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Cylinder>
      
      {/* Shade */}
      {isModern ? (
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#f5f5f5" transparent opacity={0.9} roughness={0.3} />
        </mesh>
      ) : (
        <Cylinder args={[0.08, 0.2, 0.25, 12]} position={[0, -0.05, 0]}>
          <meshStandardMaterial color="#f5e6d3" transparent opacity={0.85} side={THREE.DoubleSide} />
        </Cylinder>
      )}
      
      {/* Bulb glow */}
      <pointLight position={[0, -0.1, 0]} intensity={0.6} distance={4} color="#fff5e0" />
    </group>
  );
}

// Wall sconce light
export function WallSconce({ position, rotation = 0 }: DecorationProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Mounting plate */}
      <Box args={[0.1, 0.15, 0.03]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#c9a227" metalness={0.7} roughness={0.3} />
      </Box>
      
      {/* Arm */}
      <Box args={[0.03, 0.03, 0.12]} position={[0, 0, 0.06]}>
        <meshStandardMaterial color="#c9a227" metalness={0.6} roughness={0.4} />
      </Box>
      
      {/* Shade */}
      <Cylinder args={[0.05, 0.08, 0.12, 8]} position={[0, 0.02, 0.15]} rotation={[-Math.PI / 6, 0, 0]}>
        <meshStandardMaterial color="#f5e6d3" transparent opacity={0.8} />
      </Cylinder>
      
      <pointLight position={[0, 0.05, 0.18]} intensity={0.4} distance={3} color="#fff5e0" />
    </group>
  );
}

// Detailed clock
export function WallClock({ position, rotation = 0 }: DecorationProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <Cylinder args={[0.25, 0.25, 0.04, 24]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
      </Cylinder>
      
      {/* Face */}
      <Cylinder args={[0.22, 0.22, 0.01, 24]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.025]}>
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </Cylinder>
      
      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return (
          <Box 
            key={i} 
            args={[i % 3 === 0 ? 0.025 : 0.015, 0.05, 0.005]} 
            position={[Math.cos(angle) * 0.18, Math.sin(angle) * 0.18, 0.03]}
            rotation={[0, 0, angle + Math.PI / 2]}
          >
            <meshStandardMaterial color="#1a1a1a" />
          </Box>
        );
      })}
      
      {/* Hour hand */}
      <Box args={[0.015, 0.1, 0.005]} position={[0, 0.04, 0.035]} rotation={[0, 0, Math.PI / 6]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Minute hand */}
      <Box args={[0.01, 0.14, 0.005]} position={[0, 0.06, 0.037]} rotation={[0, 0, -Math.PI / 3]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Center dot */}
      <Cylinder args={[0.015, 0.015, 0.01, 8]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.04]}>
        <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.2} />
      </Cylinder>
    </group>
  );
}

// Picture frame with varied art
export function DetailedPictureFrame({ position, rotation = 0, artType = 'landscape', size = [0.6, 0.45] }: DecorationProps & { artType?: string; size?: [number, number] }) {
  const getArtColors = () => {
    switch (artType) {
      case 'abstract': return ['#3498db', '#e74c3c', '#f1c40f'];
      case 'portrait': return ['#d4a574', '#8b6914', '#2c3e50'];
      case 'landscape': return ['#87ceeb', '#228b22', '#8b4513'];
      default: return ['#87ceeb', '#228b22', '#8b4513'];
    }
  };
  
  const colors = getArtColors();
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <Box args={[size[0] + 0.08, size[1] + 0.08, 0.03]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#5a4a3a" roughness={0.5} />
      </Box>
      
      {/* Mat */}
      <Box args={[size[0] + 0.02, size[1] + 0.02, 0.01]} position={[0, 0, 0.02]}>
        <meshStandardMaterial color="#f5f5f0" roughness={0.7} />
      </Box>
      
      {/* Art canvas */}
      <Box args={[size[0] - 0.04, size[1] - 0.04, 0.005]} position={[0, 0, 0.025]}>
        <meshStandardMaterial color={colors[0]} roughness={0.4} />
      </Box>
      
      {/* Art details based on type */}
      {artType === 'landscape' && (
        <>
          <Box args={[size[0] - 0.06, size[1] * 0.3, 0.003]} position={[0, -size[1] * 0.2, 0.028]}>
            <meshStandardMaterial color={colors[1]} roughness={0.5} />
          </Box>
          <Box args={[size[0] * 0.15, size[1] * 0.2, 0.002]} position={[-size[0] * 0.25, size[1] * 0.05, 0.029]}>
            <meshStandardMaterial color={colors[2]} roughness={0.6} />
          </Box>
        </>
      )}
      {artType === 'abstract' && (
        <>
          <Sphere args={[size[0] * 0.15, 8, 8]} position={[size[0] * 0.15, size[1] * 0.1, 0.03]}>
            <meshStandardMaterial color={colors[1]} roughness={0.5} />
          </Sphere>
          <Box args={[size[0] * 0.2, size[0] * 0.2, 0.003]} position={[-size[0] * 0.15, -size[1] * 0.1, 0.028]} rotation={[0, 0, Math.PI / 4]}>
            <meshStandardMaterial color={colors[2]} roughness={0.5} />
          </Box>
        </>
      )}
    </group>
  );
}

// Decorative throw blanket on furniture
export function ThrowBlanket({ position, rotation = 0, color = '#8b0000' }: DecorationProps & { color?: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Draped portion */}
      <Box args={[0.8, 0.04, 0.5]} position={[0, 0.02, 0]} rotation={[0.1, 0.05, 0.02]}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </Box>
      {/* Hanging edge */}
      <Box args={[0.25, 0.3, 0.03]} position={[0.35, -0.1, 0.2]} rotation={[0.3, -0.1, 0.15]}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </Box>
      {/* Fringe detail */}
      {[-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => (
        <Box key={i} args={[0.015, 0.06, 0.01]} position={[x, -0.25, 0.22]} rotation={[0.2, 0, (i - 2) * 0.05]}>
          <meshStandardMaterial color={color} roughness={0.95} />
        </Box>
      ))}
    </group>
  );
}

// Side table with lamp
export function SideTableWithLamp({ position, rotation = 0, tableColor = '#5a4a3a' }: DecorationProps & { tableColor?: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Table top */}
      <Cylinder args={[0.25, 0.25, 0.03, 12]} position={[0, 0.55, 0]}>
        <meshStandardMaterial color={tableColor} roughness={0.5} />
      </Cylinder>
      
      {/* Table leg */}
      <Cylinder args={[0.04, 0.05, 0.52, 8]} position={[0, 0.26, 0]}>
        <meshStandardMaterial color={tableColor} roughness={0.6} />
      </Cylinder>
      
      {/* Table base */}
      <Cylinder args={[0.2, 0.22, 0.03, 12]} position={[0, 0.015, 0]}>
        <meshStandardMaterial color={tableColor} roughness={0.5} />
      </Cylinder>
      
      {/* Small lamp on table */}
      <group position={[0, 0.57, 0]}>
        {/* Lamp base */}
        <Cylinder args={[0.06, 0.07, 0.02, 10]} position={[0, 0.01, 0]}>
          <meshStandardMaterial color="#c9a227" metalness={0.7} roughness={0.3} />
        </Cylinder>
        {/* Lamp body */}
        <Cylinder args={[0.04, 0.05, 0.12, 10]} position={[0, 0.08, 0]}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </Cylinder>
        {/* Lamp shade */}
        <Cylinder args={[0.06, 0.1, 0.12, 10]} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="#f5e6d3" transparent opacity={0.85} side={THREE.DoubleSide} />
        </Cylinder>
        <pointLight position={[0, 0.18, 0]} intensity={0.4} distance={2.5} color="#fff5e0" />
      </group>
    </group>
  );
}

// Decorative bowl with items
export function DecorativeBowl({ position, rotation = 0, contents = 'fruit' }: DecorationProps & { contents?: string }) {
  const fruitColors = ['#ff6347', '#ffd700', '#32cd32', '#ff4500'];
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Bowl */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Contents */}
      {contents === 'fruit' && (
        <>
          {fruitColors.map((color, i) => (
            <Sphere key={i} args={[0.04, 8, 8]} position={[(i - 1.5) * 0.05, 0.06, (i % 2) * 0.04 - 0.02]}>
              <meshStandardMaterial color={color} roughness={0.6} />
            </Sphere>
          ))}
        </>
      )}
      {contents === 'decorative' && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <Sphere key={i} args={[0.025, 6, 6]} position={[(i - 2) * 0.04, 0.04 + (i % 2) * 0.02, (i % 2) * 0.03]}>
              <meshStandardMaterial color={i % 2 === 0 ? '#4a90a4' : '#c9a227'} roughness={0.4} metalness={0.3} />
            </Sphere>
          ))}
        </>
      )}
    </group>
  );
}

// Potted indoor tree (like a fiddle leaf fig)
export function IndoorTree({ position, rotation = 0, scale = 1 }: DecorationProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Large decorative pot */}
      <Cylinder args={[0.25, 0.2, 0.5, 12]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#5a4a3a" roughness={0.7} />
      </Cylinder>
      <Cylinder args={[0.27, 0.27, 0.05, 12]} position={[0, 0.52, 0]}>
        <meshStandardMaterial color="#5a4a3a" roughness={0.6} />
      </Cylinder>
      
      {/* Soil */}
      <Cylinder args={[0.23, 0.23, 0.03, 12]} position={[0, 0.52, 0]}>
        <meshStandardMaterial color="#3d2817" roughness={0.95} />
      </Cylinder>
      
      {/* Trunk */}
      <Cylinder args={[0.03, 0.04, 0.8, 8]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </Cylinder>
      
      {/* Large leaves */}
      {[
        [0.15, 1.3, 0.05, 0.4],
        [-0.12, 1.25, 0.08, -0.3],
        [0.08, 1.4, -0.1, 0.2],
        [-0.1, 1.45, -0.05, -0.2],
        [0.05, 1.55, 0.03, 0.1],
        [-0.08, 1.35, 0.12, -0.4],
        [0.12, 1.5, -0.08, 0.3],
      ].map(([x, y, z, rot], i) => (
        <Box 
          key={i} 
          args={[0.12, 0.18, 0.01]} 
          position={[x, y, z]}
          rotation={[0.2, rot, 0.1]}
        >
          <meshStandardMaterial color="#2d5a2d" roughness={0.7} side={THREE.DoubleSide} />
        </Box>
      ))}
    </group>
  );
}

export default {
  PendantLight,
  WallSconce,
  WallClock,
  DetailedPictureFrame,
  ThrowBlanket,
  SideTableWithLamp,
  DecorativeBowl,
  IndoorTree
};
