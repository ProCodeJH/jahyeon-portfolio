/**
 * CAD-Grade Circuit Lab
 * Tinkercad-Style Web-Based Circuit Simulator
 *
 * ARCHITECTURE RULES:
 * - OrthographicCamera ONLY
 * - InstancedMesh per component TYPE
 * - Data-first: Components are DATA, not Meshes
 * - NO postprocessing (bloom, SSAO, outline forbidden)
 * - Grid-based movement with 90° rotation
 */

import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Link } from 'wouter';
import Editor from '@monaco-editor/react';

import { useCircuitLabStore, ComponentType, GRID_UNIT } from '@/store/circuitLabStore';
import { InstancedComponentsRenderer } from './InstancedComponents';
import { CADCamera, CADGrid, PlacementPreview, SnapIndicator } from './CADCamera';
import { WireRenderer, WIRE_COLORS } from './WireRenderer';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Cpu,
  Code2,
  Terminal,
  Home,
  Layers,
  Zap,
  Plus,
  Trash2,
  RotateCw,
  MousePointer,
  Cable,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Move,
  Tag,
} from 'lucide-react';
import { useState } from 'react';

// ============================================
// COMPONENT LIBRARY
// ============================================

const COMPONENT_LIBRARY: {
  category: string;
  categoryKo: string;
  icon: any;
  items: {
    type: ComponentType;
    name: string;
    nameKo: string;
    description: string;
  }[];
}[] = [
  {
    category: 'Microcontrollers',
    categoryKo: '마이크로컨트롤러',
    icon: Cpu,
    items: [
      { type: 'arduino_uno', name: 'Arduino Uno R3', nameKo: '아두이노 우노 R3', description: 'ATmega328P 마이크로컨트롤러' },
    ],
  },
  {
    category: 'Connectors',
    categoryKo: '연결부품',
    icon: Layers,
    items: [
      { type: 'breadboard_half', name: 'Breadboard (Half)', nameKo: '브레드보드 (하프)', description: '400핀 브레드보드' },
      { type: 'breadboard_mini', name: 'Breadboard (Mini)', nameKo: '브레드보드 (미니)', description: '170핀 미니 브레드보드' },
    ],
  },
  {
    category: 'Output',
    categoryKo: '출력',
    icon: Zap,
    items: [
      { type: 'led_red', name: 'LED (Red)', nameKo: 'LED (빨강)', description: '5mm 빨간색 LED' },
      { type: 'led_green', name: 'LED (Green)', nameKo: 'LED (초록)', description: '5mm 초록색 LED' },
      { type: 'led_blue', name: 'LED (Blue)', nameKo: 'LED (파랑)', description: '5mm 파란색 LED' },
      { type: 'led_yellow', name: 'LED (Yellow)', nameKo: 'LED (노랑)', description: '5mm 노란색 LED' },
      { type: 'buzzer', name: 'Buzzer', nameKo: '버저', description: '피에조 버저' },
      { type: 'servo', name: 'Servo Motor', nameKo: '서보 모터', description: 'SG90 마이크로 서보' },
    ],
  },
  {
    category: 'Input',
    categoryKo: '입력',
    icon: MousePointer,
    items: [
      { type: 'button', name: 'Push Button', nameKo: '푸시 버튼', description: '택트 스위치' },
      { type: 'potentiometer', name: 'Potentiometer', nameKo: '가변저항', description: '10kΩ 가변저항' },
      { type: 'ultrasonic', name: 'Ultrasonic', nameKo: '초음파 센서', description: 'HC-SR04 거리 센서' },
      { type: 'dht22', name: 'DHT22', nameKo: 'DHT22 센서', description: '온습도 센서' },
      { type: 'photoresistor', name: 'Photoresistor', nameKo: '조도 센서', description: 'CdS 광저항' },
    ],
  },
  {
    category: 'Passive',
    categoryKo: '수동부품',
    icon: Cable,
    items: [
      { type: 'resistor', name: 'Resistor', nameKo: '저항', description: '1/4W 탄소피막 저항' },
      { type: 'capacitor', name: 'Capacitor', nameKo: '캐패시터', description: '세라믹 캐패시터' },
      { type: 'diode', name: 'Diode', nameKo: '다이오드', description: '1N4148 신호용 다이오드' },
    ],
  },
];

// ============================================
// INTERACTION HANDLER (Raycasting for selection)
// ============================================

