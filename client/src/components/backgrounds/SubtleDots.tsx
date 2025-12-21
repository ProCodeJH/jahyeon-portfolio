import { useMemo } from "react";

/**
 * ✨ SUBTLE FLOATING DOTS
 *
 * Features:
 * - Respects prefers-reduced-motion
 * - Memoized dot positions for performance
 * - CSS-based animations (GPU accelerated)
 */
export function SubtleDots() {
  // Memoize dot configurations to avoid recalculating on every render
  const dots = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${8 + Math.random() * 8}s`,
    })),
    []
  );

  return (
    <>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {dots.map((dot) => (
          <div
            key={dot.id}
            className="absolute w-1 h-1 bg-purple-300/20 rounded-full animate-float"
            style={{
              left: dot.left,
              top: dot.top,
              animationDelay: dot.delay,
              animationDuration: dot.duration,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-40px) translateX(20px); opacity: 0.4; }
        }

        .animate-float {
          animation: float ease-in-out infinite;
        }

        /* Respect user's motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-float {
            animation: none;
            opacity: 0.2;
          }
        }
      `}</style>
    </>
  );
}
