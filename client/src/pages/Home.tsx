import { useEffect, useRef, useState } from "react";
import type { Project } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  ArrowUpRight,
  Code,
  Cpu,
  Database,
  Github,
  Linkedin,
  Mail,
  Moon,
  Server,
  Sparkles,
  Sun,
} from "lucide-react";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full"
    >
      <Sun className="h-5 w-5 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

const HERO_IMAGES = {
  main: {
    src: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=1600&fit=crop",
    alt: "Modern workstation with ambient lighting",
    label: "System core",
  },
  overlay: {
    src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&h=1200&fit=crop",
    alt: "Industrial robot arm",
    label: "Autonomous arm",
  },
  detail: {
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop",
    alt: "Circuit traces",
    label: "Signal traces",
  },
  spine: {
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&h=1200&fit=crop",
    alt: "Server corridor",
    label: "Data spine",
  },
};

const FUTURE_LAB_IMAGES = {
  base: {
    src: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1200&h=900&fit=crop",
    alt: "Developer workstation",
    label: "Control surface",
  },
  overlay: {
    src: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=900&h=1200&fit=crop",
    alt: "Datacenter aisle",
    label: "Compute bay",
  },
  chip: {
    src: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=900&h=900&fit=crop",
    alt: "Circuit detail",
    label: "Interface layer",
  },
};

const GALLERY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=1200&h=900&fit=crop",
    alt: "Data visualization",
    label: "Data lattice",
  },
  {
    src: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&h=900&fit=crop",
    alt: "Circuit surface",
    label: "Signal matrix",
  },
  {
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=900&fit=crop",
    alt: "Server corridor",
    label: "Infrastructure",
  },
  {
    src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=900&fit=crop",
    alt: "Robot in lab",
    label: "Autonomous lab",
  },
];

const MARQUEE_ITEMS = [
  "Embedded Systems",
  "Firmware",
  "IoT",
  "C/C++",
  "Python",
  "RTOS",
  "Sensor Networks",
  "Edge Analytics",
  "Automation",
  "Hardware Debug",
  "Spatial UI",
  "Digital Twins",
  "3D Prototyping",
];

const CAPABILITIES = [
  {
    icon: Cpu,
    title: "Firmware Architecture",
    description:
      "Designing stable firmware stacks with tight resource budgets and clear diagnostics.",
    tag: "RTOS, C/C++",
    accent: "#2C5EFF",
  },
  {
    icon: Code,
    title: "Hardware to UI",
    description:
      "Bridging serial data, dashboards, and user flows so products feel polished.",
    tag: "Interfaces, Tools",
    accent: "#FF5B3A",
  },
  {
    icon: Server,
    title: "IoT Prototyping",
    description:
      "Rapidly validating sensor networks, power profiles, and connectivity plans.",
    tag: "Sensors, MQTT",
    accent: "#0E7D5C",
  },
  {
    icon: Database,
    title: "Data Diagnostics",
    description:
      "Turning logs and telemetry into actionable insights for product teams.",
    tag: "Analytics",
    accent: "#6B46C1",
  },
];

const EXPERIENCE = [
  {
    period: "2025 - Present",
    company: "SHL Co., Ltd.",
    role: "Logistics Management",
    current: true,
  },
  {
    period: "2023 - 2024",
    company: "LG Electronics",
    role: "Senior Research Institute",
    current: false,
  },
  {
    period: "2022",
    company: "Nordground",
    role: "Data Analyst",
    current: false,
  },
  {
    period: "2021 - 2022",
    company: "UHS Co., Ltd.",
    role: "Embedded Developer",
    current: false,
  },
];

type ProjectCardItem = Pick<
  Project,
  | "id"
  | "title"
  | "description"
  | "technologies"
  | "category"
  | "imageUrl"
  | "projectUrl"
  | "githubUrl"
>;

const FALLBACK_PROJECTS: ProjectCardItem[] = [
  {
    id: 1,
    title: "Autonomous Sensor Hub",
    description:
      "Low power firmware and sensor fusion pipeline for multi-node monitoring.",
    technologies: "C, RTOS, SPI, Power optimization",
    category: "embedded",
    imageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=900&fit=crop",
    projectUrl: null,
    githubUrl: null,
  },
  {
    id: 2,
    title: "Smart Equipment Monitor",
    description:
      "Edge device for predictive maintenance with streaming telemetry.",
    technologies: "Python, MQTT, Analytics",
    category: "iot",
    imageUrl:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=900&fit=crop",
    projectUrl: null,
    githubUrl: null,
  },
  {
    id: 3,
    title: "Firmware Test Rig",
    description:
      "Automation suite for serial QA, data capture, and regression checks.",
    technologies: "C, Python, UART",
    category: "c_lang",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=900&fit=crop",
    projectUrl: null,
    githubUrl: null,
  },
  {
    id: 4,
    title: "IoT Dashboard Layer",
    description:
      "Operator interface for real-time status, alarms, and fleet health.",
    technologies: "React, Data viz, APIs",
    category: "software",
    imageUrl:
      "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=1200&h=900&fit=crop",
    projectUrl: null,
    githubUrl: null,
  },
];

