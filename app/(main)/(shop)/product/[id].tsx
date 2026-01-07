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
    VariantSelectorRow,
    VariantSheetMode
} from '@/components/product';
import type { ProductGalleryRef } from '@/components/product/ProductGallery';
import { IconSymbol } from '@/components/ui/Icon';
import { CHAT_STRINGS } from '@/constants/i18n/vi/chat';
import { PRODUCT_STRINGS } from '@/constants/i18n/vi/product';
import { ROUTES, chatRoutes, shopRoutes } from '@/constants/routes';
import { useAddToCart } from '@/hooks/api/cart';
import { getCachedConversationId, useCreateConversation, usePrefetchShopChat } from '@/hooks/api/chat/useCreateConversation';
import { useProductDetail } from '@/hooks/api/product/useProductDetail';
import { useProductVariant } from '@/hooks/useProductVariant';
import { findGalleryIndexByVariant } from '@/utils/adapter/product/productDetailAdapter';
import { createLogger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
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
    /** Tracks how the variant sheet was opened - determines button text and action */
    const [variantSheetMode, setVariantSheetMode] = useState<VariantSheetMode>('select');
    const [quantity, setQuantity] = useState(1);

    // Flag để hoãn render UI nặng cho đến khi kết thúc animation chuyển màn hình
    const [isTransitionFinished, setIsTransitionFinished] = useState(false);

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

    // === Add to Cart Mutation ===
    const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

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
    // ANIMATION & TRANSITION HANDLING
    // ============================================

    React.useEffect(() => {
        const handle = requestIdleCallback(() => {
            setIsTransitionFinished(true);
        }, { timeout: 500 });

        return () => cancelIdleCallback(handle);
    }, []);

    // ============================================
    // MEMOIZED VALUES - Tránh tính toán lại mỗi render
    // ============================================

    const optionsWithAvailability = useMemo(() => {
        return getOptionsWithAvailability();
    }, [getOptionsWithAvailability]);

    const canAddToCart = selectionResult.canAddToCart;
    const selectedVariantId = selectionResult.selectedVariant?.id;
    const selectedVariantMedia = selectionResult.selectedVariant?.media;
    const productId = product?.id;
    const shopId = product?.shop?.id;
    const shopUserId = product?.shop?.userId;
    const shopName = product?.shop?.shopName;
    const shopLogoUrl = product?.shop?.logoUrl;
    const productGallery = product?.gallery;

    // === Create Conversation Mutation ===
    const { mutate: createConversation, isPending: isCreatingConversation } = useCreateConversation();
    const prefetchShopChat = usePrefetchShopChat();

    /**
     * Memoize current image for bottom sheet
     */
    const currentImage = useMemo(() => {
        return selectedVariantMedia?.[0]?.url ?? productGallery?.[0]?.url;
    }, [selectedVariantMedia, productGallery]);

    /**
     * Open variant sheet with specified mode
     * Mode determines what action the confirm button performs
     */
    const handleOpenVariantSheet = useCallback((mode: VariantSheetMode = 'select') => {
        setVariantSheetMode(mode);
        setVariantSheetVisible(true);
    }, []);

    const handleCloseVariantSheet = useCallback(() => {
        setVariantSheetVisible(false);
        // Reset mode to default after close
        setVariantSheetMode('select');
    }, []);

    /**
     * Handle variant sheet confirm action based on current mode:
     * - 'select': Just close the sheet (user was selecting variant)
     * - 'add-to-cart': Add to cart then close sheet
     * - 'buy-now': Add to cart then navigate to checkout
     */
    const handleConfirmVariant = useCallback(() => {
        if (!canAddToCart || !selectedVariantId) {
            return;
        }

        // Action based on mode
        if (variantSheetMode === 'add-to-cart') {
            // Add to cart from sheet
            log.info('Add to cart from sheet:', { variantId: selectedVariantId, quantity });
            addToCart(
                { variantId: selectedVariantId, quantity },
                {
                    onSuccess: () => {
                        setVariantSheetVisible(false);
                        setVariantSheetMode('select');
                        setQuantity(1);
                    },
                }
            );
        } else if (variantSheetMode === 'buy-now') {
            // Add to cart and navigate to checkout
            log.info('Buy now from sheet:', { variantId: selectedVariantId, quantity });

            // Temporary: Navigate directly and cleanup UI
            setVariantSheetVisible(false);
            setVariantSheetMode('select');
            setQuantity(1);
            Navigator.push(ROUTES.CHECKOUT.INDEX);

            /* Commented out until API integration is finalized
            addToCart(
                { variantId: selectedVariantId, quantity },
                {
                    onSuccess: () => {
                        setVariantSheetVisible(false);
                        setVariantSheetMode('select');
                        setQuantity(1);
                        router.push(ROUTES.CHECKOUT.INDEX);
                    },
                }
            );
            */
        } else {
            // Default 'select' mode: just close and scroll to variant image
            setVariantSheetVisible(false);
            setVariantSheetMode('select');

            // Scroll gallery to variant image if exists
            if (selectedVariantMedia?.[0] && productGallery && selectedVariantId) {
                const index = findGalleryIndexByVariant(productGallery, selectedVariantId);
                galleryRef.current?.scrollToIndex(index);
            }
        }
    }, [variantSheetMode, canAddToCart, selectedVariantId, quantity, addToCart, selectedVariantMedia, productGallery]);

    /**
     * Ghost Loading/Prefetch cho Chat
     */
    const handlePrefetchChat = useCallback(() => {
        if (shopUserId && shopName) {
            prefetchShopChat(shopUserId, shopName, shopLogoUrl);
        }
    }, [shopUserId, shopName, shopLogoUrl, prefetchShopChat]);

    /**
     * Handle Chat with Shop - Pure 0ms Navigation
     * All heavy logic is pushed to handlePrefetchChat (onPressIn)
     */
    const handleChatPress = useCallback(() => {
        if (!shopUserId || !shopName) {
            log.warn(CHAT_STRINGS.error.missingShopInfo);
            return;
        }

        // Use Cache (if done), otherwise use Ghost ID (instant, no await)
        const cachedId = getCachedConversationId(shopUserId);

        Navigator.push(chatRoutes.detail(cachedId || `ghost_${shopUserId}`, {
            partnerName: shopName,
            partnerAvatar: shopLogoUrl,
            shopUserId: shopUserId,
        }));

        // Log after to prevent Push delay
        requestAnimationFrame(() => {
            log.info('Instant navigation triggered');
        });
    }, [shopUserId, shopName, shopLogoUrl]);

    const handleShopPress = useCallback(() => {
        if (shopId) {
            Navigator.push(shopRoutes.detail(shopId));
        }
    }, [shopId]);

    /**
     * Handle pull-to-refresh: Reset variant selection to default state
     */
    const handleRefresh = useCallback(() => {
        refetch();
        resetSelection();
    }, [refetch, resetSelection]);


    /**
     * Handle Add to Cart action
     * - If variant not selected: open variant sheet in add-to-cart mode
     * - If variant selected: call addToCart mutation directly
     */
    const handleAddToCart = useCallback(() => {
        if (!canAddToCart || !selectedVariantId) {
            // Open sheet with 'add-to-cart' mode - button will say "Thêm vào giỏ"
            handleOpenVariantSheet('add-to-cart');
            return;
        }

        // Variant already selected, add to cart directly
        log.info('Add to cart:', {
            variantId: selectedVariantId,
            quantity,
        });

        addToCart(
            { variantId: selectedVariantId, quantity },
            {
                onSuccess: () => {
                    // Reset quantity to 1 for next add
                    setQuantity(1);
                },
            }
        );
    }, [canAddToCart, selectedVariantId, quantity, handleOpenVariantSheet, addToCart]);


    /**
     * Handle Buy Now action
     * - If variant not selected: open variant sheet in buy-now mode
     * - If variant selected: add to cart and navigate to checkout
     */
    const handleBuyNow = useCallback(() => {
        if (!canAddToCart || !selectedVariantId) {
            // Open sheet with 'buy-now' mode - button will say "Mua ngay"
            handleOpenVariantSheet('buy-now');
            return;
        }

        // Variant already selected, proceed to checkout directly
        log.info('Buy now:', { variantId: selectedVariantId, quantity });

        // Temporary: Navigate directly and cleanup UI
        setQuantity(1);
        Navigator.push(ROUTES.CHECKOUT.INDEX);

        /* Commented out until API integration is finalized
        addToCart(
            { variantId: selectedVariantId, quantity },
            {
                onSuccess: () => {
                    setQuantity(1);
                    router.push(ROUTES.CHECKOUT.INDEX);
                },
            }
        );
        */
    }, [canAddToCart, selectedVariantId, quantity, handleOpenVariantSheet, addToCart]);

    const handleCartPress = useCallback(() => {
        Navigator.push(ROUTES.CART.INDEX);
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
                                    onPress={() => Navigator.replace(ROUTES.TABS.HOME)}
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
                onCartPress={handleCartPress}
                onSharePress={handleSharePress}
            />

            {/* Main Content Area */}
            {!isTransitionFinished ? (

                <ProductDetailSkeleton />
            ) : (

                <Animated.ScrollView
                    style={styles.scrollView}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: theme.margins.lg }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={handleRefresh}
                            tintColor={theme.colors.primary}
                        />
                    }
                >
                    {/* Gallery */}
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
                            onPress={() => handleOpenVariantSheet('select')}
                        />
                    )}

                    {/* Product Reviews */}
                    <ProductReviews
                        productId={product.id}
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
                        onPrefetchChat={handlePrefetchChat}
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
            )}

            {/* Sticky Bottom Bar - Luôn render để user thấy nút Mua Ngay */}
            <StickyBottomBar
                isFullySelected={selectionResult.isFullySelected}
                inventoryStatus={selectionResult.inventoryStatus}
                onChatPress={handleChatPress}
                onPrefetchChat={handlePrefetchChat}
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
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    mode={variantSheetMode}
                    onConfirm={handleConfirmVariant}
                    isConfirmDisabled={!selectionResult.canAddToCart}
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
