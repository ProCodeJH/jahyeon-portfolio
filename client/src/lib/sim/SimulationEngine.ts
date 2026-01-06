/**
 * Event-Driven Simulation Engine
 * Microsecond-precision circuit simulation
 */

import type { SimulationEvent, SimulationState, ComponentState, PinState, SignalState } from '../kernel/types';
import { NetlistManager } from '../kernel/NetlistManager';

export type SimEventHandler = (event: SimulationEvent) => void;

export class SimulationEngine {
  private netlist: NetlistManager;
  private state: SimulationState;
  private eventQueue: SimulationEvent[] = [];
  private eventHandlers: Map<string, SimEventHandler[]> = new Map();
  private running = false;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private simulationSpeed = 1.0;
  private microsecondsPerFrame = 16667; // ~60fps in microseconds

  constructor(netlist: NetlistManager) {
    this.netlist = netlist;
    this.state = {
      time: 0,
      running: false,
      speed: 1.0,
      components: new Map(),
      nets: new Map(),
    };
    this.initializeState();
  }

  private initializeState(): void {
    const circuit = this.netlist.getCircuit();

    for (const [componentId, component] of circuit.components) {
      const pinStates = new Map<string, PinState>();

      for (const pin of component.pins) {
        pinStates.set(pin.id, {
          pinId: pin.id,
          state: pin.state,
          voltage: pin.voltage,
          pwmDuty: pin.pwmDuty,
          lastChange: 0,
        });
      }

      this.state.components.set(componentId, {
        componentId,
        pins: pinStates,
        internal: {},
      });
    }
  }

  start(): void {
    if (this.running) return;

    this.running = true;
    this.state.running = true;
    this.lastFrameTime = performance.now();
    this.tick();

    this.emit({ type: 'simulation_start', time: this.state.time });
  }

  stop(): void {
    this.running = false;
    this.state.running = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.emit({ type: 'simulation_stop', time: this.state.time });
  }

  reset(): void {
    this.stop();
    this.state.time = 0;
    this.eventQueue = [];
    this.initializeState();

    this.emit({ type: 'simulation_reset', time: 0 });
  }

  setSpeed(speed: number): void {
    this.simulationSpeed = Math.max(0.1, Math.min(10, speed));
    this.state.speed = this.simulationSpeed;
  }

  private tick = (): void => {
    if (!this.running) return;

    const now = performance.now();
    const deltaMs = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Calculate simulation time delta
    const deltaMicros = Math.floor(deltaMs * 1000 * this.simulationSpeed);
    const targetTime = this.state.time + deltaMicros;

    // Process events up to target time
    this.processEventsUntil(targetTime);
    this.state.time = targetTime;

    // Resolve all nets
    this.resolveNets();

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  private processEventsUntil(targetTime: number): void {
    // Sort events by time
    this.eventQueue.sort((a, b) => a.time - b.time);

    while (this.eventQueue.length > 0 && this.eventQueue[0].time <= targetTime) {
      const event = this.eventQueue.shift()!;
      this.processEvent(event);
    }
  }

  private processEvent(event: SimulationEvent): void {
    switch (event.type) {
      case 'pin_change':
        this.handlePinChange(event);
        break;
      case 'component_update':
        this.handleComponentUpdate(event);
        break;
      case 'net_update':
        this.handleNetUpdate(event);
        break;
    }

    // Notify handlers
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  private handlePinChange(event: SimulationEvent): void {
    const { targetId, data } = event;
    const [componentId] = targetId.split('_pin_');

    const componentState = this.state.components.get(componentId);
    if (!componentState) return;

    const pinState = componentState.pins.get(targetId);
    if (!pinState) return;

    pinState.state = data.state as SignalState;
    pinState.voltage = data.voltage as number;
    pinState.pwmDuty = data.pwmDuty as number | undefined;
    pinState.lastChange = event.time;

    // Propagate to net
    const net = this.netlist.getNetForPin(targetId);
    if (net) {
      this.scheduleEvent({
        time: event.time + 10, // 10µs propagation delay
        type: 'net_update',
        targetId: net.id,
        data: {},
      });
    }
  }

  private handleComponentUpdate(event: SimulationEvent): void {
    const componentState = this.state.components.get(event.targetId);
    if (!componentState) return;

    Object.assign(componentState.internal, event.data);
  }

  private handleNetUpdate(_event: SimulationEvent): void {
    // Net updates trigger re-resolution
    this.resolveNets();
  }

  private resolveNets(): void {
    const circuit = this.netlist.getCircuit();

    for (const [netId] of circuit.nets) {
      const result = this.netlist.resolveNetState(netId);

      // Update all receiver pins in the net
      const net = this.netlist.getNet(netId);
      if (net) {
        for (const pinId of net.pins) {
          const pin = this.netlist.getPin(pinId);
          if (pin && pin.direction === 'input') {
            const [componentId] = pinId.split('_pin_');
            const componentState = this.state.components.get(componentId);
            if (componentState) {
              const pinState = componentState.pins.get(pinId);
              if (pinState) {
                pinState.state = result.state;
                pinState.voltage = result.voltage;
              }
            }
          }
        }
      }
    }
  }

  scheduleEvent(event: SimulationEvent): void {
    this.eventQueue.push(event);
  }

  schedulePinChange(
    pinId: string,
    state: SignalState,
    voltage: number,
    delayMicros = 0,
    pwmDuty?: number
  ): void {
    this.scheduleEvent({
      time: this.state.time + delayMicros,
      type: 'pin_change',
      targetId: pinId,
      data: { state, voltage, pwmDuty },
    });
  }

  getPinState(pinId: string): PinState | undefined {
    const [componentId] = pinId.split('_pin_');
    return this.state.components.get(componentId)?.pins.get(pinId);
  }

  getComponentState(componentId: string): ComponentState | undefined {
    return this.state.components.get(componentId);
  }

  getTime(): number {
    return this.state.time;
  }

  isRunning(): boolean {
    return this.running;
  }

  on(eventType: string, handler: SimEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  off(eventType: string, handler: SimEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(data: { type: string; time: number; [key: string]: unknown }): void {
    const handlers = this.eventHandlers.get(data.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(data as unknown as SimulationEvent);
      }
    }
  }
}
