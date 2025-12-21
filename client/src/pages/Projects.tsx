import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Github, Loader2, Eye, Code, Cpu, Terminal, Play, X, ArrowUpRight, ArrowLeft } from "lucide-react";

// 🌌 COSMIC BACKGROUND
function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Star {
      x: number;
      y: number;
      z: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.z = Math.random() * 1000;
        this.size = Math.random() * 2;
      }

      update() {
        this.z -= 1.5;
        if (this.z <= 0) {
          this.z = 1000;
          this.x = Math.random() * canvas!.width;
          this.y = Math.random() * canvas!.height;
        }
      }

      draw() {
        if (!ctx || !canvas) return;
        const x = (this.x - canvas.width / 2) * (1000 / this.z) + canvas.width / 2;
        const y = (this.y - canvas.height / 2) * (1000 / this.z) + canvas.height / 2;
        const size = this.size * (1000 / this.z);

        const hue = 200 + (this.z / 1000) * 60;
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${1 - this.z / 1000})`;
        ctx.fillRect(x, y, size, size);
      }
    }

    const stars: Star[] = Array.from({ length: 400 }, () => new Star());

    function animate() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.update();
        star.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

// 💫 FLOATING PARTICLES
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
            background: `hsl(${i * 12}, 80%, 60%)`,
            boxShadow: `0 0 10px hsl(${i * 12}, 80%, 60%)`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          33% { transform: translate(30px, -50px) scale(1.5); opacity: 0.8; }
          66% { transform: translate(-30px, -100px) scale(0.8); opacity: 0.5; }
        }
        .animate-float { animation: float linear infinite; }
      `}</style>
    </div>
  );
}

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
      className={`transition-all duration-700 ease-out ${className}`}
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

const CATEGORIES = [
  { value: "all", label: "All Projects", icon: Code, color: "#a855f7" },
  { value: "c_lang", label: "C/C++", icon: Terminal, color: "#3B82F6" },
  { value: "arduino", label: "Arduino", icon: Cpu, color: "#10B981" },
  { value: "python", label: "Python", icon: Code, color: "#F59E0B" },
  { value: "embedded", label: "Embedded", icon: Cpu, color: "#8B5CF6" },
  { value: "iot", label: "IoT", icon: Cpu, color: "#06B6D4" },
];

