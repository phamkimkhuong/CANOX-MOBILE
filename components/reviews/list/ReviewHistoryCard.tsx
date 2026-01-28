/**
 * ==============================================
 * REVIEW HISTORY CARD - Submitted Review Card
 * ==============================================
 * Display a user's submitted review with rating,
 * content, media preview, and seller response
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { MyReviewUI } from '@/types/review';
import { formatRelativeDate } from '@/utils/date';
import { Image } from 'expo-image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { SellerResponseCard } from '../shared/SellerResponseCard';

interface ReviewHistoryCardProps {
    /** Review data */
    review: MyReviewUI;
    /** Edit callback - if provided, card is editable */
    onEdit?: () => void;
}

/**
 * ReviewHistoryCard - Display submitted review
 */
export const ReviewHistoryCard: React.FC<ReviewHistoryCardProps> = ({
    review,
    onEdit,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation(['myReviews']);

    // Check if review can be edited (within 7 days and no seller response)
    const canEdit = !review.hasSellerResponse && review.status === 'APPROVED';

    // Generate stars
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <IconSymbol
                    key={i}
                    name={i <= review.rating ? 'star.fill' : 'star'}
                    size={14}
                    color={i <= review.rating ? '#FFB800' : '#D1D5DB'}
                />
            );
        }
        return stars;
    };

    // Get media URLs from review.media array
    const mediaUrls = review.media?.map((m) => m.url) ?? [];

    return (
        <View style={styles.container}>
            {/* Product Info Row */}
            <View style={styles.productRow}>
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: review.productImage }}
                        style={styles.image}
                        contentFit="cover"
                        placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
                    />
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {review.productName.startsWith('Product #')
                            ? t('card.productSnapshot', { id: review.productId.slice(-6) })
                            : review.productName}
                    </Text>
                    {review.variantAttributes && (
                        <Text style={styles.variant} numberOfLines={1}>
                            {review.variantAttributes}
                        </Text>
                    )}
                </View>
            </View>

            {/* Rating & Date Row */}
            <View style={styles.ratingRow}>
                <View style={styles.starsContainer}>{renderStars()}</View>
                <Text style={styles.date}>
                    {formatRelativeDate(review.createdDate)}
                </Text>
            </View>

            {/* Review Content */}
            {review.comment && (
                <Text style={styles.comment} numberOfLines={4}>
                    {review.comment}
                </Text>
            )}

            {/* Media Preview */}
            {mediaUrls.length > 0 && (
                <View style={styles.mediaGrid}>
                    {mediaUrls.slice(0, 4).map((url: string, index: number) => (
                        <View
                            key={`${url}-${index}`}
                            style={styles.mediaThumbnail}
                        >
                            <Image
                                source={{ uri: url }}
                                style={styles.mediaImage}
                                contentFit="cover"
                            />
                            {/* Show count overlay if more than 4 */}
                            {index === 3 && mediaUrls.length > 4 && (
                                <View style={styles.moreOverlay}>
                                    <Text style={styles.moreText}>
                                        +{mediaUrls.length - 4}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* Seller Response */}
            {review.sellerResponse && (
                <View style={styles.sellerResponseWrapper}>
                    <SellerResponseCard
                        comment={review.sellerResponse.comment}
                        date={review.sellerResponse.date}
                    />
                </View>
            )}

            {/* Edit Button - only if editable */}
            {canEdit && onEdit && (
                <Pressable
                    style={({ pressed }) => [
                        styles.editButton,
                        pressed && styles.editButtonPressed,
                    ]}
                    onPress={onEdit}
                >
                    <IconSymbol name="pencil" size={14} color={theme.colors.primary} />
                    <Text style={styles.editButtonText}>{t('card.editReview')}</Text>
                </Pressable>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
        marginHorizontal: theme.margins.md,
        marginVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    productRow: {
        flexDirection: 'row',
        gap: theme.margins.smd,
        marginBottom: theme.margins.smd,
    },
    imageWrapper: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.s,
        overflow: 'hidden',
        backgroundColor: theme.colors.secondaryLight,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
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
        marginTop: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.margins.sm,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    date: {
        fontSize: 12,
        color: theme.colors.secondary,
    },
    comment: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        lineHeight: 20,
        marginBottom: theme.margins.smd,
    },
    mediaGrid: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: theme.margins.smd,
    },
    mediaThumbnail: {
        width: 56,
        height: 56,
        borderRadius: theme.radius.s,
        overflow: 'hidden',
        backgroundColor: theme.colors.secondaryLight,
    },
    mediaImage: {
        width: '100%',
        height: '100%',
    },
    moreOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    sellerResponseWrapper: {
        marginTop: 4,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.smd,
        marginTop: theme.margins.smd,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: 4,
    },
    editButtonPressed: {
        opacity: 0.7,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
    },
}));

export default ReviewHistoryCard;
