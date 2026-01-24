/**
 * AppFlowy Database - Kanban View
 * 
 * 드래그앤드롭 가능한 칸반 보드
 */

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppFlowyTheme } from '../contexts/ThemeContext';
import { Database, Property, Row, SELECT_COLORS, createDefaultRow } from './types';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';

// ============================================
// 🔧 Props
// ============================================
interface KanbanViewProps {
    database: Database;
    onDatabaseChange: (database: Database) => void;
    groupByPropertyId?: string;
    className?: string;
}

// ============================================
// 🎯 KanbanView 컴포넌트
// ============================================
export function KanbanView({
    database,
    onDatabaseChange,
    groupByPropertyId = 'status',
    className,
}: KanbanViewProps) {
    const { isDark } = useAppFlowyTheme();

    // 그룹 기준 프로퍼티 찾기
    const groupProperty = database.properties.find((p) => p.id === groupByPropertyId);

    if (!groupProperty || groupProperty.type !== 'select') {
        return (
            <div className={cn(
                'flex items-center justify-center h-64 text-sm',
                isDark ? 'text-gray-500' : 'text-gray-400'
            )}>
                Select property를 선택해주세요
            </div>
        );
    }

    const columns = groupProperty.options || [];

    // 컬럼별 행 그룹화
    const getRowsForColumn = (optionId: string) => {
        return database.rows.filter((row) => row.cells[groupByPropertyId] === optionId);
    };

    // 미분류 행
    const uncategorizedRows = database.rows.filter(
        (row) => !row.cells[groupByPropertyId] ||
            !columns.find((c) => c.id === row.cells[groupByPropertyId])
    );

    // 행 이동
    const moveRow = (rowId: string, toColumnId: string) => {
        onDatabaseChange({
            ...database,
            rows: database.rows.map((row) =>
                row.id === rowId
                    ? { ...row, cells: { ...row.cells, [groupByPropertyId]: toColumnId }, updatedAt: new Date() }
                    : row
            ),
        });
    };

    // 새 행 추가
    const addRow = (columnId: string) => {
        const newRow = createDefaultRow(database.properties);
        newRow.cells[groupByPropertyId] = columnId;
        onDatabaseChange({
            ...database,
            rows: [...database.rows, newRow],
        });
    };

    // 행 삭제
    const deleteRow = (rowId: string) => {
        onDatabaseChange({
            ...database,
            rows: database.rows.filter((row) => row.id !== rowId),
        });
    };

    // 제목 업데이트
    const updateRowTitle = (rowId: string, title: string) => {
        onDatabaseChange({
            ...database,
            rows: database.rows.map((row) =>
                row.id === rowId
                    ? { ...row, cells: { ...row.cells, name: title }, updatedAt: new Date() }
                    : row
            ),
        });
    };

    return (
        <div className={cn('flex gap-4 p-4 overflow-x-auto min-h-[400px]', className)}>
            {/* 각 컬럼 */}
            {columns.map((column) => {
                const colorDef = SELECT_COLORS.find((c) => c.name === column.color);
                const rows = getRowsForColumn(column.id);

                return (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.name}
                        color={colorDef}
                        rows={rows}
                        isDark={isDark}
                        onAddRow={() => addRow(column.id)}
                        onDeleteRow={deleteRow}
                        onUpdateRowTitle={updateRowTitle}
                        onDropRow={(rowId) => moveRow(rowId, column.id)}
                    />
                );
            })}

            {/* 미분류 컬럼 */}
            {uncategorizedRows.length > 0 && (
                <KanbanColumn
                    id="uncategorized"
                    title="Uncategorized"
                    rows={uncategorizedRows}
                    isDark={isDark}
                    onDeleteRow={deleteRow}
                    onUpdateRowTitle={updateRowTitle}
                />
            )}

            {/* 새 컬럼 추가 버튼 */}
            <div className="flex-shrink-0 w-72">
                <button
                    onClick={() => {
                        const newOption = {
                            id: `opt-${Date.now()}`,
                            name: `Column ${columns.length + 1}`,
                            color: SELECT_COLORS[columns.length % SELECT_COLORS.length].name,
                        };
                        onDatabaseChange({
                            ...database,
                            properties: database.properties.map((p) =>
                                p.id === groupByPropertyId
                                    ? { ...p, options: [...(p.options || []), newOption] }
                                    : p
                            ),
                        });
                    }}
                    className={cn(
                        'w-full py-3 px-4 rounded-lg text-sm flex items-center gap-2',
                        'border-2 border-dashed transition-colors',
                        isDark
                            ? 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-400'
                            : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500'
                    )}
                >
                    <Plus className="w-4 h-4" />
                    Add Column
                </button>
            </div>
        </div>
    );
}

