import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import { useRealtimeWorld } from "@/hooks/useRealtimeWorld";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ============================================
// 🎮 GAME CONSTANTS
// ============================================

const MAP_SIZE = 10; // 10x10 grid
const TILE_SIZE = 2; // Each tile is 2x2 units
const PLAYER_SPEED = 0.15;

// ============================================
// 🏙️ CITY MAP LAYOUT
// ============================================

// 0 = empty, 1 = road, 2 = building, 3 = prop
const CITY_MAP = [
    [2, 2, 1, 1, 1, 1, 1, 1, 2, 2],
    [2, 0, 1, 0, 0, 0, 0, 1, 0, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 3, 3, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [2, 0, 1, 0, 0, 0, 0, 1, 0, 2],
    [2, 2, 1, 1, 1, 1, 1, 1, 2, 2],
];

// Building positions with types
const BUILDINGS = [
    { x: 0, z: 0, type: "A" },
    { x: 1, z: 0, type: "B" },
    { x: 8, z: 0, type: "C" },
    { x: 9, z: 0, type: "D" },
    { x: 0, z: 1, type: "E" },
    { x: 9, z: 1, type: "F" },
    { x: 0, z: 8, type: "G" },
    { x: 9, z: 8, type: "H" },
    { x: 0, z: 9, type: "A" },
    { x: 1, z: 9, type: "B" },
    { x: 8, z: 9, type: "C" },
    { x: 9, z: 9, type: "D" },
];

// Props (benches, streetlights, etc.)
const PROPS = [
    { x: 4, z: 3, type: "bench" },
    { x: 5, z: 3, type: "bush" },
    { x: 2, z: 2, type: "streetlight" },
    { x: 7, z: 2, type: "streetlight" },
    { x: 2, z: 7, type: "streetlight" },
    { x: 7, z: 7, type: "streetlight" },
    { x: 4, z: 7, type: "trafficlight_A" },
];

// Cars on roads
const CARS = [
    { x: 3, z: 2, type: "car_taxi", rotation: 0 },
    { x: 6, z: 7, type: "car_sedan", rotation: Math.PI },
];

// ============================================
// 🎨 AVATAR COLORS (for 3D players)
// ============================================

const AVATAR_COLORS = [
    "#FFD93D", "#FFA07A", "#DEB887", "#D2B48C",
    "#6C5CE7", "#00B894", "#E17055", "#0984E3",
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
    const controlsRef = useRef<OrbitControls | null>(null);
    const playerMeshRef = useRef<THREE.Group | null>(null);
    const otherPlayerMeshes = useRef<Map<string, THREE.Group>>(new Map());
    const animationIdRef = useRef<number>(0);

    // State
    const [member, setMember] = useState<{ id: number; name: string; avatarSeed?: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [chatInput, setChatInput] = useState("");
    const [showPlayerList, setShowPlayerList] = useState(false);

    // Player position (in grid coordinates)
    const playerPosRef = useRef({ x: 5, z: 5 });
    const keysRef = useRef<Set<string>>(new Set());

    // Time of day
    const [timeOfDay, setTimeOfDay] = useState<"day" | "evening" | "night">("day");

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
    const {
        players: onlinePlayers,
        chatMessages: realtimeChatMessages,
        isConnected,
        sendPosition,
        sendChat,
        sendEmote,
    } = useRealtimeWorld({
        playerId: member ? `user_${member.id}` : "",
        playerName: member?.name || "",
        avatarSeed: member?.avatarSeed || 0,
        initialX: 5,
        initialY: 5,
        onPlayerJoin: (name) => {
            toast.success(`👋 ${name}님이 입장했습니다!`, { duration: 3000 });
        },
        onPlayerLeave: (name) => {
            toast.info(`👋 ${name}님이 퇴장했습니다.`, { duration: 3000 });
        },
    });

    // Time of day cycle
    useEffect(() => {
        const updateTime = () => {
            const hour = new Date().getHours();
            if (hour >= 6 && hour < 17) setTimeOfDay("day");
            else if (hour >= 17 && hour < 20) setTimeOfDay("evening");
            else setTimeOfDay("night");
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Initialize Three.js scene
    useEffect(() => {
        if (!member || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(timeOfDay === "night" ? 0x0a0a1a : 0x87ceeb);
        scene.fog = new THREE.Fog(scene.background as THREE.Color, 15, 40);
        sceneRef.current = scene;

        // Camera (isometric-like perspective)
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(15, 15, 15);
        camera.lookAt(MAP_SIZE, 0, MAP_SIZE);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2.2;
        controls.minDistance = 5;
        controls.maxDistance = 30;
        controls.target.set(MAP_SIZE / 2 * TILE_SIZE, 0, MAP_SIZE / 2 * TILE_SIZE);
        controlsRef.current = controls;

        // Lighting
        const ambientLight = new THREE.AmbientLight(
            timeOfDay === "night" ? 0x404060 : 0xffffff,
            timeOfDay === "night" ? 0.3 : 0.6
        );
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(
            timeOfDay === "evening" ? 0xffa500 : 0xffffff,
            timeOfDay === "night" ? 0.2 : 0.8
        );
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Ground
        const groundGeometry = new THREE.PlaneGeometry(MAP_SIZE * TILE_SIZE + 10, MAP_SIZE * TILE_SIZE + 10);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5a27,
            roughness: 0.8,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(MAP_SIZE, 0, MAP_SIZE);
        ground.receiveShadow = true;
        scene.add(ground);

        // Load models
        const loader = new GLTFLoader();
        const modelCache: Map<string, THREE.Group> = new Map();

        const loadModel = (name: string): Promise<THREE.Group> => {
            return new Promise((resolve, reject) => {
                if (modelCache.has(name)) {
                    resolve(modelCache.get(name)!.clone());
                    return;
                }
                loader.load(
                    `/models/${name}.gltf`,
                    (gltf) => {
                        const model = gltf.scene;
                        model.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        modelCache.set(name, model);
                        resolve(model.clone());
                    },
                    undefined,
                    reject
                );
            });
        };

        // Create simple road tiles
        const createRoadTile = (x: number, z: number) => {
            const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
            const material = new THREE.MeshStandardMaterial({
                color: 0x444444,
                roughness: 0.9,
            });
            const road = new THREE.Mesh(geometry, material);
            road.rotation.x = -Math.PI / 2;
            road.position.set(x * TILE_SIZE, 0.01, z * TILE_SIZE);
            road.receiveShadow = true;
            scene.add(road);

            // Road markings
            const lineGeometry = new THREE.PlaneGeometry(0.1, TILE_SIZE * 0.8);
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x * TILE_SIZE, 0.02, z * TILE_SIZE);
            scene.add(line);
        };

        // Create city
        const createCity = async () => {
            // Roads
            for (let z = 0; z < MAP_SIZE; z++) {
                for (let x = 0; x < MAP_SIZE; x++) {
                    if (CITY_MAP[z][x] === 1) {
                        createRoadTile(x, z);
                    }
                }
            }

            // Buildings
            for (const building of BUILDINGS) {
                try {
                    const model = await loadModel(`building_${building.type}`);
                    model.position.set(building.x * TILE_SIZE, 0, building.z * TILE_SIZE);
                    model.scale.set(0.8, 0.8, 0.8);
                    scene.add(model);
                } catch (e) {
                    console.warn(`Failed to load building_${building.type}`, e);
                }
            }

            // Props
            for (const prop of PROPS) {
                try {
                    const model = await loadModel(prop.type);
                    model.position.set(prop.x * TILE_SIZE, 0, prop.z * TILE_SIZE);
                    model.scale.set(0.8, 0.8, 0.8);
                    scene.add(model);

                    // Add point light for streetlights at night
                    if (prop.type === "streetlight" && timeOfDay === "night") {
                        const light = new THREE.PointLight(0xffdd88, 1, 8);
                        light.position.set(prop.x * TILE_SIZE, 3, prop.z * TILE_SIZE);
                        scene.add(light);
                    }
                } catch (e) {
                    console.warn(`Failed to load ${prop.type}`, e);
                }
            }

            // Cars
            for (const car of CARS) {
                try {
                    const model = await loadModel(car.type);
                    model.position.set(car.x * TILE_SIZE, 0, car.z * TILE_SIZE);
                    model.rotation.y = car.rotation;
                    model.scale.set(0.8, 0.8, 0.8);
                    scene.add(model);
                } catch (e) {
                    console.warn(`Failed to load ${car.type}`, e);
                }
            }

            setModelsLoaded(true);
        };

        // Create player mesh
        const createPlayerMesh = (color: string, isLocal: boolean = false) => {
            const group = new THREE.Group();

            // Body
            const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.6, 8, 16);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(color) });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.8;
            body.castShadow = true;
            group.add(body);

            // Head
            const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.5;
            head.castShadow = true;
            group.add(head);

            if (isLocal) {
                // Indicator ring for local player
                const ringGeometry = new THREE.RingGeometry(0.4, 0.5, 32);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                    side: THREE.DoubleSide,
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = -Math.PI / 2;
                ring.position.y = 0.01;
                group.add(ring);
            }

            return group;
        };

        // Create local player
        const playerColor = getAvatarColor(member.avatarSeed || 0);
        const playerMesh = createPlayerMesh(playerColor, true);
        playerMesh.position.set(playerPosRef.current.x * TILE_SIZE, 0, playerPosRef.current.z * TILE_SIZE);
        scene.add(playerMesh);
        playerMeshRef.current = playerMesh;

        createCity();

        // Animation loop
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);

            // Process movement
            const speed = PLAYER_SPEED;
            let moved = false;

            if (keysRef.current.has("ArrowUp") || keysRef.current.has("w")) {
                playerPosRef.current.z -= speed;
                moved = true;
            }
            if (keysRef.current.has("ArrowDown") || keysRef.current.has("s")) {
                playerPosRef.current.z += speed;
                moved = true;
            }
            if (keysRef.current.has("ArrowLeft") || keysRef.current.has("a")) {
                playerPosRef.current.x -= speed;
                moved = true;
            }
            if (keysRef.current.has("ArrowRight") || keysRef.current.has("d")) {
                playerPosRef.current.x += speed;
                moved = true;
            }

            // Clamp position
            playerPosRef.current.x = Math.max(0, Math.min(MAP_SIZE - 1, playerPosRef.current.x));
            playerPosRef.current.z = Math.max(0, Math.min(MAP_SIZE - 1, playerPosRef.current.z));

            // Update player mesh
            if (playerMeshRef.current) {
                playerMeshRef.current.position.x = playerPosRef.current.x * TILE_SIZE;
                playerMeshRef.current.position.z = playerPosRef.current.z * TILE_SIZE;
            }

            // Send position if moved
            if (moved) {
                sendPosition(
                    Math.round(playerPosRef.current.x * 100),
                    Math.round(playerPosRef.current.z * 100),
                    "walking",
                    "도시"
                );
            }

            // Update other players
            onlinePlayers.forEach((player, id) => {
                let mesh = otherPlayerMeshes.current.get(id);
                if (!mesh) {
                    mesh = createPlayerMesh(getAvatarColor(player.avatarSeed));
                    scene.add(mesh);
                    otherPlayerMeshes.current.set(id, mesh);
                }
                // Interpolate position
                const targetX = (player.x / 100) * TILE_SIZE;
                const targetZ = (player.y / 100) * TILE_SIZE;
                mesh.position.x += (targetX - mesh.position.x) * 0.1;
                mesh.position.z += (targetZ - mesh.position.z) * 0.1;
            });

            // Remove disconnected players
            otherPlayerMeshes.current.forEach((mesh, id) => {
                if (!onlinePlayers.has(id)) {
                    scene.remove(mesh);
                    otherPlayerMeshes.current.delete(id);
                }
            });

            controls.update();
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

        // Resize handler
        const handleResize = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationIdRef.current);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [member, timeOfDay, onlinePlayers, sendPosition]);

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
        toast.success("캐릭터가 변경되었습니다!");
    };

    // Loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">로딩 중...</p>
                </div>
            </div>
        );
    }

    // Auth required
    if (!member) {
        return (
            <div className="min-h-screen bg-[#0a0a1a]">
                <Navigation />
                <div className="pt-32 flex items-center justify-center">
                    <div className="text-center p-8 bg-black/50 backdrop-blur-xl rounded-3xl border border-white/10">
                        <h1 className="text-3xl font-bold text-white mb-4">🏙️ 3D Virtual City</h1>
                        <p className="text-gray-400 mb-8">Three.js + KayKit City Builder</p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/login">
                                <Button className="bg-white/10 hover:bg-white/20 text-white px-8 py-6 text-lg rounded-2xl">
                                    <LogIn className="w-5 h-5 mr-2" />
                                    로그인
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-6 text-lg rounded-2xl">
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
        <div className={`${isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"} bg-[#0a0a1a] text-white`}>
            {!isFullscreen && <Navigation />}

            <div className={`${isFullscreen ? "h-screen" : "pt-20 h-[calc(100vh-80px)]"} flex`}>
                {/* 3D Canvas */}
                <div className="flex-1 relative" ref={containerRef}>
                    {!modelsLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-white">3D 모델 로딩 중...</p>
                            </div>
                        </div>
                    )}

                    {/* HUD */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                        {/* Left HUD */}
                        <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-4 pointer-events-auto border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                                <span className="text-sm font-bold">🏙️ 3D City</span>
                            </div>
                            <div className="text-xs text-gray-400">
                                {timeOfDay === "day" ? "☀️ 낮" : timeOfDay === "evening" ? "🌅 저녁" : "🌙 밤"}
                            </div>
                        </div>

                        {/* Right HUD - Controls */}
                        <div className="flex gap-2 pointer-events-auto">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="w-10 h-10 bg-black/70 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={handleRandomizeAvatar}
                                className="w-10 h-10 bg-black/70 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
                                title="캐릭터 변경"
                            >
                                <Shuffle className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => {
                                    if (controlsRef.current) controlsRef.current.reset();
                                }}
                                className="w-10 h-10 bg-black/70 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
                                title="카메라 리셋"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="w-10 h-10 bg-black/70 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
                            >
                                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </button>
                            {isFullscreen && (
                                <Link href="/">
                                    <button className="w-10 h-10 bg-red-500/80 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Bottom HUD */}
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>WASD/화살표로 이동 | 마우스 드래그로 카메라 회전</span>
                            <span className="text-purple-400">|</span>
                            <span className="flex items-center gap-2">
                                {isConnected ? (
                                    <><Wifi className="w-4 h-4 text-green-400" /> 연결됨</>
                                ) : (
                                    <><WifiOff className="w-4 h-4 text-red-400" /> 연결 안됨</>
                                )}
                            </span>
                            <span className="text-purple-400">|</span>
                            <button
                                onClick={() => setShowPlayerList(!showPlayerList)}
                                className="flex items-center gap-1 hover:text-white transition-colors"
                            >
                                <Users className="w-4 h-4" />
                                {onlinePlayers.size + 1}명 접속
                            </button>
                        </div>
                    </div>

                    {/* Emote Picker */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 mr-2">이모트:</span>
                            {["👋", "😊", "👍", "❤️", "🎉", "🔥", "😂", "🙏"].map((emote) => (
                                <button
                                    key={emote}
                                    onClick={() => sendEmote(emote)}
                                    className="w-10 h-10 text-xl hover:bg-white/20 rounded-lg transition-all hover:scale-125 flex items-center justify-center"
                                >
                                    {emote}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Player List */}
                    {showPlayerList && (
                        <div className="absolute bottom-20 left-4 bg-black/80 backdrop-blur-xl rounded-2xl p-4 border border-white/10 min-w-[200px]">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-400" />
                                    접속자 목록
                                </h3>
                                <button
                                    onClick={() => setShowPlayerList(false)}
                                    className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-purple-500/20">
                                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-sm font-medium text-purple-300">{member?.name} (나)</span>
                                </div>
                                {Array.from(onlinePlayers.values()).map((player) => (
                                    <div key={player.id} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10">
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                        <span className="text-sm">{player.name}</span>
                                    </div>
                                ))}
                                {onlinePlayers.size === 0 && (
                                    <p className="text-xs text-gray-500 text-center py-2">다른 접속자가 없습니다</p>
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
                                <MessageCircle className="w-5 h-5 text-purple-400" />
                                <span className="font-bold">채팅</span>
                            </div>
                            <button
                                onClick={() => setShowChat(false)}
                                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {realtimeChatMessages.length === 0 && (
                                <p className="text-center text-gray-500 text-sm">메시지가 없습니다</p>
                            )}
                            {realtimeChatMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-3 rounded-xl ${msg.playerId === `user_${member.id}`
                                        ? "bg-purple-500/20 ml-4"
                                        : "bg-white/10 mr-4"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-purple-400">{msg.playerName}</span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(msg.timestamp).toLocaleTimeString("ko-KR", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm">{msg.message}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-white/10">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                                className="flex gap-2"
                            >
                                <Input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="메시지 입력..."
                                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl"
                                />
                                <Button
                                    type="submit"
                                    className="bg-purple-500 hover:bg-purple-600 rounded-xl px-4"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Chat Toggle */}
                {!showChat && (
                    <button
                        onClick={() => setShowChat(true)}
                        className="absolute bottom-4 right-4 w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-110 transition-transform"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
}
