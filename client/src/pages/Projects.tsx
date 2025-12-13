import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Github, Loader2, Star, Eye, Code, Cpu, Terminal, Filter } from "lucide-react";

const PROJECT_CATEGORIES = [
  { value: "all", label: "전체", icon: Filter },
  { value: "c_lang", label: "C언어", icon: Terminal, color: "#3B82F6" },
  { value: "arduino", label: "아두이노", icon: Cpu, color: "#10B981" },
  { value: "python", label: "파이썬", icon: Code, color: "#F59E0B" },
];

export default function Projects() {
  const { data: projects, isLoading } = trpc.projects.list.useQuery();
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProjects = projects?.filter((project) => {
    if (activeCategory === "all") return true;
    return project.category === activeCategory;
  });

  const getCategoryInfo = (category: string) => {
    return PROJECT_CATEGORIES.find(c => c.value === category) || PROJECT_CATEGORIES[0];
  };

  // technologies를 안전하게 배열로 변환
  const parseTechnologies = (tech: string): string[] => {
    if (!tech) return [];
    // 쉼표로 구분된 문자열을 배열로 변환
    return tech.split(',').map(t => t.trim()).filter(t => t.length > 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer">
                Gu Jahyeon
              </span>
            </Link>
            <div className="flex items-center gap-8">
              <Link href="/about">
                <span className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                  About
                </span>
              </Link>
              <Link href="/projects">
                <span className="text-sm font-medium text-blue-600 cursor-pointer">
                  Projects
                </span>
              </Link>
              <Link href="/certifications">
                <span className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                  Certifications
                </span>
              </Link>
              <Link href="/resources">
                <span className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                  Resources
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-purple-600 text-sm font-medium mb-4">
            <Code className="h-4 w-4" />
            포트폴리오
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Projects
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            IoT 솔루션부터 펌웨어 개발까지, 다양한 임베디드 시스템 프로젝트를 소개합니다.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
            {PROJECT_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setActiveCategory(category.value)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === category.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500">프로젝트를 불러오는 중...</p>
          </div>
        ) : !filteredProjects?.length ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Code className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">프로젝트가 없습니다</h3>
            <p className="text-gray-500">이 카테고리에는 아직 등록된 프로젝트가 없습니다.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const technologies = parseTechnologies(project.technologies);
              const categoryInfo = getCategoryInfo(project.category);

              return (
                <Card 
                  key={project.id} 
                  className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl"
                >
                  {/* Image */}
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    {project.imageUrl ? (
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : project.thumbnailUrl ? (
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Code className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Featured Badge */}
                    {project.featured === 1 && (
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-medium">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </div>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge 
                        className="text-white border-0 shadow-md"
                        style={{ backgroundColor: categoryInfo.color || '#6B7280' }}
                      >
                        {categoryInfo.label}
                      </Badge>
                    </div>

                    {/* View Count */}
                    <div className="absolute bottom-3 right-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-black/50 text-white rounded-full text-xs">
                        <Eye className="h-3 w-3" />
                        {project.viewCount}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    {technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {technologies.slice(0, 4).map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100">
                            {tech}
                          </Badge>
                        ))}
                        {technologies.length > 4 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">
                            +{technologies.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {project.projectUrl && (
                        <Button 
                          size="sm" 
                          className="flex-1 rounded-xl bg-gray-900 hover:bg-gray-800"
                          asChild
                        >
                          <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Demo
                          </a>
                        </Button>
                      )}
                      {project.githubUrl && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 rounded-xl"
                          asChild
                        >
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-1" />
                            Code
                          </a>
                        </Button>
                      )}
                      {project.videoUrl && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 rounded-xl"
                          asChild
                        >
                          <a href={project.videoUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Video
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-12 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500">© 2024 Gu Jahyeon. Embedded Systems Developer.</p>
        </div>
      </footer>
    </div>
  );
}
