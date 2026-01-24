/**
 * AppFlowy UI - Button Component
 * 
 * 다양한 변형과 크기를 지원하는 버튼 컴포넌트
 */

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

// ============================================
// 🎨 버튼 변형
// ============================================
const variants = {
    // 기본 (보라색 배경)
    primary: `
    bg-purple-500 text-white 
    hover:bg-purple-600 
    active:bg-purple-700
    shadow-sm hover:shadow-md
  `,
    // 보조 (회색 배경)
    secondary: `
    bg-gray-100 text-gray-700 
    hover:bg-gray-200 
    active:bg-gray-300
    dark:bg-white/10 dark:text-white dark:hover:bg-white/15
  `,
    // 외곽선
    outline: `
    border border-gray-300 bg-transparent text-gray-700
    hover:bg-gray-50 hover:border-gray-400
    dark:border-white/20 dark:text-white dark:hover:bg-white/5 dark:hover:border-white/30
  `,
    // 고스트 (배경 없음)
    ghost: `
    bg-transparent text-gray-600
    hover:bg-gray-100 hover:text-gray-900
    dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white
  `,
    // 링크 스타일
    link: `
    bg-transparent text-purple-500 underline-offset-4
    hover:underline
  `,
    // 위험 (빨간색)
    danger: `
    bg-red-500 text-white
    hover:bg-red-600
    active:bg-red-700
  `,
};

// ============================================
// 📏 버튼 크기
// ============================================
const sizes = {
    xs: 'h-7 px-2 text-xs gap-1',
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-10 px-5 text-base gap-2',
    xl: 'h-12 px-6 text-base gap-2.5',
    icon: 'h-9 w-9 p-0',
    iconSm: 'h-7 w-7 p-0',
    iconLg: 'h-11 w-11 p-0',
};

// ============================================
// 🔧 Props 인터페이스
// ============================================
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof variants;
    size?: keyof typeof sizes;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    asChild?: boolean;
}

// ============================================
// 🎯 Button 컴포넌트
// ============================================
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            loading = false,
            leftIcon,
            rightIcon,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading;

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                className={cn(
                    // 기본 스타일
                    'inline-flex items-center justify-center',
                    'font-medium rounded-lg',
                    'transition-all duration-150 ease-out',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:ring-offset-1',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
                    // 변형 & 크기
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {loading && (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
                {children}
                {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';

// ============================================
// ✨ 애니메이션 버튼 (Framer Motion)
// ============================================
export const MotionButton = forwardRef<
    HTMLButtonElement,
    ButtonProps & HTMLMotionProps<'button'>
>(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
        <motion.button
            ref={ref}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className={cn(
                'inline-flex items-center justify-center',
                'font-medium rounded-lg',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:ring-offset-1',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});

MotionButton.displayName = 'MotionButton';

// ============================================
// 📦 아이콘 버튼
// ============================================
export interface IconButtonProps extends ButtonProps {
    icon: React.ReactNode;
    label: string; // 접근성용
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ icon, label, size = 'icon', ...props }, ref) => {
        return (
            <Button ref={ref} size={size} aria-label={label} {...props}>
                {icon}
            </Button>
        );
    }
);

IconButton.displayName = 'IconButton';

export default Button;
