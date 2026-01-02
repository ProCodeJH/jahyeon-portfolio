/**
 * 3D Breadboard Component
 * Physically accurate model with visible holes and internal connections
 */

import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import type { Component } from '@circuit-lab/sim-core';
import { BREADBOARD_DIMENSIONS, BreadboardConfig } from '@circuit-lab/sim-core';

interface Breadboard3DProps {
  component: Component;
  selected?: boolean;
  onHoleClick?: (holeId: string) => void;
  onHoleHover?: (holeId: string | null) => void;
  showLabels?: boolean;
  highlightConnected?: string[];
}

// Breadboard colors
const BODY_COLOR = new THREE.Color(0xf5f5f0); // Off-white
const HOLE_COLOR = new THREE.Color(0x333333);
const RAIL_POSITIVE_COLOR = new THREE.Color(0xcc0000);
const RAIL_NEGATIVE_COLOR = new THREE.Color(0x0066cc);
const HIGHLIGHT_COLOR = new THREE.Color(0x00ff88);
const HOVER_COLOR = new THREE.Color(0xffaa00);

export function Breadboard3D({
  component,
  selected = false,
  onHoleClick,
  onHoleHover,
  showLabels = true,
  highlightConnected = [],
}: Breadboard3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredHole, setHoveredHole] = useState<string | null>(null);

  const config = component.properties.config as BreadboardConfig;
  const dims = BREADBOARD_DIMENSIONS[config.type];
  const spacing = dims.holeSpacing;

  // Terminal strip row labels
  const topRows = ['a', 'b', 'c', 'd', 'e'];
  const bottomRows = ['f', 'g', 'h', 'i', 'j'];

  // Create body geometry
  const bodyGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const width = dims.width;
    const height = dims.height;
    const radius = 2; // Corner radius

    shape.moveTo(radius, 0);
    shape.lineTo(width - radius, 0);
    shape.quadraticCurveTo(width, 0, width, radius);
    shape.lineTo(width, height - radius);
    shape.quadraticCurveTo(width, height, width - radius, height);
    shape.lineTo(radius, height);
    shape.quadraticCurveTo(0, height, 0, height - radius);
    shape.lineTo(0, radius);
    shape.quadraticCurveTo(0, 0, radius, 0);

    return new THREE.ExtrudeGeometry(shape, {
      depth: dims.thickness,
      bevelEnabled: false,
    });
  }, [dims]);

  // Create hole instances
  const holes = useMemo(() => {
    const holeList: {
      id: string;
      x: number;
      y: number;
      type: 'terminal' | 'power' | 'ground';
      row: string;
      col: number;
    }[] = [];

    const startX = 5; // Offset from edge
    const railY = 4;
    const topTerminalY = config.hasTopRails ? 14 : 8;
    const gapY = dims.centerGap;

    // Power rails (if present)
    if (config.hasTopRails) {
      for (let col = 1; col <= dims.rows; col++) {
        // Positive rail
        holeList.push({
          id: `+${col}`,
          x: startX + (col - 1) * spacing,
          y: railY,
          type: 'power',
          row: '+',
          col,
        });
        // Negative rail
        holeList.push({
          id: `-${col}`,
          x: startX + (col - 1) * spacing,
          y: railY + spacing,
          type: 'ground',
          row: '-',
          col,
        });
      }
    }

    // Top terminal strip (a-e)
    topRows.forEach((row, rowIndex) => {
      for (let col = 1; col <= dims.rows; col++) {
        holeList.push({
          id: `${row}${col}`,
          x: startX + (col - 1) * spacing,
          y: topTerminalY + rowIndex * spacing,
          type: 'terminal',
          row,
          col,
        });
      }
    });

    // Bottom terminal strip (f-j)
    bottomRows.forEach((row, rowIndex) => {
      for (let col = 1; col <= dims.rows; col++) {
        holeList.push({
          id: `${row}${col}`,
          x: startX + (col - 1) * spacing,
          y: topTerminalY + 5 * spacing + gapY + rowIndex * spacing,
          type: 'terminal',
          row,
          col,
        });
      }
    });

    // Bottom power rails (if present)
    if (config.hasBottomRails) {
      const bottomRailY = dims.height - railY - spacing;
      for (let col = 1; col <= dims.rows; col++) {
        holeList.push({
          id: `+b${col}`,
          x: startX + (col - 1) * spacing,
          y: bottomRailY,
          type: 'power',
          row: '+',
          col,
        });
        holeList.push({
          id: `-b${col}`,
          x: startX + (col - 1) * spacing,
          y: bottomRailY + spacing,
          type: 'ground',
          row: '-',
          col,
        });
      }
    }

    return holeList;
  }, [dims, config, spacing]);

  // Handle hole interaction
  const handleHolePointerOver = (holeId: string) => {
    setHoveredHole(holeId);
    onHoleHover?.(holeId);
  };

  const handleHolePointerOut = () => {
    setHoveredHole(null);
    onHoleHover?.(null);
  };

  const handleHoleClick = (holeId: string) => {
    onHoleClick?.(holeId);
  };

  return (
    <group
      ref={groupRef}
      position={[
        component.transform.position.x,
        component.transform.position.y,
        component.transform.position.z,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {/* Main body */}
      <mesh geometry={bodyGeometry}>
        <meshStandardMaterial
          color={BODY_COLOR}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* Center divider groove */}
      <mesh
        position={[
          dims.width / 2,
          (config.hasTopRails ? 14 : 8) + 5 * spacing + dims.centerGap / 2,
          dims.thickness + 0.1,
        ]}
      >
        <boxGeometry args={[dims.width - 10, dims.centerGap - 1, 0.5]} />
        <meshStandardMaterial color={0xdddddd} />
      </mesh>

      {/* Power rail indicators */}
      {config.hasTopRails && (
        <>
          {/* Top positive rail line */}
          <mesh position={[dims.width / 2, 4, dims.thickness + 0.1]}>
            <boxGeometry args={[dims.width - 10, 0.5, 0.1]} />
            <meshStandardMaterial color={RAIL_POSITIVE_COLOR} />
          </mesh>
          {/* Top negative rail line */}
          <mesh position={[dims.width / 2, 4 + spacing, dims.thickness + 0.1]}>
            <boxGeometry args={[dims.width - 10, 0.5, 0.1]} />
            <meshStandardMaterial color={RAIL_NEGATIVE_COLOR} />
          </mesh>
        </>
      )}

      {config.hasBottomRails && (
        <>
          {/* Bottom positive rail line */}
          <mesh
            position={[
              dims.width / 2,
              dims.height - 4 - spacing,
              dims.thickness + 0.1,
            ]}
          >
            <boxGeometry args={[dims.width - 10, 0.5, 0.1]} />
            <meshStandardMaterial color={RAIL_POSITIVE_COLOR} />
          </mesh>
          {/* Bottom negative rail line */}
          <mesh
            position={[dims.width / 2, dims.height - 4, dims.thickness + 0.1]}
          >
            <boxGeometry args={[dims.width - 10, 0.5, 0.1]} />
            <meshStandardMaterial color={RAIL_NEGATIVE_COLOR} />
          </mesh>
        </>
      )}

      {/* Holes */}
      {holes.map((hole) => {
        const isHighlighted = highlightConnected.includes(hole.id);
        const isHovered = hoveredHole === hole.id;

        let holeColor = HOLE_COLOR;
        if (isHovered) holeColor = HOVER_COLOR;
        else if (isHighlighted) holeColor = HIGHLIGHT_COLOR;

        return (
          <group
            key={hole.id}
            position={[hole.x, hole.y, dims.thickness]}
            onPointerOver={() => handleHolePointerOver(hole.id)}
            onPointerOut={handleHolePointerOut}
            onClick={() => handleHoleClick(hole.id)}
          >
            {/* Hole outer ring */}
            <mesh>
              <cylinderGeometry args={[0.6, 0.6, 0.5, 16]} />
              <meshStandardMaterial color={holeColor} />
            </mesh>
            {/* Hole inner (actual hole) */}
            <mesh position={[0, 0, 0.25]}>
              <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
              <meshStandardMaterial color={0x111111} />
            </mesh>
            {/* Metal contact inside */}
            <mesh position={[0, 0, -1]}>
              <cylinderGeometry args={[0.35, 0.35, 2, 16]} />
              <meshStandardMaterial
                color={0xcccccc}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </group>
        );
      })}

      {/* Row labels */}
      {showLabels && (
        <>
          {/* Top terminal row labels */}
          {topRows.map((row, index) => (
            <Text
              key={`top-${row}`}
              position={[
                2,
                (config.hasTopRails ? 14 : 8) + index * spacing,
                dims.thickness + 0.1,
              ]}
              fontSize={1.5}
              color={0x666666}
              anchorX="center"
              anchorY="middle"
            >
              {row.toUpperCase()}
            </Text>
          ))}

          {/* Bottom terminal row labels */}
          {bottomRows.map((row, index) => (
            <Text
              key={`bottom-${row}`}
              position={[
                2,
                (config.hasTopRails ? 14 : 8) +
                  5 * spacing +
                  dims.centerGap +
                  index * spacing,
                dims.thickness + 0.1,
              ]}
              fontSize={1.5}
              color={0x666666}
              anchorX="center"
              anchorY="middle"
            >
              {row.toUpperCase()}
            </Text>
          ))}

          {/* Column numbers (every 5) */}
          {Array.from({ length: Math.floor(dims.rows / 5) }).map((_, i) => (
            <Text
              key={`col-${(i + 1) * 5}`}
              position={[
                5 + ((i + 1) * 5 - 1) * spacing,
                dims.height / 2,
                dims.thickness + 0.1,
              ]}
              fontSize={1.2}
              color={0x888888}
              anchorX="center"
              anchorY="middle"
            >
              {(i + 1) * 5}
            </Text>
          ))}

          {/* Power rail labels */}
          {config.hasTopRails && (
            <>
              <Text
                position={[2, 4, dims.thickness + 0.1]}
                fontSize={1.5}
                color={RAIL_POSITIVE_COLOR}
                anchorX="center"
                anchorY="middle"
              >
                +
              </Text>
              <Text
                position={[2, 4 + spacing, dims.thickness + 0.1]}
                fontSize={1.5}
                color={RAIL_NEGATIVE_COLOR}
                anchorX="center"
                anchorY="middle"
              >
                -
              </Text>
            </>
          )}
        </>
      )}

      {/* Selection highlight */}
      {selected && (
        <mesh position={[dims.width / 2, dims.height / 2, -0.1]}>
          <planeGeometry args={[dims.width + 4, dims.height + 4]} />
          <meshBasicMaterial color={0x00aaff} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
