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
} from "lucide-react";
import FuturisticHero from "@/components/landing/FuturisticHero";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative font-sans">

      {/* 
        HERO SECTION 
        Dark Video Background (As requested 'reverted')
      */}
      <FuturisticHero />

      {/* 
        EXPERTISE SECTION (Light Theme)
        Clean White Background, High Contrast Text
      */}
      <section className="py-24 md:py-32 px-4 md:px-8 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection>
            <div className="text-center mb-16 md:mb-24">
              <div className="inline-flex items-center gap-2 md:gap-3 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin-slow" />
                <span className="text-xs md:text-sm font-bold text-blue-600 tracking-wider uppercase">Core Expertise</span>
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight text-slate-900">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                  Expertise
                </span>
              </h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto opacity-80" />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: CircuitBoard,
                title: "Embedded Systems",
                desc: "MCU programming, RTOS, firmware optimization",
                color: "from-blue-500 to-cyan-500",
                iconBg: "bg-blue-50",
                iconColor: "text-blue-600",
                img: "/images/expertise/embedded-systems.jpg",
              },
              {
                icon: Code,
                title: "Software dev",
                desc: "Python, Java, C/C++, Full-stack",
                color: "from-indigo-500 to-purple-500",
                iconBg: "bg-indigo-50",
                iconColor: "text-indigo-600",
                img: "/images/expertise/software-development.jpg",
              },
              {
                icon: Zap,
                title: "IoT Solutions",
                desc: "Connected devices, sensors, automation",
                color: "from-orange-500 to-amber-500",
                iconBg: "bg-orange-50",
                iconColor: "text-orange-600",
                img: "/images/expertise/iot-solutions.jpg",
              },
              {
                icon: GraduationCap,
                title: "Coding Education",
                desc: "Teaching programming, mentoring developers",
                color: "from-emerald-500 to-teal-500",
                iconBg: "bg-emerald-50",
                iconColor: "text-emerald-600",
                img: "/images/expertise/coding-education.jpg",
              },
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <TiltCard sensitivity={4}>
                  <div className="group relative h-[400px] rounded-[2rem] bg-white border border-slate-200 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden">

                    {/* Top Gradient */}
                    <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${item.color} opacity-10 group-hover:opacity-20 transition-opacity`} />

                    <div className="relative h-full p-8 flex flex-col items-center text-center justify-between z-10">
                      <div className={`w-20 h-20 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                        <item.icon className={`w-10 h-10 ${item.iconColor}`} />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-slate-500 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>

                      <div className="w-12 h-1 rounded-full bg-slate-100 group-hover:w-full group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-blue-500 group-hover:to-transparent transition-all duration-500" />
                    </div>
                  </div>
                </TiltCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 
        PROFESSIONAL JOURNEY (Light Theme)
        Bg-Slate-50
      */}
      <section className="py-24 md:py-32 px-4 md:px-8 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection>
            <div className="text-center mb-16 md:mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-xs md:text-sm font-bold text-indigo-600 tracking-wider uppercase">Career Path</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-slate-900">
                Professional Journey
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              { year: "2025", company: "Coding Academy", role: "Coding Instructor", icon: GraduationCap, current: true },
              { year: "~2024.11", company: "SHL Co., Ltd.", role: "Logistics Systems", icon: Layers, current: false },
              { year: "2023-24", company: "LG Electronics", role: "Sr. Research Engineer", icon: CircuitBoard, current: false },
              { year: "2022", company: "Nordground", role: "Data Analysis", icon: Sparkles, current: false },
            ].map((exp, idx) => {
              const Icon = exp.icon;
              return (
                <AnimatedSection key={idx} delay={idx * 100}>
                  <div className={`p-8 rounded-3xl border transition-all duration-500 hover:-translate-y-1 ${exp.current
                      ? "bg-white border-blue-200 shadow-xl shadow-blue-500/10"
                      : "bg-white border-slate-100 shadow-lg hover:shadow-xl hover:border-blue-100"
                    }`}>
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 ${exp.current ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-sm font-bold font-mono ${exp.current ? "text-blue-600" : "text-slate-400"}`}>
                            {exp.year}
                          </span>
                          {exp.current && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">CURRENT</span>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-1">{exp.company}</h3>
                        <p className="text-slate-500 font-medium">{exp.role}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* 
        FEATURED WORK (Light Theme - 3D Cards)
        Bg-White
      */}
      <section className="py-24 md:py-32 px-4 md:px-8 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
                Featured Work
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Swipe through my latest projects
              </p>
            </div>
          </AnimatedSection>

          {/* 3D Stacked Cards Container */}
          <div className="relative max-w-4xl mx-auto h-[500px] perspective-[2000px]">
            <div className="relative w-full h-full">
              {projects?.slice(0, 5).map((project, idx) => {
                const position = idx - activeIndex;
                const isActive = idx === activeIndex;
                const isPast = idx < activeIndex;
                const isFuture = idx > activeIndex;

                return (
                  <div
                    key={project.id}
                    className={`absolute inset-0 transition-all duration-700 cursor-pointer ${isPast ? "pointer-events-none opacity-0" : "pointer-events-auto"
                      }`}
                    style={{
                      transform: `
                        translateX(${position * 40}px)
                        translateY(${Math.abs(position) * 10}px)
                        translateZ(${-Math.abs(position) * 100}px)
                        rotateY(${position * -5}deg)
                        scale(${1 - Math.abs(position) * 0.05})
                      `,
                      zIndex: 50 - Math.abs(position),
                      opacity: Math.max(0, 1 - Math.abs(position) * 0.2),
                    }}
                    onClick={() => {
                      if (isFuture) setActiveIndex(idx);
                    }}
                  >
                    <div className={`relative w-full h-full rounded-[2.5rem] overflow-hidden bg-white shadow-2xl border transition-all duration-500 ${isActive ? 'border-blue-200 shadow-blue-900/10' : 'border-slate-200'
                      }`}>
                      {project.imageUrl ? (
                        <div className="absolute inset-0">
                          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-slate-100" />
                      )}

                      <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                        <div className={`transform transition-all duration-700 ${isActive ? "translate-y-0 opacity-100" : "translate-y-10 opacity-60"}`}>
                          <div className="bg-blue-600 w-fit px-4 py-1 rounded-full text-xs font-bold mb-4">
                            PROJECT #{idx + 1}
                          </div>
                          <h3 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                            {project.title}
                          </h3>
                          <p className="text-lg text-slate-200 font-medium line-clamp-2 mb-8">
                            {project.description}
                          </p>
                          {isActive && (
                            <Link href="/projects">
                              <span className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors">
                                View Details <ArrowRight className="w-4 h-4" />
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Buttons */}
            <button
              onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-[60] p-4 rounded-full bg-white shadow-xl text-slate-900 hover:text-blue-600 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveIndex(Math.min((projects?.length || 1) - 1, activeIndex + 1))}
              disabled={activeIndex === (projects?.length || 1) - 1}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-[60] p-4 rounded-full bg-white shadow-xl text-slate-900 hover:text-blue-600 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center mt-20">
            <Link href="/projects">
              <Button size="lg" className="rounded-full bg-slate-900 text-white px-10 py-6 text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl">
                All Projects <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 
        FOOTER / COMMUNITY (Light Theme)
        Bg-Slate-50
      */}
      <section className="py-24 md:py-32 px-4 md:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">Join The Community</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tight text-slate-900 leading-tight">
              A space created to<br />
              <span className="text-blue-600">grow together</span>
            </h2>

            <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              I hope everyone can share, exchange, and nurture their dreams together here.
              Let's build the future.
            </p>

            {/* AI Tools Slider (Light Mode style) */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 py-8 shadow-lg">
              <div className="flex gap-8 animate-scroll-left-fast">
                {/* Simplified placeholder for AI tools loop */}
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-32 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <span className="font-bold text-slate-400">AI Tool {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <style>{`
        .animate-scroll-left-fast { animation: scroll-left 20s linear infinite; }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .perspective-2000 { perspective: 2000px; }
      `}</style>
    </div>
  );
}
