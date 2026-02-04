/**
 * ==============================================
 * ORDER HISTORY SCREEN
 * ==============================================
 * Màn hình lịch sử đơn hàng với tabs theo trạng thái
 */

import {
    OrderHistoryHeader,
    OrderListTab,
    OrderTabsBar,
} from '@/components/orders';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { useCartStore } from '@/store/useCartStore';
import { OrderTabStatus } from '@/types/order/order';
import { Navigator } from '@/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

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
            // Log invalid param for debugging (only in dev)
            if (__DEV__ && profileTab) {
                console.warn(`[Orders] Unknown tab param: "${profileTab}", using default CREATED`);
            }
            return 'COMPLETED';
    }
};

export default function OrderHistoryScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const styles = stylesheet;


    // Get tab param from URL for deep linking
    const { tab } = useLocalSearchParams<{ tab?: string }>();

    // Map the tab param to OrderTabStatus
    const initialTab = useMemo(() => mapProfileTabToOrderTab(tab), [tab]);

    // State for active tab - initialized from URL param
    const [activeTab, setActiveTab] = useState<OrderTabStatus>(initialTab);

    const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
    if (initialTab !== prevInitialTab) {
        setPrevInitialTab(initialTab);
        setActiveTab(initialTab);
    }

    // Cart badge from store
    const cartItemCount = useCartStore((state) => state.totalQuantity);

    // Handlers
    const handleTabChange = useCallback((newTab: OrderTabStatus) => {
        setActiveTab(newTab);
    }, []);

    const handleCartPress = useCallback(() => {
        Navigator.push('/(main)/cart');
    }, []);

    return (
        <View style={styles.container}>
            {/* Header */}
            <OrderHistoryHeader
                onCartPress={handleCartPress}
                cartBadge={cartItemCount}
            />

            {/* Tab Bar */}
            <OrderTabsBar
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            {/* Content - Hiển thị tab đang active */}
            <View style={styles.content}>
                <OrderListTab status={activeTab} />
            </View>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
    },
}));
