/**
 * Wire Renderer - Visualizes connections between components
 * Tinkercad-style wire routing
 */

import { Wire } from '@/lib/circuit-types';
import { useCircuitStore } from '@/lib/circuit-store';

interface WireRendererProps {
  wire: Wire;
}

export function WireRenderer({ wire }: WireRendererProps) {
  const { removeWire } = useCircuitStore();

  if (wire.points.length < 2) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.detail === 2) { // Double click
      removeWire(wire.id);
    }
  };

  // Create smooth path through points
  const pathData = wire.points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const prevPoint = wire.points[index - 1];
    const midX = (prevPoint.x + point.x) / 2;
    const midY = (prevPoint.y + point.y) / 2;

    // Use quadratic curves for smooth routing
    return `${path} Q ${prevPoint.x} ${midY}, ${midX} ${midY} Q ${point.x} ${midY}, ${point.x} ${point.y}`;
  }, '');

  return (
    <g className="wire" onClick={handleClick}>
      {/* Wire Shadow */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(2, 2)"
      />

      {/* Main Wire */}
      <path
        d={pathData}
        fill="none"
        stroke={wire.color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="cursor-pointer hover:stroke-[4px] transition-all"
      />

      {/* Connection Points */}
      {wire.points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={3}
          fill={wire.color}
          stroke="white"
          strokeWidth={1.5}
        />
      ))}
    </g>
  );
}
