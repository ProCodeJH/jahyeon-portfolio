/**
 * Clean Simple Background with Free-Moving AI Robot
 * 깔끔하고 심플한 배경 + 자유롭게 움직이는 AI 로봇
 */

import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================
// ELEGANT HUMANOID AI ROBOT
// ============================================

function AIRobot() {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const { pointer, viewport } = useThree();

  // Use refs for animation state (no re-renders)
  const targetPosition = useRef(new THREE.Vector3(0.5, 0, 0));
  const currentPosition = useRef(new THREE.Vector3(0.5, 0, 0));
  const wanderTarget = useRef(new THREE.Vector3(0.5, 0, 0));
  const wanderTimer = useRef(0);
  const idleTimer = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (!groupRef.current || !headRef.current) return;

    // Update wander target every 3-5 seconds
    wanderTimer.current += delta;
    if (wanderTimer.current > 3 + Math.random() * 2) {
      wanderTimer.current = 0;
      // Random position within bounds
      wanderTarget.current.set(
        (Math.random() - 0.5) * 1.5, // X: -0.75 to 0.75
        (Math.random() - 0.5) * 0.6, // Y: -0.3 to 0.3
        0
      );
    }

    // Check if mouse is active
    const mouseActive = Math.abs(pointer.x) > 0.05 || Math.abs(pointer.y) > 0.05;

    if (mouseActive) {
      // Follow mouse
      targetPosition.current.set(
        pointer.x * viewport.width * 0.3,
        pointer.y * viewport.height * 0.3,
        0
      );
      idleTimer.current = 0;
    } else {
      // Wander freely
      idleTimer.current += delta;
      if (idleTimer.current > 1) {
        targetPosition.current.lerp(wanderTarget.current, delta * 0.5);
      }
    }

    // Smooth movement
    currentPosition.current.lerp(targetPosition.current, delta * 2);
    groupRef.current.position.x = currentPosition.current.x;
    groupRef.current.position.y = currentPosition.current.y + Math.sin(time * 1.5) * 0.02;

    // Head looks at mouse
    const lookX = pointer.x * 0.3;
    const lookY = pointer.y * 0.2;
    headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, lookX, delta * 3);
    headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -lookY, delta * 3);
  });

  // Eye glow color
  const eyeColor = '#00d4ff';

  return (
    <group ref={groupRef} position={[0.5, 0, 0]} scale={0.6}>
      {/* Head */}
      <group ref={headRef}>
        {/* Face plate - sleek oval */}
        <mesh>
          <capsuleGeometry args={[0.08, 0.06, 16, 16]} />
          <meshStandardMaterial
            color="#e8e8e8"
            roughness={0.15}
            metalness={0.8}
          />
        </mesh>

        {/* Forehead detail */}
        <mesh position={[0, 0.06, 0.04]}>
          <boxGeometry args={[0.1, 0.03, 0.02]} />
          <meshStandardMaterial color="#00b4d8" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Left Eye */}
        <group position={[-0.025, 0.01, 0.075]}>
          <mesh>
            <sphereGeometry args={[0.018, 24, 24]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeColor}
              emissiveIntensity={1.5}
              roughness={0.1}
            />
          </mesh>
          <pointLight color={eyeColor} intensity={0.3} distance={0.3} />
        </group>

        {/* Right Eye */}
        <group position={[0.025, 0.01, 0.075]}>
          <mesh>
            <sphereGeometry args={[0.018, 24, 24]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeColor}
              emissiveIntensity={1.5}
              roughness={0.1}
            />
          </mesh>
          <pointLight color={eyeColor} intensity={0.3} distance={0.3} />
        </group>

        {/* Side head panels */}
        {[-0.07, 0.07].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.025, 0.08, 16]} />
            <meshStandardMaterial color="#d0d0d0" roughness={0.2} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Neck */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.04, 16]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Torso */}
      <group position={[0, -0.22, 0]}>
        {/* Main body */}
        <mesh>
          <capsuleGeometry args={[0.06, 0.12, 16, 16]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.2} metalness={0.7} />
        </mesh>

        {/* Chest light */}
        <mesh position={[0, 0.02, 0.055]}>
          <circleGeometry args={[0.025, 24]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={2}
            roughness={0.1}
          />
        </mesh>
        <pointLight color="#00d4ff" intensity={0.5} distance={0.5} position={[0, 0.02, 0.06]} />

        {/* Shoulder joints */}
        {[-0.08, 0.08].map((x, i) => (
          <mesh key={i} position={[x, 0.04, 0]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color="#e0e0e0" roughness={0.25} metalness={0.85} />
          </mesh>
        ))}
      </group>

      {/* Arms */}
      {[-1, 1].map((side, i) => (
        <group key={i} position={[side * 0.1, -0.22, 0]}>
          {/* Upper arm */}
          <mesh position={[side * 0.02, -0.06, 0]}>
            <capsuleGeometry args={[0.018, 0.06, 8, 8]} />
            <meshStandardMaterial color="#e8e8e8" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Lower arm */}
          <mesh position={[side * 0.02, -0.14, 0]}>
            <capsuleGeometry args={[0.015, 0.05, 8, 8]} />
            <meshStandardMaterial color="#d8d8d8" roughness={0.25} metalness={0.75} />
          </mesh>
          {/* Hand */}
          <mesh position={[side * 0.02, -0.2, 0]}>
            <sphereGeometry args={[0.015, 12, 12]} />
            <meshStandardMaterial color="#f0f0f0" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Ambient glow */}
      <pointLight color="#00d4ff" intensity={0.2} distance={1} />
    </group>
  );
}

// ============================================
// SIMPLE PARTICLE BACKGROUND
// ============================================

function SimpleParticles() {
  const count = 50;
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2 - 2;
    }
    return positions;
  }, []);

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
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#335577"
        transparent
        opacity={0.4}
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
      {/* Simple lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 2]} intensity={0.6} />
      <directionalLight position={[-2, 2, -1]} intensity={0.2} color="#88aaff" />

      {/* AI Robot */}
      <AIRobot />

      {/* Subtle particles */}
      <SimpleParticles />
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
        style={{ background: 'linear-gradient(180deg, #0a0a14 0%, #101020 100%)' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default CleanBackground;
