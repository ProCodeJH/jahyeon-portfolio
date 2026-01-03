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
  { id: 'microcontrollers', name: '마이크로컨트롤러', icon: <Cpu className="w-4 h-4" /> },
  { id: 'basics', name: '기본 부품', icon: <CircuitBoard className="w-4 h-4" /> },
  { id: 'output', name: '출력', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'input', name: '입력', icon: <ToggleLeft className="w-4 h-4" /> },
  { id: 'power', name: '전원', icon: <Zap className="w-4 h-4" /> },
  { id: 'sensors', name: '센서', icon: <Gauge className="w-4 h-4" /> },
];

const COMPONENTS: ComponentDef[] = [
  {
    id: 'arduino_uno',
    name: '아두이노 UNO',
    description: 'ATmega328P 마이크로컨트롤러 보드',
    category: 'microcontrollers',
    icon: <Cpu className="w-5 h-5 text-teal-400" />,
    pinCount: 28,
    tags: ['아두이노', 'arduino', 'atmega'],
  },
  {
    id: 'breadboard',
    name: '브레드보드',
    description: '풀사이즈 솔더리스 브레드보드',
    category: 'basics',
    icon: <CircuitBoard className="w-5 h-5 text-gray-400" />,
    pinCount: 830,
    tags: ['브레드보드', 'breadboard'],
  },
  {
    id: 'led',
    name: 'LED',
    description: '5mm 발광 다이오드',
    category: 'output',
    icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
    pinCount: 2,
    tags: ['led', '발광', '표시'],
  },
  {
    id: 'led_rgb',
    name: 'RGB LED',
    description: '공통 캐소드 RGB LED',
    category: 'output',
    icon: <Lightbulb className="w-5 h-5 text-purple-400" />,
    pinCount: 4,
    tags: ['led', 'rgb', '색상'],
  },
  {
    id: 'resistor',
    name: '저항',
    description: '1/4W 스루홀 저항',
    category: 'basics',
    icon: <Zap className="w-5 h-5 text-orange-400" />,
    pinCount: 2,
    tags: ['저항', 'resistor', '수동'],
  },
  {
    id: 'button',
    name: '푸시 버튼',
    description: '순간 택트 스위치',
    category: 'input',
    icon: <ToggleLeft className="w-5 h-5 text-blue-400" />,
    pinCount: 4,
    tags: ['버튼', 'button', '스위치'],
  },
  {
    id: 'potentiometer',
    name: '가변저항',
    description: '10kΩ 회전식 가변저항',
    category: 'input',
    icon: <Disc className="w-5 h-5 text-green-400" />,
    pinCount: 3,
    tags: ['가변저항', 'potentiometer', '아날로그'],
  },
  {
    id: 'buzzer',
    name: '피에조 버저',
    description: '능동형 피에조 버저',
    category: 'output',
    icon: <Speaker className="w-5 h-5 text-pink-400" />,
    pinCount: 2,
    tags: ['버저', 'buzzer', '소리'],
  },
  {
    id: 'lcd',
    name: 'LCD 디스플레이',
    description: '16x2 문자 LCD',
    category: 'output',
    icon: <Monitor className="w-5 h-5 text-cyan-400" />,
    pinCount: 16,
    tags: ['lcd', '디스플레이', '화면'],
  },
  {
    id: 'capacitor',
    name: '커패시터',
    description: '세라믹 커패시터',
    category: 'basics',
    icon: <Zap className="w-5 h-5 text-indigo-400" />,
    pinCount: 2,
    tags: ['커패시터', 'capacitor', '수동'],
  },
  {
    id: 'photoresistor',
    name: '광센서 (LDR)',
    description: '조도 감지 저항',
    category: 'sensors',
    icon: <Gauge className="w-5 h-5 text-amber-400" />,
    pinCount: 2,
    tags: ['광센서', 'ldr', '조도', '센서'],
  },
  {
    id: 'temperature',
    name: '온도 센서',
    description: 'TMP36 온도 센서',
    category: 'sensors',
    icon: <Gauge className="w-5 h-5 text-red-400" />,
    pinCount: 3,
    tags: ['온도', 'temperature', '센서'],
  },
  {
    id: 'ultrasonic',
    name: '초음파 센서',
    description: 'HC-SR04 거리 센서',
    category: 'sensors',
    icon: <Gauge className="w-5 h-5 text-blue-400" />,
    pinCount: 4,
    tags: ['초음파', 'ultrasonic', '거리', '센서'],
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
        <h3 className="text-sm font-semibold text-gray-200 mb-2">부품 라이브러리</h3>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="부품 검색..."
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
          <span>{COMPONENTS.length}개 부품</span>
          <span className="text-blue-400">클릭하여 추가</span>
        </div>
      </div>
    </div>
  );
}
