import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Button } from "@/components/ui/button";
import {
    Blocks,
    Play,
    Trash2,
    RotateCcw,
    Volume2,
    Eye,
    Repeat,
    ArrowLeft,
    Sparkles,
    Terminal,
    Plus,
    GripVertical
} from "lucide-react";
import { Link } from "wouter";

// Block Types
type BlockType = 'event' | 'motion' | 'looks' | 'sound' | 'control' | 'sensing';

interface Block {
    id: string;
    type: BlockType;
    label: string;
    icon?: string;
    color: string;
}

// Block Palette Data
const blockPalette: { category: string; type: BlockType; color: string; blocks: { label: string; icon?: string }[] }[] = [
    {
        category: "이벤트",
        type: "event",
        color: "from-yellow-500 to-orange-500",
        blocks: [
            { label: "🏁 시작할 때", icon: "🏁" },
            { label: "🔑 키를 눌렀을 때" },
            { label: "🖱️ 클릭할 때" },
        ]
    },
    {
        category: "동작",
        type: "motion",
        color: "from-blue-500 to-blue-600",
        blocks: [
            { label: "10 만큼 이동하기" },
            { label: "90 도 회전하기" },
            { label: "x: 0 y: 0 으로 가기" },
            { label: "1 초 동안 이동하기" },
        ]
    },
    {
        category: "형태",
        type: "looks",
        color: "from-purple-500 to-purple-600",
        blocks: [
            { label: "안녕! 말하기" },
            { label: "2 초 동안 말하기" },
            { label: "모양 바꾸기" },
            { label: "숨기기" },
            { label: "보이기" },
        ]
    },
    {
        category: "소리",
        type: "sound",
        color: "from-pink-500 to-pink-600",
        blocks: [
            { label: "🔊 소리 재생하기" },
            { label: "🔇 모든 소리 멈추기" },
        ]
    },
    {
        category: "제어",
        type: "control",
        color: "from-orange-500 to-red-500",
        blocks: [
            { label: "1 초 기다리기" },
            { label: "10 번 반복하기" },
            { label: "무한 반복하기" },
            { label: "만약 ~라면" },
        ]
    },
];

