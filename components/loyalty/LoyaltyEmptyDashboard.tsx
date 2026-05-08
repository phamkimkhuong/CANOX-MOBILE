/**
 * LoyaltyEmptyDashboard - Empty wallet onboarding for first-time coin users.
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { LoyaltyOverviewUI } from '@/types/loyalty/ui';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, {
    Circle,
    Defs,
    Ellipse,
    G,
    Path,
    Stop,
    LinearGradient as SvgLinearGradient
} from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface LoyaltyEmptyDashboardProps {
    overview: LoyaltyOverviewUI;
    onShopNow: () => void;
    onLearnMore: () => void;
    onReviewOrders: () => void;
    onCampaigns: () => void;
}

type IllustrationPalette = {
    accent: string;
    accentLight: string;
    warning: string;
    warningLight: string;
    warningSoft: string;
    warningSubtle: string;
    success: string;
    successSoft: string;
    surface: string;
    secondary: string;
};

const RewardBoxIllustration = memo(({ palette }: { palette: IllustrationPalette }) => (
    <Svg width={132} height={118} viewBox="0 0 132 118" fill="none">
        <Defs>
            <SvgLinearGradient id="boxFace" x1="25" y1="52" x2="103" y2="105">
                <Stop offset="0" stopColor={palette.warningSoft} />
                <Stop offset="1" stopColor={palette.accent} />
            </SvgLinearGradient>
            <SvgLinearGradient id="coinFill" x1="55" y1="28" x2="102" y2="76">
                <Stop offset="0" stopColor={palette.warningLight} />
                <Stop offset="1" stopColor={palette.warning} />
            </SvgLinearGradient>
            <SvgLinearGradient id="ribbonFill" x1="72" y1="7" x2="116" y2="44">
                <Stop offset="0" stopColor={palette.accentLight} />
                <Stop offset="1" stopColor={palette.accent} />
            </SvgLinearGradient>
        </Defs>
        <Ellipse cx="71" cy="108" rx="48" ry="9" fill={palette.warningSoft} opacity={0.9} />
        <G>
            <Path d="M30 51L71 37L110 52L70 67L30 51Z" fill={palette.warningSubtle} />
            <Path d="M30 51L70 67V106L30 89V51Z" fill="url(#boxFace)" />
            <Path d="M110 52L70 67V106L110 88V52Z" fill={palette.accent} opacity={0.8} />
            <Path d="M64 64L76 60V101L64 105V64Z" fill={palette.surface} opacity={0.85} />
            <Path d="M30 51L71 37L110 52L70 67L30 51Z" stroke={palette.accent} strokeWidth={1.5} opacity={0.8} />
        </G>
        <G>
            <Circle cx="78" cy="47" r="25" fill="url(#coinFill)" />
            <Circle cx="78" cy="47" r="19" fill="none" stroke={palette.surface} strokeWidth={4} opacity={0.75} />
            <Path
                d="M85 38C82.9 36.5 80.5 35.8 77.9 35.8C71.6 35.8 67.3 40.3 67.3 47C67.3 53.7 71.6 58.2 78 58.2C80.8 58.2 83.2 57.4 85.2 55.8"
                stroke={palette.surface}
                strokeWidth={4}
                strokeLinecap="round"
            />
            <Path d="M78 32V62" stroke={palette.surface} strokeWidth={3} strokeLinecap="round" opacity={0.75} />
        </G>
        <Path d="M86 23C92 9 104 7 111 14C117 20 113 31 100 35" fill="url(#ribbonFill)" />
        <Path d="M86 23C77 12 66 12 61 20C57 27 63 35 76 36" fill={palette.warningLight} />
        <Path d="M88 22L87 52" stroke={palette.surface} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
        <Path d="M111 15L100 35L118 32L120 18L111 15Z" fill={palette.accent} opacity={0.9} />
        <Circle cx="29" cy="30" r="3" fill={palette.warning} />
        <Circle cx="42" cy="18" r="2" fill={palette.warning} opacity={0.75} />
        <Path d="M19 46L23 50L19 54L15 50L19 46Z" fill={palette.warning} opacity={0.75} />
        <Path d="M108 73L112 77L108 81L104 77L108 73Z" fill={palette.warning} opacity={0.75} />
    </Svg>
));

RewardBoxIllustration.displayName = 'RewardBoxIllustration';

const ShopBagIllustration = memo(({ palette }: { palette: IllustrationPalette }) => (
    <Svg width={96} height={86} viewBox="0 0 96 86" fill="none">
        <Defs>
            <SvgLinearGradient id="bagFill" x1="28" y1="24" x2="70" y2="76">
                <Stop offset="0" stopColor={palette.warningSubtle} />
                <Stop offset="1" stopColor={palette.warningLight} />
            </SvgLinearGradient>
        </Defs>
        <Ellipse cx="48" cy="78" rx="32" ry="6" fill={palette.warningSoft} />
        <Path d="M24 31H72L67 76H29L24 31Z" fill="url(#bagFill)" />
        <Path d="M35 32C35 19 42 12 48 12C54 12 61 19 61 32" stroke={palette.warning} strokeWidth={5} strokeLinecap="round" />
        <Path d="M47 43L51 51L60 52L53 58L55 67L47 62L39 67L41 58L34 52L43 51L47 43Z" fill={palette.warning} />
        <Path d="M15 58C21 54 24 47 23 39C17 43 14 50 15 58Z" fill={palette.successSoft} />
        <Path d="M81 58C75 54 72 47 73 39C79 43 82 50 81 58Z" fill={palette.successSoft} />
        <Path d="M18 66C24 63 27 58 27 51C21 54 18 59 18 66Z" fill={palette.success} opacity={0.55} />
        <Path d="M78 66C72 63 69 58 69 51C75 54 78 59 78 66Z" fill={palette.success} opacity={0.55} />
        <Circle cx="24" cy="22" r="2" fill={palette.warning} />
        <Circle cx="72" cy="20" r="2" fill={palette.warning} />
        <Path d="M15 35L18 38L15 41L12 38L15 35Z" fill={palette.warning} opacity={0.75} />
    </Svg>
));

ShopBagIllustration.displayName = 'ShopBagIllustration';

const ReceiptIllustration = memo(({ palette }: { palette: IllustrationPalette }) => (
    <Svg width={92} height={82} viewBox="0 0 92 82" fill="none">
        <Defs>
            <SvgLinearGradient id="receiptFill" x1="22" y1="9" x2="57" y2="70">
                <Stop offset="0" stopColor={palette.surface} />
                <Stop offset="1" stopColor={palette.warningSubtle} />
            </SvgLinearGradient>
            <SvgLinearGradient id="smallCoinFill" x1="45" y1="45" x2="78" y2="76">
                <Stop offset="0" stopColor={palette.warningLight} />
                <Stop offset="1" stopColor={palette.warning} />
            </SvgLinearGradient>
        </Defs>
        <Ellipse cx="48" cy="75" rx="31" ry="5" fill={palette.warningSoft} />
        <Path d="M26 9H63V64L57 60L51 64L45 60L39 64L33 60L26 64V9Z" fill="url(#receiptFill)" />
        <Path d="M35 23H54" stroke={palette.secondary} strokeWidth={4} strokeLinecap="round" opacity={0.45} />
        <Path d="M35 35H57" stroke={palette.secondary} strokeWidth={4} strokeLinecap="round" opacity={0.45} />
        <Path d="M35 47H49" stroke={palette.secondary} strokeWidth={4} strokeLinecap="round" opacity={0.45} />
        <Circle cx="61" cy="59" r="18" fill="url(#smallCoinFill)" />
        <Circle cx="61" cy="59" r="12" fill="none" stroke={palette.surface} strokeWidth={3} opacity={0.75} />
        <Path d="M66 53C64.7 52.1 63 51.6 61.2 51.6C56.8 51.6 54 54.6 54 59C54 63.4 56.9 66.4 61.3 66.4C63.1 66.4 64.7 65.9 66 64.9" stroke={palette.surface} strokeWidth={3} strokeLinecap="round" />
        <Circle cx="20" cy="27" r="2" fill={palette.warning} />
        <Path d="M17 49L20 52L17 55L14 52L17 49Z" fill={palette.warning} opacity={0.75} />
    </Svg>
));

ReceiptIllustration.displayName = 'ReceiptIllustration';

export const LoyaltyEmptyDashboard: React.FC<LoyaltyEmptyDashboardProps> = memo(({
    overview,
    onShopNow,
    onLearnMore,
    onReviewOrders,
    onCampaigns,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('loyalty');
    const formattedPoints = overview.totalPoints.toLocaleString('vi-VN');
    const palette: IllustrationPalette = {
        accent: theme.colors.sunsetOrange,
        accentLight: theme.colors.activeSoft,
        warning: theme.colors.sunsetOrange,
        warningLight: theme.colors.warningLight,
        warningSoft: theme.colors.activeSoft,
        warningSubtle: theme.colors.activeSubtle,
        success: theme.colors.forestGreen,
        successSoft: theme.colors.greenSoft,
        surface: theme.colors.surface,
        secondary: theme.colors.secondary,
    };

    return (
        <Animated.View entering={FadeInDown.duration(350).delay(100)} style={styles.container}>
            <LinearGradient
                colors={[theme.colors.surface, theme.colors.activeSubtle]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceCard}
            >
                <View style={styles.balanceTextColumn}>
                    <Text style={styles.cardEyebrow}>{t('emptyDashboard.hero.label')}</Text>
                    <Text style={styles.balanceValue}>
                        {formattedPoints} <Text style={styles.balanceUnit}>{t('hero.unit')}</Text>
                    </Text>
                    <Text style={styles.balanceSub}>{t('emptyDashboard.hero.description')}</Text>
                    <View style={styles.expiryPill}>
                        <IconSymbol name="time" size={13} color={theme.colors.typographySecondary} />
                        <Text style={styles.expiryText}>{t('emptyDashboard.hero.expiryStatus')}</Text>
                    </View>
                </View>
                <View style={styles.heroIllustration}>
                    <RewardBoxIllustration palette={palette} />
                </View>
                <View style={styles.heroActions}>
                    <Pressable style={styles.primaryButton} onPress={onShopNow}>
                        <LinearGradient
                            colors={[theme.colors.accent, theme.colors.buttonActive]}
                            locations={[0, 1]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.primaryButtonFill}
                        >
                            <Text style={styles.primaryButtonText}>{t('emptyDashboard.hero.primaryAction')}</Text>
                        </LinearGradient>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={onLearnMore}>
                        <Text style={styles.secondaryButtonText}>{t('emptyDashboard.hero.secondaryAction')}</Text>
                    </Pressable>
                </View>
            </LinearGradient>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('emptyDashboard.shopPoints.title')}</Text>
                    <Text style={styles.inlineStatus}>{t('emptyDashboard.shopPoints.status')}</Text>
                </View>
                <Pressable style={styles.shopCard} onPress={onShopNow}>
                    <View style={styles.shopIllustration}>
                        <ShopBagIllustration palette={palette} />
                    </View>
                    <View style={styles.shopCopy}>
                        <Text style={styles.cardTitle}>{t('emptyDashboard.shopPoints.emptyTitle')}</Text>
                        <Text style={styles.cardDescription}>{t('emptyDashboard.shopPoints.emptyMessage')}</Text>
                        <View style={styles.cardLinkRow}>
                            <Text style={styles.cardLink}>{t('emptyDashboard.shopPoints.action')}</Text>
                            <IconSymbol name="chevron-right" size={14} color={theme.colors.sunsetOrange} />
                        </View>
                    </View>
                </Pressable>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('emptyDashboard.earn.title')}</Text>
                <View style={styles.earnGrid}>
                    <Pressable style={[styles.earnCard, styles.earnCardWarm]} onPress={onShopNow}>
                        <View style={styles.earnIconWarm}>
                            <IconSymbol name="cart" size={26} color={theme.colors.sunsetOrange} />
                        </View>
                        <Text style={styles.earnTitle}>{t('emptyDashboard.earn.purchaseTitle')}</Text>
                        <View style={styles.earnAction}>
                            <Text style={styles.earnActionText}>{t('emptyDashboard.earn.action')}</Text>
                            <IconSymbol name="chevron-right" size={12} color={theme.colors.sunsetOrange} />
                        </View>
                    </Pressable>
                    <Pressable style={[styles.earnCard, styles.earnCardCool]} onPress={onReviewOrders}>
                        <View style={styles.earnIconCool}>
                            <IconSymbol name="star" size={26} color={theme.colors.info} />
                        </View>
                        <Text style={styles.earnTitle}>{t('emptyDashboard.earn.reviewTitle')}</Text>
                        <View style={styles.earnAction}>
                            <Text style={styles.earnActionText}>{t('emptyDashboard.earn.action')}</Text>
                            <IconSymbol name="chevron-right" size={12} color={theme.colors.sunsetOrange} />
                        </View>
                    </Pressable>
                    <Pressable style={[styles.earnCard, styles.earnCardGreen]} onPress={onCampaigns}>
                        <View style={styles.earnIconGreen}>
                            <IconSymbol name="gift" size={26} color={theme.colors.forestGreen} />
                        </View>
                        <Text style={styles.earnTitle}>{t('emptyDashboard.earn.programTitle')}</Text>
                        <View style={styles.earnAction}>
                            <Text style={styles.earnActionText}>{t('emptyDashboard.earn.action')}</Text>
                            <IconSymbol name="chevron-right" size={12} color={theme.colors.sunsetOrange} />
                        </View>
                    </Pressable>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('emptyDashboard.history.title')}</Text>
                <View style={styles.historyCard}>
                    <View style={styles.historyIllustration}>
                        <ReceiptIllustration palette={palette} />
                    </View>
                    <View style={styles.historyCopy}>
                        <Text style={styles.cardTitle}>{t('emptyDashboard.history.emptyTitle')}</Text>
                        <Text style={styles.cardDescription}>{t('emptyDashboard.history.emptyMessage')}</Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
});

LoyaltyEmptyDashboard.displayName = 'LoyaltyEmptyDashboard';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
        gap: theme.margins.lg,
    },
    balanceCard: {
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.activeSoft,
        padding: theme.margins.md,
        minHeight: 208,
        overflow: 'hidden',
        shadowColor: theme.colors.buttonActive,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 2,
    },
    balanceTextColumn: {
        width: '58%',
        zIndex: 1,
    },
    cardEyebrow: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
        marginBottom: theme.margins.xs,
    },
    balanceValue: {
        fontSize: theme.fontSizes['4xl'],
        lineHeight: 40,
        fontWeight: '800',
        color: theme.colors.sunsetOrange,
    },
    balanceUnit: {
        fontSize: theme.fontSizes['2xl'],
        fontWeight: theme.fontWeights.bold,
    },
    balanceSub: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
        marginTop: theme.margins.xs,
    },
    expiryPill: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
        backgroundColor: theme.colors.activeLight,
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: theme.margins.xs,
        marginTop: theme.margins.smd,
        maxWidth: '100%',
    },
    expiryText: {
        fontSize: theme.fontSizes.xsm,
        lineHeight: 15,
        color: theme.colors.typographySecondary,
        flexShrink: 1,
    },
    heroIllustration: {
        position: 'absolute',
        top: theme.margins.sm,
        right: theme.margins.sm,
    },
    heroActions: {
        flexDirection: 'row',
        gap: theme.margins.sm,
        marginTop: theme.margins.sm,
        zIndex: 1,
    },
    primaryButton: {
        flex: 1,
        minHeight: 44,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
    },
    primaryButtonFill: {
        flex: 1,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.sm,
    },
    primaryButtonText: {
        color: theme.colors.onAccent,
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.semibold,
    },
    secondaryButton: {
        flex: 1,
        minHeight: 44,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.surfaceOverlay,
        borderWidth: 1,
        borderColor: theme.colors.sunsetOrange,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.sm,
    },
    secondaryButtonText: {
        color: theme.colors.sunsetOrange,
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.semibold,
    },
    section: {
        gap: theme.margins.smd,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.margins.sm,
    },
    sectionTitle: {
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
    },
    inlineStatus: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
        flexShrink: 1,
        textAlign: 'right',
    },
    shopCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        padding: theme.margins.md,
        minHeight: 112,
        gap: theme.margins.md,
    },
    shopIllustration: {
        width: 96,
        height: 86,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shopCopy: {
        flex: 1,
        gap: theme.margins.xs,
    },
    cardTitle: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
    },
    cardDescription: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },
    cardLinkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
        marginTop: theme.margins.xs,
    },
    cardLink: {
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.sunsetOrange,
    },
    earnGrid: {
        flexDirection: 'row',
        gap: theme.margins.sm,
    },
    earnCard: {
        flex: 1,
        minHeight: 112,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        padding: theme.margins.sm,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.xs,
    },
    earnCardWarm: {
        backgroundColor: theme.colors.activeSubtle,
        borderColor: theme.colors.activeLight,
    },
    earnCardCool: {
        backgroundColor: theme.colors.infoSubtle,
        borderColor: theme.colors.infoLight,
    },
    earnCardGreen: {
        backgroundColor: theme.colors.successSubtle,
        borderColor: theme.colors.successLight,
    },
    earnIconWarm: {
        width: 46,
        height: 46,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.activeLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    earnIconCool: {
        width: 46,
        height: 46,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.infoLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    earnIconGreen: {
        width: 46,
        height: 46,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.successLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    earnTitle: {
        fontSize: theme.fontSizes.sm,
        lineHeight: 16,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
        textAlign: 'center',
    },
    earnAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    earnActionText: {
        fontSize: theme.fontSizes.xsm,
        color: theme.colors.typography,
        fontWeight: theme.fontWeights.medium,
    },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        padding: theme.margins.md,
        minHeight: 112,
        gap: theme.margins.md,
    },
    historyIllustration: {
        width: 92,
        height: 82,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyCopy: {
        flex: 1,
        gap: theme.margins.xs,
    },
}));
