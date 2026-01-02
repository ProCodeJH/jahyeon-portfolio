/**
 * Core types for the circuit simulation engine
 */

// Physical units (all in SI base or standard units)
export type Voltage = number; // Volts
export type Current = number; // Amperes
export type Resistance = number; // Ohms
export type Capacitance = number; // Farads
export type Frequency = number; // Hertz
export type Time = number; // Seconds

// Pin state
export enum PinState {
  LOW = 0,
  HIGH = 1,
  HIGH_Z = 2, // High impedance (floating)
  PULL_UP = 3,
  PULL_DOWN = 4,
}

// Pin mode
export enum PinMode {
  INPUT = 0,
  OUTPUT = 1,
  INPUT_PULLUP = 2,
  PWM = 3,
  ANALOG = 4,
}

// PWM state
export interface PWMState {
  enabled: boolean;
  dutyCycle: number; // 0-255
  frequency: Frequency;
}

// Digital signal edge
export enum SignalEdge {
  NONE = 0,
  RISING = 1,
  FALLING = 2,
}

// Net node representing an electrical connection point
export interface NetNode {
  id: string;
  voltage: Voltage;
  isGround: boolean;
  isPower: boolean;
  powerVoltage?: Voltage;
}

// Component pin
export interface ComponentPin {
  id: string;
  name: string;
  componentId: string;
  netId: string | null;
  mode: PinMode;
  state: PinState;
  voltage: Voltage;
  current: Current;
  pwm?: PWMState;
}

// Wire connection
export interface Wire {
  id: string;
  startPinId: string;
  endPinId: string;
  netId: string;
  color: string;
  points: Vector3D[];
}

// 3D position
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

// 2D position for grid layout
export interface Vector2D {
  x: number;
  y: number;
}

// Component position in 3D space
export interface ComponentTransform {
  position: Vector3D;
  rotation: Vector3D;
  scale: Vector3D;
}

// Base component interface
export interface Component {
  id: string;
  type: ComponentType;
  name: string;
  transform: ComponentTransform;
  pins: ComponentPin[];
  properties: Record<string, unknown>;
}

// Component types
export enum ComponentType {
  ARDUINO_UNO = 'arduino_uno',
  BREADBOARD = 'breadboard',
  LED = 'led',
  RESISTOR = 'resistor',
  BUTTON = 'button',
  POTENTIOMETER = 'potentiometer',
  CAPACITOR = 'capacitor',
  PHOTORESISTOR = 'photoresistor',
  PIR_SENSOR = 'pir_sensor',
  SERVO = 'servo',
  DC_MOTOR = 'dc_motor',
  BUZZER = 'buzzer',
  LCD_16X2 = 'lcd_16x2',
  SEVEN_SEGMENT = 'seven_segment',
  RGB_LED = 'rgb_led',
  WIRE = 'wire',
}

// Simulation event types
export enum SimEventType {
  PIN_CHANGE = 'pin_change',
  VOLTAGE_CHANGE = 'voltage_change',
  CURRENT_CHANGE = 'current_change',
  PWM_UPDATE = 'pwm_update',
  SERIAL_TX = 'serial_tx',
  SERIAL_RX = 'serial_rx',
  INTERRUPT = 'interrupt',
  TIMER_TICK = 'timer_tick',
  ADC_SAMPLE = 'adc_sample',
}

// Simulation event
export interface SimEvent {
  type: SimEventType;
  timestamp: Time;
  source: string;
  target?: string;
  data: unknown;
}

// Simulation state
export interface SimulationState {
  running: boolean;
  paused: boolean;
  time: Time;
  speed: number; // 1.0 = real-time
  components: Map<string, Component>;
  nets: Map<string, NetNode>;
  wires: Map<string, Wire>;
  eventQueue: SimEvent[];
}

// Arduino-specific types
export interface ArduinoState {
  pins: ArduinoPin[];
  serialBuffer: Uint8Array;
  serialBaudRate: number;
  analogReference: Voltage;
  clockFrequency: Frequency;
  programCounter: number;
  registers: Uint8Array;
  sram: Uint8Array;
  eeprom: Uint8Array;
  flash: Uint8Array;
}

export interface ArduinoPin {
  number: number;
  name: string;
  type: 'digital' | 'analog' | 'pwm' | 'power' | 'ground' | 'special';
  mode: PinMode;
  state: PinState;
  voltage: Voltage;
  pwm?: PWMState;
  analogValue?: number; // 0-1023 for ADC
  interruptEnabled?: boolean;
  interruptMode?: 'low' | 'change' | 'rising' | 'falling';
}

// Breadboard-specific types
export interface BreadboardHole {
  row: number;
  col: number;
  netId: string;
  occupied: boolean;
  occupiedBy?: string;
}

export interface BreadboardRail {
  type: 'power' | 'ground';
  side: 'top' | 'bottom';
  netId: string;
  holes: BreadboardHole[];
}

export interface BreadboardState {
  rows: number;
  cols: number;
  holes: Map<string, BreadboardHole>;
  rails: BreadboardRail[];
}

// Compile result
export interface CompileResult {
  success: boolean;
  hexData?: Uint8Array;
  elfData?: Uint8Array;
  errors?: CompileError[];
  warnings?: CompileWarning[];
  programSize?: number;
  dataSize?: number;
}

export interface CompileError {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
}

export interface CompileWarning {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
}

// Serial monitor
export interface SerialMessage {
  timestamp: Time;
  direction: 'tx' | 'rx';
  data: string;
  encoding: 'ascii' | 'hex' | 'binary';
}

// Project file format
export interface CircuitProject {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  components: Component[];
  wires: Wire[];
  code: string;
  settings: ProjectSettings;
}

export interface ProjectSettings {
  gridSnap: boolean;
  gridSize: number;
  showLabels: boolean;
  showPinNumbers: boolean;
  showCurrentFlow: boolean;
  simulationSpeed: number;
  theme: 'light' | 'dark';
}
