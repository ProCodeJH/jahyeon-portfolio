/**
 * AppFlowy Design System - Typography
 * 
 * AppFlowy의 깔끔하고 가독성 높은 타이포그래피 시스템
 */

// ============================================
// 📝 폰트 패밀리
// ============================================
export const fontFamily = {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Consolas, Monaco, "Courier New", monospace',
};

// ============================================
// 📏 폰트 크기
// ============================================
export const fontSize = {
    xs: '0.75rem',     // 12px
    sm: '0.8125rem',   // 13px
    base: '0.9375rem', // 15px
    lg: '1.0625rem',   // 17px
    xl: '1.125rem',    // 18px
    '2xl': '1.375rem', // 22px
    '3xl': '1.75rem',  // 28px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
};

// ============================================
// 🔠 폰트 굵기
// ============================================
export const fontWeight = {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
};

// ============================================
// 📐 줄 높이
// ============================================
export const lineHeight = {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
};

// ============================================
// 🔤 자간
// ============================================
export const letterSpacing = {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
};

// ============================================
// 📖 텍스트 스타일 프리셋
// ============================================
export const textStyles = {
    // 제목
    h1: {
        fontSize: fontSize['3xl'],
        fontWeight: fontWeight.bold,
        lineHeight: lineHeight.tight,
        letterSpacing: letterSpacing.tight,
    },
    h2: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.semibold,
        lineHeight: lineHeight.snug,
        letterSpacing: letterSpacing.tight,
    },
    h3: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semibold,
        lineHeight: lineHeight.snug,
        letterSpacing: letterSpacing.normal,
    },
    h4: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        lineHeight: lineHeight.normal,
        letterSpacing: letterSpacing.normal,
    },

    // 본문
    body: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.normal,
        lineHeight: lineHeight.relaxed,
        letterSpacing: letterSpacing.normal,
    },
    bodySmall: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.normal,
        lineHeight: lineHeight.normal,
        letterSpacing: letterSpacing.normal,
    },

    // UI 요소
    label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        lineHeight: lineHeight.normal,
        letterSpacing: letterSpacing.wide,
    },
    caption: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.normal,
        lineHeight: lineHeight.normal,
        letterSpacing: letterSpacing.wide,
    },
    button: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        lineHeight: lineHeight.none,
        letterSpacing: letterSpacing.wide,
    },

    // 코드
    code: {
        fontFamily: fontFamily.mono,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.normal,
        lineHeight: lineHeight.relaxed,
        letterSpacing: letterSpacing.normal,
    },
    codeBlock: {
        fontFamily: fontFamily.mono,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.normal,
        lineHeight: lineHeight.loose,
        letterSpacing: letterSpacing.normal,
    },
};

// ============================================
// 📦 기본 내보내기
// ============================================
export const AppFlowyTypography = {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    textStyles,
};

export default AppFlowyTypography;
