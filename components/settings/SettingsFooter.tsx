import React, { memo } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { MaterialIcons } from '@expo/vector-icons';
import { APP_VERSION } from '@/constants/settings';

interface SettingsFooterProps {
    onDeleteAccount?: () => void;
    showDeleteAccount?: boolean;
}

/**
 * Settings Footer Component
 * Contains app version and danger zone actions
 */
export const SettingsFooter: React.FC<SettingsFooterProps> = memo(({
    onDeleteAccount,
    showDeleteAccount = true,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Delete Account - Danger Zone */}
            {showDeleteAccount && (
                <TouchableOpacity
                    onPress={onDeleteAccount}
                    style={styles.deleteButton}
                    accessibilityLabel="Yêu cầu xóa tài khoản"
                    accessibilityRole="button"
                    accessibilityHint="Xóa vĩnh viễn tài khoản và dữ liệu của bạn"
                >
                    <MaterialIcons
                        name="delete-forever"
                        size={20}
                        color={theme.colors.error}
                    />
                    <Text style={styles.deleteText}>Yêu cầu xóa tài khoản</Text>
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
                    Phiên bản {APP_VERSION}
                </Text>
            </View>

            {/* Copyright */}
            <Text style={styles.copyright}>
                © 2024 eBay VN. All rights reserved.
            </Text>
        </View>
    );
});

SettingsFooter.displayName = 'SettingsFooter';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        alignItems: 'center',
        paddingVertical: theme.margins.xl,
        paddingHorizontal: theme.margins.lg,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.md,
        paddingHorizontal: theme.margins.lg,
        marginBottom: theme.margins.xl,
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
