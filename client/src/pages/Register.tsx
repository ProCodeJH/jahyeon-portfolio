import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Phone, Lock, School, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
    const [, setLocation] = useLocation();
    const [step, setStep] = useState<"phone" | "verify" | "info">("phone");
    const [phone, setPhone] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [form, setForm] = useState({
        name: "",
        age: "",
        password: "",
        confirmPassword: "",
        academyName: "",
    });

    const sendSMS = trpc.members.sendSMS.useMutation({
        onSuccess: () => {
            toast.success("인증번호가 발송되었습니다!");
            setStep("verify");
        },
        onError: (e) => toast.error(e.message),
    });

    const verifySMS = trpc.members.verifySMS.useMutation({
        onSuccess: () => {
            toast.success("인증이 완료되었습니다!");
            setStep("info");
        },
        onError: (e) => toast.error(e.message),
    });

    const register = trpc.members.register.useMutation({
        onSuccess: (data) => {
            toast.success("회원가입이 완료되었습니다!");
            // Store member info in localStorage
            localStorage.setItem("member", JSON.stringify(data.member));
            setLocation("/");
        },
        onError: (e) => toast.error(e.message),
    });

    const handleSendSMS = () => {
        if (phone.length < 10) {
            toast.error("올바른 전화번호를 입력해주세요");
            return;
        }
        sendSMS.mutate({ phone });
    };

    const handleVerify = () => {
        if (verificationCode.length !== 6) {
            toast.error("6자리 인증번호를 입력해주세요");
            return;
        }
        verifySMS.mutate({ phone, code: verificationCode });
    };

    const handleRegister = () => {
        if (!form.name || !form.age || !form.password) {
            toast.error("필수 정보를 입력해주세요");
            return;
        }
        if (form.password !== form.confirmPassword) {
            toast.error("비밀번호가 일치하지 않습니다");
            return;
        }
        if (form.password.length < 6) {
            toast.error("비밀번호는 6자 이상이어야 합니다");
            return;
        }
        register.mutate({
            name: form.name,
            age: parseInt(form.age),
            phone,
            password: form.password,
            academyName: form.academyName || undefined,
        });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">Welcome</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">회원가입</h1>
                    <p className="text-white/60">코딩쏙학원 강의 자료에 접근하세요</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {["phone", "verify", "info"].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === s ? "bg-emerald-500 text-black" :
                                    ["phone", "verify", "info"].indexOf(step) > i ? "bg-emerald-500/30 text-emerald-400" :
                                        "bg-white/10 text-white/40"
                                }`}>
                                {["phone", "verify", "info"].indexOf(step) > i ? <CheckCircle className="w-4 h-4" /> : i + 1}
                            </div>
                            {i < 2 && <div className={`w-12 h-0.5 ${["phone", "verify", "info"].indexOf(step) > i ? "bg-emerald-500/50" : "bg-white/10"}`} />}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">

                    {/* Step 1: Phone */}
                    {step === "phone" && (
                        <>
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
                                <p className="text-white/40 text-xs mt-1">'-' 없이 숫자만 입력하세요</p>
                            </div>
                            <Button
                                onClick={handleSendSMS}
                                disabled={sendSMS.isPending || phone.length < 10}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium py-6"
                            >
                                {sendSMS.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                인증번호 발송
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </>
                    )}

                    {/* Step 2: Verify */}
                    {step === "verify" && (
                        <>
                            <div>
                                <Label className="text-white/70">인증번호</Label>
                                <Input
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                                    placeholder="6자리 인증번호"
                                    className="mt-1.5 bg-white/5 border-white/10 text-white text-center text-2xl tracking-widest"
                                    maxLength={6}
                                />
                                <p className="text-white/40 text-xs mt-1 text-center">
                                    {phone}로 발송된 인증번호를 입력하세요
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep("phone")}
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    이전
                                </Button>
                                <Button
                                    onClick={handleVerify}
                                    disabled={verifySMS.isPending || verificationCode.length !== 6}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black"
                                >
                                    {verifySMS.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    확인
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Step 3: Info */}
                    {step === "info" && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-white/70">이름 *</Label>
                                    <div className="mt-1.5 relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                        <Input
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="홍길동"
                                            className="pl-10 bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-white/70">나이 *</Label>
                                    <Input
                                        type="number"
                                        value={form.age}
                                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                                        placeholder="15"
                                        className="mt-1.5 bg-white/5 border-white/10 text-white"
                                        min={5}
                                        max={100}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-white/70">비밀번호 *</Label>
                                <div className="mt-1.5 relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <Input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="6자 이상"
                                        className="pl-10 bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-white/70">비밀번호 확인 *</Label>
                                <Input
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    placeholder="비밀번호 다시 입력"
                                    className="mt-1.5 bg-white/5 border-white/10 text-white"
                                />
                            </div>

                            <div>
                                <Label className="text-white/70 flex items-center gap-2">
                                    <School className="w-4 h-4" />
                                    학원명 (선택)
                                </Label>
                                <Input
                                    value={form.academyName}
                                    onChange={(e) => setForm({ ...form, academyName: e.target.value })}
                                    placeholder="코딩쏙학원"
                                    className="mt-1.5 bg-white/5 border-white/10 text-white"
                                />
                                <p className="text-amber-400/80 text-xs mt-1">
                                    💡 "코딩쏙학원" 입력 시 수업자료 다운로드가 가능합니다
                                </p>
                            </div>

                            <Button
                                onClick={handleRegister}
                                disabled={register.isPending}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium py-6"
                            >
                                {register.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                가입하기
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-white/40 mt-6">
                    이미 계정이 있으신가요?{" "}
                    <Link href="/login" className="text-emerald-400 hover:underline">
                        로그인
                    </Link>
                </p>
            </div>
        </div>
    );
}
