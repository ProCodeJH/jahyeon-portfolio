import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, ArrowDown, Github, Linkedin, Mail, Cpu, Code, Database, Zap, ExternalLink, Play } from "lucide-react";

// Smooth scroll hook
function useScrollY() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return scrollY;
}

// Intersection Observer for scroll animations
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

// Animated Section with multiple animation types
function AnimatedSection({ 
  children, 
  className = "", 
  delay = 0,
  animation = "fadeUp"
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  animation?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale";
}) {
  const { ref, isInView } = useInView(0.1);
  
  const animations = {
    fadeUp: { transform: isInView ? "translateY(0)" : "translateY(80px)", opacity: isInView ? 1 : 0 },
    fadeIn: { opacity: isInView ? 1 : 0 },
    slideLeft: { transform: isInView ? "translateX(0)" : "translateX(-100px)", opacity: isInView ? 1 : 0 },
    slideRight: { transform: isInView ? "translateX(0)" : "translateX(100px)", opacity: isInView ? 1 : 0 },
    scale: { transform: isInView ? "scale(1)" : "scale(0.8)", opacity: isInView ? 1 : 0 },
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${className}`}
      style={{ ...animations[animation], transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Magnetic button effect
function MagneticButton({ children, className = "", href }: { children: React.ReactNode; className?: string; href?: string }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  const content = (
    <div
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      {children}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

const EXPERTISE = [
  { icon: Cpu, title: "Embedded Systems", description: "MCU programming, firmware development, real-time system design", color: "from-blue-500 to-cyan-500" },
  { icon: Code, title: "Software Development", description: "Full-stack development with Python, Java, and modern frameworks", color: "from-emerald-500 to-teal-500" },
  { icon: Database, title: "Data Analysis", description: "System optimization through data-driven insights", color: "from-purple-500 to-pink-500" },
  { icon: Zap, title: "IoT & Automation", description: "Connected devices, sensor integration, industrial solutions", color: "from-orange-500 to-yellow-500" },
];

const EXPERIENCE = [
  { period: "2025 - Present", company: "SHL Co., Ltd.", role: "Logistics Management", current: true },
  { period: "2023 - 2024", company: "LG Electronics", role: "Senior Research Institute", current: false },
  { period: "2022", company: "Nordground", role: "Data Analyst", current: false },
  { period: "2021 - 2022", company: "UHS Co., Ltd.", role: "Embedded Developer", current: false },
];

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState("default");
  const scrollY = useScrollY();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
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

      {/* Navigation - Glass morphism */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-6 lg:mx-12 mt-6">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] rounded-2xl px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/">
                <span className="text-2xl font-extralight tracking-[0.3em] cursor-pointer hover:text-emerald-400 transition-colors">
                  JH
                </span>
              </Link>
              
              <div className="hidden md:flex items-center gap-12">
                {["About", "Projects", "Certifications", "Resources"].map((item) => (
                  <Link key={item} href={`/${item.toLowerCase()}`}>
                    <span 
                      className="text-sm font-light text-white/50 hover:text-white transition-all cursor-pointer tracking-wider relative group"
                      onMouseEnter={() => setCursorVariant("hover")}
                      onMouseLeave={() => setCursorVariant("default")}
                    >
                      {item}
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-emerald-400 group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                ))}
              </div>

              <Link href="/admin">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full border-white/10 bg-white/5 text-white/70 hover:bg-white hover:text-black transition-all duration-300 text-xs tracking-wider"
                >
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Fullscreen with Parallax */}
      <section className="h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[200px] animate-pulse"
            style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[180px]"
            style={{ transform: `translate(${-mousePosition.x * 0.015}px, ${-mousePosition.y * 0.015}px)` }}
          />
          <div 
            className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px]"
            style={{ transform: `translate(${mousePosition.x * 0.01 - 200}px, ${mousePosition.y * 0.01 - 200}px)` }}
          />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "100px 100px" }} />

        {/* Parallax text */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 overflow-hidden pointer-events-none opacity-[0.03]">
          <div className="whitespace-nowrap text-[20vw] font-bold tracking-tighter" style={{ transform: `translateX(${-scrollY * 0.5}px)` }}>
            EMBEDDED SYSTEMS DEVELOPER
          </div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <AnimatedSection delay={0}>
            <p className="text-emerald-400 font-mono text-sm tracking-[0.4em] mb-8 uppercase">
              Embedded Systems Engineer
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={200}>
            <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-extralight leading-[0.9] mb-8 tracking-tight">
              Building the
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
                future
              </span>
              <br />
              of hardware
            </h1>
          </AnimatedSection>
          
          <AnimatedSection delay={400}>
            <p className="text-xl md:text-2xl text-white/40 font-extralight leading-relaxed max-w-2xl mx-auto mb-12">
              Transforming complex systems into elegant solutions through
              firmware development and IoT innovation.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={600}>
            <div className="flex flex-wrap justify-center gap-6">
              <MagneticButton href="/projects">
                <Button 
                  size="lg" 
                  className="rounded-full bg-white text-black hover:bg-emerald-400 hover:text-black px-10 h-16 text-base font-medium group transition-all duration-300"
                  onMouseEnter={() => setCursorVariant("hover")}
                  onMouseLeave={() => setCursorVariant("default")}
                >
                  Explore Work
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </MagneticButton>
              <MagneticButton href="/about">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 px-10 h-16 text-base font-light transition-all duration-300"
                >
                  About Me
                </Button>
              </MagneticButton>
            </div>
          </AnimatedSection>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          <span className="text-white/20 text-xs tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-16 bg-gradient-to-b from-white/20 to-transparent relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-emerald-400 to-transparent animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Section - Horizontal scroll effect */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
              {[
                { number: "3+", label: "Years Experience" },
                { number: `${projects?.length || 0}+`, label: "Projects" },
                { number: "4", label: "Companies" },
                { number: "∞", label: "Passion" },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-5xl md:text-7xl font-extralight text-white group-hover:text-emerald-400 transition-colors duration-500">
                    {stat.number}
                  </div>
                  <div className="text-white/30 mt-3 text-sm tracking-wider uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Expertise Section - Bento Grid */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-20">
              <div>
                <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-4 uppercase">Expertise</p>
                <h2 className="text-4xl md:text-6xl font-extralight">
                  What I <span className="text-emerald-400">do</span>
                </h2>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {EXPERTISE.map((item, index) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={index} delay={index * 100} animation="scale">
                  <div 
                    className="group relative p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden"
                    onMouseEnter={() => setCursorVariant("hover")}
                    onMouseLeave={() => setCursorVariant("default")}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    <div className="relative z-10">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-light mb-4 group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                      <p className="text-white/40 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experience Timeline - Modern */}
      <section className="py-32 relative bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20">
            <AnimatedSection animation="slideLeft">
              <div className="sticky top-40">
                <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-4 uppercase">Experience</p>
                <h2 className="text-4xl md:text-6xl font-extralight mb-8">
                  Professional<br />
                  <span className="text-emerald-400">journey</span>
                </h2>
                <p className="text-white/40 text-lg leading-relaxed mb-8">
                  From embedded systems at UHS to firmware analysis at LG Electronics,
                  building expertise across the hardware-software stack.
                </p>
                <Link href="/about">
                  <Button variant="link" className="text-emerald-400 hover:text-emerald-300 p-0 h-auto text-lg group">
                    Read full story
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            <div className="space-y-6">
              {EXPERIENCE.map((exp, index) => (
                <AnimatedSection key={index} delay={index * 150} animation="slideRight">
                  <div className={`relative p-8 rounded-2xl border transition-all duration-300 group ${exp.current ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                    {exp.current && (
                      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono">
                        Current
                      </span>
                    )}
                    <p className="text-white/30 text-sm font-mono mb-2">{exp.period}</p>
                    <h3 className="text-2xl font-light mb-1 group-hover:text-emerald-400 transition-colors">{exp.company}</h3>
                    <p className="text-emerald-400/80">{exp.role}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects - Gallery Style */}
      {projects && projects.length > 0 && (
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <AnimatedSection>
              <div className="flex items-end justify-between mb-16">
                <div>
                  <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-4 uppercase">Portfolio</p>
                  <h2 className="text-4xl md:text-6xl font-extralight">
                    Selected <span className="text-emerald-400">works</span>
                  </h2>
                </div>
                <Link href="/projects">
                  <Button variant="link" className="text-white/50 hover:text-white p-0 h-auto hidden md:flex group">
                    View all
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.slice(0, 3).map((project, index) => (
                <AnimatedSection key={project.id} delay={index * 150} animation="fadeUp">
                  <div 
                    className="group relative rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 transition-all duration-500"
                    onMouseEnter={() => setCursorVariant("hover")}
                    onMouseLeave={() => setCursorVariant("default")}
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      {project.imageUrl ? (
                        <img 
                          src={project.imageUrl} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                          <Code className="w-16 h-16 text-white/10" />
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Actions */}
                      <div className="absolute bottom-4 left-4 right-4 flex gap-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        {project.projectUrl && (
                          <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button size="sm" className="w-full rounded-xl bg-white text-black hover:bg-emerald-400">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Demo
                            </Button>
                          </a>
                        )}
                        {project.videoUrl && (
                          <a href={project.videoUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="rounded-xl border-white/20 bg-black/50 text-white hover:bg-white hover:text-black">
                              <Play className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <p className="text-emerald-400 text-xs font-mono uppercase tracking-wider mb-2">{project.category}</p>
                      <h3 className="text-xl font-light group-hover:text-emerald-400 transition-colors">{project.title}</h3>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-emerald-500/10 to-emerald-500/5" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)" }} />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <AnimatedSection animation="scale">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-7xl font-extralight mb-8 leading-tight">
                Let's build something
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  extraordinary
                </span>
              </h2>
              <p className="text-white/40 text-xl mb-12 max-w-2xl mx-auto">
                Open to discussing new projects, creative ideas, or opportunities.
              </p>
              <div className="flex justify-center gap-6 flex-wrap">
                <MagneticButton>
                  <a href="mailto:contact@jahyeon.com">
                    <Button size="lg" className="rounded-full bg-white text-black hover:bg-emerald-400 px-10 h-16 text-base group">
                      <Mail className="w-5 h-5 mr-3" />
                      Get in Touch
                      <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </a>
                </MagneticButton>
                <div className="flex gap-4">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="rounded-full border-white/20 bg-transparent hover:bg-white hover:text-black w-16 h-16 p-0">
                      <Github className="w-6 h-6" />
                    </Button>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="rounded-full border-white/20 bg-transparent hover:bg-white hover:text-black w-16 h-16 p-0">
                      <Linkedin className="w-6 h-6" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/20 text-sm tracking-wider">
              © 2024 Gu Jahyeon. Crafted with passion.
            </p>
            <div className="flex items-center gap-8">
              {["Github", "LinkedIn", "Email"].map((item) => (
                <a key={item} href="#" className="text-white/20 hover:text-white text-sm tracking-wider transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
