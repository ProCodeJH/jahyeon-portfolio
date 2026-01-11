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
    Sparkles
} from "lucide-react";
import { useRealtimeWorld } from "@/hooks/useRealtimeWorld";

// ============================================
// 🎨 ENTERPRISE AVATAR SYSTEM (Phase 4)
// ============================================

const AVATAR_CONFIG = {
    bodyColors: ["#FFD93D", "#FFA07A", "#DEB887", "#D2B48C", "#F5DEB3", "#FFDAB9", "#E6B89C", "#C9967A"],
    hairStyles: ["short", "long", "wavy", "spiky", "bald", "ponytail", "afro", "mohawk"],
    hairColors: ["#4A4A4A", "#8B4513", "#FFD700", "#FF6B6B", "#4169E1", "#2E8B57", "#9B59B6", "#E91E63"],
    outfits: ["hoodie", "tshirt", "suit", "dress", "uniform", "jacket", "sweater", "casual"],
    outfitColors: ["#6C5CE7", "#00B894", "#E17055", "#0984E3", "#D63031", "#FDCB6E", "#A29BFE", "#55EFC4"],
    accessories: ["none", "glasses", "hat", "headphones", "mask", "scarf", "bow", "earrings"],
    expressions: ["happy", "neutral", "excited", "cool", "sleepy", "wink"],
};

interface Avatar {
    bodyColor: string;
    hairStyle: string;
    hairColor: string;
    outfit: string;
    outfitColor: string;
    accessory: string;
    expression: string;
}

function generateAvatar(seed: number): Avatar {
    let s = seed;
    const rng = (n: number) => {
        s = (s * 9301 + 49297) % 233280;
        return Math.floor((s / 233280) * n);
    };

    return {
        bodyColor: AVATAR_CONFIG.bodyColors[rng(AVATAR_CONFIG.bodyColors.length)],
        hairStyle: AVATAR_CONFIG.hairStyles[rng(AVATAR_CONFIG.hairStyles.length)],
        hairColor: AVATAR_CONFIG.hairColors[rng(AVATAR_CONFIG.hairColors.length)],
        outfit: AVATAR_CONFIG.outfits[rng(AVATAR_CONFIG.outfits.length)],
        outfitColor: AVATAR_CONFIG.outfitColors[rng(AVATAR_CONFIG.outfitColors.length)],
        accessory: AVATAR_CONFIG.accessories[rng(AVATAR_CONFIG.accessories.length)],
        expression: AVATAR_CONFIG.expressions[rng(AVATAR_CONFIG.expressions.length)],
    };
}

// Total combinations: 8×8×8×8×8×8×6 = 12,582,912

// ============================================
// 🎮 GAME CONSTANTS
// ============================================

const MAP_WIDTH = 2000;
const MAP_HEIGHT = 1500;
const PLAYER_SIZE = 40;
const PLAYER_SPEED = 5;
const TILE_SIZE = 50;

// ============================================
// 🏫 ENHANCED MAP DATA (Phase 6)
// ============================================

interface Zone {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    bgPattern?: string;
    icon: string;
}

const MAP_ZONES: Zone[] = [
    { name: "로비", x: 850, y: 1100, width: 300, height: 200, color: "#6C5CE7", icon: "🏠" },
    { name: "코딩 교실", x: 200, y: 300, width: 400, height: 300, color: "#00B894", icon: "💻" },
    { name: "휴게실", x: 1400, y: 300, width: 400, height: 300, color: "#E17055", icon: "☕" },
    { name: "자료실", x: 800, y: 150, width: 400, height: 250, color: "#0984E3", icon: "📚" },
    { name: "놀이터", x: 200, y: 800, width: 350, height: 300, color: "#FDCB6E", icon: "🎮" },
    { name: "정원", x: 1450, y: 800, width: 350, height: 300, color: "#2ECC71", icon: "🌳" },
];

interface Decoration {
    type: "tree" | "fountain" | "bench" | "lamp" | "flower" | "rock";
    x: number;
    y: number;
    scale?: number;
}

