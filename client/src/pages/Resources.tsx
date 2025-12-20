import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Download, Loader2, FileText, Video, ExternalLink, Play, Presentation, Terminal, Cpu, Code, X, Eye, Sparkles, BookOpen, Zap, Heart, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

// Circuit Pattern Background
function CircuitPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="circuit-res" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2" fill="currentColor"/>
          <circle cx="90" cy="90" r="2" fill="currentColor"/>
          <circle cx="50" cy="50" r="3" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M10 50h35M55 50h35M50 10v35M50 55v35" stroke="currentColor" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit-res)" className="text-emerald-400"/>
    </svg>
  );
}

// Floating particles
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-float" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${3 + Math.random() * 4}s` }} />
      ))}
      <style>{`@keyframes float { 0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; } 50% { transform: translateY(-30px) scale(1.5); opacity: 0.6; } } .animate-float { animation: float 4s ease-in-out infinite; }`}</style>
    </div>
  );
}

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
  { value: "all", label: "All", icon: Sparkles, color: "#10B981", gradient: "from-emerald-500 to-teal-500" },
  { value: "daily_life", label: "Daily Videos", icon: Video, color: "#EC4899", gradient: "from-pink-500 to-rose-500" },
  { value: "lecture_c", label: "C Lectures", icon: Terminal, color: "#3B82F6", gradient: "from-blue-500 to-indigo-500" },
  { value: "lecture_arduino", label: "Arduino", icon: Cpu, color: "#10B981", gradient: "from-emerald-500 to-green-500" },
  { value: "lecture_python", label: "Python", icon: Code, color: "#F59E0B", gradient: "from-amber-500 to-orange-500" },
  { value: "presentation", label: "Presentations", icon: Presentation, color: "#8B5CF6", gradient: "from-purple-500 to-violet-500" },
];

