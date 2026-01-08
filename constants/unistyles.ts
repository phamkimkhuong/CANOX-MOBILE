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
        info: '#0ea5e9',
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
        secondarySoft: 'rgba(148, 163, 184, 0.15)',
        textOnOverlay: 'rgba(255, 255, 255, 0.8)',
        infoSoft: 'rgba(14, 165, 233, 0.15)',
        infoLight: 'rgba(14, 165, 233, 0.10)',
        infoSubtle: 'rgba(14, 165, 233, 0.08)',
        infoMuted: 'rgba(14, 165, 233, 0.05)',
        errorSoft: 'rgba(239, 68, 68, 0.15)',
        errorLight: 'rgba(239, 68, 68, 0.10)',
        errorSubtle: 'rgba(239, 68, 68, 0.08)',
        successSoft: 'rgba(34, 197, 94, 0.15)',
        successLight: 'rgba(34, 197, 94, 0.10)',
        successSubtle: 'rgba(34, 197, 94, 0.08)',
        warningSoft: 'rgba(249, 115, 22, 0.15)',
        warningLight: 'rgba(249, 115, 22, 0.10)',
        warningSubtle: 'rgba(249, 115, 22, 0.08)',
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
        xxl: 48,
    },
    // Add standard E-commerce borderRadius
    radius: {
        s: 4,
        m: 8,
        l: 16,
        xl: 24,
        full: 999
    },
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 5,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
        }
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

export { lightTheme }; // Export for React Navigation use

