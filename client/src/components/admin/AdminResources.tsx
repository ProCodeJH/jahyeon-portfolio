/**
 * AdminResources.tsx
 * 리소스 CRUD + 폴더 관리 컴포넌트
 * Admin.tsx에서 분리됨 - 가장 큰 섹션
 */

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
    Loader2, Plus, Trash2, X, FolderOpen, CheckCircle, Pencil,
    FolderInput, FolderPlus, ChevronDown, ChevronRight, Presentation,
    Video, FileText, ImageIcon
} from "lucide-react";
import { toast } from "sonner";

// ============================================
// 🔧 Types
// ============================================
type ResourceCategory = "presentation" | "daily_life" | "lecture_c" | "lecture_arduino" | "lecture_python" | "lecture_materials" | "arduino_projects" | "c_projects" | "python_projects";
type ViewCategory = "lecture" | "daily_life";

// Resource 타입 정의 (any 제거)
interface Resource {
    id: number;
    title: string;
    description?: string | null;
    fileUrl: string;
    fileKey: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    category: ResourceCategory;
    subcategory?: string | null;
    thumbnailUrl?: string | null;
    thumbnailKey?: string | null;
    downloadCount: number;
    likeCount: number;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

interface ResourceForm {
    title: string;
    description: string;
    category: ResourceCategory;
    subcategory: string;
    fileUrl: string;
    fileKey: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    thumbnailUrl: string;
    thumbnailKey: string;
}

interface AdminResourcesProps {
    handleFileUpload: (file: File, onComplete: (url: string, key: string, thumbUrl?: string, thumbKey?: string) => void) => Promise<void>;
    uploading: boolean;
    uploadProgress: number;
}

// ============================================
// 🔧 Constants
// ============================================
const LECTURE_CATEGORIES = ["lecture_c", "lecture_arduino", "lecture_python", "presentation", "lecture_materials"];

const VIEW_CATEGORIES = [
    { value: "lecture" as const, label: "📚 수업자료", color: "#3B82F6" },
    { value: "daily_life" as const, label: "📹 데일리영상", color: "#EC4899" },
];

const RESOURCE_CATEGORIES = [
    { value: "presentation" as const, label: "📚 수업자료", color: "#3B82F6", group: "lecture" },
    { value: "daily_life" as const, label: "📹 데일리영상", color: "#EC4899", group: "daily" },
];

const ACCEPTED_FILE_TYPES = {
    all: ".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.c,.cpp,.py,.ino,.html,.htm,.js,.css,.ts,.tsx,.json",
    image: ".jpg,.jpeg,.png,.gif,.webp",
};

const initialResourceForm: ResourceForm = {
    title: "",
    description: "",
    category: "daily_life",
    subcategory: "",
    fileUrl: "",
    fileKey: "",
    fileName: "",
    fileSize: 0,
    mimeType: "",
    thumbnailUrl: "",
    thumbnailKey: "",
};

// ============================================
// 🔧 Helper Functions
// ============================================
const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
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

// ============================================
// 🚀 AdminResources Component
// ============================================
export default function AdminResources({ handleFileUpload, uploading, uploadProgress }: AdminResourcesProps) {
    const utils = trpc.useUtils();

    const { data: resources, isLoading: resourcesLoading } = trpc.resources.list.useQuery();
    const { data: folders } = trpc.folders.list.useQuery();

    const createResource = trpc.resources.create.useMutation({
        onSuccess: () => {
            utils.resources.list.invalidate();
            toast.success("Resource created");
            setShowResourceDialog(false);
            resetResourceForm();
        },
        onError: (e) => toast.error(e.message),
    });

    const updateResource = trpc.resources.update.useMutation({
        onSuccess: () => {
            utils.resources.list.invalidate();
            toast.success("Resource updated");
            setShowEditResourceDialog(false);
            setEditingResource(null);
        },
        onError: (e) => toast.error(e.message),
    });

    const deleteResource = trpc.resources.delete.useMutation({
        onSuccess: () => {
            utils.resources.list.invalidate();
            toast.success("Deleted");
        },
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
        onSuccess: () => {
            utils.folders.list.invalidate();
            toast.success("Folder updated");
            setShowRenameFolderDialog(false);
            setRenamingFolder(null);
        },
        onError: (e) => toast.error(e.message),
    });

    const deleteFolder = trpc.folders.delete.useMutation({
        onSuccess: () => {
            utils.folders.list.invalidate();
            toast.success("Folder deleted");
        },
    });

    // State
    const [showResourceDialog, setShowResourceDialog] = useState(false);
    const [showEditResourceDialog, setShowEditResourceDialog] = useState(false);
    const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
    const [showRenameFolderDialog, setShowRenameFolderDialog] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [renamingFolder, setRenamingFolder] = useState<{ category: ResourceCategory, oldName: string, newName: string } | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [newFolderName, setNewFolderName] = useState("");
    const [parentFolderName, setParentFolderName] = useState("__root__");
    const [selectedCategory, setSelectedCategory] = useState<ViewCategory>("lecture");
    const [createResourceCategory, setCreateResourceCategory] = useState<ResourceCategory>("lecture_c");
    const [resourceForm, setResourceForm] = useState<ResourceForm>(initialResourceForm);

    const resetResourceForm = () => setResourceForm(initialResourceForm);

    const handleEditResource = (resource: Resource) => {
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
                    name: renamingFolder.newName.trim(),
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

    const handleDeleteFolder = async (category: ResourceCategory, folderName: string, folderId?: number) => {
        if (!confirm(`Delete folder "${folderName}"? All files will be moved to Uncategorized.`)) {
            return;
        }

        try {
            let folderIdToDelete = folderId;

            if (!folderIdToDelete) {
                const folderInDb = folders?.find(f => f.category === category && f.name === folderName);
                folderIdToDelete = folderInDb?.id;
            }

            const resourcesToMove = resources?.filter(r => r.category === category && r.subcategory === folderName) || [];

            for (const resource of resourcesToMove) {
                await updateResource.mutateAsync({
                    id: resource.id,
                    subcategory: undefined,
                });
            }

            if (folderIdToDelete) {
                await deleteFolder.mutateAsync({ id: folderIdToDelete });
            }

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

    // Build folder tree structure
    const getFolderTree = (category: ViewCategory) => {
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

        const folderById = new Map<number, FolderNode>();
        const rootFolders: FolderNode[] = [];

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

        categoryFolders.forEach(folder => {
            const node = folderById.get(folder.id)!;
            if (folder.parentId && folderById.has(folder.parentId)) {
                const parent = folderById.get(folder.parentId)!;
                parent.children.push(node);
                node.depth = parent.depth + 1;
                node.path = `${parent.path}/${folder.name}`;
            } else {
                rootFolders.push(node);
            }
        });

        categoryResources.forEach(resource => {
            const folderName = resource.subcategory;
            if (folderName) {
                const folder = Array.from(folderById.values()).find(f => f.name === folderName);
                if (folder) {
                    folder.items.push(resource);
                } else {
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

    return (
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
                        <Button
                            onClick={() => { setParentFolderName("__root__"); setNewFolderName(""); setShowCreateFolderDialog(true); }}
                            className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
                        >
                            <FolderOpen className="h-4 w-4 mr-2" />New Folder
                        </Button>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {VIEW_CATEGORIES.map(cat => (
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
                                        {depth > 0 && (<div className="text-white/20 mr-1">↳</div>)}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${depth > 0 ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                                            <FolderOpen className={`w-4 h-4 ${depth > 0 ? 'text-blue-400' : 'text-purple-400'}`} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="text-white font-medium text-sm">
                                                {folder.name === "Uncategorized" ? "📄 " + folder.name : (depth > 0 ? "📂 " : "📁 ") + folder.name}
                                            </h3>
                                            <p className="text-white/30 text-xs">{folder.items.length} files{(folder as any).children?.length > 0 ? `, ${(folder as any).children.length} subfolders` : ''}</p>
                                        </div>
                                        {isExpanded ? (<ChevronDown className="w-4 h-4 text-white/50" />) : (<ChevronRight className="w-4 h-4 text-white/30" />)}
                                    </button>
                                    {folder.name !== "Uncategorized" && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); setParentFolderName(folder.name); setNewFolderName(""); setShowCreateFolderDialog(true); }}
                                                className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                                title="Add Subfolder"
                                            >
                                                <FolderPlus className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); handleRenameFolder(selectedCategory as ResourceCategory, folder.name); }}
                                                className="h-7 w-7 p-0 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                                title="Rename"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteFolder(selectedCategory as ResourceCategory, folder.name, (folder as any).id); }}
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
                                        {folder.items.map((resource: any) => (
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

            {/* Add Resource Button */}
            <div className="p-4 border-t border-white/5">
                <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
                    <DialogTrigger asChild>
                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl">
                            <Plus className="h-4 w-4 mr-2" />Add Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111] border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-light">New Resource</DialogTitle>
                            <DialogDescription className="text-white/50">Add a new resource (video, PDF, or PPT file)</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-5 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-white/70">Title *</Label>
                                    <Input value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white" />
                                </div>
                                <div>
                                    <Label className="text-white/70">Category *</Label>
                                    <Select value={resourceForm.category} onValueChange={(v: ResourceCategory) => setResourceForm({ ...resourceForm, category: v })}>
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

                            <div>
                                <Label className="text-white/70">Description</Label>
                                <Textarea value={resourceForm.description} onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })} rows={2} className="mt-1.5 bg-white/5 border-white/10 text-white" />
                            </div>

                            {/* File Upload */}
                            <div>
                                <Label className="text-white/70">File (up to 2GB)</Label>
                                <div className="mt-1.5 border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-emerald-400/50 transition-colors">
                                    {resourceForm.fileUrl ? (
                                        <div className="flex items-center justify-center gap-3">
                                            {getFileTypeIcon(resourceForm.mimeType, resourceForm.fileName)}
                                            <div className="text-left">
                                                <p className="text-white text-sm truncate max-w-[200px]">{resourceForm.fileName}</p>
                                                <p className="text-white/40 text-xs">{formatFileSize(resourceForm.fileSize)}</p>
                                            </div>
                                            <button onClick={() => setResourceForm({ ...resourceForm, fileUrl: "", fileKey: "", fileName: "", fileSize: 0, mimeType: "" })} className="p-1 bg-white/10 rounded-full hover:bg-white/20">
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Presentation className="w-6 h-6 text-orange-400" />
                                                <Video className="w-6 h-6 text-purple-400" />
                                                <FileText className="w-6 h-6 text-red-400" />
                                            </div>
                                            <span className="text-white/50 text-sm">Click to upload</span>
                                            <p className="text-emerald-400 text-xs mt-1 font-medium">✨ Up to 2GB supported!</p>
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

                            {uploading && (
                                <div className="space-y-2">
                                    <Progress value={uploadProgress} className="h-2" />
                                    <p className="text-sm text-white/50 text-center">{uploadProgress < 95 ? `Uploading... ${uploadProgress}%` : 'Finalizing...'}</p>
                                </div>
                            )}

                            <Button onClick={() => createResource.mutate(resourceForm)} disabled={!resourceForm.title || !resourceForm.fileUrl || uploading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl">
                                {createResource.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Add Resource
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit Resource Dialog */}
            {editingResource && (
                <Dialog open={showEditResourceDialog} onOpenChange={setShowEditResourceDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111] border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-light">Edit Resource</DialogTitle>
                            <DialogDescription className="text-white/50">Update resource details</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-5 py-4">
                            <div>
                                <Label className="text-white/70">Title *</Label>
                                <Input
                                    value={editingResource.title}
                                    onChange={e => setEditingResource({ ...editingResource, title: e.target.value })}
                                    className="mt-1.5 bg-white/5 border-white/10 text-white"
                                />
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
                                            description: editingResource.description ?? undefined,
                                            category: editingResource.category,
                                            subcategory: editingResource.subcategory ?? undefined,
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
                                    onClick={() => { setShowEditResourceDialog(false); setEditingResource(null); }}
                                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Create Folder Dialog */}
            <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
                <DialogContent className="max-w-md bg-[#111] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-light">Create New Folder</DialogTitle>
                        <DialogDescription className="text-white/50">
                            Create a folder to organize your files
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label className="text-white/70">Category *</Label>
                            <Select value={createResourceCategory} onValueChange={(v: ResourceCategory) => setCreateResourceCategory(v)}>
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

                        <div>
                            <Label className="text-white/70">Folder Name *</Label>
                            <Input
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                placeholder="e.g., Chapter1"
                                className="mt-1.5 bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => {
                                    if (!newFolderName.trim()) {
                                        toast.error("Please enter a folder name");
                                        return;
                                    }
                                    let parentId: number | undefined = undefined;
                                    if (parentFolderName !== '__root__') {
                                        const parentFolder = folders?.find(f => f.name === parentFolderName && f.category === createResourceCategory);
                                        if (parentFolder) parentId = parentFolder.id;
                                    }
                                    createFolder.mutate({
                                        name: newFolderName.trim(),
                                        category: createResourceCategory,
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
                                onClick={() => { setShowCreateFolderDialog(false); setNewFolderName(""); setParentFolderName("__root__"); }}
                                className="border-white/20 bg-transparent text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rename Folder Dialog */}
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
                                onClick={() => { setShowRenameFolderDialog(false); setRenamingFolder(null); }}
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
