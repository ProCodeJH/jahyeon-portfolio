import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { router } from 'expo-router';
import { LogOut, User, Mail, Shield, Moon, Bell, Github, Globe } from 'lucide-react-native';

export default function ProfileScreen() {
    const { admin, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert(
            '로그아웃',
            '정말로 로그아웃 하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '로그아웃',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/login');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                    {admin?.avatarUrl ? (
                        <Image source={{ uri: admin.avatarUrl }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <User color="#8b5cf6" size={40} />
                        </View>
                    )}
                </View>
                <Text style={styles.name}>{admin?.name || '관리자'}</Text>
                <View style={styles.roleContainer}>
                    <Shield color="#8b5cf6" size={14} />
                    <Text style={styles.role}>{admin?.role || 'ADMIN'}</Text>
                </View>
            </View>

            {/* Info Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>계정 정보</Text>

                <View style={styles.infoItem}>
                    <Mail color="#666" size={20} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>이메일</Text>
                        <Text style={styles.infoValue}>{admin?.email || '-'}</Text>
                    </View>
                </View>

                <View style={styles.infoItem}>
                    <Shield color="#666" size={20} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>권한</Text>
                        <Text style={styles.infoValue}>
                            {admin?.role === 'SUPER_ADMIN' ? '슈퍼 관리자' :
                                admin?.role === 'ADMIN' ? '관리자' : '모더레이터'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>설정</Text>

                <TouchableOpacity style={styles.settingItem}>
                    <Bell color="#666" size={20} />
                    <Text style={styles.settingText}>알림 설정</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <Moon color="#666" size={20} />
                    <Text style={styles.settingText}>다크 모드</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <Globe color="#666" size={20} />
                    <Text style={styles.settingText}>언어 설정</Text>
                </TouchableOpacity>
            </View>

            {/* Links Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>링크</Text>

                <TouchableOpacity style={styles.settingItem}>
                    <Github color="#666" size={20} />
                    <Text style={styles.settingText}>GitHub</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <Globe color="#666" size={20} />
                    <Text style={styles.settingText}>포트폴리오 사이트</Text>
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut color="#ef4444" size={20} />
                <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>

            {/* App Version */}
            <Text style={styles.version}>Jahyeon Admin v1.0.0</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a1a',
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 32,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    name: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        gap: 4,
    },
    role: {
        color: '#8b5cf6',
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    sectionTitle: {
        color: '#888',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        color: '#666',
        fontSize: 12,
    },
    infoValue: {
        color: '#fff',
        fontSize: 15,
        marginTop: 2,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
    },
    settingText: {
        color: '#fff',
        fontSize: 15,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 16,
        padding: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        gap: 8,
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
    version: {
        color: '#444',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 32,
    },
});
