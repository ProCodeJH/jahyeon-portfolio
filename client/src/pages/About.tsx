import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Download, Github, Linkedin, Mail, MapPin, Briefcase, GraduationCap, Music, Dumbbell, Award, Cpu, Code, Database, Users } from "lucide-react";
import { GradientMeshBackground } from "@/components/backgrounds/GradientMeshBackground";
import { SubtleDots } from "@/components/backgrounds/SubtleDots";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

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

const SKILLS = [
  { category: "Languages", items: ["C", "C++", "C#", "Python", "Java"], color: "from-blue-500 to-cyan-500", icon: Code },
  { category: "Embedded", items: ["MCU", "RTOS", "UART", "SPI", "I2C"], color: "from-purple-500 to-pink-500", icon: Cpu },
  { category: "Platforms", items: ["Arduino", "Linux", "Unity"], color: "from-green-500 to-emerald-500", icon: Database },
  { category: "Tools", items: ["Git", "Data Analysis", "Automation"], color: "from-orange-500 to-yellow-500", icon: Briefcase },
];

const TIMELINE = [
  { year: "2025", title: "Coding Academy", role: "Coding Instructor", type: "work", icon: Users, current: true },
  { year: "~2024.11", title: "SHL Co., Ltd.", role: "Logistics Systems (Hankook Tire Partner)", type: "work", icon: Briefcase, current: false },
  { year: "2023", title: "LG Electronics", role: "Senior Research Institute", type: "work", icon: Briefcase, current: false },
  { year: "2022", title: "Nordground", role: "Data Analyst", type: "work", icon: Briefcase, current: false },
  { year: "2021", title: "UHS Co., Ltd.", role: "Embedded Developer", type: "work", icon: Briefcase, current: false },
  { year: "2020", title: "ROK Air Force", role: "Aircraft Maintenance", type: "military", icon: Award, current: false },
  { year: "2020", title: "Kyungnam College", role: "Smart Electronics", type: "education", icon: GraduationCap, current: false },
];

