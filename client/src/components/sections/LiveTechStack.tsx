import { useState, useEffect } from "react";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { TiltCard } from "@/components/effects/TiltCard";
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
    Smartphone,
    LineChart,
    Lock,
    RefreshCw,
    Layout,
    Box,
    Monitor,
    Wifi,
    HardDrive
} from "lucide-react";

interface TechCategory {
    name: string;
    icon: React.ElementType;
    color: string;
    glow: string;
    items: {
        name: string;
        description: string;
    }[];
}

const techCategories: TechCategory[] = [
    {
        name: "Frontend",
        icon: Layout,
        color: "from-cyan-500 to-blue-600",
        glow: "cyan",
        items: [
            { name: "React 18", description: "UI 라이브러리" },
            { name: "TypeScript", description: "타입 안전성" },
            { name: "Vite", description: "빌드 도구" },
            { name: "TailwindCSS", description: "스타일링" },
            { name: "Framer Motion", description: "애니메이션" },
            { name: "Three.js", description: "3D 그래픽스" },
            { name: "GSAP", description: "고급 애니메이션" },
            { name: "Zustand", description: "상태 관리" },
        ]
    },
    {
        name: "Backend",
        icon: Server,
        color: "from-purple-500 to-pink-600",
        glow: "purple",
        items: [
            { name: "NestJS", description: "API 프레임워크" },
            { name: "Prisma", description: "ORM" },
            { name: "Socket.IO", description: "실시간 통신" },
            { name: "JWT", description: "인증" },
            { name: "bcrypt", description: "암호화" },
            { name: "REST API", description: "API 설계" },
        ]
    },
    {
        name: "Database",
        icon: Database,
        color: "from-emerald-500 to-teal-600",
        glow: "emerald",
        items: [
            { name: "PostgreSQL", description: "메인 DB" },
            { name: "Supabase", description: "BaaS" },
            { name: "Redis", description: "캐싱" },
            { name: "Drizzle", description: "쿼리 빌더" },
        ]
    },
    {
        name: "DevOps",
        icon: Cloud,
        color: "from-orange-500 to-red-600",
        glow: "orange",
        items: [
            { name: "Vercel", description: "프론트 호스팅" },
            { name: "Render", description: "백엔드 호스팅" },
            { name: "GitHub Actions", description: "CI/CD" },
            { name: "Docker", description: "컨테이너" },
        ]
    },
    {
        name: "Mobile",
        icon: Smartphone,
        color: "from-violet-500 to-purple-600",
        glow: "violet",
        items: [
            { name: "React Native", description: "크로스 플랫폼" },
            { name: "Expo", description: "개발 도구" },
            { name: "EAS Build", description: "앱 빌드" },
        ]
    },
    {
        name: "Tools",
        icon: Terminal,
        color: "from-gray-500 to-gray-700",
        glow: "gray",
        items: [
            { name: "ESLint", description: "린터" },
            { name: "Prettier", description: "포매터" },
            { name: "Git", description: "버전 관리" },
            { name: "VS Code", description: "에디터" },
        ]
    },
];

// All technologies flattened for the marquee
const allTechs = techCategories.flatMap(cat => cat.items.map(item => item.name));

