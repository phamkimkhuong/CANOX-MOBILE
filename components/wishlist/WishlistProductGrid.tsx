/**
 * ==============================================
 * WISHLIST PRODUCT GRID - 2-Column Product Grid
 * ==============================================
 * Displays wishlist items as a 2-column product grid
 * Similar to home page / search results style.
 */

import { SkeletonBox, SkeletonText } from '@/components/ui/feedback/Skeleton';
import { ProductCard } from '@/components/ui/product/ProductCard';
import { productRoutes } from '@/constants/routes';
import type { WishlistItemUI } from '@/types/wishlist';
import { Navigator } from '@/utils/navigation';
import { toPublicUrl } from '@/utils/url';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    Text,
    View
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_GAP = 8;
const HORIZONTAL_PADDING = 12;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

interface WishlistProductGridProps {
    items: WishlistItemUI[];
    isLoading?: boolean;
    onFavoritePress?: (variantId: string) => void;
    ListHeaderComponent?: React.ReactElement;
    wishlistName?: string;
}

/**
 * Skeleton for the grid while loading
 */
const GridSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={styles.skeletonCard}>
                    <SkeletonBox width={CARD_WIDTH} height={CARD_WIDTH} borderRadius={12} />
                    <View style={styles.skeletonContent}>
                        <SkeletonText width="90%" height={14} />
                        <SkeletonText width="60%" height={14} style={styles.skeletonMargin6} />
                        <SkeletonText width="40%" height={16} style={styles.skeletonMargin8} />
                    </View>
                </View>
            ))}
        </View>
    );
};

/**
 * Empty state when no items
 */
const EmptyGrid: React.FC<{ wishlistName?: string }> = ({ wishlistName }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('wishlist');
    const styles = stylesheet;

    return (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
                <IconSymbol name="favorite-border" size={48} color={theme.colors.newPrimary} />
            </View>
            <Text style={styles.emptyTitle}>
                {wishlistName ? `"${wishlistName}" ${t('empty.productTitle')}` : t('empty.title')}
            </Text>
            <Text style={styles.emptySubtitle}>
                {t('empty.subtitle')}
            </Text>
        </View>
    );
};

export const WishlistProductGrid: React.FC<WishlistProductGridProps> = ({
    items,
    isLoading,
    onFavoritePress,
    ListHeaderComponent,
    wishlistName,
}) => {
    const { t } = useTranslation('wishlist');
    const styles = stylesheet;

    const handleProductPress = useCallback((productId: string) => {
        Navigator.push(productRoutes.detail(productId));
    }, []);

    const renderItem = useCallback(({ item }: { item: WishlistItemUI }) => {
        const imageUrl = item.imageUrl || toPublicUrl(null) || '';
        // Determine badge text for price target status
        const badgeText = item.isPriceTargetMet ? t('targetPriceMet') : undefined;
        const badgeColor = item.isPriceTargetMet ? '#dcfce7' : undefined;

        return (
            <View style={styles.cardWrapper}>
                <ProductCard
                    title={item.productName}
                    price={item.price}
                    image={imageUrl}
                    route={productRoutes.detail(item.productId)}
                    onPress={() => handleProductPress(item.productId)}
                    variantId={item.variantId}
                    onFavoritePress={onFavoritePress}
                    priceDisplay={item.formattedPrice}
                    targetPrice={item.formattedDesiredPrice ?? undefined}
                    badgeText={badgeText}
                    badgeColor={badgeColor}
                    hideSold
                    favoriteAlwaysFilled
                />
            </View>
        );
    }, [
        handleProductPress,
        onFavoritePress,
        styles.cardWrapper,
        t,
    ]);

    if (isLoading) {
        return (
            <View>
                {ListHeaderComponent}
                <GridSkeleton />
            </View>
        );
    }

    if (items.length === 0) {
        return (
            <View>
                {ListHeaderComponent}
                <EmptyGrid wishlistName={wishlistName} />
            </View>
        );
    }

    return (
        <FlashList<WishlistItemUI>
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            masonry={true}
            contentContainerStyle={styles.gridContent}
            ListHeaderComponent={ListHeaderComponent}
        />
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    gridContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingBottom: theme.margins.xl,
    },
    cardWrapper: {
        flex: 1,
        margin: COLUMN_GAP / 2,
        position: 'relative',
    },
    footer: {
        paddingVertical: theme.margins.md,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
        paddingTop: 80,
    },
    emptyIconWrap: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: theme.colors.activeLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.lg,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    skeletonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: HORIZONTAL_PADDING,
        gap: COLUMN_GAP,
        paddingTop: theme.margins.sm,
    },
    skeletonCard: {
        width: CARD_WIDTH,
        marginBottom: theme.margins.md,
    },
    skeletonContent: {
        paddingTop: theme.margins.sm,
        paddingHorizontal: 4,
    },
    skeletonMargin6: {
        marginTop: 6,
    },
    skeletonMargin8: {
        marginTop: 8,
    },
}));
