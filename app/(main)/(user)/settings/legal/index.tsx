import { SettingsHeader, SettingsItem, SettingsSection } from '@/components/settings';
import { LEGAL_URLS } from '@/constants/legal';
import { ROUTES } from '@/constants/routes';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { Navigator } from '@/utils/navigation';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

interface PolicyItem {
    id: string;
    /** Translation key for label */
    labelKey: string;
    /** Fallback label */
    fallbackLabel: string;
    url: string;
    icon: string;
    /** true = open in-app WebView (own domain), false = open in-app browser (external) */
    isInternal: boolean;
    /** Section group */
    group: 'mandatory' | 'operational';
}

/**
 * Legal Policies Screen
 */
export default function LegalPoliciesScreen() {
    useNavigationUnlockOnFocus();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('profile');
    const styles = stylesheet;

    const mandatoryItems: PolicyItem[] = useMemo(() => [
        {
            id: 'regulations',
            labelKey: 'menu.legal_regulations',
            fallbackLabel: 'Quy chế hoạt động sàn TMĐT',
            url: LEGAL_URLS.MARKETPLACE_REGULATIONS,
            icon: 'article',
            isInternal: true,
            group: 'mandatory',
        },
        {
            id: 'privacy',
            labelKey: 'menu.legal_privacy',
            fallbackLabel: 'Chính sách bảo mật',
            url: LEGAL_URLS.PRIVACY,
            icon: 'policy',
            isInternal: true,
            group: 'mandatory',
        },
        {
            id: 'tos',
            labelKey: 'menu.legal_tos',
            fallbackLabel: 'Điều khoản sử dụng',
            url: LEGAL_URLS.TOS,
            icon: 'description',
            isInternal: true,
            group: 'mandatory',
        },
        {
            id: 'return',
            labelKey: 'menu.legal_return',
            fallbackLabel: 'Chính sách đổi trả & hoàn tiền',
            url: LEGAL_URLS.RETURN,
            icon: 'settings-backup-restore',
            isInternal: true,
            group: 'mandatory',
        },
    ], []);

    // Operational policies ───
    const operationalItems: PolicyItem[] = useMemo(() => [
        {
            id: 'shipping',
            labelKey: 'menu.legal_shipping',
            fallbackLabel: 'Chính sách vận chuyển',
            url: LEGAL_URLS.SHIPPING,
            icon: 'local-shipping',
            isInternal: true,
            group: 'operational',
        },
        {
            id: 'payment',
            labelKey: 'menu.legal_payment',
            fallbackLabel: 'Chính sách thanh toán',
            url: LEGAL_URLS.PAYMENT,
            icon: 'card',
            isInternal: true,
            group: 'operational',
        },
        {
            id: 'prohibited',
            labelKey: 'menu.legal_prohibited',
            fallbackLabel: 'Sản phẩm cấm & hạn chế',
            url: LEGAL_URLS.PROHIBITED_ITEMS,
            icon: 'ban',
            isInternal: true,
            group: 'operational',
        },
        {
            id: 'warranty',
            labelKey: 'menu.legal_warranty',
            fallbackLabel: 'Chính sách bảo hành',
            url: LEGAL_URLS.WARRANTY,
            icon: 'verified-shield',
            isInternal: true,
            group: 'operational',
        },
    ], []);

    // Internal: open in-app WebView (native feel, no address bar)
    const openInWebView = useCallback((item: PolicyItem) => {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const label = t(item.labelKey as any);
        const title = label !== item.labelKey ? label : item.fallbackLabel;
        Navigator.push({
            pathname: ROUTES.SETTINGS.LEGAL_DETAIL,
            params: {
                slug: item.id,
                url: item.url,
                title,
            },
        } as never);
    }, [t]);

    // External: open SFSafariViewController / Custom Tabs (in-app browser)
    const openInBrowser = useCallback(async (url: string) => {
        await WebBrowser.openBrowserAsync(url, {
            // iOS: SFSafariViewController
            // Android: Custom Tabs
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
            controlsColor: '#6366f1',
        });
    }, []);

    // Handle item press
    const handleItemPress = useCallback((item: PolicyItem) => {
        if (item.isInternal) {
            openInWebView(item);
        } else {
            openInBrowser(item.url);
        }
    }, [openInWebView, openInBrowser]);

    // Render a section of policy items
    const renderItems = (items: PolicyItem[]) =>
        items.map((item, index) => {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            const label = t(item.labelKey as any);
            const displayLabel = label !== item.labelKey ? label : item.fallbackLabel;

            return (
                <SettingsItem
                    key={item.id}
                    item={{
                        id: item.id,
                        type: 'link',
                        label: displayLabel,
                        icon: item.icon,
                        route: item.url,
                        subtitle: item.isInternal ? undefined : 'Mở link ngoài',
                    }}
                    onPress={() => handleItemPress(item)}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                />
            );
        });
    return (
        <View style={styles.container}>
            <SettingsHeader
                title={t('menu.legal_policies')}
                showHelpButton={false}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: insets.bottom + 20 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Bắt buộc theo pháp luật VN + Store Review */}
                <SettingsSection title="Tài liệu pháp lý bắt buộc">
                    {renderItems(mandatoryItems)}
                </SettingsSection>

                {/* Cần thiết cho vận hành */}
                <SettingsSection title="Chính sách vận hành">
                    {renderItems(operationalItems)}
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
