import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Download, Loader2, FileText, Video, ExternalLink, Play, Presentation, Terminal, Cpu, Code, X, Eye, Sparkles, BookOpen, Zap, Heart, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { GradientMeshBackground } from "@/components/backgrounds/GradientMeshBackground";
import { SubtleDots } from "@/components/backgrounds/SubtleDots";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

const CATEGORIES = [
  { value: "all", label: "All", icon: Sparkles, color: "#8B5CF6", gradient: "from-purple-500 to-pink-500" },
  { value: "daily_life", label: "Daily Videos", icon: Video, color: "#EC4899", gradient: "from-pink-500 to-rose-500" },
  { value: "lecture_c", label: "C Lectures", icon: Terminal, color: "#3B82F6", gradient: "from-blue-500 to-indigo-500" },
  { value: "lecture_arduino", label: "Arduino", icon: Cpu, color: "#10B981", gradient: "from-emerald-500 to-green-500" },
  { value: "lecture_python", label: "Python", icon: Code, color: "#F59E0B", gradient: "from-amber-500 to-orange-500" },
  { value: "presentation", label: "Presentations", icon: Presentation, color: "#8B5CF6", gradient: "from-purple-500 to-violet-500" },
];

// PPT Thumbnail
function PPTThumbnail({ resource }: { resource: any }) {
  if (resource.thumbnailUrl) {
    return <img src={resource.thumbnailUrl} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />;
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-orange-200 via-red-100 to-purple-200 flex flex-col items-center justify-center relative overflow-hidden group-hover:from-orange-300 group-hover:to-purple-300 transition-all duration-500">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-6 left-6 w-20 h-14 border-2 border-orange-400/30 rounded-lg" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-2 border-purple-400/30 rounded-full" />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-28 h-20 bg-white rounded-lg border-2 border-gray-200 shadow-xl mb-4 flex items-center justify-center overflow-hidden">
          <div className="text-center p-2">
            <div className="w-16 h-1 bg-orange-400 rounded mb-2" />
            <div className="w-12 h-1 bg-gray-300 rounded mb-1" />
            <div className="w-14 h-1 bg-gray-200 rounded" />
          </div>
        </div>
        <p className="text-gray-700 font-medium text-sm text-center px-4 line-clamp-1">{resource.title}</p>
        <div className="flex items-center gap-1 mt-2">
          <Presentation className="w-3 h-3 text-orange-600" />
          <span className="text-orange-600 text-xs font-mono">.PPTX</span>
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
    <div className="w-full h-full bg-gradient-to-br from-red-200 via-pink-100 to-rose-200 flex flex-col items-center justify-center relative overflow-hidden group-hover:from-red-300 group-hover:to-rose-300 transition-all duration-500">
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-28 bg-white rounded-lg border-2 border-gray-200 shadow-xl mb-4 flex flex-col items-center justify-center p-3">
          <div className="w-full space-y-1.5">
            <div className="w-full h-1 bg-red-400 rounded" />
            <div className="w-4/5 h-1 bg-gray-300 rounded" />
            <div className="w-full h-1 bg-gray-200 rounded" />
            <div className="w-3/4 h-1 bg-gray-200 rounded" />
          </div>
        </div>
        <p className="text-gray-700 font-medium text-sm text-center px-4 line-clamp-1">{resource.title}</p>
        <div className="flex items-center gap-1 mt-2">
          <FileText className="w-3 h-3 text-red-600" />
          <span className="text-red-600 text-xs font-mono">.PDF</span>
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-purple-600 ml-1" />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-200 via-indigo-100 to-blue-200 flex flex-col items-center justify-center relative">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
        <Play className="w-10 h-10 text-white ml-1" />
      </div>
      <p className="text-gray-700 mt-4 text-sm">Video</p>
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col" onClick={onClose}>
      <div className="relative flex items-center justify-between p-4 border-b border-gray-200 bg-white" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPPT ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-red-500 to-pink-500'}`}>
            {isPPT ? <Presentation className="w-6 h-6 text-white" /> : <FileText className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
            <p className="text-gray-500 text-sm">{resource.fileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="rounded-xl border-gray-300 text-gray-900 hover:bg-gray-100 h-10 px-4"><ExternalLink className="w-4 h-4 mr-2" />New Tab</Button>
          </a>
          <a href={resource.fileUrl} download>
            <Button className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white h-10 px-4"><Download className="w-4 h-4 mr-2" />Download</Button>
          </a>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X className="w-5 h-5 text-gray-900" /></button>
        </div>
      </div>
      <div className="relative flex-1 bg-gray-100" onClick={e => e.stopPropagation()}>
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading preview...</p>
            </div>
          </div>
        )}
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Preview not available</p>
              <a href={resource.fileUrl} download><Button className="rounded-xl bg-purple-500"><Download className="w-4 h-4 mr-2" />Download</Button></a>
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
          ? "bg-pink-100 text-pink-600 hover:bg-pink-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6" onClick={onClose}>
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-white border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
              <p className="text-gray-500 text-sm">{resource.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {!comments?.length ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No comments yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-purple-600 text-sm font-medium">{comment.authorName}</span>
                    <span className="text-gray-400 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-xl h-12"
            />
            <Button
              type="submit"
              disabled={!newComment.trim() || createComment.isPending}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white h-12 px-6"
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
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={onClose}>
      <div className="relative w-full max-w-6xl rounded-3xl overflow-hidden bg-white border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center"><Video className="w-6 h-6 text-white" /></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
              {resource.description && <p className="text-gray-500 text-sm">{resource.description}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X className="w-5 h-5 text-gray-900" /></button>
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
                  <span className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-all cursor-pointer relative group">
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
      <section className="pt-40 pb-12 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <p className="text-purple-600 font-medium text-sm tracking-wider uppercase">Learning Materials</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900">
              Resources
            </h1>
            <p className="text-gray-600 text-xl max-w-2xl">
              Access lecture materials, code samples, presentations, and video tutorials.
              <span className="flex items-center gap-2 text-purple-600 mt-3 text-base font-medium"><Eye className="w-4 h-4" />Click to preview PPT/PDF files!</span>
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
                const isActive = activeCategory === category.value;
                return (
                  <button
                    key={category.value}
                    onClick={() => setActiveCategory(category.value)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all border-2 ${
                      isActive
                        ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg shadow-${category.color}/30 border-transparent`
                        : "bg-white text-gray-600 border-gray-200 hover:border-purple-400 hover:text-purple-600 hover:shadow-md"
                    }`}
                  >
                    <Icon className="w-4 h-4" />{category.label}
                  </button>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 pb-32 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
              <p className="text-gray-500">Loading resources...</p>
            </div>
          ) : !filteredResources?.length ? (
            <div className="text-center py-32">
              <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">No resources found</h3>
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
                    <TiltCard>
                      <div
                        className={`group rounded-3xl overflow-hidden bg-white border border-gray-200 hover:border-purple-300 transition-all duration-500 hover:shadow-2xl ${canPreview ? 'cursor-pointer' : ''}`}
                        onClick={() => canPreview && handleResourceClick(resource)}
                      >
                        <div className="aspect-video overflow-hidden relative">
                          {isVideo ? <VideoThumbnail resource={resource} thumbnail={thumbnail} />
                          : isPPTFile ? <PPTThumbnail resource={resource} />
                          : isPDFFile ? <PDFThumbnail resource={resource} />
                          : thumbnail ? <img src={thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          : <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"><FileText className="w-12 h-12 text-gray-300" /></div>}

                          <div className="absolute top-4 left-4">
                            <span
                              className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider backdrop-blur-xl bg-gradient-to-r ${categoryInfo.gradient} text-white shadow-lg border-2 border-white/20`}
                            >
                              {categoryInfo.label}
                            </span>
                          </div>

                          {canPreview && (
                            <div className="absolute top-4 right-4">
                              <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white backdrop-blur-xl text-purple-600 text-xs font-medium border border-gray-200">
                                <Eye className="w-3 h-3" />Preview
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600 transition-colors line-clamp-1 text-gray-900">{resource.title}</h3>
                          {resource.description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>}

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-purple-600" />{formatFileSize(resource.fileSize)}</span>
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{resource.downloadCount || 0}</span>
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            <LikeButton resourceId={resource.id} />
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedCommentResource(resource); }}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <div className="flex-1" />
                            <span className="flex items-center gap-1.5 text-pink-600 text-xs font-medium">
                              <Heart className="w-3 h-3 fill-current" />
                              {resource.likeCount || 0}
                            </span>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white h-12 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
                              onClick={e => { e.stopPropagation(); canPreview ? handleResourceClick(resource) : handleDownload(resource); }}
                            >
                              {canPreview ? <><Eye className="w-4 h-4 mr-2" />Preview</> : <><Download className="w-4 h-4 mr-2" />Download</>}
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-xl border-gray-300 bg-white hover:bg-gray-100 h-12 w-12 p-0"
                              onClick={e => { e.stopPropagation(); handleDownload(resource); }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
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

      {selectedVideo && <VideoModal resource={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      {selectedDocument && <DocumentPreviewModal resource={selectedDocument} onClose={() => setSelectedDocument(null)} />}
      {selectedCommentResource && <CommentsModal resource={selectedCommentResource} onClose={() => setSelectedCommentResource(null)} />}
    </div>
  );
}
