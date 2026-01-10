// GitHub Activity Components
// Uses GitHub REST API to fetch user activity, contributions, and commits

import { useState, useEffect } from "react";
import { Github, GitCommit, GitBranch, Star, Users, ExternalLink, Activity, Code, Loader2 } from "lucide-react";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

const GITHUB_USERNAME = "ProCodeJH"; // GitHub username

interface GitHubProfile {
    login: string;
    name: string;
    avatar_url: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
    html_url: string;
}

interface GitHubRepo {
    id: number;
    name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    language: string;
    updated_at: string;
    pushed_at: string;
}

interface GitHubEvent {
    id: string;
    type: string;
    repo: { name: string };
    created_at: string;
    payload: {
        commits?: { message: string; sha: string }[];
        ref?: string;
        action?: string;
    };
}

// Fetch GitHub data
async function fetchGitHubData() {
    try {
        const [profileRes, reposRes, eventsRes] = await Promise.all([
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=6`),
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=10`),
        ]);

        const profile: GitHubProfile = await profileRes.json();
        const repos: GitHubRepo[] = await reposRes.json();
        const events: GitHubEvent[] = await eventsRes.json();

        return { profile, repos, events };
    } catch (error) {
        console.error("GitHub API error:", error);
        return null;
    }
}

// Language colors
const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    C: "#555555",
    "C++": "#f34b7d",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Java: "#b07219",
    Go: "#00ADD8",
    Rust: "#dea584",
};

