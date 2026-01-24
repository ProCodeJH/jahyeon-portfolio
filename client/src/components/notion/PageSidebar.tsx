import { useState, useEffect } from "react";
import {
    FileText, Plus, Star, StarOff, ChevronRight, ChevronDown,
    MoreHorizontal, Trash2, Edit3, Copy, Loader2, Search
} from "lucide-react";
import { toast } from "sonner";

interface NotionPage {
    id: number;
    title: string;
    icon?: string;
    parentId?: number | null;
    children?: NotionPage[];
    isFavorite: boolean;
    updatedAt: string;
}

interface PageSidebarProps {
    memberId: number;
    currentPageId?: number;
    onSelectPage: (page: NotionPage) => void;
    onCreatePage: (parentId?: number) => void;
}

export function PageSidebar({
    memberId,
    currentPageId,
    onSelectPage,
    onCreatePage
}: PageSidebarProps) {
    const [pages, setPages] = useState<NotionPage[]>([]);
    const [favorites, setFavorites] = useState<NotionPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        loadPages();
    }, [memberId]);

    const loadPages = async () => {
        try {
            const input = encodeURIComponent(JSON.stringify({ memberId }));
            const res = await fetch(`/api/trpc/notion.pages.list?input=${input}`);
            const data = await res.json();

            if (data.result?.data) {
                const allPages = data.result.data;
                setPages(buildTree(allPages.filter((p: NotionPage) => !p.parentId)));
                setFavorites(allPages.filter((p: NotionPage) => p.isFavorite));
            } else {
                setPages([]);
                setFavorites([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const buildTree = (items: NotionPage[], parentId?: number): NotionPage[] => {
        return items
            .filter(item => item.parentId === parentId)
            .map(item => ({
                ...item,
                children: buildTree(items, item.id)
            }));
    };

    const toggleExpand = (id: number) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    const handleToggleFavorite = async (page: NotionPage, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const input = encodeURIComponent(JSON.stringify({
                pageId: page.id,
                isFavorite: !page.isFavorite,
                memberId
            }));
            await fetch(`/api/trpc/notion.pages.toggleFavorite?input=${input}`);
            loadPages();
            toast.success(page.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가");
        } catch (e) {
            toast.error("오류 발생");
        }
    };

    const handleDelete = async (page: NotionPage, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`"${page.title}" 페이지를 삭제하시겠습니까?`)) return;

        try {
            const input = encodeURIComponent(JSON.stringify({
                pageId: page.id,
                memberId
            }));
            await fetch(`/api/trpc/notion.pages.delete?input=${input}`);
            loadPages();
            toast.success("페이지 삭제됨");
        } catch (e) {
            toast.error("삭제 실패");
        }
    };

    const renderPageItem = (page: NotionPage, depth: number = 0) => {
        const isExpanded = expandedIds.has(page.id);
        const hasChildren = page.children && page.children.length > 0;
        const isActive = currentPageId === page.id;

        return (
            <div key={page.id}>
                <button
                    onClick={() => onSelectPage(page)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all group
                        ${isActive
                            ? "bg-electric/20 text-white"
                            : "hover:bg-white/5 text-frost-muted hover:text-white"
                        }`}
                    style={{ paddingLeft: `${(depth * 16) + 8}px` }}
                >
                    {/* Expand/Collapse */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(page.id);
                        }}
                        className={`p-0.5 hover:bg-white/10 rounded transition-all ${!hasChildren && "invisible"}`}
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>

                    {/* Icon */}
                    <span className="text-lg">
                        {page.icon || "📄"}
                    </span>

                    {/* Title */}
                    <span className="flex-1 truncate text-sm">
                        {page.title || "Untitled"}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => handleToggleFavorite(page, e)}
                            className="p-1 hover:bg-white/10 rounded"
                        >
                            {page.isFavorite ? (
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            ) : (
                                <StarOff className="w-3 h-3" />
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreatePage(page.id);
                            }}
                            className="p-1 hover:bg-white/10 rounded"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                        <button
                            onClick={(e) => handleDelete(page, e)}
                            className="p-1 hover:bg-red-500/20 rounded text-frost-muted hover:text-red-400"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </button>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div>
                        {page.children!.map(child => renderPageItem(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-electric" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-midnight-card border-r border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-electric" />
                        노트
                    </h2>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="p-2 hover:bg-white/10 rounded-lg text-frost-muted hover:text-white"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onCreatePage()}
                            className="p-2 bg-electric/20 hover:bg-electric/30 rounded-lg text-electric"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Search */}
                {showSearch && (
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="페이지 검색..."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-frost text-sm"
                        autoFocus
                    />
                )}
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
                <div className="p-2 border-b border-white/5">
                    <p className="text-xs text-frost-muted px-2 py-1">FAVORITES</p>
                    {favorites.map(page => renderPageItem(page))}
                </div>
            )}

            {/* All Pages */}
            <div className="flex-1 overflow-y-auto p-2">
                <p className="text-xs text-frost-muted px-2 py-1">PRIVATE</p>
                {pages.length === 0 ? (
                    <div className="text-center py-8 text-frost-muted">
                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">노트가 없습니다</p>
                        <button
                            onClick={() => onCreatePage()}
                            className="mt-2 text-electric text-sm hover:underline"
                        >
                            새 노트 만들기
                        </button>
                    </div>
                ) : (
                    pages.map(page => renderPageItem(page))
                )}
            </div>
        </div>
    );
}

export default PageSidebar;
