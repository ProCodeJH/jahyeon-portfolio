// Arduino Uno Component Definition

import { ComponentDefinition, Pin, PinType } from './types';

// Arduino Uno R3 dimensions (scaled for canvas)
const ARDUINO_WIDTH = 280;
const ARDUINO_HEIGHT = 180;

// Pin positions relative to board
const createArduinoPin = (
    name: string,
    type: PinType,
    localX: number,
    localY: number,
    arduinoPin?: number,
    avrPort?: string,
    avrBit?: number
): Omit<Pin, 'id'> => ({
    name,
    type,
    mode: 'unset',
    state: 'floating',
    voltage: 0,
    current: 0,
    localX,
    localY,
    arduinoPin,
    avrPort,
    avrBit,
});

export const arduinoUnoDefinition: ComponentDefinition = {
    type: 'arduino-uno',
    name: 'Arduino Uno R3',
    description: 'ATmega328P microcontroller board',
    category: 'microcontroller',
    width: ARDUINO_WIDTH,
    height: ARDUINO_HEIGHT,
    icon: '🔌',
    defaultProperties: {
        label: 'Arduino Uno',
    },
    defaultPins: [
        // Digital pins (top row) - D0-D13
        createArduinoPin('D0/RX', 'digital', 240, 10, 0, 'PORTD', 0),
        createArduinoPin('D1/TX', 'digital', 225, 10, 1, 'PORTD', 1),
        createArduinoPin('D2', 'digital', 210, 10, 2, 'PORTD', 2),
        createArduinoPin('D3~', 'pwm', 195, 10, 3, 'PORTD', 3),
        createArduinoPin('D4', 'digital', 180, 10, 4, 'PORTD', 4),
        createArduinoPin('D5~', 'pwm', 165, 10, 5, 'PORTD', 5),
        createArduinoPin('D6~', 'pwm', 150, 10, 6, 'PORTD', 6),
        createArduinoPin('D7', 'digital', 135, 10, 7, 'PORTD', 7),
        createArduinoPin('D8', 'digital', 115, 10, 8, 'PORTB', 0),
        createArduinoPin('D9~', 'pwm', 100, 10, 9, 'PORTB', 1),
        createArduinoPin('D10~', 'pwm', 85, 10, 10, 'PORTB', 2),
        createArduinoPin('D11~', 'pwm', 70, 10, 11, 'PORTB', 3),
        createArduinoPin('D12', 'digital', 55, 10, 12, 'PORTB', 4),
        createArduinoPin('D13', 'digital', 40, 10, 13, 'PORTB', 5),

        // Power pins (bottom left)
        createArduinoPin('RESET', 'digital', 20, 170, undefined),
        createArduinoPin('3.3V', 'power', 35, 170, undefined),
        createArduinoPin('5V', 'power', 50, 170, undefined),
        createArduinoPin('GND1', 'ground', 65, 170, undefined),
        createArduinoPin('GND2', 'ground', 80, 170, undefined),
        createArduinoPin('VIN', 'power', 95, 170, undefined),

        // Analog pins (bottom right) - A0-A5
        createArduinoPin('A0', 'analog', 140, 170, 14, 'PORTC', 0),
        createArduinoPin('A1', 'analog', 155, 170, 15, 'PORTC', 1),
        createArduinoPin('A2', 'analog', 170, 170, 16, 'PORTC', 2),
        createArduinoPin('A3', 'analog', 185, 170, 17, 'PORTC', 3),
        createArduinoPin('A4/SDA', 'analog', 200, 170, 18, 'PORTC', 4),
        createArduinoPin('A5/SCL', 'analog', 215, 170, 19, 'PORTC', 5),
    ],
};

// LED Component
export const ledDefinition: ComponentDefinition = {
    type: 'led',
    name: 'LED',
    description: 'Light Emitting Diode',
    category: 'active',
    width: 40,
    height: 60,
    icon: '💡',
    defaultProperties: {
        color: 'red',
        forwardVoltage: 2.0,
        brightness: 0,
    },
    defaultPins: [
        createArduinoPin('Anode (+)', 'digital', 20, 5),
        createArduinoPin('Cathode (-)', 'ground', 20, 55),
    ],
};

// Resistor Component
export const resistorDefinition: ComponentDefinition = {
    type: 'resistor',
    name: 'Resistor',
    description: 'Current limiting resistor',
    category: 'passive',
    width: 80,
    height: 20,
    icon: '⚡',
    defaultProperties: {
        resistance: 220, // 220Ω default
    },
    defaultPins: [
        createArduinoPin('Terminal 1', 'digital', 5, 10),
        createArduinoPin('Terminal 2', 'digital', 75, 10),
    ],
};

// Push Button Component
export const buttonDefinition: ComponentDefinition = {
    type: 'button',
    name: 'Push Button',
    description: 'Momentary push button switch',
    category: 'io',
    width: 50,
    height: 50,
    icon: '🔘',
    defaultProperties: {},
    defaultPins: [
        createArduinoPin('Pin 1A', 'digital', 10, 10),
        createArduinoPin('Pin 1B', 'digital', 40, 10),
        createArduinoPin('Pin 2A', 'digital', 10, 40),
        createArduinoPin('Pin 2B', 'digital', 40, 40),
    ],
};

// Breadboard Component (simplified)
export const breadboardDefinition: ComponentDefinition = {
    type: 'breadboard',
    name: 'Breadboard',
    description: 'Half-size solderless breadboard',
    category: 'other',
    width: 400,
    height: 200,
    icon: '📋',
    defaultProperties: {},
    defaultPins: [], // Pins generated dynamically
};

// All component definitions
export const componentDefinitions: Record<string, ComponentDefinition> = {
    'arduino-uno': arduinoUnoDefinition,
    'led': ledDefinition,
    'resistor': resistorDefinition,
    'button': buttonDefinition,
    'breadboard': breadboardDefinition,
};
