/**
 * 3D LED Component
 * Physically accurate LED with emission and glow effects
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Component } from '@circuit-lab/sim-core';
import { LED_COLORS, LED_DIMENSIONS, LedColor, LedSize } from '@circuit-lab/sim-core';

interface Led3DProps {
  component: Component;
  selected?: boolean;
  onClick?: () => void;
}

export function Led3D({ component, selected = false, onClick }: Led3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const color = component.properties.color as LedColor;
  const size = component.properties.size as LedSize;
  const brightness = (component.properties.brightness as number) || 0;
  const colorHex = component.properties.colorHex as string;
  const dims = LED_DIMENSIONS[size];

  // Parse color
  const ledColor = useMemo(() => new THREE.Color(colorHex), [colorHex]);

  // Animate glow
  useFrame((state) => {
    if (glowRef.current && brightness > 0) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
      glowRef.current.scale.setScalar(1 + brightness * 0.3 * pulse);
    }
  });

  // LED lens geometry (dome shape)
  const lensGeometry = useMemo(() => {
    const radius = dims.diameter / 2;
    const geometry = new THREE.SphereGeometry(
      radius,
      32,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    return geometry;
  }, [dims.diameter]);

  // LED body geometry (cylinder with flat bottom)
  const bodyGeometry = useMemo(() => {
    const radius = dims.diameter / 2;
    const height = dims.height - dims.lensHeight;
    return new THREE.CylinderGeometry(radius, radius * 0.95, height, 32);
  }, [dims]);

  // Rim/flange at bottom
  const flangeGeometry = useMemo(() => {
    const outerRadius = dims.diameter / 2 + 0.3;
    const innerRadius = dims.diameter / 2;
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    return new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
  }, [dims]);

  return (
    <group
      ref={groupRef}
      position={[
        component.transform.position.x,
        component.transform.position.y,
        component.transform.position.z,
      ]}
      onClick={onClick}
    >
      {/* LED Lens (dome) */}
      <mesh
        geometry={lensGeometry}
        position={[0, 0, dims.height - dims.lensHeight]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshPhysicalMaterial
          color={ledColor}
          emissive={ledColor}
          emissiveIntensity={brightness * 3}
          transparent
          opacity={0.9}
          transmission={0.3}
          roughness={0.1}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.1}
          toneMapped={false}
        />
      </mesh>

      {/* LED Body */}
      <mesh
        geometry={bodyGeometry}
        position={[0, 0, (dims.height - dims.lensHeight) / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshPhysicalMaterial
          color={ledColor}
          emissive={ledColor}
          emissiveIntensity={brightness * 2}
          transparent
          opacity={0.85}
          roughness={0.15}
        />
      </mesh>

      {/* Flange */}
      <mesh
        geometry={flangeGeometry}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial color={0x333333} roughness={0.7} />
      </mesh>

      {/* Anode lead (longer) */}
      <mesh position={[dims.leadSpacing / 4, 0, -dims.anodeLead / 2]}>
        <cylinderGeometry args={[0.25, 0.25, dims.anodeLead, 8]} />
        <meshStandardMaterial
          color={0xcccccc}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Cathode lead (shorter) */}
      <mesh position={[-dims.leadSpacing / 4, 0, -dims.cathodeLead / 2]}>
        <cylinderGeometry args={[0.25, 0.25, dims.cathodeLead, 8]} />
        <meshStandardMaterial
          color={0xcccccc}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Glow effect when lit */}
      {brightness > 0 && (
        <mesh
          ref={glowRef}
          position={[0, 0, dims.height - dims.lensHeight / 2]}
        >
          <sphereGeometry args={[dims.diameter / 2 + 2, 16, 16]} />
          <meshBasicMaterial
            color={ledColor}
            transparent
            opacity={brightness * 0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Point light when lit */}
      {brightness > 0.1 && (
        <pointLight
          position={[0, 0, dims.height]}
          color={ledColor}
          intensity={brightness * 0.5}
          distance={20}
          decay={2}
        />
      )}

      {/* Selection indicator */}
      {selected && (
        <mesh position={[0, 0, dims.height / 2]}>
          <sphereGeometry args={[dims.diameter / 2 + 1, 16, 16]} />
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

/**
 * RGB LED Component
 */
interface RgbLed3DProps {
  component: Component;
  selected?: boolean;
  onClick?: () => void;
}

export function RgbLed3D({ component, selected = false, onClick }: RgbLed3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  const size = component.properties.size as LedSize;
  const dims = LED_DIMENSIONS[size];

  const redBrightness = (component.properties.redBrightness as number) || 0;
  const greenBrightness = (component.properties.greenBrightness as number) || 0;
  const blueBrightness = (component.properties.blueBrightness as number) || 0;

  // Calculate combined color
  const combinedColor = useMemo(() => {
    return new THREE.Color(redBrightness, greenBrightness, blueBrightness);
  }, [redBrightness, greenBrightness, blueBrightness]);

  const totalBrightness =
    Math.max(redBrightness, greenBrightness, blueBrightness);

  // LED lens geometry
  const lensGeometry = useMemo(() => {
    const radius = dims.diameter / 2;
    return new THREE.SphereGeometry(
      radius,
      32,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
  }, [dims.diameter]);

  return (
    <group
      ref={groupRef}
      position={[
        component.transform.position.x,
        component.transform.position.y,
        component.transform.position.z,
      ]}
      onClick={onClick}
    >
      {/* Diffused lens */}
      <mesh
        geometry={lensGeometry}
        position={[0, 0, dims.height - dims.lensHeight]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshPhysicalMaterial
          color={0xffffff}
          emissive={combinedColor}
          emissiveIntensity={totalBrightness * 3}
          transparent
          opacity={0.85}
          transmission={0.2}
          roughness={0.3}
          clearcoat={1}
          toneMapped={false}
        />
      </mesh>

      {/* Body */}
      <mesh
        position={[0, 0, (dims.height - dims.lensHeight) / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[dims.diameter / 2, dims.diameter / 2 * 0.95, dims.height - dims.lensHeight, 32]}
        />
        <meshPhysicalMaterial
          color={0xf0f0f0}
          emissive={combinedColor}
          emissiveIntensity={totalBrightness * 1.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 4 leads */}
      {[-1.5, -0.5, 0.5, 1.5].map((offset, index) => (
        <mesh
          key={index}
          position={[offset, 0, -dims.anodeLead / 2 + (index === 1 ? -0.5 : 0)]}
        >
          <cylinderGeometry
            args={[0.2, 0.2, dims.anodeLead + (index === 1 ? 1 : 0), 8]}
          />
          <meshStandardMaterial
            color={0xcccccc}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Glow */}
      {totalBrightness > 0 && (
        <>
          <mesh position={[0, 0, dims.height - dims.lensHeight / 2]}>
            <sphereGeometry args={[dims.diameter / 2 + 2, 16, 16]} />
            <meshBasicMaterial
              color={combinedColor}
              transparent
              opacity={totalBrightness * 0.3}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <pointLight
            position={[0, 0, dims.height]}
            color={combinedColor}
            intensity={totalBrightness * 0.5}
            distance={25}
            decay={2}
          />
        </>
      )}

      {selected && (
        <mesh position={[0, 0, dims.height / 2]}>
          <sphereGeometry args={[dims.diameter / 2 + 1, 16, 16]} />
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
