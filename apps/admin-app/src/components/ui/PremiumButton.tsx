// 🚀 Premium Gradient Button Component

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Gradients, Shadows } from '../../styles/colors';
import { Typography, BorderRadius, Spacing } from '../../styles/typography';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface PremiumButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    style?: ViewStyle;
}

export function PremiumButton({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    fullWidth = false,
    style,
}: PremiumButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    const sizeStyles = {
        sm: { paddingVertical: 8, paddingHorizontal: 16 },
        md: { paddingVertical: 14, paddingHorizontal: 24 },
        lg: { paddingVertical: 18, paddingHorizontal: 32 },
    };

    const textSizes = {
        sm: { fontSize: 13 },
        md: { fontSize: 15 },
        lg: { fontSize: 17 },
    };

    const isDisabled = disabled || loading;

    if (variant === 'primary' || variant === 'secondary') {
        const gradientColors = variant === 'primary'
            ? Gradients.primary
            : Gradients.secondary;

        return (
            <AnimatedTouchable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
                activeOpacity={0.9}
                style={[
                    animatedStyle,
                    fullWidth && styles.fullWidth,
                    isDisabled && styles.disabled,
                    style,
                ]}
            >
                <LinearGradient
                    colors={gradientColors as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.gradient,
                        sizeStyles[size],
                        Shadows.medium,
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <View style={styles.content}>
                            {icon && <View style={styles.icon}>{icon}</View>}
                            <Text style={[styles.text, textSizes[size]]}>{title}</Text>
                        </View>
                    )}
                </LinearGradient>
            </AnimatedTouchable>
        );
    }

    // Outline & Ghost variants
    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isDisabled}
            activeOpacity={0.7}
            style={[
                animatedStyle,
                styles.outlineButton,
                variant === 'outline' && styles.outlineBorder,
                sizeStyles[size],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color="#6366F1" size="small" />
            ) : (
                <View style={styles.content}>
                    {icon && <View style={styles.icon}>{icon}</View>}
                    <Text style={[styles.outlineText, textSizes[size]]}>{title}</Text>
                </View>
            )}
        </AnimatedTouchable>
    );
}

const styles = StyleSheet.create({
    gradient: {
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: Spacing.sm,
    },
    text: {
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    outlineButton: {
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlineBorder: {
        borderWidth: 1.5,
        borderColor: '#6366F1',
    },
    outlineText: {
        color: '#6366F1',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
});
