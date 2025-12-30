/**
 * Tinkercad-style Component Library Panel
 * Right sidebar with drag-and-drop components
 */

import { useState } from 'react';
import { COMPONENT_LIBRARY, ComponentType } from '@/lib/circuit-types';
import { useCircuitStore } from '@/lib/circuit-store';
import { Search, Grid3x3, Cpu, Zap, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Grid3x3 },
  { id: 'controller', name: 'Controllers', icon: Cpu },
  { id: 'basic', name: 'Basic', icon: Zap },
  { id: 'input', name: 'Input', icon: '🔘' },
  { id: 'output', name: 'Output', icon: '💡' },
  { id: 'sensor', name: 'Sensors', icon: Thermometer },
] as const;

export function ComponentLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredComponents = COMPONENT_LIBRARY.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, componentType: ComponentType) => {
    e.dataTransfer.setData('componentType', componentType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Components</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-2 py-3 border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1">
          {CATEGORIES.map((category) => {
            const Icon = typeof category.icon === 'string' ? null : category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  isSelected
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {Icon ? (
                  <Icon className="w-3.5 h-3.5" />
                ) : (
                  <span>{category.icon}</span>
                )}
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Component Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          {filteredComponents.map((component) => (
            <div
              key={component.type}
              draggable
              onDragStart={(e) => handleDragStart(e, component.type)}
              className="group relative bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-4 cursor-move hover:border-blue-400 hover:shadow-lg transition-all duration-200"
            >
              {/* Icon */}
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {component.icon}
              </div>

              {/* Name */}
              <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                {component.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-600 line-clamp-2">
                {component.description}
              </p>

              {/* Category Badge */}
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 bg-white/80 backdrop-blur-sm border border-gray-200 text-[10px] font-bold text-gray-600 rounded-full">
                  {component.category}
                </span>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredComponents.length === 0 && (
          <div className="text-center py-12">
            <Grid3x3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No components found</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Footer Tip */}
      <div className="p-3 border-t border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-start gap-2 text-xs text-gray-700">
          <span className="text-lg shrink-0">💡</span>
          <div>
            <p className="font-semibold mb-0.5">Drag & Drop</p>
            <p className="text-gray-600">Drag components to the canvas to add them to your circuit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
