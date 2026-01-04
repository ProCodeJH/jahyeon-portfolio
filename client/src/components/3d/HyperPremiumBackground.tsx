/**
 * Hyper-Premium 3D Background with FSM-Based AI Robot
 *
 * Features:
 * - HDR Environment Lighting
 * - Particle System
 * - Floating Tech Elements
 * - AI Robot with Autonomous Behavior
 * - 60 FPS Performance Target
 */

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Stars, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { HyperRealisticAIRobot } from './HyperRealisticAIRobot';

// ============================================
// FLOATING TECH ELEMENTS
// ============================================

function TechOrb({ position, color, size = 0.05 }: { position: [number, number, number]; color: string; size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 0.5 + Math.random() * 0.5, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + offset) * 0.1;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[size, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

function FloatingHexGrid({ position, size = 0.3 }: { position: [number, number, number]; size?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  const hexagons = useMemo(() => {
    const hexes: { pos: [number, number, number]; opacity: number }[] = [];
    const hexRadius = size / 6;

    for (let q = -2; q <= 2; q++) {
      for (let r = -2; r <= 2; r++) {
        if (Math.abs(q + r) <= 2) {
          const x = hexRadius * 1.5 * q;
          const y = hexRadius * Math.sqrt(3) * (r + q / 2);
          const dist = Math.sqrt(q * q + r * r);
          hexes.push({
            pos: [x, y, 0] as [number, number, number],
            opacity: 1 - dist * 0.2,
          });
        }
      }
    }
    return hexes;
  }, [size]);

  return (
    <group ref={groupRef} position={position}>
      {hexagons.map((hex, i) => (
        <mesh key={i} position={hex.pos}>
          <ringGeometry args={[size / 8, size / 7, 6]} />
          <meshBasicMaterial
            color="#06b6d4"
            transparent
            opacity={hex.opacity * 0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function DataStream({ start, end, color = '#22c55e' }: { start: [number, number, number]; end: [number, number, number]; color?: string }) {
  const particleRef = useRef<THREE.Mesh>(null);
  const progress = useRef(Math.random());
  const speed = useMemo(() => 0.3 + Math.random() * 0.3, []);

  useFrame((state, delta) => {
    if (particleRef.current) {
      progress.current += delta * speed;
      if (progress.current > 1) progress.current = 0;

      const t = progress.current;
      particleRef.current.position.set(
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
        start[2] + (end[2] - start[2]) * t
      );
    }
  });

  return (
    <Trail
      width={0.5}
      length={6}
      color={color}
      attenuation={(t) => t * t}
    >
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </Trail>
  );
}

function CircuitLines() {
  const lines = useMemo(() => {
    const result: { start: [number, number, number]; end: [number, number, number]; color: string }[] = [];

    // Create circuit-like patterns
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 0.8 + Math.random() * 0.3;
      const y = (Math.random() - 0.5) * 0.8;

      result.push({
        start: [Math.cos(angle) * radius, y, Math.sin(angle) * radius - 1],
        end: [Math.cos(angle + 0.3) * radius * 0.6, y + 0.2, Math.sin(angle + 0.3) * radius * 0.6 - 1],
        color: ['#06b6d4', '#22c55e', '#3b82f6', '#a855f7'][Math.floor(Math.random() * 4)],
      });
    }

    return result;
  }, []);

  return (
    <group>
      {lines.map((line, i) => (
        <DataStream key={i} start={line.start} end={line.end} color={line.color} />
      ))}
    </group>
  );
}

// ============================================
// HOLOGRAPHIC RING
// ============================================

function HolographicRing({ radius = 0.4, y = 0 }: { radius?: number; y?: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group position={[0, y, 0]}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.002, 16, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.1, 0.001, 16, 64]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// ============================================
// AMBIENT PARTICLES
// ============================================

function AmbientParticles({ count = 100 }: { count?: number }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorPalette = [
      new THREE.Color('#06b6d4'),
      new THREE.Color('#22c55e'),
      new THREE.Color('#3b82f6'),
      new THREE.Color('#a855f7'),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3 - 1;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={points.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// ============================================
// MAIN SCENE
// ============================================

function BackgroundScene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#06b6d4" />

      {/* Environment */}
      <Environment preset="night" />

      {/* Stars background */}
      <Stars
        radius={100}
        depth={50}
        count={2000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* AI Robot */}
      <Float
        speed={1}
        rotationIntensity={0.1}
        floatIntensity={0.3}
      >
        <HyperRealisticAIRobot
          position={[0.5, 0, 0]}
          scale={0.8}
        />
      </Float>

      {/* Holographic rings around robot */}
      <group position={[0.5, 0, 0]}>
        <HolographicRing radius={0.3} y={-0.2} />
        <HolographicRing radius={0.25} y={0.1} />
      </group>

      {/* Tech orbs */}
      <TechOrb position={[-0.8, 0.3, -0.5]} color="#06b6d4" size={0.04} />
      <TechOrb position={[1.2, -0.2, -0.3]} color="#22c55e" size={0.03} />
      <TechOrb position={[-0.5, -0.4, -0.8]} color="#a855f7" size={0.035} />
      <TechOrb position={[0.9, 0.5, -0.6]} color="#3b82f6" size={0.025} />

      {/* Floating hex grids */}
      <Float speed={0.5} rotationIntensity={0.2}>
        <FloatingHexGrid position={[-1, 0.2, -0.8]} size={0.25} />
      </Float>
      <Float speed={0.3} rotationIntensity={0.15}>
        <FloatingHexGrid position={[1.3, -0.3, -1]} size={0.2} />
      </Float>

      {/* Circuit data streams */}
      <CircuitLines />

      {/* Ambient particles */}
      <AmbientParticles count={80} />

      {/* Ground reflection plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color="#050510"
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
    </>
  );
}

// ============================================
// EXPORTED COMPONENT
// ============================================

export function HyperPremiumBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 2], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        style={{ background: 'linear-gradient(180deg, #050510 0%, #0a0a1a 50%, #050510 100%)' }}
      >
        <Suspense fallback={null}>
          <BackgroundScene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default HyperPremiumBackground;
