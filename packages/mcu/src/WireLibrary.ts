/**
 * Wire Library for Arduino Runtime
 * Emulates the Arduino Wire.h library (I2C communication)
 *
 * Supports:
 * - begin() - Initialize I2C
 * - beginTransmission(address) - Start transmission
 * - write(data) - Write byte/buffer
 * - endTransmission() - End transmission
 * - requestFrom(address, quantity) - Request data
 * - available() - Check bytes available
 * - read() - Read byte
 */

import type { ArduinoRuntime } from './ArduinoRuntime';

/**
 * Wire class (I2C)
 */
export class WireClass {
  private runtime: ArduinoRuntime | null = null;
  private initialized: boolean = false;

  // Transmission state
  private transmitting: boolean = false;
  private transmitAddress: number = 0;
  private transmitBuffer: number[] = [];

  // Receive state
  private receiveBuffer: number[] = [];
  private receiveIndex: number = 0;

  // I2C pins (Arduino UNO)
  private readonly SDA_PIN = 18; // A4
  private readonly SCL_PIN = 19; // A5

  /**
   * Initialize I2C as master
   */
  begin(runtime: ArduinoRuntime): void {
    this.runtime = runtime;
    this.initialized = true;

    // Set SDA and SCL pins (not actually used in simulation for now)
    console.log(`[Wire] I2C initialized (SDA: A4, SCL: A5)`);
  }

  /**
   * Initialize I2C as slave (not implemented)
   */
  begin_slave(address: number, runtime: ArduinoRuntime): void {
    this.runtime = runtime;
    this.initialized = true;
    console.log(`[Wire] I2C slave mode at address ${address} (not fully implemented)`);
  }

  /**
   * Begin transmission to device
   */
  beginTransmission(address: number): void {
    if (!this.initialized) {
      console.warn('[Wire] Not initialized');
      return;
    }

    this.transmitting = true;
    this.transmitAddress = address;
    this.transmitBuffer = [];

    console.log(`[Wire] Begin transmission to 0x${address.toString(16)}`);
  }

  /**
   * Write byte to transmit buffer
   */
  write(data: number | number[] | string): number {
    if (!this.transmitting) {
      console.warn('[Wire] Not in transmission mode');
      return 0;
    }

    if (typeof data === 'number') {
      // Write single byte
      this.transmitBuffer.push(data & 0xFF);
      return 1;
    } else if (Array.isArray(data)) {
      // Write buffer
      for (const byte of data) {
        this.transmitBuffer.push(byte & 0xFF);
      }
      return data.length;
    } else if (typeof data === 'string') {
      // Write string
      for (let i = 0; i < data.length; i++) {
        this.transmitBuffer.push(data.charCodeAt(i) & 0xFF);
      }
      return data.length;
    }

    return 0;
  }

  /**
   * End transmission and send data
   */
  endTransmission(sendStop: boolean = true): number {
    if (!this.transmitting) {
      console.warn('[Wire] Not in transmission mode');
      return 4; // Error: other
    }

    this.transmitting = false;

    console.log(`[Wire] End transmission to 0x${this.transmitAddress.toString(16)}: [${this.transmitBuffer.join(', ')}]`);

    // Simulate successful transmission
    // In real implementation, this would communicate with I2C devices
    this.transmitBuffer = [];

    // Return codes:
    // 0: success
    // 1: data too long
    // 2: NACK on address
    // 3: NACK on data
    // 4: other error
    return 0; // Success
  }

  /**
   * Request data from device
   */
  requestFrom(address: number, quantity: number, sendStop: boolean = true): number {
    if (!this.initialized) {
      console.warn('[Wire] Not initialized');
      return 0;
    }

    console.log(`[Wire] Request ${quantity} bytes from 0x${address.toString(16)}`);

    // Simulate receiving data
    // In real implementation, this would read from I2C devices
    this.receiveBuffer = [];
    this.receiveIndex = 0;

    // For now, just fill with dummy data
    for (let i = 0; i < quantity; i++) {
      this.receiveBuffer.push(0);
    }

    return quantity;
  }

  /**
   * Check bytes available in receive buffer
   */
  available(): number {
    return this.receiveBuffer.length - this.receiveIndex;
  }

  /**
   * Read byte from receive buffer
   */
  read(): number {
    if (this.receiveIndex >= this.receiveBuffer.length) {
      return -1;
    }

    const byte = this.receiveBuffer[this.receiveIndex];
    this.receiveIndex++;
    return byte;
  }

  /**
   * Set clock frequency (not implemented)
   */
  setClock(frequency: number): void {
    console.log(`[Wire] Set clock to ${frequency} Hz (simulated)`);
  }

  /**
   * Peek at next byte without removing
   */
  peek(): number {
    if (this.receiveIndex >= this.receiveBuffer.length) {
      return -1;
    }

    return this.receiveBuffer[this.receiveIndex];
  }

  /**
   * Flush (no-op in simulation)
   */
  flush(): void {
    // No-op
  }
}

/**
 * Create Wire instance
 */
export function createWire(): WireClass {
  return new WireClass();
}

// Global Wire instance (singleton like Arduino)
export const Wire = new WireClass();
