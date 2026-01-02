import { Suspense, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, PerspectiveCamera } from '@react-three/drei';
import { useCircuitStore, ComponentType, CircuitComponent } from '@/components/circuit-lab/store';
import { Arduino3D, Breadboard3D, LED3D, Resistor3D, Button3D, Wire3D } from '@/components/circuit-lab/3d';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Cpu,
  Lightbulb,
  CircuitBoard,
  Zap,
  MousePointer2,
  Trash2,
  Home,
  Settings,
  Terminal
} from 'lucide-react';
import { Link } from 'wouter';

// Component palette items
const componentPalette: { type: ComponentType; label: string; icon: React.ReactNode }[] = [
  { type: 'arduino', label: 'Arduino UNO', icon: <Cpu className="w-4 h-4" /> },
  { type: 'breadboard', label: 'Breadboard', icon: <CircuitBoard className="w-4 h-4" /> },
  { type: 'led', label: 'LED', icon: <Lightbulb className="w-4 h-4" /> },
  { type: 'resistor', label: 'Resistor', icon: <Zap className="w-4 h-4" /> },
  { type: 'button', label: 'Push Button', icon: <MousePointer2 className="w-4 h-4" /> },
];

// LED color options
const ledColors = [
  { value: '#ff0000', label: 'Red' },
  { value: '#00ff00', label: 'Green' },
  { value: '#0000ff', label: 'Blue' },
  { value: '#ffff00', label: 'Yellow' },
  { value: '#ffffff', label: 'White' },
];

// Resistor values
const resistorValues = [100, 220, 330, 470, 1000, 2200, 4700, 10000];

function CircuitCanvas() {
  const { components, wires, selectedId, setSelectedId, updateComponent } = useCircuitStore();

  const handleComponentClick = useCallback((id: string) => {
    setSelectedId(id);
  }, [setSelectedId]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0.3, 0.4, 0.5]} fov={50} />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={0.2}
        maxDistance={2}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />

      {/* Environment for PBR reflections */}
      <Environment preset="studio" />

      {/* Grid floor */}
      <Grid
        position={[0, -0.001, 0]}
        args={[10, 10]}
        cellSize={0.05}
        cellThickness={0.5}
        cellColor="#6e6e6e"
        sectionSize={0.25}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={5}
        fadeStrength={1}
        followCamera={false}
      />

      {/* Render components */}
      {components.map((component) => {
        const isSelected = selectedId === component.id;

        switch (component.type) {
          case 'arduino':
            return (
              <Arduino3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                onClick={() => handleComponentClick(component.id)}
                isSelected={isSelected}
              />
            );
          case 'breadboard':
            return (
              <Breadboard3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                onClick={() => handleComponentClick(component.id)}
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
                onClick={() => handleComponentClick(component.id)}
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
                onClick={() => handleComponentClick(component.id)}
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
                onClick={() => handleComponentClick(component.id)}
                isSelected={isSelected}
              />
            );
          default:
            return null;
        }
      })}

      {/* Render wires */}
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

