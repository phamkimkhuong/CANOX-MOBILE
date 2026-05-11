import { IconSymbol } from '@/components/ui/Icon';
import {
    SkeletonBox,
    SkeletonCircle,
    SkeletonText,
    useShimmerAnimation,
} from '@/components/ui/feedback/Skeleton';
import { WishlistHeroArtwork } from '@/components/wishlist/WishlistHeroArtwork';
import { ROUTES } from '@/constants/routes';
import { Navigator } from '@/utils/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface WishlistEmptyStateProps {
    isRefetching?: boolean;
    onRefresh?: () => void;
}

interface BenefitCardProps {
    tone: 'red' | 'green' | 'amber';
    icon: React.ComponentProps<typeof IconSymbol>['name'];
    title: string;
    subtitle: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ tone, icon, title, subtitle }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const toneStyle = {
        red: {
            card: styles.benefitCardRed,
            iconWrap: styles.benefitIconRed,
            color: theme.colors.newPrimary,
        },
        green: {
            card: styles.benefitCardGreen,
            iconWrap: styles.benefitIconGreen,
            color: theme.colors.forestGreen,
        },
        amber: {
            card: styles.benefitCardAmber,
            iconWrap: styles.benefitIconAmber,
            color: theme.colors.warning,
        },
    }[tone];

    return (
        <View style={[styles.benefitCard, toneStyle.card]}>
            <View style={styles.benefitDots}>
                <View style={styles.dotSmall} />
                <View style={styles.dotTiny} />
            </View>
            <View style={[styles.benefitIconWrap, toneStyle.iconWrap]}>
                <IconSymbol name={icon} size={28} color={toneStyle.color} />
            </View>
            <Text style={styles.benefitTitle} numberOfLines={2}>
                {title}
            </Text>
            <Text style={styles.benefitSubtitle} numberOfLines={3}>
                {subtitle}
            </Text>
        </View>
    );
};

export const WishlistEmptyState: React.FC<WishlistEmptyStateProps> = ({
    isRefetching = false,
    onRefresh,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('wishlist');
    const styles = stylesheet;

    const handleExplore = useCallback(() => {
        Navigator.push(ROUTES.TABS.HOME);
    }, []);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.newPrimary}
                        colors={[theme.colors.newPrimary]}
                    />
                ) : undefined
            }
        >
            <WishlistHeroArtwork variant="empty" />

            <View style={styles.copyBlock}>
                <Text style={styles.title}>
                    {t('emptyState.title')}
                </Text>
                <Text style={styles.subtitle}>
                    {t('emptyState.subtitlePrefix')}{' '}
                    <Text style={styles.subtitleHeart}>♥</Text>
                    {' '}{t('emptyState.subtitleSuffix')}
                </Text>
                <Text style={styles.subtitle}>
                    {t('emptyState.subtitleTracking')}
                </Text>
            </View>

            <View style={styles.actions}>
                <Pressable
                    onPress={handleExplore}
                    style={({ pressed }) => [styles.primaryButtonPressable, pressed && styles.buttonPressed]}
                >
                    <LinearGradient
                        colors={[theme.colors.newPrimary, theme.colors.vibrantRed]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.primaryButton}
                    >
                        <Text style={styles.primaryButtonText}>
                            {t('emptyState.primaryCta')}
                        </Text>
                        <IconSymbol name="chevron-right" size={24} color={theme.colors.onPrimary} />
                    </LinearGradient>
                </Pressable>

            </View>

            <Text style={styles.sectionTitle}>{t('emptyState.benefitsTitle')}</Text>

            <View style={styles.benefitsRow}>
                <BenefitCard
                    tone="red"
                    icon="shopping-bag"
                    title={t('emptyState.saveTitle')}
                    subtitle={t('emptyState.saveSubtitle')}
                />
                <BenefitCard
                    tone="green"
                    icon="trending-up-outline"
                    title={t('emptyState.trackTitle')}
                    subtitle={t('emptyState.trackSubtitle')}
                />
                <BenefitCard
                    tone="amber"
                    icon="notifications-filled"
                    title={t('emptyState.notifyTitle')}
                    subtitle={t('emptyState.notifySubtitle')}
                />
            </View>

        </ScrollView>
    );
};

