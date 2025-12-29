import { motion } from "framer-motion";
import { useState } from "react";
import { Code, Cpu, Zap, Database, Globe, Terminal, Layers, GitBranch } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  category: string;
  icon: any;
  color: string;
  projects: number;
  description: string;
}

const skills: Skill[] = [
  {
    id: "c-cpp",
    name: "C/C++",
    level: 9,
    maxLevel: 10,
    category: "Core",
    icon: Terminal,
    color: "from-blue-500 to-cyan-500",
    projects: 25,
    description: "Embedded systems, firmware, RTOS"
  },
  {
    id: "python",
    name: "Python",
    level: 8,
    maxLevel: 10,
    category: "Core",
    icon: Code,
    color: "from-green-500 to-emerald-500",
    projects: 18,
    description: "Automation, data analysis, AI/ML"
  },
  {
    id: "embedded",
    name: "Embedded Systems",
    level: 9,
    maxLevel: 10,
    category: "Specialty",
    icon: Cpu,
    color: "from-purple-500 to-pink-500",
    projects: 30,
    description: "MCU, RTOS, firmware optimization"
  },
  {
    id: "iot",
    name: "IoT",
    level: 8,
    maxLevel: 10,
    category: "Specialty",
    icon: Zap,
    color: "from-orange-500 to-yellow-500",
    projects: 15,
    description: "Sensors, connectivity, automation"
  },
  {
    id: "fullstack",
    name: "Full-Stack Dev",
    level: 7,
    maxLevel: 10,
    category: "Web",
    icon: Globe,
    color: "from-indigo-500 to-purple-500",
    projects: 12,
    description: "React, Node.js, databases"
  },
  {
    id: "database",
    name: "Databases",
    level: 7,
    maxLevel: 10,
    category: "Backend",
    icon: Database,
    color: "from-cyan-500 to-blue-500",
    projects: 10,
    description: "SQL, PostgreSQL, optimization"
  },
  {
    id: "devops",
    name: "DevOps",
    level: 6,
    maxLevel: 10,
    category: "Infrastructure",
    icon: GitBranch,
    color: "from-pink-500 to-rose-500",
    projects: 8,
    description: "CI/CD, Docker, Git"
  },
  {
    id: "architecture",
    name: "System Design",
    level: 8,
    maxLevel: 10,
    category: "Architecture",
    icon: Layers,
    color: "from-violet-500 to-purple-500",
    projects: 20,
    description: "Scalable systems, patterns"
  }
];

export function SkillTree() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  return (
    <section className="py-32 px-4 md:px-8 bg-gradient-to-br from-gray-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
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
            <Layers className="w-5 h-5 text-purple-300" />
            <span className="text-sm font-bold text-purple-300 tracking-wider uppercase">Skill Tree</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300">
              Technical Arsenal
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Level up through projects and experience
          </motion.p>
        </div>

        {/* Skill Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            const progress = (skill.level / skill.maxLevel) * 100;

            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -10 }}
                onClick={() => setSelectedSkill(skill)}
                className="relative group cursor-pointer"
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${skill.color} rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`} />

                {/* Card */}
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/20 hover:border-white/40 transition-all duration-500">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Name & Level */}
                  <h3 className="text-xl font-black text-white mb-2">{skill.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-purple-300">LV {skill.level}</span>
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progress}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
                        className={`h-full bg-gradient-to-r ${skill.color} rounded-full shadow-lg`}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{skill.category}</span>
                    <span className="px-2 py-1 rounded-full bg-white/10 text-white font-bold">
                      {skill.projects} projects
                    </span>
                  </div>

                  {/* XP Bar Glow */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${skill.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Skill Detail */}
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className={`absolute -inset-2 bg-gradient-to-r ${selectedSkill.color} rounded-3xl opacity-30 blur-2xl`} />
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border-2 border-white/30">
              <div className="flex items-start gap-6">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${selectedSkill.color} flex items-center justify-center shadow-2xl flex-shrink-0`}>
                  <selectedSkill.icon className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-3xl font-black text-white">{selectedSkill.name}</h3>
                    <span className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${selectedSkill.color} text-white text-sm font-black`}>
                      Level {selectedSkill.level}
                    </span>
                  </div>
                  <p className="text-lg text-gray-300 mb-4">{selectedSkill.description}</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-400">Category</p>
                      <p className="text-lg font-bold text-white">{selectedSkill.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Projects Completed</p>
                      <p className="text-lg font-bold text-white">{selectedSkill.projects}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Mastery</p>
                      <p className="text-lg font-bold text-white">{((selectedSkill.level / selectedSkill.maxLevel) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
