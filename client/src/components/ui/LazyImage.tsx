/**
 * LazyImage.tsx
 * 이미지 지연 로딩 컴포넌트
 * Intersection Observer를 활용한 지연 로딩 및 placeholder 지원
 */

import { useState, useRef, useEffect, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    placeholder?: string;
    blurPlaceholder?: boolean;
    aspectRatio?: string;
    containerClassName?: string;
}

export function LazyImage({
    src,
    alt,
    placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23111827' width='400' height='300'/%3E%3C/svg%3E",
    blurPlaceholder = true,
    aspectRatio = "16/9",
    containerClassName,
    className,
    ...props
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: "200px", // 200px 전에 미리 로딩
                threshold: 0,
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(true);
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden bg-white/5",
                containerClassName
            )}
            style={{ aspectRatio }}
        >
            {/* Placeholder */}
            <img
                src={placeholder}
                alt=""
                className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                    isLoaded ? "opacity-0" : "opacity-100",
                    blurPlaceholder && "blur-sm scale-105"
                )}
                aria-hidden="true"
            />

            {/* Actual Image */}
            {isInView && !hasError && (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                        isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
                        className
                    )}
                    {...props}
                />
            )}

            {/* Error State */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                    <div className="text-center text-white/40">
                        <svg
                            className="w-8 h-8 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span className="text-xs">이미지 로드 실패</span>
                    </div>
                </div>
            )}

            {/* Loading indicator (optional) */}
            {!isInView && (
                <div ref={imgRef} className="absolute inset-0" aria-hidden="true" />
            )}
        </div>
    );
}

export default LazyImage;
