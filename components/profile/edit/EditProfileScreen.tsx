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
import { useTranslation } from 'react-i18next';
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
import { AddressSection } from './AddressSection';
import { AvatarEditView } from './AvatarEditView';
import { DatePickerField } from './DatePickerField';
import { GenderSelector } from './GenderSelector';
import { ProfileInput } from './ProfileInput';

/**
 * EditProfileScreen - Edit user profile information
 */
export default function EditProfileScreen() {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['profile', 'common']);
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
                    text1: t('common:status.success'),
                    text2: t('profile:editProfile.messages.updateSuccess'),
                });
                Navigator.back();
            },
            onError: () => {
                // Handled in useUpdateProfile
            },
        });
    };

    /**
     * Handle avatar press - show action sheet to choose image source
     */
    const handleAvatarPress = useCallback(() => {
        Alert.alert(
            t('profile:editProfile.avatar.change'),
            t('profile:editProfile.avatar.chooseSource'),
            [
                {
                    text: t('profile:editProfile.avatar.camera'),
                    onPress: async () => {
                        const uri = await takePhoto();
                        if (uri) {
                            setAvatarPreview(uri);
                            uploadImage(uri, {
                                onSuccess: () => {
                                    Toast.show({
                                        type: 'success',
                                        text1: t('common:status.success'),
                                        text2: t('profile:editProfile.messages.uploadSuccess'),
                                    });
                                    setAvatarPreview(null);
                                },
                                onError: () => {
                                    setAvatarPreview(null);
                                    // Toast handled in useAvatarUpload
                                },
                            });
                        }
                    },
                },
                {
                    text: t('profile:editProfile.avatar.gallery'),
                    onPress: async () => {
                        const uri = await pickFromGallery();
                        if (uri) {
                            setAvatarPreview(uri);
                            uploadImage(uri, {
                                onSuccess: () => {
                                    Toast.show({
                                        type: 'success',
                                        text1: t('common:status.success'),
                                        text2: t('profile:editProfile.messages.uploadSuccess'),
                                    });
                                    setAvatarPreview(null);
                                },
                                onError: () => {
                                    setAvatarPreview(null);
                                    // Toast handled in useAvatarUpload
                                },
                            });
                        }
                    },
                },
                {
                    text: t('common:actions.cancel'),
                    style: 'cancel',
                },
            ]
        );
    }, [pickFromGallery, takePhoto, uploadImage, t]);

    // Handle back navigation with unsaved changes warning
    const handleBack = () => {
        if (isDirty) {
            Alert.alert(
                t('profile:editProfile.messages.unsavedChangesTitle'),
                t('profile:editProfile.messages.unsavedChangesMessage'),
                [
                    { text: t('profile:editProfile.messages.stay'), style: 'cancel' },
                    { text: t('profile:editProfile.messages.exit'), style: 'destructive', onPress: () => Navigator.back() },
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
                <Text style={styles.loadingText}>{t('profile:editProfile.messages.loading')}</Text>
            </View>
        );
    }

    return (
        <>
            {/* Stack Header Configuration */}
            <Stack.Screen
                options={{
                    title: t('profile:editProfile.title'),
                    headerShown: true,
                    headerLeft: () => (
                        <TouchableOpacity onPress={handleBack} style={styles.headerButton} accessibilityLabel={t('common:actions.back')}>
                            <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleSubmit(onSubmit)}
                            disabled={isUpdating || !isDirty}
                            style={styles.headerButton}
                            accessibilityLabel={t('profile:editProfile.save')}
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
                                    {t('profile:editProfile.save')}
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
                        { paddingBottom: isDirty && !isKeyboardVisible ? insets.bottom + 100 : insets.bottom + 20 }
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
                            label={t('profile:editProfile.form.fullName')}
                            icon="person"
                            placeholder={t('profile:editProfile.form.fullNamePlaceholder')}
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
                                />
                            )}
                        />

                        {/* Phone Number */}
                        <ProfileInput
                            control={control}
                            name="phone"
                            label={t('profile:editProfile.form.phone')}
                            icon="phone"
                            placeholder={t('profile:editProfile.form.phonePlaceholder')}
                            keyboardType="phone-pad"
                        />

                        {/* Email (Read-only) */}
                        <ProfileInput
                            control={control}
                            name="email"
                            label={t('profile:editProfile.form.email')}
                            icon="mail"
                            placeholder={t('profile:editProfile.form.email')}
                            disabled={true}
                            rightText={t('profile:editProfile.form.verified')}
                        />

                        {/* Info Notice for Email */}
                        <View style={styles.noticeContainer}>
                            <IconSymbol name="info" size={16} color={theme.colors.secondary} />
                            <Text style={styles.noticeText}>
                                {t('profile:editProfile.form.emailLockNotice')}
                            </Text>
                        </View>

                        {/* Address Section */}
                        <AddressSection />
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
                        accessibilityRole="button"
                    >
                        {isUpdating ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <>
                                <IconSymbol name="checkmark" size={20} color="#ffffff" />
                                <Text style={styles.saveButtonFixedText}>{t('profile:editProfile.save')}</Text>
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
        color: theme.colors.newPrimary,
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
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: theme.radius.m,
        padding: theme.margins.sm,
        gap: theme.margins.xs,
        marginTop: -theme.margins.xs,
        marginBottom: theme.margins.sm,
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
        backgroundColor: theme.colors.newPrimary,
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
