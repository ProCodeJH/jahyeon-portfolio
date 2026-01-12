import { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { FileText, Eye, Edit, Trash2, Plus, Clock } from 'lucide-react-native';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
    viewCount: number;
    category?: { name: string };
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function BlogScreen() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { accessToken } = useAuthStore();

    const fetchPosts = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/blog/posts`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            setPosts(data.posts || data || []);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setIsLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPosts();
        setRefreshing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return '#10b981';
            case 'DRAFT': return '#6b7280';
            case 'PENDING': return '#f59e0b';
            case 'ARCHIVED': return '#ef4444';
            default: return '#8b5cf6';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return '발행됨';
            case 'DRAFT': return '초안';
            case 'PENDING': return '검토 중';
            case 'ARCHIVED': return '보관됨';
            default: return status;
        }
    };

    const handleDelete = (postId: string) => {
        Alert.alert(
            '게시글 삭제',
            '정말로 이 게시글을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await fetch(`${API_URL}/api/blog/posts/${postId}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${accessToken}` },
                            });
                            setPosts(posts.filter(p => p.id !== postId));
                        } catch (error) {
                            Alert.alert('오류', '게시글 삭제에 실패했습니다.');
                        }
                    },
                },
            ]
        );
    };

    const renderPost = ({ item }: { item: BlogPost }) => (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <View style={styles.postInfo}>
                    <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
                    {item.category && (
                        <Text style={styles.categoryText}>{item.category.name}</Text>
                    )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                </View>
            </View>

            <View style={styles.postMeta}>
                <View style={styles.metaItem}>
                    <Eye color="#666" size={14} />
                    <Text style={styles.metaText}>{item.viewCount} 조회</Text>
                </View>
                <View style={styles.metaItem}>
                    <Clock color="#666" size={14} />
                    <Text style={styles.metaText}>
                        {new Date(item.updatedAt).toLocaleDateString('ko-KR')}
                    </Text>
                </View>
            </View>

            <View style={styles.postActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => router.push(`/blog/edit/${item.id}`)}
                >
                    <Edit color="#fff" size={16} />
                    <Text style={styles.actionText}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item.id)}
                >
                    <Trash2 color="#fff" size={16} />
                    <Text style={styles.actionText}>삭제</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>블로그 관리</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/blog/new')}
                >
                    <Plus color="#fff" size={20} />
                    <Text style={styles.addButtonText}>새 글</Text>
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{posts.length}</Text>
                    <Text style={styles.statLabel}>전체</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: '#10b981' }]}>
                        {posts.filter(p => p.status === 'PUBLISHED').length}
                    </Text>
                    <Text style={styles.statLabel}>발행됨</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: '#6b7280' }]}>
                        {posts.filter(p => p.status === 'DRAFT').length}
                    </Text>
                    <Text style={styles.statLabel}>초안</Text>
                </View>
            </View>

            {/* Posts List */}
            <FlatList
                data={posts}
                renderItem={renderPost}
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
                        <FileText color="#333" size={48} />
                        <Text style={styles.emptyText}>게시글이 없습니다</Text>
                        <Text style={styles.emptySubtext}>새 글을 작성해보세요</Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statNumber: {
        color: '#8b5cf6',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    postCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    postInfo: {
        flex: 1,
        marginRight: 12,
    },
    postTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    categoryText: {
        color: '#8b5cf6',
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    postMeta: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: '#666',
        fontSize: 12,
    },
    postActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 4,
    },
    editButton: {
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
    },
    deleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
    },
    actionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
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
    emptySubtext: {
        color: '#444',
        fontSize: 14,
        marginTop: 4,
    },
});
