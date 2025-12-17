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
        typography: '#1c3024',
        typographySecondary: '#687076',
        // Thêm màu cho React Navigation
        card: '#ffffff',
        text: '#1c3024',
        border: '#e8e8e8',
        notification: '#ef4444',
    },
    margins: {
        sm: 8,
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