// Draggable Block Component
function DraggableBlock({
    block,
    onDragStart,
    isDragging,
}: {
    block: Block;
    onDragStart: (block: Block) => void;
    isDragging?: boolean;
}) {
    const colorClasses: Record<BlockType, string> = {
        event: "from-yellow-500 to-orange-500 shadow-orange-500/30",
        motion: "from-blue-500 to-blue-600 shadow-blue-500/30",
        looks: "from-purple-500 to-purple-600 shadow-purple-500/30",
        sound: "from-pink-500 to-pink-600 shadow-pink-500/30",
        control: "from-orange-500 to-red-500 shadow-red-500/30",
        sensing: "from-cyan-500 to-teal-500 shadow-cyan-500/30",
    };

    return (
        <div
            draggable
            onDragStart={() => onDragStart(block)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${colorClasses[block.type]} text-white font-medium shadow-lg cursor-grab active:cursor-grabbing hover:scale-105 transition-all duration-200 select-none ${isDragging ? 'opacity-50' : ''}`}
        >
            <GripVertical className="w-4 h-4 opacity-50" />
            <span>{block.label}</span>
        </div>
    );
}

// Workspace Block Component
function WorkspaceBlock({
    block,
    onRemove,
    index,
}: {
    block: Block;
    onRemove: () => void;
    index: number;
}) {
    const colorClasses: Record<BlockType, string> = {
        event: "from-yellow-500 to-orange-500 shadow-orange-500/30 border-orange-400",
        motion: "from-blue-500 to-blue-600 shadow-blue-500/30 border-blue-400",
        looks: "from-purple-500 to-purple-600 shadow-purple-500/30 border-purple-400",
        sound: "from-pink-500 to-pink-600 shadow-pink-500/30 border-pink-400",
        control: "from-orange-500 to-red-500 shadow-red-500/30 border-red-400",
        sensing: "from-cyan-500 to-teal-500 shadow-cyan-500/30 border-cyan-400",
    };

    return (
        <div
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${colorClasses[block.type]} text-white font-medium shadow-lg border-l-4 transition-all hover:translate-x-1`}
            style={{ marginLeft: block.type === 'event' ? 0 : '2rem' }}
        >
            <span className="text-white/50 font-mono text-sm">{index + 1}</span>
            <span className="flex-1">{block.label}</span>
            <button
                onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-black/20 hover:bg-black/40 transition-all"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function BlockCoding() {
    const [workspace, setWorkspace] = useState<Block[]>([
        { id: '1', type: 'event', label: '🏁 시작할 때', color: 'orange' },
    ]);
    const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [catPosition, setCatPosition] = useState({ x: 50, y: 50 });

    // Generate unique ID
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Handle drag start
    const handleDragStart = (block: Block) => {
        setDraggedBlock({ ...block, id: generateId() });
    };

    // Handle drop on workspace
    const handleDrop = () => {
        if (draggedBlock) {
            setWorkspace([...workspace, draggedBlock]);
            setDraggedBlock(null);
        }
    };

    // Remove block from workspace
    const removeBlock = (id: string) => {
        setWorkspace(workspace.filter(b => b.id !== id));
    };

    // Clear workspace
    const clearWorkspace = () => {
        setWorkspace([{ id: '1', type: 'event', label: '🏁 시작할 때', color: 'orange' }]);
        setOutput([]);
        setCatPosition({ x: 50, y: 50 });
    };

    // Run the code
    const runCode = async () => {
        setIsRunning(true);
        setOutput([]);
        setCatPosition({ x: 50, y: 50 });

        setOutput(prev => [...prev, "🚀 프로그램 시작!"]);

        for (let i = 0; i < workspace.length; i++) {
            const block = workspace[i];
            await new Promise(resolve => setTimeout(resolve, 500));

            if (block.label.includes('이동')) {
                setCatPosition(prev => ({ ...prev, x: prev.x + 30 }));
                setOutput(prev => [...prev, `➡️ ${block.label}`]);
            } else if (block.label.includes('회전')) {
                setOutput(prev => [...prev, `🔄 ${block.label}`]);
            } else if (block.label.includes('말하기')) {
                setOutput(prev => [...prev, `💬 ${block.label}`]);
            } else if (block.label.includes('기다리기')) {
                setOutput(prev => [...prev, `⏳ ${block.label}`]);
                await new Promise(resolve => setTimeout(resolve, 500));
            } else if (block.label.includes('소리')) {
                setOutput(prev => [...prev, `🔊 ${block.label}`]);
            } else if (!block.label.includes('시작')) {
                setOutput(prev => [...prev, `▶️ ${block.label}`]);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 300));
        setOutput(prev => [...prev, "✅ 프로그램 완료!"]);
        setIsRunning(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d20] to-[#0a0a1a] text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-3xl" />
            </div>

            <Navigation />

            <section className="pt-28 pb-8 px-4 md:px-8 relative z-10">
                <div className="max-w-[1600px] mx-auto">
                    {/* Header */}
                    <AnimatedSection>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                    <Blocks className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                        Block Coding
                                    </h1>
                                    <p className="text-gray-500 text-sm">드래그 앤 드롭으로 코딩 배우기</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={clearWorkspace}
                                    variant="outline"
                                    className="border-white/20 text-gray-300 hover:bg-white/10"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    초기화
                                </Button>
                                <Button
                                    onClick={runCode}
                                    disabled={isRunning}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold shadow-lg shadow-green-500/30"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    {isRunning ? "실행 중..." : "실행하기"}
                                </Button>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Main Editor Grid */}
                    <div className="grid grid-cols-12 gap-6 min-h-[600px]">
                        {/* Block Palette */}
                        <div className="col-span-12 lg:col-span-3">
                            <div className="rounded-2xl bg-[#12121a]/80 backdrop-blur-xl border border-white/10 overflow-hidden h-full">
                                {/* Category Tabs */}
                                <div className="flex overflow-x-auto border-b border-white/10 bg-black/30">
                                    {blockPalette.map((category, idx) => (
                                        <button
                                            key={category.category}
                                            onClick={() => setSelectedCategory(idx)}
                                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === idx
                                                    ? 'text-white border-b-2 border-purple-500 bg-purple-500/10'
                                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            {category.category}
                                        </button>
                                    ))}
                                </div>

                                {/* Blocks */}
                                <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                                    {blockPalette[selectedCategory].blocks.map((block, idx) => (
                                        <DraggableBlock
                                            key={idx}
                                            block={{
                                                id: generateId(),
                                                type: blockPalette[selectedCategory].type,
                                                label: block.label,
                                                color: blockPalette[selectedCategory].color,
                                            }}
                                            onDragStart={handleDragStart}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Workspace */}
                        <div className="col-span-12 lg:col-span-5">
                            <div
                                className="rounded-2xl bg-[#12121a]/80 backdrop-blur-xl border border-white/10 h-full overflow-hidden"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                <div className="flex items-center gap-2 px-4 py-3 bg-black/30 border-b border-white/10">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm font-medium text-gray-400">작업 영역</span>
                                    <span className="ml-auto text-xs text-gray-600">{workspace.length} 블록</span>
                                </div>

                                <div className="p-6 space-y-2 min-h-[500px]">
                                    {workspace.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-600 py-20">
                                            <Plus className="w-12 h-12 mb-4 opacity-50" />
                                            <p>블록을 여기에 끌어다 놓으세요</p>
                                        </div>
                                    ) : (
                                        workspace.map((block, idx) => (
                                            <WorkspaceBlock
                                                key={block.id}
                                                block={block}
                                                index={idx}
                                                onRemove={() => removeBlock(block.id)}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stage & Console */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            {/* Stage */}
                            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-sky-400 to-blue-500 border border-white/20 shadow-2xl aspect-square relative">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

                                {/* Character */}
                                <div
                                    className="absolute transition-all duration-300 ease-out text-5xl"
                                    style={{
                                        left: `${catPosition.x}px`,
                                        top: `${catPosition.y}px`,
                                    }}
                                >
                                    🐱
                                </div>

                                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/30 backdrop-blur-sm text-white text-xs font-medium">
                                    🎬 스테이지
                                </div>
                            </div>

                            {/* Console */}
                            <div className="rounded-2xl overflow-hidden bg-[#0d1117] border border-white/10">
                                <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-white/10">
                                    <Terminal className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-gray-400 font-mono">콘솔</span>
                                </div>
                                <div className="p-4 h-40 overflow-y-auto font-mono text-sm">
                                    {output.length === 0 ? (
                                        <span className="text-gray-600">실행 버튼을 눌러보세요...</span>
                                    ) : (
                                        output.map((line, i) => (
                                            <div key={i} className="text-green-400 animate-fadeIn">{line}</div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="mt-8 text-center">
                        <Link href="/">
                            <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                홈으로 돌아가기
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}
