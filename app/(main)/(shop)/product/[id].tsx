import {
    ProductDescription,
    ProductDetailSkeleton,
    ProductGallery,
    ProductInfoSection,
    ProductNavBar,
    ProductReviews,
    ProductSpecs,
    RelatedProducts,
    ShopInfoCard,
    StickyBottomBar,
    VariantBottomSheet,
    VariantSelectorRow
} from '@/components/product';
import type { ProductGalleryRef } from '@/components/product/ProductGallery';
import { IconSymbol } from '@/components/ui/Icon';
import { PRODUCT_STRINGS } from '@/constants/i18n/vi/product';
import { ROUTES, chatRoutes, shopRoutes } from '@/constants/routes';
import { useProductDetail } from '@/hooks/api/product/useProductDetail';
import { useProductVariant } from '@/hooks/useProductVariant';
import { findGalleryIndexByVariant } from '@/utils/adapter/productDetailAdapter';
import { createLogger } from '@/utils/logger';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, Text, View } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const log = createLogger('ProductDetail');


export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { theme } = useUnistyles();
    const [variantSheetVisible, setVariantSheetVisible] = useState(false);

    // === Data Fetching ===
    const {
        data: product,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
    } = useProductDetail(id ?? '');

    // === Variant Selection ===
    const {
        selectedOptions,
        selectionResult,
        selectOption,
        resetSelection,
        getOptionsWithAvailability,
    } = useProductVariant(product);

    // === Scroll Animation ===
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // === Gallery Ref for scrolling to variant image ===
    const galleryRef = useRef<ProductGalleryRef>(null);

    // ============================================
    // MEMOIZED VALUES - Tránh tính toán lại mỗi render
    // ============================================

    /**
     * ⚡ P0-3 FIX: Memoize options with availability
     * Trước đây gọi trong render body → tính lại mỗi render
     */
    const optionsWithAvailability = useMemo(() => {
        return getOptionsWithAvailability();
    }, [getOptionsWithAvailability]);

    /**
     * Extract primitive values để tránh object dependency
     * Giúp callbacks không thay đổi reference khi object thay đổi
     */
    const canAddToCart = selectionResult.canAddToCart;
    const selectedVariantId = selectionResult.selectedVariant?.id;
    const selectedVariantMedia = selectionResult.selectedVariant?.media;
    const productId = product?.id;
    const shopId = product?.shop.id;
    const productGallery = product?.gallery;

    /**
     * Memoize current image for bottom sheet
     */
    const currentImage = useMemo(() => {
        return selectedVariantMedia?.[0]?.url ?? productGallery?.[0]?.url;
    }, [selectedVariantMedia, productGallery]);

    const handleOpenVariantSheet = useCallback(() => {
        setVariantSheetVisible(true);
    }, []);

    const handleCloseVariantSheet = useCallback(() => {
        setVariantSheetVisible(false);
    }, []);

    const handleConfirmVariant = useCallback(() => {
        setVariantSheetVisible(false);

        // Scroll gallery to variant image if exists
        if (selectedVariantMedia?.[0] && productGallery && selectedVariantId) {
            const index = findGalleryIndexByVariant(productGallery, selectedVariantId);
            galleryRef.current?.scrollToIndex(index);
        }
    }, [selectedVariantMedia, productGallery, selectedVariantId]);

    const handleChatPress = useCallback(() => {
        if (shopId) {
            router.push(chatRoutes.conversation(shopId));
        }
    }, [shopId]);

    const handleShopPress = useCallback(() => {
        if (shopId) {
            router.push(shopRoutes.detail(shopId));
        }
    }, [shopId]);

    /**
     * Handle pull-to-refresh: Reset variant selection to default state
     */
    const handleRefresh = useCallback(() => {
        refetch();
        resetSelection();
    }, [refetch, resetSelection]);


    const handleAddToCart = useCallback(() => {
        if (!canAddToCart) {
            handleOpenVariantSheet();
            return;
        }

        // TODO: Implement add to cart mutation
        log.info('Add to cart:', {
            productId,
            variantId: selectedVariantId,
            quantity: 1,
        });
    }, [canAddToCart, productId, selectedVariantId, handleOpenVariantSheet]);


    const handleBuyNow = useCallback(() => {
        if (!canAddToCart) {
            handleOpenVariantSheet();
            return;
        }

        router.push({
            pathname: ROUTES.CART.INDEX,
            params: {
                action: 'buy-now',
                productId: productId ?? '',
                variantId: selectedVariantId ?? '',
                quantity: '1',
            },
        } as never);
    }, [canAddToCart, productId, selectedVariantId, handleOpenVariantSheet]);

    const handleCartPress = useCallback(() => {
        router.push(ROUTES.CART.INDEX);
    }, []);

    const handleSharePress = useCallback(() => {
        // TODO: Implement share functionality
        log.info('Share product:', productId);
    }, [productId]);

    /**
     * Memoized callback cho image press
     */
    const handleImagePress = useCallback((index: number) => {
        // TODO: Open fullscreen image viewer
        log.info('View image:', index);
    }, []);

    /**
     * Handle view all reviews
     */
    const handleViewAllReviews = useCallback(() => {
        // TODO: Navigate to reviews screen
        log.info('View all reviews for product:', productId);
    }, [productId]);

    /**
     * Handle ask question
     */
    const handleAskQuestion = useCallback(() => {
        // TODO: Navigate to Q&A screen or open modal
        log.info('Ask question about product:', productId);
    }, [productId]);

    // ============================================
    // EARLY RETURNS - Loading & Error States
    // ============================================

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (isError || !product) {
        return (
            <View style={styles.container}>
                {/* NavBar vẫn cho phép quay lại */}
                <ProductNavBar scrollY={scrollY} title={PRODUCT_STRINGS.navigation.title} />

                <View style={{ flex: 1 }}>
                    <ProductDetailSkeleton />
                    <View style={styles.errorOverlay}>
                        <View style={styles.errorCard}>
                            <View style={styles.errorIconCircle}>
                                <IconSymbol
                                    name="error"
                                    size={40}
                                    color={theme.colors.error}
                                />
                            </View>
                            <Text style={styles.errorTitle}>{PRODUCT_STRINGS.error.notFound}</Text>
                            <Text style={styles.errorMessage}>
                                {error instanceof Error ? error.message : PRODUCT_STRINGS.error.notFoundDetail}
                            </Text>

                            <View style={styles.errorActions}>
                                <Pressable style={styles.retryButton} onPress={() => refetch()}>
                                    <Text style={styles.retryText}>{PRODUCT_STRINGS.error.retry}</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.retryButton, styles.homeButton]}
                                    onPress={() => router.replace(ROUTES.TABS.HOME)}
                                >
                                    <Text style={styles.homeButtonText}>{PRODUCT_STRINGS.error.home}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    // ============================================
    // RENDER
    // ============================================

    return (
        <View style={styles.container}>
            {/* Animated NavBar */}
            <ProductNavBar
                scrollY={scrollY}
                title={product.name}
                cartItemCount={0} // TODO: Get from cart store
                onCartPress={handleCartPress}
                onSharePress={handleSharePress}
            />

            {/* Main Scroll Content */}
            <Animated.ScrollView
                style={styles.scrollView}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                {/* Gallery - with forwardRef */}
                <ProductGallery
                    ref={galleryRef}
                    gallery={product.gallery}
                    onImagePress={handleImagePress}
                />

                {/* Product Info */}
                <ProductInfoSection
                    name={product.name}
                    priceDisplay={selectionResult.displayPrice}
                    rating={product.rating}
                    totalReviews={product.totalReviews}
                    totalSold={product.totalSold}
                    flashSale={product.flashSale}
                />

                {/* Variant Selector */}
                {product.hasVariants && (
                    <VariantSelectorRow
                        options={product.options}
                        selectedOptions={selectedOptions}
                        selectionSummary={selectionResult.selectionSummary}
                        onPress={handleOpenVariantSheet}
                    />
                )}

                {/* Product Reviews */}
                <ProductReviews
                    reviewStatistics={product.reviewStatistics}
                    rating={product.rating}
                    totalReviews={product.totalReviews}
                    onViewAllPress={handleViewAllReviews}
                    onAskQuestionPress={handleAskQuestion}
                />

                {/* Shop Info */}
                <ShopInfoCard
                    shop={product.shop}
                    onChatPress={handleChatPress}
                    onViewShopPress={handleShopPress}
                />

                {/* Specifications */}
                {product.specifications.length > 0 && (
                    <ProductSpecs specifications={product.specifications} />
                )}

                {/* Description */}
                <ProductDescription description={product.description} />

                {/* Related Products */}
                <RelatedProducts productId={id ?? ''} />
            </Animated.ScrollView>

            {/* Sticky Bottom Bar */}
            <StickyBottomBar
                isFullySelected={selectionResult.isFullySelected}
                inventoryStatus={selectionResult.inventoryStatus}
                onChatPress={handleChatPress}
                onShopPress={handleShopPress}
                onAddToCartPress={handleAddToCart}
                onBuyNowPress={handleBuyNow}
            />

            {/* Variant Bottom Sheet */}
            {product.hasVariants && (
                <VariantBottomSheet
                    visible={variantSheetVisible}
                    onClose={handleCloseVariantSheet}
                    options={optionsWithAvailability}
                    selectedOptions={selectedOptions}
                    onSelectOption={selectOption}
                    currentPrice={selectionResult.displayPrice.currentPrice}
                    originalPrice={selectionResult.displayPrice.originalPrice}
                    currentStock={selectionResult.availableStock}
                    selectedImage={currentImage}
                    onConfirm={handleConfirmVariant}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.margins.lg,
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
        fontWeight: '600',
        color: theme.colors.typography,
    },
    errorMessage: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: theme.margins.md,
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.smd,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.m,
    },
    retryText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.surface,
    },
}));
