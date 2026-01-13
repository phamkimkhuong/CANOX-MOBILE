/**
 * ==============================================
 * WISHLIST DETAIL SCREEN - Chi tiết bộ sưu tập
 * ==============================================
 * Route: /wishlist/[id]
 * 
 * Features:
 * - View all items in wishlist
 * - Filter by priority
 * - Add to cart, edit, delete items
 * - Share wishlist
 */

import { IconSymbol } from '@/components/ui/Icon';
import {
    EmptyWishlistItems,
    WishlistItemCard,
    WishlistItemListSkeleton,
} from '@/components/wishlist';
import { productRoutes, ROUTES } from '@/constants/routes';
import { useWishlistDetail } from '@/hooks/api/wishlist';
import type { WishlistItemUI } from '@/types/wishlist';
import { Navigator } from '@/utils/navigation';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Pressable,
    RefreshControl,
    Share,
    Text,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

type FilterOption = 'all' | 'urgent' | 'price-met';

/**
 * Header component with back, title, and actions
 */
const DetailHeader: React.FC<{
    title: string;
    isPublic: boolean;
    onBack: () => void;
    onShare: () => void;
    onEdit: () => void;
}> = ({ title, isPublic, onBack, onShare, onEdit }) => {
    const { theme } = useUnistyles();
    const styles = headerStyles;

    return (
        <View style={styles.container}>
            <Pressable style={styles.backButton} onPress={onBack}>
                <IconSymbol name="back" size={24} color={theme.colors.typography} />
            </Pressable>

            <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
                <IconSymbol
                    name={isPublic ? 'public' : 'lock'}
                    size={14}
                    color={isPublic ? theme.colors.info : theme.colors.secondary}
                />
            </View>

            <View style={styles.actions}>
                <Pressable style={styles.actionButton} onPress={onShare}>
                    <IconSymbol name="share" size={22} color={theme.colors.primary} />
                </Pressable>
                <Pressable style={styles.actionButton} onPress={onEdit}>
                    <IconSymbol name="edit" size={22} color={theme.colors.typography} />
                </Pressable>
            </View>
        </View>
    );
};

const headerStyles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: UnistylesRuntime.insets.top,
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        padding: theme.margins.sm,
        marginLeft: -theme.margins.sm,
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: theme.margins.sm,
        gap: theme.margins.sm,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.margins.sm,
    },
    actionButton: {
        padding: theme.margins.sm,
    },
}));

/**
 * Filter Pills Component
 */
