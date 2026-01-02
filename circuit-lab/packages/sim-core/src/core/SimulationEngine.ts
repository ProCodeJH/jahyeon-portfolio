/**
 * SimulationEngine - Event-driven digital circuit simulator
 * Handles timing, event propagation, and co-simulation with AVR
 */

import type {
  Component,
  SimEvent,
  SimEventType,
  SimulationState,
  Time,
  PWMState,
  ComponentPin,
  PinState,
  PinMode,
} from './types';
import { NetlistManager } from '../netlist/NetlistManager';

// Simulation tick rate (in Hz)
const TICK_RATE = 16_000_000; // 16MHz like Arduino
const TICK_PERIOD = 1 / TICK_RATE; // ~62.5ns

// PWM frequencies for different timers
const PWM_FREQUENCIES = {
  timer0: 976.5625, // pins 5, 6
  timer1: 490.19607, // pins 9, 10
  timer2: 490.19607, // pins 3, 11
};

export interface SimulationCallbacks {
  onPinChange?: (pin: ComponentPin, component: Component) => void;
  onSerialTx?: (data: string) => void;
  onLedUpdate?: (componentId: string, brightness: number) => void;
  onMotorUpdate?: (componentId: string, speed: number) => void;
  onError?: (error: Error) => void;
}

export class SimulationEngine {
  private state: SimulationState;
  private netlist: NetlistManager;
  private callbacks: SimulationCallbacks;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private accumulatedTime: number = 0;
  private eventQueue: SimEvent[] = [];
  private pwmPhases: Map<string, number> = new Map();

  constructor(callbacks: SimulationCallbacks = {}) {
    this.callbacks = callbacks;
    this.netlist = new NetlistManager();
    this.state = {
      running: false,
      paused: false,
      time: 0,
      speed: 1.0,
      components: new Map(),
      nets: new Map(),
      wires: new Map(),
      eventQueue: [],
    };
  }

  /**
   * Get the netlist manager
   */
  getNetlist(): NetlistManager {
    return this.netlist;
  }

  /**
   * Get current simulation state
   */
  getState(): SimulationState {
    return this.state;
  }

  /**
   * Add a component to the simulation
   */
  addComponent(component: Component): void {
    this.state.components.set(component.id, component);

    // Create nets for unconnected pins
    for (const pin of component.pins) {
      if (!pin.netId) {
        const net = this.netlist.createNet();
        this.netlist.connectPinToNet(pin, net.id);
      }
    }
  }

  /**
   * Remove a component from the simulation
   */
  removeComponent(componentId: string): void {
    const component = this.state.components.get(componentId);
    if (component) {
      // Disconnect all pins
      for (const pin of component.pins) {
        this.netlist.disconnectPin(pin);
      }
      this.state.components.delete(componentId);
    }
  }

  /**
   * Get a component by ID
   */
  getComponent(componentId: string): Component | undefined {
    return this.state.components.get(componentId);
  }

  /**
   * Get all components
   */
  getAllComponents(): Component[] {
    return Array.from(this.state.components.values());
  }

  /**
   * Set pin mode (INPUT, OUTPUT, PWM, etc.)
   */
  setPinMode(componentId: string, pinId: string, mode: PinMode): void {
    const component = this.state.components.get(componentId);
    if (!component) return;

    const pin = component.pins.find((p) => p.id === pinId);
    if (!pin) return;

    pin.mode = mode;

    // Initialize PWM state if needed
    if (mode === PinMode.PWM) {
      pin.pwm = {
        enabled: true,
        dutyCycle: 0,
        frequency: PWM_FREQUENCIES.timer0,
      };
    }
  }

