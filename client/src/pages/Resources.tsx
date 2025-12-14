import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Loader2, Award, Calendar, Building, ShieldCheck, X } from "lucide-react";

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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link href="/"><span className="text-xl font-light tracking-wider cursor-pointer hover:opacity-70 transition-opacity">JAHYEON<span className="text-emerald-400">.</span></span></Link>
            <div className="hidden md:flex items-center gap-12">
              {["About", "Projects", "Certifications", "Resources"].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`}>
                  <span className={`text-sm font-light transition-colors cursor-pointer tracking-wide ${item === "Certifications" ? "text-white" : "text-white/60 hover:text-white"}`}>{item}</span>
                </Link>
              ))}
            </div>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-40 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <p className="text-emerald-400 font-mono text-sm tracking-widest mb-6">CREDENTIALS</p>
            <h1 className="text-4xl md:text-6xl font-light mb-6"><span className="text-emerald-400">Certifications</span></h1>
            <p className="text-white/50 text-xl max-w-2xl">Professional certifications in embedded systems, programming, and related technologies.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
              <p className="text-white/40">Loading certifications...</p>
            </div>
          ) : !certifications?.length ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6"><Award className="w-10 h-10 text-white/20" /></div>
              <h3 className="text-xl font-light mb-2">No certifications found</h3>
              <p className="text-white/40">Certifications will appear here once added.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert, index) => (
                <AnimatedSection key={cert.id} delay={index * 100}>
                  <div className="group rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 transition-all duration-300 cursor-pointer" onClick={() => setSelectedCert(cert)}>
                    <div className="aspect-[4/3] overflow-hidden relative">
                      {cert.imageUrl ? (
                        <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500/10 to-blue-500/10 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center"><Award className="w-12 h-12 text-white" /></div>
                        </div>
                      )}
                      <div className="absolute top-3 right-3"><span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs"><ShieldCheck className="w-3 h-3" />Verified</span></div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-medium mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">{cert.title}</h3>
                      <div className="flex items-center gap-2 text-white/40 text-sm mb-3"><Building className="w-4 h-4" />{cert.issuer}</div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-white/40"><Calendar className="w-3 h-3" />{cert.issueDate}</div>
                        {cert.expiryDate && <span className="px-2 py-1 rounded-full bg-white/5 text-white/40">Expires: {cert.expiryDate}</span>}
                      </div>
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
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setSelectedCert(null)}>
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center flex-shrink-0"><Award className="w-7 h-7 text-white" /></div>
                <div><h2 className="text-2xl font-light">{selectedCert.title}</h2><p className="text-white/40 mt-1">{selectedCert.issuer}</p></div>
              </div>
              <button className="text-white/40 hover:text-white p-2" onClick={() => setSelectedCert(null)}><X className="w-5 h-5" /></button>
            </div>
            {selectedCert.imageUrl && <div className="aspect-video bg-black/50"><img src={selectedCert.imageUrl} alt={selectedCert.title} className="w-full h-full object-contain" /></div>}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02]"><p className="text-white/40 text-sm mb-1">Issue Date</p><p className="font-medium">{selectedCert.issueDate}</p></div>
                {selectedCert.expiryDate && <div className="p-4 rounded-xl bg-white/[0.02]"><p className="text-white/40 text-sm mb-1">Expiry Date</p><p className="font-medium">{selectedCert.expiryDate}</p></div>}
              </div>
              {selectedCert.credentialId && <div className="p-4 rounded-xl bg-white/[0.02]"><p className="text-white/40 text-sm mb-1">Credential ID</p><p className="font-mono text-emerald-400">{selectedCert.credentialId}</p></div>}
              {selectedCert.description && <div><p className="text-white/40 text-sm mb-2">Description</p><p className="text-white/70">{selectedCert.description}</p></div>}
              {selectedCert.credentialUrl && <Button className="w-full rounded-xl bg-white text-black hover:bg-white/90" asChild><a href={selectedCert.credentialUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 mr-2" />Verify Credential</a></Button>}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center text-white/30 text-sm">© 2024 Gu Jahyeon. All rights reserved.</div>
      </footer>
    </div>
  );
}
