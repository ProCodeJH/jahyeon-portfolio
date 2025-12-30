/**
 * Simulation Engine (WebWorker)
 * Event-driven digital + fixed-step analog hybrid simulation
 *
 * Architecture:
 * - Runs entirely in WebWorker (no UI thread blocking)
 * - Priority queue for event scheduling
 * - Microsecond (µs) time granularity
 * - Incremental state updates (dirty flags)
 */

import { ConnectivityGraph } from '@circuit-sim/kernel/ConnectivityGraph';
import type {
  SimEvent,
  SimSnapshot,
  ComponentInstance,
  WorkerCommand,
  WorkerEvent,
  CircuitDef,
  PinRef,
  PinState,
  ComponentId,
} from '@circuit-sim/kernel/contracts';

/**
 * Priority Queue for events (min-heap by time)
 */
class EventQueue {
  private heap: SimEvent[] = [];

  push(event: SimEvent): void {
    this.heap.push(event);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): SimEvent | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const root = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return root;
  }

  peek(): SimEvent | undefined {
    return this.heap[0];
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  clear(): void {
    this.heap = [];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].time_us >= this.heap[parentIndex].time_us) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < this.heap.length && this.heap[leftChild].time_us < this.heap[smallest].time_us) {
        smallest = leftChild;
      }
      if (rightChild < this.heap.length && this.heap[rightChild].time_us < this.heap[smallest].time_us) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

/**
 * Simulation Engine
 */
export class SimEngine {
  private graph: ConnectivityGraph;
  private components: Map<ComponentId, ComponentInstance>;
  private eventQueue: EventQueue;
  private currentTime_us: number;
  private running: boolean;
  private paused: boolean;

  // Performance
  private lastFrameTime: number;
  private frameCount: number;

  // Analog simulation
  private readonly ANALOG_STEP_US = 100; // 100µs = 10kHz
  private nextAnalogTime_us: number;

  // State snapshots
  private dirtyComponents: Set<ComponentId>;

  constructor() {
    this.graph = new ConnectivityGraph();
    this.components = new Map();
    this.eventQueue = new EventQueue();
    this.currentTime_us = 0;
    this.running = false;
    this.paused = false;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.nextAnalogTime_us = this.ANALOG_STEP_US;
    this.dirtyComponents = new Set();
  }

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  /**
   * Initialize with circuit definition
   */
  init(circuit: CircuitDef): void {
    this.reset();

    // Load components
    for (const comp of circuit.components) {
      this.components.set(comp.id, comp);
    }

    // Build connectivity graph
    for (const wire of circuit.wires) {
      this.graph.addWire(wire);
    }

    this.postEvent({
      type: 'READY',
    });
  }

  /**
   * Start simulation
   */
  async run(): Promise<void> {
    if (this.running) return;

    this.running = true;
    this.paused = false;
    this.lastFrameTime = performance.now();

    // Main loop
    while (this.running) {
      if (!this.paused) {
        await this.tick();
      } else {
        // Sleep when paused
        await this.sleep(16); // ~60fps idle
      }

      // Yield to event loop occasionally
      if (this.frameCount % 10 === 0) {
        await this.sleep(0);
      }
    }
  }

  /**
   * Pause simulation
   */
  pause(): void {
    this.paused = true;
  }

  /**
   * Resume simulation
   */
  resume(): void {
    this.paused = false;
  }

  /**
   * Stop simulation
   */
  stop(): void {
    this.running = false;
    this.paused = false;
  }

  /**
   * Reset simulation
   */
  reset(): void {
    this.graph.clear();
    this.components.clear();
    this.eventQueue.clear();
    this.currentTime_us = 0;
    this.nextAnalogTime_us = this.ANALOG_STEP_US;
    this.dirtyComponents.clear();
    this.frameCount = 0;
  }

  /**
   * Step simulation by N microseconds
   */
  async step(micros: number): Promise<void> {
    const targetTime = this.currentTime_us + micros;

    while (this.currentTime_us < targetTime) {
      await this.tick();
    }
  }

  // ==========================================================================
  // SIMULATION TICK
  // ==========================================================================

  /**
   * Execute one simulation tick
   */
  private async tick(): Promise<void> {
    // Process events until next analog step
    while (!this.eventQueue.isEmpty() && this.eventQueue.peek()!.time_us <= this.nextAnalogTime_us) {
      const event = this.eventQueue.pop()!;
      this.currentTime_us = event.time_us;
      await this.processEvent(event);
    }

    // Fixed-step analog update
    this.currentTime_us = this.nextAnalogTime_us;
    await this.processAnalogStep();
    this.nextAnalogTime_us += this.ANALOG_STEP_US;

    // Send state snapshot to UI (throttled)
    this.frameCount++;
    if (this.frameCount % 6 === 0) {
      // ~10fps state updates
      await this.sendSnapshot();
    }

    // Performance metrics
    const now = performance.now();
    if (now - this.lastFrameTime > 1000) {
      const fps = this.frameCount / ((now - this.lastFrameTime) / 1000);
      this.postEvent({
        type: 'PERFORMANCE',
        fps,
        memory_mb: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0,
      });
      this.frameCount = 0;
      this.lastFrameTime = now;
    }
  }

