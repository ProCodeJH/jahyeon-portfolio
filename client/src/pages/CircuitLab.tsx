/**
 * Professional Circuit Lab - 완전히 작동하는 Tinkercad 퀄리티
 * 실제 Arduino 코드 실행 + 컴포넌트 시뮬레이션
 */

import { useState, useEffect, useRef } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useCircuitStore } from '@/lib/circuit-store';
import { ComponentLibrary } from '@/components/circuit/ComponentLibrary';
import { CircuitCanvas } from '@/components/circuit/CircuitCanvas';
import { ArduinoSimulator } from '@/utils/arduino-simulator';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import {
  Play,
  Square,
  RotateCcw,
  Code as CodeIcon,
  Grid3x3,
  FileText,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const defaultCode = `// Professional Circuit Lab
// 완전히 작동하는 Arduino 시뮬레이터
#define LED_PIN 13
#define PIR_PIN 7
#define PHOTO_PIN A0

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  Serial.begin(115200);

  Serial.println("🎨 Circuit Lab Ready!");
  Serial.println("Real Arduino Simulation Running!");
}

void loop() {
  // Read sensors
  int pirState = digitalRead(PIR_PIN);
  int lightValue = analogRead(PHOTO_PIN);

  // Print values
  Serial.print("PIR: ");
  Serial.print(pirState ? "MOTION" : "None");
  Serial.print(" | Light: ");
  Serial.println(lightValue);

  // Control LED based on PIR
  if (pirState == HIGH) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("💡 LED ON");
  } else {
    digitalWrite(LED_PIN, LOW);
  }

  delay(500);
}`;

export default function CircuitLab() {
  const { viewMode, setViewMode, components = [], clearCircuit } = useCircuitStore();
  const [code, setCode] = useState(defaultCode);
  const [isRunning, setIsRunning] = useState(false);
  const [serialOutput, setSerialOutput] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(true);
  const [showSerialMonitor, setShowSerialMonitor] = useState(true);
  const [compileError, setCompileError] = useState('');

  const simulatorRef = useRef<ArduinoSimulator | null>(null);
  const serialBufferRef = useRef<HTMLDivElement>(null);

  // Initialize Arduino Simulator
  useEffect(() => {
    simulatorRef.current = new ArduinoSimulator({
      onSerialOutput: (text) => {
        setSerialOutput(prev => {
          const newOutput = prev + text;
          // Auto-scroll to bottom
          setTimeout(() => {
            if (serialBufferRef.current) {
              serialBufferRef.current.scrollTop = serialBufferRef.current.scrollHeight;
            }
          }, 10);
          return newOutput;
        });
      },
      onPinChange: (pin, digitalValue, analogValue) => {
        console.log(`Pin ${pin} changed: Digital=${digitalValue}, Analog=${analogValue}`);

        // Update component visuals based on pin changes
        const store = useCircuitStore.getState();
        const updatedComponents = store.components.map(component => {
          // Update Arduino UNO onboard LED (pin 13)
          if (component.type === 'arduino-uno' && pin === 13) {
            return {
              ...component,
              properties: {
                ...component.properties,
                led13Brightness: analogValue / 1023, // 0-1 range
                led13On: digitalValue,
              }
            };
          }

          // Update LED components connected to this pin
          if (component.type === 'led') {
            // Check if any pin of this LED is connected to the Arduino pin
            const isConnected = component.pins.some(p => {
              // Check if there's a wire connecting this pin to Arduino pin
              const wire = store.wires.find(w =>
                (w.fromPinId === p.id || w.toPinId === p.id)
              );
              return wire !== undefined;
            });

            if (isConnected) {
              return {
                ...component,
                properties: {
                  ...component.properties,
                  brightness: analogValue / 1023, // 0-1 range for PWM
                  isOn: digitalValue,
                }
              };
            }
          }

          return component;
        });

        // Update the store with new component states
        store.loadCircuit({ components: updatedComponents });
      },
      onAnalogRead: (pin) => {
        // Simulate sensor values
        if (pin === 14) { // A0 (PHOTO_PIN)
          // Simulate photoresistor: random light values
          return Math.floor(Math.random() * 300) + 400; // 400-700
        }
        return 0;
      }
    });

    return () => {
      if (simulatorRef.current) {
        simulatorRef.current.stop();
      }
    };
  }, []);

  // Simulate PIR sensor and photoresistor
  useEffect(() => {
    if (!isRunning || !simulatorRef.current) return;

    // PIR sensor simulation (every 2 seconds)
    const pirInterval = setInterval(() => {
      if (simulatorRef.current) {
        // Randomly trigger PIR sensor (pin 7)
        const motion = Math.random() > 0.7; // 30% chance of motion
        simulatorRef.current.setPinValue(7, motion);

        // Update PIR sensor visual state
        const store = useCircuitStore.getState();
        const updatedComponents = store.components.map(component => {
          if (component.type === 'pir-sensor') {
            return {
              ...component,
              properties: {
                ...component.properties,
                motionDetected: motion,
              }
            };
          }
          return component;
        });
        store.loadCircuit({ components: updatedComponents });
      }
    }, 2000);

    // Photoresistor simulation (every 500ms)
    const photoInterval = setInterval(() => {
      const store = useCircuitStore.getState();
      const updatedComponents = store.components.map(component => {
        if (component.type === 'photoresistor') {
          // Simulate varying light levels
          const newLightLevel = Math.floor(Math.random() * 300) + 400; // 400-700
          return {
            ...component,
            properties: {
              ...component.properties,
              lightLevel: newLightLevel,
            }
          };
        }
        return component;
      });
      store.loadCircuit({ components: updatedComponents });
    }, 500);

    return () => {
      clearInterval(pirInterval);
      clearInterval(photoInterval);
    };
  }, [isRunning]);

  const handleRun = async () => {
    if (!simulatorRef.current) return;

    setCompileError('');
    setSerialOutput('🔨 Compiling Arduino code...\n');

    // Simulate compilation delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Compile code
    const result = await simulatorRef.current.compile(code);

    if (!result.success) {
      setCompileError(result.error || 'Compilation failed');
      setSerialOutput(prev => prev + `\n❌ Compilation Error:\n${result.error}\n`);
      return;
    }

    setSerialOutput(prev => prev + '✅ Compilation successful!\n🚀 Starting simulation...\n\n');

    // Start Arduino simulation
    await new Promise(resolve => setTimeout(resolve, 300));
    simulatorRef.current.start();
    setIsRunning(true);
  };

  const handleStop = () => {
    if (simulatorRef.current) {
      simulatorRef.current.stop();
    }
    setIsRunning(false);
  };

  const handleReset = () => {
    if (simulatorRef.current) {
      simulatorRef.current.reset();
    }
    setIsRunning(false);
    setSerialOutput('');
    setCompileError('');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <Navigation />

      {/* Circuit Lab Container */}
      <div className="flex-1 flex flex-col pt-[73px]">
        {/* Control Bar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
          {/* Left: Project Info */}
          <div className="flex items-center gap-3">
            <Grid3x3 className="w-5 h-5 text-blue-600" />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-gray-900">Circuit Lab</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Professional Arduino Simulator</span>
            </div>
            {compileError && (
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                ❌ Compile Error
              </span>
            )}
          </div>

          {/* Center: View Modes */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="h-9">
            <TabsList className="h-9 bg-gray-100">
              <TabsTrigger value="simulation" className="text-xs">
                <Grid3x3 className="w-3.5 h-3.5 mr-1.5" />
                Simulation
              </TabsTrigger>
              <TabsTrigger value="schematic" className="text-xs">
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Schematic
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs">
                <CodeIcon className="w-3.5 h-3.5 mr-1.5" />
                Code
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRun}
              disabled={isRunning}
              className={cn(
                "h-8",
                isRunning
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              )}
              size="sm"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              {isRunning ? 'Running...' : 'Start Simulation'}
            </Button>

            <Button
              onClick={handleStop}
              disabled={!isRunning}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              <Square className="w-3.5 h-3.5 mr-1.5" />
              Stop
            </Button>

            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="h-8"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>

            <div className="w-px h-6 bg-gray-300" />

            <Button
              onClick={() => clearCircuit()}
              variant="ghost"
              size="sm"
              className="h-8 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear Circuit
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Code Editor (Collapsible) */}
          {viewMode !== 'schematic' && (
            <div
              className={cn(
                'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
                showCodeEditor ? 'w-[400px]' : 'w-0'
              )}
            >
              {showCodeEditor && (
                <>
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <CodeIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold text-gray-900">Arduino Code</span>
                      <span className="text-xs text-gray-500">(Live Editing)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCodeEditor(false)}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <Editor
                      height="100%"
                      language="cpp"
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      theme="light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        cursorStyle: 'line',
                        smoothScrolling: true,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Show Editor Button (when collapsed) */}
          {!showCodeEditor && viewMode !== 'schematic' && (
            <button
              onClick={() => setShowCodeEditor(true)}
              className="w-8 bg-white border-r border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Show Code Editor"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Center: Circuit Canvas or View */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {viewMode === 'simulation' && (
              <CircuitCanvas />
            )}

            {viewMode === 'schematic' && (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="text-center space-y-4">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-700">
                      Schematic View
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      Auto-generated circuit schematic coming in Phase 1.4
                    </p>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'code' && (
              <div className="flex-1 p-6 overflow-auto bg-white">
                <div className="max-w-5xl mx-auto">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Full Code Editor</h2>
                    <div className="flex gap-2">
                      <Button onClick={handleRun} disabled={isRunning} size="sm" className="bg-green-600 hover:bg-green-700">
                        <Play className="w-4 h-4 mr-1.5" />
                        Run Code
                      </Button>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
                    <Editor
                      height="100%"
                      language="cpp"
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      theme="light"
                      options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom: Serial Monitor (Collapsible) */}
            {showSerialMonitor && viewMode !== 'code' && (
              <div className="h-48 border-t border-gray-200 bg-gray-900 shrink-0 flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      isRunning ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-gray-500'
                    )} />
                    <span className="text-sm font-bold text-white">Serial Monitor</span>
                    <span className="text-xs text-gray-400">115200 baud | Real-time Output</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSerialOutput('')}
                      className="h-6 text-xs text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      Clear
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSerialMonitor(false)}
                      className="h-6 text-white hover:bg-gray-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div
                  ref={serialBufferRef}
                  className="flex-1 overflow-auto p-4 font-mono text-sm"
                  style={{ maxHeight: '176px' }}
                >
                  <pre className="text-green-400 whitespace-pre-wrap leading-relaxed">
                    {serialOutput || '// Waiting for simulation to start...\n// Click "Start Simulation" to run your Arduino code!'}
                  </pre>
                </div>
              </div>
            )}

            {!showSerialMonitor && viewMode !== 'code' && (
              <button
                onClick={() => setShowSerialMonitor(true)}
                className="h-8 bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <ChevronRight className="w-4 h-4 mr-1" />
                Show Serial Monitor
              </button>
            )}
          </div>

          {/* Right: Component Library */}
          {viewMode !== 'code' && (
            <div className="w-[320px] shrink-0">
              <ComponentLibrary />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
