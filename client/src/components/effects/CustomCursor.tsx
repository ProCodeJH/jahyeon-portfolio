import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

/**
 * 🎯 CUSTOM CURSOR COMPONENT
 * 
 * Premium custom cursor with:
 * - Smooth following animation
 * - Scale effect on interactive elements
 * - Blend mode for visibility on any background
 * - Mobile detection (hidden on touch devices)
 */
export function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const cursorDotRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        // Detect touch device
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

        if ('ontouchstart' in window) return;

        const cursor = cursorRef.current;
        const cursorDot = cursorDotRef.current;
        if (!cursor || !cursorDot) return;

        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            setIsVisible(true);

            // Dot follows immediately
            gsap.to(cursorDot, {
                x: mouseX,
                y: mouseY,
                duration: 0.1,
                ease: 'power2.out',
            });

            // Outer ring follows with delay
            gsap.to(cursor, {
                x: mouseX,
                y: mouseY,
                duration: 0.5,
                ease: 'power3.out',
            });
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        // Add hover effect to interactive elements
        const interactiveElements = document.querySelectorAll(
            'a, button, [role="button"], input, textarea, select, [data-cursor-hover]'
        );

        const handleElementEnter = () => setIsHovering(true);
        const handleElementLeave = () => setIsHovering(false);

        interactiveElements.forEach((el) => {
            el.addEventListener('mouseenter', handleElementEnter);
            el.addEventListener('mouseleave', handleElementLeave);
        });

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);

            interactiveElements.forEach((el) => {
                el.removeEventListener('mouseenter', handleElementEnter);
                el.removeEventListener('mouseleave', handleElementLeave);
            });
        };
    }, []);

    // Don't render on touch devices
    if (isTouchDevice) return null;

    return (
        <>
            {/* Outer ring */}
            <div
                ref={cursorRef}
                className={`
          fixed top-0 left-0 pointer-events-none z-[9999]
          w-10 h-10 -ml-5 -mt-5
          border-2 border-purple-500/60 rounded-full
          mix-blend-difference
          transition-transform duration-300
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${isHovering ? 'scale-150' : 'scale-100'}
        `}
                style={{
                    boxShadow: isHovering
                        ? '0 0 20px rgba(168, 85, 247, 0.5), inset 0 0 20px rgba(168, 85, 247, 0.2)'
                        : 'none',
                }}
            />

            {/* Center dot */}
            <div
                ref={cursorDotRef}
                className={`
          fixed top-0 left-0 pointer-events-none z-[9999]
          w-2 h-2 -ml-1 -mt-1
          bg-cyan-400 rounded-full
          mix-blend-difference
          transition-transform duration-150
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${isHovering ? 'scale-0' : 'scale-100'}
        `}
                style={{
                    boxShadow: '0 0 10px rgba(34, 211, 238, 0.8)',
                }}
            />
        </>
    );
}

/**
 * 🎨 CURSOR STYLES HIDER
 * 
 * Hides default cursor when custom cursor is active.
 * Add this to your global styles or App component.
 */
export function HideDefaultCursor() {
    useEffect(() => {
        // Only hide on non-touch devices
        if ('ontouchstart' in window) return;

        const style = document.createElement('style');
        style.textContent = `
      * {
        cursor: none !important;
      }
    `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return null;
}
