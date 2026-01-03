/**
 * 3D Ultrasonic Sensor Component (HC-SR04)
 * Realistic ultrasonic distance sensor with animated waves
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Ultrasonic3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  distance?: number; // cm
  isActive?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export function Ultrasonic3D({
  position,
  rotation = [0, 0, 0],
  distance = 100,
  isActive = false,
  isSelected = false,
  onClick,
}: Ultrasonic3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wave1Ref = useRef<THREE.Mesh>(null);
  const wave2Ref = useRef<THREE.Mesh>(null);
  const wave3Ref = useRef<THREE.Mesh>(null);

  // Animate ultrasonic waves when active
  useFrame((state) => {
    if (isActive) {
      const time = state.clock.elapsedTime;

      [wave1Ref, wave2Ref, wave3Ref].forEach((ref, i) => {
        if (ref.current) {
          const offset = i * 0.3;
          const scale = 0.5 + ((time + offset) % 1) * 1.5;
          const opacity = 1 - ((time + offset) % 1);

          ref.current.scale.set(scale, scale, 1);
          (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.3;
        }
      });
    }
  });

  // Dimensions (HC-SR04)
  const bodyWidth = 0.045;
  const bodyHeight = 0.02;
  const bodyDepth = 0.015;
  const transducerRadius = 0.008;

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
      {/* PCB Board (blue) */}
      <mesh castShadow>
        <boxGeometry args={[bodyWidth, 0.0016, bodyDepth]} />
        <meshStandardMaterial color="#1e90ff" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Ultrasonic transducers (the two "eyes") */}
      {[-0.013, 0.013].map((x, i) => (
        <group key={i} position={[x, 0.0008 + transducerRadius / 2, 0]}>
          {/* Metal cylinder body */}
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[transducerRadius, transducerRadius, bodyHeight, 32]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Front mesh (gold colored) */}
          <mesh position={[0, 0, -bodyHeight / 2 - 0.0005]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[transducerRadius - 0.001, transducerRadius - 0.001, 0.001, 32]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Mesh pattern on front */}
          {Array.from({ length: 5 }).map((_, j) => (
            <mesh
              key={j}
              position={[0, 0, -bodyHeight / 2 - 0.001]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[j * 0.0015, j * 0.0015 + 0.0005, 16]} />
              <meshStandardMaterial color="#b8960a" side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Crystal between transducers */}
      <mesh position={[0, 0.003, 0]} castShadow>
        <boxGeometry args={[0.004, 0.002, 0.008]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Pin header */}
      <group position={[0, -0.0008, bodyDepth / 2 - 0.002]}>
        <mesh>
          <boxGeometry args={[0.012, 0.008, 0.0025]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Individual pins */}
        {[
          { label: 'VCC', x: -0.0038 },
          { label: 'TRIG', x: -0.0013 },
          { label: 'ECHO', x: 0.0013 },
          { label: 'GND', x: 0.0038 },
        ].map((pin, i) => (
          <group key={i} position={[pin.x, -0.006, 0]}>
            <mesh>
              <boxGeometry args={[0.0006, 0.008, 0.0006]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Labels on PCB */}
      <Html
        position={[0, 0.001, bodyDepth / 2 - 0.006]}
        center
        style={{
          fontSize: '1.5px',
          color: 'white',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        HC-SR04
      </Html>

      {/* Ultrasonic wave animation (when active) */}
      {isActive && (
        <group position={[0, 0.01, -0.015]}>
          {[wave1Ref, wave2Ref, wave3Ref].map((ref, i) => (
            <mesh key={i} ref={ref} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.015, 0.017, 32]} />
              <meshBasicMaterial
                color="#22c55e"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Distance display */}
      {isActive && (
        <Html
          position={[0, 0.025, 0]}
          center
          style={{
            fontSize: '4px',
            color: '#22c55e',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            pointerEvents: 'none',
            background: 'rgba(0,0,0,0.7)',
            padding: '2px 4px',
            borderRadius: '2px',
          }}
        >
          {distance.toFixed(1)} cm
        </Html>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -0.002, 0]}>
          <boxGeometry args={[bodyWidth + 0.004, 0.001, bodyDepth + 0.004]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
