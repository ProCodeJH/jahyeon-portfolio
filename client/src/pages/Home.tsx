import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Code, Zap, Sparkles, CircuitBoard, Layers, GraduationCap, BookOpen } from "lucide-react";

// 🌌 COSMIC GALAXY BACKGROUND
function CosmicGalaxy() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Star {
      x: number;
      y: number;
      z: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.z = Math.random() * 1000;
        this.size = Math.random() * 2;
      }

      update() {
        this.z -= 2;
        if (this.z <= 0) {
          this.z = 1000;
          this.x = Math.random() * canvas!.width;
          this.y = Math.random() * canvas!.height;
        }
      }

      draw() {
        if (!ctx || !canvas) return;
        const x = (this.x - canvas.width / 2) * (1000 / this.z) + canvas.width / 2;
        const y = (this.y - canvas.height / 2) * (1000 / this.z) + canvas.height / 2;
        const size = this.size * (1000 / this.z);

        ctx.fillStyle = `rgba(${100 + Math.random() * 155}, ${100 + Math.random() * 155}, 255, ${1 - this.z / 1000})`;
        ctx.fillRect(x, y, size, size);
      }
    }

    const stars: Star[] = Array.from({ length: 500 }, () => new Star());

    function animate() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.update();
        star.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

// 🔮 HOLOGRAPHIC 3D BLOB with VR effect
function HolographicBlob() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-[500px] h-[500px]" style={{ perspective: '1000px' }}>
      <div
        className="absolute inset-0"
        style={{
          transform: `rotateY(${rotation}deg) rotateX(${Math.sin(rotation * 0.01) * 15}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Core hologram */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full blur-3xl opacity-70 animate-pulse"
          style={{ transform: 'translateZ(50px)' }} />
        <div className="absolute inset-8 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-80"
          style={{ transform: 'translateZ(40px)' }} />
        <div className="absolute inset-16 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full blur-xl opacity-90"
          style={{ transform: 'translateZ(30px)' }} />

        {/* Orbiting particles */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 + rotation * 2) * Math.PI / 180;
          const radius = 150;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={i}
              className="absolute w-4 h-4 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translateX(${x}px) translateY(${y}px) translateZ(${Math.sin(angle) * 50}px)`,
                background: `hsl(${i * 30 + rotation}, 100%, 70%)`,
                boxShadow: `0 0 20px hsl(${i * 30 + rotation}, 100%, 70%)`,
              }}
            />
          );
        })}
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: scale(1) rotate(0deg); }
          33% { transform: scale(1.1) rotate(120deg); }
          66% { transform: scale(0.9) rotate(240deg); }
        }
      `}</style>
    </div>
  );
}

// 💫 3D CIRCUIT BOARD ANIMATION
function CircuitAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Animated circuit paths */}
        {Array.from({ length: 20 }).map((_, i) => (
          <g key={i}>
            <circle
              cx={`${10 + i * 5}%`}
              cy={`${20 + (i % 3) * 30}%`}
              r="3"
              fill="url(#circuit-gradient)"
              filter="url(#glow)"
            >
              <animate attributeName="r" values="3;5;3" dur={`${2 + i * 0.1}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;1;0.5" dur={`${2 + i * 0.1}s`} repeatCount="indefinite" />
            </circle>
            <path
              d={`M ${10 + i * 5},${20 + (i % 3) * 30} L ${15 + i * 5},${25 + (i % 3) * 30}`}
              stroke="url(#circuit-gradient)"
              strokeWidth="2"
              fill="none"
              filter="url(#glow)"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="100" dur={`${3 + i * 0.2}s`} repeatCount="indefinite" />
            </path>
          </g>
        ))}
      </svg>
    </div>
  );
}

