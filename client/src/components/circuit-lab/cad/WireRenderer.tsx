/**
 * CAD-Grade Wire Rendering System
 *
 * ARCHITECTURE RULES:
 * - Wires rendered as Line2 for thickness control
 * - Wire routing follows grid
 * - Connection points from component pin data
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useCircuitLabStore, WireData, GRID_UNIT } from '@/store/circuitLabStore';

// ============================================
// SINGLE WIRE COMPONENT
// ============================================

interface WireProps {
  wire: WireData;
}

function Wire({ wire }: WireProps) {
  const getPinWorldPosition = useCircuitLabStore(state => state.getPinWorldPosition);
  const selectComponent = useCircuitLabStore(state => state.selectComponent);

  // Get start and end positions from component pins
  const startPos = getPinWorldPosition(wire.startComponentId, wire.startPinId);
  const endPos = getPinWorldPosition(wire.endComponentId, wire.endPinId);

  if (!startPos || !endPos) return null;

  // Calculate wire path with orthogonal routing
  const points = useMemo(() => {
    const start = new THREE.Vector3(...startPos);
    const end = new THREE.Vector3(...endPos);

    // Lift wire above components
    const wireHeight = 0.015;
    const liftedStart = start.clone();
    liftedStart.y = wireHeight;
    const liftedEnd = end.clone();
    liftedEnd.y = wireHeight;

    // Simple L-shaped routing
    const midPoint = new THREE.Vector3(
      liftedEnd.x,
      wireHeight,
      liftedStart.z
    );

    return [
      [start.x, start.y + 0.003, start.z] as [number, number, number],
      [liftedStart.x, liftedStart.y, liftedStart.z] as [number, number, number],
      [midPoint.x, midPoint.y, midPoint.z] as [number, number, number],
      [liftedEnd.x, liftedEnd.y, liftedEnd.z] as [number, number, number],
      [end.x, end.y + 0.003, end.z] as [number, number, number],
    ];
  }, [startPos, endPos]);

  // Wire color with signal state indication
  const wireColor = useMemo(() => {
    if (wire.isSelected) return '#3b82f6';
    if (wire.isCarryingSignal) {
      return wire.signalValue === 'HIGH' ? '#22c55e' : '#ef4444';
    }
    return wire.color;
  }, [wire.color, wire.isSelected, wire.isCarryingSignal, wire.signalValue]);

  return (
    <group onClick={() => selectComponent(wire.id)}>
      <Line
        points={points}
        color={wireColor}
        lineWidth={wire.isSelected ? 3 : 2}
      />

      {/* Connection endpoints */}
      <mesh position={startPos}>
        <sphereGeometry args={[0.001, 8, 8]} />
        <meshStandardMaterial color={wire.color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={endPos}>
        <sphereGeometry args={[0.001, 8, 8]} />
        <meshStandardMaterial color={wire.color} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ============================================
// WIRING PREVIEW (During wire creation)
// ============================================

export function WiringPreview() {
  const wiringFrom = useCircuitLabStore(state => state.wiringFrom);
  const getPinWorldPosition = useCircuitLabStore(state => state.getPinWorldPosition);

  if (!wiringFrom) return null;

  const startPos = getPinWorldPosition(wiringFrom.componentId, wiringFrom.pinId);
  if (!startPos) return null;

  // This would connect to mouse position in real implementation
  // For now, show indicator at start point
  return (
    <group>
      {/* Pulsing indicator at start pin */}
      <mesh position={startPos}>
        <sphereGeometry args={[0.002, 16, 16]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
      </mesh>

      {/* Animated ring */}
      <mesh position={[startPos[0], startPos[1] + 0.001, startPos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.003, 0.004, 16]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ============================================
// ALL WIRES RENDERER
// ============================================

export function WireRenderer() {
  const wires = useCircuitLabStore(state => Array.from(state.wires.values()));

  return (
    <group name="wires">
      {wires.map(wire => (
        <Wire key={wire.id} wire={wire} />
      ))}
      <WiringPreview />
    </group>
  );
}

// ============================================
// WIRE COLORS
// ============================================

export const WIRE_COLORS = [
  { name: 'Red', color: '#ef4444', use: 'VCC/5V' },
  { name: 'Black', color: '#1f2937', use: 'GND' },
  { name: 'Yellow', color: '#eab308', use: 'Signal' },
  { name: 'Green', color: '#22c55e', use: 'Signal' },
  { name: 'Blue', color: '#3b82f6', use: 'Signal' },
  { name: 'Orange', color: '#f97316', use: 'Signal' },
  { name: 'White', color: '#f8fafc', use: 'Signal' },
  { name: 'Purple', color: '#a855f7', use: 'Signal' },
];
