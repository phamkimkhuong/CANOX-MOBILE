import {
    ProductDetailSkeleton,
    ProductNavBar,
} from '@/components/product';
import { createRouteErrorBoundary } from '@/components/common/AppCrashFallback';
import { ProductDetailContent } from '@/components/product/ProductDetailContent';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { PRODUCT_DETAIL_QUERY_KEYS, useProductDetail } from '@/hooks/api/product/useProductDetail';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { Navigator } from '@/utils/navigation';
import { getProductPreview } from '@/utils/productPreviewCache';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import {
    useSharedValue
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * ProductDetailScreen — Lightweight Shell
 *
 * Ghost Frame + Cache-aware + Proper transition timing.
 */
export const ErrorBoundary = createRouteErrorBoundary({
    scope: 'screen',
    titleKey: 'common:crash.productDetail.title',
    messageKey: 'common:crash.productDetail.message',
});

export default function ProductDetailScreen() {
    useNavigationUnlockOnFocus();

    const { id, action } = useLocalSearchParams<{
        id: string;
        action?: 'buy-now' | 'add-to-cart';
    }>();

    const { theme } = useUnistyles();
    const { t } = useTranslation(['product']);
    const preview = getProductPreview(id);
    const heroPreviewUrl = preview?.imageUrl ?? null;

    // ============================================
    // CACHE CHECK — Skip ghost frame if data is already available
    // ============================================
    const queryClient = useQueryClient();
    const hasCachedData = !!queryClient.getQueryData(
        PRODUCT_DETAIL_QUERY_KEYS.detail(id ?? '')
    );

    // ============================================
    const [isTransitionFinished, setIsTransitionFinished] = useState(hasCachedData);

    useFocusEffect(
        useCallback(() => {
               const task = requestAnimationFrame(() => {
                setIsTransitionFinished(true);
            });
            return () => cancelAnimationFrame(task);
        }, [])
    );

    // === Data Fetching ===
    const {
        data: product,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
    } = useProductDetail(id ?? '');

    const scrollY = useSharedValue(0);

    // Combined readiness: data loaded + transition done
    const isScreenReady = !!product && isTransitionFinished && !isLoading;

    // ============================================
    // ERROR STATE — includes empty response guard
    // ============================================
    if (isError || (!product && !isLoading && isTransitionFinished)) {
        return (
            <View style={styles.container}>
                <ProductNavBar scrollY={scrollY} title={t('navigation.title')} />
                <View style={styles.flex1}>
                    <View style={styles.errorOverlay}>
                        <View style={styles.errorCard}>
                            <View style={styles.errorIconCircle}>
                                <IconSymbol name="error" size={40} color={theme.colors.error} />
                            </View>
                            <Text style={styles.errorTitle}>{t('error.notFound')}</Text>
                            <Text style={styles.errorMessage}>
                                {error instanceof Error ? error.message : t('error.notFoundDetail')}
                            </Text>
                            <View style={styles.errorActions}>
                                <Pressable style={styles.retryButton} onPress={() => refetch()}>
                                    <Text style={styles.retryText}>{t('error.retry')}</Text>
                                </Pressable>
                                <Pressable style={[styles.retryButton, styles.homeButton]} onPress={() => Navigator.replace(ROUTES.TABS.HOME)}>
                                    <Text style={styles.homeButtonText}>{t('error.home')}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    // ============================================
    // RENDER — Shell with cross-fade
    // ============================================
    return (
        <View style={styles.container}>
            {/* NavBar — show empty title while loading */}
            {!product && (
                <ProductNavBar scrollY={scrollY} title="" />
            )}

            <View style={styles.flex1}>
                {/* Heavy content — only mounts when product + transition ready */}
                {isScreenReady && product && (
                    <ProductDetailContent
                        product={product}
                        scrollY={scrollY}
                        refetch={refetch}
                        isRefetching={isRefetching}
                        action={action}
                        heroPreviewUrl={heroPreviewUrl}
                        isTransitionFinished={isTransitionFinished}
                    />
                )}

                {/* Skeleton overlay — visible until content is ready */}
                {!isScreenReady && (
                    <View style={StyleSheet.absoluteFill}>
                        <ProductDetailSkeleton hideSafeTop hideBottomBar />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    flex1: {
        flex: 1,
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.margins.lg,
    },
    errorCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        padding: theme.margins.xl,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    errorIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.md,
    },
    errorActions: {
        flexDirection: 'row',
        marginTop: theme.margins.lg,
        gap: theme.margins.md,
    },
    homeButton: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    homeButtonText: {
        color: theme.colors.typography,
        fontSize: 14,
        fontWeight: '600',
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: theme.colors.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    retryButton: {
        backgroundColor: theme.colors.newPrimary,
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.sm,
        borderRadius: theme.radius.m,
    },
    retryText: {
        color: theme.colors.surface,
        fontSize: 14,
        fontWeight: '600',
    },
}));
