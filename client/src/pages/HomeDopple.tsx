/**
 * Dopple Press V3 - Exact Clone
 * With horizontal image galleries, accordions, and video support
 */

import { useState, useRef } from "react";
import { Link } from "wouter";
import "@/styles/dopple-v3.css";

// Face icons for decoration
const FaceIcon = ({ style = 1 }: { style?: number }) => {
    const faces = [
        // Style 1 - Simple outline
        <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="20" cy="20" r="18" />
            <circle cx="14" cy="16" r="3" fill="currentColor" />
            <circle cx="26" cy="16" r="3" fill="currentColor" />
            <path d="M12 26 Q20 32 28 26" />
        </svg>,
        // Style 2 - Wink
        <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="20" cy="20" r="18" />
            <circle cx="14" cy="16" r="3" fill="currentColor" />
            <path d="M23 16 L29 16" />
            <path d="M12 26 Q20 32 28 26" />
        </svg>,
        // Style 3 - Eyes only
        <svg viewBox="0 0 40 40" fill="currentColor">
            <circle cx="10" cy="20" r="8" />
            <circle cx="30" cy="20" r="8" />
        </svg>,
    ];
    return <span className="face-icon">{faces[style % faces.length]}</span>;
};

// Project data with multiple images and videos
const projects = [
    {
        id: 1,
        title: "EMBEDDED",
        titleColor: "#FF6816",
        bgColor: "#FDFBF4",
        textColor: "#393735",
        client: "Self-driven embedded systems development focusing on Arduino, ESP32, and industrial automation. Building IoT solutions that bridge hardware and software.",
        brief: "Design firmware for microcontrollers, sensor integration, and industrial automation. Create scalable code for embedded applications.",
        outcome: "50+ embedded projects including smart home, industrial sensors, and IoT gateways. Custom libraries used across multiple devices.",
        media: [
            { type: "image", src: "/riso/riso_embedded_dev_1769726045698.png" },
            { type: "image", src: "/riso/riso_tech_grid_1769726028754.png" },
            { type: "image", src: "/riso/riso_it_hero_1769726013146.png" },
        ],
    },
    {
        id: 2,
        title: "WEB DEV",
        titleColor: "#E69AC5",
        bgColor: "#393735",
        textColor: "#FDFBF4",
        client: "Building modern web applications with React, TypeScript, Node.js, and cloud-native architectures for various clients.",
        brief: "Develop responsive, performant web applications with modern frameworks. Create intuitive interfaces backed by robust APIs.",
        outcome: "20+ web applications including portfolio sites, e-commerce, and SaaS tools with React, Next.js, Express.",
        media: [
            { type: "image", src: "/riso/riso_web_dev_1769726143789.png" },
            { type: "image", src: "/riso/riso_coding_abstract_1769726112572.png" },
            { type: "image", src: "/riso/riso_server_cloud_1769726159655.png" },
        ],
    },
    {
        id: 3,
        title: "AI & ML",
        titleColor: "#A5CA6D",
        bgColor: "#FDFBF4",
        textColor: "#393735",
        client: "Exploring artificial intelligence and machine learning applications. Building intelligent systems that learn and adapt.",
        brief: "Implement ML models for image recognition, NLP, and predictive analytics. Integrate AI into existing applications.",
        outcome: "AI-powered chatbots, recommendation systems, and computer vision apps using TensorFlow and PyTorch.",
        media: [
            { type: "image", src: "/riso/riso_ai_robot_1769726128019.png" },
            { type: "image", src: "/riso/riso_coding_abstract_1769726112572.png" },
        ],
    },
    {
        id: 4,
        title: "CLOUD",
        titleColor: "#88B9D2",
        bgColor: "#393735",
        textColor: "#FDFBF4",
        client: "Designing cloud-native infrastructure on AWS, Azure, and Google Cloud for scalable enterprise solutions.",
        brief: "Architect cloud infrastructure for high availability. Implement CI/CD, containerization, and serverless functions.",
        outcome: "Infrastructure serving millions of requests. Kubernetes clusters and automated deployments for multiple organizations.",
        media: [
            { type: "image", src: "/riso/riso_server_cloud_1769726159655.png" },
            { type: "image", src: "/riso/riso_tech_grid_1769726028754.png" },
        ],
    },
    {
        id: 5,
        title: "MOBILE",
        titleColor: "#EEDC46",
        bgColor: "#FDFBF4",
        textColor: "#393735",
        client: "Creating cross-platform mobile applications for iOS and Android using React Native and Flutter.",
        brief: "Develop cross-platform apps with native performance. Implement offline capabilities and push notifications.",
        outcome: "10+ mobile apps on App Store and Play Store. 50K+ downloads with 4.5+ star ratings.",
        media: [
            { type: "image", src: "/riso/riso_mobile_app_1769726178940.png" },
            { type: "image", src: "/riso/riso_web_dev_1769726143789.png" },
        ],
    },
    {
        id: 6,
        title: "EDUCATION",
        titleColor: "#F45156",
        bgColor: "#FDFBF4",
        textColor: "#393735",
        client: "Teaching programming to 500+ students of all ages. Creating curriculum that makes coding accessible and fun.",
        brief: "Develop coding courses covering Python, JavaScript, Arduino, and web dev. Create hands-on projects.",
        outcome: "500+ students trained. 90% completion rate with many entering tech careers.",
        media: [
            { type: "image", src: "/riso/riso_coding_abstract_1769726112572.png" },
            { type: "image", src: "/riso/riso_ai_robot_1769726128019.png" },
            { type: "image", src: "/riso/riso_embedded_dev_1769726045698.png" },
        ],
    },
];

