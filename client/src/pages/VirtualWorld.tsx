import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Users,
    MessageCircle,
    Send,
    Settings,
    HelpCircle,
    X,
    Maximize2,
    Minimize2,
    Volume2,
    VolumeX,
    LogIn,
    Shuffle,
    Wifi,
    WifiOff
} from "lucide-react";
import * as PIXI from "pixi.js";
import { useRealtimeWorld } from "@/hooks/useRealtimeWorld";

// ============================================
// 🎨 AVATAR GENERATION SYSTEM
// ============================================

const AVATAR_CONFIG = {
    bodyColors: ["#FFD93D", "#FFA07A", "#DEB887", "#D2B48C", "#F5DEB3", "#FFDAB9"],
    hairStyles: ["short", "long", "wavy", "spiky", "bald", "ponytail"],
    hairColors: ["#4A4A4A", "#8B4513", "#FFD700", "#FF6B6B", "#4169E1", "#2E8B57"],
    outfits: ["hoodie", "tshirt", "suit", "dress", "uniform"],
    outfitColors: ["#6C5CE7", "#00B894", "#E17055", "#0984E3", "#D63031", "#FDCB6E"],
};

function generateAvatar(seed: number) {
    const rng = (n: number) => {
        seed = (seed * 9301 + 49297) % 233280;
        return Math.floor((seed / 233280) * n);
    };

    return {
        bodyColor: AVATAR_CONFIG.bodyColors[rng(AVATAR_CONFIG.bodyColors.length)],
        hairStyle: AVATAR_CONFIG.hairStyles[rng(AVATAR_CONFIG.hairStyles.length)],
        hairColor: AVATAR_CONFIG.hairColors[rng(AVATAR_CONFIG.hairColors.length)],
        outfit: AVATAR_CONFIG.outfits[rng(AVATAR_CONFIG.outfits.length)],
        outfitColor: AVATAR_CONFIG.outfitColors[rng(AVATAR_CONFIG.outfitColors.length)],
    };
}

// ============================================
// 🎮 GAME CONSTANTS
// ============================================

const MAP_WIDTH = 1600;
const MAP_HEIGHT = 1200;
const PLAYER_SPEED = 4;
const TILE_SIZE = 40;

// ============================================
// 🏫 MAP DATA - Coding Academy
// ============================================

const MAP_ZONES = [
    { name: "로비", x: 700, y: 900, width: 200, height: 150, color: 0x6C5CE7 },
    { name: "코딩 교실", x: 200, y: 300, width: 300, height: 250, color: 0x00B894 },
    { name: "휴게실", x: 1100, y: 300, width: 300, height: 250, color: 0xE17055 },
    { name: "자료실", x: 650, y: 200, width: 300, height: 200, color: 0x0984E3 },
];

const DECORATIONS = [
    { type: "tree", x: 100, y: 100 },
    { type: "tree", x: 1450, y: 100 },
    { type: "tree", x: 100, y: 1050 },
    { type: "tree", x: 1450, y: 1050 },
    { type: "fountain", x: 750, y: 600 },
];

// ============================================
// 🎯 MAIN COMPONENT
// ============================================

