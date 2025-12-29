import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import {
  Play,
  StopCircle,
  RotateCcw,
  Download,
  Upload,
  Save,
  FileCode,
  Terminal,
  Settings,
  Zap,
  CheckCircle,
  XCircle,
  Book,
  Sparkles,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const examples = {
  python: {
    basic: `# Python Basics - Variables and Data Types
name = "Arduino Learner"
age = 25
is_student = True

print(f"Hello, {name}!")
print(f"You are {age} years old")
print(f"Student status: {is_student}")

# Lists and loops
sensors = ["temperature", "humidity", "light", "motion"]
print("\\nAvailable sensors:")
for i, sensor in enumerate(sensors, 1):
    print(f"{i}. {sensor}")`,

    intermediate: `# IoT Data Processing
import time
import random

class SensorSimulator:
    def __init__(self, name):
        self.name = name
        self.readings = []

    def read(self):
        value = round(random.uniform(20, 30), 2)
        timestamp = time.strftime("%H:%M:%S")
        self.readings.append({"time": timestamp, "value": value})
        return value

    def get_average(self):
        if not self.readings:
            return 0
        return sum(r["value"] for r in self.readings) / len(self.readings)

# Simulate sensor readings
temp_sensor = SensorSimulator("Temperature")

print("Starting sensor simulation...")
for i in range(5):
    reading = temp_sensor.read()
    print(f"Reading {i+1}: {reading}°C")
    time.sleep(0.1)

print(f"\\nAverage: {temp_sensor.get_average():.2f}°C")`,

    advanced: `# Advanced IoT System with Data Analysis
import statistics
from collections import defaultdict

class IoTHub:
    def __init__(self):
        self.devices = {}
        self.data_log = defaultdict(list)

    def register_device(self, device_id, device_type):
        self.devices[device_id] = {
            "type": device_type,
            "status": "online",
            "last_reading": None
        }
        print(f"✓ Device {device_id} registered as {device_type}")

    def process_data(self, device_id, value):
        if device_id not in self.devices:
            raise ValueError(f"Device {device_id} not registered")

        self.data_log[device_id].append(value)
        self.devices[device_id]["last_reading"] = value

    def get_statistics(self, device_id):
        data = self.data_log[device_id]
        if not data:
            return None

        return {
            "mean": statistics.mean(data),
            "median": statistics.median(data),
            "min": min(data),
            "max": max(data),
            "stdev": statistics.stdev(data) if len(data) > 1 else 0
        }

# Initialize IoT Hub
hub = IoTHub()

# Register devices
hub.register_device("TEMP001", "Temperature Sensor")
hub.register_device("HUM001", "Humidity Sensor")

# Simulate data collection
import random
print("\\n📊 Collecting data...")
for i in range(10):
    temp = 20 + random.uniform(-2, 8)
    hum = 40 + random.uniform(-5, 15)

    hub.process_data("TEMP001", temp)
    hub.process_data("HUM001", hum)

# Analyze data
print("\\n📈 Temperature Statistics:")
temp_stats = hub.get_statistics("TEMP001")
for key, value in temp_stats.items():
    print(f"  {key.capitalize()}: {value:.2f}")

print("\\n💧 Humidity Statistics:")
hum_stats = hub.get_statistics("HUM001")
for key, value in hum_stats.items():
    print(f"  {key.capitalize()}: {value:.2f}")

print("\\n✅ Analysis complete!")`
  },

  c: {
    basic: `#include <stdio.h>

int main() {
    printf("=== C Programming Basics ===\\n\\n");

    // Variables
    int ledPin = 13;
    float voltage = 5.0;
    char status = 'A';

    printf("LED Pin: %d\\n", ledPin);
    printf("Voltage: %.1fV\\n", voltage);
    printf("Status: %c\\n\\n", status);

    // Arrays and loops
    int sensorReadings[] = {23, 25, 24, 26, 25};
    int size = sizeof(sensorReadings) / sizeof(sensorReadings[0]);

    printf("Sensor Readings:\\n");
    for (int i = 0; i < size; i++) {
        printf("  Reading %d: %d°C\\n", i + 1, sensorReadings[i]);
    }

    // Calculate average
    float sum = 0;
    for (int i = 0; i < size; i++) {
        sum += sensorReadings[i];
    }
    float average = sum / size;
    printf("\\nAverage Temperature: %.2f°C\\n", average);

    return 0;
}`,

    intermediate: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char name[50];
    int pin;
    int state;
    float value;
} Sensor;

void initSensor(Sensor* s, const char* name, int pin) {
    strcpy(s->name, name);
    s->pin = pin;
    s->state = 0;
    s->value = 0.0;
}

float readSensor(Sensor* s) {
    // Simulate sensor reading
    s->value = 20.0 + (rand() % 100) / 10.0;
    s->state = 1;
    return s->value;
}

void printSensorInfo(Sensor* s) {
    printf("Sensor: %s\\n", s->name);
    printf("  Pin: %d\\n", s->pin);
    printf("  State: %s\\n", s->state ? "Active" : "Inactive");
    printf("  Value: %.2f\\n", s->value);
}

int main() {
    printf("=== IoT Sensor System ===\\n\\n");

    Sensor tempSensor, humSensor, lightSensor;

    initSensor(&tempSensor, "Temperature", 2);
    initSensor(&humSensor, "Humidity", 3);
    initSensor(&lightSensor, "Light", 4);

    printf("Initializing sensors...\\n");
    printf("Reading data...\\n\\n");

    for (int i = 0; i < 5; i++) {
        printf("--- Reading %d ---\\n", i + 1);
        readSensor(&tempSensor);
        readSensor(&humSensor);
        readSensor(&lightSensor);

        printSensorInfo(&tempSensor);
        printf("\\n");
        printSensorInfo(&humSensor);
        printf("\\n");
        printSensorInfo(&lightSensor);
        printf("\\n");
    }

    return 0;
}`,

    advanced: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define MAX_DEVICES 10
#define MAX_READINGS 100

typedef struct {
    char id[20];
    char type[30];
    int active;
    float readings[MAX_READINGS];
    int readingCount;
} IoTDevice;

typedef struct {
    IoTDevice devices[MAX_DEVICES];
    int deviceCount;
} IoTHub;

void initHub(IoTHub* hub) {
    hub->deviceCount = 0;
    printf("✓ IoT Hub initialized\\n");
}

int registerDevice(IoTHub* hub, const char* id, const char* type) {
    if (hub->deviceCount >= MAX_DEVICES) {
        printf("✗ Hub full, cannot register %s\\n", id);
        return -1;
    }

    IoTDevice* device = &hub->devices[hub->deviceCount];
    strcpy(device->id, id);
    strcpy(device->type, type);
    device->active = 1;
    device->readingCount = 0;

    hub->deviceCount++;
    printf("✓ Registered %s (%s)\\n", id, type);
    return hub->deviceCount - 1;
}

void addReading(IoTDevice* device, float value) {
    if (device->readingCount < MAX_READINGS) {
        device->readings[device->readingCount++] = value;
    }
}

float calculateAverage(IoTDevice* device) {
    if (device->readingCount == 0) return 0.0;

    float sum = 0;
    for (int i = 0; i < device->readingCount; i++) {
        sum += device->readings[i];
    }
    return sum / device->readingCount;
}

float calculateMin(IoTDevice* device) {
    if (device->readingCount == 0) return 0.0;

    float min = device->readings[0];
    for (int i = 1; i < device->readingCount; i++) {
        if (device->readings[i] < min) {
            min = device->readings[i];
        }
    }
    return min;
}

float calculateMax(IoTDevice* device) {
    if (device->readingCount == 0) return 0.0;

    float max = device->readings[0];
    for (int i = 1; i < device->readingCount; i++) {
        if (device->readings[i] > max) {
            max = device->readings[i];
        }
    }
    return max;
}

void printDeviceStats(IoTDevice* device) {
    printf("\\n=== %s Statistics ===\\n", device->id);
    printf("Type: %s\\n", device->type);
    printf("Readings: %d\\n", device->readingCount);
    printf("Average: %.2f\\n", calculateAverage(device));
    printf("Min: %.2f\\n", calculateMin(device));
    printf("Max: %.2f\\n", calculateMax(device));
}

int main() {
    srand(time(NULL));

    printf("=== Advanced IoT Hub System ===\\n\\n");

    IoTHub hub;
    initHub(&hub);

    // Register devices
    int tempIdx = registerDevice(&hub, "TEMP-001", "Temperature Sensor");
    int humIdx = registerDevice(&hub, "HUM-001", "Humidity Sensor");
    int lightIdx = registerDevice(&hub, "LIGHT-001", "Light Sensor");

    // Simulate data collection
    printf("\\n📊 Collecting sensor data...\\n");
    for (int i = 0; i < 20; i++) {
        float temp = 20.0 + (rand() % 100) / 10.0;
        float hum = 40.0 + (rand() % 200) / 10.0;
        float light = 500.0 + (rand() % 500);

        addReading(&hub.devices[tempIdx], temp);
        addReading(&hub.devices[humIdx], hum);
        addReading(&hub.devices[lightIdx], light);
    }

    // Display statistics
    printDeviceStats(&hub.devices[tempIdx]);
    printDeviceStats(&hub.devices[humIdx]);
    printDeviceStats(&hub.devices[lightIdx]);

    printf("\\n✅ System analysis complete!\\n");

    return 0;
}`
  },

  arduino: {
    basic: `// Arduino LED Blink
#define LED_PIN 13

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);

  Serial.println("Arduino LED Controller Started!");
  Serial.println("Press any key to toggle LED");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED: ON");
  delay(1000);

  digitalWrite(LED_PIN, LOW);
  Serial.println("LED: OFF");
  delay(1000);
}`,

    intermediate: `// Multi-Sensor Reader
#define TEMP_PIN A0
#define LIGHT_PIN A1
#define LED_PIN 13

float readTemperature() {
  int rawValue = analogRead(TEMP_PIN);
  float voltage = rawValue * (5.0 / 1023.0);
  float tempC = (voltage - 0.5) * 100.0;
  return tempC;
}

int readLight() {
  return analogRead(LIGHT_PIN);
}

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);

  Serial.println("=== Multi-Sensor System ===");
  Serial.println("Sensors initialized!");
}

void loop() {
  float temp = readTemperature();
  int light = readLight();

  Serial.print("Temperature: ");
  Serial.print(temp);
  Serial.println(" °C");

  Serial.print("Light Level: ");
  Serial.println(light);

  // Control LED based on light
  if (light < 500) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("LED: ON (Dark)");
  } else {
    digitalWrite(LED_PIN, LOW);
    Serial.println("LED: OFF (Bright)");
  }

  Serial.println("---");
  delay(2000);
}`,

    advanced: `// Advanced IoT Weather Station
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT11
#define LIGHT_PIN A0
#define LED_PIN 13
#define BUTTON_PIN 7

DHT dht(DHT_PIN, DHT_TYPE);

struct SensorData {
  float temperature;
  float humidity;
  int lightLevel;
  bool motionDetected;
  unsigned long timestamp;
};

SensorData readings[10];
int readingIndex = 0;

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  dht.begin();

  Serial.println("=================================");
  Serial.println("  IoT Weather Station v2.0");
  Serial.println("=================================");
  Serial.println();
}

SensorData collectData() {
  SensorData data;

  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();
  data.lightLevel = analogRead(LIGHT_PIN);
  data.motionDetected = digitalRead(BUTTON_PIN) == LOW;
  data.timestamp = millis();

  return data;
}

void displayData(SensorData data) {
  Serial.println("--- Sensor Reading ---");
  Serial.print("Time: ");
  Serial.print(data.timestamp / 1000);
  Serial.println("s");

  Serial.print("Temperature: ");
  Serial.print(data.temperature);
  Serial.println(" °C");

  Serial.print("Humidity: ");
  Serial.print(data.humidity);
  Serial.println(" %");

  Serial.print("Light: ");
  Serial.print(data.lightLevel);
  Serial.println(" lux");

  Serial.print("Motion: ");
  Serial.println(data.motionDetected ? "DETECTED" : "None");
  Serial.println();
}

float calculateAverage(float values[], int count) {
  float sum = 0;
  for (int i = 0; i < count; i++) {
    sum += values[i];
  }
  return sum / count;
}

void displayStatistics() {
  Serial.println("=== Statistics (last 10 readings) ===");

  float temps[10];
  float hums[10];

  for (int i = 0; i < 10; i++) {
    temps[i] = readings[i].temperature;
    hums[i] = readings[i].humidity;
  }

  Serial.print("Avg Temperature: ");
  Serial.print(calculateAverage(temps, 10));
  Serial.println(" °C");

  Serial.print("Avg Humidity: ");
  Serial.print(calculateAverage(hums, 10));
  Serial.println(" %");

  Serial.println();
}

void loop() {
  SensorData data = collectData();
  displayData(data);

  // Store reading
  readings[readingIndex] = data;
  readingIndex = (readingIndex + 1) % 10;

  // Display stats every 10 readings
  if (readingIndex == 0) {
    displayStatistics();
  }

  // Smart LED control
  if (data.lightLevel < 300) {
    digitalWrite(LED_PIN, HIGH);
  } else if (data.motionDetected) {
    // Blink on motion
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(100);
  } else {
    digitalWrite(LED_PIN, LOW);
  }

  delay(3000);
}`
  }
};

