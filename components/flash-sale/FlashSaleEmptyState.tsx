import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface FlashSaleEmptyStateProps {
    onBack: () => void;
    onNotifyPress: () => void;
    onBrowsePress: () => void;
    onCategoriesPress: () => void;
    onTrustedShopsPress: () => void;
    onCartPress: () => void;
}

interface InfoCard {
    icon: IconSymbolName;
    title: string;
    description: string;
    variant?: 'primary' | 'accent' | 'success';
}

interface ActionTileProps {
    icon: IconSymbolName;
    title: string;
    description: string;
    onPress: () => void;
}

export const FlashSaleEmptyState = memo(({
    onBack,
    onNotifyPress,
    onBrowsePress,
    onCategoriesPress,
    onTrustedShopsPress,
    onCartPress,
}: FlashSaleEmptyStateProps) => {
    const { t } = useTranslation(['home']);
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const styles = stylesheet;

    const howItWorksCards: InfoCard[] = [
        {
            icon: 'calendar',
            title: t('home:flashSale.emptyState.slotTitle'),
            description: t('home:flashSale.emptyState.slotDescription'),
            variant: 'accent',
        },
        {
            icon: 'gift',
            title: t('home:flashSale.emptyState.limitedTitle'),
            description: t('home:flashSale.emptyState.limitedDescription'),
            variant: 'primary',
        },
        {
            icon: 'notifications',
            title: t('home:flashSale.emptyState.notifyTitle'),
            description: t('home:flashSale.emptyState.notifyDescription'),
            variant: 'success',
        },
    ];

    const trustCards: InfoCard[] = [
        {
            icon: 'verified-shield',
            title: t('home:flashSale.emptyState.verifiedSellerTitle'),
            description: t('home:flashSale.emptyState.verifiedSellerDescription'),
            variant: 'success',
        },
        {
            icon: 'ribbon-outline',
            title: t('home:flashSale.emptyState.curatedDealsTitle'),
            description: t('home:flashSale.emptyState.curatedDealsDescription'),
            variant: 'accent',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + theme.margins.sm }]}>
                <Pressable
                    onPress={onBack}
                    style={({ pressed }) => [styles.headerIconButton, pressed && styles.pressed]}
                    accessibilityRole="button"
                >
                    <IconSymbol name="arrow-left" size={24} color={theme.colors.typography} />
                </Pressable>

                <Text style={styles.headerTitle}>{t('home:flashSale.title')}</Text>

                <Pressable
                    onPress={onCartPress}
                    style={({ pressed }) => [styles.headerIconButton, pressed && styles.pressed]}
                    accessibilityRole="button"
                >
                    <IconSymbol name="cart" size={24} color={theme.colors.typography} />
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: insets.bottom + theme.margins.xl },
                ]}
            >
                <View style={styles.heroCard}>
                    <LinearGradient
                        colors={[
                            theme.colors.surface,
                            theme.colors.header.background,
                            theme.colors.warningSubtle,
                        ]}
                        locations={[0, 0.58, 1]}
                        style={styles.heroBackground}
                    />

                    <View style={styles.heroTop}>
                        <View style={styles.heroCopy}>
                            <Text style={styles.eyebrow}>
                                {t('home:flashSale.emptyState.eyebrow')}
                            </Text>
                            <Text style={styles.heroTitle}>
                                {t('home:flashSale.emptyState.title')}
                            </Text>
                            <Text style={styles.heroDescription}>
                                {t('home:flashSale.emptyState.description')}
                            </Text>

                            <View style={styles.statusChip}>
                                <IconSymbol name="time" size={14} color={theme.colors.secondary} />
                                <Text style={styles.statusChipText}>
                                    {t('home:flashSale.emptyState.statusChip')}
                                </Text>
                            </View>
                        </View>

                        <FlashSaleHeroArtwork />
                    </View>

                    <View style={styles.ctaStack}>
                        <Pressable
                            onPress={onNotifyPress}
                            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                            accessibilityRole="button"
                        >
                            <IconSymbol name="notifications-filled" size={17} color={theme.colors.onPrimary} />
                            <Text style={styles.primaryButtonText}>
                                {t('home:flashSale.emptyState.notifyCta')}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={onBrowsePress}
                            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                            accessibilityRole="button"
                        >
                            <IconSymbol name="bag" size={17} color={theme.colors.newPrimary} />
                            <Text style={styles.secondaryButtonText}>
                                {t('home:flashSale.emptyState.browseCta')}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <SectionTitle title={t('home:flashSale.emptyState.howItWorksTitle')} />
                <View style={styles.infoGrid}>
                    {howItWorksCards.map((card) => (
                        <InfoCardView key={card.title} card={card} compact />
                    ))}
                </View>

                <SectionTitle title={t('home:flashSale.emptyState.trustTitle')} />
                <View style={styles.trustGrid}>
                    {trustCards.map((card) => (
                        <InfoCardView key={card.title} card={card} />
                    ))}
                </View>

                <SectionTitle title={t('home:flashSale.emptyState.whileWaitingTitle')} />
                <View style={styles.actionStack}>
                    <ActionTile
                        icon="shopping-bag"
                        title={t('home:flashSale.emptyState.categoriesTitle')}
                        description={t('home:flashSale.emptyState.categoriesDescription')}
                        onPress={onCategoriesPress}
                    />
                    <ActionTile
                        icon="store"
                        title={t('home:flashSale.emptyState.trustedShopsTitle')}
                        description={t('home:flashSale.emptyState.trustedShopsDescription')}
                        onPress={onTrustedShopsPress}
                    />
                </View>
            </ScrollView>
        </View>
    );
});

