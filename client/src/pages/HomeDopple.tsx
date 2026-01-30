/**
 * Dopple Press V4 - 100% Perfect Clone
 * Exact replica with horizontal galleries, accordions, video, collages
 */

import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import "@/styles/dopple-v4.css";

// Data with multiple images per project
const projects = [
    {
        id: 1,
        title: "EMBEDDED",
        color: "#FF6816",
        bgColor: "#FDFBF4",
        textColor: "#393735",
        client: "Self-driven embedded systems development with Arduino, ESP32, and industrial automation. Building IoT solutions bridging hardware and software for smart homes and factories.",
        brief: "Design firmware for microcontrollers, sensor integration, and industrial systems. Create scalable, maintainable code for embedded applications.",
        outcome: "50+ embedded projects delivered including smart home automation, industrial sensors, IoT gateways. Custom libraries and frameworks used across devices.",
        media: [
            "/riso/dopple_circuit.png",
            "/riso/dopple_hands.png",
            "/riso/riso_embedded_dev_1769726045698.png",
            "/riso/riso_tech_grid_1769726028754.png",
        ],
    },
    {
        id: 2,
        title: "FULL-STACK",
        color: "#4361EE",
        bgColor: "#393735",
        textColor: "#FDFBF4",
        client: "Building web applications with React, TypeScript, Node.js, and cloud-native architectures. From concept to deployment for various clients worldwide.",
        brief: "Develop responsive, performant web apps with modern frameworks. Create intuitive UIs backed by robust APIs and cloud databases.",
        outcome: "20+ web applications including portfolios, e-commerce, SaaS tools. React, Next.js, Express, PostgreSQL for production solutions.",
        media: [
            "/riso/dopple_code.png",
            "/riso/dopple_workspace.png",
            "/riso/riso_web_dev_1769726143789.png",
            "/riso/riso_coding_abstract_1769726112572.png",
        ],
    },
    {
        id: 3,
        title: "AI & ML",
        color: "#45B69C",
        bgColor: "#FDFBF4",
        textColor: "#393735",
        client: "Exploring artificial intelligence and machine learning applications. Building intelligent systems that learn, adapt, and solve complex problems.",
        brief: "Implement ML models for image recognition, NLP, predictive analytics. Integrate AI capabilities into existing applications.",
        outcome: "AI-powered chatbots, recommendation systems, computer vision apps. Deployed using TensorFlow, PyTorch, and cloud AI services.",
        media: [
            "/riso/dopple_ai.png",
            "/riso/riso_ai_robot_1769726128019.png",
            "/riso/dopple_code.png",
        ],
    },
    {
        id: 4,
        title: "CLOUD",
        color: "#A78BFA",
        bgColor: "#393735",
        textColor: "#FDFBF4",
        client: "Designing cloud-native infrastructure on AWS, Azure, and Google Cloud. Scalable, secure, cost-effective enterprise solutions.",
        brief: "Architect cloud infrastructure for high availability. Implement CI/CD pipelines, containerization, serverless functions.",
        outcome: "Infrastructure serving millions of requests. Kubernetes clusters, automated deployments, monitoring for multiple organizations.",
        media: [
            "/riso/dopple_cloud.png",
            "/riso/riso_server_cloud_1769726159655.png",
            "/riso/dopple_workspace.png",
        ],
    },
    {
        id: 5,
        title: "MOBILE",
        color: "#EEDC46",
        bgColor: "#FDFBF4",
        textColor: "#393735",
        client: "Creating cross-platform mobile applications for iOS and Android. React Native and Flutter for native performance everywhere.",
        brief: "Develop cross-platform apps with native feel. Implement offline capabilities, push notifications, seamless API integration.",
        outcome: "10+ mobile apps on App Store and Play Store. 50K+ downloads with 4.5+ star ratings across applications.",
        media: [
            "/riso/dopple_mobile.png",
            "/riso/riso_mobile_app_1769726178940.png",
            "/riso/dopple_code.png",
        ],
    },
    {
        id: 6,
        title: "EDUCATION",
        color: "#F45156",
        bgColor: "#393735",
        textColor: "#FDFBF4",
        client: "Teaching programming to 500+ students of all ages. Engaging curriculum that makes coding accessible and fun for beginners to advanced.",
        brief: "Develop coding courses covering Python, JavaScript, Arduino, web dev. Create hands-on projects reinforcing learning.",
        outcome: "500+ students trained. 90% completion rate with many entering tech careers. Multiple courses running simultaneously.",
        media: [
            "/riso/dopple_classroom.png",
            "/riso/riso_coding_abstract_1769726112572.png",
            "/riso/dopple_hands.png",
        ],
    },
];

// Supreme Quantum Logo
function SupremeLogo({ className = "", size = 48 }: { className?: string; size?: number }) {
    return (
        <iframe
            src="/logo-supreme.svg"
            className={className}
            style={{ width: size, height: size, border: 'none', background: 'transparent', pointerEvents: 'none' }}
            title="Jahyeon Logo"
        />
    );
}

