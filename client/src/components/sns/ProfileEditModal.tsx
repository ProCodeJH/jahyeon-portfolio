import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
    username?: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    website?: string;
    location?: string;
}

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberId: number;
    initialData?: ProfileData;
    onSuccess?: () => void;
}

export function ProfileEditModal({ isOpen, onClose, memberId, initialData, onSuccess }: ProfileEditModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ProfileData>({
        displayName: "",
        username: "",
        bio: "",
        website: "",
        location: "",
        ...initialData,
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const input = encodeURIComponent(JSON.stringify({
                memberId,
                ...formData,
            }));
            const res = await fetch(`/api/trpc/sns.profile.update?input=${input}`);
            const data = await res.json();
            if (data.result?.data?.success) {
                toast.success("프로필이 업데이트되었습니다!");
                onSuccess?.();
                onClose();
            }
        } catch (e) {
            toast.error("프로필 업데이트 실패");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = (reader.result as string).split(",")[1];
                const input = encodeURIComponent(JSON.stringify({
                    memberId,
                    fileName: file.name,
                    fileContent: base64,
                    contentType: file.type,
                }));
                const res = await fetch(`/api/trpc/sns.profile.uploadAvatar?input=${input}`);
                const data = await res.json();
                if (data.result?.data?.url) {
                    setFormData(prev => ({ ...prev, avatarUrl: data.result.data.url }));
                    toast.success("아바타가 업로드되었습니다!");
                }
            };
            reader.readAsDataURL(file);
        } catch (e) {
            toast.error("아바타 업로드 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-midnight-card border-white/10 text-frost max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">프로필 수정</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Avatar */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={formData.avatarUrl} />
                                <AvatarFallback className="bg-electric/20 text-electric text-2xl">
                                    {formData.displayName?.charAt(0) || "?"}
                                </AvatarFallback>
                            </Avatar>
                            <label className="absolute bottom-0 right-0 p-2 bg-electric rounded-full cursor-pointer hover:bg-electric/80">
                                <Camera className="w-4 h-4 text-midnight" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </label>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm text-frost-muted mb-1 block">이름</label>
                            <Input
                                value={formData.displayName || ""}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                className="bg-white/5 border-white/10 text-frost"
                                placeholder="표시될 이름"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-frost-muted mb-1 block">사용자명</label>
                            <Input
                                value={formData.username || ""}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="bg-white/5 border-white/10 text-frost"
                                placeholder="@username"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-frost-muted mb-1 block">소개</label>
                            <Textarea
                                value={formData.bio || ""}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="bg-white/5 border-white/10 text-frost resize-none"
                                placeholder="자기소개를 작성하세요"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-frost-muted mb-1 block">웹사이트</label>
                            <Input
                                value={formData.website || ""}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="bg-white/5 border-white/10 text-frost"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="text-sm text-frost-muted mb-1 block">위치</label>
                            <Input
                                value={formData.location || ""}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="bg-white/5 border-white/10 text-frost"
                                placeholder="서울, 대한민국"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="border-white/10 text-frost-muted">
                        취소
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-electric text-midnight font-bold">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "저장"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
