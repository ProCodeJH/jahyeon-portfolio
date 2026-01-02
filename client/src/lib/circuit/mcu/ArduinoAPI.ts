/**
 * Arduino API Virtualization Layer
 * Provides Arduino-compatible API for circuit simulation
 */

import type { SignalState } from '../kernel/types';
import { SimulationEngine } from '../sim/SimulationEngine';

export type PinMode = 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';

export interface SerialInterface {
  begin: (baudRate: number) => void;
  print: (value: string | number) => void;
  println: (value?: string | number) => void;
  available: () => number;
  read: () => number;
  write: (data: number | string) => void;
}

export class ArduinoVirtualMachine {
  private engine: SimulationEngine;
  private componentId: string;
  private pinModes: Map<number, PinMode> = new Map();
  private pinStates: Map<number, boolean> = new Map();
  private pwmValues: Map<number, number> = new Map();
  private serialBuffer: number[] = [];
  private serialOutputCallback?: (data: string) => void;
  private startTime: number = 0;
  private running = false;
  private loopFunction?: () => void;
  private loopIntervalId?: number;

  // Arduino UNO pin mapping
  private readonly PIN_MAP: Record<number, string> = {
    0: 'D0', 1: 'D1', 2: 'D2', 3: 'D3', 4: 'D4',
    5: 'D5', 6: 'D6', 7: 'D7', 8: 'D8', 9: 'D9',
    10: 'D10', 11: 'D11', 12: 'D12', 13: 'D13',
    14: 'A0', 15: 'A1', 16: 'A2', 17: 'A3', 18: 'A4', 19: 'A5',
  };

  // PWM-capable pins on Arduino UNO
  private readonly PWM_PINS = [3, 5, 6, 9, 10, 11];

  // Built-in LED
  public readonly LED_BUILTIN = 13;

  // Pin constants
  public readonly HIGH = true;
  public readonly LOW = false;
  public readonly INPUT: PinMode = 'INPUT';
  public readonly OUTPUT: PinMode = 'OUTPUT';
  public readonly INPUT_PULLUP: PinMode = 'INPUT_PULLUP';

  // Serial interface
  public Serial: SerialInterface;

  constructor(engine: SimulationEngine, componentId: string) {
    this.engine = engine;
    this.componentId = componentId;
    this.startTime = Date.now();

    // Initialize Serial interface
    this.Serial = {
      begin: this.serialBegin.bind(this),
      print: this.serialPrint.bind(this),
      println: this.serialPrintln.bind(this),
      available: this.serialAvailable.bind(this),
      read: this.serialRead.bind(this),
      write: this.serialWrite.bind(this),
    };

    // Initialize all pins as INPUT
    for (let i = 0; i <= 19; i++) {
      this.pinModes.set(i, 'INPUT');
      this.pinStates.set(i, false);
    }
  }

  // Pin mode functions
  pinMode(pin: number, mode: PinMode): void {
    if (pin < 0 || pin > 19) {
      console.warn(`Invalid pin number: ${pin}`);
      return;
    }

    this.pinModes.set(pin, mode);

    const pinId = this.getPinId(pin);
    if (pinId) {
      const direction = mode === 'OUTPUT' ? 'output' : 'input';
      this.engine.schedulePinChange(
        pinId,
        mode === 'INPUT_PULLUP' ? 'HIGH' : 'HIGH_Z',
        mode === 'INPUT_PULLUP' ? 5.0 : 0,
        0
      );
    }
  }

  // Digital I/O
  digitalWrite(pin: number, value: boolean | number): void {
    if (pin < 0 || pin > 19) return;

    const mode = this.pinModes.get(pin);
    if (mode !== 'OUTPUT') {
      console.warn(`Pin ${pin} is not set as OUTPUT`);
      return;
    }

    const state = value === true || value === 1 || value === this.HIGH;
    this.pinStates.set(pin, state);

    const pinId = this.getPinId(pin);
    if (pinId) {
      this.engine.schedulePinChange(
        pinId,
        state ? 'HIGH' : 'LOW',
        state ? 5.0 : 0,
        0
      );
    }
  }

  digitalRead(pin: number): number {
    if (pin < 0 || pin > 19) return 0;

    const pinId = this.getPinId(pin);
    if (pinId) {
      const pinState = this.engine.getPinState(pinId);
      if (pinState) {
        return pinState.state === 'HIGH' ? 1 : 0;
      }
    }

    return this.pinStates.get(pin) ? 1 : 0;
  }

