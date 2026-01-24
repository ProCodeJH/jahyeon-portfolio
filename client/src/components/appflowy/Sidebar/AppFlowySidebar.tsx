/**
 * AppFlowy Pixel-Perfect Sidebar
 * 
 * AppFlowy 데스크톱 앱과 동일한 사이드바
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    appFlowyLight, appFlowyDark, appFlowyFont, appFlowySpacing, ThemeMode
} from '@/styles/appflowy/design-system';
import {
    Search, Plus, Home, FileText, Trash2, Settings, ChevronRight,
    MoreHorizontal, Star, Calendar, Users, Sun, Moon, ChevronDown,
    FolderPlus, Clock, Inbox
} from 'lucide-react';

// ============================================
// 🔧 타입 정의
// ============================================
export interface PageItem {
    id: string;
    title: string;
    icon: string;
    parentId?: string | null;
    isFavorite?: boolean;
    isExpanded?: boolean;
    children?: PageItem[];
    viewType?: 'document' | 'database' | 'kanban' | 'calendar' | 'gallery';
}

interface AppFlowySidebarProps {
    theme?: ThemeMode;
    pages?: PageItem[];
    currentPageId?: string;
    workspaceName?: string;
    userName?: string;
    onPageSelect?: (pageId: string) => void;
    onPageCreate?: (parentId?: string) => void;
    onThemeToggle?: () => void;
}

// ============================================
// 🎯 메인 사이드바 컴포넌트
// ============================================
export function AppFlowySidebar({
    theme = 'dark',
    pages = [],
    currentPageId,
    workspaceName = 'Workspace',
    userName = 'User',
    onPageSelect,
    onPageCreate,
    onThemeToggle,
}: AppFlowySidebarProps) {
    const colors = theme === 'dark' ? appFlowyDark : appFlowyLight;
    const { sidebar } = appFlowySpacing;

    const [searchQuery, setSearchQuery] = useState('');
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    // 즐겨찾기 페이지
    const favoritePages = pages.filter(p => p.isFavorite);

    // 루트 페이지 (parentId가 없는)
    const privatePages = pages.filter(p => !p.parentId && !p.isFavorite);

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <aside
            style={{
                width: sidebar.width,
                backgroundColor: colors.bg.secondary,
                borderRight: `1px solid ${colors.border.primary}`,
                fontFamily: appFlowyFont.family.default,
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                userSelect: 'none',
            }}
        >
            {/* 워크스페이스 헤더 */}
            <div
                style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    borderBottom: `1px solid ${colors.border.divider}`,
                }}
            >
                {/* 워크스페이스 아이콘 */}
                <div
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: `linear-gradient(135deg, ${colors.brand.main}, ${colors.brand.purple})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                    }}
                >
                    {workspaceName.charAt(0).toUpperCase()}
                </div>

                {/* 워크스페이스 이름 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: appFlowyFont.size.base,
                            fontWeight: appFlowyFont.weight.medium,
                            color: colors.text.title,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {workspaceName}
                    </div>
                </div>

                {/* 설정 버튼 */}
                <button
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.icon.secondary,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.bg.hover;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <Settings size={16} />
                </button>
            </div>

            {/* 검색 */}
            <div style={{ padding: '8px 12px' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        borderRadius: appFlowySpacing.radius.md,
                        backgroundColor: colors.bg.surface,
                        border: `1px solid ${colors.border.primary}`,
                    }}
                >
                    <Search size={14} color={colors.icon.secondary} />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            fontSize: appFlowyFont.size.sm,
                            color: colors.text.body,
                            fontFamily: 'inherit',
                        }}
                    />
                    <kbd
                        style={{
                            fontSize: 10,
                            padding: '2px 4px',
                            borderRadius: 3,
                            backgroundColor: colors.bg.tertiary,
                            color: colors.text.caption,
                        }}
                    >
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* 빠른 메뉴 */}
            <div style={{ padding: '4px 8px' }}>
                <SidebarMenuItem
                    icon={<Home size={16} />}
                    label="Home"
                    colors={colors}
                    isActive={false}
                />
                <SidebarMenuItem
                    icon={<Inbox size={16} />}
                    label="Inbox"
                    colors={colors}
                    badge={3}
                />
                <SidebarMenuItem
                    icon={<Clock size={16} />}
                    label="Recent"
                    colors={colors}
                />
            </div>

            {/* 구분선 */}
            <div style={{
                height: 1,
                backgroundColor: colors.border.divider,
                margin: '8px 12px'
            }} />

            {/* 즐겨찾기 */}
            {favoritePages.length > 0 && (
                <SidebarSection
                    title="Favorites"
                    colors={colors}
                >
                    {favoritePages.map(page => (
                        <PageTreeItem
                            key={page.id}
                            page={page}
                            level={0}
                            colors={colors}
                            isActive={currentPageId === page.id}
                            isExpanded={expandedItems.has(page.id)}
                            isHovered={hoveredItem === page.id}
                            onSelect={() => onPageSelect?.(page.id)}
                            onToggle={() => toggleExpand(page.id)}
                            onHover={setHoveredItem}
                            onAddChild={() => onPageCreate?.(page.id)}
                        />
                    ))}
                </SidebarSection>
            )}

            {/* Private 페이지 */}
            <SidebarSection
                title="Private"
                colors={colors}
                onAdd={() => onPageCreate?.()}
            >
                {privatePages.map(page => (
                    <PageTreeItem
                        key={page.id}
                        page={page}
                        level={0}
                        colors={colors}
                        isActive={currentPageId === page.id}
                        isExpanded={expandedItems.has(page.id)}
                        isHovered={hoveredItem === page.id}
                        onSelect={() => onPageSelect?.(page.id)}
                        onToggle={() => toggleExpand(page.id)}
                        onHover={setHoveredItem}
                        onAddChild={() => onPageCreate?.(page.id)}
                    />
                ))}

                {/* 새 페이지 버튼 */}
                {privatePages.length === 0 && (
                    <button
                        onClick={() => onPageCreate?.()}
                        style={{
                            width: '100%',
                            padding: '6px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontSize: appFlowyFont.size.sm,
                            color: colors.text.caption,
                            borderRadius: appFlowySpacing.radius.md,
                            fontFamily: 'inherit',
                        }}
                    >
                        <Plus size={14} />
                        <span>Add a page</span>
                    </button>
                )}
            </SidebarSection>

            {/* 하단 영역 */}
            <div style={{ marginTop: 'auto', padding: '8px' }}>
                {/* 휴지통 */}
                <SidebarMenuItem
                    icon={<Trash2 size={16} />}
                    label="Trash"
                    colors={colors}
                />

                {/* 테마 토글 */}
                <SidebarMenuItem
                    icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    colors={colors}
                    onClick={onThemeToggle}
                />
            </div>

            {/* 새 페이지 FAB */}
            <button
                onClick={() => onPageCreate?.()}
                style={{
                    position: 'absolute',
                    bottom: 20,
                    right: -24,
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: colors.brand.main,
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: colors.shadow.lg,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = colors.shadow.xl;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = colors.shadow.lg;
                }}
            >
                <Plus size={24} />
            </button>
        </aside>
    );
}

// ============================================
// 📁 사이드바 섹션
// ============================================
interface SidebarSectionProps {
    title: string;
    colors: typeof appFlowyLight;
    children: React.ReactNode;
    onAdd?: () => void;
}

function SidebarSection({ title, colors, children, onAdd }: SidebarSectionProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div style={{ padding: '4px 8px' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    marginBottom: 2,
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <span
                    style={{
                        fontSize: appFlowyFont.size.xs,
                        fontWeight: appFlowyFont.weight.medium,
                        color: colors.text.caption,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}
                >
                    {title}
                </span>

                {onAdd && (
                    <button
                        onClick={onAdd}
                        style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.icon.secondary,
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.15s',
                        }}
                    >
                        <Plus size={14} />
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}

// ============================================
// 📄 사이드바 메뉴 아이템
// ============================================
interface SidebarMenuItemProps {
    icon: React.ReactNode;
    label: string;
    colors: typeof appFlowyLight;
    isActive?: boolean;
    badge?: number;
    onClick?: () => void;
}

function SidebarMenuItem({ icon, label, colors, isActive, badge, onClick }: SidebarMenuItemProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                width: '100%',
                height: appFlowySpacing.sidebar.itemHeight,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '0 10px',
                border: 'none',
                borderRadius: appFlowySpacing.radius.md,
                backgroundColor: isActive
                    ? colors.bg.selected
                    : isHovered
                        ? colors.bg.hover
                        : 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
            }}
        >
            <span style={{ color: isActive ? colors.brand.main : colors.icon.primary }}>
                {icon}
            </span>
            <span
                style={{
                    flex: 1,
                    textAlign: 'left',
                    fontSize: appFlowyFont.size.sm,
                    color: colors.text.body,
                }}
            >
                {label}
            </span>
            {badge && (
                <span
                    style={{
                        minWidth: 18,
                        height: 18,
                        padding: '0 5px',
                        borderRadius: 9,
                        backgroundColor: colors.brand.main,
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {badge}
                </span>
            )}
        </button>
    );
}

// ============================================
// 🌳 페이지 트리 아이템
// ============================================
interface PageTreeItemProps {
    page: PageItem;
    level: number;
    colors: typeof appFlowyLight;
    isActive?: boolean;
    isExpanded?: boolean;
    isHovered?: boolean;
    onSelect?: () => void;
    onToggle?: () => void;
    onHover?: (id: string | null) => void;
    onAddChild?: () => void;
}

function PageTreeItem({
    page,
    level,
    colors,
    isActive,
    isExpanded,
    isHovered,
    onSelect,
    onToggle,
    onHover,
    onAddChild,
}: PageTreeItemProps) {
    const hasChildren = page.children && page.children.length > 0;
    const indent = 12 + level * 16;

    return (
        <>
            <button
                onClick={onSelect}
                onMouseEnter={() => onHover?.(page.id)}
                onMouseLeave={() => onHover?.(null)}
                style={{
                    width: '100%',
                    height: appFlowySpacing.sidebar.itemHeight,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    paddingLeft: indent,
                    paddingRight: 8,
                    border: 'none',
                    borderRadius: appFlowySpacing.radius.md,
                    backgroundColor: isActive
                        ? colors.bg.selected
                        : isHovered
                            ? colors.bg.hover
                            : 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                }}
            >
                {/* 확장 화살표 */}
                <span
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle?.();
                    }}
                    style={{
                        width: 16,
                        height: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.icon.secondary,
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.15s',
                        opacity: hasChildren ? 1 : 0,
                    }}
                >
                    <ChevronRight size={12} />
                </span>

                {/* 페이지 아이콘 */}
                <span style={{ fontSize: 14 }}>{page.icon}</span>

                {/* 페이지 제목 */}
                <span
                    style={{
                        flex: 1,
                        textAlign: 'left',
                        fontSize: appFlowyFont.size.sm,
                        color: colors.text.body,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {page.title || 'Untitled'}
                </span>

                {/* 액션 버튼들 */}
                {isHovered && (
                    <div style={{ display: 'flex', gap: 2 }}>
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddChild?.();
                            }}
                            style={{
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: colors.icon.secondary,
                                cursor: 'pointer',
                            }}
                        >
                            <Plus size={12} />
                        </span>
                        <span
                            style={{
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: colors.icon.secondary,
                                cursor: 'pointer',
                            }}
                        >
                            <MoreHorizontal size={12} />
                        </span>
                    </div>
                )}
            </button>

            {/* 자식 페이지 */}
            <AnimatePresence>
                {isExpanded && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ overflow: 'hidden' }}
                    >
                        {page.children?.map(child => (
                            <PageTreeItem
                                key={child.id}
                                page={child}
                                level={level + 1}
                                colors={colors}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default AppFlowySidebar;
