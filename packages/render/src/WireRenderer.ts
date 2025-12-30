/**
 * GPU Instanced Wire Renderer
 * Renders ALL wires in a single draw call for maximum performance
 *
 * Architecture:
 * - Uses InstancedBufferGeometry (one instance per wire segment)
 * - Custom shaders for flow visualization
 * - Support for 5 flow modes: Off, Glow, Pulse, PWM, Power
 * - Target: 500+ wires @ 60fps
 *
 * Flow Modes:
 * - OFF: Static wire color (no animation)
 * - GLOW: Idle state with subtle pulse
 * - PULSE: Digital edge packets (moving dots)
 * - PWM: Duty cycle stream (brightness = duty)
 * - POWER: Voltage level (color gradient)
 */

import * as THREE from 'three';
import type { Wire, WireState, PinState } from '@circuit-sim/kernel/contracts';

export enum FlowMode {
  OFF = 0,
  GLOW = 1,
  PULSE = 2,
  PWM = 3,
  POWER = 4,
}

interface WireSegment {
  wire: Wire;
  segmentIndex: number;
  start: THREE.Vector3;
  end: THREE.Vector3;
  flowTime: number;
  flowMode: FlowMode;
  voltage: number;
  pwmDuty: number;
}

/**
 * Wire Renderer - GPU Instanced
 */
export class WireRenderer {
  private scene: THREE.Scene;
  private geometry: THREE.InstancedBufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.InstancedMesh;

  private wires: Map<string, Wire>;
  private segments: WireSegment[];
  private maxInstances: number;

  // Instance attributes
  private segmentStartAttr: THREE.InstancedBufferAttribute;
  private segmentEndAttr: THREE.InstancedBufferAttribute;
  private flowTimeAttr: THREE.InstancedBufferAttribute;
  private flowModeAttr: THREE.InstancedBufferAttribute;
  private wireColorAttr: THREE.InstancedBufferAttribute;
  private voltageAttr: THREE.InstancedBufferAttribute;
  private pwmDutyAttr: THREE.InstancedBufferAttribute;

  // Animation
  private clock: THREE.Clock;
  private globalFlowSpeed: number = 2.0; // Units per second

  constructor(scene: THREE.Scene, maxWires: number = 1000) {
    this.scene = scene;
    this.wires = new Map();
    this.segments = [];
    this.maxInstances = maxWires * 10; // Assume avg 10 segments per wire
    this.clock = new THREE.Clock();

    this.setupGeometry();
    this.setupMaterial();
    this.setupMesh();
  }

  /**
   * Setup base geometry (single line segment)
   */
  private setupGeometry(): void {
    // Base geometry: a simple line segment from (0,0,0) to (1,0,0)
    // Will be transformed by instance attributes
    const positions = new Float32Array([
      0, 0, 0,  // Start
      1, 0, 0,  // End
    ]);

    this.geometry = new THREE.InstancedBufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Instanced attributes (one per wire segment)
    const startArray = new Float32Array(this.maxInstances * 3);
    const endArray = new Float32Array(this.maxInstances * 3);
    const flowTimeArray = new Float32Array(this.maxInstances);
    const flowModeArray = new Float32Array(this.maxInstances);
    const colorArray = new Float32Array(this.maxInstances * 3);
    const voltageArray = new Float32Array(this.maxInstances);
    const pwmDutyArray = new Float32Array(this.maxInstances);

    this.segmentStartAttr = new THREE.InstancedBufferAttribute(startArray, 3);
    this.segmentEndAttr = new THREE.InstancedBufferAttribute(endArray, 3);
    this.flowTimeAttr = new THREE.InstancedBufferAttribute(flowTimeArray, 1);
    this.flowModeAttr = new THREE.InstancedBufferAttribute(flowModeArray, 1);
    this.wireColorAttr = new THREE.InstancedBufferAttribute(colorArray, 3);
    this.voltageAttr = new THREE.InstancedBufferAttribute(voltageArray, 1);
    this.pwmDutyAttr = new THREE.InstancedBufferAttribute(pwmDutyArray, 1);

    this.geometry.setAttribute('segmentStart', this.segmentStartAttr);
    this.geometry.setAttribute('segmentEnd', this.segmentEndAttr);
    this.geometry.setAttribute('flowTime', this.flowTimeAttr);
    this.geometry.setAttribute('flowMode', this.flowModeAttr);
    this.geometry.setAttribute('wireColor', this.wireColorAttr);
    this.geometry.setAttribute('voltage', this.voltageAttr);
    this.geometry.setAttribute('pwmDuty', this.pwmDutyAttr);
  }

