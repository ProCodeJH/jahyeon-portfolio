/**
 * 3D Arduino UNO Component
 */

import { useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface Arduino3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  isSelected?: boolean;
  onClick?: () => void;
}

// Colors
const PCB_COLOR = '#2d8a2d';
const SILK_COLOR = '#f5f5f0';
const CHIP_COLOR = '#1a1a1a';
const USB_COLOR = '#888888';
const GOLD_COLOR = '#d4af37';

// Dimensions (scaled down from mm to scene units)
const SCALE = 0.001;
const WIDTH = 68.6 * SCALE;
const HEIGHT = 53.4 * SCALE;
const THICKNESS = 1.6 * SCALE;

export function Arduino3D({ position, rotation = [0, 0, 0], isSelected = false, onClick }: Arduino3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* PCB Board */}
      <mesh>
        <boxGeometry args={[WIDTH, THICKNESS, HEIGHT]} />
        <meshStandardMaterial color={PCB_COLOR} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* USB-B Connector */}
      <mesh position={[0, THICKNESS / 2 + 0.005, -HEIGHT / 2 + 0.01]}>
        <boxGeometry args={[0.012, 0.011, 0.016]} />
        <meshStandardMaterial color={USB_COLOR} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ATmega328P Chip */}
      <mesh position={[0, THICKNESS / 2 + 0.002, 0]}>
        <boxGeometry args={[0.0075, 0.004, 0.035]} />
        <meshStandardMaterial color={CHIP_COLOR} roughness={0.3} />
      </mesh>

      {/* Crystal Oscillator */}
      <mesh position={[0.02, THICKNESS / 2 + 0.0015, 0]}>
        <boxGeometry args={[0.005, 0.003, 0.012]} />
        <meshStandardMaterial color="#444444" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Reset Button */}
      <group position={[0.02, THICKNESS / 2 + 0.002, 0.02]}>
        <mesh>
          <boxGeometry args={[0.006, 0.002, 0.006]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 0.0015, 0]}>
          <cylinderGeometry args={[0.0015, 0.0015, 0.001, 16]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      </group>

      {/* Built-in LED (L) - Green */}
      <mesh position={[0.025, THICKNESS / 2 + 0.001, 0.015]}>
        <boxGeometry args={[0.002, 0.001, 0.001]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>

      {/* Power LED (ON) */}
      <mesh position={[-0.025, THICKNESS / 2 + 0.001, 0.015]}>
        <boxGeometry args={[0.002, 0.001, 0.001]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>

      {/* Pin Headers - simplified representation */}
      {/* Left side (Power pins) */}
      <mesh position={[-WIDTH / 2 + 0.003, THICKNESS / 2 + 0.004, 0]}>
        <boxGeometry args={[0.0025, 0.008, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Right side (Digital pins) */}
      <mesh position={[WIDTH / 2 - 0.003, THICKNESS / 2 + 0.004, 0]}>
        <boxGeometry args={[0.0025, 0.008, 0.035]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Labels */}
      <Text
        position={[0, THICKNESS / 2 + 0.001, 0.012]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.004}
        color={SILK_COLOR}
        anchorX="center"
        anchorY="middle"
      >
        ARDUINO UNO
      </Text>

      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, -0.001, 0]}>
          <boxGeometry args={[WIDTH + 0.008, 0.002, HEIGHT + 0.008]} />
          <meshBasicMaterial color="#00aaff" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}
