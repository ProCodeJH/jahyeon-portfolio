import * as THREE from 'three';
import { ARDUINO_PINS } from './pin_definitions';

export interface Component {
    id: string;
    type: string;
    position: [number, number, number];
    rotation: [number, number, number];
}

/**
 * Calculates the world position of a pin given its parent component and pin name.
 */
export function getPinWorldPosition(
    componentId: string,
    pinId: string,
    components: any[] // We use any here to avoid circular dependency with store if possible, or just pass components
): [number, number, number] | null {
    const component = components.find(c => c.id === componentId);
    if (!component) return null;

    // Extract pin name from pinId (typically componentId_pin_pinName)
    const pinName = pinId.replace(`${componentId}_pin_`, '');

    let relativePos = { x: 0, y: 0, z: 0 };

    if (component.type === 'arduino') {
        const pinDef = ARDUINO_PINS[pinName];
        if (pinDef) {
            relativePos = pinDef;
        }
    } else if (component.type === 'breadboard') {
        // Breadboard pin parsing: bb_pin_row_col_section
        const parts = pinName.split('_');
        if (parts.length >= 3) {
            const row = parseInt(parts[0]);
            const col = parseInt(parts[1]);
            const section = parts[2] as 'top' | 'bottom' | 'middle' | 'rail_top_pos' | 'rail_top_neg' | 'rail_bot_pos' | 'rail_bot_neg';

            // Calculate relative position for breadboard holes
            relativePos = calculateBreadboardPinRelative(row, col, section);
        }
    } else if (component.type === 'led') {
        // LED has two pins: anode (pos) and cathode (neg)
        if (pinName === 'anode') relativePos = { x: 0.00127, y: -0.015, z: 0 };
        if (pinName === 'cathode') relativePos = { x: -0.00127, y: -0.015, z: 0 };
    } else if (component.type === 'resistor') {
        // Resistor has two pins at ends
        if (pinName === 'p1') relativePos = { x: -0.01, y: 0, z: 0 };
        if (pinName === 'p2') relativePos = { x: 0.01, y: 0, z: 0 };
    } else if (component.type === 'button') {
        // Button has 4 pins
        if (pinName === 'p1a') relativePos = { x: -0.003, y: 0, z: -0.003 };
        if (pinName === 'p1b') relativePos = { x: 0.003, y: 0, z: -0.003 };
        if (pinName === 'p2a') relativePos = { x: -0.003, y: 0, z: 0.003 };
        if (pinName === 'p2b') relativePos = { x: 0.003, y: 0, z: 0.003 };
    }

    // Apply rotation and position
    const pos = new THREE.Vector3(relativePos.x, relativePos.y, relativePos.z);
    const euler = new THREE.Euler(
        component.rotation[0],
        component.rotation[1],
        component.rotation[2]
    );
    pos.applyEuler(euler);
    pos.add(new THREE.Vector3(
        component.position[0],
        component.position[1],
        component.position[2]
    ));

    return [pos.x, pos.y, pos.z];
}

function calculateBreadboardPinRelative(row: number, col: number, section: string) {
    const PITCH = 0.00254; // 2.54mm pitch
    // Breadboard dimensions from Breadboard3D.tsx: 165.1mm x 54.61mm
    // 63 columns, 5-row terminal strips, power rails.

    let x = (col - 31.5) * PITCH; // Center-aligned X (col 31.5 is center)
    let y = 0.005; // Slightly above surface
    let z = 0;

    if (section === 'top') {
        z = -0.003 - (row * PITCH); // Up from center gap
    } else if (section === 'bottom') {
        z = 0.003 + (row * PITCH); // Down from center gap
    } else if (section.startsWith('rail_top')) {
        z = -0.022 + (section.includes('pos') ? 0 : PITCH);
        x = (col - 25) * PITCH; // Rails usually broken into chunks? Let's assume continuous
    } else if (section.startsWith('rail_bot')) {
        z = 0.022 - (section.includes('pos') ? 0 : PITCH);
        x = (col - 25) * PITCH;
    }

    return { x, y, z };
}
