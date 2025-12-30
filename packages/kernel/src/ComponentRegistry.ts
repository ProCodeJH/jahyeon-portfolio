/**
 * Component Registry
 * Plugin system for extensible circuit components
 *
 * Features:
 * - Dynamic component loading
 * - Category-based organization
 * - Type validation
 * - Lazy model loading
 * - Built-in component library
 */

import type {
  ComponentDef,
  ComponentInstance,
  SimContext,
  PinDef,
  PropertyDef,
} from './contracts';

/**
 * Component Registry
 */
export class ComponentRegistry {
  private components: Map<string, ComponentDef>;
  private categories: Map<string, string[]>; // category -> component types

  constructor() {
    this.components = new Map();
    this.categories = new Map();
    this.registerBuiltInComponents();
  }

  /**
   * Register a component definition
   */
  register(def: ComponentDef): void {
    // Validate component definition
    this.validateComponentDef(def);

    // Register component
    this.components.set(def.type, def);

    // Add to category index
    if (!this.categories.has(def.category)) {
      this.categories.set(def.category, []);
    }
    this.categories.get(def.category)!.push(def.type);

    console.log(`[Registry] Registered component: ${def.type} (${def.category})`);
  }

  /**
   * Unregister a component
   */
  unregister(type: string): void {
    const def = this.components.get(type);
    if (!def) return;

    // Remove from components
    this.components.delete(type);

    // Remove from category
    const categoryTypes = this.categories.get(def.category);
    if (categoryTypes) {
      const index = categoryTypes.indexOf(type);
      if (index !== -1) {
        categoryTypes.splice(index, 1);
      }
    }
  }

  /**
   * Get component definition
   */
  get(type: string): ComponentDef | null {
    return this.components.get(type) || null;
  }

  /**
   * Get all components
   */
  getAll(): ComponentDef[] {
    return Array.from(this.components.values());
  }

