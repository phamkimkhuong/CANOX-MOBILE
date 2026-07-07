import { useWishlistStore } from '@/store/useWishlistStore';
import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { IconSymbol } from '../Icon';

import { cleanAndFlattenStyles } from '@/utils/style';

interface FavoriteButtonProps {
    /** Variant ID to check liked status */
    variantId: string;
    /** Called when button is pressed — parent should open the Wishlist Picker modal */
    onPress: (variantId: string) => void;
    /** Icon size (default: 18) */
    size?: number;
    /** When true, always show filled red heart (for wishlist context) */
    alwaysFilled?: boolean;
}

/**
 * FavoriteButton — Heart icon on ProductCard
 *
 * Progressive loading strategy:
 * - Initially hidden (opacity 0) until Zustand store has been synced
 * - Fades in smoothly once the favorite status is known
 * - On toggle (user tap): scale bounce animation for tactile feedback
 * - All animations run on UI Thread via Reanimated (no JS Thread block)
 */
export const FavoriteButton = React.memo(({
    variantId,
    onPress,
    size = 18,
    alwaysFilled = false,
}: FavoriteButtonProps) => {
    const isLikedFromStore = useWishlistStore(
        useCallback((state) => !!state.favoritesMap[variantId], [variantId])
    );
    // Track whether the store has ever been written for this variantId
    const hasBeenSynced = useWishlistStore(
        useCallback((state) => variantId in state.favoritesMap, [variantId])
    );

    // In wishlist context, always show filled. Otherwise use store.
    const isLiked = alwaysFilled || isLikedFromStore;

    // Animation: fade in + scale bounce (UI Thread only)
    const opacity = useSharedValue(alwaysFilled ? 1 : 0);
    const scale = useSharedValue(1);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (alwaysFilled) {
            opacity.value = 1;
            return;
        }

        if (hasBeenSynced) {
            if (isFirstRender.current) {
                // First time synced: gentle fade in (progressive loading)
                opacity.value = withTiming(1, { duration: 300 });
                isFirstRender.current = false;
            } else {
                // Subsequent toggles: soft timing effect
                opacity.value = 1;
                scale.value = withTiming(1, { duration: 250 }, () => {
                    scale.value = 1;
                });
            }
        }
    }, [hasBeenSynced, isLiked, alwaysFilled, opacity, scale]);

    // Trigger softer scale bounce on toggle (after initial sync)
    const prevLikedRef = useRef(isLiked);
    useEffect(() => {
        if (prevLikedRef.current !== isLiked && !isFirstRender.current) {
            // Subtle, soft scale effect instead of aggressive spring bounce
            scale.value = 0.8;
            scale.value = withTiming(1, { duration: 250 });
        }
        prevLikedRef.current = isLiked;
    }, [isLiked, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    const handlePress = useCallback((e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        onPress(variantId);
    }, [onPress, variantId]);

    return (
        <Animated.View style={[cleanAndFlattenStyles(styles.container), animatedStyle]}>
            <Pressable
                onPress={handlePress}
                hitSlop={8}
                style={styles.pressable}
            >
                <IconSymbol
                    name={isLiked ? 'favorite' : 'favorite-border'}
                    size={size}
                    color={isLiked ? '#ef4444' : '#333'}
                />
            </Pressable>
        </Animated.View>
    );
});

FavoriteButton.displayName = 'FavoriteButton';

const styles = StyleSheet.create((_theme) => ({
    container: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    pressable: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
}));
