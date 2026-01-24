import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { Navigation } from "@/components/layout/Navigation";
import { BlockEditor } from "@/components/notion/BlockEditor";
import { PageSidebar } from "@/components/notion/PageSidebar";
import {
    Smile, Image, ChevronDown, MoreHorizontal, Star, StarOff,
    Trash2, Copy, Link, Clock, Users, Lock, Loader2
} from "lucide-react";
import { toast } from "sonner";

interface NotionPage {
    id: number;
    title: string;
    icon?: string;
    coverUrl?: string;
    content?: any;
    parentId?: number | null;
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function NotesPage() {
    const [, setLocation] = useLocation();
    const params = useParams<{ pageId: string }>();
    const pageId = params.pageId;

    const [member, setMember] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState<NotionPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [title, setTitle] = useState("");
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Auth check
    useEffect(() => {
        const storedMember = localStorage.getItem("member");
        if (storedMember) {
            setMember(JSON.parse(storedMember));
        } else {
            toast.error("로그인이 필요합니다");
            setLocation("/login");
        }
    }, [setLocation]);

    // Load page
    useEffect(() => {
        if (pageId && member?.id) {
            loadPage(parseInt(pageId));
        } else if (member?.id) {
            setLoading(false);
        }
    }, [pageId, member?.id]);

    const loadPage = async (id: number) => {
        setLoading(true);
        try {
            const input = encodeURIComponent(JSON.stringify({ pageId: id, memberId: member.id }));
            const res = await fetch(`/api/trpc/notion.pages.get?input=${input}`);
            const data = await res.json();

            if (data.result?.data) {
                setCurrentPage(data.result.data);
                setTitle(data.result.data.title || "Untitled");
            }
        } catch (e) {
            console.error(e);
            toast.error("페이지 로드 실패");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePage = async (parentId?: number) => {
        if (!member?.id) return;

        try {
            const input = encodeURIComponent(JSON.stringify({
                memberId: member.id,
                parentId: parentId || null,
                title: "Untitled"
            }));
            const res = await fetch(`/api/trpc/notion.pages.create?input=${input}`);
            const data = await res.json();

            if (data.result?.data) {
                setLocation(`/workspace/${data.result.data.id}`);
                toast.success("새 페이지 생성됨");
            }
        } catch (e) {
            toast.error("페이지 생성 실패");
        }
    };

    const handleSelectPage = (page: any) => {
        setLocation(`/workspace/${page.id}`);
    };

    const handleTitleChange = async (newTitle: string) => {
        setTitle(newTitle);
        if (!currentPage) return;

        try {
            const input = encodeURIComponent(JSON.stringify({
                pageId: currentPage.id,
                memberId: member.id,
                title: newTitle
            }));
            await fetch(`/api/trpc/notion.pages.update?input=${input}`);
        } catch (e) {
            // Silent fail for title
        }
    };

    const handleContentChange = async (content: any) => {
        if (!currentPage || !member?.id) return;
        setSaving(true);
    };

    const handleContentSave = async (content: any) => {
        if (!currentPage || !member?.id) return;

        try {
            const input = encodeURIComponent(JSON.stringify({
                pageId: currentPage.id,
                memberId: member.id,
                content
            }));
            await fetch(`/api/trpc/notion.pages.update?input=${input}`);
            setLastSaved(new Date());
            setSaving(false);
        } catch (e) {
            console.error(e);
            setSaving(false);
        }
    };

    const handleIconChange = async (icon: string) => {
        if (!currentPage || !member?.id) return;
        setShowIconPicker(false);

        try {
            const input = encodeURIComponent(JSON.stringify({
                pageId: currentPage.id,
                memberId: member.id,
                icon
            }));
            await fetch(`/api/trpc/notion.pages.update?input=${input}`);
            setCurrentPage({ ...currentPage, icon });
        } catch (e) {
            toast.error("아이콘 변경 실패");
        }
    };

    // Common emojis for quick pick
    const quickEmojis = ["📝", "📚", "💡", "🎯", "🚀", "⭐", "🔥", "💻", "📊", "✅", "📌", "🗂️"];

    if (!member) {
        return (
            <div className="min-h-screen bg-midnight flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-electric" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-midnight flex">
            {/* Sidebar */}
            <aside
                className={`transition-all duration-300 ${sidebarCollapsed ? "w-0" : "w-64"} overflow-hidden`}
            >
                <PageSidebar
                    memberId={member.id}
                    currentPageId={currentPage?.id}
                    onSelectPage={handleSelectPage}
                    onCreatePage={handleCreatePage}
                />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                <Navigation />

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-electric" />
                    </div>
                ) : currentPage ? (
                    <div className="flex-1 pt-20">
                        {/* Cover Image Area */}
                        {currentPage.coverUrl && (
                            <div
                                className="h-48 bg-cover bg-center"
                                style={{ backgroundImage: `url(${currentPage.coverUrl})` }}
                            />
                        )}

                        {/* Page Header */}
                        <div className="max-w-4xl mx-auto px-8 py-8">
                            {/* Icon */}
                            <div className="relative mb-4">
                                <button
                                    onClick={() => setShowIconPicker(!showIconPicker)}
                                    className="text-6xl hover:bg-white/5 p-2 rounded-lg transition-all"
                                >
                                    {currentPage.icon || "📄"}
                                </button>

                                {showIconPicker && (
                                    <div className="absolute top-full left-0 mt-2 p-3 bg-midnight-card border border-white/10 rounded-xl shadow-2xl z-50">
                                        <p className="text-xs text-frost-muted mb-2">Quick pick</p>
                                        <div className="flex flex-wrap gap-2 max-w-[200px]">
                                            {quickEmojis.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleIconChange(emoji)}
                                                    className="text-2xl p-1 hover:bg-white/10 rounded"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Untitled"
                                className="w-full text-4xl font-bold bg-transparent text-white placeholder:text-frost-muted/30 outline-none mb-2"
                            />

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-sm text-frost-muted mb-8">
                                {saving && (
                                    <span className="flex items-center gap-1">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        저장 중...
                                    </span>
                                )}
                                {lastSaved && !saving && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {lastSaved.toLocaleTimeString()} 저장됨
                                    </span>
                                )}
                            </div>

                            {/* Block Editor */}
                            <BlockEditor
                                content={currentPage.content}
                                onChange={handleContentChange}
                                onSave={handleContentSave}
                                placeholder="Type '/' for commands..."
                                autoSave
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center pt-20">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📝</div>
                            <h2 className="text-2xl font-bold text-white mb-2">노트를 선택하거나 생성하세요</h2>
                            <p className="text-frost-muted mb-6">왼쪽 사이드바에서 노트를 선택하거나 새로 만들 수 있습니다</p>
                            <button
                                onClick={() => handleCreatePage()}
                                className="px-6 py-3 bg-electric text-midnight font-bold rounded-xl hover:bg-electric/90 transition-all"
                            >
                                새 노트 만들기
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
