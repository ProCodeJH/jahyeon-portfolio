/**
 * 3D Resistor Component
 * Through-hole resistor with color bands
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Component } from '@circuit-lab/sim-core';
import { COLOR_BANDS, RESISTOR_DIMENSIONS, ColorBand, ResistorSize } from '@circuit-lab/sim-core';

interface Resistor3DProps {
  component: Component;
  selected?: boolean;
  onClick?: () => void;
}

export function Resistor3D({ component, selected = false, onClick }: Resistor3DProps) {
  const size = component.properties.size as ResistorSize;
  const colorBands = component.properties.colorBands as ColorBand[];
  const dims = RESISTOR_DIMENSIONS[size];

  // Body material (ceramic/epoxy)
  const bodyColor = new THREE.Color(0xd4c4a8); // Tan/beige

  // Create band colors
  const bandColors = useMemo(() => {
    return colorBands.map((band) => new THREE.Color(COLOR_BANDS[band].hex));
  }, [colorBands]);

  // Lead metal color
  const leadColor = new THREE.Color(0xcccccc);

  return (
    <group
      position={[
        component.transform.position.x,
        component.transform.position.y,
        component.transform.position.z,
      ]}
      rotation={[
        component.transform.rotation.x,
        component.transform.rotation.y,
        component.transform.rotation.z,
      ]}
      onClick={onClick}
    >
      {/* Resistor body */}
      <mesh>
        <cylinderGeometry
          args={[
            dims.bodyDiameter / 2,
            dims.bodyDiameter / 2,
            dims.bodyLength,
            32,
          ]}
        />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Color bands */}
      {bandColors.map((color, index) => {
        const bandWidth = dims.bodyLength * 0.08;
        const spacing = dims.bodyLength * 0.15;
        const startOffset = -dims.bodyLength * 0.35;
        const position = startOffset + index * spacing;

        // Tolerance band is spaced further
        const actualPosition =
          index === 3 ? dims.bodyLength * 0.3 : position;

        return (
          <mesh key={index} position={[0, actualPosition, 0]}>
            <cylinderGeometry
              args={[
                dims.bodyDiameter / 2 + 0.05,
                dims.bodyDiameter / 2 + 0.05,
                bandWidth,
                32,
              ]}
            />
            <meshStandardMaterial
              color={color}
              roughness={0.5}
              metalness={0.1}
            />
          </mesh>
        );
      })}

      {/* Left lead */}
      <mesh position={[0, -dims.bodyLength / 2 - dims.leadLength / 2, 0]}>
        <cylinderGeometry
          args={[dims.leadDiameter / 2, dims.leadDiameter / 2, dims.leadLength, 8]}
        />
        <meshStandardMaterial
          color={leadColor}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Right lead */}
      <mesh position={[0, dims.bodyLength / 2 + dims.leadLength / 2, 0]}>
        <cylinderGeometry
          args={[dims.leadDiameter / 2, dims.leadDiameter / 2, dims.leadLength, 8]}
        />
        <meshStandardMaterial
          color={leadColor}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Selection indicator */}
      {selected && (
        <mesh>
          <cylinderGeometry
            args={[
              dims.bodyDiameter / 2 + 0.5,
              dims.bodyDiameter / 2 + 0.5,
              dims.bodyLength + 1,
              16,
            ]}
          />
          <meshBasicMaterial
            color={0x00aaff}
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}
