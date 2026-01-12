import { useEffect, useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { Send, ArrowLeft } from 'lucide-react-native';
import { io, Socket } from 'socket.io-client';

interface Message {
    id: string;
    content: string;
    senderType: 'VISITOR' | 'ADMIN' | 'SYSTEM';
    createdAt: string;
    admin?: {
        id: string;
        name: string;
    };
}

interface ChatDetails {
    id: string;
    status: string;
    visitor: { name?: string; email?: string; fingerprint?: string };
    messages: Message[];
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function ChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [chat, setChat] = useState<ChatDetails | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const { accessToken, admin } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList>(null);

    // Fetch chat details
    const fetchChat = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/chats/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            setChat(data);
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Failed to fetch chat:', error);
        } finally {
            setIsLoading(false);
        }
    }, [id, accessToken]);

    // Connect to WebSocket
    useEffect(() => {
        if (!accessToken || !id) return;

        const socket = io(`${API_URL}/chat`, {
            query: { token: accessToken },
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to chat server');
            socket.emit('chat:join', { chatId: id });
        });

        socket.on('chat:message', (msg: Message) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('chat:typing', () => {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000);
        });

        socket.on('chat:stop-typing', () => {
            setIsTyping(false);
        });

        return () => {
            socket.emit('chat:leave', { chatId: id });
            socket.disconnect();
        };
    }, [accessToken, id]);

    useEffect(() => {
        fetchChat();
    }, [fetchChat]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !socketRef.current || isSending) return;

        setIsSending(true);
        socketRef.current.emit('chat:message', {
            chatId: id,
            content: newMessage.trim(),
            type: 'TEXT',
        });
        setNewMessage('');
        setIsSending(false);
    };

    const handleTyping = () => {
        if (socketRef.current) {
            socketRef.current.emit('chat:typing', { chatId: id });
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isAdmin = item.senderType === 'ADMIN';
        const isSystem = item.senderType === 'SYSTEM';

        return (
            <View
                style={[
                    styles.messageContainer,
                    isAdmin ? styles.adminMessage : styles.visitorMessage,
                    isSystem && styles.systemMessage,
                ]}
            >
                {!isAdmin && !isSystem && (
                    <Text style={styles.senderName}>방문자</Text>
                )}
                {isAdmin && (
                    <Text style={styles.senderName}>{item.admin?.name || '관리자'}</Text>
                )}
                <Text style={[
                    styles.messageText,
                    isAdmin && styles.adminMessageText,
                    isSystem && styles.systemMessageText,
                ]}>
                    {item.content}
                </Text>
                <Text style={styles.messageTime}>
                    {new Date(item.createdAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <Stack.Screen
                options={{
                    title: chat?.visitor.name || chat?.visitor.email || '채팅',
                    headerStyle: { backgroundColor: '#0a0a1a' },
                    headerTintColor: '#fff',
                }}
            />

            {/* Chat Status Bar */}
            <View style={styles.statusBar}>
                <View style={[
                    styles.statusDot,
                    { backgroundColor: chat?.status === 'ACTIVE' ? '#10b981' : '#f59e0b' }
                ]} />
                <Text style={styles.statusText}>
                    {chat?.status === 'WAITING' ? '대기 중' :
                        chat?.status === 'ACTIVE' ? '활성' :
                            chat?.status === 'CLOSED' ? '종료됨' : '해결됨'}
                </Text>
            </View>

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />

            {/* Typing Indicator */}
            {isTyping && (
                <View style={styles.typingIndicator}>
                    <Text style={styles.typingText}>방문자가 입력 중...</Text>
                </View>
            )}

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="메시지를 입력하세요..."
                    placeholderTextColor="#666"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    onSubmitEditing={sendMessage}
                    onChange={handleTyping}
                    multiline
                    maxLength={1000}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!newMessage.trim() || isSending) && styles.sendButtonDisabled,
                    ]}
                    onPress={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                >
                    {isSending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Send color="#fff" size={20} />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a1a',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a1a',
    },
    statusBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        color: '#888',
        fontSize: 12,
    },
    messagesList: {
        padding: 16,
        paddingBottom: 8,
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    adminMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#8b5cf6',
        borderBottomRightRadius: 4,
    },
    visitorMessage: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomLeftRadius: 4,
    },
    systemMessage: {
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
    },
    senderName: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 10,
        marginBottom: 4,
    },
    messageText: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 20,
    },
    adminMessageText: {
        color: '#fff',
    },
    systemMessageText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    messageTime: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        marginTop: 4,
        textAlign: 'right',
    },
    typingIndicator: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    typingText: {
        color: '#888',
        fontSize: 12,
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'flex-end',
    },
    textInput: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#fff',
        fontSize: 15,
        maxHeight: 100,
        marginRight: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#8b5cf6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
