import { Box, Plane, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface OutdoorFeaturesProps {
  houseWidth: number;
  houseDepth: number;
  style: string;
}

// Garage component
function Garage({ position, style }: { position: [number, number, number]; style: string }) {
  const isModern = style.toLowerCase().includes('modern') || style.toLowerCase().includes('contemporary');
  const garageColor = isModern ? '#e0e0e0' : '#d4c5b5';
  const doorColor = isModern ? '#404040' : '#5a4a3a';
  
  return (
    <group position={position}>
      {/* Garage structure */}
      <Box args={[8, 3.5, 7]} position={[0, 1.75, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={garageColor} roughness={0.7} />
      </Box>
      
      {/* Garage door */}
      <Box args={[6, 2.8, 0.15]} position={[0, 1.4, 3.5]} castShadow>
        <meshStandardMaterial color={doorColor} roughness={0.6} />
      </Box>
      
      {/* Door panels (horizontal lines) */}
      {[0.6, 1.3, 2.0, 2.7].map((y, i) => (
        <Box key={i} args={[5.8, 0.08, 0.02]} position={[0, y, 3.6]}>
          <meshStandardMaterial color="#303030" />
        </Box>
      ))}
      
      {/* Garage roof */}
      <Box args={[9, 0.3, 8]} position={[0, 3.65, 0]} castShadow>
        <meshStandardMaterial color="#505050" roughness={0.8} />
      </Box>
      
      {/* Side windows */}
      <Box args={[0.15, 1.2, 1.5]} position={[-4, 2, 0]}>
        <meshStandardMaterial color="#a0d2eb" transparent opacity={0.5} metalness={0.7} />
      </Box>
      
      {/* Driveway extension to garage */}
      <Plane args={[6, 8]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 7]} receiveShadow>
        <meshStandardMaterial color="#5a5a5a" roughness={0.9} />
      </Plane>
    </group>
  );
}

// Swimming Pool component
function SwimmingPool({ position }: { position: [number, number, number] }) {
  const poolWidth = 8;
  const poolDepth = 12;
  const poolDepthY = 1.8;
  
  return (
    <group position={position}>
      {/* Pool border/deck */}
      <Box args={[poolWidth + 2, 0.3, poolDepth + 2]} position={[0, 0.15, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#d4c5b5" roughness={0.6} />
      </Box>
      
      {/* Pool basin (sunken) */}
      <Box args={[poolWidth, poolDepthY, poolDepth]} position={[0, -poolDepthY/2 + 0.15, 0]} receiveShadow>
        <meshStandardMaterial color="#0077be" roughness={0.3} metalness={0.1} />
      </Box>
      
      {/* Pool water surface */}
      <Plane args={[poolWidth - 0.2, poolDepth - 0.2]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <meshStandardMaterial 
          color="#40c4ff" 
          transparent 
          opacity={0.8} 
          roughness={0.1}
          metalness={0.3}
        />
      </Plane>
      
      {/* Pool tiles pattern (lighter stripes at bottom) */}
      {[-3, 0, 3].map((z, i) => (
        <Box key={i} args={[poolWidth - 0.4, 0.05, 0.8]} position={[0, -poolDepthY + 0.2, z]}>
          <meshStandardMaterial color="#00a0e0" roughness={0.4} />
        </Box>
      ))}
      
      {/* Pool ladder */}
      <group position={[poolWidth/2 - 0.3, 0, -poolDepth/2 + 1]}>
        {/* Rails */}
        <Cylinder args={[0.05, 0.05, 1.2]} position={[-0.3, 0.6, 0]}>
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[0.05, 0.05, 1.2]} position={[0.3, 0.6, 0]}>
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
        </Cylinder>
        {/* Steps */}
        {[0.2, 0.5, 0.8].map((y, i) => (
          <Cylinder key={i} args={[0.03, 0.03, 0.5]} position={[0, y, 0]} rotation={[0, 0, Math.PI/2]}>
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
          </Cylinder>
        ))}
      </group>
      
      {/* Pool lounge chairs */}
      {[[-5, 0.15, -3], [-5, 0.15, 0], [-5, 0.15, 3]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          {/* Chair frame */}
          <Box args={[1.8, 0.15, 0.6]} position={[0, 0.2, 0]}>
            <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
          </Box>
          <Box args={[1.8, 0.15, 0.6]} position={[0, 0.4, -0.3]} rotation={[0.3, 0, 0]}>
            <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
          </Box>
          {/* Cushion */}
          <Box args={[1.6, 0.08, 1.1]} position={[0, 0.35, -0.1]}>
            <meshStandardMaterial color="#2196f3" roughness={0.6} />
          </Box>
        </group>
      ))}
      
      {/* Umbrella */}
      <group position={[-5.5, 0, 0]}>
        <Cylinder args={[0.08, 0.08, 2.5]} position={[0, 1.25, 0]}>
          <meshStandardMaterial color="#8b4513" roughness={0.6} />
        </Cylinder>
        <mesh position={[0, 2.5, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[1.8, 0.8, 8]} />
          <meshStandardMaterial color="#ff6b35" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// Outdoor Deck/Patio component
function OutdoorDeck({ position, houseWidth }: { position: [number, number, number]; houseWidth: number }) {
  const deckWidth = Math.min(houseWidth * 0.8, 12);
  const deckDepth = 6;
  
  return (
    <group position={position}>
      {/* Main deck platform */}
      <Box args={[deckWidth, 0.25, deckDepth]} position={[0, 0.125, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#8b6914" roughness={0.7} />
      </Box>
      
      {/* Deck planks pattern */}
      {Array.from({ length: Math.floor(deckWidth / 0.3) }).map((_, i) => (
        <Box key={i} args={[0.02, 0.26, deckDepth]} position={[-deckWidth/2 + 0.15 + i * 0.3, 0.13, 0]} receiveShadow>
          <meshStandardMaterial color="#704214" roughness={0.8} />
        </Box>
      ))}
      
      {/* Deck railing */}
      {/* Back rail */}
      <Box args={[deckWidth, 0.08, 0.08]} position={[0, 1, -deckDepth/2 + 0.04]}>
        <meshStandardMaterial color="#5a4a3a" roughness={0.6} />
      </Box>
      {/* Side rails */}
      <Box args={[0.08, 0.08, deckDepth]} position={[-deckWidth/2 + 0.04, 1, 0]}>
        <meshStandardMaterial color="#5a4a3a" roughness={0.6} />
      </Box>
      <Box args={[0.08, 0.08, deckDepth]} position={[deckWidth/2 - 0.04, 1, 0]}>
        <meshStandardMaterial color="#5a4a3a" roughness={0.6} />
      </Box>
      
      {/* Railing posts */}
      {[[-deckWidth/2 + 0.05, -deckDepth/2 + 0.05], [deckWidth/2 - 0.05, -deckDepth/2 + 0.05], 
        [-deckWidth/2 + 0.05, deckDepth/2 - 0.05], [deckWidth/2 - 0.05, deckDepth/2 - 0.05]].map((pos, i) => (
        <Box key={i} args={[0.1, 1, 0.1]} position={[pos[0], 0.5, pos[1]]}>
          <meshStandardMaterial color="#5a4a3a" roughness={0.6} />
        </Box>
      ))}
      
      {/* Patio furniture - table */}
      <group position={[0, 0.25, 0]}>
        <Cylinder args={[1.2, 1.2, 0.1]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="#8b4513" roughness={0.5} />
        </Cylinder>
        <Cylinder args={[0.1, 0.15, 0.6]} position={[0, 0.25, 0]}>
          <meshStandardMaterial color="#5a4a3a" roughness={0.6} />
        </Cylinder>
      </group>
      
      {/* Chairs around table */}
      {[[1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5]].map((pos, i) => (
        <group key={i} position={[pos[0], 0.25, pos[1]]}>
          <Box args={[0.5, 0.08, 0.5]} position={[0, 0.35, 0]}>
            <meshStandardMaterial color="#4a90a4" roughness={0.5} />
          </Box>
          <Box args={[0.5, 0.5, 0.08]} position={[0, 0.5, -0.25]}>
            <meshStandardMaterial color="#4a90a4" roughness={0.5} />
          </Box>
          {/* Chair legs */}
          {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map((legPos, j) => (
            <Box key={j} args={[0.05, 0.35, 0.05]} position={[legPos[0], 0.175, legPos[1]]}>
              <meshStandardMaterial color="#3a7084" roughness={0.5} />
            </Box>
          ))}
        </group>
      ))}
      
      {/* BBQ grill */}
      <group position={[deckWidth/2 - 1, 0.25, -deckDepth/2 + 1.5]}>
        <Box args={[1, 0.9, 0.6]} position={[0, 0.45, 0]}>
          <meshStandardMaterial color="#2d2d2d" roughness={0.4} metalness={0.6} />
        </Box>
        {/* Grill lid */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.45, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Legs */}
        <Box args={[0.08, 0.5, 0.08]} position={[-0.35, -0.25, -0.2]}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.6} />
        </Box>
        <Box args={[0.08, 0.5, 0.08]} position={[0.35, -0.25, -0.2]}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.6} />
        </Box>
      </group>
      
      {/* Potted plants on deck */}
      {[[deckWidth/2 - 0.5, 0.25, deckDepth/2 - 0.5], [-deckWidth/2 + 0.5, 0.25, deckDepth/2 - 0.5]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <Cylinder args={[0.3, 0.25, 0.4]} position={[0, 0.2, 0]}>
            <meshStandardMaterial color="#8b4513" roughness={0.7} />
          </Cylinder>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color="#228b22" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function OutdoorFeatures({ houseWidth, houseDepth, style }: OutdoorFeaturesProps) {
  return (
    <group>
      {/* Garage - positioned to the right side of the house */}
      <Garage 
        position={[houseWidth / 2 + 6, 0, houseDepth / 2 - 3]} 
        style={style} 
      />
      
      {/* Swimming Pool - positioned behind the house */}
      <SwimmingPool 
        position={[0, 0, -houseDepth / 2 - 10]} 
      />
      
      {/* Outdoor Deck/Patio - positioned at the back of the house */}
      <OutdoorDeck 
        position={[0, 0.4, -houseDepth / 2 - 1]} 
        houseWidth={houseWidth} 
      />
    </group>
  );
}
