/**
 * types/admin.ts
 * Admin 관련 타입 정의
 * any 타입 제거를 위한 엄격한 타입 시스템
 */

// ============================================
// 🔧 프로젝트 타입
// ============================================
export type ProjectCategory = "c_lang" | "arduino" | "python" | "embedded" | "iot";

export interface Project {
    id: number;
    title: string;
    description: string;
    technologies: string;
    category: ProjectCategory;
    imageUrl?: string | null;
    imageKey?: string | null;
    videoUrl?: string | null;
    videoKey?: string | null;
    thumbnailUrl?: string | null;
    thumbnailKey?: string | null;
    projectUrl?: string | null;
    githubUrl?: string | null;
    featured: number;
    displayOrder: number;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectForm {
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

// ============================================
// 🔧 자격증 타입
// ============================================
export interface Certification {
    id: number;
    title: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string | null;
    credentialId?: string | null;
    credentialUrl?: string | null;
    imageUrl?: string | null;
    imageKey?: string | null;
    description?: string | null;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CertForm {
    title: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    credentialId: string;
    credentialUrl: string;
    imageUrl: string;
    imageKey: string;
    description: string;
}

// ============================================
// 🔧 리소스 타입
// ============================================
export type ResourceCategory =
    | "presentation"
    | "daily_life"
    | "lecture_c"
    | "lecture_arduino"
    | "lecture_python"
    | "lecture_materials"
    | "arduino_projects"
    | "c_projects"
    | "python_projects";

export type ViewCategory = "lecture" | "daily_life";

export interface Resource {
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

export interface ResourceForm {
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

// ============================================
// 🔧 폴더 타입
// ============================================
export interface Folder {
    id: number;
    name: string;
    category: string;
    parentId?: number | null;
    description?: string | null;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface FolderNode {
    id?: number;
    name: string;
    path: string;
    items: Resource[];
    children: FolderNode[];
    parentId?: number | null;
    depth: number;
}

// ============================================
// 🔧 분석 타입
// ============================================
export interface AdminStats {
    todayViews: number;
    uniqueVisitors: number;
    totalDownloads: number;
}

// ============================================
// 🔧 설정 타입
// ============================================
export interface Setting {
    id: number;
    key: string;
    value?: string | null;
    description?: string | null;
    updatedAt: Date;
}

// ============================================
// 🔧 업로드 Props 타입
// ============================================
export interface FileUploadProps {
    handleFileUpload: (
        file: File,
        onComplete: (url: string, key: string, thumbUrl?: string, thumbKey?: string) => void
    ) => Promise<void>;
    uploading: boolean;
    uploadProgress: number;
}

// ============================================
// 🔧 상수
// ============================================
export const LECTURE_CATEGORIES: ResourceCategory[] = [
    "lecture_c",
    "lecture_arduino",
    "lecture_python",
    "presentation",
    "lecture_materials"
];

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string; color: string }[] = [
    { value: "c_lang", label: "C/C++", color: "#3B82F6" },
    { value: "arduino", label: "Arduino", color: "#10B981" },
    { value: "python", label: "Python", color: "#F59E0B" },
    { value: "embedded", label: "Embedded", color: "#8B5CF6" },
    { value: "iot", label: "IoT", color: "#06B6D4" },
];

export const VIEW_CATEGORIES: { value: ViewCategory; label: string; color: string }[] = [
    { value: "lecture", label: "📚 수업자료", color: "#3B82F6" },
    { value: "daily_life", label: "📹 데일리영상", color: "#EC4899" },
];

export const RESOURCE_CATEGORIES: { value: ResourceCategory; label: string; color: string; group: string }[] = [
    { value: "presentation", label: "📚 수업자료", color: "#3B82F6", group: "lecture" },
    { value: "daily_life", label: "📹 데일리영상", color: "#EC4899", group: "daily" },
];

export const ACCEPTED_FILE_TYPES = {
    image: ".jpg,.jpeg,.png,.gif,.webp",
    video: ".mp4,.webm,.mov",
    document: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.html,.htm",
    all: ".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.c,.cpp,.py,.ino,.html,.htm,.js,.css,.ts,.tsx,.json"
};

export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
