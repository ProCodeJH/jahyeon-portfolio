import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useLocation } from 'wouter';
import { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

// Page transition variants with proper typing
const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98,
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
            when: 'beforeChildren',
            staggerChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.98,
        transition: {
            duration: 0.3,
            ease: 'easeIn',
        },
    },
};

// Overlay transition for dramatic effect
const overlayVariants: Variants = {
    initial: {
        scaleY: 1,
    },
    animate: {
        scaleY: 0,
        transition: {
            duration: 0.6,
            ease: 'circInOut',
        },
    },
    exit: {
        scaleY: 1,
        transition: {
            duration: 0.6,
            ease: 'circInOut',
        },
    },
};

export default function PageTransition({ children }: PageTransitionProps) {
    const [location] = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location}
                initial="initial"
                animate="enter"
                exit="exit"
                variants={pageVariants}
            >
                {/* Transition overlay */}
                <motion.div
                    className="page-transition-overlay"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={overlayVariants}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'linear-gradient(135deg, #7B2FFF, #00D9FF)',
                        transformOrigin: 'top',
                        zIndex: 99990,
                        pointerEvents: 'none',
                    }}
                />
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

// Export animation variants for child components
export const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

export const fadeIn = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.5 },
    },
};

export const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

export const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

export const slideInLeft = {
    initial: { opacity: 0, x: -50 },
    animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

export const slideInRight = {
    initial: { opacity: 0, x: 50 },
    animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};
