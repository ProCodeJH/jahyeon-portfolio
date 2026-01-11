import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Cpu, Zap, Lightbulb, RotateCcw, Maximize2, Minimize2,
    ChevronRight, BookOpen, PlayCircle, ExternalLink, Info
} from 'lucide-react';

// ============================================
// TINKERCAD PROJECT CONFIGURATION
// ============================================
// 프로젝트 ID를 여기서 쉽게 교체할 수 있습니다
const PROJECTS = [
    {
        id: 'blink-led',
        tinkercadId: 'glorious-lappi', // Tinkercad 프로젝트 ID (URL에서 복사)
        title: 'LED 깜빡이기 (Blink)',
        description: 'Arduino의 가장 기본적인 예제입니다. 내장 LED를 1초 간격으로 켜고 끕니다.',
        difficulty: 'beginner',
        category: 'basics',
        steps: [
            '시뮬레이션 시작 버튼을 클릭하세요',
            'Arduino 보드의 LED가 깜빡이는 것을 확인하세요',
            '코드 보기를 클릭하여 소스코드를 확인하세요',
            'delay() 값을 변경하여 속도를 조절해보세요',
        ],
    },
    {
        id: 'button-led',
        tinkercadId: 'magnificent-albar', // 예시 ID
        title: '버튼으로 LED 제어',
        description: '버튼을 눌러 LED를 제어하는 방법을 배웁니다. digitalRead() 함수를 사용합니다.',
        difficulty: 'beginner',
        category: 'input',
        steps: [
            '버튼을 클릭하여 LED를 켜보세요',
            '버튼에서 손을 떼면 LED가 꺼집니다',
            'INPUT_PULLUP 모드를 이해해보세요',
        ],
    },
    {
        id: 'traffic-light',
        tinkercadId: 'brave-luulia', // 예시 ID
        title: '신호등 시스템',
        description: '3색 LED로 실제 신호등처럼 동작하는 시스템을 만듭니다.',
        difficulty: 'intermediate',
        category: 'project',
        steps: [
            '빨간불 → 노란불 → 초록불 순서를 확인하세요',
            '각 신호 간격 타이밍을 분석해보세요',
            '보행자 신호를 추가해보세요',
        ],
    },
    {
        id: 'servo-motor',
        tinkercadId: 'striking-kup', // 예시 ID
        title: '서보 모터 제어',
        description: '서보 모터를 0도에서 180도까지 회전시키는 방법을 배웁니다.',
        difficulty: 'intermediate',
        category: 'motor',
        steps: [
            '서보 모터가 회전하는 것을 관찰하세요',
            '각도 값을 변경하여 위치를 제어해보세요',
            'for 반복문을 사용한 부드러운 회전을 구현해보세요',
        ],
    },
    {
        id: 'ultrasonic-sensor',
        tinkercadId: 'funky-fulffy', // 예시 ID
        title: '초음파 거리 센서',
        description: 'HC-SR04 초음파 센서로 거리를 측정하고 Serial Monitor에 출력합니다.',
        difficulty: 'advanced',
        category: 'sensor',
        steps: [
            '시뮬레이션을 시작하고 Serial Monitor를 확인하세요',
            '물체를 센서 앞에 배치해보세요',
            '측정된 거리 값이 변하는 것을 확인하세요',
        ],
    },
];

// 난이도 색상
const DIFFICULTY_COLORS = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const DIFFICULTY_LABELS = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급',
};

