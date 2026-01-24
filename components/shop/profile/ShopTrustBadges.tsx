/**
 * ==============================================
 * SHOP TRUST BADGES - Certifications & Achievements
 * ==============================================
 */

import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import type { ShopTrustBadge } from '@/types/shop';
import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopTrustBadgesProps {
    badges: ShopTrustBadge[];
    title?: string;
}

export const ShopTrustBadges = memo(({ badges, title = 'Chứng nhận & Uy tín' }: ShopTrustBadgesProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    if (badges.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.badgesGrid}>
                {badges.map((badge) => (
                    <View key={badge.id} style={styles.badgeItem}>
                        <View style={styles.badgeIconContainer}>
                            <IconSymbol
                                name={badge.icon as IconSymbolName}
                                size={24}
                                color={theme.colors.primary}
                            />
                        </View>
                        <Text style={styles.badgeLabel} numberOfLines={2}>
                            {badge.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
});

ShopTrustBadges.displayName = 'ShopTrustBadges';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.md,
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
    },
    badgeItem: {
        width: '30%',
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
    },
    badgeIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.margins.xs,
    },
    badgeLabel: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
}));

export default ShopTrustBadges;
