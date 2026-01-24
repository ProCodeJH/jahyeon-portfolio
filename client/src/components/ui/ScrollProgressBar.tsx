import { useState, useEffect } from "react";

export function ScrollProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(scrollPercent);
        };

        window.addEventListener("scroll", updateProgress);
        updateProgress();

        return () => window.removeEventListener("scroll", updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 transition-all duration-150 ease-out"
                style={{
                    width: `${progress}%`,
                    boxShadow: progress > 0 ? '0 0 10px rgba(168, 85, 247, 0.8), 0 0 20px rgba(236, 72, 153, 0.5)' : 'none'
                }}
            />
        </div>
    );
}

export default ScrollProgressBar;
