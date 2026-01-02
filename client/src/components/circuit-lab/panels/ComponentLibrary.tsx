/**
 * Component Library Panel
 * Drag-and-drop component palette
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Cpu,
  CircuitBoard,
  Lightbulb,
  Zap,
  ToggleLeft,
  Gauge,
  Speaker,
  Monitor,
  Disc,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface ComponentDef {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  pinCount: number;
  tags: string[];
}

interface ComponentLibraryProps {
  onAddComponent?: (componentType: string) => void;
}

const COMPONENT_CATEGORIES = [
  { id: 'microcontrollers', name: 'Microcontrollers', icon: <Cpu className="w-4 h-4" /> },
  { id: 'basics', name: 'Basic Components', icon: <CircuitBoard className="w-4 h-4" /> },
  { id: 'output', name: 'Output', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'input', name: 'Input', icon: <ToggleLeft className="w-4 h-4" /> },
  { id: 'power', name: 'Power', icon: <Zap className="w-4 h-4" /> },
  { id: 'sensors', name: 'Sensors', icon: <Gauge className="w-4 h-4" /> },
];

const COMPONENTS: ComponentDef[] = [
  {
    id: 'arduino_uno',
    name: 'Arduino UNO',
    description: 'ATmega328P microcontroller board',
    category: 'microcontrollers',
    icon: <Cpu className="w-5 h-5 text-teal-400" />,
    pinCount: 28,
    tags: ['arduino', 'atmega', 'microcontroller'],
  },
  {
    id: 'breadboard',
    name: 'Breadboard',
    description: 'Full-size solderless breadboard',
    category: 'basics',
    icon: <CircuitBoard className="w-5 h-5 text-gray-400" />,
    pinCount: 830,
    tags: ['breadboard', 'prototyping'],
  },
  {
    id: 'led',
    name: 'LED',
    description: '5mm Light Emitting Diode',
    category: 'output',
    icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
    pinCount: 2,
    tags: ['led', 'light', 'indicator'],
  },
  {
    id: 'led_rgb',
    name: 'RGB LED',
    description: 'Common cathode RGB LED',
    category: 'output',
    icon: <Lightbulb className="w-5 h-5 text-purple-400" />,
    pinCount: 4,
    tags: ['led', 'rgb', 'color'],
  },
  {
    id: 'resistor',
    name: 'Resistor',
    description: '1/4W through-hole resistor',
    category: 'basics',
    icon: <Zap className="w-5 h-5 text-orange-400" />,
    pinCount: 2,
    tags: ['resistor', 'passive'],
  },
  {
    id: 'button',
    name: 'Push Button',
    description: 'Momentary tactile switch',
    category: 'input',
    icon: <ToggleLeft className="w-5 h-5 text-blue-400" />,
    pinCount: 4,
    tags: ['button', 'switch', 'input'],
  },
  {
    id: 'potentiometer',
    name: 'Potentiometer',
    description: '10kΩ rotary potentiometer',
    category: 'input',
    icon: <Disc className="w-5 h-5 text-green-400" />,
    pinCount: 3,
    tags: ['potentiometer', 'analog', 'input'],
  },
  {
    id: 'buzzer',
    name: 'Piezo Buzzer',
    description: 'Active piezo buzzer',
    category: 'output',
    icon: <Speaker className="w-5 h-5 text-pink-400" />,
    pinCount: 2,
    tags: ['buzzer', 'sound', 'audio'],
  },
  {
    id: 'lcd',
    name: 'LCD Display',
    description: '16x2 character LCD',
    category: 'output',
    icon: <Monitor className="w-5 h-5 text-cyan-400" />,
    pinCount: 16,
    tags: ['lcd', 'display', 'screen'],
  },
  {
    id: 'capacitor',
    name: 'Capacitor',
    description: 'Ceramic capacitor',
    category: 'basics',
    icon: <Zap className="w-5 h-5 text-indigo-400" />,
    pinCount: 2,
    tags: ['capacitor', 'passive'],
  },
  {
    id: 'photoresistor',
    name: 'Photoresistor',
    description: 'Light-dependent resistor (LDR)',
    category: 'sensors',
    icon: <Gauge className="w-5 h-5 text-amber-400" />,
    pinCount: 2,
    tags: ['photoresistor', 'ldr', 'light', 'sensor'],
  },
  {
    id: 'temperature',
    name: 'Temperature Sensor',
    description: 'TMP36 temperature sensor',
    category: 'sensors',
    icon: <Gauge className="w-5 h-5 text-red-400" />,
    pinCount: 3,
    tags: ['temperature', 'sensor', 'tmp36'],
  },
];

export function ComponentLibrary({ onAddComponent }: ComponentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['microcontrollers', 'basics', 'output'])
  );
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const filteredComponents = COMPONENTS.filter(comp => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      comp.name.toLowerCase().includes(query) ||
      comp.description.toLowerCase().includes(query) ||
      comp.tags.some(tag => tag.includes(query))
    );
  });

  const componentsByCategory = COMPONENT_CATEGORIES.map(cat => ({
    ...cat,
    components: filteredComponents.filter(comp => comp.category === cat.id),
  })).filter(cat => cat.components.length > 0);

  return (
    <div className="flex flex-col h-full bg-[#252526]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#3c3c3c]">
        <h3 className="text-sm font-semibold text-gray-200 mb-2">Components</h3>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components..."
            className="h-8 pl-8 bg-[#3c3c3c] border-none text-sm text-gray-200 placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Component list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {componentsByCategory.map(category => (
            <div key={category.id}>
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-[#2a2a2a] rounded transition-colors"
              >
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                {category.icon}
                <span className="flex-1 text-left font-medium">{category.name}</span>
                <Badge variant="secondary" className="h-5 text-[10px] bg-[#3c3c3c] text-gray-400">
                  {category.components.length}
                </Badge>
              </button>

              {/* Components */}
              {expandedCategories.has(category.id) && (
                <div className="ml-4 mt-1 space-y-1">
                  {category.components.map(comp => (
                    <div
                      key={comp.id}
                      onMouseEnter={() => setHoveredComponent(comp.id)}
                      onMouseLeave={() => setHoveredComponent(null)}
                      className="group relative flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#323232] rounded-lg cursor-pointer transition-all"
                      onClick={() => onAddComponent?.(comp.id)}
                    >
                      <div className="flex-shrink-0">{comp.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-200">{comp.name}</div>
                        <div className="text-xs text-gray-500 truncate">{comp.description}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddComponent?.(comp.id);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>

                      {/* Tooltip */}
                      {hoveredComponent === comp.id && (
                        <div className="absolute left-full ml-2 top-0 z-50 w-48 p-3 bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg shadow-xl">
                          <div className="flex items-center gap-2 mb-2">
                            {comp.icon}
                            <span className="font-semibold text-gray-200">{comp.name}</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{comp.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{comp.pinCount} pins</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {comp.tags.map(tag => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="h-4 text-[9px] bg-[#3c3c3c] text-gray-400"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[#3c3c3c] text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>{COMPONENTS.length} components</span>
          <span className="text-blue-400">Drag to add</span>
        </div>
      </div>
    </div>
  );
}
