import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Code, Zap, Sparkles, CircuitBoard, Layers, GraduationCap, Play } from "lucide-react";
import { GradientMeshBackground } from "@/components/backgrounds/GradientMeshBackground";
import { SubtleDots } from "@/components/backgrounds/SubtleDots";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();

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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-200/50 shadow-lg shadow-purple-500/5">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="group cursor-pointer">
                <span className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 group-hover:scale-110 transition-all duration-300 inline-block">
                  JH
                </span>
                <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500 rounded-full" />
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-10">
              {["Work", "About"].map(item => (
                <Link key={item} href={item === "Work" ? "/projects" : `/${item.toLowerCase()}`}>
                  <span className="group text-base font-semibold text-gray-700 hover:text-purple-600 transition-all cursor-pointer relative">
                    {item}
                    <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all duration-300 rounded-full" />
                    <span className="absolute inset-0 bg-purple-100 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* GOD-TIER Hero Section */}
      <section className="min-h-screen flex items-center relative pt-32 px-8">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            {/* Left: Premium Typography */}
            <div className="space-y-8">
              <AnimatedSection>
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 backdrop-blur-xl">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse" />
                  <p className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 tracking-wide">
                    Embedded Engineer & Coding Instructor
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={150}>
                <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[1.1] tracking-tight">
                  <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 animate-gradient-x">
                    Thinking of ideas
                  </span>
                  <br />
                  <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x mt-2">
                    that help the world,
                  </span>
                  <br />
                  <span className="inline-block text-gray-900 mt-2 relative">
                    creating, growing
                    <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 12" fill="none">
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
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-xl font-light">
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
                    className="group relative rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-10 h-16 text-lg font-bold overflow-hidden shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-500"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center gap-3">
                      View Work
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
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
                    {/* Placeholder for 5-second video */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-3xl opacity-50 animate-pulse" />
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                          <Play className="w-12 h-12 text-white ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* TODO: Replace with video when ready */}
                    {/* <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                      <source src="/hero-video.mp4" type="video/mp4" />
                    </video> */}

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

      {/* ULTRA-PREMIUM Expertise Section */}
      <section className="py-40 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 backdrop-blur-xl mb-6">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-bold text-purple-600 tracking-wider uppercase">Core Expertise</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x">
                  Expertise
                </span>
              </h2>
              <div className="w-32 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto" />
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: CircuitBoard,
                title: "Embedded Systems",
                desc: "MCU programming, RTOS, firmware optimization",
                color: "from-blue-500 to-cyan-500",
                iconBg: "from-blue-500/20 to-cyan-500/20",
                img: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&h=400&fit=crop&q=80"
              },
              {
                icon: Code,
                title: "Software Development",
                desc: "Python, Java, C/C++, Full-stack",
                color: "from-purple-500 to-pink-500",
                iconBg: "from-purple-500/20 to-pink-500/20",
                img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop&q=80"
              },
              {
                icon: Zap,
                title: "IoT Solutions",
                desc: "Connected devices, sensors, automation",
                color: "from-orange-500 to-yellow-500",
                iconBg: "from-orange-500/20 to-yellow-500/20",
                img: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&h=400&fit=crop&q=80"
              },
              {
                icon: GraduationCap,
                title: "Coding Education",
                desc: "Teaching programming, mentoring developers",
                color: "from-emerald-500 to-teal-500",
                iconBg: "from-emerald-500/20 to-teal-500/20",
                img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop&q=80"
              }
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <TiltCard sensitivity={12}>
                  <div className="group relative overflow-hidden rounded-3xl bg-white border-2 border-gray-100 hover:border-purple-200 transition-all shadow-xl hover:shadow-2xl h-[450px]">
                    {/* Premium Image Background */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-85 group-hover:opacity-90 transition-opacity duration-500`} />

                      {/* Animated Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full p-8 flex flex-col justify-between">
                      {/* Icon with Premium Background */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.iconBg} backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <item.icon className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>

                      {/* Text */}
                      <div>
                        <h3 className="text-2xl font-black text-white mb-3 drop-shadow-lg group-hover:translate-x-2 transition-transform duration-300">
                          {item.title}
                        </h3>
                        <p className="text-white/95 text-sm leading-relaxed drop-shadow">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Premium Border Glow */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${item.color} rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 -z-10`} />
                  </div>
                </TiltCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM Professional Journey */}
      <section className="py-40 px-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 backdrop-blur-xl mb-6">
                <Layers className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-bold text-purple-600 tracking-wider uppercase">Career Path</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x">
                  Professional Journey
                </span>
              </h2>
              <div className="w-32 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto" />
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                    <div className={`group relative p-8 rounded-3xl bg-white border-2 ${
                      exp.current
                        ? 'border-purple-300 shadow-2xl shadow-purple-500/20'
                        : 'border-gray-100 shadow-xl'
                    } hover:border-purple-300 hover:shadow-2xl transition-all duration-500 overflow-hidden`}>
                      {/* Premium Background Effect */}
                      {exp.current && (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
                      )}

                      <div className="relative flex items-start gap-6">
                        {/* Premium Icon */}
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                          exp.current
                            ? 'from-purple-500 to-blue-500'
                            : 'from-gray-400 to-gray-500'
                        } flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 flex-shrink-0`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <p className={`text-sm font-black font-mono tracking-wider ${
                              exp.current ? 'text-purple-600' : 'text-gray-500'
                            }`}>
                              {exp.year}
                            </p>
                            {exp.current && (
                              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-black tracking-wider shadow-lg">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                            {exp.company}
                          </h3>
                          <p className="text-gray-600 font-medium mb-1">{exp.role}</p>
                          {exp.subtitle && (
                            <p className="text-sm text-purple-600 font-semibold mb-1">{exp.subtitle}</p>
                          )}
                          {exp.position && (
                            <p className="text-sm text-gray-500 italic">Position: {exp.position}</p>
                          )}
                        </div>
                      </div>

                      {/* Premium Border Glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10" />
                    </div>
                  </TiltCard>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ULTRA-PREMIUM Featured Work */}
      <section className="py-40 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-20">
              <div>
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 backdrop-blur-xl mb-6">
                  <Code className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-bold text-purple-600 tracking-wider uppercase">Portfolio</span>
                </div>
                <h2 className="text-6xl md:text-7xl font-black tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x">
                    Featured Work
                  </span>
                </h2>
              </div>
              <Link href="/projects">
                <Button
                  variant="outline"
                  size="lg"
                  className="hidden md:flex group rounded-2xl border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white text-base px-8 h-14 font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  View All
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-10">
            {projects?.slice(0, 3).map((project, idx) => (
              <AnimatedSection key={project.id} delay={idx * 150}>
                <Link href={`/projects`}>
                  <TiltCard>
                    <div className="group relative overflow-hidden rounded-3xl bg-white border-2 border-gray-100 hover:border-purple-200 transition-all shadow-xl hover:shadow-2xl aspect-[4/5]">
                      {project.imageUrl && (
                        <>
                          <div className="absolute inset-0">
                            <img
                              src={project.imageUrl}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all duration-500" />
                          </div>
                        </>
                      )}

                      {/* Content Overlay */}
                      <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <h3 className="text-3xl font-black text-white mb-3 drop-shadow-lg">
                            {project.title}
                          </h3>
                          <p className="text-white/90 text-base line-clamp-3 drop-shadow leading-relaxed mb-4">
                            {project.description}
                          </p>

                          {/* Premium CTA */}
                          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-bold">
                              View Project
                            </span>
                            <ArrowRight className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Premium Border Glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 -z-10" />
                    </div>
                  </TiltCard>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM Footer CTA */}
      <section className="py-40 px-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 backdrop-blur-xl mb-10">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-bold text-purple-600 tracking-wider uppercase">Join The Community</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
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

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              I know there are countless diverse developers in the IT field.{" "}
              <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                I hope everyone can share, exchange, and nurture their dreams together here.
              </span>
            </p>

            <div className="w-32 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto" />
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
