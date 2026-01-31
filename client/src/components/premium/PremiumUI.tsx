import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PremiumUI.css';

// Glassmorphism Card
interface GlassCardProps {
    children: ReactNode;
    className?: string;
    blur?: number;
    opacity?: number;
}

export function GlassCard({
    children,
    className = '',
    blur = 20,
    opacity = 0.1,
}: GlassCardProps) {
    return (
        <div
            className={`glass-card ${className}`}
            style={{
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                background: `rgba(255, 255, 255, ${opacity})`,
            }}
        >
            {children}
        </div>
    );
}

// Gradient Background
interface GradientBackgroundProps {
    children?: ReactNode;
    variant?: 'mesh' | 'aurora' | 'sunset' | 'ocean';
    animated?: boolean;
    className?: string;
}

export function GradientBackground({
    children,
    variant = 'mesh',
    animated = true,
    className = '',
}: GradientBackgroundProps) {
    return (
        <div className={`gradient-bg gradient-bg--${variant} ${animated ? 'animated' : ''} ${className}`}>
            {children}
        </div>
    );
}

// Mobile Hamburger Menu
interface MobileMenuProps {
    isOpen: boolean;
    onToggle: () => void;
    children: ReactNode;
}

export function MobileMenu({ isOpen, onToggle, children }: MobileMenuProps) {
    return (
        <>
            {/* Hamburger Button */}
            <button
                className={`hamburger ${isOpen ? 'active' : ''}`}
                onClick={onToggle}
                aria-label="Toggle menu"
            >
                <span className="hamburger-line" />
                <span className="hamburger-line" />
                <span className="hamburger-line" />
            </button>

            {/* Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="mobile-menu-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onToggle}
                        />
                        <motion.nav
                            className="mobile-menu"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            {children}
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

// Premium Footer
interface FooterLink {
    label: string;
    href: string;
}

interface FooterProps {
    links?: FooterLink[];
    socials?: { icon: ReactNode; href: string; label: string }[];
    copyright?: string;
}

export function PremiumFooter({ links = [], socials = [], copyright }: FooterProps) {
    return (
        <footer className="premium-footer">
            <div className="premium-footer-content">
                {/* Top section with gradient line */}
                <div className="premium-footer-gradient-line" />

                {/* Main content */}
                <div className="premium-footer-main">
                    {/* Logo/Brand */}
                    <div className="premium-footer-brand">
                        <div className="premium-footer-logo">JH</div>
                        <p>Embedded Developer & Educator</p>
                    </div>

                    {/* Navigation */}
                    {links.length > 0 && (
                        <nav className="premium-footer-nav">
                            {links.map((link) => (
                                <a key={link.href} href={link.href}>
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                    )}

                    {/* Socials */}
                    {socials.length > 0 && (
                        <div className="premium-footer-socials">
                            {socials.map((social, i) => (
                                <a key={i} href={social.href} aria-label={social.label}>
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom section */}
                <div className="premium-footer-bottom">
                    <p>{copyright || `© ${new Date().getFullYear()} Gu Jahyeon. All rights reserved.`}</p>
                </div>
            </div>
        </footer>
    );
}

// Custom Scrollbar Component (adds custom scrollbar styles)
export function CustomScrollbar({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`custom-scrollbar ${className}`}>
            {children}
        </div>
    );
}

// Tooltip Component
interface TooltipProps {
    children: ReactNode;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="tooltip-wrapper"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className={`tooltip tooltip--${position}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Badge Component
interface BadgeProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
}

export function Badge({ children, variant = 'primary', size = 'md' }: BadgeProps) {
    return (
        <span className={`badge badge--${variant} badge--${size}`}>
            {children}
        </span>
    );
}
