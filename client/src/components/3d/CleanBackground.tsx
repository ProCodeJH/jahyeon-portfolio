/**
 * Premium Background with MASSIVE AI Robot
 * 거대한 AI 로봇이 배경을 뒤덮는 프리미엄 디자인
 *
 * Design: Massive humanoid robot covering most of the background
 * - Large scale robot (fills ~70% of viewport)
 * - Elegant gradients and soft lighting
 * - Smooth, natural movements
 * - Readable with white text (dark gradient areas)
 */

import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================
// MASSIVE AI ROBOT (Covers Background)
// ============================================

function MassiveAIRobot() {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  // All animation state in single ref (prevents re-renders)
  const anim = useRef({
    breathPhase: 0,
    headRotY: 0,
    headRotX: 0,
    armPhase: 0,
    floatPhase: 0,
  });

  useFrame((_, delta) => {
    if (!groupRef.current || !headRef.current) return;

    const a = anim.current;

    // Breathing animation
    a.breathPhase += delta * 0.8;
    const breathScale = 1 + Math.sin(a.breathPhase) * 0.008;

    // Floating motion
    a.floatPhase += delta * 0.5;
    const floatY = Math.sin(a.floatPhase) * 0.03;

    // Apply to group
    groupRef.current.scale.setScalar(breathScale);
    groupRef.current.position.y = floatY - 0.3;

    // Head tracking - smooth follow pointer
    const targetRotY = pointer.x * 0.15;
    const targetRotX = -pointer.y * 0.1;
    a.headRotY += (targetRotY - a.headRotY) * delta * 2;
    a.headRotX += (targetRotX - a.headRotX) * delta * 2;
    headRef.current.rotation.y = a.headRotY;
    headRef.current.rotation.x = a.headRotX;

    // Arm sway
    a.armPhase += delta * 0.6;
    if (leftArmRef.current && rightArmRef.current) {
      const armSwing = Math.sin(a.armPhase) * 0.05;
      leftArmRef.current.rotation.z = 0.15 + armSwing;
      rightArmRef.current.rotation.z = -0.15 - armSwing;
    }
  });

  // Premium colors - elegant, modern
  const bodyMain = '#e8eaed';
  const bodyAccent = '#d1d5db';
  const bodyDark = '#9ca3af';
  const glowColor = '#60a5fa';
  const eyeGlow = '#3b82f6';

  return (
    <group ref={groupRef} position={[0.6, -0.3, 0]} scale={1}>
      {/* ===== HEAD - Large, expressive ===== */}
      <group ref={headRef} position={[0, 1.8, 0]}>
        {/* Main head shell */}
        <mesh>
          <sphereGeometry args={[0.35, 48, 48]} />
          <meshStandardMaterial
            color={bodyMain}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>

        {/* Face visor - sleek panel */}
        <mesh position={[0, 0.02, 0.28]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.45, 0.18, 0.08]} />
          <meshStandardMaterial
            color="#1f2937"
            roughness={0.05}
            metalness={0.9}
          />
        </mesh>

        {/* Left Eye */}
        <group position={[-0.1, 0.05, 0.32]}>
          <mesh>
            <circleGeometry args={[0.05, 32]} />
            <meshStandardMaterial
              color={eyeGlow}
              emissive={eyeGlow}
              emissiveIntensity={1.2}
              roughness={0.1}
            />
          </mesh>
          <pointLight color={glowColor} intensity={0.8} distance={1} />
        </group>

        {/* Right Eye */}
        <group position={[0.1, 0.05, 0.32]}>
          <mesh>
            <circleGeometry args={[0.05, 32]} />
            <meshStandardMaterial
              color={eyeGlow}
              emissive={eyeGlow}
              emissiveIntensity={1.2}
              roughness={0.1}
            />
          </mesh>
          <pointLight color={glowColor} intensity={0.8} distance={1} />
        </group>

        {/* Forehead accent */}
        <mesh position={[0, 0.22, 0.2]}>
          <boxGeometry args={[0.25, 0.04, 0.1]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={0.5}
            roughness={0.2}
          />
        </mesh>

        {/* Side sensors */}
        {[-0.38, 0.38].map((x, i) => (
          <mesh key={i} position={[x, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.07, 0.08, 24]} />
            <meshStandardMaterial color={bodyAccent} roughness={0.3} metalness={0.5} />
          </mesh>
        ))}

        {/* Antenna */}
        <mesh position={[0, 0.4, -0.05]}>
          <cylinderGeometry args={[0.015, 0.01, 0.15, 12]} />
          <meshStandardMaterial color={bodyDark} roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.5, -0.05]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* ===== NECK ===== */}
      <group position={[0, 1.4, 0]}>
        {/* Neck segments */}
        {[0, 0.08, 0.16].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <cylinderGeometry args={[0.12 - i * 0.02, 0.14 - i * 0.02, 0.06, 24]} />
            <meshStandardMaterial color={bodyDark} roughness={0.4} metalness={0.4} />
          </mesh>
        ))}
      </group>

      {/* ===== TORSO - Massive chest ===== */}
      <group position={[0, 0.7, 0]}>
        {/* Upper chest */}
        <mesh>
          <boxGeometry args={[0.9, 0.6, 0.45]} />
          <meshStandardMaterial color={bodyMain} roughness={0.25} metalness={0.35} />
        </mesh>

        {/* Chest panels */}
        <mesh position={[0, 0.1, 0.23]}>
          <boxGeometry args={[0.7, 0.4, 0.02]} />
          <meshStandardMaterial color={bodyAccent} roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Core light - large glowing circle */}
        <mesh position={[0, 0.05, 0.24]}>
          <circleGeometry args={[0.12, 48]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={1.5}
            roughness={0.1}
          />
        </mesh>
        <pointLight color={glowColor} intensity={2} distance={3} position={[0, 0.05, 0.3]} />

        {/* Lower torso */}
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.7, 0.3, 0.4]} />
          <meshStandardMaterial color={bodyAccent} roughness={0.3} metalness={0.3} />
        </mesh>

        {/* Waist */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.25, 0.3, 0.15, 24]} />
          <meshStandardMaterial color={bodyDark} roughness={0.4} metalness={0.4} />
        </mesh>

        {/* Shoulder joints */}
        {[-0.55, 0.55].map((x, i) => (
          <mesh key={i} position={[x, 0.2, 0]}>
            <sphereGeometry args={[0.15, 24, 24]} />
            <meshStandardMaterial color={bodyDark} roughness={0.35} metalness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ===== LEFT ARM ===== */}
      <group ref={leftArmRef} position={[-0.7, 0.9, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.1, 0.35, 16, 16]} />
          <meshStandardMaterial color={bodyMain} roughness={0.25} metalness={0.35} />
        </mesh>

        {/* Elbow joint */}
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial color={bodyDark} roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Forearm */}
        <mesh position={[0, -0.75, 0]}>
          <capsuleGeometry args={[0.08, 0.3, 16, 16]} />
          <meshStandardMaterial color={bodyAccent} roughness={0.3} metalness={0.3} />
        </mesh>

        {/* Hand */}
        <mesh position={[0, -1.0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={bodyMain} roughness={0.3} metalness={0.3} />
        </mesh>
      </group>

      {/* ===== RIGHT ARM ===== */}
      <group ref={rightArmRef} position={[0.7, 0.9, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.1, 0.35, 16, 16]} />
          <meshStandardMaterial color={bodyMain} roughness={0.25} metalness={0.35} />
        </mesh>

        {/* Elbow joint */}
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial color={bodyDark} roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Forearm */}
        <mesh position={[0, -0.75, 0]}>
          <capsuleGeometry args={[0.08, 0.3, 16, 16]} />
          <meshStandardMaterial color={bodyAccent} roughness={0.3} metalness={0.3} />
        </mesh>

        {/* Hand */}
        <mesh position={[0, -1.0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={bodyMain} roughness={0.3} metalness={0.3} />
        </mesh>
      </group>

      {/* ===== HIPS & LEGS (Partial - visible portion) ===== */}
      <group position={[0, -0.1, 0]}>
        {/* Hip section */}
        <mesh>
          <boxGeometry args={[0.6, 0.2, 0.35]} />
          <meshStandardMaterial color={bodyAccent} roughness={0.3} metalness={0.35} />
        </mesh>

        {/* Left leg connector */}
        <mesh position={[-0.2, -0.2, 0]}>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshStandardMaterial color={bodyDark} roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Right leg connector */}
        <mesh position={[0.2, -0.2, 0]}>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshStandardMaterial color={bodyDark} roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Left thigh */}
        <mesh position={[-0.2, -0.5, 0]}>
          <capsuleGeometry args={[0.09, 0.35, 16, 16]} />
          <meshStandardMaterial color={bodyMain} roughness={0.25} metalness={0.35} />
        </mesh>

        {/* Right thigh */}
        <mesh position={[0.2, -0.5, 0]}>
          <capsuleGeometry args={[0.09, 0.35, 16, 16]} />
          <meshStandardMaterial color={bodyMain} roughness={0.25} metalness={0.35} />
        </mesh>
      </group>

      {/* Ambient glow from robot */}
      <pointLight color={glowColor} intensity={0.5} distance={4} position={[0, 1, 0.5]} />
    </group>
  );
}

