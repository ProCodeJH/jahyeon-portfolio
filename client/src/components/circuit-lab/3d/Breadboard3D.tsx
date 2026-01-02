/**
 * 3D Breadboard Component
 */

import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { CircuitComponent } from '../store';

interface Breadboard3DProps {
  component: CircuitComponent;
  selected?: boolean;
  onClick?: () => void;
  onHoleClick?: (holeId: string) => void;
}

// Colors
const BODY_COLOR = new THREE.Color(0xf5f5f0);
const HOLE_COLOR = new THREE.Color(0x333333);
const RAIL_POS_COLOR = new THREE.Color(0xcc0000);
const RAIL_NEG_COLOR = new THREE.Color(0x0066cc);

// Dimensions (mm)
const WIDTH = 165.1;
const HEIGHT = 54.61;
const THICKNESS = 8.5;
const HOLE_SPACING = 2.54;
const COLS = 63;

export function Breadboard3D({
  component,
  selected = false,
  onClick,
  onHoleClick
}: Breadboard3DProps) {
  const topRows = ['a', 'b', 'c', 'd', 'e'];
  const bottomRows = ['f', 'g', 'h', 'i', 'j'];

  // Generate holes
  const holes = useMemo(() => {
    const holeList: { id: string; x: number; y: number; type: string }[] = [];
    const startX = -WIDTH / 2 + 10;

    // Power rails
    for (let col = 1; col <= COLS; col++) {
      holeList.push({
        id: `+${col}`,
        x: startX + (col - 1) * HOLE_SPACING,
        y: HEIGHT / 2 - 4,
        type: 'power',
      });
      holeList.push({
        id: `-${col}`,
        x: startX + (col - 1) * HOLE_SPACING,
        y: HEIGHT / 2 - 4 - HOLE_SPACING,
        type: 'ground',
      });
    }

    // Top terminal strip
    topRows.forEach((row, rowIndex) => {
      for (let col = 1; col <= COLS; col++) {
        holeList.push({
          id: `${row}${col}`,
          x: startX + (col - 1) * HOLE_SPACING,
          y: HEIGHT / 2 - 14 - rowIndex * HOLE_SPACING,
          type: 'terminal',
        });
      }
    });

    // Bottom terminal strip
    bottomRows.forEach((row, rowIndex) => {
      for (let col = 1; col <= COLS; col++) {
        holeList.push({
          id: `${row}${col}`,
          x: startX + (col - 1) * HOLE_SPACING,
          y: -HEIGHT / 2 + 14 + (4 - rowIndex) * HOLE_SPACING,
          type: 'terminal',
        });
      }
    });

    return holeList;
  }, []);

  return (
    <group
      position={[component.position.x, component.position.y, component.position.z]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Main body */}
      <mesh>
        <boxGeometry args={[WIDTH, HEIGHT, THICKNESS]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Center gap */}
      <mesh position={[0, 0, THICKNESS / 2 + 0.1]}>
        <boxGeometry args={[WIDTH - 20, 6, 0.5]} />
        <meshStandardMaterial color={0xdddddd} />
      </mesh>

      {/* Power rail lines */}
      <mesh position={[0, HEIGHT / 2 - 4, THICKNESS / 2 + 0.1]}>
        <boxGeometry args={[WIDTH - 20, 0.5, 0.1]} />
        <meshStandardMaterial color={RAIL_POS_COLOR} />
      </mesh>
      <mesh position={[0, HEIGHT / 2 - 4 - HOLE_SPACING, THICKNESS / 2 + 0.1]}>
        <boxGeometry args={[WIDTH - 20, 0.5, 0.1]} />
        <meshStandardMaterial color={RAIL_NEG_COLOR} />
      </mesh>

      {/* Holes (only render every 5th for performance) */}
      {holes.filter((_, i) => i % 3 === 0).map((hole) => (
        <group
          key={hole.id}
          position={[hole.x, hole.y, THICKNESS / 2]}
          onClick={(e) => {
            e.stopPropagation();
            onHoleClick?.(hole.id);
          }}
        >
          <mesh>
            <cylinderGeometry args={[0.5, 0.5, 0.5, 12]} />
            <meshStandardMaterial color={HOLE_COLOR} />
          </mesh>
          <mesh position={[0, 0, -1]}>
            <cylinderGeometry args={[0.35, 0.35, 2, 12]} />
            <meshStandardMaterial color={0xcccccc} metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Row labels */}
      {topRows.map((row, index) => (
        <Text
          key={`top-${row}`}
          position={[-WIDTH / 2 + 5, HEIGHT / 2 - 14 - index * HOLE_SPACING, THICKNESS / 2 + 0.1]}
          fontSize={1.5}
          color={0x666666}
          anchorX="center"
          anchorY="middle"
        >
          {row.toUpperCase()}
        </Text>
      ))}

      {bottomRows.map((row, index) => (
        <Text
          key={`bottom-${row}`}
          position={[-WIDTH / 2 + 5, -HEIGHT / 2 + 14 + (4 - index) * HOLE_SPACING, THICKNESS / 2 + 0.1]}
          fontSize={1.5}
          color={0x666666}
          anchorX="center"
          anchorY="middle"
        >
          {row.toUpperCase()}
        </Text>
      ))}

      {/* Power rail labels */}
      <Text
        position={[-WIDTH / 2 + 5, HEIGHT / 2 - 4, THICKNESS / 2 + 0.1]}
        fontSize={1.5}
        color={RAIL_POS_COLOR}
        anchorX="center"
        anchorY="middle"
      >
        +
      </Text>
      <Text
        position={[-WIDTH / 2 + 5, HEIGHT / 2 - 4 - HOLE_SPACING, THICKNESS / 2 + 0.1]}
        fontSize={1.5}
        color={RAIL_NEG_COLOR}
        anchorX="center"
        anchorY="middle"
      >
        -
      </Text>

      {/* Selection highlight */}
      {selected && (
        <mesh position={[0, 0, -0.5]}>
          <boxGeometry args={[WIDTH + 4, HEIGHT + 4, 0.5]} />
          <meshBasicMaterial color={0x00aaff} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
