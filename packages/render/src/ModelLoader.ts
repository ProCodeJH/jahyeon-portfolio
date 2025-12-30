/**
 * 3D Model Loader
 * Loads GLTF/GLB models from various sources
 *
 * Supports:
 * - Local files (/public/models/*.glb)
 * - Remote URLs (GrabCAD, SnapEDA converted)
 * - Embedded data URIs
 */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

export interface ModelMetadata {
  id: string;
  name: string;
  source: 'grabcad' | 'snapeda' | 'local' | 'custom';
  license?: string;
  author?: string;
}

export interface LoadedModel {
  gltf: GLTF;
  scene: THREE.Group;
  metadata: ModelMetadata;
  boundingBox: THREE.Box3;
  animations?: THREE.AnimationClip[];
}

export class ModelLoader {
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private cache: Map<string, Promise<LoadedModel>>;
  private loadingManager: THREE.LoadingManager;

  constructor() {
    // Setup loading manager for progress tracking
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onProgress = (url, loaded, total) => {
      console.log(`Loading model: ${url} (${loaded}/${total})`);
    };

    // Setup GLTF loader
    this.gltfLoader = new GLTFLoader(this.loadingManager);

    // Setup Draco decoder for compressed models
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/'); // Public draco decoder
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.cache = new Map();
  }

  /**
   * Load a 3D model from URL or path
   */
  async load(url: string, metadata?: Partial<ModelMetadata>): Promise<LoadedModel> {
    // Check cache first
    const cached = this.cache.get(url);
    if (cached) {
      return cached;
    }

    // Create loading promise
    const promise = this._loadGLTF(url, metadata);
    this.cache.set(url, promise);

    return promise;
  }

  /**
   * Preload multiple models concurrently
   */
  async preload(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.load(url));
    await Promise.all(promises);
  }

  /**
   * Clear cache (for memory management)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Internal GLTF loading
   */
  private async _loadGLTF(
    url: string,
    metadata?: Partial<ModelMetadata>
  ): Promise<LoadedModel> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          // Clone the scene for reuse
          const scene = gltf.scene.clone(true);

          // Calculate bounding box
          const bbox = new THREE.Box3().setFromObject(scene);

          // Center the model
          const center = bbox.getCenter(new THREE.Vector3());
          scene.position.sub(center);

          // Ensure proper materials
          scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;

              // Enable shadows
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              // Fix materials if needed
              if (mesh.material) {
                const material = mesh.material as THREE.MeshStandardMaterial;
                if (!material.envMapIntensity) {
                  material.envMapIntensity = 1.0;
                }
              }
            }
          });

          const loaded: LoadedModel = {
            gltf,
            scene,
            metadata: {
              id: metadata?.id || url,
              name: metadata?.name || 'Unknown',
              source: metadata?.source || 'custom',
              license: metadata?.license,
              author: metadata?.author,
            },
            boundingBox: bbox,
            animations: gltf.animations,
          };

          resolve(loaded);
        },
        undefined,
        (error) => {
          console.error(`Failed to load model: ${url}`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Load Arduino UNO model from GrabCAD (converted to GLB)
   */
  async loadArduinoUNO(): Promise<LoadedModel> {
    return this.load('/models/arduino-uno-r3.glb', {
      id: 'arduino-uno',
      name: 'Arduino UNO R3',
      source: 'grabcad',
      license: 'CC BY 4.0',
      author: 'Arduino.cc',
    });
  }

  /**
   * Load HC-SR04 Ultrasonic Sensor
   */
  async loadUltrasonicSensor(): Promise<LoadedModel> {
    return this.load('/models/hc-sr04.glb', {
      id: 'ultrasonic',
      name: 'HC-SR04 Ultrasonic Sensor',
      source: 'grabcad',
    });
  }

  /**
   * Load SG90 Servo Motor
   */
  async loadServoMotor(): Promise<LoadedModel> {
    return this.load('/models/sg90-servo.glb', {
      id: 'servo',
      name: 'SG90 Micro Servo',
      source: 'grabcad',
    });
  }

  /**
   * Load DHT22 Sensor
   */
  async loadDHT22(): Promise<LoadedModel> {
    return this.load('/models/dht22.glb', {
      id: 'dht22',
      name: 'DHT22 Temperature & Humidity Sensor',
      source: 'snapeda',
    });
  }

  /**
   * Load LCD 1602 Display
   */
  async loadLCD1602(): Promise<LoadedModel> {
    return this.load('/models/lcd-1602.glb', {
      id: 'lcd',
      name: 'LCD 1602 Display',
      source: 'grabcad',
    });
  }

  /**
   * Load LED (5mm)
   */
  async loadLED(): Promise<LoadedModel> {
    return this.load('/models/led-5mm.glb', {
      id: 'led',
      name: '5mm LED',
      source: 'snapeda',
    });
  }

  /**
   * Load Breadboard
   */
  async loadBreadboard(): Promise<LoadedModel> {
    return this.load('/models/breadboard.glb', {
      id: 'breadboard',
      name: 'Breadboard 830 points',
      source: 'grabcad',
    });
  }

  /**
   * Load all common components
   */
  async preloadCommonComponents(): Promise<void> {
    await this.preload([
      '/models/arduino-uno-r3.glb',
      '/models/breadboard.glb',
      '/models/led-5mm.glb',
      '/models/hc-sr04.glb',
      '/models/sg90-servo.glb',
      '/models/dht22.glb',
      '/models/lcd-1602.glb',
    ]);
  }

  /**
   * Get model from cache
   */
  getCached(url: string): LoadedModel | null {
    const promise = this.cache.get(url);
    if (!promise) return null;

    // Check if promise is resolved
    let result: LoadedModel | null = null;
    promise.then(model => {
      result = model;
    });
    return result;
  }

  /**
   * Dispose of all cached models (cleanup)
   */
  dispose(): void {
    this.cache.forEach(async (promise) => {
      const model = await promise;
      model.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
    });
    this.cache.clear();
    this.dracoLoader.dispose();
  }
}

// Singleton instance
export const modelLoader = new ModelLoader();
