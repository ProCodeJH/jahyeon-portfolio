import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * 🎯 3D TILT EFFECT HOOK
 *
 * Features:
 * - Mouse and touch support
 * - Respects prefers-reduced-motion
 * - Smooth animations with CSS transforms
 * - Proper cleanup
 *
 * @param sensitivity - Tilt sensitivity (1-20, default: 10)
 * @returns { ref, transform } - Ref for the element and transform string
 */
export function useTilt(sensitivity = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const prefersReducedMotion = useReducedMotion();

  const calculateTilt = useCallback((clientX: number, clientY: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * sensitivity;
    const rotateY = ((x - centerX) / centerX) * -sensitivity;

    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }, [sensitivity]);

  const resetTransform = useCallback(() => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion) return;

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      setTransform(calculateTilt(e.clientX, e.clientY, rect));
    };

    // Touch events for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = element.getBoundingClientRect();
        setTransform(calculateTilt(touch.clientX, touch.clientY, rect));
      }
    };

    const handleMouseLeave = () => resetTransform();
    const handleTouchEnd = () => resetTransform();

    // Add event listeners
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sensitivity, prefersReducedMotion, calculateTilt, resetTransform]);

  return { ref, transform };
}
