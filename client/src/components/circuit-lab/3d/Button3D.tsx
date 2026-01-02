import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Button3DProps {
  position: [number, number, number];
  isPressed?: boolean;
  onPress?: () => void;
  onRelease?: () => void;
  onClick?: () => void;
  isSelected?: boolean;
}

export function Button3D({
  position,
  isPressed = false,
  onPress,
  onRelease,
  onClick,
  isSelected
}: Button3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const buttonRef = useRef<THREE.Mesh>(null);
  const [localPressed, setLocalPressed] = useState(false);

  // Tactile button dimensions (6mm x 6mm)
  const bodyWidth = 0.06;  // 6mm
  const bodyHeight = 0.035; // 3.5mm
  const buttonRadius = 0.018; // 1.8mm
  const buttonHeight = 0.025; // 2.5mm
  const legWidth = 0.01;
  const legHeight = 0.03;

  const pressed = isPressed || localPressed;
  const buttonYOffset = pressed ? 0.003 : 0.008;

  // Animate button press
  useFrame(() => {
    if (buttonRef.current) {
      const targetY = bodyHeight / 2 + buttonYOffset;
      buttonRef.current.position.y = THREE.MathUtils.lerp(
        buttonRef.current.position.y,
        targetY,
        0.3
      );
    }
  });

  const handlePointerDown = (e: THREE.Event) => {
    e.stopPropagation();
    setLocalPressed(true);
    onPress?.();
  };

  const handlePointerUp = (e: THREE.Event) => {
    e.stopPropagation();
    setLocalPressed(false);
    onRelease?.();
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        if (localPressed) {
          setLocalPressed(false);
          onRelease?.();
        }
      }}
    >
      {/* Button body (black plastic) */}
      <mesh position={[0, bodyHeight / 2, 0]}>
        <boxGeometry args={[bodyWidth, bodyHeight, bodyWidth]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Button cap (circular clickable part) */}
      <mesh
        ref={buttonRef}
        position={[0, bodyHeight / 2 + buttonYOffset, 0]}
      >
        <cylinderGeometry args={[buttonRadius, buttonRadius, buttonHeight, 32]} />
        <meshStandardMaterial
          color="#333333"
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* Button cap top highlight */}
      <mesh position={[0, bodyHeight / 2 + buttonYOffset + buttonHeight / 2, 0]}>
        <cylinderGeometry args={[buttonRadius - 0.002, buttonRadius - 0.002, 0.002, 32]} />
        <meshStandardMaterial
          color="#444444"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* 4 metal legs */}
      {/* Top-left */}
      <mesh position={[-bodyWidth / 2 + 0.008, -legHeight / 2, -bodyWidth / 2 + 0.008]}>
        <boxGeometry args={[legWidth, legHeight, 0.003]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Top-right */}
      <mesh position={[bodyWidth / 2 - 0.008, -legHeight / 2, -bodyWidth / 2 + 0.008]}>
        <boxGeometry args={[legWidth, legHeight, 0.003]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Bottom-left */}
      <mesh position={[-bodyWidth / 2 + 0.008, -legHeight / 2, bodyWidth / 2 - 0.008]}>
        <boxGeometry args={[legWidth, legHeight, 0.003]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Bottom-right */}
      <mesh position={[bodyWidth / 2 - 0.008, -legHeight / 2, bodyWidth / 2 - 0.008]}>
        <boxGeometry args={[legWidth, legHeight, 0.003]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, bodyHeight / 2, 0]}>
          <boxGeometry args={[bodyWidth + 0.01, bodyHeight + 0.01, bodyWidth + 0.01]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
