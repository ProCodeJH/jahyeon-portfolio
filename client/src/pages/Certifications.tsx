import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Loader2, Award, Calendar, Building, ShieldCheck, X, CheckCircle, Sparkles } from "lucide-react";

// 🌌 COSMIC GALAXY BACKGROUND - 400 stars flying through space
function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Star {
      x: number;
      y: number;
      z: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 1000;
        this.size = Math.random() * 2;
      }

      update() {
        this.z -= 2;
        if (this.z <= 0) {
          this.z = 1000;
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
        }
      }

      draw() {
        const x = (this.x - canvas.width / 2) * (1000 / this.z) + canvas.width / 2;
        const y = (this.y - canvas.height / 2) * (1000 / this.z) + canvas.height / 2;
        const size = this.size * (1000 / this.z);
        const opacity = 1 - this.z / 1000;

        ctx.fillStyle = `rgba(${100 + Math.random() * 155}, ${200 + Math.random() * 55}, 255, ${opacity})`;
        ctx.fillRect(x, y, size, size);
      }
    }

    const stars = Array.from({ length: 400 }, () => new Star());

    function animate() {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.update();
        star.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />;
}

// 🔮 HOLOGRAPHIC FLOATING PARTICLES - 30 particles with glow effect
function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      hue: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 4 + 2;
        this.hue = Math.random() * 60 + 140; // Emerald to teal range
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        this.hue += 0.5;
        if (this.hue > 200) this.hue = 140;
      }

      draw() {
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
        ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const particles = Array.from({ length: 30 }, () => new Particle());

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-40" />;
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsInView(true); }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isInView };
}

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isInView } = useInView(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${className}`} style={{ transform: isInView ? "translateY(0)" : "translateY(40px)", opacity: isInView ? 1 : 0, transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function Certifications() {
  const { data: certifications, isLoading } = trpc.certifications.list.useQuery();
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden">
      {/* 🌌 COSMIC BACKGROUND */}
      <CosmicBackground />
      <FloatingParticles />

      {/* Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[180px]" />
      </div>

      {/* Custom Cursor */}
      <div className="fixed w-4 h-4 bg-emerald-400 rounded-full pointer-events-none z-[100] mix-blend-difference" style={{ left: mousePos.x - 8, top: mousePos.y - 8 }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-6 lg:mx-12 mt-6">
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-2xl px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/"><span className="text-2xl font-extralight tracking-[0.3em] hover:text-emerald-400 transition-colors cursor-pointer">JH</span></Link>
              <div className="hidden md:flex items-center gap-12">
                {["About", "Projects", "Certifications", "Resources"].map(item => (
                  <Link key={item} href={`/${item.toLowerCase()}`}>
                    <span className={`text-sm font-light transition-all cursor-pointer tracking-wider ${item === "Certifications" ? "text-white" : "text-white/50 hover:text-white"}`}>{item}</span>
                  </Link>
                ))}
              </div>
              <div className="w-16" />
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-40 pb-16 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <Award className="w-6 h-6 text-white" />
              </div>
              <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] uppercase">Credentials</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-extralight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-cyan-400 animate-gradient">Certifications</span>
            </h1>
            <p className="text-white/40 text-xl max-w-2xl">
              Professional certifications in embedded systems, programming, and related technologies.
              <span className="flex items-center gap-2 text-emerald-400 mt-3 text-base">
                <ShieldCheck className="w-4 h-4" />All credentials verified and validated
              </span>
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 pb-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
              <p className="text-white/40">Loading...</p>
            </div>
          ) : !certifications?.length ? (
            <div className="text-center py-32">
              <Award className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-2xl font-light mb-2">No certifications found</h3>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {certifications.map((cert, index) => (
                <AnimatedSection key={cert.id} delay={index * 100}>
                  <div
                    className="group rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/20"
                    style={{ perspective: '1000px' }}
                    onClick={() => setSelectedCert(cert)}
                  >
                    {/* 3D Hover Effect */}
                    <div className="group-hover:transform group-hover:scale-[1.02] transition-transform duration-500">
                      {/* Holographic Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-blue-500/0 to-cyan-500/0 group-hover:from-emerald-500/10 group-hover:via-blue-500/5 group-hover:to-cyan-500/10 transition-all duration-500 pointer-events-none rounded-3xl" />

                      <div className="aspect-[4/3] overflow-hidden relative">
                        {cert.imageUrl ? (
                          <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute top-10 left-10 w-24 h-24 border-2 border-emerald-300/30 rounded-full" />
                              <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-blue-300/20 rounded-lg rotate-12" />
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-purple-300/20 rounded-full" />
                            </div>

                            <div className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                              <Award className="w-14 h-14 text-white" />
                            </div>

                            {/* Sparkle Effects */}
                            <div className="absolute top-8 right-12 opacity-60">
                              <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
                            </div>
                            <div className="absolute bottom-12 left-16 opacity-60" style={{ animationDelay: '1s' }}>
                              <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
                            </div>
                          </div>
                        )}

                        <div className="absolute top-4 right-4">
                          <span
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono backdrop-blur-xl"
                            style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}
                          >
                            <ShieldCheck className="w-3 h-3" />Verified
                          </span>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-4 left-4 right-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                          <Button className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 h-12 shadow-lg shadow-emerald-500/30">
                            View Details
                          </Button>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-light mb-3 group-hover:text-emerald-400 transition-colors line-clamp-1">{cert.title}</h3>
                        <div className="flex items-center gap-2 text-white/40 text-sm mb-3">
                          <Building className="w-4 h-4 text-emerald-400" />
                          {cert.issuer}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-white/30">
                            <Calendar className="w-3 h-3" />
                            {cert.issueDate}
                          </div>
                          {cert.expiryDate && (
                            <span className="px-2 py-1 rounded-full bg-white/5 text-white/30">
                              Exp: {cert.expiryDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Holographic Border Effect */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500 via-blue-500 to-cyan-500 opacity-20 blur-xl" />
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setSelectedCert(null)}>
          {/* Cosmic Background in Modal */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[150px]" />
          </div>

          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex items-start justify-between">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/50">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono"
                      style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}
                    >
                      <CheckCircle className="w-3 h-3" />Verified
                    </span>
                  </div>
                  <h2 className="text-2xl font-light">{selectedCert.title}</h2>
                  <p className="text-white/40 mt-1">{selectedCert.issuer}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedCert.imageUrl && (
              <div className="p-6 border-b border-white/5">
                <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                  <img src={selectedCert.imageUrl} alt={selectedCert.title} className="w-full h-auto" />
                </div>
              </div>
            )}

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 transition-colors">
                  <p className="text-white/40 text-sm mb-2">Issue Date</p>
                  <p className="text-lg font-light flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    {selectedCert.issueDate}
                  </p>
                </div>
                {selectedCert.expiryDate && (
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-orange-400/30 transition-colors">
                    <p className="text-white/40 text-sm mb-2">Expiry Date</p>
                    <p className="text-lg font-light flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      {selectedCert.expiryDate}
                    </p>
                  </div>
                )}
              </div>

              {selectedCert.credentialId && (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 transition-colors">
                  <p className="text-white/40 text-sm mb-2">Credential ID</p>
                  <p className="font-mono text-emerald-400 break-all">{selectedCert.credentialId}</p>
                </div>
              )}

              {selectedCert.description && (
                <div>
                  <p className="text-white/40 text-sm mb-3">Description</p>
                  <p className="text-white/70 leading-relaxed">{selectedCert.description}</p>
                </div>
              )}

              {selectedCert.credentialUrl && (
                <Button
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 h-14 text-base shadow-lg shadow-emerald-500/30"
                  asChild
                >
                  <a href={selectedCert.credentialUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Verify Credential
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center text-white/20 text-sm">
          © 2024 Gu Jahyeon. All rights reserved.
        </div>
      </footer>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
