import { useState, useEffect, useCallback } from "react";

interface UseTypewriterOptions {
    words: string[];
    typeSpeed?: number;
    deleteSpeed?: number;
    delayBetweenWords?: number;
    loop?: boolean;
}

export function useTypewriter({
    words,
    typeSpeed = 100,
    deleteSpeed = 50,
    delayBetweenWords = 2000,
    loop = true,
}: UseTypewriterOptions) {
    const [text, setText] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);

    const handleTyping = useCallback(() => {
        const currentWord = words[wordIndex];

        if (isWaiting) return;

        if (!isDeleting) {
            // Typing
            if (text.length < currentWord.length) {
                setText(currentWord.slice(0, text.length + 1));
            } else {
                // Word complete, wait before deleting
                setIsWaiting(true);
                setTimeout(() => {
                    setIsWaiting(false);
                    setIsDeleting(true);
                }, delayBetweenWords);
            }
        } else {
            // Deleting
            if (text.length > 0) {
                setText(text.slice(0, -1));
            } else {
                setIsDeleting(false);
                if (loop || wordIndex < words.length - 1) {
                    setWordIndex((prev) => (prev + 1) % words.length);
                }
            }
        }
    }, [text, wordIndex, isDeleting, isWaiting, words, delayBetweenWords, loop]);

    useEffect(() => {
        const speed = isDeleting ? deleteSpeed : typeSpeed;
        const timer = setTimeout(handleTyping, speed);
        return () => clearTimeout(timer);
    }, [handleTyping, isDeleting, typeSpeed, deleteSpeed]);

    return { text, isTyping: !isWaiting && !isDeleting };
}

export default useTypewriter;
