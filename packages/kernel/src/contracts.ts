/**
 * Core Type Contracts for Circuit Simulator
 * These interfaces define the boundaries between all modules
 *
 * @module @circuit-sim/kernel/contracts
 */

// ============================================================================
// PRIMITIVES
// ============================================================================

export type ComponentId = string;
export type PinId = string;
export type NetId = string;
export type WireId = string;

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Rotation3D {
  x: number; // radians
  y: number;
  z: number;
}

// ============================================================================
// PIN & NET
// ============================================================================

export enum PinType {
  DIGITAL = 'digital',
  ANALOG = 'analog',
  POWER = 'power',
  GROUND = 'ground',
}

export enum DigitalState {
  LOW = 0,
  HIGH = 1,
  Z = 2,        // High impedance (floating)
  CONFLICT = 3,  // Multiple drivers
}

export interface PinDef {
  id: PinId;
  name: string;
  type: PinType;
  position: Position3D; // Relative to component
}

export interface PinRef {
  component: ComponentId;
  pin: PinId;
}

export interface PinState {
  digital: DigitalState;
  voltage: number;  // Volts (0-5V typically)
  current: number;  // Amps (for power analysis)
  pwm?: {
    enabled: boolean;
    duty: number; // 0-1
    frequency: number; // Hz
  };
}

export interface Net {
  id: NetId;
  pins: PinRef[];
  state: PinState;
}

// ============================================================================
// COMPONENT
// ============================================================================

export interface ComponentDef {
  type: string;
  name: string;
  category: 'controller' | 'basic' | 'input' | 'output' | 'sensor';
  description: string;

  pins: PinDef[];
  properties: PropertyDef[];

  // 3D model loader (lazy)
  model?: () => Promise<any>; // GLTF

  // Simulation behavior hook
  simulate?: (ctx: SimContext) => void | Promise<void>;
}

export interface ComponentInstance {
  id: ComponentId;
  type: string;
  position: Position3D;
  rotation: Rotation3D;
  properties: Record<string, any>;
  state: Record<string, any>; // Simulation state
}

export interface PropertyDef {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'enum';
  default: any;
  enum?: string[]; // For enum type
  min?: number;    // For number type
  max?: number;
}

// ============================================================================
// WIRE
// ============================================================================

export interface Wire {
  id: WireId;
  from: PinRef;
  to: PinRef;
  points: Position3D[]; // Bezier control points
  color?: string;
}

export interface WireState {
  flow: 'off' | 'glow' | 'pulse' | 'pwm' | 'power';
  voltage: number;
  current: number;
}

// ============================================================================
// CIRCUIT
// ============================================================================

export interface CircuitDef {
  components: ComponentInstance[];
  wires: Wire[];
  metadata: {
    name: string;
    version: string;
    created: string;
    modified: string;
  };
}

// ============================================================================
// SIMULATION
// ============================================================================

export interface SimContext {
  // Pin API
  getPin(pinId: PinId): PinState;
  setPin(pinId: PinId, state: Partial<PinState>): void;

  // Net API
  getNet(pinRef: PinRef): Net;

  // State API
  getState(key: string): any;
  setState(updates: Record<string, any>): void;

  // Time API
  currentTime_us(): number;
  scheduleEvent(delay_us: number, callback: () => void): void;
}

export interface SimEvent {
  time_us: number;
  type: 'EDGE' | 'TIMER' | 'ANALOG' | 'MCU' | 'SERIAL';
  target: ComponentId | 'global';
  data: any;
}

export interface SimSnapshot {
  timestamp_us: number;
  components: Map<ComponentId, Record<string, any>>; // Component states
  nets: Map<NetId, PinState>;
  serial: SerialOutput[];
}

export interface SerialOutput {
  timestamp_us: number;
  port: string; // 'Serial', 'Serial1', etc.
  text: string;
}

// ============================================================================
// ARDUINO RUNTIME
// ============================================================================

export enum PinMode {
  INPUT = 0,
  OUTPUT = 1,
  INPUT_PULLUP = 2,
}

export interface ArduinoAPI {
  // Pin functions
  pinMode(pin: number, mode: PinMode): void;
  digitalWrite(pin: number, value: 0 | 1): void;
  digitalRead(pin: number): 0 | 1;
  analogRead(pin: number): number; // 0-1023
  analogWrite(pin: number, value: number): void; // PWM 0-255

  // Time functions
  delay(ms: number): Promise<void>;
  delayMicroseconds(us: number): Promise<void>;
  millis(): number;
  micros(): number;

  // Serial (simplified)
  Serial: {
    begin(baud: number): void;
    print(data: any): void;
    println(data: any): void;
    available(): number;
    read(): number;
  };

  // Advanced (optional)
  attachInterrupt(pin: number, callback: () => void, mode: 'LOW' | 'CHANGE' | 'RISING' | 'FALLING'): void;
  detachInterrupt(pin: number): void;
}

