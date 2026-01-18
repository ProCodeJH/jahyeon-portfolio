import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FileText, FolderOpen, Plus, Search, Star, Clock, Share2, Lock,
    ChevronRight, ChevronDown, MoreHorizontal, Trash2, Edit3, Copy,
    Type, List, ListOrdered, CheckSquare, Code, Image as ImageIcon,
    Quote, Table, Calculator, Link2, Download, Eye
} from "lucide-react";

// 샘플 폴더 데이터
const SAMPLE_FOLDERS = [
    { id: 1, name: "📚 C언어", icon: "📚", color: "electric", noteCount: 5 },
    { id: 2, name: "🤖 아두이노", icon: "🤖", color: "accent-cyan", noteCount: 8 },
    { id: 3, name: "🐍 파이썬", icon: "🐍", color: "yellow-400", noteCount: 3 },
    { id: 4, name: "⭐ 즐겨찾기", icon: "⭐", color: "yellow-500", noteCount: 2 },
];

// 샘플 노트 데이터
const SAMPLE_NOTES = [
    {
        id: 1,
        title: "C언어 포인터 완전 정복",
        folderId: 1,
        updatedAt: "2시간 전",
        isPublic: false,
        isFavorite: true,
        preview: "포인터는 메모리 주소를 저장하는 변수입니다...",
    },
    {
        id: 2,
        title: "아두이노 LED 깜빡이기",
        folderId: 2,
        updatedAt: "1일 전",
        isPublic: true,
        isFavorite: false,
        preview: "digitalWrite(LED_PIN, HIGH); delay(1000);...",
    },
    {
        id: 3,
        title: "for문과 while문 비교",
        folderId: 1,
        updatedAt: "3일 전",
        isPublic: false,
        isFavorite: true,
        preview: "반복문의 종류와 사용법을 알아봅시다...",
    },
];

// 블록 타입
const BLOCK_TYPES = [
    { id: "text", label: "텍스트", icon: Type },
    { id: "h1", label: "제목 1", icon: Type },
    { id: "h2", label: "제목 2", icon: Type },
    { id: "h3", label: "제목 3", icon: Type },
    { id: "bullet", label: "글머리표", icon: List },
    { id: "numbered", label: "번호 목록", icon: ListOrdered },
    { id: "todo", label: "체크리스트", icon: CheckSquare },
    { id: "code", label: "코드", icon: Code },
    { id: "image", label: "이미지", icon: ImageIcon },
    { id: "quote", label: "인용", icon: Quote },
    { id: "table", label: "표", icon: Table },
    { id: "math", label: "수식", icon: Calculator },
];