  /**
   * Write digital value to a pin
   */
  digitalWrite(componentId: string, pinId: string, value: boolean): void {
    const component = this.state.components.get(componentId);
    if (!component) return;

    const pin = component.pins.find((p) => p.id === pinId);
    if (!pin || pin.mode !== PinMode.OUTPUT) return;

    const oldState = pin.state;
    pin.state = value ? PinState.HIGH : PinState.LOW;
    pin.voltage = value ? 5.0 : 0;

    if (oldState !== pin.state) {
      this.emitEvent({
        type: SimEventType.PIN_CHANGE,
        timestamp: this.state.time,
        source: componentId,
        target: pinId,
        data: { oldState, newState: pin.state },
      });

      // Propagate through netlist
      const affectedPins = this.netlist.propagateSignal(
        pin,
        this.state.components
      );
      for (const affectedPin of affectedPins) {
        this.callbacks.onPinChange?.(affectedPin, component);
      }

      this.callbacks.onPinChange?.(pin, component);
    }
  }

  /**
   * Read digital value from a pin
   */
  digitalRead(componentId: string, pinId: string): boolean {
    const component = this.state.components.get(componentId);
    if (!component) return false;

    const pin = component.pins.find((p) => p.id === pinId);
    if (!pin) return false;

    // Get voltage from netlist
    if (pin.netId) {
      pin.voltage = this.netlist.calculateNetVoltage(
        pin.netId,
        this.state.components
      );
    }

    // Apply threshold (TTL: ~2.5V)
    return pin.voltage >= 2.5;
  }

  /**
   * Write PWM value to a pin (0-255)
   */
  analogWrite(componentId: string, pinId: string, value: number): void {
    const component = this.state.components.get(componentId);
    if (!component) return;

    const pin = component.pins.find((p) => p.id === pinId);
    if (!pin) return;

    // Clamp value
    value = Math.max(0, Math.min(255, value));

    if (!pin.pwm) {
      pin.pwm = {
        enabled: true,
        dutyCycle: value,
        frequency: PWM_FREQUENCIES.timer0,
      };
    } else {
      pin.pwm.dutyCycle = value;
      pin.pwm.enabled = true;
    }

    // Average voltage for PWM
    pin.voltage = (value / 255) * 5.0;

    this.emitEvent({
      type: SimEventType.PWM_UPDATE,
      timestamp: this.state.time,
      source: componentId,
      target: pinId,
      data: { dutyCycle: value },
    });
  }

  /**
   * Read analog value from a pin (0-1023)
   */
  analogRead(componentId: string, pinId: string): number {
    const component = this.state.components.get(componentId);
    if (!component) return 0;

    const pin = component.pins.find((p) => p.id === pinId);
    if (!pin) return 0;

    // Get voltage from netlist
    if (pin.netId) {
      pin.voltage = this.netlist.calculateNetVoltage(
        pin.netId,
        this.state.components
      );
    }

    // Convert to 10-bit ADC value (0-5V -> 0-1023)
    const adcValue = Math.round((pin.voltage / 5.0) * 1023);
    return Math.max(0, Math.min(1023, adcValue));
  }

  /**
   * Emit serial data
   */
  serialWrite(data: string): void {
    this.emitEvent({
      type: SimEventType.SERIAL_TX,
      timestamp: this.state.time,
      source: 'serial',
      data: { text: data },
    });

    this.callbacks.onSerialTx?.(data);
  }

  /**
   * Start the simulation loop
   */
  start(): void {
    if (this.state.running) return;

    this.state.running = true;
    this.state.paused = false;
    this.lastTimestamp = performance.now();
    this.accumulatedTime = 0;

    this.runLoop();
  }

  /**
   * Pause the simulation
   */
  pause(): void {
    this.state.paused = true;
  }

  /**
   * Resume the simulation
   */
  resume(): void {
    if (!this.state.running) {
      this.start();
      return;
    }

    this.state.paused = false;
    this.lastTimestamp = performance.now();
  }

