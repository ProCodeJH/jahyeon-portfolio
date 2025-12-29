import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Github, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const demoProjects = [
  {
    title: "IoT Smart Home System",
    description: "ESP32-based home automation with real-time monitoring",
    image: "/images/expertise/iot-solutions.jpg",
    tech: ["ESP32", "MQTT", "React"],
    github: "#",
    demo: "#"
  },
  {
    title: "RTOS Firmware Framework",
    description: "Real-time operating system for embedded devices",
    image: "/images/expertise/embedded-systems.jpg",
    tech: ["C", "FreeRTOS", "STM32"],
    github: "#",
    demo: "#"
  },
  {
    title: "Industrial Sensor Network",
    description: "Multi-sensor data acquisition and analysis system",
    image: "/images/expertise/software-development.jpg",
    tech: ["Python", "InfluxDB", "Grafana"],
    github: "#",
    demo: "#"
  },
  {
    title: "Teaching Platform",
    description: "Interactive coding education platform",
    image: "/images/expertise/coding-education.jpg",
    tech: ["React", "Node.js", "PostgreSQL"],
    github: "#",
    demo: "#"
  }
];

export function Project3DGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 20;
    const y = (e.clientX - rect.left - rect.width / 2) / 20;
    setRotation({ x: -x, y });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const nextProject = () => {
    setActiveIndex((prev) => (prev + 1) % demoProjects.length);
  };

  const prevProject = () => {
    setActiveIndex((prev) => (prev - 1 + demoProjects.length) % demoProjects.length);
  };

  const activeProject = demoProjects[activeIndex];

  return (
    <section className="py-32 px-4 md:px-8 bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl mb-6"
          >
            <Sparkles className="w-5 h-5 text-purple-300" />
            <span className="text-sm font-bold text-purple-300 tracking-wider uppercase">3D Gallery</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300">
              Project Showcase
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Explore my work in 3D space
          </motion.p>
        </div>

        {/* 3D Gallery */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative h-[600px] flex items-center justify-center perspective-[2000px]"
          style={{ perspective: "2000px" }}
        >
          {/* Main Project Card */}
          <motion.div
            animate={{
              rotateX: rotation.x,
              rotateY: rotation.y,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative w-full max-w-4xl"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
              {/* Project Image */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={activeProject.image}
                  alt={activeProject.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Project Info */}
              <div className="p-8">
                <h3 className="text-4xl font-black text-white mb-3">{activeProject.title}</h3>
                <p className="text-lg text-gray-300 mb-6">{activeProject.description}</p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {activeProject.tech.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-300/30 text-sm font-bold text-purple-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Demo
                  </Button>
                  <Button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/30">
                    <Github className="mr-2 h-4 w-4" />
                    Source Code
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <button
            onClick={prevProject}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-xl flex items-center justify-center text-white transition-all hover:scale-110 z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextProject}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-xl flex items-center justify-center text-white transition-all hover:scale-110 z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Background Projects (3D depth effect) */}
          {[1, 2, 3].map((offset) => {
            const index = (activeIndex + offset) % demoProjects.length;
            return (
              <div
                key={offset}
                className="absolute w-full max-w-4xl pointer-events-none opacity-20"
                style={{
                  transform: `translateZ(-${offset * 300}px) scale(${1 - offset * 0.15})`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10">
                  <img
                    src={demoProjects[index].image}
                    alt=""
                    className="w-full h-80 object-cover"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-3 mt-12">
          {demoProjects.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`rounded-full transition-all ${
                idx === activeIndex
                  ? "w-12 h-3 bg-gradient-to-r from-purple-500 to-blue-500"
                  : "w-3 h-3 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
