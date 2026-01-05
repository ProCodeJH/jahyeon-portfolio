/**
 * =====================================================
 * Enterprise Arduino Runtime Engine
 * =====================================================
 *
 * 핵심 철학:
 * - MCU를 에뮬레이션하지 않고 '행동'을 에뮬레이션
 * - State Machine 기반 이벤트 처리
 * - 모든 GPIO 변경은 이벤트로 전파
 * - 실시간 3D 시뮬레이션과 완벽한 동기화
 */

import {
  PinMode,
  PinState,
  PinRuntimeState,
  MCUSpec,
  BoardSpec,
  BoardType,
  BaudRate,
  SerialConfig,
  SerialBuffer,
  SimulationState,
  SimulationStats,
  SimulationConfig,
  SimulationEvent,
  SimulationError,
  PinChangeCallback,
  SerialOutputCallback,
  ErrorCallback,
  EventCallback,
  SimulationStateCallback,
  CompiledProgram,
} from './types';

import { BOARD_SPECS } from './BoardSpecs';

// ============================================
// ARDUINO RUNTIME ENGINE
// ============================================

export class ArduinoRuntime {
  // Board & MCU
  private boardSpec: BoardSpec;
  private pinStates: Map<number, PinRuntimeState> = new Map();

  // Timing
  private simulationStartTime: number = 0;
  private lastLoopTime: number = 0;
  private simulationTime: number = 0; // microseconds
  private delayEndTime: number = 0;
  private isInDelay: boolean = false;

  // State
  private state: SimulationState = 'STOPPED';
  private config: SimulationConfig;
  private stats: SimulationStats;

  // Serial
  private serialConfig: SerialConfig;
  private serialBuffer: SerialBuffer;
  private serialInitialized: boolean = false;

  // Program
  private program: CompiledProgram | null = null;
  private loopIntervalId: number | null = null;
  private setupCompleted: boolean = false;

  // Callbacks
  private pinChangeCallbacks: Set<PinChangeCallback> = new Set();
  private serialOutputCallbacks: Set<SerialOutputCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private eventCallbacks: Set<EventCallback> = new Set();
  private stateCallbacks: Set<SimulationStateCallback> = new Set();

  // Event queue
  private eventQueue: SimulationEvent[] = [];
  private eventIdCounter: number = 0;

  // Arduino constants
  public readonly HIGH = 1;
  public readonly LOW = 0;
  public readonly INPUT: PinMode = 'INPUT';
  public readonly OUTPUT: PinMode = 'OUTPUT';
  public readonly INPUT_PULLUP: PinMode = 'INPUT_PULLUP';
  public readonly LED_BUILTIN: number;

