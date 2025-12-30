/**
 * 3D Wire Component (Single Wire)
 * Curved wire with realistic appearance and flow visualization
 *
 * For bulk rendering (500+ wires), use Wires3D with GPU instancing instead
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Wire, WireState } from '@circuit-sim/kernel/contracts';
import {
  generateWireCurve,
  createWireTubeGeometry,
  getWireColorByVoltage,
  WIRE_COLORS,
} from '@circuit-sim/render/WireUtils';

interface Wire3DProps {
  wire: Wire;
  state?: WireState;
  animate?: boolean;
}

export function Wire3D({ wire, state, animate = true }: Wire3DProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Generate wire curve points
  const curvePoints = useMemo(() => {
    if (wire.points.length < 2) return [];

    return generateWireCurve(
      wire.points[0],
      wire.points[wire.points.length - 1],
      wire.points.slice(1, -1)
    );
  }, [wire.points]);

  // Create tube geometry
  const tubeGeometry = useMemo(() => {
    if (curvePoints.length < 2) return null;
    return createWireTubeGeometry(curvePoints, 0.02, 8);
  }, [curvePoints]);

  // Determine wire color
  const wireColor = useMemo(() => {
    if (wire.color) {
      return new THREE.Color(wire.color);
    }

    if (state?.flow === 'power' && state.voltage !== undefined) {
      return getWireColorByVoltage(state.voltage);
    }

    return new THREE.Color(WIRE_COLORS.CYAN);
  }, [wire.color, state?.flow, state?.voltage]);

  // Emissive intensity based on flow mode
  const emissiveIntensity = useMemo(() => {
    if (!state) return 0.2;

    switch (state.flow) {
      case 'pulse':
        return 0.8;
      case 'pwm':
        return 0.5;
      case 'glow':
        return 0.3;
      case 'power':
        return 0.4;
      default:
        return 0.1;
    }
  }, [state?.flow]);

  // Animation for flow modes
  useFrame(({ clock }) => {
    if (!materialRef.current || !animate || !state) return;

    const time = clock.getElapsedTime();

    switch (state.flow) {
      case 'glow':
        // Subtle pulse
        const glowPulse = 0.3 + 0.2 * Math.sin(time * 2);
        materialRef.current.emissiveIntensity = glowPulse;
        break;

      case 'pulse':
        // Fast pulse for digital edges
        const pulse = Math.abs(Math.sin(time * 5));
        materialRef.current.emissiveIntensity = 0.4 + pulse * 0.6;
        break;

      case 'pwm':
        // PWM duty cycle (simulated)
        const pwmCycle = (time * 490) % 1; // 490 Hz
        const duty = state.current || 0.5; // Use current as duty cycle
        materialRef.current.emissiveIntensity = pwmCycle < duty ? 0.8 : 0.2;
        break;

      case 'power':
        // Steady glow based on voltage
        materialRef.current.emissiveIntensity = (state.voltage / 5.0) * 0.5;
        break;

      default:
        materialRef.current.emissiveIntensity = 0.1;
    }
  });

  if (!tubeGeometry) return null;

  return (
    <mesh geometry={tubeGeometry} castShadow receiveShadow>
      <meshStandardMaterial
        ref={materialRef}
        color={wireColor}
        emissive={wireColor}
        emissiveIntensity={emissiveIntensity}
        roughness={0.4}
        metalness={0.6}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}
