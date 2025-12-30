/**
 * Arduino Runtime - API Virtualization
 * NOT an AVR emulator - virtualizes Arduino C++ API in JavaScript
 *
 * Supports:
 * - Pin functions (pinMode, digitalWrite, digitalRead, analogRead, analogWrite)
 * - Time functions (delay, delayMicroseconds, millis, micros)
 * - Serial communication (Serial.begin, print, println)
 * - Interrupts (attachInterrupt, detachInterrupt)
 *
 * Architecture:
 * - Runs in WebWorker alongside SimEngine
 * - Communicates with ConnectivityGraph for pin states
 * - Yields control via async/await for delays
 */

import type { SimEngine } from './SimEngine';
import type {
  PinMode,
  ArduinoAPI,
  PinRef,
  DigitalState,
} from '@circuit-sim/kernel/contracts';

/**
 * Arduino UNO Pin Mapping
 */
const PIN_MAP = {
  // Digital pins
  D0: 0, D1: 1, D2: 2, D3: 3, D4: 4, D5: 5, D6: 6, D7: 7,
  D8: 8, D9: 9, D10: 10, D11: 11, D12: 12, D13: 13,

  // Analog pins (14-19 internally)
  A0: 14, A1: 15, A2: 16, A3: 17, A4: 18, A5: 19,

  // PWM-capable pins
  PWM_PINS: [3, 5, 6, 9, 10, 11],
} as const;

/**
 * Arduino Runtime
 */
export class ArduinoRuntime implements ArduinoAPI {
  private engine: SimEngine;
  private componentId: string; // Arduino component ID

  // Pin state
  private pinModes: Map<number, PinMode>;
  private pinValues: Map<number, number>;
  private pwmValues: Map<number, number>;

  // Interrupts
  private interrupts: Map<number, { callback: () => void; mode: string }>;
  private lastPinStates: Map<number, number>;

  // Time
  private startTime_us: number;

  // Serial
  private serialBuffer: string[];
  private serialBaudRate: number;

  // User code
  private userSetup: (() => void | Promise<void>) | null = null;
  private userLoop: (() => void | Promise<void>) | null = null;
  private loopRunning: boolean = false;

  constructor(engine: SimEngine, componentId: string = 'arduino-uno') {
    this.engine = engine;
    this.componentId = componentId;

    this.pinModes = new Map();
    this.pinValues = new Map();
    this.pwmValues = new Map();
    this.interrupts = new Map();
    this.lastPinStates = new Map();
    this.serialBuffer = [];
    this.serialBaudRate = 9600;
    this.startTime_us = 0;

    // Initialize all pins to INPUT with HIGH-Z
    for (let i = 0; i <= 19; i++) {
      this.pinModes.set(i, PinMode.INPUT);
      this.pinValues.set(i, 0);
      this.lastPinStates.set(i, 0);
    }
  }

  // ==========================================================================
  // PIN FUNCTIONS
  // ==========================================================================

  pinMode(pin: number, mode: PinMode): void {
    if (pin < 0 || pin > 19) {
      throw new Error(`Invalid pin: ${pin}`);
    }

    this.pinModes.set(pin, mode);

    // Set initial state based on mode
    if (mode === PinMode.INPUT_PULLUP) {
      this.pinValues.set(pin, 1); // Pull-up resistor
      this.updatePinInGraph(pin, 1);
    } else if (mode === PinMode.INPUT) {
      this.pinValues.set(pin, 0); // Floating (will read from graph)
    }
  }

  digitalWrite(pin: number, value: 0 | 1): void {
    if (this.pinModes.get(pin) !== PinMode.OUTPUT) {
      console.warn(`digitalWrite on non-OUTPUT pin ${pin}`);
      return;
    }

    this.pinValues.set(pin, value);
    this.updatePinInGraph(pin, value);

    // Schedule event for pin change
    this.engine.scheduleEvent(1, {
      type: 'EDGE',
      target: this.componentId,
      data: {
        pin: this.getPinRef(pin),
        state: {
          digital: value === 1 ? DigitalState.HIGH : DigitalState.LOW,
          voltage: value === 1 ? 5.0 : 0.0,
          current: 0,
        },
      },
    });
  }

