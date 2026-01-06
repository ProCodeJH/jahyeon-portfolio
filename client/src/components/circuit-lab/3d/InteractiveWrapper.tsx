
import { ReactNode } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { useCircuitStore } from '../store';

interface InteractiveWrapperProps {
    id: string;
    children: ReactNode;
}

export function InteractiveWrapper({ id, children }: InteractiveWrapperProps) {
    const { setSelectedId, setDragging, isWiring, setHoveredPin } = useCircuitStore();

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        // Only drag with left click
        if (e.button !== 0) return;

        e.stopPropagation();

        // If we are wiring, do not drag components
        if (isWiring) {
            // Wiring logic is handled by Pin Hitboxes (to be implemented)
            return;
        }

        // Start Dragging
        setSelectedId(id);
        setDragging(true);

        // Capture pointer to ensure we receive pointer up events ? 
        // Actually InteractionManager handles pointer move/up globally.
        // We just need to signal "Start Dragging this ID".
        (e.target as Element).setPointerCapture?.(e.pointerId);
    };

    const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        document.body.style.cursor = isWiring ? 'crosshair' : 'move';
    };

    const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
    };

    return (
        <group
            onPointerDown={handlePointerDown}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            {children}
        </group>
    );
}
