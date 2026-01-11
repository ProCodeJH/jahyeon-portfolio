import { createClient } from '@supabase/supabase-js';

// Supabase 프로젝트 설정
// 실제 사용 시 환경변수로 대체하세요
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

// Realtime channel name for virtual world
export const WORLD_CHANNEL = 'virtual-world';

// Types for realtime events
export interface PlayerState {
    id: string;
    name: string;
    avatarSeed: number;
    x: number;
    y: number;
    direction: 'up' | 'down' | 'left' | 'right' | 'idle';
    zone: string;
}

export interface ChatMessage {
    id: string;
    playerId: string;
    playerName: string;
    message: string;
    timestamp: string;
}
