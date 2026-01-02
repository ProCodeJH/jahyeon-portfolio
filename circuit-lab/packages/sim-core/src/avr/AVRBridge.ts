/**
 * AVR Bridge - Interface between AVR WASM runtime and simulation engine
 * Handles communication between compiled Arduino code and the circuit simulator
 */

import type {
  Component,
  PinMode,
  PinState,
  Time,
} from '../core/types';
import { SimulationEngine } from '../core/SimulationEngine';

// AVR register addresses (ATmega328P)
const AVR_REGISTERS = {
  PORTB: 0x25,
  PORTC: 0x28,
  PORTD: 0x2B,
  DDRB: 0x24,
  DDRC: 0x27,
  DDRD: 0x2A,
  PINB: 0x23,
  PINC: 0x26,
  PIND: 0x29,
  // Timer registers
  TCCR0A: 0x44,
  TCCR0B: 0x45,
  OCR0A: 0x47,
  OCR0B: 0x48,
  TCCR1A: 0x80,
  TCCR1B: 0x81,
  OCR1A: 0x88,
  OCR1B: 0x8A,
  TCCR2A: 0xB0,
  TCCR2B: 0xB1,
  OCR2A: 0xB3,
  OCR2B: 0xB4,
  // Serial registers
  UDR0: 0xC6,
  UCSR0A: 0xC0,
  UCSR0B: 0xC1,
  UBRR0L: 0xC4,
  UBRR0H: 0xC5,
};

// Pin to port/bit mapping for ATmega328P (Arduino UNO)
const PIN_MAP: { port: 'B' | 'C' | 'D'; bit: number }[] = [
  { port: 'D', bit: 0 }, // D0
  { port: 'D', bit: 1 }, // D1
  { port: 'D', bit: 2 }, // D2
  { port: 'D', bit: 3 }, // D3
  { port: 'D', bit: 4 }, // D4
  { port: 'D', bit: 5 }, // D5
  { port: 'D', bit: 6 }, // D6
  { port: 'D', bit: 7 }, // D7
  { port: 'B', bit: 0 }, // D8
  { port: 'B', bit: 1 }, // D9
  { port: 'B', bit: 2 }, // D10
  { port: 'B', bit: 3 }, // D11
  { port: 'B', bit: 4 }, // D12
  { port: 'B', bit: 5 }, // D13
  { port: 'C', bit: 0 }, // A0
  { port: 'C', bit: 1 }, // A1
  { port: 'C', bit: 2 }, // A2
  { port: 'C', bit: 3 }, // A3
  { port: 'C', bit: 4 }, // A4
  { port: 'C', bit: 5 }, // A5
];

export interface AVRCallbacks {
  onPinWrite?: (pin: number, value: boolean) => void;
  onPWMWrite?: (pin: number, value: number) => void;
  onSerialWrite?: (data: string) => void;
  onDelayStart?: (microseconds: number) => void;
  onDelayEnd?: () => void;
}

export interface AVRState {
  registers: Uint8Array;
  sram: Uint8Array;
  flash: Uint8Array;
  eeprom: Uint8Array;
  pc: number;
  sp: number;
  sreg: number;
  cycles: number;
}

/**
 * AVR Bridge class for interfacing with WASM AVR emulator
 */
export class AVRBridge {
  private engine: SimulationEngine;
  private arduinoId: string;
  private callbacks: AVRCallbacks;
  private state: AVRState;
  private serialBuffer: string = '';
  private running: boolean = false;
  private wasmInstance: WebAssembly.Instance | null = null;

  constructor(
    engine: SimulationEngine,
    arduinoId: string,
    callbacks: AVRCallbacks = {}
  ) {
    this.engine = engine;
    this.arduinoId = arduinoId;
    this.callbacks = callbacks;

    // Initialize AVR state
    this.state = {
      registers: new Uint8Array(32),
      sram: new Uint8Array(2048),
      flash: new Uint8Array(32768),
      eeprom: new Uint8Array(1024),
      pc: 0,
      sp: 0x08FF, // Stack pointer starts at top of SRAM
      sreg: 0,
      cycles: 0,
    };
  }

