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
interface ComponentSimulator {
  type: string;
  simulate: (ctx: any) => Promise<void> | void;
}

export class SimEngine {
  private graph: ConnectivityGraph;
  private components: Map<ComponentId, ComponentSimulator>;
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

  constructor(graph: ConnectivityGraph) {
    this.graph = graph;
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

  /**
   * Register a component simulator
   */
  registerComponent(id: ComponentId, simulator: ComponentSimulator): void {
    this.components.set(id, simulator);
  }

  /**
   * Start simulation (non-blocking)
   */
  start(): void {
    this.running = true;
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
   * Check if running
   */
  isRunning(): boolean {
    return this.running && !this.paused;
  }

  /**
   * Get current time
   */
  getCurrentTime(): number {
    return this.currentTime_us;
  }

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  /**
   * Reset simulation state
   */
  reset(): void {
    this.eventQueue.clear();
    this.currentTime_us = 0;
    this.nextAnalogTime_us = this.ANALOG_STEP_US;
    this.dirtyComponents.clear();
    this.frameCount = 0;
    this.running = false;
    this.paused = false;
  }

  /**
   * Execute one simulation tick (called by worker update loop)
   */
  tick(delta_ms: number): void {
    if (!this.running || this.paused) return;

    // Advance time by delta (convert ms to µs)
    const delta_us = delta_ms * 1000;
    const targetTime = this.currentTime_us + delta_us;

    // Process events until target time
    while (!this.eventQueue.isEmpty() && this.eventQueue.peek()!.time_us <= targetTime) {
      const event = this.eventQueue.pop()!;
      this.currentTime_us = event.time_us;
      this.processEvent(event);
    }

    // Process analog steps that occurred during this delta
    while (this.nextAnalogTime_us <= targetTime) {
      this.processAnalogStep();
      this.nextAnalogTime_us += this.ANALOG_STEP_US;
    }

    // Advance time to target
    this.currentTime_us = targetTime;
    this.frameCount++;
  }

  /**
   * Process a single event
   */
  private processEvent(event: SimEvent): void {
    switch (event.type) {
      case 'EDGE':
        // Digital edge event (e.g., Arduino digitalWrite)
        this.handleEdgeEvent(event);
        break;

      case 'TIMER':
        // Timer callback (e.g., delay() completion)
        if (event.data.callback) {
          event.data.callback();
        }
        break;

      case 'MCU':
        // MCU instruction or callback
        if (event.data.callback) {
          event.data.callback();
        }
        break;

      case 'SERIAL':
        // Serial output - forward to UI
        break;

      default:
        console.warn('[SimEngine] Unknown event type:', event.type);
    }
  }

  /**
   * Handle edge event (digital state change)
   */
  private handleEdgeEvent(event: SimEvent): void {
    const { pin, state } = event.data;

    // Update net state in graph
    this.graph.setPinState(pin, state);

    // Mark connected components as dirty
    const net = this.graph.getNet(pin);
    for (const connectedPin of net.pins) {
      this.dirtyComponents.add(connectedPin.component);
    }
  }

  /**
   * Process analog step (fixed-rate)
   */
  private processAnalogStep(): void {
    // Update all dirty components
    for (const compId of this.dirtyComponents) {
      const component = this.components.get(compId);
      if (component && component.simulate) {
        try {
          // Call component simulation hook
          component.simulate({
            getPin: (pinId: string) => this.graph.getPinState({ component: compId, pin: pinId }),
            setPin: (pinId: string, state: PinState) => {
              this.graph.setPinState({ component: compId, pin: pinId }, state);
            },
          });
        } catch (error) {
          console.error(`[SimEngine] Component ${compId} simulation error:`, error);
        }
      }
    }

    this.dirtyComponents.clear();
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
   * Get connectivity graph (for external access)
   */
  getGraph(): ConnectivityGraph {
    return this.graph;
  }
}
