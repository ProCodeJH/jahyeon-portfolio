/**
 * Netlist Manager
 * Manages connectivity graph and net resolution
 */

import type { Circuit, Component, Wire, Net, Pin, SignalState } from './types';

export class NetlistManager {
  private circuit: Circuit;
  private adjacencyList: Map<string, Set<string>> = new Map();

  constructor(circuitId: string, name: string) {
    this.circuit = {
      id: circuitId,
      name,
      components: new Map(),
      wires: new Map(),
      nets: new Map(),
    };
  }

  addComponent(component: Component): void {
    this.circuit.components.set(component.id, component);

    // Add pins to adjacency list
    for (const pin of component.pins) {
      this.adjacencyList.set(pin.id, new Set());
    }
  }

  removeComponent(componentId: string): void {
    const component = this.circuit.components.get(componentId);
    if (!component) return;

    // Remove all wires connected to this component
    for (const pin of component.pins) {
      const connections = this.adjacencyList.get(pin.id);
      if (connections) {
        for (const connectedPinId of connections) {
          this.removeWireByPins(pin.id, connectedPinId);
        }
      }
      this.adjacencyList.delete(pin.id);
    }

    this.circuit.components.delete(componentId);
    this.rebuildNets();
  }

  addWire(wire: Wire): void {
    this.circuit.wires.set(wire.id, wire);

    // Update adjacency list
    if (!this.adjacencyList.has(wire.startPinId)) {
      this.adjacencyList.set(wire.startPinId, new Set());
    }
    if (!this.adjacencyList.has(wire.endPinId)) {
      this.adjacencyList.set(wire.endPinId, new Set());
    }

    this.adjacencyList.get(wire.startPinId)!.add(wire.endPinId);
    this.adjacencyList.get(wire.endPinId)!.add(wire.startPinId);

    this.rebuildNets();
  }

  removeWire(wireId: string): void {
    const wire = this.circuit.wires.get(wireId);
    if (!wire) return;

    this.adjacencyList.get(wire.startPinId)?.delete(wire.endPinId);
    this.adjacencyList.get(wire.endPinId)?.delete(wire.startPinId);

    this.circuit.wires.delete(wireId);
    this.rebuildNets();
  }

  private removeWireByPins(pin1: string, pin2: string): void {
    for (const [wireId, wire] of this.circuit.wires) {
      if (
        (wire.startPinId === pin1 && wire.endPinId === pin2) ||
        (wire.startPinId === pin2 && wire.endPinId === pin1)
      ) {
        this.circuit.wires.delete(wireId);
        break;
      }
    }
  }

  private rebuildNets(): void {
    this.circuit.nets.clear();
    const visited = new Set<string>();
    let netCounter = 0;

    // BFS to find connected components (nets)
    for (const pinId of this.adjacencyList.keys()) {
      if (visited.has(pinId)) continue;

      const netPins: string[] = [];
      const netWires: string[] = [];
      const queue: string[] = [pinId];

      while (queue.length > 0) {
        const currentPin = queue.shift()!;
        if (visited.has(currentPin)) continue;

        visited.add(currentPin);
        netPins.push(currentPin);

        const connections = this.adjacencyList.get(currentPin);
        if (connections) {
          for (const connectedPin of connections) {
            if (!visited.has(connectedPin)) {
              queue.push(connectedPin);

              // Find wire between these pins
              for (const [wireId, wire] of this.circuit.wires) {
                if (
                  (wire.startPinId === currentPin && wire.endPinId === connectedPin) ||
                  (wire.startPinId === connectedPin && wire.endPinId === currentPin)
                ) {
                  if (!netWires.includes(wireId)) {
                    netWires.push(wireId);
                  }
                }
              }
            }
          }
        }
      }

      if (netPins.length > 1) {
        const netId = `net_${netCounter++}`;
        const net: Net = {
          id: netId,
          pins: netPins,
          wires: netWires,
          state: 'HIGH_Z',
          voltage: 0,
        };
        this.circuit.nets.set(netId, net);

        // Update wire net references
        for (const wireId of netWires) {
          const wire = this.circuit.wires.get(wireId);
          if (wire) {
            wire.netId = netId;
          }
        }
      }
    }
  }

  resolveNetState(netId: string): { state: SignalState; voltage: number } {
    const net = this.circuit.nets.get(netId);
    if (!net) return { state: 'HIGH_Z', voltage: 0 };

    let hasDriver = false;
    let driverState: SignalState = 'HIGH_Z';
    let driverVoltage = 0;

    for (const pinId of net.pins) {
      const pin = this.getPin(pinId);
      if (pin && pin.direction === 'output') {
        hasDriver = true;
        driverState = pin.state;
        driverVoltage = pin.voltage;
        net.driverPinId = pinId;
        break;
      }
    }

    if (hasDriver) {
      net.state = driverState;
      net.voltage = driverVoltage;
    } else {
      net.state = 'HIGH_Z';
      net.voltage = 0;
    }

    return { state: net.state, voltage: net.voltage };
  }

  getPin(pinId: string): Pin | undefined {
    const [componentId] = pinId.split('_pin_');
    const component = this.circuit.components.get(componentId);
    return component?.pins.find(p => p.id === pinId);
  }

  getComponent(componentId: string): Component | undefined {
    return this.circuit.components.get(componentId);
  }

  getWire(wireId: string): Wire | undefined {
    return this.circuit.wires.get(wireId);
  }

  getNet(netId: string): Net | undefined {
    return this.circuit.nets.get(netId);
  }

  getNetForPin(pinId: string): Net | undefined {
    for (const net of this.circuit.nets.values()) {
      if (net.pins.includes(pinId)) {
        return net;
      }
    }
    return undefined;
  }

  getCircuit(): Circuit {
    return this.circuit;
  }

  getConnectedPins(pinId: string): string[] {
    return Array.from(this.adjacencyList.get(pinId) || []);
  }

  toJSON(): object {
    return {
      id: this.circuit.id,
      name: this.circuit.name,
      components: Array.from(this.circuit.components.values()),
      wires: Array.from(this.circuit.wires.values()),
      nets: Array.from(this.circuit.nets.values()),
    };
  }

  static fromJSON(data: ReturnType<NetlistManager['toJSON']>): NetlistManager {
    const manager = new NetlistManager(data.id, data.name);

    for (const component of data.components as Component[]) {
      manager.addComponent(component);
    }

    for (const wire of data.wires as Wire[]) {
      manager.addWire(wire);
    }

    return manager;
  }
}
