import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
    MessageSquare, HelpCircle, BookOpen, Users, Bell, Image as ImageIcon,
    Plus, Search, TrendingUp, Clock, Eye, MessageCircle, ThumbsUp, Pin,
    ChevronRight, ChevronDown, X, Upload, Send, Heart, Share2, Bookmark,
    Edit3, Trash2, MoreHorizontal, Check, Lock, Sparkles, StickyNote, Loader2
} from "lucide-react";
// SNS Components
import { StoriesBar, FollowButton, ReactionButton, NotificationsList } from "@/components/sns";
// Notion Block Renderer
import { BlockRenderer } from "@/components/notion";

// 카테고리 정의 - 초고도화 색상 시스템
const CATEGORIES = [
    { id: "all", label: "전체", icon: MessageSquare, color: "#00FF88", bgColor: "from-electric/20 to-electric/5", borderColor: "border-electric/40" },
    { id: "question", label: "질문 Q&A", icon: HelpCircle, color: "#FFD93D", bgColor: "from-yellow-500/20 to-yellow-500/5", borderColor: "border-yellow-500/40" },
    { id: "free", label: "자유 Talk", icon: MessageCircle, color: "#4ECDC4", bgColor: "from-accent-cyan/20 to-accent-cyan/5", borderColor: "border-accent-cyan/40" },
    { id: "homework", label: "과제 HW", icon: BookOpen, color: "#818CF8", bgColor: "from-accent-indigo/20 to-accent-indigo/5", borderColor: "border-accent-indigo/40" },
    { id: "study", label: "스터디", icon: Users, color: "#A855F7", bgColor: "from-purple-500/20 to-purple-500/5", borderColor: "border-purple-500/40" },
    { id: "notice", label: "공지사항", icon: Bell, color: "#FF6B6B", bgColor: "from-red-500/20 to-red-500/5", borderColor: "border-red-500/40" },
    { id: "gallery", label: "갤러리", icon: ImageIcon, color: "#FF69B4", bgColor: "from-pink-500/20 to-pink-500/5", borderColor: "border-pink-500/40" },
];


// 현재 로그인 사용자 확인 (localStorage에서)
function useAuth() {
    const [member, setMember] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedMember = localStorage.getItem("member");
        if (storedMember) {
            try {
                const parsed = JSON.parse(storedMember);
                // 학원 코드 확인: isStudent가 true인 경우만 접근 가능
                if (parsed.isStudent) {
                    setMember(parsed);
                }
            } catch (e) {
                console.error("Failed to parse member:", e);
            }
        }
        setIsLoading(false);
    }, []);

    return { member, isLoading, isAuthenticated: !!member };
}

// 수업 메모 (빠른 메모)
interface ClassNote {
    id: number;
    content: string;
    createdAt: string;
}

