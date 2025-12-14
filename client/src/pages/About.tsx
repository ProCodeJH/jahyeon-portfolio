import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Download, Github, Linkedin, Mail, MapPin, Calendar, Briefcase, GraduationCap, Music, Dumbbell, Award, ChevronRight } from "lucide-react";

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

function AnimatedSection({ children, className = "", delay = 0, animation = "fadeUp" }: { children: React.ReactNode; className?: string; delay?: number; animation?: string }) {
  const { ref, isInView } = useInView(0.1);
  const animations: Record<string, any> = {
    fadeUp: { transform: isInView ? "translateY(0)" : "translateY(60px)", opacity: isInView ? 1 : 0 },
    fadeIn: { opacity: isInView ? 1 : 0 },
    slideLeft: { transform: isInView ? "translateX(0)" : "translateX(-60px)", opacity: isInView ? 1 : 0 },
    slideRight: { transform: isInView ? "translateX(0)" : "translateX(60px)", opacity: isInView ? 1 : 0 },
  };
  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out ${className}`} style={{ ...animations[animation], transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// Counter animation
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView(0.5);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

const SKILLS = [
  { category: "Languages", items: ["C", "C++", "C#", "Python", "Java"], color: "from-blue-500 to-cyan-500" },
  { category: "Embedded", items: ["MCU", "RTOS", "UART", "SPI", "I2C"], color: "from-emerald-500 to-teal-500" },
  { category: "Platforms", items: ["Arduino", "Embedded Linux", "Unity"], color: "from-purple-500 to-pink-500" },
  { category: "Tools", items: ["Git", "Data Analysis", "Automation"], color: "from-orange-500 to-yellow-500" },
];

const TIMELINE = [
  { year: "2025", title: "SHL Co., Ltd.", role: "Logistics Management", type: "work", description: "Product flow management and systematic process optimization.", icon: Briefcase },
  { year: "2023", title: "LG Electronics", role: "Senior Research Institute", type: "work", description: "Washing machine firmware data analysis and sensor control verification.", icon: Briefcase },
  { year: "2022", title: "Nordground", role: "Data Analyst", type: "work", description: "Data-driven problem solving and system optimization.", icon: Briefcase },
  { year: "2021", title: "UHS Co., Ltd.", role: "Embedded Developer", type: "work", description: "H/W manufacturing and S/W DB system development.", icon: Briefcase },
  { year: "2020", title: "ROK Air Force", role: "Aircraft Maintenance", type: "military", description: "Aircraft maintenance technician. Blueprint interpretation and component analysis.", icon: Award },
  { year: "2020", title: "Kyungnam College", role: "Smart Electronics", type: "education", description: "Graduated with focus on electronic engineering.", icon: GraduationCap },
];

export default function About() {
  const [activeTimeline, setActiveTimeline] = useState(0);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-6 lg:mx-12 mt-6">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] rounded-2xl px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/"><span className="text-2xl font-extralight tracking-[0.3em] cursor-pointer hover:text-emerald-400 transition-colors">JH</span></Link>
              <div className="hidden md:flex items-center gap-12">
                {["About", "Projects", "Certifications", "Resources"].map((item) => (
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

      {/* Hero - Split Screen */}
      <section className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20 items-center min-h-[80vh]">
            {/* Left - Text */}
            <div>
              <AnimatedSection>
                <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-6 uppercase">About Me</p>
              </AnimatedSection>
              <AnimatedSection delay={100}>
                <h1 className="text-5xl md:text-7xl font-extralight leading-[1.1] mb-8">
                  Bringing <span className="text-emerald-400">life</span> to
                  <br />products through
                  <br />technology
                </h1>
              </AnimatedSection>
              <AnimatedSection delay={200}>
                <p className="text-white/40 text-lg leading-relaxed mb-8 max-w-lg">
                  I believe embedded development is about "bringing life to products." 
                  If hardware is the body, software is the brain that makes it move.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={300}>
                <div className="flex items-center gap-8 text-white/30 text-sm mb-10">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>South Korea</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    <span>3+ Years</span>
                  </div>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={400}>
                <div className="flex gap-4">
                  <Button className="rounded-full bg-white text-black hover:bg-emerald-400 px-8 h-14 group">
                    <Download className="w-5 h-5 mr-2" />
                    Resume
                  </Button>
                  <a href="mailto:contact@jahyeon.com">
                    <Button variant="outline" className="rounded-full border-white/20 bg-transparent hover:bg-white/10 px-8 h-14">
                      <Mail className="w-5 h-5 mr-2" />
                      Contact
                    </Button>
                  </a>
                </div>
              </AnimatedSection>
            </div>

            {/* Right - Profile Card */}
            <AnimatedSection delay={200} animation="slideRight">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-transparent -z-10" />
                <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-3xl bg-gradient-to-br from-blue-500/20 to-transparent -z-10" />
                
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 p-8">
                  {/* Profile image placeholder */}
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center mb-8 overflow-hidden">
                    <div className="text-center">
                      <span className="text-8xl font-extralight text-white/80">JH</span>
                      <p className="text-white/40 mt-4 text-sm">Gu Jahyeon</p>
                    </div>
                  </div>
                  
                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-white/[0.03]">
                      <div className="text-2xl font-light text-emerald-400"><AnimatedCounter target={3} />+</div>
                      <div className="text-xs text-white/40 mt-1">Years</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03]">
                      <div className="text-2xl font-light text-emerald-400"><AnimatedCounter target={4} /></div>
                      <div className="text-xs text-white/40 mt-1">Companies</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03]">
                      <div className="text-2xl font-light text-emerald-400"><AnimatedCounter target={10} />+</div>
                      <div className="text-xs text-white/40 mt-1">Projects</div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Story Section - Two Column */}
      <section className="py-32 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-4 uppercase">My Story</p>
            <h2 className="text-4xl md:text-5xl font-extralight mb-16">The Journey</h2>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-16">
            <AnimatedSection delay={100} animation="slideLeft">
              <div className="space-y-6 text-white/50 leading-relaxed text-lg">
                <p>
                  When I first entered the Department of Electronic Engineering, I knew nothing at all. 
                  Like an <span className="text-white">"empty memory space,"</span> everything felt unfamiliar. 
                  But as I learned bit by bit, filling that empty space with code, I realized how fascinating development could be.
                </p>
                <p>
                  After serving in the Air Force as an aircraft maintenance technician, my goals became concrete. 
                  Working with actual aircraft, interpreting blueprints, and physically experiencing how components connect 
                  gave me the most valuable lesson.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200} animation="slideRight">
              <div className="space-y-6 text-white/50 leading-relaxed text-lg">
                <p>
                  Working at LG Electronics' partner research institute, I monitored washing machine firmware, 
                  analyzing data, verifying sensor control logic, and performing serial communication-based automation. 
                  I directly handled the entire embedded system's data flow and control structure.
                </p>
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-transparent border-l-2 border-emerald-400">
                  <p className="text-white text-xl font-light italic">
                    "I'm no longer a blank page. Now I'm ready to design systems myself, 
                    solve problems, and implement new features."
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Skills - Modern Cards */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-4 uppercase">Skills</p>
            <h2 className="text-4xl md:text-5xl font-extralight mb-16">Technical Expertise</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SKILLS.map((skillGroup, index) => (
              <AnimatedSection key={skillGroup.category} delay={index * 100}>
                <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 h-full">
                  <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${skillGroup.color} mb-6`}>
                    <span className="text-white text-sm font-medium">{skillGroup.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill) => (
                      <span key={skill} className="px-4 py-2 rounded-full bg-white/5 text-white/60 text-sm hover:bg-white/10 hover:text-white transition-all cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline - Interactive */}
      <section className="py-32 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-4 uppercase">Timeline</p>
            <h2 className="text-4xl md:text-5xl font-extralight mb-16">Career & Education</h2>
          </AnimatedSection>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-400 via-white/20 to-transparent transform md:-translate-x-1/2" />

            <div className="space-y-12">
              {TIMELINE.map((item, index) => {
                const Icon = item.icon;
                const isLeft = index % 2 === 0;
                return (
                  <AnimatedSection key={index} delay={index * 100}>
                    <div className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      {/* Content */}
                      <div className={`flex-1 ${isLeft ? 'md:pr-16 md:text-right' : 'md:pl-16'} pl-12 md:pl-0`}>
                        <div 
                          className={`inline-block p-6 rounded-2xl transition-all duration-300 cursor-pointer ${activeTimeline === index ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                          onClick={() => setActiveTimeline(index)}
                        >
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono mb-3 ${item.type === 'work' ? 'bg-emerald-500/20 text-emerald-400' : item.type === 'military' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            {item.year}
                          </span>
                          <h3 className="text-xl font-light mb-1">{item.title}</h3>
                          <p className="text-emerald-400 text-sm mb-2">{item.role}</p>
                          <p className={`text-white/40 text-sm transition-all duration-300 ${activeTimeline === index ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden md:opacity-100 md:max-h-20'}`}>
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Center dot */}
                      <div className="absolute left-0 md:left-1/2 w-10 h-10 rounded-full bg-[#050505] border-2 border-emerald-400 flex items-center justify-center transform -translate-x-1/2 z-10">
                        <Icon className="w-4 h-4 text-emerald-400" />
                      </div>

                      {/* Empty space for other side */}
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
              <div className="group p-10 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-white/5 hover:border-purple-500/30 transition-all duration-500">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Music className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-light mb-4">Music</h3>
                <p className="text-white/40 leading-relaxed">
                  Playing guitar, piano, and drums. The process of perfecting a complex piece 
                  mirrors debugging code and optimizing during development.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="group p-10 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-white/5 hover:border-orange-500/30 transition-all duration-500">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Dumbbell className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-2xl font-light mb-4">Martial Arts & Fitness</h3>
                <p className="text-white/40 leading-relaxed">
                  Through exercise and martial arts, I've developed mental focus and analytical thinking 
                  that translates directly to problem-solving in development.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-extralight mb-6">
                Want to see my <span className="text-emerald-400">work</span>?
              </h2>
              <p className="text-white/40 text-lg mb-10">
                Check out my projects and see what I've been building.
              </p>
              <Link href="/projects">
                <Button size="lg" className="rounded-full bg-white text-black hover:bg-emerald-400 px-10 h-16 text-base group">
                  View Projects
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/20 text-sm">© 2024 Gu Jahyeon. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="https://github.com" className="text-white/20 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
              <a href="https://linkedin.com" className="text-white/20 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="mailto:contact@jahyeon.com" className="text-white/20 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
