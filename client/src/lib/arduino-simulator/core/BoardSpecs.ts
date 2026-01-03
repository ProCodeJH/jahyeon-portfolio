/**
 * =====================================================
 * Enterprise Arduino Simulator - Board Specifications
 * =====================================================
 *
 * 모든 지원 보드의 하드웨어 스펙을 정의합니다.
 * 새로운 보드 추가 시 이 파일에만 정의하면 됩니다.
 */

import { BoardSpec, BoardType, MCUSpec, PinDefinition } from './types';

// ============================================
// ATmega328P MCU (Arduino UNO/Nano)
// ============================================

const ATMEGA328P_PINS: PinDefinition[] = [
  // Digital pins 0-13
  { id: 0, name: 'D0/RX', type: ['DIGITAL', 'SERIAL'], supportsPWM: false, supportsInterrupt: false },
  { id: 1, name: 'D1/TX', type: ['DIGITAL', 'SERIAL'], supportsPWM: false, supportsInterrupt: false },
  { id: 2, name: 'D2', type: ['DIGITAL'], supportsPWM: false, supportsInterrupt: true },
  { id: 3, name: 'D3~', type: ['DIGITAL', 'PWM'], supportsPWM: true, supportsInterrupt: true },
  { id: 4, name: 'D4', type: ['DIGITAL'], supportsPWM: false, supportsInterrupt: false },
  { id: 5, name: 'D5~', type: ['DIGITAL', 'PWM'], supportsPWM: true, supportsInterrupt: false },
  { id: 6, name: 'D6~', type: ['DIGITAL', 'PWM'], supportsPWM: true, supportsInterrupt: false },
  { id: 7, name: 'D7', type: ['DIGITAL'], supportsPWM: false, supportsInterrupt: false },
  { id: 8, name: 'D8', type: ['DIGITAL'], supportsPWM: false, supportsInterrupt: false },
  { id: 9, name: 'D9~', type: ['DIGITAL', 'PWM'], supportsPWM: true, supportsInterrupt: false },
  { id: 10, name: 'D10~/SS', type: ['DIGITAL', 'PWM', 'SPI'], supportsPWM: true, supportsInterrupt: false },
  { id: 11, name: 'D11~/MOSI', type: ['DIGITAL', 'PWM', 'SPI'], supportsPWM: true, supportsInterrupt: false },
  { id: 12, name: 'D12/MISO', type: ['DIGITAL', 'SPI'], supportsPWM: false, supportsInterrupt: false },
  { id: 13, name: 'D13/SCK/LED', type: ['DIGITAL', 'SPI'], supportsPWM: false, supportsInterrupt: false },

  // Analog pins A0-A5 (also usable as digital 14-19)
  { id: 14, name: 'A0', type: ['ANALOG', 'DIGITAL'], supportsPWM: false, supportsInterrupt: false, analogChannel: 0 },
  { id: 15, name: 'A1', type: ['ANALOG', 'DIGITAL'], supportsPWM: false, supportsInterrupt: false, analogChannel: 1 },
  { id: 16, name: 'A2', type: ['ANALOG', 'DIGITAL'], supportsPWM: false, supportsInterrupt: false, analogChannel: 2 },
  { id: 17, name: 'A3', type: ['ANALOG', 'DIGITAL'], supportsPWM: false, supportsInterrupt: false, analogChannel: 3 },
  { id: 18, name: 'A4/SDA', type: ['ANALOG', 'DIGITAL', 'I2C'], supportsPWM: false, supportsInterrupt: false, analogChannel: 4 },
  { id: 19, name: 'A5/SCL', type: ['ANALOG', 'DIGITAL', 'I2C'], supportsPWM: false, supportsInterrupt: false, analogChannel: 5 },
];

const ATMEGA328P: MCUSpec = {
  type: 'ATmega328P',
  name: 'ATmega328P',
  clockSpeed: 16000000, // 16 MHz
  flashSize: 32768, // 32 KB
  sramSize: 2048, // 2 KB
  eepromSize: 1024, // 1 KB
  digitalPins: 14,
  analogPins: 6,
  pwmPins: [3, 5, 6, 9, 10, 11],
  interruptPins: [2, 3],
  pins: ATMEGA328P_PINS,
};

// ============================================
// ATmega2560 MCU (Arduino Mega)
// ============================================

const ATMEGA2560_PINS: PinDefinition[] = [
  // Digital pins 0-53
  ...Array.from({ length: 54 }, (_, i) => ({
    id: i,
    name: i === 0 ? 'D0/RX0' : i === 1 ? 'D1/TX0' : `D${i}${[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 44, 45, 46].includes(i) ? '~' : ''}`,
    type: ['DIGITAL', ...(i <= 1 ? ['SERIAL'] : []), ...([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 44, 45, 46].includes(i) ? ['PWM'] : [])] as any,
    supportsPWM: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 44, 45, 46].includes(i),
    supportsInterrupt: [2, 3, 18, 19, 20, 21].includes(i),
  })),
  // Analog pins A0-A15 (54-69)
  ...Array.from({ length: 16 }, (_, i) => ({
    id: 54 + i,
    name: `A${i}`,
    type: ['ANALOG', 'DIGITAL'] as any,
    supportsPWM: false,
    supportsInterrupt: false,
    analogChannel: i,
  })),
];

