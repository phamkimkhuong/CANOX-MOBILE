import {
    PriceBreakdownBottomSheet,
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
import { ROUTES, chatRoutes, checkoutRoutes, productRoutes, shopRoutes } from '@/constants/routes';
import { useAddToCart } from '@/hooks/api/cart';
import { getCachedConversationId, usePrefetchShopChat } from '@/hooks/api/chat/useCreateConversation';
import { useProductDetail, useRelatedProducts } from '@/hooks/api/product/useProductDetail';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { MINIMUM_SKELETON_DURATION_MS } from '@/hooks/usePrefetchTiming';
import { useProductVariant } from '@/hooks/useProductVariant';
import { useAuthStore } from '@/store/useAuthStore';
import type { ProductFeedItem } from '@/types/product/product';
import { findGalleryIndexByVariant } from '@/utils/adapter/product/productDetailAdapter';
import { Alert } from '@/utils/AlertHelper';
import { createLogger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import { toSizedImageUrl } from '@/utils/url';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionSheetIOS, ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, RefreshControl, Share, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
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
    // Unlock navigation when screen gains focus (for faster subsequent navigations)
    useNavigationUnlockOnFocus();

    const { id, instantNav } = useLocalSearchParams<{ id: string; instantNav?: string }>();

    const { theme } = useUnistyles();
    const { t } = useTranslation(['product', 'chat', 'common']);

    // === UI State ===
    const [variantSheetVisible, setVariantSheetVisible] = useState(false);
    const [variantSheetMode, setVariantSheetMode] = useState<VariantSheetMode>('select');
    const [quantity, setQuantity] = useState(1);
    const [priceBreakdownVisible, setPriceBreakdownVisible] = useState(false);

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
    } = useProductVariant(product, { autoSelectFirst: true });

    // === Add to Cart Mutation ===
    const { mutate: addToCart } = useAddToCart();

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

    useFocusEffect(
        useCallback(() => {
            // Screen focused + animation done
            const task = requestAnimationFrame(() => {
                setIsTransitionFinished(true);
            });
            return () => {
                cancelAnimationFrame(task);
                // We keep it true once loaded for a smoother experience if user comes back
                // or we can reset it to false - in this case product detail is heavy, 
                // resetting to false ensures smooth re-entry.
                setIsTransitionFinished(false);
            };
        }, [])
    );

    // Minimum skeleton duration for instant nav (prevents flash)
    const [minSkeletonComplete, setMinSkeletonComplete] = React.useState(!isInstantNav);

    React.useEffect(() => {
        const timer = setTimeout(() => setMinSkeletonComplete(true), MINIMUM_SKELETON_DURATION_MS);
        return () => clearTimeout(timer);
    }, [isInstantNav]);

    // Show skeleton if: loading OR (instant nav AND minimum duration not complete)
    const shouldShowSkeleton = isLoading || (isInstantNav && !minSkeletonComplete);

    const listRef = useRef<FlashListRef<ProductDetailListItem>>(null);

    // ============================================
    // MEMOIZED VALUES
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
    const prefetchShopChat = usePrefetchShopChat();

    /**
     * Memoize current image for bottom sheet
     */
    const currentImage = useMemo(() => {
        return selectedVariantMedia?.[0]?.url ?? productGallery?.[0]?.url;
    }, [selectedVariantMedia, productGallery]);

    /**
     * Bottom Sheet Handlers
     */
    const handleOpenVariantSheet = useCallback((mode: VariantSheetMode = 'select') => {
        setVariantSheetMode(mode);
        setVariantSheetVisible(true);
    }, []);

    const handleCloseVariantSheet = useCallback(() => {
        setVariantSheetVisible(false);
        setVariantSheetMode('select');
    }, []);

    const handleOpenPriceBreakdown = useCallback(() => {
        setPriceBreakdownVisible(true);
    }, []);

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

        if (variantSheetMode === 'add-to-cart') {
            setVariantSheetVisible(false);
            addToCart(
                { variantId: selectedVariantId, quantity },
                { onSuccess: () => setQuantity(1) }
            );
        } else if (variantSheetMode === 'buy-now') {
            setVariantSheetVisible(false);
            setQuantity(1);
            Navigator.push(checkoutRoutes.buyNow(selectedVariantId, quantity));
        } else {
            setVariantSheetVisible(false);
            if (selectedVariantMedia?.[0] && productGallery && selectedVariantId) {
                const index = findGalleryIndexByVariant(productGallery, selectedVariantId);
                galleryRef.current?.scrollToIndex(index);
            }
        }
    }, [variantSheetMode, canAddToCart, selectedVariantId, quantity, addToCart, selectedVariantMedia, productGallery, isAuthenticated, t]);

    /**
     * Chat Handlers
     */
    const handlePrefetchChat = useCallback(() => {
        if (!isAuthenticated || shopId === myShopId) return;
        if (shopUserId && shopName) {
            prefetchShopChat(shopUserId, shopName, shopLogoUrl, shopId);
        }
    }, [shopUserId, shopName, shopLogoUrl, prefetchShopChat, shopId, myShopId, isAuthenticated]);

    const handleChatPress = useCallback(() => {
        if (!isAuthenticated) {
            Navigator.push(ROUTES.AUTH.LOGIN);
            return;
        }
        if (!shopUserId || !shopName || !product) return;
        if (shopId === myShopId) {
            Toast.show({
                type: 'info',
                text1: t('chat:error.chatWithSelf'),
                text2: t('product:error.authRequiredGeneric'),
            });
            return;
        }
        const cachedId = getCachedConversationId(shopUserId);
        Navigator.push(chatRoutes.detail(cachedId || `ghost_${shopUserId}`, {
            partnerName: shopName,
            partnerAvatar: shopLogoUrl,
            shopUserId: shopUserId,
            shopId: shopId,
            contextType: 'PRODUCT',
            productId: product.id,
            productName: product.name,
            productPrice: String(selectionResult.displayPrice.currentPrice),
            productImage: currentImage,
        }));
    }, [shopUserId, shopName, shopLogoUrl, isAuthenticated, myShopId, shopId, t, product, selectionResult.displayPrice.currentPrice, currentImage]);

    const handleShopPress = useCallback(() => {
        if (shopId) Navigator.push(shopRoutes.detail(shopId));
    }, [shopId]);

    /**
     * Handle pull-to-refresh: Reset variant selection to default state
     */
    const handleRefresh = useCallback(() => {
        refetch();
        resetSelection();
        setPriceBreakdownVisible(false);
    }, [refetch, resetSelection]);

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
        handleOpenVariantSheet('add-to-cart');
    }, [isAuthenticated, handleOpenVariantSheet, t]);

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
        handleOpenVariantSheet('buy-now');
    }, [isAuthenticated, handleOpenVariantSheet, t]);

    const handleCartPress = useCallback(() => Navigator.push(ROUTES.CART.INDEX), []);
    const handleSharePress = useCallback(async () => {
        if (!product) return;

        const productUrl = `https://calatha.com/product/${product.id}`;
        const message = t('product:share.msgTemplate', {
            name: product.name,
            url: Platform.OS === 'android' ? productUrl : '', // Android needs it in message, iOS likes it in url field
        });

        try {
            await Share.share(
                {
                    message: message,
                    url: productUrl, // iOS will use this for Rich Preview
                    title: product.name,
                },
                {
                    // iOS only
                    subject: product.name,
                    dialogTitle: product.name, // Android only
                }
            );
        } catch (error) {
            log.error('Share error:', error);
        }
    }, [product, t]);

    const handleReportProduct = useCallback((reasonKey: string) => {
        // Mock logic gửi API báo cáo
        log.info('Reported product:', productId, 'Reason:', reasonKey);
        Alert.success(t('product:report.success'));
    }, [productId, t]);

    const handleMorePress = useCallback(() => {
        const reportTitle = t('product:report.title');
        const cancelText = t('common:actions.cancel');

        const reasons = [
            { text: t('product:report.reasons.fake'), key: 'fake' },
            { text: t('product:report.reasons.prohibited'), key: 'prohibited' },
            { text: t('product:report.reasons.offensive'), key: 'offensive' },
            { text: t('product:report.reasons.scam'), key: 'scam' },
            { text: t('product:report.reasons.misleading'), key: 'misleading' },
            { text: t('product:report.reasons.other'), key: 'other' },
        ];

        const showReportReasons = () => {
            Alert.show({
                title: reportTitle,
                type: 'warning',
                buttons: [
                    ...reasons.map(r => ({
                        text: r.text,
                        onPress: () => handleReportProduct(r.key),
                        style: 'default' as const
                    })),
                    { text: cancelText, style: 'cancel' as const }
                ]
            });
        };

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [cancelText, reportTitle],
                    cancelButtonIndex: 0,
                    destructiveButtonIndex: 1,
                    title: product?.name,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) showReportReasons();
                }
            );
        } else {
            Alert.show({
                title: product?.name || reportTitle,
                type: 'info',
                buttons: [
                    { text: reportTitle, onPress: showReportReasons, style: 'destructive' },
                    { text: cancelText, style: 'cancel' }
                ]
            });
        }
    }, [handleReportProduct, product, t]);
    const handleImagePress = useCallback((index: number) => log.info('View image:', index), []);
    const handleViewAllReviews = useCallback(() => {
        if (productId) Navigator.push(productRoutes.reviews(productId));
    }, [productId]);

    /**
     * UI Builders
     */
    const listData = useMemo((): ProductDetailListItem[] => {
        if (!product) return [];
        const items: ProductDetailListItem[] = [
            { type: 'gallery', id: 'gallery' },
            { type: 'info', id: 'info' },
        ];
        if (product.hasVariants) items.push({ type: 'variants', id: 'variants' });
        items.push({ type: 'reviews', id: 'reviews' }, { type: 'shop', id: 'shop' });
        if (product.specifications?.length > 0) items.push({ type: 'specs', id: 'specs' });
        if (product.description) items.push({ type: 'description', id: 'description' });
        if (relatedProducts.length > 0) {
            items.push({ type: 'related_header', id: 'related_header' });
            items.push(...relatedProducts.map(p => ({ type: 'related_product' as const, id: `related_${p.id}`, data: p })));
        }
        return items;
    }, [product, relatedProducts]);

    const renderItem = useCallback(({ item }: ListRenderItemInfo<ProductDetailListItem>) => {
        if (!product) return null;
        switch (item.type) {
            case 'gallery':
                return (
                    <View style={styles.fullWidthSection}>
                        <ProductGallery ref={galleryRef} gallery={product.gallery} onImagePress={handleImagePress} />
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
                            onShowPriceBreakdown={handleOpenPriceBreakdown}
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
                        <ShopInfoCard shop={product.shop} onViewShopPress={handleShopPress} />
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
                        image={toSizedImageUrl(item.data.thumbnail, null, 'medium') ?? item.data.thumbnail}
                        originalPrice={item.data.originalPrice}
                        rating={item.data.rating}
                        reviews={item.data.reviews}
                        sold={item.data.sold}
                        location={item.data.location}
                        discount={item.data.discountPercentage}
                        isMall={item.data.isMall}
                        onPress={() => Navigator.push(productRoutes.detail(item.data.id))}
                        route={productRoutes.detail(item.data.id)}
                    />
                );
            default:
                return null;
        }
    }, [product, selectionResult, selectedOptions, handleImagePress, handleOpenVariantSheet, handleOpenPriceBreakdown, handleViewAllReviews, handleShopPress, t]);

    const overrideItemLayout = useCallback((layout: { span?: number }, item: ProductDetailListItem) => {
        if (item.type !== 'related_product') layout.span = 2;
    }, []);

    const renderListFooter = useCallback(() => {
        if (isLoadingRelated) {
            return (
                <View style={styles.listFooter}>
                    <ActivityIndicator color={theme.colors.buttonActive} />
                </View>
            );
        }
        return <View style={styles.footerSpacer} />;
    }, [isLoadingRelated, theme]);

    // ============================================
    // EARLY RETURNS
    // ============================================

    const skeletonOpacity = useSharedValue(0.4);
    React.useEffect(() => {
        skeletonOpacity.value = withRepeat(
            withTiming(1, { duration: 1000 }),
            -1,
            true
        );
    }, [skeletonOpacity]);

    const skeletonAnimatedStyle = useAnimatedStyle(() => ({
        opacity: skeletonOpacity.value,
    }));

    // Combine all loading/transition states into one logic
    const isScreenReady = !shouldShowSkeleton && isTransitionFinished;

    // === Cross-fade Handling ===
    const contentOpacity = useSharedValue(0);
    const [isActuallyReady, setIsActuallyReady] = useState(false);

    // Sync content opacity with readiness
    React.useEffect(() => {
        if (isScreenReady) {
            // Give 100ms for FlashList to finalize layout before fading in
            const timer = setTimeout(() => {
                contentOpacity.value = withTiming(1, { duration: 300 });
                setIsActuallyReady(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            contentOpacity.value = 0;
            setIsActuallyReady(false);
        }
    }, [isScreenReady, contentOpacity]);

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
    }));

    // Error State
    if (isError || (!product && isScreenReady)) {
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
    // RENDER
    // ============================================

    return (
        <View style={styles.container}>
            {/* Real NavBar - Shell First */}
            <ProductNavBar
                scrollY={scrollY}
                title={product?.name ?? ''}
                onCartPress={handleCartPress}
                onSharePress={handleSharePress}
                onMorePress={handleMorePress}
            />

            <View style={styles.flex1}>
                {/* Real Content - Fades in behind the skeleton overlay */}
                {product && (
                    <Animated.View style={[styles.flex1, contentAnimatedStyle]}>
                        <FlashList<ProductDetailListItem>
                            ref={listRef}
                            data={listData}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            getItemType={(item) => item.type}
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
                    </Animated.View>
                )}

                {/* Skeleton Overlay - Stays until content is fully opaque */}
                {!isActuallyReady && (
                    <View style={StyleSheet.absoluteFill}>
                        <ProductDetailSkeleton
                            animatedStyle={skeletonAnimatedStyle}
                            hideSafeTop
                            hideBottomBar
                        />
                    </View>
                )}
            </View>

            {/* Real Bottom Bar - Shell First */}
            <StickyBottomBar
                isFullySelected={selectionResult.isFullySelected}
                inventoryStatus={selectionResult.inventoryStatus}
                onChatPress={handleChatPress}
                onPrefetchChat={handlePrefetchChat}
                onAddToCartPress={handleAddToCart}
                onBuyNowPress={handleBuyNow}
            />

            {product && product.hasVariants && (
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

            {product && (
                <PriceBreakdownBottomSheet
                    visible={priceBreakdownVisible}
                    onClose={() => setPriceBreakdownVisible(false)}
                    breakdown={selectionResult.displayPrice.breakdown}
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
    flex1: {
        flex: 1,
    },
    footerSpacer: {
        height: theme.margins.lg,
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
    fullWidthSection: {
        width: '100%',
    },
    listContent: {
        paddingBottom: 100, // Account for bottom bar
    },
    listFooter: {
        paddingVertical: theme.margins.lg,
        alignItems: 'center',
    },
    relatedHeader: {
        paddingTop: theme.margins.xl,
        paddingBottom: theme.margins.md,
        paddingHorizontal: theme.margins.md,
    },
    relatedTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },
}));
