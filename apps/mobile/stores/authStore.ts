import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

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

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://jahyeon-portfolio.onrender.com';

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
