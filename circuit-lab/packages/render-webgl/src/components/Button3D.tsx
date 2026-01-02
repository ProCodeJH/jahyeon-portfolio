/**
 * 3D Tactile Button Component
 * Push button with click animation
 */

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Component } from '@circuit-lab/sim-core';
import { BUTTON_DIMENSIONS, BUTTON_COLORS, ButtonSize, ButtonColor } from '@circuit-lab/sim-core';

interface Button3DProps {
  component: Component;
  selected?: boolean;
  onPress?: () => void;
  onRelease?: () => void;
}

export function Button3D({
  component,
  selected = false,
  onPress,
  onRelease,
}: Button3DProps) {
  const buttonRef = useRef<THREE.Mesh>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);

  const size = component.properties.size as ButtonSize;
  const color = component.properties.color as ButtonColor;
  const dims = BUTTON_DIMENSIONS[size];
  const buttonColorHex = BUTTON_COLORS[color];

  // Animate button press
  useFrame((state, delta) => {
    const target = isPressed ? 1 : 0;
    const newProgress = THREE.MathUtils.lerp(
      pressProgress,
      target,
      delta * 15
    );
    setPressProgress(newProgress);

    if (buttonRef.current) {
      buttonRef.current.position.z =
        dims.bodyHeight + dims.buttonHeight * (1 - pressProgress * 0.5);
    }
  });

  const handlePointerDown = () => {
    setIsPressed(true);
    onPress?.();
  };

  const handlePointerUp = () => {
    setIsPressed(false);
    onRelease?.();
  };

  return (
    <group
      position={[
        component.transform.position.x,
        component.transform.position.y,
        component.transform.position.z,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {/* Button housing (black plastic) */}
      <mesh position={[0, 0, dims.bodyHeight / 2]}>
        <boxGeometry args={[dims.width, dims.height, dims.bodyHeight]} />
        <meshStandardMaterial color={0x222222} roughness={0.8} />
      </mesh>

      {/* Button cap */}
      <mesh
        ref={buttonRef}
        position={[0, 0, dims.bodyHeight + dims.buttonHeight / 2]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <cylinderGeometry
          args={[dims.width * 0.35, dims.width * 0.35, dims.buttonHeight, 32]}
        />
        <meshStandardMaterial
          color={buttonColorHex}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Metal pins (4 pins for standard tactile switch) */}
      {[
        { x: -dims.pinWidth / 2, y: -dims.height / 2 - 1 },
        { x: dims.pinWidth / 2, y: -dims.height / 2 - 1 },
        { x: -dims.pinWidth / 2, y: dims.height / 2 + 1 },
        { x: dims.pinWidth / 2, y: dims.height / 2 + 1 },
      ].map((pos, index) => (
        <mesh key={index} position={[pos.x, pos.y, -dims.pinLength / 2]}>
          <boxGeometry args={[0.5, 0.3, dims.pinLength]} />
          <meshStandardMaterial
            color={0xcccccc}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Selection indicator */}
      {selected && (
        <mesh position={[0, 0, dims.bodyHeight / 2]}>
          <boxGeometry
            args={[dims.width + 2, dims.height + 2, dims.bodyHeight + 2]}
          />
          <meshBasicMaterial
            color={0x00aaff}
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}

      {/* Press indicator */}
      {isPressed && (
        <pointLight
          position={[0, 0, dims.bodyHeight + dims.buttonHeight]}
          color={0x00ff00}
          intensity={0.3}
          distance={10}
        />
      )}
    </group>
  );
}
