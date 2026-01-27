// ⚙️ Settings Screen

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { adminSignOut } from '../lib/firebase';
import { useAuthStore, useThemeStore, useNotificationStore } from '../lib/store';
import { GlassCard } from '../components/ui/GlassCard';
import { Colors, Gradients } from '../styles/colors';
import { Typography, Spacing, BorderRadius } from '../styles/typography';

interface SettingsScreenProps {
    onLogout: () => void;
}

export function SettingsScreen({ onLogout }: SettingsScreenProps) {
    const { user } = useAuthStore();
    const { mode, toggleTheme } = useThemeStore();
    const { enabled, sound, vibration, setEnabled, setSound, setVibration } = useNotificationStore();

    const isDark = mode === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    const handleLogout = () => {
        Alert.alert(
            '로그아웃',
            '정말 로그아웃하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '로그아웃',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adminSignOut();
                            onLogout();
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    },
                },
            ]
        );
    };

    const SettingRow = ({
        label,
        description,
        value,
        onValueChange,
    }: {
        label: string;
        description?: string;
        value: boolean;
        onValueChange: (value: boolean) => void;
    }) => (
        <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
                {description && (
                    <Text style={[styles.settingDesc, { color: colors.textMuted }]}>
                        {description}
                    </Text>
                )}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{
                    false: isDark ? '#3f3f46' : '#d4d4d8',
                    true: Colors.primary.start
                }}
                thumbColor="#FFFFFF"
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={Gradients.night as [string, string]}
                style={styles.header}
            >
                <Animated.View entering={FadeInDown.springify()}>
                    <Text style={styles.headerTitle}>설정</Text>
                </Animated.View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Account Section */}
                <Animated.View entering={FadeInUp.delay(100).springify()}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        계정
                    </Text>
                    <GlassCard style={styles.card}>
                        <View style={styles.accountRow}>
                            <LinearGradient
                                colors={Gradients.primary as [string, string]}
                                style={styles.accountAvatar}
                            >
                                <Text style={styles.accountAvatarText}>
                                    {user?.email?.slice(0, 2).toUpperCase() || 'AD'}
                                </Text>
                            </LinearGradient>
                            <View style={styles.accountInfo}>
                                <Text style={[styles.accountEmail, { color: colors.text }]}>
                                    {user?.email || '관리자'}
                                </Text>
                                <Text style={[styles.accountRole, { color: colors.textMuted }]}>
                                    관리자
                                </Text>
                            </View>
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* Appearance Section */}
                <Animated.View entering={FadeInUp.delay(200).springify()}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        외관
                    </Text>
                    <GlassCard style={styles.card}>
                        <SettingRow
                            label="다크 모드"
                            description="어두운 테마를 사용합니다"
                            value={isDark}
                            onValueChange={toggleTheme}
                        />
                    </GlassCard>
                </Animated.View>

                {/* Notifications Section */}
                <Animated.View entering={FadeInUp.delay(300).springify()}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        알림
                    </Text>
                    <GlassCard style={styles.card}>
                        <SettingRow
                            label="푸시 알림"
                            description="새 메시지 알림을 받습니다"
                            value={enabled}
                            onValueChange={setEnabled}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <SettingRow
                            label="알림 소리"
                            value={sound}
                            onValueChange={setSound}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <SettingRow
                            label="진동"
                            value={vibration}
                            onValueChange={setVibration}
                        />
                    </GlassCard>
                </Animated.View>

                {/* Logout */}
                <Animated.View entering={FadeInUp.delay(400).springify()}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.logoutText}>로그아웃</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Version */}
                <Text style={[styles.version, { color: colors.textMuted }]}>
                    Jahyeon Admin App v1.0.0
                </Text>
            </ScrollView>
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
    content: {
        flex: 1,
        paddingHorizontal: Spacing.md,
    },
    sectionTitle: {
        ...Typography.labelSmall,
        marginTop: Spacing.xl,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.sm,
    },
    card: {
        padding: 0,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },
    settingInfo: {
        flex: 1,
        marginRight: Spacing.md,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingDesc: {
        fontSize: 13,
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginHorizontal: Spacing.lg,
    },
    accountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    accountAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    accountAvatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    accountInfo: {
        flex: 1,
    },
    accountEmail: {
        fontSize: 16,
        fontWeight: '600',
    },
    accountRole: {
        fontSize: 14,
        marginTop: 2,
    },
    logoutButton: {
        marginTop: Spacing['2xl'],
        alignItems: 'center',
        paddingVertical: Spacing.lg,
    },
    logoutText: {
        color: Colors.status.error,
        fontSize: 16,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: Spacing.xl,
        marginBottom: Spacing['4xl'],
    },
});
