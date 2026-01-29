/**
 * Risograph Style Home Page
 */

import { Navigation } from "@/components/layout/Navigation";
import { RisoHero } from "@/components/riso/RisoHero";
import { RisoCard } from "@/components/riso/RisoCard";
import { RisoGallery } from "@/components/riso/RisoGallery";
import { Link } from "wouter";
import {
    CircuitBoard, Code, Zap, GraduationCap,
    ArrowRight, Github, Linkedin, Mail,
    Cpu, Database, Globe, Server
} from "lucide-react";
import "@/styles/riso-theme.css";

// Services Data
const services = [
    {
        title: "Embedded Systems",
        description: "MCU programming, RTOS development, and firmware optimization for industrial applications",
        icon: CircuitBoard,
        color: 'pink' as const,
    },
    {
        title: "Full-Stack Development",
        description: "Modern web applications with React, Node.js, and cloud-native architectures",
        icon: Code,
        color: 'cyan' as const,
    },
    {
        title: "IoT Solutions",
        description: "Connected devices, smart sensors, and industrial automation systems",
        icon: Zap,
        color: 'orange' as const,
    },
    {
        title: "Coding Education",
        description: "Teaching programming fundamentals to 500+ students with hands-on projects",
        icon: GraduationCap,
        color: 'teal' as const,
    },
];

// Tech Stack
const techStack = [
    { name: "Python", level: 95, color: "var(--riso-cyan)" },
    { name: "TypeScript", level: 90, color: "var(--riso-blue)" },
    { name: "C/C++", level: 85, color: "var(--riso-pink)" },
    { name: "React", level: 92, color: "var(--riso-cyan)" },
    { name: "Node.js", level: 88, color: "var(--riso-teal)" },
    { name: "Arduino", level: 95, color: "var(--riso-orange)" },
];

// Gallery Items
const galleryItems = [
    { src: "/riso/riso_embedded_dev_1769726045698.png", title: "Embedded Development", category: "Hardware" },
    { src: "/riso/riso_web_dev_1769726143789.png", title: "Web Development", category: "Frontend" },
    { src: "/riso/riso_server_cloud_1769726159655.png", title: "Cloud Infrastructure", category: "Backend" },
    { src: "/riso/riso_mobile_app_1769726178940.png", title: "Mobile Apps", category: "Mobile" },
    { src: "/riso/riso_coding_abstract_1769726112572.png", title: "Code Art", category: "Creative" },
    { src: "/riso/riso_ai_robot_1769726128019.png", title: "AI & Robotics", category: "AI" },
];

export default function HomeRiso() {
    return (
        <div className="riso-bg min-h-screen">
            <Navigation />

            {/* Hero Section */}
            <RisoHero />

            {/* Services Section */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 rounded-full bg-[var(--riso-pink)] text-white text-sm font-bold mb-4">
                            SERVICES
                        </span>
                        <h2 className="riso-heading text-4xl md:text-6xl riso-shadow">
                            What I Do
                        </h2>
                        <p className="riso-body text-xl text-[var(--riso-text-muted)] mt-4 max-w-2xl mx-auto">
                            From embedded firmware to cloud applications, I build complete solutions
                        </p>
                    </div>

                    {/* Service Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {services.map((service, index) => (
                            <RisoCard
                                key={index}
                                title={service.title}
                                description={service.description}
                                icon={service.icon}
                                color={service.color}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="py-24 px-6 bg-white riso-grain">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 rounded-full bg-[var(--riso-cyan)] text-[var(--riso-dark)] text-sm font-bold mb-4">
                            TECHNOLOGIES
                        </span>
                        <h2 className="riso-heading text-4xl md:text-6xl riso-shadow">
                            Tech Stack
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {techStack.map((tech, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-2xl bg-[var(--riso-cream)] border-2 border-[var(--riso-dark)] text-center hover:translate-y-[-4px] transition-transform cursor-pointer"
                                style={{
                                    boxShadow: `4px 4px 0 ${tech.color}`,
                                }}
                            >
                                <span className="riso-heading text-lg">{tech.name}</span>
                                <div className="mt-3 h-2 bg-[var(--riso-paper-dark)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${tech.level}%`,
                                            backgroundColor: tech.color,
                                        }}
                                    />
                                </div>
                                <span className="riso-mono text-xs text-[var(--riso-text-muted)] mt-2 block">
                                    {tech.level}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Work Gallery Section */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 rounded-full bg-[var(--riso-orange)] text-white text-sm font-bold mb-4">
                            PORTFOLIO
                        </span>
                        <h2 className="riso-heading text-4xl md:text-6xl riso-shadow">
                            My Work
                        </h2>
                        <p className="riso-body text-xl text-[var(--riso-text-muted)] mt-4">
                            Selected projects and areas of expertise
                        </p>
                    </div>

                    <RisoGallery items={galleryItems} columns={3} />

                    {/* View All Button */}
                    <div className="text-center mt-12">
                        <Link href="/projects">
                            <button className="riso-btn">
                                View All Projects
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 bg-[var(--riso-dark)] riso-grain">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6" style={{ textShadow: '3px 3px 0 var(--riso-pink), -3px -3px 0 var(--riso-cyan)' }}>
                        Let's Build Something Amazing
                    </h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Have a project in mind? I'm always open to discussing new opportunities and creative collaborations.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="mailto:contact@jahyeon.com">
                            <button className="riso-btn riso-btn-pink">
                                <Mail className="w-5 h-5" />
                                Get in Touch
                            </button>
                        </a>
                        <a href="https://github.com/ProCodeJH" target="_blank" rel="noopener noreferrer">
                            <button className="riso-btn riso-btn-cyan">
                                <Github className="w-5 h-5" />
                                View GitHub
                            </button>
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="riso-footer">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex justify-center gap-6 mb-8">
                        <a href="https://github.com/ProCodeJH" className="hover:text-[var(--riso-pink)] transition-colors">
                            <Github className="w-6 h-6" />
                        </a>
                        <a href="https://linkedin.com" className="hover:text-[var(--riso-cyan)] transition-colors">
                            <Linkedin className="w-6 h-6" />
                        </a>
                        <a href="mailto:contact@jahyeon.com" className="hover:text-[var(--riso-orange)] transition-colors">
                            <Mail className="w-6 h-6" />
                        </a>
                    </div>
                    <p className="text-gray-400">
                        © 2024 Gu Jahyeon. Built with React & Vite.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Design inspired by Risograph print aesthetics 🎨
                    </p>
                </div>
            </footer>
        </div>
    );
}
