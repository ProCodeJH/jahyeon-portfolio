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
            "/images/hero_embedded_systems_1769740957235.png",
            "/images/arduino_project_1769740992692.png",
            "/images/circuit_design_1769741026490.png",
            "/images/sensor_collection_1769741106956.png",
            "/images/led_matrix_display_1769741072055.png",
            "/images/electronics_tools_1769741178781.png",
        ],
    },
    {
        id: 2,
        title: "INDUSTRIAL",
        color: "#1E3A8A",
        bgColor: "#393735",
        textColor: "#FDFBF4",
        client: "Enterprise-level factory automation and industrial control systems. Working with Samsung, Hyundai, and major Korean manufacturers on smart factory solutions.",
        brief: "Design PLC control systems, SCADA interfaces, and robotic automation. Integrate legacy systems with modern IoT platforms.",
        outcome: "Production lines at Samsung Electronics, SK Hynix cleanrooms, Hyundai automotive assembly. 99.9% uptime on critical systems.",
        media: [
            "/images/factory_automation_1769741243633.png",
            "/images/plc_control_panel_1769741256087.png",
            "/images/industrial_robot_arm_1769741272309.png",
            "/images/semiconductor_cleanroom_1769741336755.png",
            "/images/scada_control_room_1769741353159.png",
            "/images/automotive_production_1769741371086.png",
        ],
    },
    {
        id: 3,
        title: "FULL-STACK",
        color: "#4361EE",
        bgColor: "#FDFBF4",
        textColor: "#393735",
        client: "Building web applications with React, TypeScript, Node.js, and cloud-native architectures. From concept to deployment for various clients worldwide.",
        brief: "Develop responsive, performant web apps with modern frameworks. Create intuitive UIs backed by robust APIs and cloud databases.",
        outcome: "20+ web applications including portfolios, e-commerce, SaaS tools. React, Next.js, Express, PostgreSQL for production solutions.",
        media: [
            "/images/code_terminal_1769741124944.png",
            "/images/coding_education_1769740973936.png",
            "/images/classroom_modern_1769741091945.png",
            "/images/python_data_science_1769741009921.png",
            "/images/riso_dashboard_1769732029385.png",
            "/images/riso_ui_design_1769731966735.png",
        ],
    },
    {
        id: 4,
        title: "AI & ML",
        color: "#45B69C",
        bgColor: "#393735",
        textColor: "#FDFBF4",
        client: "Exploring artificial intelligence and machine learning applications. Building intelligent systems that learn, adapt, and solve complex problems.",
        brief: "Implement ML models for image recognition, NLP, predictive analytics. Integrate AI capabilities into existing applications.",
        outcome: "AI-powered chatbots, recommendation systems, computer vision apps. Deployed using TensorFlow, PyTorch, and cloud AI services.",
        media: [
            "/images/ai_neural_network_1769741216251.png",
            "/images/python_data_science_1769741009921.png",
            "/images/riso_neural_network_1769732045994.png",
            "/images/riso_ai_robot_1769726128019.png",
            "/images/inspection_quality_1769741403760.png",
            "/images/code_terminal_1769741124944.png",
        ],
    },
    {
        id: 5,
        title: "CLOUD",
        color: "#A78BFA",
        bgColor: "#FDFBF4",
        textColor: "#393735",
        client: "Designing cloud-native infrastructure on AWS, Azure, and Google Cloud. Scalable, secure, cost-effective enterprise solutions.",
        brief: "Architect cloud infrastructure for high availability. Implement CI/CD pipelines, containerization, serverless functions.",
        outcome: "Infrastructure serving millions of requests. Kubernetes clusters, automated deployments, monitoring for multiple organizations.",
        media: [
            "/images/server_datacenter_1769741292859.png",
            "/images/raspberry_pi_cluster_1769741200248.png",
            "/images/riso_server_rack_1769732469257.png",
            "/images/riso_server_cloud_1769726159655.png",
            "/images/scada_control_room_1769741353159.png",
            "/images/engineer_workspace_1769741311071.png",
        ],
    },
    {
        id: 6,
        title: "ROBOTICS",
        color: "#EEDC46",
        bgColor: "#393735",
        textColor: "#FDFBF4",
        client: "Building robots for education and industrial automation. From Arduino-based hobby robots to industrial robot arm programming.",
        brief: "Design and program robotic systems. Sensor fusion, motor control, autonomous navigation, and machine vision integration.",
        outcome: "Educational robot kits used by 200+ students. Custom industrial robotic solutions for SME manufacturers.",
        media: [
            "/images/arduino_project_1769740992692.png",
            "/images/drone_build_1769741147166.png",
            "/images/industrial_robot_arm_1769741272309.png",
            "/images/riso_robot_arm_1769731994706.png",
            "/images/3d_printer_project_1769741163332.png",
            "/images/smart_home_iot_1769741051979.png",
        ],
    },
    {
        id: 7,
        title: "EDUCATION",
        color: "#F45156",
        bgColor: "#FDFBF4",
        textColor: "#393735",
        client: "Teaching programming to 500+ students of all ages. Engaging curriculum that makes coding accessible and fun for beginners to advanced.",
        brief: "Develop coding courses covering Python, JavaScript, Arduino, web dev. Create hands-on projects reinforcing learning.",
        outcome: "500+ students trained. 90% completion rate with many entering tech careers. Multiple courses running simultaneously.",
        media: [
            "/images/classroom_modern_1769741091945.png",
            "/images/coding_education_1769740973936.png",
            "/images/riso_workshop_1769732010470.png",
            "/images/riso_team_meeting_1769732452805.png",
            "/images/engineer_workspace_1769741311071.png",
            "/images/cnc_machining_1769741387782.png",
        ],
    },
];

