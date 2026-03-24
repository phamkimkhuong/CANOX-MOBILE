import type { ShopLoyaltyPolicyUI } from '@/types/loyalty/ui';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';

interface ProductLoyaltyPolicySheetProps {
    visible: boolean;
    onClose: () => void;
    policy?: ShopLoyaltyPolicyUI | null;
}

const InfoRow = memo<{
    label: string;
    value: string;
}>(({ label, value }) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
));

InfoRow.displayName = 'InfoRow';

export const ProductLoyaltyPolicySheet = memo<ProductLoyaltyPolicySheetProps>(({
    visible,
    onClose,
    policy,
}) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation(['loyalty']);

    const numberFormatter = useMemo(() => new Intl.NumberFormat(
        i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US'
    ), [i18n.language]);

    if (!policy || !policy.isEnabled) return null;

    const rewardPoints = numberFormatter.format(policy.rewardValue);
    const containerStyle = [
        styles.container,
        { paddingBottom: insets.bottom + 16 },
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable
                    style={containerStyle}
                    onPress={(event) => event.stopPropagation()}
                >
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{t('loyalty:pdp.sheetTitle')}</Text>
                        <Pressable style={styles.closeButton} onPress={onClose}>
                            <IconSymbol name="close" size={24} color={theme.colors.typography} />
                        </Pressable>
                    </View>

                    <View style={styles.heroCard}>
                        <View style={styles.heroIconWrap}>
                            <IconSymbol name="coin" size={20} color={theme.colors.warning} />
                        </View>
                        <View style={styles.heroContent}>
                            <Text style={styles.heroLabel}>{t('loyalty:pdp.sheetEarn')}</Text>
                            <Text style={styles.heroValue}>
                                {t('loyalty:pdp.sheetEarnValue', { points: rewardPoints })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.content}>
                        <InfoRow
                            label={t('loyalty:pdp.sheetShop')}
                            value={policy.shopName}
                        />
                        <InfoRow
                            label={t('loyalty:pdp.sheetCondition')}
                            value={t('loyalty:pdp.sheetConditionValue')}
                        />
                        {policy.expiryDays > 0 && (
                            <InfoRow
                                label={t('loyalty:pdp.sheetExpiry')}
                                value={t('loyalty:pdp.sheetExpiryValue', { days: policy.expiryDays })}
                            />
                        )}
                        {policy.maxDiscountPercent > 0 && (
                            <InfoRow
                                label={t('loyalty:pdp.sheetMaxDiscount')}
                                value={t('loyalty:pdp.sheetMaxDiscountValue', { percent: policy.maxDiscountPercent })}
                            />
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
});

ProductLoyaltyPolicySheet.displayName = 'ProductLoyaltyPolicySheet';

const styles = StyleSheet.create((theme) => ({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: theme.margins.md,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.secondary,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        position: 'relative',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        padding: 4,
    },
    heroCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.md,
        marginTop: theme.margins.lg,
        padding: theme.margins.md,
        borderRadius: theme.radius.l,
        backgroundColor: theme.colors.warningLight,
        borderWidth: 1,
        borderColor: theme.colors.warningLight,
    },
    heroIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.warningSoft,
    },
    heroContent: {
        flex: 1,
    },
    heroLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.warning,
        marginBottom: 2,
    },
    heroValue: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    content: {
        paddingVertical: theme.margins.lg,
        gap: theme.margins.md,
    },
    row: {
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.typographySecondary,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 14,
        lineHeight: 20,
        color: theme.colors.typography,
    },
}));