// ============================================
// TINKERCAD LAB COMPONENT
// ============================================
export default function TinkercadLab() {
    const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    // 프로젝트 변경
    const handleProjectChange = (projectId: string) => {
        const project = PROJECTS.find(p => p.id === projectId);
        if (project) {
            setSelectedProject(project);
            setCurrentStep(0);
        }
    };

    // Tinkercad 임베드 URL 생성
    const getEmbedUrl = (tinkercadId: string) => {
        return `https://www.tinkercad.com/embed/${tinkercadId}?editbtn=1`;
    };

    // 새 탭에서 열기
    const openInTinkercad = () => {
        window.open(`https://www.tinkercad.com/things/${selectedProject.tinkercadId}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] text-white">
            <Navigation />

            {/* Header */}
            <div className="pt-24 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <Cpu className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Arduino 실험실
                            </h1>
                            <p className="text-white/60 text-sm">Tinkercad Circuits로 실습하기</p>
                        </div>
                    </div>

                    {/* Project Selector */}
                    <div className="flex flex-wrap items-center gap-4 mt-6">
                        <div className="flex items-center gap-2">
                            <span className="text-white/60 text-sm">프로젝트:</span>
                            <Select value={selectedProject.id} onValueChange={handleProjectChange}>
                                <SelectTrigger className="w-[250px] bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a2e] border-white/10">
                                    {PROJECTS.map((project) => (
                                        <SelectItem
                                            key={project.id}
                                            value={project.id}
                                            className="text-white hover:bg-white/10 focus:bg-white/10"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4 text-yellow-400" />
                                                {project.title}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Difficulty Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[selectedProject.difficulty as keyof typeof DIFFICULTY_COLORS]}`}>
                            {DIFFICULTY_LABELS[selectedProject.difficulty as keyof typeof DIFFICULTY_LABELS]}
                        </span>

                        <div className="flex-1" />

                        {/* Action Buttons */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowTutorial(!showTutorial)}
                            className="border-white/20 bg-white/5 hover:bg-white/10"
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            {showTutorial ? '튜토리얼 숨기기' : '튜토리얼 보기'}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={openInTinkercad}
                            className="border-white/20 bg-white/5 hover:bg-white/10"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Tinkercad에서 열기
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="border-white/20 bg-white/5 hover:bg-white/10"
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 pb-12">
                <div className={`max-w-7xl mx-auto ${isFullscreen ? 'fixed inset-0 z-50 max-w-none p-4 bg-black' : ''}`}>
                    <div className={`grid gap-6 ${showTutorial && !isFullscreen ? 'lg:grid-cols-[1fr,350px]' : ''}`}>

                        {/* Tinkercad Embed */}
                        <div className={`bg-white/5 rounded-2xl overflow-hidden border border-white/10 ${isFullscreen ? 'h-full' : ''}`}>
                            {/* Embed Header */}
                            <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <span className="text-sm text-white/70">{selectedProject.title}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const iframe = document.getElementById('tinkercad-iframe') as HTMLIFrameElement;
                                        if (iframe) iframe.src = iframe.src; // Reload
                                    }}
                                    className="text-white/50 hover:text-white"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Tinkercad iframe */}
                            <div className={`relative ${isFullscreen ? 'h-[calc(100%-60px)]' : 'aspect-video'}`}>
                                <iframe
                                    id="tinkercad-iframe"
                                    src={getEmbedUrl(selectedProject.tinkercadId)}
                                    className="absolute inset-0 w-full h-full"
                                    frameBorder="0"
                                    marginHeight={0}
                                    marginWidth={0}
                                    scrolling="no"
                                    allowFullScreen
                                    title={selectedProject.title}
                                />
                            </div>
                        </div>

                        {/* Tutorial Panel */}
                        {showTutorial && !isFullscreen && (
                            <div className="space-y-4">
                                {/* Project Info */}
                                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Info className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{selectedProject.title}</h3>
                                            <p className="text-sm text-white/60 mt-1">{selectedProject.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Step by Step Tutorial */}
                                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <PlayCircle className="w-5 h-5 text-green-400" />
                                        <h3 className="font-semibold text-white">실험 단계</h3>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedProject.steps.map((step, index) => (
                                            <div
                                                key={index}
                                                onClick={() => setCurrentStep(index)}
                                                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${currentStep === index
                                                        ? 'bg-blue-500/20 border border-blue-500/30'
                                                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${currentStep === index ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/60'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <p className={`text-sm ${currentStep === index ? 'text-white' : 'text-white/70'}`}>
                                                    {step}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentStep === 0}
                                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                            className="flex-1 border-white/20 bg-white/5 disabled:opacity-30"
                                        >
                                            이전
                                        </Button>
                                        <Button
                                            size="sm"
                                            disabled={currentStep === selectedProject.steps.length - 1}
                                            onClick={() => setCurrentStep(Math.min(selectedProject.steps.length - 1, currentStep + 1))}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600"
                                        >
                                            다음
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Tips */}
                                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-5 h-5 text-amber-400" />
                                        <h3 className="font-semibold text-amber-400">실습 팁</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm text-white/70">
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400">•</span>
                                            시뮬레이션 시작 버튼을 클릭하면 회로가 작동합니다
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400">•</span>
                                            코드 보기를 눌러 Arduino 코드를 확인하세요
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400">•</span>
                                            부품을 클릭하면 설정을 변경할 수 있습니다
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fullscreen Close Button */}
            {isFullscreen && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(false)}
                    className="fixed top-4 right-4 z-50 border-white/20 bg-black/50 hover:bg-white/10"
                >
                    <Minimize2 className="w-4 h-4 mr-2" />
                    닫기
                </Button>
            )}
        </div>
    );
}
