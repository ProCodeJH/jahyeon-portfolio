import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Download, Github, Linkedin, Mail, MapPin, Briefcase, GraduationCap, Music, Dumbbell, Award, Cpu, Code, Database } from "lucide-react";

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

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView(0.5);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);
  return <span ref={ref}>{count}</span>;
}

// Circuit Pattern
function CircuitPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2" fill="currentColor"/>
          <circle cx="90" cy="90" r="2" fill="currentColor"/>
          <path d="M10 50h80M50 10v80" stroke="currentColor" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)" className="text-emerald-400"/>
    </svg>
  );
}

const SKILLS = [
  { category: "Languages", items: ["C", "C++", "C#", "Python", "Java"], color: "from-blue-500 to-cyan-500", icon: Code },
  { category: "Embedded", items: ["MCU", "RTOS", "UART", "SPI", "I2C"], color: "from-emerald-500 to-teal-500", icon: Cpu },
  { category: "Platforms", items: ["Arduino", "Linux", "Unity"], color: "from-purple-500 to-pink-500", icon: Database },
  { category: "Tools", items: ["Git", "Data Analysis", "Automation"], color: "from-orange-500 to-yellow-500", icon: Briefcase },
];

const TIMELINE = [
  { year: "2025", title: "SHL Co., Ltd.", role: "Logistics Management", type: "work", icon: Briefcase },
  { year: "2023", title: "LG Electronics", role: "Senior Research Institute", type: "work", icon: Briefcase },
  { year: "2022", title: "Nordground", role: "Data Analyst", type: "work", icon: Briefcase },
  { year: "2021", title: "UHS Co., Ltd.", role: "Embedded Developer", type: "work", icon: Briefcase },
  { year: "2020", title: "ROK Air Force", role: "Aircraft Maintenance", type: "military", icon: Award },
  { year: "2020", title: "Kyungnam College", role: "Smart Electronics", type: "education", icon: GraduationCap },
];

