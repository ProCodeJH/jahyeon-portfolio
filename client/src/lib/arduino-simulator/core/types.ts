/**
 * =====================================================
 * Enterprise Arduino Simulator - Core Type Definitions
 * =====================================================
 *
 * 이 파일은 전체 시스템의 타입 기반을 정의합니다.
 * 모든 모듈이 이 타입을 공유하여 타입 안전성을 보장합니다.
 */

// ============================================
// PIN & GPIO TYPES
// ============================================

export type PinMode = 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP' | 'PWM' | 'ANALOG_INPUT';

export type PinState = 'HIGH' | 'LOW' | 'FLOATING' | 'PWM';

export type PinType = 'DIGITAL' | 'ANALOG' | 'PWM' | 'SERIAL' | 'I2C' | 'SPI';

export interface PinDefinition {
  id: number;
  name: string;
  type: PinType[];
  supportsPWM: boolean;
  supportsInterrupt: boolean;
  analogChannel?: number; // A0-A5 mapping
}

export interface PinRuntimeState {
  pinId: number;
  mode: PinMode;
  digitalState: PinState;
  analogValue: number; // 0-1023 for input, 0-255 for PWM output
  pwmDuty: number; // 0-255
  pwmFrequency: number; // Hz
  lastChangeTime: number; // microseconds
  interruptEnabled: boolean;
  interruptMode?: 'RISING' | 'FALLING' | 'CHANGE' | 'LOW' | 'HIGH';
}

// ============================================
// MCU TYPES
// ============================================

export type MCUType = 'ATmega328P' | 'ATmega2560' | 'ATmega32U4' | 'ESP32' | 'ESP8266' | 'RP2040';

export interface MCUSpec {
  type: MCUType;
  name: string;
  clockSpeed: number; // Hz
  flashSize: number; // bytes
  sramSize: number; // bytes
  eepromSize: number; // bytes
  digitalPins: number;
  analogPins: number;
  pwmPins: number[];
  interruptPins: number[];
  pins: PinDefinition[];
}

// ============================================
// BOARD TYPES
// ============================================

export type BoardType = 'UNO' | 'NANO' | 'MEGA' | 'LEONARDO' | 'ESP32' | 'ESP8266';

export interface BoardSpec {
  type: BoardType;
  name: string;
  mcu: MCUSpec;
  operatingVoltage: number;
  inputVoltageRange: [number, number];
  builtInLED: number; // Pin number
  serialPins: { rx: number; tx: number };
  i2cPins: { sda: number; scl: number };
  spiPins: { mosi: number; miso: number; sck: number; ss: number };
}

// ============================================
// COMPONENT TYPES
// ============================================

export type ComponentCategory =
  | 'OUTPUT'
  | 'INPUT'
  | 'PASSIVE'
  | 'SENSOR'
  | 'COMMUNICATION'
  | 'POWER'
  | 'MICROCONTROLLER';

export type ComponentType =
  | 'LED'
  | 'RGB_LED'
  | 'RESISTOR'
  | 'CAPACITOR'
  | 'BUTTON'
  | 'SWITCH'
  | 'POTENTIOMETER'
  | 'BUZZER'
  | 'PIEZO'
  | 'SERVO'
  | 'DC_MOTOR'
  | 'STEPPER'
  | 'LCD_16X2'
  | 'SEVEN_SEGMENT'
  | 'OLED'
  | 'ULTRASONIC'
  | 'TEMPERATURE'
  | 'HUMIDITY'
  | 'PHOTORESISTOR'
  | 'IR_SENSOR'
  | 'PIR'
  | 'RELAY'
  | 'TRANSISTOR'
  | 'DIODE'
  | 'BREADBOARD'
  | 'ARDUINO_UNO'
  | 'ARDUINO_NANO'
  | 'ARDUINO_MEGA'
  | 'WIRE';

