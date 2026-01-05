import { useRef, useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function FuturisticHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Scroll Progress for Parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Parallax Transforms
    const textY = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const robotScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    // Mouse Interaction (Damping)
    const springConfig = { damping: 20, stiffness: 100 };
    const mouseX = useSpring(0, springConfig);
    const mouseY = useSpring(0, springConfig);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        mouseX.set((clientX / innerWidth - 0.5) * 20); // -10 to 10 deg
        mouseY.set((clientY / innerHeight - 0.5) * 20);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[150vh] bg-[#050505] overflow-hidden font-sans selection:bg-blue-500/30"
            onMouseMove={handleMouseMove}
        >
            {/* 
        NOISE TEXTURE OVERLAY 
        Adds cinematic grain using CSS noise pattern
      */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.07] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* 
        LAYER 1: BACKGROUND TYPOGRAPHY (Parallax)
        Massive text behind the robot
      */}
            <motion.div
                style={{ y: textY, opacity: textOpacity } as any}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none"
            >
                <div className="w-full max-w-[1600px] px-6 relative h-full flex flex-col justify-between py-32">
                    {/* Top Text */}
                    <h1 className="text-[10vw] md:text-[8vw] leading-[0.85] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent text-center md:text-left">
                        EMBEDDED<br />INTELLIGENCE
                    </h1>

                    {/* Bottom Text */}
                    <h1 className="text-[10vw] md:text-[8vw] leading-[0.85] font-black tracking-tighter text-white/5 text-center md:text-right">
                        LOW-LEVEL<br />OPTIMIZATION
                    </h1>
                </div>
            </motion.div>

            {/* 
        LAYER 2: SPLINE 3D SCENE
        The Robot Centerpiece
        Note: Using a placeholder URL. User needs to replace this.
      */}
            <div className="absolute inset-0 z-20 flex items-center justify-center">
                <motion.div
                    style={{ scale: robotScale } as any}
                    className="w-full h-screen relative"
                >
                    {/* 
            TODO: REPLACE WITH YOUR ROBOT URL 
            Current: Shape placeholder
          */}
                    <Spline
                        scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
                        className="w-full h-full"
                    />

                    {/* Fallback/Loading overlay could go here */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-blue-400/50 text-xs uppercase tracking-widest animate-pulse">
                        Initializing Neural Link...
                    </div>
                </motion.div>
            </div>

            {/* 
        LAYER 3: FOREGROUND OVERLAY TEXT (Artistic)
        Text that sits 'on top' or blends with the robot
      */}
            <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
                <div className="relative">
                    <h2 className="text-6xl md:text-9xl font-bold tracking-tighter text-white mix-blend-overlay opacity-80 backdrop-blur-[2px]">
                        AI ARCHITECT
                    </h2>
                    <h3 className="text-4xl md:text-7xl font-bold tracking-tighter text-blue-500 mix-blend-color-dodge opacity-60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                        SYSTEM OS
                    </h3>
                </div>
            </div>

            {/* 
        LAYER 4: UI & NAVIGATION (Glassmorphism)
      */}
            <nav className="absolute top-0 left-0 w-full z-40 px-6 py-8 flex justify-between items-center">
                <div className="text-white font-mono text-sm tracking-widest border border-white/20 px-4 py-1 rounded-full backdrop-blur-md bg-white/5">
                    JAHYEON_PORTFOLIO_V2.0
                </div>

                <div className="hidden md:flex gap-8">
                    {['PROJECTS', 'ABOUT', 'CONTACT'].map((item) => (
                        <button
                            key={item}
                            className="text-white/60 hover:text-white text-xs font-bold tracking-[0.2em] transition-colors relative group"
                        >
                            {item}
                            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-blue-500 transition-all group-hover:w-full" />
                        </button>
                    ))}
                </div>
            </nav>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-6 z-40 text-white/40 font-mono text-xs flex flex-col gap-2">
                <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-white/50 to-transparent mx-auto" />
                SCROLL TO EXPLORE
            </div>
        </div>
    );
}
