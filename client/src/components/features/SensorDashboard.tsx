import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Thermometer, Droplets, Sun, Wind, Activity, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
  light: number;
  pressure: number;
}

export function SensorDashboard() {
  const [data, setData] = useState<SensorData[]>([]);
  const [currentData, setCurrentData] = useState<SensorData>({
    timestamp: new Date().toLocaleTimeString(),
    temperature: 22,
    humidity: 45,
    light: 650,
    pressure: 1013
  });

  useEffect(() => {
    // Simulate real-time sensor data
    const interval = setInterval(() => {
      const newData: SensorData = {
        timestamp: new Date().toLocaleTimeString(),
        temperature: 20 + Math.random() * 10,
        humidity: 40 + Math.random() * 20,
        light: 500 + Math.random() * 500,
        pressure: 1010 + Math.random() * 10
      };

      setCurrentData(newData);
      setData(prev => [...prev.slice(-19), newData]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const sensors = [
    {
      id: "temp",
      name: "Temperature",
      value: currentData.temperature.toFixed(1),
      unit: "°C",
      icon: Thermometer,
      color: "from-red-500 to-orange-500",
      bgColor: "from-red-50 to-orange-50",
      status: currentData.temperature > 25 ? "High" : "Normal"
    },
    {
      id: "humidity",
      name: "Humidity",
      value: currentData.humidity.toFixed(1),
      unit: "%",
      icon: Droplets,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      status: currentData.humidity > 60 ? "High" : "Normal"
    },
    {
      id: "light",
      name: "Light Level",
      value: currentData.light.toFixed(0),
      unit: "lux",
      icon: Sun,
      color: "from-yellow-500 to-amber-500",
      bgColor: "from-yellow-50 to-amber-50",
      status: currentData.light > 800 ? "Bright" : "Normal"
    },
    {
      id: "pressure",
      name: "Air Pressure",
      value: currentData.pressure.toFixed(1),
      unit: "hPa",
      icon: Wind,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
      status: "Stable"
    }
  ];

  return (
    <section className="py-32 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 backdrop-blur-xl mb-6"
          >
            <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
            <span className="text-sm font-bold text-blue-600 tracking-wider uppercase">Live IoT Data</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Sensor Dashboard
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Real-time environmental monitoring system
          </motion.p>
        </div>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {sensors.map((sensor, index) => {
            const Icon = sensor.icon;
            return (
              <motion.div
                key={sensor.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className={`absolute -inset-1 bg-gradient-to-r ${sensor.color} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity`} />
                <div className={`relative bg-gradient-to-br ${sensor.bgColor} rounded-2xl p-6 border-2 border-white shadow-xl`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${sensor.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/50 text-xs font-bold text-gray-700">
                      {sensor.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-600 mb-2">{sensor.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-gray-900">{sensor.value}</span>
                    <span className="text-lg font-bold text-gray-500">{sensor.unit}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>Live</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Temperature Chart */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Temperature Trend</h3>
                <p className="text-sm text-gray-500">Last 40 seconds</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                <YAxis domain={[18, 32]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid #f97316',
                    borderRadius: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="url(#tempGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Humidity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Humidity Trend</h3>
                <p className="text-sm text-gray-500">Last 40 seconds</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                <YAxis domain={[30, 70]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid #06b6d4',
                    borderRadius: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="url(#humidityGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <defs>
                  <linearGradient id="humidityGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-100"
        >
          <div className="flex items-center gap-4">
            <Activity className="w-6 h-6 text-blue-600 animate-pulse" />
            <div>
              <p className="text-sm font-bold text-gray-700">System Status: <span className="text-green-600">Online</span></p>
              <p className="text-xs text-gray-500">Last Update: {currentData.timestamp} • Updates every 2 seconds</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
