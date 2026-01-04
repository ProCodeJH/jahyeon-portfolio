/**
 * GLTF Model Loader Component
 * Loads and displays GLTF/GLB 3D models with fallback support
 */

import { useRef, useEffect, Suspense, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface GLTFModelProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  onClick?: () => void;
  isSelected?: boolean;
  animate?: boolean;
  fallback?: React.ReactNode;
}

// Model paths - these should match files in /client/public/models/
export const MODEL_PATHS = {
  arduinoUno: '/models/arduino_uno.gltf',
  ultrasonicSensor: '/models/ultrasonic_sensor.gltf',
  dht22Sensor: '/models/dht22_sensor.gltf',
};

// Check if a model exists (async)
export async function checkModelExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Safe GLTF Loader with error handling
export function SafeGLTFModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onClick,
  isSelected = false,
  animate = false,
  fallback,
}: GLTFModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [loadError, setLoadError] = useState(false);
  const [gltf, setGltf] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (result) => {
        setGltf(result.scene.clone());
        setLoadError(false);
      },
      undefined,
      (error) => {
        console.warn(`Failed to load GLTF model: ${url}`, error);
        setLoadError(true);
      }
    );
  }, [url]);

  // Animation
  useFrame((state) => {
    if (groupRef.current && animate && !loadError) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const scaleArray = Array.isArray(scale) ? scale : [scale, scale, scale];

  // Show fallback if model failed to load
  if (loadError && fallback) {
    return <>{fallback}</>;
  }

  // Show nothing while loading
  if (!gltf && !loadError) {
    return null;
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scaleArray as [number, number, number]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {gltf && <primitive object={gltf} />}
      {isSelected && (
        <mesh>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshBasicMaterial color="#00ff00" wireframe transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// Original useGLTF-based loader (throws on error)
export function GLTFModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onClick,
  isSelected = false,
  animate = false,
}: GLTFModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, groupRef);

  // Clone the scene to avoid sharing materials
  const clonedScene = scene.clone();

  // Play animations if available
  useEffect(() => {
    if (animate && actions) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.play();
      }
    }
  }, [animate, actions]);

  // Hover animation
  useFrame((state) => {
    if (groupRef.current && animate) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const scaleArray = Array.isArray(scale) ? scale : [scale, scale, scale];

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scaleArray as [number, number, number]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <primitive object={clonedScene} />
      {isSelected && (
        <mesh>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshBasicMaterial color="#00ff00" wireframe transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// Preload models
export function preloadModels(urls: string[]) {
  urls.forEach(url => {
    try {
      useGLTF.preload(url);
    } catch (e) {
      console.warn(`Failed to preload model: ${url}`);
    }
  });
}

// Fallback component when model fails to load
export function ModelFallback({ type }: { type: string }) {
  return (
    <mesh>
      <boxGeometry args={[0.02, 0.01, 0.02]} />
      <meshStandardMaterial color="#666666" />
    </mesh>
  );
}

// Arduino Uno with GLTF support
export function ArduinoUnoGLTF({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.001,
  onClick,
  isSelected = false,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  return (
    <SafeGLTFModel
      url={MODEL_PATHS.arduinoUno}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      isSelected={isSelected}
    />
  );
}

// Ultrasonic Sensor with GLTF support
export function UltrasonicSensorGLTF({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.001,
  onClick,
  isSelected = false,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  return (
    <SafeGLTFModel
      url={MODEL_PATHS.ultrasonicSensor}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      isSelected={isSelected}
    />
  );
}

// DHT22 Sensor with GLTF support
export function DHT22SensorGLTF({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.001,
  onClick,
  isSelected = false,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  return (
    <SafeGLTFModel
      url={MODEL_PATHS.dht22Sensor}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      isSelected={isSelected}
    />
  );
}

export default GLTFModel;
