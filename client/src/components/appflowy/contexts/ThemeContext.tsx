/**
 * AppFlowy Theme Context
 * 
 * 테마 상태 관리 및 토글 기능
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { light, dark, ThemeMode } from '@/styles/appflowy';

// ============================================
// 🎨 테마 컨텍스트 타입
// ============================================
interface ThemeContextType {
    mode: ThemeMode;
    theme: typeof light;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================
// 🎯 테마 프로바이더
// ============================================
interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: ThemeMode;
    storageKey?: string;
}

export function AppFlowyThemeProvider({
    children,
    defaultTheme = 'dark',
    storageKey = 'appflowy-theme',
}: ThemeProviderProps) {
    const [mode, setMode] = useState<ThemeMode>(() => {
        // 로컬 스토리지에서 테마 불러오기
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(storageKey);
            if (stored === 'light' || stored === 'dark') {
                return stored;
            }
            // 시스템 테마 감지
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return defaultTheme;
    });

    const theme = mode === 'light' ? light : dark;
    const isDark = mode === 'dark';

    // 테마 변경 시 로컬 스토리지 저장 & body class 업데이트
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, mode);
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(mode);
        }
    }, [mode, storageKey]);

    // 시스템 테마 변경 감지
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const stored = localStorage.getItem(storageKey);
            if (!stored) {
                setMode(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [storageKey]);

    const toggleTheme = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const setTheme = (newMode: ThemeMode) => {
        setMode(newMode);
    };

    return (
        <ThemeContext.Provider
            value={{
                mode,
                theme,
                toggleTheme,
                setTheme,
                isDark,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

// ============================================
// 🪝 테마 훅
// ============================================
export function useAppFlowyTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useAppFlowyTheme must be used within an AppFlowyThemeProvider');
    }
    return context;
}

// ============================================
// 🎨 테마 토글 버튼 컴포넌트
// ============================================
export function ThemeToggle({ className }: { className?: string }) {
    const { mode, toggleTheme, isDark } = useAppFlowyTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`
        p-2 rounded-lg
        transition-all duration-200
        hover:bg-gray-100 dark:hover:bg-white/10
        focus:outline-none focus:ring-2 focus:ring-purple-500/40
        ${className}
      `}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {isDark ? (
                // 해 아이콘 (다크모드일 때)
                <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                    />
                </svg>
            ) : (
                // 달 아이콘 (라이트모드일 때)
                <svg
                    className="w-5 h-5 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
            )}
        </button>
    );
}

export default AppFlowyThemeProvider;
