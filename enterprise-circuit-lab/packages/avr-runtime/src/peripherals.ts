/**
 * AVR Peripheral Bridges
 * Connect AVR peripherals (GPIO, PWM, UART) to circuit simulation
 */

export interface GPIOBridge {
  pinMode(pin: number, mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'): void;
  digitalWrite(pin: number, value: boolean): void;
  digitalRead(pin: number): boolean;
}

export interface PWMBridge {
  analogWrite(pin: number, value: number): void; // 0-255
}

export interface UARTBridge {
  write(data: string): void;
  onData(callback: (data: string) => void): void;
}

export class ArduinoUnoPeripherals implements GPIOBridge, PWMBridge, UARTBridge {
  private pinModes: Map<number, string> = new Map();
  private pinStates: Map<number, boolean> = new Map();
  private pwmValues: Map<number, number> = new Map();
  private uartCallbacks: Array<(data: string) => void> = [];

  // GPIO
  pinMode(pin: number, mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'): void {
    this.pinModes.set(pin, mode);
    // TODO: Phase 1.3 - Notify circuit simulation
  }

  digitalWrite(pin: number, value: boolean): void {
    this.pinStates.set(pin, value);
    // TODO: Phase 1.3 - Update circuit net state
  }

  digitalRead(pin: number): boolean {
    // TODO: Phase 1.3 - Read from circuit simulation
    return this.pinStates.get(pin) || false;
  }

  // PWM (pins 3, 5, 6, 9, 10, 11 on UNO)
  analogWrite(pin: number, value: number): void {
    this.pwmValues.set(pin, value);
    // TODO: Phase 1.3 - Update PWM flow visualization
  }

  // UART
  write(data: string): void {
    this.uartCallbacks.forEach((cb) => cb(data));
  }

  onData(callback: (data: string) => void): void {
    this.uartCallbacks.push(callback);
  }
}
