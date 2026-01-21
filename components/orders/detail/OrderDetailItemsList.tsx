/**
 * ==============================================
 * ORDER DETAIL ITEMS LIST - Danh sách sản phẩm đầy đủ
 * ==============================================
 * Hiển thị tất cả items trong đơn hàng (không giới hạn)
 * - Tái sử dụng UI tương tự ProductPreviewList
 * - Hiển thị status "Đã đánh giá" / "Chưa đánh giá"
 */

import { IconSymbol } from '@/components/ui/Icon';
import { productRoutes } from '@/constants/routes';
import { OrderItemUI } from '@/types/order/order';
import { formatCurrency } from '@/utils/format';
import { Navigator } from '@/utils/navigation';
import { Image } from 'expo-image';
import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderItemRowProps {
    item: OrderItemUI;
    showReviewStatus?: boolean;
    onPressReview?: (item: OrderItemUI) => void;
}

const OrderItemRow: React.FC<OrderItemRowProps> = ({
    item,
    showReviewStatus = false,
    onPressReview,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const hasVariants = item.variantAttributes && item.variantAttributes.length > 0;
    const canReview = showReviewStatus && !item.reviewed;

    const handleProductPress = useCallback(() => {
        if (!item.productId) return;
        Navigator.push(productRoutes.detail(item.productId));
    }, [item.productId]);

    return (
        <View style={styles.itemContainer}>
            {/* Clickable Area: Image + Product info */}
            <TouchableOpacity
                style={styles.itemMainContent}
                onPress={handleProductPress}
                activeOpacity={0.7}
            >
                {/* Product Image */}
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImage}
                    contentFit="cover"
                    placeholder={{ blurhash: 'LGF5?xYk^6#M@-5c,1J5@[or[Q6.' }}
                    transition={200}
                />

                {/* Product Info */}
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                        {item.productName}
                    </Text>

                    {/* Variants */}
                    {hasVariants && (
                        <Text style={styles.itemVariants}>{item.variantAttributes}</Text>
                    )}

                    {/* Price & Quantity */}
                    <View style={styles.priceRow}>
                        <Text style={styles.itemPrice}>
                            {formatCurrency(item.unitPrice)}
                        </Text>
                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    </View>

                    {/* Review Status */}
                    {showReviewStatus && (
                        <View style={styles.reviewStatus}>
                            {item.reviewed ? (
                                <View style={styles.reviewedBadge}>
                                    <IconSymbol
                                        name="check-circle"
                                        size={12}
                                        color={theme.colors.success}
                                    />
                                    <Text style={styles.reviewedText}>
                                        Đã đánh giá
                                    </Text>
                                </View>
                            ) : canReview && onPressReview ? (
                                <TouchableOpacity
                                    style={styles.reviewButton}
                                    onPress={() => onPressReview(item)}
                                    activeOpacity={0.7}
                                >
                                    <IconSymbol
                                        name="star-outline"
                                        size={14}
                                        color={theme.colors.warning}
                                    />
                                    <Text style={styles.reviewButtonText}>
                                        Đánh giá
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.notReviewedText}>
                                    Chưa đánh giá
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {/* Total Column*/}
            <View style={styles.rightColumn}>
                <View style={styles.totalColumn}>
                    <Text style={styles.itemTotal}>
                        {formatCurrency(item.lineTotal)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

interface OrderDetailItemsListProps {
    items: OrderItemUI[];
    showReviewStatus?: boolean;
    onPressReview?: (item: OrderItemUI) => void;
}

export const OrderDetailItemsList: React.FC<OrderDetailItemsListProps> = ({
    items,
    showReviewStatus = false,
    onPressReview,
}) => {
    const styles = stylesheet;

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            {items.map((item, index) => (
                <React.Fragment key={item.itemId ?? item.variantId ?? item.productId ?? `order-item-${index}`}>
                    <OrderItemRow
                        item={item}
                        showReviewStatus={showReviewStatus}
                        onPressReview={onPressReview}
                    />
                    {index < items.length - 1 && (
                        <View style={styles.divider} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.sm,
    },
    itemContainer: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        flexDirection: 'row',
    },
    itemMainContent: {
        flex: 1,
        flexDirection: 'row',
    },
    itemImage: {
        width: 72,
        height: 72,
        borderRadius: theme.radius.s,
        backgroundColor: theme.colors.typographySecondary,
    },
    itemInfo: {
        flex: 1,
        marginLeft: theme.margins.smd,
        justifyContent: 'flex-start',
    },
    itemName: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typography,
        lineHeight: 18,
    },
    itemVariants: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: theme.margins.sm,
    },
    itemPrice: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    itemQuantity: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    reviewStatus: {
        marginTop: 6,
    },
    reviewedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    reviewedText: {
        fontSize: 11,
        color: theme.colors.success,
    },
    notReviewedText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
    },
    reviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radius.l,
        backgroundColor: theme.colors.warningLight,
        gap: 4,
    },
    reviewButtonText: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.colors.warning,
    },
    rightColumn: {
        marginLeft: theme.margins.sm,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 2,
    },
    totalColumn: {
        alignItems: 'flex-end',
    },
    itemTotal: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.error,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginLeft: 72 + theme.margins.md + theme.margins.smd,
        marginRight: theme.margins.md,
    },
}));
