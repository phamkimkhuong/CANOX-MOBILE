/**
 * ==============================================
 * PRODUCT REVIEW CARD
 * ==============================================
 * Individual review card for the All Reviews screen
 * Includes: User info, rating, variant tag, content,
 * media grid, seller response, helpful button
 */

import { IconSymbol } from '@/components/ui/Icon';
import { useIsAuthenticated } from '@/store/useAuthStore';
import type { ProductReviewMediaUI, ProductReviewUI } from '@/types/review/productReview';
import { Image } from 'expo-image';
import React, { memo, useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ============================================
// TYPES
// ============================================

interface ProductReviewCardProps {
    review: ProductReviewUI;
    onHelpfulPress?: (reviewId: string) => void;
    onMediaPress?: (media: ProductReviewMediaUI[], startIndex: number) => void;
    onUserPress?: (userId: string) => void;
}

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Star Rating Display
 */
const StarRating = memo<{ rating: number }>(({ rating }) => {
    const { theme } = useUnistyles();

    return (
        <View style={starStyles.container}>
            {[1, 2, 3, 4, 5].map((star) => (
                <IconSymbol
                    key={star}
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={12}
                    color={star <= rating ? theme.colors.warning : theme.colors.border}
                />
            ))}
        </View>
    );
});

StarRating.displayName = 'StarRating';

const starStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 2,
    },
});


/**
 * Variant Tag
 */
const VariantTag = memo<{ attributes: string }>(({ attributes }) => {
    if (!attributes) return null;

    return (
        <View style={variantStyles.container}>
            <Text style={variantStyles.text}>{attributes}</Text>
        </View>
    );
});

VariantTag.displayName = 'VariantTag';

const variantStyles = StyleSheet.create((theme) => ({
    container: {
        marginTop: 8,
    },
    text: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
}));

/**
 * Media Grid (Images + Videos)
 */
const MediaGrid = memo<{
    media: ProductReviewMediaUI[];
    onPress: (index: number) => void;
}>(({ media, onPress }) => {
    const maxVisible = 4;
    const remainingCount = media.length - maxVisible;

    if (media.length === 0) return null;

    return (
        <View style={mediaStyles.container}>
            {media.slice(0, maxVisible).map((item, index) => (
                <Pressable
                    key={item.id}
                    style={mediaStyles.item}
                    onPress={() => onPress(index)}
                >
                    <Image
                        source={{ uri: item.thumbnailUrl || item.url }}
                        style={mediaStyles.image}
                        contentFit="cover"
                        placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
                        transition={200}
                    />

                    {/* Video overlay */}
                    {item.type === 'VIDEO' && (
                        <View style={mediaStyles.videoOverlay}>
                            <IconSymbol name="play-fill" size={24} color="#FFFFFF" />
                            {item.duration && (
                                <Text style={mediaStyles.duration}>
                                    {formatDuration(item.duration)}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Remaining count overlay */}
                    {index === maxVisible - 1 && remainingCount > 0 && (
                        <View style={mediaStyles.remainingOverlay}>
                            <Text style={mediaStyles.remainingText}>+{remainingCount}</Text>
                        </View>
                    )}
                </Pressable>
            ))}
        </View>
    );
});

MediaGrid.displayName = 'MediaGrid';

const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const mediaStyles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    item: {
        width: 80,
        height: 80,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    duration: {
        bottom: 4,
        right: 4,
        fontSize: 10,
        color: '#FFFFFF',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    remainingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    remainingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
}));

/**
 * Seller Response Box
 */
const SellerResponse = memo<{
    shopName: string;
    comment: string;
    date: string;
}>(({ shopName, comment, date }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <View style={sellerStyles.container}>
            <View style={sellerStyles.header}>
                <IconSymbol name="storefront" size={14} color="#666" />
                <Text style={sellerStyles.shopName}>Phản hồi từ {shopName}</Text>
            </View>
            <Text
                style={sellerStyles.comment}
                numberOfLines={expanded ? undefined : 2}
            >
                {comment}
            </Text>
            {comment.length > 100 && (
                <Pressable onPress={() => setExpanded(!expanded)}>
                    <Text style={sellerStyles.expandButton}>
                        {expanded ? 'Thu gọn' : 'Xem thêm'}
                    </Text>
                </Pressable>
            )}
            <Text style={sellerStyles.date}>{date}</Text>
        </View>
    );
});

SellerResponse.displayName = 'SellerResponse';

const sellerStyles = StyleSheet.create((theme) => ({
    container: {
        marginTop: 12,
        padding: 12,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.m,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    shopName: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    comment: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },
    expandButton: {
        fontSize: 12,
        color: theme.colors.primary,
        marginTop: 4,
        fontWeight: '500',
    },
    date: {
        fontSize: 11,
        color: theme.colors.secondary,
        marginTop: 8,
    },
}));

/**
 * Helpful Button
 */
const HelpfulButton = memo<{
    count: number;
    isHelpful: boolean;
    onPress: () => void;
}>(({ count, isHelpful, onPress }) => {
    const { theme } = useUnistyles();

    return (
        <Pressable
            style={[helpfulStyles.container, isHelpful && helpfulStyles.containerActive]}
            onPress={onPress}
        >
            <IconSymbol
                name={isHelpful ? 'thumbs-up' : 'thumbs-up-outline'}
                size={14}
                color={isHelpful ? theme.colors.newPrimary : theme.colors.secondary}
            />
            <Text style={[helpfulStyles.text, isHelpful && helpfulStyles.textActive]}>
                Hữu ích {count > 0 ? `(${count})` : ''}
            </Text>
        </Pressable>
    );
});

HelpfulButton.displayName = 'HelpfulButton';

const helpfulStyles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radius.s,
    },
    containerActive: {
        backgroundColor: theme.colors.activeSoft,
        borderColor: theme.colors.newPrimary,
    },
    text: {
        fontSize: 11,
        color: theme.colors.secondary,
    },
    textActive: {
        color: theme.colors.newPrimary,
        fontWeight: '600',
    },
}));

