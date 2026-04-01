import { IconSymbol } from '@/components/ui/Icon';
import VideoPlayerModal from '@/components/ui/VideoPlayerModal';
import type { OrderStatus, OrderUI } from '@/types/order/order';
import {
    buildReturnFlowHistory,
    buildReturnFlowSummary,
    isReturnFlowStatus,
    type ReturnFlowTone,
} from '@/utils/adapter/order/orderReturnInfo';
import { getStatusDisplay } from '@/utils/adapter/order/orderStatusMapper';
import { formatDateTime } from '@/utils/date';
import { generateVideoThumbnailSource } from '@/utils/media/videoThumbnail';
import { Image } from 'expo-image';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type OrderReturnInfoUI = NonNullable<OrderUI['returnInfo']>;

interface OrderReturnInfoCardProps {
    status: OrderStatus;
    statusRaw?: string;
    returnInfo: OrderReturnInfoUI | null;
}

const getTonePalette = (
    theme: typeof import('@/constants/unistyles').lightTheme,
    tone: ReturnFlowTone
) => {
    switch (tone) {
        case 'warning':
            return {
                iconBg: theme.colors.warningLight,
                iconColor: theme.colors.warning,
                surface: theme.colors.warningSubtle,
                border: theme.colors.warningLight,
            };
        case 'danger':
            return {
                iconBg: theme.colors.errorLight,
                iconColor: theme.colors.error,
                surface: theme.colors.errorSubtle,
                border: theme.colors.errorLight,
            };
        case 'success':
            return {
                iconBg: theme.colors.successLight,
                iconColor: theme.colors.success,
                surface: theme.colors.successSubtle,
                border: theme.colors.successLight,
            };
        case 'info':
            return {
                iconBg: theme.colors.infoLight,
                iconColor: theme.colors.info,
                surface: theme.colors.infoMuted,
                border: theme.colors.infoLight,
            };
        case 'neutral':
        default:
            return {
                iconBg: theme.colors.secondaryLight,
                iconColor: theme.colors.typographySecondary,
                surface: theme.colors.backgroundNewSurface,
                border: theme.colors.secondaryLight,
            };
    }
};

