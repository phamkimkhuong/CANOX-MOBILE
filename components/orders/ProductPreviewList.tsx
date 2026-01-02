/**
 * ==============================================
 * PRODUCT PREVIEW LIST - Hiển thị sản phẩm rút gọn
 * ==============================================
 * Logic "Item Truncation":
 * - Nếu items <= 2: Render hết
 * - Nếu items > 2: Render item đầu + "Xem thêm X sản phẩm khác..."
 * Giúp Card ngắn gọn cho đơn hàng có nhiều sản phẩm
 */

import { IconSymbol } from '@/components/ui/Icon';
import { OrderItem } from '@/types/order/order';
import { formatCurrency } from '@/utils/format';
import { toSizedImageUrl } from '@/utils/url';
import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ProductPreviewListProps {
    items: OrderItem[];
    maxDisplay?: number;
}

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/80x80?text=No+Image';

/**
 * Single Product Item Row
 */
const ProductItemRow: React.FC<{ item: OrderItem }> = ({ item }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const imageUrl = toSizedImageUrl(
        item.imageBasePath,
        item.imageExtension,
        '_thumb'
    ) ?? PLACEHOLDER_IMAGE;

    return (
        <View style={styles.productRow}>
            {/* Product Image */}
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.productImage}
                    contentFit="cover"
                    transition={200}
                    placeholder={PLACEHOLDER_IMAGE}
                />
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {item.productName}
                </Text>
                {item.variantAttributes && (
                    <Text style={styles.variantText} numberOfLines={1}>
                        Phân loại: {item.variantAttributes}
                    </Text>
                )}
                <View style={styles.priceRow}>
                    <Text style={styles.unitPrice}>
                        {formatCurrency(item.unitPrice)}
                    </Text>
                    <Text style={styles.quantity}>x{item.quantity}</Text>
                </View>
            </View>
        </View>
    );
};

export const ProductPreviewList: React.FC<ProductPreviewListProps> = ({
    items,
    maxDisplay = 1,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Số items cần hiển thị
    const displayItems = items.slice(0, maxDisplay);
    const remainingCount = items.length - maxDisplay;

    // Lấy tên các sản phẩm còn lại để hint
    const remainingNames = items
        .slice(maxDisplay, maxDisplay + 2)
        .map((item) => item.productName.slice(0, 20))
        .join(', ');

    return (
        <View style={styles.container}>
            {/* Hiển thị các items đầu tiên */}
            {displayItems.map((item, index) => (
                <View key={item.itemId}>
                    <ProductItemRow item={item} />
                    {index < displayItems.length - 1 && (
                        <View style={styles.divider} />
                    )}
                </View>
            ))}

            {/* "Xem thêm" nếu còn items */}
            {remainingCount > 0 && (
                <View style={styles.moreItemsRow}>
                    {/* Stack ảnh nhỏ */}
                    <View style={styles.imageStack}>
                        {items.slice(maxDisplay, maxDisplay + 3).map((item, index) => {
                            const imgUrl = toSizedImageUrl(
                                item.imageBasePath,
                                item.imageExtension,
                                '_thumb'
                            ) ?? PLACEHOLDER_IMAGE;
                            return (
                                <Image
                                    key={item.itemId}
                                    source={{ uri: imgUrl }}
                                    style={[
                                        styles.stackImage,
                                        { marginLeft: index > 0 ? -12 : 0, zIndex: 3 - index },
                                    ]}
                                    contentFit="cover"
                                />
                            );
                        })}
                    </View>

                    {/* Text hint */}
                    <View style={styles.moreTextWrapper}>
                        <Text style={styles.moreText}>
                            Xem thêm {remainingCount} sản phẩm khác
                            {remainingNames && (
                                <Text style={styles.moreHint}> ({remainingNames}...)</Text>
                            )}
                        </Text>
                    </View>

                    <IconSymbol
                        name="chevron-right"
                        size={16}
                        color={theme.colors.typographySecondary}
                    />
                </View>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        paddingVertical: theme.margins.zero
    },
    productRow: {
        flexDirection: 'row',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        gap: theme.margins.smd,
    },
    imageWrapper: {
        width: 72,
        height: 72,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        backgroundColor: theme.colors.backgroundSurface,
    },
    productImage: {
        width: 72,
        height: 72,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
        lineHeight: 18,
    },
    variantText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    unitPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    quantity: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.margins.md,
        opacity: 0.5,
    },
    moreItemsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        backgroundColor: theme.colors.backgroundSurface,
        marginHorizontal: theme.margins.md,
        marginTop: theme.margins.sm,
        borderRadius: theme.radius.m,
    },
    imageStack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stackImage: {
        width: 28,
        height: 28,
        borderRadius: theme.radius.s,
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },
    moreTextWrapper: {
        flex: 1,
        marginLeft: theme.margins.sm,
    },
    moreText: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    moreHint: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        fontWeight: '400',
    },
}));
