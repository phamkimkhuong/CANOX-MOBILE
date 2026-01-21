/**
 * ==============================================
 * PENDING REVIEW LIST - FlashList for Pending Tab
 * ==============================================
 * List of products awaiting review with order grouping
 */

import type { PendingReviewGroup, PendingReviewItem } from '@/types/review';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import React, { useCallback, useMemo } from 'react';
import { RefreshControl, View } from 'react-native';
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
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Flatten groups into list items
    const listData = useMemo<ListItem[]>(() => {
        const items: ListItem[] = [];

        for (const group of groups) {
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
}));

export default PendingReviewList;
