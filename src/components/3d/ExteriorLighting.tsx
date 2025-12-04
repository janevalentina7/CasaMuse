import { useRef, useMemo } from 'react';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface ExteriorLightingProps {
  houseWidth: number;
  houseDepth: number;
  timeOfDay: number;
}

// Check if it's dark enough for lights
function useLightIntensity(timeOfDay: number) {
  return useMemo(() => {
    if (timeOfDay < 6 || timeOfDay > 20) return 1.0;
    if (timeOfDay < 7 || timeOfDay > 19) return 0.7;
    if (timeOfDay < 8 || timeOfDay > 18) return 0.3;
    return 0;
  }, [timeOfDay]);
}

// Porch Light component
function PorchLight({ position, intensity }: { position: [number, number, number]; intensity: number }) {
  const glowColor = intensity > 0 ? '#ffdd88' : '#888888';
  
  return (
    <group position={position}>
      {/* Wall mount bracket */}
      <Box args={[0.15, 0.1, 0.15]} position={[0, 0, -0.1]}>
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </Box>
      {/* Lamp housing */}
      <Box args={[0.2, 0.35, 0.2]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.4} />
      </Box>
      {/* Glass panels */}
      <Box args={[0.16, 0.25, 0.02]} position={[0, -0.1, 0.09]}>
        <meshStandardMaterial 
          color={glowColor} 
          transparent 
          opacity={0.6} 
          emissive={glowColor}
          emissiveIntensity={intensity * 0.5}
        />
      </Box>
      <Box args={[0.02, 0.25, 0.16]} position={[0.09, -0.1, 0]}>
        <meshStandardMaterial 
          color={glowColor} 
          transparent 
          opacity={0.6} 
          emissive={glowColor}
          emissiveIntensity={intensity * 0.5}
        />
      </Box>
      <Box args={[0.02, 0.25, 0.16]} position={[-0.09, -0.1, 0]}>
        <meshStandardMaterial 
          color={glowColor} 
          transparent 
          opacity={0.6} 
          emissive={glowColor}
          emissiveIntensity={intensity * 0.5}
        />
      </Box>
      {/* Top cap */}
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.15, 0.1, 4]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} />
      </mesh>
      {/* Light source */}
      {intensity > 0 && (
        <pointLight 
          position={[0, -0.1, 0.2]} 
          intensity={intensity * 2} 
          distance={8} 
          color="#ffdd88" 
          castShadow
        />
      )}
    </group>
  );
}

