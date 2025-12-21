import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Github, Loader2, Eye, Code, Cpu, Terminal, Play, X, ArrowUpRight, ArrowLeft } from "lucide-react";
import { GradientMeshBackground } from "@/components/backgrounds/GradientMeshBackground";
import { SubtleDots } from "@/components/backgrounds/SubtleDots";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

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
                  <span className={`text-sm font-medium transition-all cursor-pointer relative group ${
                    item === "Work" ? "text-purple-600" : "text-gray-600 hover:text-purple-600"
                  }`}>
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all" />
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
              <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors mb-8 group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-lg">Back to Home</span>
              </button>
            </Link>
            <p className="text-xl text-purple-600 mb-6 font-medium">Portfolio</p>
            <h1 className="text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.95] mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900">
              Work.
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl leading-relaxed">
              A collection of embedded systems, firmware development, and IoT solutions
              that bridge the gap between hardware and software.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 sticky top-24 z-40 bg-white/60 backdrop-blur-xl border-y border-gray-200/50">
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
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-lg shadow-purple-500/30"
                        : "bg-white text-gray-600 border-gray-200 hover:border-purple-400 hover:text-purple-600 hover:shadow-md"
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
              <p className="text-gray-500 text-lg">Loading projects...</p>
            </div>
          ) : !filteredProjects?.length ? (
            <div className="text-center py-32">
              <Code className="w-20 h-20 text-gray-200 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-2 text-gray-900">No projects found</h3>
              <p className="text-gray-500">Try selecting a different category</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => {
                const technologies = parseTechnologies(project.technologies);
                const categoryColor = getCategoryColor(project.category);

                return (
                  <AnimatedSection key={project.id} delay={index * 80}>
                    <TiltCard>
                      <div
                        className="group relative rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-purple-300 transition-all hover:shadow-2xl cursor-pointer"
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
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-purple-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                              <Code className="w-16 h-16 text-gray-300" />
                            </div>
                          )}

                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <span
                              className="px-4 py-2 rounded-full text-xs font-bold uppercase backdrop-blur-xl border-2 shadow-lg bg-white/90"
                              style={{
                                color: categoryColor,
                                borderColor: categoryColor,
                              }}
                            >
                              {project.category.replace('_', ' ')}
                            </span>
                          </div>

                          {/* View Count */}
                          <div className="absolute top-4 right-4">
                            <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur-xl text-gray-700 text-xs font-semibold border border-gray-200">
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
                                  <Button className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-110 transition-all h-11 px-5 font-semibold shadow-lg shadow-purple-500/30">
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
                                    className="rounded-full border-2 border-white bg-white/80 backdrop-blur-xl text-gray-900 hover:bg-white hover:scale-110 transition-all h-11 px-5 font-semibold"
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
                                    className="rounded-full border-2 border-blue-400 bg-white/80 backdrop-blur-xl text-blue-600 hover:bg-blue-50 hover:scale-110 transition-all h-11 w-11 p-0"
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
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-all pr-4">
                              {project.title}
                            </h3>
                            <ArrowUpRight className="w-6 h-6 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all flex-shrink-0" />
                          </div>
                          <p className="text-gray-600 mb-5 line-clamp-2 leading-relaxed group-hover:text-gray-700 transition-colors">
                            {project.description}
                          </p>
                          {technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {technologies.slice(0, 4).map((tech, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all"
                                >
                                  {tech}
                                </span>
                              ))}
                              {technologies.length > 4 && (
                                <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs font-semibold border border-purple-300">
                                  +{technologies.length - 4} more
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
          className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-purple-200"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              )}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-110 transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center border-2 border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-12">
              <div className="mb-6">
                <span
                  className="inline-block px-4 py-2 rounded-full text-xs font-bold uppercase border-2 bg-purple-50"
                  style={{
                    color: getCategoryColor(selectedProject.category),
                    borderColor: getCategoryColor(selectedProject.category),
                  }}
                >
                  {selectedProject.category.replace('_', ' ')}
                </span>
              </div>

              <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-purple-900">
                {selectedProject.title}
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">{selectedProject.description}</p>

              {parseTechnologies(selectedProject.technologies).length > 0 && (
                <div className="mb-10">
                  <h3 className="text-sm font-bold uppercase text-purple-600 mb-4 tracking-wider">Technologies</h3>
                  <div className="flex flex-wrap gap-3">
                    {parseTechnologies(selectedProject.technologies).map((tech, i) => (
                      <span
                        key={i}
                        className="px-4 py-2.5 rounded-full bg-gray-100 text-gray-900 font-medium border border-gray-200 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white hover:border-transparent transition-all hover:scale-105"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                {selectedProject.projectUrl && (
                  <a href={selectedProject.projectUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-110 transition-all px-8 h-14 text-lg font-semibold shadow-xl shadow-purple-500/30">
                      <ExternalLink className="w-5 h-5 mr-2" />View Demo
                    </Button>
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full border-2 border-gray-300 text-gray-900 hover:bg-gray-100 hover:scale-110 transition-all px-8 h-14 text-lg font-semibold"
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
                      className="rounded-full border-2 border-blue-400 text-blue-600 hover:bg-blue-50 hover:scale-110 transition-all px-8 h-14 text-lg font-semibold"
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
