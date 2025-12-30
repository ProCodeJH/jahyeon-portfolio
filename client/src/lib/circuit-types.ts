/**
 * Tinkercad-style Circuit Simulator Types
 * Professional component and circuit types
 */

export type ComponentType =
  | 'arduino-uno'
  | 'led'
  | 'resistor'
  | 'button'
  | 'pir-sensor'
  | 'ultrasonic'
  | 'servo'
  | 'photoresistor'
  | 'potentiometer'
  | 'breadboard'
  | 'lcd'
  | 'dht22';

export type PinType = 'digital' | 'analog' | 'power' | 'ground';

export interface Pin {
  id: string;
  name: string;
  type: PinType;
  number: number;
  x: number;
  y: number;
  connectedTo?: string; // Wire ID
}

export interface Component {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
  pins: Pin[];
  properties: Record<string, any>;
}

export interface Wire {
  id: string;
  fromPinId: string;
  toPinId: string;
  color: string;
  points: { x: number; y: number }[];
}

export interface CircuitState {
  components: Component[];
  wires: Wire[];
  selectedComponentId: string | null;
  isDragging: boolean;
  viewMode: 'simulation' | 'schematic' | 'code';
}

// Component Library Definitions
export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  icon: string;
  category: 'basic' | 'input' | 'output' | 'sensor' | 'controller';
  description: string;
  defaultProperties: Record<string, any>;
  pins: Omit<Pin, 'id' | 'x' | 'y' | 'connectedTo'>[];
  width: number;
  height: number;
}

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  {
    type: 'arduino-uno',
    name: 'Arduino UNO',
    icon: '🎛️',
    category: 'controller',
    description: 'Arduino UNO R3',
    width: 200,
    height: 150,
    defaultProperties: {},
    pins: [
      { name: 'D0', type: 'digital', number: 0 },
      { name: 'D1', type: 'digital', number: 1 },
      { name: 'D2', type: 'digital', number: 2 },
      { name: 'D3', type: 'digital', number: 3 },
      { name: 'D4', type: 'digital', number: 4 },
      { name: 'D5', type: 'digital', number: 5 },
      { name: 'D6', type: 'digital', number: 6 },
      { name: 'D7', type: 'digital', number: 7 },
      { name: 'D8', type: 'digital', number: 8 },
      { name: 'D9', type: 'digital', number: 9 },
      { name: 'D10', type: 'digital', number: 10 },
      { name: 'D11', type: 'digital', number: 11 },
      { name: 'D12', type: 'digital', number: 12 },
      { name: 'D13', type: 'digital', number: 13 },
      { name: 'A0', type: 'analog', number: 14 },
      { name: 'A1', type: 'analog', number: 15 },
      { name: 'A2', type: 'analog', number: 16 },
      { name: 'A3', type: 'analog', number: 17 },
      { name: 'A4', type: 'analog', number: 18 },
      { name: 'A5', type: 'analog', number: 19 },
      { name: '5V', type: 'power', number: 20 },
      { name: 'GND', type: 'ground', number: 21 },
    ],
  },
  {
    type: 'led',
    name: 'LED',
    icon: '💡',
    category: 'output',
    description: 'Light Emitting Diode',
    width: 30,
    height: 60,
    defaultProperties: { color: 'red' },
    pins: [
      { name: 'Anode', type: 'digital', number: 0 },
      { name: 'Cathode', type: 'ground', number: 1 },
    ],
  },
  {
    type: 'button',
    name: 'Push Button',
    icon: '🔘',
    category: 'input',
    description: 'Momentary Push Button',
    width: 40,
    height: 40,
    defaultProperties: {},
    pins: [
      { name: '1A', type: 'digital', number: 0 },
      { name: '1B', type: 'digital', number: 1 },
      { name: '2A', type: 'digital', number: 2 },
      { name: '2B', type: 'digital', number: 3 },
    ],
  },
  {
    type: 'pir-sensor',
    name: 'PIR Sensor',
    icon: '👁️',
    category: 'sensor',
    description: 'Passive Infrared Motion Sensor',
    width: 60,
    height: 80,
    defaultProperties: {},
    pins: [
      { name: 'VCC', type: 'power', number: 0 },
      { name: 'OUT', type: 'digital', number: 1 },
      { name: 'GND', type: 'ground', number: 2 },
    ],
  },
  {
    type: 'ultrasonic',
    name: 'Ultrasonic Sensor',
    icon: '📡',
    category: 'sensor',
    description: 'HC-SR04 Distance Sensor',
    width: 80,
    height: 60,
    defaultProperties: {},
    pins: [
      { name: 'VCC', type: 'power', number: 0 },
      { name: 'TRIG', type: 'digital', number: 1 },
      { name: 'ECHO', type: 'digital', number: 2 },
      { name: 'GND', type: 'ground', number: 3 },
    ],
  },
  {
    type: 'servo',
    name: 'Servo Motor',
    icon: '⚙️',
    category: 'output',
    description: 'SG90 Micro Servo',
    width: 50,
    height: 70,
    defaultProperties: { angle: 90 },
    pins: [
      { name: 'Signal', type: 'digital', number: 0 },
      { name: 'VCC', type: 'power', number: 1 },
      { name: 'GND', type: 'ground', number: 2 },
    ],
  },
  {
    type: 'photoresistor',
    name: 'Photoresistor',
    icon: '☀️',
    category: 'sensor',
    description: 'Light Dependent Resistor',
    width: 40,
    height: 50,
    defaultProperties: { lightLevel: 500 },
    pins: [
      { name: '1', type: 'analog', number: 0 },
      { name: '2', type: 'analog', number: 1 },
    ],
  },
  {
    type: 'dht22',
    name: 'DHT22',
    icon: '🌡️',
    category: 'sensor',
    description: 'Temperature & Humidity Sensor',
    width: 50,
    height: 70,
    defaultProperties: { temperature: 25, humidity: 60 },
    pins: [
      { name: 'VCC', type: 'power', number: 0 },
      { name: 'DATA', type: 'digital', number: 1 },
      { name: 'NC', type: 'digital', number: 2 },
      { name: 'GND', type: 'ground', number: 3 },
    ],
  },
  {
    type: 'resistor',
    name: 'Resistor',
    icon: '🔩',
    category: 'basic',
    description: '220Ω Resistor',
    width: 60,
    height: 20,
    defaultProperties: { resistance: 220 },
    pins: [
      { name: '1', type: 'digital', number: 0 },
      { name: '2', type: 'digital', number: 1 },
    ],
  },
  {
    type: 'breadboard',
    name: 'Breadboard',
    icon: '📋',
    category: 'basic',
    description: 'Full-size Breadboard',
    width: 400,
    height: 200,
    defaultProperties: {},
    pins: [],
  },
];
