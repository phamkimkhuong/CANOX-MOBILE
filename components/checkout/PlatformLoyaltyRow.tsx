import { IconSymbol } from '@/components/ui/Icon';
import type { PlatformLoyaltyUI } from '@/types/checkout';
import { formatCurrency } from '@/utils/format';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface PlatformLoyaltyRowProps {
    platformLoyalty: PlatformLoyaltyUI | null;
    isEnabled: boolean;
    onToggle: (enabled: boolean) => void;
}

const formatPoints = (points: number, locale: string): string => {
    return Math.round(points).toLocaleString(locale);
};

export const PlatformLoyaltyRow: React.FC<PlatformLoyaltyRowProps> = ({
    platformLoyalty,
    isEnabled,
    onToggle,
}) => {
    const { theme } = useUnistyles();
    const { t, i18n } = useTranslation('checkout');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const statusText = useMemo(() => {
        if (!platformLoyalty) return null;

        if (isEnabled && platformLoyalty.totalDiscountAmount > 0) {
            return `-${formatCurrency(platformLoyalty.totalDiscountAmount)}`;
        }

        if (platformLoyalty.hasRedeemableShop) {
            return t('platformLoyalty.apply');
        }

        return t('platformLoyalty.unavailable');
    }, [isEnabled, platformLoyalty, t]);

    if (!platformLoyalty) return null;

    const handleToggle = () => {
        if (!platformLoyalty.hasRedeemableShop && !isEnabled) return;
        onToggle(!isEnabled);
        setIsModalVisible(false);
    };

    return (
        <>
            <Pressable
                style={({ pressed }) => [
                    styles.container,
                    pressed && styles.containerPressed,
                ]}
                onPress={() => setIsModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={t('platformLoyalty.title')}
            >
                <View style={styles.titleRow}>
                    <View style={styles.titleIcon}>
                        <IconSymbol
                            name="sparkles"
                            size={18}
                            color={theme.colors.primary}
                        />
                    </View>
                    <Text style={styles.title}>{t('platformLoyalty.title')}</Text>
                </View>

                <View style={styles.subtitleRow}>
                    <Text style={styles.subtitle}>{t('platformLoyalty.detailByShop')}</Text>
                    <View style={styles.trailingContent}>
                        <Text
                            style={[
                                styles.statusText,
                                isEnabled && platformLoyalty.totalDiscountAmount > 0 && styles.statusTextActive,
                                !platformLoyalty.hasRedeemableShop && !isEnabled && styles.statusTextDisabled,
                            ]}
                        >
                            {statusText}
                        </Text>
                        <IconSymbol
                            name="chevron-right"
                            size={18}
                            color={theme.colors.typographySecondary}
                        />
                    </View>
                </View>
            </Pressable>

            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.handleBar} />

                                <View style={styles.modalHeader}>
                                    <View style={styles.modalHeaderLeft}>
                                        <IconSymbol
                                            name="sparkles"
                                            size={22}
                                            color={theme.colors.primary}
                                        />
                                        <Text style={styles.modalTitle}>
                                            {t('platformLoyalty.modalTitle')}
                                        </Text>
                                    </View>
                                    <Pressable
                                        onPress={() => setIsModalVisible(false)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <IconSymbol
                                            name="close"
                                            size={22}
                                            color={theme.colors.typographySecondary}
                                        />
                                    </Pressable>
                                </View>

                                <ScrollView
                                    style={styles.modalScroll}
                                    contentContainerStyle={styles.modalScrollContent}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryLabel}>
                                            {t('platformLoyalty.totalDiscount')}
                                        </Text>
                                        <Text style={styles.summaryValue}>
                                            {platformLoyalty.totalDiscountAmount > 0
                                                ? `-${formatCurrency(platformLoyalty.totalDiscountAmount)}`
                                                : formatCurrency(platformLoyalty.totalDiscountAmount)}
                                        </Text>

                                        {platformLoyalty.totalPointsToRedeem > 0 && (
                                                    <Text style={styles.summaryHint}>
                                                        {t('platformLoyalty.pointsRedeeming', {
                                                            points: formatPoints(
                                                                platformLoyalty.totalPointsToRedeem,
                                                                i18n.language === 'en' ? 'en-US' : 'vi-VN'
                                                            ),
                                                        })}
                                                    </Text>
                                        )}
                                    </View>

                                    {platformLoyalty.allocations.length > 0 ? (
                                        platformLoyalty.allocations.map((allocation) => (
                                            <View key={allocation.shopId} style={styles.shopCard}>
                                                <View style={styles.shopCardHeader}>
                                                    <Text style={styles.shopName}>{allocation.shopName}</Text>
                                                    {allocation.discountAmount > 0 && (
                                                        <Text style={styles.shopDiscount}>
                                                            -{formatCurrency(allocation.discountAmount)}
                                                        </Text>
                                                    )}
                                                </View>

                                                {allocation.pointsToRedeem > 0 ? (
                                                    <Text style={styles.shopMeta}>
                                                        {t('platformLoyalty.pointsRedeeming', {
                                                            points: formatPoints(
                                                                allocation.pointsToRedeem,
                                                                i18n.language === 'en' ? 'en-US' : 'vi-VN'
                                                            ),
                                                        })}
                                                    </Text>
                                                ) : (
                                                    <Text style={styles.shopMeta}>
                                                        {allocation.canRedeem
                                                            ? t('platformLoyalty.apply')
                                                            : t('platformLoyalty.shopUnavailable')}
                                                    </Text>
                                                )}

                                                {allocation.maxPointsForShop > 0 && (
                                                    <Text style={styles.shopMetaSecondary}>
                                                        {t('platformLoyalty.shopMaxPoints', {
                                                            points: formatPoints(
                                                                allocation.maxPointsForShop,
                                                                i18n.language === 'en' ? 'en-US' : 'vi-VN'
                                                            ),
                                                        })}
                                                    </Text>
                                                )}
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.emptyText}>
                                            {t('platformLoyalty.noAllocation')}
                                        </Text>
                                    )}
                                </ScrollView>

                                <View style={styles.footer}>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.actionButton,
                                            isEnabled ? styles.actionButtonSecondary : styles.actionButtonPrimary,
                                            (!platformLoyalty.hasRedeemableShop && !isEnabled) && styles.actionButtonDisabled,
                                            pressed && !(!platformLoyalty.hasRedeemableShop && !isEnabled) && styles.actionButtonPressed,
                                        ]}
                                        onPress={handleToggle}
                                        disabled={!platformLoyalty.hasRedeemableShop && !isEnabled}
                                    >
                                        <Text
                                            style={[
                                                styles.actionButtonText,
                                                isEnabled && styles.actionButtonTextSecondary,
                                            ]}
                                        >
                                            {!platformLoyalty.hasRedeemableShop && !isEnabled
                                                ? t('platformLoyalty.unavailable')
                                                : isEnabled
                                                    ? t('platformLoyalty.remove')
                                                    : t('platformLoyalty.apply')}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        marginBottom: theme.margins.sm,
        paddingVertical: theme.margins.sm,
    },

    containerPressed: {
        backgroundColor: theme.colors.background,
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.xs,
        gap: theme.margins.sm,
    },

    titleIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: `${theme.colors.primary}12`,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        fontSize: theme.fontSizes.md,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingLeft: theme.margins.md + 32 + theme.margins.sm,
        gap: theme.margins.sm,
    },

    subtitle: {
        flex: 1,
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
    },

    trailingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
    },

    statusText: {
        fontSize: theme.fontSizes.sm,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },

    statusTextActive: {
        color: theme.colors.success,
    },

    statusTextDisabled: {
        color: theme.colors.typographySecondary,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },

    modalContent: {
        maxHeight: '78%',
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.radius.l,
        borderTopRightRadius: theme.radius.l,
        paddingTop: theme.margins.xs,
    },

    handleBar: {
        alignSelf: 'center',
        width: 44,
        height: 4,
        borderRadius: 999,
        backgroundColor: theme.colors.border,
        marginBottom: theme.margins.md,
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
    },

    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },

    modalTitle: {
        fontSize: theme.fontSizes.lg,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    modalScroll: {
        maxHeight: 460,
    },

    modalScrollContent: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
        gap: theme.margins.sm,
    },

    summaryCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
        gap: theme.margins.xs,
    },

    summaryLabel: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
    },

    summaryValue: {
        fontSize: theme.fontSizes.lg,
        fontWeight: '700',
        color: theme.colors.success,
    },

    summaryHint: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
    },

    shopCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
        gap: theme.margins.xs,
    },

    shopCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.margins.sm,
    },

    shopName: {
        flex: 1,
        fontSize: theme.fontSizes.md,
        fontWeight: '500',
        color: theme.colors.typography,
    },

    shopDiscount: {
        fontSize: theme.fontSizes.sm,
        fontWeight: '600',
        color: theme.colors.success,
    },

    shopMeta: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
    },

    shopMetaSecondary: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.typographySecondary,
    },

    emptyText: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
        paddingVertical: theme.margins.sm,
    },

    footer: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.sm,
        paddingBottom: theme.margins.md,
        backgroundColor: theme.colors.background,
    },

    actionButton: {
        borderRadius: theme.radius.m,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },

    actionButtonPrimary: {
        backgroundColor: theme.colors.primary,
    },

    actionButtonSecondary: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },

    actionButtonDisabled: {
        backgroundColor: theme.colors.secondaryLight,
    },

    actionButtonPressed: {
        opacity: 0.92,
    },

    actionButtonText: {
        fontSize: theme.fontSizes.md,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },

    actionButtonTextSecondary: {
        color: theme.colors.typography,
    },
}));

export default PlatformLoyaltyRow;