// ============================================
// 📋 칸반 컬럼
// ============================================
interface KanbanColumnProps {
    id: string;
    title: string;
    color?: { bg: string; text: string };
    rows: Row[];
    isDark: boolean;
    onAddRow?: () => void;
    onDeleteRow: (rowId: string) => void;
    onUpdateRowTitle: (rowId: string, title: string) => void;
    onDropRow?: (rowId: string) => void;
}

function KanbanColumn({
    id,
    title,
    color,
    rows,
    isDark,
    onAddRow,
    onDeleteRow,
    onUpdateRowTitle,
    onDropRow,
}: KanbanColumnProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    return (
        <div
            className={cn(
                'flex-shrink-0 w-72 rounded-lg',
                isDark ? 'bg-white/[0.02]' : 'bg-gray-50'
            )}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const rowId = e.dataTransfer.getData('rowId');
                if (rowId) onDropRow?.(rowId);
            }}
        >
            {/* 컬럼 헤더 */}
            <div className={cn(
                'flex items-center justify-between px-3 py-2',
                'border-b',
                isDark ? 'border-white/5' : 'border-gray-200'
            )}>
                <div className="flex items-center gap-2">
                    {color && (
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color.text }}
                        />
                    )}
                    <span className={cn(
                        'font-medium text-sm',
                        isDark ? 'text-white' : 'text-gray-900'
                    )}>
                        {title}
                    </span>
                    <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded',
                        isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-500'
                    )}>
                        {rows.length}
                    </span>
                </div>

                {onAddRow && (
                    <button
                        onClick={onAddRow}
                        className={cn(
                            'p-1 rounded transition-colors',
                            isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                        )}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* 카드 목록 */}
            <div className={cn(
                'p-2 min-h-[200px] transition-colors',
                isDragOver && (isDark ? 'bg-white/5' : 'bg-gray-100')
            )}>
                <AnimatePresence>
                    {rows.map((row) => (
                        <KanbanCard
                            key={row.id}
                            row={row}
                            isDark={isDark}
                            onDelete={() => onDeleteRow(row.id)}
                            onUpdateTitle={(title) => onUpdateRowTitle(row.id, title)}
                        />
                    ))}
                </AnimatePresence>

                {/* 새 카드 추가 */}
                {onAddRow && rows.length === 0 && (
                    <button
                        onClick={onAddRow}
                        className={cn(
                            'w-full py-6 rounded-lg text-sm flex items-center justify-center gap-2',
                            'border border-dashed transition-colors',
                            isDark
                                ? 'border-white/10 text-gray-600 hover:border-white/20 hover:text-gray-500'
                                : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500'
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        Add task
                    </button>
                )}
            </div>
        </div>
    );
}

// ============================================
// 🎴 칸반 카드
// ============================================
interface KanbanCardProps {
    row: Row;
    isDark: boolean;
    onDelete: () => void;
    onUpdateTitle: (title: string) => void;
}

function KanbanCard({ row, isDark, onDelete, onUpdateTitle }: KanbanCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            draggable
            onDragStart={(e: any) => {
                e.dataTransfer?.setData('rowId', row.id);
            }}
            className={cn(
                'group p-3 mb-2 rounded-lg cursor-grab active:cursor-grabbing',
                'transition-shadow',
                isDark
                    ? 'bg-[#25262E] hover:shadow-lg hover:shadow-black/20'
                    : 'bg-white shadow-sm hover:shadow-md'
            )}
        >
            <div className="flex items-start justify-between gap-2">
                {/* 제목 */}
                {isEditing ? (
                    <input
                        type="text"
                        value={row.cells.name || ''}
                        onChange={(e) => onUpdateTitle(e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                        className={cn(
                            'flex-1 bg-transparent outline-none text-sm',
                            isDark ? 'text-white' : 'text-gray-900'
                        )}
                        autoFocus
                    />
                ) : (
                    <span
                        className={cn(
                            'flex-1 text-sm cursor-text',
                            isDark ? 'text-white' : 'text-gray-900',
                            !row.cells.name && 'text-gray-400'
                        )}
                        onClick={() => setIsEditing(true)}
                    >
                        {row.cells.name || 'Untitled'}
                    </span>
                )}

                {/* 메뉴 버튼 */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className={cn(
                            'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
                            isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                        )}
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div
                                className={cn(
                                    'absolute top-full right-0 mt-1 w-32 py-1 rounded-lg shadow-xl z-20 border',
                                    isDark ? 'bg-[#1E1F25] border-white/10' : 'bg-white border-gray-200'
                                )}
                            >
                                <button
                                    onClick={() => {
                                        onDelete();
                                        setShowMenu(false);
                                    }}
                                    className={cn(
                                        'w-full px-3 py-1.5 text-left text-sm flex items-center gap-2',
                                        'text-red-500 hover:bg-red-500/10'
                                    )}
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default KanbanView;
