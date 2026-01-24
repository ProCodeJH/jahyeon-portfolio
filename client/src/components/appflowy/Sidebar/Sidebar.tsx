/**
 * AppFlowy Sidebar - Main Component
 * 
 * AppFlowy 스타일의 워크스페이스 사이드바
 * 기능: 워크스페이스 선택, 빠른 검색, 페이지 트리, 설정
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppFlowyTheme } from '../contexts/ThemeContext';
import { SearchInput, Button, IconButton } from '../ui';
import {
    ChevronLeft, ChevronRight, Search, Plus, Star, Trash2, Settings,
    Home, FileText, LayoutGrid, Calendar, Users, Archive, Moon, Sun
} from 'lucide-react';

// ============================================
// 🔧 인터페이스
// ============================================
export interface Page {
    id: string;
    title: string;
    icon?: string;
    parentId?: string | null;
    isFavorite?: boolean;
    isArchived?: boolean;
    children?: Page[];
}

export interface SidebarProps {
    className?: string;
    pages?: Page[];
    currentPageId?: string;
    onPageSelect?: (pageId: string) => void;
    onPageCreate?: (parentId?: string) => void;
    onSearch?: (query: string) => void;
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
}

// ============================================
// 🎨 스타일 상수
// ============================================
const sidebarWidth = {
    expanded: 260,
    collapsed: 52,
};

// ============================================
// 📱 메뉴 아이템
// ============================================
const quickMenuItems = [
    { id: 'search', icon: Search, label: '빠른 검색', shortcut: 'Ctrl+K' },
    { id: 'new', icon: Plus, label: '새 페이지', shortcut: 'Ctrl+N' },
];

const navItems = [
    { id: 'home', icon: Home, label: '홈' },
    { id: 'all-pages', icon: FileText, label: '모든 페이지' },
    { id: 'templates', icon: LayoutGrid, label: '템플릿' },
    { id: 'calendar', icon: Calendar, label: '캘린더' },
];

// ============================================
// 🎯 Sidebar 컴포넌트
// ============================================
export function Sidebar({
    className,
    pages = [],
    currentPageId,
    onPageSelect,
    onPageCreate,
    onSearch,
    collapsed: controlledCollapsed,
    onCollapsedChange,
}: SidebarProps) {
    const { mode, toggleTheme, isDark } = useAppFlowyTheme();
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    // 제어/비제어 모드 지원
    const collapsed = controlledCollapsed ?? internalCollapsed;
    const setCollapsed = onCollapsedChange ?? setInternalCollapsed;

    // 폴더 토글
    const toggleFolder = (folderId: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }
            return next;
        });
    };

    // 즐겨찾기 페이지 필터링
    const favoritePages = pages.filter((p) => p.isFavorite && !p.isArchived);

    // 루트 페이지 필터링 (parentId가 없는 페이지)
    const rootPages = pages.filter((p) => !p.parentId && !p.isArchived);

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? sidebarWidth.collapsed : sidebarWidth.expanded }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
                'flex flex-col h-full',
                'border-r',
                isDark
                    ? 'bg-[#1A1B21] border-white/10'
                    : 'bg-gray-50 border-gray-200',
                className
            )}
        >
            {/* 헤더: 워크스페이스 */}
            <div className="flex items-center justify-between p-3 h-14">
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 flex-1 min-w-0"
                    >
                        <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                            'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                        )}>
                            J
                        </div>
                        <span className={cn(
                            'font-semibold truncate',
                            isDark ? 'text-white' : 'text-gray-900'
                        )}>
                            Jahyeon's Space
                        </span>
                    </motion.div>
                )}

                <IconButton
                    icon={collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    variant="ghost"
                    size="iconSm"
                    onClick={() => setCollapsed(!collapsed)}
                />
            </div>

            {/* 검색 바 */}
            {!collapsed && (
                <div className="px-3 pb-2">
                    <SearchInput
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            onSearch?.(e.target.value);
                        }}
                        placeholder="검색..."
                        inputSize="sm"
                    />
                </div>
            )}

            {/* 빠른 메뉴 */}
            <div className={cn('px-2', collapsed ? 'py-2' : 'pb-2')}>
                {quickMenuItems.map((item) => (
                    <SidebarItem
                        key={item.id}
                        icon={<item.icon className="w-4 h-4" />}
                        label={item.label}
                        shortcut={item.shortcut}
                        collapsed={collapsed}
                        isDark={isDark}
                        onClick={() => {
                            if (item.id === 'new') onPageCreate?.();
                        }}
                    />
                ))}
            </div>

            {/* 구분선 */}
            <div className={cn('mx-2 border-t', isDark ? 'border-white/10' : 'border-gray-200')} />

            {/* 네비게이션 */}
            <div className="px-2 py-2">
                {navItems.map((item) => (
                    <SidebarItem
                        key={item.id}
                        icon={<item.icon className="w-4 h-4" />}
                        label={item.label}
                        collapsed={collapsed}
                        isDark={isDark}
                    />
                ))}
            </div>

            {/* 구분선 */}
            <div className={cn('mx-2 border-t', isDark ? 'border-white/10' : 'border-gray-200')} />

            {/* 즐겨찾기 */}
            {!collapsed && favoritePages.length > 0 && (
                <div className="px-2 py-2">
                    <div className={cn(
                        'px-2 py-1 text-xs font-medium',
                        isDark ? 'text-gray-500' : 'text-gray-400'
                    )}>
                        즐겨찾기
                    </div>
                    {favoritePages.map((page) => (
                        <PageItem
                            key={page.id}
                            page={page}
                            isActive={currentPageId === page.id}
                            isDark={isDark}
                            onClick={() => onPageSelect?.(page.id)}
                        />
                    ))}
                </div>
            )}

            {/* 페이지 트리 */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
                {!collapsed && (
                    <>
                        <div className={cn(
                            'flex items-center justify-between px-2 py-1',
                        )}>
                            <span className={cn(
                                'text-xs font-medium',
                                isDark ? 'text-gray-500' : 'text-gray-400'
                            )}>
                                개인 페이지
                            </span>
                            <IconButton
                                icon={<Plus className="w-3 h-3" />}
                                label="새 페이지"
                                variant="ghost"
                                size="iconSm"
                                onClick={() => onPageCreate?.()}
                            />
                        </div>
                        {rootPages.map((page) => (
                            <PageItem
                                key={page.id}
                                page={page}
                                level={0}
                                isActive={currentPageId === page.id}
                                isExpanded={expandedFolders.has(page.id)}
                                isDark={isDark}
                                onClick={() => onPageSelect?.(page.id)}
                                onToggle={() => toggleFolder(page.id)}
                                onAddChild={() => onPageCreate?.(page.id)}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* 하단 메뉴 */}
            <div className={cn('px-2 py-2 border-t', isDark ? 'border-white/10' : 'border-gray-200')}>
                <SidebarItem
                    icon={<Archive className="w-4 h-4" />}
                    label="휴지통"
                    collapsed={collapsed}
                    isDark={isDark}
                />
                <SidebarItem
                    icon={<Settings className="w-4 h-4" />}
                    label="설정"
                    collapsed={collapsed}
                    isDark={isDark}
                />
                <SidebarItem
                    icon={isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    label={isDark ? '라이트 모드' : '다크 모드'}
                    collapsed={collapsed}
                    isDark={isDark}
                    onClick={toggleTheme}
                />
            </div>
        </motion.aside>
    );
}

// ============================================
// 📄 사이드바 아이템
// ============================================
interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    collapsed?: boolean;
    isDark?: boolean;
    isActive?: boolean;
    onClick?: () => void;
}

function SidebarItem({
    icon,
    label,
    shortcut,
    collapsed,
    isDark,
    isActive,
    onClick,
}: SidebarItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md',
                'transition-colors duration-100',
                isActive
                    ? isDark
                        ? 'bg-white/10 text-white'
                        : 'bg-gray-200 text-gray-900'
                    : isDark
                        ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                collapsed && 'justify-center'
            )}
            title={collapsed ? label : undefined}
        >
            {icon}
            {!collapsed && (
                <>
                    <span className="flex-1 text-sm text-left truncate">{label}</span>
                    {shortcut && (
                        <span className={cn(
                            'text-xs',
                            isDark ? 'text-gray-600' : 'text-gray-400'
                        )}>
                            {shortcut}
                        </span>
                    )}
                </>
            )}
        </button>
    );
}

