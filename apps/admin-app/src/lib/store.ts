// 🧠 Global State Management with Zustand

import { create } from 'zustand';
import { User } from 'firebase/auth';
import { ChatRoom, ChatMessage } from './firebase';

// ============================================
// 🔐 AUTH STORE
// ============================================

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false
    }),
    setLoading: (isLoading) => set({ isLoading }),
}));

// ============================================
// 💬 CHAT STORE
// ============================================

interface ChatState {
    rooms: ChatRoom[];
    currentRoom: ChatRoom | null;
    messages: ChatMessage[];
    isSending: boolean;
    totalUnread: number;
    setRooms: (rooms: ChatRoom[]) => void;
    setCurrentRoom: (room: ChatRoom | null) => void;
    setMessages: (messages: ChatMessage[]) => void;
    setSending: (sending: boolean) => void;
    addMessage: (message: ChatMessage) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    rooms: [],
    currentRoom: null,
    messages: [],
    isSending: false,
    totalUnread: 0,
    setRooms: (rooms) => {
        const totalUnread = rooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
        set({ rooms, totalUnread });
    },
    setCurrentRoom: (room) => set({ currentRoom: room }),
    setMessages: (messages) => set({ messages }),
    setSending: (isSending) => set({ isSending }),
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
}));

// ============================================
// 🎨 THEME STORE
// ============================================

type ThemeMode = 'dark' | 'light';

interface ThemeState {
    mode: ThemeMode;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    mode: 'dark',
    toggleTheme: () => set((state) => ({
        mode: state.mode === 'dark' ? 'light' : 'dark'
    })),
    setTheme: (mode) => set({ mode }),
}));

// ============================================
// 🔔 NOTIFICATION STORE
// ============================================

interface NotificationState {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    fcmToken: string | null;
    setEnabled: (enabled: boolean) => void;
    setSound: (sound: boolean) => void;
    setVibration: (vibration: boolean) => void;
    setFcmToken: (token: string | null) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    enabled: true,
    sound: true,
    vibration: true,
    fcmToken: null,
    setEnabled: (enabled) => set({ enabled }),
    setSound: (sound) => set({ sound }),
    setVibration: (vibration) => set({ vibration }),
    setFcmToken: (fcmToken) => set({ fcmToken }),
}));
