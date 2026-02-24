/**
 * ==============================================
 * WISHLIST COLLECTION CHIPS - Horizontal Scrollable
 * ==============================================
 */

import { SkeletonBox, useShimmerAnimation } from '@/components/ui/feedback/Skeleton';
import { IconSymbol } from '@/components/ui/Icon';
import type { WishlistCardUI } from '@/types/wishlist';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface WishlistCollectionChipsProps {
    wishlists: WishlistCardUI[];
    activeId: string | null;
    onSelect: (wishlistId: string) => void;
    onCreate: () => void;
    isLoading?: boolean;
}

export const WishlistCollectionChips: React.FC<WishlistCollectionChipsProps> = ({
    wishlists,
    activeId,
    onSelect,
    onCreate,
    isLoading,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const shimmerStyle = useShimmerAnimation(!!isLoading);

    const renderChip = useCallback((item: WishlistCardUI) => {
        const isActive = activeId === item.id;

        return (
            <Pressable
                key={item.id}
                style={[
                    styles.chip,
                    isActive && styles.chipActive,
                ]}
                onPress={() => onSelect(item.id)}
            >
                {/* Default star icon */}
                {item.isDefault && (
                    <IconSymbol
                        name="star"
                        size={14}
                        color={isActive ? '#fff' : theme.colors.warning}
                    />
                )}

                <Text
                    style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                    ]}
                    numberOfLines={1}
                >
                    {item.name}
                </Text>

                {/* Item count badge */}
                {item.itemCount > 0 && (
                    <View style={[
                        styles.countBadge,
                        isActive && styles.countBadgeActive,
                    ]}>
                        <Text style={[
                            styles.countText,
                            isActive && styles.countTextActive,
                        ]}>
                            {item.itemCount}
                        </Text>
                    </View>
                )}
            </Pressable>
        );
    }, [activeId, onSelect, styles, theme.colors.warning]);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonBox
                        key={i}
                        width={90}
                        height={36}
                        borderRadius={20}
                        animatedStyle={shimmerStyle}
                    />
                ))
            ) : (
                <>
                    {/* Wishlist chips */}
                    {wishlists.map(renderChip)}

                    {/* Create new chip */}
                    <Pressable
                        style={styles.createChip}
                        onPress={onCreate}
                    >
                        <IconSymbol name="add" size={16} color={theme.colors.newPrimary} />
                        <Text style={styles.createText}>Tạo mới</Text>
                    </Pressable>
                </>
            )}
        </ScrollView>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        gap: 8,
        alignItems: 'center',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 5,
        maxWidth: 150,
    },
    chipActive: {
        backgroundColor: theme.colors.newPrimary,
        borderColor: theme.colors.newPrimary,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    chipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    countBadge: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: theme.colors.backgroundSurface,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    countBadgeActive: {
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    countText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    countTextActive: {
        color: '#fff',
    },
    createChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.newPrimary,
        borderStyle: 'dashed',
        gap: 4,
    },
    createText: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.newPrimary,
    },
    chipSkeleton: {
        width: 90,
        height: 36,
        borderRadius: 20,
        backgroundColor: theme.colors.backgroundSurface,
    },
}));
