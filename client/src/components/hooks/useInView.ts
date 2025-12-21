import { useEffect, useRef, useState } from "react";

/**
 * 🔍 USE IN VIEW HOOK
 *
 * Detects when an element enters the viewport using Intersection Observer.
 * Triggers once and stops observing for performance.
 *
 * @param threshold - Intersection threshold (0-1, default: 0.1)
 * @param triggerOnce - Whether to trigger only once (default: true)
 * @returns { ref, isInView } - Ref for the element and visibility state
 */
export function useInView(threshold = 0.1, triggerOnce = true) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Stop observing after first trigger for performance
          if (triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin: '50px', // Trigger slightly before element enters viewport
      }
    );

    observerRef.current = observer;
    observer.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, triggerOnce]);

  return { ref, isInView };
}
