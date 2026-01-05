/**
 * Modern Premium Background - Pure CSS Design
 * 2025 Figma UI Trends: Glassmorphism + Gradient + Minimalism
 *
 * NO React Three Fiber - NO Error #185
 * Pure CSS animations for performance and stability
 */

export function CleanBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient - Modern dark blue to purple */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg,
              #0f0c29 0%,
              #302b63 40%,
              #24243e 70%,
              #0f0c29 100%
            )
          `,
        }}
      />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        {/* Primary orb - Purple/Pink */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[120px] animate-float-slow"
          style={{
            background: 'radial-gradient(circle, #7c3aed 0%, #ec4899 50%, transparent 70%)',
            top: '-10%',
            right: '-5%',
          }}
        />

        {/* Secondary orb - Blue/Cyan */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-25 blur-[100px] animate-float-medium"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, #06b6d4 50%, transparent 70%)',
            bottom: '-15%',
            left: '-10%',
          }}
        />

        {/* Tertiary orb - Indigo */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[80px] animate-float-fast"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, #8b5cf6 50%, transparent 70%)',
            top: '40%',
            left: '30%',
          }}
        />

        {/* Accent orb - Pink/Rose */}
        <div
          className="absolute w-[350px] h-[350px] rounded-full opacity-15 blur-[70px] animate-float-reverse"
          style={{
            background: 'radial-gradient(circle, #f472b6 0%, #fb7185 50%, transparent 70%)',
            top: '60%',
            right: '20%',
          }}
        />
      </div>

      {/* Glassmorphism floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Glass card 1 */}
        <div
          className="absolute w-64 h-64 rounded-3xl animate-float-glass-1"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            top: '15%',
            right: '10%',
            transform: 'rotate(12deg)',
          }}
        />

        {/* Glass card 2 */}
        <div
          className="absolute w-48 h-48 rounded-2xl animate-float-glass-2"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.08)',
            bottom: '20%',
            left: '5%',
            transform: 'rotate(-8deg)',
          }}
        />

        {/* Glass card 3 */}
        <div
          className="absolute w-32 h-32 rounded-xl animate-float-glass-3"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.1)',
            top: '50%',
            left: '15%',
            transform: 'rotate(20deg)',
          }}
        />
      </div>

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Animated lines/streaks */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div
          className="absolute h-px w-[200%] animate-streak-1"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)',
            top: '25%',
            left: '-50%',
          }}
        />
        <div
          className="absolute h-px w-[200%] animate-streak-2"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)',
            top: '65%',
            left: '-50%',
          }}
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -20px) scale(1.05); }
          50% { transform: translate(-20px, 30px) scale(0.95); }
          75% { transform: translate(-30px, -10px) scale(1.02); }
        }

        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 20px) scale(1.03); }
          66% { transform: translate(30px, -30px) scale(0.97); }
        }

        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(40px, -40px); }
        }

        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-30px, 20px) rotate(10deg); }
        }

        @keyframes float-glass-1 {
          0%, 100% { transform: rotate(12deg) translate(0, 0); }
          50% { transform: rotate(15deg) translate(-20px, 30px); }
        }

        @keyframes float-glass-2 {
          0%, 100% { transform: rotate(-8deg) translate(0, 0); }
          50% { transform: rotate(-12deg) translate(30px, -20px); }
        }

        @keyframes float-glass-3 {
          0%, 100% { transform: rotate(20deg) translate(0, 0); }
          50% { transform: rotate(25deg) translate(-15px, 25px); }
        }

        @keyframes streak-1 {
          0% { transform: translateX(-100%) rotate(-2deg); }
          100% { transform: translateX(100%) rotate(-2deg); }
        }

        @keyframes streak-2 {
          0% { transform: translateX(100%) rotate(1deg); }
          100% { transform: translateX(-100%) rotate(1deg); }
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 15s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 10s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 18s ease-in-out infinite;
        }

        .animate-float-glass-1 {
          animation: float-glass-1 25s ease-in-out infinite;
        }

        .animate-float-glass-2 {
          animation: float-glass-2 22s ease-in-out infinite;
        }

        .animate-float-glass-3 {
          animation: float-glass-3 18s ease-in-out infinite;
        }

        .animate-streak-1 {
          animation: streak-1 8s linear infinite;
        }

        .animate-streak-2 {
          animation: streak-2 12s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default CleanBackground;
