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
        borderRadius: 24,
        padding: theme.margins.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        marginBottom: theme.margins.lg,
        paddingBottom: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderMuted,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    guaranteesList: {
        gap: 20,
    },
    guaranteeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.md,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.activeSoft,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    textContainer: {
        flex: 1,
    },
    guaranteeTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    guaranteeDescription: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        marginTop: 2,
        lineHeight: 18,
    },
    ctaContainer: {
        marginTop: theme.margins.lg,
        paddingTop: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderMuted,
        alignItems: 'center',
    },
    ctaText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.buttonActive,
    },
}));

export default ShopPlatformGuarantees;
