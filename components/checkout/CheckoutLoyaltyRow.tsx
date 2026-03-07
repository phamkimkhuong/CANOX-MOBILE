import { IconSymbol } from '@/components/ui/Icon';
import type { CheckoutLoyaltyInfoUI } from '@/types/checkout';
import { formatCurrency } from '@/utils/format';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Switch, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface CheckoutLoyaltyRowProps {
    loyaltyInfo: CheckoutLoyaltyInfoUI | null;
    isRedeeming: boolean;
    onToggle: (willRedeem: boolean) => void;
}

export const CheckoutLoyaltyRow: React.FC<CheckoutLoyaltyRowProps> = ({
    loyaltyInfo,
    isRedeeming,
    onToggle,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('checkout');
    const styles = stylesheet;

    // Hiển thị nếu có thể redeem hoặc nếu có điểm tối đa cho phép
    const {
        availablePoints = 0,
        discountAmount = 0,
        canRedeem = false,
        message = '',
        maxPointsAllowed = 0,
        maxDiscountPercent = 0,
        expectedPointsEarned = 0
    } = loyaltyInfo || {};

    const handleShowInfo = useCallback(() => {
        const infoLines = [];
        if (maxPointsAllowed > 0) infoLines.push(`• ${t('loyalty.infoMaxPoints', { points: maxPointsAllowed })}`);
        if (maxDiscountPercent > 0) infoLines.push(`• ${t('loyalty.infoMaxPercent', { percent: maxDiscountPercent })}`);
        if (expectedPointsEarned > 0) infoLines.push(`• ${t('loyalty.infoEarning', { points: expectedPointsEarned })}`);
        if (message) infoLines.push(`• ${t('loyalty.infoMessage', { message })}`);

        Alert.alert(
            t('loyalty.infoTitle'),
            infoLines.join('\n'),
            [{ text: 'OK', style: 'cancel' }]
        );
    }, [t, maxPointsAllowed, maxDiscountPercent, expectedPointsEarned, message]);

    if (!loyaltyInfo) return null;

    const hasPointsToConsider = availablePoints > 0 || maxPointsAllowed > 0;

    if (!hasPointsToConsider && !message) {
        return null; // Không hiện nếu shop không có chính sách loyalty và user cũng ko có điểm
    }

    const title = t('loyalty.shopTitle');

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <View style={[styles.iconContainer, canRedeem && styles.iconActive]}>
                    <IconSymbol
                        name="star.circle.fill"
                        size={18}
                        color={canRedeem ? theme.colors.primary : theme.colors.typographySecondary}
                    />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{title}</Text>
                        {(maxPointsAllowed > 0 || expectedPointsEarned > 0 || message) ? (
                            <TouchableOpacity onPress={handleShowInfo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <IconSymbol name="info" size={16} color={theme.colors.typographySecondary} style={styles.infoIcon} />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    {isRedeeming && discountAmount > 0 ? (
                        <Text style={styles.discountText}>
                            -{formatCurrency(discountAmount)}
                        </Text>
                    ) : (
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {canRedeem ? t('loyalty.pointsAvailable', { points: availablePoints }) : message || t('loyalty.pointsAvailable', { points: availablePoints })}
                        </Text>
                    )}
                </View>
            </View>

            <Switch
                value={isRedeeming}
                onValueChange={onToggle}
                disabled={!canRedeem}
                trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primaryLight,
                }}
                thumbColor={isRedeeming ? theme.colors.primary : theme.colors.surface}
            />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.md,
        paddingHorizontal: theme.margins.md,
        backgroundColor: theme.colors.background,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: theme.margins.sm,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.margins.md,
    },
    iconActive: {
        backgroundColor: `${theme.colors.primary}12`,
        borderColor: 'transparent',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    infoIcon: {
        marginLeft: 6,
    },
    subtitle: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    discountText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.success,
    },
}));

export default CheckoutLoyaltyRow;
