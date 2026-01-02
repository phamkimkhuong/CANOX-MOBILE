import { ProfileMenuItem, SERVICE_MENU_CONFIG } from '@/types/profile/profile';
import { formatCurrency } from '@/utils/format';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { memo, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ServiceGridProps {
    walletBalance?: number;
    coinsBalance?: number;
    voucherCount?: number;
    isLoading?: boolean;
}

/**
 * Service grid showing wallet, coins, vouchers, and shipping
 */
export const ServiceGrid: React.FC<ServiceGridProps> = memo(({
    walletBalance = 0,
    coinsBalance = 0,
    voucherCount = 0,
    isLoading = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const handlePress = useCallback((route: string) => {
        if (route) {
            router.push(route as never);
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
                return coinsBalance > 0 ? `${coinsBalance.toLocaleString('vi-VN')}` : 'Thu thập';
            case 'vouchers':
                return voucherCount > 0 ? `${voucherCount} mã` : 'Xem ngay';
            case 'shipping':
                return 'Đặt ngay';
            default:
                return '';
        }
    }, [walletBalance, coinsBalance, voucherCount]);

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
                                <MaterialIcons
                                    name={item.icon as keyof typeof MaterialIcons.glyphMap}
                                    size={20}
                                    color={item.iconColor}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.label}>{item.label}</Text>
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
                            <MaterialIcons
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
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.md,
    },
    grid: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    itemFirst: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    itemLast: {
        borderBottomWidth: 0,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
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
