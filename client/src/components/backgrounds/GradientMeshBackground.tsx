import { useEffect, useRef, useState } from "react";

/**
 * 🌊 OPTIMIZED GRADIENT MESH BACKGROUND
 *
 * Features:
 * - Automatic pause/resume on visibility change
 * - Proper cleanup to prevent memory leaks
 * - Responsive canvas sizing
 * - Performance optimized with requestAnimationFrame
 */
export function GradientMeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Blob class for gradient animation - Capture canvas and ctx as non-null
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    class Blob {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      hue: number;
      private canvasW: number;
      private canvasH: number;

      constructor(w: number, h: number) {
        this.canvasW = w;
        this.canvasH = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.radius = Math.random() * 200 + 150;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.hue = Math.random() * 60 + 200; // Blue to purple range
      }

      update(w: number, h: number) {
        this.canvasW = w;
        this.canvasH = h;
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < -this.radius || this.x > this.canvasW + this.radius) this.vx *= -1;
        if (this.y < -this.radius || this.y > this.canvasH + this.radius) this.vy *= -1;

        // Cycle hue
        this.hue += 0.1;
        if (this.hue > 260) this.hue = 200;
      }

      draw(context: CanvasRenderingContext2D, w: number, h: number) {
        const gradient = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, 0.15)`);
        gradient.addColorStop(1, `hsla(${this.hue}, 70%, 60%, 0)`);

        context.fillStyle = gradient;
        context.fillRect(0, 0, w, h);
      }
    }

    const blobs = Array.from({ length: 5 }, () => new Blob(canvas.width, canvas.height));

    // Animation loop
    const animate = () => {
      if (!isVisibleRef.current) {
        // If not visible, schedule next frame but don't render
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Clear with slight fade for trail effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw blobs
      blobs.forEach(blob => {
        blob.update(canvas.width, canvas.height);
        blob.draw(ctx, canvas.width, canvas.height);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle window resize
    const handleResize = () => {
      setCanvasSize();
    };

    // Handle page visibility (pause when tab is not active)
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Cancel animation frame to prevent memory leak
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
