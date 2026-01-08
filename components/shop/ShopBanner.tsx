/**
 * ==============================================
 * SHOP BANNER - Premium Background Component
 * ==============================================
 * 
 * Purpose:
 * Creates visually appealing banner for shop header
 * 
 * Fallback Strategy (When bannerUrl is null):
 */

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopBannerProps {
    bannerUrl: string | null;
    logoUrl: string;
    height?: number;
}

const DEFAULT_BANNER_HEIGHT = 200;

/**
 * ShopBanner - Display shop banner with smart fallback
 * 
 * When bannerUrl exists: Shows actual banner image
 * When bannerUrl is null: Shows premium gradient (no blur = no lag)
 */
export const ShopBanner: React.FC<ShopBannerProps> = ({
    bannerUrl,
    height = DEFAULT_BANNER_HEIGHT,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const gradientColors: [string, string, string, string] = [
        '#005f8c',
        '#0077aa',
        '#89b4c8',
        theme.colors.background,
    ];

    return (
        <View style={[styles.container, { height }]}>
            {bannerUrl ? (
                <Image
                    source={{ uri: bannerUrl }}
                    style={styles.backgroundImage}
                    contentFit="cover"
                    transition={300}
                />
            ) : (
                <LinearGradient
                    colors={gradientColors}
                    locations={[0, 0.3, 0.7, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.backgroundImage}
                >
                    {/* Soft diagonal shine effect */}
                    <View style={styles.shineOverlay} />
                </LinearGradient>
            )}

            {/* Smooth bottom transition - blend into ShopHeaderInfo */}
            <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.5)', theme.colors.surface]}
                locations={[0, 0.6, 1]}
                style={styles.bottomFade}
            />
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
    shineOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    bottomFade: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 50,
    },
}));

export default ShopBanner;
