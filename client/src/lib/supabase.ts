import { createClient } from '@supabase/supabase-js';

// Supabase 프로젝트 설정
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://padluejojossbedhoocm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZGx1ZWpvam9zc2JlZGhvb2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMTI2NDUsImV4cCI6MjA4MzY4ODY0NX0.FjtKTC1mltSB2XfTfZRXKTOnet3GsvJCrrtdpkomAjc';

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
