import { IconSymbol } from '@/components/ui/Icon';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { z } from 'zod';

import { AuthInput } from '@/components/auth/AuthInput';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { useRegister } from '@/hooks/api/useAuth';
import { RegisterRequestSchema } from '@/types/auth';
import Toast from 'react-native-toast-message';

// Schema Validation
const registerSchema = RegisterRequestSchema.extend({
	confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Mật khẩu không khớp',
	path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
	const { theme } = useUnistyles();
	const styles = stylesheet;
	const [agreedTerms, setAgreedTerms] = useState(false);
	const { mutate: register, isPending } = useRegister();

	const { control, handleSubmit, setError, setFocus, formState: { isSubmitting } } = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const onSubmit = async (data: RegisterFormData) => {
		if (!agreedTerms) {
			Toast.hide();
			Toast.show({
				type: 'error',
				text1: 'Vui lòng đồng ý với Điều khoản sử dụng',
				visibilityTime: 2000,
			});
			return;
		}
		try {
			const { confirmPassword, ...payload } = data;
			register(payload, {
				onError: (error: unknown) => {
					const apiError = error as { code?: number };
					if (apiError.code === 208) {
						setError('username', {
							type: 'manual',
							message: 'Tên đăng nhập đã được sử dụng'
						});
						setFocus('username');
					}
					else if (apiError.code === 209) {
						setError('email', {
							type: 'manual',
							message: 'Email đã được sử dụng'
						});
						setFocus('email');
					}
				},
				onSuccess: () => {
					Toast.show({
						type: 'success',
						text1: 'Đăng ký thành công',
						text2: 'Vui lòng xác thực email của bạn.',
					});
					// Navigate to OTP verification with email param
					router.push({
						pathname: '/(auth)/verify-otp',
						params: { email: data.email },
					});
				},
			});
		} catch {
			Toast.hide();
			Toast.show({
				type: 'error',
				text1: 'Đăng ký thất bại. Vui lòng thử lại.',
				visibilityTime: 2000,
			});
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
							onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
						>
							<IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Đăng ký</Text>
						<View style={styles.headerSpacer} />
					</View>

					{/* Welcome Section */}
					<View style={styles.welcomeSection}>
						<View style={styles.iconCircle}>
							<IconSymbol name="shopping-bag" size={32} color={theme.colors.primary} />
						</View>
						<Text style={styles.welcomeTitle}>Tạo tài khoản mới</Text>
						<Text style={styles.welcomeSubtitle}>
							Tham gia mua sắm quốc tế, tích điểm và viết đánh giá nhận thưởng ngay hôm nay.
						</Text>
					</View>

					{/* Form Card */}
					<View style={styles.card}>
						<AuthInput
							control={control}
							name="username"
							label="Tên đăng nhập"
							placeholder="Nhập tên đăng nhập"
							icon="person"
							autoCapitalize="none"
						/>
						<AuthInput
							control={control}
							name="email"
							label="Email"
							icon="mail"
							placeholder="Nhập địa chỉ email của bạn"
							keyboardType="email-address"
						/>

						<AuthInput
							control={control}
							name="password"
							label="Mật khẩu"
							icon="lock"
							placeholder="Nhập mật khẩu"
							isPassword
						/>

						<AuthInput
							control={control}
							name="confirmPassword"
							label="Nhập lại mật khẩu"
							icon="verified-user"
							placeholder="Nhập lại mật khẩu"
							isPassword
						/>

						{/* Terms Checkbox */}
						<TouchableOpacity
							style={styles.termsRow}
							onPress={() => setAgreedTerms(!agreedTerms)}
							activeOpacity={0.7}
						>
							<View style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}>
								{agreedTerms && (
									<IconSymbol name="check" size={14} color={theme.colors.onPrimary} />
								)}
							</View>
							<Text style={styles.termsText}>
								Tôi đồng ý với{' '}
								<Text style={styles.termsLink}>Điều khoản sử dụng</Text>
								{' '}và{' '}
								<Text style={styles.termsLink}>Chính sách bảo mật</Text>
							</Text>
						</TouchableOpacity>

						{/* Submit Button */}
						<TouchableOpacity
							style={[styles.submitBtn, (isSubmitting || isPending) && styles.submitBtnDisabled]}
							disabled={isSubmitting || isPending}
							onPress={handleSubmit(onSubmit)}
						>
							{isPending ? ( // Hiển thị Spinner khi đang gọi API
								<ActivityIndicator color="white" />
							) : (
								<Text style={styles.submitBtnText}>Đăng ký</Text>
							)}
						</TouchableOpacity>

						{/* Divider */}
						<View style={styles.dividerContainer}>
							<View style={styles.line} />
							<Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
							<View style={styles.line} />
						</View>

						{/* Social Buttons */}
						<SocialLoginButtons />
					</View>

					{/* Footer */}
					<View style={styles.footer}>
						<Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
						<TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
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
		paddingVertical: theme.margins.zero,
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
	termsRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 12,
		marginTop: theme.margins.sm,
		marginBottom: theme.margins.lg,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 1.5,
		borderColor: theme.colors.border,
		backgroundColor: theme.colors.surface,
		justifyContent: 'center',
		alignItems: 'center',
	},
	checkboxChecked: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	termsText: {
		flex: 1,
		fontSize: 14,
		color: theme.colors.typographySecondary,
		lineHeight: 20,
	},
	termsLink: {
		color: theme.colors.primary,
		fontWeight: '600',
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
	footerLink: {
		color: theme.colors.primary,
		fontWeight: 'bold',
		fontSize: 14,
	},
}));