export default function Projects() {
  const { data: projects, isLoading } = trpc.projects.list.useQuery();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const filteredProjects = projects?.filter(p => activeCategory === "all" || p.category === activeCategory);
  const parseTechnologies = (tech: string): string[] => tech ? tech.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];
  const getCategoryColor = (category: string) => CATEGORIES.find(c => c.value === category)?.color || "#6B7280";

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black">
        <CosmicBackground />
        <FloatingParticles />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 hover:scale-110 transition-transform cursor-pointer">
                JH
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-12">
              {["Work", "About"].map(item => (
                <Link key={item} href={item === "Work" ? "/projects" : `/${item.toLowerCase()}`}>
                  <span className={`text-lg font-medium transition-all cursor-pointer relative group ${
                    item === "Work" ? "text-white" : "text-white/60 hover:text-white"
                  }`}>
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 group-hover:w-full transition-all" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-40 pb-20 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <Link href="/">
              <button className="flex items-center gap-2 text-purple-300/60 hover:text-purple-300 transition-colors mb-8 group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-lg">Back to Home</span>
              </button>
            </Link>
            <p className="text-xl text-purple-300/60 mb-6">Portfolio</p>
            <h1 className="text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.95] mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200">
              Work.
            </h1>
            <p className="text-2xl text-white/60 max-w-3xl leading-relaxed">
              A collection of embedded systems, firmware development, and IoT solutions
              that bridge the gap between hardware and software.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 sticky top-24 z-40 bg-black/60 backdrop-blur-2xl border-y border-white/10">
        <div className="max-w-7xl mx-auto px-8">
          <AnimatedSection delay={100}>
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => setActiveCategory(category.value)}
                    className={`group flex items-center gap-2 px-6 py-3 rounded-full text-base font-medium transition-all border-2 ${
                      activeCategory === category.value
                        ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-transparent shadow-lg shadow-purple-500/50"
                        : "bg-white/5 text-white/60 border-white/10 hover:border-purple-500/50 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {category.label}
                    {activeCategory === category.value && (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 pb-32 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
              <p className="text-white/40 text-lg">Loading projects...</p>
            </div>
          ) : !filteredProjects?.length ? (
            <div className="text-center py-32">
              <Code className="w-20 h-20 text-white/10 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-2">No projects found</h3>
              <p className="text-white/40">Try selecting a different category</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => {
                const technologies = parseTechnologies(project.technologies);
                const categoryColor = getCategoryColor(project.category);

                return (
                  <AnimatedSection key={project.id} delay={index * 80}>
                    <div
                      className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border-2 border-white/10 hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-500/50 cursor-pointer hover:scale-105"
                      onClick={() => setSelectedProject(project)}
                      style={{ perspective: '1000px' }}
                    >
                      {/* 3D Image Container */}
                      <div className="aspect-[4/3] overflow-hidden relative">
                        {project.imageUrl || project.thumbnailUrl ? (
                          <>
                            <img
                              src={project.imageUrl || project.thumbnailUrl || ""}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-900/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-cyan-900/30 flex items-center justify-center">
                            <Code className="w-16 h-16 text-white/20" />
                          </div>
                        )}

                        {/* Holographic Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-cyan-500/0 group-hover:from-purple-500/20 group-hover:via-pink-500/10 group-hover:to-cyan-500/20 transition-all duration-500" />

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span
                            className="px-4 py-2 rounded-full text-xs font-bold uppercase backdrop-blur-xl border-2 shadow-lg"
                            style={{
                              backgroundColor: categoryColor + "30",
                              color: categoryColor,
                              borderColor: categoryColor,
                              boxShadow: `0 0 20px ${categoryColor}50`,
                            }}
                          >
                            {project.category.replace('_', ' ')}
                          </span>
                        </div>

                        {/* View Count */}
                        <div className="absolute top-4 right-4">
                          <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 backdrop-blur-xl text-white/80 text-xs font-semibold border border-white/20">
                            <Eye className="w-3 h-3" />{project.viewCount}
                          </span>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                          <div className="flex gap-3">
                            {project.projectUrl && (
                              <a
                                href={project.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                              >
                                <Button className="rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:scale-110 transition-all h-11 px-5 font-semibold shadow-lg shadow-purple-500/50">
                                  <ExternalLink className="w-4 h-4 mr-2" />Demo
                                </Button>
                              </a>
                            )}
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                              >
                                <Button
                                  variant="outline"
                                  className="rounded-full border-2 border-white/50 bg-black/30 backdrop-blur-xl text-white hover:bg-white hover:text-black hover:scale-110 transition-all h-11 px-5 font-semibold"
                                >
                                  <Github className="w-4 h-4 mr-2" />Code
                                </Button>
                              </a>
                            )}
                            {project.videoUrl && (
                              <a
                                href={project.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                              >
                                <Button
                                  variant="outline"
                                  className="rounded-full border-2 border-cyan-400/50 bg-black/30 backdrop-blur-xl text-cyan-400 hover:bg-cyan-400 hover:text-black hover:scale-110 transition-all h-11 w-11 p-0"
                                >
                                  <Play className="w-4 h-4 ml-0.5" />
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 relative">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all pr-4">
                            {project.title}
                          </h3>
                          <ArrowUpRight className="w-6 h-6 text-white/20 group-hover:text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all flex-shrink-0" />
                        </div>
                        <p className="text-white/60 mb-5 line-clamp-2 leading-relaxed group-hover:text-white/80 transition-colors">
                          {project.description}
                        </p>
                        {technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {technologies.slice(0, 4).map((tech, i) => (
                              <span
                                key={i}
                                className="px-3 py-1.5 rounded-full bg-white/5 text-white/70 text-xs font-medium border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all"
                              >
                                {tech}
                              </span>
                            ))}
                            {technologies.length > 4 && (
                              <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/50">
                                +{technologies.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Holographic Border Effect */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-20 blur-xl" />
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-purple-500/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative">
              {(selectedProject.imageUrl || selectedProject.thumbnailUrl) && (
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={selectedProject.imageUrl || selectedProject.thumbnailUrl || ""}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
              )}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:scale-110 transition-all shadow-lg shadow-purple-500/50 flex items-center justify-center border-2 border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-12">
              <div className="mb-6">
                <span
                  className="inline-block px-4 py-2 rounded-full text-xs font-bold uppercase border-2"
                  style={{
                    backgroundColor: getCategoryColor(selectedProject.category) + "20",
                    color: getCategoryColor(selectedProject.category),
                    borderColor: getCategoryColor(selectedProject.category),
                  }}
                >
                  {selectedProject.category.replace('_', ' ')}
                </span>
              </div>

              <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                {selectedProject.title}
              </h2>
              <p className="text-xl text-white/70 mb-10 leading-relaxed">{selectedProject.description}</p>

              {parseTechnologies(selectedProject.technologies).length > 0 && (
                <div className="mb-10">
                  <h3 className="text-sm font-bold uppercase text-purple-300 mb-4 tracking-wider">Technologies</h3>
                  <div className="flex flex-wrap gap-3">
                    {parseTechnologies(selectedProject.technologies).map((tech, i) => (
                      <span
                        key={i}
                        className="px-4 py-2.5 rounded-full bg-white/5 text-white font-medium border border-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-cyan-600 hover:border-transparent transition-all hover:scale-105"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t border-white/10">
                {selectedProject.projectUrl && (
                  <a href={selectedProject.projectUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:scale-110 transition-all px-8 h-14 text-lg font-semibold shadow-xl shadow-purple-500/50">
                      <ExternalLink className="w-5 h-5 mr-2" />View Demo
                    </Button>
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full border-2 border-white/50 text-white hover:bg-white hover:text-black hover:scale-110 transition-all px-8 h-14 text-lg font-semibold"
                    >
                      <Github className="w-5 h-5 mr-2" />Source Code
                    </Button>
                  </a>
                )}
                {selectedProject.videoUrl && (
                  <a href={selectedProject.videoUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:scale-110 transition-all px-8 h-14 text-lg font-semibold"
                    >
                      <Play className="w-5 h-5 mr-2" />Watch Video
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
