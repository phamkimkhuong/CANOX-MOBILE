/**
 * ==============================================
 * SHOP BUSINESS INFO - Verification Details
 * ==============================================
 *
 * For 'verified' type shops - shows business registration info
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ShopBusinessInfo as BusinessInfo } from '@/types/shop';
import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopBusinessInfoProps {
    info: BusinessInfo;
    title?: string;
}

export const ShopBusinessInfo = memo(({
    info,
    title = 'Thông tin doanh nghiệp'
}: ShopBusinessInfoProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const infoItems = [
        { label: 'Tên doanh nghiệp', value: info.businessName },
        { label: 'Loại hình', value: info.businessType },
        { label: 'Mã số ĐKKD', value: info.registrationNumber },
        { label: 'Mã số thuế', value: info.taxId },
        { label: 'Địa chỉ', value: info.address },
    ].filter(item => item.value);

    if (infoItems.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <IconSymbol name="verified" size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>

            <View style={styles.infoList}>
                {infoItems.map((item, index) => (
                    <View key={index} style={styles.infoItem}>
                        <Text style={styles.infoLabel}>{item.label}</Text>
                        <Text style={styles.infoValue}>{item.value}</Text>
                    </View>
                ))}
            </View>

            {info.verifiedAt && (
                <View style={styles.verifiedBadge}>
                    <IconSymbol name="check-circle" size={14} color={theme.colors.success} />
                    <Text style={styles.verifiedText}>
                        Xác minh ngày {info.verifiedAt}
                    </Text>
                </View>
            )}
        </View>
    );
});

ShopBusinessInfo.displayName = 'ShopBusinessInfo';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
        marginBottom: theme.margins.md,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    infoList: {
        gap: theme.margins.sm,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    infoLabel: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        flex: 1,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typography,
        flex: 1.5,
        textAlign: 'right',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: theme.margins.md,
        paddingTop: theme.margins.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    verifiedText: {
        fontSize: 12,
        color: theme.colors.success,
    },
}));

export default ShopBusinessInfo;
