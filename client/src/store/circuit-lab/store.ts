
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ComponentData, WireData, CircuitLabStore, ComponentType } from './types';
import { COMPONENT_CATEGORIES, DEFAULT_CODE, GRID_UNIT } from './constants';
import { getDefaultProperties, getDefaultPins } from './defaults';

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
          // Type assertion to handle the property update properly
          // In a real app we might want more specific property updaters
          const newProperties = { ...component.properties } as any;
          newProperties[key] = value;

          newComponents.set(id, {
            ...component,
            properties: newProperties,
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
