import { useState, useEffect, useRef } from "react";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import {
    Server,
    Database,
    Globe,
    Zap,
    Code2,
    Layers,
    Activity,
    Cpu,
    Cloud,
    GitBranch,
    Terminal,
    Braces,
    Palette,
    Shield,
    Rocket,
    Sparkles,
    Play,
    ChevronRight
} from "lucide-react";

interface TechItem {
    name: string;
    icon: React.ElementType;
    category: 'frontend' | 'backend' | 'database' | 'infra';
    gradient: string;
    glow: string;
}

const techStack: TechItem[] = [
    // Frontend
    { name: "React", icon: Code2, category: 'frontend', gradient: "from-cyan-400 to-blue-500", glow: "cyan" },
    { name: "TypeScript", icon: Braces, category: 'frontend', gradient: "from-blue-500 to-indigo-600", glow: "blue" },
    { name: "Vite", icon: Zap, category: 'frontend', gradient: "from-yellow-400 to-purple-500", glow: "purple" },
    { name: "TailwindCSS", icon: Palette, category: 'frontend', gradient: "from-teal-400 to-cyan-500", glow: "teal" },
    { name: "Three.js", icon: Globe, category: 'frontend', gradient: "from-purple-500 to-pink-500", glow: "purple" },

    // Backend
    { name: "NestJS", icon: Server, category: 'backend', gradient: "from-red-500 to-pink-600", glow: "red" },
    { name: "Socket.IO", icon: Activity, category: 'backend', gradient: "from-gray-500 to-gray-700", glow: "gray" },
    { name: "Prisma", icon: Database, category: 'backend', gradient: "from-indigo-500 to-purple-600", glow: "indigo" },
    { name: "JWT", icon: Shield, category: 'backend', gradient: "from-green-500 to-emerald-600", glow: "green" },

    // Database
    { name: "PostgreSQL", icon: Database, category: 'database', gradient: "from-blue-600 to-blue-800", glow: "blue" },
    { name: "Supabase", icon: Cloud, category: 'database', gradient: "from-emerald-500 to-green-600", glow: "emerald" },

    // Infrastructure
    { name: "Vercel", icon: Rocket, category: 'infra', gradient: "from-gray-700 to-black", glow: "gray" },
    { name: "Render", icon: Server, category: 'infra', gradient: "from-purple-600 to-indigo-700", glow: "purple" },
    { name: "GitHub", icon: GitBranch, category: 'infra', gradient: "from-gray-600 to-gray-900", glow: "gray" },
    { name: "Expo", icon: Cpu, category: 'infra', gradient: "from-violet-500 to-purple-600", glow: "violet" },
];

// Floating orb animation component
function FloatingOrb({ delay = 0, size = "w-32 h-32", color = "purple" }: { delay?: number; size?: string; color?: string }) {
    const colors: Record<string, string> = {
        purple: "from-purple-600/30 to-pink-600/30",
        cyan: "from-cyan-500/30 to-blue-600/30",
        orange: "from-orange-500/30 to-red-500/30",
    };

    return (
        <div
            className={`absolute ${size} bg-gradient-to-r ${colors[color]} rounded-full blur-3xl animate-float pointer-events-none`}
            style={{ animationDelay: `${delay}s`, animationDuration: '8s' }}
        />
    );
}

