// Premium Git Timeline Component
// Animated commit/branch visualization with lines and dots

import { useState, useEffect, useMemo } from "react";
import { GitCommit, GitBranch, GitMerge, Tag, Star, ArrowUpRight } from "lucide-react";

interface GitHubEvent {
    id: string;
    type: string;
    repo: { name: string };
    created_at: string;
    payload: {
        commits?: { message: string; sha: string }[];
        ref?: string;
        ref_type?: string;
        action?: string;
        head?: string;
        before?: string;
    };
}

const GITHUB_USERNAME = "ProCodeJH";

// Event type colors - User-requested color scheme
// 커밋=파랑, 브랜치=주황, PR=보라, Fork=초록
const EVENT_COLORS = {
    PushEvent: { bg: "from-blue-500 to-cyan-400", glow: "blue", line: "#3b82f6" },           // 🔵 커밋 푸시 = 파란색
    CreateEvent: { bg: "from-orange-500 to-amber-400", glow: "orange", line: "#f97316" },   // 🟠 브랜치 생성 = 주황색
    PullRequestEvent: { bg: "from-purple-500 to-pink-400", glow: "purple", line: "#a855f7" }, // 🟣 PR = 보라색
    IssuesEvent: { bg: "from-rose-500 to-red-400", glow: "rose", line: "#f43f5e" },         // 🔴 이슈 = 빨간색
    WatchEvent: { bg: "from-yellow-500 to-amber-400", glow: "yellow", line: "#eab308" },    // 🟡 스타 = 노란색
    ForkEvent: { bg: "from-emerald-500 to-green-400", glow: "emerald", line: "#10b981" },   // 🟢 포크 = 초록색
    DeleteEvent: { bg: "from-red-600 to-rose-500", glow: "red", line: "#dc2626" },          // ❌ 삭제 = 진빨강
    ReleaseEvent: { bg: "from-teal-500 to-emerald-400", glow: "teal", line: "#14b8a6" },    // 릴리스 = 청록
    default: { bg: "from-gray-500 to-slate-400", glow: "gray", line: "#6b7280" },
} as const;

function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "방금 전";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
    return date.toLocaleDateString("ko-KR");
}

function getEventIcon(type: string) {
    switch (type) {
        case "PushEvent": return <GitCommit className="w-4 h-4" />;
        case "CreateEvent": return <GitBranch className="w-4 h-4" />;
        case "PullRequestEvent": return <GitMerge className="w-4 h-4" />;
        case "ReleaseEvent": return <Tag className="w-4 h-4" />;
        case "WatchEvent": return <Star className="w-4 h-4" />;
        case "ForkEvent": return <GitBranch className="w-4 h-4" />;
        default: return <GitCommit className="w-4 h-4" />;
    }
}

function getEventDescription(event: GitHubEvent): { action: string; detail: string } {
    const repoName = event.repo.name.split("/")[1];
    switch (event.type) {
        case "PushEvent": {
            const commits = event.payload.commits || [];
            return {
                action: `${commits.length}개 커밋 푸시`,
                detail: commits[0]?.message?.split("\n")[0] || "",
            };
        }
        case "CreateEvent":
            return {
                action: `${event.payload.ref_type === "branch" ? "브랜치" : "태그"} 생성`,
                detail: event.payload.ref || "",
            };
        case "PullRequestEvent":
            return {
                action: `PR ${event.payload.action}`,
                detail: "",
            };
        case "WatchEvent":
            return {
                action: "스타 추가",
                detail: repoName,
            };
        case "ForkEvent":
            return {
                action: "포크",
                detail: repoName,
            };
        case "ReleaseEvent":
            return {
                action: "릴리스 생성",
                detail: "",
            };
        default:
            return {
                action: event.type.replace("Event", ""),
                detail: "",
            };
    }
}

