import { useState, useEffect, useRef } from "react";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

// Tech stack data
const technologies = [
    { name: "React", color: "#61DAFB", category: "Frontend" },
    { name: "TypeScript", color: "#3178C6", category: "Frontend" },
    { name: "Vite", color: "#646CFF", category: "Frontend" },
    { name: "TailwindCSS", color: "#06B6D4", category: "Frontend" },
    { name: "Three.js", color: "#000000", category: "Frontend" },
    { name: "NestJS", color: "#E0234E", category: "Backend" },
    { name: "Prisma", color: "#2D3748", category: "Backend" },
    { name: "Socket.IO", color: "#010101", category: "Backend" },
    { name: "PostgreSQL", color: "#336791", category: "Database" },
    { name: "Supabase", color: "#3ECF8E", category: "Database" },
    { name: "Vercel", color: "#000000", category: "Deploy" },
    { name: "Render", color: "#46E3B7", category: "Deploy" },
];

const codeLines = [
    { text: "import { NestFactory } from '@nestjs/core';", delay: 0 },
    { text: "import { AppModule } from './app.module';", delay: 100 },
    { text: "", delay: 200 },
    { text: "async function bootstrap() {", delay: 300 },
    { text: "  const app = await NestFactory.create(AppModule);", delay: 400 },
    { text: "  app.enableCors({ origin: '*' });", delay: 500 },
    { text: "  await app.listen(3001);", delay: 600 },
    { text: "  console.log('🚀 Server running...');", delay: 700 },
    { text: "}", delay: 800 },
    { text: "", delay: 900 },
    { text: "bootstrap();", delay: 1000 },
];

// Typing animation hook
function useTypingEffect(text: string, speed: number = 30, delay: number = 0) {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const startTyping = () => {
            let i = 0;
            const type = () => {
                if (i < text.length) {
                    setDisplayedText(text.slice(0, i + 1));
                    i++;
                    timeout = setTimeout(type, speed);
                } else {
                    setIsComplete(true);
                }
            };
            type();
        };

        const delayTimeout = setTimeout(startTyping, delay);
        return () => {
            clearTimeout(timeout);
            clearTimeout(delayTimeout);
        };
    }, [text, speed, delay]);

    return { displayedText, isComplete };
}

// Syntax highlighting
function highlightCode(code: string) {
    return code
        .replace(/(import|from|async|function|await|const|new)/g, '<span class="text-purple-400">$1</span>')
        .replace(/('.*?')/g, '<span class="text-emerald-400">$1</span>')
        .replace(/(console|app)/g, '<span class="text-cyan-400">$1</span>')
        .replace(/(\{|\}|\(|\)|=>|;)/g, '<span class="text-gray-500">$1</span>');
}

