// 🔐 Login Screen

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { adminSignIn } from '../lib/firebase';
import { useAuthStore, useThemeStore } from '../lib/store';
import { GlassCard } from '../components/ui/GlassCard';
import { PremiumButton } from '../components/ui/PremiumButton';
import { Colors, Gradients } from '../styles/colors';
import { Typography, Spacing, BorderRadius } from '../styles/typography';

interface LoginScreenProps {
    onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { setUser } = useAuthStore();
    const { mode } = useThemeStore();
    const isDark = mode === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError('이메일과 비밀번호를 입력해주세요');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const user = await adminSignIn(email.trim(), password);
            setUser(user);
            onLoginSuccess();
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.code === 'auth/invalid-email') {
                setError('유효하지 않은 이메일 주소입니다');
            } else if (err.code === 'auth/user-not-found') {
                setError('등록되지 않은 사용자입니다');
            } else if (err.code === 'auth/wrong-password') {
                setError('비밀번호가 올바르지 않습니다');
            } else {
                setError('로그인에 실패했습니다. 다시 시도해주세요');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={Gradients.night as [string, string]}
            style={styles.gradient}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.content}>
                        {/* Header */}
                        <Animated.View
                            entering={FadeInDown.delay(100).springify()}
                            style={styles.header}
                        >
                            <View style={styles.logoContainer}>
                                <LinearGradient
                                    colors={Gradients.primary as [string, string]}
                                    style={styles.logo}
                                >
                                    <Text style={styles.logoText}>JH</Text>
                                </LinearGradient>
                            </View>
                            <Text style={[styles.title, { color: colors.text }]}>
                                Admin Chat
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                포트폴리오 채팅 관리
                            </Text>
                        </Animated.View>

                        {/* Login Form */}
                        <Animated.View
                            entering={FadeInUp.delay(200).springify()}
                        >
                            <GlassCard style={styles.card}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                                        이메일
                                    </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                color: colors.text,
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                            },
                                        ]}
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="admin@example.com"
                                        placeholderTextColor={colors.textMuted}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                                        비밀번호
                                    </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                color: colors.text,
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                            },
                                        ]}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="••••••••"
                                        placeholderTextColor={colors.textMuted}
                                        secureTextEntry
                                    />
                                </View>

                                {error ? (
                                    <Animated.Text
                                        entering={FadeInUp.springify()}
                                        style={styles.error}
                                    >
                                        {error}
                                    </Animated.Text>
                                ) : null}

                                <PremiumButton
                                    title="로그인"
                                    onPress={handleLogin}
                                    loading={loading}
                                    fullWidth
                                    size="lg"
                                    style={styles.button}
                                />
                            </GlassCard>
                        </Animated.View>

                        {/* Footer */}
                        <Animated.Text
                            entering={FadeInUp.delay(300).springify()}
                            style={[styles.footer, { color: colors.textMuted }]}
                        >
                            jahyeon.com 관리자 전용
                        </Animated.Text>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing['3xl'],
    },
    logoContainer: {
        marginBottom: Spacing.lg,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '800',
    },
    title: {
        ...Typography.h2,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.body,
    },
    card: {
        marginBottom: Spacing.xl,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        ...Typography.label,
        marginBottom: Spacing.sm,
    },
    input: {
        height: 52,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        paddingHorizontal: Spacing.lg,
        fontSize: 16,
    },
    error: {
        color: Colors.status.error,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    button: {
        marginTop: Spacing.md,
    },
    footer: {
        textAlign: 'center',
        fontSize: 12,
    },
});
