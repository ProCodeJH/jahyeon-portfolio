/**
 * types/blocks.ts
 * 노션 스타일 블록 에디터 타입 정의
 */

// ============================================
// 🧱 블록 타입
// ============================================
export type BlockType =
    | "paragraph"      // 일반 텍스트
    | "heading1"       // H1 제목
    | "heading2"       // H2 제목
    | "heading3"       // H3 제목
    | "bulletList"     // 불릿 리스트
    | "numberedList"   // 번호 리스트
    | "todoList"       // 체크리스트
    | "toggle"         // 접기/펼치기
    | "quote"          // 인용
    | "callout"        // 콜아웃 (정보박스)
    | "code"           // 코드 블록
    | "divider"        // 구분선
    | "image"          // 이미지
    | "video"          // 비디오 (YouTube 임베드)
    | "file"           // 파일 첨부
    | "table"          // 테이블
    | "embed"          // 외부 임베드
    | "bookmark"       // 링크 북마크
    | "equation";      // 수식 (KaTeX)

// ============================================
// 🎨 블록 콘텐츠 타입
// ============================================
export interface ParagraphContent {
    text: string;
    marks?: TextMark[];
}

export interface HeadingContent {
    text: string;
    level: 1 | 2 | 3;
}

export interface ListContent {
    items: ListItem[];
}

export interface ListItem {
    id: string;
    text: string;
    checked?: boolean; // todoList용
    children?: ListItem[];
}

export interface CodeContent {
    code: string;
    language: string;
}

export interface ImageContent {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
    caption?: string;
}

export interface VideoContent {
    url: string;
    provider: "youtube" | "vimeo" | "upload";
    caption?: string;
}

export interface CalloutContent {
    emoji: string;
    text: string;
    color?: CalloutColor;
}

export interface QuoteContent {
    text: string;
    author?: string;
}

export interface ToggleContent {
    title: string;
    children: Block[];
}

export interface TableContent {
    rows: TableRow[];
    hasHeader: boolean;
}

export interface TableRow {
    cells: string[];
}

export interface EmbedContent {
    url: string;
    html?: string;
}

export interface BookmarkContent {
    url: string;
    title?: string;
    description?: string;
    image?: string;
}

// ============================================
// 📝 텍스트 마크 (인라인 스타일)
// ============================================
export type TextMark =
    | { type: "bold" }
    | { type: "italic" }
    | { type: "underline" }
    | { type: "strike" }
    | { type: "code" }
    | { type: "link"; href: string }
    | { type: "highlight"; color: string };

// ============================================
// 🎨 색상 옵션
// ============================================
export type CalloutColor =
    | "gray"
    | "brown"
    | "orange"
    | "yellow"
    | "green"
    | "blue"
    | "purple"
    | "pink"
    | "red";

// ============================================
// 🧱 메인 블록 인터페이스
// ============================================
export interface Block {
    id: string;
    type: BlockType;
    content: BlockContent;
    children?: Block[];
    createdAt?: Date;
    updatedAt?: Date;
}

export type BlockContent =
    | ParagraphContent
    | HeadingContent
    | ListContent
    | CodeContent
    | ImageContent
    | VideoContent
    | CalloutContent
    | QuoteContent
    | ToggleContent
    | TableContent
    | EmbedContent
    | BookmarkContent
    | null; // divider 등

// ============================================
// 📋 슬래시 명령어
// ============================================
export interface SlashCommand {
    id: BlockType;
    label: string;
    shortcut: string;
    icon: string;
    keywords: string[];
}

export const SLASH_COMMANDS: SlashCommand[] = [
    { id: "paragraph", label: "텍스트", shortcut: "/p", icon: "📝", keywords: ["text", "paragraph"] },
    { id: "heading1", label: "제목 1", shortcut: "/h1", icon: "H₁", keywords: ["h1", "heading", "title"] },
    { id: "heading2", label: "제목 2", shortcut: "/h2", icon: "H₂", keywords: ["h2", "heading"] },
    { id: "heading3", label: "제목 3", shortcut: "/h3", icon: "H₃", keywords: ["h3", "heading"] },
    { id: "bulletList", label: "불릿 리스트", shortcut: "/bullet", icon: "•", keywords: ["bullet", "list", "ul"] },
    { id: "numberedList", label: "번호 리스트", shortcut: "/number", icon: "1.", keywords: ["number", "list", "ol"] },
    { id: "todoList", label: "체크리스트", shortcut: "/todo", icon: "☐", keywords: ["todo", "check", "task"] },
    { id: "toggle", label: "토글", shortcut: "/toggle", icon: "▶", keywords: ["toggle", "collapse", "expand"] },
    {
        id: "quote", label: "인용", shortcut: "/quote", icon: """, keywords: ["quote", "blockquote"] },
  { id: "callout", label: "콜아웃", shortcut: "/callout", icon: "💡", keywords: ["callout", "info", "tip"] },
  { id: "code", label: "코드", shortcut: "/code", icon: "</>", keywords: ["code", "snippet"] },
    { id: "divider", label: "구분선", shortcut: "/divider", icon: "—", keywords: ["divider", "hr", "line"] },
    { id: "image", label: "이미지", shortcut: "/image", icon: "🖼️", keywords: ["image", "picture", "photo"] },
    { id: "video", label: "비디오", shortcut: "/video", icon: "🎬", keywords: ["video", "youtube"] },
    { id: "table", label: "테이블", shortcut: "/table", icon: "📊", keywords: ["table", "grid"] },
];

// ============================================
// 🔧 유틸리티
// ============================================
export function generateBlockId(): string {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createEmptyBlock(type: BlockType = "paragraph"): Block {
    return {
        id: generateBlockId(),
        type,
        content: getDefaultContent(type),
    };
}

export function getDefaultContent(type: BlockType): BlockContent {
    switch (type) {
        case "paragraph":
            return { text: "" };
        case "heading1":
        case "heading2":
        case "heading3":
            return { text: "", level: parseInt(type.slice(-1)) as 1 | 2 | 3 };
        case "bulletList":
        case "numberedList":
        case "todoList":
            return { items: [{ id: generateBlockId(), text: "" }] };
        case "code":
            return { code: "", language: "javascript" };
        case "callout":
            return { emoji: "💡", text: "", color: "blue" };
        case "quote":
            return { text: "" };
        case "toggle":
            return { title: "", children: [] };
        case "image":
            return { url: "" };
        case "video":
            return { url: "", provider: "youtube" };
        case "table":
            return { rows: [{ cells: ["", ""] }], hasHeader: true };
        case "divider":
        default:
            return null;
    }
}
