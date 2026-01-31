import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Reveal animation on scroll
export function useScrollReveal(options: ScrollTrigger.Vars = {}) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                element,
                {
                    opacity: 0,
                    y: 60,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        end: 'bottom 15%',
                        toggleActions: 'play none none reverse',
                        ...options,
                    },
                }
            );
        });

        return () => ctx.revert();
    }, [options]);

    return ref;
}

// Parallax effect on scroll
export function useParallax(speed: number = 0.5) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            gsap.to(element, {
                yPercent: -100 * speed,
                ease: 'none',
                scrollTrigger: {
                    trigger: element,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        });

        return () => ctx.revert();
    }, [speed]);

    return ref;
}

// Stagger children animation
export function useStaggerReveal(stagger: number = 0.1) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const children = element.children;
        if (!children.length) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                children,
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
                    stagger: stagger,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        });

        return () => ctx.revert();
    }, [stagger]);

    return ref;
}

// Horizontal scroll section
export function useHorizontalScroll() {
    const containerRef = useRef<HTMLElement>(null);
    const wrapperRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        if (!container || !wrapper) return;

        const ctx = gsap.context(() => {
            const itemsWidth = wrapper.scrollWidth;
            const containerWidth = container.offsetWidth;

            gsap.to(wrapper, {
                x: -(itemsWidth - containerWidth),
                ease: 'none',
                scrollTrigger: {
                    trigger: container,
                    start: 'top top',
                    end: () => `+=${itemsWidth - containerWidth}`,
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                },
            });
        });

        return () => ctx.revert();
    }, []);

    return { containerRef, wrapperRef };
}

// Text reveal character by character
export function useSplitTextReveal() {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const text = element.textContent || '';
        element.innerHTML = '';

        // Split text into characters
        const chars = text.split('').map((char) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.transform = 'translateY(100%)';
            return span;
        });

        chars.forEach((span) => element.appendChild(span));

        const ctx = gsap.context(() => {
            gsap.to(chars, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.02,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
            });
        });

        return () => {
            ctx.revert();
            element.textContent = text;
        };
    }, []);

    return ref;
}

// Scale on scroll effect
export function useScaleOnScroll(from: number = 0.8, to: number = 1) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                element,
                { scale: from, opacity: 0.5 },
                {
                    scale: to,
                    opacity: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 80%',
                        end: 'center center',
                        scrub: 1,
                    },
                }
            );
        });

        return () => ctx.revert();
    }, [from, to]);

    return ref;
}
