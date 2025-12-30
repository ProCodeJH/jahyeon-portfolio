/**
 * Circuit Simulator Worker
 * Runs SimEngine in dedicated WebWorker thread
 *
 * Architecture:
 * - Main Thread (UI): Circuit3DCanvas, Controls, Serial Monitor
 * - Worker Thread (This): SimEngine, ArduinoRuntime, ConnectivityGraph
 * - Communication: Message-based (WorkerCommand → WorkerEvent)
 */

import { SimEngine } from './SimEngine';
import { ArduinoRuntime } from '@circuit-sim/mcu';
import { ConnectivityGraph } from '@circuit-sim/kernel';
import type {
  WorkerCommand,
  WorkerEvent,
  CircuitDef,
  ComponentInstance,
  Wire,
  PinState,
  SerialOutput,
} from '@circuit-sim/kernel/contracts';

// =============================================================================
// WORKER STATE
// =============================================================================

let engine: SimEngine | null = null;
let arduinoRuntime: ArduinoRuntime | null = null;
let graph: ConnectivityGraph | null = null;

// Worker stats
let messageCount = 0;
let lastStatsTime = Date.now();
let eventsPerSecond = 0;

// =============================================================================
// MESSAGE HANDLER
// =============================================================================

self.onmessage = async (e: MessageEvent<WorkerCommand>) => {
  const command = e.data;
  messageCount++;

  try {
    switch (command.type) {
      case 'INIT':
        handleInit(command.circuit);
        break;

      case 'RUN':
        handleRun();
        break;

      case 'PAUSE':
        handlePause();
        break;

      case 'STEP':
        handleStep(command.steps || 1);
        break;

      case 'RESET':
        handleReset();
        break;

      case 'SET_PIN':
        handleSetPin(command.pin, command.value);
        break;

      case 'SET_SPEED':
        handleSetSpeed(command.speed);
        break;

      case 'GET_STATE':
        handleGetState();
        break;

      case 'UPDATE_COMPONENT':
        handleUpdateComponent(command.componentId, command.properties);
        break;

      case 'ADD_WIRE':
        handleAddWire(command.wire);
        break;

      case 'REMOVE_WIRE':
        handleRemoveWire(command.wireId);
        break;

      default:
        console.warn(`[Worker] Unknown command: ${(command as any).type}`);
    }
  } catch (error) {
    postError(`Command failed: ${error}`);
  }
};

// =============================================================================
// COMMAND HANDLERS
// =============================================================================

/**
 * Initialize simulation with circuit
 */
function handleInit(circuit: CircuitDef): void {
  console.log('[Worker] Initializing simulation...');

  // Create connectivity graph
  graph = new ConnectivityGraph();

  // Create simulation engine
  engine = new SimEngine(graph);

  // Add all wires to graph
  for (const wire of circuit.wires) {
    graph.addWire(wire);
  }

  // Find Arduino component
  const arduinoComponent = circuit.components.find(c => c.type === 'arduino-uno');

  if (arduinoComponent) {
    // Create Arduino runtime
    arduinoRuntime = new ArduinoRuntime(
      arduinoComponent.id,
      engine,
      graph
    );

    // Load Arduino code
    const code = arduinoComponent.properties.code as string;
    if (code) {
      loadArduinoCode(code);
    }

    // Register Arduino with engine
    engine.registerComponent(arduinoComponent.id, {
      type: 'arduino-uno',
      simulate: async () => {
        // Arduino runtime handles its own loop
      },
    });
  }

  // Register other components
  for (const component of circuit.components) {
    if (component.type === 'arduino-uno') continue; // Already registered

    engine.registerComponent(component.id, {
      type: component.type,
      simulate: async () => {
        // Component simulation logic
        // TODO: Use ComponentRegistry.simulate()
      },
    });
  }

  postEvent({
    type: 'INITIALIZED',
    timestamp: Date.now(),
    data: {
      components: circuit.components.length,
      wires: circuit.wires.length,
      nets: graph.getNets().length,
    },
  });

  console.log('[Worker] Initialization complete');
}

/**
 * Load and parse Arduino code
 */
