/**
 * ==============================================
 * SHOP PROFILE HERO - Video/Image Hero Section
 * ==============================================
 *
 * For Brand shops: Shows video or featured image
 * For New shops: Shows placeholder with brand message
 */

import { IconSymbol } from '@/components/ui/Icon';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopProfileHeroProps {
    videoUrl?: string | null;
    imageUrl?: string | null;
    tagline?: string | null;
    shopName: string;
    onVideoPress?: () => void;
}

export const ShopProfileHero = memo(({
    videoUrl,
    imageUrl,
    tagline,
    shopName,
    onVideoPress,
}: ShopProfileHeroProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const hasMedia = videoUrl || imageUrl;

    if (!hasMedia) {
        // New shop - Show welcome placeholder
        return (
            <View style={styles.placeholderContainer}>
                <LinearGradient
                    colors={[theme.colors.primary + '15', theme.colors.primary + '05']}
                    style={styles.placeholderGradient}
                >
                    <IconSymbol name="storefront" size={48} color={theme.colors.primary} />
                    <Text style={styles.welcomeText}>Chào mừng đến với</Text>
                    <Text style={styles.shopNameText}>{shopName}</Text>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {videoUrl ? (
                <Pressable onPress={onVideoPress} style={styles.videoContainer}>
                    {/* Video thumbnail with play button */}
                    <Image
                        source={{ uri: imageUrl || videoUrl }}
                        style={styles.heroImage}
                        contentFit="cover"
                        transition={300}
                    />
                    <View style={styles.playOverlay}>
                        <View style={styles.playButton}>
                            <IconSymbol name="play-arrow" size={32} color="#FFF" />
                        </View>
                    </View>
                </Pressable>
            ) : (
                <Image
                    source={{ uri: imageUrl! }}
                    style={styles.heroImage}
                    contentFit="cover"
                    transition={300}
                />
            )}

            {/* Tagline overlay */}
            {tagline && (
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.taglineOverlay}
                >
                    <Text style={styles.taglineText}>{tagline}</Text>
                </LinearGradient>
            )}
        </View>
    );
});

ShopProfileHero.displayName = 'ShopProfileHero';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        width: '100%',
        height: 220,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    videoContainer: {
        width: '100%',
        height: '100%',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    playButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    taglineOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.md,
    },
    taglineText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    placeholderContainer: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
    },
    placeholderGradient: {
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
    },
    welcomeText: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    shopNameText: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.typography,
        textAlign: 'center',
    },
}));

export default ShopProfileHero;