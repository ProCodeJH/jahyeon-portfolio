/**
 * 3D Breadboard Component
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import { Pin } from './Pin';

interface Breadboard3DProps {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  isSelected?: boolean;
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
  id,
  position,
  rotation = [0, 0, 0],
  isSelected = false
}: Breadboard3DProps) {
  return (
    <group
      position={position}
      rotation={rotation}
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

      {/* Interactive Pins */}
      {/* Terminal Strips */}
      {Array.from({ length: 60 }).map((_, col) => {
        const x = (col - 29.5) * 0.00254;
        return (
          <group key={`col_${col}`}>
            {/* Top row (a-e) */}
            {Array.from({ length: 5 }).map((_, row) => (
              <Pin
                key={`top_${col}_${row}`}
                id={`${id}_pin_${row}_${col}_top`}
                position={[x, THICKNESS / 2 + 0.001, -0.003 - (row + 1) * 0.00254]}
                radius={0.0008}
                color="#00aaff"
              />
            ))}
            {/* Bottom row (f-j) */}
            {Array.from({ length: 5 }).map((_, row) => (
              <Pin
                key={`bot_${col}_${row}`}
                id={`${id}_pin_${row}_${col}_bottom`}
                position={[x, THICKNESS / 2 + 0.001, 0.003 + (row + 1) * 0.00254]}
                radius={0.0008}
                color="#00aaff"
              />
            ))}
          </group>
        );
      })}

      {/* Power Rails */}
      {Array.from({ length: 12 }).map((_, group) => {
        const groupX = (group - 5.5) * 0.0127; // Groups of 5 holes
        return Array.from({ length: 5 }).map((_, hole) => {
          const x = groupX + (hole - 2) * 0.00254;
          return (
            <group key={`rail_${group}_${hole}`}>
              {/* Top Rails */}
              <Pin
                id={`${id}_pin_${hole}_${group}_rail_top_pos`}
                position={[x, THICKNESS / 2 + 0.001, -HEIGHT / 2 + 0.006]}
                radius={0.0008}
                color="#ff4444"
              />
              <Pin
                id={`${id}_pin_${hole}_${group}_rail_top_neg`}
                position={[x, THICKNESS / 2 + 0.001, -HEIGHT / 2 + 0.009]}
                radius={0.0008}
                color="#4444ff"
              />
              {/* Bottom Rails */}
              <Pin
                id={`${id}_pin_${hole}_${group}_rail_bot_pos`}
                position={[x, THICKNESS / 2 + 0.001, HEIGHT / 2 - 0.006]}
                radius={0.0008}
                color="#ff4444"
              />
              <Pin
                id={`${id}_pin_${hole}_${group}_rail_bot_neg`}
                position={[x, THICKNESS / 2 + 0.001, HEIGHT / 2 - 0.009]}
                radius={0.0008}
                color="#4444ff"
              />
            </group>
          );
        });
      })}

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
