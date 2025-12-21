import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Loader2, Award, Calendar, Building, ShieldCheck, X, CheckCircle, Sparkles } from "lucide-react";

// 🌊 CLEAN GRADIENT MESH BACKGROUND
function GradientMeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Blob {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      hue: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 200 + 150;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.hue = Math.random() * 60 + 200; // Blue to purple range
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -this.radius || this.x > canvas.width + this.radius) this.vx *= -1;
        if (this.y < -this.radius || this.y > canvas.height + this.radius) this.vy *= -1;

        this.hue += 0.1;
        if (this.hue > 260) this.hue = 200;
      }

      draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, 0.15)`);
        gradient.addColorStop(1, `hsla(${this.hue}, 70%, 60%, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    const blobs = Array.from({ length: 5 }, () => new Blob());

    function animate() {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      blobs.forEach(blob => {
        blob.update();
        blob.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

// ✨ SUBTLE FLOATING DOTS
function SubtleDots() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-purple-300/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 8}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-40px) translateX(20px); opacity: 0.4; }
        }
        .animate-float { animation: float ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// 🎯 3D TILT EFFECT HOOK
function useTilt(sensitivity = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * sensitivity;
      const rotateY = ((x - centerX) / centerX) * -sensitivity;

      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    };

    const handleMouseLeave = () => {
      setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [sensitivity]);

  return { ref, transform };
}

// 3D Tilt Card Component
function TiltCard({ children, sensitivity = 10 }: { children: React.ReactNode; sensitivity?: number }) {
  const { ref, transform } = useTilt(sensitivity);

  return (
    <div
      ref={ref}
      style={{
        transform,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {children}
    </div>
  );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 text-gray-900 overflow-hidden">
      {/* Clean Background */}
      <div className="fixed inset-0">
        <GradientMeshBackground />
        <SubtleDots />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:scale-110 transition-transform cursor-pointer">
                JH
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {["Work", "About"].map(item => (
                <Link key={item} href={item === "Work" ? "/projects" : `/${item.toLowerCase()}`}>
                  <span className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-all cursor-pointer relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-40 pb-16 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Award className="w-6 h-6 text-white" />
              </div>
              <p className="text-purple-600 font-medium text-sm tracking-wider uppercase">Credentials</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900">
              Certifications
            </h1>
            <p className="text-gray-600 text-xl max-w-2xl">
              Professional certifications in embedded systems, programming, and related technologies.
              <span className="flex items-center gap-2 text-purple-600 mt-3 text-base font-medium">
                <ShieldCheck className="w-4 h-4" />All credentials verified and validated
              </span>
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 pb-32 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : !certifications?.length ? (
            <div className="text-center py-32">
              <Award className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">No certifications found</h3>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {certifications.map((cert, index) => (
                <AnimatedSection key={cert.id} delay={index * 100}>
                  <TiltCard>
                    <div
                      className="group rounded-3xl overflow-hidden bg-white border border-gray-200 hover:border-purple-300 transition-all duration-500 cursor-pointer hover:shadow-2xl"
                      onClick={() => setSelectedCert(cert)}
                    >
                      <div className="aspect-[4/3] overflow-hidden relative">
                        {cert.imageUrl ? (
                          <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 flex items-center justify-center relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-20">
                              <div className="absolute top-10 left-10 w-24 h-24 border-2 border-purple-300 rounded-full" />
                              <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-blue-300 rounded-lg rotate-12" />
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-pink-300 rounded-full" />
                            </div>

                            <div className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                              <Award className="w-14 h-14 text-white" />
                            </div>

                            {/* Sparkle Effects */}
                            <div className="absolute top-8 right-12">
                              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                            </div>
                            <div className="absolute bottom-12 left-16" style={{ animationDelay: '1s' }}>
                              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                            </div>
                          </div>
                        )}

                        <div className="absolute top-4 right-4">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white backdrop-blur-xl text-purple-600 text-xs font-medium border border-gray-200 shadow-lg">
                            <ShieldCheck className="w-3 h-3" />Verified
                          </span>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-4 left-4 right-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                          <Button className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 h-12 shadow-lg shadow-purple-500/30">
                            View Details
                          </Button>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-600 transition-colors line-clamp-1 text-gray-900">{cert.title}</h3>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                          <Building className="w-4 h-4 text-purple-600" />
                          {cert.issuer}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {cert.issueDate}
                          </div>
                          {cert.expiryDate && (
                            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              Exp: {cert.expiryDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setSelectedCert(null)}>
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-gray-200 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/50">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-medium border border-purple-200">
                      <CheckCircle className="w-3 h-3" />Verified
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCert.title}</h2>
                  <p className="text-gray-600 mt-1">{selectedCert.issuer}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-900" />
              </button>
            </div>

            {selectedCert.imageUrl && (
              <div className="p-6 border-b border-gray-200">
                <div className="rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={selectedCert.imageUrl} alt={selectedCert.title} className="w-full h-auto" />
                </div>
              </div>
            )}

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-purple-300 transition-colors">
                  <p className="text-gray-600 text-sm mb-2">Issue Date</p>
                  <p className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    {selectedCert.issueDate}
                  </p>
                </div>
                {selectedCert.expiryDate && (
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-orange-300 transition-colors">
                    <p className="text-gray-600 text-sm mb-2">Expiry Date</p>
                    <p className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      {selectedCert.expiryDate}
                    </p>
                  </div>
                )}
              </div>

              {selectedCert.credentialId && (
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-purple-300 transition-colors">
                  <p className="text-gray-600 text-sm mb-2">Credential ID</p>
                  <p className="font-mono text-purple-600 break-all">{selectedCert.credentialId}</p>
                </div>
              )}

              {selectedCert.description && (
                <div>
                  <p className="text-gray-600 text-sm mb-3">Description</p>
                  <p className="text-gray-700 leading-relaxed">{selectedCert.description}</p>
                </div>
              )}

              {selectedCert.credentialUrl && (
                <Button
                  className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 h-14 text-base shadow-lg shadow-purple-500/30"
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
    </div>
  );
}
