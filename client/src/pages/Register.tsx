import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
    setupRecaptcha,
    sendPhoneVerificationCode,
    verifyPhoneCode,
    sendEmailVerificationLink,
    checkEmailSignInLink,
    completeEmailSignIn,
    getSavedEmailForSignIn,
    clearSavedEmail,
    type ConfirmationResult
} from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Phone, Lock, School, ArrowRight, CheckCircle, Sparkles, AlertCircle, Mail } from "lucide-react";
import { toast } from "sonner";

type AuthMethod = "phone" | "email";

export default function Register() {
    const [location, setLocation] = useLocation();
    const [authMethod, setAuthMethod] = useState<AuthMethod>("phone");
    const [step, setStep] = useState<"method" | "input" | "verify" | "info">("method");

    // Phone auth state
    const [phone, setPhone] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // Email auth state
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);

    const [form, setForm] = useState({
        name: "",
        age: "",
        password: "",
        confirmPassword: "",
        academyName: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [firebaseError, setFirebaseError] = useState<string | null>(null);
    const recaptchaContainerRef = useRef<HTMLDivElement>(null);

    const register = trpc.members.register.useMutation({
        onSuccess: (data) => {
            toast.success("회원가입이 완료되었습니다!");
            localStorage.setItem("member", JSON.stringify(data.member));
            setLocation("/");
        },
        onError: (e) => toast.error(e.message),
    });

    // Check for email verification callback
    useEffect(() => {
        if (checkEmailSignInLink()) {
            const savedEmail = getSavedEmailForSignIn();
            if (savedEmail) {
                setEmail(savedEmail);
                setIsLoading(true);
                completeEmailSignIn(savedEmail)
                    .then(() => {
                        clearSavedEmail();
                        toast.success("이메일 인증이 완료되었습니다!");
                        setAuthMethod("email");
                        setStep("info");
                    })
                    .catch((error) => {
                        console.error("Email sign-in error:", error);
                        toast.error("이메일 인증에 실패했습니다");
                    })
                    .finally(() => setIsLoading(false));
            }
        }
    }, [location]);

    // Send SMS via Firebase
    const handleSendPhoneSMS = async () => {
        if (phone.length < 10) {
            toast.error("올바른 전화번호를 입력해주세요");
            return;
        }

        setIsLoading(true);
        setFirebaseError(null);

        try {
            const recaptcha = setupRecaptcha("send-sms-button");
            await recaptcha.render();

            const result = await sendPhoneVerificationCode(phone, recaptcha);
            setConfirmationResult(result);
            toast.success("인증번호가 발송되었습니다!");
            setStep("verify");
        } catch (error: any) {
            console.error("Firebase SMS error:", error);

            if (error.code === "auth/invalid-phone-number") {
                setFirebaseError("올바른 전화번호 형식이 아닙니다");
            } else if (error.code === "auth/too-many-requests") {
                setFirebaseError("너무 많은 요청입니다. 잠시 후 다시 시도해주세요");
            } else if (error.code === "auth/quota-exceeded") {
                setFirebaseError("일일 한도를 초과했습니다");
            } else {
                setFirebaseError("SMS 발송에 실패했습니다. 이메일 인증을 시도해주세요");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Send Email verification
    const handleSendEmail = async () => {
        if (!email || !email.includes("@")) {
            toast.error("올바른 이메일을 입력해주세요");
            return;
        }

        setIsLoading(true);
        setFirebaseError(null);

        try {
            await sendEmailVerificationLink(email);
            setEmailSent(true);
            toast.success("인증 이메일이 발송되었습니다! 이메일을 확인해주세요.");
        } catch (error: any) {
            console.error("Email verification error:", error);
            setFirebaseError("이메일 발송에 실패했습니다. 다시 시도해주세요");
        } finally {
            setIsLoading(false);
        }
    };

    // Verify phone code
    const handleVerifyPhone = async () => {
        if (verificationCode.length !== 6) {
            toast.error("6자리 인증번호를 입력해주세요");
            return;
        }

        if (!confirmationResult) {
            toast.error("인증 세션이 만료되었습니다. 다시 시도해주세요");
            setStep("input");
            return;
        }

        setIsLoading(true);

        try {
            await verifyPhoneCode(confirmationResult, verificationCode);
            toast.success("인증이 완료되었습니다!");
            setStep("info");
        } catch (error: any) {
            console.error("Verification error:", error);

            if (error.code === "auth/invalid-verification-code") {
                toast.error("인증번호가 올바르지 않습니다");
            } else if (error.code === "auth/code-expired") {
                toast.error("인증번호가 만료되었습니다. 다시 요청해주세요");
                setStep("input");
            } else {
                toast.error("인증 실패. 다시 시도해주세요");
            }
        } finally {
            setIsLoading(false);
        }
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
            phone: authMethod === "phone" ? phone : email, // Use email as identifier if email auth
            password: form.password,
            academyName: form.academyName || undefined,
        });
    };

    const getStepNumber = () => {
        switch (step) {
            case "method": return 0;
            case "input": return 1;
            case "verify": return 2;
            case "info": return 3;
            default: return 0;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Hidden reCAPTCHA container */}
            <div id="recaptcha-container" ref={recaptchaContainerRef} />

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
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${getStepNumber() === i ? "bg-emerald-500 text-black" :
                                getStepNumber() > i ? "bg-emerald-500/30 text-emerald-400" :
                                    "bg-white/10 text-white/40"
                                }`}>
                                {getStepNumber() > i ? <CheckCircle className="w-4 h-4" /> : i + 1}
                            </div>
                            {i < 3 && <div className={`w-8 h-0.5 ${getStepNumber() > i ? "bg-emerald-500/50" : "bg-white/10"}`} />}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">

                    {/* Firebase Error Alert */}
                    {firebaseError && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-400 text-sm">{firebaseError}</p>
                        </div>
                    )}

                    {/* Step 0: Method Selection */}
                    {step === "method" && (
                        <>
                            <div className="space-y-3">
                                <p className="text-white/70 text-sm text-center mb-4">인증 방법을 선택하세요</p>

                                <button
                                    onClick={() => { setAuthMethod("phone"); setStep("input"); }}
                                    className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${authMethod === "phone"
                                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Phone className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-white">📱 전화번호 인증</p>
                                        <p className="text-xs text-white/50">SMS로 인증번호를 받습니다</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => { setAuthMethod("email"); setStep("input"); }}
                                    className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${authMethod === "email"
                                        ? "bg-purple-500/10 border-purple-500/50 text-purple-400"
                                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-white">📧 이메일 인증</p>
                                        <p className="text-xs text-white/50">이메일 링크로 인증합니다</p>
                                    </div>
                                </button>
                            </div>


                        </>
                    )}

                    {/* Step 1: Phone Input */}
                    {step === "input" && authMethod === "phone" && (
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
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep("method")}
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    이전
                                </Button>
                                <Button
                                    id="send-sms-button"
                                    onClick={handleSendPhoneSMS}
                                    disabled={isLoading || phone.length < 10}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-medium"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    인증번호 발송
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Step 1: Email Input */}
                    {step === "input" && authMethod === "email" && !emailSent && (
                        <>
                            <div>
                                <Label className="text-white/70">이메일 주소</Label>
                                <div className="mt-1.5 relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@gmail.com"
                                        className="pl-10 bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep("method")}
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    이전
                                </Button>
                                <Button
                                    onClick={handleSendEmail}
                                    disabled={isLoading || !email.includes("@")}
                                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-medium"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    인증 메일 발송
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Email Sent Confirmation */}
                    {step === "input" && authMethod === "email" && emailSent && (
                        <>
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <Mail className="w-8 h-8 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">이메일을 확인하세요!</h3>
                                <p className="text-white/60 text-sm">
                                    <strong className="text-purple-400">{email}</strong>로<br />
                                    인증 링크를 발송했습니다.
                                </p>
                                <p className="text-white/40 text-xs mt-4">
                                    이메일의 링크를 클릭하면 자동으로 인증됩니다.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => { setEmailSent(false); setStep("method"); }}
                                className="w-full border-white/20 text-white hover:bg-white/10"
                            >
                                다른 방법으로 인증
                            </Button>
                        </>
                    )}

                    {/* Step 2: Phone Verify */}
                    {step === "verify" && authMethod === "phone" && (
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
                                    onClick={() => {
                                        setStep("input");
                                        setConfirmationResult(null);
                                        setVerificationCode("");
                                    }}
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    이전
                                </Button>
                                <Button
                                    onClick={handleVerifyPhone}
                                    disabled={isLoading || verificationCode.length !== 6}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    확인
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Step 3: Info */}
                    {step === "info" && (
                        <>
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 mb-4">
                                <p className="text-emerald-400 text-sm text-center">
                                    ✅ {authMethod === "phone" ? "전화번호" : "이메일"} 인증 완료!
                                </p>
                            </div>

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
                                    학원 접근 코드 (선택)
                                </Label>
                                <Input
                                    value={form.academyName}
                                    onChange={(e) => setForm({ ...form, academyName: e.target.value })}
                                    placeholder="선생님께 받은 코드 입력"
                                    className="mt-1.5 bg-white/5 border-white/10 text-white"
                                />
                                <p className="text-amber-400/80 text-xs mt-1">
                                    🔐 학원 수업자료 다운로드를 위한 코드입니다
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
