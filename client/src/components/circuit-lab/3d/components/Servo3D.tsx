/**
 * 3D Servo Motor Component (SG90)
 * Realistic micro servo motor with rotating arm
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Servo3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  angle?: number; // 0-180 degrees
  isSelected?: boolean;
  onClick?: () => void;
}

export function Servo3D({
  position,
  rotation = [0, 0, 0],
  angle = 90,
  isSelected = false,
  onClick,
}: Servo3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);
  const targetAngleRef = useRef(angle);

  // Animate arm rotation
  useFrame(() => {
    if (armRef.current) {
      targetAngleRef.current = angle;
      const currentAngle = armRef.current.rotation.y;
      const targetAngle = (angle - 90) * (Math.PI / 180);
      armRef.current.rotation.y = THREE.MathUtils.lerp(currentAngle, targetAngle, 0.1);
    }
  });

  // Dimensions (SG90 micro servo)
  const bodyWidth = 0.023;
  const bodyHeight = 0.0225;
  const bodyDepth = 0.012;

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
      {/* Main body (blue plastic) */}
      <mesh castShadow>
        <boxGeometry args={[bodyWidth, bodyHeight, bodyDepth]} />
        <meshStandardMaterial color="#1e90ff" roughness={0.8} />
      </mesh>

      {/* Mounting tabs */}
      <mesh position={[0, -bodyHeight / 2 + 0.001, 0]} castShadow>
        <boxGeometry args={[0.032, 0.002, bodyDepth]} />
        <meshStandardMaterial color="#1e90ff" roughness={0.8} />
      </mesh>

      {/* Mounting holes */}
      {[-0.013, 0.013].map((x, i) => (
        <mesh key={i} position={[x, -bodyHeight / 2 + 0.001, 0]}>
          <cylinderGeometry args={[0.001, 0.001, 0.003, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}

      {/* Gear housing (top cylinder) */}
      <mesh position={[bodyWidth / 2 - 0.005, bodyHeight / 2 + 0.002, 0]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.004, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>

      {/* Output shaft */}
      <mesh position={[bodyWidth / 2 - 0.005, bodyHeight / 2 + 0.005, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 0.003, 16]} />
        <meshStandardMaterial color="#f5f5f0" />
      </mesh>

      {/* Servo arm group (rotates) */}
      <group
        ref={armRef}
        position={[bodyWidth / 2 - 0.005, bodyHeight / 2 + 0.007, 0]}
      >
        {/* Arm base */}
        <mesh>
          <cylinderGeometry args={[0.003, 0.003, 0.002, 16]} />
          <meshStandardMaterial color="#f5f5f0" />
        </mesh>

        {/* Arm */}
        <mesh position={[0.012, 0.001, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.024, 0.002, 0.004]} />
          <meshStandardMaterial color="#f5f5f0" />
        </mesh>

        {/* Arm holes */}
        {[0.006, 0.012, 0.018].map((x, i) => (
          <mesh key={i} position={[x, 0.0015, 0]}>
            <cylinderGeometry args={[0.0008, 0.0008, 0.003, 8]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        ))}
      </group>

      {/* Wire connector */}
      <group position={[-bodyWidth / 2 + 0.003, bodyHeight / 4, 0]}>
        <mesh>
          <boxGeometry args={[0.008, 0.006, 0.003]} />
          <meshStandardMaterial color="#f5f5f0" />
        </mesh>
        {/* Wires */}
        {[
          { color: '#8b4513', z: -0.0008 }, // Brown (GND)
          { color: '#ef4444', z: 0 },       // Red (VCC)
          { color: '#f97316', z: 0.0008 },  // Orange (Signal)
        ].map((wire, i) => (
          <mesh key={i} position={[-0.006, 0, wire.z]}>
            <cylinderGeometry args={[0.0006, 0.0006, 0.008, 8]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color={wire.color} />
          </mesh>
        ))}
      </group>

      {/* Label */}
      <Html
        position={[0, 0, bodyDepth / 2 + 0.001]}
        center
        style={{
          fontSize: '2px',
          color: 'white',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        SG90
      </Html>

      {/* Angle indicator */}
      <Html
        position={[bodyWidth / 2 - 0.005, bodyHeight / 2 + 0.015, 0]}
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
        {Math.round(angle)}°
      </Html>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -bodyHeight / 2 - 0.002, 0]}>
          <boxGeometry args={[0.035, 0.001, bodyDepth + 0.004]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
