import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { IconSymbol } from '@/components/ui/Icon';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { FCM_TOPICS, unsubscribeFromTopic } from '@/hooks/usePushNotifications';
import { mmkvStorage } from '@/store/storage';
import { AuthorizationStatus, getMessaging, hasPermission, subscribeToTopic } from '@react-native-firebase/messaging';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Linking, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Các key để lưu trạng thái switch vào MMKV
const STORAGE_KEYS = {
    PROMOTIONS: 'notify_promotions',
    NEWS: 'notify_news',
    ORDERS: 'notify_orders',
    CHAT: 'notify_chat',
};

export default function NotificationsSettingsScreen() {
    useNavigationUnlockOnFocus();
    const { t } = useTranslation(['notification']);
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const [isSystemEnabled, setIsSystemEnabled] = useState(true);

    // States cho các Switch
    const [promotionsEnabled, setPromotionsEnabled] = useState(mmkvStorage.getBoolean(STORAGE_KEYS.PROMOTIONS) ?? false);
    const [newsEnabled, setNewsEnabled] = useState(mmkvStorage.getBoolean(STORAGE_KEYS.NEWS) ?? false);
    const [chatEnabled, setChatEnabled] = useState(mmkvStorage.getBoolean(STORAGE_KEYS.CHAT) ?? true);
    const [ordersEnabled, setOrdersEnabled] = useState(mmkvStorage.getBoolean(STORAGE_KEYS.ORDERS) ?? true); // Mặc định bật đơn hàng

    useEffect(() => {
        checkSystemPermission();

        // Lắng nghe trạng thái App (để biết khi nào user quay lại từ Settings)
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                checkSystemPermission();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const checkSystemPermission = async () => {
        const messagingInstance = getMessaging();
        const authStatus = await hasPermission(messagingInstance);
        setIsSystemEnabled(
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL
        );
    };

    const handleToggleTopic = async (topic: string, storageKey: string, currentValue: boolean, setter: (v: boolean) => void) => {
        const newValue = !currentValue;
        setter(newValue);
        mmkvStorage.set(storageKey, newValue);

        let topicLabel = '';
        if (topic === FCM_TOPICS.PROMOTIONS) topicLabel = t('settings.groups.promotion.deals.title');
        else if (topic === FCM_TOPICS.NEWS) topicLabel = t('settings.groups.promotion.news.title');
        else if (storageKey === STORAGE_KEYS.CHAT) topicLabel = t('settings.groups.transaction.chat.title');
        else if (storageKey === STORAGE_KEYS.ORDERS) topicLabel = t('settings.groups.transaction.order.title');

        try {
            // Nếu là topic-based (không phải Orders gửi qua Token)
            if (topic) {
                const messagingInstance = getMessaging();
                if (newValue) {
                    await subscribeToTopic(messagingInstance, topic);
                } else {
                    await unsubscribeFromTopic(topic);
                }
            }

            Toast.show({
                type: newValue ? 'success' : 'info',
                text1: t(newValue ? 'settings.messages.enableSuccess' : 'settings.messages.disableSuccess', { topic: topicLabel })
            });
        } catch {
            setter(currentValue);
            Toast.show({ type: 'error', text1: t('settings.messages.updateError') });
        }
    };

    const openSystemSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else {
            Linking.openSettings();
        }
    };

    const renderSettingItem = (
        icon: string,
        title: string,
        description: string,
        value: boolean,
        onToggle?: () => void,
        disabled = false
    ) => (
        <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
                <IconSymbol name={icon as never} size={22} color={theme.colors.accent} />
            </View>
            <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingDescription}>{description}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                disabled={disabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.activeLight }}
                thumbColor={value ? theme.colors.newPrimary : theme.colors.surface}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <SettingsHeader title={t('settings.title')} showHelpButton={false} />

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + theme.margins.lg }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {!isSystemEnabled && (
                    <Animated.View entering={FadeInDown} style={styles.warningCard}>
                        <IconSymbol name="warning" size={20} color={theme.colors.error} />
                        <View style={styles.warningTextContainer}>
                            <Text style={styles.warningTitle}>{t('settings.systemDisabled.title')}</Text>
                            <Text style={styles.warningDescription}>{t('settings.systemDisabled.description')}</Text>
                            <Pressable onPress={openSystemSettings}>
                                <Text style={styles.warningLink}>{t('settings.systemDisabled.action')}</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                )}

                <Text style={styles.sectionTitle}>{t('settings.groups.transaction.title')}</Text>
                <View style={styles.sectionCard}>
                    {renderSettingItem(
                        'bag-handle',
                        t('settings.groups.transaction.order.title'),
                        t('settings.groups.transaction.order.description'),
                        ordersEnabled,
                        () => handleToggleTopic('', STORAGE_KEYS.ORDERS, ordersEnabled, setOrdersEnabled),
                        false
                    )}
                    <View style={styles.divider} />
                    {renderSettingItem(
                        'chatbubble-ellipses',
                        t('settings.groups.transaction.chat.title'),
                        t('settings.groups.transaction.chat.description'),
                        chatEnabled,
                        () => handleToggleTopic('', STORAGE_KEYS.CHAT, chatEnabled, setChatEnabled),
                        false
                    )}
                </View>

                <Text style={styles.sectionTitle}>{t('settings.groups.promotion.title')}</Text>
                <View style={styles.sectionCard}>
                    {renderSettingItem(
                        'pricetag',
                        t('settings.groups.promotion.deals.title'),
                        t('settings.groups.promotion.deals.description'),
                        promotionsEnabled,
                        () => handleToggleTopic(FCM_TOPICS.PROMOTIONS, STORAGE_KEYS.PROMOTIONS, promotionsEnabled, setPromotionsEnabled)
                    )}
                    <View style={styles.divider} />
                    {renderSettingItem(
                        'megaphone',
                        t('settings.groups.promotion.news.title'),
                        t('settings.groups.promotion.news.description'),
                        newsEnabled,
                        () => handleToggleTopic(FCM_TOPICS.NEWS, STORAGE_KEYS.NEWS, newsEnabled, setNewsEnabled)
                    )}
                </View>

                <Text style={styles.sectionTitle}>{t('settings.groups.advanced.title')}</Text>
                <Pressable style={styles.advancedButton} onPress={openSystemSettings}>
                    <Text style={styles.advancedButtonText}>{t('settings.groups.advanced.systemSettings')}</Text>
                    <IconSymbol name="open-outline" size={16} color={theme.colors.typographySecondary} />
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: theme.margins.lg,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
        marginBottom: theme.margins.sm,
        marginTop: theme.margins.lg,
        textTransform: 'uppercase',
    },
    sectionCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        paddingHorizontal: theme.margins.md,
        ...theme.shadows.small,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.lg,
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingTextContainer: {
        flex: 1,
        marginLeft: theme.margins.md,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    settingDescription: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginLeft: 40,
    },
    warningCard: {
        flexDirection: 'row',
        backgroundColor: '#fffbeb',
        borderRadius: theme.radius.l,
        padding: theme.margins.md,
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    warningTextContainer: {
        flex: 1,
        marginLeft: theme.margins.sm,
    },
    warningTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#92400e',
    },
    warningDescription: {
        fontSize: 13,
        color: '#b45309',
        marginTop: 2,
    },
    warningLink: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        marginTop: 6,
        textDecorationLine: 'underline',
    },
    advancedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: theme.margins.lg,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    advancedButtonText: {
        fontSize: 15,
        color: theme.colors.typographySecondary,
    },
}));
