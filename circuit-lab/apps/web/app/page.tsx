'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useCircuitStore } from '@/store/circuitStore';
import { Toolbar } from '@/components/Toolbar';
import { ComponentPanel } from '@/components/ComponentPanel';
import { CodeEditor } from '@/components/CodeEditor';
import { SerialMonitor } from '@/components/SerialMonitor';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

// Dynamic import for 3D scene (no SSR)
const CircuitCanvas = dynamic(() => import('@/components/CircuitCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-arduino-dark">
      <div className="text-muted-foreground">Loading 3D Scene...</div>
    </div>
  ),
});

export default function HomePage() {
  const { ui, setPanelSize } = useCircuitStore();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel wiring or deselect
      if (e.key === 'Escape') {
        useCircuitStore.getState().cancelWiring();
        useCircuitStore.getState().selectComponent(null);
        useCircuitStore.getState().selectWire(null);
      }

      // Delete selected component/wire
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const state = useCircuitStore.getState();
        if (state.ui.selectedComponentId) {
          state.removeComponent(state.ui.selectedComponentId);
        }
        if (state.ui.selectedWireId) {
          state.removeWire(state.ui.selectedWireId);
        }
      }

      // Ctrl+Z for undo
      if (e.ctrlKey && e.key === 'z') {
        useCircuitStore.getState().undo();
      }

      // Ctrl+Y for redo
      if (e.ctrlKey && e.key === 'y') {
        useCircuitStore.getState().redo();
      }

      // Ctrl+S for save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        // Save project
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-arduino-dark">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Component Library */}
          <ResizablePanel
            defaultSize={15}
            minSize={10}
            maxSize={25}
            onResize={(size) => setPanelSize('left', size * 10)}
          >
            <ComponentPanel />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center Panel - 3D Scene + Serial */}
          <ResizablePanel defaultSize={55}>
            <ResizablePanelGroup direction="vertical">
              {/* 3D Canvas */}
              <ResizablePanel defaultSize={70} minSize={40}>
                <CircuitCanvas />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Bottom Panel - Serial Monitor */}
              <ResizablePanel
                defaultSize={30}
                minSize={15}
                maxSize={50}
                onResize={(size) => setPanelSize('bottom', size * 10)}
              >
                <SerialMonitor />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Code Editor + Properties */}
          <ResizablePanel
            defaultSize={30}
            minSize={20}
            maxSize={50}
            onResize={(size) => setPanelSize('right', size * 10)}
          >
            <ResizablePanelGroup direction="vertical">
              {/* Code Editor */}
              <ResizablePanel defaultSize={70} minSize={30}>
                <CodeEditor />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Properties Panel */}
              <ResizablePanel defaultSize={30} minSize={20}>
                <PropertiesPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
