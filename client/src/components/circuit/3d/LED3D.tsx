/**
 * 3D LED Component
 * Realistic 5mm LED with glow effect
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Mesh } from 'three';

interface LED3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  isOn?: boolean;
  brightness?: number;
}

export function LED3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = 'red',
  isOn = false,
  brightness = 0.8,
}: LED3DProps) {
  const ledRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);

  // Animate LED pulsing when on
  useFrame((state) => {
    if (ledRef.current && isOn) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.15 + 0.85;
      (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * brightness;
    }

    if (glowRef.current && isOn) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.2 + 0.8;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * brightness * 0.4;
    }
  });

  // Get color value
  const ledColor = color === 'red' ? '#ff0000' : color === 'green' ? '#00ff00' : color === 'blue' ? '#0000ff' : color === 'yellow' ? '#ffff00' : color;

  return (
    <group position={position} rotation={rotation}>
      {/* LED Dome (semi-transparent) */}
      <mesh ref={ledRef} castShadow position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.125, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={ledColor}
          emissive={ledColor}
          emissiveIntensity={isOn ? brightness : 0.05}
          transparent
          opacity={0.6}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* LED Base (opaque plastic) */}
      <mesh castShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.125, 0.125, 0.15, 16]} />
        <meshStandardMaterial
          color={ledColor}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* LED Flange */}
      <mesh castShadow position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>

      {/* Positive Lead (longer) */}
      <mesh position={[0.05, -0.1, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.5, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Negative Lead (shorter) */}
      <mesh position={[-0.05, -0.05, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.4, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Glow effect when LED is on */}
      {isOn && brightness > 0.3 && (
        <>
          {/* Point light for illumination */}
          <pointLight
            position={[0, 0.3, 0]}
            color={ledColor}
            intensity={brightness * 3}
            distance={1}
            decay={2}
          />

          {/* Glow sphere */}
          <mesh ref={glowRef} position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial
              color={ledColor}
              transparent
              opacity={brightness * 0.4}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
