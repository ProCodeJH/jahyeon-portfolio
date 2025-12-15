import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Download, Loader2, FileText, Video, ExternalLink, Play, Presentation, Terminal, Cpu, Code, X, Eye } from "lucide-react";
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

const CATEGORIES = [
  { value: "all", label: "All", icon: FileText, color: "#6B7280" },
  { value: "daily_life", label: "Daily Videos", icon: Video, color: "#EC4899" },
  { value: "lecture_c", label: "C Lectures", icon: Terminal, color: "#3B82F6" },
  { value: "lecture_arduino", label: "Arduino", icon: Cpu, color: "#10B981" },
  { value: "lecture_python", label: "Python", icon: Code, color: "#F59E0B" },
  { value: "presentation", label: "Presentations", icon: Presentation, color: "#8B5CF6" },
];

// PPT/PDF Preview Modal
function DocumentPreviewModal({ resource, onClose }: { resource: any; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const getOfficePreviewUrl = (fileUrl: string) => {
    const encodedUrl = encodeURIComponent(fileUrl);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  };

  const getGooglePreviewUrl = (fileUrl: string) => {
    const encodedUrl = encodeURIComponent(fileUrl);
    return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
  };

  const isPPT = resource.mimeType?.includes('presentation') || resource.mimeType?.includes('powerpoint') || resource.fileName?.endsWith('.ppt') || resource.fileName?.endsWith('.pptx');
  const isPDF = resource.mimeType?.includes('pdf') || resource.fileName?.endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between p-4 border-b border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          {isPPT ? <Presentation className="w-6 h-6 text-orange-400" /> : <FileText className="w-6 h-6 text-red-400" />}
          <div>
            <h3 className="text-lg font-light text-white">{resource.title}</h3>
            <p className="text-white/40 text-sm">{resource.fileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white hover:text-black h-10 px-4">
              <ExternalLink className="w-4 h-4 mr-2" />New Tab
            </Button>
          </a>
          <a href={resource.fileUrl} download>
            <Button className="rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 h-10 px-4">
              <Download className="w-4 h-4 mr-2" />Download
            </Button>
          </a>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative" onClick={e => e.stopPropagation()}>
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mx-auto mb-4" />
              <p className="text-white/60">Loading preview...</p>
              <p className="text-white/30 text-sm mt-2">Large files may take a moment</p>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-20 h-20 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-4">Preview not available</p>
              <a href={resource.fileUrl} download>
                <Button className="rounded-xl bg-emerald-500 text-black hover:bg-emerald-400">
                  <Download className="w-4 h-4 mr-2" />Download Instead
                </Button>
              </a>
            </div>
          </div>
        ) : isPPT ? (
          <iframe
            src={getOfficePreviewUrl(resource.fileUrl)}
            className="w-full h-full bg-white"
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
        ) : isPDF ? (
          <iframe
            src={getGooglePreviewUrl(resource.fileUrl)}
            className="w-full h-full"
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
        ) : null}
      </div>
    </div>
  );
}