FlashSaleEmptyState.displayName = 'FlashSaleEmptyState';

const SectionTitle = memo(({ title }: { title: string }) => {
    const styles = stylesheet;
    return <Text style={styles.sectionTitle}>{title}</Text>;
});

SectionTitle.displayName = 'FlashSaleEmptyStateSectionTitle';

const InfoCardView = memo(({ card, compact = false }: { card: InfoCard; compact?: boolean }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const toneStyle = getToneStyle(card.variant);
    const iconColor = card.variant === 'success'
        ? theme.colors.success
        : card.variant === 'accent'
            ? theme.colors.warning
            : theme.colors.newPrimary;

    return (
        <View style={[compact ? styles.infoCardCompact : styles.infoCard, toneStyle.card]}>
            <View style={[styles.infoIconWrap, toneStyle.iconWrap]}>
                <IconSymbol name={card.icon} size={compact ? 22 : 24} color={iconColor} />
            </View>
            {compact ? (
                <>
                    <Text style={[styles.infoTitle, styles.infoTitleCompact]} numberOfLines={2}>
                        {card.title}
                    </Text>
                    <Text style={[styles.infoDescription, styles.infoDescriptionCompact]} numberOfLines={2}>
                        {card.description}
                    </Text>
                </>
            ) : (
                <View style={styles.infoCopy}>
                    <Text style={styles.infoTitle} numberOfLines={2}>
                        {card.title}
                    </Text>
                    <Text style={styles.infoDescription} numberOfLines={2}>
                        {card.description}
                    </Text>
                </View>
            )}
        </View>
    );
});

InfoCardView.displayName = 'FlashSaleEmptyStateInfoCard';

const ActionTile = memo(({ icon, title, description, onPress }: ActionTileProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.actionTile, pressed && styles.pressed]}
            accessibilityRole="button"
        >
            <View style={styles.actionIconWrap}>
                <IconSymbol name={icon} size={23} color={theme.colors.warning} />
            </View>
            <View style={styles.actionCopy}>
                <Text style={styles.actionTitle} numberOfLines={1}>{title}</Text>
                <Text style={styles.actionDescription} numberOfLines={1}>{description}</Text>
            </View>
            <IconSymbol name="chevron-right" size={18} color={theme.colors.secondary} />
        </Pressable>
    );
});

ActionTile.displayName = 'FlashSaleEmptyStateActionTile';

const FlashSaleHeroArtwork = memo(() => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.artwork} pointerEvents="none">
            <View style={styles.sparkleTop}>
                <IconSymbol name="sparkles" size={16} color={theme.colors.warning} />
            </View>
            <View style={styles.sparkleRight}>
                <IconSymbol name="sparkles" size={13} color={theme.colors.warning} />
            </View>

            <LinearGradient
                colors={[theme.colors.warningLight, theme.colors.accentSoft]}
                style={styles.packageBack}
            />

            <LinearGradient
                colors={[theme.colors.warning, theme.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.lightningPlate}
            >
                <IconSymbol name="flash" size={54} color={theme.colors.surface} />
            </LinearGradient>

            <LinearGradient
                colors={[theme.colors.surface, theme.colors.warningLight]}
                style={styles.clockFace}
            >
                <IconSymbol name="time" size={34} color={theme.colors.warning} />
            </LinearGradient>

            <LinearGradient
                colors={[theme.colors.accent, theme.colors.warning]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.discountTag}
            >
                <Text style={styles.discountText}>%</Text>
            </LinearGradient>
        </View>
    );
});

FlashSaleHeroArtwork.displayName = 'FlashSaleHeroArtwork';

