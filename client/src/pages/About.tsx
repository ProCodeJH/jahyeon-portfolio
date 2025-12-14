import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Download, Github, Linkedin, Mail, MapPin, GraduationCap, Briefcase, Music, Dumbbell } from "lucide-react";

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

const SKILLS = [
  { category: "Languages", items: ["C", "C++", "C#", "Python", "Java"] },
  { category: "Embedded", items: ["MCU Programming", "RTOS", "UART", "SPI", "I2C"] },
  { category: "Platforms", items: ["Arduino", "Embedded Linux", "Unity", "Unreal"] },
  { category: "Tools", items: ["Git", "Data Analysis", "System Design", "Automation"] },
];

const TIMELINE = [
  { year: "2025", title: "SHL Co., Ltd.", role: "Logistics Management", type: "work", description: "Product flow management and systematic process optimization." },
  { year: "2023-2024", title: "LG Electronics", role: "Senior Research Institute", type: "work", description: "Washing machine firmware data analysis, sensor control logic verification, serial communication-based automation." },
  { year: "2022", title: "Nordground", role: "Data Analyst", type: "work", description: "Data-driven problem solving and system optimization." },
  { year: "2021-2022", title: "UHS Co., Ltd.", role: "Embedded Developer", type: "work", description: "H/W manufacturing and S/W DB system development." },
  { year: "2020-2021", title: "ROK Air Force", role: "Aircraft Maintenance", type: "military", description: "Aircraft maintenance technician. Learned blueprints and component connections." },
  { year: "2020", title: "Kyungnam College", role: "Smart Electronics", type: "education", description: "Graduated with focus on electronic engineering and software development." },
];

