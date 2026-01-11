import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Users, MessageCircle, Send, X, Maximize2, Minimize2,
    Volume2, VolumeX, LogIn, Shuffle, Wifi, WifiOff, UserPlus, RotateCcw, Map as MapIcon,
} from "lucide-react";
import { useRealtimeWorld } from "@/hooks/useRealtimeWorld";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// VirtualWorld3D v2.0 - 2026-01-11 20:33 KST - Cache bust
// 🌍 WORLD CONSTANTS - 100x100 COMPLETE CITY
// ════════════════════════════════════════════════════════════════

const WORLD_SIZE = 100;
const HALF_WORLD = WORLD_SIZE / 2; // 50
const ROAD_WIDTH = 6;
const BLOCK_SIZE = 15; // City block size
const BUILDING_GAP = 1; // Gap between buildings and roads
const PLAYER_SPEED = 0.18;
const CAMERA_HEIGHT = 15;
const CAMERA_DISTANCE = 22;

// ════════════════════════════════════════════════════════════════
// 🗺️ ZONE DEFINITIONS (Z-axis layering)
// ════════════════════════════════════════════════════════════════

type ZoneType = "nature_north" | "residential_north" | "commercial_north" |
    "road_north" | "cbd" | "road_south" | "residential_south" | "nature_south";

interface Zone {
    name: string;
    type: ZoneType;
    zMin: number;
    zMax: number;
    color: number;
    buildingDensity: number; // 0-1
    buildingHeightMultiplier: number;
}

const ZONES: Zone[] = [
    { name: "북쪽 자연", type: "nature_north", zMin: 40, zMax: 50, color: 0x228B22, buildingDensity: 0, buildingHeightMultiplier: 0 },
    { name: "북쪽 주거", type: "residential_north", zMin: 25, zMax: 40, color: 0x90EE90, buildingDensity: 0.6, buildingHeightMultiplier: 0.6 },
    { name: "북쪽 상업", type: "commercial_north", zMin: 10, zMax: 25, color: 0xFFD700, buildingDensity: 0.8, buildingHeightMultiplier: 0.8 },
    { name: "북쪽 도로", type: "road_north", zMin: -5, zMax: 10, color: 0x808080, buildingDensity: 0.7, buildingHeightMultiplier: 0.9 },
    { name: "도심 CBD", type: "cbd", zMin: -25, zMax: -5, color: 0x4169E1, buildingDensity: 1.0, buildingHeightMultiplier: 1.5 },
    { name: "남쪽 도로", type: "road_south", zMin: -35, zMax: -25, color: 0x808080, buildingDensity: 0.7, buildingHeightMultiplier: 0.9 },
    { name: "남쪽 주거", type: "residential_south", zMin: -45, zMax: -35, color: 0x90EE90, buildingDensity: 0.6, buildingHeightMultiplier: 0.6 },
    { name: "남쪽 자연", type: "nature_south", zMin: -50, zMax: -45, color: 0x228B22, buildingDensity: 0, buildingHeightMultiplier: 0 },
];

// ════════════════════════════════════════════════════════════════
// 🛣️ ROAD NETWORK GENERATION
// ════════════════════════════════════════════════════════════════

interface Road {
    x: number;
    z: number;
    width: number;
    length: number;
    isHorizontal: boolean;
}

function generateRoadNetwork(): Road[] {
    const roads: Road[] = [];

    // Main boulevards (central cross)
    roads.push({ x: 0, z: 0, width: ROAD_WIDTH, length: WORLD_SIZE, isHorizontal: false }); // Vertical
    roads.push({ x: 0, z: 0, width: ROAD_WIDTH, length: WORLD_SIZE, isHorizontal: true });  // Horizontal

    // Secondary roads - Horizontal (at Z positions)
    const horizontalRoadZ = [-35, -20, 0, 20, 35];
    horizontalRoadZ.forEach(z => {
        roads.push({ x: 0, z, width: 4, length: WORLD_SIZE, isHorizontal: true });
    });

    // Secondary roads - Vertical (at X positions)
    const verticalRoadX = [-35, -20, 0, 20, 35];
    verticalRoadX.forEach(x => {
        roads.push({ x, z: 0, width: 4, length: WORLD_SIZE, isHorizontal: false });
    });

    return roads;
}

