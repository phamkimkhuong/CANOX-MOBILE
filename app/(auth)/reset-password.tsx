/**
 * ==============================================
 * RESET PASSWORD SCREEN
 * ==============================================
 * 
 * Flow:
 * 1. User comes here after verifying OTP from forgot-password flow
 * 2. Receives email and otpCode as params
 * 3. User enters new password + confirm
 * 4. Submit to reset password API
 * 5. Navigate to login on success
 */

import { AuthInput } from '@/components/auth/AuthInput';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { useResetPassword } from '@/hooks/api/useAuth';
import { PasswordGroupSchema } from '@/types/auth';
import { Navigator } from '@/utils/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Get params from navigation
    const params = useLocalSearchParams<{ email: string; otpCode: string }>();
    const email = params.email;
    const otpCode = params.otpCode;

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
        if (!email || !otpCode) {
            Toast.show({
                type: 'error',
                text1: 'Thiếu thông tin',
                text2: 'Vui lòng thực hiện lại từ đầu.',
            });
            Navigator.replace(ROUTES.AUTH.FORGOT_PASSWORD);
        }
    }, [email, otpCode]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!email || !otpCode) return;

        try {
            await resetPassword({
                email,
                password: data.password,
                confirmPassword: data.confirmPassword,
            });

            Toast.show({
                type: 'success',
                text1: 'Đặt lại mật khẩu thành công',
                text2: 'Vui lòng đăng nhập với mật khẩu mới.',
            });

            // Navigate to login
            Navigator.replace(ROUTES.AUTH.LOGIN);
        } catch (error: any) {
            // Use centralized error handling architecture
            // Code 2500, 2514 = OTP Expired (defined in constants/errorCodes.ts)
            const isOtpExpired = error?.code === 2500 || error?.code === 2514;

            if (isOtpExpired) {
                Toast.show({
                    type: 'error',
                    text1: error.message,
                    text2: 'Vui lòng thực hiện lại từ đầu.',
                });
                Navigator.replace(ROUTES.AUTH.FORGOT_PASSWORD);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Đặt lại mật khẩu thất bại',
                    text2: error?.message || 'Vui lòng thử lại sau.',
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
                        <Text style={styles.headerTitle}>Đặt mật khẩu mới</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <View style={styles.iconCircle}>
                            <IconSymbol name="lock" size={36} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.welcomeTitle}>Tạo mật khẩu mới</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>
                        {/* New Password */}
                        <AuthInput
                            control={control}
                            name="password"
                            label="Mật khẩu mới"
                            icon="lock"
                            placeholder="Nhập mật khẩu mới"
                            isPassword
                            editable={!isSubmitting}
                        />

                        {/* Confirm Password */}
                        <AuthInput
                            control={control}
                            name="confirmPassword"
                            label="Xác nhận mật khẩu"
                            icon="lock"
                            placeholder="Nhập lại mật khẩu mới"
                            isPassword
                            editable={!isSubmitting}
                        />

                        {/* Password Requirements */}
                        <View style={styles.requirementsBox}>
                            <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
                            <View style={styles.requirementRow}>
                                <IconSymbol name="check" size={14} color={theme.colors.success} />
                                <Text style={styles.requirementText}>Ít nhất 6 ký tự</Text>
                            </View>
                            <View style={styles.requirementRow}>
                                <IconSymbol name="check" size={14} color={theme.colors.success} />
                                <Text style={styles.requirementText}>Chứa chữ hoa (A-Z)</Text>
                            </View>
                            <View style={styles.requirementRow}>
                                <IconSymbol name="check" size={14} color={theme.colors.success} />
                                <Text style={styles.requirementText}>Chứa chữ thường (a-z)</Text>
                            </View>
                            <View style={styles.requirementRow}>
                                <IconSymbol name="check" size={14} color={theme.colors.success} />
                                <Text style={styles.requirementText}>Chứa số (0-9)</Text>
                            </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <View style={styles.loadingRow}>
                                    <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                                    <Text style={styles.submitBtnText}>Đang xử lý...</Text>
                                </View>
                            ) : (
                                <Text style={styles.submitBtnText}>Đặt lại mật khẩu</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Đã nhớ mật khẩu? </Text>
                        <TouchableOpacity onPress={() => Navigator.replace(ROUTES.AUTH.LOGIN)}>
                            <Text style={styles.footerLink}>Đăng nhập</Text>
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
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: theme.colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.md,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
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
    requirementsBox: {
        backgroundColor: `${theme.colors.success}10`,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
        marginBottom: theme.margins.lg,
    },
    requirementsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    requirementText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    submitBtn: {
        backgroundColor: theme.colors.primary,
        height: 50,
        borderRadius: theme.radius.full,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
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
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
}));
