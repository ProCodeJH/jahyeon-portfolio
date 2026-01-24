import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import {
    ArrowRight, ArrowUp, Code, Zap, CircuitBoard, GraduationCap, Terminal, Github, Linkedin, Mail,
    ChevronRight, Activity, Star, GitFork, GitBranch, ExternalLink, Cpu, Database, Globe, Layers,
    Smartphone, Server, Cloud, Braces, Plus, AlertCircle, Package, Users
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";

// ==================== TYPES ====================
interface ServiceCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    gradient: string;
}

interface TechStackItem {
    name: string;
    icon: React.ElementType;
    category: string;
    level: number; // 1-100
    color: string;
}

interface GitHubRepo {
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    url: string;
}

// ==================== DATA ====================
const services: ServiceCardProps[] = [
    {
        title: "Embedded Systems",
        description: "MCU programming, RTOS development, and firmware optimization for industrial applications",
        icon: CircuitBoard,
        gradient: "from-electric/20 to-accent-cyan/10",
    },
    {
        title: "Full-Stack Development",
        description: "Modern web applications with React, Node.js, and cloud-native architectures",
        icon: Code,
        gradient: "from-accent-indigo/20 to-electric/10",
    },
    {
        title: "IoT Solutions",
        description: "Connected devices, smart sensors, and industrial automation systems",
        icon: Zap,
        gradient: "from-accent-cyan/20 to-accent-indigo/10",
    },
    {
        title: "Coding Education",
        description: "Teaching programming fundamentals to 500+ students with hands-on projects",
        icon: GraduationCap,
        gradient: "from-electric/15 to-accent-cyan/15",
    },
];

const techStack: TechStackItem[] = [
    // Languages
    { name: "Python", icon: Braces, category: "Languages", level: 95, color: "#3776AB" },
    { name: "TypeScript", icon: Braces, category: "Languages", level: 90, color: "#3178C6" },
    { name: "C/C++", icon: Cpu, category: "Languages", level: 85, color: "#00599C" },
    { name: "Java", icon: Braces, category: "Languages", level: 80, color: "#ED8B00" },
    // Frontend
    { name: "React", icon: Globe, category: "Frontend", level: 92, color: "#61DAFB" },
    { name: "Next.js", icon: Layers, category: "Frontend", level: 88, color: "#000000" },
    { name: "Tailwind", icon: Layers, category: "Frontend", level: 90, color: "#38B2AC" },
    // Backend
    { name: "Node.js", icon: Server, category: "Backend", level: 88, color: "#339933" },
    { name: "PostgreSQL", icon: Database, category: "Backend", level: 85, color: "#336791" },
    { name: "Docker", icon: Cloud, category: "Backend", level: 80, color: "#2496ED" },
    // Embedded
    { name: "Arduino", icon: Cpu, category: "Embedded", level: 95, color: "#00979D" },
    { name: "Raspberry Pi", icon: Smartphone, category: "Embedded", level: 90, color: "#C51A4A" },
    { name: "RTOS", icon: Cpu, category: "Embedded", level: 85, color: "#00FF88" },
];

// ==================== CUSTOM HOOKS ====================
interface GitHubEvent {
    id: string;
    type: string;
    repo: string;
    createdAt: string;
    payload: any;
}

function useGitHubStats() {
    const [stats, setStats] = useState<{
        repos: GitHubRepo[];
        totalStars: number;
        totalRepos: number;
        totalForks: number;
        followers: number;
        events: GitHubEvent[];
        loading: boolean;
    }>({
        repos: [],
        totalStars: 0,
        totalRepos: 0,
        totalForks: 0,
        followers: 0,
        events: [],
        loading: true,
    });

    useEffect(() => {
        const fetchGitHubData = async () => {
            try {
                // Fetch user data
                const userRes = await fetch('https://api.github.com/users/ProCodeJH');
                const userData = await userRes.json();

                // Fetch repos
                const reposRes = await fetch('https://api.github.com/users/ProCodeJH/repos?sort=updated&per_page=30');
                const reposData = await reposRes.json();

                // Fetch events (commits, PRs, etc.)
                const eventsRes = await fetch('https://api.github.com/users/ProCodeJH/events?per_page=10');
                const eventsData = await eventsRes.json();

                if (Array.isArray(reposData)) {
                    const formattedRepos: GitHubRepo[] = reposData.slice(0, 6).map((repo: any) => ({
                        name: repo.name,
                        description: repo.description || 'No description',
                        stars: repo.stargazers_count,
                        forks: repo.forks_count,
                        language: repo.language || 'Unknown',
                        url: repo.html_url,
                    }));

                    const formattedEvents: GitHubEvent[] = Array.isArray(eventsData)
                        ? eventsData.slice(0, 8).map((event: any) => ({
                            id: event.id,
                            type: event.type,
                            repo: event.repo?.name?.split('/')[1] || 'unknown',
                            createdAt: event.created_at,
                            payload: event.payload,
                        }))
                        : [];

                    setStats({
                        repos: formattedRepos,
                        totalStars: reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0),
                        totalRepos: userData.public_repos || reposData.length,
                        totalForks: reposData.reduce((acc: number, repo: any) => acc + repo.forks_count, 0),
                        followers: userData.followers || 0,
                        events: formattedEvents,
                        loading: false,
                    });
                }
            } catch (error) {
                console.error('GitHub API error:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchGitHubData();
        // Refresh every 60 seconds
        const interval = setInterval(fetchGitHubData, 60000);
        return () => clearInterval(interval);
    }, []);

    return stats;
}

// ==================== COMPONENTS ====================

// Typing Animation Hook
function useTypingAnimation() {
    const codeSnippets = [
        'const app = express();',
        'async function deploy() {',
        'npm run build && deploy',
        'git push origin main',
        'docker compose up -d',
        'Arduino.analogRead(A0)',
        'SELECT * FROM projects',
        'npm install @latest',
    ];

    const [currentText, setCurrentText] = useState('');
    const [snippetIndex, setSnippetIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentSnippet = codeSnippets[snippetIndex];

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (charIndex < currentSnippet.length) {
                    setCurrentText(currentSnippet.slice(0, charIndex + 1));
                    setCharIndex(charIndex + 1);
                } else {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                if (charIndex > 0) {
                    setCurrentText(currentSnippet.slice(0, charIndex - 1));
                    setCharIndex(charIndex - 1);
                } else {
                    setIsDeleting(false);
                    setSnippetIndex((snippetIndex + 1) % codeSnippets.length);
                }
            }
        }, isDeleting ? 30 : 80);

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, snippetIndex]);

    return currentText;
}