// Check if position is on a road
function isOnRoad(x: number, z: number, roads: Road[]): boolean {
    for (const road of roads) {
        if (road.isHorizontal) {
            if (Math.abs(z - road.z) < road.width / 2 + 1) {
                if (x >= -HALF_WORLD && x <= HALF_WORLD) return true;
            }
        } else {
            if (Math.abs(x - road.x) < road.width / 2 + 1) {
                if (z >= -HALF_WORLD && z <= HALF_WORLD) return true;
            }
        }
    }
    return false;
}

// ════════════════════════════════════════════════════════════════
// 🏢 BUILDING GENERATION
// ════════════════════════════════════════════════════════════════

interface BuildingPlacement {
    x: number;
    z: number;
    type: string;
    scale: number;
    rotation: number;
}

const BUILDING_TYPES = ["building_A", "building_B", "building_C", "building_D",
    "building_E", "building_F", "building_G", "building_H"];

function generateBuildings(roads: Road[]): BuildingPlacement[] {
    const buildings: BuildingPlacement[] = [];
    const occupied: Set<string> = new Set();

    // Grid-based placement
    const gridStep = 5; // Place building every 5 units

    for (let x = -HALF_WORLD + 3; x < HALF_WORLD - 3; x += gridStep) {
        for (let z = -HALF_WORLD + 3; z < HALF_WORLD - 3; z += gridStep) {
            // Skip if on road
            if (isOnRoad(x, z, roads)) continue;

            // Get zone for this position
            const zone = ZONES.find(zone => z >= zone.zMin && z < zone.zMax);
            if (!zone) continue;

            // Skip nature zones
            if (zone.type === "nature_north" || zone.type === "nature_south") continue;

            // Check density
            if (Math.random() > zone.buildingDensity) continue;

            // Check if position is already occupied
            const key = `${Math.floor(x / 3)},${Math.floor(z / 3)}`;
            if (occupied.has(key)) continue;
            occupied.add(key);

            // Select building type based on zone
            let typeIndex: number;
            if (zone.type === "cbd") {
                typeIndex = Math.floor(Math.random() * 4) + 4; // E, F, G, H (tall)
            } else if (zone.type.includes("commercial")) {
                typeIndex = Math.floor(Math.random() * 4) + 2; // C, D, E, F
            } else {
                typeIndex = Math.floor(Math.random() * 4); // A, B, C, D (small)
            }

            const buildingType = BUILDING_TYPES[typeIndex];
            const scale = 0.8 + Math.random() * 0.4 * zone.buildingHeightMultiplier;
            const rotation = (Math.floor(Math.random() * 4)) * (Math.PI / 2); // 0, 90, 180, 270

            buildings.push({ x, z, type: buildingType, scale, rotation });
        }
    }

    return buildings;
}

// ════════════════════════════════════════════════════════════════
// 🌲 NATURE GENERATION
// ════════════════════════════════════════════════════════════════

interface NatureElement {
    x: number;
    z: number;
    type: "tree" | "rock" | "bush";
    scale: number;
}