const DECORATIONS: Decoration[] = [
    // Trees
    { type: "tree", x: 100, y: 100 },
    { type: "tree", x: 1850, y: 100 },
    { type: "tree", x: 100, y: 1350 },
    { type: "tree", x: 1850, y: 1350 },
    { type: "tree", x: 650, y: 500 },
    { type: "tree", x: 1350, y: 500 },
    // Fountain (center)
    { type: "fountain", x: 1000, y: 700, scale: 1.5 },
    // Benches
    { type: "bench", x: 600, y: 700 },
    { type: "bench", x: 1400, y: 700 },
    { type: "bench", x: 1000, y: 450 },
    // Lamps
    { type: "lamp", x: 400, y: 600 },
    { type: "lamp", x: 1600, y: 600 },
    { type: "lamp", x: 1000, y: 950 },
    // Flowers
    { type: "flower", x: 1500, y: 900 },
    { type: "flower", x: 1550, y: 950 },
    { type: "flower", x: 1600, y: 880 },
    // Rocks
    { type: "rock", x: 300, y: 950 },
    { type: "rock", x: 350, y: 1000 },
];

// ============================================
// 🎨 CANVAS RENDERER (Phase 7 - Lighting)
// ============================================

interface Player {
    id: string;
    name: string;
    x: number;
    y: number;
    avatar: Avatar;
    direction: string;
    chatBubble?: { message: string; timestamp: number };
}

