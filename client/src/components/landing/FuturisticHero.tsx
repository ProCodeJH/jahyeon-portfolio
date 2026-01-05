import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function FuturisticHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Scroll Progress
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Parallax & Fade Effects
    const textY = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const videoScale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
    const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-screen overflow-hidden bg-white selection:bg-blue-600 selection:text-white"
        >
            {/* 
        BACKGROUND LAYER
        Concept: "Tech in the Mist"
        Video is subtle, grayscale, overlayed with white to keep it bright.
      */}
            <div className="absolute inset-0 z-0">
                <motion.div style={{ scale: videoScale } as any} className="w-full h-full">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover filter grayscale contrast-125 opacity-20"
                    >
                        <source src="/hero-video.mp4" type="video/mp4" />
                    </video>
                </motion.div>

                {/* Soft White Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
            </div>

            {/* 
        MAIN CONTENT
        Style: Modern Minimalist, High Contrast, Vibrant Accents
      */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 md:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ y: textY } as any}
                    className="text-center w-full max-w-7xl mx-auto"
                >
                    {/* Top Label */}
                    <motion.div variants={itemVariants} className="mb-6 md:mb-8 flex justify-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50/50 backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                            </span>
                            <span className="text-xs md:text-sm font-bold tracking-widest text-blue-600 uppercase">
                                System Architecture v2.0
                            </span>
                        </div>
                    </motion.div>

                    {/* Massive Headline */}
                    <motion.h1 variants={itemVariants} className="text-[12vw] md:text-[8vw] leading-[0.85] font-black tracking-tighter text-slate-900 mb-6 md:mb-10">
                        EMBEDDED
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 pb-2 block transform hover:scale-[1.02] transition-transform duration-500 cursor-default">
                            INTELLIGENCE
                        </span>
                    </motion.h1>

                    {/* Subtitle / Description */}
                    <motion.p variants={itemVariants} className="max-w-xl mx-auto text-slate-500 text-lg md:text-2xl font-normal leading-relaxed mb-12">
                        Bridging the gap between hardware reality and software abstraction with
                        <span className="text-slate-900 font-semibold mx-1.5 border-b-2 border-blue-500/30">precision</span>
                        and
                        <span className="text-slate-900 font-semibold mx-1.5 border-b-2 border-blue-500/30">elegance</span>.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 items-center justify-center">
                        <button className="group relative px-8 py-4 bg-slate-900 text-white text-sm md:text-base font-bold tracking-wide rounded-full overflow-hidden shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative flex items-center gap-2">
                                EXPLORE PORTFOLIO
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </span>
                        </button>

                        <button className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-600 text-sm md:text-base font-bold tracking-wide rounded-full hover:border-slate-300 hover:bg-slate-50 transition-all duration-300">
                            CONTACT ME
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* 
        NAVIGATION (Light Theme)
        Minimalist floating nav
      */}
            <nav className="absolute top-0 left-0 w-full z-40 px-6 py-8 flex justify-between items-center text-slate-900">
                <a href="/" className="font-black text-xl tracking-tighter flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono text-sm group-hover:bg-blue-600 transition-colors">
                        JH
                    </div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0 duration-300">
                        PORTFOLIO
                    </span>
                </a>

                <div className="hidden md:flex gap-10">
                    {['ABOUT', 'PROJECTS', 'EXPERTISE', 'CONTACT'].map((item) => (
                        <button
                            key={item}
                            className="text-slate-500 hover:text-blue-600 text-xs font-bold tracking-[0.15em] transition-colors relative group py-2"
                        >
                            {item}
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full" />
                        </button>
                    ))}
                </div>
            </nav>

            {/* DECORATIVE ELEMENTS */}
            {/* Corner Glows */}
            <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-blue-100/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-indigo-100/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* SCROLL INDICATOR (Dark) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3"
            >
                <span className="text-[10px] tracking-[0.3em] font-medium text-slate-400 uppercase">Scroll Down</span>
                <div className="w-[1px] h-16 bg-slate-200 overflow-hidden relative">
                    <motion.div
                        animate={{ y: [0, 64] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-full h-1/2 bg-blue-600 absolute top-[-50%]"
                    />
                </div>
            </motion.div>
        </div>
    );
}