// ============================================
// 📃 페이지 아이템
// ============================================
interface PageItemProps {
    page: Page;
    level?: number;
    isActive?: boolean;
    isExpanded?: boolean;
    isDark?: boolean;
    onClick?: () => void;
    onToggle?: () => void;
    onAddChild?: () => void;
}

function PageItem({
    page,
    level = 0,
    isActive,
    isExpanded,
    isDark,
    onClick,
    onToggle,
    onAddChild,
}: PageItemProps) {
    const hasChildren = page.children && page.children.length > 0;

    return (
        <div>
            <div
                className={cn(
                    'group flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer',
                    'transition-colors duration-100',
                    isActive
                        ? isDark
                            ? 'bg-white/10 text-white'
                            : 'bg-gray-200 text-gray-900'
                        : isDark
                            ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
                style={{ paddingLeft: `${8 + level * 12}px` }}
                onClick={onClick}
            >
                {/* 확장 버튼 */}
                <button
                    className={cn(
                        'w-4 h-4 flex items-center justify-center rounded',
                        'opacity-0 group-hover:opacity-100',
                        hasChildren && 'opacity-100'
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle?.();
                    }}
                >
                    {hasChildren && (
                        <ChevronRight
                            className={cn(
                                'w-3 h-3 transition-transform',
                                isExpanded && 'rotate-90'
                            )}
                        />
                    )}
                </button>

                {/* 아이콘 */}
                <span className="text-sm">{page.icon || '📄'}</span>

                {/* 제목 */}
                <span className="flex-1 text-sm truncate">{page.title || 'Untitled'}</span>

                {/* 추가 버튼 */}
                <button
                    className={cn(
                        'w-5 h-5 flex items-center justify-center rounded',
                        'opacity-0 group-hover:opacity-100',
                        isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddChild?.();
                    }}
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>

            {/* 자식 페이지 */}
            <AnimatePresence>
                {isExpanded && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        {page.children?.map((child) => (
                            <PageItem
                                key={child.id}
                                page={child}
                                level={level + 1}
                                isDark={isDark}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Sidebar;
