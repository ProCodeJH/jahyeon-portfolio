// ⌨️ Message Input Component

import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../styles/colors';
import { Spacing, BorderRadius } from '../../styles/typography';
import { useThemeStore, useChatStore } from '../../lib/store';

// Send Icon SVG as component
function SendIcon({ color = '#FFFFFF' }: { color?: string }) {
    return (
        <View style={styles.sendIconContainer}>
            <View style={[styles.sendArrow, { borderLeftColor: color }]} />
        </View>
    );
}

interface MessageInputProps {
    onSend: (message: string) => Promise<void>;
    onTyping?: (isTyping: boolean) => void;
    onQuickReplyPress?: () => void;
    disabled?: boolean;
}

export function MessageInput({ onSend, onTyping, disabled }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const { mode } = useThemeStore();
    const isDark = mode === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    const buttonScale = useSharedValue(1);

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const handleSend = async () => {
        if (!message.trim() || isSending || disabled) return;

        const trimmedMessage = message.trim();
        setMessage('');
        setIsSending(true);

        buttonScale.value = withSpring(0.9, { damping: 10 });

        try {
            await onSend(trimmedMessage);
            onTyping?.(false);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessage(trimmedMessage); // Restore on error
        } finally {
            setIsSending(false);
            buttonScale.value = withSpring(1, { damping: 10 });
        }
    };

    const handleTextChange = (text: string) => {
        setMessage(text);
        onTyping?.(text.length > 0);
    };

    const canSend = message.trim().length > 0 && !isSending && !disabled;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={[
                styles.container,
                {
                    backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface,
                    borderTopColor: colors.border,
                },
            ]}>
                <View style={[
                    styles.inputContainer,
                    {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    },
                ]}>
                    <TextInput
                        ref={inputRef}
                        style={[styles.input, { color: colors.text }]}
                        value={message}
                        onChangeText={handleTextChange}
                        placeholder="메시지를 입력하세요..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                        maxLength={1000}
                        editable={!disabled}
                    />
                </View>

                <Animated.View style={buttonAnimatedStyle}>
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!canSend}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={canSend ? Gradients.primary as [string, string] : ['#6B7280', '#6B7280']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
                        >
                            {isSending ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <SendIcon />
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
    },
    inputContainer: {
        flex: 1,
        marginRight: Spacing.sm,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
        minHeight: 48,
        maxHeight: 120,
    },
    input: {
        fontSize: 15,
        lineHeight: 20,
        maxHeight: 100,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendIconContainer: {
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 12,
        borderTopWidth: 8,
        borderBottomWidth: 8,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: '#FFFFFF',
        marginLeft: 4,
    },
});
