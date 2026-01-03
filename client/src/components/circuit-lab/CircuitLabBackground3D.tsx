/**
 * Circuit Lab Premium 3D Background
 * Ultra-high quality animated background with floating electronic components
 * Enterprise-grade WebGL rendering with custom shaders
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Stars, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Floating Arduino Chip
function FloatingChip({ position, scale = 1, color = '#1d6b45' }: {
  position: [number, number, number];
  scale?: number;
  color?: string;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const time = useRef(Math.random() * 100);

  useFrame((state) => {
    if (meshRef.current) {
      time.current += 0.01;
      meshRef.current.rotation.y = Math.sin(time.current * 0.5) * 0.3;
      meshRef.current.rotation.x = Math.cos(time.current * 0.3) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(time.current) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={meshRef} position={position} scale={scale}>
        {/* PCB Board */}
        <mesh castShadow>
          <boxGeometry args={[2, 0.1, 1.5]} />
          <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} />
        </mesh>
        {/* Chip package */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.8, 0.2, 0.8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Chip pins */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`pin-l-${i}`} position={[-0.5, 0.1, -0.35 + i * 0.1]}>
            <boxGeometry args={[0.15, 0.02, 0.02]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`pin-r-${i}`} position={[0.5, 0.1, -0.35 + i * 0.1]}>
            <boxGeometry args={[0.15, 0.02, 0.02]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {/* LED indicator */}
        <mesh position={[0.7, 0.1, 0.5]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
        {/* Copper traces */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={`trace-${i}`} position={[-0.3 + i * 0.2, 0.06, 0]}>
            <boxGeometry args={[0.02, 0.01, 1.2]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Glowing LED particle
function GlowingLED({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && glowRef.current) {
      const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 3 + position[0]);
      glowRef.current.scale.setScalar(1 + pulse * 0.5);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 * pulse;
    }
  });

  return (
    <Float speed={4} rotationIntensity={0.2} floatIntensity={2}>
      <group position={position}>
        {/* LED body */}
        <mesh ref={meshRef}>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.9}
            roughness={0.1}
            metalness={0}
            emissive={color}
            emissiveIntensity={2}
          />
        </mesh>
        {/* LED dome */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.08, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.8}
            roughness={0.05}
            emissive={color}
            emissiveIntensity={3}
          />
        </mesh>
        {/* Glow effect */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
        {/* Point light */}
        <pointLight color={color} intensity={0.5} distance={2} decay={2} />
      </group>
    </Float>
  );
}

// Circuit trace line
function CircuitTrace({ start, end, color = '#3b82f6' }: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
}) {
  const lineRef = useRef<THREE.Line>(null);

  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2 + (Math.random() - 0.5) * 2,
        (start[1] + end[1]) / 2 + (Math.random() - 0.5) * 2,
        (start[2] + end[2]) / 2 + (Math.random() - 0.5) * 2
      ),
      new THREE.Vector3(...end),
    ]);
    return curve.getPoints(50);
  }, [start, end]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  useFrame((state) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.3 + 0.2 * Math.sin(state.clock.elapsedTime * 2);
    }
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.5} linewidth={2} />
    </line>
  );
}

// Central AI/MCU Core
function MCUCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
    ringRefs.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.x = state.clock.elapsedTime * (0.2 + i * 0.1);
        ring.rotation.z = state.clock.elapsedTime * (0.15 - i * 0.05);
      }
    });
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central core */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1}>
        <mesh ref={meshRef} scale={1.5}>
          <icosahedronGeometry args={[1, 2]} />
          <MeshDistortMaterial
            color="#0ea5e9"
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            emissive="#0c4a6e"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>

      {/* Orbiting rings */}
      {[1.8, 2.3, 2.8].map((radius, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringRefs.current[i] = el; }}
        >
          <torusGeometry args={[radius, 0.02, 16, 100]} />
          <meshBasicMaterial
            color={['#0ea5e9', '#6366f1', '#a855f7'][i]}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}

      {/* Data nodes on rings */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 2 + (i % 3) * 0.4;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 2) * 0.5,
              Math.sin(angle) * radius,
            ]}
          >
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={0.5}
              metalness={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Binary data stream particles
function DataStream({ count = 50 }) {
  const particlesRef = useRef<THREE.Points>(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return [pos, vel];
  }, [count]);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];

        // Wrap around
        if (Math.abs(positions[i * 3]) > 10) velocities[i * 3] *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 10) velocities[i * 3 + 1] *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 10) velocities[i * 3 + 2] *= -1;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#22c55e"
        size={0.08}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Main background scene
function BackgroundScene() {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0ea5e9" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color="#6366f1"
      />

      {/* Stars background */}
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Central MCU Core */}
      <MCUCore />

      {/* Floating Arduino boards */}
      <FloatingChip position={[-6, 3, -4]} scale={0.4} color="#1d6b45" />
      <FloatingChip position={[6, -2, -3]} scale={0.35} color="#1e90ff" />
      <FloatingChip position={[-5, -4, 2]} scale={0.3} color="#9333ea" />
      <FloatingChip position={[5, 4, -2]} scale={0.35} color="#0ea5e9" />

      {/* Glowing LEDs */}
      <GlowingLED position={[-4, 2, 3]} color="#ff0000" />
      <GlowingLED position={[4, -1, 4]} color="#00ff00" />
      <GlowingLED position={[-3, -3, 2]} color="#0066ff" />
      <GlowingLED position={[3, 3, -3]} color="#ffff00" />
      <GlowingLED position={[0, 4, 4]} color="#ff00ff" />

      {/* Circuit traces */}
      <CircuitTrace start={[-6, 3, -4]} end={[0, 0, 0]} color="#0ea5e9" />
      <CircuitTrace start={[6, -2, -3]} end={[0, 0, 0]} color="#6366f1" />
      <CircuitTrace start={[-5, -4, 2]} end={[0, 0, 0]} color="#a855f7" />
      <CircuitTrace start={[5, 4, -2]} end={[0, 0, 0]} color="#22c55e" />

      {/* Data stream particles */}
      <DataStream count={100} />
    </>
  );
}

// Exported component
export default function CircuitLabBackground3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0a0a1a']} />
        <fog attach="fog" args={['#0a0a1a', 10, 30]} />
        <BackgroundScene />
      </Canvas>
    </div>
  );
}

export { CircuitLabBackground3D };
