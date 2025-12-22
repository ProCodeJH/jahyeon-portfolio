import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Code, Zap, Sparkles, CircuitBoard, Layers, GraduationCap, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { GradientMeshBackground } from "@/components/backgrounds/GradientMeshBackground";
import { SubtleDots } from "@/components/backgrounds/SubtleDots";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Navigation } from "@/components/layout/Navigation";

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 text-gray-900 overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0">
        <GradientMeshBackground />
        <SubtleDots />

        {/* Ambient Light Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Premium Navigation */}
      <Navigation />

      {/* GOD-TIER Hero Section */}
      <section className="min-h-screen flex items-center relative pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-center">
            {/* Left: Premium Typography */}
            <div className="space-y-6 md:space-y-8">
              <AnimatedSection>
                <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 backdrop-blur-xl shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse" />
                  <p className="text-sm md:text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 tracking-wide">
                    Embedded Engineer & Coding Instructor
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={150}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight">
                  <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 animate-gradient-x drop-shadow-sm">
                    Thinking of ideas
                  </span>
                  <br />
                  <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x mt-2 drop-shadow-lg">
                    that help the world,
                  </span>
                  <br />
                  <span className="inline-block text-gray-900 mt-2 relative drop-shadow-sm">
                    creating, growing
                    <svg className="absolute -bottom-2 md:-bottom-3 left-0 w-full" viewBox="0 0 300 12" fill="none">
                      <path d="M0 6 Q150 12, 300 6" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" className="animate-draw" />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#9333ea" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <p className="text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-xl font-light">
                  Walking the path toward{" "}
                  <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    bigger dreams
                  </span>
                </p>
              </AnimatedSection>

              <AnimatedSection delay={450}>
                <Link href="/projects">
                  <Button
                    size="lg"
                    className="group relative rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-8 md:px-10 h-14 md:h-16 text-base md:text-lg font-bold overflow-hidden shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all duration-500"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center gap-2 md:gap-3">
                      View Work
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </Button>
                </Link>
              </AnimatedSection>
            </div>

            {/* Right: Premium Video Container */}
            <AnimatedSection delay={300}>
              <TiltCard sensitivity={8}>
                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-1 shadow-2xl shadow-purple-500/20 group">
                  {/* Premium Border Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-[2.5rem] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Video Container */}
                  <div className="relative w-full h-full rounded-[2.4rem] overflow-hidden bg-gradient-to-br from-purple-900/10 to-blue-900/10 backdrop-blur-xl">
                    {/* Hero Video */}
                    <video autoPlay loop muted playsInline preload="auto" className="w-full h-full object-cover">
                      <source src="/hero-video.mp4" type="video/mp4" />
                    </video>

                    {/* Premium Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-blue-900/20 opacity-60 group-hover:opacity-30 transition-opacity duration-500" />

                    {/* Animated Border Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[2.5rem] opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500" />
                  </div>

                  {/* Floating Particles */}
                  <div className="absolute top-10 left-10 w-3 h-3 rounded-full bg-purple-400 animate-float" />
                  <div className="absolute bottom-20 right-16 w-2 h-2 rounded-full bg-blue-400 animate-float delay-500" />
                  <div className="absolute top-32 right-12 w-2 h-2 rounded-full bg-pink-400 animate-float delay-1000" />
                </div>
              </TiltCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* GOD-TIER TRENDY Expertise Section */}
      <section className="py-20 md:py-32 lg:py-40 px-4 md:px-8 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-20 left-10 w-48 md:w-72 h-48 md:h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-20 right-10 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-48 md:w-64 h-48 md:h-64 bg-gradient-to-r from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection>
            <div className="text-center mb-12 md:mb-16 lg:mb-20">
              <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 backdrop-blur-xl mb-4 md:mb-6 shadow-lg">
                <Sparkles className="w-4 md:w-5 h-4 md:h-5 text-purple-600 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-xs md:text-sm font-bold text-purple-600 tracking-wider uppercase">Core Expertise</span>
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x">
                  Expertise
                </span>
              </h2>
              <div className="w-24 md:w-32 h-1.5 md:h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto shadow-lg shadow-purple-500/50" />
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
                delay: '0s'
              },
              {
                icon: Code,
                title: "Software Development",
                desc: "Python, Java, C/C++, Full-stack",
                color: "from-purple-500 to-pink-500",
                iconBg: "from-purple-500/30 to-pink-500/30",
                glowColor: "shadow-purple-500/50",
                img: "/images/expertise/software-development.jpg",
                delay: '0.5s'
              },
              {
                icon: Zap,
                title: "IoT Solutions",
                desc: "Connected devices, sensors, automation",
                color: "from-orange-500 to-yellow-500",
                iconBg: "from-orange-500/30 to-yellow-500/30",
                glowColor: "shadow-orange-500/50",
                img: "/images/expertise/iot-solutions.jpg",
                delay: '1s'
              },
              {
                icon: GraduationCap,
                title: "Coding Education",
                desc: "Teaching programming, mentoring developers",
                color: "from-emerald-500 to-teal-500",
                iconBg: "from-emerald-500/30 to-teal-500/30",
                glowColor: "shadow-emerald-500/50",
                img: "/images/expertise/coding-education.jpg",
                delay: '1.5s'
              }
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div
                  className="group relative animate-float cursor-pointer"
                  style={{ animationDelay: item.delay, animationDuration: '6s' }}
                >
                  {/* Rotating Border Animation */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500 animate-gradient-x" style={{ backgroundSize: '200% 200%' }} />

                  {/* Main Card */}
                  <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-white/80 backdrop-blur-2xl border-2 border-white/50 shadow-2xl hover:shadow-purple-500/30 transition-all duration-700 h-[400px] md:h-[450px] lg:h-[500px] group-hover:scale-[1.05] group-hover:-translate-y-3">

                    {/* Glassmorphism Background with Image */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
                      />

                      {/* Only gradient at bottom for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* Floating Particles */}
                    <div className="absolute top-10 right-10 w-2 h-2 rounded-full bg-white/60 animate-float" style={{ animationDelay: '0s', animationDuration: '3s' }} />
                    <div className="absolute top-20 right-20 w-3 h-3 rounded-full bg-white/40 animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }} />
                    <div className="absolute bottom-20 left-10 w-2 h-2 rounded-full bg-white/50 animate-float" style={{ animationDelay: '2s', animationDuration: '5s' }} />

                    {/* Content Container */}
                    <div className="relative h-full p-6 md:p-8 flex flex-col justify-between">

                      {/* Icon with 3D Effect */}
                      <div className="relative">
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-br ${item.iconBg} backdrop-blur-xl border-2 border-white/40 flex items-center justify-center shadow-2xl ${item.glowColor} group-hover:scale-125 group-hover:rotate-12 transition-all duration-700`}>
                          <item.icon className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                          {/* Icon Glow */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-50 blur-xl rounded-2xl md:rounded-3xl transition-opacity duration-500`} />
                        </div>

                        {/* Pulsing Ring */}
                        <div className={`absolute inset-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl border-2 border-white/30 group-hover:scale-150 group-hover:opacity-0 transition-all duration-700`} />
                      </div>

                      {/* Text Content with Enhanced Typography */}
                      <div className="space-y-2 md:space-y-3">
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-2 md:mb-3 drop-shadow-2xl group-hover:translate-x-3 group-hover:scale-105 transition-all duration-500 leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-white/95 text-sm md:text-base leading-relaxed drop-shadow-lg font-medium group-hover:translate-x-2 transition-transform duration-500">
                          {item.desc}
                        </p>

                        {/* Premium Indicator Bar */}
                        <div className="flex items-center gap-2 pt-2 md:pt-3 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                          <div className={`h-1 w-0 group-hover:w-12 md:group-hover:w-16 bg-gradient-to-r ${item.color} rounded-full transition-all duration-700 shadow-lg`} />
                          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200" />
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

      {/* PREMIUM Professional Journey */}
      <section className="py-20 md:py-32 lg:py-40 px-4 md:px-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12 md:mb-16 lg:mb-20">
              <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 backdrop-blur-xl mb-4 md:mb-6">
                <Layers className="w-4 md:w-5 h-4 md:h-5 text-purple-600" />
                <span className="text-xs md:text-sm font-bold text-purple-600 tracking-wider uppercase">Career Path</span>
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x">
                  Professional Journey
                </span>
              </h2>
              <div className="w-24 md:w-32 h-1.5 md:h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto" />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                year: "2025",
                company: "Coding Academy",
                role: "Coding Instructor",
                icon: GraduationCap,
                current: true
              },
              {
                year: "~2024.11",
                company: "SHL Co., Ltd.",
                role: "Logistics Systems (Hankook Tire Partner)",
                icon: Layers,
                current: false
              },
              {
                year: "2023-24",
                company: "LG Electronics",
                role: "Senior Research Engineer",
                icon: CircuitBoard,
                current: false
              },
              {
                year: "2022",
                company: "Nordground",
                role: "Data Analysis & Optimization",
                subtitle: "LG Electronics Partner Company",
                position: "Senior Research Engineer",
                icon: Sparkles,
                current: false
              },
            ].map((exp, idx) => {
              const Icon = exp.icon;
              return (
                <AnimatedSection key={idx} delay={idx * 100}>
                  <TiltCard sensitivity={6}>
                    <div className={`group relative p-5 md:p-8 rounded-2xl md:rounded-3xl bg-white border-2 ${
                      exp.current
                        ? 'border-purple-300 shadow-2xl shadow-purple-500/20'
                        : 'border-gray-100 shadow-xl'
                    } hover:border-purple-300 hover:shadow-2xl transition-all duration-500 overflow-hidden`}>
                      {/* Premium Background Effect */}
                      {exp.current && (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
                      )}

                      <div className="relative flex items-start gap-4 md:gap-6">
                        {/* Premium Icon */}
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${
                          exp.current
                            ? 'from-purple-500 to-blue-500'
                            : 'from-gray-400 to-gray-500'
                        } flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 flex-shrink-0`}>
                          <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <p className={`text-xs md:text-sm font-black font-mono tracking-wider ${
                              exp.current ? 'text-purple-600' : 'text-gray-500'
                            }`}>
                              {exp.year}
                            </p>
                            {exp.current && (
                              <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] md:text-xs font-black tracking-wider shadow-lg">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg md:text-2xl font-black text-gray-900 mb-1 md:mb-2 group-hover:text-purple-600 transition-colors">
                            {exp.company}
                          </h3>
                          <p className="text-sm md:text-base text-gray-600 font-medium mb-1">{exp.role}</p>
                          {exp.subtitle && (
                            <p className="text-xs md:text-sm text-purple-600 font-semibold mb-1">{exp.subtitle}</p>
                          )}
                          {exp.position && (
                            <p className="text-xs md:text-sm text-gray-500 italic">Position: {exp.position}</p>
                          )}
                        </div>
                      </div>

                      {/* Premium Border Glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10" />
                    </div>
                  </TiltCard>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* GOD-TIER 3D STACKED CARDS - Featured Work */}
      <section className="py-20 md:py-32 lg:py-40 px-4 md:px-8 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            {/* Premium Header - NO "Portfolio" */}
            <div className="text-center mb-12 md:mb-16 lg:mb-20">
              <h2 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tight mb-4 md:mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x">
                  Featured Work
                </span>
              </h2>
              <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto font-medium">
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
                    className={`absolute inset-0 transition-all duration-700 cursor-pointer ${
                      isPast ? 'pointer-events-none' : 'pointer-events-auto'
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
                      transformStyle: 'preserve-3d'
                    }}
                    onClick={() => {
                      if (isFuture) setActiveIndex(idx);
                    }}
                  >
                    {/* Card */}
                    <div className={`relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 ${
                      isActive ? 'shadow-purple-500/30 scale-100' : 'shadow-black/20'
                    }`}>

                      {/* Premium Gradient Border */}
                      <div className={`absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[3rem] blur-xl transition-opacity duration-500 ${
                        isActive ? 'opacity-60' : 'opacity-0'
                      }`} />

                      {/* Card Content */}
                      <div className="relative w-full h-full rounded-[3rem] bg-gray-900 overflow-hidden">

                        {/* Image Background */}
                        {project.imageUrl && (
                          <div className="absolute inset-0">
                            <img
                              src={project.imageUrl}
                              alt={project.title}
                              className={`w-full h-full object-cover transition-transform duration-1000 ${
                                isActive ? 'scale-110' : 'scale-100'
                              }`}
                            />
                            {/* Enhanced Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-700 ${
                              isActive ? 'opacity-90' : 'opacity-70'
                            }`} />
                          </div>
                        )}

                        {/* Text Content - HIGHLY VISIBLE */}
                        <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end">
                          <div className={`transform transition-all duration-700 ${
                            isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-60'
                          }`}>

                            {/* Project Number Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs md:text-sm font-black tracking-wider mb-4 md:mb-6 shadow-2xl">
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
                                <div className="inline-flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 rounded-full bg-white text-purple-600 font-black text-base md:text-lg shadow-2xl hover:scale-110 hover:shadow-purple-500/50 transition-all duration-300 group">
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
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-[100] w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90 backdrop-blur-xl border-2 border-purple-500 text-purple-600 shadow-2xl hover:scale-110 hover:bg-purple-500 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 mx-auto" />
            </button>

            <button
              onClick={() => setActiveIndex(Math.min((projects?.length || 1) - 1, activeIndex + 1))}
              disabled={activeIndex === (projects?.length || 1) - 1}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-[100] w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90 backdrop-blur-xl border-2 border-purple-500 text-purple-600 shadow-2xl hover:scale-110 hover:bg-purple-500 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 mx-auto" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-3 z-[100]">
              {projects?.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? 'w-12 h-3 bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50'
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
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
                className="group rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white text-base md:text-xl px-8 md:px-12 py-6 md:py-8 h-auto font-black shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300"
              >
                View All Projects
                <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* PREMIUM Footer CTA */}
      <section className="py-20 md:py-32 lg:py-40 px-4 md:px-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 backdrop-blur-xl mb-6 md:mb-10">
              <Sparkles className="w-4 md:w-5 h-4 md:h-5 text-purple-600" />
              <span className="text-xs md:text-sm font-bold text-purple-600 tracking-wider uppercase">Join The Community</span>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black mb-6 md:mb-8 tracking-tight px-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x">
                A space created to
              </span>
              <br />
              <span className="text-gray-900">
                grow together and
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
                share knowledge
              </span>
            </h2>

            <p className="text-base md:text-xl lg:text-2xl text-gray-600 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-4">
              I know there are countless diverse developers in the IT field.{" "}
              <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                I hope everyone can share, exchange, and nurture their dreams together here.
              </span>
            </p>

            <div className="w-24 md:w-32 h-1.5 md:h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto" />
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
