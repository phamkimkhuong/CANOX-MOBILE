import { IconSymbol } from '@/components/ui/Icon';
import { useAvatarUpload } from '@/hooks/api/profile/useAvatarUpload';
import { useUserProfile } from '@/hooks/api/profile/useProfile';
import {
    apiFormatToDate,
    dateToApiFormat,
    useUpdateProfile,
} from '@/hooks/api/profile/useUpdateProfile';
import { Gender, ProfileFormSchema, ProfileFormValues, UpdateProfilePayload } from '@/types/user';
import { Navigator } from '@/utils/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
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

    // Avatar upload hook
    const {
        isUploading: isUploadingAvatar,
        uploadProgress,
        pickFromGallery,
        takePhoto,
        uploadImage,
        error: avatarError,
    } = useAvatarUpload();

    // Preview image URI (after picking, before upload completes)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Keyboard visibility - hide bottom button when keyboard is open
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        const showSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => setIsKeyboardVisible(true)
        );
        const hideSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setIsKeyboardVisible(false)
        );
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

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
                Navigator.back();
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

    /**
     * Handle avatar press - show action sheet to choose image source
     */
    const handleAvatarPress = useCallback(() => {
        Alert.alert(
            'Thay đổi ảnh đại diện',
            'Chọn nguồn ảnh',
            [
                {
                    text: 'Chụp ảnh',
                    onPress: async () => {
                        const uri = await takePhoto();
                        if (uri) {
                            setAvatarPreview(uri);
                            uploadImage(uri, {
                                onSuccess: () => {
                                    Toast.show({
                                        type: 'success',
                                        text1: 'Thành công',
                                        text2: 'Cập nhật ảnh đại diện thành công',
                                    });
                                    setAvatarPreview(null);
                                },
                                onError: (error) => {
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Lỗi',
                                        text2: error.message || 'Không thể tải ảnh lên',
                                    });
                                    setAvatarPreview(null);
                                },
                            });
                        }
                    },
                },
                {
                    text: 'Chọn từ thư viện',
                    onPress: async () => {
                        const uri = await pickFromGallery();
                        if (uri) {
                            setAvatarPreview(uri);
                            uploadImage(uri, {
                                onSuccess: () => {
                                    Toast.show({
                                        type: 'success',
                                        text1: 'Thành công',
                                        text2: 'Cập nhật ảnh đại diện thành công',
                                    });
                                    setAvatarPreview(null);
                                },
                                onError: (error) => {
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Lỗi',
                                        text2: error.message || 'Không thể tải ảnh lên',
                                    });
                                    setAvatarPreview(null);
                                },
                            });
                        }
                    },
                },
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
            ]
        );
    }, [pickFromGallery, takePhoto, uploadImage]);

    // Handle back navigation with unsaved changes warning
    const handleBack = () => {
        if (isDirty) {
            Alert.alert(
                'Hủy thay đổi?',
                'Bạn có những thay đổi chưa lưu. Bạn có chắc muốn thoát?',
                [
                    { text: 'Ở lại', style: 'cancel' },
                    { text: 'Thoát', style: 'destructive', onPress: () => Navigator.back() },
                ]
            );
        } else {
            Navigator.back();
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
                        styles.scrollContent
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Avatar Section */}
                    <AvatarEditView
                        uri={profile?.avatar || null}
                        previewUri={avatarPreview}
                        showEditButton={true}
                        disabled={false}
                        isUploading={isUploadingAvatar}
                        uploadProgress={uploadProgress}
                        onPress={handleAvatarPress}
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

            {/* Fixed Save Button at Bottom */}
            {isDirty && !isKeyboardVisible && (
                <View style={[styles.bottomActionContainer, { paddingBottom: insets.bottom + 8 }]}>
                    <TouchableOpacity
                        style={[
                            styles.saveButtonFixed,
                            isUpdating && styles.saveButtonFixedDisabled,
                        ]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isUpdating}
                        activeOpacity={0.8}
                    >
                        {isUpdating ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <>
                                <IconSymbol name="checkmark" size={20} color="#ffffff" />
                                <Text style={styles.saveButtonFixedText}>Lưu thay đổi</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
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
        // marginTop: theme.margins.sm,
    },
    noticeContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.backgroundInput,
        borderRadius: theme.radius.m,
        gap: theme.margins.sm,
    },
    noticeText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.secondary,
        lineHeight: 18,
    },
    bottomActionContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.margins.lg,
    },
    saveButtonFixed: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: theme.radius.m,
        gap: 8,
    },
    saveButtonFixedDisabled: {
        opacity: 0.7,
    },
    saveButtonFixedText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
}));
