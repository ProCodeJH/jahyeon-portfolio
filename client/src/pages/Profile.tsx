import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/layout/Navigation";
import { Loader2, User, School, Phone, LogOut, CheckCircle, XCircle, Save } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
    const [, setLocation] = useLocation();
    const [member, setMember] = useState<{
        id: number;
        name: string;
        isStudent: boolean;
        academyName?: string;
    } | null>(null);
    const [accessCode, setAccessCode] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Load member from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("member");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setMember(parsed);
                setAccessCode(""); // Don't pre-fill access code
            } catch {
                setLocation("/login");
            }
        } else {
            setLocation("/login");
        }
    }, [setLocation]);

    const updateProfile = trpc.members.updateProfile.useMutation({
        onSuccess: (data) => {
            if (member) {
                const updated = { ...member, isStudent: data.isStudent ?? false };
                setMember(updated);
                localStorage.setItem("member", JSON.stringify(updated));
            }
            toast.success(data.message);
            setIsSaving(false);
        },
        onError: (e) => {
            toast.error(e.message);
            setIsSaving(false);
        },
    });

    const handleSave = () => {
        if (!member) return;
        setIsSaving(true);
        updateProfile.mutate({ memberId: member.id, academyName: accessCode });
    };

    const handleLogout = () => {
        localStorage.removeItem("member");
        localStorage.removeItem("memberToken");
        toast.success("로그아웃되었습니다");
        setLocation("/");
    };

    if (!member) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <Navigation />

            <main className="relative z-10 pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <User className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold">{member.name}</h1>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            {member.isStudent ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    코딩쏙학원 학생
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 text-sm">
                                    <XCircle className="w-4 h-4" />
                                    일반 회원
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
                        <h2 className="text-xl font-semibold text-white">프로필 설정</h2>

                        {/* Access Code */}
                        <div className="space-y-3">
                            <Label className="text-white/70 flex items-center gap-2">
                                <School className="w-4 h-4" />
                                수업자료 페이지 접근 코드
                            </Label>
                            <Input
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                placeholder="선생님께 받은 코드 입력"
                                className="bg-white/5 border-white/10 text-white"
                            />

                            {/* Help text */}
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                <p className="text-amber-400 text-sm">
                                    🔐 선생님께 받은 <strong>접근 코드</strong>를 입력하시면 강의 학생으로 인증되어 수업자료를 다운로드할 수 있습니다.
                                </p>
                            </div>

                            {/* Status */}
                            {member.isStudent && (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                    <p className="text-emerald-400 text-sm">
                                        ✅ 이미 학생으로 인증되어 있습니다!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Save Button */}
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 rounded-xl"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            저장하기
                        </Button>
                    </div>

                    {/* Logout */}
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full mt-6 border-white/20 text-white hover:bg-white/10 py-6 rounded-xl"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                    </Button>
                </div>
            </main>
        </div>
    );
}
