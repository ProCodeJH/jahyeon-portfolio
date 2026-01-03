/**
 * Photoresistor (LDR) 3D Component
 * Realistic 3D model of Light Dependent Resistor
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Photoresistor3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  lightLevel?: number; // 0-1023 (analog value)
  onClick?: () => void;
  isSelected?: boolean;
}

export function Photoresistor3D({
  position,
  rotation = [0, 0, 0],
  lightLevel = 512,
  onClick,
  isSelected,
}: Photoresistor3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const sensorSurfaceRef = useRef<THREE.Mesh>(null);

  // LDR dimensions (scaled to scene units)
  const bodyRadius = 0.005;
  const bodyHeight = 0.002;
  const legLength = 0.004;
  const legRadius = 0.00025;
  const legSpacing = 0.003;

  // Map light level to visualization
  const { sensorColor, glowIntensity } = useMemo(() => {
    const normalized = lightLevel / 1023;
    return {
      sensorColor: new THREE.Color().lerpColors(
        new THREE.Color('#2a1500'), // Dark (high resistance)
        new THREE.Color('#ff8c00'), // Bright (low resistance)
        normalized
      ),
      glowIntensity: normalized * 0.5,
    };
  }, [lightLevel]);

  // Animate sensor response
  useFrame((state) => {
    if (sensorSurfaceRef.current) {
      const material = sensorSurfaceRef.current.material as THREE.MeshStandardMaterial;
      const flicker = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.02;
      material.emissiveIntensity = glowIntensity * flicker;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Base disc (ceramic/epoxy) */}
      <mesh position={[0, bodyHeight / 2, 0]}>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 32]} />
        <meshStandardMaterial
          color="#8b4513"
          roughness={0.7}
          metalness={0}
        />
      </mesh>

      {/* Photosensitive surface (CdS cell pattern) */}
      <mesh ref={sensorSurfaceRef} position={[0, bodyHeight + 0.0001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[bodyRadius * 0.85, 32]} />
        <meshStandardMaterial
          color={sensorColor}
          roughness={0.5}
          metalness={0.1}
          emissive={sensorColor}
          emissiveIntensity={glowIntensity}
        />
      </mesh>

      {/* Serpentine pattern on sensor (decorative) */}
      <group position={[0, bodyHeight + 0.0002, 0]}>
        {[...Array(5)].map((_, i) => (
          <mesh
            key={i}
            position={[0, 0, (i - 2) * bodyRadius * 0.3]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[bodyRadius * 1.5, bodyRadius * 0.08]} />
            <meshStandardMaterial
              color="#333333"
              roughness={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
      </group>

      {/* Clear epoxy dome (protective cover) */}
      <mesh position={[0, bodyHeight + 0.001, 0]}>
        <sphereGeometry args={[bodyRadius * 0.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Lead 1 */}
      <group position={[legSpacing / 2, -legLength / 2, 0]}>
        <mesh>
          <cylinderGeometry args={[legRadius, legRadius, legLength, 8]} />
          <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* Lead 2 */}
      <group position={[-legSpacing / 2, -legLength / 2, 0]}>
        <mesh>
          <cylinderGeometry args={[legRadius, legRadius, legLength, 8]} />
          <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* Light level indicator (virtual) */}
      <mesh position={[0, bodyHeight + 0.004, 0]}>
        <boxGeometry args={[bodyRadius * 1.5, 0.0008, 0.0015]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      <mesh position={[(lightLevel / 1023 - 0.5) * bodyRadius * 0.75, bodyHeight + 0.004, 0.0001]}>
        <boxGeometry args={[(lightLevel / 1023) * bodyRadius * 1.5, 0.0006, 0.0012]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, bodyHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[bodyRadius + 0.001, bodyRadius + 0.0015, 32]} />
          <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export default Photoresistor3D;
