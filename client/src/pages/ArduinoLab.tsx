import { useState, useCallback, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Group, Text, Line, Arrow } from 'react-konva';
import { Button } from '@/components/ui/button';
import {
    Play, Square, RotateCcw, ZoomIn, ZoomOut, Grid, Trash2,
    Save, Upload, Settings, ChevronLeft, ChevronRight, Terminal
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Component, Wire, Pin, ComponentType, CanvasState, WiringState,
    createId, pinColors, componentColors
} from '@/lib/arduino-lab/types';
import { componentDefinitions } from '@/lib/arduino-lab/components';
import { Navigation } from '@/components/layout/Navigation';

// ============================================
// COMPONENT PALETTE
// ============================================
const ComponentPalette = ({
    onDragStart
}: {
    onDragStart: (type: ComponentType) => void
}) => {
    const palette = [
        { type: 'arduino-uno' as ComponentType, icon: '🔌', label: 'Arduino Uno' },
        { type: 'led' as ComponentType, icon: '💡', label: 'LED' },
        { type: 'resistor' as ComponentType, icon: '⚡', label: 'Resistor' },
        { type: 'button' as ComponentType, icon: '🔘', label: 'Button' },
        { type: 'breadboard' as ComponentType, icon: '📋', label: 'Breadboard' },
    ];

    return (
        <div className="w-64 bg-[#1a1a2e] border-r border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10">
                <h2 className="text-white font-semibold flex items-center gap-2">
                    <Grid className="w-4 h-4" />
                    Components
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {palette.map((item) => (
                    <div
                        key={item.type}
                        draggable
                        onDragStart={() => onDragStart(item.type)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all hover:border-blue-500/50 flex items-center gap-3"
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-white/80 text-sm">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// ARDUINO COMPONENT RENDERER
// ============================================
const ArduinoComponent = ({
    component,
    selected,
    onSelect,
    onDragEnd,
    onPinClick,
}: {
    component: Component;
    selected: boolean;
    onSelect: () => void;
    onDragEnd: (x: number, y: number) => void;
    onPinClick: (pin: Pin) => void;
}) => {
    const def = componentDefinitions[component.type];
    if (!def) return null;

    const renderComponent = () => {
        switch (component.type) {
            case 'arduino-uno':
                return (
                    <>
                        {/* Board body */}
                        <Rect
                            width={def.width}
                            height={def.height}
                            fill="#008184"
                            cornerRadius={8}
                            stroke={selected ? '#3B82F6' : '#006466'}
                            strokeWidth={selected ? 3 : 2}
                        />
                        {/* USB port */}
                        <Rect x={5} y={60} width={30} height={50} fill="#888" cornerRadius={3} />
                        {/* Power jack */}
                        <Rect x={5} y={130} width={25} height={30} fill="#333" cornerRadius={2} />
                        {/* ATmega chip */}
                        <Rect x={100} y={50} width={60} height={80} fill="#333" cornerRadius={2} />
                        {/* Reset button */}
                        <Circle x={230} y={90} radius={8} fill="#C00" />
                        {/* LED indicators */}
                        <Circle x={50} y={40} radius={4} fill="#0F0" /> {/* ON */}
                        <Circle x={65} y={40} radius={4} fill="#F00" /> {/* L */}
                        {/* Label */}
                        <Text x={100} y={140} text="Arduino Uno" fill="white" fontSize={12} />
                    </>
                );

            case 'led':
                return (
                    <>
                        {/* LED body */}
                        <Circle
                            x={20}
                            y={30}
                            radius={15}
                            fill={component.properties.color || 'red'}
                            opacity={0.3 + (component.properties.brightness || 0) * 0.7}
                            stroke={selected ? '#3B82F6' : '#666'}
                            strokeWidth={selected ? 2 : 1}
                        />
                        {/* LED dome */}
                        <Circle x={20} y={30} radius={10} fill="rgba(255,255,255,0.3)" />
                        {/* Legs */}
                        <Line points={[20, 45, 20, 55]} stroke="#888" strokeWidth={2} />
                        <Line points={[15, 5, 15, 15]} stroke="#888" strokeWidth={2} />
                        <Line points={[25, 5, 25, 15]} stroke="#888" strokeWidth={2} />
                    </>
                );

            case 'resistor':
                return (
                    <>
                        {/* Body */}
                        <Rect
                            x={15}
                            y={3}
                            width={50}
                            height={14}
                            fill="#D4A574"
                            cornerRadius={3}
                            stroke={selected ? '#3B82F6' : '#A67C52'}
                            strokeWidth={selected ? 2 : 1}
                        />
                        {/* Color bands */}
                        <Rect x={20} y={3} width={4} height={14} fill="#8B4513" />
                        <Rect x={28} y={3} width={4} height={14} fill="#8B4513" />
                        <Rect x={36} y={3} width={4} height={14} fill="#964B00" />
                        <Rect x={44} y={3} width={4} height={14} fill="#FFD700" />
                        {/* Leads */}
                        <Line points={[0, 10, 15, 10]} stroke="#888" strokeWidth={2} />
                        <Line points={[65, 10, 80, 10]} stroke="#888" strokeWidth={2} />
                    </>
                );

            case 'button':
                return (
                    <>
                        {/* Body */}
                        <Rect
                            width={def.width}
                            height={def.height}
                            fill="#333"
                            cornerRadius={4}
                            stroke={selected ? '#3B82F6' : '#555'}
                            strokeWidth={selected ? 2 : 1}
                        />
                        {/* Button cap */}
                        <Circle x={25} y={25} radius={12} fill="#666" stroke="#888" strokeWidth={2} />
                    </>
                );

            default:
                return (
                    <Rect
                        width={def.width}
                        height={def.height}
                        fill="#555"
                        stroke={selected ? '#3B82F6' : '#777'}
                        strokeWidth={selected ? 2 : 1}
                    />
                );
        }
    };

    return (
        <Group
            x={component.x}
            y={component.y}
            rotation={component.rotation}
            draggable
            onClick={onSelect}
            onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
        >
            {renderComponent()}

            {/* Render pins */}
            {component.pins.map((pin) => (
                <Group key={pin.id} onClick={() => onPinClick(pin)}>
                    <Circle
                        x={pin.localX}
                        y={pin.localY}
                        radius={5}
                        fill={pinColors[pin.type]}
                        stroke={selected ? '#FFF' : '#333'}
                        strokeWidth={1}
                    />
                </Group>
            ))}
        </Group>
    );
};

// ============================================
// MAIN ARDUINO LAB PAGE
// ============================================
export default function ArduinoLab() {
    const stageRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Canvas state
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const [canvasState, setCanvasState] = useState<CanvasState>({
        scale: 1,
        position: { x: 0, y: 0 },
        gridSize: 20,
        snapToGrid: true,
    });

    // Circuit state
    const [components, setComponents] = useState<Component[]>([]);
    const [wires, setWires] = useState<Wire[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Wiring state
    const [wiringState, setWiringState] = useState<WiringState>({
        active: false,
        currentPath: [],
    });

    // Simulation state
    const [simulating, setSimulating] = useState(false);
    const [showCode, setShowCode] = useState(true);
    const [showSerial, setShowSerial] = useState(false);
    const [code, setCode] = useState(`void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`);

    // Resize handler
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setCanvasSize({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Add component
    const addComponent = useCallback((type: ComponentType, x: number, y: number) => {
        const def = componentDefinitions[type];
        if (!def) return;

        const newComponent: Component = {
            id: createId(),
            type,
            x,
            y,
            rotation: 0,
            pins: def.defaultPins.map((p, i) => ({
                ...p,
                id: `pin-${i}-${createId()}`,
            })),
            properties: { ...def.defaultProperties },
            selected: false,
            zIndex: components.length,
        };

        setComponents((prev) => [...prev, newComponent]);
        toast.success(`Added ${def.name}`);
    }, [components.length]);

    // Handle drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left - 50;
        const y = e.clientY - rect.top - 50;

        // Get dragged type from palette
        const type = (window as any).__draggedComponentType as ComponentType;
        if (type) {
            addComponent(type, x, y);
            delete (window as any).__draggedComponentType;
        }
    }, [addComponent]);

    // Handle drag start from palette
    const handlePaletteDragStart = (type: ComponentType) => {
        (window as any).__draggedComponentType = type;
    };

    // Update component position
    const updateComponentPosition = (id: string, x: number, y: number) => {
        setComponents((prev) =>
            prev.map((c) => (c.id === id ? { ...c, x, y } : c))
        );
    };

    // Delete selected
    const deleteSelected = () => {
        if (selectedId) {
            setComponents((prev) => prev.filter((c) => c.id !== selectedId));
            setWires((prev) => prev.filter(
                (w) => w.startPin.componentId !== selectedId && w.endPin.componentId !== selectedId
            ));
            setSelectedId(null);
            toast.success('Component deleted');
        }
    };

    // Handle pin click for wiring
    const handlePinClick = (componentId: string, pin: Pin) => {
        if (!wiringState.active) {
            // Start new wire
            setWiringState({
                active: true,
                startPin: { componentId, pinId: pin.id },
                currentPath: [{ x: pin.localX, y: pin.localY }],
            });
        } else if (wiringState.startPin) {
            // Complete wire
            if (wiringState.startPin.componentId !== componentId || wiringState.startPin.pinId !== pin.id) {
                const newWire: Wire = {
                    id: createId(),
                    startPin: wiringState.startPin,
                    endPin: { componentId, pinId: pin.id },
                    color: '#4ADE80',
                    points: [],
                    selected: false,
                };
                setWires((prev) => [...prev, newWire]);
                toast.success('Wire connected!');
            }
            setWiringState({ active: false, currentPath: [] });
        }
    };

    // Zoom controls
    const zoomIn = () => setCanvasState((s) => ({ ...s, scale: Math.min(s.scale * 1.2, 3) }));
    const zoomOut = () => setCanvasState((s) => ({ ...s, scale: Math.max(s.scale / 1.2, 0.3) }));
    const resetView = () => setCanvasState((s) => ({ ...s, scale: 1, position: { x: 0, y: 0 } }));

    // Simulation controls
    const startSimulation = () => {
        setSimulating(true);
        toast.success('Simulation started!');
    };

    const stopSimulation = () => {
        setSimulating(false);
        toast.info('Simulation stopped');
    };

    return (
        <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col">
            <Navigation />

            {/* Toolbar */}
            <div className="h-14 bg-[#1a1a2e] border-b border-white/10 flex items-center px-4 gap-2 mt-16">
                <div className="flex items-center gap-1 mr-4">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={simulating ? stopSimulation : startSimulation}
                        className={simulating ? 'text-red-400' : 'text-green-400'}
                    >
                        {simulating ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {simulating ? 'Stop' : 'Run'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={resetView}>
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-1 border-l border-white/10 pl-4">
                    <Button size="sm" variant="ghost" onClick={zoomOut}>
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-white/50 w-12 text-center">
                        {Math.round(canvasState.scale * 100)}%
                    </span>
                    <Button size="sm" variant="ghost" onClick={zoomIn}>
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-1 border-l border-white/10 pl-4">
                    <Button size="sm" variant="ghost" onClick={deleteSelected} disabled={!selectedId}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant={showSerial ? 'default' : 'ghost'}
                        onClick={() => setShowSerial(!showSerial)}
                    >
                        <Terminal className="w-4 h-4 mr-1" />
                        Serial
                    </Button>
                    <Button
                        size="sm"
                        variant={showCode ? 'default' : 'ghost'}
                        onClick={() => setShowCode(!showCode)}
                    >
                        {showCode ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        Code
                    </Button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Component Palette */}
                <ComponentPalette onDragStart={handlePaletteDragStart} />

                {/* Canvas */}
                <div
                    ref={containerRef}
                    className="flex-1 bg-[#0a0a14] overflow-hidden"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <Stage
                        ref={stageRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        scaleX={canvasState.scale}
                        scaleY={canvasState.scale}
                        x={canvasState.position.x}
                        y={canvasState.position.y}
                        draggable
                        onDragEnd={(e) => {
                            setCanvasState((s) => ({
                                ...s,
                                position: { x: e.target.x(), y: e.target.y() },
                            }));
                        }}
                    >
                        <Layer>
                            {/* Grid */}
                            {Array.from({ length: 50 }).map((_, i) => (
                                <Line
                                    key={`h-${i}`}
                                    points={[0, i * 20, 1000, i * 20]}
                                    stroke="#1a1a2e"
                                    strokeWidth={1}
                                />
                            ))}
                            {Array.from({ length: 50 }).map((_, i) => (
                                <Line
                                    key={`v-${i}`}
                                    points={[i * 20, 0, i * 20, 1000]}
                                    stroke="#1a1a2e"
                                    strokeWidth={1}
                                />
                            ))}

                            {/* Components */}
                            {components.map((comp) => (
                                <ArduinoComponent
                                    key={comp.id}
                                    component={comp}
                                    selected={selectedId === comp.id}
                                    onSelect={() => setSelectedId(comp.id)}
                                    onDragEnd={(x, y) => updateComponentPosition(comp.id, x, y)}
                                    onPinClick={(pin) => handlePinClick(comp.id, pin)}
                                />
                            ))}

                            {/* Wires */}
                            {wires.map((wire) => {
                                const startComp = components.find((c) => c.id === wire.startPin.componentId);
                                const endComp = components.find((c) => c.id === wire.endPin.componentId);
                                const startPin = startComp?.pins.find((p) => p.id === wire.startPin.pinId);
                                const endPin = endComp?.pins.find((p) => p.id === wire.endPin.pinId);

                                if (!startComp || !endComp || !startPin || !endPin) return null;

                                return (
                                    <Line
                                        key={wire.id}
                                        points={[
                                            startComp.x + startPin.localX,
                                            startComp.y + startPin.localY,
                                            endComp.x + endPin.localX,
                                            endComp.y + endPin.localY,
                                        ]}
                                        stroke={wire.color}
                                        strokeWidth={3}
                                        lineCap="round"
                                    />
                                );
                            })}
                        </Layer>
                    </Stage>

                    {/* Empty state */}
                    {components.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center text-white/30">
                                <div className="text-6xl mb-4">🔌</div>
                                <p className="text-lg">Drag components from the palette</p>
                                <p className="text-sm">to start building your circuit</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Code Editor Panel */}
                {showCode && (
                    <div className="w-96 bg-[#1a1a2e] border-l border-white/10 flex flex-col">
                        <div className="p-3 border-b border-white/10 flex items-center justify-between">
                            <span className="text-sm font-medium">Arduino Code</span>
                            <Button size="sm" variant="ghost" className="text-blue-400">
                                Compile
                            </Button>
                        </div>
                        <div className="flex-1 p-3">
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-full bg-[#0a0a14] text-green-400 font-mono text-sm p-3 rounded-lg border border-white/10 resize-none focus:outline-none focus:border-blue-500"
                                spellCheck={false}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Serial Monitor */}
            {showSerial && (
                <div className="h-48 bg-[#1a1a2e] border-t border-white/10 flex flex-col">
                    <div className="p-2 border-b border-white/10 flex items-center gap-2">
                        <span className="text-sm font-medium">Serial Monitor</span>
                        <span className="text-xs text-white/50">9600 baud</span>
                    </div>
                    <div className="flex-1 p-3 font-mono text-sm text-green-400 overflow-y-auto bg-black/30">
                        <p className="text-white/30">// Serial output will appear here</p>
                    </div>
                </div>
            )}
        </div>
    );
}