function generateNature(): NatureElement[] {
    const nature: NatureElement[] = [];

    // North nature zone (Z: 40 to 50)
    for (let x = -HALF_WORLD; x < HALF_WORLD; x += 3) {
        for (let z = 40; z < HALF_WORLD; z += 3) {
            if (Math.random() > 0.3) {
                nature.push({
                    x: x + Math.random() * 2,
                    z: z + Math.random() * 2,
                    type: Math.random() > 0.2 ? "tree" : "bush",
                    scale: 0.6 + Math.random() * 0.5
                });
            }
        }
    }

    // South nature zone (Z: -50 to -45)
    for (let x = -HALF_WORLD; x < HALF_WORLD; x += 3) {
        for (let z = -HALF_WORLD; z < -45; z += 3) {
            if (Math.random() > 0.3) {
                nature.push({
                    x: x + Math.random() * 2,
                    z: z + Math.random() * 2,
                    type: Math.random() > 0.2 ? "tree" : "bush",
                    scale: 0.6 + Math.random() * 0.5
                });
            }
        }
    }

    // Border trees (world edges)
    for (let i = -HALF_WORLD; i < HALF_WORLD; i += 4) {
        // West edge
        nature.push({ x: -HALF_WORLD + 1, z: i, type: "tree", scale: 1 });
        // East edge
        nature.push({ x: HALF_WORLD - 1, z: i, type: "tree", scale: 1 });
    }

    return nature;
}

// ════════════════════════════════════════════════════════════════
// 🚗 PROPS & VEHICLES
// ════════════════════════════════════════════════════════════════

interface PropPlacement {
    x: number;
    z: number;
    type: string;
    rotation: number;
    scale: number;
}

const CAR_TYPES = ["car_taxi", "car_sedan", "car_police", "car_hatchback", "car_stationwagon"];
const PROP_TYPES = ["bench", "streetlight", "trafficlight_A", "trafficlight_B", "firehydrant", "dumpster", "trash_A", "watertower"];

function generateProps(roads: Road[]): PropPlacement[] {
    const props: PropPlacement[] = [];

    // Streetlights along roads
    for (let x = -HALF_WORLD + 5; x < HALF_WORLD; x += 10) {
        for (let z = -HALF_WORLD + 5; z < HALF_WORLD; z += 15) {
            if (isOnRoad(x, z, roads)) {
                props.push({ x: x + 3, z, type: "streetlight", rotation: 0, scale: 1 });
            }
        }
    }

    // Traffic lights at intersections
    const intersections: [number, number][] = [];
    [-35, -20, 0, 20, 35].forEach(x => {
        [-35, -20, 0, 20, 35].forEach(z => {
            intersections.push([x, z]);
        });
    });

    intersections.forEach(([x, z]) => {
        const type = Math.random() > 0.5 ? "trafficlight_A" : "trafficlight_B";
        props.push({ x: x + 4, z: z + 4, type, rotation: Math.random() * Math.PI * 2, scale: 1 });
    });

    // Cars on roads
    for (let i = 0; i < 80; i++) {
        const x = -HALF_WORLD + Math.random() * WORLD_SIZE;
        const z = -HALF_WORLD + Math.random() * WORLD_SIZE;
        if (isOnRoad(x, z, roads)) {
            const carType = CAR_TYPES[Math.floor(Math.random() * CAR_TYPES.length)];
            const rotation = Math.floor(Math.random() * 4) * (Math.PI / 2);
            props.push({ x, z, type: carType, rotation, scale: 1 });
        }
    }

    // Benches in parks and near buildings
    for (let x = -40; x < 40; x += 20) {
        for (let z = -40; z < 40; z += 20) {
            if (!isOnRoad(x, z, roads)) {
                props.push({ x, z, type: "bench", rotation: Math.random() * Math.PI * 2, scale: 1 });
            }
        }
    }

    // Fire hydrants
    for (let i = 0; i < 40; i++) {
        const x = -45 + Math.random() * 90;
        const z = -45 + Math.random() * 90;
        if (!isOnRoad(x, z, roads)) {
            props.push({ x, z, type: "firehydrant", rotation: 0, scale: 1 });
        }
    }

    // Dumpsters behind buildings (corners)
    [[-45, -45], [-45, 45], [45, -45], [45, 45], [-45, 0], [45, 0]].forEach(([x, z]) => {
        props.push({ x, z, type: "dumpster", rotation: Math.random() * Math.PI, scale: 1 });
    });

    // Water towers in industrial/residential
    props.push({ x: -40, z: 30, type: "watertower", rotation: 0, scale: 1 });
    props.push({ x: 40, z: -30, type: "watertower", rotation: 0, scale: 1 });

    return props;
}

