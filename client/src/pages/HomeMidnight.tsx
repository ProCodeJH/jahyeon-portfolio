import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Code, Zap, CircuitBoard, GraduationCap, Layers, Terminal, Github, Linkedin, Mail, ChevronRight } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";

// ==================== TYPES ====================
interface ServiceCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    tags: string[];
}

// ==================== DATA ====================
const services: ServiceCardProps[] = [
    {
        title: "Embedded Systems",
        description: "MCU programming, RTOS development, and firmware optimization for industrial applications",
        icon: CircuitBoard,
        tags: ["ARM", "RTOS", "Firmware"],
    },
    {
        title: "Software Development",
        description: "Full-stack solutions with Python, Java, C/C++ for enterprise systems",
        icon: Code,
        tags: ["Python", "Java", "C++"],
    },
    {
        title: "IoT Solutions",
        description: "Connected devices, smart sensors, and industrial automation systems",
        icon: Zap,
        tags: ["MQTT", "Sensors", "Cloud"],
    },
    {
        title: "Coding Education",
        description: "Teaching programming fundamentals to 500+ students with hands-on projects",
        icon: GraduationCap,
        tags: ["Arduino", "Python", "Web"],
    },
];

const experiences = [
    {
        year: "2025",
        company: "Coding Academy",
        role: "Coding Instructor",
        description: "Teaching embedded systems and programming to 500+ students",
        current: true,
    },
    {
        year: "2024",
        company: "SHL Co., Ltd.",
        role: "Logistics Systems Engineer",
        description: "Hankook Tire partner - warehouse automation systems",
        current: false,
    },
    {
        year: "2023",
        company: "LG Electronics",
        role: "Senior Research Engineer",
        description: "Home appliance embedded systems and IoT development",
        current: false,
    },
    {
        year: "2022",
        company: "Nordground",
        role: "Data Engineer",
        description: "Data analysis and optimization for manufacturing",
        current: false,
    },
];

// ==================== COMPONENTS ====================

