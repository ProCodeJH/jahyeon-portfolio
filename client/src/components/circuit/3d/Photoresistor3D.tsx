/**
 * 3D Photoresistor (LDR) Component
 * Realistic light-dependent resistor
 */

interface Photoresistor3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  lightLevel?: number;
}

export function Photoresistor3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  lightLevel = 500,
}: Photoresistor3DProps) {
  // Calculate visual brightness based on light level (400-700 range)
  const brightness = Math.min(1, (lightLevel - 400) / 300);

  return (
    <group position={position} rotation={rotation}>
      {/* LDR Body */}
      <mesh castShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
        <meshStandardMaterial color="#8b4513" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Photosensitive Surface */}
      <mesh position={[0, 0.31, 0]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={brightness * 0.6}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Zigzag pattern on surface (simplified) */}
      <mesh position={[0, 0.32, 0]}>
        <torusGeometry args={[0.06, 0.005, 8, 16]} />
        <meshStandardMaterial color="#ffd700" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Left Lead */}
      <mesh position={[-0.05, -0.1, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.5, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Right Lead */}
      <mesh position={[0.05, -0.1, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.5, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Light glow when bright */}
      {brightness > 0.5 && (
        <pointLight
          position={[0, 0.35, 0]}
          color="#ffff00"
          intensity={brightness * 0.8}
          distance={0.5}
        />
      )}
    </group>
  );
}
