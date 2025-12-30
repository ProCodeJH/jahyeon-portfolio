/**
 * Component Renderer - Visualizes circuit components
 * Supports Arduino, LEDs, sensors, and more
 */

import { Component, COMPONENT_LIBRARY } from '@/lib/circuit-types';
import { useCircuitStore } from '@/lib/circuit-store';
import { useState } from 'react';

interface ComponentRendererProps {
  component: Component;
  isSelected: boolean;
}

export function ComponentRenderer({ component, isSelected }: ComponentRendererProps) {
  const { moveComponent, selectComponent, removeComponent, rotateComponent } = useCircuitStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const definition = COMPONENT_LIBRARY.find(c => c.type === component.type);
  if (!definition) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(component.id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - component.x,
      y: e.clientY - component.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    moveComponent(component.id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    rotateComponent(component.id);
  };

  const handleDelete = (e: React.KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && isSelected) {
      removeComponent(component.id);
    }
  };

  // Render different component types
  const renderComponent = () => {
    switch (component.type) {
      case 'arduino-uno':
        return (
          <g>
            {/* Arduino Board */}
            <rect
              x={0}
              y={0}
              width={definition.width}
              height={definition.height}
              rx={8}
              fill="#0A5F73"
              stroke="#073B4C"
              strokeWidth={3}
            />
            <text
              x={definition.width / 2}
              y={30}
              textAnchor="middle"
              fill="white"
              fontSize={18}
              fontWeight="bold"
            >
              ARDUINO UNO
            </text>

            {/* USB Port */}
            <rect x={10} y={60} width={25} height={40} rx={4} fill="#C0C0C0" />

            {/* Power LED */}
            <circle cx={definition.width - 20} cy={20} r={4} fill="#00FF00" />
            <text x={definition.width - 35} y={23} fill="#00FF00" fontSize={10}>PWR</text>

            {/* Pin 13 LED */}
            <circle cx={definition.width / 2} cy={definition.height / 2} r={12} fill="#FF0000" opacity={0.3} />

            {/* Digital Pins */}
            {[...Array(14)].map((_, i) => (
              <g key={`d${i}`}>
                <circle cx={20 + i * 12} cy={definition.height - 10} r={3} fill="#FFD700" />
                <text x={20 + i * 12} y={definition.height + 10} textAnchor="middle" fontSize={8} fill="#333">{i}</text>
              </g>
            ))}

            {/* Analog Pins */}
            {[...Array(6)].map((_, i) => (
              <g key={`a${i}`}>
                <circle cx={20 + i * 20} cy={15} r={3} fill="#FFD700" />
                <text x={20 + i * 20} y={10} textAnchor="middle" fontSize={8} fill="white">A{i}</text>
              </g>
            ))}
          </g>
        );

      case 'led':
        return (
          <g>
            {/* LED Body */}
            <ellipse cx={15} cy={20} rx={15} ry={20} fill={component.properties.color || 'red'} opacity={0.7} />
            <ellipse cx={15} cy={20} rx={12} ry={17} fill={component.properties.color || 'red'} opacity={0.4} />

            {/* Leads */}
            <line x1={15} y1={40} x2={15} y2={60} stroke="#666" strokeWidth={2} />
            <line x1={15} y1={0} x2={15} y2={10} stroke="#666" strokeWidth={2} />

            {/* Labels */}
            <text x={25} y={5} fontSize={8} fill="#666">+</text>
            <text x={25} y={60} fontSize={8} fill="#666">-</text>
          </g>
        );

      case 'button':
        return (
          <g>
            {/* Button Base */}
            <rect x={0} y={0} width={40} height={40} rx={4} fill="#E0E0E0" stroke="#999" strokeWidth={2} />

            {/* Button Top */}
            <circle cx={20} cy={20} r={12} fill="#666" stroke="#333" strokeWidth={2} />

            {/* Pins */}
            <circle cx={5} cy={5} r={2} fill="#FFD700" />
            <circle cx={35} cy={5} r={2} fill="#FFD700" />
            <circle cx={5} cy={35} r={2} fill="#FFD700" />
            <circle cx={35} cy={35} r={2} fill="#FFD700" />
          </g>
        );

      case 'pir-sensor':
        return (
          <g>
            {/* Sensor Body */}
            <rect x={0} y={0} width={60} height={80} rx={6} fill="#28A745" stroke="#1E7E34" strokeWidth={2} />

            {/* Lens */}
            <circle cx={30} cy={30} r={20} fill="white" opacity={0.8} />
            <circle cx={30} cy={30} r={16} fill="#E0E0E0" />

            {/* Label */}
            <text x={30} y={65} textAnchor="middle" fontSize={10} fontWeight="bold" fill="white">PIR</text>

            {/* Pins */}
            <circle cx={15} cy={75} r={3} fill="#FFD700" />
            <circle cx={30} cy={75} r={3} fill="#FFD700" />
            <circle cx={45} cy={75} r={3} fill="#FFD700" />
            <text x={15} y={90} textAnchor="middle" fontSize={7}>VCC</text>
            <text x={30} y={90} textAnchor="middle" fontSize={7}>OUT</text>
            <text x={45} y={90} textAnchor="middle" fontSize={7}>GND</text>
          </g>
        );

      case 'resistor':
        return (
          <g>
            {/* Resistor Body */}
            <rect x={10} y={5} width={40} height={10} rx={2} fill="#D4A574" stroke="#8B7355" strokeWidth={1} />

            {/* Color Bands */}
            <rect x={15} y={5} width={3} height={10} fill="#FF0000" />
            <rect x={25} y={5} width={3} height={10} fill="#FF0000" />
            <rect x={35} y={5} width={3} height={10} fill="#8B4513" />

            {/* Leads */}
            <line x1={0} y1={10} x2={10} y2={10} stroke="#999" strokeWidth={2} />
            <line x1={50} y1={10} x2={60} y2={10} stroke="#999" strokeWidth={2} />

            {/* Value */}
            <text x={30} y={25} textAnchor="middle" fontSize={8} fill="#666">{component.properties.resistance}Ω</text>
          </g>
        );

      case 'photoresistor':
        return (
          <g>
            {/* LDR Body */}
            <rect x={5} y={0} width={30} height={50} rx={4} fill="#8B4513" stroke="#654321" strokeWidth={2} />

            {/* Zigzag Pattern */}
            <path d="M 10 10 L 15 15 L 10 20 L 15 25 L 10 30 L 15 35 L 10 40" stroke="#FFD700" strokeWidth={2} fill="none" />
            <path d="M 25 10 L 20 15 L 25 20 L 20 25 L 25 30 L 20 35 L 25 40" stroke="#FFD700" strokeWidth={2} fill="none" />

            {/* Leads */}
            <line x1={20} y1={-5} x2={20} y2={0} stroke="#666" strokeWidth={2} />
            <line x1={20} y1={50} x2={20} y2={55} stroke="#666" strokeWidth={2} />

            {/* Light Indicator */}
            <circle cx={20} cy={25} r={8} fill="#FFFF00" opacity={0.3} />

            {/* Label */}
            <text x={20} y={65} textAnchor="middle" fontSize={7} fill="#666">LDR</text>
          </g>
        );

      case 'servo':
        return (
          <g>
            {/* Servo Body */}
            <rect x={0} y={10} width={50} height={40} rx={4} fill="#1E90FF" stroke="#104E8B" strokeWidth={2} />

            {/* Servo Horn */}
            <circle cx={25} cy={10} r={15} fill="#FFD700" stroke="#DAA520" strokeWidth={2} />
            <line x1={25} y1={10} x2={35} y2={5} stroke="#333" strokeWidth={2} />

            {/* Wires */}
            <line x1={10} y1={50} x2={10} y2={70} stroke="#FFA500" strokeWidth={2} />
            <line x1={25} y1={50} x2={25} y2={70} stroke="#FF0000" strokeWidth={2} />
            <line x1={40} y1={50} x2={40} y2={70} stroke="#8B4513" strokeWidth={2} />

            {/* Labels */}
            <text x={10} y={80} textAnchor="middle" fontSize={6}>SIG</text>
            <text x={25} y={80} textAnchor="middle" fontSize={6}>VCC</text>
            <text x={40} y={80} textAnchor="middle" fontSize={6}>GND</text>
          </g>
        );

      default:
        return (
          <g>
            <rect
              x={0}
              y={0}
              width={definition.width}
              height={definition.height}
              fill="#CCCCCC"
              stroke="#999"
              strokeWidth={2}
              rx={4}
            />
            <text
              x={definition.width / 2}
              y={definition.height / 2}
              textAnchor="middle"
              fontSize={12}
              fill="#333"
            >
              {definition.name}
            </text>
          </g>
        );
    }
  };

  return (
    <g
      transform={`translate(${component.x}, ${component.y}) rotate(${component.rotation}, ${definition.width / 2}, ${definition.height / 2})`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleDelete}
      className="cursor-move"
      tabIndex={0}
    >
      {/* Selection Highlight */}
      {isSelected && (
        <rect
          x={-5}
          y={-5}
          width={definition.width + 10}
          height={definition.height + 10}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          strokeDasharray="5,5"
          rx={8}
        >
          <animate attributeName="stroke-dashoffset" values="0;10" dur="0.5s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Component Body */}
      {renderComponent()}

      {/* Pins */}
      {component.pins.map((pin) => (
        <circle
          key={pin.id}
          cx={pin.x - component.x}
          cy={pin.y - component.y}
          r={4}
          fill={pin.connectedTo ? '#4CAF50' : '#FFD700'}
          stroke="#333"
          strokeWidth={1}
          className="cursor-pointer"
        />
      ))}
    </g>
  );
}
