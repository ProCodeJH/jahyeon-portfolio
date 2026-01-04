/**
 * ULTRA PREMIUM 3D BACKGROUND
 * 슈퍼 하이퍼 메가 신 울트라 고퀄리티 999999%
 * AI Robot with Autonomous Behaviors + Tech Elements
 */

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Stars, Environment, Trail, Sparkles as DreiSparkles } from '@react-three/drei';
import * as THREE from 'three';

// ============================================
// POWERFUL AI ROBOT - MATURE CYBER DESIGN
// ============================================

interface AIBehavior {
  type: 'idle' | 'lookAtCursor' | 'wander' | 'hangOnText' | 'curious' | 'wave' | 'thinking';
  duration: number;
  startTime: number;
  target?: THREE.Vector3;
}

function PowerfulAIRobot({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const robotRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const antennaGlowRef = useRef<THREE.Mesh>(null);

  const [behavior, setBehavior] = useState<AIBehavior>({
    type: 'idle',
    duration: 3000,
    startTime: Date.now(),
  });

  const [robotPosition, setRobotPosition] = useState(new THREE.Vector3(0, 0, 0));
  const [targetPosition, setTargetPosition] = useState(new THREE.Vector3(0, 0, 0));
  const [expression, setExpression] = useState<'normal' | 'happy' | 'curious' | 'thinking'>('normal');

  // Autonomous behavior system
  useEffect(() => {
    const behaviors: AIBehavior['type'][] = ['lookAtCursor', 'wander', 'curious', 'thinking', 'wave', 'idle'];

    const changeBehavior = () => {
      const randomBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      const duration = 2000 + Math.random() * 4000;

      let target: THREE.Vector3 | undefined;

      if (randomBehavior === 'wander') {
        target = new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 3 - 2
        );
        setTargetPosition(target);
      } else if (randomBehavior === 'curious') {
        // Look at a random corner or element
        const points = [
          new THREE.Vector3(-6, 3, -3),
          new THREE.Vector3(6, 2, -4),
          new THREE.Vector3(0, 4, -2),
          new THREE.Vector3(-4, -2, -3),
          new THREE.Vector3(5, -1, -2),
        ];
        target = points[Math.floor(Math.random() * points.length)];
        setExpression('curious');
      } else if (randomBehavior === 'thinking') {
        setExpression('thinking');
      } else if (randomBehavior === 'wave') {
        setExpression('happy');
      } else {
        setExpression('normal');
      }

      setBehavior({
        type: randomBehavior,
        duration,
        startTime: Date.now(),
        target,
      });
    };

    const interval = setInterval(() => {
      if (Date.now() - behavior.startTime > behavior.duration) {
        changeBehavior();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [behavior]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (!robotRef.current || !headRef.current) return;

    // Robot floating animation
    robotRef.current.position.y = robotPosition.y + Math.sin(time * 0.8) * 0.15;

    // Smooth position interpolation for wandering
    if (behavior.type === 'wander') {
      robotPosition.x = THREE.MathUtils.lerp(robotPosition.x, targetPosition.x, 0.01);
      robotPosition.z = THREE.MathUtils.lerp(robotPosition.z, targetPosition.z, 0.01);
      robotRef.current.position.x = robotPosition.x;
      robotRef.current.position.z = robotPosition.z;
    } else {
      // Return to center slowly
      robotPosition.x = THREE.MathUtils.lerp(robotPosition.x, 0, 0.005);
      robotPosition.z = THREE.MathUtils.lerp(robotPosition.z, 0, 0.005);
      robotRef.current.position.x = robotPosition.x;
      robotRef.current.position.z = robotPosition.z;
    }

    // Head movement based on behavior
    let targetHeadRotationY = 0;
    let targetHeadRotationX = 0;

    if (behavior.type === 'lookAtCursor') {
      targetHeadRotationY = mousePosition.x * 0.5;
      targetHeadRotationX = -mousePosition.y * 0.3;
    } else if (behavior.type === 'curious' && behavior.target) {
      const direction = behavior.target.clone().sub(robotRef.current.position).normalize();
      targetHeadRotationY = Math.atan2(direction.x, direction.z);
      targetHeadRotationX = Math.asin(direction.y) * 0.5;
    } else if (behavior.type === 'thinking') {
      targetHeadRotationY = Math.sin(time * 0.5) * 0.2;
      targetHeadRotationX = 0.15;
    } else if (behavior.type === 'wander') {
      const moveDir = targetPosition.clone().sub(robotPosition).normalize();
      targetHeadRotationY = Math.atan2(moveDir.x, 1) * 0.3;
    }

    headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetHeadRotationY, 0.05);
    headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetHeadRotationX, 0.05);

    // Eye tracking - more dramatic pupil movement
    if (leftPupilRef.current && rightPupilRef.current) {
      let pupilX = 0;
      let pupilY = 0;

      if (behavior.type === 'lookAtCursor') {
        pupilX = mousePosition.x * 0.08;
        pupilY = mousePosition.y * 0.05;
      } else if (behavior.type === 'curious') {
        pupilX = Math.sin(time * 2) * 0.05;
        pupilY = Math.cos(time * 1.5) * 0.03;
      } else if (behavior.type === 'thinking') {
        pupilX = 0.04;
        pupilY = 0.03;
      }

      leftPupilRef.current.position.x = THREE.MathUtils.lerp(leftPupilRef.current.position.x, pupilX, 0.1);
      leftPupilRef.current.position.y = THREE.MathUtils.lerp(leftPupilRef.current.position.y, pupilY, 0.1);
      rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x, pupilX, 0.1);
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y, pupilY, 0.1);
    }

    // Arm animations
    if (leftArmRef.current && rightArmRef.current) {
      if (behavior.type === 'wave') {
        rightArmRef.current.rotation.z = Math.sin(time * 8) * 0.5 - 0.8;
        rightArmRef.current.rotation.x = -0.3;
      } else if (behavior.type === 'thinking') {
        rightArmRef.current.rotation.z = -0.3;
        rightArmRef.current.rotation.x = -0.8;
      } else {
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, Math.sin(time * 0.5) * 0.1, 0.05);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.05);
      }

      leftArmRef.current.rotation.z = Math.sin(time * 0.5 + Math.PI) * 0.1;
    }

    // Antenna glow pulsing
    if (antennaGlowRef.current) {
      const material = antennaGlowRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 1.5 + Math.sin(time * 3) * 0.5;
    }
  });

  // Eye color based on expression
  const eyeColor = useMemo(() => {
    switch (expression) {
      case 'happy': return '#00ff88';
      case 'curious': return '#00d4ff';
      case 'thinking': return '#ffaa00';
      default: return '#00ffff';
    }
  }, [expression]);

  return (
    <group ref={robotRef} position={[0, 0, 0]}>
      {/* Main Body - Armored Torso */}
      <group position={[0, -0.5, 0]}>
        {/* Core Torso */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 1.5, 0.7]} />
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>

        {/* Chest Armor Plates */}
        <mesh position={[0, 0.2, 0.36]} castShadow>
          <boxGeometry args={[1, 0.8, 0.08]} />
          <meshStandardMaterial color="#2d2d44" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Arc Reactor / Core */}
        <group position={[0, 0.2, 0.42]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#0a0a12" metalness={0.9} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.06, 32]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeColor}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
          <pointLight color={eyeColor} intensity={1} distance={3} />

          {/* Inner ring detail */}
          <mesh>
            <torusGeometry args={[0.12, 0.02, 16, 32]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={1.5} />
          </mesh>
        </group>

        {/* Side Armor Panels */}
        {[-1, 1].map((side) => (
          <mesh key={`armor-${side}`} position={[side * 0.55, 0, 0.1]} castShadow>
            <boxGeometry args={[0.15, 1.3, 0.5]} />
            <meshStandardMaterial color="#252538" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* Tech Lines */}
        {[0.4, 0, -0.4].map((y, i) => (
          <mesh key={`line-${i}`} position={[0, y, 0.41]}>
            <boxGeometry args={[0.9, 0.02, 0.01]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.8} />
          </mesh>
        ))}
      </group>

      {/* Head */}
      <group ref={headRef} position={[0, 0.6, 0]}>
        {/* Main Head Structure */}
        <mesh castShadow>
          <boxGeometry args={[0.9, 0.8, 0.7]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Face Plate */}
        <mesh position={[0, -0.05, 0.36]} castShadow>
          <boxGeometry args={[0.8, 0.6, 0.05]} />
          <meshStandardMaterial color="#0d0d18" metalness={0.8} roughness={0.05} />
        </mesh>

        {/* Visor */}
        <mesh position={[0, 0.1, 0.38]}>
          <boxGeometry args={[0.7, 0.25, 0.03]} />
          <meshPhysicalMaterial
            color="#000011"
            metalness={0.5}
            roughness={0}
            transparent
            opacity={0.9}
            transmission={0.3}
          />
        </mesh>

        {/* Eyes */}
        <group ref={leftEyeRef} position={[-0.2, 0.1, 0.4]}>
          {/* Eye Socket */}
          <mesh>
            <boxGeometry args={[0.18, 0.12, 0.02]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          {/* Eye Glow */}
          <mesh>
            <boxGeometry args={[0.15, 0.09, 0.01]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeColor}
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
          {/* Pupil */}
          <mesh ref={leftPupilRef} position={[0, 0, 0.015]}>
            <boxGeometry args={[0.06, 0.06, 0.01]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
          </mesh>
        </group>

        <group ref={rightEyeRef} position={[0.2, 0.1, 0.4]}>
          <mesh>
            <boxGeometry args={[0.18, 0.12, 0.02]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh>
            <boxGeometry args={[0.15, 0.09, 0.01]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeColor}
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
          <mesh ref={rightPupilRef} position={[0, 0, 0.015]}>
            <boxGeometry args={[0.06, 0.06, 0.01]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
          </mesh>
        </group>

        {/* Antenna Array */}
        <group position={[0, 0.5, 0]}>
          {/* Main Antenna */}
          <mesh>
            <cylinderGeometry args={[0.03, 0.02, 0.4, 8]} />
            <meshStandardMaterial color="#3d3d5c" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh ref={antennaGlowRef} position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color="#ff3366"
              emissive="#ff3366"
              emissiveIntensity={2}
            />
          </mesh>
          <pointLight position={[0, 0.25, 0]} color="#ff3366" intensity={0.5} distance={2} />

          {/* Side Antennas */}
          {[-1, 1].map((side) => (
            <group key={`ant-${side}`} position={[side * 0.3, -0.1, 0]} rotation={[0, 0, side * 0.3]}>
              <mesh>
                <cylinderGeometry args={[0.015, 0.01, 0.2, 6]} />
                <meshStandardMaterial color="#4a4a6a" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.12, 0]}>
                <sphereGeometry args={[0.025, 12, 12]} />
                <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={1} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Ear Panels */}
        {[-1, 1].map((side) => (
          <group key={`ear-${side}`} position={[side * 0.48, 0.05, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.4, 0.3]} />
              <meshStandardMaterial color="#252538" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh position={[side * 0.03, 0, 0.05]}>
              <boxGeometry args={[0.02, 0.2, 0.15]} />
              <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} />
            </mesh>
          </group>
        ))}

        {/* Chin Detail */}
        <mesh position={[0, -0.35, 0.25]} castShadow>
          <boxGeometry args={[0.4, 0.15, 0.25]} />
          <meshStandardMaterial color="#2a2a40" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* Arms */}
      <group ref={leftArmRef} position={[-0.75, -0.3, 0]}>
        {/* Shoulder */}
        <mesh castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#2a2a40" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Upper Arm */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.5, 8]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.7, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.4, 8]} />
          <meshStandardMaterial color="#252538" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -1, 0]} castShadow>
          <boxGeometry args={[0.12, 0.15, 0.08]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.75, -0.3, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#2a2a40" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.5, 8]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.7, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.4, 8]} />
          <meshStandardMaterial color="#252538" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, -1, 0]} castShadow>
          <boxGeometry args={[0.12, 0.15, 0.08]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} />
        </mesh>
      </group>

      {/* Hover Thrusters */}
      <group position={[0, -1.5, 0]}>
        {[[-0.3, 0], [0.3, 0], [0, -0.2]].map(([x, z], i) => (
          <group key={`thruster-${i}`} position={[x, 0, z]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.12, 0.2, 16]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.9} />
            </mesh>
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.1, 0.08, 0.05, 16]} />
              <meshStandardMaterial
                color="#00aaff"
                emissive="#00aaff"
                emissiveIntensity={2}
                transparent
                opacity={0.8}
              />
            </mesh>
            <pointLight position={[0, -0.2, 0]} color="#00aaff" intensity={0.3} distance={1} />
          </group>
        ))}
      </group>

      {/* Overall robot light */}
      <pointLight position={[0, 0.5, 1]} color={eyeColor} intensity={0.5} distance={5} />
    </group>
  );
}

