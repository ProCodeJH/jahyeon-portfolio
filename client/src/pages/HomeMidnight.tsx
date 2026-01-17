import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import {
    ArrowRight, Code, Zap, CircuitBoard, GraduationCap, Terminal, Github, Linkedin, Mail,
    ChevronRight, Activity, Star, GitFork, ExternalLink, Cpu, Database, Globe, Layers,
    Smartphone, Server, Cloud, Braces
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
function useGitHubStats() {
    const [stats, setStats] = useState<{
        repos: GitHubRepo[];
        totalStars: number;
        totalRepos: number;
        contributions: number;
        loading: boolean;
    }>({
        repos: [],
        totalStars: 0,
        totalRepos: 0,
        contributions: 0,
        loading: true,
    });

    useEffect(() => {
        const fetchGitHubData = async () => {
            try {
                // Using GitHub API to fetch user data
                const userRes = await fetch('https://api.github.com/users/ProCodeJH');
                const userData = await userRes.json();

                const reposRes = await fetch('https://api.github.com/users/ProCodeJH/repos?sort=stars&per_page=6');
                const reposData = await reposRes.json();

                if (Array.isArray(reposData)) {
                    const formattedRepos: GitHubRepo[] = reposData.slice(0, 4).map((repo: any) => ({
                        name: repo.name,
                        description: repo.description || 'No description',
                        stars: repo.stargazers_count,
                        forks: repo.forks_count,
                        language: repo.language || 'Unknown',
                        url: repo.html_url,
                    }));

                    setStats({
                        repos: formattedRepos,
                        totalStars: reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0),
                        totalRepos: userData.public_repos || reposData.length,
                        contributions: 500, // Approximate - actual would need GraphQL API
                        loading: false,
                    });
                }
            } catch (error) {
                console.error('GitHub API error:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchGitHubData();
    }, []);

    return stats;
}

// ==================== COMPONENTS ====================

function Hero() {
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
                        {/* Terminal Badge */}
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-midnight-card/80 backdrop-blur-xl border border-electric/20 mb-10 shadow-[0_0_40px_rgba(0,255,136,0.1)]">
                            <div className="flex gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <span className="w-3 h-3 rounded-full bg-electric/80" />
                            </div>
                            <span className="font-[family-name:var(--font-mono)] text-sm text-frost/70">
                                ~/gu-jahyeon
                            </span>
                            <span className="w-2 h-4 bg-electric animate-pulse" />
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
                            <div className="absolute -inset-4 bg-gradient-to-r from-electric via-accent-cyan to-accent-indigo rounded-full blur-2xl opacity-30 animate-pulse" />

                            {/* Main Logo Container */}
                            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-midnight-card to-midnight border-2 border-electric/30 flex items-center justify-center shadow-[0_0_80px_rgba(0,255,136,0.2)]">
                                <div className="text-center">
                                    <div className="font-[family-name:var(--font-heading)] text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-electric to-accent-cyan">
                                        JH
                                    </div>
                                    <div className="font-[family-name:var(--font-mono)] text-sm text-frost-muted mt-2">
                                        구자현
                                    </div>
                                    <div className="mt-4 flex justify-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                                        <span className="font-[family-name:var(--font-mono)] text-xs text-electric">ONLINE</span>
                                    </div>
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
                            <p className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-black text-electric">LG</p>
                            <p className="font-[family-name:var(--font-body)] text-frost-muted mt-2">Former Engineer</p>
                        </div>
                        <div className="text-center">
                            <p className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric to-accent-cyan">50+</p>
                            <p className="font-[family-name:var(--font-body)] text-frost-muted mt-2">Projects Built</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ServiceCard({ title, description, icon: Icon, gradient }: ServiceCardProps) {
    return (
        <div className={`group relative p-8 rounded-3xl bg-gradient-to-br ${gradient} backdrop-blur-xl border border-frost/5 hover:border-electric/30 transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,255,136,0.1)]`}>
            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-electric/10 rounded-bl-[80px] rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-electric/10 border border-electric/20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-electric/20 transition-all duration-500">
                    <Icon className="w-8 h-8 text-electric" />
                </div>

                <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-frost mb-4 group-hover:text-electric transition-colors duration-300">
                    {title}
                </h3>

                <p className="font-[family-name:var(--font-body)] text-frost-muted leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}

function Services() {
    return (
        <section className="py-32 bg-midnight relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-electric/5 rounded-full blur-[200px] -translate-y-1/2" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <span className="inline-block font-[family-name:var(--font-mono)] text-electric text-sm tracking-wider uppercase mb-4">What I Do</span>
                    <h2 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-black text-frost mb-6">
                        Expertise
                    </h2>
                    <p className="font-[family-name:var(--font-body)] text-lg text-frost-muted max-w-2xl mx-auto">
                        Bridging hardware and software with comprehensive full-stack capabilities
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>
            </div>
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
    const { repos, totalStars, totalRepos, loading } = useGitHubStats();

    return (
        <section className="py-32 bg-midnight-card relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,255,136,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-16">
                    <div>
                        <span className="inline-block font-[family-name:var(--font-mono)] text-electric text-sm tracking-wider uppercase mb-4">Live Activity</span>
                        <h2 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-black text-frost mb-4">
                            GitHub Status
                        </h2>
                        <p className="font-[family-name:var(--font-body)] text-lg text-frost-muted">
                            Real-time activity and recent projects
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex gap-4">
                        <div className="p-6 rounded-2xl bg-midnight border border-midnight-border">
                            <div className="flex items-center gap-2 mb-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="font-[family-name:var(--font-mono)] text-2xl font-bold text-frost">{loading ? '...' : totalStars}</span>
                            </div>
                            <span className="font-[family-name:var(--font-body)] text-sm text-frost-muted">Total Stars</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-midnight border border-midnight-border">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-electric" />
                                <span className="font-[family-name:var(--font-mono)] text-2xl font-bold text-frost">{loading ? '...' : totalRepos}</span>
                            </div>
                            <span className="font-[family-name:var(--font-body)] text-sm text-frost-muted">Repositories</span>
                        </div>
                    </div>
                </div>

                {/* Repos Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-midnight border border-midnight-border animate-pulse">
                                <div className="h-6 w-32 bg-midnight-border rounded mb-3" />
                                <div className="h-4 w-full bg-midnight-border rounded mb-2" />
                                <div className="h-4 w-2/3 bg-midnight-border rounded" />
                            </div>
                        ))
                    ) : (
                        repos.map((repo, i) => (
                            <a
                                key={i}
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-6 rounded-2xl bg-midnight border border-midnight-border hover:border-electric/30 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-frost group-hover:text-electric transition-colors">
                                        {repo.name}
                                    </h3>
                                    <ExternalLink className="w-4 h-4 text-frost-muted group-hover:text-electric transition-colors" />
                                </div>
                                <p className="font-[family-name:var(--font-body)] text-sm text-frost-muted mb-4 line-clamp-2">
                                    {repo.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1 text-frost-muted">
                                        <span className="w-3 h-3 rounded-full bg-electric" />
                                        {repo.language}
                                    </span>
                                    <span className="flex items-center gap-1 text-frost-muted">
                                        <Star className="w-3 h-3" />
                                        {repo.stars}
                                    </span>
                                    <span className="flex items-center gap-1 text-frost-muted">
                                        <GitFork className="w-3 h-3" />
                                        {repo.forks}
                                    </span>
                                </div>
                            </a>
                        ))
                    )}
                </div>

                <div className="text-center mt-12">
                    <a href="https://github.com/ProCodeJH" target="_blank" rel="noopener noreferrer">
                        <Button className="font-[family-name:var(--font-heading)] px-8 py-4 bg-transparent border-2 border-electric text-electric rounded-2xl font-semibold hover:bg-electric hover:text-midnight transition-all h-auto">
                            <Github className="w-5 h-5 mr-2" />
                            View All Repositories
                        </Button>
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
                    {/* Logo & Name */}
                    <div>
                        <div className="font-[family-name:var(--font-heading)] text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric to-accent-cyan mb-2">
                            JH
                        </div>
                        <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-frost">
                            Gu Jahyeon
                        </h3>
                        <p className="font-[family-name:var(--font-body)] text-frost-muted">
                            구자현 • Embedded Developer
                        </p>
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
                        © 2025 Gu Jahyeon. All Rights Reserved.
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
            <TechStack />
            <GitHubStatus />
            <FeaturedProjects />
            <CTA />
            <Footer />
        </div>
    );
}
