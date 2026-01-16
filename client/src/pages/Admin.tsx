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
import { Loader2, Plus, Trash2, Eye, Heart, BarChart3, FileText, LogOut, ImageIcon, Video, X, FolderOpen, Award, Upload, TrendingUp, Presentation, Code, Cpu, Terminal, CheckCircle, Pencil, FolderInput, FolderPlus, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

type ProjectCategory = "c_lang" | "arduino" | "python" | "embedded" | "iot";
type ResourceCategory = "lecture" | "daily_life";

// 수업자료에 포함되는 실제 DB 카테고리들 (Resources.tsx와 동기화)
const LECTURE_CATEGORIES = ["lecture_c", "lecture_arduino", "lecture_python", "presentation"];

const PROJECT_CATEGORIES = [
  { value: "c_lang" as const, label: "C/C++", color: "#3B82F6", icon: Terminal },
  { value: "arduino" as const, label: "Arduino", color: "#10B981", icon: Cpu },
  { value: "python" as const, label: "Python", color: "#F59E0B", icon: Code },
  { value: "embedded" as const, label: "Embedded", color: "#8B5CF6", icon: Cpu },
  { value: "iot" as const, label: "IoT", color: "#06B6D4", icon: Cpu },
];

const RESOURCE_CATEGORIES = [
  // 📚 수업자료
  { value: "lecture" as const, label: "📚 수업자료", color: "#3B82F6", group: "lecture" },
  // 📹 데일리영상
  { value: "daily_life" as const, label: "📹 데일리영상", color: "#EC4899", group: "daily" },
];

const ACCEPTED_FILE_TYPES = {
  image: ".jpg,.jpeg,.png,.gif,.webp",
  video: ".mp4,.webm,.mov",
  document: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
  all: ".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.c,.cpp,.py,.ino"
};

// ============================================
// 🚀 파일 용량: 2GB까지 지원! (Enterprise Grade)
// ============================================
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB - Enterprise Grade
const SMALL_FILE_THRESHOLD = 0; // 0MB - Always use Presigned URL (Vercel body limit 4.5MB issue)

// YouTube URL Input Component with Save functionality
function YouTubeUrlInput() {
  const [url, setUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { data: savedUrl, isLoading } = trpc.settings.get.useQuery({ key: "youtube_video_url" });
  const utils = trpc.useUtils();
  const setSetting = trpc.settings.set.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate({ key: "youtube_video_url" });
      toast.success("YouTube URL saved!");
      setIsSaving(false);
    },
    onError: (e) => {
      toast.error(e.message);
      setIsSaving(false);
    },
  });

  // Initialize local state when data loads
  useState(() => {
    if (savedUrl) setUrl(savedUrl);
  });

  const handleSave = () => {
    setIsSaving(true);
    setSetting.mutate({ key: "youtube_video_url", value: url, description: "Homepage YouTube video URL" });
  };

  // Extract video ID for preview
  const getYouTubeVideoId = (videoUrl: string) => {
    const match = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(url || savedUrl || "");

  if (isLoading) return <div className="text-white/50">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          value={url || savedUrl || ""}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="flex-1 bg-white/5 border-white/10 text-white"
        />
        <Button
          onClick={handleSave}
          disabled={isSaving || (!url && !savedUrl)}
          className="bg-red-500 hover:bg-red-600 text-white px-6"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </Button>
      </div>

      {/* Preview */}
      {videoId && (
        <div className="rounded-xl overflow-hidden border border-white/10">
          <div className="aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video preview"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="text-white/40 text-xs p-3 bg-white/[0.02]">
            ✓ Video ID: {videoId}
          </p>
        </div>
      )}
    </div>
  );
}

