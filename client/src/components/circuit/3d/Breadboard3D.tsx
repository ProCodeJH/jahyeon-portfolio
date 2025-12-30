/**
 * 3D Breadboard Component
 * Realistic breadboard with holes and power rails
 */

import { useMemo } from 'react';
import * as THREE from 'three';

interface Breadboard3DProps {
  position?: [number, number, number];
  rows?: number;
  columns?: number;
}

export function Breadboard3D({ position = [0, 0, 0], rows = 30, columns = 10 }: Breadboard3DProps) {
  // Breadboard dimensions (in cm, scaled to Three.js units)
  const width = 8.5; // 85mm = 8.5cm
  const height = 0.8; // 8mm thickness
  const depth = 5.5; // 55mm = 5.5cm

  // Hole configurations
  const holeRadius = 0.04; // 4mm holes
  const holeDepth = 0.6;
  const holeSpacing = 0.254; // 2.54mm = 0.1 inch standard spacing

  // Generate hole positions
  const holes = useMemo(() => {
    const positions: [number, number, number][] = [];

    // Main circuit area (2 sections of 5 columns each)
    const startX = -width / 2 + 1;
    const startZ = -depth / 2 + 0.8;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const x = startX + col * holeSpacing;
        const z = startZ + row * holeSpacing;
        positions.push([x, height / 2, z]);
      }
    }

    return positions;
  }, [rows, columns, width, depth, height, holeSpacing]);

  // Power rail holes
  const powerRailHoles = useMemo(() => {
    const positions: [number, number, number][] = [];
    const railY = height / 2;

    // Top power rails (+/-)
    for (let i = 0; i < rows; i++) {
      const z = -depth / 2 + 0.3 + i * holeSpacing;
      // Positive rail
      positions.push([-width / 2 + 0.3, railY, z]);
      // Negative rail
      positions.push([-width / 2 + 0.6, railY, z]);
    }

    // Bottom power rails (+/-)
    for (let i = 0; i < rows; i++) {
      const z = -depth / 2 + 0.3 + i * holeSpacing;
      // Positive rail
      positions.push([width / 2 - 0.6, railY, z]);
      // Negative rail
      positions.push([width / 2 - 0.3, railY, z]);
    }

    return positions;
  }, [rows, width, depth, height, holeSpacing]);

  return (
    <group position={position}>
      {/* Main Breadboard Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color="#f8f9fa"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Circuit Area Holes */}
      {holes.map((pos, i) => (
        <mesh key={`hole-${i}`} position={pos}>
          <cylinderGeometry args={[holeRadius, holeRadius, holeDepth, 16]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.8} metalness={0.2} />
        </mesh>
      ))}

      {/* Power Rail Holes */}
      {powerRailHoles.map((pos, i) => (
        <mesh key={`power-hole-${i}`} position={pos}>
          <cylinderGeometry args={[holeRadius, holeRadius, holeDepth, 16]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.8} metalness={0.2} />
        </mesh>
      ))}

      {/* Power Rail Indicators */}
      {/* Top + rail (red) */}
      <mesh position={[-width / 2 + 0.3, height / 2 + 0.01, -depth / 2 + 0.15]}>
        <boxGeometry args={[0.15, 0.02, rows * holeSpacing + 0.2]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.2} />
      </mesh>

      {/* Top - rail (blue) */}
      <mesh position={[-width / 2 + 0.6, height / 2 + 0.01, -depth / 2 + 0.15]}>
        <boxGeometry args={[0.15, 0.02, rows * holeSpacing + 0.2]} />
        <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={0.2} />
      </mesh>

      {/* Bottom + rail (red) */}
      <mesh position={[width / 2 - 0.6, height / 2 + 0.01, -depth / 2 + 0.15]}>
        <boxGeometry args={[0.15, 0.02, rows * holeSpacing + 0.2]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.2} />
      </mesh>

      {/* Bottom - rail (blue) */}
      <mesh position={[width / 2 - 0.3, height / 2 + 0.01, -depth / 2 + 0.15]}>
        <boxGeometry args={[0.15, 0.02, rows * holeSpacing + 0.2]} />
        <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={0.2} />
      </mesh>

      {/* Breadboard Labels */}
      <group position={[0, height / 2 + 0.02, -depth / 2 - 0.1]}>
        {/* Row numbers on left */}
        {Array.from({ length: 6 }).map((_, i) => {
          const rowNum = i * 5;
          if (rowNum >= rows) return null;

          return (
            <mesh
              key={`label-${i}`}
              position={[-width / 2 + 0.2, 0, rowNum * holeSpacing]}
            >
              <planeGeometry args={[0.2, 0.15]} />
              <meshBasicMaterial color="#6b7280" opacity={0.5} transparent />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
