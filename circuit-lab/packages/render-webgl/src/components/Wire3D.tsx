/**
 * 3D Wire Component
 * Bezier curve-based wires with current flow animation
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Wire, Vector3D } from '@circuit-lab/sim-core';

interface Wire3DProps {
  wire: Wire;
  startPos: Vector3D;
  endPos: Vector3D;
  selected?: boolean;
  showFlow?: boolean;
  flowSpeed?: number;
  flowDirection?: 'forward' | 'backward' | 'none';
  voltage?: number;
  onClick?: () => void;
}

// Wire colors
const WIRE_COLORS: Record<string, THREE.Color> = {
  red: new THREE.Color(0xcc0000),
  black: new THREE.Color(0x1a1a1a),
  yellow: new THREE.Color(0xcccc00),
  green: new THREE.Color(0x00aa00),
  blue: new THREE.Color(0x0066cc),
  orange: new THREE.Color(0xff6600),
  white: new THREE.Color(0xeeeeee),
  purple: new THREE.Color(0x9900cc),
  brown: new THREE.Color(0x8b4513),
  gray: new THREE.Color(0x666666),
};

// Flow particle settings
const FLOW_PARTICLE_COUNT = 12;
const FLOW_PARTICLE_SIZE = 0.4;

export function Wire3D({
  wire,
  startPos,
  endPos,
  selected = false,
  showFlow = true,
  flowSpeed = 1,
  flowDirection = 'forward',
  voltage = 0,
  onClick,
}: Wire3DProps) {
  const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  const tubeRef = useRef<THREE.Mesh>(null);
  const flowParticlesRef = useRef<THREE.InstancedMesh>(null);
  const flowOffsets = useRef<Float32Array>(
    new Float32Array(FLOW_PARTICLE_COUNT)
  );

  const wireColor = WIRE_COLORS[wire.color] || WIRE_COLORS.red;
  const wireRadius = 0.4; // 0.8mm diameter wire

  // Initialize flow offsets
  useEffect(() => {
    for (let i = 0; i < FLOW_PARTICLE_COUNT; i++) {
      flowOffsets.current[i] = i / FLOW_PARTICLE_COUNT;
    }
  }, []);

  // Create bezier curve through control points
  const { curve, tubeGeometry } = useMemo(() => {
    const points: THREE.Vector3[] = [];

    // Start point
    points.push(new THREE.Vector3(startPos.x, startPos.y, startPos.z));

    // Calculate control points for a natural wire droop
    const midX = (startPos.x + endPos.x) / 2;
    const midY = (startPos.y + endPos.y) / 2;
    const midZ = Math.min(startPos.z, endPos.z);

    // Distance-based droop
    const distance = Math.sqrt(
      Math.pow(endPos.x - startPos.x, 2) +
        Math.pow(endPos.y - startPos.y, 2) +
        Math.pow(endPos.z - startPos.z, 2)
    );
    const droop = Math.min(distance * 0.15, 10); // Max 10mm droop

    // Add intermediate points for natural curve
    if (wire.points && wire.points.length > 0) {
      // Use provided control points
      for (const p of wire.points) {
        points.push(new THREE.Vector3(p.x, p.y, p.z));
      }
    } else {
      // Auto-generate control points
      // First control point (near start)
      points.push(
        new THREE.Vector3(
          startPos.x + (endPos.x - startPos.x) * 0.25,
          startPos.y + (endPos.y - startPos.y) * 0.25,
          startPos.z + 5 // Rise up first
        )
      );

      // Middle point with droop
      points.push(
        new THREE.Vector3(
          midX,
          midY,
          Math.max(startPos.z, endPos.z) + 8 - droop * 0.5
        )
      );

      // Second control point (near end)
      points.push(
        new THREE.Vector3(
          startPos.x + (endPos.x - startPos.x) * 0.75,
          startPos.y + (endPos.y - startPos.y) * 0.75,
          endPos.z + 5 // Come down to end
        )
      );
    }

    // End point
    points.push(new THREE.Vector3(endPos.x, endPos.y, endPos.z));

    // Create smooth curve through points
    const wireCurve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
    curveRef.current = wireCurve;

    // Create tube geometry along curve
    const tube = new THREE.TubeGeometry(wireCurve, 64, wireRadius, 12, false);

    return { curve: wireCurve, tubeGeometry: tube };
  }, [startPos, endPos, wire.points, wireRadius]);

  // Animate flow particles
  useFrame((state, delta) => {
    if (
      !showFlow ||
      !curveRef.current ||
      !flowParticlesRef.current ||
      flowDirection === 'none' ||
      voltage === 0
    ) {
      return;
    }

    const mesh = flowParticlesRef.current;
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);

    // Speed based on voltage
    const actualSpeed = flowSpeed * Math.abs(voltage) * 0.2;
    const direction = flowDirection === 'backward' ? -1 : 1;

    for (let i = 0; i < FLOW_PARTICLE_COUNT; i++) {
      // Update position along curve
      flowOffsets.current[i] += delta * actualSpeed * direction;

      // Wrap around
      if (flowOffsets.current[i] > 1) flowOffsets.current[i] -= 1;
      if (flowOffsets.current[i] < 0) flowOffsets.current[i] += 1;

      // Get position on curve
      const t = flowOffsets.current[i];
      curveRef.current.getPoint(t, position);

      // Get tangent for orientation
      const tangent = curveRef.current.getTangent(t);
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);

      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  // Flow particle material color based on voltage
  const flowColor = useMemo(() => {
    if (voltage > 0) return new THREE.Color(0x00ffff); // Cyan for positive
    if (voltage < 0) return new THREE.Color(0xff00ff); // Magenta for negative
    return new THREE.Color(0xffff00); // Yellow for neutral
  }, [voltage]);

  return (
    <group onClick={onClick}>
      {/* Wire tube */}
      <mesh ref={tubeRef} geometry={tubeGeometry}>
        <meshStandardMaterial
          color={wireColor}
          roughness={0.6}
          metalness={0.3}
          emissive={selected ? 0x004488 : 0x000000}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>

      {/* Wire end caps */}
      <mesh position={[startPos.x, startPos.y, startPos.z]}>
        <sphereGeometry args={[wireRadius * 1.2, 16, 16]} />
        <meshStandardMaterial
          color={0xcccccc}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[endPos.x, endPos.y, endPos.z]}>
        <sphereGeometry args={[wireRadius * 1.2, 16, 16]} />
        <meshStandardMaterial
          color={0xcccccc}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Flow particles */}
      {showFlow && voltage !== 0 && (
        <instancedMesh
          ref={flowParticlesRef}
          args={[undefined, undefined, FLOW_PARTICLE_COUNT]}
        >
          <sphereGeometry args={[FLOW_PARTICLE_SIZE, 8, 8]} />
          <meshBasicMaterial
            color={flowColor}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </instancedMesh>
      )}

      {/* Selection highlight */}
      {selected && (
        <mesh>
          <tubeGeometry
            args={[curve, 32, wireRadius + 0.3, 8, false]}
          />
          <meshBasicMaterial
            color={0x00aaff}
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Wire being drawn (preview)
 */
interface WirePreviewProps {
  startPos: Vector3D;
  currentPos: Vector3D;
  color?: string;
}

export function WirePreview({ startPos, currentPos, color = 'red' }: WirePreviewProps) {
  const wireColor = WIRE_COLORS[color] || WIRE_COLORS.red;

  const lineGeometry = useMemo(() => {
    const points = [
      new THREE.Vector3(startPos.x, startPos.y, startPos.z),
      new THREE.Vector3(
        startPos.x,
        startPos.y,
        startPos.z + 5
      ),
      new THREE.Vector3(
        currentPos.x,
        currentPos.y,
        currentPos.z + 5
      ),
      new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z),
    ];

    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
    return new THREE.TubeGeometry(curve, 32, 0.4, 8, false);
  }, [startPos, currentPos]);

  return (
    <mesh geometry={lineGeometry}>
      <meshBasicMaterial
        color={wireColor}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}