export default function Notes() {
    const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
    const [selectedNote, setSelectedNote] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const filteredNotes = selectedFolder
        ? SAMPLE_NOTES.filter(note => note.folderId === selectedFolder)
        : SAMPLE_NOTES;

    return (
        <div className="min-h-screen bg-midnight text-frost overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-midnight via-midnight-card to-midnight" />
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent-indigo/10 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <Navigation />

            {/* Main Layout */}
            <div className="pt-24 relative z-10 flex h-[calc(100vh-96px)]">
                {/* Sidebar - Folders */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r border-white/10 bg-midnight/50 backdrop-blur-xl flex-shrink-0 overflow-hidden`}>
                    <div className="p-4 h-full flex flex-col">
                        {/* New Note Button */}
                        <Button className="w-full bg-gradient-to-r from-electric to-accent-cyan text-midnight font-bold rounded-xl mb-4 shadow-[0_0_20px_rgba(0,255,136,0.2)]">
                            <Plus className="w-4 h-4 mr-2" />
                            새 노트
                        </Button>

                        {/* Folder List */}
                        <div className="flex-1 space-y-2">
                            <div className="text-xs text-frost-muted uppercase tracking-wider mb-2 px-2">폴더</div>

                            {SAMPLE_FOLDERS.map((folder) => (
                                <button
                                    key={folder.id}
                                    onClick={() => setSelectedFolder(folder.id === selectedFolder ? null : folder.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedFolder === folder.id
                                            ? 'bg-electric/20 text-electric border border-electric/30'
                                            : 'hover:bg-white/5 text-frost'
                                        }`}
                                >
                                    <span className="text-lg">{folder.icon}</span>
                                    <span className="flex-1 text-left text-sm font-medium truncate">{folder.name.split(' ').slice(1).join(' ')}</span>
                                    <span className="text-xs text-frost-muted bg-white/10 px-1.5 py-0.5 rounded">{folder.noteCount}</span>
                                </button>
                            ))}

                            {/* New Folder Button */}
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-frost-muted hover:bg-white/5 transition-all mt-4">
                                <Plus className="w-4 h-4" />
                                <span className="text-sm">새 폴더</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Notes List */}
                <div className="w-80 border-r border-white/10 bg-midnight/30 backdrop-blur-xl flex-shrink-0 flex flex-col">
                    {/* Search */}
                    <div className="p-4 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-frost-muted" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="노트 검색..."
                                className="pl-10 bg-white/5 border-white/10 text-frost h-10 rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredNotes.map((note) => (
                            <button
                                key={note.id}
                                onClick={() => setSelectedNote(note.id)}
                                className={`w-full text-left p-3 rounded-xl transition-all ${selectedNote === note.id
                                        ? 'bg-electric/20 border border-electric/30'
                                        : 'hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-start gap-2 mb-1">
                                    <FileText className={`w-4 h-4 flex-shrink-0 mt-0.5 ${selectedNote === note.id ? 'text-electric' : 'text-frost-muted'}`} />
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-medium text-sm truncate ${selectedNote === note.id ? 'text-electric' : 'text-frost'}`}>
                                            {note.title}
                                        </h4>
                                        <p className="text-xs text-frost-muted truncate mt-0.5">{note.preview}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[10px] text-frost-muted">{note.updatedAt}</span>
                                            {note.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                                            {note.isPublic ? (
                                                <Share2 className="w-3 h-3 text-accent-cyan" />
                                            ) : (
                                                <Lock className="w-3 h-3 text-frost-muted" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {selectedNote ? (
                        <>
                            {/* Editor Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-white">
                                        {SAMPLE_NOTES.find(n => n.id === selectedNote)?.title}
                                    </h2>
                                    <span className="text-xs text-frost-muted">저장됨</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="text-frost-muted hover:text-frost">
                                        <Star className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-frost-muted hover:text-frost">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-frost-muted hover:text-frost">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-frost-muted hover:text-frost">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Block Type Toolbar */}
                            <div className="flex items-center gap-1 p-3 border-b border-white/10 overflow-x-auto">
                                {BLOCK_TYPES.slice(0, 8).map((block) => {
                                    const Icon = block.icon;
                                    return (
                                        <button
                                            key={block.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-frost-muted hover:bg-white/10 hover:text-frost transition-all text-sm whitespace-nowrap"
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{block.label}</span>
                                        </button>
                                    );
                                })}
                                <button className="px-3 py-1.5 rounded-lg text-frost-muted hover:bg-white/10 text-sm">
                                    더보기...
                                </button>
                            </div>

                            {/* Editor Content */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="max-w-3xl mx-auto">
                                    {/* Sample Content */}
                                    <div
                                        className="prose prose-invert max-w-none"
                                        contentEditable
                                        suppressContentEditableWarning
                                    >
                                        <h1 className="text-3xl font-bold text-white mb-6" style={{ textShadow: '0 0 20px rgba(0,255,136,0.3)' }}>
                                            {SAMPLE_NOTES.find(n => n.id === selectedNote)?.title}
                                        </h1>

                                        <p className="text-frost-muted mb-4">
                                            여기에 노트 내용을 작성하세요.
                                            <span className="text-electric">/</span>를 입력하면 블록 메뉴가 나타납니다.
                                        </p>

                                        {/* Sample Blocks */}
                                        <div className="bg-electric/10 border-l-4 border-electric p-4 rounded-r-lg mb-4">
                                            <p className="text-frost">💡 <strong className="text-electric">팁:</strong> 드래그 앤 드롭으로 블록 순서를 바꿀 수 있어요!</p>
                                        </div>

                                        <pre className="bg-midnight-card p-4 rounded-xl border border-white/10 mb-4">
                                            <code className="text-electric">
                                                {`int main() {
    printf("Hello, World!\\n");
    return 0;
}`}
                                            </code>
                                        </pre>

                                        <ul className="text-frost-muted space-y-2 mb-4">
                                            <li className="flex items-center gap-2">
                                                <CheckSquare className="w-4 h-4 text-electric" />
                                                <span className="line-through">변수 선언 이해하기</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckSquare className="w-4 h-4 text-frost-muted" />
                                                <span>포인터 개념 정리</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckSquare className="w-4 h-4 text-frost-muted" />
                                                <span>배열과 포인터 관계</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-24 h-24 rounded-3xl bg-electric/10 border border-electric/20 flex items-center justify-center mx-auto mb-6">
                                    <FileText className="w-12 h-12 text-electric" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">노트를 선택하세요</h3>
                                <p className="text-frost-muted mb-6">왼쪽에서 노트를 선택하거나 새 노트를 만드세요</p>
                                <Button className="bg-gradient-to-r from-electric to-accent-cyan text-midnight font-bold">
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
