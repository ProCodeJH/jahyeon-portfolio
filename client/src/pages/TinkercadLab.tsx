/**
 * ============================================
 * TINKERCAD ARDUINO LAB
 * ============================================
 * Tinkercad 프로젝트 갤러리 + 새 탭에서 열기
 * (Tinkercad는 iframe 임베드를 차단하므로 새 탭 방식 사용)
 */

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import {
    Cpu, ExternalLink, Play, Lightbulb, Zap, BookOpen,
    ChevronRight, ArrowRight, Monitor, Code2
} from 'lucide-react';

// ============================================
// 프로젝트 설정 (Tinkercad URL에서 ID 복사)
// ============================================
const PROJECTS = [
    {
        id: 'blink',
        tinkercadId: 'glorious-lappi',
        title: 'LED 깜빡이기',
        description: 'Arduino의 가장 기본 예제. 내장 LED를 1초 간격으로 켜고 끕니다.',
        level: '초급',
        levelColor: 'bg-green-500',
        icon: '💡',
        color: 'from-green-500 to-emerald-600',
        tutorial: [
            '시뮬레이션 시작 버튼(▶)을 클릭하세요',
            'Arduino 보드의 LED(D13핀)가 깜빡이는 것을 확인하세요',
            '코드 보기를 클릭하여 소스코드를 확인하세요',
            'delay(1000)을 delay(500)으로 바꿔서 속도를 변경해보세요',
        ],
        code: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
    },
    {
        id: 'button',
        tinkercadId: 'magnificent-albar',
        title: '버튼으로 LED 제어',
        description: '버튼을 누르면 LED가 켜지는 디지털 입력 예제입니다.',
        level: '초급',
        levelColor: 'bg-green-500',
        icon: '🔘',
        color: 'from-blue-500 to-cyan-600',
        tutorial: [
            '버튼을 클릭하면 LED가 켜집니다',
            '버튼에서 손을 떼면 LED가 꺼집니다',
            'digitalRead() 함수로 버튼 상태를 읽습니다',
            'INPUT_PULLUP 모드를 이해해보세요',
        ],
        code: `void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  if (digitalRead(2) == LOW) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
}`,
    },
    {
        id: 'traffic',
        tinkercadId: 'brave-luulia',
        title: '신호등 시스템',
        description: '3색 LED로 실제 신호등처럼 동작하는 시스템을 만듭니다.',
        level: '중급',
        levelColor: 'bg-yellow-500',
        icon: '🚦',
        color: 'from-yellow-500 to-orange-600',
        tutorial: [
            '빨간불 → 노란불 → 초록불 순서로 변합니다',
            '각 신호의 유지 시간을 분석해보세요',
            '보행자 신호를 추가해볼 수 있습니다',
        ],
        code: `int red = 10, yellow = 9, green = 8;

void setup() {
  pinMode(red, OUTPUT);
  pinMode(yellow, OUTPUT);
  pinMode(green, OUTPUT);
}

void loop() {
  digitalWrite(red, HIGH);
  delay(5000);
  digitalWrite(red, LOW);
  digitalWrite(green, HIGH);
  delay(5000);
  digitalWrite(green, LOW);
  digitalWrite(yellow, HIGH);
  delay(2000);
  digitalWrite(yellow, LOW);
}`,
    },
    {
        id: 'servo',
        tinkercadId: 'striking-kup',
        title: '서보 모터 제어',
        description: '서보 모터를 0도에서 180도까지 회전시키는 방법을 배웁니다.',
        level: '중급',
        levelColor: 'bg-yellow-500',
        icon: '⚙️',
        color: 'from-purple-500 to-pink-600',
        tutorial: [
            '서보 모터가 천천히 회전하는 것을 관찰하세요',
            'write() 함수로 각도를 제어합니다',
            'for 반복문으로 부드러운 회전을 구현합니다',
        ],
        code: `#include <Servo.h>
Servo myservo;

void setup() {
  myservo.attach(9);
}

void loop() {
  for (int pos = 0; pos <= 180; pos++) {
    myservo.write(pos);
    delay(15);
  }
  for (int pos = 180; pos >= 0; pos--) {
    myservo.write(pos);
    delay(15);
  }
}`,
    },
    {
        id: 'ultrasonic',
        tinkercadId: 'funky-fulffy',
        title: '초음파 거리 센서',
        description: 'HC-SR04 센서로 거리를 측정하고 Serial Monitor에 출력합니다.',
        level: '고급',
        levelColor: 'bg-red-500',
        icon: '📡',
        color: 'from-red-500 to-rose-600',
        tutorial: [
            'Serial Monitor를 열어서 거리 값을 확인하세요',
            '물체를 센서 앞에 배치해보세요',
            '측정된 거리 값이 변하는 것을 확인하세요',
        ],
        code: `int trig = 9, echo = 10;

void setup() {
  pinMode(trig, OUTPUT);
  pinMode(echo, INPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  
  long duration = pulseIn(echo, HIGH);
  int distance = duration * 0.034 / 2;
  
  Serial.print("Distance: ");
  Serial.println(distance);
  delay(100);
}`,
    },
];

