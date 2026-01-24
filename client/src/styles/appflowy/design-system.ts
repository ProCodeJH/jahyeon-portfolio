/**
 * AppFlowy Pixel-Perfect Design System
 * 
 * AppFlowy 공식 앱과 동일한 색상, 폰트, 스타일
 * 참조: https://github.com/AppFlowy-IO/AppFlowy
 */

// ============================================
// 🎨 AppFlowy 공식 색상 (Light Mode)
// ============================================
export const appFlowyLight = {
    // 배경색
    bg: {
        surface: '#FFFFFF',         // 메인 배경
        secondary: '#F7F8FC',       // 사이드바 배경
        tertiary: '#E5E5E5',        // 호버/선택 배경
        hover: '#F2F2F2',           // 호버 상태
        selected: '#E8E0FF',        // 선택된 아이템
        overlay: 'rgba(0, 0, 0, 0.4)',
    },

    // 텍스트색
    text: {
        title: '#333333',           // 제목
        body: '#333333',            // 본문
        caption: '#828282',         // 캡션
        placeholder: '#BDBDBD',     // 플레이스홀더
        disabled: '#E0E0E0',        // 비활성화
        onFill: '#FFFFFF',          // 채워진 배경 위 텍스트
    },

    // 아이콘색
    icon: {
        primary: '#333333',
        secondary: '#828282',
        disabled: '#BDBDBD',
    },

    // 브랜드색
    brand: {
        main: '#00BCF0',            // AppFlowy 메인 컬러 (시안)
        hover: '#00A5D4',
        light: '#E8F8FD',
        purple: '#9327FF',          // 보조 브랜드 (보라)
    },

    // 상태색
    status: {
        success: '#66CF80',
        warning: '#FFD667',
        error: '#FB006D',
        info: '#00BCF0',
    },

    // 보더
    border: {
        primary: '#E0E0E0',
        secondary: '#F0F0F0',
        divider: '#E8E8E8',
    },

    // 그림자
    shadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.07)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    },

    // 블록 하이라이트
    highlight: {
        yellow: '#FFF9C4',
        green: '#C8E6C9',
        blue: '#BBDEFB',
        purple: '#E1BEE7',
        pink: '#F8BBD9',
        red: '#FFCDD2',
        orange: '#FFE0B2',
        gray: '#F5F5F5',
    },

    // 셀렉트 태그 색상
    tag: {
        lightPurple: { bg: '#E8E0FF', text: '#6C35DE' },
        lightBlue: { bg: '#D6ECFF', text: '#1A73E8' },
        lightGreen: { bg: '#D4EDDA', text: '#155724' },
        lightYellow: { bg: '#FFF3CD', text: '#856404' },
        lightOrange: { bg: '#FFE5D0', text: '#C65D00' },
        lightRed: { bg: '#F8D7DA', text: '#721C24' },
        lightPink: { bg: '#FCE4EC', text: '#880E4F' },
        lightGray: { bg: '#E8E8E8', text: '#616161' },
    },
};

