/**
 * Checkout Screen
 * 
 * Main checkout flow screen.
 * Path: /checkout
 * 
 * Flow:
 * 1. Receives selected items from Cart via initSession()
 * 2. User selects address, shipping method, vouchers, payment
 * 3. User places order -> navigates to Order Success
 * 
 * Key UX decisions:
 * - No "Chat với Shop" button (UX anti-pattern)
 * - "Ghi chú cho Shop" input instead
 * - Voucher stacking with auto-removal when invalid
 * - Sticky footer with "Đặt hàng" button
 */

import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Components
import {
    AddressCard,
    BillSummary,
    CheckoutFooter,
    CheckoutHeader,
    CheckoutShopGroup,
    CheckoutSkeleton,
    PaymentMethodSection,
    PlatformVoucherSelector,
} from '@/components/checkout';

// Store & Hooks
import { useCheckoutCalculation } from '@/hooks/api/useCheckoutCalculation';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import type { CartShopUI, VoucherUI } from '@/types/cart';
import type { DeliveryAddress, PaymentMethodType } from '@/types/checkout';

// ============================================
// MOCK DATA
// ============================================

/**
 * Mock user address - In production: fetch from user profile
 */
const MOCK_ADDRESS: DeliveryAddress = {
    id: 'addr-001',
    recipientName: 'Nguyễn Văn An',
    phoneNumber: '0901234567',
    addressLine: '123 Nguyễn Huệ',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: true,
};

/**
 * Mock platform vouchers - In production: fetch from API
 */
const MOCK_PLATFORM_VOUCHERS: VoucherUI[] = [
    {
        id: 'plat-v001',
        code: 'FREESHIP50K',
        title: 'Freeship đơn từ 100k',
        description: 'Giảm tối đa 50k phí vận chuyển',
        discountDisplay: 'Freeship',
        minOrderDisplay: '100k',
        isApplicable: true,
        expiresAt: '2025-02-28',
    },
    {
        id: 'plat-v002',
        code: 'SALE10',
        title: 'Giảm 10% đơn từ 200k',
        description: 'Giảm tối đa 100k',
        discountDisplay: '10%',
        minOrderDisplay: '200k',
        isApplicable: true,
        expiresAt: '2025-02-28',
    },
];

/**
 * Mock cart data for testing - In production: use actual cart store
 */
const MOCK_CART_SHOPS: CartShopUI[] = [
    {
        shopId: 'shop-001',
        shopName: 'Tech World Store',
        shopAvatarUrl: 'https://picsum.photos/seed/shop1/100',
        isMall: true,
        appliedVoucherId: null,
        items: [
            {
                id: 'item-001',
                variantId: 'var-001',
                productName: 'iPhone 15 Pro Max 256GB - Titan Đen',
                variantAttributes: '256GB, Titan Đen',
                imageUrl: 'https://picsum.photos/seed/iphone15/400',
                unitPrice: 28990000,
                originalPrice: 32990000,
                discountPercent: 12,
                quantity: 1,
                maxQuantity: 10,
                isOutOfStock: false,
                shopId: 'shop-001',
            },
            {
                id: 'item-002',
                variantId: 'var-002',
                productName: 'Ốp lưng iPhone 15 Pro Max MagSafe Leather',
                variantAttributes: 'Đen',
                imageUrl: 'https://picsum.photos/seed/case/400',
                unitPrice: 1490000,
                originalPrice: 1990000,
                discountPercent: 25,
                quantity: 2,
                maxQuantity: 5,
                isOutOfStock: false,
                shopId: 'shop-001',
            },
        ],
        availableVouchers: [
            {
                id: 'shop-v001',
                code: 'TECHSALE',
                title: 'Giảm 5%',
                description: 'Giảm 5% cho đơn từ 500k',
                discountDisplay: '5%',
                minOrderDisplay: '500k',
                isApplicable: true,
                expiresAt: '2025-02-28',
            },
        ],
    },
    {
        shopId: 'shop-002',
        shopName: 'Fashion Việt',
        shopAvatarUrl: 'https://picsum.photos/seed/shop2/100',
        isMall: false,
        appliedVoucherId: null,
        items: [
            {
                id: 'item-003',
                variantId: 'var-003',
                productName: 'Áo thun unisex cotton 100% - Basic Tee',
                variantAttributes: 'Trắng, Size L',
                imageUrl: 'https://picsum.photos/seed/tshirt/400',
                unitPrice: 199000,
                originalPrice: 299000,
                discountPercent: 33,
                quantity: 3,
                maxQuantity: 20,
                isOutOfStock: false,
                shopId: 'shop-002',
            },
        ],
        availableVouchers: [
            {
                id: 'shop-v002',
                code: 'FASHIONNEW',
                title: 'Giảm 15k',
                description: 'Giảm 15k cho đơn từ 150k',
                discountDisplay: '15k',
                minOrderDisplay: '150k',
                isApplicable: true,
                expiresAt: '2025-02-28',
            },
        ],
    },
];

// ============================================
// SCREEN COMPONENT
// ============================================

