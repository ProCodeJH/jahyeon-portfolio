/**
 * PWM LED 3D Component with Duty Cycle Shader
 * Realistic LED rendering with PWM brightness control
 */

import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

interface PWMLED3DProps {
  position: [number, number, number];
  color: string;
  isOn: boolean;
  pwmDuty?: number; // 0-255
  pwmFrequency?: number; // Hz (default 490 for Arduino)
  onClick?: () => void;
  isSelected?: boolean;
  label?: string;
}

// PWM Glow Shader Material
const PWMGlowMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#ff0000'),
    uPwmDuty: 255,
    uPwmFrequency: 490,
    uIsOn: 1.0,
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uPwmDuty;
    uniform float uPwmFrequency;
    uniform float uIsOn;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      if (uIsOn < 0.5) {
        // LED is off - dark with slight ambient
        gl_FragColor = vec4(uColor * 0.1, 0.9);
        return;
      }

      // PWM duty cycle (0-255 mapped to 0-1)
      float dutyCycle = uPwmDuty / 255.0;

      // Simulate PWM flickering (only visible at low frequencies)
      float pwmCycle = mod(uTime * uPwmFrequency, 1.0);
      float pwmState = step(pwmCycle, dutyCycle);

      // Human eye perception smoothing (persistence of vision)
      // At high frequencies, we see average brightness
      float perceivedBrightness = dutyCycle;

      // Add slight flicker at low duty cycles
      if (dutyCycle < 0.3) {
        perceivedBrightness = mix(
          perceivedBrightness,
          perceivedBrightness * (0.8 + 0.2 * pwmState),
          0.3
        );
      }

      // Fresnel effect for translucent LED dome
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(viewDir, vNormal), 2.0);

      // Core glow - brighter in center
      float coreGlow = 1.0 - length(vUv - 0.5) * 1.5;
      coreGlow = max(0.0, coreGlow);

      // Combine effects
      vec3 finalColor = uColor * perceivedBrightness;
      finalColor += uColor * fresnel * 0.3 * perceivedBrightness;
      finalColor += vec3(1.0) * coreGlow * 0.2 * perceivedBrightness;

      // Emissive intensity
      float emissive = perceivedBrightness * (0.5 + coreGlow * 0.5);

      gl_FragColor = vec4(finalColor + uColor * emissive, 0.85);
    }
  `
);

// Extend Three.js with custom material
extend({ PWMGlowMaterial });

// Add type declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      pWMGlowMaterial: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        uTime?: number;
        uColor?: THREE.Color;
        uPwmDuty?: number;
        uPwmFrequency?: number;
        uIsOn?: number;
        transparent?: boolean;
      };
    }
  }
}

export function PWMLED3D({
  position,
  color,
  isOn,
  pwmDuty = 255,
  pwmFrequency = 490,
  onClick,
  isSelected,
  label,
}: PWMLED3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);

  // LED dimensions (5mm LED scaled to scene units)
  const bodyRadius = 0.0025;
  const bodyHeight = 0.004;
  const legLength = 0.003;
  const legRadius = 0.0003;

  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  // Calculate perceived brightness from PWM duty
  const perceivedBrightness = useMemo(() => {
    if (!isOn) return 0;
    return (pwmDuty / 255);
  }, [isOn, pwmDuty]);

  // Animate shader
  useFrame((state) => {
    if (glowMaterialRef.current) {
      glowMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      glowMaterialRef.current.uniforms.uColor.value = colorObj;
      glowMaterialRef.current.uniforms.uPwmDuty.value = pwmDuty;
      glowMaterialRef.current.uniforms.uPwmFrequency.value = pwmFrequency;
      glowMaterialRef.current.uniforms.uIsOn.value = isOn ? 1.0 : 0.0;
    }

    // Animate outer glow
    if (outerGlowRef.current && isOn) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1 * perceivedBrightness;
      outerGlowRef.current.scale.setScalar(scale);
    }

    // Update point light intensity
    if (pointLightRef.current) {
      pointLightRef.current.intensity = perceivedBrightness * 0.4;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* LED dome with PWM shader */}
      <mesh position={[0, bodyHeight / 2, 0]}>
        <sphereGeometry args={[bodyRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <shaderMaterial
          ref={glowMaterialRef}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;

            void main() {
              vNormal = normalize(normalMatrix * normal);
              vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform vec3 uColor;
            uniform float uPwmDuty;
            uniform float uPwmFrequency;
            uniform float uIsOn;

            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;

            void main() {
              if (uIsOn < 0.5) {
                gl_FragColor = vec4(uColor * 0.15, 0.85);
                return;
              }

              float dutyCycle = uPwmDuty / 255.0;
              float pwmCycle = mod(uTime * uPwmFrequency, 1.0);
              float pwmState = step(pwmCycle, dutyCycle);

              float perceivedBrightness = dutyCycle;
              if (dutyCycle < 0.3) {
                perceivedBrightness = mix(
                  perceivedBrightness,
                  perceivedBrightness * (0.85 + 0.15 * pwmState),
                  0.2
                );
              }

              vec3 viewDir = normalize(cameraPosition - vPosition);
              float fresnel = pow(1.0 - max(0.0, dot(viewDir, vNormal)), 2.5);

              vec3 finalColor = uColor * (0.4 + perceivedBrightness * 0.6);
              finalColor += uColor * fresnel * 0.4 * perceivedBrightness;
              finalColor += vec3(1.0, 1.0, 0.9) * perceivedBrightness * 0.3;

              gl_FragColor = vec4(finalColor, 0.9);
            }
          `}
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: colorObj },
            uPwmDuty: { value: pwmDuty },
            uPwmFrequency: { value: pwmFrequency },
            uIsOn: { value: isOn ? 1.0 : 0.0 },
          }}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* LED body (cylinder) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 32]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.85}
          roughness={0.15}
          metalness={0}
          emissive={color}
          emissiveIntensity={isOn ? perceivedBrightness * 1.5 : 0}
        />
      </mesh>

      {/* Flat bottom rim */}
      <mesh position={[0, -bodyHeight / 2 + 0.0002, 0]}>
        <cylinderGeometry args={[bodyRadius + 0.0003, bodyRadius + 0.0003, 0.0004, 32]} />
        <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Anode leg (longer, positive) */}
      <mesh position={[0.0008, -bodyHeight / 2 - legLength / 2, 0]}>
        <cylinderGeometry args={[legRadius, legRadius, legLength, 8]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Cathode leg (shorter, negative) */}
      <mesh position={[-0.0008, -bodyHeight / 2 - legLength / 2 + 0.0005, 0]}>
        <cylinderGeometry args={[legRadius, legRadius, legLength - 0.001, 8]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Outer glow effect when on */}
      {isOn && perceivedBrightness > 0.1 && (
        <mesh ref={outerGlowRef} position={[0, bodyHeight / 4, 0]}>
          <sphereGeometry args={[bodyRadius * 2.5, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.12 * perceivedBrightness}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Point light when on */}
      {isOn && (
        <pointLight
          ref={pointLightRef}
          color={color}
          intensity={perceivedBrightness * 0.4}
          distance={0.15}
          decay={2}
          position={[0, bodyHeight / 2, 0]}
        />
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[bodyRadius + 0.001, bodyRadius + 0.0015, 32]} />
          <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Label */}
      {label && (
        <group position={[0, bodyHeight + 0.005, 0]}>
          {/* Label background would go here with Text from drei */}
        </group>
      )}

      {/* PWM indicator bar */}
      {isOn && pwmDuty < 255 && (
        <group position={[0, -bodyHeight / 2 - legLength - 0.002, 0]}>
          <mesh>
            <boxGeometry args={[0.006, 0.0008, 0.0008]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          <mesh position={[(pwmDuty / 255 - 0.5) * 0.003, 0, 0.0001]}>
            <boxGeometry args={[(pwmDuty / 255) * 0.006, 0.0006, 0.0006]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default PWMLED3D;
