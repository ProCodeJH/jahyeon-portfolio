/**
 * Circuit Lab Application
 * Production-grade 3D Arduino Circuit Simulator
 * 한국어 UI 지원
 */

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, PerspectiveCamera } from '@react-three/drei';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { MonacoEditor } from './editor/MonacoEditor';
import { SerialMonitor } from './panels/SerialMonitor';
import { ComponentLibrary } from './panels/ComponentLibrary';
import { LogicAnalyzer } from './panels/LogicAnalyzer';
import { SimulationTimeline } from './panels/SimulationTimeline';
import { useCircuitStore, ComponentType } from './store';
import {
  Arduino3D,
  Breadboard3D,
  LED3D,
  PWMLED3D,
  Resistor3D,
  Button3D,
  Wire3D,
  PinNetVisualization,
  TemperatureSensor3D,
  Photoresistor3D,
  UltrasonicSensor3D,
} from './3d';

import { NetlistManager } from '@/lib/circuit/kernel/NetlistManager';
import { SimulationEngine } from '@/lib/circuit/sim/SimulationEngine';
import { CodeExecutor, SupportedLanguage } from '@/lib/circuit/compiler/CodeExecutor';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Cpu,
  Code2,
  Terminal,
  Box,
  Settings,
  Maximize2,
  Minimize2,
  Zap,
  Home,
  Layers,
  Eye,
  EyeOff,
  Activity,
  Clock,
} from 'lucide-react';
import { Link } from 'wouter';

// 한국어 UI 텍스트
const UI_TEXT = {
  title: '회로 실험실',
  subtitle: '3D 아두이노 시뮬레이터',
  home: '홈',
  run: '실행',
  stop: '정지',
  reset: '초기화',
  running: '실행 중',
  ready: '대기',
  components: '부품',
  simulation: '시뮬레이션',
  active: '활성',
  stopped: '정지됨',
  dragToRotate: '드래그: 회전 • 스크롤: 확대/축소',
  mcu: 'Arduino UNO • ATmega328P',
  clock: '16 MHz',
  viewTabs: {
    scene: '3D 뷰',
    code: '코드',
    analyzer: '분석기',
  },
};

// Code-Hardware Highlight Context
interface HighlightContext {
  activeLine: number | null;
  activeComponent: string | null;
  activePin: string | null;
}

// 3D Scene Component
function CircuitScene({ highlightContext }: { highlightContext: HighlightContext }) {
  const { components, wires, selectedId, setSelectedId, updateComponent } = useCircuitStore();

  return (
    <>
      <PerspectiveCamera makeDefault position={[0.3, 0.3, 0.4]} fov={50} />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={0.1}
        maxDistance={2}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.1}
        dampingFactor={0.05}
        enableDamping
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <pointLight position={[0, 0.5, 0]} intensity={0.2} color="#4f46e5" />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Grid */}
      <Grid
        position={[0, -0.001, 0]}
        args={[10, 10]}
        cellSize={0.025}
        cellThickness={0.5}
        cellColor="#404040"
        sectionSize={0.1}
        sectionThickness={1}
        sectionColor="#606060"
        fadeDistance={2}
        fadeStrength={1}
        followCamera={false}
      />

      {/* Pin/Net Visualization Layer */}
      <PinNetVisualization />

      {/* Components */}
      {components.map((component) => {
        const isSelected = selectedId === component.id;
        const isHighlighted = highlightContext.activeComponent === component.id;

        switch (component.type) {
          case 'arduino':
            return (
              <Arduino3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                onClick={() => setSelectedId(component.id)}
                isSelected={isSelected || isHighlighted}
              />
            );
          case 'breadboard':
            return (
              <Breadboard3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                onClick={() => setSelectedId(component.id)}
                isSelected={isSelected || isHighlighted}
              />
            );
          case 'led':
            // Use PWMLED3D for PWM-capable LEDs
            return component.properties?.pwmEnabled ? (
              <PWMLED3D
                key={component.id}
                position={component.position}
                color={component.properties?.color || '#ff0000'}
                isOn={component.properties?.isOn || false}
                pwmDuty={component.properties?.pwmDuty || 255}
                onClick={() => setSelectedId(component.id)}
                isSelected={isSelected || isHighlighted}
              />
            ) : (
              <LED3D
                key={component.id}
                position={component.position}
                color={component.properties?.color || '#ff0000'}
                isOn={component.properties?.isOn || false}
                brightness={component.properties?.brightness || 1}
                onClick={() => setSelectedId(component.id)}
                isSelected={isSelected || isHighlighted}
              />
            );
          case 'resistor':
            return (
              <Resistor3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                value={component.properties?.value || 220}
                onClick={() => setSelectedId(component.id)}
                isSelected={isSelected || isHighlighted}
              />
            );
          case 'button':
            return (
              <Button3D
                key={component.id}
                position={component.position}
                isPressed={component.properties?.isPressed || false}
                onPress={() => updateComponent(component.id, {
                  properties: { ...component.properties, isPressed: true }
                })}
                onRelease={() => updateComponent(component.id, {
                  properties: { ...component.properties, isPressed: false }
                })}
                onClick={() => setSelectedId(component.id)}
                isSelected={isSelected || isHighlighted}
              />
            );
          case 'temperature':
            return (
              <TemperatureSensor3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                temperature={component.properties?.temperature || 25}
                onClick={() => setSelectedId(component.id)}
                isSelected={isSelected || isHighlighted}
              />
            );
          case 'photoresistor':
            return (
              <Photoresistor3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                lightLevel={component.properties?.lightLevel || 512}
                onClick={() => setSelectedId(component.id)}
                isSelected={isSelected || isHighlighted}
              />
            );
          case 'ultrasonic':
            return (
              <UltrasonicSensor3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                distance={component.properties?.distance || 100}
                isActive={component.properties?.isActive || false}
                onClick={() => setSelectedId(component.id)}
                isSelected={isSelected || isHighlighted}
              />
            );
          default:
            return null;
        }
      })}

      {/* Wires */}
      {wires.map((wire) => (
        <Wire3D
          key={wire.id}
          start={wire.startPoint}
          end={wire.endPoint}
          color={wire.color}
          isSelected={selectedId === wire.id}
          onClick={() => setSelectedId(wire.id)}
        />
      ))}
    </>
  );
}