// PPT Thumbnail - 실제 PPT처럼 보이게
function PPTThumbnail({ resource }: { resource: any }) {
  if (resource.thumbnailUrl) {
    return <img src={resource.thumbnailUrl} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />;
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-orange-600/40 via-red-500/30 to-purple-600/40 flex flex-col items-center justify-center relative overflow-hidden group-hover:from-orange-600/50 group-hover:to-purple-600/50 transition-all duration-500">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-6 left-6 w-20 h-14 border-2 border-orange-300/30 rounded-lg" />
        <div className="absolute top-8 left-8 w-20 h-14 border-2 border-orange-300/20 rounded-lg" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-2 border-purple-300/30 rounded-full" />
      </div>
      
      {/* 슬라이드 미니어처 */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-28 h-20 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl mb-4 flex items-center justify-center overflow-hidden">
          <div className="text-center p-2">
            <div className="w-16 h-1 bg-orange-400/60 rounded mb-2" />
            <div className="w-12 h-1 bg-white/30 rounded mb-1" />
            <div className="w-14 h-1 bg-white/20 rounded" />
          </div>
        </div>
        <p className="text-white/90 font-medium text-sm text-center px-4 line-clamp-1">{resource.title}</p>
        <div className="flex items-center gap-1 mt-2">
          <Presentation className="w-3 h-3 text-orange-400" />
          <span className="text-orange-400/80 text-xs font-mono">.PPTX</span>
        </div>
      </div>

      {/* 호버 오버레이 */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
          <Eye className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
}

// PDF Thumbnail
function PDFThumbnail({ resource }: { resource: any }) {
  if (resource.thumbnailUrl) {
    return <img src={resource.thumbnailUrl} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />;
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-red-600/40 via-pink-500/30 to-rose-600/40 flex flex-col items-center justify-center relative overflow-hidden group-hover:from-red-600/50 group-hover:to-rose-600/50 transition-all duration-500">
      <div className="absolute top-6 right-6 w-16 h-20 border-2 border-red-300/30 rounded" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-28 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl mb-4 flex flex-col items-center justify-center p-3">
          <div className="w-full space-y-1.5">
            <div className="w-full h-1 bg-red-400/50 rounded" />
            <div className="w-4/5 h-1 bg-white/30 rounded" />
            <div className="w-full h-1 bg-white/20 rounded" />
            <div className="w-3/4 h-1 bg-white/20 rounded" />
          </div>
        </div>
        <p className="text-white/90 font-medium text-sm text-center px-4 line-clamp-1">{resource.title}</p>
        <div className="flex items-center gap-1 mt-2">
          <FileText className="w-3 h-3 text-red-400" />
          <span className="text-red-400/80 text-xs font-mono">.PDF</span>
        </div>
      </div>

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
          <Eye className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
}

// Video Thumbnail
function VideoThumbnail({ resource, thumbnail }: { resource: any; thumbnail: string | null }) {
  if (thumbnail) {
    return (
      <>
        <img src={thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-black ml-1" />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-600/40 via-indigo-500/30 to-blue-600/40 flex flex-col items-center justify-center relative">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
        <Play className="w-10 h-10 text-white ml-1" />
      </div>
      <p className="text-white/80 mt-4 text-sm">Video</p>
    </div>
  );
}

// Document Preview Modal
function DocumentPreviewModal({ resource, onClose }: { resource: any; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const getOfficePreviewUrl = (fileUrl: string) => `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
  const getGooglePreviewUrl = (fileUrl: string) => `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  const isPPT = resource.mimeType?.includes('presentation') || resource.mimeType?.includes('powerpoint') || resource.fileName?.endsWith('.ppt') || resource.fileName?.endsWith('.pptx');
  const isPDF = resource.mimeType?.includes('pdf') || resource.fileName?.endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between p-4 border-b border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPPT ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-red-500 to-pink-500'}`}>
            {isPPT ? <Presentation className="w-6 h-6 text-white" /> : <FileText className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h3 className="text-lg font-light text-white">{resource.title}</h3>
            <p className="text-white/40 text-sm">{resource.fileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white hover:text-black h-10 px-4"><ExternalLink className="w-4 h-4 mr-2" />New Tab</Button>
          </a>
          <a href={resource.fileUrl} download>
            <Button className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white h-10 px-4"><Download className="w-4 h-4 mr-2" />Download</Button>
          </a>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20"><X className="w-5 h-5 text-white" /></button>
        </div>
      </div>
      <div className="flex-1 relative" onClick={e => e.stopPropagation()}>
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mx-auto mb-4" />
              <p className="text-white/60">Loading preview...</p>
            </div>
          </div>
        )}
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-4">Preview not available</p>
              <a href={resource.fileUrl} download><Button className="rounded-xl bg-emerald-500"><Download className="w-4 h-4 mr-2" />Download</Button></a>
            </div>
          </div>
        ) : isPPT ? (
          <iframe src={getOfficePreviewUrl(resource.fileUrl)} className="w-full h-full bg-white" onLoad={() => setLoading(false)} onError={() => { setLoading(false); setError(true); }} />
        ) : (
          <iframe src={getGooglePreviewUrl(resource.fileUrl)} className="w-full h-full" onLoad={() => setLoading(false)} onError={() => { setLoading(false); setError(true); }} />
        )}
      </div>
    </div>
  );
}

// Like Button Component
function LikeButton({ resourceId }: { resourceId: number }) {
  const utils = trpc.useUtils();
  const { data: likeStatus } = trpc.likes.check.useQuery({ resourceId });
  const toggleLike = trpc.likes.toggle.useMutation({
    onSuccess: () => {
      utils.likes.check.invalidate({ resourceId });
      utils.resources.list.invalidate();
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike.mutate({ resourceId });
  };

  return (
    <button
      onClick={handleLike}
      disabled={toggleLike.isPending}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all ${
        likeStatus?.liked
          ? "bg-pink-500/20 text-pink-400 hover:bg-pink-500/30"
          : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
      }`}
    >
      <Heart className={`w-4 h-4 ${likeStatus?.liked ? "fill-current" : ""}`} />
    </button>
  );
}

// Comments Modal
function CommentsModal({ resource, onClose }: { resource: any; onClose: () => void }) {
  const [newComment, setNewComment] = useState("");
  const { data: comments, refetch } = trpc.comments.list.useQuery({ resourceId: resource.id });
  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => { refetch(); setNewComment(""); toast.success("Comment added!"); },
    onError: () => toast.error("Failed to add comment"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createComment.mutate({
      resourceId: resource.id,
      authorName: "Anonymous",
      content: newComment.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-light text-white">Comments</h3>
              <p className="text-white/40 text-sm">{resource.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {!comments?.length ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40">No comments yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-emerald-400 text-sm font-medium">{comment.authorName}</span>
                    <span className="text-white/30 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white/70 text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12"
            />
            <Button
              type="submit"
              disabled={!newComment.trim() || createComment.isPending}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white h-12 px-6"
            >
              {createComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Video Modal
function VideoModal({ resource, onClose }: { resource: any; onClose: () => void }) {
  const getYouTubeId = (url: string) => url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)?.[1];
  const isYouTubeUrl = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-full max-w-6xl rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center"><Video className="w-6 h-6 text-white" /></div>
            <div>
              <h3 className="text-lg font-light text-white">{resource.title}</h3>
              {resource.description && <p className="text-white/40 text-sm">{resource.description}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"><X className="w-5 h-5 text-white" /></button>
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
  const [selectedCommentResource, setSelectedCommentResource] = useState<any>(null);
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
  const getCategoryInfo = (category: string) => CATEGORIES.find(c => c.value === category) || CATEGORIES[0];

  const handleResourceClick = (resource: any) => {
    const isVideo = isYouTubeUrl(resource.fileUrl) || resource.mimeType?.startsWith('video/');
    const isDocument = isPPT(resource.mimeType, resource.fileName) || isPDF(resource.mimeType, resource.fileName);
    if (isVideo) setSelectedVideo(resource);
    else if (isDocument) setSelectedDocument(resource);
    else handleDownload(resource);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <CircuitPattern />
        <FloatingParticles />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[180px]" />
      </div>

      <div className="fixed w-4 h-4 bg-emerald-400 rounded-full pointer-events-none z-[100] mix-blend-difference" style={{ left: mousePos.x - 8, top: mousePos.y - 8 }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-6 lg:mx-12 mt-6">
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-2xl px-8 py-4">
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
      <section className="pt-40 pb-12 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"><BookOpen className="w-6 h-6 text-white" /></div>
              <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] uppercase">Learning Materials</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-extralight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">Resources</span> & Downloads
            </h1>
            <p className="text-white/40 text-xl max-w-2xl">
              Access lecture materials, code samples, presentations, and video tutorials.
              <span className="flex items-center gap-2 text-emerald-400 mt-3 text-base"><Eye className="w-4 h-4" />Click to preview PPT/PDF files!</span>
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 sticky top-24 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <AnimatedSection delay={100}>
            <div className="flex flex-wrap gap-3 p-2 bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-2xl inline-flex">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                return (
                  <button key={category.value} onClick={() => setActiveCategory(category.value)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-light transition-all ${activeCategory === category.value ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg` : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                    <Icon className="w-4 h-4" />{category.label}
                  </button>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 pb-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mb-4" />
              <p className="text-white/40">Loading resources...</p>
            </div>
          ) : !filteredResources?.length ? (
            <div className="text-center py-32">
              <FileText className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-2xl font-light mb-2">No resources found</h3>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((resource, index) => {
                const thumbnail = resource.thumbnailUrl || (isYouTubeUrl(resource.fileUrl) ? getYouTubeThumbnail(resource.fileUrl) : null);
                const isVideo = isYouTubeUrl(resource.fileUrl) || resource.mimeType?.startsWith('video/');
                const isPPTFile = isPPT(resource.mimeType, resource.fileName);
                const isPDFFile = isPDF(resource.mimeType, resource.fileName);
                const canPreview = isVideo || isPPTFile || isPDFFile;
                const categoryInfo = getCategoryInfo(resource.category);

                return (
                  <AnimatedSection key={resource.id} delay={index * 50}>
                    <div className={`group rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-emerald-400/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 ${canPreview ? 'cursor-pointer' : ''}`} onClick={() => canPreview && handleResourceClick(resource)}>
                      <div className="aspect-video overflow-hidden relative">
                        {isVideo ? <VideoThumbnail resource={resource} thumbnail={thumbnail} />
                        : isPPTFile ? <PPTThumbnail resource={resource} />
                        : isPDFFile ? <PDFThumbnail resource={resource} />
                        : thumbnail ? <img src={thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        : <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"><FileText className="w-12 h-12 text-white/20" /></div>}

                        <div className="absolute top-4 left-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider backdrop-blur-xl bg-gradient-to-r ${categoryInfo.gradient} text-white shadow-lg`}>{categoryInfo.label}</span>
                        </div>

                        {canPreview && (
                          <div className="absolute top-4 right-4">
                            <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/50 backdrop-blur-xl text-emerald-400 text-xs font-medium"><Eye className="w-3 h-3" />Preview</span>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-lg font-light mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">{resource.title}</h3>
                        {resource.description && <p className="text-white/40 text-sm mb-4 line-clamp-2">{resource.description}</p>}
                        
                        <div className="flex items-center justify-between text-xs text-white/30 mb-4">
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-400" />{formatFileSize(resource.fileSize)}</span>
                          <span className="flex items-center gap-1"><Download className="w-3 h-3" />{resource.downloadCount || 0}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <LikeButton resourceId={resource.id} />
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedCommentResource(resource); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 transition-all"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <div className="flex-1" />
                          <span className="flex items-center gap-1.5 text-pink-400 text-xs">
                            <Heart className="w-3 h-3 fill-current" />
                            {resource.likeCount || 0}
                          </span>
                        </div>

                        <div className="flex gap-3">
                          <Button className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white h-12 shadow-lg shadow-emerald-500/20" onClick={e => { e.stopPropagation(); canPreview ? handleResourceClick(resource) : handleDownload(resource); }}>
                            {canPreview ? <><Eye className="w-4 h-4 mr-2" />Preview</> : <><Download className="w-4 h-4 mr-2" />Download</>}
                          </Button>
                          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 h-12 w-12 p-0" onClick={e => { e.stopPropagation(); handleDownload(resource); }}>
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

      {selectedVideo && <VideoModal resource={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      {selectedDocument && <DocumentPreviewModal resource={selectedDocument} onClose={() => setSelectedDocument(null)} />}
      {selectedCommentResource && <CommentsModal resource={selectedCommentResource} onClose={() => setSelectedCommentResource(null)} />}

      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center text-white/20 text-sm">© 2024 Gu Jahyeon. Crafted with passion.</div>
      </footer>
    </div>
  );
}
