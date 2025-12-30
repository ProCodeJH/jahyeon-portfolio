/**
 * 3D PIR Sensor Component
 * Realistic PIR motion sensor with dome
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Mesh } from 'three';

interface PIRSensor3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  motionDetected?: boolean;
}

export function PIRSensor3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  motionDetected = false,
}: PIRSensor3DProps) {
  const domeRef = useRef<Mesh>(null);
  const indicatorRef = useRef<Mesh>(null);

  // Animate detection indicator
  useFrame((state) => {
    if (domeRef.current && motionDetected) {
      const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.3 + 0.7;
      (domeRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 0.5;
    }

    if (indicatorRef.current && motionDetected) {
      const blink = Math.sin(state.clock.elapsedTime * 8) > 0 ? 1 : 0.2;
      (indicatorRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = blink;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* PCB Base */}
      <mesh castShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[0.6, 0.16, 0.8]} />
        <meshStandardMaterial color="#28a745" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Sensor Dome */}
      <mesh ref={domeRef} castShadow position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={motionDetected ? '#ffd700' : '#e0e0e0'}
          emissive={motionDetected ? '#ff6b00' : '#000000'}
          emissiveIntensity={motionDetected ? 0.5 : 0}
          transparent
          opacity={0.8}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Fresnel Lens Pattern (simplified) */}
      <mesh position={[0, 0.25, 0.21]}>
        <circleGeometry args={[0.18, 16]} />
        <meshStandardMaterial color="#ffffff" opacity={0.3} transparent roughness={0.1} />
      </mesh>

      {/* LED Indicator */}
      <mesh
        ref={indicatorRef}
        castShadow
        position={[0.22, 0.2, 0.3]}
      >
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={motionDetected ? 1 : 0.1}
          roughness={0.3}
        />
      </mesh>

      {/* Pins */}
      <group position={[0, -0.15, 0]}>
        {/* VCC */}
        <mesh position={[-0.15, 0, 0.3]}>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* OUT */}
        <mesh position={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* GND */}
        <mesh position={[0.15, 0, 0.3]}>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Label */}
      <mesh position={[0, 0.17, -0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 0.1]} />
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </mesh>

      {/* Motion detection glow */}
      {motionDetected && (
        <pointLight
          position={[0, 0.3, 0]}
          color="#ff6b00"
          intensity={2}
          distance={1}
        />
      )}
    </group>
  );
}
