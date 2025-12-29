import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import {
  Zap,
  Power,
  Lightbulb,
  Activity,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Play,
  Pause,
  RotateCcw,
  Code,
  Settings,
  Download,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Component {
  id: string;
  type: 'led' | 'resistor' | 'sensor' | 'motor' | 'button';
  x: number;
  y: number;
  state: boolean;
  value?: number;
}

interface SensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
  light: number;
  motion: boolean;
}

export default function CircuitLab() {
  const [isRunning, setIsRunning] = useState(false);
  const [components, setComponents] = useState<Component[]>([
    { id: 'led1', type: 'led', x: 250, y: 150, state: false },
    { id: 'led2', type: 'led', x: 350, y: 150, state: false },
    { id: 'led3', type: 'led', x: 450, y: 150, state: false }
  ]);

  const [voltage, setVoltage] = useState(5);
  const [frequency, setFrequency] = useState(1);
  const [blinkSpeed, setBlinkSpeed] = useState(500);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [currentSensor, setCurrentSensor] = useState<SensorData>({
    timestamp: new Date().toLocaleTimeString(),
    temperature: 22,
    humidity: 45,
    light: 650,
    motion: false
  });

  // Simulate real-time sensor data
  useEffect(() => {
    const interval = setInterval(() => {
      const newData: SensorData = {
        timestamp: new Date().toLocaleTimeString(),
        temperature: 20 + Math.random() * 10,
        humidity: 40 + Math.random() * 20,
        light: isRunning ? 800 + Math.random() * 200 : 200 + Math.random() * 200,
        motion: isRunning && Math.random() > 0.7
      };

      setCurrentSensor(newData);
      setSensorData(prev => [...prev.slice(-19), newData]);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // LED blinking simulation
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setComponents(prev => prev.map(comp => {
          if (comp.type === 'led') {
            return { ...comp, state: !comp.state };
          }
          return comp;
        }));
      }, blinkSpeed);

      return () => clearInterval(interval);
    }
  }, [isRunning, blinkSpeed]);

  const handleReset = () => {
    setIsRunning(false);
    setComponents(prev => prev.map(comp => ({ ...comp, state: false })));
    setSensorData([]);
  };

  const arduinoCode = `#include <DHT.h>

#define LED_PIN_1 9
#define LED_PIN_2 10
#define LED_PIN_3 11
#define DHT_PIN 2
#define LIGHT_SENSOR A0
#define MOTION_PIN 7

DHT dht(DHT_PIN, DHT11);

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN_1, OUTPUT);
  pinMode(LED_PIN_2, OUTPUT);
  pinMode(LED_PIN_3, OUTPUT);
  pinMode(MOTION_PIN, INPUT);
  dht.begin();

  Serial.println("Circuit Lab Started!");
}

void loop() {
  // Read sensors
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  int light = analogRead(LIGHT_SENSOR);
  bool motion = digitalRead(MOTION_PIN);

  // Control LEDs based on sensors
  if (light > 500) {
    digitalWrite(LED_PIN_1, HIGH);
    delay(${blinkSpeed});
    digitalWrite(LED_PIN_1, LOW);
  }

  if (temp > 25) {
    digitalWrite(LED_PIN_2, HIGH);
  }

  if (motion) {
    digitalWrite(LED_PIN_3, HIGH);
    delay(1000);
    digitalWrite(LED_PIN_3, LOW);
  }

  // Print data
  Serial.print("Temp: "); Serial.print(temp);
  Serial.print(" | Humidity: "); Serial.print(humidity);
  Serial.print(" | Light: "); Serial.print(light);
  Serial.print(" | Motion: "); Serial.println(motion);

  delay(${1000 / frequency});
}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />

      <div className="pt-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Circuit Lab
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Tinkercad-style Arduino & IoT Simulator
            </p>
          </motion.div>

          <Tabs defaultValue="circuit" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="circuit" className="text-lg font-bold">
                <Zap className="w-5 h-5 mr-2" />
                Circuit Board
              </TabsTrigger>
              <TabsTrigger value="sensors" className="text-lg font-bold">
                <Activity className="w-5 h-5 mr-2" />
                IoT Sensors
              </TabsTrigger>
              <TabsTrigger value="code" className="text-lg font-bold">
                <Code className="w-5 h-5 mr-2" />
                Arduino Code
              </TabsTrigger>
            </TabsList>

            {/* Circuit Board Tab */}
            <TabsContent value="circuit">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Canvas Area */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-100 min-h-[600px]">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-black">Circuit Canvas</h2>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setIsRunning(!isRunning)}
                          className={`${
                            isRunning
                              ? 'bg-gradient-to-r from-red-500 to-orange-500'
                              : 'bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}
                        >
                          {isRunning ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Run
                            </>
                          )}
                        </Button>
                        <Button onClick={handleReset} variant="outline">
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Arduino Board SVG */}
                    <svg viewBox="0 0 600 400" className="w-full border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50">
                      {/* Board Background */}
                      <rect x="50" y="50" width="500" height="300" rx="15" fill="#0A5F73" stroke="#073B4C" strokeWidth="3" />

                      {/* Arduino Logo/Text */}
                      <text x="300" y="90" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">
                        ARDUINO UNO
                      </text>
                      <text x="300" y="115" textAnchor="middle" fill="#FFD700" fontSize="14">
                        Circuit Lab Simulator
                      </text>

                      {/* Digital Pins */}
                      <g id="digital-pins">
                        {[...Array(14)].map((_, i) => (
                          <g key={`digital-${i}`}>
                            <circle cx={100 + i * 30} cy={330} r="6" fill="#FFD700" stroke="#DAA520" strokeWidth="2" />
                            <text x={100 + i * 30} y={355} textAnchor="middle" fontSize="10" fill="#333">
                              {i}
                            </text>
                          </g>
                        ))}
                      </g>

                      {/* Analog Pins */}
                      <g id="analog-pins">
                        {[...Array(6)].map((_, i) => (
                          <g key={`analog-${i}`}>
                            <circle cx={100 + i * 30} cy={70} r="6" fill="#FFD700" stroke="#DAA520" strokeWidth="2" />
                            <text x={100 + i * 30} y={60} textAnchor="middle" fontSize="10" fill="white">
                              A{i}
                            </text>
                          </g>
                        ))}
                      </g>

                      {/* LEDs */}
                      {components.filter(c => c.type === 'led').map((led, idx) => (
                        <g key={led.id}>
                          {/* LED bulb */}
                          <circle
                            cx={led.x}
                            cy={led.y}
                            r="25"
                            fill={led.state && isRunning ? '#FF0000' : '#330000'}
                            opacity={led.state && isRunning ? 1 : 0.3}
                          />
                          {led.state && isRunning && (
                            <>
                              <circle cx={led.x} cy={led.y} r="35" fill="#FF0000" opacity="0.4" />
                              <circle cx={led.x} cy={led.y} r="45" fill="#FF0000" opacity="0.2" />
                            </>
                          )}
                          <text x={led.x} y={led.y + 5} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                            LED{idx + 1}
                          </text>

                          {/* Wire to pin */}
                          <line
                            x1={led.x}
                            y1={led.y + 25}
                            x2={280 + idx * 30}
                            y2={330}
                            stroke={led.state && isRunning ? '#00FF00' : '#666'}
                            strokeWidth="2"
                            strokeDasharray="5,5"
                          />
                        </g>
                      ))}

                      {/* Power LED */}
                      {isRunning && (
                        <g>
                          <circle cx="470" cy="90" r="8" fill="#00FF00">
                            <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
                          </circle>
                          <text x="485" y="95" fill="#00FF00" fontSize="12" fontWeight="bold">PWR</text>
                        </g>
                      )}

                      {/* USB Port */}
                      <rect x="60" y="180" width="25" height="40" rx="3" fill="#C0C0C0" stroke="#888" strokeWidth="2" />
                      <text x="85" y="205" fontSize="10" fill="white">USB</text>
                    </svg>

                    {/* Component Status */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      {components.filter(c => c.type === 'led').map((led, idx) => (
                        <div
                          key={led.id}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            led.state && isRunning
                              ? 'bg-red-50 border-red-300'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Lightbulb
                              className={`w-6 h-6 ${
                                led.state && isRunning ? 'text-red-500' : 'text-gray-400'
                              }`}
                            />
                            <div>
                              <p className="font-bold text-sm">LED {idx + 1}</p>
                              <p className="text-xs text-gray-500">
                                Pin {9 + idx}: {led.state && isRunning ? 'ON' : 'OFF'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Control Panel */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 border-2 border-blue-200 shadow-xl">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                      <Settings className="w-6 h-6 text-blue-600" />
                      Control Panel
                    </h3>

                    {/* Voltage Control */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Supply Voltage: {voltage}V
                      </label>
                      <Slider
                        value={[voltage]}
                        onValueChange={(v) => setVoltage(v[0])}
                        min={3}
                        max={12}
                        step={0.5}
                        className="w-full"
                      />
                    </div>

                    {/* Blink Speed */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Blink Speed: {blinkSpeed}ms
                      </label>
                      <Slider
                        value={[blinkSpeed]}
                        onValueChange={(v) => setBlinkSpeed(v[0])}
                        min={100}
                        max={2000}
                        step={100}
                        disabled={!isRunning}
                      />
                    </div>

                    {/* Frequency */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Loop Frequency: {frequency}Hz
                      </label>
                      <Slider
                        value={[frequency]}
                        onValueChange={(v) => setFrequency(v[0])}
                        min={0.5}
                        max={10}
                        step={0.5}
                        disabled={!isRunning}
                      />
                    </div>

                    {/* Status */}
                    <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className={`w-5 h-5 ${isRunning ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                        <span className="font-bold text-sm">
                          Status: <span className={isRunning ? 'text-green-600' : 'text-gray-500'}>
                            {isRunning ? 'Running' : 'Stopped'}
                          </span>
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Power: {(voltage * 0.02).toFixed(2)}W
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-xl">
                    <h3 className="text-lg font-black mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button className="w-full" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export Circuit
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Import Circuit
                      </Button>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <Code className="mr-2 h-4 w-4" />
                        Generate Code
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* IoT Sensors Tab */}
            <TabsContent value="sensors">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Sensor Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <Thermometer className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-600">Temperature</p>
                        <p className="text-2xl font-black text-gray-900">
                          {currentSensor.temperature.toFixed(1)}°C
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Droplets className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-600">Humidity</p>
                        <p className="text-2xl font-black text-gray-900">
                          {currentSensor.humidity.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                        <Sun className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-600">Light</p>
                        <p className="text-2xl font-black text-gray-900">
                          {currentSensor.light.toFixed(0)} lux
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-600">Motion</p>
                        <p className="text-2xl font-black text-gray-900">
                          {currentSensor.motion ? 'Detected' : 'None'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                    <h3 className="text-lg font-black mb-4">Temperature Trend</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={sensorData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                        <YAxis domain={[15, 35]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                    <h3 className="text-lg font-black mb-4">Light Level Trend</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={sensorData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 1000]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="light"
                          stroke="#eab308"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Arduino Code Tab */}
            <TabsContent value="code">
              <div className="bg-gray-900 rounded-3xl p-8 border-2 border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    <Code className="w-7 h-7 text-green-400" />
                    Arduino Code
                  </h3>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500">
                    <Download className="mr-2 h-4 w-4" />
                    Download .ino
                  </Button>
                </div>
                <pre className="text-sm text-green-400 font-mono overflow-x-auto p-6 bg-black/50 rounded-2xl">
                  <code>{arduinoCode}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
