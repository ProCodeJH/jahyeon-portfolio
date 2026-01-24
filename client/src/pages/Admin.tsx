/**
 * Admin.tsx
 * 관리자 패널 메인 레이아웃 + 탭 네비게이션
 * 
 * 리팩토링됨: 모놀리식 1,854줄 → ~250줄
 * 각 섹션은 독립 컴포넌트로 분리됨
 */

import { useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Loader2, Eye, Heart, BarChart3, FileText, LogOut, FolderOpen, Award, Upload, TrendingUp, Video } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

// 분리된 Admin 컴포넌트들
import {
  AdminProjects,
  AdminCertifications,
  AdminResources,
  AdminSettings,
  AdminAnalytics
} from "@/components/admin";

// ============================================
// 🔧 Constants
// ============================================
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB - Enterprise Grade

// 확장자 기반 MIME 타입 매핑
const EXTENSION_MIME_MAP: Record<string, string> = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.c': 'text/x-c',
  '.cpp': 'text/x-c++',
  '.py': 'text/x-python',
  '.js': 'text/javascript',
  '.ts': 'text/typescript',
  '.tsx': 'text/typescript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ino': 'text/plain',
  '.zip': 'application/zip',
  '.rar': 'application/x-rar-compressed',
  '.pdf': 'application/pdf',
};

const getContentType = (file: File): string => {
  if (file.type && file.type !== '') return file.type;
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return EXTENSION_MIME_MAP[ext] || 'application/octet-stream';
};

// ============================================
// 🚀 Admin Component
// ============================================
export default function Admin() {
  const { isAuthenticated, loading, logout } = useAuth();
  const utils = trpc.useUtils();

  // Data queries for stats
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: certifications } = trpc.certifications.list.useQuery();
  const { data: resources } = trpc.resources.list.useQuery();
  const { data: analytics } = trpc.analytics.adminStats.useQuery(undefined, { enabled: isAuthenticated });

  // Upload mutations
  const uploadFile = trpc.upload.file.useMutation();
  const getPresignedUrl = trpc.upload.getPresignedUrl.useMutation();

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ============================================
  // 🚀 Presigned URL 업로드 (대용량 파일 지원)
  // ============================================
  const handleFileUpload = useCallback(async (file: File, onComplete: (url: string, key: string, thumbUrl?: string, thumbKey?: string) => void) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Max ${MAX_FILE_SIZE / 1024 / 1024 / 1024}GB allowed`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Presigned URL 받기
      setUploadProgress(5);
      const contentType = getContentType(file);
      const presigned = await getPresignedUrl.mutateAsync({
        fileName: file.name,
        contentType,
        fileSize: file.size,
      });

      // 2. R2에 직접 업로드 (진행률 추적)
      setUploadProgress(10);
      await uploadToPresignedUrl(presigned.presignedUrl, file, contentType, (progress) => {
        setUploadProgress(10 + Math.round(progress * 85));
      });

      setUploadProgress(100);
      const result = { url: presigned.publicUrl, key: presigned.key };

      // 비디오 썸네일 생성
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

  // Presigned URL로 업로드 (진행률 추적)
  const uploadToPresignedUrl = async (url: string, file: File, contentType: string, onProgress: (progress: number) => void): Promise<void> => {
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
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.send(file);
    });
  };

  // 비디오 썸네일 생성 (개선된 버전)
  const genVideoThumb = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";

      const timeout = setTimeout(() => resolve(null), 10000);

      video.onloadeddata = () => {
        video.currentTime = Math.min(1, video.duration * 0.1);
      };

      video.onseeked = () => {
        clearTimeout(timeout);
        const canvas = document.createElement("canvas");
        canvas.width = Math.min(640, video.videoWidth);
        canvas.height = (canvas.width / video.videoWidth) * video.videoHeight;
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return resolve(null);
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        }, "image/jpeg", 0.85);
      };

      video.onerror = () => {
        clearTimeout(timeout);
        resolve(null);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  // ============================================
  // 🎨 Render
  // ============================================
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

          <TabsContent value="projects">
            <AdminProjects handleFileUpload={handleFileUpload} uploading={uploading} uploadProgress={uploadProgress} />
          </TabsContent>

          <TabsContent value="certifications">
            <AdminCertifications handleFileUpload={handleFileUpload} uploading={uploading} uploadProgress={uploadProgress} />
          </TabsContent>

          <TabsContent value="resources">
            <AdminResources handleFileUpload={handleFileUpload} uploading={uploading} uploadProgress={uploadProgress} />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
