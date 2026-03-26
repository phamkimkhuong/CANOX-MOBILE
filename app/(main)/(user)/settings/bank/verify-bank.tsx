import { CountdownDigits } from '@/components/ui/CountdownDigits';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES, orderRoutes } from '@/constants/routes';
import { useVerifyAndCreateBank } from '@/hooks/api/bank/useBank';
import { useCountdown } from '@/hooks/useCountdown';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { useReturnRequestDraftStore } from '@/store/useReturnRequestDraftStore';
import { Navigator } from '@/utils/navigation';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * VerifyBankScreen - Step 2: OTP Verification
 */
export default function VerifyBankScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { theme } = useUnistyles();

    const styles = stylesheet;
    const insets = useSafeAreaInsets();
    const { t } = useTranslation(['bank', 'common']);
    const setBankAccountId = useReturnRequestDraftStore((state) => state.setBankAccountId);
    const params = useLocalSearchParams<{
        verificationId: string;
        bankName: string;
        accountNumber: string;
        returnTo?: string;
        orderId?: string;
    }>();

    // State
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<TextInput>(null);

    // API Hooks
    const { mutate: verifyOtp, isPending } = useVerifyAndCreateBank();
    const countdown = useCountdown({ duration: 120, autoStart: true });

    // Handlers
    const performVerification = useCallback((code: string) => {
        if (code.length !== 6) {
            setError(t('bank:verify.errorInvalid'));
            return;
        }

        verifyOtp(
            {
                verificationId: params.verificationId || '',
                otpCode: code,
            },
            {
                onSuccess: (createdBankAccount) => {
                    if (params.returnTo === 'return-request' && params.orderId) {
                        setBankAccountId(params.orderId, createdBankAccount.bankAccountId);
                        Navigator.dismissTo(orderRoutes.return(params.orderId));
                        return;
                    }

                    Navigator.replace(ROUTES.SETTINGS.BANK_CARDS);
                },
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                onError: (_err: any) => {
                    setError(t('bank:verify.errorExpired'));
                }
            }
        );
    }, [params.orderId, params.returnTo, params.verificationId, setBankAccountId, verifyOtp, t]);

    const handleVerify = () => performVerification(otp);
    const handleVerifyAuto = (code: string) => performVerification(code);

    const handleResend = useCallback(() => {
        if (!countdown.isExpired) return;
        // Logic to resend OTP would go here - usually calls initVerification again
        countdown.reset();
        countdown.start();
        setError(null);
    }, [countdown]);

    // UI Logic for OTP Boxes
    const renderOtpBoxes = () => {
        return (
            <View style={styles.otpContainer}>
                {[0, 1, 2, 3, 4, 5].map((index) => {
                    const char = otp[index] || '';
                    const isFocused = otp.length === index;
                    return (
                        <View
                            key={index}
                            style={[
                                styles.otpBox,
                                isFocused && styles.otpBoxFocused,
                                char !== '' && styles.otpBoxFilled,
                                !!error && styles.otpBoxError
                            ]}
                        >
                            <Text style={styles.otpText}>{char}</Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Liquid Background Glows */}
            <View style={styles.bgGlow1} />
            <View style={styles.bgGlow2} />

            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => Navigator.back()} style={styles.backBtn}>
                    <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('bank:verify.title')}</Text>
                <View style={styles.spacer} />
            </View>

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
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View entering={FadeInUp.duration(600)} style={styles.content}>
                        {/* Premium Glass Card */}
                        <View style={styles.glassCard}>
                            <BlurView intensity={20} tint="light" style={styles.cardBlur}>
                                {/* Icon & Info */}
                                <View style={styles.iconCircle}>
                                    <IconSymbol name="verified" size={40} color={theme.colors.buttonActive} />
                                </View>

                                <Text style={styles.title}>{t('bank:verify.subtitle')}</Text>
                                <Text style={styles.subtitle}>
                                    {t('bank:verify.message', { bankName: params.bankName })}
                                </Text>

                                {/* OTP Input Area - Clickable to focus hidden input */}
                                <Pressable
                                    style={styles.inputArea}
                                    onPress={() => {
                                        // Ensure keyboard pops up even if already focused
                                        if (inputRef.current?.isFocused()) {
                                            inputRef.current.blur();
                                        }
                                        setTimeout(() => inputRef.current?.focus(), 50);
                                    }}
                                >
                                    {renderOtpBoxes()}
                                    <TextInput
                                        ref={inputRef}
                                        value={otp}
                                        onChangeText={(val) => {
                                            const cleaned = val.replace(/[^0-9]/g, '').slice(0, 6);
                                            setOtp(cleaned);
                                            setError(null);

                                            if (cleaned.length === 6) {
                                                handleVerifyAuto(cleaned);
                                            }
                                        }}
                                        keyboardType="numeric"
                                        maxLength={6}
                                        style={styles.hiddenInput}
                                        autoFocus
                                    />
                                </Pressable>

                                {/* Error Message */}
                                {error && (
                                    <Animated.View entering={FadeInDown} style={styles.errorContainer}>
                                        <IconSymbol name="error" size={16} color={theme.colors.error} />
                                        <Text style={styles.errorText}>{error}</Text>
                                    </Animated.View>
                                )}

                                {/* Countdown & Resend */}
                                <View style={styles.resendContainer}>
                                    {countdown.isExpired ? (
                                        <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
                                            <Text style={styles.resendText}>{t('common:actions.retry')}</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.timerRow}>
                                            <Text style={styles.timerLabel}>{t('bank:verify.resendCountdown')}</Text>
                                            <CountdownDigits duration={countdown.duration} size="small" variant="primary" />
                                        </View>
                                    )}
                                </View>

                                {/* Action Button */}
                                <TouchableOpacity
                                    onPress={handleVerify}
                                    disabled={isPending || otp.length < 6}
                                    activeOpacity={0.8}
                                    style={[
                                        styles.submitBtn,
                                        (isPending || otp.length < 6) && styles.submitBtnDisabled,
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
                                            <Text style={styles.submitText}>{t('bank:verify.submit')}</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </BlurView>
                        </View>

                        <View style={styles.footerShield}>
                            <IconSymbol name="shield" size={16} color={theme.colors.success} />
                            <Text style={styles.footerShieldText}>
                                {t('bank:verify.footerInfo')}
                            </Text>
                        </View>
                    </Animated.View>
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
        paddingBottom: 40,
    },
    // Background Glow Effects
    bgGlow1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
    },
    bgGlow2: {
        position: 'absolute',
        bottom: 100,
        left: -50,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 12,
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.backgroundNewInput,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    spacer: {
        width: 40,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    glassCard: {
        width: '100%',
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 4,
    },
    cardBlur: {
        padding: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        alignItems: 'center',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 100,
        backgroundColor: theme.colors.activeSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.typography,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    inputArea: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 24,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 8,
    },
    otpBox: {
        flex: 1,
        height: 56,
        borderRadius: 14,
        backgroundColor: theme.colors.background,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpBoxFocused: {
        borderColor: theme.colors.buttonActive,
        backgroundColor: theme.colors.surface,
    },
    otpBoxFilled: {
        borderColor: theme.colors.buttonActive,
    },
    otpBoxError: {
        borderColor: theme.colors.error,
    },
    otpText: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    hiddenInput: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 24,
    },
    errorText: {
        fontSize: 13,
        color: theme.colors.error,
        fontWeight: '500',
    },
    resendContainer: {
        marginBottom: 32,
    },
    resendBtn: {
        padding: 8,
    },
    resendText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.buttonActive,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerLabel: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },
    submitBtn: {
        width: '100%',
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
    footerShield: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 32,
        paddingHorizontal: 20,
    },
    footerShieldText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        flex: 1,
    },
}));
