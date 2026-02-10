import { AuthInput } from '@/components/auth/AuthInput';
import { CartCheckbox } from '@/components/cart/CartCheckbox';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { IconSymbol } from '@/components/ui/Icon';
import { useDeleteAccount } from '@/hooks/api/user/useUserMutations';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { z } from 'zod';

type DeleteAccountFormData = {
    confirmText: string;
    agreeToTerms: boolean;
};

export default function DeleteAccountScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation(['profile', 'common']);

    const [isSuccess, setIsSuccess] = useState(false);

    // Mutation hook
    const { mutate: deleteAccount, isPending } = useDeleteAccount();

    const schema = useMemo(() => z.object({
        confirmText: z.string().refine((val) => val === 'DELETE', {
            message: t('profile:deleteAccount.confirmInputError'),
        }),
        agreeToTerms: z.boolean().refine((val) => val === true, {
            message: t('profile:deleteAccount.confirmCheckbox'),
        }),
    }), [t]);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid }
    } = useForm<DeleteAccountFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            confirmText: '',
            agreeToTerms: false,
        },
        mode: 'onChange',
    });

    const agreeToTerms = watch('agreeToTerms');

    /**
     * Handle account deletion
     */
    const onSubmit = useCallback(() => {
        deleteAccount(undefined, {
            onSuccess: () => {
                setIsSuccess(true);
            },
        });
    }, [deleteAccount]);

    // Success state UI
    if (isSuccess) {
        return (
            <View style={styles.successContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.successIconCircle}>
                    <IconSymbol name="check-circle" size={48} color={theme.colors.success} />
                </View>
                <Text style={styles.successTitle}>{t('profile:deleteAccount.successTitle')}</Text>
                <Text style={styles.successSubtitle}>
                    {t('profile:deleteAccount.successSubtitle')}
                </Text>
            </View>
        );
    }

    const warningItems = [
        t('profile:deleteAccount.warningItem1'),
        t('profile:deleteAccount.warningItem2'),
        t('profile:deleteAccount.warningItem3'),
        t('profile:deleteAccount.warningItem4'),
    ];

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <SettingsHeader title={t('profile:deleteAccount.title')} showHelpButton={false} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex1}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + 20 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header info */}
                    <View style={styles.headerInfo}>
                        <View style={styles.warningIconCircle}>
                            <IconSymbol name="warning" size={32} color={theme.colors.error} />
                        </View>
                        <Text style={styles.subtitle}>{t('profile:deleteAccount.subtitle')}</Text>
                        <Text style={styles.description}>{t('profile:deleteAccount.description')}</Text>
                    </View>

                    {/* Warning List */}
                    <View style={styles.warningCard}>
                        <Text style={styles.warningTitle}>{t('profile:deleteAccount.warningTitle')}</Text>
                        {warningItems.map((item, index) => (
                            <View key={index} style={styles.warningItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.warningText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Confirmation Form */}
                    <View style={styles.formCard}>
                        {/* Checkbox Agreement */}
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            activeOpacity={0.7}
                            onPress={() => setValue('agreeToTerms', !agreeToTerms, { shouldValidate: true })}
                        >
                            <CartCheckbox
                                checked={agreeToTerms}
                                onToggle={() => setValue('agreeToTerms', !agreeToTerms, { shouldValidate: true })}
                            />
                            <Text style={styles.checkboxLabel}>
                                {t('profile:deleteAccount.confirmCheckbox')}
                            </Text>
                        </TouchableOpacity>
                        {errors.agreeToTerms && (
                            <Text style={styles.errorText}>{errors.agreeToTerms.message}</Text>
                        )}

                        <View style={styles.divider} />

                        {/* Text confirmation */}
                        <AuthInput
                            control={control}
                            name="confirmText"
                            label={t('profile:deleteAccount.confirmInputLabel')}
                            placeholder={t('profile:deleteAccount.confirmInputPlaceholder')}
                            icon="delete-forever"
                            autoCapitalize="characters"
                        />

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.deleteBtn,
                                (!isValid || isPending) && styles.deleteBtnDisabled
                            ]}
                            disabled={!isValid || isPending}
                            onPress={handleSubmit(onSubmit)}
                            activeOpacity={0.8}
                        >
                            {isPending ? (
                                <ActivityIndicator color={theme.colors.onPrimary} />
                            ) : (
                                <Text style={styles.deleteBtnText}>{t('profile:deleteAccount.submitButton')}</Text>
                            )}
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => {
                                // Go back
                                if (Platform.OS === 'web') {
                                    window.history.back();
                                } else {
                                    const { router } = require('expo-router');
                                    router.back();
                                }
                            }}
                            disabled={isPending}
                        >
                            <Text style={styles.cancelBtnText}>{t('profile:deleteAccount.cancelButton')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    flex1: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.xl,
    },
    headerInfo: {
        alignItems: 'center',
        paddingVertical: theme.margins.lg,
    },
    warningIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.errorSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.md,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.typography,
        marginBottom: theme.margins.xs,
    },
    description: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        paddingHorizontal: theme.margins.md,
        lineHeight: 20,
    },
    warningCard: {
        backgroundColor: theme.colors.errorSubtle,
        borderRadius: theme.radius.l,
        padding: theme.margins.md,
        marginBottom: theme.margins.md,
        borderWidth: 1,
        borderColor: theme.colors.errorLight,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.error,
        marginBottom: theme.margins.sm,
    },
    warningItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: theme.margins.xs,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.error,
        marginTop: 7,
        marginRight: 10,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },
    formCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        padding: theme.margins.md,
        ...theme.shadows.small,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: theme.margins.sm,
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.typography,
        lineHeight: 20,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: -4,
        marginBottom: 8,
        marginLeft: 34,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.margins.md,
    },
    deleteBtn: {
        height: 52,
        backgroundColor: theme.colors.error,
        borderRadius: theme.radius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.margins.md,
        ...theme.shadows.medium,
    },
    deleteBtnDisabled: {
        opacity: 0.6,
        backgroundColor: theme.colors.secondary,
    },
    deleteBtnText: {
        color: theme.colors.onPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelBtn: {
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.margins.sm,
    },
    cancelBtnText: {
        color: theme.colors.typographySecondary,
        fontSize: 15,
        fontWeight: '600',
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
        backgroundColor: theme.colors.background,
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
