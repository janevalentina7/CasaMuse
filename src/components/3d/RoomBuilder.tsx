import { useMemo } from 'react';
import { Box, Plane, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useFloorTexture, useWallTexture, StyleMaterials } from './TexturedMaterials';
import { RealisticSofa, RealisticBed, RealisticDiningTable, RealisticChair, RealisticCabinet, RealisticDesk, CoffeeTable, TVUnit } from './RealisticFurniture';
import { FloorLamp, TableLamp, AreaRug, Curtains, IndoorPlant, FloorPlant, WallArt, CeilingFan, Bookshelf, VaseWithFlowers } from './InteriorDecorations';
import { PendantLight, WallSconce, WallClock, DetailedPictureFrame, ThrowBlanket, SideTableWithLamp, DecorativeBowl, IndoorTree } from './EnhancedInteriorDetails';
import { getStyleConfig } from './StyleConsistency';

interface Room {
  roomName: string;
  length: number;
  breadth: number;
}

// Window component with realistic glass
function Window({ position, rotation = [0, 0, 0], size = [1.2, 1.5, 0.2] }: { 
  position: [number, number, number]; 
  rotation?: [number, number, number]; 
  size?: [number, number, number] 
}) {
  return (
    <group position={position} rotation={rotation as any}>
      {/* Window frame - outer */}
      <Box args={[size[0], size[1], size[2]]}>
        <meshStandardMaterial color="#4a5568" metalness={0.3} roughness={0.7} />
      </Box>
      {/* Glass panes */}
      <Box args={[size[0] * 0.42, size[1] * 0.45, 0.02]} position={[-size[0] * 0.23, size[1] * 0.23, 0]}>
        <meshStandardMaterial color="#a0d2eb" transparent opacity={0.4} metalness={0.9} roughness={0.1} />
      </Box>
      <Box args={[size[0] * 0.42, size[1] * 0.45, 0.02]} position={[size[0] * 0.23, size[1] * 0.23, 0]}>
        <meshStandardMaterial color="#a0d2eb" transparent opacity={0.4} metalness={0.9} roughness={0.1} />
      </Box>
      <Box args={[size[0] * 0.42, size[1] * 0.45, 0.02]} position={[-size[0] * 0.23, -size[1] * 0.23, 0]}>
        <meshStandardMaterial color="#a0d2eb" transparent opacity={0.4} metalness={0.9} roughness={0.1} />
      </Box>
      <Box args={[size[0] * 0.42, size[1] * 0.45, 0.02]} position={[size[0] * 0.23, -size[1] * 0.23, 0]}>
        <meshStandardMaterial color="#a0d2eb" transparent opacity={0.4} metalness={0.9} roughness={0.1} />
      </Box>
      {/* Window dividers */}
      <Box args={[0.05, size[1] - 0.1, 0.08]} position={[0, 0, 0.05]}>
        <meshStandardMaterial color="#4a5568" />
      </Box>
      <Box args={[size[0] - 0.1, 0.05, 0.08]} position={[0, 0, 0.05]}>
        <meshStandardMaterial color="#4a5568" />
      </Box>
      {/* Window sill */}
      <Box args={[size[0] + 0.1, 0.05, 0.25]} position={[0, -size[1] / 2 - 0.025, 0.1]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Box>
    </group>
  );
}

// Door component with realistic details
function Door({ position, rotation = [0, 0, 0], isMain = false, styleConfig }: { 
  position: [number, number, number]; 
  rotation?: [number, number, number]; 
  isMain?: boolean;
  styleConfig: StyleMaterials;
}) {
  const height = isMain ? 2.4 : 2.1;
  const width = isMain ? 1.2 : 0.9;
  const doorColor = isMain ? '#5a3d2b' : '#7a5d4b';
  
  return (
    <group position={position} rotation={rotation as any}>
      {/* Door frame */}
      <Box args={[width + 0.15, height + 0.1, 0.2]} position={[0, height / 2, 0]}>
        <meshStandardMaterial color={styleConfig.trimColor} />
      </Box>
      {/* Door panel */}
      <Box args={[width, height, 0.08]} position={[0, height / 2, 0.05]}>
        <meshStandardMaterial color={doorColor} roughness={0.6} />
      </Box>
      {/* Door panels (decorative insets) */}
      <Box args={[width * 0.35, height * 0.25, 0.02]} position={[-width * 0.2, height * 0.7, 0.1]}>
        <meshStandardMaterial color={doorColor} roughness={0.5} />
      </Box>
      <Box args={[width * 0.35, height * 0.25, 0.02]} position={[width * 0.2, height * 0.7, 0.1]}>
        <meshStandardMaterial color={doorColor} roughness={0.5} />
      </Box>
      <Box args={[width * 0.35, height * 0.35, 0.02]} position={[-width * 0.2, height * 0.35, 0.1]}>
        <meshStandardMaterial color={doorColor} roughness={0.5} />
      </Box>
      <Box args={[width * 0.35, height * 0.35, 0.02]} position={[width * 0.2, height * 0.35, 0.1]}>
        <meshStandardMaterial color={doorColor} roughness={0.5} />
      </Box>
      {/* Door handle */}
      <Box args={[0.08, 0.15, 0.1]} position={[width / 2 - 0.15, height / 2, 0.15]}>
        <meshStandardMaterial color={styleConfig.accentColor} metalness={0.8} roughness={0.2} />
      </Box>
    </group>
  );
}

// Get furniture and decorations for room based on room type and style
function getRoomFurniture(roomName: string, width: number, depth: number, height: number, style?: string): JSX.Element[] {
  const items: JSX.Element[] = [];
  const lowerName = roomName.toLowerCase();
  const styleConfig = getStyleConfig(style || 'Modern');
  
  if (lowerName.includes('living') || lowerName.includes('drawing')) {
    items.push(
      <RealisticSofa key="sofa" position={[0, 0, -depth / 2 + 1.2]} rotation={0} color={styleConfig.furniture.upholstery} />,
      <CoffeeTable key="coffee" position={[0, 0, -depth / 2 + 2.5]} color={styleConfig.furniture.primaryWood} />,
      <TVUnit key="tv" position={[0, 0, depth / 2 - 0.5]} rotation={Math.PI} color={styleConfig.furniture.primaryWood} />,
      // Enhanced decorations
      <AreaRug key="rug" position={[0, 0, 0]} color={styleConfig.decor.rugColor} pattern="geometric" />,
      <FloorLamp key="lamp1" position={[-width / 2 + 0.5, 0, -depth / 2 + 0.8]} />,
      <IndoorTree key="tree" position={[width / 2 - 0.6, 0, -depth / 2 + 0.6]} scale={0.9} />,
      <DetailedPictureFrame key="art1" position={[0, height / 2 + 0.5, -depth / 2 + 0.15]} artType="landscape" size={[0.8, 0.6]} />,
      <Curtains key="curtain" position={[width / 2 - 0.2, 0, 0]} rotation={Math.PI / 2} color={styleConfig.decor.curtainColor} height={height - 0.3} />,
      <PendantLight key="pendant" position={[0, height - 0.1, 0]} style={styleConfig.lighting.fixtureStyle} />,
      <SideTableWithLamp key="sidetable" position={[-width / 2 + 0.5, 0, -depth / 2 + 2]} tableColor={styleConfig.furniture.secondaryWood} />,
      <ThrowBlanket key="throw" position={[0.3, 0.52, -depth / 2 + 1.2]} color={styleConfig.decor.cushionAccent} />,
      <DecorativeBowl key="bowl" position={[0, 0.42, -depth / 2 + 2.5]} contents="decorative" />
    );
  } else if (lowerName.includes('bedroom') || lowerName.includes('master')) {
    items.push(
      <RealisticBed key="bed" position={[0, 0, 0]} rotation={0} color={styleConfig.furniture.upholstery} />,
      <RealisticCabinet key="cabinet" position={[-width / 2 + 0.8, 0, -depth / 2 + 0.5]} rotation={0} color={styleConfig.furniture.primaryWood} />,
      // Enhanced decorations
      <AreaRug key="rug" position={[0, 0, 0.8]} color={styleConfig.decor.rugColor} scale={0.8} />,
      <SideTableWithLamp key="nightstand1" position={[-width / 2 + 0.9, 0, -0.3]} tableColor={styleConfig.furniture.secondaryWood} />,
      <SideTableWithLamp key="nightstand2" position={[width / 2 - 0.5, 0, -0.3]} tableColor={styleConfig.furniture.secondaryWood} />,
      <IndoorPlant key="plant" position={[width / 2 - 0.5, 0, depth / 2 - 0.5]} type="fern" />,
      <DetailedPictureFrame key="art" position={[0, height / 2 + 0.3, -depth / 2 + 0.15]} artType="abstract" size={[0.7, 0.5]} />,
      <Curtains key="curtain" position={[width / 2 - 0.2, 0, 0]} rotation={Math.PI / 2} color={styleConfig.decor.curtainColor} height={height - 0.3} />,
      <PendantLight key="pendant" position={[0, height - 0.1, 0]} style={styleConfig.lighting.fixtureStyle} />,
      <WallSconce key="sconce1" position={[-width / 2 + 0.15, height / 2, -0.3]} rotation={-Math.PI / 2} />,
      <WallSconce key="sconce2" position={[width / 2 - 0.15, height / 2, -0.3]} rotation={Math.PI / 2} />
    );
  } else if (lowerName.includes('dining')) {
    items.push(
      <RealisticDiningTable key="table" position={[0, 0, 0]} color={styleConfig.furniture.primaryWood} />,
      <RealisticChair key="chair1" position={[0, 0, 0.8]} rotation={Math.PI} color={styleConfig.furniture.primaryWood} />,
      <RealisticChair key="chair2" position={[0, 0, -0.8]} rotation={0} color={styleConfig.furniture.primaryWood} />,
      <RealisticChair key="chair3" position={[-0.9, 0, 0]} rotation={Math.PI / 2} color={styleConfig.furniture.primaryWood} />,
      <RealisticChair key="chair4" position={[0.9, 0, 0]} rotation={-Math.PI / 2} color={styleConfig.furniture.primaryWood} />,
      // Enhanced decorations
      <VaseWithFlowers key="vase" position={[0, 0.78, 0]} />,
      <DetailedPictureFrame key="art" position={[-width / 2 + 0.15, height / 2 + 0.3, 0]} rotation={Math.PI / 2} artType="portrait" />,
      <IndoorTree key="plant" position={[width / 2 - 0.5, 0, -depth / 2 + 0.5]} scale={0.85} />,
      <PendantLight key="pendant" position={[0, height - 0.1, 0]} style={styleConfig.lighting.fixtureStyle} />,
      <DecorativeBowl key="bowl" position={[0.4, 0.78, 0]} contents="fruit" />
    );
  } else if (lowerName.includes('kitchen')) {
    items.push(
      // Kitchen counter with enhanced materials
      <Box key="counter" args={[width - 1, 0.9, 0.6]} position={[0, 0.45, -depth / 2 + 0.4]}>
        <meshStandardMaterial color="#e8e8e8" roughness={0.2} metalness={0.1} />
      </Box>,
      // Upper cabinets
      <Box key="upper" args={[width - 1.5, 0.6, 0.35]} position={[0, height - 0.6, -depth / 2 + 0.25]}>
        <meshStandardMaterial color={styleConfig.furniture.primaryWood} roughness={0.5} />
      </Box>,
      // Stove hood
      <Box key="hood" args={[0.8, 0.3, 0.5]} position={[0, height - 0.4, -depth / 2 + 0.35]}>
        <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
      </Box>,
      <IndoorPlant key="plant" position={[width / 2 - 0.4, 0.92, -depth / 2 + 0.4]} type="succulent" scale={0.7} />,
      <WallClock key="clock" position={[width / 2 - 0.15, height / 2 + 0.5, 0]} rotation={-Math.PI / 2} />
    );
  } else if (lowerName.includes('study') || lowerName.includes('office')) {
    items.push(
      <RealisticDesk key="desk" position={[0, 0, -depth / 2 + 1]} rotation={0} color={styleConfig.furniture.primaryWood} />,
      <RealisticChair key="chair" position={[0, 0, -depth / 2 + 1.8]} rotation={Math.PI} color={styleConfig.furniture.secondaryWood} />,
      // Enhanced decorations
      <Bookshelf key="shelf" position={[-width / 2 + 0.6, 0, 0]} rotation={Math.PI / 2} />,
      <TableLamp key="lamp" position={[0.5, 0.77, -depth / 2 + 1]} />,
      <IndoorPlant key="plant" position={[width / 2 - 0.4, 0, depth / 2 - 0.4]} type="fern" />,
      <AreaRug key="rug" position={[0, 0, 0]} color={styleConfig.decor.rugColor} scale={0.7} />,
      <PendantLight key="pendant" position={[0, height - 0.1, 0]} style={styleConfig.lighting.fixtureStyle} />,
      <WallClock key="clock" position={[width / 2 - 0.15, height / 2 + 0.5, -depth / 2 + 1]} rotation={-Math.PI / 2} />,
      <DetailedPictureFrame key="art" position={[-width / 2 + 0.15, height / 2 + 0.3, 0]} rotation={Math.PI / 2} artType="abstract" size={[0.5, 0.4]} />
    );
  } else if (lowerName.includes('pooja') || lowerName.includes('prayer')) {
    items.push(
      <RealisticCabinet key="altar" position={[0, 0, -depth / 2 + 0.5]} scale={0.8} color={styleConfig.furniture.primaryWood} />,
      <FloorLamp key="lamp" position={[-width / 2 + 0.4, 0, -depth / 2 + 0.4]} scale={0.7} />,
      <IndoorPlant key="plant" position={[width / 2 - 0.3, 0, -depth / 2 + 0.3]} type="succulent" scale={0.6} />,
      <VaseWithFlowers key="vase" position={[0, 1.85, -depth / 2 + 0.5]} />
    );
  } else if (lowerName.includes('bathroom')) {
    // Enhanced bathroom fixtures
    items.push(
      <Box key="sink" args={[0.6, 0.1, 0.45]} position={[0, 0.85, -depth / 2 + 0.35]}>
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </Box>,
      <Box key="vanity" args={[0.8, 0.85, 0.5]} position={[0, 0.425, -depth / 2 + 0.35]}>
        <meshStandardMaterial color={styleConfig.furniture.primaryWood} roughness={0.6} />
      </Box>,
      // Mirror
      <Box key="mirror" args={[0.6, 0.8, 0.02]} position={[0, height / 2 + 0.3, -depth / 2 + 0.15]}>
        <meshStandardMaterial color="#e8e8e8" metalness={0.95} roughness={0.05} />
      </Box>,
      <WallSconce key="sconce1" position={[-0.45, height / 2 + 0.3, -depth / 2 + 0.2]} rotation={0} />,
      <WallSconce key="sconce2" position={[0.45, height / 2 + 0.3, -depth / 2 + 0.2]} rotation={0} />,
      <IndoorPlant key="plant" position={[width / 2 - 0.3, 0.9, -depth / 2 + 0.4]} type="succulent" scale={0.5} />
    );
  }
  
  return items;
}

interface RoomComponentProps {
  position: [number, number, number];
  size: [number, number, number];
  name: string;
  styleConfig: StyleMaterials;
  showMeasurements: boolean;
  roomIndex: number;
  isFirst: boolean;
  isLast: boolean;
}

export function RoomComponent({ 
  position, 
  size, 
  name, 
  styleConfig,
  showMeasurements,
  roomIndex,
  isFirst,
  isLast
}: RoomComponentProps) {
  const wallThickness = 0.25;
  const [width, height, depth] = size;
  
  const floorTexture = useFloorTexture(styleConfig.floorType, styleConfig.floorColor);
  const wallTexture = useWallTexture(styleConfig.wallTexture, styleConfig.wallColor);
  
  // Room-specific floor type override
  const roomFloorType = useMemo(() => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('bathroom') || lowerName.includes('kitchen')) {
      return 'tile';
    }
    return styleConfig.floorType;
  }, [name, styleConfig.floorType]);
  
  const actualFloorTexture = useFloorTexture(roomFloorType, styleConfig.floorColor);
  
  const furniture = useMemo(() => getRoomFurniture(name, width, depth, height), [name, width, depth, height]);

  return (
    <group position={position}>
      {/* Floor with texture */}
      <Plane args={[width, depth]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial map={actualFloorTexture} side={THREE.DoubleSide} roughness={0.8} />
      </Plane>

      {/* Ceiling */}
      <Plane args={[width, depth]} rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <meshStandardMaterial color={styleConfig.ceilingColor} side={THREE.DoubleSide} />
      </Plane>

      {/* Back wall with texture */}
      <Box args={[width, height, wallThickness]} position={[0, height / 2, -depth / 2]}>
        <meshStandardMaterial map={wallTexture} side={THREE.DoubleSide} />
      </Box>
      {/* Back wall baseboard */}
      <Box args={[width, 0.1, 0.02]} position={[0, 0.05, -depth / 2 + wallThickness / 2 + 0.01]}>
        <meshStandardMaterial color={styleConfig.trimColor} />
      </Box>

      {/* Front wall (semi-transparent for viewing) */}
      {roomIndex % 3 !== 0 && (
        <Box args={[width, height, wallThickness]} position={[0, height / 2, depth / 2]}>
          <meshStandardMaterial map={wallTexture} transparent opacity={0.2} side={THREE.DoubleSide} />
        </Box>
      )}

      {/* Left wall */}
      {isFirst && (
        <group>
          <Box args={[wallThickness, height, depth]} position={[-width / 2, height / 2, 0]}>
            <meshStandardMaterial map={wallTexture} side={THREE.DoubleSide} />
          </Box>
          {/* Window on left wall */}
          <Window position={[-width / 2 + 0.15, height / 2 + 0.2, 0]} rotation={[0, Math.PI / 2, 0]} />
          {/* Baseboard */}
          <Box args={[0.02, 0.1, depth]} position={[-width / 2 + wallThickness / 2 + 0.01, 0.05, 0]}>
            <meshStandardMaterial color={styleConfig.trimColor} />
          </Box>
        </group>
      )}

      {/* Right wall */}
      {isLast && (
        <group>
          <Box args={[wallThickness, height, depth]} position={[width / 2, height / 2, 0]}>
            <meshStandardMaterial map={wallTexture} side={THREE.DoubleSide} />
          </Box>
          {/* Window on right wall */}
          <Window position={[width / 2 - 0.15, height / 2 + 0.2, 0]} rotation={[0, -Math.PI / 2, 0]} />
          {/* Baseboard */}
          <Box args={[0.02, 0.1, depth]} position={[width / 2 - wallThickness / 2 - 0.01, 0.05, 0]}>
            <meshStandardMaterial color={styleConfig.trimColor} />
          </Box>
        </group>
      )}

      {/* Interior door between rooms */}
      {!isLast && (
        <Door position={[width / 2, 0, depth / 4]} rotation={[0, Math.PI / 2, 0]} styleConfig={styleConfig} />
      )}

      {/* Room label */}
      <Text
        position={[0, height - 0.3, -depth / 2 + 0.5]}
        fontSize={0.35}
        color="#444444"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        {name}
      </Text>

      {/* Room lighting - ceiling light fixture */}
      <group position={[0, height - 0.05, 0]}>
        <Box args={[0.4, 0.05, 0.4]}>
          <meshStandardMaterial color="#f0f0f0" />
        </Box>
        <pointLight intensity={1.5} distance={width * 2} color="#fff5e6" castShadow />
      </group>

      {/* Furniture */}
      {furniture}

      {/* Measurements */}
      {showMeasurements && (
        <>
          {/* Width measurement */}
          <group position={[0, 0.1, depth / 2 + 0.8]}>
            <Box args={[width, 0.02, 0.02]}>
              <meshBasicMaterial color="#ff4444" />
            </Box>
            <Text position={[0, 0.2, 0]} fontSize={0.3} color="#ff4444">
              {width.toFixed(0)} ft
            </Text>
          </group>
          {/* Depth measurement */}
          <group position={[width / 2 + 0.8, 0.1, 0]}>
            <Box args={[0.02, 0.02, depth]}>
              <meshBasicMaterial color="#ff4444" />
            </Box>
            <Text position={[0.3, 0.2, 0]} fontSize={0.3} color="#ff4444" rotation={[0, -Math.PI / 2, 0]}>
              {depth.toFixed(0)} ft
            </Text>
          </group>
        </>
      )}
    </group>
  );
}

export default RoomComponent;
