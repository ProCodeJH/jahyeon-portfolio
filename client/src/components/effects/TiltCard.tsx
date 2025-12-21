import { memo } from "react";
import { useTilt } from "../hooks/useTilt";

/**
 * 🎴 3D TILT CARD COMPONENT
 *
 * Features:
 * - Mouse and touch support
 * - Memoized for performance
 * - Respects prefers-reduced-motion
 * - Smooth CSS transitions
 *
 * @param children - Card content
 * @param sensitivity - Tilt sensitivity (1-20, default: 10)
 * @param className - Additional CSS classes
 */
interface TiltCardProps {
  children: React.ReactNode;
  sensitivity?: number;
  className?: string;
}

export const TiltCard = memo<TiltCardProps>(({ children, sensitivity = 10, className = "" }) => {
  const { ref, transform } = useTilt(sensitivity);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform,
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
});

TiltCard.displayName = 'TiltCard';
