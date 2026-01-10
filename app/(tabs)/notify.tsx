import { EmptyState } from '@/components/notifications/EmptyState';
import { FilterBar } from '@/components/notifications/FilterBar';
import { NotificationHeader } from '@/components/notifications/NotificationHeader';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { NotificationSkeleton } from '@/components/notifications/NotificationSkeleton';
import { SectionHeader } from '@/components/notifications/SectionHeader';
import { useMarkAllAsRead, useMarkAsRead, useNotifications, useRefreshNotifications } from '@/hooks/api/notification/useNotifications';
import { usePrefetchNotificationNav } from '@/hooks/api/notification/usePrefetchNotificationNav';
import {
    FILTER_TABS,
    FlattenedNotificationItem,
    Notification,
    NotificationFilter,
} from '@/types/notification';
import { Alert as CustomAlert } from '@/utils/AlertHelper';
import { Navigator } from '@/utils/navigation';
import { FlashList } from '@shopify/flash-list';
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
    } = useNotifications(activeFilter);

    // Smart refresh: only fetch page 0 instead of all loaded pages
    const { refresh: smartRefresh } = useRefreshNotifications(activeFilter);

    const markAllAsRead = useMarkAllAsRead();
    const markAsRead = useMarkAsRead();

    // Prefetch hook for near-instant navigation
    const prefetchNav = usePrefetchNotificationNav();

    const handleFilterChange = useCallback((filter: NotificationFilter) => {
        setActiveFilter(filter);
    }, []);

    const handleMarkAllRead = useCallback(() => {
        CustomAlert.show({
            title: 'Đánh dấu đã đọc',
            message: 'Bạn có muốn đánh dấu tất cả thông báo là đã đọc không?',
            type: 'info',
            confirmText: 'Đồng ý',
            cancelText: 'Huỷ',
            showCancel: true,
            onConfirm: () => {
                markAllAsRead.mutate();
            },
        });
    }, [markAllAsRead]);

    /**
     * Handle notification press - navigate to target screen
     * Data should already be prefetched from onPressIn
     */
    const handleNotificationPress = useCallback((item: Notification) => {
        // Fire-and-forget: mark as read
        if (!item.isRead) {
            markAsRead.mutate(item.id);
        }
        // Navigate using high-performance Navigator
        if (item.actionUrl) {
            Navigator.push(item.actionUrl as any);
        }
    }, [markAsRead]);

    /**
     * Handle notification press in - prefetch data while finger is on screen
     */
    const handleNotificationPressIn = useCallback((item: Notification) => {
        prefetchNav(item.actionUrl);
    }, [prefetchNav]);

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
                    onPressIn={handleNotificationPressIn}
                />
            );
        },
        [handleNotificationPress, handleNotificationPressIn]
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
                    onMarkAllRead={handleMarkAllRead}
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
                onMarkAllRead={handleMarkAllRead}
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
                        onRefresh={smartRefresh}
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
