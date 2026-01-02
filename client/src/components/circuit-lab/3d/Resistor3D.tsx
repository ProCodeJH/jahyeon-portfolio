import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface Resistor3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  value: number; // Ohms
  onClick?: () => void;
  isSelected?: boolean;
}

// Color code for resistor bands
const colorCodes: Record<number, string> = {
  0: '#000000', // Black
  1: '#8B4513', // Brown
  2: '#FF0000', // Red
  3: '#FFA500', // Orange
  4: '#FFFF00', // Yellow
  5: '#00FF00', // Green
  6: '#0000FF', // Blue
  7: '#EE82EE', // Violet
  8: '#808080', // Gray
  9: '#FFFFFF', // White
};

const multiplierColors: Record<number, string> = {
  1: '#000000',      // Black (x1)
  10: '#8B4513',     // Brown (x10)
  100: '#FF0000',    // Red (x100)
  1000: '#FFA500',   // Orange (x1k)
  10000: '#FFFF00',  // Yellow (x10k)
  100000: '#00FF00', // Green (x100k)
  1000000: '#0000FF', // Blue (x1M)
  0.1: '#FFD700',    // Gold (x0.1)
  0.01: '#C0C0C0',   // Silver (x0.01)
};

const toleranceColors: Record<number, string> = {
  1: '#8B4513',   // Brown ±1%
  2: '#FF0000',   // Red ±2%
  5: '#FFD700',   // Gold ±5%
  10: '#C0C0C0',  // Silver ±10%
};

function getResistorBands(value: number): string[] {
  // Get significant digits and multiplier
  const str = value.toString();
  let digits: number[];
  let multiplier: number;

  if (value >= 100) {
    digits = [parseInt(str[0]), parseInt(str[1])];
    multiplier = Math.pow(10, str.length - 2);
  } else if (value >= 10) {
    digits = [parseInt(str[0]), parseInt(str[1])];
    multiplier = 1;
  } else {
    digits = [0, value];
    multiplier = 1;
  }

  const band1 = colorCodes[digits[0]] || '#000000';
  const band2 = colorCodes[digits[1]] || '#000000';
  const band3 = multiplierColors[multiplier] || '#000000';
  const band4 = toleranceColors[5]; // Default 5% tolerance (gold)

  return [band1, band2, band3, band4];
}

export function Resistor3D({
  position,
  rotation = [0, 0, 0],
  value,
  onClick,
  isSelected
}: Resistor3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Resistor dimensions (1/4W through-hole)
  const bodyLength = 0.065; // 6.5mm
  const bodyRadius = 0.012; // 2.4mm diameter
  const legLength = 0.025;
  const legRadius = 0.003;
  const bandWidth = 0.004;

  const bands = useMemo(() => getResistorBands(value), [value]);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={onClick}
    >
      {/* Main resistor body */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyLength, 16]} />
        <meshStandardMaterial
          color="#D2B48C"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* End caps */}
      <mesh position={[-bodyLength / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[bodyRadius + 0.001, bodyRadius + 0.001, 0.003, 16]} />
        <meshStandardMaterial color="#B8A07A" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[bodyLength / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[bodyRadius + 0.001, bodyRadius + 0.001, 0.003, 16]} />
        <meshStandardMaterial color="#B8A07A" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Color bands */}
      {bands.map((color, index) => {
        const xOffset = -bodyLength / 2 + 0.012 + index * 0.012;
        return (
          <mesh
            key={index}
            position={[xOffset, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[bodyRadius + 0.001, bodyRadius + 0.001, bandWidth, 16]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
          </mesh>
        );
      })}

      {/* Left leg */}
      <mesh position={[-bodyLength / 2 - legLength / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[legRadius, legRadius, legLength, 8]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Right leg */}
      <mesh position={[bodyLength / 2 + legLength / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[legRadius, legRadius, legLength, 8]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[bodyRadius + 0.005, bodyRadius + 0.005, bodyLength + 0.01, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
