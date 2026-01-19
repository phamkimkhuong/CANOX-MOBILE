import { IconSymbol } from '@/components/ui/Icon';
import { Image } from 'expo-image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface AvatarEditViewProps {
    uri: string | null;
    previewUri?: string | null; // Preview of selected image before upload
    onPress?: () => void;
    size?: number;
    showEditButton?: boolean;
    disabled?: boolean;
    isUploading?: boolean;
    uploadProgress?: number;
}

const DEFAULT_AVATAR_ASSET = require('@/assets/images/icon.png');

/**
 * AvatarEditView - Display avatar with camera icon overlay
 */
export const AvatarEditView: React.FC<AvatarEditViewProps> = ({
    uri,
    previewUri,
    onPress,
    size = 112,
    showEditButton = true,
    disabled = false,
    isUploading = false,
    uploadProgress = 0,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('profile');
    const styles = stylesheet;

    // Show preview if available, otherwise show current avatar
    const avatarUri = previewUri || uri;
    const cameraIconSize = size * 0.28;

    const handlePress = () => {
        if (!disabled && !isUploading && onPress) {
            onPress();
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.avatarContainer, { width: size, height: size }]}
                onPress={handlePress}
                disabled={disabled || isUploading || !onPress}
                activeOpacity={0.8}
            >
                {/* Avatar Image */}
                <Image
                    source={avatarUri ? { uri: avatarUri } : DEFAULT_AVATAR_ASSET}
                    style={[
                        styles.avatar,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                        },
                        isUploading && styles.avatarUploading,
                    ]}
                    contentFit="cover"
                    placeholder={DEFAULT_AVATAR_ASSET}
                    transition={200}
                />

                {/* Upload Progress Overlay */}
                {isUploading && (
                    <View style={[styles.uploadOverlay, { borderRadius: size / 2 }]}>
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text style={styles.uploadProgressText}>
                            {uploadProgress}%
                        </Text>
                    </View>
                )}

                {/* Camera Icon Overlay - hide during upload */}
                {showEditButton && !isUploading && (
                    <View
                        style={[
                            styles.cameraButton,
                            {
                                width: cameraIconSize,
                                height: cameraIconSize,
                                borderRadius: cameraIconSize / 2,
                            },
                        ]}
                    >
                        <IconSymbol
                            name="camera"
                            size={cameraIconSize * 0.55}
                            color={theme.colors.surface}
                        />
                    </View>
                )}
            </TouchableOpacity>

            {/* Helper text */}
            {showEditButton && !isUploading && (
                <Text style={styles.helperText}>{t('editProfile.avatar.helper')}</Text>
            )}

            {/* Upload status text */}
            {isUploading && (
                <Text style={styles.uploadingText}>{t('editProfile.avatar.uploading')}</Text>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        alignItems: 'center',
        marginVertical: theme.margins.lg,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        backgroundColor: theme.colors.backgroundInput,
        borderWidth: 3,
        borderColor: theme.colors.surface,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.surface,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    helperText: {
        marginTop: theme.margins.sm,
        fontSize: 13,
        color: theme.colors.secondary,
    },
    avatarUploading: {
        opacity: 0.6,
    },
    uploadOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadProgressText: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },
    uploadingText: {
        marginTop: theme.margins.sm,
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '500',
    },
}));

export default AvatarEditView;
