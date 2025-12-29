import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Briefcase, GraduationCap, Award, Zap } from "lucide-react";

const timelineData = [
  {
    year: "2025",
    title: "Coding Instructor",
    company: "Coding Academy",
    description: "Teaching programming fundamentals and embedded systems to aspiring developers",
    icon: GraduationCap,
    color: "from-purple-500 to-pink-500",
    achievements: ["100+ students taught", "5-star rating", "Custom curriculum development"]
  },
  {
    year: "2023-2024",
    title: "Senior Research Engineer",
    company: "LG Electronics",
    description: "Leading firmware development and optimization for next-gen embedded systems",
    icon: Briefcase,
    color: "from-blue-500 to-cyan-500",
    achievements: ["Led 3 major projects", "Patent filed", "Team leadership"]
  },
  {
    year: "2022-2024",
    title: "Logistics Systems Engineer",
    company: "SHL Co., Ltd. (Hankook Tire Partner)",
    description: "Developed automated systems for industrial logistics and warehouse management",
    icon: Zap,
    color: "from-orange-500 to-yellow-500",
    achievements: ["30% efficiency increase", "IoT integration", "Real-time tracking"]
  },
  {
    year: "2022",
    title: "Data Analysis Engineer",
    company: "Nordground (LG Partner)",
    description: "Data analysis and optimization for manufacturing processes",
    icon: Award,
    color: "from-emerald-500 to-teal-500",
    achievements: ["ML model deployment", "Process optimization", "Data pipeline"]
  }
];

export function InteractiveTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="py-32 px-4 md:px-8 bg-gradient-to-br from-white to-purple-50/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 backdrop-blur-xl mb-6"
          >
            <Briefcase className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-bold text-purple-600 tracking-wider uppercase">My Journey</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
              Career Timeline
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            From embedded systems to education - building the future
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Animated Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-200 to-blue-200 rounded-full" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-8 md:left-1/2 top-0 w-1 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/50"
          />

          {/* Timeline Items */}
          <div className="space-y-16">
            {timelineData.map((item, index) => {
              const Icon = item.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative flex items-center ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-row`}
                >
                  {/* Content Card */}
                  <div className={`flex-1 ${isEven ? 'md:pr-16 pl-16 md:pl-0' : 'md:pl-16 pl-16'}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border-2 border-purple-100 shadow-xl hover:shadow-2xl hover:border-purple-300 transition-all duration-500 group"
                    >
                      {/* Year Badge */}
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 mb-4">
                        <span className="text-sm font-black text-purple-600">{item.year}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-lg font-bold text-purple-600 mb-3">{item.company}</p>
                      <p className="text-gray-600 leading-relaxed mb-4">{item.description}</p>

                      {/* Achievements */}
                      <div className="flex flex-wrap gap-2">
                        {item.achievements.map((achievement, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50 text-xs font-semibold text-purple-700"
                          >
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Center Icon */}
                  <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 z-10">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-2xl border-4 border-white group-hover:shadow-purple-500/50`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
