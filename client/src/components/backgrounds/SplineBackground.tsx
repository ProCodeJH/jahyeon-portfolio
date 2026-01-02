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

// 유기적인 변형 오브젝트 컴포넌트 (엔터프라이즈급)
function DistortOrb({
  position,
  color,
  scale = 1,
  distortStrength = 0.4,
  rotationSpeed = 1,
  glowIntensity = 0.5,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  distortStrength?: number;
  rotationSpeed?: number;
  glowIntensity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  useCursor(hovered);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x =
        state.clock.getElapsedTime() * rotationSpeed * 0.1;
      ref.current.rotation.y =
        state.clock.getElapsedTime() * rotationSpeed * 0.2;
      ref.current.position.y =
        position[1] +
        Math.sin(state.clock.getElapsedTime() * rotationSpeed) * 0.3;
    }

    // 발광 효과를 위한 동적 조명
    if (glowRef.current) {
      glowRef.current.intensity =
        glowIntensity *
        (hovered ? 1.5 : 1) *
        (0.8 + Math.sin(state.clock.getElapsedTime() * 3) * 0.2);
    }
  });

  return (
    <group position={position}>
      {/* 발광 효과를 위한 포인트 라이트 */}
      <pointLight
        ref={glowRef}
        color={color}
        intensity={glowIntensity}
        distance={10}
        decay={2}
      />

      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <mesh
          ref={ref}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
          scale={scale * (hovered ? 1.2 : 1)}
        >
          <sphereGeometry args={[1, 128, 128]} />
          <MeshDistortMaterial
            color={color}
            envMapIntensity={1.2}
            clearcoat={1}
            clearcoatRoughness={0}
            metalness={0.9}
            roughness={0.05}
            emissive={color}
            emissiveIntensity={0.3}
            distort={distortStrength * (hovered ? 1.5 : 1)} // 호버 시 변형 강화
            speed={3} // 변형 속도 증가
            reflectivity={0.9}
            iridescence={1}
            iridescenceIOR={1.3}
            transmission={0.1}
          />
        </mesh>

        {/* 오브젝트 주변의 에너지 필드 효과 */}
        <mesh scale={1.5}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1 * (hovered ? 2 : 1)}
          />
        </mesh>
      </Float>
    </group>
  );
}

// 회로 칩 컴포넌트 (엔터프라이즈급)
function CircuitChip({
  position,
  rotation,
  scale = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // 회전 애니메이션
      meshRef.current.rotation.x =
        rotation[0] + state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y =
        rotation[1] + state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.z =
        rotation[2] + state.clock.getElapsedTime() * 0.2;

      // 미세한 위치 변화
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
    }

    // 발광 효과
    if (glowRef.current) {
      glowRef.current.intensity =
        0.3 *
        (hovered ? 2 : 1) *
        (0.8 + Math.sin(state.clock.getElapsedTime() * 4) * 0.2);
    }
  });

  return (
    <group position={position}>
      {/* 발광 효과를 위한 포인트 라이트 */}
      <pointLight
        ref={glowRef}
        color="#0ea5e9"
        intensity={0.3}
        distance={10}
        decay={2}
      />

      <Float speed={3} rotationIntensity={0.8} floatIntensity={1.5}>
        <mesh
          ref={meshRef}
          rotation={rotation}
          scale={scale * (hovered ? 1.2 : 1)}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        >
          {/* 메인 회로 칩 */}
          <boxGeometry args={[1, 1, 0.2]} />
          <meshPhysicalMaterial
            color="#0ea5e9"
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive="#0ea5e9"
            emissiveIntensity={hovered ? 0.6 : 0.3}
            reflectivity={0.9}
            transmission={0.2}
          />

          {/* 회로 패턴 */}
          <mesh position={[0, 0, 0.11]}>
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial color="#0891b2" transparent opacity={0.9} />
          </mesh>

          {/* 회로 선 */}
          <mesh>
            <torusGeometry args={[0.3, 0.05, 8, 20]} />
            <meshBasicMaterial
              color="#0ea5e9"
              transparent
              opacity={hovered ? 0.8 : 0.5}
            />
          </mesh>

          {/* 발광 효과 */}
          <mesh scale={1.2}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshBasicMaterial
              color="#0ea5e9"
              transparent
              opacity={hovered ? 0.3 : 0.1}
            />
          </mesh>
        </mesh>
      </Float>
    </group>
  );
}

