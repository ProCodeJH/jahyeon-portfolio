/**
 * CAD-Grade Orthographic Camera System
 *
 * ARCHITECTURE RULES:
 * - OrthographicCamera ONLY (no PerspectiveCamera)
 * - Zoom via orthographic frustum scaling
 * - Pan via camera position offset
 * - NO orbit rotation (fixed top-down or isometric view)
 */

import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCircuitLabStore } from '@/store/circuit-lab';

interface CADCameraProps {
  mode?: 'top-down' | 'isometric';
}

export function CADCamera({ mode = 'isometric' }: CADCameraProps) {
  const cameraRef = useRef<THREE.OrthographicCamera>(null);
  const { size, set } = useThree();

  const view = useCircuitLabStore(state => state.view);
  const setZoom = useCircuitLabStore(state => state.setZoom);
  const pan = useCircuitLabStore(state => state.pan);

  // Aspect ratio
  const aspect = size.width / size.height;

  // Base frustum size
  const frustumSize = 0.15;

  // Camera angle for isometric view
  const isometricAngle = Math.PI / 6; // 30 degrees

  // Update camera frustum when zoom changes
  useEffect(() => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    const zoomedFrustum = frustumSize / view.zoom;

    camera.left = -zoomedFrustum * aspect;
    camera.right = zoomedFrustum * aspect;
    camera.top = zoomedFrustum;
    camera.bottom = -zoomedFrustum;

    camera.updateProjectionMatrix();
  }, [view.zoom, aspect]);

  // Update camera position for pan
  useEffect(() => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;

    if (mode === 'top-down') {
      camera.position.set(view.centerX, 0.3, view.centerY);
      camera.lookAt(view.centerX, 0, view.centerY);
    } else {
      // Isometric view
      const distance = 0.2;
      camera.position.set(
        view.centerX + distance,
        distance,
        view.centerY + distance
      );
      camera.lookAt(view.centerX, 0, view.centerY);
    }
  }, [view.centerX, view.centerY, mode]);

  // Set as default camera
  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current });
    }
  }, [set]);

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(view.zoom * zoomFactor);
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, [view.zoom, setZoom]);

  // Middle mouse drag for pan
  useEffect(() => {
    let isPanning = false;
    let lastX = 0;
    let lastY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) { // Middle mouse
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
        e.preventDefault();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;

      const deltaX = (e.clientX - lastX) * 0.0001 / view.zoom;
      const deltaY = (e.clientY - lastY) * 0.0001 / view.zoom;

      pan(-deltaX, deltaY);

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        isPanning = false;
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [view.zoom, pan]);

  return (
    <orthographicCamera
      ref={cameraRef}
      position={mode === 'top-down' ? [0, 0.3, 0] : [0.2, 0.2, 0.2]}
      near={0.001}
      far={10}
      left={-frustumSize * aspect}
      right={frustumSize * aspect}
      top={frustumSize}
      bottom={-frustumSize}
    />
  );
}

// ============================================
// CAD GRID SYSTEM
// ============================================

interface CADGridProps {
  size?: number;
  divisions?: number;
  showMajor?: boolean;
  showMinor?: boolean;
}

export function CADGrid({
  size = 0.5,
  divisions = 100,
  showMajor = true,
  showMinor = true,
}: CADGridProps) {
  const view = useCircuitLabStore(state => state.view);

  if (!view.showGrid) return null;

  const gridUnit = 0.00254; // 2.54mm
  const majorSpacing = gridUnit * 10; // Every 10 grid units
  const minorSpacing = gridUnit;

  return (
    <group name="cad-grid">
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.0001, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* Minor grid (2.54mm spacing) */}
      {showMinor && (
        <gridHelper
          args={[size, Math.floor(size / minorSpacing), '#252540', '#252540']}
          position={[0, 0.0001, 0]}
        />
      )}

      {/* Major grid (25.4mm spacing) */}
      {showMajor && (
        <gridHelper
          args={[size, Math.floor(size / majorSpacing), '#404060', '#353550']}
          position={[0, 0.0002, 0]}
        />
      )}

      {/* Origin marker */}
      <group position={[0, 0.0003, 0]}>
        {/* X axis (red) */}
        <mesh position={[0.01, 0, 0]}>
          <boxGeometry args={[0.02, 0.0005, 0.001]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* Z axis (blue) */}
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[0.001, 0.0005, 0.02]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>

        {/* Origin point */}
        <mesh>
          <sphereGeometry args={[0.001, 8, 8]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>
    </group>
  );
}

// ============================================
// PLACEMENT PREVIEW
// ============================================

export function PlacementPreview() {
  const view = useCircuitLabStore(state => state.view);

  if (!view.placementType || !view.placementPreview) return null;

  const gridUnit = 0.00254;
  const position = [
    view.placementPreview.gridX * gridUnit,
    0.005,
    view.placementPreview.gridZ * gridUnit,
  ] as [number, number, number];

  // Get preview size based on component type
  const getSizeForType = (type: string): [number, number] => {
    const sizes: Record<string, [number, number]> = {
      arduino_uno: [0.07, 0.055],
      breadboard_half: [0.085, 0.057],
      breadboard_mini: [0.048, 0.037],
      led_red: [0.008, 0.008],
      led_green: [0.008, 0.008],
      led_blue: [0.008, 0.008],
      led_yellow: [0.008, 0.008],
      led_white: [0.008, 0.008],
      resistor: [0.015, 0.004],
      button: [0.008, 0.008],
      ultrasonic: [0.047, 0.022],
      dht22: [0.017, 0.027],
    };
    return sizes[type] || [0.01, 0.01];
  };

  const [width, depth] = getSizeForType(view.placementType);

  return (
    <group position={position}>
      {/* Ghost outline */}
      <mesh>
        <boxGeometry args={[width, 0.002, depth]} />
        <meshBasicMaterial
          color="#22c55e"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, 0.002, depth)]} />
        <lineBasicMaterial color="#22c55e" linewidth={2} />
      </lineSegments>
    </group>
  );
}

// ============================================
// SNAP INDICATOR
// ============================================

export function SnapIndicator() {
  const view = useCircuitLabStore(state => state.view);

  if (!view.gridSnap || !view.placementPreview) return null;

  const gridUnit = 0.00254;

  return (
    <mesh
      position={[
        view.placementPreview.gridX * gridUnit,
        0.001,
        view.placementPreview.gridZ * gridUnit,
      ]}
    >
      <ringGeometry args={[0.002, 0.003, 16]} />
      <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
    </mesh>
  );
}
