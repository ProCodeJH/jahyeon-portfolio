import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotionEditor } from "@/components/notion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
    FileText, Plus, Search, Star, Clock, Share2, Lock,
    Trash2, Save, Download, Moon, Sun, Loader2,
    ChevronLeft, ChevronRight, FolderPlus
} from "lucide-react";

// 노트 타입
interface Note {
    id: number;
    memberId: number;
    title: string;
    blocks: string | null;
    folderId: number | null;
    isPublic: boolean;
    viewCount: number;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export default function Notes() {
    const [, navigate] = useLocation();
    const [member, setMember] = useState<any>(null);

    // 테마 상태
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        return (localStorage.getItem('notion-theme') as 'dark' | 'light') || 'dark';
    });

    // UI 상태
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [editorContent, setEditorContent] = useState("");
    const [noteTitle, setNoteTitle] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isNewNote, setIsNewNote] = useState(false);

    // 테마 변경 시 저장
    useEffect(() => {
        localStorage.setItem('notion-theme', theme);
    }, [theme]);

    // 인증 체크
    useEffect(() => {
        const storedMember = localStorage.getItem("member");
        if (storedMember) {
            try {
                const parsed = JSON.parse(storedMember);
                setMember(parsed);
            } catch (e) {
                toast.error("로그인이 필요합니다");
                navigate("/login");
            }
        } else {
            toast.error("로그인이 필요합니다");
            navigate("/login");
        }
    }, [navigate]);

    // tRPC Queries
    const { data: notes = [], isLoading, refetch } = trpc.community.classNotes.list.useQuery(
        { memberId: member?.id || 0 },
        { enabled: !!member?.id }
    );

    // tRPC Mutations
    const createNoteMutation = trpc.community.classNotes.create.useMutation({
        onSuccess: () => {
            refetch();
            toast.success("노트가 생성되었습니다");
        },
        onError: (error) => {
            toast.error(error.message || "노트 생성 실패");
        }
    });

    const updateNoteMutation = trpc.community.classNotes.update.useMutation({
        onSuccess: () => {
            refetch();
            toast.success("노트가 저장되었습니다");
        },
        onError: (error) => {
            toast.error(error.message || "저장 실패");
        }
    });

    const deleteNoteMutation = trpc.community.classNotes.delete.useMutation({
        onSuccess: () => {
            refetch();
            setSelectedNote(null);
            setNoteTitle("");
            setEditorContent("");
            toast.success("노트가 삭제되었습니다");
        },
        onError: (error) => {
            toast.error(error.message || "삭제 실패");
        }
    });

    // 필터링된 노트
    const filteredNotes = (notes as Note[]).filter(note =>
        searchQuery ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
    );

    // 노트 선택
    const handleSelectNote = (note: Note) => {
        setSelectedNote(note);

        // blocks에서 HTML 콘텐츠 추출
        let htmlContent = "";
        let titleFromBlocks = note.title;

        if (note.blocks) {
            try {
                const parsed = JSON.parse(note.blocks);
                htmlContent = parsed.html || "";
                titleFromBlocks = parsed.title || note.title;
            } catch {
                // JSON 파싱 실패시 그대로 사용 (이전 형식 호환)
                htmlContent = note.blocks;
            }
        }

        setNoteTitle(titleFromBlocks);
        setEditorContent(htmlContent);
        setIsNewNote(false);
    };

    // 새 노트 생성
    const handleNewNote = () => {
        if (!member) {
            toast.error("로그인이 필요합니다");
            return;
        }
        setSelectedNote(null);
        setNoteTitle("제목 없는 노트");
        setEditorContent("");
        setIsNewNote(true);
    };

    // 노트 저장
    const handleSave = async () => {
        if (!noteTitle.trim()) {
            toast.error("제목을 입력해주세요");
            return;
        }
        if (!member) {
            toast.error("로그인이 필요합니다");
            return;
        }

        setIsSaving(true);

        try {
            // blocks는 JSON 문자열로 저장 (HTML 콘텐츠를 JSON으로 감싸기)
            const blocksJson = JSON.stringify({ html: editorContent, title: noteTitle });

            if (isNewNote) {
                const result = await createNoteMutation.mutateAsync({
                    memberId: member.id,
                    blocks: blocksJson,
                });
                // 생성 후 해당 노트 선택
                setIsNewNote(false);
            } else if (selectedNote) {
                await updateNoteMutation.mutateAsync({
                    id: selectedNote.id,
                    memberId: member.id,
                    blocks: blocksJson,
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    // 노트 삭제
    const handleDelete = () => {
        if (!selectedNote || !member) return;

        if (confirm("정말 삭제하시겠습니까?")) {
            deleteNoteMutation.mutate({
                id: selectedNote.id,
                memberId: member.id,
            });
        }
    };

    // 에디터 변경 핸들러
    const handleEditorChange = (html: string) => {
        setEditorContent(html);
    };

    // 테마 기반 클래스
    const themeClasses = theme === 'dark'
        ? {
            bg: 'bg-midnight',
            text: 'text-frost',
            textMuted: 'text-frost-muted',
            card: 'bg-midnight-card',
            border: 'border-white/10',
            sidebar: 'bg-midnight/50',
            input: 'bg-white/5 border-white/10 text-frost',
            button: 'bg-electric hover:bg-electric-dim text-midnight',
            accent: 'text-electric',
            hover: 'hover:bg-white/5',
            selected: 'bg-electric/20 border-electric/30',
        }
        : {
            bg: 'bg-white',
            text: 'text-gray-900',
            textMuted: 'text-gray-500',
            card: 'bg-gray-50',
            border: 'border-gray-200',
            sidebar: 'bg-gray-50',
            input: 'bg-white border-gray-200 text-gray-900',
            button: 'bg-blue-600 hover:bg-blue-700 text-white',
            accent: 'text-blue-600',
            hover: 'hover:bg-gray-100',
            selected: 'bg-blue-50 border-blue-200',
        };

    // 로딩 상태
    if (!member) {
        return (
            <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
                <Loader2 className={`w-8 h-8 animate-spin ${themeClasses.accent}`} />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} overflow-hidden transition-colors duration-300`}>
            {/* Background - Dark Mode Only */}
            {theme === 'dark' && (
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-midnight via-midnight-card to-midnight" />
                    <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent-indigo/10 rounded-full blur-[150px]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>
            )}

            <Navigation />

            {/* Main Layout */}
            <div className="pt-20 relative z-10 flex h-[calc(100vh-80px)]">
                {/* Sidebar Toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`fixed left-4 top-24 z-50 md:hidden p-2 rounded-lg ${themeClasses.card} ${themeClasses.border} border`}
                >
                    {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>

                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r ${themeClasses.border} ${themeClasses.sidebar} backdrop-blur-xl flex-shrink-0 overflow-hidden`}>
                    <div className="p-4 h-full flex flex-col w-64">
                        {/* Header with Theme Toggle */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-electric to-accent-cyan' : 'bg-gradient-to-br from-blue-500 to-blue-600'} flex items-center justify-center`}>
                                    <FileText className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-lg">Notion</span>
                            </div>
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={`p-2 rounded-lg ${themeClasses.hover} transition-colors`}
                                title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
                            >
                                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* New Note Button */}
                        <Button
                            onClick={handleNewNote}
                            className={`w-full ${themeClasses.button} font-bold rounded-xl mb-4 shadow-lg`}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            새 노트
                        </Button>

                        {/* Quick Access */}
                        <div className="mb-4">
                            <div className={`text-xs ${themeClasses.textMuted} uppercase tracking-wider mb-2 px-2`}>내 노트</div>
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${themeClasses.accent}`}>
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">{filteredNotes.length}개의 노트</span>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${themeClasses.textMuted}`} />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="노트 검색..."
                                className={`pl-10 ${themeClasses.input} h-10 rounded-lg text-sm`}
                            />
                        </div>

                        {/* Notes List */}
                        <div className="flex-1 overflow-y-auto space-y-1">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className={`w-6 h-6 animate-spin ${themeClasses.accent}`} />
                                </div>
                            ) : filteredNotes.length === 0 ? (
                                <div className={`text-center py-8 ${themeClasses.textMuted}`}>
                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">노트가 없습니다</p>
                                    <p className="text-xs mt-1">새 노트를 만들어보세요!</p>
                                </div>
                            ) : (
                                filteredNotes.map((note) => {
                                    // blocks에서 title 추출
                                    let displayTitle = "제목 없음";
                                    try {
                                        const parsed = JSON.parse(note.blocks || "{}");
                                        displayTitle = parsed.title || note.title || "제목 없음";
                                    } catch {
                                        displayTitle = note.title || "제목 없음";
                                    }

                                    return (
                                        <button
                                            key={note.id}
                                            onClick={() => handleSelectNote(note)}
                                            className={`w-full text-left p-3 rounded-xl transition-all border ${selectedNote?.id === note.id
                                                ? themeClasses.selected
                                                : `${themeClasses.hover} border-transparent`
                                                }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <FileText className={`w-4 h-4 flex-shrink-0 mt-0.5 ${selectedNote?.id === note.id ? themeClasses.accent : themeClasses.textMuted
                                                    }`} />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`font-medium text-sm truncate ${selectedNote?.id === note.id ? themeClasses.accent : ''
                                                        }`}>
                                                        {displayTitle}
                                                    </h4>
                                                    <div className={`flex items-center gap-2 mt-1 text-xs ${themeClasses.textMuted}`}>
                                                        <span>{new Date(note.updatedAt).toLocaleDateString('ko-KR')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </aside>

                {/* Editor Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {(selectedNote || isNewNote) ? (
                        <>
                            {/* Editor Header */}
                            <div className={`flex items-center justify-between p-4 border-b ${themeClasses.border} ${themeClasses.sidebar} backdrop-blur-xl`}>
                                <div className="flex-1 mr-4">
                                    <Input
                                        value={noteTitle}
                                        onChange={(e) => setNoteTitle(e.target.value)}
                                        placeholder="노트 제목"
                                        className={`text-xl font-bold bg-transparent border-none ${themeClasses.text} placeholder:${themeClasses.textMuted} focus-visible:ring-0 px-0`}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={themeClasses.button}
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        {isSaving ? "저장 중..." : "저장"}
                                    </Button>
                                    {!isNewNote && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`${themeClasses.textMuted} hover:text-red-500`}
                                            onClick={handleDelete}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Editor Content */}
                            <div className={`flex-1 overflow-y-auto ${theme === 'light' ? 'bg-white' : ''}`}>
                                <div className="max-w-4xl mx-auto p-6">
                                    <NotionEditor
                                        content={editorContent}
                                        onChange={(html) => handleEditorChange(html)}
                                        placeholder="Type '/' for commands..."
                                        autofocus={isNewNote}
                                        theme={theme}
                                        className="min-h-[500px]"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className={`w-24 h-24 rounded-3xl ${theme === 'dark' ? 'bg-gradient-to-br from-electric/20 to-accent-cyan/20 border-electric/20' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'} border flex items-center justify-center mx-auto mb-6`}>
                                    <FileText className={`w-12 h-12 ${themeClasses.accent}`} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">노트를 선택하세요</h3>
                                <p className={`${themeClasses.textMuted} mb-6`}>왼쪽에서 노트를 선택하거나 새 노트를 만드세요</p>
                                <Button
                                    onClick={handleNewNote}
                                    className={`${themeClasses.button} shadow-lg`}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    새 노트 만들기
                                </Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
