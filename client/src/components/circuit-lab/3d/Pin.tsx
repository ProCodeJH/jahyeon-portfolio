
import { useRef, useState } from 'react';
import { useCursor } from '@react-three/drei';
import { useCircuitStore } from '../store';
import { Html } from '@react-three/drei';
import { getPinWorldPosition } from './utils';

interface PinProps {
    id: string; // Netlist ID (e.g., "arduino_1_pin_d13")
    position: [number, number, number];
    color?: string;
    radius?: number;
}

export function Pin({ id, position, color = 'red', radius = 0.002 }: PinProps) {
    const [hovered, setHovered] = useState(false);
    const {
        isWiring,
        setWiring,
        setHoveredPin,
        setDraftWire,
        addWire,
        draftWire,
        isDragging
    } = useCircuitStore();

    useCursor(hovered);

    return (
        <group position={position}>
            {/* Invisible Hitbox */}
            <mesh
                visible={false}
                onClick={(e) => {
                    e.stopPropagation();

                    if (!isWiring) {
                        const components = useCircuitStore.getState().components;
                        const startWorldPos = getPinWorldPosition(
                            id.split('_pin_')[0],
                            id,
                            components
                        );

                        if (startWorldPos) {
                            setDraftWire({
                                startPin: id,
                                endPosition: startWorldPos
                            });
                            setWiring(true);
                        }
                    } else {
                        // Finish wire
                        if (draftWire && draftWire.startPin !== id) {
                            const components = useCircuitStore.getState().components;
                            const startWorldPos = getPinWorldPosition(
                                draftWire.startPin.split('_pin_')[0],
                                draftWire.startPin,
                                components
                            );

                            const endWorldPos = getPinWorldPosition(
                                id.split('_pin_')[0],
                                id,
                                components
                            );

                            if (startWorldPos && endWorldPos) {
                                addWire({
                                    startPoint: startWorldPos,
                                    endPoint: endWorldPos,
                                    startPinId: draftWire.startPin,
                                    endPinId: id,
                                    color: '#00ff00'
                                });
                            }

                            setDraftWire(null);
                            setWiring(false);
                        }
                    }
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    setHoveredPin(id);
                }}
                onPointerOut={(e) => {
                    setHovered(false);
                    setHoveredPin(null);
                }}
            >
                <sphereGeometry args={[radius * 2, 8, 8]} />
                <meshBasicMaterial color="transparent" transparent opacity={0.1} />
            </mesh>

            {/* Visual Indicator (Highlight) */}
            {(hovered || (draftWire?.startPin === id)) && (
                <mesh>
                    <sphereGeometry args={[radius, 16, 16]} />
                    <meshBasicMaterial color={color} />
                </mesh>
            )}

            {/* Tooltip */}
            {hovered && (
                <Html position={[0, radius * 2, 0]} center pointerEvents="none">
                    <div className="bg-black/80 text-white text-[10px] px-1 rounded whitespace-nowrap">
                        {id}
                    </div>
                </Html>
            )}
        </group>
    );
}
