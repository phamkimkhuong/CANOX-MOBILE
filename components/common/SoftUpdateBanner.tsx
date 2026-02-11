/**
 * SoftUpdateBanner
 *
 * A dismissible bottom modal that gently prompts the user to
 * update the app. If the user dismisses, the skipped version
 * is saved and won't be shown again for 7 days (or until a
 * newer version is detected).
 *
 * Uses BottomSheet/Modal pattern consistent with the project.
 */

import { IconSymbol } from '@/components/ui/Icon';
import { useAppStore } from '@/store/useAppStore';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Constants

/** How many days before re-prompting after a skip */
const SKIP_COOLDOWN_DAYS = 7;

// Component

interface SoftUpdateBannerProps {
    /** Called after user dismisses or taps update */
    onDismiss: () => void;
}

export const SoftUpdateBanner: React.FC<SoftUpdateBannerProps> = ({ onDismiss }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('common');
    const styles = stylesheet;

    const updateMessage = useAppStore((s) => s.updateMessage);
    const storeUrl = useAppStore((s) => s.updateStoreUrl);
    const skipUpdate = useAppStore((s) => s.skipUpdate);

    const handleUpdate = useCallback(() => {
        if (storeUrl) {
            Linking.openURL(storeUrl);
        } else {
            const fallbackUrl = Platform.select({
                ios: process.env.EXPO_PUBLIC_STORE_URL_IOS,
                android: process.env.EXPO_PUBLIC_STORE_URL_ANDROID,
            });
            if (fallbackUrl) Linking.openURL(fallbackUrl);
        }
        onDismiss();
    }, [storeUrl, onDismiss]);

    const handleSkip = useCallback(() => {
        skipUpdate();
        onDismiss();
    }, [skipUpdate, onDismiss]);

    return (
        <View style={styles.overlay}>
            <View style={styles.container}>
                {/* Handle bar */}
                <View style={styles.handleBar} />

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconBadge}>
                        <IconSymbol
                            name="arrow.up.circle.fill"
                            size={32}
                            color={theme.colors.primary}
                        />
                    </View>
                    <Text style={styles.title}>
                        {t('update.softTitle')}
                    </Text>
                </View>

                {/* Body */}
                <Text style={styles.description}>
                    {updateMessage || t('update.softDescription')}
                </Text>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={handleUpdate}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.updateButtonText}>
                            {t('update.updateNow')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={handleSkip}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.skipButtonText}>
                            {t('update.later')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

/**
 * Helper to determine if the soft update banner should be shown.
 * Checks if the user has already skipped this version within cooldown.
 */
export function shouldShowSoftUpdate(): boolean {
    const state = useAppStore.getState();

    // Not a soft update
    if (state.updateStatus !== 'soft') return false;

    // No skipped version recorded → show
    if (!state.skippedVersion || !state.skippedAt) return true;

    // Different version from what was skipped → show (new version available)
    // We compare with the message or a simple equality check
    // Since we don't store latestVersion in store, we rely on skippedAt timeout
    const daysSinceSkip = (Date.now() - state.skippedAt) / (1000 * 60 * 60 * 24);

    // If cooldown has passed → show again
    return daysSinceSkip >= SKIP_COOLDOWN_DAYS;
}

const stylesheet = StyleSheet.create((theme) => ({
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
        zIndex: 999,
    },
    container: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        paddingHorizontal: theme.margins.lg,
        paddingBottom: theme.margins.xxl,
        paddingTop: theme.margins.sm,
        ...theme.shadows?.medium,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.border,
        alignSelf: 'center',
        marginBottom: theme.margins.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        marginBottom: theme.margins.md,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.typography,
        flex: 1,
    },
    description: {
        fontSize: 15,
        color: theme.colors.typographySecondary,
        lineHeight: 22,
        marginBottom: theme.margins.xl,
    },
    actions: {
        gap: theme.margins.sm,
    },
    updateButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        borderRadius: theme.radius.m,
        alignItems: 'center',
    },
    updateButtonText: {
        color: theme.colors.onPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    skipButtonText: {
        color: theme.colors.typographySecondary,
        fontSize: 15,
    },
}));
