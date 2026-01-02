/**
 * 3D Arduino UNO Component
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { CircuitComponent } from '../store';

interface Arduino3DProps {
  component: CircuitComponent;
  selected?: boolean;
  onClick?: () => void;
}

// Colors
const PCB_COLOR = new THREE.Color(0x2d8a2d);
const SILK_COLOR = new THREE.Color(0xf5f5f0);
const CHIP_COLOR = new THREE.Color(0x1a1a1a);
const USB_COLOR = new THREE.Color(0x888888);
const GOLD_COLOR = new THREE.Color(0xd4af37);

// Dimensions (mm)
const WIDTH = 68.6;
const HEIGHT = 53.4;
const THICKNESS = 1.6;

export function Arduino3D({ component, selected = false, onClick }: Arduino3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Get LED brightness from component properties
  const ledBrightness = (component.properties.ledBrightness as number) || 0;

  return (
    <group
      ref={groupRef}
      position={[component.position.x, component.position.y, component.position.z]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* PCB Board */}
      <mesh>
        <boxGeometry args={[WIDTH, HEIGHT, THICKNESS]} />
        <meshStandardMaterial color={PCB_COLOR} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* USB-B Connector */}
      <group position={[0, -HEIGHT / 2 + 8, THICKNESS / 2 + 5.5]}>
        <mesh>
          <boxGeometry args={[12, 16, 11]} />
          <meshStandardMaterial color={USB_COLOR} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* ATmega328P Chip */}
      <group position={[0, 0, THICKNESS / 2 + 2]}>
        <mesh>
          <boxGeometry args={[7.5, 35, 4]} />
          <meshStandardMaterial color={CHIP_COLOR} roughness={0.3} />
        </mesh>
        {/* Chip notch */}
        <mesh position={[0, -17, 2]}>
          <cylinderGeometry args={[1, 1, 0.2, 16]} />
          <meshStandardMaterial color={0x333333} />
        </mesh>
      </group>

      {/* Crystal Oscillator */}
      <group position={[20, 0, THICKNESS / 2 + 1.5]}>
        <mesh>
          <boxGeometry args={[5, 12, 3]} />
          <meshStandardMaterial color={0x444444} metalness={0.5} roughness={0.3} />
        </mesh>
      </group>

      {/* Reset Button */}
      <group position={[20, 20, THICKNESS / 2 + 2]}>
        <mesh>
          <boxGeometry args={[6, 6, 2]} />
          <meshStandardMaterial color={0x333333} />
        </mesh>
        <mesh position={[0, 0, 1.5]}>
          <cylinderGeometry args={[1.5, 1.5, 1, 16]} />
          <meshStandardMaterial color={0x888888} />
        </mesh>
      </group>

      {/* Built-in LED (L) */}
      <group position={[25, 15, THICKNESS / 2 + 1]}>
        <mesh>
          <boxGeometry args={[2, 1, 0.8]} />
          <meshStandardMaterial
            color={0x00ff00}
            emissive={0x00ff00}
            emissiveIntensity={ledBrightness * 2}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Power LED (ON) */}
      <group position={[-25, 15, THICKNESS / 2 + 1]}>
        <mesh>
          <boxGeometry args={[2, 1, 0.8]} />
          <meshStandardMaterial
            color={0x00ff00}
            emissive={0x00ff00}
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Pin Headers - Left side (Power) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={`pwr-${i}`} position={[-WIDTH / 2 + 3, HEIGHT / 2 - 5 - i * 2.54, THICKNESS / 2]}>
          <mesh position={[0, 0, 4]}>
            <boxGeometry args={[2.54, 2.54, 8.5]} />
            <meshStandardMaterial color={0x1a1a1a} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, -1.5]}>
            <cylinderGeometry args={[0.3, 0.3, 11, 8]} />
            <meshStandardMaterial color={GOLD_COLOR} metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Pin Headers - Right side (Digital) */}
      {Array.from({ length: 14 }).map((_, i) => (
        <group key={`dig-${i}`} position={[WIDTH / 2 - 3, HEIGHT / 2 - 5 - i * 2.54, THICKNESS / 2]}>
          <mesh position={[0, 0, 4]}>
            <boxGeometry args={[2.54, 2.54, 8.5]} />
            <meshStandardMaterial color={0x1a1a1a} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, -1.5]}>
            <cylinderGeometry args={[0.3, 0.3, 11, 8]} />
            <meshStandardMaterial color={GOLD_COLOR} metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Labels */}
      <Text
        position={[0, 20, THICKNESS / 2 + 0.1]}
        fontSize={4}
        color={SILK_COLOR}
        anchorX="center"
        anchorY="middle"
      >
        ARDUINO
      </Text>
      <Text
        position={[0, 15, THICKNESS / 2 + 0.1]}
        fontSize={2.5}
        color={SILK_COLOR}
        anchorX="center"
        anchorY="middle"
      >
        UNO R3
      </Text>

      {/* Selection highlight */}
      {selected && (
        <mesh position={[0, 0, -0.5]}>
          <boxGeometry args={[WIDTH + 4, HEIGHT + 4, 0.5]} />
          <meshBasicMaterial color={0x00aaff} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
