import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Code, Zap, CircuitBoard, GraduationCap, Layers, Sparkles, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// ==================== TYPES ====================
interface ServiceCardProps {
    title: string[];
    description: string;
    image?: string;
    variant: "light" | "lime" | "dark";
    arrowVariant: "dark" | "light";
    icon: React.ElementType;
}

// ==================== DATA ====================
const services: ServiceCardProps[] = [
    {
        title: ["Embedded", "Systems"],
        description: "MCU programming, RTOS development, and firmware optimization",
        variant: "light",
        arrowVariant: "dark",
        icon: CircuitBoard,
    },
    {
        title: ["Software", "Development"],
        description: "Full-stack development with Python, Java, C/C++",
        variant: "lime",
        arrowVariant: "dark",
        icon: Code,
    },
    {
        title: ["IoT", "Solutions"],
        description: "Connected devices, smart sensors, and automation",
        variant: "dark",
        arrowVariant: "light",
        icon: Zap,
    },
    {
        title: ["Coding", "Education"],
        description: "Teaching programming fundamentals to 500+ students",
        variant: "light",
        arrowVariant: "dark",
        icon: GraduationCap,
    },
];

const experiences = [
    {
        year: "2025",
        company: "Coding Academy",
        role: "Coding Instructor",
        current: true,
    },
    {
        year: "~2024.11",
        company: "SHL Co., Ltd.",
        role: "Logistics Systems (Hankook Tire Partner)",
        current: false,
    },
    {
        year: "2023-24",
        company: "LG Electronics",
        role: "Senior Research Engineer",
        current: false,
    },
    {
        year: "2022",
        company: "Nordground",
        role: "Data Analysis & Optimization",
        current: false,
    },
];

const processSteps = [
    {
        number: "01",
        title: "Consultation",
        content: "Understanding your project requirements, goals, and technical constraints to create a tailored solution.",
    },
    {
        number: "02",
        title: "Design & Planning",
        content: "Creating system architecture, UI/UX designs, and detailed technical specifications.",
    },
    {
        number: "03",
        title: "Development",
        content: "Building robust solutions using latest technologies with clean, maintainable code.",
    },
    {
        number: "04",
        title: "Testing & Deployment",
        content: "Rigorous testing and smooth deployment with ongoing support and maintenance.",
    },
];

// ==================== COMPONENTS ====================

function SectionHeading({ title, description }: { title: string; description: string }) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 px-4 md:px-[100px] max-w-[1440px] mx-auto">
            <span className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-[40px] font-medium text-black bg-positivus-lime px-2 py-1 rounded-md whitespace-nowrap">
                {title}
            </span>
            <p className="font-[family-name:var(--font-space-grotesk)] text-lg text-black max-w-[580px]">
                {description}
            </p>
        </div>
    );
}

