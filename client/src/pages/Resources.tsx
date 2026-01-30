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
import { ResourceCardSkeleton } from "@/components/ui/skeleton";
import "../styles/dopple-v4.css";

// Supreme Quantum Logo
function SupremeLogo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} xmlns="http://www.w3.org/2000/svg">
      <style>{`
                @keyframes spin1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes spin2 { from { transform: rotate(120deg); } to { transform: rotate(480deg); } }
                @keyframes spin3 { from { transform: rotate(240deg); } to { transform: rotate(600deg); } }
                @keyframes pulse { 0%, 100% { opacity: 0.7; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
            `}</style>
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4361EE" />
          <stop offset="50%" stopColor="#7B2FFF" />
          <stop offset="100%" stopColor="#00D9FF" />
        </linearGradient>
      </defs>
      <g transform="translate(50,50)">
        <ellipse rx="35" ry="12" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.6" style={{ animation: 'spin1 8s linear infinite', transformOrigin: 'center' }} />
        <ellipse rx="35" ry="12" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.6" style={{ animation: 'spin2 8s linear infinite', transformOrigin: 'center' }} />
        <ellipse rx="35" ry="12" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.6" style={{ animation: 'spin3 8s linear infinite', transformOrigin: 'center' }} />
        <circle r="12" fill="url(#grad1)" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
        <circle r="6" fill="white" opacity="0.9" />
      </g>
    </svg>
  );
}

// Dopple Header Component
function DoppleHeader() {
  return (
    <header className="dp4-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <Link href="/" className="dp4-logo">
        <SupremeLogo size={70} />
      </Link>
      <nav className="dp4-nav">
        <Link href="/">PROJECTS</Link>
        <Link href="/resources">RESOURCES</Link>
        <a href="https://github.com/ProCodeJH" target="_blank">BLOG</a>
      </nav>
      <a href="mailto:contact@jahyeon.com" className="dp4-send">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 2L11 13" />
          <polygon points="22,2 15,22 11,13 2,9" />
        </svg>
      </a>
    </header>
  );
}