export default function About() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
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
                    <span className={`text-sm font-light transition-all cursor-pointer tracking-wider ${item === "About" ? "text-white" : "text-white/50 hover:text-white"}`}>{item}</span>
                  </Link>
                ))}
              </div>
              <div className="w-16" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen pt-32 pb-20 relative">
        <CircuitPattern />
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20 items-center min-h-[80vh]">
            <div>
              <AnimatedSection>
                <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-6 uppercase">About Me</p>
              </AnimatedSection>
              <AnimatedSection delay={100}>
                <h1 className="text-5xl md:text-7xl font-extralight leading-[1.1] mb-8">
                  Bringing <span className="text-emerald-400">life</span> to<br />products through<br />technology
                </h1>
              </AnimatedSection>
              <AnimatedSection delay={200}>
                <p className="text-white/40 text-lg leading-relaxed mb-8 max-w-lg">
                  I believe embedded development is about "bringing life to products." If hardware is the body, software is the brain that makes it move.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={300}>
                <div className="flex items-center gap-8 text-white/30 text-sm mb-10">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" />South Korea</div>
                  <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-400" />3+ Years</div>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={400}>
                <div className="flex gap-4">
                  <Button className="rounded-full bg-white text-black hover:bg-emerald-400 px-8 h-14"><Download className="w-5 h-5 mr-2" />Resume</Button>
                  <a href="mailto:contact@jahyeon.com"><Button variant="outline" className="rounded-full border-white/20 hover:bg-white/10 px-8 h-14"><Mail className="w-5 h-5 mr-2" />Contact</Button></a>
                </div>
              </AnimatedSection>
            </div>

            {/* Profile Card with Tech Image */}
            <AnimatedSection delay={200}>
              <div className="relative">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-transparent -z-10" />
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 p-8">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-8 relative">
                    <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop" alt="Technology" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-8">
                      <div className="text-center">
                        <span className="text-6xl font-extralight text-white">JH</span>
                        <p className="text-white/60 mt-2">Gu Jahyeon</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-white/[0.03]"><div className="text-2xl font-light text-emerald-400"><AnimatedCounter target={3} />+</div><div className="text-xs text-white/40 mt-1">Years</div></div>
                    <div className="p-4 rounded-xl bg-white/[0.03]"><div className="text-2xl font-light text-emerald-400"><AnimatedCounter target={4} /></div><div className="text-xs text-white/40 mt-1">Companies</div></div>
                    <div className="p-4 rounded-xl bg-white/[0.03]"><div className="text-2xl font-light text-emerald-400"><AnimatedCounter target={10} />+</div><div className="text-xs text-white/40 mt-1">Projects</div></div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-32 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent relative">
        <CircuitPattern />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <AnimatedSection>
            <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-4 uppercase">My Story</p>
            <h2 className="text-4xl md:text-5xl font-extralight mb-16">The Journey</h2>
          </AnimatedSection>
          <div className="grid lg:grid-cols-2 gap-16">
            <AnimatedSection delay={100}>
              <div className="space-y-6 text-white/50 leading-relaxed text-lg">
                <p>When I first entered the Department of Electronic Engineering, I knew nothing at all. Like an <span className="text-white">"empty memory space,"</span> everything felt unfamiliar. But as I learned bit by bit, filling that empty space with code, I realized how fascinating development could be.</p>
                <p>After serving in the Air Force as an aircraft maintenance technician, my goals became concrete. Working with actual aircraft, interpreting blueprints, and physically experiencing how components connect gave me the most valuable lesson.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="space-y-6 text-white/50 leading-relaxed text-lg">
                <p>Working at LG Electronics' partner research institute, I monitored washing machine firmware, analyzing data, verifying sensor control logic, and performing serial communication-based automation.</p>
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-transparent border-l-2 border-emerald-400">
                  <p className="text-white text-xl font-light italic">"I'm no longer a blank page. Now I'm ready to design systems myself, solve problems, and implement new features."</p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-4 uppercase">Skills</p>
            <h2 className="text-4xl md:text-5xl font-extralight mb-16">Technical Expertise</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SKILLS.map((skill, i) => {
              const Icon = skill.icon;
              return (
                <AnimatedSection key={skill.category} delay={i * 100}>
                  <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 transition-all h-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${skill.color} mb-4`}>
                      <span className="text-white text-sm font-medium">{skill.category}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skill.items.map(item => (
                        <span key={item} className="px-3 py-1.5 rounded-full bg-white/5 text-white/60 text-sm hover:bg-white/10 hover:text-white transition-all">{item}</span>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-4 uppercase">Timeline</p>
            <h2 className="text-4xl md:text-5xl font-extralight mb-16">Career & Education</h2>
          </AnimatedSection>
          <div className="relative">
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-400 via-white/20 to-transparent md:-translate-x-1/2" />
            <div className="space-y-8">
              {TIMELINE.map((item, i) => {
                const Icon = item.icon;
                const isLeft = i % 2 === 0;
                return (
                  <AnimatedSection key={i} delay={i * 100}>
                    <div className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      <div className={`flex-1 ${isLeft ? 'md:pr-16 md:text-right' : 'md:pl-16'} pl-12 md:pl-0`}>
                        <div className={`inline-block p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 transition-all`}>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono mb-3 ${item.type === 'work' ? 'bg-emerald-500/20 text-emerald-400' : item.type === 'military' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{item.year}</span>
                          <h3 className="text-xl font-light mb-1">{item.title}</h3>
                          <p className="text-emerald-400 text-sm">{item.role}</p>
                        </div>
                      </div>
                      <div className="absolute left-0 md:left-1/2 w-10 h-10 rounded-full bg-[#050505] border-2 border-emerald-400 flex items-center justify-center -translate-x-1/2 z-10">
                        <Icon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 hidden md:block" />
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Interests */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-4 uppercase">Beyond Code</p>
            <h2 className="text-4xl md:text-5xl font-extralight mb-16">Interests</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedSection delay={100}>
              <div className="group p-10 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-white/5 hover:border-purple-500/30 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Music className="w-8 h-8 text-purple-400" /></div>
                <h3 className="text-2xl font-light mb-4">Music</h3>
                <p className="text-white/40">Playing guitar, piano, and drums. The process of perfecting a complex piece mirrors debugging code and optimizing during development.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="group p-10 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-white/5 hover:border-orange-500/30 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Dumbbell className="w-8 h-8 text-orange-400" /></div>
                <h3 className="text-2xl font-light mb-4">Martial Arts & Fitness</h3>
                <p className="text-white/40">Through exercise and martial arts, I've developed mental focus and analytical thinking that translates directly to problem-solving.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-extralight mb-6">Want to see my <span className="text-emerald-400">work</span>?</h2>
            <p className="text-white/40 text-lg mb-10">Check out my projects and see what I've been building.</p>
            <Link href="/projects"><Button size="lg" className="rounded-full bg-white text-black hover:bg-emerald-400 px-10 h-16 group">View Projects <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" /></Button></Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/20 text-sm">© 2024 Gu Jahyeon. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://github.com" className="text-white/20 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            <a href="https://linkedin.com" className="text-white/20 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="mailto:contact@jahyeon.com" className="text-white/20 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