// Header
function Header() {
    return (
        <header className="dp-header">
            <Link href="/" className="dp-logo-icon">
                <FaceIcon style={2} />
            </Link>
            <nav className="dp-nav">
                <Link href="/">PROJECTS</Link>
                <Link href="/resources">RESOURCES</Link>
                <a href="https://github.com/ProCodeJH" target="_blank">GITHUB</a>
            </nav>
            <a href="mailto:contact@jahyeon.com" className="dp-contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
            </a>
        </header>
    );
}

// Hero Section
function Hero() {
    return (
        <section className="dp-hero">
            <div className="dp-hero-content">
                <h1 className="dp-hero-title">
                    <span className="dp-title-text">JAHYEON</span>
                </h1>
                <div className="dp-hero-subtitle">
                    <span>EMBEDDED</span>
                    <FaceIcon style={2} />
                    <span className="dp-outline-text">DEVELOPER</span>
                </div>
            </div>
            <div className="dp-scroll-indicator">
                <span>CLICK TO</span>
                <span>SCROLL</span>
                <span className="dp-scroll-hand">👆</span>
            </div>
        </section>
    );
}

// Intro Section with photos and video
function IntroSection() {
    return (
        <section className="dp-intro">
            <div className="dp-intro-photos">
                <img src="/riso/riso_it_hero_1769726013146.png" alt="Work 1" />
                <img src="/riso/riso_embedded_dev_1769726045698.png" alt="Work 2" />
                <img src="/riso/riso_tech_grid_1769726028754.png" alt="Work 3" />
            </div>
            <div className="dp-intro-content">
                <div className="dp-faces-row">
                    <FaceIcon style={0} />
                    <FaceIcon style={1} />
                    <FaceIcon style={2} />
                    <FaceIcon style={0} />
                </div>
                <p className="dp-intro-text">
                    Led by embedded systems engineer <strong>Gu Jahyeon</strong>,
                    with experience in firmware development, full-stack web, and coding education.
                    From Arduino projects to cloud applications, creating innovative solutions
                    that connect hardware, software, and people.
                </p>
                <div className="dp-intro-video">
                    <video autoPlay muted loop playsInline>
                        <source src="https://images.unsplash.com/photo-placeholder.mp4" type="video/mp4" />
                        <img src="/riso/riso_ai_robot_1769726128019.png" alt="Video placeholder" />
                    </video>
                </div>
            </div>
        </section>
    );
}