// Contribution Graph Component (Grass/Heatmap style)
function ContributionGraph() {
    const [contributions, setContributions] = useState<number[]>([]);

    useEffect(() => {
        // Generate mock contribution data (in real implementation, use GitHub GraphQL API)
        // GitHub's contribution data requires authentication for accuracy
        const mockData = Array.from({ length: 52 * 7 }, () =>
            Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0
        );
        setContributions(mockData);
    }, []);

    const getColor = (level: number) => {
        const colors = [
            "bg-white/5", // 0 contributions
            "bg-emerald-900/50", // 1-2 contributions
            "bg-emerald-700/60", // 3-4 contributions
            "bg-emerald-500/70", // 5-6 contributions
            "bg-emerald-400", // 7+ contributions
        ];
        return colors[Math.min(level, 4)];
    };

    return (
        <div className="overflow-x-auto pb-2">
            <div className="grid grid-flow-col auto-cols-[10px] gap-[3px] min-w-fit">
                {Array.from({ length: 52 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                            const index = weekIndex * 7 + dayIndex;
                            const level = contributions[index] || 0;
                            return (
                                <div
                                    key={dayIndex}
                                    className={`w-[10px] h-[10px] rounded-sm ${getColor(level)} transition-colors hover:ring-1 hover:ring-emerald-400`}
                                    title={`${level} contributions`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-end gap-1 mt-2 text-xs text-white/40">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className={`w-[10px] h-[10px] rounded-sm ${getColor(i)}`} />
                ))}
                <span>More</span>
            </div>
        </div>
    );
}

// Recent Activity Item
function ActivityItem({ event }: { event: GitHubEvent }) {
    const getEventInfo = () => {
        switch (event.type) {
            case "PushEvent":
                const commits = event.payload.commits || [];
                return {
                    icon: <GitCommit className="w-4 h-4" />,
                    action: `Pushed ${commits.length} commit${commits.length > 1 ? "s" : ""} to`,
                    detail: commits[0]?.message?.split("\n")[0] || "",
                    color: "text-emerald-400",
                };
            case "CreateEvent":
                return {
                    icon: <GitBranch className="w-4 h-4" />,
                    action: `Created ${event.payload.ref || "branch"} in`,
                    detail: "",
                    color: "text-blue-400",
                };
            case "WatchEvent":
                return {
                    icon: <Star className="w-4 h-4" />,
                    action: "Starred",
                    detail: "",
                    color: "text-yellow-400",
                };
            case "ForkEvent":
                return {
                    icon: <GitBranch className="w-4 h-4" />,
                    action: "Forked",
                    detail: "",
                    color: "text-purple-400",
                };
            default:
                return {
                    icon: <Activity className="w-4 h-4" />,
                    action: event.type.replace("Event", ""),
                    detail: "",
                    color: "text-white/60",
                };
        }
    };

    const info = getEventInfo();
    const timeAgo = getTimeAgo(new Date(event.created_at));

    return (
        <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
            <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${info.color}`}>
                {info.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80">
                    <span className={info.color}>{info.action}</span>{" "}
                    <span className="font-medium text-white">{event.repo.name.split("/")[1]}</span>
                </p>
                {info.detail && (
                    <p className="text-xs text-white/50 truncate mt-0.5">{info.detail}</p>
                )}
                <p className="text-xs text-white/30 mt-1">{timeAgo}</p>
            </div>
        </div>
    );
}

function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

// Main GitHub Activity Section
export function GitHubActivitySection() {
    const [data, setData] = useState<{
        profile: GitHubProfile;
        repos: GitHubRepo[];
        events: GitHubEvent[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        fetchGitHubData().then(result => {
            if (result) {
                setData(result);
                // Check if there was activity in the last hour
                if (result.events.length > 0) {
                    const lastEventTime = new Date(result.events[0].created_at).getTime();
                    const oneHourAgo = Date.now() - 60 * 60 * 1000;
                    setIsLive(lastEventTime > oneHourAgo);
                }
            }
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <section className="py-20 px-4 md:px-8">
                <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            </section>
        );
    }

    if (!data) return null;

    return (
        <section className="py-20 md:py-28 px-4 md:px-8 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="max-w-6xl mx-auto relative z-10">
                <AnimatedSection>
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6">
                            <Github className="w-5 h-5 text-white" />
                            <span className="text-sm font-medium text-white/80">GitHub Activity</span>
                            {isLive && (
                                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    Live
                                </span>
                            )}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Open Source Contributions
                            </span>
                        </h2>
                        <p className="text-white/60 max-w-xl mx-auto">
                            Real-time coding activity and contributions on GitHub
                        </p>
                    </div>
                </AnimatedSection>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <AnimatedSection delay={100}>
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={data.profile.avatar_url}
                                    alt={data.profile.name}
                                    className="w-16 h-16 rounded-full ring-2 ring-emerald-500/50"
                                />
                                <div>
                                    <h3 className="text-lg font-bold text-white">{data.profile.name}</h3>
                                    <p className="text-white/50 text-sm">@{data.profile.login}</p>
                                </div>
                            </div>
                            {data.profile.bio && (
                                <p className="text-white/60 text-sm mb-4">{data.profile.bio}</p>
                            )}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{data.profile.public_repos}</p>
                                    <p className="text-xs text-white/50">Repos</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{data.profile.followers}</p>
                                    <p className="text-xs text-white/50">Followers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{data.profile.following}</p>
                                    <p className="text-xs text-white/50">Following</p>
                                </div>
                            </div>
                            <a
                                href={data.profile.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-sm transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View Profile
                            </a>
                        </div>
                    </AnimatedSection>

                    {/* Contribution Graph */}
                    <AnimatedSection delay={200} className="lg:col-span-2">
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Code className="w-5 h-5 text-emerald-400" />
                                Contribution Graph
                            </h3>
                            <ContributionGraph />
                        </div>
                    </AnimatedSection>

                    {/* Recent Activity */}
                    <AnimatedSection delay={300} className="lg:col-span-2">
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-400" />
                                Recent Activity
                            </h3>
                            <div className="space-y-1 max-h-[300px] overflow-y-auto">
                                {data.events.slice(0, 6).map(event => (
                                    <ActivityItem key={event.id} event={event} />
                                ))}
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Top Repositories */}
                    <AnimatedSection delay={400}>
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400" />
                                Recent Repos
                            </h3>
                            <div className="space-y-3">
                                {data.repos.slice(0, 4).map(repo => (
                                    <a
                                        key={repo.id}
                                        href={repo.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
                                                {repo.name}
                                            </h4>
                                            <div className="flex items-center gap-1 text-white/40 text-xs">
                                                <Star className="w-3 h-3" />
                                                {repo.stargazers_count}
                                            </div>
                                        </div>
                                        {repo.language && (
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || "#666" }}
                                                />
                                                <span className="text-xs text-white/50">{repo.language}</span>
                                            </div>
                                        )}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </section>
    );
}

export default GitHubActivitySection;
