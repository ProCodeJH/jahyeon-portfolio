import { useState } from "react";
import { Facebook, Twitter, Linkedin, Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
    url?: string;
    title?: string;
    description?: string;
    className?: string;
    variant?: "horizontal" | "vertical" | "floating";
}

const shareConfigs = [
    {
        name: "Facebook",
        icon: Facebook,
        color: "hover:bg-blue-600 hover:text-white",
        getUrl: (url: string) =>
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
        name: "Twitter",
        icon: Twitter,
        color: "hover:bg-sky-500 hover:text-white",
        getUrl: (url: string, title: string) =>
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
        name: "LinkedIn",
        icon: Linkedin,
        color: "hover:bg-blue-700 hover:text-white",
        getUrl: (url: string, title: string) =>
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
];

export function ShareButtons({
    url = typeof window !== "undefined" ? window.location.href : "",
    title = "Gu Jahyeon - Embedded Developer Portfolio",
    description = "",
    className,
    variant = "horizontal",
}: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleShare = (getUrl: (url: string, title: string) => string) => {
        const shareUrl = getUrl(url, title);
        window.open(shareUrl, "_blank", "width=600,height=400,noopener,noreferrer");
    };

    const containerClasses = cn(
        "flex gap-2",
        variant === "vertical" && "flex-col",
        variant === "floating" &&
        "fixed right-4 top-1/2 -translate-y-1/2 flex-col z-50",
        className
    );

    const buttonClasses =
        "p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 text-white/70 hover:scale-110 hover:shadow-lg";

    return (
        <div className={containerClasses}>
            {/* Social Share Buttons */}
            {shareConfigs.map((config) => (
                <button
                    key={config.name}
                    onClick={() => handleShare(config.getUrl)}
                    className={cn(buttonClasses, config.color)}
                    title={`${config.name}에 공유하기`}
                    aria-label={`Share on ${config.name}`}
                >
                    <config.icon className="w-5 h-5" />
                </button>
            ))}

            {/* Copy Link Button */}
            <button
                onClick={handleCopyLink}
                className={cn(
                    buttonClasses,
                    copied
                        ? "bg-green-500/20 text-green-400 border-green-500/50"
                        : "hover:bg-white/20 hover:text-white"
                )}
                title={copied ? "복사됨!" : "링크 복사"}
                aria-label="Copy link"
            >
                {copied ? (
                    <Check className="w-5 h-5" />
                ) : (
                    <Link2 className="w-5 h-5" />
                )}
            </button>
        </div>
    );
}

export default ShareButtons;
