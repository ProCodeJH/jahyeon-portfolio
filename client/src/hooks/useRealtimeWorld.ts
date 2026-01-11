import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, WORLD_CHANNEL, PlayerState, ChatMessage, isSupabaseConfigured } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeWorldOptions {
    playerId: string;
    playerName: string;
    avatarSeed: number;
    initialX: number;
    initialY: number;
    onPlayerJoin?: (name: string) => void;
    onPlayerLeave?: (name: string) => void;
}

interface UseRealtimeWorldReturn {
    players: Map<string, PlayerState>;
    chatMessages: ChatMessage[];
    isConnected: boolean;
    sendPosition: (x: number, y: number, direction: string, zone: string) => void;
    sendChat: (message: string) => void;
    sendEmote: (emote: string) => void;
    disconnect: () => void;
}

export function useRealtimeWorld(options: UseRealtimeWorldOptions): UseRealtimeWorldReturn {
    const { playerId, playerName, avatarSeed, initialX, initialY, onPlayerJoin, onPlayerLeave } = options;

    const [players, setPlayers] = useState<Map<string, PlayerState>>(new Map());
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const channelRef = useRef<RealtimeChannel | null>(null);
    const lastPositionRef = useRef({ x: initialX, y: initialY });

    // Initialize channel
    useEffect(() => {
        if (!playerId || !isSupabaseConfigured || !supabase) return;

        const channel = supabase.channel(WORLD_CHANNEL, {
            config: {
                presence: {
                    key: playerId,
                },
            },
        });

        channelRef.current = channel;

        // Handle presence sync (who's online)
        channel.on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            const newPlayers = new Map<string, PlayerState>();

            Object.entries(state).forEach(([key, presences]) => {
                const presence = (presences as any[])[0];
                if (presence && key !== playerId) {
                    newPlayers.set(key, {
                        id: key,
                        name: presence.name || 'Unknown',
                        avatarSeed: presence.avatarSeed || 0,
                        x: presence.x || 800,
                        y: presence.y || 600,
                        direction: presence.direction || 'idle',
                        zone: presence.zone || '로비',
                    });
                }
            });

            setPlayers(newPlayers);
        });

        // Track known players to prevent duplicate notifications
        const knownPlayers = new Set<string>();

        // Handle new player join (Phase 5)
        channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
            // Skip self join events
            if (key === playerId) return;

            const presence = (newPresences as any[])[0];
            if (presence) {
                const joinedName = presence.name || 'Unknown';
                setPlayers(prev => {
                    const updated = new Map(prev);
                    updated.set(key, {
                        id: key,
                        name: joinedName,
                        avatarSeed: presence.avatarSeed || 0,
                        x: presence.x || 800,
                        y: presence.y || 600,
                        direction: presence.direction || 'idle',
                        zone: presence.zone || '로비',
                    });
                    return updated;
                });
                // Only notify if this is a NEW player we haven't seen before
                if (!knownPlayers.has(key)) {
                    knownPlayers.add(key);
                    onPlayerJoin?.(joinedName);
                }
            }
        });

        // Handle player leave (Phase 5)
        channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            // Skip self leave events
            if (key === playerId) return;

            // Only notify if we actually knew this player
            if (!knownPlayers.has(key)) return;

            const leftPresence = (leftPresences as any[])?.[0];
            const leftName = leftPresence?.name || 'Unknown';
            setPlayers(prev => {
                const updated = new Map(prev);
                updated.delete(key);
                return updated;
            });
            // Remove from known and notify
            knownPlayers.delete(key);
            onPlayerLeave?.(leftName);
        });

        // Handle broadcast messages (position updates)
        channel.on('broadcast', { event: 'position' }, ({ payload }: { payload: any }) => {
            if (payload.playerId === playerId) return;

            setPlayers(prev => {
                const updated = new Map(prev);
                const existing = updated.get(payload.playerId);
                if (existing) {
                    updated.set(payload.playerId, {
                        ...existing,
                        x: payload.x,
                        y: payload.y,
                        direction: payload.direction,
                        zone: payload.zone,
                    });
                }
                return updated;
            });
        });

        // Handle chat messages
        channel.on('broadcast', { event: 'chat' }, ({ payload }: { payload: any }) => {
            setChatMessages(prev => [...prev.slice(-99), {
                id: payload.id,
                playerId: payload.playerId,
                playerName: payload.playerName,
                message: payload.message,
                timestamp: payload.timestamp,
            }]);
        });

        // Subscribe and track presence
        channel.subscribe(async (status: string) => {
            if (status === 'SUBSCRIBED') {
                setIsConnected(true);

                // Track our presence
                await channel.track({
                    name: playerName,
                    avatarSeed: avatarSeed,
                    x: initialX,
                    y: initialY,
                    direction: 'idle',
                    zone: '로비',
                    online_at: new Date().toISOString(),
                });
            }
        });

        return () => {
            channel.unsubscribe();
            channelRef.current = null;
            setIsConnected(false);
        };
    }, [playerId, playerName, avatarSeed, initialX, initialY, onPlayerJoin, onPlayerLeave]);

    // Send position update (throttled)
    const sendPosition = useCallback((x: number, y: number, direction: string, zone: string) => {
        if (!channelRef.current || !isConnected) return;

        // Only send if position changed significantly
        const dx = Math.abs(x - lastPositionRef.current.x);
        const dy = Math.abs(y - lastPositionRef.current.y);

        if (dx < 2 && dy < 2) return;

        lastPositionRef.current = { x, y };

        // Update presence
        channelRef.current.track({
            name: playerName,
            avatarSeed: avatarSeed,
            x,
            y,
            direction,
            zone,
            online_at: new Date().toISOString(),
        });

        // Also broadcast for faster updates
        channelRef.current.send({
            type: 'broadcast',
            event: 'position',
            payload: {
                playerId,
                x,
                y,
                direction,
                zone,
            },
        });
    }, [isConnected, playerId, playerName, avatarSeed]);

    // Send chat message
    const sendChat = useCallback((message: string) => {
        if (!message.trim()) return;

        const chatMsg: ChatMessage = {
            id: `${playerId}-${Date.now()}`,
            playerId,
            playerName,
            message: message.trim(),
            timestamp: new Date().toISOString(),
        };

        // Always add locally first (so user sees their own message)
        setChatMessages(prev => [...prev.slice(-99), chatMsg]);

        // Try to broadcast to others if connected
        if (channelRef.current && isConnected) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'chat',
                payload: chatMsg,
            });
        }
    }, [isConnected, playerId, playerName]);

    // Send emote (Phase 9)
    const sendEmote = useCallback((emote: string) => {
        // Broadcast emote as a special chat message
        const emoteMsg: ChatMessage = {
            id: `${playerId}-emote-${Date.now()}`,
            playerId,
            playerName: `${playerName}`,
            message: emote,
            timestamp: new Date().toISOString(),
        };

        // Always add locally first
        setChatMessages(prev => [...prev.slice(-99), emoteMsg]);

        // Try to broadcast if connected
        if (channelRef.current && isConnected) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'chat',
                payload: emoteMsg,
            });
        }
    }, [isConnected, playerId, playerName]);

    // Disconnect
    const disconnect = useCallback(() => {
        if (channelRef.current) {
            channelRef.current.unsubscribe();
            channelRef.current = null;
            setIsConnected(false);
        }
    }, []);

    return {
        players,
        chatMessages,
        isConnected,
        sendPosition,
        sendChat,
        sendEmote,
        disconnect,
    };
}
