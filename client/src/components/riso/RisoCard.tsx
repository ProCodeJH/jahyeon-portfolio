/**
 * Risograph Style Card Component
 */

import { LucideIcon } from "lucide-react";

interface RisoCardProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    image?: string;
    color?: 'pink' | 'orange' | 'cyan' | 'teal';
    href?: string;
}

const colorMap = {
    pink: {
        shadow1: 'var(--riso-pink)',
        shadow2: 'var(--riso-cyan)',
        accent: 'var(--riso-pink)',
    },
    orange: {
        shadow1: 'var(--riso-orange)',
        shadow2: 'var(--riso-teal)',
        accent: 'var(--riso-orange)',
    },
    cyan: {
        shadow1: 'var(--riso-cyan)',
        shadow2: 'var(--riso-blue)',
        accent: 'var(--riso-cyan)',
    },
    teal: {
        shadow1: 'var(--riso-teal)',
        shadow2: 'var(--riso-pink)',
        accent: 'var(--riso-teal)',
    },
};

export function RisoCard({
    title,
    description,
    icon: Icon,
    image,
    color = 'pink',
    href
}: RisoCardProps) {
    const colors = colorMap[color];

    const content = (
        <div
            className="riso-card group cursor-pointer"
            style={{
                boxShadow: `8px 8px 0 ${colors.shadow1}, 16px 16px 0 ${colors.shadow2}`,
            }}
        >
            {/* Image */}
            {image && (
                <div className="mb-4 -mx-2 -mt-2 overflow-hidden rounded-xl">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
            )}

            {/* Icon */}
            {Icon && (
                <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 border-2 border-[var(--riso-dark)]"
                    style={{ backgroundColor: colors.accent }}
                >
                    <Icon className="w-7 h-7 text-white" />
                </div>
            )}

            {/* Content */}
            <h3 className="riso-heading text-xl mb-3 group-hover:riso-shadow-sm transition-all">
                {title}
            </h3>
            <p className="riso-body text-[var(--riso-text-muted)]">
                {description}
            </p>

            {/* Hover Arrow */}
            <div className="mt-4 flex items-center gap-2 text-[var(--riso-dark)] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn More</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
        </div>
    );

    if (href) {
        return <a href={href}>{content}</a>;
    }

    return content;
}

export default RisoCard;
