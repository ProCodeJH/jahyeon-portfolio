import { useState, useEffect } from "react";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import {
    Server,
    Database,
    Globe,
    Zap,
    Code2,
    Layers,
    CheckCircle2,
    Activity,
    Cpu,
    Cloud,
    GitBranch,
    Terminal,
    Braces,
    Palette,
    Shield,
    Rocket
} from "lucide-react";

interface TechItem {
    name: string;
    icon: React.ElementType;
    category: 'frontend' | 'backend' | 'database' | 'infra' | 'tools';
    color: string;
    status: 'active' | 'connected';
    description: string;
}

const techStack: TechItem[] = [
    // Frontend
    { name: "React 18", icon: Code2, category: 'frontend', color: "from-cyan-400 to-blue-500", status: 'active', description: "UI 컴포넌트 라이브러리" },
    { name: "TypeScript", icon: Braces, category: 'frontend', color: "from-blue-500 to-blue-600", status: 'active', description: "타입 안전성" },
    { name: "Vite", icon: Zap, category: 'frontend', color: "from-purple-500 to-yellow-500", status: 'active', description: "초고속 빌드 도구" },
    { name: "TailwindCSS", icon: Palette, category: 'frontend', color: "from-cyan-400 to-teal-500", status: 'active', description: "유틸리티 CSS" },
    { name: "Framer Motion", icon: Layers, category: 'frontend', color: "from-pink-500 to-purple-500", status: 'active', description: "애니메이션 라이브러리" },
    { name: "Three.js", icon: Globe, category: 'frontend', color: "from-gray-400 to-gray-600", status: 'active', description: "3D 그래픽스" },

    // Backend
    { name: "NestJS", icon: Server, category: 'backend', color: "from-red-500 to-pink-500", status: 'active', description: "엔터프라이즈 API 프레임워크" },
    { name: "Socket.IO", icon: Activity, category: 'backend', color: "from-gray-600 to-gray-800", status: 'connected', description: "실시간 WebSocket" },
    { name: "JWT Auth", icon: Shield, category: 'backend', color: "from-green-500 to-emerald-500", status: 'active', description: "보안 인증" },
    { name: "Prisma ORM", icon: Database, category: 'backend', color: "from-indigo-500 to-purple-600", status: 'connected', description: "타입세이프 ORM" },

    // Database
    { name: "PostgreSQL", icon: Database, category: 'database', color: "from-blue-600 to-blue-800", status: 'connected', description: "관계형 데이터베이스" },
    { name: "Supabase", icon: Cloud, category: 'database', color: "from-emerald-500 to-green-600", status: 'connected', description: "Backend as a Service" },

    // Infrastructure
    { name: "Vercel", icon: Rocket, category: 'infra', color: "from-gray-800 to-black", status: 'active', description: "프론트엔드 호스팅" },
    { name: "Render", icon: Server, category: 'infra', color: "from-purple-600 to-indigo-600", status: 'active', description: "API 서버 호스팅" },
    { name: "GitHub", icon: GitBranch, category: 'infra', color: "from-gray-700 to-gray-900", status: 'connected', description: "버전 관리 & CI/CD" },

    // Tools
    { name: "ESLint", icon: Terminal, category: 'tools', color: "from-purple-500 to-indigo-500", status: 'active', description: "코드 품질 검사" },
    { name: "Expo", icon: Cpu, category: 'tools', color: "from-gray-800 to-black", status: 'active', description: "모바일 앱 개발" },
];

const codeSnippets = [
    {
        title: "Real-time Chat Gateway",
        language: "typescript",
        code: `@WebSocketGateway({ cors: true })
export class ChatGateway {
  @SubscribeMessage('chat:message')
  async handleMessage(
    @MessageBody() data: MessageDto
  ) {
    return this.chatService.broadcast(data);
  }
}`
    },
    {
        title: "Prisma Schema",
        language: "prisma",
        code: `model Admin {
  id           String    @id @default(uuid())
  email        String    @unique
  role         AdminRole @default(ADMIN)
  chats        Chat[]
  createdAt    DateTime  @default(now())
}`
    },
    {
        title: "React Component",
        language: "tsx",
        code: `export function LiveTechStack() {
  const [ping, setPing] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/health').then(r => r.json())
        .then(d => setPing(d.latency));
    }, 5000);
    return () => clearInterval(interval);
  }, []);
}`
    }
];