export default function TinkercadLab() {
    const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
    const [showCode, setShowCode] = useState(false);

    // Tinkercad 링크 열기
    const openTinkercad = (tinkercadId: string) => {
        window.open(`https://www.tinkercad.com/things/${tinkercadId}/editel`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a12] to-[#12121f] text-white">
            <Navigation />

            {/* Header */}
            <header className="pt-24 pb-10 px-4 md:px-8">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
                        <Cpu className="w-5 h-5 text-cyan-400" />
                        <span className="text-cyan-400 font-medium">Tinkercad Circuits</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Arduino 실험실
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        프로젝트를 선택하면 Tinkercad에서 직접 시뮬레이션할 수 있습니다.
                        아래 튜토리얼을 참고하세요!
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-4 md:px-8 pb-16">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-[1fr_400px] gap-8">

                        {/* Project Gallery */}
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-400" />
                                프로젝트 선택
                            </h2>

                            <div className="grid sm:grid-cols-2 gap-4">
                                {PROJECTS.map((project) => (
                                    <div
                                        key={project.id}
                                        onClick={() => setSelectedProject(project)}
                                        className={`relative group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden ${selectedProject.id === project.id
                                                ? 'border-cyan-500 bg-cyan-500/10'
                                                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                    >
                                        {/* Gradient Header */}
                                        <div className={`h-20 bg-gradient-to-br ${project.color} flex items-center justify-center`}>
                                            <span className="text-4xl">{project.icon}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold">{project.title}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${project.levelColor}`}>
                                                    {project.level}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/50 line-clamp-2">{project.description}</p>
                                        </div>

                                        {/* Selected Indicator */}
                                        {selectedProject.id === project.id && (
                                            <div className="absolute top-2 right-2 w-3 h-3 bg-cyan-400 rounded-full" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Open Tinkercad Button */}
                            <Button
                                onClick={() => openTinkercad(selectedProject.tinkercadId)}
                                className="w-full mt-6 py-6 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-2xl"
                            >
                                <Monitor className="w-5 h-5 mr-2" />
                                Tinkercad에서 "{selectedProject.title}" 열기
                                <ExternalLink className="w-5 h-5 ml-2" />
                            </Button>

                            <p className="text-center text-white/40 text-sm mt-3">
                                ↑ 클릭하면 새 탭에서 Tinkercad가 열립니다
                            </p>
                        </div>

                        {/* Tutorial Sidebar */}
                        <div className="space-y-4">
                            {/* Current Project Info */}
                            <div className={`rounded-2xl p-6 bg-gradient-to-br ${selectedProject.color} relative overflow-hidden`}>
                                <div className="absolute top-4 right-4 text-6xl opacity-20">{selectedProject.icon}</div>
                                <span className={`inline-block text-xs px-2 py-0.5 rounded-full text-white ${selectedProject.levelColor} mb-3`}>
                                    {selectedProject.level}
                                </span>
                                <h2 className="text-2xl font-bold mb-2">{selectedProject.title}</h2>
                                <p className="text-white/80">{selectedProject.description}</p>
                            </div>

                            {/* Tutorial Steps */}
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-cyan-400" />
                                        <h3 className="font-bold">실습 튜토리얼</h3>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {selectedProject.tutorial.map((step, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                                            <span className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
                                                {i + 1}
                                            </span>
                                            <span className="text-sm text-white/80">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sample Code */}
                            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                <button
                                    onClick={() => setShowCode(!showCode)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Code2 className="w-5 h-5 text-green-400" />
                                        <span className="font-bold">예제 코드</span>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 text-white/50 transition-transform ${showCode ? 'rotate-90' : ''}`} />
                                </button>

                                {showCode && (
                                    <div className="p-4 pt-0">
                                        <pre className="bg-black/50 rounded-xl p-4 overflow-x-auto text-sm font-mono text-green-400">
                                            {selectedProject.code}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            {/* Tips */}
                            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-5 h-5 text-amber-400" />
                                    <h3 className="font-bold text-amber-400">Tinkercad 사용 팁</h3>
                                </div>
                                <ul className="text-sm text-white/70 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400">▶</span>
                                        시뮬레이션 시작 버튼으로 회로 실행
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400">📝</span>
                                        코드 버튼으로 Arduino 코드 보기/편집
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400">🔧</span>
                                        부품을 클릭하면 속성 변경 가능
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400">📺</span>
                                        Serial Monitor로 출력 확인
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
