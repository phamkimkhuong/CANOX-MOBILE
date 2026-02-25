/**
 * ==============================================
 * WISHLIST PRODUCT GRID - 2-Column Product Grid
 * ==============================================
 * Displays wishlist items as a 2-column product grid
 * Similar to home page / search results style.
 */

import { SkeletonBox, useShimmerAnimation } from '@/components/ui/feedback/Skeleton';
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
    RefreshControl,
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
    onItemLongPress?: (item: WishlistItemUI) => void;
    ListHeaderComponent?: React.ReactElement;
    wishlistName?: string;
    isRefetching?: boolean;
    onRefresh?: () => void;
}

/**
 * Skeleton for the grid while loading
 */
const GridSkeleton: React.FC = () => {
    const styles = stylesheet;
    const shimmerStyle = useShimmerAnimation();

    return (
        <View style={styles.skeletonGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={styles.skeletonCard}>
                    <SkeletonBox
                        width={CARD_WIDTH}
                        height={CARD_WIDTH}
                        borderRadius={12}
                        animatedStyle={shimmerStyle}
                    />
                    <View style={styles.skeletonContent}>
                        <SkeletonBox
                            width="100%"
                            height={40}
                            borderRadius={8}
                            animatedStyle={shimmerStyle}
                        />
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
    onItemLongPress,
    ListHeaderComponent,
    wishlistName,
    isRefetching = false,
    onRefresh,
}) => {
    const { theme } = useUnistyles();
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
        // Determine if notes exist (non-null, non-empty)
        const hasNotes = !!item.notes && item.notes.trim().length > 0;

        return (
            <View style={styles.cardWrapper}>
                <ProductCard
                    title={item.productName}
                    price={item.price}
                    image={imageUrl}
                    route={productRoutes.detail(item.productId)}
                    onPress={() => handleProductPress(item.productId)}
                    onLongPress={onItemLongPress ? () => onItemLongPress(item) : undefined}
                    variantId={item.variantId}
                    onFavoritePress={onFavoritePress}
                    priceDisplay={item.formattedPrice}
                    targetPrice={item.formattedDesiredPrice ?? undefined}
                    badgeText={badgeText}
                    badgeColor={badgeColor}
                    hideSold
                    favoriteAlwaysFilled
                    priority={item.priority}
                    hasNotes={hasNotes}
                    showSetupTargetPrice={!item.formattedDesiredPrice}
                />
            </View>
        );
    }, [
        handleProductPress,
        onFavoritePress,
        onItemLongPress,
        styles.cardWrapper,
        t,
    ]);

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View>
                    {ListHeaderComponent}
                    <GridSkeleton />
                </View>
            ) : (
                <FlashList<WishlistItemUI>
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    masonry={true}
                    contentContainerStyle={styles.gridContent}
                    ListHeaderComponent={ListHeaderComponent}
                    ListEmptyComponent={<EmptyGrid wishlistName={wishlistName} />}
                    refreshControl={
                        onRefresh ? (
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={onRefresh}
                                tintColor={theme.colors.newPrimary}
                                colors={[theme.colors.newPrimary]}
                            />
                        ) : undefined
                    }
                />
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
    },
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
