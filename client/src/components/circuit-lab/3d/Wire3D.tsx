import { useMemo } from 'react';
import * as THREE from 'three';

interface Wire3DProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  thickness?: number;
  onClick?: () => void;
  isSelected?: boolean;
}

export function Wire3D({
  start,
  end,
  color = '#FF0000',
  thickness = 0.001,
  onClick,
  isSelected
}: Wire3DProps) {
  const wireGeometry = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);

    // Calculate midpoint with slight arc for 3D effect
    const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    const distance = startVec.distanceTo(endVec);
    midPoint.y += distance * 0.15; // Slight arc up

    // Create curved path using QuadraticBezierCurve3
    const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);

    return new THREE.TubeGeometry(curve, 32, thickness, 8, false);
  }, [start, end, thickness]);

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Main wire */}
      <mesh geometry={wireGeometry}>
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Wire end caps (solder joints) */}
      <mesh position={start}>
        <sphereGeometry args={[thickness * 1.5, 16, 16]} />
        <meshStandardMaterial
          color="#C0C0C0"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[thickness * 1.5, 16, 16]} />
        <meshStandardMaterial
          color="#C0C0C0"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Selection highlight */}
      {isSelected && (
        <mesh geometry={wireGeometry}>
          <meshBasicMaterial
            color="#00ff00"
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
    </group>
  );
}
