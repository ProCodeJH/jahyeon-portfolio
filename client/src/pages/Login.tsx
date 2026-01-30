import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import "../styles/dopple-v4.css";

// Supreme Quantum Logo - Inline SVG with CSS Animations
function SupremeLogo({ size = 48 }: { size?: number }) {
    return (
        <svg
            viewBox="0 0 100 100"
            style={{ width: size, height: size }}
            xmlns="http://www.w3.org/2000/svg"
        >
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

export default function Login() {
    const [, setLocation] = useLocation();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const login = trpc.members.login.useMutation({
        onSuccess: (data) => {
            toast.success(`${data.member.name}님, 환영합니다!`);
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

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 60px' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <SupremeLogo size={80} />
                        <h1 style={{
                            fontSize: '48px',
                            fontWeight: 900,
                            marginTop: '16px',
                            background: 'linear-gradient(135deg, #4361EE, #7B2FFF)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            로그인
                        </h1>
                        <p style={{ color: '#666', marginTop: '8px' }}>계정에 로그인하세요</p>
                    </div>

                    {/* Form */}
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '32px',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                        border: '1px solid #eee'
                    }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                                📱 핸드폰 번호
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                                placeholder="01012345678"
                                maxLength={11}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    fontSize: '16px',
                                    border: '2px solid #eee',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#7B2FFF'}
                                onBlur={(e) => e.target.style.borderColor = '#eee'}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                                🔒 비밀번호
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호 입력"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    fontSize: '16px',
                                    border: '2px solid #eee',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#7B2FFF'}
                                onBlur={(e) => e.target.style.borderColor = '#eee'}
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            />
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={login.isPending}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '16px',
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
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(123, 47, 255, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {login.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            로그인 →
                        </button>
                    </div>

                    {/* Footer Links */}
                    <p style={{ textAlign: 'center', color: '#666', marginTop: '24px' }}>
                        계정이 없으신가요?{" "}
                        <Link href="/register" style={{ color: '#7B2FFF', fontWeight: 600 }}>
                            회원가입
                        </Link>
                    </p>

                    {/* Info Box */}
                    <div style={{
                        marginTop: '24px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, rgba(123, 47, 255, 0.1), rgba(0, 217, 255, 0.1))',
                        borderRadius: '12px',
                        border: '1px solid rgba(123, 47, 255, 0.2)'
                    }}>
                        <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                            💡 <strong style={{ color: '#7B2FFF' }}>Resource</strong> 학원 수업자료는 학원 학생들만 확인 및 다운 가능합니다.
                        </p>
                    </div>
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
