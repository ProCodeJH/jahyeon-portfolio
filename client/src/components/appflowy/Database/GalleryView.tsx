/**
 * AppFlowy Database - Gallery View
 * 
 * 카드 갤러리 형태의 뷰
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppFlowyTheme } from '../contexts/ThemeContext';
import { Database, Row, SELECT_COLORS, createDefaultRow } from './types';
import { Plus, MoreHorizontal, Trash2, Image as ImageIcon } from 'lucide-react';

// ============================================
// 🔧 Props
// ============================================
interface GalleryViewProps {
    database: Database;
    onDatabaseChange: (database: Database) => void;
    coverPropertyId?: string;
    className?: string;
}

// ============================================
// 🎯 GalleryView 컴포넌트
// ============================================
export function GalleryView({
    database,
    onDatabaseChange,
    coverPropertyId,
    className,
}: GalleryViewProps) {
    const { isDark } = useAppFlowyTheme();

    // 새 행 추가
    const addRow = () => {
        const newRow = createDefaultRow(database.properties);
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

    // 셀 업데이트
    const updateCell = (rowId: string, propId: string, value: any) => {
        onDatabaseChange({
            ...database,
            rows: database.rows.map((row) =>
                row.id === rowId
                    ? { ...row, cells: { ...row.cells, [propId]: value }, updatedAt: new Date() }
                    : row
            ),
        });
    };

    return (
        <div className={cn('p-4', className)}>
            {/* 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                    {database.rows.map((row) => (
                        <GalleryCard
                            key={row.id}
                            row={row}
                            database={database}
                            coverPropertyId={coverPropertyId}
                            isDark={isDark}
                            onDelete={() => deleteRow(row.id)}
                            onUpdate={(propId, value) => updateCell(row.id, propId, value)}
                        />
                    ))}
                </AnimatePresence>

                {/* 새 카드 추가 */}
                <motion.button
                    layout
                    onClick={addRow}
                    className={cn(
                        'aspect-[4/3] rounded-xl flex flex-col items-center justify-center gap-2',
                        'border-2 border-dashed transition-colors',
                        isDark
                            ? 'border-white/10 text-gray-600 hover:border-white/20 hover:text-gray-500'
                            : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500'
                    )}
                >
                    <Plus className="w-6 h-6" />
                    <span className="text-sm">New</span>
                </motion.button>
            </div>
        </div>
    );
}

// ============================================
// 🎴 갤러리 카드
// ============================================
interface GalleryCardProps {
    row: Row;
    database: Database;
    coverPropertyId?: string;
    isDark: boolean;
    onDelete: () => void;
    onUpdate: (propId: string, value: any) => void;
}

function GalleryCard({
    row,
    database,
    coverPropertyId,
    isDark,
    onDelete,
    onUpdate,
}: GalleryCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // 커버 이미지
    const coverUrl = coverPropertyId ? row.cells[coverPropertyId] : null;

    // status 프로퍼티 찾기 (있으면 태그로 표시)
    const statusProp = database.properties.find((p) => p.id === 'status');
    const statusValue = row.cells.status;
    const statusOption = statusProp?.options?.find((o) => o.id === statusValue);
    const statusColor = SELECT_COLORS.find((c) => c.name === statusOption?.color);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                'group rounded-xl overflow-hidden',
                'transition-shadow cursor-pointer',
                isDark
                    ? 'bg-[#25262E] hover:shadow-lg hover:shadow-black/30'
                    : 'bg-white shadow-sm hover:shadow-lg'
            )}
        >
            {/* 커버 이미지 */}
            <div
                className={cn(
                    'aspect-[4/3] relative',
                    isDark ? 'bg-white/5' : 'bg-gray-100'
                )}
            >
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className={cn(
                            'w-8 h-8',
                            isDark ? 'text-white/20' : 'text-gray-300'
                        )} />
                    </div>
                )}

                {/* 메뉴 버튼 */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className={cn(
                            'p-1.5 rounded-lg',
                            isDark ? 'bg-black/50 hover:bg-black/70' : 'bg-white/80 hover:bg-white'
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

            {/* 콘텐츠 */}
            <div className="p-3">
                {/* 제목 */}
                {isEditing ? (
                    <input
                        type="text"
                        value={row.cells.name || ''}
                        onChange={(e) => onUpdate('name', e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                        className={cn(
                            'w-full bg-transparent outline-none text-sm font-medium',
                            isDark ? 'text-white' : 'text-gray-900'
                        )}
                        autoFocus
                    />
                ) : (
                    <h3
                        className={cn(
                            'text-sm font-medium truncate cursor-text',
                            isDark ? 'text-white' : 'text-gray-900',
                            !row.cells.name && 'text-gray-400'
                        )}
                        onClick={() => setIsEditing(true)}
                    >
                        {row.cells.name || 'Untitled'}
                    </h3>
                )}

                {/* 상태 태그 */}
                {statusOption && (
                    <div className="mt-2">
                        <span
                            className="inline-block px-2 py-0.5 rounded text-xs"
                            style={{
                                backgroundColor: statusColor?.bg,
                                color: statusColor?.text,
                            }}
                        >
                            {statusOption.name}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default GalleryView;
