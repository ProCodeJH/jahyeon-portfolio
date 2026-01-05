import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  Code,
  Zap,
  Sparkles,
  CircuitBoard,
  Layers,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import FuturisticHero from "@/components/landing/FuturisticHero";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* 
        HERO SECTION (Dark Video - Preserved)
      */}
      <FuturisticHero />

      {/* 
        EXPERTISE SECTION (Enterprise Light)
        Huge Typography, Spacious Layout
      */}
      <section className="py-32 md:py-48 px-6 md:px-12 relative overflow-hidden bg-white">
        <div className="max-w-[1800px] mx-auto relative z-10">
          <AnimatedSection>
            <div className="text-center mb-20 md:mb-32">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 mb-8 transform hover:scale-105 transition-transform duration-300 cursor-default">
                <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                <span className="text-sm md:text-base font-bold text-blue-700 tracking-widest uppercase">Core Expertise</span>
              </div>
              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tighter text-slate-900 leading-[0.9]">
                Technical<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Mastery
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
                Delivering industry-leading solutions across embedded systems and full-stack architecture.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[
              {
                icon: CircuitBoard,
                title: "Embedded Systems",
                desc: "Real-time operating systems (RTOS), Firmware optimization, Hardware abstraction layers.",
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100"
              },
              {
                icon: Code,
                title: "Software Engineering",
                desc: "Scalable Full-stack architecture, Cloud-native solutions, Modern CI/CD pipelines.",
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                border: "border-indigo-100"
              },
              {
                icon: Zap,
                title: "IoT Solutions",
                desc: "Industrial IoT protocols (MQTT, CoAP), Sensor fusion, Edge computing integration.",
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-100"
              },
              {
                icon: GraduationCap,
                title: "Technical Education",
                desc: "Curriculum development, Developer mentoring, Technical workshop facilitation.",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100"
              },
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div className={`group relative h-full min-h-[420px] p-10 rounded-[2.5rem] bg-white border-2 ${item.border} hover:border-transparent hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 overflow-hidden flex flex-col justify-between`}>

                  {/* Hover Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    <div className={`w-24 h-24 rounded-3xl ${item.bg} flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-white transition-all duration-500 shadow-sm`}>
                      <item.icon className={`w-12 h-12 ${item.color}`} />
                    </div>

                    <h3 className="text-3xl font-black text-slate-900 mb-6 group-hover:translate-x-2 transition-transform duration-300">
                      {item.title}
                    </h3>
                  </div>

                  <div className="relative z-10">
                    <p className="text-lg text-slate-500 font-medium leading-relaxed group-hover:text-slate-700 transition-colors">
                      {item.desc}
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 text-slate-900">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 
        PROFESSIONAL JOURNEY
      */}
      <section className="py-32 md:py-48 px-6 md:px-12 bg-slate-50 relative">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
              <div>
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-bold text-indigo-700 tracking-widest uppercase">Career Path</span>
                </div>
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900">
                  Professional<br />Journey
                </h2>
              </div>
              <p className="text-xl text-slate-500 max-w-md leading-relaxed pb-4">
                A timeline of continuous growth and technical leadership in the tech industry.
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-6">
            {[
              { year: "2025", company: "Coding Academy", role: "Coding Instructor", icon: GraduationCap, current: true, desc: "Teaching next-gen developers." },
              { year: "2024", company: "SHL Co., Ltd.", role: "Logistics Systems Engineer", icon: Layers, current: false, desc: "Optimized large-scale logistics algorithms." },
              { year: "2023", company: "LG Electronics", role: "Senior Research Engineer", icon: CircuitBoard, current: false, desc: "R&D for consumer electronics firmware." },
              { year: "2022", company: "Nordground", role: "Data Analyst", icon: Sparkles, current: false, desc: "Big data processing and visualization." },
            ].map((exp, idx) => (
              <AnimatedSection key={idx} delay={idx * 50}>
                <div className={`group flex flex-col md:flex-row items-center gap-8 p-8 md:p-12 rounded-[3rem] border transition-all duration-500 hover:scale-[1.01] cursor-default ${exp.current
                    ? "bg-white border-blue-200 shadow-xl shadow-blue-900/5 ring-4 ring-blue-50"
                    : "bg-white border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5"
                  }`}>
                  <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:rotate-6 ${exp.current ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                    }`}>
                    <exp.icon className="w-10 h-10 md:w-14 md:h-14" />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4 justify-center md:justify-start">
                      <span className={`text-xl font-bold font-mono ${exp.current ? "text-blue-600" : "text-slate-400"}`}>
                        {exp.year}
                      </span>
                      {exp.current && (
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wide">CURRENTLY WORKING</span>
                      )}
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {exp.company}
                    </h3>
                    <p className="text-xl md:text-2xl text-slate-500 font-medium mb-2">{exp.role}</p>
                    <p className="text-base text-slate-400">{exp.desc}</p>
                  </div>

                  <div className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:border-blue-200 group-hover:text-blue-500">
                    <ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 
        FEATURED WORK (Enterprise Light - Fixed Contrast)
      */}
      <section className="py-32 md:py-48 px-6 md:px-12 bg-white relative overflow-hidden">
        <div className="max-w-[1800px] mx-auto relative z-10">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
              <div>
                <h2 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-slate-900 mb-6">
                  Featured<br />Work
                </h2>
                <div className="h-2 w-32 bg-blue-600 rounded-full" />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                  disabled={activeIndex === 0}
                  className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all disabled:opacity-30"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() => setActiveIndex(Math.min((projects?.length || 1) - 1, activeIndex + 1))}
                  disabled={activeIndex === (projects?.length || 1) - 1}
                  className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all disabled:opacity-30"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>
            </div>
          </AnimatedSection>

          {/* Large Card Slider */}
          <div className="relative h-[600px] md:h-[700px] perspective-[2500px]">
            <div className="relative w-full h-full">
              {projects?.slice(0, 5).map((project, idx) => {
                const position = idx - activeIndex;
                const isActive = idx === activeIndex;
                const isPast = idx < activeIndex;
                const isFuture = idx > activeIndex;

                return (
                  <div
                    key={project.id}
                    className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isPast ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
                      }`}
                    style={{
                      transform: `
                        translateX(${position * 120}px)
                        scale(${isActive ? 1 : 0.9})
                        translateZ(${-Math.abs(position) * 100}px)
                      `,
                      zIndex: 50 - Math.abs(position),
                      opacity: isActive ? 1 : 0.4,
                    }}
                  >
                    {/* CARD CONTENT */}
                    <div className={`relative w-full h-full rounded-[3rem] overflow-hidden bg-white border border-slate-200 shadow-2xl transition-all duration-500 ${isActive ? 'shadow-blue-900/20' : ''}`}>

                      <div className="grid md:grid-cols-2 h-full">
                        {/* Left: Text Content (Dark Text on White) */}
                        <div className="p-12 md:p-16 flex flex-col justify-center bg-white order-2 md:order-1">
                          <div className="mb-6 inline-block">
                            <span className="px-4 py-2 rounded-lg bg-blue-100 text-blue-800 text-sm font-black uppercase tracking-wider">
                              Project 0{idx + 1}
                            </span>
                          </div>
                          <h3 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                            {project.title}
                          </h3>
                          <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 line-clamp-3">
                            {project.description}
                          </p>
                          <Link href="/projects">
                            <span className="inline-flex items-center gap-3 text-lg font-bold text-blue-600 hover:text-blue-800 transition-colors group cursor-pointer">
                              View Case Study
                              <span className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <ArrowRight className="w-5 h-5" />
                              </span>
                            </span>
                          </Link>
                        </div>

                        {/* Right: Image */}
                        <div className="relative h-full bg-slate-100 order-1 md:order-2 overflow-hidden">
                          {project.imageUrl ? (
                            <img
                              src={project.imageUrl}
                              alt={project.title}
                              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Code className="w-24 h-24" />
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-24">
            <Link href="/projects">
              <Button size="lg" className="rounded-full bg-slate-900 text-white px-12 py-8 text-xl font-bold hover:bg-blue-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                View All Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 
        FOOTER (Enterprise Light)
      */}
      <section className="py-32 md:py-40 px-6 md:px-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-12 tracking-tighter text-slate-900 leading-[0.9]">
              Ready to create<br />
              <span className="text-blue-600">something extraordinary?</span>
            </h2>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-24">
              <Link href="/projects">
                <Button className="rounded-full bg-blue-600 text-white px-10 py-6 text-lg font-bold hover:bg-blue-700 shadow-xl shadow-blue-600/20">
                  Explore My Work
                </Button>
              </Link>
              <Button variant="outline" className="rounded-full border-2 border-slate-200 text-slate-700 px-10 py-6 text-lg font-bold hover:bg-white hover:border-slate-300">
                Contact Me
              </Button>
            </div>

            <div className="pt-12 border-t border-slate-200 text-slate-400 font-medium">
              &copy; 2026 JAHYEON PORTFOLIO. All Rights Reserved.
            </div>
          </AnimatedSection>
        </div>
      </section>

      <style>{`
        .perspective-2500 { perspective: 2500px; }
      `}</style>
    </div>
  );
}