  /**
   * Process a single event
   */
  private async processEvent(event: SimEvent): Promise<void> {
    switch (event.type) {
      case 'EDGE':
        // Digital edge event (e.g., button press)
        await this.handleEdgeEvent(event);
        break;

      case 'TIMER':
        // Timer callback (e.g., delay() completion)
        await this.handleTimerEvent(event);
        break;

      case 'MCU':
        // MCU instruction or callback
        await this.handleMcuEvent(event);
        break;

      case 'SERIAL':
        // Serial output
        this.postEvent({
          type: 'SERIAL',
          output: {
            timestamp_us: event.time_us,
            port: event.data.port || 'Serial',
            text: event.data.text,
          },
        });
        break;

      default:
        console.warn('Unknown event type:', event.type);
    }
  }

  /**
   * Handle edge event (digital state change)
   */
  private async handleEdgeEvent(event: SimEvent): Promise<void> {
    const { pin, state } = event.data;

    // Update net state
    this.graph.setPinState(pin, state);

    // Notify components connected to this net
    const net = this.graph.getNet(pin);
    for (const connectedPin of net.pins) {
      const component = this.components.get(connectedPin.component);
      if (component) {
        this.dirtyComponents.add(component.id);
        // Component will be updated in analog step
      }
    }

    // Propagate to UI
    this.postEvent({
      type: 'PIN_CHANGE',
      pin,
      state: this.graph.getPinState(pin),
    });
  }

  /**
   * Handle timer event
   */
  private async handleTimerEvent(event: SimEvent): Promise<void> {
    // Execute callback
    if (event.data.callback) {
      await event.data.callback();
    }
  }

  /**
   * Handle MCU event
   */
  private async handleMcuEvent(event: SimEvent): Promise<void> {
    // This will be filled in by Arduino Runtime
    // For now, just log
    console.log('MCU event:', event.data);
  }

  /**
   * Process analog step (fixed-rate)
   */
  private async processAnalogStep(): Promise<void> {
    // Update all dirty components
    for (const compId of this.dirtyComponents) {
      const component = this.components.get(compId);
      if (component) {
        // Call component simulation hook
        // (Will be implemented by component plugins)
        await this.simulateComponent(component);
      }
    }

    this.dirtyComponents.clear();
  }

  /**
   * Simulate a component (placeholder for plugin system)
   */
  private async simulateComponent(component: ComponentInstance): Promise<void> {
    // This will be replaced by component plugin system
    // For now, simple LED example:
    if (component.type === 'led') {
      // Read anode and cathode voltages
      // Calculate brightness based on voltage drop
      // Update component.state.brightness
    }
  }

  // ==========================================================================
  // EVENT SCHEDULING
  // ==========================================================================

  /**
   * Schedule an event
   */
  scheduleEvent(delay_us: number, event: Omit<SimEvent, 'time_us'>): void {
    this.eventQueue.push({
      time_us: this.currentTime_us + delay_us,
      ...event,
    } as SimEvent);
  }

  /**
   * Get current simulation time
   */
  getCurrentTime_us(): number {
    return this.currentTime_us;
  }

  // ==========================================================================
  // STATE SNAPSHOT
  // ==========================================================================

  /**
   * Send state snapshot to UI
   */
  private async sendSnapshot(): Promise<void> {
    const snapshot: SimSnapshot = {
      timestamp_us: this.currentTime_us,
      components: new Map(
        Array.from(this.components.entries()).map(([id, comp]) => [
          id,
          comp.state,
        ])
      ),
      nets: new Map(
        this.graph.getAllNets().map(net => [net.id, net.state])
      ),
      serial: [], // Serial outputs are sent via separate events
    };

    this.postEvent({
      type: 'STATE',
      snapshot,
    });
  }

  // ==========================================================================
  // WORKER COMMUNICATION
  // ==========================================================================

  /**
   * Handle command from UI thread
   */
  handleCommand(command: WorkerCommand): void {
    switch (command.type) {
      case 'INIT':
        this.init(command.circuit);
        break;

      case 'RUN':
        this.run();
        break;

      case 'PAUSE':
        this.pause();
        break;

      case 'STEP':
        this.step(command.micros);
        break;

      case 'RESET':
        this.reset();
        break;

      case 'SET_PIN':
        this.graph.setPinState(command.pin, { voltage: command.value });
        break;

      case 'ADD_WIRE':
        this.graph.addWire(command.wire);
        break;

      case 'REMOVE_WIRE':
        this.graph.removeWire(command.wireId);
        break;

      default:
        console.warn('Unknown command:', (command as any).type);
    }
  }

  /**
   * Post event to UI thread
   */
  private postEvent(event: WorkerEvent): void {
    self.postMessage(event);
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  /**
   * Sleep for N milliseconds (async)
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ==========================================================================
// WORKER ENTRY POINT
// ==========================================================================

const engine = new SimEngine();

self.onmessage = (event: MessageEvent<WorkerCommand>) => {
  engine.handleCommand(event.data);
};

// Signal ready
self.postMessage({ type: 'READY' } as WorkerEvent);
