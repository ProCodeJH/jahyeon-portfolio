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
import { Loader2, Plus, Trash2, Eye, Heart, BarChart3, FileText, LogOut, ImageIcon, Video, X, FolderOpen, Award, Upload, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

type ProjectCategory = "c_lang" | "arduino" | "python";
type ResourceCategory = "daily_life" | "lecture_c" | "lecture_arduino" | "lecture_python";

const PROJECT_CATEGORIES = [
  { value: "c_lang" as const, label: "C언어", color: "#3B82F6" },
  { value: "arduino" as const, label: "아두이노", color: "#10B981" },
  { value: "python" as const, label: "파이썬", color: "#F59E0B" },
];

const RESOURCE_CATEGORIES = [
  { value: "daily_life" as const, label: "일상생활", color: "#EC4899" },
  { value: "lecture_c" as const, label: "수업자료 - C언어", color: "#3B82F6" },
  { value: "lecture_arduino" as const, label: "수업자료 - 아두이노", color: "#10B981" },
  { value: "lecture_python" as const, label: "수업자료 - 파이썬", color: "#F59E0B" },
];

export default function Admin() {
  const { isAuthenticated, loading, logout } = useAuth();
  const utils = trpc.useUtils();

  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();
  const { data: certifications, isLoading: certsLoading } = trpc.certifications.list.useQuery();
  const { data: resources, isLoading: resourcesLoading } = trpc.resources.list.useQuery();
  const { data: analytics } = trpc.analytics.adminStats.useQuery(undefined, { enabled: isAuthenticated });

  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => { utils.projects.list.invalidate(); toast.success("프로젝트가 생성되었습니다"); setShowProjectDialog(false); resetProjectForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => { utils.projects.list.invalidate(); toast.success("삭제되었습니다"); },
  });
  const createCertification = trpc.certifications.create.useMutation({
    onSuccess: () => { utils.certifications.list.invalidate(); toast.success("자격증이 등록되었습니다"); setShowCertDialog(false); resetCertForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteCertification = trpc.certifications.delete.useMutation({
    onSuccess: () => { utils.certifications.list.invalidate(); toast.success("삭제되었습니다"); },
  });
  const createResource = trpc.resources.create.useMutation({
    onSuccess: () => { utils.resources.list.invalidate(); toast.success("리소스가 생성되었습니다"); setShowResourceDialog(false); resetResourceForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteResource = trpc.resources.delete.useMutation({
    onSuccess: () => { utils.resources.list.invalidate(); toast.success("삭제되었습니다"); },
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
    title: "", description: "", category: "daily_life" as ResourceCategory, subcategory: "" as string,
    fileUrl: "", fileKey: "", fileName: "", fileSize: 0, mimeType: "", thumbnailUrl: "", thumbnailKey: "",
  });

  const resetProjectForm = () => setProjectForm({ title: "", description: "", technologies: "", category: "c_lang", imageUrl: "", imageKey: "", videoUrl: "", videoKey: "", thumbnailUrl: "", thumbnailKey: "", projectUrl: "", githubUrl: "" });
  const resetCertForm = () => setCertForm({ title: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "", imageUrl: "", imageKey: "", description: "" });
  const resetResourceForm = () => setResourceForm({ title: "", description: "", category: "daily_life", subcategory: "", fileUrl: "", fileKey: "", fileName: "", fileSize: 0, mimeType: "", thumbnailUrl: "", thumbnailKey: "" });

  const handleFileUpload = useCallback(async (file: File, onComplete: (url: string, key: string, thumbUrl?: string, thumbKey?: string) => void) => {
    // Vercel 서버리스 제한으로 10MB까지만 지원
    if (file.size > 10 * 1024 * 1024) { 
      toast.error("10MB 이하만 업로드 가능합니다 (서버 제한)"); 
      return; 
    }
    setUploading(true); setUploadProgress(0);
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(",")[1]);
        r.onerror = () => rej();
        r.readAsDataURL(file);
      });
      
      setUploadProgress(50);
      
      const result = await uploadFile.mutateAsync({ 
        fileName: file.name, 
        fileContent: base64, 
        contentType: file.type || "application/octet-stream" 
      });
      
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
      toast.success("업로드가 완료되었습니다");
    } catch (err) { 
      console.error(err);
      toast.error("업로드에 실패했습니다"); 
    }
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인 필요</h1>
        <p className="text-gray-500 mb-6">관리자 패널에 접근하려면 로그인하세요</p>
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3">
          <a href={getLoginUrl()}>로그인</a>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <span className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                  Gu Jahyeon
                </span>
              </Link>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                  <Eye className="h-4 w-4 mr-2" />
                  사이트 보기
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => logout()} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">전체 조회수</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.totalViews?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">오늘 조회수</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.todayViews?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">고유 방문자</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.uniqueVisitors?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">총 컨텐츠</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((projects?.length || 0) + (certifications?.length || 0) + (resources?.length || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
            <TabsTrigger value="projects" className="rounded-lg px-6 py-2.5 font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FolderOpen className="h-4 w-4 mr-2" />
              프로젝트 ({projects?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="certifications" className="rounded-lg px-6 py-2.5 font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Award className="h-4 w-4 mr-2" />
              자격증 ({certifications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="resources" className="rounded-lg px-6 py-2.5 font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Upload className="h-4 w-4 mr-2" />
              리소스 ({resources?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg px-6 py-2.5 font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              분석
            </TabsTrigger>
          </TabsList>

          {/* PROJECTS TAB */}
          <TabsContent value="projects">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">프로젝트</h2>
                  <p className="text-gray-500 mt-1">C언어, 아두이노, 파이썬 프로젝트 관리</p>
                </div>
                <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                      <Plus className="h-4 w-4 mr-2" />
                      프로젝트 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-gray-900">새 프로젝트</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700 font-medium">제목 *</Label>
                          <Input 
                            value={projectForm.title} 
                            onChange={e => setProjectForm({...projectForm, title: e.target.value})} 
                            className="mt-1.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                            placeholder="프로젝트 제목"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-medium">카테고리 *</Label>
                          <Select value={projectForm.category} onValueChange={(v: ProjectCategory) => setProjectForm({...projectForm, category: v})}>
                            <SelectTrigger className="mt-1.5 border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200">
                              {PROJECT_CATEGORIES.map(c => (
                                <SelectItem key={c.value} value={c.value}>
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
                        <Label className="text-gray-700 font-medium">설명 *</Label>
                        <Textarea 
                          value={projectForm.description} 
                          onChange={e => setProjectForm({...projectForm, description: e.target.value})} 
                          rows={3} 
                          className="mt-1.5 border-gray-300 focus:border-blue-500" 
                          placeholder="프로젝트에 대한 설명을 입력하세요"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-medium">기술 스택 *</Label>
                        <Input 
                          value={projectForm.technologies} 
                          onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} 
                          placeholder="C, Python, Arduino, etc." 
                          className="mt-1.5 border-gray-300" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700 font-medium">프로젝트 URL</Label>
                          <Input 
                            value={projectForm.projectUrl} 
                            onChange={e => setProjectForm({...projectForm, projectUrl: e.target.value})} 
                            className="mt-1.5 border-gray-300" 
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-medium">GitHub URL</Label>
                          <Input 
                            value={projectForm.githubUrl} 
                            onChange={e => setProjectForm({...projectForm, githubUrl: e.target.value})} 
                            className="mt-1.5 border-gray-300" 
                            placeholder="https://github.com/..."
                          />
                        </div>
                      </div>
                      
                      {/* Image Upload */}
                      <div>
                        <Label className="text-gray-700 font-medium">썸네일 이미지</Label>
                        <div className="mt-2">
                          {projectForm.imageUrl ? (
                            <div className="relative inline-block">
                              <img src={projectForm.imageUrl} alt="Preview" className="w-40 h-28 object-cover rounded-xl border border-gray-200" />
                              <button
                                onClick={() => setProjectForm({...projectForm, imageUrl: "", imageKey: ""})}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-500">이미지를 업로드하세요</span>
                              <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF (최대 10MB)</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={e => { 
                                  const f = e.target.files?.[0]; 
                                  if(f) handleFileUpload(f, (url, key) => setProjectForm({...projectForm, imageUrl: url, imageKey: key})); 
                                }} 
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Video Upload */}
                      <div>
                        <Label className="text-gray-700 font-medium">동영상 (최대 10MB)</Label>
                        <div className="mt-2">
                          {projectForm.videoUrl ? (
                            <div className="relative inline-block">
                              <video src={projectForm.videoUrl} controls className="w-64 rounded-xl border border-gray-200" />
                              <button
                                onClick={() => setProjectForm({...projectForm, videoUrl: "", videoKey: "", thumbnailUrl: "", thumbnailKey: ""})}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                              <Video className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-500">동영상을 업로드하세요</span>
                              <span className="text-xs text-gray-400 mt-1">MP4, MOV, AVI (최대 10MB)</span>
                              <input 
                                type="file" 
                                accept="video/*" 
                                className="hidden" 
                                onChange={e => { 
                                  const f = e.target.files?.[0]; 
                                  if(f) handleFileUpload(f, (url, key, thu, thk) => setProjectForm({...projectForm, videoUrl: url, videoKey: key, thumbnailUrl: thu||"", thumbnailKey: thk||""})); 
                                }} 
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {uploading && (
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-blue-700 font-medium">업로드 중...</span>
                            <span className="text-blue-600">{Math.round(uploadProgress)}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2 bg-blue-100" />
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Button 
                          onClick={() => createProject.mutate({...projectForm, featured: 0, displayOrder: 0})} 
                          disabled={!projectForm.title || !projectForm.description || !projectForm.technologies || createProject.isPending} 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                        >
                          {createProject.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          프로젝트 생성
                        </Button>
                        <Button variant="outline" onClick={() => setShowProjectDialog(false)} className="px-6 border-gray-300">
                          취소
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="p-6">
                {projectsLoading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-gray-500 mt-2">로딩 중...</p>
                  </div>
                ) : !projects?.length ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FolderOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">프로젝트가 없습니다</h3>
                    <p className="text-gray-500">새 프로젝트를 추가해보세요</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {projects.map(p => (
                      <div key={p.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        {(p.thumbnailUrl || p.imageUrl) ? (
                          <img src={p.thumbnailUrl || p.imageUrl || ""} alt={p.title} className="w-20 h-14 object-cover rounded-lg" />
                        ) : (
                          <div className="w-20 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span 
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: `${PROJECT_CATEGORIES.find(c=>c.value===p.category)?.color}15`,
                                color: PROJECT_CATEGORIES.find(c=>c.value===p.category)?.color 
                              }}
                            >
                              {PROJECT_CATEGORIES.find(c=>c.value===p.category)?.label}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              {p.viewCount}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteProject.mutate({id: p.id})} 
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* CERTIFICATIONS TAB */}
          <TabsContent value="certifications">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">자격증</h2>
                  <p className="text-gray-500 mt-1">취득한 자격증 관리</p>
                </div>
                <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                      <Plus className="h-4 w-4 mr-2" />
                      자격증 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-gray-900">새 자격증</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                      <div>
                        <Label className="text-gray-700 font-medium">자격증명 *</Label>
                        <Input value={certForm.title} onChange={e => setCertForm({...certForm, title: e.target.value})} className="mt-1.5 border-gray-300" placeholder="정보처리기사" />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-medium">발급기관 *</Label>
                        <Input value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="mt-1.5 border-gray-300" placeholder="한국산업인력공단" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700 font-medium">발급일 *</Label>
                          <Input type="date" value={certForm.issueDate} onChange={e => setCertForm({...certForm, issueDate: e.target.value})} className="mt-1.5 border-gray-300" />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-medium">만료일</Label>
                          <Input type="date" value={certForm.expiryDate} onChange={e => setCertForm({...certForm, expiryDate: e.target.value})} className="mt-1.5 border-gray-300" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-700 font-medium">자격증 이미지</Label>
                        <div className="mt-2">
                          {certForm.imageUrl ? (
                            <div className="relative inline-block">
                              <img src={certForm.imageUrl} alt="Certificate" className="w-40 rounded-xl border border-gray-200" />
                              <button onClick={() => setCertForm({...certForm, imageUrl: "", imageKey: ""})} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="h-3 w-3" /></button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-500">이미지 업로드</span>
                              <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) handleFileUpload(f, (url, key) => setCertForm({...certForm, imageUrl: url, imageKey: key})); }} />
                            </label>
                          )}
                        </div>
                      </div>
                      {uploading && <Progress value={uploadProgress} className="h-2" />}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Button onClick={() => createCertification.mutate({...certForm, displayOrder: 0})} disabled={!certForm.title || !certForm.issuer || !certForm.issueDate || createCertification.isPending} className="flex-1 bg-blue-600 hover:bg-blue-700">
                          {createCertification.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          자격증 등록
                        </Button>
                        <Button variant="outline" onClick={() => setShowCertDialog(false)} className="px-6 border-gray-300">취소</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="p-6">
                {certsLoading ? (
                  <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>
                ) : !certifications?.length ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Award className="h-8 w-8 text-gray-400" /></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">자격증이 없습니다</h3>
                    <p className="text-gray-500">새 자격증을 추가해보세요</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {certifications.map(c => (
                      <div key={c.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        {c.imageUrl ? <img src={c.imageUrl} alt={c.title} className="w-16 h-16 object-cover rounded-lg" /> : <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"><Award className="h-6 w-6 text-gray-400" /></div>}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{c.title}</h3>
                          <p className="text-sm text-gray-500">{c.issuer} • {c.issueDate}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteCertification.mutate({id: c.id})} className="text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* RESOURCES TAB */}
          <TabsContent value="resources">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">리소스</h2>
                  <p className="text-gray-500 mt-1">일상생활, 수업자료 관리</p>
                </div>
                <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium"><Plus className="h-4 w-4 mr-2" />리소스 추가</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader><DialogTitle className="text-xl font-bold text-gray-900">새 리소스</DialogTitle></DialogHeader>
                    <div className="space-y-5 py-4">
                      <div>
                        <Label className="text-gray-700 font-medium">제목 *</Label>
                        <Input value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} className="mt-1.5 border-gray-300" placeholder="리소스 제목" />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-medium">카테고리 *</Label>
                        <Select value={resourceForm.category} onValueChange={(v: ResourceCategory) => setResourceForm({...resourceForm, category: v})}>
                          <SelectTrigger className="mt-1.5 border-gray-300"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-white">
                            {RESOURCE_CATEGORIES.map(c => (
                              <SelectItem key={c.value} value={c.value}>
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
                        <Label className="text-gray-700 font-medium">설명</Label>
                        <Textarea value={resourceForm.description} onChange={e => setResourceForm({...resourceForm, description: e.target.value})} rows={2} className="mt-1.5 border-gray-300" placeholder="리소스에 대한 설명" />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-medium">파일 * (최대 10MB)</Label>
                        {resourceForm.fileUrl ? (
                          <div className="mt-2 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="h-5 w-5 text-blue-600" /></div>
                              <div>
                                <p className="font-medium text-gray-900 truncate max-w-[200px]">{resourceForm.fileName}</p>
                                <p className="text-sm text-gray-500">{(resourceForm.fileSize/1024/1024).toFixed(1)} MB</p>
                              </div>
                            </div>
                            <button onClick={() => setResourceForm({...resourceForm, fileUrl: "", fileKey: "", fileName: "", fileSize: 0, mimeType: ""})} className="text-gray-400 hover:text-red-500"><X className="h-5 w-5" /></button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all mt-2">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">파일을 업로드하세요</span>
                            <span className="text-xs text-gray-400 mt-1">모든 파일 형식 지원</span>
                            <input type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) handleFileUpload(f, (url, key, thu, thk) => setResourceForm({...resourceForm, fileUrl: url, fileKey: key, fileName: f.name, fileSize: f.size, mimeType: f.type, thumbnailUrl: thu||"", thumbnailKey: thk||""})); }} />
                          </label>
                        )}
                      </div>
                      {uploading && <div className="bg-blue-50 rounded-xl p-4"><div className="flex justify-between text-sm mb-2"><span className="text-blue-700 font-medium">업로드 중...</span><span className="text-blue-600">{Math.round(uploadProgress)}%</span></div><Progress value={uploadProgress} className="h-2 bg-blue-100" /></div>}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Button onClick={() => createResource.mutate({...resourceForm, displayOrder: 0})} disabled={!resourceForm.title || !resourceForm.fileUrl || createResource.isPending} className="flex-1 bg-blue-600 hover:bg-blue-700">{createResource.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}리소스 생성</Button>
                        <Button variant="outline" onClick={() => setShowResourceDialog(false)} className="px-6 border-gray-300">취소</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="p-6">
                {resourcesLoading ? (
                  <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>
                ) : !resources?.length ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Upload className="h-8 w-8 text-gray-400" /></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">리소스가 없습니다</h3>
                    <p className="text-gray-500">새 리소스를 추가해보세요</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {resources.map(r => (
                      <div key={r.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        {r.thumbnailUrl ? <img src={r.thumbnailUrl} alt={r.title} className="w-16 h-16 object-cover rounded-lg" /> : <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"><FileText className="h-6 w-6 text-gray-400" /></div>}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{r.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${RESOURCE_CATEGORIES.find(c=>c.value===r.category)?.color}15`, color: RESOURCE_CATEGORIES.find(c=>c.value===r.category)?.color }}>{RESOURCE_CATEGORIES.find(c=>c.value===r.category)?.label}</span>
                            <span className="text-sm text-gray-500">{(r.fileSize/1024/1024).toFixed(1)} MB</span>
                            <span className="text-sm text-gray-500 flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{r.likeCount}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteResource.mutate({id: r.id})} className="text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">방문자 분석</h2>
                <p className="text-gray-500 mt-1">사이트 접속 통계</p>
              </div>
              <div className="p-6 space-y-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">페이지별 조회수</h3>
                  <div className="space-y-3">
                    {analytics?.viewsByPage?.map((v: any, i: number) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 w-48 truncate font-mono">{v.path}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3">
                          <div className="bg-blue-500 h-3 rounded-full transition-all" style={{width: `${Math.min(100, (Number(v.count) / Number(analytics?.totalViews || 1)) * 100)}%`}} />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-16 text-right">{v.count}</span>
                      </div>
                    ))}
                    {!analytics?.viewsByPage?.length && <p className="text-gray-500 text-center py-8">아직 데이터가 없습니다</p>}
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
