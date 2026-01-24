/**
 * AppFlowy Editor - AI Assistant
 * 
 * AI 기반 글쓰기 어시스턴트
 * 슬래시 명령어로 AI 기능 호출
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppFlowyTheme } from '../contexts/ThemeContext';
import {
    Sparkles, ArrowRight, Languages, FileText, Wand2,
    Lightbulb, CheckCircle, XCircle, Loader2
} from 'lucide-react';

// ============================================
// 🔧 타입 정의
// ============================================
export type AICommandType =
    | 'improve'        // 글쓰기 개선
    | 'continue'       // 이어서 작성
    | 'summarize'      // 요약
    | 'translate'      // 번역
    | 'fix_grammar'    // 문법 수정
    | 'make_shorter'   // 짧게
    | 'make_longer'    // 길게
    | 'explain'        // 설명
    | 'brainstorm';    // 아이디어

export interface AICommand {
    id: AICommandType;
    label: string;
    description: string;
    icon: React.ComponentType<any>;
}

export interface AIResponse {
    success: boolean;
    result?: string;
    error?: string;
}

// ============================================
// 📋 AI 명령어 목록
// ============================================
export const AI_COMMANDS: AICommand[] = [
    { id: 'improve', label: 'Improve writing', description: '글쓰기 품질 향상', icon: Sparkles },
    { id: 'continue', label: 'Continue writing', description: '텍스트 이어서 작성', icon: ArrowRight },
    { id: 'summarize', label: 'Summarize', description: '요약 생성', icon: FileText },
    { id: 'translate', label: 'Translate', description: '다른 언어로 번역', icon: Languages },
    { id: 'fix_grammar', label: 'Fix grammar', description: '문법 오류 수정', icon: CheckCircle },
    { id: 'make_shorter', label: 'Make shorter', description: '간결하게 줄이기', icon: Wand2 },
    { id: 'make_longer', label: 'Make longer', description: '더 자세하게 확장', icon: Wand2 },
    { id: 'explain', label: 'Explain this', description: '쉽게 설명하기', icon: Lightbulb },
    { id: 'brainstorm', label: 'Brainstorm ideas', description: '아이디어 브레인스토밍', icon: Lightbulb },
];

// ============================================
// 🎯 AI 슬래시 메뉴
// ============================================
interface AISlashMenuProps {
    isOpen: boolean;
    position: { top: number; left: number };
    selectedText?: string;
    onSelect: (command: AICommandType) => void;
    onClose: () => void;
}

export function AISlashMenu({
    isOpen,
    position,
    selectedText,
    onSelect,
    onClose,
}: AISlashMenuProps) {
    const { isDark } = useAppFlowyTheme();
    const [filter, setFilter] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredCommands = AI_COMMANDS.filter(
        (cmd) =>
            cmd.label.toLowerCase().includes(filter.toLowerCase()) ||
            cmd.description.toLowerCase().includes(filter.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <>
            {/* 백드롭 */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            {/* 메뉴 */}
            <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                className={cn(
                    'fixed z-50 w-72 rounded-xl shadow-2xl border overflow-hidden',
                    isDark ? 'bg-[#1E1F25] border-white/10' : 'bg-white border-gray-200'
                )}
                style={{ top: position.top, left: position.left }}
            >
                {/* 헤더 */}
                <div className={cn(
                    'px-3 py-2 border-b flex items-center gap-2',
                    isDark ? 'border-white/10 bg-purple-500/10' : 'border-gray-100 bg-purple-50'
                )}>
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className={cn(
                        'text-sm font-medium',
                        isDark ? 'text-purple-300' : 'text-purple-700'
                    )}>
                        AI Assistant
                    </span>
                </div>

                {/* 선택된 텍스트 미리보기 */}
                {selectedText && (
                    <div className={cn(
                        'px-3 py-2 text-xs border-b truncate',
                        isDark ? 'border-white/5 text-gray-500 bg-white/[0.02]' : 'border-gray-100 text-gray-400 bg-gray-50/50'
                    )}>
                        "{selectedText.slice(0, 50)}{selectedText.length > 50 ? '...' : ''}"
                    </div>
                )}

                {/* 명령어 목록 */}
                <div className="py-1 max-h-64 overflow-y-auto">
                    {filteredCommands.map((cmd, index) => {
                        const Icon = cmd.icon;
                        return (
                            <button
                                key={cmd.id}
                                onClick={() => onSelect(cmd.id)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-3 py-2 text-left',
                                    'transition-colors',
                                    index === selectedIndex
                                        ? isDark
                                            ? 'bg-purple-500/20 text-purple-300'
                                            : 'bg-purple-50 text-purple-700'
                                        : isDark
                                            ? 'hover:bg-white/5 text-gray-300'
                                            : 'hover:bg-gray-50 text-gray-700'
                                )}
                            >
                                <div className={cn(
                                    'w-8 h-8 rounded-lg flex items-center justify-center',
                                    isDark ? 'bg-white/5' : 'bg-gray-100'
                                )}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium">{cmd.label}</div>
                                    <div className={cn(
                                        'text-xs truncate',
                                        isDark ? 'text-gray-500' : 'text-gray-400'
                                    )}>
                                        {cmd.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* 푸터 */}
                <div className={cn(
                    'px-3 py-1.5 border-t text-xs',
                    isDark ? 'border-white/5 text-gray-600' : 'border-gray-100 text-gray-400'
                )}>
                    ↑↓ 이동 · Enter 선택 · Esc 닫기
                </div>
            </motion.div>
        </>
    );
}

// ============================================
// ⚡ AI 결과 팝업
// ============================================
interface AIResultPopupProps {
    isOpen: boolean;
    position: { top: number; left: number };
    isLoading: boolean;
    result?: string;
    error?: string;
    onAccept: () => void;
    onReject: () => void;
    onClose: () => void;
}

export function AIResultPopup({
    isOpen,
    position,
    isLoading,
    result,
    error,
    onAccept,
    onReject,
    onClose,
}: AIResultPopupProps) {
    const { isDark } = useAppFlowyTheme();

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={cn(
                    'fixed z-50 w-96 rounded-xl shadow-2xl border overflow-hidden',
                    isDark ? 'bg-[#1E1F25] border-white/10' : 'bg-white border-gray-200'
                )}
                style={{ top: position.top, left: position.left }}
            >
                {/* 헤더 */}
                <div className={cn(
                    'px-4 py-3 border-b flex items-center gap-2',
                    isDark ? 'border-white/10' : 'border-gray-100'
                )}>
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                            <span className="text-sm">AI가 생각 중...</span>
                        </>
                    ) : error ? (
                        <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-500">오류 발생</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">AI 제안</span>
                        </>
                    )}
                </div>

                {/* 콘텐츠 */}
                <div className={cn(
                    'px-4 py-3 max-h-64 overflow-y-auto text-sm',
                    isDark ? 'text-gray-300' : 'text-gray-700'
                )}>
                    {isLoading ? (
                        <div className={cn(
                            'h-16 animate-pulse rounded',
                            isDark ? 'bg-white/5' : 'bg-gray-100'
                        )} />
                    ) : error ? (
                        <p className="text-red-400">{error}</p>
                    ) : (
                        <p className="whitespace-pre-wrap">{result}</p>
                    )}
                </div>

                {/* 액션 버튼 */}
                {!isLoading && !error && (
                    <div className={cn(
                        'px-4 py-3 border-t flex justify-end gap-2',
                        isDark ? 'border-white/10' : 'border-gray-100'
                    )}>
                        <button
                            onClick={onReject}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-sm',
                                isDark
                                    ? 'hover:bg-white/10 text-gray-400'
                                    : 'hover:bg-gray-100 text-gray-600'
                            )}
                        >
                            취소
                        </button>
                        <button
                            onClick={onAccept}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-sm font-medium',
                                'bg-purple-500 text-white hover:bg-purple-600'
                            )}
                        >
                            적용
                        </button>
                    </div>
                )}
            </motion.div>
        </>
    );
}

