import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Github, Loader2, Eye, Code, Cpu, Terminal, Play, X, ArrowUpRight } from "lucide-react";

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
    <div ref={ref} className={`transition-all duration-700 ease-out ${className}`} style={{ transform: isInView ? "translateY(0)" : "translateY(60px)", opacity: isInView ? 1 : 0, transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const CATEGORIES = [
  { value: "all", label: "All", icon: Code },
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
  const [cursorVariant, setCursorVariant] = useState("default");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const filteredProjects = projects?.filter((p) => activeCategory === "all" || p.category === activeCategory);

  const parseTechnologies = (tech: string): string[] => {
    if (!tech) return [];
    return tech.split(',').map(t => t.trim()).filter(t => t.length > 0);
  };

  const getCategoryColor = (category: string) => CATEGORIES.find(c => c.value === category)?.color || "#6B7280";

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Custom Cursor */}
      <div 
        className="fixed w-4 h-4 bg-emerald-400 rounded-full pointer-events-none z-[100] mix-blend-difference transition-transform duration-100"
        style={{ left: mousePosition.x - 8, top: mousePosition.y - 8, transform: cursorVariant === "hover" ? "scale(3)" : "scale(1)" }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-6 lg:mx-12 mt-6">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] rounded-2xl px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/"><span className="text-2xl font-extralight tracking-[0.3em] cursor-pointer hover:text-emerald-400 transition-colors">JH</span></Link>
              <div className="hidden md:flex items-center gap-12">
                {["About", "Projects", "Certifications", "Resources"].map((item) => (
                  <Link key={item} href={`/${item.toLowerCase()}`}>
                    <span className={`text-sm font-light transition-all cursor-pointer tracking-wider ${item === "Projects" ? "text-white" : "text-white/50 hover:text-white"}`}>{item}</span>
                  </Link>
                ))}
              </div>
              <div className="w-16" />
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-40 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-6 uppercase">Portfolio</p>
            <h1 className="text-5xl md:text-7xl font-extralight mb-6">
              Selected <span className="text-emerald-400">Projects</span>
            </h1>
            <p className="text-white/40 text-xl max-w-2xl">
              A showcase of embedded systems, firmware development, and IoT solutions.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 sticky top-24 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection delay={100}>
            <div className="flex flex-wrap gap-3 p-2 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl inline-flex">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.value;
                return (
                  <button
                    key={category.value}
                    onClick={() => setActiveCategory(category.value)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-light transition-all duration-300 ${isActive ? "bg-white text-black" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                    onMouseEnter={() => setCursorVariant("hover")}
                    onMouseLeave={() => setCursorVariant("default")}
                  >
                    <Icon className="w-4 h-4" />
                    {category.label}
                    {category.value !== "all" && (
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                    )}
                  </button>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Projects Grid - Masonry Style */}
      <section className="py-12 pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
              <p className="text-white/40">Loading projects...</p>
            </div>
          ) : !filteredProjects?.length ? (
            <div className="text-center py-32">
              <div className="w-24 h-24 rounded-3xl bg-white/[0.02] flex items-center justify-center mx-auto mb-6">
                <Code className="w-12 h-12 text-white/10" />
              </div>
              <h3 className="text-2xl font-light mb-2">No projects found</h3>
              <p className="text-white/40">No projects in this category yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filteredProjects.map((project, index) => {
                const technologies = parseTechnologies(project.technologies);
                const isLarge = index % 3 === 0;

                return (
                  <AnimatedSection 
                    key={project.id} 
                    delay={index * 100}
                    className={isLarge ? "md:col-span-2" : ""}
                  >
                    <div 
                      className="group relative rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 transition-all duration-500 cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                      onMouseEnter={() => setCursorVariant("hover")}
                      onMouseLeave={() => setCursorVariant("default")}
                    >
                      <div className={`${isLarge ? "aspect-[21/9]" : "aspect-[16/10]"} overflow-hidden relative`}>
                        {project.imageUrl || project.thumbnailUrl ? (
                          <img 
                            src={project.imageUrl || project.thumbnailUrl || ""} 
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                            <Code className="w-20 h-20 text-white/10" />
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                        {/* Category Badge */}
                        <div className="absolute top-6 left-6">
                          <span 
                            className="px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider backdrop-blur-xl"
                            style={{ backgroundColor: getCategoryColor(project.category) + "30", color: getCategoryColor(project.category) }}
                          >
                            {project.category.replace('_', ' ')}
                          </span>
                        </div>

                        {/* View count */}
                        <div className="absolute top-6 right-6">
                          <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/30 backdrop-blur-xl text-white/60 text-xs">
                            <Eye className="w-3 h-3" />
                            {project.viewCount}
                          </span>
                        </div>

                        {/* Hover content */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                          <div className="flex gap-4">
                            {project.projectUrl && (
                              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                                <Button className="rounded-full bg-white text-black hover:bg-emerald-400 h-12 px-6">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Live Demo
                                </Button>
                              </a>
                            )}
                            {project.githubUrl && (
                              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                                <Button variant="outline" className="rounded-full border-white/30 bg-black/30 backdrop-blur-xl text-white hover:bg-white hover:text-black h-12 px-6">
                                  <Github className="w-4 h-4 mr-2" />
                                  Code
                                </Button>
                              </a>
                            )}
                            {project.videoUrl && (
                              <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                                <Button variant="outline" className="rounded-full border-white/30 bg-black/30 backdrop-blur-xl text-white hover:bg-emerald-400 hover:text-black h-12 w-12 p-0">
                                  <Play className="w-4 h-4 ml-0.5" />
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-8">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-2xl font-light group-hover:text-emerald-400 transition-colors">{project.title}</h3>
                          <ArrowUpRight className="w-6 h-6 text-white/20 group-hover:text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </div>
                        <p className="text-white/40 mb-6 line-clamp-2">{project.description}</p>
                        
                        {technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {technologies.slice(0, 5).map((tech, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 text-white/50 text-xs hover:bg-white/10 hover:text-white transition-all">
                                {tech}
                              </span>
                            ))}
                            {technologies.length > 5 && (
                              <span className="px-3 py-1.5 rounded-full bg-white/5 text-white/30 text-xs">
                                +{technologies.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Project Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0a0a0a] border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 p-6 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
              <div>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider mb-2 inline-block"
                  style={{ backgroundColor: getCategoryColor(selectedProject.category) + "30", color: getCategoryColor(selectedProject.category) }}
                >
                  {selectedProject.category}
                </span>
                <h2 className="text-2xl font-light">{selectedProject.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Image */}
              {(selectedProject.imageUrl || selectedProject.thumbnailUrl) && (
                <div className="aspect-video rounded-2xl overflow-hidden mb-8">
                  <img 
                    src={selectedProject.imageUrl || selectedProject.thumbnailUrl} 
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Description */}
              <p className="text-white/60 text-lg leading-relaxed mb-8">{selectedProject.description}</p>

              {/* Technologies */}
              {parseTechnologies(selectedProject.technologies).length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-mono text-white/40 uppercase tracking-wider mb-4">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {parseTechnologies(selectedProject.technologies).map((tech, i) => (
                      <span key={i} className="px-4 py-2 rounded-full bg-white/5 text-white/70 text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-4">
                {selectedProject.projectUrl && (
                  <a href={selectedProject.projectUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-full bg-white text-black hover:bg-emerald-400 h-12 px-8">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Live Demo
                    </Button>
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="rounded-full border-white/20 h-12 px-8">
                      <Github className="w-4 h-4 mr-2" />
                      View Source
                    </Button>
                  </a>
                )}
                {selectedProject.videoUrl && (
                  <a href={selectedProject.videoUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="rounded-full border-white/20 h-12 px-8">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Video
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center text-white/20 text-sm">
          © 2024 Gu Jahyeon. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
