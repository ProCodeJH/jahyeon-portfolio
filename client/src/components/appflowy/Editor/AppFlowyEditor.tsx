/**
 * AppFlowy Pixel-Perfect Editor
 * 
 * AppFlowy 데스크톱 앱과 동일한 블록 에디터
 */

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
    appFlowyLight, appFlowyDark, appFlowyFont, appFlowySpacing, ThemeMode
} from '@/styles/appflowy/design-system';
import {
    GripVertical, Plus, Type, Heading1, Heading2, Heading3,
    List, ListOrdered, CheckSquare, Quote, Code, Minus, Image,
    Table, Link, MoreHorizontal
} from 'lucide-react';

// ============================================
// 🔧 타입 정의
// ============================================
export type BlockType =
    | 'paragraph'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'bullet_list'
    | 'numbered_list'
    | 'todo'
    | 'quote'
    | 'code'
    | 'divider'
    | 'image'
    | 'table';

export interface Block {
    id: string;
    type: BlockType;
    content: string;
    checked?: boolean; // for todo
    children?: Block[];
    properties?: Record<string, any>;
}

export interface EditorProps {
    theme?: ThemeMode;
    blocks?: Block[];
    onChange?: (blocks: Block[]) => void;
    placeholder?: string;
}

// ============================================
// 🎨 블록 타입별 스타일
// ============================================
const BLOCK_STYLES: Record<BlockType, React.CSSProperties> = {
    paragraph: {},
    heading1: {
        fontSize: appFlowyFont.size['3xl'],
        fontWeight: appFlowyFont.weight.bold,
        lineHeight: 1.25,
        marginTop: 24,
        marginBottom: 4,
    },
    heading2: {
        fontSize: appFlowyFont.size['2xl'],
        fontWeight: appFlowyFont.weight.semibold,
        lineHeight: 1.3,
        marginTop: 20,
        marginBottom: 4,
    },
    heading3: {
        fontSize: appFlowyFont.size.xl,
        fontWeight: appFlowyFont.weight.semibold,
        lineHeight: 1.4,
        marginTop: 16,
        marginBottom: 4,
    },
    bullet_list: { paddingLeft: 24 },
    numbered_list: { paddingLeft: 24 },
    todo: { paddingLeft: 28 },
    quote: {
        paddingLeft: 16,
        borderLeft: '3px solid',
        fontStyle: 'italic',
    },
    code: {
        fontFamily: appFlowyFont.family.code,
        fontSize: appFlowyFont.size.sm,
        backgroundColor: 'var(--code-bg)',
        padding: '12px 16px',
        borderRadius: appFlowySpacing.radius.md,
    },
    divider: {},
    image: {},
    table: {},
};

// ============================================
// 📋 슬래시 메뉴 옵션
// ============================================
const SLASH_MENU_OPTIONS = [
    { type: 'paragraph', icon: Type, label: 'Text', description: 'Plain text' },
    { type: 'heading1', icon: Heading1, label: 'Heading 1', description: 'Big section heading' },
    { type: 'heading2', icon: Heading2, label: 'Heading 2', description: 'Medium section heading' },
    { type: 'heading3', icon: Heading3, label: 'Heading 3', description: 'Small section heading' },
    { type: 'bullet_list', icon: List, label: 'Bulleted list', description: 'Simple list' },
    { type: 'numbered_list', icon: ListOrdered, label: 'Numbered list', description: 'Numbered list' },
    { type: 'todo', icon: CheckSquare, label: 'To-do list', description: 'Track tasks' },
    { type: 'quote', icon: Quote, label: 'Quote', description: 'Capture a quote' },
    { type: 'code', icon: Code, label: 'Code', description: 'Code snippet' },
    { type: 'divider', icon: Minus, label: 'Divider', description: 'Visual divider' },
];

