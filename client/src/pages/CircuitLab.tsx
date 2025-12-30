/**
 * Professional Circuit Lab - Tinkercad Quality
 * Left: Code Editor | Center: Circuit Canvas | Right: Component Library
 */

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useCircuitStore } from '@/lib/circuit-store';
import { ComponentLibrary } from '@/components/circuit/ComponentLibrary';
import { CircuitCanvas } from '@/components/circuit/CircuitCanvas';
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
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const defaultCode = `// Tinkercad-Style Circuit Lab
#define LED_PIN 13
#define PIR_PIN 7
#define PHOTO_PIN A0

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  Serial.begin(115200);

  Serial.println("🎨 Circuit Lab Ready!");
  Serial.println("Drag components to the canvas");
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

  // Control LED
  if (pirState == HIGH) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }

  delay(500);
}`;

export default function CircuitLab() {
  const { viewMode, setViewMode, components, clearCircuit } = useCircuitStore();
  const [code, setCode] = useState(defaultCode);
  const [isRunning, setIsRunning] = useState(false);
  const [serialOutput, setSerialOutput] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(true);
  const [showSerialMonitor, setShowSerialMonitor] = useState(true);

  const handleRun = async () => {
    setIsRunning(true);
    setSerialOutput('🔨 Compiling code...\n');

    await new Promise(resolve => setTimeout(resolve, 800));

    setSerialOutput(prev => prev + '✅ Compilation successful\n🚀 Running simulation...\n\n');

    await new Promise(resolve => setTimeout(resolve, 500));

    const mockOutput = `🎨 Circuit Lab Ready!
Drag components to the canvas
PIR: None | Light: 512
PIR: None | Light: 515
PIR: MOTION | Light: 498
PIR: MOTION | Light: 501

✅ Simulation running...`;

    setSerialOutput(prev => prev + mockOutput);
  };

  const handleStop = () => {
    setIsRunning(false);
    setSerialOutput(prev => prev + '\n\n⏹️ Simulation stopped\n');
  };

  const handleReset = () => {
    setIsRunning(false);
    setSerialOutput('');
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
              <span className="text-gray-600">Tinkercad Style</span>
            </div>
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
              className="bg-green-600 hover:bg-green-700 h-8"
              size="sm"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              {isRunning ? 'Running' : 'Start'}
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
              Clear
            </Button>

            <Button variant="ghost" size="sm" className="h-8">
              <Download className="w-3.5 h-3.5" />
            </Button>

            <Button variant="ghost" size="sm" className="h-8">
              <Upload className="w-3.5 h-3.5" />
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
                        fontFamily: 'JetBrains Mono, Fira Code, monospace',
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
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
                      Auto-generated circuit schematic coming soon!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'code' && (
              <div className="flex-1 p-6 overflow-auto">
                <Editor
                  height="100%"
                  language="cpp"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="light"
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                />
              </div>
            )}

            {/* Bottom: Serial Monitor (Collapsible) */}
            {showSerialMonitor && viewMode !== 'code' && (
              <div className="h-48 border-t border-gray-200 bg-white shrink-0">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                    )} />
                    <span className="text-sm font-bold text-white">Serial Monitor</span>
                    <span className="text-xs text-gray-400">115200 baud</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSerialMonitor(false)}
                    className="h-6 text-white hover:bg-gray-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>

                <div className="h-[calc(100%-40px)] overflow-auto p-4 bg-gray-900 font-mono text-sm">
                  <pre className="text-green-400 whitespace-pre-wrap">
                    {serialOutput || '// Waiting for simulation to start...'}
                  </pre>
                </div>
              </div>
            )}

            {!showSerialMonitor && viewMode !== 'code' && (
              <button
                onClick={() => setShowSerialMonitor(true)}
                className="h-8 bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors text-sm"
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
