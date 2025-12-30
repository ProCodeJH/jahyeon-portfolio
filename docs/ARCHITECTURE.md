# Circuit Simulator Architecture Design
**Version:** 1.0
**Date:** 2025-12-30
**Status:** Design Phase

---

## Executive Summary

This document defines the architecture for a **Tinkercad-superior web-based Circuit + Arduino + 3D Simulator**. The system is designed for:
- **60fps @ 200+ parts, 500+ wires** on mid-tier laptops
- **Complete separation** of rendering (UI thread) and simulation (WebWorker)
- **Event-driven digital + fixed-step analog** hybrid simulation
- **Arduino API virtualization** (not AVR emulation)
- **GPU-friendly instanced wire rendering** with flow visualization

---

## Core Principles

### 1. **Separation of Concerns**
```
┌─────────────────────────────────────────────────────────┐
│                     UI Thread                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   React UI   │  │  Three.js    │  │    Audio     │  │
│  │   (Editor)   │  │  (Renderer)  │  │   (Buzzer)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │          │
│         └─────────────────┴─────────────────┘          │
│                           │                            │
│                    RenderBridge                        │
│                     (Messages)                         │
└───────────────────────────┼──────────────────────────────┘
                            │ (MessageChannel)
┌───────────────────────────┼──────────────────────────────┐
│                    SimWorker Thread                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Connectivity │  │   SimEngine  │  │ McuRuntime   │  │
│  │    Graph     │  │  (Event-Drv) │  │  (Arduino)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │          │
│         └─────────────────┴─────────────────┘          │
│                    SimKernel                           │
└─────────────────────────────────────────────────────────┘
```

### 2. **Message-Based Communication**
- **No shared state** between UI and Sim threads
- All communication via **structured messages** (snapshots)
- UI sends: `SetWireCommand`, `RunSimCommand`, `StepCommand`
- Sim sends: `StateSnapshot`, `PinChangeEvent`, `SerialOutputEvent`

### 3. **Contract-Driven Interfaces**
```typescript
// Contracts (packages/kernel/contracts.ts)
interface ComponentDef {
  type: string;
  pins: PinDef[];
  simulation: SimBehavior;
  render: RenderDef;
}

interface Net {
  id: string;
  pins: PinRef[];
  voltage: number;    // Analog value
  digital: DigitalState; // HIGH/LOW/Z/CONFLICT
}

interface SimSnapshot {
  timestamp_us: number;
  nets: Map<string, NetState>;
  components: Map<string, ComponentState>;
}
```

---

## Threading Model

### UI Thread Responsibilities
- **Rendering**: Three.js scene, wire flow animations
- **User Input**: Drag-and-drop, property editing
- **Audio**: Buzzer/speaker output (Web Audio API)
- **File I/O**: Save/load projects

### Worker Thread Responsibilities
- **Simulation**: All physics, timing, MCU execution
- **Net Resolution**: Union-Find incremental updates
- **Event Queue**: Digital edge events, analog steps
- **Component Logic**: Arduino, sensors, actuators

### Communication Protocol
```typescript
// UI → Worker
type Command =
  | { type: 'INIT'; circuit: CircuitDef }
  | { type: 'RUN'; code: string }
  | { type: 'PAUSE' }
  | { type: 'STEP'; micros: number }
  | { type: 'SET_PIN'; pin: PinRef; value: number };

// Worker → UI
type Event =
  | { type: 'STATE'; snapshot: SimSnapshot }
  | { type: 'PIN_CHANGE'; pin: PinRef; digital: boolean; analog: number }
  | { type: 'SERIAL'; text: string }
  | { type: 'ERROR'; message: string };
```

---

## Connectivity Graph

### Data Structure
```typescript
// Union-Find with path compression
class ConnectivityGraph {
  private parent: Map<string, string>;
  private rank: Map<string, number>;

  // O(α(n)) amortized
  find(pin: PinRef): string;

  // O(α(n)) amortized
  union(pin1: PinRef, pin2: PinRef): void;

  // Incremental net building
  addWire(from: PinRef, to: PinRef): Net;
  removeWire(wireId: string): Net[];

  // Get all pins in a net
  getNet(pin: PinRef): Net;
}
```

### Net Resolution
1. **Wire added**: Union-Find merge, propagate state
2. **Wire removed**: Rebuild affected nets only (incremental)
3. **State change**: Update entire net atomically
4. **Conflict detection**: Multiple drivers on same net → CONFLICT state

