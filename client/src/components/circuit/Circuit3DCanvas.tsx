/**
 * Tinkercad-style 3D Circuit Canvas
 * Complete 3D rendering with Three.js
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { useCircuitStore } from '@/lib/circuit-store';
import { Breadboard3D } from './3d/Breadboard3D';
import { ArduinoUNO3D } from './3d/ArduinoUNO3D';
import { Component3D } from './3d/Component3D';
import { Wire3D } from './3d/Wire3D';

export function Circuit3DCanvas() {
  const { components = [], wires = [] } = useCircuitStore();

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-blue-50">
      <Canvas shadows>
        {/* Camera Setup */}
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />

        {/* Lighting - Realistic setup like Tinkercad */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <directionalLight position={[-10, 5, -5]} intensity={0.3} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />

        {/* Environment for reflections */}
        <Environment preset="apartment" />

        {/* Grid Floor */}
        <Grid
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#4b5563"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          position={[0, -0.01, 0]}
        />

        {/* Ground Plane for shadows */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={0.2} />
        </mesh>

        {/* 3D Components */}
        <Suspense fallback={null}>
          {/* Render all circuit components */}
          {components.map((component) => (
            <Component3D key={component.id} component={component} />
          ))}

          {/* Render all wires */}
          {wires.map((wire) => (
            <Wire3D key={wire.id} wire={wire} />
          ))}
        </Suspense>

        {/* Camera Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
