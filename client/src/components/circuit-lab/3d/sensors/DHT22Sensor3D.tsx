/**
 * DHT22 Temperature & Humidity Sensor 3D Component
 * Ultra-realistic 3D model with animations and real-time data visualization
 * Enterprise-grade quality for professional Arduino simulators
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface DHT22Sensor3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  temperature?: number; // Celsius (-40 to 80)
  humidity?: number; // Percentage (0-100)
  isActive?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  showLabels?: boolean;
}

export function DHT22Sensor3D({
  position,
  rotation = [0, 0, 0],
  temperature = 25,
  humidity = 50,
  isActive = false,
  onClick,
  isSelected = false,
  showLabels = true,
}: DHT22Sensor3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  // DHT22 dimensions (scaled to scene units - realistic proportions)
  const bodyWidth = 0.025; // 25mm
  const bodyHeight = 0.0205; // 20.5mm
  const bodyDepth = 0.008; // 8mm
  const grillHeight = 0.015; // Grill section height
  const pinLength = 0.006;
  const pinRadius = 0.0003;
  const pinSpacing = 0.00254; // 2.54mm standard

  // Temperature to color mapping
  const temperatureColor = useMemo(() => {
    const normalized = Math.max(0, Math.min(1, (temperature + 40) / 120));
    // Blue (cold) -> Cyan -> Green -> Yellow -> Orange -> Red (hot)
    const hue = (1 - normalized) * 240;
    return new THREE.Color().setHSL(hue / 360, 0.9, 0.5);
  }, [temperature]);

  // Humidity to color mapping
  const humidityColor = useMemo(() => {
    const normalized = Math.max(0, Math.min(1, humidity / 100));
    // Light blue (dry) -> Deep blue (humid)
    return new THREE.Color().setHSL(0.55, 0.8, 0.7 - normalized * 0.4);
  }, [humidity]);

  // Animation for active state
  useFrame((state) => {
    if (isActive && glowRef.current) {
      const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 3);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + pulse * 0.15;
    }
    if (pulseRef.current && isActive) {
      const t = (state.clock.elapsedTime * 0.5) % 1;
      pulseRef.current.scale.setScalar(1 + t * 0.3);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - t);
    }
  });

  // Create grill lines pattern
  const grillLines = useMemo(() => {
    const lines = [];
    const numLines = 8;
    const lineWidth = bodyWidth * 0.7;
    const lineSpacing = grillHeight / (numLines + 1);

    for (let i = 0; i < numLines; i++) {
      lines.push({
        y: bodyHeight / 2 - (bodyDepth * 0.1) - lineSpacing * (i + 1),
        width: lineWidth,
      });
    }
    return lines;
  }, [bodyWidth, bodyHeight, bodyDepth, grillHeight]);

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
      {/* Main white plastic body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[bodyWidth, bodyHeight, bodyDepth]} />
        <meshStandardMaterial
          color="#f5f5f5"
          roughness={0.4}
          metalness={0}
        />
      </mesh>

      {/* Blue grill section on front */}
      <mesh position={[0, bodyHeight / 2 - grillHeight / 2 - 0.001, bodyDepth / 2 + 0.0001]}>
        <boxGeometry args={[bodyWidth * 0.85, grillHeight, 0.001]} />
        <meshStandardMaterial
          color="#0066cc"
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Grill horizontal lines */}
      {grillLines.map((line, i) => (
        <mesh
          key={i}
          position={[0, line.y - bodyHeight / 2 + grillHeight + 0.003, bodyDepth / 2 + 0.0005]}
        >
          <boxGeometry args={[line.width, 0.0008, 0.001]} />
          <meshStandardMaterial color="#003366" roughness={0.2} />
        </mesh>
      ))}

      {/* DHT22 label (white text on blue background) */}
      <mesh position={[0, -bodyHeight / 4, bodyDepth / 2 + 0.0003]}>
        <planeGeometry args={[bodyWidth * 0.6, bodyHeight * 0.12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>

      {/* Sensor window (humidity sensing area) */}
      <mesh position={[0, bodyHeight * 0.2, bodyDepth / 2 + 0.0002]}>
        <circleGeometry args={[0.003, 16]} />
        <meshStandardMaterial
          color="#004488"
          roughness={0.5}
          metalness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Internal sensor chip visible through grill */}
      <mesh position={[0, bodyHeight * 0.15, 0]}>
        <boxGeometry args={[0.006, 0.006, bodyDepth * 0.6]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Four pins (VCC, DATA, NC, GND) */}
      {[
        { name: 'VCC', x: -pinSpacing * 1.5, color: '#ef4444' },
        { name: 'DATA', x: -pinSpacing * 0.5, color: '#22c55e' },
        { name: 'NC', x: pinSpacing * 0.5, color: '#888888' },
        { name: 'GND', x: pinSpacing * 1.5, color: '#1a1a1a' },
      ].map((pin, i) => (
        <group key={pin.name} position={[pin.x, -bodyHeight / 2 - pinLength / 2, 0]}>
          {/* Pin body */}
          <mesh>
            <cylinderGeometry args={[pinRadius, pinRadius, pinLength, 8]} />
            <meshStandardMaterial
              color="#c0c0c0"
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
          {/* Pin tip indicator */}
          <mesh position={[0, -pinLength / 2 - 0.0005, 0]}>
            <sphereGeometry args={[pinRadius * 2, 8, 8]} />
            <meshStandardMaterial
              color={pin.color}
              emissive={pin.color}
              emissiveIntensity={isActive ? 0.5 : 0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Temperature indicator (virtual display) */}
      {isActive && (
        <group position={[bodyWidth / 2 + 0.008, bodyHeight * 0.2, 0]}>
          {/* Temperature bar background */}
          <mesh>
            <boxGeometry args={[0.003, bodyHeight * 0.6, 0.001]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          {/* Temperature bar fill */}
          <mesh position={[0, (temperature + 40) / 240 * bodyHeight * 0.6 - bodyHeight * 0.3, 0.0005]}>
            <boxGeometry args={[0.0025, Math.max(0.001, ((temperature + 40) / 120) * bodyHeight * 0.6), 0.001]} />
            <meshBasicMaterial color={temperatureColor} />
          </mesh>
        </group>
      )}

      {/* Humidity indicator (virtual display) */}
      {isActive && (
        <group position={[-bodyWidth / 2 - 0.008, bodyHeight * 0.2, 0]}>
          {/* Humidity bar background */}
          <mesh>
            <boxGeometry args={[0.003, bodyHeight * 0.6, 0.001]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          {/* Humidity bar fill */}
          <mesh position={[0, (humidity / 200) * bodyHeight * 0.6 - bodyHeight * 0.3, 0.0005]}>
            <boxGeometry args={[0.0025, Math.max(0.001, (humidity / 100) * bodyHeight * 0.6), 0.001]} />
            <meshBasicMaterial color={humidityColor} />
          </mesh>
        </group>
      )}

      {/* Active glow effect */}
      {isActive && (
        <mesh ref={glowRef} position={[0, 0, bodyDepth / 2 + 0.002]}>
          <planeGeometry args={[bodyWidth * 1.2, bodyHeight * 1.2]} />
          <meshBasicMaterial
            color="#00aaff"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Data transmission pulse effect */}
      {isActive && (
        <mesh ref={pulseRef} position={[-pinSpacing * 0.5, -bodyHeight / 2 - pinLength - 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.001, 0.002, 16]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[bodyWidth + 0.004, bodyHeight + 0.004, bodyDepth + 0.002]} />
          <meshBasicMaterial color="#00ff00" wireframe />
        </mesh>
      )}

      {/* Labels (HTML overlay) */}
      {showLabels && isActive && (
        <Html
          position={[0, bodyHeight / 2 + 0.008, 0]}
          center
          style={{
            fontSize: '8px',
            color: 'white',
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.7)',
            padding: '2px 4px',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {temperature.toFixed(1)}°C | {humidity.toFixed(0)}%
        </Html>
      )}
    </group>
  );
}

export default DHT22Sensor3D;
