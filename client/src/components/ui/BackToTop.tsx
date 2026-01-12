import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when page is scrolled down 400px
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={cn(
                "fixed bottom-6 right-6 z-50 p-4 rounded-full",
                "bg-gradient-to-br from-purple-600 to-cyan-600",
                "text-white shadow-2xl shadow-purple-500/30",
                "hover:shadow-purple-500/50 hover:scale-110",
                "transition-all duration-300 ease-out",
                "backdrop-blur-sm border border-white/20",
                isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10 pointer-events-none"
            )}
            aria-label="맨 위로 스크롤"
            title="맨 위로"
        >
            <ArrowUp className="w-6 h-6" />

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 opacity-0 hover:opacity-30 blur-xl transition-opacity -z-10" />
        </button>
    );
}

export default BackToTop;
