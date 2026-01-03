/**
 * 3D Capacitor Component
 * Ceramic disc and electrolytic capacitor variants
 */

import { useRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Capacitor3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  value?: number; // in microfarads
  voltage?: number; // voltage rating
  type?: 'ceramic' | 'electrolytic';
  isSelected?: boolean;
  onClick?: () => void;
}

export function Capacitor3D({
  position,
  rotation = [0, 0, 0],
  value = 100,
  voltage = 16,
  type = 'ceramic',
  isSelected = false,
  onClick,
}: Capacitor3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  if (type === 'ceramic') {
    // Ceramic disc capacitor
    const discRadius = 0.003;
    const discThickness = 0.002;
    const legLength = 0.008;

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
        {/* Ceramic disc body */}
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[discRadius, discRadius, discThickness, 32]} />
          <meshStandardMaterial color="#d4956a" roughness={0.9} />
        </mesh>

        {/* Center marking */}
        <mesh position={[0, 0, discThickness / 2 + 0.0001]}>
          <cylinderGeometry args={[discRadius * 0.7, discRadius * 0.7, 0.0002, 32]} />
          <meshStandardMaterial color="#c4854a" />
        </mesh>

        {/* Wire leads */}
        <mesh position={[-0.0015, -discRadius - legLength / 2, 0]}>
          <cylinderGeometry args={[0.0002, 0.0002, legLength, 8]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.0015, -discRadius - legLength / 2, 0]}>
          <cylinderGeometry args={[0.0002, 0.0002, legLength, 8]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Value label */}
        <Html
          position={[0, discRadius + 0.003, 0]}
          center
          style={{
            fontSize: '2px',
            color: '#888',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {value < 1 ? `${value * 1000}nF` : `${value}µF`}
        </Html>

        {/* Selection indicator */}
        {isSelected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[discRadius + 0.001, discRadius + 0.002, 32]} />
            <meshBasicMaterial color="#3b82f6" side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    );
  }

  // Electrolytic capacitor
  const bodyRadius = value > 100 ? 0.004 : 0.003;
  const bodyHeight = value > 100 ? 0.011 : 0.008;
  const legLength = 0.006;

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
      {/* Aluminum can body */}
      <mesh position={[0, bodyHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 32]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Plastic sleeve (with stripe) */}
      <mesh position={[0, bodyHeight / 2, 0]}>
        <cylinderGeometry args={[bodyRadius + 0.0002, bodyRadius + 0.0002, bodyHeight - 0.001, 32]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.8} />
      </mesh>

      {/* Negative stripe (white) */}
      <mesh position={[-bodyRadius - 0.0001, bodyHeight / 2, 0]}>
        <boxGeometry args={[0.0003, bodyHeight - 0.002, bodyRadius]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Top vent (K mark) */}
      <mesh position={[0, bodyHeight + 0.0003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[bodyRadius - 0.0005, bodyRadius - 0.0005, 0.0006, 32]} />
        <meshStandardMaterial color="#2a2a3e" />
      </mesh>

      {/* Vent grooves */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * (bodyRadius - 0.001) * 0.5,
            bodyHeight + 0.0004,
            Math.sin(angle) * (bodyRadius - 0.001) * 0.5,
          ]}
          rotation={[-Math.PI / 2, 0, angle]}
        >
          <boxGeometry args={[0.0004, bodyRadius * 0.8, 0.0002]} />
          <meshStandardMaterial color="#3a3a4e" />
        </mesh>
      ))}

      {/* Base */}
      <mesh position={[0, 0.0005, 0]}>
        <cylinderGeometry args={[bodyRadius + 0.0003, bodyRadius + 0.0003, 0.001, 32]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Positive leg (longer) */}
      <mesh position={[0.001, -legLength / 2, 0]}>
        <cylinderGeometry args={[0.0003, 0.0003, legLength, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Negative leg (shorter) */}
      <mesh position={[-0.001, -(legLength - 0.002) / 2, 0]}>
        <cylinderGeometry args={[0.0003, 0.0003, legLength - 0.002, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Value and voltage labels */}
      <Html
        position={[bodyRadius + 0.003, bodyHeight / 2, 0]}
        center
        style={{
          fontSize: '2px',
          color: '#f5f5f5',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
          transform: 'rotate(-90deg)',
        }}
      >
        {value}µF {voltage}V
      </Html>

      {/* Polarity indicator */}
      <Html
        position={[0, bodyHeight + 0.004, 0]}
        center
        style={{
          fontSize: '3px',
          color: '#ef4444',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        +
      </Html>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[bodyRadius + 0.002, bodyRadius + 0.003, 32]} />
          <meshBasicMaterial color="#3b82f6" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
