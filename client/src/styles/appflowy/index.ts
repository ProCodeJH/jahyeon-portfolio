/**
 * AppFlowy Design System - Index
 /**
 * AppFlowy 스타일 시스템
 */

// 색상 시스템
export * from './colors';

// 타이포그래피
export * from './typography';

// 애니메이션
export * from './animations';

// 픽셀 퍼펙트 디자인 시스템
export * from './design-system';
export * from './animations';

// 테마 컨텍스트 타입
export type ThemeMode = 'light' | 'dark';

export interface AppFlowyTheme {
    mode: ThemeMode;
    colors: typeof import('./colors').light;
    typography: typeof import('./typography').textStyles;
    animations: typeof import('./animations').motionPresets;
}