// Single timeline node with animation
function TimelineNode({
    event,
    index,
    total,
    isVisible
}: {
    event: GitHubEvent;
    index: number;
    total: number;
    isVisible: boolean;
}) {
    const colors = EVENT_COLORS[event.type as keyof typeof EVENT_COLORS] || EVENT_COLORS.default;
    const { action, detail } = getEventDescription(event);
    const repoName = event.repo.name.split("/")[1];
    const isLast = index === total - 1;

    return (
        <div
            className="relative flex gap-4 group"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
                transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms`,
            }}
        >
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
                {/* Animated Dot */}
                <div className="relative">
                    {/* Outer glow ring */}
                    <div
                        className={`absolute -inset-2 rounded-full bg-gradient-to-r ${colors.bg} opacity-20 blur-sm animate-pulse`}
                        style={{ animationDelay: `${index * 200}ms` }}
                    />
                    {/* Main dot */}
                    <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-white shadow-lg z-10 group-hover:scale-110 transition-transform duration-300`}>
                        {getEventIcon(event.type)}
                    </div>
                    {/* Pulse animation on hover */}
                    <div className="absolute inset-0 rounded-xl bg-white/30 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                </div>

                {/* Connecting Line */}
                {!isLast && (
                    <div className="relative w-0.5 h-20 bg-white/10 overflow-hidden">
                        {/* Animated gradient line */}
                        <div
                            className="absolute inset-0 w-full"
                            style={{
                                background: `linear-gradient(to bottom, ${colors.line}, transparent)`,
                                animation: isVisible ? "flowDown 1.5s ease-out forwards" : "none",
                                animationDelay: `${index * 100 + 300}ms`,
                                transform: "translateY(-100%)",
                            }}
                        />
                        {/* Sparkle effect */}
                        <div
                            className="absolute w-1.5 h-1.5 -left-0.5 rounded-full bg-white"
                            style={{
                                animation: isVisible ? "sparkleDown 2s ease-in-out infinite" : "none",
                                animationDelay: `${index * 200}ms`,
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Content Card */}
            <div className="flex-1 pb-6">
                <div
                    className="group/card relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300 cursor-pointer overflow-hidden"
                    onClick={() => window.open(`https://github.com/${event.repo.name}`, "_blank")}
                >
                    {/* Hover gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} opacity-0 group-hover/card:opacity-5 transition-opacity duration-300`} />

                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 relative z-10">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm font-semibold bg-gradient-to-r ${colors.bg} bg-clip-text text-transparent`}>
                                    {action}
                                </span>
                                <span className="text-white/40">→</span>
                                <span className="text-white font-medium text-sm truncate">
                                    {repoName}
                                </span>
                            </div>
                            {detail && (
                                <p className="text-white/50 text-xs mt-1 truncate">
                                    {detail}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white/30 text-xs whitespace-nowrap">
                                {getTimeAgo(new Date(event.created_at))}
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-white/20 group-hover/card:text-white/60 transition-colors" />
                        </div>
                    </div>

                    {/* Commits preview for PushEvent */}
                    {event.type === "PushEvent" && event.payload.commits && event.payload.commits.length > 0 && (
                        <div className="mt-3 space-y-1 relative z-10">
                            {event.payload.commits.slice(0, 3).map((commit, i) => (
                                <div
                                    key={commit.sha}
                                    className="flex items-center gap-2 text-xs"
                                    style={{
                                        opacity: isVisible ? 1 : 0,
                                        transform: isVisible ? "translateX(0)" : "translateX(-10px)",
                                        transition: `all 0.4s ease-out ${(index * 100) + (i * 50) + 200}ms`,
                                    }}
                                >
                                    <code className="text-emerald-400/80 font-mono">
                                        {commit.sha.substring(0, 7)}
                                    </code>
                                    <span className="text-white/40 truncate flex-1">
                                        {commit.message.split("\n")[0]}
                                    </span>
                                </div>
                            ))}
                            {event.payload.commits.length > 3 && (
                                <span className="text-white/30 text-xs">
                                    +{event.payload.commits.length - 3} more commits
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Branch lane visualization
function BranchLane({ branch, color, delay }: { branch: string; color: string; delay: number }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.9)",
                transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
        >
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-white/60 font-mono">{branch}</span>
        </div>
    );
}

// Main Timeline Component
export function GitTimeline() {
    const [events, setEvents] = useState<GitHubEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=15`)
            .then(res => res.json())
            .then((data: GitHubEvent[]) => {
                setEvents(Array.isArray(data) ? data : []);
                setLoading(false);
                setTimeout(() => setIsVisible(true), 100);
            })
            .catch(() => setLoading(false));
    }, []);

    // Extract unique branches from events
    const branches = useMemo(() => {
        const branchSet = new Set<string>();
        events.forEach(event => {
            if (event.type === "CreateEvent" && event.payload.ref) {
                branchSet.add(event.payload.ref);
            }
        });
        return Array.from(branchSet).slice(0, 5);
    }, [events]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                    <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-blue-500/20 border-b-blue-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* CSS Animations */}
            <style>{`
                @keyframes flowDown {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(0); }
                }
                @keyframes sparkleDown {
                    0%, 100% { top: 0%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.1); }
                }
            `}</style>

            {/* Branch Labels */}
            {branches.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <BranchLane branch="main" color="bg-emerald-500" delay={0} />
                    {branches.map((branch, i) => (
                        <BranchLane
                            key={branch}
                            branch={branch}
                            color={["bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-yellow-500"][i % 4]}
                            delay={(i + 1) * 100}
                        />
                    ))}
                </div>
            )}

            {/* Timeline */}
            <div className="relative">
                {events.length === 0 ? (
                    <div className="text-center py-12 text-white/40">
                        최근 활동이 없습니다
                    </div>
                ) : (
                    events.slice(0, 10).map((event, index) => (
                        <TimelineNode
                            key={event.id}
                            event={event}
                            index={index}
                            total={Math.min(events.length, 10)}
                            isVisible={isVisible}
                        />
                    ))
                )}
            </div>

            {/* View More Link */}
            {events.length > 0 && (
                <div
                    className="text-center mt-4"
                    style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? "translateY(0)" : "translateY(20px)",
                        transition: "all 0.6s ease-out 1s",
                    }}
                >
                    <a
                        href={`https://github.com/${GITHUB_USERNAME}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-sm transition-all duration-300"
                    >
                        GitHub에서 더 보기
                        <ArrowUpRight className="w-4 h-4" />
                    </a>
                </div>
            )}
        </div>
    );
}

export default GitTimeline;
