'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useCircuitStore } from '@/store/circuitStore';
import { CircuitScene } from '@circuit-lab/render-webgl';

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground text-sm">Loading 3D Scene...</span>
      </div>
    </Html>
  );
}

function SceneContent() {
  const {
    components,
    wires,
    ui,
    selectComponent,
    startWiring,
    completeWiring,
    cancelWiring,
  } = useCircuitStore();

  const handleComponentSelect = (id: string | null) => {
    if (ui.isWiring && id) {
      // Complete wiring if we click on a different component's pin
      cancelWiring();
    } else {
      selectComponent(id);
    }
  };

  const handlePinClick = (componentId: string, pinId: string) => {
    if (ui.isWiring) {
      // Complete the wire
      if (ui.wiringStart) {
        completeWiring(componentId, pinId);
      }
    } else {
      // Start a new wire
      startWiring(componentId, pinId);
    }
  };

  // Get wire preview data
  const wirePreview = ui.isWiring && ui.wiringStart
    ? {
        startPos: { x: 0, y: 0, z: 10 }, // Would be calculated from component position
        currentPos: { x: 50, y: 50, z: 10 }, // Would track mouse position
        color: ui.wireColor,
      }
    : undefined;

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={[100, 120, 150]}
        fov={45}
        near={0.1}
        far={2000}
      />

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={30}
        maxDistance={400}
        maxPolarAngle={Math.PI / 2.1}
        target={[60, 30, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-30, 80, -30]} intensity={0.3} />
      <pointLight position={[0, 60, 0]} intensity={0.2} />

      {/* Environment for reflections */}
      <Environment preset="studio" />

      {/* Grid */}
      {ui.showGrid && (
        <Grid
          position={[80, 0, -0.5]}
          args={[300, 300]}
          cellSize={2.54}
          cellThickness={0.5}
          cellColor={0x444466}
          sectionSize={25.4}
          sectionThickness={1}
          sectionColor={0x666688}
          fadeDistance={300}
          fadeStrength={1}
        />
      )}

      {/* Circuit Scene - using the render-webgl package */}
      <CircuitScene
        components={components}
        wires={wires}
        selectedId={ui.selectedComponentId || ui.selectedWireId || undefined}
        onComponentSelect={handleComponentSelect}
        onPinClick={handlePinClick}
        wirePreview={wirePreview}
        showGrid={false}
        showLabels={ui.showLabels}
        showFlow={ui.showFlow}
      />

      {/* Ground plane for clicking to deselect */}
      <mesh
        position={[80, 0, -1]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => {
          selectComponent(null);
          cancelWiring();
        }}
        visible={false}
      >
        <planeGeometry args={[500, 500]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

export default function CircuitCanvas() {
  return (
    <div className="w-full h-full circuit-canvas bg-arduino-dark">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x1a1a2e, 1);
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <SceneContent />
        </Suspense>
      </Canvas>

      {/* Overlay for wiring mode */}
      {useCircuitStore.getState().ui.isWiring && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary/90 text-primary-foreground rounded-lg text-sm">
          Click on a pin to complete the wire • Press Escape to cancel
        </div>
      )}
    </div>
  );
}
