/**
 * Tinkercad-Style Circuit Lab
 * Production-grade 3D Arduino Circuit Simulator
 * 틴커캐드 스타일 회로 시뮬레이터
 */

import { useState, useCallback, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, PerspectiveCamera, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Link } from 'wouter';
import Editor from '@monaco-editor/react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Cpu,
  Code2,
  Terminal,
  Box,
  Settings,
  Home,
  Layers,
  Zap,
  Plus,
  Trash2,
  RotateCw,
  Move,
  MousePointer,
  Pencil,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  CircleDot,
  Lightbulb,
  Gauge,
  ToggleLeft,
  Thermometer,
  Radio,
  Mic2,
  Speaker,
  Battery,
  Cable,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Check,
  AlertCircle,
  Info,
  Copy,
  Download,
  Upload,
  Save,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type ComponentType =
  | 'arduino_uno'
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
  | 'switch'
  | 'buzzer'
  | 'piezo'
  | 'motor_dc'
  | 'servo'
  | 'ultrasonic'
  | 'photoresistor'
  | 'temperature'
  | 'ir_sensor'
  | 'lcd_16x2'
  | 'seven_segment'
  | 'relay'
  | 'transistor'
  | 'diode'
  | 'battery_9v'
  | 'power_supply';

type ToolMode = 'select' | 'move' | 'rotate' | 'wire' | 'delete';

interface CircuitComponent {
  id: string;
  type: ComponentType;
  position: [number, number, number];
  rotation: [number, number, number];
  properties: Record<string, any>;
  pins: PinDefinition[];
}

interface PinDefinition {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'digital' | 'analog' | 'power' | 'ground' | 'pwm';
  direction: 'input' | 'output' | 'bidirectional';
  voltage: number;
  state: 'HIGH' | 'LOW' | 'FLOATING' | 'PWM';
  pwmDuty?: number;
}

interface Wire {
  id: string;
  startComponentId: string;
  startPinId: string;
  endComponentId: string;
  endPinId: string;
  color: string;
  points: [number, number, number][];
}

interface SimulationState {
  isRunning: boolean;
  time: number;
  speed: number;
  pinStates: Map<string, PinDefinition>;
}

// ============================================
// COMPONENT DEFINITIONS
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
    icon?: any;
  }[];
}[] = [
  {
    category: 'Microcontrollers',
    categoryKo: '마이크로컨트롤러',
    icon: Cpu,
    items: [
      { type: 'arduino_uno', name: 'Arduino Uno R3', nameKo: '아두이노 우노 R3', description: 'ATmega328P 기반 마이크로컨트롤러' },
    ],
  },
  {
    category: 'Basic Components',
    categoryKo: '기본 부품',
    icon: CircleDot,
    items: [
      { type: 'breadboard_half', name: 'Breadboard (Half)', nameKo: '브레드보드 (하프)', description: '400핀 브레드보드' },
      { type: 'breadboard_mini', name: 'Breadboard (Mini)', nameKo: '브레드보드 (미니)', description: '170핀 미니 브레드보드' },
    ],
  },
  {
    category: 'Output',
    categoryKo: '출력',
    icon: Lightbulb,
    items: [
      { type: 'led_red', name: 'LED (Red)', nameKo: 'LED (빨강)', description: '5mm 빨간색 LED' },
      { type: 'led_green', name: 'LED (Green)', nameKo: 'LED (초록)', description: '5mm 초록색 LED' },
      { type: 'led_blue', name: 'LED (Blue)', nameKo: 'LED (파랑)', description: '5mm 파란색 LED' },
      { type: 'led_yellow', name: 'LED (Yellow)', nameKo: 'LED (노랑)', description: '5mm 노란색 LED' },
      { type: 'led_white', name: 'LED (White)', nameKo: 'LED (흰색)', description: '5mm 흰색 LED' },
      { type: 'led_rgb', name: 'RGB LED', nameKo: 'RGB LED', description: '공통 캐소드 RGB LED' },
      { type: 'buzzer', name: 'Piezo Buzzer', nameKo: '피에조 버저', description: '능동 피에조 버저' },
      { type: 'servo', name: 'Servo Motor', nameKo: '서보 모터', description: 'SG90 마이크로 서보' },
      { type: 'motor_dc', name: 'DC Motor', nameKo: 'DC 모터', description: '소형 DC 모터' },
      { type: 'lcd_16x2', name: 'LCD 16x2', nameKo: 'LCD 16x2', description: '16x2 문자 LCD' },
      { type: 'seven_segment', name: '7-Segment Display', nameKo: '7세그먼트', description: '1자리 7세그먼트 디스플레이' },
    ],
  },
  {
    category: 'Input',
    categoryKo: '입력',
    icon: ToggleLeft,
    items: [
      { type: 'button', name: 'Push Button', nameKo: '푸시 버튼', description: '택트 스위치' },
      { type: 'switch', name: 'Slide Switch', nameKo: '슬라이드 스위치', description: 'SPDT 슬라이드 스위치' },
      { type: 'potentiometer', name: 'Potentiometer', nameKo: '가변저항', description: '10kΩ 가변저항' },
      { type: 'photoresistor', name: 'Photoresistor', nameKo: '조도 센서', description: 'CdS 광저항' },
      { type: 'temperature', name: 'Temp Sensor', nameKo: '온도 센서', description: 'TMP36 온도 센서' },
      { type: 'ultrasonic', name: 'Ultrasonic', nameKo: '초음파 센서', description: 'HC-SR04 거리 센서' },
      { type: 'ir_sensor', name: 'IR Sensor', nameKo: '적외선 센서', description: 'IR 수신 모듈' },
    ],
  },
  {
    category: 'Passive',
    categoryKo: '수동 부품',
    icon: Gauge,
    items: [
      { type: 'resistor', name: 'Resistor', nameKo: '저항', description: '1/4W 탄소피막 저항' },
      { type: 'capacitor', name: 'Capacitor', nameKo: '캐패시터', description: '세라믹 캐패시터' },
      { type: 'diode', name: 'Diode', nameKo: '다이오드', description: '1N4148 신호용 다이오드' },
      { type: 'transistor', name: 'NPN Transistor', nameKo: 'NPN 트랜지스터', description: '2N2222 NPN 트랜지스터' },
    ],
  },
  {
    category: 'Power',
    categoryKo: '전원',
    icon: Battery,
    items: [
      { type: 'battery_9v', name: '9V Battery', nameKo: '9V 건전지', description: '9V 배터리 + 스냅 커넥터' },
      { type: 'power_supply', name: 'Power Supply', nameKo: '전원 공급 장치', description: '가변 전압 전원 공급 장치' },
      { type: 'relay', name: 'Relay Module', nameKo: '릴레이 모듈', description: '5V 1채널 릴레이' },
    ],
  },
];