  /**
   * Stop the simulation
   */
  stop(): void {
    this.state.running = false;
    this.state.paused = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Reset the simulation
   */
  reset(): void {
    this.stop();
    this.state.time = 0;
    this.eventQueue = [];
    this.pwmPhases.clear();

    // Reset all pins to default state
    for (const component of this.state.components.values()) {
      for (const pin of component.pins) {
        pin.state = PinState.LOW;
        pin.voltage = 0;
        if (pin.pwm) {
          pin.pwm.dutyCycle = 0;
        }
      }
    }
  }

  /**
   * Set simulation speed multiplier
   */
  setSpeed(speed: number): void {
    this.state.speed = Math.max(0.1, Math.min(10, speed));
  }

  /**
   * Main simulation loop
   */
  private runLoop(): void {
    if (!this.state.running) return;

    const now = performance.now();
    const deltaTime = (now - this.lastTimestamp) / 1000; // Convert to seconds
    this.lastTimestamp = now;

    if (!this.state.paused) {
      this.accumulatedTime += deltaTime * this.state.speed;

      // Process simulation ticks
      while (this.accumulatedTime >= TICK_PERIOD) {
        this.tick();
        this.accumulatedTime -= TICK_PERIOD;
        this.state.time += TICK_PERIOD;
      }

      // Update PWM outputs
      this.updatePWM(deltaTime);
    }

    // Continue loop
    this.animationFrameId = requestAnimationFrame(() => this.runLoop());
  }

  /**
   * Process one simulation tick
   */
  private tick(): void {
    // Process pending events
    this.processEvents();
  }

  /**
   * Update PWM outputs (called at display refresh rate)
   */
  private updatePWM(deltaTime: number): void {
    for (const component of this.state.components.values()) {
      for (const pin of component.pins) {
        if (pin.pwm && pin.pwm.enabled) {
          // Update PWM phase
          const phaseKey = `${component.id}_${pin.id}`;
          let phase = this.pwmPhases.get(phaseKey) || 0;
          phase += deltaTime * pin.pwm.frequency;
          phase = phase % 1;
          this.pwmPhases.set(phaseKey, phase);

          // Determine instantaneous output
          const dutyCycleNormalized = pin.pwm.dutyCycle / 255;
          const isHigh = phase < dutyCycleNormalized;
          pin.voltage = isHigh ? 5.0 : 0;
        }
      }
    }

    // Update LED brightness based on PWM
    for (const component of this.state.components.values()) {
      if (component.type === 'led') {
        const anodePin = component.pins.find((p) => p.name === 'anode');
        if (anodePin && anodePin.netId) {
          // Find driving pin's PWM
          const connections = this.netlist.getPinsOnNet(anodePin.netId);
          let brightness = 0;

          for (const conn of connections) {
            const driverComponent = this.state.components.get(conn.componentId);
            if (!driverComponent) continue;

            const driverPin = driverComponent.pins.find(
              (p) => p.id === conn.pinId
            );
            if (!driverPin) continue;

            if (driverPin.pwm && driverPin.pwm.enabled) {
              brightness = driverPin.pwm.dutyCycle / 255;
            } else if (driverPin.state === PinState.HIGH) {
              brightness = 1;
            }
          }

          this.callbacks.onLedUpdate?.(component.id, brightness);
        }
      }
    }
  }

  /**
   * Process pending simulation events
   */
  private processEvents(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;

      switch (event.type) {
        case SimEventType.PIN_CHANGE:
          this.handlePinChange(event);
          break;
        case SimEventType.SERIAL_TX:
          // Already handled via callback
          break;
        default:
          break;
      }
    }
  }

  /**
   * Handle pin change event
   */
  private handlePinChange(event: SimEvent): void {
    const component = this.state.components.get(event.source);
    if (!component) return;

    const pin = component.pins.find((p) => p.id === event.target);
    if (!pin) return;

    // Propagate through netlist
    this.netlist.propagateSignal(pin, this.state.components);
  }

  /**
   * Queue a simulation event
   */
  private emitEvent(event: SimEvent): void {
    this.eventQueue.push(event);
  }

  /**
   * Get current simulation time
   */
  getCurrentTime(): Time {
    return this.state.time;
  }

  /**
   * Check if simulation is running
   */
  isRunning(): boolean {
    return this.state.running;
  }

  /**
   * Check if simulation is paused
   */
  isPaused(): boolean {
    return this.state.paused;
  }
}
