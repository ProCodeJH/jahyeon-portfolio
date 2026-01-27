// 💬 Quick Reply Templates for Jahyeon Admin App
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QuickReply {
    id: string;
    title: string;
    content: string;
    emoji?: string;
    usageCount: number;
}

const STORAGE_KEY = '@jahyeon_quick_replies';

// Default quick reply templates
export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
    {
        id: '1',
        title: '인사',
        content: '안녕하세요! 방문해 주셔서 감사합니다. 무엇을 도와드릴까요?',
        emoji: '👋',
        usageCount: 0,
    },
    {
        id: '2',
        title: '잠시만요',
        content: '잠시만 기다려 주세요, 곧 답변 드리겠습니다!',
        emoji: '⏳',
        usageCount: 0,
    },
    {
        id: '3',
        title: '연락처',
        content: '자세한 상담은 admin@jahyeon.com 으로 이메일 주시면 빠르게 답변 드리겠습니다.',
        emoji: '📧',
        usageCount: 0,
    },
    {
        id: '4',
        title: '감사',
        content: '문의해 주셔서 감사합니다! 좋은 하루 되세요 😊',
        emoji: '🙏',
        usageCount: 0,
    },
    {
        id: '5',
        title: '외출 중',
        content: '현재 자리를 비우고 있습니다. 조금 후에 답변 드리겠습니다!',
        emoji: '🚶',
        usageCount: 0,
    },
    {
        id: '6',
        title: '협업 문의',
        content: '협업 관련 문의 감사합니다! 포트폴리오를 확인해 주시고, 자세한 내용은 이메일로 보내주시면 검토 후 연락드리겠습니다.',
        emoji: '🤝',
        usageCount: 0,
    },
];

// Load quick replies from storage
export async function loadQuickReplies(): Promise<QuickReply[]> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // Return defaults if nothing stored
        await saveQuickReplies(DEFAULT_QUICK_REPLIES);
        return DEFAULT_QUICK_REPLIES;
    } catch (error) {
        console.error('Error loading quick replies:', error);
        return DEFAULT_QUICK_REPLIES;
    }
}

// Save quick replies to storage
export async function saveQuickReplies(replies: QuickReply[]): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(replies));
    } catch (error) {
        console.error('Error saving quick replies:', error);
    }
}

// Add a new quick reply
export async function addQuickReply(reply: Omit<QuickReply, 'id' | 'usageCount'>): Promise<QuickReply[]> {
    const replies = await loadQuickReplies();
    const newReply: QuickReply = {
        ...reply,
        id: Date.now().toString(),
        usageCount: 0,
    };
    replies.push(newReply);
    await saveQuickReplies(replies);
    return replies;
}

// Update a quick reply
export async function updateQuickReply(id: string, updates: Partial<QuickReply>): Promise<QuickReply[]> {
    const replies = await loadQuickReplies();
    const index = replies.findIndex(r => r.id === id);
    if (index !== -1) {
        replies[index] = { ...replies[index], ...updates };
        await saveQuickReplies(replies);
    }
    return replies;
}

// Delete a quick reply
export async function deleteQuickReply(id: string): Promise<QuickReply[]> {
    const replies = await loadQuickReplies();
    const filtered = replies.filter(r => r.id !== id);
    await saveQuickReplies(filtered);
    return filtered;
}

// Increment usage count (for sorting by most used)
export async function incrementUsageCount(id: string): Promise<void> {
    const replies = await loadQuickReplies();
    const index = replies.findIndex(r => r.id === id);
    if (index !== -1) {
        replies[index].usageCount++;
        await saveQuickReplies(replies);
    }
}

// Get quick replies sorted by usage
export async function getQuickRepliesSortedByUsage(): Promise<QuickReply[]> {
    const replies = await loadQuickReplies();
    return replies.sort((a, b) => b.usageCount - a.usageCount);
}
