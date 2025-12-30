/**
 * 3D DHT22 Temperature & Humidity Sensor
 * Professional AM2302 sensor model
 */

interface DHT22Sensor3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  temperature?: number;
  humidity?: number;
}

export function DHT22Sensor3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  temperature = 25,
  humidity = 60,
}: DHT22Sensor3DProps) {
  // Color intensity based on temperature (blue=cold, red=hot)
  const tempIntensity = Math.min(Math.max((temperature - 20) / 30, 0), 1);
  const sensorColor = tempIntensity > 0.5 ? '#ff6b6b' : '#4dabf7';

  return (
    <group position={position} rotation={rotation}>
      {/* Sensor Body (White plastic housing) */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.7]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Ventilation Grilles (front) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={`grille-${i}`}
          position={[0.26, 0.25 + (i - 2.5) * 0.08, 0]}
        >
          <boxGeometry args={[0.02, 0.04, 0.6]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
        </mesh>
      ))}

      {/* Sensor Element (inside, visible through grilles) */}
      <mesh position={[0.1, 0.25, 0]}>
        <boxGeometry args={[0.15, 0.35, 0.55]} />
        <meshStandardMaterial
          color={sensorColor}
          emissive={sensorColor}
          emissiveIntensity={0.2}
          roughness={0.5}
        />
      </mesh>

      {/* Capacitor */}
      <mesh castShadow position={[-0.15, 0.18, 0.15]}>
        <cylinderGeometry args={[0.06, 0.06, 0.15, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>

      {/* Resistor */}
      <mesh castShadow position={[-0.15, 0.18, -0.15]}>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 12]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} />
      </mesh>

      {/* Pins (4) */}
      <group position={[0, -0.15, 0.1]}>
        {/* Pin 1: VCC */}
        <group position={[0, 0, 0.2]}>
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Pin 2: DATA */}
        <group position={[0, 0, 0.067]}>
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Pin 3: NC */}
        <group position={[0, 0, -0.067]}>
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Pin 4: GND */}
        <group position={[0, 0, -0.2]}>
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Label */}
      <mesh position={[-0.26, 0.25, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.6, 0.3]} />
        <meshStandardMaterial color="#3b82f6" opacity={0.9} transparent />
      </mesh>

      {/* "DHT22" Text */}
      <mesh position={[-0.27, 0.3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.35, 0.12]} />
        <meshStandardMaterial color="#ffffff" opacity={0.95} transparent />
      </mesh>

      {/* Temperature indicator (when hot) */}
      {temperature > 30 && (
        <pointLight
          position={[0.3, 0.25, 0]}
          color="#ff6b6b"
          intensity={0.3}
          distance={0.5}
        />
      )}
    </group>
  );
}