  /**
   * Load compiled HEX data into flash memory
   */
  loadHex(hexData: Uint8Array): void {
    // Parse Intel HEX format and load into flash
    this.state.flash.fill(0xFF); // Flash erased state
    this.state.flash.set(hexData.slice(0, this.state.flash.length));
    this.state.pc = 0;
    this.state.sp = 0x08FF;
  }

  /**
   * Load compiled ELF data
   */
  loadElf(elfData: Uint8Array): void {
    // ELF parsing would go here
    // For now, extract .text section and load to flash
    this.loadHex(elfData);
  }

  /**
   * Initialize WASM AVR runtime
   */
  async initWasm(wasmUrl: string): Promise<void> {
    const imports = {
      env: {
        // Memory access
        memory: new WebAssembly.Memory({ initial: 256 }),

        // I/O callbacks
        avr_pin_write: (pin: number, value: number) => {
          this.handlePinWrite(pin, value !== 0);
        },
        avr_pwm_write: (pin: number, value: number) => {
          this.handlePWMWrite(pin, value);
        },
        avr_serial_write: (char: number) => {
          this.handleSerialWrite(char);
        },
        avr_delay_us: (us: number) => {
          this.handleDelay(us);
        },
        avr_digital_read: (pin: number): number => {
          return this.handleDigitalRead(pin) ? 1 : 0;
        },
        avr_analog_read: (pin: number): number => {
          return this.handleAnalogRead(pin);
        },

        // Timing
        avr_micros: (): number => {
          return Math.floor(this.engine.getCurrentTime() * 1_000_000);
        },
        avr_millis: (): number => {
          return Math.floor(this.engine.getCurrentTime() * 1000);
        },
      },
    };

    try {
      const response = await fetch(wasmUrl);
      const wasmBytes = await response.arrayBuffer();
      const wasmModule = await WebAssembly.compile(wasmBytes);
      this.wasmInstance = await WebAssembly.instantiate(wasmModule, imports);
    } catch (error) {
      console.error('Failed to initialize AVR WASM:', error);
      throw error;
    }
  }

  /**
   * Handle digital pin write from AVR
   */
  private handlePinWrite(pin: number, value: boolean): void {
    const arduino = this.engine.getComponent(this.arduinoId);
    if (!arduino) return;

    // Find the corresponding pin
    const pinName = this.getPinName(pin);
    const componentPin = arduino.pins.find((p) => p.name.includes(pinName));

    if (componentPin) {
      this.engine.digitalWrite(this.arduinoId, componentPin.id, value);
    }

    this.callbacks.onPinWrite?.(pin, value);
  }

  /**
   * Handle PWM write from AVR
   */
  private handlePWMWrite(pin: number, value: number): void {
    const arduino = this.engine.getComponent(this.arduinoId);
    if (!arduino) return;

    const pinName = this.getPinName(pin);
    const componentPin = arduino.pins.find((p) => p.name.includes(pinName));

    if (componentPin) {
      this.engine.analogWrite(this.arduinoId, componentPin.id, value);
    }

    this.callbacks.onPWMWrite?.(pin, value);
  }

  /**
   * Handle serial write from AVR
   */
  private handleSerialWrite(char: number): void {
    const charStr = String.fromCharCode(char);
    this.serialBuffer += charStr;

    // Flush on newline
    if (char === 10) {
      // \n
      this.engine.serialWrite(this.serialBuffer);
      this.callbacks.onSerialWrite?.(this.serialBuffer);
      this.serialBuffer = '';
    }
  }

  /**
   * Handle delay from AVR
   */
  private handleDelay(microseconds: number): void {
    this.callbacks.onDelayStart?.(microseconds);

    // In real implementation, this would yield to allow UI updates
    // For simulation, we advance the simulation time
    const delaySeconds = microseconds / 1_000_000;
    // Note: actual delay handling would be async
  }

  /**
   * Handle digital read from AVR
   */
  private handleDigitalRead(pin: number): boolean {
    const arduino = this.engine.getComponent(this.arduinoId);
    if (!arduino) return false;

    const pinName = this.getPinName(pin);
    const componentPin = arduino.pins.find((p) => p.name.includes(pinName));

    if (componentPin) {
      return this.engine.digitalRead(this.arduinoId, componentPin.id);
    }

    return false;
  }