  /**
   * Setup shader material
   */
  private setupMaterial(): void {
    this.material = new THREE.ShaderMaterial({
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      uniforms: {
        time: { value: 0 },
        flowSpeed: { value: this.globalFlowSpeed },
        wireThickness: { value: 0.02 },
      },
      transparent: true,
      depthWrite: true,
      blending: THREE.AdditiveBlending,
    });
  }

  /**
   * Setup instanced mesh
   */
  private setupMesh(): void {
    // Dummy geometry for InstancedMesh (will use custom shader)
    const dummyGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1, 6);

    this.mesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      this.maxInstances
    );

    this.mesh.count = 0; // Start with no instances
    this.scene.add(this.mesh);
  }

  /**
   * Add or update a wire
   */
  addWire(wire: Wire, state: WireState): void {
    this.wires.set(wire.id, wire);
    this.rebuildSegments();
    this.updateWireState(wire.id, state);
  }

  /**
   * Remove a wire
   */
  removeWire(wireId: string): void {
    this.wires.delete(wireId);
    this.rebuildSegments();
  }

  /**
   * Update wire state (flow mode, voltage, etc.)
   */
  updateWireState(wireId: string, state: WireState): void {
    const wire = this.wires.get(wireId);
    if (!wire) return;

    // Find all segments for this wire
    const wireSegments = this.segments.filter(s => s.wire.id === wireId);

    // Determine flow mode
    let flowMode = FlowMode.OFF;
    if (state.flow === 'glow') flowMode = FlowMode.GLOW;
    else if (state.flow === 'pulse') flowMode = FlowMode.PULSE;
    else if (state.flow === 'pwm') flowMode = FlowMode.PWM;
    else if (state.flow === 'power') flowMode = FlowMode.POWER;

    // Update each segment
    for (const segment of wireSegments) {
      segment.flowMode = flowMode;
      segment.voltage = state.voltage;
      segment.pwmDuty = state.current; // Using current field as PWM duty for now
    }

    this.updateInstanceAttributes();
  }

  /**
   * Rebuild wire segments from wire points
   */
  private rebuildSegments(): void {
    this.segments = [];

    for (const wire of this.wires.values()) {
      const points = wire.points;

      // Create segments between consecutive points
      for (let i = 0; i < points.length - 1; i++) {
        const start = new THREE.Vector3(points[i].x, points[i].y, points[i].z);
        const end = new THREE.Vector3(points[i + 1].x, points[i + 1].y, points[i + 1].z);

        this.segments.push({
          wire,
          segmentIndex: i,
          start,
          end,
          flowTime: 0,
          flowMode: FlowMode.GLOW,
          voltage: 0,
          pwmDuty: 0,
        });
      }
    }

    this.updateInstanceAttributes();
    this.mesh.count = this.segments.length;
  }

  /**
   * Update instance attributes from segments
   */
  private updateInstanceAttributes(): void {
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];

      // Segment start/end
      this.segmentStartAttr.setXYZ(i, seg.start.x, seg.start.y, seg.start.z);
      this.segmentEndAttr.setXYZ(i, seg.end.x, seg.end.y, seg.end.z);

      // Flow state
      this.flowTimeAttr.setX(i, seg.flowTime);
      this.flowModeAttr.setX(i, seg.flowMode);
      this.voltageAttr.setX(i, seg.voltage);
      this.pwmDutyAttr.setX(i, seg.pwmDuty);

      // Wire color
      const color = this.getWireColor(seg);
      this.wireColorAttr.setXYZ(i, color.r, color.g, color.b);
    }

    // Mark attributes as needing update
    this.segmentStartAttr.needsUpdate = true;
    this.segmentEndAttr.needsUpdate = true;
    this.flowTimeAttr.needsUpdate = true;
    this.flowModeAttr.needsUpdate = true;
    this.wireColorAttr.needsUpdate = true;
    this.voltageAttr.needsUpdate = true;
    this.pwmDutyAttr.needsUpdate = true;
  }

  /**
   * Get wire color based on voltage/state
   */
  private getWireColor(segment: WireSegment): THREE.Color {
    // Custom wire color if specified
    if (segment.wire.color) {
      return new THREE.Color(segment.wire.color);
    }

    // Voltage-based color
    if (segment.flowMode === FlowMode.POWER) {
      if (segment.voltage > 4.0) return new THREE.Color(0xff0000); // Red (5V)
      if (segment.voltage > 2.5) return new THREE.Color(0xffaa00); // Orange (3.3V)
      if (segment.voltage > 0.5) return new THREE.Color(0xffff00); // Yellow (1.8V)
      return new THREE.Color(0x333333); // Dark (GND)
    }

    // Default cyan
    return new THREE.Color(0x00ffff);
  }

  /**
   * Update animation (call every frame)
   */
  update(): void {
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Update global time uniform
    this.material.uniforms.time.value = time;

    // Update flow time for each segment
    for (const segment of this.segments) {
      segment.flowTime += delta * this.globalFlowSpeed;
    }

    this.updateInstanceAttributes();
  }

  /**
   * Set global flow speed
   */
  setFlowSpeed(speed: number): void {
    this.globalFlowSpeed = speed;
    this.material.uniforms.flowSpeed.value = speed;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.mesh);
  }

  // ==========================================================================
  // SHADERS
  // ==========================================================================

  /**
   * Vertex Shader
   */
  private getVertexShader(): string {
    return `
      // Instance attributes
      attribute vec3 segmentStart;
      attribute vec3 segmentEnd;
      attribute float flowTime;
      attribute float flowMode;
      attribute vec3 wireColor;
      attribute float voltage;
      attribute float pwmDuty;

      // Uniforms
      uniform float time;
      uniform float flowSpeed;
      uniform float wireThickness;

      // Varyings
      varying vec3 vColor;
      varying float vFlow;
      varying float vFlowMode;
      varying float vBrightness;

      void main() {
        // Interpolate along segment (position.x is 0 or 1)
        vec3 pos = mix(segmentStart, segmentEnd, position.x);

        // Calculate flow position
        float flowPos = fract(flowTime - position.x);

        // Flow brightness based on mode
        vFlowMode = flowMode;
        vBrightness = 1.0;

        if (flowMode == 1.0) {
          // GLOW: Subtle pulse
          vBrightness = 0.3 + 0.2 * sin(time * 2.0);
        } else if (flowMode == 2.0) {
          // PULSE: Moving dots
          vFlow = flowPos;
          vBrightness = smoothstep(0.0, 0.1, flowPos) * smoothstep(1.0, 0.9, flowPos);
        } else if (flowMode == 3.0) {
          // PWM: Duty cycle
          float pwmCycle = fract(time * 490.0); // 490 Hz Arduino PWM
          vBrightness = step(pwmCycle, pwmDuty) * 0.8 + 0.2;
        } else if (flowMode == 4.0) {
          // POWER: Voltage-based brightness
          vBrightness = voltage / 5.0;
        } else {
          // OFF
          vBrightness = 0.1;
        }

        vColor = wireColor;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = wireThickness * 100.0 / gl_Position.w;
      }
    `;
  }

  /**
   * Fragment Shader
   */
  private getFragmentShader(): string {
    return `
      varying vec3 vColor;
      varying float vFlow;
      varying float vFlowMode;
      varying float vBrightness;

      void main() {
        vec3 color = vColor * vBrightness;

        // Add extra glow for pulse mode
        if (vFlowMode == 2.0) {
          float pulse = smoothstep(0.9, 1.0, vFlow);
          color += vec3(1.0, 1.0, 1.0) * pulse * 2.0;
        }

        gl_FragColor = vec4(color, vBrightness);
      }
    `;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      wires: this.wires.size,
      segments: this.segments.length,
      instances: this.mesh.count,
    };
  }
}
