/**
 * Pin/Net GPU Instanced Visualization Layer
 * High-performance visualization of circuit connections using GPU instancing
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCircuitStore } from '../store';

interface PinPoint {
  position: THREE.Vector3;
  state: 'high' | 'low' | 'floating' | 'pwm';
  pwmDuty?: number;
  netId?: string;
}

interface NetConnection {
  id: string;
  pins: PinPoint[];
  color: THREE.Color;
  state: 'active' | 'inactive' | 'error';
}

// Shader for instanced pin visualization
const pinVertexShader = `
  uniform float uTime;
  attribute float instanceState; // 0: low, 1: high, 2: floating, 3: pwm
  attribute float instancePwmDuty;
  attribute vec3 instanceColor;
  varying vec3 vColor;
  varying float vState;
  varying float vPwmDuty;

  void main() {
    vColor = instanceColor;
    vState = instanceState;
    vPwmDuty = instancePwmDuty;

    vec3 pos = position;

    // Pulse animation for active pins
    if (instanceState > 0.5) {
      float pulse = sin(uTime * 4.0 + position.x * 10.0) * 0.1 + 1.0;
      pos *= pulse;
    }

    // PWM flickering effect
    if (instanceState > 2.5) {
      float pwmFreq = 490.0; // Arduino PWM frequency
      float pwmCycle = mod(uTime * pwmFreq, 1.0);
      float pwmOn = step(pwmCycle, instancePwmDuty / 255.0);
      pos *= 0.8 + pwmOn * 0.2;
    }

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pinFragmentShader = `
  uniform float uTime;
  varying vec3 vColor;
  varying float vState;
  varying float vPwmDuty;

  void main() {
    vec3 color = vColor;
    float alpha = 0.8;

    // High state - bright glow
    if (vState > 0.5 && vState < 1.5) {
      float glow = 0.5 + 0.5 * sin(uTime * 3.0);
      color = mix(color, vec3(1.0), glow * 0.3);
      alpha = 1.0;
    }

    // Floating state - dim pulsing
    if (vState > 1.5 && vState < 2.5) {
      float pulse = 0.3 + 0.2 * sin(uTime * 2.0);
      color *= pulse;
      alpha = 0.5;
    }

    // PWM state - brightness based on duty cycle
    if (vState > 2.5) {
      float brightness = vPwmDuty / 255.0;
      color *= 0.5 + brightness * 0.5;
      alpha = 0.7 + brightness * 0.3;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

// Shader for wire/net visualization
const wireVertexShader = `
  uniform float uTime;
  uniform float uActive;
  attribute float alongPath;
  varying float vAlongPath;
  varying float vActive;

  void main() {
    vAlongPath = alongPath;
    vActive = uActive;

    vec3 pos = position;

    // Add slight wave animation for active wires
    if (uActive > 0.5) {
      pos.y += sin(alongPath * 20.0 + uTime * 5.0) * 0.0003;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const wireFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uActive;
  varying float vAlongPath;
  varying float vActive;

  void main() {
    vec3 color = uColor;
    float alpha = 0.6;

    // Animated flow effect for active wires
    if (vActive > 0.5) {
      float flow = fract(vAlongPath * 10.0 - uTime * 2.0);
      float highlight = smoothstep(0.0, 0.1, flow) * smoothstep(0.3, 0.2, flow);
      color = mix(color, vec3(1.0, 1.0, 0.5), highlight * 0.5);
      alpha = 0.8 + highlight * 0.2;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

export function PinNetVisualization() {
  const { components, wires } = useCircuitStore();
  const pinInstancesRef = useRef<THREE.InstancedMesh>(null);
  const uniformsRef = useRef({
    uTime: { value: 0 },
  });

  // Generate pin positions from components
  const pinData = useMemo(() => {
    const pins: PinPoint[] = [];

    components.forEach((component) => {
      const [x, y, z] = component.position;

      switch (component.type) {
        case 'arduino':
          // Arduino pins - digital 0-13, analog A0-A5
          for (let i = 0; i < 14; i++) {
            pins.push({
              position: new THREE.Vector3(
                x - 0.03 + (i * 0.004),
                y + 0.003,
                z + 0.025
              ),
              state: 'low',
              netId: `arduino_d${i}`,
            });
          }
          for (let i = 0; i < 6; i++) {
            pins.push({
              position: new THREE.Vector3(
                x - 0.015 + (i * 0.004),
                y + 0.003,
                z - 0.025
              ),
              state: 'floating',
              netId: `arduino_a${i}`,
            });
          }
          break;

        case 'led':
          pins.push({
            position: new THREE.Vector3(x + 0.0008, y - 0.004, z),
            state: component.properties?.isOn ? 'high' : 'low',
            netId: `led_anode_${component.id}`,
          });
          pins.push({
            position: new THREE.Vector3(x - 0.0008, y - 0.004, z),
            state: 'low',
            netId: `led_cathode_${component.id}`,
          });
          break;

        case 'resistor':
          pins.push({
            position: new THREE.Vector3(x - 0.003, y, z),
            state: 'floating',
            netId: `res_1_${component.id}`,
          });
          pins.push({
            position: new THREE.Vector3(x + 0.003, y, z),
            state: 'floating',
            netId: `res_2_${component.id}`,
          });
          break;

        case 'button':
          for (let i = 0; i < 4; i++) {
            const bx = (i % 2 === 0 ? -1 : 1) * 0.002;
            const bz = (i < 2 ? -1 : 1) * 0.002;
            pins.push({
              position: new THREE.Vector3(x + bx, y, z + bz),
              state: component.properties?.isPressed ? 'high' : 'low',
              netId: `btn_${i}_${component.id}`,
            });
          }
          break;
      }
    });

    return pins;
  }, [components]);

  // Create instanced geometry for pins
  const { instancedMesh, material } = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.0008, 8, 8);
    const mat = new THREE.ShaderMaterial({
      vertexShader: pinVertexShader,
      fragmentShader: pinFragmentShader,
      uniforms: uniformsRef.current,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.InstancedMesh(geometry, mat, Math.max(1, pinData.length));
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    return { instancedMesh: mesh, material: mat };
  }, [pinData.length]);

  // Update instance matrices
  useEffect(() => {
    if (!pinInstancesRef.current) return;

    const matrix = new THREE.Matrix4();
    const stateArray = new Float32Array(pinData.length);
    const pwmArray = new Float32Array(pinData.length);
    const colorArray = new Float32Array(pinData.length * 3);

    pinData.forEach((pin, i) => {
      matrix.setPosition(pin.position);
      pinInstancesRef.current!.setMatrixAt(i, matrix);

      stateArray[i] = pin.state === 'low' ? 0 : pin.state === 'high' ? 1 : pin.state === 'floating' ? 2 : 3;
      pwmArray[i] = pin.pwmDuty || 0;

      const color = pin.state === 'high' ? [0, 1, 0.3] : pin.state === 'low' ? [0.3, 0.3, 0.3] : [1, 0.8, 0];
      colorArray[i * 3] = color[0];
      colorArray[i * 3 + 1] = color[1];
      colorArray[i * 3 + 2] = color[2];
    });

    pinInstancesRef.current.instanceMatrix.needsUpdate = true;

    // Update geometry attributes
    const geo = pinInstancesRef.current.geometry;
    geo.setAttribute('instanceState', new THREE.InstancedBufferAttribute(stateArray, 1));
    geo.setAttribute('instancePwmDuty', new THREE.InstancedBufferAttribute(pwmArray, 1));
    geo.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colorArray, 3));
  }, [pinData]);

  // Animation loop
  useFrame((state) => {
    uniformsRef.current.uTime.value = state.clock.elapsedTime;
  });

  if (pinData.length === 0) return null;

  return (
    <group name="pin-net-visualization">
      <primitive
        ref={pinInstancesRef}
        object={instancedMesh}
        frustumCulled={false}
      />

      {/* Wire glow effect for active connections */}
      {wires.map((wire) => (
        <WireGlow
          key={wire.id}
          start={wire.startPoint}
          end={wire.endPoint}
          color={wire.color}
          active={true}
        />
      ))}
    </group>
  );
}

interface WireGlowProps {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  active: boolean;
}

function WireGlow({ start, end, color, active }: WireGlowProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uActive: { value: active ? 1.0 : 0.0 },
  });

  const geometry = useMemo(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    );
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.0006, 8, false);

    // Add along-path attribute for flow animation
    const alongPath = new Float32Array(tubeGeo.attributes.position.count);
    const pos = tubeGeo.attributes.position;
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const totalLength = startVec.distanceTo(endVec);

    for (let i = 0; i < pos.count; i++) {
      const p = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
      alongPath[i] = startVec.distanceTo(p) / totalLength;
    }

    tubeGeo.setAttribute('alongPath', new THREE.BufferAttribute(alongPath, 1));

    return tubeGeo;
  }, [start, end]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: wireVertexShader,
      fragmentShader: wireFragmentShader,
      uniforms: uniformsRef.current,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    uniformsRef.current.uTime.value = state.clock.elapsedTime;
    uniformsRef.current.uActive.value = active ? 1.0 : 0.0;
    uniformsRef.current.uColor.value.set(color);
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
}

export default PinNetVisualization;
