import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ExternalLink, Github, Loader2, Eye, Code, Play, X, ArrowUpRight, Layers } from "lucide-react";
import "../styles/dopple-v4.css";

// Supreme Quantum Logo
function SupremeLogo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} xmlns="http://www.w3.org/2000/svg">
      <style>{`
                @keyframes spin1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes spin2 { from { transform: rotate(120deg); } to { transform: rotate(480deg); } }
                @keyframes spin3 { from { transform: rotate(240deg); } to { transform: rotate(600deg); } }
                @keyframes pulse { 0%, 100% { opacity: 0.7; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
            `}</style>
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4361EE" />
          <stop offset="50%" stopColor="#7B2FFF" />
          <stop offset="100%" stopColor="#00D9FF" />
        </linearGradient>
      </defs>
      <g transform="translate(50,50)">
        <ellipse rx="35" ry="12" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.6" style={{ animation: 'spin1 8s linear infinite', transformOrigin: 'center' }} />
        <ellipse rx="35" ry="12" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.6" style={{ animation: 'spin2 8s linear infinite', transformOrigin: 'center' }} />
        <ellipse rx="35" ry="12" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.6" style={{ animation: 'spin3 8s linear infinite', transformOrigin: 'center' }} />
        <circle r="12" fill="url(#grad1)" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
        <circle r="6" fill="white" opacity="0.9" />
      </g>
    </svg>
  );
}