function Hero() {
    const typingText = useTypingAnimation();
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-midnight">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

            {/* Premium Glow Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-electric/8 rounded-full blur-[160px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-indigo/10 rounded-full blur-[140px]" />
            <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-accent-cyan/8 rounded-full blur-[120px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Left Content */}
                    <div className="flex-1 text-center lg:text-left">
                        {/* Live Coding Terminal */}
                        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-midnight-card/90 backdrop-blur-xl border border-electric/30 mb-10 shadow-[0_0_60px_rgba(0,255,136,0.15)]">
                            <div className="flex gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse" />
                                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <span className="w-3 h-3 rounded-full bg-electric/80" />
                            </div>
                            <code className="font-[family-name:var(--font-mono)] text-sm text-electric min-w-[200px]">
                                {typingText}<span className="inline-block w-2 h-4 bg-electric animate-pulse ml-0.5" />
                            </code>
                        </div>

                        {/* Main Headline */}
                        <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-6xl lg:text-7xl font-black text-frost leading-[1.1] mb-8 tracking-tight">
                            Building
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric via-accent-cyan to-accent-indigo">
                                Tomorrow's Tech
                            </span>
                        </h1>

                        <p className="font-[family-name:var(--font-body)] text-lg md:text-xl text-frost-muted max-w-xl mb-12 leading-relaxed">
                            Embedded Systems Engineer & Coding Educator.
                            Crafting innovative solutions from firmware to cloud.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            <Link href="/projects">
                                <Button className="group font-[family-name:var(--font-heading)] text-base px-8 py-6 bg-electric text-midnight rounded-2xl font-bold hover:shadow-[0_0_50px_rgba(0,255,136,0.4)] transition-all duration-500 h-auto">
                                    <span>View Projects</span>
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <a href="https://github.com/ProCodeJH" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="group font-[family-name:var(--font-heading)] text-base px-8 py-6 border-2 border-frost/20 text-frost rounded-2xl font-bold hover:border-electric hover:text-electric hover:bg-electric/5 transition-all duration-300 h-auto bg-transparent">
                                    <Github className="w-5 h-5 mr-2" />
                                    <span>GitHub</span>
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* Right - Logo/Avatar Area */}
                    <div className="flex-shrink-0">
                        <div className="relative">
                            {/* Outer Glow Ring */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-electric via-accent-cyan to-accent-indigo rounded-3xl blur-2xl opacity-30 animate-pulse" />

                            {/* Main Logo Container with 3D effect */}
                            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl bg-gradient-to-br from-midnight-card to-midnight border-2 border-electric/30 flex items-center justify-center shadow-[0_0_80px_rgba(0,255,136,0.2)] transform hover:rotate-3 transition-transform duration-500">
                                <img src="/logo.png" alt="JH Logo" className="w-40 h-40 md:w-52 md:h-52 rounded-2xl" />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                                    <span className="font-[family-name:var(--font-mono)] text-xs text-electric">ONLINE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="mt-20 pt-12 border-t border-midnight-border/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <p className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric to-accent-cyan">500+</p>
                            <p className="font-[family-name:var(--font-body)] text-frost-muted mt-2">Students Taught</p>
                        </div>
                        <div className="text-center">
                            <p className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric to-accent-cyan">5+</p>
                            <p className="font-[family-name:var(--font-body)] text-frost-muted mt-2">Years Experience</p>
                        </div>
                        <div className="text-center">
                            <p className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric to-accent-cyan">50+</p>
                            <p className="font-[family-name:var(--font-body)] text-frost-muted mt-2">Projects Built</p>
                        </div>
                        <div className="text-center">
                            <p className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-indigo to-accent-cyan">AI</p>
                            <p className="font-[family-name:var(--font-body)] text-frost-muted mt-2">Powered</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ServiceCard({ title, description, icon: Icon, gradient }: ServiceCardProps) {
    const [progress, setProgress] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setProgress(95), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} backdrop-blur-xl border border-frost/5 hover:border-electric/50 transition-all duration-700 hover:shadow-[0_0_80px_rgba(0,255,136,0.15)]`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>

            {/* Scanning Line Animation */}
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.5s' }}
            >
                <div
                    className="absolute w-full h-1 bg-gradient-to-r from-transparent via-electric/60 to-transparent"
                    style={{ animation: 'scanLine 2s ease-in-out infinite' }}
                />
            </div>

            <div className="relative z-10 p-8">
                {/* Header with Terminal Style */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-midnight/80 border border-electric/30 flex items-center justify-center group-hover:border-electric/60 transition-all duration-500">
                                <Icon className="w-8 h-8 text-electric group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            {/* Pulse Ring */}
                            <div className="absolute -inset-1 rounded-2xl border border-electric/20 opacity-0 group-hover:opacity-100 animate-ping" style={{ animationDuration: '2s' }} />
                        </div>
                        <div>
                            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-frost group-hover:text-electric transition-colors duration-300">
                                {title}
                            </h3>
                            <span className="font-[family-name:var(--font-mono)] text-xs text-electric/60">ACTIVE MODULE</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                        <span className="font-[family-name:var(--font-mono)] text-xs text-electric">ONLINE</span>
                    </div>
                </div>

                {/* Description */}
                <p className="font-[family-name:var(--font-body)] text-frost-muted leading-relaxed mb-6">
                    {description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="font-[family-name:var(--font-mono)] text-xs text-frost-muted">PROFICIENCY</span>
                        <span className="font-[family-name:var(--font-mono)] text-xs text-electric" style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>{progress}%</span>
                    </div>
                    <div className="h-2 bg-midnight/60 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-electric via-accent-cyan to-electric rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${progress}%`,
                                boxShadow: '0 0 20px rgba(0,255,136,0.4)'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Corner Decoration */}
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-20 group-hover:opacity-40 transition-opacity">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M100 0 L100 100 L0 100" stroke="currentColor" strokeWidth="1" fill="none" className="text-electric" />
                </svg>
            </div>
        </div>
    );
}

