import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, Lock, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
    const [, setLocation] = useLocation();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const login = trpc.members.login.useMutation({
        onSuccess: (data) => {
            toast.success(`${data.member.name}님, 환영합니다!`);
            // Store member info and token in localStorage
            localStorage.setItem("member", JSON.stringify(data.member));
            localStorage.setItem("memberToken", data.token);
            setLocation("/");
        },
        onError: (e) => toast.error(e.message),
    });

    const handleLogin = () => {
        if (!phone || !password) {
            toast.error("전화번호와 비밀번호를 입력해주세요");
            return;
        }
        login.mutate({ phone, password });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-4">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">Welcome Back</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">로그인</h1>
                    <p className="text-white/60">계정에 로그인하세요</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
                    <div>
                        <Label className="text-white/70">핸드폰 번호</Label>
                        <div className="mt-1.5 relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                                placeholder="01012345678"
                                className="pl-10 bg-white/5 border-white/10 text-white"
                                maxLength={11}
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-white/70">비밀번호</Label>
                        <div className="mt-1.5 relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호 입력"
                                className="pl-10 bg-white/5 border-white/10 text-white"
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleLogin}
                        disabled={login.isPending}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-6"
                    >
                        {login.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        로그인
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>

                {/* Footer */}
                <p className="text-center text-white/40 mt-6">
                    계정이 없으신가요?{" "}
                    <Link href="/register" className="text-blue-400 hover:underline">
                        회원가입
                    </Link>
                </p>

                {/* Student Info */}
                <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <p className="text-amber-400 text-sm text-center">
                        💡 <strong>코딩쏙학원</strong> 학생만 수업자료를 다운로드할 수 있습니다.<br />
                        회원가입 시 학원명을 입력해주세요!
                    </p>
                </div>
            </div>
        </div>
    );
}
