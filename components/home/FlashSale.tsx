import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import {
    filterApprovedFlashSaleSlots,
    flashSaleQueryKeys,
    selectBestFlashSaleSlot,
    selectNearestUpcomingFlashSaleSlot,
    selectPrimaryFlashSaleSlot,
    useActiveFlashSaleSlots,
    useUpcomingFlashSaleSlots,
} from '@/hooks/api/campaign/useFlashSaleDataSource';
import { useActiveFlashSale } from '@/hooks/api/campaign/useActiveFlashSale';
import { prefetchSlotDetail } from '@/hooks/api/campaign/useSlotDetail';
import { CampaignSlotResponse } from '@/types/campaign';
import { FlashSaleData } from '@/types/home';
import { formatSynchronizedTimeLeft, getSynchronizedTargetTimestamp } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { Navigator } from '@/utils/navigation';
import { Image } from 'expo-image';
import { useQueryClient } from '@tanstack/react-query';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { FlashSaleSkeleton } from './FlashSaleSkeleton';

const PREFETCH_WINDOW_SECONDS = 20;
const BOUNDARY_PROBE_DELAYS_MS = [0, 1500, 3000] as const;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * FlashSale - Component hiển thị sản phẩm Flash Sale
 */
interface FlashSaleProps {
    onProductPress?: (
        productId: string,
        action?: 'buy-now' | 'add-to-cart',
        previewImageUrl?: string | null
    ) => void;
    /** Shared shimmer animation from MarketingHeader — avoids multiple animation loops */
    shimmerAnimatedStyle?: object;
}

