/**
 * NotionEditor.tsx - AppFlowy 스타일 블록 에디터
 * 
 * AppFlowy의 핵심 기능들을 TipTap으로 구현:
 * - 마크다운 스타일 자동 변환 (**bold**, _italic_)
 * - 슬래시 명령어 메뉴
 * - 상단 서식 툴바
 * - 색상 & 하이라이트 팔레트
 * - 깔끔한 미니멀 디자인
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { common, createLowlight } from 'lowlight';
import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
    Bold, Italic, Strikethrough, Code, Link as LinkIcon, Underline as UnderlineIcon,
    List, ListOrdered, CheckSquare, Quote, Minus, Highlighter,
    ImageIcon, Table as TableIcon, Code2, Heading1, Heading2, Heading3,
    Type, AlignLeft, AlignCenter, AlignRight, Palette, Undo, Redo
} from 'lucide-react';

const lowlight = createLowlight(common);

// ============================================
// 🎨 AppFlowy 스타일 색상 팔레트
// ============================================
const COLORS = [
    { name: 'Default', value: null },
    { name: 'Gray', value: '#9ca3af' },
    { name: 'Brown', value: '#a16207' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Yellow', value: '#ca8a04' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Red', value: '#dc2626' },
];

const HIGHLIGHT_COLORS = [
    { name: 'Default', value: null },
    { name: 'Gray', value: '#f3f4f6' },
    { name: 'Brown', value: '#fef3c7' },
    { name: 'Orange', value: '#ffedd5' },
    { name: 'Yellow', value: '#fef9c3' },
    { name: 'Green', value: '#dcfce7' },
    { name: 'Blue', value: '#dbeafe' },
    { name: 'Purple', value: '#f3e8ff' },
    { name: 'Pink', value: '#fce7f3' },
    { name: 'Red', value: '#fee2e2' },
];

interface NotionEditorProps {
    content?: string;
    onChange?: (html: string, json: any) => void;
    onImageUpload?: (file: File) => Promise<string | null>;
    placeholder?: string;
    editable?: boolean;
    className?: string;
    autofocus?: boolean;
    theme?: 'light' | 'dark';
}

// ============================================
// 🧱 슬래시 명령어 - AppFlowy 스타일
// ============================================
const SLASH_COMMANDS = [
    { id: 'paragraph', label: 'Text', description: 'Just start writing with plain text.', icon: Type, group: 'Basic' },
    { id: 'heading1', label: 'Heading 1', description: 'Big section heading.', icon: Heading1, group: 'Basic' },
    { id: 'heading2', label: 'Heading 2', description: 'Medium section heading.', icon: Heading2, group: 'Basic' },
    { id: 'heading3', label: 'Heading 3', description: 'Small section heading.', icon: Heading3, group: 'Basic' },
    { id: 'bulletList', label: 'Bulleted List', description: 'Create a simple bulleted list.', icon: List, group: 'Lists' },
    { id: 'orderedList', label: 'Numbered List', description: 'Create a list with numbering.', icon: ListOrdered, group: 'Lists' },
    { id: 'taskList', label: 'To-do List', description: 'Track tasks with a to-do list.', icon: CheckSquare, group: 'Lists' },
    { id: 'blockquote', label: 'Quote', description: 'Capture a quote.', icon: Quote, group: 'Basic' },
    { id: 'codeBlock', label: 'Code', description: 'Capture a code snippet.', icon: Code2, group: 'Advanced' },
    { id: 'horizontalRule', label: 'Divider', description: 'Visually divide blocks.', icon: Minus, group: 'Advanced' },
    { id: 'image', label: 'Image', description: 'Upload or embed an image.', icon: ImageIcon, group: 'Media' },
    { id: 'table', label: 'Table', description: 'Add a simple table.', icon: TableIcon, group: 'Advanced' },
];

// ============================================
// 🚀 NotionEditor Component
// ============================================
export function NotionEditor({
    content = '',
    onChange,
    onImageUpload,
    placeholder = "Type '/' for commands...",
    editable = true,
    className,
    autofocus = false,
    theme = 'dark',
}: NotionEditorProps) {
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
    const [slashQuery, setSlashQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // 테마 기반 스타일
    const themeStyles = theme === 'light' ? {
        bg: 'bg-white',
        text: 'text-gray-900',
        textMuted: 'text-gray-500',
        border: 'border-gray-200',
        hover: 'hover:bg-gray-100',
        menu: 'bg-white shadow-xl border-gray-200',
        menuHover: 'hover:bg-gray-50',
        selected: 'bg-blue-50 text-blue-600',
        accent: 'text-blue-600',
        toolbar: 'bg-gray-50 border-gray-200',
    } : {
        bg: 'bg-transparent',
        text: 'text-white',
        textMuted: 'text-gray-400',
        border: 'border-white/10',
        hover: 'hover:bg-white/5',
        menu: 'bg-[#1a1a2e] shadow-2xl border-white/10',
        menuHover: 'hover:bg-white/5',
        selected: 'bg-electric/20 text-electric',
        accent: 'text-electric',
        toolbar: 'bg-[#16162a] border-white/10',
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
            Image.configure({
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full my-4 shadow-lg',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: theme === 'light'
                        ? 'text-blue-600 underline hover:text-blue-800'
                        : 'text-electric underline hover:text-electric-dim',
                },
            }),
            TaskList.configure({
                HTMLAttributes: { class: 'not-prose' },
            }),
            TaskItem.configure({
                nested: true,
                HTMLAttributes: { class: 'flex items-start gap-2' },
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: theme === 'light'
                        ? 'bg-gray-100 text-gray-800 rounded-lg p-4 my-4 font-mono text-sm overflow-x-auto'
                        : 'bg-[#0d0d1a] rounded-lg p-4 my-4 font-mono text-sm overflow-x-auto border border-white/10',
                },
            }),
            Table.configure({ resizable: true }),
            TableRow,
            TableCell.configure({
                HTMLAttributes: {
                    class: theme === 'light' ? 'border border-gray-200 p-2' : 'border border-white/10 p-2',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: theme === 'light'
                        ? 'border border-gray-200 p-2 bg-gray-50 font-semibold'
                        : 'border border-white/10 p-2 bg-white/5 font-semibold',
                },
            }),
            Typography, // **bold**, _italic_ 자동 변환
            Underline,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            Color,
        ],
        content,
        editable,
        autofocus,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML(), editor.getJSON());
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose max-w-none focus:outline-none min-h-[200px] px-4 py-2',
                    theme === 'light'
                        ? 'prose-gray prose-headings:text-gray-900 prose-p:text-gray-700'
                        : 'prose-invert prose-headings:text-white prose-p:text-white/80',
                    className
                ),
            },
            handleKeyDown: (view, event) => {
                if (event.key === '/' && !showSlashMenu) {
                    const { from } = view.state.selection;
                    const coords = view.coordsAtPos(from);
                    setSlashMenuPosition({ top: coords.bottom + 8, left: coords.left });
                    setShowSlashMenu(true);
                    setSlashQuery('');
                    setSelectedIndex(0);
                    return false;
                }

                if (showSlashMenu) {
                    if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
                        return true;
                    }
                    if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                        return true;
                    }
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        executeCommand(filteredCommands[selectedIndex]?.id);
                        return true;
                    }
                    if (event.key === 'Escape') {
                        setShowSlashMenu(false);
                        return true;
                    }
                }
                return false;
            },
        },
    });

    const filteredCommands = SLASH_COMMANDS.filter(
        (cmd) => cmd.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
            cmd.description.toLowerCase().includes(slashQuery.toLowerCase())
    );

    const executeCommand = useCallback((id: string) => {
        if (!editor) return;
        setShowSlashMenu(false);

        editor.chain().focus().deleteRange({
            from: editor.state.selection.from - slashQuery.length - 1,
            to: editor.state.selection.from,
        }).run();

        switch (id) {
            case 'paragraph': editor.chain().focus().setParagraph().run(); break;
            case 'heading1': editor.chain().focus().toggleHeading({ level: 1 }).run(); break;
            case 'heading2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
            case 'heading3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
            case 'bulletList': editor.chain().focus().toggleBulletList().run(); break;
            case 'orderedList': editor.chain().focus().toggleOrderedList().run(); break;
            case 'taskList': editor.chain().focus().toggleTaskList().run(); break;
            case 'blockquote': editor.chain().focus().toggleBlockquote().run(); break;
            case 'codeBlock': editor.chain().focus().toggleCodeBlock().run(); break;
            case 'horizontalRule': editor.chain().focus().setHorizontalRule().run(); break;
            case 'image':
                if (onImageUpload) {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                            const url = await onImageUpload(file);
                            if (url) editor.chain().focus().setImage({ src: url }).run();
                        }
                    };
                    input.click();
                } else {
                    const url = prompt('Enter image URL:');
                    if (url) editor.chain().focus().setImage({ src: url }).run();
                }
                break;
            case 'table': editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); break;
        }
    }, [editor, slashQuery, onImageUpload]);

    useEffect(() => {
        if (!showSlashMenu || !editor) return;
        const handleInput = () => {
            const { from } = editor.state.selection;
            const text = editor.state.doc.textBetween(Math.max(0, from - 20), from, '\n');
            const match = text.match(/\/([^/]*)$/);
            if (match) {
                setSlashQuery(match[1]);
                setSelectedIndex(0);
            } else {
                setShowSlashMenu(false);
            }
        };
        editor.on('update', handleInput);
        return () => { editor.off('update', handleInput); };
    }, [showSlashMenu, editor]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowSlashMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!editor) return null;

    const ToolbarButton = ({ onClick, active, children, title }: any) => (
        <button
            onClick={onClick}
            className={cn(
                'p-1.5 rounded transition-colors',
                active ? themeStyles.selected : themeStyles.menuHover
            )}
            title={title}
        >
            {children}
        </button>
    );

    const Divider = () => (
        <div className={cn('w-px h-5 mx-1', theme === 'light' ? 'bg-gray-300' : 'bg-white/20')} />
    );

    return (
        <div className={cn('relative rounded-xl border overflow-hidden', themeStyles.border)}>
            {/* AppFlowy 스타일 상단 툴바 */}
            <div className={cn('flex items-center gap-0.5 p-2 border-b flex-wrap', themeStyles.toolbar, themeStyles.border)}>
                {/* Undo/Redo */}
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                    <Undo className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                    <Redo className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                {/* 텍스트 서식 */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
                    <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
                    <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
                    <UnderlineIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                    <Strikethrough className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
                    <Code className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                {/* 색상 */}
                <div className="relative">
                    <ToolbarButton onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }} title="Text Color">
                        <Palette className="w-4 h-4" />
                    </ToolbarButton>
                    {showColorPicker && (
                        <div className={cn('absolute top-full left-0 mt-1 p-2 rounded-lg shadow-xl border grid grid-cols-5 gap-1 z-50', themeStyles.menu, themeStyles.border)}>
                            {COLORS.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => { color.value ? editor.chain().focus().setColor(color.value).run() : editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color.value || 'transparent' }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="relative">
                    <ToolbarButton onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }} active={editor.isActive('highlight')} title="Highlight">
                        <Highlighter className="w-4 h-4" />
                    </ToolbarButton>
                    {showHighlightPicker && (
                        <div className={cn('absolute top-full left-0 mt-1 p-2 rounded-lg shadow-xl border grid grid-cols-5 gap-1 z-50', themeStyles.menu, themeStyles.border)}>
                            {HIGHLIGHT_COLORS.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => { color.value ? editor.chain().focus().toggleHighlight({ color: color.value }).run() : editor.chain().focus().unsetHighlight().run(); setShowHighlightPicker(false); }}
                                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color.value || 'transparent' }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <Divider />

                {/* 링크 */}
                <ToolbarButton onClick={() => { const url = prompt('Enter URL:'); if (url) editor.chain().focus().setLink({ href: url }).run(); }} active={editor.isActive('link')} title="Link">
                    <LinkIcon className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                {/* 정렬 */}
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left">
                    <AlignLeft className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center">
                    <AlignCenter className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right">
                    <AlignRight className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                {/* 블록 */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
                    <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="To-do List">
                    <CheckSquare className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
                    <Quote className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
                    <Code2 className="w-4 h-4" />
                </ToolbarButton>
            </div>

            {/* 슬래시 메뉴 */}
            {showSlashMenu && (
                <div
                    ref={menuRef}
                    className={cn('fixed z-50 min-w-[280px] max-h-[400px] overflow-y-auto rounded-xl shadow-2xl border', themeStyles.menu, themeStyles.border)}
                    style={{ top: slashMenuPosition.top, left: slashMenuPosition.left }}
                >
                    <div className={cn('p-2 border-b', themeStyles.border)}>
                        <div className={cn('text-xs font-medium px-2', themeStyles.textMuted)}>BLOCKS</div>
                    </div>
                    <div className="p-1">
                        {filteredCommands.map((cmd, index) => {
                            const Icon = cmd.icon;
                            return (
                                <button
                                    key={cmd.id}
                                    onClick={() => executeCommand(cmd.id)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                                        index === selectedIndex ? themeStyles.selected : themeStyles.menuHover
                                    )}
                                >
                                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', theme === 'light' ? 'bg-gray-100' : 'bg-white/5')}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={cn('font-medium text-sm', themeStyles.text)}>{cmd.label}</div>
                                        <div className={cn('text-xs truncate', themeStyles.textMuted)}>{cmd.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                        {filteredCommands.length === 0 && (
                            <div className={cn('px-3 py-6 text-center text-sm', themeStyles.textMuted)}>No results found</div>
                        )}
                    </div>
                </div>
            )}

            {/* 에디터 본문 */}
            <EditorContent editor={editor} />

            {/* 하단 힌트 */}
            <div className={cn('px-4 py-2 text-xs border-t', themeStyles.border, themeStyles.textMuted)}>
                Type <kbd className={cn('px-1.5 py-0.5 rounded text-xs font-mono mx-0.5', theme === 'light' ? 'bg-gray-100' : 'bg-white/10')}>/</kbd> for commands •
                <kbd className={cn('px-1.5 py-0.5 rounded text-xs font-mono mx-0.5', theme === 'light' ? 'bg-gray-100' : 'bg-white/10')}>**text**</kbd> bold •
                <kbd className={cn('px-1.5 py-0.5 rounded text-xs font-mono mx-0.5', theme === 'light' ? 'bg-gray-100' : 'bg-white/10')}>_text_</kbd> italic
            </div>
        </div>
    );
}
