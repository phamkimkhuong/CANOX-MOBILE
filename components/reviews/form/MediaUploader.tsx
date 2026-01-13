/**
 * ==============================================
 * MEDIA UPLOADER - Photo/Video Picker Grid
 * ==============================================
 * Grid layout for uploading images and videos
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ReviewMediaItem } from '@/types/review';
import { REVIEW_MEDIA_LIMITS } from '@/utils/adapter/review/reviewIncentives';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { MediaThumbnail } from './MediaThumbnail';

interface MediaUploaderProps {
    /** Current media items */
    mediaItems: ReviewMediaItem[];
    /** Callback to pick images */
    onPickImages: () => void;
    /** Callback to pick video */
    onPickVideo: () => void;
    /** Callback to remove item */
    onRemove: (id: string) => void;
    /** Callback to retry failed upload */
    onRetry: (id: string) => void;
    /** Current image count */
    imageCount: number;
    /** Current video count */
    videoCount: number;
}

const THUMBNAIL_SIZE = 80;

/**
 * MediaUploader - Grid of media items with add buttons
 */
export const MediaUploader: React.FC<MediaUploaderProps> = ({
    mediaItems,
    onPickImages,
    onPickVideo,
    onRemove,
    onRetry,
    imageCount,
    videoCount,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const canAddImages = imageCount < REVIEW_MEDIA_LIMITS.MAX_IMAGES;
    const canAddVideo = videoCount < REVIEW_MEDIA_LIMITS.MAX_VIDEOS;
    const canAddMore = canAddImages || canAddVideo;

    return (
        <View style={styles.container}>
            {/* Hint text */}
            <Text style={styles.hint}>
                Thêm tối đa {REVIEW_MEDIA_LIMITS.MAX_IMAGES} ảnh & {REVIEW_MEDIA_LIMITS.MAX_VIDEOS} video
            </Text>

            {/* Media grid */}
            <View style={styles.grid}>
                {/* Existing media items */}
                {mediaItems.map((item) => (
                    <MediaThumbnail
                        key={item.id}
                        item={item}
                        onRemove={() => onRemove(item.id)}
                        onRetry={() => onRetry(item.id)}
                        size={THUMBNAIL_SIZE}
                    />
                ))}

                {/* Add image button */}
                {canAddImages && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.addButton,
                            pressed && styles.addButtonPressed,
                        ]}
                        onPress={onPickImages}
                    >
                        <IconSymbol
                            name="camera"
                            size={24}
                            color={theme.colors.primary}
                        />
                        <Text style={styles.addButtonText}>Ảnh</Text>
                        <Text style={styles.countText}>
                            {imageCount}/{REVIEW_MEDIA_LIMITS.MAX_IMAGES}
                        </Text>
                    </Pressable>
                )}

                {/* Add video button */}
                {canAddVideo && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.addButton,
                            pressed && styles.addButtonPressed,
                        ]}
                        onPress={onPickVideo}
                    >
                        <IconSymbol
                            name="videocam"
                            size={24}
                            color={theme.colors.primary}
                        />
                        <Text style={styles.addButtonText}>Video</Text>
                        <Text style={styles.countText}>
                            {videoCount}/{REVIEW_MEDIA_LIMITS.MAX_VIDEOS}
                        </Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        gap: theme.margins.sm,
    },
    hint: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
    },
    addButton: {
        width: THUMBNAIL_SIZE,
        height: THUMBNAIL_SIZE,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
    },
    addButtonPressed: {
        backgroundColor: theme.colors.primarySoft,
    },
    addButtonText: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.colors.primary,
    },
    countText: {
        fontSize: 10,
        color: theme.colors.secondary,
    },
}));

export default MediaUploader;