const getToneStyle = (variant: InfoCard['variant'] = 'primary') => {
    switch (variant) {
        case 'accent':
            return {
                card: stylesheet.infoCardAccent,
                iconWrap: stylesheet.infoIconAccent,
            };
        case 'success':
            return {
                card: stylesheet.infoCardSuccess,
                iconWrap: stylesheet.infoIconSuccess,
            };
        case 'primary':
        default:
            return {
                card: stylesheet.infoCardPrimary,
                iconWrap: stylesheet.infoIconPrimary,
            };
    }
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        minHeight: 54,
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderMuted,
    },
    headerIconButton: {
        width: 40,
        height: 40,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: theme.fontSizes.lg,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
    },
    content: {
        paddingHorizontal: theme.margins.smd,
        paddingTop: theme.margins.smd,
        gap: theme.margins.smd,
    },
    heroCard: {
        position: 'relative',
        overflow: 'hidden',
        padding: theme.margins.md,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        backgroundColor: theme.colors.surface,
        shadowColor: theme.colors.newPrimary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 4,
    },
    heroBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    heroTop: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 136,
        gap: theme.margins.sm,
    },
    heroCopy: {
        flex: 1,
        minWidth: 0,
        gap: theme.margins.xs,
    },
    eyebrow: {
        fontSize: theme.fontSizes.xsm,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.newPrimary,
    },
    heroTitle: {
        fontSize: theme.fontSizes.xxl,
        lineHeight: 28,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
    },
    heroDescription: {
        fontSize: theme.fontSizes.sm,
        lineHeight: 18,
        color: theme.colors.typographySecondary,
    },
    statusChip: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
        marginTop: theme.margins.xs,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: theme.margins.xs,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
    },
    statusChipText: {
        fontSize: theme.fontSizes.xs,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.typographySecondary,
    },
    artwork: {
        width: 132,
        height: 132,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sparkleTop: {
        position: 'absolute',
        top: 8,
        left: 4,
        zIndex: 5,
    },
    sparkleRight: {
        position: 'absolute',
        top: 22,
        right: 2,
        zIndex: 5,
    },
    packageBack: {
        position: 'absolute',
        right: 10,
        bottom: 16,
        width: 98,
        height: 72,
        borderRadius: theme.radius.l,
        transform: [{ rotate: '-8deg' }],
    },
    lightningPlate: {
        position: 'absolute',
        top: 8,
        right: 34,
        width: 58,
        height: 78,
        borderRadius: theme.radius.m,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '12deg' }],
        shadowColor: theme.colors.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 5,
    },
    clockFace: {
        position: 'absolute',
        left: 4,
        bottom: 12,
        width: 58,
        height: 58,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.warningLight,
        shadowColor: theme.colors.warning,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 12,
        elevation: 4,
    },
    discountTag: {
        position: 'absolute',
        right: 4,
        bottom: 18,
        width: 44,
        height: 50,
        borderRadius: theme.radius.m,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-12deg' }],
    },
    discountText: {
        color: theme.colors.onPrimary,
        fontSize: theme.fontSizes['3xl'],
        fontWeight: theme.fontWeights.bold,
    },
    ctaStack: {
        gap: theme.margins.sm,
        marginTop: theme.margins.smd,
    },
    primaryButton: {
        minHeight: 46,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.newPrimary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
        shadowColor: theme.colors.newPrimary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
        elevation: 4,
    },
    primaryButtonText: {
        color: theme.colors.onPrimary,
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.bold,
    },
    secondaryButton: {
        minHeight: 44,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.newPrimary,
        backgroundColor: theme.colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
    },
    secondaryButtonText: {
        color: theme.colors.newPrimary,
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.bold,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    sectionTitle: {
        marginTop: theme.margins.xs,
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: theme.margins.sm,
    },
    infoCardCompact: {
        flex: 1,
        minHeight: 112,
        padding: theme.margins.smd,
        alignItems: 'center',
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        backgroundColor: theme.colors.surface,
    },
    infoCard: {
        flex: 1,
        minHeight: 88,
        padding: theme.margins.smd,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        backgroundColor: theme.colors.surface,
    },
    infoCardPrimary: {
        backgroundColor: theme.colors.surface,
    },
    infoCardAccent: {
        backgroundColor: theme.colors.warningSubtle,
    },
    infoCardSuccess: {
        backgroundColor: theme.colors.successSubtle,
    },
    infoIconWrap: {
        width: 46,
        height: 46,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoIconPrimary: {
        backgroundColor: theme.colors.activeSoft,
    },
    infoIconAccent: {
        backgroundColor: theme.colors.warningLight,
    },
    infoIconSuccess: {
        backgroundColor: theme.colors.successLight,
    },
    infoCopy: {
        flex: 1,
        minWidth: 0,
        gap: theme.margins.xs,
    },
    infoTitle: {
        fontSize: theme.fontSizes.sm,
        lineHeight: 16,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
    },
    infoTitleCompact: {
        marginTop: theme.margins.sm,
        textAlign: 'center',
    },
    infoDescription: {
        fontSize: theme.fontSizes.xs,
        lineHeight: 15,
        color: theme.colors.typographySecondary,
    },
    infoDescriptionCompact: {
        marginTop: theme.margins.xs,
        textAlign: 'center',
    },
    trustGrid: {
        flexDirection: 'row',
        gap: theme.margins.sm,
    },
    actionStack: {
        gap: theme.margins.sm,
    },
    actionTile: {
        minHeight: 68,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.smd,
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.sm,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        backgroundColor: theme.colors.surface,
    },
    actionIconWrap: {
        width: 42,
        height: 42,
        borderRadius: theme.radius.m,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.warningLight,
    },
    actionCopy: {
        flex: 1,
        minWidth: 0,
    },
    actionTitle: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
    },
    actionDescription: {
        marginTop: theme.margins.xs,
        fontSize: theme.fontSizes.xs,
        color: theme.colors.typographySecondary,
    },
    pressed: {
        opacity: 0.78,
    },
}));
