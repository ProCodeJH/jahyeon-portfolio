/**
 * Ultra Premium 3D Background
 * AI Robot with eyes following cursor + IT/Circuit/Chemistry elements
 * 슈퍼 하이퍼 메가 신 울트라 고퀄리티 3D 배경
 */

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Stars, Sphere, Box, Torus, Icosahedron, Dodecahedron, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ============================================
// AI ROBOT HEAD - Eyes Follow Cursor
// ============================================

function AIRobotHead({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!headRef.current) return;

    // Subtle head movement following cursor
    const targetRotationY = mousePosition.x * 0.3;
    const targetRotationX = -mousePosition.y * 0.2;

    headRef.current.rotation.y = THREE.MathUtils.lerp(
      headRef.current.rotation.y,
      targetRotationY,
      0.05
    );
    headRef.current.rotation.x = THREE.MathUtils.lerp(
      headRef.current.rotation.x,
      targetRotationX,
      0.05
    );

    // Eye pupils follow cursor more dramatically
    if (leftPupilRef.current && rightPupilRef.current) {
      const pupilX = mousePosition.x * 0.15;
      const pupilY = mousePosition.y * 0.1;

      leftPupilRef.current.position.x = THREE.MathUtils.lerp(
        leftPupilRef.current.position.x,
        pupilX,
        0.1
      );
      leftPupilRef.current.position.y = THREE.MathUtils.lerp(
        leftPupilRef.current.position.y,
        pupilY,
        0.1
      );
      rightPupilRef.current.position.x = THREE.MathUtils.lerp(
        rightPupilRef.current.position.x,
        pupilX,
        0.1
      );
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(
        rightPupilRef.current.position.y,
        pupilY,
        0.1
      );
    }

    // Floating animation
    headRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={headRef} position={[0, 0, 0]}>
        {/* Robot Head - Metallic */}
        <mesh castShadow>
          <sphereGeometry args={[1.5, 64, 64]} />
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1}
          />
        </mesh>

        {/* Helmet Top */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <sphereGeometry args={[1.2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#0ea5e9"
            metalness={0.8}
            roughness={0.2}
            emissive="#0ea5e9"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Face Visor */}
        <mesh position={[0, 0, 0.8]} castShadow>
          <boxGeometry args={[2, 1, 0.5]} />
          <meshPhysicalMaterial
            color="#000000"
            metalness={0.5}
            roughness={0}
            transparent
            opacity={0.8}
            transmission={0.5}
          />
        </mesh>

        {/* Left Eye Socket */}
        <group position={[-0.45, 0.1, 1.1]}>
          <mesh ref={leftEyeRef}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </mesh>
          {/* Left Pupil */}
          <mesh ref={leftPupilRef} position={[0, 0, 0.2]}>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={2} />
          </mesh>
          {/* Glow ring */}
          <mesh position={[0, 0, 0.15]}>
            <ringGeometry args={[0.25, 0.32, 32]} />
            <meshBasicMaterial color="#0ea5e9" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Right Eye Socket */}
        <group position={[0.45, 0.1, 1.1]}>
          <mesh ref={rightEyeRef}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </mesh>
          {/* Right Pupil */}
          <mesh ref={rightPupilRef} position={[0, 0, 0.2]}>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={2} />
          </mesh>
          {/* Glow ring */}
          <mesh position={[0, 0, 0.15]}>
            <ringGeometry args={[0.25, 0.32, 32]} />
            <meshBasicMaterial color="#0ea5e9" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Antenna */}
        <group position={[0, 1.8, 0]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
            <meshStandardMaterial color="#6366f1" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={2}
            />
          </mesh>
          <pointLight position={[0, 0.35, 0]} color="#ef4444" intensity={0.5} distance={2} />
        </group>

        {/* Ear pieces */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 1.4, 0, 0]} rotation={[0, 0, side * Math.PI / 6]}>
            <cylinderGeometry args={[0.15, 0.2, 0.4, 16]} />
            <meshStandardMaterial
              color="#6366f1"
              metalness={0.8}
              roughness={0.2}
              emissive="#6366f1"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}

        {/* Chin detail */}
        <mesh position={[0, -0.8, 0.6]}>
          <boxGeometry args={[0.6, 0.2, 0.3]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Point lights for dramatic effect */}
        <pointLight position={[0, 0, 2]} color="#0ea5e9" intensity={1} distance={5} />
      </group>
    </Float>
  );
}

// ============================================
// CIRCUIT BOARD ELEMENT
// ============================================

