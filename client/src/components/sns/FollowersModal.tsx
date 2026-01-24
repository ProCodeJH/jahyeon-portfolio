import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FollowButton } from "./FollowButton";
import { Loader2, Users } from "lucide-react";

interface User {
    id: number;
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    bio?: string;
    followedAt?: string;
}

interface FollowersModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberId: number;
    currentUserId?: number;
    initialTab?: "followers" | "following";
}

export function FollowersModal({ isOpen, onClose, memberId, currentUserId, initialTab = "followers" }: FollowersModalProps) {
    const [followers, setFollowers] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen, memberId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [followersRes, followingRes] = await Promise.all([
                fetch(`/api/trpc/sns.followers.list?input=${encodeURIComponent(JSON.stringify({ memberId }))}`),
                fetch(`/api/trpc/sns.following.list?input=${encodeURIComponent(JSON.stringify({ memberId }))}`),
            ]);

            const followersData = await followersRes.json();
            const followingData = await followingRes.json();

            setFollowers(followersData.result?.data || []);
            setFollowing(followingData.result?.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const renderUserList = (users: User[]) => {
        if (users.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-frost-muted">
                    <Users className="w-12 h-12 mb-3 opacity-50" />
                    <p>아직 없습니다</p>
                </div>
            );
        }

        return (
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback className="bg-electric/20 text-electric">
                                    {(user.displayName || user.name || "?").charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-frost">{user.displayName || user.name}</p>
                                {user.bio && <p className="text-xs text-frost-muted line-clamp-1">{user.bio}</p>}
                            </div>
                        </div>
                        {currentUserId && (
                            <FollowButton
                                currentUserId={currentUserId}
                                targetUserId={user.id}
                                size="sm"
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-midnight-card border-white/10 text-frost max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">팔로워/팔로잉</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-electric" />
                    </div>
                ) : (
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "followers" | "following")}>
                        <TabsList className="grid w-full grid-cols-2 bg-white/5">
                            <TabsTrigger value="followers" className="data-[state=active]:bg-electric data-[state=active]:text-midnight">
                                팔로워 ({followers.length})
                            </TabsTrigger>
                            <TabsTrigger value="following" className="data-[state=active]:bg-electric data-[state=active]:text-midnight">
                                팔로잉 ({following.length})
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="followers" className="mt-4">
                            {renderUserList(followers)}
                        </TabsContent>
                        <TabsContent value="following" className="mt-4">
                            {renderUserList(following)}
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
}
