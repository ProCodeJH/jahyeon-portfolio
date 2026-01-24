/**
 * AdminProjects.tsx
 * 프로젝트 CRUD 관리 컴포넌트
 * Admin.tsx에서 분리됨
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, Trash2, Eye, X, Code, ImageIcon } from "lucide-react";
import { toast } from "sonner";

// ============================================
// 🔧 Types
// ============================================
type ProjectCategory = "c_lang" | "arduino" | "python" | "embedded" | "iot";

interface ProjectForm {
  title: string;
  description: string;
  technologies: string;
  category: ProjectCategory;
  imageUrl: string;
  imageKey: string;
  videoUrl: string;
  videoKey: string;
  thumbnailUrl: string;
  thumbnailKey: string;
  projectUrl: string;
  githubUrl: string;
}

interface AdminProjectsProps {
  handleFileUpload: (file: File, onComplete: (url: string, key: string, thumbUrl?: string, thumbKey?: string) => void) => Promise<void>;
  uploading: boolean;
  uploadProgress: number;
}

// ============================================
// 🔧 Constants
// ============================================
const ACCEPTED_FILE_TYPES = {
  image: ".jpg,.jpeg,.png,.gif,.webp",
};

const initialProjectForm: ProjectForm = {
  title: "",
  description: "",
  technologies: "",
  category: "c_lang",
  imageUrl: "",
  imageKey: "",
  videoUrl: "",
  videoKey: "",
  thumbnailUrl: "",
  thumbnailKey: "",
  projectUrl: "",
  githubUrl: "",
};

// ============================================
// 🚀 AdminProjects Component
// ============================================
export default function AdminProjects({ handleFileUpload, uploading, uploadProgress }: AdminProjectsProps) {
  const utils = trpc.useUtils();
  
  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();
  
  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      toast.success("Project created");
      setShowProjectDialog(false);
      resetProjectForm();
    },
    onError: (e) => toast.error(e.message),
  });
  
  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      toast.success("Deleted");
    },
  });

  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectForm>(initialProjectForm);

  const resetProjectForm = () => setProjectForm(initialProjectForm);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-white">Projects</h2>
          <p className="text-white/50 mt-1">Manage your portfolio projects</p>
        </div>
        <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl">
              <Plus className="h-4 w-4 mr-2" />Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-light">New Project</DialogTitle>
              <DialogDescription className="text-white/50">Add a new project to your portfolio</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div>
                <Label className="text-white/70">Title *</Label>
                <Input 
                  value={projectForm.title} 
                  onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} 
                  className="mt-1.5 bg-white/5 border-white/10 text-white" 
                  placeholder="Project title" 
                />
              </div>
              <div>
                <Label className="text-white/70">Description *</Label>
                <Textarea 
                  value={projectForm.description} 
                  onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} 
                  rows={3} 
                  className="mt-1.5 bg-white/5 border-white/10 text-white" 
                />
              </div>
              <div>
                <Label className="text-white/70">Technologies *</Label>
                <Input 
                  value={projectForm.technologies} 
                  onChange={e => setProjectForm({ ...projectForm, technologies: e.target.value })} 
                  placeholder="C, Python, Arduino" 
                  className="mt-1.5 bg-white/5 border-white/10 text-white" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70">Project URL</Label>
                  <Input 
                    value={projectForm.projectUrl} 
                    onChange={e => setProjectForm({ ...projectForm, projectUrl: e.target.value })} 
                    className="mt-1.5 bg-white/5 border-white/10 text-white" 
                  />
                </div>
                <div>
                  <Label className="text-white/70">GitHub URL</Label>
                  <Input 
                    value={projectForm.githubUrl} 
                    onChange={e => setProjectForm({ ...projectForm, githubUrl: e.target.value })} 
                    className="mt-1.5 bg-white/5 border-white/10 text-white" 
                  />
                </div>
              </div>
              <div>
                <Label className="text-white/70">Project Image</Label>
                <div className="mt-1.5 border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-emerald-400/50">
                  {projectForm.imageUrl ? (
                    <div className="relative">
                      <img src={projectForm.imageUrl} className="max-h-40 mx-auto rounded-lg" />
                      <button 
                        onClick={() => setProjectForm({ ...projectForm, imageUrl: "", imageKey: "" })} 
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <ImageIcon className="w-8 h-8 mx-auto text-white/30 mb-2" />
                      <span className="text-white/50 text-sm">Upload image</span>
                      <input 
                        type="file" 
                        accept={ACCEPTED_FILE_TYPES.image} 
                        className="hidden" 
                        onChange={e => { 
                          const f = e.target.files?.[0]; 
                          if (f) handleFileUpload(f, (url, key) => setProjectForm({ ...projectForm, imageUrl: url, imageKey: key })); 
                        }} 
                      />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-white/70">Video (YouTube URL)</Label>
                <Input 
                  value={projectForm.videoUrl} 
                  onChange={e => setProjectForm({ ...projectForm, videoUrl: e.target.value })} 
                  className="mt-1.5 bg-white/5 border-white/10 text-white" 
                  placeholder="https://youtube.com/watch?v=..." 
                />
              </div>
              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-white/50 text-center">Uploading... {uploadProgress}%</p>
                </div>
              )}
              <Button 
                onClick={() => createProject.mutate(projectForm)} 
                disabled={!projectForm.title || !projectForm.description || !projectForm.technologies || uploading} 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl"
              >
                {createProject.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="divide-y divide-white/5">
        {projectsLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-400" />
          </div>
        ) : !projects?.length ? (
          <div className="p-12 text-center text-white/40">No projects yet</div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
              <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                {project.imageUrl ? (
                  <img src={project.imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Code className="w-6 h-6 text-white/20" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{project.title}</h3>
                <p className="text-sm text-white/40 truncate">{project.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-white/30 flex items-center gap-1">
                    <Eye className="w-3 h-3" />{project.viewCount || 0}
                  </span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deleteProject.mutate({ id: project.id })} 
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
