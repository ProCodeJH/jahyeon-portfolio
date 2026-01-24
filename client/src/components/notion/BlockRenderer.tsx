/**
 * BlockRenderer.tsx
 * 블록 콘텐츠 읽기 전용 렌더러
 * 에디터 없이 HTML 렌더링만 수행
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface BlockRendererProps {
    content: string; // HTML 콘텐츠 (에디터에서 생성)
    className?: string;
}

export function BlockRenderer({ content, className }: BlockRendererProps) {
    // XSS 방지를 위한 안전한 HTML 정제 (실제 프로덕션에서는 DOMPurify 사용 권장)
    const sanitizedContent = useMemo(() => {
        // 기본적인 스크립트 태그 제거
        return content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '');
    }, [content]);

    return (
        <div
            className={cn(
                'notion-renderer prose prose-invert max-w-none',
                'prose-headings:font-light prose-headings:text-white',
                'prose-p:text-white/80 prose-p:leading-relaxed',
                'prose-strong:text-white prose-strong:font-semibold',
                'prose-code:text-emerald-400 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded',
                'prose-blockquote:border-l-emerald-400 prose-blockquote:text-white/60',
                'prose-li:text-white/80',
                'prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline',
                className
            )}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
    );
}

/**
 * 기존 Markdown 콘텐츠를 HTML로 변환하는 유틸리티
 * 하위 호환성을 위해 사용
 */
export function markdownToHtml(markdown: string): string {
    // 간단한 마크다운 → HTML 변환
    // 실제 프로덕션에서는 marked 또는 remark 사용 권장
    return markdown
        // 제목
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // 굵게, 기울임
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        // 코드
        .replace(/`(.+?)`/g, '<code>$1</code>')
        // 링크
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        // 줄바꿈
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        // 리스트 (간단 버전)
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // 단락 감싸기
        .replace(/^(?!<[hul])/gim, '<p>')
        .replace(/(?<![>])$/gim, '</p>');
}

export default BlockRenderer;
