/**
 * 3D Wire Component
 * Curved wire connecting pins with realistic appearance
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import type { Wire } from '@/lib/circuit-types';

interface Wire3DProps {
  wire: Wire;
}

export function Wire3D({ wire }: Wire3DProps) {
  // Create curved wire path using CatmullRomCurve3
  const wirePath = useMemo(() => {
    if (!wire.points || wire.points.length < 2) return null;

    // Convert 2D points to 3D with natural curve
    const points3D = wire.points.map((p, i) => {
      const x = p.x / 100; // Scale to cm
      const z = p.y / 100;

      // Add natural arc to wire (higher in the middle)
      const arcHeight = i === 0 || i === wire.points.length - 1 ? 0.1 : 0.3;

      return new THREE.Vector3(x, arcHeight, z);
    });

    // Add intermediate points for smoother curve
    if (points3D.length === 2) {
      const start = points3D[0];
      const end = points3D[1];
      const mid = new THREE.Vector3(
        (start.x + end.x) / 2,
        0.4, // Higher arc for single segment
        (start.z + end.z) / 2
      );
      points3D.splice(1, 0, mid);
    }

    return new THREE.CatmullRomCurve3(points3D, false, 'catmullrom', 0.3);
  }, [wire.points]);

  const tubeGeometry = useMemo(() => {
    if (!wirePath) return null;
    return new THREE.TubeGeometry(wirePath, 32, 0.02, 8, false);
  }, [wirePath]);

  if (!wirePath || !tubeGeometry) return null;

  // Wire color
  const wireColor = wire.color || '#ff0000';

  return (
    <mesh geometry={tubeGeometry} castShadow>
      <meshStandardMaterial
        color={wireColor}
        roughness={0.4}
        metalness={0.6}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}
