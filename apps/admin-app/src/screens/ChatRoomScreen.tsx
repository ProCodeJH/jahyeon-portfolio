// 💬 Chat Room Screen

import React, { useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInLeft, FadeIn } from 'react-native-reanimated';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import {
    subscribeToMessages,
    sendAdminMessage,
    markMessagesAsRead,
    setAdminTyping,
    ChatMessage,
} from '../lib/firebase';
import { useChatStore, useThemeStore } from '../lib/store';
import { ChatBubble } from '../components/chat/ChatBubble';
import { MessageInput } from '../components/chat/MessageInput';
import { Colors, Gradients } from '../styles/colors';
import { Typography, Spacing, BorderRadius } from '../styles/typography';

type RootStackParamList = {
    ChatRoom: { roomId: string; roomName: string };
};

export function ChatRoomScreen() {
    const route = useRoute<RouteProp<RootStackParamList, 'ChatRoom'>>();
    const navigation = useNavigation();
    const { roomId, roomName } = route.params;

    const { messages, setMessages, setCurrentRoom, rooms } = useChatStore();
    const { mode } = useThemeStore();
    const isDark = mode === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    const [loading, setLoading] = React.useState(true);
    const flatListRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    // Find current room
    const currentRoom = rooms.find(r => r.id === roomId);

    useEffect(() => {
        // Subscribe to messages
        const unsubscribe = subscribeToMessages(roomId, (msgs) => {
            setMessages(msgs);
            setLoading(false);

            // Mark as read
            markMessagesAsRead(roomId).catch(console.error);
        });

        return () => {
            unsubscribe();
            setMessages([]);
            setCurrentRoom(null);
        };
    }, [roomId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    const handleSend = async (content: string) => {
        await sendAdminMessage(roomId, content);
    };

    const handleTyping = useCallback((isTyping: boolean) => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (isTyping) {
            setAdminTyping(roomId, true).catch(console.error);

            typingTimeoutRef.current = setTimeout(() => {
                setAdminTyping(roomId, false).catch(console.error);
            }, 3000);
        } else {
            setAdminTyping(roomId, false).catch(console.error);
        }
    }, [roomId]);

    const formatVisitorId = (id: string) => {
        return `방문자 ${id.slice(0, 8)}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={Gradients.night as [string, string]}
                style={styles.header}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <View style={styles.backArrow} />
                </TouchableOpacity>

                <Animated.View
                    entering={FadeInLeft.springify()}
                    style={styles.headerContent}
                >
                    {/* Avatar */}
                    <LinearGradient
                        colors={Gradients.primary as [string, string]}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarText}>
                            {roomName.slice(0, 2).toUpperCase()}
                        </Text>
                    </LinearGradient>

                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {formatVisitorId(roomName)}
                        </Text>
                        <View style={styles.statusRow}>
                            <View style={[
                                styles.statusDot,
                                {
                                    backgroundColor: currentRoom?.status === 'open'
                                        ? Colors.status.online
                                        : Colors.status.offline
                                },
                            ]} />
                            <Text style={styles.statusText}>
                                {currentRoom?.visitorTyping
                                    ? '입력 중...'
                                    : currentRoom?.status === 'open'
                                        ? '온라인'
                                        : '오프라인'
                                }
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>

            {/* Messages */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary.start} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <ChatBubble message={item} index={index} />
                    )}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Animated.View
                            entering={FadeIn.delay(300)}
                            style={styles.emptyContainer}
                        >
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                아직 메시지가 없습니다
                            </Text>
                        </Animated.View>
                    }
                />
            )}

            {/* Input */}
            <MessageInput
                onSend={handleSend}
                onTyping={handleTyping}
                disabled={loading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backArrow: {
        width: 12,
        height: 12,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderColor: '#FFFFFF',
        transform: [{ rotate: '45deg' }],
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
    },
    messageList: {
        paddingVertical: Spacing.md,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing['4xl'],
    },
    emptyText: {
        fontSize: 15,
    },
});
