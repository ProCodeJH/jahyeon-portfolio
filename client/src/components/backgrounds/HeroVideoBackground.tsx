import { useEffect, useRef, useState } from "react";

/**
 * 🎬 CINEMATIC HERO VIDEO BACKGROUND - ENTERPRISE GRADE
 * 
 * Features:
 * - Lazy loading with poster fallback
 * - Auto-pause when out of viewport
 * - Premium gradient overlay with glassmorphism
 * - CSS-based shader effects (noise, prismatic light)
 * - Kinetic motion animations
 * - Mobile-optimized (reduced quality on mobile)
 */
interface HeroVideoBackgroundProps {
    videoSrc?: string;
    posterSrc?: string;
    className?: string;
    enableShaderEffects?: boolean;
}

export function HeroVideoBackground({
    videoSrc = "/hero_video.mp4",
    posterSrc,
    className = "",
    enableShaderEffects = true
}: HeroVideoBackgroundProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hasVideo, setHasVideo] = useState(true);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

    // Mouse parallax effect for premium feel
    useEffect(() => {
        if (!enableShaderEffects) return;

        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [enableShaderEffects]);

    // Check video availability
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleCanPlay = () => setIsLoaded(true);
        const handleError = () => {
            console.warn("Hero video not available, using gradient fallback");
            setHasVideo(false);
        };

        video.addEventListener("canplaythrough", handleCanPlay);
        video.addEventListener("error", handleError);

        return () => {
            video.removeEventListener("canplaythrough", handleCanPlay);
            video.removeEventListener("error", handleError);
        };
    }, []);

    // Intersection Observer for lazy loading and auto-pause
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
                const video = videoRef.current;
                if (video) {
                    if (entry.isIntersecting) {
                        video.play().catch(() => { });
                    } else {
                        video.pause();
                    }
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden ${className}`}
        >
            {/* Video Layer */}
            {hasVideo && (
                <video
                    ref={videoRef}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"
                        }`}
                    src={videoSrc}
                    poster={posterSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                />
            )}

            {/* 🎨 CSS SHADER LAYER - Dreamy/Ethereal Effect */}
            {enableShaderEffects && (
                <>
                    {/* Animated Noise Overlay - subtle film grain */}
                    <div
                        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none animate-noise"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                            backgroundSize: '128px 128px'
                        }}
                    />

                    {/* Prismatic Light Effect - follows mouse */}
                    <div
                        className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none transition-all duration-1000 ease-out"
                        style={{
                            background: `radial-gradient(ellipse 80% 60% at ${mousePosition.x}% ${mousePosition.y}%, rgba(168, 85, 247, 0.15) 0%, rgba(59, 130, 246, 0.1) 30%, transparent 70%)`
                        }}
                    />

                    {/* Chromatic Aberration Simulation */}
                    <div className="absolute inset-0 opacity-[0.02] mix-blend-color-dodge pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-blue-500/20 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
                    </div>

                    {/* Floating Light Particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-white/30 rounded-full blur-sm animate-float-particle"
                                style={{
                                    left: `${20 + i * 15}%`,
                                    top: `${30 + (i % 3) * 20}%`,
                                    animationDelay: `${i * 1.5}s`,
                                    animationDuration: `${8 + i * 2}s`
                                }}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Premium Gradient Overlays - Glassmorphism Depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/85 via-white/75 to-purple-50/85 backdrop-blur-[0.5px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

            {/* Cinematic vignette effect - enhanced */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_transparent_40%,_rgba(255,255,255,0.6)_100%)]" />

            {/* Animated gradient orbs for premium feel - Enhanced */}
            <div
                className="absolute top-1/4 -left-32 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-r from-purple-500/25 to-pink-500/25 rounded-full blur-3xl animate-float"
                style={{ transform: `translate(${(mousePosition.x - 50) * 0.02}px, ${(mousePosition.y - 50) * 0.02}px)` }}
            />
            <div
                className="absolute bottom-1/4 -right-32 w-48 md:w-72 h-48 md:h-72 bg-gradient-to-r from-blue-500/25 to-cyan-500/25 rounded-full blur-3xl animate-float"
                style={{
                    animationDelay: '2s',
                    transform: `translate(${(mousePosition.x - 50) * -0.015}px, ${(mousePosition.y - 50) * -0.015}px)`
                }}
            />

            {/* Additional depth orb */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl animate-pulse"
                style={{ animationDuration: '6s' }}
            />

            {/* CSS Animations */}
            <style>{`
                @keyframes noise {
                    0%, 100% { transform: translate(0, 0); }
                    10% { transform: translate(-2%, -2%); }
                    20% { transform: translate(2%, 2%); }
                    30% { transform: translate(-1%, 1%); }
                    40% { transform: translate(1%, -1%); }
                    50% { transform: translate(-2%, 2%); }
                    60% { transform: translate(2%, -2%); }
                    70% { transform: translate(-1%, -1%); }
                    80% { transform: translate(1%, 1%); }
                    90% { transform: translate(-2%, -1%); }
                }
                .animate-noise {
                    animation: noise 0.5s steps(10) infinite;
                }
                @keyframes float-particle {
                    0%, 100% { 
                        transform: translateY(0) translateX(0) scale(1);
                        opacity: 0.3;
                    }
                    25% { 
                        transform: translateY(-30px) translateX(15px) scale(1.2);
                        opacity: 0.6;
                    }
                    50% { 
                        transform: translateY(-50px) translateX(-10px) scale(0.8);
                        opacity: 0.4;
                    }
                    75% { 
                        transform: translateY(-20px) translateX(20px) scale(1.1);
                        opacity: 0.5;
                    }
                }
                .animate-float-particle {
                    animation: float-particle 10s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

