// 💬 Chat Message Bubble Component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatMessage } from '../../lib/firebase';
import { Colors, Gradients } from '../../styles/colors';
import { Spacing, BorderRadius } from '../../styles/typography';
import { useThemeStore } from '../../lib/store';

interface ChatBubbleProps {
    message: ChatMessage;
    index: number;
}

export function ChatBubble({ message, index }: ChatBubbleProps) {
    const { mode } = useThemeStore();
    const isDark = mode === 'dark';

    const isAdmin = message.senderType === 'ADMIN';
    const isSystem = message.senderType === 'SYSTEM';

    // Format time
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    // System message
    if (isSystem) {
        return (
            <Animated.View
                entering={FadeInUp.delay(index * 30).springify()}
                style={styles.systemContainer}
            >
                <View style={[
                    styles.systemBubble,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                ]}>
                    <Text style={[
                        styles.systemText,
                        { color: isDark ? Colors.dark.textMuted : Colors.light.textMuted },
                    ]}>
                        {message.content}
                    </Text>
                </View>
            </Animated.View>
        );
    }

    // Admin message (right side, gradient)
    if (isAdmin) {
        return (
            <Animated.View
                entering={FadeInUp.delay(index * 30).springify()}
                style={[styles.container, styles.adminContainer]}
            >
                <View style={styles.bubbleWrapper}>
                    <LinearGradient
                        colors={Gradients.primary as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.bubble, styles.adminBubble]}
                    >
                        <Text style={styles.adminText}>{message.content}</Text>
                    </LinearGradient>
                    <Text style={[
                        styles.time,
                        styles.adminTime,
                        { color: isDark ? Colors.dark.textMuted : Colors.light.textMuted },
                    ]}>
                        {formatTime(message.createdAt as number)}
                    </Text>
                </View>
            </Animated.View>
        );
    }

    // Visitor message (left side)
    return (
        <Animated.View
            entering={FadeInUp.delay(index * 30).springify()}
            style={[styles.container, styles.visitorContainer]}
        >
            <View style={styles.bubbleWrapper}>
                <View style={[
                    styles.bubble,
                    styles.visitorBubble,
                    {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    },
                ]}>
                    <Text style={[
                        styles.visitorText,
                        { color: isDark ? Colors.dark.text : Colors.light.text },
                    ]}>
                        {message.content}
                    </Text>
                </View>
                <Text style={[
                    styles.time,
                    styles.visitorTime,
                    { color: isDark ? Colors.dark.textMuted : Colors.light.textMuted },
                ]}>
                    {formatTime(message.createdAt as number)}
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.md,
        marginVertical: Spacing.xs,
    },
    adminContainer: {
        alignItems: 'flex-end',
    },
    visitorContainer: {
        alignItems: 'flex-start',
    },
    bubbleWrapper: {
        maxWidth: '80%',
    },
    bubble: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    adminBubble: {
        borderRadius: BorderRadius.xl,
        borderBottomRightRadius: BorderRadius.sm,
    },
    visitorBubble: {
        borderRadius: BorderRadius.xl,
        borderBottomLeftRadius: BorderRadius.sm,
    },
    adminText: {
        color: '#FFFFFF',
        fontSize: 15,
        lineHeight: 22,
    },
    visitorText: {
        fontSize: 15,
        lineHeight: 22,
    },
    time: {
        fontSize: 11,
        marginTop: Spacing.xs,
    },
    adminTime: {
        textAlign: 'right',
        marginRight: Spacing.xs,
    },
    visitorTime: {
        textAlign: 'left',
        marginLeft: Spacing.xs,
    },
    systemContainer: {
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        marginVertical: Spacing.md,
    },
    systemBubble: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
    systemText: {
        fontSize: 12,
        textAlign: 'center',
    },
});
