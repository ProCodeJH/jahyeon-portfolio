import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Github, Loader2, Eye, Code, Cpu, Terminal, Play, X, ArrowUpRight, ArrowLeft } from "lucide-react";

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
  { value: "all", label: "All Projects", icon: Code, color: "#000000" },
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
                  <span className={`text-lg font-medium transition-all cursor-pointer ${
                    item === "Work" ? "text-black" : "text-black/60 hover:text-black"
                  }`}>
                    {item}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-40 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <Link href="/">
              <button className="flex items-center gap-2 text-black/50 hover:text-black transition-colors mb-8 group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-lg">Back</span>
              </button>
            </Link>
            <p className="text-xl text-black/40 mb-6">Selected Projects</p>
            <h1 className="text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.95] mb-8">
              Work.
            </h1>
            <p className="text-2xl text-black/60 max-w-3xl">
              A collection of embedded systems, firmware development, and IoT solutions
              that showcase my expertise in hardware-software integration.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 sticky top-24 z-40 bg-white/90 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-8">
          <AnimatedSection delay={100}>
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => setActiveCategory(category.value)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-base font-medium transition-all border-2 ${
                      activeCategory === category.value
                        ? "bg-black text-white border-black"
                        : "bg-white text-black/60 border-black/20 hover:border-black/40 hover:text-black"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Projects Masonry Grid */}
      <section className="py-20 pb-32 px-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
              <p className="text-black/40 text-lg">Loading projects...</p>
            </div>
          ) : !filteredProjects?.length ? (
            <div className="text-center py-32">
              <Code className="w-20 h-20 text-black/10 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-2">No projects found</h3>
              <p className="text-black/40">Try selecting a different category</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => {
                const technologies = parseTechnologies(project.technologies);
                return (
                  <AnimatedSection key={project.id} delay={index * 80}>
                    <div
                      className="group relative rounded-2xl overflow-hidden bg-gray-50 border-2 border-black/10 hover:border-black/30 transition-all hover:shadow-2xl cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      {/* Image */}
                      <div className="aspect-[4/3] overflow-hidden relative bg-gradient-to-br from-purple-100 to-blue-100">
                        {project.imageUrl || project.thumbnailUrl ? (
                          <img
                            src={project.imageUrl || project.thumbnailUrl || ""}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Code className="w-16 h-16 text-black/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all" />

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span
                            className="px-4 py-2 rounded-full text-xs font-bold uppercase backdrop-blur-xl border-2"
                            style={{
                              backgroundColor: getCategoryColor(project.category) + "20",
                              color: getCategoryColor(project.category),
                              borderColor: getCategoryColor(project.category)
                            }}
                          >
                            {project.category.replace('_', ' ')}
                          </span>
                        </div>

                        {/* View Count */}
                        <div className="absolute top-4 right-4">
                          <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur-xl text-black/60 text-xs font-semibold">
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
                                <Button className="rounded-full bg-white text-black hover:bg-emerald-400 hover:text-white h-11 px-5 font-semibold">
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
                                  className="rounded-full border-2 border-white bg-black/30 backdrop-blur-xl text-white hover:bg-white hover:text-black h-11 px-5 font-semibold"
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
                                  className="rounded-full border-2 border-white bg-black/30 backdrop-blur-xl text-white hover:bg-emerald-400 hover:text-black h-11 w-11 p-0"
                                >
                                  <Play className="w-4 h-4 ml-0.5" />
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-2xl font-bold group-hover:text-purple-600 transition-colors pr-4">
                            {project.title}
                          </h3>
                          <ArrowUpRight className="w-6 h-6 text-black/20 group-hover:text-purple-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all flex-shrink-0" />
                        </div>
                        <p className="text-black/60 mb-5 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                        {technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {technologies.slice(0, 4).map((tech, i) => (
                              <span
                                key={i}
                                className="px-3 py-1.5 rounded-full bg-black/5 text-black/70 text-xs font-medium hover:bg-black/10 transition-all"
                              >
                                {tech}
                              </span>
                            ))}
                            {technologies.length > 4 && (
                              <span className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                                +{technologies.length - 4} more
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

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative">
              {(selectedProject.imageUrl || selectedProject.thumbnailUrl) && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={selectedProject.imageUrl || selectedProject.thumbnailUrl || ""}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white text-black hover:bg-black hover:text-white transition-all shadow-lg flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-12">
              <div className="mb-6">
                <span
                  className="inline-block px-4 py-2 rounded-full text-xs font-bold uppercase"
                  style={{
                    backgroundColor: getCategoryColor(selectedProject.category) + "20",
                    color: getCategoryColor(selectedProject.category)
                  }}
                >
                  {selectedProject.category.replace('_', ' ')}
                </span>
              </div>

              <h2 className="text-5xl font-bold mb-6">{selectedProject.title}</h2>
              <p className="text-xl text-black/70 mb-10 leading-relaxed">{selectedProject.description}</p>

              {parseTechnologies(selectedProject.technologies).length > 0 && (
                <div className="mb-10">
                  <h3 className="text-sm font-bold uppercase text-black/50 mb-4">Technologies</h3>
                  <div className="flex flex-wrap gap-3">
                    {parseTechnologies(selectedProject.technologies).map((tech, i) => (
                      <span
                        key={i}
                        className="px-4 py-2.5 rounded-full bg-black/5 text-black font-medium hover:bg-black hover:text-white transition-all"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t border-black/10">
                {selectedProject.projectUrl && (
                  <a href={selectedProject.projectUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="rounded-full bg-black text-white hover:bg-purple-600 px-8 h-14 text-lg font-semibold">
                      <ExternalLink className="w-5 h-5 mr-2" />View Demo
                    </Button>
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full border-2 border-black text-black hover:bg-black hover:text-white px-8 h-14 text-lg font-semibold"
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
                      className="rounded-full border-2 border-black text-black hover:bg-emerald-500 hover:text-white hover:border-emerald-500 px-8 h-14 text-lg font-semibold"
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
