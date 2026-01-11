// Arduino Lab Types - Component, Pin, Wire, and Circuit definitions

// ============================================
// PIN TYPES
// ============================================
export type PinType = 'digital' | 'analog' | 'power' | 'ground' | 'pwm';
export type PinMode = 'input' | 'output' | 'input_pullup' | 'unset';
export type PinState = 'high' | 'low' | 'floating';

export interface Pin {
    id: string;
    name: string;
    type: PinType;
    mode: PinMode;
    state: PinState;
    voltage: number;       // 0-5V
    current: number;       // mA
    localX: number;        // Relative to component
    localY: number;
    nodeId?: string;       // Circuit node this pin belongs to
    avrPort?: string;      // e.g., 'PORTD', 'PORTB'
    avrBit?: number;       // 0-7
    arduinoPin?: number;   // D0-D13, A0-A5
}

// ============================================
// COMPONENT TYPES
// ============================================
export type ComponentType =
    | 'arduino-uno'
    | 'led'
    | 'resistor'
    | 'button'
    | 'breadboard'
    | 'potentiometer'
    | 'capacitor'
    | 'wire-jumper';

export interface Component {
    id: string;
    type: ComponentType;
    x: number;
    y: number;
    rotation: number;      // 0, 90, 180, 270
    pins: Pin[];
    properties: ComponentProperties;
    selected: boolean;
    zIndex: number;
}

export interface ComponentProperties {
    // Resistor
    resistance?: number;   // Ohms

    // LED
    color?: 'red' | 'green' | 'blue' | 'yellow' | 'white';
    forwardVoltage?: number;
    brightness?: number;   // 0-1

    // Capacitor
    capacitance?: number;  // Farads

    // Potentiometer
    position?: number;     // 0-1
    maxResistance?: number;

    // General
    label?: string;
    value?: string;
}

// ============================================
// WIRE TYPES
// ============================================
export interface Wire {
    id: string;
    startPin: PinReference;
    endPin: PinReference;
    color: string;
    points: { x: number; y: number }[];  // Path points
    selected: boolean;
}

export interface PinReference {
    componentId: string;
    pinId: string;
}

// ============================================
// CIRCUIT TYPES
// ============================================
export interface CircuitNode {
    id: string;
    voltage: number;
    pins: PinReference[];
}

export interface Circuit {
    components: Component[];
    wires: Wire[];
    nodes: CircuitNode[];
}

// ============================================
// SIMULATION TYPES
// ============================================
export interface SimulationState {
    running: boolean;
    speed: number;         // 1 = realtime
    cpuCycles: number;
    time: number;          // ms since start
}

export interface SerialMessage {
    id: string;
    timestamp: number;
    direction: 'tx' | 'rx';
    data: string;
}

// ============================================
// CANVAS STATE
// ============================================
export interface CanvasState {
    scale: number;
    position: { x: number; y: number };
    gridSize: number;
    snapToGrid: boolean;
}

export interface DragState {
    dragging: boolean;
    componentType?: ComponentType;
    startPos?: { x: number; y: number };
}

export interface WiringState {
    active: boolean;
    startPin?: PinReference;
    currentPath: { x: number; y: number }[];
}

// ============================================
// COMPONENT DEFINITIONS (Templates)
// ============================================
export interface ComponentDefinition {
    type: ComponentType;
    name: string;
    description: string;
    category: 'microcontroller' | 'passive' | 'active' | 'io' | 'other';
    width: number;
    height: number;
    defaultPins: Omit<Pin, 'id'>[];
    defaultProperties: ComponentProperties;
    icon: string;  // SVG path or emoji
}

// ============================================
// HELPERS
// ============================================
export const createId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const pinColors: Record<PinType, string> = {
    digital: '#3B82F6',  // Blue
    analog: '#10B981',   // Green  
    power: '#EF4444',    // Red
    ground: '#1F2937',   // Dark gray
    pwm: '#F59E0B',      // Amber
};

export const componentColors: Record<ComponentType, string> = {
    'arduino-uno': '#008184',
    'led': '#EF4444',
    'resistor': '#D4A574',
    'button': '#6B7280',
    'breadboard': '#F5F5DC',
    'potentiometer': '#3B82F6',
    'capacitor': '#8B5CF6',
    'wire-jumper': '#000000',
};
