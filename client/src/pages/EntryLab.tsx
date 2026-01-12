import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Button } from "@/components/ui/button";
import {
    Code,
    Blocks,
    Rocket,
    Lightbulb,
    Play,
    BookOpen,
    Gamepad2,
    Sparkles,
    Terminal,
    Zap,
    ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

// Sample Blockly-style visual blocks (pure CSS implementation)
function BlocklyDemo() {
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string[]>([]);
    const [catPosition, setCatPosition] = useState(0);

    const runCode = () => {
        setIsRunning(true);
        setOutput([]);
        setCatPosition(0);

        const steps = [
            { delay: 0, log: "🚀 프로그램 시작!", pos: 0 },
            { delay: 500, log: "➡️ 10칸 이동", pos: 50 },
            { delay: 1000, log: "➡️ 10칸 이동", pos: 100 },
            { delay: 1500, log: "🔄 90도 회전", pos: 100 },
            { delay: 2000, log: "➡️ 10칸 이동", pos: 150 },
            { delay: 2500, log: "🎉 완료!", pos: 200 },
        ];

        steps.forEach(({ delay, log, pos }) => {
            setTimeout(() => {
                setOutput(prev => [...prev, log]);
                setCatPosition(pos);
            }, delay);
        });

        setTimeout(() => setIsRunning(false), 3000);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Block Editor */}
            <div className="relative rounded-3xl overflow-hidden bg-[#1e1e2e] border border-white/10 shadow-2xl">
                {/* Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl opacity-30 blur-xl" />

                <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-black/30 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <Blocks className="w-5 h-5 text-purple-400" />
                            <span className="text-white font-bold">블록 에디터</span>
                        </div>
                        <Button
                            onClick={runCode}
                            disabled={isRunning}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold px-6 shadow-lg shadow-green-500/30"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            {isRunning ? "실행 중..." : "실행하기"}
                        </Button>
                    </div>

                    {/* Blocks Area */}
                    <div className="p-6 space-y-3 min-h-[350px]">
                        {/* Event Block */}
                        <div className="group">
                            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold shadow-lg shadow-orange-500/30 cursor-move hover:scale-105 transition-transform">
                                <Zap className="w-5 h-5" />
                                <span>🏁 시작하면</span>
                            </div>
                        </div>

                        {/* Motion Blocks */}
                        <div className="ml-8 space-y-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 cursor-move hover:scale-105 transition-transform">
                                <span>➡️</span>
                                <span>10</span>
                                <span className="text-blue-200">칸 이동하기</span>
                            </div>

                            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 cursor-move hover:scale-105 transition-transform">
                                <span>➡️</span>
                                <span>10</span>
                                <span className="text-blue-200">칸 이동하기</span>
                            </div>

                            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 cursor-move hover:scale-105 transition-transform">
                                <span>🔄</span>
                                <span>90</span>
                                <span className="text-blue-200">도 회전하기</span>
                            </div>

                            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 cursor-move hover:scale-105 transition-transform">
                                <span>➡️</span>
                                <span>10</span>
                                <span className="text-blue-200">칸 이동하기</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stage & Console */}
            <div className="space-y-6">
                {/* Stage */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-sky-400 to-blue-500 border border-white/20 shadow-2xl aspect-video">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

                    {/* Character */}
                    <div
                        className="absolute bottom-1/4 transition-all duration-500 ease-out"
                        style={{ left: `calc(10% + ${catPosition}px)` }}
                    >
                        <div className="text-6xl animate-bounce">🐱</div>
                    </div>

                    {/* Stage Label */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/30 backdrop-blur-sm text-white text-sm font-medium">
                        🎬 스테이지
                    </div>
                </div>

                {/* Console */}
                <div className="rounded-2xl overflow-hidden bg-[#0d1117] border border-white/10">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-white/10">
                        <Terminal className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-gray-400 font-mono">출력</span>
                    </div>
                    <div className="p-4 h-32 overflow-y-auto font-mono text-sm">
                        {output.length === 0 ? (
                            <span className="text-gray-600">실행 버튼을 눌러 코드를 실행하세요...</span>
                        ) : (
                            output.map((line, i) => (
                                <div key={i} className="text-green-400">{line}</div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sample Projects
const projects = [
    {
        title: "🎮 간단한 게임",
        description: "방향키로 캐릭터를 움직여 별을 모으는 게임",
        difficulty: "초급",
        color: "from-green-500 to-emerald-500"
    },
    {
        title: "🎨 그림 그리기",
        description: "마우스를 따라다니며 그림을 그리는 펜",
        difficulty: "초급",
        color: "from-blue-500 to-cyan-500"
    },
    {
        title: "🎵 멜로디 연주",
        description: "키보드를 누르면 다른 음이 나는 피아노",
        difficulty: "중급",
        color: "from-purple-500 to-pink-500"
    },
    {
        title: "🚀 우주 슈팅",
        description: "우주선을 조종해 적을 물리치는 게임",
        difficulty: "고급",
        color: "from-orange-500 to-red-500"
    },
];

export default function EntryLab() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d20] to-[#0a0a1a] text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <Navigation />

            {/* Hero */}
            <section className="pt-32 pb-16 px-4 md:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <AnimatedSection>
                        <div className="text-center mb-16">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-purple-500/30 backdrop-blur-xl mb-8 shadow-2xl">
                                <Blocks className="w-5 h-5 text-purple-400" />
                                <span className="text-sm font-bold text-purple-300 tracking-wider uppercase">Block Coding Lab</span>
                                <Sparkles className="w-5 h-5 text-pink-400" />
                            </div>

                            {/* Title */}
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 animate-gradient-x">
                                    블록 코딩
                                </span>
                                <br />
                                <span className="text-white">연습실</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
                                드래그 앤 드롭으로 코딩의 기초를 배워보세요!
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* Block Editor Demo */}
                    <AnimatedSection delay={100}>
                        <BlocklyDemo />
                    </AnimatedSection>

                    {/* Tips */}
                    <AnimatedSection delay={200}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                            {[
                                { icon: Gamepad2, title: "드래그 & 드롭", desc: "블록을 끌어다 놓으면 코드가 완성!" },
                                { icon: Play, title: "즉시 실행", desc: "실행 버튼으로 바로 결과 확인" },
                                { icon: BookOpen, title: "쉽게 배우기", desc: "복잡한 문법 없이 논리만 이해하면 OK" },
                            ].map((tip, i) => (
                                <div
                                    key={i}
                                    className="group p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-purple-500/50 transition-all duration-500"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg shadow-purple-500/30">
                                        <tip.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{tip.title}</h3>
                                    <p className="text-gray-400 text-sm">{tip.desc}</p>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>

                    {/* Project Ideas */}
                    <AnimatedSection delay={300}>
                        <div className="mt-24">
                            <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                                    프로젝트 아이디어
                                </span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {projects.map((project, i) => (
                                    <div
                                        key={i}
                                        className="group relative p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl overflow-hidden cursor-pointer hover:border-white/30 transition-all"
                                    >
                                        {/* Gradient overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                                        <div className="relative">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-2xl">{project.title.split(' ')[0]}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${project.difficulty === '초급' ? 'bg-green-500/20 text-green-400' :
                                                        project.difficulty === '중급' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {project.difficulty}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2">{project.title.split(' ').slice(1).join(' ')}</h3>
                                            <p className="text-gray-400 text-sm">{project.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Back Button */}
            <div className="text-center pb-16 relative z-10">
                <Link href="/">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        홈으로 돌아가기
                    </Button>
                </Link>
            </div>
        </div>
    );
}
