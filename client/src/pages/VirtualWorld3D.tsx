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
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ============================================
// 🎮 GAME CONSTANTS
// ============================================

const MAP_SIZE = 10;
const TILE_SIZE = 2;
const PLAYER_SPEED = 0.08;

// Building positions
const BUILDINGS = [
    { x: 0, z: 0, type: "A" },
    { x: 1, z: 0, type: "B" },
    { x: 8, z: 0, type: "C" },
    { x: 9, z: 0, type: "D" },
    { x: 0, z: 9, type: "E" },
    { x: 1, z: 9, type: "F" },
    { x: 8, z: 9, type: "G" },
    { x: 9, z: 9, type: "H" },
];

// Props
const PROPS = [
    { x: 4, z: 4, type: "bench" },
    { x: 5, z: 4, type: "bush" },
    { x: 2, z: 2, type: "streetlight" },
    { x: 7, z: 7, type: "streetlight" },
];

// Avatar colors
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
    const otherPlayerMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
    const animationIdRef = useRef<number>(0);
    const isInitializedRef = useRef(false);
    const loaderRef = useRef<GLTFLoader | null>(null);

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

    // Player position
    const playerPosRef = useRef({ x: 5, z: 5 });
    const keysRef = useRef<Set<string>>(new Set());

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

    // Realtime multiplayer (only initialize if member exists)
    const realtimeOptions = member ? {
        playerId: `user_${member.id}`,
        playerName: member.name,
        avatarSeed: member.avatarSeed || 0,
        initialX: 5,
        initialY: 5,
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
        initialX: 5,
        initialY: 5,
    };

    const {
        players: onlinePlayers,
        chatMessages: realtimeChatMessages,
        isConnected,
        sendPosition,
        sendChat,
        sendEmote,
    } = useRealtimeWorld(realtimeOptions);

    // Create player mesh helper
    const createPlayerMesh = (color: string, isLocal: boolean = false): THREE.Group => {
        const group = new THREE.Group();

        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.6, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(color) });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        body.castShadow = true;
        group.add(body);

        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        head.castShadow = true;
        group.add(head);

        if (isLocal) {
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

    // Initialize Three.js scene - ONLY RUN ONCE
    useEffect(() => {
        if (!member || !containerRef.current || isInitializedRef.current) return;
        isInitializedRef.current = true;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);
        scene.fog = new THREE.Fog(0x87ceeb, 20, 50);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(20, 15, 20);
        camera.lookAt(MAP_SIZE, 0, MAP_SIZE);
        cameraRef.current = camera;

        // Renderer - with explicit context loss handling
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
        });
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
        controls.minDistance = 8;
        controls.maxDistance = 40;
        controls.target.set(MAP_SIZE / 2 * TILE_SIZE, 0, MAP_SIZE / 2 * TILE_SIZE);
        controlsRef.current = controls;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(15, 25, 15);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 60;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = -30;
        scene.add(directionalLight);

        // Ground
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a7d44,
            roughness: 0.8,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(MAP_SIZE, -0.01, MAP_SIZE);
        ground.receiveShadow = true;
        scene.add(ground);

        // Road grid
        for (let i = 0; i < MAP_SIZE; i++) {
            for (let j = 0; j < MAP_SIZE; j++) {
                // Create road tiles in center area
                if (i >= 2 && i <= 7 && j >= 2 && j <= 7) {
                    const roadGeometry = new THREE.PlaneGeometry(TILE_SIZE * 0.95, TILE_SIZE * 0.95);
                    const roadMaterial = new THREE.MeshStandardMaterial({
                        color: 0x555555,
                        roughness: 0.9,
                    });
                    const road = new THREE.Mesh(roadGeometry, roadMaterial);
                    road.rotation.x = -Math.PI / 2;
                    road.position.set(i * TILE_SIZE, 0.01, j * TILE_SIZE);
                    road.receiveShadow = true;
                    scene.add(road);
                }
            }
        }

        // Load models
        const loader = new GLTFLoader();
        loaderRef.current = loader;

        let loadedCount = 0;
        const totalModels = BUILDINGS.length + PROPS.length;

        const loadModel = async (name: string, x: number, z: number, scale: number = 1) => {
            try {
                const gltf = await new Promise<any>((resolve, reject) => {
                    loader.load(
                        `/models/${name}.gltf`,
                        resolve,
                        undefined,
                        reject
                    );
                });
                const model = gltf.scene;
                model.position.set(x * TILE_SIZE, 0, z * TILE_SIZE);
                model.scale.set(scale, scale, scale);
                model.traverse((child: any) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                scene.add(model);
                loadedCount++;
                setLoadingProgress(Math.floor((loadedCount / totalModels) * 100));
            } catch (error) {
                console.warn(`Failed to load model: ${name}`, error);
                loadedCount++;
                setLoadingProgress(Math.floor((loadedCount / totalModels) * 100));
            }
        };

        // Load all models
        const loadAllModels = async () => {
            // Buildings
            for (const b of BUILDINGS) {
                await loadModel(`building_${b.type}`, b.x, b.z, 1);
            }
            // Props
            for (const p of PROPS) {
                await loadModel(p.type, p.x, p.z, 1);
            }
            setModelsLoaded(true);
        };

        loadAllModels();

        // Create local player
        const playerColor = getAvatarColor(member.avatarSeed || 0);
        const playerMesh = createPlayerMesh(playerColor, true);
        playerMesh.position.set(playerPosRef.current.x * TILE_SIZE, 0, playerPosRef.current.z * TILE_SIZE);
        scene.add(playerMesh);
        playerMeshRef.current = playerMesh;

        // Animation loop
        let lastPositionSent = { x: 0, z: 0 };

        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);

            // Movement
            const speed = PLAYER_SPEED;
            if (keysRef.current.has("arrowup") || keysRef.current.has("w")) {
                playerPosRef.current.z -= speed;
            }
            if (keysRef.current.has("arrowdown") || keysRef.current.has("s")) {
                playerPosRef.current.z += speed;
            }
            if (keysRef.current.has("arrowleft") || keysRef.current.has("a")) {
                playerPosRef.current.x -= speed;
            }
            if (keysRef.current.has("arrowright") || keysRef.current.has("d")) {
                playerPosRef.current.x += speed;
            }

            // Clamp
            playerPosRef.current.x = Math.max(0, Math.min(MAP_SIZE - 1, playerPosRef.current.x));
            playerPosRef.current.z = Math.max(0, Math.min(MAP_SIZE - 1, playerPosRef.current.z));

            // Update player mesh
            if (playerMeshRef.current) {
                playerMeshRef.current.position.x = playerPosRef.current.x * TILE_SIZE;
                playerMeshRef.current.position.z = playerPosRef.current.z * TILE_SIZE;
            }

            // Send position (throttled)
            const dx = Math.abs(playerPosRef.current.x - lastPositionSent.x);
            const dz = Math.abs(playerPosRef.current.z - lastPositionSent.z);
            if (dx > 0.1 || dz > 0.1) {
                sendPosition(
                    Math.round(playerPosRef.current.x * 100),
                    Math.round(playerPosRef.current.z * 100),
                    "walking",
                    "도시"
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
                    const targetX = (player.x / 100) * TILE_SIZE;
                    const targetZ = (player.y / 100) * TILE_SIZE;
                    mesh.position.x += (targetX - mesh.position.x) * 0.1;
                    mesh.position.z += (targetZ - mesh.position.z) * 0.1;
                });

                // Remove disconnected
                otherPlayerMeshesRef.current.forEach((mesh, id) => {
                    if (!onlinePlayers.has(id)) {
                        sceneRef.current!.remove(mesh);
                        otherPlayerMeshesRef.current.delete(id);
                    }
                });
            }

            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Keyboard
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

            // Dispose Three.js resources
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current.forceContextLoss();
                if (container.contains(rendererRef.current.domElement)) {
                    container.removeChild(rendererRef.current.domElement);
                }
            }

            // Clear scene
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

            // Reset refs
            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
            controlsRef.current = null;
            playerMeshRef.current = null;
            otherPlayerMeshesRef.current.clear();
            isInitializedRef.current = false;
        };
    }, [member]); // Only depend on member

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
                                <p className="text-white mb-2">3D 모델 로딩 중... {loadingProgress}%</p>
                                <div className="w-48 h-2 bg-gray-700 rounded-full mx-auto">
                                    <div
                                        className="h-full bg-purple-500 rounded-full transition-all"
                                        style={{ width: `${loadingProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HUD */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                        <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-4 pointer-events-auto border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                                <span className="text-sm font-bold">🏙️ 3D City</span>
                            </div>
                            <div className="text-xs text-gray-400">KayKit Assets</div>
                        </div>

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
                            >
                                <Shuffle className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => controlsRef.current?.reset()}
                                className="w-10 h-10 bg-black/70 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="w-10 h-10 bg-black/70 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
                            >
                                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Bottom HUD */}
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>WASD 이동 | 마우스 드래그 회전</span>
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
                                className="flex items-center gap-1 hover:text-white"
                            >
                                <Users className="w-4 h-4" />
                                {onlinePlayers.size + 1}명
                            </button>
                        </div>
                    </div>

                    {/* Emotes */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10">
                        <div className="flex items-center gap-1">
                            {["👋", "😊", "👍", "❤️", "🎉", "🔥"].map((emote) => (
                                <button
                                    key={emote}
                                    onClick={() => sendEmote(emote)}
                                    className="w-9 h-9 text-lg hover:bg-white/20 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                    {emote}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Player List */}
                    {showPlayerList && (
                        <div className="absolute bottom-20 left-4 bg-black/80 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-400" />
                                    접속자
                                </h3>
                                <button onClick={() => setShowPlayerList(false)}>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-purple-500/20">
                                    <div className="w-2 h-2 rounded-full bg-green-400" />
                                    <span className="text-sm text-purple-300">{member.name} (나)</span>
                                </div>
                                {Array.from(onlinePlayers.values()).map((player) => (
                                    <div key={player.id} className="flex items-center gap-2 px-2 py-1">
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                        <span className="text-sm">{player.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Panel */}
                {showChat && (
                    <div className="w-72 bg-black/50 backdrop-blur-xl border-l border-white/10 flex flex-col">
                        <div className="p-3 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-purple-400" />
                                <span className="font-bold text-sm">채팅</span>
                            </div>
                            <button onClick={() => setShowChat(false)}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {realtimeChatMessages.length === 0 && (
                                <p className="text-center text-gray-500 text-xs">메시지가 없습니다</p>
                            )}
                            {realtimeChatMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-2 rounded-lg ${msg.playerId === `user_${member.id}`
                                        ? "bg-purple-500/20 ml-4"
                                        : "bg-white/10 mr-4"
                                        }`}
                                >
                                    <div className="text-xs text-purple-400 mb-1">{msg.playerName}</div>
                                    <p className="text-sm">{msg.message}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 border-t border-white/10">
                            <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="flex gap-2">
                                <Input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="메시지..."
                                    className="flex-1 bg-white/10 border-white/20 text-white text-sm rounded-lg h-9"
                                />
                                <Button type="submit" size="sm" className="bg-purple-500 hover:bg-purple-600 h-9 px-3">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                )}

                {!showChat && (
                    <button
                        onClick={() => setShowChat(true)}
                        className="absolute bottom-4 right-4 w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                        <MessageCircle className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
