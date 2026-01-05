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
import { CleanBackground } from "@/components/3d/CleanBackground";
// import { Navigation } from "@/components/layout/Navigation"; // Replaced by internal nav in FuturisticHero
import FuturisticHero from "@/components/landing/FuturisticHero";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      {/* NEW: Futuristic Hero Section (Spline 3D & Parallax) */}
      <FuturisticHero />

      {/* Legacy Sections below */}

      {/* Expertise Section */}
      <section className="py-20 md:py-32 lg:py-40 px-4 md:px-8 relative overflow-hidden">
        {/* Dark Background Overlay for Readability */}
        <div className="absolute inset-0 bg-slate-950/80" />

        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection>
            <div className="text-center mb-12 md:mb-16 lg:mb-20">
              <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-4 md:mb-6 shadow-lg">
                <Sparkles className="w-4 md:w-5 h-4 md:h-5 text-blue-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-xs md:text-sm font-bold text-blue-300 tracking-wider uppercase">Core Expertise</span>
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">
                  Expertise
                </span>
              </h2>
              <div className="w-24 md:w-32 h-1.5 md:h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto shadow-lg shadow-blue-500/50" />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: CircuitBoard,
                title: "Embedded Systems",
                desc: "MCU programming, RTOS, firmware optimization",
                color: "from-blue-500 to-cyan-500",
                iconBg: "from-blue-500/30 to-cyan-500/30",
                glowColor: "shadow-blue-500/50",
                img: "/images/expertise/embedded-systems.jpg",
                delay: "0s",
              },
              {
                icon: Code,
                title: "Software Development",
                desc: "Python, Java, C/C++, Full-stack",
                color: "from-purple-500 to-pink-500",
                iconBg: "from-purple-500/30 to-pink-500/30",
                glowColor: "shadow-purple-500/50",
                img: "/images/expertise/software-development.jpg",
                delay: "0.5s",
              },
              {
                icon: Zap,
                title: "IoT Solutions",
                desc: "Connected devices, sensors, automation",
                color: "from-orange-500 to-yellow-500",
                iconBg: "from-orange-500/30 to-yellow-500/30",
                glowColor: "shadow-orange-500/50",
                img: "/images/expertise/iot-solutions.jpg",
                delay: "1s",
              },
              {
                icon: GraduationCap,
                title: "Coding Education",
                desc: "Teaching programming, mentoring developers",
                color: "from-emerald-500 to-teal-500",
                iconBg: "from-emerald-500/30 to-teal-500/30",
                glowColor: "shadow-emerald-500/50",
                img: "/images/expertise/coding-education.jpg",
                delay: "1.5s",
              },
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div
                  className="group relative animate-float cursor-pointer"
                  style={{
                    animationDelay: item.delay,
                    animationDuration: "6s",
                  }}
                >
                  {/* Rotating Border Animation */}
                  <div
                    className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500 animate-gradient-x"
                    style={{ backgroundSize: "200% 200%" }}
                  />

                  {/* Main Card with Dark Glassmorphism */}
                  <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/30 transition-all duration-700 h-[400px] md:h-[450px] lg:h-[500px] group-hover:scale-[1.05] group-hover:-translate-y-3">
                    {/* Dark Background with Image */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-1000"
                      />
                      {/* Darker gradient at bottom for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
                    </div>

                    {/* Floating Particles */}
                    <div className="absolute top-10 right-10 w-2 h-2 rounded-full bg-blue-400/60 animate-float" style={{ animationDelay: '0s', animationDuration: '3s' }} />
                    <div className="absolute top-20 right-20 w-3 h-3 rounded-full bg-purple-400/40 animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }} />
                    <div className="absolute bottom-20 left-10 w-2 h-2 rounded-full bg-pink-400/50 animate-float" style={{ animationDelay: '2s', animationDuration: '5s' }} />

                    {/* Content Container */}
                    <div className="relative h-full p-6 md:p-8 flex flex-col justify-between">
                      {/* Icon with 3D Effect */}
                      <div className="relative">
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-br ${item.iconBg} backdrop-blur-xl border-2 border-white/30 flex items-center justify-center shadow-2xl ${item.glowColor} group-hover:scale-125 group-hover:rotate-12 transition-all duration-700`}>
                          <item.icon className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                          {/* Icon Glow */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-50 blur-xl rounded-2xl md:rounded-3xl transition-opacity duration-500`} />
                        </div>
                        {/* Pulsing Ring */}
                        <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl border-2 border-white/20 group-hover:scale-150 group-hover:opacity-0 transition-all duration-700" />
                      </div>

                      {/* Text Content with Enhanced Typography */}
                      <div className="space-y-2 md:space-y-3">
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-2 md:mb-3 drop-shadow-2xl group-hover:translate-x-3 group-hover:scale-105 transition-all duration-500 leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-gray-200 text-sm md:text-base leading-relaxed drop-shadow-lg font-medium group-hover:translate-x-2 transition-transform duration-500">
                          {item.desc}
                        </p>

                        {/* Premium Indicator Bar */}
                        <div className="flex items-center gap-2 pt-2 md:pt-3 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                          <div className={`h-1 w-0 group-hover:w-12 md:group-hover:w-16 bg-gradient-to-r ${item.color} rounded-full transition-all duration-700 shadow-lg`} />
                          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200" />
                        </div>
                      </div>
                    </div>

                    {/* Premium Glow Effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${item.color} rounded-[2rem] opacity-0 group-hover:opacity-40 blur-2xl transition-all duration-700 -z-10`} />
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Journey Section */}
      <section className="py-20 md:py-32 lg:py-40 px-4 md:px-8 relative">
        {/* Dark Background Overlay for Readability */}
        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection>
            <div className="text-center mb-12 md:mb-16 lg:mb-20">
              <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-4 md:mb-6">
                <Layers className="w-4 md:w-5 h-4 md:h-5 text-blue-400" />
                <span className="text-xs md:text-sm font-bold text-blue-300 tracking-wider uppercase">Career Path</span>
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">
                  Professional Journey
                </span>
              </h2>
              <div className="w-24 md:w-32 h-1.5 md:h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto" />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                year: "2025",
                company: "Coding Academy",
                role: "Coding Instructor",
                icon: GraduationCap,
                current: true,
              },
              {
                year: "~2024.11",
                company: "SHL Co., Ltd.",
                role: "Logistics Systems (Hankook Tire Partner)",
                icon: Layers,
                current: false,
              },
              {
                year: "2023-24",
                company: "LG Electronics",
                role: "Senior Research Engineer",
                icon: CircuitBoard,
                current: false,
              },
              {
                year: "2022",
                company: "Nordground",
                role: "Data Analysis & Optimization",
                subtitle: "LG Electronics Partner Company",
                position: "Senior Research Engineer",
                icon: Sparkles,
                current: false,
              },
            ].map((exp, idx) => {
              const Icon = exp.icon;
              return (
                <AnimatedSection key={idx} delay={idx * 100}>
                  <TiltCard sensitivity={6}>
                    <div
                      className={`group relative p-5 md:p-8 rounded-2xl md:rounded-3xl bg-slate-900/60 backdrop-blur-xl border-2 ${exp.current
                        ? "border-blue-400 shadow-2xl shadow-blue-500/20"
                        : "border-white/10"
                        } hover:border-blue-400 hover:shadow-2xl transition-all duration-500 overflow-hidden`}
                    >
                      {/* Premium Background Effect */}
                      {exp.current && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                      )}

                      <div className="relative flex items-start gap-4 md:gap-6">
                        {/* Premium Icon */}
                        <div
                          className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${exp.current
                            ? "from-blue-500 to-purple-500"
                            : "from-gray-600 to-gray-700"
                            } flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 flex-shrink-0`}
                        >
                          <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <p
                              className={`text-xs md:text-sm font-black font-mono tracking-wider ${exp.current
                                ? "text-blue-400"
                                : "text-gray-400"
                                }`}
                            >
                              {exp.year}
                            </p>
                            {exp.current && (
                              <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] md:text-xs font-black tracking-wider shadow-lg">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg md:text-2xl font-black text-white mb-1 md:mb-2 group-hover:text-blue-400 transition-colors">
                            {exp.company}
                          </h3>
                          <p className="text-sm md:text-base text-gray-300 font-medium mb-1">{exp.role}</p>
                          {exp.subtitle && (
                            <p className="text-xs md:text-sm text-blue-400 font-semibold mb-1">{exp.subtitle}</p>
                          )}
                          {exp.position && (
                            <p className="text-xs md:text-sm text-gray-500 italic">Position: {exp.position}</p>
                          )}
                        </div>
                      </div>

                      {/* Premium Border Glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10" />
                    </div>
                  </TiltCard>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3D Stacked Cards - Featured Work */}
      <section className="py-20 md:py-32 lg:py-40 px-4 md:px-8 relative overflow-hidden">
        {/* Dark Background Overlay for Readability */}
        <div className="absolute inset-0 bg-slate-950/80" />

        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection>
            {/* Header */}
            <div className="text-center mb-12 md:mb-16 lg:mb-20">
              <h2 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tight mb-4 md:mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">
                  Featured Work
                </span>
              </h2>
              <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto font-medium">
                Swipe through my latest projects
              </p>
            </div>
          </AnimatedSection>

          {/* 3D Stacked Cards Container */}
          <div className="relative max-w-4xl mx-auto h-[500px] md:h-[600px] perspective-[2000px]">
            {/* Cards Stack */}
            <div className="relative w-full h-full">
              {projects?.slice(0, 5).map((project, idx) => {
                const position = idx - activeIndex;
                const isActive = idx === activeIndex;
                const isPast = idx < activeIndex;
                const isFuture = idx > activeIndex;

                return (
                  <div
                    key={project.id}
                    className={`absolute inset-0 transition-all duration-700 cursor-pointer ${isPast ? "pointer-events-none" : "pointer-events-auto"
                      }`}
                    style={{
                      transform: `
                        translateX(${position * 30}px)
                        translateY(${Math.abs(position) * 20}px)
                        translateZ(${-Math.abs(position) * 100}px)
                        rotateY(${position * -15}deg)
                        scale(${1 - Math.abs(position) * 0.1})
                      `,
                      zIndex: 50 - Math.abs(position),
                      opacity: Math.max(0, 1 - Math.abs(position) * 0.3),
                      transformStyle: "preserve-3d",
                    }}
                    onClick={() => {
                      if (isFuture) setActiveIndex(idx);
                    }}
                  >
                    {/* Card */}
                    <div className={`relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 ${isActive ? 'shadow-blue-500/30 scale-100' : 'shadow-black/40'
                      }`}>
                      {/* Premium Gradient Border */}
                      <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-[3rem] blur-xl transition-opacity duration-500 ${isActive ? 'opacity-60' : 'opacity-0'
                        }`} />

                      {/* Card Content */}
                      <div className="relative w-full h-full rounded-[3rem] bg-slate-900 overflow-hidden">
                        {/* Image Background */}
                        {project.imageUrl && (
                          <div className="absolute inset-0">
                            <img
                              src={project.imageUrl}
                              alt={project.title}
                              className={`w-full h-full object-cover transition-transform duration-1000 opacity-80 ${isActive ? 'scale-110' : 'scale-100'
                                }`}
                            />
                            {/* Enhanced Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent transition-opacity duration-700 ${isActive ? 'opacity-90' : 'opacity-70'
                              }`} />
                          </div>
                        )}

                        {/* Text Content - HIGHLY VISIBLE */}
                        <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end">
                          <div
                            className={`transform transition-all duration-700 ${isActive
                              ? "translate-y-0 opacity-100"
                              : "translate-y-10 opacity-60"
                              }`}
                          >
                            {/* Project Number Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs md:text-sm font-black tracking-wider mb-4 md:mb-6 shadow-2xl">
                              <Code className="w-3 h-3 md:w-4 md:h-4" />
                              PROJECT #{idx + 1}
                            </div>

                            {/* Title - SUPER VISIBLE */}
                            <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-6 drop-shadow-2xl leading-tight">
                              {project.title}
                            </h3>

                            {/* Description - ENHANCED VISIBILITY */}
                            <p className="text-base md:text-xl lg:text-2xl text-white font-semibold leading-relaxed drop-shadow-2xl mb-4 md:mb-8 line-clamp-2 md:line-clamp-3">
                              {project.description}
                            </p>

                            {/* CTA Button - Only on Active Card */}
                            {isActive && (
                              <Link href="/projects">
                                <div className="inline-flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-base md:text-lg shadow-2xl hover:scale-110 hover:shadow-blue-500/50 transition-all duration-300 group">
                                  View Project
                                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                                </div>
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Shimmer Effect on Active Card */}
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-[100] w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-xl border-2 border-blue-400 text-blue-400 shadow-2xl hover:scale-110 hover:bg-blue-500 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 mx-auto" />
            </button>

            <button
              onClick={() => setActiveIndex(Math.min((projects?.length || 1) - 1, activeIndex + 1))}
              disabled={activeIndex === (projects?.length || 1) - 1}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-[100] w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-xl border-2 border-blue-400 text-blue-400 shadow-2xl hover:scale-110 hover:bg-blue-500 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 mx-auto" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-3 z-[100]">
              {projects?.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`rounded-full transition-all duration-300 ${idx === activeIndex
                    ? 'w-12 h-3 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/50'
                    : 'w-3 h-3 bg-gray-600 hover:bg-gray-500'
                    }`}
                />
              ))}
            </div>
          </div>

          {/* View All Projects Button */}
          <div className="text-center mt-20 md:mt-24 lg:mt-32">
            <Link href="/projects">
              <Button
                size="lg"
                className="group rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-base md:text-xl px-8 md:px-12 py-6 md:py-8 h-auto font-black shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300"
              >
                View All Projects
                <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="py-20 md:py-32 lg:py-40 px-4 md:px-8 relative overflow-hidden">
        {/* Dark Background Overlay for Readability */}
        <div className="absolute inset-0 bg-slate-950/80" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-6 md:mb-10">
              <Sparkles className="w-4 md:w-5 h-4 md:h-5 text-blue-400" />
              <span className="text-xs md:text-sm font-bold text-blue-300 tracking-wider uppercase">Join The Community</span>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black mb-6 md:mb-8 tracking-tight px-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">
                A space created to
              </span>
              <br />
              <span className="text-white">
                grow together and
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-x">
                share knowledge
              </span>
            </h2>

            <p className="text-base md:text-xl lg:text-2xl text-gray-300 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-4">
              I know there are countless diverse developers in IT field.{" "}
              <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                I hope everyone can share, exchange, and nurture their dreams together here.
              </span>
            </p>

            <div className="w-24 md:w-32 h-1.5 md:h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-12 md:mb-16" />

            {/* AI Tools Slider - PREMIUM */}
            <div className="mt-12 md:mt-16">
              <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                <p className="text-sm md:text-base bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 font-bold tracking-wider uppercase">
                  ⚡ Powered by Advanced AI
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
              </div>

              {/* Infinite Scroll Container */}
              <div className="relative overflow-hidden rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-white/10 py-4 md:py-6">
                {/* Gradient Overlays */}
                <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-10 pointer-events-none" />

                {/* Scrolling Track */}
                <div className="flex gap-6 md:gap-8 animate-scroll-left-fast">
                  {/* AI Tools */}
                  {[
                    { name: "ChatGPT", logo: "🤖", bg: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/50" },
                    { name: "Gemini", logo: "✨", bg: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/50" },
                    { name: "Claude", logo: "🎯", bg: "from-orange-500 to-red-600", shadow: "shadow-orange-500/50" },
                    { name: "Cursor", logo: "⚡", bg: "from-cyan-500 to-blue-600", shadow: "shadow-cyan-500/50" },
                    { name: "Copilot", logo: "🚀", bg: "from-indigo-500 to-purple-600", shadow: "shadow-indigo-500/50" },
                    { name: "BlackBox", logo: "⬛", bg: "from-gray-800 to-black", shadow: "shadow-gray-800/50" },
                    { name: "CodeGPT", logo: "💻", bg: "from-teal-500 to-cyan-600", shadow: "shadow-teal-500/50" },
                    { name: "GLM", logo: "🌟", bg: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/50" },
                    { name: "Manus", logo: "🎨", bg: "from-purple-500 to-pink-600", shadow: "shadow-purple-500/50" },
                    { name: "nanobananaPro", logo: "🍌", bg: "from-yellow-500 to-orange-600", shadow: "shadow-yellow-500/50" },
                  ].map((ai, i) => (
                    <div key={`ai-1-${i}`} className="flex-shrink-0 group">
                      <div
                        className={`relative w-36 md:w-44 lg:w-48 h-20 md:h-24 lg:h-28 rounded-2xl md:rounded-3xl bg-gradient-to-br ${ai.bg} flex flex-col items-center justify-center shadow-xl ${ai.shadow} hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 border-2 border-white/20 overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="text-3xl md:text-4xl lg:text-5xl mb-1 md:mb-2 filter drop-shadow-lg relative z-10">{ai.logo}</div>
                        <span className="text-white font-black text-xs md:text-sm lg:text-base tracking-wide relative z-10 drop-shadow-lg">{ai.name}</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                  ))}

                  {/* Duplicate for Seamless Loop */}
                  {[
                    { name: "ChatGPT", logo: "🤖", bg: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/50" },
                    { name: "Gemini", logo: "✨", bg: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/50" },
                    { name: "Claude", logo: "🎯", bg: "from-orange-500 to-red-600", shadow: "shadow-orange-500/50" },
                    { name: "Cursor", logo: "⚡", bg: "from-cyan-500 to-blue-600", shadow: "shadow-cyan-500/50" },
                    { name: "Copilot", logo: "🚀", bg: "from-indigo-500 to-purple-600", shadow: "shadow-indigo-500/50" },
                    { name: "BlackBox", logo: "⬛", bg: "from-gray-800 to-black", shadow: "shadow-gray-800/50" },
                    { name: "CodeGPT", logo: "💻", bg: "from-teal-500 to-cyan-600", shadow: "shadow-teal-500/50" },
                    { name: "GLM", logo: "🌟", bg: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/50" },
                    { name: "Manus", logo: "🎨", bg: "from-purple-500 to-pink-600", shadow: "shadow-purple-500/50" },
                    { name: "nanobananaPro", logo: "🍌", bg: "from-yellow-500 to-orange-600", shadow: "shadow-yellow-500/50" },
                  ].map((ai, i) => (
                    <div key={`ai-2-${i}`} className="flex-shrink-0 group">
                      <div
                        className={`relative w-36 md:w-44 lg:w-48 h-20 md:h-24 lg:h-28 rounded-2xl md:rounded-3xl bg-gradient-to-br ${ai.bg} flex flex-col items-center justify-center shadow-xl ${ai.shadow} hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 border-2 border-white/20 overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="text-3xl md:text-4xl lg:text-5xl mb-1 md:mb-2 filter drop-shadow-lg relative z-10">{ai.logo}</div>
                        <span className="text-white font-black text-xs md:text-sm lg:text-base tracking-wide relative z-10 drop-shadow-lg">{ai.name}</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Premium Animations */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-draw {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: draw 2s ease forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
        .animate-scroll-left-fast {
          animation: scroll-left 20s linear infinite;
        }
        .animate-scroll-left-fast:hover {
          animation-play-state: paused;
        }
        .perspective-2000 {
          perspective: 2000px;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
