import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Button } from "@/components/ui/button";
import {
    Code,
    Blocks,
    Rocket,
    Lightbulb,
    ExternalLink,
    Play,
    BookOpen,
    Gamepad2,
    Sparkles
} from "lucide-react";
import { Link } from "wouter";

export default function EntryLab() {
    const [activeTab, setActiveTab] = useState<'scratch' | 'projects'>('scratch');

    const sampleProjects = [
        {
            id: 1,
            title: "🎮 간단한 게임 만들기",
            description: "방향키로 캐릭터를 움직여 별을 모으는 게임",
            difficulty: "초급",
            color: "from-green-500 to-emerald-500"
        },
        {
            id: 2,
            title: "🎨 그림 그리기 프로그램",
            description: "마우스를 따라다니며 그림을 그리는 펜 만들기",
            difficulty: "초급",
            color: "from-blue-500 to-cyan-500"
        },
        {
            id: 3,
            title: "🐱 고양이 피아노",
            description: "키보드를 누르면 다른 소리가 나는 피아노",
            difficulty: "중급",
            color: "from-purple-500 to-pink-500"
        },
        {
            id: 4,
            title: "🚀 우주 슈팅 게임",
            description: "우주선을 조종해 적을 물리치는 게임",
            difficulty: "중급",
            color: "from-orange-500 to-red-500"
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d20] to-[#0a0a1a] text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <Navigation />

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-4 md:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <AnimatedSection>
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-green-500/20 border border-orange-500/30 backdrop-blur-xl mb-8">
                                <Blocks className="w-6 h-6 text-orange-400" />
                                <span className="text-lg font-bold text-orange-300 tracking-wider uppercase">Block Coding Lab</span>
                                <Blocks className="w-6 h-6 text-orange-400" />
                            </div>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 animate-gradient-x">
                                    코딩 연습실
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
                                <span className="text-orange-400 font-semibold">Scratch</span>로 블록 코딩을 배우고,
                                <br className="hidden md:block" />
                                창의적인 프로젝트를 만들어보세요!
                            </p>

                            {/* Tab Buttons */}
                            <div className="flex items-center justify-center gap-4 mb-8">
                                <Button
                                    onClick={() => setActiveTab('scratch')}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'scratch'
                                            ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/50'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                >
                                    <Play className="w-5 h-5 mr-2" />
                                    Scratch 에디터
                                </Button>
                                <Button
                                    onClick={() => setActiveTab('projects')}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'projects'
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                >
                                    <Lightbulb className="w-5 h-5 mr-2" />
                                    프로젝트 아이디어
                                </Button>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Main Content Area */}
                    {activeTab === 'scratch' ? (
                        <AnimatedSection delay={100}>
                            {/* Scratch Editor Embed */}
                            <div className="relative rounded-3xl overflow-hidden bg-[#12121a] border border-white/10 shadow-2xl">
                                {/* Glow Border */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 rounded-3xl opacity-50 blur" />

                                <div className="relative bg-[#0a0a1a] rounded-3xl overflow-hidden">
                                    {/* Header Bar */}
                                    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                            </div>
                                            <span className="text-white font-bold">Scratch 3.0 Editor</span>
                                        </div>
                                        <a
                                            href="https://scratch.mit.edu/projects/editor/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            새 창에서 열기
                                        </a>
                                    </div>

                                    {/* Scratch iframe */}
                                    <div className="aspect-[16/10] w-full">
                                        <iframe
                                            src="https://scratch.mit.edu/projects/editor/?tutorial=getStarted"
                                            title="Scratch Editor"
                                            className="w-full h-full"
                                            allowFullScreen
                                            allow="clipboard-read; clipboard-write"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Quick Tips */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                {[
                                    { icon: Gamepad2, title: "드래그 & 드롭", desc: "블록을 끌어다 놓으면 코드가 완성돼요" },
                                    { icon: Play, title: "초록 깃발", desc: "초록 깃발을 클릭하면 프로그램이 실행돼요" },
                                    { icon: BookOpen, title: "튜토리얼", desc: "우측 상단 '?' 버튼으로 도움말을 볼 수 있어요" },
                                ].map((tip, idx) => (
                                    <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/50 transition-colors">
                                        <tip.icon className="w-8 h-8 text-orange-400 mb-3" />
                                        <h3 className="text-lg font-bold text-white mb-2">{tip.title}</h3>
                                        <p className="text-gray-400">{tip.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </AnimatedSection>
                    ) : (
                        <AnimatedSection delay={100}>
                            {/* Project Ideas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sampleProjects.map((project, idx) => (
                                    <div
                                        key={project.id}
                                        className="group relative p-8 rounded-3xl bg-[#12121a] border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden"
                                    >
                                        {/* Gradient Background */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-5 group-hover:opacity-10 transition-opacity`} />

                                        {/* Content */}
                                        <div className="relative">
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="text-2xl font-black text-white group-hover:text-purple-300 transition-colors">
                                                    {project.title}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${project.difficulty === '초급'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-orange-500/20 text-orange-400'
                                                    }`}>
                                                    {project.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 mb-6">{project.description}</p>
                                            <Button
                                                onClick={() => setActiveTab('scratch')}
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold"
                                            >
                                                <Rocket className="w-4 h-4 mr-2" />
                                                만들어보기
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* More Resources */}
                            <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                                <div className="flex items-center gap-4 mb-4">
                                    <Sparkles className="w-8 h-8 text-purple-400" />
                                    <h3 className="text-2xl font-bold text-white">더 많은 프로젝트</h3>
                                </div>
                                <p className="text-gray-300 mb-6">
                                    Scratch 공식 사이트에서 수천 개의 프로젝트를 탐색하고, 다른 사람들의 코드를 배워보세요!
                                </p>
                                <a
                                    href="https://scratch.mit.edu/explore/projects/all"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="bg-white text-purple-600 hover:bg-gray-100 font-bold">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Scratch 탐색하기
                                    </Button>
                                </a>
                            </div>
                        </AnimatedSection>
                    )}
                </div>
            </section>

            {/* Back to Home Link */}
            <div className="text-center pb-16">
                <Link href="/">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        ← 홈으로 돌아가기
                    </Button>
                </Link>
            </div>
        </div>
    );
}
