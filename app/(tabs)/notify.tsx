import { EmptyState } from '@/components/notifications/EmptyState';
import { FilterBar } from '@/components/notifications/FilterBar';
import { NotificationHeader } from '@/components/notifications/NotificationHeader';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { NotificationSkeleton } from '@/components/notifications/NotificationSkeleton';
import { SectionHeader } from '@/components/notifications/SectionHeader';
import { useMarkAllAsRead, useMarkAsRead, useNotifications } from '@/hooks/api/useNotifications';
import {
    FILTER_TABS,
    FlattenedNotificationItem,
    Notification,
    NotificationFilter,
} from '@/types/notification';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function NotifyScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const [activeFilter, setActiveFilter] = useState<NotificationFilter>(NotificationFilter.ALL);

    const {
        flattenedData,
        stickyHeaderIndices,
        isLoading,
        isRefetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useNotifications(activeFilter);

    const markAllAsRead = useMarkAllAsRead();
    const markAsRead = useMarkAsRead();

    const handleFilterChange = useCallback((filter: NotificationFilter) => {
        setActiveFilter(filter);
    }, []);

    const handleNotificationPress = useCallback((item: Notification) => {
        // Gửi request đánh dấu đã đọc (fire-and-forget)
        if (!item.isRead) {
            markAsRead.mutate(item.id);
        }
        // Navigate đến trang chi tiết nếu có actionUrl
        if (item.actionUrl) {
            router.push(item.actionUrl as any);
        }
    }, [markAsRead]);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const renderItem = useCallback(
        ({ item }: { item: FlattenedNotificationItem }) => {
            if (item.type === 'section-header') {
                return <SectionHeader title={item.title} />;
            }
            return (
                <NotificationItem
                    item={item.data}
                    onPress={handleNotificationPress}
                />
            );
        },
        [handleNotificationPress]
    );

    const getItemType = useCallback((item: FlattenedNotificationItem) => {
        return item.type;
    }, []);

    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }, [isFetchingNextPage, styles.loadingFooter, theme.colors.primary]);

    const renderEmpty = useCallback(() => {
        const currentFilter = FILTER_TABS.find((tab) => tab.key === activeFilter);
        return <EmptyState filterLabel={activeFilter !== NotificationFilter.ALL ? currentFilter?.label : undefined} />;
    }, [activeFilter]);

    // Show skeleton on initial load
    if (isLoading) {
        return (
            <View style={styles.container}>
                <NotificationHeader
                    onMarkAllRead={() => markAllAsRead.mutate()}
                    isMarkingAll={markAllAsRead.isPending}
                />
                <FilterBar activeFilter={activeFilter} onFilterChange={handleFilterChange} />
                <NotificationSkeleton count={6} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <NotificationHeader
                onMarkAllRead={() => markAllAsRead.mutate()}
                isMarkingAll={markAllAsRead.isPending}
            />
            <FilterBar activeFilter={activeFilter} onFilterChange={handleFilterChange} />

            <FlashList
                data={flattenedData}
                renderItem={renderItem}
                getItemType={getItemType}
                stickyHeaderIndices={stickyHeaderIndices}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching && !isLoading}
                        onRefresh={refetch}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        paddingBottom: theme.margins.md,
    },
    loadingFooter: {
        paddingVertical: theme.margins.md,
        alignItems: 'center',
    },
}));
