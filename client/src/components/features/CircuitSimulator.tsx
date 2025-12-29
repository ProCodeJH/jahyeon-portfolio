import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Power, Lightbulb, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function CircuitSimulator() {
  const [ledOn, setLedOn] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [blinkSpeed, setBlinkSpeed] = useState(500);
  const [voltage, setVoltage] = useState(5);
  const [current, setCurrent] = useState(20);

  useEffect(() => {
    if (blinking) {
      const interval = setInterval(() => {
        setLedOn((prev) => !prev);
      }, blinkSpeed);
      return () => clearInterval(interval);
    }
  }, [blinking, blinkSpeed]);

  const handlePowerToggle = () => {
    setLedOn(!ledOn);
    setBlinking(false);
  };

  const handleBlinkToggle = () => {
    setBlinking(!blinking);
    if (!blinking) setLedOn(true);
  };

  return (
    <section className="py-32 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-blue-50/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/50 backdrop-blur-xl mb-6"
          >
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-600 tracking-wider uppercase">Interactive Demo</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600">
              Circuit Simulator
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Experience hands-on embedded programming - try controlling an LED!
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Circuit Diagram */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-3xl p-12 shadow-2xl border-2 border-gray-100">
              {/* Arduino Board */}
              <div className="relative">
                <svg viewBox="0 0 400 300" className="w-full">
                  {/* Board */}
                  <rect x="50" y="50" width="300" height="200" rx="10" fill="#0A5F73" stroke="#073B4C" strokeWidth="2" />
                  <text x="200" y="90" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">ARDUINO UNO</text>

                  {/* Pins */}
                  <g id="pins">
                    {[...Array(6)].map((_, i) => (
                      <circle key={i} cx={80 + i * 40} cy={230} r="8" fill="#FFD700" stroke="#DAA520" strokeWidth="2" />
                    ))}
                  </g>

                  {/* LED */}
                  <g id="led">
                    <circle cx="200" cy="150" r="30" fill={ledOn ? "#FF0000" : "#330000"} opacity={ledOn ? 1 : 0.3} />
                    {ledOn && (
                      <>
                        <circle cx="200" cy="150" r="40" fill="#FF0000" opacity="0.3" />
                        <circle cx="200" cy="150" r="50" fill="#FF0000" opacity="0.1" />
                      </>
                    )}
                    <text x="200" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">LED</text>
                  </g>

                  {/* Wires */}
                  <line x1="120" y1="230" x2="120" y2="180" stroke={ledOn ? "#00FF00" : "#666"} strokeWidth="3" />
                  <line x1="120" y1="180" x2="170" y2="150" stroke={ledOn ? "#00FF00" : "#666"} strokeWidth="3" />

                  <line x1="280" y1="230" x2="280" y2="180" stroke="#666" strokeWidth="3" />
                  <line x1="280" y1="180" x2="230" y2="150" stroke="#666" strokeWidth="3" />

                  {/* Power indicator */}
                  {ledOn && (
                    <g>
                      <circle cx="80" cy="70" r="5" fill="#00FF00">
                        <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
                      </circle>
                      <text x="90" y="75" fill="#00FF00" fontSize="10">PWR</text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Status Indicators */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Power className={`w-6 h-6 mx-auto mb-2 ${ledOn ? 'text-green-600' : 'text-gray-400'}`} />
                  <p className="text-sm font-bold text-gray-600">Power</p>
                  <p className={`text-xs ${ledOn ? 'text-green-600' : 'text-gray-400'}`}>{ledOn ? 'ON' : 'OFF'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Lightbulb className={`w-6 h-6 mx-auto mb-2 ${ledOn ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <p className="text-sm font-bold text-gray-600">LED</p>
                  <p className={`text-xs ${ledOn ? 'text-yellow-600' : 'text-gray-400'}`}>{ledOn ? 'BRIGHT' : 'OFF'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Activity className={`w-6 h-6 mx-auto mb-2 ${blinking ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="text-sm font-bold text-gray-600">Mode</p>
                  <p className={`text-xs ${blinking ? 'text-blue-600' : 'text-gray-400'}`}>{blinking ? 'BLINK' : 'STATIC'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Control Panel */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-200 shadow-xl">
              <h3 className="text-2xl font-black text-gray-900 mb-6">Control Panel</h3>

              {/* Power Control */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">Power Control</label>
                <div className="flex gap-4">
                  <Button
                    onClick={handlePowerToggle}
                    className={`flex-1 h-16 rounded-2xl font-bold text-lg ${
                      ledOn && !blinking
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-gray-500 to-gray-600'
                    }`}
                  >
                    <Power className="mr-2 h-5 w-5" />
                    {ledOn && !blinking ? 'Turn OFF' : 'Turn ON'}
                  </Button>
                  <Button
                    onClick={handleBlinkToggle}
                    className={`flex-1 h-16 rounded-2xl font-bold text-lg ${
                      blinking
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                  >
                    <Activity className="mr-2 h-5 w-5" />
                    {blinking ? 'Stop Blink' : 'Start Blink'}
                  </Button>
                </div>
              </div>

              {/* Blink Speed */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Blink Speed: {blinkSpeed}ms
                </label>
                <Slider
                  value={[blinkSpeed]}
                  onValueChange={(value) => setBlinkSpeed(value[0])}
                  min={100}
                  max={2000}
                  step={100}
                  className="w-full"
                  disabled={!blinking}
                />
              </div>

              {/* Voltage Control */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Voltage: {voltage}V
                </label>
                <Slider
                  value={[voltage]}
                  onValueChange={(value) => setVoltage(value[0])}
                  min={0}
                  max={12}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Current Display */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Current: {current}mA
                </label>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
                    style={{ width: `${(current / 30) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Code Example */}
            <div className="bg-gray-900 rounded-2xl p-6 border-2 border-gray-700">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Arduino Code
              </h4>
              <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                <code>{`void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, ${ledOn ? 'HIGH' : 'LOW'});
  ${blinking ? `delay(${blinkSpeed});` : ''}
}`}</code>
              </pre>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
