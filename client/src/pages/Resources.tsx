import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Download, Loader2, FileText, Video, ExternalLink, Play, Presentation, X, Eye, BookOpen, Zap, Heart, MessageCircle, Send, FolderOpen, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
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

// Messenger Widget
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

const CATEGORIES = [
  { value: "lecture", label: "📚 수업자료", icon: BookOpen, color: "#4361EE" },
  { value: "daily_life", label: "📹 데일리영상", icon: Video, color: "#EC4899" },
];

const LECTURE_CATEGORIES = ["lecture_c", "lecture_arduino", "lecture_python", "presentation", "lecture_materials"];

// PPT Thumbnail Component
function PPTThumbnail({ resource }: { resource: any }) {
  if (resource.thumbnailUrl) {
    return <img src={resource.thumbnailUrl} alt={resource.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #ff9a56, #ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Presentation style={{ width: 48, height: 48, color: 'white' }} />
    </div>
  );
}

// PDF Thumbnail Component
function PDFThumbnail({ resource }: { resource: any }) {
  if (resource.thumbnailUrl) {
    return <img src={resource.thumbnailUrl} alt={resource.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <FileText style={{ width: 48, height: 48, color: 'white' }} />
    </div>
  );
}

// Video Thumbnail Component
function VideoThumbnail({ resource, thumbnail }: { resource: any; thumbnail: string | null }) {
  if (thumbnail) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <img src={thumbnail} alt={resource.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ width: 56, height: 56, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <Play style={{ width: 24, height: 24, color: '#333', marginLeft: 4 }} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #7B2FFF, #4361EE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Play style={{ width: 48, height: 48, color: 'white', marginLeft: 4 }} />
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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column' }} onClick={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'white', borderBottom: '1px solid #eee' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: isPPT ? 'linear-gradient(135deg, #ff9a56, #ff6b6b)' : 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isPPT ? <Presentation style={{ width: 24, height: 24, color: 'white' }} /> : <FileText style={{ width: 24, height: 24, color: 'white' }} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>{resource.title}</h3>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>{resource.fileName}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href={resource.fileUrl} download>
            <Button style={{ background: 'linear-gradient(135deg, #4361EE, #7B2FFF)', color: 'white', borderRadius: 12 }}>
              <Download style={{ width: 16, height: 16, marginRight: 8 }} />Download
            </Button>
          </a>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 12, background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: 20, height: 20, color: '#333' }} />
          </button>
        </div>
      </div>
      <div style={{ flex: 1, background: '#f5f5f5', position: 'relative' }} onClick={e => e.stopPropagation()}>
        {loading && !error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', zIndex: 10 }}>
            <Loader2 style={{ width: 48, height: 48, color: '#4361EE', animation: 'spin 1s linear infinite' }} />
          </div>
        )}
        {error ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
            <FileText style={{ width: 64, height: 64, color: '#ddd' }} />
            <p style={{ color: '#888' }}>Preview not available</p>
            <a href={resource.fileUrl} download>
              <Button style={{ background: 'linear-gradient(135deg, #4361EE, #7B2FFF)', color: 'white', borderRadius: 12 }}>
                <Download style={{ width: 16, height: 16, marginRight: 8 }} />Download
              </Button>
            </a>
          </div>
        ) : isPPT ? (
          <iframe src={getOfficePreviewUrl(resource.fileUrl)} style={{ width: '100%', height: '100%', border: 'none', background: 'white' }} onLoad={() => setLoading(false)} onError={() => { setLoading(false); setError(true); }} />
        ) : (
          <iframe src={getGooglePreviewUrl(resource.fileUrl)} style={{ width: '100%', height: '100%', border: 'none' }} onLoad={() => setLoading(false)} onError={() => { setLoading(false); setError(true); }} />
        )}
      </div>
    </div>
  );
}

