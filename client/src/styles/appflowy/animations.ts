/**
 * AppFlowy Design System - Animations
 * 
 * 부드럽고 자연스러운 애니메이션 시스템
 */

// ============================================
// ⏱️ 지속 시간
// ============================================
export const duration = {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
};

// ============================================
// 🎢 이징 함수
// ============================================
export const easing = {
    // 기본
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',

    // 커스텀 (더 자연스러운 움직임)
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smoothIn: 'cubic-bezier(0.4, 0, 1, 1)',
    smoothOut: 'cubic-bezier(0, 0, 0.2, 1)',

    // 바운스
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

    // 스프링
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

// ============================================
// 🎬 트랜지션 프리셋
// ============================================
export const transition = {
    // 빠른 인터랙션 (버튼 호버 등)
    fast: `all ${duration.fast} ${easing.smooth}`,

    // 일반 인터랙션 (메뉴 열기 등)
    normal: `all ${duration.normal} ${easing.smooth}`,

    // 느린 인터랙션 (모달 등)
    slow: `all ${duration.slow} ${easing.smooth}`,

    // 색상만 변경
    colors: `background-color ${duration.fast} ${easing.smooth}, 
           color ${duration.fast} ${easing.smooth}, 
           border-color ${duration.fast} ${easing.smooth}`,

    // 크기 변경
    transform: `transform ${duration.normal} ${easing.spring}`,

    // 투명도
    opacity: `opacity ${duration.fast} ${easing.smooth}`,
};

// ============================================
// 🎭 Framer Motion 프리셋
// ============================================
export const motionPresets = {
    // 페이드 인/아웃
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
    },

    // 슬라이드 업
    slideUp: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
        transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
    },

    // 슬라이드 다운
    slideDown: {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
    },

    // 스케일
    scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
    },

    // 스프링 스케일
    springScale: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
        transition: { type: 'spring', stiffness: 400, damping: 25 },
    },

    // 사이드바 슬라이드
    sidebarSlide: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
    },

    // 드롭다운 메뉴
    dropdown: {
        initial: { opacity: 0, y: -4, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -4, scale: 0.98 },
        transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
    },

    // 모달
    modal: {
        initial: { opacity: 0, y: 20, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.98 },
        transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    },

    // 리스트 아이템 (stagger용)
    listItem: {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -10 },
    },

    // 컨테이너 (stagger 부모)
    container: {
        animate: {
            transition: {
                staggerChildren: 0.03,
            },
        },
    },
};

// ============================================
// 🎪 키프레임 애니메이션
// ============================================
export const keyframes = {
    // 펄스
    pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,

    // 스핀
    spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,

    // 바운스
    bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10%); }
    }
  `,

    // 쉐이크
    shake: `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
  `,

    // 스켈레톤 시머
    shimmer: `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `,
};

// ============================================
// 📦 기본 내보내기
// ============================================
export const AppFlowyAnimations = {
    duration,
    easing,
    transition,
    motionPresets,
    keyframes,
};

export default AppFlowyAnimations;
