/**
 * ==============================================
 * RESET PASSWORD SCREEN
 * ==============================================
 * 
 * Flow:
 * 1. User comes here after verifying OTP from forgot-password flow
 * 2. Receives email and resetToken as params
 * 3. User enters new password + confirm
 * 4. Submit to reset password API
 * 5. Navigate to login on success
 */

import { AuthInput } from '@/components/auth/AuthInput';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { useResetPassword } from '@/hooks/api/useAuth';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { PasswordGroupSchema } from '@/types/auth';
import { Navigator } from '@/utils/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { z } from 'zod';

// Schema Validation
const resetPasswordSchema = PasswordGroupSchema;

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { theme } = useUnistyles();
    const { t } = useTranslation('auth');
    const styles = stylesheet;

    // Get params from navigation
    const params = useLocalSearchParams<{ email: string; resetToken: string }>();
    const email = params.email;
    const resetToken = params.resetToken;

    const { control, handleSubmit } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    // API Hook
    const { mutateAsync: resetPassword, isPending: isSubmitting } = useResetPassword();

    // Redirect if missing params
    useEffect(() => {
        if (!email || !resetToken) {
            Toast.show({
                type: 'error',
                text1: t('resetPassword.missingInfoToast'),
                text2: t('resetPassword.missingInfoDetail'),
            });
            Navigator.replace(ROUTES.AUTH.FORGOT_PASSWORD);
        }
    }, [email, resetToken, t]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!email || !resetToken) return;

        try {
            await resetPassword({
                email,
                resetToken,
                password: data.password,
                confirmPassword: data.confirmPassword,
            });

            Toast.show({
                type: 'success',
                text1: t('resetPassword.successToast'),
                text2: t('resetPassword.successToastDetail'),
            });

            // Navigate to login
            Navigator.replace(ROUTES.AUTH.LOGIN);
        } catch (error: unknown) {
            // Use centralized error handling architecture
            // Code 2500, 2514 = OTP Expired (defined in constants/errorCodes.ts)
            const apiError = error as { code?: number; message?: string };
            const isOtpExpired = apiError?.code === 2500 || apiError?.code === 2514;

            if (isOtpExpired) {
                Toast.show({
                    type: 'error',
                    text1: apiError.message || t('resetPassword.errorToast'),
                    text2: t('resetPassword.missingInfoDetail'),
                });
                Navigator.replace(ROUTES.AUTH.FORGOT_PASSWORD);
            } else {
                Toast.show({
                    type: 'error',
                    text1: t('resetPassword.errorToast'),
                    text2: apiError?.message || t('resetPassword.errorToastDetail'),
                });
            }
        }
    };

    // Handle back - go to forgot password (not back in history)
    const handleBack = () => {
        Navigator.replace(ROUTES.AUTH.FORGOT_PASSWORD);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex1}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{t('resetPassword.headerTitle')}</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <View style={styles.iconCircle}>
                            <IconSymbol name="lock-closed" size={32} color={theme.colors.buttonActive} />
                        </View>
                        <Text style={styles.title}>{t('resetPassword.title')}</Text>
                        <Text style={styles.subtitle}>{t('resetPassword.subtitle')}</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        {/* New Password */}
                        <AuthInput
                            control={control}
                            name="password"
                            label={t('resetPassword.passwordLabel')}
                            placeholder={t('resetPassword.passwordPlaceholder')}
                            icon="lock-closed-outline"
                            isPassword
                            autoCapitalize="none"
                        />

                        {/* Confirm Password */}
                        <AuthInput
                            control={control}
                            name="confirmPassword"
                            label={t('resetPassword.confirmPasswordLabel')}
                            placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                            icon="lock-closed-outline"
                            isPassword
                            autoCapitalize="none"
                        />

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            activeOpacity={0.8}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={theme.colors.onPrimary} />
                            ) : (
                                <Text style={styles.submitButtonText}>{t('resetPassword.submitButton')}</Text>
                            )}
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
        paddingHorizontal: theme.margins.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    headerSpacer: {
        width: 40,
    },
    welcomeSection: {
        alignItems: 'center',
        marginTop: theme.margins.xl,
        marginBottom: theme.margins.xl,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.colors.activeSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.md,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    formSection: {
        gap: theme.margins.lg,
    },
    submitButton: {
        backgroundColor: theme.colors.buttonActive,
        height: 50,
        borderRadius: theme.radius.m,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.margins.md,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: theme.colors.onPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
}));
