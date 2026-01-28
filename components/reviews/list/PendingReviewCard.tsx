/**
 * ==============================================
 * PENDING REVIEW CARD - Awaiting Review Item
 * ==============================================
 * Card for products waiting to be reviewed with
 * gamification incentive display
 */

import { IconSymbol } from '@/components/ui/Icon';
import { reviewRoutes } from '@/constants/routes';
import { PendingReviewItemUI } from '@/types/review';
import { getMaxReviewReward as getMaxReward } from '@/utils/adapter/review/reviewAdapter';
import { Navigator } from '@/utils/navigation';
import { Image } from 'expo-image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface PendingReviewCardProps {
    /** Pending review item */
    item: PendingReviewItemUI;
    /** Number of items in the same order */
    itemCount?: number;
    /** Optional callback when card is pressed */
    onPress?: () => void;
}

/**
 * PendingReviewCard - Single pending review item card
 * Shows product info with coin reward incentive
 */
export const PendingReviewCard: React.FC<PendingReviewCardProps> = ({
    item,
    itemCount,
    onPress,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation(['myReviews', 'order']);

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            Navigator.push(reviewRoutes.write(item.itemId, {
                orderId: item.orderId,
                productId: item.productId,
                productName: item.productName,
                productImage: item.imageUrl,
                variantAttributes: item.variantAttributes || undefined,
                formattedPrice: item.formattedPrice,
                orderNumber: item.orderNumber,
                shopName: item.shopName,
                shopLogo: item.shopLogo || undefined,
            }));
        }
    };

    const maxReward = getMaxReward();

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && styles.containerPressed,
            ]}
            onPress={handlePress}
        >
            {/* Order Header info inside the card */}
            <View style={styles.orderInfoRow}>
                <IconSymbol name="shippingbox" size={12} color={theme.colors.secondary} />
                <Text style={styles.orderNumberText}>
                    {t('card.orderNumber', { orderNumber: item.orderNumber })}
                </Text>
                {itemCount !== undefined && (
                    <Text style={styles.itemCountText}>
                        {t('card.productCount', { count: itemCount })}
                    </Text>
                )}
            </View>

            <View style={styles.divider} />

            <View style={styles.mainRow}>
                {/* Product Image */}
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.image}
                        contentFit="cover"
                        placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
                    />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View>
                        {/* Product Name */}
                        <Text style={styles.productName} numberOfLines={2}>
                            {item.productName}
                        </Text>

                        {/* Variant */}
                        {item.variantAttributes && (
                            <Text style={styles.variant} numberOfLines={1}>
                                {item.variantAttributes}
                            </Text>
                        )}

                        {/* Coin Incentive */}
                        <View style={styles.incentiveRow}>
                            <IconSymbol name="star.fill" size={12} color="#FFB800" />
                            <Text style={styles.incentiveText}>
                                {t('card.rewardHint', {
                                    amount: maxReward,
                                    unit: t('card.rewardCoins')
                                })}
                            </Text>
                        </View>
                    </View>

                    {/* Action Button */}
                    <View style={styles.buttonWrapper}>
                        <View style={styles.writeButton}>
                            <Text style={styles.writeButtonText}>{t('card.writeReview')}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.smd,
        marginHorizontal: theme.margins.md,
        marginVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    orderInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingBottom: 8,
    },
    orderNumberText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    itemCountText: {
        fontSize: 12,
        color: theme.colors.secondary,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: theme.margins.smd,
        opacity: 0.5,
    },
    mainRow: {
        flexDirection: 'row',
    },
    containerPressed: {
        opacity: 0.9,
        backgroundColor: theme.colors.background,
    },
    imageWrapper: {
        width: 72,
        height: 72,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        backgroundColor: theme.colors.secondaryLight,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        marginLeft: theme.margins.smd,
        justifyContent: 'space-between',
        paddingVertical: 2,
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
    incentiveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    incentiveText: {
        fontSize: 12,
        color: '#FF5722',
        fontWeight: '700',
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    writeButton: {
        backgroundColor: '#f97316',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    writeButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
}));

export default PendingReviewCard;