function drawCharacter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    avatar: Avatar,
    name: string,
    isCurrentPlayer: boolean = false,
    direction: string = "down",
    chatBubble?: { message: string; timestamp: number }
) {
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 18, 18, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fillStyle = avatar.bodyColor;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Outfit
    ctx.beginPath();
    ctx.roundRect(-15, 8, 30, 18, 5);
    ctx.fillStyle = avatar.outfitColor;
    ctx.fill();

    // Hair based on style
    ctx.beginPath();
    ctx.fillStyle = avatar.hairColor;
    if (avatar.hairStyle === "short") {
        ctx.arc(0, -8, 14, Math.PI, 0);
        ctx.fill();
    } else if (avatar.hairStyle === "long") {
        ctx.arc(0, -8, 14, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-14, -8, 28, 20);
    } else if (avatar.hairStyle === "spiky") {
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 4, -10);
            ctx.lineTo(i * 4 - 3, -25);
            ctx.lineTo(i * 4 + 3, -25);
            ctx.closePath();
            ctx.fill();
        }
    } else if (avatar.hairStyle === "ponytail") {
        ctx.arc(0, -8, 14, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, -25, 6, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (avatar.hairStyle === "afro") {
        ctx.arc(0, -10, 22, 0, Math.PI * 2);
        ctx.fill();
    } else if (avatar.hairStyle === "mohawk") {
        ctx.fillRect(-4, -30, 8, 25);
    } else if (avatar.hairStyle === "wavy") {
        ctx.arc(0, -8, 16, Math.PI, 0);
        ctx.fill();
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.arc(i * 6, 0, 4, 0, Math.PI);
            ctx.fill();
        }
    }

    // Eyes based on expression
    ctx.fillStyle = "#333";
    if (avatar.expression === "happy" || avatar.expression === "excited") {
        ctx.beginPath();
        ctx.arc(-6, -2, 3, 0, Math.PI, true);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(6, -2, 3, 0, Math.PI, true);
        ctx.stroke();
    } else if (avatar.expression === "wink") {
        ctx.beginPath();
        ctx.arc(-6, -2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(3, -2);
        ctx.lineTo(9, -2);
        ctx.stroke();
    } else if (avatar.expression === "sleepy") {
        ctx.beginPath();
        ctx.moveTo(-9, -2);
        ctx.lineTo(-3, -2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(3, -2);
        ctx.lineTo(9, -2);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(-6, -2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(6, -2, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Mouth
    if (avatar.expression === "happy" || avatar.expression === "excited") {
        ctx.beginPath();
        ctx.arc(0, 3, 5, 0.2, Math.PI - 0.2);
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else if (avatar.expression === "cool") {
        ctx.beginPath();
        ctx.moveTo(-4, 5);
        ctx.lineTo(4, 5);
        ctx.stroke();
    }

    // Accessory
    if (avatar.accessory === "glasses") {
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(-11, -5, 8, 6);
        ctx.rect(3, -5, 8, 6);
        ctx.moveTo(-3, -2);
        ctx.lineTo(3, -2);
        ctx.stroke();
    } else if (avatar.accessory === "hat") {
        ctx.fillStyle = "#333";
        ctx.fillRect(-15, -20, 30, 5);
        ctx.fillRect(-10, -30, 20, 12);
    } else if (avatar.accessory === "headphones") {
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -5, 20, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = "#333";
        ctx.fillRect(-22, -10, 6, 15);
        ctx.fillRect(16, -10, 6, 15);
    }

    // Name tag with glow for current player
    ctx.font = "bold 12px 'Pretendard', sans-serif";
    ctx.textAlign = "center";
    if (isCurrentPlayer) {
        ctx.shadowColor = "#6C5CE7";
        ctx.shadowBlur = 10;
    }
    ctx.fillStyle = isCurrentPlayer ? "#FFD700" : "#FFFFFF";
    ctx.fillText(name, 0, -35);
    ctx.shadowBlur = 0;

    // Current player indicator
    if (isCurrentPlayer) {
        ctx.beginPath();
        ctx.moveTo(0, -45);
        ctx.lineTo(-5, -50);
        ctx.lineTo(5, -50);
        ctx.closePath();
        ctx.fillStyle = "#FFD700";
        ctx.fill();
    }

    // Chat bubble (Phase 3)
    if (chatBubble && Date.now() - chatBubble.timestamp < 5000) {
        const bubbleWidth = Math.min(ctx.measureText(chatBubble.message).width + 20, 200);
        const bubbleHeight = 30;
        const bubbleX = -bubbleWidth / 2;
        const bubbleY = -80;

        // Bubble background
        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10);
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fill();
        ctx.strokeStyle = "#6C5CE7";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Bubble tail
        ctx.beginPath();
        ctx.moveTo(-5, bubbleY + bubbleHeight);
        ctx.lineTo(0, bubbleY + bubbleHeight + 8);
        ctx.lineTo(5, bubbleY + bubbleHeight);
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fill();

        // Message text
        ctx.font = "12px 'Pretendard', sans-serif";
        ctx.fillStyle = "#333";
        ctx.fillText(chatBubble.message.slice(0, 30), 0, bubbleY + 20);
    }

    ctx.restore();
}

function drawDecoration(ctx: CanvasRenderingContext2D, dec: Decoration) {
    ctx.save();
    ctx.translate(dec.x, dec.y);
    const scale = dec.scale || 1;
    ctx.scale(scale, scale);

    if (dec.type === "tree") {
        // Tree trunk
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(-8, 10, 16, 30);
        // Tree leaves (layered)
        ctx.beginPath();
        ctx.arc(0, -10, 30, 0, Math.PI * 2);
        ctx.fillStyle = "#228B22";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-10, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(10, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.beginPath();
        ctx.arc(-5, -15, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#32CD32";
        ctx.fill();
    } else if (dec.type === "fountain") {
        // Base
        ctx.beginPath();
        ctx.ellipse(0, 20, 60, 25, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#6495ED";
        ctx.fill();
        ctx.strokeStyle = "#4169E1";
        ctx.lineWidth = 4;
        ctx.stroke();
        // Inner
        ctx.beginPath();
        ctx.ellipse(0, 15, 40, 18, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#87CEEB";
        ctx.fill();
        // Center pillar
        ctx.fillStyle = "#A9A9A9";
        ctx.fillRect(-10, -30, 20, 45);
        // Water spout
        ctx.beginPath();
        ctx.arc(0, -30, 12, 0, Math.PI * 2);
        ctx.fillStyle = "#87CEEB";
        ctx.fill();
        // Water drops animation
        const time = Date.now() / 100;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 0.1;
            const dropX = Math.cos(angle) * 25;
            const dropY = Math.sin(angle) * 10 - 10 + Math.sin(time + i) * 5;
            ctx.beginPath();
            ctx.arc(dropX, dropY, 3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(135, 206, 235, 0.7)";
            ctx.fill();
        }
    } else if (dec.type === "bench") {
        ctx.fillStyle = "#8B4513";
        // Legs
        ctx.fillRect(-25, 5, 5, 15);
        ctx.fillRect(20, 5, 5, 15);
        // Seat
        ctx.fillStyle = "#A0522D";
        ctx.fillRect(-30, 0, 60, 8);
        // Back
        ctx.fillRect(-30, -15, 60, 5);
    } else if (dec.type === "lamp") {
        // Pole
        ctx.fillStyle = "#333";
        ctx.fillRect(-3, -40, 6, 60);
        // Light
        ctx.beginPath();
        ctx.arc(0, -45, 12, 0, Math.PI * 2);
        ctx.fillStyle = "#FFD700";
        ctx.fill();
        // Glow
        ctx.beginPath();
        ctx.arc(0, -45, 20, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(0, -45, 0, 0, -45, 20);
        gradient.addColorStop(0, "rgba(255, 215, 0, 0.5)");
        gradient.addColorStop(1, "rgba(255, 215, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fill();
    } else if (dec.type === "flower") {
        // Stem
        ctx.strokeStyle = "#228B22";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 20);
        ctx.stroke();
        // Petals
        const colors = ["#FF69B4", "#FF6347", "#FFD700", "#9370DB", "#00CED1"];
        const color = colors[Math.floor(dec.x * dec.y) % colors.length];
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const angle = (i / 5) * Math.PI * 2;
            ctx.ellipse(Math.cos(angle) * 8, Math.sin(angle) * 8 - 5, 6, 10, angle, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
        // Center
        ctx.beginPath();
        ctx.arc(0, -5, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#FFD700";
        ctx.fill();
    } else if (dec.type === "rock") {
        ctx.beginPath();
        ctx.moveTo(-15, 10);
        ctx.lineTo(-20, 0);
        ctx.lineTo(-10, -10);
        ctx.lineTo(10, -8);
        ctx.lineTo(20, 5);
        ctx.lineTo(10, 12);
        ctx.closePath();
        ctx.fillStyle = "#696969";
        ctx.fill();
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.restore();
}

// ============================================
// 🎯 MAIN COMPONENT
// ============================================

export default function VirtualWorld() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);

    // State
    const [member, setMember] = useState<{ id: number; name: string; avatarSeed?: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [chatInput, setChatInput] = useState("");
    const [currentZone, setCurrentZone] = useState("로비");
    const [gameReady, setGameReady] = useState(false);

    // Game state
    const playerRef = useRef({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
    const keysRef = useRef<Set<string>>(new Set());
    const directionRef = useRef("down");
    const chatBubbleRef = useRef<{ message: string; timestamp: number } | undefined>();
    const cameraRef = useRef({ x: 0, y: 0 });

    // Time of day (Phase 7)
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
    } = useRealtimeWorld({
        playerId: member ? `user_${member.id}` : "",
        playerName: member?.name || "",
        avatarSeed: member?.avatarSeed || 0,
        initialX: MAP_WIDTH / 2,
        initialY: MAP_HEIGHT / 2,
    });

    // Time of day cycle (Phase 7)
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 17) setTimeOfDay("day");
        else if (hour >= 17 && hour < 20) setTimeOfDay("evening");
        else setTimeOfDay("night");

        const interval = setInterval(() => {
            const h = new Date().getHours();
            if (h >= 6 && h < 17) setTimeOfDay("day");
            else if (h >= 17 && h < 20) setTimeOfDay("evening");
            else setTimeOfDay("night");
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    // Main game loop
    useEffect(() => {
        if (!member || !canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const updateSize = () => {
            if (containerRef.current && canvas) {
                canvas.width = containerRef.current.clientWidth;
                canvas.height = containerRef.current.clientHeight;
            }
        };
        updateSize();
        window.addEventListener("resize", updateSize);

        const avatar = generateAvatar(member.avatarSeed || 12345);
        setGameReady(true);

        // Game loop
        const gameLoop = () => {
            if (!ctx || !canvas) return;

            // Clear
            ctx.fillStyle = timeOfDay === "night" ? "#0a0a1a" : timeOfDay === "evening" ? "#1a1520" : "#16213e";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Handle input
            let dx = 0, dy = 0;
            if (keysRef.current.has("ArrowUp") || keysRef.current.has("KeyW")) { dy = -PLAYER_SPEED; directionRef.current = "up"; }
            if (keysRef.current.has("ArrowDown") || keysRef.current.has("KeyS")) { dy = PLAYER_SPEED; directionRef.current = "down"; }
            if (keysRef.current.has("ArrowLeft") || keysRef.current.has("KeyA")) { dx = -PLAYER_SPEED; directionRef.current = "left"; }
            if (keysRef.current.has("ArrowRight") || keysRef.current.has("KeyD")) { dx = PLAYER_SPEED; directionRef.current = "right"; }

            // Update position
            playerRef.current.x = Math.max(30, Math.min(MAP_WIDTH - 30, playerRef.current.x + dx));
            playerRef.current.y = Math.max(30, Math.min(MAP_HEIGHT - 30, playerRef.current.y + dy));

            if (dx !== 0 || dy !== 0) {
                sendPosition(playerRef.current.x, playerRef.current.y, directionRef.current, currentZone);
            }

            // Check zone
            const zone = MAP_ZONES.find(z =>
                playerRef.current.x >= z.x && playerRef.current.x <= z.x + z.width &&
                playerRef.current.y >= z.y && playerRef.current.y <= z.y + z.height
            );
            if (zone && zone.name !== currentZone) {
                setCurrentZone(zone.name);
                toast.info(`${zone.icon} ${zone.name}에 입장했습니다!`);
            }

            // Camera follow (smooth)
            const targetCamX = canvas.width / 2 - playerRef.current.x;
            const targetCamY = canvas.height / 2 - playerRef.current.y;
            cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.1;
            cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.1;

            ctx.save();
            ctx.translate(cameraRef.current.x, cameraRef.current.y);

            // Draw map background
            ctx.fillStyle = timeOfDay === "night" ? "#0d1b2a" : timeOfDay === "evening" ? "#1d2d44" : "#1f3460";
            ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

            // Draw grid
            ctx.strokeStyle = timeOfDay === "night" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)";
            ctx.lineWidth = 1;
            for (let x = 0; x <= MAP_WIDTH; x += TILE_SIZE) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, MAP_HEIGHT);
                ctx.stroke();
            }
            for (let y = 0; y <= MAP_HEIGHT; y += TILE_SIZE) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(MAP_WIDTH, y);
                ctx.stroke();
            }

            // Draw zones
            MAP_ZONES.forEach(zone => {
                // Zone background
                ctx.beginPath();
                ctx.roundRect(zone.x, zone.y, zone.width, zone.height, 20);
                ctx.fillStyle = zone.color + "40";
                ctx.fill();
                ctx.strokeStyle = zone.color;
                ctx.lineWidth = 3;
                ctx.stroke();

                // Zone label
                ctx.font = "bold 20px 'Pretendard', sans-serif";
                ctx.fillStyle = "#fff";
                ctx.textAlign = "center";
                ctx.fillText(`${zone.icon} ${zone.name}`, zone.x + zone.width / 2, zone.y + 35);
            });

            // Draw decorations (behind players)
            DECORATIONS.forEach(dec => drawDecoration(ctx, dec));

            // Draw other players (with interpolation - Phase 10)
            onlinePlayers.forEach((player) => {
                const otherAvatar = generateAvatar(player.avatarSeed);
                drawCharacter(ctx, player.x, player.y, otherAvatar, player.name, false, player.direction);
            });

            // Draw current player
            drawCharacter(
                ctx,
                playerRef.current.x,
                playerRef.current.y,
                avatar,
                member.name,
                true,
                directionRef.current,
                chatBubbleRef.current
            );

            // Lighting overlay (Phase 7)
            if (timeOfDay === "night") {
                // Dark overlay with light spots
                ctx.fillStyle = "rgba(0, 0, 30, 0.4)";
                ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

                // Light around player
                const gradient = ctx.createRadialGradient(
                    playerRef.current.x, playerRef.current.y, 0,
                    playerRef.current.x, playerRef.current.y, 200
                );
                gradient.addColorStop(0, "rgba(255, 220, 150, 0.3)");
                gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
                ctx.fillStyle = gradient;
                ctx.fillRect(playerRef.current.x - 200, playerRef.current.y - 200, 400, 400);

                // Lamp lights
                DECORATIONS.filter(d => d.type === "lamp").forEach(lamp => {
                    const g = ctx.createRadialGradient(lamp.x, lamp.y - 45, 0, lamp.x, lamp.y - 45, 100);
                    g.addColorStop(0, "rgba(255, 215, 0, 0.4)");
                    g.addColorStop(1, "rgba(0, 0, 0, 0)");
                    ctx.fillStyle = g;
                    ctx.fillRect(lamp.x - 100, lamp.y - 145, 200, 200);
                });
            } else if (timeOfDay === "evening") {
                ctx.fillStyle = "rgba(255, 100, 50, 0.1)";
                ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
            }

            ctx.restore();

            animationRef.current = requestAnimationFrame(gameLoop);
        };

        animationRef.current = requestAnimationFrame(gameLoop);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("resize", updateSize);
        };
    }, [member, timeOfDay, currentZone, onlinePlayers, sendPosition]);

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
        chatBubbleRef.current = { message: chatInput, timestamp: Date.now() };
        setChatInput("");
        setTimeout(() => { chatBubbleRef.current = undefined; }, 5000);
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
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center animate-pulse">
                            <Users className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Virtual World
                        </h1>
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
                                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-purple-500/30">
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

    // Main game UI
    return (
        <div className={`${isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"} bg-[#0a0a1a] text-white`}>
            {!isFullscreen && <Navigation />}

            <div className={`${isFullscreen ? "h-screen" : "pt-20 h-[calc(100vh-80px)]"} flex`}>
                {/* Main Game Area */}
                <div className="flex-1 relative" ref={containerRef}>
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                    {/* HUD */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                        {/* Left HUD - Mini Map */}
                        <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-4 pointer-events-auto border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                                <span className="text-xs text-gray-400">미니맵</span>
                            </div>
                            <div className="w-48 h-36 bg-[#16213e] rounded-lg relative overflow-hidden border border-white/10">
                                {MAP_ZONES.map(zone => (
                                    <div
                                        key={zone.name}
                                        className="absolute rounded opacity-50"
                                        style={{
                                            left: `${(zone.x / MAP_WIDTH) * 100}%`,
                                            top: `${(zone.y / MAP_HEIGHT) * 100}%`,
                                            width: `${(zone.width / MAP_WIDTH) * 100}%`,
                                            height: `${(zone.height / MAP_HEIGHT) * 100}%`,
                                            backgroundColor: zone.color,
                                        }}
                                    />
                                ))}
                                {/* Other players on minimap */}
                                {Array.from(onlinePlayers.values()).map((p) => (
                                    <div
                                        key={p.id}
                                        className="absolute w-2 h-2 bg-blue-400 rounded-full"
                                        style={{
                                            left: `${(p.x / MAP_WIDTH) * 100}%`,
                                            top: `${(p.y / MAP_HEIGHT) * 100}%`,
                                            transform: "translate(-50%, -50%)",
                                        }}
                                    />
                                ))}
                                {/* Player dot */}
                                <div
                                    className="absolute w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse"
                                    style={{
                                        left: `${(playerRef.current.x / MAP_WIDTH) * 100}%`,
                                        top: `${(playerRef.current.y / MAP_HEIGHT) * 100}%`,
                                        transform: "translate(-50%, -50%)",
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg">{MAP_ZONES.find(z => z.name === currentZone)?.icon || "📍"}</span>
                                <span className="text-sm text-purple-400 font-medium">{currentZone}</span>
                            </div>
                        </div>

                        {/* Right HUD - Controls */}
                        <div className="flex gap-2 pointer-events-auto">
                            <div className="bg-black/70 backdrop-blur-xl rounded-xl px-3 py-2 flex items-center gap-2 border border-white/10">
                                <span className="text-xs">{timeOfDay === "day" ? "☀️" : timeOfDay === "evening" ? "🌅" : "🌙"}</span>
                            </div>
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

                    {/* Bottom HUD - Instructions */}
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>⬆️⬇️⬅️➡️ 또는 WASD로 이동</span>
                            <span className="text-purple-400">|</span>
                            <span className="flex items-center gap-2">
                                {isConnected ? (
                                    <><Wifi className="w-4 h-4 text-green-400" /> 연결됨</>
                                ) : (
                                    <><WifiOff className="w-4 h-4 text-red-400" /> 연결 안됨</>
                                )}
                            </span>
                            <span className="text-purple-400">|</span>
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {onlinePlayers.size + 1}명 접속
                            </span>
                        </div>
                    </div>
                </div>

                {/* Chat Panel (Phase 3) */}
                {showChat && (
                    <div className="w-80 bg-black/50 backdrop-blur-xl border-l border-white/10 flex flex-col">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-purple-400" />
                                <span className="font-bold">채팅</span>
                                <span className="text-xs text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">
                                    {realtimeChatMessages.length}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowChat(false)}
                                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {/* Welcome message */}
                            <div className="text-center">
                                <div className="text-xs text-purple-400 bg-purple-500/10 rounded-lg px-3 py-2 inline-block">
                                    <Sparkles className="w-3 h-3 inline mr-1" />
                                    가상 공간에 오신 것을 환영합니다! 🎉
                                </div>
                            </div>
                            {realtimeChatMessages.map((msg, i) => (
                                <div key={i} className={msg.playerName === member.name ? "text-right" : ""}>
                                    <div className={`inline-block max-w-[80%] ${msg.playerName === member.name ? "bg-purple-500/30" : "bg-white/10"} rounded-xl px-3 py-2`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold">{msg.playerName}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(msg.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                        <p className="text-sm">{msg.message}</p>
                                    </div>
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
