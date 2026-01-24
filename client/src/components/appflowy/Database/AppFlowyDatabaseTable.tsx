/**
 * AppFlowy Pixel-Perfect Database Table
 * 
 * Notion/AppFlowy 스타일 데이터베이스 테이블
 */

import { useState, useRef } from 'react';
import {
    appFlowyLight, appFlowyDark, appFlowyFont, appFlowySpacing, ThemeMode
} from '@/styles/appflowy/design-system';
import {
    Plus, ChevronDown, MoreHorizontal, Trash2, Filter, ArrowUpDown,
    Type, Hash, Calendar, CheckSquare, Link2, User, Tag
} from 'lucide-react';

// ============================================
// 🔧 타입 정의
// ============================================
export type ColumnType = 'text' | 'number' | 'select' | 'multi_select' | 'date' | 'checkbox' | 'url' | 'person';

export interface SelectOption {
    id: string;
    name: string;
    color: keyof typeof appFlowyLight.tag;
}

export interface Column {
    id: string;
    name: string;
    type: ColumnType;
    width: number;
    options?: SelectOption[];
}

export interface Row {
    id: string;
    cells: Record<string, any>;
}

export interface DatabaseTableProps {
    theme?: ThemeMode;
    columns?: Column[];
    rows?: Row[];
    onChange?: (columns: Column[], rows: Row[]) => void;
}

// ============================================
// 🎨 컬럼 타입 아이콘
// ============================================
const COLUMN_ICONS: Record<ColumnType, any> = {
    text: Type,
    number: Hash,
    select: Tag,
    multi_select: Tag,
    date: Calendar,
    checkbox: CheckSquare,
    url: Link2,
    person: User,
};