// ════════════════════════════════════════════════════════════════
// 🎨 AVATAR COLORS
// ════════════════════════════════════════════════════════════════

const AVATAR_COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
    "#BB8FCE", "#85C1E9", "#F8B500", "#00CED1",
];

function getAvatarColor(seed: number): string {
    return AVATAR_COLORS[seed % AVATAR_COLORS.length];
}

// ════════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT
// ════════════════════════════════════════════════════════════════

export default function VirtualWorld3D() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const playerMeshRef = useRef<THREE.Group | null>(null);
    const otherPlayerMeshesRef = useRef(new Map<string, THREE.Group>());
    const animationIdRef = useRef<number>(0);
    const isInitializedRef = useRef(false);
    const keysRef = useRef(new Set<string>());
    const playerPosRef = useRef({ x: 0, z: 0 });
    const playerRotationRef = useRef(0);
    const cameraTargetRef = useRef({ x: 0, y: CAMERA_HEIGHT, z: CAMERA_DISTANCE });

    // State
    const [member, setMember] = useState<{ id: number; name: string; avatarSeed?: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStage, setLoadingStage] = useState("초기화 중...");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [chatInput, setChatInput] = useState("");
    const [showPlayerList, setShowPlayerList] = useState(false);
    const [currentZone, setCurrentZone] = useState("도심 CBD");
    const [showMinimap, setShowMinimap] = useState(true);

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
        initialY: 0,
        onPlayerJoin: (name: string) => toast.success(`👋 ${name}님이 도시에 입장했습니다!`, { duration: 3000 }),
        onPlayerLeave: (name: string) => toast.info(`👋 ${name}님이 떠났습니다.`, { duration: 3000 }),
    } : { playerId: "", playerName: "", avatarSeed: 0, initialX: 0, initialY: 0 };

    const {
        players: onlinePlayers, chatMessages: realtimeChatMessages, isConnected,
        sendPosition, sendChat, sendEmote,
    } = useRealtimeWorld(realtimeOptions);

    // Create player mesh
    const createPlayerMesh = (color: string, isLocal: boolean = false): THREE.Group => {
        const group = new THREE.Group();

        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.0, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.4, metalness: 0.1 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2;
        body.castShadow = true;
        group.add(body);

        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.5 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.2;
        head.castShadow = true;
        group.add(head);

        if (isLocal) {
            const ringGeometry = new THREE.RingGeometry(0.6, 0.8, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.02;
            group.add(ring);

            const arrowShape = new THREE.Shape();
            arrowShape.moveTo(0, 0.5);
            arrowShape.lineTo(-0.25, 0);
            arrowShape.lineTo(0.25, 0);
            arrowShape.closePath();
            const arrowGeometry = new THREE.ShapeGeometry(arrowShape);
            const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide });
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
            arrow.rotation.x = -Math.PI / 2;
            arrow.position.y = 0.03;
            arrow.position.z = -0.7;
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
        scene.background = new THREE.Color(0x87CEEB);
        // Note: Fog removed due to bundler compatibility issues
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500);
        camera.position.set(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xfffaf0, 1.2);
        sunLight.position.set(50, 80, 50);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 200;
        sunLight.shadow.camera.left = -80;
        sunLight.shadow.camera.right = 80;
        sunLight.shadow.camera.top = 80;
        sunLight.shadow.camera.bottom = -80;
        sunLight.shadow.bias = -0.0001;
        scene.add(sunLight);

        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3a7d44, 0.4);
        scene.add(hemiLight);

        setLoadingStage("지형 생성 중...");

        // Ground with zone colors
        ZONES.forEach(zone => {
            const zoneHeight = zone.zMax - zone.zMin;
            const zoneCenterZ = (zone.zMax + zone.zMin) / 2;
            const groundGeometry = new THREE.PlaneGeometry(WORLD_SIZE, zoneHeight);
            const groundMaterial = new THREE.MeshStandardMaterial({ color: zone.color, roughness: 0.9 });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.set(0, -0.01, zoneCenterZ);
            ground.receiveShadow = true;
            scene.add(ground);
        });

        // Generate city data
        setLoadingStage("도로망 생성 중...");
        const roads = generateRoadNetwork();

        // Draw roads
        roads.forEach(road => {
            const roadGeometry = road.isHorizontal
                ? new THREE.PlaneGeometry(road.length, road.width)
                : new THREE.PlaneGeometry(road.width, road.length);
            const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.95 });
            const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
            roadMesh.rotation.x = -Math.PI / 2;
            roadMesh.position.set(road.x, 0.01, road.z);
            roadMesh.receiveShadow = true;
            scene.add(roadMesh);

            // Road markings
            const lineGeometry = road.isHorizontal
                ? new THREE.PlaneGeometry(road.length * 0.95, 0.15)
                : new THREE.PlaneGeometry(0.15, road.length * 0.95);
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFCC00 });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.rotation.x = -Math.PI / 2;
            line.position.set(road.x, 0.02, road.z);
            scene.add(line);
        });

        setLoadingStage("건물 배치 중...");
        const buildings = generateBuildings(roads);

        setLoadingStage("자연환경 생성 중...");
        const nature = generateNature();

        setLoadingStage("소품 배치 중...");
        const props = generateProps(roads);

        // Model loading
        const loader = new GLTFLoader();
        const modelCache: Map<string, THREE.Group> = new Map();
        let loadedCount = 0;
        const totalToLoad = buildings.length + props.length;

        const loadModel = async (name: string, x: number, z: number, rotation: number, scale: number) => {
            try {
                let model: THREE.Group;
                if (modelCache.has(name)) {
                    model = modelCache.get(name)!.clone();
                } else {
                    const gltf = await new Promise<any>((resolve, reject) => {
                        loader.load(`/models/${name}.gltf`, resolve, undefined, reject);
                    });
                    modelCache.set(name, gltf.scene.clone());
                    model = gltf.scene;
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
            } catch { }
            loadedCount++;
            setLoadingProgress(Math.floor((loadedCount / totalToLoad) * 100));
        };

        // Load all models
        const loadAllModels = async () => {
            setLoadingStage("건물 모델 로딩 중...");
            for (const b of buildings) {
                await loadModel(b.type, b.x, b.z, b.rotation, b.scale);
            }

            setLoadingStage("소품 모델 로딩 중...");
            for (const p of props) {
                await loadModel(p.type, p.x, p.z, p.rotation, p.scale);
            }

            // Create simple trees for nature zones
            setLoadingStage("자연환경 완성 중...");
            nature.forEach(n => {
                if (n.type === "tree") {
                    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
                    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
                    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                    trunk.position.set(n.x, 1, n.z);
                    trunk.castShadow = true;
                    scene.add(trunk);

                    const leavesGeometry = new THREE.SphereGeometry(1.2 * n.scale, 8, 6);
                    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
                    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                    leaves.position.set(n.x, 2.5, n.z);
                    leaves.castShadow = true;
                    scene.add(leaves);
                } else if (n.type === "bush") {
                    const bushGeometry = new THREE.SphereGeometry(0.6 * n.scale, 8, 6);
                    const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x2E8B57 });
                    const bush = new THREE.Mesh(bushGeometry, bushMaterial);
                    bush.position.set(n.x, 0.4, n.z);
                    bush.castShadow = true;
                    scene.add(bush);
                }
            });

            setModelsLoaded(true);
        };

        loadAllModels();

        // Create local player
        const playerColor = getAvatarColor(member.avatarSeed || 0);
        const playerMesh = createPlayerMesh(playerColor, true);
        playerMesh.position.set(0, 0, 0);
        scene.add(playerMesh);
        playerMeshRef.current = playerMesh;

        // Animation loop
        let lastPositionSent = { x: 0, z: 0 };

        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);

            // Movement
            let moveX = 0, moveZ = 0;
            if (keysRef.current.has("arrowup") || keysRef.current.has("w")) moveZ -= 1;
            if (keysRef.current.has("arrowdown") || keysRef.current.has("s")) moveZ += 1;
            if (keysRef.current.has("arrowleft") || keysRef.current.has("a")) moveX -= 1;
            if (keysRef.current.has("arrowright") || keysRef.current.has("d")) moveX += 1;

            if (moveX !== 0 && moveZ !== 0) { moveX *= 0.707; moveZ *= 0.707; }

            playerPosRef.current.x = Math.max(-HALF_WORLD + 2, Math.min(HALF_WORLD - 2, playerPosRef.current.x + moveX * PLAYER_SPEED));
            playerPosRef.current.z = Math.max(-HALF_WORLD + 2, Math.min(HALF_WORLD - 2, playerPosRef.current.z + moveZ * PLAYER_SPEED));

            if (moveX !== 0 || moveZ !== 0) {
                playerRotationRef.current = Math.atan2(moveX, moveZ);
            }

            if (playerMeshRef.current) {
                playerMeshRef.current.position.x = playerPosRef.current.x;
                playerMeshRef.current.position.z = playerPosRef.current.z;
                playerMeshRef.current.rotation.y = playerRotationRef.current;
            }

            // Camera follow
            const camX = playerPosRef.current.x;
            const camZ = playerPosRef.current.z + CAMERA_DISTANCE;
            cameraTargetRef.current.x += (camX - cameraTargetRef.current.x) * 0.08;
            cameraTargetRef.current.z += (camZ - cameraTargetRef.current.z) * 0.08;

            if (cameraRef.current) {
                cameraRef.current.position.x = cameraTargetRef.current.x;
                cameraRef.current.position.z = cameraTargetRef.current.z;
                cameraRef.current.lookAt(playerPosRef.current.x, 0, playerPosRef.current.z);
            }

            // Update zone
            const pz = playerPosRef.current.z;
            const zone = ZONES.find(z => pz >= z.zMin && pz < z.zMax);
            if (zone) setCurrentZone(zone.name);

            // Send position
            const dx = Math.abs(playerPosRef.current.x - lastPositionSent.x);
            const dz = Math.abs(playerPosRef.current.z - lastPositionSent.z);
            if (dx > 0.3 || dz > 0.3) {
                sendPosition(Math.round(playerPosRef.current.x * 10), Math.round(playerPosRef.current.z * 10), "walking", currentZone);
                lastPositionSent = { ...playerPosRef.current };
            }

            // Other players
            if (sceneRef.current) {
                onlinePlayers.forEach((player, id) => {
                    let mesh = otherPlayerMeshesRef.current.get(id);
                    if (!mesh) {
                        mesh = createPlayerMesh(getAvatarColor(player.avatarSeed), false);
                        sceneRef.current!.add(mesh);
                        otherPlayerMeshesRef.current.set(id, mesh);
                    }
                    mesh.position.x += ((player.x / 10) - mesh.position.x) * 0.1;
                    mesh.position.z += ((player.y / 10) - mesh.position.z) * 0.1;
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

        // Events
        const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
        const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        const handleResize = () => {
            if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

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
            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
            playerMeshRef.current = null;
            otherPlayerMeshesRef.current.clear();
            isInitializedRef.current = false;
        };
    }, [member]);

    const handleSendChat = () => { if (chatInput.trim()) { sendChat(chatInput); setChatInput(""); } };
    const handleRandomizeAvatar = () => {
        if (!member) return;
        const updated = { ...member, avatarSeed: Math.floor(Math.random() * 1000000) };
        setMember(updated);
        localStorage.setItem("member", JSON.stringify(updated));
        toast.success("아바타 변경됨!");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-400 to-emerald-400 flex items-center justify-center">
                <div className="w-24 h-24 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!member) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-400 to-emerald-400">
                <Navigation />
                <div className="pt-32 flex items-center justify-center">
                    <div className="text-center p-12 bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30">
                        <div className="text-7xl mb-6">🌆</div>
                        <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">Mega City</h1>
                        <p className="text-white/80 mb-8 text-lg">100×100 완전 밀집 3D 도시</p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/login">
                                <Button className="bg-white/30 hover:bg-white/50 text-white px-8 py-6 text-lg rounded-2xl">
                                    <LogIn className="w-5 h-5 mr-2" />로그인
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-6 text-lg rounded-2xl shadow-xl">
                                    <UserPlus className="w-5 h-5 mr-2" />회원가입
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"} bg-sky-400 text-white`}>
            {!isFullscreen && <Navigation />}

            <div className={`${isFullscreen ? "h-screen" : "pt-20 h-[calc(100vh-80px)]"} flex`}>
                <div className="flex-1 relative" ref={containerRef}>
                    {!modelsLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-500 to-emerald-500 z-10">
                            <div className="text-center">
                                <div className="text-8xl mb-6 animate-bounce">🏙️</div>
                                <h2 className="text-3xl font-bold text-white mb-4">Mega City 생성 중</h2>
                                <p className="text-white/80 mb-6 text-lg">{loadingStage}</p>
                                <div className="w-80 h-4 bg-white/30 rounded-full mx-auto overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
                                </div>
                                <p className="text-white mt-3 text-xl font-bold">{loadingProgress}%</p>
                            </div>
                        </div>
                    )}

                    {/* 🚧 Prototype Banner */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-amber-500/90 text-black rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                        🚧 프로토타입 (개발중) - 테스트 버전입니다
                    </div>

                    {/* 💬 Chat Bubbles Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                        {realtimeChatMessages.slice(-5).map((msg, index) => (
                            <div
                                key={msg.id}
                                className="absolute animate-fadeIn"
                                style={{
                                    left: `${20 + (index * 15)}%`,
                                    bottom: `${15 + (index * 8)}%`,
                                    animation: 'fadeInOut 5s forwards',
                                    opacity: 1 - (index * 0.15),
                                }}
                            >
                                <div className="bg-black/80 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs border border-white/20">
                                    <div className="text-xs text-blue-400 mb-0.5">{msg.playerName}</div>
                                    <p className="text-white text-sm">{msg.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* HUD */}
                    <div className="absolute top-10 left-4 right-4 flex justify-between items-start pointer-events-none">
                        <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-4 pointer-events-auto border border-white/20">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                                <span className="text-xl font-bold">🌆 Mega City</span>
                            </div>
                            <div className="text-sm text-gray-300">📍 {currentZone}</div>
                            <div className="text-xs text-gray-500 mt-1">X: {Math.round(playerPosRef.current.x)} Z: {Math.round(playerPosRef.current.z)}</div>
                        </div>

                        <div className="flex gap-2 pointer-events-auto">
                            <button onClick={() => setShowMinimap(!showMinimap)} className="w-11 h-11 bg-black/70 rounded-xl flex items-center justify-center hover:bg-white/20 border border-white/20">
                                <MapIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => setIsMuted(!isMuted)} className="w-11 h-11 bg-black/70 rounded-xl flex items-center justify-center hover:bg-white/20 border border-white/20">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <button onClick={handleRandomizeAvatar} className="w-11 h-11 bg-black/70 rounded-xl flex items-center justify-center hover:bg-white/20 border border-white/20">
                                <Shuffle className="w-5 h-5" />
                            </button>
                            <button onClick={() => { playerPosRef.current = { x: 0, z: 0 }; }} className="w-11 h-11 bg-black/70 rounded-xl flex items-center justify-center hover:bg-white/20 border border-white/20">
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button onClick={() => setIsFullscreen(!isFullscreen)} className="w-11 h-11 bg-black/70 rounded-xl flex items-center justify-center hover:bg-white/20 border border-white/20">
                                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Minimap */}
                    {showMinimap && (
                        <div className="absolute top-20 right-4 w-40 h-40 bg-black/70 rounded-xl border border-white/20 overflow-hidden">
                            <div className="relative w-full h-full">
                                {ZONES.map((zone, i) => (
                                    <div key={i} className="absolute w-full" style={{
                                        bottom: `${((zone.zMin + 50) / 100) * 100}%`,
                                        height: `${((zone.zMax - zone.zMin) / 100) * 100}%`,
                                        backgroundColor: `#${zone.color.toString(16).padStart(6, '0')}`,
                                        opacity: 0.6
                                    }} />
                                ))}
                                <div className="absolute w-2 h-2 bg-green-400 rounded-full border border-white animate-pulse" style={{
                                    left: `${((playerPosRef.current.x + 50) / 100) * 100}%`,
                                    bottom: `${((playerPosRef.current.z + 50) / 100) * 100}%`,
                                    transform: 'translate(-50%, 50%)'
                                }} />
                            </div>
                        </div>
                    )}

                    {/* Bottom HUD */}
                    <div className="absolute bottom-4 left-4 bg-black/70 rounded-2xl px-5 py-3 border border-white/20">
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-300">⌨️ WASD 이동</span>
                            <span className="text-white/30">|</span>
                            <span className="flex items-center gap-2">
                                {isConnected ? <><Wifi className="w-4 h-4 text-green-400" />온라인</> : <><WifiOff className="w-4 h-4 text-red-400" />오프라인</>}
                            </span>
                            <span className="text-white/30">|</span>
                            <button onClick={() => setShowPlayerList(!showPlayerList)} className="flex items-center gap-2 hover:text-white">
                                <Users className="w-4 h-4" />{onlinePlayers.size + 1}명
                            </button>
                        </div>
                    </div>

                    {/* Emotes */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 rounded-full px-4 py-2 border border-white/20">
                        <div className="flex gap-1">
                            {["👋", "😊", "👍", "❤️", "🎉", "🔥", "😂", "✨"].map((emote) => (
                                <button key={emote} onClick={() => sendEmote(emote)} className="w-10 h-10 text-xl hover:bg-white/20 rounded-full hover:scale-110 transition-transform">{emote}</button>
                            ))}
                        </div>
                    </div>

                    {/* Player List */}
                    {showPlayerList && (
                        <div className="absolute bottom-20 left-4 bg-black/80 rounded-2xl p-4 border border-white/20 min-w-[200px]">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold flex items-center gap-2"><Users className="w-4 h-4 text-green-400" />접속자</h3>
                                <button onClick={() => setShowPlayerList(false)}><X className="w-4 h-4" /></button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-500/20">
                                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-green-300">{member.name}</span>
                                    <span className="text-xs text-gray-400">나</span>
                                </div>
                                {Array.from(onlinePlayers.values()).map((player) => (
                                    <div key={player.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10">
                                        <div className="w-3 h-3 rounded-full bg-blue-400" />
                                        <span>{player.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat */}
                {showChat && (
                    <div className="w-80 bg-black/60 backdrop-blur-xl border-l border-white/10 flex flex-col">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-blue-400" /><span className="font-bold">도시 채팅</span></div>
                            <button onClick={() => setShowChat(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {realtimeChatMessages.length === 0 && <div className="text-center py-8 text-gray-500"><div className="text-4xl mb-2">💬</div><p className="text-sm">대화를 시작해보세요!</p></div>}
                            {realtimeChatMessages.map((msg) => (
                                <div key={msg.id} className={`p-3 rounded-2xl ${msg.playerId === `user_${member.id}` ? "bg-blue-500/30 ml-6 rounded-br-md" : "bg-white/10 mr-6 rounded-bl-md"}`}>
                                    <div className="text-xs text-blue-300 mb-1">{msg.playerName}</div>
                                    <p className="text-sm">{msg.message}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-white/10">
                            <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="flex gap-2">
                                <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="메시지..." className="flex-1 bg-white/10 border-white/20 text-white rounded-xl" />
                                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 rounded-xl px-4"><Send className="w-4 h-4" /></Button>
                            </form>
                        </div>
                    </div>
                )}

                {!showChat && (
                    <button onClick={() => setShowChat(true)} className="absolute bottom-4 right-4 w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                        <MessageCircle className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
}