---

## Simulation Engine

### Event-Driven Digital Simulation
```typescript
class SimEngine {
  private eventQueue: PriorityQueue<SimEvent>;
  private currentTime_us: number;

  // Main loop
  async run(): Promise<void> {
    while (!stopped) {
      // Process events until next analog step
      while (eventQueue.peek().time <= nextAnalogTime) {
        const event = eventQueue.pop();
        await processEvent(event);
      }

      // Fixed-step analog update (e.g., every 100µs)
      await processAnalogStep();
      nextAnalogTime += ANALOG_STEP_US;
    }
  }

  // Event types
  interface SimEvent {
    time_us: number;
    type: 'EDGE' | 'TIMER' | 'ANALOG' | 'MCU';
    target: ComponentRef;
    data: any;
  }
}
```

### Time Granularity
- **Base unit**: Microseconds (µs)
- **Digital events**: Exact timing (edge-triggered)
- **Analog steps**: Fixed 100µs intervals (configurable)
- **MCU clock**: 16MHz = 62.5ns per instruction
  - **Simplified**: Execute N instructions per µs

---

## Arduino Runtime (API Virtualization)

### Not AVR Emulation
```typescript
// BAD: Full AVR emulator
class AVR8 {
  execute(opcode: number): void { /* 100+ opcodes */ }
}

// GOOD: Arduino API virtualization
class ArduinoRuntime {
  // Pin API
  pinMode(pin: number, mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'): void;
  digitalWrite(pin: number, value: HIGH | LOW): void;
  digitalRead(pin: number): number;
  analogRead(pin: number): number; // 0-1023
  analogWrite(pin: number, value: number); // PWM 0-255

  // Time API
  delay(ms: number): void;      // Yield to event loop
  delayMicroseconds(us: number): void;
  millis(): number;
  micros(): number;

  // Serial API
  Serial.begin(baud: number): void;
  Serial.print(data: any): void;
  Serial.println(data: any): void;
  Serial.available(): number;
  Serial.read(): number;
}
```

### Code Execution
```typescript
// User code (transpiled to JS)
function setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

function loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}

// Runtime wraps this
class McuRuntime {
  private userSetup: () => void;
  private userLoop: () => void;

  async run(): Promise<void> {
    await this.userSetup();
    while (true) {
      await this.userLoop();
    }
  }
}
```

---

## Wire Rendering

### GPU Instanced Rendering
```typescript
// BAD: Per-wire SVG/DOM
<svg>
  {wires.map(w => <path d={w.path} />)} {/* 500 DOM nodes! */}
</svg>

// GOOD: Instanced line segments
class WireRenderer {
  private geometry: InstancedBufferGeometry;
  private material: ShaderMaterial;

  // All wires in ONE draw call
  render(wires: Wire[]): void {
    // Update instance buffer
    for (let i = 0; i < wires.length; i++) {
      instanceBuffer.set(wires[i].segments, i * segmentSize);
    }

    // Single GPU draw
    renderer.render(scene, camera);
  }
}
```

### Flow Visualization Modes
1. **Off**: Static wire color
2. **Glow**: Idle state (dim pulse)
3. **Pulse**: Digital edge packets (moving dots)
4. **PWM**: Duty cycle stream (brightness = duty)
5. **Power**: Voltage level (color gradient)

### Shader Implementation
```glsl
// Vertex shader (wire_flow.vert)
attribute vec3 segmentStart;
attribute vec3 segmentEnd;
attribute float flowTime;
attribute float flowMode;

varying float vFlow;

void main() {
  // Interpolate along segment
  vec3 pos = mix(segmentStart, segmentEnd, position.x);

  // Flow animation
  if (flowMode == PULSE) {
    vFlow = fract(flowTime - position.x);
  } else if (flowMode == PWM) {
    vFlow = step(pwmDuty, fract(flowTime));
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

// Fragment shader (wire_flow.frag)
varying float vFlow;
uniform vec3 wireColor;

void main() {
  // Pulse: bright dots
  float brightness = flowMode == PULSE ? smoothstep(0.9, 1.0, vFlow) : 1.0;
  gl_FragColor = vec4(wireColor * brightness, 1.0);
}
```

---

## Component Plugin System

