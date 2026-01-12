import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    setAuth: (admin: Admin, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    refreshAccessToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            admin: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (admin, accessToken, refreshToken) =>
                set({
                    admin,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                }),

            logout: () => {
                const { refreshToken } = get();
                if (refreshToken) {
                    fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    }).catch(() => { });
                }
                set({
                    admin: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },

            refreshAccessToken: async () => {
                const { refreshToken } = get();
                if (!refreshToken) return false;

                try {
                    const res = await fetch('/api/auth/refresh', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (!res.ok) {
                        get().logout();
                        return false;
                    }

                    const data = await res.json();
                    set({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    });
                    return true;
                } catch {
                    get().logout();
                    return false;
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                admin: state.admin,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
