/**
 * NetlistManager - Core netlist management for circuit simulation
 * Handles electrical connections, net merging, and propagation
 */

import type {
  NetNode,
  ComponentPin,
  Wire,
  Voltage,
  Current,
  Component,
  PinState,
  PinMode,
} from '../core/types';
import { v4 as uuid } from 'uuid';

interface NetConnection {
  pinId: string;
  componentId: string;
}

export class NetlistManager {
  private nets: Map<string, NetNode> = new Map();
  private pinToNet: Map<string, string> = new Map();
  private netConnections: Map<string, NetConnection[]> = new Map();
  private wires: Map<string, Wire> = new Map();

  constructor() {
    this.createDefaultNets();
  }

  /**
   * Create default power and ground nets
   */
  private createDefaultNets(): void {
    // Ground net
    const groundNet: NetNode = {
      id: 'net_gnd',
      voltage: 0,
      isGround: true,
      isPower: false,
    };
    this.nets.set(groundNet.id, groundNet);
    this.netConnections.set(groundNet.id, []);

    // 5V power net
    const power5V: NetNode = {
      id: 'net_5v',
      voltage: 5.0,
      isGround: false,
      isPower: true,
      powerVoltage: 5.0,
    };
    this.nets.set(power5V.id, power5V);
    this.netConnections.set(power5V.id, []);

    // 3.3V power net
    const power3V3: NetNode = {
      id: 'net_3v3',
      voltage: 3.3,
      isGround: false,
      isPower: true,
      powerVoltage: 3.3,
    };
    this.nets.set(power3V3.id, power3V3);
    this.netConnections.set(power3V3.id, []);
  }

  /**
   * Create a new net
   */
  createNet(id?: string): NetNode {
    const netId = id || `net_${uuid().slice(0, 8)}`;
    const net: NetNode = {
      id: netId,
      voltage: 0,
      isGround: false,
      isPower: false,
    };
    this.nets.set(netId, net);
    this.netConnections.set(netId, []);
    return net;
  }

  /**
   * Get a net by ID
   */
  getNet(netId: string): NetNode | undefined {
    return this.nets.get(netId);
  }

  /**
   * Get all nets
   */
  getAllNets(): NetNode[] {
    return Array.from(this.nets.values());
  }

  /**
   * Connect a pin to a net
   */
  connectPinToNet(pin: ComponentPin, netId: string): void {
    // Remove from existing net if connected
    if (pin.netId) {
      this.disconnectPin(pin);
    }

    // Add to new net
    pin.netId = netId;
    this.pinToNet.set(pin.id, netId);

    const connections = this.netConnections.get(netId) || [];
    connections.push({
      pinId: pin.id,
      componentId: pin.componentId,
    });
    this.netConnections.set(netId, connections);
  }

  /**
   * Disconnect a pin from its net
   */
  disconnectPin(pin: ComponentPin): void {
    if (!pin.netId) return;

    const connections = this.netConnections.get(pin.netId) || [];
    const index = connections.findIndex((c) => c.pinId === pin.id);
    if (index !== -1) {
      connections.splice(index, 1);
    }
    this.netConnections.set(pin.netId, connections);

    this.pinToNet.delete(pin.id);
    pin.netId = null;
  }

  /**
   * Add a wire connection between two pins
   */
  addWire(wire: Wire): void {
    this.wires.set(wire.id, wire);
  }

  /**
   * Remove a wire
   */
  removeWire(wireId: string): void {
    this.wires.delete(wireId);
  }

  /**
   * Get net for a pin
   */
  getNetForPin(pinId: string): NetNode | undefined {
    const netId = this.pinToNet.get(pinId);
    return netId ? this.nets.get(netId) : undefined;
  }

  /**
   * Get all pins connected to a net
   */
  getPinsOnNet(netId: string): NetConnection[] {
    return this.netConnections.get(netId) || [];
  }

  /**
   * Merge two nets (when wire connects them)
   */
  mergeNets(netId1: string, netId2: string): string {
    if (netId1 === netId2) return netId1;

    const net1 = this.nets.get(netId1);
    const net2 = this.nets.get(netId2);
    if (!net1 || !net2) return netId1;

    // Prefer power/ground nets
    let survivingNet = net1;
    let mergingNet = net2;
    if (net2.isPower || net2.isGround) {
      survivingNet = net2;
      mergingNet = net1;
    }

    // Move all connections from merging net to surviving net
    const mergingConnections = this.netConnections.get(mergingNet.id) || [];
    const survivingConnections = this.netConnections.get(survivingNet.id) || [];

    for (const conn of mergingConnections) {
      this.pinToNet.set(conn.pinId, survivingNet.id);
      survivingConnections.push(conn);
    }

    this.netConnections.set(survivingNet.id, survivingConnections);
    this.netConnections.delete(mergingNet.id);
    this.nets.delete(mergingNet.id);

    return survivingNet.id;
  }

