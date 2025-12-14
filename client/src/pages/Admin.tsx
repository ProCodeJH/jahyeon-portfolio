import { useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Loader2, Plus, Trash2, Eye, Heart, BarChart3, FileText, LogOut, ImageIcon, Video, X, FolderOpen, Award, Upload, TrendingUp, Presentation, Code, Cpu, Terminal, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

type ProjectCategory = "c_lang" | "arduino" | "python" | "embedded" | "iot";
type ResourceCategory = "daily_life" | "lecture_c" | "lecture_arduino" | "lecture_python" | "presentation";

const PROJECT_CATEGORIES = [
  { value: "c_lang" as const, label: "C/C++", color: "#3B82F6" },
  { value: "arduino" as const, label: "Arduino", color: "#10B981" },
  { value: "python" as const, label: "Python", color: "#F59E0B" },
  { value: "embedded" as const, label: "Embedded", color: "#8B5CF6" },
  { value: "iot" as const, label: "IoT", color: "#06B6D4" },
];

const RESOURCE_CATEGORIES = [
  { value: "daily_life" as const, label: "Daily Videos", color: "#EC4899" },
  { value: "lecture_c" as const, label: "C Lectures", color: "#3B82F6" },
  { value: "lecture_arduino" as const, label: "Arduino Lectures", color: "#10B981" },
  { value: "lecture_python" as const, label: "Python Lectures", color: "#F59E0B" },
  { value: "presentation" as const, label: "Presentations (PPT)", color: "#8B5CF6" },
];

const ACCEPTED_FILES = ".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.c,.cpp,.py,.ino";

export default function Admin() {
  const { isAuthenticated, loading, logout } = useAuth();
  const utils = trpc.useUtils();

  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();
  const { data: certifications, isLoading: certsLoading } = trpc.certifications.list.useQuery();
  const { data: resources, isLoading: resourcesLoading } = trpc.resources.list.useQuery();
  const { data: analytics } = trpc.analytics.adminStats.useQuery(undefined, { enabled: isAuthenticated });

  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => { utils.projects.list.invalidate(); toast.success("Project created"); setShowProjectDialog(false); resetProjectForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => { utils.projects.list.invalidate(); toast.success("Deleted"); },
  });
  const createCertification = trpc.certifications.create.useMutation({
    onSuccess: () => { utils.certifications.list.invalidate(); toast.success("Certification added"); setShowCertDialog(false); resetCertForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteCertification = trpc.certifications.delete.useMutation({
    onSuccess: () => { utils.certifications.list.invalidate(); toast.success("Deleted"); },
  });
  const createResource = trpc.resources.create.useMutation({
    onSuccess: () => { utils.resources.list.invalidate(); toast.success("Resource created"); setShowResourceDialog(false); resetResourceForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteResource = trpc.resources.delete.useMutation({
    onSuccess: () => { utils.resources.list.invalidate(); toast.success("Deleted"); },
  });

  const uploadFile = trpc.upload.file.useMutation();

  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [projectForm, setProjectForm] = useState({
    title: "", description: "", technologies: "", category: "c_lang" as ProjectCategory,
    imageUrl: "", imageKey: "", videoUrl: "", videoKey: "", thumbnailUrl: "", thumbnailKey: "",
    projectUrl: "", githubUrl: "",
  });
  const [certForm, setCertForm] = useState({
    title: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "",
    imageUrl: "", imageKey: "", description: "",
  });
  const [resourceForm, setResourceForm] = useState({
    title: "", description: "", category: "daily_life" as ResourceCategory, subcategory: "",
    fileUrl: "", fileKey: "", fileName: "", fileSize: 0, mimeType: "", thumbnailUrl: "", thumbnailKey: "",
  });

  const resetProjectForm = () => setProjectForm({ title: "", description: "", technologies: "", category: "c_lang", imageUrl: "", imageKey: "", videoUrl: "", videoKey: "", thumbnailUrl: "", thumbnailKey: "", projectUrl: "", githubUrl: "" });
  const resetCertForm = () => setCertForm({ title: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "", imageUrl: "", imageKey: "", description: "" });
  const resetResourceForm = () => setResourceForm({ title: "", description: "", category: "daily_life", subcategory: "", fileUrl: "", fileKey: "", fileName: "", fileSize: 0, mimeType: "", thumbnailUrl: "", thumbnailKey: "" });

  const handleFileUpload = useCallback(async (file: File, onComplete: (url: string, key: string, thumbUrl?: string, thumbKey?: string) => void) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB allowed"); return; }
    setUploading(true); setUploadProgress(0);
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(",")[1]);
        r.onerror = () => rej();
        r.readAsDataURL(file);
      });
      setUploadProgress(50);
      const result = await uploadFile.mutateAsync({ fileName: file.name, fileContent: base64, contentType: file.type || "application/octet-stream" });
      setUploadProgress(100);
      let thumbUrl = "", thumbKey = "";
      if (file.type.startsWith("video/")) {
        const thumb = await genVideoThumb(file);
        if (thumb) {
          const tr = await uploadFile.mutateAsync({ fileName: `thumb_${Date.now()}.jpg`, fileContent: thumb, contentType: "image/jpeg" });
          thumbUrl = tr.url; thumbKey = tr.key;
        }
      }
      onComplete(result.url, result.key, thumbUrl, thumbKey);
      toast.success("Upload complete");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); setUploadProgress(0); }
  }, [uploadFile]);

  const genVideoThumb = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const v = document.createElement("video"), c = document.createElement("canvas");
      v.preload = "metadata"; v.muted = true; v.playsInline = true;
      v.onloadeddata = () => { v.currentTime = Math.min(1, v.duration * 0.1); };
      v.onseeked = () => {
        c.width = v.videoWidth; c.height = v.videoHeight;
        c.getContext("2d")?.drawImage(v, 0, 0);
        c.toBlob((b) => {
          if (!b) return resolve(null);
          const r = new FileReader();
          r.onload = () => resolve((r.result as string).split(",")[1]);
          r.onerror = () => resolve(null);
          r.readAsDataURL(b);
        }, "image/jpeg", 0.8);
      };
      v.onerror = () => resolve(null);
      v.src = URL.createObjectURL(file);
    });
  };

  const getFileIcon = (mimeType: string, fileName: string) => {
    if (mimeType?.includes('presentation') || fileName?.endsWith('.ppt') || fileName?.endsWith('.pptx')) return <Presentation className="w-5 h-5 text-orange-400" />;
    if (mimeType?.includes('pdf') || fileName?.endsWith('.pdf')) return <FileText className="w-5 h-5 text-red-400" />;
    if (mimeType?.startsWith('video/')) return <Video className="w-5 h-5 text-purple-400" />;
    return <FileText className="w-5 h-5 text-blue-400" />;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-10 max-w-md w-full mx-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extralight text-white mb-3">Admin Panel</h1>
        <p className="text-white/40 mb-8">Login required to access dashboard</p>
        <Button asChild className="w-full rounded-xl bg-white text-black hover:bg-emerald-400 h-14 text-base">
          <a href={getLoginUrl()}>Login to Continue</a>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50">
        <div className="mx-6 lg:mx-12 mt-6">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] rounded-2xl px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/"><span className="text-2xl font-extralight tracking-[0.3em] cursor-pointer hover:text-emerald-400 transition-colors">JH</span></Link>
                <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded-full tracking-wider">ADMIN</span>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/">
                  <Button variant="outline" size="sm" className="rounded-full border-white/10 bg-transparent text-white/70 hover:bg-white/10 h-10 px-5">
                    <Eye className="h-4 w-4 mr-2" />View Site
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => logout()} className="rounded-full border-white/10 bg-transparent text-white/70 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 h-10 px-5">
                  <LogOut className="h-4 w-4 mr-2" />Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Views", value: analytics?.totalViews || 0, icon: Eye, color: "from-blue-500 to-cyan-500" },
            { label: "Today's Views", value: analytics?.todayViews || 0, icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
            { label: "Visitors", value: analytics?.uniqueVisitors || 0, icon: Heart, color: "from-purple-500 to-pink-500" },
            { label: "Content", value: (projects?.length || 0) + (certifications?.length || 0) + (resources?.length || 0), icon: FileText, color: "from-orange-500 to-yellow-500" },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-light text-white">{stat.value.toLocaleString()}</p>
              <p className="text-white/40 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl inline-flex">
            {[
              { value: "projects", icon: FolderOpen, label: "Projects", count: projects?.length },
              { value: "certifications", icon: Award, label: "Certs", count: certifications?.length },
              { value: "resources", icon: Upload, label: "Resources", count: resources?.length },
              { value: "analytics", icon: BarChart3, label: "Analytics" },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl px-6 py-3 text-white/50 data-[state=active]:bg-emerald-500 data-[state=active]:text-black transition-all">
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
                {tab.count !== undefined && <span className="ml-2 text-xs opacity-60">({tab.count || 0})</span>}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-light">Projects</h2>
                  <p className="text-white/40 text-sm mt-1">Manage portfolio projects</p>
                </div>
                <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 h-12 px-6">
                      <Plus className="h-4 w-4 mr-2" />Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/10 text-white rounded-3xl">
                    <DialogHeader><DialogTitle className="text-xl font-light">New Project</DialogTitle></DialogHeader>
                    <div className="space-y-5 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white/60 text-sm">Title *</Label>
                          <Input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="mt-2 bg-white/5 border-white/10 rounded-xl h-12" placeholder="Project title" />
                        </div>
                        <div>
                          <Label className="text-white/60 text-sm">Category *</Label>
                          <Select value={projectForm.category} onValueChange={(v: ProjectCategory) => setProjectForm({...projectForm, category: v})}>
                            <SelectTrigger className="mt-2 bg-white/5 border-white/10 rounded-xl h-12"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#111] border-white/10 rounded-xl">
                              {PROJECT_CATEGORIES.map(c => (
                                <SelectItem key={c.value} value={c.value} className="text-white rounded-lg">
                                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.label}</div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-white/60 text-sm">Description *</Label>
                        <Textarea value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} rows={3} className="mt-2 bg-white/5 border-white/10 rounded-xl" placeholder="Project description" />
                      </div>
                      <div>
                        <Label className="text-white/60 text-sm">Technologies * (comma separated)</Label>
                        <Input value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} className="mt-2 bg-white/5 border-white/10 rounded-xl h-12" placeholder="C, Python, Arduino" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white/60 text-sm">Demo URL</Label>
                          <Input value={projectForm.projectUrl} onChange={e => setProjectForm({...projectForm, projectUrl: e.target.value})} className="mt-2 bg-white/5 border-white/10 rounded-xl h-12" placeholder="https://..." />
                        </div>
                        <div>
                          <Label className="text-white/60 text-sm">GitHub URL</Label>
                          <Input value={projectForm.githubUrl} onChange={e => setProjectForm({...projectForm, githubUrl: e.target.value})} className="mt-2 bg-white/5 border-white/10 rounded-xl h-12" placeholder="https://github.com/..." />
                        </div>
                      </div>
                      <div>
                        <Label className="text-white/60 text-sm">Project Image</Label>
                        <div className="mt-2 border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-emerald-400/50 transition-colors">
                          {projectForm.imageUrl ? (
                            <div className="relative inline-block">
                              <img src={projectForm.imageUrl} className="max-h-40 rounded-xl" />
                              <button onClick={() => setProjectForm({...projectForm, imageUrl: "", imageKey: ""})} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <ImageIcon className="w-10 h-10 mx-auto text-white/20 mb-3" />
                              <span className="text-white/40">Click to upload</span>
                              <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, (url, key) => setProjectForm({...projectForm, imageUrl: url, imageKey: key})); }} />
                            </label>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-white/60 text-sm">Video URL (YouTube)</Label>
                        <Input value={projectForm.videoUrl} onChange={e => setProjectForm({...projectForm, videoUrl: e.target.value})} className="mt-2 bg-white/5 border-white/10 rounded-xl h-12" placeholder="https://youtube.com/watch?v=..." />
                      </div>
                      {uploading && <Progress value={uploadProgress} className="h-2 rounded-full" />}
                      <Button onClick={() => createProject.mutate(projectForm)} disabled={!projectForm.title || !projectForm.description || !projectForm.technologies || uploading} className="w-full rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 h-14">
                        {createProject.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create Project
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="divide-y divide-white/5">
                {projectsLoading ? <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-400" /></div>
                : !projects?.length ? <div className="p-12 text-center text-white/30">No projects yet</div>
                : projects.map(p => (
                  <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                      {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Code className="w-6 h-6 text-white/20" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{p.title}</h3>
                      <p className="text-sm text-white/40 truncate">{p.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: PROJECT_CATEGORIES.find(c => c.value === p.category)?.color + '30', color: PROJECT_CATEGORIES.find(c => c.value === p.category)?.color }}>{p.category}</span>
                        <span className="text-xs text-white/30 flex items-center gap-1"><Eye className="w-3 h-3" />{p.viewCount}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteProject.mutate({ id: p.id })} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications">
            <div className="rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div><h2 className="text-xl font-light">Certifications</h2><p className="text-white/40 text-sm mt-1">Manage credentials</p></div>
                <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
                  <DialogTrigger asChild><Button className="rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 h-12 px-6"><Plus className="h-4 w-4 mr-2" />Add Cert</Button></DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/10 text-white rounded-3xl">
                    <DialogHeader><DialogTitle className="text-xl font-light">New Certification</DialogTitle></DialogHeader>
                    <div className="space-y-5 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-white/60 text-sm">Title *</Label><Input value={certForm.title} onChange={e => setCertForm({...certForm, title: e.target.value})} className="mt-2 bg-white/5 border-white/10 rounded-xl h-12" /></div>
                        <div><Label className="text-white/60 text-sm">Issuer *</Label><Input value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="mt-2 bg-white/5 border-white/10 rounded-xl h-12" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-white/60 text-sm">Issue Date *</Label><Input type="date" value={certForm.issueDate} onChange={e => setCertForm({...certForm, issueDate: e.target.value})} className="mt-2 bg-white/5 border-white/10 rounded-xl h-12" /></div>
                        <div><Label className="text-white/60 text-sm">Expiry Date</Label><Input type="date" value={certForm.expiryDate} onChange={e => setCertForm({...certForm, expiryDate: e.target.value})} className="mt-2 bg-white/5 border-white/10 rounded-xl h-12" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-white/60 text-sm">Credential ID</Label><Input value={certForm.credentialId} onChange={e => setCertForm({...certForm, credentialId: e.target.value})} className="mt-2 bg-white/5 border-white/10 rounded-xl h-12" /></div>
                        <div><Label className="text-white/60 text-sm">Credential URL</Label><Input value={certForm.credentialUrl} onChange={e => setCertForm({...certForm, credentialUrl: e.target.value})} className="mt-2 bg-white/5 border-white/10 rounded-xl h-12" /></div>
                      </div>
                      <div><Label className="text-white/60 text-sm">Description</Label><Textarea value={certForm.description} onChange={e => setCertForm({...certForm, description: e.target.value})} rows={2} className="mt-2 bg-white/5 border-white/10 rounded-xl" /></div>
                      <div>
                        <Label className="text-white/60 text-sm">Certificate Image</Label>
                        <div className="mt-2 border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-emerald-400/50 transition-colors">
                          {certForm.imageUrl ? (
                            <div className="relative inline-block"><img src={certForm.imageUrl} className="max-h-32 rounded-xl" /><button onClick={() => setCertForm({...certForm, imageUrl: "", imageKey: ""})} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button></div>
                          ) : (
                            <label className="cursor-pointer"><Award className="w-8 h-8 mx-auto text-white/20 mb-2" /><span className="text-white/40 text-sm">Upload</span><input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, (url, key) => setCertForm({...certForm, imageUrl: url, imageKey: key})); }} /></label>
                          )}
                        </div>
                      </div>
                      {uploading && <Progress value={uploadProgress} className="h-2" />}
                      <Button onClick={() => createCertification.mutate(certForm)} disabled={!certForm.title || !certForm.issuer || !certForm.issueDate || uploading} className="w-full rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 h-14">
                        {createCertification.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Certification
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="divide-y divide-white/5">
                {certsLoading ? <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-400" /></div>
                : !certifications?.length ? <div className="p-12 text-center text-white/30">No certifications yet</div>
                : certifications.map(c => (
                  <div key={c.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {c.imageUrl ? <img src={c.imageUrl} className="w-full h-full object-cover" /> : <Award className="w-6 h-6 text-emerald-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{c.title}</h3>
                      <p className="text-sm text-white/40">{c.issuer} • {c.issueDate}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteCertification.mutate({ id: c.id })} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div><h2 className="text-xl font-light">Resources</h2><p className="text-white/40 text-sm mt-1">Videos, PPT, documents & more</p></div>
                <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
                  <DialogTrigger asChild><Button className="rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 h-12 px-6"><Plus className="h-4 w-4 mr-2" />Add Resource</Button></DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/10 text-white rounded-3xl">
                    <DialogHeader><DialogTitle className="text-xl font-light">New Resource</DialogTitle></DialogHeader>
                    <div className="space-y-5 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-white/60 text-sm">Title *</Label><Input value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} className="mt-2 bg-white/5 border-white/10 rounded-xl h-12" /></div>
                        <div>
                          <Label className="text-white/60 text-sm">Category *</Label>
                          <Select value={resourceForm.category} onValueChange={(v: ResourceCategory) => setResourceForm({...resourceForm, category: v})}>
                            <SelectTrigger className="mt-2 bg-white/5 border-white/10 rounded-xl h-12"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#111] border-white/10 rounded-xl">
                              {RESOURCE_CATEGORIES.map(c => (<SelectItem key={c.value} value={c.value} className="text-white rounded-lg"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.label}</div></SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div><Label className="text-white/60 text-sm">Description</Label><Textarea value={resourceForm.description} onChange={e => setResourceForm({...resourceForm, description: e.target.value})} rows={2} className="mt-2 bg-white/5 border-white/10 rounded-xl" /></div>
                      <div>
                        <Label className="text-white/60 text-sm">File (PPT, PDF, Video, etc.)</Label>
                        <div className="mt-2 border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-emerald-400/50 transition-colors">
                          {resourceForm.fileUrl ? (
                            <div className="flex items-center justify-center gap-3">
                              {getFileIcon(resourceForm.mimeType, resourceForm.fileName)}
                              <div className="text-left"><p className="text-white text-sm truncate max-w-[200px]">{resourceForm.fileName}</p><p className="text-white/40 text-xs">{(resourceForm.fileSize / 1024 / 1024).toFixed(2)} MB</p></div>
                              <button onClick={() => setResourceForm({...resourceForm, fileUrl: "", fileKey: "", fileName: "", fileSize: 0, mimeType: ""})} className="p-1 bg-white/10 rounded-full hover:bg-white/20"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <div className="flex items-center justify-center gap-3 mb-2"><Presentation className="w-6 h-6 text-orange-400" /><Video className="w-6 h-6 text-purple-400" /><FileText className="w-6 h-6 text-red-400" /></div>
                              <span className="text-white/40 text-sm">Click to upload (max 10MB)</span><p className="text-white/20 text-xs mt-1">PPT, PDF, Video, Images, Code</p>
                              <input type="file" accept={ACCEPTED_FILES} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, (url, key, thumbUrl, thumbKey) => setResourceForm({...resourceForm, fileUrl: url, fileKey: key, fileName: f.name, fileSize: f.size, mimeType: f.type, thumbnailUrl: thumbUrl || "", thumbnailKey: thumbKey || ""})); }} />
                            </label>
                          )}
                        </div>
                      </div>
                      <div><Label className="text-white/60 text-sm">Or YouTube URL</Label><Input value={resourceForm.fileUrl.includes('youtube') ? resourceForm.fileUrl : ''} onChange={e => setResourceForm({...resourceForm, fileUrl: e.target.value, mimeType: 'video/youtube'})} className="mt-2 bg-white/5 border-white/10 rounded-xl h-12" placeholder="https://youtube.com/watch?v=..." /></div>
                      {uploading && <Progress value={uploadProgress} className="h-2" />}
                      <Button onClick={() => createResource.mutate(resourceForm)} disabled={!resourceForm.title || !resourceForm.fileUrl || uploading} className="w-full rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 h-14">
                        {createResource.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Resource
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="divide-y divide-white/5">
                {resourcesLoading ? <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-400" /></div>
                : !resources?.length ? <div className="p-12 text-center text-white/30">No resources yet</div>
                : resources.map(r => (
                  <div key={r.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {r.thumbnailUrl ? <img src={r.thumbnailUrl} className="w-full h-full object-cover" /> : getFileIcon(r.mimeType, r.fileName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{r.title}</h3>
                      <p className="text-sm text-white/40 truncate">{r.fileName || r.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: RESOURCE_CATEGORIES.find(c => c.value === r.category)?.color + '30', color: RESOURCE_CATEGORIES.find(c => c.value === r.category)?.color }}>{r.category}</span>
                        <span className="text-xs text-white/30">{r.downloadCount || 0} downloads</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteResource.mutate({ id: r.id })} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="rounded-3xl bg-white/[0.02] border border-white/5 p-8">
              <h2 className="text-xl font-light mb-8">Analytics Overview</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h3 className="text-white/60 text-sm mb-4">Top Projects by Views</h3>
                  <div className="space-y-3">
                    {projects?.sort((a, b) => b.viewCount - a.viewCount).slice(0, 5).map((p, i) => (
                      <div key={p.id} className="flex items-center justify-between">
                        <span className="text-white/80 text-sm truncate">{i + 1}. {p.title}</span>
                        <span className="text-emerald-400 text-sm font-mono">{p.viewCount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h3 className="text-white/60 text-sm mb-4">Top Resources by Downloads</h3>
                  <div className="space-y-3">
                    {resources?.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0)).slice(0, 5).map((r, i) => (
                      <div key={r.id} className="flex items-center justify-between">
                        <span className="text-white/80 text-sm truncate">{i + 1}. {r.title}</span>
                        <span className="text-emerald-400 text-sm font-mono">{r.downloadCount || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
