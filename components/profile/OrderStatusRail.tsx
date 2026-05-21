import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { ORDER_STATUS_CONFIG, OrderStats } from '@/types/profile/profile';
import { Navigator } from '@/utils/navigation';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderStatusRailProps {
    stats: OrderStats | undefined;
    isLoading?: boolean;
    isError?: boolean;
    onRetry?: () => void;
}

/**
 * Formats badge count (99+ for large numbers)
 */
const formatBadgeCount = (count: number): string => {
    if (count > 99) return '99+';
    return count.toString();
};

/**
 * Order status rail showing pending orders with badge counts
 */
export const OrderStatusRail: React.FC<OrderStatusRailProps> = memo(({
    stats,
    isLoading = false,
    isError = false,
    onRetry,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation(['profile', 'common']);

    const handlePress = useCallback((statusKey: string) => {
        const targetTab = statusKey === 'completed' ? 'delivered' : statusKey;
        Navigator.push({
            pathname: ROUTES.ORDERS.LIST,
            params: { tab: targetTab },
        });
    }, []);

    const handleViewHistory = useCallback(() => {
        Navigator.push({
            pathname: ROUTES.ORDERS.LIST,
            params: { tab: 'delivered' },
        });
    }, []);

    // Error state
    if (isError) {
        return (
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('orders.title')}</Text>
                </View>
                <View style={styles.errorContainer}>
                    <IconSymbol name="error" size={24} color={theme.colors.error} />
                    <Text style={styles.errorText}>{t('common:status.error')}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
                        <Text style={styles.retryText}>{t('common:actions.retry')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Loading skeleton
    if (isLoading) {
        return (
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.titleSkeleton} />
                </View>
                <View style={styles.statusRow}>
                    {[1, 2, 3, 4].map((i) => (
                        <View key={i} style={styles.statusItemSkeleton}>
                            <View style={styles.iconSkeleton} />
                            <View style={styles.labelSkeleton} />
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{t('orders.title')}</Text>
                <TouchableOpacity
                    style={styles.viewAllBtn}
                    onPress={handleViewHistory}
                    activeOpacity={0.7}
                >
                    <Text style={styles.viewAllText}>{t('orders.viewAll')}</Text>
                    <IconSymbol name="forward" size={14} color={theme.colors.secondary} />
                </TouchableOpacity>
            </View>

            {/* Status Items */}
            <View style={styles.statusRow}>
                {ORDER_STATUS_CONFIG.map((item) => {
                    const count = stats?.[item.key] ?? 0;
                    const hasBadge = count > 0;

                    return (
                        <TouchableOpacity
                            key={item.key}
                            style={styles.statusItem}
                            onPress={() => handlePress(item.key)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.iconContainer}>
                                <IconSymbol
                                    name={item.icon as keyof typeof IconSymbol}
                                    size={24}
                                    color={theme.colors.secondary}
                                />
                                {hasBadge && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>
                                            {formatBadgeCount(count)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.statusLabel} numberOfLines={2}>
                                {t(`orderStatus.${item.key}`)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
});

OrderStatusRail.displayName = 'OrderStatusRail';

const stylesheet = StyleSheet.create((theme) => ({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        marginHorizontal: theme.margins.smd,
        marginBottom: theme.margins.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.secondary,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusItem: {
        flex: 1,
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 13,
        backgroundColor: theme.colors.secondaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.onPrimary,
    },
    statusLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 14,
    },
    // Error state
    errorContainer: {
        alignItems: 'center',
        paddingVertical: theme.margins.lg,
        gap: theme.margins.sm,
    },
    errorText: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    retryBtn: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        backgroundColor: theme.colors.primaryMuted,
        borderRadius: theme.radius.m,
    },
    retryText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    // Skeleton styles
    titleSkeleton: {
        width: 80,
        height: 16,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
    statusItemSkeleton: {
        flex: 1,
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    iconSkeleton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: theme.colors.secondaryLight,
    },
    labelSkeleton: {
        width: 50,
        height: 12,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
}));
