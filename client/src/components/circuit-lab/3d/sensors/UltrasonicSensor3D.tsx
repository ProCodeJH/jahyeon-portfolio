/**
 * HC-SR04 Ultrasonic Distance Sensor 3D Component
 * Realistic 3D model of popular ultrasonic sensor module
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface UltrasonicSensor3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  distance?: number; // cm (2-400)
  isActive?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

export function UltrasonicSensor3D({
  position,
  rotation = [0, 0, 0],
  distance = 100,
  isActive = false,
  onClick,
  isSelected,
}: UltrasonicSensor3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftTransducerRef = useRef<THREE.Mesh>(null);
  const rightTransducerRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  // HC-SR04 dimensions (scaled to scene units)
  const pcbWidth = 0.045;
  const pcbHeight = 0.02;
  const pcbDepth = 0.002;
  const transducerRadius = 0.008;
  const transducerHeight = 0.012;
  const transducerSpacing = 0.026;
  const pinLength = 0.006;
  const pinRadius = 0.0003;
  const pinSpacing = 0.00254; // 2.54mm

  // Map distance to indicator
  const distanceNormalized = useMemo(() => {
    return Math.min(1, Math.max(0, (distance - 2) / 398));
  }, [distance]);

  // Animate transducers and pulse wave
  useFrame((state) => {
    if (isActive) {
      // Vibrate transducers
      if (leftTransducerRef.current) {
        leftTransducerRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 80) * 0.02;
      }
      if (rightTransducerRef.current) {
        rightTransducerRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 80 + Math.PI) * 0.02;
      }

      // Pulse wave animation
      if (pulseRef.current) {
        const pulseTime = (state.clock.elapsedTime * 2) % 1;
        pulseRef.current.scale.setScalar(1 + pulseTime * 5);
        (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 * (1 - pulseTime);
      }
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
      {/* PCB Board */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[pcbWidth, pcbDepth, pcbHeight]} />
        <meshStandardMaterial
          color="#1e90ff"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* White silkscreen markings */}
      <mesh position={[0, pcbDepth / 2 + 0.0001, -pcbHeight * 0.35]}>
        <planeGeometry args={[pcbWidth * 0.8, pcbHeight * 0.15]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>

      {/* Left Transducer (Transmitter) */}
      <group position={[-transducerSpacing / 2, pcbDepth / 2, 0]}>
        <mesh ref={leftTransducerRef}>
          <cylinderGeometry args={[transducerRadius, transducerRadius, transducerHeight, 32]} />
          <meshStandardMaterial
            color="#c0c0c0"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>
        {/* Transducer mesh pattern */}
        <mesh position={[0, transducerHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[transducerRadius * 0.9, 32]} />
          <meshStandardMaterial
            color="#333333"
            roughness={0.6}
            metalness={0.3}
          />
        </mesh>
        {/* Mesh grid pattern */}
        {[...Array(4)].map((_, i) => (
          <mesh key={`h${i}`} position={[0, transducerHeight / 2 + 0.0001, 0]} rotation={[-Math.PI / 2, 0, (i * Math.PI) / 4]}>
            <planeGeometry args={[transducerRadius * 1.6, 0.0003]} />
            <meshBasicMaterial color="#666666" />
          </mesh>
        ))}
        {/* TX label */}
        <mesh position={[0, -transducerHeight / 2 - 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.002, 16]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>

      {/* Right Transducer (Receiver) */}
      <group position={[transducerSpacing / 2, pcbDepth / 2, 0]}>
        <mesh ref={rightTransducerRef}>
          <cylinderGeometry args={[transducerRadius, transducerRadius, transducerHeight, 32]} />
          <meshStandardMaterial
            color="#c0c0c0"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>
        {/* Transducer mesh pattern */}
        <mesh position={[0, transducerHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[transducerRadius * 0.9, 32]} />
          <meshStandardMaterial
            color="#333333"
            roughness={0.6}
            metalness={0.3}
          />
        </mesh>
        {/* Mesh grid pattern */}
        {[...Array(4)].map((_, i) => (
          <mesh key={`h${i}`} position={[0, transducerHeight / 2 + 0.0001, 0]} rotation={[-Math.PI / 2, 0, (i * Math.PI) / 4]}>
            <planeGeometry args={[transducerRadius * 1.6, 0.0003]} />
            <meshBasicMaterial color="#666666" />
          </mesh>
        ))}
        {/* RX label */}
        <mesh position={[0, -transducerHeight / 2 - 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.002, 16]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
      </group>

      {/* Crystal oscillator (between transducers) */}
      <mesh position={[0, pcbDepth / 2 + 0.001, -pcbHeight * 0.2]}>
        <boxGeometry args={[0.005, 0.002, 0.003]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Pins header (4 pins: VCC, Trig, Echo, GND) */}
      {['VCC', 'Trig', 'Echo', 'GND'].map((label, i) => {
        const x = (i - 1.5) * pinSpacing;
        const pinColor = label === 'VCC' ? '#ef4444' : label === 'GND' ? '#333333' : '#fbbf24';
        return (
          <group key={label} position={[x, -pinLength / 2, -pcbHeight / 2 + 0.002]}>
            <mesh>
              <cylinderGeometry args={[pinRadius, pinRadius, pinLength, 8]} />
              <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.9} />
            </mesh>
            {/* Pin label indicator */}
            <mesh position={[0, -pinLength / 2 - 0.001, 0]}>
              <sphereGeometry args={[pinRadius * 2, 8, 8]} />
              <meshStandardMaterial color={pinColor} emissive={pinColor} emissiveIntensity={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* Ultrasonic pulse wave (when active) */}
      {isActive && (
        <mesh ref={pulseRef} position={[0, transducerHeight + pcbDepth, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[transducerRadius, transducerRadius * 1.5, 32]} />
          <meshBasicMaterial
            color="#22c55e"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Distance indicator (virtual) */}
      <group position={[0, transducerHeight + pcbDepth + 0.01, 0]}>
        <mesh>
          <boxGeometry args={[pcbWidth * 0.8, 0.001, 0.002]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[(distanceNormalized - 0.5) * pcbWidth * 0.4, 0.0001, 0]}>
          <boxGeometry args={[distanceNormalized * pcbWidth * 0.8, 0.0008, 0.0018]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[pcbWidth + 0.004, pcbDepth + 0.002, pcbHeight + 0.004]} />
          <meshBasicMaterial color="#00ff00" wireframe />
        </mesh>
      )}
    </group>
  );
}

export default UltrasonicSensor3D;
