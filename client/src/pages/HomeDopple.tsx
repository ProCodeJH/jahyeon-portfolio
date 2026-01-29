/**
 * Dopple Press Style Home Page
 * Exact clone of dopplepress.com/design layout
 */

import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import "@/styles/dopple-theme.css";

// Project Data
const projects = [
    {
        id: 1,
        title: "Embedded Systems Development",
        client: "Personal Engineering Projects",
        clientDesc: "Self-driven embedded systems development focusing on Arduino, ESP32, and industrial automation. Building IoT solutions that bridge hardware and software for real-world applications.",
        brief: "Design and develop firmware for microcontrollers, sensor integration, and industrial automation systems. Create scalable, maintainable code for embedded applications.",
        outcome: "Delivered 50+ embedded projects including smart home automation, industrial sensors, and IoT gateways. Developed custom libraries and frameworks used across multiple devices.",
        color: "#FF6816", // Orange
        bgColor: "#FDFBF4",
        images: ["/riso/riso_embedded_dev_1769726045698.png"],
    },
    {
        id: 2,
        title: "Full-Stack Web Development",
        client: "Various Clients & Personal Projects",
        clientDesc: "Building modern web applications with React, TypeScript, Node.js, and cloud-native architectures. From concept to deployment, creating scalable digital experiences.",
        brief: "Develop responsive, performant web applications with modern frameworks. Create intuitive user interfaces backed by robust APIs and databases.",
        outcome: "Launched 20+ web applications including portfolio sites, e-commerce platforms, and SaaS tools. Utilized React, Next.js, Express, and PostgreSQL for production-ready solutions.",
        color: "#E69AC5", // Pink
        bgColor: "#393735",
        textColor: "#FDFBF4",
        images: ["/riso/riso_web_dev_1769726143789.png"],
    },
    {
        id: 3,
        title: "AI & Machine Learning",
        client: "Research & Development",
        clientDesc: "Exploring artificial intelligence and machine learning applications. Building intelligent systems that learn, adapt, and solve complex problems.",
        brief: "Implement ML models for image recognition, natural language processing, and predictive analytics. Integrate AI capabilities into existing applications.",
        outcome: "Created AI-powered tools including chatbots, recommendation systems, and computer vision applications. Deployed models using TensorFlow, PyTorch, and cloud AI services.",
        color: "#A5CA6D", // Green
        bgColor: "#FDFBF4",
        images: ["/riso/riso_ai_robot_1769726128019.png"],
    },
    {
        id: 4,
        title: "Cloud Infrastructure",
        client: "Enterprise Solutions",
        clientDesc: "Designing and deploying cloud-native infrastructure. Building scalable, secure, and cost-effective solutions on AWS, Azure, and Google Cloud.",
        brief: "Architect cloud infrastructure for high availability and performance. Implement CI/CD pipelines, containerization, and serverless functions.",
        outcome: "Deployed infrastructure serving millions of requests. Set up Kubernetes clusters, automated deployments, and monitoring dashboards for multiple organizations.",
        color: "#88B9D2", // Blue
        bgColor: "#393735",
        textColor: "#FDFBF4",
        images: ["/riso/riso_server_cloud_1769726159655.png"],
    },
    {
        id: 5,
        title: "Mobile App Development",
        client: "Cross-Platform Solutions",
        clientDesc: "Creating mobile applications for iOS and Android using React Native and Flutter. Building seamless experiences across devices and platforms.",
        brief: "Develop cross-platform mobile apps with native performance. Implement offline capabilities, push notifications, and seamless API integration.",
        outcome: "Published 10+ mobile applications on App Store and Play Store. Achieved 50K+ downloads with 4.5+ star ratings across apps.",
        color: "#EEDC46", // Yellow
        bgColor: "#FDFBF4",
        images: ["/riso/riso_mobile_app_1769726178940.png"],
    },
    {
        id: 6,
        title: "Coding Education",
        client: "500+ Students",
        clientDesc: "Teaching programming fundamentals and advanced concepts to students of all ages. Creating engaging curriculum that makes coding accessible and fun.",
        brief: "Develop comprehensive coding courses covering Python, JavaScript, Arduino, and web development. Create hands-on projects that reinforce learning.",
        outcome: "Trained over 500 students in programming. 90% completion rate with many students continuing to advanced courses or entering tech careers.",
        color: "#F45156", // Red
        bgColor: "#FDFBF4",
        images: ["/riso/riso_coding_abstract_1769726112572.png"],
    },
];

