import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Plus, Loader2, ChevronLeft } from "lucide-react";
import { ChatRoom } from "./ChatRoom";

interface Conversation {
    id: number;
    type: string;
    name?: string;
    unreadCount: number;
    lastMessage?: {
        content: string;
        createdAt: string;
    };
    otherMembers: Array<{
        memberId: number;
        displayName?: string;
        avatarUrl?: string;
    }>;
}

interface DMInboxProps {
    memberId: number;
}

export function DMInbox({ memberId }: DMInboxProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadConversations();
        const interval = setInterval(loadConversations, 10000);
        return () => clearInterval(interval);
    }, [memberId]);

    const loadConversations = async () => {
        try {
            const input = encodeURIComponent(JSON.stringify({ memberId }));
            const res = await fetch(`/api/trpc/sns.conversations.list?input=${input}`);
            const data = await res.json();
            setConversations(data.result?.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateStr?: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 86400000) {
            return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
        }
        return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
    };

    const filteredConvos = conversations.filter(c => {
        if (!search) return true;
        const names = c.otherMembers.map(m => m.displayName || "").join(" ");
        return names.toLowerCase().includes(search.toLowerCase());
    });

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

    if (selectedConvo) {
        const otherUser = selectedConvo.otherMembers[0];
        return (
            <ChatRoom
                conversationId={selectedConvo.id}
                currentUserId={memberId}
                otherUser={otherUser}
                onBack={() => setSelectedConvo(null)}
            />
        );
    }

    return (
        <div className="h-full flex flex-col bg-midnight-card rounded-xl border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-electric" />
                    <h2 className="font-bold text-white">메시지</h2>
                    {totalUnread > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-electric text-midnight rounded-full font-bold">
                            {totalUnread}
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="sm" className="text-electric">
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-white/10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-frost-muted" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="대화 검색..."
                        className="pl-10 bg-white/5 border-white/10 text-frost"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-electric" />
                    </div>
                ) : filteredConvos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-frost-muted">
                        <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
                        <p>대화가 없습니다</p>
                    </div>
                ) : (
                    filteredConvos.map((convo) => {
                        const other = convo.otherMembers[0];
                        return (
                            <button
                                key={convo.id}
                                onClick={() => setSelectedConvo(convo)}
                                className={`w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-all text-left ${convo.unreadCount > 0 ? 'bg-electric/5' : ''
                                    }`}
                            >
                                <Avatar className="w-12 h-12 flex-shrink-0">
                                    <AvatarImage src={other?.avatarUrl} />
                                    <AvatarFallback className="bg-electric/20 text-electric">
                                        {(other?.displayName || "?").charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className={`font-medium truncate ${convo.unreadCount > 0 ? 'text-white' : 'text-frost'}`}>
                                            {other?.displayName || "대화"}
                                        </p>
                                        <span className="text-xs text-frost-muted flex-shrink-0 ml-2">
                                            {formatTime(convo.lastMessage?.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className={`text-sm truncate ${convo.unreadCount > 0 ? 'text-frost font-medium' : 'text-frost-muted'}`}>
                                            {convo.lastMessage?.content || "대화 시작하기"}
                                        </p>
                                        {convo.unreadCount > 0 && (
                                            <span className="px-2 py-0.5 text-xs bg-electric text-midnight rounded-full font-bold flex-shrink-0 ml-2">
                                                {convo.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
