import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Users,
    MessageCircle,
    Send,
    X,
    Maximize2,
    Minimize2,
    Volume2,
    VolumeX,
    LogIn,
    Shuffle,
    Wifi,
    WifiOff,
    UserPlus,
    RotateCcw,
} from "lucide-react";
import { useRealtimeWorld } from "@/hooks/useRealtimeWorld";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ============================================
// 🎮 GAME CONSTANTS
// ============================================

const WORLD_SIZE = 40; // World is 40x40 units
const PLAYER_SPEED = 0.12;
const CAMERA_HEIGHT = 12;
const CAMERA_DISTANCE = 18;
const CAMERA_SMOOTHNESS = 0.08;

// ============================================
// 🏙️ COMPLETE VILLAGE LAYOUT
// ============================================

// All buildings with precise placement
const VILLAGE_BUILDINGS = [
    // North side - Tall buildings
    { x: -15, z: -15, type: "building_H", rotation: 0, scale: 1.2 },
    { x: -10, z: -15, type: "building_G", rotation: 0, scale: 1.1 },
    { x: -5, z: -15, type: "building_F", rotation: 0, scale: 1.0 },
    { x: 5, z: -15, type: "building_E", rotation: 0, scale: 1.0 },
    { x: 10, z: -15, type: "building_D", rotation: 0, scale: 1.1 },
    { x: 15, z: -15, type: "building_C", rotation: 0, scale: 1.2 },

    // South side - Medium buildings
    { x: -15, z: 15, type: "building_A", rotation: Math.PI, scale: 1.0 },
    { x: -10, z: 15, type: "building_B", rotation: Math.PI, scale: 0.9 },
    { x: -5, z: 15, type: "building_C", rotation: Math.PI, scale: 1.0 },
    { x: 5, z: 15, type: "building_D", rotation: Math.PI, scale: 1.0 },
    { x: 10, z: 15, type: "building_E", rotation: Math.PI, scale: 0.9 },
    { x: 15, z: 15, type: "building_F", rotation: Math.PI, scale: 1.0 },

    // East side
    { x: 18, z: -8, type: "building_A", rotation: -Math.PI / 2, scale: 1.0 },
    { x: 18, z: 0, type: "building_B", rotation: -Math.PI / 2, scale: 1.1 },
    { x: 18, z: 8, type: "building_G", rotation: -Math.PI / 2, scale: 1.0 },

    // West side
    { x: -18, z: -8, type: "building_H", rotation: Math.PI / 2, scale: 1.0 },
    { x: -18, z: 0, type: "building_A", rotation: Math.PI / 2, scale: 1.1 },
    { x: -18, z: 8, type: "building_B", rotation: Math.PI / 2, scale: 1.0 },
];

// Road network
const ROADS = [
    // Main horizontal roads
    ...Array.from({ length: 20 }, (_, i) => ({ x: -10 + i, z: 0, type: "road_straight", rotation: Math.PI / 2 })),
    ...Array.from({ length: 20 }, (_, i) => ({ x: -10 + i, z: -8, type: "road_straight", rotation: Math.PI / 2 })),
    ...Array.from({ length: 20 }, (_, i) => ({ x: -10 + i, z: 8, type: "road_straight", rotation: Math.PI / 2 })),

    // Main vertical roads
    ...Array.from({ length: 8 }, (_, i) => ({ x: -8, z: -4 + i, type: "road_straight", rotation: 0 })),
    ...Array.from({ length: 8 }, (_, i) => ({ x: 8, z: -4 + i, type: "road_straight", rotation: 0 })),
    ...Array.from({ length: 8 }, (_, i) => ({ x: 0, z: -4 + i, type: "road_straight", rotation: 0 })),

    // Corners and junctions
    { x: -8, z: 0, type: "road_junction", rotation: 0 },
    { x: 8, z: 0, type: "road_junction", rotation: 0 },
    { x: 0, z: 0, type: "road_junction", rotation: 0 },
    { x: -8, z: -8, type: "road_corner_curved", rotation: Math.PI },
    { x: 8, z: -8, type: "road_corner_curved", rotation: -Math.PI / 2 },
    { x: -8, z: 8, type: "road_corner_curved", rotation: Math.PI / 2 },
    { x: 8, z: 8, type: "road_corner_curved", rotation: 0 },
];

