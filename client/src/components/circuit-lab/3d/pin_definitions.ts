
// Pin Offsets (Relative to component center, no rotation)
// Units: meters (Scale 1:1 with 3D models)

export interface PinDefinition {
    x: number;
    y: number;
    z: number;
}

export const ARDUINO_PINS: Record<string, PinDefinition> = {
    // Digital Pins (Right Side - Top Bank)
    // Approximate positions based on Arduino3D.tsx geometry
    'd0': { x: 0.032, y: 0.005, z: 0.015 },
    'd1': { x: 0.032, y: 0.005, z: 0.012 },
    'd2': { x: 0.032, y: 0.005, z: 0.009 },
    'd3': { x: 0.032, y: 0.005, z: 0.006 },
    'd4': { x: 0.032, y: 0.005, z: 0.003 },
    'd5': { x: 0.032, y: 0.005, z: 0.000 },
    'd6': { x: 0.032, y: 0.005, z: -0.003 },
    'd7': { x: 0.032, y: 0.005, z: -0.006 },

    // Power / Analog (Left Side)
    '5v': { x: -0.032, y: 0.005, z: 0.015 },
    'gnd1': { x: -0.032, y: 0.005, z: 0.012 },
    'gnd2': { x: -0.032, y: 0.005, z: 0.009 },
    'vin': { x: -0.032, y: 0.005, z: 0.006 },
    'a0': { x: -0.032, y: 0.005, z: -0.003 },
    'a1': { x: -0.032, y: 0.005, z: -0.006 },
};

// Function to generate Grid Pins for Breadboard
export const getBreadboardPin = (row: number, col: number, section: 'top' | 'bottom' | 'middle'): PinDefinition => {
    // Breadboard math
    const PITCH = 0.00254; // 2.54mm pitch
    const CENTER_GAP = 0.0075;

    // Center is (0,0,0).
    // Rows run along Z axis? No, typically rows are numbered 1-30 along X or Z.
    // In Breadboard3D, WIDTH is 165mm (long axis). HEIGHT is 54mm (short axis).
    // Let's assume WIDTH (X) is lines 1-60.
    // HEIGHT (Z) is abcde fghij.

    // Simplification: We will support specific rows/cols if requested.
    // For now return dummy.
    return { x: 0, y: 0.005, z: 0 };
};

export const COMPONENT_PINS: Record<string, Record<string, PinDefinition>> = {
    'arduino': ARDUINO_PINS,
    'breadboard': {}, // Dynamic
};
