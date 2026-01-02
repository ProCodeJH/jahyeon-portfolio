/**
 * Arduino UNO Component Definition
 * Accurate pin layout matching real Arduino UNO R3
 */

import type {
  Component,
  ComponentPin,
  ComponentTransform,
  ArduinoPin,
  PinMode,
  PinState,
  ComponentType,
} from '../core/types';

// Arduino UNO R3 physical dimensions (in mm)
export const ARDUINO_DIMENSIONS = {
  width: 68.6,
  height: 53.4,
  boardThickness: 1.6,
  headerHeight: 8.5,
  pinSpacing: 2.54, // Standard 0.1" spacing
  powerHeaderX: 7.62,
  digitalHeaderX: 53.34,
  analogHeaderX: 40.64,
};

// Pin definitions matching real Arduino UNO R3
export const ARDUINO_UNO_PINS: ArduinoPin[] = [
  // Power header (left side, bottom to top)
  { number: -1, name: 'IOREF', type: 'power', mode: PinMode.OUTPUT, state: PinState.HIGH, voltage: 5.0 },
  { number: -2, name: 'RESET', type: 'special', mode: PinMode.INPUT, state: PinState.HIGH, voltage: 5.0 },
  { number: -3, name: '3V3', type: 'power', mode: PinMode.OUTPUT, state: PinState.HIGH, voltage: 3.3 },
  { number: -4, name: '5V', type: 'power', mode: PinMode.OUTPUT, state: PinState.HIGH, voltage: 5.0 },
  { number: -5, name: 'GND1', type: 'ground', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: -6, name: 'GND2', type: 'ground', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: -7, name: 'VIN', type: 'power', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },

  // Analog pins (A0-A5)
  { number: 14, name: 'A0', type: 'analog', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 15, name: 'A1', type: 'analog', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 16, name: 'A2', type: 'analog', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 17, name: 'A3', type: 'analog', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 18, name: 'A4', type: 'analog', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 19, name: 'A5', type: 'analog', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },

  // Digital pins (0-13)
  { number: 0, name: 'D0/RX', type: 'digital', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 1, name: 'D1/TX', type: 'digital', mode: PinMode.OUTPUT, state: PinState.LOW, voltage: 0 },
  { number: 2, name: 'D2', type: 'digital', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0, interruptEnabled: false },
  { number: 3, name: 'D3~', type: 'pwm', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 4, name: 'D4', type: 'digital', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 5, name: 'D5~', type: 'pwm', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 6, name: 'D6~', type: 'pwm', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 7, name: 'D7', type: 'digital', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 8, name: 'D8', type: 'digital', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 9, name: 'D9~', type: 'pwm', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 10, name: 'D10~', type: 'pwm', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 11, name: 'D11~', type: 'pwm', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 12, name: 'D12', type: 'digital', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: 13, name: 'D13', type: 'digital', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 }, // Built-in LED

  // Additional ground pins
  { number: -8, name: 'GND3', type: 'ground', mode: PinMode.INPUT, state: PinState.LOW, voltage: 0 },
  { number: -9, name: 'AREF', type: 'special', mode: PinMode.INPUT, state: PinState.LOW, voltage: 5.0 },
];

// PWM-capable pin numbers
export const PWM_PINS = [3, 5, 6, 9, 10, 11];

// Interrupt-capable pins
export const INTERRUPT_PINS = [2, 3];

