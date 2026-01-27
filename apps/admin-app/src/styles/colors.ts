// 🎨 Ultra Premium Color System
// Glassmorphism + Dark Mode Ready

export const Colors = {
    // Primary Gradient
    primary: {
        start: '#6366F1',    // Indigo
        end: '#8B5CF6',      // Purple
        text: '#FFFFFF',
    },

    // Secondary Accent
    accent: {
        cyan: '#06B6D4',
        emerald: '#10B981',
        amber: '#F59E0B',
        rose: '#F43F5E',
    },

    // Dark Theme (Default)
    dark: {
        background: '#0F0F23',
        surface: '#1A1A2E',
        surfaceElevated: '#252542',
        border: 'rgba(255, 255, 255, 0.1)',
        text: '#FFFFFF',
        textSecondary: '#94A3B8',
        textMuted: '#64748B',
    },

    // Light Theme
    light: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceElevated: '#F1F5F9',
        border: 'rgba(0, 0, 0, 0.1)',
        text: '#0F172A',
        textSecondary: '#475569',
        textMuted: '#94A3B8',
    },

    // Status Colors
    status: {
        online: '#10B981',
        offline: '#6B7280',
        busy: '#F59E0B',
        error: '#EF4444',
    },

    // Glassmorphism
    glass: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
        shadow: 'rgba(0, 0, 0, 0.25)',
    },

    // Message Bubbles
    bubble: {
        admin: {
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            text: '#FFFFFF',
        },
        visitor: {
            background: 'rgba(255, 255, 255, 0.1)',
            text: '#FFFFFF',
        },
        system: {
            background: 'rgba(255, 255, 255, 0.05)',
            text: '#94A3B8',
        },
    },
};

export const Gradients = {
    primary: ['#6366F1', '#8B5CF6'],
    secondary: ['#06B6D4', '#10B981'],
    sunset: ['#F43F5E', '#F59E0B'],
    night: ['#0F0F23', '#1A1A2E'],
    glass: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
};

export const Shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    }),
};
