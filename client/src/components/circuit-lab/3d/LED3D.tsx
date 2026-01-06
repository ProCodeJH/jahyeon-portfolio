import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Pin } from './Pin';

interface LED3DProps {
  id: string;
  position: [number, number, number];
  color: string;
  isOn: boolean;
  brightness?: number;
  isSelected?: boolean;
}

export function LED3D({
  id,
  position,
  color,
  isOn,
  brightness = 1,
  isSelected
}: LED3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // LED dimensions (5mm LED scaled to scene units)
  const bodyRadius = 0.0025;
  const bodyHeight = 0.004;
  const legLength = 0.003;
  const legRadius = 0.0003;

  const emissiveIntensity = isOn ? brightness * 2 : 0;

  // Animate glow
  useFrame((state) => {
    if (glowRef.current && isOn) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* LED dome (translucent) */}
      <mesh position={[0, bodyHeight / 2, 0]}>
        <sphereGeometry args={[bodyRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* LED body (cylinder) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 32]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.85}
          roughness={0.15}
          metalness={0}
          emissive={color}
          emissiveIntensity={emissiveIntensity * 0.5}
        />
      </mesh>

      {/* Flat bottom rim */}
      <mesh position={[0, -bodyHeight / 2 + 0.0002, 0]}>
        <cylinderGeometry args={[bodyRadius + 0.0003, bodyRadius + 0.0003, 0.0004, 32]} />
        <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Anode leg (longer, positive) */}
      <mesh position={[0.0008, -bodyHeight / 2 - legLength / 2, 0]}>
        <cylinderGeometry args={[legRadius, legRadius, legLength, 8]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Cathode leg (shorter, negative) */}
      <mesh position={[-0.0008, -bodyHeight / 2 - legLength / 2 + 0.0005, 0]}>
        <cylinderGeometry args={[legRadius, legRadius, legLength - 0.001, 8]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Glow effect when on */}
      {isOn && (
        <mesh ref={glowRef} position={[0, bodyHeight / 4, 0]}>
          <sphereGeometry args={[bodyRadius * 2, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.15 * brightness}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Point light when on */}
      {isOn && (
        <pointLight
          color={color}
          intensity={brightness * 0.3}
          distance={0.1}
          decay={2}
          position={[0, bodyHeight / 2, 0]}
        />
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[bodyRadius + 0.001, bodyRadius + 0.0015, 32]} />
          <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Pins */}
      <Pin
        id={`${id}_pin_anode`}
        position={[0.0008, -bodyHeight / 2 - legLength, 0]}
        radius={0.0005}
        color="#ffcc00"
      />
      <Pin
        id={`${id}_pin_cathode`}
        position={[-0.0008, -bodyHeight / 2 - (legLength - 0.0005), 0]}
        radius={0.0005}
        color="#ffcc00"
      />
    </group>
  );
}
