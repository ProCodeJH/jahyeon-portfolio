// SecureVaultOverlay.tsx - AAA-Grade 3D Locked Content Experience
// Premium banking-grade secure vault with procedural geometry

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Lock, Shield } from "lucide-react";
import { Link } from "wouter";

interface SecureVaultOverlayProps {
    isAuthenticated: boolean;
    onLoginClick?: () => void;
    onRegisterClick?: () => void;
    onUnlockComplete?: () => void;
}

// ════════════════════════════════════════════════════════════════
// 🔒 SECURE VAULT OVERLAY - Premium 3D Lock Experience
// ════════════════════════════════════════════════════════════════

export function SecureVaultOverlay({
    isAuthenticated,
    onLoginClick,
    onRegisterClick,
    onUnlockComplete,
}: SecureVaultOverlayProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const composerRef = useRef<EffectComposer | null>(null);
    const lockGroupRef = useRef<THREE.Group | null>(null);
    const chainsRef = useRef<THREE.Group[]>([]);
    const particlesRef = useRef<THREE.Points | null>(null);
    const animationIdRef = useRef<number>(0);
    const timeRef = useRef<number>(0);
    const isUnlockingRef = useRef<boolean>(false);

    const [visible, setVisible] = useState(!isAuthenticated);
    const [showUI, setShowUI] = useState(!isAuthenticated);

    // ═══════════════════════════════════════════════════════════════
    // 🎨 CREATE MATERIALS
    // ═══════════════════════════════════════════════════════════════

    const createGoldMaterial = useCallback(() => {
        return new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.95,
            roughness: 0.15,
            emissive: 0xffa500,
            emissiveIntensity: 0.15,
        });
    }, []);

    const createChromeMaterial = useCallback(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.98,
            roughness: 0.08,
        });
    }, []);

    const createChainMaterial = useCallback(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.92,
            roughness: 0.25,
        });
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // 🔐 CREATE LOCK GEOMETRY
    // ═══════════════════════════════════════════════════════════════

    const createLock = useCallback((scene: THREE.Scene) => {
        const lockGroup = new THREE.Group();

        // Lock Body - Main cylinder
        const bodyGeometry = new THREE.CylinderGeometry(1.2, 1.4, 2, 32);
        const bodyMaterial = createGoldMaterial();
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        body.name = "lockBody";
        lockGroup.add(body);

        // Lock Body Top Cap
        const topCapGeometry = new THREE.CylinderGeometry(1.25, 1.2, 0.3, 32);
        const topCap = new THREE.Mesh(topCapGeometry, bodyMaterial);
        topCap.position.y = 1.1;
        lockGroup.add(topCap);

        // Shackle - The U-shaped part
        const shackleGroup = new THREE.Group();
        shackleGroup.name = "shackle";

        // Shackle arc
        const shackleCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.5, 0, 0),
            new THREE.Vector3(-0.5, 1, 0),
            new THREE.Vector3(0, 1.5, 0),
            new THREE.Vector3(0.5, 1, 0),
            new THREE.Vector3(0.5, 0, 0),
        ]);
        const shackleGeometry = new THREE.TubeGeometry(shackleCurve, 32, 0.15, 16, false);
        const shackleMaterial = createChromeMaterial();
        const shackle = new THREE.Mesh(shackleGeometry, shackleMaterial);
        shackle.castShadow = true;
        shackleGroup.add(shackle);

        shackleGroup.position.y = 1.2;
        lockGroup.add(shackleGroup);

        // Keyhole
        const keyholeShape = new THREE.Shape();
        keyholeShape.moveTo(0, 0.3);
        keyholeShape.absarc(0, 0.15, 0.15, Math.PI / 2, -Math.PI / 2, true);
        keyholeShape.lineTo(-0.08, -0.2);
        keyholeShape.lineTo(0.08, -0.2);
        keyholeShape.lineTo(0, 0);

        const keyholeGeometry = new THREE.ExtrudeGeometry(keyholeShape, {
            depth: 0.1,
            bevelEnabled: false,
        });
        const keyholeMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.5,
            roughness: 0.8,
        });
        const keyhole = new THREE.Mesh(keyholeGeometry, keyholeMaterial);
        keyhole.position.set(0, 0, 1.35);
        keyhole.rotation.y = Math.PI;
        lockGroup.add(keyhole);

        // Decorative rings
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(1.3 - i * 0.1, 0.03, 8, 32);
            const ring = new THREE.Mesh(ringGeometry, bodyMaterial);
            ring.position.y = -0.6 + i * 0.6;
            ring.rotation.x = Math.PI / 2;
            lockGroup.add(ring);
        }

        // Glow effect - point light inside
        const glowLight = new THREE.PointLight(0xffa500, 2, 5);
        glowLight.position.set(0, 0, 0);
        glowLight.name = "glowLight";
        lockGroup.add(glowLight);

        lockGroup.position.y = 0;
        lockGroup.scale.set(0.8, 0.8, 0.8);
        scene.add(lockGroup);
        lockGroupRef.current = lockGroup;

        return lockGroup;
    }, [createGoldMaterial, createChromeMaterial]);

    // ═══════════════════════════════════════════════════════════════
    // ⛓️ CREATE CHAIN SYSTEM
    // ═══════════════════════════════════════════════════════════════

    const createChains = useCallback((scene: THREE.Scene) => {
        const chains: THREE.Group[] = [];

        // Two chains forming X pattern
        const chainPaths = [
            // Top-left to bottom-right
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(-8, 6, -2),
                new THREE.Vector3(-4, 3, 0),
                new THREE.Vector3(0, 0, 1),
                new THREE.Vector3(4, -3, 0),
                new THREE.Vector3(8, -6, -2),
            ]),
            // Top-right to bottom-left
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(8, 6, -2),
                new THREE.Vector3(4, 3, 0),
                new THREE.Vector3(0, 0, 1),
                new THREE.Vector3(-4, -3, 0),
                new THREE.Vector3(-8, -6, -2),
            ]),
        ];

        const chainMaterial = createChainMaterial();
        const linkGeometry = new THREE.TorusGeometry(0.15, 0.05, 8, 16);

        chainPaths.forEach((curve, chainIndex) => {
            const chainGroup = new THREE.Group();
            chainGroup.name = `chain_${chainIndex}`;

            const points = curve.getPoints(60);

            points.forEach((point, i) => {
                const link = new THREE.Mesh(linkGeometry, chainMaterial);
                link.position.copy(point);

                // Alternate rotation for chain link effect
                if (i % 2 === 0) {
                    link.rotation.x = Math.PI / 2;
                } else {
                    link.rotation.y = Math.PI / 2;
                }

                // Store original position for animation
                link.userData.originalPosition = point.clone();
                link.userData.index = i;

                link.castShadow = true;
                chainGroup.add(link);
            });

            scene.add(chainGroup);
            chains.push(chainGroup);
        });

        chainsRef.current = chains;
        return chains;
    }, [createChainMaterial]);

    // ═══════════════════════════════════════════════════════════════
    // ✨ CREATE PARTICLES
    // ═══════════════════════════════════════════════════════════════

    const createParticles = useCallback((scene: THREE.Scene) => {
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

            // Golden particle colors
            colors[i * 3] = 0.8 + Math.random() * 0.2;
            colors[i * 3 + 1] = 0.6 + Math.random() * 0.2;
            colors[i * 3 + 2] = 0.2;
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);
        particlesRef.current = particles;

        return particles;
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // 🎬 UNLOCK ANIMATION
    // ═══════════════════════════════════════════════════════════════

    const playUnlockAnimation = useCallback(() => {
        if (isUnlockingRef.current) return;
        isUnlockingRef.current = true;

        const lockGroup = lockGroupRef.current;
        const chains = chainsRef.current;

        if (!lockGroup) return;

        const timeline = gsap.timeline({
            onComplete: () => {
                setVisible(false);
                onUnlockComplete?.();
            },
        });

        // 1. Chains violently pull apart
        chains.forEach((chain, index) => {
            const direction = index === 0 ? 1 : -1;
            chain.children.forEach((link, linkIndex) => {
                timeline.to(
                    link.position,
                    {
                        x: link.position.x + direction * 10,
                        y: link.position.y + (Math.random() - 0.5) * 5,
                        z: link.position.z - 5,
                        duration: 0.6,
                        ease: "power3.out",
                        delay: linkIndex * 0.01,
                    },
                    0
                );
            });
        });

        // 2. Shackle opens
        const shackle = lockGroup.getObjectByName("shackle");
        if (shackle) {
            timeline.to(
                shackle.rotation,
                {
                    z: Math.PI / 3,
                    duration: 0.5,
                    ease: "power2.out",
                },
                0.3
            );
            timeline.to(
                shackle.position,
                {
                    y: 2,
                    duration: 0.5,
                    ease: "power2.out",
                },
                0.3
            );
        }

        // 3. Golden light explosion
        const glowLight = lockGroup.getObjectByName("glowLight") as THREE.PointLight;
        if (glowLight) {
            timeline.to(
                glowLight,
                {
                    intensity: 50,
                    distance: 30,
                    duration: 0.3,
                    ease: "power2.in",
                },
                0.6
            );
        }

        // 4. Lock fades and scales up
        timeline.to(
            lockGroup.scale,
            {
                x: 2,
                y: 2,
                z: 2,
                duration: 0.4,
                ease: "power2.in",
            },
            0.7
        );

        // 5. Fade out UI
        timeline.to(
            {},
            {
                duration: 0.3,
                onStart: () => setShowUI(false),
            },
            0.9
        );
    }, [onUnlockComplete]);

    // ═══════════════════════════════════════════════════════════════
    // 🎮 ANIMATION LOOP
    // ═══════════════════════════════════════════════════════════════

    const animate = useCallback(() => {
        if (!sceneRef.current || !composerRef.current || isUnlockingRef.current) return;

        timeRef.current += 0.016;
        const time = timeRef.current;

        // Animate lock - slow rotation
        const lockGroup = lockGroupRef.current;
        if (lockGroup) {
            lockGroup.rotation.y = Math.sin(time * 0.3) * 0.1;
            lockGroup.position.y = Math.sin(time * 0.5) * 0.1;

            // Pulse glow light
            const glowLight = lockGroup.getObjectByName("glowLight") as THREE.PointLight;
            if (glowLight) {
                glowLight.intensity = 2 + Math.sin(time * 2) * 0.5;
            }
        }

        // Animate chains - subtle sway
        chainsRef.current.forEach((chain, chainIndex) => {
            chain.children.forEach((link, linkIndex) => {
                const originalPos = link.userData.originalPosition;
                if (originalPos) {
                    link.position.x = originalPos.x + Math.sin(time + linkIndex * 0.1) * 0.05;
                    link.position.y = originalPos.y + Math.cos(time * 0.8 + linkIndex * 0.1) * 0.03;
                }
                link.rotation.z = Math.sin(time + linkIndex * 0.2) * 0.1;
            });
        });

        // Animate particles
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += 0.01;
                if (positions[i + 1] > 7.5) {
                    positions[i + 1] = -7.5;
                }
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
            particlesRef.current.rotation.y += 0.001;
        }

        composerRef.current.render();
        animationIdRef.current = requestAnimationFrame(animate);
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        if (!containerRef.current || !visible) return;

        const container = containerRef.current;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0f);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(0, 0, 8);
        camera.lookAt(0, 0, 0);

        // Camera drift animation
        gsap.to(camera.position, {
            x: 0.5,
            y: 0.3,
            duration: 4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
        });

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Post-processing
        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            0.8, // strength
            0.4, // radius
            0.85 // threshold
        );
        composer.addPass(bloomPass);
        composerRef.current = composer;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x222233, 0.5);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        scene.add(mainLight);

        const rimLight = new THREE.DirectionalLight(0x4466ff, 0.5);
        rimLight.position.set(-5, 5, -5);
        scene.add(rimLight);

        const goldLight = new THREE.PointLight(0xffa500, 1, 15);
        goldLight.position.set(0, 2, 3);
        scene.add(goldLight);

        // Create scene objects
        createLock(scene);
        createChains(scene);
        createParticles(scene);

        // Start animation
        animate();

        // Handle resize
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            composer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationIdRef.current);
            window.removeEventListener("resize", handleResize);
            gsap.killTweensOf(camera.position);

            renderer.dispose();
            container.removeChild(renderer.domElement);

            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (object.material instanceof THREE.Material) {
                        object.material.dispose();
                    }
                }
            });
        };
    }, [visible, animate, createLock, createChains, createParticles]);

    // Handle authentication change
    useEffect(() => {
        if (isAuthenticated && visible) {
            playUnlockAnimation();
        }
    }, [isAuthenticated, visible, playUnlockAnimation]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 pointer-events-auto">
            {/* WebGL Canvas Container */}
            <div ref={containerRef} className="absolute inset-0" />

            {/* UI Overlay */}
            {showUI && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

                    {/* Content */}
                    <div className="relative z-10 text-center px-4">
                        {/* Shield icon */}
                        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 backdrop-blur-xl">
                            <Shield className="w-10 h-10 text-amber-400" />
                        </div>

                        {/* Title */}
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                                SECURED CONTENT
                            </span>
                        </h2>

                        {/* Subtitle */}
                        <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                            학원 학생들 전용 수업자료 페이지입니다.
                            <br />
                            <span className="text-amber-400/80 text-base">
                                해당 학원 학생들은 회원가입할 때 안내받은 코드를
                                <br />
                                반드시 정확히 기입하시길 바랍니다.
                            </span>
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/login">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold rounded-2xl shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-amber-500/40 hover:scale-105"
                                    onClick={onLoginClick}
                                >
                                    <LogIn className="w-5 h-5 mr-2" />
                                    로그인
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto px-8 py-6 text-lg border-amber-500/50 text-amber-400 hover:bg-amber-500/10 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105"
                                    onClick={onRegisterClick}
                                >
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    회원가입
                                </Button>
                            </Link>
                        </div>

                        {/* Security badge */}
                        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                            <Lock className="w-4 h-4 text-emerald-400" />
                            <span className="text-white/50 text-sm">256-bit 암호화로 보호됨</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SecureVaultOverlay;