export function LiveTechStack() {
    const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [latency, setLatency] = useState<number | null>(null);
    const [hoveredTech, setHoveredTech] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Check API status
    useEffect(() => {
        const checkApi = async () => {
            const start = Date.now();
            try {
                const res = await fetch('https://jahyeon-portfolio.onrender.com/api/blog/categories');
                if (res.ok) {
                    setApiStatus('online');
                    setLatency(Date.now() - start);
                } else {
                    setApiStatus('offline');
                }
            } catch {
                setApiStatus('offline');
            }
        };

        checkApi();
        const interval = setInterval(checkApi, 30000);
        return () => clearInterval(interval);
    }, []);

    // Mouse tracking for parallax
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePosition({
                    x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
                    y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section ref={containerRef} className="py-32 md:py-48 px-4 md:px-8 relative overflow-hidden">
            {/* 🌌 PREMIUM ANIMATED BACKGROUND */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.15)_0%,_transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(6,182,212,0.15)_0%,_transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(236,72,153,0.08)_0%,_transparent_40%)]" />

                {/* Floating Orbs */}
                <FloatingOrb delay={0} size="w-96 h-96" color="purple" />
                <FloatingOrb delay={2} size="w-80 h-80" color="cyan" />
                <FloatingOrb delay={4} size="w-64 h-64" color="orange" />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
                        backgroundSize: '50px 50px',
                    }}
                />

                {/* Animated particles */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* 🎯 SECTION HEADER - Ultra Premium */}
                <AnimatedSection>
                    <div className="text-center mb-20 md:mb-32">
                        {/* Live Status Badge */}
                        <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 mb-10 shadow-2xl">
                            <div className="relative">
                                <div className={`w-3 h-3 rounded-full ${apiStatus === 'online' ? 'bg-emerald-400' :
                                        apiStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400'
                                    }`} />
                                <div className={`absolute inset-0 w-3 h-3 rounded-full ${apiStatus === 'online' ? 'bg-emerald-400' : 'bg-yellow-400'
                                    } animate-ping`} />
                            </div>
                            <span className="text-sm font-medium text-white/80">
                                {apiStatus === 'online' ? 'All Systems Operational' :
                                    apiStatus === 'offline' ? 'Service Unavailable' : 'Checking...'}
                            </span>
                            {latency && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                                    {latency}ms
                                </span>
                            )}
                        </div>

                        {/* Main Title with Parallax */}
                        <div
                            className="relative"
                            style={{ transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)` }}
                        >
                            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6">
                                <span className="relative inline-block">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient-x">
                                        Powered
                                    </span>
                                    {/* Glowing underline */}
                                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-sm" />
                                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full" />
                                </span>
                                <br />
                                <span className="text-white/90">By</span>
                            </h2>
                        </div>

                        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                            이 포트폴리오를 구동하는{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-medium">
                                최신 기술 스택
                            </span>
                        </p>
                    </div>
                </AnimatedSection>

                {/* 🔥 LIVE STATUS CARDS */}
                <AnimatedSection delay={100}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                        {/* API Card */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-100 blur transition-all duration-500" />
                            <div className="relative p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full" />

                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <Server className="w-7 h-7 text-white" />
                                    </div>
                                    <div className={`px-4 py-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                        } text-sm font-bold flex items-center gap-2`}>
                                        <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-400' : 'bg-red-400'
                                            } animate-pulse`} />
                                        {apiStatus === 'online' ? 'LIVE' : 'DOWN'}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">API Server</h3>
                                <p className="text-gray-400 text-sm">NestJS + WebSocket</p>
                            </div>
                        </div>

                        {/* Database Card */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-100 blur transition-all duration-500" />
                            <div className="relative p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />

                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                        <Database className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold flex items-center gap-2">
                                        <Activity className="w-4 h-4 animate-pulse" />
                                        SYNCED
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">Database</h3>
                                <p className="text-gray-400 text-sm">PostgreSQL + Supabase</p>
                            </div>
                        </div>

                        {/* Mobile App Card */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 blur transition-all duration-500" />
                            <div className="relative p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />

                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                        <Cpu className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 text-sm font-bold flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        NATIVE
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">Mobile App</h3>
                                <p className="text-gray-400 text-sm">React Native + Expo</p>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* 🎨 TECH STACK SHOWCASE - Bento Grid Style */}
                <AnimatedSection delay={200}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {techStack.map((tech, idx) => {
                            const Icon = tech.icon;
                            const isHovered = hoveredTech === tech.name;

                            return (
                                <div
                                    key={tech.name}
                                    className="group relative cursor-pointer"
                                    onMouseEnter={() => setHoveredTech(tech.name)}
                                    onMouseLeave={() => setHoveredTech(null)}
                                    style={{
                                        animationDelay: `${idx * 30}ms`,
                                        transform: isHovered ? 'scale(1.05) translateY(-8px)' : 'scale(1)',
                                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }}
                                >
                                    {/* Glow Effect */}
                                    <div className={`absolute -inset-1 bg-gradient-to-r ${tech.gradient} rounded-2xl opacity-0 group-hover:opacity-70 blur-lg transition-all duration-500`} />

                                    {/* Card */}
                                    <div className="relative p-6 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 group-hover:border-white/30 transition-all duration-500 overflow-hidden h-full">
                                        {/* Background gradient on hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${tech.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                        {/* Icon Container */}
                                        <div
                                            className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${tech.gradient} flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                                            style={{ boxShadow: isHovered ? `0 0 30px var(--${tech.glow}-glow, rgba(139,92,246,0.5))` : 'none' }}
                                        >
                                            <Icon className="w-7 h-7 text-white" />

                                            {/* Sparkle effect */}
                                            {isHovered && (
                                                <div className="absolute -inset-1">
                                                    <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full animate-ping" />
                                                    <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Text */}
                                        <h4 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300">
                                            {tech.name}
                                        </h4>

                                        {/* Category Badge */}
                                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                {tech.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </AnimatedSection>

                {/* 💫 ANIMATED STATS */}
                <AnimatedSection delay={300}>
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { value: "15+", label: "Technologies", gradient: "from-cyan-500 to-blue-500" },
                            { value: "25+", label: "API Endpoints", gradient: "from-purple-500 to-pink-500" },
                            { value: "50+", label: "Components", gradient: "from-orange-500 to-red-500" },
                            { value: "100%", label: "Type Safe", gradient: "from-emerald-500 to-teal-500" },
                        ].map((stat, idx) => (
                            <div key={idx} className="group relative text-center p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden">
                                {/* Gradient overlay on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                <div className={`text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r ${stat.gradient} mb-3`}>
                                    {stat.value}
                                </div>
                                <p className="text-gray-400 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </AnimatedSection>
            </div>

            {/* Custom Animations */}
            <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
        </section>
    );
}
