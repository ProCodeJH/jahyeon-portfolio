/**
 * ============================================
 * TINKERCAD ARDUINO LAB
 * ============================================
 * Tinkercad Circuits 프로젝트를 iframe으로 임베드하여
 * 웹사이트에서 직접 Arduino 실험을 할 수 있는 페이지
 * 
 * 프로젝트 ID 변경 방법:
 * PROJECTS 배열에서 tinkercadId를 수정하세요
 * (Tinkercad URL의 마지막 부분이 ID입니다)
 */

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import {
    Cpu, ChevronDown, ExternalLink, Maximize2, Minimize2,
    RotateCcw, BookOpen, ChevronRight, Play, Lightbulb, Zap
} from 'lucide-react';

// ============================================
// 프로젝트 설정 (여기서 ID/제목/설명 수정)
// ============================================
const PROJECTS = [
    {
        id: 'blink',
        tinkercadId: 'glorious-lappi', // ← Tinkercad 프로젝트 ID
        title: 'LED 깜빡이기',
        description: 'Arduino의 가장 기본 예제. 내장 LED를 1초 간격으로 On/Off',
        level: '초급',
        levelColor: 'text-green-400 bg-green-500/20',
        tutorial: [
            '▶ 시뮬레이션 시작 버튼 클릭',
            'Arduino 보드의 LED(D13) 깜빡임 확인',
            '코드에서 delay(1000)을 500으로 바꿔보세요',
        ],
    },
    {
        id: 'button',
        tinkercadId: 'magnificent-albar', // 예시
        title: '버튼으로 LED 제어',
        description: '버튼을 누르면 LED가 켜지는 디지털 입력 예제',
        level: '초급',
        levelColor: 'text-green-400 bg-green-500/20',
        tutorial: [
            '버튼을 클릭해서 LED 켜기',
            'digitalRead() 함수 이해하기',
            'INPUT_PULLUP 모드 알아보기',
        ],
    },
    {
        id: 'traffic',
        tinkercadId: 'brave-luulia', // 예시
        title: '신호등 만들기',
        description: 'RGB LED로 실제 신호등처럼 동작하는 시스템 구현',
        level: '중급',
        levelColor: 'text-yellow-400 bg-yellow-500/20',
        tutorial: [
            '빨강 → 노랑 → 초록 순서 관찰',
            '각 신호 유지 시간 분석',
            '보행자 신호 추가해보기',
        ],
    },
    {
        id: 'servo',
        tinkercadId: 'striking-kup', // 예시
        title: '서보 모터 제어',
        description: '서보 모터를 0~180도 회전시키는 PWM 제어',
        level: '중급',
        levelColor: 'text-yellow-400 bg-yellow-500/20',
        tutorial: [
            '서보 모터 회전 관찰',
            'write() 함수로 각도 제어',
            'for 반복문으로 부드럽게 회전',
        ],
    },
    {
        id: 'ultrasonic',
        tinkercadId: 'funky-fulffy', // 예시
        title: '초음파 거리 센서',
        description: 'HC-SR04로 거리 측정 후 Serial Monitor 출력',
        level: '고급',
        levelColor: 'text-red-400 bg-red-500/20',
        tutorial: [
            'Serial Monitor 열기',
            '물체를 앞에 배치해보기',
            '거리 값 변화 확인',
        ],
    },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function TinkercadLab() {
    const [selected, setSelected] = useState(PROJECTS[0]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Tinkercad Embed URL
    const embedUrl = `https://www.tinkercad.com/embed/${selected.tinkercadId}?editbtn=1`;

    return (
        <div className={`min-h-screen bg-[#0a0a12] text-white ${isFullscreen ? '' : ''}`}>
            {!isFullscreen && <Navigation />}

            {/* ============================================ */}
            {/* HEADER */}
            {/* ============================================ */}
            {!isFullscreen && (
                <header className="pt-24 pb-6 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Title */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Arduino 실험실</h1>
                                <p className="text-white/50 text-sm">Tinkercad Circuits로 배우는 Arduino</p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Project Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                                >
                                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                                    <span className="font-medium">{selected.title}</span>
                                    <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown */}
                                {showDropdown && (
                                    <div className="absolute top-full left-0 mt-2 w-72 bg-[#14141f] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                        {PROJECTS.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => { setSelected(p); setShowDropdown(false); setCurrentStep(0); }}
                                                className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-all flex items-center justify-between ${selected.id === p.id ? 'bg-white/10' : ''}`}
                                            >
                                                <div>
                                                    <div className="font-medium">{p.title}</div>
                                                    <div className="text-xs text-white/40">{p.description}</div>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${p.levelColor}`}>{p.level}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Level Badge */}
                            <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${selected.levelColor}`}>
                                {selected.level}
                            </span>

                            <div className="flex-1" />

                            {/* Action Buttons */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowTutorial(!showTutorial)}
                                className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                {showTutorial ? '튜토리얼 숨기기' : '튜토리얼'}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`https://www.tinkercad.com/things/${selected.tinkercadId}`, '_blank')}
                                className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Tinkercad에서 열기
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                            >
                                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </header>
            )}

            {/* ============================================ */}
            {/* MAIN CONTENT */}
            {/* ============================================ */}
            <main className={`px-4 md:px-8 pb-12 ${isFullscreen ? 'h-screen p-0' : ''}`}>
                <div className={`max-w-7xl mx-auto ${isFullscreen ? 'max-w-none h-full' : ''}`}>
                    <div className={`grid gap-6 ${showTutorial && !isFullscreen ? 'lg:grid-cols-[1fr_320px]' : ''} ${isFullscreen ? 'h-full' : ''}`}>

                        {/* ============================================ */}
                        {/* TINKERCAD IFRAME */}
                        {/* ============================================ */}
                        <div className={`bg-white/5 rounded-2xl overflow-hidden border border-white/10 ${isFullscreen ? 'h-full rounded-none' : ''}`}>
                            {/* Iframe Header */}
                            <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <span className="text-sm text-white/60 ml-2">{selected.title}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        const iframe = document.getElementById('tinkercad-frame') as HTMLIFrameElement;
                                        if (iframe) iframe.src = embedUrl;
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    title="새로고침"
                                >
                                    <RotateCcw className="w-4 h-4 text-white/50" />
                                </button>
                            </div>

                            {/* Iframe */}
                            <div className={`relative ${isFullscreen ? 'h-[calc(100%-52px)]' : 'aspect-video'}`}>
                                <iframe
                                    id="tinkercad-frame"
                                    src={embedUrl}
                                    className="absolute inset-0 w-full h-full"
                                    frameBorder="0"
                                    scrolling="no"
                                    allowFullScreen
                                    title={selected.title}
                                />
                            </div>
                        </div>

                        {/* ============================================ */}
                        {/* TUTORIAL SIDEBAR */}
                        {/* ============================================ */}
                        {showTutorial && !isFullscreen && (
                            <div className="space-y-4">
                                {/* Project Info */}
                                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                    <h3 className="font-bold text-lg mb-2">{selected.title}</h3>
                                    <p className="text-sm text-white/60">{selected.description}</p>
                                </div>

                                {/* Steps */}
                                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Play className="w-5 h-5 text-green-400" />
                                        <h3 className="font-bold">실습 단계</h3>
                                    </div>

                                    <div className="space-y-2">
                                        {selected.tutorial.map((step, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentStep(i)}
                                                className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${currentStep === i
                                                        ? 'bg-cyan-500/20 border border-cyan-500/30'
                                                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                                    }`}
                                            >
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${currentStep === i ? 'bg-cyan-500 text-black' : 'bg-white/20'
                                                    }`}>
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm">{step}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentStep === 0}
                                            onClick={() => setCurrentStep(p => Math.max(0, p - 1))}
                                            className="flex-1 border-white/10 disabled:opacity-30"
                                        >
                                            이전
                                        </Button>
                                        <Button
                                            size="sm"
                                            disabled={currentStep === selected.tutorial.length - 1}
                                            onClick={() => setCurrentStep(p => Math.min(selected.tutorial.length - 1, p + 1))}
                                            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black"
                                        >
                                            다음 <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Tips */}
                                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-5 h-5 text-amber-400" />
                                        <h3 className="font-bold text-amber-400">팁</h3>
                                    </div>
                                    <ul className="text-sm text-white/70 space-y-1.5">
                                        <li>• ▶ 버튼으로 시뮬레이션 시작</li>
                                        <li>• 코드 버튼으로 Arduino 코드 보기</li>
                                        <li>• 부품 클릭으로 설정 변경 가능</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ============================================ */}
            {/* FULLSCREEN CLOSE BUTTON */}
            {/* ============================================ */}
            {isFullscreen && (
                <button
                    onClick={() => setIsFullscreen(false)}
                    className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-black/80 hover:bg-black border border-white/20 rounded-xl text-sm font-medium transition-all"
                >
                    <Minimize2 className="w-4 h-4" />
                    닫기
                </button>
            )}

            {/* Dropdown Overlay */}
            {showDropdown && (
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            )}
        </div>
    );
}
