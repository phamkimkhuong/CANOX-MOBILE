/**
 * ==============================================
 * QUICK MEDIA GALLERY
 * ==============================================
 * Horizontal scroll view of review images/videos
 * Allows quick preview of all media from reviews
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ProductReviewMediaUI, ProductReviewUI } from '@/types/review/productReview';
import { Image } from 'expo-image';
import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface QuickMediaGalleryProps {
    reviews: ProductReviewUI[];
    onMediaPress: (allMedia: ProductReviewMediaUI[], startIndex: number) => void;
    onViewAllPress?: () => void;
    maxVisible?: number;
}

interface MediaThumbnailProps {
    media: ProductReviewMediaUI;
    onPress: () => void;
    isLast?: boolean;
    remainingCount?: number;
}

// ============================================
// SUB-COMPONENTS
// ============================================

const MediaThumbnail = memo<MediaThumbnailProps>(({
    media,
    onPress,
    isLast,
    remainingCount,
}) => {
    return (
        <Pressable style={thumbnailStyles.container} onPress={onPress}>
            <Image
                source={{ uri: media.thumbnailUrl || media.url }}
                style={thumbnailStyles.image}
                contentFit="cover"
                placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
                transition={200}
            />

            {/* Video indicator */}
            {media.type === 'VIDEO' && (
                <View style={thumbnailStyles.videoOverlay}>
                    <IconSymbol name="play-fill" size={20} color="#FFFFFF" />
                </View>
            )}

            {/* Remaining count overlay */}
            {isLast && remainingCount && remainingCount > 0 && (
                <View style={thumbnailStyles.remainingOverlay}>
                    <Text style={thumbnailStyles.remainingText}>+{remainingCount}</Text>
                </View>
            )}
        </Pressable>
    );
});

MediaThumbnail.displayName = 'MediaThumbnail';

const thumbnailStyles = StyleSheet.create((theme) => ({
    container: {
        width: 72,
        height: 72,
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
    remainingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    remainingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
}));

// ============================================
// MAIN COMPONENT
// ============================================

export const QuickMediaGallery = memo<QuickMediaGalleryProps>(({
    reviews,
    onMediaPress,
    onViewAllPress,
    maxVisible = 10,
}) => {
    const { theme } = useUnistyles();

    // Flatten all media from reviews
    const allMedia = useMemo(() => {
        const mediaList: ProductReviewMediaUI[] = [];
        reviews.forEach((review) => {
            review.media.forEach((m) => {
                mediaList.push(m);
            });
        });
        return mediaList;
    }, [reviews]);

    // Calculate visible media and remaining count
    const visibleMedia = allMedia.slice(0, maxVisible);
    const remainingCount = allMedia.length - maxVisible;

    const handleMediaPress = useCallback((index: number) => {
        onMediaPress(allMedia, index);
    }, [allMedia, onMediaPress]);

    // Don't render if no media
    if (allMedia.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <IconSymbol name="camera" size={16} color={theme.colors.typography} />
                    <Text style={styles.title}>Hình ảnh từ người mua</Text>
                    <Text style={styles.count}>({allMedia.length})</Text>
                </View>
                {onViewAllPress && allMedia.length > maxVisible && (
                    <Pressable style={styles.viewAllButton} onPress={onViewAllPress}>
                        <Text style={styles.viewAllText}>Xem tất cả</Text>
                        <IconSymbol name="chevron-right" size={14} color={theme.colors.primary} />
                    </Pressable>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {visibleMedia.map((media, index) => (
                    <MediaThumbnail
                        key={media.id}
                        media={media}
                        onPress={() => handleMediaPress(index)}
                        isLast={index === visibleMedia.length - 1}
                        remainingCount={index === visibleMedia.length - 1 ? remainingCount : undefined}
                    />
                ))}
            </ScrollView>
        </View>
    );
});

QuickMediaGallery.displayName = 'QuickMediaGallery';

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.smd,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    count: {
        fontSize: 13,
        color: theme.colors.secondary,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: 8,
    },
}));
