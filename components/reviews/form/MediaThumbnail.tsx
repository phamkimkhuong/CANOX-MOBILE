/**
 * ==============================================
 * MEDIA THUMBNAIL - Single Media Preview
 * ==============================================
 * Shows preview of uploaded image/video with status
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ReviewMediaItem } from '@/types/review';
import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface MediaThumbnailProps {
    /** Media item data */
    item: ReviewMediaItem;
    /** Callback to remove item */
    onRemove: () => void;
    /** Callback to retry failed upload */
    onRetry?: () => void;
    /** Callback when thumbnail is pressed */
    onPress?: () => void;
    /** Thumbnail size */
    size?: number;
}

/**
 * MediaThumbnail - Single media preview with upload status
 */
export const MediaThumbnail: React.FC<MediaThumbnailProps> = ({
    item,
    onRemove,
    onRetry,
    onPress,
    size = 80,
}) => {

    const styles = stylesheet;

    const isUploading = item.uploadStatus === 'uploading' || item.uploadStatus === 'pending';
    const isError = item.uploadStatus === 'error';
    const isVideo = item.type === 'VIDEO';

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Image/Video Preview */}
            <Pressable
                style={StyleSheet.absoluteFill}
                onPress={onPress}
                disabled={isUploading}
            >
                <Image
                    source={{ uri: item.uri }}
                    style={styles.image}
                    contentFit="cover"
                />
            </Pressable>

            {/* Video indicator */}
            {isVideo && (
                <View style={styles.videoIndicator}>
                    <IconSymbol name="play-fill" size={16} color="#fff" />
                    {item.duration && (
                        <Text style={styles.durationText}>
                            {Math.round(item.duration)}s
                        </Text>
                    )}
                </View>
            )}

            {/* Upload overlay */}
            {isUploading && (
                <View style={styles.uploadOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.progressText}>{item.progress}%</Text>
                </View>
            )}

            {/* Error overlay */}
            {isError && (
                <Pressable
                    style={styles.errorOverlay}
                    onPress={onRetry}
                >
                    <IconSymbol name="reload" size={20} color="#fff" />
                    <Text style={styles.errorText}>Thử lại</Text>
                </Pressable>
            )}

            {/* Remove button */}
            {!isUploading && (
                <Pressable
                    style={styles.removeButton}
                    onPress={onRemove}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <IconSymbol name="close" size={14} color="#fff" />
                </Pressable>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        backgroundColor: theme.colors.background,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    videoIndicator: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '500',
    },
    uploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    progressText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '600',
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(239,68,68,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    errorText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '500',
    },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
}));

export default MediaThumbnail;
