/**
 * TMP36 Temperature Sensor 3D Component
 * Realistic 3D model of TMP36 analog temperature sensor
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TemperatureSensor3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  temperature?: number; // Celsius (-40 to 125)
  onClick?: () => void;
  isSelected?: boolean;
}

export function TemperatureSensor3D({
  position,
  rotation = [0, 0, 0],
  temperature = 25,
  onClick,
  isSelected,
}: TemperatureSensor3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const indicatorRef = useRef<THREE.Mesh>(null);

  // TMP36 dimensions (TO-92 package, scaled to scene units)
  const bodyWidth = 0.0045;
  const bodyHeight = 0.0045;
  const bodyDepth = 0.003;
  const legLength = 0.004;
  const legRadius = 0.00025;
  const legSpacing = 0.00127; // 1.27mm typical spacing

  // Map temperature to indicator color
  const indicatorColor = useMemo(() => {
    const normalized = (temperature + 40) / 165; // -40 to 125 mapped to 0-1
    const hue = (1 - normalized) * 240; // Blue (cold) to Red (hot)
    return new THREE.Color().setHSL(hue / 360, 0.8, 0.5);
  }, [temperature]);

  // Animate indicator glow
  useFrame((state) => {
    if (indicatorRef.current) {
      const material = indicatorRef.current.material as THREE.MeshStandardMaterial;
      const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2);
      material.emissiveIntensity = 0.3 + pulse * 0.2;
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
      {/* Main body - TO-92 package (semi-circular cross-section) */}
      <mesh position={[0, bodyHeight / 2, 0]}>
        <cylinderGeometry args={[bodyDepth / 2, bodyDepth / 2, bodyHeight, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.4}
          metalness={0}
        />
      </mesh>

      {/* Flat back of TO-92 */}
      <mesh position={[0, bodyHeight / 2, -bodyDepth / 4]} rotation={[0, 0, 0]}>
        <boxGeometry args={[bodyWidth, bodyHeight, bodyDepth / 2]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.4}
          metalness={0}
        />
      </mesh>

      {/* Text marking (simulated with small indentation) */}
      <mesh position={[0, bodyHeight / 2, bodyDepth / 4 + 0.0001]}>
        <planeGeometry args={[bodyWidth * 0.8, bodyHeight * 0.3]} />
        <meshStandardMaterial
          color="#333333"
          roughness={0.6}
        />
      </mesh>

      {/* Temperature indicator (virtual, for visualization) */}
      <mesh ref={indicatorRef} position={[0, bodyHeight + 0.001, 0]}>
        <sphereGeometry args={[0.001, 16, 16]} />
        <meshStandardMaterial
          color={indicatorColor}
          emissive={indicatorColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Temperature label */}
      <group position={[0, bodyHeight + 0.003, 0]}>
        {/* This would show temperature value with Text from drei */}
      </group>

      {/* Pin 1 - Vout (middle pin in actual TO-92) */}
      <group position={[0, -legLength / 2, 0]}>
        <mesh>
          <cylinderGeometry args={[legRadius, legRadius, legLength, 8]} />
          <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Pin label indicator */}
        <mesh position={[0, -legLength / 2 - 0.0005, 0]}>
          <sphereGeometry args={[legRadius * 1.5, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Pin 2 - Vs+ */}
      <group position={[legSpacing, -legLength / 2, 0]}>
        <mesh>
          <cylinderGeometry args={[legRadius, legRadius, legLength, 8]} />
          <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Power indicator */}
        <mesh position={[0, -legLength / 2 - 0.0005, 0]}>
          <sphereGeometry args={[legRadius * 1.5, 8, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Pin 3 - GND */}
      <group position={[-legSpacing, -legLength / 2, 0]}>
        <mesh>
          <cylinderGeometry args={[legRadius, legRadius, legLength, 8]} />
          <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Ground indicator */}
        <mesh position={[0, -legLength / 2 - 0.0005, 0]}>
          <sphereGeometry args={[legRadius * 1.5, 8, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, bodyHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[bodyWidth * 0.8, bodyWidth * 0.9, 32]} />
          <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export default TemperatureSensor3D;
