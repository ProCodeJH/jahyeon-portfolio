/**
 * ============================================
 * ENTERPRISE ARDUINO LAB
 * ============================================
 * ₩100,000,000+ Value Premium Arduino Simulation Lab
 * Ultra-Premium UI/UX with Wokwi Integration
 * 
 * Features:
 * - Glassmorphism design system
 * - Animated gradient backgrounds
 * - Professional project gallery
 * - Interactive tutorials with progress tracking
 * - Fullscreen immersive mode
 * - Responsive premium layout
 */

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import {
    Cpu, ExternalLink, Play, Lightbulb, Zap, BookOpen,
    ChevronRight, Maximize2, Minimize2, RotateCcw, Code2,
    ChevronDown, Sparkles, CircuitBoard, Timer, CheckCircle2,
    ArrowRight, Layers, MonitorPlay
} from 'lucide-react';

// ============================================
// ENTERPRISE PROJECT CONFIGURATIONS
// ============================================
const PROJECTS = [
    {
        id: 'blink',
        wokwiUrl: 'https://wokwi.com/projects/new/arduino-uno',
        title: 'LED Blink',
        subtitle: 'Foundation of Embedded Systems',
        description: 'Master the fundamental concept of digital output control. This project teaches timing, pin configuration, and the core loop() architecture.',
        level: 'BEGINNER',
        levelGradient: 'from-emerald-500 to-green-600',
        duration: '5 min',
        icon: Lightbulb,
        color: 'from-emerald-500/20 via-green-500/10 to-transparent',
        borderColor: 'border-emerald-500/30',
        glowColor: 'shadow-emerald-500/20',
        tutorial: [
            { step: 'Initialize', text: 'Click the green Play button to start simulation' },
            { step: 'Observe', text: 'Watch the built-in LED blink at 1-second intervals' },
            { step: 'Modify', text: 'Change delay(1000) to delay(250) for faster blinking' },
            { step: 'Experiment', text: 'Add an external LED on pin 8' },
        ],
        concepts: ['pinMode()', 'digitalWrite()', 'delay()', 'Digital Pins'],
    },
    {
        id: 'button',
        wokwiUrl: 'https://wokwi.com/projects/new/arduino-uno',
        title: 'Button Control',
        subtitle: 'Digital Input Fundamentals',
        description: 'Learn to read user input with push buttons. Understand pull-up resistors and state detection for interactive projects.',
        level: 'BEGINNER',
        levelGradient: 'from-emerald-500 to-green-600',
        duration: '10 min',
        icon: CircuitBoard,
        color: 'from-blue-500/20 via-cyan-500/10 to-transparent',
        borderColor: 'border-blue-500/30',
        glowColor: 'shadow-blue-500/20',
        tutorial: [
            { step: 'Setup', text: 'Add a push button from the parts library' },
            { step: 'Wire', text: 'Connect button to pin 2 and GND' },
            { step: 'Code', text: 'Use digitalRead() to detect button state' },
            { step: 'Test', text: 'Press the button to control the LED' },
        ],
        concepts: ['digitalRead()', 'INPUT_PULLUP', 'Conditional Logic', 'Debouncing'],
    },
    {
        id: 'traffic',
        wokwiUrl: 'https://wokwi.com/projects/new/arduino-uno',
        title: 'Traffic Light',
        subtitle: 'Sequential State Machine',
        description: 'Build a real-world traffic light controller. Master state machines and timing sequences for complex automation.',
        level: 'INTERMEDIATE',
        levelGradient: 'from-amber-500 to-orange-600',
        duration: '20 min',
        icon: Layers,
        color: 'from-amber-500/20 via-orange-500/10 to-transparent',
        borderColor: 'border-amber-500/30',
        glowColor: 'shadow-amber-500/20',
        tutorial: [
            { step: 'Design', text: 'Plan the state sequence: RED → GREEN → YELLOW' },
            { step: 'Build', text: 'Add 3 LEDs (red, yellow, green) to pins 10, 9, 8' },
            { step: 'Program', text: 'Implement timing: 5s red, 5s green, 2s yellow' },
            { step: 'Extend', text: 'Add pedestrian signal with button interrupt' },
        ],
        concepts: ['State Machines', 'millis()', 'Non-blocking Delays', 'Arrays'],
    },
    {
        id: 'servo',
        wokwiUrl: 'https://wokwi.com/projects/new/arduino-uno',
        title: 'Servo Motor',
        subtitle: 'Precision Motion Control',
        description: 'Control angular position with servo motors. Essential for robotics, automation, and mechanical systems.',
        level: 'INTERMEDIATE',
        levelGradient: 'from-amber-500 to-orange-600',
        duration: '15 min',
        icon: MonitorPlay,
        color: 'from-violet-500/20 via-purple-500/10 to-transparent',
        borderColor: 'border-violet-500/30',
        glowColor: 'shadow-violet-500/20',
        tutorial: [
            { step: 'Include', text: 'Add #include <Servo.h> library' },
            { step: 'Attach', text: 'Connect servo signal wire to pin 9' },
            { step: 'Control', text: 'Use write() to set angle from 0° to 180°' },
            { step: 'Sweep', text: 'Create smooth motion with for loops' },
        ],
        concepts: ['Servo Library', 'PWM', 'Angular Control', 'Loop Iteration'],
    },
    {
        id: 'lcd',
        wokwiUrl: 'https://wokwi.com/projects/new/arduino-uno',
        title: 'LCD Display',
        subtitle: 'Visual Output Interface',
        description: 'Interface with 16x2 character LCD. Display sensor data, messages, and create interactive user interfaces.',
        level: 'ADVANCED',
        levelGradient: 'from-rose-500 to-red-600',
        duration: '25 min',
        icon: MonitorPlay,
        color: 'from-rose-500/20 via-pink-500/10 to-transparent',
        borderColor: 'border-rose-500/30',
        glowColor: 'shadow-rose-500/20',
        tutorial: [
            { step: 'Library', text: 'Include LiquidCrystal library' },
            { step: 'Wiring', text: 'Connect LCD with 4-bit or I2C mode' },
            { step: 'Initialize', text: 'Use lcd.begin(16, 2) for 16x2 display' },
            { step: 'Display', text: 'Print text with lcd.print() and position with setCursor()' },
        ],
        concepts: ['LiquidCrystal', 'I2C Protocol', 'Character Display', 'Custom Characters'],
    },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function ArduinoLab() {
    const [selected, setSelected] = useState(PROJECTS[0]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Toggle step completion
    const toggleStep = (index: number) => {
        setCompletedSteps(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    // Reset progress when project changes
    useEffect(() => {
        setCompletedSteps([]);
    }, [selected.id]);

    const progress = Math.round((completedSteps.length / selected.tutorial.length) * 100);

    return (
        <div className={`min-h-screen bg-[#030306] text-white overflow-hidden ${isFullscreen ? '' : ''}`}>
            {/* Premium Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-transparent to-cyan-950/20" />
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-purple-500/10 via-transparent to-transparent blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-cyan-500/10 via-transparent to-transparent blur-3xl" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
            </div>

            {!isFullscreen && <Navigation />}

            {/* ============================================ */}
            {/* PREMIUM HEADER */}
            {/* ============================================ */}
            {!isFullscreen && (
                <header className={`relative pt-28 pb-8 px-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="max-w-7xl mx-auto">
                        {/* Title Section */}
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                                        <Cpu className="w-8 h-8" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#030306] flex items-center justify-center">
                                        <Sparkles className="w-3 h-3" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Arduino Lab</h1>
                                        <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full uppercase">
                                            Enterprise
                                        </span>
                                    </div>
                                    <p className="text-white/40 text-sm">Professional-grade embedded systems simulation powered by Wokwi</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="hidden md:flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowTutorial(!showTutorial)}
                                    className="border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm"
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    {showTutorial ? 'Hide Guide' : 'Show Guide'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(selected.wokwiUrl, '_blank')}
                                    className="border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open in Wokwi
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsFullscreen(true)}
                                    className="border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Project Selection Bar */}
                        <div className="relative">
                            <div className="flex items-center gap-3 p-1.5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl">
                                {/* Project Selector */}
                                <div className="relative flex-1 md:flex-none">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className={`w-full md:w-auto flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${selected.color} border ${selected.borderColor} rounded-xl transition-all hover:border-white/20`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selected.levelGradient} flex items-center justify-center`}>
                                            <selected.icon className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold">{selected.title}</div>
                                            <div className="text-xs text-white/40">{selected.subtitle}</div>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-white/40 ml-2 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown */}
                                    {showDropdown && (
                                        <div className="absolute top-full left-0 right-0 md:right-auto md:min-w-[400px] mt-2 bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                            <div className="p-2">
                                                {PROJECTS.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => { setSelected(p); setShowDropdown(false); }}
                                                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${selected.id === p.id ? 'bg-white/10' : 'hover:bg-white/5'
                                                            }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.levelGradient} flex items-center justify-center`}>
                                                            <p.icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{p.title}</div>
                                                            <div className="text-xs text-white/40 truncate">{p.subtitle}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-white/30">{p.duration}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium bg-gradient-to-r ${p.levelGradient}`}>
                                                                {p.level}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Stats */}
                                <div className="hidden md:flex items-center gap-6 px-4">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Timer className="w-4 h-4" />
                                        <span className="text-sm">{selected.duration}</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${selected.levelGradient}`}>
                                        {selected.level}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* ============================================ */}
            {/* MAIN CONTENT */}
            {/* ============================================ */}
            <main className={`relative px-6 pb-12 ${isFullscreen ? 'h-screen p-0' : ''}`}>
                <div className={`mx-auto ${isFullscreen ? 'max-w-none h-full' : showTutorial ? 'max-w-7xl' : 'max-w-[1600px]'}`}>
                    <div className={`grid gap-6 ${showTutorial && !isFullscreen ? 'lg:grid-cols-[1fr_340px]' : ''} ${isFullscreen ? 'h-full' : ''}`}>

                        {/* ============================================ */}
                        {/* WOKWI SIMULATOR */}
                        {/* ============================================ */}
                        <div className={`relative group ${isFullscreen ? 'h-full' : ''}`}>
                            <div className={`absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 via-transparent to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className={`relative bg-[#0a0a0f]/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/[0.08] ${isFullscreen ? 'h-full rounded-none' : ''} ${selected.glowColor} shadow-2xl`}>
                                {/* Premium Header */}
                                <div className="px-5 py-4 bg-gradient-to-r from-white/[0.04] to-transparent border-b border-white/[0.06] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
                                        </div>
                                        <div className="h-4 w-px bg-white/10" />
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${selected.levelGradient} animate-pulse`} />
                                            <span className="text-sm font-medium text-white/70">{selected.title}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const iframe = document.getElementById('wokwi-frame') as HTMLIFrameElement;
                                            if (iframe) iframe.src = selected.wokwiUrl;
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors group/btn"
                                        title="Reload Simulator"
                                    >
                                        <RotateCcw className="w-4 h-4 text-white/40 group-hover/btn:text-white transition-colors" />
                                    </button>
                                </div>

                                {/* Wokwi iframe */}
                                <div className={`relative ${isFullscreen ? 'h-[calc(100%-60px)]' : showTutorial ? 'min-h-[600px]' : 'min-h-[700px] lg:min-h-[800px]'}`}>
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
                        </div>

                        {/* ============================================ */}
                        {/* PREMIUM TUTORIAL SIDEBAR */}
                        {/* ============================================ */}
                        {showTutorial && !isFullscreen && (
                            <div className="space-y-5">
                                {/* Progress Section */}
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] p-5">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-violet-500/10 to-transparent" />

                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-white/60">Progress</span>
                                            <span className={`text-2xl font-bold ${progress === 100 ? 'text-emerald-400' : 'text-white'}`}>
                                                {progress}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 rounded-full ${progress === 100 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-white/30">
                                            <span>{completedSteps.length} of {selected.tutorial.length} steps</span>
                                            {progress === 100 && <span className="text-emerald-400 font-medium">Complete!</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Tutorial Steps */}
                                <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                                            <Play className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">Tutorial</h3>
                                            <p className="text-xs text-white/40">Click steps to mark complete</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {selected.tutorial.map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={() => toggleStep(i)}
                                                className={`w-full text-left p-4 rounded-xl transition-all border ${completedSteps.includes(i)
                                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${completedSteps.includes(i)
                                                        ? 'bg-emerald-500'
                                                        : 'bg-white/10'
                                                        }`}>
                                                        {completedSteps.includes(i) ? (
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        ) : (
                                                            <span className="text-xs font-bold">{i + 1}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-xs font-semibold mb-0.5 ${completedSteps.includes(i) ? 'text-emerald-400' : 'text-white/40'}`}>
                                                            {item.step}
                                                        </div>
                                                        <p className={`text-sm ${completedSteps.includes(i) ? 'text-white/60' : 'text-white/80'}`}>
                                                            {item.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Concepts */}
                                <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Code2 className="w-5 h-5 text-cyan-400" />
                                        <h3 className="font-semibold">Key Concepts</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selected.concepts.map((concept, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 text-xs font-mono bg-white/5 border border-white/10 rounded-lg text-cyan-400"
                                            >
                                                {concept}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Pro Tips */}
                                <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-5 h-5 text-amber-400" />
                                        <h3 className="font-semibold text-amber-400">Pro Tips</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm text-white/60">
                                        <li className="flex items-start gap-2">
                                            <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                            <span>Use the + button to add components from the library</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                            <span>Press F to zoom to fit all components</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                            <span>Save projects with a free Wokwi account</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ============================================ */}
            {/* FULLSCREEN MODE UI */}
            {/* ============================================ */}
            {isFullscreen && (
                <button
                    onClick={() => setIsFullscreen(false)}
                    className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-black/90 backdrop-blur-xl hover:bg-black border border-white/10 rounded-xl text-sm font-medium transition-all shadow-2xl"
                >
                    <Minimize2 className="w-4 h-4" />
                    Exit Fullscreen
                </button>
            )}

            {/* Dropdown Overlay */}
            {showDropdown && (
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            )}
        </div>
    );
}