// Video Modal
function VideoModal({ resource, onClose }: { resource: any; onClose: () => void }) {
  const getYouTubeId = (url: string) => url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)?.[1];
  const isYouTubeUrl = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 1000, background: 'white', borderRadius: 24, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #7B2FFF, #4361EE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video style={{ width: 20, height: 20, color: 'white' }} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>{resource.title}</h3>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 18, background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: 18, height: 18, color: '#333' }} />
          </button>
        </div>
        <div style={{ aspectRatio: '16/9', background: 'black' }}>
          {isYouTubeUrl(resource.fileUrl) ? (
            <iframe src={`https://www.youtube.com/embed/${getYouTubeId(resource.fileUrl)}?autoplay=1`} style={{ width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : (
            <video controls autoPlay style={{ width: '100%', height: '100%' }}><source src={resource.fileUrl} type={resource.mimeType} /></video>
          )}
        </div>
      </div>
    </div>
  );
}

// Comments Modal
function CommentsModal({ resource, onClose }: { resource: any; onClose: () => void }) {
  const [newComment, setNewComment] = useState("");
  const { data: comments, refetch } = trpc.comments.list.useQuery({ resourceId: resource.id });
  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => { refetch(); setNewComment(""); toast.success("댓글이 추가되었습니다!"); },
    onError: () => toast.error("댓글 추가 실패"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createComment.mutate({ resourceId: resource.id, content: newComment.trim() });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 600, maxHeight: '80vh', background: 'white', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: 20, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #4361EE, #7B2FFF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle style={{ width: 20, height: 20, color: 'white' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>댓글</h3>
              <p style={{ fontSize: '0.85rem', color: '#888' }}>{resource.title}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 18, background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: 18, height: 18, color: '#333' }} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {!comments?.length ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
              <MessageCircle style={{ width: 48, height: 48, opacity: 0.3, margin: '0 auto 12px' }} />
              <p>첫 댓글을 남겨보세요!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {comments.map((comment: any) => (
                <div key={comment.id} style={{ background: '#f8f8f8', padding: 16, borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: '#4361EE', fontSize: '0.9rem' }}>{comment.authorName}</span>
                    <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: '#555', fontSize: '0.9rem' }}>{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: 20, borderTop: '1px solid #eee' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12 }}>
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              style={{ flex: 1, borderRadius: 12, height: 44 }}
            />
            <Button type="submit" disabled={!newComment.trim() || createComment.isPending} style={{ borderRadius: 12, height: 44, width: 44, padding: 0, background: 'linear-gradient(135deg, #4361EE, #7B2FFF)', color: 'white' }}>
              {createComment.isPending ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: 18, height: 18 }} />}
            </Button>
          </form>
        </div>
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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        borderRadius: 20,
        border: 'none',
        background: likeStatus?.userLiked ? '#ffe4e6' : '#f0f0f0',
        color: likeStatus?.userLiked ? '#ec4899' : '#888',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <Heart style={{ width: 16, height: 16, fill: likeStatus?.userLiked ? '#ec4899' : 'transparent' }} />
    </button>
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

  const filteredResources = resources?.filter(r => {
    if (activeCategory === "lecture") return LECTURE_CATEGORIES.includes(r.category);
    return r.category === activeCategory;
  });
  const filteredFolders = folders?.filter(f => {
    if (activeCategory === "lecture") return LECTURE_CATEGORIES.includes(f.category);
    return f.category === activeCategory;
  });

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

    filteredFolders?.forEach(folder => {
      const node: FolderNode = { id: folder.id, name: folder.name, items: [], children: [], depth: 0, parentId: folder.parentId };
      folderById.set(folder.id, node);
    });

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

    filteredResources?.forEach(resource => {
      const folderName = resource.subcategory;
      if (folderName) {
        const folder = Array.from(folderById.values()).find(f => f.name === folderName);
        if (folder) folder.items.push(resource);
      }
    });

    if (activeCategory === "daily_life") {
      const uncategorizedItems = filteredResources?.filter(r => !r.subcategory) || [];
      if (uncategorizedItems.length > 0) {
        rootFolders.push({ name: "📹 영상 목록", items: uncategorizedItems, children: [], depth: 0 });
      }
    }

    return rootFolders;
  };

  const folderTree = buildFolderTree();

  const toggleFolder = (folder: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folder)) newExpanded.delete(folder);
    else newExpanded.add(folder);
    setExpandedFolders(newExpanded);
  };

  const handleDownload = async (resource: any) => {
    try {
      await incrementDownload.mutateAsync({ id: resource.id });
      toast.info(`다운로드 준비 중...`);

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

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      toast.success(`다운로드 완료: ${resource.fileName}`);
    } catch (error) {
      console.error('Download error:', error);
      window.open(resource.fileUrl, '_blank');
      toast.info("새 탭에서 열었습니다.");
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FDF8F3 0%, #FAF5EF 50%, #F8F2EB 100%)', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <header className="dp4-header">
        <Link href="/" className="dp4-logo">
          <SupremeLogo size={70} />
        </Link>
        <nav className="dp4-nav">
          <Link href="/">PROJECTS</Link>
          <Link href="/resources">RESOURCES</Link>
          <Link href="/blog">BLOG</Link>
        </nav>
        <a href="mailto:contact@jahyeon.com" className="dp4-send">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 2L11 13" />
            <polygon points="22,2 15,22 11,13 2,9" />
          </svg>
        </a>
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #4361EE, #7B2FFF, #00D9FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 16
            }}>
              수업 자료실
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: 600, margin: '0 auto' }}>
              강의 자료, 코드 샘플, PPT, 영상 자료를 다운로드하세요
            </p>
            <p style={{ fontSize: '0.95rem', color: '#4361EE', marginTop: 12 }}>
              ✨ 클릭하면 PPT/PDF 미리보기 가능!
            </p>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
            {CATEGORIES.map(category => {
              const Icon = category.icon;
              const isActive = activeCategory === category.value;
              return (
                <button
                  key={category.value}
                  onClick={() => setActiveCategory(category.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 24px',
                    borderRadius: 24,
                    border: 'none',
                    background: isActive ? category.color : 'white',
                    color: isActive ? 'white' : '#666',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: isActive ? `0 4px 20px ${category.color}40` : '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon style={{ width: 18, height: 18 }} />
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80 }}>
              <Loader2 style={{ width: 48, height: 48, color: '#4361EE', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : !folderTree.length && !filteredResources?.length ? (
            <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>
              <FileText style={{ width: 64, height: 64, opacity: 0.3, margin: '0 auto 16px' }} />
              <p style={{ fontSize: '1.2rem' }}>등록된 자료가 없습니다</p>
            </div>
          ) : activeCategory === "daily_life" ? (
            /* Daily Video Grid */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {filteredResources?.map((resource, idx) => {
                const isVideo = isYouTubeUrl(resource.fileUrl) || resource.mimeType?.startsWith('video/');
                const thumbUrl = resource.thumbnailUrl || (isYouTubeUrl(resource.fileUrl) ? getYouTubeThumbnail(resource.fileUrl) : null);

                return (
                  <div
                    key={resource.id}
                    onClick={() => handleResourceClick(resource)}
                    style={{
                      background: 'white',
                      borderRadius: 20,
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
                  >
                    <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }}>
                      {thumbUrl ? (
                        <img src={thumbUrl} alt={resource.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #7B2FFF, #4361EE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Play style={{ width: 48, height: 48, color: 'white' }} />
                        </div>
                      )}
                      {isVideo && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                          <div style={{ width: 56, height: 56, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                            <Play style={{ width: 24, height: 24, color: '#333', marginLeft: 4 }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 20 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#333', marginBottom: 8 }}>{resource.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#888', fontSize: '0.85rem' }}>
                        <span>✦ {formatFileSize(resource.fileSize)}</span>
                        <span>⬇ {resource.downloadCount || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Folder Grid */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {folderTree.map((folder, folderIndex) => {
                const folderKey = folder.id ? `folder_${folder.id}` : folder.name;
                const isExpanded = expandedFolders.has(folderKey);
                const resourceCount = folder.items.length;
                const hasSubfolders = folder.children.length > 0;

                return (
                  <div key={folderKey} style={{ background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    {/* Folder Header */}
                    <button
                      onClick={() => toggleFolder(folderKey)}
                      style={{
                        width: '100%',
                        padding: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f8f8'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          width: 56,
                          height: 56,
                          borderRadius: 16,
                          background: 'linear-gradient(135deg, #4361EE, #7B2FFF)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 20px rgba(67, 97, 238, 0.3)'
                        }}>
                          <FolderOpen style={{ width: 28, height: 28, color: 'white' }} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', marginBottom: 4 }}>{folder.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ padding: '4px 12px', background: '#f0f4ff', color: '#4361EE', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600 }}>
                              {resourceCount} FILES
                            </span>
                            {hasSubfolders && (
                              <span style={{ padding: '4px 12px', background: '#f0fff4', color: '#10b981', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600 }}>
                                {folder.children.length} FOLDERS
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: isExpanded ? '#4361EE' : '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}>
                        {isExpanded ? (
                          <ChevronDown style={{ width: 20, height: 20, color: 'white' }} />
                        ) : (
                          <ChevronRight style={{ width: 20, height: 20, color: '#888' }} />
                        )}
                      </div>
                    </button>

                    {/* Folder Contents */}
                    {isExpanded && (
                      <div style={{ padding: '0 24px 24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                          {folder.items.map((resource: any) => {
                            const thumbnail = resource.thumbnailUrl || (isYouTubeUrl(resource.fileUrl) ? getYouTubeThumbnail(resource.fileUrl) : null);
                            const isVideo = isYouTubeUrl(resource.fileUrl) || resource.mimeType?.startsWith('video/');
                            const isPPTFile = isPPT(resource.mimeType || '', resource.fileName || '');
                            const isPDFFile = isPDF(resource.mimeType || '', resource.fileName || '');
                            const canPreview = isVideo || isPPTFile || isPDFFile;

                            return (
                              <div
                                key={resource.id}
                                onClick={() => canPreview && handleResourceClick(resource)}
                                style={{
                                  background: '#f8f8f8',
                                  borderRadius: 16,
                                  overflow: 'hidden',
                                  cursor: canPreview ? 'pointer' : 'default',
                                  transition: 'transform 0.2s, box-shadow 0.2s',
                                  border: '1px solid #eee'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                              >
                                <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }}>
                                  {isVideo ? <VideoThumbnail resource={resource} thumbnail={thumbnail} />
                                    : isPPTFile ? <PPTThumbnail resource={resource} />
                                      : isPDFFile ? <PDFThumbnail resource={resource} />
                                        : thumbnail ? <img src={thumbnail} alt={resource.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                          : <div style={{ width: '100%', height: '100%', background: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText style={{ width: 48, height: 48, color: '#bbb' }} /></div>}

                                  {canPreview && (
                                    <div style={{ position: 'absolute', top: 12, right: 12, padding: '6px 12px', background: 'rgba(67,97,238,0.9)', color: 'white', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Eye style={{ width: 14, height: 14 }} />Preview
                                    </div>
                                  )}
                                </div>
                                <div style={{ padding: 16 }}>
                                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#333', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resource.title}</h4>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{formatFileSize(resource.fileSize)}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>⬇ {resource.downloadCount || 0}</span>
                                  </div>
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <LikeButton resourceId={resource.id} />
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setSelectedCommentResource(resource); }}
                                      style={{ padding: '8px 12px', borderRadius: 20, border: 'none', background: '#f0f0f0', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                    >
                                      <MessageCircle style={{ width: 16, height: 16 }} />
                                    </button>
                                    <div style={{ flex: 1 }} />
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDownload(resource); }}
                                      style={{
                                        padding: '8px 16px',
                                        borderRadius: 20,
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #4361EE, #7B2FFF)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        fontWeight: 600,
                                        fontSize: '0.85rem'
                                      }}
                                    >
                                      <Download style={{ width: 14, height: 14 }} />
                                      Download
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Subfolders */}
                        {hasSubfolders && (
                          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {folder.children.map((subfolder) => {
                              const subfolderKey = subfolder.id ? `folder_${subfolder.id}` : subfolder.name;
                              const isSubExpanded = expandedFolders.has(subfolderKey);
                              const subResourceCount = subfolder.items.length;

                              return (
                                <div key={subfolderKey} style={{ background: '#f8f8f8', borderRadius: 16, overflow: 'hidden', marginLeft: 24, border: '1px solid #eee' }}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleFolder(subfolderKey); }}
                                    style={{ width: '100%', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                      <span style={{ color: '#4361EE', fontSize: '1.2rem' }}>↳</span>
                                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4361EE40, #7B2FFF40)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FolderOpen style={{ width: 18, height: 18, color: '#4361EE' }} />
                                      </div>
                                      <div style={{ textAlign: 'left' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>{subfolder.name}</h4>
                                        <span style={{ fontSize: '0.85rem', color: '#888' }}>{subResourceCount} files</span>
                                      </div>
                                    </div>
                                    {isSubExpanded ? <ChevronDown style={{ width: 18, height: 18, color: '#4361EE' }} /> : <ChevronRight style={{ width: 18, height: 18, color: '#888' }} />}
                                  </button>

                                  {isSubExpanded && subfolder.items.length > 0 && (
                                    <div style={{ padding: '0 16px 16px' }}>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                                        {subfolder.items.map((resource: any) => (
                                          <div
                                            key={resource.id}
                                            style={{ padding: 12, background: 'white', borderRadius: 12, border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}
                                          >
                                            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                              <FileText style={{ width: 18, height: 18, color: '#4361EE' }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                              <p style={{ fontWeight: 600, color: '#333', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resource.title}</p>
                                              <p style={{ fontSize: '0.75rem', color: '#888' }}>{resource.fileName}</p>
                                            </div>
                                            <button
                                              onClick={() => handleDownload(resource)}
                                              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f0f4ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                              <Download style={{ width: 16, height: 16, color: '#4361EE' }} />
                                            </button>
                                          </div>
                                        ))}
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
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedVideo && <VideoModal resource={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      {selectedDocument && <DocumentPreviewModal resource={selectedDocument} onClose={() => setSelectedDocument(null)} />}
      {selectedCommentResource && <CommentsModal resource={selectedCommentResource} onClose={() => setSelectedCommentResource(null)} />}

      {/* Footer */}
      <footer className="dp4-footer">
        <nav className="dp4-footer-nav">
          <Link href="/">PROJECTS</Link>
          <Link href="/resources">RESOURCES</Link>
          <Link href="/blog">BLOG</Link>
          <a href="mailto:contact@jahyeon.com">CONTACT</a>
        </nav>
        <p>© 2024 Gu Jahyeon. Embedded Developer & Educator.</p>
      </footer>

      {/* Messenger Widget */}
      <MessengerWidget />

      {/* CSS Animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
