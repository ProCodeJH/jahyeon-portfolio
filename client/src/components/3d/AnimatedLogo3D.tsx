import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedLogoProps {
    size?: number;
    className?: string;
}

function LogoCore() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[1, 1]} />
                <MeshDistortMaterial
                    color="#7B2FFF"
                    attach="material"
                    distort={0.3}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
        </Float>
    );
}

function OrbitRing({ radius, speed, color }: { radius: number; speed: number; color: string }) {
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ringRef.current) {
            ringRef.current.rotation.x = Math.PI / 2;
            ringRef.current.rotation.z = state.clock.elapsedTime * speed;
        }
    });

    return (
        <mesh ref={ringRef}>
            <torusGeometry args={[radius, 0.02, 16, 100]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
    );
}

function OrbitingSphere({ radius, speed, position }: { radius: number; speed: number; position: [number, number, number] }) {
    const sphereRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (sphereRef.current) {
            const angle = state.clock.elapsedTime * speed;
            sphereRef.current.position.x = Math.cos(angle) * radius;
            sphereRef.current.position.z = Math.sin(angle) * radius;
        }
    });

    return (
        <Sphere ref={sphereRef} args={[0.1, 16, 16]} position={position}>
            <meshStandardMaterial color="#00D9FF" emissive="#00D9FF" emissiveIntensity={0.5} />
        </Sphere>
    );
}

export default function AnimatedLogo3D({ size = 200, className = '' }: AnimatedLogoProps) {
    return (
        <div
            className={`animated-logo-3d ${className}`}
            style={{
                width: size,
                height: size,
                cursor: 'pointer',
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 4], fov: 50 }}
                gl={{ alpha: true, antialias: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#7B2FFF" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00D9FF" />

                <LogoCore />

                {/* Orbit rings */}
                <OrbitRing radius={1.5} speed={0.5} color="#7B2FFF" />
                <OrbitRing radius={1.8} speed={-0.3} color="#00D9FF" />
                <OrbitRing radius={2.1} speed={0.2} color="#4361EE" />

                {/* Orbiting spheres */}
                <OrbitingSphere radius={1.5} speed={1} position={[1.5, 0, 0]} />
                <OrbitingSphere radius={1.8} speed={-0.8} position={[-1.8, 0, 0]} />
                <OrbitingSphere radius={2.1} speed={0.6} position={[0, 0, 2.1]} />
            </Canvas>
        </div>
    );
}