  digitalRead(pin: number): 0 | 1 {
    const mode = this.pinModes.get(pin);

    if (mode === PinMode.OUTPUT) {
      // Read output register
      return (this.pinValues.get(pin) || 0) as 0 | 1;
    }

    // Read from connectivity graph
    const pinRef = this.getPinRef(pin);
    const state = this.engine.graph.getPinState(pinRef);

    // Convert voltage to digital
    if (state.voltage > 3.0) {
      return 1; // HIGH
    } else if (state.voltage < 1.5) {
      return 0; // LOW
    } else {
      // Undefined region - use last value
      return (this.pinValues.get(pin) || 0) as 0 | 1;
    }
  }

  analogRead(pin: number): number {
    // Only A0-A5 (14-19)
    if (pin < 14 || pin > 19) {
      throw new Error(`Invalid analog pin: ${pin}`);
    }

    const pinRef = this.getPinRef(pin);
    const state = this.engine.graph.getPinState(pinRef);

    // Convert voltage (0-5V) to ADC value (0-1023)
    const adcValue = Math.round((state.voltage / 5.0) * 1023);
    return Math.max(0, Math.min(1023, adcValue));
  }

  analogWrite(pin: number, value: number): void {
    // Check if pin supports PWM
    if (!PIN_MAP.PWM_PINS.includes(pin)) {
      console.warn(`analogWrite on non-PWM pin ${pin}`);
      return;
    }

    if (this.pinModes.get(pin) !== PinMode.OUTPUT) {
      console.warn(`analogWrite on non-OUTPUT pin ${pin}`);
      return;
    }

    // Clamp to 0-255
    const pwmValue = Math.max(0, Math.min(255, value));
    this.pwmValues.set(pin, pwmValue);

    // Update graph with PWM state
    const duty = pwmValue / 255;
    const avgVoltage = 5.0 * duty; // Time-averaged voltage

    this.engine.scheduleEvent(1, {
      type: 'EDGE',
      target: this.componentId,
      data: {
        pin: this.getPinRef(pin),
        state: {
          digital: pwmValue > 127 ? DigitalState.HIGH : DigitalState.LOW,
          voltage: avgVoltage,
          current: 0,
          pwm: {
            enabled: true,
            duty,
            frequency: 490, // Hz (Arduino PWM frequency)
          },
        },
      },
    });
  }

  // ==========================================================================
  // TIME FUNCTIONS
  // ==========================================================================

