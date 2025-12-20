import { IconSymbol } from '@/components/ui/Icon';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { z } from 'zod';

import { AuthInput } from '@/components/auth/AuthInput';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { useAuthStore } from '@/store/useAuthStore';

// 1. Định nghĩa Schema Validation (Zod)
const loginSchema = z.object({
    email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const login = useAuthStore((state) => state.login);

    // 2. Setup React Hook Form
    const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // 3. Handle Submit Logic
    const onSubmit = async (data: LoginFormData) => {
        try {
            // TODO: Replace with actual API call using mutation hook
            // eslint-disable-next-line no-console
            console.log('Form Data:', data);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const fakeToken = "jwt-token-xyz-123";
            await login(fakeToken);

            // Smart navigation logic
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(tabs)');
            }
        } catch {
            Alert.alert("Lỗi đăng nhập", "Email hoặc mật khẩu không đúng.");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex1}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header: Back Btn + Title */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
                        >
                            <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Đăng nhập</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <View style={styles.iconCircle}>
                            <IconSymbol name="login" size={32} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.welcomeTitle}>Chào mừng trở lại</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Đăng nhập để tiếp tục mua sắm, theo dõi đơn hàng và nhận ưu đãi độc quyền.
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>
                        <AuthInput
                            control={control}
                            name="email"
                            label="Email hoặc Tên đăng nhập"
                            icon="person"
                            placeholder="nhập email hoặc tên đăng nhập"
                            keyboardType="email-address"
                        />

                        <AuthInput
                            control={control}
                            name="password"
                            label="Mật khẩu"
                            icon="lock"
                            placeholder="nhập mật khẩu"
                            isPassword
                        />

                        <TouchableOpacity
                            style={styles.forgotPassBtn}
                            onPress={() => router.push('/(auth)/forgot-password')}
                        >
                            <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
                        </TouchableOpacity>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.loginBtn, isSubmitting && styles.loginBtnDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.loginBtnText}>
                                {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                            </Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.line} />
                            <Text style={styles.dividerText}>Hoặc đăng nhập với</Text>
                            <View style={styles.line} />
                        </View>

                        {/* Social Buttons */}
                        <SocialLoginButtons />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                            <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
        backgroundColor: theme.colors.primarySoft,
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
    forgotPassBtn: {
        alignSelf: 'flex-end',
        marginTop: -theme.margins.sm,
        marginBottom: theme.margins.lg,
    },
    forgotPassText: {
        color: theme.colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    loginBtn: {
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
    loginBtnDisabled: {
        opacity: 0.7,
    },
    loginBtnText: {
        color: theme.colors.onPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.margins.lg,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.border,
    },
    dividerText: {
        marginHorizontal: theme.margins.md,
        color: theme.colors.typographySecondary,
        fontSize: 14,
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
    registerLink: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
}));