const CATEGORY_META: Record<
  string,
  { label: string; accent: string; bg: string }
> = {
  c_lang: { label: "C/C++", accent: "#2C5EFF", bg: "#E9EDFF" },
  arduino: { label: "Arduino", accent: "#0E7D5C", bg: "#E2F7EE" },
  python: { label: "Python", accent: "#F59E0B", bg: "#FFF2D9" },
  embedded: { label: "Embedded", accent: "#111111", bg: "#EFEAE2" },
  iot: { label: "IoT", accent: "#FF5B3A", bg: "#FFE3DD" },
  firmware: { label: "Firmware", accent: "#6B46C1", bg: "#EFE9FF" },
  hardware: { label: "Hardware", accent: "#0F766E", bg: "#E4F3F1" },
  software: { label: "Software", accent: "#2563EB", bg: "#E5EEFF" },
};

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isInView };
}

function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isInView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        transform: isInView ? "translateY(0)" : "translateY(40px)",
        opacity: isInView ? 1 : 0,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function parseTechnologies(technologies: string): string[] {
  return technologies
    .split(",")
    .map((tech) => tech.trim())
    .filter((tech) => tech.length > 0);
}

function getCategoryMeta(category: string) {
  return (
    CATEGORY_META[category] || {
      label: category.replace("_", " "),
      accent: "#111111",
      bg: "#EFEAE2",
    }
  );
}

