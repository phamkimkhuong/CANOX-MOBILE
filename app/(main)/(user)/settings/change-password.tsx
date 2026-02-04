import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { isWrongOldPasswordError, useChangePassword } from '@/hooks/api/profile/useChangePassword';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { ChangePasswordRequestSchema } from '@/types/auth';
import { Navigator } from '@/utils/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { z } from 'zod';

/**
 * ==============================================
 * ChangePasswordScreen
 * ==============================================
 * 
 * @see register.tsx cho password validation rules
 */

type ChangePasswordFormData = z.infer<typeof ChangePasswordRequestSchema>;

export default function ChangePasswordScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { theme } = useUnistyles();

    const styles = stylesheet;
    const insets = useSafeAreaInsets();
    const { t } = useTranslation(['profile', 'common', 'auth']);

    // State
    const [isSuccess, setIsSuccess] = useState(false);

    // Mutation hook
    const { mutate: changePassword, isPending } = useChangePassword();

    // Form setup với Zod resolver
    const {
        control,
        handleSubmit,
        watch,
        setError,
        setFocus,
        formState: { isSubmitting }
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(ChangePasswordRequestSchema),
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        mode: 'onChange', // Enable realtime validation
    });

    // Watch new password for strength indicator
    const newPassword = watch('newPassword');

    /**
     * Handle form submission
     * Gọi API và xử lý response/error
     */
    const onSubmit = useCallback((data: ChangePasswordFormData) => {
        changePassword(
            {
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            },
            {
                onSuccess: () => {
                    setIsSuccess(true);
                    Toast.show({
                        type: 'success',
                        text1: t('profile:changePassword.successToast'),
                        text2: t('profile:changePassword.successToastDetail'),
                        visibilityTime: 3000,
                    });
                    // Delay navigation để user thấy success state
                    setTimeout(() => {
                        Navigator.back();
                    }, 1500);
                },
                onError: (error: unknown) => {
                    if (isWrongOldPasswordError(error)) {
                        setError('oldPassword', {
                            type: 'manual',
                            message: t('profile:changePassword.errorWrongPassword'),
                        });
                        setFocus('oldPassword');
                    } else {
                        const apiError = error as { message?: string };
                        Toast.show({
                            type: 'error',
                            text1: t('profile:changePassword.errorToast'),
                            text2: apiError.message || t('common:status.error'),
                            visibilityTime: 3000,
                        });
                    }
                },
            }
        );
    }, [changePassword, setError, setFocus, t]);

    /**
     * Handle back navigation
     */
    const handleGoBack = useCallback(() => {
        if (router.canGoBack()) {
            Navigator.back();
        } else {
            Navigator.replace(ROUTES.SETTINGS.INDEX);
        }
    }, []);

    // Success state UI
    if (isSuccess) {
        return (
            <View style={[styles.container, styles.successContainer]}>
                <View style={styles.successIconCircle}>
                    <IconSymbol name="check-circle" size={48} color={theme.colors.success} />
                </View>
                <Text style={styles.successTitle}>{t('profile:changePassword.successTitle')}</Text>
                <Text style={styles.successSubtitle}>
                    {t('profile:changePassword.successSubtitle')}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={handleGoBack}
                    activeOpacity={0.7}
                >
                    <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile:changePassword.title')}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex1}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Icon Section */}
                    <View style={styles.iconSection}>
                        <View style={styles.iconCircle}>
                            <IconSymbol name="lock-reset" size={36} color={theme.colors.buttonActive} />
                        </View>
                        <Text style={styles.sectionTitle}>{t('profile:changePassword.subtitle')}</Text>
                        <Text style={styles.sectionSubtitle}>
                            {t('profile:changePassword.description')}
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>
                        {/* Current Password */}
                        <AuthInput
                            control={control}
                            name="oldPassword"
                            label={t('profile:changePassword.currentPassword')}
                            placeholder={t('profile:changePassword.currentPasswordPlaceholder')}
                            icon="lock"
                            isPassword
                        />

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>{t('profile:changePassword.newPassword')}</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* New Password */}
                        <AuthInput
                            control={control}
                            name="newPassword"
                            label={t('profile:changePassword.newPassword')}
                            placeholder={t('profile:changePassword.newPasswordPlaceholder')}
                            icon="lock-reset"
                            isPassword
                        />

                        {/* Password Strength Indicator */}
                        {newPassword.length > 0 && (
                            <PasswordStrengthIndicator password={newPassword} />
                        )}

                        {/* Confirm New Password */}
                        <AuthInput
                            control={control}
                            name="confirmPassword"
                            label={t('profile:changePassword.confirmPassword')}
                            placeholder={t('profile:changePassword.confirmPasswordPlaceholder')}
                            icon="verified-user"
                            isPassword
                        />

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                (isSubmitting || isPending) && styles.submitBtnDisabled
                            ]}
                            disabled={isSubmitting || isPending}
                            onPress={handleSubmit(onSubmit)}
                            activeOpacity={0.8}
                        >
                            {isPending ? (
                                <ActivityIndicator color={theme.colors.onPrimary} />
                            ) : (
                                <>
                                    <IconSymbol
                                        name="check"
                                        size={20}
                                        color={theme.colors.onPrimary}
                                    />
                                    <Text style={styles.submitBtnText}>{t('profile:changePassword.submitButton')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Security Tips */}
                    <View style={styles.tipsCard}>
                        <View style={styles.tipHeader}>
                            <IconSymbol name="info" size={18} color={theme.colors.buttonActive} />
                            <Text style={styles.tipTitle}>{t('profile:changePassword.tips.title')}</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <IconSymbol name="check" size={14} color={theme.colors.success} />
                            <Text style={styles.tipText}>
                                {t('profile:changePassword.tips.item1')}
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <IconSymbol name="check" size={14} color={theme.colors.success} />
                            <Text style={styles.tipText}>
                                {t('profile:changePassword.tips.item2')}
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <IconSymbol name="check" size={14} color={theme.colors.success} />
                            <Text style={styles.tipText}>
                                {t('profile:changePassword.tips.item3')}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    flex1: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: theme.margins.xl,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        backgroundColor: theme.colors.background,
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

    // Icon Section
    iconSection: {
        alignItems: 'center',
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.md,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.colors.activeSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.sm,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.typography,
        // marginBottom: theme.margins.sm,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: theme.margins.md,
    },

    // Form Card
    card: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.margins.md,
        borderRadius: theme.radius.l + 8,
        padding: theme.margins.md,
        shadowColor: theme.colors.typography,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },

    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.border,
    },
    dividerText: {
        marginHorizontal: theme.margins.smd,
        color: theme.colors.typographySecondary,
        fontSize: 13,
        fontWeight: '500',
    },

    // Submit Button
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: theme.colors.buttonActive,
        height: 52,
        borderRadius: theme.radius.full,
        marginTop: theme.margins.sm,
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

    // Tips Card
    tipsCard: {
        backgroundColor: theme.colors.activeSubtle,
        marginHorizontal: theme.margins.md,
        marginTop: theme.margins.md,
        borderRadius: theme.radius.l,
        padding: theme.margins.sm,
        borderWidth: 1,
        borderColor: theme.colors.activeLight,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: theme.margins.smd,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.buttonActive,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 6,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },

    // Success State
    successContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
    },
    successIconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: theme.colors.successSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.lg,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },
    successSubtitle: {
        fontSize: 15,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
}));