  /**
   * Calculate voltage on a net based on drivers
   */
  calculateNetVoltage(
    netId: string,
    components: Map<string, Component>
  ): Voltage {
    const net = this.nets.get(netId);
    if (!net) return 0;

    // Power nets have fixed voltage
    if (net.isPower) return net.powerVoltage || 0;
    if (net.isGround) return 0;

    // Find all drivers on this net
    const connections = this.netConnections.get(netId) || [];
    let highDrivers = 0;
    let lowDrivers = 0;
    let pullUps = 0;
    let pullDowns = 0;
    let hasOutputDriver = false;

    for (const conn of connections) {
      const component = components.get(conn.componentId);
      if (!component) continue;

      const pin = component.pins.find((p) => p.id === conn.pinId);
      if (!pin) continue;

      if (pin.mode === PinMode.OUTPUT || pin.mode === PinMode.PWM) {
        hasOutputDriver = true;
        if (pin.state === PinState.HIGH) {
          highDrivers++;
        } else if (pin.state === PinState.LOW) {
          lowDrivers++;
        }
      } else if (pin.mode === PinMode.INPUT_PULLUP) {
        pullUps++;
      }

      if (pin.state === PinState.PULL_UP) pullUps++;
      if (pin.state === PinState.PULL_DOWN) pullDowns++;
    }

    // Determine net voltage
    if (hasOutputDriver) {
      if (highDrivers > 0 && lowDrivers > 0) {
        // Contention - short circuit
        return 2.5; // Undefined, approximately mid-rail
      }
      if (highDrivers > 0) return 5.0;
      if (lowDrivers > 0) return 0;
    }

    // No strong drivers, check weak pull-ups/downs
    if (pullUps > 0 && pullDowns === 0) return 5.0;
    if (pullDowns > 0 && pullUps === 0) return 0;
    if (pullUps > 0 && pullDowns > 0) return 2.5;

    // Floating - undefined
    return -1;
  }

  /**
   * Propagate pin state changes through nets
   */
  propagateSignal(
    sourcePin: ComponentPin,
    components: Map<string, Component>
  ): ComponentPin[] {
    const affectedPins: ComponentPin[] = [];

    if (!sourcePin.netId) return affectedPins;

    const voltage = this.calculateNetVoltage(sourcePin.netId, components);
    const connections = this.netConnections.get(sourcePin.netId) || [];

    for (const conn of connections) {
      if (conn.pinId === sourcePin.id) continue;

      const component = components.get(conn.componentId);
      if (!component) continue;

      const pin = component.pins.find((p) => p.id === conn.pinId);
      if (!pin) continue;

      // Update pin voltage
      if (pin.voltage !== voltage) {
        pin.voltage = voltage;

        // Update digital state for inputs
        if (pin.mode === PinMode.INPUT || pin.mode === PinMode.INPUT_PULLUP) {
          const threshold = 2.5; // TTL threshold
          const newState = voltage >= threshold ? PinState.HIGH : PinState.LOW;
          if (pin.state !== newState) {
            pin.state = newState;
            affectedPins.push(pin);
          }
        }
      }
    }

    return affectedPins;
  }

  /**
   * Get complete netlist data for serialization
   */
  serialize(): {
    nets: NetNode[];
    connections: Record<string, NetConnection[]>;
    wires: Wire[];
  } {
    return {
      nets: Array.from(this.nets.values()),
      connections: Object.fromEntries(this.netConnections),
      wires: Array.from(this.wires.values()),
    };
  }

  /**
   * Load netlist from serialized data
   */
  deserialize(data: {
    nets: NetNode[];
    connections: Record<string, NetConnection[]>;
    wires: Wire[];
  }): void {
    this.nets.clear();
    this.pinToNet.clear();
    this.netConnections.clear();
    this.wires.clear();

    for (const net of data.nets) {
      this.nets.set(net.id, net);
    }

    for (const [netId, connections] of Object.entries(data.connections)) {
      this.netConnections.set(netId, connections);
      for (const conn of connections) {
        this.pinToNet.set(conn.pinId, netId);
      }
    }

    for (const wire of data.wires) {
      this.wires.set(wire.id, wire);
    }
  }

  /**
   * Clear all nets and connections
   */
  clear(): void {
    this.nets.clear();
    this.pinToNet.clear();
    this.netConnections.clear();
    this.wires.clear();
    this.createDefaultNets();
  }
}

// UUID generation helper (simplified for browser)
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
