import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Github, Loader2, Eye, Code, Cpu, Terminal, Play, X, ArrowUpRight, ArrowLeft } from "lucide-react";
import { CleanBackground } from "@/components/3d/CleanBackground";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Navigation } from "@/components/layout/Navigation";

const CATEGORIES = [
  { value: "all", label: "All Projects", icon: Code, color: "#00ffff" },
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
    <div className="min-h-screen bg-[#050510] text-white overflow-hidden">
      {/* Clean Background with AI Robot */}
      <CleanBackground />

      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <section className="pt-32 md:pt-36 lg:pt-40 pb-12 md:pb-16 lg:pb-20 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <Link href="/">
              <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-6 md:mb-8 group">
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-base md:text-lg">Back to Home</span>
              </button>
            </Link>
            <p className="text-base md:text-xl text-cyan-400 mb-4 md:mb-6 font-medium">Portfolio</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] mb-6 md:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-blue-300">
              Work.
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl leading-relaxed">
              A collection of embedded systems, firmware development, and IoT solutions
              that bridge the gap between hardware and software.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter */}
      <section className="py-4 md:py-6 lg:py-8 sticky top-16 md:top-20 lg:top-24 z-40 bg-gray-900/60 backdrop-blur-xl border-y border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <AnimatedSection delay={100}>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => setActiveCategory(category.value)}
                    className={`group flex items-center gap-1.5 md:gap-2 px-3 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 rounded-full text-xs md:text-sm lg:text-base font-medium transition-all border-2 ${
                      activeCategory === category.value
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-transparent shadow-lg shadow-cyan-500/30"
                        : "bg-gray-800/80 text-gray-300 border-gray-700 hover:border-cyan-500/50 hover:text-cyan-400 hover:shadow-md"
                    }`}
                  >
                    <Icon className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                    <span className="hidden sm:inline">{category.label}</span>
                    <span className="sm:hidden">{category.label.split('/')[0]}</span>
                    {activeCategory === category.value && (
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 md:py-16 lg:py-20 pb-20 md:pb-24 lg:pb-32 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mb-4" />
              <p className="text-gray-400 text-lg">Loading projects...</p>
            </div>
          ) : !filteredProjects?.length ? (
            <div className="text-center py-32">
              <Code className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-2 text-white">No projects found</h3>
              <p className="text-gray-400">Try selecting a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
              {filteredProjects.map((project, index) => {
                const technologies = parseTechnologies(project.technologies);
                const categoryColor = getCategoryColor(project.category);

                return (
                  <AnimatedSection key={project.id} delay={index * 80}>
                    <TiltCard>
                      <div
                        className="group relative rounded-xl md:rounded-2xl overflow-hidden bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer"
                        onClick={() => setSelectedProject(project)}
                      >
                        {/* Image Container */}
                        <div className="aspect-[4/3] overflow-hidden relative">
                          {project.imageUrl || project.thumbnailUrl ? (
                            <>
                              <img
                                src={project.imageUrl || project.thumbnailUrl || ""}
                                alt={project.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-cyan-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cyan-900/50 to-blue-900/50 flex items-center justify-center">
                              <Code className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
                            </div>
                          )}

                          {/* Category Badge */}
                          <div className="absolute top-3 md:top-4 left-3 md:left-4">
                            <span
                              className="px-2.5 md:px-4 py-1 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase backdrop-blur-xl border-2 shadow-lg bg-black/50"
                              style={{
                                color: categoryColor,
                                borderColor: categoryColor,
                              }}
                            >
                              {project.category.replace('_', ' ')}
                            </span>
                          </div>

                          {/* View Count */}
                          <div className="absolute top-3 md:top-4 right-3 md:right-4">
                            <span className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 rounded-full bg-black/50 backdrop-blur-xl text-gray-300 text-[10px] md:text-xs font-semibold border border-gray-600/50">
                              <Eye className="w-3 h-3" />{project.viewCount}
                            </span>
                          </div>

                          {/* Hover Actions */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                            <div className="flex gap-2 md:gap-3">
                              {project.projectUrl && (
                                <a
                                  href={project.projectUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <Button className="rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:scale-110 transition-all h-9 md:h-11 px-3 md:px-5 text-xs md:text-sm font-semibold shadow-lg shadow-cyan-500/30">
                                    <ExternalLink className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />Demo
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
                                    className="rounded-full border-2 border-gray-500 bg-gray-900/80 backdrop-blur-xl text-white hover:bg-gray-800 hover:scale-110 transition-all h-9 md:h-11 px-3 md:px-5 text-xs md:text-sm font-semibold"
                                  >
                                    <Github className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />Code
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
                                    className="rounded-full border-2 border-blue-400 bg-gray-900/80 backdrop-blur-xl text-blue-400 hover:bg-blue-900/50 hover:scale-110 transition-all h-9 w-9 md:h-11 md:w-11 p-0"
                                  >
                                    <Play className="w-3 h-3 md:w-4 md:h-4 ml-0.5" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 md:p-5 lg:p-6 relative bg-gradient-to-br from-gray-900/90 via-gray-800/50 to-gray-900/90">
                          <div className="flex items-start justify-between mb-2 md:mb-3">
                            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white group-hover:text-cyan-400 transition-all pr-3 md:pr-4">
                              {project.title}
                            </h3>
                            <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all flex-shrink-0" />
                          </div>
                          <p className="text-gray-400 mb-3 md:mb-4 lg:mb-5 line-clamp-2 leading-relaxed text-sm md:text-base group-hover:text-gray-300 transition-colors">
                            {project.description}
                          </p>
                          {technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                              {technologies.slice(0, 4).map((tech, i) => (
                                <span
                                  key={i}
                                  className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-gray-800/80 text-gray-300 text-[10px] md:text-xs font-medium border border-gray-700 hover:bg-cyan-900/50 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                                >
                                  {tech}
                                </span>
                              ))}
                              {technologies.length > 4 && (
                                <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-cyan-900/50 to-blue-900/50 text-cyan-400 text-[10px] md:text-xs font-semibold border border-cyan-500/30">
                                  +{technologies.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TiltCard>
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
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-gray-900 rounded-2xl md:rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700/50"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
              )}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 md:top-6 right-4 md:right-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:scale-110 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center border-2 border-cyan-300/20"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <div className="p-6 md:p-10 lg:p-12">
              <div className="mb-4 md:mb-6">
                <span
                  className="inline-block px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase border-2 bg-gray-800/50"
                  style={{
                    color: getCategoryColor(selectedProject.category),
                    borderColor: getCategoryColor(selectedProject.category),
                  }}
                >
                  {selectedProject.category.replace('_', ' ')}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-blue-300">
                {selectedProject.title}
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 md:mb-8 lg:mb-10 leading-relaxed">{selectedProject.description}</p>

              {parseTechnologies(selectedProject.technologies).length > 0 && (
                <div className="mb-6 md:mb-8 lg:mb-10">
                  <h3 className="text-xs md:text-sm font-bold uppercase text-cyan-400 mb-3 md:mb-4 tracking-wider">Technologies</h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {parseTechnologies(selectedProject.technologies).map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 md:px-4 py-1.5 md:py-2.5 rounded-full bg-gray-800 text-white text-xs md:text-sm font-medium border border-gray-700 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:border-transparent transition-all hover:scale-105"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6 border-t border-gray-700/50">
                {selectedProject.projectUrl && (
                  <a href={selectedProject.projectUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:scale-105 transition-all px-6 md:px-8 h-12 md:h-14 text-base md:text-lg font-semibold shadow-xl shadow-cyan-500/30">
                      <ExternalLink className="w-4 h-4 md:w-5 md:h-5 mr-2" />View Demo
                    </Button>
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto rounded-full border-2 border-gray-600 text-white hover:bg-gray-800 hover:scale-105 transition-all px-6 md:px-8 h-12 md:h-14 text-base md:text-lg font-semibold"
                    >
                      <Github className="w-4 h-4 md:w-5 md:h-5 mr-2" />Source Code
                    </Button>
                  </a>
                )}
                {selectedProject.videoUrl && (
                  <a href={selectedProject.videoUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto rounded-full border-2 border-blue-400 text-blue-400 hover:bg-blue-900/50 hover:scale-105 transition-all px-6 md:px-8 h-12 md:h-14 text-base md:text-lg font-semibold"
                    >
                      <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />Watch Video
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
