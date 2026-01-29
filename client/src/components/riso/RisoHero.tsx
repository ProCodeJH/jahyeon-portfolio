/**
 * Risograph Style Hero Component
 */

import { Link } from "wouter";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";

export function RisoHero() {
    return (
        <section className="riso-hero riso-bg">
            {/* Background Pattern */}
            <div className="riso-hero-pattern" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Left Content */}
                    <div className="flex-1 text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-[var(--riso-dark)] mb-8 shadow-[3px_3px_0_var(--riso-pink)]">
                            <span className="w-2 h-2 rounded-full bg-[var(--riso-teal)] animate-pulse" />
                            <span className="riso-mono text-sm font-semibold">EMBEDDED DEVELOPER</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="riso-heading text-5xl md:text-7xl lg:text-8xl mb-6">
                            <span className="riso-shadow block">Gu Jahyeon</span>
                            <span className="riso-heading-gradient block mt-2">구자현</span>
                        </h1>

                        {/* Description */}
                        <p className="riso-body text-xl md:text-2xl max-w-xl mb-10 text-[var(--riso-text-muted)]">
                            Building innovative solutions from firmware to cloud.
                            Educator teaching 500+ students.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            <Link href="/projects">
                                <button className="riso-btn riso-btn-pink">
                                    View Projects
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                            <a href="https://github.com/ProCodeJH" target="_blank" rel="noopener noreferrer">
                                <button className="riso-btn riso-btn-cyan">
                                    <Github className="w-5 h-5" />
                                    GitHub
                                </button>
                            </a>
                        </div>

                        {/* Social Icons */}
                        <div className="flex justify-center lg:justify-start gap-4 mt-8">
                            <a href="https://github.com/ProCodeJH" className="p-3 rounded-full bg-white border-2 border-[var(--riso-dark)] hover:bg-[var(--riso-yellow)] transition-colors shadow-[2px_2px_0_var(--riso-dark)]">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="https://linkedin.com" className="p-3 rounded-full bg-white border-2 border-[var(--riso-dark)] hover:bg-[var(--riso-cyan)] transition-colors shadow-[2px_2px_0_var(--riso-dark)]">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="mailto:contact@jahyeon.com" className="p-3 rounded-full bg-white border-2 border-[var(--riso-dark)] hover:bg-[var(--riso-pink)] transition-colors shadow-[2px_2px_0_var(--riso-dark)]">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Right - Hero Image */}
                    <div className="flex-shrink-0">
                        <div className="relative">
                            {/* Main Image */}
                            <img
                                src="/riso/riso_it_hero_1769726013146.png"
                                alt="Developer Workspace"
                                className="riso-image w-80 h-80 md:w-96 md:h-96 object-cover riso-float"
                            />

                            {/* Floating Accent Images */}
                            <img
                                src="/riso/riso_ai_robot_1769726128019.png"
                                alt="AI Robot"
                                className="absolute -bottom-8 -left-8 w-32 h-32 rounded-xl shadow-[4px_4px_0_var(--riso-orange)] riso-float"
                                style={{ animationDelay: '0.5s' }}
                            />
                            <img
                                src="/riso/riso_tech_grid_1769726028754.png"
                                alt="Tech Icons"
                                className="absolute -top-4 -right-4 w-24 h-24 rounded-xl shadow-[4px_4px_0_var(--riso-teal)] riso-float"
                                style={{ animationDelay: '1s' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-20 pt-12 border-t-3 border-[var(--riso-dark)]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '500+', label: 'Students Taught', color: 'var(--riso-pink)' },
                            { value: '5+', label: 'Years Experience', color: 'var(--riso-orange)' },
                            { value: '50+', label: 'Projects Built', color: 'var(--riso-cyan)' },
                            { value: 'AI', label: 'Powered', color: 'var(--riso-teal)' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <p
                                    className="riso-heading text-4xl md:text-5xl riso-shadow-sm"
                                    style={{ color: stat.color }}
                                >
                                    {stat.value}
                                </p>
                                <p className="riso-body text-[var(--riso-text-muted)] mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default RisoHero;