export default function Community() {
    const { member, isLoading: authLoading, isAuthenticated } = useAuth();
    const [, navigate] = useLocation();

    // State
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

    // Post Modal States
    const [showWriteModal, setShowWriteModal] = useState(false);
    const [postTitle, setPostTitle] = useState("");
    const [postContent, setPostContent] = useState("");
    const [postCategory, setPostCategory] = useState("free");
    const [postTags, setPostTags] = useState("");
    const [postImages, setPostImages] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Post Detail
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [newComment, setNewComment] = useState("");
    const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
    const [postComments, setPostComments] = useState<any[]>([]);
    const [replyToId, setReplyToId] = useState<number | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);

    // Class Notes (수업 메모)
    const [showClassNotes, setShowClassNotes] = useState(false);
    const [classNotes, setClassNotes] = useState<ClassNote[]>([
        { id: 1, content: "포인터 = 메모리 주소 저장 변수", createdAt: "오늘 14:30" },
        { id: 2, content: "배열 이름 = 첫 번째 요소의 주소", createdAt: "오늘 14:35" },
    ]);
    const [quickNote, setQuickNote] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 로그인 필요 체크
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error("로그인이 필요합니다", { description: "학원 코드를 입력한 계정만 이용 가능합니다" });
            navigate("/login");
        }
    }, [authLoading, isAuthenticated, navigate]);

    // ============ API Queries ============
    // Fetch posts from API using trpc hooks
    const { data: apiPosts, isLoading: postsLoading, refetch: refetchPosts } = trpc.community.posts.list.useQuery(
        { category: selectedCategory === 'all' ? undefined : selectedCategory, limit: 50 },
        { enabled: isAuthenticated }
    );

    // Fetch class notes from API
    const { data: apiClassNotes, refetch: refetchNotes } = trpc.community.classNotes.list.useQuery(
        { memberId: member?.id ?? 0 },
        { enabled: !!member?.id }
    );

    // Transform API posts to display format (with fallback for demo)
    const displayPosts = apiPosts?.length ? apiPosts.map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category,
        author: post.authorName || (post.isAnonymous ? "익명" : "사용자"),
        authorId: post.memberId,
        authorLevel: 3,
        isAnonymous: post.isAnonymous,
        isPinned: post.isPinned,
        viewCount: post.viewCount || 0,
        likeCount: post.likeCount || 0,
        commentCount: post.commentCount || 0,
        isLiked: false,
        isBookmarked: false,
        tags: post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : [],
        images: post.images ? (typeof post.images === 'string' ? JSON.parse(post.images) : post.images) : [],
        createdAt: post.createdAt?.toString() || new Date().toISOString(),
        comments: [],
    })) : [];

    const filteredPosts = displayPosts.filter(post =>
        selectedCategory === "all" || post.category === selectedCategory
    );

    const getCategoryInfo = (categoryId: string) => {
        return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return "방금 전";
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        return `${Math.floor(diff / 86400)}일 전`;
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + postImages.length > 5) {
            toast.error("이미지는 최대 5개까지 업로드 가능합니다");
            return;
        }

        setPostImages(prev => [...prev, ...files]);

        // Preview
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setPostImages(prev => prev.filter((_, i) => i !== index));
        setImagePreview(prev => prev.filter((_, i) => i !== index));
    };

    // 게시글 작성
    const handleSubmitPost = () => {
        if (!postTitle.trim()) {
            toast.error("제목을 입력해주세요");
            return;
        }
        if (!postContent.trim()) {
            toast.error("내용을 입력해주세요");
            return;
        }

        // TODO: API 호출
        toast.success("게시글이 작성되었습니다!");
        setShowWriteModal(false);
        resetPostForm();
    };

    const resetPostForm = () => {
        setPostTitle("");
        setPostContent("");
        setPostCategory("free");
        setPostTags("");
        setPostImages([]);
        setImagePreview([]);
        setIsAnonymous(false);
    };

    // 좋아요 토글
    const handleLike = async (postId: number) => {
        if (!member) {
            toast.error("로그인이 필요합니다");
            return;
        }
        try {
            const input = encodeURIComponent(JSON.stringify({ postId, memberId: member.id }));
            const res = await fetch(`/api/trpc/community.posts.like?input=${input}`);
            const data = await res.json();
            if (data.result?.data?.liked) {
                setLikedPosts(prev => new Set(prev).add(postId));
                toast.success("💖 좋아요!");
            } else {
                setLikedPosts(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(postId);
                    return newSet;
                });
                toast("좋아요 취소");
            }
            refetchPosts();
        } catch (e) {
            console.error(e);
            toast.error("좋아요 실패");
        }
    };

    // 북마크 토글
    const handleBookmark = async (postId: number) => {
        if (!member) {
            toast.error("로그인이 필요합니다");
            return;
        }
        try {
            const input = encodeURIComponent(JSON.stringify({ postId, memberId: member.id }));
            const res = await fetch(`/api/trpc/community.bookmarks.toggle?input=${input}`);
            const data = await res.json();
            if (data.result?.data?.bookmarked) {
                toast.success("🔖 북마크 추가!");
            } else {
                toast("북마크 해제");
            }
        } catch (e) {
            console.error(e);
            toast.error("북마크 실패");
        }
    };

    // 공유 (링크 복사)
    const handleShare = async (postId: number, title: string) => {
        const url = `${window.location.origin}/community/post/${postId}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success("📋 링크가 복사되었습니다!");
        } catch {
            toast.error("복사 실패");
        }
    };

    // 게시글 조회 (조회수 증가 + 댓글 로드)
    const handleViewPost = async (post: any) => {
        setSelectedPost(post);
        setPostComments([]);
        try {
            // Increment view count
            await fetch(`/api/trpc/community.posts.get?input=${encodeURIComponent(JSON.stringify({ id: post.id }))}`);

            // Fetch comments
            const commentsRes = await fetch(`/api/trpc/community.comments.list?input=${encodeURIComponent(JSON.stringify({ postId: post.id }))}`);
            const commentsData = await commentsRes.json();
            if (commentsData.result?.data) {
                setPostComments(commentsData.result.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // 게시글 삭제
    const handleDeletePost = async (postId: number) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        try {
            const input = encodeURIComponent(JSON.stringify({ id: postId }));
            await fetch(`/api/trpc/community.posts.delete?input=${input}`);
            toast.success("🗑️ 게시글이 삭제되었습니다");
            setSelectedPost(null);
            refetchPosts();
        } catch (e) {
            toast.error("삭제 실패");
            console.error(e);
        }
    };

    // 댓글/대댓글 작성

    const handleSubmitComment = async (parentId?: number) => {
        if (!newComment.trim() || !selectedPost || !member) {
            if (!member) toast.error("로그인이 필요합니다");
            return;
        }
        try {
            const input = encodeURIComponent(JSON.stringify({
                postId: selectedPost.id,
                memberId: member.id,
                content: newComment.trim(),
                parentId: parentId || replyToId || null
            }));
            const res = await fetch(`/api/trpc/community.comments.create?input=${input}`);
            const data = await res.json();
            if (data.result?.data?.success) {
                toast.success(replyToId ? "💬 답글이 작성되었습니다!" : "💬 댓글이 작성되었습니다!");
                setNewComment("");
                setReplyToId(null);
                // Reload comments
                const commentsRes = await fetch(`/api/trpc/community.comments.list?input=${encodeURIComponent(JSON.stringify({ postId: selectedPost.id }))}`);
                const commentsData = await commentsRes.json();
                if (commentsData.result?.data) {
                    setPostComments(commentsData.result.data);
                }
                refetchPosts();
            }
        } catch (e) {
            console.error(e);
            toast.error("댓글 작성 실패");
        }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentId: number) => {
        if (!confirm("댓글을 삭제하시겠습니까?")) return;
        try {
            const input = encodeURIComponent(JSON.stringify({ id: commentId }));
            await fetch(`/api/trpc/community.comments.delete?input=${input}`);
            toast.success("🗑️ 댓글이 삭제되었습니다");
            // Reload comments
            if (selectedPost) {
                const commentsRes = await fetch(`/api/trpc/community.comments.list?input=${encodeURIComponent(JSON.stringify({ postId: selectedPost.id }))}`);
                const commentsData = await commentsRes.json();
                if (commentsData.result?.data) {
                    setPostComments(commentsData.result.data);
                }
            }
            refetchPosts();
        } catch (e) {
            console.error(e);
            toast.error("삭제 실패");
        }
    };

    // 수업 메모 추가
    const handleAddClassNote = () => {
        if (!quickNote.trim()) return;
        const newNote: ClassNote = {
            id: Date.now(),
            content: quickNote,
            createdAt: `오늘 ${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`,
        };
        setClassNotes(prev => [newNote, ...prev]);
        setQuickNote("");
        toast.success("메모가 저장되었습니다!");
    };

    // 로딩 또는 비인증 상태
    if (authLoading) {
        return (
            <div className="min-h-screen bg-midnight flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-electric/30 border-t-electric rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // 리다이렉트 중
    }

    return (
        <div className="min-h-screen bg-midnight text-frost overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-midnight via-midnight-card to-midnight" />
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-electric/10 rounded-full blur-[180px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-indigo/15 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
            </div>

            <Navigation />

            {/* Header */}
            <section className="pt-32 md:pt-36 lg:pt-40 pb-8 px-4 md:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <AnimatedSection>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-electric/10 via-accent-cyan/10 to-accent-indigo/10 border border-electric/30 backdrop-blur-xl mb-6 shadow-[0_0_60px_rgba(0,255,136,0.2)]">
                                    <MessageSquare className="w-5 h-5 text-electric" />
                                    <span className="font-mono text-sm text-frost tracking-wider uppercase">Student Community</span>
                                    <span className="px-2 py-0.5 rounded bg-electric/20 text-electric text-xs font-bold">
                                        Lv.{member?.level || 1}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-2" style={{ textShadow: '0 0 60px rgba(0,255,136,0.4)' }}>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric via-accent-cyan to-electric">
                                        커뮤니티
                                    </span>
                                </h1>
                                <p className="text-frost-muted text-lg">안녕하세요, <span className="text-electric font-bold">{member?.name}</span>님! 함께 성장해요 🚀</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* 수업 메모 버튼 */}
                                <Button
                                    onClick={() => navigate("/notes/new")}
                                    variant="outline"
                                    className="border-accent-cyan/40 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan"
                                >
                                    <StickyNote className="w-5 h-5 mr-2" />
                                    수업 메모
                                </Button>

                                {/* Write Button */}
                                <Button
                                    onClick={() => navigate("/community/write")}
                                    className="bg-gradient-to-r from-electric to-accent-cyan text-midnight font-bold px-6 py-3 rounded-xl shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:shadow-[0_0_50px_rgba(0,255,136,0.5)] transition-all"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    글쓰기
                                </Button>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Stories Bar - SNS Feature */}
            {member?.id && (
                <section className="px-4 md:px-8 relative z-10 mb-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-midnight-card/50 backdrop-blur-xl rounded-2xl border border-white/10">
                            <StoriesBar
                                memberId={member.id}
                                onCreateStory={() => toast.info("스토리 업로드 기능 준비 중!")}
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Notification Panel */}
            {showNotifications && member?.id && (
                <div className="fixed right-4 top-24 w-96 max-h-[80vh] overflow-y-auto bg-midnight-card rounded-2xl border border-white/10 shadow-2xl z-50 p-4">
                    <NotificationsList
                        memberId={member.id}
                        onNotificationClick={(n) => {
                            setShowNotifications(false);
                            if (n.postId) {
                                // Navigate to post
                            }
                        }}
                    />
                </div>
            )}

            {/* Category Tabs */}
            <section className="px-4 md:px-8 relative z-10 mb-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all font-medium ${isActive
                                        ? `bg-gradient-to-r ${cat.bgColor} border ${cat.borderColor} shadow-lg`
                                        : 'bg-white/5 text-frost-muted hover:bg-white/10 border border-white/10'
                                        }`}
                                    style={isActive ? { color: cat.color, boxShadow: `0 0 20px ${cat.color}30` } : {}}
                                >
                                    <Icon className="w-4 h-4" style={isActive ? { color: cat.color } : {}} />
                                    <span className="text-sm">{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Search & Filter Bar */}
            <section className="px-4 md:px-8 relative z-10 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-frost-muted" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="제목, 내용, 태그로 검색..."
                                className="pl-12 bg-white/5 border-white/10 text-frost placeholder:text-frost-muted h-12 rounded-xl"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSortBy("latest")}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${sortBy === "latest" ? 'bg-electric/20 text-electric' : 'bg-white/5 text-frost-muted hover:bg-white/10'
                                    }`}
                            >
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">최신순</span>
                            </button>
                            <button
                                onClick={() => setSortBy("popular")}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${sortBy === "popular" ? 'bg-electric/20 text-electric' : 'bg-white/5 text-frost-muted hover:bg-white/10'
                                    }`}
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm">인기순</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="px-4 md:px-8 relative z-10 pb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid gap-4">
                        {filteredPosts.map((post, index) => {
                            const catInfo = getCategoryInfo(post.category);
                            const CatIcon = catInfo.icon;

                            return (
                                <AnimatedSection key={post.id} delay={index * 50}>
                                    <div
                                        className="group relative cursor-pointer"
                                        onClick={() => handleViewPost(post)}
                                    >
                                        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-electric/0 via-electric/0 to-electric/0 group-hover:from-electric/20 group-hover:via-accent-cyan/20 group-hover:to-accent-indigo/20 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />

                                        <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] border border-white/10 group-hover:border-electric/30 rounded-2xl p-5 transition-all">
                                            <div className="flex items-start gap-4">
                                                {/* Category Icon */}
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        backgroundColor: `${catInfo.color}20`,
                                                        borderColor: `${catInfo.color}60`,
                                                        borderWidth: '1px'
                                                    }}
                                                >
                                                    <CatIcon className="w-6 h-6" style={{ color: catInfo.color }} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        {post.isPinned && (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                                                                <Pin className="w-3 h-3" />
                                                                고정
                                                            </span>
                                                        )}
                                                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-frost-muted text-xs">
                                                            {catInfo.label}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-electric transition-colors mb-2 line-clamp-1">
                                                        {post.title}
                                                    </h3>

                                                    <p className="text-frost-muted text-sm mb-3 line-clamp-2">
                                                        {/* HTML 콘텐츠의 경우 태그 제거 후 표시 */}
                                                        {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                                    </p>

                                                    {/* Images Preview */}
                                                    {post.images.length > 0 && (
                                                        <div className="flex gap-2 mb-3">
                                                            {post.images.slice(0, 3).map((img: string, i: number) => (
                                                                <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                            ))}
                                                            {post.images.length > 3 && (
                                                                <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center text-frost-muted text-sm">
                                                                    +{post.images.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Tags */}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        {post.tags.map((tag: string) => (
                                                            <span key={tag} className="px-2 py-0.5 rounded-md bg-accent-cyan/10 text-accent-cyan text-xs border border-accent-cyan/20">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Meta */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4 text-xs text-frost-muted">
                                                            <span className="flex items-center gap-1.5">
                                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-electric/30 to-accent-cyan/30 flex items-center justify-center border border-electric/30">
                                                                    <span className="text-[10px] font-bold text-electric">{post.authorLevel}</span>
                                                                </div>
                                                                {post.isAnonymous ? "익명" : post.author}
                                                            </span>
                                                            <span>{formatTimeAgo(post.createdAt)}</span>
                                                        </div>

                                                        <div className="flex items-center gap-3 text-xs text-frost-muted">
                                                            <span className="flex items-center gap-1">
                                                                <Eye className="w-3.5 h-3.5" />
                                                                {post.viewCount}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MessageCircle className="w-3.5 h-3.5" />
                                                                {(post as any).commentCount || 0}
                                                            </span>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                                                                className={`flex items-center gap-1 transition-colors ${post.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                                                            >
                                                                <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-current' : ''}`} />
                                                                {post.likeCount}
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleBookmark(post.id); }}
                                                                className={`flex items-center gap-1 transition-colors ${post.isBookmarked ? 'text-accent-cyan' : 'hover:text-accent-cyan'}`}
                                                            >
                                                                <Bookmark className={`w-3.5 h-3.5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleShare(post.id, post.title); }}
                                                                className="flex items-center gap-1 transition-colors hover:text-electric"
                                                            >
                                                                <Share2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <ChevronRight className="w-5 h-5 text-frost-muted group-hover:text-electric transition-colors flex-shrink-0" />
                                            </div>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ========== MODALS ========== */}

            {/* Write Post Modal */}
            {showWriteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowWriteModal(false)}>
                    <div className="bg-midnight-card border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-2xl font-bold text-white">새 글 작성</h2>
                            <button onClick={() => setShowWriteModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                <X className="w-5 h-5 text-frost-muted" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Category Select */}
                            <div>
                                <label className="block text-sm font-medium text-frost-muted mb-2">카테고리</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.filter(c => c.id !== "all").map((cat) => {
                                        const Icon = cat.icon;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setPostCategory(cat.id)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${postCategory === cat.id
                                                    ? 'bg-electric/20 text-electric border border-electric/40'
                                                    : 'bg-white/5 text-frost-muted hover:bg-white/10 border border-white/10'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="text-sm">{cat.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-frost-muted mb-2">제목</label>
                                <Input
                                    value={postTitle}
                                    onChange={(e) => setPostTitle(e.target.value)}
                                    placeholder="제목을 입력하세요"
                                    className="bg-white/5 border-white/10 text-frost h-12"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-frost-muted mb-2">내용</label>
                                <Textarea
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                    placeholder="내용을 작성하세요..."
                                    rows={8}
                                    className="bg-white/5 border-white/10 text-frost resize-none"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-frost-muted mb-2">태그 (쉼표로 구분)</label>
                                <Input
                                    value={postTags}
                                    onChange={(e) => setPostTags(e.target.value)}
                                    placeholder="예: C언어, 포인터, 배열"
                                    className="bg-white/5 border-white/10 text-frost"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-frost-muted mb-2">이미지 첨부 (최대 5개)</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <div className="flex flex-wrap gap-3">
                                    {imagePreview.map((preview, index) => (
                                        <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group">
                                            <img src={preview} alt="" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                            >
                                                <X className="w-5 h-5 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    {postImages.length < 5 && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 hover:border-electric/50 flex flex-col items-center justify-center gap-1 transition-colors"
                                        >
                                            <Upload className="w-5 h-5 text-frost-muted" />
                                            <span className="text-[10px] text-frost-muted">업로드</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Anonymous Toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsAnonymous(!isAnonymous)}
                                    className={`w-12 h-6 rounded-full transition-colors ${isAnonymous ? 'bg-electric' : 'bg-white/20'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isAnonymous ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                                <span className="text-sm text-frost-muted">익명으로 작성</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-white/10">
                            <Button variant="outline" onClick={() => setShowWriteModal(false)} className="border-white/20">
                                취소
                            </Button>
                            <Button onClick={handleSubmitPost} className="bg-gradient-to-r from-electric to-accent-cyan text-midnight font-bold">
                                <Send className="w-4 h-4 mr-2" />
                                게시하기
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post Detail Modal */}
            {selectedPost && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPost(null)}>
                    <div className="bg-midnight-card border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric/30 to-accent-cyan/30 flex items-center justify-center border border-electric/30">
                                    <span className="text-sm font-bold text-electric">{selectedPost.authorLevel}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-frost">{selectedPost.isAnonymous ? "익명" : selectedPost.author}</span>
                                    <p className="text-xs text-frost-muted">{formatTimeAgo(selectedPost.createdAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleBookmark(selectedPost.id); }}
                                    className="p-2 hover:bg-white/10 rounded-lg text-frost-muted hover:text-accent-cyan transition-colors"
                                    title="북마크"
                                >
                                    <Bookmark className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleShare(selectedPost.id, selectedPost.title); }}
                                    className="p-2 hover:bg-white/10 rounded-lg text-frost-muted hover:text-electric transition-colors"
                                    title="공유"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeletePost(selectedPost.id); }}
                                    className="p-2 hover:bg-red-500/20 rounded-lg text-frost-muted hover:text-red-500 transition-colors"
                                    title="삭제"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-white/10 rounded-lg">
                                    <X className="w-5 h-5 text-frost-muted" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{selectedPost.title}</h2>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {selectedPost.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-lg bg-accent-cyan/10 text-accent-cyan text-sm border border-accent-cyan/20">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            {/* HTML 콘텐츠 렌더링 (NotionEditor로 작성된 경우) */}
                            {selectedPost.content.startsWith('<') ? (
                                <BlockRenderer content={selectedPost.content} className="mb-6" />
                            ) : (
                                <p className="text-frost whitespace-pre-wrap mb-6 leading-relaxed">{selectedPost.content}</p>
                            )}

                            {/* Images */}
                            {selectedPost.images.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {selectedPost.images.map((img, i) => (
                                        <div key={i} className="rounded-xl overflow-hidden border border-white/10">
                                            <img src={img} alt="" className="w-full h-48 object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-4 py-4 border-y border-white/10">
                                <button
                                    onClick={() => handleLike(selectedPost.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${likedPosts.has(selectedPost.id) ? 'bg-pink-500/20 text-pink-500' : 'bg-white/5 text-frost-muted hover:bg-white/10'
                                        }`}
                                >
                                    <Heart className={`w-5 h-5 ${likedPosts.has(selectedPost.id) ? 'fill-current' : ''}`} />
                                    <span>좋아요 {selectedPost.likeCount}</span>
                                </button>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-frost-muted">
                                    <Eye className="w-5 h-5" />
                                    <span>조회수 {selectedPost.viewCount}</span>
                                </div>
                            </div>

                            {/* Comments */}
                            <div className="mt-6">
                                <h3 className="text-lg font-bold text-white mb-4">댓글 {postComments.length}개</h3>

                                <div className="space-y-4 mb-6">
                                    {postComments.map((comment: any) => (
                                        <div key={comment.id} className={`p-4 rounded-xl ${comment.isAccepted ? 'bg-electric/10 border border-electric/30' : 'bg-white/5 border border-white/10'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-electric/30 to-accent-cyan/30 flex items-center justify-center">
                                                        <span className="text-[10px] font-bold text-electric">💬</span>
                                                    </div>
                                                    <span className="font-medium text-frost text-sm">{comment.authorName || '사용자'}</span>
                                                    {comment.isAccepted && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-electric/20 text-electric text-xs">
                                                            <Check className="w-3 h-3" />
                                                            채택됨
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-frost-muted">{new Date(comment.createdAt).toLocaleString('ko-KR')}</span>
                                            </div>
                                            <p className="text-frost text-sm">{comment.content}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <button className="flex items-center gap-1 text-xs text-frost-muted hover:text-pink-500">
                                                    <Heart className="w-3 h-3" />
                                                    {comment.likeCount || 0}
                                                </button>
                                                <button
                                                    onClick={() => { setReplyToId(comment.id); setNewComment(`@${comment.authorName || '사용자'} `); }}
                                                    className="text-xs text-frost-muted hover:text-electric"
                                                >
                                                    답글
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-xs text-frost-muted hover:text-red-500"
                                                >
                                                    삭제
                                                </button>
                                            </div>

                                            {/* Nested Replies */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="mt-4 pl-4 border-l-2 border-electric/30 space-y-3">
                                                    {comment.replies.map((reply: any) => (
                                                        <div key={reply.id} className="p-3 rounded-lg bg-white/5">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-electric">↳</span>
                                                                    <span className="font-medium text-frost text-sm">{reply.authorName || '사용자'}</span>
                                                                </div>
                                                                <span className="text-xs text-frost-muted">{new Date(reply.createdAt).toLocaleString('ko-KR')}</span>
                                                            </div>
                                                            <p className="text-frost text-sm">{reply.content}</p>
                                                            <div className="flex items-center gap-4 mt-1">
                                                                <button
                                                                    onClick={() => { setReplyToId(reply.id); setNewComment(`@${reply.authorName || '사용자'} `); }}
                                                                    className="text-xs text-frost-muted hover:text-electric"
                                                                >
                                                                    답글
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteComment(reply.id)}
                                                                    className="text-xs text-frost-muted hover:text-red-500"
                                                                >
                                                                    삭제
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Reply indicator */}
                                {replyToId && (
                                    <div className="flex items-center gap-2 mb-2 p-2 bg-electric/10 rounded-lg">
                                        <span className="text-xs text-electric">답글 작성 중...</span>
                                        <button
                                            onClick={() => { setReplyToId(null); setNewComment(''); }}
                                            className="text-xs text-frost-muted hover:text-frost"
                                        >
                                            취소
                                        </button>
                                    </div>
                                )}

                                {/* Comment Input */}
                                <div className="flex gap-3">
                                    <Textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={replyToId ? "답글을 작성하세요..." : "댓글을 작성하세요..."}
                                        rows={2}
                                        className="flex-1 bg-white/5 border-white/10 text-frost resize-none"
                                    />
                                    <Button onClick={() => handleSubmitComment()} className="bg-electric text-midnight font-bold self-end">
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Class Notes Sidebar */}
            {showClassNotes && (
                <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowClassNotes(false)}>
                    <div
                        className="absolute right-0 top-0 h-full w-full max-w-md bg-midnight-card border-l border-white/10 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <StickyNote className="w-6 h-6 text-accent-cyan" />
                                <h2 className="text-xl font-bold text-white">수업 메모</h2>
                            </div>
                            <button onClick={() => setShowClassNotes(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                <X className="w-5 h-5 text-frost-muted" />
                            </button>
                        </div>

                        {/* Quick Add */}
                        <div className="p-4 border-b border-white/10">
                            <div className="flex gap-2">
                                <Input
                                    value={quickNote}
                                    onChange={(e) => setQuickNote(e.target.value)}
                                    placeholder="빠른 메모 추가..."
                                    className="flex-1 bg-white/5 border-white/10 text-frost h-10"
                                    onKeyDown={(e) => e.key === "Enter" && handleAddClassNote()}
                                />
                                <Button onClick={handleAddClassNote} className="bg-accent-cyan text-midnight font-bold h-10">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-frost-muted mt-2">💡 수업 중 중요한 내용을 빠르게 메모하세요!</p>
                        </div>

                        {/* Notes List */}
                        <div className="p-4 space-y-3 overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
                            {classNotes.map(note => (
                                <div key={note.id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-accent-cyan/30 transition-all group">
                                    <p className="text-frost text-sm mb-2">{note.content}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-frost-muted">{note.createdAt}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1 hover:bg-white/10 rounded text-frost-muted hover:text-frost">
                                                <Edit3 className="w-3 h-3" />
                                            </button>
                                            <button className="p-1 hover:bg-white/10 rounded text-frost-muted hover:text-red-400">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
