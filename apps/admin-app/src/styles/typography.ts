// 🔤 Premium Typography System

import { TextStyle } from 'react-native';

export const FontSizes = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
};

export const FontWeights = {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extrabold: '800' as TextStyle['fontWeight'],
};

export const LineHeights = {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
};

export const Typography = {
    // Headings
    h1: {
        fontSize: FontSizes['4xl'],
        fontWeight: FontWeights.bold,
        letterSpacing: -0.5,
    } as TextStyle,

    h2: {
        fontSize: FontSizes['3xl'],
        fontWeight: FontWeights.bold,
        letterSpacing: -0.3,
    } as TextStyle,

    h3: {
        fontSize: FontSizes['2xl'],
        fontWeight: FontWeights.semibold,
        letterSpacing: -0.2,
    } as TextStyle,

    h4: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.semibold,
    } as TextStyle,

    // Body
    body: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.regular,
        lineHeight: FontSizes.md * LineHeights.normal,
    } as TextStyle,

    bodySmall: {
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.regular,
        lineHeight: FontSizes.sm * LineHeights.normal,
    } as TextStyle,

    // Labels
    label: {
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.medium,
        letterSpacing: 0.5,
    } as TextStyle,

    labelSmall: {
        fontSize: FontSizes.xs,
        fontWeight: FontWeights.medium,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    } as TextStyle,

    // Button
    button: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.semibold,
        letterSpacing: 0.3,
    } as TextStyle,

    // Caption
    caption: {
        fontSize: FontSizes.xs,
        fontWeight: FontWeights.regular,
        lineHeight: FontSizes.xs * LineHeights.relaxed,
    } as TextStyle,
};

export const Spacing = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
    '4xl': 64,
};

export const BorderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
};
