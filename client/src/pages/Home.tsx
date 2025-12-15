import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Github, Linkedin, Mail, Cpu, Code, Database, Zap, ExternalLink, Play } from "lucide-react";

// Circuit board pattern SVG background
function CircuitPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M10 10h80v80H10z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="10" cy="10" r="3" fill="currentColor"/>
          <circle cx="90" cy="10" r="3" fill="currentColor"/>
          <circle cx="10" cy="90" r="3" fill="currentColor"/>
          <circle cx="90" cy="90" r="3" fill="currentColor"/>
          <circle cx="50" cy="50" r="5" fill="none" stroke="currentColor" strokeWidth="1"/>
          <path d="M10 50h30M60 50h30M50 10v30M50 60v30" stroke="currentColor" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)" className="text-emerald-400"/>
    </svg>
  );
}

// Floating tech icons
function FloatingIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { icon: "⚡", x: "10%", y: "20%", delay: 0 },
        { icon: "🔧", x: "85%", y: "15%", delay: 1 },
        { icon: "💻", x: "75%", y: "70%", delay: 2 },
        { icon: "🔌", x: "15%", y: "75%", delay: 0.5 },
        { icon: "📡", x: "90%", y: "45%", delay: 1.5 },
        { icon: "🖥️", x: "5%", y: "50%", delay: 2.5 },
      ].map((item, i) => (
        <div key={i} className="absolute text-2xl animate-float opacity-30" style={{ left: item.x, top: item.y, animationDelay: `${item.delay}s` }}>
          {item.icon}
        </div>
      ))}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// Code rain effect (Matrix style)
function CodeRain() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="absolute text-emerald-400 font-mono text-xs animate-rain" style={{ left: `${i * 7}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${8 + Math.random() * 8}s` }}>
          {Array.from({ length: 15 }).map((_, j) => (
            <div key={j} style={{ opacity: 1 - j * 0.06 }}>{"01</>{}[]"[Math.floor(Math.random() * 8)]}</div>
          ))}
        </div>
      ))}
      <style>{`
        @keyframes rain { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        .animate-rain { animation: rain 12s linear infinite; }
      `}</style>
    </div>
  );
}

// 3D Rotating Chip
function RotatingChip() {
  return (
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 animate-spin-slow">
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-500/40 to-blue-500/40 border border-emerald-400/50 flex items-center justify-center backdrop-blur-sm">
          <Cpu className="w-10 h-10 text-emerald-400" />
        </div>
      </div>
      <style>{`
        @keyframes spin-slow { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; transform-style: preserve-3d; }
      `}</style>
    </div>
  );
}

