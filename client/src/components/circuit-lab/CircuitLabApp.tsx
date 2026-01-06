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
import { InteractionManager } from './3d/InteractionManager';
import { InteractiveWrapper } from './3d/InteractiveWrapper';
import { getPinWorldPosition } from './3d/utils';

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
  Trash2,
} from 'lucide-react';
import { Link } from 'wouter';

// 3D Scene Component
function CircuitScene() {
  const { components, wires, selectedId, setSelectedId, updateComponent, draftWire } = useCircuitStore();

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

      <InteractionManager />

      {/* Components */}
      {components.map((component) => {
        const isSelected = selectedId === component.id;

        const renderComponent = () => {
          switch (component.type) {
            case 'arduino':
              return (
                <Arduino3D
                  id={component.id}
                  position={component.position}
                  rotation={component.rotation}
                  isSelected={isSelected}
                />
              );
            case 'breadboard':
              return (
                <Breadboard3D
                  id={component.id}
                  position={component.position}
                  rotation={component.rotation}
                  isSelected={isSelected}
                />
              );
            case 'led':
              return (
                <LED3D
                  id={component.id}
                  position={component.position}
                  color={component.properties?.color || '#ff0000'}
                  isOn={component.properties?.isOn || false}
                  brightness={component.properties?.brightness || 1}
                  isSelected={isSelected}
                />
              );
            case 'resistor':
              return (
                <Resistor3D
                  id={component.id}
                  position={component.position}
                  rotation={component.rotation}
                  value={component.properties?.value || 220}
                  isSelected={isSelected}
                />
              );
            case 'button':
              return (
                <Button3D
                  id={component.id}
                  position={component.position}
                  isPressed={component.properties?.isPressed || false}
                  onPress={() => updateComponent(component.id, {
                    properties: { ...component.properties, isPressed: true }
                  })}
                  onRelease={() => updateComponent(component.id, {
                    properties: { ...component.properties, isPressed: false }
                  })}
                  isSelected={isSelected}
                />
              );
            default:
              return null;
          }
        };

        return (
          <InteractiveWrapper key={component.id} id={component.id}>
            {renderComponent()}
          </InteractiveWrapper>
        );
      })}

      {/* Wires */}
      {wires.map((wire) => {
        let start = wire.startPoint;
        let end = wire.endPoint;

        if (wire.startPinId && wire.endPinId) {
          const sPos = getPinWorldPosition(wire.startPinId.split('_pin_')[0], wire.startPinId, components);
          const ePos = getPinWorldPosition(wire.endPinId.split('_pin_')[0], wire.endPinId, components);
          if (sPos) start = sPos;
          if (ePos) end = ePos;
        }

        return (
          <Wire3D
            key={wire.id}
            start={start}
            end={end}
            color={wire.color}
            isSelected={selectedId === wire.id}
            onClick={() => setSelectedId(wire.id)}
          />
        );
      })}

      {/* Draft Wire */}
      {draftWire && (
        <Wire3D
          start={getPinWorldPosition(draftWire.startPin.split('_pin_')[0], draftWire.startPin, components) || [0, 0, 0]}
          end={draftWire.endPosition}
          color="#888888"
        />
      )}
    </>
  );
}

