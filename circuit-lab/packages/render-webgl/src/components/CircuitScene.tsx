/**
 * Main Circuit Scene Component
 * Manages all 3D circuit components and rendering
 */

import React, { useRef, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Grid,
  Html,
  useProgress,
} from '@react-three/drei';
import * as THREE from 'three';
import type { Component, Wire, ComponentType } from '@circuit-lab/sim-core';

import { Arduino3D } from './Arduino3D';
import { Breadboard3D } from './Breadboard3D';
import { Led3D, RgbLed3D } from './Led3D';
import { Resistor3D } from './Resistor3D';
import { Button3D } from './Button3D';
import { Wire3D, WirePreview } from './Wire3D';

interface CircuitSceneProps {
  components: Component[];
  wires: Wire[];
  selectedId?: string;
  onComponentSelect?: (id: string | null) => void;
  onPinClick?: (componentId: string, pinId: string) => void;
  wirePreview?: {
    startPos: { x: number; y: number; z: number };
    currentPos: { x: number; y: number; z: number };
    color: string;
  };
  showGrid?: boolean;
  showLabels?: boolean;
  showFlow?: boolean;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        color: '#fff',
        background: 'rgba(0,0,0,0.8)',
        padding: '20px 40px',
        borderRadius: '8px',
        fontSize: '14px',
      }}>
        Loading... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

function SceneContent({
  components,
  wires,
  selectedId,
  onComponentSelect,
  onPinClick,
  wirePreview,
  showGrid = true,
  showLabels = true,
  showFlow = true,
}: CircuitSceneProps) {
  const { camera } = useThree();

  // Get pin world position helper
  const getPinWorldPosition = useCallback(
    (componentId: string, pinId: string): THREE.Vector3 | null => {
      const component = components.find((c) => c.id === componentId);
      if (!component) return null;

      const pin = component.pins.find((p) => p.id === pinId);
      if (!pin) return null;

      // This would need to be calculated based on component type and pin name
      // For now, return component position as placeholder
      return new THREE.Vector3(
        component.transform.position.x,
        component.transform.position.y,
        component.transform.position.z
      );
    },
    [components]
  );

  // Render component based on type
  const renderComponent = useCallback(
    (component: Component) => {
      const isSelected = component.id === selectedId;
      const commonProps = {
        component,
        selected: isSelected,
        onClick: () => onComponentSelect?.(component.id),
        showLabels,
      };

      switch (component.type) {
        case 'arduino_uno':
          return (
            <Arduino3D
              key={component.id}
              {...commonProps}
              onPinClick={(pinId) => onPinClick?.(component.id, pinId)}
            />
          );
        case 'breadboard':
          return (
            <Breadboard3D
              key={component.id}
              {...commonProps}
              onHoleClick={(holeId) => onPinClick?.(component.id, holeId)}
            />
          );
        case 'led':
          return <Led3D key={component.id} {...commonProps} />;
        case 'rgb_led':
          return <RgbLed3D key={component.id} {...commonProps} />;
        case 'resistor':
          return <Resistor3D key={component.id} {...commonProps} />;
        case 'button':
          return <Button3D key={component.id} {...commonProps} />;
        default:
          return null;
      }
    },
    [selectedId, onComponentSelect, onPinClick, showLabels]
  );

  // Render wires
  const renderWires = useCallback(() => {
    return wires.map((wire) => {
      const startPos = getPinWorldPosition(wire.startPinId.split('_')[0], wire.startPinId);
      const endPos = getPinWorldPosition(wire.endPinId.split('_')[0], wire.endPinId);

      if (!startPos || !endPos) return null;

      return (
        <Wire3D
          key={wire.id}
          wire={wire}
          startPos={{ x: startPos.x, y: startPos.y, z: startPos.z }}
          endPos={{ x: endPos.x, y: endPos.y, z: endPos.z }}
          selected={wire.id === selectedId}
          showFlow={showFlow}
          voltage={5} // This would come from simulation
          onClick={() => onComponentSelect?.(wire.id)}
        />
      );
    });
  }, [wires, selectedId, onComponentSelect, getPinWorldPosition, showFlow]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 80, 50]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-30, 60, -30]} intensity={0.3} />
      <pointLight position={[0, 50, 0]} intensity={0.3} />

      {/* Environment for reflections */}
      <Environment preset="studio" />

      {/* Grid */}
      {showGrid && (
        <Grid
          position={[0, 0, -0.5]}
          args={[300, 300]}
          cellSize={2.54} // Match standard hole spacing
          cellThickness={0.5}
          cellColor={0x444444}
          sectionSize={25.4} // 1 inch sections
          sectionThickness={1}
          sectionColor={0x666666}
          fadeDistance={400}
          fadeStrength={1}
        />
      )}

      {/* Components */}
      {components.map(renderComponent)}

      {/* Wires */}
      {renderWires()}

      {/* Wire preview */}
      {wirePreview && (
        <WirePreview
          startPos={wirePreview.startPos}
          currentPos={wirePreview.currentPos}
          color={wirePreview.color}
        />
      )}

      {/* Click away to deselect */}
      <mesh
        position={[0, 0, -1]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => onComponentSelect?.(null)}
        visible={false}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

export function CircuitScene(props: CircuitSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1,
      }}
      style={{ background: '#1a1a2e' }}
    >
      <Suspense fallback={<Loader />}>
        <PerspectiveCamera
          makeDefault
          position={[100, 100, 150]}
          fov={45}
          near={0.1}
          far={2000}
        />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={20}
          maxDistance={500}
          maxPolarAngle={Math.PI / 2.1}
          target={[50, 30, 0]}
        />

        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}

/**
 * Thumbnail renderer for project previews
 */
interface ThumbnailRendererProps {
  components: Component[];
  wires: Wire[];
  width?: number;
  height?: number;
}

export function ThumbnailRenderer({
  components,
  wires,
  width = 400,
  height = 300,
}: ThumbnailRendererProps) {
  return (
    <Canvas
      dpr={1}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      style={{ width, height, background: '#1a1a2e' }}
      camera={{ position: [100, 80, 120], fov: 45 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[50, 80, 50]} intensity={0.8} />
      <Environment preset="studio" />

      {components.map((component) => {
        switch (component.type) {
          case 'arduino_uno':
            return <Arduino3D key={component.id} component={component} showLabels={false} />;
          case 'breadboard':
            return <Breadboard3D key={component.id} component={component} showLabels={false} />;
          case 'led':
            return <Led3D key={component.id} component={component} />;
          case 'resistor':
            return <Resistor3D key={component.id} component={component} />;
          case 'button':
            return <Button3D key={component.id} component={component} />;
          default:
            return null;
        }
      })}
    </Canvas>
  );
}
