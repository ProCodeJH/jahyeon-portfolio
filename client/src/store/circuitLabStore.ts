/**
 * CAD-Grade Circuit Lab Store
 * Data-first architecture with Zustand
 *
 * ARCHITECTURE RULES:
 * - Components are DATA, not Meshes
 * - InstancedMesh renders from data
 * - Grid-based positioning (2.54mm standard)
 * - Centralized state management
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// ============================================
// COMPONENT SCHEMA (DATA-FIRST)
// ============================================

export type ComponentCategory =
  | 'microcontroller'
  | 'passive'
  | 'output'
  | 'input'
  | 'connector'
  | 'power';

export type ComponentType =
  | 'arduino_uno'
  | 'breadboard_full'
  | 'breadboard_half'
  | 'breadboard_mini'
  | 'led_red'
  | 'led_green'
  | 'led_blue'
  | 'led_yellow'
  | 'led_white'
  | 'led_rgb'
  | 'resistor'
  | 'capacitor'
  | 'potentiometer'
  | 'button'
  | 'switch_spdt'
  | 'buzzer'
  | 'servo'
  | 'motor_dc'
  | 'ultrasonic'
  | 'dht22'
  | 'photoresistor'
  | 'temperature'
  | 'lcd_16x2'
  | 'seven_segment'
  | 'relay'
  | 'transistor_npn'
  | 'diode'
  | 'battery_9v'
  | 'wire_red'
  | 'wire_black'
  | 'wire_blue'
  | 'wire_green'
  | 'wire_yellow'
  | 'wire_orange'
  | 'wire_white'
  | 'wire_purple';

// Pin types for accurate electrical simulation
export type PinType = 'digital' | 'analog' | 'pwm' | 'power' | 'ground' | 'serial' | 'i2c' | 'spi';
export type PinDirection = 'input' | 'output' | 'bidirectional';
export type PinState = 'HIGH' | 'LOW' | 'FLOATING' | 'PWM';

export interface PinData {
  id: string;
  name: string;
  type: PinType;
  direction: PinDirection;
  state: PinState;
  voltage: number;
  pwmDuty?: number; // 0-255
  localOffset: [number, number, number]; // Offset from component origin
}

// Core component data structure
export interface ComponentData {
  id: string;
  type: ComponentType;
  category: ComponentCategory;

  // Grid-based positioning (grid units, 1 unit = 2.54mm)
  gridX: number;
  gridY: number; // Height level (0 = table, 1+ = stacked)
  gridZ: number;

  // Rotation in 90° increments (0, 1, 2, 3 = 0°, 90°, 180°, 270°)
  rotation: 0 | 1 | 2 | 3;

  // Component-specific properties
  properties: Record<string, any>;

  // Pin definitions
  pins: PinData[];

  // Visual state
  isSelected: boolean;
  isHovered: boolean;
  isActive: boolean; // For simulation state

  // Metadata
  label?: string;
  createdAt: number;
}

// Wire connection data
export interface WireData {
  id: string;
  color: string;

  // Connection points
  startComponentId: string;
  startPinId: string;
  endComponentId: string;
  endPinId: string;

  // Routing points (grid coordinates)
  routePoints: [number, number, number][];

  // Wire state
  isSelected: boolean;
  isCarryingSignal: boolean;
  signalValue: 'HIGH' | 'LOW' | 'FLOATING';
}

// Tool modes
export type ToolMode = 'select' | 'pan' | 'place' | 'wire' | 'delete';

// View state
export interface ViewState {
  // Camera position and zoom
  centerX: number;
  centerY: number;
  zoom: number; // 1 = default, 0.5 = zoomed out, 2 = zoomed in

  // UI toggles
  showGrid: boolean;
  showLabels: boolean;
  showPinNames: boolean;
  gridSnap: boolean;

  // Active tool
  toolMode: ToolMode;

  // Placement preview
  placementType: ComponentType | null;
  placementPreview: { gridX: number; gridZ: number } | null;
}

// Simulation state
export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  speed: number; // 1 = real-time, 2 = 2x speed
  time: number; // Simulation time in ms

  // Pin states from simulation engine
  pinStates: Map<string, PinState>;

  // Serial output
  serialBuffer: string[];
}

// Store interface
interface CircuitLabStore {
  // Data
  components: Map<string, ComponentData>;
  wires: Map<string, WireData>;

  // View
  view: ViewState;

  // Simulation
  simulation: SimulationState;

  // Selection
  selectedIds: Set<string>;
  hoveredId: string | null;

  // Wiring mode state
  wiringFrom: { componentId: string; pinId: string } | null;

  // Code
  code: string;
  compileErrors: string[];

  // ID counter
  nextId: number;

  // Actions - Components
  addComponent: (type: ComponentType, gridX: number, gridZ: number) => string;
  removeComponent: (id: string) => void;
  moveComponent: (id: string, gridX: number, gridZ: number) => void;
  rotateComponent: (id: string) => void;
  updateComponentProperty: (id: string, key: string, value: any) => void;

  // Actions - Wires
  addWire: (startCompId: string, startPinId: string, endCompId: string, endPinId: string, color: string) => string;
  removeWire: (id: string) => void;

  // Actions - Selection
  selectComponent: (id: string, additive?: boolean) => void;
  deselectAll: () => void;
  setHovered: (id: string | null) => void;

  // Actions - Wiring
  startWiring: (componentId: string, pinId: string) => void;
  cancelWiring: () => void;
  completeWiring: (componentId: string, pinId: string, color: string) => void;

  // Actions - View
  setToolMode: (mode: ToolMode) => void;
  setPlacementType: (type: ComponentType | null) => void;
  updatePlacementPreview: (gridX: number, gridZ: number) => void;
  setZoom: (zoom: number) => void;
  pan: (deltaX: number, deltaY: number) => void;
  toggleGrid: () => void;
  toggleLabels: () => void;
  togglePinNames: () => void;
  toggleGridSnap: () => void;

  // Actions - Simulation
  startSimulation: () => void;
  stopSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  updatePinState: (componentId: string, pinId: string, state: PinState, voltage?: number) => void;
  addSerialOutput: (text: string) => void;
  clearSerialOutput: () => void;

  // Actions - Code
  setCode: (code: string) => void;
  setCompileErrors: (errors: string[]) => void;

  // Actions - Bulk
  deleteSelected: () => void;
  clearAll: () => void;

  // Computed
  getComponentById: (id: string) => ComponentData | undefined;
  getWireById: (id: string) => WireData | undefined;
  getComponentsArray: () => ComponentData[];
  getWiresArray: () => WireData[];
  getComponentsByType: (type: ComponentType) => ComponentData[];
  getSelectedComponents: () => ComponentData[];
  getPinWorldPosition: (componentId: string, pinId: string) => [number, number, number] | null;
}

// Grid unit size (2.54mm in world units)
export const GRID_UNIT = 0.00254;

// Component category mapping
const COMPONENT_CATEGORIES: Record<ComponentType, ComponentCategory> = {
  arduino_uno: 'microcontroller',
  breadboard_full: 'connector',
  breadboard_half: 'connector',
  breadboard_mini: 'connector',
  led_red: 'output',
  led_green: 'output',
  led_blue: 'output',
  led_yellow: 'output',
  led_white: 'output',
  led_rgb: 'output',
  resistor: 'passive',
  capacitor: 'passive',
  potentiometer: 'input',
  button: 'input',
  switch_spdt: 'input',
  buzzer: 'output',
  servo: 'output',
  motor_dc: 'output',
  ultrasonic: 'input',
  dht22: 'input',
  photoresistor: 'input',
  temperature: 'input',
  lcd_16x2: 'output',
  seven_segment: 'output',
  relay: 'output',
  transistor_npn: 'passive',
  diode: 'passive',
  battery_9v: 'power',
  wire_red: 'connector',
  wire_black: 'connector',
  wire_blue: 'connector',
  wire_green: 'connector',
  wire_yellow: 'connector',
  wire_orange: 'connector',
  wire_white: 'connector',
  wire_purple: 'connector',
};

// Default properties for each component type
function getDefaultProperties(type: ComponentType): Record<string, any> {
  switch (type) {
    case 'led_red':
    case 'led_green':
    case 'led_blue':
    case 'led_yellow':
    case 'led_white':
      return { brightness: 0, isOn: false };
    case 'led_rgb':
      return { r: 0, g: 0, b: 0, isOn: false };
    case 'resistor':
      return { value: 220, tolerance: 5 };
    case 'capacitor':
      return { value: 100, unit: 'uF' };
    case 'potentiometer':
      return { value: 10000, position: 0.5 };
    case 'button':
      return { isPressed: false };
    case 'switch_spdt':
      return { position: 0 };
    case 'buzzer':
      return { frequency: 0, isOn: false };
    case 'servo':
      return { angle: 90 };
    case 'motor_dc':
      return { speed: 0, direction: 1 };
    case 'ultrasonic':
      return { distance: 100, isActive: false };
    case 'dht22':
      return { temperature: 25, humidity: 50, isActive: false };
    case 'photoresistor':
      return { lightLevel: 0.5 };
    case 'temperature':
      return { temperature: 25 };
    case 'battery_9v':
      return { voltage: 9 };
    default:
      return {};
  }
}

// Default pins for each component type
function getDefaultPins(type: ComponentType): PinData[] {
  const createPin = (
    id: string,
    name: string,
    pinType: PinType,
    direction: PinDirection,
    offset: [number, number, number]
  ): PinData => ({
    id,
    name,
    type: pinType,
    direction,
    state: 'FLOATING',
    voltage: 0,
    localOffset: offset,
  });

  switch (type) {
    case 'arduino_uno':
      const pins: PinData[] = [];
      // Digital pins 0-13
      for (let i = 0; i <= 13; i++) {
        const isPwm = [3, 5, 6, 9, 10, 11].includes(i);
        pins.push(createPin(
          `D${i}`,
          `D${i}${isPwm ? '~' : ''}`,
          isPwm ? 'pwm' : 'digital',
          'bidirectional',
          [13, 0, -10 + i * 1]
        ));
      }
      // Analog pins A0-A5
      for (let i = 0; i <= 5; i++) {
        pins.push(createPin(
          `A${i}`,
          `A${i}`,
          'analog',
          'input',
          [-13, 0, -4 + i * 1]
        ));
      }
      // Power pins
      pins.push(createPin('5V', '5V', 'power', 'output', [-13, 0, 4]));
      pins.push(createPin('3V3', '3.3V', 'power', 'output', [-13, 0, 5]));
      pins.push(createPin('GND1', 'GND', 'ground', 'bidirectional', [-13, 0, 6]));
      pins.push(createPin('GND2', 'GND', 'ground', 'bidirectional', [-13, 0, 7]));
      pins.push(createPin('VIN', 'VIN', 'power', 'input', [-13, 0, 3]));
      return pins;

    case 'led_red':
    case 'led_green':
    case 'led_blue':
    case 'led_yellow':
    case 'led_white':
      return [
        createPin('anode', 'Anode (+)', 'digital', 'input', [0.5, 0, 0]),
        createPin('cathode', 'Cathode (-)', 'ground', 'bidirectional', [-0.5, 0, 0]),
      ];

    case 'resistor':
      return [
        createPin('leg1', 'Leg 1', 'digital', 'bidirectional', [-2, 0, 0]),
        createPin('leg2', 'Leg 2', 'digital', 'bidirectional', [2, 0, 0]),
      ];

    case 'button':
      return [
        createPin('1a', '1a', 'digital', 'bidirectional', [-1, 0, -1]),
        createPin('1b', '1b', 'digital', 'bidirectional', [-1, 0, 1]),
        createPin('2a', '2a', 'digital', 'bidirectional', [1, 0, -1]),
        createPin('2b', '2b', 'digital', 'bidirectional', [1, 0, 1]),
      ];

    case 'ultrasonic':
      return [
        createPin('VCC', 'VCC', 'power', 'input', [-2, 0, 0]),
        createPin('TRIG', 'TRIG', 'digital', 'input', [-1, 0, 0]),
        createPin('ECHO', 'ECHO', 'digital', 'output', [1, 0, 0]),
        createPin('GND', 'GND', 'ground', 'bidirectional', [2, 0, 0]),
      ];

    case 'dht22':
      return [
        createPin('VCC', 'VCC', 'power', 'input', [-1, 0, 0]),
        createPin('DATA', 'DATA', 'digital', 'bidirectional', [0, 0, 0]),
        createPin('GND', 'GND', 'ground', 'bidirectional', [1, 0, 0]),
      ];

    default:
      return [];
  }
}

// Default Arduino code
const DEFAULT_CODE = `// Arduino LED Blink Example
// 아두이노 LED 깜빡이기 예제

const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Program started!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON");
  delay(1000);

  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
`;

// Create the store
export const useCircuitLabStore = create<CircuitLabStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    components: new Map(),
    wires: new Map(),

    view: {
      centerX: 0,
      centerY: 0,
      zoom: 1,
      showGrid: true,
      showLabels: true,
      showPinNames: false,
      gridSnap: true,
      toolMode: 'select',
      placementType: null,
      placementPreview: null,
    },

    simulation: {
      isRunning: false,
      isPaused: false,
      speed: 1,
      time: 0,
      pinStates: new Map(),
      serialBuffer: [],
    },

    selectedIds: new Set(),
    hoveredId: null,
    wiringFrom: null,
    code: DEFAULT_CODE,
    compileErrors: [],
    nextId: 1,

    // Component actions
    addComponent: (type, gridX, gridZ) => {
      const id = `comp_${get().nextId}`;
      const component: ComponentData = {
        id,
        type,
        category: COMPONENT_CATEGORIES[type],
        gridX,
        gridY: 0,
        gridZ,
        rotation: 0,
        properties: getDefaultProperties(type),
        pins: getDefaultPins(type),
        isSelected: false,
        isHovered: false,
        isActive: false,
        createdAt: Date.now(),
      };

      set((state) => {
        const newComponents = new Map(state.components);
        newComponents.set(id, component);
        return {
          components: newComponents,
          nextId: state.nextId + 1,
        };
      });

      return id;
    },

    removeComponent: (id) => {
      set((state) => {
        const newComponents = new Map(state.components);
        newComponents.delete(id);

        // Remove connected wires
        const newWires = new Map(state.wires);
        state.wires.forEach((wire, wireId) => {
          if (wire.startComponentId === id || wire.endComponentId === id) {
            newWires.delete(wireId);
          }
        });

        const newSelectedIds = new Set(state.selectedIds);
        newSelectedIds.delete(id);

        return {
          components: newComponents,
          wires: newWires,
          selectedIds: newSelectedIds,
        };
      });
    },

    moveComponent: (id, gridX, gridZ) => {
      set((state) => {
        const newComponents = new Map(state.components);
        const component = newComponents.get(id);
        if (component) {
          newComponents.set(id, { ...component, gridX, gridZ });
        }
        return { components: newComponents };
      });
    },

    rotateComponent: (id) => {
      set((state) => {
        const newComponents = new Map(state.components);
        const component = newComponents.get(id);
        if (component) {
          const newRotation = ((component.rotation + 1) % 4) as 0 | 1 | 2 | 3;
          newComponents.set(id, { ...component, rotation: newRotation });
        }
        return { components: newComponents };
      });
    },

    updateComponentProperty: (id, key, value) => {
      set((state) => {
        const newComponents = new Map(state.components);
        const component = newComponents.get(id);
        if (component) {
          newComponents.set(id, {
            ...component,
            properties: { ...component.properties, [key]: value },
          });
        }
        return { components: newComponents };
      });
    },

    // Wire actions
    addWire: (startCompId, startPinId, endCompId, endPinId, color) => {
      const id = `wire_${get().nextId}`;
      const wire: WireData = {
        id,
        color,
        startComponentId: startCompId,
        startPinId,
        endComponentId: endCompId,
        endPinId,
        routePoints: [],
        isSelected: false,
        isCarryingSignal: false,
        signalValue: 'FLOATING',
      };

      set((state) => {
        const newWires = new Map(state.wires);
        newWires.set(id, wire);
        return {
          wires: newWires,
          nextId: state.nextId + 1,
        };
      });

      return id;
    },

    removeWire: (id) => {
      set((state) => {
        const newWires = new Map(state.wires);
        newWires.delete(id);
        return { wires: newWires };
      });
    },

    // Selection actions
    selectComponent: (id, additive = false) => {
      set((state) => {
        const newSelectedIds = additive ? new Set(state.selectedIds) : new Set<string>();

        if (newSelectedIds.has(id)) {
          newSelectedIds.delete(id);
        } else {
          newSelectedIds.add(id);
        }

        // Update component selection state
        const newComponents = new Map(state.components);
        newComponents.forEach((component, compId) => {
          if (component.isSelected !== newSelectedIds.has(compId)) {
            newComponents.set(compId, {
              ...component,
              isSelected: newSelectedIds.has(compId),
            });
          }
        });

        return {
          selectedIds: newSelectedIds,
          components: newComponents,
        };
      });
    },

    deselectAll: () => {
      set((state) => {
        const newComponents = new Map(state.components);
        newComponents.forEach((component, id) => {
          if (component.isSelected) {
            newComponents.set(id, { ...component, isSelected: false });
          }
        });
        return {
          selectedIds: new Set(),
          components: newComponents,
        };
      });
    },

    setHovered: (id) => {
      set((state) => {
        if (state.hoveredId === id) return state;

        const newComponents = new Map(state.components);

        // Remove hover from previous
        if (state.hoveredId) {
          const prev = newComponents.get(state.hoveredId);
          if (prev) {
            newComponents.set(state.hoveredId, { ...prev, isHovered: false });
          }
        }

        // Add hover to new
        if (id) {
          const next = newComponents.get(id);
          if (next) {
            newComponents.set(id, { ...next, isHovered: true });
          }
        }

        return {
          hoveredId: id,
          components: newComponents,
        };
      });
    },

    // Wiring actions
    startWiring: (componentId, pinId) => {
      set({ wiringFrom: { componentId, pinId } });
    },

    cancelWiring: () => {
      set({ wiringFrom: null });
    },

    completeWiring: (componentId, pinId, color) => {
      const state = get();
      if (!state.wiringFrom) return;

      // Don't wire to same component/pin
      if (state.wiringFrom.componentId === componentId && state.wiringFrom.pinId === pinId) {
        set({ wiringFrom: null });
        return;
      }

      state.addWire(
        state.wiringFrom.componentId,
        state.wiringFrom.pinId,
        componentId,
        pinId,
        color
      );

      set({ wiringFrom: null });
    },

    // View actions
    setToolMode: (mode) => {
      set((state) => ({
        view: { ...state.view, toolMode: mode },
        wiringFrom: mode !== 'wire' ? null : state.wiringFrom,
      }));
    },

    setPlacementType: (type) => {
      set((state) => ({
        view: {
          ...state.view,
          placementType: type,
          toolMode: type ? 'place' : 'select',
        },
      }));
    },

    updatePlacementPreview: (gridX, gridZ) => {
      set((state) => ({
        view: {
          ...state.view,
          placementPreview: { gridX, gridZ },
        },
      }));
    },

    setZoom: (zoom) => {
      const clampedZoom = Math.max(0.25, Math.min(4, zoom));
      set((state) => ({
        view: { ...state.view, zoom: clampedZoom },
      }));
    },

    pan: (deltaX, deltaY) => {
      set((state) => ({
        view: {
          ...state.view,
          centerX: state.view.centerX + deltaX,
          centerY: state.view.centerY + deltaY,
        },
      }));
    },

    toggleGrid: () => {
      set((state) => ({
        view: { ...state.view, showGrid: !state.view.showGrid },
      }));
    },

    toggleLabels: () => {
      set((state) => ({
        view: { ...state.view, showLabels: !state.view.showLabels },
      }));
    },

    togglePinNames: () => {
      set((state) => ({
        view: { ...state.view, showPinNames: !state.view.showPinNames },
      }));
    },

    toggleGridSnap: () => {
      set((state) => ({
        view: { ...state.view, gridSnap: !state.view.gridSnap },
      }));
    },

    // Simulation actions
    startSimulation: () => {
      set((state) => ({
        simulation: { ...state.simulation, isRunning: true, isPaused: false },
      }));
    },

    stopSimulation: () => {
      set((state) => ({
        simulation: { ...state.simulation, isRunning: false, isPaused: false },
      }));
    },

    pauseSimulation: () => {
      set((state) => ({
        simulation: { ...state.simulation, isPaused: !state.simulation.isPaused },
      }));
    },

    resetSimulation: () => {
      set((state) => ({
        simulation: {
          isRunning: false,
          isPaused: false,
          speed: 1,
          time: 0,
          pinStates: new Map(),
          serialBuffer: [],
        },
      }));
    },

    setSimulationSpeed: (speed) => {
      set((state) => ({
        simulation: { ...state.simulation, speed },
      }));
    },

    updatePinState: (componentId, pinId, state, voltage) => {
      set((s) => {
        const newComponents = new Map(s.components);
        const component = newComponents.get(componentId);
        if (component) {
          const newPins = component.pins.map((pin) =>
            pin.id === pinId
              ? { ...pin, state, voltage: voltage ?? pin.voltage }
              : pin
          );
          newComponents.set(componentId, { ...component, pins: newPins });
        }
        return { components: newComponents };
      });
    },

    addSerialOutput: (text) => {
      set((state) => ({
        simulation: {
          ...state.simulation,
          serialBuffer: [...state.simulation.serialBuffer, text],
        },
      }));
    },

    clearSerialOutput: () => {
      set((state) => ({
        simulation: { ...state.simulation, serialBuffer: [] },
      }));
    },

    // Code actions
    setCode: (code) => {
      set({ code });
    },

    setCompileErrors: (errors) => {
      set({ compileErrors: errors });
    },

    // Bulk actions
    deleteSelected: () => {
      const state = get();
      state.selectedIds.forEach((id) => {
        if (state.components.has(id)) {
          state.removeComponent(id);
        } else if (state.wires.has(id)) {
          state.removeWire(id);
        }
      });
    },

    clearAll: () => {
      set({
        components: new Map(),
        wires: new Map(),
        selectedIds: new Set(),
        hoveredId: null,
        wiringFrom: null,
      });
    },

    // Computed helpers
    getComponentById: (id) => get().components.get(id),
    getWireById: (id) => get().wires.get(id),
    getComponentsArray: () => Array.from(get().components.values()),
    getWiresArray: () => Array.from(get().wires.values()),
    getComponentsByType: (type) =>
      Array.from(get().components.values()).filter((c) => c.type === type),
    getSelectedComponents: () =>
      Array.from(get().components.values()).filter((c) => c.isSelected),

    getPinWorldPosition: (componentId, pinId) => {
      const component = get().components.get(componentId);
      if (!component) return null;

      const pin = component.pins.find((p) => p.id === pinId);
      if (!pin) return null;

      // Calculate world position based on grid and rotation
      const rotation = component.rotation * (Math.PI / 2);
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      const localX = pin.localOffset[0] * GRID_UNIT;
      const localZ = pin.localOffset[2] * GRID_UNIT;

      const worldX = component.gridX * GRID_UNIT + (cos * localX - sin * localZ);
      const worldY = pin.localOffset[1] * GRID_UNIT;
      const worldZ = component.gridZ * GRID_UNIT + (sin * localX + cos * localZ);

      return [worldX, worldY, worldZ];
    },
  }))
);

// Selectors for performance
export const selectComponents = (state: CircuitLabStore) => state.components;
export const selectWires = (state: CircuitLabStore) => state.wires;
export const selectView = (state: CircuitLabStore) => state.view;
export const selectSimulation = (state: CircuitLabStore) => state.simulation;
export const selectSelectedIds = (state: CircuitLabStore) => state.selectedIds;
export const selectToolMode = (state: CircuitLabStore) => state.view.toolMode;
export const selectIsSimulating = (state: CircuitLabStore) => state.simulation.isRunning;
