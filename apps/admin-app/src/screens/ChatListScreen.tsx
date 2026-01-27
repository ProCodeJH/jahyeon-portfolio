// 📋 Chat List Screen

import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { subscribeToChatRooms, ChatRoom } from '../lib/firebase';
import { useChatStore, useThemeStore } from '../lib/store';
import { ChatListItem } from '../components/chat/ChatListItem';
import { Colors, Gradients } from '../styles/colors';
import { Typography, Spacing } from '../styles/typography';

export function ChatListScreen() {
    const navigation = useNavigation();
    const { rooms, setRooms, totalUnread } = useChatStore();
    const { mode } = useThemeStore();
    const isDark = mode === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToChatRooms((chatRooms) => {
            setRooms(chatRooms);
            setLoading(false);
            setRefreshing(false);
        });

        return () => unsubscribe();
    }, []);

    const handleRoomPress = (room: ChatRoom) => {
        navigation.navigate('ChatRoom' as never, { roomId: room.id, roomName: room.visitorId } as never);
    };

    const onRefresh = () => {
        setRefreshing(true);
        // Firebase subscription will auto-update
        setTimeout(() => setRefreshing(false), 1000);
    };

    const renderEmptyState = () => (
        <Animated.View
            entering={FadeIn.delay(300)}
            style={styles.emptyContainer}
        >
            <View style={styles.emptyIcon}>
                <Text style={styles.emptyEmoji}>💬</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
                아직 대화가 없습니다
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                웹사이트에서 방문자가 채팅을 시작하면{'\n'}
                여기에 표시됩니다
            </Text>
        </Animated.View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary.start} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={Gradients.night as [string, string]}
                style={styles.header}
            >
                <Animated.View entering={FadeInDown.springify()}>
                    <Text style={styles.headerTitle}>채팅</Text>
                    {totalUnread > 0 && (
                        <View style={styles.badgeContainer}>
                            <LinearGradient
                                colors={Gradients.primary as [string, string]}
                                style={styles.headerBadge}
                            >
                                <Text style={styles.headerBadgeText}>
                                    {totalUnread > 99 ? '99+' : totalUnread} 새 메시지
                                </Text>
                            </LinearGradient>
                        </View>
                    )}
                </Animated.View>
            </LinearGradient>

            {/* Chat List */}
            <FlatList
                data={rooms}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <ChatListItem
                        room={item}
                        onPress={() => handleRoomPress(item)}
                        index={index}
                    />
                )}
                contentContainerStyle={[
                    styles.list,
                    rooms.length === 0 && styles.emptyList,
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary.start}
                        colors={[Colors.primary.start]}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: Spacing.xl,
        paddingHorizontal: Spacing.xl,
    },
    headerTitle: {
        ...Typography.h2,
        color: '#FFFFFF',
    },
    badgeContainer: {
        marginTop: Spacing.sm,
        alignSelf: 'flex-start',
    },
    headerBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: 20,
    },
    headerBadgeText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    list: {
        paddingTop: Spacing.md,
        paddingBottom: Spacing['4xl'],
    },
    emptyList: {
        flex: 1,
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
        paddingHorizontal: Spacing['2xl'],
    },
    emptyIcon: {
        marginBottom: Spacing.xl,
    },
    emptyEmoji: {
        fontSize: 64,
    },
    emptyTitle: {
        ...Typography.h3,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    emptySubtitle: {
        ...Typography.body,
        textAlign: 'center',
        lineHeight: 24,
    },
});
