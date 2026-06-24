import { SectionCrashBoundary } from '@/components/common/SectionCrashBoundary';
import { ProductCard } from '@/components/ui/product/ProductCard';
import { ROUTES, chatRoutes, checkoutRoutes, productRoutes, shopRoutes } from '@/constants/routes';
import { useAddToCart } from '@/hooks/api/cart';
import { getCachedConversationId, usePrefetchShopChat } from '@/hooks/api/chat/useCreateConversation';
import { usePublicShopLoyaltyPolicy } from '@/hooks/api/loyalty/usePublicLoyaltyPolicy';
import { PRODUCT_DETAIL_QUERY_KEYS, useRelatedProducts } from '@/hooks/api/product/useProductDetail';
import { useShopDetail } from '@/hooks/api/useShop';
import { useProductVariant } from '@/hooks/useProductVariant';
import { useAuthStore } from '@/store/useAuthStore';
import { useSelectedAddress } from '@/store/useUserAddressStore';
import type { ProductFeedItem } from '@/types/product/product';
import type { ProductDetailUI } from '@/types/product/productDetail';
import { findGalleryIndexByVariant } from '@/utils/adapter/product/productDetailAdapter';
import { Alert } from '@/utils/AlertHelper';
import { createLogger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import { evaluateProductShippingCompatibility } from '@/utils/productShipping';
import { toSizedImageUrl } from '@/utils/url';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActionSheetIOS,
    ActivityIndicator,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    RefreshControl,
    Share,
    Text,
    View
} from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { PriceBreakdownBottomSheet } from './PriceBreakdownBottomSheet';
import { ProductDescription } from './ProductDescription';
import type { ProductGalleryRef } from './ProductGallery';
import { ProductGallery } from './ProductGallery';
import { ProductInfoSection } from './ProductInfoSection';
import { ProductNavBar } from './ProductNavBar';
import { ProductOrderProtectionCard } from './ProductOrderProtectionCard';
import { ProductPackagingInfo } from './ProductPackagingInfo';
import { ProductReviews } from './ProductReviews';
import { ProductSpecs } from './ProductSpecs';
import { ShippingDeliveryCard } from './ShippingDeliveryCard';
import { ShopInfoCard } from './ShopInfoCard';
import { StickyBottomBar } from './StickyBottomBar';
import type { VariantSheetMode } from './VariantSelector';
import { VariantBottomSheet, VariantSelectorRow } from './VariantSelector';

const log = createLogger('ProductDetailContent');
const FLASH_SALE_EXPIRED_PROBE_DELAYS_MS = [0, 1500, 3000] as const;
const FLASH_SALE_RESET_THRESHOLD_SECONDS = 30;
const FLASH_SALE_CAMPAIGN_TYPE = 'FLASH_SALE';
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ProductDetailListItem =
    | { type: 'gallery'; id: string }
    | { type: 'info'; id: string }
    | { type: 'shipping'; id: string }
    | { type: 'variants'; id: string }
    | { type: 'reviews'; id: string }
    | { type: 'order_protection'; id: string }
    | { type: 'shop'; id: string }
    | { type: 'specs'; id: string }
    | { type: 'packaging'; id: string }
    | { type: 'description'; id: string }
    | { type: 'related_header'; id: string }
    | { type: 'related_product'; id: string; data: ProductFeedItem };

interface ProductDetailContentProps {
    /** The already-fetched product data */
    product: ProductDetailUI;
    /** Shared scrollY value for NavBar animation */
    scrollY: SharedValue<number>;
    /** Refetch callback for pull-to-refresh */
    refetch: () => Promise<unknown>;
    /** Whether the query is currently refetching */
    isRefetching: boolean;
    /** Action from deep link (auto-open variant sheet) */
    action?: 'buy-now' | 'add-to-cart';
    /** Cached hero preview from listing surfaces, used only for the first reveal */
    heroPreviewUrl?: string | null;
    /** Whether transition animation is finished (controls lazy-load of related products) */
    isTransitionFinished: boolean;
}