function ProjectCard({
  project,
  size,
}: {
  project: ProjectCardItem;
  size: "large" | "small";
}) {
  const meta = getCategoryMeta(project.category);
  const technologies = parseTechnologies(project.technologies);
  const isLarge = size === "large";

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80 dark:hover:shadow-blue-950/50 ${
        isLarge ? "md:col-span-7" : "md:col-span-5"
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          isLarge ? "aspect-[16/9]" : "aspect-[4/3]"
        }`}
      >
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800 text-sm text-slate-400 dark:text-slate-500">
            Image pending
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute left-4 top-4">
          <span
            className="rounded-full border px-4 py-1 text-[10px] uppercase tracking-[0.3em]"
            style={{
              backgroundColor: meta.bg,
              color: meta.accent,
              borderColor: meta.accent,
            }}
          >
            {meta.label}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-display leading-tight">
            {project.title}
          </h3>
          <ArrowUpRight className="h-5 w-5 text-slate-400 dark:text-slate-500 transition-colors group-hover:text-slate-800 dark:group-hover:text-white" />
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {project.description}
        </p>
        {technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {technologies.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 px-3 py-1 text-xs text-slate-600 dark:text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Live
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Code
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroStack() {
  return (
    <div className="relative rounded-[36px] border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-800/30 p-6 shadow-2xl shadow-blue-200/50 dark:shadow-blue-950/50">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-black/10 dark:border-white/10"
      >
        <img
          src={HERO_IMAGES.main.src}
          alt={HERO_IMAGES.main.alt}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-4 left-4 rounded-full bg-white/80 dark:bg-slate-900/80 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-black/70 dark:text-white/70">
          {HERO_IMAGES.main.label}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();
  const projectCount = projects?.length ?? 0;
  const featuredProjects = (projects?.length ? projects : FALLBACK_PROJECTS).slice(
    0,
    4
  );
  const [firstProject, ...restProjects] = featuredProjects;

  const metrics = [
    { label: "Years", value: "3+" },
    { label: "Systems", value: projectCount ? `${projectCount}+` : "12+" },
    { label: "Focus", value: "Firmware + IoT" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-50 font-body">
      <nav className="fixed left-0 right-0 top-6 z-40">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 px-6 py-3 backdrop-blur">
            <Link href="/">
              <span className="font-display text-lg tracking-[0.35em]">JH</span>
            </Link>
            <div className="hidden items-center gap-1 text-xs uppercase tracking-[0.3em] text-black/60 dark:text-white/60 md:flex">
              {["About", "Projects", "Certifications", "Resources", "Admin"].map(
                (item) => (
                  <Link key={item} href={`/${item.toLowerCase()}`}>
                    <span className="rounded-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">{item}</span>
                  </Link>
                )
              )}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a
                href="mailto:contact@jahyeon.com"
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-transparent px-4 py-2 text-xs uppercase tracking-[0.3em] text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden lg:inline">Contact</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="pt-36 pb-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <AnimatedSection>
                <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Embedded + Experience
                </div>
              </AnimatedSection>
              <AnimatedSection delay={100}>
                <h1 className="mt-8 font-display text-[clamp(2.8rem,7vw,6rem)] leading-[0.95]">
                  Hardware intelligence
                  <span className="mt-3 block">
                    with{" "}
                    <span className="relative inline-block">
                      studio-grade clarity
                      <span className="absolute left-0 right-0 top-[70%] h-3 -translate-y-1/2 bg-blue-300/50 dark:bg-blue-500/30" />
                    </span>
                  </span>
                </h1>
              </AnimatedSection>
              <AnimatedSection delay={200}>
                <p className="mt-6 max-w-xl text-lg text-slate-500 dark:text-slate-400">
                  Firmware, IoT prototypes, and spatial diagnostics delivered
                  with the restraint of print and the ambition of future tech.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={300}>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/projects">
                    <Button className="h-12 rounded-full bg-slate-900 px-6 text-white hover:bg-blue-600 dark:bg-white dark:text-slate-900 dark:hover:bg-blue-300">
                      Explore Work
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button
                      variant="outline"
                      className="h-12 rounded-full border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-transparent px-6"
                    >
                      About Studio
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={400}>
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4"
                    >
                      <div className="font-display text-2xl">
                        {metric.value}
                      </div>
                      <div className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            <div className="lg:col-span-5">
              <AnimatedSection delay={200}>
                <div className="relative mt-10 lg:mt-0">
                  <div className="absolute -top-8 right-2 hidden items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-500/20 px-4 py-2 text-xs uppercase tracking-[0.25em] text-blue-800 dark:text-blue-300 shadow-lg md:inline-flex">
                    <Sparkles className="h-3 w-3" />
                    3D Studio
                  </div>
                  <HeroStack />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12 lg:items-center">
            <AnimatedSection className="lg:col-span-5">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                Future Lab
              </div>
              <h2 className="mt-5 font-display text-4xl">
                Spatial systems, crafted with intent
              </h2>
              <p className="mt-4 text-base text-slate-500 dark:text-slate-400">
                A gallery of depth-first layouts and 3D details inspired by
                immersive portfolios. Hover to tilt and explore each layer.
              </p>
              <div className="mt-6 space-y-3 text-sm text-slate-500 dark:text-slate-400">
                {[
                  "Studio-led storytelling for complex systems",
                  "Futuristic material studies with real-world logic",
                  "Layered stacks that mirror firmware pipelines",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-slate-800 dark:bg-slate-300" />
                    {item}
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150} className="lg:col-span-7">
              <div className="relative rounded-[36px] border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-800/30 p-6 shadow-2xl shadow-blue-200/50 dark:shadow-blue-950/50">
                <div
                  className="relative aspect-[16/9] overflow-hidden rounded-[28px] border border-black/10 dark:border-white/10"
                >
                  <img
                    src={FUTURE_LAB_IMAGES.base.src}
                    alt={FUTURE_LAB_IMAGES.base.alt}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 rounded-full bg-white/80 dark:bg-slate-900/80 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-black/70 dark:text-white/70">
                    {FUTURE_LAB_IMAGES.base.label}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="border-y border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 py-10">
          <div className="overflow-hidden">
            <div className="flex gap-10 whitespace-nowrap animate-marquee px-6 text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
                <div key={`${item}-${index}`} className="flex items-center gap-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400/50 dark:bg-slate-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <AnimatedSection>
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Selected Work
                </div>
                <h2 className="mt-4 font-display text-4xl sm:text-5xl">
                  Projects with precision and personality
                </h2>
                <p className="mt-4 max-w-2xl text-base text-slate-500 dark:text-slate-400">
                  A curated mix of embedded systems, diagnostics, and IoT
                  experiments shaped by real constraints.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={100}>
                <Link href="/projects">
                  <Button
                    variant="outline"
                    className="h-12 rounded-full border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-transparent px-6"
                  >
                    View all projects
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </AnimatedSection>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-12">
              {firstProject && (
                <ProjectCard project={firstProject} size="large" />
              )}
              {restProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  size="small"
                />
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
            <AnimatedSection className="lg:col-span-4">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Capabilities
              </div>
              <h2 className="mt-5 font-display text-4xl">
                Technical depth with design rigor
              </h2>
              <p className="mt-4 text-base text-slate-500 dark:text-slate-400">
                Each project blends engineering focus with a visual and product
                lens. I care about clarity as much as correctness.
              </p>
            </AnimatedSection>

            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
              {CAPABILITIES.map((item) => {
                const Icon = item.icon;
                const accentBg = `${item.accent}22`;
                return (
                  <AnimatedSection key={item.title} delay={100}>
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-lg shadow-slate-200/50 dark:shadow-blue-950/30">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: accentBg, color: item.accent }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                          {item.tag}
                        </div>
                      </div>
                      <h3 className="mt-4 font-display text-xl">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <AnimatedSection>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Visual Library
              </div>
              <h2 className="mt-4 font-display text-4xl">
                Modern to futuristic references
              </h2>
              <p className="mt-4 max-w-2xl text-base text-slate-500 dark:text-slate-400">
                A visual set that blends contemporary hardware labs with
                forward-looking interfaces. These references guide the tone of
                the portfolio.
              </p>
            </AnimatedSection>

            <div className="mt-10 grid gap-6 lg:grid-cols-12">
              <AnimatedSection className="lg:col-span-7">
                <div className="group relative overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
                  <div className="aspect-[4/3]">
                    <img
                      src={GALLERY_IMAGES[0].src}
                      alt={GALLERY_IMAGES[0].alt}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute bottom-4 left-4 rounded-full bg-white/80 dark:bg-slate-900/80 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-black/70 dark:text-white/70">
                    {GALLERY_IMAGES[0].label}
                  </div>
                </div>
              </AnimatedSection>
              <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5">
                {GALLERY_IMAGES.slice(1).map((item) => (
                  <AnimatedSection key={item.label} delay={100}>
                    <div className="group relative overflow-hidden rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
                      <div className="aspect-[4/3]">
                        <img
                          src={item.src}
                          alt={item.alt}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute bottom-3 left-3 rounded-full bg-white/80 dark:bg-slate-900/80 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-black/70 dark:text-white/70">
                        {item.label}
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
            <AnimatedSection className="lg:col-span-4">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                Experience
              </div>
              <h2 className="mt-5 font-display text-4xl">
                A focused technical journey
              </h2>
              <p className="mt-4 text-base text-slate-500 dark:text-slate-400">
                Embedded systems, data diagnostics, and product support across
                multiple industries.
              </p>
            </AnimatedSection>

            <div className="space-y-4 lg:col-span-8">
              {EXPERIENCE.map((exp) => (
                <AnimatedSection key={exp.company} delay={100}>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                          {exp.period}
                        </div>
                        <h3 className="mt-2 font-display text-lg">
                          {exp.company}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{exp.role}</p>
                      </div>
                      {exp.current && (
                        <span className="rounded-full bg-blue-500 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <AnimatedSection>
              <div className="relative overflow-hidden rounded-[32px] bg-slate-900 p-10 text-white md:p-14">
                <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] " />
                <div className="relative z-10 grid gap-10 md:grid-cols-2 md:items-center">
                  <div>
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      Collaborate
                    </div>
                    <h2 className="mt-5 font-display text-4xl">
                      Ready to build the next system?
                    </h2>
                    <p className="mt-4 text-base text-slate-400">
                      I am open to embedded projects, IoT experiments, and
                      product collaborations.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <a href="mailto:contact@jahyeon.com">
                      <Button className="h-12 rounded-full bg-white px-6 text-slate-900 hover:bg-blue-200">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Me
                      </Button>
                    </a>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="h-12 rounded-full border-slate-700 px-6 text-white"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </Button>
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="h-12 rounded-full border-slate-700 px-6 text-white"
                      >
                        <Linkedin className="mr-2 h-4 w-4" />
                        LinkedIn
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 text-sm text-slate-500 md:flex-row md:items-center">
          <p>Copyright 2024 Gu Jahyeon. All rights reserved.</p>
          <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.3em]">
            <a href="https://github.com" className="hover:text-black dark:hover:text-white">
              Github
            </a>
            <a href="https://linkedin.com" className="hover:text-black dark:hover:text-white">
              LinkedIn
            </a>
            <a href="mailto:contact@jahyeon.com" className="hover:text-black dark:hover:text-white">
              Email
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
