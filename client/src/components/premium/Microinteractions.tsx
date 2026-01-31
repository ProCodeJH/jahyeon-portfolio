import { ReactNode, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './Microinteractions.css';

// Tilt Card Component
interface TiltCardProps {
    children: ReactNode;
    className?: string;
    tiltAmount?: number;
    glareEnabled?: boolean;
}

export function TiltCard({
    children,
    className = '',
    tiltAmount = 15,
    glareEnabled = true,
}: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { stiffness: 300, damping: 30 };
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltAmount, -tiltAmount]), springConfig);
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltAmount, tiltAmount]), springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) / rect.width);
        y.set((e.clientY - centerY) / rect.height);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            className={`tilt-card ${className}`}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                perspective: 1000,
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {glareEnabled && (
                <motion.div
                    className="tilt-card-glare"
                    style={{
                        opacity: isHovering ? 0.15 : 0,
                        background: `radial-gradient(
              circle at ${50 + x.get() * 50}% ${50 + y.get() * 50}%,
              rgba(255, 255, 255, 0.8) 0%,
              transparent 80%
            )`,
                    }}
                />
            )}
        </motion.div>
    );
}

// Ripple Button Component
interface RippleButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: 'primary' | 'secondary' | 'outline';
}

export function RippleButton({
    children,
    onClick,
    className = '',
    variant = 'primary',
}: RippleButtonProps) {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples((prev) => [...prev, { x, y, id }]);
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);

        onClick?.();
    };

    return (
        <motion.button
            className={`ripple-button ripple-button--${variant} ${className}`}
            onClick={handleClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {children}
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="ripple"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                    }}
                />
            ))}
        </motion.button>
    );
}

// Glow Button Component
interface GlowButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
}

export function GlowButton({ children, onClick, className = '' }: GlowButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);
    };

    return (
        <motion.button
            ref={ref}
            className={`glow-button ${className}`}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.span
                className="glow-button-glow"
                style={{
                    background: `radial-gradient(circle at ${x.get()}px ${y.get()}px, rgba(123, 47, 255, 0.4) 0%, transparent 50%)`,
                }}
            />
            <span className="glow-button-content">{children}</span>
        </motion.button>
    );
}

// Hover Scale Component
interface HoverScaleProps {
    children: ReactNode;
    scale?: number;
    className?: string;
}

export function HoverScale({ children, scale = 1.05, className = '' }: HoverScaleProps) {
    return (
        <motion.div
            className={`hover-scale ${className}`}
            whileHover={{ scale }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {children}
        </motion.div>
    );
}

// Loading Spinner Component
interface LoadingSpinnerProps {
    size?: number;
    className?: string;
}

export function LoadingSpinner({ size = 40, className = '' }: LoadingSpinnerProps) {
    return (
        <div className={`loading-spinner ${className}`} style={{ width: size, height: size }}>
            <motion.div
                className="loading-spinner-ring"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="loading-spinner-ring loading-spinner-ring--secondary"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="loading-spinner-dot"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
            />
        </div>
    );
}

// Page Loader Component
export function PageLoader() {
    return (
        <motion.div
            className="page-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="page-loader-content">
                <LoadingSpinner size={60} />
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Loading...
                </motion.p>
            </div>
        </motion.div>
    );
}
