import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';

export default function FuturisticHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [location] = useLocation();

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const textY = useTransform(scrollYProgress, [0, 1], [0, 150]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const navItems = [
        { label: 'PROJECTS', href: '/projects' },
        { label: 'RESOURCES', href: '/resources' },
        { label: 'CERTIFICATIONS', href: '/certifications' },
        { label: 'CODE EDITOR', href: '/code-editor' },
        { label: 'CIRCUIT LAB', href: '/circuit-lab' },
        { label: 'ADMIN', href: '/admin' },
    ];

    return (
        <div
            ref={containerRef}
            className="relative w-full h-screen overflow-hidden bg-black font-sans selection:bg-blue-500/50"
        >
            {/* BACKGROUND VIDEO */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-105"
                >
                    <source src="/hero-video.mp4" type="video/mp4" />
                </video>

                {/* Cinematic Overlay - Dark & Blue Tint */}
                <div className="absolute inset-0 bg-blue-950/30 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
            </div>

            {/* TYPOGRAPHY */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4">
                <motion.div
                    style={{ y: textY } as any}
                    className="text-center space-y-4"
                >
                    <h2 className="text-blue-400 font-bold tracking-[0.3em] text-sm md:text-xl uppercase animate-pulse">
                        System Architecture & AI
                    </h2>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.9]">
                        EMBEDDED<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 filter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                            INTELLIGENCE
                        </span>
                    </h1>

                    <p className="max-w-xl mx-auto text-gray-200 text-base md:text-xl font-light tracking-wide pt-6 leading-relaxed mix-blend-overlay">
                        Optimizing the boundary between Hardware and Software
                    </p>
                </motion.div>
            </div>

            {/* NAVIGATION - Overlay Style */}
            <nav className="absolute top-0 left-0 w-full z-40 px-6 py-8 flex justify-between items-center text-white mix-blend-difference">
                <Link href="/">
                    <div className="font-mono text-sm tracking-widest border border-white/50 px-4 py-1 rounded-full cursor-pointer hover:bg-white hover:text-black transition-colors">
                        JAHYEON_PORTFOLIO
                    </div>
                </Link>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex gap-8">
                    {navItems.map((item) => (
                        <Link key={item.label} href={item.href}>
                            <button className="text-white/80 hover:text-white text-xs font-bold tracking-[0.2em] transition-colors relative group">
                                {item.label}
                                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all group-hover:w-full" />
                            </button>
                        </Link>
                    ))}
                </div>

                {/* MOBILE NAV TOGGLE */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(true)}>
                        <Menu className="w-8 h-8 text-white" />
                    </button>
                </div>
            </nav>

            {/* MOBILE MENU OVERLAY */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ duration: 0.3, ease: 'circOut' }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-auto"
                        {...({} as any)}
                    >
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute top-8 right-6 text-white hover:text-blue-500"
                        >
                            <X className="w-10 h-10" />
                        </button>

                        <div className="flex flex-col items-center gap-8">
                            {navItems.map((item) => (
                                <Link key={item.label} href={item.href}>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-2xl md:text-4xl font-black text-white hover:text-blue-500 tracking-tighter hover:tracking-wide transition-all duration-300"
                                    >
                                        {item.label}
                                    </button>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SCROLL INDICATOR */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 text-white mix-blend-difference pointer-events-none">
                <span className="text-[10px] tracking-[0.3em] font-light uppercase opacity-70">Scroll To Explore</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white via-white/50 to-transparent" />
            </div>
        </div>
    );
}

