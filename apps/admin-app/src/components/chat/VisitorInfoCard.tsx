// 👤 Visitor Info Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useThemeStore } from '../../lib/store';
import { Colors } from '../../styles/colors';

interface VisitorInfo {
    visitorId: string;
    browser?: string;
    os?: string;
    device?: string;
    location?: string;
    referrer?: string;
    currentPage?: string;
    createdAt: number;
}

interface VisitorInfoCardProps {
    info: VisitorInfo;
}

export const VisitorInfoCard: React.FC<VisitorInfoCardProps> = ({ info }) => {
    const { mode } = useThemeStore();
    const isDark = mode === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getDeviceEmoji = (device?: string) => {
        if (!device) return '💻';
        const lower = device.toLowerCase();
        if (lower.includes('mobile') || lower.includes('phone')) return '📱';
        if (lower.includes('tablet') || lower.includes('ipad')) return '📲';
        return '💻';
    };

    const getBrowserEmoji = (browser?: string) => {
        if (!browser) return '🌐';
        const lower = browser.toLowerCase();
        if (lower.includes('chrome')) return '🔵';
        if (lower.includes('safari')) return '🧭';
        if (lower.includes('firefox')) return '🦊';
        if (lower.includes('edge')) return '🌊';
        return '🌐';
    };

    const InfoRow = ({ emoji, label, value }: { emoji: string; label: string; value?: string }) => {
        if (!value) return null;
        return (
            <View style={styles.infoRow}>
                <Text style={styles.emoji}>{emoji}</Text>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
                <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
                    {value}
                </Text>
            </View>
        );
    };

    return (
        <Animated.View
            entering={FadeIn}
            style={[styles.container, { backgroundColor: Colors.glass.background }]}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: Colors.primary.start }]}>
                    👤 방문자 정보
                </Text>
            </View>

            <View style={styles.content}>
                <InfoRow
                    emoji="🆔"
                    label="ID"
                    value={info.visitorId.substring(0, 12) + '...'}
                />
                <InfoRow
                    emoji={getDeviceEmoji(info.device)}
                    label="기기"
                    value={info.device || '알 수 없음'}
                />
                <InfoRow
                    emoji={getBrowserEmoji(info.browser)}
                    label="브라우저"
                    value={info.browser}
                />
                <InfoRow
                    emoji="🖥️"
                    label="OS"
                    value={info.os}
                />
                <InfoRow
                    emoji="📍"
                    label="위치"
                    value={info.location}
                />
                <InfoRow
                    emoji="🔗"
                    label="유입 경로"
                    value={info.referrer}
                />
                <InfoRow
                    emoji="📄"
                    label="현재 페이지"
                    value={info.currentPage}
                />
                <InfoRow
                    emoji="📅"
                    label="방문 시간"
                    value={formatDate(info.createdAt)}
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        margin: 16,
        marginBottom: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        padding: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    emoji: {
        fontSize: 12,
        marginRight: 8,
        width: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 12,
        width: 70,
    },
    value: {
        fontSize: 12,
        flex: 1,
        fontWeight: '500',
    },
});
