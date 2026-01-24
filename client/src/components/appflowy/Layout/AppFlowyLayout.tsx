/**
 * AppFlowy Layout - Main Layout Component
 * 
 * AppFlowy 스타일의 메인 레이아웃
 * 사이드바 + 에디터 영역
 */

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar, Page } from '../Sidebar';
import { AppFlowyThemeProvider, useAppFlowyTheme } from '../contexts/ThemeContext';

// ============================================
// 🔧 Props 인터페이스
// ============================================
export interface AppFlowyLayoutProps {
    children: ReactNode;
    pages?: Page[];
    currentPageId?: string;
    onPageSelect?: (pageId: string) => void;
    onPageCreate?: (parentId?: string) => void;
    onSearch?: (query: string) => void;
    className?: string;
}

// ============================================
// 🎯 메인 레이아웃 (내부)
// ============================================
function LayoutContent({
    children,
    pages = [],
    currentPageId,
    onPageSelect,
    onPageCreate,
    onSearch,
    className,
}: AppFlowyLayoutProps) {
    const { isDark } = useAppFlowyTheme();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div
            className={cn(
                'flex h-screen w-screen overflow-hidden',
                isDark ? 'bg-[#1E1F25]' : 'bg-white',
                className
            )}
        >
            {/* 사이드바 */}
            <Sidebar
                pages={pages}
                currentPageId={currentPageId}
                onPageSelect={onPageSelect}
                onPageCreate={onPageCreate}
                onSearch={onSearch}
                collapsed={sidebarCollapsed}
                onCollapsedChange={setSidebarCollapsed}
            />

            {/* 메인 콘텐츠 영역 */}
            <main
                className={cn(
                    'flex-1 overflow-hidden',
                    'flex flex-col'
                )}
            >
                {children}
            </main>
        </div>
    );
}

// ============================================
// 🎯 메인 레이아웃 (프로바이더 포함)
// ============================================
export function AppFlowyLayout(props: AppFlowyLayoutProps) {
    return (
        <AppFlowyThemeProvider>
            <LayoutContent {...props} />
        </AppFlowyThemeProvider>
    );
}

// ============================================
// 📄 페이지 헤더 컴포넌트
// ============================================
interface PageHeaderProps {
    icon?: string;
    title: string;
    coverImage?: string;
    onIconChange?: (icon: string) => void;
    onTitleChange?: (title: string) => void;
    onCoverChange?: (url: string) => void;
}

export function PageHeader({
    icon = '📄',
    title,
    coverImage,
    onIconChange,
    onTitleChange,
    onCoverChange,
}: PageHeaderProps) {
    const { isDark } = useAppFlowyTheme();
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    return (
        <div className="relative">
            {/* 커버 이미지 */}
            {coverImage && (
                <div
                    className="h-48 w-full bg-cover bg-center relative group"
                    style={{ backgroundImage: `url(${coverImage})` }}
                >
                    <button
                        className={cn(
                            'absolute right-4 bottom-4 px-3 py-1.5 rounded-md text-sm',
                            'opacity-0 group-hover:opacity-100 transition-opacity',
                            'bg-black/50 text-white hover:bg-black/70'
                        )}
                        onClick={() => {
                            const url = prompt('Enter cover image URL:');
                            if (url) onCoverChange?.(url);
                        }}
                    >
                        Change cover
                    </button>
                </div>
            )}

            {/* 아이콘 & 제목 */}
            <div className={cn(
                'max-w-4xl mx-auto px-16 pt-12',
                !coverImage && 'pt-20'
            )}>
                {/* 아이콘 */}
                <button
                    className="text-6xl mb-4 hover:opacity-80 transition-opacity"
                    onClick={() => {
                        // 이모지 피커 열기 (간단하게 prompt 사용)
                        const newIcon = prompt('Enter an emoji:', icon);
                        if (newIcon) onIconChange?.(newIcon);
                    }}
                >
                    {icon}
                </button>

                {/* 제목 */}
                {isEditingTitle ? (
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange?.(e.target.value)}
                        onBlur={() => setIsEditingTitle(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') setIsEditingTitle(false);
                        }}
                        className={cn(
                            'w-full text-4xl font-bold bg-transparent border-none outline-none',
                            isDark ? 'text-white' : 'text-gray-900'
                        )}
                        autoFocus
                    />
                ) : (
                    <h1
                        className={cn(
                            'text-4xl font-bold cursor-text',
                            isDark ? 'text-white' : 'text-gray-900',
                            !title && 'text-gray-400'
                        )}
                        onClick={() => setIsEditingTitle(true)}
                    >
                        {title || 'Untitled'}
                    </h1>
                )}

                {/* 커버 추가 버튼 (커버가 없을 때) */}
                {!coverImage && (
                    <button
                        className={cn(
                            'mt-4 text-sm',
                            isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-500'
                        )}
                        onClick={() => {
                            const url = prompt('Enter cover image URL:');
                            if (url) onCoverChange?.(url);
                        }}
                    >
                        + Add cover
                    </button>
                )}
            </div>
        </div>
    );
}

// ============================================
// 📝 페이지 콘텐츠 영역
// ============================================
interface PageContentProps {
    children: ReactNode;
    className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
    const { isDark } = useAppFlowyTheme();

    return (
        <div
            className={cn(
                'flex-1 overflow-y-auto',
                isDark ? 'bg-[#1E1F25]' : 'bg-white',
                className
            )}
        >
            <div className="max-w-4xl mx-auto px-16 py-8">
                {children}
            </div>
        </div>
    );
}

export default AppFlowyLayout;
