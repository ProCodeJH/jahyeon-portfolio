import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Cpu, Code, Zap, Sparkles, Award, Briefcase, Terminal, CircuitBoard, Layers } from "lucide-react";

// 3D Holographic Blob Component
function HolographicBlob() {
  return (
    <div className="relative w-[400px] h-[400px] animate-blob">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full blur-3xl opacity-70 animate-pulse" />
      <div className="absolute inset-8 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-80 animate-spin-slow" />
      <div className="absolute inset-16 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full blur-xl opacity-90" />
      <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-cyan-400 rounded-full blur-xl opacity-60 animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-purple-500 rounded-full blur-2xl opacity-50 animate-float" style={{animationDelay: '1s'}} />
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-pink-400 rounded-full blur-lg opacity-70 animate-float" style={{animationDelay: '0.5s'}} />
      <style>{`
        @keyframes blob { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.1) rotate(180deg); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.2); } }
        .animate-blob { animation: blob 20s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// Utility Hook
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

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isInView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${className}`}
      style={{
        transform: isInView ? "translateY(0)" : "translateY(60px)",
        opacity: isInView ? 1 : 0,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-3xl font-bold tracking-tight hover:text-purple-600 transition-colors cursor-pointer">
                JH
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-12">
              {["Work", "About"].map(item => (
                <Link key={item} href={item === "Work" ? "/projects" : `/${item.toLowerCase()}`}>
                  <span className="text-lg font-medium text-black/60 hover:text-black transition-all cursor-pointer">
                    {item}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - "I'm many things" style */}
      <section className="min-h-screen flex items-center relative overflow-hidden pt-32 px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <AnimatedSection>
                <p className="text-xl text-black/40 mb-6">
                  Jahyeon is an Embedded Engineer based in South Korea.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <h1 className="text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.95] mb-12">
                  I'm many<br />
                  things.
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={400}>
                <div className="flex flex-wrap gap-3 mb-12">
                  {[
                    "#EmbeddedSystemsEngineer",
                    "#FirmwareDeveloper",
                    "#IoTSpecialist",
                    "#HardwareLover",
                    "#ArduinoExpert",
                    "#ProblemSolver",
                    "#CodeCrafter"
                  ].map(tag => (
                    <span key={tag} className="text-sm font-medium text-black/50 hover:text-purple-600 transition-colors cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={600}>
                <div className="flex gap-4">
                  <Link href="/projects">
                    <Button
                      size="lg"
                      className="rounded-full bg-black text-white px-8 h-14 text-lg hover:bg-purple-600 transition-all"
                    >
                      View Work <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection delay={400}>
              <div className="relative flex items-center justify-center">
                <HolographicBlob />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Expertise Section - Professional Cards */}
      <section className="py-32 px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <h2 className="text-6xl font-bold mb-20">
              Expertise
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: CircuitBoard,
                title: "Embedded Systems",
                desc: "MCU programming, RTOS, firmware optimization",
                color: "from-blue-500 to-cyan-500",
                img: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&h=400&fit=crop&q=80"
              },
              {
                icon: Code,
                title: "Software Development",
                desc: "Python, Java, C/C++, Full-stack",
                color: "from-emerald-500 to-teal-500",
                img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop&q=80"
              },
              {
                icon: Zap,
                title: "IoT Solutions",
                desc: "Connected devices, sensors, automation",
                color: "from-orange-500 to-yellow-500",
                img: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&h=400&fit=crop&q=80"
              },
              {
                icon: Layers,
                title: "System Integration",
                desc: "Hardware-software integration, optimization",
                color: "from-purple-500 to-pink-500",
                img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop&q=80"
              }
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div className="group relative overflow-hidden rounded-2xl bg-white border border-black/10 hover:border-black/30 transition-all hover:shadow-2xl cursor-pointer h-[400px]">
                  <div className="absolute inset-0">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-60 group-hover:opacity-80 transition-opacity`} />
                  </div>
                  <div className="relative h-full p-8 flex flex-col justify-end">
                    <item.icon className="w-12 h-12 text-white mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-white/80 text-sm">{item.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Experience - Color Block Layout */}
      <section className="min-h-screen flex">
        <div className="flex-1 bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 p-20 flex items-center justify-center">
          <AnimatedSection>
            <div className="max-w-xl">
              <h2 className="text-7xl font-bold text-white mb-12">
                Professional<br />Journey
              </h2>
              <p className="text-2xl text-white/90 font-light leading-relaxed">
                Crafting innovative embedded solutions across multiple industries,
                from consumer electronics to industrial automation.
              </p>
            </div>
          </AnimatedSection>
        </div>

        <div className="flex-1 bg-black p-20 flex items-center justify-center">
          <AnimatedSection delay={300}>
            <div className="max-w-xl space-y-12">
              {[
                { year: "2025", company: "SHL Co., Ltd.", role: "Logistics Management Systems", current: true },
                { year: "2023-24", company: "LG Electronics", role: "Senior Research Engineer", current: false },
                { year: "2022", company: "Nordground", role: "Data Analysis & Optimization", current: false },
                { year: "2021-22", company: "UHS Co., Ltd.", role: "Embedded Systems Developer", current: false }
              ].map((exp, idx) => (
                <div key={idx} className="border-l-4 border-emerald-400 pl-8 py-4">
                  {exp.current && (
                    <span className="inline-block px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold mb-3">
                      Current
                    </span>
                  )}
                  <p className="text-white/50 text-sm mb-2">{exp.year}</p>
                  <h3 className="text-2xl font-bold text-white mb-1">{exp.company}</h3>
                  <p className="text-white/70">{exp.role}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Projects Showcase - Collage Style */}
      <section className="py-32 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-20">
              <h2 className="text-6xl font-bold">Featured Work</h2>
              <Link href="/projects">
                <Button variant="outline" size="lg" className="rounded-full border-2 border-black hover:bg-black hover:text-white text-lg px-8">
                  View All Projects <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {projects?.slice(0, 3).map((project, idx) => (
              <AnimatedSection key={project.id} delay={idx * 150}>
                <Link href={`/projects`}>
                  <div className="group relative overflow-hidden rounded-2xl bg-gray-100 hover:shadow-2xl transition-all cursor-pointer aspect-square">
                    {project.imageUrl && (
                      <>
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                      <p className="text-white/80 line-clamp-2">{project.description}</p>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-7xl font-bold mb-8">Let's Chat!</h2>
            <p className="text-2xl text-white/60 mb-12 max-w-2xl mx-auto">
              Passionate about creating innovative embedded solutions that bridge hardware and software.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/about">
                <Button size="lg" className="rounded-full bg-white text-black px-10 h-16 text-lg hover:bg-emerald-400 hover:text-white transition-all">
                  Get in Touch
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-2 border-white text-white px-10 h-16 text-lg hover:bg-white hover:text-black transition-all"
                >
                  View Portfolio
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