export function LiveTechStack() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [latency, setLatency] = useState<number | null>(null);
    const [activeSnippet, setActiveSnippet] = useState(0);

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

    // Rotate code snippets
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSnippet(prev => (prev + 1) % codeSnippets.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const categories = [
        { id: 'frontend', name: 'Frontend', icon: Code2 },
        { id: 'backend', name: 'Backend', icon: Server },
        { id: 'database', name: 'Database', icon: Database },
        { id: 'infra', name: 'Infrastructure', icon: Cloud },
        { id: 'tools', name: 'Tools', icon: Terminal },
    ];

    const filteredTech = selectedCategory
        ? techStack.filter(t => t.category === selectedCategory)
        : techStack;

    return (
        <section className="py-24 md:py-40 lg:py-48 px-4 md:px-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Connection Lines - Animated */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <svg className="absolute w-full h-full" style={{ opacity: 0.1 }}>
                    <defs>
                        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                    {[...Array(8)].map((_, i) => (
                        <line
                            key={i}
                            x1={`${10 + i * 10}%`}
                            y1="0%"
                            x2={`${90 - i * 10}%`}
                            y2="100%"
                            stroke="url(#line-gradient)"
                            strokeWidth="1"
                            className="animate-pulse"
                            style={{ animationDelay: `${i * 0.5}s` }}
                        />
                    ))}
                </svg>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <AnimatedSection>
                    <div className="text-center mb-16 md:mb-24">
                        <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-500/30 backdrop-blur-xl mb-8">
                            <div className="relative">
                                <div className={`w-3 h-3 rounded-full ${apiStatus === 'online' ? 'bg-green-500' : apiStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`} />
                                <div className={`absolute inset-0 w-3 h-3 rounded-full ${apiStatus === 'online' ? 'bg-green-500' : 'bg-yellow-500'} animate-ping`} />
                            </div>
                            <span className="text-lg font-bold text-cyan-300 tracking-wider uppercase">Live System Status</span>
                            {latency && (
                                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-mono">
                                    {latency}ms
                                </span>
                            )}
                        </div>

                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient-x">
                                Tech Stack
                            </span>
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
                            이 포트폴리오를 구동하는 <span className="text-cyan-400 font-semibold">엔터프라이즈급</span> 기술 스택
                        </p>

                        <div className="w-32 md:w-48 h-2 md:h-3 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full mx-auto mt-8" style={{ boxShadow: '0 0 30px rgba(6, 182, 212, 0.6)' }} />
                    </div>
                </AnimatedSection>

                {/* Live Status Dashboard */}
                <AnimatedSection delay={100}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
                        {/* API Status Card */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">API Server</h3>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${apiStatus === 'online' ? 'bg-green-500/20 text-green-400' :
                                        apiStatus === 'offline' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-500' :
                                            apiStatus === 'offline' ? 'bg-red-500' :
                                                'bg-yellow-500'
                                        } animate-pulse`} />
                                    <span className="text-sm font-bold uppercase">
                                        {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Checking'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">jahyeon-portfolio.onrender.com</p>
                            <div className="flex items-center gap-2 text-emerald-400">
                                <Server className="w-4 h-4" />
                                <span className="text-sm">NestJS + Prisma + PostgreSQL</span>
                            </div>
                        </div>

                        {/* Real-time Features Card */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Real-time</h3>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
                                    <Activity className="w-4 h-4 animate-pulse" />
                                    <span className="text-sm font-bold">WebSocket</span>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">실시간 채팅 & 알림</p>
                            <div className="flex items-center gap-2 text-purple-400">
                                <Zap className="w-4 h-4" />
                                <span className="text-sm">Socket.IO + Redis Pub/Sub</span>
                            </div>
                        </div>

                        {/* Mobile App Card */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Mobile App</h3>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400">
                                    <Cpu className="w-4 h-4" />
                                    <span className="text-sm font-bold">Native</span>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">관리자 앱 (Android/iOS)</p>
                            <div className="flex items-center gap-2 text-orange-400">
                                <Rocket className="w-4 h-4" />
                                <span className="text-sm">React Native + Expo</span>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Category Filter */}
                <AnimatedSection delay={150}>
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-5 py-2.5 rounded-xl font-bold transition-all ${selectedCategory === null
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            All ({techStack.length})
                        </button>
                        {categories.map(cat => {
                            const count = techStack.filter(t => t.category === cat.id).length;
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${selectedCategory === cat.id
                                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.name} ({count})
                                </button>
                            );
                        })}
                    </div>
                </AnimatedSection>

                {/* Tech Grid */}
                <AnimatedSection delay={200}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-16">
                        {filteredTech.map((tech, idx) => {
                            const Icon = tech.icon;
                            return (
                                <div
                                    key={tech.name}
                                    className="group relative p-5 rounded-2xl bg-[#12121a] border border-white/10 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    {/* Gradient Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                    {/* Status Indicator */}
                                    <div className="absolute top-3 right-3">
                                        <div className={`w-2 h-2 rounded-full ${tech.status === 'active' ? 'bg-green-500' : 'bg-cyan-500'
                                            } animate-pulse`} />
                                    </div>

                                    {/* Content */}
                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                                            {tech.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                                            {tech.description}
                                        </p>
                                    </div>

                                    {/* Hover Glow */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-500 -z-10" />
                                </div>
                            );
                        })}
                    </div>
                </AnimatedSection>

                {/* Live Code Showcase */}
                <AnimatedSection delay={300}>
                    <div className="relative rounded-3xl overflow-hidden bg-[#0d0d15] border border-white/10">
                        {/* Glow Border */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur" />

                        <div className="relative bg-[#0d0d15] rounded-3xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <span className="text-white font-bold">{codeSnippets[activeSnippet].title}</span>
                                    <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400 font-mono">
                                        {codeSnippets[activeSnippet].language}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-green-400 font-mono">LIVE</span>
                                </div>
                            </div>

                            {/* Code Display */}
                            <div className="p-6 font-mono text-sm">
                                <pre className="text-gray-300 overflow-x-auto">
                                    <code className="language-typescript">
                                        {codeSnippets[activeSnippet].code.split('\n').map((line, i) => (
                                            <div key={i} className="flex">
                                                <span className="text-gray-600 select-none w-8">{i + 1}</span>
                                                <span className="flex-1" dangerouslySetInnerHTML={{
                                                    __html: line
                                                        .replace(/(@\w+)/g, '<span class="text-yellow-400">$1</span>')
                                                        .replace(/(export|class|async|interface|model|const|function|return)/g, '<span class="text-purple-400">$1</span>')
                                                        .replace(/('.*?'|".*?")/g, '<span class="text-emerald-400">$1</span>')
                                                        .replace(/(\{|\}|\(|\)|=>|@)/g, '<span class="text-cyan-400">$1</span>')
                                                }} />
                                            </div>
                                        ))}
                                    </code>
                                </pre>
                            </div>

                            {/* Snippet Navigation */}
                            <div className="flex items-center justify-center gap-2 pb-4">
                                {codeSnippets.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveSnippet(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === activeSnippet ? 'w-8 bg-cyan-500' : 'bg-gray-600 hover:bg-gray-500'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Stats */}
                <AnimatedSection delay={400}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                        {[
                            { label: 'Technologies', value: techStack.length + '+', icon: Layers },
                            { label: 'API Endpoints', value: '25+', icon: Server },
                            { label: 'Components', value: '50+', icon: Code2 },
                            { label: 'Commits', value: '500+', icon: GitBranch },
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                                <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                                <div className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                                    {stat.value}
                                </div>
                                <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