// Wire colors
const WIRE_COLORS = [
  { name: 'Red', color: '#ef4444', use: 'VCC/5V' },
  { name: 'Black', color: '#1f2937', use: 'GND' },
  { name: 'Yellow', color: '#eab308', use: 'Signal' },
  { name: 'Green', color: '#22c55e', use: 'Signal' },
  { name: 'Blue', color: '#3b82f6', use: 'Signal' },
  { name: 'Orange', color: '#f97316', use: 'Signal' },
  { name: 'White', color: '#f8fafc', use: 'Signal' },
  { name: 'Purple', color: '#a855f7', use: 'Signal' },
];

// Default Arduino code
const DEFAULT_CODE = `// 아두이노 LED 깜빡이기 예제
// Arduino Blink Example

const int LED_PIN = 13;  // 내장 LED 핀

void setup() {
  // LED 핀을 출력으로 설정
  pinMode(LED_PIN, OUTPUT);

  // 시리얼 통신 시작
  Serial.begin(9600);
  Serial.println("프로그램 시작!");
}

void loop() {
  // LED 켜기
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON");
  delay(1000);

  // LED 끄기
  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
`;

// ============================================
// 3D COMPONENTS
// ============================================

// Realistic Arduino UNO 3D
function ArduinoUno3D({
  position,
  rotation,
  isSelected,
  onClick,
  onPinClick,
  highlightedPin,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
  onPinClick?: (pinId: string, worldPos: [number, number, number]) => void;
  highlightedPin?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Arduino UNO dimensions (scaled)
  const SCALE = 0.001;
  const WIDTH = 68.6 * SCALE;
  const HEIGHT = 53.4 * SCALE;
  const THICKNESS = 1.6 * SCALE;

  // Pin positions
  const digitalPins = useMemo(() => {
    const pins = [];
    // Digital pins 0-13 (top side)
    for (let i = 0; i <= 13; i++) {
      pins.push({
        id: `D${i}`,
        name: `D${i}${i === 13 ? ' (LED)' : i <= 1 ? ' (Serial)' : [3, 5, 6, 9, 10, 11].includes(i) ? ' ~' : ''}`,
        position: [WIDTH / 2 - 0.003, THICKNESS / 2 + 0.004, -HEIGHT / 2 + 0.008 + i * 0.00254] as [number, number, number],
        type: [3, 5, 6, 9, 10, 11].includes(i) ? 'pwm' : 'digital' as const,
      });
    }
    return pins;
  }, [WIDTH, HEIGHT, THICKNESS]);

  const analogPins = useMemo(() => {
    const pins = [];
    // Analog pins A0-A5 (bottom side)
    for (let i = 0; i <= 5; i++) {
      pins.push({
        id: `A${i}`,
        name: `A${i}`,
        position: [-WIDTH / 2 + 0.003, THICKNESS / 2 + 0.004, -HEIGHT / 2 + 0.025 + i * 0.00254] as [number, number, number],
        type: 'analog' as const,
      });
    }
    return pins;
  }, [WIDTH, HEIGHT, THICKNESS]);

  const powerPins = useMemo(() => [
    { id: 'VIN', name: 'VIN', position: [-WIDTH / 2 + 0.003, THICKNESS / 2 + 0.004, -HEIGHT / 2 + 0.008] as [number, number, number], type: 'power' as const },
    { id: 'GND1', name: 'GND', position: [-WIDTH / 2 + 0.003, THICKNESS / 2 + 0.004, -HEIGHT / 2 + 0.0105] as [number, number, number], type: 'ground' as const },
    { id: 'GND2', name: 'GND', position: [-WIDTH / 2 + 0.003, THICKNESS / 2 + 0.004, -HEIGHT / 2 + 0.013] as [number, number, number], type: 'ground' as const },
    { id: '5V', name: '5V', position: [-WIDTH / 2 + 0.003, THICKNESS / 2 + 0.004, -HEIGHT / 2 + 0.0155] as [number, number, number], type: 'power' as const },
    { id: '3.3V', name: '3.3V', position: [-WIDTH / 2 + 0.003, THICKNESS / 2 + 0.004, -HEIGHT / 2 + 0.018] as [number, number, number], type: 'power' as const },
    { id: 'RESET', name: 'RESET', position: [-WIDTH / 2 + 0.003, THICKNESS / 2 + 0.004, -HEIGHT / 2 + 0.0205] as [number, number, number], type: 'digital' as const },
  ], [WIDTH, HEIGHT, THICKNESS]);

  const allPins = [...digitalPins, ...analogPins, ...powerPins];

  const handlePinClick = useCallback((pinId: string, localPos: [number, number, number]) => {
    if (groupRef.current && onPinClick) {
      const worldPos = new THREE.Vector3(...localPos);
      groupRef.current.localToWorld(worldPos);
      onPinClick(pinId, [worldPos.x, worldPos.y, worldPos.z]);
    }
  }, [onPinClick]);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* PCB Board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[WIDTH, THICKNESS, HEIGHT]} />
        <meshStandardMaterial color="#1d6b45" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Copper traces pattern */}
      <mesh position={[0, THICKNESS / 2 + 0.0001, 0]}>
        <boxGeometry args={[WIDTH - 0.002, 0.0001, HEIGHT - 0.002]} />
        <meshStandardMaterial color="#1a5c3a" roughness={0.8} />
      </mesh>

      {/* USB-B Connector */}
      <group position={[0, THICKNESS / 2 + 0.006, -HEIGHT / 2 + 0.008]}>
        <mesh castShadow>
          <boxGeometry args={[0.012, 0.011, 0.016]} />
          <meshStandardMaterial color="#a0a0a0" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* USB port opening */}
        <mesh position={[0, 0, -0.007]}>
          <boxGeometry args={[0.008, 0.006, 0.004]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* DC Power Jack */}
      <group position={[-0.025, THICKNESS / 2 + 0.005, -HEIGHT / 2 + 0.008]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.0045, 0.0045, 0.01, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* ATmega328P Chip */}
      <group position={[0.005, THICKNESS / 2 + 0.002, 0.005]}>
        <mesh castShadow>
          <boxGeometry args={[0.008, 0.003, 0.035]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
        </mesh>
        {/* Chip pins */}
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={`chip-pin-l-${i}`} position={[-0.005, -0.001, -0.016 + i * 0.00254]}>
            <boxGeometry args={[0.002, 0.0005, 0.0008]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
          </mesh>
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={`chip-pin-r-${i}`} position={[0.005, -0.001, -0.016 + i * 0.00254]}>
            <boxGeometry args={[0.002, 0.0005, 0.0008]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
          </mesh>
        ))}
        {/* Chip notch */}
        <mesh position={[0, 0.0016, -0.016]}>
          <cylinderGeometry args={[0.001, 0.001, 0.001, 16]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>

      {/* Crystal Oscillator */}
      <mesh position={[0.018, THICKNESS / 2 + 0.002, 0.005]} castShadow>
        <boxGeometry args={[0.005, 0.002, 0.012]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Reset Button */}
      <group position={[0.022, THICKNESS / 2, 0.018]}>
        <mesh castShadow>
          <boxGeometry args={[0.006, 0.003, 0.006]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 0.002, 0]}>
          <cylinderGeometry args={[0.0015, 0.0015, 0.002, 16]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
      </group>

      {/* Built-in LEDs */}
      {/* Power LED (ON) - Green */}
      <mesh position={[-0.022, THICKNESS / 2 + 0.001, 0.012]}>
        <boxGeometry args={[0.002, 0.0008, 0.001]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* TX LED - Yellow */}
      <mesh position={[-0.018, THICKNESS / 2 + 0.001, 0.012]}>
        <boxGeometry args={[0.002, 0.0008, 0.001]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>

      {/* RX LED - Yellow */}
      <mesh position={[-0.014, THICKNESS / 2 + 0.001, 0.012]}>
        <boxGeometry args={[0.002, 0.0008, 0.001]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>

      {/* L LED (Pin 13) - Yellow/Orange */}
      <mesh position={[0.022, THICKNESS / 2 + 0.001, 0.012]}>
        <boxGeometry args={[0.002, 0.0008, 0.001]} />
        <meshStandardMaterial color="#ff8c00" />
      </mesh>

      {/* Pin Headers */}
      {allPins.map((pin) => (
        <group
          key={pin.id}
          position={pin.position}
          onClick={(e) => {
            e.stopPropagation();
            handlePinClick(pin.id, pin.position);
          }}
        >
          {/* Black plastic housing */}
          <mesh>
            <boxGeometry args={[0.0025, 0.008, 0.0025]} />
            <meshStandardMaterial
              color={highlightedPin === pin.id ? '#ffff00' : '#1a1a1a'}
            />
          </mesh>
          {/* Gold pin */}
          <mesh position={[0, -0.005, 0]}>
            <boxGeometry args={[0.0006, 0.006, 0.0006]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Hover indicator */}
          {highlightedPin === pin.id && (
            <mesh position={[0, 0.006, 0]}>
              <sphereGeometry args={[0.002, 16, 16]} />
              <meshBasicMaterial color="#00ff00" transparent opacity={0.7} />
            </mesh>
          )}
        </group>
      ))}

      {/* Silkscreen labels */}
      <Html
        position={[0, THICKNESS / 2 + 0.002, 0.012]}
        center
        style={{
          fontSize: '3px',
          color: 'white',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        ARDUINO UNO
      </Html>

      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, -0.002, 0]}>
          <boxGeometry args={[WIDTH + 0.006, 0.002, HEIGHT + 0.006]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// Realistic LED 3D
function LED3D({
  position,
  rotation,
  color = '#ff0000',
  isOn = false,
  brightness = 1,
  isSelected = false,
  onClick,
  onPinClick,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color?: string;
  isOn?: boolean;
  brightness?: number;
  isSelected?: boolean;
  onClick?: () => void;
  onPinClick?: (pinId: string, worldPos: [number, number, number]) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const bodyRadius = 0.0025;
  const bodyHeight = 0.005;
  const legLength = 0.008;

  useFrame((state) => {
    if (glowRef.current && isOn) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
      glowRef.current.scale.setScalar(scale);
    }
  });

  const emissiveIntensity = isOn ? brightness * 3 : 0;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* LED dome (translucent epoxy) */}
      <mesh position={[0, bodyHeight / 2 + 0.001, 0]} castShadow>
        <sphereGeometry args={[bodyRadius, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.85}
          roughness={0.05}
          metalness={0}
          transmission={isOn ? 0 : 0.3}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* LED body cylinder */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 32]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={emissiveIntensity * 0.5}
        />
      </mesh>

      {/* Flat bottom rim with flat edge indicator */}
      <mesh position={[0, -bodyHeight / 2 + 0.0003, 0]}>
        <cylinderGeometry args={[bodyRadius + 0.0005, bodyRadius + 0.0005, 0.0006, 32]} />
        <meshStandardMaterial color="#555555" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Cathode indicator (flat side) */}
      <mesh position={[-bodyRadius, -bodyHeight / 2 + 0.0003, 0]}>
        <boxGeometry args={[0.0008, 0.0006, bodyRadius * 1.5]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Anode leg (longer) */}
      <mesh position={[0.001, -bodyHeight / 2 - legLength / 2, 0]}>
        <cylinderGeometry args={[0.0003, 0.0003, legLength, 8]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Cathode leg (shorter) */}
      <mesh position={[-0.001, -bodyHeight / 2 - (legLength - 0.002) / 2, 0]}>
        <cylinderGeometry args={[0.0003, 0.0003, legLength - 0.002, 8]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Glow effect when on */}
      {isOn && (
        <>
          <mesh ref={glowRef} position={[0, bodyHeight / 2, 0]}>
            <sphereGeometry args={[bodyRadius * 2.5, 16, 16]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.2 * brightness}
              side={THREE.BackSide}
            />
          </mesh>
          <pointLight
            color={color}
            intensity={brightness * 0.5}
            distance={0.15}
            decay={2}
            position={[0, bodyHeight / 2, 0]}
          />
        </>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -bodyHeight / 2 - 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[bodyRadius + 0.002, bodyRadius + 0.003, 32]} />
          <meshBasicMaterial color="#3b82f6" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// Realistic Resistor 3D
function Resistor3D({
  position,
  rotation,
  value = 220,
  isSelected = false,
  onClick,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  value?: number;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  // Calculate color bands based on resistance value
  const getColorBands = (resistance: number) => {
    const colors: Record<number, string> = {
      0: '#1a1a1a', // Black
      1: '#8b4513', // Brown
      2: '#ef4444', // Red
      3: '#f97316', // Orange
      4: '#eab308', // Yellow
      5: '#22c55e', // Green
      6: '#3b82f6', // Blue
      7: '#a855f7', // Violet
      8: '#6b7280', // Gray
      9: '#f8fafc', // White
    };

    const str = resistance.toString();
    const digits = str.replace(/0+$/, '');
    const zeros = str.length - digits.length;

    const band1 = colors[parseInt(digits[0]) || 0];
    const band2 = colors[parseInt(digits[1]) || 0];
    const band3 = colors[zeros] || colors[0];

    return [band1, band2, band3, '#d4af37']; // Gold tolerance band
  };

  const bands = getColorBands(value);
  const bodyLength = 0.006;
  const bodyRadius = 0.0012;
  const legLength = 0.008;

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Resistor body (ceramic) */}
      <mesh castShadow>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyLength, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d4b896" roughness={0.8} />
      </mesh>

      {/* Color bands */}
      {bands.map((color, i) => (
        <mesh key={i} position={[-bodyLength / 2 + 0.001 + i * 0.0012, 0, 0]}>
          <cylinderGeometry args={[bodyRadius + 0.0001, bodyRadius + 0.0001, 0.0006, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}

      {/* Wire leads */}
      <mesh position={[-bodyLength / 2 - legLength / 2, 0, 0]}>
        <cylinderGeometry args={[0.0002, 0.0002, legLength, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[bodyLength / 2 + legLength / 2, 0, 0]}>
        <cylinderGeometry args={[0.0002, 0.0002, legLength, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Selection indicator */}
      {isSelected && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[bodyRadius + 0.002, 0.0005, 8, 32]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
      )}
    </group>
  );
}

// Breadboard 3D
function Breadboard3D({
  position,
  rotation,
  size = 'half',
  isSelected = false,
  onClick,
  onHoleClick,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size?: 'half' | 'mini';
  isSelected?: boolean;
  onClick?: () => void;
  onHoleClick?: (row: number, col: number, worldPos: [number, number, number]) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Dimensions
  const width = size === 'half' ? 0.083 : 0.046;
  const height = size === 'half' ? 0.055 : 0.035;
  const thickness = 0.0085;

  const cols = size === 'half' ? 30 : 17;
  const rows = 10;
  const holeSpacing = 0.00254; // 2.54mm standard

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, thickness, height]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* Center groove */}
      <mesh position={[0, thickness / 2, 0]}>
        <boxGeometry args={[width - 0.004, 0.001, 0.003]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>

      {/* Power rails (red and blue lines) */}
      {size === 'half' && (
        <>
          {/* Top power rail */}
          <mesh position={[0, thickness / 2 + 0.0001, -height / 2 + 0.006]}>
            <boxGeometry args={[width - 0.006, 0.0002, 0.001]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, thickness / 2 + 0.0001, -height / 2 + 0.009]}>
            <boxGeometry args={[width - 0.006, 0.0002, 0.001]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>

          {/* Bottom power rail */}
          <mesh position={[0, thickness / 2 + 0.0001, height / 2 - 0.006]}>
            <boxGeometry args={[width - 0.006, 0.0002, 0.001]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, thickness / 2 + 0.0001, height / 2 - 0.009]}>
            <boxGeometry args={[width - 0.006, 0.0002, 0.001]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
        </>
      )}

      {/* Holes - simplified for performance */}
      {/* Top section (a-e rows) */}
      {Array.from({ length: cols }).map((_, col) => (
        <group key={`top-${col}`}>
          {Array.from({ length: 5 }).map((_, row) => (
            <mesh
              key={`hole-top-${col}-${row}`}
              position={[
                -width / 2 + 0.006 + col * holeSpacing,
                thickness / 2 + 0.0001,
                -0.008 + row * holeSpacing,
              ]}
            >
              <cylinderGeometry args={[0.0004, 0.0004, 0.001, 8]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Bottom section (f-j rows) */}
      {Array.from({ length: cols }).map((_, col) => (
        <group key={`bottom-${col}`}>
          {Array.from({ length: 5 }).map((_, row) => (
            <mesh
              key={`hole-bottom-${col}-${row}`}
              position={[
                -width / 2 + 0.006 + col * holeSpacing,
                thickness / 2 + 0.0001,
                0.008 + row * holeSpacing,
              ]}
            >
              <cylinderGeometry args={[0.0004, 0.0004, 0.001, 8]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Row labels */}
      {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((label, i) => (
        <Html
          key={label}
          position={[
            -width / 2 + 0.002,
            thickness / 2 + 0.001,
            i < 5 ? -0.008 + i * holeSpacing : 0.008 + (i - 5) * holeSpacing,
          ]}
          center
          style={{
            fontSize: '2px',
            color: '#666',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {label}
        </Html>
      ))}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -thickness / 2 - 0.001, 0]}>
          <boxGeometry args={[width + 0.004, 0.001, height + 0.004]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// Push Button 3D
function PushButton3D({
  position,
  rotation,
  isPressed = false,
  isSelected = false,
  onClick,
  onPress,
  onRelease,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  isPressed?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onPress?: () => void;
  onRelease?: () => void;
}) {
  const bodySize = 0.006;
  const buttonOffset = isPressed ? 0.0005 : 0.001;

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPress?.();
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        onRelease?.();
      }}
    >
      {/* Button body (black plastic) */}
      <mesh castShadow>
        <boxGeometry args={[bodySize, 0.003, bodySize]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Button cap (colored) */}
      <mesh position={[0, 0.0015 + buttonOffset, 0]} castShadow>
        <cylinderGeometry args={[0.0018, 0.002, 0.002, 16]} />
        <meshStandardMaterial
          color={isPressed ? '#666666' : '#888888'}
          roughness={0.6}
        />
      </mesh>

      {/* Legs */}
      {[[-0.002, -0.002], [0.002, -0.002], [-0.002, 0.002], [0.002, 0.002]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.003, z]}>
          <boxGeometry args={[0.0006, 0.004, 0.0006]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.004, 0.0045, 32]} />
          <meshBasicMaterial color="#3b82f6" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// Wire 3D component
function Wire3D({
  points,
  color = '#ef4444',
  isSelected = false,
  onClick,
}: {
  points: [number, number, number][];
  color?: string;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  if (points.length < 2) return null;

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      <Line
        points={points}
        color={isSelected ? '#3b82f6' : color}
        lineWidth={isSelected ? 3 : 2}
      />
      {/* End points */}
      {[points[0], points[points.length - 1]].map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.001, 8, 8]} />
          <meshStandardMaterial color={color} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// MAIN CIRCUIT LAB COMPONENT
// ============================================

function CircuitScene({
  components,
  wires,
  selectedId,
  onSelectComponent,
  onPinClick,
  highlightedPin,
  showGrid,
}: {
  components: CircuitComponent[];
  wires: Wire[];
  selectedId: string | null;
  onSelectComponent: (id: string | null) => void;
  onPinClick: (componentId: string, pinId: string, worldPos: [number, number, number]) => void;
  highlightedPin?: { componentId: string; pinId: string };
  showGrid: boolean;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0.15, 0.15, 0.15]} fov={50} />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={0.05}
        maxDistance={0.5}
        maxPolarAngle={Math.PI / 2.1}
        dampingFactor={0.05}
        enableDamping
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <hemisphereLight args={['#87ceeb', '#3d3d3d', 0.3]} />

      <Environment preset="studio" />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.9} />
      </mesh>

      {/* Grid */}
      {showGrid && (
        <Grid
          position={[0, 0, 0]}
          args={[0.5, 0.5]}
          cellSize={0.01}
          cellThickness={0.5}
          cellColor="#404050"
          sectionSize={0.05}
          sectionThickness={1}
          sectionColor="#505060"
          fadeDistance={0.5}
          fadeStrength={1}
        />
      )}

      {/* Render components */}
      {components.map((component) => {
        const isSelected = selectedId === component.id;

        switch (component.type) {
          case 'arduino_uno':
            return (
              <ArduinoUno3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                isSelected={isSelected}
                onClick={() => onSelectComponent(component.id)}
                onPinClick={(pinId, worldPos) => onPinClick(component.id, pinId, worldPos)}
                highlightedPin={highlightedPin?.componentId === component.id ? highlightedPin.pinId : undefined}
              />
            );
          case 'breadboard_half':
          case 'breadboard_mini':
            return (
              <Breadboard3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                size={component.type === 'breadboard_half' ? 'half' : 'mini'}
                isSelected={isSelected}
                onClick={() => onSelectComponent(component.id)}
              />
            );
          case 'led_red':
          case 'led_green':
          case 'led_blue':
          case 'led_yellow':
          case 'led_white':
            const ledColors: Record<string, string> = {
              led_red: '#ff0000',
              led_green: '#00ff00',
              led_blue: '#0066ff',
              led_yellow: '#ffff00',
              led_white: '#ffffff',
            };
            return (
              <LED3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                color={ledColors[component.type]}
                isOn={component.properties?.isOn || false}
                brightness={component.properties?.brightness || 1}
                isSelected={isSelected}
                onClick={() => onSelectComponent(component.id)}
              />
            );
          case 'resistor':
            return (
              <Resistor3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                value={component.properties?.value || 220}
                isSelected={isSelected}
                onClick={() => onSelectComponent(component.id)}
              />
            );
          case 'button':
            return (
              <PushButton3D
                key={component.id}
                position={component.position}
                rotation={component.rotation}
                isPressed={component.properties?.isPressed || false}
                isSelected={isSelected}
                onClick={() => onSelectComponent(component.id)}
              />
            );
          default:
            return null;
        }
      })}

      {/* Render wires */}
      {wires.map((wire) => (
        <Wire3D
          key={wire.id}
          points={wire.points}
          color={wire.color}
          isSelected={selectedId === wire.id}
          onClick={() => onSelectComponent(wire.id)}
        />
      ))}

      {/* Click on empty space to deselect */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.002, 0]}
        onClick={() => onSelectComponent(null)}
        visible={false}
      >
        <planeGeometry args={[2, 2]} />
      </mesh>
    </>
  );
}

export function TinkercadCircuitLab() {
  // State
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [wireColor, setWireColor] = useState('#ef4444');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [serialOutput, setSerialOutput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [activePanel, setActivePanel] = useState<'components' | 'code' | 'properties'>('components');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Microcontrollers', 'Basic Components']);
  const [wiringStart, setWiringStart] = useState<{ componentId: string; pinId: string; worldPos: [number, number, number] } | null>(null);

  // Refs
  const idCounterRef = useRef(0);

  // Generate unique ID
  const generateId = useCallback(() => {
    idCounterRef.current += 1;
    return `component_${idCounterRef.current}_${Date.now()}`;
  }, []);

  // Add component
  const handleAddComponent = useCallback((type: ComponentType) => {
    const id = generateId();
    const offset = components.length * 0.02;

    let position: [number, number, number] = [offset, 0, offset];
    let properties: Record<string, any> = {};

    switch (type) {
      case 'arduino_uno':
        position = [-0.05, 0, 0];
        break;
      case 'breadboard_half':
        position = [0.05, 0, 0];
        break;
      case 'breadboard_mini':
        position = [0.05, 0, 0.03];
        break;
      case 'led_red':
      case 'led_green':
      case 'led_blue':
      case 'led_yellow':
      case 'led_white':
        position = [0.02 + offset, 0.01, 0.02];
        properties = { isOn: false, brightness: 1 };
        break;
      case 'resistor':
        position = [0.03 + offset, 0.005, 0.02];
        properties = { value: 220 };
        break;
      case 'button':
        position = [0.04 + offset, 0.005, 0.02];
        properties = { isPressed: false };
        break;
    }

    const newComponent: CircuitComponent = {
      id,
      type,
      position,
      rotation: [0, 0, 0],
      properties,
      pins: [],
    };

    setComponents(prev => [...prev, newComponent]);
    setSelectedId(id);
  }, [components.length, generateId]);

  // Delete selected
  const handleDelete = useCallback(() => {
    if (!selectedId) return;

    // Remove component
    setComponents(prev => prev.filter(c => c.id !== selectedId));

    // Remove wires connected to this component
    setWires(prev => prev.filter(w =>
      w.startComponentId !== selectedId && w.endComponentId !== selectedId
    ));

    setSelectedId(null);
  }, [selectedId]);

  // Handle pin click for wiring
  const handlePinClick = useCallback((componentId: string, pinId: string, worldPos: [number, number, number]) => {
    if (toolMode !== 'wire') return;

    if (!wiringStart) {
      // Start wiring
      setWiringStart({ componentId, pinId, worldPos });
    } else {
      // Complete wiring
      if (wiringStart.componentId !== componentId || wiringStart.pinId !== pinId) {
        const newWire: Wire = {
          id: `wire_${generateId()}`,
          startComponentId: wiringStart.componentId,
          startPinId: wiringStart.pinId,
          endComponentId: componentId,
          endPinId: pinId,
          color: wireColor,
          points: [wiringStart.worldPos, worldPos],
        };
        setWires(prev => [...prev, newWire]);
      }
      setWiringStart(null);
    }
  }, [toolMode, wiringStart, wireColor, generateId]);

  // Simulation controls
  const handleRun = useCallback(() => {
    setIsSimulating(true);
    setSerialOutput('시뮬레이션 시작...\n');

    // Simple simulation - toggle LED on pin 13
    const ledComponent = components.find(c => c.type.startsWith('led_'));
    if (ledComponent) {
      let isOn = false;
      const interval = setInterval(() => {
        isOn = !isOn;
        setComponents(prev => prev.map(c =>
          c.id === ledComponent.id
            ? { ...c, properties: { ...c.properties, isOn } }
            : c
        ));
        setSerialOutput(prev => prev + `LED ${isOn ? 'ON' : 'OFF'}\n`);
      }, 1000);

      // Store interval ID for cleanup
      (window as any).__simInterval = interval;
    }
  }, [components]);

  const handleStop = useCallback(() => {
    setIsSimulating(false);
    if ((window as any).__simInterval) {
      clearInterval((window as any).__simInterval);
    }
    setSerialOutput(prev => prev + '시뮬레이션 정지\n');
  }, []);

  const handleReset = useCallback(() => {
    handleStop();
    setSerialOutput('');
    setComponents(prev => prev.map(c => ({
      ...c,
      properties: { ...c.properties, isOn: false, isPressed: false },
    })));
  }, [handleStop]);

  // Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          handleDelete();
        }
      }
      if (e.key === 'Escape') {
        setWiringStart(null);
        setSelectedId(null);
      }
      if (e.key === 'v') setToolMode('select');
      if (e.key === 'm') setToolMode('move');
      if (e.key === 'r') setToolMode('rotate');
      if (e.key === 'w') setToolMode('wire');
      if (e.key === 'd') setToolMode('delete');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDelete]);

  return (
    <div className="h-screen flex flex-col bg-[#1e1e2e] text-gray-200 overflow-hidden">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 bg-[#181825] border-b border-[#313244]">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Home className="w-4 h-4 mr-2" />
              홈
            </Button>
          </Link>
          <div className="h-6 w-px bg-[#313244]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Circuit Lab</h1>
              <p className="text-[10px] text-gray-500">3D 아두이노 시뮬레이터</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation controls */}
          <div className="flex items-center gap-1 bg-[#313244] rounded-lg p-1">
            {isSimulating ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStop}
                className="h-7 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/20"
              >
                <Square className="w-3.5 h-3.5 mr-1" />
                정지
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRun}
                className="h-7 px-3 text-green-400 hover:text-green-300 hover:bg-green-500/20"
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                시작
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 px-2 text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#313244] rounded-lg">
            <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs text-gray-400">
              {isSimulating ? '실행 중' : '대기'}
            </span>
          </div>

          {/* View controls */}
          <div className="flex items-center gap-1 bg-[#313244] rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className={`h-7 w-7 p-0 ${showGrid ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Component Library */}
        <div className="w-64 bg-[#181825] border-r border-[#313244] flex flex-col">
          {/* Panel tabs */}
          <div className="flex border-b border-[#313244]">
            <button
              onClick={() => setActivePanel('components')}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                activePanel === 'components'
                  ? 'text-white bg-[#313244]'
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
                  ? 'text-white bg-[#313244]'
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
                <div className="p-2 border-b border-[#313244]">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="부품 검색..."
                      className="w-full pl-8 pr-3 py-1.5 bg-[#313244] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-[#313244] transition-colors"
                      >
                        {expandedCategories.includes(category.category) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <category.icon className="w-4 h-4 text-blue-400" />
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
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#313244] transition-colors group"
                            >
                              <div className="w-6 h-6 rounded bg-[#313244] flex items-center justify-center group-hover:bg-[#414151]">
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
          <div className="h-10 flex items-center gap-1 px-2 bg-[#181825] border-b border-[#313244]">
            {/* Tool buttons */}
            {[
              { mode: 'select' as ToolMode, icon: MousePointer, label: '선택 (V)' },
              { mode: 'move' as ToolMode, icon: Move, label: '이동 (M)' },
              { mode: 'rotate' as ToolMode, icon: RotateCw, label: '회전 (R)' },
              { mode: 'wire' as ToolMode, icon: Cable, label: '와이어 (W)' },
              { mode: 'delete' as ToolMode, icon: Trash2, label: '삭제 (D)' },
            ].map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant="ghost"
                size="sm"
                onClick={() => setToolMode(mode)}
                className={`h-7 px-2 ${
                  toolMode === mode
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}

            <div className="h-5 w-px bg-[#313244] mx-1" />

            {/* Wire colors */}
            {toolMode === 'wire' && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 mr-1">와이어 색상:</span>
                {WIRE_COLORS.map((wc) => (
                  <button
                    key={wc.color}
                    onClick={() => setWireColor(wc.color)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      wireColor === wc.color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: wc.color }}
                    title={`${wc.name} (${wc.use})`}
                  />
                ))}
              </div>
            )}

            {/* Wiring indicator */}
            {wiringStart && (
              <Badge className="ml-2 bg-yellow-500/20 text-yellow-400">
                <Zap className="w-3 h-3 mr-1" />
                와이어 연결 중...
              </Badge>
            )}

            {/* Component count */}
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
              <span>{components.length} 부품</span>
              <span>•</span>
              <span>{wires.length} 와이어</span>
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
            >
              <color attach="background" args={['#1e1e2e']} />
              <fog attach="fog" args={['#1e1e2e', 0.3, 1]} />
              <Suspense fallback={null}>
                <CircuitScene
                  components={components}
                  wires={wires}
                  selectedId={selectedId}
                  onSelectComponent={setSelectedId}
                  onPinClick={handlePinClick}
                  highlightedPin={wiringStart ? { componentId: wiringStart.componentId, pinId: wiringStart.pinId } : undefined}
                  showGrid={showGrid}
                />
              </Suspense>
            </Canvas>

            {/* Canvas overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <Badge variant="secondary" className="bg-black/50 text-gray-300 backdrop-blur-sm">
                <Zap className="w-3 h-3 mr-1 text-yellow-400" />
                {components.length} 부품
              </Badge>
            </div>

            <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
              드래그: 회전 • 스크롤: 확대/축소
            </div>
          </div>
        </div>

        {/* Right Panel - Serial Monitor */}
        <div className="w-72 bg-[#181825] border-l border-[#313244] flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#313244]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Serial Monitor</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSerialOutput('')}
              className="h-6 px-2 text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex-1 p-2 font-mono text-xs text-green-400 bg-[#0d0d14] overflow-auto whitespace-pre-wrap">
            {serialOutput || '시리얼 출력이 여기에 표시됩니다...\n\n시뮬레이션을 시작하면 Serial.print() 출력을 볼 수 있습니다.'}
          </div>

          {/* Serial input */}
          <div className="p-2 border-t border-[#313244]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="메시지 입력..."
                className="flex-1 px-2 py-1 bg-[#313244] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={!isSimulating}
              />
              <Button
                size="sm"
                className="px-3"
                disabled={!isSimulating}
              >
                전송
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <footer className="h-6 flex items-center justify-between px-3 bg-[#181825] border-t border-[#313244] text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Arduino UNO R3</span>
          <span>•</span>
          <span>ATmega328P @ 16MHz</span>
          <span>•</span>
          <span>Flash: 32KB | SRAM: 2KB</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{isSimulating ? '시뮬레이션 활성' : '대기 중'}</span>
          <Badge variant="secondary" className="h-4 text-[10px] bg-blue-500/20 text-blue-400">
            v2.0
          </Badge>
        </div>
      </footer>
    </div>
  );
}

export default TinkercadCircuitLab;