  // Analog I/O
  analogRead(pin: number): number {
    // A0-A5 are pins 14-19
    const actualPin = pin < 14 ? pin + 14 : pin;

    const pinId = this.getPinId(actualPin);
    if (pinId) {
      const pinState = this.engine.getPinState(pinId);
      if (pinState) {
        // Convert voltage to 10-bit ADC value (0-1023)
        return Math.round((pinState.voltage / 5.0) * 1023);
      }
    }

    return 0;
  }

  analogWrite(pin: number, value: number): void {
    if (!this.PWM_PINS.includes(pin)) {
      console.warn(`Pin ${pin} does not support PWM`);
      return;
    }

    // Clamp value to 0-255
    value = Math.max(0, Math.min(255, Math.round(value)));
    this.pwmValues.set(pin, value);

    const pinId = this.getPinId(pin);
    if (pinId) {
      const voltage = (value / 255) * 5.0;
      this.engine.schedulePinChange(
        pinId,
        value > 0 ? 'HIGH' : 'LOW',
        voltage,
        0,
        value
      );
    }
  }

  // Time functions
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  delayMicroseconds(us: number): void {
    // Note: JavaScript can't accurately delay for microseconds
    const end = performance.now() + us / 1000;
    while (performance.now() < end) {
      // Busy wait
    }
  }

  millis(): number {
    return Date.now() - this.startTime;
  }

  micros(): number {
    return Math.round(performance.now() * 1000);
  }

  // Serial functions
  private serialBegin(_baudRate: number): void {
    this.serialBuffer = [];
    this.serialOutput('Serial initialized\n');
  }

  private serialPrint(value: string | number): void {
    this.serialOutput(String(value));
  }

  private serialPrintln(value?: string | number): void {
    this.serialOutput(value !== undefined ? String(value) + '\n' : '\n');
  }

  private serialAvailable(): number {
    return this.serialBuffer.length;
  }

  private serialRead(): number {
    return this.serialBuffer.shift() ?? -1;
  }

  private serialWrite(data: number | string): void {
    if (typeof data === 'string') {
      this.serialOutput(data);
    } else {
      this.serialOutput(String.fromCharCode(data));
    }
  }

  private serialOutput(data: string): void {
    if (this.serialOutputCallback) {
      this.serialOutputCallback(data);
    }
  }

  onSerialOutput(callback: (data: string) => void): void {
    this.serialOutputCallback = callback;
  }

  sendSerialInput(data: string): void {
    for (const char of data) {
      this.serialBuffer.push(char.charCodeAt(0));
    }
  }

  // Helper functions
  private getPinId(pin: number): string | null {
    const pinName = this.PIN_MAP[pin];
    if (!pinName) return null;
    return `${this.componentId}_pin_${pinName}`;
  }

  // Math functions
  map(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
    return ((value - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow;
  }

  constrain(value: number, low: number, high: number): number {
    return Math.max(low, Math.min(high, value));
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  max(a: number, b: number): number {
    return Math.max(a, b);
  }

  abs(value: number): number {
    return Math.abs(value);
  }

  // Execution control
  async run(setupFn: () => void, loopFn: () => void | Promise<void>): Promise<void> {
    this.startTime = Date.now();
    this.running = true;

    // Run setup once
    try {
      setupFn();
    } catch (error) {
      console.error('Setup error:', error);
      this.serialOutput(`Error in setup(): ${error}\n`);
      return;
    }

    // Run loop continuously
    this.loopFunction = loopFn;
    this.runLoop();
  }

  private async runLoop(): Promise<void> {
    if (!this.running || !this.loopFunction) return;

    try {
      const result = this.loopFunction();
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error('Loop error:', error);
      this.serialOutput(`Error in loop(): ${error}\n`);
      this.stop();
      return;
    }

    // Schedule next loop iteration
    if (this.running) {
      this.loopIntervalId = requestAnimationFrame(() => this.runLoop());
    }
  }

  stop(): void {
    this.running = false;
    if (this.loopIntervalId) {
      cancelAnimationFrame(this.loopIntervalId);
      this.loopIntervalId = undefined;
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  reset(): void {
    this.stop();
    this.startTime = Date.now();
    this.serialBuffer = [];

    for (let i = 0; i <= 19; i++) {
      this.pinModes.set(i, 'INPUT');
      this.pinStates.set(i, false);
      this.pwmValues.set(i, 0);
    }
  }
}
