/**
 * Dopple Press Design Page - Exact Layout Clone
 * Based on dopplepress.com/design
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import "@/styles/dopple-v2.css";

// Project Data - Matching Dopple Press Client/Brief/Outcome Format
const projects = [
    {
        id: 1,
        title: "EMBEDDED SYSTEMS",
        client: {
            name: "Personal Engineering",
            desc: "Self-driven embedded systems development focusing on Arduino, ESP32, and industrial automation. Building IoT solutions that bridge hardware and software for real-world applications in smart homes and industrial settings."
        },
        brief: "Design and develop firmware for microcontrollers, sensor integration, and industrial automation systems. Create scalable, maintainable code for embedded applications with focus on reliability.",
        outcome: "Delivered 50+ embedded projects including smart home automation, industrial sensors, and IoT gateways. Developed custom libraries and frameworks used across multiple device platforms.",
        accentColor: "#FF6816", // Orange
        bgColor: "#FDFBF4",
        textColor: "#393735",
        image: "/riso/riso_embedded_dev_1769726045698.png",
    },
    {
        id: 2,
        title: "FULL-STACK WEB",
        client: {
            name: "Various Clients",
            desc: "Building modern web applications with React, TypeScript, Node.js, and cloud-native architectures. From concept to deployment, creating scalable digital experiences that connect users with services."
        },
        brief: "Develop responsive, performant web applications with modern frameworks. Create intuitive user interfaces backed by robust APIs and cloud databases with focus on user experience.",
        outcome: "Launched 20+ web applications including portfolio sites, e-commerce platforms, and SaaS tools. Utilized React, Next.js, Express, and PostgreSQL for production-ready solutions.",
        accentColor: "#E69AC5", // Pink
        bgColor: "#393735",
        textColor: "#FDFBF4",
        image: "/riso/riso_web_dev_1769726143789.png",
    },
    {
        id: 3,
        title: "AI & MACHINE LEARNING",
        client: {
            name: "R&D Projects",
            desc: "Exploring artificial intelligence and machine learning applications. Building intelligent systems that learn, adapt, and solve complex problems across various domains."
        },
        brief: "Implement ML models for image recognition, natural language processing, and predictive analytics. Integrate AI capabilities into existing applications for enhanced functionality.",
        outcome: "Created AI-powered tools including chatbots, recommendation systems, and computer vision applications. Deployed models using TensorFlow, PyTorch, and cloud AI services.",
        accentColor: "#A5CA6D", // Green
        bgColor: "#FDFBF4",
        textColor: "#393735",
        image: "/riso/riso_ai_robot_1769726128019.png",
    },
    {
        id: 4,
        title: "CLOUD INFRASTRUCTURE",
        client: {
            name: "Enterprise Solutions",
            desc: "Designing and deploying cloud-native infrastructure. Building scalable, secure, and cost-effective solutions on AWS, Azure, and Google Cloud platforms for modern businesses."
        },
        brief: "Architect cloud infrastructure for high availability and performance. Implement CI/CD pipelines, containerization, and serverless functions for rapid deployment cycles.",
        outcome: "Deployed infrastructure serving millions of requests. Set up Kubernetes clusters, automated deployments, and monitoring dashboards for multiple organizations.",
        accentColor: "#88B9D2", // Blue
        bgColor: "#393735",
        textColor: "#FDFBF4",
        image: "/riso/riso_server_cloud_1769726159655.png",
    },
    {
        id: 5,
        title: "MOBILE APP DEV",
        client: {
            name: "Cross-Platform",
            desc: "Creating mobile applications for iOS and Android using React Native and Flutter. Building seamless experiences across devices and platforms with native performance."
        },
        brief: "Develop cross-platform mobile apps with native performance. Implement offline capabilities, push notifications, and seamless API integration for engaging user experiences.",
        outcome: "Published 10+ mobile applications on App Store and Play Store. Achieved 50K+ downloads with 4.5+ star ratings across applications.",
        accentColor: "#EEDC46", // Yellow
        bgColor: "#FDFBF4",
        textColor: "#393735",
        image: "/riso/riso_mobile_app_1769726178940.png",
    },
    {
        id: 6,
        title: "CODING EDUCATION",
        client: {
            name: "500+ Students",
            desc: "Teaching programming fundamentals and advanced concepts to students of all ages. Creating engaging curriculum that makes coding accessible and fun for beginners to advanced learners."
        },
        brief: "Develop comprehensive coding courses covering Python, JavaScript, Arduino, and web development. Create hands-on projects that reinforce learning through practical application.",
        outcome: "Trained over 500 students in programming. 90% completion rate with many students continuing to advanced courses or entering tech careers successfully.",
        accentColor: "#F45156", // Red
        bgColor: "#FDFBF4",
        textColor: "#393735",
        image: "/riso/riso_coding_abstract_1769726112572.png",
    },
];

// Header Component
function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`dopple-header ${scrolled ? 'scrolled' : ''}`}>
            <Link href="/" className="dopple-logo">
                GU JAHYEON
            </Link>
            <nav className="dopple-nav">
                <Link href="/" className="dopple-nav-item active">PROJECTS</Link>
                <Link href="/resources" className="dopple-nav-item">RESOURCES</Link>
                <a href="https://github.com/ProCodeJH" target="_blank" className="dopple-nav-item">GITHUB</a>
                <a href="mailto:contact@jahyeon.com" className="dopple-nav-item">CONTACT</a>
            </nav>
        </header>
    );
}

// Hero Section - Dopple style
function Hero() {
    return (
        <section className="dopple-hero">
            <div className="dopple-hero-scroll">
                <span>CLICK TO</span>
                <span>SCROLL</span>
            </div>
            <div className="dopple-hero-content">
                <p className="dopple-hero-tags">
                    EMBEDDED - WEB DEVELOPMENT - AI - EDUCATION
                </p>
                <p className="dopple-hero-intro">
                    Led by embedded systems engineer <strong>Gu Jahyeon</strong>,
                    with experience in firmware development, full-stack web, and coding education.
                    From Arduino projects to cloud applications, creating innovative solutions
                    that connect hardware, software, and people through technology.
                </p>
            </div>
        </section>
    );
}

// Project Section Component - Exact Dopple Layout
function ProjectSection({ project }: { project: typeof projects[0] }) {
    const [imageIndex, setImageIndex] = useState(0);

    return (
        <section
            className="dopple-project"
            style={{
                backgroundColor: project.bgColor,
                color: project.textColor,
            }}
        >
            <div className="dopple-project-inner">
                {/* Left: Image Gallery */}
                <div className="dopple-project-gallery">
                    <div className="dopple-project-image-container">
                        <img
                            src={project.image}
                            alt={project.title}
                            className="dopple-project-image"
                        />
                    </div>
                    {/* Navigation Arrows */}
                    <div className="dopple-gallery-nav">
                        <button
                            className="dopple-arrow-btn"
                            style={{ borderColor: project.accentColor, color: project.accentColor }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            className="dopple-arrow-btn"
                            style={{ borderColor: project.accentColor, color: project.accentColor }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Right: Project Info */}
                <div className="dopple-project-info">
                    <h2
                        className="dopple-project-title"
                        style={{ color: project.accentColor }}
                    >
                        {project.title}
                    </h2>

                    {/* Client */}
                    <div className="dopple-info-block">
                        <h4
                            className="dopple-info-label"
                            style={{ color: project.accentColor }}
                        >
                            Client
                        </h4>
                        <p className="dopple-info-text">{project.client.desc}</p>
                    </div>

                    {/* Brief */}
                    <div className="dopple-info-block">
                        <h4
                            className="dopple-info-label"
                            style={{ color: project.accentColor }}
                        >
                            Brief
                        </h4>
                        <p className="dopple-info-text">{project.brief}</p>
                    </div>

                    {/* Outcome */}
                    <div className="dopple-info-block">
                        <h4
                            className="dopple-info-label"
                            style={{ color: project.accentColor }}
                        >
                            Outcome
                        </h4>
                        <p className="dopple-info-text">{project.outcome}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Stats Section
function StatsSection() {
    return (
        <section className="dopple-stats">
            <h3 className="dopple-stats-title">EXPERIENCE & ACHIEVEMENTS</h3>
            <div className="dopple-stats-grid">
                <div className="dopple-stat-item">
                    <span className="dopple-stat-value">500+</span>
                    <span className="dopple-stat-label">STUDENTS TAUGHT</span>
                </div>
                <div className="dopple-stat-item">
                    <span className="dopple-stat-value">50+</span>
                    <span className="dopple-stat-label">PROJECTS DELIVERED</span>
                </div>
                <div className="dopple-stat-item">
                    <span className="dopple-stat-value">5+</span>
                    <span className="dopple-stat-label">YEARS EXPERIENCE</span>
                </div>
                <div className="dopple-stat-item">
                    <span className="dopple-stat-value">99%</span>
                    <span className="dopple-stat-label">CLIENT SATISFACTION</span>
                </div>
            </div>
        </section>
    );
}

// Footer Component
function Footer() {
    return (
        <footer className="dopple-footer">
            <div className="dopple-footer-inner">
                <div className="dopple-footer-nav">
                    <Link href="/">PROJECTS</Link>
                    <Link href="/resources">RESOURCES</Link>
                    <a href="https://github.com/ProCodeJH" target="_blank">GITHUB</a>
                    <a href="mailto:contact@jahyeon.com">CONTACT</a>
                </div>
                <div className="dopple-footer-social">
                    <a href="https://github.com/ProCodeJH" target="_blank">GITHUB</a>
                    <a href="https://linkedin.com" target="_blank">LINKEDIN</a>
                </div>
                <p className="dopple-footer-copy">
                    © 2024 Gu Jahyeon. Embedded Developer & Educator.
                </p>
            </div>
        </footer>
    );
}

// Main Page
export default function HomeDopple() {
    return (
        <div className="dopple-page">
            <Header />
            <Hero />

            {projects.map((project) => (
                <ProjectSection key={project.id} project={project} />
            ))}

            <StatsSection />
            <Footer />
        </div>
    );
}