export default function CheckoutScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const router = useRouter();

    // Store state
    const shops = useCheckoutStore((s) => s.shops);
    const deliveryAddress = useCheckoutStore((s) => s.deliveryAddress);
    const platformVouchers = useCheckoutStore((s) => s.platformVouchers);
    const platformVoucherId = useCheckoutStore((s) => s.platformVoucherId);
    const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
    const isSubmitting = useCheckoutStore((s) => s.isSubmitting);
    const isInitialized = useCheckoutStore((s) => s.isInitialized);

    // Store actions
    const initSession = useCheckoutStore((s) => s.initSession);
    const resetSession = useCheckoutStore((s) => s.resetSession);
    const setDeliveryAddress = useCheckoutStore((s) => s.setDeliveryAddress);
    const applyPlatformVoucher = useCheckoutStore((s) => s.applyPlatformVoucher);
    const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);
    const setSubmitting = useCheckoutStore((s) => s.setSubmitting);

    // Calculation hook
    const {
        calculation,
        isPlatformVoucherValid,
        platformVoucherWarning,
        canPlaceOrder,
        orderBlockReasons,
    } = useCheckoutCalculation();

    // ========================================
    // INITIALIZATION
    // ========================================

    useEffect(() => {
        // Initialize checkout session with mock data
        // In production: Get selected items from useCartStore
        if (!isInitialized) {
            // Create set of all item IDs from mock data
            const selectedItemIds = new Set<string>();
            MOCK_CART_SHOPS.forEach((shop) => {
                shop.items.forEach((item) => {
                    selectedItemIds.add(item.id);
                });
            });

            initSession(
                MOCK_CART_SHOPS,
                selectedItemIds,
                MOCK_ADDRESS,
                MOCK_PLATFORM_VOUCHERS
            );
        }
    }, [isInitialized, initSession]);

    // Cleanup on unmount
    useFocusEffect(
        useCallback(() => {
            return () => {
                // Reset session when leaving checkout (user abandoned)
                // In production: Only reset if order was NOT placed
                // resetSession();
            };
        }, [])
    );

    // ========================================
    // HANDLERS
    // ========================================

    const handleAddressPress = useCallback(() => {
        // In production: Navigate to address selection
        Alert.alert(
            'Chọn địa chỉ',
            'Tính năng chọn địa chỉ sẽ được implement sau.'
        );
    }, []);

    const handlePlatformVoucherSelect = useCallback(
        (voucherId: string | null) => {
            applyPlatformVoucher(voucherId);
        },
        [applyPlatformVoucher]
    );

    const handlePaymentMethodSelect = useCallback(
        (method: PaymentMethodType) => {
            setPaymentMethod(method);
        },
        [setPaymentMethod]
    );

    const handlePlaceOrder = useCallback(async () => {
        if (!canPlaceOrder) return;

        setSubmitting(true);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Success - Navigate to order success
            Alert.alert(
                'Đặt hàng thành công! 🎉',
                `Đơn hàng của bạn đang được xử lý.\nTổng thanh toán: ${new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                }).format(calculation.totalAmount)}`,
                [
                    {
                        text: 'Xem đơn hàng',
                        onPress: () => {
                            resetSession();
                            // router.replace('/order/ORDER-001');
                            router.back();
                        },
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Lỗi', 'Đặt hàng thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    }, [canPlaceOrder, calculation.totalAmount, resetSession, router, setSubmitting]);

    const handleBack = useCallback(() => {
        // Confirm before leaving if session has changes
        Alert.alert(
            'Hủy thanh toán?',
            'Thông tin thanh toán sẽ không được lưu.',
            [
                { text: 'Ở lại', style: 'cancel' },
                {
                    text: 'Hủy',
                    style: 'destructive',
                    onPress: () => {
                        resetSession();
                        router.back();
                    },
                },
            ]
        );
    }, [resetSession, router]);

    // ========================================
    // RENDER
    // ========================================

    // Loading state
    if (!isInitialized) {
        return (
            <View style={styles.container}>
                <CheckoutHeader title="Thanh toán" onBack={handleBack} />
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <CheckoutSkeleton />
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <CheckoutHeader title="Thanh toán" onBack={handleBack} />

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Address Card */}
                <AddressCard
                    address={deliveryAddress}
                    onPress={handleAddressPress}
                />

                {/* Shop Groups */}
                {shops.map((shop) => (
                    <CheckoutShopGroup key={shop.shopId} shop={shop} />
                ))}

                {/* Platform Voucher */}
                <PlatformVoucherSelector
                    availableVouchers={platformVouchers}
                    selectedVoucherId={platformVoucherId}
                    discountAmount={calculation.platformVoucherDiscount}
                    isInvalid={!isPlatformVoucherValid}
                    warningMessage={platformVoucherWarning}
                    onSelect={handlePlatformVoucherSelect}
                />

                {/* Payment Method */}
                <PaymentMethodSection
                    selectedMethod={paymentMethod}
                    onSelect={handlePaymentMethodSelect}
                />

                {/* Bill Summary */}
                <BillSummary calculation={calculation} />

                {/* Bottom spacing for footer */}
                <View style={styles.footerSpacer} />
            </ScrollView>

            {/* Sticky Footer */}
            <CheckoutFooter
                totalAmount={calculation.totalAmount}
                itemCount={calculation.totalItemCount}
                canPlaceOrder={canPlaceOrder}
                blockReasons={orderBlockReasons}
                isSubmitting={isSubmitting}
                onPlaceOrder={handlePlaceOrder}
            />
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: theme.margins.zero,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    footerSpacer: {
        height: theme.margins.md, // Space for sticky footer
    },
}));
