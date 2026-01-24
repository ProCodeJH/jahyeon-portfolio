/**
 * AdminSettings.tsx
 * 사이트 설정 관리 컴포넌트 (YouTube URL, Access Code, Folder Cleanup)
 * Admin.tsx에서 분리됨
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Video, FolderOpen } from "lucide-react";
import { toast } from "sonner";

// ============================================
// 🔧 YouTubeUrlInput Component
// ============================================
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

// ============================================
// 🔧 AccessCodeInput Component
// ============================================
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

// ============================================
// 🚀 AdminSettings Component
// ============================================
export default function AdminSettings() {
    const utils = trpc.useUtils();

    return (
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
    );
}