export function CircuitLabApp() {
  const { components, addComponent, removeComponent, updateComponent, setSelectedId, isSimulating, setSimulating, reset } = useCircuitStore();

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
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 border-r border-slate-200 pr-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Circuit Lab</h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-500 font-medium">Arduino Interactive Simulator</p>
                <Badge variant="outline" className="text-[10px] h-4 px-1 border-blue-200 text-blue-600 bg-blue-50">v2.0 Beta</Badge>
              </div>
            </div>
          </div>

          {/* Action Toolbar (Tinkercad style) */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md"
              title="Rotate Selected (R)"
              onClick={() => {
                const { selectedId, components, updateComponent } = useCircuitStore.getState();
                if (selectedId && !selectedId.startsWith('wire_')) {
                  const comp = components.find(c => c.id === selectedId);
                  if (comp) {
                    const newRotation: [number, number, number] = [
                      comp.rotation[0],
                      comp.rotation[1] + Math.PI / 2,
                      comp.rotation[2]
                    ];
                    updateComponent(selectedId, { rotation: newRotation });
                  }
                }
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-md"
              title="Delete Selected"
              onClick={() => {
                const { selectedId, removeComponent, removeWire } = useCircuitStore.getState();
                if (selectedId) {
                  if (selectedId.startsWith('wire_')) {
                    removeWire(selectedId);
                  } else {
                    removeComponent(selectedId);
                  }
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Simulation controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {isRunning ? (
              <Button
                size="sm"
                onClick={handleStop}
                className="h-8 px-4 bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all"
              >
                <Square className="w-3.5 h-3.5 mr-2 fill-current" />
                Stop Simulation
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleRun(useCircuitStore.getState().code, 'arduino')}
                className="h-8 px-4 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                Start Simulation
              </Button>
            )}

            <div className="flex items-center gap-2 px-3 border-l border-slate-200 ml-1">
              <code className="text-xs font-mono text-slate-500">00:00:00</code>
            </div>
          </div>

          <Button
            variant={activePanel === 'code' ? 'default' : 'outline'}
            size="sm"
            className={`gap-2 border-slate-200 transition-all ${activePanel === 'code' ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-700 bg-white hover:bg-slate-50'}`}
            onClick={() => setActivePanel(activePanel === 'code' ? 'components' : 'code')}
          >
            <Code2 className="w-4 h-4" />
            Code
          </Button>

          <Button variant="ghost" size="icon" className="text-slate-500">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden relative">
        <PanelGroup direction="horizontal">

          {/* Main Workspace (Center) */}
          <Panel defaultSize={75} minSize={50} className="relative z-0">
            {/* 3D Canvas */}
            <div className="h-full relative bg-[#f5f5f5]">
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-70 pointer-events-none" />

              <Canvas
                shadows
                gl={{
                  antialias: true,
                  alpha: true,
                  powerPreference: 'high-performance',
                }}
                dpr={[1, 2]}
              >
                <Environment preset="city" />
                <color attach="background" args={['#f8fafc']} /> {/* Light Background */}

                {/* Controls */}
                <OrbitControls
                  makeDefault
                  enableDamping
                  dampingFactor={0.05}
                  minDistance={0.1}
                  maxDistance={10}
                  maxPolarAngle={Math.PI / 2.1} // Prevent going below ground
                />

                <Suspense fallback={null}>
                  {/* Scene Content */}
                  <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-bias={-0.0001} />
                  <ambientLight intensity={0.6} />

                  {/* Grid Helper - Custom lighter grid */}
                  <Grid
                    position={[0, -0.001, 0]}
                    args={[20, 20]}
                    cellSize={0.01}
                    cellThickness={0.5}
                    cellColor="#e2e8f0"
                    sectionSize={0.1}
                    sectionThickness={1}
                    sectionColor="#cbd5e1"
                    fadeDistance={5}
                    infiniteGrid
                  />

                  <CircuitScene />
                </Suspense>
              </Canvas>

              {/* View Overlay Controls */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded text-slate-600 hover:bg-slate-100"><Maximize2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded text-slate-600 hover:bg-slate-100"><Minimize2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded text-slate-600 hover:bg-slate-100"><Home className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </Panel>

          {activePanel === 'code' && (
            <>
              <PanelResizeHandle className="w-1 bg-slate-200 hover:bg-blue-400 transition-colors shadow-sm z-10" />
              <Panel defaultSize={35} minSize={25} className="bg-[#1e1e1e] border-l border-slate-700 flex flex-col z-20">
                <div className="h-10 flex items-center justify-between px-4 bg-slate-800 border-b border-slate-700">
                  <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" /> sketch.ino
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] h-4 border-slate-600 text-slate-400">Arduino Uno</Badge>
                  </div>
                </div>
                <div className="flex-1 relative overflow-hidden">
                  <MonacoEditor
                    initialCode={useCircuitStore.getState().code}
                    language="arduino"
                    onCodeChange={(val: string) => useCircuitStore.getState().setCode(val || '')}
                    errors={compileErrors}
                  />
                </div>
                <div className="h-40 border-t border-slate-700 bg-slate-900 overflow-hidden flex flex-col">
                  <div className="h-8 flex items-center justify-between px-3 bg-slate-800 border-b border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Serial Monitor</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-500 hover:text-white" onClick={() => setSerialOutput('')}>
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>
                  <SerialMonitor
                    output={serialOutput}
                    onSendInput={handleSerialInput}
                  />
                </div>
              </Panel>
            </>
          )}

          <PanelResizeHandle className="w-1 bg-slate-200 hover:bg-blue-400 transition-colors shadow-sm z-10" />

          {/* Right Panel - Component Library (Move from Left) */}
          <Panel defaultSize={25} minSize={15} maxSize={35} className="bg-white border-l border-slate-200 z-10 flex flex-col shadow-xl">
            {useCircuitStore.getState().selectedId && !useCircuitStore.getState().selectedId?.startsWith('wire_') ? (
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between text-slate-700">
                  <span className="font-semibold text-sm capitalize">
                    {useCircuitStore.getState().components.find(c => c.id === useCircuitStore.getState().selectedId)?.type} Properties
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedId(null)}>
                    <Home className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="p-4 flex-1">
                  {/* Simplified Property Editor */}
                  <p className="text-xs text-slate-500 mb-4">Editing component: <span className="font-mono text-blue-600">{useCircuitStore.getState().selectedId}</span></p>
                  <div className="space-y-4">
                    {/* Property rows would go here */}
                    <div className="text-[11px] text-slate-400 italic">Properties panel coming soon...</div>
                  </div>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="components" className="flex-1 flex flex-col">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <span className="font-semibold text-sm text-slate-700">Components</span>
                  <TabsList className="h-8 bg-slate-200/50">
                    <TabsTrigger value="components" className="h-6 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Basic</TabsTrigger>
                    <TabsTrigger value="library" className="h-6 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">All</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="components" className="flex-1 overflow-y-auto p-4 content-start">
                  <ComponentLibrary onAddComponent={handleAddComponent} />
                </TabsContent>
                <TabsContent value="library" className="flex-1 p-8 text-center text-slate-400 text-xs">
                  Advanced components library coming soon.
                </TabsContent>
              </Tabs>
            )}
          </Panel>

        </PanelGroup>
      </div>

    </div>
  );
}
