import { useRef, useState, ReactNode, MouseEvent } from 'react';
import { gsap } from 'gsap';

interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
    strength?: number;
    onClick?: () => void;
}

/**
 * 🧲 MAGNETIC BUTTON COMPONENT
 * 
 * Creates a button that is attracted to the cursor position,
 * providing a premium, interactive feel.
 * 
 * Features:
 * - Magnetic pull effect on hover
 * - Smooth GSAP animations
 * - Neon glow on hover
 * - Scale effect on press
 */
export function MagneticButton({
    children,
    className = '',
    strength = 0.4,
    onClick
}: MagneticButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        gsap.to(buttonRef.current, {
            x: deltaX * strength,
            y: deltaY * strength,
            duration: 0.3,
            ease: 'power2.out',
        });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);

        if (buttonRef.current) {
            gsap.to(buttonRef.current, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)',
            });
        }
    };

    return (
        <button
            ref={buttonRef}
            className={`
        relative overflow-hidden
        transition-shadow duration-300
        ${isHovered ? 'shadow-[0_0_40px_rgba(168,85,247,0.5)]' : ''}
        ${className}
      `}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

interface GlowButtonProps {
    children: ReactNode;
    className?: string;
    glowColor?: string;
    onClick?: () => void;
}

/**
 * ✨ NEON GLOW BUTTON
 * 
 * Button with animated neon glow effect on hover.
 */
export function GlowButton({
    children,
    className = '',
    glowColor = 'rgba(168, 85, 247, 0.6)',
    onClick
}: GlowButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            className={`
        relative overflow-hidden group
        transition-all duration-500
        ${className}
      `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* Glow effect */}
            <div
                className={`
          absolute -inset-1 rounded-inherit blur-xl
          transition-opacity duration-500
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
                style={{ background: glowColor }}
            />

            {/* Content */}
            <span className="relative z-10">{children}</span>

            {/* Shimmer effect */}
            <div
                className={`
          absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
          translate-x-[-200%] group-hover:translate-x-[200%]
          transition-transform duration-1000 ease-out
        `}
            />
        </button>
    );
}

interface RippleButtonProps {
    children: ReactNode;
    className?: string;
    rippleColor?: string;
    onClick?: () => void;
}

/**
 * 🌊 RIPPLE EFFECT BUTTON
 * 
 * Material-style ripple effect on click.
 */
export function RippleButton({
    children,
    className = '',
    rippleColor = 'rgba(168, 85, 247, 0.4)',
    onClick
}: RippleButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);

    const createRipple = (e: MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;

        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: ${rippleColor};
      border-radius: 50%;
      transform: scale(0);
      pointer-events: none;
    `;

        button.appendChild(ripple);

        gsap.to(ripple, {
            scale: 2.5,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => ripple.remove(),
        });

        onClick?.();
    };

    return (
        <button
            ref={buttonRef}
            className={`relative overflow-hidden ${className}`}
            onClick={createRipple}
        >
            {children}
        </button>
    );
}
