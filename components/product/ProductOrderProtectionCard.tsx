import { IconSymbol, type IconSymbolName } from '@/components/ui/Icon';
import { LEGAL_URLS } from '@/constants/legal';
import { ROUTES } from '@/constants/routes';
import { Navigator } from '@/utils/navigation';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type ProtectionPolicyId = 'payment' | 'shipping' | 'return' | 'support';

interface ProtectionPolicyMeta {
    id: ProtectionPolicyId;
    icon: IconSymbolName;
    slug: string;
    url: string;
}

const PROTECTION_POLICIES: ProtectionPolicyMeta[] = [
    {
        id: 'payment',
        icon: 'shield-checkmark-outline',
        slug: 'payment',
        url: LEGAL_URLS.PAYMENT,
    },
    {
        id: 'shipping',
        icon: 'local-shipping',
        slug: 'shipping',
        url: LEGAL_URLS.SHIPPING,
    },
    {
        id: 'return',
        icon: 'refresh-outline',
        slug: 'return',
        url: LEGAL_URLS.RETURN,
    },
    {
        id: 'support',
        icon: 'headset-outline',
        slug: 'regulations',
        url: LEGAL_URLS.MARKETPLACE_REGULATIONS,
    },
];

export const ProductOrderProtectionCard = memo(() => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('product');
    const [isSheetVisible, setIsSheetVisible] = useState(false);

    const policies = useMemo(() => (
        PROTECTION_POLICIES.map((policy) => ({
            ...policy,
            title: t(`orderProtection.items.${policy.id}.title`),
            summaryTitle: t(`orderProtection.items.${policy.id}.summaryTitle`),
            description: t(`orderProtection.items.${policy.id}.description`),
            policyTitle: t(`orderProtection.items.${policy.id}.policyTitle`),
        }))
    ), [t]);

    const handleOpenSheet = useCallback(() => {
        setIsSheetVisible(true);
    }, []);

    const handleCloseSheet = useCallback(() => {
        setIsSheetVisible(false);
    }, []);

    const handleLearnMore = useCallback((policy: typeof policies[number]) => {
        setIsSheetVisible(false);
        requestAnimationFrame(() => {
            Navigator.push({
                pathname: ROUTES.SETTINGS.LEGAL_DETAIL,
                params: {
                    slug: policy.slug,
                    url: policy.url,
                    title: policy.policyTitle,
                },
            } as never);
        });
    }, []);

    return (
        <>
            <Pressable
                style={styles.container}
                onPress={handleOpenSheet}
                android_ripple={{ color: theme.colors.activeSoft }}
            >
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>{t('orderProtection.cardTitle')}</Text>
                        <Text style={styles.subtitle} numberOfLines={2}>
                            {t('orderProtection.cardSubtitle')}
                        </Text>
                    </View>
                    <IconSymbol name="chevron-right" size={18} color={theme.colors.typographySecondary} />
                </View>
                <View style={styles.summaryRow}>
                    {policies.map((policy, index) => (
                        <View key={policy.id} style={styles.summaryItem}>
                            <IconSymbol name={policy.icon} size={18} color={theme.colors.success2} />
                            <Text style={styles.summaryText} numberOfLines={2}>
                                {policy.summaryTitle}
                            </Text>
                            {index < policies.length - 1 && <View style={styles.summaryDivider} />}
                        </View>
                    ))}
                </View>
            </Pressable>
            <Modal
                visible={isSheetVisible}
                animationType="slide"
                transparent
                onRequestClose={handleCloseSheet}
            >
                <Pressable style={styles.overlay} onPress={handleCloseSheet}>
                    <Pressable
                        style={[styles.sheet, { paddingBottom: insets.bottom + theme.margins.md }]}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <View style={styles.handleContainer}>
                            <View style={styles.handle} />
                        </View>

                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>{t('orderProtection.sheetTitle')}</Text>
                            <Pressable style={styles.closeButton} onPress={handleCloseSheet}>
                                <IconSymbol name="close" size={24} color={theme.colors.typography} />
                            </Pressable>
                        </View>

                        <ScrollView
                            style={styles.sheetScroll}
                            contentContainerStyle={styles.sheetContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={styles.sheetHeading}>
                                {t('orderProtection.sheetHeading')}
                            </Text>
                            <Text style={styles.sheetIntro}>
                                {t('orderProtection.sheetIntro')}
                            </Text>

                            <View style={styles.policyList}>
                                {policies.map((policy) => (
                                    <View key={policy.id} style={styles.policyItem}>
                                        <View style={styles.policyIcon}>
                                            <IconSymbol name={policy.icon} size={20} color={theme.colors.success} />
                                        </View>
                                        <View style={styles.policyText}>
                                            <Text style={styles.policyTitle}>{policy.title}</Text>
                                            <Text style={styles.policyDescription}>
                                                {policy.description}
                                            </Text>
                                            {policy.id !== 'payment' && (
                                                <Pressable
                                                    style={styles.learnMoreButton}
                                                    onPress={() => handleLearnMore(policy)}
                                                >
                                                    <Text style={styles.learnMoreText}>
                                                        {t('orderProtection.learnMore')}
                                                    </Text>
                                                    <IconSymbol
                                                        name="chevron-right"
                                                        size={14}
                                                        color={theme.colors.primary}
                                                    />
                                                </Pressable>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
});

ProductOrderProtectionCard.displayName = 'ProductOrderProtectionCard';

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        marginTop: theme.margins.sm,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: theme.margins.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    subtitle: {
        fontSize: 12,
        lineHeight: 17,
        color: theme.colors.typographySecondary,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        backgroundColor: theme.colors.backgroundNewSurface,
        marginTop: theme.margins.sm,
        paddingTop: theme.margins.xs,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderMuted,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: theme.margins.xs,
        position: 'relative',
        gap: 4,
    },
    summaryText: {
        fontSize: 11,
        lineHeight: 15,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    summaryDivider: {
        position: 'absolute',
        right: 0,
        top: 4,
        bottom: 4,
        width: 1,
        backgroundColor: theme.colors.border,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        justifyContent: 'flex-end',
    },
    sheet: {
        maxHeight: '88%',
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingHorizontal: theme.margins.md,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
    },
    handle: {
        width: 42,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.border,
    },
    sheetHeader: {
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        padding: theme.margins.xs,
    },
    sheetScroll: {
        flexGrow: 0,
    },
    sheetContent: {
        paddingVertical: theme.margins.lg,
    },
    sheetHeading: {
        fontSize: 20,
        lineHeight: 26,
        fontWeight: '800',
        color: theme.colors.typography,
    },
    sheetIntro: {
        fontSize: 13,
        lineHeight: 19,
        color: theme.colors.typographySecondary,
        marginTop: theme.margins.xs,
    },
    policyList: {
        marginTop: theme.margins.lg,
        gap: theme.margins.lg,
    },
    policyItem: {
        flexDirection: 'row',
        gap: theme.margins.sm,
        paddingBottom: theme.margins.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderMuted,
    },
    policyIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: theme.colors.activeSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    policyText: {
        flex: 1,
    },
    policyTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    policyDescription: {
        fontSize: 13,
        lineHeight: 19,
        color: theme.colors.typographySecondary,
        marginTop: 4,
    },
    learnMoreButton: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.margins.sm,
        gap: 2,
    },
    learnMoreText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.primary,
    },
}));

export default ProductOrderProtectionCard;