// ============================================
// 🌙 AppFlowy 공식 색상 (Dark Mode)
// ============================================
export const appFlowyDark = {
    // 배경색
    bg: {
        surface: '#1F2329',         // 메인 배경
        secondary: '#181A1F',       // 사이드바 배경
        tertiary: '#2D2F34',        // 호버/선택 배경
        hover: '#363940',           // 호버 상태
        selected: '#3A3D5C',        // 선택된 아이템
        overlay: 'rgba(0, 0, 0, 0.6)',
    },

    // 텍스트색
    text: {
        title: '#E8E8E8',           // 제목
        body: '#C5C7CB',            // 본문
        caption: '#7C7F85',         // 캡션
        placeholder: '#565859',     // 플레이스홀더
        disabled: '#4A4B4D',        // 비활성화
        onFill: '#FFFFFF',          // 채워진 배경 위 텍스트
    },

    // 아이콘색
    icon: {
        primary: '#C5C7CB',
        secondary: '#7C7F85',
        disabled: '#565859',
    },

    // 브랜드색
    brand: {
        main: '#00BCF0',
        hover: '#00D4FF',
        light: '#1E3A4C',
        purple: '#9327FF',
    },

    // 상태색
    status: {
        success: '#5CB85C',
        warning: '#F0AD4E',
        error: '#D9534F',
        info: '#00BCF0',
    },

    // 보더
    border: {
        primary: '#363940',
        secondary: '#2D2F34',
        divider: '#2A2C31',
    },

    // 그림자
    shadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px rgba(0, 0, 0, 0.4)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
    },

    // 블록 하이라이트
    highlight: {
        yellow: 'rgba(255, 235, 59, 0.2)',
        green: 'rgba(76, 175, 80, 0.2)',
        blue: 'rgba(33, 150, 243, 0.2)',
        purple: 'rgba(156, 39, 176, 0.2)',
        pink: 'rgba(233, 30, 99, 0.2)',
        red: 'rgba(244, 67, 54, 0.2)',
        orange: 'rgba(255, 152, 0, 0.2)',
        gray: 'rgba(158, 158, 158, 0.2)',
    },

    // 셀렉트 태그 색상
    tag: {
        lightPurple: { bg: '#3A3D5C', text: '#B39DDB' },
        lightBlue: { bg: '#1E3A5F', text: '#90CAF9' },
        lightGreen: { bg: '#1B3D2F', text: '#A5D6A7' },
        lightYellow: { bg: '#3D3520', text: '#FFF59D' },
        lightOrange: { bg: '#3D2A1A', text: '#FFCC80' },
        lightRed: { bg: '#3D1F1F', text: '#EF9A9A' },
        lightPink: { bg: '#3D1F2E', text: '#F48FB1' },
        lightGray: { bg: '#2D2F34', text: '#9E9E9E' },
    },
};

// ============================================
// 📝 AppFlowy 공식 타이포그래피
// ============================================
export const appFlowyFont = {
    // 폰트 패밀리
    family: {
        default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        emoji: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        code: '"SF Mono", SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    },

    // 폰트 크기 (px)
    size: {
        xs: 11,
        sm: 12,
        base: 14,
        md: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },

    // 폰트 굵기
    weight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },

    // 줄높이
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
    },
};

// ============================================
// 📐 AppFlowy 공식 간격/크기
// ============================================
export const appFlowySpacing = {
    // 사이드바
    sidebar: {
        width: 268,
        collapsedWidth: 0,
        padding: 12,
        itemHeight: 30,
        itemPadding: 8,
        sectionGap: 8,
    },

    // 에디터
    editor: {
        maxWidth: 780,
        paddingX: 96,
        paddingY: 80,
        blockGap: 4,
    },

    // 데이터베이스
    database: {
        rowHeight: 36,
        headerHeight: 42,
        cellPadding: 8,
        kanbanCardWidth: 260,
        kanbanGap: 8,
    },

    // 일반 간격
    gap: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        '2xl': 32,
    },

    // 보더 반경
    radius: {
        sm: 4,
        md: 6,
        lg: 8,
        xl: 12,
        full: 9999,
    },
};

// ============================================
// 🎬 AppFlowy 공식 애니메이션
// ============================================
export const appFlowyAnimation = {
    duration: {
        fast: 100,
        normal: 200,
        slow: 300,
    },
    easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
};

// ============================================
// 🎯 테마 타입
// ============================================
export type AppFlowyTheme = typeof appFlowyLight;
export type ThemeMode = 'light' | 'dark';

export function getAppFlowyTheme(mode: ThemeMode): AppFlowyTheme {
    return mode === 'light' ? appFlowyLight : appFlowyDark;
}

// ============================================
// 📦 기본 내보내기
// ============================================
export const AppFlowyDesign = {
    light: appFlowyLight,
    dark: appFlowyDark,
    font: appFlowyFont,
    spacing: appFlowySpacing,
    animation: appFlowyAnimation,
    getTheme: getAppFlowyTheme,
};

export default AppFlowyDesign;
