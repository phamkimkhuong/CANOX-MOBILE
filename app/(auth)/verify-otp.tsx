import { OtpInput } from '@/components/auth/OtpInput';
import { IconSymbol } from '@/components/ui/Icon';
import { authRoutes, ROUTES } from '@/constants/routes';
import {
    useResendForgotPasswordOtp,
    useResendOtp,
    useVerifyForgotPasswordOtp,
    useVerifyOtp
} from '@/hooks/api/useAuth';
import { useCountdown } from '@/hooks/useCountdown';
import { Navigator } from '@/utils/navigation';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

/** OTP resend cooldown in seconds */
const RESEND_COOLDOWN = 60;
/** OTP length */
const OTP_LENGTH = 6;

type OtpType = 'register' | 'forgot-password';

export default function VerifyOtpScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Get params from navigation
    const params = useLocalSearchParams<{ email: string; type?: string }>();
    const email = params.email;
    const otpType: OtpType = (params.type as OtpType) || 'register';

    // OTP state
    const [otp, setOtp] = useState('');
    const [hasError, setHasError] = useState(false);

    // API hooks - Register flow
    const { mutate: verifyOtp, isPending: isVerifyingRegister } = useVerifyOtp();
    const { mutate: resendOtp, isPending: isResendingRegister } = useResendOtp();

    // API hooks - Forgot password flow
    const { mutate: verifyForgotOtp, isPending: isVerifyingForgot } = useVerifyForgotPasswordOtp();
    const { mutate: resendForgotOtp, isPending: isResendingForgot } = useResendForgotPasswordOtp();

    // Combined states
    const isVerifying = otpType === 'forgot-password' ? isVerifyingForgot : isVerifyingRegister;
    const isResending = otpType === 'forgot-password' ? isResendingForgot : isResendingRegister;

    // Countdown timer
    const {
        isActive: isCountdownActive,
        formatted: countdownFormatted,
        start: startCountdown,
    } = useCountdown({
        duration: RESEND_COOLDOWN,
        autoStart: true,
    });

    // UI Content based on type
    const content = useMemo(() => {
        if (otpType === 'forgot-password') {
            return {
                headerTitle: 'Xác thực OTP',
                title: 'Nhập mã xác thực',
                subtitle: 'Chúng tôi đã gửi mã để đặt lại mật khẩu đến email',
                successTitle: 'Xác thực thành công',
                successMessage: 'Vui lòng đặt mật khẩu mới',
                changeEmailText: 'Đổi email khác',
                fallbackRoute: ROUTES.AUTH.FORGOT_PASSWORD,
            };
        }
        return {
            headerTitle: 'Xác thực OTP',
            title: 'Nhập mã xác thực',
            subtitle: `Chúng tôi đã gửi mã ${OTP_LENGTH} số đến email`,
            successTitle: 'Xác thực thành công',
            successMessage: 'Chào mừng bạn đến với eBay!',
            changeEmailText: 'Đổi địa chỉ email khác',
            fallbackRoute: ROUTES.AUTH.REGISTER,
        };
    }, [otpType]);

    // Mask email for display (e.g., "n***@gmail.com")
    const maskedEmail = email
        ? email.replace(/(.{1,2})(.*)(@.*)/, (_, start, middle, domain) =>
            `${start}${'*'.repeat(Math.min(middle.length, 5))}${domain}`
        )
        : '';

    // Handle OTP change
    const handleOtpChange = useCallback((value: string) => {
        setOtp(value);
        if (hasError) {
            setHasError(false);
        }
    }, [hasError]);

    // Handle OTP complete (auto-submit)
    const handleOtpComplete = useCallback(
        (completedOtp: string) => {
            if (!email || isVerifying) return;

            if (otpType === 'forgot-password') {
                // Forgot password flow - verify and navigate to reset password
                verifyForgotOtp(
                    { email, otpCode: completedOtp },
                    {
                        onSuccess: () => {
                            Toast.show({
                                type: 'success',
                                text1: content.successTitle,
                                text2: content.successMessage,
                            });
                            // Navigate to reset password screen with email and otp
                            router.replace(authRoutes.resetPassword({
                                email,
                                otpCode: completedOtp,
                            }));
                        },
                        onError: (error) => {
                            setHasError(true);
                            setOtp('');
                            Toast.show({
                                type: 'error',
                                text2: error.message,
                                text1: 'Vui lòng kiểm tra lại mã.',
                            });
                        },
                    }
                );
            } else {
                // Register flow - verify and navigate to login
                verifyOtp(
                    { email, otpCode: completedOtp },
                    {
                        onSuccess: () => {
                            Toast.show({
                                type: 'success',
                                text1: content.successTitle,
                                text2: content.successMessage,
                            });
                            Navigator.replace(ROUTES.AUTH.LOGIN);
                        },
                        onError: (error) => {
                            setHasError(true);
                            setOtp('');
                            Toast.show({
                                type: 'error',
                                text2: error.message,
                                text1: 'Vui lòng kiểm tra lại mã.',
                            });
                        },
                    }
                );
            }
        },
        [email, isVerifying, otpType, verifyForgotOtp, verifyOtp, content]
    );

    // Handle resend OTP
    const handleResend = useCallback(() => {
        if (!email || isCountdownActive || isResending) return;

        const resendFn = otpType === 'forgot-password' ? resendForgotOtp : resendOtp;

        resendFn(email, {
            onSuccess: () => {
                startCountdown();
                Toast.show({
                    type: 'success',
                    text1: 'Đã gửi lại mã',
                    text2: 'Vui lòng kiểm tra email của bạn.',
                });
            },
            onError: (error) => {
                Toast.show({
                    type: 'error',
                    text1: error.message,
                    text2: 'Vui lòng thử lại sau.',
                });
            },
        });
    }, [email, isCountdownActive, isResending, otpType, resendForgotOtp, resendOtp, startCountdown]);

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            Toast.show({
                type: 'error',
                text1: 'Thiếu thông tin',
                text2: 'Vui lòng thử lại.',
            });
            Navigator.replace(content.fallbackRoute);
        }
    }, [email, content.fallbackRoute]);

    // Handle back navigation
    const handleBack = useCallback(() => {
        if (router.canGoBack()) {
            Navigator.back();
        } else {
            Navigator.replace(content.fallbackRoute);
        }
    }, [content.fallbackRoute]);

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
                        <Text style={styles.headerTitle}>{content.headerTitle}</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Illustration Section */}
                    <View style={styles.illustrationSection}>
                        <View style={styles.iconCircle}>
                            <MaterialIcons
                                name={otpType === 'forgot-password' ? 'lock-outline' : 'mail-outline'}
                                size={48}
                                color={theme.colors.primary}
                            />
                        </View>
                        <Text style={styles.title}>{content.title}</Text>
                        <Text style={styles.subtitle}>{content.subtitle}</Text>
                        <Text style={styles.emailText}>{maskedEmail}</Text>
                    </View>

                    {/* OTP Input Card */}
                    <View style={styles.card}>
                        <OtpInput
                            length={OTP_LENGTH}
                            value={otp}
                            onChange={handleOtpChange}
                            onComplete={handleOtpComplete}
                            hasError={hasError}
                            disabled={isVerifying}
                            autoFocus
                        />

                        {/* Error message */}
                        {hasError && (
                            <View style={styles.errorContainer}>
                                <MaterialIcons name="error-outline" size={16} color={theme.colors.error} />
                                <Text style={styles.errorText}>
                                    Mã xác thực không đúng. Vui lòng thử lại.
                                </Text>
                            </View>
                        )}

                        {/* Verifying indicator */}
                        {isVerifying && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                                <Text style={styles.loadingText}>Đang xác thực...</Text>
                            </View>
                        )}

                        {/* Resend Section */}
                        <View style={styles.resendSection}>
                            <Text style={styles.resendLabel}>Không nhận được mã?</Text>

                            {isCountdownActive ? (
                                <View style={styles.countdownContainer}>
                                    <MaterialIcons name="schedule" size={16} color={theme.colors.secondary} />
                                    <Text style={styles.countdownText}>
                                        Gửi lại sau {countdownFormatted}
                                    </Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.resendBtn}
                                    onPress={handleResend}
                                    disabled={isResending}
                                >
                                    {isResending ? (
                                        <ActivityIndicator size="small" color={theme.colors.primary} />
                                    ) : (
                                        <>
                                            <MaterialIcons name="refresh" size={18} color={theme.colors.primary} />
                                            <Text style={styles.resendBtnText}>Gửi lại mã</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Help Section */}
                    <View style={styles.helpSection}>
                        <MaterialIcons name="help-outline" size={18} color={theme.colors.secondary} />
                        <Text style={styles.helpText}>
                            Kiểm tra thư mục Spam nếu bạn không thấy email trong hộp thư đến.
                        </Text>
                    </View>

                    {/* Change Email Link */}
                    <TouchableOpacity style={styles.changeEmailBtn} onPress={handleBack}>
                        <Text style={styles.changeEmailText}>{content.changeEmailText}</Text>
                    </TouchableOpacity>
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
        paddingHorizontal: theme.margins.md,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.margins.smd,
    },
    backBtn: {
        padding: theme.margins.sm,
        marginLeft: -theme.margins.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    headerSpacer: {
        width: 40,
    },
    illustrationSection: {
        alignItems: 'center',
        paddingVertical: theme.margins.xl,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    emailText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        marginTop: theme.margins.sm,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        padding: theme.margins.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.margins.md,
        gap: theme.margins.sm,
    },
    errorText: {
        fontSize: 13,
        color: theme.colors.error,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.margins.md,
        gap: theme.margins.sm,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.primary,
    },
    resendSection: {
        alignItems: 'center',
        marginTop: theme.margins.xl,
        paddingTop: theme.margins.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    resendLabel: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        marginBottom: theme.margins.sm,
    },
    countdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    countdownText: {
        fontSize: 14,
        color: theme.colors.secondary,
        fontWeight: '500',
    },
    resendBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
    },
    resendBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    helpSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: theme.margins.lg,
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.sm,
    },
    helpText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.secondary,
        lineHeight: 18,
    },
    changeEmailBtn: {
        alignItems: 'center',
        paddingVertical: theme.margins.lg,
        marginTop: theme.margins.md,
    },
    changeEmailText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '500',
    },
}));
