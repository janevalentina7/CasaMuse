import { Box, Cylinder, Plane, Cone } from '@react-three/drei';
import * as THREE from 'three';

interface RoofProps {
  width: number;
  depth: number;
  height: number;
  style: string;
  styleConfig: {
    roofColor: string;
    trimColor: string;
    wallColor: string;
  };
}

// Chimney component
function Chimney({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Main chimney body */}
      <Box args={[0.6, 1.5, 0.6]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color={color} roughness={0.8} />
      </Box>
      {/* Chimney cap */}
      <Box args={[0.7, 0.1, 0.7]} position={[0, 1.55, 0]}>
        <meshStandardMaterial color="#4a4a4a" roughness={0.6} />
      </Box>
      {/* Chimney pot */}
      <Cylinder args={[0.12, 0.15, 0.3, 8]} position={[0, 1.75, 0]}>
        <meshStandardMaterial color="#8b4513" roughness={0.7} />
      </Cylinder>
    </group>
  );
}

// Skylight component
function Skylight({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation as any}>
      {/* Frame */}
      <Box args={[0.8, 0.6, 0.08]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4a5568" metalness={0.5} roughness={0.5} />
      </Box>
      {/* Glass */}
      <Box args={[0.7, 0.5, 0.02]} position={[0, 0, 0.04]}>
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.5} metalness={0.9} roughness={0.1} />
      </Box>
    </group>
  );
}

// Modern Flat Roof
function FlatRoof({ width, depth, height, styleConfig }: RoofProps) {
  return (
    <group position={[0, height, 0]}>
      {/* Main flat roof */}
      <Box args={[width + 1, 0.25, depth + 1]} position={[0, 0.125, 0]}>
        <meshStandardMaterial color={styleConfig.roofColor} roughness={0.6} />
      </Box>
      {/* Parapet walls */}
      <Box args={[width + 1.2, 0.6, 0.15]} position={[0, 0.55, depth / 2 + 0.5]}>
        <meshStandardMaterial color={styleConfig.wallColor} roughness={0.7} />
      </Box>
      <Box args={[width + 1.2, 0.6, 0.15]} position={[0, 0.55, -depth / 2 - 0.5]}>
        <meshStandardMaterial color={styleConfig.wallColor} roughness={0.7} />
      </Box>
      <Box args={[0.15, 0.6, depth + 0.8]} position={[width / 2 + 0.52, 0.55, 0]}>
        <meshStandardMaterial color={styleConfig.wallColor} roughness={0.7} />
      </Box>
      <Box args={[0.15, 0.6, depth + 0.8]} position={[-width / 2 - 0.52, 0.55, 0]}>
        <meshStandardMaterial color={styleConfig.wallColor} roughness={0.7} />
      </Box>
      {/* Roof drainage */}
      <Cylinder args={[0.05, 0.05, 0.8, 8]} position={[width / 2 + 0.6, -0.1, depth / 4]}>
        <meshStandardMaterial color="#4a4a4a" roughness={0.5} />
      </Cylinder>
      {/* Skylights */}
      <Skylight position={[-width / 4, 0.3, 0]} rotation={[0, 0, 0]} />
      <Skylight position={[width / 4, 0.3, 0]} rotation={[0, 0, 0]} />
    </group>
  );
}

