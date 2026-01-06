import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function CircuitNodes() {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 1000;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
            pointsRef.current.rotation.z = state.clock.getElapsedTime() * 0.03;
        }
    });

    return (
        <Points ref={pointsRef} positions={positions} stride={3}>
            <PointMaterial
                transparent
                color="#8b5cf6"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

function FloatingCore() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
            const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
            meshRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh ref={meshRef}>
                <octahedronGeometry args={[1, 0]} />
                <MeshDistortMaterial
                    color="#3b82f6"
                    speed={2}
                    distort={0.4}
                    radius={1}
                    metalness={0.8}
                    roughness={0.2}
                    emissive="#1d4ed8"
                    emissiveIntensity={0.5}
                />
            </mesh>
        </Float>
    );
}

function ConnectionLines() {
    const linesRef = useRef<THREE.Group>(null);

    const lines = useMemo(() => {
        const lineArr = [];
        for (let i = 0; i < 20; i++) {
            const points = [];
            points.push(new THREE.Vector3(0, 0, 0));
            points.push(new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            ));
            lineArr.push(points);
        }
        return lineArr;
    }, []);

    useFrame((state) => {
        if (linesRef.current) {
            linesRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
        }
    });

    return (
        <group ref={linesRef}>
            {lines.map((points, i) => (
                <line key={i}>
                    <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints(points)} />
                    <lineBasicMaterial attach="material" color="#a855f7" transparent opacity={0.2} />
                </line>
            ))}
        </group>
    );
}

export function HeroScene() {
    return (
        <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#3b82f6" />

                <CircuitNodes />
                <FloatingCore />
                <ConnectionLines />

                <fog attach="fog" args={['#000', 5, 15]} />
            </Canvas>

            {/* Interaction Help Overlay */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 text-white/40 text-[10px] font-mono tracking-widest uppercase pointer-events-none">
                <div className="w-8 h-px bg-white/20"></div>
                Drag to Orbit CPU
            </div>
        </div>
    );
}
