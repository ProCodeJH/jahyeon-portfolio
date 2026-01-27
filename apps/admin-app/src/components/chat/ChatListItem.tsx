// 💬 Chat List Item Component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    FadeInRight,
} from 'react-native-reanimated';
import { ChatRoom } from '../../lib/firebase';
import { Colors, Shadows } from '../../styles/colors';
import { Typography, Spacing, BorderRadius } from '../../styles/typography';
import { useThemeStore } from '../../lib/store';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ChatListItemProps {
    room: ChatRoom;
    onPress: () => void;
    index: number;
}

export function ChatListItem({ room, onPress, index }: ChatListItemProps) {
    const { mode } = useThemeStore();
    const isDark = mode === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    // Format time
    const formatTime = (timestamp?: number) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return '방금 전';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}일 전`;

        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    };

    // Get visitor avatar initials
    const getInitials = (id: string) => {
        return id.slice(0, 2).toUpperCase();
    };

    const hasUnread = (room.unreadCount || 0) > 0;

    return (
        <AnimatedTouchable
            entering={FadeInRight.delay(index * 50).springify()}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
            style={[
                animatedStyle,
                styles.container,
                {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                },
            ]}
        >
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: Colors.primary.start }]}>
                <Text style={styles.avatarText}>{getInitials(room.visitorId)}</Text>
                {/* Online indicator */}
                {room.status === 'open' && (
                    <View style={[styles.statusDot, { backgroundColor: Colors.status.online }]} />
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text
                        style={[styles.name, { color: colors.text }]}
                        numberOfLines={1}
                    >
                        방문자 {room.visitorId.slice(0, 8)}
                    </Text>
                    <Text style={[styles.time, { color: colors.textMuted }]}>
                        {formatTime(room.lastMessageAt || room.createdAt)}
                    </Text>
                </View>

                <View style={styles.messageRow}>
                    <Text
                        style={[
                            styles.lastMessage,
                            { color: hasUnread ? colors.text : colors.textSecondary },
                            hasUnread && styles.unreadText,
                        ]}
                        numberOfLines={1}
                    >
                        {room.visitorTyping ? (
                            <Text style={{ color: Colors.accent.cyan }}>입력 중...</Text>
                        ) : (
                            room.lastMessage || '새 대화가 시작되었습니다'
                        )}
                    </Text>

                    {/* Unread Badge */}
                    {hasUnread && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {room.unreadCount! > 99 ? '99+' : room.unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </AnimatedTouchable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginHorizontal: Spacing.md,
        marginVertical: Spacing.xs,
        borderWidth: 1,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    statusDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: Colors.dark.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: Spacing.sm,
    },
    time: {
        fontSize: 12,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
        marginRight: Spacing.sm,
    },
    unreadText: {
        fontWeight: '500',
    },
    badge: {
        backgroundColor: Colors.primary.start,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        minWidth: 24,
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
});