export interface ComponentPin {
  id: string;
  name: string;
  type: 'POWER' | 'GROUND' | 'SIGNAL' | 'ANALOG' | 'DATA';
  position: [number, number, number]; // 3D position relative to component
  connectedTo?: string; // Wire or pin ID
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  category: ComponentCategory;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  pins: ComponentPin[];
  properties: Record<string, any>;
  state: Record<string, any>;
}

// ============================================
// WIRE TYPES
// ============================================

export interface WireConnection {
  componentId: string;
  pinId: string;
}

export interface Wire {
  id: string;
  color: string;
  start: WireConnection;
  end: WireConnection;
  points: [number, number, number][]; // Path points for 3D rendering
  resistance: number; // Ohms (usually 0 for ideal wire)
}

// ============================================
// SIMULATION TYPES
// ============================================

export type SimulationSpeed = 0.1 | 0.25 | 0.5 | 1 | 2 | 5 | 10;

export type SimulationState = 'STOPPED' | 'RUNNING' | 'PAUSED' | 'ERROR';

export interface SimulationConfig {
  speed: SimulationSpeed;
  maxExecutionTime: number; // ms before forced stop
  enableLogging: boolean;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  enableBreakpoints: boolean;
  enableProfiling: boolean;
}

export interface SimulationStats {
  totalCycles: number;
  loopIterations: number;
  executionTimeMs: number;
  averageLoopTimeUs: number;
  memoryUsage: number;
  cpuUsage: number;
}

// ============================================
// EVENT TYPES
// ============================================

export type EventType =
  | 'PIN_CHANGE'
  | 'TIMER_TICK'
  | 'SERIAL_DATA'
  | 'INTERRUPT'
  | 'ADC_COMPLETE'
  | 'PWM_CYCLE'
  | 'USER_INPUT'
  | 'SIMULATION_START'
  | 'SIMULATION_STOP'
  | 'SIMULATION_PAUSE'
  | 'SIMULATION_RESET'
  | 'COMPILE_START'
  | 'COMPILE_SUCCESS'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR';

export interface SimulationEvent {
  id: string;
  type: EventType;
  timestamp: number; // microseconds since simulation start
  source: string; // Component or system ID
  target?: string; // Target component ID
  data: Record<string, any>;
}

// ============================================
// ERROR TYPES
// ============================================

export type ErrorSeverity = 'WARNING' | 'ERROR' | 'FATAL';

export interface SimulationError {
  id: string;
  severity: ErrorSeverity;
  code: string;
  message: string;
  messageKo: string; // Korean error message
  line?: number;
  column?: number;
  source?: string;
  stack?: string;
  timestamp: number;
}

// ============================================
// SERIAL TYPES
// ============================================

export type BaudRate = 300 | 1200 | 2400 | 4800 | 9600 | 19200 | 38400 | 57600 | 115200;

export interface SerialConfig {
  baudRate: BaudRate;
  dataBits: 5 | 6 | 7 | 8;
  stopBits: 1 | 2;
  parity: 'NONE' | 'EVEN' | 'ODD';
}

export interface SerialBuffer {
  rx: number[]; // Receive buffer
  tx: number[]; // Transmit buffer
  rxSize: number;
  txSize: number;
}

// ============================================
// CALLBACK TYPES
// ============================================

export type PinChangeCallback = (pinId: number, state: PinRuntimeState) => void;
export type SerialOutputCallback = (data: string) => void;
export type ErrorCallback = (error: SimulationError) => void;
export type EventCallback = (event: SimulationEvent) => void;
export type SimulationStateCallback = (state: SimulationState, stats: SimulationStats) => void;

// ============================================
// API RESULT TYPES
// ============================================

export interface CompileResult {
  success: boolean;
  errors: SimulationError[];
  warnings: SimulationError[];
  output?: CompiledProgram;
  compilationTimeMs: number;
}

export interface CompiledProgram {
  setupFunction: () => void | Promise<void>;
  loopFunction: () => void | Promise<void>;
  variables: Map<string, any>;
  functions: Map<string, Function>;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  errors: SimulationError[];
  stats: SimulationStats;
}
