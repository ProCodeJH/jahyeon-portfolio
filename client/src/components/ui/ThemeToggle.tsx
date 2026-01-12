import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, toggleTheme, switchable } = useTheme();

    // Don't render if theme switching is disabled
    if (!switchable || !toggleTheme) return null;

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "relative p-2.5 rounded-full transition-all duration-300",
                "bg-white/10 hover:bg-white/20 backdrop-blur-sm",
                "border border-white/20 hover:border-purple-500/50",
                "hover:shadow-lg hover:shadow-purple-500/20",
                "group",
                className
            )}
            aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
            title={theme === "dark" ? "라이트 모드" : "다크 모드"}
        >
            {/* Sun Icon - visible in dark mode */}
            <Sun
                className={cn(
                    "w-5 h-5 transition-all duration-300 absolute inset-0 m-auto",
                    theme === "dark"
                        ? "opacity-100 rotate-0 scale-100 text-yellow-400"
                        : "opacity-0 rotate-90 scale-0"
                )}
            />

            {/* Moon Icon - visible in light mode */}
            <Moon
                className={cn(
                    "w-5 h-5 transition-all duration-300",
                    theme === "dark"
                        ? "opacity-0 -rotate-90 scale-0"
                        : "opacity-100 rotate-0 scale-100 text-purple-600"
                )}
            />
        </button>
    );
}

export default ThemeToggle;
