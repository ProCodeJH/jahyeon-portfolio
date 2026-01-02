/**
 * Circuit Lab State Management
 * Zustand store for managing circuit, simulation, and UI state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Component,
  Wire,
  ComponentType,
  CircuitProject,
  ProjectSettings,
} from '@circuit-lab/sim-core';

// Component palette items
export interface ComponentPaletteItem {
  type: ComponentType;
  name: string;
  icon: string;
  description: string;
  category: 'boards' | 'components' | 'sensors' | 'actuators';
}

// UI state
interface UIState {
  selectedComponentId: string | null;
  selectedWireId: string | null;
  hoveredPinId: string | null;
  isWiring: boolean;
  wiringStart: { componentId: string; pinId: string } | null;
  wireColor: string;
  showGrid: boolean;
  showLabels: boolean;
  showFlow: boolean;
  panelSizes: {
    left: number;
    right: number;
    bottom: number;
  };
  activePanel: 'components' | 'properties' | 'code';
}

// Simulation state
interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  time: number;
  serialOutput: string[];
}

// Code state
interface CodeState {
  code: string;
  isCompiling: boolean;
  compileError: string | null;
  compileWarnings: string[];
  lastCompileTime: number | null;
  hexData: Uint8Array | null;
}

// Project state
interface ProjectState {
  id: string | null;
  name: string;
  isDirty: boolean;
  lastSaved: number | null;
}

// Complete store state
interface CircuitStore {
  // Circuit data
  components: Component[];
  wires: Wire[];

  // UI state
  ui: UIState;

  // Simulation state
  simulation: SimulationState;

  // Code state
  code: CodeState;

  // Project state
  project: ProjectState;

  // Actions - Components
  addComponent: (component: Component) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  moveComponent: (id: string, position: { x: number; y: number; z: number }) => void;

  // Actions - Wires
  addWire: (wire: Wire) => void;
  removeWire: (id: string) => void;
  updateWire: (id: string, updates: Partial<Wire>) => void;

  // Actions - Selection
  selectComponent: (id: string | null) => void;
  selectWire: (id: string | null) => void;
  setHoveredPin: (pinId: string | null) => void;

  // Actions - Wiring
  startWiring: (componentId: string, pinId: string) => void;
  completeWiring: (componentId: string, pinId: string) => void;
  cancelWiring: () => void;
  setWireColor: (color: string) => void;

  // Actions - UI
  setShowGrid: (show: boolean) => void;
  setShowLabels: (show: boolean) => void;
  setShowFlow: (show: boolean) => void;
  setPanelSize: (panel: keyof UIState['panelSizes'], size: number) => void;
  setActivePanel: (panel: UIState['activePanel']) => void;

  // Actions - Simulation
  startSimulation: () => void;
  pauseSimulation: () => void;
  stopSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  addSerialOutput: (text: string) => void;
  clearSerialOutput: () => void;

  // Actions - Code
  setCode: (code: string) => void;
  setCompiling: (isCompiling: boolean) => void;
  setCompileResult: (result: {
    success: boolean;
    error?: string;
    warnings?: string[];
    hexData?: Uint8Array;
  }) => void;

  // Actions - Project
  newProject: () => void;
  loadProject: (project: CircuitProject) => void;
  saveProject: () => CircuitProject;
  setProjectName: (name: string) => void;
  markDirty: () => void;
  markClean: () => void;

  // Actions - Undo/Redo (simplified)
  undo: () => void;
  redo: () => void;
}

// Default Arduino Blink code
const DEFAULT_CODE = `// Arduino Blink Example
// The built-in LED blinks on and off

void setup() {
  // Initialize digital pin LED_BUILTIN as an output
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Blink started!");
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);  // Turn LED on
  Serial.println("LED ON");
  delay(1000);                      // Wait 1 second

  digitalWrite(LED_BUILTIN, LOW);   // Turn LED off
  Serial.println("LED OFF");
  delay(1000);                      // Wait 1 second
}
`;

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const useCircuitStore = create<CircuitStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        components: [],
        wires: [],

        ui: {
          selectedComponentId: null,
          selectedWireId: null,
          hoveredPinId: null,
          isWiring: false,
          wiringStart: null,
          wireColor: 'red',
          showGrid: true,
          showLabels: true,
          showFlow: true,
          panelSizes: {
            left: 280,
            right: 320,
            bottom: 200,
          },
          activePanel: 'components',
        },

        simulation: {
          isRunning: false,
          isPaused: false,
          speed: 1,
          time: 0,
          serialOutput: [],
        },

        code: {
          code: DEFAULT_CODE,
          isCompiling: false,
          compileError: null,
          compileWarnings: [],
          lastCompileTime: null,
          hexData: null,
        },

        project: {
          id: null,
          name: 'Untitled Project',
          isDirty: false,
          lastSaved: null,
        },

        // Component actions
        addComponent: (component) => {
          set((state) => ({
            components: [...state.components, component],
            project: { ...state.project, isDirty: true },
          }));
        },

        removeComponent: (id) => {
          set((state) => ({
            components: state.components.filter((c) => c.id !== id),
            wires: state.wires.filter(
              (w) => !w.startPinId.startsWith(id) && !w.endPinId.startsWith(id)
            ),
            ui: {
              ...state.ui,
              selectedComponentId:
                state.ui.selectedComponentId === id
                  ? null
                  : state.ui.selectedComponentId,
            },
            project: { ...state.project, isDirty: true },
          }));
        },

        updateComponent: (id, updates) => {
          set((state) => ({
            components: state.components.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
            project: { ...state.project, isDirty: true },
          }));
        },

        moveComponent: (id, position) => {
          set((state) => ({
            components: state.components.map((c) =>
              c.id === id
                ? { ...c, transform: { ...c.transform, position } }
                : c
            ),
            project: { ...state.project, isDirty: true },
          }));
        },

        // Wire actions
        addWire: (wire) => {
          set((state) => ({
            wires: [...state.wires, wire],
            project: { ...state.project, isDirty: true },
          }));
        },

        removeWire: (id) => {
          set((state) => ({
            wires: state.wires.filter((w) => w.id !== id),
            ui: {
              ...state.ui,
              selectedWireId:
                state.ui.selectedWireId === id
                  ? null
                  : state.ui.selectedWireId,
            },
            project: { ...state.project, isDirty: true },
          }));
        },

        updateWire: (id, updates) => {
          set((state) => ({
            wires: state.wires.map((w) =>
              w.id === id ? { ...w, ...updates } : w
            ),
            project: { ...state.project, isDirty: true },
          }));
        },

        // Selection actions
        selectComponent: (id) => {
          set((state) => ({
            ui: {
              ...state.ui,
              selectedComponentId: id,
              selectedWireId: null,
            },
          }));
        },

        selectWire: (id) => {
          set((state) => ({
            ui: {
              ...state.ui,
              selectedWireId: id,
              selectedComponentId: null,
            },
          }));
        },

        setHoveredPin: (pinId) => {
          set((state) => ({
            ui: { ...state.ui, hoveredPinId: pinId },
          }));
        },

        // Wiring actions
        startWiring: (componentId, pinId) => {
          set((state) => ({
            ui: {
              ...state.ui,
              isWiring: true,
              wiringStart: { componentId, pinId },
            },
          }));
        },

        completeWiring: (componentId, pinId) => {
          const state = get();
          if (!state.ui.wiringStart) return;

          const wire: Wire = {
            id: `wire_${generateId()}`,
            startPinId: `${state.ui.wiringStart.componentId}_${state.ui.wiringStart.pinId}`,
            endPinId: `${componentId}_${pinId}`,
            netId: `net_${generateId()}`,
            color: state.ui.wireColor,
            points: [],
          };

          set((state) => ({
            wires: [...state.wires, wire],
            ui: {
              ...state.ui,
              isWiring: false,
              wiringStart: null,
            },
            project: { ...state.project, isDirty: true },
          }));
        },

        cancelWiring: () => {
          set((state) => ({
            ui: {
              ...state.ui,
              isWiring: false,
              wiringStart: null,
            },
          }));
        },

        setWireColor: (color) => {
          set((state) => ({
            ui: { ...state.ui, wireColor: color },
          }));
        },

        // UI actions
        setShowGrid: (show) => {
          set((state) => ({
            ui: { ...state.ui, showGrid: show },
          }));
        },

        setShowLabels: (show) => {
          set((state) => ({
            ui: { ...state.ui, showLabels: show },
          }));
        },

        setShowFlow: (show) => {
          set((state) => ({
            ui: { ...state.ui, showFlow: show },
          }));
        },

        setPanelSize: (panel, size) => {
          set((state) => ({
            ui: {
              ...state.ui,
              panelSizes: { ...state.ui.panelSizes, [panel]: size },
            },
          }));
        },

        setActivePanel: (panel) => {
          set((state) => ({
            ui: { ...state.ui, activePanel: panel },
          }));
        },

        // Simulation actions
        startSimulation: () => {
          set((state) => ({
            simulation: {
              ...state.simulation,
              isRunning: true,
              isPaused: false,
            },
          }));
        },

        pauseSimulation: () => {
          set((state) => ({
            simulation: {
              ...state.simulation,
              isPaused: true,
            },
          }));
        },

        stopSimulation: () => {
          set((state) => ({
            simulation: {
              ...state.simulation,
              isRunning: false,
              isPaused: false,
              time: 0,
            },
          }));
        },

        setSimulationSpeed: (speed) => {
          set((state) => ({
            simulation: { ...state.simulation, speed },
          }));
        },

        addSerialOutput: (text) => {
          set((state) => ({
            simulation: {
              ...state.simulation,
              serialOutput: [...state.simulation.serialOutput, text].slice(-1000),
            },
          }));
        },

        clearSerialOutput: () => {
          set((state) => ({
            simulation: { ...state.simulation, serialOutput: [] },
          }));
        },

        // Code actions
        setCode: (code) => {
          set((state) => ({
            code: { ...state.code, code },
            project: { ...state.project, isDirty: true },
          }));
        },

        setCompiling: (isCompiling) => {
          set((state) => ({
            code: {
              ...state.code,
              isCompiling,
              compileError: isCompiling ? null : state.code.compileError,
            },
          }));
        },

        setCompileResult: (result) => {
          set((state) => ({
            code: {
              ...state.code,
              isCompiling: false,
              compileError: result.error || null,
              compileWarnings: result.warnings || [],
              hexData: result.hexData || null,
              lastCompileTime: result.success ? Date.now() : state.code.lastCompileTime,
            },
          }));
        },

        // Project actions
        newProject: () => {
          set({
            components: [],
            wires: [],
            code: {
              code: DEFAULT_CODE,
              isCompiling: false,
              compileError: null,
              compileWarnings: [],
              lastCompileTime: null,
              hexData: null,
            },
            project: {
              id: null,
              name: 'Untitled Project',
              isDirty: false,
              lastSaved: null,
            },
            simulation: {
              isRunning: false,
              isPaused: false,
              speed: 1,
              time: 0,
              serialOutput: [],
            },
          });
        },

        loadProject: (project) => {
          set({
            components: project.components,
            wires: project.wires,
            code: {
              code: project.code,
              isCompiling: false,
              compileError: null,
              compileWarnings: [],
              lastCompileTime: null,
              hexData: null,
            },
            project: {
              id: project.id,
              name: project.name,
              isDirty: false,
              lastSaved: Date.now(),
            },
            ui: {
              ...get().ui,
              showGrid: project.settings.showLabels,
              showLabels: project.settings.showLabels,
              showFlow: project.settings.showCurrentFlow,
            },
          });
        },

        saveProject: () => {
          const state = get();
          return {
            id: state.project.id || generateId(),
            name: state.project.name,
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            components: state.components,
            wires: state.wires,
            code: state.code.code,
            settings: {
              gridSnap: true,
              gridSize: 2.54,
              showLabels: state.ui.showLabels,
              showPinNumbers: true,
              showCurrentFlow: state.ui.showFlow,
              simulationSpeed: state.simulation.speed,
              theme: 'dark' as const,
            },
          };
        },

        setProjectName: (name) => {
          set((state) => ({
            project: { ...state.project, name, isDirty: true },
          }));
        },

        markDirty: () => {
          set((state) => ({
            project: { ...state.project, isDirty: true },
          }));
        },

        markClean: () => {
          set((state) => ({
            project: {
              ...state.project,
              isDirty: false,
              lastSaved: Date.now(),
            },
          }));
        },

        // Undo/Redo (placeholder)
        undo: () => {
          // Would implement history tracking
        },

        redo: () => {
          // Would implement history tracking
        },
      }),
      {
        name: 'circuit-lab-storage',
        partialize: (state) => ({
          ui: {
            showGrid: state.ui.showGrid,
            showLabels: state.ui.showLabels,
            showFlow: state.ui.showFlow,
            panelSizes: state.ui.panelSizes,
            wireColor: state.ui.wireColor,
          },
        }),
      }
    ),
    { name: 'CircuitStore' }
  )
);