  constructor(boardType: BoardType = 'UNO') {
    this.boardSpec = BOARD_SPECS[boardType];
    this.LED_BUILTIN = this.boardSpec.builtInLED;

    this.config = {
      speed: 1,
      maxExecutionTime: 30000,
      enableLogging: true,
      logLevel: 'INFO',
      enableBreakpoints: false,
      enableProfiling: false,
    };

    this.stats = this.createInitialStats();
    this.serialConfig = this.createDefaultSerialConfig();
    this.serialBuffer = this.createEmptySerialBuffer();

    this.initializePins();
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  private createInitialStats(): SimulationStats {
    return {
      totalCycles: 0,
      loopIterations: 0,
      executionTimeMs: 0,
      averageLoopTimeUs: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    };
  }

  private createDefaultSerialConfig(): SerialConfig {
    return {
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'NONE',
    };
  }

  private createEmptySerialBuffer(): SerialBuffer {
    return {
      rx: [],
      tx: [],
      rxSize: 64,
      txSize: 64,
    };
  }

  private initializePins(): void {
    this.pinStates.clear();

    for (const pinDef of this.boardSpec.mcu.pins) {
      this.pinStates.set(pinDef.id, {
        pinId: pinDef.id,
        mode: 'INPUT',
        digitalState: 'FLOATING',
        analogValue: 0,
        pwmDuty: 0,
        pwmFrequency: 490, // Arduino default PWM frequency
        lastChangeTime: 0,
        interruptEnabled: false,
      });
    }
  }

  // ============================================
  // ARDUINO API IMPLEMENTATION
  // ============================================

  /**
   * pinMode(pin, mode)
   * 핀의 입출력 모드를 설정합니다.
   */
  public pinMode(pin: number, mode: PinMode | number): void {
    if (!this.validatePin(pin)) return;

    const pinMode: PinMode = typeof mode === 'number'
      ? (mode === 0 ? 'INPUT' : mode === 1 ? 'OUTPUT' : 'INPUT_PULLUP')
      : mode;

    const pinState = this.pinStates.get(pin)!;
    pinState.mode = pinMode;

    // INPUT_PULLUP sets initial state to HIGH
    if (pinMode === 'INPUT_PULLUP') {
      pinState.digitalState = 'HIGH';
      pinState.analogValue = 1023;
    } else if (pinMode === 'INPUT') {
      pinState.digitalState = 'FLOATING';
      pinState.analogValue = 0;
    } else if (pinMode === 'OUTPUT') {
      pinState.digitalState = 'LOW';
      pinState.analogValue = 0;
    }

    pinState.lastChangeTime = this.simulationTime;
    this.emitPinChange(pin, pinState);
    this.log('DEBUG', `pinMode(${pin}, ${pinMode})`);
  }

  /**
   * digitalWrite(pin, value)
   * 디지털 핀에 HIGH 또는 LOW를 출력합니다.
   */
  public digitalWrite(pin: number, value: number | boolean): void {
    if (!this.validatePin(pin)) return;

    const pinState = this.pinStates.get(pin)!;

    if (pinState.mode !== 'OUTPUT') {
      this.log('WARN', `digitalWrite on non-OUTPUT pin ${pin}`);
    }

    const newState: PinState = (value === 1 || value === true || value === this.HIGH) ? 'HIGH' : 'LOW';

    if (pinState.digitalState !== newState) {
      pinState.digitalState = newState;
      pinState.analogValue = newState === 'HIGH' ? 255 : 0;
      pinState.lastChangeTime = this.simulationTime;
      this.emitPinChange(pin, pinState);
    }

    this.log('DEBUG', `digitalWrite(${pin}, ${newState})`);
  }

  /**
   * digitalRead(pin)
   * 디지털 핀의 상태를 읽습니다.
   */
  public digitalRead(pin: number): number {
    if (!this.validatePin(pin)) return 0;

    const pinState = this.pinStates.get(pin)!;

    if (pinState.digitalState === 'HIGH') return this.HIGH;
    if (pinState.digitalState === 'LOW') return this.LOW;

    // FLOATING - return random noise or last state
    return Math.random() > 0.5 ? this.HIGH : this.LOW;
  }

  /**
   * analogWrite(pin, value)
   * PWM 핀에 0-255 값을 출력합니다.
   */
  public analogWrite(pin: number, value: number): void {
    if (!this.validatePin(pin)) return;

    const pinDef = this.boardSpec.mcu.pins.find(p => p.id === pin);
    if (!pinDef?.supportsPWM) {
      this.log('WARN', `analogWrite on non-PWM pin ${pin}`);
      // Fall back to digital write
      this.digitalWrite(pin, value > 127 ? this.HIGH : this.LOW);
      return;
    }

    const pinState = this.pinStates.get(pin)!;
    const clampedValue = Math.max(0, Math.min(255, Math.round(value)));

    pinState.mode = 'PWM';
    pinState.pwmDuty = clampedValue;
    pinState.analogValue = clampedValue;
    pinState.digitalState = clampedValue > 0 ? 'PWM' : 'LOW';
    pinState.lastChangeTime = this.simulationTime;

    this.emitPinChange(pin, pinState);
    this.log('DEBUG', `analogWrite(${pin}, ${clampedValue})`);
  }

  /**
   * analogRead(pin)
   * 아날로그 핀의 값을 읽습니다 (0-1023).
   */
  public analogRead(pin: number): number {
    // Convert A0-A5 to actual pin numbers
    const actualPin = pin < 14 ? pin + 14 : pin;

    if (!this.validatePin(actualPin)) return 0;

    const pinState = this.pinStates.get(actualPin)!;
    return Math.round(pinState.analogValue);
  }

  /**
   * delay(ms)
   * 지정된 밀리초 동안 대기합니다.
   * 비동기로 구현되어 UI가 멈추지 않습니다.
   */
  public delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const adjustedMs = ms / this.config.speed;
      this.isInDelay = true;
      this.delayEndTime = this.simulationTime + (ms * 1000);

      setTimeout(() => {
        this.isInDelay = false;
        this.simulationTime = this.delayEndTime;
        resolve();
      }, adjustedMs);
    });
  }

  /**
   * delayMicroseconds(us)
   * 지정된 마이크로초 동안 대기합니다.
   */
  public delayMicroseconds(us: number): void {
    // For very short delays, use busy wait
    const end = performance.now() + (us / 1000) / this.config.speed;
    while (performance.now() < end) {
      // Busy wait
    }
    this.simulationTime += us;
  }

  /**
   * millis()
   * 프로그램 시작 후 경과한 밀리초를 반환합니다.
   */
  public millis(): number {
    return Math.floor(this.simulationTime / 1000);
  }

  /**
   * micros()
   * 프로그램 시작 후 경과한 마이크로초를 반환합니다.
   */
  public micros(): number {
    return Math.floor(this.simulationTime);
  }

  // ============================================
  // SERIAL API IMPLEMENTATION
  // ============================================

  public Serial = {
    begin: (baudRate: BaudRate = 9600): void => {
      this.serialConfig.baudRate = baudRate;
      this.serialInitialized = true;
      this.serialBuffer = this.createEmptySerialBuffer();
      this.emitSerialOutput('Serial initialized at ' + baudRate + ' baud\n');
      this.log('INFO', `Serial.begin(${baudRate})`);
    },

    end: (): void => {
      this.serialInitialized = false;
      this.log('INFO', 'Serial.end()');
    },

    print: (value: string | number | boolean): void => {
      if (!this.serialInitialized) {
        this.log('WARN', 'Serial.print called before Serial.begin');
        return;
      }
      const output = String(value);
      this.emitSerialOutput(output);
    },

    println: (value?: string | number | boolean): void => {
      if (!this.serialInitialized) {
        this.log('WARN', 'Serial.println called before Serial.begin');
        return;
      }
      const output = value !== undefined ? String(value) + '\n' : '\n';
      this.emitSerialOutput(output);
    },

    write: (value: number | string): number => {
      if (!this.serialInitialized) return 0;

      if (typeof value === 'string') {
        this.emitSerialOutput(value);
        return value.length;
      } else {
        this.emitSerialOutput(String.fromCharCode(value));
        return 1;
      }
    },

    available: (): number => {
      return this.serialBuffer.rx.length;
    },

    read: (): number => {
      if (this.serialBuffer.rx.length === 0) return -1;
      return this.serialBuffer.rx.shift()!;
    },

    peek: (): number => {
      if (this.serialBuffer.rx.length === 0) return -1;
      return this.serialBuffer.rx[0];
    },

    flush: (): void => {
      this.serialBuffer.tx = [];
    },

    readString: (): string => {
      const chars = this.serialBuffer.rx.splice(0);
      return chars.map(c => String.fromCharCode(c)).join('');
    },

    readStringUntil: (terminator: string): string => {
      const termCode = terminator.charCodeAt(0);
      const index = this.serialBuffer.rx.indexOf(termCode);
      if (index === -1) return '';

      const chars = this.serialBuffer.rx.splice(0, index + 1);
      return chars.map(c => String.fromCharCode(c)).join('');
    },

    parseInt: (): number => {
      const str = this.Serial.readString();
      return parseInt(str) || 0;
    },

    parseFloat: (): number => {
      const str = this.Serial.readString();
      return parseFloat(str) || 0;
    },
  };

  /**
   * 시리얼 입력 데이터를 버퍼에 추가
   */
  public sendSerialInput(data: string): void {
    for (const char of data) {
      if (this.serialBuffer.rx.length < this.serialBuffer.rxSize) {
        this.serialBuffer.rx.push(char.charCodeAt(0));
      }
    }
  }

  // ============================================
  // MATH UTILITIES (Arduino Built-in)
  // ============================================

  public map(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
    return ((value - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow;
  }

  public constrain(value: number, low: number, high: number): number {
    return Math.max(low, Math.min(high, value));
  }

  public min(a: number, b: number): number {
    return Math.min(a, b);
  }

  public max(a: number, b: number): number {
    return Math.max(a, b);
  }

  public abs(value: number): number {
    return Math.abs(value);
  }

  public pow(base: number, exponent: number): number {
    return Math.pow(base, exponent);
  }

  public sqrt(value: number): number {
    return Math.sqrt(value);
  }

  public sq(value: number): number {
    return value * value;
  }

  public random(max: number): number;
  public random(min: number, max: number): number;
  public random(minOrMax: number, max?: number): number {
    if (max === undefined) {
      return Math.floor(Math.random() * minOrMax);
    }
    return Math.floor(Math.random() * (max - minOrMax)) + minOrMax;
  }

  public randomSeed(seed: number): void {
    // JavaScript doesn't support seeded random, but we acknowledge the call
    this.log('DEBUG', `randomSeed(${seed})`);
  }

  // ============================================
  // EXECUTION CONTROL
  // ============================================

  /**
   * 컴파일된 프로그램을 로드합니다.
   */
  public loadProgram(program: CompiledProgram): void {
    this.program = program;
    this.setupCompleted = false;
    this.log('INFO', 'Program loaded');
  }

  /**
   * 시뮬레이션을 시작합니다.
   */
  public async start(): Promise<void> {
    if (this.state === 'RUNNING') {
      this.log('WARN', 'Simulation already running');
      return;
    }

    if (!this.program) {
      this.emitError({
        id: this.generateId(),
        severity: 'ERROR',
        code: 'NO_PROGRAM',
        message: 'No program loaded',
        messageKo: '로드된 프로그램이 없습니다',
        timestamp: Date.now(),
      });
      return;
    }

    this.state = 'RUNNING';
    this.simulationStartTime = performance.now();
    this.simulationTime = 0;
    this.stats = this.createInitialStats();

    this.emitStateChange();
    this.emitEvent('SIMULATION_START', 'system', {});

    try {
      // Run setup()
      if (!this.setupCompleted) {
        this.log('INFO', 'Running setup()');
        await this.program.setupFunction();
        this.setupCompleted = true;
        this.log('INFO', 'setup() completed');
      }

      // Start loop()
      this.runLoop();
    } catch (error) {
      this.handleRuntimeError(error);
    }
  }

  /**
   * 메인 loop() 실행
   */
  private async runLoop(): Promise<void> {
    if (this.state !== 'RUNNING' || !this.program) return;

    const loopStartTime = performance.now();

    try {
      // Execute one iteration of loop()
      await this.program.loopFunction();

      // Update stats
      this.stats.loopIterations++;
      this.stats.totalCycles++;

      const loopDuration = performance.now() - loopStartTime;
      this.simulationTime += loopDuration * 1000 * this.config.speed;

      // Calculate average loop time
      this.stats.averageLoopTimeUs =
        (this.stats.averageLoopTimeUs * (this.stats.loopIterations - 1) + loopDuration * 1000) /
        this.stats.loopIterations;

      // Update execution time
      this.stats.executionTimeMs = performance.now() - this.simulationStartTime;

      // Check max execution time
      if (this.stats.executionTimeMs > this.config.maxExecutionTime) {
        this.emitError({
          id: this.generateId(),
          severity: 'ERROR',
          code: 'TIMEOUT',
          message: `Execution time exceeded ${this.config.maxExecutionTime}ms`,
          messageKo: `실행 시간이 ${this.config.maxExecutionTime}ms를 초과했습니다`,
          timestamp: Date.now(),
        });
        this.stop();
        return;
      }

      // Schedule next loop iteration
      if (this.state === 'RUNNING') {
        // Use requestAnimationFrame for smooth animation sync
        this.loopIntervalId = requestAnimationFrame(() => this.runLoop());
      }
    } catch (error) {
      this.handleRuntimeError(error);
    }
  }

  /**
   * 시뮬레이션을 일시 정지합니다.
   */
  public pause(): void {
    if (this.state !== 'RUNNING') return;

    this.state = 'PAUSED';
    if (this.loopIntervalId) {
      cancelAnimationFrame(this.loopIntervalId);
      this.loopIntervalId = null;
    }

    this.emitStateChange();
    this.emitEvent('SIMULATION_PAUSE', 'system', {});
    this.log('INFO', 'Simulation paused');
  }

  /**
   * 시뮬레이션을 재개합니다.
   */
  public resume(): void {
    if (this.state !== 'PAUSED') return;

    this.state = 'RUNNING';
    this.runLoop();

    this.emitStateChange();
    this.log('INFO', 'Simulation resumed');
  }

  /**
   * 시뮬레이션을 정지합니다.
   */
  public stop(): void {
    this.state = 'STOPPED';

    if (this.loopIntervalId) {
      cancelAnimationFrame(this.loopIntervalId);
      this.loopIntervalId = null;
    }

    this.emitStateChange();
    this.emitEvent('SIMULATION_STOP', 'system', { stats: this.stats });
    this.log('INFO', 'Simulation stopped');
  }

  /**
   * 시뮬레이션을 리셋합니다.
   */
  public reset(): void {
    this.stop();
    this.initializePins();
    this.setupCompleted = false;
    this.simulationTime = 0;
    this.serialBuffer = this.createEmptySerialBuffer();
    this.serialInitialized = false;
    this.stats = this.createInitialStats();

    this.emitStateChange();
    this.emitEvent('SIMULATION_RESET', 'system', {});
    this.log('INFO', 'Simulation reset');
  }

  // ============================================
  // PIN EXTERNAL CONTROL (for 3D interaction)
  // ============================================

  /**
   * 외부에서 핀 상태를 설정 (버튼 클릭, 센서 값 변경 등)
   */
  public setExternalPinState(pin: number, state: Partial<PinRuntimeState>): void {
    if (!this.validatePin(pin)) return;

    const pinState = this.pinStates.get(pin)!;
    Object.assign(pinState, state);
    pinState.lastChangeTime = this.simulationTime;

    this.emitPinChange(pin, pinState);
  }

  /**
   * 센서 아날로그 값 설정
   */
  public setSensorValue(pin: number, value: number): void {
    const actualPin = pin < 14 ? pin + 14 : pin;
    this.setExternalPinState(actualPin, {
      analogValue: Math.max(0, Math.min(1023, value)),
    });
  }

  /**
   * 버튼 상태 설정
   */
  public setButtonState(pin: number, pressed: boolean): void {
    const pinState = this.pinStates.get(pin);
    if (!pinState) return;

    // INPUT_PULLUP: pressed = LOW, released = HIGH
    const newState: PinState = pinState.mode === 'INPUT_PULLUP'
      ? (pressed ? 'LOW' : 'HIGH')
      : (pressed ? 'HIGH' : 'LOW');

    this.setExternalPinState(pin, { digitalState: newState });
  }

  // ============================================
  // STATE GETTERS
  // ============================================

  public getPinState(pin: number): PinRuntimeState | undefined {
    return this.pinStates.get(pin);
  }

  public getAllPinStates(): Map<number, PinRuntimeState> {
    return new Map(this.pinStates);
  }

  public getSimulationState(): SimulationState {
    return this.state;
  }

  public getSimulationStats(): SimulationStats {
    return { ...this.stats };
  }

  public getSimulationTime(): number {
    return this.simulationTime;
  }

  public getBoardSpec(): BoardSpec {
    return this.boardSpec;
  }

  public setSimulationSpeed(speed: SimulationSpeed): void {
    this.config.speed = speed;
  }

  // ============================================
  // CALLBACKS
  // ============================================

  public onPinChange(callback: PinChangeCallback): () => void {
    this.pinChangeCallbacks.add(callback);
    return () => this.pinChangeCallbacks.delete(callback);
  }

  public onSerialOutput(callback: SerialOutputCallback): () => void {
    this.serialOutputCallbacks.add(callback);
    return () => this.serialOutputCallbacks.delete(callback);
  }

  public onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  public onEvent(callback: EventCallback): () => void {
    this.eventCallbacks.add(callback);
    return () => this.eventCallbacks.delete(callback);
  }

  public onStateChange(callback: SimulationStateCallback): () => void {
    this.stateCallbacks.add(callback);
    return () => this.stateCallbacks.delete(callback);
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private validatePin(pin: number): boolean {
    if (!this.pinStates.has(pin)) {
      this.log('WARN', `Invalid pin number: ${pin}`);
      return false;
    }
    return true;
  }

  private emitPinChange(pin: number, state: PinRuntimeState): void {
    this.pinChangeCallbacks.forEach((cb) => cb(pin, { ...state }));
    this.emitEvent('PIN_CHANGE', `pin_${pin}`, { pin, state: { ...state } });
  }

  private emitSerialOutput(data: string): void {
    this.serialOutputCallbacks.forEach((cb) => cb(data));
    this.emitEvent('SERIAL_DATA', 'serial', { data });
  }

  private emitError(error: SimulationError): void {
    this.errorCallbacks.forEach((cb) => cb(error));
    this.emitEvent('RUNTIME_ERROR', 'system', { error });
  }

  private emitStateChange(): void {
    this.stateCallbacks.forEach((cb) => cb(this.state, { ...this.stats }));
  }

  private emitEvent(type: SimulationEvent['type'], source: string, data: Record<string, any>): void {
    const event: SimulationEvent = {
      id: this.generateId(),
      type,
      timestamp: this.simulationTime,
      source,
      data,
    };
    this.eventCallbacks.forEach((cb) => cb(event));
  }

  private handleRuntimeError(error: any): void {
    this.state = 'ERROR';
    this.emitError({
      id: this.generateId(),
      severity: 'FATAL',
      code: 'RUNTIME_ERROR',
      message: error.message || String(error),
      messageKo: `런타임 오류: ${error.message || String(error)}`,
      stack: error.stack,
      timestamp: Date.now(),
    });
    this.stop();
  }

  private log(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', message: string): void {
    if (!this.config.enableLogging) return;

    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    if (levels.indexOf(level) < levels.indexOf(this.config.logLevel)) return;

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  private generateId(): string {
    return `${Date.now()}_${++this.eventIdCounter}`;
  }
}

// Export singleton instance creator
export function createArduinoRuntime(boardType: BoardType = 'UNO'): ArduinoRuntime {
  return new ArduinoRuntime(boardType);
}
