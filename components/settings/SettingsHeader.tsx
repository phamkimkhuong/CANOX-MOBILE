import { Navigator } from '@/utils/navigation';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SettingsHeaderProps {
    title?: string;
    showBackButton?: boolean;
    showHelpButton?: boolean;
    onHelpPress?: () => void;
}

/**
 * Settings Screen Header
 * Clean header with back navigation, title, and optional help button
 */
export const SettingsHeader: React.FC<SettingsHeaderProps> = memo(({
    title,
    showBackButton = true,
    showHelpButton = true,
    onHelpPress,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['profile', 'common']);
    const styles = stylesheet;
    const insets = useSafeAreaInsets();
    const headerTitle = title || t('profile:settings.title');

    const handleGoBack = () => {
        if (router.canGoBack()) {
            Navigator.back();
        } else {
            Navigator.replace('/(tabs)/me');
        }
    };

    const handleHelpPress = () => {
        if (onHelpPress) {
            onHelpPress();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar
                barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />
            <View style={styles.content}>
                {/* Left: Back Button */}
                <View style={styles.leftSection}>
                    {showBackButton && (
                        <TouchableOpacity
                            onPress={handleGoBack}
                            style={styles.iconButton}
                            accessibilityLabel={t('profile:settings.header.back')}
                            accessibilityRole="button"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <MaterialIcons
                                name="arrow-back"
                                size={24}
                                color={theme.colors.typography}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Center: Title */}
                <View style={styles.centerSection}>
                    <Text style={styles.title} numberOfLines={1}>
                        {headerTitle}
                    </Text>
                </View>

                {/* Right: Help Button or Empty */}
                <View style={styles.rightSection}>
                    {showHelpButton && onHelpPress && (
                        <TouchableOpacity
                            onPress={handleHelpPress}
                            style={styles.iconButton}
                            accessibilityLabel={t('profile:settings.header.help')}
                            accessibilityRole="button"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <MaterialIcons
                                name="help-outline"
                                size={24}
                                color={theme.colors.typographySecondary}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
});

SettingsHeader.displayName = 'SettingsHeader';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        paddingHorizontal: theme.margins.md,
    },
    leftSection: {
        width: 48,
        alignItems: 'flex-start',
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
    },
    rightSection: {
        width: 48,
        alignItems: 'flex-end',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        letterSpacing: 0.3,
    },
}));
