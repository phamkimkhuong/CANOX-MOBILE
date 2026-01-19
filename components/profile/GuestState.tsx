import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { Navigator } from '@/utils/navigation';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface GuestStateProps {
    onLogin?: () => void;
    onRegister?: () => void;
}

/**
 * Guest state view shown when user is not authenticated
 */
export const GuestState: React.FC<GuestStateProps> = memo(({ onLogin, onRegister }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('profile');

    const handleLogin = useCallback(() => {
        if (onLogin) {
            onLogin();
        } else {
            Navigator.push(ROUTES.AUTH.LOGIN);
        }
    }, [onLogin]);

    const handleRegister = useCallback(() => {
        if (onRegister) {
            onRegister();
        } else {
            Navigator.push(ROUTES.AUTH.REGISTER);
        }
    }, [onRegister]);

    return (
        <View style={styles.container}>
            {/* Illustration */}
            <Animated.View
                entering={FadeIn.duration(600)}
                style={styles.illustrationContainer}
            >
                <View style={styles.iconCircle}>
                    <IconSymbol name="person" size={64} color={theme.colors.primary} />
                </View>
                <View style={styles.decorCircle1} />
                <View style={styles.decorCircle2} />
            </Animated.View>

            {/* Content */}
            <Animated.View
                entering={FadeInDown.duration(600).delay(200)}
                style={styles.content}
            >
                <Text style={styles.title}>{t('guestState.title')}</Text>
                <Text style={styles.subtitle}>
                    {t('guestState.subtitle')}
                </Text>
            </Animated.View>

            {/* Actions */}
            <Animated.View
                entering={FadeInDown.duration(600).delay(400)}
                style={styles.actions}
            >
                <TouchableOpacity
                    style={styles.loginBtn}
                    onPress={handleLogin}
                    activeOpacity={0.85}
                >
                    <Text style={styles.loginBtnText}>{t('guestState.login')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.registerBtn}
                    onPress={handleRegister}
                    activeOpacity={0.7}
                >
                    <Text style={styles.registerBtnText}>{t('guestState.register')}</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Benefits */}
            <Animated.View
                entering={FadeInDown.duration(600).delay(600)}
                style={styles.benefits}
            >
                <Text style={styles.benefitsTitle}>{t('guestState.benefitsTitle')}</Text>
                <View style={styles.benefitsList}>
                    <BenefitItem icon="percent" text={t('guestState.benefits.exclusive')} />
                    <BenefitItem icon="shipping" text={t('guestState.benefits.shipping')} />
                    <BenefitItem icon="sparkles" text={t('guestState.benefits.coins')} />
                </View>
            </Animated.View>
        </View>
    );
});

GuestState.displayName = 'GuestState';

/**
 * Single benefit item
 */
const BenefitItem: React.FC<{ icon: string; text: string }> = memo(
    ({ icon, text }) => {
        const { theme } = useUnistyles();
        const styles = stylesheet;

        return (
            <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                    <IconSymbol name={icon as any} size={16} color={theme.colors.primary} />
                </View>
                <Text style={styles.benefitText}>{text}</Text>
            </View>
        );
    }
);

BenefitItem.displayName = 'BenefitItem';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        paddingHorizontal: theme.margins.lg,
        paddingTop: 60,
        alignItems: 'center',
    },
    illustrationContainer: {
        position: 'relative',
        marginBottom: 32,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    decorCircle1: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: theme.colors.success,
        top: 10,
        right: -10,
    },
    decorCircle2: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.warning,
        bottom: 20,
        left: -15,
    },
    content: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: theme.margins.lg,
    },
    actions: {
        width: '100%',
        gap: theme.margins.md,
        marginBottom: 40,
    },
    loginBtn: {
        width: '100%',
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 4,
    },
    loginBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.onPrimary,
    },
    registerBtn: {
        width: '100%',
        height: 52,
        borderRadius: 26,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    benefits: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    benefitsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.md,
    },
    benefitsList: {
        gap: theme.margins.md,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.md,
    },
    benefitIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    benefitText: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
}));
