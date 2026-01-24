/**
 * AppFlowy Database - Main Component
 * 
 * 뷰 전환이 가능한 데이터베이스 컨테이너
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppFlowyTheme } from '../contexts/ThemeContext';
import { Database, ViewType, createDefaultDatabase } from './types';
import { TableView } from './TableView';
import { KanbanView } from './KanbanView';
import { GalleryView } from './GalleryView';
import { CalendarView } from './CalendarView';
import {
    Table2, LayoutGrid, Image, Calendar, Plus, ChevronDown, Settings
} from 'lucide-react';

// ============================================
// 🎨 뷰 타입 아이콘
// ============================================
const VIEW_ICONS: Record<ViewType, React.ComponentType<any>> = {
    table: Table2,
    kanban: LayoutGrid,
    gallery: Image,
    calendar: Calendar,
};

const VIEW_LABELS: Record<ViewType, string> = {
    table: 'Table',
    kanban: 'Kanban',
    gallery: 'Gallery',
    calendar: 'Calendar',
};

// ============================================
// 🔧 Props
// ============================================
interface DatabaseViewProps {
    database?: Database;
    onDatabaseChange?: (database: Database) => void;
    className?: string;
}

// ============================================
// 🎯 DatabaseView 컴포넌트
// ============================================
export function DatabaseView({
    database: controlledDatabase,
    onDatabaseChange,
    className,
}: DatabaseViewProps) {
    const { isDark } = useAppFlowyTheme();

    // 내부 상태 (비제어 모드용)
    const [internalDatabase, setInternalDatabase] = useState<Database>(() =>
        createDefaultDatabase('New Database')
    );

    const database = controlledDatabase ?? internalDatabase;
    const setDatabase = onDatabaseChange ?? setInternalDatabase;

    // 현재 뷰
    const [currentViewId, setCurrentViewId] = useState(database.views[0]?.id || 'view-1');
    const currentView = database.views.find((v) => v.id === currentViewId) || database.views[0];

    // 뷰 추가 메뉴
    const [showAddViewMenu, setShowAddViewMenu] = useState(false);

    // 새 뷰 추가
    const addView = (type: ViewType) => {
        const newView = {
            id: `view-${Date.now()}`,
            name: VIEW_LABELS[type],
            type,
            groupByPropertyId: type === 'kanban' ? 'status' : undefined,
            datePropertyId: type === 'calendar' ? 'date' : undefined,
        };
        setDatabase({
            ...database,
            views: [...database.views, newView],
        });
        setCurrentViewId(newView.id);
        setShowAddViewMenu(false);
    };

    // 뷰 렌더링
    const renderView = () => {
        switch (currentView?.type) {
            case 'table':
                return (
                    <TableView
                        database={database}
                        onDatabaseChange={setDatabase}
                    />
                );
            case 'kanban':
                return (
                    <KanbanView
                        database={database}
                        onDatabaseChange={setDatabase}
                        groupByPropertyId={currentView.groupByPropertyId || 'status'}
                    />
                );
            case 'gallery':
                return (
                    <GalleryView
                        database={database}
                        onDatabaseChange={setDatabase}
                        coverPropertyId={currentView.coverPropertyId}
                    />
                );
            case 'calendar':
                return (
                    <CalendarView
                        database={database}
                        onDatabaseChange={setDatabase}
                        datePropertyId={currentView.datePropertyId || 'date'}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* 헤더 */}
            <div className={cn(
                'flex items-center justify-between px-4 py-2 border-b',
                isDark ? 'border-white/10' : 'border-gray-200'
            )}>
                {/* 뷰 탭 */}
                <div className="flex items-center gap-1">
                    {database.views.map((view) => {
                        const Icon = VIEW_ICONS[view.type];
                        const isActive = view.id === currentViewId;

                        return (
                            <button
                                key={view.id}
                                onClick={() => setCurrentViewId(view.id)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm',
                                    'transition-colors',
                                    isActive
                                        ? isDark
                                            ? 'bg-white/10 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                        : isDark
                                            ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{view.name}</span>
                            </button>
                        );
                    })}

                    {/* 뷰 추가 버튼 */}
                    <div className="relative">
                        <button
                            onClick={() => setShowAddViewMenu(!showAddViewMenu)}
                            className={cn(
                                'flex items-center gap-1 px-2 py-1.5 rounded-md text-sm',
                                'transition-colors',
                                isDark
                                    ? 'text-gray-500 hover:bg-white/5 hover:text-gray-400'
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-500'
                            )}
                        >
                            <Plus className="w-4 h-4" />
                        </button>

                        {/* 뷰 추가 메뉴 */}
                        {showAddViewMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowAddViewMenu(false)}
                                />
                                <div
                                    className={cn(
                                        'absolute top-full left-0 mt-1 w-40 py-1 rounded-lg shadow-xl z-20 border',
                                        isDark ? 'bg-[#1E1F25] border-white/10' : 'bg-white border-gray-200'
                                    )}
                                >
                                    {(Object.keys(VIEW_ICONS) as ViewType[]).map((type) => {
                                        const Icon = VIEW_ICONS[type];
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => addView(type)}
                                                className={cn(
                                                    'w-full flex items-center gap-2 px-3 py-2 text-sm',
                                                    isDark
                                                        ? 'hover:bg-white/5 text-gray-300'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {VIEW_LABELS[type]}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 설정 버튼 */}
                <button
                    className={cn(
                        'p-1.5 rounded-md transition-colors',
                        isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    )}
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>

            {/* 뷰 콘텐츠 */}
            <div className="flex-1 overflow-auto">
                {renderView()}
            </div>
        </div>
    );
}

export default DatabaseView;
