import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { Navigator } from '@/utils/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { cleanAndFlattenStyles } from '@/utils/style';

interface GuestStateProps {
    onLogin?: () => void;
    onRegister?: () => void;
}

interface SignalPillProps {
    key: string;
    icon: React.ComponentProps<typeof IconSymbol>['name'];
    label: string;
}

/**
 * Guest state shown on Profile tab before authentication.
 * The layout is intentionally richer than a simple empty state because
 * this screen is both identity entry-point and conversion surface.
 */
export const GuestState: React.FC<GuestStateProps> = memo(({ onLogin, onRegister }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('profile');

    const handleLogin = useCallback(() => {
        if (onLogin) {
            onLogin();
            return;
        }
        Navigator.push(ROUTES.AUTH.LOGIN);
    }, [onLogin]);

    const handleRegister = useCallback(() => {
        if (onRegister) {
            onRegister();
            return;
        }
        Navigator.push(ROUTES.AUTH.REGISTER);
    }, [onRegister]);

    const signalItems = useMemo<SignalPillProps[]>(() => ([
        {
            key: 'orders',
            icon: 'receipt',
            label: t('guestState.capabilities.orders'),
        },
        {
            key: 'address',
            icon: 'location-outline',
            label: t('guestState.capabilities.address'),
        },
        {
            key: 'coins',
            icon: 'coin',
            label: t('guestState.capabilities.coins'),
        },
        {
            key: 'vouchers',
            icon: 'ticket',
            label: t('guestState.capabilities.vouchers'),
        },
    ]), [t]);

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <Animated.View entering={FadeIn.duration(500)}>
                <View style={styles.heroSection}>
                    <LinearGradient
                        colors={[theme.colors.header.background, theme.colors.header.background, theme.colors.header.background]}
                        locations={[0, 0.45, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroBackdrop}
                    />
                    <View style={styles.heroGlowPrimary} />
                    <View style={styles.heroGlowSecondary} />

                    <View style={styles.heroBadge}>
                        <IconSymbol name="verified-user" size={14} color={theme.colors.vibrantRed} />
                        <Text style={styles.heroBadgeText}>{t('guestState.eyebrow')}</Text>
                    </View>

                    <View style={styles.illustrationContainer}>
                        <View style={styles.iconHaloOuter}>
                            <View style={styles.iconHaloMiddle}>
                                <View style={styles.iconCircle}>
                                    <IconSymbol name="person-filled" size={52} color={theme.colors.buttonActive} />
                                </View>
                            </View>
                        </View>

                        <View style={styles.decorCircleSuccess} />
                        <View style={styles.decorCircleWarning} />
                        <View style={styles.decorCircleInfo} />
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>{t('guestState.title')}</Text>
                        <Text style={styles.subtitle}>{t('guestState.subtitle')}</Text>
                        <Text style={styles.helperText}>{t('guestState.helper')}</Text>
                        <View style={styles.signalRow}>
                            {signalItems.map((item) => (
                                <SignalPill
                                    key={item.key}
                                    icon={item.icon}
                                    label={item.label}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(100)} style={cleanAndFlattenStyles(styles.actions)}>
                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.88}>
                    <Text style={styles.loginBtnText}>{t('guestState.login')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.75}>
                    <Text style={styles.registerBtnText}>{t('guestState.register')}</Text>
                </TouchableOpacity>
            </Animated.View>
        </ScrollView>
    );
});

GuestState.displayName = 'GuestState';

interface SignalPillViewProps {
    icon: React.ComponentProps<typeof IconSymbol>['name'];
    label: string;
}

const SignalPill: React.FC<SignalPillViewProps> = memo(({ icon, label }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.signalPill}>
            <IconSymbol name={icon} size={15} color={theme.colors.buttonActive} />
            <Text style={styles.signalText}>{label}</Text>
        </View>
    );
});

SignalPill.displayName = 'SignalPill';

