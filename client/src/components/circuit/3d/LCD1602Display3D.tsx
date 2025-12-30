/**
 * 3D LCD 1602 Display (16x2 characters)
 * Professional I2C LCD module with backlight
 */

interface LCD1602Display3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  text?: string[];
  backlight?: boolean;
}

export function LCD1602Display3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  text = ['Arduino Circuit', 'Lab v1.0'],
  backlight = true,
}: LCD1602Display3DProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* PCB Base */}
      <mesh castShadow position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.16, 1.2]} />
        <meshStandardMaterial color="#0a5f73" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* LCD Module (Green PCB) */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[3.0, 0.3, 1.0]} />
        <meshStandardMaterial color="#28a745" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* LCD Glass (Display area) */}
      <mesh position={[0, 0.41, 0]}>
        <boxGeometry args={[2.6, 0.02, 0.7]} />
        <meshStandardMaterial
          color={backlight ? '#4fc3f7' : '#2c5f2d'}
          emissive={backlight ? '#4fc3f7' : '#000000'}
          emissiveIntensity={backlight ? 0.6 : 0}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Character grid (16x2) */}
      {backlight && (
        <mesh position={[0, 0.42, 0]}>
          <planeGeometry args={[2.5, 0.65]} />
          <meshBasicMaterial
            color="#1a1a1a"
            opacity={0.4}
            transparent
          />
        </mesh>
      )}

      {/* Display border (black bezel) */}
      {/* Top */}
      <mesh position={[0, 0.41, 0.36]}>
        <boxGeometry args={[2.7, 0.03, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, 0.41, -0.36]}>
        <boxGeometry args={[2.7, 0.03, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Left */}
      <mesh position={[-1.32, 0.41, 0]}>
        <boxGeometry args={[0.04, 0.03, 0.72]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Right */}
      <mesh position={[1.32, 0.41, 0]}>
        <boxGeometry args={[0.04, 0.03, 0.72]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* I2C Module (blue PCB on back) */}
      <mesh castShadow position={[0, 0.25, -0.6]}>
        <boxGeometry args={[0.8, 0.15, 0.4]} />
        <meshStandardMaterial color="#1e40af" roughness={0.5} />
      </mesh>

      {/* Potentiometer (contrast adjust) */}
      <group position={[0.9, 0.25, -0.6]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[0.02, 0.05, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* Pin Headers (16 pins) */}
      <group position={[-1.2, -0.15, 0]}>
        {Array.from({ length: 16 }).map((_, i) => (
          <mesh
            key={`pin-${i}`}
            position={[i * 0.1, 0, 0]}
          >
            <cylinderGeometry args={[0.013, 0.013, 0.35, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Backlight glow effect */}
      {backlight && (
        <pointLight
          position={[0, 0.45, 0]}
          color="#4fc3f7"
          intensity={1.5}
          distance={1.5}
        />
      )}

      {/* Simulate text display (simplified) */}
      {backlight && (
        <>
          {/* Line 1 */}
          <mesh position={[0, 0.43, 0.15]}>
            <planeGeometry args={[2.3, 0.2]} />
            <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
          </mesh>

          {/* Line 2 */}
          <mesh position={[0, 0.43, -0.15]}>
            <planeGeometry args={[2.3, 0.2]} />
            <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
          </mesh>
        </>
      )}

      {/* Mounting holes (4 corners) */}
      {[
        [-1.5, 0.5],
        [1.5, 0.5],
        [-1.5, -0.5],
        [1.5, -0.5],
      ].map(([x, z], i) => (
        <mesh key={`hole-${i}`} position={[x, 0.08, z]}>
          <cylinderGeometry args={[0.06, 0.06, 0.2, 12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}
