/**
 * Connectivity Graph with Union-Find
 * Manages electrical connections between component pins
 *
 * Features:
 * - Union-Find with path compression and union by rank
 * - Incremental net updates (no full rebuild on wire changes)
 * - O(α(n)) amortized time for find/union
 */

import type {
  ComponentId,
  PinId,
  NetId,
  WireId,
  PinRef,
  Net,
  Wire,
  PinState,
  DigitalState,
} from './contracts';

/**
 * Internal net node for Union-Find
 */
interface NetNode {
  parent: string; // PinRef key
  rank: number;
  state: PinState;
}

/**
 * Connectivity Graph implementation
 */
export class ConnectivityGraph {
  private nodes: Map<string, NetNode>;
  private wires: Map<WireId, Wire>;
  private netCache: Map<string, Net>; // Cache for getNet()

  constructor() {
    this.nodes = new Map();
    this.wires = new Map();
    this.netCache = new Map();
  }

  // ==========================================================================
  // WIRE OPERATIONS
  // ==========================================================================

  /**
   * Add a wire between two pins
   * Returns the merged net
   */
  addWire(wire: Wire): Net {
    this.wires.set(wire.id, wire);

    // Ensure both pins exist in the graph
    const fromKey = this.pinKey(wire.from);
    const toKey = this.pinKey(wire.to);

    if (!this.nodes.has(fromKey)) {
      this.makeSet(wire.from);
    }
    if (!this.nodes.has(toKey)) {
      this.makeSet(wire.to);
    }

    // Union the two sets
    this.union(wire.from, wire.to);

    // Invalidate cache
    this.invalidateCache();

    return this.getNet(wire.from);
  }

  /**
   * Remove a wire
   * Returns affected nets (may split into multiple nets)
   */
  removeWire(wireId: WireId): Net[] {
    const wire = this.wires.get(wireId);
    if (!wire) {
      return [];
    }

    this.wires.delete(wireId);

    // Rebuild nets affected by this wire removal
    // This is the expensive operation, but unavoidable
    const affectedNets = this.rebuildNetsAround(wire);

    // Invalidate cache
    this.invalidateCache();

    return affectedNets;
  }

  /**
   * Get a wire by ID
   */
  getWire(wireId: WireId): Wire | null {
    return this.wires.get(wireId) || null;
  }

  /**
   * Get all wires
   */
  getAllWires(): Wire[] {
    return Array.from(this.wires.values());
  }

  // ==========================================================================
  // NET OPERATIONS
  // ==========================================================================

  /**
   * Get the net containing a pin
   */
  getNet(pinRef: PinRef): Net {
    const key = this.pinKey(pinRef);
    const rootKey = this.find(pinRef);

    // Check cache
    const cached = this.netCache.get(rootKey);
    if (cached) {
      return cached;
    }

    // Build net from scratch
    const pins: PinRef[] = [];
    const rootNode = this.nodes.get(rootKey);

    if (!rootNode) {
      // Isolated pin (no connections)
      const net: Net = {
        id: rootKey as NetId,
        pins: [pinRef],
        state: this.getDefaultPinState(),
      };
      this.netCache.set(rootKey, net);
      return net;
    }

    // Find all pins in this net
    for (const [nodeKey, node] of this.nodes.entries()) {
      if (this.findByKey(nodeKey) === rootKey) {
        pins.push(this.parsePin(nodeKey));
      }
    }

    const net: Net = {
      id: rootKey as NetId,
      pins,
      state: rootNode.state,
    };

    this.netCache.set(rootKey, net);
    return net;
  }

  /**
   * Get all nets in the graph
   */
  getAllNets(): Net[] {
    const roots = new Set<string>();

    // Find all root nodes
    for (const key of this.nodes.keys()) {
      roots.add(this.findByKey(key));
    }

    // Build nets
    return Array.from(roots).map(rootKey => {
      const pins: PinRef[] = [];
      for (const [nodeKey, node] of this.nodes.entries()) {
        if (this.findByKey(nodeKey) === rootKey) {
          pins.push(this.parsePin(nodeKey));
        }
      }

      const rootNode = this.nodes.get(rootKey)!;
      return {
        id: rootKey as NetId,
        pins,
        state: rootNode.state,
      };
    });
  }

  // ==========================================================================
  // UNION-FIND (Path Compression + Union by Rank)
  // ==========================================================================

  /**
   * Find the root of a pin's set (with path compression)
   */
  find(pinRef: PinRef): string {
    return this.findByKey(this.pinKey(pinRef));
  }

  /**
   * Find by key (internal)
   */
  private findByKey(key: string): string {
    const node = this.nodes.get(key);
    if (!node || node.parent === key) {
      return key;
    }

    // Path compression: make all nodes point directly to root
    node.parent = this.findByKey(node.parent);
    return node.parent;
  }

  /**
   * Union two pins' sets (with union by rank)
   */
  union(pin1: PinRef, pin2: PinRef): void {
    const root1 = this.find(pin1);
    const root2 = this.find(pin2);

