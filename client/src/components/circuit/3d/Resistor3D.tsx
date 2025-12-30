/**
 * 3D Resistor Component
 * Realistic resistor with color bands
 */

interface Resistor3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  resistance?: number;
}

export function Resistor3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  resistance = 220,
}: Resistor3DProps) {
  // Get color bands for resistance value
  const getColorBands = (value: number) => {
    // Simplified color code for common values
    const colorMap: Record<number, string[]> = {
      220: ['#ff0000', '#ff0000', '#8b4513'], // Red, Red, Brown
      330: ['#ffa500', '#ffa500', '#8b4513'], // Orange, Orange, Brown
      1000: ['#8b4513', '#000000', '#ff0000'], // Brown, Black, Red
      10000: ['#8b4513', '#000000', '#ffa500'], // Brown, Black, Orange
    };

    return colorMap[value] || ['#ff0000', '#ff0000', '#8b4513'];
  };

  const bands = getColorBands(resistance);

  return (
    <group position={position} rotation={rotation}>
      {/* Resistor Body */}
      <mesh castShadow position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Color Bands */}
      <mesh position={[-0.12, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.062, 0.062, 0.03, 16]} />
        <meshStandardMaterial color={bands[0]} roughness={0.4} />
      </mesh>

      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.062, 0.062, 0.03, 16]} />
        <meshStandardMaterial color={bands[1]} roughness={0.4} />
      </mesh>

      <mesh position={[0.12, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.062, 0.062, 0.03, 16]} />
        <meshStandardMaterial color={bands[2]} roughness={0.4} />
      </mesh>

      {/* Left Lead */}
      <mesh position={[-0.25, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.15, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Right Lead */}
      <mesh position={[0.25, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.15, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}
