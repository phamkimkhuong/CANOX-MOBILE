import { ROUTES } from '@/constants/routes';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ProfileHeaderProps {
    /** Show notification dot */
    hasNotification?: boolean;
}

/**
 * Profile Header with title and action buttons
 * Sticky at top with safe area handling
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    hasNotification = true,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    const handleSearch = () => {
        // TODO: Navigate to search
    };

    const handleNotification = () => {
        router.push(ROUTES.TABS.NOTIFY);
    };

    const handleSettings = () => {
        // TODO: Navigate to settings
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + theme.margins.sm }]}>
            <Text style={styles.title}>Hồ sơ</Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={handleSearch}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="search" size={20} color={theme.colors.typographySecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={handleNotification}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="notifications" size={20} color={theme.colors.typographySecondary} />
                    {hasNotification && <View style={styles.notificationDot} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={handleSettings}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="settings" size={20} color={theme.colors.typographySecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        backgroundColor: theme.colors.background,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.typography,
        letterSpacing: -0.5,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.surfaceOverlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 10,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.error,
        borderWidth: 1,
        borderColor: theme.colors.surface,
    },
}));
