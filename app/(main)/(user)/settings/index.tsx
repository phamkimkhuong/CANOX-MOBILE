import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { Alert as CustomAlert } from '@/utils/AlertHelper';
import { Navigator } from '@/utils/navigation';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import {
    SettingsFooter,
    SettingsHeader,
    SettingsItem,
    SettingsSection
} from '@/components/settings';
import { ROUTES } from '@/constants/routes';
import { SETTINGS_SECTIONS } from '@/constants/settings';
import { useCache } from '@/hooks/useCache';
import { useLogout } from '@/hooks/useLogout';
import { useAppStore } from '@/store/useAppStore';
import { useIsAuthenticated } from '@/store/useAuthStore';
import type { SettingsItem as SettingsItemType } from '@/types/settings';

/**
 * Settings Screen
 * Config-driven UI with dynamic section rendering
 */
export default function SettingsScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const styles = stylesheet;

    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation(['profile', 'common']);

    // App Store - Global settings
    const darkModeEnabled = useAppStore((state) => state.darkModeEnabled);
    const setDarkMode = useAppStore((state) => state.setDarkMode);
    const isAuthenticated = useIsAuthenticated();

    const {
        formattedSize: cacheSize,
        clearCache,
    } = useCache();

    const { logout } = useLogout();

    const handleHelp = useCallback(() => {
        CustomAlert.show({
            title: t('settings.helpTitle'),
            message: t('settings.helpMessage'),
            type: 'info',
            confirmText: t('common:actions.done')
        });
    }, [t]);

    // Handle navigation for link items
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const handleNavigation = useCallback((route: any) => {
        Navigator.push(route);
    }, []);

    // Handle dark mode toggle
    const handleDarkModeToggle = useCallback((value: boolean) => {
        setDarkMode(value);
    }, [setDarkMode]);

    // Handle cache clear
    const handleClearCache = useCallback(() => {
        CustomAlert.show({
            title: t('settings.items.cache'),
            message: t('settings.actions.confirmClearCache', { size: cacheSize }),
            type: 'warning',
            confirmText: t('common:actions.delete'),
            cancelText: t('common:actions.cancel'),
            showCancel: true,
            onConfirm: async () => {
                const success = await clearCache();
                if (success) {
                    CustomAlert.success(t('settings.actions.cacheCleared'));
                }
            },
        });
    }, [cacheSize, clearCache, t]);

    // Handle delete account
    const handleDeleteAccount = useCallback(() => {
        CustomAlert.show({
            title: t('settings.actions.deleteAccount'),
            message: t('settings.actions.deleteAccountConfirm'),
            type: 'error',
            confirmText: t('common:actions.next'),
            cancelText: t('common:actions.cancel'),
            showCancel: true,
            onConfirm: () => {
                Navigator.push(ROUTES.SETTINGS.DELETE_ACCOUNT as never);
            },
        });
    }, [t]);

    // Get dynamic values for settings items
    const getDynamicValue = useCallback((item: SettingsItemType): string | boolean | undefined => {
        switch (item.id) {
            case 'dark-mode':
                return darkModeEnabled;
            case 'cache':
                return cacheSize;
            case 'language':
                return i18n.language?.startsWith('vi') ? 'Tiếng Việt' : 'English';
            default:
                if (item.type === 'toggle' && item.storeKey) {
                    return darkModeEnabled;
                }
                return undefined;
        }
    }, [darkModeEnabled, cacheSize, i18n.language]);

    // Get onPress handler for each item
    const getItemHandler = useCallback((item: SettingsItemType): (() => void) | undefined => {
        switch (item.type) {
            case 'link':
                return () => handleNavigation(item.route);
            case 'toggle':
                return undefined; // Handled by onValueChange
            case 'info':
                if (item.id === 'cache') {
                    return handleClearCache;
                }
                return undefined;
            case 'action':
                return undefined;
            default:
                return undefined;
        }
    }, [handleNavigation, handleClearCache]);

    // Get toggle handler
    const getToggleHandler = useCallback((item: SettingsItemType): ((value: boolean) => void) | undefined => {
        if (item.type !== 'toggle') return undefined;

        switch (item.id) {
            case 'dark-mode':
                return handleDarkModeToggle;
            default:
                return undefined;
        }
    }, [handleDarkModeToggle]);

    // Get dynamic label
    const getDynamicLabel = useCallback((item: SettingsItemType): string => {
        // Try to translate label based on ID
        const key = `settings.items.${item.id}`;
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const translatedLabel = t(key as any);
        return translatedLabel !== key ? translatedLabel : item.label;
    }, [t]);

    // Render a single settings item
    const renderItem = useCallback((item: SettingsItemType, index: number, total: number) => {
        const dynamicValue = getDynamicValue(item);
        const onPress = getItemHandler(item);
        const onToggleChange = getToggleHandler(item);
        const label = getDynamicLabel(item);

        // Get the value properly typed
        const toggleValue = typeof dynamicValue === 'boolean' ? dynamicValue : false;
        const infoValue = typeof dynamicValue === 'string' ? dynamicValue : undefined;

        // Override subtitle for link items if dynamic value is present
        let finalItem = { ...item, label };
        if (item.type === 'link' && typeof dynamicValue === 'string') {
            finalItem = { ...item, label, subtitle: dynamicValue };
        }

        return (
            <SettingsItem
                key={item.id}
                item={finalItem as SettingsItemType}
                onPress={onPress}
                onToggleChange={onToggleChange}
                toggleValue={toggleValue}
                infoValue={infoValue}
                isFirst={index === 0}
                isLast={index === total - 1}
            />
        );
    }, [getDynamicValue, getItemHandler, getToggleHandler, getDynamicLabel]);

    // Filter sections based on availability and authentication
    const visibleSections = useMemo(() => {
        return SETTINGS_SECTIONS
            .filter((section) => {
                // Hide account and payment sections if not authenticated
                if (!isAuthenticated && (section.id === 'account' || section.id === 'payment')) {
                    return false;
                }
                return true;
            })
            .map((section) => ({
                ...section,
                items: section.items.filter((item) => {
                    // Hide notifications if not authenticated (guest mode)
                    if (item.id === 'notifications' && !isAuthenticated) {
                        return false;
                    }
                    return true;
                }),
            }))
            .filter((section) => section.items.length > 0);
    }, [isAuthenticated]);

    return (
        <View style={styles.container}>
            <SettingsHeader onHelpPress={handleHelp} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: insets.bottom + 20 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Settings Sections */}
                {visibleSections.map((section) => (
                    <SettingsSection
                        key={section.id}
                        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                        title={t(`settings.sections.${section.id}` as any)}
                    >
                        {section.items.map((item, index) =>
                            renderItem(item, index, section.items.length)
                        )}
                    </SettingsSection>
                ))}

                {/* Logout Button */}
                {isAuthenticated && (
                    <View style={styles.logoutContainer}>
                        <SettingsItem
                            item={{
                                id: 'logout',
                                type: 'action',
                                label: t('settings.actions.logout'),
                                icon: 'logout',
                                iconColor: 'slate',
                                actionStyle: 'default',
                            }}
                            onPress={logout}
                        />
                    </View>
                )}

                {/* Footer */}
                <SettingsFooter
                    onDeleteAccount={handleDeleteAccount}
                    showDeleteAccount={isAuthenticated}
                />
            </ScrollView>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.sm,
    },
    logoutContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
}));
