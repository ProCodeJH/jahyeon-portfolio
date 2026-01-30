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
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import "../styles/dopple-v4.css";

// Supreme Quantum Logo
function SupremeLogo({ size = 48 }: { size?: number }) {
    return (
        <svg viewBox="0 0 100 100" style={{ width: size, height: size }} xmlns="http://www.w3.org/2000/svg">
            <style>{`
                @keyframes spin1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes spin2 { from { transform: rotate(120deg); } to { transform: rotate(480deg); } }
                @keyframes spin3 { from { transform: rotate(240deg); } to { transform: rotate(600deg); } }
                @keyframes pulse { 0%, 100% { opacity: 0.7; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
            `}</style>
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4361EE" />
                    <stop offset="50%" stopColor="#7B2FFF" />
                    <stop offset="100%" stopColor="#00D9FF" />
                </linearGradient>
            </defs>
            <g transform="translate(50,50)">
                <ellipse rx="35" ry="12" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.6" style={{ animation: 'spin1 8s linear infinite', transformOrigin: 'center' }} />
                <ellipse rx="35" ry="12" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.6" style={{ animation: 'spin2 8s linear infinite', transformOrigin: 'center' }} />
                <ellipse rx="35" ry="12" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.6" style={{ animation: 'spin3 8s linear infinite', transformOrigin: 'center' }} />
                <circle r="12" fill="url(#grad1)" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                <circle r="6" fill="white" opacity="0.9" />
            </g>
        </svg>
    );
}

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
            toast.success("인증 이메일이 발송되었습니다!");
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
            toast.error("인증 세션이 만료되었습니다");
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
            phone: authMethod === "phone" ? phone : email,
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

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        fontSize: '16px',
        border: '2px solid #eee',
        borderRadius: '12px',
        outline: 'none',
        transition: 'border-color 0.2s',
        background: 'white'
    };

    const buttonStyle = {
        padding: '14px 24px',
        fontSize: '15px',
        fontWeight: 700,
        color: 'white',
        background: 'linear-gradient(135deg, #7B2FFF, #00D9FF)',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'transform 0.2s, box-shadow 0.2s'
    };

    return (
        <div className="dp4-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header className="dp4-header">
                <Link href="/" className="dp4-logo">
                    <SupremeLogo size={70} />
                </Link>
                <nav className="dp4-nav">
                    <Link href="/">PROJECTS</Link>
                    <Link href="/resources">RESOURCES</Link>
                </nav>
                <a href="mailto:contact@jahyeon.com" className="dp4-send">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 2L11 13" />
                        <polygon points="22,2 15,22 11,13 2,9" />
                    </svg>
                </a>
            </header>

            {/* Hidden reCAPTCHA container */}
            <div id="recaptcha-container" ref={recaptchaContainerRef} />

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 60px' }}>
                <div style={{ width: '100%', maxWidth: '480px' }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <SupremeLogo size={60} />
                        <h1 style={{
                            fontSize: '40px',
                            fontWeight: 900,
                            marginTop: '12px',
                            background: 'linear-gradient(135deg, #4361EE, #7B2FFF)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            회원가입
                        </h1>
                        <p style={{ color: '#666', marginTop: '8px', fontSize: '14px' }}>코딩쏙학원 강의 자료에 접근하세요</p>
                    </div>

                    {/* Progress Steps */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    background: getStepNumber() >= i ? 'linear-gradient(135deg, #7B2FFF, #00D9FF)' : '#eee',
                                    color: getStepNumber() >= i ? 'white' : '#999'
                                }}>
                                    {getStepNumber() > i ? <CheckCircle size={16} /> : i + 1}
                                </div>
                                {i < 3 && <div style={{ width: '24px', height: '2px', background: getStepNumber() > i ? '#7B2FFF' : '#eee' }} />}
                            </div>
                        ))}
                    </div>

                    {/* Form Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '32px',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                        border: '1px solid #eee'
                    }}>
                        {/* Firebase Error Alert */}
                        {firebaseError && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
                                borderRadius: '12px',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                marginBottom: '20px'
                            }}>
                                <p style={{ color: '#ef4444', fontSize: '14px' }}>⚠️ {firebaseError}</p>
                            </div>
                        )}

                        {/* Step 0: Method Selection */}
                        {step === "method" && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '8px' }}>인증 방법을 선택하세요</p>

                                <button
                                    onClick={() => { setAuthMethod("phone"); setStep("input"); }}
                                    style={{
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, rgba(123, 47, 255, 0.1), rgba(0, 217, 255, 0.05))',
                                        border: '2px solid rgba(123, 47, 255, 0.3)',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px'
                                    }}
                                >
                                    <div style={{ fontSize: '32px' }}>📱</div>
                                    <div>
                                        <p style={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>전화번호 인증</p>
                                        <p style={{ color: '#666', fontSize: '13px' }}>SMS로 인증번호를 받습니다</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => { setAuthMethod("email"); setStep("input"); }}
                                    style={{
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, rgba(123, 47, 255, 0.05), rgba(0, 217, 255, 0.1))',
                                        border: '2px solid rgba(0, 217, 255, 0.3)',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px'
                                    }}
                                >
                                    <div style={{ fontSize: '32px' }}>📧</div>
                                    <div>
                                        <p style={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>이메일 인증</p>
                                        <p style={{ color: '#666', fontSize: '13px' }}>이메일 링크로 인증합니다</p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Step 1: Phone Input */}
                        {step === "input" && authMethod === "phone" && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>📱 핸드폰 번호</label>
                                    <input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                                        placeholder="01012345678"
                                        maxLength={11}
                                        style={inputStyle}
                                    />
                                    <p style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>'-' 없이 숫자만 입력하세요</p>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setStep("method")} style={{ ...buttonStyle, flex: 1, background: '#eee', color: '#666' }}>이전</button>
                                    <button id="send-sms-button" onClick={handleSendPhoneSMS} disabled={isLoading || phone.length < 10} style={{ ...buttonStyle, flex: 1, opacity: phone.length < 10 ? 0.5 : 1 }}>
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        인증번호 발송
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Email Input */}
                        {step === "input" && authMethod === "email" && !emailSent && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>📧 이메일 주소</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@gmail.com"
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setStep("method")} style={{ ...buttonStyle, flex: 1, background: '#eee', color: '#666' }}>이전</button>
                                    <button onClick={handleSendEmail} disabled={isLoading || !email.includes("@")} style={{ ...buttonStyle, flex: 1, opacity: !email.includes("@") ? 0.5 : 1 }}>
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        인증 메일 발송
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Email Sent Confirmation */}
                        {step === "input" && authMethod === "email" && emailSent && (
                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
                                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#333', marginBottom: '8px' }}>이메일을 확인하세요!</h3>
                                <p style={{ color: '#666', fontSize: '14px' }}>
                                    <strong style={{ color: '#7B2FFF' }}>{email}</strong>로<br />
                                    인증 링크를 발송했습니다.
                                </p>
                                <button onClick={() => { setEmailSent(false); setStep("method"); }} style={{ ...buttonStyle, marginTop: '24px', background: '#eee', color: '#666' }}>
                                    다른 방법으로 인증
                                </button>
                            </div>
                        )}

                        {/* Step 2: Phone Verify */}
                        {step === "verify" && authMethod === "phone" && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>🔢 인증번호</label>
                                    <input
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                                        placeholder="6자리 인증번호"
                                        maxLength={6}
                                        style={{ ...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                                    />
                                    <p style={{ color: '#999', fontSize: '12px', marginTop: '4px', textAlign: 'center' }}>{phone}로 발송된 인증번호를 입력하세요</p>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => { setStep("input"); setConfirmationResult(null); setVerificationCode(""); }} style={{ ...buttonStyle, flex: 1, background: '#eee', color: '#666' }}>이전</button>
                                    <button onClick={handleVerifyPhone} disabled={isLoading || verificationCode.length !== 6} style={{ ...buttonStyle, flex: 1, opacity: verificationCode.length !== 6 ? 0.5 : 1 }}>
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        확인
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Info */}
                        {step === "info" && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, rgba(123, 47, 255, 0.1), rgba(0, 217, 255, 0.1))',
                                    borderRadius: '12px',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ color: '#7B2FFF', fontSize: '14px', fontWeight: 600 }}>
                                        ✅ {authMethod === "phone" ? "전화번호" : "이메일"} 인증 완료!
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>👤 이름 *</label>
                                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="홍길동" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>🎂 나이 *</label>
                                        <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="15" min={5} max={100} style={inputStyle} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>🔒 비밀번호 *</label>
                                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="6자 이상" style={inputStyle} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>🔒 비밀번호 확인 *</label>
                                    <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="비밀번호 다시 입력" style={inputStyle} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>🏫 수업자료 접근 코드 (선택)</label>
                                    <input value={form.academyName} onChange={(e) => setForm({ ...form, academyName: e.target.value })} placeholder="선생님께 받은 코드 입력" style={inputStyle} />
                                    <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '4px' }}>🔐 학원 수업자료 다운로드를 위한 코드입니다</p>
                                </div>

                                <button onClick={handleRegister} disabled={register.isPending} style={{ ...buttonStyle, width: '100%' }}>
                                    {register.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    가입하기 →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer Links */}
                    <p style={{ textAlign: 'center', color: '#666', marginTop: '24px' }}>
                        이미 계정이 있으신가요?{" "}
                        <Link href="/login" style={{ color: '#7B2FFF', fontWeight: 600 }}>
                            로그인
                        </Link>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="dp4-footer">
                <nav className="dp4-footer-nav">
                    <Link href="/">PROJECTS</Link>
                    <Link href="/resources">RESOURCES</Link>
                    <Link href="/blog">BLOG</Link>
                    <a href="mailto:contact@jahyeon.com">CONTACT</a>
                </nav>
                <p>© 2024 Gu Jahyeon. Embedded Developer & Educator.</p>
            </footer>
        </div>
    );
}