const FilterPills: React.FC<{
    activeFilter: FilterOption;
    onFilterChange: (filter: FilterOption) => void;
    counts: { all: number; urgent: number; priceMet: number };
}> = ({ activeFilter, onFilterChange, counts }) => {
    const { theme } = useUnistyles();
    const styles = filterStyles;

    const filters: { key: FilterOption; label: string; count: number }[] = [
        { key: 'all', label: 'Tất cả', count: counts.all },
        { key: 'urgent', label: 'Ưu tiên cao', count: counts.urgent },
        { key: 'price-met', label: 'Đạt giá', count: counts.priceMet },
    ];

    return (
        <View style={styles.container}>
            {filters.map((filter) => {
                const isActive = activeFilter === filter.key;
                return (
                    <Pressable
                        key={filter.key}
                        style={[
                            styles.pill,
                            isActive && styles.activePill,
                        ]}
                        onPress={() => onFilterChange(filter.key)}
                    >
                        <Text style={[
                            styles.pillText,
                            isActive && styles.activePillText,
                        ]}>
                            {filter.label}
                        </Text>
                        {filter.count > 0 && (
                            <Text style={[
                                styles.pillCount,
                                isActive && styles.activePillCount,
                            ]}>
                                {filter.count}
                            </Text>
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
};

const filterStyles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        gap: theme.margins.sm,
        backgroundColor: theme.colors.surface,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.sm,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.backgroundSurface,
        gap: 4,
    },
    activePill: {
        backgroundColor: theme.colors.primary,
    },
    pillText: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    activePillText: {
        color: theme.colors.onPrimary,
    },
    pillCount: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    activePillCount: {
        color: theme.colors.onPrimary,
    },
}));

/**
 * Main Wishlist Detail Screen
 */
export default function WishlistDetailScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { id } = useLocalSearchParams<{ id: string }>();

    const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

    const {
        data: wishlist,
        isLoading,
        isRefetching,
        refetch,
        isError,
    } = useWishlistDetail(id || null);

    /**
     * Calculate filter counts
     */
    const filterCounts = useMemo(() => {
        if (!wishlist) return { all: 0, urgent: 0, priceMet: 0 };

        return {
            all: wishlist.items.length,
            urgent: wishlist.items.filter(i => i.priority >= 1).length,
            priceMet: wishlist.items.filter(i => i.isPriceTargetMet).length,
        };
    }, [wishlist]);

    /**
     * Filter items based on active filter
     */
    const filteredItems = useMemo(() => {
        if (!wishlist) return [];

        switch (activeFilter) {
            case 'urgent':
                return wishlist.items.filter(i => i.priority >= 1);
            case 'price-met':
                return wishlist.items.filter(i => i.isPriceTargetMet);
            default:
                return wishlist.items;
        }
    }, [wishlist, activeFilter]);

    // Handlers
    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleShare = useCallback(async () => {
        if (!wishlist?.shareUrl) return;

        try {
            await Share.share({
                message: `Xem bộ sưu tập "${wishlist.name}" của tôi: ${wishlist.shareUrl}`,
                url: wishlist.shareUrl,
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Không thể chia sẻ',
            });
        }
    }, [wishlist]);

    const handleEdit = useCallback(() => {
        // TODO: Open edit wishlist bottom sheet
    }, []);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleItemPress = useCallback((item: WishlistItemUI) => {
        Navigator.push(productRoutes.detail(item.productId));
    }, []);

    const handleAddToCart = useCallback((item: WishlistItemUI) => {
        // TODO: Add to cart mutation
        Toast.show({
            type: 'success',
            text1: 'Đã thêm vào giỏ hàng',
            text2: item.productName,
        });
    }, []);

    const handleEditItem = useCallback((item: WishlistItemUI) => {
        // TODO: Open edit item bottom sheet
    }, []);

    const handleDeleteItem = useCallback((item: WishlistItemUI) => {
        // TODO: Confirm and delete item
    }, []);

    const handleAddProduct = useCallback(() => {
        Navigator.push(ROUTES.TABS.HOME);
    }, []);

    const renderItem = useCallback(({ item }: { item: WishlistItemUI }) => (
        <WishlistItemCard
            item={item}
            onPress={handleItemPress}
            onAddToCart={handleAddToCart}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
        />
    ), [handleItemPress, handleAddToCart, handleEditItem, handleDeleteItem]);

    // Loading state
    if (isLoading) {
        return (
            <View style={styles.container}>
                <DetailHeader
                    title="Đang tải..."
                    isPublic={false}
                    onBack={handleBack}
                    onShare={() => { }}
                    onEdit={() => { }}
                />
                <WishlistItemListSkeleton count={5} />
            </View>
        );
    }

    // Error state
    if (isError || !wishlist) {
        return (
            <View style={styles.container}>
                <DetailHeader
                    title="Lỗi"
                    isPublic={false}
                    onBack={handleBack}
                    onShare={() => { }}
                    onEdit={() => { }}
                />
                <View style={styles.errorContainer}>
                    <IconSymbol name="error" size={48} color={theme.colors.error} />
                    <Text style={styles.errorText}>Không thể tải bộ sưu tập</Text>
                    <Pressable style={styles.retryButton} onPress={() => refetch()}>
                        <Text style={styles.retryText}>Thử lại</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <DetailHeader
                title={wishlist.name}
                isPublic={wishlist.isPublic}
                onBack={handleBack}
                onShare={handleShare}
                onEdit={handleEdit}
            />

            {/* Filter Pills */}
            <FilterPills
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={filterCounts}
            />

            {/* Item List */}
            {filteredItems.length === 0 ? (
                <EmptyWishlistItems onAddProduct={handleAddProduct} />
            ) : (
                <FlashList<WishlistItemUI>
                    data={filteredItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={handleRefresh}
                            colors={[theme.colors.primary]}
                            tintColor={theme.colors.primary}
                        />
                    }
                />
            )}
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        paddingTop: theme.margins.sm,
        paddingBottom: theme.margins.xl,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.margins.md,
    },
    errorText: {
        fontSize: 16,
        color: theme.colors.typographySecondary,
    },
    retryButton: {
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.sm,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.m,
    },
    retryText: {
        color: theme.colors.onPrimary,
        fontWeight: '600',
    },
}));
