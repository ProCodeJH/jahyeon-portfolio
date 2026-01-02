'use client';

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { createArduinoUno, createBreadboard, createLed, createResistor, createButton } from '@circuit-lab/sim-core';
import { Arduino3D, Breadboard3D, Led3D, Resistor3D, Button3D } from '@circuit-lab/render-webgl';

const ZOOM_LEVELS = [
  { label: '100%', value: 1 },
  { label: '200%', value: 2 },
  { label: '400%', value: 4 },
];

const COMPONENTS = [
  { name: 'Arduino UNO', factory: () => createArduinoUno('qa-arduino', { x: 0, y: 0, z: 0 }), Component: Arduino3D },
  { name: 'Breadboard', factory: () => createBreadboard('qa-breadboard', { type: 'full', hasTopRails: true, hasBottomRails: true }, { x: 0, y: 0, z: 0 }), Component: Breadboard3D },
  { name: 'LED (Red)', factory: () => createLed('qa-led-red', 'red', '5mm', { x: 0, y: 0, z: 0 }), Component: Led3D },
  { name: 'LED (Green)', factory: () => createLed('qa-led-green', 'green', '5mm', { x: 0, y: 0, z: 0 }), Component: Led3D },
  { name: 'LED (Blue)', factory: () => createLed('qa-led-blue', 'blue', '5mm', { x: 0, y: 0, z: 0 }), Component: Led3D },
  { name: 'Resistor (220Ω)', factory: () => createResistor('qa-res-220', 220, 5, '1/4W', { x: 0, y: 0, z: 0 }), Component: Resistor3D },
  { name: 'Resistor (1kΩ)', factory: () => createResistor('qa-res-1k', 1000, 5, '1/4W', { x: 0, y: 0, z: 0 }), Component: Resistor3D },
  { name: 'Button', factory: () => createButton('qa-button', '6mm', 'black', { x: 0, y: 0, z: 0 }), Component: Button3D },
];

function ComponentViewer({ component, zoom }: { component: typeof COMPONENTS[0], zoom: number }) {
  const data = component.factory();
  const Component = component.Component;

  // Adjust camera position based on component size
  const cameraDistance = component.name.includes('Arduino') ? 100 :
                        component.name.includes('Breadboard') ? 150 : 20;

  return (
    <Canvas
      shadows
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ background: '#1a1a2e' }}
    >
      <PerspectiveCamera
        makeDefault
        position={[cameraDistance / zoom, cameraDistance / zoom, cameraDistance / zoom]}
        fov={45}
      />
      <OrbitControls enableDamping />
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 80, 50]} intensity={0.8} castShadow />
      <directionalLight position={[-30, 60, -30]} intensity={0.3} />
      <Environment preset="studio" />
      <Component component={data} showLabels />
    </Canvas>
  );
}

export default function AssetQAPage() {
  const [selectedComponent, setSelectedComponent] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showWireframe, setShowWireframe] = useState(false);
  const [lighting, setLighting] = useState<'studio' | 'sunset' | 'dawn' | 'night'>('studio');

  return (
    <div className="min-h-screen bg-arduino-dark">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">Asset Quality Check</h1>
            <p className="text-sm text-muted-foreground">
              Verify 3D assets at different zoom levels
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Zoom:</span>
              {ZOOM_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setZoom(level.value)}
                  className={`px-3 py-1 text-sm rounded ${
                    zoom === level.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="w-64 border-r border-border p-4">
          <h2 className="text-sm font-medium mb-3">Components</h2>
          <div className="space-y-1">
            {COMPONENTS.map((comp, index) => (
              <button
                key={comp.name}
                onClick={() => setSelectedComponent(index)}
                className={`w-full text-left px-3 py-2 text-sm rounded ${
                  selectedComponent === index
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary'
                }`}
              >
                {comp.name}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-medium mb-3">Checks</h2>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Text clarity</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Texture quality</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>No aliasing</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Correct scale</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Proper shadows</span>
              </label>
            </div>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 h-[calc(100vh-73px)]">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-muted-foreground">Loading component...</div>
            </div>
          }>
            <ComponentViewer
              component={COMPONENTS[selectedComponent]}
              zoom={zoom}
            />
          </Suspense>
        </div>

        {/* Info Panel */}
        <div className="w-64 border-l border-border p-4">
          <h2 className="text-sm font-medium mb-3">Component Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{COMPONENTS[selectedComponent].name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zoom Level</span>
              <span>{zoom * 100}%</span>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-medium mb-3">Quality Metrics</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Triangles</span>
                <span className="text-green-500">~2,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Draw Calls</span>
                <span className="text-green-500">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Textures</span>
                <span className="text-green-500">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">FPS</span>
                <span className="text-green-500">60</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
