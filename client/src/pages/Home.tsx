import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, ArrowDown, Github, Linkedin, Mail, ChevronRight, Cpu, Code, Database, Zap } from "lucide-react";

// Intersection Observer Hook for scroll animations
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Animated Section Component
function AnimatedSection({ 
  children, 
  className = "", 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
}) {
  const { ref, isInView } = useInView(0.1);
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${className}`}
      style={{
        transform: isInView ? "translateY(0)" : "translateY(60px)",
        opacity: isInView ? 1 : 0,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const EXPERTISE = [
  {
    icon: Cpu,
    title: "Embedded Systems",
    description: "MCU programming, firmware development, and real-time system design with C/C++",
  },
  {
    icon: Code,
    title: "Software Development",
    description: "Full-stack development with Python, Java, and modern web technologies",
  },
  {
    icon: Database,
    title: "Data Analysis",
    description: "System optimization through data-driven insights and automation",
  },
  {
    icon: Zap,
    title: "IoT & Automation",
    description: "Connected devices, sensor integration, and industrial automation solutions",
  },
];

const EXPERIENCE = [
  {
    period: "2025.04 - Present",
    company: "SHL Co., Ltd.",
    role: "Logistics Management",
    description: "Product flow management and process optimization",
  },
  {
    period: "2023.06 - 2024.07",
    company: "LG Electronics",
    role: "Senior Research Institute",
    description: "Washing machine firmware data analysis, sensor control verification, serial communication-based automation",
  },
  {
    period: "2022.06 - 2022.12",
    company: "Nordground",
    role: "Data Analyst",
    description: "Data-driven problem solving and system optimization",
  },
  {
    period: "2021.12 - 2022.06",
    company: "UHS Co., Ltd.",
    role: "Embedded Developer",
    description: "H/W manufacturing and S/W DB system development",
  },
];

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link href="/">
              <span className="text-xl font-light tracking-wider cursor-pointer hover:opacity-70 transition-opacity">
                JAHYEON<span className="text-emerald-400">.</span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-12">
              {["About", "Projects", "Certifications", "Resources"].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`}>
                  <span className="text-sm font-light text-white/60 hover:text-white transition-colors cursor-pointer tracking-wide">
                    {item}
                  </span>
                </Link>
              ))}
            </div>

            <Link href="/admin">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-all"
              >
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative pt-20">
        {/* Background gradient orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]"
          style={{
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
          }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl">
            <AnimatedSection>
              <p className="text-emerald-400 font-mono text-sm tracking-widest mb-6">
                EMBEDDED SYSTEMS ENGINEER
              </p>
            </AnimatedSection>
            
            <AnimatedSection delay={100}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] mb-8">
                Building the bridge
                <br />
                between <span className="text-emerald-400">hardware</span>
                <br />
                and <span className="text-emerald-400">software</span>
              </h1>
            </AnimatedSection>
            
            <AnimatedSection delay={200}>
              <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed max-w-2xl mb-12">
                I transform complex systems into elegant solutions. 
                Specializing in firmware development, IoT integration, 
                and data-driven automation.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="flex flex-wrap gap-4">
                <Link href="/projects">
                  <Button 
                    size="lg" 
                    className="rounded-full bg-white text-black hover:bg-white/90 px-8 h-14 text-base font-medium group"
                  >
                    View Projects
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 px-8 h-14 text-base font-light"
                  >
                    About Me
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            {/* Stats */}
            <AnimatedSection delay={400}>
              <div className="flex gap-16 mt-20 pt-12 border-t border-white/10">
                <div>
                  <div className="text-4xl md:text-5xl font-light text-white">3+</div>
                  <div className="text-white/40 mt-2 text-sm tracking-wide">Years Experience</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-light text-white">{projects?.length || 0}+</div>
                  <div className="text-white/40 mt-2 text-sm tracking-wide">Projects</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-light text-white">4</div>
                  <div className="text-white/40 mt-2 text-sm tracking-wide">Companies</div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce">
          <span className="text-white/30 text-xs tracking-widest">SCROLL</span>
          <ArrowDown className="w-4 h-4 text-white/30" />
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <p className="text-emerald-400 font-mono text-sm tracking-widest mb-4">EXPERTISE</p>
            <h2 className="text-4xl md:text-5xl font-light mb-20">
              What I bring to<br />the table
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXPERTISE.map((item, index) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={index} delay={index * 100}>
                  <div className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 hover:bg-white/[0.04] transition-all duration-500">
                    <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center mb-6 group-hover:bg-emerald-400/20 transition-colors">
                      <Icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-3">{item.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-32 relative bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20">
            <div>
              <AnimatedSection>
                <p className="text-emerald-400 font-mono text-sm tracking-widest mb-4">EXPERIENCE</p>
                <h2 className="text-4xl md:text-5xl font-light mb-8">
                  Professional<br />journey
                </h2>
                <p className="text-white/40 text-lg leading-relaxed mb-8">
                  From embedded systems development at UHS to firmware analysis at LG Electronics, 
                  I've built expertise across the full hardware-software stack.
                </p>
                <Link href="/about">
                  <Button variant="link" className="text-emerald-400 hover:text-emerald-300 p-0 h-auto">
                    Read full story
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </AnimatedSection>
            </div>

            <div className="space-y-8">
              {EXPERIENCE.map((exp, index) => (
                <AnimatedSection key={index} delay={index * 100}>
                  <div className="relative pl-8 border-l border-white/10 hover:border-emerald-400/50 transition-colors group">
                    <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-white/20 -translate-x-[5px] group-hover:bg-emerald-400 transition-colors" />
                    <p className="text-white/30 text-sm font-mono mb-2">{exp.period}</p>
                    <h3 className="text-xl font-medium mb-1">{exp.company}</h3>
                    <p className="text-emerald-400 text-sm mb-2">{exp.role}</p>
                    <p className="text-white/40 text-sm">{exp.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {projects && projects.length > 0 && (
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <AnimatedSection>
              <div className="flex items-end justify-between mb-16">
                <div>
                  <p className="text-emerald-400 font-mono text-sm tracking-widest mb-4">PROJECTS</p>
                  <h2 className="text-4xl md:text-5xl font-light">Selected works</h2>
                </div>
                <Link href="/projects">
                  <Button variant="link" className="text-white/60 hover:text-white p-0 h-auto hidden md:flex">
                    View all projects
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 3).map((project, index) => (
                <AnimatedSection key={project.id} delay={index * 100}>
                  <div className="group relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <div className="aspect-video bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden">
                      {project.imageUrl ? (
                        <img 
                          src={project.imageUrl} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Code className="w-12 h-12 text-white/10" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-emerald-400 text-xs font-mono uppercase tracking-wider mb-2">
                        {project.category}
                      </p>
                      <h3 className="text-lg font-medium mb-2 group-hover:text-emerald-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-white/40 text-sm line-clamp-2">{project.description}</p>
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-light mb-8">
                Let's build something<br />
                <span className="text-emerald-400">extraordinary</span>
              </h2>
              <p className="text-white/40 text-xl mb-12">
                I'm always open to discussing new projects, creative ideas, 
                or opportunities to be part of your vision.
              </p>
              <div className="flex justify-center gap-6">
                <a href="mailto:contact@jahyeon.com">
                  <Button 
                    size="lg" 
                    className="rounded-full bg-white text-black hover:bg-white/90 px-8 h-14"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Get in Touch
                  </Button>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full border-white/20 bg-transparent hover:bg-white/10 px-8 h-14"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    GitHub
                  </Button>
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/30 text-sm">
              © 2024 Gu Jahyeon. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://github.com" className="text-white/30 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="text-white/30 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:contact@jahyeon.com" className="text-white/30 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