// ============================================
// AMBIENT PARTICLES
// ============================================

function AmbientParticles() {
  const count = 60;
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3 - 2;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#60a5fa"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// ============================================
// SOFT GRADIENT PLANES (Background depth)
// ============================================

function GradientPlanes() {
  return (
    <group>
      {/* Background plane - soft gradient effect */}
      <mesh position={[0, 0, -3]} scale={[10, 8, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.6} />
      </mesh>

      {/* Subtle accent planes */}
      <mesh position={[-2, 1, -2.5]} rotation={[0, 0.3, 0]} scale={[3, 4, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#1e3a5f" transparent opacity={0.3} />
      </mesh>

      <mesh position={[2.5, -0.5, -2.8]} rotation={[0, -0.2, 0]} scale={[4, 3, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#172554" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// ============================================
// MAIN SCENE
// ============================================

function Scene() {
  return (
    <>
      {/* Soft, cinematic lighting */}
      <ambientLight intensity={0.4} color="#e0e7ff" />

      {/* Key light */}
      <directionalLight
        position={[3, 5, 3]}
        intensity={0.8}
        color="#f8fafc"
      />

      {/* Fill light */}
      <directionalLight
        position={[-4, 3, 2]}
        intensity={0.35}
        color="#dbeafe"
      />

      {/* Rim light for depth */}
      <directionalLight
        position={[0, -2, 4]}
        intensity={0.25}
        color="#93c5fd"
      />

      {/* Back light for separation */}
      <directionalLight
        position={[0, 2, -3]}
        intensity={0.2}
        color="#60a5fa"
      />

      {/* Background elements */}
      <GradientPlanes />

      {/* MASSIVE Robot */}
      <MassiveAIRobot />

      {/* Ambient particles */}
      <AmbientParticles />
    </>
  );
}

// ============================================
// EXPORTED COMPONENT
// ============================================

export function CleanBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 70%, #020617 100%)',
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default CleanBackground;
