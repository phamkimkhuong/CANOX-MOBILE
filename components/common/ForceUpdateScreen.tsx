/**
 * ForceUpdateScreen
 *
 * Full-screen blocker shown when the app version is below
 * `min_supported_version`. User CANNOT dismiss this screen —
 * they must update via the Store.
 *
 * Design: Follows the same pattern as MaintenanceScreen.tsx
 */

import { IconSymbol } from '@/components/ui/Icon';
import { useAppStore } from '@/store/useAppStore';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export const ForceUpdateScreen: React.FC = () => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('common');
    const styles = stylesheet;

    const updateMessage = useAppStore((s) => s.updateMessage);
    const storeUrl = useAppStore((s) => s.updateStoreUrl);

    const handleUpdate = () => {
        if (storeUrl) {
            Linking.openURL(storeUrl);
        } else {
            // Fallback: Open the appropriate store search
            const fallbackUrl = Platform.select({
                ios: process.env.EXPO_PUBLIC_STORE_URL_IOS,
                android: process.env.EXPO_PUBLIC_STORE_URL_ANDROID,
            });
            if (fallbackUrl) Linking.openURL(fallbackUrl);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <IconSymbol
                        name="arrow.up.circle.fill"
                        size={80}
                        color={theme.colors.primary}
                    />
                </View>

                {/* Title */}
                <Text style={styles.title}>
                    {t('update.forceTitle')}
                </Text>

                {/* Message from Remote Config or fallback */}
                <Text style={styles.description}>
                    {updateMessage || t('update.forceDescription')}
                </Text>

                {/* Update Button */}
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdate}
                    activeOpacity={0.85}
                >
                    <View style={styles.buttonContent}>
                        <IconSymbol
                            name="arrow.down.app.fill"
                            size={20}
                            color={theme.colors.onPrimary}
                        />
                        <Text style={styles.buttonText}>
                            {t('update.updateNow')}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {t('maintenance.support')}
                </Text>
            </View>
        </SafeAreaView>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.typography,
        marginBottom: theme.margins.md,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: theme.margins.xxl,
        paddingHorizontal: theme.margins.md,
    },
    updateButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.margins.md,
        paddingHorizontal: theme.margins.xxl,
        borderRadius: theme.radius.m,
        minWidth: 260,
        alignItems: 'center',
        ...theme.shadows?.small,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        color: theme.colors.onPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        paddingVertical: theme.margins.md,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: theme.colors.secondary,
    },
}));