function Services() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [typedCode, setTypedCode] = useState('');

    // Live code typing animation
    const codeSnippets = [
        '$ ./deploy --prod --optimize',
        '> Building 913+ projects...',
        '✓ All systems operational',
        '$ git commit -m "Ultra Quality"',
    ];

    useEffect(() => {
        let currentSnippet = 0;
        let currentChar = 0;

        const typeInterval = setInterval(() => {
            const snippet = codeSnippets[currentSnippet];
            if (currentChar <= snippet.length) {
                setTypedCode(snippet.substring(0, currentChar));
                currentChar++;
            } else {
                setTimeout(() => {
                    currentSnippet = (currentSnippet + 1) % codeSnippets.length;
                    currentChar = 0;
                }, 1500);
            }
        }, 80);

        return () => clearInterval(typeInterval);
    }, []);

    return (
        <section className="py-32 bg-midnight relative overflow-hidden">
            {/* Ultra Premium Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-electric/8 rounded-full blur-[200px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent-indigo/10 rounded-full blur-[150px]" style={{ animation: 'pulse 4s ease-in-out infinite alternate' }} />

                {/* Animated Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* Ultra Premium Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-electric/10 via-accent-cyan/10 to-accent-indigo/10 border border-electric/30 backdrop-blur-xl mb-8 shadow-[0_0_60px_rgba(0,255,136,0.2)]">
                        <div className="relative">
                            <span className="w-3 h-3 rounded-full bg-electric animate-ping absolute" />
                            <span className="w-3 h-3 rounded-full bg-electric relative block" />
                        </div>
                        <span className="font-[family-name:var(--font-mono)] text-sm text-frost tracking-wider uppercase">Command Center</span>
                        <div className="h-4 w-px bg-frost/20" />
                        <span className="font-[family-name:var(--font-mono)] text-xs text-electric">ACTIVE</span>
                    </div>

                    <h2 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl font-black mb-6" style={{ textShadow: '0 0 80px rgba(0,255,136,0.4)' }}>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric via-accent-cyan to-electric">
                            Core Systems
                        </span>
                    </h2>
                    <p className="font-[family-name:var(--font-body)] text-lg text-frost-muted max-w-2xl mx-auto">
                        Enterprise-grade engineering capabilities powering 913+ successful projects
                    </p>
                </div>

                {/* Live Terminal Display */}
                <div className="relative mb-16">
                    <div className="absolute -inset-1 bg-gradient-to-r from-electric via-accent-cyan to-accent-indigo rounded-2xl blur-lg opacity-30" />
                    <div className="relative rounded-2xl overflow-hidden border border-electric/30 shadow-[0_0_60px_rgba(0,255,136,0.1)]">
                        {/* Terminal Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-midnight/95 border-b border-electric/20">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <span className="font-[family-name:var(--font-mono)] text-sm text-frost-muted">system-monitor.sh</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                                <span className="font-[family-name:var(--font-mono)] text-xs text-electric">LIVE</span>
                            </div>
                        </div>

                        {/* Terminal Body */}
                        <div className="p-6 bg-[#0a0a0a] font-[family-name:var(--font-mono)] text-sm">
                            <div className="flex items-center gap-2 text-frost-muted mb-2">
                                <span className="text-electric">$</span>
                                <span>{typedCode}</span>
                                <span className="inline-block w-2 h-4 bg-electric animate-pulse" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                {[
                                    { label: 'PROJECTS', value: '913+', color: 'text-electric' },
                                    { label: 'UPTIME', value: '99.9%', color: 'text-accent-cyan' },
                                    { label: 'COMMITS', value: '5.2K+', color: 'text-accent-indigo' },
                                    { label: 'CLIENTS', value: '200+', color: 'text-yellow-500' },
                                ].map((stat, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-midnight-card/50 border border-midnight-border">
                                        <div className={`text-2xl font-black ${stat.color}`} style={{ textShadow: '0 0 10px currentColor' }}>
                                            {stat.value}
                                        </div>
                                        <div className="text-xs text-frost-muted">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes scanLine {
                    0% { top: -10%; }
                    100% { top: 110%; }
                }
            `}</style>
        </section>
    );
}

function TechStack() {
    const categories = [...new Set(techStack.map(t => t.category))];

    return (
        <section className="py-32 bg-gradient-to-b from-midnight to-midnight-card relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.02)_0%,transparent_50%)]" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <span className="inline-block font-[family-name:var(--font-mono)] text-electric text-sm tracking-wider uppercase mb-4">Technologies</span>
                    <h2 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-black text-frost mb-6">
                        Tech Stack
                    </h2>
                    <p className="font-[family-name:var(--font-body)] text-lg text-frost-muted max-w-2xl mx-auto">
                        Tools and technologies I work with daily
                    </p>
                </div>

                <div className="space-y-16">
                    {categories.map((category) => (
                        <div key={category}>
                            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-frost mb-8 flex items-center gap-3">
                                <span className="w-8 h-1 bg-electric rounded-full" />
                                {category}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {techStack.filter(t => t.category === category).map((tech, i) => (
                                    <div key={i} className="group relative p-4 rounded-2xl bg-midnight border border-midnight-border hover:border-electric/30 transition-all duration-300 hover:scale-105">
                                        <div className="flex flex-col items-center text-center">
                                            <tech.icon className="w-8 h-8 mb-3 text-frost-muted group-hover:text-electric transition-colors" style={{ color: tech.color }} />
                                            <span className="font-[family-name:var(--font-heading)] text-sm font-semibold text-frost">{tech.name}</span>
                                            <div className="w-full mt-3 h-1 bg-midnight-border rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-electric to-accent-cyan rounded-full transition-all duration-1000"
                                                    style={{ width: `${tech.level}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function GitHubStatus() {
    const { repos, totalStars, totalRepos, totalForks, followers, events, loading } = useGitHubStats();

    // Get event icon and color based on type
    const getEventInfo = (type: string) => {
        switch (type) {
            case 'PushEvent':
                return { icon: <ArrowUp className="w-5 h-5" />, label: 'Push', color: 'text-electric', bg: 'bg-electric/20' };
            case 'CreateEvent':
                return { icon: <Plus className="w-5 h-5" />, label: 'Create', color: 'text-accent-cyan', bg: 'bg-accent-cyan/20' };
            case 'PullRequestEvent':
                return { icon: <GitBranch className="w-5 h-5" />, label: 'PR', color: 'text-accent-indigo', bg: 'bg-accent-indigo/20' };
            case 'IssuesEvent':
                return { icon: <AlertCircle className="w-5 h-5" />, label: 'Issue', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
            case 'WatchEvent':
                return { icon: <Star className="w-5 h-5" />, label: 'Star', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
            case 'ForkEvent':
                return { icon: <GitFork className="w-5 h-5" />, label: 'Fork', color: 'text-frost', bg: 'bg-frost/20' };
            default:
                return { icon: <Activity className="w-5 h-5" />, label: type.replace('Event', ''), color: 'text-frost-muted', bg: 'bg-frost/10' };
        }
    };

    // Format time ago
    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    };

    return (
        <section className="py-32 bg-midnight relative overflow-hidden">
            {/* Ultra Premium Background */}
            <div className="absolute inset-0">
                {/* Animated Gradient Orbs */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-electric/10 rounded-full blur-[180px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-indigo/15 rounded-full blur-[150px]" style={{ animation: 'pulse 4s ease-in-out infinite alternate' }} />
                <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[120px]" style={{ animation: 'pulse 3s ease-in-out infinite alternate-reverse' }} />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* Ultra Premium Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-electric/10 via-accent-cyan/10 to-accent-indigo/10 border border-electric/30 backdrop-blur-xl mb-8 shadow-[0_0_60px_rgba(0,255,136,0.2)]">
                        <div className="relative">
                            <span className="w-3 h-3 rounded-full bg-electric animate-ping absolute" />
                            <span className="w-3 h-3 rounded-full bg-electric relative block" />
                        </div>
                        <span className="font-[family-name:var(--font-mono)] text-sm text-frost tracking-wider uppercase">Real-Time Activity</span>
                        <div className="h-4 w-px bg-frost/20" />
                        <span className="font-[family-name:var(--font-mono)] text-xs text-electric">Auto-refresh 60s</span>
                    </div>

                    <h2 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl font-black mb-6" style={{ textShadow: '0 0 80px rgba(0,255,136,0.4)' }}>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric via-accent-cyan to-electric">
                            GitHub Status
                        </span>
                    </h2>

                    <p className="font-[family-name:var(--font-body)] text-xl text-frost-muted max-w-2xl mx-auto">
                        Live commits, branches, and contributions from the code factory
                    </p>
                </div>

                {/* Ultra Premium Terminal Interface */}
                <div className="relative mb-16">
                    <div className="absolute -inset-1 bg-gradient-to-r from-electric via-accent-cyan to-accent-indigo rounded-3xl blur-lg opacity-40" />
                    <div className="relative rounded-3xl overflow-hidden border border-electric/30 shadow-[0_0_80px_rgba(0,255,136,0.15)]">
                        {/* Terminal Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-midnight/95 border-b border-electric/20">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <span className="font-[family-name:var(--font-mono)] text-sm text-frost-muted">~/ProCodeJH</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-electric/10 border border-electric/30">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-electric" />
                                    </span>
                                    <span className="font-[family-name:var(--font-mono)] text-xs text-electric">LIVE</span>
                                </div>
                            </div>
                        </div>

                        {/* Terminal Body */}
                        <div className="p-6 bg-[#0a0a0a] min-h-[300px] font-[family-name:var(--font-mono)] text-sm leading-relaxed">
                            {/* Git Status Command */}
                            <div className="mb-4">
                                <span className="text-electric">$</span>
                                <span className="text-frost ml-2">git status</span>
                            </div>
                            <div className="mb-4 pl-4 text-frost-muted">
                                <p>On branch <span className="text-electric">main</span></p>
                                <p>Your branch is up to date with 'origin/main'.</p>
                            </div>

                            {/* Stats Output */}
                            <div className="mb-4">
                                <span className="text-electric">$</span>
                                <span className="text-frost ml-2">./check-stats.sh</span>
                            </div>
                            <div className="mb-6 pl-4 space-y-2">
                                <div className="flex items-center gap-4">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="text-frost">Total Stars:</span>
                                    <span className="text-electric font-bold" style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>{loading ? '...' : totalStars}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Package className="w-4 h-4 text-accent-cyan" />
                                    <span className="text-frost">Repositories:</span>
                                    <span className="text-accent-cyan font-bold" style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>{loading ? '...' : totalRepos}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <GitFork className="w-4 h-4 text-accent-indigo" />
                                    <span className="text-frost">Total Forks:</span>
                                    <span className="text-accent-indigo font-bold" style={{ textShadow: '0 0 10px rgba(99,102,241,0.5)' }}>{loading ? '...' : totalForks}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Users className="w-4 h-4 text-purple-400" />
                                    <span className="text-frost">Followers:</span>
                                    <span className="text-purple-400 font-bold" style={{ textShadow: '0 0 10px rgba(168,85,247,0.5)' }}>{loading ? '...' : followers}</span>
                                </div>
                            </div>

                            {/* Recent Commits */}
                            <div className="mb-4">
                                <span className="text-electric">$</span>
                                <span className="text-frost ml-2">git log --oneline -5</span>
                            </div>
                            <div className="pl-4 space-y-1 text-frost-muted">
                                {events.slice(0, 5).map((event, i) => {
                                    const info = getEventInfo(event.type);
                                    return (
                                        <div key={event.id || i} className="flex items-center gap-2 group hover:text-frost transition-colors">
                                            <span className="text-electric/60">{String(i + 1).padStart(2, '0')}.</span>
                                            <span className={info.color}>[{info.label}]</span>
                                            <span className="truncate">{event.repo}</span>
                                            <span className="text-frost-muted/60 ml-auto">{timeAgo(event.createdAt)}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Blinking Cursor */}
                            <div className="mt-6">
                                <span className="text-electric">$</span>
                                <span className="inline-block w-2 h-4 bg-electric ml-2 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CI/CD Pipeline Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
                    {/* CI/CD Pipeline Timeline - 3 cols */}
                    <div className="lg:col-span-3 relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-electric via-accent-cyan to-accent-indigo rounded-3xl blur opacity-20" />
                        <div className="relative p-8 rounded-3xl bg-midnight/90 backdrop-blur-xl border border-electric/20">
                            {/* Pipeline Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-electric/20 to-accent-cyan/10 flex items-center justify-center">
                                            <GitBranch className="w-6 h-6 text-electric" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-electric flex items-center justify-center">
                                            <span className="text-[8px] text-midnight font-bold">{events.length}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-[family-name:var(--font-heading)] text-2xl font-black text-frost">CI/CD Pipeline</h3>
                                        <p className="font-[family-name:var(--font-mono)] text-xs text-frost-muted">main • Auto-deploy Active</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-electric/10 border border-electric/30">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-electric" />
                                        </span>
                                        <span className="font-[family-name:var(--font-mono)] text-xs text-electric">RUNNING</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pipeline Visualization */}
                            <div className="relative">
                                {/* Main Pipeline Line */}
                                <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-electric via-accent-cyan to-accent-indigo opacity-40" />

                                {/* Animated Flow Line */}
                                <div
                                    className="absolute left-[23px] w-0.5 bg-gradient-to-b from-electric to-transparent"
                                    style={{
                                        height: '60px',
                                        animation: 'pipelineFlow 3s ease-in-out infinite'
                                    }}
                                />

                                <div className="space-y-0">
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="flex items-stretch gap-4 animate-pulse">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-12 h-12 rounded-full bg-midnight-border" />
                                                    {i < 4 && <div className="w-0.5 flex-1 bg-midnight-border" />}
                                                </div>
                                                <div className="flex-1 pb-6">
                                                    <div className="p-4 rounded-xl bg-midnight-card/50">
                                                        <div className="h-5 w-32 bg-midnight-border rounded mb-2" />
                                                        <div className="h-4 w-20 bg-midnight-border rounded" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : events.length > 0 ? (
                                        events.slice(0, 6).map((event, i) => {
                                            const info = getEventInfo(event.type);
                                            const isFirst = i === 0;
                                            const isLast = i === Math.min(events.length, 6) - 1;

                                            return (
                                                <div key={event.id || i} className="group flex items-stretch gap-4">
                                                    {/* Node & Connector */}
                                                    <div className="flex flex-col items-center relative">
                                                        {/* Pipeline Node */}
                                                        <div className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isFirst
                                                                ? 'bg-electric/20 border-electric shadow-[0_0_20px_rgba(0,255,136,0.4)]'
                                                                : 'bg-midnight-card border-midnight-border group-hover:border-electric/50'
                                                            }`}>
                                                            {/* Pulse Animation for First (Running) */}
                                                            {isFirst && (
                                                                <>
                                                                    <div className="absolute inset-0 rounded-full border-2 border-electric animate-ping opacity-30" />
                                                                    <div className="absolute inset-0 rounded-full bg-electric/10 animate-pulse" />
                                                                </>
                                                            )}
                                                            <div className={info.color}>
                                                                {info.icon}
                                                            </div>
                                                        </div>

                                                        {/* Connector Line to Next Node */}
                                                        {!isLast && (
                                                            <div className="relative w-0.5 flex-1 min-h-[40px]">
                                                                <div className={`absolute inset-0 transition-all duration-300 ${isFirst
                                                                        ? 'bg-gradient-to-b from-electric to-accent-cyan'
                                                                        : 'bg-midnight-border group-hover:bg-electric/30'
                                                                    }`} />
                                                                {/* Flow Animation Dot */}
                                                                {isFirst && (
                                                                    <div
                                                                        className="absolute w-2 h-2 -left-[3px] rounded-full bg-electric shadow-[0_0_10px_rgba(0,255,136,0.6)]"
                                                                        style={{ animation: 'flowDot 1.5s ease-in-out infinite' }}
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Event Card */}
                                                    <div className={`flex-1 pb-5 transition-all duration-300 ${isFirst ? 'pl-0' : ''}`}>
                                                        <div className={`p-4 rounded-xl border transition-all duration-300 ${isFirst
                                                                ? 'bg-electric/5 border-electric/30 shadow-[0_0_30px_rgba(0,255,136,0.1)]'
                                                                : 'bg-midnight-card/30 border-transparent group-hover:border-electric/20 group-hover:bg-midnight-card/60'
                                                            }`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${isFirst
                                                                            ? 'bg-electric text-midnight'
                                                                            : `${info.bg} ${info.color}`
                                                                        }`}>
                                                                        {isFirst ? 'RUNNING' : info.label.toUpperCase()}
                                                                    </span>
                                                                    <span className="font-[family-name:var(--font-heading)] text-sm font-semibold text-frost">{event.repo}</span>
                                                                </div>
                                                                {/* Status Indicator */}
                                                                <div className={`w-2 h-2 rounded-full ${isFirst ? 'bg-electric animate-pulse' : 'bg-accent-cyan'
                                                                    }`} />
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-frost-muted">
                                                                <span className="font-[family-name:var(--font-mono)]">{timeAgo(event.createdAt)} ago</span>
                                                                <span className="opacity-40">•</span>
                                                                <span className="font-[family-name:var(--font-mono)] text-electric/60">#{String(i + 1).padStart(3, '0')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12 text-frost-muted">No pipeline activity</div>
                                    )}
                                </div>
                            </div>

                            {/* Pipeline Stats Footer */}
                            <div className="mt-6 pt-6 border-t border-electric/10 grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-black text-electric" style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>{events.length}</div>
                                    <div className="text-xs text-frost-muted font-[family-name:var(--font-mono)]">TOTAL RUNS</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-accent-cyan" style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>100%</div>
                                    <div className="text-xs text-frost-muted font-[family-name:var(--font-mono)]">SUCCESS RATE</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-accent-indigo" style={{ textShadow: '0 0 10px rgba(99,102,241,0.5)' }}>~2m</div>
                                    <div className="text-xs text-frost-muted font-[family-name:var(--font-mono)]">AVG DEPLOY</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CSS Animations for Pipeline */}
                    <style>{`
                        @keyframes pipelineFlow {
                            0% { top: 0; opacity: 1; }
                            100% { top: calc(100% - 60px); opacity: 0; }
                        }
                        @keyframes flowDot {
                            0% { top: 0; opacity: 1; }
                            100% { top: calc(100% - 8px); opacity: 0; }
                        }
                    `}</style>

                    {/* Top Repositories - 2 cols */}
                    <div className="lg:col-span-2 relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-b from-accent-indigo via-electric to-accent-cyan rounded-3xl blur opacity-20" />
                        <div className="relative p-8 rounded-3xl bg-midnight/90 backdrop-blur-xl border border-accent-indigo/20 h-full">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-indigo/20 to-electric/10 flex items-center justify-center">
                                    <Layers className="w-6 h-6 text-accent-indigo" />
                                </div>
                                <div>
                                    <h3 className="font-[family-name:var(--font-heading)] text-2xl font-black text-frost">Top Repos</h3>
                                    <p className="font-[family-name:var(--font-mono)] text-xs text-frost-muted">Most active projects</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-midnight-card/50 animate-pulse">
                                            <div className="h-5 w-32 bg-midnight-border rounded mb-2" />
                                            <div className="h-4 w-full bg-midnight-border rounded" />
                                        </div>
                                    ))
                                ) : (
                                    repos.slice(0, 4).map((repo, i) => (
                                        <a
                                            key={i}
                                            href={repo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group block p-4 rounded-2xl bg-midnight-card/30 border border-transparent hover:border-accent-indigo/30 hover:bg-midnight-card/60 transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-[family-name:var(--font-heading)] text-sm font-bold text-frost group-hover:text-electric transition-colors">{repo.name}</span>
                                                <div className="flex items-center gap-3 text-xs text-frost-muted">
                                                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />{repo.stars}</span>
                                                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3 text-accent-cyan" />{repo.forks}</span>
                                                </div>
                                            </div>
                                            <p className="font-[family-name:var(--font-body)] text-xs text-frost-muted line-clamp-1">{repo.description}</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-electric" />
                                                <span className="font-[family-name:var(--font-mono)] text-xs text-frost-muted">{repo.language}</span>
                                            </div>
                                        </a>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Premium CTA Button */}
                <div className="text-center">
                    <a href="https://github.com/ProCodeJH" target="_blank" rel="noopener noreferrer" className="group inline-block">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-electric via-accent-cyan to-electric rounded-2xl blur opacity-40 group-hover:opacity-80 transition duration-500" />
                            <Button className="relative font-[family-name:var(--font-heading)] px-10 py-5 bg-midnight border-2 border-electric text-electric rounded-2xl font-bold text-lg hover:bg-electric hover:text-midnight transition-all h-auto">
                                <Github className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-500" />
                                Explore All Repositories
                                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </a>
                </div>
            </div>
        </section>
    );
}

function FeaturedProjects() {
    const { data: projects } = trpc.projects.list.useQuery();

    return (
        <section className="py-32 bg-midnight relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-indigo/8 rounded-full blur-[160px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                    <div>
                        <span className="inline-block font-[family-name:var(--font-mono)] text-electric text-sm tracking-wider uppercase mb-4">Portfolio</span>
                        <h2 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-black text-frost mb-4">
                            Featured Work
                        </h2>
                        <p className="font-[family-name:var(--font-body)] text-lg text-frost-muted">
                            Handpicked projects showcasing my expertise
                        </p>
                    </div>
                    <Link href="/projects">
                        <Button className="font-[family-name:var(--font-heading)] px-8 py-4 bg-electric text-midnight rounded-2xl font-bold hover:shadow-[0_0_40px_rgba(0,255,136,0.3)] transition-all h-auto">
                            View All <ChevronRight className="w-5 h-5 ml-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {projects?.slice(0, 3).map((project) => (
                        <div key={project.id} className="group rounded-3xl bg-midnight-card border border-midnight-border overflow-hidden hover:border-electric/30 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,255,136,0.1)]">
                            <div className="aspect-video overflow-hidden relative">
                                {project.imageUrl ? (
                                    <img
                                        src={project.imageUrl}
                                        alt={project.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-electric/10 to-midnight flex items-center justify-center">
                                        <Code className="w-16 h-16 text-electric/20" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent opacity-60" />
                            </div>
                            <div className="p-8">
                                <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-frost mb-3 group-hover:text-electric transition-colors line-clamp-1">
                                    {project.title}
                                </h3>
                                <p className="font-[family-name:var(--font-body)] text-frost-muted text-sm line-clamp-2 mb-6">
                                    {project.description}
                                </p>
                                <Link href="/projects" className="inline-flex items-center gap-2 text-electric font-[family-name:var(--font-heading)] font-semibold text-sm group/link">
                                    <span>View Project</span>
                                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==================== LIVE PROJECT ANALYTICS ====================
function LiveProjectAnalytics() {
    // Animated counter hook
    const useAnimatedCounter = (target: number, duration: number = 2000) => {
        const [count, setCount] = useState(0);
        useEffect(() => {
            let startTime: number;
            let animationFrame: number;
            const animate = (currentTime: number) => {
                if (!startTime) startTime = currentTime;
                const progress = Math.min((currentTime - startTime) / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                setCount(Math.floor(easeOut * target));
                if (progress < 1) {
                    animationFrame = requestAnimationFrame(animate);
                }
            };
            animationFrame = requestAnimationFrame(animate);
            return () => cancelAnimationFrame(animationFrame);
        }, [target, duration]);
        return count;
    };

    // Project Statistics Data
    const projectStats = {
        totalProjects: 913,
        totalValue: 4850000000, // 48.5억원
        avgProjectValue: 5310000, // 531만원
        categories: [
            { name: 'AI/ML', count: 127, color: '#00FF88', percentage: 14 },
            { name: 'Web', count: 156, color: '#22D3EE', percentage: 17 },
            { name: 'App', count: 134, color: '#6366F1', percentage: 15 },
            { name: 'IoT', count: 98, color: '#F59E0B', percentage: 11 },
            { name: 'Blockchain', count: 112, color: '#EC4899', percentage: 12 },
            { name: 'Data', count: 89, color: '#8B5CF6', percentage: 10 },
            { name: 'Game/VR', count: 108, color: '#10B981', percentage: 12 },
            { name: 'Others', count: 89, color: '#64748B', percentage: 9 },
        ],
        priceTiers: [
            { name: 'Micro', range: '~10만원', count: 168, color: '#64748B', avgPrice: 50000 },
            { name: 'Small', range: '10~100만원', count: 254, color: '#22D3EE', avgPrice: 500000 },
            { name: 'Standard', range: '100~500만원', count: 298, color: '#00FF88', avgPrice: 3000000 },
            { name: 'High-End', range: '500~1500만원', count: 138, color: '#F59E0B', avgPrice: 10000000 },
            { name: 'Enterprise', range: '1500만원+', count: 55, color: '#EC4899', avgPrice: 22000000 },
        ],
        techStack: [
            { name: 'React', count: 312 },
            { name: 'Python', count: 287 },
            { name: 'Node.js', count: 245 },
            { name: 'Flutter', count: 189 },
            { name: 'PostgreSQL', count: 156 },
            { name: 'AWS', count: 134 },
            { name: 'Firebase', count: 178 },
            { name: 'TypeScript', count: 167 },
        ],
    };

    // Animated values
    const animatedTotal = useAnimatedCounter(projectStats.totalProjects, 2500);
    const animatedValue = useAnimatedCounter(Math.floor(projectStats.totalValue / 100000000), 3000);

    // Live wave animation state
    const [wavePhase, setWavePhase] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setWavePhase(p => (p + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Bar animation state
    const [barsLoaded, setBarsLoaded] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setBarsLoaded(true), 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="py-32 bg-midnight relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-electric/8 rounded-full blur-[150px]" style={{ animation: 'pulse 4s ease-in-out infinite' }} />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent-indigo/10 rounded-full blur-[120px]" style={{ animation: 'pulse 3s ease-in-out infinite alternate' }} />

                {/* Live Wave Lines */}
                <svg className="absolute bottom-0 left-0 w-full h-32 opacity-20" preserveAspectRatio="none">
                    <path
                        d={`M0,50 ${Array.from({ length: 20 }, (_, i) =>
                            `Q${i * 100 + 50},${50 + Math.sin((wavePhase + i * 10) * 0.1) * 30} ${(i + 1) * 100},50`
                        ).join(' ')} V100 H0 Z`}
                        fill="url(#waveGradient)"
                    />
                    <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00FF88" stopOpacity="0.3" />
                            <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-electric/10 via-accent-cyan/10 to-accent-indigo/10 border border-electric/30 backdrop-blur-xl mb-8">
                        <div className="relative">
                            <span className="w-3 h-3 rounded-full bg-electric animate-ping absolute" />
                            <span className="w-3 h-3 rounded-full bg-electric relative block" />
                        </div>
                        <span className="font-[family-name:var(--font-mono)] text-sm text-frost tracking-wider uppercase">Live Analytics</span>
                        <div className="h-4 w-px bg-frost/20" />
                        <span className="font-[family-name:var(--font-mono)] text-xs text-electric">Real-time Data</span>
                    </div>

                    <h2 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl font-black mb-6" style={{ textShadow: '0 0 80px rgba(0,255,136,0.3)' }}>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric via-accent-cyan to-electric">
                            Project Analytics
                        </span>
                    </h2>
                    <p className="font-[family-name:var(--font-body)] text-xl text-frost-muted max-w-2xl mx-auto">
                        Real-time project portfolio and market insights
                    </p>
                </div>

                {/* 913+ PROJECTS - Large Scroller */}
                <div className="relative mb-16">
                    <div className="absolute -inset-1 bg-gradient-to-r from-electric via-accent-cyan to-accent-indigo rounded-3xl blur-lg opacity-40" />
                    <div className="relative rounded-3xl overflow-hidden border border-electric/30 shadow-[0_0_60px_rgba(0,255,136,0.15)]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 bg-midnight/95 border-b border-electric/20">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric/30 to-accent-cyan/10 flex items-center justify-center">
                                    <Layers className="w-7 h-7 text-electric" />
                                </div>
                                <div>
                                    <h3 className="font-[family-name:var(--font-mono)] text-4xl font-black text-frost" style={{ textShadow: '0 0 30px rgba(0,255,136,0.4)' }}>
                                        {animatedTotal.toLocaleString()}+ PROJECTS
                                    </h3>
                                    <p className="font-[family-name:var(--font-mono)] text-xs text-frost-muted">Delivered portfolio showcase</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-electric/10 border border-electric/30">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-electric" />
                                </span>
                                <span className="font-[family-name:var(--font-mono)] text-xs text-electric">AUTO SCROLL</span>
                            </div>
                        </div>

                        {/* Expanded Project Names Scroller */}
                        <div className="relative overflow-hidden h-[400px] bg-[#0a0a0a]">
                            <div className="absolute inset-0 pointer-events-none z-10">
                                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0a0a0a] to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                            </div>

                            <div className="animate-scroll space-y-3 py-6 px-8" style={{
                                animation: 'scroll 45s linear infinite',
                            }}>
                                {[
                                    "AI 기반 고객 맞춤형 추천 시스템", "IoT 스마트 팩토리 모니터링", "React Native 피트니스 앱",
                                    "블록체인 NFT 마켓플레이스", "Python 주식 자동매매 봇", "Flutter 음식 배달 앱",
                                    "Vue.js 실시간 채팅 플랫폼", "AWS 클라우드 인프라 구축", "Node.js REST API 서버",
                                    "PostgreSQL 데이터 분석 대시보드", "Docker 컨테이너 오케스트레이션", "Kubernetes 마이크로서비스",
                                    "Arduino 스마트홈 컨트롤러", "Raspberry Pi 환경 센서", "RTOS 산업용 임베디드",
                                    "TensorFlow 이미지 분류 모델", "GPT-4 챗봇 통합", "Stable Diffusion 이미지 생성",
                                    "Next.js 이커머스 플랫폼", "TypeScript 엔터프라이즈 앱", "GraphQL API 게이트웨이",
                                    "Firebase 실시간 데이터베이스", "MongoDB 빅데이터 처리", "Redis 캐싱 시스템",
                                    "Unity VR 게임 개발", "Unreal Engine 3D 시뮬레이션", "WebGL 인터랙티브 시각화",
                                    "Swift iOS 네이티브 앱", "Kotlin Android 앱 개발", "Cross-platform PWA",
                                    "Solidity 스마트 컨트랙트", "Web3 DeFi 프로토콜", "Ethereum 지갑 통합",
                                    "OpenCV 영상 처리", "YOLO 객체 탐지", "자율주행 시뮬레이터",
                                    "Jenkins CI/CD 파이프라인", "GitHub Actions 자동화", "Terraform IaC",
                                    "Elasticsearch 검색 엔진", "Kafka 메시지 큐", "Spark 분산 처리",
                                    "React Three Fiber 3D", "D3.js 데이터 시각화", "Chart.js 대시보드",
                                    "Stripe 결제 시스템", "PayPal 통합", "암호화폐 결제 게이트웨이",
                                    "OAuth2 인증 시스템", "JWT 토큰 관리", "SAML SSO 통합",
                                    "Nginx 리버스 프록시", "Load Balancer 구축", "CDN 최적화",
                                    "Prometheus 모니터링", "Grafana 대시보드", "ELK 스택 로깅",
                                    "Python Django CMS", "PHP Laravel 백엔드", "Ruby on Rails API",
                                    "Go 마이크로서비스", "Rust 시스템 프로그래밍", "C++ 게임 엔진",
                                ].map((name, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 px-6 py-3 rounded-xl bg-midnight-card/20 hover:bg-midnight-card/50 hover:border-electric/30 border border-transparent transition-all group cursor-pointer"
                                    >
                                        <span className="font-[family-name:var(--font-mono)] text-electric/40 text-xs">{String(i + 1).padStart(3, '0')}</span>
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{
                                                backgroundColor: ['#00FF88', '#22D3EE', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981'][i % 7]
                                            }}
                                        />
                                        <span className="font-[family-name:var(--font-mono)] text-base text-frost-muted group-hover:text-frost transition-colors flex-1">{name}</span>
                                        <span className="font-[family-name:var(--font-mono)] text-xs text-frost-muted/30 group-hover:text-electric/50 transition-colors">→</span>
                                    </div>
                                ))}
                                {/* Duplicate for seamless loop */}
                                {[
                                    "AI 기반 고객 맞춤형 추천 시스템", "IoT 스마트 팩토리 모니터링", "React Native 피트니스 앱",
                                    "블록체인 NFT 마켓플레이스", "Python 주식 자동매매 봇", "Flutter 음식 배달 앱",
                                    "Vue.js 실시간 채팅 플랫폼", "AWS 클라우드 인프라 구축",
                                ].map((name, i) => (
                                    <div
                                        key={`dup-${i}`}
                                        className="flex items-center gap-4 px-6 py-3 rounded-xl bg-midnight-card/20 hover:bg-midnight-card/50 hover:border-electric/30 border border-transparent transition-all group cursor-pointer"
                                    >
                                        <span className="font-[family-name:var(--font-mono)] text-electric/40 text-xs">{String(60 + i + 1).padStart(3, '0')}</span>
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: ['#00FF88', '#22D3EE', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'][i % 6] }}
                                        />
                                        <span className="font-[family-name:var(--font-mono)] text-base text-frost-muted group-hover:text-frost transition-colors flex-1">{name}</span>
                                        <span className="font-[family-name:var(--font-mono)] text-xs text-frost-muted/30 group-hover:text-electric/50 transition-colors">→</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <style>{`
                        @keyframes scroll {
                            0% { transform: translateY(0); }
                            100% { transform: translateY(-50%); }
                        }
                        .animate-scroll:hover {
                            animation-play-state: paused;
                        }
                    `}</style>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Category Distribution */}
                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-electric/20 via-accent-cyan/20 to-accent-indigo/20 rounded-3xl blur opacity-30" />
                        <div className="relative p-8 rounded-3xl bg-midnight/90 backdrop-blur-xl border border-electric/20">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-[family-name:var(--font-heading)] text-2xl font-black text-frost">Category Distribution</h3>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-electric/10 border border-electric/30">
                                    <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                                    <span className="font-[family-name:var(--font-mono)] text-xs text-electric">LIVE</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {projectStats.categories.map((cat, i) => (
                                    <div key={cat.name} className="group/bar">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-[family-name:var(--font-mono)] text-sm text-frost">{cat.name}</span>
                                            <span className="font-[family-name:var(--font-mono)] text-sm text-frost-muted">{cat.count}</span>
                                        </div>
                                        <div className="h-3 bg-midnight-card rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{
                                                    width: barsLoaded ? `${cat.percentage * 5}%` : '0%',
                                                    background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
                                                    boxShadow: `0 0 20px ${cat.color}40`,
                                                    transitionDelay: `${i * 100}ms`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Price Tier Distribution */}
                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-indigo/20 via-purple-500/20 to-electric/20 rounded-3xl blur opacity-30" />
                        <div className="relative p-8 rounded-3xl bg-midnight/90 backdrop-blur-xl border border-accent-indigo/20">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-[family-name:var(--font-heading)] text-2xl font-black text-frost">Price Tier Analysis</h3>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-indigo/10 border border-accent-indigo/30">
                                    <span className="font-[family-name:var(--font-mono)] text-xs text-accent-indigo">ANALYSIS</span>
                                </div>
                            </div>
                            <div className="flex items-end justify-between h-48 gap-4">
                                {projectStats.priceTiers.map((tier, i) => (
                                    <div key={tier.name} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full rounded-t-xl transition-all duration-1000 ease-out relative group/tier"
                                            style={{
                                                height: barsLoaded ? `${(tier.count / 300) * 100}%` : '0%',
                                                background: `linear-gradient(180deg, ${tier.color}, ${tier.color}44)`,
                                                boxShadow: `0 0 30px ${tier.color}30`,
                                                transitionDelay: `${i * 150}ms`,
                                            }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-[family-name:var(--font-mono)] text-sm text-frost opacity-0 group-hover/tier:opacity-100 transition-opacity">
                                                {tier.count}
                                            </div>
                                        </div>
                                        <div className="font-[family-name:var(--font-mono)] text-xs text-frost-muted text-center">{tier.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ==================== YOUTUBE SHOWCASE ====================
function YouTubeShowcase() {
    return (
        <section className="py-32 bg-gradient-to-b from-midnight to-midnight-card relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[150px]" style={{ animation: 'pulse 4s ease-in-out infinite' }} />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-electric/8 rounded-full blur-[120px]" style={{ animation: 'pulse 3s ease-in-out infinite alternate' }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500/10 via-red-600/10 to-electric/10 border border-red-500/30 backdrop-blur-xl mb-8">
                        <div className="relative">
                            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute" />
                            <span className="w-3 h-3 rounded-full bg-red-500 relative block" />
                        </div>
                        <span className="font-[family-name:var(--font-mono)] text-sm text-frost tracking-wider uppercase">YouTube Channel</span>
                        <div className="h-4 w-px bg-frost/20" />
                        <span className="font-[family-name:var(--font-mono)] text-xs text-red-400">LIVE</span>
                    </div>

                    <h2 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl font-black mb-6" style={{ textShadow: '0 0 80px rgba(239,68,68,0.3)' }}>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-electric">
                            Video Content
                        </span>
                    </h2>
                    <p className="font-[family-name:var(--font-body)] text-xl text-frost-muted max-w-2xl mx-auto">
                        튜토리얼, 프로젝트 워크스루, 기술 데모 영상
                    </p>
                </div>

                {/* Video Container */}
                <div className="relative max-w-4xl mx-auto">
                    {/* Glow Effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-red-400/20 to-electric/20 rounded-3xl blur-xl opacity-60" />

                    <div className="relative rounded-3xl overflow-hidden border-2 border-red-500/30 hover:border-red-500/60 transition-all duration-500 shadow-[0_0_60px_rgba(239,68,68,0.2)]">
                        {/* YouTube Embed */}
                        <div className="aspect-video bg-midnight-card relative">
                            <iframe
                                className="w-full h-full"
                                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                                title="Featured Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        {/* Video Info */}
                        <div className="p-6 bg-midnight/90 backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-frost mb-2">
                                        🎬 Featured Content
                                    </h3>
                                    <p className="font-[family-name:var(--font-body)] text-sm text-frost-muted">
                                        실시간 코딩 세션 및 기술 튜토리얼
                                    </p>
                                </div>
                                <a
                                    href="https://www.youtube.com/@YourChannel"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500 text-white font-[family-name:var(--font-heading)] font-bold hover:bg-red-600 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                    Subscribe
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function CTA() {
    return (
        <section className="py-32 bg-gradient-to-b from-midnight-card to-midnight relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.1)_0%,transparent_60%)]" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <span className="inline-block font-[family-name:var(--font-mono)] text-electric text-sm tracking-wider uppercase mb-4">Get Started</span>
                <h2 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-black text-frost mb-8">
                    Let's Build Something
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric to-accent-cyan">Amazing Together</span>
                </h2>
                <p className="font-[family-name:var(--font-body)] text-lg text-frost-muted mb-12 max-w-2xl mx-auto">
                    Have a project in mind? Let's discuss how I can help bring your ideas to life with cutting-edge technology.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/resources">
                        <Button className="font-[family-name:var(--font-heading)] text-lg px-10 py-7 bg-electric text-midnight rounded-2xl font-bold hover:shadow-[0_0_60px_rgba(0,255,136,0.4)] transition-all h-auto">
                            Get in Touch
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="py-20 bg-midnight border-t border-midnight-border/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mb-16">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="w-16 h-16 rounded-xl" />
                        <div>
                            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-frost">
                                JH Portfolio
                            </h3>
                            <p className="font-[family-name:var(--font-body)] text-frost-muted">
                                Embedded Developer
                            </p>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-4">
                        <a href="https://github.com/ProCodeJH" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl bg-midnight-card border border-midnight-border flex items-center justify-center text-frost-muted hover:text-electric hover:border-electric/30 hover:shadow-[0_0_30px_rgba(0,255,136,0.2)] transition-all">
                            <Github className="w-6 h-6" />
                        </a>
                        <a href="#" className="w-14 h-14 rounded-2xl bg-midnight-card border border-midnight-border flex items-center justify-center text-frost-muted hover:text-electric hover:border-electric/30 hover:shadow-[0_0_30px_rgba(0,255,136,0.2)] transition-all">
                            <Linkedin className="w-6 h-6" />
                        </a>
                        <a href="#" className="w-14 h-14 rounded-2xl bg-midnight-card border border-midnight-border flex items-center justify-center text-frost-muted hover:text-electric hover:border-electric/30 hover:shadow-[0_0_30px_rgba(0,255,136,0.2)] transition-all">
                            <Mail className="w-6 h-6" />
                        </a>
                    </div>
                </div>

                {/* Nav Links */}
                <div className="flex flex-wrap gap-8 mb-16">
                    <Link href="/" className="font-[family-name:var(--font-body)] text-frost-muted hover:text-electric transition-colors">Home</Link>
                    <Link href="/projects" className="font-[family-name:var(--font-body)] text-frost-muted hover:text-electric transition-colors">Projects</Link>
                    <Link href="/resources" className="font-[family-name:var(--font-body)] text-frost-muted hover:text-electric transition-colors">Resources</Link>
                    <Link href="/code-editor" className="font-[family-name:var(--font-body)] text-frost-muted hover:text-electric transition-colors">Code Editor</Link>
                    <Link href="/arduino-lab" className="font-[family-name:var(--font-body)] text-frost-muted hover:text-electric transition-colors">Arduino Lab</Link>
                </div>

                <div className="border-t border-midnight-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="font-[family-name:var(--font-body)] text-sm text-frost-muted">
                        © 2025 JH Portfolio. All Rights Reserved.
                    </p>
                    <p className="font-[family-name:var(--font-mono)] text-xs text-frost-muted flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                        Built with React + TypeScript + Tailwind
                    </p>
                </div>
            </div>
        </footer>
    );
}

// ==================== MAIN PAGE ====================
export default function HomeMidnight() {
    return (
        <div className="min-h-screen bg-midnight">
            <Navigation />
            <Hero />
            <Services />
            <GitHubStatus />
            <LiveProjectAnalytics />
            <FeaturedProjects />
            <YouTubeShowcase />
            <CTA />
            <Footer />
        </div>
    );
}
