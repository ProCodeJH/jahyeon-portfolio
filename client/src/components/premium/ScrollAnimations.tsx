import { ReactNode, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollAnimations.css';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    className?: string;
}

export function ScrollReveal({
    children,
    delay = 0,
    duration = 1,
    direction = 'up',
    className = '',
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const directions = {
            up: { y: 60, x: 0 },
            down: { y: -60, x: 0 },
            left: { y: 0, x: 60 },
            right: { y: 0, x: -60 },
        };

        const ctx = gsap.context(() => {
            gsap.fromTo(
                element,
                {
                    opacity: 0,
                    ...directions[direction],
                },
                {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    duration,
                    delay,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        });

        return () => ctx.revert();
    }, [delay, duration, direction]);

    return (
        <div ref={ref} className={`scroll-reveal ${className}`}>
            {children}
        </div>
    );
}

interface ParallaxProps {
    children: ReactNode;
    speed?: number;
    className?: string;
}

export function Parallax({ children, speed = 0.3, className = '' }: ParallaxProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            gsap.to(element, {
                yPercent: -100 * speed,
                ease: 'none',
                scrollTrigger: {
                    trigger: element.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        });

        return () => ctx.revert();
    }, [speed]);

    return (
        <div ref={ref} className={`parallax ${className}`}>
            {children}
        </div>
    );
}

interface StaggerContainerProps {
    children: ReactNode;
    stagger?: number;
    className?: string;
}

export function StaggerContainer({
    children,
    stagger = 0.1,
    className = '',
}: StaggerContainerProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const items = container.querySelectorAll('.stagger-item');
        if (!items.length) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                items,
                {
                    opacity: 0,
                    y: 40,
                    scale: 0.95,
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: container,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        });

        return () => ctx.revert();
    }, [stagger]);

    return (
        <div ref={ref} className={`stagger-container ${className}`}>
            {children}
        </div>
    );
}

interface TextRevealProps {
    text: string;
    className?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

export function TextReveal({ text, className = '', tag: Tag = 'span' }: TextRevealProps) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const words = text.split(' ');
        element.innerHTML = '';

        words.forEach((word, i) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'text-reveal-word';
            wordSpan.style.display = 'inline-block';
            wordSpan.style.overflow = 'hidden';
            wordSpan.style.verticalAlign = 'top';

            const innerSpan = document.createElement('span');
            innerSpan.textContent = word;
            innerSpan.style.display = 'inline-block';
            innerSpan.style.transform = 'translateY(100%)';

            wordSpan.appendChild(innerSpan);
            element.appendChild(wordSpan);

            if (i < words.length - 1) {
                element.appendChild(document.createTextNode(' '));
            }
        });

        const innerSpans = element.querySelectorAll('.text-reveal-word span');

        const ctx = gsap.context(() => {
            gsap.to(innerSpans, {
                y: 0,
                duration: 0.8,
                stagger: 0.05,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
            });
        });

        return () => {
            ctx.revert();
        };
    }, [text]);

    return <Tag ref={ref as any} className={`text-reveal ${className}`} />;
}

interface MagneticButtonProps {
    children: ReactNode;
    strength?: number;
    className?: string;
    onClick?: () => void;
}

export function MagneticButton({
    children,
    strength = 0.3,
    className = '',
    onClick,
}: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const button = ref.current;
        if (!button) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(button, {
                x: x * strength,
                y: y * strength,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const handleMouseLeave = () => {
            gsap.to(button, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)',
            });
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [strength]);

    return (
        <button ref={ref} className={`magnetic-button ${className}`} onClick={onClick}>
            {children}
        </button>
    );
}
