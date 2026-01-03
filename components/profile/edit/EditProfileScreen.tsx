import { IconSymbol } from '@/components/ui/Icon';
import { useUserProfile } from '@/hooks/api/profile/useProfile';
import {
    apiFormatToDate,
    dateToApiFormat,
    useUpdateProfile,
} from '@/hooks/api/profile/useUpdateProfile';
import { Gender, ProfileFormSchema, ProfileFormValues, UpdateProfilePayload } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { AvatarEditView } from './AvatarEditView';
import { DatePickerField } from './DatePickerField';
import { GenderSelector } from './GenderSelector';
import { ProfileInput } from './ProfileInput';

/**
 * EditProfileScreen - Edit user profile information
 */
export default function EditProfileScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    // Fetch current profile data
    const { data: profile, isLoading: isLoadingProfile } = useUserProfile();

    // Update profile mutation
    const {
        mutate: updateProfile,
        isPending: isUpdating,
    } = useUpdateProfile();

    // Form setup
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(ProfileFormSchema),
        defaultValues: {
            fullName: '',
            phone: '',
            dateOfBirth: null,
            gender: null,
            email: '',
        },
    });

    // Watch form values for GenderSelector and DatePicker
    const watchedGender = watch('gender');
    const watchedDateOfBirth = watch('dateOfBirth');

    // Populate form when profile data is loaded
    useEffect(() => {
        if (profile) {
            setValue('fullName', profile.fullName || '');
            setValue('phone', profile.phone || '');
            setValue('email', profile.email || '');
            // Convert dateOfBirth string to Date object
            if (profile.dateOfBirth) {
                setValue('dateOfBirth', apiFormatToDate(profile.dateOfBirth));
            }
            // Set gender from profile
            if (profile.gender) {
                setValue('gender', profile.gender as Gender);
            }
        }
    }, [profile, setValue]);

    // Handle form submission
    const onSubmit = (data: ProfileFormValues) => {
        const payload: UpdateProfilePayload = {
            fullName: data.fullName,
            phone: data.phone,
            dateOfBirth: dateToApiFormat(data.dateOfBirth),
            gender: data.gender,
        };

        updateProfile(payload, {
            onSuccess: () => {
                Toast.show({
                    type: 'success',
                    text1: 'Thành công',
                    text2: 'Cập nhật hồ sơ thành công',
                });
                router.back();
            },
            onError: (error) => {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: error.message || 'Không thể cập nhật hồ sơ',
                });
            },
        });
    };

    // Handle back navigation with unsaved changes warning
    const handleBack = () => {
        if (isDirty) {
            Alert.alert(
                'Hủy thay đổi?',
                'Bạn có những thay đổi chưa lưu. Bạn có chắc muốn thoát?',
                [
                    { text: 'Ở lại', style: 'cancel' },
                    { text: 'Thoát', style: 'destructive', onPress: () => router.back() },
                ]
            );
        } else {
            router.back();
        }
    };

    // Loading state
    if (isLoadingProfile) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Đang tải thông tin...</Text>
            </View>
        );
    }

    return (
        <>
            {/* Stack Header Configuration */}
            <Stack.Screen
                options={{
                    title: 'Chỉnh sửa Hồ sơ',
                    headerShown: true,
                    headerLeft: () => (
                        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                            <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleSubmit(onSubmit)}
                            disabled={isUpdating || !isDirty}
                            style={styles.headerButton}
                        >
                            {isUpdating ? (
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                            ) : (
                                <Text
                                    style={[
                                        styles.saveButton,
                                        (!isDirty) && styles.saveButtonDisabled,
                                    ]}
                                >
                                    Lưu
                                </Text>
                            )}
                        </TouchableOpacity>
                    ),
                }}
            />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + 24 },
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Avatar Section */}
                    <AvatarEditView
                        uri={profile?.avatar || null}
                        showEditButton={true}
                        disabled={true} // No upload for now
                        onPress={() => {
                            Toast.show({
                                type: 'info',
                                text1: 'Tính năng đang phát triển',
                                text2: 'Chức năng thay đổi ảnh đại diện sẽ sớm được cập nhật',
                            });
                        }}
                    />

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        {/* Full Name */}
                        <ProfileInput
                            control={control}
                            name="fullName"
                            label="Họ và tên"
                            icon="person"
                            placeholder="Nhập họ và tên"
                            autoCapitalize="words"
                        />

                        {/* Gender Selector */}
                        <Controller
                            control={control}
                            name="gender"
                            render={({ field: { onChange }, fieldState: { error } }) => (
                                <GenderSelector
                                    value={watchedGender}
                                    onChange={(gender: Gender) => onChange(gender)}
                                    error={error?.message}
                                />
                            )}
                        />

                        {/* Date of Birth */}
                        <Controller
                            control={control}
                            name="dateOfBirth"
                            render={({ field: { onChange }, fieldState: { error } }) => (
                                <DatePickerField
                                    value={watchedDateOfBirth}
                                    onChange={onChange}
                                    error={error?.message}
                                    label="Ngày sinh"
                                    placeholder="Chọn ngày sinh"
                                />
                            )}
                        />

                        {/* Phone Number */}
                        <ProfileInput
                            control={control}
                            name="phone"
                            label="Số điện thoại"
                            icon="phone"
                            placeholder="Nhập số điện thoại"
                            keyboardType="phone-pad"
                        />

                        {/* Email (Read-only) */}
                        <ProfileInput
                            control={control}
                            name="email"
                            label="Email"
                            icon="mail"
                            placeholder="Email"
                            disabled={true}
                            rightText="Đã xác thực"
                        />
                    </View>

                    {/* Info Notice */}
                    <View style={styles.noticeContainer}>
                        <IconSymbol name="info" size={20} color={theme.colors.secondary} />
                        <Text style={styles.noticeText}>
                            Email không thể thay đổi vì đã được liên kết với tài khoản của bạn.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        gap: theme.margins.md,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.secondary,
    },
    headerButton: {
        paddingHorizontal: theme.margins.sm,
        paddingVertical: theme.margins.sm,
    },
    saveButton: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    saveButtonDisabled: {
        color: theme.colors.secondary,
        opacity: 0.5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.lg,
        paddingTop: theme.margins.md,
    },
    formContainer: {
        marginTop: theme.margins.md,
    },
    noticeContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.backgroundInput,
        padding: theme.margins.md,
        borderRadius: theme.radius.m,
        marginTop: theme.margins.lg,
        gap: theme.margins.sm,
    },
    noticeText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.secondary,
        lineHeight: 18,
    },
}));