const InfoBlock = memo<{
    label: string;
    value: string;
}>(({ label, value }) => {
    const styles = stylesheet;

    return (
        <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
});

InfoBlock.displayName = 'InfoBlock';

export const OrderReturnInfoCard: React.FC<OrderReturnInfoCardProps> = ({
    status,
    statusRaw,
    returnInfo,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('order');
    const insets = useSafeAreaInsets();
    const styles = stylesheet;
    const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
    const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
    const [videoThumbnails, setVideoThumbnails] = useState<Record<string, string>>({});

    const statusDisplay = useMemo(() => getStatusDisplay(status, statusRaw), [status, statusRaw]);
    const summary = useMemo(() => buildReturnFlowSummary(status, returnInfo), [status, returnInfo]);
    const history = useMemo(() => buildReturnFlowHistory(returnInfo), [returnInfo]);

    useEffect(() => {
        let cancelled = false;

        const videoUrls = returnInfo?.videoUrls ?? [];
        if (!videoUrls.length) {
            setVideoThumbnails({});
            return () => {
                cancelled = true;
            };
        }

        const loadThumbnails = async () => {
            const results = await Promise.allSettled(
                videoUrls.map(async (url) => {
                    const thumbnailSource = await generateVideoThumbnailSource(url);
                    return {
                        url,
                        thumbnailSource: typeof thumbnailSource === 'string' ? thumbnailSource : null,
                    };
                })
            );

            if (cancelled) {
                return;
            }

            const nextMap: Record<string, string> = {};
            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value.thumbnailSource) {
                    nextMap[result.value.url] = result.value.thumbnailSource;
                }
            });
            setVideoThumbnails(nextMap);
        };

        loadThumbnails();

        return () => {
            cancelled = true;
        };
    }, [returnInfo?.videoUrls]);

    if (!returnInfo || !summary || !isReturnFlowStatus(status)) {
        return null;
    }

    const palette = getTonePalette(theme, summary.tone);
    const carrierText = returnInfo.carrier || null;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionEyebrow}>{t('detail.returnFlow.title')}</Text>
                <View style={[styles.statusBadge, styles.dynamicStatusBadge(statusDisplay.bgColor, statusDisplay.color)]}>
                    <Text style={[styles.statusBadgeText, styles.dynamicStatusBadgeText(statusDisplay.color)]}>
                        {statusDisplay.label}
                    </Text>
                </View>
            </View>

            <View style={[styles.summaryCard, styles.dynamicSummaryCard(palette.surface, palette.border)]}>
                <View style={[styles.summaryIconWrap, styles.dynamicSummaryIconWrap(palette.iconBg)]}>
                    <IconSymbol name={summary.icon as never} size={20} color={palette.iconColor} />
                </View>

                <View style={styles.summaryBody}>
                    <Text style={styles.summaryTitle}>{summary.title}</Text>
                    <Text style={styles.summaryDescription}>{summary.description}</Text>

                    {summary.timestamp && summary.timestampLabel ? (
                        <View style={styles.summaryTimeRow}>
                            <Text style={styles.summaryTimeLabel}>{summary.timestampLabel}</Text>
                            <Text style={styles.summaryTime}>{formatDateTime(summary.timestamp)}</Text>
                        </View>
                    ) : null}
                </View>
            </View>

            <View style={styles.content}>
                {returnInfo.reasonLabel ? (
                    <InfoBlock
                        label={t('detail.returnFlow.fields.reason')}
                        value={returnInfo.reasonLabel}
                    />
                ) : null}

                {returnInfo.description ? (
                    <InfoBlock
                        label={t('detail.returnFlow.fields.description')}
                        value={returnInfo.description}
                    />
                ) : null}

                {returnInfo.rejectedReason ? (
                    <InfoBlock
                        label={t('detail.returnFlow.fields.rejectedReason')}
                        value={returnInfo.rejectedReason}
                    />
                ) : null}

                {carrierText ? (
                    <InfoBlock
                        label={t('detail.returnFlow.fields.carrier')}
                        value={carrierText}
                    />
                ) : null}

                {returnInfo.trackingNumber ? (
                    <InfoBlock
                        label={t('detail.returnFlow.fields.trackingNumber')}
                        value={returnInfo.trackingNumber}
                    />
                ) : null}

                {history.length > 0 ? (
                    <View style={styles.block}>
                        <Text style={styles.blockTitle}>{t('detail.returnFlow.historyTitle')}</Text>
                        <View style={styles.historyList}>
                            {history.map((event, index) => (
                                <View key={`${event.key}-${event.timestamp}`} style={styles.historyRow}>
                                    <View style={styles.historyRail}>
                                        <View style={styles.historyDot}>
                                            <IconSymbol
                                                name={event.icon as never}
                                                size={12}
                                                color={theme.colors.primary}
                                            />
                                        </View>
                                        {index < history.length - 1 ? <View style={styles.historyLine} /> : null}
                                    </View>
                                    <View style={styles.historyBody}>
                                        <Text style={styles.historyTitle}>{event.title}</Text>
                                        <Text style={styles.historyTime}>{formatDateTime(event.timestamp)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                {(returnInfo.imageUrls.length > 0 || returnInfo.videoUrls.length > 0) ? (
                    <View style={styles.block}>
                        <Text style={styles.blockTitle}>{t('detail.returnFlow.fields.evidence')}</Text>
                        <View style={styles.mediaGrid}>
                            {returnInfo.imageUrls.map((imageUrl) => (
                                <Pressable
                                    key={imageUrl}
                                    style={styles.mediaTile}
                                    onPress={() => setActiveImageUrl(imageUrl)}
                                >
                                    <Image
                                        source={{ uri: imageUrl }}
                                        style={styles.mediaImage}
                                        contentFit="cover"
                                        transition={150}
                                    />
                                </Pressable>
                            ))}

                            {returnInfo.videoUrls.map((videoUrl) => {
                                const thumbnailSource = videoThumbnails[videoUrl];

                                return (
                                    <Pressable
                                        key={videoUrl}
                                        style={styles.mediaTile}
                                        onPress={() => setActiveVideoUrl(videoUrl)}
                                    >
                                        {thumbnailSource ? (
                                            <Image
                                                source={thumbnailSource}
                                                style={styles.mediaImage}
                                                contentFit="cover"
                                                transition={150}
                                            />
                                        ) : (
                                            <View style={styles.videoFallback}>
                                                <IconSymbol
                                                    name="videocam"
                                                    size={22}
                                                    color={theme.colors.success}
                                                />
                                                <Text style={styles.videoFallbackText}>
                                                    {t('returnRequest.videoBadge')}
                                                </Text>
                                            </View>
                                        )}

                                        <View style={styles.videoOverlay}>
                                            <View style={styles.videoPlayBadge}>
                                                <IconSymbol
                                                    name="play-fill"
                                                    size={16}
                                                    color={theme.colors.surface}
                                                />
                                            </View>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                ) : null}
            </View>

            <Modal
                visible={Boolean(activeImageUrl)}
                transparent
                animationType="fade"
                onRequestClose={() => setActiveImageUrl(null)}
            >
                <View style={styles.previewModalRoot}>
                    <Pressable
                        style={styles.previewBackdrop}
                        onPress={() => setActiveImageUrl(null)}
                    />
                    <View style={styles.previewContent}>
                        {activeImageUrl ? (
                            <Image
                                source={{ uri: activeImageUrl }}
                                style={styles.previewImage}
                                contentFit="contain"
                            />
                        ) : null}
                        <Pressable
                            style={[styles.previewCloseButton, { top: insets.top + theme.margins.sm }]}
                            onPress={() => setActiveImageUrl(null)}
                        >
                            <IconSymbol name="close" size={20} color={theme.colors.surface} />
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {activeVideoUrl ? (
                <VideoPlayerModal
                    visible={Boolean(activeVideoUrl)}
                    videoUrl={activeVideoUrl}
                    onClose={() => setActiveVideoUrl(null)}
                />
            ) : null}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.md,
        gap: theme.margins.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    sectionEyebrow: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    statusBadge: {
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 6,
    },
    dynamicStatusBadge: (backgroundColor?: string, color?: string) => ({
        backgroundColor: backgroundColor || theme.colors.primaryLight,
        borderWidth: 1,
        borderColor: color ? `${color}22` : theme.colors.primaryLight,
    }),
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    dynamicStatusBadgeText: (color?: string) => ({
        color: color || theme.colors.primary,
    }),
    summaryCard: {
        borderRadius: theme.radius.l,
        padding: theme.margins.md,
        borderWidth: 1,
        flexDirection: 'row',
        gap: theme.margins.md,
    },
    dynamicSummaryCard: (backgroundColor: string, borderColor: string) => ({
        backgroundColor,
        borderColor,
    }),
    summaryIconWrap: {
        width: 44,
        height: 44,
        borderRadius: theme.radius.l,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dynamicSummaryIconWrap: (backgroundColor: string) => ({
        backgroundColor,
    }),
    summaryBody: {
        flex: 1,
        gap: 6,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        lineHeight: 24,
    },
    summaryDescription: {
        fontSize: 13,
        lineHeight: 19,
        color: theme.colors.typographySecondary,
    },
    summaryTimeRow: {
        gap: 2,
    },
    summaryTimeLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
        textTransform: 'uppercase',
    },
    summaryTime: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    content: {
        gap: theme.margins.md,
    },
    block: {
        gap: theme.margins.sm,
    },
    blockTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    infoBlock: {
        gap: 4,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    infoValue: {
        fontSize: 14,
        lineHeight: 20,
        color: theme.colors.typography,
    },
    historyList: {
        gap: theme.margins.sm,
    },
    historyRow: {
        flexDirection: 'row',
        gap: theme.margins.sm,
    },
    historyRail: {
        alignItems: 'center',
        width: 20,
    },
    historyDot: {
        width: 20,
        height: 20,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primaryLight,
    },
    historyLine: {
        flex: 1,
        width: 1,
        marginTop: 4,
        backgroundColor: theme.colors.borderMuted,
    },
    historyBody: {
        flex: 1,
        gap: 2,
        paddingBottom: theme.margins.xs,
    },
    historyTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    historyTime: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    mediaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
    },
    mediaTile: {
        width: 92,
        height: 92,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        backgroundColor: theme.colors.backgroundNewInput,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    mediaImage: {
        width: '100%',
        height: '100%',
    },
    videoFallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: theme.colors.successSoft,
    },
    videoFallbackText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.18)',
    },
    videoPlayBadge: {
        width: 32,
        height: 32,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    previewModalRoot: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    previewContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    previewCloseButton: {
        position: 'absolute',
        right: theme.margins.md,
        width: 40,
        height: 40,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.36)',
    },
}));