export const FlashSale = memo(({ onProductPress, shimmerAnimatedStyle }: FlashSaleProps = {}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('home');
    const queryClient = useQueryClient();

    const { data: flashSaleData, isLoading, isError, isFetching, refetch } = useActiveFlashSale();
    const { data: activeSlotsRaw = [] } = useActiveFlashSaleSlots();
    const { data: upcomingSlotsRaw = [] } = useUpcomingFlashSaleSlots(24);

    const activeSlots = useMemo(() => filterApprovedFlashSaleSlots(activeSlotsRaw), [activeSlotsRaw]);
    const upcomingSlots = useMemo(() => filterApprovedFlashSaleSlots(upcomingSlotsRaw), [upcomingSlotsRaw]);
    const hasAnySlotCandidate = activeSlots.length > 0 || upcomingSlots.length > 0;

    const [displayedData, setDisplayedData] = useState<FlashSaleData | null>(null);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isBoundaryPending, setIsBoundaryPending] = useState(false);

    const displayedDataRef = useRef<FlashSaleData | null>(null);
    const hasTriggeredBoundaryRef = useRef(false);
    const boundaryInProgressRef = useRef(false);
    const prefetchedCandidateIdRef = useRef<string | null>(null);
    const isMountedRef = useRef(true);

    const displayedSlot = displayedData?.slot ?? null;
    const displayedIsUpcoming = displayedData?.slot?.isUpcoming ?? false;

    const nextCandidate = useMemo<CampaignSlotResponse | null>(() => {
        if (!displayedData) return null;

        const currentSlotId = displayedData.slot.id;
        const fallbackActive = selectBestFlashSaleSlot(
            activeSlots.filter((slot) => slot.id !== currentSlotId)
        );

        if (fallbackActive) {
            return fallbackActive;
        }

        return selectNearestUpcomingFlashSaleSlot(
            upcomingSlots.filter((slot) => slot.id !== currentSlotId)
        );
    }, [activeSlots, displayedData, upcomingSlots]);

    const showInitialSkeleton = !displayedData && isLoading;
    const shouldShowPendingShell = !!displayedData && (
        isBoundaryPending ||
        (!flashSaleData && (hasAnySlotCandidate || isFetching))
    );

    const statusTimerKey = displayedData
        ? `${displayedData.slot.id}:${displayedData.slot.isUpcoming ? 'upcoming' : 'active'}`
        : 'empty';
    const productStripKey = displayedData ? `products:${displayedData.slot.id}` : 'empty';

    const readPrimarySlotFromCache = useCallback(() => {
        const activeCache = queryClient.getQueryData<CampaignSlotResponse[]>(flashSaleQueryKeys.activeSlots()) || [];
        const upcomingCache = queryClient.getQueryData<CampaignSlotResponse[]>(flashSaleQueryKeys.upcomingSlots(24)) || [];

        return selectPrimaryFlashSaleSlot(
            filterApprovedFlashSaleSlots(activeCache),
            filterApprovedFlashSaleSlots(upcomingCache)
        );
    }, [queryClient]);

    const resolveBoundaryTransition = useCallback(async (origin: FlashSaleData) => {
        if (boundaryInProgressRef.current) return;

        boundaryInProgressRef.current = true;
        setIsBoundaryPending(true);

        let resolved = false;

        try {
            for (const delayMs of BOUNDARY_PROBE_DELAYS_MS) {
                if (delayMs > 0) {
                    await wait(delayMs);
                }

                if (!isMountedRef.current) return;

                await refetch();

                const latestPrimary = readPrimarySlotFromCache();
                if (!latestPrimary) {
                    resolved = true;
                    return;
                }

                const slotChanged = latestPrimary.slot.id !== origin.slot.id;
                const statusChanged = latestPrimary.isUpcoming !== origin.slot.isUpcoming;

                if (slotChanged || statusChanged) {
                    resolved = true;
                    return;
                }
            }
        } finally {
            boundaryInProgressRef.current = false;

            if (!resolved && isMountedRef.current) {
                setIsBoundaryPending(false);
                prefetchedCandidateIdRef.current = null;
            }
        }
    }, [readPrimarySlotFromCache, refetch]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        displayedDataRef.current = displayedData;
    }, [displayedData]);

    useEffect(() => {
        if (flashSaleData) {
            setDisplayedData(flashSaleData);
            setIsBoundaryPending(false);
            return;
        }

        if (!isFetching && !hasAnySlotCandidate) {
            setDisplayedData(null);
            setIsBoundaryPending(false);
        }
    }, [flashSaleData, hasAnySlotCandidate, isFetching]);

    useEffect(() => {
        if (!displayedSlot) return;

        const targetTime = displayedIsUpcoming
            ? displayedSlot.startTime
            : displayedSlot.endTime;
        const relativeSeconds = displayedIsUpcoming
            ? displayedSlot.secondsUntilStart
            : displayedSlot.secondsUntilEnd;

        if (!targetTime) return;

        hasTriggeredBoundaryRef.current = false;
        prefetchedCandidateIdRef.current = null;

        const targetMs = getSynchronizedTargetTimestamp(
            targetTime,
            (relativeSeconds && relativeSeconds > 0) ? relativeSeconds : undefined
        );

        const updateTimer = () => {
            const time = formatSynchronizedTimeLeft(targetMs);

            if (
                !displayedIsUpcoming &&
                nextCandidate &&
                time.total > 0 &&
                time.total <= PREFETCH_WINDOW_SECONDS * 1000 &&
                prefetchedCandidateIdRef.current !== nextCandidate.id
            ) {
                prefetchedCandidateIdRef.current = nextCandidate.id;
                void prefetchSlotDetail(queryClient, nextCandidate.id);
            }

            if (time.total <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });

                if (!hasTriggeredBoundaryRef.current) {
                    hasTriggeredBoundaryRef.current = true;
                    const origin = displayedDataRef.current;

                    if (origin) {
                        void resolveBoundaryTransition(origin);
                    }
                }
            } else {
                hasTriggeredBoundaryRef.current = false;
                setTimeLeft({
                    days: time.days,
                    hours: time.hours,
                    minutes: time.minutes,
                    seconds: time.seconds,
                });
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [
        displayedSlot,
        displayedIsUpcoming,
        nextCandidate,
        queryClient,
        resolveBoundaryTransition,
    ]);

    if (isError && !displayedData) {
        return null;
    }

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    return (
        <Animated.View layout={LinearTransition.duration(240)}>
            {showInitialSkeleton ? (
                <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(160)}>
                    <FlashSaleSkeleton animatedStyle={shimmerAnimatedStyle} />
                </Animated.View>
            ) : null}

            {displayedData ? (
                <Animated.View
                    entering={FadeIn.duration(180)}
                    exiting={FadeOutUp.duration(220)}
                >
                    <View style={[styles.container, shouldShowPendingShell && styles.containerPending]}>
                        <View style={styles.header}>
                            <View style={styles.titleRow}>
                                <Text style={styles.title}>{t('flashSale.title')}</Text>

                                <Animated.View
                                    key={statusTimerKey}
                                    entering={FadeIn.duration(200)}
                                    exiting={FadeOut.duration(140)}
                                    style={styles.statusTimerGroup}
                                >
                                    {displayedIsUpcoming ? (
                                        <Text style={styles.upcomingLabel}>{t('flashSale.startingIn')}</Text>
                                    ) : null}

                                    <View style={styles.timerRow}>
                                        {timeLeft.days > 0 ? (
                                            <>
                                                <View style={[styles.timerBox, displayedIsUpcoming && styles.timerBoxUpcoming]}>
                                                    <Text style={styles.timerText}>{timeLeft.days}</Text>
                                                </View>
                                                <Text style={styles.timerDayText}>ngày</Text>
                                            </>
                                        ) : null}

                                        <View style={[styles.timerBox, displayedIsUpcoming && styles.timerBoxUpcoming]}>
                                            <Text style={styles.timerText}>{formatNumber(timeLeft.hours)}</Text>
                                        </View>
                                        <Text style={styles.timerColon}>:</Text>
                                        <View style={[styles.timerBox, displayedIsUpcoming && styles.timerBoxUpcoming]}>
                                            <Text style={styles.timerText}>{formatNumber(timeLeft.minutes)}</Text>
                                        </View>
                                        <Text style={styles.timerColon}>:</Text>
                                        <View style={[styles.timerBox, displayedIsUpcoming && styles.timerBoxUpcoming]}>
                                            <Text style={styles.timerText}>{formatNumber(timeLeft.seconds)}</Text>
                                        </View>
                                    </View>
                                </Animated.View>
                            </View>

                            <TouchableOpacity
                                style={styles.seeAllBtn}
                                onPress={() => Navigator.push(ROUTES.CAMPAIGN.FLASH_SALE)}
                            >
                                <Text style={styles.seeAllText}>{t('flashSale.seeAll')}</Text>
                                <IconSymbol name="chevron-right" size={16} color={theme.colors.secondary} />
                            </TouchableOpacity>
                        </View>

                        {shouldShowPendingShell ? (
                            <View style={styles.pendingBadge}>
                                <View style={styles.pendingDot} />
                                <Text style={styles.pendingText}>Đang cập nhật khung giờ...</Text>
                            </View>
                        ) : null}

                        <Animated.View
                            key={productStripKey}
                            entering={FadeIn.duration(220)}
                            exiting={FadeOut.duration(140)}
                            style={styles.productsSection}
                        >
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.scrollContent}
                            >
                                {displayedData.items.map((item) => {
                                const isUrgent = item.progress >= 80 && !item.isSoldOut;
                                const upcomingCurrentPrice =
                                    displayedIsUpcoming && item.originalPrice > item.price
                                        ? item.originalPrice
                                        : null;
                                const progressLabel = item.isSoldOut
                                    ? t('flashSale.soldOut') || 'Hết hàng'
                                    : item.soldCount === 0
                                        ? t('flashSale.sellingFast') || 'Vừa mở bán'
                                        : isUrgent
                                            ? t('flashSale.urgentStock') || 'SẮP CHÁY HÀNG'
                                            : t('flashSale.soldCount', { count: item.soldCount });

                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[styles.productCard, item.isSoldOut && styles.soldOutCard]}
                                        activeOpacity={item.isSoldOut ? 1 : 0.85}
                                        onPress={() => !item.isSoldOut && onProductPress?.(
                                            item.productId,
                                            undefined,
                                            item.image
                                        )}
                                    >
                                        <View style={styles.imageContainer}>
                                            <Image
                                                source={{ uri: item.image }}
                                                style={[styles.productImage, item.isSoldOut && styles.grayscaleImage]}
                                                contentFit="cover"
                                                transition={200}
                                            />
                                            {item.isSoldOut ? (
                                                <View style={styles.soldOutOverlay}>
                                                    <View style={styles.soldOutBadge}>
                                                        <Text style={styles.soldOutText}>{t('flashSale.soldOut') || 'HẾT HÀNG'}</Text>
                                                    </View>
                                                </View>
                                            ) : item.discountPercentage > 0 ? (
                                                <View style={styles.discountBadge}>
                                                    <Text style={styles.discountText}>-{item.discountPercentage}%</Text>
                                                </View>
                                            ) : null}
                                        </View>

                                        <View style={styles.productInfo}>
                                            <Text style={styles.productName} numberOfLines={1}>
                                                {item.name}
                                            </Text>

                                            {item.rating > 0 ? (
                                                <View style={styles.productMetaRow}>
                                                    <View style={styles.ratingBadge}>
                                                        <IconSymbol name="star" size={12} color={theme.colors.warning} />
                                                        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                                                    </View>
                                                </View>
                                            ) : null}

                                            {displayedIsUpcoming ? (
                                                upcomingCurrentPrice ? (
                                                    <View style={styles.priceRow}>
                                                        <Text style={[styles.upcomingCurrentPrice, item.isSoldOut && styles.soldOutPrice]}>
                                                            {formatCurrency(upcomingCurrentPrice)}
                                                        </Text>
                                                    </View>
                                                ) : null
                                            ) : (
                                                <View style={styles.priceRow}>
                                                    <Text style={[styles.price, item.isSoldOut && styles.soldOutPrice]}>
                                                        {formatCurrency(item.price)}
                                                    </Text>
                                                    {!item.isSoldOut && item.originalPrice > item.price ? (
                                                        <Text style={styles.originalPrice}>
                                                            {formatCurrency(item.originalPrice)}
                                                        </Text>
                                                    ) : null}
                                                </View>
                                            )}

                                            {displayedIsUpcoming ? (
                                                <View style={styles.upcomingInfoStrip}>
                                                    <View style={styles.upcomingInfoTextGroup}>
                                                        <Text style={styles.upcomingInfoLabel}>
                                                            {t('flashSale.upcomingPriceLabel')}
                                                        </Text>
                                                        {upcomingCurrentPrice ? (
                                                            <Text style={styles.upcomingInfoHint}>
                                                                {t('flashSale.upcomingSaveAmount', {
                                                                    amount: formatCurrency(Math.max(upcomingCurrentPrice - item.price, 0))
                                                                })}
                                                            </Text>
                                                        ) : null}
                                                    </View>
                                                    <Text style={styles.upcomingInfoValue}>
                                                        {formatCurrency(item.price)}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View style={[styles.progressBg, isUrgent && styles.progressBgUrgent, item.isSoldOut && styles.progressBgSoldOut]}>
                                                    <View
                                                        style={[
                                                            styles.progressFill,
                                                            item.isSoldOut ? styles.fullWidthSecondary : styles.dynamicWidth(Math.max(item.progress, 20)),
                                                            isUrgent && styles.progressFillUrgent,
                                                        ]}
                                                    />
                                                    <View style={styles.progressLabelContainer}>
                                                        {isUrgent ? (
                                                            <IconSymbol name="fire" size={10} color={theme.colors.background} />
                                                        ) : null}
                                                        <Text style={styles.progressText}>{progressLabel}</Text>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                                })}
                            </ScrollView>

                            {shouldShowPendingShell ? <View style={styles.productsVeil} /> : null}
                        </Animated.View>
                    </View>
                </Animated.View>
            ) : null}
        </Animated.View>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.m,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    containerPending: {
        opacity: 0.98,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        marginBottom: 12,
        gap: 12,
    },
    titleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusTimerGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flexShrink: 1,
    },
    title: {
        fontSize: theme.fontSizes.base,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: theme.colors.warning,
        letterSpacing: 0.5,
    },
    upcomingLabel: {
        fontSize: theme.fontSizes.xs,
        fontWeight: '600',
        color: theme.colors.secondary,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timerBox: {
        backgroundColor: theme.colors.typography,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    timerBoxUpcoming: {
        backgroundColor: theme.colors.warning,
    },
    timerText: {
        color: theme.colors.surface,
        fontSize: theme.fontSizes.xs,
        fontWeight: 'bold',
    },
    timerColon: {
        color: theme.colors.typography,
        fontWeight: 'bold',
    },
    timerDayText: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.typography,
        fontWeight: '600',
        marginHorizontal: 1,
    },
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: theme.margins.md,
        marginTop: -2,
        marginBottom: theme.margins.sm,
    },
    pendingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.warning,
    },
    pendingText: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.secondary,
        fontWeight: '600',
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.secondary,
        fontWeight: '500',
    },
    productsSection: {
        position: 'relative',
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: 12,
    },
    productsVeil: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.surfaceTranslucent,
    },
    productCard: {
        width: 140,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: `${theme.colors.primary}10`,
        backgroundColor: '#f8fafc',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#facc15',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderBottomLeftRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    discountText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.notification,
    },
    productInfo: {
        marginTop: theme.margins.sm,
        gap: 4,
    },
    productName: {
        fontSize: theme.fontSizes.sm,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    productMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    ratingText: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.warning,
        fontWeight: '600',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    price: {
        fontSize: theme.fontSizes.md,
        fontWeight: 'bold',
        color: theme.colors.error,
    },
    originalPrice: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.secondary,
        textDecorationLine: 'line-through',
    },
    upcomingCurrentPrice: {
        fontSize: theme.fontSizes.sm,
        fontWeight: '600',
        color: theme.colors.secondary,
    },
    progressBg: {
        position: 'relative',
        height: 12,
        backgroundColor: '#ffaa94',
        borderRadius: 5,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    progressFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#ee4d2d',
        borderRadius: 9,
    },
    fullWidthSecondary: {
        width: '100%',
        backgroundColor: theme.colors.secondary,
    },
    dynamicWidth: (width: number) => ({
        width: `${width}%`,
    }),
    progressLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        zIndex: 1,
    },
    progressText: {
        fontSize: theme.fontSizes.xs,
        fontWeight: 'bold',
        color: theme.colors.background,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowRadius: 2,
    },
    soldOutCard: {
        opacity: 0.8,
    },
    grayscaleImage: {
        opacity: 0.6,
    },
    soldOutOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    soldOutBadge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    soldOutText: {
        color: '#fff',
        fontSize: theme.fontSizes.xs,
        fontWeight: 'bold',
    },
    soldOutPrice: {
        color: theme.colors.secondary,
    },
    progressBgUrgent: {
        backgroundColor: '#fed7aa',
    },
    progressFillUrgent: {
        backgroundColor: '#f97316',
    },
    progressBgSoldOut: {
        backgroundColor: theme.colors.secondaryLight,
    },
    upcomingInfoStrip: {
        minHeight: 32,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: theme.margins.xs + 2,
        backgroundColor: theme.colors.warningSubtle,
        borderWidth: 1,
        borderColor: theme.colors.warningLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.margins.xs,
    },
    upcomingInfoTextGroup: {
        flex: 1,
        gap: 2,
    },
    upcomingInfoLabel: {
        fontSize: theme.fontSizes.xs,
        fontWeight: '600',
        color: theme.colors.secondary,
        flexShrink: 1,
    },
    upcomingInfoHint: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.warning,
        fontWeight: '600',
    },
    upcomingInfoValue: {
        fontSize: theme.fontSizes.sm,
        fontWeight: 'bold',
        color: theme.colors.newPrimary,
    },
}));
