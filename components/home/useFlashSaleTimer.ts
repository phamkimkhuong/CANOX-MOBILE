import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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

const PREFETCH_WINDOW_SECONDS = 20;
const BOUNDARY_PROBE_DELAYS_MS = [0, 1500, 3000] as const;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useFlashSaleTimer() {
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

    return {
        displayedData,
        displayedSlot,
        displayedIsUpcoming,
        timeLeft,
        isError,
        showInitialSkeleton,
        shouldShowPendingShell,
    };
}
