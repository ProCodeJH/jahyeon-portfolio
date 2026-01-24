/**
 * AppFlowy UI - Card Component
 * 
 * 깔끔하고 미니멀한 카드 컴포넌트
 */

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

// ============================================
// 🎨 카드 변형
// ============================================
const variants = {
    // 기본 (그림자 + 보더)
    default: `
    bg-white border border-gray-200 shadow-sm
    dark:bg-[#25262E] dark:border-white/10
  `,
    // 플랫 (보더만)
    flat: `
    bg-white border border-gray-200
    dark:bg-[#25262E] dark:border-white/10
  `,
    // 채워진 (그림자 없음)
    filled: `
    bg-gray-50
    dark:bg-[#2D2E36]
  `,
    // 고스트 (배경 없음)
    ghost: `
    bg-transparent
    hover:bg-gray-50
    dark:hover:bg-white/5
  `,
    // 인터랙티브 (호버 효과)
    interactive: `
    bg-white border border-gray-200 shadow-sm
    hover:shadow-md hover:border-gray-300
    cursor-pointer
    transition-all duration-200
    dark:bg-[#25262E] dark:border-white/10
    dark:hover:border-white/20
  `,
    // 선택됨
    selected: `
    bg-purple-50 border-2 border-purple-500
    dark:bg-purple-500/10 dark:border-purple-400
  `,
};

// ============================================
// 📏 카드 패딩 크기
// ============================================
const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
};

// ============================================
// 🔧 Props 인터페이스
// ============================================
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: keyof typeof variants;
    padding?: keyof typeof paddings;
    rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// ============================================
// 🎯 Card 컴포넌트
// ============================================
export const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            variant = 'default',
            padding = 'md',
            rounded = 'lg',
            children,
            ...props
        },
        ref
    ) => {
        const roundedClass = {
            sm: 'rounded',
            md: 'rounded-md',
            lg: 'rounded-lg',
            xl: 'rounded-xl',
            full: 'rounded-2xl',
        }[rounded];

        return (
            <div
                ref={ref}
                className={cn(
                    roundedClass,
                    variants[variant],
                    paddings[padding],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// ============================================
// ✨ 애니메이션 카드
// ============================================
export const MotionCard = forwardRef<
    HTMLDivElement,
    CardProps & HTMLMotionProps<'div'>
>(
    (
        {
            className,
            variant = 'default',
            padding = 'md',
            rounded = 'lg',
            ...props
        },
        ref
    ) => {
        const roundedClass = {
            sm: 'rounded',
            md: 'rounded-md',
            lg: 'rounded-lg',
            xl: 'rounded-xl',
            full: 'rounded-2xl',
        }[rounded];

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    roundedClass,
                    variants[variant],
                    paddings[padding],
                    className
                )}
                {...props}
            />
        );
    }
);

MotionCard.displayName = 'MotionCard';

// ============================================
// 📦 카드 서브 컴포넌트
// ============================================

// 카드 헤더
export const CardHeader = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('mb-4', className)}
        {...props}
    />
));
CardHeader.displayName = 'CardHeader';

// 카드 타이틀
export const CardTitle = forwardRef<
    HTMLHeadingElement,
    HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            'text-lg font-semibold text-gray-900 dark:text-white',
            className
        )}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

// 카드 설명
export const CardDescription = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
        {...props}
    />
));
CardDescription.displayName = 'CardDescription';

// 카드 콘텐츠
export const CardContent = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// 카드 푸터
export const CardFooter = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'mt-4 pt-4 border-t border-gray-200 dark:border-white/10',
            className
        )}
        {...props}
    />
));
CardFooter.displayName = 'CardFooter';

export default Card;
