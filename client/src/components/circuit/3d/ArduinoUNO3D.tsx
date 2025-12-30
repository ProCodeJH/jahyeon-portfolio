/**
 * Ultra-Detailed 3D Arduino UNO R3 Model
 * Accurate dimensions and all components based on official specs
 * Reference: https://www.arduino.cc/en/Main/arduinoBoardUno
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Mesh, Group } from 'three';

interface ArduinoUNO3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  led13On?: boolean;
  led13Brightness?: number;
  txActive?: boolean;
  rxActive?: boolean;
}

export function ArduinoUNO3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  led13On = false,
  led13Brightness = 0.8,
  txActive = false,
  rxActive = false,
}: ArduinoUNO3DProps) {
  // Arduino UNO R3 exact dimensions (in cm)
  const boardWidth = 6.86; // 68.6mm
  const boardDepth = 5.34; // 53.4mm
  const boardHeight = 0.16; // 1.6mm PCB thickness

  const led13Ref = useRef<Mesh>(null);
  const txLedRef = useRef<Mesh>(null);
  const rxLedRef = useRef<Mesh>(null);
  const boardRef = useRef<Group>(null);

  // Animate LEDs
  useFrame((state) => {
    if (led13Ref.current && led13On) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.8;
      (led13Ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * led13Brightness;
    }

    if (txLedRef.current && txActive) {
      const blink = Math.sin(state.clock.elapsedTime * 10) > 0 ? 1 : 0.1;
      (txLedRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = blink;
    }

    if (rxLedRef.current && rxActive) {
      const blink = Math.sin(state.clock.elapsedTime * 8) > 0.5 ? 1 : 0.1;
      (rxLedRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = blink;
    }
  });

  return (
    <group ref={boardRef} position={position} rotation={rotation}>
      {/* ===== PCB BOARD ===== */}
      <mesh castShadow receiveShadow position={[0, boardHeight / 2, 0]}>
        <boxGeometry args={[boardWidth, boardHeight, boardDepth]} />
        <meshStandardMaterial
          color="#006666"
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* Mounting holes (4 corners) */}
      {[
        [-boardWidth / 2 + 0.35, boardDepth / 2 - 0.35],
        [boardWidth / 2 - 0.35, boardDepth / 2 - 0.35],
        [-boardWidth / 2 + 0.35, -boardDepth / 2 + 0.35],
        [boardWidth / 2 - 0.66, -boardDepth / 2 + 0.35],
      ].map(([x, z], i) => (
        <mesh key={`hole-${i}`} position={[x, 0, z]}>
          <cylinderGeometry args={[0.08, 0.08, boardHeight + 0.02, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}

      {/* ===== USB PORT (Type B) ===== */}
      <group position={[-boardWidth / 2 - 0.3, boardHeight / 2 + 0.25, 1.2]}>
        {/* USB housing */}
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.5, 1.2]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* USB connector inside */}
        <mesh position={[0.1, 0, 0]}>
          <boxGeometry args={[0.3, 0.35, 1.0]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      </group>

      {/* ===== DC POWER JACK ===== */}
      <group position={[-boardWidth / 2 - 0.35, boardHeight / 2 + 0.2, -1.0]}>
        {/* Outer cylinder */}
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.7, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Inner contact */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.15, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.4, 12]} />
          <meshStandardMaterial color="#8b7355" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* ===== ATmega328P MICROCONTROLLER (DIP-28) ===== */}
      <group position={[0.8, boardHeight / 2, 0.3]}>
        {/* IC body */}
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.35, 1.5]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.1} />
        </mesh>
        {/* IC notch (pin 1 indicator) */}
        <mesh position={[0, 0.18, -0.7]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
          <meshStandardMaterial color="#2c2c2c" />
        </mesh>
        {/* Pin 1 dot */}
        <mesh position={[-0.25, 0.18, -0.6]}>
          <cylinderGeometry args={[0.03, 0.03, 0.01, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Label */}
        <mesh position={[0, 0.18, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
        </mesh>

        {/* IC Pins (14 on each side) */}
        {Array.from({ length: 14 }).map((_, i) => {
          const z = -0.65 + i * 0.1;
          return (
            <group key={`pin-${i}`}>
              {/* Left pins */}
              <mesh position={[-0.35, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[0.02, 0.15, 0.05]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Right pins */}
              <mesh position={[0.35, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[0.02, 0.15, 0.05]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ===== ATmega16U2 USB-TO-SERIAL CHIP ===== */}
      <group position={[-1.5, boardHeight / 2, 1.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.25, 0.7]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        {/* SMD pins (simplified) */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`smd-${i}`} position={[-0.35, -0.1, -0.3 + i * 0.08]}>
            <boxGeometry args={[0.08, 0.02, 0.04]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* ===== 16MHz CRYSTAL OSCILLATOR ===== */}
      <mesh castShadow position={[1.8, boardHeight / 2 + 0.08, 0.8]}>
        <boxGeometry args={[0.3, 0.16, 0.15]} />
        <meshStandardMaterial color="#8b8b8b" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* ===== VOLTAGE REGULATORS ===== */}
      {/* 5V regulator */}
      <mesh castShadow position={[-2.2, boardHeight / 2 + 0.15, -0.5]}>
        <boxGeometry args={[0.25, 0.3, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* ===== RESET BUTTON ===== */}
      <group position={[2.5, boardHeight / 2, 2.0]}>
        {/* Button base */}
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.12, 16]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.5} />
        </mesh>
        {/* Button cap (blue) */}
        <mesh castShadow position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.4} />
        </mesh>
      </group>

      {/* ===== ICSP HEADERS ===== */}
      {/* ICSP for ATmega328P */}
      <group position={[2.0, boardHeight / 2, -0.5]}>
        {Array.from({ length: 6 }).map((_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          return (
            <mesh key={`icsp1-${i}`} position={[col * 0.1 - 0.1, 0.08, row * 0.1 - 0.05]}>
              <boxGeometry args={[0.06, 0.16, 0.06]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          );
        })}
      </group>

      {/* ===== LEDs ===== */}
      {/* Power LED (Green - ON) */}
      <mesh position={[2.2, boardHeight / 2 + 0.05, 1.2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 12]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </mesh>
      <pointLight position={[2.2, boardHeight / 2 + 0.15, 1.2]} color="#00ff00" intensity={1} distance={0.5} />

      {/* TX LED (Yellow) */}
      <mesh ref={txLedRef} position={[1.8, boardHeight / 2 + 0.05, 1.5]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={txActive ? 1 : 0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* RX LED (Yellow) */}
      <mesh ref={rxLedRef} position={[1.6, boardHeight / 2 + 0.05, 1.5]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={rxActive ? 1 : 0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Pin 13 LED (Orange - L) */}
      <mesh ref={led13Ref} position={[1.4, boardHeight / 2 + 0.05, 1.5]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 12]} />
        <meshStandardMaterial
          color="#ff8800"
          emissive="#ff8800"
          emissiveIntensity={led13On ? led13Brightness : 0.05}
          transparent
          opacity={0.8}
        />
      </mesh>
      {led13On && (
        <pointLight
          position={[1.4, boardHeight / 2 + 0.2, 1.5]}
          color="#ff8800"
          intensity={led13Brightness * 2}
          distance={0.6}
        />
      )}

      {/* ===== PIN HEADERS ===== */}
      {/* Digital Pins 0-7 */}
      <group position={[-2.5, boardHeight / 2, -1.8]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <group key={`d0-${i}`} position={[i * 0.254, 0, 0]}>
            {/* Black plastic socket */}
            <mesh castShadow>
              <boxGeometry args={[0.06, 0.22, 0.06]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
            </mesh>
            {/* Gold pin */}
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.013, 0.013, 0.35, 8]} />
              <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Digital Pins 8-13 + GND + AREF */}
      <group position={[-2.5, boardHeight / 2, 1.8]}>
        {Array.from({ length: 10 }).map((_, i) => (
          <group key={`d8-${i}`} position={[i * 0.254, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.06, 0.22, 0.06]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.013, 0.013, 0.35, 8]} />
              <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Analog Pins A0-A5 */}
      <group position={[2.5, boardHeight / 2, -1.2]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <group key={`a${i}`} position={[0, 0, i * 0.254]}>
            <mesh castShadow>
              <boxGeometry args={[0.06, 0.22, 0.06]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.013, 0.013, 0.35, 8]} />
              <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Power Pins */}
      <group position={[2.5, boardHeight / 2, 1.2]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <group key={`pwr-${i}`} position={[0, 0, i * 0.254]}>
            <mesh castShadow>
              <boxGeometry args={[0.06, 0.22, 0.06]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.013, 0.013, 0.35, 8]} />
              <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ===== ARDUINO LOGO ===== */}
      <mesh position={[0.5, boardHeight / 2 + 0.01, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 0.6]} />
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </mesh>

      {/* Text: "ARDUINO" */}
      <mesh position={[0, boardHeight / 2 + 0.01, 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.0, 0.3]} />
        <meshStandardMaterial color="#ffffff" opacity={0.95} transparent />
      </mesh>

      {/* Text: "UNO" */}
      <mesh position={[-1.5, boardHeight / 2 + 0.01, -2.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.25]} />
        <meshStandardMaterial color="#00bcd4" opacity={0.95} transparent />
      </mesh>

      {/* ===== CAPACITORS (electrolytic) ===== */}
      <mesh castShadow position={[-1.8, boardHeight / 2 + 0.18, -1.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.36, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>

      {/* Smaller capacitors */}
      {[
        [-0.5, -0.8],
        [-0.3, 1.5],
        [2.0, 0.5],
      ].map(([x, z], i) => (
        <mesh key={`cap-${i}`} castShadow position={[x, boardHeight / 2 + 0.08, z]}>
          <cylinderGeometry args={[0.08, 0.08, 0.16, 12]} />
          <meshStandardMaterial color="#d4a574" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
