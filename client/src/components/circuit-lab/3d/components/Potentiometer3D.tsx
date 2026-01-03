/**
 * 3D Potentiometer Component
 * Rotary potentiometer with adjustable knob
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Potentiometer3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  value?: number; // 0-1023 (analog value)
  maxResistance?: number; // Ohms
  isSelected?: boolean;
  onClick?: () => void;
  onValueChange?: (value: number) => void;
}

export function Potentiometer3D({
  position,
  rotation = [0, 0, 0],
  value = 512,
  maxResistance = 10000,
  isSelected = false,
  onClick,
}: Potentiometer3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const knobRef = useRef<THREE.Group>(null);

  // Calculate knob rotation based on value
  const knobRotation = (value / 1023) * Math.PI * 1.5 - Math.PI * 0.75;

  // Dimensions
  const bodyRadius = 0.008;
  const bodyHeight = 0.005;
  const knobRadius = 0.003;
  const knobHeight = 0.006;

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
      {/* Body (blue plastic housing) */}
      <mesh castShadow>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 32]} />
        <meshStandardMaterial color="#1e90ff" roughness={0.8} />
      </mesh>

      {/* Metal top plate */}
      <mesh position={[0, bodyHeight / 2 + 0.0005, 0]} castShadow>
        <cylinderGeometry args={[bodyRadius - 0.001, bodyRadius - 0.001, 0.001, 32]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Knob assembly */}
      <group ref={knobRef} position={[0, bodyHeight / 2 + 0.001, 0]} rotation={[0, knobRotation, 0]}>
        {/* Knob shaft */}
        <mesh>
          <cylinderGeometry args={[knobRadius, knobRadius, knobHeight, 32]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>

        {/* Knob grip ridges */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * knobRadius,
                knobHeight / 4,
                Math.sin(angle) * knobRadius,
              ]}
            >
              <boxGeometry args={[0.0008, knobHeight / 2, 0.0004]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
          );
        })}

        {/* Position indicator line */}
        <mesh position={[0, knobHeight / 2 + 0.0005, knobRadius - 0.001]}>
          <boxGeometry args={[0.0005, 0.001, 0.002]} />
          <meshStandardMaterial color="#f5f5f0" />
        </mesh>
      </group>

      {/* Mounting tabs with holes */}
      {[-1, 1].map((side, i) => (
        <group key={i} position={[side * (bodyRadius + 0.002), -bodyHeight / 4, 0]}>
          <mesh>
            <boxGeometry args={[0.004, bodyHeight / 2, 0.006]} />
            <meshStandardMaterial color="#1e90ff" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.0008, 0.0008, bodyHeight / 2 + 0.001, 8]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      ))}

      {/* Three pins (terminals) */}
      {[-0.00254, 0, 0.00254].map((z, i) => (
        <mesh key={i} position={[0, -bodyHeight / 2 - 0.003, z]}>
          <boxGeometry args={[0.0006, 0.006, 0.0006]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Value display */}
      <Html
        position={[0, bodyHeight / 2 + knobHeight + 0.003, 0]}
        center
        style={{
          fontSize: '3px',
          color: '#22c55e',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
          background: 'rgba(0,0,0,0.5)',
          padding: '1px 3px',
          borderRadius: '2px',
        }}
      >
        {value}
      </Html>

      {/* Resistance label */}
      <Html
        position={[0, -bodyHeight / 2 - 0.008, 0]}
        center
        style={{
          fontSize: '2px',
          color: '#888',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {maxResistance >= 1000 ? `${maxResistance / 1000}kΩ` : `${maxResistance}Ω`}
      </Html>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -bodyHeight / 2 - 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[bodyRadius + 0.002, bodyRadius + 0.003, 32]} />
          <meshBasicMaterial color="#3b82f6" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
