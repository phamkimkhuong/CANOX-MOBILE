import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { Navigator } from '@/utils/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AuthInput } from '@/components/auth/AuthInput';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { useLogin } from '@/hooks/api/useAuth';
import { showGlobalLoading } from '@/store/useLoadingStore';
import { LoginPayload, LoginRequestSchema } from '@/types/auth';

export default function LoginScreen() {
    const { theme } = useUnistyles();
    const { t } = useTranslation('auth');
    const styles = stylesheet;

    // 2. Setup React Hook Form
    const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginPayload>({
        resolver: zodResolver(LoginRequestSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });
    const { mutate: login } = useLogin();

    const onSubmit = async (data: LoginPayload) => {
        showGlobalLoading();
        login(data);
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
                            onPress={() => router.canGoBack() ? Navigator.back() : Navigator.replace(ROUTES.TABS.HOME)}
                        >
                            <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{t('login.title')}</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <View style={styles.iconCircle}>
                            <IconSymbol name="login" size={32} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.welcomeTitle}>{t('login.welcome')}</Text>
                        <Text style={styles.welcomeSubtitle}>
                            {t('login.subtitle')}
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>
                        <AuthInput
                            control={control}
                            name="username"
                            label={t('login.usernameLabel')}
                            icon="person"
                            placeholder={t('login.usernamePlaceholder')}
                            autoCapitalize="none"
                        />

                        <AuthInput
                            control={control}
                            name="password"
                            label={t('login.passwordLabel')}
                            icon="lock"
                            placeholder={t('login.passwordPlaceholder')}
                            isPassword
                        />

                        <TouchableOpacity
                            style={styles.forgotPassBtn}
                            onPress={() => Navigator.push(ROUTES.AUTH.FORGOT_PASSWORD)}
                        >
                            <Text style={styles.forgotPassText}>{t('login.forgotPassword')}</Text>
                        </TouchableOpacity>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.loginBtn}
                            disabled={isSubmitting}
                            onPress={handleSubmit(onSubmit)}
                        >
                            <Text style={styles.loginBtnText}>{t('login.loginButton')}</Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.line} />
                            <Text style={styles.dividerText}>{t('login.socialLogin')}</Text>
                            <View style={styles.line} />
                        </View>

                        {/* Social Buttons */}
                        <SocialLoginButtons />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{t('login.noAccount')}</Text>
                        <TouchableOpacity onPress={() => Navigator.push(ROUTES.AUTH.REGISTER)}>
                            <Text style={styles.registerLink}>{t('login.registerNow')}</Text>
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
