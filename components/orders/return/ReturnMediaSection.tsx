import { IconSymbol } from '@/components/ui/Icon';
import {
    RETURN_MEDIA_LIMITS,
    type ReturnMediaItem,
} from '@/types/order/return';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ReturnMediaSectionProps {
    mediaItems: ReturnMediaItem[];
    hasUploadingMedia?: boolean;
    onAddImages: () => void;
    onAddVideo: () => void;
    onRemoveItem: (id: string) => void;
    onRetryItem: (id: string) => void;
    onPreviewVideo: (item: ReturnMediaItem) => void;
}

export const ReturnMediaSection: React.FC<ReturnMediaSectionProps> = ({
    mediaItems,
    hasUploadingMedia = false,
    onAddImages,
    onAddVideo,
    onRemoveItem,
    onRetryItem,
    onPreviewVideo,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order', 'common']);
    const styles = stylesheet;

    const imageCount = useMemo(() => (
        mediaItems.filter((item) => item.type === 'IMAGE').length
    ), [mediaItems]);

    const videoCount = useMemo(() => (
        mediaItems.filter((item) => item.type === 'VIDEO').length
    ), [mediaItems]);

    const hasMedia = mediaItems.length > 0;

    const formatDurationLabel = (duration?: number) => {
        if (typeof duration !== 'number' || duration <= 0) {
            return null;
        }

        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.label}>{t('returnRequest.mediaLabel')}</Text>
                <Text style={styles.hint}>
                    {t('returnRequest.mediaHint', {
                        maxImages: RETURN_MEDIA_LIMITS.MAX_IMAGES,
                        maxVideos: RETURN_MEDIA_LIMITS.MAX_VIDEOS,
                    })}
                </Text>
                {hasUploadingMedia && (
                    <Text style={styles.uploadingHint}>
                        {t('returnRequest.mediaUploadingHint')}
                    </Text>
                )}
            </View>

            {hasMedia ? (
                <View style={styles.previewGrid}>
                    {mediaItems.map((item) => {
                        const isVideo = item.type === 'VIDEO';
                        const isUploading = item.uploadStatus === 'pending' || item.uploadStatus === 'uploading';
                        const hasError = item.uploadStatus === 'error';
                        const videoDurationLabel = formatDurationLabel(item.duration);
                        const canPreviewVideo = isVideo && !isUploading && !hasError;

                        return (
                            <View key={item.id} style={styles.previewTile}>
                                <Pressable
                                    style={styles.previewPressable}
                                    onPress={() => {
                                        if (canPreviewVideo) {
                                            onPreviewVideo(item);
                                        }
                                    }}
                                    disabled={!canPreviewVideo}
                                >
                                    {isVideo ? (
                                        item.thumbnailSource ? (
                                            <Image
                                                source={item.thumbnailSource}
                                                style={styles.previewImage}
                                                contentFit="cover"
                                                transition={150}
                                            />
                                        ) : (
                                            <View style={styles.videoTileContent}>
                                                <View style={styles.videoTileIconWrap}>
                                                    <IconSymbol
                                                        name="videocam"
                                                        size={20}
                                                        color={theme.colors.success}
                                                    />
                                                </View>
                                                <Text style={styles.videoTileText}>
                                                    {t('returnRequest.videoBadge')}
                                                </Text>
                                            </View>
                                        )
                                    ) : (
                                        <Image
                                            source={{ uri: item.uri }}
                                            style={styles.previewImage}
                                            contentFit="cover"
                                        />
                                    )}

                                    {isVideo && (
                                        <>
                                            <View style={styles.videoOverlay}>
                                                <View style={styles.videoPlayBadge}>
                                                    <IconSymbol
                                                        name="play-fill"
                                                        size={16}
                                                        color={theme.colors.surface}
                                                    />
                                                </View>
                                            </View>
                                            <View style={styles.videoBadge}>
                                                <IconSymbol
                                                    name="play-fill"
                                                    size={12}
                                                    color={theme.colors.surface}
                                                />
                                                <Text style={styles.videoBadgeText}>
                                                    {videoDurationLabel ?? t('returnRequest.videoBadge')}
                                                </Text>
                                            </View>
                                        </>
                                    )}
                                </Pressable>

                                {isUploading && (
                                    <View style={styles.uploadOverlay}>
                                        <ActivityIndicator
                                            size="small"
                                            color={theme.colors.surface}
                                        />
                                        <Text style={styles.uploadOverlayText}>
                                            {t('returnRequest.mediaUploadingProgress', {
                                                progress: Math.max(1, Math.round(item.progress)),
                                            })}
                                        </Text>
                                    </View>
                                )}

                                {hasError && (
                                    <View style={styles.errorOverlay}>
                                        <Text style={styles.errorOverlayText}>
                                            {t('returnRequest.mediaUploadFailed')}
                                        </Text>
                                        <Pressable
                                            style={styles.retryButton}
                                            onPress={() => onRetryItem(item.id)}
                                            accessibilityRole="button"
                                        >
                                            <Text style={styles.retryButtonText}>
                                                {t('common:actions.retry')}
                                            </Text>
                                        </Pressable>
                                    </View>
                                )}

                                <Pressable
                                    style={styles.removeButton}
                                    onPress={() => onRemoveItem(item.id)}
                                    accessibilityRole="button"
                                >
                                    <IconSymbol
                                        name="close"
                                        size={12}
                                        color={theme.colors.surface}
                                    />
                                </Pressable>
                            </View>
                        );
                    })}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconWrap}>
                        <IconSymbol
                            name="camera"
                            size={20}
                            color={theme.colors.typographySecondary}
                        />
                    </View>
                    <Text style={styles.emptyTitle}>{t('returnRequest.mediaEmptyTitle')}</Text>
                    <Text style={styles.emptyHint}>{t('returnRequest.mediaEmptyHint')}</Text>
                </View>
            )}

            <View style={styles.actionsRow}>
                <Pressable
                    style={({ pressed }) => [
                        styles.actionCard,
                        pressed && styles.actionCardPressed,
                    ]}
                    onPress={onAddImages}
                    accessibilityRole="button"
                    accessibilityLabel={t('returnRequest.addPhotos')}
                >
                    <View style={styles.actionIconWrap}>
                        <IconSymbol
                            name="camera"
                            size={20}
                            color={theme.colors.accent}
                        />
                    </View>
                    <View style={styles.actionTextWrap}>
                        <Text style={styles.actionTitle}>{t('returnRequest.addPhotos')}</Text>
                        <Text style={styles.actionMeta}>
                            {t('returnRequest.photoCount', {
                                count: imageCount,
                                max: RETURN_MEDIA_LIMITS.MAX_IMAGES,
                            })}
                        </Text>
                    </View>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.actionCard,
                        pressed && styles.actionCardPressed,
                    ]}
                    onPress={onAddVideo}
                    accessibilityRole="button"
                    accessibilityLabel={t('returnRequest.addVideos')}
                >
                    <View style={[styles.actionIconWrap, styles.videoIconWrap]}>
                        <IconSymbol
                            name="videocam"
                            size={20}
                            color={theme.colors.success}
                        />
                    </View>
                    <View style={styles.actionTextWrap}>
                        <Text style={styles.actionTitle}>{t('returnRequest.addVideos')}</Text>
                        <Text style={styles.actionMeta}>
                            {t('returnRequest.videoCount', {
                                count: videoCount,
                                max: RETURN_MEDIA_LIMITS.MAX_VIDEOS,
                            })}
                        </Text>
                    </View>
                </Pressable>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        gap: theme.margins.sm,
    },
    headerRow: {
        gap: theme.margins.xs,
    },
    label: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.typography,
    },
    hint: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
    },
    uploadingHint: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.accent,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.xs,
        minHeight: 120,
        paddingHorizontal: theme.margins.md,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: theme.colors.borderMuted,
        backgroundColor: theme.colors.backgroundNewInput,
    },
    emptyIconWrap: {
        width: 40,
        height: 40,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
    },
    emptyTitle: {
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.typography,
    },
    emptyHint: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    actionsRow: {
        gap: theme.margins.sm,
    },
    actionCard: {
        minHeight: 68,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    actionCardPressed: {
        backgroundColor: theme.colors.backgroundNewInput,
    },
    actionIconWrap: {
        width: 40,
        height: 40,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.accentSoft,
    },
    videoIconWrap: {
        backgroundColor: theme.colors.successSoft,
    },
    actionTextWrap: {
        flex: 1,
        gap: 2,
    },
    actionTitle: {
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.typography,
    },
    actionMeta: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
    },
    previewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
    },
    previewTile: {
        width: 84,
        height: 84,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        backgroundColor: theme.colors.backgroundNewInput,
        position: 'relative',
    },
    previewPressable: {
        flex: 1,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(18, 18, 18, 0.14)',
    },
    videoPlayBadge: {
        width: 28,
        height: 28,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.52)',
    },
    uploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.xs,
        backgroundColor: 'rgba(18, 18, 18, 0.56)',
        zIndex: 2,
    },
    uploadOverlayText: {
        fontSize: theme.fontSizes.xsm,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.surface,
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.xs,
        paddingHorizontal: theme.margins.xs,
        backgroundColor: 'rgba(18, 18, 18, 0.62)',
        zIndex: 2,
    },
    errorOverlayText: {
        fontSize: theme.fontSizes.xsm,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.surface,
        textAlign: 'center',
    },
    retryButton: {
        minHeight: 26,
        paddingHorizontal: theme.margins.sm,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
    },
    retryButtonText: {
        fontSize: theme.fontSizes.xsm,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.typography,
    },
    videoTileContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.xs,
        backgroundColor: theme.colors.successSoft,
    },
    videoTileIconWrap: {
        width: 32,
        height: 32,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
    },
    videoTileText: {
        fontSize: theme.fontSizes.xsm,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.typography,
    },
    videoBadge: {
        position: 'absolute',
        left: theme.margins.xs,
        bottom: theme.margins.xs,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.inkBlack,
    },
    videoBadgeText: {
        fontSize: theme.fontSizes.xsm,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.surface,
    },
    removeButton: {
        position: 'absolute',
        top: theme.margins.xs,
        right: theme.margins.xs,
        width: 20,
        height: 20,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(18, 18, 18, 0.65)',
        zIndex: 3,
    },
}));
