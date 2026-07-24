/**
 * LoyaltyHowItWorksSheet - Bottom sheet guide for TCano Coins.
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { IconSymbolName } from '@/components/ui/Icon';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface LoyaltyHowItWorksSheetProps {
    visible: boolean;
    onClose: () => void;
}

type GuideItem = {
    number: number;
    icon: IconSymbolName;
    iconColor: string;
    iconBackground: string;
    title: string;
    body?: string;
    bullets?: string[];
    callout?: string;
};

const GuideIcon = memo<{
    icon: IconSymbolName;
    color: string;
    backgroundColor: string;
}>(({ icon, color, backgroundColor }) => (
    <View style={[styles.iconTile, { backgroundColor }]}>
        <IconSymbol name={icon} size={26} color={color} />
    </View>
));

GuideIcon.displayName = 'GuideIcon';

const GuideRow = memo<{
    item: GuideItem;
}>(({ item }) => {
    const { theme } = useUnistyles();

    return (
        <View style={styles.guideRow}>
            <GuideIcon
                icon={item.icon}
                color={item.iconColor}
                backgroundColor={item.iconBackground}
            />
            <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>
                    {item.number}. {item.title}
                </Text>
                {item.body ? (
                    <Text style={styles.guideBody}>{item.body}</Text>
                ) : null}
                {item.bullets ? (
                    <View style={styles.bulletGroup}>
                        {item.bullets.map((bullet) => (
                            <View key={bullet} style={styles.bulletRow}>
                                <View style={styles.bulletDot} />
                                <Text style={styles.bulletText}>{bullet}</Text>
                            </View>
                        ))}
                    </View>
                ) : null}
                {item.callout ? (
                    <View style={styles.callout}>
                        <IconSymbol name="info-outline" size={14} color={theme.colors.warning} />
                        <Text style={styles.calloutText}>{item.callout}</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
});

GuideRow.displayName = 'GuideRow';

export const LoyaltyHowItWorksSheet = memo<LoyaltyHowItWorksSheetProps>(({
    visible,
    onClose,
}) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const { t } = useTranslation('loyalty');

    const guideItems = useMemo<GuideItem[]>(() => [
        {
            number: 1,
            icon: 'coin',
            iconColor: theme.colors.warning,
            iconBackground: theme.colors.warningLight,
            title: t('guideSheet.what.title'),
            body: t('guideSheet.what.body'),
        },
        {
            number: 2,
            icon: 'bag',
            iconColor: theme.colors.accent,
            iconBackground: theme.colors.warningSubtle,
            title: t('guideSheet.earn.title'),
            bullets: [
                t('guideSheet.earn.bullets.purchase'),
                t('guideSheet.earn.bullets.review'),
                t('guideSheet.earn.bullets.program'),
            ],
        },
        {
            number: 3,
            icon: 'ticket',
            iconColor: theme.colors.accent,
            iconBackground: theme.colors.accentLight,
            title: t('guideSheet.use.title'),
            body: t('guideSheet.use.body'),
        },
        {
            number: 4,
            icon: 'calendar',
            iconColor: theme.colors.warning,
            iconBackground: theme.colors.warningSubtle,
            title: t('guideSheet.available.title'),
            body: t('guideSheet.available.body'),
        },
        {
            number: 5,
            icon: 'notifications',
            iconColor: theme.colors.accent,
            iconBackground: theme.colors.warningLight,
            title: t('guideSheet.note.title'),
            callout: t('guideSheet.note.callout'),
        },
    ], [t, theme]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.modalRoot}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <Pressable
                    style={[
                        styles.sheet,
                        {
                            maxHeight: Math.round(height * 0.84),
                            paddingBottom: insets.bottom + theme.margins.smd,
                        },
                    ]}
                    onPress={(event) => event.stopPropagation()}
                >
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    <Text style={styles.title}>{t('guideSheet.title')}</Text>

                    <ScrollView
                        style={styles.contentScroll}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        {guideItems.map((item) => (
                            <GuideRow key={item.number} item={item} />
                        ))}
                    </ScrollView>

                    <View style={styles.footer}>
                        <Pressable style={styles.primaryButton} onPress={onClose}>
                            <Text style={styles.primaryButtonText}>{t('guideSheet.understood')}</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </View>
        </Modal>
    );
});

LoyaltyHowItWorksSheet.displayName = 'LoyaltyHowItWorksSheet';

const styles = StyleSheet.create((theme) => ({
    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: theme.colors.inkBlack,
        opacity: 0.5,
    },
    sheet: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.radius.l,
        borderTopRightRadius: theme.radius.l,
        paddingHorizontal: theme.margins.md,
        shadowColor: theme.colors.inkBlack,
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 10,
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: theme.margins.sm,
        paddingBottom: theme.margins.smd,
    },
    handle: {
        width: 44,
        height: 4,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.borderMuted,
    },
    title: {
        textAlign: 'center',
        fontSize: theme.fontSizes.lg,
        lineHeight: 24,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
        marginBottom: theme.margins.md,
    },
    contentScroll: {
        flexGrow: 0,
    },
    content: {
        gap: theme.margins.md,
        paddingBottom: theme.margins.smd,
    },
    guideRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.margins.md,
    },
    iconTile: {
        width: 56,
        height: 56,
        borderRadius: theme.radius.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    guideContent: {
        flex: 1,
        paddingTop: 1,
    },
    guideTitle: {
        fontSize: theme.fontSizes.md,
        lineHeight: 19,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
        marginBottom: theme.margins.xs,
    },
    guideBody: {
        fontSize: theme.fontSizes.sm,
        lineHeight: 19,
        color: theme.colors.typographySecondary,
    },
    bulletGroup: {
        gap: theme.margins.xs,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        minHeight: 24,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.backgroundNewSurface,
        paddingHorizontal: theme.margins.sm,
    },
    bulletDot: {
        width: 5,
        height: 5,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.accent,
    },
    bulletText: {
        flex: 1,
        fontSize: theme.fontSizes.xsm,
        lineHeight: 16,
        color: theme.colors.typography,
    },
    callout: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.margins.sm,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.warningSubtle,
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.sm,
    },
    calloutText: {
        flex: 1,
        fontSize: theme.fontSizes.xsm,
        lineHeight: 16,
        color: theme.colors.typographySecondary,
    },
    footer: {
        paddingTop: theme.margins.sm,
        gap: theme.margins.smd,
    },
    primaryButton: {
        minHeight: 46,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.md,
    },
    primaryButtonText: {
        color: theme.colors.onAccent,
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.semibold,
    },
}));
