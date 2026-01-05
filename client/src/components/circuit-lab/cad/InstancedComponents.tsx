/**
 * CAD-Grade Instanced Component Rendering
 *
 * ARCHITECTURE RULES:
 * - ONE InstancedMesh per component TYPE
 * - Components are DATA, InstancedMesh renders from data
 * - NO individual mesh per component
 * - Selection via color attribute, NOT postprocessing
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  useCircuitLabStore,
  ComponentData,
  GRID_UNIT,
  LEDProperties,
  ButtonProperties
} from '@/store/circuit-lab';

// ============================================
// GEOMETRY CACHE (Procedural, no GLTF)
// ============================================

const geometryCache = new Map<string, THREE.BufferGeometry>();

function getOrCreateGeometry(type: string, createFn: () => THREE.BufferGeometry): THREE.BufferGeometry {
  if (!geometryCache.has(type)) {
    geometryCache.set(type, createFn());
  }
  return geometryCache.get(type)!;
}

// LED Geometry - Procedural
function createLEDGeometry(): THREE.BufferGeometry {
  const group = new THREE.Group();

  // Dome (hemisphere)
  const domeGeom = new THREE.SphereGeometry(0.0025, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  domeGeom.translate(0, 0.003, 0);

  // Body (cylinder)
  const bodyGeom = new THREE.CylinderGeometry(0.0025, 0.0025, 0.004, 16);
  bodyGeom.translate(0, 0.001, 0);

  // Merge geometries
  const merged = new THREE.BufferGeometry();
  const geometries = [domeGeom, bodyGeom];
  merged.copy(mergeBufferGeometries(geometries));

  return merged;
}

// Resistor Geometry - Procedural
function createResistorGeometry(): THREE.BufferGeometry {
  const bodyGeom = new THREE.CylinderGeometry(0.0012, 0.0012, 0.006, 12);
  bodyGeom.rotateZ(Math.PI / 2);
  return bodyGeom;
}

// Button Geometry - Procedural
function createButtonGeometry(): THREE.BufferGeometry {
  const baseGeom = new THREE.BoxGeometry(0.006, 0.003, 0.006);
  baseGeom.translate(0, 0.0015, 0);

  const capGeom = new THREE.CylinderGeometry(0.0018, 0.002, 0.002, 16);
  capGeom.translate(0, 0.004, 0);

  return mergeBufferGeometries([baseGeom, capGeom]);
}

// Arduino Board Geometry - Simplified procedural
function createArduinoGeometry(): THREE.BufferGeometry {
  // PCB Board
  const pcbGeom = new THREE.BoxGeometry(0.0686, 0.0016, 0.0534);

  // USB Connector
  const usbGeom = new THREE.BoxGeometry(0.012, 0.011, 0.016);
  usbGeom.translate(0, 0.007, -0.0267 + 0.008);

  // ATmega chip
  const chipGeom = new THREE.BoxGeometry(0.008, 0.003, 0.035);
  chipGeom.translate(0.005, 0.003, 0.005);

  return mergeBufferGeometries([pcbGeom, usbGeom, chipGeom]);
}

// Ultrasonic Sensor Geometry
function createUltrasonicGeometry(): THREE.BufferGeometry {
  // PCB
  const pcbGeom = new THREE.BoxGeometry(0.045, 0.0015, 0.02);

  // Transducers (two cylinders)
  const trans1 = new THREE.CylinderGeometry(0.008, 0.008, 0.012, 16);
  trans1.rotateX(Math.PI / 2);
  trans1.translate(-0.013, 0.007, -0.006);

  const trans2 = new THREE.CylinderGeometry(0.008, 0.008, 0.012, 16);
  trans2.rotateX(Math.PI / 2);
  trans2.translate(0.013, 0.007, -0.006);

  return mergeBufferGeometries([pcbGeom, trans1, trans2]);
}

// DHT22 Sensor Geometry
function createDHT22Geometry(): THREE.BufferGeometry {
  // Main body
  const bodyGeom = new THREE.BoxGeometry(0.015, 0.007, 0.025);
  bodyGeom.translate(0, 0.0035, 0);

  // Vent holes (simplified as single box)
  const ventGeom = new THREE.BoxGeometry(0.012, 0.001, 0.015);
  ventGeom.translate(0, 0.007, 0);

  return mergeBufferGeometries([bodyGeom, ventGeom]);
}

// Breadboard Geometry
function createBreadboardGeometry(size: 'full' | 'half' | 'mini'): THREE.BufferGeometry {
  const dimensions = {
    full: [0.165, 0.0085, 0.055],
    half: [0.083, 0.0085, 0.055],
    mini: [0.046, 0.0085, 0.035],
  };

  const [width, height, depth] = [
    dimensions[size]?.[0] || dimensions.half[0],
    dimensions[size]?.[1] || dimensions.half[1],
    dimensions[size]?.[2] || dimensions.half[2],
  ];
  return new THREE.BoxGeometry(width, height, depth);
}

// Helper: Merge buffer geometries
function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry();

  let totalVertices = 0;
  let totalIndices = 0;

  geometries.forEach(geom => {
    totalVertices += geom.attributes.position.count;
    if (geom.index) {
      totalIndices += geom.index.count;
    }
  });

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const indices: number[] = [];

  let vertexOffset = 0;
  let indexOffset = 0;

  geometries.forEach(geom => {
    const pos = geom.attributes.position;
    const norm = geom.attributes.normal;

    for (let i = 0; i < pos.count; i++) {
      positions[(vertexOffset + i) * 3] = pos.getX(i);
      positions[(vertexOffset + i) * 3 + 1] = pos.getY(i);
      positions[(vertexOffset + i) * 3 + 2] = pos.getZ(i);

      if (norm) {
        normals[(vertexOffset + i) * 3] = norm.getX(i);
        normals[(vertexOffset + i) * 3 + 1] = norm.getY(i);
        normals[(vertexOffset + i) * 3 + 2] = norm.getZ(i);
      }
    }

    if (geom.index) {
      for (let i = 0; i < geom.index.count; i++) {
        indices.push(geom.index.getX(i) + vertexOffset);
      }
    }

    vertexOffset += pos.count;
  });

  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  if (indices.length > 0) {
    merged.setIndex(indices);
  }

  return merged;
}

// ============================================
// MATERIAL CACHE
// ============================================

const materialCache = new Map<string, THREE.Material>();

function getOrCreateMaterial(key: string, createFn: () => THREE.Material): THREE.Material {
  if (!materialCache.has(key)) {
    materialCache.set(key, createFn());
  }
  return materialCache.get(key)!;
}

// ============================================
// INSTANCED COMPONENT RENDERERS
// ============================================

interface InstancedRendererProps {
  components: ComponentData[];
}

// LED Instanced Renderer
export function LEDInstancedRenderer({ components }: InstancedRendererProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const ledComponents = useMemo(() =>
    components.filter(c => c.type.startsWith('led_')),
    [components]
  );

  const geometry = useMemo(() => createLEDGeometry(), []);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.1,
    metalness: 0,
    transparent: true,
    opacity: 0.9,
  }), []);

  // Color mapping for LED types
  const colorMap: Record<string, THREE.Color> = useMemo(() => ({
    led_red: new THREE.Color('#ff0000'),
    led_green: new THREE.Color('#00ff00'),
    led_blue: new THREE.Color('#0066ff'),
    led_yellow: new THREE.Color('#ffff00'),
    led_white: new THREE.Color('#ffffff'),
  }), []);

  useEffect(() => {
    if (!meshRef.current || ledComponents.length === 0) return;

    ledComponents.forEach((comp, i) => {
      // Position from grid coordinates
      dummy.position.set(
        comp.gridX * GRID_UNIT,
        comp.gridY * GRID_UNIT + 0.002,
        comp.gridZ * GRID_UNIT
      );
      dummy.rotation.y = comp.rotation * (Math.PI / 2);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // Set color based on type and state
      const baseColor = colorMap[comp.type] || colorMap.led_red;
      const props = comp.properties as LEDProperties;
      const isOn = props.isOn;
      const brightness = props.brightness || 1;

      const color = isOn
        ? baseColor.clone().multiplyScalar(brightness)
        : baseColor.clone().multiplyScalar(0.3);

      meshRef.current!.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [ledComponents, dummy, colorMap]);

  if (ledComponents.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, ledComponents.length]}
      castShadow
      receiveShadow
    />
  );
}

// Resistor Instanced Renderer
export function ResistorInstancedRenderer({ components }: InstancedRendererProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const resistorComponents = useMemo(() =>
    components.filter(c => c.type === 'resistor'),
    [components]
  );

  const geometry = useMemo(() => createResistorGeometry(), []);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#d4b896',
    roughness: 0.8,
  }), []);

  useEffect(() => {
    if (!meshRef.current || resistorComponents.length === 0) return;

    resistorComponents.forEach((comp, i) => {
      dummy.position.set(
        comp.gridX * GRID_UNIT,
        comp.gridY * GRID_UNIT + 0.003,
        comp.gridZ * GRID_UNIT
      );
      dummy.rotation.y = comp.rotation * (Math.PI / 2);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [resistorComponents, dummy]);

  if (resistorComponents.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, resistorComponents.length]}
      castShadow
    />
  );
}

// Button Instanced Renderer
export function ButtonInstancedRenderer({ components }: InstancedRendererProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const buttonComponents = useMemo(() =>
    components.filter(c => c.type === 'button'),
    [components]
  );

  const geometry = useMemo(() => createButtonGeometry(), []);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#333333',
    roughness: 0.6,
  }), []);

  useEffect(() => {
    if (!meshRef.current || buttonComponents.length === 0) return;

    buttonComponents.forEach((comp, i) => {
      const props = comp.properties as ButtonProperties;
      const yOffset = props.isPressed ? -0.0005 : 0;
      dummy.position.set(
        comp.gridX * GRID_UNIT,
        comp.gridY * GRID_UNIT + yOffset,
        comp.gridZ * GRID_UNIT
      );
      dummy.rotation.y = comp.rotation * (Math.PI / 2);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [buttonComponents, dummy]);

  if (buttonComponents.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, buttonComponents.length]}
      castShadow
    />
  );
}

// Arduino Instanced Renderer
export function ArduinoInstancedRenderer({ components }: InstancedRendererProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const arduinoComponents = useMemo(() =>
    components.filter(c => c.type === 'arduino_uno'),
    [components]
  );

  const geometry = useMemo(() => createArduinoGeometry(), []);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1d6b45',
    roughness: 0.7,
    metalness: 0.1,
  }), []);

  useEffect(() => {
    if (!meshRef.current || arduinoComponents.length === 0) return;

    arduinoComponents.forEach((comp, i) => {
      dummy.position.set(
        comp.gridX * GRID_UNIT,
        comp.gridY * GRID_UNIT,
        comp.gridZ * GRID_UNIT
      );
      dummy.rotation.y = comp.rotation * (Math.PI / 2);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [arduinoComponents, dummy]);

  if (arduinoComponents.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, arduinoComponents.length]}
      castShadow
      receiveShadow
    />
  );
}

// Ultrasonic Sensor Instanced Renderer
export function UltrasonicInstancedRenderer({ components }: InstancedRendererProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const ultrasonicComponents = useMemo(() =>
    components.filter(c => c.type === 'ultrasonic'),
    [components]
  );

  const geometry = useMemo(() => createUltrasonicGeometry(), []);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1565c0',
    roughness: 0.5,
    metalness: 0.1,
  }), []);

  useEffect(() => {
    if (!meshRef.current || ultrasonicComponents.length === 0) return;

    ultrasonicComponents.forEach((comp, i) => {
      dummy.position.set(
        comp.gridX * GRID_UNIT,
        comp.gridY * GRID_UNIT,
        comp.gridZ * GRID_UNIT
      );
      dummy.rotation.y = comp.rotation * (Math.PI / 2);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [ultrasonicComponents, dummy]);

  if (ultrasonicComponents.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, ultrasonicComponents.length]}
      castShadow
    />
  );
}

// DHT22 Sensor Instanced Renderer
export function DHT22InstancedRenderer({ components }: InstancedRendererProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const dhtComponents = useMemo(() =>
    components.filter(c => c.type === 'dht22'),
    [components]
  );

  const geometry = useMemo(() => createDHT22Geometry(), []);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f5f5f5',
    roughness: 0.8,
  }), []);

  useEffect(() => {
    if (!meshRef.current || dhtComponents.length === 0) return;

    dhtComponents.forEach((comp, i) => {
      dummy.position.set(
        comp.gridX * GRID_UNIT,
        comp.gridY * GRID_UNIT,
        comp.gridZ * GRID_UNIT
      );
      dummy.rotation.y = comp.rotation * (Math.PI / 2);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [dhtComponents, dummy]);

  if (dhtComponents.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, dhtComponents.length]}
      castShadow
    />
  );
}

// Breadboard Instanced Renderer
export function BreadboardInstancedRenderer({ components }: InstancedRendererProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const breadboardComponents = useMemo(() =>
    components.filter(c => c.type.startsWith('breadboard_')),
    [components]
  );

  // Use half-size geometry as base
  const geometry = useMemo(() => createBreadboardGeometry('half'), []);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f5f5f5',
    roughness: 0.9,
  }), []);

  useEffect(() => {
    if (!meshRef.current || breadboardComponents.length === 0) return;

    breadboardComponents.forEach((comp, i) => {
      dummy.position.set(
        comp.gridX * GRID_UNIT,
        comp.gridY * GRID_UNIT,
        comp.gridZ * GRID_UNIT
      );
      dummy.rotation.y = comp.rotation * (Math.PI / 2);

      // Scale based on type
      if (comp.type === 'breadboard_mini') {
        dummy.scale.set(0.55, 1, 0.64);
      } else if (comp.type === 'breadboard_full') {
        dummy.scale.set(2, 1, 1);
      } else {
        dummy.scale.set(1, 1, 1);
      }

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [breadboardComponents, dummy]);

  if (breadboardComponents.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, breadboardComponents.length]}
      receiveShadow
    />
  );
}

// ============================================
// SELECTION HIGHLIGHT RENDERER
// ============================================

export function SelectionHighlightRenderer({ components }: InstancedRendererProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const selectedComponents = useMemo(() =>
    components.filter(c => c.isSelected),
    [components]
  );

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 0.001, 1), []);

  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#3b82f6',
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  }), []);

  // Component bounding box sizes
  const getSizeForType = (type: string): [number, number] => {
    const sizes: Record<string, [number, number]> = {
      arduino_uno: [0.07, 0.055],
      breadboard_half: [0.085, 0.057],
      breadboard_mini: [0.048, 0.037],
      led_red: [0.008, 0.008],
      led_green: [0.008, 0.008],
      led_blue: [0.008, 0.008],
      led_yellow: [0.008, 0.008],
      led_white: [0.008, 0.008],
      resistor: [0.015, 0.004],
      button: [0.008, 0.008],
      ultrasonic: [0.047, 0.022],
      dht22: [0.017, 0.027],
    };
    return sizes[type] || [0.01, 0.01];
  };

  useEffect(() => {
    if (!meshRef.current || selectedComponents.length === 0) return;

    selectedComponents.forEach((comp, i) => {
      const [width, depth] = getSizeForType(comp.type);

      dummy.position.set(
        comp.gridX * GRID_UNIT,
        comp.gridY * GRID_UNIT - 0.0005,
        comp.gridZ * GRID_UNIT
      );
      dummy.rotation.y = comp.rotation * (Math.PI / 2);
      dummy.scale.set(width + 0.004, 1, depth + 0.004);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [selectedComponents, dummy]);

  if (selectedComponents.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, Math.max(selectedComponents.length, 1)]}
    />
  );
}

// ============================================
// HOVER HIGHLIGHT RENDERER
// ============================================

export function HoverHighlightRenderer({ component }: { component: ComponentData | null }) {
  if (!component || component.isSelected) return null;

  const getSizeForType = (type: string): [number, number] => {
    const sizes: Record<string, [number, number]> = {
      arduino_uno: [0.07, 0.055],
      breadboard_half: [0.085, 0.057],
      breadboard_mini: [0.048, 0.037],
      led_red: [0.008, 0.008],
      led_green: [0.008, 0.008],
      led_blue: [0.008, 0.008],
      led_yellow: [0.008, 0.008],
      led_white: [0.008, 0.008],
      resistor: [0.015, 0.004],
      button: [0.008, 0.008],
      ultrasonic: [0.047, 0.022],
      dht22: [0.017, 0.027],
    };
    return sizes[type] || [0.01, 0.01];
  };

  const [width, depth] = getSizeForType(component.type);

  return (
    <mesh
      position={[
        component.gridX * GRID_UNIT,
        component.gridY * GRID_UNIT - 0.0003,
        component.gridZ * GRID_UNIT,
      ]}
      rotation={[0, component.rotation * (Math.PI / 2), 0]}
    >
      <boxGeometry args={[width + 0.003, 0.0008, depth + 0.003]} />
      <meshBasicMaterial
        color="#22c55e"
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </mesh>
  );
}

// ============================================
// MAIN INSTANCED SCENE RENDERER
// ============================================

export function InstancedComponentsRenderer() {
  const components = useCircuitLabStore(state => Array.from(state.components.values()));
  const hoveredId = useCircuitLabStore(state => state.hoveredId);
  const getComponentById = useCircuitLabStore(state => state.getComponentById);

  const hoveredComponent = hoveredId ? getComponentById(hoveredId) : null;

  return (
    <group name="instanced-components">
      {/* Render each component type with its own InstancedMesh */}
      <ArduinoInstancedRenderer components={components} />
      <BreadboardInstancedRenderer components={components} />
      <LEDInstancedRenderer components={components} />
      <ResistorInstancedRenderer components={components} />
      <ButtonInstancedRenderer components={components} />
      <UltrasonicInstancedRenderer components={components} />
      <DHT22InstancedRenderer components={components} />

      {/* Selection highlight (no postprocessing) */}
      <SelectionHighlightRenderer components={components} />

      {/* Hover highlight */}
      <HoverHighlightRenderer component={hoveredComponent || null} />
    </group>
  );
}
