import { SettingsHeader, SettingsItem, SettingsSection } from '@/components/settings';
import { LEGAL_URLS } from '@/constants/legal';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

/**
 * Legal Policies Screen
 * Lists all legal documents that open via WebView/Browser
 */
export default function LegalPoliciesScreen() {
    useNavigationUnlockOnFocus();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('profile');
    const styles = stylesheet;

    const handleOpenURL = useCallback(async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        }
    }, []);

    const policyItems = [
        {
            id: 'tos',
            label: t('menu.legal_tos'),
            url: LEGAL_URLS.TOS,
            icon: 'description',
        },
        {
            id: 'privacy',
            label: t('menu.legal_privacy'),
            url: LEGAL_URLS.PRIVACY,
            icon: 'policy',
        },
        {
            id: 'buying',
            label: t('menu.legal_buying'),
            url: LEGAL_URLS.BUYING,
            icon: 'shopping-bag',
        },
        {
            id: 'shipping',
            label: t('menu.legal_shipping'),
            url: LEGAL_URLS.SHIPPING,
            icon: 'local-shipping',
        },
        {
            id: 'return',
            label: t('menu.legal_return'),
            url: LEGAL_URLS.RETURN,
            icon: 'settings-backup-restore',
        },
        {
            id: 'dispute',
            label: t('menu.legal_dispute'),
            url: LEGAL_URLS.DISPUTE,
            icon: 'gavel',
        },
        {
            id: 'regulations',
            label: 'Quy chế hoạt động sàn TMĐT',
            url: LEGAL_URLS.MARKETPLACE_REGULATIONS,
            icon: 'article',
        },
        {
            id: 'seller',
            label: t('menu.legal_seller'),
            url: LEGAL_URLS.SELLER_TERMS,
            icon: 'store',
        },
    ];

    return (
        <View style={styles.container}>
            <SettingsHeader title="Chính sách & Điều khoản" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: insets.bottom + 20 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <SettingsSection title="Tài liệu pháp lý">
                    {policyItems.map((item, index) => (
                        <SettingsItem
                            key={item.id}
                            item={{
                                id: item.id,
                                type: 'link',
                                label: item.label,
                                icon: item.icon as any,
                                iconColor: 'slate',
                                route: item.url,
                            }}
                            onPress={() => handleOpenURL(item.url)}
                            isFirst={index === 0}
                            isLast={index === policyItems.length - 1}
                        />
                    ))}
                </SettingsSection>
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
}));
