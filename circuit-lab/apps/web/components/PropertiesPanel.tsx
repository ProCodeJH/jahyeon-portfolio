'use client';

import React from 'react';
import { useCircuitStore } from '@/store/circuitStore';
import { Settings, Trash2, Copy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatResistance } from '@circuit-lab/sim-core';

export function PropertiesPanel() {
  const { components, wires, ui, updateComponent, removeComponent, removeWire } =
    useCircuitStore();

  const selectedComponent = ui.selectedComponentId
    ? components.find((c) => c.id === ui.selectedComponentId)
    : null;

  const selectedWire = ui.selectedWireId
    ? wires.find((w) => w.id === ui.selectedWireId)
    : null;

  if (!selectedComponent && !selectedWire) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-card border-t border-border p-4">
        <Settings className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          Select a component or wire to view properties
        </p>
      </div>
    );
  }

  if (selectedWire) {
    return (
      <div className="h-full flex flex-col bg-card border-t border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Wire Properties</h3>
            <button
              className="p-1.5 rounded hover:bg-destructive/20 text-destructive"
              onClick={() => removeWire(selectedWire.id)}
              title="Delete wire"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <PropertyRow label="ID" value={selectedWire.id} />
          <PropertyRow label="Net" value={selectedWire.netId} />
          <PropertyRow label="Start" value={selectedWire.startPinId} />
          <PropertyRow label="End" value={selectedWire.endPinId} />

          <div>
            <label className="text-xs text-muted-foreground block mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {['red', 'black', 'yellow', 'green', 'blue', 'orange', 'white'].map(
                (color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-all',
                      selectedWire.color === color
                        ? 'border-white scale-110'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{
                      backgroundColor: color === 'white' ? '#eee' : color,
                    }}
                    onClick={() =>
                      useCircuitStore
                        .getState()
                        .updateWire(selectedWire.id, { color })
                    }
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedComponent) {
    return (
      <div className="h-full flex flex-col bg-card border-t border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{selectedComponent.name}</h3>
              <p className="text-xs text-muted-foreground">
                {selectedComponent.type}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded hover:bg-secondary"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded hover:bg-secondary"
                title="Reset rotation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded hover:bg-destructive/20 text-destructive"
                onClick={() => removeComponent(selectedComponent.id)}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Position */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2">
              Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">X</label>
                <input
                  type="number"
                  value={selectedComponent.transform.position.x.toFixed(1)}
                  onChange={(e) =>
                    updateComponent(selectedComponent.id, {
                      transform: {
                        ...selectedComponent.transform,
                        position: {
                          ...selectedComponent.transform.position,
                          x: parseFloat(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="w-full px-2 py-1 bg-secondary rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Y</label>
                <input
                  type="number"
                  value={selectedComponent.transform.position.y.toFixed(1)}
                  onChange={(e) =>
                    updateComponent(selectedComponent.id, {
                      transform: {
                        ...selectedComponent.transform,
                        position: {
                          ...selectedComponent.transform.position,
                          y: parseFloat(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="w-full px-2 py-1 bg-secondary rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Z</label>
                <input
                  type="number"
                  value={selectedComponent.transform.position.z.toFixed(1)}
                  onChange={(e) =>
                    updateComponent(selectedComponent.id, {
                      transform: {
                        ...selectedComponent.transform,
                        position: {
                          ...selectedComponent.transform.position,
                          z: parseFloat(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="w-full px-2 py-1 bg-secondary rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Component-specific properties */}
          {selectedComponent.type === 'resistor' && (
            <div>
              <label className="text-xs text-muted-foreground block mb-2">
                Resistance
              </label>
              <select
                value={selectedComponent.properties.resistance as number}
                onChange={(e) =>
                  updateComponent(selectedComponent.id, {
                    properties: {
                      ...selectedComponent.properties,
                      resistance: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-2 py-1.5 bg-secondary rounded text-sm"
              >
                {[
                  100, 220, 330, 470, 1000, 2200, 4700, 10000, 47000, 100000,
                ].map((value) => (
                  <option key={value} value={value}>
                    {formatResistance(value)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedComponent.type === 'led' && (
            <div>
              <label className="text-xs text-muted-foreground block mb-2">
                LED Color
              </label>
              <select
                value={selectedComponent.properties.color as string}
                onChange={(e) =>
                  updateComponent(selectedComponent.id, {
                    properties: {
                      ...selectedComponent.properties,
                      color: e.target.value,
                    },
                  })
                }
                className="w-full px-2 py-1.5 bg-secondary rounded text-sm"
              >
                {['red', 'green', 'blue', 'yellow', 'orange', 'white'].map(
                  (color) => (
                    <option key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {/* Pin list */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2">
              Pins ({selectedComponent.pins.length})
            </label>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {selectedComponent.pins.slice(0, 10).map((pin) => (
                <div
                  key={pin.id}
                  className="flex items-center justify-between px-2 py-1 bg-secondary/50 rounded text-xs"
                >
                  <span>{pin.name}</span>
                  <span className="text-muted-foreground">
                    {pin.voltage.toFixed(1)}V
                  </span>
                </div>
              ))}
              {selectedComponent.pins.length > 10 && (
                <div className="text-xs text-muted-foreground text-center py-1">
                  +{selectedComponent.pins.length - 10} more pins
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-mono">{value}</span>
    </div>
  );
}
