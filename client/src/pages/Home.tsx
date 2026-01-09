import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Code, Zap, Sparkles, CircuitBoard, Layers, GraduationCap, Play, ChevronLeft, ChevronRight, Award, Loader2, ShieldCheck, Building } from "lucide-react";
import { GradientMeshBackground } from "@/components/backgrounds/GradientMeshBackground";
import { HeroVideoBackground } from "@/components/backgrounds/HeroVideoBackground";
import { ParticleBackground } from "@/components/backgrounds/ParticleBackground";
import { SubtleDots } from "@/components/backgrounds/SubtleDots";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Navigation } from "@/components/layout/Navigation";
import { TechnicalScopeSlider } from "@/components/sections/TechnicalScopeSlider";
import {
  OpenAILogo, GoogleGeminiLogo, AnthropicLogo, ClaudeLogo, GitHubLogo, MicrosoftLogo,
  MetaLogo, MistralLogo, VercelLogo, CursorLogo, CohereLogo, HuggingFaceLogo,
  PerplexityLogo, GrokLogo, AntigravityLogo, JulesLogo
} from "@/components/icons/AILogos";

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: certifications, isLoading: certificationsLoading } = trpc.certifications.list.useQuery();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d20] to-[#0a0a1a] text-white overflow-hidden">
      {/* 🌌 Premium Background with Particle Effects */}
      <div className="fixed inset-0">
        <GradientMeshBackground />
        <ParticleBackground />
        <SubtleDots />

        {/* Ambient Light Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Premium Navigation */}
      <Navigation />

      {/* 🎬 FIXED FULL-SCREEN VIDEO BACKGROUND */}
      <div className="fixed inset-0 w-screen h-screen z-0">
        <HeroVideoBackground videoSrc="/hero-video.mp4" />
      </div>

      {/* 🎬 CINEMATIC HERO SECTION - Ultra Premium Centered Layout */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden z-10">
        {/* Center-aligned Typography Container */}
        <div className="w-full px-6 md:px-12 lg:px-16 text-center">
          <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">

            {/* Badge */}
            <AnimatedSection>
              <div className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-300/50 backdrop-blur-2xl shadow-2xl">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse shadow-lg shadow-purple-500/50" />
                <p className="text-sm md:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 tracking-wide">
                  Embedded Engineer & Coding Instructor
                </p>
              </div>
            </AnimatedSection>

            {/* Main Headline - MASSIVE */}
            <AnimatedSection delay={150}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.95] tracking-[-0.03em]">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white animate-gradient-x mb-3 md:mb-4">
                  Thinking of ideas
                </span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 animate-gradient-x mb-3 md:mb-4">
                  that help the world,
                </span>
                <span className="block text-white relative inline-block">
                  creating, growing
                  {/* Animated underline */}
                  <svg className="absolute -bottom-4 md:-bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl" viewBox="0 0 600 20" fill="none">
                    <path d="M0 10 Q300 20, 600 10" stroke="url(#hero-gradient-center)" strokeWidth="6" strokeLinecap="round" className="animate-draw" />
                    <defs>
                      <linearGradient id="hero-gradient-center" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#9333ea" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
            </AnimatedSection>

            {/* Subtitle */}
            <AnimatedSection delay={300}>
              <p className="text-xl md:text-2xl lg:text-3xl xl:text-4xl text-gray-300 leading-relaxed font-light max-w-4xl mx-auto">
                Walking the path toward{" "}
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                  bigger dreams
                </span>
              </p>
            </AnimatedSection>

            {/* CTA Buttons */}
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
        </div>
      </section>

      {/* 🎯 EXPERTISE Section - Large Image Cards */}
      <section className="py-24 md:py-40 lg:py-48 px-4 md:px-8 relative overflow-hidden">
        {/* Neon Background Orbs */}
        <div className="absolute top-20 left-10 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 md:w-[500px] h-80 md:h-[500px] bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <AnimatedSection>
            <div className="text-center mb-16 md:mb-24">
              <div className="inline-flex items-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-xl mb-6 md:mb-8">
                <Sparkles className="w-5 md:w-6 h-5 md:h-6 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-sm md:text-base font-bold text-purple-400 tracking-wider uppercase">Core Expertise</span>
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 md:mb-8 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-gradient-x">
                  Expertise
                </span>
              </h2>
              <div className="w-32 md:w-48 h-2 md:h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full mx-auto" style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' }} />
            </div>
          </AnimatedSection>

          {/* 4 Large Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {[
              {
                icon: CircuitBoard,
                title: "Embedded Systems",
                desc: "MCU programming, RTOS development, firmware optimization, and hardware-software integration for IoT devices.",
                color: "from-cyan-500 to-blue-500",
                img: "/images/expertise/embedded-systems.jpg",
                tags: ['Arduino', 'STM32', 'ESP32', 'RTOS']
              },
              {
                icon: Code,
                title: "Software Development",
                desc: "Full-stack development with Python, Java, C/C++, and modern web technologies for scalable applications.",
                color: "from-purple-500 to-pink-500",
                img: "/images/expertise/software-development.jpg",
                tags: ['Python', 'Java', 'React', 'Node.js']
              },
              {
                icon: Zap,
                title: "IoT Solutions",
                desc: "Connected devices, smart sensors, automation systems, and cloud integration for intelligent networks.",
                color: "from-orange-500 to-yellow-500",
                img: "/images/expertise/iot-solutions.jpg",
                tags: ['MQTT', 'AWS IoT', 'Sensors', 'Edge']
              },
              {
                icon: GraduationCap,
                title: "Coding Education",
                desc: "Teaching programming fundamentals, mentoring next-gen developers, and creating comprehensive curricula.",
                color: "from-emerald-500 to-teal-500",
                img: "/images/expertise/coding-education.jpg",
                tags: ['Curriculum', 'Mentoring', '500+ Students']
              }
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div className="group relative rounded-3xl overflow-hidden cursor-pointer h-[450px] md:h-[550px] lg:h-[600px]">
                  {/* Glow Border */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.color} rounded-3xl opacity-0 group-hover:opacity-100 blur transition-all duration-500`} />

                  <div className="relative h-full bg-[#12121a] rounded-3xl border border-white/10 overflow-hidden group-hover:border-purple-500/50 transition-all duration-500">
                    {/* Background Image */}
                    <img
                      src={item.img}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-[#12121a]/60 to-transparent" />

                    {/* Content */}
                    <div className="relative h-full p-8 md:p-10 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${item.color}/30 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`} style={{ boxShadow: `0 0 40px rgba(168, 85, 247, 0.4)` }}>
                          <item.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 group-hover:translate-x-2 transition-transform duration-500">
                          {item.title}
                        </h3>
                        <p className="text-gray-300 text-base md:text-lg max-w-lg mb-6 group-hover:text-white transition-colors">
                          {item.desc}
                        </p>

                        {/* Tech Tags */}
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map(tag => (
                            <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/10 text-white/80 text-sm font-medium border border-white/10 group-hover:bg-white/20 transition-colors">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM Professional Journey */}
      <section className="py-24 md:py-40 lg:py-48 px-4 md:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16 md:mb-24">
              <div className="inline-flex items-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-xl mb-6 md:mb-8">
                <Layers className="w-5 md:w-6 h-5 md:h-6 text-purple-400" />
                <span className="text-sm md:text-base font-bold text-purple-400 tracking-wider uppercase">Career Path</span>
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 md:mb-8 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-gradient-x">
                  Professional Journey
                </span>
              </h2>
              <div className="w-32 md:w-48 h-2 md:h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full mx-auto" style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' }} />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-6xl mx-auto">
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
                    <div className={`group relative p-8 md:p-12 rounded-3xl bg-[#12121a] border-2 ${exp.current
                      ? 'border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.25)]'
                      : 'border-white/10'
                      } hover:border-purple-500/50 transition-all duration-500 overflow-hidden min-h-[200px] md:min-h-[250px]`}>
                      {/* Premium Background Effect */}
                      {exp.current && (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 to-cyan-600/15" />
                      )}

                      <div className="relative flex items-start gap-6 md:gap-8">
                        {/* Premium Icon */}
                        <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gradient-to-br ${exp.current
                          ? 'from-purple-500 to-cyan-500'
                          : 'from-gray-600 to-gray-700'
                          } flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 flex-shrink-0`} style={{ boxShadow: exp.current ? '0 0 40px rgba(168, 85, 247, 0.5)' : 'none' }}>
                          <Icon className="w-8 h-8 md:w-12 md:h-12 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-3 md:mb-4">
                            <p className={`text-base md:text-lg font-black font-mono tracking-wider ${exp.current ? 'text-purple-400' : 'text-gray-500'
                              }`}>
                              {exp.year}
                            </p>
                            {exp.current && (
                              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-black tracking-wider" style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)' }}>
                                CURRENT
                              </span>
                            )}
                          </div>
                          <h3 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-3 group-hover:text-purple-300 transition-colors">
                            {exp.company}
                          </h3>
                          <p className="text-lg md:text-xl text-gray-400 font-medium mb-2">{exp.role}</p>
                          {exp.subtitle && (
                            <p className="text-sm md:text-base text-purple-400 font-semibold mb-1">{exp.subtitle}</p>
                          )}
                          {exp.position && (
                            <p className="text-sm md:text-base text-gray-500 italic">Position: {exp.position}</p>
                          )}
                        </div>
                      </div>

                      {/* Premium Border Glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-3xl opacity-0 group-hover:opacity-25 blur-xl transition-opacity duration-500 -z-10" />
                    </div>
                  </TiltCard>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🔧 TECHNICAL EXPERTISE - 800+ Tech Stack Showcase */}
      <TechnicalScopeSlider />

      {/* 🏆 CERTIFICATIONS & CREDENTIALS */}
      <section className="py-24 md:py-40 lg:py-48 px-4 md:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-20 left-10 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-r from-purple-600/15 to-pink-600/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 md:w-[500px] h-80 md:h-[500px] bg-gradient-to-r from-cyan-500/15 to-blue-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection>
            <div className="text-center mb-16 md:mb-24">
              <div className="inline-flex items-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-xl mb-6 md:mb-8">
                <Award className="w-5 md:w-6 h-5 md:h-6 text-purple-400" />
                <span className="text-sm md:text-base font-bold text-purple-400 tracking-wider uppercase">Credentials</span>
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 md:mb-8 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-gradient-x">
                  Certifications
                </span>
              </h2>
              <div className="w-32 md:w-48 h-2 md:h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full mx-auto" style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' }} />
            </div>
          </AnimatedSection>

          {/* Certifications Auto-Scroll Animation - ALL VISIBLE */}
          {certificationsLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
              <p className="text-gray-400 text-lg">Loading credentials...</p>
            </div>
          ) : !certifications?.length ? (
            <div className="text-center py-16">
              <Award className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-400">No certifications yet</h3>
            </div>
          ) : (
            <div className="relative overflow-hidden">
              {/* Gradient Overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 lg:w-60 bg-gradient-to-r from-[#0a0a1a] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 lg:w-60 bg-gradient-to-l from-[#0a0a1a] to-transparent z-10 pointer-events-none" />

              {/* Infinite Auto-Scroll Track */}
              <div className="flex gap-8 md:gap-10 lg:gap-12 animate-scroll-left-certifications">
                {/* First Set */}
                {certifications.map((cert) => (
                  <div key={`cert-1-${cert.id}`} className="group flex-shrink-0 w-[380px] md:w-[480px] lg:w-[550px]">
                    <TiltCard sensitivity={6}>
                      <div className="rounded-3xl overflow-hidden bg-[#12121a] border border-white/10 hover:border-purple-500/50 transition-all duration-500 shadow-2xl hover:shadow-purple-500/30">
                        <div className="aspect-[16/10] overflow-hidden relative">
                          {cert.imageUrl ? (
                            <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-900/60 via-blue-900/60 to-pink-900/60 flex items-center justify-center">
                              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center" style={{ boxShadow: '0 0 60px rgba(168, 85, 247, 0.6)' }}>
                                <Award className="w-14 h-14 md:w-18 md:h-18 text-white" />
                              </div>
                            </div>
                          )}

                          {/* Verified Badge */}
                          <div className="absolute top-5 right-5">
                            <span className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl text-purple-300 text-base font-bold border border-white/20" style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}>
                              <ShieldCheck className="w-5 h-5" />Verified
                            </span>
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent opacity-70" />
                        </div>

                        <div className="p-8 md:p-10 relative">
                          {/* Certified Badge */}
                          <div className="absolute -top-5 left-8 md:left-10">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 blur-lg opacity-70"></div>
                              <div className="relative px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-base font-black tracking-wider uppercase" style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' }}>
                                🏆 Certified
                              </div>
                            </div>
                          </div>

                          <h3 className="text-2xl md:text-3xl font-black mb-5 mt-5 group-hover:text-purple-300 transition-colors line-clamp-2 text-white leading-tight">
                            {cert.title}
                          </h3>

                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center flex-shrink-0 border border-white/10">
                              <Building className="w-7 h-7 text-purple-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-base text-gray-500 font-medium">Issued by</p>
                              <p className="text-lg md:text-xl font-bold text-gray-300 line-clamp-1">{cert.issuer}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-5 border-t border-white/10">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></div>
                              <span className="text-base text-emerald-400 font-bold">Active</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  </div>
                ))}

                {/* Duplicate Set for Seamless Loop */}
                {certifications.map((cert) => (
                  <div key={`cert-2-${cert.id}`} className="group flex-shrink-0 w-[380px] md:w-[480px] lg:w-[550px]">
                    <TiltCard sensitivity={6}>
                      <div className="rounded-3xl overflow-hidden bg-[#12121a] border border-white/10 hover:border-purple-500/50 transition-all duration-500 shadow-2xl hover:shadow-purple-500/30">
                        <div className="aspect-[16/10] overflow-hidden relative">
                          {cert.imageUrl ? (
                            <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-900/60 via-blue-900/60 to-pink-900/60 flex items-center justify-center">
                              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center" style={{ boxShadow: '0 0 60px rgba(168, 85, 247, 0.6)' }}>
                                <Award className="w-14 h-14 md:w-18 md:h-18 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="absolute top-5 right-5">
                            <span className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl text-purple-300 text-base font-bold border border-white/20" style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}>
                              <ShieldCheck className="w-5 h-5" />Verified
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent opacity-70" />
                        </div>
                        <div className="p-8 md:p-10 relative">
                          <div className="absolute -top-5 left-8 md:left-10">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 blur-lg opacity-70"></div>
                              <div className="relative px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-base font-black tracking-wider uppercase" style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' }}>
                                🏆 Certified
                              </div>
                            </div>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-black mb-5 mt-5 group-hover:text-purple-300 transition-colors line-clamp-2 text-white leading-tight">
                            {cert.title}
                          </h3>
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center flex-shrink-0 border border-white/10">
                              <Building className="w-7 h-7 text-purple-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-base text-gray-500 font-medium">Issued by</p>
                              <p className="text-lg md:text-xl font-bold text-gray-300 line-clamp-1">{cert.issuer}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-5 border-t border-white/10">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></div>
                              <span className="text-base text-emerald-400 font-bold">Active</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  </div>
                ))}
              </div>

              {/* Count Indicator */}
              <div className="flex items-center justify-center gap-3 mt-10">
                <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-500/10 border border-purple-500/30">
                  <Award className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 font-bold text-lg">{certifications.length}</span>
                  <span className="text-gray-400">Professional Certifications</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 🎬 FULL-WIDTH CINEMATIC FEATURED WORK */}
      < section className="py-20 md:py-32 lg:py-40 relative overflow-hidden" >
        {/* Premium Background */}
        < div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-purple-50/30" />
        <div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-500/10 rounded-full blur-3xl" />

        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12 md:mb-16 lg:mb-20 relative z-10">
          <AnimatedSection>
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-[-0.02em] mb-4 md:mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 animate-gradient-x">
                  Featured Work
                </span>
              </h2>
              <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto font-medium">
                Scroll horizontally to explore my latest projects
              </p>
            </div>
          </AnimatedSection>
        </div>

        {/* Full-Width Horizontal Scroll Container */}
        <div className="relative">
          <div
            className="flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 md:px-8 lg:px-16 pb-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {projects?.slice(0, 8).map((project, idx) => (
              <AnimatedSection key={project.id} delay={idx * 100}>
                <div
                  className="group relative flex-shrink-0 w-[85vw] md:w-[70vw] lg:w-[50vw] xl:w-[40vw] snap-center"
                >
                  <TiltCard sensitivity={4}>
                    <div className="relative aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden bg-gray-900 shadow-2xl hover:shadow-purple-500/30 transition-all duration-700">
                      {/* Project Image */}
                      {project.imageUrl && (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                      {/* Content */}
                      <div className="absolute inset-0 p-6 md:p-8 lg:p-10 flex flex-col justify-end">
                        {/* Category Badge */}
                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                          <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs md:text-sm font-bold tracking-wider uppercase shadow-lg">
                            <Code className="w-3 h-3 md:w-4 md:h-4 inline mr-1.5" />
                            {project.category}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-xl text-white text-xs md:text-sm font-medium">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-2 md:mb-4 leading-tight group-hover:text-purple-200 transition-colors">
                          {project.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm md:text-lg text-white/80 font-medium leading-relaxed line-clamp-2 md:line-clamp-3 mb-4 md:mb-6">
                          {project.description}
                        </p>

                        {/* Technologies */}
                        {project.technologies && (
                          <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                            {project.technologies.split(',').slice(0, 4).map((tech, i) => (
                              <span
                                key={i}
                                className="px-2 md:px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xl text-white/90 text-xs md:text-sm font-medium border border-white/20"
                              >
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* CTA Button */}
                        <Link href="/projects">
                          <div className="inline-flex items-center gap-2 md:gap-3 px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-white text-purple-600 font-bold text-sm md:text-base shadow-2xl hover:scale-105 hover:shadow-purple-500/50 transition-all duration-300 group/btn w-fit">
                            View Details
                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      </div>

                      {/* Hover Shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </TiltCard>
                </div>
              </AnimatedSection>
            ))}

            {/* View All Card */}
            <div className="flex-shrink-0 w-[85vw] md:w-[70vw] lg:w-[50vw] xl:w-[40vw] snap-center">
              <Link href="/projects">
                <div className="relative aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 group cursor-pointer">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-10 h-10 md:w-14 md:h-14 text-white group-hover:translate-x-2 transition-transform" />
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-4">View All</h3>
                    <p className="text-lg md:text-xl text-white/80 font-medium">Explore the full portfolio</p>
                  </div>

                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </Link>
            </div>
          </div>

          {/* Scroll Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8 md:mt-12">
            <div className="flex items-center gap-1 text-gray-500 text-sm md:text-base">
              <ChevronLeft className="w-4 h-4" />
              <span className="font-medium">Scroll</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section >

      {/* PREMIUM Footer CTA */}
      <section className="py-24 md:py-40 lg:py-48 px-4 md:px-8 relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-80 md:w-[500px] h-80 md:h-[500px] bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 md:w-[500px] h-80 md:h-[500px] bg-cyan-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-xl mb-8 md:mb-12">
              <Sparkles className="w-5 md:w-6 h-5 md:h-6 text-purple-400" />
              <span className="text-sm md:text-base font-bold text-purple-400 tracking-wider uppercase">Join The Community</span>
            </div>

            <h2 className="text-4xl md:text-6xl lg:text-8xl font-black mb-8 md:mb-12 tracking-tight px-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-gradient-x">
                A space created to
              </span>
              <br />
              <span className="text-white">
                grow together and
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient-x">
                share knowledge
              </span>
            </h2>

            <p className="text-lg md:text-2xl lg:text-3xl text-gray-300 mb-10 md:mb-16 max-w-4xl mx-auto leading-relaxed font-light px-4">
              I know there are countless diverse developers in the IT field.{" "}
              <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                I hope everyone can share, exchange, and nurture their dreams together here.
              </span>
            </p>

            <div className="w-32 md:w-48 h-2 md:h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full mx-auto mb-16 md:mb-20" style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' }} />

            {/* AI Tools Slider - PREMIUM DARK */}
            <div className="mt-16 md:mt-20">
              <div className="flex items-center justify-center gap-4 mb-8 md:mb-10">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                <p className="text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 font-black tracking-wider uppercase">
                  ⚡ Powered by Advanced AI
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
              </div>

              {/* Infinite Scroll Container */}
              <div className="relative overflow-hidden rounded-3xl bg-[#12121a]/80 border border-white/10 backdrop-blur-sm py-6 md:py-8">
                {/* Gradient Overlays */}
                <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-[#0a0a1a] via-[#0a0a1a]/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-[#0a0a1a] via-[#0a0a1a]/80 to-transparent z-10 pointer-events-none" />

                {/* Scrolling Track */}
                <div className="flex gap-6 md:gap-8 animate-scroll-left-fast">
                  {/* First Set - OFFICIAL AI LOGOS with SVG Components */}
                  {[
                    { name: 'OpenAI', Logo: OpenAILogo, bg: 'from-[#10a37f] to-[#0d8c6d]', shadow: 'shadow-emerald-500/50' },
                    { name: 'Anthropic', Logo: AnthropicLogo, bg: 'from-[#1a1a1a] to-[#333333]', shadow: 'shadow-gray-800/50' },
                    { name: 'Claude', Logo: ClaudeLogo, bg: 'from-[#FF6B6B] to-[#3B82F6]', shadow: 'shadow-pink-500/50' },
                    { name: 'Gemini', Logo: GoogleGeminiLogo, bg: 'from-[#4285f4] to-[#34a853]', shadow: 'shadow-blue-500/50' },
                    { name: 'Antigravity', Logo: AntigravityLogo, bg: 'from-[#8b5cf6] to-[#06b6d4]', shadow: 'shadow-purple-500/50' },
                    { name: 'Jules', Logo: JulesLogo, bg: 'from-[#06b6d4] to-[#3b82f6]', shadow: 'shadow-cyan-500/50' },
                    { name: 'Cursor', Logo: CursorLogo, bg: 'from-[#7c3aed] to-[#5b21b6]', shadow: 'shadow-purple-500/50' },
                    { name: 'GitHub', Logo: GitHubLogo, bg: 'from-[#24292e] to-[#1b1f23]', shadow: 'shadow-gray-800/50' },
                    { name: 'Microsoft', Logo: MicrosoftLogo, bg: 'from-[#00a4ef] to-[#0078d4]', shadow: 'shadow-blue-500/50' },
                    { name: 'Meta', Logo: MetaLogo, bg: 'from-[#0668e1] to-[#0052bf]', shadow: 'shadow-blue-600/50' },
                    { name: 'Mistral', Logo: MistralLogo, bg: 'from-[#ff7000] to-[#ff5500]', shadow: 'shadow-orange-500/50' },
                    { name: 'Cohere', Logo: CohereLogo, bg: 'from-[#39594d] to-[#2a4239]', shadow: 'shadow-green-800/50' },
                    { name: 'Vercel', Logo: VercelLogo, bg: 'from-[#000] to-[#333]', shadow: 'shadow-gray-800/50' },
                    { name: 'Hugging Face', Logo: HuggingFaceLogo, bg: 'from-[#FFD21E] to-[#FFB800]', shadow: 'shadow-yellow-500/50' },
                    { name: 'Perplexity', Logo: PerplexityLogo, bg: 'from-[#20B2AA] to-[#008B8B]', shadow: 'shadow-teal-500/50' },
                    { name: 'Grok', Logo: GrokLogo, bg: 'from-[#1DA1F2] to-[#0d8ecf]', shadow: 'shadow-sky-500/50' },
                  ].map((ai, i) => (
                    <div key={`ai-1-${i}`} className="flex-shrink-0 group">
                      <div className={`relative w-40 md:w-48 lg:w-56 h-24 md:h-28 lg:h-32 rounded-2xl md:rounded-3xl bg-gradient-to-br ${ai.bg} flex flex-col items-center justify-center shadow-xl ${ai.shadow} hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 border-2 border-white/20 overflow-hidden`}>
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                        {/* SVG Logo */}
                        <div className="mb-1 md:mb-2 filter drop-shadow-lg relative z-10 text-white">
                          <ai.Logo className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" />
                        </div>

                        {/* Name */}
                        <span className="text-white font-black text-sm md:text-base lg:text-lg tracking-wide relative z-10 drop-shadow-lg">
                          {ai.name}
                        </span>

                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                  ))}

                  {/* Duplicate for Seamless Loop */}
                  {[
                    { name: 'OpenAI', Logo: OpenAILogo, bg: 'from-[#10a37f] to-[#0d8c6d]', shadow: 'shadow-emerald-500/50' },
                    { name: 'Anthropic', Logo: AnthropicLogo, bg: 'from-[#1a1a1a] to-[#333333]', shadow: 'shadow-gray-800/50' },
                    { name: 'Claude', Logo: ClaudeLogo, bg: 'from-[#FF6B6B] to-[#3B82F6]', shadow: 'shadow-pink-500/50' },
                    { name: 'Gemini', Logo: GoogleGeminiLogo, bg: 'from-[#4285f4] to-[#34a853]', shadow: 'shadow-blue-500/50' },
                    { name: 'Antigravity', Logo: AntigravityLogo, bg: 'from-[#8b5cf6] to-[#06b6d4]', shadow: 'shadow-purple-500/50' },
                    { name: 'Jules', Logo: JulesLogo, bg: 'from-[#06b6d4] to-[#3b82f6]', shadow: 'shadow-cyan-500/50' },
                    { name: 'Cursor', Logo: CursorLogo, bg: 'from-[#7c3aed] to-[#5b21b6]', shadow: 'shadow-purple-500/50' },
                    { name: 'GitHub', Logo: GitHubLogo, bg: 'from-[#24292e] to-[#1b1f23]', shadow: 'shadow-gray-800/50' },
                    { name: 'Microsoft', Logo: MicrosoftLogo, bg: 'from-[#00a4ef] to-[#0078d4]', shadow: 'shadow-blue-500/50' },
                    { name: 'Meta', Logo: MetaLogo, bg: 'from-[#0668e1] to-[#0052bf]', shadow: 'shadow-blue-600/50' },
                    { name: 'Mistral', Logo: MistralLogo, bg: 'from-[#ff7000] to-[#ff5500]', shadow: 'shadow-orange-500/50' },
                    { name: 'Cohere', Logo: CohereLogo, bg: 'from-[#39594d] to-[#2a4239]', shadow: 'shadow-green-800/50' },
                    { name: 'Vercel', Logo: VercelLogo, bg: 'from-[#000] to-[#333]', shadow: 'shadow-gray-800/50' },
                    { name: 'Hugging Face', Logo: HuggingFaceLogo, bg: 'from-[#FFD21E] to-[#FFB800]', shadow: 'shadow-yellow-500/50' },
                    { name: 'Perplexity', Logo: PerplexityLogo, bg: 'from-[#20B2AA] to-[#008B8B]', shadow: 'shadow-teal-500/50' },
                    { name: 'Grok', Logo: GrokLogo, bg: 'from-[#1DA1F2] to-[#0d8ecf]', shadow: 'shadow-sky-500/50' },
                  ].map((ai, i) => (
                    <div key={`ai-2-${i}`} className="flex-shrink-0 group">
                      <div className={`relative w-40 md:w-48 lg:w-56 h-24 md:h-28 lg:h-32 rounded-2xl md:rounded-3xl bg-gradient-to-br ${ai.bg} flex flex-col items-center justify-center shadow-xl ${ai.shadow} hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 border-2 border-white/20 overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="mb-1 md:mb-2 filter drop-shadow-lg relative z-10 text-white">
                          <ai.Logo className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" />
                        </div>
                        <span className="text-white font-black text-sm md:text-base lg:text-lg tracking-wide relative z-10 drop-shadow-lg">
                          {ai.name}
                        </span>
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
      < style > {`
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
        .animate-scroll-left-certifications {
          animation: scroll-left 60s linear infinite;
        }
        .animate-scroll-left-certifications:hover {
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
      `}</style >
    </div >
  );
}
