/**
 * Button/Tactile Switch Component Definition
 * Supports momentary push buttons and toggle switches
 */

import type {
  Component,
  ComponentPin,
  ComponentTransform,
  PinMode,
  PinState,
  ComponentType,
} from '../core/types';

// Button physical dimensions (in mm)
export const BUTTON_DIMENSIONS = {
  // 6mm tactile switch (most common)
  '6mm': {
    width: 6,
    height: 6,
    bodyHeight: 3.5,
    buttonHeight: 1.5,
    pinSpacing: 2.54,
    pinWidth: 4.5,
    pinLength: 3.5,
  },
  // 12mm tactile switch
  '12mm': {
    width: 12,
    height: 12,
    bodyHeight: 4.3,
    buttonHeight: 2.5,
    pinSpacing: 5.08,
    pinWidth: 7.5,
    pinLength: 3.5,
  },
};

// Button colors for cap
export const BUTTON_COLORS = {
  black: '#1a1a1a',
  red: '#dc2626',
  green: '#16a34a',
  blue: '#2563eb',
  yellow: '#eab308',
  white: '#f5f5f5',
};

export type ButtonSize = keyof typeof BUTTON_DIMENSIONS;
export type ButtonColor = keyof typeof BUTTON_COLORS;

export interface ButtonState {
  pressed: boolean;
  lastPressTime: number;
  debounceActive: boolean;
}

/**
 * Create a momentary push button component
 *
 * Pin layout (standard 4-pin tactile switch):
 *   1 ---- 2
 *   |  []  |
 *   3 ---- 4
 *
 * Pins 1-2 are connected internally
 * Pins 3-4 are connected internally
 * When pressed, 1-2 connects to 3-4
 */
export function createButton(
  id: string,
  size: ButtonSize = '6mm',
  color: ButtonColor = 'black',
  position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
): Component {
  const dims = BUTTON_DIMENSIONS[size];

  const transform: ComponentTransform = {
    position,
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };

  // 4-pin tactile switch
  const pins: ComponentPin[] = [
    {
      id: `${id}_pin1`,
      name: 'pin1',
      componentId: id,
      netId: null,
      mode: PinMode.INPUT,
      state: PinState.HIGH_Z,
      voltage: 0,
      current: 0,
    },
    {
      id: `${id}_pin2`,
      name: 'pin2',
      componentId: id,
      netId: null,
      mode: PinMode.INPUT,
      state: PinState.HIGH_Z,
      voltage: 0,
      current: 0,
    },
    {
      id: `${id}_pin3`,
      name: 'pin3',
      componentId: id,
      netId: null,
      mode: PinMode.INPUT,
      state: PinState.HIGH_Z,
      voltage: 0,
      current: 0,
    },
    {
      id: `${id}_pin4`,
      name: 'pin4',
      componentId: id,
      netId: null,
      mode: PinMode.INPUT,
      state: PinState.HIGH_Z,
      voltage: 0,
      current: 0,
    },
  ];

  return {
    id,
    type: ComponentType.BUTTON,
    name: `Push Button (${size})`,
    transform,
    pins,
    properties: {
      size,
      dimensions: dims,
      color,
      colorHex: BUTTON_COLORS[color],
      pressed: false,
      momentary: true,
      debounceTime: 50, // 50ms debounce
      lastPressTime: 0,
    },
  };
}

/**
 * Create a 2-pin simple button (for breadboard use)
 */
export function createSimpleButton(
  id: string,
  size: ButtonSize = '6mm',
  color: ButtonColor = 'black',
  position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
): Component {
  const dims = BUTTON_DIMENSIONS[size];

  const transform: ComponentTransform = {
    position,
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };

  const pins: ComponentPin[] = [
    {
      id: `${id}_a`,
      name: 'a',
      componentId: id,
      netId: null,
      mode: PinMode.INPUT,
      state: PinState.HIGH_Z,
      voltage: 0,
      current: 0,
    },
    {
      id: `${id}_b`,
      name: 'b',
      componentId: id,
      netId: null,
      mode: PinMode.INPUT,
      state: PinState.HIGH_Z,
      voltage: 0,
      current: 0,
    },
  ];

  return {
    id,
    type: ComponentType.BUTTON,
    name: `Push Button (${size})`,
    transform,
    pins,
    properties: {
      size,
      dimensions: dims,
      color,
      colorHex: BUTTON_COLORS[color],
      pressed: false,
      momentary: true,
      debounceTime: 50,
      lastPressTime: 0,
      simpleButton: true,
    },
  };
}

