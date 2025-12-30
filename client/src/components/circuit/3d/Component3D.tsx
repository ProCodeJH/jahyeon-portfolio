/**
 * 3D Component Renderer
 * Routes to specific 3D component based on type
 */

import type { Component } from '@/lib/circuit-types';
import { ArduinoUNO3D } from './ArduinoUNO3D';
import { LED3D } from './LED3D';
import { Resistor3D } from './Resistor3D';
import { PIRSensor3D } from './PIRSensor3D';
import { Photoresistor3D } from './Photoresistor3D';
import { Button3D } from './Button3D';
import { Breadboard3D } from './Breadboard3D';

interface Component3DProps {
  component: Component;
}

export function Component3D({ component }: Component3DProps) {
  // Convert 2D position to 3D (scale down and adjust axes)
  const position3D: [number, number, number] = [
    component.x / 100, // Scale to cm
    0.5, // Y position (height above ground)
    component.y / 100,
  ];

  const rotation3D: [number, number, number] = [
    0,
    (component.rotation * Math.PI) / 180, // Convert degrees to radians
    0,
  ];

  switch (component.type) {
    case 'arduino-uno':
      return (
        <ArduinoUNO3D
          position={position3D}
          rotation={rotation3D}
          led13On={component.properties.led13On}
          led13Brightness={component.properties.led13Brightness}
        />
      );

    case 'led':
      return (
        <LED3D
          position={position3D}
          rotation={rotation3D}
          color={component.properties.color || 'red'}
          isOn={component.properties.isOn}
          brightness={component.properties.brightness}
        />
      );

    case 'resistor':
      return (
        <Resistor3D
          position={position3D}
          rotation={rotation3D}
          resistance={component.properties.resistance || 220}
        />
      );

    case 'pir-sensor':
      return (
        <PIRSensor3D
          position={position3D}
          rotation={rotation3D}
          motionDetected={component.properties.motionDetected}
        />
      );

    case 'photoresistor':
      return (
        <Photoresistor3D
          position={position3D}
          rotation={rotation3D}
          lightLevel={component.properties.lightLevel}
        />
      );

    case 'button':
      return (
        <Button3D
          position={position3D}
          rotation={rotation3D}
          isPressed={component.properties.isPressed}
        />
      );

    case 'breadboard':
      return <Breadboard3D position={position3D} />;

    default:
      // Fallback: generic box
      return (
        <mesh castShadow position={position3D} rotation={rotation3D}>
          <boxGeometry args={[0.5, 0.3, 0.5]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      );
  }
}
