/**
 * ============================================
 * WOKWI ARDUINO LAB
 * ============================================
 * Wokwi를 iframe으로 임베드하여 Arduino 시뮬레이션
 * Wokwi는 iframe 임베드를 공식 지원합니다
 */

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import {
    Cpu, ExternalLink, Play, Lightbulb, Zap, BookOpen,
    ChevronRight, Maximize2, Minimize2, RotateCcw, Code2, ChevronDown
} from 'lucide-react';

// ============================================
// WOKWI 프로젝트 설정
// ============================================
const PROJECTS = [
    {
        id: 'blink',
        wokwiUrl: 'https://wokwi.com/projects/new/arduino-uno', // Arduino Uno 기본
        title: 'LED 깜빡이기 (Blink)',
        description: 'Arduino의 가장 기본 예제. 내장 LED를 1초 간격으로 켜고 끕니다.',
        level: '초급',
        levelColor: 'bg-green-500',
        icon: '💡',
        color: 'from-green-500 to-emerald-600',
        tutorial: [
            '▶ 재생 버튼을 클릭하여 시뮬레이션 시작',
            'LED가 1초 간격으로 깜빡이는 것을 확인',
            'delay(1000)을 delay(500)으로 바꿔보세요',
            '저장하려면 Wokwi 계정이 필요합니다',
        ],
    },
    {
        id: 'traffic-light',
        wokwiUrl: 'https://wokwi.com/projects/new/arduino-uno',
        title: '신호등 시스템',
        description: 'RGB LED로 실제 신호등처럼 동작하는 시스템을 만듭니다.',
        level: '중급',
        levelColor: 'bg-yellow-500',
        icon: '🚦',
        color: 'from-yellow-500 to-orange-600',
        tutorial: [
            '빨간 LED, 노란 LED, 초록 LED 배치',
            '각 신호 유지 시간 설정 (5초, 2초, 5초)',
            '순차적으로 켜지는 로직 구현',
        ],
    },
    {
        id: 'button-led',
        wokwiUrl: 'https://wokwi.com/projects/new/arduino-uno',
        title: '버튼으로 LED 제어',
        description: '버튼을 누르면 LED가 켜지는 디지털 입력 예제입니다.',
        level: '초급',
        levelColor: 'bg-green-500',
        icon: '🔘',
        color: 'from-blue-500 to-cyan-600',
        tutorial: [
            '버튼과 LED를 회로에 추가',
            'digitalRead()로 버튼 상태 읽기',
            'INPUT_PULLUP 모드 사용하기',
        ],
    },
    {
        id: 'servo',
        wokwiUrl: 'https://wokwi.com/projects/new/arduino-uno',
        title: '서보 모터 제어',
        description: '서보 모터를 0도에서 180도까지 회전시키는 방법을 배웁니다.',
        level: '중급',
        levelColor: 'bg-yellow-500',
        icon: '⚙️',
        color: 'from-purple-500 to-pink-600',
        tutorial: [
            'Servo 라이브러리 include',
            'write() 함수로 각도 제어',
            'for 반복문으로 부드러운 회전',
        ],
    },
    {
        id: 'lcd',
        wokwiUrl: 'https://wokwi.com/projects/new/arduino-uno',
        title: 'LCD 디스플레이',
        description: '16x2 LCD에 텍스트를 출력하는 방법을 배웁니다.',
        level: '중급',
        levelColor: 'bg-yellow-500',
        icon: '📺',
        color: 'from-indigo-500 to-violet-600',
        tutorial: [
            'LiquidCrystal 라이브러리 사용',
            'lcd.print()로 텍스트 출력',
            'lcd.setCursor()로 위치 지정',
        ],
    },
];

