/**
 * Risograph Style Gallery Component
 */

import { useState } from "react";

interface GalleryItem {
    src: string;
    title: string;
    category?: string;
}

interface RisoGalleryProps {
    items: GalleryItem[];
    columns?: 2 | 3 | 4;
}

export function RisoGallery({ items, columns = 3 }: RisoGalleryProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const gridCols = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    };

    const colors = ['var(--riso-pink)', 'var(--riso-cyan)', 'var(--riso-orange)', 'var(--riso-teal)'];

    return (
        <div className={`grid ${gridCols[columns]} gap-6`}>
            {items.map((item, index) => {
                const color1 = colors[index % colors.length];
                const color2 = colors[(index + 2) % colors.length];
                const isHovered = hoveredIndex === index;

                return (
                    <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer transition-all duration-300"
                        style={{
                            boxShadow: isHovered
                                ? `12px 12px 0 ${color1}, 24px 24px 0 ${color2}`
                                : `6px 6px 0 ${color1}, 12px 12px 0 ${color2}`,
                            transform: isHovered ? 'translate(-4px, -4px)' : 'none',
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {/* Image */}
                        <img
                            src={item.src}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--riso-dark)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            {item.category && (
                                <span
                                    className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2"
                                    style={{ backgroundColor: color1 }}
                                >
                                    {item.category}
                                </span>
                            )}
                            <h3 className="text-white font-bold text-lg riso-shadow-sm">
                                {item.title}
                            </h3>
                        </div>

                        {/* Corner Accent */}
                        <div
                            className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-l-[40px] border-l-transparent transition-all duration-300"
                            style={{
                                borderTopColor: isHovered ? color1 : 'transparent',
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default RisoGallery;
