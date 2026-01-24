/**
 * AppFlowy Pixel-Perfect Kanban Board
 * 
 * Notion/AppFlowy 스타일 칸반 보드
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    appFlowyLight, appFlowyDark, appFlowyFont, appFlowySpacing, ThemeMode
} from '@/styles/appflowy/design-system';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';

// ============================================
// 🔧 타입 정의
// ============================================
export interface KanbanCard {
    id: string;
    title: string;
    status: string;
    properties?: Record<string, any>;
}

export interface KanbanColumn {
    id: string;
    name: string;
    color: keyof typeof appFlowyLight.tag;
}

export interface KanbanBoardProps {
    theme?: ThemeMode;
    columns?: KanbanColumn[];
    cards?: KanbanCard[];
    onChange?: (cards: KanbanCard[]) => void;
}

// ============================================
// 🎯 칸반 보드
// ============================================
export function AppFlowyKanbanBoard({
    theme = 'dark',
    columns: initialColumns = defaultColumns(),
    cards: initialCards = [],
    onChange,
}: KanbanBoardProps) {
    const colors = theme === 'dark' ? appFlowyDark : appFlowyLight;
    const { database } = appFlowySpacing;

    const [columns] = useState<KanbanColumn[]>(initialColumns);
    const [cards, setCards] = useState<KanbanCard[]>(initialCards);
    const [draggingCard, setDraggingCard] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    // 컬럼별 카드 필터링
    const getCardsForColumn = (columnId: string) => {
        return cards.filter(card => card.status === columnId);
    };

    // 카드 추가
    const addCard = (columnId: string) => {
        const newCard: KanbanCard = {
            id: `card-${Date.now()}`,
            title: '',
            status: columnId,
        };
        setCards(prev => {
            const next = [...prev, newCard];
            onChange?.(next);
            return next;
        });
    };

    // 카드 업데이트
    const updateCard = (cardId: string, updates: Partial<KanbanCard>) => {
        setCards(prev => {
            const next = prev.map(card =>
                card.id === cardId ? { ...card, ...updates } : card
            );
            onChange?.(next);
            return next;
        });
    };

    // 카드 삭제
    const deleteCard = (cardId: string) => {
        setCards(prev => {
            const next = prev.filter(card => card.id !== cardId);
            onChange?.(next);
            return next;
        });
    };

    // 카드 이동
    const moveCard = (cardId: string, toColumnId: string) => {
        setCards(prev => {
            const next = prev.map(card =>
                card.id === cardId ? { ...card, status: toColumnId } : card
            );
            onChange?.(next);
            return next;
        });
    };

    // 드래그 시작
    const handleDragStart = (cardId: string) => {
        setDraggingCard(cardId);
    };

    // 드래그 종료
    const handleDragEnd = () => {
        if (draggingCard && dragOverColumn) {
            moveCard(draggingCard, dragOverColumn);
        }
        setDraggingCard(null);
        setDragOverColumn(null);
    };

    return (
        <div
            style={{
                display: 'flex',
                gap: database.kanbanGap * 2,
                padding: 16,
                overflowX: 'auto',
                minHeight: 400,
                fontFamily: appFlowyFont.family.default,
            }}
        >
            {columns.map((column) => {
                const columnCards = getCardsForColumn(column.id);
                const tagColors = colors.tag[column.color];
                const isDropTarget = dragOverColumn === column.id;

                return (
                    <div
                        key={column.id}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverColumn(column.id);
                        }}
                        onDragLeave={() => setDragOverColumn(null)}
                        onDrop={handleDragEnd}
                        style={{
                            width: database.kanbanCardWidth,
                            flexShrink: 0,
                            borderRadius: appFlowySpacing.radius.lg,
                            backgroundColor: isDropTarget ? colors.bg.hover : colors.bg.secondary,
                            transition: 'background-color 0.15s',
                        }}
                    >
                        {/* 컬럼 헤더 */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '12px 12px 8px',
                            }}
                        >
                            <div
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: tagColors.text,
                                }}
                            />
                            <span
                                style={{
                                    fontSize: appFlowyFont.size.sm,
                                    fontWeight: appFlowyFont.weight.medium,
                                    color: colors.text.title,
                                }}
                            >
                                {column.name}
                            </span>
                            <span
                                style={{
                                    fontSize: appFlowyFont.size.xs,
                                    color: colors.text.caption,
                                    backgroundColor: colors.bg.tertiary,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                }}
                            >
                                {columnCards.length}
                            </span>
                            <button
                                onClick={() => addCard(column.id)}
                                style={{
                                    marginLeft: 'auto',
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
                        </div>

                        {/* 카드 목록 */}
                        <div style={{ padding: '0 8px 8px', minHeight: 100 }}>
                            <AnimatePresence>
                                {columnCards.map((card) => (
                                    <KanbanCardComponent
                                        key={card.id}
                                        card={card}
                                        colors={colors}
                                        isDragging={draggingCard === card.id}
                                        onDragStart={() => handleDragStart(card.id)}
                                        onUpdate={(updates) => updateCard(card.id, updates)}
                                        onDelete={() => deleteCard(card.id)}
                                    />
                                ))}
                            </AnimatePresence>

                            {/* 빈 상태 */}
                            {columnCards.length === 0 && (
                                <button
                                    onClick={() => addCard(column.id)}
                                    style={{
                                        width: '100%',
                                        padding: 24,
                                        border: `2px dashed ${colors.border.primary}`,
                                        borderRadius: appFlowySpacing.radius.md,
                                        backgroundColor: 'transparent',
                                        color: colors.text.caption,
                                        cursor: 'pointer',
                                        fontSize: appFlowyFont.size.sm,
                                        fontFamily: 'inherit',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                    }}
                                >
                                    <Plus size={14} />
                                    New
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* 새 컬럼 추가 */}
            <button
                style={{
                    width: database.kanbanCardWidth,
                    flexShrink: 0,
                    padding: 16,
                    border: `2px dashed ${colors.border.primary}`,
                    borderRadius: appFlowySpacing.radius.lg,
                    backgroundColor: 'transparent',
                    color: colors.text.caption,
                    cursor: 'pointer',
                    fontSize: appFlowyFont.size.sm,
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    minHeight: 100,
                }}
            >
                <Plus size={16} />
                Add Column
            </button>
        </div>
    );
}

// ============================================
// 🎴 칸반 카드
// ============================================
interface KanbanCardComponentProps {
    card: KanbanCard;
    colors: typeof appFlowyLight;
    isDragging: boolean;
    onDragStart: () => void;
    onUpdate: (updates: Partial<KanbanCard>) => void;
    onDelete: () => void;
}

function KanbanCardComponent({
    card,
    colors,
    isDragging,
    onDragStart,
    onUpdate,
    onDelete,
}: KanbanCardComponentProps) {
    const [isEditing, setIsEditing] = useState(!card.title);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            draggable
            onDragStart={onDragStart}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                padding: 12,
                marginBottom: 8,
                borderRadius: appFlowySpacing.radius.md,
                backgroundColor: colors.bg.surface,
                boxShadow: colors.shadow.sm,
                cursor: 'grab',
                position: 'relative',
            }}
        >
            {/* 제목 */}
            {isEditing ? (
                <input
                    type="text"
                    value={card.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                    autoFocus
                    placeholder="Untitled"
                    style={{
                        width: '100%',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: colors.text.body,
                        fontSize: appFlowyFont.size.sm,
                        fontFamily: 'inherit',
                        outline: 'none',
                    }}
                />
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    style={{
                        fontSize: appFlowyFont.size.sm,
                        color: colors.text.body,
                        cursor: 'text',
                    }}
                >
                    {card.title || 'Untitled'}
                </div>
            )}

            {/* 액션 버튼 */}
            {isHovered && (
                <div
                    style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 4,
                    }}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        style={{
                            width: 20,
                            height: 20,
                            border: 'none',
                            borderRadius: 4,
                            backgroundColor: colors.bg.tertiary,
                            color: colors.icon.secondary,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            )}
        </motion.div>
    );
}

// ============================================
// 🛠️ 기본값
// ============================================
function defaultColumns(): KanbanColumn[] {
    return [
        { id: 'todo', name: 'To Do', color: 'lightGray' },
        { id: 'in-progress', name: 'In Progress', color: 'lightBlue' },
        { id: 'done', name: 'Done', color: 'lightGreen' },
    ];
}

export default AppFlowyKanbanBoard;
