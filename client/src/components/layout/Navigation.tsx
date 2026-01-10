import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogIn, LogOut, UserPlus } from "lucide-react";
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
    { name: "Code Editor", path: "/code-editor" }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-200/50 shadow-lg shadow-purple-500/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 md:py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <div className="group cursor-pointer">
                <span className="text-2xl md:text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 group-hover:scale-110 transition-all duration-300 inline-block">
                  JH
                </span>
                <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500 rounded-full" />
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {menuItems.map(item => (
                <Link key={item.name} href={item.path}>
                  <span className="group text-base font-bold text-gray-700 hover:text-purple-600 transition-all cursor-pointer relative px-3 py-2">
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all duration-300 rounded-full" />
                    <span className="absolute inset-0 bg-purple-100 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10" />
                  </span>
                </Link>
              ))}

              {/* Auth Buttons */}
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                {member ? (
                  <>
                    <span className="text-sm font-medium text-gray-600">
                      {member.name}님
                    </span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all">
                        <LogIn className="w-4 h-4" />
                        로그인
                      </button>
                    </Link>
                    <Link href="/register">
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium transition-all shadow-lg shadow-purple-500/20">
                        <UserPlus className="w-4 h-4" />
                        회원가입
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-purple-100 transition-colors"
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
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: mobileMenuOpen ? "slideIn 0.3s ease-out forwards" : "none"
                  }}
                >
                  <div className="px-6 py-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                      {item.name}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {/* Animated underline */}
                  <div className="h-1 w-0 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all duration-300" />
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
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium transition-all"
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