  /**
   * Get components by category
   */
  getByCategory(category: string): ComponentDef[] {
    const types = this.categories.get(category) || [];
    return types.map(type => this.components.get(type)!).filter(Boolean);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  /**
   * Create component instance
   */
  createInstance(
    type: string,
    id: string,
    position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
  ): ComponentInstance | null {
    const def = this.components.get(type);
    if (!def) {
      console.error(`[Registry] Component type not found: ${type}`);
      return null;
    }

    // Create instance with default properties
    const properties: Record<string, any> = {};
    for (const prop of def.properties) {
      properties[prop.id] = prop.default;
    }

    return {
      id,
      type,
      position,
      rotation: { x: 0, y: 0, z: 0 },
      properties,
      state: {},
    };
  }

  /**
   * Validate component definition
   */
  private validateComponentDef(def: ComponentDef): void {
    if (!def.type || typeof def.type !== 'string') {
      throw new Error('Component must have a type (string)');
    }

    if (!def.name || typeof def.name !== 'string') {
      throw new Error('Component must have a name (string)');
    }

    if (!def.category) {
      throw new Error('Component must have a category');
    }

    if (!Array.isArray(def.pins)) {
      throw new Error('Component must have pins array');
    }

    if (!Array.isArray(def.properties)) {
      throw new Error('Component must have properties array');
    }

    // Validate pins
    for (const pin of def.pins) {
      if (!pin.id || !pin.name || !pin.type) {
        throw new Error(`Invalid pin definition in ${def.type}`);
      }
    }

    // Validate properties
    for (const prop of def.properties) {
      if (!prop.id || !prop.name || !prop.type) {
        throw new Error(`Invalid property definition in ${def.type}`);
      }
    }
  }

  /**
   * Register built-in components
   */
  private registerBuiltInComponents(): void {
    // Arduino UNO
    this.register({
      type: 'arduino-uno',
      name: 'Arduino UNO R3',
      category: 'controller',
      description: 'Arduino UNO R3 with ATmega328P',
      pins: this.getArduinoPins(),
      properties: [
        { id: 'code', name: 'Arduino Code', type: 'string', default: '' },
      ],
      model: () => import('@circuit-sim/render').then(m => m.modelLoader.loadArduinoUNO()),
      simulate: async (ctx: SimContext) => {
        // Arduino runtime handles simulation
        // Managed by SimEngine
      },
    });

    // LED
    this.register({
      type: 'led',
      name: 'LED (5mm)',
      category: 'output',
      description: '5mm LED with 2V forward voltage',
      pins: [
        { id: 'anode', name: 'Anode (+)', type: 'digital', position: { x: 0, y: 0, z: 0 } },
        { id: 'cathode', name: 'Cathode (-)', type: 'digital', position: { x: 0, y: 0.5, z: 0 } },
      ],
      properties: [
        { id: 'color', name: 'Color', type: 'color', default: '#ff0000' },
        { id: 'brightness', name: 'Brightness', type: 'number', default: 0, min: 0, max: 1 },
      ],
      model: () => import('@circuit-sim/render').then(m => m.modelLoader.loadLED()),
      simulate: (ctx: SimContext) => {
        const vAnode = ctx.getPin('anode').voltage;
        const vCathode = ctx.getPin('cathode').voltage;
        const vDrop = vAnode - vCathode;

        // LED forward voltage ~2V
        if (vDrop > 2.0) {
          const brightness = Math.min(1, (vDrop - 2.0) / 3.0);
          ctx.setState({ brightness });
        } else {
          ctx.setState({ brightness: 0 });
        }
      },
    });

    // Pushbutton
    this.register({
      type: 'button',
      name: 'Pushbutton',
      category: 'input',
      description: 'Momentary pushbutton switch',
      pins: [
        { id: 'pin1', name: 'Pin 1', type: 'digital', position: { x: -0.2, y: 0, z: 0 } },
        { id: 'pin2', name: 'Pin 2', type: 'digital', position: { x: 0.2, y: 0, z: 0 } },
      ],
      properties: [
        { id: 'pressed', name: 'Pressed', type: 'boolean', default: false },
      ],
      simulate: (ctx: SimContext) => {
        const pressed = ctx.getState('pressed') || false;

        if (pressed) {
          // Button pressed: connect pins (voltage passes through)
          const v1 = ctx.getPin('pin1').voltage;
          ctx.setPin('pin2', { voltage: v1, digital: ctx.getPin('pin1').digital });
        } else {
          // Button released: open circuit (high impedance)
          // Pins are isolated
        }
      },
    });

    // Resistor
    this.register({
      type: 'resistor',
      name: 'Resistor',
      category: 'basic',
      description: 'Fixed resistor',
      pins: [
        { id: 'pin1', name: 'Pin 1', type: 'analog', position: { x: -0.5, y: 0, z: 0 } },
        { id: 'pin2', name: 'Pin 2', type: 'analog', position: { x: 0.5, y: 0, z: 0 } },
      ],
      properties: [
        { id: 'resistance', name: 'Resistance (Ω)', type: 'number', default: 10000, min: 1, max: 10000000 },
      ],
      simulate: (ctx: SimContext) => {
        // Ohm's law: V = IR
        // For now, resistors just pass voltage through
        // Full analog simulation would calculate voltage drop
        const v1 = ctx.getPin('pin1').voltage;
        const v2 = ctx.getPin('pin2').voltage;
        const resistance = ctx.getState('resistance') || 10000;

        // Simplified: voltage drop based on current flow
        // (Full implementation would integrate with analog solver)
      },
    });

    // Ultrasonic Sensor (HC-SR04)
    this.register({
      type: 'ultrasonic',
      name: 'HC-SR04 Ultrasonic Sensor',
      category: 'sensor',
      description: 'Ultrasonic distance sensor (2-400cm)',
      pins: [
        { id: 'vcc', name: 'VCC', type: 'power', position: { x: -0.3, y: 0, z: 0 } },
        { id: 'trig', name: 'Trig', type: 'digital', position: { x: -0.1, y: 0, z: 0 } },
        { id: 'echo', name: 'Echo', type: 'digital', position: { x: 0.1, y: 0, z: 0 } },
        { id: 'gnd', name: 'GND', type: 'ground', position: { x: 0.3, y: 0, z: 0 } },
      ],
      properties: [
        { id: 'distance', name: 'Distance (cm)', type: 'number', default: 100, min: 2, max: 400 },
      ],
      model: () => import('@circuit-sim/render').then(m => m.modelLoader.loadUltrasonicSensor()),
      simulate: async (ctx: SimContext) => {
        // Wait for TRIG pulse (10µs HIGH)
        const trigState = ctx.getPin('trig');
        if (trigState.digital === 1) {
          // Trigger received, send ECHO pulse
          const distance = ctx.getState('distance') || 100;
          const duration_us = (distance / 58.0) * 1000; // Speed of sound: 58µs per cm

          // Schedule ECHO pulse
          ctx.scheduleEvent(10, () => {
            ctx.setPin('echo', { digital: 1, voltage: 5.0 });
          });

          ctx.scheduleEvent(10 + duration_us, () => {
            ctx.setPin('echo', { digital: 0, voltage: 0 });
          });
        }
      },
    });

    // Servo Motor
    this.register({
      type: 'servo',
      name: 'SG90 Servo Motor',
      category: 'output',
      description: 'Micro servo motor (0-180°)',
      pins: [
        { id: 'signal', name: 'Signal', type: 'digital', position: { x: 0, y: 0, z: -0.3 } },
        { id: 'vcc', name: 'VCC', type: 'power', position: { x: 0, y: 0, z: 0 } },
        { id: 'gnd', name: 'GND', type: 'ground', position: { x: 0, y: 0, z: 0.3 } },
      ],
      properties: [
        { id: 'angle', name: 'Angle (°)', type: 'number', default: 90, min: 0, max: 180 },
      ],
      model: () => import('@circuit-sim/render').then(m => m.modelLoader.loadServoMotor()),
      simulate: (ctx: SimContext) => {
        // Read PWM signal
        const signal = ctx.getPin('signal');
        if (signal.pwm?.enabled) {
          // PWM pulse width: 1ms (0°) to 2ms (180°)
          // Duty cycle: (1ms / 20ms) = 0.05 to (2ms / 20ms) = 0.1
          const duty = signal.pwm.duty;
          const pulseWidth_ms = duty * 20; // 20ms period (50Hz)

          // Map 1-2ms to 0-180°
          const angle = ((pulseWidth_ms - 1) / 1) * 180;
          ctx.setState({ angle: Math.max(0, Math.min(180, angle)) });
        }
      },
    });

    // Breadboard
    this.register({
      type: 'breadboard',
      name: 'Breadboard (830 points)',
      category: 'basic',
      description: 'Solderless breadboard with power rails',
      pins: this.getBreadboardPins(),
      properties: [],
      model: () => import('@circuit-sim/render').then(m => m.modelLoader.loadBreadboard()),
    });
  }

  /**
   * Get Arduino UNO pin definitions
   */
  private getArduinoPins(): PinDef[] {
    const pins: PinDef[] = [];

    // Digital pins 0-13
    for (let i = 0; i <= 13; i++) {
      pins.push({
        id: `D${i}`,
        name: `Digital ${i}`,
        type: 'digital',
        position: { x: -3.0 + i * 0.254, y: 0, z: -2.0 },
      });
    }

    // Analog pins A0-A5
    for (let i = 0; i <= 5; i++) {
      pins.push({
        id: `A${i}`,
        name: `Analog ${i}`,
        type: 'analog',
        position: { x: -3.0 + i * 0.254, y: 0, z: 2.0 },
      });
    }

    // Power pins
    pins.push(
      { id: 'VCC', name: '5V', type: 'power', position: { x: 3.0, y: 0, z: 0 } },
      { id: '3V3', name: '3.3V', type: 'power', position: { x: 3.2, y: 0, z: 0 } },
      { id: 'GND1', name: 'GND', type: 'ground', position: { x: 3.4, y: 0, z: 0 } },
      { id: 'GND2', name: 'GND', type: 'ground', position: { x: 3.6, y: 0, z: 0 } }
    );

    return pins;
  }

  /**
   * Get breadboard pin definitions
   */
  private getBreadboardPins(): PinDef[] {
    const pins: PinDef[] = [];

    // Power rails (top and bottom)
    for (let i = 0; i < 50; i++) {
      const x = -12.5 + i * 0.5;
      pins.push(
        { id: `+_${i}`, name: '+', type: 'power', position: { x, y: 0, z: -3.0 } },
        { id: `-_${i}`, name: '-', type: 'ground', position: { x, y: 0, z: -2.5 } }
      );
    }

    // Main grid (30 rows × 10 columns, standard 2.54mm spacing)
    for (let row = 0; row < 30; row++) {
      for (let col = 0; col < 10; col++) {
        const x = -3.81 + col * 0.254;
        const z = -1.5 + row * 0.254;
        pins.push({
          id: `${row}_${col}`,
          name: `${String.fromCharCode(65 + col)}${row + 1}`,
          type: 'digital',
          position: { x, y: 0, z },
        });
      }
    }

    return pins;
  }

  /**
   * Search components
   */
  search(query: string): ComponentDef[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(
      def =>
        def.name.toLowerCase().includes(lowerQuery) ||
        def.type.toLowerCase().includes(lowerQuery) ||
        def.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalComponents: this.components.size,
      categories: this.categories.size,
      byCategory: Object.fromEntries(
        Array.from(this.categories.entries()).map(([cat, types]) => [cat, types.length])
      ),
    };
  }
}

// Singleton instance
export const componentRegistry = new ComponentRegistry();