function ServiceCard({ title, description, variant, arrowVariant, icon: Icon }: ServiceCardProps) {
    const bgClass =
        variant === "light"
            ? "bg-positivus-gray"
            : variant === "lime"
                ? "bg-positivus-lime"
                : "bg-positivus-dark";
    const textClass = variant === "dark" ? "text-white" : "text-black";
    const titleBgClass =
        variant === "dark"
            ? "bg-white text-black"
            : variant === "lime"
                ? "bg-black text-positivus-lime"
                : "bg-positivus-lime text-black";

    return (
        <div
            className={`${bgClass} rounded-[45px] border border-positivus-dark shadow-[0px_5px_0px_#191a23] p-8 md:p-12 flex justify-between min-h-[280px] md:min-h-[310px] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
        >
            <div className="flex flex-col justify-between z-10">
                <div className="flex flex-col gap-0">
                    {title.map((line, i) => (
                        <span
                            key={i}
                            className={`font-[family-name:var(--font-space-grotesk)] text-xl md:text-[30px] font-medium ${titleBgClass} px-1 w-fit`}
                        >
                            {line}
                        </span>
                    ))}
                </div>
                <p className={`font-[family-name:var(--font-space-grotesk)] text-sm md:text-base ${textClass} mt-4 max-w-[200px]`}>
                    {description}
                </p>
                <Link href="/projects">
                    <div className="flex items-center gap-4 cursor-pointer group/link mt-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${arrowVariant === "dark" ? "bg-positivus-dark" : "bg-white"} group-hover/link:scale-110 transition-transform`}>
                            <ArrowRight className={`w-5 h-5 ${arrowVariant === "dark" ? "text-positivus-lime" : "text-positivus-dark"}`} />
                        </div>
                        <span className={`font-[family-name:var(--font-space-grotesk)] text-xl ${textClass} hidden md:inline`}>
                            Learn more
                        </span>
                    </div>
                </Link>
            </div>
            <div className={`w-[100px] md:w-[150px] h-[100px] md:h-[150px] rounded-3xl ${variant === "dark" ? "bg-white/10" : "bg-positivus-dark/10"} backdrop-blur-xl flex items-center justify-center absolute right-6 top-1/2 -translate-y-1/2 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <Icon className={`w-12 h-12 md:w-16 md:h-16 ${variant === "dark" ? "text-white" : "text-positivus-dark"}`} />
            </div>
        </div>
    );
}

function Hero() {
    return (
        <section className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 px-4 md:px-[100px] py-16 md:py-24 max-w-[1440px] mx-auto">
            <div className="flex flex-col gap-6 md:gap-9 max-w-[600px]">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-positivus-lime/30 border border-positivus-lime w-fit">
                    <div className="w-2 h-2 rounded-full bg-positivus-dark animate-pulse" />
                    <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-positivus-dark">
                        Embedded Engineer & Coding Instructor
                    </span>
                </div>
                <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-[60px] font-medium leading-tight text-black">
                    Thinking of ideas that help the world,{" "}
                    <span className="bg-positivus-lime px-2">creating, growing</span>
                </h1>
                <p className="font-[family-name:var(--font-space-grotesk)] text-lg md:text-xl text-positivus-muted leading-7">
                    Walking the path toward bigger dreams. Specialized in embedded systems,
                    IoT solutions, and coding education.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/projects">
                        <Button className="font-[family-name:var(--font-space-grotesk)] text-lg md:text-xl text-white bg-positivus-dark rounded-[14px] px-6 md:px-9 py-4 md:py-5 hover:bg-positivus-dark/90 transition-colors h-auto">
                            View Projects
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/resources">
                        <Button variant="outline" className="font-[family-name:var(--font-space-grotesk)] text-lg md:text-xl text-positivus-dark border-2 border-positivus-dark rounded-[14px] px-6 md:px-9 py-4 md:py-5 hover:bg-positivus-lime hover:border-positivus-lime transition-colors h-auto">
                            Resources
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="relative w-full max-w-[500px] lg:max-w-[550px]">
                <div className="aspect-square rounded-[45px] bg-gradient-to-br from-positivus-lime via-positivus-gray to-white flex items-center justify-center overflow-hidden shadow-2xl">
                    <div className="w-[80%] h-[80%] rounded-[35px] bg-positivus-dark flex items-center justify-center">
                        <div className="text-center">
                            <Sparkles className="w-16 h-16 text-positivus-lime mx-auto mb-4" />
                            <p className="font-[family-name:var(--font-space-grotesk)] text-white text-xl font-medium">Gu Jahyeon</p>
                            <p className="font-[family-name:var(--font-space-grotesk)] text-positivus-lime text-sm">구자현</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Services() {
    return (
        <section id="services" className="py-16 md:py-24">
            <SectionHeading
                title="Expertise"
                description="Specialized in embedded systems, IoT solutions, software development, and coding education with 500+ students taught."
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 px-4 md:px-[100px] mt-12 md:mt-16 max-w-[1440px] mx-auto">
                {services.map((service, index) => (
                    <ServiceCard key={index} {...service} />
                ))}
            </div>
        </section>
    );
}

function Experience() {
    return (
        <section className="py-16 md:py-24">
            <SectionHeading
                title="Experience"
                description="Professional journey through leading tech companies and education"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-4 md:px-[100px] mt-12 md:mt-16 max-w-[1440px] mx-auto">
                {experiences.map((exp, index) => (
                    <div
                        key={index}
                        className={`group relative p-6 md:p-10 rounded-[45px] border border-positivus-dark shadow-[0px_5px_0px_#191a23] ${exp.current ? "bg-positivus-lime" : "bg-positivus-gray"
                            } hover:scale-[1.02] transition-transform duration-300`}
                    >
                        <div className="flex items-start gap-4 md:gap-6">
                            <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center flex-shrink-0 ${exp.current ? "bg-positivus-dark" : "bg-positivus-dark/10"
                                }`}>
                                <Layers className={`w-7 h-7 md:w-10 md:h-10 ${exp.current ? "text-positivus-lime" : "text-positivus-dark"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-2 md:mb-3">
                                    <span className="font-[family-name:var(--font-space-grotesk)] text-sm md:text-base font-bold font-mono text-positivus-dark/70">
                                        {exp.year}
                                    </span>
                                    {exp.current && (
                                        <span className="px-3 py-1 rounded-full bg-positivus-dark text-positivus-lime text-xs md:text-sm font-bold">
                                            CURRENT
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-3xl font-bold text-positivus-dark mb-1 md:mb-2">
                                    {exp.company}
                                </h3>
                                <p className="font-[family-name:var(--font-space-grotesk)] text-base md:text-lg text-positivus-dark/70">
                                    {exp.role}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function WorkingProcess() {
    return (
        <section className="py-16 md:py-24">
            <SectionHeading
                title="Process"
                description="Step-by-step approach to delivering high-quality solutions"
            />
            <div className="flex flex-col gap-6 md:gap-8 px-4 md:px-[100px] mt-12 md:mt-16 max-w-[1440px] mx-auto">
                <Accordion type="single" collapsible defaultValue="item-0">
                    {processSteps.map((step, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className={`${index === 0 ? "bg-positivus-lime" : "bg-positivus-gray"
                                } rounded-[45px] border border-positivus-dark shadow-[0px_5px_0px_#191a23] mb-6 md:mb-8 px-6 md:px-12 py-4 md:py-6 data-[state=open]:bg-positivus-lime`}
                        >
                            <AccordionTrigger className="hover:no-underline [&[data-state=open]>div>.plus-icon]:hidden [&[data-state=closed]>div>.minus-icon]:hidden">
                                <div className="flex items-center gap-4 md:gap-6 w-full">
                                    <span className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-[60px] font-medium text-positivus-dark">
                                        {step.number}
                                    </span>
                                    <span className="font-[family-name:var(--font-space-grotesk)] text-lg md:text-[30px] font-medium text-positivus-dark text-left">
                                        {step.title}
                                    </span>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="plus-icon w-10 h-10 md:w-14 md:h-14 rounded-full bg-positivus-gray border-2 border-positivus-dark flex items-center justify-center">
                                        <span className="text-2xl md:text-3xl text-positivus-dark">+</span>
                                    </div>
                                    <div className="minus-icon w-10 h-10 md:w-14 md:h-14 rounded-full bg-positivus-gray border-2 border-positivus-dark flex items-center justify-center">
                                        <span className="text-2xl md:text-3xl text-positivus-dark">−</span>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="border-t border-positivus-dark pt-4 md:pt-6 mt-4">
                                    <p className="font-[family-name:var(--font-space-grotesk)] text-base md:text-lg text-positivus-dark">
                                        {step.content}
                                    </p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}

function FeaturedProjects() {
    const { data: projects } = trpc.projects.list.useQuery();

    return (
        <section className="py-16 md:py-24 bg-positivus-dark rounded-t-[45px]">
            <div className="px-4 md:px-[100px] max-w-[1440px] mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 md:mb-16">
                    <div>
                        <span className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-[40px] font-medium text-positivus-dark bg-positivus-lime px-2 py-1 rounded-md">
                            Featured Work
                        </span>
                        <p className="font-[family-name:var(--font-space-grotesk)] text-base md:text-lg text-white/70 mt-4 max-w-[400px]">
                            Explore my latest projects and see how I solve real-world problems
                        </p>
                    </div>
                    <Link href="/projects">
                        <Button className="font-[family-name:var(--font-space-grotesk)] text-base md:text-xl text-positivus-dark bg-positivus-lime rounded-[14px] px-6 md:px-9 py-3 md:py-5 hover:bg-positivus-lime/90 transition-colors h-auto">
                            View All
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {projects?.slice(0, 3).map((project, index) => (
                        <div
                            key={project.id}
                            className="group bg-positivus-gray rounded-[45px] overflow-hidden border border-positivus-dark shadow-[0px_5px_0px_#191a23] hover:scale-[1.02] transition-all duration-300"
                        >
                            <div className="aspect-video overflow-hidden">
                                {project.imageUrl ? (
                                    <img
                                        src={project.imageUrl}
                                        alt={project.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-positivus-lime/20 to-positivus-dark flex items-center justify-center">
                                        <Code className="w-16 h-16 text-positivus-lime/50" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6 md:p-8">
                                <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-2xl font-bold text-positivus-dark mb-2 group-hover:text-positivus-lime transition-colors line-clamp-1">
                                    {project.title}
                                </h3>
                                <p className="font-[family-name:var(--font-space-grotesk)] text-sm md:text-base text-positivus-dark/70 line-clamp-2 mb-4">
                                    {project.description}
                                </p>
                                <Link href="/projects">
                                    <div className="flex items-center gap-2 text-positivus-dark font-[family-name:var(--font-space-grotesk)] font-medium group/link">
                                        <span>View Project</span>
                                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CTASection() {
    return (
        <section className="py-16 md:py-24 bg-positivus-dark">
            <div className="px-4 md:px-[100px] max-w-[1440px] mx-auto">
                <div className="bg-positivus-gray rounded-[45px] p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col gap-4 md:gap-6 max-w-[500px]">
                        <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-[30px] font-medium text-positivus-dark text-center lg:text-left">
                            Let's work together
                        </h2>
                        <p className="font-[family-name:var(--font-space-grotesk)] text-base md:text-lg text-positivus-dark/70 text-center lg:text-left">
                            Have a project in mind? Let's discuss how I can help bring your ideas to life.
                        </p>
                        <div className="flex justify-center lg:justify-start">
                            <Link href="/resources">
                                <Button className="font-[family-name:var(--font-space-grotesk)] text-base md:text-xl text-white bg-positivus-dark rounded-[14px] px-6 md:px-9 py-3 md:py-5 hover:bg-positivus-dark/90 transition-colors h-auto">
                                    Get in touch
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="w-[200px] md:w-[300px] h-[200px] md:h-[300px] rounded-full bg-positivus-lime flex items-center justify-center">
                        <Sparkles className="w-20 h-20 md:w-32 md:h-32 text-positivus-dark" />
                    </div>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="bg-positivus-dark pt-12 md:pt-16 pb-8 md:pb-12">
            <div className="px-4 md:px-[100px] max-w-[1440px] mx-auto">
                {/* Top Row */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12 md:mb-16">
                    <div>
                        <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-bold text-white mb-2">
                            Gu Jahyeon
                        </h3>
                        <p className="font-[family-name:var(--font-space-grotesk)] text-positivus-lime">
                            구자현 • Embedded Developer
                        </p>
                    </div>
                    <nav className="flex flex-wrap gap-6 md:gap-10">
                        <Link href="/" className="font-[family-name:var(--font-space-grotesk)] text-base md:text-lg text-white underline hover:text-positivus-lime transition-colors">
                            Home
                        </Link>
                        <Link href="/projects" className="font-[family-name:var(--font-space-grotesk)] text-base md:text-lg text-white underline hover:text-positivus-lime transition-colors">
                            Projects
                        </Link>
                        <Link href="/resources" className="font-[family-name:var(--font-space-grotesk)] text-base md:text-lg text-white underline hover:text-positivus-lime transition-colors">
                            Resources
                        </Link>
                    </nav>
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-4 mb-12">
                    <span className="font-[family-name:var(--font-space-grotesk)] text-lg md:text-xl font-medium text-positivus-dark bg-positivus-lime px-2 py-1 w-fit rounded">
                        Contact:
                    </span>
                    <p className="font-[family-name:var(--font-space-grotesk)] text-base md:text-lg text-white">
                        Email: contact@jahyeon.com
                    </p>
                </div>

                {/* Bottom Row */}
                <div className="border-t border-white/20 pt-8 md:pt-12 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="font-[family-name:var(--font-space-grotesk)] text-sm md:text-base text-white/70">
                        © 2025 Gu Jahyeon. All Rights Reserved.
                    </p>
                    <Link href="#" className="font-[family-name:var(--font-space-grotesk)] text-sm md:text-base text-white/70 underline hover:text-positivus-lime transition-colors">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </footer>
    );
}

// ==================== MAIN PAGE ====================
export default function HomePositivus() {
    return (
        <div className="min-h-screen bg-white">
            <Navigation />
            <div className="pt-16 md:pt-20">
                <Hero />
                <Services />
                <Experience />
                <WorkingProcess />
                <FeaturedProjects />
                <CTASection />
                <Footer />
            </div>
        </div>
    );
}
