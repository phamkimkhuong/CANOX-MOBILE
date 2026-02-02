/**
 * ==============================================
 * SHOP LEGAL INFO - Company & Business Info
 * ==============================================
 *
 * Displays legal/business information for Official/Mall shops:
 * - Company name
 * - Tax ID
 * - Registration number
 * - Headquarters address
 * - Founded year
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ShopLegal } from '@/types/shop/shopIdentity';
import React, { memo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopLegalInfoProps {
    legal: ShopLegal;
}

export const ShopLegalInfo = memo(({ legal }: ShopLegalInfoProps) => {
    const { theme } = useUnistyles();
    const [expanded, setExpanded] = useState(false);

    // Calculate years of operation
    const yearsInOperation = legal.foundedYear
        ? new Date().getFullYear() - legal.foundedYear
        : null;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <IconSymbol name="business" size={20} color={theme.colors.primary} />
                    <Text style={styles.title}>Thông tin doanh nghiệp</Text>
                </View>
                {(legal.isOfficial || legal.isMall) && (
                    <View style={styles.badge}>
                        <IconSymbol name="verified" size={14} color="#FFF" />
                        <Text style={styles.badgeText}>
                            {legal.isMall ? 'Mall' : 'Official'}
                        </Text>
                    </View>
                )}
            </View>

            {/* Company Name */}
            {legal.companyName && (
                <View style={styles.row}>
                    <Text style={styles.label}>Tên công ty</Text>
                    <Text style={styles.value}>{legal.companyName}</Text>
                </View>
            )}

            {/* Tax ID - Always visible for compliance */}
            {legal.taxId && (
                <View style={styles.row}>
                    <Text style={styles.label}>Mã số thuế</Text>
                    <Text style={styles.value}>{legal.taxId}</Text>
                </View>
            )}

            {/* Years in operation */}
            {yearsInOperation && yearsInOperation > 0 && (
                <View style={styles.row}>
                    <Text style={styles.label}>Thâm niên</Text>
                    <Text style={styles.value}>
                        {yearsInOperation} năm hoạt động (từ {legal.foundedYear})
                    </Text>
                </View>
            )}

            {/* Expandable details */}
            {expanded && (
                <>
                    {legal.registrationNumber && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Số ĐKKD</Text>
                            <Text style={styles.value}>{legal.registrationNumber}</Text>
                        </View>
                    )}
                    {legal.headquarters && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Trụ sở</Text>
                            <Text style={styles.value}>{legal.headquarters}</Text>
                        </View>
                    )}
                </>
            )}

            {/* Expand/Collapse button */}
            {(legal.registrationNumber || legal.headquarters) && (
                <Pressable
                    style={styles.expandButton}
                    onPress={() => setExpanded(!expanded)}
                >
                    <Text style={styles.expandText}>
                        {expanded ? 'Thu gọn' : 'Xem chi tiết'}
                    </Text>
                    <IconSymbol
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={theme.colors.primary}
                    />
                </Pressable>
            )}
        </View>
    );
});

ShopLegalInfo.displayName = 'ShopLegalInfo';

const styles = StyleSheet.create((theme) => ({
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: -0.5,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.buttonActive,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FFF',
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderMuted,
    },
    label: {
        width: 100,
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    value: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.typography,
        fontWeight: '700',
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 4,
    },
    expandText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.buttonActive,
    },
}));

export default ShopLegalInfo;
