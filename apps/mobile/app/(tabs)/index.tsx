import { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { MessageCircle, Clock } from 'lucide-react-native';

interface Chat {
    id: string;
    status: string;
    visitor: { name?: string; email?: string };
    messages: { content: string; createdAt: string }[];
    updatedAt: string;
}

export default function ChatsScreen() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const { accessToken } = useAuthStore();

    const fetchChats = async () => {
        try {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/api/chats`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            const data = await res.json();
            setChats(data.chats || []);
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchChats();
        setRefreshing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'WAITING': return '#f59e0b';
            case 'ACTIVE': return '#10b981';
            case 'CLOSED': return '#6b7280';
            default: return '#8b5cf6';
        }
    };

    const renderChat = ({ item }: { item: Chat }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push(`/chat/${item.id}`)}
        >
            <View style={styles.avatar}>
                <MessageCircle color="#8b5cf6" size={24} />
            </View>

            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.visitorName}>
                        {item.visitor.name || item.visitor.email || 'Anonymous'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>

                {item.messages[0] && (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.messages[0].content}
                    </Text>
                )}

                <View style={styles.timeRow}>
                    <Clock color="#666" size={12} />
                    <Text style={styles.timeText}>
                        {new Date(item.updatedAt).toLocaleString()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={chats}
                renderItem={renderChat}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#8b5cf6"
                    />
                }
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MessageCircle color="#333" size={48} />
                        <Text style={styles.emptyText}>No chats yet</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a1a',
    },
    listContent: {
        padding: 16,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    chatContent: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    visitorName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    lastMessage: {
        color: '#888',
        fontSize: 14,
        marginBottom: 4,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        color: '#666',
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        marginTop: 16,
    },
});