// Gable Roof (Traditional)
function GableRoof({ width, depth, height, styleConfig }: RoofProps) {
  const roofHeight = 2.5;
  const overhang = 1.2;
  const roofAngle = Math.PI / 6;
  
  return (
    <group position={[0, height, 0]}>
      {/* Roof eave */}
      <Box args={[width + overhang * 2, 0.2, depth + overhang * 2]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color={styleConfig.trimColor} roughness={0.6} />
      </Box>
      
      {/* Left roof slope */}
      <mesh position={[-width / 4 - 0.2, roofHeight / 2 + 0.2, 0]} rotation={[0, 0, roofAngle]} castShadow receiveShadow>
        <boxGeometry args={[(width / 2 + overhang) / Math.cos(roofAngle), 0.15, depth + overhang * 2]} />
        <meshStandardMaterial color={styleConfig.roofColor} roughness={0.7} />
      </mesh>
      
      {/* Right roof slope */}
      <mesh position={[width / 4 + 0.2, roofHeight / 2 + 0.2, 0]} rotation={[0, 0, -roofAngle]} castShadow receiveShadow>
        <boxGeometry args={[(width / 2 + overhang) / Math.cos(roofAngle), 0.15, depth + overhang * 2]} />
        <meshStandardMaterial color={styleConfig.roofColor} roughness={0.7} />
      </mesh>
      
      {/* Ridge cap */}
      <Box args={[0.25, 0.25, depth + overhang * 2]} position={[0, roofHeight + 0.12, 0]}>
        <meshStandardMaterial color={styleConfig.trimColor} roughness={0.5} />
      </Box>
      
      {/* Gable end triangles */}
      {[depth / 2 + 0.5, -depth / 2 - 0.5].map((z, i) => (
        <mesh key={i} position={[0, roofHeight / 2 + 0.2, z]}>
          <coneGeometry args={[width / 2 + 0.5, roofHeight, 4]} />
          <meshStandardMaterial color={styleConfig.wallColor} roughness={0.7} />
        </mesh>
      ))}
      
      {/* Chimney */}
      <Chimney position={[width / 4, roofHeight / 2, -depth / 4]} color="#8b4513" />
    </group>
  );
}

// Mediterranean Terracotta Tile Roof
function MediterraneanRoof({ width, depth, height, styleConfig }: RoofProps) {
  const roofHeight = 2.2;
  const overhang = 1.5;
  const tileColor = '#cc5500';
  
  return (
    <group position={[0, height, 0]}>
      {/* Roof base */}
      <Box args={[width + overhang * 2, 0.3, depth + overhang * 2]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color="#f5deb3" roughness={0.7} />
      </Box>
      
      {/* Left slope with tile texture */}
      <group position={[-width / 4 - 0.3, roofHeight / 2 + 0.3, 0]} rotation={[0, 0, Math.PI / 5]}>
        <Box args={[(width / 2 + overhang) / Math.cos(Math.PI / 5), 0.2, depth + overhang * 2]}>
          <meshStandardMaterial color={tileColor} roughness={0.8} />
        </Box>
        {/* Tile rows */}
        {[-depth / 3, 0, depth / 3].map((z, i) => (
          <Box key={i} args={[(width / 2 + overhang) / Math.cos(Math.PI / 5) - 0.5, 0.08, 0.3]} position={[0, 0.14, z]}>
            <meshStandardMaterial color="#a04000" roughness={0.7} />
          </Box>
        ))}
      </group>
      
      {/* Right slope with tile texture */}
      <group position={[width / 4 + 0.3, roofHeight / 2 + 0.3, 0]} rotation={[0, 0, -Math.PI / 5]}>
        <Box args={[(width / 2 + overhang) / Math.cos(Math.PI / 5), 0.2, depth + overhang * 2]}>
          <meshStandardMaterial color={tileColor} roughness={0.8} />
        </Box>
        {[-depth / 3, 0, depth / 3].map((z, i) => (
          <Box key={i} args={[(width / 2 + overhang) / Math.cos(Math.PI / 5) - 0.5, 0.08, 0.3]} position={[0, 0.14, z]}>
            <meshStandardMaterial color="#a04000" roughness={0.7} />
          </Box>
        ))}
      </group>
      
      {/* Ridge tiles */}
      {Array.from({ length: Math.floor(depth / 0.8) }).map((_, i) => (
        <Cylinder key={i} args={[0.12, 0.12, 0.6, 8]} rotation={[Math.PI / 2, 0, 0]} position={[0, roofHeight + 0.2, -depth / 2 + 0.4 + i * 0.8]}>
          <meshStandardMaterial color={tileColor} roughness={0.7} />
        </Cylinder>
      ))}
      
      {/* Decorative chimney */}
      <Chimney position={[width / 3, roofHeight / 2, -depth / 3]} color="#f5deb3" />
    </group>
  );
}

// Colonial Roof with dormers
function ColonialRoof({ width, depth, height, styleConfig }: RoofProps) {
  const roofHeight = 3;
  const overhang = 1;
  
  return (
    <group position={[0, height, 0]}>
      {/* Main roof eave */}
      <Box args={[width + overhang * 2, 0.25, depth + overhang * 2]} position={[0, 0.125, 0]}>
        <meshStandardMaterial color={styleConfig.trimColor} roughness={0.5} />
      </Box>
      
      {/* Steep roof slopes */}
      <mesh position={[-width / 4, roofHeight / 2 + 0.2, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[(width / 2 + overhang) / Math.cos(Math.PI / 4), 0.12, depth + overhang * 2]} />
        <meshStandardMaterial color={styleConfig.roofColor} roughness={0.6} />
      </mesh>
      <mesh position={[width / 4, roofHeight / 2 + 0.2, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <boxGeometry args={[(width / 2 + overhang) / Math.cos(Math.PI / 4), 0.12, depth + overhang * 2]} />
        <meshStandardMaterial color={styleConfig.roofColor} roughness={0.6} />
      </mesh>
      
      {/* Ridge */}
      <Box args={[0.2, 0.2, depth + overhang * 2]} position={[0, roofHeight + 0.1, 0]}>
        <meshStandardMaterial color={styleConfig.trimColor} roughness={0.5} />
      </Box>
      
      {/* Dormers */}
      {[-width / 4, width / 4].map((x, i) => (
        <group key={i} position={[x, roofHeight / 2, depth / 2 - 1]}>
          {/* Dormer front */}
          <Box args={[1.2, 1.2, 0.15]} position={[0, 0.1, 0.5]}>
            <meshStandardMaterial color={styleConfig.wallColor} roughness={0.7} />
          </Box>
          {/* Dormer window */}
          <Box args={[0.6, 0.8, 0.02]} position={[0, 0.1, 0.58]}>
            <meshStandardMaterial color="#87ceeb" transparent opacity={0.4} metalness={0.9} />
          </Box>
          {/* Dormer roof */}
          <mesh position={[0, 0.85, 0.2]} rotation={[Math.PI / 6, 0, 0]}>
            <boxGeometry args={[1.4, 0.1, 0.8]} />
            <meshStandardMaterial color={styleConfig.roofColor} roughness={0.6} />
          </mesh>
        </group>
      ))}
      
      {/* Two chimneys - typical colonial style */}
      <Chimney position={[-width / 3, roofHeight / 2 + 0.5, 0]} color="#8b4513" />
      <Chimney position={[width / 3, roofHeight / 2 + 0.5, 0]} color="#8b4513" />
    </group>
  );
}

// Industrial/Contemporary Shed Roof
function ShedRoof({ width, depth, height, styleConfig }: RoofProps) {
  const roofHeight = 1.5;
  const overhang = 0.8;
  
  return (
    <group position={[0, height, 0]}>
      {/* Sloped roof - single direction */}
      <mesh position={[0, roofHeight / 2, 0]} rotation={[0, 0, -Math.PI / 12]} castShadow>
        <boxGeometry args={[width + overhang * 2, 0.2, depth + overhang * 2]} />
        <meshStandardMaterial color={styleConfig.roofColor} metalness={0.3} roughness={0.5} />
      </mesh>
      
      {/* Metal seams */}
      {Array.from({ length: Math.floor(width / 1.5) }).map((_, i) => (
        <Box key={i} args={[0.05, 0.08, depth + overhang * 2]} position={[-width / 2 + 0.75 + i * 1.5, roofHeight / 2 + 0.14, 0]} rotation={[0, 0, -Math.PI / 12]}>
          <meshStandardMaterial color="#606060" metalness={0.6} roughness={0.4} />
        </Box>
      ))}
      
      {/* Fascia board on high side */}
      <Box args={[0.15, 0.8, depth + overhang * 2]} position={[-width / 2 - 0.4, roofHeight + 0.3, 0]}>
        <meshStandardMaterial color={styleConfig.trimColor} roughness={0.5} />
      </Box>
      
      {/* Skylights */}
      <Skylight position={[0, roofHeight / 2 + 0.15, -depth / 4]} rotation={[0, 0, -Math.PI / 12]} />
      <Skylight position={[0, roofHeight / 2 + 0.15, depth / 4]} rotation={[0, 0, -Math.PI / 12]} />
    </group>
  );
}

// Luxury Mansion Hip Roof
function HipRoof({ width, depth, height, styleConfig }: RoofProps) {
  const roofHeight = 2.8;
  const overhang = 1.3;
  
  return (
    <group position={[0, height, 0]}>
      {/* Roof eave */}
      <Box args={[width + overhang * 2, 0.25, depth + overhang * 2]} position={[0, 0.125, 0]}>
        <meshStandardMaterial color={styleConfig.trimColor} roughness={0.5} />
      </Box>
      
      {/* Four sloped sections */}
      {/* Front slope */}
      <mesh position={[0, roofHeight / 3, depth / 2]} rotation={[-Math.PI / 5, 0, 0]} castShadow>
        <boxGeometry args={[width + overhang, 0.12, depth / 2 + overhang]} />
        <meshStandardMaterial color={styleConfig.roofColor} roughness={0.6} />
      </mesh>
      {/* Back slope */}
      <mesh position={[0, roofHeight / 3, -depth / 2]} rotation={[Math.PI / 5, 0, 0]} castShadow>
        <boxGeometry args={[width + overhang, 0.12, depth / 2 + overhang]} />
        <meshStandardMaterial color={styleConfig.roofColor} roughness={0.6} />
      </mesh>
      {/* Left slope */}
      <mesh position={[-width / 2, roofHeight / 3, 0]} rotation={[0, 0, Math.PI / 5]} castShadow>
        <boxGeometry args={[width / 2 + overhang, 0.12, depth - 2]} />
        <meshStandardMaterial color={styleConfig.roofColor} roughness={0.6} />
      </mesh>
      {/* Right slope */}
      <mesh position={[width / 2, roofHeight / 3, 0]} rotation={[0, 0, -Math.PI / 5]} castShadow>
        <boxGeometry args={[width / 2 + overhang, 0.12, depth - 2]} />
        <meshStandardMaterial color={styleConfig.roofColor} roughness={0.6} />
      </mesh>
      
      {/* Ridge */}
      <Box args={[width / 2, 0.2, 0.2]} position={[0, roofHeight, 0]}>
        <meshStandardMaterial color={styleConfig.trimColor} roughness={0.5} />
      </Box>
      
      {/* Elegant chimney */}
      <Chimney position={[width / 4, roofHeight / 2, -depth / 4]} color={styleConfig.wallColor} />
    </group>
  );
}

// Rustic A-Frame Roof
function AFrameRoof({ width, depth, height, styleConfig }: RoofProps) {
  const roofHeight = 4;
  const overhang = 1.5;
  
  return (
    <group position={[0, height, 0]}>
      {/* Very steep A-frame slopes */}
      <mesh position={[-width / 3, roofHeight / 2, 0]} rotation={[0, 0, Math.PI / 3]} castShadow>
        <boxGeometry args={[roofHeight / Math.sin(Math.PI / 3), 0.15, depth + overhang * 2]} />
        <meshStandardMaterial color={styleConfig.roofColor} roughness={0.8} />
      </mesh>
      <mesh position={[width / 3, roofHeight / 2, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
        <boxGeometry args={[roofHeight / Math.sin(Math.PI / 3), 0.15, depth + overhang * 2]} />
        <meshStandardMaterial color={styleConfig.roofColor} roughness={0.8} />
      </mesh>
      
      {/* Ridge beam */}
      <Cylinder args={[0.15, 0.15, depth + overhang * 2, 8]} rotation={[Math.PI / 2, 0, 0]} position={[0, roofHeight + 0.15, 0]}>
        <meshStandardMaterial color="#5a3d2b" roughness={0.7} />
      </Cylinder>
      
      {/* Exposed rafters */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={i} position={[0, 0, -depth / 2 + 1 + i * (depth / 4)]}>
          <Cylinder args={[0.08, 0.08, roofHeight / Math.sin(Math.PI / 3)]} rotation={[0, 0, Math.PI / 3]} position={[-width / 4, roofHeight / 2 - 0.5, 0]}>
            <meshStandardMaterial color="#5a3d2b" roughness={0.7} />
          </Cylinder>
          <Cylinder args={[0.08, 0.08, roofHeight / Math.sin(Math.PI / 3)]} rotation={[0, 0, -Math.PI / 3]} position={[width / 4, roofHeight / 2 - 0.5, 0]}>
            <meshStandardMaterial color="#5a3d2b" roughness={0.7} />
          </Cylinder>
        </group>
      ))}
      
      {/* Stone chimney */}
      <Chimney position={[0, roofHeight - 1, -depth / 4]} color="#6b6b6b" />
    </group>
  );
}

// Main export function
export function StyleSpecificRoof({ width, depth, height, style, styleConfig }: RoofProps) {
  const lowerStyle = style.toLowerCase();
  
  if (lowerStyle.includes('modern') || lowerStyle.includes('contemporary') || lowerStyle.includes('minimalist')) {
    return <FlatRoof width={width} depth={depth} height={height} style={style} styleConfig={styleConfig} />;
  }
  
  if (lowerStyle.includes('mediterranean')) {
    return <MediterraneanRoof width={width} depth={depth} height={height} style={style} styleConfig={styleConfig} />;
  }
  
  if (lowerStyle.includes('colonial')) {
    return <ColonialRoof width={width} depth={depth} height={height} style={style} styleConfig={styleConfig} />;
  }
  
  if (lowerStyle.includes('industrial')) {
    return <ShedRoof width={width} depth={depth} height={height} style={style} styleConfig={styleConfig} />;
  }
  
  if (lowerStyle.includes('luxury')) {
    return <HipRoof width={width} depth={depth} height={height} style={style} styleConfig={styleConfig} />;
  }
  
  if (lowerStyle.includes('rustic') || lowerStyle.includes('scandinavian')) {
    return <AFrameRoof width={width} depth={depth} height={height} style={style} styleConfig={styleConfig} />;
  }
  
  // Default: Traditional gable roof
  return <GableRoof width={width} depth={depth} height={height} style={style} styleConfig={styleConfig} />;
}

export default StyleSpecificRoof;
