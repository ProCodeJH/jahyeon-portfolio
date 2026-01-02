/**
 * LED Component Definition
 * Supports standard LEDs and RGB LEDs with accurate behavior
 */

import type {
  Component,
  ComponentPin,
  ComponentTransform,
  PinMode,
  PinState,
  Voltage,
  Current,
  ComponentType,
} from '../core/types';

// LED physical dimensions (in mm)
export const LED_DIMENSIONS = {
  // 5mm standard LED
  '5mm': {
    diameter: 5,
    height: 8.6,
    leadSpacing: 2.54,
    anodeLead: 3,
    cathodeLead: 2.5,
    lensHeight: 4.5,
  },
  // 3mm standard LED
  '3mm': {
    diameter: 3,
    height: 5.3,
    leadSpacing: 2.54,
    anodeLead: 3,
    cathodeLead: 2.5,
    lensHeight: 2.5,
  },
};

// LED color specifications (forward voltage and wavelength)
export const LED_COLORS = {
  red: { forwardVoltage: 1.8, wavelength: 620, hex: '#ff0000' },
  orange: { forwardVoltage: 2.0, wavelength: 590, hex: '#ff8000' },
  yellow: { forwardVoltage: 2.1, wavelength: 585, hex: '#ffff00' },
  green: { forwardVoltage: 2.2, wavelength: 525, hex: '#00ff00' },
  blue: { forwardVoltage: 3.2, wavelength: 470, hex: '#0000ff' },
  white: { forwardVoltage: 3.2, wavelength: 0, hex: '#ffffff' },
  pink: { forwardVoltage: 3.2, wavelength: 0, hex: '#ff69b4' },
  uv: { forwardVoltage: 3.4, wavelength: 395, hex: '#8000ff' },
  ir: { forwardVoltage: 1.2, wavelength: 940, hex: '#300000' },
};

export type LedColor = keyof typeof LED_COLORS;
export type LedSize = keyof typeof LED_DIMENSIONS;

export interface LedState {
  brightness: number; // 0-1
  isOn: boolean;
  current: Current;
}

/**
 * Calculate LED brightness based on current
 */
export function calculateBrightness(current: Current): number {
  // LEDs typically have a non-linear response
  // Typical LED operates at 10-20mA
  const maxCurrent = 0.02; // 20mA
  const minVisible = 0.001; // 1mA

  if (current < minVisible) return 0;
  if (current > maxCurrent) return 1;

  // Apply gamma correction for perceived brightness
  const normalized = (current - minVisible) / (maxCurrent - minVisible);
  return Math.pow(normalized, 0.45); // Gamma 2.2 inverse
}

/**
 * Calculate current through LED given voltage and resistance
 */
export function calculateLedCurrent(
  voltage: Voltage,
  forwardVoltage: Voltage,
  resistance: number
): Current {
  if (voltage <= forwardVoltage) return 0;
  return (voltage - forwardVoltage) / resistance;
}

/**
 * Create a standard LED component
 */
export function createLed(
  id: string,
  color: LedColor = 'red',
  size: LedSize = '5mm',
  position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
): Component {
  const colorSpec = LED_COLORS[color];
  const dims = LED_DIMENSIONS[size];

  const transform: ComponentTransform = {
    position,
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };

  const pins: ComponentPin[] = [
    {
      id: `${id}_anode`,
      name: 'anode',
      componentId: id,
      netId: null,
      mode: PinMode.INPUT,
      state: PinState.LOW,
      voltage: 0,
      current: 0,
    },
    {
      id: `${id}_cathode`,
      name: 'cathode',
      componentId: id,
      netId: null,
      mode: PinMode.INPUT,
      state: PinState.LOW,
      voltage: 0,
      current: 0,
    },
  ];

  return {
    id,
    type: ComponentType.LED,
    name: `${color.toUpperCase()} LED (${size})`,
    transform,
    pins,
    properties: {
      color,
      colorHex: colorSpec.hex,
      forwardVoltage: colorSpec.forwardVoltage,
      wavelength: colorSpec.wavelength,
      size,
      dimensions: dims,
      maxCurrent: 0.02, // 20mA
      brightness: 0,
      isOn: false,
    },
  };
}

/**
 * Create an RGB LED component
 */
export function createRgbLed(
  id: string,
  commonType: 'anode' | 'cathode' = 'cathode',
  size: LedSize = '5mm',
  position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
): Component {
  const dims = LED_DIMENSIONS[size];

  const transform: ComponentTransform = {
    position,
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };

  const pins: ComponentPin[] = [
    {
      id: `${id}_red`,
      name: 'red',
      componentId: id,
      netId: null,
      mode: PinMode.INPUT,
      state: PinState.LOW,
      voltage: 0,
      current: 0,
    },
    {
      id: `${id}_green`,
      name: 'green',
      componentId: id,
      netId: null,
      mode: PinMode.INPUT,
      state: PinState.LOW,
      voltage: 0,
      current: 0,
    },
    {
      id: `${id}_blue`,
      name: 'blue',
      componentId: id,
      netId: null,
      mode: PinMode.INPUT,
      state: PinState.LOW,
      voltage: 0,
      current: 0,
    },
    {
      id: `${id}_common`,
      name: commonType === 'anode' ? 'anode' : 'cathode',
      componentId: id,
      netId: null,
      mode: PinMode.INPUT,
      state: PinState.LOW,
      voltage: commonType === 'anode' ? 5 : 0,
      current: 0,
    },
  ];

  return {
    id,
    type: ComponentType.RGB_LED,
    name: `RGB LED (Common ${commonType})`,
    transform,
    pins,
    properties: {
      commonType,
      size,
      dimensions: dims,
      maxCurrent: 0.02,
      redBrightness: 0,
      greenBrightness: 0,
      blueBrightness: 0,
      forwardVoltages: {
        red: LED_COLORS.red.forwardVoltage,
        green: LED_COLORS.green.forwardVoltage,
        blue: LED_COLORS.blue.forwardVoltage,
      },
    },
  };
}

/**
 * Update LED state based on circuit conditions
 */
export function updateLedState(led: Component, seriesResistance: number = 220): LedState {
  const anode = led.pins.find((p) => p.name === 'anode');
  const cathode = led.pins.find((p) => p.name === 'cathode');

  if (!anode || !cathode) {
    return { brightness: 0, isOn: false, current: 0 };
  }

  const voltageDrop = anode.voltage - cathode.voltage;
  const forwardVoltage = led.properties.forwardVoltage as number;

  if (voltageDrop < forwardVoltage) {
    return { brightness: 0, isOn: false, current: 0 };
  }

  const current = calculateLedCurrent(voltageDrop, forwardVoltage, seriesResistance);
  const brightness = calculateBrightness(current);

  return {
    brightness,
    isOn: brightness > 0,
    current,
  };
}

/**
 * Get LED emission color with brightness applied
 */
export function getLedEmissionColor(led: Component): string {
  const brightness = led.properties.brightness as number;
  const colorHex = led.properties.colorHex as string;

  // Parse hex color
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);

  // Apply brightness
  const br = Math.round(r * brightness);
  const bg = Math.round(g * brightness);
  const bb = Math.round(b * brightness);

  return `rgb(${br}, ${bg}, ${bb})`;
}
