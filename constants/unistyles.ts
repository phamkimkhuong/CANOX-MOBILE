import { StyleSheet } from 'react-native-unistyles';

const breakpoints = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
} as const;

// Single Source of Truth
const lightTheme = {
    colors: {
        primary: '#0088cc',
        onPrimary: '#ffffff',
        background: '#eef8ff',
        surface: '#ffffff',
        secondary: '#94a3b8',
        error: '#ef4444',
        success: '#22c55e',
        warning: '#f97316',
        typography: '#1c3024',
        typographySecondary: '#687076',
        // Semantic colors
        primarySoft: 'rgba(0, 136, 204, 0.15)',
        primaryLight: 'rgba(0, 136, 204, 0.10)',
        primarySubtle: 'rgba(0, 136, 204, 0.08)',
        primaryMuted: 'rgba(0, 136, 204, 0.05)',
        secondaryLight: 'rgba(148, 163, 184, 0.30)',
        surfaceTranslucent: 'rgba(255, 255, 255, 0.6)',
        surfaceOverlay: 'rgba(255, 255, 255, 0.8)',
        backgroundInput: 'rgba(238, 248, 255, 0.8)',
        backgroundSurface: 'rgba(0, 136, 204, 0.06)',
        textOnOverlay: 'rgba(255, 255, 255, 0.8)',
        // React Navigation colors
        card: '#ffffff',
        text: '#1c3024',
        border: '#e8e8e8',
        notification: '#ef4444',
    },
    margins: {
        zero: 0,
        sm: 8,
        smd: 12,
        md: 16,
        lg: 24,
        xl: 32,
    },
    // Thêm borderRadius chuẩn E-commerce
    radius: {
        s: 4,
        m: 8,
        l: 16,
        full: 999
    }
} as const;

type AppBreakpoints = typeof breakpoints;
type AppThemes = {
    light: typeof lightTheme;
};

declare module 'react-native-unistyles' {
    export interface UnistylesBreakpoints extends AppBreakpoints { }
    export interface UnistylesThemes extends AppThemes { }
}

StyleSheet.configure({
    breakpoints,
    themes: {
        light: lightTheme,
    },
    settings: {
        initialTheme: 'light',
        adaptiveThemes: false,
    },
});

export { lightTheme }; // Export ra để dùng cho React Navigation

