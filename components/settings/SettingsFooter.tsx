import { MaterialIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SettingsFooterProps {
    onDeleteAccount?: () => void;
    showDeleteAccount?: boolean;
    version?: string;
}

/**
 * Settings Footer Component
 * Contains app version and danger zone actions
 */
export const SettingsFooter: React.FC<SettingsFooterProps> = memo(({
    onDeleteAccount,
    showDeleteAccount = true,
    version,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('profile');
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Delete Account - Danger Zone */}
            {showDeleteAccount && (
                <TouchableOpacity
                    onPress={onDeleteAccount}
                    style={styles.deleteButton}
                    accessibilityLabel={t('settings.footer.deleteAccountAccessibility')}
                    accessibilityRole="button"
                    accessibilityHint={t('settings.footer.deleteAccountHint')}
                >
                    <MaterialIcons
                        name="delete-forever"
                        size={20}
                        color={theme.colors.error}
                    />
                    <Text style={styles.deleteText}>{t('settings.actions.deleteAccount')}</Text>
                </TouchableOpacity>
            )}

            {/* App Version */}
            <View style={styles.versionContainer}>
                <MaterialIcons
                    name="verified"
                    size={16}
                    color={theme.colors.secondary}
                />
                <Text style={styles.versionText}>
                    {t('settings.footer.version', { version: version || '1.0.0' })}
                </Text>
            </View>

            {/* Copyright */}
            <Text style={styles.copyright}>
                {t('settings.footer.copyright')}
            </Text>
        </View>
    );
});

SettingsFooter.displayName = 'SettingsFooter';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        alignItems: 'center',
        marginTop: theme.margins.md,
        paddingHorizontal: theme.margins.lg,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.md,
        paddingHorizontal: theme.margins.lg,
        marginBottom: theme.margins.md,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: theme.colors.error,
        backgroundColor: 'transparent',
        gap: theme.margins.sm,
    },
    deleteText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.error,
    },
    versionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: theme.margins.sm,
    },
    versionText: {
        fontSize: 13,
        color: theme.colors.secondary,
        fontWeight: '500',
    },
    copyright: {
        fontSize: 11,
        color: theme.colors.secondary,
        opacity: 0.7,
    },
}));
