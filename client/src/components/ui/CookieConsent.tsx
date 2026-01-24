import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { cn } from "@/lib/utils";

const COOKIE_CONSENT_KEY = "cookie-consent-accepted";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const hasAccepted = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!hasAccepted) {
            // Delay showing the banner for better UX
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, "true");
        setIsVisible(false);
    };

    const declineCookies = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[90]",
                "p-5 rounded-2xl",
                "bg-[#12121a]/95 backdrop-blur-xl",
                "border border-white/10",
                "shadow-2xl shadow-purple-500/10",
                "animate-in slide-in-from-bottom-5 duration-500"
            )}
        >
            {/* Close button */}
            <button
                onClick={declineCookies}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="닫기"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>

            <div className="flex items-start gap-4">
                {/* Cookie Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-purple-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-base mb-1">🍪 쿠키 사용 안내</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        더 나은 사용자 경험을 위해 쿠키를 사용합니다.
                        사이트를 계속 이용하시면 쿠키 사용에 동의하는 것으로 간주됩니다.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={acceptCookies}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                        >
                            동의
                        </button>
                        <button
                            onClick={declineCookies}
                            className="px-4 py-2 rounded-lg bg-white/10 text-gray-300 text-sm font-medium hover:bg-white/20 transition-colors"
                        >
                            거부
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CookieConsent;
