import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Check, CheckCheck, Heart, MessageSquare, UserPlus, Repeat } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Notification {
    id: number;
    type: string;
    title?: string;
    body?: string;
    isRead: boolean;
    createdAt: string;
    sender?: {
        displayName?: string;
        avatarUrl?: string;
    };
}

interface NotificationsListProps {
    memberId: number;
    onNotificationClick?: (notification: Notification) => void;
}

const NOTIFICATION_ICONS: Record<string, typeof Heart> = {
    like: Heart,
    comment: MessageSquare,
    follow: UserPlus,
    repost: Repeat,
};

export function NotificationsList({ memberId, onNotificationClick }: NotificationsListProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, [memberId]);

    const loadNotifications = async () => {
        try {
            const input = encodeURIComponent(JSON.stringify({ memberId, limit: 50 }));
            const res = await fetch(`/api/trpc/sns.notifications.list?input=${input}`);
            const data = await res.json();
            setNotifications(data.result?.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await fetch(`/api/trpc/sns.notifications.read?input=${encodeURIComponent(JSON.stringify({ notificationId }))}`);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
        } catch (e) {
            console.error(e);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetch(`/api/trpc/sns.notifications.readAll?input=${encodeURIComponent(JSON.stringify({ memberId }))}`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (e) {
            console.error(e);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-frost-muted">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-electric" />
                    <h3 className="font-bold text-white">알림</h3>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-electric text-midnight rounded-full font-bold">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs text-frost-muted">
                        <CheckCheck className="w-4 h-4 mr-1" />
                        모두 읽음
                    </Button>
                )}
            </div>

            {/* List */}
            {notifications.length === 0 ? (
                <div className="text-center py-12 text-frost-muted">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>알림이 없습니다</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {notifications.map((notification) => {
                        const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
                        return (
                            <div
                                key={notification.id}
                                onClick={() => {
                                    if (!notification.isRead) handleMarkAsRead(notification.id);
                                    onNotificationClick?.(notification);
                                }}
                                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${notification.isRead
                                        ? 'bg-white/5 hover:bg-white/10'
                                        : 'bg-electric/10 hover:bg-electric/20 border border-electric/20'
                                    }`}
                            >
                                <Avatar className="w-10 h-10 flex-shrink-0">
                                    <AvatarImage src={notification.sender?.avatarUrl} />
                                    <AvatarFallback className="bg-electric/20 text-electric">
                                        <Icon className="w-4 h-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-frost">
                                        <span className="font-medium">{notification.sender?.displayName || "사용자"}</span>
                                        <span className="text-frost-muted"> {notification.body}</span>
                                    </p>
                                    <p className="text-xs text-frost-muted mt-1">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ko })}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="w-2 h-2 bg-electric rounded-full flex-shrink-0 mt-2" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
