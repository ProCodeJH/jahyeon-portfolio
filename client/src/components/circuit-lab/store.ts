/**
 * Circuit Lab State Management
 */

import { create } from 'zustand';

// Types
export type ComponentType = 'arduino' | 'breadboard' | 'led' | 'resistor' | 'button';

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  position: [number, number, number];
  rotation: [number, number, number];
  properties?: {
    color?: string;
    isOn?: boolean;
    brightness?: number;
    value?: number;
    isPressed?: boolean;
    [key: string]: unknown;
  };
}

export interface Wire {
  id: string;
  startPoint: [number, number, number];
  endPoint: [number, number, number];
  color: string;
}

interface CircuitState {
  // Circuit data
  components: CircuitComponent[];
  wires: Wire[];

  // UI state
  selectedId: string | null;
  isWiring: boolean;
  wireColor: string;

  // Simulation
  isSimulating: boolean;
  serialOutput: string;

  // Code
  code: string;

  // Actions
  addComponent: (component: Omit<CircuitComponent, 'id'>) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<CircuitComponent>) => void;
  setSelectedId: (id: string | null) => void;
  addWire: (wire: Omit<Wire, 'id'>) => void;
  removeWire: (id: string) => void;
  setWireColor: (color: string) => void;
  setSimulating: (isSimulating: boolean) => void;
  appendSerial: (text: string) => void;
  clearSerial: () => void;
  setCode: (code: string) => void;
  reset: () => void;
}

const DEFAULT_CODE = `// Arduino Blink Example
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Blink started!");
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("LED ON");
  delay(1000);

  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
`;

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const useCircuitStore = create<CircuitState>((set) => ({
  // Initial state
  components: [],
  wires: [],
  selectedId: null,
  isWiring: false,
  wireColor: '#ff0000',
  isSimulating: false,
  serialOutput: '',
  code: DEFAULT_CODE,

  // Actions
  addComponent: (component) => {
    set((state) => ({
      components: [
        ...state.components,
        { ...component, id: `${component.type}_${generateId()}` },
      ],
    }));
  },

  removeComponent: (id) => {
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  updateComponent: (id, updates) => {
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  setSelectedId: (id) => set({ selectedId: id }),

  addWire: (wire) => {
    set((state) => ({
      wires: [...state.wires, { ...wire, id: `wire_${generateId()}` }],
    }));
  },

  removeWire: (id) => {
    set((state) => ({
      wires: state.wires.filter((w) => w.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  setWireColor: (color) => set({ wireColor: color }),

  setSimulating: (isSimulating) => set({ isSimulating }),

  appendSerial: (text) => {
    set((state) => ({
      serialOutput: state.serialOutput + text + '\n',
    }));
  },

  clearSerial: () => set({ serialOutput: '' }),

  setCode: (code) => set({ code }),

  reset: () => {
    set({
      components: [],
      wires: [],
      selectedId: null,
      isWiring: false,
      isSimulating: false,
      serialOutput: '',
    });
  },
}));
