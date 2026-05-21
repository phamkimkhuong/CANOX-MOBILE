import { IconSymbol } from '@/components/ui/Icon';
import { ProfileMenuItem, SERVICE_MENU_CONFIG } from '@/types/profile/profile';
import { formatCurrency } from '@/utils/format';
import { Navigator } from '@/utils/navigation';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ServiceGridProps {
    walletBalance?: number;
    coinsBalance?: number;
    voucherCount?: number;
    reviewCount?: number;
    favoriteCount?: number;
    isLoading?: boolean;
}

/**
 * Service grid showing wallet, coins, vouchers, and shipping
 */
export const ServiceGrid: React.FC<ServiceGridProps> = memo(({
    walletBalance = 0,
    coinsBalance = 0,
    voucherCount = 0,
    reviewCount = 0,
    favoriteCount = 0,
    isLoading = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation(['profile', 'common']);

    const handlePress = useCallback((route: string) => {
        if (route) {
            Navigator.push(route as never);
        }
    }, []);

    /**
     * Get dynamic value for each service item
     */
    const getValue = useCallback((key: string): string => {
        switch (key) {
            case 'wallet':
                return formatCurrency(walletBalance);
            case 'coins':
                return coinsBalance > 0 ? `${coinsBalance.toLocaleString('vi-VN')}` : t('stats.units.collect');
            case 'vouchers':
                return voucherCount > 0 ? `${voucherCount} ${t('stats.units.vouchers')}` : t('common:actions.viewNow');
            case 'reviews':
                return reviewCount > 0 ? `${reviewCount} ${t('stats.units.reviews')}` : t('stats.units.pending');
            case 'favorites':
                return favoriteCount > 0 ? `${favoriteCount} ${t('product.info.reviews', { defaultValue: 'Sản phẩm' })}` : t('common:status.empty');
            case 'shipping':
                return t('stats.units.buyNow');
            default:
                return '';
        }
    }, [walletBalance, coinsBalance, voucherCount, reviewCount, favoriteCount, t]);

    // Loading skeleton
    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.grid}>
                    {[1, 2, 3, 4].map((i) => (
                        <View key={i} style={styles.itemSkeleton}>
                            <View style={styles.iconSkeleton} />
                            <View style={styles.textSkeleton}>
                                <View style={styles.labelSkeleton} />
                                <View style={styles.valueSkeleton} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {SERVICE_MENU_CONFIG.map((item: ProfileMenuItem, index: number) => {
                    const value = getValue(item.key);
                    const isFirst = index === 0;
                    const isLast = index === SERVICE_MENU_CONFIG.length - 1;

                    return (
                        <TouchableOpacity
                            key={item.key}
                            style={[
                                styles.item,
                                isFirst && styles.itemFirst,
                                isLast && styles.itemLast,
                            ]}
                            onPress={() => handlePress(item.route)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconWrapper, { backgroundColor: item.iconBgColor }]}>
                                <IconSymbol
                                    name={item.icon as keyof typeof IconSymbol}
                                    size={20}
                                    color={item.iconColor}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <Text style={styles.label}>{t(`menu.${item.key}` as any)}</Text>
                                <Text
                                    style={[
                                        styles.value,
                                        item.key === 'wallet' && styles.valueHighlight,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {value}
                                </Text>
                            </View>
                            <IconSymbol
                                name="chevron-right"
                                size={18}
                                color={theme.colors.typographySecondary}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
});

ServiceGrid.displayName = 'ServiceGrid';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginHorizontal: theme.margins.smd,
        marginBottom: theme.margins.md,
    },
    grid: {
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    itemFirst: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    itemLast: {
        borderBottomWidth: 0,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: theme.margins.md,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: 2,
    },
    value: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
    valueHighlight: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    // Skeleton styles
    itemSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    iconSkeleton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.colors.secondaryLight,
    },
    textSkeleton: {
        flex: 1,
        marginLeft: theme.margins.md,
        gap: 4,
    },
    labelSkeleton: {
        width: 80,
        height: 14,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
    valueSkeleton: {
        width: 60,
        height: 12,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
}));
