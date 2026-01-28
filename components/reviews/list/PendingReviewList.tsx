/**
 * ==============================================
 * PENDING REVIEW LIST - FlashList for Pending Tab
 * ==============================================
 * List of products awaiting review with order grouping
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { PendingReviewGroup, PendingReviewItem } from '@/types/review';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { EmptyReviewState } from './EmptyReviewState';
import { PendingReviewCard } from './PendingReviewCard';
import { ReviewListSkeleton } from './ReviewListSkeleton';

interface PendingReviewListProps {
    /** Grouped pending review data */
    groups: PendingReviewGroup[];
    /** Loading state */
    isLoading?: boolean;
    /** Refreshing state */
    isRefreshing?: boolean;
    /** Refresh callback */
    onRefresh?: () => void;
    /** Error state */
    error?: Error | null;
    /** Optional Order ID to filter the list */
    filterOrderId?: string;
    /** Callback to clear the active filter */
    onClearFilter?: () => void;
}

// List item type for flat list data
type ListItem = {
    type: 'item';
    data: PendingReviewItem;
    itemCount: number;
};

/**
 * PendingReviewList - FlashList with order grouping
 */
export const PendingReviewList: React.FC<PendingReviewListProps> = ({
    groups,
    isLoading = false,
    isRefreshing = false,
    onRefresh,
    error,
    filterOrderId,
    onClearFilter,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation(['myReviews']);

    // Filter groups based on orderId context
    const filteredGroups = useMemo(() => {
        if (!filterOrderId) return groups;
        return groups.filter((g) => g.orderId === filterOrderId);
    }, [groups, filterOrderId]);

    // Flatten groups into list items
    const listData = useMemo<ListItem[]>(() => {
        const items: ListItem[] = [];

        for (const group of filteredGroups) { // Use filteredGroups here
            // Add items with their group's item count
            for (const item of group.items) {
                items.push({
                    type: 'item',
                    data: item,
                    itemCount: group.items.length,
                });
            }
        }

        return items;
    }, [groups]);

    const renderItem: ListRenderItem<ListItem> = useCallback(
        ({ item }) => {
            return (
                <PendingReviewCard
                    item={item.data}
                    itemCount={item.itemCount}
                />
            );
        },
        []
    );

    const keyExtractor = useCallback(
        (item: ListItem) => `pending-${item.data.orderId}-${item.data.itemId || item.data.productId}-${item.data.variantId || 'default'}`,
        []
    );

    const getItemType = useCallback(() => 'item', []);

    // Loading state
    if (isLoading && listData.length === 0) {
        return <ReviewListSkeleton />;
    }

    // Empty state
    if (!isLoading && listData.length === 0) {
        return (
            <EmptyReviewState
                type="pending"
                onRefresh={onRefresh}
            />
        );
    }

    return (
        <View style={styles.container}>
            {/* Filter Active Header */}
            {filterOrderId && (
                <View style={styles.filterHeader}>
                    <View style={styles.filterInfo}>
                        <IconSymbol name="info.circle.fill" size={14} color={theme.colors.newPrimary} />
                        <Text style={styles.filterText}>
                            {t('filter.viewingOrder', {
                                orderNumber: filteredGroups[0]?.items[0]?.orderNumber || filterOrderId.slice(0, 8)
                            })}
                        </Text>
                    </View>
                    <Pressable onPress={onClearFilter} style={styles.clearButton}>
                        <Text style={styles.clearText}>{t('filter.viewAll')}</Text>
                    </Pressable>
                </View>
            )}
            <FlashList
                data={listData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                getItemType={getItemType}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    contentContainer: {
        paddingVertical: theme.margins.md,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        gap: 4,
    },
    orderNumber: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    itemCount: {
        fontSize: 12,
        color: theme.colors.secondary,
    },
    itemSeparator: {
        height: 4,
    },
    filterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    filterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
    clearButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    clearText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.newPrimary,
    },
}));

export default PendingReviewList;
