/**
 * Resistor Component Definition
 * Supports through-hole resistors with color band encoding
 */

import type {
  Component,
  ComponentPin,
  ComponentTransform,
  PinMode,
  PinState,
  Resistance,
  ComponentType,
} from '../core/types';

// Resistor physical dimensions (in mm)
export const RESISTOR_DIMENSIONS = {
  // 1/4W axial resistor (most common)
  '1/4W': {
    bodyLength: 6.3,
    bodyDiameter: 2.3,
    leadLength: 28,
    leadDiameter: 0.5,
    totalLength: 10,
  },
  // 1/2W axial resistor
  '1/2W': {
    bodyLength: 9.2,
    bodyDiameter: 3.2,
    leadLength: 35,
    leadDiameter: 0.6,
    totalLength: 15,
  },
  // 1W axial resistor
  '1W': {
    bodyLength: 11.5,
    bodyDiameter: 4.5,
    leadLength: 35,
    leadDiameter: 0.8,
    totalLength: 18,
  },
};

// Color band values
export const COLOR_BANDS = {
  black: { digit: 0, multiplier: 1, tolerance: null, hex: '#000000' },
  brown: { digit: 1, multiplier: 10, tolerance: 1, hex: '#8B4513' },
  red: { digit: 2, multiplier: 100, tolerance: 2, hex: '#FF0000' },
  orange: { digit: 3, multiplier: 1000, tolerance: null, hex: '#FFA500' },
  yellow: { digit: 4, multiplier: 10000, tolerance: null, hex: '#FFFF00' },
  green: { digit: 5, multiplier: 100000, tolerance: 0.5, hex: '#00FF00' },
  blue: { digit: 6, multiplier: 1000000, tolerance: 0.25, hex: '#0000FF' },
  violet: { digit: 7, multiplier: 10000000, tolerance: 0.1, hex: '#EE82EE' },
  grey: { digit: 8, multiplier: 100000000, tolerance: 0.05, hex: '#808080' },
  white: { digit: 9, multiplier: 1000000000, tolerance: null, hex: '#FFFFFF' },
  gold: { digit: null, multiplier: 0.1, tolerance: 5, hex: '#FFD700' },
  silver: { digit: null, multiplier: 0.01, tolerance: 10, hex: '#C0C0C0' },
};

export type ColorBand = keyof typeof COLOR_BANDS;
export type ResistorSize = keyof typeof RESISTOR_DIMENSIONS;

// Standard E24 resistor values (±5%)
export const E24_VALUES = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
];

/**
 * Convert resistance value to color bands
 */
export function resistanceToColorBands(
  resistance: Resistance,
  tolerance: number = 5
): ColorBand[] {
  if (resistance <= 0) return ['black', 'black', 'black', 'gold'];

  // Normalize to find significant digits
  let value = resistance;
  let multiplierExponent = 0;

  while (value >= 100) {
    value /= 10;
    multiplierExponent++;
  }
  while (value < 10 && value > 0) {
    value *= 10;
    multiplierExponent--;
  }

  const firstDigit = Math.floor(value / 10);
  const secondDigit = Math.floor(value % 10);

  // Find matching colors
  const band1 = Object.entries(COLOR_BANDS).find(
    ([_, v]) => v.digit === firstDigit
  )?.[0] as ColorBand;
  const band2 = Object.entries(COLOR_BANDS).find(
    ([_, v]) => v.digit === secondDigit
  )?.[0] as ColorBand;

  // Find multiplier band
  const multiplier = Math.pow(10, multiplierExponent);
  const band3 = Object.entries(COLOR_BANDS).find(
    ([_, v]) => v.multiplier === multiplier
  )?.[0] as ColorBand;

  // Find tolerance band
  const band4 = Object.entries(COLOR_BANDS).find(
    ([_, v]) => v.tolerance === tolerance
  )?.[0] as ColorBand;

  return [
    band1 || 'black',
    band2 || 'black',
    band3 || 'black',
    band4 || 'gold',
  ];
}

/**
 * Convert color bands to resistance value
 */
export function colorBandsToResistance(bands: ColorBand[]): {
  resistance: Resistance;
  tolerance: number;
} {
  if (bands.length < 3) {
    return { resistance: 0, tolerance: 20 };
  }

  const band1 = COLOR_BANDS[bands[0]];
  const band2 = COLOR_BANDS[bands[1]];
  const band3 = COLOR_BANDS[bands[2]];
  const band4 = bands[3] ? COLOR_BANDS[bands[3]] : null;

  const digits = (band1.digit || 0) * 10 + (band2.digit || 0);
  const resistance = digits * (band3.multiplier || 1);
  const tolerance = band4?.tolerance || 20;

  return { resistance, tolerance };
}

/**
 * Format resistance value for display
 */
export function formatResistance(resistance: Resistance): string {
  if (resistance >= 1_000_000) {
    return `${(resistance / 1_000_000).toFixed(1)}MΩ`;
  }
  if (resistance >= 1000) {
    return `${(resistance / 1000).toFixed(1)}kΩ`;
  }
  return `${resistance}Ω`;
}

/**
 * Create a resistor component
 */
export function createResistor(
  id: string,
  resistance: Resistance = 220,
  tolerance: number = 5,
  size: ResistorSize = '1/4W',
  position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
): Component {
  const dims = RESISTOR_DIMENSIONS[size];
  const colorBands = resistanceToColorBands(resistance, tolerance);

  const transform: ComponentTransform = {
    position,
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };

  const pins: ComponentPin[] = [
    {
      id: `${id}_lead1`,
      name: 'lead1',
      componentId: id,
      netId: null,
      mode: PinMode.INPUT,
      state: PinState.LOW,
      voltage: 0,
      current: 0,
    },
    {
      id: `${id}_lead2`,
      name: 'lead2',
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
    type: ComponentType.RESISTOR,
    name: `Resistor ${formatResistance(resistance)}`,
    transform,
    pins,
    properties: {
      resistance,
      tolerance,
      size,
      dimensions: dims,
      colorBands,
      powerRating: size,
      maxPower: size === '1/4W' ? 0.25 : size === '1/2W' ? 0.5 : 1,
      currentPower: 0,
    },
  };
}

/**
 * Calculate power dissipation through resistor
 */
export function calculatePower(
  resistor: Component
): { power: number; overPower: boolean } {
  const lead1 = resistor.pins.find((p) => p.name === 'lead1');
  const lead2 = resistor.pins.find((p) => p.name === 'lead2');

  if (!lead1 || !lead2) {
    return { power: 0, overPower: false };
  }

  const voltage = Math.abs(lead1.voltage - lead2.voltage);
  const resistance = resistor.properties.resistance as number;
  const maxPower = resistor.properties.maxPower as number;

  const power = (voltage * voltage) / resistance;
  const overPower = power > maxPower;

  return { power, overPower };
}

/**
 * Get the nearest standard resistor value
 */
export function getNearestStandardValue(resistance: Resistance): Resistance {
  // Find the decade
  let decade = 1;
  while (resistance >= 10 * decade) {
    decade *= 10;
  }
  while (resistance < decade && decade > 1) {
    decade /= 10;
  }

  // Find nearest E24 value
  let nearestValue = E24_VALUES[0] * decade;
  let minDiff = Math.abs(resistance - nearestValue);

  for (const e24 of E24_VALUES) {
    const value = e24 * decade;
    const diff = Math.abs(resistance - value);
    if (diff < minDiff) {
      minDiff = diff;
      nearestValue = value;
    }
  }

  return nearestValue;
}
