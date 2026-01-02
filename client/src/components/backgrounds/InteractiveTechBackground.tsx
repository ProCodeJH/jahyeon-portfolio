"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Stars,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";

// --- 1. AI 코어 (중앙의 메인 오브젝트) ---
function AICore() {
  const meshRef = useRef<THREE.Mesh>(null!);

  // 시간에 따라 회전하는 애니메이션
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={2.5}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#4f46e5"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          emissive="#1e1b4b"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

// --- 2. 회로 칩 ---
function CircuitChip({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={1}>
      <mesh position={position} scale={0.5}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.1} metalness={0.9} />
      </mesh>
    </Float>
  );
}

// --- 3. 테크 링 ---
function TechRing({
  radius,
  speed,
  color,
}: {
  radius: number;
  speed: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x =
        Math.sin(state.clock.getElapsedTime() * speed) * 0.5;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * speed;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

// --- 메인 배경 컴포넌트 ---
export default function InteractiveTechBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-slate-950">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
        <spotLight
          position={[-10, -10, -10]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#4f46e5"
        />

        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        <AICore />

        <group>
          <CircuitChip position={[4, 3, -2]} />
          <CircuitChip position={[-4, -2, -3]} />
          <CircuitChip position={[3, -4, 1]} />
          <CircuitChip position={[-3, 4, 2]} />
          <CircuitChip position={[0, 5, -4]} />
        </group>

        <TechRing radius={3.5} speed={0.2} color="#0ea5e9" />
        <TechRing radius={4.2} speed={0.15} color="#6366f1" />
        <TechRing radius={5.0} speed={0.1} color="#a855f7" />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}
