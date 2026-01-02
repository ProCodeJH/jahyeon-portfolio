/**
 * Breadboard Component Definition
 * Full-size (830 tie points) and half-size (400 tie points) breadboard
 * with accurate internal connection modeling
 */

import type {
  Component,
  ComponentPin,
  ComponentTransform,
  BreadboardHole,
  BreadboardRail,
  BreadboardState,
  PinMode,
  PinState,
  ComponentType,
} from '../core/types';

// Breadboard physical dimensions (in mm)
export const BREADBOARD_DIMENSIONS = {
  // Full-size breadboard (830 tie points)
  full: {
    width: 165.1,
    height: 54.61,
    thickness: 8.5,
    holeSpacing: 2.54, // 0.1" standard
    holeRadius: 0.5,
    railWidth: 7.62,
    terminalStripWidth: 46.99,
    centerGap: 7.62,
    rows: 63, // holes per row (a-e or f-j)
    terminalRows: 5, // a,b,c,d,e and f,g,h,i,j
  },
  // Half-size breadboard (400 tie points)
  half: {
    width: 82.55,
    height: 54.61,
    thickness: 8.5,
    holeSpacing: 2.54,
    holeRadius: 0.5,
    railWidth: 7.62,
    terminalStripWidth: 46.99,
    centerGap: 7.62,
    rows: 30,
    terminalRows: 5,
  },
};

// Row labels for terminal strips
const TERMINAL_ROWS_TOP = ['a', 'b', 'c', 'd', 'e'];
const TERMINAL_ROWS_BOTTOM = ['f', 'g', 'h', 'i', 'j'];

// Power rail indicators
const POWER_RAIL_POSITIVE = '+';
const POWER_RAIL_NEGATIVE = '-';

export interface BreadboardConfig {
  type: 'full' | 'half';
  hasTopRails: boolean;
  hasBottomRails: boolean;
}

/**
 * Create hole ID from row label and column number
 */
export function createHoleId(row: string, col: number): string {
  return `${row}${col}`;
}

/**
 * Parse hole ID into row and column
 */
export function parseHoleId(holeId: string): { row: string; col: number } | null {
  const match = holeId.match(/^([a-j+\-])(\d+)$/);
  if (!match) return null;
  return { row: match[1], col: parseInt(match[2], 10) };
}

/**
 * Get the net ID for a breadboard hole based on internal connections
 * Terminal strips: rows a-e and f-j are connected horizontally per column
 * Power rails: all holes in a rail segment are connected
 */
export function getInternalNetId(
  breadboardId: string,
  holeId: string,
  config: BreadboardConfig
): string {
  const parsed = parseHoleId(holeId);
  if (!parsed) return `${breadboardId}_net_${holeId}`;

  const { row, col } = parsed;

  // Power rails
  if (row === '+') {
    // Positive power rails - split at center on full-size boards
    if (config.type === 'full' && col > 30) {
      return `${breadboardId}_rail_pos_right`;
    }
    return `${breadboardId}_rail_pos_left`;
  }
  if (row === '-') {
    // Negative power rails (ground)
    if (config.type === 'full' && col > 30) {
      return `${breadboardId}_rail_neg_right`;
    }
    return `${breadboardId}_rail_neg_left`;
  }

  // Terminal strips
  if (TERMINAL_ROWS_TOP.includes(row)) {
    // Top terminal strip (a-e) - connected vertically per column
    return `${breadboardId}_col_${col}_top`;
  }
  if (TERMINAL_ROWS_BOTTOM.includes(row)) {
    // Bottom terminal strip (f-j) - connected vertically per column
    return `${breadboardId}_col_${col}_bottom`;
  }

  return `${breadboardId}_net_${holeId}`;
}

/**
 * Get hole position in 3D space relative to breadboard origin
 */
export function getHolePosition(
  row: string,
  col: number,
  config: BreadboardConfig
): { x: number; y: number; z: number } {
  const dims = BREADBOARD_DIMENSIONS[config.type];
  const spacing = dims.holeSpacing;

  // Start from top-left corner
  let x = col * spacing;
  let y = 0;

  // Power rails at top
  if (row === '+' && config.hasTopRails) {
    y = dims.railWidth / 2;
  } else if (row === '-' && config.hasTopRails) {
    y = dims.railWidth * 1.5;
  }
  // Top terminal strip (a-e)
  else if (TERMINAL_ROWS_TOP.includes(row)) {
    const rowIndex = TERMINAL_ROWS_TOP.indexOf(row);
    y = (config.hasTopRails ? dims.railWidth * 2 : 0) + (rowIndex + 0.5) * spacing;
  }
  // Bottom terminal strip (f-j)
  else if (TERMINAL_ROWS_BOTTOM.includes(row)) {
    const rowIndex = TERMINAL_ROWS_BOTTOM.indexOf(row);
    y =
      (config.hasTopRails ? dims.railWidth * 2 : 0) +
      dims.terminalRows * spacing +
      dims.centerGap +
      (rowIndex + 0.5) * spacing;
  }
  // Bottom power rails
  else if (row === '+' && !config.hasTopRails && config.hasBottomRails) {
    y = dims.height - dims.railWidth * 1.5;
  } else if (row === '-' && !config.hasTopRails && config.hasBottomRails) {
    y = dims.height - dims.railWidth / 2;
  }

  return { x, y, z: dims.thickness };
}

/**
 * Check if two holes are internally connected
 */
export function areHolesConnected(
  hole1: string,
  hole2: string,
  breadboardId: string,
  config: BreadboardConfig
): boolean {
  const net1 = getInternalNetId(breadboardId, hole1, config);
  const net2 = getInternalNetId(breadboardId, hole2, config);
  return net1 === net2;
}