// Streetlights along roads
const STREETLIGHTS = [
    { x: -6, z: 1, type: "streetlight" },
    { x: -3, z: 1, type: "streetlight" },
    { x: 3, z: 1, type: "streetlight" },
    { x: 6, z: 1, type: "streetlight" },
    { x: -6, z: -7, type: "streetlight" },
    { x: 6, z: -7, type: "streetlight" },
    { x: -6, z: 9, type: "streetlight" },
    { x: 6, z: 9, type: "streetlight" },
];

// Traffic lights at intersections
const TRAFFIC_LIGHTS = [
    { x: -9, z: 0, type: "trafficlight_A", rotation: Math.PI / 2 },
    { x: 9, z: 0, type: "trafficlight_B", rotation: -Math.PI / 2 },
    { x: 0, z: -9, type: "trafficlight_C", rotation: 0 },
    { x: 0, z: 9, type: "trafficlight_A", rotation: Math.PI },
];

// Cars parked and on roads
const CARS = [
    { x: -5, z: 0.8, type: "car_taxi", rotation: Math.PI / 2 },
    { x: 2, z: -0.8, type: "car_sedan", rotation: -Math.PI / 2 },
    { x: -8.8, z: -3, type: "car_police", rotation: 0 },
    { x: 8.8, z: 3, type: "car_hatchback", rotation: Math.PI },
    { x: 5, z: 8.8, type: "car_stationwagon", rotation: Math.PI / 2 },
    { x: -3, z: -8.8, type: "car_taxi", rotation: -Math.PI / 2 },
];

// Park area with benches and bushes
const PARK_PROPS = [
    // Central plaza
    { x: 0, z: 4, type: "bench", rotation: Math.PI },
    { x: 0, z: -4, type: "bench", rotation: 0 },
    { x: -3, z: 4, type: "bench", rotation: Math.PI },
    { x: 3, z: 4, type: "bench", rotation: Math.PI },

    // Bushes around plaza
    { x: -4, z: 3, type: "bush" },
    { x: 4, z: 3, type: "bush" },
    { x: -4, z: -3, type: "bush" },
    { x: 4, z: -3, type: "bush" },
    { x: -2, z: 6, type: "bush" },
    { x: 2, z: 6, type: "bush" },
    { x: -2, z: -6, type: "bush" },
    { x: 2, z: -6, type: "bush" },

    // Water tower
    { x: -12, z: 0, type: "watertower", scale: 0.8 },

    // Dumpsters behind buildings
    { x: -16, z: -12, type: "dumpster" },
    { x: 16, z: -12, type: "dumpster" },
    { x: -16, z: 12, type: "dumpster" },
    { x: 16, z: 12, type: "dumpster" },

    // Fire hydrants
    { x: -7, z: -7, type: "firehydrant" },
    { x: 7, z: -7, type: "firehydrant" },
    { x: -7, z: 9, type: "firehydrant" },
    { x: 7, z: 9, type: "firehydrant" },

    // Trash around
    { x: -10, z: 5, type: "trash_A" },
    { x: 10, z: -5, type: "trash_B" },

    // Boxes near buildings
    { x: -14, z: -10, type: "box_A" },
    { x: -14, z: -11, type: "box_B" },
    { x: 14, z: 10, type: "box_A" },
];

// Avatar colors
const AVATAR_COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
];

function getAvatarColor(seed: number): string {
    return AVATAR_COLORS[seed % AVATAR_COLORS.length];
}

// ============================================
// 🎯 MAIN COMPONENT
// ============================================

