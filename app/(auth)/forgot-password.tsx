import { AuthInput } from '@/components/auth/AuthInput';
import { IconSymbol } from '@/components/ui/Icon';
import { authRoutes, ROUTES } from '@/constants/routes';
import { useForgotPassword } from '@/hooks/api/useAuth';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { Navigator } from '@/utils/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { z } from 'zod';

type ForgotPasswordFormData = {
    email: string;
};

export default function ForgotPasswordScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { theme } = useUnistyles();

    const { t } = useTranslation('auth');
    const styles = stylesheet;

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Schema Validation with i18n
    const forgotPasswordSchema = useMemo(() => z.object({
        email: z.string()
            .min(1, t('validation.emailRequired'))
            .email(t('validation.emailInvalid')),
    }), [t]);

    const { control, handleSubmit, setError } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    // API Hooks
    const { mutateAsync: sendForgotPassword } = useForgotPassword();

    const onSubmit = async (data: ForgotPasswordFormData) => {
        const email = data.email.trim().toLowerCase();
        setIsSubmitting(true);

        try {
            // Send forgot password OTP directly
            await sendForgotPassword(email);

            // Success - Navigate to OTP screen
            Toast.show({
                type: 'success',
                text1: t('forgotPassword.successToast'),
                text2: t('forgotPassword.successToastDetail'),
            });

            // Navigate to verify OTP with forgot-password type
            router.push(authRoutes.verifyOtp({
                email,
                type: 'forgot-password',
            }));

        } catch (error: unknown) {
            const apiError = error as { code?: number; message?: string };
            if (apiError?.code === 1001) {
                setError('email', {
                    type: 'manual',
                    message: apiError.message || '',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: t('forgotPassword.errorToast'),
                    text2: apiError?.message || t('forgotPassword.errorToastDetail'),
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getButtonText = () => {
        return isSubmitting ? t('forgotPassword.sendingButton') : t('forgotPassword.sendButton');
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex1}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => router.canGoBack() ? Navigator.back() : Navigator.replace(ROUTES.AUTH.LOGIN)}
                            accessibilityLabel={t('forgotPassword.loginLink')}
                        >
                            <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{t('forgotPassword.headerTitle')}</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <View style={styles.iconCircle}>
                            <IconSymbol name="lock" size={32} color={theme.colors.buttonActive} />
                        </View>
                        <Text style={styles.welcomeTitle}>{t('forgotPassword.title')}</Text>
                        <Text style={styles.welcomeSubtitle}>
                            {t('forgotPassword.subtitle')}
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>
                        <AuthInput
                            control={control}
                            name="email"
                            label={t('forgotPassword.emailLabel')}
                            icon="mail"
                            placeholder={t('forgotPassword.emailPlaceholder')}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            editable={!isSubmitting}
                        />

                        {/* Info Box */}
                        <View style={styles.infoBox}>
                            <IconSymbol name="info" size={20} color={theme.colors.buttonActive} />
                            <Text style={styles.infoText}>
                                {t('forgotPassword.infoBox')}
                            </Text>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            accessibilityLabel={t('forgotPassword.sendButton')}
                        >
                            {isSubmitting ? (
                                <View style={styles.loadingRow}>
                                    <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                                    <Text style={styles.submitBtnText}>{getButtonText()}</Text>
                                </View>
                            ) : (
                                <Text style={styles.submitBtnText}>{getButtonText()}</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{t('forgotPassword.rememberedPassword')}</Text>
                        <TouchableOpacity onPress={() => Navigator.replace(ROUTES.AUTH.LOGIN)}>
                            <Text style={styles.footerLink}>{t('forgotPassword.loginLink')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    flex1: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: theme.margins.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingVertical: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surfaceTranslucent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    headerSpacer: {
        width: 40,
    },
    welcomeSection: {
        alignItems: 'center',
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.lg,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.activeSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.md,
    },
    welcomeTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },
    welcomeSubtitle: {
        fontSize: 15,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    card: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.margins.md,
        borderRadius: theme.radius.l + 8,
        padding: theme.margins.lg,
        shadowColor: theme.colors.typography,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: `${theme.colors.buttonActive}10`,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
        marginBottom: theme.margins.lg,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.typographySecondary,
        lineHeight: 20,
    },
    submitBtn: {
        backgroundColor: theme.colors.buttonActive,
        height: 50,
        borderRadius: theme.radius.full,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.buttonActive,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: theme.colors.onPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.margins.xl,
        marginBottom: theme.margins.sm,
    },
    footerText: {
        color: theme.colors.typographySecondary,
        fontSize: 14,
    },
    footerLink: {
        color: theme.colors.buttonActive,
        fontWeight: 'bold',
        fontSize: 14,
    },
}));
