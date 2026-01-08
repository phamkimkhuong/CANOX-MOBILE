/**
 * ==============================================
 * SHOP BANNER - Blurred Background Component
 * ==============================================
 * 
 * Purpose:
 * Creates visually appealing banner for shop header
 * 
 * Fallback Strategy (When bannerUrl is null):
 * Option 1: Blur shop logo as background (Instagram/Spotify style)
 * Option 2: Gradient pattern using primary color
 * 
 * Current Implementation: Option 1 (Blurred Logo)
 */

import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { ImageBackground, Platform, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ============================================
// TYPES
// ============================================

interface ShopBannerProps {
    /** Shop banner URL (usually null from API) */
    bannerUrl: string | null;
    /** Shop logo URL (always available) */
    logoUrl: string;
    /** Banner height - default 180 */
    height?: number;
}
const DEFAULT_BANNER_HEIGHT = 180;
const BLUR_RADIUS = Platform.OS === 'ios' ? 25 : 15; // Android blur is stronger
/**
 * ShopBanner - Display shop banner with smart fallback
 * 
 * When bannerUrl is null:
 * - Uses logoUrl as background with blur effect
 * - Creates elegant, professional look
 * - Consistent with modern e-commerce apps
 */
export const ShopBanner: React.FC<ShopBannerProps> = ({
    bannerUrl,
    logoUrl,
    height = DEFAULT_BANNER_HEIGHT,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Determine which image to use
    const imageSource = useMemo(() => {
        // Priority: bannerUrl > logoUrl (blurred)
        return bannerUrl || logoUrl;
    }, [bannerUrl, logoUrl]);

    // Should apply blur? Only when using logo as fallback
    const shouldBlur = !bannerUrl;

    return (
        <View style={[styles.container, { height }]}>
            {shouldBlur ? (
                // Fallback: Blurred logo background
                <ImageBackground
                    source={{ uri: imageSource }}
                    style={styles.backgroundImage}
                    blurRadius={BLUR_RADIUS}
                    resizeMode="cover"
                >
                    {/* Gradient overlay for better contrast */}
                    <View style={styles.gradientOverlay} />
                </ImageBackground>
            ) : (
                // Primary: Actual banner
                <Image
                    source={{ uri: imageSource }}
                    style={styles.backgroundImage}
                    contentFit="cover"
                    transition={300}
                />
            )}

            {/* Bottom fade for smooth transition to content */}
            <View style={styles.bottomFade} />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 136, 204, 0.15)',
    },
    bottomFade: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 40,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
    },
}));

export default ShopBanner;
