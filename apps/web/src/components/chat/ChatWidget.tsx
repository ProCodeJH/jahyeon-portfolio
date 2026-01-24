'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { chatId, messages, addMessage, setChat, visitorId, setVisitorId } = useChatStore();

    // Generate or retrieve visitor ID
    useEffect(() => {
        let id = localStorage.getItem('visitor_id');
        if (!id) {
            id = 'v_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('visitor_id', id);
        }
        setVisitorId(id);
    }, [setVisitorId]);

    // Connect to WebSocket
    useEffect(() => {
        if (!isOpen || !visitorId) return;

        const socket = io((process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001') + '/chat', {
            query: { visitorId },
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            if (chatId) {
                socket.emit('chat:join', { chatId });
            }
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('chat:message', (msg) => {
            addMessage(msg);
        });

        socket.on('chat:typing', () => {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000);
        });

        socket.on('chat:stop-typing', () => {
            setIsTyping(false);
        });

        return () => {
            socket.disconnect();
        };
    }, [isOpen, visitorId, chatId, addMessage]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const startChat = async () => {
        if (!visitorId) return;

        try {
            const res = await fetch('/api/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fingerprint: visitorId }),
            });
            const chat = await res.json();
            setChat(chat.id);
            socketRef.current?.emit('chat:join', { chatId: chat.id });
        } catch (error) {
            console.error('Failed to start chat:', error);
        }
    };

    const sendMessage = async () => {
        if (!message.trim() || !chatId || !socketRef.current) return;

        socketRef.current.emit('chat:message', {
            chatId,
            content: message,
            type: 'TEXT',
        });

        setMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleTyping = () => {
        if (chatId && socketRef.current) {
            socketRef.current.emit('chat:typing', { chatId });
        }
    };

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110 z-50 flex items-center justify-center animate-pulse-ring"
                >
                    <MessageCircle className="w-7 h-7" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-slate-900 rounded-2xl shadow-2xl border border-white/10 flex flex-col z-50 animate-slide-up">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-cyan-600/20">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5 text-white" />
                                </div>
                                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Live Support</h3>
                                <p className="text-xs text-white/60">
                                    {isConnected ? 'Online' : 'Connecting...'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Minimize2 className="w-5 h-5 text-white/60" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {!chatId ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
                                    <MessageCircle className="w-10 h-10 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Start a Conversation</h3>
                                <p className="text-white/60 mb-6">
                                    Our team is here to help. Send us a message!
                                </p>
                                <button
                                    onClick={startChat}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold hover:shadow-lg transition-all"
                                >
                                    Start Chat
                                </button>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex ${msg.senderType === 'VISITOR' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] px-4 py-3 rounded-2xl ${msg.senderType === 'VISITOR'
                                                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                                                : 'bg-white/10 text-white'
                                                }`}
                                        >
                                            <p>{msg.content}</p>
                                            <p className="text-xs opacity-60 mt-1">
                                                {new Date(msg.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="px-4 py-3 rounded-2xl bg-white/10">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                                                <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    {chatId && (
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    onInput={handleTyping}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/10 focus:border-purple-500/50 focus:outline-none transition-colors"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!message.trim()}
                                    className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
