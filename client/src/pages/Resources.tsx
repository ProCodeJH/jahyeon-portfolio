import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Download, Loader2, FileText, Code, Video, Image, ExternalLink, Heart, Eye, BookOpen, Cpu, Terminal } from "lucide-react";
import { toast } from "sonner";

const RESOURCE_CATEGORIES = [
  { value: "all", label: "전체", icon: FileText },
  { value: "daily_life", label: "일상생활", icon: Video, color: "#EC4899" },
  { value: "lecture_c", label: "C언어 강의", icon: Terminal, color: "#3B82F6" },
  { value: "lecture_arduino", label: "아두이노 강의", icon: Cpu, color: "#10B981" },
  { value: "lecture_python", label: "파이썬 강의", icon: Code, color: "#F59E0B" },
];

export default function Resources() {
  const { data: resources, isLoading } = trpc.resources.list.useQuery();
  const [activeTab, setActiveTab] = useState("all");

  const filteredResources = resources?.filter((resource) => {
    if (activeTab === "all") return true;
    return resource.category === activeTab;
  });

  const getCategoryInfo = (category: string) => {
    return RESOURCE_CATEGORIES.find(c => c.value === category) || RESOURCE_CATEGORIES[0];
  };

  const handleOpen = (url: string) => {
    window.open(url, '_blank');
  };

  // YouTube URL에서 비디오 ID 추출
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  // YouTube 썸네일 URL 생성
  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
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
                <span className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                  Projects
                </span>
              </Link>
              <Link href="/certifications">
                <span className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                  Certifications
                </span>
              </Link>
              <Link href="/resources">
                <span className="text-sm font-medium text-blue-600 cursor-pointer">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            학습 자료
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            임베디드 시스템 개발에 필요한 강의 자료와 코드 샘플을 제공합니다.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
            {RESOURCE_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setActiveTab(category.value)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === category.value
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

        {/* Resources Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500">리소스를 불러오는 중...</p>
          </div>
        ) : !filteredResources?.length ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">리소스가 없습니다</h3>
            <p className="text-gray-500">이 카테고리에는 아직 등록된 자료가 없습니다.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const categoryInfo = getCategoryInfo(resource.category);
              const thumbnail = resource.thumbnailUrl || (resource.fileUrl && isYouTubeUrl(resource.fileUrl) ? getYouTubeThumbnail(resource.fileUrl) : null);
              const isVideo = resource.fileUrl && isYouTubeUrl(resource.fileUrl);

              return (
                <Card 
                  key={resource.id} 
                  className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    {thumbnail ? (
                      <>
                        <img 
                          src={thumbnail} 
                          alt={resource.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                              <Video className="h-7 w-7 text-gray-900 ml-1" />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400" />
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
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {resource.title}
                    </CardTitle>
                    {resource.description && (
                      <CardDescription className="line-clamp-2 text-gray-500">
                        {resource.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {resource.likeCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {resource.downloadCount || 0}
                      </span>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                      onClick={() => resource.fileUrl && handleOpen(resource.fileUrl)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {isVideo ? "영상 보기" : "자료 보기"}
                    </Button>
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
