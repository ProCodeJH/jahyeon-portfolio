import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Typography from "@tiptap/extension-typography";
import { common, createLowlight } from "lowlight";
import { useCallback, useEffect } from "react";
import {
    Bold, Italic, Strikethrough, Code, Link as LinkIcon,
    Heading1, Heading2, Heading3, List, ListOrdered,
    CheckSquare, Quote, Minus, Image as ImageIcon, Code2
} from "lucide-react";
import "./BlockEditor.css";

const lowlight = createLowlight(common);

interface BlockEditorProps {
    content?: any;
    onChange?: (content: any) => void;
    onSave?: (content: any) => void;
    placeholder?: string;
    editable?: boolean;
    autoSave?: boolean;
    autoSaveDelay?: number;
}

export function BlockEditor({
    content,
    onChange,
    onSave,
    placeholder = "Type '/' for commands...",
    editable = true,
    autoSave = true,
    autoSaveDelay = 2000
}: BlockEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // Use lowlight version
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === "heading") {
                        return "Heading";
                    }
                    return placeholder;
                },
            }),
            Highlight.configure({
                multicolor: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "notion-link",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "notion-image",
                },
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: "notion-task-list",
                },
            }),
            TaskItem.configure({
                nested: true,
                HTMLAttributes: {
                    class: "notion-task-item",
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: "notion-code-block",
                },
            }),
            Typography,
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            const json = editor.getJSON();
            onChange?.(json);
        },
    });

    // Auto-save functionality
    useEffect(() => {
        if (!autoSave || !editor || !onSave) return;
        
        const timer = setTimeout(() => {
            onSave(editor.getJSON());
        }, autoSaveDelay);

        return () => clearTimeout(timer);
    }, [editor?.getJSON(), autoSave, autoSaveDelay, onSave]);

    // Slash command handling
    const handleSlashCommand = useCallback((command: string) => {
        if (!editor) return;

        switch (command) {
            case "h1":
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                break;
            case "h2":
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                break;
            case "h3":
                editor.chain().focus().toggleHeading({ level: 3 }).run();
                break;
            case "bullet":
                editor.chain().focus().toggleBulletList().run();
                break;
            case "numbered":
                editor.chain().focus().toggleOrderedList().run();
                break;
            case "todo":
                editor.chain().focus().toggleTaskList().run();
                break;
            case "quote":
                editor.chain().focus().toggleBlockquote().run();
                break;
            case "code":
                editor.chain().focus().toggleCodeBlock().run();
                break;
            case "divider":
                editor.chain().focus().setHorizontalRule().run();
                break;
            case "image":
                const url = window.prompt("Enter image URL:");
                if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                }
                break;
        }
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="notion-editor">
            {/* Bubble Menu - appears on text selection */}
            <BubbleMenu
                editor={editor}
                tippyOptions={{ duration: 100 }}
                className="notion-bubble-menu"
            >
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive("bold") ? "is-active" : ""}
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive("italic") ? "is-active" : ""}
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={editor.isActive("strike") ? "is-active" : ""}
                >
                    <Strikethrough className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={editor.isActive("code") ? "is-active" : ""}
                >
                    <Code className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={editor.isActive("highlight") ? "is-active" : ""}
                >
                    <span className="w-4 h-4 bg-yellow-300 rounded text-[10px] font-bold">H</span>
                </button>
                <button
                    onClick={() => {
                        const url = window.prompt("URL:");
                        if (url) {
                            editor.chain().focus().setLink({ href: url }).run();
                        }
                    }}
                    className={editor.isActive("link") ? "is-active" : ""}
                >
                    <LinkIcon className="w-4 h-4" />
                </button>
            </BubbleMenu>

            {/* Floating Menu - appears on empty lines */}
            <FloatingMenu
                editor={editor}
                tippyOptions={{ duration: 100 }}
                className="notion-floating-menu"
            >
                <div className="notion-slash-menu">
                    <p className="menu-label">Basic blocks</p>
                    <button onClick={() => handleSlashCommand("h1")}>
                        <Heading1 className="w-5 h-5" />
                        <div>
                            <span>Heading 1</span>
                            <span className="desc">Big section heading</span>
                        </div>
                    </button>
                    <button onClick={() => handleSlashCommand("h2")}>
                        <Heading2 className="w-5 h-5" />
                        <div>
                            <span>Heading 2</span>
                            <span className="desc">Medium section heading</span>
                        </div>
                    </button>
                    <button onClick={() => handleSlashCommand("h3")}>
                        <Heading3 className="w-5 h-5" />
                        <div>
                            <span>Heading 3</span>
                            <span className="desc">Small section heading</span>
                        </div>
                    </button>
                    <button onClick={() => handleSlashCommand("bullet")}>
                        <List className="w-5 h-5" />
                        <div>
                            <span>Bullet List</span>
                            <span className="desc">Create a simple bullet list</span>
                        </div>
                    </button>
                    <button onClick={() => handleSlashCommand("numbered")}>
                        <ListOrdered className="w-5 h-5" />
                        <div>
                            <span>Numbered List</span>
                            <span className="desc">Create a numbered list</span>
                        </div>
                    </button>
                    <button onClick={() => handleSlashCommand("todo")}>
                        <CheckSquare className="w-5 h-5" />
                        <div>
                            <span>To-do List</span>
                            <span className="desc">Track tasks with a to-do list</span>
                        </div>
                    </button>
                    <button onClick={() => handleSlashCommand("quote")}>
                        <Quote className="w-5 h-5" />
                        <div>
                            <span>Quote</span>
                            <span className="desc">Capture a quote</span>
                        </div>
                    </button>
                    <button onClick={() => handleSlashCommand("code")}>
                        <Code2 className="w-5 h-5" />
                        <div>
                            <span>Code Block</span>
                            <span className="desc">Capture a code snippet</span>
                        </div>
                    </button>
                    <button onClick={() => handleSlashCommand("divider")}>
                        <Minus className="w-5 h-5" />
                        <div>
                            <span>Divider</span>
                            <span className="desc">Visual divider line</span>
                        </div>
                    </button>
                    <button onClick={() => handleSlashCommand("image")}>
                        <ImageIcon className="w-5 h-5" />
                        <div>
                            <span>Image</span>
                            <span className="desc">Embed an image</span>
                        </div>
                    </button>
                </div>
            </FloatingMenu>

            {/* Main Editor Content */}
            <EditorContent editor={editor} className="notion-editor-content" />
        </div>
    );
}

export default BlockEditor;