export function CircuitLabApp() {
  const { components, addComponent, updateComponent, isSimulating, setSimulating, reset } = useCircuitStore();

  // Refs
  const netlistRef = useRef<NetlistManager | null>(null);
  const engineRef = useRef<SimulationEngine | null>(null);
  const executorRef = useRef<CodeExecutor | null>(null);

  // State
  const [serialOutput, setSerialOutput] = useState('');
  const [compileErrors, setCompileErrors] = useState<{ line: number; message: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activePanel, setActivePanel] = useState<'components' | 'code' | 'properties'>('components');
  const [showGrid, setShowGrid] = useState(true);
  const [viewMode, setViewMode] = useState<'scene' | 'code' | 'analyzer'>('scene');
  const [simulationTime, setSimulationTime] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showLogicAnalyzer, setShowLogicAnalyzer] = useState(false);

  // Code-Hardware Highlight Context
  const [highlightContext, setHighlightContext] = useState<HighlightContext>({
    activeLine: null,
    activeComponent: null,
    activePin: null,
  });

  // Initialize simulation engine
  useEffect(() => {
    netlistRef.current = new NetlistManager('circuit_1', '메인 회로');
    engineRef.current = new SimulationEngine(netlistRef.current);
    executorRef.current = new CodeExecutor(engineRef.current);

    // Find Arduino component and set it up
    const arduino = components.find(c => c.type === 'arduino');
    if (arduino && executorRef.current) {
      executorRef.current.setArduino(arduino.id);
      executorRef.current.onOutput(setSerialOutput);
    }

    // Track simulation time
    const timeInterval = setInterval(() => {
      if (engineRef.current?.isRunning()) {
        setSimulationTime(engineRef.current.getTime());
      }
    }, 50);

    return () => {
      clearInterval(timeInterval);
      engineRef.current?.stop();
      executorRef.current?.stop();
    };
  }, [components]);

  // Handle code run
  const handleRun = useCallback(async (code: string, language: SupportedLanguage) => {
    if (!executorRef.current) return;

    setIsRunning(true);
    setCompileErrors([]);
    setSerialOutput('');

    // Start simulation
    engineRef.current?.start();
    setSimulating(true);

    const result = await executorRef.current.execute(code, language as SupportedLanguage);

    if (!result.success && result.error) {
      // Parse error for line number
      const match = result.error.match(/Line (\d+):/);
      if (match) {
        setCompileErrors([{ line: parseInt(match[1]), message: result.error }]);
        // Highlight error in code
        setHighlightContext(prev => ({ ...prev, activeLine: parseInt(match[1]) }));
      } else {
        setCompileErrors([{ line: 1, message: result.error }]);
      }
    }

    setSerialOutput(result.output);
  }, [setSimulating]);

  // Handle code stop
  const handleStop = useCallback(() => {
    executorRef.current?.stop();
    engineRef.current?.stop();
    setIsRunning(false);
    setSimulating(false);
    setHighlightContext({ activeLine: null, activeComponent: null, activePin: null });
  }, [setSimulating]);

  // Handle reset
  const handleReset = useCallback(() => {
    handleStop();
    executorRef.current?.reset();
    engineRef.current?.reset();
    setSerialOutput('');
    setCompileErrors([]);
    setSimulationTime(0);
    reset();
  }, [handleStop, reset]);

  // Handle speed change
  const handleSpeedChange = useCallback((speed: number) => {
    setSimulationSpeed(speed);
    engineRef.current?.setSpeed(speed);
  }, []);

  // Handle timeline seek
  const handleTimelineSeek = useCallback((time: number) => {
    setSimulationTime(time);
    // In a real implementation, this would seek the simulation state
  }, []);

  // Handle add component
  const handleAddComponent = useCallback((componentType: string) => {
    const offset = components.length * 0.03;
    let position: [number, number, number] = [offset, 0, offset];
    let type: ComponentType = 'led';

    switch (componentType) {
      case 'arduino_uno':
        position = [-0.1, 0, 0];
        type = 'arduino';
        break;
      case 'breadboard':
        position = [0.1, 0, 0];
        type = 'breadboard';
        break;
      case 'led':
      case 'led_rgb':
        position = [0, 0.02, 0.08 + offset];
        type = 'led';
        break;
      case 'resistor':
        position = [0.03, 0.01, 0.08 + offset];
        type = 'resistor';
        break;
      case 'button':
        position = [-0.03, 0, 0.08 + offset];
        type = 'button';
        break;
      case 'temperature':
        position = [0.05, 0, 0.08 + offset];
        type = 'temperature' as ComponentType;
        break;
      case 'photoresistor':
        position = [0.07, 0, 0.08 + offset];
        type = 'photoresistor' as ComponentType;
        break;
      case 'ultrasonic':
        position = [0.09, 0.01, 0.08 + offset];
        type = 'ultrasonic' as ComponentType;
        break;
    }

    const properties: Record<string, unknown> = {};
    if (type === 'led') {
      properties.color = '#ff0000';
      properties.isOn = false;
      properties.brightness = 1;
    } else if (type === 'resistor') {
      properties.value = 220;
    } else if (type === ('temperature' as ComponentType)) {
      properties.temperature = 25;
    } else if (type === ('photoresistor' as ComponentType)) {
      properties.lightLevel = 512;
    } else if (type === ('ultrasonic' as ComponentType)) {
      properties.distance = 100;
      properties.isActive = false;
    }

    addComponent({
      type,
      position,
      rotation: [0, 0, 0],
      properties,
    });
  }, [components.length, addComponent]);

  // Handle serial input
  const handleSerialInput = useCallback((input: string) => {
    executorRef.current?.getArduino()?.sendSerialInput(input);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#1a1a2e] text-gray-200 overflow-hidden">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 bg-[#16162a] border-b border-[#2a2a4a]">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Home className="w-4 h-4 mr-2" />
              {UI_TEXT.home}
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">{UI_TEXT.title}</h1>
              <p className="text-[10px] text-gray-500">{UI_TEXT.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Tabs */}
          <div className="flex items-center bg-[#252540] rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setViewMode('scene')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'scene' ? 'bg-[#3a3a5a] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5 inline mr-1" />
              {UI_TEXT.viewTabs.scene}
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'code' ? 'bg-[#3a3a5a] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 inline mr-1" />
              {UI_TEXT.viewTabs.code}
            </button>
            <button
              onClick={() => setViewMode('analyzer')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'analyzer' ? 'bg-[#3a3a5a] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 inline mr-1" />
              {UI_TEXT.viewTabs.analyzer}
            </button>
          </div>

          {/* Simulation controls */}
          <div className="flex items-center gap-1 bg-[#252540] rounded-lg p-1">
            {isRunning ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStop}
                className="h-7 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/20"
              >
                <Square className="w-3.5 h-3.5 mr-1" />
                {UI_TEXT.stop}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRun('', 'arduino')}
                className="h-7 px-3 text-green-400 hover:text-green-300 hover:bg-green-500/20"
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                {UI_TEXT.run}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 px-2 text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#252540] rounded-lg">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs text-gray-400">{isRunning ? UI_TEXT.running : UI_TEXT.ready}</span>
          </div>

          {/* View controls */}
          <div className="flex items-center gap-1 bg-[#252540] rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTimeline(!showTimeline)}
              className={`h-7 w-7 p-0 ${showTimeline ? 'text-blue-400' : 'text-gray-400'}`}
              title="타임라인 표시/숨기기"
            >
              <Clock className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className={`h-7 w-7 p-0 ${showGrid ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <Layers className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-white"
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left panel - Component Library */}
          <Panel defaultSize={18} minSize={15} maxSize={25}>
            <ComponentLibrary onAddComponent={handleAddComponent} />
          </Panel>

          <PanelResizeHandle className="w-1 bg-[#2a2a4a] hover:bg-[#4a4a6a] transition-colors" />

          {/* Center panel - Main View Area */}
          <Panel defaultSize={50}>
            <PanelGroup direction="vertical">
              {/* Primary View (3D / Code / Analyzer) */}
              <Panel defaultSize={showTimeline ? 75 : 100} minSize={40}>
                {viewMode === 'scene' && (
                  <div className="h-full relative bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]">
                    <Canvas
                      shadows
                      gl={{
                        antialias: true,
                        alpha: false,
                        powerPreference: 'high-performance',
                      }}
                      dpr={[1, 2]}
                    >
                      <color attach="background" args={['#12121f']} />
                      <fog attach="fog" args={['#12121f', 0.5, 3]} />
                      <Suspense fallback={null}>
                        <CircuitScene highlightContext={highlightContext} />
                      </Suspense>
                    </Canvas>

                    {/* Overlay controls */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-black/50 text-gray-300 backdrop-blur-sm">
                        <Zap className="w-3 h-3 mr-1 text-yellow-400" />
                        {components.length} {UI_TEXT.components}
                      </Badge>
                    </div>

                    <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                      {UI_TEXT.dragToRotate}
                    </div>
                  </div>
                )}

                {viewMode === 'code' && (
                  <MonacoEditor
                    onRun={handleRun}
                    onStop={handleStop}
                    isRunning={isRunning}
                    errors={compileErrors}
                  />
                )}

                {viewMode === 'analyzer' && (
                  <LogicAnalyzer
                    isRunning={isRunning}
                    simulationTime={simulationTime}
                    onStart={() => {
                      handleRun('', 'arduino');
                    }}
                    onStop={handleStop}
                    onReset={handleReset}
                  />
                )}
              </Panel>

              {/* Timeline Panel */}
              {showTimeline && (
                <>
                  <PanelResizeHandle className="h-1 bg-[#2a2a4a] hover:bg-[#4a4a6a] transition-colors" />
                  <Panel defaultSize={25} minSize={15} maxSize={40}>
                    <SimulationTimeline
                      currentTime={simulationTime}
                      isRunning={isRunning}
                      speed={simulationSpeed}
                      onPlay={() => handleRun('', 'arduino')}
                      onPause={handleStop}
                      onStop={handleReset}
                      onSeek={handleTimelineSeek}
                      onSpeedChange={handleSpeedChange}
                    />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-1 bg-[#2a2a4a] hover:bg-[#4a4a6a] transition-colors" />

          {/* Right panel - Serial Monitor */}
          <Panel defaultSize={22} minSize={18} maxSize={35}>
            <SerialMonitor
              output={serialOutput}
              onSendInput={handleSerialInput}
              isConnected={isRunning}
            />
          </Panel>
        </PanelGroup>
      </div>

      {/* Status bar */}
      <footer className="h-6 flex items-center justify-between px-3 bg-[#16162a] border-t border-[#2a2a4a] text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>{UI_TEXT.mcu}</span>
          <span>{UI_TEXT.clock}</span>
          <span className="text-blue-400">
            시뮬레이션 시간: {(simulationTime / 1000000).toFixed(2)}s
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>{UI_TEXT.simulation}: {isSimulating ? UI_TEXT.active : UI_TEXT.stopped}</span>
          <Badge variant="secondary" className="h-4 text-[10px] bg-purple-500/20 text-purple-400">
            v1.0.0
          </Badge>
        </div>
      </footer>
    </div>
  );
}