// Messenger Widget Component
function MessengerWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:contact@jahyeon.com?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setIsOpen(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 2000);
  };

  return (
    <>
      <button className="messenger-bubble" onClick={() => setIsOpen(!isOpen)} aria-label="Open messenger">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
      {isOpen && (
        <div className="messenger-modal">
          <div className="messenger-header">
            <span>💬 메시지 보내기</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          {sent ? (
            <div className="messenger-sent"><span>✅</span><p>메일 앱이 열립니다!</p></div>
          ) : (
            <form onSubmit={handleSubmit} className="messenger-form">
              <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required />
              <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <textarea placeholder="메시지를 입력하세요..." value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} />
              <button type="submit" className="messenger-send">
                <span>보내기</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><polygon points="22,2 15,22 11,13 2,9" /></svg>
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}

// Lazy load 3D Secure Vault Overlay for performance
const SecureVaultOverlay = lazy(() => import("@/components/3d/SecureVaultOverlay"));

const CATEGORIES = [
  // 📚 수업자료 (모든 강의 자료 통합)
  { value: "lecture", label: "📚 수업자료", icon: BookOpen, color: "#3B82F6", gradient: "from-blue-500 to-purple-500" },
  // 📹 데일리 영상
  { value: "daily_life", label: "📹 데일리영상", icon: Video, color: "#EC4899", gradient: "from-pink-500 to-rose-500" },
];

// 수업자료에 포함되는 카테고리 (기존 데이터 호환성 유지)
const LECTURE_CATEGORIES = ["lecture_c", "lecture_arduino", "lecture_python", "presentation", "lecture_materials"];

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
      toast.info(`다운로드 준비 중...`);

      // Fetch file as blob for cross-origin download
      const response = await fetch(resource.fileUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = resource.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      toast.success(`다운로드 완료: ${resource.fileName}`);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(resource.fileUrl, '_blank');
      toast.info("새 탭에서 열었습니다. 직접 다운로드해주세요.");
    }
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
    <div className="min-h-screen bg-midnight text-frost overflow-hidden">
      {/* 🔒 3D SECURE VAULT OVERLAY - Premium Lock Screen */}
      {!isStudent && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-midnight" />}>
          <SecureVaultOverlay
            isAuthenticated={isStudent}
            onUnlockComplete={() => window.location.reload()}
          />
        </Suspense>
      )}
      {/* Midnight Neon Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight via-midnight-card to-midnight" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-electric/10 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-indigo/15 rounded-full blur-[150px]" style={{ animation: 'pulse 4s ease-in-out infinite alternate' }} />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[120px]" style={{ animation: 'pulse 3s ease-in-out infinite alternate-reverse' }} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      </div>

      {/* Dopple Header */}
      <DoppleHeader />

      {/* Header */}
      <section className="pt-32 md:pt-36 lg:pt-40 pb-8 md:pb-10 lg:pb-12 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-electric/10 via-accent-cyan/10 to-accent-indigo/10 border border-electric/30 backdrop-blur-xl mb-8 shadow-[0_0_60px_rgba(0,255,136,0.2)]">
              <BookOpen className="w-5 h-5 text-electric" />
              <span className="font-[family-name:var(--font-mono)] text-sm text-frost tracking-wider uppercase">Learning Materials</span>
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 md:mb-6" style={{ textShadow: '0 0 80px rgba(0,255,136,0.4)' }}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric via-accent-cyan to-electric">
                Resources
              </span>
            </h1>
            <p className="font-[family-name:var(--font-body)] text-frost-muted text-base md:text-lg lg:text-xl max-w-2xl">
              Access lecture materials, code samples, presentations, and video tutorials.
              <span className="flex items-center gap-2 text-electric mt-2 md:mt-3 text-sm md:text-base font-[family-name:var(--font-mono)]"><Eye className="w-3 h-3 md:w-4 md:h-4" />Click to preview PPT/PDF files!</span>
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
      <section className="py-4 md:py-6 lg:py-8 sticky top-16 md:top-20 lg:top-24 z-40 bg-midnight/90 backdrop-blur-xl border-y border-electric/10">
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
                    className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 lg:py-3 rounded-full font-[family-name:var(--font-mono)] text-xs md:text-sm font-medium transition-all border ${isActive
                      ? "bg-electric text-midnight border-electric shadow-[0_0_30px_rgba(0,255,136,0.3)]"
                      : "bg-midnight-card/50 text-frost-muted border-midnight-border hover:border-electric/50 hover:text-electric"
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

      {/* CSS Animations for Ultra Premium Folders */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes folderFloat {
          0%, 100% { transform: rotateY(-5deg) translateY(0); }
          50% { transform: rotateY(-5deg) translateY(-3px); }
        }
        @keyframes folderSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

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
          ) : !folderTree.length && !filteredResources?.length ? (
            <div className="text-center py-32">
              <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">No resources found</h3>
            </div>
          ) : activeCategory === "daily_life" ? (
            /* 데일리 영상: 폴더 없이 영상만 직접 표시 */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filteredResources?.map((resource, idx) => {
                const isVideo = isYouTubeUrl(resource.fileUrl) || resource.mimeType?.startsWith('video/');
                const thumbUrl = resource.thumbnailUrl || (isYouTubeUrl(resource.fileUrl) ? getYouTubeThumbnail(resource.fileUrl) : null);
                const categoryInfo = getCategoryInfo(resource.category);

                return (
                  <div
                    key={resource.id}
                    className="group relative bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,255,136,0.1)] hover:shadow-[0_0_60px_rgba(0,255,136,0.2)] transition-all duration-500"
                    style={{ animation: `folderSlideIn 0.5s ease-out ${idx * 0.05}s both` }}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-black/50 overflow-hidden">
                      {thumbUrl ? (
                        <img src={thumbUrl} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <Play className="w-12 h-12 text-white/30" />
                        </div>
                      )}

                      {/* Play overlay */}
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-black ml-1" />
                          </div>
                        </div>
                      )}

                      {/* Category badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-xs font-bold rounded-lg" style={{ backgroundColor: categoryInfo.color, color: 'white' }}>
                          {categoryInfo.label}
                        </span>
                      </div>

                      {/* Preview button */}
                      <button
                        onClick={() => handleResourceClick(resource)}
                        className="absolute top-3 right-3 px-3 py-1 bg-electric/90 text-black text-xs font-bold rounded-lg hover:bg-electric transition-colors"
                      >
                        ⊙ Preview
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-white font-bold text-lg truncate mb-1">{resource.title}</h3>
                      <p className="text-white/40 text-sm flex items-center gap-2">
                        <span>✦ {formatFileSize(resource.fileSize)}</span>
                        <span>⬇ {resource.downloadCount || 0}</span>
                        <span className="ml-auto text-electric">♥ {resource.likeCount || 0}</span>
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <Heart className="w-4 h-4 text-white/60" />
                        </button>
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <MessageCircle className="w-4 h-4 text-white/60" />
                        </button>
                        <button
                          onClick={() => handleResourceClick(resource)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-electric hover:bg-electric/80 text-black font-bold rounded-xl transition-all"
                        >
                          ⊙ Preview
                        </button>
                        <button
                          onClick={() => handleDownload(resource)}
                          className="p-2 rounded-lg bg-electric/20 hover:bg-electric/30 transition-colors"
                        >
                          <Download className="w-4 h-4 text-electric" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {folderTree.map((folder, folderIndex) => {
                const folderKey = folder.id ? `folder_${folder.id}` : folder.name;
                const isExpanded = expandedFolders.has(folderKey);
                const resourceCount = folder.items.length;
                const hasSubfolders = folder.children.length > 0;

                return (
                  <div
                    key={folderKey}
                    className="group relative"
                    style={{
                      animation: `folderSlideIn 0.5s ease-out ${folderIndex * 0.1}s both`
                    }}
                  >
                    {/* Animated Gradient Border */}
                    <div
                      className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(135deg, #00ff88, #00d4ff, #6366f1, #00ff88)',
                        backgroundSize: '300% 300%',
                        animation: 'gradientShift 3s ease infinite'
                      }}
                    />

                    {/* Main Card */}
                    <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,255,136,0.1)] group-hover:shadow-[0_0_60px_rgba(0,255,136,0.2)] transition-all duration-500">

                      {/* Scanline Effect */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        style={{
                          background: 'linear-gradient(180deg, transparent 0%, rgba(0,255,136,0.03) 50%, transparent 100%)',
                          backgroundSize: '100% 4px',
                          animation: 'scanline 8s linear infinite'
                        }}
                      />

                      {/* Folder Header */}
                      <button
                        onClick={() => toggleFolder(folderKey)}
                        className="w-full p-5 md:p-6 flex items-center justify-between hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center gap-4 md:gap-5">
                          {/* 3D Holographic Folder Icon */}
                          <div
                            className="relative w-14 h-14 md:w-16 md:h-16"
                            style={{ perspective: '200px' }}
                          >
                            {/* Glow Ring */}
                            <div
                              className="absolute -inset-2 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity"
                              style={{
                                background: 'radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%)',
                                animation: 'pulseGlow 2s ease-in-out infinite'
                              }}
                            />

                            {/* Folder Container */}
                            <div
                              className="relative w-full h-full rounded-2xl bg-gradient-to-br from-electric/30 via-accent-cyan/20 to-accent-indigo/30 border border-electric/40 flex items-center justify-center shadow-[0_0_25px_rgba(0,255,136,0.3)] group-hover:shadow-[0_0_35px_rgba(0,255,136,0.5)] transition-all duration-500"
                              style={{
                                transform: 'rotateY(-5deg)',
                                transformStyle: 'preserve-3d',
                                animation: 'folderFloat 3s ease-in-out infinite'
                              }}
                            >
                              {/* Folder Icon with Glow */}
                              <FolderOpen className="w-7 h-7 md:w-8 md:h-8 text-electric drop-shadow-[0_0_10px_rgba(0,255,136,0.8)]" />

                              {/* File Count Badge */}
                              <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-electric flex items-center justify-center shadow-[0_0_10px_rgba(0,255,136,0.6)]">
                                <span className="text-[10px] md:text-xs font-black text-midnight">{resourceCount}</span>
                              </div>
                            </div>
                          </div>

                          {/* Folder Info */}
                          <div className="text-left">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white group-hover:text-electric transition-all" style={{ textShadow: '0 0 30px rgba(0,255,136,0.4)' }}>
                              {folder.name}
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="px-3 py-1 rounded-lg bg-electric/20 text-electric text-sm font-bold font-mono border border-electric/40 shadow-[0_0_10px_rgba(0,255,136,0.2)]">
                                {resourceCount} {resourceCount === 1 ? 'FILE' : 'FILES'}
                              </span>
                              {hasSubfolders && (
                                <span className="px-3 py-1 rounded-lg bg-accent-cyan/20 text-accent-cyan text-sm font-bold font-mono border border-accent-cyan/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                                  {folder.children.length} SUBDIR
                                </span>
                              )}
                              <span className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                                <div className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
                                READY
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expand/Collapse Button */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-electric/20 border border-electric/40' : 'bg-white/5 border border-white/10'}`}>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-electric" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
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
                                      className={`group rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] border border-white/10 hover:border-electric/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,255,136,0.2)] ${canPreview ? 'cursor-pointer' : ''}`}
                                      onClick={() => canPreview && handleResourceClick(resource)}
                                    >
                                      <div className="aspect-video overflow-hidden relative">
                                        {isVideo ? <VideoThumbnail resource={resource} thumbnail={thumbnail} />
                                          : isPPTFile ? <PPTThumbnail resource={resource} />
                                            : isPDFFile ? <PDFThumbnail resource={resource} />
                                              : thumbnail ? <img src={thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                : <div className="w-full h-full bg-gradient-to-br from-midnight-card to-midnight flex items-center justify-center"><FileText className="w-12 h-12 text-frost-muted" /></div>}

                                        <div className="absolute top-2 md:top-3 lg:top-4 left-2 md:left-3 lg:left-4">
                                          <span
                                            className={`px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-full text-[10px] md:text-xs font-medium uppercase tracking-wider backdrop-blur-xl bg-gradient-to-r ${categoryInfo.gradient} text-white shadow-lg border-2 border-white/20`}
                                          >
                                            {categoryInfo.label}
                                          </span>
                                        </div>

                                        {canPreview && (
                                          <div className="absolute top-2 md:top-3 lg:top-4 right-2 md:right-3 lg:right-4">
                                            <span className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 lg:py-2 rounded-full bg-electric/20 backdrop-blur-xl text-electric text-[10px] md:text-xs font-medium border border-electric/40">
                                              <Eye className="w-2.5 h-2.5 md:w-3 md:h-3" />Preview
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="p-4 md:p-5 lg:p-6">
                                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-electric transition-all line-clamp-1" style={{ textShadow: '0 0 15px rgba(0,255,136,0.3)' }}>{resource.title}</h3>
                                        {resource.description && <p className="text-frost-muted text-sm md:text-base mb-3 md:mb-4 line-clamp-2 leading-relaxed">{resource.description}</p>}

                                        <div className="flex items-center justify-between text-[10px] md:text-xs text-frost-muted mb-3 md:mb-4">
                                          <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5 md:w-3 md:h-3 text-electric" />{formatFileSize(resource.fileSize)}</span>
                                          <span className="flex items-center gap-1"><Download className="w-2.5 h-2.5 md:w-3 md:h-3 text-accent-cyan" />{resource.downloadCount || 0}</span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                                          <LikeButton resourceId={resource.id} />
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedCommentResource(resource); }}
                                            className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-full bg-white/10 text-frost-muted hover:bg-white/20 hover:text-frost transition-all"
                                          >
                                            <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                                          </button>
                                          <div className="flex-1" />
                                          <span className="flex items-center gap-1 md:gap-1.5 text-accent-indigo text-[10px] md:text-xs font-medium">
                                            <Heart className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                                            {resource.downloadCount || 0}
                                          </span>
                                        </div>

                                        <div className="flex gap-2 md:gap-3">
                                          <Button
                                            className="flex-1 rounded-lg md:rounded-xl bg-gradient-to-r from-electric to-accent-cyan text-midnight h-10 md:h-12 text-sm md:text-base font-bold shadow-lg shadow-electric/30 hover:shadow-electric/50 transition-all"
                                            onClick={e => { e.stopPropagation(); canPreview ? handleResourceClick(resource) : handleDownload(resource); }}
                                          >
                                            {canPreview ? <><Eye className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />Preview</> : <><Download className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />Download</>}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            className="rounded-lg md:rounded-xl border-electric/40 bg-electric/10 hover:bg-electric/20 text-electric h-10 md:h-12 w-10 md:w-12 p-0"
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
                                  <div key={subfolderKey} className="bg-gradient-to-br from-[#0a0a0a]/80 via-[#111]/80 to-[#0a0a0a]/80 border border-electric/20 rounded-2xl overflow-hidden ml-4 backdrop-blur-sm hover:border-electric/40 transition-all">
                                    {/* Subfolder Header */}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); toggleFolder(subfolderKey); }}
                                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-electric text-lg">↳</span>
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-electric/30 to-accent-cyan/30 border border-electric/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                                          <FolderOpen className="w-5 h-5 text-electric" />
                                        </div>
                                        <div className="text-left">
                                          <h4 className="text-xl md:text-2xl font-bold text-white group-hover:text-electric transition-all" style={{ textShadow: '0 0 20px rgba(0,255,136,0.3)' }}>
                                            {subfolder.name}
                                          </h4>
                                          <p className="text-frost-muted text-sm mt-1">
                                            <span className="text-electric font-bold">{subResourceCount}</span> files
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center">
                                        {isSubExpanded ? (
                                          <ChevronDown className="w-5 h-5 text-electric" />
                                        ) : (
                                          <ChevronRight className="w-5 h-5 text-frost-muted group-hover:text-frost transition-colors" />
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
                                                className={`p-3 bg-midnight/50 rounded-xl border border-white/10 hover:border-electric/40 transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] ${canPreview ? 'cursor-pointer' : ''}`}
                                                onClick={() => canPreview && handleResourceClick(resource)}
                                              >
                                                <div className="flex items-center gap-3">
                                                  <div className="w-10 h-10 rounded-lg bg-electric/10 border border-electric/20 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-5 h-5 text-electric" />
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-white truncate text-base group-hover:text-electric transition-colors" style={{ textShadow: '0 0 8px rgba(0,255,136,0.2)' }}>{resource.title}</p>
                                                    <p className="text-xs text-frost-muted truncate mt-0.5">{resource.fileName}</p>
                                                  </div>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-electric hover:bg-electric/20 hover:text-electric"
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedVideo && <VideoModal resource={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      {selectedDocument && <DocumentPreviewModal resource={selectedDocument} onClose={() => setSelectedDocument(null)} />}
      {selectedCommentResource && <CommentsModal resource={selectedCommentResource} onClose={() => setSelectedCommentResource(null)} />}

      {/* Dopple Footer */}
      <footer className="dp4-footer" style={{ position: 'relative', zIndex: 10 }}>
        <nav className="dp4-footer-nav">
          <Link href="/">PROJECTS</Link>
          <Link href="/resources">RESOURCES</Link>
          <a href="https://github.com/ProCodeJH">GITHUB</a>
          <a href="mailto:contact@jahyeon.com">CONTACT</a>
        </nav>
        <p>© 2024 Gu Jahyeon. Embedded Developer & Educator.</p>
      </footer>

      {/* Messenger Widget */}
      <MessengerWidget />
    </div>
  );
}
