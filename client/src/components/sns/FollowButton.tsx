import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
    currentUserId: number;
    targetUserId: number;
    initialFollowing?: boolean;
    onToggle?: (following: boolean) => void;
    size?: "sm" | "default";
}

export function FollowButton({ currentUserId, targetUserId, initialFollowing = false, onToggle, size = "default" }: FollowButtonProps) {
    const [following, setFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        if (currentUserId === targetUserId) return;

        setLoading(true);
        try {
            const input = encodeURIComponent(JSON.stringify({
                followerId: currentUserId,
                followingId: targetUserId,
            }));
            const res = await fetch(`/api/trpc/sns.follow.toggle?input=${input}`);
            const data = await res.json();

            if (data.result?.data) {
                const newState = data.result.data.following;
                setFollowing(newState);
                onToggle?.(newState);
                toast.success(newState ? "팔로우했습니다!" : "언팔로우했습니다");
            }
        } catch (e) {
            toast.error("오류가 발생했습니다");
        } finally {
            setLoading(false);
        }
    };

    if (currentUserId === targetUserId) return null;

    const sizeClasses = size === "sm"
        ? "px-3 py-1 text-xs"
        : "px-4 py-2 text-sm";

    return (
        <Button
            onClick={handleToggle}
            disabled={loading}
            className={`${sizeClasses} font-medium transition-all ${following
                    ? "bg-white/10 hover:bg-red-500/20 text-frost-muted hover:text-red-400 border border-white/10"
                    : "bg-electric hover:bg-electric/80 text-midnight"
                }`}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : following ? (
                <>
                    <UserMinus className="w-4 h-4 mr-1" />
                    팔로잉
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    팔로우
                </>
            )}
        </Button>
    );
}
