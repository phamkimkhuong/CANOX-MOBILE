import { IconSymbol } from '@/components/ui/Icon';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface AvatarEditViewProps {
    uri: string | null;
    onPress?: () => void;
    size?: number;
    showEditButton?: boolean;
    disabled?: boolean;
}

const DEFAULT_AVATAR = 'https://i.pravatar.cc/300';

/**
 * AvatarEditView - Display avatar with camera icon overlay
 * - Read-only display for now (no upload logic)
 * - Shows placeholder when no image
 * - Camera icon indicates edit capability (future)
 */
export const AvatarEditView: React.FC<AvatarEditViewProps> = ({
    uri,
    onPress,
    size = 112,
    showEditButton = true,
    disabled = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const avatarSource = uri || DEFAULT_AVATAR;
    const cameraIconSize = size * 0.28; // Proportional camera icon

    const handlePress = () => {
        if (!disabled && onPress) {
            onPress();
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.avatarContainer, { width: size, height: size }]}
                onPress={handlePress}
                disabled={disabled || !onPress}
                activeOpacity={0.8}
            >
                {/* Avatar Image */}
                <Image
                    source={{ uri: avatarSource }}
                    style={[
                        styles.avatar,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                        },
                    ]}
                    contentFit="cover"
                    transition={200}
                />

                {/* Camera Icon Overlay */}
                {showEditButton && (
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
                            name="camera-alt"
                            size={cameraIconSize * 0.55}
                            color={theme.colors.surface}
                        />
                    </View>
                )}
            </TouchableOpacity>

            {/* Helper text */}
            {showEditButton && (
                <Text style={styles.helperText}>Nhấn để thay đổi ảnh đại diện</Text>
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
}));

export default AvatarEditView;