function InteractionHandler() {
  const { camera, raycaster, pointer, scene } = useThree();
  const view = useCircuitLabStore(state => state.view);
  const components = useCircuitLabStore(state => state.getComponentsArray());
  const addComponent = useCircuitLabStore(state => state.addComponent);
  const selectComponent = useCircuitLabStore(state => state.selectComponent);
  const deselectAll = useCircuitLabStore(state => state.deselectAll);
  const setHovered = useCircuitLabStore(state => state.setHovered);
  const updatePlacementPreview = useCircuitLabStore(state => state.updatePlacementPreview);
  const setPlacementType = useCircuitLabStore(state => state.setPlacementType);

  // Convert pointer to grid coordinates
  const pointerToGrid = useCallback((pointer: THREE.Vector2): { gridX: number; gridZ: number } | null => {
    raycaster.setFromCamera(pointer, camera);

    // Create a horizontal plane at y=0
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(plane, intersection)) {
      const gridX = Math.round(intersection.x / GRID_UNIT);
      const gridZ = Math.round(intersection.z / GRID_UNIT);
      return { gridX, gridZ };
    }

    return null;
  }, [camera, raycaster]);

  // Handle pointer move for preview
  useEffect(() => {
    const handlePointerMove = () => {
      if (view.toolMode === 'place' && view.placementType) {
        const gridPos = pointerToGrid(pointer);
        if (gridPos) {
          updatePlacementPreview(gridPos.gridX, gridPos.gridZ);
        }
      }
    };

    // Poll for pointer position (simpler than event listeners for R3F)
    const interval = setInterval(handlePointerMove, 16);
    return () => clearInterval(interval);
  }, [view.toolMode, view.placementType, pointerToGrid, pointer, updatePlacementPreview]);

  // Handle click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0) return; // Left click only

      const gridPos = pointerToGrid(pointer);
      if (!gridPos) return;

      if (view.toolMode === 'place' && view.placementType) {
        // Place component
        addComponent(view.placementType, gridPos.gridX, gridPos.gridZ);
        // Keep placement mode active for multiple placements
      } else if (view.toolMode === 'select') {
        // Find component at grid position
        const component = components.find(c =>
          c.gridX === gridPos.gridX && c.gridZ === gridPos.gridZ
        );

        if (component) {
          selectComponent(component.id, e.shiftKey);
        } else {
          deselectAll();
        }
      }
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleClick);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('click', handleClick);
      }
    };
  }, [view.toolMode, view.placementType, components, pointerToGrid, pointer, addComponent, selectComponent, deselectAll]);

  // Handle escape to cancel placement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPlacementType(null);
        deselectAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPlacementType, deselectAll]);

  return null;
}

// ============================================
// 3D SCENE
// ============================================

