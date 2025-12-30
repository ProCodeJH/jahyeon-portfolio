/**
 * Wire Utilities
 * Helper functions for wire rendering and manipulation
 */

import * as THREE from 'three';
import type { Position3D, Wire } from '@circuit-sim/kernel/contracts';

/**
 * Generate Bezier curve points for a wire
 */
export function generateWireCurve(
  start: Position3D,
  end: Position3D,
  controlPoints?: Position3D[]
): THREE.Vector3[] {
  if (!controlPoints || controlPoints.length === 0) {
    // Straight line
    return [
      new THREE.Vector3(start.x, start.y, start.z),
      new THREE.Vector3(end.x, end.y, end.z),
    ];
  }

  // Cubic Bezier curve
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(start.x, start.y, start.z),
    new THREE.Vector3(controlPoints[0].x, controlPoints[0].y, controlPoints[0].z),
    new THREE.Vector3(
      controlPoints[1]?.x || end.x,
      controlPoints[1]?.y || end.y,
      controlPoints[1]?.z || end.z
    ),
    new THREE.Vector3(end.x, end.y, end.z)
  );

  // Generate points along curve (higher resolution for smoother curves)
  const points = curve.getPoints(50);
  return points;
}

/**
 * Auto-generate control points for natural wire routing
 */
export function autoGenerateControlPoints(
  start: Position3D,
  end: Position3D,
  sag: number = 0.2
): Position3D[] {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Add sag in the middle (gravity effect)
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2 - sag * distance;
  const midZ = (start.z + end.z) / 2;

  // Two control points for cubic bezier
  return [
    {
      x: start.x + dx * 0.25,
      y: midY,
      z: start.z + dz * 0.25,
    },
    {
      x: start.x + dx * 0.75,
      y: midY,
      z: start.z + dz * 0.75,
    },
  ];
}

/**
 * Get wire color based on voltage and type
 */
export function getWireColorByVoltage(voltage: number): THREE.Color {
  if (voltage > 4.5) return new THREE.Color(0xff0000); // Red (5V power)
  if (voltage > 3.0) return new THREE.Color(0xffaa00); // Orange (3.3V)
  if (voltage > 1.5) return new THREE.Color(0xffff00); // Yellow (signal HIGH)
  if (voltage > 0.5) return new THREE.Color(0x00ff00); // Green (weak signal)
  return new THREE.Color(0x333333); // Dark gray (GND)
}

/**
 * Standard wire colors (electronics convention)
 */
export const WIRE_COLORS = {
  RED: 0xff0000,      // Power (+5V)
  BLACK: 0x000000,    // Ground (GND)
  BLUE: 0x0000ff,     // Data/Signal
  GREEN: 0x00ff00,    // Data/Signal
  YELLOW: 0xffff00,   // Data/Signal
  ORANGE: 0xffaa00,   // +3.3V
  PURPLE: 0xff00ff,   // Special/I2C SDA
  GRAY: 0x808080,     // Special/I2C SCL
  WHITE: 0xffffff,    // Data/Signal
  BROWN: 0x8b4513,    // Alternative signal
  CYAN: 0x00ffff,     // Default
} as const;

/**
 * Get recommended wire color for common connections
 */
export function getRecommendedWireColor(
  fromPin: string,
  toPin: string
): number {
  const from = fromPin.toUpperCase();
  const to = toPin.toUpperCase();

  // Power connections
  if (from.includes('VCC') || from.includes('5V') || to.includes('VCC') || to.includes('5V')) {
    return WIRE_COLORS.RED;
  }
  if (from.includes('3V3') || to.includes('3V3')) {
    return WIRE_COLORS.ORANGE;
  }

  // Ground
  if (from.includes('GND') || to.includes('GND')) {
    return WIRE_COLORS.BLACK;
  }

  // I2C
  if (from.includes('SDA') || to.includes('SDA')) {
    return WIRE_COLORS.PURPLE;
  }
  if (from.includes('SCL') || to.includes('SCL')) {
    return WIRE_COLORS.GRAY;
  }

  // Default signal color
  return WIRE_COLORS.CYAN;
}

/**
 * Create tube geometry for wire
 */
export function createWireTubeGeometry(
  points: THREE.Vector3[],
  radius: number = 0.02,
  segments: number = 8
): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(curve, points.length * 2, radius, segments, false);
}

/**
 * Create wire material with flow effect
 */
export function createWireMaterial(
  color: number | string,
  emissiveIntensity: number = 0.3
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity,
    metalness: 0.2,
    roughness: 0.7,
  });
}

/**
 * Calculate wire length
 */
export function calculateWireLength(points: Position3D[]): number {
  let length = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    length += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  return length;
}

/**
 * Simplify wire path (reduce points while maintaining shape)
 */
export function simplifyWirePath(
  points: Position3D[],
  tolerance: number = 0.1
): Position3D[] {
  if (points.length <= 2) return points;

  // Douglas-Peucker algorithm
  const simplified: Position3D[] = [points[0]];

  function douglasPeucker(start: number, end: number) {
    if (end - start <= 1) return;

    let maxDist = 0;
    let maxIndex = 0;

    for (let i = start + 1; i < end; i++) {
      const dist = perpendicularDistance(points[i], points[start], points[end]);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }

    if (maxDist > tolerance) {
      douglasPeucker(start, maxIndex);
      simplified.push(points[maxIndex]);
      douglasPeucker(maxIndex, end);
    }
  }

  douglasPeucker(0, points.length - 1);
  simplified.push(points[points.length - 1]);

  return simplified;
}

/**
 * Calculate perpendicular distance from point to line
 */
function perpendicularDistance(
  point: Position3D,
  lineStart: Position3D,
  lineEnd: Position3D
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const dz = lineEnd.z - lineStart.z;

  const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (mag === 0) return 0;

  const u =
    ((point.x - lineStart.x) * dx +
      (point.y - lineStart.y) * dy +
      (point.z - lineStart.z) * dz) /
    (mag * mag);

  const ix = lineStart.x + u * dx;
  const iy = lineStart.y + u * dy;
  const iz = lineStart.z + u * dz;

  const pdx = point.x - ix;
  const pdy = point.y - iy;
  const pdz = point.z - iz;

  return Math.sqrt(pdx * pdx + pdy * pdy + pdz * pdz);
}

/**
 * Validate wire connection (check if pins are compatible)
 */
export function validateWireConnection(
  fromPinType: string,
  toPinType: string
): { valid: boolean; warning?: string } {
  // Power to ground - dangerous!
  if (
    (fromPinType.includes('POWER') && toPinType.includes('GROUND')) ||
    (fromPinType.includes('GROUND') && toPinType.includes('POWER'))
  ) {
    return {
      valid: false,
      warning: 'Cannot connect power directly to ground (short circuit)',
    };
  }

  // Different voltage levels
  if (
    fromPinType.includes('5V') &&
    (toPinType.includes('3V3') || toPinType.includes('3.3V'))
  ) {
    return {
      valid: true,
      warning: 'Connecting 5V to 3.3V pin may damage component',
    };
  }

  return { valid: true };
}