    if (root1 === root2) {
      return; // Already in same set
    }

    const node1 = this.nodes.get(root1)!;
    const node2 = this.nodes.get(root2)!;

    // Union by rank: attach smaller tree under larger tree
    if (node1.rank < node2.rank) {
      node1.parent = root2;
      // Merge states (conflict detection)
      node2.state = this.mergeStates(node1.state, node2.state);
    } else if (node1.rank > node2.rank) {
      node2.parent = root1;
      node1.state = this.mergeStates(node1.state, node2.state);
    } else {
      node2.parent = root1;
      node1.rank += 1;
      node1.state = this.mergeStates(node1.state, node2.state);
    }
  }

  /**
   * Create a new set for a pin
   */
  private makeSet(pinRef: PinRef): void {
    const key = this.pinKey(pinRef);
    if (this.nodes.has(key)) {
      return;
    }

    this.nodes.set(key, {
      parent: key,
      rank: 0,
      state: this.getDefaultPinState(),
    });
  }

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  /**
   * Set the state of a pin (propagates to entire net)
   */
  setPinState(pinRef: PinRef, state: Partial<PinState>): void {
    const rootKey = this.find(pinRef);
    const rootNode = this.nodes.get(rootKey);

    if (!rootNode) {
      return;
    }

    // Update state
    rootNode.state = { ...rootNode.state, ...state };

    // Invalidate cache
    this.invalidateCache();
  }

  /**
   * Get the state of a pin
   */
  getPinState(pinRef: PinRef): PinState {
    const rootKey = this.find(pinRef);
    const rootNode = this.nodes.get(rootKey);

    return rootNode ? rootNode.state : this.getDefaultPinState();
  }

  /**
   * Merge two pin states (conflict detection)
   */
  private mergeStates(state1: PinState, state2: PinState): PinState {
    // Check for conflicts (multiple drivers)
    if (
      state1.digital !== DigitalState.Z &&
      state2.digital !== DigitalState.Z &&
      state1.digital !== state2.digital
    ) {
      // Conflict detected!
      return {
        digital: DigitalState.CONFLICT,
        voltage: 0,
        current: 0,
      };
    }

    // Take non-Z state if available
    if (state1.digital === DigitalState.Z) {
      return state2;
    }
    if (state2.digital === DigitalState.Z) {
      return state1;
    }

    // Average voltages
    return {
      digital: state1.digital,
      voltage: (state1.voltage + state2.voltage) / 2,
      current: state1.current + state2.current,
      pwm: state1.pwm || state2.pwm,
    };
  }

  /**
   * Default pin state (floating)
   */
  private getDefaultPinState(): PinState {
    return {
      digital: DigitalState.Z,
      voltage: 0,
      current: 0,
    };
  }

  // ==========================================================================
  // INCREMENTAL REBUILD
  // ==========================================================================

  /**
   * Rebuild nets around a removed wire (expensive but necessary)
   */
  private rebuildNetsAround(removedWire: Wire): Net[] {
    // This is the complex part: we need to split the net if necessary

    // Strategy: Remove all wires connected to these pins,
    // then re-add them one by one (except the removed wire)

    const affectedPins = new Set<string>();
    affectedPins.add(this.pinKey(removedWire.from));
    affectedPins.add(this.pinKey(removedWire.to));

    // Find all wires in the affected net
    const rootKey = this.find(removedWire.from);
    const affectedWires: Wire[] = [];

    for (const wire of this.wires.values()) {
      if (this.find(wire.from) === rootKey || this.find(wire.to) === rootKey) {
        affectedWires.push(wire);
      }
    }

    // Clear affected nodes
    for (const [key, node] of this.nodes.entries()) {
      if (this.findByKey(key) === rootKey) {
        this.nodes.delete(key);
      }
    }

    // Re-add wires (this will rebuild unions)
    for (const wire of affectedWires) {
      if (wire.id !== removedWire.id) {
        this.addWire(wire);
      }
    }

    // Return new nets
    const newRoots = new Set<string>();
    for (const pin of affectedPins) {
      newRoots.add(this.findByKey(pin));
    }

    return Array.from(newRoots).map(root => this.getNet(this.parsePin(root)));
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  /**
   * Convert PinRef to string key
   */
  private pinKey(pinRef: PinRef): string {
    return `${pinRef.component}:${pinRef.pin}`;
  }

  /**
   * Parse PinRef from string key
   */
  private parsePin(key: string): PinRef {
    const [component, pin] = key.split(':');
    return { component: component as ComponentId, pin: pin as PinId };
  }

  /**
   * Invalidate net cache
   */
  private invalidateCache(): void {
    this.netCache.clear();
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      pins: this.nodes.size,
      wires: this.wires.size,
      nets: new Set(Array.from(this.nodes.keys()).map(k => this.findByKey(k))).size,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.nodes.clear();
    this.wires.clear();
    this.netCache.clear();
  }
}
