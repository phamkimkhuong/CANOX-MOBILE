import { useWishlistStore } from '@/store/useWishlistStore';
import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { IconSymbol } from '../Icon';

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
 * - Shows filled red heart if variant is liked (from Zustand store)
 * - Shows outline heart if not liked
 * - On press: calls `onPress(variantId)` so the parent can open
 *   a WishlistPickerSheet to choose which collection to add to
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

    // In wishlist context, always show filled. Otherwise use store.
    const isLiked = alwaysFilled || isLikedFromStore;

    const handlePress = useCallback((e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        onPress(variantId);
    }, [onPress, variantId]);

    return (
        <Pressable
            style={styles.container}
            onPress={handlePress}
            hitSlop={8}
        >
            <IconSymbol
                name={isLiked ? 'favorite' : 'favorite-border'}
                size={size}
                color={isLiked ? '#ef4444' : '#333'}
            />
        </Pressable>
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
}));
