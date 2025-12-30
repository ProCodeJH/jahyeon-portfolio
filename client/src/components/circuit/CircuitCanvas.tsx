/**
 * Tinkercad-style Circuit Canvas
 * Central workspace for building circuits with drag-and-drop
 */

import { useRef, useState } from 'react';
import { useCircuitStore } from '@/lib/circuit-store';
import { ComponentType, COMPONENT_LIBRARY } from '@/lib/circuit-types';
import { ComponentRenderer } from './ComponentRenderer';
import { WireRenderer } from './WireRenderer';
import { ZoomIn, ZoomOut, Maximize2, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CircuitCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { components = [], wires = [], addComponent, selectedComponentId, selectComponent } = useCircuitStore();
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const componentType = e.dataTransfer.getData('componentType') as ComponentType;
    if (!componentType) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate drop position relative to canvas with zoom and pan
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    addComponent(componentType, x, y);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Start panning with middle mouse or space + left click
    if (e.button === 1 || (e.button === 0 && e.spaceKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    } else if (e.button === 0) {
      // Deselect component if clicking on empty canvas
      selectComponent(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative h-full bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      {/* Canvas Controls */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="bg-white shadow-lg"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="bg-white shadow-lg"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetView}
          className="bg-white shadow-lg"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
          className={`bg-white shadow-lg ${showGrid ? 'bg-blue-50 border-blue-300' : ''}`}
        >
          <Grid className="w-4 h-4" />
        </Button>
        <div className="px-3 py-1.5 bg-white shadow-lg rounded-md border border-gray-200 text-sm font-medium">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Empty State Help */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎨</div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-700">
                Start Building Your Circuit
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                Drag components from the right panel onto this canvas to begin
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-6">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-mono">+</span>
                <span>Zoom In/Out</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-mono">⊞</span>
                <span>Toggle Grid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center">↕</span>
                <span>Pan (Middle Click)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div
        ref={canvasRef}
        className={`h-full ${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Grid Pattern */}
          {showGrid && (
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="10" cy="10" r="0.5" fill="#CBD5E1" />
              </pattern>
            </defs>
          )}

          {showGrid && (
            <rect
              x="-5000"
              y="-5000"
              width="10000"
              height="10000"
              fill="url(#grid)"
            />
          )}

          {/* Render Wires */}
          <g className="wires">
            {wires.map((wire) => (
              <WireRenderer key={wire.id} wire={wire} />
            ))}
          </g>

          {/* Render Components */}
          <g className="components">
            {components.map((component) => (
              <ComponentRenderer
                key={component.id}
                component={component}
                isSelected={component.id === selectedComponentId}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Canvas Info */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 shadow-lg">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div>
            <span className="font-semibold">{components.length}</span> Components
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <div>
            <span className="font-semibold">{wires.length}</span> Connections
          </div>
        </div>
      </div>
    </div>
  );
}
