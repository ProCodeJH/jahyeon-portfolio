/**
 * 3D HC-SR04 Ultrasonic Distance Sensor
 * Professional model with accurate dimensions
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

interface UltrasonicSensor3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  distance?: number; // Distance in cm (0-400)
  isActive?: boolean;
}

export function UltrasonicSensor3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  distance = 100,
  isActive = false,
}: UltrasonicSensor3DProps) {
  const triggerRef = useRef<Mesh>(null);
  const echoRef = useRef<Mesh>(null);

  // Animate ultrasonic pulse
  useFrame((state) => {
    if (isActive && triggerRef.current && echoRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 5);
      if (pulse > 0.9) {
        (triggerRef.current.material as any).emissiveIntensity = 0.5;
        (echoRef.current.material as any).emissiveIntensity = 0.5;
      } else {
        (triggerRef.current.material as any).emissiveIntensity = 0.1;
        (echoRef.current.material as any).emissiveIntensity = 0.1;
      }
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* PCB Base */}
      <mesh castShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[1.8, 0.16, 0.8]} />
        <meshStandardMaterial color="#0a5f73" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Ultrasonic Transducers (2 cylindrical speakers) */}
      {/* Transmitter (TX) */}
      <group position={[-0.5, 0.25, 0]}>
        {/* Silver cylinder */}
        <mesh ref={triggerRef} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.35, 32]} />
          <meshStandardMaterial
            color="#c0c0c0"
            emissive="#4fc3f7"
            emissiveIntensity={isActive ? 0.3 : 0.05}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        {/* Mesh pattern (simplified) */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.02, 32]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.02, 32]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
        </mesh>
      </group>

      {/* Receiver (RX) */}
      <group position={[0.5, 0.25, 0]}>
        <mesh ref={echoRef} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.35, 32]} />
          <meshStandardMaterial
            color="#c0c0c0"
            emissive="#4fc3f7"
            emissiveIntensity={isActive ? 0.3 : 0.05}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.02, 32]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.02, 32]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
        </mesh>
      </group>

      {/* Crystal Oscillator */}
      <mesh castShadow position={[0, 0.2, 0.25]}>
        <boxGeometry args={[0.15, 0.2, 0.1]} />
        <meshStandardMaterial color="#8b8b8b" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* IC Chip */}
      <mesh castShadow position={[0, 0.15, -0.2]}>
        <boxGeometry args={[0.3, 0.12, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>

      {/* Pins (4) */}
      <group position={[0, -0.15, -0.35]}>
        {/* VCC */}
        <group position={[-0.45, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.1, 0.05]} />
            <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
          </mesh>
        </group>

        {/* TRIG */}
        <group position={[-0.15, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* ECHO */}
        <group position={[0.15, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* GND */}
        <group position={[0.45, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Label: HC-SR04 */}
      <mesh position={[0, 0.17, -0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.15]} />
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </mesh>

      {/* Ultrasonic beam visualization (when active) */}
      {isActive && (
        <mesh position={[0, 0.25, 0.8]}>
          <coneGeometry args={[0.3, 1.0, 16, 1, true]} />
          <meshBasicMaterial
            color="#4fc3f7"
            transparent
            opacity={0.15}
            side={2}
          />
        </mesh>
      )}
    </group>
  );
}
