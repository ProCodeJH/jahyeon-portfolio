import { useMemo } from "react";

interface YouTubeEmbedProps {
    url: string;
    className?: string;
}

/**
 * Extract YouTube video ID from various URL formats
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 */
function extractYouTubeId(url: string): string | null {
    if (!url) return null;

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\s?/]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

export function YouTubeEmbed({ url, className = "" }: YouTubeEmbedProps) {
    const videoId = useMemo(() => extractYouTubeId(url), [url]);

    if (!videoId) {
        return (
            <div className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl aspect-video ${className}`}>
                <p className="text-gray-500 font-medium">Invalid YouTube URL</p>
            </div>
        );
    }

    return (
        <div className={`group relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl ${className}`}>
            {/* Premium Gradient Border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl md:rounded-3xl opacity-30 group-hover:opacity-60 blur-lg transition-opacity duration-500" />

            {/* Video Container */}
            <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-black border-2 border-white/20">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            </div>

            {/* Hover Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl md:rounded-3xl" />
        </div>
    );
}