// ============================================
// 🪝 AI 훅
// ============================================
interface UseAIAssistantOptions {
    apiEndpoint?: string;
    onSuccess?: (result: string) => void;
    onError?: (error: string) => void;
}

export function useAIAssistant(options: UseAIAssistantOptions = {}) {
    const { apiEndpoint = '/api/ai' } = options;
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const executeCommand = useCallback(async (
        command: AICommandType,
        text: string,
        targetLanguage?: string
    ) => {
        setIsLoading(true);
        setResult(null);
        setError(null);

        try {
            // 실제 API 호출 대신 시뮬레이션
            // TODO: 실제 AI API 연동
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // 시뮬레이션 결과
            const simulatedResults: Record<AICommandType, string> = {
                improve: `${text}\n\n[개선된 버전]\n더 명확하고 간결하게 작성된 버전입니다.`,
                continue: `${text} 이어서 작성된 내용이 여기에 표시됩니다. AI가 문맥을 파악하여 자연스럽게 글을 이어갑니다.`,
                summarize: `요약: ${text.slice(0, 100)}에 대한 핵심 내용 요약입니다.`,
                translate: `[번역]\n${text}의 번역 결과입니다.`,
                fix_grammar: text.replace(/\s+/g, ' ').trim(),
                make_shorter: text.split('.').slice(0, 2).join('.') + '.',
                make_longer: `${text}\n\n추가 설명: 이 내용에 대해 더 자세히 설명하면...`,
                explain: `설명: "${text.slice(0, 50)}..."은(는) 다음을 의미합니다...`,
                brainstorm: `아이디어 제안:\n1. 첫 번째 아이디어\n2. 두 번째 아이디어\n3. 세 번째 아이디어`,
            };

            const resultText = simulatedResults[command] || text;
            setResult(resultText);
            options.onSuccess?.(resultText);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'AI 처리 중 오류가 발생했습니다.';
            setError(errorMessage);
            options.onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint, options]);

    const reset = useCallback(() => {
        setIsLoading(false);
        setResult(null);
        setError(null);
    }, []);

    return {
        isLoading,
        result,
        error,
        executeCommand,
        reset,
    };
}

// ============================================
// 📦 기본 내보내기
// ============================================
export default {
    AISlashMenu,
    AIResultPopup,
    useAIAssistant,
    AI_COMMANDS,
};
