import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ThumbsUp, Laugh, Frown, Angry } from "lucide-react";
import { toast } from "sonner";

const REACTIONS = [
    { type: "like", emoji: "👍", icon: ThumbsUp, label: "좋아요" },
    { type: "love", emoji: "❤️", icon: Heart, label: "사랑해요" },
    { type: "haha", emoji: "😂", icon: Laugh, label: "웃겨요" },
    { type: "wow", emoji: "😮", label: "놀라워요" },
    { type: "sad", emoji: "😢", icon: Frown, label: "슬퍼요" },
    { type: "angry", emoji: "😡", icon: Angry, label: "화나요" },
];

interface ReactionButtonProps {
    postId: number;
    memberId: number;
    currentReaction?: string | null;
    reactionCounts?: Record<string, number>;
    onReact?: (reaction: string | null) => void;
}

export function ReactionButton({ postId, memberId, currentReaction, reactionCounts = {}, onReact }: ReactionButtonProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [selected, setSelected] = useState<string | null>(currentReaction || null);
    const [loading, setLoading] = useState(false);

    const handleReact = async (reactionType: string) => {
        setLoading(true);
        setShowPicker(false);
        try {
            const input = encodeURIComponent(JSON.stringify({
                postId,
                memberId,
                reactionType,
            }));
            const res = await fetch(`/api/trpc/sns.reaction.toggle?input=${input}`);
            const data = await res.json();

            if (data.result?.data) {
                const newType = data.result.data.reacted ? data.result.data.type : null;
                setSelected(newType);
                onReact?.(newType);
            }
        } catch (e) {
            toast.error("오류가 발생했습니다");
        } finally {
            setLoading(false);
        }
    };

    const totalCount = Object.values(reactionCounts).reduce((a, b) => a + b, 0);
    const selectedReaction = REACTIONS.find(r => r.type === selected);

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPicker(!showPicker)}
                onMouseEnter={() => setShowPicker(true)}
                className={`transition-all ${selected ? 'text-pink-500' : 'text-frost-muted hover:text-frost'}`}
            >
                <span className="text-lg mr-1">{selectedReaction?.emoji || "👍"}</span>
                {totalCount > 0 && <span className="text-sm">{totalCount}</span>}
            </Button>

            {showPicker && (
                <div
                    className="absolute bottom-full left-0 mb-2 flex gap-1 p-2 bg-midnight-card rounded-full border border-white/10 shadow-xl z-50"
                    onMouseLeave={() => setShowPicker(false)}
                >
                    {REACTIONS.map((reaction) => (
                        <button
                            key={reaction.type}
                            onClick={() => handleReact(reaction.type)}
                            className={`text-2xl hover:scale-125 transition-transform p-1 ${selected === reaction.type ? 'bg-white/10 rounded-full' : ''
                                }`}
                            title={reaction.label}
                        >
                            {reaction.emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