// 링 컴포넌트 (엔터프라이즈급)
function TechRing({
  radius,
  speed,
  color,
  thickness = 0.1,
}: {
  radius: number;
  speed: number;
  color: string;
  thickness?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const [hovered, setHover] = useState(false);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x =
        Math.sin(state.clock.getElapsedTime() * speed) * 0.3;
      ref.current.rotation.y = state.clock.getElapsedTime() * speed * 1.2;
      ref.current.rotation.z =
        Math.sin(state.clock.getElapsedTime() * speed * 0.7) * 0.2;

      // 링의 형태 변화
      ref.current.scale.x =
        1 + Math.sin(state.clock.getElapsedTime() * speed * 2) * 0.05;
    }

    // 파티클 애니메이션
    if (
      particlesRef.current &&
      particlesRef.current.geometry instanceof THREE.BufferGeometry
    ) {
      const positions = particlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const time = state.clock.getElapsedTime();

      for (let i = 0; i < positions.length; i += 3) {
        const idx = i / 3;
        const angle = (idx / 20) * Math.PI * 2;
        const x = Math.cos(angle + time * speed) * radius;
        const y = Math.sin(angle + time * speed) * radius;
        const z = Math.sin(time * 3 + idx) * 0.3;

        positions[i] = x;
        positions[i + 1] = y;
        positions[i + 2] = z;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 발광 효과
    if (glowRef.current) {
      glowRef.current.intensity =
        0.2 *
        (hovered ? 2 : 1) *
        (0.8 + Math.sin(state.clock.getElapsedTime() * 3) * 0.2);
    }
  });

  // 파티클 생성
  const particleCount = 20;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  return (
    <group>
      {/* 발광 효과를 위한 포인트 라이트 */}
      <pointLight
        ref={glowRef}
        color={color}
        intensity={0.2}
        distance={15}
        decay={2}
      />

      <mesh
        ref={ref}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? 1.1 : 1}
      >
        <torusGeometry args={[radius, thickness, 32, 100]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.3}
          thickness={0.5}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.2}
        />
      </mesh>

      {/* 파티클 */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color={color}
          transparent
          opacity={hovered ? 0.8 : 0.4}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* 발광 효과 */}
      <mesh scale={1.2}>
        <torusGeometry args={[radius, thickness * 2, 16, 50]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.2 : 0.1}
        />
      </mesh>
    </group>
  );
}

// 엔터프라이즈급 메인 배경 컴포넌트
export default function SplineBackground() {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen">
      <Canvas
        dpr={[1, 2]} // 성능 최적화
        camera={{ position: [0, 0, 12], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        shadows
      >
        {/* ToneMapping Effect using Canvas의 linearToneMapping */}
        <toneMapping
          attach="toneMapping"
          args={[THREE.ACESFilmicToneMapping, 0.5]}
        />
        {/* 고급 조명 설정 */}
        <ambientLight intensity={0.3} color="#ffffff" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          color="#ffffff"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.1}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        {/* 동적 조명 */}
        <spotLight
          position={[-10, -10, 5]}
          intensity={0.8}
          color="#8b5cf6"
          angle={0.3}
          penumbra={1}
          castShadow
        />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#ec4899" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#0ea5e9" />

        {/* 3D 오브젝트 배치 - 더 복잡한 배열 */}
        <DistortOrb
          position={[-3, 1, -2]}
          color="#0ea5e9"
          scale={1.5}
          rotationSpeed={1.2}
          glowIntensity={0.7}
        />
        <DistortOrb
          position={[3, -1, -2]}
          color="#ec4899"
          scale={1.2}
          rotationSpeed={1.5}
          glowIntensity={0.8}
        />
        <DistortOrb
          position={[0, 2, -4]}
          color="#8b5cf6"
          scale={2}
          rotationSpeed={0.8}
          glowIntensity={0.6}
        />
        <DistortOrb
          position={[-2, -3, 2]}
          color="#f59e0b"
          scale={0.8}
          rotationSpeed={2}
          glowIntensity={0.5}
        />

        {/* 회로 칩 배치 - 더 많고 복잡한 */}
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
        <CircuitChip
          position={[-1, 4, -2]}
          rotation={[Math.PI / 4, 0, 0]}
          scale={0.9}
        />
        <CircuitChip
          position={[3, 1, 2]}
          rotation={[0, Math.PI / 6, 0]}
          scale={1.1}
        />

        {/* 기술적인 링들 - 더 많고 다양한 */}
        <TechRing radius={3.5} speed={0.2} color="#0ea5e9" thickness={0.15} />
        <TechRing radius={4.2} speed={0.15} color="#6366f1" thickness={0.12} />
        <TechRing radius={5.0} speed={0.1} color="#a855f7" thickness={0.1} />
        <TechRing radius={6.5} speed={0.08} color="#ec4899" thickness={0.08} />

        {/* 후처리 효과 - Three.js 네이티브로 구현 */}
        <fog attach="fog" args={["#1e1b4b", 5, 30]} />
        <toneMapping
          attach="toneMapping"
          type={THREE.ACESFilmicToneMapping}
          exposure={0.5}
        />

        {/* 환경 및 효과 - 더 고급 */}
        <Environment
          preset="city"
          background={false}
          environmentIntensity={0.5}
        />
        <Stars
          radius={200}
          depth={60}
          count={8000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />
        <ContactShadows
          position={[0, -5, 0]}
          opacity={0.4}
          scale={30}
          blur={3}
          far={15}
        />
      </Canvas>
    </div>
  );
}
