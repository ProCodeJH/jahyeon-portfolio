import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    MessageSquare, HelpCircle, BookOpen, Users, Bell, Image as ImageIcon,
    Plus, Search, TrendingUp, Clock, Eye, MessageCircle, ThumbsUp, Pin,
    ChevronRight, Trophy, Zap, Star, Filter, ArrowUp
} from "lucide-react";

// 카테고리 정의
const CATEGORIES = [
    { id: "all", label: "전체", icon: MessageSquare, color: "electric" },
    { id: "question", label: "질문 Q&A", icon: HelpCircle, color: "yellow-400" },
    { id: "free", label: "자유 Talk", icon: MessageCircle, color: "accent-cyan" },
    { id: "homework", label: "과제 HW", icon: BookOpen, color: "accent-indigo" },
    { id: "study", label: "스터디", icon: Users, color: "purple-400" },
    { id: "notice", label: "공지사항", icon: Bell, color: "red-400" },
    { id: "gallery", label: "갤러리", icon: ImageIcon, color: "pink-400" },
];

// 샘플 게시글 데이터
const SAMPLE_POSTS = [
    {
        id: 1,
        title: "C언어 포인터 질문입니다",
        content: "포인터와 배열의 차이가 헷갈립니다...",
        category: "question",
        author: "코딩왕",
        authorLevel: 5,
        isAnonymous: false,
        isPinned: true,
        viewCount: 128,
        commentCount: 12,
        likeCount: 8,
        tags: ["C언어", "포인터"],
        timeAgo: "2시간 전",
        hasAccepted: true,
    },
    {
        id: 2,
        title: "오늘 수업 정리 공유합니다!",
        content: "아두이노 LED 제어 관련 노트입니다",
        category: "free",
        author: "익명",
        authorLevel: 3,
        isAnonymous: true,
        isPinned: false,
        viewCount: 56,
        commentCount: 5,
        likeCount: 15,
        tags: ["아두이노", "노트공유"],
        timeAgo: "5시간 전",
        hasAccepted: false,
    },
    {
        id: 3,
        title: "[공지] 1월 4주차 과제 안내",
        content: "이번 주 과제 마감일 안내드립니다",
        category: "notice",
        author: "선생님",
        authorLevel: 10,
        isAnonymous: false,
        isPinned: true,
        viewCount: 234,
        commentCount: 3,
        likeCount: 0,
        tags: ["공지", "과제"],
        timeAgo: "1일 전",
        hasAccepted: false,
    },
];

export default function Community() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

    const filteredPosts = SAMPLE_POSTS.filter(post =>
        selectedCategory === "all" || post.category === selectedCategory
    );

    const getCategoryInfo = (categoryId: string) => {
        return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
    };

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
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-2" style={{ textShadow: '0 0 60px rgba(0,255,136,0.4)' }}>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric via-accent-cyan to-electric">
                                        커뮤니티
                                    </span>
                                </h1>
                                <p className="text-frost-muted text-lg">학생들끼리 소통하고, 질문하고, 함께 성장해요!</p>
                            </div>

                            {/* Write Button */}
                            <Button className="bg-gradient-to-r from-electric to-accent-cyan text-midnight font-bold px-6 py-3 rounded-xl shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:shadow-[0_0_50px_rgba(0,255,136,0.5)] transition-all">
                                <Plus className="w-5 h-5 mr-2" />
                                글쓰기
                            </Button>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

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
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${isActive
                                            ? 'bg-electric/20 text-electric border border-electric/40 shadow-[0_0_20px_rgba(0,255,136,0.2)]'
                                            : 'bg-white/5 text-frost-muted hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{cat.label}</span>
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

            {/* Posts List */}
            <section className="px-4 md:px-8 relative z-10 pb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-4">
                        {filteredPosts.map((post, index) => {
                            const catInfo = getCategoryInfo(post.category);
                            const CatIcon = catInfo.icon;

                            return (
                                <AnimatedSection key={post.id} delay={index * 50}>
                                    <div className="group relative">
                                        {/* Hover Glow */}
                                        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-electric/0 via-electric/0 to-electric/0 group-hover:from-electric/20 group-hover:via-accent-cyan/20 group-hover:to-accent-indigo/20 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />

                                        <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] border border-white/10 group-hover:border-electric/30 rounded-2xl p-5 transition-all cursor-pointer">
                                            <div className="flex items-start gap-4">
                                                {/* Category Icon */}
                                                <div className={`w-12 h-12 rounded-xl bg-${catInfo.color}/20 border border-${catInfo.color}/40 flex items-center justify-center flex-shrink-0`}>
                                                    <CatIcon className={`w-6 h-6 text-${catInfo.color}`} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {post.isPinned && (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                                                                <Pin className="w-3 h-3" />
                                                                고정
                                                            </span>
                                                        )}
                                                        {post.hasAccepted && (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-electric/20 text-electric text-xs font-medium">
                                                                ✓ 해결됨
                                                            </span>
                                                        )}
                                                        <span className={`px-2 py-0.5 rounded-md bg-white/10 text-frost-muted text-xs`}>
                                                            {catInfo.label}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-electric transition-colors mb-2 line-clamp-1">
                                                        {post.title}
                                                    </h3>

                                                    <p className="text-frost-muted text-sm mb-3 line-clamp-1">{post.content}</p>

                                                    {/* Tags */}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        {post.tags.map((tag) => (
                                                            <span key={tag} className="px-2 py-0.5 rounded-md bg-accent-cyan/10 text-accent-cyan text-xs border border-accent-cyan/20">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Meta */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4 text-xs text-frost-muted">
                                                            <span className="flex items-center gap-1.5">
                                                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-electric/30 to-accent-cyan/30 flex items-center justify-center border border-electric/30`}>
                                                                    <span className="text-[10px] font-bold text-electric">{post.authorLevel}</span>
                                                                </div>
                                                                {post.isAnonymous ? "익명" : post.author}
                                                            </span>
                                                            <span>{post.timeAgo}</span>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-xs text-frost-muted">
                                                            <span className="flex items-center gap-1">
                                                                <Eye className="w-3.5 h-3.5" />
                                                                {post.viewCount}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MessageCircle className="w-3.5 h-3.5" />
                                                                {post.commentCount}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-electric">
                                                                <ThumbsUp className="w-3.5 h-3.5" />
                                                                {post.likeCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Arrow */}
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
        </div>
    );
}