export default function WokwiLab() {
    const [selected, setSelected] = useState(PROJECTS[0]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    return (
        <div className={`min-h-screen bg-[#0a0a12] text-white ${isFullscreen ? '' : ''}`}>
            {!isFullscreen && <Navigation />}

            {/* Header */}
            {!isFullscreen && (
                <header className="pt-24 pb-6 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Title */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Arduino 실험실</h1>
                                <p className="text-white/50 text-sm">Wokwi Simulator로 배우는 Arduino</p>
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
                                    <span className="text-xl">{selected.icon}</span>
                                    <span className="font-medium">{selected.title}</span>
                                    <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showDropdown && (
                                    <div className="absolute top-full left-0 mt-2 w-80 bg-[#14141f] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                        {PROJECTS.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => { setSelected(p); setShowDropdown(false); }}
                                                className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-all flex items-center gap-3 ${selected.id === p.id ? 'bg-white/10' : ''}`}
                                            >
                                                <span className="text-2xl">{p.icon}</span>
                                                <div className="flex-1">
                                                    <div className="font-medium">{p.title}</div>
                                                    <div className="text-xs text-white/40">{p.description.slice(0, 50)}...</div>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${p.levelColor}`}>{p.level}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Level Badge */}
                            <span className={`px-3 py-1.5 text-xs font-medium rounded-full text-white ${selected.levelColor}`}>
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
                                onClick={() => window.open(selected.wokwiUrl, '_blank')}
                                className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                새 탭에서 열기
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

            {/* Main Content */}
            <main className={`px-4 md:px-8 pb-12 ${isFullscreen ? 'h-screen p-0' : ''}`}>
                <div className={`max-w-7xl mx-auto ${isFullscreen ? 'max-w-none h-full' : ''}`}>
                    <div className={`grid gap-6 ${showTutorial && !isFullscreen ? 'lg:grid-cols-[1fr_320px]' : ''} ${isFullscreen ? 'h-full' : ''}`}>

                        {/* Wokwi iframe */}
                        <div className={`bg-white/5 rounded-2xl overflow-hidden border border-white/10 ${isFullscreen ? 'h-full rounded-none' : ''}`}>
                            {/* Header */}
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
                                        const iframe = document.getElementById('wokwi-frame') as HTMLIFrameElement;
                                        if (iframe) iframe.src = selected.wokwiUrl;
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    title="새로고침"
                                >
                                    <RotateCcw className="w-4 h-4 text-white/50" />
                                </button>
                            </div>

                            {/* Wokwi iframe */}
                            <div className={`relative ${isFullscreen ? 'h-[calc(100%-52px)]' : 'aspect-video min-h-[500px]'}`}>
                                <iframe
                                    id="wokwi-frame"
                                    src={selected.wokwiUrl}
                                    className="absolute inset-0 w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
                                    allowFullScreen
                                    title={selected.title}
                                />
                            </div>
                        </div>

                        {/* Tutorial Sidebar */}
                        {showTutorial && !isFullscreen && (
                            <div className="space-y-4">
                                {/* Project Info */}
                                <div className={`rounded-2xl p-6 bg-gradient-to-br ${selected.color} relative overflow-hidden`}>
                                    <div className="absolute top-4 right-4 text-6xl opacity-20">{selected.icon}</div>
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full text-white ${selected.levelColor} mb-3`}>
                                        {selected.level}
                                    </span>
                                    <h2 className="text-xl font-bold mb-2">{selected.title}</h2>
                                    <p className="text-white/80 text-sm">{selected.description}</p>
                                </div>

                                {/* Tutorial Steps */}
                                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Play className="w-5 h-5 text-green-400" />
                                        <h3 className="font-bold">실습 단계</h3>
                                    </div>

                                    <div className="space-y-2">
                                        {selected.tutorial.map((step, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                                                <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm text-white/80">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Wokwi Tips */}
                                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-5 border border-purple-500/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-5 h-5 text-purple-400" />
                                        <h3 className="font-bold text-purple-400">Wokwi 사용법</h3>
                                    </div>
                                    <ul className="text-sm text-white/70 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-400">▶</span>
                                            초록색 재생 버튼으로 시뮬레이션 시작
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-400">+</span>
                                            왼쪽 패널에서 부품 추가 가능
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-400">📝</span>
                                            오른쪽에서 Arduino 코드 편집
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-400">💾</span>
                                            저장하려면 Wokwi 계정 필요
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Fullscreen Close Button */}
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