// Pathway Light component
function PathwayLight({ position, intensity }: { position: [number, number, number]; intensity: number }) {
  const glowColor = intensity > 0 ? '#ffeedd' : '#666666';
  
  return (
    <group position={position}>
      {/* Base */}
      <Cylinder args={[0.08, 0.1, 0.05, 8]} position={[0, 0.025, 0]}>
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
      </Cylinder>
      {/* Pole */}
      <Cylinder args={[0.025, 0.025, 0.5, 8]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </Cylinder>
      {/* Lamp head */}
      <mesh position={[0, 0.6, 0]}>
        <coneGeometry args={[0.12, 0.15, 8]} />
        <meshStandardMaterial 
          color={glowColor} 
          transparent 
          opacity={0.8} 
          emissive={glowColor}
          emissiveIntensity={intensity * 0.6}
        />
      </mesh>
      {/* Light source */}
      {intensity > 0 && (
        <pointLight 
          position={[0, 0.55, 0]} 
          intensity={intensity * 1.5} 
          distance={4} 
          color="#ffeedd" 
          castShadow
        />
      )}
    </group>
  );
}

// Garden Spotlight component
function GardenSpotlight({ position, targetPosition, intensity }: { 
  position: [number, number, number]; 
  targetPosition: [number, number, number];
  intensity: number;
}) {
  const direction = useMemo(() => {
    const dir = new THREE.Vector3(
      targetPosition[0] - position[0],
      targetPosition[1] - position[1],
      targetPosition[2] - position[2]
    ).normalize();
    return dir;
  }, [position, targetPosition]);

  const rotation = useMemo(() => {
    const angle = Math.atan2(direction.x, direction.z);
    const pitch = Math.asin(direction.y);
    return [pitch, angle, 0] as [number, number, number];
  }, [direction]);

  return (
    <group position={position}>
      {/* Ground stake */}
      <Cylinder args={[0.03, 0.02, 0.15, 6]} position={[0, -0.05, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} />
      </Cylinder>
      {/* Spotlight housing */}
      <group rotation={rotation}>
        <Cylinder args={[0.06, 0.04, 0.12, 8]} position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
        </Cylinder>
        {/* Lens */}
        <Cylinder args={[0.05, 0.05, 0.02, 8]} position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial 
            color={intensity > 0 ? "#ffeecc" : "#444444"}
            transparent 
            opacity={0.9}
            emissive={intensity > 0 ? "#ffeecc" : "#000000"}
            emissiveIntensity={intensity * 0.8}
          />
        </Cylinder>
      </group>
      {/* Spotlight beam */}
      {intensity > 0 && (
        <spotLight 
          position={[0, 0.15, 0]}
          target-position={targetPosition}
          intensity={intensity * 3}
          angle={0.4}
          penumbra={0.5}
          distance={15}
          color="#ffeecc"
          castShadow
        />
      )}
    </group>
  );
}

// Street Lamp component
function StreetLamp({ position, intensity }: { position: [number, number, number]; intensity: number }) {
  const glowColor = intensity > 0 ? '#ffcc77' : '#555555';
  
  return (
    <group position={position}>
      {/* Base */}
      <Cylinder args={[0.15, 0.2, 0.2, 8]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#222222" metalness={0.6} roughness={0.4} />
      </Cylinder>
      {/* Pole */}
      <Cylinder args={[0.06, 0.08, 3.5, 8]} position={[0, 1.85, 0]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
      </Cylinder>
      {/* Arm */}
      <Box args={[0.8, 0.06, 0.06]} position={[0.3, 3.6, 0]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
      </Box>
      {/* Lamp housing */}
      <group position={[0.7, 3.4, 0]}>
        <Box args={[0.4, 0.15, 0.25]}>
          <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.4} />
        </Box>
        {/* Glass panel */}
        <Box args={[0.35, 0.02, 0.2]} position={[0, -0.08, 0]}>
          <meshStandardMaterial 
            color={glowColor} 
            transparent 
            opacity={0.7}
            emissive={glowColor}
            emissiveIntensity={intensity * 0.5}
          />
        </Box>
        {/* Light source */}
        {intensity > 0 && (
          <pointLight 
            position={[0, -0.2, 0]} 
            intensity={intensity * 4} 
            distance={15} 
            color="#ffcc77" 
            castShadow
          />
        )}
      </group>
    </group>
  );
}

export default function ExteriorLighting({ houseWidth, houseDepth, timeOfDay }: ExteriorLightingProps) {
  const lightIntensity = useLightIntensity(timeOfDay);
  const gardenOffset = Math.max(houseWidth, houseDepth) / 2 + 5;

  return (
    <group>
      {/* Porch lights - on either side of the front door */}
      <PorchLight position={[-1.5, 2.5, houseDepth / 2 + 0.3]} intensity={lightIntensity} />
      <PorchLight position={[1.5, 2.5, houseDepth / 2 + 0.3]} intensity={lightIntensity} />
      
      {/* Additional porch lights on sides */}
      <PorchLight position={[-houseWidth / 2 - 0.2, 2.5, 0]} intensity={lightIntensity * 0.8} />
      <PorchLight position={[houseWidth / 2 + 0.2, 2.5, 0]} intensity={lightIntensity * 0.8} />

      {/* Pathway lights along the driveway */}
      <PathwayLight position={[-1.2, 0, houseDepth / 2 + 3]} intensity={lightIntensity} />
      <PathwayLight position={[1.2, 0, houseDepth / 2 + 3]} intensity={lightIntensity} />
      <PathwayLight position={[-1.2, 0, houseDepth / 2 + 6]} intensity={lightIntensity} />
      <PathwayLight position={[1.2, 0, houseDepth / 2 + 6]} intensity={lightIntensity} />
      <PathwayLight position={[-1.2, 0, houseDepth / 2 + 9]} intensity={lightIntensity} />
      <PathwayLight position={[1.2, 0, houseDepth / 2 + 9]} intensity={lightIntensity} />

      {/* Garden spotlights aimed at trees and features */}
      <GardenSpotlight 
        position={[-gardenOffset - 1, 0.1, -gardenOffset + 2]} 
        targetPosition={[-gardenOffset - 3, 3, -gardenOffset]} 
        intensity={lightIntensity} 
      />
      <GardenSpotlight 
        position={[gardenOffset + 1, 0.1, -gardenOffset + 2]} 
        targetPosition={[gardenOffset + 3, 3, -gardenOffset]} 
        intensity={lightIntensity} 
      />
      
      {/* Spotlights aimed at the house */}
      <GardenSpotlight 
        position={[-houseWidth / 2 - 3, 0.1, houseDepth / 2 + 2]} 
        targetPosition={[-houseWidth / 4, 2, houseDepth / 2]} 
        intensity={lightIntensity * 0.7} 
      />
      <GardenSpotlight 
        position={[houseWidth / 2 + 3, 0.1, houseDepth / 2 + 2]} 
        targetPosition={[houseWidth / 4, 2, houseDepth / 2]} 
        intensity={lightIntensity * 0.7} 
      />

      {/* Street lamps at the edge of property */}
      <StreetLamp position={[-gardenOffset - 2, 0, gardenOffset / 2 + 8]} intensity={lightIntensity} />
      <StreetLamp position={[gardenOffset + 2, 0, gardenOffset / 2 + 8]} intensity={lightIntensity} />
    </group>
  );
}
