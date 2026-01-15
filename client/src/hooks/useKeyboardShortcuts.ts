import { useEffect, useCallback } from "react";
import { useLocation } from "wouter";

interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    action: () => void;
    description: string;
}

export function useKeyboardShortcuts() {
    const [, setLocation] = useLocation();

    const shortcuts: KeyboardShortcut[] = [
        { key: "h", action: () => setLocation("/"), description: "홈으로 이동" },
        { key: "p", action: () => setLocation("/projects"), description: "프로젝트로 이동" },
        { key: "r", action: () => setLocation("/resources"), description: "리소스로 이동" },
        { key: "c", action: () => setLocation("/code-editor"), description: "코드 에디터로 이동" },
        { key: "w", action: () => setLocation("/virtual-world"), description: "가상세계로 이동" },
        { key: "a", action: () => setLocation("/arduino-lab"), description: "아두이노 랩으로 이동" },
        {
            key: "t",
            action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
            description: "맨 위로 스크롤"
        },
        {
            key: "b",
            action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }),
            description: "맨 아래로 스크롤"
        },
        {
            key: "/",
            action: () => {
                // Show keyboard shortcuts help (can be extended)
                console.log("Keyboard Shortcuts: H=Home, P=Projects, R=Resources, C=Code, W=World, A=Arduino, T=Top, B=Bottom");
            },
            description: "단축키 도움말"
        },
    ];

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs or code editors
            const target = event.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable ||
                // Monaco Editor detection
                target.closest(".monaco-editor") ||
                target.getAttribute("role") === "code" ||
                target.classList.contains("inputarea") ||
                target.closest("[data-uri]") // Monaco's internal editor container
            ) {
                return;
            }

            // Find matching shortcut
            const shortcut = shortcuts.find(
                (s) =>
                    s.key.toLowerCase() === event.key.toLowerCase() &&
                    !!s.ctrlKey === event.ctrlKey &&
                    !!s.altKey === event.altKey &&
                    !!s.shiftKey === event.shiftKey
            );

            if (shortcut) {
                event.preventDefault();
                shortcut.action();
            }
        },
        [shortcuts]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return { shortcuts };
}

export default useKeyboardShortcuts;
