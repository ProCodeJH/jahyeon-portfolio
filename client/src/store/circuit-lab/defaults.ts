
import { ComponentType, PinData, PinType, PinDirection, ComponentProperties } from './types';

// Default properties for each component type
export function getDefaultProperties(type: ComponentType): ComponentProperties {
  switch (type) {
    case 'led_red':
    case 'led_green':
    case 'led_blue':
    case 'led_yellow':
    case 'led_white':
      return { brightness: 0, isOn: false };
    case 'led_rgb':
      return { r: 0, g: 0, b: 0, isOn: false };
    case 'resistor':
      return { value: 220, tolerance: 5 };
    case 'capacitor':
      return { value: 100, unit: 'uF' };
    case 'potentiometer':
      return { value: 10000, position: 0.5 };
    case 'button':
      return { isPressed: false };
    case 'switch_spdt':
      return { position: 0 };
    case 'buzzer':
      return { frequency: 0, isOn: false };
    case 'servo':
      return { angle: 90 };
    case 'motor_dc':
      return { speed: 0, direction: 1 };
    case 'ultrasonic':
      return { distance: 100, isActive: false };
    case 'dht22':
      return { temperature: 25, humidity: 50, isActive: false };
    case 'photoresistor':
      return { lightLevel: 0.5 };
    case 'temperature':
      return { temperature: 25 };
    case 'battery_9v':
      return { voltage: 9 };
    default:
      return {};
  }
}

// Default pins for each component type
export function getDefaultPins(type: ComponentType): PinData[] {
  const createPin = (
    id: string,
    name: string,
    pinType: PinType,
    direction: PinDirection,
    offset: [number, number, number]
  ): PinData => ({
    id,
    name,
    type: pinType,
    direction,
    state: 'FLOATING',
    voltage: 0,
    localOffset: offset,
  });

  switch (type) {
    case 'arduino_uno':
      const pins: PinData[] = [];
      // Digital pins 0-13
      for (let i = 0; i <= 13; i++) {
        const isPwm = [3, 5, 6, 9, 10, 11].includes(i);
        pins.push(createPin(
          `D${i}`,
          `D${i}${isPwm ? '~' : ''}`,
          isPwm ? 'pwm' : 'digital',
          'bidirectional',
          [13, 0, -10 + i * 1]
        ));
      }
      // Analog pins A0-A5
      for (let i = 0; i <= 5; i++) {
        pins.push(createPin(
          `A${i}`,
          `A${i}`,
          'analog',
          'input',
          [-13, 0, -4 + i * 1]
        ));
      }
      // Power pins
      pins.push(createPin('5V', '5V', 'power', 'output', [-13, 0, 4]));
      pins.push(createPin('3V3', '3.3V', 'power', 'output', [-13, 0, 5]));
      pins.push(createPin('GND1', 'GND', 'ground', 'bidirectional', [-13, 0, 6]));
      pins.push(createPin('GND2', 'GND', 'ground', 'bidirectional', [-13, 0, 7]));
      pins.push(createPin('VIN', 'VIN', 'power', 'input', [-13, 0, 3]));
      return pins;

    case 'led_red':
    case 'led_green':
    case 'led_blue':
    case 'led_yellow':
    case 'led_white':
      return [
        createPin('anode', 'Anode (+)', 'digital', 'input', [0.5, 0, 0]),
        createPin('cathode', 'Cathode (-)', 'ground', 'bidirectional', [-0.5, 0, 0]),
      ];

    case 'resistor':
      return [
        createPin('leg1', 'Leg 1', 'digital', 'bidirectional', [-2, 0, 0]),
        createPin('leg2', 'Leg 2', 'digital', 'bidirectional', [2, 0, 0]),
      ];

    case 'button':
      return [
        createPin('1a', '1a', 'digital', 'bidirectional', [-1, 0, -1]),
        createPin('1b', '1b', 'digital', 'bidirectional', [-1, 0, 1]),
        createPin('2a', '2a', 'digital', 'bidirectional', [1, 0, -1]),
        createPin('2b', '2b', 'digital', 'bidirectional', [1, 0, 1]),
      ];

    case 'ultrasonic':
      return [
        createPin('VCC', 'VCC', 'power', 'input', [-2, 0, 0]),
        createPin('TRIG', 'TRIG', 'digital', 'input', [-1, 0, 0]),
        createPin('ECHO', 'ECHO', 'digital', 'output', [1, 0, 0]),
        createPin('GND', 'GND', 'ground', 'bidirectional', [2, 0, 0]),
      ];

    case 'dht22':
      return [
        createPin('VCC', 'VCC', 'power', 'input', [-1, 0, 0]),
        createPin('DATA', 'DATA', 'digital', 'bidirectional', [0, 0, 0]),
        createPin('GND', 'GND', 'ground', 'bidirectional', [1, 0, 0]),
      ];

    default:
      return [];
  }
}
