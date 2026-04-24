import { PixelRatio } from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';

/**
 * ============================================================================
 * RESPONSIVE FONT SCALING - Unistyles Native Approach
 * ============================================================================
 * 
 * Base width: 375 (iPhone 11/12/13/14 standard width)
 * 
 * Common phone widths for reference:
 * - iPhone SE: 320
 * - iPhone 14: 390
 * - iPhone 14 Pro Max: 430
 * - Samsung Galaxy S21: 360
 * - Pixel 7: 412
 */

// Constants for scaling calculations
export const GUIDELINE_BASE_WIDTH = 375;
export const MIN_SCALE = 0.9;  // Prevent text too small on tiny phones
export const MAX_SCALE = 1.15; // Prevent text too large on big phones

/**
 * Creates a scaled font size using UnistylesRuntime (REACTIVE)
 * @param size - Base font size (designed for 375w screen)
 * @param factor - Moderation factor (0 = no scale, 1 = full linear scale)
 * @returns Scaled and rounded font size
 * 
 * @example
 * const stylesheet = StyleSheet.create((theme, rt) => ({
 *     bodyText: {
 *         fontSize: createScaledFontSize(theme.fontSizes.base, rt.screen.width),
 *     },
 * }));
 */
export const createScaledFontSize = (
    size: number,
    screenWidth: number,
    factor = 0.5
): number => {
    const rawScale = screenWidth / GUIDELINE_BASE_WIDTH;
    const clampedScale = Math.min(Math.max(rawScale, MIN_SCALE), MAX_SCALE);
    const moderatedSize = size + (size * (clampedScale - 1) * factor);
    return PixelRatio.roundToNearestPixel(moderatedSize);
};

/**
 * Get current scaled font size (for use in components, not stylesheets)
 * @example
 * // In a component:
 * const fontSize = getScaledFontSize(16);
 */
export const getScaledFontSize = (size: number, factor = 0.5): number => {
    return createScaledFontSize(size, UnistylesRuntime.screen.width, factor);
};


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
        background: '#f6f6f6',
        surface: '#ffffff',
        secondary: '#94a3b8',
        error: '#ef4444',
        success: '#22c55e',
        success2: '#0d6e31ff',
        warning: '#f97316',
        typography: '#1c3024',
        // Header & Screen Titles
        newPrimary: '#ef4444',
        buttonActive: '#ef4444',
        header: {
            headerBackground: '#ef4444',
            onHeader: '#ffffff',
            headerTitle: '#ffffff',
            background: "#fef2f2"
        },
        typographySecondary: '#687076',
        info: '#0ea5e9',
        // Accent color - Orange for CTAs, Promotions, Urgency
        accent: '#ff7a00',
        onAccent: '#ffffff',
        accentSoft: 'rgba(255, 122, 0, 0.15)',
        accentLight: 'rgba(255, 122, 0, 0.10)',
        accentSubtle: 'rgba(255, 122, 0, 0.08)',
        // Active Red Variants (For buttonActive states)
        activeSoft: 'rgba(239, 68, 68, 0.12)',
        activeLight: 'rgba(239, 68, 68, 0.08)',
        activeSubtle: 'rgba(239, 68, 68, 0.05)',
        activeMuted: 'rgba(239, 68, 68, 0.03)',
        activeSurface: 'rgba(239, 68, 68, 0.015)',
        backgroundNewInput: '#f1f1f1',
        backgroundNewSurface: 'rgba(0, 0, 0, 0.03)',

        // Semantic colors (Blue - existing)
        primarySoft: 'rgba(0, 136, 204, 0.15)',
        primaryLight: 'rgba(0, 136, 204, 0.10)',
        primarySubtle: 'rgba(0, 136, 204, 0.08)',
        primaryMuted: 'rgba(0, 136, 204, 0.05)',
        secondaryLight: 'rgba(148, 163, 184, 0.30)',
        surfaceTranslucent: 'rgba(255, 255, 255, 0.6)',
        surfaceOverlay: 'rgba(255, 255, 255, 0.8)',
        backgroundInput: '#ffffff',
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
        borderMuted: '#f1f1f1',
        notification: '#ef4444',

        // --- LIQUID GLASS TOKENS ---
        vibrantRed: '#E31B23',      // Modern Premium Red
        forestGreen: '#2E7D32',     // Green for Trust/Success
        sunsetOrange: '#FF6D00',    // For Flash Sale/Promo
        inkBlack: '#121212',        // Deep neutral text

        surfaceGlass: 'rgba(255, 255, 255, 0.70)',
        borderGlass: 'rgba(255, 255, 255, 0.4)',
        surfaceGlassOverlay: 'rgba(255, 255, 255, 0.85)',

        redSoft: 'rgba(227, 27, 35, 0.08)',
        greenSoft: 'rgba(46, 125, 50, 0.08)',
    },
    margins: {
        zero: 0,
        xs: 4,
        sm: 8,
        smd: 12,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    radius: {
        s: 4,
        m: 8,
        l: 16,
        xl: 24,
        full: 999
    },
    fontSizes: {
        xs: 10,    // Smallest caption, timestamps, badges
        xsm: 11,   // Small captions, footnotes
        sm: 12,    // Caption, helper text, footnotes  
        md: 14,    // Body small, secondary descriptions
        mdbase: 15,    // Body small, secondary descriptions
        base: 16,  // DEFAULT BODY TEXT
        lg: 18,    // Emphasized body, subtitle
        xl: 20,    // Section headers, card titles
        xxl: 22,   // Prominent headers, featured titles
        '2xl': 24, // Screen titles, large headers
        '3xl': 28, // Hero text, promotional headlines
        '4xl': 32, // Display text, splash numbers
    },
    lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
    fontWeights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
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

