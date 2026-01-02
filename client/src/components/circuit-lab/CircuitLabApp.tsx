/**
 * Circuit Lab Application
 * Production-grade 3D Arduino Circuit Simulator
 */

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, PerspectiveCamera } from '@react-three/drei';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { MonacoEditor } from './editor/MonacoEditor';
import { SerialMonitor } from './panels/SerialMonitor';
import { ComponentLibrary } from './panels/ComponentLibrary';
import { useCircuitStore, ComponentType } from './store';
import { Arduino3D, Breadboard3D, LED3D, Resistor3D, Button3D, Wire3D } from './3d';

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
} from 'lucide-react';
import { Link } from 'wouter';

// 3D Scene Component
function CircuitScene() {
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

      {/* Components */}
      {components.map((component) => {
        const isSelected = selectedId === component.id;

        switch (component.type) {
          case 'arduino':
            return (
              <Arduino3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                onClick={() => setSelectedId(component.id)}
                isSelected={isSelected}
              />
            );
          case 'breadboard':
            return (
              <Breadboard3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                onClick={() => setSelectedId(component.id)}
                isSelected={isSelected}
              />
            );
          case 'led':
            return (
              <LED3D
                key={component.id}
                position={component.position}
                color={component.properties?.color || '#ff0000'}
                isOn={component.properties?.isOn || false}
                brightness={component.properties?.brightness || 1}
                onClick={() => setSelectedId(component.id)}
                isSelected={isSelected}
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
                isSelected={isSelected}
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
                isSelected={isSelected}
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
  const [viewMode, setViewMode] = useState<'3d' | 'schematic'>('3d');

  // Initialize simulation engine
  useEffect(() => {
    netlistRef.current = new NetlistManager('circuit_1', 'Main Circuit');
    engineRef.current = new SimulationEngine(netlistRef.current);
    executorRef.current = new CodeExecutor(engineRef.current);

    // Find Arduino component and set it up
    const arduino = components.find(c => c.type === 'arduino');
    if (arduino && executorRef.current) {
      executorRef.current.setArduino(arduino.id);
      executorRef.current.onOutput(setSerialOutput);
    }

    return () => {
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
  }, [setSimulating]);

  // Handle reset
  const handleReset = useCallback(() => {
    handleStop();
    executorRef.current?.reset();
    engineRef.current?.reset();
    setSerialOutput('');
    setCompileErrors([]);
    reset();
  }, [handleStop, reset]);

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
    }

    const properties: Record<string, unknown> = {};
    if (type === 'led') {
      properties.color = '#ff0000';
      properties.isOn = false;
      properties.brightness = 1;
    } else if (type === 'resistor') {
      properties.value = 220;
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
              Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Circuit Lab</h1>
              <p className="text-[10px] text-gray-500">3D Arduino Simulator</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
                Stop
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
                className="h-7 px-3 text-green-400 hover:text-green-300 hover:bg-green-500/20"
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                Run
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
            <span className="text-xs text-gray-400">{isRunning ? 'Running' : 'Ready'}</span>
          </div>

          {/* View controls */}
          <div className="flex items-center gap-1 bg-[#252540] rounded-lg p-1">
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

          {/* Center panel - 3D View & Code Editor */}
          <Panel defaultSize={50}>
            <PanelGroup direction="vertical">
              {/* 3D View */}
              <Panel defaultSize={60} minSize={30}>
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
                      <CircuitScene />
                    </Suspense>
                  </Canvas>

                  {/* Overlay controls */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-black/50 text-gray-300 backdrop-blur-sm">
                      <Zap className="w-3 h-3 mr-1 text-yellow-400" />
                      {components.length} components
                    </Badge>
                  </div>

                  <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                    Drag to rotate • Scroll to zoom
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-1 bg-[#2a2a4a] hover:bg-[#4a4a6a] transition-colors" />

              {/* Code Editor */}
              <Panel defaultSize={40} minSize={20}>
                <MonacoEditor
                  onRun={handleRun}
                  onStop={handleStop}
                  isRunning={isRunning}
                  errors={compileErrors}
                />
              </Panel>
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
          <span>Arduino UNO • ATmega328P</span>
          <span>16 MHz</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Simulation: {isSimulating ? 'Active' : 'Stopped'}</span>
          <Badge variant="secondary" className="h-4 text-[10px] bg-purple-500/20 text-purple-400">
            v1.0.0
          </Badge>
        </div>
      </footer>
    </div>
  );
}
