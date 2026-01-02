'use client';

import React, { useState } from 'react';
import {
  Cpu,
  CircuitBoard,
  Lightbulb,
  ToggleLeft,
  Gauge,
  Thermometer,
  Speaker,
  Mic,
  Wifi,
  Search,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useCircuitStore } from '@/store/circuitStore';
import {
  createArduinoUno,
  createBreadboard,
  createLed,
  createResistor,
  createButton,
  ComponentType,
} from '@circuit-lab/sim-core';
import { cn } from '@/lib/utils';

interface ComponentCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  items: ComponentItem[];
}

interface ComponentItem {
  type: ComponentType;
  name: string;
  icon: React.ElementType;
  description: string;
}

const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    id: 'boards',
    name: 'Boards',
    icon: Cpu,
    items: [
      {
        type: ComponentType.ARDUINO_UNO,
        name: 'Arduino UNO',
        icon: Cpu,
        description: 'ATmega328P microcontroller',
      },
      {
        type: ComponentType.BREADBOARD,
        name: 'Breadboard',
        icon: CircuitBoard,
        description: 'Full-size 830 tie points',
      },
    ],
  },
  {
    id: 'basic',
    name: 'Basic Components',
    icon: Lightbulb,
    items: [
      {
        type: ComponentType.LED,
        name: 'LED',
        icon: Lightbulb,
        description: '5mm LED (various colors)',
      },
      {
        type: ComponentType.RGB_LED,
        name: 'RGB LED',
        icon: Lightbulb,
        description: 'Common cathode RGB LED',
      },
      {
        type: ComponentType.RESISTOR,
        name: 'Resistor',
        icon: Gauge,
        description: '1/4W resistor (various values)',
      },
      {
        type: ComponentType.BUTTON,
        name: 'Push Button',
        icon: ToggleLeft,
        description: '6mm tactile switch',
      },
      {
        type: ComponentType.POTENTIOMETER,
        name: 'Potentiometer',
        icon: Gauge,
        description: '10kΩ rotary potentiometer',
      },
      {
        type: ComponentType.CAPACITOR,
        name: 'Capacitor',
        icon: Gauge,
        description: 'Electrolytic capacitor',
      },
    ],
  },
  {
    id: 'sensors',
    name: 'Sensors',
    icon: Thermometer,
    items: [
      {
        type: ComponentType.PHOTORESISTOR,
        name: 'Photoresistor',
        icon: Lightbulb,
        description: 'Light-dependent resistor',
      },
      {
        type: ComponentType.PIR_SENSOR,
        name: 'PIR Sensor',
        icon: Wifi,
        description: 'Motion detection sensor',
      },
    ],
  },
  {
    id: 'actuators',
    name: 'Actuators',
    icon: Speaker,
    items: [
      {
        type: ComponentType.SERVO,
        name: 'Servo Motor',
        icon: Gauge,
        description: 'SG90 micro servo',
      },
      {
        type: ComponentType.DC_MOTOR,
        name: 'DC Motor',
        icon: Gauge,
        description: 'Small DC motor',
      },
      {
        type: ComponentType.BUZZER,
        name: 'Buzzer',
        icon: Speaker,
        description: 'Piezo buzzer',
      },
    ],
  },
];

export function ComponentPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'boards',
    'basic',
  ]);
  const addComponent = useCircuitStore((state) => state.addComponent);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddComponent = (type: ComponentType) => {
    const id = `${type}_${Date.now()}`;
    const position = { x: 50, y: 30, z: 0 };

    let component;
    switch (type) {
      case ComponentType.ARDUINO_UNO:
        component = createArduinoUno(id, position);
        break;
      case ComponentType.BREADBOARD:
        component = createBreadboard(
          id,
          { type: 'full', hasTopRails: true, hasBottomRails: true },
          { x: 100, y: 30, z: 0 }
        );
        break;
      case ComponentType.LED:
        component = createLed(id, 'red', '5mm', position);
        break;
      case ComponentType.RESISTOR:
        component = createResistor(id, 220, 5, '1/4W', position);
        break;
      case ComponentType.BUTTON:
        component = createButton(id, '6mm', 'black', position);
        break;
      default:
        return;
    }

    if (component) {
      addComponent(component);
    }
  };

  const filteredCategories = COMPONENT_CATEGORIES.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0);

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg mb-3">Components</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCategories.map((category) => (
          <div key={category.id} className="mb-2">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
              onClick={() => toggleCategory(category.id)}
            >
              {expandedCategories.includes(category.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <category.icon className="w-4 h-4" />
              {category.name}
              <span className="ml-auto text-xs text-muted-foreground">
                {category.items.length}
              </span>
            </button>

            {expandedCategories.includes(category.id) && (
              <div className="mt-1 space-y-1 pl-2">
                {category.items.map((item) => (
                  <div
                    key={item.type}
                    className="component-item"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('componentType', item.type);
                    }}
                    onClick={() => handleAddComponent(item.type)}
                  >
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Wire Colors */}
      <div className="p-4 border-t border-border">
        <h3 className="text-sm font-medium mb-2">Wire Color</h3>
        <div className="flex gap-2 flex-wrap">
          {['red', 'black', 'yellow', 'green', 'blue', 'orange', 'white'].map(
            (color) => (
              <button
                key={color}
                className={cn(
                  'w-6 h-6 rounded-full border-2 transition-all',
                  useCircuitStore.getState().ui.wireColor === color
                    ? 'border-white scale-110'
                    : 'border-transparent hover:scale-105'
                )}
                style={{ backgroundColor: color === 'white' ? '#eee' : color }}
                onClick={() => useCircuitStore.getState().setWireColor(color)}
                title={color}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