function CADScene() {
  return (
    <>
      <CADCamera mode="isometric" />

      {/* Lighting - Simple, CAD-appropriate */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 5, -3]} intensity={0.3} />

      {/* Grid */}
      <CADGrid />

      {/* Components (Instanced rendering) */}
      <InstancedComponentsRenderer />

      {/* Wires */}
      <WireRenderer />

      {/* Placement preview */}
      <PlacementPreview />
      <SnapIndicator />

      {/* Interaction handler */}
      <InteractionHandler />
    </>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CADCircuitLab() {
  // Store
  const view = useCircuitLabStore(state => state.view);
  const simulation = useCircuitLabStore(state => state.simulation);
  const components = useCircuitLabStore(state => state.getComponentsArray());
  const wires = useCircuitLabStore(state => state.getWiresArray());
  const selectedIds = useCircuitLabStore(state => state.selectedIds);
  const code = useCircuitLabStore(state => state.code);

  // Actions
  const setToolMode = useCircuitLabStore(state => state.setToolMode);
  const setPlacementType = useCircuitLabStore(state => state.setPlacementType);
  const addComponent = useCircuitLabStore(state => state.addComponent);
  const deleteSelected = useCircuitLabStore(state => state.deleteSelected);
  const rotateComponent = useCircuitLabStore(state => state.rotateComponent);
  const setZoom = useCircuitLabStore(state => state.setZoom);
  const toggleGrid = useCircuitLabStore(state => state.toggleGrid);
  const toggleLabels = useCircuitLabStore(state => state.toggleLabels);
  const startSimulation = useCircuitLabStore(state => state.startSimulation);
  const stopSimulation = useCircuitLabStore(state => state.stopSimulation);
  const resetSimulation = useCircuitLabStore(state => state.resetSimulation);
  const setCode = useCircuitLabStore(state => state.setCode);
  const clearSerialOutput = useCircuitLabStore(state => state.clearSerialOutput);

  // Local state
  const [activePanel, setActivePanel] = useState<'components' | 'code'>('components');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Microcontrollers', 'Connectors']);
  const [selectedWireColor, setSelectedWireColor] = useState('#ef4444');

  // Filter components by search
  const filteredLibrary = useMemo(() => {
    if (!searchTerm) return COMPONENT_LIBRARY;

    const term = searchTerm.toLowerCase();
    return COMPONENT_LIBRARY.map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.nameKo.includes(term) ||
        item.description.toLowerCase().includes(term)
      ),
    })).filter(category => category.items.length > 0);
  }, [searchTerm]);

  // Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  // Handle component placement
  const handleAddComponent = useCallback((type: ComponentType) => {
    setPlacementType(type);
  }, [setPlacementType]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          deleteSelected();
          break;
        case 'r':
        case 'R':
          selectedIds.forEach(id => rotateComponent(id));
          break;
        case 'v':
        case 'V':
          setToolMode('select');
          break;
        case 'w':
        case 'W':
          setToolMode('wire');
          break;
        case 'g':
        case 'G':
          toggleGrid();
          break;
        case '+':
        case '=':
          setZoom(view.zoom * 1.2);
          break;
        case '-':
        case '_':
          setZoom(view.zoom / 1.2);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, rotateComponent, selectedIds, setToolMode, setZoom, toggleGrid, view.zoom]);

  return (
    <div className="h-screen flex flex-col bg-[#0d0d14] text-gray-200 overflow-hidden">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 bg-[#12121a] border-b border-[#252530]">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Home className="w-4 h-4 mr-2" />
              홈
            </Button>
          </Link>
          <div className="h-6 w-px bg-[#252530]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">CAD Circuit Lab</h1>
              <p className="text-[10px] text-gray-500">Tinkercad-Style Simulator</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation controls */}
          <div className="flex items-center gap-1 bg-[#1a1a24] rounded-lg p-1">
            {simulation.isRunning ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={stopSimulation}
                className="h-7 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/20"
              >
                <Square className="w-3.5 h-3.5 mr-1" />
                정지
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={startSimulation}
                className="h-7 px-3 text-green-400 hover:text-green-300 hover:bg-green-500/20"
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                시작
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSimulation}
              className="h-7 px-2 text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a24] rounded-lg">
            <div className={`w-2 h-2 rounded-full ${simulation.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs text-gray-400">
              {simulation.isRunning ? '실행 중' : '대기'}
            </span>
          </div>

          {/* View controls */}
          <div className="flex items-center gap-1 bg-[#1a1a24] rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(view.zoom * 1.2)}
              className="h-7 w-7 p-0 text-gray-400 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(view.zoom / 1.2)}
              className="h-7 w-7 p-0 text-gray-400 hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleGrid}
              className={`h-7 w-7 p-0 ${view.showGrid ? 'text-cyan-400' : 'text-gray-400'}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLabels}
              className={`h-7 w-7 p-0 ${view.showLabels ? 'text-cyan-400' : 'text-gray-400'}`}
            >
              <Tag className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Component Library / Code Editor */}
        <div className="w-64 bg-[#12121a] border-r border-[#252530] flex flex-col">
          {/* Panel tabs */}
          <div className="flex border-b border-[#252530]">
            <button
              onClick={() => setActivePanel('components')}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                activePanel === 'components'
                  ? 'text-white bg-[#1a1a24]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 inline mr-1" />
              부품
            </button>
            <button
              onClick={() => setActivePanel('code')}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                activePanel === 'code'
                  ? 'text-white bg-[#1a1a24]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 inline mr-1" />
              코드
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {activePanel === 'components' && (
              <div className="h-full flex flex-col">
                {/* Search */}
                <div className="p-2 border-b border-[#252530]">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="부품 검색..."
                      className="w-full pl-8 pr-3 py-1.5 bg-[#1a1a24] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Component list */}
                <div className="flex-1 overflow-y-auto">
                  {filteredLibrary.map((category) => (
                    <div key={category.category}>
                      <button
                        onClick={() => toggleCategory(category.category)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-[#1a1a24] transition-colors"
                      >
                        {expandedCategories.includes(category.category) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <category.icon className="w-4 h-4 text-cyan-400" />
                        <span>{category.categoryKo}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          {category.items.length}
                        </span>
                      </button>

                      {expandedCategories.includes(category.category) && (
                        <div className="pb-2">
                          {category.items.map((item) => (
                            <button
                              key={item.type}
                              onClick={() => handleAddComponent(item.type)}
                              className={`w-full flex items-center gap-2 px-4 py-2 text-xs transition-colors group ${
                                view.placementType === item.type
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a24]'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded flex items-center justify-center ${
                                view.placementType === item.type
                                  ? 'bg-cyan-500/30'
                                  : 'bg-[#1a1a24] group-hover:bg-[#252530]'
                              }`}>
                                <Plus className="w-3 h-3" />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium">{item.nameKo}</div>
                                <div className="text-[10px] text-gray-500 truncate">
                                  {item.description}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePanel === 'code' && (
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <Editor
                    height="100%"
                    defaultLanguage="cpp"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 11,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      tabSize: 2,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center - 3D Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="h-10 flex items-center gap-1 px-2 bg-[#12121a] border-b border-[#252530]">
            {/* Tool buttons */}
            {[
              { mode: 'select' as const, icon: MousePointer, label: '선택 (V)', key: 'select' },
              { mode: 'wire' as const, icon: Cable, label: '와이어 (W)', key: 'wire' },
              { mode: 'delete' as const, icon: Trash2, label: '삭제', key: 'delete' },
            ].map(({ mode, icon: Icon, label, key }) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                onClick={() => setToolMode(mode)}
                className={`h-7 px-2 ${
                  view.toolMode === mode
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}

            <div className="h-5 w-px bg-[#252530] mx-1" />

            {/* Rotate selected */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectedIds.forEach(id => rotateComponent(id))}
              disabled={selectedIds.size === 0}
              className="h-7 px-2 text-gray-400 hover:text-white disabled:opacity-50"
              title="회전 (R)"
            >
              <RotateCw className="w-4 h-4" />
            </Button>

            <div className="h-5 w-px bg-[#252530] mx-1" />

            {/* Wire colors */}
            {view.toolMode === 'wire' && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 mr-1">색상:</span>
                {WIRE_COLORS.map((wc) => (
                  <button
                    key={wc.color}
                    onClick={() => setSelectedWireColor(wc.color)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      selectedWireColor === wc.color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: wc.color }}
                    title={`${wc.name} (${wc.use})`}
                  />
                ))}
              </div>
            )}

            {/* Placement indicator */}
            {view.placementType && (
              <Badge className="ml-2 bg-cyan-500/20 text-cyan-400">
                <Plus className="w-3 h-3 mr-1" />
                배치 모드: 클릭하여 배치
              </Badge>
            )}

            {/* Component count */}
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
              <span>{components.length} 부품</span>
              <span>•</span>
              <span>{wires.length} 와이어</span>
              {selectedIds.size > 0 && (
                <>
                  <span>•</span>
                  <span className="text-cyan-400">{selectedIds.size} 선택됨</span>
                </>
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative">
            <Canvas
              shadows
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance',
              }}
              dpr={[1, 2]}
              onCreated={({ gl }) => {
                gl.setClearColor('#0d0d14');
              }}
            >
              <Suspense fallback={null}>
                <CADScene />
              </Suspense>
            </Canvas>

            {/* Canvas overlay - Info */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <Badge variant="secondary" className="bg-black/50 text-gray-300 backdrop-blur-sm">
                <Zap className="w-3 h-3 mr-1 text-cyan-400" />
                {components.length} 부품
              </Badge>
              <Badge variant="secondary" className="bg-black/50 text-gray-300 backdrop-blur-sm">
                줌: {Math.round(view.zoom * 100)}%
              </Badge>
            </div>

            <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
              휠: 확대/축소 • 중클릭 드래그: 이동 • ESC: 취소
            </div>
          </div>
        </div>

        {/* Right Panel - Serial Monitor */}
        <div className="w-72 bg-[#12121a] border-l border-[#252530] flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#252530]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Serial Monitor</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSerialOutput}
              className="h-6 px-2 text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex-1 p-2 font-mono text-xs text-green-400 bg-[#0a0a0f] overflow-auto whitespace-pre-wrap">
            {simulation.serialBuffer.length > 0
              ? simulation.serialBuffer.join('')
              : '시리얼 출력이 여기에 표시됩니다...\n\n시뮬레이션을 시작하면 Serial.print() 출력을 볼 수 있습니다.'}
          </div>

          {/* Serial input */}
          <div className="p-2 border-t border-[#252530]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="메시지 입력..."
                className="flex-1 px-2 py-1 bg-[#1a1a24] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                disabled={!simulation.isRunning}
              />
              <Button
                size="sm"
                className="px-3 bg-cyan-600 hover:bg-cyan-500"
                disabled={!simulation.isRunning}
              >
                전송
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <footer className="h-6 flex items-center justify-between px-3 bg-[#12121a] border-t border-[#252530] text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Arduino UNO R3</span>
          <span>•</span>
          <span>ATmega328P @ 16MHz</span>
          <span>•</span>
          <span>Flash: 32KB | SRAM: 2KB</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{simulation.isRunning ? '시뮬레이션 활성' : '대기 중'}</span>
          <Badge variant="secondary" className="h-4 text-[10px] bg-cyan-500/20 text-cyan-400">
            CAD v3.0
          </Badge>
        </div>
      </footer>
    </div>
  );
}

export default CADCircuitLab;