// Accordion Item
function AccordionItem({
    label,
    content,
    isOpen,
    onToggle,
    color
}: {
    label: string;
    content: string;
    isOpen: boolean;
    onToggle: () => void;
    color: string;
}) {
    return (
        <div className={`dp-accordion-item ${isOpen ? 'open' : ''}`}>
            <button
                className="dp-accordion-header"
                onClick={onToggle}
                style={{ borderColor: color, color: color }}
            >
                <span>{label}</span>
                <span className="dp-accordion-icon">+</span>
            </button>
            {isOpen && (
                <div className="dp-accordion-content" style={{ color }}>
                    {content}
                </div>
            )}
        </div>
    );
}

// Project Section with horizontal gallery
function ProjectSection({ project }: { project: typeof projects[0] }) {
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const galleryRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (galleryRef.current) {
            const scrollAmount = 400;
            galleryRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section
            className="dp-project"
            style={{ backgroundColor: project.bgColor, color: project.textColor }}
        >
            <div className="dp-project-left">
                <h2
                    className="dp-project-title"
                    style={{ color: project.titleColor }}
                >
                    {project.title}
                </h2>

                <div className="dp-accordions">
                    <AccordionItem
                        label="Client"
                        content={project.client}
                        isOpen={openAccordion === 'client'}
                        onToggle={() => setOpenAccordion(openAccordion === 'client' ? null : 'client')}
                        color={project.titleColor}
                    />
                    <AccordionItem
                        label="Brief"
                        content={project.brief}
                        isOpen={openAccordion === 'brief'}
                        onToggle={() => setOpenAccordion(openAccordion === 'brief' ? null : 'brief')}
                        color={project.titleColor}
                    />
                    <AccordionItem
                        label="Outcome"
                        content={project.outcome}
                        isOpen={openAccordion === 'outcome'}
                        onToggle={() => setOpenAccordion(openAccordion === 'outcome' ? null : 'outcome')}
                        color={project.titleColor}
                    />
                </div>
            </div>

            <div className="dp-project-right">
                <div className="dp-gallery" ref={galleryRef}>
                    {project.media.map((item, idx) => (
                        <div key={idx} className="dp-gallery-item">
                            {item.type === 'video' ? (
                                <video autoPlay muted loop playsInline>
                                    <source src={item.src} type="video/mp4" />
                                </video>
                            ) : (
                                <img src={item.src} alt={`${project.title} ${idx + 1}`} />
                            )}
                        </div>
                    ))}
                </div>

                <button
                    className="dp-gallery-arrow right"
                    onClick={() => scroll('right')}
                    style={{ color: project.titleColor }}
                >
                    →
                </button>
            </div>
        </section>
    );
}

// Stats Section
function StatsSection() {
    return (
        <section className="dp-stats">
            <h3>ACHIEVEMENTS</h3>
            <div className="dp-stats-grid">
                <div><span>500+</span><small>STUDENTS</small></div>
                <div><span>50+</span><small>PROJECTS</small></div>
                <div><span>5+</span><small>YEARS</small></div>
                <div><span>99%</span><small>SATISFACTION</small></div>
            </div>
        </section>
    );
}

// Footer
function Footer() {
    return (
        <footer className="dp-footer">
            <div className="dp-footer-inner">
                <nav>
                    <Link href="/">PROJECTS</Link>
                    <Link href="/resources">RESOURCES</Link>
                    <a href="https://github.com/ProCodeJH">GITHUB</a>
                </nav>
                <p>© 2024 Gu Jahyeon</p>
            </div>
        </footer>
    );
}

// Main Page
export default function HomeDopple() {
    return (
        <div className="dp-page">
            <Header />
            <Hero />
            <IntroSection />

            {projects.map((project) => (
                <ProjectSection key={project.id} project={project} />
            ))}

            <StatsSection />
            <Footer />
        </div>
    );
}
