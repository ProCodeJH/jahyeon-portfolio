
import { useRef } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { useCircuitStore } from '../store';
import * as THREE from 'three';

const SNAP_UNIT = 0.01; // Snap to 1cm

export function InteractionManager() {
    const {
        isDragging,
        selectedId,
        updateComponentPosition,
        setDragging,
        draftWire,
        setDraftWire,
        isWiring
    } = useCircuitStore();

    const { camera } = useThree();
    const planeRef = useRef<THREE.Mesh>(null);

    const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
        // Prevent event from bubbling to other objects if we are handling it
        e.stopPropagation();

        const point = e.point;

        // Handle Component Dragging
        if (isDragging && selectedId && !isWiring) {
            // Snap to grid
            const x = Math.round(point.x / SNAP_UNIT) * SNAP_UNIT;
            const z = Math.round(point.z / SNAP_UNIT) * SNAP_UNIT;

            updateComponentPosition(selectedId, [x, 0, z]);
        }

        // Handle Wiring (Ghost Wire)
        if (isWiring && draftWire) {
            setDraftWire({
                ...draftWire,
                endPosition: [point.x, point.y, point.z]
            });
        }
    };

    const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();

        if (isDragging) {
            setDragging(false);
        }
    };

    return (
        <mesh
            ref={planeRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.001, 0]} // Just below the grid
            visible={false} // Invisible plane for raycasting
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="pink" transparent opacity={0.5} />
        </mesh>
    );
}
