
import { ComponentType, ComponentCategory } from './types';

// Grid unit size (2.54mm in world units)
export const GRID_UNIT = 0.00254;

// Component category mapping
export const COMPONENT_CATEGORIES: Record<ComponentType, ComponentCategory> = {
    arduino_uno: 'microcontroller',
    breadboard_full: 'connector',
    breadboard_half: 'connector',
    breadboard_mini: 'connector',
    led_red: 'output',
    led_green: 'output',
    led_blue: 'output',
    led_yellow: 'output',
    led_white: 'output',
    led_rgb: 'output',
    resistor: 'passive',
    capacitor: 'passive',
    potentiometer: 'input',
    button: 'input',
    switch_spdt: 'input',
    buzzer: 'output',
    servo: 'output',
    motor_dc: 'output',
    ultrasonic: 'input',
    dht22: 'input',
    photoresistor: 'input',
    temperature: 'input',
    lcd_16x2: 'output',
    seven_segment: 'output',
    relay: 'output',
    transistor_npn: 'passive',
    diode: 'passive',
    battery_9v: 'power',
    wire_red: 'connector',
    wire_black: 'connector',
    wire_blue: 'connector',
    wire_green: 'connector',
    wire_yellow: 'connector',
    wire_orange: 'connector',
    wire_white: 'connector',
    wire_purple: 'connector',
};

// Default Arduino code
export const DEFAULT_CODE = \`// Arduino LED Blink Example
// 아두이노 LED 깜빡이기 예제

const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Program started!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON");
  delay(1000);

  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
\`;