// Video Modal
function VideoModal({ resource, onClose }: { resource: any; onClose: () => void }) {
  const getYouTubeId = (url: string) => {
    const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };
  const isYouTubeUrl = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-full max-w-6xl rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-light text-white">{resource.title}</h3>
            {resource.description && <p className="text-white/40 text-sm">{resource.description}</p>}
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="aspect-video bg-black">
          {isYouTubeUrl(resource.fileUrl) ? (
            <iframe src={`https://www.youtube.com/embed/${getYouTubeId(resource.fileUrl)}?autoplay=1`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : (
            <video controls autoPlay className="w-full h-full"><source src={resource.fileUrl} type={resource.mimeType} /></video>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Resources() {
  const { data: resources, isLoading } = trpc.resources.list.useQuery();
  const incrementDownload = trpc.resources.incrementDownload.useMutation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const filteredResources = resources?.filter(r => activeCategory === "all" || r.category === activeCategory);

  const handleDownload = async (resource: any) => {
    try {
      await incrementDownload.mutateAsync({ id: resource.id });
      window.open(resource.fileUrl, '_blank');
      toast.success(`Downloading ${resource.fileName}`);
    } catch { toast.error("Download failed"); }
  };

  const getYouTubeId = (url: string) => url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)?.[1];
  const getYouTubeThumbnail = (url: string) => { const id = getYouTubeId(url); return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null; };
  const isYouTubeUrl = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');
  const isPPT = (mimeType: string, fileName: string) => mimeType?.includes('presentation') || mimeType?.includes('powerpoint') || fileName?.endsWith('.ppt') || fileName?.endsWith('.pptx');
  const isPDF = (mimeType: string, fileName: string) => mimeType?.includes('pdf') || fileName?.endsWith('.pdf');
  const formatFileSize = (bytes: number) => { if (!bytes) return "N/A"; if (bytes < 1024) return bytes + " B"; if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"; return (bytes / (1024 * 1024)).toFixed(1) + " MB"; };
  const getCategoryColor = (category: string) => CATEGORIES.find(c => c.value === category)?.color || "#6B7280";

  const handleResourceClick = (resource: any) => {
    const isVideo = isYouTubeUrl(resource.fileUrl) || resource.mimeType?.startsWith('video/');
    const isDocument = isPPT(resource.mimeType, resource.fileName) || isPDF(resource.mimeType, resource.fileName);
    if (isVideo) setSelectedVideo(resource);
    else if (isDocument) setSelectedDocument(resource);
    else handleDownload(resource);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      <div className="fixed w-4 h-4 bg-emerald-400 rounded-full pointer-events-none z-[100] mix-blend-difference" style={{ left: mousePos.x - 8, top: mousePos.y - 8 }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-6 lg:mx-12 mt-6">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] rounded-2xl px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/"><span className="text-2xl font-extralight tracking-[0.3em] hover:text-emerald-400 transition-colors cursor-pointer">JH</span></Link>
              <div className="hidden md:flex items-center gap-12">
                {["About", "Projects", "Certifications", "Resources"].map(item => (
                  <Link key={item} href={`/${item.toLowerCase()}`}>
                    <span className={`text-sm font-light transition-all cursor-pointer tracking-wider ${item === "Resources" ? "text-white" : "text-white/50 hover:text-white"}`}>{item}</span>
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
            <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-6 uppercase">Learning Materials</p>
            <h1 className="text-5xl md:text-7xl font-extralight mb-6"><span className="text-emerald-400">Resources</span> & Downloads</h1>
            <p className="text-white/40 text-xl max-w-2xl">
              Access lecture materials, code samples, presentations, and video tutorials.
              <span className="text-emerald-400 block mt-2">📄 Click PPT/PDF to preview without downloading!</span>
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 sticky top-24 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection delay={100}>
            <div className="flex flex-wrap gap-3 p-2 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl inline-flex">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                return (
                  <button key={category.value} onClick={() => setActiveCategory(category.value)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-light transition-all ${activeCategory === category.value ? "bg-white text-black" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                    <Icon className="w-4 h-4" />{category.label}
                  </button>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12 pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
              <p className="text-white/40">Loading resources...</p>
            </div>
          ) : !filteredResources?.length ? (
            <div className="text-center py-32">
              <FileText className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-2xl font-light mb-2">No resources found</h3>
              <p className="text-white/40">No resources in this category yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => {
                const thumbnail = resource.thumbnailUrl || (resource.fileUrl && isYouTubeUrl(resource.fileUrl) ? getYouTubeThumbnail(resource.fileUrl) : null);
                const isVideo = isYouTubeUrl(resource.fileUrl) || resource.mimeType?.startsWith('video/');
                const isPPTFile = isPPT(resource.mimeType, resource.fileName);
                const isPDFFile = isPDF(resource.mimeType, resource.fileName);
                const canPreview = isVideo || isPPTFile || isPDFFile;

                return (
                  <AnimatedSection key={resource.id} delay={index * 50}>
                    <div className={`group rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 transition-all duration-500 ${canPreview ? 'cursor-pointer' : ''}`} onClick={() => canPreview && handleResourceClick(resource)}>
                      <div className="aspect-video overflow-hidden relative">
                        {thumbnail ? (
                          <>
                            <img src={thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            {isVideo && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
                                  <Play className="w-8 h-8 text-black ml-1" />
                                </div>
                              </div>
                            )}
                          </>
                        ) : isPPTFile ? (
                          <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex flex-col items-center justify-center group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-all">
                            <Presentation className="w-16 h-16 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-white/60 text-sm">Click to Preview</span>
                          </div>
                        ) : isPDFFile ? (
                          <div className="w-full h-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex flex-col items-center justify-center group-hover:from-red-500/30 group-hover:to-pink-500/30 transition-all">
                            <FileText className="w-16 h-16 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-white/60 text-sm">Click to Preview</span>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center">
                            <FileText className="w-12 h-12 text-white/20" />
                          </div>
                        )}

                        {/* Category badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider backdrop-blur-xl" style={{ backgroundColor: getCategoryColor(resource.category) + "30", color: getCategoryColor(resource.category) }}>
                            {CATEGORIES.find(c => c.value === resource.category)?.label || resource.category}
                          </span>
                        </div>

                        {/* Preview badge */}
                        {canPreview && (
                          <div className="absolute top-4 right-4">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono backdrop-blur-xl">
                              <Eye className="w-3 h-3" />Preview
                            </span>
                          </div>
                        )}

                        {/* File type badge */}
                        {isPPTFile && (
                          <div className="absolute bottom-4 right-4">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/30 text-orange-400 text-xs font-mono backdrop-blur-xl">
                              <Presentation className="w-3 h-3" />PPT
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-lg font-light mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">{resource.title}</h3>
                        {resource.description && <p className="text-white/40 text-sm mb-4 line-clamp-2">{resource.description}</p>}
                        
                        <div className="flex items-center justify-between text-xs text-white/30 mb-5">
                          <span>{formatFileSize(resource.fileSize)}</span>
                          <span className="flex items-center gap-1"><Download className="w-3 h-3" />{resource.downloadCount || 0}</span>
                        </div>

                        <div className="flex gap-3">
                          {canPreview ? (
                            <Button className="flex-1 rounded-xl bg-white text-black hover:bg-emerald-400 h-12" onClick={e => { e.stopPropagation(); handleResourceClick(resource); }}>
                              <Eye className="w-4 h-4 mr-2" />Preview
                            </Button>
                          ) : (
                            <Button className="flex-1 rounded-xl bg-white text-black hover:bg-emerald-400 h-12" onClick={e => { e.stopPropagation(); handleDownload(resource); }}>
                              <Download className="w-4 h-4 mr-2" />Download
                            </Button>
                          )}
                          <Button variant="outline" className="rounded-xl border-white/10 bg-transparent hover:bg-white/10 h-12 w-12 p-0" onClick={e => { e.stopPropagation(); handleDownload(resource); }}>
                            <Download className="w-4 h-4" />
                          </Button>
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

      {/* Modals */}
      {selectedVideo && <VideoModal resource={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      {selectedDocument && <DocumentPreviewModal resource={selectedDocument} onClose={() => setSelectedDocument(null)} />}

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center text-white/20 text-sm">© 2024 Gu Jahyeon. All rights reserved.</div>
      </footer>
    </div>
  );
}