// Header Component
function DoppleHeader() {
    return (
        <header className="dopple-header">
            <div className="dopple-header-content">
                <Link href="/">
                    <span className="dopple-logo">GU JAHYEON</span>
                </Link>
                <nav className="dopple-nav">
                    <Link href="/" className="dopple-nav-link active">PROJECTS</Link>
                    <Link href="/resources" className="dopple-nav-link">RESOURCES</Link>
                    <a href="https://github.com/ProCodeJH" target="_blank" className="dopple-nav-link">GITHUB</a>
                    <a href="mailto:contact@jahyeon.com" className="dopple-nav-link">CONTACT</a>
                </nav>
            </div>
        </header>
    );
}

// Hero Section
function DoppleHero() {
    return (
        <section className="dopple-hero">
            <div className="dopple-hero-content">
                <p className="dopple-hero-tagline">
                    EMBEDDED - WEB DEVELOPMENT - AI - EDUCATION
                </p>
                <p className="dopple-hero-description">
                    Led by embedded systems engineer Gu Jahyeon, with experience in firmware development,
                    full-stack web, and coding education. From Arduino projects to cloud applications,
                    creating innovative solutions that connect hardware, software, and people.
                </p>
            </div>
            <div className="dopple-scroll-indicator">
                <span>CLICK TO</span>
                <span>SCROLL</span>
            </div>
        </section>
    );
}

// Project Card Component
function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const bgStyle = {
        backgroundColor: project.bgColor,
        color: project.textColor || "#393735",
    };

    return (
        <section
            ref={cardRef}
            className={`dopple-project-section ${isExpanded ? 'expanded' : ''}`}
            style={bgStyle}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="dopple-project-content">
                {/* Left Side - Image */}
                <div className="dopple-project-image">
                    <img src={project.images[0]} alt={project.title} />
                    <div
                        className="dopple-project-image-overlay"
                        style={{ backgroundColor: project.color }}
                    />
                </div>

                {/* Right Side - Info */}
                <div className="dopple-project-info">
                    <h2 className="dopple-project-title" style={{ color: project.color }}>
                        {project.title}
                    </h2>

                    <div className="dopple-project-details">
                        <div className="dopple-detail-section">
                            <h4 className="dopple-detail-label" style={{ color: project.color }}>Client</h4>
                            <p className="dopple-detail-text">{project.clientDesc}</p>
                        </div>

                        <div className="dopple-detail-section">
                            <h4 className="dopple-detail-label" style={{ color: project.color }}>Brief</h4>
                            <p className="dopple-detail-text">{project.brief}</p>
                        </div>

                        <div className="dopple-detail-section">
                            <h4 className="dopple-detail-label" style={{ color: project.color }}>Outcome</h4>
                            <p className="dopple-detail-text">{project.outcome}</p>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="dopple-nav-arrows">
                        <button
                            className="dopple-arrow"
                            style={{
                                borderColor: project.color,
                                color: project.color,
                            }}
                        >
                            ←
                        </button>
                        <button
                            className="dopple-arrow"
                            style={{
                                borderColor: project.color,
                                color: project.color,
                            }}
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Corporate Clients Section
function CorporateClients() {
    const stats = [
        { value: "500+", label: "Students Taught" },
        { value: "50+", label: "Projects Delivered" },
        { value: "5+", label: "Years Experience" },
        { value: "99%", label: "Client Satisfaction" },
    ];

    return (
        <section className="dopple-clients">
            <h3 className="dopple-clients-title">EXPERIENCE & STATS</h3>
            <div className="dopple-clients-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="dopple-stat">
                        <span className="dopple-stat-value">{stat.value}</span>
                        <span className="dopple-stat-label">{stat.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

// Footer Component
function DoppleFooter() {
    return (
        <footer className="dopple-footer">
            <div className="dopple-footer-content">
                <div className="dopple-footer-links">
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
                    © 2024 Gu Jahyeon. Embedded Developer Portfolio.
                </p>
            </div>
        </footer>
    );
}

// Main Page Component
export default function HomeDopple() {
    useEffect(() => {
        // Smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    return (
        <div className="dopple-page">
            <DoppleHeader />
            <DoppleHero />

            {/* Project Sections */}
            {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
            ))}

            <CorporateClients />
            <DoppleFooter />
        </div>
    );
}
