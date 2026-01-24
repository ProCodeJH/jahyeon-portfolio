import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { Plus } from "lucide-react";

interface Story {
    id: number;
    mediaUrl: string;
    mediaType: string;
    textOverlay?: string;
    createdAt: string;
}

interface UserStories {
    user: {
        memberId: number;
        displayName?: string;
        avatarUrl?: string;
    };
    stories: Story[];
}

interface StoriesBarProps {
    memberId: number;
    onCreateStory?: () => void;
}

export function StoriesBar({ memberId, onCreateStory }: StoriesBarProps) {
    const [userStories, setUserStories] = useState<UserStories[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingStories, setViewingStories] = useState<UserStories | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        loadStories();
    }, [memberId]);

    const loadStories = async () => {
        try {
            const input = encodeURIComponent(JSON.stringify({ memberId }));
            const res = await fetch(`/api/trpc/sns.stories.list?input=${input}`);
            const data = await res.json();
            setUserStories(data.result?.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleViewStory = async (us: UserStories) => {
        setViewingStories(us);
        setCurrentIndex(0);

        // Mark as viewed
        for (const story of us.stories) {
            try {
                await fetch(`/api/trpc/sns.stories.view?input=${encodeURIComponent(JSON.stringify({
                    storyId: story.id,
                    viewerId: memberId,
                }))}`);
            } catch (e) { }
        }
    };

    const handleNext = () => {
        if (viewingStories && currentIndex < viewingStories.stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setViewingStories(null);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-4 p-4 overflow-x-auto">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-16 h-16 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center gap-4 p-4 overflow-x-auto scrollbar-hide">
                {/* Add Story Button */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <button
                        onClick={onCreateStory}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-electric/20 to-accent-cyan/20 border-2 border-dashed border-electric/40 flex items-center justify-center hover:border-electric transition-all"
                    >
                        <Plus className="w-6 h-6 text-electric" />
                    </button>
                    <span className="text-xs text-frost-muted">내 스토리</span>
                </div>

                {/* User Stories */}
                {userStories.map((us) => (
                    <button
                        key={us.user.memberId}
                        onClick={() => handleViewStory(us)}
                        className="flex flex-col items-center gap-1 flex-shrink-0"
                    >
                        <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-pink-500 via-electric to-accent-cyan">
                            <Avatar className="w-full h-full border-2 border-midnight">
                                <AvatarImage src={us.user.avatarUrl} />
                                <AvatarFallback className="bg-midnight text-electric">
                                    {(us.user.displayName || "?").charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <span className="text-xs text-frost-muted truncate w-16 text-center">
                            {us.user.displayName}
                        </span>
                    </button>
                ))}

                {userStories.length === 0 && (
                    <p className="text-frost-muted text-sm">팔로우한 사람들의 스토리가 여기에 표시됩니다</p>
                )}
            </div>

            {/* Story Viewer Modal */}
            <Dialog open={!!viewingStories} onOpenChange={() => setViewingStories(null)}>
                <DialogContent className="max-w-sm p-0 bg-black border-none">
                    {viewingStories && viewingStories.stories[currentIndex] && (
                        <div className="relative h-[80vh]">
                            {/* Progress Bars */}
                            <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
                                {viewingStories.stories.map((_, i) => (
                                    <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-white transition-all duration-5000 ${i < currentIndex ? 'w-full' : i === currentIndex ? 'w-full animate-grow' : 'w-0'
                                                }`}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Header */}
                            <div className="absolute top-6 left-0 right-0 px-4 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={viewingStories.user.avatarUrl} />
                                        <AvatarFallback>{(viewingStories.user.displayName || "?").charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-white text-sm font-medium">
                                        {viewingStories.user.displayName}
                                    </span>
                                </div>
                                <button onClick={() => setViewingStories(null)} className="text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Story Content */}
                            <img
                                src={viewingStories.stories[currentIndex].mediaUrl}
                                alt="Story"
                                className="w-full h-full object-cover"
                            />

                            {/* Text Overlay */}
                            {viewingStories.stories[currentIndex].textOverlay && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-white text-xl font-bold text-center px-4 drop-shadow-lg">
                                        {viewingStories.stories[currentIndex].textOverlay}
                                    </p>
                                </div>
                            )}

                            {/* Navigation */}
                            <button
                                onClick={handlePrev}
                                className="absolute left-0 top-0 bottom-0 w-1/3"
                            />
                            <button
                                onClick={handleNext}
                                className="absolute right-0 top-0 bottom-0 w-2/3"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