  /**
   * Handle analog read from AVR
   */
  private handleAnalogRead(pin: number): number {
    const arduino = this.engine.getComponent(this.arduinoId);
    if (!arduino) return 0;

    // Analog pins are A0-A5 (pins 14-19)
    const analogPin = pin + 14;
    const pinName = `A${pin}`;
    const componentPin = arduino.pins.find((p) => p.name === pinName);

    if (componentPin) {
      return this.engine.analogRead(this.arduinoId, componentPin.id);
    }

    return 0;
  }

  /**
   * Get pin name from pin number
   */
  private getPinName(pin: number): string {
    if (pin >= 0 && pin <= 13) {
      return `D${pin}`;
    }
    if (pin >= 14 && pin <= 19) {
      return `A${pin - 14}`;
    }
    return `D${pin}`;
  }

  /**
   * Set pin mode from AVR code
   */
  setPinMode(pin: number, mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'): void {
    const arduino = this.engine.getComponent(this.arduinoId);
    if (!arduino) return;

    const pinName = this.getPinName(pin);
    const componentPin = arduino.pins.find((p) => p.name.includes(pinName));

    if (componentPin) {
      let pinMode: PinMode;
      switch (mode) {
        case 'INPUT':
          pinMode = PinMode.INPUT;
          break;
        case 'OUTPUT':
          pinMode = PinMode.OUTPUT;
          break;
        case 'INPUT_PULLUP':
          pinMode = PinMode.INPUT_PULLUP;
          break;
      }
      this.engine.setPinMode(this.arduinoId, componentPin.id, pinMode);
    }
  }

  /**
   * Start AVR execution
   */
  start(): void {
    this.running = true;
    this.execute();
  }

  /**
   * Stop AVR execution
   */
  stop(): void {
    this.running = false;
  }

  /**
   * Reset AVR state
   */
  reset(): void {
    this.state.pc = 0;
    this.state.sp = 0x08FF;
    this.state.sreg = 0;
    this.state.registers.fill(0);
    this.state.sram.fill(0);
    this.state.cycles = 0;
    this.serialBuffer = '';
  }

  /**
   * Execute AVR instructions
   */
  private execute(): void {
    if (!this.running) return;

    if (this.wasmInstance) {
      // Call WASM execution function
      const run = this.wasmInstance.exports.run as Function;
      run();
    } else {
      // Fallback: software emulation would go here
      this.softwareExecute();
    }

    // Schedule next execution frame
    if (this.running) {
      requestAnimationFrame(() => this.execute());
    }
  }

  /**
   * Software AVR emulation (fallback when WASM not available)
   */
  private softwareExecute(): void {
    // This would contain a full AVR instruction set implementation
    // For now, it's a placeholder
    const instructionsPerFrame = 16000; // ~1ms at 16MHz

    for (let i = 0; i < instructionsPerFrame && this.running; i++) {
      this.executeInstruction();
    }
  }

  /**
   * Execute a single AVR instruction
   */
  private executeInstruction(): void {
    // Fetch instruction from flash
    const instruction =
      (this.state.flash[this.state.pc * 2] |
        (this.state.flash[this.state.pc * 2 + 1] << 8)) >>>
      0;

    // Increment program counter
    this.state.pc++;
    this.state.cycles++;

    // Decode and execute instruction
    // This is a simplified subset for demonstration
    this.decodeAndExecute(instruction);
  }

