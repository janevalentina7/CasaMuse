import { useRef, useEffect, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FirstPersonControlsProps {
  enabled: boolean;
  eyeHeight?: number;
  moveSpeed?: number;
  walls: THREE.Box3[];
  onRoomChange?: (roomName: string | null) => void;
  rooms: { name: string; bounds: THREE.Box3 }[];
}

const FirstPersonControls = ({
  enabled,
  eyeHeight = 1.6,
  moveSpeed = 3,
  walls,
  onRoomChange,
  rooms,
}: FirstPersonControlsProps) => {
  const { camera, gl } = useThree();
  const isLocked = useRef(false);
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const prevRoom = useRef<string | null>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isLocked.current || !enabled) return;
    euler.current.setFromQuaternion(camera.quaternion);
    euler.current.y -= e.movementX * 0.002;
    euler.current.x -= e.movementY * 0.002;
    euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));
    camera.quaternion.setFromEuler(euler.current);
  }, [camera, enabled]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    switch (e.code) {
      case "KeyW": case "ArrowUp": moveState.current.forward = true; break;
      case "KeyS": case "ArrowDown": moveState.current.backward = true; break;
      case "KeyA": case "ArrowLeft": moveState.current.left = true; break;
      case "KeyD": case "ArrowRight": moveState.current.right = true; break;
    }
  }, [enabled]);

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyW": case "ArrowUp": moveState.current.forward = false; break;
      case "KeyS": case "ArrowDown": moveState.current.backward = false; break;
      case "KeyA": case "ArrowLeft": moveState.current.left = false; break;
      case "KeyD": case "ArrowRight": moveState.current.right = false; break;
    }
  }, []);

  const onClick = useCallback(() => {
    if (!enabled) return;
    gl.domElement.requestPointerLock();
  }, [gl, enabled]);

  const onPointerLockChange = useCallback(() => {
    isLocked.current = document.pointerLockElement === gl.domElement;
  }, [gl]);

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    gl.domElement.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onPointerLockChange);

    // Set initial camera position
    camera.position.set(0, eyeHeight, 0);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      gl.domElement.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
    };
  }, [enabled, camera, gl, eyeHeight, onMouseMove, onKeyDown, onKeyUp, onClick, onPointerLockChange]);

  useFrame((_, delta) => {
    if (!enabled) return;

    const ms = moveState.current;
    direction.current.set(0, 0, 0);
    if (ms.forward) direction.current.z -= 1;
    if (ms.backward) direction.current.z += 1;
    if (ms.left) direction.current.x -= 1;
    if (ms.right) direction.current.x += 1;
    direction.current.normalize();

    // Apply camera orientation to direction (horizontal only)
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const move = new THREE.Vector3();
    move.addScaledVector(forward, -direction.current.z * moveSpeed * delta);
    move.addScaledVector(right, direction.current.x * moveSpeed * delta);

    // Collision detection - check next position against walls
    const nextPos = camera.position.clone().add(move);
    nextPos.y = eyeHeight;

    const playerBounds = new THREE.Box3(
      new THREE.Vector3(nextPos.x - 0.25, nextPos.y - eyeHeight, nextPos.z - 0.25),
      new THREE.Vector3(nextPos.x + 0.25, nextPos.y + 0.2, nextPos.z + 0.25),
    );

    let blocked = false;
    for (const wall of walls) {
      if (playerBounds.intersectsBox(wall)) {
        blocked = true;
        break;
      }
    }

    if (!blocked) {
      camera.position.copy(nextPos);
    }

    // Detect current room
    if (onRoomChange) {
      const playerPoint = new THREE.Vector3(camera.position.x, 0.5, camera.position.z);
      let currentRoom: string | null = null;
      for (const room of rooms) {
        if (room.bounds.containsPoint(playerPoint)) {
          currentRoom = room.name;
          break;
        }
      }
      if (currentRoom !== prevRoom.current) {
        prevRoom.current = currentRoom;
        onRoomChange(currentRoom);
      }
    }
  });

  return null;
};

export default FirstPersonControls;