// Pin positions relative to board origin (bottom-left corner)
export const PIN_POSITIONS: Record<string, { x: number; y: number; z: number }> = {
  // Power header (left side)
  'IOREF': { x: 3.81, y: 50.8, z: 1.6 },
  'RESET': { x: 3.81, y: 48.26, z: 1.6 },
  '3V3': { x: 3.81, y: 45.72, z: 1.6 },
  '5V': { x: 3.81, y: 43.18, z: 1.6 },
  'GND1': { x: 3.81, y: 40.64, z: 1.6 },
  'GND2': { x: 3.81, y: 38.1, z: 1.6 },
  'VIN': { x: 3.81, y: 35.56, z: 1.6 },

  // Analog pins (left side, lower)
  'A0': { x: 3.81, y: 26.67, z: 1.6 },
  'A1': { x: 3.81, y: 24.13, z: 1.6 },
  'A2': { x: 3.81, y: 21.59, z: 1.6 },
  'A3': { x: 3.81, y: 19.05, z: 1.6 },
  'A4': { x: 3.81, y: 16.51, z: 1.6 },
  'A5': { x: 3.81, y: 13.97, z: 1.6 },

  // Digital pins (right side, top section 8-13 + GND + AREF)
  'D8': { x: 64.77, y: 50.8, z: 1.6 },
  'D9~': { x: 64.77, y: 48.26, z: 1.6 },
  'D10~': { x: 64.77, y: 45.72, z: 1.6 },
  'D11~': { x: 64.77, y: 43.18, z: 1.6 },
  'D12': { x: 64.77, y: 40.64, z: 1.6 },
  'D13': { x: 64.77, y: 38.1, z: 1.6 },
  'GND3': { x: 64.77, y: 35.56, z: 1.6 },
  'AREF': { x: 64.77, y: 33.02, z: 1.6 },

  // Digital pins (right side, bottom section 0-7)
  'D0/RX': { x: 64.77, y: 27.94, z: 1.6 },
  'D1/TX': { x: 64.77, y: 25.4, z: 1.6 },
  'D2': { x: 64.77, y: 22.86, z: 1.6 },
  'D3~': { x: 64.77, y: 20.32, z: 1.6 },
  'D4': { x: 64.77, y: 17.78, z: 1.6 },
  'D5~': { x: 64.77, y: 15.24, z: 1.6 },
  'D6~': { x: 64.77, y: 12.7, z: 1.6 },
  'D7': { x: 64.77, y: 10.16, z: 1.6 },
};

/**
 * Create an Arduino UNO component
 */
export function createArduinoUno(
  id: string,
  position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
): Component {
  const transform: ComponentTransform = {
    position,
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };

  const pins: ComponentPin[] = ARDUINO_UNO_PINS.map((arduinoPin, index) => ({
    id: `${id}_pin_${arduinoPin.name.replace(/[~/]/g, '_')}`,
    name: arduinoPin.name,
    componentId: id,
    netId: null,
    mode: arduinoPin.mode,
    state: arduinoPin.state,
    voltage: arduinoPin.voltage,
    current: 0,
    pwm: PWM_PINS.includes(arduinoPin.number)
      ? { enabled: false, dutyCycle: 0, frequency: 490.196 }
      : undefined,
  }));

  return {
    id,
    type: ComponentType.ARDUINO_UNO,
    name: 'Arduino UNO R3',
    transform,
    pins,
    properties: {
      clockSpeed: 16_000_000, // 16 MHz
      flashSize: 32768, // 32KB
      sramSize: 2048, // 2KB
      eepromSize: 1024, // 1KB
      builtInLedPin: 13,
      serialBaudRate: 9600,
    },
  };
}

/**
 * Get pin by number (0-19 for digital/analog, negative for power/special)
 */
export function getPinByNumber(arduino: Component, pinNumber: number): ComponentPin | undefined {
  const arduinoPin = ARDUINO_UNO_PINS.find((p) => p.number === pinNumber);
  if (!arduinoPin) return undefined;

  return arduino.pins.find((p) => p.name === arduinoPin.name);
}

/**
 * Get pin by name (e.g., 'D13', 'A0', '5V', 'GND')
 */
export function getPinByName(arduino: Component, pinName: string): ComponentPin | undefined {
  // Handle various naming conventions
  const normalizedName = pinName.toUpperCase();

  // Direct match
  let pin = arduino.pins.find((p) => p.name.toUpperCase() === normalizedName);
  if (pin) return pin;

  // Try without prefix
  if (normalizedName.startsWith('D')) {
    pin = arduino.pins.find((p) => p.name.includes(normalizedName.slice(1)));
  } else if (normalizedName.startsWith('A')) {
    pin = arduino.pins.find((p) => p.name.toUpperCase() === normalizedName);
  }

  return pin;
}

/**
 * Check if pin supports PWM
 */
export function isPWMPin(pinNumber: number): boolean {
  return PWM_PINS.includes(pinNumber);
}

/**
 * Check if pin supports interrupts
 */
export function isInterruptPin(pinNumber: number): boolean {
  return INTERRUPT_PINS.includes(pinNumber);
}

/**
 * Get the built-in LED pin (D13)
 */
export function getBuiltInLedPin(arduino: Component): ComponentPin | undefined {
  return arduino.pins.find((p) => p.name === 'D13');
}

/**
 * Get all power pins
 */
export function getPowerPins(arduino: Component): ComponentPin[] {
  return arduino.pins.filter((p) =>
    ['5V', '3V3', 'VIN', 'IOREF'].includes(p.name)
  );
}

/**
 * Get all ground pins
 */
export function getGroundPins(arduino: Component): ComponentPin[] {
  return arduino.pins.filter((p) => p.name.startsWith('GND'));
}