export const ProductDetailContent: React.FC<ProductDetailContentProps> = React.memo(({
    product,
    scrollY,
    refetch,
    isRefetching,
    action,
    heroPreviewUrl = null,
    isTransitionFinished,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['product', 'chat', 'common']);
    const queryClient = useQueryClient();

    // === UI State ===
    const [variantSheetVisible, setVariantSheetVisible] = useState(false);
    const [variantSheetMode, setVariantSheetMode] = useState<VariantSheetMode>('select');
    const [quantity, setQuantity] = useState(1);
    const [priceBreakdownVisible, setPriceBreakdownVisible] = useState(false);
    const [areSecondaryQueriesEnabled, setAreSecondaryQueriesEnabled] = useState(false);

    const myShopId = useAuthStore((s) => s.shopId);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const selectedAddress = useSelectedAddress();
    const shippingCompatibility = useMemo(
        () => evaluateProductShippingCompatibility(product.shippingScope, selectedAddress),
        [product.shippingScope, selectedAddress]
    );
    const isBuyNowBlockedByShipping = isAuthenticated && shippingCompatibility.isDeterministicallyBlocked;


    useFocusEffect(
        React.useCallback(() => {
            setAreSecondaryQueriesEnabled(true);
            return () => setAreSecondaryQueriesEnabled(false);
        }, [])
    );

    // === Related Products (lazy-loaded: waits for transition to finish) ===
    const { data: relatedData, isLoading: isLoadingRelated } = useRelatedProducts(
        product.id,
        { enabled: isTransitionFinished && areSecondaryQueriesEnabled }
    );
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

    // === Scroll Handler ===
    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollY.value = event.nativeEvent.contentOffset.y;
    }, [scrollY]);

    // === Gallery Ref for scrolling to variant image ===
    const galleryRef = useRef<ProductGalleryRef>(null);
    const listRef = useRef<FlashListRef<ProductDetailListItem>>(null);
    const flashSaleRefreshInProgressRef = useRef(false);

    // Auto-open action sheet if action is present in params
    const hasHandledActionRef = React.useRef(false);

    React.useEffect(() => {
        if (product && action && !hasHandledActionRef.current && isTransitionFinished) {
            hasHandledActionRef.current = true;
            if (!isAuthenticated) {
                Toast.show({
                    type: 'info',
                    text1: t('product:error.authRequiredTitle'),
                    text2: action === 'add-to-cart'
                        ? t('product:error.authRequiredCart')
                        : t('product:error.authRequiredBuyNow'),
                });
                Navigator.push(ROUTES.AUTH.LOGIN);
                return;
            }
            if (action === 'buy-now' && isBuyNowBlockedByShipping) {
                return;
            }
            // Delay slightly to ensure smooth render
            setTimeout(() => {
                setVariantSheetMode(action);
                setVariantSheetVisible(true);
            }, 100);
        }
    }, [product, action, isTransitionFinished, isAuthenticated, isBuyNowBlockedByShipping, t]);

    // === Derived values ===
    const optionsWithAvailability = useMemo(() => {
        return getOptionsWithAvailability();
    }, [getOptionsWithAvailability]);

    const canAddToCart = selectionResult.canAddToCart;
    const selectedVariantId = selectionResult.selectedVariant?.id;
    const selectedVariantMedia = selectionResult.selectedVariant?.media;
    const shouldShowFlashSaleScopeHelper = useMemo(() => {
        if (!product.flashSale?.isActive || product.flashSale.campaignType !== FLASH_SALE_CAMPAIGN_TYPE) {
            return false;
        }

        if (!product.hasVariants) {
            return false;
        }

        return selectionResult.selectedVariant?.campaignType !== FLASH_SALE_CAMPAIGN_TYPE;
    }, [
        product.flashSale?.campaignType,
        product.flashSale?.isActive,
        product.hasVariants,
        selectionResult.selectedVariant?.campaignType,
    ]);
    const productId = product.id;
    const shopId = product.shop?.id;
    const shopUserId = product.shop?.userId;
    const shopName = product.shop?.shopName;
    const shopLogoUrl = product.shop?.logoUrl;
    const productGallery = product.gallery;

    const { data: publicShop } = useShopDetail(shopId, {
        enabled: isTransitionFinished && areSecondaryQueriesEnabled,
    });

    const { data: loyaltyPolicy } = usePublicShopLoyaltyPolicy(shopId, {
        enabled: areSecondaryQueriesEnabled,
        shopName,
        shopLogo: shopLogoUrl,
    });

    // === Create Conversation Mutation ===
    const prefetchShopChat = usePrefetchShopChat();

    const currentImage = useMemo(() => {
        return selectedVariantMedia?.[0]?.url ?? productGallery?.[0]?.url;
    }, [selectedVariantMedia, productGallery]);

    // ============================================
    // HANDLERS
    // ============================================

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
            Navigator.push(checkoutRoutes.buyNow(selectedVariantId, quantity, shopId));
        } else {
            setVariantSheetVisible(false);
            if (selectedVariantMedia?.[0] && productGallery && selectedVariantId) {
                const index = findGalleryIndexByVariant(productGallery, selectedVariantId);
                galleryRef.current?.scrollToIndex(index);
            }
        }
    }, [variantSheetMode, canAddToCart, selectedVariantId, quantity, addToCart, selectedVariantMedia, productGallery, isAuthenticated, shopId, t]);

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

    const handleRefresh = useCallback(() => {
        refetch();
        resetSelection();
        setPriceBreakdownVisible(false);
    }, [refetch, resetSelection]);

    const handleFlashSaleExpired = useCallback(async () => {
        if (!product.flashSale?.isActive || flashSaleRefreshInProgressRef.current) {
            return;
        }

        flashSaleRefreshInProgressRef.current = true;
        const initialFlashSaleSignature = `${product.flashSale.campaignType ?? 'flash'}:${product.flashSale.endTime ?? 'no-end'}`;

        try {
            for (const delayMs of FLASH_SALE_EXPIRED_PROBE_DELAYS_MS) {
                if (delayMs > 0) {
                    await wait(delayMs);
                }

                await refetch();

                const latestProduct = queryClient.getQueryData<ProductDetailUI>(
                    PRODUCT_DETAIL_QUERY_KEYS.detail(product.id)
                );

                if (!latestProduct?.flashSale?.isActive) {
                    return;
                }

                const latestSecondsRemaining = latestProduct.flashSale.secondsRemaining ?? 0;
                if (latestSecondsRemaining > FLASH_SALE_RESET_THRESHOLD_SECONDS) {
                    return;
                }

                const latestFlashSaleSignature = `${latestProduct.flashSale.campaignType ?? 'flash'}:${latestProduct.flashSale.endTime ?? 'no-end'}`;
                if (latestFlashSaleSignature !== initialFlashSaleSignature) {
                    return;
                }
            }
        } finally {
            flashSaleRefreshInProgressRef.current = false;
        }
    }, [product.flashSale, product.id, queryClient, refetch]);

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
        if (isBuyNowBlockedByShipping) {
            return;
        }
        handleOpenVariantSheet('buy-now');
    }, [isAuthenticated, isBuyNowBlockedByShipping, handleOpenVariantSheet, t]);

    const handleCartPress = useCallback(() => Navigator.push(ROUTES.CART.INDEX), []);

    const handleSharePress = useCallback(async () => {
        if (!product) return;

        const productUrl = `https://canox.com/product/${product.id}`;
        const message = t('product:share.msgTemplate', {
            name: product.name,
            url: Platform.OS === 'android' ? productUrl : '',
        });

        try {
            await Share.share(
                {
                    message: message,
                    url: productUrl,
                    title: product.name,
                },
                {
                    subject: product.name,
                    dialogTitle: product.name,
                }
            );
        } catch (error) {
            log.error('Share error:', error);
        }
    }, [product, t]);

    const handleReportProduct = useCallback((reasonKey: string) => {
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

    // ============================================
    // LIST DATA & RENDER
    // ============================================

    const listData = useMemo((): ProductDetailListItem[] => {
        const items: ProductDetailListItem[] = [
            { type: 'gallery', id: 'gallery' },
            { type: 'info', id: 'info' },
        ];
        if (isAuthenticated) items.push({ type: 'shipping', id: 'shipping' });
        if (product.hasVariants) items.push({ type: 'variants', id: 'variants' });
        items.push(
            { type: 'reviews', id: 'reviews' },
            { type: 'order_protection', id: 'order_protection' },
            { type: 'shop', id: 'shop' }
        );
        const hasSpecs = 
            (product.specifications && product.specifications.length > 0) ||
            !!product.brandName ||
            !!product.origin ||
            (!!product.manufacturers && product.manufacturers.length > 0) ||
            (product.isMadeToOrder !== undefined && product.isMadeToOrder !== null) ||
            (!!product.warranty && (!!product.warranty.type || !!product.warranty.durationDays || (!!product.warranty.conditions && product.warranty.conditions.length > 0)));

        if (hasSpecs) items.push({ type: 'specs', id: 'specs' });
        if (selectionResult.selectedVariant?.dimensions) items.push({ type: 'packaging', id: 'packaging' });
        if (product.description) items.push({ type: 'description', id: 'description' });
        if (relatedProducts.length > 0) {
            items.push({ type: 'related_header', id: 'related_header' });
            items.push(...relatedProducts.map(p => ({ type: 'related_product' as const, id: `related_${p.id}`, data: p })));
        }
        return items;
    }, [isAuthenticated, product, relatedProducts, selectionResult.selectedVariant?.dimensions]);

    // Stable render context ref — updated every render, read by renderItem
    const renderContextRef = useRef({
        product,
        selectionResult,
        selectedOptions,
        heroPreviewUrl,
        areSecondaryQueriesEnabled,
        loyaltyPolicy,
        publicShop,
        shippingCompatibility,
        selectedAddress,
        shouldShowFlashSaleScopeHelper,
        handleFlashSaleExpired,
        handleImagePress,
        handleOpenVariantSheet,
        handleOpenPriceBreakdown,
        handleViewAllReviews,
        handleShopPress,
        t,
    });
    renderContextRef.current = {
        product,
        selectionResult,
        selectedOptions,
        heroPreviewUrl,
        areSecondaryQueriesEnabled,
        loyaltyPolicy,
        publicShop,
        shippingCompatibility,
        selectedAddress,
        shouldShowFlashSaleScopeHelper,
        handleFlashSaleExpired,
        handleImagePress,
        handleOpenVariantSheet,
        handleOpenPriceBreakdown,
        handleViewAllReviews,
        handleShopPress,
        t,
    };

    const renderItem = useCallback(({ item }: ListRenderItemInfo<ProductDetailListItem>) => {
        const ctx = renderContextRef.current;
        const withSectionBoundary = (children: React.ReactNode) => (
            <SectionCrashBoundary
                resetKeys={[ctx.product.id, item.id]}
                onError={(error, info) => {
                    log.error('Product detail section render failed', {
                        section: item.id,
                        error,
                        componentStack: info.componentStack,
                    });
                }}
            >
                {children}
            </SectionCrashBoundary>
        );

        switch (item.type) {
            case 'gallery':
                return withSectionBoundary(
                    <View style={styles.fullWidthSection}>
                        <ProductGallery
                            ref={galleryRef}
                            gallery={ctx.product.gallery}
                            heroPreviewUrl={ctx.heroPreviewUrl}
                            onImagePress={ctx.handleImagePress}
                        />
                    </View>
                );
            case 'info':
                return withSectionBoundary(
                    <View style={styles.fullWidthSection}>
                        <ProductInfoSection
                            name={ctx.product.name}
                            priceDisplay={ctx.selectionResult.displayPrice}
                            rating={ctx.product.rating}
                            totalReviews={ctx.product.totalReviews}
                            totalSold={ctx.product.totalSold}
                            flashSale={ctx.product.flashSale}
                            loyaltyPolicy={ctx.loyaltyPolicy}
                            vouchers={ctx.product.vouchers}
                            isInternational={ctx.product.isInternational}
                            onFlashSaleExpired={ctx.handleFlashSaleExpired}
                            onShowPriceBreakdown={ctx.handleOpenPriceBreakdown}
                            showFlashSaleScopeHelper={ctx.shouldShowFlashSaleScopeHelper}
                        />
                    </View>
                );
            case 'shipping':
                return withSectionBoundary(
                    <View style={styles.fullWidthSection}>
                        <ShippingDeliveryCard
                            address={ctx.selectedAddress}
                            compatibility={ctx.shippingCompatibility}
                        />
                    </View>
                );
            case 'variants':
                return withSectionBoundary(
                    <View style={styles.fullWidthSection}>
                        <VariantSelectorRow
                            options={ctx.product.options}
                            selectedOptions={ctx.selectedOptions}
                            selectionSummary={ctx.selectionResult.selectionSummary}
                            onPress={() => ctx.handleOpenVariantSheet('select')}
                        />
                    </View>
                );
            case 'reviews':
                return withSectionBoundary(
                    <View style={styles.fullWidthSection}>
                        <ProductReviews
                            productId={ctx.product.id}
                            reviewStatistics={ctx.product.reviewStatistics}
                            rating={ctx.product.rating}
                            totalReviews={ctx.product.totalReviews}
                            enablePreviewFetch={ctx.areSecondaryQueriesEnabled}
                            onViewAllPress={ctx.handleViewAllReviews}
                        />
                    </View>
                );
            case 'order_protection':
                return withSectionBoundary(
                    <View style={styles.fullWidthSection}>
                        <ProductOrderProtectionCard />
                    </View>
                );
            case 'shop':
                return withSectionBoundary(
                    <View style={styles.fullWidthSection}>
                        <ShopInfoCard
                            shop={ctx.product.shop}
                            publicShop={ctx.publicShop}
                            onViewShopPress={ctx.handleShopPress}
                        />
                    </View>
                );
            case 'specs':
                return withSectionBoundary(
                    <View style={styles.fullWidthSection}>
                        <ProductSpecs
                            specifications={ctx.product.specifications}
                            brandName={ctx.product.brandName}
                            origin={ctx.product.origin}
                            manufacturers={ctx.product.manufacturers}
                            isMadeToOrder={ctx.product.isMadeToOrder}
                            warranty={ctx.product.warranty}
                        />
                    </View>
                );
            case 'packaging':
                return ctx.selectionResult.selectedVariant?.dimensions ? (
                    withSectionBoundary(
                        <View style={styles.fullWidthSection}>
                            <ProductPackagingInfo dimensions={ctx.selectionResult.selectedVariant.dimensions} />
                        </View>
                    )
                ) : null;
            case 'description':
                return withSectionBoundary(
                    <View style={styles.fullWidthSection}>
                        <ProductDescription description={ctx.product.description} />
                    </View>
                );
            case 'related_header':
                return withSectionBoundary(
                    <View style={[styles.relatedHeader, styles.fullWidthSection]}>
                        <Text style={styles.relatedTitle}>{ctx.t('product:related.title')}</Text>
                    </View>
                );
            case 'related_product':
                return withSectionBoundary(
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
                        isInternational={item.data.isInternational}
                        enableHaptic={false}
                        onPress={() => Navigator.push(productRoutes.detail(item.data.id))}
                        campaignLabel={item.data.campaignLabel}
                    />
                );
            default:
                return null;
        }
    }, []);

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

    const listExtraData = useMemo(() => ({
        selectedAddressId: selectedAddress?.id,
        shippingCompatibility,
        selectionSummary: selectionResult.selectionSummary,
        displayPrice: selectionResult.displayPrice,
        loyaltyPolicy,
        publicShop,
        areSecondaryQueriesEnabled,
    }), [
        selectedAddress?.id,
        shippingCompatibility,
        selectionResult.selectionSummary,
        selectionResult.displayPrice,
        loyaltyPolicy,
        publicShop,
        areSecondaryQueriesEnabled,
    ]);

    return (
        <>
            {/* NavBar with real product data */}
            <ProductNavBar
                scrollY={scrollY}
                title={product.name}
                onCartPress={handleCartPress}
                onSharePress={handleSharePress}
                onMorePress={handleMorePress}
            />

            <View style={styles.flex1}>
                <View style={styles.flex1}>
                    <SectionCrashBoundary
                        resetKeys={[product.id, 'product-detail-list']}
                        onError={(error, info) => {
                            log.error('Product detail list render failed', {
                                section: 'product-detail-list',
                                error,
                                componentStack: info.componentStack,
                            });
                        }}
                    >
                        <FlashList<ProductDetailListItem>
                            ref={listRef}
                            data={listData}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            getItemType={(item) => item.type}
                            extraData={listExtraData}
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
                    </SectionCrashBoundary>
                </View>
            </View>

            {/* Bottom Bar */}
            <SectionCrashBoundary
                resetKeys={[product.id, 'sticky-bottom-bar', selectedVariantId, selectionResult.inventoryStatus]}
                onError={(error, info) => {
                    log.error('Product detail bottom bar render failed', {
                        section: 'sticky-bottom-bar',
                        error,
                        componentStack: info.componentStack,
                    });
                }}
            >
                <StickyBottomBar
                    isFullySelected={selectionResult.isFullySelected}
                    inventoryStatus={selectionResult.inventoryStatus}
                    onChatPress={handleChatPress}
                    onPrefetchChat={handlePrefetchChat}
                    onAddToCartPress={handleAddToCart}
                    onBuyNowPress={handleBuyNow}
                    isBuyNowBlocked={isBuyNowBlockedByShipping}
                />
            </SectionCrashBoundary>

            {/* Variant Bottom Sheet */}
            <SectionCrashBoundary
                resetKeys={[product.id, 'variant-bottom-sheet', variantSheetVisible, selectedVariantId]}
                onError={(error, info) => {
                    log.error('Product detail variant sheet render failed', {
                        section: 'variant-bottom-sheet',
                        error,
                        componentStack: info.componentStack,
                    });
                }}
            >
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
                    selectedPromotionType={selectionResult.selectedVariant?.campaignType}
                    selectedPromotionPercentage={selectionResult.selectedVariant?.promotionPercentage}
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    mode={variantSheetMode}
                    onConfirm={handleConfirmVariant}
                    isConfirmDisabled={!selectionResult.canAddToCart}
                />
            </SectionCrashBoundary>

            {/* Price Breakdown Bottom Sheet */}
            <SectionCrashBoundary
                resetKeys={[product.id, 'price-breakdown-sheet', priceBreakdownVisible, selectedVariantId]}
                onError={(error, info) => {
                    log.error('Product detail price breakdown sheet render failed', {
                        section: 'price-breakdown-sheet',
                        error,
                        componentStack: info.componentStack,
                    });
                }}
            >
                <PriceBreakdownBottomSheet
                    visible={priceBreakdownVisible}
                    onClose={() => setPriceBreakdownVisible(false)}
                    breakdown={selectionResult.displayPrice.breakdown}
                />
            </SectionCrashBoundary>
        </>
    );
});

ProductDetailContent.displayName = 'ProductDetailContent';

const styles = StyleSheet.create((theme) => ({
    flex1: {
        flex: 1,
    },
    footerSpacer: {
        height: theme.margins.lg,
    },
    listContent: {},
    listFooter: {
        paddingVertical: theme.margins.lg,
        alignItems: 'center',
    },
    fullWidthSection: {
        width: '100%',
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