function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-midnight">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

            {/* Glow Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric/10 rounded-full blur-[128px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-indigo/10 rounded-full blur-[128px]" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
                {/* Terminal Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-midnight-card border border-midnight-border mb-8">
                    <Terminal className="w-4 h-4 text-electric" />
                    <span className="font-[family-name:var(--font-mono)] text-sm text-frost-muted">
                        ~/embedded-engineer
                    </span>
                    <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                </div>

                {/* Main Headline */}
                <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl lg:text-8xl font-bold text-frost leading-tight mb-6">
                    Thinking of ideas
                    <br />
                    <span className="text-electric">that help the world</span>
                </h1>

                <p className="font-[family-name:var(--font-body)] text-lg md:text-xl text-frost-muted max-w-2xl mx-auto mb-10">
                    Embedded Engineer & Coding Instructor. Building tomorrow's technology
                    while teaching the next generation of developers.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/projects">
                        <Button className="font-[family-name:var(--font-heading)] text-lg px-8 py-6 bg-electric text-midnight rounded-xl font-semibold hover:bg-electric-dim hover:shadow-[0_0_32px_rgba(0,255,136,0.3)] transition-all duration-300 h-auto">
                            View Projects
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/resources">
                        <Button variant="outline" className="font-[family-name:var(--font-heading)] text-lg px-8 py-6 border-2 border-midnight-border text-frost rounded-xl font-semibold hover:border-electric hover:text-electric transition-all duration-300 h-auto bg-transparent">
                            Resources
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 pt-16 border-t border-midnight-border">
                    <div className="text-center">
                        <p className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-electric">500+</p>
                        <p className="font-[family-name:var(--font-body)] text-frost-muted mt-1">Students Taught</p>
                    </div>
                    <div className="text-center">
                        <p className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-electric">5+</p>
                        <p className="font-[family-name:var(--font-body)] text-frost-muted mt-1">Years Experience</p>
                    </div>
                    <div className="text-center">
                        <p className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-electric">LG</p>
                        <p className="font-[family-name:var(--font-body)] text-frost-muted mt-1">Former Engineer</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ServiceCard({ title, description, icon: Icon, tags }: ServiceCardProps) {
    return (
        <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-midnight-card to-midnight border border-midnight-border hover:border-electric/30 transition-all duration-500">
            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-2xl bg-electric/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-electric/10 flex items-center justify-center mb-6 group-hover:bg-electric/20 transition-colors">
                    <Icon className="w-7 h-7 text-electric" />
                </div>

                <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-frost mb-3 group-hover:text-electric transition-colors">
                    {title}
                </h3>

                <p className="font-[family-name:var(--font-body)] text-frost-muted mb-6 leading-relaxed">
                    {description}
                </p>

                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-midnight-border text-frost-muted text-sm font-[family-name:var(--font-mono)]">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Services() {
    return (
        <section className="py-24 bg-midnight">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-frost mb-4">
                        Expertise
                    </h2>
                    <p className="font-[family-name:var(--font-body)] text-lg text-frost-muted max-w-2xl mx-auto">
                        Specialized in embedded systems, IoT solutions, and coding education
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function Experience() {
    return (
        <section className="py-24 bg-midnight-card">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-frost mb-4">
                        Experience
                    </h2>
                    <p className="font-[family-name:var(--font-body)] text-lg text-frost-muted">
                        Professional journey through leading tech companies
                    </p>
                </div>

                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-midnight-border md:-translate-x-1/2" />

                    <div className="space-y-12">
                        {experiences.map((exp, index) => (
                            <div key={index} className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                {/* Timeline Dot */}
                                <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-midnight border-2 border-electric -translate-x-1/2 md:-translate-x-1/2 z-10">
                                    {exp.current && <span className="absolute inset-0 rounded-full bg-electric animate-ping opacity-50" />}
                                </div>

                                {/* Content */}
                                <div className={`flex-1 ml-8 md:ml-0 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'}`}>
                                    <div className="p-6 rounded-2xl bg-midnight border border-midnight-border hover:border-electric/30 transition-colors">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-[family-name:var(--font-mono)] text-sm text-electric">{exp.year}</span>
                                            {exp.current && (
                                                <span className="px-2 py-0.5 rounded-full bg-electric/20 text-electric text-xs font-bold">CURRENT</span>
                                            )}
                                        </div>
                                        <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-frost mb-1">{exp.company}</h3>
                                        <p className="font-[family-name:var(--font-body)] text-electric mb-2">{exp.role}</p>
                                        <p className="font-[family-name:var(--font-body)] text-frost-muted text-sm">{exp.description}</p>
                                    </div>
                                </div>

                                {/* Spacer for alternating layout */}
                                <div className="hidden md:block flex-1" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeaturedProjects() {
    const { data: projects } = trpc.projects.list.useQuery();

    return (
        <section className="py-24 bg-midnight">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
                    <div>
                        <h2 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-frost mb-4">
                            Featured Work
                        </h2>
                        <p className="font-[family-name:var(--font-body)] text-lg text-frost-muted">
                            Recent projects and experiments
                        </p>
                    </div>
                    <Link href="/projects">
                        <Button className="font-[family-name:var(--font-heading)] px-6 py-3 bg-electric text-midnight rounded-xl font-semibold hover:bg-electric-dim transition-all h-auto">
                            View All <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {projects?.slice(0, 3).map((project) => (
                        <div key={project.id} className="group rounded-2xl bg-midnight-card border border-midnight-border overflow-hidden hover:border-electric/30 transition-all duration-500">
                            <div className="aspect-video overflow-hidden">
                                {project.imageUrl ? (
                                    <img
                                        src={project.imageUrl}
                                        alt={project.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-electric/10 to-midnight flex items-center justify-center">
                                        <Code className="w-12 h-12 text-electric/30" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-frost mb-2 group-hover:text-electric transition-colors line-clamp-1">
                                    {project.title}
                                </h3>
                                <p className="font-[family-name:var(--font-body)] text-frost-muted text-sm line-clamp-2 mb-4">
                                    {project.description}
                                </p>
                                <Link href="/projects" className="inline-flex items-center gap-1 text-electric font-[family-name:var(--font-heading)] font-medium text-sm group/link">
                                    View Details
                                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CTA() {
    return (
        <section className="py-24 bg-midnight-card">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-frost mb-6">
                    Let's work together
                </h2>
                <p className="font-[family-name:var(--font-body)] text-lg text-frost-muted mb-10 max-w-2xl mx-auto">
                    Have a project in mind? Let's discuss how I can help bring your ideas to life.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/resources">
                        <Button className="font-[family-name:var(--font-heading)] text-lg px-8 py-6 bg-electric text-midnight rounded-xl font-semibold hover:bg-electric-dim hover:shadow-[0_0_32px_rgba(0,255,136,0.3)] transition-all h-auto">
                            Get in touch
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="py-16 bg-midnight border-t border-midnight-border">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                    <div>
                        <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-frost mb-2">
                            Gu Jahyeon
                        </h3>
                        <p className="font-[family-name:var(--font-body)] text-frost-muted">
                            구자현 • Embedded Developer
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-4">
                        <a href="#" className="w-12 h-12 rounded-xl bg-midnight-card border border-midnight-border flex items-center justify-center text-frost-muted hover:text-electric hover:border-electric/30 transition-all">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-12 h-12 rounded-xl bg-midnight-card border border-midnight-border flex items-center justify-center text-frost-muted hover:text-electric hover:border-electric/30 transition-all">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-12 h-12 rounded-xl bg-midnight-card border border-midnight-border flex items-center justify-center text-frost-muted hover:text-electric hover:border-electric/30 transition-all">
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Nav Links */}
                <div className="flex flex-wrap gap-6 mb-12">
                    <Link href="/" className="font-[family-name:var(--font-body)] text-frost-muted hover:text-electric transition-colors">Home</Link>
                    <Link href="/projects" className="font-[family-name:var(--font-body)] text-frost-muted hover:text-electric transition-colors">Projects</Link>
                    <Link href="/resources" className="font-[family-name:var(--font-body)] text-frost-muted hover:text-electric transition-colors">Resources</Link>
                    <Link href="/code-editor" className="font-[family-name:var(--font-body)] text-frost-muted hover:text-electric transition-colors">Code Editor</Link>
                </div>

                <div className="border-t border-midnight-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="font-[family-name:var(--font-body)] text-sm text-frost-muted">
                        © 2025 Gu Jahyeon. All Rights Reserved.
                    </p>
                    <p className="font-[family-name:var(--font-mono)] text-xs text-frost-muted">
                        Built with React + TypeScript
                    </p>
                </div>
            </div>
        </footer>
    );
}

// ==================== MAIN PAGE ====================
export default function HomeMidnight() {
    return (
        <div className="min-h-screen bg-midnight">
            <Navigation />
            <Hero />
            <Services />
            <Experience />
            <FeaturedProjects />
            <CTA />
            <Footer />
        </div>
    );
}
