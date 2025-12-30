/**
 * Command Pattern + Undo/Redo History
 * Implements undo/redo functionality for circuit editing
 *
 * Features:
 * - Command pattern for reversible operations
 * - Undo/Redo stack with configurable depth
 * - Command grouping (for bulk operations)
 * - History traversal
 */

import type { Command, CommandHistory as ICommandHistory } from './contracts';

/**
 * Command History Implementation
 */
export class CommandHistory implements ICommandHistory {
  private history: Command[];
  private currentIndex: number;
  private maxHistory: number;
  private groupDepth: number; // For command grouping
  private groupBuffer: Command[];

  constructor(maxHistory: number = 100) {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistory = maxHistory;
    this.groupDepth = 0;
    this.groupBuffer = [];
  }

  /**
   * Execute a command and add to history
   */
  execute(command: Command): void {
    // If we're in a group, buffer the command
    if (this.groupDepth > 0) {
      this.groupBuffer.push(command);
      command.execute();
      return;
    }

    // Execute the command
    command.execute();

    // Clear any redo history
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add to history
    this.history.push(command);
    this.currentIndex++;

    // Enforce max history
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }

    console.log(`[CommandHistory] Executed: ${command.constructor.name} (${this.currentIndex + 1}/${this.history.length})`);
  }

  /**
   * Undo last command
   */
  undo(): void {
    if (!this.canUndo()) {
      console.warn('[CommandHistory] Nothing to undo');
      return;
    }

    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;

    console.log(`[CommandHistory] Undone: ${command.constructor.name} (${this.currentIndex + 1}/${this.history.length})`);
  }

  /**
   * Redo next command
   */
  redo(): void {
    if (!this.canRedo()) {
      console.warn('[CommandHistory] Nothing to redo');
      return;
    }

    this.currentIndex++;
    const command = this.history[this.currentIndex];

    // Use redo() if available, otherwise execute()
    if (command.redo) {
      command.redo();
    } else {
      command.execute();
    }

    console.log(`[CommandHistory] Redone: ${command.constructor.name} (${this.currentIndex + 1}/${this.history.length})`);
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    console.log('[CommandHistory] History cleared');
  }

  /**
   * Start command group (for bulk operations)
   */
  beginGroup(): void {
    this.groupDepth++;
    if (this.groupDepth === 1) {
      this.groupBuffer = [];
    }
  }

  /**
   * End command group (creates single composite command)
   */
  endGroup(groupName: string = 'Group'): void {
    if (this.groupDepth === 0) {
      console.warn('[CommandHistory] No group to end');
      return;
    }

    this.groupDepth--;

    if (this.groupDepth === 0 && this.groupBuffer.length > 0) {
      // Create composite command
      const groupCommand = new GroupCommand(groupName, this.groupBuffer);
      this.groupBuffer = [];

      // Add to history (without executing again)
      this.history = this.history.slice(0, this.currentIndex + 1);
      this.history.push(groupCommand);
      this.currentIndex++;

      // Enforce max history
      if (this.history.length > this.maxHistory) {
        this.history.shift();
        this.currentIndex--;
      }

      console.log(`[CommandHistory] Group created: ${groupName} (${groupCommand.getCommands().length} commands)`);
    }
  }

  /**
   * Get history info
   */
  getHistory(): { commands: string[]; currentIndex: number } {
    return {
      commands: this.history.map(cmd => cmd.constructor.name),
      currentIndex: this.currentIndex,
    };
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalCommands: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoCount: this.currentIndex + 1,
      redoCount: this.history.length - this.currentIndex - 1,
    };
  }
}

/**
 * Group Command - Composite of multiple commands
 */
export class GroupCommand implements Command {
  private name: string;
  private commands: Command[];

  constructor(name: string, commands: Command[]) {
    this.name = name;
    this.commands = [...commands];
  }

  execute(): void {
    for (const cmd of this.commands) {
      cmd.execute();
    }
  }

  undo(): void {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }

  redo(): void {
    for (const cmd of this.commands) {
      if (cmd.redo) {
        cmd.redo();
      } else {
        cmd.execute();
      }
    }
  }

  getCommands(): Command[] {
    return this.commands;
  }

  toString(): string {
    return `${this.name} (${this.commands.length} commands)`;
  }
}

// =============================================================================
// BUILT-IN COMMANDS
// =============================================================================

/**
 * Add Component Command
 */
export class AddComponentCommand implements Command {
  private circuit: any; // Circuit instance
  private component: any;

  constructor(circuit: any, component: any) {
    this.circuit = circuit;
    this.component = component;
  }

  execute(): void {
    this.circuit.addComponent(this.component);
  }

  undo(): void {
    this.circuit.removeComponent(this.component.id);
  }
}

/**
 * Remove Component Command
 */
export class RemoveComponentCommand implements Command {
  private circuit: any;
  private component: any;
  private index: number = -1;

  constructor(circuit: any, componentId: string) {
    this.circuit = circuit;
    const idx = circuit.components.findIndex((c: any) => c.id === componentId);
    if (idx !== -1) {
      this.component = circuit.components[idx];
      this.index = idx;
    }
  }

  execute(): void {
    if (this.index !== -1) {
      this.circuit.removeComponent(this.component.id);
    }
  }

  undo(): void {
    if (this.component) {
      this.circuit.addComponent(this.component, this.index);
    }
  }
}

/**
 * Move Component Command
 */
export class MoveComponentCommand implements Command {
  private component: any;
  private oldPosition: { x: number; y: number; z: number };
  private newPosition: { x: number; y: number; z: number };

  constructor(
    component: any,
    newPosition: { x: number; y: number; z: number }
  ) {
    this.component = component;
    this.oldPosition = { ...component.position };
    this.newPosition = newPosition;
  }

  execute(): void {
    this.component.position = { ...this.newPosition };
  }

  undo(): void {
    this.component.position = { ...this.oldPosition };
  }
}

/**
 * Add Wire Command
 */
export class AddWireCommand implements Command {
  private circuit: any;
  private wire: any;

  constructor(circuit: any, wire: any) {
    this.circuit = circuit;
    this.wire = wire;
  }

  execute(): void {
    this.circuit.addWire(this.wire);
  }

  undo(): void {
    this.circuit.removeWire(this.wire.id);
  }
}

/**
 * Remove Wire Command
 */
export class RemoveWireCommand implements Command {
  private circuit: any;
  private wire: any;
  private index: number = -1;

  constructor(circuit: any, wireId: string) {
    this.circuit = circuit;
    const idx = circuit.wires.findIndex((w: any) => w.id === wireId);
    if (idx !== -1) {
      this.wire = circuit.wires[idx];
      this.index = idx;
    }
  }

  execute(): void {
    if (this.index !== -1) {
      this.circuit.removeWire(this.wire.id);
    }
  }

  undo(): void {
    if (this.wire) {
      this.circuit.addWire(this.wire, this.index);
    }
  }
}

/**
 * Update Property Command
 */
export class UpdatePropertyCommand implements Command {
  private component: any;
  private propertyName: string;
  private oldValue: any;
  private newValue: any;

  constructor(component: any, propertyName: string, newValue: any) {
    this.component = component;
    this.propertyName = propertyName;
    this.oldValue = component.properties[propertyName];
    this.newValue = newValue;
  }

  execute(): void {
    this.component.properties[this.propertyName] = this.newValue;
  }

  undo(): void {
    this.component.properties[this.propertyName] = this.oldValue;
  }
}
