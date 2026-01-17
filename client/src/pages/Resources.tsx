import { useState, useEffect, lazy, Suspense } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Download, Loader2, FileText, Video, ExternalLink, Play, Presentation, Terminal, Cpu, Code, X, Eye, Sparkles, BookOpen, Zap, Heart, MessageCircle, Send, FolderOpen, ChevronDown, ChevronRight, Lock, School, UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";
import { GradientMeshBackground } from "@/components/backgrounds/GradientMeshBackground";
import { SubtleDots } from "@/components/backgrounds/SubtleDots";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Navigation } from "@/components/layout/Navigation";
import { ResourceCardSkeleton } from "@/components/ui/skeleton";

// Lazy load 3D Secure Vault Overlay for performance
const SecureVaultOverlay = lazy(() => import("@/components/3d/SecureVaultOverlay"));

const CATEGORIES = [
  // 📚 수업자료 (모든 강의 자료 통합)
  { value: "lecture", label: "📚 수업자료", icon: BookOpen, color: "#3B82F6", gradient: "from-blue-500 to-purple-500" },
  // 📹 데일리 영상
  { value: "daily_life", label: "📹 데일리영상", icon: Video, color: "#EC4899", gradient: "from-pink-500 to-rose-500" },
];

// 수업자료에 포함되는 카테고리들
const LECTURE_CATEGORIES = ["lecture_c", "lecture_arduino", "lecture_python", "presentation"];

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
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 border-b border-gray-200 bg-white gap-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 ${isPPT ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-red-500 to-pink-500'}`}>
            {isPPT ? <Presentation className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 line-clamp-1">{resource.title}</h3>
            <p className="text-gray-500 text-xs md:text-sm line-clamp-1">{resource.fileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
          <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
            <Button variant="outline" className="rounded-lg md:rounded-xl border-gray-300 text-gray-900 hover:bg-gray-100 h-9 md:h-10 px-3 md:px-4 text-sm"><ExternalLink className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />New Tab</Button>
          </a>
          <a href={resource.fileUrl} download className="flex-1 sm:flex-none">
            <Button className="w-full rounded-lg md:rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white h-9 md:h-10 px-3 md:px-4 text-sm"><Download className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />Download</Button>
          </a>
          <button onClick={onClose} className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 flex-shrink-0"><X className="w-4 h-4 md:w-5 md:h-5 text-gray-900" /></button>
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
  const { data: likeStatus } = trpc.likes.get.useQuery({ resourceId });
  const toggleLike = trpc.likes.toggle.useMutation({
    onSuccess: () => {
      utils.likes.get.invalidate({ resourceId });
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
      className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-full transition-all ${likeStatus?.userLiked
        ? "bg-pink-100 text-pink-600 hover:bg-pink-200"
        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
    >
      <Heart className={`w-3 h-3 md:w-4 md:h-4 ${likeStatus?.userLiked ? "fill-current" : ""}`} />
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
      content: newComment.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-6" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl md:rounded-3xl overflow-hidden bg-white border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="p-4 md:p-6 border-b border-gray-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Comments</h3>
              <p className="text-gray-500 text-xs md:text-sm line-clamp-1">{resource.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 flex-shrink-0">
            <X className="w-4 h-4 md:w-5 md:h-5 text-gray-900" />
          </button>
        </div>

        <div className="p-4 md:p-6 max-h-[50vh] md:max-h-[60vh] overflow-y-auto flex-1">
          {!comments?.length ? (
            <div className="text-center py-8 md:py-12">
              <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-2 md:mb-3" />
              <p className="text-gray-500 text-sm md:text-base">No comments yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4">
                  <div className="flex items-start justify-between mb-1.5 md:mb-2 gap-2">
                    <span className="text-purple-600 text-xs md:text-sm font-medium">{comment.authorName}</span>
                    <span className="text-gray-400 text-[10px] md:text-xs flex-shrink-0">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 text-xs md:text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-lg md:rounded-xl h-10 md:h-12 text-sm md:text-base"
            />
            <Button
              type="submit"
              disabled={!newComment.trim() || createComment.isPending}
              className="rounded-lg md:rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white h-10 md:h-12 w-10 md:w-auto md:px-6"
            >
              {createComment.isPending ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Send className="w-3 h-3 md:w-4 md:h-4" />}
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
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-6" onClick={onClose}>
      <div className="relative w-full max-w-6xl rounded-2xl md:rounded-3xl overflow-hidden bg-white border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="p-3 md:p-4 border-b border-gray-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 md:gap-4 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0"><Video className="w-5 h-5 md:w-6 md:h-6 text-white" /></div>
            <div className="min-w-0">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 line-clamp-1">{resource.title}</h3>
              {resource.description && <p className="text-gray-500 text-xs md:text-sm line-clamp-1">{resource.description}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 flex-shrink-0"><X className="w-4 h-4 md:w-5 md:h-5 text-gray-900" /></button>
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
  const { data: folders } = trpc.folders.list.useQuery();
  const incrementDownload = trpc.resources.incrementDownload.useMutation();
  const [activeCategory, setActiveCategory] = useState("lecture");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedCommentResource, setSelectedCommentResource] = useState<any>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Member state from localStorage
  const [member, setMember] = useState<{ id: number; name: string; isStudent: boolean; academyName?: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("member");
    if (stored) {
      try {
        setMember(JSON.parse(stored));
      } catch { }
    }
  }, []);

  const isStudent = member?.isStudent === true;

  // 수업자료: 여러 카테고리 통합, 데일리영상: daily_life만
  const filteredResources = resources?.filter(r => {
    if (activeCategory === "lecture") return LECTURE_CATEGORIES.includes(r.category);
    return r.category === activeCategory;
  });
  const filteredFolders = folders?.filter(f => {
    if (activeCategory === "lecture") return LECTURE_CATEGORIES.includes(f.category);
    return f.category === activeCategory;
  });

  // Build folder tree with nested structure
  interface FolderNode {
    id?: number;
    name: string;
    items: any[];
    children: FolderNode[];
    depth: number;
    parentId?: number | null;
  }

  const buildFolderTree = (): FolderNode[] => {
    const folderById = new Map<number, FolderNode>();
    const rootFolders: FolderNode[] = [];

    // Create all folder nodes
    filteredFolders?.forEach(folder => {
      const node: FolderNode = {
        id: folder.id,
        name: folder.name,
        items: [],
        children: [],
        depth: 0,
        parentId: folder.parentId
      };
      folderById.set(folder.id, node);
    });

    // Build tree structure
    filteredFolders?.forEach(folder => {
      const node = folderById.get(folder.id)!;
      if (folder.parentId && folderById.has(folder.parentId)) {
        const parent = folderById.get(folder.parentId)!;
        parent.children.push(node);
        node.depth = parent.depth + 1;
      } else {
        rootFolders.push(node);
      }
    });

    // Add resources to folders by subcategory name
    filteredResources?.forEach(resource => {
      const folderName = resource.subcategory;
      if (folderName) {
        const folder = Array.from(folderById.values()).find(f => f.name === folderName);
        if (folder) {
          folder.items.push(resource);
        }
      }
    });

    // Uncategorized 폴더는 데일리영상에서만 표시
    if (activeCategory === "daily_life") {
      const uncategorizedItems = filteredResources?.filter(r => !r.subcategory) || [];
      if (uncategorizedItems.length > 0) {
        rootFolders.push({
          name: "📹 영상 목록",
          items: uncategorizedItems,
          children: [],
          depth: 0
        });
      }
    }

    // Return only root folders (NOT flattened!) - subfolders are in .children
    return rootFolders;
  };

  const folderTree = buildFolderTree();

  const toggleFolder = (folder: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder);
    } else {
      newExpanded.add(folder);
    }
    setExpandedFolders(newExpanded);
  };

  const handleDownload = async (resource: any) => {
    // Check if user is logged in and is a student
    if (!member) {
      toast.error("로그인이 필요합니다");
      return;
    }
    if (!isStudent) {
      toast.error("수업자료는 코딩쏙학원 강의 학생만 다운로드할 수 있습니다");
      return;
    }

    try {
      await incrementDownload.mutateAsync({ id: resource.id });

      // Use anchor tag with download attribute for reliable file download
      const link = document.createElement('a');
      link.href = resource.fileUrl;
      link.download = resource.fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#12121a] to-[#0a0a1a] text-white overflow-hidden">
      {/* 🔒 3D SECURE VAULT OVERLAY - Premium Lock Screen */}
      {!isStudent && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-black" />}>
          <SecureVaultOverlay
            isAuthenticated={isStudent}
            onUnlockComplete={() => window.location.reload()}
          />
        </Suspense>
      )}
      {/* Dark Neon Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-600/15 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <section className="pt-32 md:pt-36 lg:pt-40 pb-8 md:pb-10 lg:pb-12 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}>
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <p className="text-purple-400 font-medium text-xs md:text-sm tracking-wider uppercase">Learning Materials</p>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Resources
            </h1>
            <p className="text-gray-400 text-base md:text-lg lg:text-xl max-w-2xl">
              Access lecture materials, code samples, presentations, and video tutorials.
              <span className="flex items-center gap-2 text-purple-400 mt-2 md:mt-3 text-sm md:text-base font-medium"><Eye className="w-3 h-3 md:w-4 md:h-4" />Click to preview PPT/PDF files!</span>
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* 🔒 Premium Chain Lock Overlay */}
      {(!member || !isStudent) && (
        <section className="px-4 md:px-8 relative z-10 my-8">
          <div className="max-w-7xl mx-auto">
            {/* Main Container with Chain Border */}
            <div className="relative overflow-hidden rounded-3xl">
              {/* Animated Chain Border */}
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: `
                    repeating-linear-gradient(
                      0deg,
                      transparent 0px,
                      transparent 15px,
                      rgba(120, 120, 120, 0.3) 15px,
                      rgba(120, 120, 120, 0.3) 20px,
                      transparent 20px,
                      transparent 35px
                    ),
                    repeating-linear-gradient(
                      90deg,
                      transparent 0px,
                      transparent 15px,
                      rgba(120, 120, 120, 0.3) 15px,
                      rgba(120, 120, 120, 0.3) 20px,
                      transparent 20px,
                      transparent 35px
                    )
                  `,
                  animation: 'chainMove 3s linear infinite'
                }}
              />

              {/* Dark Gradient Background */}
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 md:p-12 lg:p-16">
                {/* Metallic Glow Effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />

                {/* Chain Links Decoration - Top */}
                <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 opacity-40">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-8 h-4 border-2 border-gray-500 rounded-full" style={{ animation: `chainPulse 2s ease-in-out ${i * 0.1}s infinite` }} />
                  ))}
                </div>

                {/* Chain Links Decoration - Bottom */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-40">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-8 h-4 border-2 border-gray-500 rounded-full" style={{ animation: `chainPulse 2s ease-in-out ${i * 0.1}s infinite` }} />
                  ))}
                </div>

                {/* Main Content */}
                <div className="relative flex flex-col items-center text-center">
                  {/* 3D Animated Padlock */}
                  <div
                    className="relative mb-8"
                    style={{ perspective: '1000px' }}
                  >
                    {/* Glow Ring */}
                    <div
                      className="absolute -inset-8 rounded-full opacity-50"
                      style={{
                        background: 'radial-gradient(circle, rgba(234,179,8,0.4) 0%, transparent 70%)',
                        animation: 'pulseGlow 2s ease-in-out infinite'
                      }}
                    />

                    {/* 3D Padlock Body */}
                    <div
                      className="relative w-32 h-40 md:w-40 md:h-48"
                      style={{
                        transformStyle: 'preserve-3d',
                        animation: 'lockFloat 4s ease-in-out infinite'
                      }}
                    >
                      {/* Lock Shackle (Top Arc) */}
                      <div
                        className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-16 md:w-24 md:h-20 border-8 border-yellow-500 rounded-t-full border-b-0"
                        style={{
                          background: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
                          boxShadow: '0 -5px 20px rgba(251, 191, 36, 0.5), inset 0 2px 10px rgba(255,255,255,0.3)'
                        }}
                      />

                      {/* Lock Body */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-28 md:h-32 rounded-xl"
                        style={{
                          background: 'linear-gradient(145deg, #fbbf24 0%, #b45309 50%, #92400e 100%)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 2px 20px rgba(255,255,255,0.2), inset 0 -5px 20px rgba(0,0,0,0.3)'
                        }}
                      >
                        {/* Keyhole */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div
                            className="w-6 h-6 md:w-8 md:h-8 bg-gray-900 rounded-full"
                            style={{ boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)' }}
                          />
                          <div
                            className="w-3 h-6 md:w-4 md:h-8 bg-gray-900 mx-auto -mt-1"
                            style={{ boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)' }}
                          />
                        </div>

                        {/* Metallic Shine */}
                        <div
                          className="absolute top-2 left-2 right-1/2 bottom-1/2 rounded-tl-xl opacity-30"
                          style={{ background: 'linear-gradient(135deg, white 0%, transparent 50%)' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title with Gradient */}
                  <h2
                    className="text-3xl md:text-4xl lg:text-5xl font-black mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #ffffff 50%, #f59e0b 75%, #fbbf24 100%)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'shimmer 3s linear infinite'
                    }}
                  >
                    🔒 LOCKED CONTENT
                  </h2>

                  {/* Korean Message */}
                  <p className="text-xl md:text-2xl font-bold text-white mb-2">
                    <span className="text-emerald-400">코딩쏙학원</span> 학생들만 이용 가능합니다
                  </p>

                  {/* Subtitle */}
                  <p className="text-gray-400 text-sm md:text-base mb-8 max-w-md">
                    {!member
                      ? "로그인 또는 회원가입 후 수업자료를 다운로드 받으세요."
                      : `현재 학원: ${member.academyName || "미등록"} - 학원 정보를 업데이트해주세요.`
                    }
                  </p>

                  {/* Premium Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {!member ? (
                      <>
                        <Link href="/login">
                          <button className="group relative px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-bold text-lg hover:bg-white/20 transition-all duration-300 overflow-hidden">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <LogIn className="w-5 h-5" />
                              로그인
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          </button>
                        </Link>
                        <Link href="/register">
                          <button className="group relative px-8 py-4 rounded-2xl text-black font-bold text-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #10b981 100%)', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)' }}>
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <UserPlus className="w-5 h-5" />
                              회원가입
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          </button>
                        </Link>
                      </>
                    ) : (
                      <Link href="/profile">
                        <button className="group relative px-8 py-4 rounded-2xl text-black font-bold text-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.4)' }}>
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <School className="w-5 h-5" />
                            학원 등록하기
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CSS Animations */}
          <style>{`
            @keyframes chainMove {
              0% { background-position: 0 0; }
              100% { background-position: 35px 35px; }
            }
            @keyframes chainPulse {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.05); }
            }
            @keyframes pulseGlow {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.1); }
            }
            @keyframes lockFloat {
              0%, 100% { transform: translateY(0) rotateY(-5deg); }
              50% { transform: translateY(-10px) rotateY(5deg); }
            }
            @keyframes shimmer {
              0% { background-position: 0% 50%; }
              100% { background-position: 200% 50%; }
            }
          `}</style>
        </section>
      )}

      {/* Filter */}
      <section className="py-4 md:py-6 lg:py-8 sticky top-16 md:top-20 lg:top-24 z-40 bg-[#12121a]/80 backdrop-blur-xl border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <AnimatedSection delay={100}>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                const isActive = activeCategory === category.value;
                return (
                  <button
                    key={category.value}
                    onClick={() => setActiveCategory(category.value)}
                    className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 lg:py-3 rounded-full text-xs md:text-sm font-medium transition-all border-2 ${isActive
                      ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg border-transparent`
                      : "bg-white/5 text-gray-400 border-white/10 hover:border-purple-500/50 hover:text-purple-400"
                      }`}
                  >
                    <Icon className="w-3 h-3 md:w-4 md:h-4" /><span className="hidden sm:inline">{category.label}</span><span className="sm:hidden">{category.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Grid */}
      <section className="py-8 md:py-10 lg:py-12 pb-20 md:pb-24 lg:pb-32 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            // 🎭 SKELETON UI - Premium loading experience
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <ResourceCardSkeleton key={i} />
              ))}
            </div>
          ) : !filteredResources?.length ? (
            <div className="text-center py-32">
              <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">No resources found</h3>
            </div>
          ) : (
            <div className="space-y-6">
              {folderTree.map((folder) => {
                const folderKey = folder.id ? `folder_${folder.id}` : folder.name;
                const isExpanded = expandedFolders.has(folderKey);
                const resourceCount = folder.items.length;
                const hasSubfolders = folder.children.length > 0;

                return (
                  <div
                    key={folderKey}
                    className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl overflow-hidden shadow-lg"
                  >
                    {/* Folder Header */}
                    <button
                      onClick={() => toggleFolder(folderKey)}
                      className="w-full p-5 md:p-6 flex items-center justify-between hover:bg-white/80 transition-all group"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                          <FolderOpen className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {folder.name.startsWith('📄') ? folder.name : `📁 ${folder.name}`}
                          </h3>
                          <p className="text-gray-500 text-sm md:text-base">
                            {resourceCount} {resourceCount === 1 ? 'file' : 'files'}
                            {hasSubfolders && `, ${folder.children.length} subfolder${folder.children.length > 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-6 h-6 text-purple-600" />
                        ) : (
                          <ChevronRight className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Folder Contents */}
                    {isExpanded && (
                      <div className="p-4 md:p-6 pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                          {folder.items.map((resource: any, index: number) => {
                            const thumbnail = resource.thumbnailUrl || (isYouTubeUrl(resource.fileUrl) ? getYouTubeThumbnail(resource.fileUrl) : null);
                            const isVideo = isYouTubeUrl(resource.fileUrl) || resource.mimeType?.startsWith('video/');
                            const isPPTFile = isPPT(resource.mimeType || '', resource.fileName || '');
                            const isPDFFile = isPDF(resource.mimeType || '', resource.fileName || '');
                            const canPreview = isVideo || isPPTFile || isPDFFile;
                            const categoryInfo = getCategoryInfo(resource.category);

                            return (
                              <AnimatedSection key={resource.id} delay={index * 50}>
                                <TiltCard>
                                  <div
                                    className={`group rounded-2xl md:rounded-3xl overflow-hidden bg-white border border-gray-200 hover:border-purple-300 transition-all duration-500 hover:shadow-2xl ${canPreview ? 'cursor-pointer' : ''}`}
                                    onClick={() => canPreview && handleResourceClick(resource)}
                                  >
                                    <div className="aspect-video overflow-hidden relative">
                                      {isVideo ? <VideoThumbnail resource={resource} thumbnail={thumbnail} />
                                        : isPPTFile ? <PPTThumbnail resource={resource} />
                                          : isPDFFile ? <PDFThumbnail resource={resource} />
                                            : thumbnail ? <img src={thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                              : <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"><FileText className="w-12 h-12 text-gray-300" /></div>}

                                      <div className="absolute top-2 md:top-3 lg:top-4 left-2 md:left-3 lg:left-4">
                                        <span
                                          className={`px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-full text-[10px] md:text-xs font-medium uppercase tracking-wider backdrop-blur-xl bg-gradient-to-r ${categoryInfo.gradient} text-white shadow-lg border-2 border-white/20`}
                                        >
                                          {categoryInfo.label}
                                        </span>
                                      </div>

                                      {canPreview && (
                                        <div className="absolute top-2 md:top-3 lg:top-4 right-2 md:right-3 lg:right-4">
                                          <span className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 lg:py-2 rounded-full bg-white backdrop-blur-xl text-purple-600 text-[10px] md:text-xs font-medium border border-gray-200">
                                            <Eye className="w-2.5 h-2.5 md:w-3 md:h-3" />Preview
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="p-4 md:p-5 lg:p-6">
                                      <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 group-hover:text-purple-600 transition-colors line-clamp-1 text-gray-900">{resource.title}</h3>
                                      {resource.description && <p className="text-gray-600 text-sm md:text-base mb-3 md:mb-4 line-clamp-2">{resource.description}</p>}

                                      <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-500 mb-3 md:mb-4">
                                        <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-600" />{formatFileSize(resource.fileSize)}</span>
                                        <span className="flex items-center gap-1"><Download className="w-2.5 h-2.5 md:w-3 md:h-3" />{resource.downloadCount || 0}</span>
                                      </div>

                                      <div className="flex items-center gap-2 mb-3 md:mb-4">
                                        <LikeButton resourceId={resource.id} />
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setSelectedCommentResource(resource); }}
                                          className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                                        >
                                          <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                                        </button>
                                        <div className="flex-1" />
                                        <span className="flex items-center gap-1 md:gap-1.5 text-pink-600 text-[10px] md:text-xs font-medium">
                                          <Heart className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                                          {resource.downloadCount || 0}
                                        </span>
                                      </div>

                                      <div className="flex gap-2 md:gap-3">
                                        <Button
                                          className="flex-1 rounded-lg md:rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white h-10 md:h-12 text-sm md:text-base shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
                                          onClick={e => { e.stopPropagation(); canPreview ? handleResourceClick(resource) : handleDownload(resource); }}
                                        >
                                          {canPreview ? <><Eye className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />Preview</> : <><Download className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />Download</>}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="rounded-lg md:rounded-xl border-gray-300 bg-white hover:bg-gray-100 h-10 md:h-12 w-10 md:w-12 p-0"
                                          onClick={e => { e.stopPropagation(); handleDownload(resource); }}
                                        >
                                          <Download className="w-3 h-3 md:w-4 md:h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </TiltCard>
                              </AnimatedSection>
                            );
                          })}
                        </div>

                        {/* Subfolders inside parent */}
                        {hasSubfolders && (
                          <div className="mt-6 space-y-4">
                            {folder.children.map((subfolder) => {
                              const subfolderKey = subfolder.id ? `folder_${subfolder.id}` : subfolder.name;
                              const isSubExpanded = expandedFolders.has(subfolderKey);
                              const subResourceCount = subfolder.items.length;

                              return (
                                <div key={subfolderKey} className="bg-white/50 border border-gray-200/40 rounded-2xl overflow-hidden ml-4">
                                  {/* Subfolder Header */}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleFolder(subfolderKey); }}
                                    className="w-full p-4 flex items-center justify-between hover:bg-white/70 transition-all group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-purple-400 text-lg">↳</span>
                                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow">
                                        <FolderOpen className="w-5 h-5 text-white" />
                                      </div>
                                      <div className="text-left">
                                        <h4 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                          📂 {subfolder.name}
                                        </h4>
                                        <p className="text-gray-500 text-sm">{subResourceCount} files</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center">
                                      {isSubExpanded ? (
                                        <ChevronDown className="w-5 h-5 text-blue-600" />
                                      ) : (
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                      )}
                                    </div>
                                  </button>

                                  {/* Subfolder Contents */}
                                  {isSubExpanded && subfolder.items.length > 0 && (
                                    <div className="p-4 pt-0">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {subfolder.items.map((resource: any) => {
                                          const canPreview = isYouTubeUrl(resource.fileUrl) || resource.mimeType?.startsWith('video/') || isPPT(resource.mimeType || '', resource.fileName || '') || isPDF(resource.mimeType || '', resource.fileName || '');

                                          return (
                                            <div
                                              key={resource.id}
                                              className={`p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all ${canPreview ? 'cursor-pointer' : ''}`}
                                              onClick={() => canPreview && handleResourceClick(resource)}
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                  <FileText className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <p className="font-medium text-gray-900 truncate text-sm">{resource.title}</p>
                                                  <p className="text-xs text-gray-500 truncate">{resource.fileName}</p>
                                                </div>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-8 w-8 p-0"
                                                  onClick={(e) => { e.stopPropagation(); handleDownload(resource); }}
                                                >
                                                  <Download className="w-4 h-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
          }
        </div>
      </section>

      {selectedVideo && <VideoModal resource={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      {selectedDocument && <DocumentPreviewModal resource={selectedDocument} onClose={() => setSelectedDocument(null)} />}
      {selectedCommentResource && <CommentsModal resource={selectedCommentResource} onClose={() => setSelectedCommentResource(null)} />}
    </div>
  );
}
