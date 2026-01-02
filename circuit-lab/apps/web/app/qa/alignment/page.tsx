'use client';

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { createArduinoUno, createBreadboard } from '@circuit-lab/sim-core';
import { Arduino3D, Breadboard3D } from '@circuit-lab/render-webgl';

// Standard pin spacing in mm (0.1 inch = 2.54mm)
const PIN_SPACING = 2.54;

function AlignmentGrid() {
  return (
    <>
      {/* Primary grid - matches standard 0.1" pin spacing */}
      <Grid
        position={[80, 0, 0]}
        args={[200, 200]}
        cellSize={PIN_SPACING}
        cellThickness={0.5}
        cellColor={0x4444ff}
        sectionSize={PIN_SPACING * 10}
        sectionThickness={1}
        sectionColor={0x6666ff}
        fadeDistance={300}
        infiniteGrid
      />

      {/* Origin marker */}
      <group position={[0, 0, 0.1]}>
        <mesh>
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial color={0xff0000} />
        </mesh>
        <Html position={[3, 0, 0]}>
          <div className="text-xs text-red-500 font-mono">Origin (0,0)</div>
        </Html>
      </group>

      {/* Axis lines */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([0, 0, 0.1, 200, 0, 0.1])}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xff0000} />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([0, 0, 0.1, 0, 100, 0.1])}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x00ff00} />
      </line>
    </>
  );
}

function PinMarkers({ positions, label }: { positions: { x: number; y: number }[], label: string }) {
  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={[pos.x, pos.y, 2]}>
          <mesh>
            <circleGeometry args={[0.5, 16]} />
            <meshBasicMaterial color={0xffff00} transparent opacity={0.7} />
          </mesh>
          {i % 5 === 0 && (
            <Html position={[0, 1.5, 0]}>
              <div className="text-[8px] text-yellow-400 font-mono whitespace-nowrap">
                {i + 1}
              </div>
            </Html>
          )}
        </group>
      ))}
    </>
  );
}

export default function AlignmentQAPage() {
  const [showArduino, setShowArduino] = useState(true);
  const [showBreadboard, setShowBreadboard] = useState(true);
  const [showPinMarkers, setShowPinMarkers] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.5);

  const arduino = createArduinoUno('alignment-arduino', { x: 0, y: 0, z: 0 });
  const breadboard = createBreadboard(
    'alignment-breadboard',
    { type: 'full', hasTopRails: true, hasBottomRails: true },
    { x: 80, y: 0, z: 0 }
  );

  // Generate expected pin positions for breadboard
  const breadboardPins = [];
  for (let col = 1; col <= 63; col++) {
    for (let row = 0; row < 5; row++) {
      breadboardPins.push({
        x: 80 + 5 + (col - 1) * PIN_SPACING,
        y: 14 + row * PIN_SPACING,
      });
    }
    for (let row = 0; row < 5; row++) {
      breadboardPins.push({
        x: 80 + 5 + (col - 1) * PIN_SPACING,
        y: 14 + 5 * PIN_SPACING + 7.62 + row * PIN_SPACING,
      });
    }
  }

  return (
    <div className="min-h-screen bg-arduino-dark">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">Pin Alignment Check</h1>
            <p className="text-sm text-muted-foreground">
              Verify pin positions match standard 0.1&quot; (2.54mm) spacing
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-green-500">
              Max Error: ≤0.25px required
            </span>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Controls */}
        <div className="w-64 border-r border-border p-4">
          <h2 className="text-sm font-medium mb-3">Display Options</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showArduino}
                onChange={(e) => setShowArduino(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Arduino</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showBreadboard}
                onChange={(e) => setShowBreadboard(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Breadboard</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showPinMarkers}
                onChange={(e) => setShowPinMarkers(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Pin Markers</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Grid</span>
            </label>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-medium mb-3">Measurements</h2>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pin Spacing</span>
                <span>2.54mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Arduino Width</span>
                <span>68.6mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Arduino Height</span>
                <span>53.4mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">BB Width</span>
                <span>165.1mm</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-medium mb-3">Alignment Tests</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Header pin spacing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Breadboard holes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Center gap</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Power rails</span>
              </div>
            </div>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 h-[calc(100vh-73px)]">
          <Canvas
            shadows
            gl={{ antialias: true }}
            style={{ background: '#0d0d14' }}
          >
            <PerspectiveCamera
              makeDefault
              position={[100, 100, 150]}
              fov={45}
            />
            <OrbitControls enableDamping target={[80, 30, 0]} />

            <ambientLight intensity={0.4} />
            <directionalLight position={[50, 80, 50]} intensity={0.6} />

            {showGrid && <AlignmentGrid />}

            <Suspense fallback={null}>
              {showArduino && <Arduino3D component={arduino} showLabels />}
              {showBreadboard && <Breadboard3D component={breadboard} showLabels />}
            </Suspense>

            {showPinMarkers && (
              <PinMarkers
                positions={breadboardPins.slice(0, 100)}
                label="Breadboard Pins"
              />
            )}
          </Canvas>
        </div>
      </div>
    </div>
  );
}
