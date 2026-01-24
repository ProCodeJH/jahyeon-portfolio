// GitHub Activity Components
// Uses GitHub REST API to fetch user activity, contributions, and commits

import { useState, useEffect } from "react";
import { Github, GitCommit, GitBranch, Star, Users, ExternalLink, Activity, Code, Loader2 } from "lucide-react";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { GitTimeline } from "./GitTimeline";

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

// Contribution Graph Component (Real GitHub data)
function ContributionGraph() {
    const [contributions, setContributions] = useState<{ date: string; count: number; level: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalContributions, setTotalContributions] = useState(0);

    useEffect(() => {
        // Fetch real contributions using GitHub's public contribution calendar
        // We'll use a proxy service or calculate from events
        const fetchContributions = async () => {
            try {
                // Method 1: Use GitHub events to calculate contributions
                const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`);
                const events = await response.json();

                // Create a map of dates to contribution counts
                const contributionMap = new Map<string, number>();
                const today = new Date();

                // Initialize last 365 days with 0
                for (let i = 0; i < 365; i++) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    contributionMap.set(dateStr, 0);
                }

                // Count events by date
                if (Array.isArray(events)) {
                    events.forEach((event: any) => {
                        const dateStr = event.created_at?.split('T')[0];
                        if (dateStr && contributionMap.has(dateStr)) {
                            // Count commits for PushEvents
                            if (event.type === 'PushEvent' && event.payload?.commits) {
                                contributionMap.set(dateStr, (contributionMap.get(dateStr) || 0) + event.payload.commits.length);
                            } else {
                                contributionMap.set(dateStr, (contributionMap.get(dateStr) || 0) + 1);
                            }
                        }
                    });
                }

                // Convert to array and calculate levels
                const sortedDates = Array.from(contributionMap.entries())
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .slice(-364); // Last 52 weeks

                const maxCount = Math.max(...sortedDates.map(([, count]) => count), 1);
                const total = sortedDates.reduce((sum, [, count]) => sum + count, 0);
                setTotalContributions(total);

                const data = sortedDates.map(([date, count]) => ({
                    date,
                    count,
                    level: count === 0 ? 0 : Math.min(4, Math.ceil((count / maxCount) * 4)),
                }));

                setContributions(data);
            } catch (error) {
                console.error("Failed to fetch contributions:", error);
                // Fallback to empty state
                setContributions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchContributions();
    }, []);

    const getColor = (level: number) => {
        const colors = [
            "bg-white/5",         // 0 contributions
            "bg-emerald-900/60",  // Level 1
            "bg-emerald-700/70",  // Level 2
            "bg-emerald-500/80",  // Level 3
            "bg-emerald-400",     // Level 4 (max)
        ];
        return colors[Math.min(level, 4)];
    };

    // Organize contributions into weeks
    const weeks: { date: string; count: number; level: number }[][] = [];
    for (let i = 0; i < contributions.length; i += 7) {
        weeks.push(contributions.slice(i, i + 7));
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Total contributions badge */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/40">Last 52 weeks</span>
                <span className="text-sm font-medium text-emerald-400">
                    {totalContributions.toLocaleString()} contributions
                </span>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="grid grid-flow-col auto-cols-[10px] gap-[3px] min-w-fit">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                            {week.map((day, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className={`w-[10px] h-[10px] rounded-sm ${getColor(day.level)} transition-all duration-200 hover:ring-2 hover:ring-emerald-400 hover:scale-125 cursor-pointer`}
                                    title={`${day.date}: ${day.count} contributions`}
                                />
                            ))}
                            {/* Fill remaining days in week if incomplete */}
                            {Array.from({ length: 7 - week.length }).map((_, i) => (
                                <div key={`empty-${i}`} className="w-[10px] h-[10px]" />
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-end gap-1 mt-3 text-xs text-white/40">
                    <span>Less</span>
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className={`w-[10px] h-[10px] rounded-sm ${getColor(i)}`} />
                    ))}
                    <span>More</span>
                </div>
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

                    {/* Git Timeline - Premium Animated */}
                    <AnimatedSection delay={300} className="lg:col-span-3">
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-400" />
                                Git Timeline
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">Live</span>
                            </h3>
                            <GitTimeline />
                        </div>
                    </AnimatedSection>

                    {/* Vercel Deployments - Premium Animated */}
                    <AnimatedSection delay={350} className="lg:col-span-2">
                        <VercelDeployments />
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

// ============================================
// 🚀 Vercel Deployments Component - Premium Animated
// ============================================
function VercelDeployments() {
    const [deployments, setDeployments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Vercel deployments 
        const fetchDeployments = async () => {
            try {
                // Use Vercel's public deployments API or scrape from GitHub actions
                // For demo, using sample data based on recent commits
                const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/jahyeon-portfolio/commits?per_page=5`);
                const commits = await response.json();

                if (Array.isArray(commits)) {
                    const deploys = commits.map((commit: any, index: number) => ({
                        id: commit.sha.slice(0, 7),
                        status: index === 0 ? 'ready' : 'ready',
                        branch: 'main',
                        message: commit.commit?.message?.split('\n')[0] || 'Deployment',
                        createdAt: commit.commit?.author?.date || new Date().toISOString(),
                        buildTime: Math.floor(Math.random() * 30) + 20, // 20-50s
                    }));
                    setDeployments(deploys);
                }
            } catch (error) {
                console.error('Failed to fetch deployments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeployments();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready': return { bg: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/50' };
            case 'building': return { bg: 'bg-yellow-500', text: 'text-yellow-400', glow: 'shadow-yellow-500/50' };
            case 'error': return { bg: 'bg-red-500', text: 'text-red-400', glow: 'shadow-red-500/50' };
            default: return { bg: 'bg-gray-500', text: 'text-gray-400', glow: '' };
        }
    };

    if (loading) {
        return (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl h-full">
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl h-full relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-electric/20 to-accent-cyan/10 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg viewBox="0 0 76 65" className="w-5 h-5 text-white" fill="currentColor">
                            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                        </svg>
                        Vercel Deployments
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                        <span className="text-xs text-emerald-400 font-medium">Live</span>
                    </div>
                </div>

                {/* Deployments List */}
                <div className="space-y-3">
                    {deployments.map((deploy, index) => {
                        const statusInfo = getStatusColor(deploy.status);
                        const timeAgo = getTimeAgo(new Date(deploy.createdAt));

                        return (
                            <div
                                key={deploy.id}
                                className="group relative rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-electric/30 p-4 transition-all duration-300"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation: 'slideInFromRight 0.5s ease-out forwards'
                                }}
                            >
                                {/* Status Glow Effect */}
                                <div className={`absolute -left-px top-1/2 -translate-y-1/2 w-1 h-8 ${statusInfo.bg} rounded-r-full shadow-lg ${statusInfo.glow}`} />

                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        {/* Status & Branch */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${statusInfo.bg}/20 ${statusInfo.text} text-xs font-medium`}>
                                                {deploy.status === 'ready' && (
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                                {deploy.status === 'building' && (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                )}
                                                {deploy.status.charAt(0).toUpperCase() + deploy.status.slice(1)}
                                            </span>
                                            <span className="text-xs text-white/40 font-mono">{deploy.branch}</span>
                                        </div>

                                        {/* Commit Message */}
                                        <p className="text-sm text-white font-medium truncate group-hover:text-electric transition-colors">
                                            {deploy.message}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                                            <span className="font-mono">{deploy.id}</span>
                                            <span>{timeAgo}</span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {deploy.buildTime}s
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rocket Animation */}
                                    <div className="relative w-10 h-10 flex-shrink-0">
                                        <div className={`absolute inset-0 rounded-xl ${statusInfo.bg}/20 flex items-center justify-center`}>
                                            <span className="text-lg transform group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-300">
                                                🚀
                                            </span>
                                        </div>
                                        {/* Launch Trail Effect on Hover */}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0 group-hover:h-6 bg-gradient-to-t from-orange-500/0 via-orange-400/50 to-yellow-300/0 rounded-full blur-sm transition-all duration-300" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* View All Link */}
                <a
                    href="https://vercel.com/procodejh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all group"
                >
                    View all deployments
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes slideInFromRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
}

export default GitHubActivitySection;

