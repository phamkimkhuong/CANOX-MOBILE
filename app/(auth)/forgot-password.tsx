import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { Navigator } from '@/utils/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { z } from 'zod';

import { AuthInput } from '@/components/auth/AuthInput';

// Schema Validation
const forgotPasswordSchema = z.object({
    emailOrPhone: z.string().min(1, 'Vui lòng nhập email hoặc số điện thoại'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const { control, handleSubmit, formState: { isSubmitting } } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            emailOrPhone: '',
        },
    });

    const onSubmit = async (_data: ForgotPasswordFormData) => {
        try {
            // TODO: Replace with actual API call using mutation hook
            await new Promise(resolve => setTimeout(resolve, 1000));

            Alert.alert(
                'Đã gửi yêu cầu',
                'Vui lòng kiểm tra email hoặc tin nhắn để đặt lại mật khẩu.',
                [{ text: 'OK', onPress: () => Navigator.replace(ROUTES.AUTH.LOGIN) }]
            );
        } catch {
            Alert.alert('Lỗi', 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
        }
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
                        >
                            <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Quên mật khẩu</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <View style={styles.iconCircle}>
                            <IconSymbol name="lock-reset" size={32} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.welcomeTitle}>Đặt lại mật khẩu</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Nhập email đã đăng ký để nhận link đặt lại mật khẩu
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>
                        <AuthInput
                            control={control}
                            name="email"
                            label="Email"
                            icon="mail"
                            placeholder="Nhập email"
                            keyboardType="email-address"
                        />

                        {/* Info Box */}
                        <View style={styles.infoBox}>
                            <IconSymbol name="info-outline" size={20} color={theme.colors.primary} />
                            <Text style={styles.infoText}>
                                Nếu không nhận được email, vui lòng kiểm tra thư mục spam hoặc thử lại sau ít phút.
                            </Text>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.submitBtnText}>
                                {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                            </Text>
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
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: `${theme.colors.primary}10`,
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