// Header
function Header() {
    return (
        <header className="dp4-header">
            <Link href="/" className="dp4-logo">
                <SupremeLogo size={50} />
            </Link>
            <nav className="dp4-nav">
                <Link href="/">PROJECTS</Link>
                <Link href="/resources">RESOURCES</Link>
                <a href="https://github.com/ProCodeJH" target="_blank">BLOG</a>
            </nav>
            <a href="mailto:contact@jahyeon.com" className="dp4-send">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 2L11 13" />
                    <polygon points="22,2 15,22 11,13 2,9" />
                </svg>
            </a>
        </header>
    );
}

// Hero
function Hero() {
    return (
        <section className="dp4-hero">
            <h1 className="dp4-hero-title">JAHYEON</h1>
            <div className="dp4-hero-subtitle">
                <span>EMBEDDED</span>
                <SupremeLogo className="dp4-hero-face" size={60} />
                <span className="dp4-pill">DEVELOPER</span>
            </div>
            <div className="dp4-scroll-cta">
                <span>CLICK TO</span>
                <span>SCROLL</span>
                <span className="dp4-hand">👆</span>
            </div>
        </section>
    );
}

// Intro Section - Photo collage + description + video
function IntroSection() {
    return (
        <section className="dp4-intro">
            <div className="dp4-intro-left">
                <div className="dp4-photo-grid">
                    <img src="/riso/dopple_workspace.png" alt="Workspace" />
                    <img src="/riso/dopple_circuit.png" alt="Circuit" />
                    <img src="/riso/dopple_hands.png" alt="Typing" />
                    <img src="/riso/dopple_code.png" alt="Code" />
                </div>
            </div>
            <div className="dp4-intro-right">
                <div className="dp4-faces-anim">
                    <SupremeLogo size={40} />
                    <SupremeLogo size={40} />
                    <SupremeLogo size={40} />
                    <SupremeLogo size={40} />
                </div>
                <p className="dp4-intro-text">
                    Led by embedded systems engineer <strong>Gu Jahyeon</strong>,
                    with over a decade of experience in firmware development,
                    full-stack web, and coding education. From Arduino projects
                    to cloud applications, creating innovative solutions that
                    connect hardware, software, and people.
                </p>
                <div className="dp4-intro-video">
                    <img src="/riso/dopple_classroom.png" alt="Teaching" />
                </div>
            </div>
        </section>
    );
}

// Accordion Component
function Accordion({
    items,
    color
}: {
    items: { label: string; content: string }[];
    color: string;
}) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="dp4-accordions">
            {items.map((item, idx) => (
                <div key={idx} className={`dp4-accordion ${openIndex === idx ? 'open' : ''}`}>
                    <button
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        style={{ borderColor: color, color: color }}
                    >
                        <span>{item.label}</span>
                        <span className="dp4-plus">+</span>
                    </button>
                    {openIndex === idx && (
                        <div className="dp4-accordion-body" style={{ color }}>
                            {item.content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// Project Section
function ProjectSection({ project }: { project: typeof projects[0] }) {
    const galleryRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (galleryRef.current) {
            galleryRef.current.scrollBy({
                left: dir === 'left' ? -400 : 400,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section
            className="dp4-project"
            style={{ backgroundColor: project.bgColor, color: project.textColor }}
        >
            <div className="dp4-project-left">
                <h2 className="dp4-project-title" style={{ color: project.color }}>
                    {project.title}
                </h2>
                <Accordion
                    items={[
                        { label: "Client", content: project.client },
                        { label: "Brief", content: project.brief },
                        { label: "Outcome", content: project.outcome },
                    ]}
                    color={project.color}
                />
            </div>

            <div className="dp4-project-right">
                <div className="dp4-gallery" ref={galleryRef}>
                    {project.media.map((src, idx) => (
                        <div key={idx} className="dp4-gallery-item">
                            <img src={src} alt={`${project.title} ${idx + 1}`} />
                        </div>
                    ))}
                </div>
                <button
                    className="dp4-arrow"
                    onClick={() => scroll('right')}
                >
                    →
                </button>
            </div>
        </section>
    );
}

// Stats
function Stats() {
    return (
        <section className="dp4-stats">
            <div className="dp4-stats-grid">
                <div><span>500+</span><small>STUDENTS TAUGHT</small></div>
                <div><span>50+</span><small>PROJECTS DELIVERED</small></div>
                <div><span>5+</span><small>YEARS EXPERIENCE</small></div>
                <div><span>99%</span><small>CLIENT SATISFACTION</small></div>
            </div>
        </section>
    );
}

// Footer
function Footer() {
    return (
        <footer className="dp4-footer">
            <div className="dp4-footer-links">
                <a href="https://instagram.com" target="_blank">FOLLOW JAHYEON</a>
            </div>
            <nav className="dp4-footer-nav">
                <Link href="/">PROJECTS</Link>
                <Link href="/resources">RESOURCES</Link>
                <a href="https://github.com/ProCodeJH">GITHUB</a>
                <a href="mailto:contact@jahyeon.com">CONTACT</a>
            </nav>
            <p>© 2024 Gu Jahyeon. Embedded Developer & Educator.</p>
        </footer>
    );
}

// Main
export default function HomeDopple() {
    return (
        <div className="dp4-page">
            <Header />
            <Hero />
            <IntroSection />
            {projects.map((p) => (
                <ProjectSection key={p.id} project={p} />
            ))}
            <Stats />
            <Footer />
        </div>
    );
}