// Messenger Widget Component
function MessengerWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <button className="messenger-bubble" onClick={() => setIsOpen(!isOpen)} aria-label="Open messenger">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
      {isOpen && (
        <div className="messenger-modal">
          <div className="messenger-header">
            <span>💬 메시지 보내기</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          {sent ? (
            <div className="messenger-sent"><span>✅</span><p>메일 앱이 열립니다!</p></div>
          ) : (
            <form onSubmit={handleSubmit} className="messenger-form">
              <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required />
              <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <textarea placeholder="메시지를 입력하세요..." value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} />
              <button type="submit" className="messenger-send">
                <span>보내기</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><polygon points="22,2 15,22 11,13 2,9" /></svg>
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default function Projects() {
  const { data: projects, isLoading } = trpc.projects.list.useQuery();
  const [activeTag, setActiveTag] = useState("all");
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const parseTechnologies = (tech: string): string[] =>
    tech ? tech.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];

  const allTags = projects ? Array.from(new Set(
    projects.flatMap(p => parseTechnologies(p.technologies))
  )).sort() : [];

  const filteredProjects = activeTag === "all"
    ? projects
    : projects?.filter(p => parseTechnologies(p.technologies).includes(activeTag));

  return (
    <div className="dp4-page" style={{ minHeight: '100vh' }}>
      {/* Header */}
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

      {/* Hero Section */}
      <section style={{ padding: '140px 24px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, rgba(123, 47, 255, 0.1), rgba(0, 217, 255, 0.1))',
            border: '1px solid rgba(123, 47, 255, 0.3)',
            marginBottom: '24px'
          }}>
            <Layers className="w-5 h-5" style={{ color: '#7B2FFF' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#7B2FFF' }}>Portfolio</span>
            <div style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.2)' }} />
            <span style={{ fontSize: '13px', color: '#666' }}>{projects?.length || 0} Projects</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(60px, 12vw, 140px)',
            fontWeight: 900,
            lineHeight: 0.9,
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #4361EE 0%, #7B2FFF 50%, #00D9FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            WORK.
          </h1>

          <p style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            Embedded systems, IoT solutions, and software development projects
            that push the boundaries of innovation.
          </p>
        </div>
      </section>

      {/* Tag Filter */}
      <section style={{
        padding: '20px 24px',
        position: 'sticky',
        top: '80px',
        zIndex: 40,
        background: 'rgba(250, 248, 244, 0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => setActiveTag("all")}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTag === "all" ? 'linear-gradient(135deg, #7B2FFF, #00D9FF)' : 'white',
              color: activeTag === "all" ? 'white' : '#666',
              boxShadow: activeTag === "all" ? '0 4px 15px rgba(123, 47, 255, 0.3)' : '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Code className="w-4 h-4" />
            <span>All Projects</span>
          </button>

          {allTags.slice(0, 8).map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              style={{
                padding: '10px 20px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTag === tag ? 'linear-gradient(135deg, #7B2FFF, #00D9FF)' : 'white',
                color: activeTag === tag ? 'white' : '#666',
                boxShadow: activeTag === tag ? '0 4px 15px rgba(123, 47, 255, 0.3)' : '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section style={{ padding: '60px 24px 100px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#7B2FFF', margin: '0 auto 16px' }} />
              <p style={{ color: '#666' }}>Loading projects...</p>
            </div>
          ) : !filteredProjects?.length ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Code className="w-16 h-16" style={{ color: '#ccc', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>No projects found</h3>
              <p style={{ color: '#666' }}>Try selecting a different tag</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
              {filteredProjects.map((project, index) => {
                const technologies = parseTechnologies(project.technologies);
                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    style={{
                      background: 'white',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(123, 47, 255, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
                    }}
                  >
                    {/* Image */}
                    <div style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden' }}>
                      {project.imageUrl || project.thumbnailUrl ? (
                        <img
                          src={project.imageUrl || project.thumbnailUrl || ""}
                          alt={project.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f5f5f5, #eee)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Code className="w-12 h-12" style={{ color: '#ccc' }} />
                        </div>
                      )}
                      {/* View Count Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(8px)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#7B2FFF'
                      }}>
                        <Eye className="w-3 h-3" />{project.viewCount}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111' }}>{project.title}</h3>
                        <ArrowUpRight className="w-5 h-5" style={{ color: '#ccc', flexShrink: 0 }} />
                      </div>
                      <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.description}
                      </p>
                      {technologies.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {technologies.slice(0, 4).map((tech, i) => (
                            <span key={i} style={{
                              padding: '6px 12px',
                              borderRadius: '999px',
                              background: 'rgba(123, 47, 255, 0.08)',
                              color: '#7B2FFF',
                              fontSize: '12px',
                              fontWeight: 500
                            }}>
                              {tech}
                            </span>
                          ))}
                          {technologies.length > 4 && (
                            <span style={{
                              padding: '6px 12px',
                              borderRadius: '999px',
                              background: 'linear-gradient(135deg, rgba(123, 47, 255, 0.15), rgba(0, 217, 255, 0.15))',
                              color: '#7B2FFF',
                              fontSize: '12px',
                              fontWeight: 600
                            }}>
                              +{technologies.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setSelectedProject(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '24px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 30px 60px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Image */}
            <div style={{ position: 'relative' }}>
              {(selectedProject.imageUrl || selectedProject.thumbnailUrl) && (
                <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                  <img
                    src={selectedProject.imageUrl || selectedProject.thumbnailUrl || ""}
                    alt={selectedProject.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7B2FFF, #00D9FF)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(123, 47, 255, 0.4)'
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '40px' }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: 800,
                marginBottom: '16px',
                background: 'linear-gradient(135deg, #111, #7B2FFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {selectedProject.title}
              </h2>
              <p style={{ fontSize: '16px', color: '#666', lineHeight: 1.7, marginBottom: '32px' }}>
                {selectedProject.description}
              </p>

              {/* Technologies */}
              {parseTechnologies(selectedProject.technologies).length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#7B2FFF', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Technologies</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {parseTechnologies(selectedProject.technologies).map((tech, i) => (
                      <span key={i} style={{
                        padding: '8px 16px',
                        borderRadius: '999px',
                        background: '#f5f5f5',
                        color: '#333',
                        fontSize: '14px',
                        fontWeight: 500,
                        border: '1px solid #eee'
                      }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
                {selectedProject.projectUrl && (
                  <a href={selectedProject.projectUrl} target="_blank" rel="noopener noreferrer">
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 28px',
                      borderRadius: '999px',
                      background: 'linear-gradient(135deg, #7B2FFF, #00D9FF)',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(123, 47, 255, 0.3)'
                    }}>
                      <ExternalLink className="w-4 h-4" />View Demo
                    </button>
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 28px',
                      borderRadius: '999px',
                      background: 'white',
                      color: '#333',
                      fontSize: '15px',
                      fontWeight: 600,
                      border: '2px solid #eee',
                      cursor: 'pointer'
                    }}>
                      <Github className="w-4 h-4" />Source Code
                    </button>
                  </a>
                )}
                {selectedProject.videoUrl && (
                  <a href={selectedProject.videoUrl} target="_blank" rel="noopener noreferrer">
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 28px',
                      borderRadius: '999px',
                      background: 'white',
                      color: '#00D9FF',
                      fontSize: '15px',
                      fontWeight: 600,
                      border: '2px solid #00D9FF',
                      cursor: 'pointer'
                    }}>
                      <Play className="w-4 h-4" />Watch Video
                    </button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="dp4-footer">
        <nav className="dp4-footer-nav">
          <Link href="/">PROJECTS</Link>
          <Link href="/resources">RESOURCES</Link>
          <Link href="/blog">BLOG</Link>
          <a href="mailto:contact@jahyeon.com">CONTACT</a>
        </nav>
        <p>© 2024 Gu Jahyeon. Embedded Developer & Educator.</p>
      </footer>

      {/* Messenger Widget */}
      <MessengerWidget />
    </div>
  );
}