// 🌟 FLOATING CODE PARTICLES
function FloatingCodeParticles() {
  const particles = [
    '{ }', '< />', 'λ', '∞', '∑', '∫', '≈', '∆', '∇', '⊕',
    '0x', '1', '0', 'fn', '>>',  '<<', '&&', '||', '!=', '=='
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((char, i) => (
        <div
          key={i}
          className="absolute text-2xl font-mono animate-float opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
            color: `hsl(${i * 15}, 70%, 60%)`,
            textShadow: `0 0 10px hsl(${i * 15}, 70%, 60%)`,
          }}
        >
          {char}
        </div>
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.3; }
          25% { transform: translateY(-30px) translateX(20px) rotate(90deg); opacity: 0.6; }
          50% { transform: translateY(-60px) translateX(-20px) rotate(180deg); opacity: 0.3; }
          75% { transform: translateY(-30px) translateX(20px) rotate(270deg); opacity: 0.6; }
        }
        .animate-float { animation: float linear infinite; }
      `}</style>
    </div>
  );
}

// Utility Hook
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isInView };
}

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isInView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${className}`}
      style={{
        transform: isInView ? "translateY(0)" : "translateY(60px)",
        opacity: isInView ? 1 : 0,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black">
        <CosmicGalaxy />
        <CircuitAnimation />
        <FloatingCodeParticles />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 hover:scale-110 transition-transform cursor-pointer">
                JH
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-12">
              {["Work", "About"].map(item => (
                <Link key={item} href={item === "Work" ? "/projects" : `/${item.toLowerCase()}`}>
                  <span className="text-lg font-medium text-white/60 hover:text-white transition-all cursor-pointer relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 group-hover:w-full transition-all" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative pt-32 px-8">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <AnimatedSection>
                <p className="text-xl text-purple-300/60 mb-6">
                  Jahyeon is an Embedded Engineer & Coding Instructor based in South Korea.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <h1 className="text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.95] mb-12 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200">
                  I'm many<br />
                  things.
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={400}>
                <div className="flex flex-wrap gap-3 mb-12">
                  {[
                    "#EmbeddedSystemsEngineer",
                    "#CodingInstructor",
                    "#FirmwareDeveloper",
                    "#IoTSpecialist",
                    "#HardwareLover",
                    "#ArduinoExpert",
                    "#ProblemSolver"
                  ].map(tag => (
                    <span
                      key={tag}
                      className="text-sm font-medium text-purple-300/50 hover:text-cyan-400 transition-all cursor-default hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={600}>
                <div className="flex gap-4">
                  <Link href="/projects">
                    <Button
                      size="lg"
                      className="rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 h-14 text-lg hover:scale-110 transition-all shadow-xl shadow-purple-500/50"
                    >
                      View Work <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection delay={400}>
              <div className="relative flex items-center justify-center">
                <HolographicBlob />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-32 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <h2 className="text-6xl font-bold mb-20 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Expertise
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: CircuitBoard,
                title: "Embedded Systems",
                desc: "MCU programming, RTOS, firmware optimization",
                color: "from-blue-500 to-cyan-500",
                img: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&h=400&fit=crop&q=80"
              },
              {
                icon: Code,
                title: "Software Development",
                desc: "Python, Java, C/C++, Full-stack",
                color: "from-emerald-500 to-teal-500",
                img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop&q=80"
              },
              {
                icon: Zap,
                title: "IoT Solutions",
                desc: "Connected devices, sensors, automation",
                color: "from-orange-500 to-yellow-500",
                img: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&h=400&fit=crop&q=80"
              },
              {
                icon: GraduationCap,
                title: "Coding Education",
                desc: "Teaching programming, mentoring developers",
                color: "from-purple-500 to-pink-500",
                img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop&q=80"
              }
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div className="group relative overflow-hidden rounded-2xl border-2 border-white/10 hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 cursor-pointer h-[400px]">
                  <div className="absolute inset-0">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-60 group-hover:opacity-80 transition-opacity`} />
                  </div>
                  <div className="relative h-full p-8 flex flex-col justify-end">
                    <item.icon className="w-12 h-12 text-white mb-4 drop-shadow-lg" />
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{item.title}</h3>
                    <p className="text-white/90 text-sm drop-shadow">{item.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Experience - Cosmic Timeline */}
      <section className="min-h-screen flex relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-cyan-900/20" />

        <div className="flex-1 bg-gradient-to-br from-emerald-600/80 via-cyan-600/80 to-blue-600/80 backdrop-blur-sm p-20 flex items-center justify-center relative border-r border-white/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djVoNXYtNWgtNXptMC01aDV2NWgtNXYtNXptLTUgMHY1aDV2LTVoLTV6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

          <AnimatedSection>
            <div className="max-w-xl relative z-10">
              <h2 className="text-7xl font-bold text-white mb-12 drop-shadow-2xl">
                Professional<br />Journey
              </h2>
              <p className="text-2xl text-white/90 font-light leading-relaxed drop-shadow-lg">
                From embedded systems engineering to empowering the next generation of developers through education.
              </p>
            </div>
          </AnimatedSection>
        </div>

        <div className="flex-1 bg-black/90 backdrop-blur-sm p-20 flex items-center justify-center border-l border-white/20">
          <AnimatedSection delay={300}>
            <div className="max-w-xl space-y-12">
              {[
                { year: "2025", company: "Coding Academy", role: "Coding Instructor", icon: GraduationCap, current: true },
                { year: "~2024.11", company: "SHL Co., Ltd.", role: "Logistics Systems (Hankook Tire Partner)", icon: Layers, current: false },
                { year: "2023-24", company: "LG Electronics", role: "Senior Research Engineer", icon: CircuitBoard, current: false },
                { year: "2022", company: "Nordground", role: "Data Analysis & Optimization", icon: Sparkles, current: false },
                { year: "2021-22", company: "UHS Co., Ltd.", role: "Embedded Systems Developer", icon: Code, current: false }
              ].map((exp, idx) => {
                const Icon = exp.icon;
                return (
                  <div key={idx} className="group relative pl-12 py-4 border-l-4 border-transparent hover:border-cyan-400 transition-all">
                    <div className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                      <Icon className="w-3 h-3 text-white" />
                    </div>

                    {exp.current && (
                      <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold mb-3 shadow-lg shadow-purple-500/50">
                        Current Position
                      </span>
                    )}
                    <p className="text-cyan-300/70 text-sm mb-2 font-mono">{exp.year}</p>
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{exp.company}</h3>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors">{exp.role}</p>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="py-32 px-8 bg-gradient-to-b from-black to-purple-950/20 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-20">
              <h2 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Featured Work</h2>
              <Link href="/projects">
                <Button variant="outline" size="lg" className="rounded-full border-2 border-purple-500 text-purple-300 hover:bg-purple-500 hover:text-white text-lg px-8 shadow-lg shadow-purple-500/30">
                  View All Projects <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {projects?.slice(0, 3).map((project, idx) => (
              <AnimatedSection key={project.id} delay={idx * 150}>
                <Link href={`/projects`}>
                  <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border-2 border-white/10 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all cursor-pointer aspect-square hover:scale-105">
                    {project.imageUrl && (
                      <>
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-900/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      </>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{project.title}</h3>
                      <p className="text-white/80 line-clamp-2 drop-shadow">{project.description}</p>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-8 bg-gradient-to-b from-purple-950/20 to-black relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <h2 className="text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Let's Connect!
            </h2>
            <p className="text-2xl text-white/60 mb-12 max-w-2xl mx-auto">
              Creating innovative embedded solutions and inspiring the next generation of developers.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/about">
                <Button size="lg" className="rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-10 h-16 text-lg hover:scale-110 transition-all shadow-xl shadow-purple-500/50">
                  Get in Touch
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-2 border-white text-white px-10 h-16 text-lg hover:bg-white hover:text-black transition-all"
                >
                  View Portfolio
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
