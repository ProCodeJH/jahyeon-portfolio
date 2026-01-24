/**
 * AppFlowy Design System - Colors
 * 
 * AppFlowy의 클린하고 미니멀한 색상 시스템을 구현합니다.
 * Light/Dark 테마 지원
 */

// ============================================
// 🎨 브랜드 색상
// ============================================
export const brand = {
    purple: {
        50: '#F5F0FF',
        100: '#E8DBFF',
        200: '#D4BFFF',
        300: '#B794FF',
        400: '#9F6FFF',
        500: '#8B5CF6',  // 메인 브랜드
        600: '#7C3AED',
        700: '#6D28D9',
        800: '#5B21B6',
        900: '#4C1D95',
    },
    blue: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6',  // 링크, 액션
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
    },
    green: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        300: '#6EE7B7',
        400: '#34D399',
        500: '#10B981',  // 성공
        600: '#059669',
        700: '#047857',
        800: '#065F46',
        900: '#064E3B',
    },
    red: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444',  // 에러, 삭제
        600: '#DC2626',
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D',
    },
    orange: {
        50: '#FFF7ED',
        100: '#FFEDD5',
        200: '#FED7AA',
        300: '#FDBA74',
        400: '#FB923C',
        500: '#F97316',  // 경고
        600: '#EA580C',
        700: '#C2410C',
        800: '#9A3412',
        900: '#7C2D12',
    },
    yellow: {
        50: '#FEFCE8',
        100: '#FEF9C3',
        200: '#FEF08A',
        300: '#FDE047',
        400: '#FACC15',
        500: '#EAB308',  // 별표, 중요
        600: '#CA8A04',
        700: '#A16207',
        800: '#854D0E',
        900: '#713F12',
    },
};

// ============================================
// 🌞 라이트 테마
// ============================================
export const light = {
    // 배경
    bg: {
        primary: '#FFFFFF',
        secondary: '#F7F8FC',
        tertiary: '#EDEEF2',
        hover: '#F3F4F6',
        active: '#E5E7EB',
        overlay: 'rgba(0, 0, 0, 0.4)',
    },
    // 텍스트
    text: {
        primary: '#1F2329',
        secondary: '#5F6369',
        muted: '#9199A1',
        disabled: '#C5C9D0',
        inverse: '#FFFFFF',
    },
    // 보더
    border: {
        primary: '#E5E7EB',
        secondary: '#D1D5DB',
        focus: brand.purple[500],
    },
    // 상태
    status: {
        success: brand.green[500],
        warning: brand.orange[500],
        error: brand.red[500],
        info: brand.blue[500],
    },
    // 사이드바
    sidebar: {
        bg: '#F7F8FC',
        hover: '#EDEEF2',
        active: '#E5E7EB',
        border: '#E5E7EB',
    },
    // 에디터
    editor: {
        bg: '#FFFFFF',
        selection: 'rgba(139, 92, 246, 0.1)',
        cursor: brand.purple[500],
        highlight: {
            yellow: '#FEF9C3',
            green: '#D1FAE5',
            blue: '#DBEAFE',
            purple: '#F3E8FF',
            pink: '#FCE7F3',
            red: '#FEE2E2',
            orange: '#FFEDD5',
            gray: '#F3F4F6',
        },
    },
};

// ============================================
// 🌙 다크 테마
// ============================================
export const dark = {
    // 배경
    bg: {
        primary: '#1E1F25',
        secondary: '#25262E',
        tertiary: '#2D2E36',
        hover: '#35363E',
        active: '#3D3E46',
        overlay: 'rgba(0, 0, 0, 0.6)',
    },
    // 텍스트
    text: {
        primary: '#E8E8E8',
        secondary: '#A0A4AB',
        muted: '#6B7280',
        disabled: '#4B5563',
        inverse: '#1F2329',
    },
    // 보더
    border: {
        primary: '#3D3E46',
        secondary: '#4B4D56',
        focus: brand.purple[400],
    },
    // 상태
    status: {
        success: brand.green[400],
        warning: brand.orange[400],
        error: brand.red[400],
        info: brand.blue[400],
    },
    // 사이드바
    sidebar: {
        bg: '#1A1B21',
        hover: '#25262E',
        active: '#2D2E36',
        border: '#2D2E36',
    },
    // 에디터
    editor: {
        bg: '#1E1F25',
        selection: 'rgba(139, 92, 246, 0.2)',
        cursor: brand.purple[400],
        highlight: {
            yellow: 'rgba(234, 179, 8, 0.2)',
            green: 'rgba(16, 185, 129, 0.2)',
            blue: 'rgba(59, 130, 246, 0.2)',
            purple: 'rgba(139, 92, 246, 0.2)',
            pink: 'rgba(236, 72, 153, 0.2)',
            red: 'rgba(239, 68, 68, 0.2)',
            orange: 'rgba(249, 115, 22, 0.2)',
            gray: 'rgba(107, 114, 128, 0.2)',
        },
    },
};

// ============================================
// 🎯 유틸리티 함수
// ============================================
export type ThemeMode = 'light' | 'dark';

export function getTheme(mode: ThemeMode) {
    return mode === 'light' ? light : dark;
}

export function getColor(mode: ThemeMode, path: string) {
    const theme = getTheme(mode);
    return path.split('.').reduce((obj: any, key) => obj?.[key], theme);
}

// ============================================
// 📦 기본 내보내기
// ============================================
export const AppFlowyColors = {
    brand,
    light,
    dark,
    getTheme,
    getColor,
};

export default AppFlowyColors;