/**
 * Get all holes connected to a specific hole
 */
export function getConnectedHoles(
  holeId: string,
  config: BreadboardConfig
): string[] {
  const parsed = parseHoleId(holeId);
  if (!parsed) return [];

  const { row, col } = parsed;
  const connected: string[] = [];

  // Power rails
  if (row === '+' || row === '-') {
    const cols = config.type === 'full' ? 63 : 30;
    for (let c = 1; c <= cols; c++) {
      if (c !== col) {
        // Check for rail breaks on full-size boards
        if (config.type === 'full') {
          const sameSegment =
            (col <= 30 && c <= 30) || (col > 30 && c > 30);
          if (sameSegment) {
            connected.push(createHoleId(row, c));
          }
        } else {
          connected.push(createHoleId(row, c));
        }
      }
    }
    return connected;
  }

  // Terminal strips
  if (TERMINAL_ROWS_TOP.includes(row)) {
    // All holes in same column, top terminal strip
    for (const r of TERMINAL_ROWS_TOP) {
      if (r !== row) {
        connected.push(createHoleId(r, col));
      }
    }
  } else if (TERMINAL_ROWS_BOTTOM.includes(row)) {
    // All holes in same column, bottom terminal strip
    for (const r of TERMINAL_ROWS_BOTTOM) {
      if (r !== row) {
        connected.push(createHoleId(r, col));
      }
    }
  }

  return connected;
}

/**
 * Create a breadboard component
 */
export function createBreadboard(
  id: string,
  config: BreadboardConfig = { type: 'full', hasTopRails: true, hasBottomRails: true },
  position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
): Component {
  const dims = BREADBOARD_DIMENSIONS[config.type];
  const pins: ComponentPin[] = [];
  const holes: Map<string, BreadboardHole> = new Map();

  const transform: ComponentTransform = {
    position,
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };

  // Create power rail holes
  if (config.hasTopRails || config.hasBottomRails) {
    for (const railType of ['+', '-']) {
      for (let col = 1; col <= dims.rows; col++) {
        const holeId = createHoleId(railType, col);
        const netId = getInternalNetId(id, holeId, config);
        const pos = getHolePosition(railType, col, config);

        const hole: BreadboardHole = {
          row: railType === '+' ? -1 : -2,
          col,
          netId,
          occupied: false,
        };
        holes.set(holeId, hole);

        pins.push({
          id: `${id}_${holeId}`,
          name: holeId,
          componentId: id,
          netId,
          mode: PinMode.INPUT,
          state: PinState.LOW,
          voltage: 0,
          current: 0,
        });
      }
    }
  }

  // Create terminal strip holes
  for (const rows of [TERMINAL_ROWS_TOP, TERMINAL_ROWS_BOTTOM]) {
    for (const row of rows) {
      for (let col = 1; col <= dims.rows; col++) {
        const holeId = createHoleId(row, col);
        const netId = getInternalNetId(id, holeId, config);
        const pos = getHolePosition(row, col, config);

        const hole: BreadboardHole = {
          row: rows === TERMINAL_ROWS_TOP
            ? TERMINAL_ROWS_TOP.indexOf(row)
            : TERMINAL_ROWS_BOTTOM.indexOf(row) + 5,
          col,
          netId,
          occupied: false,
        };
        holes.set(holeId, hole);

        pins.push({
          id: `${id}_${holeId}`,
          name: holeId,
          componentId: id,
          netId,
          mode: PinMode.INPUT,
          state: PinState.LOW,
          voltage: 0,
          current: 0,
        });
      }
    }
  }

  return {
    id,
    type: ComponentType.BREADBOARD,
    name: config.type === 'full' ? 'Full-Size Breadboard' : 'Half-Size Breadboard',
    transform,
    pins,
    properties: {
      config,
      dimensions: dims,
      holes: Object.fromEntries(holes),
      totalTiePoints: config.type === 'full' ? 830 : 400,
    },
  };
}

/**
 * Get a specific hole from a breadboard
 */
export function getHole(
  breadboard: Component,
  holeId: string
): ComponentPin | undefined {
  return breadboard.pins.find((p) => p.name === holeId);
}

/**
 * Insert a component lead into a breadboard hole
 */
export function insertLead(
  breadboard: Component,
  holeId: string,
  componentId: string
): boolean {
  const holes = breadboard.properties.holes as Record<string, BreadboardHole>;
  const hole = holes[holeId];

  if (!hole || hole.occupied) {
    return false;
  }

  hole.occupied = true;
  hole.occupiedBy = componentId;
  return true;
}

/**
 * Remove a component lead from a breadboard hole
 */
export function removeLead(breadboard: Component, holeId: string): boolean {
  const holes = breadboard.properties.holes as Record<string, BreadboardHole>;
  const hole = holes[holeId];

  if (!hole || !hole.occupied) {
    return false;
  }

  hole.occupied = false;
  hole.occupiedBy = undefined;
  return true;
}

/**
 * Get all occupied holes in a breadboard
 */
export function getOccupiedHoles(
  breadboard: Component
): { holeId: string; componentId: string }[] {
  const holes = breadboard.properties.holes as Record<string, BreadboardHole>;
  const occupied: { holeId: string; componentId: string }[] = [];

  for (const [holeId, hole] of Object.entries(holes)) {
    if (hole.occupied && hole.occupiedBy) {
      occupied.push({ holeId, componentId: hole.occupiedBy });
    }
  }

  return occupied;
}
