import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * 🚀 ENTERPRISE-GRADE SMOOTH SCROLL HOOK
 * 
 * Combines Lenis for buttery smooth scrolling with GSAP ScrollTrigger
 * for cinematic scroll-based animations.
 * 
 * Features:
 * - 120fps smooth scrolling
 * - Inertia-based physics
 * - GSAP ScrollTrigger integration
 * - Mobile-optimized
 */
export function useSmoothScroll() {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Initialize Lenis
        lenisRef.current = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        // Sync Lenis with GSAP ScrollTrigger
        lenisRef.current.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenisRef.current?.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        // Cleanup
        return () => {
            lenisRef.current?.destroy();
            gsap.ticker.remove(() => { });
        };
    }, []);

    return lenisRef;
}

/**
 * 🎬 SCROLL ANIMATION HOOK
 * 
 * Applies cinematic scroll-triggered animations to elements.
 * Uses GSAP ScrollTrigger for professional-grade effects.
 */
export function useScrollAnimation(
    selector: string,
    options?: {
        start?: string;
        end?: string;
        scrub?: boolean | number;
    }
) {
    useEffect(() => {
        const elements = document.querySelectorAll(selector);

        elements.forEach((element) => {
            gsap.fromTo(
                element,
                {
                    opacity: 0,
                    y: 50,
                    scale: 0.95,
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: options?.start || 'top 85%',
                        end: options?.end || 'bottom 15%',
                        scrub: options?.scrub ?? false,
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [selector, options]);
}

/**
 * 🌊 PARALLAX SCROLL HOOK
 * 
 * Creates depth-based parallax effects for immersive visuals.
 */
export function useParallax(selector: string, speed: number = 0.5) {
    useEffect(() => {
        const elements = document.querySelectorAll(selector);

        elements.forEach((element) => {
            gsap.to(element, {
                y: () => (1 - speed) * 200,
                ease: 'none',
                scrollTrigger: {
                    trigger: element,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [selector, speed]);
}

export { gsap, ScrollTrigger };