  async delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.engine.scheduleEvent(ms * 1000, {
        type: 'TIMER',
        target: this.componentId,
        data: { callback: resolve },
      });
    });
  }

  async delayMicroseconds(us: number): Promise<void> {
    return new Promise((resolve) => {
      this.engine.scheduleEvent(us, {
        type: 'TIMER',
        target: this.componentId,
        data: { callback: resolve },
      });
    });
  }

  millis(): number {
    const elapsed_us = this.engine.getCurrentTime_us() - this.startTime_us;
    return Math.floor(elapsed_us / 1000);
  }

  micros(): number {
    return this.engine.getCurrentTime_us() - this.startTime_us;
  }

  // ==========================================================================
  // SERIAL COMMUNICATION
  // ==========================================================================

  Serial = {
    begin: (baud: number): void => {
      this.serialBaudRate = baud;
      this.serialBuffer = [];
    },

    print: (data: any): void => {
      const text = String(data);
      this.serialBuffer.push(text);

      // Send to UI
      this.engine.scheduleEvent(1, {
        type: 'SERIAL',
        target: this.componentId,
        data: {
          port: 'Serial',
          text,
        },
      });
    },

    println: (data: any): void => {
      this.Serial.print(String(data) + '\n');
    },

    available: (): number => {
      // TODO: Implement Serial RX buffer
      return 0;
    },

    read: (): number => {
      // TODO: Implement Serial RX
      return -1;
    },
  };

  // ==========================================================================
  // INTERRUPTS
  // ==========================================================================

  attachInterrupt(
    pin: number,
    callback: () => void,
    mode: 'LOW' | 'CHANGE' | 'RISING' | 'FALLING'
  ): void {
    // Map digital pin to interrupt number
    // UNO: D2 = INT0, D3 = INT1
    let intNum = -1;
    if (pin === 2) intNum = 0;
    if (pin === 3) intNum = 1;

    if (intNum === -1) {
      throw new Error(`Pin ${pin} does not support interrupts`);
    }

    this.interrupts.set(intNum, { callback, mode });
    this.lastPinStates.set(pin, this.digitalRead(pin));
  }

  detachInterrupt(pin: number): void {
    let intNum = -1;
    if (pin === 2) intNum = 0;
    if (pin === 3) intNum = 1;

    if (intNum !== -1) {
      this.interrupts.delete(intNum);
    }
  }

  /**
   * Check interrupts (called by engine on pin changes)
   */
  checkInterrupts(): void {
    for (const [intNum, { callback, mode }] of this.interrupts) {
      const pin = intNum === 0 ? 2 : 3;
      const currentState = this.digitalRead(pin);
      const lastState = this.lastPinStates.get(pin) || 0;

      let trigger = false;

      switch (mode) {
        case 'LOW':
          trigger = currentState === 0;
          break;
        case 'CHANGE':
          trigger = currentState !== lastState;
          break;
        case 'RISING':
          trigger = lastState === 0 && currentState === 1;
          break;
        case 'FALLING':
          trigger = lastState === 1 && currentState === 0;
          break;
      }

      if (trigger) {
        callback();
      }

      this.lastPinStates.set(pin, currentState);
    }
  }

  // ==========================================================================
  // CODE EXECUTION
  // ==========================================================================

  /**
   * Load user code (setup and loop functions)
   */
  loadCode(setupFn: () => void | Promise<void>, loopFn: () => void | Promise<void>): void {
    this.userSetup = setupFn;
    this.userLoop = loopFn;
  }

  /**
   * Start Arduino execution (setup + loop)
   */
  async start(): Promise<void> {
    this.startTime_us = this.engine.getCurrentTime_us();

    // Run setup once
    if (this.userSetup) {
      await this.userSetup.call(this);
    }

    // Run loop repeatedly
    this.loopRunning = true;
    this.runLoop();
  }

  /**
   * Stop Arduino execution
   */
  stop(): void {
    this.loopRunning = false;
  }

  /**
   * Run loop function repeatedly
   */
  private async runLoop(): Promise<void> {
    while (this.loopRunning) {
      if (this.userLoop) {
        await this.userLoop.call(this);
      }

      // Check interrupts
      this.checkInterrupts();

      // Yield to event loop
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  /**
   * Get PinRef for a pin number
   */
  private getPinRef(pin: number): PinRef {
    let pinName: string;

    if (pin <= 13) {
      pinName = `D${pin}`;
    } else {
      pinName = `A${pin - 14}`;
    }

    return {
      component: this.componentId,
      pin: pinName,
    };
  }

  /**
   * Update pin state in connectivity graph
   */
  private updatePinInGraph(pin: number, value: number): void {
    const pinRef = this.getPinRef(pin);
    this.engine.graph.setPinState(pinRef, {
      digital: value === 1 ? DigitalState.HIGH : DigitalState.LOW,
      voltage: value === 1 ? 5.0 : 0.0,
      current: 0,
    });
  }

  /**
   * Get pin state for debugging
   */
  getPinState(pin: number) {
    return {
      mode: this.pinModes.get(pin),
      value: this.pinValues.get(pin),
      pwm: this.pwmValues.get(pin),
    };
  }

  /**
   * Reset runtime
   */
  reset(): void {
    this.stop();
    this.pinModes.clear();
    this.pinValues.clear();
    this.pwmValues.clear();
    this.interrupts.clear();
    this.serialBuffer = [];

    // Re-initialize pins
    for (let i = 0; i <= 19; i++) {
      this.pinModes.set(i, PinMode.INPUT);
      this.pinValues.set(i, 0);
      this.lastPinStates.set(i, 0);
    }
  }
}

// ==========================================================================
// CONSTANTS (Arduino compatible)
// ==========================================================================

export const HIGH = 1;
export const LOW = 0;

export const INPUT = PinMode.INPUT;
export const OUTPUT = PinMode.OUTPUT;
export const INPUT_PULLUP = PinMode.INPUT_PULLUP;

// Pin numbers
export const A0 = 14;
export const A1 = 15;
export const A2 = 16;
export const A3 = 17;
export const A4 = 18;
export const A5 = 19;