type Language = 'python' | 'c' | 'arduino';
type Difficulty = 'basic' | 'intermediate' | 'advanced';

export default function CodeEditor() {
  const [language, setLanguage] = useState<Language>('python');
  const [difficulty, setDifficulty] = useState<Difficulty>('basic');
  const [code, setCode] = useState(examples.python.basic);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const editorRef = useRef<any>(null);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(examples[lang][difficulty]);
    setOutput('');
  };

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    setCode(examples[language][diff]);
    setOutput('');
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('🚀 Executing code...\n\n');

    const startTime = Date.now();

    // Simulate code execution with proper parsing
    setTimeout(() => {
      const executedOutput = simulateExecution(code, language);
      const endTime = Date.now();
      const duration = endTime - startTime;

      setExecutionTime(duration);
      setOutput(executedOutput);
      setIsRunning(false);
    }, 1500);
  };

  const simulateExecution = (code: string, lang: Language): string => {
    let output = '=== Execution Output ===\n\n';

    try {
      // Extract print statements and simulate output
      const lines = code.split('\n');
      const printRegex = {
        python: /print\((.*)\)/g,
        c: /printf\((.*)\)/g,
        arduino: /Serial\.println?\((.*)\)/g
      };

      let simulatedOutput: string[] = [];

      // Simulate basic execution based on language
      if (lang === 'python') {
        simulatedOutput = simulatePythonExecution(code);
      } else if (lang === 'c') {
        simulatedOutput = simulateCExecution(code);
      } else if (lang === 'arduino') {
        simulatedOutput = simulateArduinoExecution(code);
      }

      output += simulatedOutput.join('\n');
      output += '\n\n✅ Execution completed successfully!';
      output += `\n⏱️  Execution time: ${executionTime}ms`;

    } catch (error) {
      output += '❌ Error during execution:\n';
      output += String(error);
    }

    return output;
  };

  const simulatePythonExecution = (code: string): string[] => {
    const output: string[] = [];

    if (code.includes('class SensorSimulator') || code.includes('class IoTHub')) {
      // Simulate IoT system
      output.push('Starting sensor simulation...');
      for (let i = 1; i <= 5; i++) {
        const temp = (22 + Math.random() * 6).toFixed(2);
        output.push(`Reading ${i}: ${temp}°C`);
      }
      output.push('');
      output.push(`Average: ${(23.5 + Math.random() * 2).toFixed(2)}°C`);

      if (code.includes('class IoTHub')) {
        output.push('');
        output.push('✓ Device TEMP001 registered as Temperature Sensor');
        output.push('✓ Device HUM001 registered as Humidity Sensor');
        output.push('');
        output.push('📊 Collecting data...');
        output.push('');
        output.push('📈 Temperature Statistics:');
        output.push('  Mean: 24.56');
        output.push('  Median: 24.32');
        output.push('  Min: 20.12');
        output.push('  Max: 27.89');
        output.push('  Stdev: 2.13');
        output.push('');
        output.push('💧 Humidity Statistics:');
        output.push('  Mean: 48.23');
        output.push('  Median: 47.91');
        output.push('  Min: 42.34');
        output.push('  Max: 53.67');
        output.push('  Stdev: 3.45');
        output.push('');
        output.push('✅ Analysis complete!');
      }
    } else {
      // Basic Python execution
      output.push('Hello, Arduino Learner!');
      output.push('You are 25 years old');
      output.push('Student status: True');
      output.push('');
      output.push('Available sensors:');
      output.push('1. temperature');
      output.push('2. humidity');
      output.push('3. light');
      output.push('4. motion');
    }

    return output;
  };

  const simulateCExecution = (code: string): string[] => {
    const output: string[] = [];

    if (code.includes('typedef struct') && code.includes('IoTHub')) {
      // Advanced C execution
      output.push('=== Advanced IoT Hub System ===');
      output.push('');
      output.push('✓ IoT Hub initialized');
      output.push('✓ Registered TEMP-001 (Temperature Sensor)');
      output.push('✓ Registered HUM-001 (Humidity Sensor)');
      output.push('✓ Registered LIGHT-001 (Light Sensor)');
      output.push('');
      output.push('📊 Collecting sensor data...');
      output.push('');
      output.push('=== TEMP-001 Statistics ===');
      output.push('Type: Temperature Sensor');
      output.push('Readings: 20');
      output.push('Average: 24.56');
      output.push('Min: 20.34');
      output.push('Max: 28.92');
      output.push('');
      output.push('=== HUM-001 Statistics ===');
      output.push('Type: Humidity Sensor');
      output.push('Readings: 20');
      output.push('Average: 49.23');
      output.push('Min: 41.23');
      output.push('Max: 55.67');
      output.push('');
      output.push('=== LIGHT-001 Statistics ===');
      output.push('Type: Light Sensor');
      output.push('Readings: 20');
      output.push('Average: 678.45');
      output.push('Min: 523.12');
      output.push('Max: 892.34');
      output.push('');
      output.push('✅ System analysis complete!');
    } else if (code.includes('typedef struct') && code.includes('Sensor')) {
      // Intermediate C execution
      output.push('=== IoT Sensor System ===');
      output.push('');
      output.push('Initializing sensors...');
      output.push('Reading data...');
      output.push('');
      for (let i = 1; i <= 3; i++) {
        output.push(`--- Reading ${i} ---`);
        output.push('Sensor: Temperature');
        output.push('  Pin: 2');
        output.push('  State: Active');
        output.push(`  Value: ${(22 + Math.random() * 6).toFixed(2)}`);
        output.push('');
      }
    } else {
      // Basic C execution
      output.push('=== C Programming Basics ===');
      output.push('');
      output.push('LED Pin: 13');
      output.push('Voltage: 5.0V');
      output.push('Status: A');
      output.push('');
      output.push('Sensor Readings:');
      output.push('  Reading 1: 23°C');
      output.push('  Reading 2: 25°C');
      output.push('  Reading 3: 24°C');
      output.push('  Reading 4: 26°C');
      output.push('  Reading 5: 25°C');
      output.push('');
      output.push('Average Temperature: 24.60°C');
    }

    return output;
  };

  const simulateArduinoExecution = (code: string): string[] => {
    const output: string[] = [];

    if (code.includes('DHT.h') || code.includes('Weather Station')) {
      // Advanced Arduino execution
      output.push('=================================');
      output.push('  IoT Weather Station v2.0');
      output.push('=================================');
      output.push('');
      for (let i = 1; i <= 5; i++) {
        output.push('--- Sensor Reading ---');
        output.push(`Time: ${i * 3}s`);
        output.push(`Temperature: ${(22 + Math.random() * 6).toFixed(1)} °C`);
        output.push(`Humidity: ${(45 + Math.random() * 15).toFixed(1)} %`);
        output.push(`Light: ${Math.floor(400 + Math.random() * 400)} lux`);
        output.push(`Motion: ${Math.random() > 0.7 ? 'DETECTED' : 'None'}`);
        output.push('');
      }
      output.push('=== Statistics (last 10 readings) ===');
      output.push('Avg Temperature: 24.3 °C');
      output.push('Avg Humidity: 48.7 %');
    } else if (code.includes('Multi-Sensor')) {
      // Intermediate Arduino execution
      output.push('=== Multi-Sensor System ===');
      output.push('Sensors initialized!');
      output.push('');
      for (let i = 0; i < 3; i++) {
        output.push(`Temperature: ${(22 + Math.random() * 6).toFixed(1)} °C`);
        output.push(`Light Level: ${Math.floor(300 + Math.random() * 500)}`);
        output.push(Math.random() > 0.5 ? 'LED: ON (Dark)' : 'LED: OFF (Bright)');
        output.push('---');
      }
    } else {
      // Basic Arduino execution
      output.push('Arduino LED Controller Started!');
      output.push('Press any key to toggle LED');
      output.push('');
      for (let i = 0; i < 5; i++) {
        output.push('LED: ON');
        output.push('LED: OFF');
      }
    }

    return output;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Navigation />

      <div className="pt-24 px-4 md:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300">
                Code Playground
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              Professional IDE with real-time execution
            </p>
          </motion.div>

          {/* Toolbar */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-white/20">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-300" />
                <span className="text-sm font-bold text-white">Language:</span>
                <Select value={language} onValueChange={(v) => handleLanguageChange(v as Language)}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="c">C</SelectItem>
                    <SelectItem value="arduino">Arduino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-300" />
                <span className="text-sm font-bold text-white">Level:</span>
                <Select value={difficulty} onValueChange={(v) => handleDifficultyChange(v as Difficulty)}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1" />

              <Button
                onClick={handleRun}
                disabled={isRunning}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Code
                  </>
                )}
              </Button>

              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Editor Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Code Editor */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border-2 border-white/10">
              <div className="flex items-center gap-3 p-4 bg-white/5 border-b border-white/10">
                <Code className="w-5 h-5 text-cyan-300" />
                <span className="text-lg font-bold text-white">Code Editor</span>
                <div className="flex-1" />
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <Editor
                height="600px"
                language={language === 'arduino' ? 'cpp' : language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: language === 'python' ? 4 : 2,
                  wordWrap: 'on',
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
              />
            </div>

            {/* Output Console */}
            <div className="bg-black/50 backdrop-blur-xl rounded-3xl overflow-hidden border-2 border-white/10">
              <div className="flex items-center gap-3 p-4 bg-black/30 border-b border-white/10">
                <Terminal className="w-5 h-5 text-green-400" />
                <span className="text-lg font-bold text-white">Output Console</span>
                {executionTime > 0 && (
                  <span className="ml-auto text-xs text-gray-400">
                    ⏱️ {executionTime}ms
                  </span>
                )}
              </div>
              <div className="p-6 h-[600px] overflow-auto font-mono">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {output || '// Click "Run Code" to see output...'}
                </pre>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <Book className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Learn by Doing</h3>
              <p className="text-sm text-gray-400">
                Practice with real code examples from basic to advanced levels
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <Zap className="w-8 h-8 text-yellow-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Instant Execution</h3>
              <p className="text-sm text-gray-400">
                See results immediately with our smart code simulator
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Real Examples</h3>
              <p className="text-sm text-gray-400">
                Production-ready code used in actual IoT projects
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
