/**
 * AppFlowy Pixel-Perfect Main App
 * 
 * AppFlowy 전체 앱 레이아웃 조합
 */

import { useState } from 'react';
import {
    appFlowyLight, appFlowyDark, appFlowyFont, appFlowySpacing, ThemeMode
} from '@/styles/appflowy/design-system';
import { AppFlowySidebar, PageItem } from './Sidebar/AppFlowySidebar';
import { AppFlowyEditor, Block } from './Editor/AppFlowyEditor';
import { AppFlowyDatabaseTable } from './Database/AppFlowyDatabaseTable';
import { AppFlowyKanbanBoard } from './Database/AppFlowyKanbanBoard';
import { Table2, LayoutGrid, FileText } from 'lucide-react';

// ============================================
// 🔧 타입 정의
// ============================================
export interface AppFlowyAppProps {
    workspaceName?: string;
    userName?: string;
    initialPages?: PageItem[];
}

// ============================================
// 🎯 메인 앱 컴포넌트
// ============================================
export function AppFlowyApp({
    workspaceName = 'My Workspace',
    userName = 'User',
    initialPages = samplePages,
}: AppFlowyAppProps) {
    const [theme, setTheme] = useState<ThemeMode>('dark');
    const [currentPageId, setCurrentPageId] = useState<string>(initialPages[0]?.id || '');
    const [pages, setPages] = useState<PageItem[]>(initialPages);
    const [viewType, setViewType] = useState<'document' | 'table' | 'kanban'>('document');

    const colors = theme === 'dark' ? appFlowyDark : appFlowyLight;
    const currentPage = pages.find(p => p.id === currentPageId);

    // 테마 토글
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // 페이지 생성
    const createPage = (parentId?: string) => {
        const newPage: PageItem = {
            id: `page-${Date.now()}`,
            title: 'Untitled',
            icon: '📄',
            parentId,
        };

        if (parentId) {
            setPages(prev => prev.map(p =>
                p.id === parentId
                    ? { ...p, children: [...(p.children || []), newPage] }
                    : p
            ));
        } else {
            setPages(prev => [...prev, newPage]);
        }

        setCurrentPageId(newPage.id);
    };

    return (
        <div
            style={{
                display: 'flex',
                height: '100vh',
                width: '100vw',
                backgroundColor: colors.bg.surface,
                fontFamily: appFlowyFont.family.default,
                overflow: 'hidden',
            }}
        >
            {/* 사이드바 */}
            <AppFlowySidebar
                theme={theme}
                pages={pages}
                currentPageId={currentPageId}
                workspaceName={workspaceName}
                userName={userName}
                onPageSelect={setCurrentPageId}
                onPageCreate={createPage}
                onThemeToggle={toggleTheme}
            />

            {/* 메인 콘텐츠 */}
            <main
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* 상단 바 */}
                <header
                    style={{
                        height: 44,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        borderBottom: `1px solid ${colors.border.divider}`,
                        gap: 8,
                    }}
                >
                    {/* 브레드크럼 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 16 }}>{currentPage?.icon || '📄'}</span>
                        <span
                            style={{
                                fontSize: appFlowyFont.size.sm,
                                color: colors.text.body,
                            }}
                        >
                            {currentPage?.title || 'Untitled'}
                        </span>
                    </div>

                    {/* 뷰 타입 토글 */}
                    <div
                        style={{
                            marginLeft: 'auto',
                            display: 'flex',
                            gap: 4,
                            backgroundColor: colors.bg.tertiary,
                            borderRadius: appFlowySpacing.radius.md,
                            padding: 4,
                        }}
                    >
                        {[
                            { type: 'document' as const, icon: FileText, label: 'Document' },
                            { type: 'table' as const, icon: Table2, label: 'Table' },
                            { type: 'kanban' as const, icon: LayoutGrid, label: 'Board' },
                        ].map(({ type, icon: Icon, label }) => (
                            <button
                                key={type}
                                onClick={() => setViewType(type)}
                                title={label}
                                style={{
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 'none',
                                    borderRadius: appFlowySpacing.radius.sm,
                                    backgroundColor: viewType === type ? colors.bg.surface : 'transparent',
                                    color: viewType === type ? colors.brand.main : colors.icon.secondary,
                                    cursor: 'pointer',
                                    boxShadow: viewType === type ? colors.shadow.sm : 'none',
                                }}
                            >
                                <Icon size={16} />
                            </button>
                        ))}
                    </div>
                </header>

                {/* 뷰 콘텐츠 */}
                <div
                    style={{
                        flex: 1,
                        overflow: 'auto',
                    }}
                >
                    {viewType === 'document' && (
                        <AppFlowyEditor theme={theme} />
                    )}
                    {viewType === 'table' && (
                        <AppFlowyDatabaseTable theme={theme} />
                    )}
                    {viewType === 'kanban' && (
                        <AppFlowyKanbanBoard theme={theme} />
                    )}
                </div>
            </main>
        </div>
    );
}

// ============================================
// 📚 샘플 페이지 데이터
// ============================================
const samplePages: PageItem[] = [
    {
        id: 'welcome',
        title: 'Welcome to AppFlowy',
        icon: '👋',
        isFavorite: true,
    },
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: '🚀',
        children: [
            { id: 'basics', title: 'The Basics', icon: '📝', parentId: 'getting-started' },
            { id: 'shortcuts', title: 'Keyboard Shortcuts', icon: '⌨️', parentId: 'getting-started' },
        ],
    },
    {
        id: 'projects',
        title: 'Projects',
        icon: '📁',
        viewType: 'database',
        children: [
            { id: 'project-1', title: 'Website Redesign', icon: '🎨', parentId: 'projects', viewType: 'kanban' },
            { id: 'project-2', title: 'Mobile App', icon: '📱', parentId: 'projects', viewType: 'kanban' },
        ],
    },
    {
        id: 'tasks',
        title: 'Tasks',
        icon: '✅',
        viewType: 'database',
    },
    {
        id: 'notes',
        title: 'Notes',
        icon: '📒',
        children: [
            { id: 'meeting-notes', title: 'Meeting Notes', icon: '🗓️', parentId: 'notes' },
            { id: 'ideas', title: 'Ideas', icon: '💡', parentId: 'notes' },
        ],
    },
];

export default AppFlowyApp;
