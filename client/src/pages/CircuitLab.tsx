import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import Editor from "@monaco-editor/react";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  Thermometer,
  Lightbulb,
  Download,
  Settings,
  Code as CodeIcon,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { ArduinoSimulator } from '../utils/arduino-simulator';

const defaultCode = `// Arduino LED Blink with PIR Sensor
#define LED_PIN 13
#define PIR_PIN 7
#define PHOTO_PIN A0

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  Serial.begin(115200);

  Serial.println("Circuit Lab Started!");
  Serial.println("PIR Sensor Monitoring...");
}

void loop() {
  // Read PIR sensor
  int pirState = digitalRead(PIR_PIN);

  // Read light sensor
  int lightValue = analogRead(PHOTO_PIN);

  // Print values
  Serial.print("PIR: ");
  Serial.print(pirState ? "MOTION" : "NONE");
  Serial.print(" | Light: ");
  Serial.println(lightValue);

  // Control LED based on PIR
  if (pirState == HIGH) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("LED: ON");
  } else {
    digitalWrite(LED_PIN, LOW);
    Serial.println("LED: OFF");
  }

  delay(500);
}`;

export default function CircuitLab() {
  const [code, setCode] = useState(defaultCode);
  const [isRunning, setIsRunning] = useState(false);
  const [serialOutput, setSerialOutput] = useState("");
  const [ledState, setLedState] = useState(false);
  const [pirValue, setPirValue] = useState(false);
  const [lightValue, setLightValue] = useState(500);
  const [showWiring, setShowWiring] = useState(true);
  const [compileError, setCompileError] = useState("");

  const simulatorRef = useRef<ArduinoSimulator | null>(null);
  const serialBufferRef = useRef<string>("");

  // Compile and run Arduino code
  const handleRun = async () => {
    try {
      setCompileError("");
      setSerialOutput("🔨 Initializing Arduino simulator...\n");

      // Stop previous simulator
      if (simulatorRef.current) {
        simulatorRef.current.stop();
      }

      serialBufferRef.current = "🔨 Initializing Arduino simulator...\n";
      setSerialOutput(serialBufferRef.current);

      // Create and start simulator
      const simulator = new ArduinoSimulator();
      simulatorRef.current = simulator;

      // Listen for serial output
      simulator.onSerialOutput = (data: string) => {
        serialBufferRef.current += data;
        setSerialOutput(serialBufferRef.current);
      };

      // Monitor pin changes
      simulator.onPinChange = (pin: number, value: boolean) => {
        if (pin === 13) { // LED pin
          setLedState(value);
        }
      };

      // Provide analog sensor values
      simulator.onAnalogRead = (pin: number) => {
        if (pin === 14) { // A0 = photoresistor
          return lightValue;
        }
        return 0;
      };

      // Set initial sensor states
      simulator.setPinValue(7, pirValue); // PIR sensor
      simulator.setAnalogValue(14, lightValue); // Photoresistor on A0

      await simulator.execute(code);
      setIsRunning(true);

    } catch (error) {
      console.error("Execution error:", error);
      setCompileError(String(error));
      setSerialOutput(prev => prev + "\n❌ Error: " + String(error) + "\n");
    }
  };

  const handleStop = () => {
    if (simulatorRef.current) {
      simulatorRef.current.stop();
      simulatorRef.current = null;
    }
    setIsRunning(false);
    setLedState(false);
    setSerialOutput(prev => prev + "\n⏹️ Simulation stopped\n");
  };

  const handleReset = () => {
    handleStop();
    setSerialOutput("");
    serialBufferRef.current = "";
    setCompileError("");
  };

  // Simulate PIR sensor trigger
  const triggerPIR = () => {
    setPirValue(true);
    if (simulatorRef.current) {
      simulatorRef.current.setPinValue(7, true); // PIR pin
    }
    setTimeout(() => {
      setPirValue(false);
      if (simulatorRef.current) {
        simulatorRef.current.setPinValue(7, false);
      }
    }, 2000);
  };

  // Update light sensor value
  useEffect(() => {
    if (simulatorRef.current && isRunning) {
      simulatorRef.current.setAnalogValue(14, lightValue); // A0 pin (A0 = pin 14)
    }
  }, [lightValue, isRunning]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />

      <div className="pt-24 px-4 md:px-8 pb-12">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Circuit Lab Pro
              </span>
            </h1>
            <p className="text-lg text-gray-600">
              Real Arduino Simulator powered by avr8js
            </p>
          </motion.div>

          {/* Control Bar */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-6 border-2 border-gray-100 shadow-xl">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleRun}
                disabled={isRunning}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Play className="mr-2 h-4 w-4" />
                {isRunning ? "Running..." : "Run"}
              </Button>
              <Button
                onClick={handleStop}
                disabled={!isRunning}
                className="bg-gradient-to-r from-red-500 to-orange-500"
              >
                <Pause className="mr-2 h-4 w-4" />
                Stop
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>

              <div className="h-8 w-px bg-gray-300 mx-2" />

              <Button
                onClick={() => setShowWiring(!showWiring)}
                variant="outline"
                size="sm"
              >
                {showWiring ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
                Wiring
              </Button>

              <div className="flex-1" />

              <div className="flex items-center gap-2">
                <Activity className={`w-5 h-5 ${isRunning ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                <span className="text-sm font-bold">
                  Status: <span className={isRunning ? 'text-green-600' : 'text-gray-500'}>
                    {isRunning ? 'Running' : 'Stopped'}
                  </span>
                </span>
              </div>
            </div>

            {compileError && (
              <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-mono">{compileError}</p>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Circuit Board */}
            <div className="lg:col-span-2 space-y-6">
              {/* Arduino + Breadboard */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-gray-100">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                  Circuit Board
                </h2>

                <div className="relative">
                  <svg viewBox="0 0 1200 700" className="w-full border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50/30">
                    {/* Arduino UNO Board */}
                    <g id="arduino">
                      <rect x="50" y="150" width="350" height="250" rx="15" fill="#0A5F73" stroke="#073B4C" strokeWidth="3" />
                      <text x="225" y="195" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">ARDUINO UNO</text>

                      {/* USB Port */}
                      <rect x="60" y="230" width="30" height="50" rx="5" fill="#C0C0C0" stroke="#888" strokeWidth="2" />

                      {/* Power LED */}
                      {isRunning && (
                        <g>
                          <circle cx="350" cy="180" r="6" fill="#00FF00">
                            <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
                          </circle>
                          <text x="365" y="185" fill="#00FF00" fontSize="12" fontWeight="bold">PWR</text>
                        </g>
                      )}

                      {/* Pin 13 LED */}
                      <circle cx="225" y="275" r="20" fill={ledState ? "#FF0000" : "#330000"} opacity={ledState ? 1 : 0.3} />
                      {ledState && (
                        <>
                          <circle cx="225" cy="275" r="30" fill="#FF0000" opacity="0.4" />
                          <circle cx="225" cy="275" r="40" fill="#FF0000" opacity="0.2" />
                        </>
                      )}
                      <text x="225" y="280" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">13</text>

                      {/* Digital Pins */}
                      {[...Array(14)].map((_, i) => (
                        <g key={`d${i}`}>
                          <circle cx={110 + i * 20} cy={380} r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="1.5" />
                          <text x={110 + i * 20} y={400} textAnchor="middle" fontSize="9" fill="#333">{i}</text>
                        </g>
                      ))}

                      {/* Analog Pins */}
                      {[...Array(6)].map((_, i) => (
                        <g key={`a${i}`}>
                          <circle cx={110 + i * 25} cy={170} r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="1.5" />
                          <text x={110 + i * 25} y={160} textAnchor="middle" fontSize="9" fill="white">A{i}</text>
                        </g>
                      ))}
                    </g>

                    {/* Breadboard */}
                    <g id="breadboard">
                      <rect x="500" y="100" width="650" height="500" rx="10" fill="#F5E6D3" stroke="#D4A574" strokeWidth="3" />

                      {/* Breadboard holes */}
                      {[...Array(30)].map((_, row) => (
                        <g key={row}>
                          {[...Array(10)].map((_, col) => (
                            <circle
                              key={col}
                              cx={530 + col * 60}
                              cy={130 + row * 15}
                              r="3"
                              fill="#8B7355"
                              opacity="0.6"
                            />
                          ))}
                        </g>
                      ))}

                      {/* Power rails */}
                      <line x1="515" y1="120" x2="515" y2="580" stroke="#FF0000" strokeWidth="4" />
                      <line x1="1135" y1="120" x2="1135" y2="580" stroke="#0000FF" strokeWidth="4" />
                      <text x="510" y="115" fill="#FF0000" fontSize="14" fontWeight="bold">+</text>
                      <text x="1130" y="115" fill="#0000FF" fontSize="14" fontWeight="bold">-</text>
                    </g>

                    {/* PIR Sensor */}
                    <g id="pir-sensor">
                      <rect x="700" y="200" width="80" height="100" rx="8" fill="#28A745" stroke="#1E7E34" strokeWidth="2" />
                      <circle cx="740" cy="235" r="25" fill="white" opacity="0.8" />
                      <circle cx="740" cy="235" r="20" fill="#E0E0E0" />
                      {pirValue && (
                        <circle cx="740" cy="235" r="25" fill="#FFD700" opacity="0.6">
                          <animate attributeName="r" values="25;30;25" dur="0.5s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <text x="740" y="285" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">PIR</text>

                      {/* PIR Pins */}
                      <circle cx="710" cy="310" r="3" fill="#FFD700" />
                      <circle cx="740" cy="310" r="3" fill="#FFD700" />
                      <circle cx="770" cy="310" r="3" fill="#FFD700" />
                      <text x="710" y="325" textAnchor="middle" fontSize="8">VCC</text>
                      <text x="740" y="325" textAnchor="middle" fontSize="8">OUT</text>
                      <text x="770" y="325" textAnchor="middle" fontSize="8">GND</text>
                    </g>

                    {/* Photoresistor */}
                    <g id="photoresistor">
                      <rect x="580" y="350" width="60" height="80" rx="5" fill="#8B4513" stroke="#654321" strokeWidth="2" />
                      <path d="M 590 365 Q 610 375, 590 385 Q 610 395, 590 405 Q 610 415, 590 425" stroke="#FFD700" strokeWidth="3" fill="none" />
                      <path d="M 620 365 Q 600 375, 620 385 Q 600 395, 620 405 Q 600 415, 620 425" stroke="#FFD700" strokeWidth="3" fill="none" />
                      <text x="610" y="450" textAnchor="middle" fontSize="11" fontWeight="bold">Light</text>

                      {/* Visual indicator */}
                      <circle cx="610" cy="390" r={10 + (lightValue / 100)} fill="#FFFF00" opacity={lightValue / 1000} />
                    </g>

                    {/* LED Component */}
                    <g id="external-led">
                      <circle cx="900" cy="300" r="18" fill={ledState ? "#FF0000" : "#660000"} opacity={ledState ? 1 : 0.5} />
                      {ledState && (
                        <>
                          <circle cx="900" cy="300" r="25" fill="#FF0000" opacity="0.4" />
                          <circle cx="900" cy="300" r="32" fill="#FF0000" opacity="0.2" />
                        </>
                      )}
                      <line x1="900" y1="318" x2="900" y2="340" stroke="#666" strokeWidth="2" />
                      <line x1="900" y1="260" x2="900" y2="282" stroke="#666" strokeWidth="2" />
                      <text x="900" y="365" textAnchor="middle" fontSize="11" fontWeight="bold">LED</text>
                    </g>

                    {/* Wiring */}
                    {showWiring && (
                      <g id="wires">
                        {/* LED to Pin 13 */}
                        <path d="M 225 380 L 225 420 L 900 420 L 900 340" stroke="#FF0000" strokeWidth="3" fill="none" strokeDasharray="5,5" />

                        {/* PIR to Pin 7 */}
                        <path d="M 250 380 L 250 440 L 740 440 L 740 310" stroke="#00FF00" strokeWidth="3" fill="none" strokeDasharray="5,5" />

                        {/* Photoresistor to A0 */}
                        <path d="M 110 170 L 110 100 L 610 100 L 610 350" stroke="#FFA500" strokeWidth="3" fill="none" strokeDasharray="5,5" />

                        {/* GND connections */}
                        <path d="M 390 380 L 390 450 L 1135 450" stroke="#0000FF" strokeWidth="3" fill="none" />

                        {/* VCC connections */}
                        <path d="M 380 380 L 380 470 L 515 470" stroke="#FF0000" strokeWidth="3" fill="none" />
                      </g>
                    )}
                  </svg>
                </div>

                {/* Component Controls */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800">PIR Sensor</h3>
                      <Button
                        size="sm"
                        onClick={triggerPIR}
                        disabled={!isRunning}
                        className="bg-gradient-to-r from-green-500 to-emerald-500"
                      >
                        Trigger Motion
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className={`w-5 h-5 ${pirValue ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm font-semibold">
                        {pirValue ? 'MOTION DETECTED' : 'No Motion'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200">
                    <h3 className="font-bold text-gray-800 mb-3">Light Sensor</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-bold">{lightValue} lux</span>
                      </div>
                      <Slider
                        value={[lightValue]}
                        onValueChange={(v) => setLightValue(v[0])}
                        min={0}
                        max={1000}
                        step={10}
                        className="w-full"
                        disabled={!isRunning}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Serial Monitor */}
              <div className="bg-gray-900 rounded-3xl overflow-hidden border-2 border-gray-700 shadow-2xl">
                <div className="flex items-center gap-3 p-4 bg-gray-800 border-b border-gray-700">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-lg font-bold text-white">Serial Monitor</span>
                  <span className="ml-auto text-xs text-gray-400">115200 baud</span>
                </div>
                <div className="p-6 h-64 overflow-auto font-mono text-sm">
                  <pre className="text-green-400 whitespace-pre-wrap">
                    {serialOutput || "// Waiting for code execution..."}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right: Code Editor */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-100">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-gray-100">
                  <CodeIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-bold text-gray-800">Arduino Code</span>
                </div>
                <Editor
                  height="500px"
                  language="cpp"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                />
              </div>

              {/* Info */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Circuit Info
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>LED:</strong> Pin 13 (Built-in)</p>
                  <p><strong>PIR Sensor:</strong> Pin 7 (Digital)</p>
                  <p><strong>Light Sensor:</strong> Pin A0 (Analog)</p>
                  <p><strong>Baud Rate:</strong> 115200</p>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white h-12">
                <Download className="mr-2 h-5 w-5" />
                Export to .ino
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
