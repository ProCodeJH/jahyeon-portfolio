/**
 * @circuit-sim/kernel
 * Core contracts and data structures for the circuit simulator
 */

// Export all contracts
export * from './contracts';

// Export core data structures
export { ConnectivityGraph } from './ConnectivityGraph';
export { ComponentRegistry, componentRegistry } from './ComponentRegistry';
export { LogicAnalyzer } from './LogicAnalyzer';

// Export command system (undo/redo)
export {
  CommandHistory,
  GroupCommand,
  AddComponentCommand,
  RemoveComponentCommand,
  MoveComponentCommand,
  AddWireCommand,
  RemoveWireCommand,
  UpdatePropertyCommand,
} from './CommandHistory';

// Export project file management
export { ProjectFileManager } from './ProjectFile';

// Export demo circuits
export {
  getBlinkDemo,
  getUltrasonicDemo,
  getServoDemo,
  getAllDemos,
} from './DemoCircuits';
