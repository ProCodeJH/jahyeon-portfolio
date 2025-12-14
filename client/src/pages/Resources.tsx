import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Download, Loader2, FileText, Code, Video, ExternalLink, Play, Presentation, BookOpen, Terminal, Cpu } from "lucide-react";
import { toast } from "sonner";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsInView(true); }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isInView };
}

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isInView } = useInView(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${className}`} style={{ transform: isInView ? "translateY(0)" : "translateY(40px)", opacity: isInView ? 1 : 0, transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const RESOURCE_CATEGORIES = [
  { value: "all", label: "All Resources", icon: FileText },
  { value: "daily_life", label: "Daily Videos", icon: Video },
  { value: "lecture_materials", label: "Lectures", icon: BookOpen },
  { value: "arduino_projects", label: "Arduino", icon: Cpu },
  { value: "c_projects", label: "C Projects", icon: Terminal },
  { value: "python_projects", label: "Python", icon: Code },
];

export default function Resources() {
  const { data: resources, isLoading } = trpc.resources.list.useQuery();
  const incrementDownload = trpc.resources.incrementDownload.useMutation();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const filteredResources = resources?.filter((resource) => activeTab === "all" || resource.category === activeTab);

  const handleDownload = async (resource: any) => {
    try {
      await incrementDownload.mutateAsync({ id: resource.id });
      window.open(resource.fileUrl, '_blank');
      toast.success(`Downloading ${resource.fileName}`);
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const getYouTubeId = (url: string) => {
    const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const isYouTubeUrl = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');
  const isPPT = (mimeType: string, fileName: string) => mimeType?.includes('presentation') || mimeType?.includes('powerpoint') || fileName?.endsWith('.ppt') || fileName?.endsWith('.pptx');

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getCategoryInfo = (category: string) => RESOURCE_CATEGORIES.find(c => c.value === category) || RESOURCE_CATEGORIES[0];

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
                  <span className={`text-sm font-light transition-colors cursor-pointer tracking-wide ${item === "Resources" ? "text-white" : "text-white/60 hover:text-white"}`}>{item}</span>
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
            <p className="text-emerald-400 font-mono text-sm tracking-widest mb-6">LEARNING MATERIALS</p>
            <h1 className="text-4xl md:text-6xl font-light mb-6"><span className="text-emerald-400">Resources</span> & Downloads</h1>
            <p className="text-white/50 text-xl max-w-2xl">Access lecture materials, code samples, presentations, and video tutorials.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection delay={100}>
            <div className="flex flex-wrap gap-3">
              {RESOURCE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button key={category.value} onClick={() => setActiveTab(category.value)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light transition-all ${activeTab === category.value ? "bg-white text-black" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"}`}>
                    <Icon className="w-4 h-4" />{category.label}
                  </button>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
              <p className="text-white/40">Loading resources...</p>
            </div>
          ) : !filteredResources?.length ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6"><FileText className="w-10 h-10 text-white/20" /></div>
              <h3 className="text-xl font-light mb-2">No resources found</h3>
              <p className="text-white/40">No resources in this category yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => {
                const categoryInfo = getCategoryInfo(resource.category);
                const thumbnail = resource.thumbnailUrl || (resource.fileUrl && isYouTubeUrl(resource.fileUrl) ? getYouTubeThumbnail(resource.fileUrl) : null);
                const isVideo = resource.fileUrl && isYouTubeUrl(resource.fileUrl);
                const isPPTFile = isPPT(resource.mimeType, resource.fileName);

                return (
                  <AnimatedSection key={resource.id} delay={index * 50}>
                    <div className="group rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300">
                      <div className="aspect-video overflow-hidden relative">
                        {thumbnail ? (
                          <>
                            <img src={thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {isVideo && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setSelectedVideo(resource)}>
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center"><Play className="w-6 h-6 text-black ml-1" /></div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center text-white/20">
                            {isPPTFile ? <Presentation className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                          </div>
                        )}
                        <div className="absolute top-3 left-3"><span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-mono">{categoryInfo.label}</span></div>
                        {isPPTFile && <div className="absolute top-3 right-3"><span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-mono flex items-center gap-1"><Presentation className="w-3 h-3" />PPT</span></div>}
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-medium mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">{resource.title}</h3>
                        {resource.description && <p className="text-white/40 text-sm mb-4 line-clamp-2">{resource.description}</p>}
                        <div className="flex items-center justify-between text-xs text-white/30 mb-4">
                          <span>{formatFileSize(resource.fileSize)}</span>
                          <span>{resource.downloadCount || 0} downloads</span>
                        </div>
                        <div className="flex gap-2">
                          {isVideo ? (
                            <Button className="flex-1 rounded-xl bg-white text-black hover:bg-white/90" onClick={() => setSelectedVideo(resource)}><Play className="w-4 h-4 mr-2" />Watch</Button>
                          ) : (
                            <Button className="flex-1 rounded-xl bg-white text-black hover:bg-white/90" onClick={() => handleDownload(resource)}><Download className="w-4 h-4 mr-2" />Download</Button>
                          )}
                          {resource.fileUrl && !isVideo && (
                            <Button variant="outline" className="rounded-xl border-white/10 bg-transparent hover:bg-white/10" onClick={() => window.open(resource.fileUrl, '_blank')}><ExternalLink className="w-4 h-4" /></Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setSelectedVideo(null)}>
          <div className="w-full max-w-5xl rounded-2xl overflow-hidden bg-[#0a0a0a]" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div><h3 className="text-lg font-medium">{selectedVideo.title}</h3>{selectedVideo.description && <p className="text-white/40 text-sm">{selectedVideo.description}</p>}</div>
              <button className="text-white/40 hover:text-white" onClick={() => setSelectedVideo(null)}>✕</button>
            </div>
            <div className="aspect-video bg-black">
              {isYouTubeUrl(selectedVideo.fileUrl) ? (
                <iframe src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.fileUrl)}?autoplay=1`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <video controls autoPlay className="w-full h-full"><source src={selectedVideo.fileUrl} type={selectedVideo.mimeType} /></video>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center text-white/30 text-sm">© 2024 Gu Jahyeon. All rights reserved.</div>
      </footer>
    </div>
  );
}