export default function About() {
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
                  <span className={`text-sm font-medium transition-all cursor-pointer relative group ${
                    item === "About" ? "text-purple-600" : "text-gray-600 hover:text-purple-600"
                  }`}>
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen pt-32 pb-20 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center min-h-[80vh]">
            <div>
              <AnimatedSection>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-purple-600 font-medium text-sm tracking-wider uppercase">About Me</p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={100}>
                <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900">
                  Bringing life to<br />products through<br />technology
                </h1>
              </AnimatedSection>
              <AnimatedSection delay={200}>
                <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-lg">
                  I believe embedded development is about "bringing life to products." If hardware is the body, software is the brain that makes it move.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={300}>
                <div className="flex items-center gap-8 text-gray-500 text-sm mb-10">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-purple-600" />South Korea</div>
                  <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-purple-600" />3+ Years</div>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={400}>
                <div className="flex gap-4">
                  <Button className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 transition-all px-8 h-14 shadow-lg shadow-purple-500/30">
                    <Download className="w-5 h-5 mr-2" />Resume
                  </Button>
                  <a href="mailto:contact@jahyeon.com">
                    <Button variant="outline" className="rounded-full border-2 border-gray-300 hover:bg-gray-100 hover:border-purple-400 px-8 h-14">
                      <Mail className="w-5 h-5 mr-2" />Contact
                    </Button>
                  </a>
                </div>
              </AnimatedSection>
            </div>

            {/* Profile Card with TiltCard */}
            <AnimatedSection delay={200}>
              <TiltCard>
                <div className="rounded-3xl overflow-hidden bg-white border border-gray-200 hover:border-purple-300 p-8 transition-all duration-500 shadow-lg hover:shadow-2xl">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-8">
                    <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop" alt="Technology" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <TiltCard sensitivity={5}>
                      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
                        <div className="text-2xl font-bold text-purple-600"><AnimatedCounter target={3} />+</div>
                        <div className="text-xs text-gray-600 mt-1">Years</div>
                      </div>
                    </TiltCard>
                    <TiltCard sensitivity={5}>
                      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
                        <div className="text-2xl font-bold text-purple-600"><AnimatedCounter target={5} /></div>
                        <div className="text-xs text-gray-600 mt-1">Companies</div>
                      </div>
                    </TiltCard>
                    <TiltCard sensitivity={5}>
                      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
                        <div className="text-2xl font-bold text-purple-600"><AnimatedCounter target={10} />+</div>
                        <div className="text-xs text-gray-600 mt-1">Projects</div>
                      </div>
                    </TiltCard>
                  </div>
                </div>
              </TiltCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-32 px-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <p className="text-purple-600 font-medium text-sm tracking-wider mb-4 uppercase">My Story</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-purple-900">The Journey</h2>
          </AnimatedSection>
          <div className="grid lg:grid-cols-2 gap-16">
            <AnimatedSection delay={100}>
              <TiltCard sensitivity={5}>
                <div className="p-8 rounded-3xl bg-white border border-gray-200 hover:border-purple-300 transition-all shadow-lg hover:shadow-2xl space-y-6 text-gray-600 leading-relaxed text-lg">
                  <p>When I first entered the Department of Electronic Engineering, I knew nothing at all. Like an <span className="text-gray-900 font-medium">"empty memory space,"</span> everything felt unfamiliar. But as I learned bit by bit, filling that empty space with code, I realized how fascinating development could be.</p>
                  <p>After serving in the Air Force as an aircraft maintenance technician, my goals became concrete. Working with actual aircraft, interpreting blueprints, and physically experiencing how components connect gave me the most valuable lesson.</p>
                </div>
              </TiltCard>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                <TiltCard sensitivity={5}>
                  <div className="p-8 rounded-3xl bg-white border border-gray-200 hover:border-purple-300 transition-all shadow-lg hover:shadow-2xl">
                    <p>Working at LG Electronics' partner research institute, I monitored washing machine firmware, analyzing data, verifying sensor control logic, and performing serial communication-based automation.</p>
                  </div>
                </TiltCard>
                <TiltCard sensitivity={5}>
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-100 to-blue-100 border-l-4 border-purple-600 hover:from-purple-200 hover:to-blue-200 transition-all shadow-lg">
                    <p className="text-gray-900 text-xl font-medium italic">"I'm no longer a blank page. Now I'm ready to design systems myself, solve problems, and implement new features."</p>
                  </div>
                </TiltCard>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-32 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <p className="text-purple-600 font-medium text-sm tracking-wider mb-4 uppercase">Skills</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-purple-900">Technical Expertise</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SKILLS.map((skill, i) => {
              const Icon = skill.icon;
              return (
                <AnimatedSection key={skill.category} delay={i * 100}>
                  <TiltCard>
                    <div className="p-8 rounded-3xl bg-white border border-gray-200 hover:border-purple-300 transition-all duration-500 h-full shadow-lg hover:shadow-2xl">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center mb-6 shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${skill.color} mb-4 shadow-lg`}>
                        <span className="text-white text-sm font-medium">{skill.category}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skill.items.map(item => (
                          <span key={item} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm border border-gray-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all">{item}</span>
                        ))}
                      </div>
                    </div>
                  </TiltCard>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 px-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <p className="text-purple-600 font-medium text-sm tracking-wider mb-4 uppercase">Timeline</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-purple-900">Career & Education</h2>
          </AnimatedSection>
          <div className="relative">
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-400 via-gray-300 to-transparent md:-translate-x-1/2" />
            <div className="space-y-8">
              {TIMELINE.map((item, i) => {
                const Icon = item.icon;
                const isLeft = i % 2 === 0;
                return (
                  <AnimatedSection key={i} delay={i * 100}>
                    <div className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      <div className={`flex-1 ${isLeft ? 'md:pr-16 md:text-right' : 'md:pl-16'} pl-12 md:pl-0`}>
                        <TiltCard sensitivity={5}>
                          <div className={`inline-block p-6 rounded-2xl bg-white border-2 ${item.current ? 'border-purple-400 shadow-xl shadow-purple-500/30' : 'border-gray-200'} hover:border-purple-400 transition-all hover:shadow-xl`}>
                            <div className="flex items-center gap-2 justify-start md:justify-end mb-3">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono ${item.type === 'work' ? 'bg-purple-100 text-purple-600 border border-purple-300' : item.type === 'military' ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'bg-green-100 text-green-600 border border-green-300'}`}>
                                {item.year}
                              </span>
                              {item.current && (
                                <span className="px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-bold animate-pulse">
                                  CURRENT
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                            <p className="text-purple-600 text-sm font-medium">{item.role}</p>
                          </div>
                        </TiltCard>
                      </div>
                      <div
                        className={`absolute left-0 md:left-1/2 w-10 h-10 rounded-full bg-white border-2 ${item.current ? 'border-purple-600 shadow-lg shadow-purple-500/50' : 'border-purple-400'} flex items-center justify-center -translate-x-1/2 z-10`}
                      >
                        <Icon className="w-4 h-4 text-purple-600" />
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
      <section className="py-32 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <p className="text-purple-600 font-medium text-sm tracking-wider mb-4 uppercase">Beyond Code</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-purple-900">Interests</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedSection delay={100}>
              <TiltCard>
                <div className="p-10 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 hover:border-purple-400 transition-all shadow-lg hover:shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Music</h3>
                  <p className="text-gray-700">Playing guitar, piano, and drums. The process of perfecting a complex piece mirrors debugging code and optimizing during development.</p>
                </div>
              </TiltCard>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <TiltCard>
                <div className="p-10 rounded-3xl bg-gradient-to-br from-orange-100 to-yellow-100 border border-orange-200 hover:border-orange-400 transition-all shadow-lg hover:shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-6 shadow-lg">
                    <Dumbbell className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Martial Arts & Fitness</h3>
                  <p className="text-gray-700">Through exercise and martial arts, I've developed mental focus and analytical thinking that translates directly to problem-solving.</p>
                </div>
              </TiltCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900">Want to see my work?</h2>
            <p className="text-gray-600 text-lg mb-10">Check out my projects and see what I've been building.</p>
            <Link href="/projects">
              <Button size="lg" className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 transition-all px-10 h-16 group shadow-lg shadow-purple-500/30">
                View Projects
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-sm">© 2024 Gu Jahyeon. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://github.com" className="text-gray-400 hover:text-purple-600 transition-colors"><Github className="w-5 h-5" /></a>
            <a href="https://linkedin.com" className="text-gray-400 hover:text-purple-600 transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="mailto:contact@jahyeon.com" className="text-gray-400 hover:text-purple-600 transition-colors"><Mail className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
