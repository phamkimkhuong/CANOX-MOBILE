import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { FlashSaleHeader } from './FlashSaleHeader';
import { FlashSaleProductStrip } from './FlashSaleProductStrip';
import { FlashSaleSkeleton } from './FlashSaleSkeleton';
import { useFlashSaleTimer } from './useFlashSaleTimer';

interface FlashSaleProps {
    onProductPress?: (
        productId: string,
        action?: 'buy-now' | 'add-to-cart',
        previewImageUrl?: string | null
    ) => void;
    shimmerAnimatedStyle?: object;
}

export const FlashSale = memo(({ onProductPress, shimmerAnimatedStyle }: FlashSaleProps = {}) => {
    useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('home');
    const {
        displayedData,
        displayedIsUpcoming,
        timeLeft,
        isError,
        showInitialSkeleton,
        shouldShowPendingShell,
    } = useFlashSaleTimer();

    if (isError && !displayedData) {
        return null;
    }

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
                        <FlashSaleHeader
                            displayedData={displayedData}
                            displayedIsUpcoming={displayedIsUpcoming}
                            timeLeft={timeLeft}
                        />

                        {shouldShowPendingShell ? (
                            <View style={styles.pendingBadge}>
                                <View style={styles.pendingDot} />
                                <Text style={styles.pendingText}>{t('flashSale.pendingBoundary')}</Text>
                            </View>
                        ) : null}

                        <FlashSaleProductStrip
                            displayedData={displayedData}
                            displayedIsUpcoming={displayedIsUpcoming}
                            onProductPress={onProductPress}
                            shouldShowPendingShell={shouldShowPendingShell}
                        />
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
}));