### Component Definition
```typescript
interface ComponentDef {
  id: string;
  name: string;
  category: string;
  pins: PinDef[];

  // Simulation behavior
  simulate(ctx: SimContext): void;

  // 3D model (lazy load)
  model: () => Promise<GLTF>;

  // Properties
  properties: PropertyDef[];
}

// Example: LED component
const LED: ComponentDef = {
  id: 'led',
  name: 'LED (5mm)',
  pins: [
    { id: 'anode', type: 'digital', position: [0, 0, 0] },
    { id: 'cathode', type: 'digital', position: [0, 0.5, 0] }
  ],

  simulate(ctx) {
    const v_anode = ctx.getPin('anode').voltage;
    const v_cathode = ctx.getPin('cathode').voltage;
    const v_drop = v_anode - v_cathode;

    // LED forward voltage ~2V, current = (V-Vf)/R
    if (v_drop > 2.0) {
      ctx.setState({ brightness: Math.min(1, (v_drop - 2.0) / 3.0) });
    } else {
      ctx.setState({ brightness: 0 });
    }
  },

  model: () => import('./models/led.glb'),

  properties: [
    { id: 'color', type: 'color', default: '#ff0000' }
  ]
};
```

---

## Logic Analyzer

### Architecture
```typescript
class LogicAnalyzer {
  private channels: AnalogChannel[];
  private buffer: CircularBuffer<Sample>;
  private trigger: Trigger;

  // Sampling
  addSample(time_us: number, values: number[]): void {
    if (trigger.check(values)) {
      this.startCapture();
    }
    buffer.push({ time_us, values });
  }

  // Export
  exportVCD(): string; // Value Change Dump format
  exportCSV(): string;
}

interface Trigger {
  type: 'EDGE' | 'LEVEL' | 'PATTERN';
  channel: number;
  condition: any;

  check(values: number[]): boolean;
}
```

---

## Performance Targets

### Metrics
- **FPS**: 60fps @ 200 parts, 500 wires
- **Simulation Rate**: 1MHz virtual (16x real-time for 16MHz Arduino)
- **Wire Rendering**: <2ms per frame
- **Net Resolution**: <1ms for wire add/remove
- **Memory**: <500MB for large circuit

### Optimization Strategies
1. **Object Pooling**: Reuse event objects
2. **Dirty Flags**: Only update changed nets
3. **LOD**: Simplify distant components
4. **Frustum Culling**: Skip off-screen wires
5. **Web Workers**: Offload simulation

---

## File Format

### Project JSON
```json
{
  "version": "1.0",
  "components": [
    {
      "id": "uno1",
      "type": "arduino-uno",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "properties": {}
    }
  ],
  "wires": [
    {
      "id": "w1",
      "from": { "component": "uno1", "pin": "D13" },
      "to": { "component": "led1", "pin": "anode" },
      "points": [[0,0,0], [1,0.5,0], [2,0,0]]
    }
  ],
  "code": {
    "setup": "...",
    "loop": "..."
  }
}
```

---

## Testing Strategy

### Unit Tests
- `ConnectivityGraph`: Union-Find correctness
- `SimEngine`: Event ordering, timing
- `ArduinoRuntime`: Pin API behavior

### Integration Tests
- End-to-End: Button → Arduino → LED
- Net resolution: Complex wire networks
- Performance: 60fps @ target load

### Regression Tests
- Sample projects: Blink, Serial, PWM, AnalogRead
- FPS benchmark: Automated headless rendering
- Memory leak detection: Long-running sims

---

## Deliverables Checklist

- [ ] 1. Design document (this file)
- [ ] 2. Core TypeScript interfaces
- [ ] 3. End-to-End demo (UNO + LED + Button + Serial)
- [ ] 4. Wire renderer with flow modes
- [ ] 5. Logic Analyzer (minimal)
- [ ] 6. Save/load + undo/redo
- [ ] 7. Performance tests

---

## Next Steps

1. **Review & Approve** this design
2. **Define TypeScript interfaces** (contracts.ts)
3. **Setup monorepo** structure
4. **Implement Connectivity Graph** + tests
5. **Build SimEngine** skeleton in WebWorker
6. **Create Arduino Runtime** API
7. **Integrate End-to-End** demo

---

**Document Owner**: Claude (Principal Engineer)
**Last Updated**: 2025-12-30
**Status**: ✅ Ready for Review
