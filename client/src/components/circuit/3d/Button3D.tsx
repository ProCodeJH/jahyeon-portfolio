/**
 * 3D Push Button Component
 * Realistic tactile push button
 */

interface Button3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  isPressed?: boolean;
}

export function Button3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isPressed = false,
}: Button3DProps) {
  const buttonHeight = isPressed ? 0.08 : 0.12;

  return (
    <group position={position} rotation={rotation}>
      {/* Button Base (black plastic) */}
      <mesh castShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[0.4, 0.16, 0.4]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Button Cap (red/gray) */}
      <mesh castShadow position={[0, 0.16 + buttonHeight / 2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, buttonHeight, 16]} />
        <meshStandardMaterial
          color={isPressed ? '#dc2626' : '#4b5563'}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Pins (4 corners) */}
      {[
        [-0.15, -0.15],
        [0.15, -0.15],
        [-0.15, 0.15],
        [0.15, 0.15],
      ].map(([x, z], i) => (
        <mesh key={`pin-${i}`} position={[x, -0.1, z]}>
          <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Metal contacts (visible on sides) */}
      <mesh position={[0.21, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>

      <mesh position={[-0.21, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}
