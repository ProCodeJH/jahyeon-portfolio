import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Code, Zap, Sparkles, CircuitBoard, Layers, GraduationCap } from "lucide-react";
import { GradientMeshBackground } from "@/components/backgrounds/GradientMeshBackground";
import { SubtleDots } from "@/components/backgrounds/SubtleDots";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();

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
                  <span className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-all cursor-pointer relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative pt-32 px-8">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <AnimatedSection>
                <p className="text-lg text-purple-600 mb-6 font-medium">
                  Embedded Engineer & Coding Instructor
                </p>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <h1 className="text-[clamp(3rem,8vw,6rem)] font-bold leading-[0.95] mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900">
                  Creating<br />
                  the Future
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={400}>
                <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-lg">
                  I build embedded systems that bring products to life and teach the next generation of developers.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={600}>
                <div className="flex gap-4">
                  <Link href="/projects">
                    <Button
                      size="lg"
                      className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 h-14 text-base hover:scale-105 transition-all shadow-lg shadow-purple-500/30"
                    >
                      View Work <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection delay={400}>
              <TiltCard>
                <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 p-12 flex items-center justify-center shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop"
                    alt="Technology"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </TiltCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-32 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <h2 className="text-5xl font-bold mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
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
                color: "from-purple-500 to-pink-500",
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
                icon: GraduationCap,
                title: "Coding Education",
                desc: "Teaching programming, mentoring developers",
                color: "from-emerald-500 to-teal-500",
                img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop&q=80"
              }
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <TiltCard>
                  <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-purple-300 transition-all shadow-lg hover:shadow-2xl h-[400px]">
                    <div className="absolute inset-0">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-80 group-hover:opacity-90 transition-opacity`} />
                    </div>
                    <div className="relative h-full p-6 flex flex-col justify-end">
                      <item.icon className="w-10 h-10 text-white mb-4 drop-shadow-lg" />
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{item.title}</h3>
                      <p className="text-white/90 text-sm drop-shadow">{item.desc}</p>
                    </div>
                  </div>
                </TiltCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="py-32 px-8 bg-gradient-to-br from-purple-50 to-blue-50 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <h2 className="text-5xl font-bold mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Professional Journey
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { year: "2025", company: "Coding Academy", role: "Coding Instructor", icon: GraduationCap, current: true },
              { year: "~2024.11", company: "SHL Co., Ltd.", role: "Logistics Systems (Hankook Tire Partner)", icon: Layers, current: false },
              { year: "2023-24", company: "LG Electronics", role: "Senior Research Engineer", icon: CircuitBoard, current: false },
              { year: "2022", company: "Nordground", role: "Data Analysis & Optimization", icon: Sparkles, current: false },
            ].map((exp, idx) => {
              const Icon = exp.icon;
              return (
                <AnimatedSection key={idx} delay={idx * 100}>
                  <TiltCard sensitivity={5}>
                    <div className={`p-8 rounded-2xl bg-white border-2 ${exp.current ? 'border-purple-400' : 'border-gray-200'} hover:border-purple-400 transition-all shadow-lg hover:shadow-2xl`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exp.current ? 'from-purple-500 to-blue-500' : 'from-gray-400 to-gray-500'} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-purple-600 text-sm font-mono font-semibold">{exp.year}</p>
                            {exp.current && (
                              <span className="px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{exp.company}</h3>
                          <p className="text-gray-600">{exp.role}</p>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="py-32 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-16">
              <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">Featured Work</h2>
              <Link href="/projects">
                <Button variant="outline" size="lg" className="rounded-full border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white text-base px-8 shadow-lg">
                  View All <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {projects?.slice(0, 3).map((project, idx) => (
              <AnimatedSection key={project.id} delay={idx * 150}>
                <Link href={`/projects`}>
                  <TiltCard>
                    <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-purple-300 transition-all shadow-lg hover:shadow-2xl aspect-square">
                      {project.imageUrl && (
                        <>
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-purple-900/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                        </>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{project.title}</h3>
                        <p className="text-white/90 text-sm line-clamp-2 drop-shadow">{project.description}</p>
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-8 bg-gradient-to-br from-purple-50 to-blue-50 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <h2 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
              Let's Work Together
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Creating innovative embedded solutions and inspiring the next generation of developers.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/about">
                <Button size="lg" className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 h-16 text-base hover:scale-105 transition-all shadow-xl shadow-purple-500/30">
                  Get in Touch
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-2 border-gray-900 text-gray-900 px-10 h-16 text-base hover:bg-gray-900 hover:text-white transition-all"
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
