// 🔥 Firebase Configuration for Mobile Admin App

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
    getDatabase,
    ref,
    push,
    set,
    onValue,
    off,
    query,
    orderByChild,
    serverTimestamp,
    update,
    get,
    limitToLast
} from 'firebase/database';

// Firebase Configuration (same as web app)
const firebaseConfig = {
    apiKey: "AIzaSyD8ZD4p7swQ9xto0MDOIlZ_48bespYEKtU",
    authDomain: "jahyeon-portfolio.firebaseapp.com",
    databaseURL: "https://jahyeon-portfolio-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "jahyeon-portfolio",
    storageBucket: "jahyeon-portfolio.firebasestorage.app",
    messagingSenderId: "920680268286",
    appId: "1:920680268286:web:e41ac1cd66449fbade40af",
    measurementId: "G-W50MRKZJ86",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// ============================================
// 🔐 ADMIN AUTHENTICATION
// ============================================

export interface AdminUser {
    uid: string;
    email: string | null;
}

export async function adminSignIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

export async function adminSignOut(): Promise<void> {
    await signOut(auth);
}

export function onAdminAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

// ============================================
// 💬 CHAT MANAGEMENT
// ============================================

export interface ChatRoom {
    id: string;
    visitorId: string;
    status: 'open' | 'closed';
    createdAt: number;
    lastMessageAt?: number;
    lastMessage?: string;
    lastMessageSender?: 'VISITOR' | 'ADMIN' | 'SYSTEM';
    unreadCount?: number;
    visitorTyping?: boolean;
}

export interface ChatMessage {
    id: string;
    content: string;
    senderType: 'VISITOR' | 'ADMIN' | 'SYSTEM';
    createdAt: number;
    read?: boolean;
}

// Subscribe to all chat rooms
export function subscribeToChatRooms(callback: (rooms: ChatRoom[]) => void): () => void {
    const chatsRef = ref(database, 'chats');

    const unsubscribe = onValue(chatsRef, (snapshot) => {
        const rooms: ChatRoom[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const data = child.val();
                rooms.push({
                    id: child.key!,
                    visitorId: data.visitorId || 'Unknown',
                    status: data.status || 'open',
                    createdAt: data.createdAt || Date.now(),
                    lastMessageAt: data.lastMessageAt,
                    lastMessage: data.lastMessage,
                    lastMessageSender: data.lastMessageSender,
                    unreadCount: data.unreadCount || 0,
                    visitorTyping: data.visitorTyping || false,
                });
            });
        }

        // Sort by lastMessageAt descending
        rooms.sort((a, b) => (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt));
        callback(rooms);
    });

    return () => off(chatsRef);
}

// Subscribe to messages in a specific chat room
export function subscribeToMessages(chatId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const messagesRef = ref(database, `chats/${chatId}/messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
        const messages: ChatMessage[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                messages.push({
                    id: child.key!,
                    ...child.val(),
                });
            });
        }

        // Sort by createdAt ascending
        messages.sort((a, b) => a.createdAt - b.createdAt);
        callback(messages);
    });

    return () => off(messagesRef);
}

// Send a message as admin
export async function sendAdminMessage(chatId: string, content: string): Promise<void> {
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const newMessageRef = push(messagesRef);

    await set(newMessageRef, {
        content,
        senderType: 'ADMIN',
        createdAt: serverTimestamp(),
        read: true,
    });

    // Update chat room with last message info
    const chatRef = ref(database, `chats/${chatId}`);
    await update(chatRef, {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        lastMessageSender: 'ADMIN',
    });
}

// Mark messages as read
export async function markMessagesAsRead(chatId: string): Promise<void> {
    const chatRef = ref(database, `chats/${chatId}`);
    await update(chatRef, {
        unreadCount: 0,
    });
}

// Set admin typing status
export async function setAdminTyping(chatId: string, isTyping: boolean): Promise<void> {
    const chatRef = ref(database, `chats/${chatId}`);
    await update(chatRef, {
        adminTyping: isTyping,
    });
}

// Close a chat room
export async function closeChatRoom(chatId: string): Promise<void> {
    const chatRef = ref(database, `chats/${chatId}`);
    await update(chatRef, {
        status: 'closed',
    });
}

// ============================================
// 📱 FCM TOKEN MANAGEMENT
// ============================================

export async function saveFcmToken(adminUid: string, token: string): Promise<void> {
    const adminRef = ref(database, `admins/${adminUid}`);
    await update(adminRef, {
        fcmToken: token,
        lastSeen: serverTimestamp(),
    });
}

export async function updateAdminLastSeen(adminUid: string): Promise<void> {
    const adminRef = ref(database, `admins/${adminUid}`);
    await update(adminRef, {
        lastSeen: serverTimestamp(),
    });
}
