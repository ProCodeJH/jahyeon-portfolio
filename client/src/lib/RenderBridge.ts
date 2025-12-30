/**
 * Render Bridge
 * Connects UI thread to SimWorker thread via message passing
 *
 * Architecture:
 * - UI Thread: React components, Three.js rendering
 * - Worker Thread: SimEngine, ArduinoRuntime, ConnectivityGraph
 * - Bridge: This class (message router + state cache)
 */

import type {
  WorkerCommand,
  WorkerEvent,
  CircuitDef,
  Wire,
  PinRef,
  PinState,
  SerialOutput,
} from '@circuit-sim/kernel/contracts';

type EventCallback = (event: WorkerEvent) => void;

/**
 * RenderBridge - UI ↔ Worker Communication
 */
export class RenderBridge {
  private worker: Worker | null = null;
  private eventCallbacks: Map<string, Set<EventCallback>>;
  private stateCache: {
    pinStates: Map<string, PinState>;
    time_us: number;
    isRunning: boolean;
    fps: number;
  };

  constructor() {
    this.eventCallbacks = new Map();
    this.stateCache = {
      pinStates: new Map(),
      time_us: 0,
      isRunning: false,
      fps: 0,
    };
  }

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  /**
   * Initialize worker
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create worker
        this.worker = new Worker(
          new URL('../../../apps/worker/src/circuit.worker.ts', import.meta.url),
          { type: 'module' }
        );

        // Setup message handler
        this.worker.onmessage = (e: MessageEvent<WorkerEvent>) => {
          this.handleEvent(e.data);
        };

        // Setup error handler
        this.worker.onerror = (error) => {
          console.error('[RenderBridge] Worker error:', error);
          reject(error);
        };

        // Wait for READY event
        const readyHandler = (event: WorkerEvent) => {
          if (event.type === 'READY') {
            this.off('READY', readyHandler);
            console.log('[RenderBridge] Worker ready');
            resolve();
          }
        };

        this.on('READY', readyHandler);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Terminate worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      console.log('[RenderBridge] Worker terminated');
    }
  }

  // ===========================================================================
  // EVENT SYSTEM
  // ===========================================================================

  /**
   * Register event callback
   */
  on(eventType: string, callback: EventCallback): void {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, new Set());
    }
    this.eventCallbacks.get(eventType)!.add(callback);
  }

  /**
   * Unregister event callback
   */
  off(eventType: string, callback: EventCallback): void {
    const callbacks = this.eventCallbacks.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Handle event from worker
   */
  private handleEvent(event: WorkerEvent): void {
    // Update state cache
    switch (event.type) {
      case 'STATE_UPDATE':
        if (event.data?.pinStates) {
          this.stateCache.pinStates.clear();
          for (const { key, state } of event.data.pinStates) {
            this.stateCache.pinStates.set(key, state);
          }
          this.stateCache.time_us = event.data.time_us || 0;
        }
        break;

      case 'STARTED':
        this.stateCache.isRunning = true;
        break;

      case 'PAUSED':
      case 'STOPPED':
        this.stateCache.isRunning = false;
        break;

      case 'STATS':
        if (event.data?.fps !== undefined) {
          this.stateCache.fps = event.data.fps;
        }
        break;
    }

    // Emit to callbacks
    const callbacks = this.eventCallbacks.get(event.type);
    if (callbacks) {
      callbacks.forEach(cb => cb(event));
    }

    // Emit to wildcard listeners
    const wildcardCallbacks = this.eventCallbacks.get('*');
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach(cb => cb(event));
    }
  }

  // ===========================================================================
  // COMMANDS
  // ===========================================================================

  /**
   * Send command to worker
   */
  private sendCommand(command: WorkerCommand): void {
    if (!this.worker) {
      console.error('[RenderBridge] Worker not initialized');
      return;
    }

    this.worker.postMessage(command);
  }

  /**
   * Initialize circuit
   */
  initCircuit(circuit: CircuitDef): void {
    this.sendCommand({
      type: 'INIT',
      circuit,
    });
  }

  /**
   * Start simulation
   */
  run(): void {
    this.sendCommand({ type: 'RUN' });
  }

  /**
   * Pause simulation
   */
  pause(): void {
    this.sendCommand({ type: 'PAUSE' });
  }

  /**
   * Step simulation
   */
  step(steps: number = 1): void {
    this.sendCommand({ type: 'STEP', steps });
  }

  /**
   * Reset simulation
   */
  reset(): void {
    this.sendCommand({ type: 'RESET' });
    this.stateCache.time_us = 0;
    this.stateCache.pinStates.clear();
  }

  /**
   * Set pin value (for interactive components like buttons)
   */
  setPin(pin: PinRef, value: number): void {
    this.sendCommand({
      type: 'SET_PIN',
      pin,
      value,
    });
  }

  /**
   * Set simulation speed
   */
  setSpeed(speed: number): void {
    this.sendCommand({
      type: 'SET_SPEED',
      speed,
    });
  }

  /**
   * Request state snapshot
   */
  getState(): void {
    this.sendCommand({ type: 'GET_STATE' });
  }

  /**
   * Update component properties
   */
  updateComponent(componentId: string, properties: Record<string, any>): void {
    this.sendCommand({
      type: 'UPDATE_COMPONENT',
      componentId,
      properties,
    });
  }

  /**
   * Add wire dynamically
   */
  addWire(wire: Wire): void {
    this.sendCommand({
      type: 'ADD_WIRE',
      wire,
    });
  }

  /**
   * Remove wire dynamically
   */
  removeWire(wireId: string): void {
    this.sendCommand({
      type: 'REMOVE_WIRE',
      wireId,
    });
  }

  // ===========================================================================
  // STATE ACCESS (Cached)
  // ===========================================================================

  /**
   * Get cached pin state
   */
  getPinState(pin: PinRef): PinState | null {
    const key = `${pin.component}:${pin.pin}`;
    return this.stateCache.pinStates.get(key) || null;
  }

  /**
   * Get all cached pin states
   */
  getAllPinStates(): Map<string, PinState> {
    return new Map(this.stateCache.pinStates);
  }

  /**
   * Get current simulation time
   */
  getSimTime(): number {
    return this.stateCache.time_us;
  }

  /**
   * Check if simulation is running
   */
  isRunning(): boolean {
    return this.stateCache.isRunning;
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.stateCache.fps;
  }

  // ===========================================================================
  // UTILITIES
  // ===========================================================================

  /**
   * Get wire state from pin states
   */
  getWireState(wire: Wire): {
    flow: 'off' | 'glow' | 'pulse' | 'pwm' | 'power';
    voltage: number;
    current: number;
  } {
    const fromState = this.getPinState(wire.from);
    const toState = this.getPinState(wire.to);

    if (!fromState || !toState) {
      return { flow: 'off', voltage: 0, current: 0 };
    }

    // Determine flow mode
    let flow: 'off' | 'glow' | 'pulse' | 'pwm' | 'power' = 'glow';

    if (fromState.pwm?.enabled) {
      flow = 'pwm';
    } else if (fromState.voltage > 0.5) {
      flow = 'power';
    } else if (fromState.digital === 1) {
      flow = 'pulse';
    }

    return {
      flow,
      voltage: fromState.voltage,
      current: fromState.pwm?.duty || 0,
    };
  }

  /**
   * Get component state
   */
  getComponentState(componentId: string): Record<string, any> {
    // TODO: Cache component states
    return {};
  }

  /**
   * Debug info
   */
  getDebugInfo(): {
    pinStates: number;
    time_us: number;
    isRunning: boolean;
    fps: number;
  } {
    return {
      pinStates: this.stateCache.pinStates.size,
      time_us: this.stateCache.time_us,
      isRunning: this.stateCache.isRunning,
      fps: this.stateCache.fps,
    };
  }
}

// ===========================================================================
// SINGLETON INSTANCE
// ===========================================================================

let bridgeInstance: RenderBridge | null = null;

/**
 * Get singleton RenderBridge instance
 */
export function getRenderBridge(): RenderBridge {
  if (!bridgeInstance) {
    bridgeInstance = new RenderBridge();
  }
  return bridgeInstance;
}

/**
 * Initialize RenderBridge
 */
export async function initRenderBridge(): Promise<RenderBridge> {
  const bridge = getRenderBridge();
  await bridge.init();
  return bridge;
}