// Code Terminal Component
function CodeTerminal() {
    const [visibleLines, setVisibleLines] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleLines(prev => {
                if (prev >= codeLines.length) {
                    // Reset after showing all
                    setTimeout(() => setVisibleLines(0), 3000);
                    return prev;
                }
                return prev + 1;
            });
        }, 150);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
            {/* Terminal Window */}
            <div className="relative rounded-2xl overflow-hidden bg-[#0d1117] border border-white/10 shadow-2xl shadow-purple-500/20">
                {/* Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-2xl opacity-20 blur-xl animate-pulse" />

                {/* Header */}
                <div className="relative flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-white/10">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    </div>
                    <span className="ml-2 text-xs text-gray-500 font-mono">main.ts — NestJS Server</span>
                    <div className="ml-auto flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-emerald-400 font-mono">LIVE</span>
                    </div>
                </div>

                {/* Code Area */}
                <div className="relative p-6 font-mono text-sm overflow-hidden" style={{ minHeight: '320px' }}>
                    {/* Scanlines effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,_rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />

                    {codeLines.slice(0, visibleLines).map((line, i) => (
                        <div key={i} className="flex items-center gap-4 leading-7">
                            <span className="w-6 text-right text-gray-600 select-none text-xs">{i + 1}</span>
                            <span
                                className="text-gray-300"
                                dangerouslySetInnerHTML={{ __html: highlightCode(line.text) || '&nbsp;' }}
                            />
                            {i === visibleLines - 1 && (
                                <span className="w-2 h-5 bg-purple-400 animate-pulse" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Orbital Tech Ring
function TechOrbit() {
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => (prev + 0.3) % 360);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full aspect-square max-w-lg mx-auto">
            {/* Central Glow */}
            <div className="absolute inset-1/3 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 blur-3xl opacity-40 animate-pulse" />

            {/* Center Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                    <span className="text-4xl md:text-5xl font-black text-white">JH</span>
                </div>
            </div>

            {/* Orbiting circles */}
            {[0, 1, 2].map((ring) => (
                <div
                    key={ring}
                    className="absolute inset-0 rounded-full border border-white/5"
                    style={{
                        transform: `scale(${0.6 + ring * 0.25})`,
                    }}
                />
            ))}

            {/* Orbiting Technologies */}
            {technologies.slice(0, 8).map((tech, i) => {
                const angle = (rotation + i * 45) * (Math.PI / 180);
                const radius = 42;
                const x = 50 + radius * Math.cos(angle);
                const y = 50 + radius * Math.sin(angle);

                return (
                    <div
                        key={tech.name}
                        className="absolute w-14 h-14 md:w-16 md:h-16 rounded-xl bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-xl transition-all duration-300 hover:scale-125 hover:z-30 group cursor-pointer"
                        style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            transform: 'translate(-50%, -50%)',
                            boxShadow: `0 0 20px ${tech.color}40`,
                        }}
                    >
                        <span className="text-[10px] md:text-xs font-bold truncate px-1">{tech.name}</span>

                        {/* Hover tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/90 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                            {tech.category}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Matrix-style falling code
function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>{}[]();';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops: number[] = Array(Math.floor(columns)).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(10, 10, 26, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#a855f720';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        />
    );
}

// Stats Counter Animation
function AnimatedStat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let start = 0;
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * value));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }, [isVisible, value]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                {count}{suffix}
            </div>
            <p className="text-gray-500 mt-2 font-medium">{label}</p>
        </div>
    );
}

export function LiveTechStack() {
    return (
        <section className="py-32 md:py-48 px-4 md:px-8 relative overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#0d0d20] to-[#0a0a1a]">
            {/* Matrix Rain Background */}
            <MatrixRain />

            {/* Gradient Orbs */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <AnimatedSection>
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-sm text-gray-400 font-medium">Production Ready</span>
                        </div>

                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
                            <span className="block text-white">Built with</span>
                            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-gradient-x">
                                Modern Stack
                            </span>
                        </h2>
                    </div>
                </AnimatedSection>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left: Tech Orbit */}
                    <AnimatedSection delay={100}>
                        <TechOrbit />
                    </AnimatedSection>

                    {/* Right: Code Terminal */}
                    <AnimatedSection delay={200}>
                        <CodeTerminal />
                    </AnimatedSection>
                </div>

                {/* Stats Row */}
                <AnimatedSection delay={300}>
                    <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <AnimatedStat value={15} label="Technologies" suffix="+" />
                        <AnimatedStat value={25} label="API Routes" suffix="+" />
                        <AnimatedStat value={50} label="Components" suffix="+" />
                        <AnimatedStat value={100} label="Type Safe" suffix="%" />
                    </div>
                </AnimatedSection>

                {/* Tech Pills */}
                <AnimatedSection delay={400}>
                    <div className="mt-20 flex flex-wrap justify-center gap-3">
                        {technologies.map((tech, i) => (
                            <div
                                key={tech.name}
                                className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white font-medium text-sm hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
                                style={{
                                    animationDelay: `${i * 50}ms`,
                                    boxShadow: `inset 0 0 20px ${tech.color}10`
                                }}
                            >
                                {tech.name}
                            </div>
                        ))}
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
