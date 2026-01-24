import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogIn, LogOut, UserPlus, MessageSquare, FileText } from "lucide-react";
import { toast } from "sonner";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [member, setMember] = useState<{ id: number; name: string } | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("member");
    if (stored) {
      try {
        setMember(JSON.parse(stored));
      } catch { }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("member");
    setMember(null);
    toast.success("로그아웃 되었습니다");
    setLocation("/");
  };

  const menuItems = [
    { name: "Work", path: "/projects" },
    { name: "Resources", path: "/resources" },
    { name: "Code Editor", path: "/code-editor" },
    { name: "Arduino", path: "/arduino-lab" },
    { name: "Community", path: "/community", icon: MessageSquare },
    { name: "Notion", path: "/notes", icon: FileText }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-midnight/95 backdrop-blur-2xl border-b border-midnight-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <div className="group cursor-pointer flex items-center gap-3">
                <img src="/logo.png" alt="JH Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-lg group-hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.3)]" />
                <span className="hidden md:inline font-[family-name:var(--font-heading)] text-xl font-bold text-frost group-hover:text-electric transition-colors">
                  Portfolio
                </span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {menuItems.map(item => (
                <Link key={item.name} href={item.path}>
                  <span className="group font-[family-name:var(--font-heading)] text-sm font-semibold text-frost hover:text-electric transition-all cursor-pointer relative px-3 py-2">
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-electric group-hover:w-full transition-all duration-300 rounded-full" />
                  </span>
                </Link>
              ))}

              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-midnight-border">
                {member ? (
                  <>
                    <span className="text-sm font-medium text-frost-muted">
                      {member.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-midnight-card hover:bg-electric/10 text-frost text-sm font-medium transition-all border border-midnight-border"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-midnight-card hover:bg-electric/10 text-frost text-sm font-medium transition-all border border-midnight-border">
                        <LogIn className="w-4 h-4" />
                        Login
                      </button>
                    </Link>
                    <Link href="/register">
                      <button className="font-[family-name:var(--font-heading)] flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric hover:bg-electric-dim text-midnight text-sm font-bold transition-all">
                        <UserPlus className="w-4 h-4" />
                        Sign Up
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-positivus-lime/20 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-[73px] left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-2xl border-b border-gray-200/50 shadow-2xl transition-all duration-300 ease-in-out ${mobileMenuOpen
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col gap-2">
            {menuItems.map((item, index) => (
              <Link key={item.name} href={item.path}>
                <div
                  onClick={() => setMobileMenuOpen(false)}
                  className="group relative overflow-hidden rounded-2xl bg-positivus-gray hover:bg-positivus-lime/30 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: mobileMenuOpen ? "slideIn 0.3s ease-out forwards" : "none"
                  }}
                >
                  <div className="px-6 py-4 flex items-center justify-between">
                    <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-positivus-dark transition-colors">
                      {item.name}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-positivus-lime opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {/* Animated underline */}
                  <div className="h-1 w-0 bg-positivus-lime group-hover:w-full transition-all duration-300" />
                </div>
              </Link>
            ))}

            {/* Mobile Auth Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {member ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm text-gray-600">
                    👋 {member.name}님 환영합니다
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="flex-1">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all"
                    >
                      <LogIn className="w-4 h-4" />
                      로그인
                    </button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full font-[family-name:var(--font-space-grotesk)] flex items-center justify-center gap-2 px-4 py-3 rounded-[14px] bg-positivus-dark text-white font-medium transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      회원가입
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Slide In Animation */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