// Access Code Input Component for Student Verification
function AccessCodeInput() {
  const [code, setCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { data: savedCode, isLoading } = trpc.settings.get.useQuery({ key: "student_access_code" });
  const utils = trpc.useUtils();
  const setSetting = trpc.settings.set.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate({ key: "student_access_code" });
      toast.success("접근 코드가 저장되었습니다!");
      setIsSaving(false);
    },
    onError: (e) => {
      toast.error(e.message);
      setIsSaving(false);
    },
  });

  const handleSave = () => {
    if (!code.trim()) {
      toast.error("접근 코드를 입력해주세요");
      return;
    }
    setIsSaving(true);
    setSetting.mutate({ key: "student_access_code", value: code.trim(), description: "학생 인증을 위한 접근 코드" });
  };

  if (isLoading) return <div className="text-white/50">Loading...</div>;

  return (
    <div className="bg-white/[0.03] border border-amber-500/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-400 text-lg">🔐</span>
        <h3 className="text-white font-medium">수업자료 페이지 접근 코드</h3>
      </div>
      <p className="text-white/50 text-sm mb-3">
        학생이 회원가입 시 이 코드를 입력하면 수업자료에 접근할 수 있습니다.
      </p>
      <div className="flex gap-3">
        <Input
          value={code || savedCode || ""}
          onChange={(e) => setCode(e.target.value)}
          placeholder="예: 코딩쏙2024"
          className="flex-1 bg-white/5 border-white/10 text-white font-mono"
        />
        <Button
          onClick={handleSave}
          disabled={isSaving || (!code && !savedCode)}
          className="bg-amber-500 hover:bg-amber-600 text-black px-6"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "저장"}
        </Button>
      </div>
      {(code || savedCode) && (
        <div className="mt-3 p-2 bg-amber-500/10 rounded-lg">
          <p className="text-amber-400 text-sm">
            ✓ 현재 코드: <span className="font-mono font-bold">{code || savedCode}</span>
          </p>
        </div>
      )}
    </div>
  );
}

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
    onSuccess: () => {
      utils.folders.list.invalidate();
      toast.success("Folder created");
      setShowCreateFolderDialog(false);
      setNewFolderName("");
      setParentFolderName("__root__");
    },
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
  const getPPTThumbnail = trpc.upload.getPPTThumbnail.useMutation();

  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [showEditResourceDialog, setShowEditResourceDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showRenameFolderDialog, setShowRenameFolderDialog] = useState(false);
  const [showMoveFolderDialog, setShowMoveFolderDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [renamingFolder, setRenamingFolder] = useState<{ category: ResourceCategory, oldName: string, newName: string } | null>(null);
  const [movingFolder, setMovingFolder] = useState<{ id: number, name: string, category: ResourceCategory, currentParentId?: number | null } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [newFolderName, setNewFolderName] = useState("");
  const [parentFolderName, setParentFolderName] = useState("__root__");
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>("lecture");
  const [moveTargetParentId, setMoveTargetParentId] = useState<number | null>(null);

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
      // Find folder in DB - handle "lecture" category that groups multiple actual categories
      let folderInDb;
      if (renamingFolder.category === "lecture") {
        // For lecture category, search across all lecture sub-categories
        folderInDb = folders?.find(f =>
          LECTURE_CATEGORIES.includes(f.category) && f.name === renamingFolder.oldName
        );
      } else {
        folderInDb = folders?.find(f => f.category === renamingFolder.category && f.name === renamingFolder.oldName);
      }

      // Update folder in DB if it exists
      if (folderInDb) {
        console.log(`Renaming folder id ${folderInDb.id} from "${renamingFolder.oldName}" to "${renamingFolder.newName}"`);
        await updateFolder.mutateAsync({
          id: folderInDb.id,
          name: renamingFolder.newName.trim(),
        });
      } else {
        console.warn(`Folder not found in DB: ${renamingFolder.oldName} (category: ${renamingFolder.category})`);
      }

      // Update all resources in this folder
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

  const handleDeleteFolder = async (category: ResourceCategory, folderName: string, folderId?: number) => {
    if (!confirm(`Delete folder "${folderName}"? All files will be moved to Uncategorized.`)) {
      return;
    }

    try {
      // If we have a direct folder ID, use it; otherwise search for the folder
      let folderIdToDelete = folderId;

      if (!folderIdToDelete) {
        // Find folder in DB - handle "lecture" category that groups multiple actual categories
        let folderInDb;
        if (category === "lecture") {
          // For lecture category, search across all lecture sub-categories
          folderInDb = folders?.find(f =>
            LECTURE_CATEGORIES.includes(f.category) && f.name === folderName
          );
        } else {
          folderInDb = folders?.find(f => f.category === category && f.name === folderName);
        }
        folderIdToDelete = folderInDb?.id;
      }

      // Move all resources in this folder to Uncategorized
      const resourcesToMove = resources?.filter(r => {
        if (category === "lecture") {
          return LECTURE_CATEGORIES.includes(r.category) && r.subcategory === folderName;
        }
        return r.category === category && r.subcategory === folderName;
      }) || [];

      // Update resources first
      for (const resource of resourcesToMove) {
        await updateResource.mutateAsync({
          id: resource.id,
          subcategory: null,
        });
      }

      // Delete folder from DB if we have an ID
      if (folderIdToDelete) {
        await deleteFolder.mutateAsync({ id: folderIdToDelete });
        console.log(`Deleted folder ID: ${folderIdToDelete}`);
      }

      // Refresh the data
      await utils.folders.list.invalidate();
      await utils.resources.list.invalidate();

      toast.success(`Folder "${folderName}" deleted. ${resourcesToMove.length} files moved to Uncategorized.`);
    } catch (error) {
      toast.error("Failed to delete folder");
      console.error("Folder delete error:", error);
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

  // Build folder tree structure with nested folder support
  const getFolderTree = (category: ResourceCategory) => {
    // 수업자료: 여러 카테고리 통합 (Resources.tsx와 동일한 로직)
    const categoryResources = resources?.filter(r => {
      if (category === "lecture") return LECTURE_CATEGORIES.includes(r.category);
      return r.category === category;
    }) || [];
    const categoryFolders = folders?.filter(f => {
      if (category === "lecture") return LECTURE_CATEGORIES.includes(f.category);
      return f.category === category;
    }) || [];

    interface FolderNode {
      id?: number;
      name: string;
      path: string;
      items: any[];
      children: FolderNode[];
      parentId?: number | null;
      depth: number;
    }

    // Build folder lookup map
    const folderById = new Map<number, FolderNode>();
    const rootFolders: FolderNode[] = [];

    // First pass: create all folder nodes
    categoryFolders.forEach(folder => {
      const node: FolderNode = {
        id: folder.id,
        name: folder.name,
        path: `folder_${folder.id}`,
        items: [],
        children: [],
        parentId: folder.parentId,
        depth: 0
      };
      folderById.set(folder.id, node);
    });

    // Second pass: build tree structure
    categoryFolders.forEach(folder => {
      const node = folderById.get(folder.id)!;
      if (folder.parentId && folderById.has(folder.parentId)) {
        const parent = folderById.get(folder.parentId)!;
        parent.children.push(node);
        node.depth = parent.depth + 1;
        // Update path to include parent
        node.path = `${parent.path}/${folder.name}`;
      } else {
        rootFolders.push(node);
      }
    });

    // Add resources to their folders (by subcategory name matching folder name)
    categoryResources.forEach(resource => {
      const folderName = resource.subcategory;
      if (folderName) {
        // Find folder by name
        const folder = Array.from(folderById.values()).find(f => f.name === folderName);
        if (folder) {
          folder.items.push(resource);
        } else {
          // Folder doesn't exist in DB, add to a virtual folder
          let virtualFolder = rootFolders.find(f => f.name === folderName && !f.id);
          if (!virtualFolder) {
            virtualFolder = {
              name: folderName,
              path: `virtual_${folderName}`,
              items: [],
              children: [],
              depth: 0
            };
            rootFolders.push(virtualFolder);
          }
          virtualFolder.items.push(resource);
        }
      }
    });

    // Add Uncategorized folder for resources without subcategory
    const uncategorizedItems = categoryResources.filter(r => !r.subcategory);
    if (uncategorizedItems.length > 0 || rootFolders.length === 0) {
      const uncategorized: FolderNode = {
        name: "Uncategorized",
        path: "uncategorized",
        items: uncategorizedItems,
        children: [],
        depth: 0
      };
      rootFolders.push(uncategorized);
    }

    // Flatten tree for display (with depth info for indentation)
    const flattenTree = (nodes: FolderNode[], depth: number = 0): FolderNode[] => {
      const result: FolderNode[] = [];
      nodes.forEach(node => {
        node.depth = depth;
        result.push(node);
        if (node.children.length > 0) {
          result.push(...flattenTree(node.children, depth + 1));
        }
      });
      return result;
    };

    return flattenTree(rootFolders);
  };

  // ============================================
  // 🚀 Presigned URL 업로드 (대용량 파일 지원)
  // ============================================
  const handleFileUpload = useCallback(async (file: File, onComplete: (url: string, key: string, thumbUrl?: string, thumbKey?: string) => void) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Max ${MAX_FILE_SIZE / 1024 / 1024}MB allowed`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let result: { url: string; key: string };

      // 작은 파일 (10MB 이하) - 기존 Base64 방식
      if (file.size <= SMALL_FILE_THRESHOLD) {
        const base64 = await fileToBase64(file);
        setUploadProgress(50);
        result = await uploadFile.mutateAsync({
          fileName: file.name,
          fileContent: base64,
          contentType: file.type || "application/octet-stream"
        });
        setUploadProgress(100);
      }
      // 큰 파일 - Presigned URL 방식 (R2 직접 업로드)
      else {
        // 1. Presigned URL 받기
        setUploadProgress(5);
        const presigned = await getPresignedUrl.mutateAsync({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
        });

        // 2. R2에 직접 업로드 (진행률 추적)
        setUploadProgress(10);
        await uploadToPresignedUrl(presigned.presignedUrl, file, (progress) => {
          setUploadProgress(10 + Math.round(progress * 85));
        });

        setUploadProgress(100);
        result = { url: presigned.publicUrl, key: presigned.key };
      }

      // 비디오 썸네일 생성
      let thumbUrl = "", thumbKey = "";
      if (file.type.startsWith("video/")) {
        const thumb = await genVideoThumb(file);
        if (thumb) {
          const tr = await uploadFile.mutateAsync({ fileName: `thumb_${Date.now()}.jpg`, fileContent: thumb, contentType: "image/jpeg" });
          thumbUrl = tr.url; thumbKey = tr.key;
        }
      }

      // PPT 썸네일 자동 생성은 Office Online Viewer API가 R2 URL을 지원하지 않아 비활성화됨
      // 사용자가 수동으로 썸네일을 업로드할 수 있습니다
      if (file.type.includes('presentation') || file.type.includes('powerpoint') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
        console.log("📄 PPT 파일 감지 - 썸네일은 수동으로 업로드해주세요 (Office API는 R2 URL 미지원)");
      }

      onComplete(result.url, result.key, thumbUrl, thumbKey);
      toast.success("Upload complete!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
    finally { setUploading(false); setUploadProgress(0); }
  }, [uploadFile, getPresignedUrl]);

  // Base64 변환
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  // Presigned URL로 업로드 (진행률 추적)
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

  // 비디오 썸네일 생성
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

  // PPT 썸네일 생성 (서버 사이드 Office Online Viewer API 사용 - CORS 우회)
  const genPPTThumb = async (pptUrl: string): Promise<string | null> => {
    try {
      console.log("🎯 PPT 썸네일 생성 시작:", pptUrl);

      // 서버 사이드에서 썸네일을 가져와서 CORS 문제 해결
      const result = await getPPTThumbnail.mutateAsync({ fileUrl: pptUrl });

      console.log("📊 PPT 썸네일 응답:", JSON.stringify(result, null, 2));

      if (result.thumbnailUrl) {
        const thumbUrl = result.thumbnailUrl as string;
        console.log("✅ PPT 썸네일 생성 성공 (길이:", thumbUrl.length, "chars)");
        return thumbUrl;
      }

      console.warn("⚠️ PPT 썸네일 생성 실패 - Office API에서 썸네일을 가져올 수 없습니다", result);
      return null;
    } catch (error) {
      console.error("❌ PPT thumbnail generation failed:", error);
      return null;
    }
  };

  const getFileTypeIcon = (mimeType: string, fileName: string) => {
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint') || fileName?.endsWith('.ppt') || fileName?.endsWith('.pptx')) {
      return <Presentation className="w-5 h-5 text-orange-400" />;
    }
    if (mimeType?.includes('pdf') || fileName?.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-400" />;
    }
    if (mimeType?.startsWith('video/')) {
      return <Video className="w-5 h-5 text-purple-400" />;
    }
    if (mimeType?.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-blue-400" />;
    }
    return <FileText className="w-5 h-5 text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4">
        <h1 className="text-2xl font-light text-white mb-2">Login Required</h1>
        <p className="text-white/50 mb-6">Please login to access the admin panel</p>
        <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium py-3 rounded-xl">
          <a href={getLoginUrl()}>Login</a>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/"><span className="text-xl font-light tracking-wider cursor-pointer hover:opacity-70">JAHYEON<span className="text-emerald-400">.</span></span></Link>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-mono rounded-full">Admin</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/"><Button variant="outline" size="sm" className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"><Eye className="h-4 w-4 mr-2" />View Site</Button></Link>
              <Button variant="outline" size="sm" onClick={() => logout()} className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"><LogOut className="h-4 w-4 mr-2" />Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center"><Eye className="h-6 w-6 text-blue-400" /></div>
              <div><p className="text-sm text-white/50">Today's Views</p><p className="text-2xl font-light text-white">{analytics?.todayViews?.toLocaleString() || 0}</p></div>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center"><TrendingUp className="h-6 w-6 text-emerald-400" /></div>
              <div><p className="text-sm text-white/50">Unique Visitors</p><p className="text-2xl font-light text-white">{analytics?.uniqueVisitors?.toLocaleString() || 0}</p></div>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center"><Heart className="h-6 w-6 text-purple-400" /></div>
              <div><p className="text-sm text-white/50">Total Content</p><p className="text-2xl font-light text-white">{((projects?.length || 0) + (certifications?.length || 0) + (resources?.length || 0)).toLocaleString()}</p></div>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center"><FileText className="h-6 w-6 text-orange-400" /></div>
              <div><p className="text-sm text-white/50">Downloads</p><p className="text-2xl font-light text-white">{analytics?.totalDownloads?.toLocaleString() || 0}</p></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList className="bg-white/[0.02] border border-white/5 p-1 rounded-xl">
            <TabsTrigger value="projects" className="rounded-lg px-6 py-2.5 text-white/60 data-[state=active]:bg-emerald-500 data-[state=active]:text-black"><FolderOpen className="h-4 w-4 mr-2" />Projects ({projects?.length || 0})</TabsTrigger>
            <TabsTrigger value="certifications" className="rounded-lg px-6 py-2.5 text-white/60 data-[state=active]:bg-emerald-500 data-[state=active]:text-black"><Award className="h-4 w-4 mr-2" />Certs ({certifications?.length || 0})</TabsTrigger>
            <TabsTrigger value="resources" className="rounded-lg px-6 py-2.5 text-white/60 data-[state=active]:bg-emerald-500 data-[state=active]:text-black"><Upload className="h-4 w-4 mr-2" />Resources ({resources?.length || 0})</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg px-6 py-2.5 text-white/60 data-[state=active]:bg-emerald-500 data-[state=active]:text-black"><BarChart3 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg px-6 py-2.5 text-white/60 data-[state=active]:bg-emerald-500 data-[state=active]:text-black"><Video className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          {/* PROJECTS TAB */}
          <TabsContent value="projects">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div><h2 className="text-xl font-light text-white">Projects</h2><p className="text-white/50 mt-1">Manage your portfolio projects</p></div>
                <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
                  <DialogTrigger asChild><Button className="bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl"><Plus className="h-4 w-4 mr-2" />Add Project</Button></DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111] border-white/10 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-light">New Project</DialogTitle>
                      <DialogDescription className="text-white/50">Add a new project to your portfolio</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                      <div>
                        <Label className="text-white/70">Title *</Label>
                        <Input value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white" placeholder="Project title" />
                      </div>
                      <div><Label className="text-white/70">Description *</Label><Textarea value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} rows={3} className="mt-1.5 bg-white/5 border-white/10 text-white" /></div>
                      <div><Label className="text-white/70">Technologies *</Label><Input value={projectForm.technologies} onChange={e => setProjectForm({ ...projectForm, technologies: e.target.value })} placeholder="C, Python, Arduino" className="mt-1.5 bg-white/5 border-white/10 text-white" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-white/70">Project URL</Label><Input value={projectForm.projectUrl} onChange={e => setProjectForm({ ...projectForm, projectUrl: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white" /></div>
                        <div><Label className="text-white/70">GitHub URL</Label><Input value={projectForm.githubUrl} onChange={e => setProjectForm({ ...projectForm, githubUrl: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white" /></div>
                      </div>
                      <div><Label className="text-white/70">Project Image</Label>
                        <div className="mt-1.5 border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-emerald-400/50">
                          {projectForm.imageUrl ? (<div className="relative"><img src={projectForm.imageUrl} className="max-h-40 mx-auto rounded-lg" /><button onClick={() => setProjectForm({ ...projectForm, imageUrl: "", imageKey: "" })} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"><X className="w-4 h-4 text-white" /></button></div>) : (
                            <label className="cursor-pointer"><ImageIcon className="w-8 h-8 mx-auto text-white/30 mb-2" /><span className="text-white/50 text-sm">Upload image</span><input type="file" accept={ACCEPTED_FILE_TYPES.image} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, (url, key) => setProjectForm({ ...projectForm, imageUrl: url, imageKey: key })); }} /></label>
                          )}
                        </div>
                      </div>
                      <div><Label className="text-white/70">Video (YouTube URL)</Label><Input value={projectForm.videoUrl} onChange={e => setProjectForm({ ...projectForm, videoUrl: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white" placeholder="https://youtube.com/watch?v=..." /></div>
                      {uploading && (<div className="space-y-2"><Progress value={uploadProgress} className="h-2" /><p className="text-sm text-white/50 text-center">Uploading... {uploadProgress}%</p></div>)}
                      <Button onClick={() => createProject.mutate(projectForm)} disabled={!projectForm.title || !projectForm.description || !projectForm.technologies || uploading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl">{createProject.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create Project</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="divide-y divide-white/5">
                {projectsLoading ? (<div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-400" /></div>) : !projects?.length ? (<div className="p-12 text-center text-white/40">No projects yet</div>) : projects.map(project => (
                  <div key={project.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
                    <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">{project.imageUrl ? (<img src={project.imageUrl} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center"><Code className="w-6 h-6 text-white/20" /></div>)}</div>
                    <div className="flex-1 min-w-0"><h3 className="font-medium text-white truncate">{project.title}</h3><p className="text-sm text-white/40 truncate">{project.description}</p>
                      <div className="flex items-center gap-3 mt-1"><span className="text-xs text-white/30 flex items-center gap-1"><Eye className="w-3 h-3" />{project.viewCount || 0}</span></div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteProject.mutate({ id: project.id })} className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* CERTIFICATIONS TAB */}
          <TabsContent value="certifications">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div><h2 className="text-xl font-light text-white">Certifications</h2></div>
                <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
                  <DialogTrigger asChild><Button className="bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl"><Plus className="h-4 w-4 mr-2" />Add</Button></DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111] border-white/10 text-white">
                    <DialogHeader>
                      <DialogTitle>New Certification</DialogTitle>
                      <DialogDescription className="text-white/50">Add a new certification to your profile</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-white/70">Title *</Label><Input value={certForm.title} onChange={e => setCertForm({ ...certForm, title: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white" /></div>
                        <div><Label className="text-white/70">Issuer *</Label><Input value={certForm.issuer} onChange={e => setCertForm({ ...certForm, issuer: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-white/70">Issue Date *</Label><Input type="date" value={certForm.issueDate} onChange={e => setCertForm({ ...certForm, issueDate: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white" /></div>
                        <div><Label className="text-white/70">Expiry Date</Label><Input type="date" value={certForm.expiryDate} onChange={e => setCertForm({ ...certForm, expiryDate: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white" /></div>
                      </div>
                      <div><Label className="text-white/70">Certificate Image</Label>
                        <div className="mt-1.5 border-2 border-dashed border-white/10 rounded-xl p-6 text-center">
                          {certForm.imageUrl ? (<div className="relative"><img src={certForm.imageUrl} className="max-h-40 mx-auto rounded-lg" /><button onClick={() => setCertForm({ ...certForm, imageUrl: "", imageKey: "" })} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"><X className="w-4 h-4 text-white" /></button></div>) : (
                            <label className="cursor-pointer"><Award className="w-8 h-8 mx-auto text-white/30 mb-2" /><span className="text-white/50 text-sm">Upload</span><input type="file" accept={ACCEPTED_FILE_TYPES.image} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, (url, key) => setCertForm({ ...certForm, imageUrl: url, imageKey: key })); }} /></label>
                          )}
                        </div>
                      </div>
                      {uploading && <Progress value={uploadProgress} className="h-2" />}
                      <Button onClick={() => createCertification.mutate(certForm)} disabled={!certForm.title || !certForm.issuer || !certForm.issueDate || uploading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl">Add Certification</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="divide-y divide-white/5">
                {certsLoading ? (<div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>) : !certifications?.length ? (<div className="p-12 text-center text-white/40">No certifications</div>) : certifications.map(cert => (
                  <div key={cert.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">{cert.imageUrl ? <img src={cert.imageUrl} className="w-full h-full object-cover rounded-xl" /> : <Award className="w-6 h-6 text-emerald-400" />}</div>
                    <div className="flex-1"><h3 className="font-medium text-white">{cert.title}</h3><p className="text-sm text-white/40">{cert.issuer} • {cert.issueDate}</p></div>
                    <Button variant="ghost" size="sm" onClick={() => deleteCertification.mutate({ id: cert.id })} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* RESOURCES TAB - 500MB 지원! */}
          <TabsContent value="resources">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-light text-white">Resources</h2>
                    <p className="text-white/50 mt-1 flex items-center gap-2">
                      Videos, PPT, PDF
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Up to 2GB
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => { setParentFolderName("__root__"); setNewFolderName(""); setShowCreateFolderDialog(true); }} className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl">
                      <FolderOpen className="h-4 w-4 mr-2" />New Folder
                    </Button>
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 flex-wrap">
                  {RESOURCE_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat.value ? 'text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                      style={selectedCategory === cat.value ? { backgroundColor: cat.color } : {}}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Folder Tree View */}
              <div className="divide-y divide-white/5">
                {resourcesLoading ? (
                  <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-400" /></div>
                ) : getFolderTree(selectedCategory).length === 0 ? (
                  <div className="p-12 text-center text-white/40">No resources in this category</div>
                ) : (
                  getFolderTree(selectedCategory).map(folder => {
                    const isExpanded = expandedFolders.has(folder.path);
                    const depth = (folder as any).depth || 0;
                    return (
                      <div key={folder.path} className="bg-white/[0.01]">
                        {/* Folder Header */}
                        <div
                          className="p-3 flex items-center gap-3 hover:bg-white/[0.02] transition-all"
                          style={{ paddingLeft: `${12 + depth * 24}px` }}
                        >
                          <button
                            onClick={() => toggleFolder(folder.path)}
                            className="flex-1 flex items-center gap-3"
                          >
                            {depth > 0 && (
                              <div className="text-white/20 mr-1">↳</div>
                            )}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${depth > 0 ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                              <FolderOpen className={`w-4 h-4 ${depth > 0 ? 'text-blue-400' : 'text-purple-400'}`} />
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="text-white font-medium text-sm">
                                {folder.name === "Uncategorized" ? "📄 " + folder.name : (depth > 0 ? "📂 " : "📁 ") + folder.name}
                              </h3>
                              <p className="text-white/30 text-xs">{folder.items.length} files{(folder as any).children?.length > 0 ? `, ${(folder as any).children.length} subfolders` : ''}</p>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-white/50" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-white/30" />
                            )}
                          </button>
                          {folder.name !== "Uncategorized" && (
                            <>
                              {/* Add Subfolder Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setParentFolderName(folder.name);
                                  setNewFolderName("");
                                  setShowCreateFolderDialog(true);
                                }}
                                className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                title="Add Subfolder"
                              >
                                <FolderPlus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRenameFolder(selectedCategory, folder.name);
                                }}
                                className="h-7 w-7 p-0 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                title="Rename"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              {/* Move Folder Button - Show for ALL folders */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const folderId = (folder as any).id;
                                  if (folderId) {
                                    // Folder exists in DB
                                    setMovingFolder({
                                      id: folderId,
                                      name: folder.name,
                                      category: selectedCategory,
                                      currentParentId: (folder as any).parentId
                                    });
                                  } else {
                                    // Folder from resources only - create temp entry
                                    // We'll handle this case specially in move handler
                                    setMovingFolder({
                                      id: -1, // Special marker for "no DB id"
                                      name: folder.name,
                                      category: selectedCategory,
                                      currentParentId: null
                                    });
                                  }
                                  setMoveTargetParentId((folder as any).parentId || null);
                                  setShowMoveFolderDialog(true);
                                }}
                                className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                title="Move to folder"
                              >
                                <FolderInput className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const folderId = (folder as any).id;
                                  handleDeleteFolder(selectedCategory, folder.name, folderId);
                                }}
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Folder Contents */}
                        {isExpanded && (
                          <div className="bg-white/[0.02] divide-y divide-white/5">
                            {folder.items.map(resource => (
                              <div key={resource.id} className="p-2 pl-14 flex items-center gap-3 hover:bg-white/[0.02]">
                                <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                  {resource.thumbnailUrl ? (
                                    <img src={resource.thumbnailUrl} className="w-full h-full object-cover" />
                                  ) : (
                                    getFileTypeIcon(resource.mimeType || '', resource.fileName || '')
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white text-xs truncate">{resource.title}</h4>
                                  <p className="text-white/30 text-[10px] truncate">{resource.fileName}</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditResource(resource)} className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => deleteResource.mutate({ id: resource.id })} className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Resource Button - Fixed Position */}
              <div className="p-4 border-t border-white/5">
                <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
                  <DialogTrigger asChild><Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl"><Plus className="h-4 w-4 mr-2" />Add Resource</Button></DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111] border-white/10 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-light">New Resource</DialogTitle>
                      <DialogDescription className="text-white/50">Add a new resource (video, PDF, or PPT file)</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-white/70">Title *</Label><Input value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white" /></div>
                        <div><Label className="text-white/70">Category *</Label>
                          <Select value={resourceForm.category} onValueChange={(v: ResourceCategory) => setResourceForm({ ...resourceForm, category: v })}>
                            <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#111] border-white/10">{RESOURCE_CATEGORIES.map(c => (<SelectItem key={c.value} value={c.value} className="text-white hover:bg-white/10"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />{c.label}</div></SelectItem>))}</SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Folder/Subcategory */}
                      <div>
                        <Label className="text-white/70">Folder (Optional)</Label>
                        <p className="text-white/40 text-xs mb-2">Select existing folder or create new</p>

                        {/* Get all unique folders from both DB and resources */}
                        {(() => {
                          const dbFolders = folders?.filter(f => f.category === resourceForm.category).map(f => f.name) || [];
                          const resourceFolders = resources?.filter(r => r.category === resourceForm.category && r.subcategory).map(r => r.subcategory).filter((v): v is string => v !== null && v !== undefined).filter((v, i, a) => a.indexOf(v) === i) || [];
                          const allFolders = [...new Set([...dbFolders, ...resourceFolders])];

                          return allFolders.length > 0 ? (
                            <div className="space-y-2">
                              <Select
                                value={
                                  allFolders.includes(resourceForm.subcategory)
                                    ? resourceForm.subcategory
                                    : "custom"
                                }
                                onValueChange={(v) => {
                                  if (v === "custom") {
                                    setResourceForm({ ...resourceForm, subcategory: "" });
                                  } else {
                                    setResourceForm({ ...resourceForm, subcategory: v });
                                  }
                                }}
                              >
                                <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white">
                                  <SelectValue placeholder="Select folder or create new" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111] border-white/10">
                                  <SelectItem value="custom" className="text-white/50 hover:bg-white/10">
                                    ✏️ Create new folder...
                                  </SelectItem>
                                  {allFolders.sort().map(folder => (
                                    <SelectItem key={folder} value={folder} className="text-white hover:bg-white/10">
                                      📁 {folder}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {!allFolders.includes(resourceForm.subcategory) && (
                                <Input
                                  value={resourceForm.subcategory}
                                  onChange={e => setResourceForm({ ...resourceForm, subcategory: e.target.value })}
                                  placeholder="Enter new folder name (e.g., Arduino, Chapter 1-5)"
                                  className="bg-white/5 border-white/10 text-white"
                                />
                              )}
                            </div>
                          ) : (
                            <Input
                              value={resourceForm.subcategory}
                              onChange={e => setResourceForm({ ...resourceForm, subcategory: e.target.value })}
                              placeholder="e.g., Arduino, Python Basics, Chapter 1-5"
                              className="mt-1.5 bg-white/5 border-white/10 text-white"
                            />
                          );
                        })()}
                      </div>

                      <div><Label className="text-white/70">Description</Label><Textarea value={resourceForm.description} onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })} rows={2} className="mt-1.5 bg-white/5 border-white/10 text-white" /></div>

                      {/* 파일 업로드 - 500MB 지원 */}
                      <div>
                        <Label className="text-white/70">File (up to 500MB)</Label>
                        <div className="mt-1.5 border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-emerald-400/50 transition-colors">
                          {resourceForm.fileUrl ? (
                            <div className="flex items-center justify-center gap-3">
                              {getFileTypeIcon(resourceForm.mimeType, resourceForm.fileName)}
                              <div className="text-left">
                                <p className="text-white text-sm truncate max-w-[200px]">{resourceForm.fileName}</p>
                                <p className="text-white/40 text-xs">{formatFileSize(resourceForm.fileSize)}</p>
                              </div>
                              <button onClick={() => setResourceForm({ ...resourceForm, fileUrl: "", fileKey: "", fileName: "", fileSize: 0, mimeType: "" })} className="p-1 bg-white/10 rounded-full hover:bg-white/20"><X className="w-4 h-4 text-white" /></button>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <Presentation className="w-6 h-6 text-orange-400" />
                                <Video className="w-6 h-6 text-purple-400" />
                                <FileText className="w-6 h-6 text-red-400" />
                              </div>
                              <span className="text-white/50 text-sm">Click to upload</span>
                              <p className="text-emerald-400 text-xs mt-1 font-medium">✨ Up to 500MB supported!</p>
                              <input type="file" accept={ACCEPTED_FILE_TYPES.all} className="hidden" onChange={e => {
                                const f = e.target.files?.[0];
                                if (f) handleFileUpload(f, (url, key, thumbUrl, thumbKey) => {
                                  setResourceForm({ ...resourceForm, fileUrl: url, fileKey: key, fileName: f.name, fileSize: f.size, mimeType: f.type, thumbnailUrl: thumbUrl || "", thumbnailKey: thumbKey || "" });
                                });
                              }} />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* YouTube URL */}
                      <div><Label className="text-white/70">Or YouTube URL</Label><Input value={resourceForm.fileUrl.includes('youtube') || resourceForm.fileUrl.includes('youtu.be') ? resourceForm.fileUrl : ''} onChange={e => setResourceForm({ ...resourceForm, fileUrl: e.target.value, mimeType: 'video/youtube' })} className="mt-1.5 bg-white/5 border-white/10 text-white" placeholder="https://youtube.com/watch?v=..." /></div>

                      {/* Thumbnail */}
                      <div><Label className="text-white/70">Thumbnail (optional)</Label>
                        <div className="mt-1.5 border-2 border-dashed border-white/10 rounded-xl p-4 text-center">
                          {resourceForm.thumbnailUrl ? (<div className="relative inline-block"><img src={resourceForm.thumbnailUrl} className="max-h-24 rounded-lg" /><button onClick={() => setResourceForm({ ...resourceForm, thumbnailUrl: "", thumbnailKey: "" })} className="absolute -top-2 -right-2 p-1 bg-black/50 rounded-full"><X className="w-3 h-3 text-white" /></button></div>) : (
                            <label className="cursor-pointer"><ImageIcon className="w-6 h-6 mx-auto text-white/30 mb-1" /><span className="text-white/50 text-xs">Upload thumbnail</span><input type="file" accept={ACCEPTED_FILE_TYPES.image} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, (url, key) => setResourceForm({ ...resourceForm, thumbnailUrl: url, thumbnailKey: key })); }} /></label>
                          )}
                        </div>
                      </div>

                      {uploading && (<div className="space-y-2"><Progress value={uploadProgress} className="h-2" /><p className="text-sm text-white/50 text-center">{uploadProgress < 95 ? `Uploading... ${uploadProgress}%` : 'Finalizing...'}</p></div>)}

                      <Button onClick={() => createResource.mutate(resourceForm)} disabled={!resourceForm.title || !resourceForm.fileUrl || uploading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl">{createResource.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Resource</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h2 className="text-xl font-light text-white mb-6">Analytics Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/[0.02] rounded-xl border border-white/5">
                  <h3 className="text-white/70 mb-4">Top Projects</h3>
                  <div className="space-y-3">{projects?.slice().sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5).map((p, i) => (<div key={p.id} className="flex items-center justify-between"><span className="text-white text-sm truncate">{i + 1}. {p.title}</span><span className="text-emerald-400 text-sm">{p.viewCount || 0}</span></div>))}</div>
                </div>
                <div className="p-6 bg-white/[0.02] rounded-xl border border-white/5">
                  <h3 className="text-white/70 mb-4">Top Resources</h3>
                  <div className="space-y-3">{resources?.slice().sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0)).slice(0, 5).map((r, i) => (<div key={r.id} className="flex items-center justify-between"><span className="text-white text-sm truncate">{i + 1}. {r.title}</span><span className="text-emerald-400 text-sm">{r.downloadCount || 0}</span></div>))}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SETTINGS TAB - YouTube URL etc. */}
          <TabsContent value="settings">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-8">
              <div>
                <h2 className="text-xl font-light text-white mb-2">Site Settings</h2>
                <p className="text-white/50">Configure homepage video and other settings</p>
              </div>

              {/* YouTube Video Section */}
              <div className="space-y-4 p-6 bg-white/[0.03] rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <Video className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Homepage YouTube Video</h3>
                    <p className="text-white/50 text-sm">This video will be displayed on the main homepage after the hero section</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-white/70">YouTube Video URL</Label>
                  <YouTubeUrlInput />
                </div>
              </div>

              {/* Student Access Code Section */}
              <AccessCodeInput />

              {/* Folder Cleanup Section */}
              <div className="space-y-4 p-6 bg-white/[0.03] rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Folder Maintenance</h3>
                    <p className="text-white/50 text-sm">Clean up duplicate folders and fix data integrity issues</p>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      const result = await utils.client.folders.cleanupDuplicates.mutate();
                      toast.success(result.message || `${result.deletedCount}개의 중복 폴더가 삭제되었습니다`);
                      utils.folders.list.invalidate();
                    } catch (error) {
                      toast.error("중복 폴더 정리 실패");
                      console.error(error);
                    }
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl"
                >
                  🧹 중복 폴더 정리
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* EDIT RESOURCE DIALOG */}
      {editingResource && (
        <Dialog open={showEditResourceDialog} onOpenChange={setShowEditResourceDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-light">Edit Resource</DialogTitle>
              <DialogDescription className="text-white/50">Update resource details and folder location</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70">Title *</Label>
                  <Input
                    value={editingResource.title}
                    onChange={e => setEditingResource({ ...editingResource, title: e.target.value })}
                    className="mt-1.5 bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white/70">Category *</Label>
                  <Select value={editingResource.category} onValueChange={(v: ResourceCategory) => setEditingResource({ ...editingResource, category: v })}>
                    <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10">
                      {RESOURCE_CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value} className="text-white hover:bg-white/10">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Folder Selection */}
              <div>
                <Label className="text-white/70 flex items-center gap-2">
                  <FolderInput className="w-4 h-4" />
                  Move to Folder
                </Label>
                <p className="text-white/40 text-xs mb-2">Select existing folder or create new</p>

                {/* Get all unique folders from both DB and resources */}
                {(() => {
                  const dbFolders = folders?.filter(f => f.category === editingResource.category).map(f => f.name) || [];
                  const resourceFolders = resources?.filter(r => r.category === editingResource.category && r.subcategory).map(r => r.subcategory).filter((v): v is string => v !== null && v !== undefined).filter((v, i, a) => a.indexOf(v) === i) || [];
                  const allFolders = [...new Set([...dbFolders, ...resourceFolders])];

                  return allFolders.length > 0 ? (
                    <div className="space-y-2">
                      <Select
                        value={
                          editingResource.subcategory === "" || editingResource.subcategory === null
                            ? "none"
                            : allFolders.includes(editingResource.subcategory)
                              ? editingResource.subcategory
                              : "custom"
                        }
                        onValueChange={(v) => {
                          if (v === "custom") {
                            setEditingResource({ ...editingResource, subcategory: "" });
                          } else if (v === "none") {
                            setEditingResource({ ...editingResource, subcategory: null });
                          } else {
                            setEditingResource({ ...editingResource, subcategory: v });
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select folder or create new" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-white/10">
                          <SelectItem value="custom" className="text-white/50 hover:bg-white/10">
                            ✏️ Create new folder...
                          </SelectItem>
                          <SelectItem value="none" className="text-white/50 hover:bg-white/10">
                            📄 Uncategorized (no folder)
                          </SelectItem>
                          {allFolders.sort().map(folder => (
                            <SelectItem key={folder} value={folder} className="text-white hover:bg-white/10">
                              📁 {folder}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {editingResource.subcategory !== null && !allFolders.includes(editingResource.subcategory) && (
                        <Input
                          value={editingResource.subcategory || ""}
                          onChange={e => setEditingResource({ ...editingResource, subcategory: e.target.value })}
                          placeholder="Enter new folder name (e.g., Arduino, Chapter 1-5)"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      )}
                    </div>
                  ) : (
                    <Input
                      value={editingResource.subcategory || ""}
                      onChange={e => setEditingResource({ ...editingResource, subcategory: e.target.value })}
                      placeholder="e.g., Arduino, Python Basics, Chapter 1-5"
                      className="mt-1.5 bg-white/5 border-white/10 text-white"
                    />
                  );
                })()}
              </div>

              <div>
                <Label className="text-white/70">Description</Label>
                <Textarea
                  value={editingResource.description || ""}
                  onChange={e => setEditingResource({ ...editingResource, description: e.target.value })}
                  rows={2}
                  className="mt-1.5 bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <Label className="text-white/70">Current File</Label>
                <div className="flex items-center gap-3 mt-2">
                  {getFileTypeIcon(editingResource.mimeType || '', editingResource.fileName || '')}
                  <div>
                    <p className="text-white text-sm">{editingResource.fileName}</p>
                    <p className="text-white/40 text-xs">{formatFileSize(editingResource.fileSize)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    updateResource.mutate({
                      id: editingResource.id,
                      title: editingResource.title,
                      description: editingResource.description,
                      category: editingResource.category,
                      subcategory: editingResource.subcategory,
                    });
                  }}
                  disabled={!editingResource.title || updateResource.isPending}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl"
                >
                  {updateResource.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditResourceDialog(false);
                    setEditingResource(null);
                  }}
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* CREATE FOLDER DIALOG */}
      <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
        <DialogContent className="max-w-md bg-[#111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-light">Create New Folder</DialogTitle>
            <DialogDescription className="text-white/50">
              Create a folder to organize your files. Use "/" for nested folders (e.g., "Arduino/Chapter1")
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/70">Category *</Label>
              <Select value={selectedCategory} onValueChange={(v: ResourceCategory) => setSelectedCategory(v)}>
                <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10">
                  {RESOURCE_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value} className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white/70">Folder Name *</Label>
              <Input
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="e.g., Chapter1"
                className="mt-1.5 bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Parent Folder Selector for Nested Folders */}
            {(() => {
              // When category is 'lecture', check against all LECTURE_CATEGORIES
              const categoryFilter = (cat: string) => 
                selectedCategory === "lecture" ? LECTURE_CATEGORIES.includes(cat) : cat === selectedCategory;
              
              const existingFolders = Array.from(new Set([
                ...(resources?.filter(r => categoryFilter(r.category) && r.subcategory).map(r => r.subcategory) || []),
                ...(folders?.filter(f => categoryFilter(f.category)).map(f => f.name) || [])
              ])).filter(Boolean).sort() as string[];

              if (existingFolders.length > 0) {
                return (
                  <div>
                    <Label className="text-white/70">Parent Folder (Optional)</Label>
                    <Select value={parentFolderName} onValueChange={setParentFolderName}>
                      <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="📁 Root (No parent folder)" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111] border-white/10">
                        <SelectItem value="__root__" className="text-white hover:bg-white/10">
                          📁 Root (No parent folder)
                        </SelectItem>
                        {existingFolders.map(folder => (
                          <SelectItem key={folder} value={folder} className="text-white hover:bg-white/10">
                            📂 {folder}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-white/40 text-xs mt-1">
                      💡 Select a parent folder to create a subfolder inside it
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {/* Preview of final folder path */}
            {newFolderName.trim() && (
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-white/50 text-xs mb-1">📍 Folder will be created as:</p>
                <p className="text-purple-400 font-mono text-sm">
                  {parentFolderName !== '__root__' ? (
                    <>📂 {parentFolderName} / 📁 {newFolderName}</>
                  ) : (
                    <>📁 {newFolderName} (in {selectedCategory})</>
                  )}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (!newFolderName.trim()) {
                    toast.error("Please enter a folder name");
                    return;
                  }
                  // Find parent folder ID if parentFolderName is selected
                  let parentId: number | undefined = undefined;
                  if (parentFolderName !== '__root__') {
                    // For lecture category, search across all LECTURE_CATEGORIES
                    const parentFolder = selectedCategory === "lecture"
                      ? folders?.find(f => LECTURE_CATEGORIES.includes(f.category) && f.name === parentFolderName)
                      : folders?.find(f => f.name === parentFolderName && f.category === selectedCategory);
                    if (parentFolder) {
                      parentId = parentFolder.id;
                    }
                  }
                  // Convert UI category to valid DB category
                  // 'lecture' is a UI-only category that groups multiple DB categories
                  const dbCategory = selectedCategory === "lecture" ? "presentation" : selectedCategory;

                  createFolder.mutate({
                    name: newFolderName.trim(),
                    category: dbCategory as any,
                    parentId: parentId,
                    description: "",
                  });
                }}
                disabled={!newFolderName.trim() || createFolder.isPending}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl"
              >
                {createFolder.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Folder
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateFolderDialog(false);
                  setNewFolderName("");
                  setParentFolderName("__root__");
                }}
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* RENAME FOLDER DIALOG */}
      <Dialog open={showRenameFolderDialog} onOpenChange={setShowRenameFolderDialog}>
        <DialogContent className="max-w-md bg-[#111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-light">Rename Folder</DialogTitle>
            <DialogDescription className="text-white/50">
              Rename "{renamingFolder?.oldName}" - all files in this folder will be updated
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/70">Current Name</Label>
              <div className="mt-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/50">
                📁 {renamingFolder?.oldName}
              </div>
            </div>

            <div>
              <Label className="text-white/70">New Name *</Label>
              <Input
                value={renamingFolder?.newName || ""}
                onChange={e => setRenamingFolder(renamingFolder ? { ...renamingFolder, newName: e.target.value } : null)}
                placeholder="Enter new folder name"
                className="mt-1.5 bg-white/5 border-white/10 text-white"
                autoFocus
              />
              <p className="text-white/40 text-xs mt-1">
                💡 This will update {resources?.filter(r => r.category === renamingFolder?.category && r.subcategory === renamingFolder?.oldName).length || 0} files
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleRenameFolderSubmit}
                disabled={!renamingFolder?.newName.trim() || renamingFolder?.newName === renamingFolder?.oldName || updateResource.isPending}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl"
              >
                {updateResource.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Rename Folder
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRenameFolderDialog(false);
                  setRenamingFolder(null);
                }}
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MOVE FOLDER DIALOG - Cross-Category Support */}
      <Dialog open={showMoveFolderDialog} onOpenChange={setShowMoveFolderDialog}>
        <DialogContent className="max-w-md bg-[#111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-light">Move Folder</DialogTitle>
            <DialogDescription className="text-white/50">
              Move "{movingFolder?.name}" to another category or folder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/70">Current Folder</Label>
              <div className="mt-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/50">
                📁 {movingFolder?.name} ({RESOURCE_CATEGORIES.find(c => c.value === movingFolder?.category)?.label || movingFolder?.category})
              </div>
            </div>

            {/* Target Category Selector - NEW! */}
            <div>
              <Label className="text-white/70 flex items-center gap-2">
                🏷️ Target Category *
              </Label>
              <Select
                value={movingFolder?.category || selectedCategory}
                onValueChange={(v: ResourceCategory) => {
                  if (movingFolder) {
                    setMovingFolder({ ...movingFolder, category: v });
                    setMoveTargetParentId(null); // Reset parent when category changes
                  }
                }}
              >
                <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select target category" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10">
                  {RESOURCE_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value} className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.label}
                        {c.value === movingFolder?.category && " (현재)"}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-emerald-400/80 text-xs mt-1">
                💡 다른 카테고리로 이동하면 폴더 안의 모든 파일도 함께 이동됩니다
              </p>
            </div>

            <div>
              <Label className="text-white/70">Parent Folder (Optional)</Label>
              <Select
                value={moveTargetParentId === null ? "__root__" : String(moveTargetParentId)}
                onValueChange={(v) => setMoveTargetParentId(v === "__root__" ? null : Number(v))}
              >
                <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select parent folder" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10">
                  <SelectItem value="__root__" className="text-white hover:bg-white/10">
                    📁 Root (No parent folder)
                  </SelectItem>
                  {/* For lecture category, show all folders from LECTURE_CATEGORIES */}
                  {folders?.filter(f => {
                    const matchCategory = movingFolder?.category === "lecture"
                      ? LECTURE_CATEGORIES.includes(f.category)
                      : f.category === movingFolder?.category;
                    return matchCategory && f.id !== movingFolder?.id && f.parentId !== movingFolder?.id;
                  }).map(f => (
                    <SelectItem key={f.id} value={String(f.id)} className="text-white hover:bg-white/10">
                      📂 {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-white/50 text-xs mb-1">📍 이동 결과:</p>
              <p className="text-blue-400 font-mono text-sm">
                [{RESOURCE_CATEGORIES.find(c => c.value === movingFolder?.category)?.label}]
                {moveTargetParentId
                  ? ` / 📂 ${folders?.find(f => f.id === moveTargetParentId)?.name} / 📁 ${movingFolder?.name}`
                  : ` / 📁 ${movingFolder?.name}`
                }
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  if (!movingFolder) return;
                  try {
                    const originalCategory = movingFolder.currentParentId !== undefined
                      ? folders?.find(f => f.id === movingFolder.id)?.category
                      : movingFolder.category;
                    const newCategory = movingFolder.category;
                    const hasFolderInDb = movingFolder.id > 0;

                    // Get target parent folder name if exists
                    const targetParentFolder = moveTargetParentId
                      ? folders?.find(f => f.id === moveTargetParentId)
                      : null;

                    // Update folder in DB only if it exists
                    if (hasFolderInDb) {
                      await updateFolder.mutateAsync({
                        id: movingFolder.id,
                        parentId: moveTargetParentId,
                        category: newCategory,
                      });
                    } else {
                      // Create new folder in target category if moving cross-category
                      await createFolder.mutateAsync({
                        name: movingFolder.name,
                        category: newCategory,
                        parentId: moveTargetParentId,
                      });
                    }

                    // Update all resources in this folder
                    const resourcesToMove = resources?.filter(r =>
                      r.category === originalCategory &&
                      r.subcategory === movingFolder.name
                    ) || [];

                    // New subcategory is the target parent folder's name, or the moved folder's name if going to root
                    const newSubcategory = targetParentFolder
                      ? `${targetParentFolder.name}/${movingFolder.name}`
                      : movingFolder.name;

                    for (const resource of resourcesToMove) {
                      await updateResource.mutateAsync({
                        id: resource.id,
                        category: newCategory,
                        subcategory: newSubcategory,
                      });
                    }

                    toast.success(`폴더 "${movingFolder.name}"와 ${resourcesToMove.length}개 파일이 이동되었습니다`);

                    setShowMoveFolderDialog(false);
                    setMovingFolder(null);
                    utils.resources.list.invalidate();
                    utils.folders.list.invalidate();
                  } catch (error) {
                    toast.error("폴더 이동 실패");
                    console.error(error);
                  }
                }}
                disabled={updateFolder.isPending}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
              >
                {updateFolder.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Move Folder
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowMoveFolderDialog(false);
                  setMovingFolder(null);
                }}
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
