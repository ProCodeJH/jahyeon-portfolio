/**
 * Wires 3D Component
 * React wrapper for GPU Instanced Wire Renderer
 */

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { WireRenderer } from '@circuit-sim/render/WireRenderer';
import type { Wire, WireState } from '@circuit-sim/kernel/contracts';

interface Wires3DProps {
  wires: Wire[];
  wireStates: Map<string, WireState>;
  flowSpeed?: number;
}

export function Wires3D({ wires, wireStates, flowSpeed = 2.0 }: Wires3DProps) {
  const { scene } = useThree();
  const rendererRef = useRef<WireRenderer | null>(null);
  const prevWiresRef = useRef<Set<string>>(new Set());

  // Initialize renderer
  useEffect(() => {
    if (!rendererRef.current) {
      rendererRef.current = new WireRenderer(scene, 1000);
      rendererRef.current.setFlowSpeed(flowSpeed);
    }

    return () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, [scene]);

  // Update flow speed
  useEffect(() => {
    rendererRef.current?.setFlowSpeed(flowSpeed);
  }, [flowSpeed]);

  // Update wires
  useEffect(() => {
    if (!rendererRef.current) return;

    const currentWireIds = new Set(wires.map(w => w.id));
    const prevWireIds = prevWiresRef.current;

    // Remove deleted wires
    for (const prevId of prevWireIds) {
      if (!currentWireIds.has(prevId)) {
        rendererRef.current.removeWire(prevId);
      }
    }

    // Add/update wires
    for (const wire of wires) {
      const state = wireStates.get(wire.id) || {
        flow: 'glow',
        voltage: 0,
        current: 0,
      };

      rendererRef.current.addWire(wire, state);
    }

    prevWiresRef.current = currentWireIds;
  }, [wires, wireStates]);

  // Animation loop
  useFrame(() => {
    rendererRef.current?.update();
  });

  return null; // Renderer manages its own mesh
}