const ATMEGA2560: MCUSpec = {
  type: 'ATmega2560',
  name: 'ATmega2560',
  clockSpeed: 16000000, // 16 MHz
  flashSize: 262144, // 256 KB
  sramSize: 8192, // 8 KB
  eepromSize: 4096, // 4 KB
  digitalPins: 54,
  analogPins: 16,
  pwmPins: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 44, 45, 46],
  interruptPins: [2, 3, 18, 19, 20, 21],
  pins: ATMEGA2560_PINS,
};

// ============================================
// ATmega32U4 MCU (Arduino Leonardo)
// ============================================

const ATMEGA32U4_PINS: PinDefinition[] = [
  { id: 0, name: 'D0/RX', type: ['DIGITAL', 'SERIAL'], supportsPWM: false, supportsInterrupt: true },
  { id: 1, name: 'D1/TX', type: ['DIGITAL', 'SERIAL'], supportsPWM: false, supportsInterrupt: true },
  { id: 2, name: 'D2/SDA', type: ['DIGITAL', 'I2C'], supportsPWM: false, supportsInterrupt: true },
  { id: 3, name: 'D3~/SCL', type: ['DIGITAL', 'PWM', 'I2C'], supportsPWM: true, supportsInterrupt: true },
  { id: 4, name: 'D4/A6', type: ['DIGITAL', 'ANALOG'], supportsPWM: false, supportsInterrupt: false, analogChannel: 6 },
  { id: 5, name: 'D5~', type: ['DIGITAL', 'PWM'], supportsPWM: true, supportsInterrupt: false },
  { id: 6, name: 'D6~/A7', type: ['DIGITAL', 'PWM', 'ANALOG'], supportsPWM: true, supportsInterrupt: false, analogChannel: 7 },
  { id: 7, name: 'D7', type: ['DIGITAL'], supportsPWM: false, supportsInterrupt: true },
  { id: 8, name: 'D8/A8', type: ['DIGITAL', 'ANALOG'], supportsPWM: false, supportsInterrupt: false, analogChannel: 8 },
  { id: 9, name: 'D9~/A9', type: ['DIGITAL', 'PWM', 'ANALOG'], supportsPWM: true, supportsInterrupt: false, analogChannel: 9 },
  { id: 10, name: 'D10~/A10', type: ['DIGITAL', 'PWM', 'ANALOG'], supportsPWM: true, supportsInterrupt: false, analogChannel: 10 },
  { id: 11, name: 'D11~', type: ['DIGITAL', 'PWM'], supportsPWM: true, supportsInterrupt: false },
  { id: 12, name: 'D12/A11', type: ['DIGITAL', 'ANALOG'], supportsPWM: false, supportsInterrupt: false, analogChannel: 11 },
  { id: 13, name: 'D13~/LED', type: ['DIGITAL', 'PWM'], supportsPWM: true, supportsInterrupt: false },
  { id: 14, name: 'A0', type: ['ANALOG', 'DIGITAL'], supportsPWM: false, supportsInterrupt: false, analogChannel: 0 },
  { id: 15, name: 'A1', type: ['ANALOG', 'DIGITAL'], supportsPWM: false, supportsInterrupt: false, analogChannel: 1 },
  { id: 16, name: 'A2', type: ['ANALOG', 'DIGITAL'], supportsPWM: false, supportsInterrupt: false, analogChannel: 2 },
  { id: 17, name: 'A3', type: ['ANALOG', 'DIGITAL'], supportsPWM: false, supportsInterrupt: false, analogChannel: 3 },
  { id: 18, name: 'A4', type: ['ANALOG', 'DIGITAL'], supportsPWM: false, supportsInterrupt: false, analogChannel: 4 },
  { id: 19, name: 'A5', type: ['ANALOG', 'DIGITAL'], supportsPWM: false, supportsInterrupt: false, analogChannel: 5 },
];

const ATMEGA32U4: MCUSpec = {
  type: 'ATmega32U4',
  name: 'ATmega32U4',
  clockSpeed: 16000000,
  flashSize: 32768,
  sramSize: 2560,
  eepromSize: 1024,
  digitalPins: 20,
  analogPins: 12,
  pwmPins: [3, 5, 6, 9, 10, 11, 13],
  interruptPins: [0, 1, 2, 3, 7],
  pins: ATMEGA32U4_PINS,
};

// ============================================
// BOARD SPECIFICATIONS
// ============================================