// ============================================
// MAIN COMPONENT
// ============================================

export const ProductReviewCard = memo<ProductReviewCardProps>(({
    review,
    onHelpfulPress,
    onMediaPress,
    onUserPress,
}) => {
    const isAuthenticated = useIsAuthenticated();

    const handleHelpfulPress = useCallback(() => {
        onHelpfulPress?.(review.id);
    }, [review.id, onHelpfulPress]);

    const handleMediaPress = useCallback((index: number) => {
        onMediaPress?.(review.media, index);
    }, [review.media, onMediaPress]);

    const handleUserPress = useCallback(() => {
        onUserPress?.(review.userId);
    }, [review.userId, onUserPress]);

    return (
        <View style={styles.container}>
            {/* User Info Row */}
            <Pressable style={styles.userRow} onPress={handleUserPress}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    {review.userAvatar ? (
                        <Image
                            source={{ uri: review.userAvatar }}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {review.userName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                        <Text style={styles.userName}>{review.userName}</Text>
                    </View>
                    <StarRating rating={review.rating} />
                </View>

                {/* Date & Helpful */}
                <View style={styles.rightActions}>
                    {isAuthenticated && (
                        <HelpfulButton
                            count={review.helpfulCount}
                            isHelpful={review.isHelpful}
                            onPress={handleHelpfulPress}
                        />
                    )}
                    <Text style={styles.date}>{review.formattedDate}</Text>
                </View>
            </Pressable>


            {/* Variant Tag */}
            {review.hasVariantInfo && (
                <VariantTag attributes={review.variantAttributes} />
            )}

            {/* Review Content */}
            <ExpandableText text={review.comment} />

            {/* Media Grid */}
            {review.hasMedia && (
                <MediaGrid media={review.media} onPress={handleMediaPress} />
            )}

            {/* Seller Response */}
            {review.hasSellerResponse && review.sellerResponse && (
                <SellerResponse
                    shopName={review.sellerResponse.shopName}
                    comment={review.sellerResponse.comment}
                    date={review.sellerResponse.formattedDate}
                />
            )}

        </View>
    );
});

ProductReviewCard.displayName = 'ProductReviewCard';

/**
 * Expandable Text Component
 */
const ExpandableText = memo<{ text: string; maxLines?: number }>(({
    text,
    maxLines = 4
}) => {
    const [expanded, setExpanded] = useState(false);
    const [showButton, setShowButton] = useState(false);

    return (
        <View style={textStyles.container}>
            <Text
                style={textStyles.text}
                numberOfLines={expanded ? undefined : maxLines}
                onTextLayout={(e) => {
                    if (e.nativeEvent.lines.length > maxLines) {
                        setShowButton(true);
                    }
                }}
            >
                {text}
            </Text>
            {showButton && (
                <Pressable onPress={() => setExpanded(!expanded)}>
                    <Text style={textStyles.button}>
                        {expanded ? 'Thu gọn' : 'Xem thêm'}
                    </Text>
                </Pressable>
            )}
        </View>
    );
});

ExpandableText.displayName = 'ExpandableText';

const textStyles = StyleSheet.create((theme) => ({
    container: {
        marginTop: 8,
    },
    text: {
        fontSize: 14,
        color: theme.colors.typography,
        lineHeight: 20,
    },
    button: {
        fontSize: 13,
        color: theme.colors.primary,
        marginTop: 4,
        fontWeight: '500',
    },
}));

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        padding: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    userInfo: {
        flex: 1,
    },
    userNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    date: {
        fontSize: 11,
        color: theme.colors.secondary,
        marginLeft: 8,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
}));
