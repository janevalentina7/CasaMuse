import { useState, useMemo, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import ProceduralHouse, { calculateLayout, buildCollisionData } from "./ProceduralHouse";
import FirstPersonControls from "./FirstPersonControls";
import WalkthroughHUD from "./WalkthroughHUD";
import ModelErrorBoundary from "@/components/3d/ModelErrorBoundary";

interface Room {
  roomId: string;
  roomName: string;
  count: number;
}

interface FirstPersonSceneProps {
  rooms: Room[];
  landArea: number;
  style: string;
}

// Camera position tracker (runs inside Canvas)
const CameraTracker = ({ onUpdate }: { onUpdate: (x: number, z: number) => void }) => {
  const last = useRef({ x: 0, z: 0 });
  useFrame(({ camera }) => {
    if (Math.abs(camera.position.x - last.current.x) > 0.05 || Math.abs(camera.position.z - last.current.z) > 0.05) {
      last.current = { x: camera.position.x, z: camera.position.z };
      onUpdate(camera.position.x, camera.position.z);
    }
  });
  return null;
};

const FirstPersonScene = ({ rooms, landArea, style }: FirstPersonSceneProps) => {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [isDayMode, setIsDayMode] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 });

  const layouts = useMemo(() => calculateLayout(rooms, landArea), [rooms, landArea]);
  const { walls, roomBounds } = useMemo(() => buildCollisionData(layouts), [layouts]);

  const handleRoomChange = useCallback((name: string | null) => setCurrentRoom(name), []);
  const handleCameraUpdate = useCallback((x: number, z: number) => setPlayerPos({ x, z }), []);

  // Track pointer lock state
  const handlePointerLockChange = useCallback(() => {
    setIsLocked(!!document.pointerLockElement);
  }, []);

  // Listen for pointer lock changes
  useMemo(() => {
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    return () => document.removeEventListener("pointerlockchange", handlePointerLockChange);
  }, [handlePointerLockChange]);

  // Starting position: just outside the entrance (south side)
  const outerBounds = useMemo(() => {
    return layouts.reduce(
      (b, r) => ({
        minX: Math.min(b.minX, r.x),
        maxX: Math.max(b.maxX, r.x + r.width),
        minZ: Math.min(b.minZ, r.z),
        maxZ: Math.max(b.maxZ, r.z + r.depth),
      }),
      { minX: 0, maxX: 0, minZ: 0, maxZ: 0 }
    );
  }, [layouts]);

  return (
    <div className="relative w-full h-[700px] rounded-lg overflow-hidden border border-border">
      <ModelErrorBoundary>
        <Canvas
          camera={{
            position: [0, 1.6, outerBounds.maxZ + 2],
            fov: 75,
            near: 0.1,
            far: 100,
          }}
          shadows
          style={{ background: isDayMode ? "#87CEEB" : "#0a0a2e" }}
        >
          <ProceduralHouse
            rooms={rooms}
            landArea={landArea}
            style={style}
            isDayMode={isDayMode}
          />
          <FirstPersonControls
            enabled={true}
            walls={walls}
            rooms={roomBounds}
            onRoomChange={handleRoomChange}
            eyeHeight={1.6}
            moveSpeed={3.5}
          />
          <CameraTracker onUpdate={handleCameraUpdate} />
          <fog attach="fog" args={[isDayMode ? "#87CEEB" : "#0a0a2e", 20, 50]} />
        </Canvas>
      </ModelErrorBoundary>

      {/* HUD overlay */}
      <WalkthroughHUD
        currentRoom={currentRoom}
        isLocked={isLocked}
        isDayMode={isDayMode}
        onToggleDayMode={() => setIsDayMode(prev => !prev)}
        rooms={layouts}
        playerX={playerPos.x}
        playerZ={playerPos.z}
      />
    </div>
  );
};

export default FirstPersonScene;
