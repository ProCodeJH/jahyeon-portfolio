import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Search,
  Tag,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Type definitions
interface Project {
  id: number;
  title: string;
  description: string;
  longDescription?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  tags?: string[] | null;
  techStack?: string[] | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  createdAt: string;
}

export default function Projects() {
  const [, setLocation] = useLocation();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  const filteredProjects = projects?.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
          <div
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5 text-slate-900" />
            <span className="font-bold text-slate-900 tracking-wide">BACK TO HOME</span>
          </div>
          <div className="font-mono font-bold text-blue-600">PROJECT ARCHIVE</div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto">

        {/* HERO SECTION */}
        <div className="mb-20 md:mb-32">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9]">
            Curated<br />
            <span className="text-blue-600">Works</span>
          </h1>
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl leading-relaxed">
              A collection of technical challenges, system architectures, and creative solutions developed over the years.
            </p>

            {/* SEARCH BAR */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="pl-12 h-14 rounded-full bg-white border-slate-200 text-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* PROJECTS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] h-[500px] animate-pulse bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {filteredProjects?.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                layoutId={`project-${project.id}`}
                onClick={() => setSelectedProject(project as any)}
                className="group cursor-pointer"
              >
                <div className="relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-500 h-[500px] flex flex-col">
                  {/* Image Section */}
                  <div className="relative h-3/5 overflow-hidden bg-slate-100">
                    {project.imageUrl && (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 flex-1 flex flex-col justify-between relative bg-white">
                    <div>
                      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                        {project.tags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-slate-500 line-clamp-2 font-medium">
                        {project.description}
                      </p>
                    </div>

                    <div className="pt-6 mt-auto border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-400">View Details</span>
                      <ChevronRight className="w-5 h-5 text-blue-600 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* PROJECT DETAILS DIALOG (Modern) */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-5xl bg-white p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
          {selectedProject && (
            <div className="flex flex-col md:flex-row h-[90vh] md:h-[700px]">
              {/* Media Side */}
              <div className="w-full md:w-1/2 bg-slate-100 relative overflow-hidden">
                {selectedProject.imageUrl && (
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent md:bg-none" />

                <div className="absolute bottom-0 left-0 p-8 md:hidden">
                  <h2 className="text-3xl font-black text-white mb-2">{selectedProject.title}</h2>
                </div>
              </div>

              {/* Info Side */}
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white">
                <DialogHeader className="mb-8 hidden md:block">
                  <DialogTitle className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
                    {selectedProject.title}
                  </DialogTitle>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.techStack?.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md px-3 py-1">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </DialogHeader>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" /> Description
                    </h4>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      {selectedProject.longDescription || selectedProject.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {selectedProject.githubUrl && (
                      <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full rounded-xl bg-slate-900 text-white h-14 text-lg font-bold hover:bg-slate-800">
                          <Github className="mr-2 w-5 h-5" /> View Source Code
                        </Button>
                      </a>
                    )}
                    {selectedProject.demoUrl && (
                      <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full rounded-xl border-2 border-slate-200 h-14 text-lg font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                          <ExternalLink className="mr-2 w-5 h-5" /> Live Demo
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
