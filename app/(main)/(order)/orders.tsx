/**
 * ==============================================
 * ORDER HISTORY SCREEN - With Swipe Gesture
 * ==============================================
 */

import {
    OrderHistoryHeader,
    OrderListSkeleton,
    OrderListTab,
    OrderTabsBar,
} from '@/components/orders';
import { useCartStore } from '@/store/useCartStore';
import { OrderTabStatus } from '@/types/order/order';
import { ORDER_TABS } from '@/utils/adapter/order/orderStatusMapper';
import { Navigator } from '@/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * Map profile status keys to OrderTabStatus
 */
const mapProfileTabToOrderTab = (profileTab: string | undefined): OrderTabStatus => {
    switch (profileTab) {
        case 'pendingPayment':
            return 'AWAITING_PAYMENT';
        case 'processing':
            return 'CREATED';
        case 'shipping':
            return 'FULFILLING';
        case 'delivered':
            return 'DELIVERED';
        case 'review':
        case 'completed':
            return 'COMPLETED';
        case 'cancelled':
            return 'CANCELLED';
        default:
            if (__DEV__ && profileTab) {
                console.warn(`[Orders] Unknown tab param: "${profileTab}", using default CREATED`);
            }
            return 'CREATED';
    }
};

/**
 * Lấy index của tab trong ORDER_TABS
 */
const getTabIndex = (tab: OrderTabStatus): number => {
    const index = ORDER_TABS.findIndex(t => t.key === tab);
    return index >= 0 ? index : 1;
};

export default function OrderHistoryScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const pagerRef = useRef<PagerView>(null);

    const { tab } = useLocalSearchParams<{ tab?: string }>();

    const initialTab = useMemo(() => mapProfileTabToOrderTab(tab), [tab]);
    const initialIndex = useMemo(() => getTabIndex(initialTab), [initialTab]);

    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const activeTab = ORDER_TABS[activeIndex]?.key || 'CREATED';

    // Lazy loading: Track các tab đã được visit
    const [visitedTabs, setVisitedTabs] = useState<Set<number>>(() => new Set([initialIndex]));

    // Handle deep link change
    const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
    if (initialTab !== prevInitialTab) {
        setPrevInitialTab(initialTab);
        const newIndex = getTabIndex(initialTab);
        setActiveIndex(newIndex);
        setVisitedTabs(prev => new Set([...prev, newIndex]));
        pagerRef.current?.setPage(newIndex);
    }

    const cartItemCount = useCartStore((state) => state.totalQuantity);

    const handleTabChange = useCallback((newTab: OrderTabStatus) => {
        const newIndex = getTabIndex(newTab);
        setActiveIndex(newIndex);
        setVisitedTabs(prev => new Set([...prev, newIndex]));
        pagerRef.current?.setPage(newIndex);
    }, []);

    const handlePageSelected = useCallback((event: any) => {
        const position = event.nativeEvent.position;
        setActiveIndex(position);
        setVisitedTabs(prev => new Set([...prev, position]));
    }, []);

    const handleCartPress = useCallback(() => {
        Navigator.push('/(main)/cart');
    }, []);

    return (
        <View style={styles.container}>
            <OrderHistoryHeader
                onCartPress={handleCartPress}
                cartBadge={cartItemCount}
            />

            <OrderTabsBar
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            <PagerView
                ref={pagerRef}
                style={styles.pager}
                initialPage={initialIndex}
                onPageSelected={handlePageSelected}
                overdrag={true}
                offscreenPageLimit={1}
            >
                {ORDER_TABS.map((tabConfig, index) => (
                    <View key={tabConfig.key} style={styles.page}>
                        {visitedTabs.has(index) ? (
                            <OrderListTab status={tabConfig.key} />
                        ) : (
                            <OrderListSkeleton count={3} />
                        )}
                    </View>
                ))}
            </PagerView>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    pager: {
        flex: 1,
    },
    page: {
        flex: 1,
    },
}));