export interface McuState {
  pinModes: Map<number, PinMode>;
  pinValues: Map<number, number>;
  interrupts: Map<number, { callback: () => void; mode: string }>;
  startTime_us: number;
}

// ============================================================================
// MESSAGES (UI ↔ Worker)
// ============================================================================

export type WorkerCommand =
  | { type: 'INIT'; circuit: CircuitDef }
  | { type: 'LOAD_CODE'; code: string }
  | { type: 'RUN' }
  | { type: 'PAUSE' }
  | { type: 'STEP'; micros: number }
  | { type: 'RESET' }
  | { type: 'SET_PIN'; pin: PinRef; value: number }
  | { type: 'ADD_WIRE'; wire: Wire }
  | { type: 'REMOVE_WIRE'; wireId: WireId };

export type WorkerEvent =
  | { type: 'READY' }
  | { type: 'STATE'; snapshot: SimSnapshot }
  | { type: 'PIN_CHANGE'; pin: PinRef; state: PinState }
  | { type: 'SERIAL'; output: SerialOutput }
  | { type: 'ERROR'; message: string; stack?: string }
  | { type: 'PERFORMANCE'; fps: number; memory_mb: number };

// ============================================================================
// RENDER BRIDGE
// ============================================================================

export interface RenderBridge {
  // Send command to worker
  send(command: WorkerCommand): void;

  // Subscribe to events from worker
  on(event: WorkerEvent['type'], callback: (data: any) => void): () => void;

  // Get latest snapshot (cached)
  getSnapshot(): SimSnapshot | null;
}

// ============================================================================
// CONNECTIVITY GRAPH
// ============================================================================

export interface ConnectivityGraph {
  // Wire operations
  addWire(wire: Wire): Net;
  removeWire(wireId: WireId): Net[];
  getWire(wireId: WireId): Wire | null;

  // Net operations
  getNet(pinRef: PinRef): Net;
  getAllNets(): Net[];

  // Net resolution (Union-Find)
  find(pinRef: PinRef): NetId;
  union(pin1: PinRef, pin2: PinRef): void;

  // State propagation
  setPinState(pinRef: PinRef, state: Partial<PinState>): void;
  getPinState(pinRef: PinRef): PinState;
}

// ============================================================================
// LOGIC ANALYZER
// ============================================================================

export interface AnalogChannel {
  id: string;
  pin: PinRef;
  name: string;
  color: string;
}

export interface Trigger {
  type: 'EDGE' | 'LEVEL' | 'PATTERN';
  channel: string;
  condition: {
    edge?: 'RISING' | 'FALLING' | 'BOTH';
    level?: 'HIGH' | 'LOW';
    pattern?: number[]; // Bit pattern
  };
}

export interface Sample {
  time_us: number;
  values: number[]; // One per channel
}

export interface LogicAnalyzer {
  // Configuration
  addChannel(channel: AnalogChannel): void;
  removeChannel(channelId: string): void;
  setTrigger(trigger: Trigger): void;

  // Capture
  start(): void;
  stop(): void;
  clear(): void;

  // Data access
  getSamples(start_us: number, end_us: number): Sample[];
  exportVCD(): string; // Value Change Dump
  exportCSV(): string;
}

// ============================================================================
// PROJECT FILE
// ============================================================================

export interface ProjectFile {
  version: string;
  circuit: CircuitDef;
  code: {
    language: 'arduino' | 'cpp';
    source: string;
  };
  settings: {
    simulationSpeed: number; // Real-time multiplier
    logicAnalyzer?: {
      channels: AnalogChannel[];
      trigger: Trigger;
    };
  };
}

// ============================================================================
// UNDO/REDO
// ============================================================================

export interface Command {
  execute(): void;
  undo(): void;
  redo?(): void; // Optional, defaults to execute
}

export interface CommandHistory {
  execute(command: Command): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  clear(): void;
}

// ============================================================================
// PERFORMANCE
// ============================================================================

export interface PerformanceMetrics {
  fps: number;
  frameTime_ms: number;
  simRate_mhz: number; // Virtual MHz (how fast sim runs)
  memory_mb: number;
  wireCount: number;
  componentCount: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const CONSTANTS = {
  // Timing
  ANALOG_STEP_US: 100,        // 100µs per analog step (10kHz)
  MCU_CLOCK_MHZ: 16,          // Arduino UNO clock
  SERIAL_BAUD_DEFAULT: 9600,

  // Voltages
  VCC: 5.0,                   // Supply voltage
  VIH: 3.0,                   // Input HIGH threshold
  VIL: 1.5,                   // Input LOW threshold

  // Performance
  TARGET_FPS: 60,
  MAX_COMPONENTS: 500,
  MAX_WIRES: 1000,

  // File
  PROJECT_VERSION: '1.0',
} as const;
