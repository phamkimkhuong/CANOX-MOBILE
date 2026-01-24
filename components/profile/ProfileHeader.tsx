import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { Navigator } from '@/utils/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('profile');
    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    const handleSearch = () => {
        // TODO: Navigate to search
    };

    const handleNotification = () => {
        Navigator.push(ROUTES.TABS.NOTIFY);
    };

    const handleSettings = () => {
        Navigator.push(ROUTES.SETTINGS.INDEX);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + theme.margins.sm }]}>
            <Text style={styles.title}>{t('title')}</Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={handleSearch}
                    activeOpacity={0.7}
                    accessibilityLabel={t('header.searchAccessibility')}
                    accessibilityRole="button"
                >
                    <IconSymbol name="search" size={20} color={theme.colors.header.onHeader} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={handleNotification}
                    activeOpacity={0.7}
                    accessibilityLabel={t('header.notificationAccessibility')}
                    accessibilityRole="button"
                >
                    <IconSymbol name="notifications" size={20} color={theme.colors.header.onHeader} />
                    {hasNotification && <View style={styles.notificationDot} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={handleSettings}
                    activeOpacity={0.7}
                    accessibilityLabel={t('header.settingsAccessibility')}
                    accessibilityRole="button"
                >
                    <IconSymbol name="settings" size={20} color={theme.colors.header.onHeader} />
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
        backgroundColor: theme.colors.header.headerBackground,
        paddingBottom: theme.margins.sm,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.header.headerTitle,
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
        backgroundColor: theme.colors.success,
        borderWidth: 1,
        borderColor: theme.colors.header.onHeader,
    },
}));
