import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, Lock, Star, Trophy, Loader2 } from "lucide-react";

interface Badge {
    id: number;
    name: string;
    description?: string;
    iconUrl?: string;
    points: number;
    earned: boolean;
    earnedAt?: string;
}

interface BadgeCollectionProps {
    memberId: number;
}

export function BadgeCollection({ memberId }: BadgeCollectionProps) {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

    useEffect(() => {
        loadBadges();
    }, [memberId]);

    const loadBadges = async () => {
        try {
            const input = encodeURIComponent(JSON.stringify({ memberId }));
            const res = await fetch(`/api/trpc/sns.badges.list?input=${input}`);
            const data = await res.json();
            setBadges(data.result?.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const earnedCount = badges.filter(b => b.earned).length;
    const totalPoints = badges.filter(b => b.earned).reduce((sum, b) => sum + b.points, 0);
    const progress = badges.length > 0 ? (earnedCount / badges.length) * 100 : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-electric" />
            </div>
        );
    }

    return (
        <div className="bg-midnight-card rounded-xl border border-white/10 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">뱃지 컬렉션</h2>
                        <p className="text-sm text-frost-muted">
                            {earnedCount} / {badges.length} 획득 • {totalPoints} 포인트
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-frost-muted">진행률</span>
                    <span className="text-electric font-bold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/10" />
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                {badges.map((badge) => (
                    <button
                        key={badge.id}
                        onClick={() => setSelectedBadge(badge)}
                        className={`relative p-3 rounded-xl transition-all hover:scale-110 ${badge.earned
                                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40'
                                : 'bg-white/5 border border-white/10 opacity-50'
                            }`}
                    >
                        <div className="text-3xl text-center mb-1">
                            {badge.iconUrl || "🏆"}
                        </div>
                        {!badge.earned && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                                <Lock className="w-4 h-4 text-frost-muted" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Selected Badge Detail */}
            {selectedBadge && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className={`text-5xl p-3 rounded-xl ${selectedBadge.earned
                                ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30'
                                : 'bg-white/10'
                            }`}>
                            {selectedBadge.iconUrl || "🏆"}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-white">{selectedBadge.name}</h3>
                                {selectedBadge.earned && (
                                    <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                                        획득
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-frost-muted mb-2">{selectedBadge.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-yellow-400">
                                    <Star className="w-4 h-4" />
                                    {selectedBadge.points} 포인트
                                </span>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedBadge(null)} className="text-frost-muted">
                            닫기
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
