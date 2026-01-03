/**
 * GLTF Model Loader Component
 * Loads and displays GLTF/GLB 3D models
 */

import { useRef, useEffect, Suspense } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GLTFModelProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  onClick?: () => void;
  isSelected?: boolean;
  animate?: boolean;
}

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

// Model paths
export const MODEL_PATHS = {
  arduinoUno: '/models/arduino_uno.gltf',
  ultrasonicSensor: '/models/ultrasonic_sensor.gltf',
  dht22Sensor: '/models/dht22_sensor.gltf',
};

// Fallback component when model fails to load
export function ModelFallback({ type }: { type: string }) {
  return (
    <mesh>
      <boxGeometry args={[0.02, 0.01, 0.02]} />
      <meshStandardMaterial color="#666666" />
    </mesh>
  );
}

export default GLTFModel;
