/**
 * AppFlowy Database - Table View
 * 
 * 스프레드시트 스타일의 테이블 뷰
 */

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppFlowyTheme } from '../contexts/ThemeContext';
import {
    Database, Property, Row, PropertyType, SELECT_COLORS,
    createDefaultRow, createDefaultProperty
} from './types';
import {
    Plus, GripVertical, ChevronDown, Trash2,
    Type, Hash, Calendar, CheckSquare, Link2, Mail, User, List
} from 'lucide-react';

// ============================================
// 🔧 Props
// ============================================
interface TableViewProps {
    database: Database;
    onDatabaseChange: (database: Database) => void;
    className?: string;
}

// ============================================
// 🎨 프로퍼티 타입 아이콘
// ============================================
const PROPERTY_ICONS: Record<PropertyType, React.ComponentType<any>> = {
    text: Type,
    number: Hash,
    date: Calendar,
    checkbox: CheckSquare,
    url: Link2,
    email: Mail,
    person: User,
    select: List,
    multi_select: List,
    file: Link2,
    relation: Link2,
};

// ============================================
// 🎯 TableView 컴포넌트
// ============================================
export function TableView({ database, onDatabaseChange, className }: TableViewProps) {
    const { isDark } = useAppFlowyTheme();
    const [editingCell, setEditingCell] = useState<{ rowId: string; propId: string } | null>(null);

    // 행 추가
    const addRow = () => {
        const newRow = createDefaultRow(database.properties);
        onDatabaseChange({
            ...database,
            rows: [...database.rows, newRow],
        });
    };

    // 컬럼 추가
    const addProperty = () => {
        const newProp = createDefaultProperty('text', `Column ${database.properties.length + 1}`);
        onDatabaseChange({
            ...database,
            properties: [...database.properties, newProp],
        });
    };

    // 셀 값 업데이트
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

    // 행 삭제
    const deleteRow = (rowId: string) => {
        onDatabaseChange({
            ...database,
            rows: database.rows.filter((row) => row.id !== rowId),
        });
    };

    // 프로퍼티 삭제
    const deleteProperty = (propId: string) => {
        if (propId === 'name') return; // 이름 컬럼은 삭제 불가
        onDatabaseChange({
            ...database,
            properties: database.properties.filter((p) => p.id !== propId),
        });
    };

    return (
        <div className={cn('overflow-auto', className)}>
            <table className={cn(
                'w-full border-collapse',
                isDark ? 'text-white' : 'text-gray-900'
            )}>
                {/* 헤더 */}
                <thead>
                    <tr className={cn(
                        'border-b',
                        isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                    )}>
                        {/* 핸들 컬럼 */}
                        <th className="w-8 p-2" />

                        {/* 프로퍼티 헤더 */}
                        {database.properties.filter((p) => p.isVisible !== false).map((prop) => (
                            <PropertyHeader
                                key={prop.id}
                                property={prop}
                                isDark={isDark}
                                onDelete={() => deleteProperty(prop.id)}
                            />
                        ))}

                        {/* 새 컬럼 추가 버튼 */}
                        <th className="w-10 p-2">
                            <button
                                onClick={addProperty}
                                className={cn(
                                    'w-full h-6 flex items-center justify-center rounded',
                                    'transition-colors',
                                    isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                                )}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </th>
                    </tr>
                </thead>

                {/* 바디 */}
                <tbody>
                    {database.rows.map((row) => (
                        <tr
                            key={row.id}
                            className={cn(
                                'group border-b transition-colors',
                                isDark
                                    ? 'border-white/5 hover:bg-white/[0.02]'
                                    : 'border-gray-100 hover:bg-gray-50/50'
                            )}
                        >
                            {/* 핸들 & 삭제 */}
                            <td className="w-8 p-1">
                                <div className="flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button
                                        onClick={() => deleteRow(row.id)}
                                        className={cn(
                                            'p-1 rounded transition-colors',
                                            isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-100',
                                            'text-red-500'
                                        )}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </td>

                            {/* 셀들 */}
                            {database.properties.filter((p) => p.isVisible !== false).map((prop) => (
                                <TableCell
                                    key={`${row.id}-${prop.id}`}
                                    property={prop}
                                    value={row.cells[prop.id]}
                                    isEditing={editingCell?.rowId === row.id && editingCell?.propId === prop.id}
                                    isDark={isDark}
                                    onStartEdit={() => setEditingCell({ rowId: row.id, propId: prop.id })}
                                    onEndEdit={() => setEditingCell(null)}
                                    onChange={(value) => updateCell(row.id, prop.id, value)}
                                />
                            ))}

                            {/* 빈 셀 (새 컬럼 자리) */}
                            <td className="w-10" />
                        </tr>
                    ))}

                    {/* 새 행 추가 */}
                    <tr>
                        <td colSpan={database.properties.length + 2}>
                            <button
                                onClick={addRow}
                                className={cn(
                                    'w-full py-2 px-3 text-left text-sm flex items-center gap-2',
                                    'transition-colors',
                                    isDark
                                        ? 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                )}
                            >
                                <Plus className="w-4 h-4" />
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
// 📋 프로퍼티 헤더
// ============================================
interface PropertyHeaderProps {
    property: Property;
    isDark: boolean;
    onDelete: () => void;
}

function PropertyHeader({ property, isDark, onDelete }: PropertyHeaderProps) {
    const [showMenu, setShowMenu] = useState(false);
    const Icon = PROPERTY_ICONS[property.type] || Type;

    return (
        <th
            className={cn(
                'relative p-2 text-left font-medium text-sm',
                'min-w-[120px] max-w-[300px]'
            )}
            style={{ width: property.width || 150 }}
        >
            <button
                onClick={() => setShowMenu(!showMenu)}
                className={cn(
                    'w-full flex items-center gap-1.5 px-1 py-0.5 rounded',
                    'transition-colors',
                    isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                )}
            >
                <Icon className="w-3.5 h-3.5 opacity-50" />
                <span className="flex-1 truncate text-left">{property.name}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
            </button>

            {/* 드롭다운 메뉴 */}
            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                    />
                    <div
                        className={cn(
                            'absolute top-full left-0 mt-1 w-48 py-1 rounded-lg shadow-xl z-20 border',
                            isDark ? 'bg-[#1E1F25] border-white/10' : 'bg-white border-gray-200'
                        )}
                    >
                        {property.id !== 'name' && (
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
                                <Trash2 className="w-4 h-4" />
                                Delete Property
                            </button>
                        )}
                    </div>
                </>
            )}
        </th>
    );
}