export default function VirtualWorld() {
    const [, setLocation] = useLocation();
    const canvasRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const playerRef = useRef<PIXI.Container | null>(null);
    const gameContainerRef = useRef<PIXI.Container | null>(null);
    const otherPlayersRef = useRef<Map<string, PIXI.Container>>(new Map());

    // State
    const [member, setMember] = useState<{ id: number; name: string; avatarSeed?: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [chatInput, setChatInput] = useState("");
    const [playerPosition, setPlayerPosition] = useState({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
    const [currentZone, setCurrentZone] = useState("로비");
    const [direction, setDirection] = useState<string>("idle");

    // Keys pressed
    const keysRef = useRef<Set<string>>(new Set());

    // Check login
    useEffect(() => {
        const stored = localStorage.getItem("member");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Add avatar seed if not exists
                if (!parsed.avatarSeed) {
                    parsed.avatarSeed = Math.floor(Math.random() * 1000000);
                    localStorage.setItem("member", JSON.stringify(parsed));
                }
                setMember(parsed);
            } catch { }
        }
        setIsLoading(false);
    }, []);

    // Realtime multiplayer hook
    const {
        players: onlinePlayers,
        chatMessages: realtimeChatMessages,
        isConnected,
        sendPosition,
        sendChat,
        disconnect
    } = useRealtimeWorld({
        playerId: member ? `user_${member.id}` : '',
        playerName: member?.name || '',
        avatarSeed: member?.avatarSeed || 0,
        initialX: MAP_WIDTH / 2,
        initialY: MAP_HEIGHT / 2,
    });

    // Render other players
    useEffect(() => {
        if (!gameContainerRef.current || !member) return;

        const gameContainer = gameContainerRef.current;

        // Remove players who left
        otherPlayersRef.current.forEach((sprite, id) => {
            if (!onlinePlayers.has(id)) {
                gameContainer.removeChild(sprite);
                otherPlayersRef.current.delete(id);
            }
        });

        // Add/update players
        onlinePlayers.forEach((player, id) => {
            let sprite = otherPlayersRef.current.get(id);

            if (!sprite) {
                // Create new player sprite
                const avatar = generateAvatar(player.avatarSeed);
                sprite = new PIXI.Container();

                const body = new PIXI.Graphics();
                body.circle(0, 0, 20);
                body.fill(avatar.bodyColor);
                sprite.addChild(body);

                const outfit = new PIXI.Graphics();
                outfit.roundRect(-15, 5, 30, 25, 5);
                outfit.fill(avatar.outfitColor);
                sprite.addChild(outfit);

                const face = new PIXI.Graphics();
                face.circle(-7, -5, 3);
                face.fill(0x333333);
                face.circle(7, -5, 3);
                face.fill(0x333333);
                face.arc(0, 2, 8, 0.2, Math.PI - 0.2);
                face.stroke({ width: 2, color: 0x333333 });
                sprite.addChild(face);

                const nameTag = new PIXI.Text({
                    text: player.name,
                    style: { fontSize: 12, fontWeight: "bold", fill: 0xffffff }
                });
                nameTag.anchor.set(0.5);
                nameTag.position.set(0, -35);
                sprite.addChild(nameTag);

                gameContainer.addChild(sprite);
                otherPlayersRef.current.set(id, sprite);
            }

            // Update position with interpolation
            sprite.position.x += (player.x - sprite.position.x) * 0.3;
            sprite.position.y += (player.y - sprite.position.y) * 0.3;
        });
    }, [onlinePlayers, member]);

    // Initialize PixiJS
    useEffect(() => {
        if (!member || !canvasRef.current || appRef.current) return;

        const initPixi = async () => {
            const app = new PIXI.Application();
            await app.init({
                width: canvasRef.current!.clientWidth,
                height: canvasRef.current!.clientHeight,
                backgroundColor: 0x1a1a2e,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
            });

            canvasRef.current!.appendChild(app.canvas);
            appRef.current = app;

            // Create game container
            const gameContainer = new PIXI.Container();
            app.stage.addChild(gameContainer);

            // Draw map background
            const mapBg = new PIXI.Graphics();
            mapBg.rect(0, 0, MAP_WIDTH, MAP_HEIGHT);
            mapBg.fill(0x16213e);
            gameContainer.addChild(mapBg);

            // Draw grid
            const grid = new PIXI.Graphics();
            grid.setStrokeStyle({ width: 1, color: 0x1f3460, alpha: 0.3 });
            for (let x = 0; x <= MAP_WIDTH; x += TILE_SIZE) {
                grid.moveTo(x, 0);
                grid.lineTo(x, MAP_HEIGHT);
            }
            for (let y = 0; y <= MAP_HEIGHT; y += TILE_SIZE) {
                grid.moveTo(0, y);
                grid.lineTo(MAP_WIDTH, y);
            }
            grid.stroke();
            gameContainer.addChild(grid);

            // Draw zones
            MAP_ZONES.forEach(zone => {
                const zoneGraphics = new PIXI.Graphics();
                zoneGraphics.roundRect(zone.x, zone.y, zone.width, zone.height, 20);
                zoneGraphics.fill({ color: zone.color, alpha: 0.3 });
                zoneGraphics.stroke({ width: 3, color: zone.color, alpha: 0.8 });
                gameContainer.addChild(zoneGraphics);

                // Zone label
                const label = new PIXI.Text({
                    text: zone.name,
                    style: {
                        fontSize: 18,
                        fontWeight: "bold",
                        fill: 0xffffff,
                    }
                });
                label.anchor.set(0.5);
                label.position.set(zone.x + zone.width / 2, zone.y + 25);
                gameContainer.addChild(label);
            });

            // Draw decorations
            DECORATIONS.forEach(dec => {
                const decGraphics = new PIXI.Graphics();
                if (dec.type === "tree") {
                    // Tree trunk
                    decGraphics.rect(dec.x - 5, dec.y + 20, 10, 30);
                    decGraphics.fill(0x8B4513);
                    // Tree top
                    decGraphics.circle(dec.x, dec.y, 25);
                    decGraphics.fill(0x2E8B57);
                } else if (dec.type === "fountain") {
                    // Fountain base
                    decGraphics.circle(dec.x, dec.y, 50);
                    decGraphics.fill(0x4169E1);
                    decGraphics.circle(dec.x, dec.y, 30);
                    decGraphics.fill(0x6495ED);
                }
                gameContainer.addChild(decGraphics);
            });

            // Create player
            const avatar = generateAvatar(member.avatarSeed || 12345);
            const player = new PIXI.Container();

            // Player body
            const body = new PIXI.Graphics();
            body.circle(0, 0, 20);
            body.fill(avatar.bodyColor);
            player.addChild(body);

            // Player outfit
            const outfit = new PIXI.Graphics();
            outfit.roundRect(-15, 5, 30, 25, 5);
            outfit.fill(avatar.outfitColor);
            player.addChild(outfit);

            // Player face
            const face = new PIXI.Graphics();
            face.circle(-7, -5, 3);
            face.fill(0x333333);
            face.circle(7, -5, 3);
            face.fill(0x333333);
            // Smile
            face.arc(0, 2, 8, 0.2, Math.PI - 0.2);
            face.stroke({ width: 2, color: 0x333333 });
            player.addChild(face);

            // Player name
            const nameTag = new PIXI.Text({
                text: member.name,
                style: {
                    fontSize: 14,
                    fontWeight: "bold",
                    fill: 0xffffff,
                }
            });
            nameTag.anchor.set(0.5);
            nameTag.position.set(0, -35);
            player.addChild(nameTag);

            player.position.set(MAP_WIDTH / 2, MAP_HEIGHT / 2);
            gameContainer.addChild(player);
            playerRef.current = player;
            gameContainerRef.current = gameContainer;

            // Center camera on player
            const centerCamera = () => {
                const screenWidth = app.screen.width;
                const screenHeight = app.screen.height;
                gameContainer.position.set(
                    screenWidth / 2 - player.position.x,
                    screenHeight / 2 - player.position.y
                );
            };
            centerCamera();

            // Game loop
            app.ticker.add(() => {
                const keys = keysRef.current;
                let moved = false;
                let dir = "idle";
                let newX = player.position.x;
                let newY = player.position.y;

                if (keys.has("ArrowUp") || keys.has("KeyW")) {
                    newY -= PLAYER_SPEED;
                    moved = true;
                    dir = "up";
                }
                if (keys.has("ArrowDown") || keys.has("KeyS")) {
                    newY += PLAYER_SPEED;
                    moved = true;
                    dir = "down";
                }
                if (keys.has("ArrowLeft") || keys.has("KeyA")) {
                    newX -= PLAYER_SPEED;
                    moved = true;
                    dir = "left";
                }
                if (keys.has("ArrowRight") || keys.has("KeyD")) {
                    newX += PLAYER_SPEED;
                    moved = true;
                    dir = "right";
                }

                // Boundary check
                newX = Math.max(30, Math.min(MAP_WIDTH - 30, newX));
                newY = Math.max(30, Math.min(MAP_HEIGHT - 30, newY));

                if (moved) {
                    player.position.set(newX, newY);
                    setPlayerPosition({ x: newX, y: newY });
                    centerCamera();

                    // Check zone
                    const zone = MAP_ZONES.find(z =>
                        newX >= z.x && newX <= z.x + z.width &&
                        newY >= z.y && newY <= z.y + z.height
                    );
                    if (zone && zone.name !== currentZone) {
                        setCurrentZone(zone.name);
                    }

                    // Send position to other players
                    sendPosition(newX, newY, dir, zone?.name || currentZone);
                }
            });

            // Resize handler
            const handleResize = () => {
                if (canvasRef.current && app) {
                    app.renderer.resize(
                        canvasRef.current.clientWidth,
                        canvasRef.current.clientHeight
                    );
                    centerCamera();
                }
            };
            window.addEventListener("resize", handleResize);

            return () => {
                window.removeEventListener("resize", handleResize);
            };
        };

        initPixi();

        return () => {
            if (appRef.current) {
                appRef.current.destroy(true);
                appRef.current = null;
            }
        };
    }, [member]);

    // Keyboard handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === "INPUT") return;
            keysRef.current.add(e.code);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysRef.current.delete(e.code);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

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
        // Reload to apply
        window.location.reload();
    };

    // Loading state
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

    // Not logged in
    if (!member) {
        return (
            <div className="min-h-screen bg-[#0a0a1a] text-white">
                <Navigation />
                <div className="pt-32 px-4 flex items-center justify-center min-h-screen">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center">
                            <Users className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-4">Virtual World</h1>
                        <p className="text-gray-400 mb-8">
                            로그인 후 가상 공간에서 다른 학생들과 만나보세요!
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/login">
                                <Button className="bg-white/10 hover:bg-white/20 text-white px-8 py-6 text-lg rounded-2xl">
                                    <LogIn className="w-5 h-5 mr-2" />
                                    로그인
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-6 text-lg rounded-2xl">
                                    회원가입
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main game UI
    return (
        <div className={`${isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"} bg-[#0a0a1a] text-white`}>
            {!isFullscreen && <Navigation />}

            {/* Game Container */}
            <div className={`${isFullscreen ? "h-screen" : "pt-20 h-[calc(100vh-80px)]"} flex`}>
                {/* Main Game Area */}
                <div className="flex-1 relative">
                    {/* Canvas */}
                    <div ref={canvasRef} className="absolute inset-0" />

                    {/* HUD */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                        {/* Left HUD - Mini Map */}
                        <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 pointer-events-auto">
                            <div className="text-xs text-gray-400 mb-2">미니맵</div>
                            <div className="w-40 h-30 bg-[#16213e] rounded-lg relative overflow-hidden">
                                {/* Zones on minimap */}
                                {MAP_ZONES.map(zone => (
                                    <div
                                        key={zone.name}
                                        className="absolute rounded"
                                        style={{
                                            left: `${(zone.x / MAP_WIDTH) * 100}%`,
                                            top: `${(zone.y / MAP_HEIGHT) * 100}%`,
                                            width: `${(zone.width / MAP_WIDTH) * 100}%`,
                                            height: `${(zone.height / MAP_HEIGHT) * 100}%`,
                                            backgroundColor: `#${zone.color.toString(16)}`,
                                            opacity: 0.5,
                                        }}
                                    />
                                ))}
                                {/* Player dot */}
                                <div
                                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                    style={{
                                        left: `${(playerPosition.x / MAP_WIDTH) * 100}%`,
                                        top: `${(playerPosition.y / MAP_HEIGHT) * 100}%`,
                                        transform: "translate(-50%, -50%)",
                                    }}
                                />
                            </div>
                            <div className="text-xs text-purple-400 mt-2">📍 {currentZone}</div>
                        </div>

                        {/* Right HUD - Controls */}
                        <div className="flex gap-2 pointer-events-auto">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="w-10 h-10 bg-black/60 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={handleRandomizeAvatar}
                                className="w-10 h-10 bg-black/60 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <Shuffle className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="w-10 h-10 bg-black/60 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
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

                    {/* Bottom HUD - Instructions */}
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>⬆️⬇️⬅️➡️ 또는 WASD로 이동</span>
                            <span className="text-purple-400">|</span>
                            <span className="flex items-center gap-1">
                                {isConnected ? <Wifi className="w-3 h-3 text-green-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
                                👥 {onlinePlayers.size + 1}명 접속 중
                            </span>
                        </div>
                    </div>
                </div>

                {/* Chat Panel */}
                {showChat && (
                    <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col">
                        {/* Chat Header */}
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

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {realtimeChatMessages.map((msg, i) => (
                                <div key={i} className={`${msg.playerName === "시스템" ? "text-center" : ""}`}>
                                    {msg.playerName === "시스템" ? (
                                        <div className="text-xs text-purple-400 bg-purple-500/10 rounded-lg px-3 py-2">
                                            {msg.message}
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-white">{msg.playerName}</span>
                                                <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="bg-white/10 rounded-xl px-3 py-2 text-sm">
                                                {msg.message}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Chat Input */}
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

                {/* Chat Toggle (when hidden) */}
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
