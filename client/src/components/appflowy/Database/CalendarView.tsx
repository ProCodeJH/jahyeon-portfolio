/**
 * AppFlowy Database - Calendar View
 * 
 * 캘린더 형태의 뷰
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppFlowyTheme } from '../contexts/ThemeContext';
import { Database, Row, SELECT_COLORS, createDefaultRow } from './types';
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal, Trash2 } from 'lucide-react';

// ============================================
// 🔧 Props
// ============================================
interface CalendarViewProps {
    database: Database;
    onDatabaseChange: (database: Database) => void;
    datePropertyId?: string;
    className?: string;
}

// ============================================
// 📅 날짜 유틸리티
// ============================================
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function getDaysInMonth(year: number, month: number): Date[] {
    const days: Date[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 첫 주의 빈 날짜 채우기
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
        const date = new Date(year, month, -i);
        days.push(date);
    }

    // 해당 월의 날짜
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
    }

    // 마지막 주의 빈 날짜 채우기
    const endPadding = 6 - lastDay.getDay();
    for (let i = 1; i <= endPadding; i++) {
        days.push(new Date(year, month + 1, i));
    }

    return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

function formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ============================================
// 🎯 CalendarView 컴포넌트
// ============================================
export function CalendarView({
    database,
    onDatabaseChange,
    datePropertyId = 'date',
    className,
}: CalendarViewProps) {
    const { isDark } = useAppFlowyTheme();
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

    // 날짜별 행 그룹화
    const rowsByDate = useMemo(() => {
        const map: Record<string, Row[]> = {};
        database.rows.forEach((row) => {
            const dateValue = row.cells[datePropertyId];
            if (dateValue) {
                const key = formatDateKey(new Date(dateValue));
                if (!map[key]) map[key] = [];
                map[key].push(row);
            }
        });
        return map;
    }, [database.rows, datePropertyId]);

    // 이전/다음 달
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // 새 행 추가
    const addRow = (date: Date) => {
        const newRow = createDefaultRow(database.properties);
        newRow.cells[datePropertyId] = formatDateKey(date);
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
        <div className={cn('p-4', className)}>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
                <h2 className={cn(
                    'text-lg font-semibold',
                    isDark ? 'text-white' : 'text-gray-900'
                )}>
                    {year}년 {MONTHS[month]}
                </h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={prevMonth}
                        className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                        )}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}
                        className={cn(
                            'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                            isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                        )}
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                        )}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-px mb-1">
                {DAYS.map((day, i) => (
                    <div
                        key={day}
                        className={cn(
                            'py-2 text-center text-xs font-medium',
                            i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : '',
                            isDark ? 'text-gray-500' : 'text-gray-400'
                        )}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* 캘린더 그리드 */}
            <div className={cn(
                'grid grid-cols-7 gap-px rounded-lg overflow-hidden',
                isDark ? 'bg-white/5' : 'bg-gray-200'
            )}>
                {days.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === month;
                    const isToday = isSameDay(date, today);
                    const dateKey = formatDateKey(date);
                    const rowsOnDay = rowsByDate[dateKey] || [];
                    const isSelected = selectedDate && isSameDay(date, selectedDate);

                    return (
                        <div
                            key={index}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                                'min-h-[100px] p-1.5 cursor-pointer transition-colors',
                                isDark ? 'bg-[#1E1F25]' : 'bg-white',
                                !isCurrentMonth && 'opacity-40',
                                isSelected && (isDark ? 'ring-2 ring-purple-500' : 'ring-2 ring-purple-500')
                            )}
                        >
                            {/* 날짜 */}
                            <div className="flex items-center justify-between mb-1">
                                <span
                                    className={cn(
                                        'w-6 h-6 flex items-center justify-center rounded-full text-xs',
                                        isToday
                                            ? 'bg-purple-500 text-white font-bold'
                                            : isDark
                                                ? 'text-gray-300'
                                                : 'text-gray-700'
                                    )}
                                >
                                    {date.getDate()}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addRow(date);
                                    }}
                                    className={cn(
                                        'p-0.5 rounded opacity-0 hover:opacity-100 transition-opacity',
                                        isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                                    )}
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>

                            {/* 이벤트 목록 */}
                            <div className="space-y-0.5">
                                {rowsOnDay.slice(0, 3).map((row) => (
                                    <CalendarEvent
                                        key={row.id}
                                        row={row}
                                        database={database}
                                        isDark={isDark}
                                        onDelete={() => deleteRow(row.id)}
                                        onUpdateTitle={(title) => updateRowTitle(row.id, title)}
                                    />
                                ))}
                                {rowsOnDay.length > 3 && (
                                    <div className={cn(
                                        'text-xs px-1',
                                        isDark ? 'text-gray-500' : 'text-gray-400'
                                    )}>
                                        +{rowsOnDay.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================
// 📌 캘린더 이벤트
// ============================================
interface CalendarEventProps {
    row: Row;
    database: Database;
    isDark: boolean;
    onDelete: () => void;
    onUpdateTitle: (title: string) => void;
}

function CalendarEvent({
    row,
    database,
    isDark,
    onDelete,
    onUpdateTitle,
}: CalendarEventProps) {
    const [showMenu, setShowMenu] = useState(false);

    // status 색상
    const statusProp = database.properties.find((p) => p.id === 'status');
    const statusOption = statusProp?.options?.find((o) => o.id === row.cells.status);
    const statusColor = SELECT_COLORS.find((c) => c.name === statusOption?.color);

    return (
        <div
            className={cn(
                'group relative text-xs px-1.5 py-0.5 rounded truncate cursor-pointer',
                'transition-colors'
            )}
            style={{
                backgroundColor: statusColor?.bg || (isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'),
                color: statusColor?.text || (isDark ? '#fff' : '#374151'),
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <span className="truncate">{row.cells.name || 'Untitled'}</span>

            {/* 삭제 버튼 */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className={cn(
                    'absolute right-0.5 top-1/2 -translate-y-1/2',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'p-0.5 rounded hover:bg-black/10'
                )}
            >
                <Trash2 className="w-2.5 h-2.5" />
            </button>
        </div>
    );
}

export default CalendarView;