// ============================================
// 📝 테이블 셀
// ============================================
interface TableCellProps {
    property: Property;
    value: any;
    isEditing: boolean;
    isDark: boolean;
    onStartEdit: () => void;
    onEndEdit: () => void;
    onChange: (value: any) => void;
}

function TableCell({
    property,
    value,
    isEditing,
    isDark,
    onStartEdit,
    onEndEdit,
    onChange,
}: TableCellProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const renderContent = () => {
        switch (property.type) {
            case 'checkbox':
                return (
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="w-4 h-4 rounded cursor-pointer"
                    />
                );

            case 'select':
                const selectedOption = property.options?.find((o) => o.id === value);
                const colorDef = SELECT_COLORS.find((c) => c.name === selectedOption?.color);

                if (isEditing) {
                    return (
                        <div className={cn(
                            'absolute top-full left-0 mt-1 w-48 py-1 rounded-lg shadow-xl z-20 border',
                            isDark ? 'bg-[#1E1F25] border-white/10' : 'bg-white border-gray-200'
                        )}>
                            {property.options?.map((opt) => {
                                const optColor = SELECT_COLORS.find((c) => c.name === opt.color);
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => {
                                            onChange(opt.id);
                                            onEndEdit();
                                        }}
                                        className={cn(
                                            'w-full px-3 py-1.5 text-left text-sm flex items-center gap-2',
                                            isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                                        )}
                                    >
                                        <span
                                            className="px-2 py-0.5 rounded text-xs"
                                            style={{
                                                backgroundColor: optColor?.bg,
                                                color: optColor?.text,
                                            }}
                                        >
                                            {opt.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    );
                }

                return selectedOption ? (
                    <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                            backgroundColor: colorDef?.bg,
                            color: colorDef?.text,
                        }}
                    >
                        {selectedOption.name}
                    </span>
                ) : null;

            case 'date':
                if (isEditing) {
                    return (
                        <input
                            ref={inputRef}
                            type="date"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={onEndEdit}
                            className={cn(
                                'w-full bg-transparent outline-none',
                                isDark ? 'text-white' : 'text-gray-900'
                            )}
                        />
                    );
                }
                return value ? new Date(value).toLocaleDateString('ko-KR') : null;

            case 'url':
                if (isEditing) {
                    return (
                        <input
                            ref={inputRef}
                            type="url"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={onEndEdit}
                            onKeyDown={(e) => e.key === 'Enter' && onEndEdit()}
                            placeholder="https://..."
                            className={cn(
                                'w-full bg-transparent outline-none',
                                isDark ? 'text-white' : 'text-gray-900'
                            )}
                        />
                    );
                }
                return value ? (
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline truncate"
                    >
                        {value}
                    </a>
                ) : null;

            case 'number':
                if (isEditing) {
                    return (
                        <input
                            ref={inputRef}
                            type="number"
                            value={value ?? ''}
                            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                            onBlur={onEndEdit}
                            onKeyDown={(e) => e.key === 'Enter' && onEndEdit()}
                            className={cn(
                                'w-full bg-transparent outline-none',
                                isDark ? 'text-white' : 'text-gray-900'
                            )}
                        />
                    );
                }
                return value;

            default: // text
                if (isEditing) {
                    return (
                        <input
                            ref={inputRef}
                            type="text"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={onEndEdit}
                            onKeyDown={(e) => e.key === 'Enter' && onEndEdit()}
                            className={cn(
                                'w-full bg-transparent outline-none',
                                isDark ? 'text-white' : 'text-gray-900'
                            )}
                        />
                    );
                }
                return value;
        }
    };

    return (
        <td
            className={cn(
                'relative p-2 text-sm cursor-pointer',
                'border-r last:border-r-0',
                isDark ? 'border-white/5' : 'border-gray-100'
            )}
            onClick={() => {
                if (property.type !== 'checkbox' && !isEditing) {
                    onStartEdit();
                }
            }}
        >
            {renderContent()}
        </td>
    );
}

export default TableView;
