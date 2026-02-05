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
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation(['shop']);
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
                    <Text style={styles.headerTitle}>{t('vouchers.title')}</Text>
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
        marginTop: 8,
        marginBottom: 8,
        paddingTop: 16,
        paddingBottom: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: -0.5,
    },
    badge: {
        backgroundColor: theme.colors.activeSoft,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.buttonActive,
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
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.buttonActive,
    },

    // Scroll Content
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: 12,
    },
}));

export default ShopVoucherSection;
