/**
 * Tinkercad-style Circuit Store
 * Manages circuit state, components, and wires
 */

import { create } from 'zustand';
import { Component, Wire, CircuitState, COMPONENT_LIBRARY, ComponentType, Pin } from './circuit-types';

interface CircuitActions {
  // Component operations
  addComponent: (type: ComponentType, x: number, y: number) => void;
  removeComponent: (componentId: string) => void;
  updateComponent: (componentId: string, updates: Partial<Component>) => void;
  moveComponent: (componentId: string, x: number, y: number) => void;
  rotateComponent: (componentId: string) => void;
  selectComponent: (componentId: string | null) => void;

  // Wire operations
  addWire: (fromPinId: string, toPinId: string, color?: string) => void;
  removeWire: (wireId: string) => void;
  updateWirePoints: (wireId: string, points: { x: number; y: number }[]) => void;

  // View operations
  setViewMode: (mode: 'simulation' | 'schematic' | 'code') => void;
  setIsDragging: (isDragging: boolean) => void;

  // Circuit operations
  clearCircuit: () => void;
  loadCircuit: (state: Partial<CircuitState>) => void;
}

let componentIdCounter = 0;
let wireIdCounter = 0;

export const useCircuitStore = create<CircuitState & CircuitActions>((set, get) => ({
  // Initial State
  components: [],
  wires: [],
  selectedComponentId: null,
  isDragging: false,
  viewMode: 'simulation',

  // Component operations
  addComponent: (type, x, y) => {
    const definition = COMPONENT_LIBRARY.find(c => c.type === type);
    if (!definition) return;

    const componentId = `component-${++componentIdCounter}`;

    // Create pins with positions relative to component
    const pins: Pin[] = definition.pins.map((pinDef, index) => {
      const pinId = `${componentId}-pin-${index}`;
      // Calculate pin position based on component layout
      const pinSpacing = definition.width / (definition.pins.length + 1);
      const pinX = x + pinSpacing * (index + 1);
      const pinY = y + definition.height;

      return {
        id: pinId,
        name: pinDef.name,
        type: pinDef.type,
        number: pinDef.number,
        x: pinX,
        y: pinY,
      };
    });

    const newComponent: Component = {
      id: componentId,
      type,
      x,
      y,
      rotation: 0,
      pins,
      properties: { ...definition.defaultProperties },
    };

    set(state => ({
      components: [...state.components, newComponent],
      selectedComponentId: componentId,
    }));
  },

  removeComponent: (componentId) => {
    const component = get().components.find(c => c.id === componentId);
    if (!component) return;

    // Remove all wires connected to this component's pins
    const pinIds = new Set(component.pins.map(p => p.id));
    const newWires = get().wires.filter(
      wire => !pinIds.has(wire.fromPinId) && !pinIds.has(wire.toPinId)
    );

    set(state => ({
      components: state.components.filter(c => c.id !== componentId),
      wires: newWires,
      selectedComponentId: state.selectedComponentId === componentId ? null : state.selectedComponentId,
    }));
  },

  updateComponent: (componentId, updates) => {
    set(state => ({
      components: state.components.map(c =>
        c.id === componentId ? { ...c, ...updates } : c
      ),
    }));
  },

  moveComponent: (componentId, x, y) => {
    const component = get().components.find(c => c.id === componentId);
    if (!component) return;

    const dx = x - component.x;
    const dy = y - component.y;

    // Update component position
    const updatedComponent = {
      ...component,
      x,
      y,
      pins: component.pins.map(pin => ({
        ...pin,
        x: pin.x + dx,
        y: pin.y + dy,
      })),
    };

    set(state => ({
      components: state.components.map(c =>
        c.id === componentId ? updatedComponent : c
      ),
    }));
  },

  rotateComponent: (componentId) => {
    set(state => ({
      components: state.components.map(c =>
        c.id === componentId
          ? { ...c, rotation: (c.rotation + 90) % 360 }
          : c
      ),
    }));
  },

  selectComponent: (componentId) => {
    set({ selectedComponentId: componentId });
  },

  // Wire operations
  addWire: (fromPinId, toPinId, color = '#FF0000') => {
    // Check if wire already exists
    const exists = get().wires.some(
      w => (w.fromPinId === fromPinId && w.toPinId === toPinId) ||
           (w.fromPinId === toPinId && w.toPinId === fromPinId)
    );

    if (exists) return;

    // Find pin positions
    const fromPin = get().components
      .flatMap(c => c.pins)
      .find(p => p.id === fromPinId);

    const toPin = get().components
      .flatMap(c => c.pins)
      .find(p => p.id === toPinId);

    if (!fromPin || !toPin) return;

    const wireId = `wire-${++wireIdCounter}`;

    const newWire: Wire = {
      id: wireId,
      fromPinId,
      toPinId,
      color,
      points: [
        { x: fromPin.x, y: fromPin.y },
        { x: toPin.x, y: toPin.y },
      ],
    };

    set(state => ({
      wires: [...state.wires, newWire],
    }));
  },

  removeWire: (wireId) => {
    set(state => ({
      wires: state.wires.filter(w => w.id !== wireId),
    }));
  },

  updateWirePoints: (wireId, points) => {
    set(state => ({
      wires: state.wires.map(w =>
        w.id === wireId ? { ...w, points } : w
      ),
    }));
  },

  // View operations
  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  setIsDragging: (isDragging) => {
    set({ isDragging });
  },

  // Circuit operations
  clearCircuit: () => {
    set({
      components: [],
      wires: [],
      selectedComponentId: null,
    });
  },

  loadCircuit: (state) => {
    set(state);
  },
}));