export default function About() {
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
                  <span className={`text-sm font-light transition-colors cursor-pointer tracking-wide ${item === "About" ? "text-white" : "text-white/60 hover:text-white"}`}>{item}</span>
                </Link>
              ))}
            </div>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <AnimatedSection><p className="text-emerald-400 font-mono text-sm tracking-widest mb-6">ABOUT ME</p></AnimatedSection>
              <AnimatedSection delay={100}>
                <h1 className="text-4xl md:text-6xl font-light leading-tight mb-8">
                  Bringing life to<br /><span className="text-emerald-400">products</span> through<br />technology
                </h1>
              </AnimatedSection>
              <AnimatedSection delay={200}>
                <p className="text-white/50 text-lg leading-relaxed mb-8">
                  I believe embedded development is about "bringing life to products." 
                  If hardware is the body, software is the brain that makes it move. 
                  Understanding both elements is what makes an exceptional developer.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={300}>
                <div className="flex items-center gap-6 text-white/40 text-sm mb-8">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>South Korea</span></div>
                  <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /><span>3+ Years Experience</span></div>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={400}>
                <div className="flex gap-4">
                  <Button className="rounded-full bg-white text-black hover:bg-white/90 px-6"><Download className="w-4 h-4 mr-2" />Download Resume</Button>
                  <a href="mailto:contact@jahyeon.com"><Button variant="outline" className="rounded-full border-white/20 bg-transparent hover:bg-white/10"><Mail className="w-4 h-4 mr-2" />Contact</Button></a>
                </div>
              </AnimatedSection>
            </div>
            <AnimatedSection delay={200}>
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 p-1">
                  <div className="w-full h-full rounded-3xl bg-[#0a0a0a] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center mb-6">
                        <span className="text-6xl font-light text-white">JH</span>
                      </div>
                      <h3 className="text-2xl font-light">Gu Jahyeon</h3>
                      <p className="text-white/40 mt-2">Embedded Systems Engineer</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl bg-emerald-500/10 -z-10" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-2xl bg-blue-500/10 -z-10" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection><p className="text-emerald-400 font-mono text-sm tracking-widest mb-4">MY STORY</p><h2 className="text-3xl md:text-4xl font-light mb-12">Growth Journey</h2></AnimatedSection>
          <div className="grid lg:grid-cols-2 gap-16">
            <AnimatedSection delay={100}>
              <div className="space-y-8 text-white/60 leading-relaxed">
                <p>When I first entered the Department of Electronic Engineering, I knew nothing at all. Like an "empty memory space," everything felt unfamiliar. But as I learned bit by bit, filling that empty space with code, I realized how fascinating development could be.</p>
                <p>After serving in the Air Force as an aircraft maintenance technician, my goals became concrete. Working with actual aircraft, interpreting blueprints, and physically experiencing how components connect gave me the most valuable lesson.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="space-y-8 text-white/60 leading-relaxed">
                <p>Working at LG Electronics' partner research institute, I monitored washing machine firmware, analyzing data, verifying sensor control logic, and performing serial communication-based automation. I directly handled the entire embedded system's data flow and control structure.</p>
                <p className="text-white text-lg italic border-l-2 border-emerald-400 pl-6">"I'm no longer a blank page. Now I'm ready to design systems myself, solve problems, and implement new features."</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection><p className="text-emerald-400 font-mono text-sm tracking-widest mb-4">SKILLS</p><h2 className="text-3xl md:text-4xl font-light mb-12">Technical Expertise</h2></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SKILLS.map((skillGroup, index) => (
              <AnimatedSection key={skillGroup.category} delay={index * 100}>
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h3 className="text-emerald-400 font-mono text-sm mb-4">{skillGroup.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill) => (<span key={skill} className="px-3 py-1.5 rounded-full bg-white/5 text-white/70 text-sm">{skill}</span>))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection><p className="text-emerald-400 font-mono text-sm tracking-widest mb-4">TIMELINE</p><h2 className="text-3xl md:text-4xl font-light mb-12">Career & Education</h2></AnimatedSection>
          <div className="relative">
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-white/10 transform md:-translate-x-1/2" />
            <div className="space-y-12">
              {TIMELINE.map((item, index) => (
                <AnimatedSection key={index} delay={index * 100}>
                  <div className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <div className={`flex-1 ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"}`}>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-mono mb-3 ${item.type === "work" ? "bg-emerald-500/20 text-emerald-400" : item.type === "military" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>{item.year}</div>
                      <h3 className="text-xl font-medium mb-1">{item.title}</h3>
                      <p className="text-emerald-400 text-sm mb-3">{item.role}</p>
                      <p className="text-white/40 text-sm">{item.description}</p>
                    </div>
                    <div className="absolute left-0 md:left-1/2 top-0 w-3 h-3 rounded-full bg-emerald-400 transform -translate-x-1/2 md:-translate-x-1/2 ring-4 ring-[#0a0a0a]" />
                    <div className="flex-1 hidden md:block" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interests */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection><p className="text-emerald-400 font-mono text-sm tracking-widest mb-4">BEYOND CODE</p><h2 className="text-3xl md:text-4xl font-light mb-12">Interests & Hobbies</h2></AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedSection delay={100}>
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                <Music className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-xl font-medium mb-3">Music</h3>
                <p className="text-white/50 leading-relaxed">I enjoy playing guitar, piano, and drums. The process of perfecting a complex piece is similar to debugging code and optimizing during development.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                <Dumbbell className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-xl font-medium mb-3">Martial Arts & Fitness</h3>
                <p className="text-white/50 leading-relaxed">Through exercise and martial arts, I've developed mental focus and problem-solving skills. Analyzing an opponent's movements requires the same analytical thinking needed for development.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-light mb-6">Want to see my work?</h2>
              <p className="text-white/40 mb-8">Check out my projects and see what I've been building.</p>
              <Link href="/projects"><Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 px-8">View Projects<ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/30 text-sm">© 2024 Gu Jahyeon. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="https://github.com" className="text-white/30 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
              <a href="https://linkedin.com" className="text-white/30 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="mailto:contact@jahyeon.com" className="text-white/30 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
