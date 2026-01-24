/**
 * AppFlowy UI - Input Component
 * 
 * 다양한 변형을 지원하는 입력 필드 컴포넌트
 */

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// 🎨 입력 필드 변형
// ============================================
const variants = {
    // 기본 (보더 있음)
    default: `
    border border-gray-300 bg-white
    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
    dark:border-white/20 dark:bg-white/5 dark:text-white
    dark:focus:border-purple-400 dark:focus:ring-purple-400/20
  `,
    // 채워진 스타일
    filled: `
    border-0 bg-gray-100
    focus:bg-gray-50 focus:ring-2 focus:ring-purple-500/20
    dark:bg-white/10 dark:text-white
    dark:focus:bg-white/[0.08] dark:focus:ring-purple-400/20
  `,
    // 고스트 (배경 없음)
    ghost: `
    border-0 bg-transparent
    hover:bg-gray-100
    focus:bg-gray-50 focus:ring-2 focus:ring-purple-500/20
    dark:hover:bg-white/5 dark:text-white
    dark:focus:bg-white/5 dark:focus:ring-purple-400/20
  `,
    // 아웃라인 (호버 시 강조)
    outline: `
    border-2 border-gray-200 bg-transparent
    hover:border-gray-300
    focus:border-purple-500 focus:ring-0
    dark:border-white/10 dark:text-white
    dark:hover:border-white/20 dark:focus:border-purple-400
  `,
};

// ============================================
// 📏 입력 필드 크기
// ============================================
const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-3.5 text-sm',
    lg: 'h-12 px-4 text-base',
};

// ============================================
// 🔧 Props 인터페이스
// ============================================
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    variant?: keyof typeof variants;
    inputSize?: keyof typeof sizes;
    error?: boolean;
    errorMessage?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    label?: string;
    helperText?: string;
}

// ============================================
// 🎯 Input 컴포넌트
// ============================================
export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            variant = 'default',
            inputSize = 'md',
            error = false,
            errorMessage,
            leftIcon,
            rightIcon,
            label,
            helperText,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

        return (
            <div className="w-full">
                {/* 라벨 */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            'block text-sm font-medium mb-1.5',
                            'text-gray-700 dark:text-gray-300'
                        )}
                    >
                        {label}
                    </label>
                )}

                {/* 입력 필드 래퍼 */}
                <div className="relative">
                    {/* 왼쪽 아이콘 */}
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                            {leftIcon}
                        </div>
                    )}

                    {/* 입력 필드 */}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            // 기본 스타일
                            'w-full rounded-lg',
                            'text-gray-900 placeholder:text-gray-400',
                            'transition-all duration-150',
                            'focus:outline-none',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            // 변형 & 크기
                            variants[variant],
                            sizes[inputSize],
                            // 아이콘 패딩
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            // 에러 상태
                            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                            className
                        )}
                        {...props}
                    />

                    {/* 오른쪽 아이콘 */}
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {/* 에러 메시지 */}
                {error && errorMessage && (
                    <p className="mt-1.5 text-sm text-red-500">{errorMessage}</p>
                )}

                {/* 도움말 텍스트 */}
                {!error && helperText && (
                    <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// ============================================
// 🔍 검색 입력 필드
// ============================================
export const SearchInput = forwardRef<
    HTMLInputElement,
    Omit<InputProps, 'leftIcon'>
>((props, ref) => {
    return (
        <Input
            ref={ref}
            variant="filled"
            placeholder="검색..."
            leftIcon={
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            }
            {...props}
        />
    );
});

SearchInput.displayName = 'SearchInput';

export default Input;