// Scroll & InView hooks
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
    <div ref={ref} className={`transition-all duration-1000 ease-out ${className}`} style={{ transform: isInView ? "translateY(0)" : "translateY(60px)", opacity: isInView ? 1 : 0, transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// Tech images for showcase
const TECH_IMAGES = [
  { src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop", label: "Circuit Board" },
  { src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop", label: "Code" },
  { src: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&h=400&fit=crop", label: "IoT Sensors" },
  { src: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop", label: "Hardware" },
];

const EXPERTISE = [
  { icon: Cpu, title: "Embedded Systems", desc: "MCU programming, firmware, real-time systems", color: "from-blue-500 to-cyan-500", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop" },
  { icon: Code, title: "Software Dev", desc: "Full-stack with Python, Java, modern frameworks", color: "from-emerald-500 to-teal-500", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop" },
  { icon: Database, title: "Data Analysis", desc: "System optimization, data-driven insights", color: "from-purple-500 to-pink-500", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" },
  { icon: Zap, title: "IoT & Automation", desc: "Connected devices, industrial solutions", color: "from-orange-500 to-yellow-500", img: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop" },
];

const EXPERIENCE = [
  { period: "2025 - Present", company: "SHL Co., Ltd.", role: "Logistics Management", current: true },
  { period: "2023 - 2024", company: "LG Electronics", role: "Senior Research Institute", current: false },
  { period: "2022", company: "Nordground", role: "Data Analyst", current: false },
  { period: "2021 - 2022", company: "UHS Co., Ltd.", role: "Embedded Developer", current: false },
];

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveImg(p => (p + 1) % TECH_IMAGES.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Custom Cursor */}
      <div className="fixed w-4 h-4 bg-emerald-400 rounded-full pointer-events-none z-[100] mix-blend-difference" style={{ left: mousePos.x - 8, top: mousePos.y - 8 }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-6 lg:mx-12 mt-6">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] rounded-2xl px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/"><span className="text-2xl font-extralight tracking-[0.3em] hover:text-emerald-400 transition-colors cursor-pointer">JH</span></Link>
              <div className="hidden md:flex items-center gap-12">
                {["About", "Projects", "Certifications", "Resources"].map(item => (
                  <Link key={item} href={`/${item.toLowerCase()}`}>
                    <span className="text-sm font-light text-white/50 hover:text-white transition-all cursor-pointer tracking-wider">{item}</span>
                  </Link>
                ))}
              </div>
              <Link href="/admin"><Button variant="outline" size="sm" className="rounded-full border-white/10 bg-white/5 text-white/70 hover:bg-white hover:text-black text-xs">Admin</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        <CircuitPattern />
        <FloatingIcons />
        <CodeRain />
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-emerald-500/20 rounded-full blur-[180px]" style={{ transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[150px]" style={{ transform: `translate(${-mousePos.x * 0.015}px, ${-mousePos.y * 0.015}px)` }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center relative z-10 pt-32">
          {/* Left */}
          <div>
            <AnimatedSection>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center animate-pulse">
                  <Cpu className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] uppercase">Embedded Engineer</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={200}>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-extralight leading-[1] mb-8">
                Building the<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">future</span><br />
                of hardware
              </h1>
            </AnimatedSection>
            
            <AnimatedSection delay={400}>
              <p className="text-xl text-white/40 font-light max-w-lg mb-12">
                Transforming complex systems into elegant solutions through firmware development and IoT innovation.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={600}>
              <div className="flex gap-4">
                <Link href="/projects">
                  <Button size="lg" className="rounded-full bg-white text-black hover:bg-emerald-400 px-8 h-14 group">
                    Explore Work <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="rounded-full border-white/20 hover:bg-white/10 px-8 h-14">About Me</Button>
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={800}>
              <div className="flex gap-12 mt-16 pt-8 border-t border-white/10">
                {[{ n: "3+", l: "Years" }, { n: `${projects?.length || 0}+`, l: "Projects" }, { n: "4", l: "Companies" }].map((s, i) => (
                  <div key={i}><div className="text-4xl font-light text-white">{s.n}</div><div className="text-white/30 text-sm mt-1">{s.l}</div></div>
                ))}
              </div>
            </AnimatedSection>
          </div>

          {/* Right - Tech showcase */}
          <AnimatedSection delay={400}>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10">
                {TECH_IMAGES.map((img, i) => (
                  <div key={i} className={`absolute inset-0 transition-all duration-1000 ${activeImg === i ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
                    <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-mono backdrop-blur-xl">{img.label}</span>
                    </div>
                  </div>
                ))}
                <div className="absolute top-6 right-6"><RotatingChip /></div>
              </div>
              <div className="flex justify-center gap-2 mt-6">
                {TECH_IMAGES.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`h-2 rounded-full transition-all ${activeImg === i ? 'w-8 bg-emerald-400' : 'w-2 bg-white/20'}`} />
                ))}
              </div>
              <div className="absolute -top-4 -left-4 w-20 h-20 border border-emerald-400/30 rounded-2xl" />
              <div className="absolute -bottom-4 -right-4 w-28 h-28 border border-blue-400/20 rounded-2xl" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Tech images scroll */}
      <section className="py-16 overflow-hidden">
        <div className="flex gap-6 animate-scroll">
          {[...TECH_IMAGES, ...TECH_IMAGES].map((img, i) => (
            <div key={i} className="flex-shrink-0 w-60 h-36 rounded-2xl overflow-hidden border border-white/10">
              <img src={img.src} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            </div>
          ))}
        </div>
        <style>{`
          @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-scroll { animation: scroll 25s linear infinite; }
        `}</style>
      </section>

      {/* Expertise */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-4 uppercase">Expertise</p>
            <h2 className="text-4xl md:text-6xl font-extralight mb-16">What I <span className="text-emerald-400">do</span></h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6">
            {EXPERTISE.map((item, i) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={i} delay={i * 100}>
                  <div className="group relative rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 transition-all duration-500">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                      <img src={item.img} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10 p-10">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-light mb-3 group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                      <p className="text-white/40">{item.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="py-32 relative">
        <CircuitPattern />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20">
            <AnimatedSection>
              <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-4 uppercase">Experience</p>
              <h2 className="text-4xl md:text-5xl font-extralight mb-8">Professional<br /><span className="text-emerald-400">journey</span></h2>
              <p className="text-white/40 text-lg mb-8">From embedded systems at UHS to firmware analysis at LG Electronics.</p>
              <Link href="/about"><Button variant="link" className="text-emerald-400 p-0 group">Read full story <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button></Link>
            </AnimatedSection>
            <div className="space-y-4">
              {EXPERIENCE.map((exp, i) => (
                <AnimatedSection key={i} delay={i * 100}>
                  <div className={`p-6 rounded-2xl border transition-all ${exp.current ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                    {exp.current && <span className="float-right px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Current</span>}
                    <p className="text-white/30 text-sm font-mono">{exp.period}</p>
                    <h3 className="text-xl font-light mt-1">{exp.company}</h3>
                    <p className="text-emerald-400/80 text-sm">{exp.role}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <AnimatedSection>
              <div className="flex items-end justify-between mb-16">
                <div>
                  <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-4 uppercase">Portfolio</p>
                  <h2 className="text-4xl md:text-5xl font-extralight">Selected <span className="text-emerald-400">works</span></h2>
                </div>
                <Link href="/projects"><Button variant="link" className="text-white/50 hover:text-white hidden md:flex group">View all <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button></Link>
              </div>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-6">
              {projects.slice(0, 3).map((p, i) => (
                <AnimatedSection key={p.id} delay={i * 100}>
                  <div className="group rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 transition-all">
                    <div className="aspect-[4/3] overflow-hidden relative">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      : <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center"><Code className="w-12 h-12 text-white/10" /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-4 left-4 right-4 flex gap-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                        {p.projectUrl && <a href={p.projectUrl} target="_blank" rel="noopener noreferrer" className="flex-1"><Button size="sm" className="w-full rounded-xl bg-white text-black hover:bg-emerald-400"><ExternalLink className="w-4 h-4 mr-1" />Demo</Button></a>}
                        {p.videoUrl && <a href={p.videoUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline" className="rounded-xl border-white/20 bg-black/50 hover:bg-white hover:text-black"><Play className="w-4 h-4" /></Button></a>}
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-emerald-400 text-xs font-mono uppercase mb-1">{p.category}</p>
                      <h3 className="text-lg font-light group-hover:text-emerald-400 transition-colors">{p.title}</h3>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-emerald-500/10 to-emerald-500/5" />
        <CircuitPattern />
        <FloatingIcons />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-6xl font-extralight mb-8">
              Let's build something<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">extraordinary</span>
            </h2>
            <p className="text-white/40 text-xl mb-12 max-w-xl mx-auto">Open to discussing new projects, creative ideas, or opportunities.</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <a href="mailto:contact@jahyeon.com">
                <Button size="lg" className="rounded-full bg-white text-black hover:bg-emerald-400 px-8 h-14 group">
                  <Mail className="w-5 h-5 mr-2" />Get in Touch <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"><Button size="lg" variant="outline" className="rounded-full border-white/20 hover:bg-white hover:text-black w-14 h-14 p-0"><Github className="w-5 h-5" /></Button></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><Button size="lg" variant="outline" className="rounded-full border-white/20 hover:bg-white hover:text-black w-14 h-14 p-0"><Linkedin className="w-5 h-5" /></Button></a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/20 text-sm">© 2024 Gu Jahyeon. Crafted with passion.</p>
          <div className="flex gap-8">{["Github", "LinkedIn", "Email"].map(s => <a key={s} href="#" className="text-white/20 hover:text-white text-sm transition-colors">{s}</a>)}</div>
        </div>
      </footer>
    </div>
  );
}
