// ✨ Premium Glass Card Component with Glassmorphism Effect

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/typography';
import { useThemeStore } from '../../lib/store';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: keyof typeof Spacing;
    borderRadius?: keyof typeof BorderRadius;
}

export function GlassCard({
    children,
    style,
    variant = 'default',
    padding = 'lg',
    borderRadius = 'xl',
}: GlassCardProps) {
    const { mode } = useThemeStore();
    const isDark = mode === 'dark';

    const containerStyle: ViewStyle[] = [
        styles.container,
        {
            padding: Spacing[padding],
            borderRadius: BorderRadius[borderRadius],
        },
        isDark ? styles.darkCard : styles.lightCard,
        variant === 'elevated' && (isDark ? styles.darkElevated : styles.lightElevated),
        variant === 'outlined' && (isDark ? styles.darkOutlined : styles.lightOutlined),
        Shadows.medium,
        style,
    ];

    if (isDark) {
        return (
            <View style={containerStyle}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: BorderRadius[borderRadius] }]}
                />
                {children}
            </View>
        );
    }

    return (
        <View style={containerStyle}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        position: 'relative',
    },
    darkCard: {
        backgroundColor: 'rgba(26, 26, 46, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    lightCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    darkElevated: {
        backgroundColor: 'rgba(37, 37, 66, 0.9)',
    },
    lightElevated: {
        backgroundColor: '#FFFFFF',
    },
    darkOutlined: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    lightOutlined: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: 'rgba(0, 0, 0, 0.15)',
    },
});
