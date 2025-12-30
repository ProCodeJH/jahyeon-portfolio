/**
 * Servo Library for Arduino Runtime
 * Emulates the Arduino Servo.h library
 *
 * Supports:
 * - attach(pin) - Attach servo to pin
 * - write(angle) - Set angle (0-180)
 * - read() - Read current angle
 * - writeMicroseconds(us) - Set pulse width
 * - detach() - Detach servo
 */

import type { ArduinoRuntime } from './ArduinoRuntime';

/**
 * Servo class
 */
export class Servo {
  private runtime: ArduinoRuntime | null = null;
  private pin: number = -1;
  private currentAngle: number = 90;
  private attached: boolean = false;

  // Servo pulse width constants (microseconds)
  private readonly MIN_PULSE_WIDTH = 544;   // 0°
  private readonly MAX_PULSE_WIDTH = 2400;  // 180°
  private readonly DEFAULT_PULSE_WIDTH = 1500; // 90°

  /**
   * Attach servo to a pin
   */
  attach(pin: number, runtime: ArduinoRuntime): void {
    this.pin = pin;
    this.runtime = runtime;
    this.attached = true;
    this.currentAngle = 90;

    // Set pin to OUTPUT mode
    runtime.pinMode(pin, 1); // OUTPUT = 1

    // Set default position (90°)
    this.write(90);

    console.log(`[Servo] Attached to pin ${pin}`);
  }

  /**
   * Write angle (0-180 degrees)
   */
  write(angle: number): void {
    if (!this.attached || !this.runtime) {
      console.warn('[Servo] Not attached');
      return;
    }

    // Clamp angle to 0-180
    this.currentAngle = Math.max(0, Math.min(180, angle));

    // Convert angle to pulse width (544-2400 µs)
    const pulseWidth = this.MIN_PULSE_WIDTH +
      (this.currentAngle / 180) * (this.MAX_PULSE_WIDTH - this.MIN_PULSE_WIDTH);

    // Convert pulse width to PWM duty cycle
    // Servo PWM frequency: 50Hz = 20ms period
    // Duty cycle = pulse_width / period
    const period = 20000; // 20ms in µs
    const duty = pulseWidth / period;

    // Convert duty (0-1) to analogWrite value (0-255)
    const pwmValue = Math.floor(duty * 255);

    // Write PWM to pin
    this.runtime.analogWrite(this.pin, pwmValue);

    console.log(`[Servo] Pin ${this.pin} set to ${this.currentAngle}° (PWM: ${pwmValue})`);
  }

  /**
   * Write microseconds (544-2400 µs)
   */
  writeMicroseconds(us: number): void {
    if (!this.attached || !this.runtime) {
      console.warn('[Servo] Not attached');
      return;
    }

    // Clamp pulse width
    const pulseWidth = Math.max(this.MIN_PULSE_WIDTH, Math.min(this.MAX_PULSE_WIDTH, us));

    // Convert to angle
    const angle = ((pulseWidth - this.MIN_PULSE_WIDTH) /
      (this.MAX_PULSE_WIDTH - this.MIN_PULSE_WIDTH)) * 180;

    this.write(angle);
  }

  /**
   * Read current angle
   */
  read(): number {
    return this.currentAngle;
  }

  /**
   * Check if attached
   */
  attached_to(): boolean {
    return this.attached;
  }

  /**
   * Detach servo
   */
  detach(): void {
    if (!this.attached || !this.runtime) {
      return;
    }

    // Stop PWM
    this.runtime.analogWrite(this.pin, 0);

    this.attached = false;
    this.pin = -1;
    this.runtime = null;

    console.log('[Servo] Detached');
  }
}

/**
 * Create Servo instance
 */
export function createServo(): Servo {
  return new Servo();
}
