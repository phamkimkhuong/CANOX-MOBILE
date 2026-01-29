/**
 * ==============================================
 * SHOP VOUCHER SECTION - Horizontal Voucher List
 * ==============================================
 * 
 * Displays shop vouchers in a horizontal scroll view
 * Positioned between Shop Stats and Tabs
 * 
 * Features:
 * - Horizontal scroll with peek effect (shows partial next voucher)
 * - Section header with "View All" action
 * - Smooth snap scrolling
 * - Skeleton loading state
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ShopVoucherUI } from '@/types/shop';
import React, { memo, useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { getVoucherWidth, ShopVoucherCard } from './ShopVoucherCard';
import { ShopVoucherSkeleton } from './ShopVoucherSkeleton';

interface ShopVoucherSectionProps {
    vouchers: ShopVoucherUI[];
    isLoading?: boolean;
    shopName?: string;
    onCollectVoucher?: (voucherId: string) => void;
}

/**
 * ShopVoucherSection Component
 * Horizontal scrollable voucher list for shop detail
 */
export const ShopVoucherSection = memo<ShopVoucherSectionProps>(({
    vouchers,
    isLoading = false,
    shopName,
    onCollectVoucher,
}) => {
    const { theme } = useUnistyles();
    const SNAP_INTERVAL = getVoucherWidth() + 16;

    const handleCollect = useCallback((voucherId: string) => {
        onCollectVoucher?.(voucherId);
    }, [onCollectVoucher]);

    // Don't render if no vouchers and not loading
    if (!isLoading && vouchers.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <IconSymbol
                        name="confirmation-number"
                        size={18}
                        color={theme.colors.error}
                    />
                    <Text style={styles.headerTitle}>Voucher của Shop</Text>
                    {!isLoading && vouchers.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{vouchers.length}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Voucher Horizontal List */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
                snapToInterval={SNAP_INTERVAL}
                snapToAlignment="start"
            >
                {isLoading ? (
                    // Skeleton loading
                    <>
                        <ShopVoucherSkeleton />
                        <ShopVoucherSkeleton />
                    </>
                ) : (
                    // Actual vouchers
                    vouchers.map((voucher) => (
                        <ShopVoucherCard
                            key={voucher.id}
                            voucher={voucher}
                            shopName={shopName}
                            onCollect={handleCollect}
                        />
                    ))
                )}
            </ScrollView>
        </View>
    );
});

ShopVoucherSection.displayName = 'ShopVoucherSection';

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        marginTop: theme.margins.sm,
        marginBottom: theme.margins.sm,
        paddingTop: theme.margins.sm,
        paddingBottom: theme.margins.md,
        borderRadius: theme.radius.l,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.smd,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    badge: {
        backgroundColor: theme.colors.errorSoft,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.error,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    viewAllButtonPressed: {
        opacity: 0.7,
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary,
    },

    // Scroll Content
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.md,
    },
}));

export default ShopVoucherSection;