// ============================================
// CIRCUIT BOARD - FLOATING TECH
// ============================================

function CircuitBoard({ position, rotation, scale = 1 }: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
      <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.12, 1.8]} />
          <meshStandardMaterial color="#0d5c30" roughness={0.7} metalness={0.2} />
        </mesh>

        {/* Copper traces */}
        {[...Array(12)].map((_, i) => (
          <mesh key={`trace-${i}`} position={[-1.1 + i * 0.2, 0.065, 0]}>
            <boxGeometry args={[0.03, 0.01, 1.5]} />
            <meshStandardMaterial color="#c9a227" metalness={0.95} roughness={0.2} />
          </mesh>
        ))}

        {/* IC Chip */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.8, 0.15, 0.8]} />
          <meshStandardMaterial color="#101010" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Capacitors */}
        {[[-0.8, 0.4], [0.8, 0.4], [-0.8, -0.4], [0.8, -0.4]].map(([x, z], i) => (
          <mesh key={`cap-${i}`} position={[x, 0.15, z]}>
            <cylinderGeometry args={[0.1, 0.1, 0.25, 16]} />
            <meshStandardMaterial color="#0055aa" metalness={0.5} roughness={0.3} />
          </mesh>
        ))}

        {/* LEDs */}
        {[[0.5, 0.6], [-0.5, 0.6]].map(([x, z], i) => (
          <mesh key={`led-${i}`} position={[x, 0.1, z]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial
              color={i === 0 ? '#00ff00' : '#ff0000'}
              emissive={i === 0 ? '#00ff00' : '#ff0000'}
              emissiveIntensity={2}
            />
          </mesh>
        ))}

        <pointLight position={[0.5, 0.15, 0.6]} color="#00ff00" intensity={0.3} distance={0.8} />
      </group>
    </Float>
  );
}

