import { useState, useEffect, useRef, useCallback } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import {
    ArrowLeft, Save, Share2, Download, Trash2, Eye, EyeOff,
    Bold, Italic, Underline, Strikethrough, List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3,
    Code, Quote, Link as LinkIcon, Image, Undo, Redo, FileText, Loader2,
    Palette, Type, Maximize2, Minimize2, Plus, FolderOpen, Search,
    Clock, Star, MoreVertical, ChevronLeft, ChevronRight, Highlighter,
    Subscript, Superscript, Table, Minus, CheckSquare
} from "lucide-react";

// Types
interface Note {
    id: number;
    title: string;
    content: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

// Ultra-Premium Rich Text Toolbar
function RichTextToolbar({ onFormat, onInsertLink, onInsertImage }: {
    onFormat: (command: string, value?: string) => void;
    onInsertLink: () => void;
    onInsertImage: () => void;
}) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);

    const colors = [
        "#00FF88", "#FF6B6B", "#4ECDC4", "#FFE66D", "#A855F7",
        "#3B82F6", "#F97316", "#EC4899", "#14B8A6", "#FFFFFF"
    ];

    const ToolButton = ({ icon: Icon, command, value, tooltip, active }: any) => (
        <button
            onMouseDown={(e) => { e.preventDefault(); onFormat(command, value); }}
            className={`p-2 rounded-lg transition-all duration-200 ${active
                ? 'bg-electric/30 text-electric shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                : 'hover:bg-white/10 text-white/70 hover:text-white'
                }`}
            title={tooltip}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gradient-to-r from-midnight-card/80 to-midnight/80 border-b border-white/10 backdrop-blur-xl sticky top-0 z-10">
            {/* Undo/Redo */}
            <ToolButton icon={Undo} command="undo" tooltip="실행 취소 (Ctrl+Z)" />
            <ToolButton icon={Redo} command="redo" tooltip="다시 실행 (Ctrl+Y)" />

            <div className="w-px h-6 bg-white/20 mx-1" />

            {/* Text Style */}
            <ToolButton icon={Bold} command="bold" tooltip="굵게 (Ctrl+B)" />
            <ToolButton icon={Italic} command="italic" tooltip="기울임 (Ctrl+I)" />
            <ToolButton icon={Underline} command="underline" tooltip="밑줄 (Ctrl+U)" />
            <ToolButton icon={Strikethrough} command="strikeThrough" tooltip="취소선" />
            <ToolButton icon={Highlighter} command="backColor" value="#FFFF00" tooltip="하이라이트" />

            <div className="w-px h-6 bg-white/20 mx-1" />

            {/* Headings */}
            <select
                onChange={(e) => onFormat("formatBlock", e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white/80 text-xs font-medium cursor-pointer hover:bg-white/15 transition-colors"
                defaultValue=""
            >
                <option value="" disabled>제목</option>
                <option value="h1">제목 1</option>
                <option value="h2">제목 2</option>
                <option value="h3">제목 3</option>
                <option value="p">본문</option>
            </select>

            {/* Font Size */}
            <select
                onChange={(e) => onFormat("fontSize", e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white/80 text-xs font-medium cursor-pointer hover:bg-white/15 transition-colors"
                defaultValue="3"
            >
                <option value="1">10px</option>
                <option value="2">13px</option>
                <option value="3">16px</option>
                <option value="4">18px</option>
                <option value="5">24px</option>
                <option value="6">32px</option>
                <option value="7">48px</option>
            </select>

            <div className="w-px h-6 bg-white/20 mx-1" />

            {/* Colors */}
            <div className="relative">
                <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center gap-1"
                    title="글자 색상"
                >
                    <Type className="w-4 h-4" />
                    <div className="w-3 h-1 bg-electric rounded-full" />
                </button>
                {showColorPicker && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-midnight-card border border-white/20 rounded-xl shadow-2xl z-50 grid grid-cols-5 gap-1">
                        {colors.map(color => (
                            <button
                                key={color}
                                onClick={() => { onFormat("foreColor", color); setShowColorPicker(false); }}
                                className="w-6 h-6 rounded-md border border-white/20 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="w-px h-6 bg-white/20 mx-1" />

            {/* Lists */}
            <ToolButton icon={List} command="insertUnorderedList" tooltip="글머리 기호" />
            <ToolButton icon={ListOrdered} command="insertOrderedList" tooltip="번호 매기기" />
            <ToolButton icon={CheckSquare} command="insertHTML" value='<input type="checkbox" /> ' tooltip="체크리스트" />

            <div className="w-px h-6 bg-white/20 mx-1" />

            {/* Alignment */}
            <ToolButton icon={AlignLeft} command="justifyLeft" tooltip="왼쪽 정렬" />
            <ToolButton icon={AlignCenter} command="justifyCenter" tooltip="가운데 정렬" />
            <ToolButton icon={AlignRight} command="justifyRight" tooltip="오른쪽 정렬" />

            <div className="w-px h-6 bg-white/20 mx-1" />

            {/* Blocks */}
            <ToolButton icon={Quote} command="formatBlock" value="blockquote" tooltip="인용문" />
            <ToolButton icon={Code} command="formatBlock" value="pre" tooltip="코드 블록" />
            <ToolButton icon={Minus} command="insertHorizontalRule" tooltip="구분선" />

            <div className="w-px h-6 bg-white/20 mx-1" />

            {/* Insert */}
            <button
                onClick={onInsertLink}
                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="링크 삽입"
            >
                <LinkIcon className="w-4 h-4" />
            </button>
            <button
                onClick={onInsertImage}
                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="이미지 삽입"
            >
                <Image className="w-4 h-4" />
            </button>
        </div>
    );
}

// Notes List Sidebar
function NotesSidebar({ notes, selectedId, onSelect, onCreate, onSearch, isLoading }: {
    notes: Note[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onCreate: () => void;
    onSearch: (query: string) => void;
    isLoading: boolean;
}) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-72 bg-midnight-card/50 border-r border-white/10 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-accent-cyan" />
                        내 메모
                    </h2>
                    <Button
                        onClick={onCreate}
                        size="sm"
                        className="bg-electric hover:bg-electric/80 text-black font-bold h-8 w-8 p-0"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        placeholder="메모 검색..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); onSearch(e.target.value); }}
                        className="pl-9 bg-white/5 border-white/20 text-white h-9"
                    />
                </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 text-electric animate-spin" />
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="p-6 text-center text-white/40">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">메모가 없습니다</p>
                        <Button
                            onClick={onCreate}
                            variant="ghost"
                            className="mt-2 text-electric hover:text-electric/80"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            새 메모 만들기
                        </Button>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {filteredNotes.map(note => (
                            <button
                                key={note.id}
                                onClick={() => onSelect(note.id)}
                                className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${selectedId === note.id
                                    ? 'bg-electric/20 border border-electric/40 shadow-[0_0_15px_rgba(0,255,136,0.2)]'
                                    : 'hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <h3 className={`font-medium truncate ${selectedId === note.id ? 'text-electric' : 'text-white/90'
                                        }`}>
                                        {note.title || "제목 없음"}
                                    </h3>
                                    {note.isPublic && (
                                        <Eye className="w-3 h-3 text-accent-cyan flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-white/40 mt-1 line-clamp-2">
                                    {note.content?.replace(/<[^>]*>/g, '').slice(0, 60) || "내용 없음"}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-white/30">
                                    <Clock className="w-3 h-3" />
                                    {new Date(note.updatedAt).toLocaleDateString()}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ClassNotesEditor() {
    const [, navigate] = useLocation();
    const params = useParams();
    const urlNoteId = params.id ? parseInt(params.id) : null;

    const [member, setMember] = useState<any>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(urlNoteId);
    const [title, setTitle] = useState("새 메모");
    const [isPublic, setIsPublic] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingNotes, setIsLoadingNotes] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showSidebar, setShowSidebar] = useState(true);

    const editorRef = useRef<HTMLDivElement>(null);

    // Auth check
    useEffect(() => {
        const storedMember = localStorage.getItem("member");
        if (storedMember) {
            try {
                const parsed = JSON.parse(storedMember);
                if (parsed.isStudent) {
                    setMember(parsed);
                } else {
                    toast.error("학원 코드를 입력한 계정만 이용 가능합니다");
                    navigate("/login");
                }
            } catch (e) {
                navigate("/login");
            }
        } else {
            toast.error("로그인이 필요합니다");
            navigate("/login");
        }
    }, [navigate]);

    // Load notes list
    const loadNotes = useCallback(async () => {
        if (!member) return;

        setIsLoadingNotes(true);
        try {
            const res = await fetch(`/api/trpc/community.classNotes.list?input=${encodeURIComponent(JSON.stringify({ memberId: member.id }))}`);
            const data = await res.json();
            if (data.result?.data) {
                setNotes(data.result.data);
            }
        } catch (e) {
            console.error("Failed to load notes:", e);
        } finally {
            setIsLoadingNotes(false);
        }
    }, [member]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    // Load selected note
    useEffect(() => {
        if (selectedNoteId && member) {
            const fetchNote = async () => {
                try {
                    const res = await fetch(`/api/trpc/community.classNotes.get?input=${encodeURIComponent(JSON.stringify({ id: selectedNoteId }))}`);
                    const data = await res.json();
                    if (data.result?.data) {
                        setTitle(data.result.data.title);
                        setIsPublic(data.result.data.isPublic);
                        if (editorRef.current) {
                            editorRef.current.innerHTML = data.result.data.content || "";
                        }
                    }
                } catch (e) {
                    console.error("Failed to load note:", e);
                }
            };
            fetchNote();
        } else if (editorRef.current) {
            // New note
            setTitle("새 메모");
            setIsPublic(false);
            editorRef.current.innerHTML = "";
        }
    }, [selectedNoteId, member]);

    // Format command
    const handleFormat = useCallback((command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    }, []);

    // Insert link
    const handleInsertLink = () => {
        const url = prompt("링크 URL을 입력하세요:");
        if (url) {
            document.execCommand("createLink", false, url);
        }
    };

    // Insert image
    const handleInsertImage = () => {
        const url = prompt("이미지 URL을 입력하세요:");
        if (url) {
            document.execCommand("insertImage", false, url);
        }
    };

    // Save note
    const handleSave = async () => {
        if (!member) return;

        setIsSaving(true);
        const content = editorRef.current?.innerHTML || "";

        try {
            if (selectedNoteId) {
                // Update existing note
                await fetch("/api/trpc/community.classNotes.update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: selectedNoteId, title, content, isPublic })
                });
                toast.success("저장되었습니다");
            } else {
                // Create new note
                const res = await fetch("/api/trpc/community.classNotes.create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ memberId: member.id, title, content, isPublic })
                });
                const data = await res.json();
                if (data.result?.data?.id) {
                    setSelectedNoteId(data.result.data.id);
                    toast.success("저장되었습니다");
                }
            }
            setLastSaved(new Date());
            loadNotes(); // Refresh list
        } catch (error) {
            toast.error("저장 실패");
        } finally {
            setIsSaving(false);
        }
    };

    // Create new note
    const handleCreateNew = () => {
        setSelectedNoteId(null);
        setTitle("새 메모");
        setIsPublic(false);
        if (editorRef.current) {
            editorRef.current.innerHTML = "";
        }
        editorRef.current?.focus();
    };

    // Delete note
    const handleDelete = async () => {
        if (!selectedNoteId) return;

        if (!confirm("정말 삭제하시겠습니까?")) return;

        try {
            await fetch("/api/trpc/community.classNotes.delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedNoteId })
            });
            toast.success("삭제되었습니다");
            handleCreateNew();
            loadNotes();
        } catch (e) {
            toast.error("삭제 실패");
        }
    };

    // Auto-save every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (member && editorRef.current?.innerHTML && editorRef.current.innerHTML.length > 10) {
                handleSave();
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [member, title, isPublic, selectedNoteId]);

    // Fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Download as HTML
    const handleDownload = () => {
        const content = editorRef.current?.innerHTML || "";
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: 'Pretendard', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.8; background: #0a0a0f; color: #e2e8f0; }
        h1 { color: #00FF88; border-bottom: 2px solid #00FF88; padding-bottom: 10px; }
        h2 { color: #4ECDC4; margin-top: 30px; }
        h3 { color: #A855F7; }
        blockquote { border-left: 4px solid #00FF88; padding-left: 20px; margin: 20px 0; color: #94a3b8; background: rgba(0,255,136,0.1); padding: 15px 20px; border-radius: 0 8px 8px 0; }
        pre { background: #1e1e2e; color: #00FF88; padding: 20px; border-radius: 12px; overflow-x: auto; }
        code { background: rgba(0,255,136,0.2); padding: 2px 6px; border-radius: 4px; color: #00FF88; }
        a { color: #00FF88; }
        img { max-width: 100%; border-radius: 12px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${content}
</body>
</html>`;

        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("다운로드 완료");
    };

    // Share link
    const handleShare = async () => {
        if (!selectedNoteId) {
            toast.error("먼저 저장해주세요");
            return;
        }

        const url = `${window.location.origin}/notes/${selectedNoteId}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success("링크가 복사되었습니다");
        } catch {
            toast.error("복사 실패");
        }
    };

    // Editor styles
    const editorStyles = `
        .note-editor h1 { font-size: 2em; font-weight: 700; color: #00FF88; margin: 1em 0 0.5em; border-bottom: 2px solid rgba(0,255,136,0.3); padding-bottom: 0.3em; }
        .note-editor h2 { font-size: 1.5em; font-weight: 600; color: #4ECDC4; margin: 0.8em 0 0.4em; }
        .note-editor h3 { font-size: 1.25em; font-weight: 600; color: #A855F7; margin: 0.6em 0 0.3em; }
        .note-editor blockquote { border-left: 4px solid #00FF88; padding: 12px 20px; margin: 16px 0; background: rgba(0,255,136,0.1); border-radius: 0 8px 8px 0; }
        .note-editor pre { background: #1e1e2e; padding: 16px; border-radius: 12px; overflow-x: auto; font-family: 'JetBrains Mono', monospace; }
        .note-editor code { background: rgba(0,255,136,0.2); padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; }
        .note-editor ul, .note-editor ol { padding-left: 24px; margin: 12px 0; }
        .note-editor li { margin: 6px 0; }
        .note-editor a { color: #00FF88; text-decoration: underline; }
        .note-editor img { max-width: 100%; border-radius: 12px; margin: 16px 0; }
        .note-editor hr { border: none; border-top: 2px solid rgba(255,255,255,0.1); margin: 24px 0; }
    `;

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 ${isFullscreen ? '' : ''}`}>
            <style>{editorStyles}</style>
            {!isFullscreen && <Navigation />}

            <div className={`${isFullscreen ? 'h-screen' : 'pt-20'} flex`}>
                {/* Sidebar Toggle for Mobile */}
                <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-midnight-card border border-white/20 p-2 rounded-r-xl md:hidden"
                >
                    {showSidebar ? <ChevronLeft className="w-4 h-4 text-white" /> : <ChevronRight className="w-4 h-4 text-white" />}
                </button>

                {/* Notes Sidebar */}
                <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform fixed md:relative z-40 h-full`}>
                    <NotesSidebar
                        notes={notes}
                        selectedId={selectedNoteId}
                        onSelect={setSelectedNoteId}
                        onCreate={handleCreateNew}
                        onSearch={() => { }}
                        isLoading={isLoadingNotes}
                    />
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Header Bar */}
                    <div className="flex items-center justify-between gap-4 p-4 bg-midnight-card/50 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/community")}
                                className="text-white/60 hover:text-white h-9"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                커뮤니티
                            </Button>

                            <div className="w-px h-6 bg-white/20" />

                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="메모 제목"
                                className="bg-transparent border-none text-white text-lg font-bold w-48 md:w-64 p-0 h-auto focus-visible:ring-0"
                            />
                        </div>

                        <div className="flex items-center gap-1">
                            {lastSaved && (
                                <span className="text-white/30 text-xs mr-2 hidden md:inline">
                                    {lastSaved.toLocaleTimeString()} 저장
                                </span>
                            )}

                            <Button
                                variant="ghost"
                                onClick={() => setIsPublic(!isPublic)}
                                className={`h-9 w-9 p-0 ${isPublic ? 'text-electric' : 'text-white/40'}`}
                                title={isPublic ? "공개" : "비공개"}
                            >
                                {isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>

                            <Button variant="ghost" onClick={toggleFullscreen} className="h-9 w-9 p-0 text-white/40 hover:text-white">
                                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </Button>

                            <Button variant="ghost" onClick={handleDownload} className="h-9 w-9 p-0 text-white/40 hover:text-white">
                                <Download className="w-4 h-4" />
                            </Button>

                            <Button variant="ghost" onClick={handleShare} className="h-9 w-9 p-0 text-white/40 hover:text-white">
                                <Share2 className="w-4 h-4" />
                            </Button>

                            {selectedNoteId && (
                                <Button variant="ghost" onClick={handleDelete} className="h-9 w-9 p-0 text-red-400/60 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}

                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-electric hover:bg-electric/80 text-black font-bold h-9 px-4"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-1" />
                                        저장
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Ultra-Premium Toolbar */}
                    <RichTextToolbar
                        onFormat={handleFormat}
                        onInsertLink={handleInsertLink}
                        onInsertImage={handleInsertImage}
                    />

                    {/* Content Editor */}
                    <div className="flex-1 overflow-y-auto">
                        <div
                            ref={editorRef}
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            className="note-editor p-8 outline-none text-white/90 leading-relaxed min-h-full cursor-text"
                            style={{ fontSize: '16px', lineHeight: '1.8', minHeight: '400px' }}
                            onFocus={(e) => {
                                // Ensure cursor is visible when empty
                                if (e.currentTarget.innerHTML === '') {
                                    e.currentTarget.innerHTML = '<p><br></p>';
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