export function LiveTechStack() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [hoveredTech, setHoveredTech] = useState<string | null>(null);

    return (
        <section className="py-32 md:py-48 px-4 md:px-8 relative overflow-hidden">
            {/* Background - matches website vibe */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-600/5 rounded-full blur-[200px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <AnimatedSection>
                    <div className="text-center mb-20 md:mb-28">
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-xl mb-8">
                            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                            <span className="text-sm font-bold text-purple-400 tracking-wider uppercase">Tech Stack</span>
                        </div>

                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-gradient-x">
                                Built With
                            </span>
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
                            이 포트폴리오를 구동하는 <span className="text-purple-400 font-semibold">30개 이상</span>의 최신 기술 스택
                        </p>

                        <div className="w-32 md:w-48 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full mx-auto mt-8" style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }} />
                    </div>
                </AnimatedSection>

                {/* Tech Categories Grid */}
                <AnimatedSection delay={100}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20">
                        {techCategories.map((category, idx) => {
                            const Icon = category.icon;
                            const isActive = activeCategory === category.name;

                            return (
                                <TiltCard key={category.name} sensitivity={5}>
                                    <div
                                        className={`group relative p-8 rounded-3xl bg-[#12121a]/80 backdrop-blur-xl border-2 transition-all duration-500 cursor-pointer overflow-hidden h-full ${isActive ? 'border-purple-500/50' : 'border-white/10 hover:border-purple-500/30'
                                            }`}
                                        onClick={() => setActiveCategory(isActive ? null : category.name)}
                                        style={{
                                            animationDelay: `${idx * 100}ms`
                                        }}
                                    >
                                        {/* Background Glow */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                        {/* Header */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                                                style={{ boxShadow: `0 0 30px var(--tw-shadow-color, rgba(168, 85, 247, 0.3))` }}
                                            >
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                                    {category.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">{category.items.length} technologies</p>
                                            </div>
                                        </div>

                                        {/* Tech Items */}
                                        <div className="flex flex-wrap gap-2">
                                            {category.items.map((item) => (
                                                <div
                                                    key={item.name}
                                                    className={`relative px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium transition-all duration-300 ${hoveredTech === item.name
                                                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 scale-105'
                                                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                        }`}
                                                    onMouseEnter={() => setHoveredTech(item.name)}
                                                    onMouseLeave={() => setHoveredTech(null)}
                                                >
                                                    {item.name}

                                                    {/* Tooltip */}
                                                    {hoveredTech === item.name && (
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/90 text-white text-xs whitespace-nowrap border border-white/10 z-50">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Glow effect */}
                                        <div className={`absolute -inset-1 bg-gradient-to-r ${category.color} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`} />
                                    </div>
                                </TiltCard>
                            );
                        })}
                    </div>
                </AnimatedSection>

                {/* Infinite Marquee */}
                <AnimatedSection delay={200}>
                    <div className="relative overflow-hidden py-8">
                        {/* Fade edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a1a] to-transparent z-10" />
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a1a] to-transparent z-10" />

                        {/* Scrolling Track */}
                        <div className="flex gap-6 animate-scroll-left">
                            {/* Duplicate for infinite loop */}
                            {[...allTechs, ...allTechs].map((tech, i) => (
                                <div
                                    key={`${tech}-${i}`}
                                    className="flex-shrink-0 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-purple-500/20 hover:border-purple-500/30 transition-all cursor-default"
                                >
                                    {tech}
                                </div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* Stats */}
                <AnimatedSection delay={300}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                        {[
                            { value: "30+", label: "Technologies", icon: Layers, color: "from-cyan-500 to-blue-500" },
                            { value: "6", label: "Categories", icon: Box, color: "from-purple-500 to-pink-500" },
                            { value: "100%", label: "Type Safe", icon: Shield, color: "from-emerald-500 to-teal-500" },
                            { value: "24/7", label: "Online", icon: Activity, color: "from-orange-500 to-red-500" },
                        ].map((stat, i) => (
                            <TiltCard key={i} sensitivity={5}>
                                <div className="relative p-6 md:p-8 rounded-2xl bg-[#12121a]/80 backdrop-blur-xl border border-white/10 text-center group hover:border-purple-500/30 transition-all">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className={`text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r ${stat.color} mb-2`}>
                                        {stat.value}
                                    </div>
                                    <p className="text-gray-400 font-medium">{stat.label}</p>
                                </div>
                            </TiltCard>
                        ))}
                    </div>
                </AnimatedSection>
            </div>

            {/* Scroll Animation */}
            <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
        </section>
    );
}
