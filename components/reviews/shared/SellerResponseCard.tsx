/**
 * ==============================================
 * SELLER RESPONSE CARD - Shop Response Display
 * ==============================================
 * Shows seller's response to a review
 */

import { IconSymbol } from '@/components/ui/Icon';
import { formatRelativeDate } from '@/utils/date';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SellerResponseCardProps {
    /** Response content */
    comment: string;
    /** Response date */
    date: string;
}

/**
 * SellerResponseCard - Display seller's response
 */
export const SellerResponseCard: React.FC<SellerResponseCardProps> = ({
    comment,
    date,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.iconWrapper}>
                    <IconSymbol name="storefront" size={14} color={theme.colors.primary} />
                </View>
                <Text style={styles.title}>Phản hồi của Shop</Text>
                <Text style={styles.date}>{formatRelativeDate(date)}</Text>
            </View>

            {/* Content */}
            <Text style={styles.content}>{comment}</Text>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.m,
        padding: theme.margins.smd,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        marginBottom: theme.margins.sm,
    },
    iconWrapper: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    date: {
        fontSize: 11,
        color: theme.colors.secondary,
    },
    content: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },
}));

export default SellerResponseCard;
