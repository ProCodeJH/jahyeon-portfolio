/**
 * Circuit Kernel Types
 * Core types for connectivity graph and net resolution
 */

export type PinType = 'digital' | 'analog' | 'power' | 'ground' | 'pwm';
export type PinDirection = 'input' | 'output' | 'bidirectional';
export type SignalState = 'LOW' | 'HIGH' | 'HIGH_Z' | 'UNKNOWN';

export interface Pin {
  id: string;
  componentId: string;
  name: string;
  type: PinType;
  direction: PinDirection;
  state: SignalState;
  voltage: number;
  pwmDuty?: number; // 0-255 for PWM
  position: { x: number; y: number; z: number };
}

export interface Component {
  id: string;
  type: ComponentType;
  name: string;
  pins: Pin[];
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  properties: Record<string, unknown>;
}

export type ComponentType =
  | 'arduino_uno'
  | 'breadboard'
  | 'led'
  | 'resistor'
  | 'button'
  | 'potentiometer'
  | 'capacitor'
  | 'servo'
  | 'lcd'
  | 'buzzer';

export interface Wire {
  id: string;
  startPinId: string;
  endPinId: string;
  color: string;
  netId?: string;
}

export interface Net {
  id: string;
  pins: string[]; // Pin IDs
  wires: string[]; // Wire IDs
  state: SignalState;
  voltage: number;
  driverPinId?: string;
}

export interface Circuit {
  id: string;
  name: string;
  components: Map<string, Component>;
  wires: Map<string, Wire>;
  nets: Map<string, Net>;
}

export interface SimulationEvent {
  time: number; // microseconds
  type: 'pin_change' | 'component_update' | 'net_update';
  targetId: string;
  data: Record<string, unknown>;
}

export interface SimulationState {
  time: number;
  running: boolean;
  speed: number; // 1.0 = real-time
  components: Map<string, ComponentState>;
  nets: Map<string, NetState>;
}

export interface ComponentState {
  componentId: string;
  pins: Map<string, PinState>;
  internal: Record<string, unknown>;
}

export interface PinState {
  pinId: string;
  state: SignalState;
  voltage: number;
  pwmDuty?: number;
  lastChange: number;
}

export interface NetState {
  netId: string;
  state: SignalState;
  voltage: number;
  drivers: string[];
  receivers: string[];
}
