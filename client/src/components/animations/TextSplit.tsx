import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TextSplitProps {
    children: string;
    className?: string;
    delay?: number;
    stagger?: number;
    trigger?: 'load' | 'scroll';
}

/**
 * 🔤 ENTERPRISE TEXT SPLIT ANIMATION
 * 
 * Animates text character by character or word by word
 * with staggered reveal effects for premium typography.
 */
export function TextSplit({
    children,
    className = '',
    delay = 0,
    stagger = 0.03,
    trigger = 'load'
}: TextSplitProps) {
    const containerRef = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!containerRef.current || hasAnimated.current) return;

        const chars = containerRef.current.querySelectorAll('.char');

        const animation = {
            opacity: 0,
            y: 80,
            rotateX: -90,
            transformOrigin: '50% 50% -50px',
        };

        const target = {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: stagger,
            delay: delay,
        };

        if (trigger === 'scroll') {
            gsap.fromTo(chars, animation, {
                ...target,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
            });
        } else {
            gsap.fromTo(chars, animation, target);
        }

        hasAnimated.current = true;

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [children, delay, stagger, trigger]);

    // Split text into individual characters
    const splitText = children.split('').map((char, i) => (
        <span
            key={i}
            className="char inline-block"
            style={{ opacity: 0 }}
        >
            {char === ' ' ? '\u00A0' : char}
        </span>
    ));

    return (
        <span ref={containerRef} className={`inline-block ${className}`} style={{ perspective: '1000px' }}>
            {splitText}
        </span>
    );
}

interface WordSplitProps {
    children: string;
    className?: string;
    delay?: number;
    stagger?: number;
}

/**
 * 📝 WORD-BY-WORD REVEAL ANIMATION
 */
export function WordSplit({
    children,
    className = '',
    delay = 0,
    stagger = 0.08
}: WordSplitProps) {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const words = containerRef.current.querySelectorAll('.word');

        gsap.fromTo(
            words,
            {
                opacity: 0,
                y: 40,
                filter: 'blur(10px)',
            },
            {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.6,
                ease: 'power2.out',
                stagger: stagger,
                delay: delay,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [children, delay, stagger]);

    const splitWords = children.split(' ').map((word, i) => (
        <span key={i} className="word inline-block mr-[0.25em]" style={{ opacity: 0 }}>
            {word}
        </span>
    ));

    return (
        <span ref={containerRef} className={`inline-block ${className}`}>
            {splitWords}
        </span>
    );
}

interface LineRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
}

/**
 * 📐 LINE REVEAL ANIMATION
 * 
 * Reveals content with a clip-path animation for cinematic effect.
 */
export function LineReveal({
    children,
    className = '',
    delay = 0,
    direction = 'up'
}: LineRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const clipPaths = {
            up: { from: 'inset(100% 0 0 0)', to: 'inset(0% 0 0 0)' },
            down: { from: 'inset(0 0 100% 0)', to: 'inset(0 0 0% 0)' },
            left: { from: 'inset(0 100% 0 0)', to: 'inset(0 0% 0 0)' },
            right: { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0%)' },
        };

        gsap.fromTo(
            containerRef.current,
            { clipPath: clipPaths[direction].from },
            {
                clipPath: clipPaths[direction].to,
                duration: 1.2,
                ease: 'power4.inOut',
                delay: delay,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [delay, direction]);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
}