// ============================================
// ATOM - CHEMISTRY ELEMENT
// ============================================

function Atom({ position, scale = 1, color = '#0ea5e9' }: {
  position: [number, number, number];
  scale?: number;
  color?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const orbit1Ref = useRef<THREE.Group>(null);
  const orbit2Ref = useRef<THREE.Group>(null);
  const orbit3Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
    if (orbit1Ref.current) orbit1Ref.current.rotation.z = time * 2;
    if (orbit2Ref.current) orbit2Ref.current.rotation.x = time * 1.5;
    if (orbit3Ref.current) orbit3Ref.current.rotation.y = time * 1.8;
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={1}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Nucleus */}
        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <MeshDistortMaterial
            color={color}
            distort={0.2}
            speed={3}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <pointLight color={color} intensity={0.8} distance={4} />

        {/* Electron Orbits */}
        <group ref={orbit1Ref}>
          <mesh>
            <torusGeometry args={[1.2, 0.015, 8, 64]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} />
          </mesh>
          <mesh position={[1.2, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
          </mesh>
        </group>

        <group ref={orbit2Ref} rotation={[Math.PI / 3, 0, 0]}>
          <mesh>
            <torusGeometry args={[1.2, 0.015, 8, 64]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
          </mesh>
        </group>

        <group ref={orbit3Ref} rotation={[0, 0, Math.PI / 3]}>
          <mesh>
            <torusGeometry args={[1.2, 0.015, 8, 64]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} />
          </mesh>
          <mesh position={[-1.2, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

// ============================================
// DNA HELIX - BIO TECH
// ============================================

function DNAHelix({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.008;
    }
  });

  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 25; i++) {
      const t = i / 25;
      const angle = t * Math.PI * 5;
      pts.push({
        pos1: [Math.cos(angle) * 0.6, t * 5 - 2.5, Math.sin(angle) * 0.6] as [number, number, number],
        pos2: [Math.cos(angle + Math.PI) * 0.6, t * 5 - 2.5, Math.sin(angle + Math.PI) * 0.6] as [number, number, number],
      });
    }
    return pts;
  }, []);

  return (
    <Float speed={1} rotationIntensity={0.15} floatIntensity={0.5}>
      <group ref={groupRef} position={position} scale={0.4}>
        {points.map((pt, i) => (
          <group key={i}>
            <mesh position={pt.pos1}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={pt.pos2}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color="#ff00aa" emissive="#ff00aa" emissiveIntensity={0.6} />
            </mesh>
            {i % 3 === 0 && (
              <mesh position={[(pt.pos1[0] + pt.pos2[0]) / 2, pt.pos1[1], (pt.pos1[2] + pt.pos2[2]) / 2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
                <meshStandardMaterial color="#22ff66" emissive="#22ff66" emissiveIntensity={0.3} />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </Float>
  );
}

// ============================================
// TECH CUBE - FLOATING
// ============================================

function TechCube({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.4;
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.8} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial
          color={color}
          metalness={0.85}
          roughness={0.15}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
    </Float>
  );
}

// ============================================
// PARTICLE FIELD
// ============================================

function ParticleField({ count = 400 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#00ffff'),
      new THREE.Color('#ff00ff'),
      new THREE.Color('#00ff88'),
      new THREE.Color('#ffaa00'),
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const color = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0003;
      pointsRef.current.rotation.x += 0.0001;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}

// ============================================
// MAIN SCENE
// ============================================

function Scene({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[15, 15, 15]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-15, -10, -15]} intensity={0.6} color="#00aaff" />
      <spotLight position={[0, 15, 0]} angle={0.4} penumbra={1} intensity={0.9} color="#aa66ff" castShadow />

      {/* Stars */}
      <Stars radius={120} depth={60} count={8000} factor={5} saturation={0.2} fade speed={0.8} />

      {/* Sparkles */}
      <DreiSparkles count={100} scale={20} size={3} speed={0.5} color="#00ffff" />

      {/* AI Robot - Center */}
      <PowerfulAIRobot mousePosition={mousePosition} />

      {/* Circuit Boards */}
      <CircuitBoard position={[-7, 2, -4]} rotation={[0.3, 0.6, 0.1]} scale={0.7} />
      <CircuitBoard position={[7, -1, -5]} rotation={[-0.2, -0.4, 0.15]} scale={0.5} />
      <CircuitBoard position={[-5, -3, -3]} rotation={[0.2, 0.9, 0]} scale={0.4} />

      {/* Atoms */}
      <Atom position={[-5, 4, -3]} scale={0.6} color="#00ffff" />
      <Atom position={[6, 3, -4]} scale={0.5} color="#ff00aa" />
      <Atom position={[4, -4, -3]} scale={0.55} color="#00ff88" />

      {/* DNA Helix */}
      <DNAHelix position={[-8, 0, -6]} />
      <DNAHelix position={[8, 2, -5]} />

      {/* Tech Cubes */}
      <TechCube position={[-4, 5, -2]} color="#00ffff" />
      <TechCube position={[5, 4, -3]} color="#ff00aa" />
      <TechCube position={[-3, -5, -2]} color="#00ff88" />
      <TechCube position={[4, -3, -1]} color="#ffaa00" />
      <TechCube position={[0, 6, -4]} color="#aa66ff" />
      <TechCube position={[-6, 1, -2]} color="#66ffaa" />

      {/* Particle Field */}
      <ParticleField count={500} />

      {/* Environment */}
      <Environment preset="night" />
    </>
  );
}

// ============================================
// MAIN EXPORT
// ============================================

export default function UltraPremiumBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        shadows
      >
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 12, 50]} />
        <Scene mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}

export { UltraPremiumBackground };
