import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './CustomCursor.css';

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [cursorText, setCursorText] = useState('');

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animation for cursor
    const springConfig = { damping: 25, stiffness: 400 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        // Add hover detection for interactive elements
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Check for data-cursor attribute
            const cursorData = target.closest('[data-cursor]');
            if (cursorData) {
                setIsHovering(true);
                setCursorText(cursorData.getAttribute('data-cursor') || '');
                return;
            }

            // Check for interactive elements
            if (target.closest('a, button, [role="button"], input, textarea, select, .cursor-hover')) {
                setIsHovering(true);
                setCursorText('');
            }
        };

        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('a, button, [role="button"], input, textarea, select, .cursor-hover, [data-cursor]')) {
                setIsHovering(false);
                setCursorText('');
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseout', handleMouseOut);
        };
    }, [mouseX, mouseY]);

    // Hide on touch devices
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    if (isTouchDevice) return null;

    return (
        <>
            {/* Main cursor dot */}
            <motion.div
                ref={cursorRef}
                className={`custom-cursor ${isHovering ? 'hovering' : ''} ${isClicking ? 'clicking' : ''}`}
                style={{
                    x: cursorX,
                    y: cursorY,
                }}
            >
                {cursorText && <span className="cursor-text">{cursorText}</span>}
            </motion.div>

            {/* Cursor trail/ring */}
            <motion.div
                className={`cursor-ring ${isHovering ? 'hovering' : ''} ${isClicking ? 'clicking' : ''}`}
                style={{
                    x: cursorX,
                    y: cursorY,
                }}
            />
        </>
    );
}
