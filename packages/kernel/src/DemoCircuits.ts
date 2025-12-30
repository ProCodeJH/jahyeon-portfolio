/**
 * Demo Circuits
 * Pre-built example circuits for testing and demonstration
 */

import type { CircuitDef, Wire, ComponentInstance } from './contracts';

/**
 * Arduino Blink - Classic "Hello World" for Arduino
 *
 * Circuit:
 * - Arduino UNO
 * - LED on pin 13 with 220Ω resistor
 * - Pushbutton on pin 2 with 10kΩ pull-down
 *
 * Code:
 * - Blinks LED every 1 second
 * - Button press toggles blink speed (fast/slow)
 * - Serial output for debugging
 */
export function getBlinkDemo(): CircuitDef {
  const components: ComponentInstance[] = [
    // Arduino UNO
    {
      id: 'arduino-1',
      type: 'arduino-uno',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      properties: {
        code: BLINK_CODE,
      },
      state: {},
    },

    // LED (connected to pin 13)
    {
      id: 'led-1',
      type: 'led',
      position: { x: 2.0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      properties: {
        color: '#ff0000',
        brightness: 0,
      },
      state: {},
    },

    // Current-limiting resistor (220Ω for LED)
    {
      id: 'resistor-1',
      type: 'resistor',
      position: { x: 1.5, y: 0, z: -0.5 },
      rotation: { x: 0, y: 0, z: 0 },
      properties: {
        resistance: 220,
      },
      state: {},
    },

    // Pushbutton (connected to pin 2)
    {
      id: 'button-1',
      type: 'button',
      position: { x: -2.0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      properties: {
        pressed: false,
      },
      state: {},
    },

    // Pull-down resistor (10kΩ for button)
    {
      id: 'resistor-2',
      type: 'resistor',
      position: { x: -2.0, y: 0, z: -0.5 },
      rotation: { x: 0, y: 0, z: 0 },
      properties: {
        resistance: 10000,
      },
      state: {},
    },
  ];

  const wires: Wire[] = [
    // Arduino D13 → Resistor → LED anode
    {
      id: 'wire-1',
      from: { component: 'arduino-1', pin: 'D13' },
      to: { component: 'resistor-1', pin: 'pin1' },
      points: [
        { x: 0, y: 0.1, z: 0 },
        { x: 1.5, y: 0.1, z: -0.5 },
      ],
      color: '#ffff00', // Yellow wire
    },
    {
      id: 'wire-2',
      from: { component: 'resistor-1', pin: 'pin2' },
      to: { component: 'led-1', pin: 'anode' },
      points: [
        { x: 1.5, y: 0.1, z: -0.5 },
        { x: 2.0, y: 0.1, z: 0 },
      ],
      color: '#ffff00',
    },

    // LED cathode → GND
    {
      id: 'wire-3',
      from: { component: 'led-1', pin: 'cathode' },
      to: { component: 'arduino-1', pin: 'GND1' },
      points: [
        { x: 2.0, y: 0.1, z: 0.5 },
        { x: 0, y: 0.1, z: 1.0 },
      ],
      color: '#000000', // Black wire (GND)
    },

    // Arduino D2 → Button pin1
    {
      id: 'wire-4',
      from: { component: 'arduino-1', pin: 'D2' },
      to: { component: 'button-1', pin: 'pin1' },
      points: [
        { x: 0, y: 0.1, z: 0 },
        { x: -2.0, y: 0.1, z: 0 },
      ],
      color: '#00ff00', // Green wire
    },

    // Button pin2 → Pull-down resistor → GND
    {
      id: 'wire-5',
      from: { component: 'button-1', pin: 'pin2' },
      to: { component: 'resistor-2', pin: 'pin1' },
      points: [
        { x: -2.0, y: 0.1, z: 0 },
        { x: -2.0, y: 0.1, z: -0.5 },
      ],
      color: '#808080', // Gray wire
    },
    {
      id: 'wire-6',
      from: { component: 'resistor-2', pin: 'pin2' },
      to: { component: 'arduino-1', pin: 'GND2' },
      points: [
        { x: -2.0, y: 0.1, z: -0.5 },
        { x: 0, y: 0.1, z: 1.0 },
      ],
      color: '#000000', // Black wire (GND)
    },
  ];

  return {
    components,
    wires,
    metadata: {
      name: 'Arduino Blink Demo',
      version: '1.0',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
  };
}

/**
 * Arduino Blink Code
 */
const BLINK_CODE = `// Arduino Blink with Button Speed Control
// LED on pin 13 blinks at variable speed
// Button on pin 2 toggles fast/slow

const int LED_PIN = 13;
const int BUTTON_PIN = 2;

int blinkDelay = 1000; // Start with 1 second
bool lastButtonState = LOW;
bool fastMode = false;

void setup() {
  // Initialize pins
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);

  // Start serial communication
  Serial.begin(9600);
  Serial.println("Arduino Blink Demo");
  Serial.println("Press button to toggle speed");
}

void loop() {
  // Read button
  bool buttonState = digitalRead(BUTTON_PIN);

  // Detect button press (rising edge)
  if (buttonState == HIGH && lastButtonState == LOW) {
    fastMode = !fastMode;
    blinkDelay = fastMode ? 200 : 1000;

    Serial.print("Speed: ");
    Serial.println(fastMode ? "FAST" : "SLOW");

    delay(50); // Debounce
  }
  lastButtonState = buttonState;

  // Blink LED
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON");
  delay(blinkDelay);

  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(blinkDelay);
}
`;

/**
 * Ultrasonic Distance Sensor Demo
 *
 * Circuit:
 * - Arduino UNO
 * - HC-SR04 ultrasonic sensor
 * - LCD display for distance readout
 */
export function getUltrasonicDemo(): CircuitDef {
  const components: ComponentInstance[] = [
    // Arduino UNO
    {
      id: 'arduino-1',
      type: 'arduino-uno',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      properties: {
        code: ULTRASONIC_CODE,
      },
      state: {},
    },

    // HC-SR04 Sensor
    {
      id: 'ultrasonic-1',
      type: 'ultrasonic',
      position: { x: 3.0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      properties: {
        distance: 50, // 50cm obstacle
      },
      state: {},
    },
  ];

  const wires: Wire[] = [
    // Ultrasonic VCC → Arduino 5V
    {
      id: 'wire-1',
      from: { component: 'ultrasonic-1', pin: 'vcc' },
      to: { component: 'arduino-1', pin: 'VCC' },
      points: [
        { x: 3.0, y: 0.1, z: -0.3 },
        { x: 0, y: 0.1, z: -1.0 },
      ],
      color: '#ff0000', // Red wire (power)
    },

    // Ultrasonic TRIG → Arduino D9
    {
      id: 'wire-2',
      from: { component: 'ultrasonic-1', pin: 'trig' },
      to: { component: 'arduino-1', pin: 'D9' },
      points: [
        { x: 3.0, y: 0.1, z: -0.1 },
        { x: 0, y: 0.1, z: 0 },
      ],
      color: '#ffff00', // Yellow wire
    },

    // Ultrasonic ECHO → Arduino D10
    {
      id: 'wire-3',
      from: { component: 'ultrasonic-1', pin: 'echo' },
      to: { component: 'arduino-1', pin: 'D10' },
      points: [
        { x: 3.0, y: 0.1, z: 0.1 },
        { x: 0, y: 0.1, z: 0 },
      ],
      color: '#00ff00', // Green wire
    },

    // Ultrasonic GND → Arduino GND
    {
      id: 'wire-4',
      from: { component: 'ultrasonic-1', pin: 'gnd' },
      to: { component: 'arduino-1', pin: 'GND1' },
      points: [
        { x: 3.0, y: 0.1, z: 0.3 },
        { x: 0, y: 0.1, z: 1.0 },
      ],
      color: '#000000', // Black wire (GND)
    },
  ];

  return {
    components,
    wires,
    metadata: {
      name: 'Ultrasonic Distance Sensor',
      version: '1.0',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
  };
}

/**
 * Ultrasonic Sensor Code
 */
const ULTRASONIC_CODE = `// HC-SR04 Ultrasonic Distance Sensor
// Measures distance and prints to Serial

const int TRIG_PIN = 9;
const int ECHO_PIN = 10;

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  Serial.begin(9600);
  Serial.println("Ultrasonic Distance Sensor");
}

void loop() {
  // Send 10us pulse to TRIG
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Read ECHO pulse duration
  long duration = pulseIn(ECHO_PIN, HIGH);

  // Calculate distance (speed of sound: 58us per cm)
  int distance = duration / 58;

  // Print to Serial
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  delay(500);
}
`;

/**
 * Servo Motor Demo
 *
 * Circuit:
 * - Arduino UNO
 * - SG90 Servo motor
 * - Potentiometer for angle control (or buttons)
 */
export function getServoDemo(): CircuitDef {
  const components: ComponentInstance[] = [
    // Arduino UNO
    {
      id: 'arduino-1',
      type: 'arduino-uno',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      properties: {
        code: SERVO_CODE,
      },
      state: {},
    },

    // SG90 Servo
    {
      id: 'servo-1',
      type: 'servo',
      position: { x: 2.5, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      properties: {
        angle: 90,
      },
      state: {},
    },
  ];

  const wires: Wire[] = [
    // Servo Signal → Arduino D9 (PWM pin)
    {
      id: 'wire-1',
      from: { component: 'servo-1', pin: 'signal' },
      to: { component: 'arduino-1', pin: 'D9' },
      points: [
        { x: 2.5, y: 0.1, z: -0.3 },
        { x: 0, y: 0.1, z: 0 },
      ],
      color: '#ffaa00', // Orange wire
    },

    // Servo VCC → Arduino 5V
    {
      id: 'wire-2',
      from: { component: 'servo-1', pin: 'vcc' },
      to: { component: 'arduino-1', pin: 'VCC' },
      points: [
        { x: 2.5, y: 0.1, z: 0 },
        { x: 0, y: 0.1, z: -1.0 },
      ],
      color: '#ff0000', // Red wire (power)
    },

    // Servo GND → Arduino GND
    {
      id: 'wire-3',
      from: { component: 'servo-1', pin: 'gnd' },
      to: { component: 'arduino-1', pin: 'GND1' },
      points: [
        { x: 2.5, y: 0.1, z: 0.3 },
        { x: 0, y: 0.1, z: 1.0 },
      ],
      color: '#000000', // Black wire (GND)
    },
  ];

  return {
    components,
    wires,
    metadata: {
      name: 'Servo Motor Control',
      version: '1.0',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
  };
}

/**
 * Servo Motor Code
 */
const SERVO_CODE = `// Servo Motor Sweep
// Sweeps servo from 0° to 180° and back

#include <Servo.h>

Servo myServo;
const int SERVO_PIN = 9;

void setup() {
  myServo.attach(SERVO_PIN);
  Serial.begin(9600);
  Serial.println("Servo Sweep Demo");
}

void loop() {
  // Sweep from 0 to 180
  for (int angle = 0; angle <= 180; angle += 5) {
    myServo.write(angle);
    Serial.print("Angle: ");
    Serial.println(angle);
    delay(50);
  }

  // Sweep from 180 to 0
  for (int angle = 180; angle >= 0; angle -= 5) {
    myServo.write(angle);
    Serial.print("Angle: ");
    Serial.println(angle);
    delay(50);
  }
}
`;

/**
 * Get all demo circuits
 */
export function getAllDemos(): { [key: string]: CircuitDef } {
  return {
    blink: getBlinkDemo(),
    ultrasonic: getUltrasonicDemo(),
    servo: getServoDemo(),
  };
}