function loadArduinoCode(code: string): void {
  if (!arduinoRuntime) return;

  // Parse Arduino code to extract setup() and loop()
  // For now, use eval (TODO: proper transpiler)

  try {
    // Create Arduino API context
    const arduinoAPI = {
      pinMode: (pin: number, mode: number) => arduinoRuntime!.pinMode(pin, mode),
      digitalWrite: (pin: number, value: number) => arduinoRuntime!.digitalWrite(pin, value),
      digitalRead: (pin: number) => arduinoRuntime!.digitalRead(pin),
      analogRead: (pin: number) => arduinoRuntime!.analogRead(pin),
      analogWrite: (pin: number, value: number) => arduinoRuntime!.analogWrite(pin, value),
      delay: (ms: number) => arduinoRuntime!.delay(ms),
      delayMicroseconds: (us: number) => arduinoRuntime!.delayMicroseconds(us),
      millis: () => arduinoRuntime!.millis(),
      micros: () => arduinoRuntime!.micros(),
      Serial: {
        begin: (baud: number) => arduinoRuntime!.Serial.begin(baud),
        print: (data: any) => arduinoRuntime!.Serial.print(data),
        println: (data: any) => arduinoRuntime!.Serial.println(data),
      },
      attachInterrupt: (pin: number, callback: () => void, mode: number) =>
        arduinoRuntime!.attachInterrupt(pin, callback, mode),
      detachInterrupt: (pin: number) => arduinoRuntime!.detachInterrupt(pin),
      HIGH: 1,
      LOW: 0,
      INPUT: 0,
      OUTPUT: 1,
      INPUT_PULLUP: 2,
    };

    // Simple code parsing (find setup and loop functions)
    const setupMatch = code.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}/);
    const loopMatch = code.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\}/);

    if (setupMatch && loopMatch) {
      const setupBody = setupMatch[1];
      const loopBody = loopMatch[1];

      // Create functions
      const setupFn = new Function(
        'pinMode', 'digitalWrite', 'digitalRead', 'analogRead', 'analogWrite',
        'delay', 'delayMicroseconds', 'millis', 'micros', 'Serial',
        'attachInterrupt', 'detachInterrupt',
        'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP',
        setupBody
      );

      const loopFn = new Function(
        'pinMode', 'digitalWrite', 'digitalRead', 'analogRead', 'analogWrite',
        'delay', 'delayMicroseconds', 'millis', 'micros', 'Serial',
        'attachInterrupt', 'detachInterrupt',
        'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP',
        loopBody
      );

      // Bind to Arduino API
      const boundSetup = setupFn.bind(null,
        arduinoAPI.pinMode,
        arduinoAPI.digitalWrite,
        arduinoAPI.digitalRead,
        arduinoAPI.analogRead,
        arduinoAPI.analogWrite,
        arduinoAPI.delay,
        arduinoAPI.delayMicroseconds,
        arduinoAPI.millis,
        arduinoAPI.micros,
        arduinoAPI.Serial,
        arduinoAPI.attachInterrupt,
        arduinoAPI.detachInterrupt,
        arduinoAPI.HIGH,
        arduinoAPI.LOW,
        arduinoAPI.INPUT,
        arduinoAPI.OUTPUT,
        arduinoAPI.INPUT_PULLUP
      );

      const boundLoop = loopFn.bind(null,
        arduinoAPI.pinMode,
        arduinoAPI.digitalWrite,
        arduinoAPI.digitalRead,
        arduinoAPI.analogRead,
        arduinoAPI.analogWrite,
        arduinoAPI.delay,
        arduinoAPI.delayMicroseconds,
        arduinoAPI.millis,
        arduinoAPI.micros,
        arduinoAPI.Serial,
        arduinoAPI.attachInterrupt,
        arduinoAPI.detachInterrupt,
        arduinoAPI.HIGH,
        arduinoAPI.LOW,
        arduinoAPI.INPUT,
        arduinoAPI.OUTPUT,
        arduinoAPI.INPUT_PULLUP
      );

      // Load into runtime
      arduinoRuntime.loadCode(boundSetup, boundLoop);

      console.log('[Worker] Arduino code loaded successfully');
    } else {
      console.error('[Worker] Could not parse setup() and loop() functions');
    }
  } catch (error) {
    console.error('[Worker] Failed to load Arduino code:', error);
    postError(`Arduino code error: ${error}`);
  }
}

/**
 * Start simulation
 */
function handleRun(): void {
  if (!engine) {
    postError('Engine not initialized');
    return;
  }

  engine.start();

  // Start Arduino if available
  if (arduinoRuntime) {
    arduinoRuntime.start().catch(error => {
      postError(`Arduino runtime error: ${error}`);
    });
  }

  postEvent({
    type: 'STARTED',
    timestamp: Date.now(),
  });

  console.log('[Worker] Simulation started');

  // Start update loop
  requestAnimationFrame(updateLoop);
}

/**
 * Pause simulation
 */
