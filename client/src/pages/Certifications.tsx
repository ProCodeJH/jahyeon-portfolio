import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Loader2, Award, Calendar, Building, ShieldCheck, X, CheckCircle } from "lucide-react";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold }
    );
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
  const [cursorVariant, setCursorVariant] = useState("default");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Custom Cursor */}
      <div 
        className="fixed w-4 h-4 bg-emerald-400 rounded-full pointer-events-none z-[100] mix-blend-difference transition-transform duration-100"
        style={{ left: mousePosition.x - 8, top: mousePosition.y - 8, transform: cursorVariant === "hover" ? "scale(3)" : "scale(1)" }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-6 lg:mx-12 mt-6">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] rounded-2xl px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/"><span className="text-2xl font-extralight tracking-[0.3em] cursor-pointer hover:text-emerald-400 transition-colors">JH</span></Link>
              <div className="hidden md:flex items-center gap-12">
                {["About", "Projects", "Certifications", "Resources"].map((item) => (
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
      <section className="pt-40 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-6 uppercase">Credentials</p>
            <h1 className="text-5xl md:text-7xl font-extralight mb-6">
              <span className="text-emerald-400">Certifications</span>
            </h1>
            <p className="text-white/40 text-xl max-w-2xl">
              Professional certifications in embedded systems, programming, and related technologies.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Certifications Grid */}
      <section className="py-12 pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
              <p className="text-white/40">Loading certifications...</p>
            </div>
          ) : !certifications?.length ? (
            <div className="text-center py-32">
              <div className="w-24 h-24 rounded-3xl bg-white/[0.02] flex items-center justify-center mx-auto mb-6">
                <Award className="w-12 h-12 text-white/10" />
              </div>
              <h3 className="text-2xl font-light mb-2">No certifications found</h3>
              <p className="text-white/40">Certifications will appear here once added.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {certifications.map((cert, index) => (
                <AnimatedSection key={cert.id} delay={index * 100}>
                  <div 
                    className="group rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 transition-all duration-500 cursor-pointer"
                    onClick={() => setSelectedCert(cert)}
                    onMouseEnter={() => setCursorVariant("hover")}
                    onMouseLeave={() => setCursorVariant("default")}
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      {cert.imageUrl ? (
                        <img 
                          src={cert.imageUrl} 
                          alt={cert.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                            <Award className="w-14 h-14 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Verified badge */}
                      <div className="absolute top-4 right-4">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono backdrop-blur-xl">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      </div>

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* View button on hover */}
                      <div className="absolute bottom-4 left-4 right-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <Button className="w-full rounded-xl bg-white text-black hover:bg-emerald-400 h-12">
                          View Details
                        </Button>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-light mb-3 group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {cert.title}
                      </h3>
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
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Certification Modal */}
      {selectedCert && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6"
          onClick={() => setSelectedCert(null)}
        >
          <div 
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0a0a0a] border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-start justify-between">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <h2 className="text-2xl font-light">{selectedCert.title}</h2>
                  <p className="text-white/40 mt-1">{selectedCert.issuer}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCert(null)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Image */}
            {selectedCert.imageUrl && (
              <div className="p-6 border-b border-white/5">
                <div className="rounded-2xl overflow-hidden bg-white/5">
                  <img 
                    src={selectedCert.imageUrl} 
                    alt={selectedCert.title}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}

            {/* Details */}
            <div className="p-6 space-y-6">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-white/40 text-sm mb-2">Issue Date</p>
                  <p className="text-lg font-light flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    {selectedCert.issueDate}
                  </p>
                </div>
                {selectedCert.expiryDate && (
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-white/40 text-sm mb-2">Expiry Date</p>
                    <p className="text-lg font-light flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      {selectedCert.expiryDate}
                    </p>
                  </div>
                )}
              </div>

              {/* Credential ID */}
              {selectedCert.credentialId && (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-white/40 text-sm mb-2">Credential ID</p>
                  <p className="font-mono text-emerald-400 break-all">{selectedCert.credentialId}</p>
                </div>
              )}

              {/* Description */}
              {selectedCert.description && (
                <div>
                  <p className="text-white/40 text-sm mb-3">Description</p>
                  <p className="text-white/70 leading-relaxed">{selectedCert.description}</p>
                </div>
              )}

              {/* Verify Button */}
              {selectedCert.credentialUrl && (
                <Button 
                  className="w-full rounded-xl bg-white text-black hover:bg-emerald-400 h-14 text-base"
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
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center text-white/20 text-sm">
          © 2024 Gu Jahyeon. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
