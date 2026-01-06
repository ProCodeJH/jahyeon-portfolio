import { memo, useMemo } from "react";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * 📜 ANIMATED SECTION COMPONENT
 *
 * Features:
 * - Scroll-triggered fade-in animations
 * - Respects prefers-reduced-motion
 * - Memoized for performance
 * - Customizable delay and threshold
 *
 * @param children - Section content
 * @param className - Additional CSS classes
 * @param delay - Animation delay in milliseconds (default: 0)
 * @param threshold - Intersection threshold (default: 0.1)
 */
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
}

export const AnimatedSection = memo<AnimatedSectionProps>(({
  children,
  className = "",
  delay = 0,
  threshold = 0.1,
}) => {
  const { ref, isInView } = useInView(threshold);
  const prefersReducedMotion = useReducedMotion();

  // Memoize style object to prevent re-renders
  const style = useMemo(() => ({
    transform: prefersReducedMotion || isInView ? "translateY(0)" : "translateY(60px)",
    opacity: prefersReducedMotion || isInView ? 1 : 0,
    transitionDelay: prefersReducedMotion ? "0ms" : `${delay}ms`,
  }), [prefersReducedMotion, isInView, delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={style}
    >
      {children}
    </div>
  );
});

AnimatedSection.displayName = 'AnimatedSection';
