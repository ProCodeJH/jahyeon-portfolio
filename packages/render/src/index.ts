/**
 * @circuit-sim/render
 * Rendering utilities and components for the circuit simulator
 */

export { ModelLoader, modelLoader } from './ModelLoader';
export type { ModelMetadata, LoadedModel } from './ModelLoader';

export { WireRenderer, FlowMode } from './WireRenderer';

export {
  generateWireCurve,
  autoGenerateControlPoints,
  getWireColorByVoltage,
  getRecommendedWireColor,
  createWireTubeGeometry,
  createWireMaterial,
  calculateWireLength,
  simplifyWirePath,
  validateWireConnection,
  WIRE_COLORS,
} from './WireUtils';
