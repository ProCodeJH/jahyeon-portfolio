import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Github, Loader2, Eye, Code, Cpu, Terminal, Filter, Play } from "lucide-react";

// Intersection Observer Hook
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
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
      style={{ transform: isInView ? "translateY(0)" : "translateY(40px)", opacity: isInView ? 1 : 0, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const PROJECT_CATEGORIES = [
  { value: "all", label: "All Projects", icon: Filter },
  { value: "c_lang", label: "C/C++", icon: Terminal },
  { value: "arduino", label: "Arduino", icon: Cpu },
  { value: "python", label: "Python", icon: Code },
];

export default function Projects() {
  const { data: projects, isLoading } = trpc.projects.list.useQuery();
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const filteredProjects = projects?.filter((project) => activeCategory === "all" || project.category === activeCategory);

  const parseTechnologies = (tech: string): string[] => {
    if (!tech) return [];
    return tech.split(',').map(t => t.trim()).filter(t => t.length > 0);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      c_lang: "bg-blue-500/20 text-blue-400",
      arduino: "bg-emerald-500/20 text-emerald-400",
      python: "bg-yellow-500/20 text-yellow-400",
      embedded: "bg-purple-500/20 text-purple-400",
      iot: "bg-cyan-500/20 text-cyan-400",
    };
    return colors[category] || "bg-white/10 text-white/60";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link href="/"><span className="text-xl font-light tracking-wider cursor-pointer hover:opacity-70 transition-opacity">JAHYEON<span className="text-emerald-400">.</span></span></Link>
            <div className="hidden md:flex items-center gap-12">
              {["About", "Projects", "Certifications", "Resources"].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`}>
                  <span className={`text-sm font-light transition-colors cursor-pointer tracking-wide ${item === "Projects" ? "text-white" : "text-white/60 hover:text-white"}`}>{item}</span>
                </Link>
              ))}
            </div>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-40 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <p className="text-emerald-400 font-mono text-sm tracking-widest mb-6">PORTFOLIO</p>
            <h1 className="text-4xl md:text-6xl font-light mb-6">Selected <span className="text-emerald-400">Projects</span></h1>
            <p className="text-white/50 text-xl max-w-2xl">A showcase of embedded systems projects, firmware development, and IoT solutions.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection delay={100}>
            <div className="flex flex-wrap gap-3">
              {PROJECT_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => setActiveCategory(category.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light transition-all ${activeCategory === category.value ? "bg-white text-black" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"}`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
              <p className="text-white/40">Loading projects...</p>
            </div>
          ) : !filteredProjects?.length ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Code className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-xl font-light mb-2">No projects found</h3>
              <p className="text-white/40">No projects in this category yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filteredProjects.map((project, index) => {
                const technologies = parseTechnologies(project.technologies);
                const isHovered = hoveredProject === project.id;

                return (
                  <AnimatedSection key={project.id} delay={index * 100}>
                    <div 
                      className="group relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500"
                      onMouseEnter={() => setHoveredProject(project.id)}
                      onMouseLeave={() => setHoveredProject(null)}
                    >
                      <div className="aspect-[16/10] overflow-hidden relative">
                        {project.imageUrl || project.thumbnailUrl ? (
                          <img src={project.imageUrl || project.thumbnailUrl || ""} alt={project.title} className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? "scale-110 blur-sm" : "scale-100"}`} />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center">
                            <Code className="w-16 h-16 text-white/10" />
                          </div>
                        )}

                        <div className={`absolute inset-0 bg-black/60 flex items-center justify-center gap-4 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                          {project.projectUrl && (
                            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
                              <ExternalLink className="w-5 h-5 text-black" />
                            </a>
                          )}
                          {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
                              <Github className="w-5 h-5 text-black" />
                            </a>
                          )}
                          {project.videoUrl && (
                            <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-emerald-400 flex items-center justify-center hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 text-black ml-0.5" />
                            </a>
                          )}
                        </div>

                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider ${getCategoryColor(project.category)}`}>{project.category.replace('_', ' ')}</span>
                        </div>

                        <div className="absolute top-4 right-4">
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white/60 text-xs">
                            <Eye className="w-3 h-3" />
                            {project.viewCount}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-medium mb-3 group-hover:text-emerald-400 transition-colors">{project.title}</h3>
                        <p className="text-white/40 text-sm mb-4 line-clamp-2">{project.description}</p>
                        {technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {technologies.slice(0, 4).map((tech, i) => (
                              <span key={i} className="px-2 py-1 rounded-md bg-white/5 text-white/50 text-xs">{tech}</span>
                            ))}
                            {technologies.length > 4 && <span className="px-2 py-1 rounded-md bg-white/5 text-white/30 text-xs">+{technologies.length - 4}</span>}
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

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center text-white/30 text-sm">
          © 2024 Gu Jahyeon. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
