/**
 * 3D Breadboard Component
 */

import { useMemo } from 'react';
import * as THREE from 'three';

interface Breadboard3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  isSelected?: boolean;
  onClick?: () => void;
}

// Colors
const BODY_COLOR = '#f5f5f0';
const HOLE_COLOR = '#333333';
const RAIL_POS_COLOR = '#cc0000';
const RAIL_NEG_COLOR = '#0066cc';

// Dimensions (scaled)
const SCALE = 0.001;
const WIDTH = 165.1 * SCALE;
const HEIGHT = 54.61 * SCALE;
const THICKNESS = 8.5 * SCALE;

export function Breadboard3D({
  position,
  rotation = [0, 0, 0],
  isSelected = false,
  onClick
}: Breadboard3DProps) {
  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Main body */}
      <mesh>
        <boxGeometry args={[WIDTH, THICKNESS, HEIGHT]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Center gap */}
      <mesh position={[0, THICKNESS / 2 + 0.0005, 0]}>
        <boxGeometry args={[WIDTH - 0.02, 0.001, 0.006]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>

      {/* Power rail lines - Top */}
      <mesh position={[0, THICKNESS / 2 + 0.0005, -HEIGHT / 2 + 0.006]}>
        <boxGeometry args={[WIDTH - 0.02, 0.0005, 0.001]} />
        <meshStandardMaterial color={RAIL_POS_COLOR} />
      </mesh>
      <mesh position={[0, THICKNESS / 2 + 0.0005, -HEIGHT / 2 + 0.009]}>
        <boxGeometry args={[WIDTH - 0.02, 0.0005, 0.001]} />
        <meshStandardMaterial color={RAIL_NEG_COLOR} />
      </mesh>

      {/* Power rail lines - Bottom */}
      <mesh position={[0, THICKNESS / 2 + 0.0005, HEIGHT / 2 - 0.006]}>
        <boxGeometry args={[WIDTH - 0.02, 0.0005, 0.001]} />
        <meshStandardMaterial color={RAIL_POS_COLOR} />
      </mesh>
      <mesh position={[0, THICKNESS / 2 + 0.0005, HEIGHT / 2 - 0.009]}>
        <boxGeometry args={[WIDTH - 0.02, 0.0005, 0.001]} />
        <meshStandardMaterial color={RAIL_NEG_COLOR} />
      </mesh>

      {/* Simplified hole representation - just show strips */}
      {/* Top terminal strip */}
      <mesh position={[0, THICKNESS / 2 + 0.0003, -0.008]}>
        <boxGeometry args={[WIDTH - 0.02, 0.0005, 0.012]} />
        <meshStandardMaterial color="#e8e8e0" />
      </mesh>

      {/* Bottom terminal strip */}
      <mesh position={[0, THICKNESS / 2 + 0.0003, 0.008]}>
        <boxGeometry args={[WIDTH - 0.02, 0.0005, 0.012]} />
        <meshStandardMaterial color="#e8e8e0" />
      </mesh>

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