/**
 * Press the button (momentary action start)
 */
export function pressButton(button: Component): void {
  const now = Date.now();
  const debounceTime = button.properties.debounceTime as number;
  const lastPress = button.properties.lastPressTime as number;

  // Debounce check
  if (now - lastPress < debounceTime) {
    return;
  }

  button.properties.pressed = true;
  button.properties.lastPressTime = now;

  // When pressed, all pins are connected
  // Set all pins to match the highest voltage input
  let maxVoltage = 0;
  for (const pin of button.pins) {
    if (pin.voltage > maxVoltage) {
      maxVoltage = pin.voltage;
    }
  }

  for (const pin of button.pins) {
    pin.voltage = maxVoltage;
    pin.state = maxVoltage > 2.5 ? PinState.HIGH : PinState.LOW;
  }
}

/**
 * Release the button (momentary action end)
 */
export function releaseButton(button: Component): void {
  button.properties.pressed = false;

  // When released, internal connections break
  // For 4-pin: 1-2 stay connected, 3-4 stay connected
  // For 2-pin: pins disconnect
  const isSimple = button.properties.simpleButton as boolean;

  if (isSimple) {
    // Both pins go high-Z
    for (const pin of button.pins) {
      pin.state = PinState.HIGH_Z;
    }
  } else {
    // 4-pin: pins 1-2 share voltage, pins 3-4 share voltage
    const pin1 = button.pins.find((p) => p.name === 'pin1');
    const pin2 = button.pins.find((p) => p.name === 'pin2');
    const pin3 = button.pins.find((p) => p.name === 'pin3');
    const pin4 = button.pins.find((p) => p.name === 'pin4');

    if (pin1 && pin2) {
      const v12 = Math.max(pin1.voltage, pin2.voltage);
      pin1.voltage = v12;
      pin2.voltage = v12;
    }
    if (pin3 && pin4) {
      const v34 = Math.max(pin3.voltage, pin4.voltage);
      pin3.voltage = v34;
      pin4.voltage = v34;
    }
  }
}

/**
 * Check if button is currently pressed
 */
export function isButtonPressed(button: Component): boolean {
  return button.properties.pressed as boolean;
}

/**
 * Get the connection state of a 4-pin button
 * Returns which pin pairs are connected
 */
export function getButtonConnections(
  button: Component
): { pin12: boolean; pin34: boolean; cross: boolean } {
  const pressed = button.properties.pressed as boolean;
  const isSimple = button.properties.simpleButton as boolean;

  if (isSimple) {
    return { pin12: false, pin34: false, cross: pressed };
  }

  return {
    pin12: true, // Always connected
    pin34: true, // Always connected
    cross: pressed, // Connected only when pressed
  };
}

/**
 * Get internal net mappings for button
 * Used by netlist manager for proper signal propagation
 */
export function getButtonInternalNets(
  button: Component
): Map<string, string[]> {
  const pressed = button.properties.pressed as boolean;
  const isSimple = button.properties.simpleButton as boolean;
  const nets = new Map<string, string[]>();

  if (isSimple) {
    if (pressed) {
      nets.set('connected', [button.pins[0].id, button.pins[1].id]);
    }
    return nets;
  }

  // 4-pin button
  const pin1 = button.pins.find((p) => p.name === 'pin1')!;
  const pin2 = button.pins.find((p) => p.name === 'pin2')!;
  const pin3 = button.pins.find((p) => p.name === 'pin3')!;
  const pin4 = button.pins.find((p) => p.name === 'pin4')!;

  if (pressed) {
    // All pins connected when pressed
    nets.set('all', [pin1.id, pin2.id, pin3.id, pin4.id]);
  } else {
    // Only internal pairs connected
    nets.set('top', [pin1.id, pin2.id]);
    nets.set('bottom', [pin3.id, pin4.id]);
  }

  return nets;
}
