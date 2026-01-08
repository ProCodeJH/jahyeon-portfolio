import { useEffect, useRef, useState } from "react";

/**
 * 🎬 CINEMATIC HERO VIDEO BACKGROUND
 * 
 * Features:
 * - Lazy loading with poster fallback
 * - Auto-pause when out of viewport
 * - Premium gradient overlay
 * - Mobile-optimized (reduced quality on mobile)
 */
interface HeroVideoBackgroundProps {
    videoSrc?: string;
    posterSrc?: string;
    className?: string;
}

export function HeroVideoBackground({
    videoSrc = "/hero_video.mp4",
    posterSrc,
    className = ""
}: HeroVideoBackgroundProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hasVideo, setHasVideo] = useState(true);

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

            {/* Premium Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/90 via-white/80 to-purple-50/90" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />

            {/* Cinematic vignette effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(255,255,255,0.5)_100%)]" />

            {/* Animated gradient orbs for premium feel */}
            <div className="absolute top-1/4 -left-32 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 -right-32 w-48 md:w-72 h-48 md:h-72 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
    );
}