export default function VirtualWorld3D() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const playerMeshRef = useRef<THREE.Group | null>(null);
    const otherPlayerMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
    const animationIdRef = useRef<number>(0);
    const isInitializedRef = useRef(false);
    const keysRef = useRef<Set<string>>(new Set());
    const playerPosRef = useRef({ x: 0, z: 4 });
    const playerRotationRef = useRef(0);
    const cameraTargetRef = useRef({ x: 0, y: CAMERA_HEIGHT, z: CAMERA_DISTANCE });

    // State
    const [member, setMember] = useState<{ id: number; name: string; avatarSeed?: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [chatInput, setChatInput] = useState("");
    const [showPlayerList, setShowPlayerList] = useState(false);
    const [currentArea, setCurrentArea] = useState("광장");

    // Check login
    useEffect(() => {
        const stored = localStorage.getItem("member");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (!parsed.avatarSeed) {
                    parsed.avatarSeed = Math.floor(Math.random() * 1000000);
                    localStorage.setItem("member", JSON.stringify(parsed));
                }
                setMember(parsed);
            } catch { }
        }
        setIsLoading(false);
    }, []);

    // Realtime multiplayer
    const realtimeOptions = member ? {
        playerId: `user_${member.id}`,
        playerName: member.name,
        avatarSeed: member.avatarSeed || 0,
        initialX: 0,
        initialY: 4,
        onPlayerJoin: (name: string) => {
            toast.success(`👋 ${name}님이 입장했습니다!`, { duration: 3000 });
        },
        onPlayerLeave: (name: string) => {
            toast.info(`👋 ${name}님이 퇴장했습니다.`, { duration: 3000 });
        },
    } : {
        playerId: "",
        playerName: "",
        avatarSeed: 0,
        initialX: 0,
        initialY: 4,
    };

    const {
        players: onlinePlayers,
        chatMessages: realtimeChatMessages,
        isConnected,
        sendPosition,
        sendChat,
        sendEmote,
    } = useRealtimeWorld(realtimeOptions);

    // Create player mesh
    const createPlayerMesh = (color: string, isLocal: boolean = false): THREE.Group => {
        const group = new THREE.Group();

        // Body (torso)
        const bodyGeometry = new THREE.CapsuleGeometry(0.35, 0.8, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            roughness: 0.5,
            metalness: 0.1,
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffdbac,
            roughness: 0.6,
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.85;
        head.castShadow = true;
        group.add(head);

        // Hair
        const hairGeometry = new THREE.SphereGeometry(0.32, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x2c1810 });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 1.9;
        group.add(hair);

        if (isLocal) {
            // Glowing ring under player
            const ringGeometry = new THREE.RingGeometry(0.5, 0.7, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff88,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8,
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.02;
            group.add(ring);

            // Arrow indicator showing direction
            const arrowShape = new THREE.Shape();
            arrowShape.moveTo(0, 0.4);
            arrowShape.lineTo(-0.2, 0);
            arrowShape.lineTo(0.2, 0);
            arrowShape.closePath();
            const arrowGeometry = new THREE.ShapeGeometry(arrowShape);
            const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide });
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
            arrow.rotation.x = -Math.PI / 2;
            arrow.position.y = 0.03;
            arrow.position.z = -0.6;
            group.add(arrow);
        }

        return group;
    };

    // Initialize Three.js scene
    useEffect(() => {
        if (!member || !containerRef.current || isInitializedRef.current) return;
        isInitializedRef.current = true;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);
        scene.fog = new THREE.FogExp2(0x87ceeb, 0.015);
        sceneRef.current = scene;

        // Camera - follows player
        const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 200);
        camera.position.set(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
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

        // Lighting - Sunny day
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xfffaf0, 1.0);
        sunLight.position.set(30, 50, 30);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 150;
        sunLight.shadow.camera.left = -50;
        sunLight.shadow.camera.right = 50;
        sunLight.shadow.camera.top = 50;
        sunLight.shadow.camera.bottom = -50;
        sunLight.shadow.bias = -0.0001;
        scene.add(sunLight);

        // Hemisphere light for natural sky bounce
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3a7d44, 0.4);
        scene.add(hemiLight);

        // Ground - Grass
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c59,
            roughness: 0.9,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        ground.receiveShadow = true;
        scene.add(ground);

        // Central plaza - Different ground texture
        const plazaGeometry = new THREE.CircleGeometry(8, 32);
        const plazaMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            roughness: 0.8,
        });
        const plaza = new THREE.Mesh(plazaGeometry, plazaMaterial);
        plaza.rotation.x = -Math.PI / 2;
        plaza.position.y = 0.01;
        plaza.receiveShadow = true;
        scene.add(plaza);

        // Fountain in center
        const fountainBase = new THREE.Mesh(
            new THREE.CylinderGeometry(1.5, 2, 0.5, 32),
            new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.3 })
        );
        fountainBase.position.y = 0.25;
        fountainBase.castShadow = true;
        fountainBase.receiveShadow = true;
        scene.add(fountainBase);

        const fountainPool = new THREE.Mesh(
            new THREE.CylinderGeometry(1.3, 1.3, 0.3, 32),
            new THREE.MeshStandardMaterial({
                color: 0x4488ff,
                roughness: 0.1,
                metalness: 0.3,
                transparent: true,
                opacity: 0.8,
            })
        );
        fountainPool.position.y = 0.4;
        scene.add(fountainPool);

        const fountainPillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.3, 1.5, 16),
            new THREE.MeshStandardMaterial({ color: 0x707070 })
        );
        fountainPillar.position.y = 1.2;
        fountainPillar.castShadow = true;
        scene.add(fountainPillar);

        // Load GLTF models
        const loader = new GLTFLoader();
        const modelCache: Map<string, THREE.Group> = new Map();
        let loadedCount = 0;
        const totalModels = VILLAGE_BUILDINGS.length + ROADS.length + STREETLIGHTS.length +
            TRAFFIC_LIGHTS.length + CARS.length + PARK_PROPS.length;

        const loadModel = async (name: string, x: number, z: number, rotation: number = 0, scale: number = 1) => {
            try {
                let model: THREE.Group;
                if (modelCache.has(name)) {
                    model = modelCache.get(name)!.clone();
                } else {
                    const gltf = await new Promise<any>((resolve, reject) => {
                        loader.load(`/models/${name}.gltf`, resolve, undefined, reject);
                    });
                    model = gltf.scene;
                    modelCache.set(name, model.clone());
                }
                model.position.set(x, 0, z);
                model.rotation.y = rotation;
                model.scale.set(scale, scale, scale);
                model.traverse((child: any) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                scene.add(model);
            } catch (error) {
                // Silent fail - use placeholder
            }
            loadedCount++;
            setLoadingProgress(Math.floor((loadedCount / totalModels) * 100));
        };

        // Load all models
        const loadAllModels = async () => {
            // Buildings first (most important)
            for (const b of VILLAGE_BUILDINGS) {
                await loadModel(b.type, b.x, b.z, b.rotation, b.scale);
            }

            // Roads
            for (const r of ROADS) {
                await loadModel(r.type, r.x, r.z, r.rotation, 1);
            }

            // Streetlights
            for (const s of STREETLIGHTS) {
                await loadModel(s.type, s.x, s.z, 0, 1);
            }

            // Traffic lights
            for (const t of TRAFFIC_LIGHTS) {
                await loadModel(t.type, t.x, t.z, t.rotation, 1);
            }

            // Cars
            for (const c of CARS) {
                await loadModel(c.type, c.x, c.z, c.rotation, 1);
            }

            // Park props
            for (const p of PARK_PROPS) {
                await loadModel(p.type, p.x, p.z, (p as any).rotation || 0, (p as any).scale || 1);
            }

            setModelsLoaded(true);
        };

        loadAllModels();

        // Create local player
        const playerColor = getAvatarColor(member.avatarSeed || 0);
        const playerMesh = createPlayerMesh(playerColor, true);
        playerMesh.position.set(playerPosRef.current.x, 0, playerPosRef.current.z);
        scene.add(playerMesh);
        playerMeshRef.current = playerMesh;

        // Animation loop
        let lastPositionSent = { x: 0, z: 0 };

        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);

            // Smooth movement with 8-directional support
            let moveX = 0;
            let moveZ = 0;

            if (keysRef.current.has("arrowup") || keysRef.current.has("w")) moveZ -= 1;
            if (keysRef.current.has("arrowdown") || keysRef.current.has("s")) moveZ += 1;
            if (keysRef.current.has("arrowleft") || keysRef.current.has("a")) moveX -= 1;
            if (keysRef.current.has("arrowright") || keysRef.current.has("d")) moveX += 1;

            // Normalize diagonal movement
            if (moveX !== 0 && moveZ !== 0) {
                moveX *= 0.707;
                moveZ *= 0.707;
            }

            // Apply movement
            playerPosRef.current.x += moveX * PLAYER_SPEED;
            playerPosRef.current.z += moveZ * PLAYER_SPEED;

            // Clamp to world bounds
            playerPosRef.current.x = Math.max(-WORLD_SIZE / 2 + 2, Math.min(WORLD_SIZE / 2 - 2, playerPosRef.current.x));
            playerPosRef.current.z = Math.max(-WORLD_SIZE / 2 + 2, Math.min(WORLD_SIZE / 2 - 2, playerPosRef.current.z));

            // Rotate player to face movement direction
            if (moveX !== 0 || moveZ !== 0) {
                const targetRotation = Math.atan2(moveX, moveZ);
                playerRotationRef.current = targetRotation;
            }

            // Update player mesh
            if (playerMeshRef.current) {
                playerMeshRef.current.position.x = playerPosRef.current.x;
                playerMeshRef.current.position.z = playerPosRef.current.z;
                playerMeshRef.current.rotation.y = playerRotationRef.current;
            }

            // Smooth camera follow
            const idealCameraX = playerPosRef.current.x;
            const idealCameraZ = playerPosRef.current.z + CAMERA_DISTANCE;
            cameraTargetRef.current.x += (idealCameraX - cameraTargetRef.current.x) * CAMERA_SMOOTHNESS;
            cameraTargetRef.current.z += (idealCameraZ - cameraTargetRef.current.z) * CAMERA_SMOOTHNESS;

            if (cameraRef.current) {
                cameraRef.current.position.x = cameraTargetRef.current.x;
                cameraRef.current.position.z = cameraTargetRef.current.z;
                cameraRef.current.lookAt(playerPosRef.current.x, 1, playerPosRef.current.z);
            }

            // Update current area
            const px = playerPosRef.current.x;
            const pz = playerPosRef.current.z;
            if (Math.abs(px) < 5 && Math.abs(pz) < 5) {
                setCurrentArea("중앙 광장");
            } else if (pz < -10) {
                setCurrentArea("북쪽 상업지구");
            } else if (pz > 10) {
                setCurrentArea("남쪽 주거지구");
            } else if (px < -10) {
                setCurrentArea("서쪽 지역");
            } else if (px > 10) {
                setCurrentArea("동쪽 지역");
            } else {
                setCurrentArea("도심");
            }

            // Send position (throttled)
            const dx = Math.abs(playerPosRef.current.x - lastPositionSent.x);
            const dz = Math.abs(playerPosRef.current.z - lastPositionSent.z);
            if (dx > 0.2 || dz > 0.2) {
                sendPosition(
                    Math.round(playerPosRef.current.x * 10),
                    Math.round(playerPosRef.current.z * 10),
                    moveX !== 0 || moveZ !== 0 ? "walking" : "idle",
                    currentArea
                );
                lastPositionSent = { ...playerPosRef.current };
            }

            // Update other players
            if (sceneRef.current) {
                onlinePlayers.forEach((player, id) => {
                    let mesh = otherPlayerMeshesRef.current.get(id);
                    if (!mesh) {
                        mesh = createPlayerMesh(getAvatarColor(player.avatarSeed), false);
                        sceneRef.current!.add(mesh);
                        otherPlayerMeshesRef.current.set(id, mesh);
                    }
                    const targetX = player.x / 10;
                    const targetZ = player.y / 10;
                    mesh.position.x += (targetX - mesh.position.x) * 0.1;
                    mesh.position.z += (targetZ - mesh.position.z) * 0.1;
                });

                otherPlayerMeshesRef.current.forEach((mesh, id) => {
                    if (!onlinePlayers.has(id)) {
                        sceneRef.current!.remove(mesh);
                        otherPlayerMeshesRef.current.delete(id);
                    }
                });
            }

            renderer.render(scene, camera);
        };

        animate();

        // Keyboard events
        const handleKeyDown = (e: KeyboardEvent) => {
            keysRef.current.add(e.key.toLowerCase());
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysRef.current.delete(e.key.toLowerCase());
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // Resize
        const handleResize = () => {
            if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationIdRef.current);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("resize", handleResize);

            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current.forceContextLoss();
                if (container.contains(rendererRef.current.domElement)) {
                    container.removeChild(rendererRef.current.domElement);
                }
            }

            if (sceneRef.current) {
                sceneRef.current.traverse((object) => {
                    if (object instanceof THREE.Mesh) {
                        object.geometry?.dispose();
                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(m => m.dispose());
                            } else {
                                object.material.dispose();
                            }
                        }
                    }
                });
            }

            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
            playerMeshRef.current = null;
            otherPlayerMeshesRef.current.clear();
            isInitializedRef.current = false;
        };
    }, [member]);

    // Send chat
    const handleSendChat = () => {
        if (!chatInput.trim()) return;
        sendChat(chatInput);
        setChatInput("");
    };

    // Randomize avatar
    const handleRandomizeAvatar = () => {
        if (!member) return;
        const newSeed = Math.floor(Math.random() * 1000000);
        const updated = { ...member, avatarSeed: newSeed };
        setMember(updated);
        localStorage.setItem("member", JSON.stringify(updated));
        toast.success("아바타가 변경되었습니다!");
        // Recreate player mesh would require scene access
    };

    // Loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-xl font-bold drop-shadow-lg">마을 로딩 중...</p>
                </div>
            </div>
        );
    }

    // Auth required
    if (!member) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-400 to-green-400">
                <Navigation />
                <div className="pt-32 flex items-center justify-center">
                    <div className="text-center p-10 bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl">
                        <div className="text-6xl mb-4">🏘️</div>
                        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Virtual Village</h1>
                        <p className="text-white/80 mb-8">KayKit 에셋으로 만든 3D 마을</p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/login">
                                <Button className="bg-white/30 hover:bg-white/50 text-white px-8 py-6 text-lg rounded-2xl backdrop-blur">
                                    <LogIn className="w-5 h-5 mr-2" />
                                    로그인
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-6 text-lg rounded-2xl shadow-lg">
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    회원가입
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main game
    return (
        <div className={`${isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"} bg-sky-400 text-white`}>
            {!isFullscreen && <Navigation />}

            <div className={`${isFullscreen ? "h-screen" : "pt-20 h-[calc(100vh-80px)]"} flex`}>
                {/* 3D Canvas */}
                <div className="flex-1 relative" ref={containerRef}>
                    {!modelsLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-400 to-green-400 z-10">
                            <div className="text-center">
                                <div className="text-6xl mb-4 animate-bounce">🏘️</div>
                                <p className="text-white text-xl font-bold mb-4">마을을 건설하는 중...</p>
                                <div className="w-64 h-3 bg-white/30 rounded-full mx-auto overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-all duration-300"
                                        style={{ width: `${loadingProgress}%` }}
                                    />
                                </div>
                                <p className="text-white/80 mt-2">{loadingProgress}%</p>
                            </div>
                        </div>
                    )}

                    {/* HUD */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 pointer-events-auto border border-white/20">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                                <span className="text-lg font-bold">🏘️ Virtual Village</span>
                            </div>
                            <div className="text-sm text-gray-300">
                                📍 {currentArea}
                            </div>
                        </div>

                        <div className="flex gap-2 pointer-events-auto">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="w-11 h-11 bg-black/60 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors border border-white/20"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={handleRandomizeAvatar}
                                className="w-11 h-11 bg-black/60 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors border border-white/20"
                                title="아바타 변경"
                            >
                                <Shuffle className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => {
                                    playerPosRef.current = { x: 0, z: 4 };
                                    cameraTargetRef.current = { x: 0, y: CAMERA_HEIGHT, z: CAMERA_DISTANCE + 4 };
                                }}
                                className="w-11 h-11 bg-black/60 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors border border-white/20"
                                title="광장으로 돌아가기"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="w-11 h-11 bg-black/60 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors border border-white/20"
                            >
                                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Bottom HUD */}
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/20">
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-300">⌨️ WASD 또는 화살표로 이동</span>
                            <span className="text-white/30">|</span>
                            <span className="flex items-center gap-2">
                                {isConnected ? (
                                    <><Wifi className="w-4 h-4 text-green-400" /> 온라인</>
                                ) : (
                                    <><WifiOff className="w-4 h-4 text-red-400" /> 오프라인</>
                                )}
                            </span>
                            <span className="text-white/30">|</span>
                            <button
                                onClick={() => setShowPlayerList(!showPlayerList)}
                                className="flex items-center gap-2 hover:text-white"
                            >
                                <Users className="w-4 h-4" />
                                <span>{onlinePlayers.size + 1}명 접속</span>
                            </button>
                        </div>
                    </div>

                    {/* Emotes */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl rounded-full px-4 py-2 border border-white/20">
                        <div className="flex items-center gap-1">
                            {["👋", "😊", "👍", "❤️", "🎉", "🔥", "😂", "✨"].map((emote) => (
                                <button
                                    key={emote}
                                    onClick={() => sendEmote(emote)}
                                    className="w-10 h-10 text-xl hover:bg-white/20 rounded-full flex items-center justify-center hover:scale-125 transition-all duration-200"
                                >
                                    {emote}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Player List */}
                    {showPlayerList && (
                        <div className="absolute bottom-20 left-4 bg-black/70 backdrop-blur-xl rounded-2xl p-4 border border-white/20 min-w-[220px]">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-400" />
                                    접속자 목록
                                </h3>
                                <button onClick={() => setShowPlayerList(false)} className="hover:bg-white/10 rounded p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-500/20">
                                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-green-300 font-medium">{member.name}</span>
                                    <span className="text-xs text-gray-400">나</span>
                                </div>
                                {Array.from(onlinePlayers.values()).map((player) => (
                                    <div key={player.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10">
                                        <div className="w-3 h-3 rounded-full bg-blue-400" />
                                        <span>{player.name}</span>
                                    </div>
                                ))}
                                {onlinePlayers.size === 0 && (
                                    <p className="text-gray-500 text-sm text-center py-2">혼자서 탐험 중...</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Panel */}
                {showChat && (
                    <div className="w-80 bg-black/50 backdrop-blur-xl border-l border-white/10 flex flex-col">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-blue-400" />
                                <span className="font-bold">마을 채팅</span>
                            </div>
                            <button onClick={() => setShowChat(false)} className="hover:bg-white/10 rounded p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {realtimeChatMessages.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">💬</div>
                                    <p className="text-gray-500 text-sm">아직 대화가 없어요</p>
                                    <p className="text-gray-600 text-xs">먼저 인사해보세요!</p>
                                </div>
                            )}
                            {realtimeChatMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-3 rounded-2xl ${msg.playerId === `user_${member.id}`
                                        ? "bg-blue-500/30 ml-6 rounded-br-md"
                                        : "bg-white/10 mr-6 rounded-bl-md"
                                        }`}
                                >
                                    <div className="text-xs text-blue-300 mb-1">{msg.playerName}</div>
                                    <p className="text-sm">{msg.message}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-white/10">
                            <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="flex gap-2">
                                <Input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="메시지를 입력하세요..."
                                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl"
                                />
                                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 rounded-xl px-4">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                )}

                {!showChat && (
                    <button
                        onClick={() => setShowChat(true)}
                        className="absolute bottom-4 right-4 w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                    >
                        <MessageCircle className="w-6 h-6" />
                        {realtimeChatMessages.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                                {realtimeChatMessages.length}
                            </span>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
