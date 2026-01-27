// 💬 Quick Reply Modal Component
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    Pressable,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { QuickReply, loadQuickReplies, incrementUsageCount } from '../../lib/quickReplies';
import { useThemeStore } from '../../lib/store';
import { Colors, Gradients } from '../../styles/colors';

interface QuickReplyModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (content: string) => void;
}

export const QuickReplyModal: React.FC<QuickReplyModalProps> = ({
    visible,
    onClose,
    onSelect,
}) => {
    const { mode } = useThemeStore();
    const isDark = mode === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;
    const [replies, setReplies] = useState<QuickReply[]>([]);

    useEffect(() => {
        if (visible) {
            loadQuickReplies().then(setReplies);
        }
    }, [visible]);

    const handleSelect = async (reply: QuickReply) => {
        await incrementUsageCount(reply.id);
        onSelect(reply.content);
        onClose();
    };

    const renderItem = ({ item, index }: { item: QuickReply; index: number }) => (
        <Animated.View entering={FadeIn.delay(index * 50)}>
            <TouchableOpacity
                style={[styles.replyItem, { backgroundColor: Colors.glass.background }]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
            >
                <View style={styles.replyContent}>
                    <View style={styles.replyHeader}>
                        <Text style={styles.replyEmoji}>{item.emoji || '💬'}</Text>
                        <Text style={[styles.replyTitle, { color: Colors.primary.start }]}>
                            {item.title}
                        </Text>
                        {item.usageCount > 0 && (
                            <View style={[styles.usageBadge, { backgroundColor: Colors.primary.start + '30' }]}>
                                <Text style={[styles.usageText, { color: Colors.primary.start }]}>
                                    {item.usageCount}회
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.replyText, { color: theme.textSecondary }]} numberOfLines={2}>
                        {item.content}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Animated.View
                    entering={SlideInDown.springify().damping(20)}
                    exiting={FadeOut}
                    style={[styles.container, { backgroundColor: theme.surface }]}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <LinearGradient
                            colors={Gradients.primary as [string, string]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.header}
                        >
                            <Text style={styles.headerTitle}>⚡ 빠른 답장</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Text style={styles.closeText}>✕</Text>
                            </TouchableOpacity>
                        </LinearGradient>

                        {/* Reply List */}
                        <FlatList
                            data={replies}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            style={styles.list}
                        />
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    list: {
        flexGrow: 0,
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    replyItem: {
        borderRadius: 16,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    replyContent: {
        flex: 1,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    replyEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    replyTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    usageBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    usageText: {
        fontSize: 11,
        fontWeight: '600',
    },
    replyText: {
        fontSize: 14,
        lineHeight: 20,
    },
});
