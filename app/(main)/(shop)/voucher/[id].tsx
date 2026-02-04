/**
 * ==============================================
 * VOUCHER DETAIL SCREEN - Chi tiết Voucher
 * ==============================================
 */

import { IconSymbol } from '@/components/ui/Icon';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { ShopVoucherUI } from '@/types/shop';
import { formatCurrency } from '@/utils/format';
import { Navigator } from '@/utils/navigation';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function VoucherDetailScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { voucherData, shopName: shopNameFromParam } = useLocalSearchParams<{

        id: string;
        voucherData: string;
        shopName?: string;
    }>();
    const insets = useSafeAreaInsets();
    const { theme } = useUnistyles();

    // Parse voucher data from params
    const voucher: ShopVoucherUI | null = useMemo(() => {
        if (!voucherData) return null;
        try {
            return JSON.parse(voucherData) as ShopVoucherUI;
        } catch {
            return null;
        }
    }, [voucherData]);

    const displayShopName = useMemo(() =>
        shopNameFromParam || voucher?.shopName || 'Shop',
        [shopNameFromParam, voucher?.shopName]
    );
    const accentColor = theme.colors.accent;
    const accentBgColor = theme.colors.accentSoft;

    // Handlers
    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleCopyCode = useCallback(async () => {
        if (!voucher?.code) return;
        await Clipboard.setStringAsync(voucher.code);
        Toast.show({
            type: 'success',
            text1: 'Đã sao chép mã voucher',
            text2: voucher.code,
        });
    }, [voucher?.code]);

    // Error state
    if (!voucher) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar barStyle="dark-content" />
                <View style={[styles.header, { paddingTop: insets.top }]}>
                    <Pressable style={styles.backButton} onPress={handleBack}>
                        <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Chi tiết Voucher</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.errorContainer}>
                    <IconSymbol name="ticket" size={64} color={theme.colors.secondary} />
                    <Text style={styles.errorText}>Không tìm thấy thông tin voucher</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <Pressable style={styles.backButton} onPress={handleBack}>
                    <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                </Pressable>
                <Text style={styles.headerTitle}>Chi tiết Voucher</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Card - Ticket Style */}
                <View style={styles.heroCard}>
                    {/* Scope Badge */}
                    <View style={[styles.scopeBadge, { backgroundColor: accentBgColor }]}>
                        <Text style={[styles.scopeBadgeText, { color: accentColor }]}>
                            {voucher.scopeLabel}
                        </Text>
                    </View>

                    {/* Discount Display */}
                    <Text style={[styles.discountText, { color: accentColor }]}>
                        {voucher.discountDisplay}
                    </Text>

                    {/* Title Display */}
                    <Text style={styles.titleText}>{voucher.titleDisplay}</Text>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Voucher Code Row */}
                    <View style={styles.codeRow}>
                        <View style={styles.codeInfo}>
                            <Text style={styles.codeLabel}>Mã voucher</Text>
                            <Text style={styles.codeValue}>{voucher.code}</Text>
                        </View>
                        <Pressable
                            style={[styles.copyButton, { backgroundColor: accentBgColor }]}
                            onPress={handleCopyCode}
                        >
                            <IconSymbol name="copy" size={16} color={accentColor} />
                            <Text style={[styles.copyButtonText, { color: accentColor }]}>
                                Sao chép
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Conditions Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="note" size={20} color={accentColor} />
                        <Text style={styles.sectionTitle}>Điều kiện áp dụng</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <View style={styles.conditionRow}>
                            <IconSymbol name="cash" size={18} color={theme.colors.secondary} />
                            <Text style={styles.conditionLabel}>
                                {voucher.voucherScope === 'PRODUCT' ? 'Giá trị sản phẩm tối thiểu' : 'Đơn hàng tối thiểu'}
                            </Text>
                            <Text style={styles.amountValue}>
                                {voucher.minOrderAmount > 0
                                    ? formatCurrency(voucher.minOrderAmount)
                                    : 'Không yêu cầu'}
                            </Text>
                        </View>
                        {voucher.maxDiscount > 0 && (
                            <View style={styles.conditionRow}>
                                <IconSymbol name="percent" size={18} color={theme.colors.secondary} />
                                <Text style={styles.conditionLabel}>Giảm tối đa</Text>
                                <Text style={styles.amountValue}>
                                    {formatCurrency(voucher.maxDiscount)}
                                </Text>
                            </View>
                        )}
                        <View style={styles.conditionRow}>
                            <IconSymbol name="cube" size={18} color={theme.colors.secondary} />
                            <Text style={styles.conditionLabel}>Áp dụng cho</Text>
                            <Text style={styles.conditionValue}>
                                {voucher.applyToAllProducts ? 'Tất cả sản phẩm' : 'Sản phẩm nhất định'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Validity Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="time" size={20} color={accentColor} />
                        <Text style={styles.sectionTitle}>Thời hạn sử dụng</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <View style={styles.conditionRow}>
                            <IconSymbol name="calendar" size={18} color={theme.colors.secondary} />
                            <Text style={styles.conditionLabel}>Bắt đầu</Text>
                            <Text style={styles.conditionValue}>{voucher.startDate || 'N/A'}</Text>
                        </View>
                        <View style={styles.conditionRow}>
                            <IconSymbol name="calendar" size={18} color={theme.colors.secondary} />
                            <Text style={styles.conditionLabel}>Kết thúc</Text>
                            <Text style={styles.conditionValue}>{voucher.endDate || 'N/A'}</Text>
                        </View>
                        {voucher.isExpired && (
                            <View style={[styles.statusBadge, { backgroundColor: theme.colors.errorSoft }]}>
                                <Text style={[styles.statusText, { color: theme.colors.error }]}>
                                    Đã hết hạn
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Description Section */}
                {voucher.description && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <IconSymbol name="info" size={20} color={accentColor} />
                            <Text style={styles.sectionTitle}>Mô tả</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <Text style={styles.descriptionText}>{voucher.description}</Text>
                        </View>
                    </View>
                )}

                {/* Additional Info Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="store" size={20} color={accentColor} />
                        <Text style={styles.sectionTitle}>Thông tin thêm</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <View style={styles.conditionRow}>
                            <IconSymbol name="ticket" size={18} color={theme.colors.secondary} />
                            <Text style={styles.conditionLabel}>Số lượt sử dụng</Text>
                            <Text style={styles.conditionValue}>
                                {voucher.maxUsage > 0 ? `${voucher.maxUsage} lượt` : 'Không giới hạn'}
                            </Text>
                        </View>
                        <View style={styles.conditionRow}>
                            <IconSymbol name="store" size={18} color={theme.colors.secondary} />
                            <Text style={styles.conditionLabel}>Tài trợ bởi</Text>
                            <Text style={styles.conditionValue}>
                                {voucher.sponsorType === 'SHOP' ? displayShopName : 'CanoX'}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -theme.margins.sm,
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.typography,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.margins.md,
        paddingBottom: theme.margins.xxl,
    },

    // Hero Card - with accent top border for visual impact
    heroCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        padding: theme.margins.md,
        alignItems: 'center',
        borderTopWidth: 4,
        borderTopColor: theme.colors.accent,
        ...theme.shadows.medium,
    },
    scopeBadge: {
        paddingHorizontal: theme.margins.smd,
        paddingVertical: 4,
        borderRadius: theme.radius.s,
        marginBottom: theme.margins.sm,
    },
    scopeBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    discountText: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
    },
    titleText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
        textAlign: 'center',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.margins.md,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    codeInfo: {
        flex: 1,
    },
    codeLabel: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    codeValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: 1,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.sm,
        borderRadius: theme.radius.m,
    },
    copyButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // Sections
    section: {
        marginTop: theme.margins.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    sectionContent: {
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
    },
    conditionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
    },
    conditionLabel: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.typographySecondary,
        marginLeft: theme.margins.sm,
    },
    amountValue: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.error,
    },
    conditionValue: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: 4,
        borderRadius: theme.radius.s,
        marginTop: theme.margins.sm,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    descriptionText: {
        fontSize: 14,
        color: theme.colors.typography,
        lineHeight: 20,
    },

    // Error State
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.margins.md,
    },
    errorText: {
        fontSize: 15,
        color: theme.colors.typographySecondary,
    },
}));
