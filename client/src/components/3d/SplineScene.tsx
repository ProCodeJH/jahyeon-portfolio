import { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  sceneUrl: string;
  className?: string;
  opacity?: number;
}

export function SplineScene({ sceneUrl, className = '', opacity = 0.4 }: SplineSceneProps) {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ opacity }}>
      <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-pulse" />}>
        <Spline scene={sceneUrl} />
      </Suspense>
    </div>
  );
}