// ============================================
// 🎯 데이터베이스 테이블
// ============================================
export function AppFlowyDatabaseTable({
    theme = 'dark',
    columns: initialColumns = defaultColumns(),
    rows: initialRows = [],
    onChange,
}: DatabaseTableProps) {
    const colors = theme === 'dark' ? appFlowyDark : appFlowyLight;
    const { database } = appFlowySpacing;

    const [columns, setColumns] = useState<Column[]>(initialColumns);
    const [rows, setRows] = useState<Row[]>(initialRows);
    const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    // 행 추가
    const addRow = () => {
        const newRow: Row = {
            id: `row-${Date.now()}`,
            cells: columns.reduce((acc, col) => ({
                ...acc,
                [col.id]: getDefaultValue(col.type)
            }), {}),
        };
        setRows(prev => {
            const next = [...prev, newRow];
            onChange?.(columns, next);
            return next;
        });
    };

    // 셀 값 업데이트
    const updateCell = (rowId: string, colId: string, value: any) => {
        setRows(prev => {
            const next = prev.map(row =>
                row.id === rowId
                    ? { ...row, cells: { ...row.cells, [colId]: value } }
                    : row
            );
            onChange?.(columns, next);
            return next;
        });
        setEditingCell(null);
    };

    // 행 삭제
    const deleteRow = (rowId: string) => {
        setRows(prev => {
            const next = prev.filter(row => row.id !== rowId);
            onChange?.(columns, next);
            return next;
        });
    };

    // 컬럼 추가
    const addColumn = () => {
        const newCol: Column = {
            id: `col-${Date.now()}`,
            name: 'New column',
            type: 'text',
            width: 150,
        };
        setColumns(prev => {
            const next = [...prev, newCol];
            onChange?.(next, rows);
            return next;
        });
    };

    return (
        <div
            style={{
                fontFamily: appFlowyFont.family.default,
                fontSize: appFlowyFont.size.sm,
                color: colors.text.body,
                overflow: 'auto',
            }}
        >
            {/* 툴바 */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderBottom: `1px solid ${colors.border.divider}`,
                }}
            >
                <button
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 10px',
                        border: 'none',
                        borderRadius: appFlowySpacing.radius.md,
                        backgroundColor: 'transparent',
                        color: colors.text.caption,
                        cursor: 'pointer',
                        fontSize: appFlowyFont.size.sm,
                        fontFamily: 'inherit',
                    }}
                >
                    <Filter size={14} />
                    Filter
                </button>
                <button
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 10px',
                        border: 'none',
                        borderRadius: appFlowySpacing.radius.md,
                        backgroundColor: 'transparent',
                        color: colors.text.caption,
                        cursor: 'pointer',
                        fontSize: appFlowyFont.size.sm,
                        fontFamily: 'inherit',
                    }}
                >
                    <ArrowUpDown size={14} />
                    Sort
                </button>
            </div>

            {/* 테이블 */}
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    tableLayout: 'fixed',
                }}
            >
                {/* 헤더 */}
                <thead>
                    <tr style={{ backgroundColor: colors.bg.tertiary }}>
                        {columns.map((col, index) => {
                            const Icon = COLUMN_ICONS[col.type];
                            return (
                                <th
                                    key={col.id}
                                    style={{
                                        width: col.width,
                                        height: database.headerHeight,
                                        padding: `0 ${database.cellPadding}px`,
                                        textAlign: 'left',
                                        fontWeight: appFlowyFont.weight.medium,
                                        borderBottom: `1px solid ${colors.border.divider}`,
                                        borderRight: index < columns.length - 1 ? `1px solid ${colors.border.secondary}` : 'none',
                                        position: 'relative',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Icon size={14} color={colors.icon.secondary} />
                                        <span>{col.name}</span>
                                        <ChevronDown size={12} color={colors.icon.secondary} style={{ marginLeft: 'auto' }} />
                                    </div>
                                </th>
                            );
                        })}
                        {/* 새 컬럼 추가 */}
                        <th
                            style={{
                                width: 40,
                                height: database.headerHeight,
                                textAlign: 'center',
                                borderBottom: `1px solid ${colors.border.divider}`,
                            }}
                        >
                            <button
                                onClick={addColumn}
                                style={{
                                    width: 24,
                                    height: 24,
                                    border: 'none',
                                    borderRadius: appFlowySpacing.radius.sm,
                                    backgroundColor: 'transparent',
                                    color: colors.icon.secondary,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Plus size={16} />
                            </button>
                        </th>
                    </tr>
                </thead>

                {/* 바디 */}
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={row.id}
                            onMouseEnter={() => setHoveredRow(row.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            style={{
                                backgroundColor: hoveredRow === row.id ? colors.bg.hover : 'transparent',
                            }}
                        >
                            {columns.map((col, index) => (
                                <td
                                    key={`${row.id}-${col.id}`}
                                    onClick={() => setEditingCell({ rowId: row.id, colId: col.id })}
                                    style={{
                                        height: database.rowHeight,
                                        padding: `0 ${database.cellPadding}px`,
                                        borderBottom: `1px solid ${colors.border.secondary}`,
                                        borderRight: index < columns.length - 1 ? `1px solid ${colors.border.secondary}` : 'none',
                                        cursor: 'text',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <CellRenderer
                                        column={col}
                                        value={row.cells[col.id]}
                                        isEditing={editingCell?.rowId === row.id && editingCell?.colId === col.id}
                                        colors={colors}
                                        onChange={(value) => updateCell(row.id, col.id, value)}
                                        onCancel={() => setEditingCell(null)}
                                    />
                                </td>
                            ))}
                            {/* 삭제 버튼 */}
                            <td
                                style={{
                                    width: 40,
                                    height: database.rowHeight,
                                    borderBottom: `1px solid ${colors.border.secondary}`,
                                    textAlign: 'center',
                                }}
                            >
                                {hoveredRow === row.id && (
                                    <button
                                        onClick={() => deleteRow(row.id)}
                                        style={{
                                            width: 24,
                                            height: 24,
                                            border: 'none',
                                            borderRadius: appFlowySpacing.radius.sm,
                                            backgroundColor: 'transparent',
                                            color: colors.status.error,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}

                    {/* 새 행 추가 */}
                    <tr>
                        <td
                            colSpan={columns.length + 1}
                            style={{
                                height: database.rowHeight,
                                padding: `0 ${database.cellPadding}px`,
                            }}
                        >
                            <button
                                onClick={addRow}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '4px 8px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: colors.text.caption,
                                    cursor: 'pointer',
                                    fontSize: appFlowyFont.size.sm,
                                    fontFamily: 'inherit',
                                }}
                            >
                                <Plus size={14} />
                                New
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

// ============================================
// 📝 셀 렌더러
// ============================================
interface CellRendererProps {
    column: Column;
    value: any;
    isEditing: boolean;
    colors: typeof appFlowyLight;
    onChange: (value: any) => void;
    onCancel: () => void;
}

function CellRenderer({ column, value, isEditing, colors, onChange, onCancel }: CellRendererProps) {
    switch (column.type) {
        case 'checkbox':
            return (
                <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    style={{ cursor: 'pointer', accentColor: colors.brand.main }}
                />
            );

        case 'select':
            const selectedOption = column.options?.find(o => o.id === value);
            if (selectedOption) {
                const tagColors = colors.tag[selectedOption.color];
                return (
                    <span
                        style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 4,
                            backgroundColor: tagColors.bg,
                            color: tagColors.text,
                            fontSize: appFlowyFont.size.xs,
                        }}
                    >
                        {selectedOption.name}
                    </span>
                );
            }
            return null;

        case 'date':
            if (isEditing) {
                return (
                    <input
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onCancel}
                        autoFocus
                        style={{
                            width: '100%',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: colors.text.body,
                            fontFamily: 'inherit',
                            fontSize: appFlowyFont.size.sm,
                            outline: 'none',
                        }}
                    />
                );
            }
            return value ? new Date(value).toLocaleDateString('ko-KR') : null;

        case 'url':
            if (isEditing) {
                return (
                    <input
                        type="url"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onCancel}
                        onKeyDown={(e) => e.key === 'Enter' && onCancel()}
                        autoFocus
                        placeholder="https://..."
                        style={{
                            width: '100%',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: colors.text.body,
                            fontFamily: 'inherit',
                            fontSize: appFlowyFont.size.sm,
                            outline: 'none',
                        }}
                    />
                );
            }
            return value ? (
                <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: colors.brand.main }}>
                    {value}
                </a>
            ) : null;

        case 'number':
            if (isEditing) {
                return (
                    <input
                        type="number"
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                        onBlur={onCancel}
                        onKeyDown={(e) => e.key === 'Enter' && onCancel()}
                        autoFocus
                        style={{
                            width: '100%',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: colors.text.body,
                            fontFamily: 'inherit',
                            fontSize: appFlowyFont.size.sm,
                            outline: 'none',
                        }}
                    />
                );
            }
            return value;

        default: // text
            if (isEditing) {
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onCancel}
                        onKeyDown={(e) => e.key === 'Enter' && onCancel()}
                        autoFocus
                        style={{
                            width: '100%',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: colors.text.body,
                            fontFamily: 'inherit',
                            fontSize: appFlowyFont.size.sm,
                            outline: 'none',
                        }}
                    />
                );
            }
            return value;
    }
}

// ============================================
// 🛠️ 기본값
// ============================================
function defaultColumns(): Column[] {
    return [
        { id: 'name', name: 'Name', type: 'text', width: 200 },
        {
            id: 'status',
            name: 'Status',
            type: 'select',
            width: 120,
            options: [
                { id: 'todo', name: 'To Do', color: 'lightGray' },
                { id: 'in-progress', name: 'In Progress', color: 'lightBlue' },
                { id: 'done', name: 'Done', color: 'lightGreen' },
            ],
        },
        { id: 'date', name: 'Date', type: 'date', width: 120 },
    ];
}

function getDefaultValue(type: ColumnType): any {
    switch (type) {
        case 'checkbox': return false;
        case 'number': return null;
        case 'multi_select': return [];
        default: return '';
    }
}

export default AppFlowyDatabaseTable;
