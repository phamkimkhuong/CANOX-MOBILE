import {
    ProductDescription,
    ProductDetailSkeleton,
    ProductGallery,
    ProductInfoSection,
    ProductNavBar,
    ProductReviews,
    ProductSpecs,
    ShopInfoCard,
    StickyBottomBar,
    VariantBottomSheet,
    VariantSelectorRow,
    VariantSheetMode
} from '@/components/product';
import type { ProductGalleryRef } from '@/components/product/ProductGallery';
import { IconSymbol } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/product/ProductCard';
import { CHAT_STRINGS } from '@/constants/i18n/vi/chat';
import { PRODUCT_STRINGS } from '@/constants/i18n/vi/product';
import { ROUTES, chatRoutes, checkoutRoutes, productRoutes, shopRoutes } from '@/constants/routes';
import { useAddToCart } from '@/hooks/api/cart';
import { getCachedConversationId, useCreateConversation, usePrefetchShopChat } from '@/hooks/api/chat/useCreateConversation';
import { useProductDetail, useRelatedProducts } from '@/hooks/api/product/useProductDetail';
import { MINIMUM_SKELETON_DURATION_MS } from '@/hooks/usePrefetchTiming';
import { useProductVariant } from '@/hooks/useProductVariant';
import { useAuthStore } from '@/store/useAuthStore';
import type { ProductFeedItem } from '@/types/product/product';
import { findGalleryIndexByVariant } from '@/utils/adapter/product/productDetailAdapter';
import { createLogger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, Pressable, RefreshControl, Text, View } from 'react-native';
import {
    useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const log = createLogger('ProductDetail');

type ProductDetailListItem =
    | { type: 'gallery'; id: string }
    | { type: 'info'; id: string }
    | { type: 'variants'; id: string }
    | { type: 'reviews'; id: string }
    | { type: 'shop'; id: string }
    | { type: 'specs'; id: string }
    | { type: 'description'; id: string }
    | { type: 'related_header'; id: string }
    | { type: 'related_product'; id: string; data: ProductFeedItem };


export default function ProductDetailScreen() {
    const { id, instantNav } = useLocalSearchParams<{ id: string; instantNav?: string }>();
    const insets = useSafeAreaInsets();
    const { theme } = useUnistyles();
    const { t } = useTranslation(['product', 'chat', 'common']);
    const [variantSheetVisible, setVariantSheetVisible] = useState(false);
    /** Tracks how the variant sheet was opened - determines button text and action */
    const [variantSheetMode, setVariantSheetMode] = useState<VariantSheetMode>('select');
    const [quantity, setQuantity] = useState(1);
    const userId = useAuthStore((s) => s.userId);
    const myShopId = useAuthStore((s) => s.shopId);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    // Instant Nav: If true, enforce minimum skeleton duration to avoid flash
    const isInstantNav = instantNav === 'true';

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

    // === Related Products ===
    const { data: relatedData, isLoading: isLoadingRelated } = useRelatedProducts(id ?? '');
    const relatedProducts = useMemo(() => relatedData?.content ?? [], [relatedData]);

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

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollY.value = event.nativeEvent.contentOffset.y;
    }, [scrollY]);

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

    // Minimum skeleton duration for instant nav (prevents flash)
    const [minSkeletonComplete, setMinSkeletonComplete] = React.useState(!isInstantNav);

    React.useEffect(() => {
        if (!isInstantNav) {
            setMinSkeletonComplete(true);
            return;
        }
        // Minimum skeleton duration for instant tap navigation (prevents flash)
        const timer = setTimeout(() => setMinSkeletonComplete(true), MINIMUM_SKELETON_DURATION_MS);
        return () => clearTimeout(timer);
    }, [isInstantNav]);

    // Show skeleton if: loading OR (instant nav AND minimum duration not complete)
    const shouldShowSkeleton = isLoading || (isInstantNav && !minSkeletonComplete);

    const listRef = useRef<FlashListRef<ProductDetailListItem>>(null);

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
        if (!isAuthenticated && (variantSheetMode === 'add-to-cart' || variantSheetMode === 'buy-now')) {
            setVariantSheetVisible(false);
            Toast.show({
                type: 'info',
                text1: t('product:error.authRequiredTitle'),
                text2: variantSheetMode === 'add-to-cart'
                    ? t('product:error.authRequiredCart')
                    : t('product:error.authRequiredBuyNow'),
            });
            Navigator.push(ROUTES.AUTH.LOGIN);
            return;
        }

        if (!canAddToCart || !selectedVariantId) {
            return;
        }

        // Action based on mode
        if (variantSheetMode === 'add-to-cart') {
            setVariantSheetVisible(false);
            setVariantSheetMode('select');

            log.info('Add to cart from sheet:', { variantId: selectedVariantId, quantity });
            addToCart(
                { variantId: selectedVariantId, quantity },
                {
                    onSuccess: () => {
                        setQuantity(1);
                    },
                }
            );
        } else if (variantSheetMode === 'buy-now') {
            // Buy Now: Navigate to checkout with variant info
            // Checkout screen will handle adding to cart and preview
            log.info('Buy now from sheet:', { variantId: selectedVariantId, quantity });
            setVariantSheetVisible(false);
            setVariantSheetMode('select');
            setQuantity(1);
            Navigator.push(checkoutRoutes.buyNow(selectedVariantId, quantity));
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
    }, [variantSheetMode, canAddToCart, selectedVariantId, quantity, addToCart, selectedVariantMedia, productGallery, isAuthenticated, t]);

    /**
     * Ghost Loading/Prefetch cho Chat
     */
    const handlePrefetchChat = useCallback(() => {
        if (!isAuthenticated) return;
        if (shopId === myShopId) return;
        if (shopUserId && shopName) {
            prefetchShopChat(shopUserId, shopName, shopLogoUrl, shopId);
        }
    }, [shopUserId, shopName, shopLogoUrl, prefetchShopChat, shopId, myShopId, isAuthenticated]);

    /**
     * Handle Chat with Shop - Pure 0ms Navigation
     * All heavy logic is pushed to handlePrefetchChat (onPressIn)
     */
    const handleChatPress = useCallback(() => {
        if (!isAuthenticated) {
            Navigator.push(ROUTES.AUTH.LOGIN);
            return;
        }

        if (!shopUserId || !shopName) {
            log.warn(CHAT_STRINGS.error.missingShopInfo);
            return;
        }

        if (shopId === myShopId) {
            Toast.show({
                type: 'info',
                text1: t('chat:error.chatWithSelf'),
                text2: t('product:error.authRequiredGeneric'),
            });
            return;
        }

        // Use Cache (if done), otherwise use Ghost ID (instant, no await)
        const cachedId = getCachedConversationId(shopUserId);

        Navigator.push(chatRoutes.detail(cachedId || `ghost_${shopUserId}`, {
            partnerName: shopName,
            partnerAvatar: shopLogoUrl,
            shopUserId: shopUserId,
            shopId: shopId,
        }));

        // Log after to prevent Push delay
        requestAnimationFrame(() => {
            log.info('Instant navigation triggered');
        });
    }, [shopUserId, shopName, shopLogoUrl, isAuthenticated, myShopId, t]);

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
        if (!isAuthenticated) {
            Toast.show({
                type: 'info',
                text1: t('product:error.authRequiredTitle'),
                text2: t('product:error.authRequiredCart'),
            });
            Navigator.push(ROUTES.AUTH.LOGIN);
            return;
        }

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
    }, [isAuthenticated, canAddToCart, selectedVariantId, quantity, handleOpenVariantSheet, addToCart, t]);


    /**
     * Handle Buy Now action
     * - If variant not selected: open variant sheet in buy-now mode
     * - If variant selected: add to cart and navigate to checkout
     */
    const handleBuyNow = useCallback(() => {
        if (!isAuthenticated) {
            Toast.show({
                type: 'info',
                text1: t('product:error.authRequiredTitle'),
                text2: t('product:error.authRequiredBuyNow'),
            });
            Navigator.push(ROUTES.AUTH.LOGIN);
            return;
        }

        if (!canAddToCart || !selectedVariantId) {
            // Open sheet with 'buy-now' mode - button will say "Mua ngay"
            handleOpenVariantSheet('buy-now');
            return;
        }

        // Buy Now: Navigate to checkout with variant info
        // Checkout screen will handle adding to cart and preview
        log.info('Buy now:', { variantId: selectedVariantId, quantity });
        setQuantity(1);
        Navigator.push(checkoutRoutes.buyNow(selectedVariantId, quantity));
    }, [isAuthenticated, canAddToCart, selectedVariantId, quantity, handleOpenVariantSheet, t]);

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
     * Build List Data for Masonry/ZigZag layout
     */
    const listData = useMemo((): ProductDetailListItem[] => {
        if (!product) return [];

        const items: ProductDetailListItem[] = [
            { type: 'gallery', id: 'gallery' },
            { type: 'info', id: 'info' },
        ];

        if (product.hasVariants) {
            items.push({ type: 'variants', id: 'variants' });
        }

        items.push({ type: 'reviews', id: 'reviews' });
        items.push({ type: 'shop', id: 'shop' });

        if (product.specifications?.length > 0) {
            items.push({ type: 'specs', id: 'specs' });
        }

        if (product.description) {
            items.push({ type: 'description', id: 'description' });
        }

        if (relatedProducts.length > 0) {
            items.push({ type: 'related_header', id: 'related_header' });
            items.push(...relatedProducts.map(p => ({
                type: 'related_product' as const,
                id: `related_${p.id}`,
                data: p
            })));
        }

        return items;
    }, [product, relatedProducts]);

    /**
     * Render Item for FlashList
     */
    const renderItem = useCallback(({ item }: ListRenderItemInfo<ProductDetailListItem>) => {
        if (!product) return null;

        switch (item.type) {
            case 'gallery':
                return (
                    <View style={styles.fullWidthSection}>
                        <ProductGallery
                            ref={galleryRef}
                            gallery={product.gallery}
                            onImagePress={handleImagePress}
                        />
                    </View>
                );
            case 'info':
                return (
                    <View style={styles.fullWidthSection}>
                        <ProductInfoSection
                            name={product.name}
                            priceDisplay={selectionResult.displayPrice}
                            rating={product.rating}
                            totalReviews={product.totalReviews}
                            totalSold={product.totalSold}
                            flashSale={product.flashSale}
                        />
                    </View>
                );
            case 'variants':
                return (
                    <View style={styles.fullWidthSection}>
                        <VariantSelectorRow
                            options={product.options}
                            selectedOptions={selectedOptions}
                            selectionSummary={selectionResult.selectionSummary}
                            onPress={() => handleOpenVariantSheet('select')}
                        />
                    </View>
                );
            case 'reviews':
                return (
                    <View style={styles.fullWidthSection}>
                        <ProductReviews
                            productId={product.id}
                            reviewStatistics={product.reviewStatistics}
                            rating={product.rating}
                            totalReviews={product.totalReviews}
                            onViewAllPress={handleViewAllReviews}
                        />
                    </View>
                );
            case 'shop':
                return (
                    <View style={styles.fullWidthSection}>
                        <ShopInfoCard
                            shop={product.shop}
                            onChatPress={handleChatPress}
                            onPrefetchChat={handlePrefetchChat}
                            onViewShopPress={handleShopPress}
                        />
                    </View>
                );
            case 'specs':
                return (
                    <View style={styles.fullWidthSection}>
                        <ProductSpecs specifications={product.specifications} />
                    </View>
                );
            case 'description':
                return (
                    <View style={styles.fullWidthSection}>
                        <ProductDescription description={product.description} />
                    </View>
                );
            case 'related_header':
                return (
                    <View style={[styles.relatedHeader, styles.fullWidthSection]}>
                        <Text style={styles.relatedTitle}>{t('product:related.title')}</Text>
                    </View>
                );
            case 'related_product':
                return (
                    <ProductCard
                        title={item.data.title}
                        price={item.data.price}
                        image={item.data.thumbnail}
                        originalPrice={item.data.originalPrice}
                        rating={item.data.rating}
                        reviews={item.data.reviews}
                        sold={item.data.sold}
                        location={item.data.location}
                        discount={item.data.discountPercentage}
                        isMall={item.data.isMall}
                        onPress={() => {
                            Navigator.push(productRoutes.detail(item.data.id));
                        }}
                        route={productRoutes.detail(item.data.id)}
                    />
                );
            default:
                return null;
        }
    }, [
        product,
        selectionResult,
        selectedOptions,
        handleImagePress,
        handleOpenVariantSheet,
        handleViewAllReviews,
        handleChatPress,
        handlePrefetchChat,
        handleShopPress,
        t,
        styles
    ]);

    /**
     * Override item layout to make top sections full-width
     */
    const overrideItemLayout = useCallback((
        layout: { span?: number; size?: number },
        item: ProductDetailListItem,
    ) => {
        if (item.type !== 'related_product') {
            layout.span = 2;
        }
    }, []);

    // List footer for loading or spacing
    const renderListFooter = useCallback(() => {
        if (isLoadingRelated) {
            return (
                <View style={styles.listFooter}>
                    <ActivityIndicator color={theme.colors.buttonActive} />
                </View>
            );
        }
        return <View style={{ height: theme.margins.lg }} />;
    }, [isLoadingRelated, theme]);



    // ============================================
    // EARLY RETURNS - Loading & Error States
    // ============================================

    if (shouldShowSkeleton) {
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
                <View style={{ flex: 1 }}>
                    <FlashList
                        ref={listRef}
                        data={listData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        masonry={true}
                        optimizeItemArrangement={true}
                        overrideItemLayout={overrideItemLayout}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={renderListFooter}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={handleRefresh}
                                tintColor={theme.colors.buttonActive}
                            />
                        }
                    />
                </View>
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
    listContent: {
        paddingHorizontal: theme.margins.sm,
        paddingBottom: theme.margins.lg,
    },
    fullWidthSection: {
        marginHorizontal: -theme.margins.sm,
    },
    relatedHeader: {
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.md,
        backgroundColor: theme.colors.background,
    },
    relatedTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        textTransform: 'uppercase',
    },
    listFooter: {
        paddingVertical: theme.margins.lg,
        alignItems: 'center',
    },
}));
