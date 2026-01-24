import { create } from 'zustand';

interface Message {
    id: string;
    chatId: string;
    senderId?: string;
    senderType: 'VISITOR' | 'ADMIN' | 'SYSTEM';
    content: string;
    type: 'TEXT' | 'IMAGE' | 'FILE' | 'EMOJI' | 'SYSTEM';
    isRead: boolean;
    createdAt: string;
}

interface ChatStore {
    visitorId: string | null;
    chatId: string | null;
    messages: Message[];
    setVisitorId: (id: string) => void;
    setChat: (chatId: string) => void;
    addMessage: (message: Message) => void;
    clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    visitorId: null,
    chatId: null,
    messages: [],
    setVisitorId: (id) => set({ visitorId: id }),
    setChat: (chatId) => set({ chatId }),
    addMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message],
        })),
    clearMessages: () => set({ messages: [] }),
}));
