/**
 * 3D Arduino UNO Component
 * Physically accurate model with PBR materials
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import type { Component } from '@circuit-lab/sim-core';
import { ARDUINO_DIMENSIONS, PIN_POSITIONS } from '@circuit-lab/sim-core';

interface Arduino3DProps {
  component: Component;
  selected?: boolean;
  onPinClick?: (pinId: string) => void;
  onPinHover?: (pinId: string | null) => void;
  showLabels?: boolean;
}

// PCB green color (FR4)
const PCB_COLOR = new THREE.Color(0x1a5f1a);
const PCB_MASK_COLOR = new THREE.Color(0x2d8a2d);
const SILK_COLOR = new THREE.Color(0xf5f5f0);
const COPPER_COLOR = new THREE.Color(0xb87333);
const GOLD_COLOR = new THREE.Color(0xd4af37);
const CHIP_COLOR = new THREE.Color(0x1a1a1a);
const USB_METAL_COLOR = new THREE.Color(0x888888);
const CRYSTAL_COLOR = new THREE.Color(0x444444);

// Scale factor: 1 unit = 1mm
const SCALE = 1;

export function Arduino3D({
  component,
  selected = false,
  onPinClick,
  onPinHover,
  showLabels = true,
}: Arduino3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { width, height, boardThickness, pinSpacing } = ARDUINO_DIMENSIONS;

  // LED state for built-in LED (pin 13)
  const builtInLedPin = component.pins.find((p) => p.name === 'D13');
  const ledBrightness = builtInLedPin?.pwm?.dutyCycle
    ? builtInLedPin.pwm.dutyCycle / 255
    : builtInLedPin?.state === 1
    ? 1
    : 0;

  // Create PCB geometry with rounded corners
  const pcbGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = 2; // 2mm corner radius

    // Create rounded rectangle
    shape.moveTo(radius, 0);
    shape.lineTo(width - radius, 0);
    shape.quadraticCurveTo(width, 0, width, radius);
    shape.lineTo(width, height - radius);
    shape.quadraticCurveTo(width, height, width - radius, height);
    shape.lineTo(radius, height);
    shape.quadraticCurveTo(0, height, 0, height - radius);
    shape.lineTo(0, radius);
    shape.quadraticCurveTo(0, 0, radius, 0);

    // Add mounting holes
    const holeRadius = 1.6; // 3.2mm diameter holes
    const holes = [
      { x: 14, y: 2.54 },
      { x: 15.24, y: 50.8 },
      { x: 66.04, y: 7.62 },
      { x: 66.04, y: 35.56 },
    ];

    for (const hole of holes) {
      const holePath = new THREE.Path();
      holePath.absarc(hole.x, hole.y, holeRadius, 0, Math.PI * 2, false);
      shape.holes.push(holePath);
    }

    const extrudeSettings = {
      depth: boardThickness,
      bevelEnabled: false,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [width, height, boardThickness]);

  // Create pin header geometry
  const createPinHeader = (
    pins: { x: number; y: number; z: number }[],
    isDigital: boolean
  ) => {
    return pins.map((pos, index) => (
      <group key={index} position={[pos.x, pos.y, pos.z]}>
        {/* Pin housing (black plastic) */}
        <mesh position={[0, 0, 4]}>
          <boxGeometry args={[2.54, 2.54, 8.5]} />
          <meshStandardMaterial color={0x1a1a1a} roughness={0.8} />
        </mesh>
        {/* Metal pin */}
        <mesh position={[0, 0, -1.5]}>
          <cylinderGeometry args={[0.3, 0.3, 11, 8]} />
          <meshStandardMaterial
            color={GOLD_COLOR}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </group>
    ));
  };

  // Power header pins
  const powerPins = [
    { x: 3.81, y: 50.8, z: boardThickness },
    { x: 3.81, y: 48.26, z: boardThickness },
    { x: 3.81, y: 45.72, z: boardThickness },
    { x: 3.81, y: 43.18, z: boardThickness },
    { x: 3.81, y: 40.64, z: boardThickness },
    { x: 3.81, y: 38.1, z: boardThickness },
    { x: 3.81, y: 35.56, z: boardThickness },
  ];

  // Analog header pins
  const analogPins = [
    { x: 3.81, y: 26.67, z: boardThickness },
    { x: 3.81, y: 24.13, z: boardThickness },
    { x: 3.81, y: 21.59, z: boardThickness },
    { x: 3.81, y: 19.05, z: boardThickness },
    { x: 3.81, y: 16.51, z: boardThickness },
    { x: 3.81, y: 13.97, z: boardThickness },
  ];

  // Digital pins (8-13)
  const digitalPinsHigh = [
    { x: 64.77, y: 50.8, z: boardThickness },
    { x: 64.77, y: 48.26, z: boardThickness },
    { x: 64.77, y: 45.72, z: boardThickness },
    { x: 64.77, y: 43.18, z: boardThickness },
    { x: 64.77, y: 40.64, z: boardThickness },
    { x: 64.77, y: 38.1, z: boardThickness },
    { x: 64.77, y: 35.56, z: boardThickness },
    { x: 64.77, y: 33.02, z: boardThickness },
  ];

  // Digital pins (0-7)
  const digitalPinsLow = [
    { x: 64.77, y: 27.94, z: boardThickness },
    { x: 64.77, y: 25.4, z: boardThickness },
    { x: 64.77, y: 22.86, z: boardThickness },
    { x: 64.77, y: 20.32, z: boardThickness },
    { x: 64.77, y: 17.78, z: boardThickness },
    { x: 64.77, y: 15.24, z: boardThickness },
    { x: 64.77, y: 12.7, z: boardThickness },
    { x: 64.77, y: 10.16, z: boardThickness },
  ];

  return (
    <group
      ref={groupRef}
      position={[
        component.transform.position.x,
        component.transform.position.y,
        component.transform.position.z,
      ]}
      rotation={[
        -Math.PI / 2, // Lay flat on XY plane
        0,
        0,
      ]}
    >
      {/* PCB Board */}
      <mesh geometry={pcbGeometry}>
        <meshStandardMaterial
          color={PCB_MASK_COLOR}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* USB-B Connector */}
      <group position={[34.3, -3, boardThickness + 5.5]}>
        <mesh>
          <boxGeometry args={[12, 16, 11]} />
          <meshStandardMaterial
            color={USB_METAL_COLOR}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
        {/* USB opening */}
        <mesh position={[0, -6, 0]}>
          <boxGeometry args={[8, 4, 7]} />
          <meshStandardMaterial color={0x222222} />
        </mesh>
      </group>

      {/* DC Power Jack */}
      <group position={[7, -3, boardThickness + 5]}>
        <mesh>
          <cylinderGeometry args={[4.5, 4.5, 14, 16]} />
          <meshStandardMaterial
            color={0x222222}
            roughness={0.7}
          />
        </mesh>
      </group>

      {/* ATmega328P Microcontroller (DIP-28) */}
      <group position={[34, 26, boardThickness + 2]}>
        <mesh>
          <boxGeometry args={[7.5, 35, 4]} />
          <meshStandardMaterial color={CHIP_COLOR} roughness={0.3} />
        </mesh>
        {/* Chip notch */}
        <mesh position={[0, -17, 2.1]}>
          <cylinderGeometry args={[1, 1, 0.2, 16]} />
          <meshStandardMaterial color={0x333333} />
        </mesh>
        {/* Pin 1 indicator */}
        <mesh position={[-2.5, -16, 2.1]}>
          <circleGeometry args={[0.5, 16]} />
          <meshStandardMaterial color={0x666666} />
        </mesh>
      </group>

      {/* ATmega16U2 (USB controller) */}
      <group position={[34, 4, boardThickness + 1]}>
        <mesh>
          <boxGeometry args={[9, 9, 2]} />
          <meshStandardMaterial color={CHIP_COLOR} roughness={0.3} />
        </mesh>
      </group>

      {/* Crystal Oscillator */}
      <group position={[50, 26, boardThickness + 1.5]}>
        <mesh>
          <boxGeometry args={[5, 12, 3]} />
          <meshStandardMaterial
            color={CRYSTAL_COLOR}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Reset Button */}
      <group position={[52, 48, boardThickness + 2]}>
        <mesh>
          <boxGeometry args={[6, 6, 2]} />
          <meshStandardMaterial color={0x333333} />
        </mesh>
        <mesh position={[0, 0, 1.5]}>
          <cylinderGeometry args={[1.5, 1.5, 1, 16]} />
          <meshStandardMaterial color={0x888888} />
        </mesh>
      </group>

      {/* Built-in LED (L) - Pin 13 */}
      <group position={[58, 42, boardThickness + 1]}>
        <mesh>
          <boxGeometry args={[2, 1, 0.8]} />
          <meshStandardMaterial
            color={0x00ff00}
            emissive={0x00ff00}
            emissiveIntensity={ledBrightness * 2}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Power LED (ON) */}
      <group position={[10, 42, boardThickness + 1]}>
        <mesh>
          <boxGeometry args={[2, 1, 0.8]} />
          <meshStandardMaterial
            color={0x00ff00}
            emissive={0x00ff00}
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* TX LED */}
      <group position={[14, 42, boardThickness + 1]}>
        <mesh>
          <boxGeometry args={[2, 1, 0.8]} />
          <meshStandardMaterial color={0xffff00} />
        </mesh>
      </group>

      {/* RX LED */}
      <group position={[18, 42, boardThickness + 1]}>
        <mesh>
          <boxGeometry args={[2, 1, 0.8]} />
          <meshStandardMaterial color={0xffff00} />
        </mesh>
      </group>

      {/* Pin Headers */}
      {createPinHeader(powerPins, false)}
      {createPinHeader(analogPins, false)}
      {createPinHeader(digitalPinsHigh, true)}
      {createPinHeader(digitalPinsLow, true)}

      {/* Silkscreen Labels */}
      {showLabels && (
        <>
          {/* Arduino Logo */}
          <Text
            position={[34, 48, boardThickness + 0.1]}
            fontSize={3}
            color={SILK_COLOR}
            anchorX="center"
            anchorY="middle"
          >
            ARDUINO
          </Text>
          <Text
            position={[34, 44, boardThickness + 0.1]}
            fontSize={2}
            color={SILK_COLOR}
            anchorX="center"
            anchorY="middle"
          >
            UNO R3
          </Text>

          {/* Pin Labels - Power */}
          {['IOREF', 'RESET', '3V3', '5V', 'GND', 'GND', 'VIN'].map(
            (label, i) => (
              <Text
                key={`pwr-${i}`}
                position={[7, 50.8 - i * 2.54, boardThickness + 0.1]}
                fontSize={1}
                color={SILK_COLOR}
                anchorX="left"
                anchorY="middle"
              >
                {label}
              </Text>
            )
          )}

          {/* Pin Labels - Analog */}
          {['A0', 'A1', 'A2', 'A3', 'A4', 'A5'].map((label, i) => (
            <Text
              key={`analog-${i}`}
              position={[7, 26.67 - i * 2.54, boardThickness + 0.1]}
              fontSize={1}
              color={SILK_COLOR}
              anchorX="left"
              anchorY="middle"
            >
              {label}
            </Text>
          ))}

          {/* Pin Labels - Digital High */}
          {['8', '9', '10', '11', '12', '13', 'GND', 'AREF'].map((label, i) => (
            <Text
              key={`digh-${i}`}
              position={[61, 50.8 - i * 2.54, boardThickness + 0.1]}
              fontSize={1}
              color={SILK_COLOR}
              anchorX="right"
              anchorY="middle"
            >
              {label}
            </Text>
          ))}

          {/* Pin Labels - Digital Low */}
          {['RX', 'TX', '2', '3', '4', '5', '6', '7'].map((label, i) => (
            <Text
              key={`digl-${i}`}
              position={[61, 27.94 - i * 2.54, boardThickness + 0.1]}
              fontSize={1}
              color={SILK_COLOR}
              anchorX="right"
              anchorY="middle"
            >
              {label}
            </Text>
          ))}
        </>
      )}

      {/* Selection highlight */}
      {selected && (
        <mesh position={[width / 2, height / 2, -0.1]}>
          <planeGeometry args={[width + 4, height + 4]} />
          <meshBasicMaterial
            color={0x00aaff}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}
