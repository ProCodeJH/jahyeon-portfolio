"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Stars,
  Environment,
  ContactShadows,
  useCursor,
} from "@react-three/drei";
import * as THREE from "three";

// 유기적인 변형 오브젝트 컴포넌트
function DistortOrb({
  position,
  color,
  scale = 1,
  distortStrength = 0.4,
  rotationSpeed = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  distortStrength?: number;
  rotationSpeed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x =
        state.clock.getElapsedTime() * rotationSpeed * 0.1;
      ref.current.rotation.y =
        state.clock.getElapsedTime() * rotationSpeed * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh
        ref={ref}
        position={position}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={scale * (hovered ? 1.2 : 1)}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          envMapIntensity={0.8}
          clearcoat={1}
          clearcoatRoughness={0}
          metalness={0.9}
          roughness={0.1}
          distort={distortStrength} // 기본 변형 정도
          speed={2} // 변형 속도
        />
      </mesh>
    </Float>
  );
}

// 회로 칩 컴포넌트
function CircuitChip({
  position,
  rotation,
  scale = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}) {
  return (
    <Float speed={3} rotationIntensity={0.8} floatIntensity={1.5}>
      <mesh position={position} rotation={rotation} scale={scale}>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial
          color="#0ea5e9"
          metalness={0.8}
          roughness={0.2}
          emissive="#0ea5e9"
          emissiveIntensity={0.3}
        />
        <mesh>
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial color="#0891b2" />
        </mesh>
      </mesh>
    </Float>
  );
}

// 링 컴포넌트
function TechRing({
  radius,
  speed,
  color,
}: {
  radius: number;
  speed: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x =
        Math.sin(state.clock.getElapsedTime() * speed) * 0.2;
      ref.current.rotation.y = state.clock.getElapsedTime() * speed;
      ref.current.rotation.z =
        Math.sin(state.clock.getElapsedTime() * speed * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.1, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

// 메인 배경 컴포넌트
export default function SplineBackground() {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen">
      <Canvas
        dpr={[1, 2]} // 성능 최적화
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        {/* 조명 설정 */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          color="#ffffff"
          castShadow
        />
        <spotLight position={[-10, -10, 5]} intensity={0.5} color="#8b5cf6" />

        {/* 3D 오브젝트 배치 */}
        <DistortOrb
          position={[-3, 1, -2]}
          color="#0ea5e9"
          scale={1.5}
          rotationSpeed={1.2}
        />
        <DistortOrb
          position={[3, -1, -2]}
          color="#ec4899"
          scale={1.2}
          rotationSpeed={1.5}
        />
        <DistortOrb
          position={[0, 2, -4]}
          color="#8b5cf6"
          scale={2}
          rotationSpeed={0.8}
        />

        {/* 회로 칩 배치 */}
        <CircuitChip
          position={[4, 2, -3]}
          rotation={[0, 0, Math.PI / 4]}
          scale={1.2}
        />
        <CircuitChip position={[-4, -1, -2]} rotation={[0, 0, -Math.PI / 6]} />
        <CircuitChip
          position={[2, -3, -1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={0.8}
        />

        {/* 기술적인 링들 */}
        <TechRing radius={3.5} speed={0.2} color="#0ea5e9" />
        <TechRing radius={4.2} speed={0.15} color="#6366f1" />
        <TechRing radius={5.0} speed={0.1} color="#a855f7" />

        {/* 환경 및 효과 */}
        <Environment preset="city" />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <ContactShadows
          position={[0, -5, 0]}
          opacity={0.5}
          scale={20}
          blur={3}
          far={10}
        />
      </Canvas>
    </div>
  );
}
