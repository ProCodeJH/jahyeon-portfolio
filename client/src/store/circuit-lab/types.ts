
export type ComponentCategory =
    | 'microcontroller'
    | 'passive'
    | 'output'
    | 'input'
    | 'connector'
    | 'power';

export type ComponentType =
    | 'arduino_uno'
    | 'breadboard_full'
    | 'breadboard_half'
    | 'breadboard_mini'
    | 'led_red'
    | 'led_green'
    | 'led_blue'
    | 'led_yellow'
    | 'led_white'
    | 'led_rgb'
    | 'resistor'
    | 'capacitor'
    | 'potentiometer'
    | 'button'
    | 'switch_spdt'
    | 'buzzer'
    | 'servo'
    | 'motor_dc'
    | 'ultrasonic'
    | 'dht22'
    | 'photoresistor'
    | 'temperature'
    | 'lcd_16x2'
    | 'seven_segment'
    | 'relay'
    | 'transistor_npn'
    | 'diode'
    | 'battery_9v'
    | 'wire_red'
    | 'wire_black'
    | 'wire_blue'
    | 'wire_green'
    | 'wire_yellow'
    | 'wire_orange'
    | 'wire_white'
    | 'wire_purple';

export interface LEDProperties { brightness: number; isOn: boolean; r?: number; g?: number; b?: number; }
export interface ResistorProperties { value: number; tolerance: number; }
export interface CapacitorProperties { value: number; unit: string; }
export interface PotentiometerProperties { value: number; position: number; }
export interface ButtonProperties { isPressed: boolean; }
export interface SwitchProperties { position: number; }
export interface BuzzerProperties { frequency: number; isOn: boolean; }
export interface ServoProperties { angle: number; }
export interface MotorProperties { speed: number; direction: number; }
export interface UltrasonicProperties { distance: number; isActive: boolean; }
export interface DHT22Properties { temperature: number; humidity: number; isActive: boolean; }
export interface PhotoresistorProperties { lightLevel: number; }
export interface TemperatureProperties { temperature: number; }
export interface BatteryProperties { voltage: number; }

export type ComponentProperties =
    | LEDProperties
    | ResistorProperties
    | CapacitorProperties
    | PotentiometerProperties
    | ButtonProperties
    | SwitchProperties
    | BuzzerProperties
    | ServoProperties
    | MotorProperties
    | UltrasonicProperties
    | DHT22Properties
    | PhotoresistorProperties
    | TemperatureProperties
    | BatteryProperties
    | Record<string, never>;

export type PinType = 'digital' | 'analog' | 'pwm' | 'power' | 'ground' | 'serial' | 'i2c' | 'spi';
export type PinDirection = 'input' | 'output' | 'bidirectional';
export type PinState = 'HIGH' | 'LOW' | 'FLOATING' | 'PWM';

export interface PinData {
    id: string;
    name: string;
    type: PinType;
    direction: PinDirection;
    state: PinState;
    voltage: number;
    pwmDuty?: number;
    localOffset: [number, number, number];
}

export interface ComponentData {
    id: string;
    type: ComponentType;
    category: ComponentCategory;
    gridX: number;
    gridY: number;
    gridZ: number;
    rotation: 0 | 1 | 2 | 3;
    properties: ComponentProperties;
    pins: PinData[];
    isSelected: boolean;
    isHovered: boolean;
    isActive: boolean;
    label?: string;
    createdAt: number;
}

export interface WireData {
    id: string;
    color: string;
    startComponentId: string;
    startPinId: string;
    endComponentId: string;
    endPinId: string;
    routePoints: [number, number, number][];
    isSelected: boolean;
    isCarryingSignal: boolean;
    signalValue: 'HIGH' | 'LOW' | 'FLOATING';
}

export type ToolMode = 'select' | 'pan' | 'place' | 'wire' | 'delete';

export interface ViewState {
    centerX: number;
    centerY: number;
    zoom: number;
    showGrid: boolean;
    showLabels: boolean;
    showPinNames: boolean;
    gridSnap: boolean;
    toolMode: ToolMode;
    placementType: ComponentType | null;
    placementPreview: { gridX: number; gridZ: number } | null;
}

export interface SimulationState {
    isRunning: boolean;
    isPaused: boolean;
    speed: number;
    time: number;
    pinStates: Map<string, PinState>;
    serialBuffer: string[];
}

export interface CircuitLabStore {
    components: Map<string, ComponentData>;
    wires: Map<string, WireData>;
    view: ViewState;
    simulation: SimulationState;
    selectedIds: Set<string>;
    hoveredId: string | null;
    wiringFrom: { componentId: string; pinId: string } | null;
    code: string;
    compileErrors: string[];
    nextId: number;

    addComponent: (type: ComponentType, gridX: number, gridZ: number) => string;
    removeComponent: (id: string) => void;
    moveComponent: (id: string, gridX: number, gridZ: number) => void;
    rotateComponent: (id: string) => void;
    updateComponentProperty: (id: string, key: string, value: any) => void;

    addWire: (startCompId: string, startPinId: string, endCompId: string, endPinId: string, color: string) => string;
    removeWire: (id: string) => void;

    selectComponent: (id: string, additive?: boolean) => void;
    deselectAll: () => void;
    setHovered: (id: string | null) => void;

    startWiring: (componentId: string, pinId: string) => void;
    cancelWiring: () => void;
    completeWiring: (componentId: string, pinId: string, color: string) => void;

    setToolMode: (mode: ToolMode) => void;
    setPlacementType: (type: ComponentType | null) => void;
    updatePlacementPreview: (gridX: number, gridZ: number) => void;
    setZoom: (zoom: number) => void;
    pan: (deltaX: number, deltaY: number) => void;
    toggleGrid: () => void;
    toggleLabels: () => void;
    togglePinNames: () => void;
    toggleGridSnap: () => void;

    startSimulation: () => void;
    stopSimulation: () => void;
    pauseSimulation: () => void;
    resetSimulation: () => void;
    setSimulationSpeed: (speed: number) => void;
    updatePinState: (componentId: string, pinId: string, state: PinState, voltage?: number) => void;
    addSerialOutput: (text: string) => void;
    clearSerialOutput: () => void;

    setCode: (code: string) => void;
    setCompileErrors: (errors: string[]) => void;

    deleteSelected: () => void;
    clearAll: () => void;

    getComponentById: (id: string) => ComponentData | undefined;
    getWireById: (id: string) => WireData | undefined;
    getComponentsArray: () => ComponentData[];
    getWiresArray: () => WireData[];
    getComponentsByType: (type: ComponentType) => ComponentData[];
    getSelectedComponents: () => ComponentData[];
    getPinWorldPosition: (componentId: string, pinId: string) => [number, number, number] | null;
}
