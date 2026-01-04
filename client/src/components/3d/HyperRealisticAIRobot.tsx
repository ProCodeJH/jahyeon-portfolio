/**
 * Hyper-Realistic Autonomous 3D AI Robot
 * FSM-Based Behavior System with PBR Rendering
 *
 * ARCHITECTURE:
 * - Finite State Machine: IDLE → OBSERVE → FOCUS → REACT → RESET
 * - PBR Materials with HDR Environment
 * - Mouse-to-Robot Tracking with Smooth Interpolation
 * - DOM ↔ 3D Awareness
 * - 60 FPS Requirement
 */

import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================
// FSM STATE TYPES
// ============================================

type RobotState = 'IDLE' | 'OBSERVE' | 'FOCUS' | 'REACT' | 'RESET';

interface FSMContext {
  state: RobotState;
  stateStartTime: number;
  focusTarget: THREE.Vector3 | null;
  curiosityLevel: number; // 0-1
  reactionType: 'wave' | 'nod' | 'blink' | 'curious' | null;
  idleAnimation: 'breathe' | 'lookAround' | 'hover';
}

// ============================================
// FSM TRANSITIONS
// ============================================

const STATE_DURATIONS: Record<RobotState, number> = {
  IDLE: 3000,
  OBSERVE: 2000,
  FOCUS: 4000,
  REACT: 1500,
  RESET: 500,
};

const TRANSITION_RULES: Record<RobotState, RobotState[]> = {
  IDLE: ['OBSERVE', 'FOCUS'],
  OBSERVE: ['FOCUS', 'IDLE', 'REACT'],
  FOCUS: ['REACT', 'OBSERVE', 'IDLE'],
  REACT: ['RESET', 'OBSERVE'],
  RESET: ['IDLE'],
};

// ============================================
// ROBOT GEOMETRY (Procedural, Hyper-Detailed)
// ============================================

