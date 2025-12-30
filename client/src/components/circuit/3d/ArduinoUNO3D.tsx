/**
 * 3D Arduino UNO Component
 * Realistic Arduino UNO R3 board
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Mesh } from 'three';

interface ArduinoUNO3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  led13On?: boolean;
  led13Brightness?: number;
}

export function ArduinoUNO3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  led13On = false,
  led13Brightness = 0.8,
}: ArduinoUNO3DProps) {
  // Arduino UNO dimensions (in cm)
  const boardWidth = 6.8; // 68mm
  const boardDepth = 5.3; // 53mm
  const boardHeight = 0.16; // 1.6mm PCB thickness

  const led13Ref = useRef<Mesh>(null);

  // Animate LED pulsing when on
  useFrame((state) => {
    if (led13Ref.current && led13On) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.8;
      (led13Ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * led13Brightness;
    }
  });

  // Pin positions for headers
  const digitalPins = useMemo(() => {
    const pins: [number, number, number][] = [];
    const pinSpacing = 0.254; // 2.54mm spacing
    const startX = -boardWidth / 2 + 5.5;
    const z = boardDepth / 2 - 0.5;

    for (let i = 0; i < 14; i++) {
      pins.push([startX + i * pinSpacing, boardHeight / 2, z]);
    }

    return pins;
  }, [boardWidth, boardDepth, boardHeight]);

  const analogPins = useMemo(() => {
    const pins: [number, number, number][] = [];
    const pinSpacing = 0.254;
    const startX = -boardWidth / 2 + 1.5;
    const z = -boardDepth / 2 + 0.5;

    for (let i = 0; i < 6; i++) {
      pins.push([startX + i * pinSpacing, boardHeight / 2, z]);
    }

    return pins;
  }, [boardWidth, boardDepth, boardHeight]);

  return (
    <group position={position} rotation={rotation}>
      {/* PCB Board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[boardWidth, boardHeight, boardDepth]} />
        <meshStandardMaterial
          color="#0a5f73"
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {/* USB Port */}
      <mesh
        castShadow
        position={[-boardWidth / 2 - 0.15, boardHeight / 2 + 0.2, 0.8]}
      >
        <boxGeometry args={[0.3, 0.4, 0.8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Power Jack */}
      <mesh
        castShadow
        position={[-boardWidth / 2 - 0.2, boardHeight / 2 + 0.15, -1.5]}
      >
        <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* ATmega328P Chip */}
      <mesh
        castShadow
        position={[0.5, boardHeight / 2 + 0.15, 0]}
      >
        <boxGeometry args={[0.9, 0.3, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Power LED (always on - green) */}
      <mesh position={[boardWidth / 2 - 0.5, boardHeight / 2 + 0.05, 0.5]}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.8}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Pin 13 LED (L LED - red) */}
      <mesh
        ref={led13Ref}
        position={[1.5, boardHeight / 2 + 0.05, 0.8]}
      >
        <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={led13On ? led13Brightness : 0.05}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* LED glow when on */}
      {led13On && (
        <pointLight
          position={[1.5, boardHeight / 2 + 0.2, 0.8]}
          color="#ff0000"
          intensity={led13Brightness * 2}
          distance={0.5}
        />
      )}

      {/* Digital Pin Headers */}
      {digitalPins.map((pos, i) => (
        <group key={`d-pin-${i}`} position={pos}>
          {/* Pin socket (black plastic) */}
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.25, 0.06]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
          </mesh>
          {/* Metal pin */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Analog Pin Headers */}
      {analogPins.map((pos, i) => (
        <group key={`a-pin-${i}`} position={pos}>
          {/* Pin socket (black plastic) */}
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.25, 0.06]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
          </mesh>
          {/* Metal pin */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Arduino Logo Area (simplified) */}
      <mesh position={[-1.5, boardHeight / 2 + 0.01, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>

      {/* Reset Button */}
      <mesh castShadow position={[boardWidth / 2 - 0.8, boardHeight / 2 + 0.1, 1.5]}>
        <cylinderGeometry args={[0.15, 0.15, 0.2, 16]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  );
}
