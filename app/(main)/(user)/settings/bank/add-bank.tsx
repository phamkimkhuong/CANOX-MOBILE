import { BankSelectModal } from '@/components/bank';
import { SettingsHeader } from '@/components/settings';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { useInitBankVerification } from '@/hooks/api/bank/useBank';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { AddBankFormData, AddBankFormSchema } from '@/types/bank/bankSchema';
import { BankSupportedUI } from '@/types/bank/ui';
import { Alert } from '@/utils/AlertHelper';
import { Navigator } from '@/utils/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * AddBankScreen - Step 1: Input Bank Information
 */
export default function AddBankScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { theme } = useUnistyles();

    const styles = stylesheet;
    const insets = useSafeAreaInsets();
    const { t } = useTranslation(['bank', 'common']);

    const handleHelp = useCallback(() => {
        Alert.show({
            title: t('bank:add.helpTitle'),
            message: t('bank:add.helpMessage'),
            type: 'info',
            confirmText: t('common:actions.done')
        });
    }, [t]);

    // State
    const [selectedBank, setSelectedBank] = useState<BankSupportedUI | null>(null);
    const [showBankModal, setShowBankModal] = useState(false);
    const [isDefault, setIsDefault] = useState(false);

    // API Hooks
    const { mutate: initVerification, isPending } = useInitBankVerification();

    // Form
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<AddBankFormData>({
        resolver: zodResolver(AddBankFormSchema),
        defaultValues: {
            bankAccountNumber: '',
            bankAccountHolder: '',
        },
    });

    const onSubmit = (data: AddBankFormData) => {
        if (!selectedBank) return;

        initVerification(
            {
                bankName: selectedBank.shortName,
                bankAccountNumber: data.bankAccountNumber,
                bankAccountHolder: data.bankAccountHolder,
                accountType: 'BUYER',
                isDefault,
            },
            {
                onSuccess: (res) => {
                    Navigator.push({
                        pathname: ROUTES.SETTINGS.VERIFY_BANK,
                        params: {
                            verificationId: res.verificationId,
                            bankName: selectedBank.shortName,
                            accountNumber: data.bankAccountNumber,
                        },
                    });
                },
            }
        );
    };

    return (
        <View style={styles.container}>
            <SettingsHeader
                title={t('bank:add.title')}
                onHelpPress={handleHelp}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex1}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + 40 }
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.step, styles.stepActive]}>
                            <Text style={styles.stepTextActive}>1</Text>
                        </View>
                        <View style={styles.stepLine} />
                        <View style={styles.step}>
                            <Text style={styles.stepText}>2</Text>
                        </View>
                    </View>

                    {/* Form Card with Liquid Glass Elements */}
                    <Animated.View entering={FadeInUp.duration(600)} style={styles.card}>
                        {/* Bank Selection */}
                        <Text style={styles.label}>{t('bank:add.bankLabel')}</Text>
                        <TouchableOpacity
                            onPress={() => setShowBankModal(true)}
                            activeOpacity={0.7}
                            style={[styles.inputWrapper, !selectedBank && styles.inputEmpty]}
                        >
                            <View style={styles.iconBox}>
                                <IconSymbol name="account-balance" size={20} color={theme.colors.buttonActive} />
                            </View>
                            <Text style={[styles.inputText, !selectedBank && styles.placeholderText]}>
                                {selectedBank ? `${selectedBank.shortName} - ${selectedBank.fullName}` : t('bank:add.bankPlaceholder')}
                            </Text>
                            <IconSymbol name="chevron-down" size={20} color={theme.colors.border} />
                        </TouchableOpacity>

                        {/* Account Holder */}
                        <Text style={styles.label}>{t('bank:add.holderLabel')}</Text>
                        <Controller
                            control={control}
                            name="bankAccountHolder"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={[
                                    styles.inputWrapper,
                                    !!errors.bankAccountHolder && styles.inputError
                                ]}>
                                    <View style={styles.iconBox}>
                                        <IconSymbol name="person" size={20} color={theme.colors.buttonActive} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('bank:add.holderPlaceholder')}
                                        placeholderTextColor={theme.colors.typographySecondary}
                                        autoCapitalize="characters"
                                        onBlur={onBlur}
                                        onChangeText={(val) => onChange(val.toUpperCase())}
                                        value={value}
                                    />
                                </View>
                            )}
                        />
                        {errors.bankAccountHolder && (
                            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                            <Text style={styles.errorText}>{t(errors.bankAccountHolder.message as any)}</Text>
                        )}

                        {/* Account Number */}
                        <Text style={styles.label}>{t('bank:add.accountLabel')}</Text>
                        <Controller
                            control={control}
                            name="bankAccountNumber"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={[
                                    styles.inputWrapper,
                                    !!errors.bankAccountNumber && styles.inputError
                                ]}>
                                    <View style={styles.iconBox}>
                                        <IconSymbol name="card" size={20} color={theme.colors.buttonActive} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('bank:add.accountPlaceholder')}
                                        placeholderTextColor={theme.colors.typographySecondary}
                                        keyboardType="numeric"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                </View>
                            )}
                        />
                        {errors.bankAccountNumber && (
                            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                            <Text style={styles.errorText}>{t(errors.bankAccountNumber.message as any)}</Text>
                        )}

                        {/* Default Checkbox */}
                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => setIsDefault(!isDefault)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                                {isDefault && <IconSymbol name="check" size={16} color="#FFF" />}
                            </View>
                            <Text style={styles.checkboxLabel}>{t('bank:add.defaultLabel')}</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Stability Info Card */}
                    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.infoCard}>
                        <IconSymbol name="shield" size={18} color={theme.colors.success} />
                        <Text style={styles.infoText}>
                            {t('bank:add.infoMessage')}
                        </Text>
                    </Animated.View>

                    {/* Action Button */}
                    <View style={styles.actionContainer}>
                        <TouchableOpacity
                            onPress={handleSubmit(onSubmit)}
                            disabled={isPending || !selectedBank}
                            activeOpacity={0.8}
                            style={[
                                styles.submitBtn,
                                (isPending || !selectedBank) && styles.submitBtnDisabled,
                            ]}
                        >
                            <LinearGradient
                                colors={[theme.colors.buttonActive, theme.colors.buttonActive, theme.colors.accent]}
                                locations={[0, 0.6, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradient}
                            >
                                {isPending ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <Text style={styles.submitText}>{t('bank:add.submit')}</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <BankSelectModal
                visible={showBankModal}
                onClose={() => setShowBankModal(false)}
                onSelect={setSelectedBank}
            />
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
        padding: 20,
        paddingBottom: 40,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        marginTop: 10,
    },
    step: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.backgroundNewInput,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    stepActive: {
        backgroundColor: theme.colors.buttonActive,
        borderColor: theme.colors.buttonActive,
    },
    stepText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.typographySecondary,
    },
    stepTextActive: {
        color: '#FFF',
    },
    stepLine: {
        width: 60,
        height: 2,
        backgroundColor: theme.colors.border,
        marginHorizontal: 8,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: 8,
        marginTop: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundNewInput,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    inputFocused: {
        borderColor: theme.colors.buttonActive,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    inputEmpty: {
        opacity: 0.8,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.typography,
        height: '100%',
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.typography,
    },
    placeholderText: {
        color: theme.colors.typographySecondary,
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
        marginTop: 4,
        marginLeft: 4,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxActive: {
        backgroundColor: theme.colors.buttonActive,
        borderColor: theme.colors.buttonActive,
    },
    checkboxLabel: {
        fontSize: 14,
        color: theme.colors.typography,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
        borderRadius: 16,
        padding: 16,
        marginTop: 24,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.1)',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },
    actionContainer: {
        marginTop: 40,
    },
    submitBtn: {
        borderRadius: 18,
        overflow: 'hidden',
        height: 56,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFF',
    },
}));