function CircuitBoard({ position, rotation, scale = 1 }: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={1}>
      <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
        {/* PCB Base */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 0.1, 1.5]} />
          <meshStandardMaterial color="#1d4d1d" roughness={0.7} metalness={0.3} />
        </mesh>

        {/* Copper traces */}
        {[...Array(8)].map((_, i) => (
          <mesh key={`trace-${i}`} position={[-0.8 + i * 0.23, 0.06, 0]}>
            <boxGeometry args={[0.02, 0.01, 1.2]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}

        {/* IC Chip */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.6, 0.2, 0.6]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* IC Pins */}
        {[...Array(8)].map((_, i) => (
          <mesh key={`pin-l-${i}`} position={[-0.4, 0.1, -0.25 + i * 0.07]}>
            <boxGeometry args={[0.15, 0.02, 0.02]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {[...Array(8)].map((_, i) => (
          <mesh key={`pin-r-${i}`} position={[0.4, 0.1, -0.25 + i * 0.07]}>
            <boxGeometry args={[0.15, 0.02, 0.02]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* Capacitors */}
        {[[-0.6, 0.3], [0.6, 0.3], [-0.6, -0.3], [0.6, -0.3]].map(([x, z], i) => (
          <mesh key={`cap-${i}`} position={[x, 0.15, z]}>
            <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
            <meshStandardMaterial color="#0066cc" metalness={0.5} roughness={0.3} />
          </mesh>
        ))}

        {/* LED */}
        <mesh position={[0.7, 0.12, 0.5]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
        </mesh>
        <pointLight position={[0.7, 0.12, 0.5]} color="#00ff00" intensity={0.3} distance={1} />
      </group>
    </Float>
  );
}

// ============================================
// ATOM / CHEMISTRY ELEMENT
// ============================================

function Atom({ position, scale = 1, color = '#0ea5e9' }: {
  position: [number, number, number];
  scale?: number;
  color?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const electronsRef = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
      groupRef.current.rotation.z += 0.005;
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Nucleus */}
        <mesh>
          <sphereGeometry args={[0.3, 32, 32]} />
          <MeshDistortMaterial
            color={color}
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <pointLight color={color} intensity={0.5} distance={3} />

        {/* Electron orbits */}
        {[0, Math.PI / 3, (2 * Math.PI) / 3].map((rotation, i) => (
          <group key={i} rotation={[rotation, rotation * 0.5, 0]}>
            {/* Orbit ring */}
            <mesh>
              <torusGeometry args={[1, 0.01, 8, 64]} />
              <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
            {/* Electron */}
            <mesh
              position={[Math.cos(i * 2) * 1, 0, Math.sin(i * 2) * 1]}
              ref={(el) => { if (el) electronsRef.current[i] = el as unknown as THREE.Group; }}
            >
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
            </mesh>
          </group>
        ))}
      </group>
    </Float>
  );
}

// ============================================
// FLOATING CUBE (Tech Element)
// ============================================

function TechCube({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.5;
    }
  });

  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

// ============================================
// DNA HELIX
// ============================================

function DNAHelix({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 20; i++) {
      const t = i / 20;
      const angle = t * Math.PI * 4;
      pts.push({
        pos1: [Math.cos(angle) * 0.5, t * 4 - 2, Math.sin(angle) * 0.5] as [number, number, number],
        pos2: [Math.cos(angle + Math.PI) * 0.5, t * 4 - 2, Math.sin(angle + Math.PI) * 0.5] as [number, number, number],
      });
    }
    return pts;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} position={position} scale={0.5}>
        {points.map((pt, i) => (
          <group key={i}>
            {/* Strand 1 */}
            <mesh position={pt.pos1}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
            </mesh>
            {/* Strand 2 */}
            <mesh position={pt.pos2}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
            </mesh>
            {/* Connector */}
            {i % 2 === 0 && (
              <mesh position={[(pt.pos1[0] + pt.pos2[0]) / 2, pt.pos1[1], (pt.pos1[2] + pt.pos2[2]) / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
                <meshStandardMaterial color="#22c55e" />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </Float>
  );
}

// ============================================
// PARTICLE FIELD
// ============================================

function ParticleField({ count = 200 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorPalette = [
      new THREE.Color('#0ea5e9'),
      new THREE.Color('#6366f1'),
      new THREE.Color('#a855f7'),
      new THREE.Color('#22c55e'),
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005;
      pointsRef.current.rotation.x += 0.0002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.8} sizeAttenuation />
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
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0ea5e9" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={0.8} color="#6366f1" />

      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* AI Robot Head - Center */}
      <AIRobotHead mousePosition={mousePosition} />

      {/* Circuit Boards */}
      <CircuitBoard position={[-6, 2, -3]} rotation={[0.2, 0.5, 0.1]} scale={0.8} />
      <CircuitBoard position={[6, -2, -4]} rotation={[-0.1, -0.3, 0.2]} scale={0.6} />
      <CircuitBoard position={[-5, -3, -2]} rotation={[0.3, 0.8, 0]} scale={0.5} />

      {/* Atoms */}
      <Atom position={[-4, 3, -2]} scale={0.8} color="#0ea5e9" />
      <Atom position={[5, 2, -3]} scale={0.6} color="#a855f7" />
      <Atom position={[3, -3, -2]} scale={0.7} color="#22c55e" />

      {/* DNA Helix */}
      <DNAHelix position={[-7, 0, -5]} />
      <DNAHelix position={[7, 1, -4]} />

      {/* Tech Cubes */}
      <TechCube position={[-3, 4, -1]} color="#0ea5e9" />
      <TechCube position={[4, 3, -2]} color="#6366f1" />
      <TechCube position={[-2, -4, -1]} color="#a855f7" />
      <TechCube position={[3, -2, 0]} color="#22c55e" />
      <TechCube position={[0, 5, -3]} color="#ef4444" />

      {/* Floating geometric shapes */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Icosahedron args={[0.5]} position={[-5, -1, -2]}>
          <meshStandardMaterial color="#0ea5e9" wireframe />
        </Icosahedron>
      </Float>

      <Float speed={3} rotationIntensity={0.3} floatIntensity={2}>
        <Dodecahedron args={[0.4]} position={[5, 0, -1]}>
          <meshStandardMaterial color="#a855f7" wireframe />
        </Dodecahedron>
      </Float>

      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.5}>
        <Torus args={[0.5, 0.15, 16, 32]} position={[-3, -2, 0]}>
          <meshStandardMaterial color="#22c55e" metalness={0.8} roughness={0.2} />
        </Torus>
      </Float>

      {/* Particle field */}
      <ParticleField count={300} />

      {/* Environment for reflections */}
      <Environment preset="night" />
    </>
  );
}

// ============================================
// EXPORTED COMPONENT
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
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0a0a1a']} />
        <fog attach="fog" args={['#0a0a1a', 10, 40]} />
        <Scene mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}

export { UltraPremiumBackground };
