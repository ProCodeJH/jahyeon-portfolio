/**
 * 3D SG90 Servo Motor
 * Professional micro servo with accurate dimensions
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

interface ServoMotor3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  angle?: number; // 0-180 degrees
}

export function ServoMotor3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  angle = 90,
}: ServoMotor3DProps) {
  const hornRef = useRef<Group>(null);

  // Animate servo horn rotation
  useFrame(() => {
    if (hornRef.current) {
      const targetRotation = ((angle - 90) * Math.PI) / 180;
      hornRef.current.rotation.y = targetRotation;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Servo Body (Blue plastic) */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[0.5, 0.5, 1.2]} />
        <meshStandardMaterial color="#1e40af" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Mounting Tabs (left and right) */}
      <mesh castShadow position={[-0.35, 0.25, 0]}>
        <boxGeometry args={[0.2, 0.02, 1.4]} />
        <meshStandardMaterial color="#1e40af" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.35, 0.25, 0]}>
        <boxGeometry args={[0.2, 0.02, 1.4]} />
        <meshStandardMaterial color="#1e40af" roughness={0.5} />
      </mesh>

      {/* Mounting holes (4) */}
      {[
        [-0.35, -0.6],
        [-0.35, 0.6],
        [0.35, -0.6],
        [0.35, 0.6],
      ].map(([x, z], i) => (
        <mesh key={`hole-${i}`} position={[x, 0.25, z]}>
          <cylinderGeometry args={[0.04, 0.04, 0.05, 12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}

      {/* Servo Horn (white plastic arm) */}
      <group ref={hornRef} position={[0, 0.52, 0.3]}>
        {/* Central hub */}
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
        </mesh>

        {/* Horn arms (4-point star) */}
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const isLong = i % 2 === 0;
          const length = isLong ? 0.35 : 0.2;
          const x = Math.cos(rad) * (length / 2);
          const z = Math.sin(rad) * (length / 2);

          return (
            <mesh
              key={`arm-${i}`}
              castShadow
              position={[x, 0.03, z]}
              rotation={[0, rad, 0]}
            >
              <boxGeometry args={[0.06, 0.02, length]} />
              <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
            </mesh>
          );
        })}

        {/* Center screw hole */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 12]} />
          <meshStandardMaterial color="#8b8b8b" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Output Shaft (under horn) */}
      <mesh position={[0, 0.48, 0.3]}>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Gear housing */}
      <mesh castShadow position={[0, 0.35, 0.3]}>
        <cylinderGeometry args={[0.15, 0.15, 0.3, 20]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.6} />
      </mesh>

      {/* Motor housing (back) */}
      <mesh castShadow position={[0, 0.25, -0.5]}>
        <cylinderGeometry args={[0.18, 0.18, 0.4, 20]} />
        <meshStandardMaterial color="#8b8b8b" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Wire leads */}
      <group position={[0, 0.05, -0.7]}>
        {/* Signal wire (Orange) */}
        <mesh position={[-0.06, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshStandardMaterial color="#ff8800" roughness={0.5} />
        </mesh>

        {/* VCC wire (Red) */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.5} />
        </mesh>

        {/* GND wire (Brown) */}
        <mesh position={[0.06, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshStandardMaterial color="#8b4513" roughness={0.5} />
        </mesh>
      </group>

      {/* Label sticker */}
      <mesh position={[0, 0.26, 0.2]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.45, 0.15]} />
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </mesh>

      {/* "SG90" text area */}
      <mesh position={[0, 0.26, 0.1]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.25, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" opacity={0.8} transparent />
      </mesh>
    </group>
  );
}