export const BOARD_SPECS: Record<BoardType, BoardSpec> = {
  UNO: {
    type: 'UNO',
    name: 'Arduino Uno R3',
    mcu: ATMEGA328P,
    operatingVoltage: 5,
    inputVoltageRange: [7, 12],
    builtInLED: 13,
    serialPins: { rx: 0, tx: 1 },
    i2cPins: { sda: 18, scl: 19 },
    spiPins: { mosi: 11, miso: 12, sck: 13, ss: 10 },
  },

  NANO: {
    type: 'NANO',
    name: 'Arduino Nano',
    mcu: ATMEGA328P,
    operatingVoltage: 5,
    inputVoltageRange: [7, 12],
    builtInLED: 13,
    serialPins: { rx: 0, tx: 1 },
    i2cPins: { sda: 18, scl: 19 },
    spiPins: { mosi: 11, miso: 12, sck: 13, ss: 10 },
  },

  MEGA: {
    type: 'MEGA',
    name: 'Arduino Mega 2560',
    mcu: ATMEGA2560,
    operatingVoltage: 5,
    inputVoltageRange: [7, 12],
    builtInLED: 13,
    serialPins: { rx: 0, tx: 1 },
    i2cPins: { sda: 20, scl: 21 },
    spiPins: { mosi: 51, miso: 50, sck: 52, ss: 53 },
  },

  LEONARDO: {
    type: 'LEONARDO',
    name: 'Arduino Leonardo',
    mcu: ATMEGA32U4,
    operatingVoltage: 5,
    inputVoltageRange: [7, 12],
    builtInLED: 13,
    serialPins: { rx: 0, tx: 1 },
    i2cPins: { sda: 2, scl: 3 },
    spiPins: { mosi: 16, miso: 14, sck: 15, ss: 17 },
  },

  ESP32: {
    type: 'ESP32',
    name: 'ESP32 DevKit',
    mcu: {
      type: 'ESP32',
      name: 'ESP32',
      clockSpeed: 240000000, // 240 MHz
      flashSize: 4194304, // 4 MB
      sramSize: 520000, // 520 KB
      eepromSize: 0, // Uses flash
      digitalPins: 40,
      analogPins: 18,
      pwmPins: Array.from({ length: 40 }, (_, i) => i), // All pins support PWM
      interruptPins: Array.from({ length: 40 }, (_, i) => i), // All pins support interrupts
      pins: Array.from({ length: 40 }, (_, i) => ({
        id: i,
        name: `GPIO${i}`,
        type: ['DIGITAL', 'PWM'] as any,
        supportsPWM: true,
        supportsInterrupt: true,
      })),
    },
    operatingVoltage: 3.3,
    inputVoltageRange: [3, 3.6],
    builtInLED: 2,
    serialPins: { rx: 3, tx: 1 },
    i2cPins: { sda: 21, scl: 22 },
    spiPins: { mosi: 23, miso: 19, sck: 18, ss: 5 },
  },

  ESP8266: {
    type: 'ESP8266',
    name: 'NodeMCU ESP8266',
    mcu: {
      type: 'ESP8266',
      name: 'ESP8266',
      clockSpeed: 80000000, // 80 MHz
      flashSize: 4194304, // 4 MB
      sramSize: 81920, // 80 KB
      eepromSize: 0, // Uses flash
      digitalPins: 17,
      analogPins: 1,
      pwmPins: [0, 1, 2, 3, 4, 5, 12, 13, 14, 15],
      interruptPins: [0, 1, 2, 3, 4, 5, 12, 13, 14, 15],
      pins: Array.from({ length: 17 }, (_, i) => ({
        id: i,
        name: i === 0 ? 'A0' : `D${i - 1}`,
        type: (i === 0 ? ['ANALOG'] : ['DIGITAL', 'PWM']) as any,
        supportsPWM: i !== 0,
        supportsInterrupt: i !== 0,
        analogChannel: i === 0 ? 0 : undefined,
      })),
    },
    operatingVoltage: 3.3,
    inputVoltageRange: [3, 3.6],
    builtInLED: 2,
    serialPins: { rx: 3, tx: 1 },
    i2cPins: { sda: 4, scl: 5 },
    spiPins: { mosi: 13, miso: 12, sck: 14, ss: 15 },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getBoardSpec(type: BoardType): BoardSpec {
  return BOARD_SPECS[type];
}

export function getPinDefinition(boardType: BoardType, pinId: number): PinDefinition | undefined {
  return BOARD_SPECS[boardType].mcu.pins.find(p => p.id === pinId);
}

export function isPWMPin(boardType: BoardType, pinId: number): boolean {
  return BOARD_SPECS[boardType].mcu.pwmPins.includes(pinId);
}

export function isInterruptPin(boardType: BoardType, pinId: number): boolean {
  return BOARD_SPECS[boardType].mcu.interruptPins.includes(pinId);
}

export function getAnalogPinNumber(boardType: BoardType, analogChannel: number): number {
  const pin = BOARD_SPECS[boardType].mcu.pins.find(p => p.analogChannel === analogChannel);
  return pin?.id ?? -1;
}