function ComponentPanel() {
  const { addComponent, selectedId, components, updateComponent, removeComponent } = useCircuitStore();

  const selectedComponent = components.find(c => c.id === selectedId);

  const handleAddComponent = (type: ComponentType) => {
    // Position new components with slight offset
    const offset = components.length * 0.05;
    let position: [number, number, number] = [offset, 0, offset];

    // Default positions based on type
    switch (type) {
      case 'arduino':
        position = [-0.15, 0, 0];
        break;
      case 'breadboard':
        position = [0.1, 0, 0];
        break;
      case 'led':
        position = [0, 0.05, 0.1 + offset];
        break;
      case 'resistor':
        position = [0.05, 0.02, 0.1 + offset];
        break;
      case 'button':
        position = [-0.05, 0, 0.1 + offset];
        break;
    }

    const properties: CircuitComponent['properties'] = {};

    if (type === 'led') {
      properties.color = '#ff0000';
      properties.isOn = false;
      properties.brightness = 1;
    } else if (type === 'resistor') {
      properties.value = 220;
    } else if (type === 'button') {
      properties.isPressed = false;
    }

    addComponent({
      type,
      position,
      rotation: [0, 0, 0],
      properties
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Components</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {componentPalette.map(({ type, label, icon }) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs h-auto py-2"
              onClick={() => handleAddComponent(type)}
            >
              {icon}
              <span className="truncate">{label}</span>
            </Button>
          ))}
        </div>

        {selectedComponent && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Properties</h4>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeComponent(selectedComponent.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Type</label>
                <Badge variant="secondary" className="ml-2 capitalize">
                  {selectedComponent.type}
                </Badge>
              </div>

              {selectedComponent.type === 'led' && (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Color</label>
                    <div className="flex gap-1">
                      {ledColors.map(({ value, label }) => (
                        <button
                          key={value}
                          className={`w-6 h-6 rounded-full border-2 ${
                            selectedComponent.properties?.color === value
                              ? 'border-foreground'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: value }}
                          title={label}
                          onClick={() => updateComponent(selectedComponent.id, {
                            properties: { ...selectedComponent.properties, color: value }
                          })}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Brightness: {Math.round((selectedComponent.properties?.brightness || 1) * 100)}%
                    </label>
                    <Slider
                      value={[(selectedComponent.properties?.brightness || 1) * 100]}
                      onValueChange={([value]) => updateComponent(selectedComponent.id, {
                        properties: { ...selectedComponent.properties, brightness: value / 100 }
                      })}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedComponent.properties?.isOn ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateComponent(selectedComponent.id, {
                        properties: { ...selectedComponent.properties, isOn: !selectedComponent.properties?.isOn }
                      })}
                    >
                      {selectedComponent.properties?.isOn ? 'Turn Off' : 'Turn On'}
                    </Button>
                  </div>
                </>
              )}

              {selectedComponent.type === 'resistor' && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Value (Ω)</label>
                  <div className="flex flex-wrap gap-1">
                    {resistorValues.map((value) => (
                      <Button
                        key={value}
                        variant={selectedComponent.properties?.value === value ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                        onClick={() => updateComponent(selectedComponent.id, {
                          properties: { ...selectedComponent.properties, value }
                        })}
                      >
                        {value >= 1000 ? `${value / 1000}kΩ` : `${value}Ω`}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SimulationControls() {
  const { isSimulating, setSimulating, reset } = useCircuitStore();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isSimulating ? 'secondary' : 'default'}
        size="sm"
        onClick={() => setSimulating(!isSimulating)}
      >
        {isSimulating ? (
          <>
            <Pause className="w-4 h-4 mr-1" />
            Pause
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-1" />
            Start
          </>
        )}
      </Button>
      <Button variant="outline" size="sm" onClick={() => setSimulating(false)}>
        <Square className="w-4 h-4 mr-1" />
        Stop
      </Button>
      <Button variant="outline" size="sm" onClick={reset}>
        <RotateCcw className="w-4 h-4 mr-1" />
        Reset
      </Button>
    </div>
  );
}

function CodeEditor() {
  const { code, setCode } = useCircuitStore();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-sm font-medium">Arduino Code</span>
        <Badge variant="outline">sketch.ino</Badge>
      </div>
      <textarea
        className="flex-1 p-3 font-mono text-sm bg-muted/50 resize-none focus:outline-none"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        placeholder="// Write your Arduino code here..."
      />
    </div>
  );
}

function SerialMonitor() {
  const { serialOutput } = useCircuitStore();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-sm font-medium flex items-center gap-1">
          <Terminal className="w-4 h-4" />
          Serial Monitor
        </span>
        <Badge variant="outline">9600 baud</Badge>
      </div>
      <ScrollArea className="flex-1 p-2">
        <pre className="font-mono text-xs whitespace-pre-wrap">
          {serialOutput || 'Serial monitor ready...'}
        </pre>
      </ScrollArea>
    </div>
  );
}

export default function CircuitLab() {
  const [activeTab, setActiveTab] = useState<string>('components');

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h1 className="font-semibold">Circuit Lab</h1>
          </div>
          <Badge variant="secondary">3D Arduino Simulator</Badge>
        </div>

        <div className="flex items-center gap-4">
          <SimulationControls />
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <div className="w-64 border-r p-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="w-full">
              <TabsTrigger value="components" className="flex-1">Parts</TabsTrigger>
              <TabsTrigger value="code" className="flex-1">Code</TabsTrigger>
            </TabsList>
            <TabsContent value="components" className="h-[calc(100%-40px)] mt-2">
              <ComponentPanel />
            </TabsContent>
            <TabsContent value="code" className="h-[calc(100%-40px)] mt-2">
              <Card className="h-full overflow-hidden">
                <CodeEditor />
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <Canvas
            shadows
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance'
            }}
            dpr={[1, 2]}
          >
            <color attach="background" args={['#1a1a2e']} />
            <fog attach="fog" args={['#1a1a2e', 1, 5]} />
            <Suspense fallback={null}>
              <CircuitCanvas />
            </Suspense>
          </Canvas>

          {/* Canvas overlay info */}
          <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Drag to rotate • Scroll to zoom • Right-click to pan
          </div>
        </div>

        {/* Right panel - Serial Monitor */}
        <div className="w-72 border-l">
          <Card className="h-full rounded-none border-0">
            <SerialMonitor />
          </Card>
        </div>
      </div>
    </div>
  );
}
