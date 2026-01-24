import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

interface Admin {
    id: string;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string;
}

interface AuthStore {
    admin: Admin | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    loadStoredAuth: () => Promise<void>;
    refreshAccessToken: () => Promise<boolean>;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

// Register FCM token with backend
async function registerFCMToken(accessToken: string) {
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Push notification permission denied');
            return;
        }

        // Get native FCM token
        const tokenData = await Notifications.getDevicePushTokenAsync();
        console.log('FCM Token obtained:', tokenData.data);

        // Register with backend
        const response = await fetch(`${API_URL}/api/auth/devices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                deviceToken: tokenData.data,
                deviceType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
            }),
        });

        console.log('Device registration response:', response.status);

        // Setup Android notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('chat_messages', {
                name: 'Chat Messages',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#8b5cf6',
            });
        }
    } catch (error) {
        console.error('FCM registration error:', error);
    }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    admin: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                return false;
            }

            const tokens = await res.json();

            // Fetch admin info
            const meRes = await fetch(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${tokens.accessToken}` },
            });

            if (!meRes.ok) {
                return false;
            }

            const admin = await meRes.json();

            // Store tokens securely
            await SecureStore.setItemAsync('accessToken', tokens.accessToken);
            await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
            await SecureStore.setItemAsync('admin', JSON.stringify(admin));

            set({
                admin,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                isAuthenticated: true,
                isLoading: false,
            });

            // Register FCM token after successful login
            await registerFCMToken(tokens.accessToken);

            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    },

    logout: async () => {
        const { refreshToken, accessToken } = get();

        try {
            if (refreshToken && accessToken) {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ refreshToken }),
                });
            }
        } catch { }

        // Clear secure storage
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('admin');

        set({
            admin: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
        });
    },

    loadStoredAuth: async () => {
        try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            const adminStr = await SecureStore.getItemAsync('admin');

            if (accessToken && refreshToken && adminStr) {
                const admin = JSON.parse(adminStr);
                set({
                    admin,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },

    refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
            const res = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!res.ok) {
                await get().logout();
                return false;
            }

            const tokens = await res.json();

            await SecureStore.setItemAsync('accessToken', tokens.accessToken);
            await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);

            set({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            });

            return true;
        } catch {
            await get().logout();
            return false;
        }
    },
}));
