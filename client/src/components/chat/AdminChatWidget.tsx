'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createChatRoom, sendChatMessage, subscribeToMessages, type ChatMessage } from '@/lib/firebase';

export function AdminChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Generate or retrieve visitor ID
    useEffect(() => {
        let id = localStorage.getItem('jahyeon_visitor_id');
        if (!id) {
            id = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
            localStorage.setItem('jahyeon_visitor_id', id);
        }
        setVisitorId(id);

        // Check for existing chat
        const savedChatId = localStorage.getItem('jahyeon_chat_id');
        if (savedChatId) {
            setChatId(savedChatId);
        }
    }, []);

    // Subscribe to messages when chatId is set
    useEffect(() => {
        if (!chatId) return;

        setIsConnected(true);

        const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
            setMessages(newMessages);

            // Count unread messages if chat is closed
            if (!isOpen) {
                const adminMessages = newMessages.filter(m => m.senderType === 'ADMIN');
                if (adminMessages.length > 0) {
                    setUnreadCount(prev => prev + 1);
                }
            }
        });

        return () => {
            unsubscribe();
        };
    }, [chatId, isOpen]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setUnreadCount(0);
        }
    }, [isOpen]);

    const startChat = async () => {
        if (!visitorId) return;
        setIsLoading(true);

        try {
            const newChatId = await createChatRoom(visitorId);
            setChatId(newChatId);
            localStorage.setItem('jahyeon_chat_id', newChatId);
            setIsConnected(true);
        } catch (error) {
            console.error('Failed to start chat:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = useCallback(async () => {
        if (!message.trim() || !chatId) return;

        try {
            await sendChatMessage(chatId, message.trim(), 'VISITOR');
            setMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }, [message, chatId]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110 z-50 flex items-center justify-center group"
                    >
                        <MessageCircle className="w-7 h-7 transition-transform group-hover:scale-110" />

                        {/* Notification Badge */}
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
                                {unreadCount}
                            </span>
                        )}

                        {/* Pulse Ring */}
                        <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-30" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-cyan-600/20">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">구자현</h3>
                                    <p className="text-xs text-white/60">
                                        {isConnected ? '온라인 • 바로 응답' : '연결 중...'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    aria-label="Minimize"
                                >
                                    <Minimize2 className="w-5 h-5 text-white/60" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5 text-white/60" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {!chatId ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
                                        <MessageCircle className="w-12 h-12 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">대화 시작하기</h3>
                                    <p className="text-white/60 mb-6 text-sm">
                                        프로젝트 문의, 협업 제안 등<br />
                                        무엇이든 편하게 물어보세요!
                                    </p>
                                    <button
                                        onClick={startChat}
                                        disabled={isLoading}
                                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                연결 중...
                                            </>
                                        ) : (
                                            <>
                                                <MessageCircle className="w-5 h-5" />
                                                채팅 시작
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={msg.id || idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.senderType === 'VISITOR' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {msg.senderType === 'ADMIN' && (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center mr-2 flex-shrink-0">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.senderType === 'VISITOR'
                                                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-br-md'
                                                    : msg.senderType === 'SYSTEM'
                                                        ? 'bg-white/5 text-white/80 border border-white/10'
                                                        : 'bg-white/10 text-white rounded-bl-md'
                                                    }`}
                                            >
                                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                                <p className="text-xs opacity-60 mt-1">
                                                    {typeof msg.createdAt === 'number'
                                                        ? new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })
                                                        : '방금'
                                                    }
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}

                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input */}
                        {chatId && (
                            <div className="p-4 border-t border-white/10 bg-slate-900/50">
                                <div className="flex gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="메시지를 입력하세요..."
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!message.trim()}
                                        className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                                        aria-label="Send message"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-center text-xs text-white/40 mt-2">
                                    Enter로 전송 • 보통 몇 분 내 응답
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
