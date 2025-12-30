/**
 * Core types for circuit simulation
 */

export type ComponentType =
  | 'arduino-uno'
  | 'led'
  | 'button'
  | 'resistor'
  | 'capacitor'
  | 'breadboard'
  | 'wire'
  | 'pir-sensor'
  | 'ultrasonic'
  | 'servo'
  | 'photoresistor'
  | 'dht22';

export type PinType = 'digital' | 'analog' | 'power' | 'ground';

export interface Pin {
  id: string;
  componentId: string;
  name: string;
  type: PinType;
  number?: number;
}

export interface Component {
  id: string;
  type: ComponentType;
  position: { x: number; y: number };
  rotation: number;
  properties?: Record<string, any>;
}

export interface Wire {
  id: string;
  from: { componentId: string; pinId: string };
  to: { componentId: string; pinId: string };
  points?: Array<{ x: number; y: number }>;
}

export interface Net {
  id: string;
  pins: Pin[];
  state: 'HIGH' | 'LOW' | 'FLOATING';
  voltage?: number;
}

export interface CircuitState {
  components: Component[];
  wires: Wire[];
  nets: Net[];
  time: number; // Simulation time in microseconds
}

export interface SimulationEvent {
  type: 'pin_change' | 'edge' | 'pwm_update';
  timestamp: number;
  netId: string;
  data?: any;
}
