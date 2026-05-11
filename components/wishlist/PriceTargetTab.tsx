import { IconSymbol } from '@/components/ui/Icon';
import { productRoutes } from '@/constants/routes';

import { usePriceTargetMet } from '@/hooks/api/wishlist/usePriceTargetMet';
import type { WishlistItemUI } from '@/types/wishlist';
import { formatCurrency } from '@/utils/format';
import { Navigator } from '@/utils/navigation';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface PriceTargetTabProps {
    onSwitchToPrivateTab: () => void;
}

export const PriceTargetTab: React.FC<PriceTargetTabProps> = ({ onSwitchToPrivateTab }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('wishlist');

    const { data: targetData, isLoading, isRefetching, refetch } = usePriceTargetMet();

    const groups = useMemo(() => targetData?.groups ?? [], [targetData?.groups]);
    const totalItems = targetData?.totalItems ?? 0;
    const flatItems = useMemo(() => groups.flatMap(g => g.items), [groups]);

    const handleBuyNow = useCallback((item: WishlistItemUI) => {
        Navigator.push(productRoutes.detail(item.productId, { action: 'buy-now' }));
    }, []);

    const renderItem = useCallback(({ item }: { item: WishlistItemUI }) => {
        const hasTargetPrice = item.desiredPrice != null && item.desiredPrice > 0;
        const savingsAmount = hasTargetPrice && item.desiredPrice! > item.price
            ? item.desiredPrice! - item.price
            : 0;

        return (
            <Pressable
                style={styles.card}
                onPress={() => Navigator.push(productRoutes.detail(item.productId))}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.imageUrl ?? undefined }}
                        style={styles.image}
                        contentFit="cover"
                        transition={200}
                    />
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {item.productName}
                    </Text>

                    <View style={styles.priceBlock}>
                        <View style={styles.priceLine}>
                            <Text style={styles.currentPrice}>
                                {formatCurrency(item.price)}
                            </Text>
                            {hasTargetPrice && (
                                <Text style={styles.targetPriceText} numberOfLines={1}>
                                    {t('targetPriceGoal', { price: formatCurrency(item.desiredPrice!) })}
                                </Text>
                            )}
                        </View>

                        <View style={styles.reachedPill}>
                            <IconSymbol name="check-circle" size={12} color={theme.colors.forestGreen} />
                            <Text style={styles.reachedPillText}>
                                {t('priceTargetTab.reachedBadge')}
                            </Text>
                        </View>

                        {savingsAmount > 0 && (
                            <View style={styles.savingsPill}>
                                <IconSymbol name="pricetag" size={12} color={theme.colors.forestGreen} />
                                <Text style={styles.savingsText} numberOfLines={1}>
                                    {t('priceTargetTab.savingsComparedToSaved', {
                                        amount: formatCurrency(savingsAmount),
                                    })}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Pressable
                        style={styles.buyButton}
                        onPress={() => handleBuyNow(item)}
                    >
                        <Text style={styles.buyButtonText}>{t('priceTargetTab.buyNow')}</Text>
                        <IconSymbol name="shopping-cart" size={12} color={theme.colors.onAccent} />
                    </Pressable>
                </View>
            </Pressable>
        );
    }, [handleBuyNow, styles, theme, t]);

    if (isLoading) {
        return (
            <View style={styles.centerTarget}>
                <ActivityIndicator size="large" color={theme.colors.newPrimary} />
            </View>
        );
    }

    if (groups.length === 0) {
        return (
            <ScrollView
                contentContainerStyle={styles.emptyContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={theme.colors.newPrimary}
                        colors={[theme.colors.newPrimary]}
                    />
                }
            >
                <IconSymbol name="favorite" size={64} color={theme.colors.border} />
                <Text style={styles.emptyTitle}>{t('priceTargetTab.emptyTitle')}</Text>
                <Text style={styles.emptySubtitle}>
                    {t('priceTargetTab.emptySubtitle')}
                </Text>
                <Pressable style={styles.emptyButton} onPress={onSwitchToPrivateTab}>
                    <Text style={styles.emptyButtonText}>{t('priceTargetTab.manageButton')}</Text>
                </Pressable>
            </ScrollView>
        );
    }

    return (
        <View style={styles.container}>
            <FlashList<WishlistItemUI>
                data={flatItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.content}
                ListHeaderComponent={
                    <View style={styles.headerBox}>
                        <View style={styles.headerBoxContent}>
                            <IconSymbol name="celebration" size={20} color={theme.colors.success} />
                            <Text style={styles.headerBoxText}>
                                {t('priceTargetTab.successMessage', { totalItems })}
                            </Text>
                        </View>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={theme.colors.newPrimary}
                        colors={[theme.colors.newPrimary]}
                    />
                }
            />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    centerTarget: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.margins.md,
        paddingBottom: theme.margins.xl,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.margins.lg,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        marginTop: theme.margins.md,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        marginTop: theme.margins.sm,
        lineHeight: 20,
        marginBottom: theme.margins.lg,
    },
    emptyButton: {
        backgroundColor: theme.colors.newPrimary,
        paddingHorizontal: theme.margins.lg,
        paddingVertical: 12,
        borderRadius: 24,
    },
    emptyButtonText: {
        color: theme.colors.onPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    headerBox: {
        backgroundColor: theme.colors.successSoft,
        padding: theme.margins.md,
        borderRadius: 12,
        marginBottom: theme.margins.md,
        borderWidth: 1,
        borderColor: theme.colors.successLight,
    },
    headerBoxContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    headerBoxText: {
        color: theme.colors.forestGreen,
        fontSize: 14,
        fontWeight: '600',
        flexShrink: 1,
    },

    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        padding: theme.margins.sm,
        marginBottom: theme.margins.sm,
        elevation: 1,
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        flex: 1,
        marginLeft: theme.margins.sm,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 14,
        color: theme.colors.typography,
        fontWeight: '500',
    },
    priceBlock: {
        marginTop: theme.margins.xs,
        gap: 4,
    },
    priceLine: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: theme.margins.xs,
    },
    currentPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.newPrimary,
    },
    targetPriceText: {
        color: theme.colors.typographySecondary,
        fontWeight: '500',
        fontSize: 11,
    },
    reachedPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        backgroundColor: theme.colors.successSoft,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.successLight,
    },
    reachedPillText: {
        color: theme.colors.forestGreen,
        fontWeight: '600',
        fontSize: 11,
    },
    savingsPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        maxWidth: '100%',
        gap: 4,
        backgroundColor: theme.colors.successSoft,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: theme.radius.s,
    },
    savingsText: {
        flexShrink: 1,
        color: theme.colors.forestGreen,
        fontWeight: '600',
        fontSize: 11,
    },
    buyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: theme.colors.accent,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        ...theme.shadows.small,
        marginTop: theme.margins.sm,
        alignSelf: 'flex-end',
    },
    buyButtonText: {
        color: theme.colors.onAccent,
        fontSize: 12,
        fontWeight: '700',
    },
}));
