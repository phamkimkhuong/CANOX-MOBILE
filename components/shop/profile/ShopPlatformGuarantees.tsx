/**
 * ==============================================
 * SHOP PLATFORM GUARANTEES - For new shops
 * ==============================================
 *
 * Shows platform-level guarantees when shop has no profile data
 */

import { IconSymbol } from '@/components/ui/Icon';
import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopPlatformGuaranteesProps {
    shopName: string;
}

const PLATFORM_GUARANTEES = [
    {
        id: 'payment',
        icon: 'shield-checkmark-outline',
        title: 'Thanh toán an toàn',
        description: 'Bảo vệ 100% khi thanh toán qua nền tảng',
    },
    {
        id: 'return',
        icon: 'refresh-outline',
        title: 'Đổi trả dễ dàng',
        description: 'Hoàn tiền trong 7 ngày nếu không hài lòng',
    },
    {
        id: 'authentic',
        icon: 'checkmark-circle-outline',
        title: 'Sản phẩm chất lượng',
        description: 'Kiểm duyệt nghiêm ngặt trước khi bán',
    },
    {
        id: 'support',
        icon: 'headset-outline',
        title: 'Hỗ trợ 24/7',
        description: 'Đội ngũ CSKH luôn sẵn sàng hỗ trợ',
    },
];

export const ShopPlatformGuarantees = memo(({ shopName }: ShopPlatformGuaranteesProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <IconSymbol name="shield" size={24} color={theme.colors.primary} />
                <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>Mua sắm an tâm</Text>
                    <Text style={styles.headerSubtitle}>
                        Được bảo vệ bởi chính sách của nền tảng
                    </Text>
                </View>
            </View>

            {/* Guarantees list */}
            <View style={styles.guaranteesList}>
                {PLATFORM_GUARANTEES.map((item) => (
                    <View key={item.id} style={styles.guaranteeItem}>
                        <View style={styles.iconContainer}>
                            <IconSymbol
                                name={item.icon as keyof typeof IconSymbol}
                                size={20}
                                color={theme.colors.primary}
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.guaranteeTitle}>{item.title}</Text>
                            <Text style={styles.guaranteeDescription}>
                                {item.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* CTA */}
            <View style={styles.ctaContainer}>
                <Text style={styles.ctaText}>
                    Khám phá sản phẩm của {shopName} ngay!
                </Text>
            </View>
        </View>
    );
});

ShopPlatformGuarantees.displayName = 'ShopPlatformGuarantees';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        marginBottom: theme.margins.lg,
        paddingBottom: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    headerSubtitle: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    guaranteesList: {
        gap: theme.margins.md,
    },
    guaranteeItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.margins.sm,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    guaranteeTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    guaranteeDescription: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    ctaContainer: {
        marginTop: theme.margins.lg,
        paddingTop: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        alignItems: 'center',
    },
    ctaText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
}));

export default ShopPlatformGuarantees;