const stylesheet = StyleSheet.create((theme) => ({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.xs,
    },
    heroSection: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
        overflow: 'hidden',
    },
    heroBackdrop: {
        position: 'absolute',
        top: 0,
        left: -theme.margins.lg,
        right: -theme.margins.lg,
        height: 220,
        borderBottomLeftRadius: 44,
        borderBottomRightRadius: 44,
        opacity: 0.08,
    },
    heroGlowPrimary: {
        position: 'absolute',
        top: -54,
        right: -34,
        width: 170,
        height: 170,
        borderRadius: 90,
        backgroundColor: theme.colors.activeSoft,
    },
    heroGlowSecondary: {
        position: 'absolute',
        top: 34,
        left: -42,
        width: 132,
        height: 132,
        borderRadius: 75,
        backgroundColor: theme.colors.accentSoft,
    },
    heroBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        backgroundColor: theme.colors.surfaceTranslucent,
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.margins.smd,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: theme.colors.redSoft,
    },
    heroBadgeText: {
        fontSize: theme.fontSizes.sm,
        fontWeight: '700',
        letterSpacing: 0.2,
        color: theme.colors.vibrantRed,
    },
    illustrationContainer: {
        position: 'relative',
        alignSelf: 'center',
        marginTop: theme.margins.xl,
        marginBottom: theme.margins.lg,
    },
    iconHaloOuter: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: theme.colors.surfaceGlassOverlay,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderGlass,
    },
    iconHaloMiddle: {
        width: 100,
        height: 100,
        borderRadius: 52,
        backgroundColor: theme.colors.redSoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.newPrimary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 12,
        elevation: 4,
    },
    decorCircleSuccess: {
        position: 'absolute',
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: theme.colors.success,
        top: 8,
        right: 6,
    },
    decorCircleWarning: {
        position: 'absolute',
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: theme.colors.warning,
        bottom: 12,
        left: 2,
    },
    decorCircleInfo: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: theme.colors.primary,
        top: 34,
        left: -8,
    },
    content: {
        alignItems: 'center',
        marginBottom: theme.margins.smd,
    },
    title: {
        fontSize: theme.fontSizes['3xl'],
        fontWeight: '800',
        color: theme.colors.typography,
        textAlign: 'center',
        lineHeight: 34,
        marginBottom: theme.margins.smd,
        letterSpacing: -0.7,
    },
    subtitle: {
        fontSize: theme.fontSizes.mdbase,
        color: theme.colors.typography,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: theme.margins.md,
        fontWeight: '600',
    },
    helperText: {
        marginTop: theme.margins.smd,
        fontSize: theme.fontSizes.sm,
        lineHeight: 20,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    actions: {
        width: '100%',
        gap: theme.margins.sm,
        marginBottom: theme.margins.xl,
    },
    loginBtn: {
        width: '100%',
        height: 50,
        borderRadius: theme.radius.l,
        backgroundColor: theme.colors.buttonActive,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.buttonActive,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
        elevation: 4,
    },
    loginBtnText: {
        fontSize: theme.fontSizes.md,
        fontWeight: '800',
        letterSpacing: -0.2,
        color: theme.colors.onPrimary,
    },
    registerBtn: {
        width: '100%',
        height: 48,
        borderRadius: theme.radius.l,
        backgroundColor: 'transparent',
        borderWidth: 1.25,
        borderColor: theme.colors.buttonActive,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerBtnText: {
        fontSize: theme.fontSizes.md,
        fontWeight: '700',
        color: theme.colors.buttonActive,
    },
    signalRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: theme.margins.sm,
        alignItems: 'stretch',
        marginTop: theme.margins.lg,
    },
    signalPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.surfaceTranslucent,
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.margins.smd,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: theme.colors.redSoft,
        minHeight: 38,
    },
    signalText: {
        fontSize: theme.fontSizes.sm,
        fontWeight: '600',
        color: theme.colors.typography,
    },
}));
