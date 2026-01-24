/**
 * ==============================================
 * SHOP COMMITMENTS - Promises & Guarantees
 * ==============================================
 */

import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import type { ShopCommitment } from '@/types/shop';
import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopCommitmentsProps {
    commitments: ShopCommitment[];
    title?: string;
}

export const ShopCommitments = memo(({
    commitments,
    title = 'Cam kết của Shop'
}: ShopCommitmentsProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    if (commitments.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.commitmentsList}>
                {commitments.map((item) => (
                    <View key={item.id} style={styles.commitmentItem}>
                        <View style={styles.iconContainer}>
                            <IconSymbol
                                name={item.icon as IconSymbolName}
                                size={20}
                                color={theme.colors.success}
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.commitmentTitle}>{item.title}</Text>
                            <Text style={styles.commitmentDescription} numberOfLines={2}>
                                {item.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
});

ShopCommitments.displayName = 'ShopCommitments';

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
    commitmentsList: {
        gap: theme.margins.sm,
    },
    commitmentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.margins.sm,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.success + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    commitmentTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    commitmentDescription: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
}));

export default ShopCommitments;