// ============================================
// 🎯 메인 에디터 컴포넌트
// ============================================
export function AppFlowyEditor({
    theme = 'dark',
    blocks = [],
    onChange,
    placeholder = "Type '/' for commands...",
}: EditorProps) {
    const colors = theme === 'dark' ? appFlowyDark : appFlowyLight;
    const { editor } = appFlowySpacing;

    const [localBlocks, setLocalBlocks] = useState<Block[]>(
        blocks.length > 0 ? blocks : [createBlock('paragraph')]
    );
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
    const [slashMenuOpen, setSlashMenuOpen] = useState(false);
    const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
    const [slashFilter, setSlashFilter] = useState('');

    // 블록 업데이트
    const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
        setLocalBlocks(prev => {
            const next = prev.map(b => b.id === id ? { ...b, ...updates } : b);
            onChange?.(next);
            return next;
        });
    }, [onChange]);

    // 블록 추가
    const addBlock = useCallback((afterId: string, type: BlockType = 'paragraph') => {
        const newBlock = createBlock(type);
        setLocalBlocks(prev => {
            const index = prev.findIndex(b => b.id === afterId);
            const next = [...prev];
            next.splice(index + 1, 0, newBlock);
            onChange?.(next);
            return next;
        });
        setFocusedBlockId(newBlock.id);
        return newBlock.id;
    }, [onChange]);

    // 블록 삭제
    const deleteBlock = useCallback((id: string) => {
        setLocalBlocks(prev => {
            if (prev.length <= 1) return prev;
            const index = prev.findIndex(b => b.id === id);
            const next = prev.filter(b => b.id !== id);
            onChange?.(next);
            // 이전 블록으로 포커스 이동
            if (index > 0) setFocusedBlockId(prev[index - 1].id);
            return next;
        });
    }, [onChange]);

    // 블록 타입 변경
    const changeBlockType = useCallback((id: string, newType: BlockType) => {
        updateBlock(id, { type: newType });
        setSlashMenuOpen(false);
        setSlashFilter('');
    }, [updateBlock]);

    // 드래그 앤 드롭
    const handleDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return;

        setLocalBlocks(prev => {
            const next = [...prev];
            const [removed] = next.splice(result.source.index, 1);
            next.splice(result.destination!.index, 0, removed);
            onChange?.(next);
            return next;
        });
    }, [onChange]);

    // 키보드 이벤트
    const handleKeyDown = useCallback((e: KeyboardEvent, block: Block) => {
        // Enter: 새 블록 추가
        if (e.key === 'Enter' && !e.shiftKey && !slashMenuOpen) {
            e.preventDefault();
            addBlock(block.id);
        }

        // Backspace: 빈 블록 삭제 또는 타입 리셋
        if (e.key === 'Backspace' && block.content === '') {
            if (block.type !== 'paragraph') {
                e.preventDefault();
                changeBlockType(block.id, 'paragraph');
            } else if (localBlocks.length > 1) {
                e.preventDefault();
                deleteBlock(block.id);
            }
        }

        // 슬래시 메뉴
        if (e.key === '/' && block.content === '') {
            setSlashMenuOpen(true);
        }

        // Escape: 슬래시 메뉴 닫기
        if (e.key === 'Escape') {
            setSlashMenuOpen(false);
            setSlashFilter('');
        }
    }, [addBlock, changeBlockType, deleteBlock, localBlocks.length, slashMenuOpen]);

    // 필터된 슬래시 메뉴 옵션
    const filteredOptions = SLASH_MENU_OPTIONS.filter(opt =>
        opt.label.toLowerCase().includes(slashFilter.toLowerCase()) ||
        opt.description.toLowerCase().includes(slashFilter.toLowerCase())
    );

    return (
        <div
            style={{
                maxWidth: editor.maxWidth,
                margin: '0 auto',
                padding: `${editor.paddingY}px ${editor.paddingX}px`,
                fontFamily: appFlowyFont.family.default,
                fontSize: appFlowyFont.size.base,
                lineHeight: appFlowyFont.lineHeight.relaxed,
                color: colors.text.body,
                minHeight: '100vh',
                // CSS 변수로 코드 블록 배경색 전달
                ['--code-bg' as any]: colors.bg.tertiary,
            }}
        >
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="editor">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {localBlocks.map((block, index) => (
                                <Draggable key={block.id} draggableId={block.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            style={{
                                                ...provided.draggableProps.style,
                                                marginBottom: appFlowySpacing.gap.sm,
                                            }}
                                        >
                                            <EditorBlock
                                                block={block}
                                                colors={colors}
                                                isFocused={focusedBlockId === block.id}
                                                isDragging={snapshot.isDragging}
                                                dragHandleProps={provided.dragHandleProps}
                                                onContentChange={(content) => updateBlock(block.id, { content })}
                                                onFocus={() => setFocusedBlockId(block.id)}
                                                onKeyDown={(e) => handleKeyDown(e, block)}
                                                onAddBlock={() => addBlock(block.id)}
                                                onCheckToggle={() => updateBlock(block.id, { checked: !block.checked })}
                                                placeholder={index === 0 ? placeholder : undefined}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* 슬래시 메뉴 */}
            {slashMenuOpen && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                        onClick={() => setSlashMenuOpen(false)}
                    />
                    <div
                        style={{
                            position: 'fixed',
                            top: slashMenuPosition.top,
                            left: slashMenuPosition.left,
                            width: 320,
                            maxHeight: 320,
                            backgroundColor: colors.bg.surface,
                            border: `1px solid ${colors.border.primary}`,
                            borderRadius: appFlowySpacing.radius.lg,
                            boxShadow: colors.shadow.xl,
                            overflow: 'hidden',
                            zIndex: 50,
                        }}
                    >
                        <div style={{ padding: 8 }}>
                            <input
                                type="text"
                                placeholder="Filter..."
                                value={slashFilter}
                                onChange={(e) => setSlashFilter(e.target.value)}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: `1px solid ${colors.border.primary}`,
                                    borderRadius: appFlowySpacing.radius.md,
                                    backgroundColor: colors.bg.secondary,
                                    color: colors.text.body,
                                    fontSize: appFlowyFont.size.sm,
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                            {filteredOptions.map((opt) => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.type}
                                        onClick={() => changeBlockType(focusedBlockId!, opt.type as BlockType)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '10px 12px',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = colors.bg.hover;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: appFlowySpacing.radius.md,
                                                backgroundColor: colors.bg.tertiary,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: colors.icon.primary,
                                            }}
                                        >
                                            <Icon size={18} />
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{
                                                fontSize: appFlowyFont.size.sm,
                                                fontWeight: appFlowyFont.weight.medium,
                                                color: colors.text.title,
                                            }}>
                                                {opt.label}
                                            </div>
                                            <div style={{
                                                fontSize: appFlowyFont.size.xs,
                                                color: colors.text.caption,
                                            }}>
                                                {opt.description}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ============================================
// 📦 개별 블록 컴포넌트
// ============================================
interface EditorBlockProps {
    block: Block;
    colors: typeof appFlowyLight;
    isFocused: boolean;
    isDragging: boolean;
    dragHandleProps: any;
    onContentChange: (content: string) => void;
    onFocus: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
    onAddBlock: () => void;
    onCheckToggle: () => void;
    placeholder?: string;
}

function EditorBlock({
    block,
    colors,
    isFocused,
    isDragging,
    dragHandleProps,
    onContentChange,
    onFocus,
    onKeyDown,
    onAddBlock,
    onCheckToggle,
    placeholder,
}: EditorBlockProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const blockStyle = BLOCK_STYLES[block.type];

    // Divider 블록
    if (block.type === 'divider') {
        return (
            <div
                style={{
                    height: 1,
                    backgroundColor: colors.border.divider,
                    margin: '16px 0',
                }}
            />
        );
    }

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 4,
                borderRadius: appFlowySpacing.radius.md,
                backgroundColor: isDragging ? colors.bg.hover : 'transparent',
            }}
        >
            {/* 드래그 핸들 & 추가 버튼 */}
            <div
                style={{
                    position: 'absolute',
                    left: -36,
                    top: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.15s',
                }}
            >
                <button
                    onClick={onAddBlock}
                    style={{
                        width: 18,
                        height: 18,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.icon.secondary,
                        borderRadius: 4,
                    }}
                >
                    <Plus size={14} />
                </button>
                <div
                    {...dragHandleProps}
                    style={{
                        width: 14,
                        height: 18,
                        cursor: 'grab',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.icon.secondary,
                    }}
                >
                    <GripVertical size={14} />
                </div>
            </div>

            {/* Todo 체크박스 */}
            {block.type === 'todo' && (
                <input
                    type="checkbox"
                    checked={block.checked}
                    onChange={onCheckToggle}
                    style={{
                        width: 16,
                        height: 16,
                        marginTop: 4,
                        marginRight: 4,
                        cursor: 'pointer',
                        accentColor: colors.brand.main,
                    }}
                />
            )}

            {/* 불릿/숫자 */}
            {block.type === 'bullet_list' && (
                <span style={{ marginRight: 4, color: colors.text.caption }}>•</span>
            )}

            {/* 콘텐츠 영역 */}
            <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => onContentChange(e.currentTarget.textContent || '')}
                onFocus={onFocus}
                onKeyDown={onKeyDown as any}
                data-placeholder={placeholder}
                style={{
                    flex: 1,
                    outline: 'none',
                    minHeight: 24,
                    wordBreak: 'break-word',
                    color: block.type === 'todo' && block.checked
                        ? colors.text.caption
                        : colors.text.body,
                    textDecoration: block.type === 'todo' && block.checked
                        ? 'line-through'
                        : 'none',
                    borderLeftColor: block.type === 'quote' ? colors.brand.main : undefined,
                    ...blockStyle,
                }}
            >
                {block.content}
            </div>
        </div>
    );
}

// ============================================
// 🛠️ 유틸리티
// ============================================
function createBlock(type: BlockType = 'paragraph'): Block {
    return {
        id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        content: '',
        checked: type === 'todo' ? false : undefined,
    };
}

export default AppFlowyEditor;
