/**
 * Clean White-Tone Background with Elegant AI Robot
 * 깔끔한 화이트톤 배경 + 세련된 AI 로봇
 *
 * Design inspiration: 1X NEO, Tesla Optimus Gen 2
 * - Minimalist humanoid form
 * - Soft, elegant materials
 * - Smooth, natural movements
 */

import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================
// ELEGANT HUMANOID AI ROBOT (NEO-inspired)
// ============================================

function ElegantAIRobot() {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const { pointer, viewport } = useThree();

  // Animation state stored in refs (no re-renders)
  const animState = useRef({
    targetX: 0.8,
    targetY: 0,
    currentX: 0.8,
    currentY: 0,
    wanderX: 0.8,
    wanderY: 0,
    wanderTimer: 0,
    wanderInterval: 4, // Fixed interval - no Math.random() in condition
    idleTime: 0,
    breathPhase: 0,
  });

  useFrame((state, delta) => {
    if (!groupRef.current || !headRef.current) return;

    const s = animState.current;
    const time = state.clock.elapsedTime;

    // Update wander timer with FIXED interval (no random in condition)
    s.wanderTimer += delta;
    if (s.wanderTimer >= s.wanderInterval) {
      s.wanderTimer = 0;
      // Set new random interval for next cycle
      s.wanderInterval = 3 + Math.random() * 3;
      // New random wander target within bounds
      s.wanderX = (Math.random() - 0.5) * 2;
      s.wanderY = (Math.random() - 0.5) * 0.8;
    }

    // Check mouse activity
    const mouseActive = Math.abs(pointer.x) > 0.03 || Math.abs(pointer.y) > 0.03;

    if (mouseActive) {
      // Follow mouse with curiosity
      s.targetX = pointer.x * viewport.width * 0.25;
      s.targetY = pointer.y * viewport.height * 0.25;
      s.idleTime = 0;
    } else {
      // Gradual transition to wander mode
      s.idleTime += delta;
      if (s.idleTime > 1.5) {
        const wanderLerp = Math.min((s.idleTime - 1.5) * 0.3, 1);
        s.targetX = THREE.MathUtils.lerp(s.targetX, s.wanderX, wanderLerp * delta);
        s.targetY = THREE.MathUtils.lerp(s.targetY, s.wanderY, wanderLerp * delta);
      }
    }

    // Smooth movement with easing
    s.currentX = THREE.MathUtils.lerp(s.currentX, s.targetX, delta * 1.8);
    s.currentY = THREE.MathUtils.lerp(s.currentY, s.targetY, delta * 1.8);

    // Apply position with gentle floating
    s.breathPhase += delta * 1.2;
    const floatY = Math.sin(s.breathPhase) * 0.015;
    const breathScale = 1 + Math.sin(s.breathPhase * 0.8) * 0.005;

    groupRef.current.position.x = s.currentX;
    groupRef.current.position.y = s.currentY + floatY;
    groupRef.current.scale.setScalar(0.55 * breathScale);

    // Head tracking with smooth easing
    const lookX = pointer.x * 0.4;
    const lookY = pointer.y * 0.25;
    headRef.current.rotation.y = THREE.MathUtils.lerp(
      headRef.current.rotation.y,
      lookX,
      delta * 4
    );
    headRef.current.rotation.x = THREE.MathUtils.lerp(
      headRef.current.rotation.x,
      -lookY * 0.5,
      delta * 4
    );

    // Subtle arm movement
    if (leftArmRef.current && rightArmRef.current) {
      const armSwing = Math.sin(time * 0.8) * 0.08;
      leftArmRef.current.rotation.x = armSwing;
      rightArmRef.current.rotation.x = -armSwing;
    }
  });

  // Premium material colors - soft, elegant
  const bodyColor = '#f8f9fa';
  const accentColor = '#e9ecef';
  const jointColor = '#dee2e6';
  const glowColor = '#4dabf7';
  const eyeColor = '#339af0';

  return (
    <group ref={groupRef} position={[0.8, 0, 0]}>
      {/* HEAD - Sleek, minimal design */}
      <group ref={headRef}>
        {/* Main head - smooth capsule */}
        <mesh>
          <capsuleGeometry args={[0.065, 0.04, 24, 24]} />
          <meshStandardMaterial
            color={bodyColor}
            roughness={0.25}
            metalness={0.3}
          />
        </mesh>

        {/* Face visor - elegant curved panel */}
        <mesh position={[0, 0.01, 0.05]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.09, 0.045, 0.02]} />
          <meshStandardMaterial
            color="#212529"
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>

        {/* Left Eye - soft glow */}
        <group position={[-0.022, 0.015, 0.055]}>
          <mesh>
            <circleGeometry args={[0.012, 32]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeColor}
              emissiveIntensity={0.8}
              roughness={0.1}
            />
          </mesh>
          <pointLight color={glowColor} intensity={0.15} distance={0.2} />
        </group>

        {/* Right Eye - soft glow */}
        <group position={[0.022, 0.015, 0.055]}>
          <mesh>
            <circleGeometry args={[0.012, 32]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeColor}
              emissiveIntensity={0.8}
              roughness={0.1}
            />
          </mesh>
          <pointLight color={glowColor} intensity={0.15} distance={0.2} />
        </group>

        {/* Ear sensors */}
        {[-0.065, 0.065].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.015, 0.018, 0.015, 16]} />
            <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.4} />
          </mesh>
        ))}
      </group>

      {/* NECK - Articulated segments */}
      <group position={[0, -0.08, 0]}>
        <mesh>
          <cylinderGeometry args={[0.022, 0.028, 0.035, 16]} />
          <meshStandardMaterial color={jointColor} roughness={0.4} metalness={0.3} />
        </mesh>
      </group>

      {/* TORSO - Elegant proportions */}
      <group position={[0, -0.2, 0]}>
        {/* Upper torso */}
        <mesh>
          <capsuleGeometry args={[0.055, 0.08, 16, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.25} metalness={0.3} />
        </mesh>

        {/* Chest indicator - subtle glow */}
        <mesh position={[0, 0.02, 0.05]}>
          <circleGeometry args={[0.018, 32]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={0.6}
            roughness={0.1}
          />
        </mesh>

        {/* Lower torso */}
        <mesh position={[0, -0.1, 0]}>
          <capsuleGeometry args={[0.045, 0.05, 16, 16]} />
          <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.25} />
        </mesh>

        {/* Shoulder joints */}
        {[-0.07, 0.07].map((x, i) => (
          <mesh key={i} position={[x, 0.035, 0]}>
            <sphereGeometry args={[0.022, 24, 24]} />
            <meshStandardMaterial color={jointColor} roughness={0.35} metalness={0.4} />
          </mesh>
        ))}
      </group>

      {/* LEFT ARM */}
      <group ref={leftArmRef} position={[-0.09, -0.18, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.045, 0]}>
          <capsuleGeometry args={[0.016, 0.05, 12, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.25} metalness={0.3} />
        </mesh>
        {/* Elbow */}
        <mesh position={[0, -0.085, 0]}>
          <sphereGeometry args={[0.014, 16, 16]} />
          <meshStandardMaterial color={jointColor} roughness={0.35} metalness={0.4} />
        </mesh>
        {/* Lower arm */}
        <mesh position={[0, -0.125, 0]}>
          <capsuleGeometry args={[0.013, 0.04, 12, 12]} />
          <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.25} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.165, 0]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.3} />
        </mesh>
      </group>

      {/* RIGHT ARM */}
      <group ref={rightArmRef} position={[0.09, -0.18, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.045, 0]}>
          <capsuleGeometry args={[0.016, 0.05, 12, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.25} metalness={0.3} />
        </mesh>
        {/* Elbow */}
        <mesh position={[0, -0.085, 0]}>
          <sphereGeometry args={[0.014, 16, 16]} />
          <meshStandardMaterial color={jointColor} roughness={0.35} metalness={0.4} />
        </mesh>
        {/* Lower arm */}
        <mesh position={[0, -0.125, 0]}>
          <capsuleGeometry args={[0.013, 0.04, 12, 12]} />
          <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.25} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.165, 0]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.3} />
        </mesh>
      </group>

      {/* Subtle ambient glow */}
      <pointLight color={glowColor} intensity={0.1} distance={0.8} />
    </group>
  );
}

// ============================================
// SUBTLE FLOATING PARTICLES
// ============================================

function SubtleParticles() {
  const count = 30;
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2 - 3;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.02;
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
        size={0.015}
        color="#adb5bd"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
}

// ============================================
// MAIN SCENE
// ============================================

function Scene() {
  return (
    <>
      {/* Soft, diffused lighting for elegant look */}
      <ambientLight intensity={0.7} color="#ffffff" />
      <directionalLight
        position={[3, 4, 2]}
        intensity={0.5}
        color="#f8f9fa"
        castShadow={false}
      />
      <directionalLight
        position={[-2, 3, -1]}
        intensity={0.25}
        color="#e7f5ff"
      />
      {/* Rim light for depth */}
      <directionalLight
        position={[0, -2, 3]}
        intensity={0.15}
        color="#d0ebff"
      />

      {/* Elegant AI Robot */}
      <ElegantAIRobot />

      {/* Subtle background particles */}
      <SubtleParticles />
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
        camera={{ position: [0, 0, 2], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        style={{
          background: 'linear-gradient(165deg, #ffffff 0%, #f8f9fa 30%, #f1f3f5 70%, #e9ecef 100%)',
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