function RobotHead({
  headRotation,
  eyeTargets,
  eyeGlow,
  isThinking,
  expression,
}: {
  headRotation: THREE.Euler;
  eyeTargets: { left: THREE.Vector3; right: THREE.Vector3 };
  eyeGlow: number;
  isThinking: boolean;
  expression: 'neutral' | 'curious' | 'happy' | 'focused';
}) {
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const visorRef = useRef<THREE.Mesh>(null);

  // Smooth head rotation
  useFrame((state, delta) => {
    if (headRef.current) {
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        headRotation.x,
        delta * 4
      );
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        headRotation.y,
        delta * 4
      );
    }
  });

  // Eye color based on expression
  const eyeColor = useMemo(() => {
    switch (expression) {
      case 'curious': return new THREE.Color('#fbbf24');
      case 'happy': return new THREE.Color('#22c55e');
      case 'focused': return new THREE.Color('#3b82f6');
      default: return new THREE.Color('#06b6d4');
    }
  }, [expression]);

  return (
    <group ref={headRef}>
      {/* Main head shell - Armored design */}
      <mesh castShadow>
        <boxGeometry args={[0.18, 0.14, 0.16]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.2}
          metalness={0.9}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Head chamfered edges */}
      {[
        [-0.085, 0.065, 0],
        [0.085, 0.065, 0],
        [-0.085, -0.065, 0],
        [0.085, -0.065, 0],
      ].map((pos, i) => (
        <mesh key={`edge-${i}`} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.015, 0.015, 0.15]} />
          <meshStandardMaterial color="#0891b2" roughness={0.3} metalness={0.95} />
        </mesh>
      ))}

      {/* Visor / Face plate */}
      <mesh ref={visorRef} position={[0, 0.01, 0.075]} castShadow>
        <boxGeometry args={[0.14, 0.08, 0.02]} />
        <meshPhysicalMaterial
          color="#0a0a12"
          roughness={0.05}
          metalness={0.1}
          transmission={0.3}
          thickness={0.5}
        />
      </mesh>

      {/* Left Eye */}
      <group position={[-0.035, 0.015, 0.085]}>
        {/* Eye housing */}
        <mesh>
          <cylinderGeometry args={[0.022, 0.022, 0.015, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#0a0a12" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Eye core */}
        <mesh ref={leftEyeRef} position={[0, 0, 0.008]}>
          <sphereGeometry args={[0.015, 24, 24]} />
          <meshStandardMaterial
            color={eyeColor}
            emissive={eyeColor}
            emissiveIntensity={eyeGlow * 2}
            roughness={0.1}
            metalness={0.5}
          />
        </mesh>
        {/* Pupil */}
        <mesh position={[0, 0, 0.016]}>
          <sphereGeometry args={[0.006, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.1} />
        </mesh>
        {/* Eye glow effect */}
        <pointLight color={eyeColor} intensity={eyeGlow * 0.5} distance={0.3} />
      </group>

      {/* Right Eye */}
      <group position={[0.035, 0.015, 0.085]}>
        <mesh>
          <cylinderGeometry args={[0.022, 0.022, 0.015, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#0a0a12" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh ref={rightEyeRef} position={[0, 0, 0.008]}>
          <sphereGeometry args={[0.015, 24, 24]} />
          <meshStandardMaterial
            color={eyeColor}
            emissive={eyeColor}
            emissiveIntensity={eyeGlow * 2}
            roughness={0.1}
            metalness={0.5}
          />
        </mesh>
        <mesh position={[0, 0, 0.016]}>
          <sphereGeometry args={[0.006, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.1} />
        </mesh>
        <pointLight color={eyeColor} intensity={eyeGlow * 0.5} distance={0.3} />
      </group>

      {/* Antenna array */}
      <group position={[0, 0.08, 0]}>
        {/* Main antenna */}
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.003, 0.005, 0.06, 8]} />
          <meshStandardMaterial color="#0891b2" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.065, 0]}>
          <sphereGeometry args={[0.008, 16, 16]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={isThinking ? 2 : 0.5}
            roughness={0.2}
          />
        </mesh>

        {/* Side antennas */}
        {[-0.04, 0.04].map((x, i) => (
          <group key={`antenna-${i}`} position={[x, 0.015, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.002, 0.003, 0.03, 6]} />
              <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <sphereGeometry args={[0.004, 8, 8]} />
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={isThinking ? 1.5 : 0.3}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Ear panels */}
      {[-0.095, 0.095].map((x, i) => (
        <group key={`ear-${i}`} position={[x, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.02, 0.08, 0.12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Ear vents */}
          {[-0.025, 0, 0.025].map((z, j) => (
            <mesh key={`vent-${j}`} position={[x > 0 ? 0.012 : -0.012, 0, z]}>
              <boxGeometry args={[0.003, 0.05, 0.015]} />
              <meshStandardMaterial color="#0a0a12" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Chin / Jaw detail */}
      <mesh position={[0, -0.06, 0.04]} castShadow>
        <boxGeometry args={[0.1, 0.02, 0.08]} />
        <meshStandardMaterial color="#1e293b" roughness={0.25} metalness={0.9} />
      </mesh>

      {/* Mouth / Speaker grille */}
      <group position={[0, -0.04, 0.08]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={`grille-${i}`} position={[(i - 2) * 0.015, 0, 0]}>
            <boxGeometry args={[0.008, 0.015, 0.005]} />
            <meshStandardMaterial color="#0a0a12" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function RobotTorso({
  arcReactorPulse,
  breatheOffset,
}: {
  arcReactorPulse: number;
  breatheOffset: number;
}) {
  return (
    <group position={[0, -0.15, 0]}>
      {/* Main torso */}
      <mesh castShadow scale={[1, 1 + breatheOffset * 0.02, 1]}>
        <boxGeometry args={[0.22, 0.18, 0.14]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Shoulder joints */}
      {[-0.12, 0.12].map((x, i) => (
        <group key={`shoulder-${i}`} position={[x, 0.06, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color="#0891b2" roughness={0.3} metalness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Arc Reactor (Center chest) */}
      <group position={[0, 0.02, 0.075]}>
        {/* Housing */}
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 24]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Inner ring */}
        <mesh position={[0, 0, 0.005]}>
          <torusGeometry args={[0.028, 0.005, 16, 32]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={1 + arcReactorPulse}
            roughness={0.2}
          />
        </mesh>
        {/* Core */}
        <mesh position={[0, 0, 0.008]}>
          <sphereGeometry args={[0.018, 24, 24]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#22d3ee"
            emissiveIntensity={2 + arcReactorPulse * 2}
            roughness={0.05}
            metalness={0}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Core glow */}
        <pointLight
          color="#22d3ee"
          intensity={0.5 + arcReactorPulse * 0.5}
          distance={0.5}
        />
      </group>

      {/* Chest plate details */}
      {[-0.06, 0.06].map((x, i) => (
        <mesh key={`plate-${i}`} position={[x, -0.03, 0.072]} castShadow>
          <boxGeometry args={[0.04, 0.06, 0.01]} />
          <meshStandardMaterial color="#1e293b" roughness={0.25} metalness={0.85} />
        </mesh>
      ))}

      {/* Waist section */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[0.16, 0.04, 0.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  );
}

function RobotArms({
  leftArmRotation,
  rightArmRotation,
  isWaving,
}: {
  leftArmRotation: THREE.Euler;
  rightArmRotation: THREE.Euler;
  isWaving: boolean;
}) {
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
        leftArmRef.current.rotation.x,
        leftArmRotation.x,
        delta * 3
      );
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(
        leftArmRef.current.rotation.z,
        leftArmRotation.z,
        delta * 3
      );
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.x,
        rightArmRotation.x,
        delta * 3
      );
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.z,
        rightArmRotation.z + (isWaving ? Math.sin(state.clock.elapsedTime * 8) * 0.3 : 0),
        delta * 3
      );
    }
  });

  const ArmSegment = ({ side }: { side: 'left' | 'right' }) => (
    <group ref={side === 'left' ? leftArmRef : rightArmRef}>
      {/* Upper arm */}
      <mesh position={[0, -0.04, 0]} castShadow>
        <boxGeometry args={[0.035, 0.08, 0.035]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.25} metalness={0.9} />
      </mesh>
      {/* Elbow joint */}
      <mesh position={[0, -0.085, 0]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color="#0891b2" roughness={0.3} metalness={0.95} />
      </mesh>
      {/* Forearm */}
      <mesh position={[0, -0.13, 0]} castShadow>
        <boxGeometry args={[0.03, 0.07, 0.03]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Hand */}
      <mesh position={[0, -0.175, 0]} castShadow>
        <boxGeometry args={[0.025, 0.03, 0.02]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  );

  return (
    <>
      <group position={[-0.13, -0.1, 0]}>
        <ArmSegment side="left" />
      </group>
      <group position={[0.13, -0.1, 0]}>
        <ArmSegment side="right" />
      </group>
    </>
  );
}

function HoverThrusters({
  thrusterIntensity,
  hoverOffset,
}: {
  thrusterIntensity: number;
  hoverOffset: number;
}) {
  return (
    <group position={[0, -0.35 + hoverOffset * 0.01, 0]}>
      {/* Thruster housings */}
      {[
        [-0.05, 0, -0.03],
        [0.05, 0, -0.03],
        [-0.05, 0, 0.03],
        [0.05, 0, 0.03],
      ].map((pos, i) => (
        <group key={`thruster-${i}`} position={pos as [number, number, number]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.02, 0.03, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Thruster glow */}
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.012, 0.008, 0.015, 12]} />
            <meshStandardMaterial
              color="#f97316"
              emissive="#f97316"
              emissiveIntensity={thrusterIntensity * 3}
              transparent
              opacity={0.8}
            />
          </mesh>
          <pointLight
            color="#f97316"
            intensity={thrusterIntensity * 0.3}
            distance={0.2}
            position={[0, -0.03, 0]}
          />
        </group>
      ))}

      {/* Thruster exhaust effect */}
      {thrusterIntensity > 0.3 && (
        <mesh position={[0, -0.05, 0]}>
          <coneGeometry args={[0.08, 0.15 * thrusterIntensity, 16]} />
          <meshBasicMaterial
            color="#f97316"
            transparent
            opacity={0.2 * thrusterIntensity}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// ============================================
// MAIN AI ROBOT COMPONENT
// ============================================

interface HyperRealisticAIRobotProps {
  position?: [number, number, number];
  scale?: number;
}

export function HyperRealisticAIRobot({
  position = [0, 0, 0],
  scale = 1,
}: HyperRealisticAIRobotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer, viewport, camera } = useThree();

  // FSM State
  const [fsmContext, setFsmContext] = useState<FSMContext>({
    state: 'IDLE',
    stateStartTime: Date.now(),
    focusTarget: null,
    curiosityLevel: 0,
    reactionType: null,
    idleAnimation: 'breathe',
  });

  // Animation values
  const [headRotation, setHeadRotation] = useState(new THREE.Euler(0, 0, 0));
  const [leftArmRotation] = useState(new THREE.Euler(0, 0, 0.2));
  const [rightArmRotation] = useState(new THREE.Euler(0, 0, -0.2));
  const [eyeGlow, setEyeGlow] = useState(1);
  const [expression, setExpression] = useState<'neutral' | 'curious' | 'happy' | 'focused'>('neutral');
  const [isWaving, setIsWaving] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [arcReactorPulse, setArcReactorPulse] = useState(0);
  const [thrusterIntensity, setThrusterIntensity] = useState(0.5);
  const [hoverOffset, setHoverOffset] = useState(0);
  const [breatheOffset, setBreatheOffset] = useState(0);

  // Mouse tracking target
  const mouseTarget = useRef(new THREE.Vector3());
  const smoothedTarget = useRef(new THREE.Vector3());

  // FSM Transition Logic
  const transitionState = useCallback((newState: RobotState) => {
    if (!TRANSITION_RULES[fsmContext.state].includes(newState)) {
      console.warn(`Invalid transition from ${fsmContext.state} to ${newState}`);
      return;
    }

    setFsmContext(prev => ({
      ...prev,
      state: newState,
      stateStartTime: Date.now(),
    }));
  }, [fsmContext.state]);

  // Update mouse target from pointer
  useEffect(() => {
    const updateMouseTarget = () => {
      // Convert screen coordinates to world space
      const x = (pointer.x * viewport.width) / 2;
      const y = (pointer.y * viewport.height) / 2;
      mouseTarget.current.set(x * 0.5, y * 0.3, 0.5);
    };

    updateMouseTarget();
  }, [pointer, viewport]);

  // Main animation loop
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const now = Date.now();
    const stateElapsed = now - fsmContext.stateStartTime;

    // Smooth mouse tracking interpolation
    smoothedTarget.current.lerp(mouseTarget.current, delta * 3);

    // Calculate head rotation to look at target
    const targetRotationY = Math.atan2(smoothedTarget.current.x, 0.5) * 0.8;
    const targetRotationX = Math.atan2(-smoothedTarget.current.y, 0.5) * 0.5;

    // FSM State Behaviors
    switch (fsmContext.state) {
      case 'IDLE':
        // Gentle idle animations
        setHeadRotation(new THREE.Euler(
          Math.sin(time * 0.5) * 0.05,
          Math.sin(time * 0.3) * 0.1,
          0
        ));
        setEyeGlow(0.8 + Math.sin(time * 2) * 0.2);
        setExpression('neutral');
        setIsWaving(false);
        setIsThinking(false);

        // Transition to OBSERVE on mouse movement
        if (Math.abs(pointer.x) > 0.1 || Math.abs(pointer.y) > 0.1) {
          transitionState('OBSERVE');
        }

        // Random transition to look around
        if (stateElapsed > STATE_DURATIONS.IDLE && Math.random() < 0.01) {
          transitionState('OBSERVE');
        }
        break;

      case 'OBSERVE':
        // Track mouse with head
        setHeadRotation(new THREE.Euler(targetRotationX, targetRotationY, 0));
        setEyeGlow(1.2);
        setExpression('curious');
        setIsThinking(true);

        // Increase curiosity
        setFsmContext(prev => ({
          ...prev,
          curiosityLevel: Math.min(1, prev.curiosityLevel + delta * 0.3),
        }));

        // Transition to FOCUS if curious enough
        if (fsmContext.curiosityLevel > 0.7) {
          transitionState('FOCUS');
        }

        // Return to IDLE if mouse stops moving
        if (stateElapsed > STATE_DURATIONS.OBSERVE) {
          transitionState('IDLE');
        }
        break;

      case 'FOCUS':
        // Intense focus on target
        setHeadRotation(new THREE.Euler(targetRotationX * 1.2, targetRotationY * 1.2, 0));
        setEyeGlow(1.8);
        setExpression('focused');
        setIsThinking(true);

        // Occasional reaction
        if (stateElapsed > STATE_DURATIONS.FOCUS * 0.5 && Math.random() < 0.02) {
          setFsmContext(prev => ({
            ...prev,
            reactionType: Math.random() > 0.5 ? 'wave' : 'nod',
          }));
          transitionState('REACT');
        }

        // Return to observe
        if (stateElapsed > STATE_DURATIONS.FOCUS) {
          transitionState('OBSERVE');
        }
        break;

      case 'REACT':
        // Perform reaction animation
        if (fsmContext.reactionType === 'wave') {
          setIsWaving(true);
          setExpression('happy');
        } else if (fsmContext.reactionType === 'nod') {
          setHeadRotation(new THREE.Euler(
            Math.sin(time * 8) * 0.15,
            targetRotationY,
            0
          ));
          setExpression('happy');
        }
        setEyeGlow(2);

        // Complete reaction
        if (stateElapsed > STATE_DURATIONS.REACT) {
          transitionState('RESET');
        }
        break;

      case 'RESET':
        // Return to neutral
        setHeadRotation(new THREE.Euler(0, 0, 0));
        setEyeGlow(1);
        setExpression('neutral');
        setIsWaving(false);
        setIsThinking(false);

        // Reset curiosity
        setFsmContext(prev => ({
          ...prev,
          curiosityLevel: 0,
          reactionType: null,
        }));

        if (stateElapsed > STATE_DURATIONS.RESET) {
          transitionState('IDLE');
        }
        break;
    }

    // Continuous animations
    setArcReactorPulse(Math.sin(time * 3) * 0.3);
    setHoverOffset(Math.sin(time * 1.5) * 0.5 + 0.5);
    setBreatheOffset(Math.sin(time * 1) * 0.5);
    setThrusterIntensity(0.4 + Math.sin(time * 2) * 0.2 + hoverOffset * 0.2);

    // Group hover animation
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Main robot assembly */}
      <RobotHead
        headRotation={headRotation}
        eyeTargets={{ left: smoothedTarget.current, right: smoothedTarget.current }}
        eyeGlow={eyeGlow}
        isThinking={isThinking}
        expression={expression}
      />
      <RobotTorso
        arcReactorPulse={arcReactorPulse}
        breatheOffset={breatheOffset}
      />
      <RobotArms
        leftArmRotation={leftArmRotation}
        rightArmRotation={rightArmRotation}
        isWaving={isWaving}
      />
      <HoverThrusters
        thrusterIntensity={thrusterIntensity}
        hoverOffset={hoverOffset}
      />

      {/* Ambient glow */}
      <pointLight
        color="#06b6d4"
        intensity={0.3}
        distance={1}
        position={[0, 0, 0.2]}
      />
    </group>
  );
}

export default HyperRealisticAIRobot;
