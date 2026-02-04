/**
 * ==============================================
 * REVIEW PRODUCT SNIPPET - Mini Product Card
 * ==============================================
 * Compact product info display for review screens
 */

import type { PendingReviewItem } from '@/types/review';
import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface ReviewProductSnippetProps {
    /** Product name */
    productName: string;
    /** Product image URL */
    imageUrl: string;
    /** Variant attributes (e.g., "Màu: Đen, Size: L") */
    variantAttributes?: string | null;
    /** Formatted Price */
    price?: string;
    /** Shop Name */
    shopName?: string;
    /** Shop Logo */
    shopLogo?: string | null;
    /** Order number */
    orderNumber?: string;
    /** Show order info */
    showOrderInfo?: boolean;
}

/**
 * ReviewProductSnippet - Compact product display
 */
export const ReviewProductSnippet: React.FC<ReviewProductSnippetProps> = ({
    productName,
    imageUrl,
    variantAttributes,
    price,
    shopName,
    shopLogo: _shopLogo,
    orderNumber,
    showOrderInfo = false,
}) => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Product Image */}
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    contentFit="cover"
                    placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
                />
            </View>

            {/* Product Info */}
            <View style={styles.info}>
                <Text style={styles.productName} numberOfLines={2}>
                    {productName}
                </Text>

                {variantAttributes && (
                    <Text style={styles.variant} numberOfLines={1}>
                        {variantAttributes}
                    </Text>
                )}

                <View style={styles.metaRow}>
                    {price && (
                        <Text style={styles.price}>{price}</Text>
                    )}
                    {shopName && (
                        <Text style={styles.shopName} numberOfLines={1}>
                            • {shopName}
                        </Text>
                    )}
                </View>

                {showOrderInfo && orderNumber && (
                    <Text style={styles.orderNumber}>
                        Đơn hàng: #{orderNumber}
                    </Text>
                )}
            </View>
        </View>
    );
};

/**
 * Props from PendingReviewItem
 */
export const ReviewProductSnippetFromItem: React.FC<{
    item: PendingReviewItem;
    showOrderInfo?: boolean;
}> = ({ item, showOrderInfo }) => (
    <ReviewProductSnippet
        productName={item.productName}
        imageUrl={item.imageUrl}
        variantAttributes={item.variantAttributes}
        price={item.formattedPrice}
        shopName={item.shopName}
        shopLogo={item.shopLogo}
        orderNumber={item.orderNumber}
        showOrderInfo={showOrderInfo}
    />
);

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        gap: theme.margins.smd,
        padding: theme.margins.smd,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.m,
    },
    imageWrapper: {
        width: 64,
        height: 64,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        backgroundColor: theme.colors.secondaryLight,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    info: {
        flex: 1,
        justifyContent: 'center',
        gap: 2,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        lineHeight: 18,
    },
    variant: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    price: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.newPrimary,
    },
    shopName: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        flex: 1,
    },
    orderNumber: {
        fontSize: 11,
        color: theme.colors.secondary,
        marginTop: 2,
    },
}));

export default ReviewProductSnippet;