  /**
   * Decode and execute an AVR instruction
   */
  private decodeAndExecute(opcode: number): void {
    // NOP
    if (opcode === 0x0000) {
      return;
    }

    // SBI - Set Bit in I/O Register
    if ((opcode & 0xFF00) === 0x9A00) {
      const A = (opcode >> 3) & 0x1F;
      const b = opcode & 0x07;
      // Set bit b in I/O register A
      this.setIOBit(A, b, true);
      return;
    }

    // CBI - Clear Bit in I/O Register
    if ((opcode & 0xFF00) === 0x9800) {
      const A = (opcode >> 3) & 0x1F;
      const b = opcode & 0x07;
      this.setIOBit(A, b, false);
      return;
    }

    // OUT - Store Register to I/O Location
    if ((opcode & 0xF800) === 0xB800) {
      const A = ((opcode >> 5) & 0x30) | (opcode & 0x0F);
      const Rr = (opcode >> 4) & 0x1F;
      this.writeIO(A, this.state.registers[Rr]);
      return;
    }

    // IN - Load I/O Location to Register
    if ((opcode & 0xF800) === 0xB000) {
      const A = ((opcode >> 5) & 0x30) | (opcode & 0x0F);
      const Rd = (opcode >> 4) & 0x1F;
      this.state.registers[Rd] = this.readIO(A);
      return;
    }

    // LDI - Load Immediate
    if ((opcode & 0xF000) === 0xE000) {
      const K = ((opcode >> 4) & 0xF0) | (opcode & 0x0F);
      const Rd = ((opcode >> 4) & 0x0F) + 16;
      this.state.registers[Rd] = K;
      return;
    }

    // RJMP - Relative Jump
    if ((opcode & 0xF000) === 0xC000) {
      let k = opcode & 0x0FFF;
      if (k & 0x0800) k |= 0xFFFFF000; // Sign extend
      this.state.pc += k;
      return;
    }

    // RCALL - Relative Call
    if ((opcode & 0xF000) === 0xD000) {
      let k = opcode & 0x0FFF;
      if (k & 0x0800) k |= 0xFFFFF000;
      // Push return address
      this.state.sram[this.state.sp--] = this.state.pc & 0xFF;
      this.state.sram[this.state.sp--] = (this.state.pc >> 8) & 0xFF;
      this.state.pc += k;
      return;
    }

    // RET - Return from Subroutine
    if (opcode === 0x9508) {
      const high = this.state.sram[++this.state.sp];
      const low = this.state.sram[++this.state.sp];
      this.state.pc = (high << 8) | low;
      return;
    }
  }

  /**
   * Read from I/O register
   */
  private readIO(address: number): number {
    // Map to actual register addresses
    const regAddr = address + 0x20;

    // Handle special registers
    switch (regAddr) {
      case AVR_REGISTERS.PINB:
        return this.readPortPins('B');
      case AVR_REGISTERS.PINC:
        return this.readPortPins('C');
      case AVR_REGISTERS.PIND:
        return this.readPortPins('D');
      default:
        return this.state.sram[regAddr];
    }
  }

  /**
   * Write to I/O register
   */
  private writeIO(address: number, value: number): void {
    const regAddr = address + 0x20;
    this.state.sram[regAddr] = value;

    // Handle special registers
    switch (regAddr) {
      case AVR_REGISTERS.PORTB:
        this.writePort('B', value);
        break;
      case AVR_REGISTERS.PORTC:
        this.writePort('C', value);
        break;
      case AVR_REGISTERS.PORTD:
        this.writePort('D', value);
        break;
      case AVR_REGISTERS.DDRB:
      case AVR_REGISTERS.DDRC:
      case AVR_REGISTERS.DDRD:
        // Data direction register - handled by pinMode
        break;
      case AVR_REGISTERS.UDR0:
        // Serial data register
        this.handleSerialWrite(value);
        break;
    }
  }

  /**
   * Set/clear bit in I/O register
   */
  private setIOBit(address: number, bit: number, value: boolean): void {
    const current = this.readIO(address);
    const newValue = value
      ? current | (1 << bit)
      : current & ~(1 << bit);
    this.writeIO(address, newValue);
  }

  /**
   * Read port pins state
   */
  private readPortPins(port: 'B' | 'C' | 'D'): number {
    let value = 0;

    for (let bit = 0; bit < 8; bit++) {
      const pinIndex = PIN_MAP.findIndex(
        (p) => p.port === port && p.bit === bit
      );
      if (pinIndex !== -1) {
        if (this.handleDigitalRead(pinIndex)) {
          value |= 1 << bit;
        }
      }
    }

    return value;
  }

  /**
   * Write to port
   */
  private writePort(port: 'B' | 'C' | 'D', value: number): void {
    for (let bit = 0; bit < 8; bit++) {
      const pinIndex = PIN_MAP.findIndex(
        (p) => p.port === port && p.bit === bit
      );
      if (pinIndex !== -1) {
        const bitValue = (value & (1 << bit)) !== 0;
        this.handlePinWrite(pinIndex, bitValue);
      }
    }
  }

  /**
   * Get current execution state
   */
  getState(): AVRState {
    return { ...this.state };
  }

  /**
   * Check if AVR is running
   */
  isRunning(): boolean {
    return this.running;
  }
}