// Supreme Quantum Logo - Inline SVG with CSS Animations
function SupremeLogo({ size = 48 }: { size?: number }) {
    return (
        <svg
            viewBox="0 0 100 100"
            style={{ width: size, height: size }}
            xmlns="http://www.w3.org/2000/svg"
        >
            <style>{`
                @keyframes spin1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes spin2 { from { transform: rotate(120deg); } to { transform: rotate(480deg); } }
                @keyframes spin3 { from { transform: rotate(240deg); } to { transform: rotate(600deg); } }
                @keyframes pulse { 0%, 100% { opacity: 0.7; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
                .orbit1 { animation: spin1 8s linear infinite; transform-origin: 50px 50px; }
                .orbit2 { animation: spin2 12s linear infinite; transform-origin: 50px 50px; }
                .orbit3 { animation: spin3 16s linear infinite; transform-origin: 50px 50px; }
                .core { animation: pulse 2s ease-in-out infinite; transform-origin: 50px 50px; }
            `}</style>
            <defs>
                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00D9FF" />
                    <stop offset="100%" stopColor="#00FF87" />
                </linearGradient>
                <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF00E5" />
                    <stop offset="100%" stopColor="#FF6B00" />
                </linearGradient>
                <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7B2FFF" />
                    <stop offset="100%" stopColor="#00C6FF" />
                </linearGradient>
            </defs>
            {/* Rotating Orbits */}
            <ellipse className="orbit1" cx="50" cy="50" rx="45" ry="18" stroke="url(#g1)" strokeWidth="1" fill="none" opacity="0.5" />
            <ellipse className="orbit2" cx="50" cy="50" rx="45" ry="18" stroke="url(#g2)" strokeWidth="1" fill="none" opacity="0.5" />
            <ellipse className="orbit3" cx="50" cy="50" rx="45" ry="18" stroke="url(#g3)" strokeWidth="1" fill="none" opacity="0.5" />
            {/* Hexagon */}
            <polygon points="50,15 78,31 78,69 50,85 22,69 22,31" stroke="url(#g3)" strokeWidth="2" fill="none" />
            {/* Cube */}
            <polygon points="50,28 68,38 50,48 32,38" fill="url(#g3)" opacity="0.9" />
            <polygon points="32,38 50,48 50,65 32,55" fill="#5F72FF" opacity="0.85" />
            <polygon points="68,38 50,48 50,65 68,55" fill="#7B2FFF" opacity="0.85" />
            {/* Core */}
            <circle className="core" cx="50" cy="45" r="8" fill="url(#g1)" opacity="0.8" />
            <circle cx="50" cy="45" r="4" fill="#fff" />
        </svg>
    );
}

// Header
function Header() {
    return (
        <header className="dp4-header">
            <Link href="/" className="dp4-logo">
                <SupremeLogo size={70} />
            </Link>
            <nav className="dp4-nav">
                <Link href="/">PROJECTS</Link>
                <Link href="/resources">RESOURCES</Link>
                <Link href="/blog">BLOG</Link>
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
                <SupremeLogo size={100} />
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
                    <SupremeLogo size={60} />
                    <SupremeLogo size={60} />
                    <SupremeLogo size={60} />
                    <SupremeLogo size={60} />
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

// Project Section - Dense Masonry Grid
function ProjectSection({ project }: { project: typeof projects[0] }) {
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
                <div className="dp4-masonry">
                    {project.media.map((src, idx) => (
                        <div
                            key={idx}
                            className={`dp4-masonry-item ${idx === 0 ? 'dp4-masonry-large' : ''}`}
                        >
                            <img src={src} alt={`${project.title} ${idx + 1}`} />
                        </div>
                    ))}
                </div>
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
                <Link href="/blog">BLOG</Link>
                <a href="mailto:contact@jahyeon.com">CONTACT</a>
            </nav>
            <p>© 2024 Gu Jahyeon. Embedded Developer & Educator.</p>
        </footer>
    );
}

// Floating Messenger Chat Widget
function MessengerWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Open mailto with pre-filled content
        const subject = encodeURIComponent(`Message from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
        window.location.href = `mailto:contact@jahyeon.com?subject=${subject}&body=${body}`;
        setSent(true);
        setTimeout(() => {
            setSent(false);
            setIsOpen(false);
            setName('');
            setEmail('');
            setMessage('');
        }, 2000);
    };

    return (
        <>
            {/* Floating Chat Bubble */}
            <button
                className="messenger-bubble"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open messenger"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
            </button>

            {/* Chat Modal */}
            {isOpen && (
                <div className="messenger-modal">
                    <div className="messenger-header">
                        <span>💬 메시지 보내기</span>
                        <button onClick={() => setIsOpen(false)}>✕</button>
                    </div>
                    {sent ? (
                        <div className="messenger-sent">
                            <span>✅</span>
                            <p>메일 앱이 열립니다!</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="messenger-form">
                            <input
                                type="text"
                                placeholder="이름"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <input
                                type="email"
                                placeholder="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="메시지를 입력하세요..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                rows={4}
                            />
                            <button type="submit" className="messenger-send">
                                <span>보내기</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 2L11 13" />
                                    <polygon points="22,2 15,22 11,13 2,9" />
                                </svg>
                            </button>
                        </form>
                    )}
                </div>
            )}
        </>
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
            <MessengerWidget />
        </div>
    );
}
