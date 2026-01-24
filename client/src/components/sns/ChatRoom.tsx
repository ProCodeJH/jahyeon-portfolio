import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Image, ArrowLeft, MoreVertical, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Message {
    id: number;
    senderId: number;
    content: string;
    messageType: string;
    mediaUrl?: string;
    createdAt: string;
    isDeleted?: boolean;
}

interface ChatRoomProps {
    conversationId: number;
    currentUserId: number;
    otherUser?: {
        displayName?: string;
        avatarUrl?: string;
    };
    onBack?: () => void;
}

export function ChatRoom({ conversationId, currentUserId, otherUser, onBack }: ChatRoomProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMessages();
        // Poll for new messages every 3 seconds
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            const input = encodeURIComponent(JSON.stringify({
                conversationId,
                memberId: currentUserId,
                limit: 100,
            }));
            const res = await fetch(`/api/trpc/sns.messages.list?input=${input}`);
            const data = await res.json();
            setMessages(data.result?.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const input = encodeURIComponent(JSON.stringify({
                conversationId,
                senderId: currentUserId,
                content: newMessage.trim(),
                messageType: "text",
            }));
            const res = await fetch(`/api/trpc/sns.messages.send?input=${input}`);
            const data = await res.json();

            if (data.result?.data) {
                setMessages(prev => [...prev, data.result.data]);
                setNewMessage("");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-midnight-card rounded-xl border border-white/10">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
                {onBack && (
                    <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                )}
                <Avatar className="w-10 h-10">
                    <AvatarImage src={otherUser?.avatarUrl} />
                    <AvatarFallback className="bg-electric/20 text-electric">
                        {(otherUser?.displayName || "?").charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-medium text-frost">{otherUser?.displayName || "대화"}</p>
                    <p className="text-xs text-frost-muted">온라인</p>
                </div>
                <Button variant="ghost" size="sm" className="p-2">
                    <MoreVertical className="w-5 h-5" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-electric" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-frost-muted">
                        대화를 시작해보세요!
                    </div>
                ) : (
                    messages.map((message) => {
                        const isMine = message.senderId === currentUserId;
                        return (
                            <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] ${isMine ? 'order-1' : 'order-2'}`}>
                                    <div
                                        className={`px-4 py-2 rounded-2xl ${isMine
                                                ? 'bg-electric text-midnight rounded-br-sm'
                                                : 'bg-white/10 text-frost rounded-bl-sm'
                                            }`}
                                    >
                                        {message.isDeleted ? (
                                            <span className="italic text-opacity-50">[삭제된 메시지]</span>
                                        ) : (
                                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                        )}
                                    </div>
                                    <p className={`text-xs text-frost-muted mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: ko })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="p-2 text-frost-muted">
                        <Image className="w-5 h-5" />
                    </Button>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 bg-white/5 border-white/10 text-frost"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                        className="bg-electric text-midnight"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