function handlePause(): void {
  if (!engine) return;

  engine.stop();

  if (arduinoRuntime) {
    arduinoRuntime.stop();
  }

  postEvent({
    type: 'PAUSED',
    timestamp: Date.now(),
  });

  console.log('[Worker] Simulation paused');
}

/**
 * Step simulation
 */
function handleStep(steps: number): void {
  if (!engine) return;

  // TODO: Implement step mode in SimEngine
  console.log(`[Worker] Step ${steps} not implemented yet`);
}

/**
 * Reset simulation
 */
function handleReset(): void {
  if (!engine) return;

  engine.reset();

  if (arduinoRuntime) {
    arduinoRuntime.stop();
  }

  postEvent({
    type: 'RESET',
    timestamp: Date.now(),
  });

  console.log('[Worker] Simulation reset');
}

/**
 * Set pin value (for button press, etc.)
 */
function handleSetPin(pin: { component: string; pin: string }, value: number): void {
  if (!graph) return;

  // Update pin state in graph
  const state: PinState = {
    digital: value > 0.5 ? 1 : 0,
    voltage: value,
  };

  graph.setPinState(pin, state);

  console.log(`[Worker] Set pin ${pin.component}:${pin.pin} = ${value}`);
}

/**
 * Set simulation speed
 */
function handleSetSpeed(speed: number): void {
  if (!engine) return;

  // TODO: Implement speed control in SimEngine
  console.log(`[Worker] Speed ${speed}x`);
}

/**
 * Get current state snapshot
 */
function handleGetState(): void {
  if (!engine || !graph) return;

  const nets = graph.getNets();
  const pinStates = new Map<string, PinState>();

  // Collect all pin states
  for (const net of nets) {
    for (const pin of net.pins) {
      const key = `${pin.component}:${pin.pin}`;
      pinStates.set(key, net.state);
    }
  }

  postEvent({
    type: 'STATE_UPDATE',
    timestamp: Date.now(),
    data: {
      time_us: engine.getCurrentTime(),
      pinStates: Array.from(pinStates.entries()).map(([key, state]) => ({ key, state })),
    },
  });
}

/**
 * Update component properties
 */
function handleUpdateComponent(componentId: string, properties: Record<string, any>): void {
  // TODO: Update component in engine
  console.log(`[Worker] Update component ${componentId}:`, properties);
}

/**
 * Add wire (dynamic)
 */
function handleAddWire(wire: Wire): void {
  if (!graph) return;

  graph.addWire(wire);

  postEvent({
    type: 'WIRE_ADDED',
    timestamp: Date.now(),
    data: { wireId: wire.id },
  });

  console.log(`[Worker] Wire added: ${wire.id}`);
}

/**
 * Remove wire (dynamic)
 */
function handleRemoveWire(wireId: string): void {
  if (!graph) return;

  graph.removeWire(wireId);

  postEvent({
    type: 'WIRE_REMOVED',
    timestamp: Date.now(),
    data: { wireId },
  });

  console.log(`[Worker] Wire removed: ${wireId}`);
}

// =============================================================================
// UPDATE LOOP
// =============================================================================

let lastUpdateTime = 0;

function updateLoop(timestamp: number): void {
  if (!engine || !engine.isRunning()) return;

  const delta = lastUpdateTime ? timestamp - lastUpdateTime : 0;
  lastUpdateTime = timestamp;

  try {
    // Run simulation tick
    engine.tick(delta);

    // Send state updates (throttled to 60fps)
    handleGetState();

    // Update stats
    eventsPerSecond++;
    const now = Date.now();
    if (now - lastStatsTime >= 1000) {
      postEvent({
        type: 'STATS',
        timestamp: now,
        data: {
          fps: eventsPerSecond,
          simTime_us: engine.getCurrentTime(),
          messageCount,
        },
      });

      eventsPerSecond = 0;
      lastStatsTime = now;
    }

    // Continue loop
    requestAnimationFrame(updateLoop);
  } catch (error) {
    postError(`Update loop error: ${error}`);
    handlePause();
  }
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Post event to main thread
 */
function postEvent(event: WorkerEvent): void {
  self.postMessage(event);
}

/**
 * Post error event
 */
function postError(message: string): void {
  postEvent({
    type: 'ERROR',
    timestamp: Date.now(),
    data: { message },
  });
}

// =============================================================================
// INITIALIZATION
// =============================================================================

console.log('[Worker] Circuit Simulator Worker started');

postEvent({
  type: 'READY',
  timestamp: Date.now(),
});
