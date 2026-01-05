import { useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Loader2, Plus, Trash2, Eye, Heart, BarChart3, FileText, LogOut, ImageIcon, Video, X, FolderOpen, Award, Upload, TrendingUp, Presentation, Code, Cpu, Terminal, CheckCircle, Pencil, FolderInput, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

type ProjectCategory = "c_lang" | "arduino" | "python" | "embedded" | "iot";
type ResourceCategory = "daily_life" | "lecture_c" | "lecture_arduino" | "lecture_python" | "presentation";

const PROJECT_CATEGORIES = [
  { value: "c_lang" as const, label: "C/C++", color: "#3B82F6", icon: Terminal },
  { value: "arduino" as const, label: "Arduino", color: "#10B981", icon: Cpu },
  { value: "python" as const, label: "Python", color: "#F59E0B", icon: Code },
  { value: "embedded" as const, label: "Embedded", color: "#8B5CF6", icon: Cpu },
  { value: "iot" as const, label: "IoT", color: "#06B6D4", icon: Cpu },
];

const RESOURCE_CATEGORIES = [
  { value: "daily_life" as const, label: "Daily Videos", color: "#EC4899" },
  { value: "lecture_c" as const, label: "C Language Lectures", color: "#3B82F6" },
  { value: "lecture_arduino" as const, label: "Arduino Lectures", color: "#10B981" },
  { value: "lecture_python" as const, label: "Python Lectures", color: "#F59E0B" },
  { value: "presentation" as const, label: "Presentations (PPT)", color: "#8B5CF6" },
];

const ACCEPTED_FILE_TYPES = {
  image: ".jpg,.jpeg,.png,.gif,.webp",
  video: ".mp4,.webm,.mov",
  document: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
  all: ".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.c,.cpp,.py,.ino"
};

// ============================================
// 🚀 파일 용량: 500MB까지 지원!
// ============================================
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const SMALL_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB 이하는 기존 방식

export default function Admin() {
  const { isAuthenticated, loading, logout } = useAuth();
  const utils = trpc.useUtils();

  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();
  const { data: certifications, isLoading: certsLoading } = trpc.certifications.list.useQuery();
  const { data: resources, isLoading: resourcesLoading } = trpc.resources.list.useQuery();
  const { data: folders, isLoading: foldersLoading } = trpc.folders.list.useQuery();
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
  const updateResource = trpc.resources.update.useMutation({
    onSuccess: () => { utils.resources.list.invalidate(); toast.success("Resource updated"); setShowEditResourceDialog(false); setEditingResource(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteResource = trpc.resources.delete.useMutation({
    onSuccess: () => { utils.resources.list.invalidate(); toast.success("Deleted"); },
  });
  const createFolder = trpc.folders.create.useMutation({
    onSuccess: () => { utils.folders.list.invalidate(); toast.success("Folder created"); setShowCreateFolderDialog(false); setNewFolderName(""); },
    onError: (e) => toast.error(e.message),
  });
  const updateFolder = trpc.folders.update.useMutation({
    onSuccess: () => { utils.folders.list.invalidate(); toast.success("Folder updated"); setShowRenameFolderDialog(false); setRenamingFolder(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteFolder = trpc.folders.delete.useMutation({
    onSuccess: () => { utils.folders.list.invalidate(); toast.success("Folder deleted"); },
  });

  // Upload mutations
  const uploadFile = trpc.upload.file.useMutation();
  const getPresignedUrl = trpc.upload.getPresignedUrl.useMutation();

  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [showEditResourceDialog, setShowEditResourceDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showRenameFolderDialog, setShowRenameFolderDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [renamingFolder, setRenamingFolder] = useState<{ category: ResourceCategory, oldName: string, newName: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>("presentation");

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
    title: "", description: "", category: "daily_life" as ResourceCategory, subcategory: "" as string,
    fileUrl: "", fileKey: "", fileName: "", fileSize: 0, mimeType: "", thumbnailUrl: "", thumbnailKey: "",
  });

  const resetProjectForm = () => setProjectForm({ title: "", description: "", technologies: "", category: "c_lang", imageUrl: "", imageKey: "", videoUrl: "", videoKey: "", thumbnailUrl: "", thumbnailKey: "", projectUrl: "", githubUrl: "" });
  const resetCertForm = () => setCertForm({ title: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "", imageUrl: "", imageKey: "", description: "" });
  const resetResourceForm = () => setResourceForm({ title: "", description: "", category: "daily_life", subcategory: "", fileUrl: "", fileKey: "", fileName: "", fileSize: 0, mimeType: "", thumbnailUrl: "", thumbnailKey: "" });

  const handleEditResource = (resource: any) => {
    setEditingResource(resource);
    setShowEditResourceDialog(true);
  };

  const handleRenameFolder = (category: ResourceCategory, oldName: string) => {
    setRenamingFolder({ category, oldName, newName: oldName });
    setShowRenameFolderDialog(true);
  };

  const handleRenameFolderSubmit = async () => {
    if (!renamingFolder || !renamingFolder.newName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      const folderInDb = folders?.find(f => f.category === renamingFolder.category && f.name === renamingFolder.oldName);
      if (folderInDb) {
        await updateFolder.mutateAsync({
          id: folderInDb.id,
          name: renamingFolder.newName,
        });
      }

      const resourcesToUpdate = resources?.filter(
        r => r.category === renamingFolder.category && r.subcategory === renamingFolder.oldName
      ) || [];

      await Promise.all(
        resourcesToUpdate.map(resource =>
          updateResource.mutateAsync({
            id: resource.id,
            subcategory: renamingFolder.newName,
          })
        )
      );

      toast.success(`Folder renamed to "${renamingFolder.newName}"`);
      setShowRenameFolderDialog(false);
      setRenamingFolder(null);
    } catch (error) {
      toast.error("Failed to rename folder");
    }
  };

  const handleDeleteFolder = async (category: ResourceCategory, folderName: string) => {
    if (!confirm(`Delete folder "${folderName}"? All files will be moved to Uncategorized.`)) {
      return;
    }

    try {
      const folderInDb = folders?.find(f => f.category === category && f.name === folderName);
      const resourcesToMove = resources?.filter(
        r => r.category === category && r.subcategory === folderName
      ) || [];

      await Promise.all(
        resourcesToMove.map(resource =>
          updateResource.mutateAsync({
            id: resource.id,
            subcategory: "",
          })
        )
      );

      if (folderInDb) {
        await deleteFolder.mutateAsync({ id: folderInDb.id });
      }

      toast.success(`Folder "${folderName}" deleted. Files moved to Uncategorized.`);
    } catch (error) {
      toast.error("Failed to delete folder");
    }
  };

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const getFolderTree = (category: ResourceCategory) => {
    const categoryResources = resources?.filter(r => r.category === category) || [];
    const categoryFolders = folders?.filter(f => f.category === category) || [];
    const folderMap = new Map<string, any[]>();

    categoryFolders.forEach(folder => {
      if (!folderMap.has(folder.name)) {
        folderMap.set(folder.name, []);
      }
    });

    categoryResources.forEach(resource => {
      const folder = resource.subcategory || "Uncategorized";
      if (!folderMap.has(folder)) {
        folderMap.set(folder, []);
      }
      folderMap.get(folder)!.push(resource);
    });

    return Array.from(folderMap.entries()).map(([folder, items]) => ({
      name: folder,
      path: folder,
      items,
      children: []
    }));
  };

  const handleFileUpload = useCallback(async (file: File, onComplete: (url: string, key: string, thumbUrl?: string, thumbKey?: string) => void) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Max ${MAX_FILE_SIZE / 1024 / 1024}MB allowed`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let result: { url: string; key: string };

      if (file.size <= SMALL_FILE_THRESHOLD) {
        const base64 = await fileToBase64(file);
        setUploadProgress(50);
        result = await uploadFile.mutateAsync({
          fileName: file.name,
          fileContent: base64,
          contentType: file.type || "application/octet-stream"
        });
        setUploadProgress(100);
      } else {
        setUploadProgress(5);
        const presigned = await getPresignedUrl.mutateAsync({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
        });

        setUploadProgress(10);
        await uploadToPresignedUrl(presigned.presignedUrl, file, (progress) => {
          setUploadProgress(10 + Math.round(progress * 85));
        });

        setUploadProgress(100);
        result = { url: presigned.publicUrl, key: presigned.key };
      }

      let thumbUrl = "", thumbKey = "";
      if (file.type.startsWith("video/")) {
        const thumb = await genVideoThumb(file);
        if (thumb) {
          const tr = await uploadFile.mutateAsync({ fileName: `thumb_${Date.now()}.jpg`, fileContent: thumb, contentType: "image/jpeg" });
          thumbUrl = tr.url; thumbKey = tr.key;
        }
      }

      onComplete(result.url, result.key, thumbUrl, thumbKey);
      toast.success("Upload complete!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
    finally { setUploading(false); setUploadProgress(0); }
  }, [uploadFile, getPresignedUrl]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const uploadToPresignedUrl = async (url: string, file: File, onProgress: (progress: number) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress(e.loaded / e.total);
        }
      });
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });
      xhr.addEventListener("error", () => reject(new Error("Upload failed")));
      xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.send(file);
    });
  };

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

  const getFileTypeIcon = (mimeType: string, fileName: string) => {
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint') || fileName?.endsWith('.ppt') || fileName?.endsWith('.pptx')) {
      return <Presentation className="w-5 h-5 text-orange-500" />;
    }
    if (mimeType?.includes('pdf') || fileName?.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (mimeType?.startsWith('video/')) {
      return <Video className="w-5 h-5 text-purple-500" />;
    }
    if (mimeType?.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-10 max-w-md w-full mx-4 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-4">Login Required</h1>
        <p className="text-slate-500 mb-8 font-medium">Please login to access the admin panel</p>
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-blue-600/20 text-lg">
          <a href={getLoginUrl()}>Login Dashboard</a>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <span className="text-2xl font-black tracking-tighter cursor-pointer hover:opacity-70 text-slate-900">
                  JAHYEON<span className="text-blue-600">.</span>
                </span>
              </Link>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-bold rounded-full border border-blue-100">Admin Console</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm" className="rounded-full border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium">
                  <Eye className="h-4 w-4 mr-2" />View Site
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => logout()} className="rounded-full border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium">
                <LogOut className="h-4 w-4 mr-2" />Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Today's Views", value: analytics?.todayViews || 0, icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Unique Visitors", value: analytics?.uniqueVisitors || 0, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Total Content", value: (projects?.length || 0) + (certifications?.length || 0) + (resources?.length || 0), icon: Heart, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Downloads", value: analytics?.totalDownloads || 0, icon: FileText, color: "text-orange-600", bg: "bg-orange-50" }
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900">{stat.value.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl w-full justify-start h-auto gap-2 shadow-sm">
            {["projects", "certifications", "resources", "analytics"].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-xl px-6 py-3 text-slate-500 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all capitalize"
              >
                {tab === "projects" && <FolderOpen className="h-4 w-4 mr-2" />}
                {tab === "certifications" && <Award className="h-4 w-4 mr-2" />}
                {tab === "resources" && <Upload className="h-4 w-4 mr-2" />}
                {tab === "analytics" && <BarChart3 className="h-4 w-4 mr-2" />}
                {tab} {tab === "projects" && `(${projects?.length || 0})`}
                {tab === "certifications" && `(${certifications?.length || 0})`}
                {tab === "resources" && `(${resources?.length || 0})`}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* PROJECTS TAB */}
          <TabsContent value="projects">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Projects</h2>
                  <p className="text-slate-500 font-medium mt-1">Manage your portfolio projects</p>
                </div>
                <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold h-12 px-6 shadow-lg shadow-blue-600/20">
                      <Plus className="h-5 w-5 mr-2" />Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-none shadow-2xl rounded-3xl p-8">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black text-slate-900">New Project</DialogTitle>
                      <DialogDescription className="text-slate-500">Add a new project to your portfolio</DialogDescription>
                    </DialogHeader>
                    {/* Project Form Inputs - Light Theme */}
                    <div className="space-y-5 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-700 font-bold">Title *</Label>
                          <Input value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} className="mt-1.5 bg-slate-50 border-slate-200 text-slate-900 rounded-xl" placeholder="Project title" />
                        </div>
                        <div>
                          <Label className="text-slate-700 font-bold">Category *</Label>
                          <Select value={projectForm.category} onValueChange={(v: ProjectCategory) => setProjectForm({ ...projectForm, category: v })}>
                            <SelectTrigger className="mt-1.5 bg-slate-50 border-slate-200 text-slate-900 rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-xl">{PROJECT_CATEGORIES.map(c => (<SelectItem key={c.value} value={c.value} className="text-slate-700 font-medium hover:bg-slate-50 cursor-pointer p-2"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />{c.label}</div></SelectItem>))}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div><Label className="text-slate-700 font-bold">Description *</Label><Textarea value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} rows={3} className="mt-1.5 bg-slate-50 border-slate-200 text-slate-900 rounded-xl" /></div>
                      <div><Label className="text-slate-700 font-bold">Technologies *</Label><Input value={projectForm.technologies} onChange={e => setProjectForm({ ...projectForm, technologies: e.target.value })} placeholder="C, Python, Arduino" className="mt-1.5 bg-slate-50 border-slate-200 text-slate-900 rounded-xl" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-slate-700 font-bold">Project URL</Label><Input value={projectForm.projectUrl} onChange={e => setProjectForm({ ...projectForm, projectUrl: e.target.value })} className="mt-1.5 bg-slate-50 border-slate-200 text-slate-900 rounded-xl" /></div>
                        <div><Label className="text-slate-700 font-bold">GitHub URL</Label><Input value={projectForm.githubUrl} onChange={e => setProjectForm({ ...projectForm, githubUrl: e.target.value })} className="mt-1.5 bg-slate-50 border-slate-200 text-slate-900 rounded-xl" /></div>
                      </div>
                      <div><Label className="text-slate-700 font-bold">Project Image</Label>
                        <div className="mt-1.5 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-500 bg-slate-50 transition-colors">
                          {projectForm.imageUrl ? (<div className="relative"><img src={projectForm.imageUrl} className="max-h-40 mx-auto rounded-lg shadow-md" /><button onClick={() => setProjectForm({ ...projectForm, imageUrl: "", imageKey: "" })} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50"><X className="w-4 h-4 text-red-500" /></button></div>) : (
                            <label className="cursor-pointer block"><ImageIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" /><span className="text-slate-500 text-sm font-medium">Click to upload image</span><input type="file" accept={ACCEPTED_FILE_TYPES.image} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, (url, key) => setProjectForm({ ...projectForm, imageUrl: url, imageKey: key })); }} /></label>
                          )}
                        </div>
                      </div>
                      <div><Label className="text-slate-700 font-bold">Video (YouTube URL)</Label><Input value={projectForm.videoUrl} onChange={e => setProjectForm({ ...projectForm, videoUrl: e.target.value })} className="mt-1.5 bg-slate-50 border-slate-200 text-slate-900 rounded-xl" placeholder="https://youtube.com/watch?v=..." /></div>
                      {uploading && (<div className="space-y-2"><Progress value={uploadProgress} className="h-2 bg-slate-100" /><p className="text-sm text-slate-500 text-center font-medium">Uploading... {uploadProgress}%</p></div>)}
                      <Button onClick={() => createProject.mutate(projectForm)} disabled={!projectForm.title || !projectForm.description || !projectForm.technologies || uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-6 shadow-lg shadow-blue-600/20">{createProject.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create Project</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {projectsLoading ? (<div className="p-12 text-center text-slate-400"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /></div>) : !projects?.length ? (<div className="p-12 text-center text-slate-400 font-medium">No projects yet</div>) : projects.map(project => (
                  <div key={project.id} className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors group">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-inner">{project.imageUrl ? (<img src={project.imageUrl} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center"><Code className="w-8 h-8 text-slate-300" /></div>)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate mb-1">{project.title}</h3>
                      <p className="text-sm text-slate-500 truncate">{project.description}</p>
                      <div className="flex items-center gap-3 mt-2"><span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide opacity-90" style={{ backgroundColor: PROJECT_CATEGORIES.find(c => c.value === project.category)?.color + '20', color: PROJECT_CATEGORIES.find(c => c.value === project.category)?.color }}>{project.category}</span><span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Eye className="w-3 h-3" />{project.viewCount || 0}</span></div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteProject.mutate({ id: project.id })} className="text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"><Trash2 className="h-5 w-5" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* CERTIFICATIONS TAB (Refactored similarly to Projects) */}
          <TabsContent value="certifications">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div><h2 className="text-2xl font-black text-slate-900">Certifications</h2></div>
                <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
                  <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold h-12 px-6 shadow-lg shadow-blue-600/20"><Plus className="h-5 w-5 mr-2" />Add Cert</Button></DialogTrigger>
                  <DialogContent className="max-w-2xl bg-white border-none shadow-2xl rounded-3xl p-8">
                    <DialogHeader><DialogTitle className="text-2xl font-black text-slate-900">New Certification</DialogTitle></DialogHeader>
                    {/* Cert Form - Light */}
                    <div className="space-y-5 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-slate-700 font-bold">Title *</Label><Input value={certForm.title} onChange={e => setCertForm({ ...certForm, title: e.target.value })} className="mt-1.5 bg-slate-50 border-slate-200 rounded-xl text-slate-900" /></div>
                        <div><Label className="text-slate-700 font-bold">Issuer *</Label><Input value={certForm.issuer} onChange={e => setCertForm({ ...certForm, issuer: e.target.value })} className="mt-1.5 bg-slate-50 border-slate-200 rounded-xl text-slate-900" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-slate-700 font-bold">Issue Date *</Label><Input type="date" value={certForm.issueDate} onChange={e => setCertForm({ ...certForm, issueDate: e.target.value })} className="mt-1.5 bg-slate-50 border-slate-200 rounded-xl text-slate-900" /></div>
                        <div><Label className="text-slate-700 font-bold">Expiry Date</Label><Input type="date" value={certForm.expiryDate} onChange={e => setCertForm({ ...certForm, expiryDate: e.target.value })} className="mt-1.5 bg-slate-50 border-slate-200 rounded-xl text-slate-900" /></div>
                      </div>
                      <Button onClick={() => createCertification.mutate(certForm)} disabled={!certForm.title || !certForm.issuer || !certForm.issueDate || uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-6">Add Certification</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {certsLoading ? <div className="p-12 text-center text-slate-400">Loading...</div> : certifications?.map(cert => (
                  <div key={cert.id} className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl"><Award className="w-8 h-8" /></div>
                    <div className="flex-1"><h3 className="text-lg font-bold text-slate-900">{cert.title}</h3><p className="text-slate-500 font-medium">{cert.issuer} • {cert.issueDate}</p></div>
                    <Button variant="ghost" size="icon" onClick={() => deleteCertification.mutate({ id: cert.id })} className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full"><Trash2 className="h-5 w-5" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* RESOURCES TAB */}
          <TabsContent value="resources">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Resources</h2>
                    <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">Files & Media <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Up to 500MB</span></p>
                  </div>
                  <Button onClick={() => setShowCreateFolderDialog(true)} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold"><FolderOpen className="h-4 w-4 mr-2" />New Folder</Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {RESOURCE_CATEGORIES.map(cat => (
                    <button key={cat.value} onClick={() => setSelectedCategory(cat.value)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${selectedCategory === cat.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-slate-100 bg-white min-h-[400px]">
                {/* Simplified Tree View for Light Theme */}
                {getFolderTree(selectedCategory).map(folder => (
                  <div key={folder.path} className="bg-white">
                    <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer border-l-4 border-transparent hover:border-blue-500" onClick={() => toggleFolder(folder.path)}>
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><FolderOpen className="w-5 h-5" /></div>
                      <div className="flex-1"><h3 className="font-bold text-slate-900">{folder.name}</h3><p className="text-xs text-slate-400 font-bold uppercase">{folder.items.length} files</p></div>
                      {expandedFolders.has(folder.path) ? <ChevronDown className="text-slate-400" /> : <ChevronRight className="text-slate-400" />}
                    </div>
                    {expandedFolders.has(folder.path) && (
                      <div className="bg-slate-50/50 divide-y divide-slate-100 border-t border-slate-100">
                        {folder.items.map(r => (
                          <div key={r.id} className="p-3 pl-20 flex items-center gap-4 hover:bg-slate-100 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">{getFileTypeIcon(r.mimeType, r.fileName)}</div>
                            <div className="flex-1 min-w-0"><h4 className="font-bold text-slate-900 truncate text-sm">{r.title}</h4><p className="text-slate-500 text-xs truncate">{r.fileName}</p></div>
                            <div className="flex gap-1 pr-4">
                              <Button variant="ghost" size="sm" onClick={() => handleEditResource(r)} className="text-blue-500 hover:bg-blue-50"><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteResource.mutate({ id: r.id })} className="text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {/* Add Resource Trigger */}
                <div className="p-6 border-t border-slate-100">
                  <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
                    <DialogTrigger asChild><Button className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold h-12 shadow-lg"><Plus className="mr-2 h-5 w-5" />Add Resource to {RESOURCE_CATEGORIES.find(c => c.value === selectedCategory)?.label}</Button></DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white border-none shadow-2xl rounded-3xl p-8">
                      <DialogHeader><DialogTitle className="text-2xl font-black text-slate-900">New Resource</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div><Label className="text-slate-700 font-bold">Title *</Label><Input value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="mt-1.5 bg-slate-50 border-slate-200 rounded-xl text-slate-900" /></div>
                        {/* File Upload UI */}
                        <div className="mt-1.5 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-500 bg-slate-50 transition-colors">
                          {resourceForm.fileUrl ? (
                            <div className="flex items-center justify-center gap-3">
                              <div className="text-left"><p className="text-slate-900 font-bold">{resourceForm.fileName}</p><p className="text-slate-500 text-xs">{formatFileSize(resourceForm.fileSize)}</p></div>
                              <Button size="icon" variant="ghost" onClick={() => setResourceForm({ ...resourceForm, fileUrl: "", fileKey: "", fileName: "", fileSize: 0, mimeType: "" })}><X className="text-slate-400" /></Button>
                            </div>
                          ) : (
                            <label className="cursor-pointer block">
                              <div className="flex justify-center gap-2 mb-3"><FileText className="w-8 h-8 text-slate-300" /></div>
                              <span className="text-slate-500 font-medium">Click to upload file (Max 500MB)</span>
                              <input type="file" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, (url, key) => setResourceForm({ ...resourceForm, fileUrl: url, fileKey: key, fileName: f.name, fileSize: f.size, mimeType: f.type })) }} className="hidden" />
                            </label>
                          )}
                        </div>
                        <Button onClick={() => createResource.mutate(resourceForm)} disabled={!resourceForm.title || !resourceForm.fileUrl || uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-6">Add Resource</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Analytics Overview</h2>
              <p className="text-slate-500">Coming soon in Enterprise V2...</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* EDIT RESOURCE DIALOG */}
      {editingResource && (
        <Dialog open={showEditResourceDialog} onOpenChange={setShowEditResourceDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-none shadow-2xl rounded-3xl p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900">Edit Resource</DialogTitle>
              <DialogDescription className="text-slate-500">Update resource details and folder location</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 font-bold">Title *</Label>
                  <Input value={editingResource.title} onChange={e => setEditingResource({ ...editingResource, title: e.target.value })} className="mt-1.5 bg-slate-50 border-slate-200 rounded-xl text-slate-900" />
                </div>
                <div>
                  <Label className="text-slate-700 font-bold">Category *</Label>
                  <Select value={editingResource.category} onValueChange={(v: ResourceCategory) => setEditingResource({ ...editingResource, category: v })}>
                    <SelectTrigger className="mt-1.5 bg-slate-50 border-slate-200 rounded-xl text-slate-900"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900 shadow-xl rounded-xl">
                      {RESOURCE_CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value} className="text-slate-700 hover:bg-slate-50">
                          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />{c.label}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Folder Selection for Edit */}
              <div>
                <Label className="text-slate-700 font-bold flex items-center gap-2"><FolderInput className="w-4 h-4" /> Move to Folder</Label>
                {(() => {
                  const dbFolders = folders?.filter(f => f.category === editingResource.category).map(f => f.name) || [];
                  const resourceFolders = resources?.filter(r => r.category === editingResource.category && r.subcategory).map(r => r.subcategory).filter((v, i, a) => a.indexOf(v) === i) || [];
                  const allFolders = [...new Set([...dbFolders, ...resourceFolders])];
                  return (
                    <div className="mt-1.5 space-y-2">
                      <Select
                        value={
                          editingResource.subcategory === ""
                            ? "custom"
                            : editingResource.subcategory === null
                              ? "none"
                              : allFolders.includes(editingResource.subcategory)
                                ? editingResource.subcategory
                                : "custom"
                        }
                        onValueChange={(v) => setEditingResource({ ...editingResource, subcategory: v === "none" ? null : v === "custom" ? "" : v })}
                      >
                        <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl text-slate-900"><SelectValue placeholder="Select folder" /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-900 shadow-xl rounded-xl">
                          <SelectItem value="none" className="text-slate-400">Uncategorized</SelectItem>
                          {allFolders.map(f => <SelectItem key={f} value={f} className="text-slate-700">📁 {f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {!allFolders.includes(editingResource.subcategory || "") && editingResource.subcategory !== null && (
                        <Input value={editingResource.subcategory || ""} onChange={e => setEditingResource({ ...editingResource, subcategory: e.target.value })} placeholder="New folder name" className="bg-slate-50 border-slate-200 rounded-xl text-slate-900" />
                      )}
                    </div>
                  );
                })()}
              </div>

              <div><Label className="text-slate-700 font-bold">Description</Label><Textarea value={editingResource.description || ""} onChange={e => setEditingResource({ ...editingResource, description: e.target.value })} rows={2} className="mt-1.5 bg-slate-50 border-slate-200 rounded-xl text-slate-900" /></div>

              <div className="flex gap-3">
                <Button onClick={() => updateResource.mutate({ id: editingResource.id, title: editingResource.title, description: editingResource.description, category: editingResource.category, subcategory: editingResource.subcategory })} disabled={!editingResource.title || updateResource.isPending} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">Save Changes</Button>
                <Button variant="outline" onClick={() => { setShowEditResourceDialog(false); setEditingResource(null); }} className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* CREATE FOLDER DIALOG */}
      <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Create New Folder</DialogTitle>
            <DialogDescription className="text-slate-500">Organize your files</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-700 font-bold">Category *</Label>
              <Select value={selectedCategory} onValueChange={(v: ResourceCategory) => setSelectedCategory(v)}>
                <SelectTrigger className="mt-1.5 bg-slate-50 border-slate-200 rounded-xl text-slate-900"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900 shadow-xl rounded-xl">
                  {RESOURCE_CATEGORIES.map(c => (<SelectItem key={c.value} value={c.value} className="text-slate-700">{c.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-700 font-bold">Folder Name *</Label>
              <Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="e.g., Arduino/Chapter1" className="mt-1.5 bg-slate-50 border-slate-200 rounded-xl text-slate-900" />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => createFolder.mutate({ name: newFolderName, category: selectedCategory, description: "" })} disabled={!newFolderName.trim() || createFolder.isPending} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">Create Folder</Button>
              <Button variant="outline" onClick={() => { setShowCreateFolderDialog(false); setNewFolderName(""); }} className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* RENAME FOLDER DIALOG */}
      <Dialog open={showRenameFolderDialog} onOpenChange={setShowRenameFolderDialog}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Rename Folder</DialogTitle>
            <DialogDescription className="text-slate-500">Rename "{renamingFolder?.oldName}" - updates all paths</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label className="text-slate-700 font-bold">New Name *</Label><Input value={renamingFolder?.newName || ""} onChange={e => setRenamingFolder(renamingFolder ? { ...renamingFolder, newName: e.target.value } : null)} className="mt-1.5 bg-slate-50 border-slate-200 rounded-xl text-slate-900" autoFocus /></div>
            <div className="flex gap-3">
              <Button onClick={handleRenameFolderSubmit} disabled={!renamingFolder?.newName.trim() || updateResource.isPending} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl font-bold">Rename Folder</Button>
              <Button variant="outline" onClick={() => { setShowRenameFolderDialog(false); setRenamingFolder(null); }} className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* GLOBAL DIALOGS (Folder, Edit etc) would follow similar styling */}
    </div>
  );
}
