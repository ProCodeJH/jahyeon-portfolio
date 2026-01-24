import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Github, Loader2, Eye, Code, Play, X, ArrowUpRight, ArrowLeft, Layers } from "lucide-react";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Navigation } from "@/components/layout/Navigation";

export default function Projects() {
  const { data: projects, isLoading } = trpc.projects.list.useQuery();
  const [activeTag, setActiveTag] = useState("all");
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // 🎯 동적 태그 추출 - 모든 프로젝트의 기술 스택에서 태그 추출
  const parseTechnologies = (tech: string): string[] =>
    tech ? tech.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];

  const allTags = projects ? Array.from(new Set(
    projects.flatMap(p => parseTechnologies(p.technologies))
  )).sort() : [];

  const filteredProjects = activeTag === "all"
    ? projects
    : projects?.filter(p => parseTechnologies(p.technologies).includes(activeTag));

  // 🎨 태그별 색상 생성
  const getTagColor = (tag: string) => {
    const colors = ['#00FF88', '#22D3EE', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981'];
    const hash = tag.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="min-h-screen bg-midnight text-frost overflow-hidden">
      {/* 🌊 MIDNIGHT NEON BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight via-midnight-card to-midnight" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-electric/10 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-indigo/15 rounded-full blur-[150px]" style={{ animation: 'pulse 4s ease-in-out infinite alternate' }} />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[120px]" style={{ animation: 'pulse 3s ease-in-out infinite alternate-reverse' }} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <section className="pt-32 md:pt-36 lg:pt-40 pb-12 md:pb-16 lg:pb-20 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <Link href="/">
              <button className="flex items-center gap-2 text-frost-muted hover:text-electric transition-colors mb-6 md:mb-8 group">
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-[family-name:var(--font-mono)] text-base md:text-lg">Back to Home</span>
              </button>
            </Link>

            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-electric/10 via-accent-cyan/10 to-accent-indigo/10 border border-electric/30 backdrop-blur-xl mb-8 shadow-[0_0_60px_rgba(0,255,136,0.2)]">
              <Layers className="w-5 h-5 text-electric" />
              <span className="font-[family-name:var(--font-mono)] text-sm text-frost tracking-wider uppercase">Portfolio</span>
              <div className="h-4 w-px bg-frost/20" />
              <span className="font-[family-name:var(--font-mono)] text-xs text-electric">{projects?.length || 0} Projects</span>
            </div>

            <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.95] mb-6 md:mb-8" style={{ textShadow: '0 0 80px rgba(0,255,136,0.4)' }}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric via-accent-cyan to-electric">
                Work.
              </span>
            </h1>
            <p className="font-[family-name:var(--font-body)] text-lg md:text-xl lg:text-2xl text-frost-muted max-w-3xl leading-relaxed">
              Embedded systems, IoT solutions, and software development projects
              that push the boundaries of innovation.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* 🏷️ DYNAMIC TAG FILTER - 태그 기반 필터링 */}
      <section className="py-4 md:py-6 lg:py-8 sticky top-16 md:top-20 lg:top-24 z-40 bg-midnight/90 backdrop-blur-xl border-y border-electric/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <AnimatedSection delay={100}>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {/* All Projects 버튼 */}
              <button
                onClick={() => setActiveTag("all")}
                className={`group flex items-center gap-1.5 md:gap-2 px-3 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 rounded-full font-[family-name:var(--font-mono)] text-xs md:text-sm lg:text-base font-medium transition-all border ${activeTag === "all"
                  ? "bg-electric text-midnight border-electric shadow-[0_0_30px_rgba(0,255,136,0.3)]"
                  : "bg-midnight-card/50 text-frost-muted border-midnight-border hover:border-electric/50 hover:text-electric"
                  }`}
              >
                <Code className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                <span>All Projects</span>
                {activeTag === "all" && (
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-midnight animate-pulse" />
                )}
              </button>

              {/* 동적 태그 버튼들 */}
              {allTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`group flex items-center gap-1.5 md:gap-2 px-3 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 rounded-full font-[family-name:var(--font-mono)] text-xs md:text-sm lg:text-base font-medium transition-all border ${activeTag === tag
                    ? "bg-electric text-midnight border-electric shadow-[0_0_30px_rgba(0,255,136,0.3)]"
                    : "bg-midnight-card/50 text-frost-muted border-midnight-border hover:border-electric/50 hover:text-electric"
                    }`}
                >
                  <span>{tag}</span>
                  {activeTag === tag && (
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-midnight animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 md:py-16 lg:py-20 pb-20 md:pb-24 lg:pb-32 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 animate-spin text-electric mb-4" />
              <p className="font-[family-name:var(--font-mono)] text-frost-muted text-lg">Loading projects...</p>
            </div>
          ) : !filteredProjects?.length ? (
            <div className="text-center py-32">
              <Code className="w-20 h-20 text-frost-muted/30 mx-auto mb-6" />
              <h3 className="font-[family-name:var(--font-heading)] text-3xl font-bold mb-2 text-frost">No projects found</h3>
              <p className="text-frost-muted">Try selecting a different tag</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
              {filteredProjects.map((project, index) => {
                const technologies = parseTechnologies(project.technologies);

                return (
                  <AnimatedSection key={project.id} delay={index * 80}>
                    <TiltCard>
                      <div
                        className="group relative rounded-xl md:rounded-2xl overflow-hidden bg-midnight-card border border-midnight-border hover:border-electric/50 transition-all hover:shadow-[0_0_40px_rgba(0,255,136,0.15)] cursor-pointer"
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
                              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-midnight-card to-midnight flex items-center justify-center">
                              <Code className="w-12 h-12 md:w-16 md:h-16 text-frost-muted/30" />
                            </div>
                          )}

                          {/* View Count */}
                          <div className="absolute top-3 md:top-4 right-3 md:right-4">
                            <span className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 rounded-full bg-midnight/90 backdrop-blur-xl text-frost text-[10px] md:text-xs font-[family-name:var(--font-mono)] font-semibold border border-electric/20">
                              <Eye className="w-3 h-3 text-electric" />{project.viewCount}
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
                                  <Button className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-110 transition-all h-9 md:h-11 px-3 md:px-5 text-xs md:text-sm font-semibold shadow-lg shadow-purple-500/30">
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
                                    className="rounded-full border-2 border-white bg-white/80 backdrop-blur-xl text-gray-900 hover:bg-white hover:scale-110 transition-all h-9 md:h-11 px-3 md:px-5 text-xs md:text-sm font-semibold"
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
                                    className="rounded-full border-2 border-blue-400 bg-white/80 backdrop-blur-xl text-blue-600 hover:bg-blue-50 hover:scale-110 transition-all h-9 w-9 md:h-11 md:w-11 p-0"
                                  >
                                    <Play className="w-3 h-3 md:w-4 md:h-4 ml-0.5" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 md:p-5 lg:p-6 relative">
                          <div className="flex items-start justify-between mb-2 md:mb-3">
                            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-all pr-3 md:pr-4">
                              {project.title}
                            </h3>
                            <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all flex-shrink-0" />
                          </div>
                          <p className="text-gray-600 mb-3 md:mb-4 lg:mb-5 line-clamp-2 leading-relaxed text-sm md:text-base group-hover:text-gray-700 transition-colors">
                            {project.description}
                          </p>
                          {technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                              {technologies.slice(0, 4).map((tech, i) => (
                                <span
                                  key={i}
                                  className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-gray-100 text-gray-700 text-[10px] md:text-xs font-medium border border-gray-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all"
                                >
                                  {tech}
                                </span>
                              ))}
                              {technologies.length > 4 && (
                                <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-[10px] md:text-xs font-semibold border border-purple-300">
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
          className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-white rounded-2xl md:rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-purple-200"
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
                className="absolute top-4 md:top-6 right-4 md:right-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-110 transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center border-2 border-white/20"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <div className="p-6 md:p-10 lg:p-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-purple-900">
                {selectedProject.title}
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 lg:mb-10 leading-relaxed">{selectedProject.description}</p>

              {parseTechnologies(selectedProject.technologies).length > 0 && (
                <div className="mb-6 md:mb-8 lg:mb-10">
                  <h3 className="text-xs md:text-sm font-bold uppercase text-purple-600 mb-3 md:mb-4 tracking-wider">Technologies</h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {parseTechnologies(selectedProject.technologies).map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 md:px-4 py-1.5 md:py-2.5 rounded-full bg-gray-100 text-gray-900 text-xs md:text-sm font-medium border border-gray-200 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white hover:border-transparent transition-all hover:scale-105"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6 border-t border-gray-200">
                {selectedProject.projectUrl && (
                  <a href={selectedProject.projectUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 transition-all px-6 md:px-8 h-12 md:h-14 text-base md:text-lg font-semibold shadow-xl shadow-purple-500/30">
                      <ExternalLink className="w-4 h-4 md:w-5 md:h-5 mr-2" />View Demo
                    </Button>
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto rounded-full border-2 border-gray-300 text-gray-900 hover:bg-gray-100 hover:scale-105 transition-all px-6 md:px-8 h-12 md:h-14 text-base md:text-lg font-semibold"
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
                      className="w-full sm:w-auto rounded-full border-2 border-blue-400 text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all px-6 md:px-8 h-12 md:h-14 text-base md:text-lg font-semibold"
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