export const WishlistEmptyStateSkeleton: React.FC = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const shimmerStyle = useShimmerAnimation();

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            pointerEvents="none"
        >
            <View style={styles.skeletonHero}>
                <SkeletonCircle
                    size={118}
                    animatedStyle={shimmerStyle}
                    style={styles.skeletonHeroHeart}
                />
                <SkeletonBox
                    width={62}
                    height={80}
                    borderRadius={theme.radius.m}
                    animatedStyle={shimmerStyle}
                    style={styles.skeletonHeroTag}
                />
                <SkeletonCircle
                    size={82}
                    animatedStyle={shimmerStyle}
                    style={styles.skeletonHeroBell}
                />
            </View>

            <View style={styles.skeletonCopyBlock}>
                <SkeletonText width="78%" height={26} animatedStyle={shimmerStyle} />
                <SkeletonText width="72%" height={16} animatedStyle={shimmerStyle} />
                <SkeletonText width="64%" height={16} animatedStyle={shimmerStyle} />
            </View>

            <View style={styles.actions}>
                <SkeletonBox
                    width="100%"
                    height={50}
                    borderRadius={theme.radius.full}
                    animatedStyle={shimmerStyle}
                />
            </View>

            <SkeletonBox
                width={160}
                height={24}
                borderRadius={theme.radius.s}
                animatedStyle={shimmerStyle}
                style={styles.skeletonSectionTitle}
            />

            <View style={styles.benefitsRow}>
                {Array.from({ length: 3 }).map((_, index) => (
                    <View key={index} style={styles.skeletonBenefitCard}>
                        <SkeletonCircle size={58} animatedStyle={shimmerStyle} />
                        <SkeletonText
                            width="76%"
                            height={18}
                            animatedStyle={shimmerStyle}
                            style={styles.skeletonBenefitTitle}
                        />
                        <SkeletonText width="88%" height={13} animatedStyle={shimmerStyle} />
                        <SkeletonText
                            width="68%"
                            height={13}
                            animatedStyle={shimmerStyle}
                            style={styles.skeletonBenefitLine}
                        />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    content: {
        paddingHorizontal: theme.margins.lg,
        paddingTop: theme.margins.md,
        paddingBottom: theme.margins.xxl,
    },
    copyBlock: {
        alignItems: 'center',
        marginTop: -theme.margins.sm,
    },
    title: {
        fontSize: theme.fontSizes['2xl'],
        fontWeight: '800',
        color: theme.colors.inkBlack,
        textAlign: 'center',
        marginBottom: theme.margins.smd,
    },
    subtitle: {
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 25,
    },
    subtitleHeart: {
        color: theme.colors.newPrimary,
        fontWeight: '800',
    },
    actions: {
        marginTop: theme.margins.md,
        gap: theme.margins.sm,
        paddingHorizontal: theme.margins.xxl,
    },
    primaryButtonPressable: {
        borderRadius: theme.radius.full,
        ...theme.shadows.medium,
    },
    primaryButton: {
        minHeight: 50,
        borderRadius: theme.radius.full,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
    },
    primaryButtonText: {
        fontSize: theme.fontSizes.base,
        color: theme.colors.onPrimary,
        fontWeight: '800',
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    sectionTitle: {
        fontSize: theme.fontSizes.xl,
        fontWeight: '800',
        color: theme.colors.inkBlack,
        marginTop: theme.margins.md,
        marginBottom: theme.margins.md,
    },
    benefitsRow: {
        flexDirection: 'row',
        gap: theme.margins.sm,
    },
    benefitCard: {
        flex: 1,
        minHeight: 168,
        borderRadius: theme.radius.xl,
        paddingHorizontal: theme.margins.smd,
        paddingTop: theme.margins.smd,
        paddingBottom: theme.margins.md,
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
    },
    benefitCardRed: {
        backgroundColor: theme.colors.activeSubtle,
        borderColor: theme.colors.activeLight,
    },
    benefitCardGreen: {
        backgroundColor: theme.colors.greenSoft,
        borderColor: theme.colors.successLight,
    },
    benefitCardAmber: {
        backgroundColor: theme.colors.warningSubtle,
        borderColor: theme.colors.warningLight,
    },
    benefitDots: {
        position: 'absolute',
        top: 24,
        right: 18,
        gap: theme.margins.xs,
    },
    dotSmall: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: theme.colors.warning,
        opacity: 0.35,
    },
    dotTiny: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: theme.colors.warning,
        opacity: 0.35,
    },
    benefitIconWrap: {
        width: 58,
        height: 58,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        marginBottom: theme.margins.smd,
        ...theme.shadows.small,
    },
    benefitIconRed: {
        borderColor: theme.colors.activeLight,
    },
    benefitIconGreen: {
        borderColor: theme.colors.successLight,
    },
    benefitIconAmber: {
        borderColor: theme.colors.warningLight,
    },
    benefitTitle: {
        fontSize: theme.fontSizes.sm,
        lineHeight: 18,
        fontWeight: '800',
        color: theme.colors.inkBlack,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },
    benefitSubtitle: {
        fontSize: theme.fontSizes.xsm,
        lineHeight: 17,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    skeletonHero: {
        height: 145,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.margins.xs,
    },
    skeletonHeroHeart: {
        transform: [{ translateY: 8 }],
    },
    skeletonHeroTag: {
        position: 'absolute',
        left: '22%',
        bottom: 52,
        transform: [{ rotate: '16deg' }],
    },
    skeletonHeroBell: {
        position: 'absolute',
        right: '20%',
        bottom: 58,
    },
    skeletonCopyBlock: {
        alignItems: 'center',
        gap: theme.margins.sm,
        marginTop: -theme.margins.sm,
    },
    skeletonSectionTitle: {
        marginTop: theme.margins.md,
        marginBottom: theme.margins.md,
    },
    skeletonBenefitCard: {
        flex: 1,
        minHeight: 168,
        borderRadius: theme.radius.xl,
        paddingHorizontal: theme.margins.smd,
        paddingTop: theme.margins.smd,
        paddingBottom: theme.margins.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        backgroundColor: theme.colors.surface,
    },
    skeletonBenefitTitle: {
        marginTop: theme.margins.smd,
        marginBottom: theme.margins.sm,
    },
    skeletonBenefitLine: {
        marginTop: theme.margins.xs,
    },
}));
